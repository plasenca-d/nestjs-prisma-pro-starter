/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ERROR_CODES } from '@common/constants';
import { SearchOptions } from '@common/types';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

export interface SearchPipeOptions {
  minSearchLength?: number;
  maxSearchLength?: number;
  allowedSortFields?: string[];
  sanitizeSearch?: boolean;
}

@Injectable()
export class SearchPipe implements PipeTransform<any, SearchOptions> {
  constructor(private readonly options: SearchPipeOptions = {}) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any = {}, metadata: ArgumentMetadata): SearchOptions {
    const {
      minSearchLength = 1,
      maxSearchLength = 100,
      allowedSortFields,
      sanitizeSearch = true,
    } = this.options;

    const result: SearchOptions = {
      ...value,
    };

    // Validate and sanitize search term
    if (value.search !== undefined) {
      let search = String(value.search).trim();

      if (search.length < minSearchLength) {
        throw new BadRequestException({
          code: ERROR_CODES.VALIDATION_FAILED,
          message: `Search term must be at least ${minSearchLength} characters`,
          details: {
            parameter: 'search',
            minLength: minSearchLength,
            actualLength: search.length,
          },
        });
      }

      if (search.length > maxSearchLength) {
        throw new BadRequestException({
          code: ERROR_CODES.VALIDATION_FAILED,
          message: `Search term must be at most ${maxSearchLength} characters`,
          details: {
            parameter: 'search',
            maxLength: maxSearchLength,
            actualLength: search.length,
          },
        });
      }

      if (sanitizeSearch) {
        search = this.sanitizeSearchTerm(search);
      }

      result.search = search || undefined;
    }

    // Validate sortBy field
    if (value.sortBy && allowedSortFields) {
      if (!allowedSortFields.includes(String(value.sortBy))) {
        throw new BadRequestException({
          code: ERROR_CODES.VALIDATION_FAILED,
          message: `Invalid sort field. Allowed fields: ${allowedSortFields.join(', ')}`,
          details: {
            parameter: 'sortBy',
            value: value.sortBy,
            allowedFields: allowedSortFields,
          },
        });
      }
    }

    // Sanitize and validate filters
    if (value.filters && typeof value.filters === 'object') {
      result.filters = this.sanitizeFilters(value.filters);
    }

    return result;
  }

  /**
   * Remove potentially dangerous characters from the search term.
   * @param search - The search term to sanitize.
   * @returns The sanitized search term.
   */
  private sanitizeSearchTerm(search: string): string {
    return search
      .replace(/[<>"'%;()&+]/g, '') // Remove HTML and SQL injection characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private sanitizeFilters(filters: Record<string, any>): Record<string, any> {
    const sanitized = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === '' || value === null || value === undefined) {
        continue;
      }

      // Sanitize filter keys (prevent injection)
      const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '');
      if (safeKey !== key) {
        continue; // Skip unsafe keys
      }

      // Sanitize filter values
      if (typeof value === 'string') {
        sanitized[safeKey] = value.trim();
      } else if (Array.isArray(value)) {
        sanitized[safeKey] = value.filter((v) => v !== '' && v != null);
      } else {
        sanitized[safeKey] = value;
      }
    }

    return sanitized;
  }
}
