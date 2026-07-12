// ============================================================
// useVideoStudio HOOK
// ============================================================

import { useState } from 'react';
import { useVideoStudioContext } from '../context/VideoStudioContext';
import { DEFAULT_FORMAT, DEFAULT_QUALITY, DEFAULT_ASPECT_RATIO, MAX_PROMPT_COUNT } from '../constants/videoFormats';
import { PLATFORM_TEMPLATES, type PlatformTemplate } from '../config/platformTemplates.config';

export function useVideoStudio() {
  const ctx = useVideoStudioContext();

  // Active platform template — null = no template (use defaults)
  const [activeTemplate, setActiveTemplate] = useState<PlatformTemplate | null>(null);

  const canGenerate =
    ctx.project.prompts.some(p => p.isValid) &&
    ctx.generationStatus !== 'generating';

  const canAddPrompt = ctx.project.prompts.length < MAX_PROMPT_COUNT;

  const validPromptCount = ctx.project.prompts.filter(p => p.isValid).length;

  const startGeneration = async () => {
    if (!canGenerate) return;
    const selectedVoice = ctx.voiceLabState.selectedVoice;

    await ctx.generateVideo({
      prompts: ctx.project.prompts.filter(p => p.isValid),
      format: activeTemplate?.format ?? DEFAULT_FORMAT,
      quality: activeTemplate?.quality ?? DEFAULT_QUALITY,
      aspectRatio: activeTemplate?.aspectRatio ?? DEFAULT_ASPECT_RATIO,
      language: ctx.selectedLanguage,
      ...(selectedVoice
        ? {
            voiceSettings: {
              voiceId: selectedVoice.id,
              speed: ctx.voiceLabState.settings.speed,
              pitch: ctx.voiceLabState.settings.pitch,
            },
          }
        : {}),
    });
  };

  const selectedVideo = ctx.project.videos.find(v => v.id === ctx.project.selectedVideoId) ?? null;

  return {
    ...ctx,
    canGenerate,
    canAddPrompt,
    validPromptCount,
    selectedVideo,
    startGeneration,
    activeTemplate,
    setActiveTemplate,
    templates: PLATFORM_TEMPLATES,
  };
}

