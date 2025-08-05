import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ERROR_CODES } from '../constants';
import { BaseExceptionFilter } from './base-exception.filter';

@Catch()
export class GlobalExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const path = this.getRequestPath(host);

    if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        GlobalExceptionFilter.name,
      );
    } else {
      this.logger.error(
        `Unhandled exception: ${exception}`,
        undefined,
        GlobalExceptionFilter.name,
      );
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ERROR_CODES.INTERNAL_SERVER_ERROR;
    let message: string = 'An unexpected error ocurred';
    let details: any;

    if (!(exception instanceof Error)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      details = exception;
      this.sendErrorResponse(response, status, code, message, details, path);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      details = {
        originalError: {
          name: exception.name,
          message: exception.message,
          stack: exception.stack,
        },
      };
    }

    if (exception.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      code = ERROR_CODES.VALIDATION_FAILED;
      message = 'Validation failed';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      details = {
        ...details,
        validationErrors: exception.message,
      };

      this.sendErrorResponse(response, status, code, message, details, path);
      return;
    }

    if (exception.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      code = ERROR_CODES.VALIDATION_INVALID_FORMAT;
      message = 'Invalid data format';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      details = {
        ...details,
        field: exception.message,
      };

      this.sendErrorResponse(response, status, code, message, details, path);
      return;
    }

    if (
      exception.name === 'MongoError' ||
      exception.name === 'MongoServerError'
    ) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = ERROR_CODES.DATABASE_TRANSACTION_FAILED;
      message = 'Database error';

      this.sendErrorResponse(response, status, code, message, details, path);
      return;
    }

    // if (exception.code === 'ECONNREFUSED') {
    //   status = HttpStatus.SERVICE_UNAVAILABLE;
    //   code = ERROR_CODES.SERVICE_UNAVAILABLE;
    //   message = 'External service unavailable';

    //   this.sendErrorResponse(response, status, code, message, details, path);
    //   return;
    // }

    // if (exception.code === 'ENOTFOUND') {
    //   status = HttpStatus.SERVICE_UNAVAILABLE;
    //   code = ERROR_CODES.SERVICE_UNAVAILABLE;
    //   message = 'Service endpoint not found';
    //   this.sendErrorResponse(response, status, code, message, details, path);
    //   return;
    // }
  }
}
