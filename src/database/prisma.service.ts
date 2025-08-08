/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '../../generated/prisma';

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

class CustomPrismaClient extends PrismaClient<
  Prisma.PrismaClientOptions,
  'query' | 'error' | 'info' | 'warn'
> {
  static instance: CustomPrismaClient;

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('database.url'),
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      errorFormat: 'pretty',
    });

    if (!CustomPrismaClient.instance) {
      CustomPrismaClient.instance = this;
    }

    return CustomPrismaClient.instance;
  }
}

@Injectable()
export class PrismaService
  extends CustomPrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.setupEventListeners();
      this.setupSlowQueries();
      this.setupSoftDelete();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected successfully');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  private setupSoftDelete() {
    const softDeleteExtension = Prisma.defineExtension({
      name: 'softDelete',
      query: {
        $allModels: {
          async findFirst({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findFirstOrThrow({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findMany({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findUnique({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findUniqueOrThrow({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async count({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async aggregate({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async groupBy({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async update({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async updateMany({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async upsert({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
        },
      },
    });

    return this.$extends(softDeleteExtension);
  }

  async softDelete<T>(
    model: string,
    where: any,
    deletedBy?: string,
  ): Promise<T> {
    const modelDelegate = this[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    const data: any = {
      deletedAt: new Date(),
    };

    if (deletedBy) {
      data.deletedById = deletedBy;
    }

    return await modelDelegate.update({
      where,
      data,
    });
  }

  async softDeleteMany(
    model: string,
    where: any,
    deletedBy?: string,
  ): Promise<{ count: number }> {
    const modelDelegate = this[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    const data: any = {
      deletedAt: new Date(),
    };

    if (deletedBy) {
      data.deletedById = deletedBy;
    }

    return await modelDelegate.updateMany({
      where: {
        ...where,
        deletedAt: null, // Only soft delete non-deleted records
      },
      data,
    });
  }

  async restore<T>(model: string, where: any): Promise<T> {
    const modelDelegate = this[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelDelegate.update({
      where: {
        ...where,
        deletedAt: { not: null }, // Only restore deleted records
      },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  }

  async restoreMany(model: string, where: any): Promise<{ count: number }> {
    const modelDelegate = this[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelDelegate.updateMany({
      where: {
        ...where,
        deletedAt: { not: null }, // Only restore deleted records
      },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  }

  async findWithDeleted<T extends Record<string, any>>(
    model: string,
    args: any,
  ): Promise<T[]> {
    const modelDelegate = (this as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelDelegate.findMany({
      ...args,
      where: {
        ...args.where,
        // Don't filter by deletedAt - include all records
      },
    });
  }

  async findOnlyDeleted<T extends Record<string, any>>(
    model: string,
    args: any,
  ): Promise<T[]> {
    const modelDelegate = (this as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelDelegate.findMany({
      ...args,
      where: {
        ...args.where,
        deletedAt: { not: null },
      },
    });
  }

  async forceDelete<T extends Record<string, any>>(
    model: string,
    where: any,
  ): Promise<T> {
    const modelDelegate = (this as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelDelegate.delete({ where });
  }

  async forceDeleteMany(model: string, where: any): Promise<{ count: number }> {
    // Use the base client for force delete (permanent deletion)
    const modelDelegate = (this as any)[model];
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found`);
    }

    return await modelDelegate.deleteMany({ where });
  }

  private setupSlowQueries() {
    this.$on('query', (e) => {
      if (e.duration > 1000) {
        this.logger.warn(
          `Slow query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`,
        );
      }
    });
  }

  private setupEventListeners() {
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e) => {
        this.logger.debug(
          `Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`,
        );
      });
    }

    this.$on('error', (e) => {
      this.logger.error('Prisma error:', e);
    });

    this.$on('warn', (e) => {
      this.logger.warn('Prisma warning:', e);
    });

    this.$on('info', (e) => {
      this.logger.log('Prisma info:', e);
    });
  }

  async getConnectionStats() {
    try {
      await this.$queryRaw`SELECT 1 as connected`;
      return {
        connected: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        connected: false,

        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async cleanupTestData() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanup can only be run in test environment');
    }

    const tablenames = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await this.$executeRawUnsafe(
            `TRUNCATE TABLE "public"."${tablename}" CASCADE;`,
          );
        } catch (error) {
          console.log({ error });
        }
      }
    }
  }
}
