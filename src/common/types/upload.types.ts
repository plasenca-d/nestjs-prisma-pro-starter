export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  bucket: string;
  key: string;
  entityType: string;
  entityId: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface FileUploadOptions {
  entityType: string;
  entityId: string;
  allowedMimeTypes?: string[];
  maxSize?: number;
  generateThumbnail?: boolean;
  public?: boolean;
}

export interface SignedUrlOptions {
  expiresIn?: number;
  operation: 'upload' | 'download' | 'view';
  contentType?: string;
}

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  thumbnail?: boolean;
}

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other',
}

export interface FileValidation {
  maxSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}
