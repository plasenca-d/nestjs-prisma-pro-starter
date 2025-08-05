import { ERROR_CODES } from '@common/constants';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseExceptionFilter } from './base-exception.filter';

@Catch(HttpException)
export class HttpExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const path = this.getRequestPath(host);

    const exceptionResponse = exception.getResponse();
    let message: string;
    let code: string;
    let details: any;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      code = this.getErrorCodeFromStatus(status);
    } else if (typeof exceptionResponse === 'object') {
      const errorObj: any = exceptionResponse;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      message = String(errorObj.message || exception.message);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      code = String(errorObj.code || this.getErrorCodeFromStatus(status));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      details = {
        ...errorObj,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...(errorObj.message &&
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          Array.isArray(errorObj.message) && {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            validationErrors: errorObj.message,
          }),
      };
    } else {
      message = exception.message;
      code = this.getErrorCodeFromStatus(status);
    }

    this.sendErrorResponse(response, status, code, message, details, path);
  }

  private getErrorCodeFromStatus(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_FAILED;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.AUTH_TOKEN_INVALID;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.RESOURCE_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ERROR_CODES.RESOURCE_ALREADY_EXISTS;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ERROR_CODES.RATE_LIMIT_EXCEEDED;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return ERROR_CODES.INTERNAL_SERVER_ERROR;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ERROR_CODES.SERVICE_UNAVAILABLE;
      default:
        return ERROR_CODES.INTERNAL_SERVER_ERROR;
    }
  }
}
