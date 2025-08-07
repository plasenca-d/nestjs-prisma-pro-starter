/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export interface PerformanceMetrics {
  route: string;
  method: string;
  statusCode?: number;
  executionTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: string;
  userId?: string;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly slowRequestThreshold: number;

  constructor(slowRequestThreshold = 1000) {
    // 1 segundo
    this.slowRequestThreshold = slowRequestThreshold;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      finalize(() => {
        const endTime = process.hrtime.bigint();
        const executionTime = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
        const endMemory = process.memoryUsage();

        const metrics: PerformanceMetrics = {
          route: this.getRoutePattern(context),
          method: request.method,
          statusCode: response.statusCode,
          executionTime,
          memoryUsage: {
            rss: endMemory.rss - startMemory.rss,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            external: endMemory.external - startMemory.external,
            arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
          },
          timestamp: new Date().toISOString(),
          userId: request['user']?.id,
        };

        this.logMetrics(metrics);

        // Here you could send metrics to monitoring systems like Prometheus, DataDog, etc.
        this.sendMetricsToMonitoring(metrics);
      }),
    );
  }

  private getRoutePattern(context: ExecutionContext): string {
    const handler = context.getHandler();
    const controller = context.getClass();

    return `${controller.name}.${handler.name}`;
  }

  private logMetrics(metrics: PerformanceMetrics): void {
    const { route, method, executionTime } = metrics;

    if (executionTime > this.slowRequestThreshold) {
      this.logger.warn(
        `🐌 Slow request: ${method} ${route} - ${executionTime.toFixed(2)}ms`,
        { metrics },
      );
    } else {
      this.logger.debug(
        `⚡ ${method} ${route} - ${executionTime.toFixed(2)}ms`,
        { metrics },
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private sendMetricsToMonitoring(metrics: PerformanceMetrics): void {
    // Aquí implementarías integración con sistemas de monitoreo
    // Ejemplo: Prometheus, DataDog, New Relic, etc.
    // Ejemplo conceptual:
    // prometheusClient.histogram('http_request_duration_ms').observe(
    //   { method: metrics.method, route: metrics.route },
    //   metrics.executionTime
    // );
  }
}
