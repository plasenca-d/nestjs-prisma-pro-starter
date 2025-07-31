import { registerAs } from '@nestjs/config';

type StorageProvider = 'r2' | 's3' | 'minio';

interface StorageConfig {
  provider: StorageProvider;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  forcePathStyle: boolean; // For R2 and MinIO
  buckets: {
    users: string;
    posts: string;
    documents: string;
  };
  publicUrl: string;
  cdnUrl: string;
  upload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    prefixes: {
      avatars: string;
      posts: string;
      documents: string;
      temp: string;
    };
  };
  signedUrl: {
    expiresIn: number;
    downloadExpiresIn: number;
  };
  imageProcessing: {
    enabled: boolean;
    quality: number;
    maxWidth: number;
    maxHeight: number;
    thumbnailSize: number;
  };
}

export default registerAs<StorageConfig>('storage', () => {
  const provider = (process.env.STORAGE_PROVIDER || 'r2') as StorageProvider;

  // Base configuration
  const baseConfig = {
    provider,
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || 'defaultAccessKeyId',
    secretAccessKey:
      process.env.STORAGE_SECRET_ACCESS_KEY || 'defaultSecretAccessKey',
    bucket: process.env.STORAGE_BUCKET || 'defaultBucket',

    // Buckets by entity
    buckets: {
      users:
        process.env.STORAGE_USERS_BUCKET ||
        process.env.STORAGE_BUCKET ||
        'users',
      posts:
        process.env.STORAGE_POSTS_BUCKET ||
        process.env.STORAGE_BUCKET ||
        'posts',
      documents:
        process.env.STORAGE_DOCUMENTS_BUCKET ||
        process.env.STORAGE_BUCKET ||
        'documents',
    },

    // Upload configuration
    upload: {
      maxFileSize: parseInt(
        process.env.STORAGE_MAX_FILE_SIZE || '10485760',
        10,
      ), // 10MB
      allowedMimeTypes: process.env.STORAGE_ALLOWED_MIME_TYPES?.split(',') || [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
      ],
      prefixes: {
        avatars: 'users/avatars/',
        posts: 'posts/images/',
        documents: 'documents/',
        temp: 'temp/',
      },
    },

    // Signed URLs
    signedUrl: {
      expiresIn: parseInt(process.env.STORAGE_SIGNED_URL_EXPIRES || '3600', 10),
      downloadExpiresIn: parseInt(
        process.env.STORAGE_DOWNLOAD_EXPIRES || '300',
        10,
      ),
    },

    // Image processing
    imageProcessing: {
      enabled: process.env.STORAGE_IMAGE_PROCESSING === 'true',
      quality: parseInt(process.env.STORAGE_IMAGE_QUALITY || '80', 10),
      maxWidth: parseInt(process.env.STORAGE_IMAGE_MAX_WIDTH || '2048', 10),
      maxHeight: parseInt(process.env.STORAGE_IMAGE_MAX_HEIGHT || '2048', 10),
      thumbnailSize: parseInt(process.env.STORAGE_THUMBNAIL_SIZE || '300', 10),
    },
  };

  // Provider-specific configuration
  switch (provider) {
    case 'r2':
      return {
        ...baseConfig,
        endpoint:
          process.env.STORAGE_ENDPOINT ||
          'https://account.r2.cloudflarestorage.com',
        region: process.env.STORAGE_REGION || 'auto',
        forcePathStyle: true, // R2 requires path-style
        publicUrl:
          process.env.STORAGE_PUBLIC_URL || 'https://pub-bucket.r2.dev',
        cdnUrl: process.env.STORAGE_CDN_URL || 'https://cdn.example.com',
      };

    case 's3':
      return {
        ...baseConfig,
        endpoint:
          process.env.STORAGE_ENDPOINT ||
          `https://s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`,
        region: process.env.AWS_REGION || 'us-east-1',
        forcePathStyle: false, // S3 uses virtual-hosted-style by default
        publicUrl:
          process.env.STORAGE_PUBLIC_URL ||
          `https://${baseConfig.bucket}.s3.${process.env.STORAGE_REGION || 'us-east-1'}.amazonaws.com`,
        cdnUrl: process.env.STORAGE_CDN_URL || '',
      };

    case 'minio':
      return {
        ...baseConfig,
        endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
        region: process.env.STORAGE_REGION || 'us-east-1',
        forcePathStyle: true, // MinIO requires path-style
        publicUrl: process.env.STORAGE_PUBLIC_URL || 'http://localhost:9000',
        cdnUrl: process.env.STORAGE_CDN_URL || '',
      };

    default:
      throw new Error(`Unsupported storage provider: ${String(provider)}`);
  }
});
