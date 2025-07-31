export const MIME_TYPES = {
  // Images
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_WEBP: 'image/webp',
  IMAGE_GIF: 'image/gif',
  IMAGE_SVG: 'image/svg+xml',

  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  // Text
  TEXT_PLAIN: 'text/plain',
  TEXT_CSV: 'text/csv',

  // Video
  MP4: 'video/mp4',
  WEBM: 'video/webm',

  // Audio
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
} as const;

export const ALLOWED_MIME_TYPES = {
  IMAGES: [MIME_TYPES.IMAGE_JPEG, MIME_TYPES.IMAGE_PNG, MIME_TYPES.IMAGE_WEBP],
  DOCUMENTS: [MIME_TYPES.PDF, MIME_TYPES.DOC, MIME_TYPES.DOCX],
  SPREADSHEETS: [MIME_TYPES.XLS, MIME_TYPES.XLSX, MIME_TYPES.TEXT_CSV],
  ALL_SAFE: [
    ...Object.values(MIME_TYPES).filter(
      (type) =>
        type.startsWith('image/') ||
        type.startsWith('application/') ||
        type === MIME_TYPES.TEXT_PLAIN,
    ),
  ],
} as const;
