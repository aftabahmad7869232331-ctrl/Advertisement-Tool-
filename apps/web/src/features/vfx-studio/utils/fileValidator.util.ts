// ============================================================
// FILE VALIDATOR UTILITY
// ============================================================

import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';

const { maxFileSizeMB, supportedFormats } = VIDEO_STUDIO_CONFIG.video;
const MAX_BYTES = maxFileSizeMB * 1024 * 1024;

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  fileInfo: {
    name: string;
    size: number;
    sizeMB: string;
    type: string;
    extension: string;
  };
}

export function validateVideoFile(file: File): FileValidationResult {
  const errors: string[] = [];
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

  if (!(supportedFormats as readonly string[]).includes(extension)) {
    errors.push(`Unsupported format ".${extension}". Allowed: ${supportedFormats.join(', ')}`);
  }
  if (file.size > MAX_BYTES) {
    errors.push(`File too large (${sizeMB} MB). Maximum allowed: ${maxFileSizeMB} MB.`);
  }
  if (file.size === 0) {
    errors.push('File is empty.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: { name: file.name, size: file.size, sizeMB, type: file.type, extension },
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3)      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 ** 3)).toFixed(1)} GB`;
}
