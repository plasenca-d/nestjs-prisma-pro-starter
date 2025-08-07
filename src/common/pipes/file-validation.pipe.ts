import { ERROR_CODES, MIME_TYPES } from '@common/constants';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

export interface FileValidationOptions {
  maxSize?: number; // en bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  required?: boolean;
  maxFiles?: number; // para múltiples archivos
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions = {}) {}

  transform(
    files: MulterFile | MulterFile[] | undefined,
    metadata: ArgumentMetadata,
  ): MulterFile | MulterFile[] | undefined {
    const { required = false, maxFiles } = this.options;

    // Handle required validation
    if (required && (!files || (Array.isArray(files) && files.length === 0))) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'File is required',
        details: { parameter: metadata.data },
      });
    }

    if (!files) {
      return undefined;
    }

    const fileArray = Array.isArray(files) ? files : [files];

    // Validate max files count
    if (maxFiles && fileArray.length > maxFiles) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: `Maximum ${maxFiles} files allowed`,
        details: {
          parameter: metadata.data,
          maxFiles,
          receivedFiles: fileArray.length,
        },
      });
    }

    // Validate each file
    for (const file of fileArray) {
      this.validateFile(file, metadata.data || 'file');
    }

    return files;
  }

  private validateFile(file: MulterFile, parameterName: string): void {
    const { maxSize, allowedMimeTypes, allowedExtensions } = this.options;

    // Validate file size
    if (maxSize && file.size > maxSize) {
      throw new BadRequestException({
        code: ERROR_CODES.FILE_TOO_LARGE,
        message: `File size exceeds limit of ${this.formatFileSize(maxSize)}`,
        details: {
          parameter: parameterName,
          filename: file.originalname,
          size: file.size,
          maxSize,
          sizeFormatted: this.formatFileSize(file.size),
          maxSizeFormatted: this.formatFileSize(maxSize),
        },
      });
    }

    // Validate MIME type
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        code: ERROR_CODES.FILE_INVALID_TYPE,
        message: `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
        details: {
          parameter: parameterName,
          filename: file.originalname,
          mimetype: file.mimetype,
          allowedMimeTypes,
        },
      });
    }

    // Validate file extension
    if (allowedExtensions) {
      const fileExtension = this.getFileExtension(file.originalname);
      if (!allowedExtensions.includes(fileExtension)) {
        throw new BadRequestException({
          code: ERROR_CODES.FILE_INVALID_TYPE,
          message: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
          details: {
            parameter: parameterName,
            filename: file.originalname,
            extension: fileExtension,
            allowedExtensions,
          },
        });
      }
    }

    // Validate filename
    if (!this.isValidFilename(file.originalname)) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_INVALID_FORMAT,
        message: 'Invalid filename. Filename contains forbidden characters',
        details: {
          parameter: parameterName,
          filename: file.originalname,
          allowedPattern: 'alphanumeric, dots, hyphens, and underscores only',
        },
      });
    }
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private isValidFilename(filename: string): boolean {
    // Allow only safe characters in filenames
    const safeFilenameRegex = /^[a-zA-Z0-9.\-_\s]+$/;
    return safeFilenameRegex.test(filename) && filename.length <= 255;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

@Injectable()
export class ImageValidationPipe extends FileValidationPipe {
  constructor(maxSize = 5 * 1024 * 1024) {
    // 5MB
    super({
      maxSize,
      allowedMimeTypes: [
        MIME_TYPES.IMAGE_JPEG,
        MIME_TYPES.IMAGE_PNG,
        MIME_TYPES.IMAGE_WEBP,
      ],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    });
  }
}

@Injectable()
export class DocumentValidationPipe extends FileValidationPipe {
  constructor(maxSize = 10 * 1024 * 1024) {
    // 10MB
    super({
      maxSize,
      allowedMimeTypes: [MIME_TYPES.PDF, MIME_TYPES.DOC, MIME_TYPES.DOCX],
      allowedExtensions: ['pdf', 'doc', 'docx'],
    });
  }
}
