// ============================================================
// VIDEO STUDIO - MAIN COMPONENT
// ============================================================

import React from 'react';
import { VideoStudioProvider } from '../../context/VideoStudioProvider';
import { PromptInputPanel } from './PromptInputPanel';
import { VideoDisplayPanel } from './VideoDisplayPanel';
import { TemplatePanel } from './TemplatePanel';
import { GenerationEstimator } from './GenerationEstimator';
import { ImportVideoPanel } from './ImportVideoPanel';
import { Navbar } from './Navbar';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AutoDubPanel } from './AutoDubPanel';
import { BackgroundRemovalPanel } from './BackgroundRemovalPanel';
import { CaptionEditor } from './CaptionEditor';
import { ExportPanel } from './ExportPanel';
import { MusicPanel } from './MusicPanel';
import { TimelineEditor } from './TimelineEditor';
import { TitlesPanel } from './TitlesPanel';
import { VFXPanel } from './VFXPanel';
import { VideoEditPanel } from './VideoEditPanel';
import { VoiceLab } from './VoiceLab';
import { WatermarkPanel } from './WatermarkPanel';
import { Tabs } from '../Common/Tabs';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import styles from '../../styles/VideoStudio.module.css';
import '../../styles/videoStudio.variables.css';
import '../../styles/animations.css';

