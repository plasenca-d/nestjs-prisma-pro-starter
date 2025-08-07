/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const stats = await this.prismaService.getConnectionStats();

      if (stats.connected) {
        return indicator.up({
          database: 'up',
          timestamp: stats.timestamp,
        });
      }

      return indicator.down({
        database: 'down',
        error: stats.error,
        timestamp: stats.timestamp,
      });
    } catch (error) {
      return indicator.down({
        database: 'down',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
