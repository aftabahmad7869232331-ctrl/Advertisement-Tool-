// ============================================================
// VIDEO DISPLAY PANEL
// ============================================================

import React from 'react';
import { VideoPreview } from './VideoPreview';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import { formatFileSize } from '../../utils/fileValidator.util';

export function VideoDisplayPanel() {
  const { selectedVideo, generationStatus, generationProgress, cancelGeneration } = useVideoStudio();

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
    </div>
  );
}
