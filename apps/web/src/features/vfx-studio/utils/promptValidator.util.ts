// ============================================================
// PROMPT VALIDATOR UTILITY
// ============================================================

import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';
import type { VideoPrompt } from '../types/video.types';

const { maxLength, minLength } = VIDEO_STUDIO_CONFIG.prompts;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  charCount: number;
  wordCount: number;
}

const BANNED_PATTERNS = [
  /\b(explicit|nsfw|violence|gore)\b/i,
];

export function validatePrompt(text: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const trimmed = text.trim();
  const charCount = trimmed.length;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  if (charCount === 0) {
    errors.push('Prompt cannot be empty.');
  } else if (charCount < minLength) {
    errors.push(`Prompt must be at least ${minLength} characters (currently ${charCount}).`);
  } else if (charCount > maxLength) {
    errors.push(`Prompt exceeds maximum ${maxLength} characters (currently ${charCount}).`);
  }

  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(trimmed)) {
      errors.push('Prompt contains inappropriate content.');
      break;
    }
  }

  if (charCount > maxLength * 0.9 && charCount <= maxLength) {
    warnings.push(`Approaching character limit (${charCount}/${maxLength}).`);
  }
  if (wordCount < 3 && charCount >= minLength) {
    warnings.push('More descriptive prompts produce better results.');
  }

  return { isValid: errors.length === 0, errors, warnings, charCount, wordCount };
}

export function validateAllPrompts(prompts: VideoPrompt[]): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();
  prompts.forEach(p => results.set(p.id, validatePrompt(p.text)));
  return results;
}

export function countValidPrompts(prompts: VideoPrompt[]): number {
  return prompts.filter(p => validatePrompt(p.text).isValid).length;
}

export function sanitizePrompt(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
