import { Prisma } from '../../../generated/prisma';

export type ModelName = keyof Prisma.TypeMap['model'];

export type GetWhereUniqueInput<T extends ModelName> =
  Prisma.TypeMap['model'][T]['operations']['findUnique']['args'] extends {
    where: infer W;
  }
    ? W
    : never;
export type GetWhereInput<T extends ModelName> =
  Prisma.TypeMap['model'][T]['operations']['findMany']['args'] extends {
    where?: infer W;
  }
    ? W
    : never;
export type GetCreateInput<T extends ModelName> =
  Prisma.TypeMap['model'][T]['operations']['create']['args'] extends {
    data: infer D;
  }
    ? D
    : never;
export type GetUpdateInput<T extends ModelName> =
  Prisma.TypeMap['model'][T]['operations']['update']['args'] extends {
    data: infer D;
  }
    ? D
    : never;
export type GetSelectInput<T extends ModelName> =
  Prisma.TypeMap['model'][T]['operations']['findMany']['args'] extends {
    select?: infer S;
  }
    ? S
    : never;
export type GetIncludeInput<T extends ModelName> =
  Prisma.TypeMap['model'][T]['operations']['findMany']['args'] extends {
    include?: infer I;
  }
    ? I
    : never;
export type GetOrderByInput<T extends ModelName> =
  Prisma.TypeMap['model'][T]['operations']['findMany']['args'] extends {
    orderBy?: infer O;
  }
    ? O
    : never;
export type GetPayload<T extends ModelName> =
  Prisma.TypeMap['model'][T]['operations']['findUnique']['result'] extends infer R
    ? R extends null
      ? never
      : R
    : never;

export type PrismaDelegate<
  T extends ModelName,
  WhereUniqueInput extends GetWhereUniqueInput<T>,
  WhereInput extends GetWhereInput<T>,
  CreateInput extends GetCreateInput<T>,
  UpdateInput extends GetUpdateInput<T>,
> = {
  create: (args: {
    data: CreateInput;
    select?: Prisma.SelectSubset<any, any>;
    include?: Prisma.SelectSubset<any, any>;
  }) => Promise<T>;

  findUnique: (args: {
    where: WhereUniqueInput;
    select?: Prisma.SelectSubset<any, any>;
    include?: Prisma.SelectSubset<any, any>;
  }) => Promise<T | null>;

  findFirst: (args: {
    where?: WhereInput;
    select?: Prisma.SelectSubset<any, any>;
    include?: Prisma.SelectSubset<any, any>;
    orderBy?: GetOrderByInput<T>;
  }) => Promise<T | null>;

  findMany: (args: {
    where?: WhereInput;
    select?: Prisma.SelectSubset<any, any>;
    include?: Prisma.SelectSubset<any, any>;
    orderBy?: any;
    skip?: number;
    take?: number;
  }) => Promise<T[]>;

  update: (args: {
    where: WhereUniqueInput;
    data: UpdateInput;
    select?: Prisma.SelectSubset<any, any>;
    include?: Prisma.SelectSubset<any, any>;
  }) => Promise<T>;

  updateMany: (args: {
    where: WhereInput;
    data: UpdateInput;
  }) => Promise<{ count: number }>;

  delete: (args: { where: WhereUniqueInput }) => Promise<T>;

  deleteMany: (args: { where: WhereInput }) => Promise<{ count: number }>;

  count: (args?: { where?: WhereInput }) => Promise<number>;
};

export interface SoftDeleteData {
  deletedAt: Date;
  updatedAt: Date;
  deletedBy?: string;
}

export interface RepositoryOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BulkOperationResult {
  count: number;
  success: boolean;
  errors?: string[];
}

export type TransactionCallback<T> = (tx: any) => Promise<T>;

export interface AdvancedFilter {
  field: string;
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'notIn'
    | 'contains'
    | 'startsWith'
    | 'endsWith';
  value: any;
}

export interface SearchFilter {
  fields: string[];
  query: string;
  mode?: 'insensitive' | 'default';
}

export interface AggregationOptions {
  groupBy?: string[];
  having?: Record<string, any>;
  orderBy?: GetOrderByInput<ModelName>;
}

export interface AggregationResult<T = any> {
  data: T[];
  aggregations: Record<string, any>;
}
