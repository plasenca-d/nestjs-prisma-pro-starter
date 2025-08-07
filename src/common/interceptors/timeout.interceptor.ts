/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import {
  catchError,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs: number = 30000) {} // 30 by default

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timed out after ${this.timeoutMs}ms`,
              ),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}

// Configurable version per endpoint
@Injectable()
export class ConfigurableTimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Get timeout from headers or use default
    const timeoutHeader = request.headers['x-timeout'];
    const timeoutMs = timeoutHeader
      ? parseInt(String(timeoutHeader), 10)
      : 30000;

    // Validate timeout (min: 1s, max: 5min)
    const validTimeout = Math.min(Math.max(timeoutMs, 1000), 300000);

    return next.handle().pipe(
      timeout(validTimeout),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timed out after ${validTimeout}ms`,
              ),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
