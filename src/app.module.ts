import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ExceptionFiltersModule } from './common/filters';
import { InterceptorsModule } from './common/interceptors';
import {
  appConfig,
  configValidationSchema,
  databaseConfig,
  jwtConfig,
  mailConfig,
  redisConfig,
  storageConfig,
} from './config';

@Module({
  imports: [
    InterceptorsModule,
    ExceptionFiltersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        mailConfig,
        redisConfig,
        storageConfig,
      ],
      expandVariables: true,
    }),
    LoggerModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'standard',
          ttl: 60000,
          limit: 10,
        },
        {
          name: 'short',
          ttl: 10000,
          limit: 2,
        },
        {
          name: 'burst',
          ttl: 1000,
          limit: 5,
        },
      ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
