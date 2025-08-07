import { PAGINATION_DEFAULTS, SORT_ORDERS } from '@common/constants';
import { PaginationOptions, PaginationQuery } from '@common/types';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PaginationPipe
  implements PipeTransform<PaginationOptions, PaginationQuery>
{
  transform(
    value: PaginationOptions = {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): PaginationQuery {
    const {
      page = PAGINATION_DEFAULTS.PAGE,
      limit = PAGINATION_DEFAULTS.LIMIT,
      sortBy,
      sortOrder = 'desc',
    } = value;

    // Validate and normalize page
    const normalizedPage = Math.max(1, Math.floor(Number(page)));

    // Validate and normalize limit
    const normalizedLimit = Math.min(
      PAGINATION_DEFAULTS.MAX_LIMIT,
      Math.max(PAGINATION_DEFAULTS.MIN_LIMIT, Math.floor(Number(limit))),
    );

    const skip = (normalizedPage - 1) * normalizedLimit;

    const normalizedSortOrder = SORT_ORDERS.includes(sortOrder)
      ? sortOrder
      : 'desc';

    return {
      page: normalizedPage,
      limit: normalizedLimit,
      skip,
      take: normalizedLimit,
      sortBy,
      sortOrder: normalizedSortOrder,
    };
  }
}
