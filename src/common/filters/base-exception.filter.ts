import { ApiErrorResponse } from '@common/types';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

export abstract class BaseExceptionFilter {
  protected sendErrorResponse(
    response: Response,
    status: HttpStatus,
    code: string,
    message: string,
    details?: any,
    path?: string,
  ): void {
    const isDevelopment = process.env.NODE_ENV === 'development';

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        details: details || {},
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        stack: isDevelopment && details?.stack ? details.stack : undefined,
      },
      timestamp: new Date().toISOString(),
      path: path || response.req?.url || 'unknown',
    };

    //TODO: add custom logger
    this.logError(errorResponse, status);

    response.status(status).json(errorResponse);
  }

  protected logError(
    errorResponse: ApiErrorResponse,
    status: HttpStatus,
  ): void {
    const logLevel = status.valueOf() >= 500 ? 'error' : 'warn';
    const message = `${status} ${errorResponse.error.code}: ${errorResponse.error.message}`;

    //TODO: add custom logger
    console[logLevel]({
      message,
      error: errorResponse.error,
      path: errorResponse.path,
      timestamp: errorResponse.timestamp,
    });
  }

  protected getRequestPath(host: ArgumentsHost): string {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    return request.url || 'unknown';
  }
}
