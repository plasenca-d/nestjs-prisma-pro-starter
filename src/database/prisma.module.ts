import { Global, Module } from '@nestjs/common';
import { PrismaHealthIndicator } from './prisma-health.indicator';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, PrismaHealthIndicator],
  exports: [PrismaService],
})
export class PrismaModule {}