function VideoStudioInner() {
  const { activeTab, setActiveTab, startGeneration, canGenerate, generationStatus, generationProgress, generationError, generationFailedClips, validPromptCount, activeTemplate, selectedVideo, addImportedVideo } = useVideoStudio();

  const registerProcessedVideo = (url: string, label: string) => {
    if (!selectedVideo) return;
    const id = /\/api\/videos\/([^/]+)\/content/.exec(url)?.[1] ?? `processed-${Date.now()}`;
    addImportedVideo({
      id,
      url,
      thumbnailUrl: selectedVideo.thumbnailUrl ?? '',
      duration: selectedVideo.duration,
      format: 'mp4',
      quality: selectedVideo.quality,
      aspectRatio: selectedVideo.aspectRatio,
      fileSize: 0,
      filename: label,
    });
  };

  const sideTabs = [
    { id: 'prompts',    label: 'Prompts',    icon: '📝', badge: validPromptCount },
    { id: 'import',     label: 'Import',     icon: '📥' },
    { id: 'template',   label: 'Template',   icon: '🎯', badge: activeTemplate ? 1 : undefined },
    { id: 'timeline',   label: 'Timeline',   icon: '🎬' },
    { id: 'titles',     label: 'Titles',     icon: '🔤' },
    { id: 'vfx',        label: 'VFX',        icon: '🎨' },
    { id: 'ai-vfx',    label: 'AI VFX',     icon: '🤖' },
    { id: 'pro',       label: 'Pro Studio', icon: '⚙️' },
    { id: 'analytics', label: 'Analytics',  icon: '📊' },
    { id: 'publish',   label: 'Publish',    icon: '🚀' },
    { id: 'settings',  label: 'Settings',   icon: '⚙️' },
    { id: 'regenerate', label: 'Regenerate', icon: '🎞️' },
    { id: 'lipsync',    label: 'Lip Sync',   icon: '🗣️' },
    { id: 'dub',        label: 'Auto-Dub',   icon: '🌐' },
    { id: 'voice',      label: 'Voice',      icon: '🎙️' },
    { id: 'captions',   label: 'Captions',   icon: '💬' },
    { id: 'bgremove',   label: 'BG Remove',  icon: '🪄' },
    { id: 'watermark',  label: 'Watermark',  icon: '🏷️' },
    { id: 'music',      label: 'Music',      icon: '🎵' },
    { id: 'export',     label: 'Export',     icon: '⬇️' },
  ];
  const availableTabs = new Set(['prompts', 'import', 'template', 'timeline', 'titles', 'vfx', 'analytics', 'dub', 'voice', 'captions', 'bgremove', 'watermark', 'music', 'export']);

  return (
    <div className={styles.studio}>
      {/* Header / Navbar — single source of truth for activeTab via context,
          so Voice/Captions buttons here and the side Tabs always stay in sync */}
      <Navbar />

      {/* Body */}
      <div className={styles.studioBody}>
        {/* Left panel */}
        <div className={styles.sidePanel}>
          <Tabs
            tabs={sideTabs.map(t => ({
              id: t.id,
              label: t.label,
              ...(typeof t.badge === 'number' ? { badge: t.badge } : {}),
            }))}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as typeof activeTab)}
            size="sm"
          />

          <div style={{ background: 'var(--vs-bg-card)', border: '1px solid var(--vs-border)', borderRadius: 'var(--vs-radius-lg)', padding: '20px', flex: 1 }}>
            {!availableTabs.has(activeTab) && (
              <div role="status" style={{ padding: '18px', border: '1px solid rgba(245,158,11,.25)', borderRadius: '12px', background: 'rgba(245,158,11,.06)' }}>
                <h3 style={{ margin: '0 0 8px', color: 'var(--vs-text-primary)', fontSize: '14px' }}>Module not installed</h3>
                <p style={{ margin: 0, color: 'var(--vs-text-muted)', fontSize: '12px', lineHeight: 1.6 }}>
                  This control needs its matching local processing engine or server route. It is intentionally paused so the studio never shows fake progress or success.
                </p>
              </div>
            )}
            {availableTabs.has(activeTab) && <>
            {activeTab === 'prompts'    && <PromptInputPanel />}
            {activeTab === 'import'     && <ImportVideoPanel />}
            {activeTab === 'template'   && <TemplatePanel />}
            {activeTab === 'timeline'   && <TimelineEditor />}
            {activeTab === 'titles'     && <TitlesPanel videoId={selectedVideo?.id ?? null} videoDuration={selectedVideo?.duration ?? 0} onApplied={(url) => registerProcessedVideo(url, 'Titled video')} />}
            {activeTab === 'vfx'        && <VFXPanel videoId={selectedVideo?.id ?? null} onApplied={(url) => registerProcessedVideo(url, 'VFX video')} />}
            {activeTab === 'analytics'  && <AnalyticsDashboard />}
            {activeTab === 'dub'        && <AutoDubPanel videoId={selectedVideo?.id ?? null} onDubComplete={(url) => registerProcessedVideo(url, 'Auto-dubbed video')} />}
            {activeTab === 'voice'      && <VoiceLab />}
            {activeTab === 'captions'   && <CaptionEditor />}
            {activeTab === 'bgremove'   && <BackgroundRemovalPanel />}
            {activeTab === 'watermark'  && <WatermarkPanel videoId={selectedVideo?.id ?? null} onWatermarkApplied={(url) => registerProcessedVideo(url, 'Watermarked video')} />}
            {activeTab === 'music'      && <MusicPanel videoId={selectedVideo?.id ?? null} onMusicApplied={(url) => registerProcessedVideo(url, 'Music mix')} />}
            {activeTab === 'export'     && <ExportPanel />}
            </>}
          </div>

          {/* Active template badge */}
          {activeTemplate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 10px', marginBottom: '6px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '8px',
            }}>
              <span style={{ fontSize: '14px' }}>{activeTemplate.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#6366f1' }}>
                  {activeTemplate.name}
                </p>
                <p style={{ margin: 0, fontSize: '10px', color: 'var(--vs-text-muted)' }}>
                  {activeTemplate.aspectRatio} · {activeTemplate.quality} · Veo {activeTemplate.veoModel.includes('lite') ? 'Lite' : activeTemplate.veoModel.includes('fast') ? 'Fast' : 'Quality'}
                </p>
              </div>
            </div>
          )}

          {/* Cost + time estimator (Level 2 Phase A2) */}
          <GenerationEstimator clipCount={validPromptCount} />

          {/* Generate button */}
          <button
            onClick={startGeneration}
            disabled={!canGenerate}
            className={styles.generateBtn}
          >
            {generationStatus === 'generating'
              ? `⚡ Generating... ${Math.round(generationProgress)}%`
              : generationStatus === 'error'
                ? '↻ Retry Generation'
              : activeTemplate
                ? `🚀 Generate ${activeTemplate.name} Video`
                : '🚀 Generate Video'}
          </button>

          {generationStatus === 'generating' && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${generationProgress}%` }} />
            </div>
          )}

          {generationStatus === 'error' && generationError && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--vs-error, #ef4444)' }}>
              ⚠️ {generationError}
            </p>
          )}

          {generationFailedClips && generationFailedClips.length > 0 && (
            <div style={{
              margin: '8px 0 0', padding: '10px', borderRadius: '8px',
              background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)',
              fontSize: '11px', color: 'var(--vs-text-secondary)',
            }}>
              ⚠️ Video ban gaya, lekin {generationFailedClips.length} clip{generationFailedClips.length > 1 ? 's' : ''} {generationFailedClips.length > 1 ? 'retries' : 'retries'} ke baad bhi fail ho gayi (skip kar di gayi): clip #{generationFailedClips.map(c => c.index + 1).join(', #')}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className={styles.mainPanel}>
          <VideoDisplayPanel />
          <VideoEditPanel />
        </div>
      </div>
    </div>
  );
}

export function VideoStudio() {
  return (
    <VideoStudioProvider>
      <VideoStudioInner />
    </VideoStudioProvider>
  );
}

