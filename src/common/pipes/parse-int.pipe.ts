import { ERROR_CODES } from '@common/constants';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

export interface ParseIntOptions {
  min?: number;
  max?: number;
  optional?: boolean;
  defaultValue?: number;
}

@Injectable()
export class ParseIntPipe
  implements PipeTransform<string | undefined, number | undefined>
{
  constructor(private readonly options: ParseIntOptions = {}) {}

  transform(
    value: string | undefined,
    metadata: ArgumentMetadata,
  ): number | undefined {
    const { min, max, optional, defaultValue } = this.options;

    if (value === undefined || value === null || value === '') {
      if (optional) {
        return defaultValue;
      }
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: `${metadata.data} is required`,
        details: { parameter: metadata.data, type: 'number' },
      });
    }

    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_INVALID_FORMAT,
        message: `${metadata.data} must be a valid integer`,
        details: {
          parameter: metadata.data,
          value,
          expectedType: 'integer',
        },
      });
    }

    // Validate range
    if (min !== undefined && parsed < min) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: `${metadata.data} must be at least ${min}`,
        details: { parameter: metadata.data, value: parsed, min },
      });
    }

    if (max !== undefined && parsed > max) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: `${metadata.data} must be at most ${max}`,
        details: { parameter: metadata.data, value: parsed, max },
      });
    }

    return parsed;
  }
}

@Injectable()
export class ParsePositiveIntPipe extends ParseIntPipe {
  constructor(options: ParseIntOptions = {}) {
    super({ min: 1, ...options });
  }
}

@Injectable()
export class ParsePagePipe extends ParseIntPipe {
  constructor() {
    super({ min: 1, defaultValue: 1, optional: true });
  }
}

@Injectable()
export class ParseLimitPipe extends ParseIntPipe {
  constructor() {
    super({ min: 1, max: 100, defaultValue: 20, optional: true });
  }
}
