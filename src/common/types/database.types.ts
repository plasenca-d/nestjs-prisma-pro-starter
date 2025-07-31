import { PaginationOptions } from './pagination.types';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface SoftDeleteOptions {
  includeDeleted?: boolean;
  onlyDeleted?: boolean;
}

export interface QueryOptions extends SoftDeleteOptions {
  select?: Record<string, boolean>;
  include?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface CreateOptions {
  data: any;
  select?: Record<string, boolean>;
  include?: Record<string, any>;
}

export interface UpdateOptions {
  where: any;
  data: any;
  select?: Record<string, boolean>;
  include?: Record<string, any>;
}

export interface DeleteOptions {
  where: any;
  soft?: boolean;
}

export interface FindManyOptions extends QueryOptions, PaginationOptions {
  where?: any;
}

export interface RepositoryResponse<T> {
  data: T;
  meta?: any;
}
