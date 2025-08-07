import { Global, Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from './validation.pipe';

@Global()
@Module({
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
          validateCustomDecorators: true,
          enableDebugMessages: process.env.NODE_ENV === 'development',
        }),
    },
  ],
  exports: [ValidationPipe],
})
export class PipesModule {}
