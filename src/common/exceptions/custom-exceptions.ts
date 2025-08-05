import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, ErrorCode } from '../constants';

export class BusinessException extends HttpException {
  constructor(
    code: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: any,
  ) {
    super(
      {
        code,
        message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        details,
      },
      status,
    );
  }
}

export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with ID ${identifier} not found`
      : `${resource} not found`;

    super(ERROR_CODES.RESOURCE_NOT_FOUND, message, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateResourceException extends BusinessException {
  constructor(resource: string, field: string, value: string) {
    super(
      ERROR_CODES.RESOURCE_ALREADY_EXISTS,
      `${resource} with ${field} '${value}' already exists`,
      HttpStatus.CONFLICT,
      { field, value },
    );
  }
}

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super(
      ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class InsufficientPermissionsException extends BusinessException {
  constructor(requiredPermission?: string) {
    const message = requiredPermission
      ? `Insufficient permissions. Required: ${requiredPermission}`
      : 'Insufficient permissions to perform this action';

    super(
      ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
      message,
      HttpStatus.FORBIDDEN,
      { requiredPermission },
    );
  }
}

export class FileUploadException extends BusinessException {
  constructor(reason: string, details?: any) {
    super(
      ERROR_CODES.FILE_UPLOAD_FAILED,
      `File upload failed: ${reason}`,
      HttpStatus.BAD_REQUEST,
      details,
    );
  }
}
