import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';
import { PerformanceInterceptor } from './performance.interceptor';
import { ResponseInterceptor } from './response.interceptor';
import { TimeoutInterceptor } from './timeout.interceptor';
import { TransformInterceptor } from './transform.interceptor';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // First to capture everything
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor, // Second for metrics
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor, // Third for timeouts
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor, // Fourth for data transformation
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor, // Last for final response normalization
    },
  ],
})
export class InterceptorsModule {}
