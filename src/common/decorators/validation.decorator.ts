import { FileValidationPipe, ParseIntPipe, ParseUuidPipe } from '@common/pipes';

export const ParsePositiveInt = () => new ParseIntPipe({ min: 1 });

export const ParseOptionalInt = (defaultValue?: number) =>
  new ParseIntPipe({ optional: true, defaultValue });

export const ParsePage = () =>
  new ParseIntPipe({ min: 1, defaultValue: 1, optional: true });

export const ParseLimit = () =>
  new ParseIntPipe({ min: 1, max: 100, defaultValue: 20, optional: true });

export const ParseOptionalUuid = () => new ParseUuidPipe({ optional: true });

export const ParseUuidV4 = () => new ParseUuidPipe({ version: 4 });

export const ValidateImage = (maxSize?: number) =>
  new FileValidationPipe({
    maxSize,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  });
