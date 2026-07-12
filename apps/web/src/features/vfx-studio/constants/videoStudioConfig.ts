// ============================================================
// VIDEO STUDIO CONFIGURATION
// ============================================================

export const VIDEO_STUDIO_CONFIG = {
  prompts: {
    maxCount: 5,
    minCount: 1,
    maxLength: 500,
    minLength: 10,
    defaultCount: 3,
  },
  video: {
    maxFileSizeMB: 100,
    maxDurationSeconds: 30,
    defaultClipDurationSeconds: 6,
    supportedFormats: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    thumbnailWidth: 320,
    thumbnailHeight: 180,
  },
  voice: {
    maxTextLength: 5000,
    defaultSpeed: 1.0,
    defaultPitch: 0,
    previewMaxLength: 200,
    outputFormats: ['mp3', 'wav', 'ogg'],
  },
  caption: {
    maxEntriesPerVideo: 1000,
    minDisplayTimeMs: 500,
    maxDisplayTimeMs: 10000,
    supportedFormats: ['srt', 'vtt', 'ass', 'ttml', 'json'],
    defaultFontSize: 24,
    defaultFontFamily: 'Arial',
  },
  export: {
    defaultFormat: 'mp4',
    defaultQuality: '1080p',
    watermarkEnabled: false,
    burnCaptionsDefault: false,
  },
  ui: {
    previewAutoPlay: false,
    showProgressBar: true,
    enableKeyboardShortcuts: true,
    autosaveIntervalMs: 30000,
    maxRecentProjects: 10,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 60000,
    retryAttempts: 3,
    retryDelayMs: 1000,
  },
} as const;

export const KEYBOARD_SHORTCUTS = {
  generateVideo: 'Ctrl+Enter',
  playPause:     'Space',
  exportVideo:   'Ctrl+E',
  addPrompt:     'Ctrl+N',
  saveProject:   'Ctrl+S',
  undo:          'Ctrl+Z',
  redo:          'Ctrl+Y',
} as const;

export const ANIMATION_DURATIONS = {
  fast:   150,
  normal: 300,
  slow:   500,
} as const;
