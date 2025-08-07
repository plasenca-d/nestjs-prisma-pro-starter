/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface RequestLog {
  requestId: string;
  method: string;
  url: string;
  userAgent: string;
  ip: string;
  userId?: string;
  body?: any;
  query?: any;
  params?: any;
  timestamp: string;
}

export interface ResponseLog extends RequestLog {
  statusCode: number;
  responseTime: number;
  responseSize?: number;
  error?: any;
}

export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Generate unique ID by request
    const requestId = uuidv4();
    request['requestId'] = requestId;

    const startTime = Date.now();
    const requestLog = this.buildRequestLog(request, requestId);

    // Entry Log
    this.logRequest(requestLog);

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - startTime;
        const responseLog = this.buildResponseLog(
          requestLog,
          response,
          responseTime,
          data,
        );
        this.logResponse(responseLog);
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        const responseLog = this.buildResponseLog(
          requestLog,
          response,
          responseTime,
          null,
          error,
        );
        this.logError(responseLog);
        throw error; // Re-throw the error so it can be handled by filters
      }),
    );
  }

  private buildRequestLog(request: Request, requestId: string): RequestLog {
    const user = request['user']; // Assuming the user is in request.user

    return {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent') || 'unknown',
      ip: this.getClientIp(request),
      userId: user ? user?.id || user?.sub : undefined,
      body: this.sanitizeBody(request.body),
      query: request.query,
      params: request.params,
      timestamp: new Date().toISOString(),
    };
  }

  private buildResponseLog(
    requestLog: RequestLog,
    response: Response,
    responseTime: number,
    data?: any,
    error?: any,
  ): ResponseLog {
    return {
      ...requestLog,
      statusCode: response.statusCode,
      responseTime,
      responseSize: this.calculateResponseSize(data),
      ...(error && { error: this.sanitizeError(error) }),
    };
  }

  private getClientIp(request: Request): string {
    return (
      request.ip ||
      request.socket.remoteAddress ||
      (request.socket as any)?.remoteAddress ||
      'unknown'
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'confirmPassword',
      'oldPassword',
      'newPassword',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'key',
      'authorization',
    ];

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeError(error: any): any {
    return {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
      // No incluir stack en logs para evitar spam
    };
  }

  private calculateResponseSize(data: any): number | undefined {
    if (!data) return undefined;

    try {
      return JSON.stringify(data).length;
    } catch {
      return undefined;
    }
  }

  private logRequest(requestLog: RequestLog): void {
    const { requestId, method, url, ip, userId } = requestLog;

    this.logger.log(
      `→ ${method} ${url} [${requestId}] ${ip}${userId ? ` user:${userId}` : ''}`,
      {
        type: 'request',
        ...requestLog,
      },
    );
  }

  private logResponse(responseLog: ResponseLog): void {
    const { requestId, method, url, statusCode, responseTime } = responseLog;
    const level = statusCode >= 400 ? 'warn' : 'log';

    this.logger[level](
      `← ${method} ${url} [${requestId}] ${statusCode} ${responseTime}ms`,
      {
        type: 'response',
        ...responseLog,
      },
    );
  }

  private logError(responseLog: ResponseLog): void {
    const { requestId, method, url, statusCode, responseTime, error } =
      responseLog;

    this.logger.error(
      `✖ ${method} ${url} [${requestId}] ${statusCode} ${responseTime}ms - ${error?.message}`,
      {
        type: 'error',
        ...responseLog,
      },
    );
  }
}
