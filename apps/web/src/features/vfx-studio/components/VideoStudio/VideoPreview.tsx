// ============================================================
// VIDEO PREVIEW COMPONENT
// ============================================================

import React, { useRef, useState, useEffect } from 'react';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { formatDuration } from '../../utils/videoConverter.util';
import type { GeneratedVideo } from '../../types/video.types';

interface VideoPreviewProps {
  video: GeneratedVideo | null;
  onTimeUpdate?: (time: number) => void;
  captionEntries?: Array<{ startTime: number; endTime: number; text: string }>;
}

export function VideoPreview({ video, onTimeUpdate, captionEntries = [] }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const currentCaption = captionEntries.find(
    c => currentTime * 1000 >= c.startTime && currentTime * 1000 <= c.endTime
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onTime = () => { setCurrentTime(el.currentTime); onTimeUpdate?.(el.currentTime); };
    const onMeta = () => setDuration(el.duration);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('loadstart', () => setIsLoading(true));
    el.addEventListener('canplay', () => setIsLoading(false));
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
    };
  }, [onTimeUpdate]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) { el.pause(); setIsPlaying(false); }
    else { el.play(); setIsPlaying(true); }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  if (!video) {
    return (
      <div style={{
        background: 'var(--vs-bg-card)',
        border: '1px solid var(--vs-border)',
        borderRadius: 'var(--vs-radius-lg)',
        aspectRatio: '16/9',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '16px',
      }}>
        <div style={{ fontSize: '64px' }}>🎬</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
            No Video Yet
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--vs-text-muted)' }}>
            Add prompts and click Generate to create your video
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--vs-bg-card)', borderRadius: 'var(--vs-radius-lg)', overflow: 'hidden' }}>
      {/* Video wrapper */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', cursor: 'pointer' }}
        onClick={togglePlay}>
        <video
          ref={videoRef}
          src={video.url}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <LoadingSpinner size="lg" label="Loading video..." />
          </div>
        )}
        {/* Play overlay */}
        {!isPlaying && !isLoading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(99,102,241,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', paddingLeft: '4px',
            }}>▶</div>
          </div>
        )}
        {/* Caption overlay */}
        {currentCaption && (
          <div style={{
            position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)', color: '#fff',
            padding: '6px 16px', borderRadius: '6px',
            fontSize: '15px', fontWeight: 500, textAlign: 'center',
            maxWidth: '80%',
          }}>
            {currentCaption.text}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: '12px 16px', background: 'var(--vs-bg-elevated)' }}>
        <input
          type="range" min={0} max={duration || 100} step={0.1}
          value={currentTime} onChange={seek}
          style={{ width: '100%', accentColor: 'var(--vs-primary)', marginBottom: '8px' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={togglePlay} style={{
              background: 'var(--vs-primary)', border: 'none', borderRadius: '6px',
              color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: '14px',
            }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <span style={{ fontSize: '13px', color: 'var(--vs-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--vs-text-muted)' }}>🔊</span>
            <input type="range" min={0} max={1} step={0.05} value={volume}
              onChange={e => {
                const v = Number(e.target.value);
                setVolume(v);
                if (videoRef.current) videoRef.current.volume = v;
              }}
              style={{ width: '80px', accentColor: 'var(--vs-primary)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
