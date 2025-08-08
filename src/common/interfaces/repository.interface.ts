import { PaginatedResponse } from '../types/api-response.types';
import { PaginationQuery } from '../types/pagination.types';
import {
  GetCreateInput,
  GetIncludeInput,
  GetOrderByInput,
  GetSelectInput,
  GetUpdateInput,
  GetWhereInput,
  ModelName,
  TransactionCallback,
} from '../types/repository.types';

export interface IBaseRepository<
  T extends ModelName,
  CreateInput = GetCreateInput<T>,
  UpdateInput = GetUpdateInput<T>,
  WhereInput = GetWhereInput<T>,
  SelectInput = GetSelectInput<T>,
  IncludeInput = GetIncludeInput<T>,
  OrderByInput = GetOrderByInput<T>,
> {
  create(data: CreateInput): Promise<T>;
  findById(
    id: string,
    options?: {
      select?: SelectInput;
      include?: IncludeInput;
    },
  ): Promise<T | null>;
  findOne(where: WhereInput): Promise<T | null>;
  findMany(options?: {
    where?: WhereInput;
    select?: SelectInput;
    include?: IncludeInput;
    orderBy?: OrderByInput;
    skip?: number;
    take?: number;
  }): Promise<T[]>;
  findWithPagination(
    where: WhereInput,
    pagination: PaginationQuery,
    options?: {
      select?: SelectInput;
      include?: IncludeInput;
      orderBy?: OrderByInput;
    },
  ): Promise<PaginatedResponse<T>>;

  update(id: string, data: UpdateInput): Promise<T>;
  updateMany(where: WhereInput, data: Partial<UpdateInput>): Promise<number>;

  delete(id: string, soft?: boolean): Promise<T>;
  deleteMany(where: WhereInput, soft?: boolean): Promise<number>;

  count(where?: WhereInput): Promise<number>;
  exists(where: WhereInput): Promise<boolean>;
  restore(id: string): Promise<T>; // For soft deletes

  executeInTransaction<TResult>(
    callback: TransactionCallback<TResult>,
  ): Promise<TResult>;
}
