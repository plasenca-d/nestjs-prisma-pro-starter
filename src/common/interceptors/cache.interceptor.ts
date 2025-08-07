/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom key
  condition?: (context: ExecutionContext) => boolean; // Custom condition
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: any; expiry: number }>();

  constructor(private readonly options: CacheOptions = {}) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Only cache GET requests by default
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Check custom condition
    if (this.options.condition && !this.options.condition(context)) {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);

    // Check if exists in cache and not expired
    if (cached && cached.expiry > Date.now()) {
      return of(cached.data);
    }

    // If not in cache, execute and cache
    return next.handle().pipe(
      tap((data) => {
        const ttl = this.options.ttl || 300; // 5 minutes by default
        const expiry = Date.now() + ttl * 1000;

        this.cache.set(cacheKey, { data, expiry });

        // Clean expired cache periodically
        this.cleanExpiredCache();
      }),
    );
  }

  private generateCacheKey(request: Request): string {
    if (this.options.key) {
      return this.options.key;
    }

    const { url, query } = request;
    const user = request['user'];

    // Include user ID in the key if authenticated
    const userPart = user ? `user:${user.id}` : 'anonymous';
    const queryString = JSON.stringify(query);

    return `${userPart}:${url}:${queryString}`;
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }

  // Method to clear cache manually
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}
