/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../types';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        // If it's already a formatted response, return it as is
        if (this.isFormattedResponse(data)) {
          return data;
        }

        // If it's a paginated response, format it appropriately
        if (this.isPaginatedResponse(data)) {
          return this.formatPaginatedResponse(data, request);
        }

        // Format normal response
        return this.formatResponse(data, request);
      }),
    );
  }

  private isFormattedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'timestamp' in data &&
      'path' in data
    );
  }

  private isPaginatedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'meta' in data &&
      Array.isArray(data.data) &&
      data.meta &&
      'total' in data.meta &&
      'page' in data.meta
    );
  }

  private formatResponse(data: T, request: Request): ApiResponse<T> {
    return {
      success: true,
      data,
      message: this.getSuccessMessage(request.method),
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  private formatPaginatedResponse(
    data: PaginatedResponse<any>,
    request: Request,
  ): ApiResponse<PaginatedResponse<any>> {
    return {
      success: true,
      data,
      message: this.getSuccessMessage(request.method),
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  private getSuccessMessage(method: string): string {
    const methodUpper = method.toUpperCase();

    if (methodUpper === 'GET') {
      return 'Data retrieved successfully';
    }

    if (methodUpper === 'POST') {
      return 'Resource created successfully';
    }

    if (methodUpper === 'PUT' || methodUpper === 'PATCH') {
      return 'Resource updated successfully';
    }

    if (methodUpper === 'DELETE') {
      return 'Resource deleted successfully';
    }

    return 'Operation completed successfully';
  }
}
