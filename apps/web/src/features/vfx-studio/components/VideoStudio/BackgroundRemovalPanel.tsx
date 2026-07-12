// ============================================================
// BACKGROUND REMOVAL PANEL
// Uses MediaPipe (client-side) to remove/blur/replace the
// background of the selected video. No backend cost.
// ============================================================

import React, { useRef, useState } from 'react';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import {
  removeBackgroundFromVideo,
  type BackgroundMode,
} from '../../utils/mediapipeSegmenter.util';

const MODES: { id: BackgroundMode; label: string; icon: string }[] = [
  { id: 'transparent', label: 'Transparent', icon: '🟦' },
  { id: 'blur', label: 'Blur', icon: '🌫️' },
  { id: 'color', label: 'Green Screen', icon: '🟩' },
  { id: 'image', label: 'Custom BG', icon: '🖼️' },
];

export function BackgroundRemovalPanel() {
  const { selectedVideo } = useVideoStudio();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<BackgroundMode>('blur');
  const [color, setColor] = useState('#00FF00');
  const [blurPx, setBlurPx] = useState(12);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!selectedVideo) {
    return (
      <div style={panelEmptyStyle}>
        <p style={{ color: 'var(--vs-text-muted)', fontSize: '14px', margin: 0 }}>
          Generate a video first to remove its background.
        </p>
      </div>
    );
  }

  const handleBgImageUpload = (file: File) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setBgImage(img);
    img.src = URL.createObjectURL(file);
  };

  const handleProcess = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    try {
      const blob = await removeBackgroundFromVideo(videoRef.current, {
        mode,
        color,
        blurPx,
        ...(bgImage ? { bgImage } : {}),
        onProgress: setProgress,
      });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Background removal failed:', err);
      setError(err instanceof Error ? err.message : 'Background removal failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={panelStyle}>
      <h4 style={titleStyle}>🪄 Background Removal (MediaPipe)</h4>

      {/* Hidden source video used as the segmentation input */}
      <video
        ref={videoRef}
        src={selectedVideo.url}
        crossOrigin="anonymous"
        muted
        playsInline
        style={{ display: 'none' }}
      />

      {/* Mode selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              ...toolBtnStyle,
              borderColor: mode === m.id ? 'var(--vs-primary)' : 'var(--vs-border)',
              background: mode === m.id ? 'rgba(99,102,241,0.15)' : 'var(--vs-bg-elevated)',
              color: mode === m.id ? 'var(--vs-primary)' : 'var(--vs-text-secondary)',
            }}
          >
            <span style={{ fontSize: '18px' }}>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode-specific options */}
      {mode === 'color' && (
        <div style={optionsBoxStyle}>
          <label style={{ fontSize: '13px', color: 'var(--vs-text-secondary)' }}>
            Background Color
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ marginLeft: '8px', verticalAlign: 'middle' }}
            />
          </label>
        </div>
      )}

      {mode === 'blur' && (
        <div style={optionsBoxStyle}>
          <label style={{ fontSize: '13px', color: 'var(--vs-text-secondary)' }}>
            Blur Strength: {blurPx}px
            <input
              type="range"
              min={2}
              max={40}
              value={blurPx}
              onChange={(e) => setBlurPx(Number(e.target.value))}
              style={{ width: '100%', marginTop: '6px' }}
            />
          </label>
        </div>
      )}

      {mode === 'image' && (
        <div style={optionsBoxStyle}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleBgImageUpload(e.target.files[0])}
            style={{ fontSize: '12px', color: 'var(--vs-text-secondary)' }}
          />
          {bgImage && (
            <p style={{ fontSize: '12px', color: 'var(--vs-text-muted)', margin: '6px 0 0' }}>
              Custom background loaded ✓
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={isProcessing || (mode === 'image' && !bgImage)}
        style={{
          padding: '10px 16px',
          background: 'var(--vs-primary)',
          border: 'none',
          borderRadius: '6px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          opacity: mode === 'image' && !bgImage ? 0.5 : 1,
        }}
      >
        {isProcessing ? `Processing... ${progress}%` : '✨ Remove Background'}
      </button>

      {isProcessing && (
        <div style={progressTrackStyle}>
          <div style={{ ...progressFillStyle, width: `${progress}%` }} />
        </div>
      )}

      {error && (
        <p style={{ fontSize: '12px', color: 'var(--vs-danger, #ef4444)', margin: 0 }}>{error}</p>
      )}

      {resultUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <video src={resultUrl} controls style={{ width: '100%', borderRadius: '8px' }} />
          <a
            href={resultUrl}
            download="background-removed.webm"
            style={{
              textAlign: 'center',
              padding: '8px 16px',
              background: 'var(--vs-success, #22c55e)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ⬇ Download Result
          </a>
        </div>
      )}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: 'var(--vs-bg-card)',
  border: '1px solid var(--vs-border)',
  borderRadius: 'var(--vs-radius-lg)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const panelEmptyStyle: React.CSSProperties = {
  background: 'var(--vs-bg-card)',
  border: '1px solid var(--vs-border)',
  borderRadius: 'var(--vs-radius-lg)',
  padding: '32px',
  textAlign: 'center',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 700,
  color: 'var(--vs-text-primary)',
};

const toolBtnStyle: React.CSSProperties = {
  padding: '10px 8px',
  border: '1px solid',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  transition: 'all var(--vs-transition-fast)',
};

const optionsBoxStyle: React.CSSProperties = {
  background: 'var(--vs-bg-elevated)',
  borderRadius: '8px',
  padding: '16px',
};

const progressTrackStyle: React.CSSProperties = {
  width: '100%',
  height: '6px',
  background: 'var(--vs-bg-elevated)',
  borderRadius: '999px',
  overflow: 'hidden',
};

const progressFillStyle: React.CSSProperties = {
  height: '100%',
  background: 'var(--vs-primary)',
  transition: 'width 0.2s ease',
};

