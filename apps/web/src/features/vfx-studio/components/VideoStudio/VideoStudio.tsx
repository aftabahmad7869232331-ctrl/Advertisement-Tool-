// ============================================================
// VIDEO STUDIO - MAIN COMPONENT
// ============================================================

import React from 'react';
import { VideoStudioProvider } from '../../context/VideoStudioProvider';
import { PromptInputPanel } from './PromptInputPanel';
import { VideoDisplayPanel } from './VideoDisplayPanel';
import { VideoEditPanel } from './VideoEditPanel';
import { BackgroundRemovalPanel } from './BackgroundRemovalPanel';
import { WatermarkPanel } from './WatermarkPanel';
import { MusicPanel } from './MusicPanel';
import { TemplatePanel } from './TemplatePanel';
import { VideoDropzone } from './VideoDropzone';
import { LipSyncPanel } from './LipSyncPanel';
import { AutoDubPanel } from './AutoDubPanel';
import { GenerationEstimator } from './GenerationEstimator';
import { TimelineEditor } from './TimelineEditor';
import { TitlesPanel } from './TitlesPanel';
import { VFXPanel } from './VFXPanel';
import { AIVFXPanel } from './AIVFXPanel';
import { ProStudioPanel } from './ProStudioPanel';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { PublishPanel } from './PublishPanel';
import { ImportVideoPanel } from './ImportVideoPanel';
import { SettingsPanel } from './SettingsPanel';
import { VoiceLab } from './VoiceLab';
import { CaptionEditor } from './CaptionEditor';
import { Navbar } from './Navbar';
import { Tabs } from '../Common/Tabs';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import styles from '../../styles/VideoStudio.module.css';
import '../../styles/videoStudio.variables.css';
import '../../styles/animations.css';

function VideoStudioInner() {
  const { activeTab, setActiveTab, startGeneration, canGenerate, generationStatus, generationProgress, generationError, generationFailedClips, validPromptCount, activeTemplate, project } = useVideoStudio();
  const selectedVideo = project.videos.find(v => v.id === project.selectedVideoId) ?? project.videos[project.videos.length - 1];

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
            {activeTab === 'prompts'    && <PromptInputPanel />}
            {activeTab === 'import'     && <ImportVideoPanel />}
            {activeTab === 'template'   && <TemplatePanel />}
            {activeTab === 'timeline'   && <TimelineEditor />}
            {activeTab === 'titles'     && (
              <TitlesPanel
                videoId={selectedVideo?.id ?? null}
                videoDuration={selectedVideo?.duration ?? 10}
                onApplied={url => console.log('Titles applied:', url)}
              />
            )}
            {activeTab === 'vfx'       && (
              <VFXPanel
                videoId={selectedVideo?.id ?? null}
                onApplied={url => console.log('VFX applied:', url)}
              />
            )}
            {activeTab === 'ai-vfx'   && (
              <AIVFXPanel
                videoId={selectedVideo?.id ?? null}
                mainScript={project.prompts.map(p => p.text).join(' ')}
                onBRollReady={clips => console.log('B-roll ready:', clips)}
                onStyleDone={url  => console.log('Style done:', url)}
                onBGDone={url     => console.log('BG done:', url)}
              />
            )}
            {activeTab === 'pro'      && (
              <ProStudioPanel
                videoId={selectedVideo?.id ?? null}
                videoIds={project.videos.map(v => v.id)}
                onDone={url => console.log('Pro done:', url)}
              />
            )}
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            {activeTab === 'publish'   && (
              <PublishPanel
                videoId={selectedVideo?.id ?? null}
                videoIds={project.videos.map(v => v.id)}
                videoTitle={project.name}
                aspectRatio={activeTemplate?.aspectRatio ?? '16:9'}
              />
            )}
            {activeTab === 'settings'  && <SettingsPanel />}
            {activeTab === 'regenerate' && <VideoDropzone onRegenerated={url => console.log('Regenerated:', url)} />}
            {activeTab === 'lipsync'    && (
              <LipSyncPanel
                currentVideoId={selectedVideo?.id ?? null}
                currentAudioId={null}
                onSyncComplete={url => console.log('Lip synced:', url)}
              />
            )}
            {activeTab === 'dub'        && (
              <AutoDubPanel
                videoId={selectedVideo?.id ?? null}
                onDubComplete={url => console.log('Dubbed:', url)}
              />
            )}
            {activeTab === 'voice'      && <VoiceLab />}
            {activeTab === 'captions' && <CaptionEditor />}
            {activeTab === 'bgremove'  && <BackgroundRemovalPanel />}
            {activeTab === 'watermark' && (
              <WatermarkPanel
                videoId={selectedVideo?.id ?? null}
                onWatermarkApplied={(url, id) => console.log('Watermarked:', url, id)}
              />
            )}
            {activeTab === 'music' && (
              <MusicPanel
                videoId={selectedVideo?.id ?? null}
                onMusicApplied={(url, id) => console.log('Music applied:', url, id)}
              />
            )}
            {activeTab === 'export'    && <ExportPanel />}
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

// Simple Export Panel
function ExportPanel() {
  const { exportVideo, isExporting, selectedVideo } = useVideoStudio();

  const formats = ['mp4', 'webm', 'mov'] as const;
  const qualities = ['720p', '1080p', '4k'] as const;
  const [format, setFormat] = React.useState<typeof formats[number]>('mp4');
  const [quality, setQuality] = React.useState<typeof qualities[number]>('1080p');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--vs-text-secondary)', textTransform: 'uppercase' }}>Export Settings</h4>

      <div>
        <label style={{ fontSize: '12px', color: 'var(--vs-text-muted)', display: 'block', marginBottom: '6px' }}>Format</label>
        <div style={{ display: 'flex', gap: '6px' }}>
          {formats.map(f => (
            <button key={f} onClick={() => setFormat(f)}
              style={{ padding: '6px 14px', fontSize: '13px', border: '1px solid var(--vs-border)', borderRadius: '6px', cursor: 'pointer', background: format === f ? 'var(--vs-primary)' : 'var(--vs-bg-elevated)', color: format === f ? '#fff' : 'var(--vs-text-secondary)' }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: '12px', color: 'var(--vs-text-muted)', display: 'block', marginBottom: '6px' }}>Quality</label>
        <div style={{ display: 'flex', gap: '6px' }}>
          {qualities.map(q => (
            <button key={q} onClick={() => setQuality(q)}
              style={{ padding: '6px 14px', fontSize: '13px', border: '1px solid var(--vs-border)', borderRadius: '6px', cursor: 'pointer', background: quality === q ? 'var(--vs-primary)' : 'var(--vs-bg-elevated)', color: quality === q ? '#fff' : 'var(--vs-text-secondary)' }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => exportVideo({ format, quality, includeSubtitles: false, burnCaptions: false })}
        disabled={!selectedVideo || isExporting}
        style={{ width: '100%', padding: '12px', background: 'var(--vs-success)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: !selectedVideo ? 'not-allowed' : 'pointer', opacity: !selectedVideo ? 0.5 : 1 }}>
        {isExporting ? '⏳ Exporting...' : '⬇ Export Video'}
      </button>
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

