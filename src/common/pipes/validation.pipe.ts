/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ERROR_CODES } from '@common/constants';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  ValidationError as ClassValidatorError,
  validate,
} from 'class-validator';

export interface ValidationPipeOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  skipMissingProperties?: boolean;
  validateCustomDecorators?: boolean;
  enableDebugMessages?: boolean;
  stopAtFirstError?: boolean;
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly options: ValidationPipeOptions;

  constructor(options: ValidationPipeOptions = {}) {
    this.options = {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      validateCustomDecorators: true,
      enableDebugMessages: false,
      stopAtFirstError: false,
      ...options,
    };
  }

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const { metatype, type } = metadata;

    // Skip validation for primitive types
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Skip validation for non-body parameters unless explicitly enabled
    if (type !== 'body' && type !== 'custom') {
      return value;
    }

    // Transform plain object to class instance
    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: this.options.transform,
      excludeExtraneousValues: this.options.whitelist,
    });

    // Validate the object
    const errors = await validate(object, {
      whitelist: this.options.whitelist,
      forbidNonWhitelisted: this.options.forbidNonWhitelisted,
      skipMissingProperties: this.options.skipMissingProperties,
      validateCustomDecorators: this.options.validateCustomDecorators,
      stopAtFirstError: this.options.stopAtFirstError,
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Validation failed',
        validationErrors: this.formatErrors(errors),
        details: this.options.enableDebugMessages
          ? { originalValue: value }
          : undefined,
      });
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ClassValidatorError[]): ValidationErrorDetail[] {
    return this.flattenErrors(errors);
  }

  private flattenErrors(
    errors: ClassValidatorError[],
    parentPath = '',
  ): ValidationErrorDetail[] {
    const result: ValidationErrorDetail[] = [];

    for (const error of errors) {
      const propertyPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints) {
        for (const [constraint, message] of Object.entries(error.constraints)) {
          result.push({
            property: propertyPath,
            constraint,
            message,
            value: error.value,
          });
        }
      }

      if (error.children && error.children.length > 0) {
        result.push(...this.flattenErrors(error.children, propertyPath));
      }
    }

    return result;
  }
}

export interface ValidationErrorDetail {
  property: string;
  constraint: string;
  message: string;
  value: any;
}
