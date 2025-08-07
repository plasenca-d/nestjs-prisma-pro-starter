import { ERROR_CODES } from '@common/constants';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

export interface ParseUuidOptions {
  version?: 1 | 2 | 3 | 4 | 5;
  optional?: boolean;
}

@Injectable()
export class ParseUuidPipe
  implements PipeTransform<string | undefined, string | undefined>
{
  constructor(private readonly options: ParseUuidOptions = {}) {}

  transform(
    value: string | undefined,
    metadata: ArgumentMetadata,
  ): string | undefined {
    const { version, optional } = this.options;

    if (value === undefined || value === null || value === '') {
      if (optional) {
        return undefined;
      }
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: `${metadata.data} is required`,
        details: { parameter: metadata.data, expectedType: 'uuid' },
      });
    }

    if (!uuidValidate(value)) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_INVALID_FORMAT,
        message: `${metadata.data} must be a valid UUID`,
        details: {
          parameter: metadata.data,
          value,
          expectedFormat: 'UUID',
        },
      });
    }

    if (version && uuidVersion(value) !== version) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_INVALID_FORMAT,
        message: `${metadata.data} must be a valid UUID v${version}`,
        details: {
          parameter: metadata.data,
          value,
          expectedVersion: version,
          actualVersion: uuidVersion(value),
        },
      });
    }

    return value;
  }
}
