import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
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
