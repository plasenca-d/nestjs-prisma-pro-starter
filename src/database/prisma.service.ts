import { PrismaClient } from '../../generated/prisma';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

class CustomPrismaClient extends PrismaClient {
  static instance: CustomPrismaClient;

  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });

    if (!CustomPrismaClient.instance) {
      CustomPrismaClient.instance = this;
    }

    return CustomPrismaClient.instance;
  }
}

@Injectable()
export class PrismaService extends CustomPrismaClient implements OnModuleInit {
  private logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('PrismaService initialized');
  }
}
