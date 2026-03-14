export const PAGE_SIZE = 24

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

export const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL ?? ''

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]

export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const APP_VERSION = '1.0.0'
