import { PaginatedResponse } from '../types/api-response.types';
import { FindManyOptions, QueryOptions } from '../types/database.types';
import { PaginationQuery } from '../types/pagination.types';

export interface IBaseRepository<T, CreateDto, UpdateDto> {
  create(data: CreateDto): Promise<T>;
  findById(id: string, options?: QueryOptions): Promise<T | null>;
  findOne(where: any, options?: QueryOptions): Promise<T | null>;
  findMany(options?: FindManyOptions): Promise<T[]>;
  findManyPaginated(
    pagination: PaginationQuery,
    options?: FindManyOptions,
  ): Promise<PaginatedResponse<T>>;

  update(id: string, data: UpdateDto): Promise<T>;
  updateMany(where: any, data: Partial<UpdateDto>): Promise<number>;

  delete(id: string, soft?: boolean): Promise<T>;
  deleteMany(where: any, soft?: boolean): Promise<number>;

  // Special methods
  count(where?: any): Promise<number>;
  exists(where: any): Promise<boolean>;
  restore(id: string): Promise<T>; // For soft deletes

  // Transactions
  transaction<R>(callback: (tx: any) => Promise<R>): Promise<R>;
}
