// ============================================================
// VIDEO STUDIO CONTEXT
// ============================================================

import { createContext, useContext } from 'react';
import type { VideoProject, VideoPrompt, VideoGenerationRequest, VideoExportOptions, VideoStatus } from '../types/video.types';
import type { VoiceLabState } from '../types/voice.types';
import type { CaptionEditorState } from '../types/caption.types';
import { DEFAULT_FORMAT, DEFAULT_QUALITY, DEFAULT_ASPECT_RATIO } from '../constants/videoFormats';
import { DEFAULT_VOICE_SETTINGS } from '../constants/voiceSettings';

export interface VideoStudioContextValue {
  // Project state
  project: VideoProject;
  setProject: (project: VideoProject) => void;

  // Prompts
  addPrompt: () => void;
  removePrompt: (id: string) => void;
  updatePrompt: (id: string, update: string | Partial<Pick<VideoPrompt, 'text' | 'style' | 'mood'>>) => void;
  reorderPrompts: (fromIndex: number, toIndex: number) => void;

  // Generation
  generationStatus: VideoStatus;
  generationProgress: number;
  generationError: string | null;
  generationFailedClips: { index: number; prompt: string; error: string }[] | null;
  generateVideo: (request: VideoGenerationRequest) => Promise<void>;
  cancelGeneration: () => void;
  addImportedVideo: (videoData: { id: string; url: string; thumbnailUrl: string; duration: number; format: string; quality: string; aspectRatio: string; fileSize: number; filename: string }) => void;

  // Voice Lab
  voiceLabState: VoiceLabState;
  updateVoiceLab: (updates: Partial<VoiceLabState>) => void;

  // Caption editor
  captionState: CaptionEditorState;
  updateCaptionState: (updates: Partial<CaptionEditorState>) => void;

  // Export
  exportVideo: (options: VideoExportOptions) => Promise<void>;
  isExporting: boolean;

  // UI
  activeTab: 'prompts' | 'import' | 'template' | 'timeline' | 'titles' | 'vfx' | 'ai-vfx' | 'pro' | 'analytics' | 'publish' | 'settings' | 'regenerate' | 'lipsync' | 'dub' | 'voice' | 'captions' | 'bgremove' | 'watermark' | 'music' | 'export';
  setActiveTab: (tab: 'prompts' | 'import' | 'template' | 'timeline' | 'titles' | 'vfx' | 'ai-vfx' | 'pro' | 'analytics' | 'publish' | 'settings' | 'regenerate' | 'lipsync' | 'dub' | 'voice' | 'captions' | 'bgremove' | 'watermark' | 'music' | 'export') => void;
  selectedLanguage: string;
  setSelectedLanguage: (code: string) => void;
}

export const defaultProject: VideoProject = {
  id: '',
  name: 'New Video Project',
  prompts: [],
  videos: [],
  language: 'en',
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'idle',
};

export const defaultVoiceLabState: VoiceLabState = {
  selectedVoice: null,
  voices: [],
  settings: DEFAULT_VOICE_SETTINGS,
  previewText: '',
  isGenerating: false,
  isPlaying: false,
  generatedAudioUrl: null,
  error: null,
};

export const defaultCaptionState: CaptionEditorState = {
  caption: null,
  selectedEntryId: null,
  isEditing: false,
  currentTime: 0,
  style: {
    fontFamily: 'Arial',
    fontSize: 24,
    fontColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.7,
    bold: false,
    italic: false,
    underline: false,
    alignment: 'center',
    position: 'bottom',
    animation: 'none',
    padding: 8,
    borderRadius: 4,
  },
  showPreview: true,
  isDirty: false,
};

export const VideoStudioContext = createContext<VideoStudioContextValue | null>(null);

export function useVideoStudioContext(): VideoStudioContextValue {
  const ctx = useContext(VideoStudioContext);
  if (!ctx) throw new Error('useVideoStudioContext must be used within VideoStudioProvider');
  return ctx;
}
