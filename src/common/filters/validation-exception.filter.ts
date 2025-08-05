import { ERROR_CODES } from '@common/constants';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseExceptionFilter } from './base-exception.filter';

interface ValidationError {
  field: string;
  message: string;
  constraint: string;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const path = this.getRequestPath(host);

    const exceptionResponse = exception.getResponse();

    const defaultMessageError =
      exceptionResponse instanceof Error
        ? exceptionResponse.message
        : exception.message;

    if (!this.isValidationError(exceptionResponse)) {
      this.sendErrorResponse(
        response,
        exception.getStatus(),
        ERROR_CODES.VALIDATION_FAILED,
        defaultMessageError,
        exceptionResponse,
        path,
      );

      return;
    }

    //? This error is thrown by class-validator: Error instance
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const exceptionProcessed = exceptionResponse as any;

    const validationErrors = this.formatValidationErrors(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      exceptionProcessed.message as string[],
    );

    this.sendErrorResponse(
      response,
      exception.getStatus(),
      ERROR_CODES.VALIDATION_FAILED,
      'Validation failed for the provided data',
      {
        validationErrors,
        fields: this.extractFieldNames(validationErrors),
      },
      path,
    );
  }

  private isValidationError(response: string | object): boolean {
    if (response === undefined || response === null) {
      return false;
    }

    if (typeof response === 'string') {
      return false;
    }

    if (!(response instanceof Error)) {
      return false;
    }

    return (
      Array.isArray(response.message) &&
      response.message.length > 0 &&
      typeof response.message[0] === 'string'
    );
  }

  private formatValidationErrors(messages: string[]): ValidationError[] {
    //? Parsing class-validator messages
    //? Format: "field must be a valid email"
    return messages.map((message) => {
      const parts = message.split(' ');
      const field = parts[0];
      const constraint = this.extractConstraint(message);

      return {
        field,
        message,
        constraint,
      };
    });
  }

  private extractConstraint(message: string): string {
    if (message.includes('must be')) {
      if (message.includes('email')) return 'isEmail';
      if (message.includes('string')) return 'isString';
      if (message.includes('number')) return 'isNumber';
      if (message.includes('boolean')) return 'isBoolean';
      if (message.includes('date')) return 'isDate';
      if (message.includes('uuid')) return 'isUuid';
    }

    if (message.includes('should not be empty')) return 'isNotEmpty';
    if (message.includes('must be longer than')) return 'minLength';
    if (message.includes('must be shorter than')) return 'maxLength';
    if (message.includes('must match')) return 'matches';

    return 'validation';
  }

  private extractFieldNames(errors: ValidationError[]): string[] {
    return [...new Set(errors.map((error) => error.field))];
  }
}
