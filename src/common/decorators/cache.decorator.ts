import { CacheInterceptor, CacheOptions } from '@common/interceptors';
import { UseInterceptors } from '@nestjs/common';

export const Cache = (options?: CacheOptions) =>
  UseInterceptors(new CacheInterceptor(options));
