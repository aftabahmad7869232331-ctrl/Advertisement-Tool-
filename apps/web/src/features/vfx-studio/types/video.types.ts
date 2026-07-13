// ============================================================
// VIDEO TYPES - Frontend
// ============================================================

export type VideoStatus = 'idle' | 'queued' | 'generating' | 'processing' | 'retrying' | 'ready' | 'failed' | 'cancelled' | 'timed_out' | 'error';
export type VideoFormat = 'mp4' | 'webm' | 'mov' | 'avi' | 'mkv';
export type VideoQuality = '360p' | '480p' | '720p' | '1080p' | '4k';
export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '21:9';

export interface VideoPrompt {
  id: string;
  index: number;
  text: string;
  duration: number;       // seconds for this clip
  style?: string;
  mood?: string;
  isValid: boolean;
  charCount: number;
}

export interface GeneratedVideo {
  id: string;
  projectId: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  format: VideoFormat;
  quality: VideoQuality;
  aspectRatio: VideoAspectRatio;
  fileSize: number;
  createdAt: Date;
  status: VideoStatus;
  promptIds: string[];
  provider?: string;
  model?: string;
  mimeType?: string;
  width?: number | null;
  height?: number | null;
  fps?: number | null;
  codec?: string | null;
}

export interface VideoProject {
  id: string;
  name: string;
  description?: string;
  prompts: VideoPrompt[];
  videos: GeneratedVideo[];
  selectedVideoId?: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  status: VideoStatus;
}

export interface VideoGenerationRequest {
  prompts: VideoPrompt[];
  format: VideoFormat;
  quality: VideoQuality;
  aspectRatio: VideoAspectRatio;
  language: string;
  voiceSettings?: {
    voiceId: string;
    speed: number;
    pitch: number;
  };
}

export interface VideoGenerationResponse {
  jobId: string;
  status: VideoStatus;
  estimatedTime: number;  // seconds
  videoUrl?: string;
  error?: string;
  progress?: number;
  provider?: string;
  model?: string;
  video?: {
    id: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    durationSeconds: number | null;
    width: number | null;
    height: number | null;
    fps: number | null;
    codec: string | null;
  };
  /** Level 2 Phase B2: retries ke baad bhi fail hui clips (agar koi hui to) */
  failedClips?: { index: number; prompt: string; error: string }[];
}

export interface VideoEditOperation {
  type: 'trim' | 'crop' | 'rotate' | 'speed' | 'filter' | 'text_overlay' | 'merge';
  params: Record<string, unknown>;
}

export interface VideoEditRequest {
  videoId: string;
  operations: VideoEditOperation[];
  outputFormat?: VideoFormat;
  outputQuality?: VideoQuality;
}

export interface VideoExportOptions {
  format: VideoFormat;
  quality: VideoQuality;
  includeSubtitles: boolean;
  subtitleFormat?: 'srt' | 'vtt' | 'ass';
  watermark?: boolean;
  burnCaptions?: boolean;
}

// ============================================================
// TIMELINE TYPES (VFX Editor)
// ============================================================

export type TransitionType = 'none' | 'fade' | 'dissolve' | 'zoom_in' | 'zoom_out' | 'whip_pan' | 'slide_left' | 'slide_right';
export type SpeedPreset = 0.25 | 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0 | 4.0;
export type ClipFilter = 'none' | 'cinematic' | 'warm' | 'cold' | 'noir' | 'vintage' | 'vivid';

export interface TimelineClip {
  id:           string;
  trackIndex:   number;           // position in timeline (0-based)
  videoId?:     string;           // linked GeneratedVideo id
  promptId?:    string;           // linked VideoPrompt id
  url?:         string;           // video URL (for preview)
  thumbnailUrl?: string;
  label:        string;           // display name
  // Duration / trim
  sourceDuration: number;         // original clip total duration (sec)
  trimStart:    number;           // trim from start (sec)
  trimEnd:      number;           // trim from end (sec)
  // Computed
  duration:     number;           // = sourceDuration - trimStart - trimEnd
  startTime:    number;           // position on timeline (sec, computed)
  // Effects
  speed:        SpeedPreset;      // playback speed
  filter:       ClipFilter;       // color filter
  volume:       number;           // 0.0 - 1.0
  // Transition (applied at END of this clip → next clip)
  transition:   TransitionType;
  transitionDuration: number;     // seconds (0.3 - 2.0)
  // State
  isSelected:   boolean;
  isMuted:      boolean;
}

export interface Timeline {
  clips:        TimelineClip[];
  totalDuration: number;          // sum of all clip durations (computed)
  aspectRatio:  VideoAspectRatio;
  fps:          number;           // default 30
}

export interface TimelineRenderRequest {
  clips:        TimelineClip[];
  format:       VideoFormat;
  quality:      VideoQuality;
  aspectRatio:  VideoAspectRatio;
  fps:          number;
}
