import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '../../../generated/prisma/runtime/library';
import { ERROR_CODES } from '../constants';
import { BaseExceptionFilter } from './base-exception.filter';

@Catch(
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
)
export class PrismaExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const path = this.getRequestPath(host);

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ERROR_CODES.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let details: any =
      exception instanceof Error ? exception.message : exception;

    if (exception instanceof PrismaClientKnownRequestError) {
      ({ status, code, message, details } =
        this.handleKnownRequestError(exception));
    }

    if (exception instanceof PrismaClientInitializationError) {
      ({ status, code, message, details } =
        this.handleInitializationError(exception));
    }

    if (exception instanceof PrismaClientValidationError) {
      ({ status, code, message, details } =
        this.handleValidationError(exception));
    }

    if (exception instanceof PrismaClientUnknownRequestError) {
      ({ status, code, message, details } = this.handleUnknownError(exception));
    }

    this.sendErrorResponse(response, status, code, message, details, path);
  }

  private handleKnownRequestError(exception: PrismaClientKnownRequestError) {
    const { code: prismaCode, meta } = exception;

    //! Unique Constraint Violation
    if (prismaCode === 'P2002') {
      return {
        status: HttpStatus.CONFLICT,
        code: ERROR_CODES.RESOURCE_ALREADY_EXISTS,
        message: this.formatUniqueConstraintMessage(meta ?? {}),
        details: { field: meta?.targe, prismaCode },
      };
    }

    //! Record Not Found
    if (prismaCode === 'P2025') {
      return {
        status: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'The requested resource was not found',
        details: { prismaCode },
      };
    }

    //! Foreign Key Constraint Violation
    if (prismaCode === 'P2003') {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.DATABASE_CONSTRAINT_VIOLATION,
        message: 'Cannot perform operation due to related data constraint',
        details: { field: meta?.field_name, prismaCode },
      };
    }

    //! Invalid ID
    if (prismaCode === 'P2014') {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.VALIDATION_INVALID_FORMAT,
        message: 'Invalid ID format provided',
        details: { prismaCode },
      };
    }

    const isTableNotExists = prismaCode === 'P2021'; //! Table does not exit
    const isColumnNotExists = prismaCode === 'P2022'; //! Table does not have column

    if (isTableNotExists && isColumnNotExists) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ERROR_CODES.DATABASE_CONNECTION_FAILED,
        message: 'Database schema error',
        details: { prismaCode },
      };
    }

    return {
      status: HttpStatus.BAD_REQUEST,
      code: ERROR_CODES.DATABASE_CONSTRAINT_VIOLATION,
      message: 'Database operation failed',
      details: { prismaCode, meta },
    };
  }

  private handleValidationError(exception: PrismaClientValidationError) {
    return {
      status: HttpStatus.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_FAILED,
      message: 'Invalid data provided to database',
      details: {
        originalMessage: this.sanitizeValidationMessage(exception.message),
      },
    };
  }

  private handleInitializationError(
    exception: PrismaClientInitializationError,
  ) {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.DATABASE_CONNECTION_FAILED,
      message: 'Failed to connect to database',
      details: {
        errorCode: exception.errorCode,
      },
    };
  }

  private handleUnknownError(exception: any) {
    const originalMessage =
      exception instanceof Error
        ? exception.message
        : 'No additional error message available';

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected database error occurred',
      details: {
        originalMessage,
      },
    };
  }

  private formatUniqueConstraintMessage(meta: Record<string, unknown>): string {
    if (meta?.target) {
      const fields = Array.isArray(meta.target) ? meta.target : [meta.target];
      const fieldNames = fields.join(', ');
      return `A record with this ${fieldNames} already exists`;
    }

    return `A record with these values already exists`;
  }

  private sanitizeValidationMessage(message: string): string {
    return message
      .replace(/Argument `.*?`:/g, 'Field:')
      .replace(/Type `.*?`/g, 'Type')
      .replace(/Model `.*?`/g, 'Model');
  }
}
