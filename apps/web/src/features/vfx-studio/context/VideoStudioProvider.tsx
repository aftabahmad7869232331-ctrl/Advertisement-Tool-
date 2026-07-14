// ============================================================
// VIDEO STUDIO PROVIDER
// ============================================================

import React, { useState, useCallback, useRef } from 'react';
import { VideoStudioContext, defaultProject, defaultVoiceLabState, defaultCaptionState } from './VideoStudioContext';
import { MAX_PROMPT_COUNT, DEFAULT_CLIP_DURATION } from '../constants/videoFormats';
import type { VideoStudioContextValue } from './VideoStudioContext';
import type { VideoProject, VideoPrompt, VideoGenerationRequest, VideoExportOptions, VideoStatus } from '../types/video.types';
import type { VoiceLabState } from '../types/voice.types';
import type { CaptionEditorState } from '../types/caption.types';
import { videoGenerationService } from '../services/videoGeneration.service';
import { videoExportService } from '../services/videoExport.service';
import { authenticatedFetch } from '../../../services/auth';

let promptCounter = 0;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++promptCounter}`;
}

// Naya project banate hi 20 empty prompt boxes (clips) ready rehte hain.
// Product scope: 5 clips x 6 seconds = maximum 30-second video.
function createInitialPrompts(): VideoPrompt[] {
  return Array.from({ length: MAX_PROMPT_COUNT }, (_, i) => ({
    id: generateId('prompt'),
    index: i,
    text: '',
    duration: DEFAULT_CLIP_DURATION,
    isValid: false,
    charCount: 0,
  }));
}

export function VideoStudioProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<VideoProject>({
    ...defaultProject,
    id: generateId('project'),
    prompts: createInitialPrompts(),
  });
  const [generationStatus, setGenerationStatus] = useState<VideoStatus>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationFailedClips, setGenerationFailedClips] = useState<{ index: number; prompt: string; error: string }[] | null>(null);
  const [voiceLabState, setVoiceLabState] = useState<VoiceLabState>(defaultVoiceLabState);
  const [captionState, setCaptionState] = useState<CaptionEditorState>(defaultCaptionState);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompts' | 'import' | 'template' | 'timeline' | 'titles' | 'vfx' | 'ai-vfx' | 'pro' | 'analytics' | 'publish' | 'settings' | 'regenerate' | 'lipsync' | 'dub' | 'voice' | 'captions' | 'bgremove' | 'watermark' | 'music' | 'export'>('prompts');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const abortRef = useRef<AbortController | null>(null);
  const activeJobIdRef = useRef<string | null>(null);

  const addPrompt = useCallback(() => {
    setProject(prev => {
      if (prev.prompts.length >= MAX_PROMPT_COUNT) return prev;
      const newPrompt: VideoPrompt = {
        id: generateId('prompt'),
        index: prev.prompts.length,
        text: '',
        duration: DEFAULT_CLIP_DURATION,
        isValid: false,
        charCount: 0,
      };
      return { ...prev, prompts: [...prev.prompts, newPrompt], updatedAt: new Date() };
    });
  }, []);

  const removePrompt = useCallback((id: string) => {
    setProject(prev => ({
      ...prev,
      prompts: prev.prompts.filter(p => p.id !== id).map((p, i) => ({ ...p, index: i })),
      updatedAt: new Date(),
    }));
  }, []);

  const updatePrompt = useCallback((id: string, update: string | Partial<Pick<VideoPrompt, 'text' | 'style' | 'mood'>>) => {
    const patch = typeof update === 'string' ? { text: update } : update;
    setProject(prev => ({
      ...prev,
      prompts: prev.prompts.map(p =>
        p.id === id
          ? {
              ...p,
              ...patch,
              charCount: patch.text !== undefined ? patch.text.length : p.charCount,
              isValid:   patch.text !== undefined ? patch.text.trim().length >= 10 : p.isValid,
            }
          : p
      ),
      updatedAt: new Date(),
    }));
  }, []);

  const reorderPrompts = useCallback((fromIndex: number, toIndex: number) => {
    setProject(prev => {
      const prompts = [...prev.prompts];
      const [moved] = prompts.splice(fromIndex, 1);

      if (!moved) {
        return prev;
      }

      prompts.splice(toIndex, 0, moved);
      return { ...prev, prompts: prompts.map((p, i) => ({ ...p, index: i })), updatedAt: new Date() };
    });
  }, []);

  const generateVideo = useCallback(async (request: VideoGenerationRequest) => {
    abortRef.current = new AbortController();
    setGenerationStatus('generating');
    setGenerationProgress(0);
    setGenerationError(null);
    setGenerationFailedClips(null);
    try {
      const response = await videoGenerationService.generate(request, (progress) => {
        setGenerationProgress(progress);
      }, (jobId) => { activeJobIdRef.current = jobId; }, `studio-${project.id}-${Date.now()}`);
      setProject(prev => ({
        ...prev,
        videos: [...prev.videos, {
          id: response.video?.id ?? response.jobId,
          projectId: prev.id,
          url: response.video?.url ?? response.videoUrl ?? '',
          thumbnailUrl: '',
          duration: response.video?.durationSeconds ?? 0,
          format: request.format,
          quality: request.quality,
          aspectRatio: request.aspectRatio,
          fileSize: response.video?.sizeBytes ?? 0,
          createdAt: new Date(),
          status: 'ready',
          promptIds: request.prompts.map(p => p.id),
          ...(response.provider ? { provider: response.provider } : {}),
          ...(response.model ? { model: response.model } : {}),
          ...(response.video?.mimeType ? { mimeType: response.video.mimeType } : {}),
          ...(response.video ? {
            width: response.video.width,
            height: response.video.height,
            fps: response.video.fps,
            codec: response.video.codec,
            ...(response.video.temporary !== undefined ? { temporary: response.video.temporary } : {}),
            ...(response.video.expiresAt ? { expiresAt: response.video.expiresAt } : {}),
            ...(response.video.savedAt ? { savedAt: response.video.savedAt } : {}),
          } : {}),
        }],
        selectedVideoId: response.video?.id ?? response.jobId,
        status: 'ready',
        updatedAt: new Date(),
      }));
      // Level 2 Phase B2: kuch clips retries ke baad bhi fail ho sakti
      // hain (video phir bhi baaki clips ke saath ban jaata hai) —
      // ye info ab UI ko dikhti hai, chupti nahi
      if (response.failedClips?.length) {
        setGenerationFailedClips(response.failedClips);
      }
      setGenerationStatus('ready');
      activeJobIdRef.current = null;
    } catch (err) {
      // Pehle error yahan silently swallow ho jaata tha — user ko
      // sirf "error" status dikhta tha, WHY pata nahi chalta tha
      setGenerationError(err instanceof Error ? err.message : 'Video generation fail ho gayi.');
      setGenerationStatus('error');
    }
  }, []);

  const cancelGeneration = useCallback(() => {
    abortRef.current?.abort();
    if (activeJobIdRef.current) void videoGenerationService.cancel(activeJobIdRef.current);
    activeJobIdRef.current = null;
    setGenerationStatus('idle');
    setGenerationProgress(0);
  }, []);

  // ── Auto-save every 2 minutes ───────────────────────────
  React.useEffect(() => {
    if (!project.id || project.status === 'generating') return;
    const timer = setInterval(async () => {
      try {
        await authenticatedFetch(`${import.meta.env.VITE_API_URL || ''}/api/workspace/projects/${encodeURIComponent(project.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...project, autoSavedAt: new Date().toISOString() }),
        });
      } catch { /* non-fatal */ }
    }, 2 * 60 * 1000); // every 2 min
    return () => clearInterval(timer);
  }, [project.id, project.status]);
  const addImportedVideo = useCallback((videoData: {
    id: string; url: string; thumbnailUrl: string;
    duration: number; format: string; quality: string;
    aspectRatio: string; fileSize: number; filename: string;
    temporary?: boolean; expiresAt?: string;
  }) => {
    setProject(prev => ({
      ...prev,
      videos: [...prev.videos, {
        id:           videoData.id,
        projectId:    prev.id,
        url:          videoData.url,
        thumbnailUrl: videoData.thumbnailUrl,
        duration:     videoData.duration,
        format:       videoData.format as any,
        quality:      videoData.quality as any,
        aspectRatio:  videoData.aspectRatio as any,
        fileSize:     videoData.fileSize,
        createdAt:    new Date(),
        status:       'ready',
        promptIds:    [],
        label:        videoData.filename,
        ...(videoData.temporary !== undefined ? { temporary: videoData.temporary } : {}),
        ...(videoData.expiresAt ? { expiresAt: videoData.expiresAt } : {}),
      }],
      selectedVideoId: videoData.id,
      updatedAt: new Date(),
    }));
  }, []);

  const updateVoiceLab = useCallback((updates: Partial<VoiceLabState>) => {
    setVoiceLabState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateCaptionState = useCallback((updates: Partial<CaptionEditorState>) => {
    setCaptionState(prev => ({ ...prev, ...updates }));
  }, []);

  const exportVideo = useCallback(async (options: VideoExportOptions) => {
    setIsExporting(true);
    try {
      const selectedVideo = project.videos.find(v => v.id === project.selectedVideoId);
      if (!selectedVideo) throw new Error('No video selected');
      await videoExportService.export(selectedVideo.id, options);
    } finally {
      setIsExporting(false);
    }
  }, [project]);

  const value: VideoStudioContextValue = {
    project, setProject,
    addPrompt, removePrompt, updatePrompt, reorderPrompts,
    generationStatus, generationProgress, generationError, generationFailedClips, generateVideo, cancelGeneration,
    addImportedVideo,
    voiceLabState, updateVoiceLab,
    captionState, updateCaptionState,
    exportVideo, isExporting,
    activeTab, setActiveTab,
    selectedLanguage, setSelectedLanguage,
  };

  return (
    <VideoStudioContext.Provider value={value}>
      {children}
    </VideoStudioContext.Provider>
  );
}

