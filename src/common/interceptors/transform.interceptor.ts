/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Transform dates to ISO strings
        return this.transformDates(data);
      }),
    );
  }

  private transformDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformDates(item));
    }

    if (typeof obj === 'object') {
      const transformed = {};
      for (const [key, value] of Object.entries(obj as object)) {
        transformed[key] = this.transformDates(value);
      }
      return transformed;
    }

    return obj;
  }
}

// Interceptor for DTO serialization
@Injectable()
export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private readonly dto: ClassConstructor<T>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((item) =>
            plainToInstance(this.dto, item, {
              excludeExtraneousValues: true,
              enableImplicitConversion: true,
            }),
          );
        }

        if (data && typeof data === 'object' && 'data' in data) {
          // For paginated pages
          return {
            ...data,
            data: Array.isArray(data.data)
              ? data.data.map((item: any) =>
                  plainToInstance(this.dto, item, {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                  }),
                )
              : plainToInstance(this.dto, data.data, {
                  excludeExtraneousValues: true,
                  enableImplicitConversion: true,
                }),
          };
        }

        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        });
      }),
    );
  }
}
