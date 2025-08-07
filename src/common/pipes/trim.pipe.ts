/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

export interface TrimOptions {
  recursive?: boolean;
  transformEmpty?: boolean;
  emptyValue?: any;
}

@Injectable()
export class TrimPipe implements PipeTransform {
  constructor(private readonly options: TrimOptions = {}) {}

  transform(value: any, metadata: ArgumentMetadata): any {
    const { recursive, transformEmpty, emptyValue } = this.options;

    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (transformEmpty && trimmed === '') {
        return emptyValue !== undefined ? emptyValue : null;
      }

      return trimmed;
    }

    if (recursive && value && typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map((item) => this.transform(item, metadata));
      }

      const result = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.transform(val, metadata);
      }
      return result;
    }

    return value;
  }
}

@Injectable()
export class TrimToUndefinedPipe extends TrimPipe {
  constructor() {
    super({ transformEmpty: true, emptyValue: undefined, recursive: true });
  }
}
