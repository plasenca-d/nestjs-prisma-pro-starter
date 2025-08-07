import { SerializeInterceptor } from '@common/interceptors';
import { UseInterceptors } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

export const Serialize = <T>(dto: ClassConstructor<T>) =>
  UseInterceptors(new SerializeInterceptor(dto));
