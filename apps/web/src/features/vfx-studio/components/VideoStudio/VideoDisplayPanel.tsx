// ============================================================
// VIDEO DISPLAY PANEL
// ============================================================

import React, { useState } from 'react';
import { VideoPreview } from './VideoPreview';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import { formatFileSize } from '../../utils/fileValidator.util';
import { videoGenerationService } from '../../services/videoGeneration.service';

export function VideoDisplayPanel() {
  const { selectedVideo, project, setProject, generationStatus, generationProgress, cancelGeneration } = useVideoStudio();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function keepVideo() {
    if (!selectedVideo) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await videoGenerationService.saveVideo(selectedVideo.id);
      const { expiresAt: _expiresAt, ...savedVideo } = selectedVideo;
      setProject({
        ...project,
        videos: project.videos.map(video => video.id === selectedVideo.id
          ? {
              ...savedVideo,
              temporary: false,
              ...(result.savedAt ? { savedAt: result.savedAt } : {}),
            }
          : video),
        updatedAt: new Date(),
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Video save nahi ho saka.');
    } finally {
      setIsSaving(false);
    }
  }

  const isGenerating = generationStatus === 'generating';
  const isError      = generationStatus === 'error';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Generating state */}
      {isGenerating && (
        <div style={{
          background: 'var(--vs-bg-card)',
          border: '1px solid var(--vs-primary)',
          borderRadius: 'var(--vs-radius-lg)',
          padding: '32px',
          textAlign: 'center',
        }}>
          <LoadingSpinner size="xl" label="Generating your video..." />
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--vs-text-secondary)' }}>Progress</span>
              <span style={{ fontSize: '13px', color: 'var(--vs-primary)', fontWeight: 600 }}>
                {Math.round(generationProgress)}%
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--vs-bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${generationProgress}%`,
                background: 'linear-gradient(90deg, var(--vs-primary), var(--vs-accent))',
                borderRadius: '3px', transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
          <button
            onClick={cancelGeneration}
            style={{
              marginTop: '16px', padding: '8px 20px',
              background: 'transparent', border: '1px solid var(--vs-border)',
              borderRadius: '8px', color: 'var(--vs-text-secondary)',
              cursor: 'pointer', fontSize: '13px',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid var(--vs-error)',
          borderRadius: 'var(--vs-radius-lg)',
          padding: '20px', textAlign: 'center',
        }}>
          <p style={{ margin: 0, color: 'var(--vs-error)', fontWeight: 600 }}>⚠ Generation Failed</p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--vs-text-secondary)' }}>
            Please check your prompts and try again.
          </p>
        </div>
      )}

      {/* Video player */}
      {!isGenerating && (
        <VideoPreview video={selectedVideo ?? null} />
      )}

      {/* Video metadata */}
      {selectedVideo && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}>
          {[
            { label: 'Format',  value: selectedVideo.format.toUpperCase() },
            { label: 'Quality', value: selectedVideo.quality },
            { label: 'Ratio',   value: selectedVideo.aspectRatio },
            { label: 'Size',    value: formatFileSize(selectedVideo.fileSize) },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--vs-bg-card)',
              border: '1px solid var(--vs-border)',
              borderRadius: '8px', padding: '10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--vs-text-muted)', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {selectedVideo?.temporary && (
        <div style={{
          padding: '12px 14px', borderRadius: '9px',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)',
          color: 'var(--vs-text-secondary)', fontSize: '12px', lineHeight: 1.5,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span>
              Privacy mode: ye video temporary hai
              {selectedVideo.expiresAt ? ` aur ${new Date(selectedVideo.expiresAt).toLocaleString('hi-IN')} ke baad delete hoga.` : ' aur auto-delete hoga.'}
            </span>
            <button onClick={keepVideo} disabled={isSaving} style={{
              flexShrink: 0, padding: '8px 12px', border: 0, borderRadius: '7px', cursor: isSaving ? 'wait' : 'pointer',
              background: '#6366f1', color: '#fff', fontSize: '12px', fontWeight: 600,
            }}>
              {isSaving ? 'Saving…' : 'Keep permanently'}
            </button>
          </div>
          {saveError && <div style={{ marginTop: '6px', color: 'var(--vs-error)' }}>{saveError}</div>}
        </div>
      )}
    </div>
  );
}
