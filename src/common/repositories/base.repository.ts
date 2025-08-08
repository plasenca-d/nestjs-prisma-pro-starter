/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/common/repository/base.repository.ts
import { IBaseRepository } from '@common/interfaces';
import { PrismaService } from '@database/prisma.service';
import { Injectable } from '@nestjs/common';

import { PaginatedResponse } from '../types/api-response.types';
import { PaginationQuery } from '../types/pagination.types';
import {
  GetCreateInput,
  GetIncludeInput,
  GetOrderByInput,
  GetPayload,
  GetSelectInput,
  GetUpdateInput,
  GetWhereInput,
  GetWhereUniqueInput,
  ModelName,
  PrismaDelegate,
  TransactionCallback,
} from '../types/repository.types';

@Injectable()
export abstract class BaseRepository<
  TModelName extends ModelName,
  TPayload = GetPayload<TModelName>,
> implements
    IBaseRepository<
      TModelName,
      GetCreateInput<TModelName>,
      GetUpdateInput<TModelName>
    >
{
  protected abstract model: PrismaDelegate<
    TModelName,
    GetWhereUniqueInput<TModelName>,
    GetWhereInput<TModelName>,
    GetCreateInput<TModelName>,
    GetUpdateInput<TModelName>
  >;

  constructor(protected readonly prisma: PrismaService) {}

  async create(data: GetCreateInput<TModelName>): Promise<TModelName> {
    try {
      return await this.model.create({
        data: this.transformCreateData(data),
        ...this.getDefaultIncludes(),
      });
    } catch (error) {
      this.handleRepositoryError(error, 'create');
      throw error;
    }
  }

  async findById(
    id: string,
    options?: {
      select?: GetSelectInput<TModelName>;
      include?: GetIncludeInput<TModelName>;
    },
  ): Promise<TPayload | null> {
    try {
      return await this.model.findUnique({
        where: {
          id,
        },
        ...this.buildFindOptions(options),
      });
    } catch (error) {
      this.handleRepositoryError(error, 'findById', { id, options });
      throw error;
    }
  }

  async findOne(where: GetWhereInput<TModelName>): Promise<TPayload | null> {
    try {
      return await this.model.findFirst({
        where,
        ...this.getDefaultIncludes(),
      });
    } catch (error) {
      this.handleRepositoryError(error, 'findOne', { where });
      throw error;
    }
  }

  async findMany(options?: {
    where?: GetWhereInput<TModelName>;
    select?: GetSelectInput<TModelName>;
    include?: GetIncludeInput<TModelName>;
    orderBy?: GetOrderByInput<TModelName>;
    skip?: number;
    take?: number;
  }): Promise<TPayload[]> {
    try {
      const findOptions = this.buildFindOptions(options);
      const sortOptions = this.buildSortOptions(options?.orderBy);

      return await this.model.findMany({
        where: options?.where,
        ...findOptions,
        ...sortOptions,
        skip: options?.skip,
        take: options?.take,
      });
    } catch (error) {
      this.handleRepositoryError(error, 'findMany', { options });
      throw error;
    }
  }

  async findWithPagination(
    where: GetWhereInput<TModelName>,
    pagination: PaginationQuery,
    options?: {
      select?: GetSelectInput<TModelName>;
      include?: GetIncludeInput<TModelName>;
      orderBy?: GetOrderByInput<TModelName>;
    },
  ): Promise<PaginatedResponse<TPayload>> {
    try {
      const findOptions = this.buildFindOptions(options);
      const sortOptions = this.buildSortOptions(options?.orderBy);
      const skip = (pagination.page - 1) * pagination.limit;

      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          ...findOptions,
          ...sortOptions,
          skip,
          take: pagination.limit,
        }),
        this.count(where),
      ]);

      return this.buildPaginatedResponse(data, total, pagination);
    } catch (error) {
      this.handleRepositoryError(error, 'findWithPagination', {
        where,
        pagination,
        options,
      });
      throw error;
    }
  }

  async update(
    id: string,
    data: GetUpdateInput<TModelName>,
  ): Promise<TModelName> {
    try {
      return await this.model.update({
        where: { id } as GetWhereUniqueInput<TModelName>,
        data: this.transformUpdateData(data),
        ...this.getDefaultIncludes(),
      });
    } catch (error) {
      this.handleRepositoryError(error, 'update', { id, data });
      throw error;
    }
  }

  async updateMany(
    where: GetWhereInput<TModelName>,
    data: GetUpdateInput<TModelName>,
  ): Promise<number> {
    try {
      const result = await this.model.updateMany({
        where: this.transformWhereClause(where),
        data: this.transformUpdateData(data),
      });
      return result.count;
    } catch (error) {
      this.handleRepositoryError(error, 'updateMany', { where, data });
      throw error;
    }
  }

  async delete(id: string, soft = true): Promise<TModelName> {
    try {
      if (soft) {
        return await this.prisma.softDelete(this.getModelName(), {
          id,
        });
      }

      return await this.model.delete({
        where: { id } as GetWhereUniqueInput<TModelName>,
      });
    } catch (error) {
      this.handleRepositoryError(error, 'delete', { id, soft });
      throw error;
    }
  }

  async deleteMany(
    where: GetWhereInput<TModelName>,
    soft = true,
  ): Promise<number> {
    try {
      if (soft) {
        const result = await this.model.updateMany({
          where,
          data: {
            deletedAt: new Date(),
            updatedAt: new Date(),
          } as GetUpdateInput<TModelName>,
        });
        return result.count;
      } else {
        const result = await this.model.deleteMany({
          where,
        });
        return result.count;
      }
    } catch (error) {
      this.handleRepositoryError(error, 'deleteMany', { where, soft });
      throw error;
    }
  }

  async count(where?: GetWhereInput<TModelName>): Promise<number> {
    try {
      return await this.model.count({
        where,
      });
    } catch (error) {
      this.handleRepositoryError(error, 'count', { where });
      throw error;
    }
  }

  async exists(where: GetWhereInput<TModelName>): Promise<boolean> {
    try {
      const count = await this.model.count({
        where,
      });
      return count > 0;
    } catch (error) {
      this.handleRepositoryError(error, 'exists', { where });
      throw error;
    }
  }

  async restore(id: string): Promise<TModelName> {
    try {
      return await this.prisma.restore(this.getModelName(), {
        id,
      });
    } catch (error) {
      this.handleRepositoryError(error, 'restore', { id });
      throw error;
    }
  }

  async transaction<R>(callback: TransactionCallback<R>): Promise<R> {
    return this.executeInTransaction(callback);
  }

  protected transformCreateData(
    data: GetCreateInput<TModelName>,
  ): GetCreateInput<TModelName> {
    return data;
  }

  protected transformUpdateData(
    data: GetUpdateInput<TModelName>,
  ): GetUpdateInput<TModelName> {
    return data;
  }

  protected transformWhereClause(
    where?: GetWhereInput<TModelName>,
  ): GetWhereInput<TModelName> {
    if (!where) return {} as GetWhereInput<TModelName>;
    return where;
  }

  protected buildFindOptions(options?: {
    select?: GetSelectInput<TModelName>;
    include?: GetIncludeInput<TModelName>;
    where?: GetWhereInput<TModelName>;
  }): {
    select?: GetSelectInput<TModelName>;
    include?: GetIncludeInput<TModelName>;
    where?: GetWhereInput<TModelName>;
  } {
    const result: {
      select?: GetSelectInput<TModelName>;
      include?: GetIncludeInput<TModelName>;
      where?: GetWhereInput<TModelName>;
    } = {};

    if (options?.select) {
      result.select = options.select;
    } else if (options?.include) {
      result.include = options.include;
    } else {
      const defaultIncludes = this.getDefaultIncludes();
      if (defaultIncludes.include) {
        result.include = defaultIncludes.include;
      }
    }

    if (options?.where) {
      result.where = this.transformWhereClause(options.where);
    }

    return result;
  }

  protected buildSortOptions(orderBy?: GetOrderByInput<TModelName>): {
    orderBy?: GetOrderByInput<TModelName>;
  } {
    return {
      orderBy: orderBy || this.getDefaultSort(),
    };
  }

  protected buildPaginatedResponse<TData>(
    data: TData[],
    total: number,
    pagination: PaginationQuery,
  ): PaginatedResponse<TData> {
    const totalPages = Math.ceil(total / pagination.limit);
    const hasNextPage = pagination.page < totalPages;
    const hasPrevPage = pagination.page > 1;

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  protected handleRepositoryError(
    error: Error,
    operation: string,
    context?: Record<string, any>,
  ): void {
    // Log del error con contexto
    console.error(`Repository error in ${operation}:`, {
      error: error.message,
      context,
      stack: error.stack,
    });
  }

  // Métodos para transacciones
  async executeInTransaction<TResult>(
    callback: TransactionCallback<TResult>,
  ): Promise<TResult> {
    return this.prisma.$transaction(callback);
  }

  // Métodos abstractos para override
  protected getDefaultIncludes(): { include?: GetIncludeInput<TModelName> } {
    return {};
  }

  protected getDefaultSort(): GetOrderByInput<TModelName> {
    return { createdAt: 'desc' } as GetOrderByInput<TModelName>;
  }

  // Método abstracto para obtener el nombre del modelo (necesario para soft delete)
  protected abstract getModelName(): string;
}
