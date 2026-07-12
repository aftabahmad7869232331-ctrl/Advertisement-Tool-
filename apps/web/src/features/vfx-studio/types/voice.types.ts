// ============================================================
// VOICE TYPES - Frontend
// ============================================================

export type VoiceGender = 'male' | 'female' | 'neutral';
export type VoiceStyle = 'professional' | 'casual' | 'energetic' | 'calm' | 'dramatic' | 'friendly';
export type TTSProvider = 'google' | 'elevenlabs' | 'openai' | 'azure' | 'local';

export interface Voice {
  id: string;
  name: string;
  gender: VoiceGender;
  style: VoiceStyle;
  language: string;
  languageCode: string;
  provider: TTSProvider;
  previewUrl?: string;
  isPremium: boolean;
  tags: string[];
}

export interface VoiceSettings {
  voiceId: string;
  speed: number;        // 0.5 - 2.0
  pitch: number;        // -10 to 10
  volume: number;       // 0.0 - 1.0
  stability?: number;   // ElevenLabs: 0-1
  clarity?: number;     // ElevenLabs: 0-1
  style?: number;       // ElevenLabs: 0-1
}

export interface VoiceGenerationRequest {
  text: string;
  voiceSettings: VoiceSettings;
  language: string;
  outputFormat: 'mp3' | 'wav' | 'ogg';
}

export interface VoiceGenerationResponse {
  audioUrl: string;
  duration: number;
  fileSize: number;
  format: string;
}

export interface VoiceLabState {
  selectedVoice: Voice | null;
  voices: Voice[];
  settings: VoiceSettings;
  previewText: string;
  isGenerating: boolean;
  isPlaying: boolean;
  generatedAudioUrl: string | null;
  error: string | null;
}

export interface VoiceTemplate {
  id: string;
  name: string;
  description: string;
  voiceId: string;
  settings: VoiceSettings;
  language: string;
  createdAt: Date;
}

export interface ClonedVoice {
  id: string;
  userId: string;
  name: string;
  provider: string;
  providerVoiceId: string;
  sampleUrl: string | null;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
}
