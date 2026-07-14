// ============================================================
// IMPORT VIDEO PANEL
// ============================================================
// Client ka existing video seedha studio mein laao —
// koi AI generation nahi chahiye.
//
// Features:
//   - Multiple files ek saath drag-drop ya select
//   - Per-file upload progress bar
//   - Auto thumbnail + metadata extract (backend)
//   - Seedha Timeline/VFX/Edit mein add ho jaata hai
//   - Browser-playable MP4 and WebM
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import { authenticatedFetch } from '../../../../services/auth';

interface ImportedFile {
  id:          string;
  file:        File;
  status:      'pending' | 'uploading' | 'done' | 'error';
  progress:    number;
  result?:     {
    videoId:     string;
    url:         string;
    thumbnailUrl: string;
    duration:    number;
    width:       number;
    height:      number;
    aspectRatio: string;
    quality:     string;
    format:      string;
    fileSize:    number;
    temporary:   boolean;
    expiresAt?:  string;
  };
  error?:      string;
}

const ACCEPTED_TYPES = ['video/mp4', 'video/webm'];
const ACCEPTED_EXT   = ['.mp4', '.webm'];
const MAX_SIZE_MB    = 500;

function fmtSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

let _iid = 0;

export function ImportVideoPanel() {
  const { addImportedVideo } = useVideoStudio();
  const [files,      setFiles]      = useState<ImportedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): string | null {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXT.includes(ext) && !ACCEPTED_TYPES.includes(file.type)) {
      return `Format supported nahi: ${ext}. Browser-playable MP4 ya WebM use karo.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large: ${fmtSize(file.size)}. Max ${MAX_SIZE_MB}MB allowed.`;
    }
    return null;
  }

  async function importFile(importedFile: ImportedFile) {
    const objectUrl = URL.createObjectURL(importedFile.file);
    const metadata = await new Promise<{ duration: number; width: number; height: number }>((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => resolve({ duration: video.duration || 0, width: video.videoWidth, height: video.videoHeight });
      video.onerror = () => resolve({ duration: 0, width: 0, height: 0 });
      video.src = objectUrl;
    });
    URL.revokeObjectURL(objectUrl);

    const form = new FormData();
    form.append('file', importedFile.file);
    const response = await authenticatedFetch(`${import.meta.env.VITE_API_URL || ''}/api/video/upload`, {
      method: 'POST',
      body: form,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(error.error ?? 'Video upload fail ho gaya.');
    }
    const uploaded = await response.json() as { videoId: string; url: string; temporary: boolean; expiresAt?: string };
    const ratio = metadata.width && metadata.height ? metadata.width / metadata.height : 16 / 9;
    const data = {
      videoId: uploaded.videoId,
      url: `${import.meta.env.VITE_API_URL || ''}${uploaded.url}`,
      thumbnailUrl: '',
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      aspectRatio: ratio < 0.8 ? '9:16' : ratio < 1.15 ? '1:1' : '16:9',
      quality: metadata.height >= 2160 ? '4k' : metadata.height >= 1080 ? '1080p' : '720p',
      format: importedFile.file.name.split('.').pop()?.toLowerCase() || 'mp4',
      fileSize: importedFile.file.size,
      temporary: uploaded.temporary,
      ...(uploaded.expiresAt ? { expiresAt: uploaded.expiresAt } : {}),
    };
    setFiles(prev => prev.map(f => f.id === importedFile.id ? { ...f, status: 'done', progress: 100, result: data } : f));
    addImportedVideo({
      id: data.videoId, url: data.url, thumbnailUrl: '', duration: data.duration,
      format: data.format, quality: data.quality, aspectRatio: data.aspectRatio,
      fileSize: data.fileSize, filename: importedFile.file.name,
      temporary: data.temporary,
      ...(data.expiresAt ? { expiresAt: data.expiresAt } : {}),
    });
  }

  function handleFiles(fileList: FileList) {
    const newFiles: ImportedFile[] = [];

    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      const entry: ImportedFile = {
        id:       `import-${Date.now()}-${++_iid}`,
        file,
        status:   error ? 'error' : 'pending',
        progress: 0,
        ...(error ? { error } : {}),
      };
      newFiles.push(entry);
    });

    setFiles(prev => [...prev, ...newFiles]);

    // Upload valid files
    newFiles.filter(f => f.status === 'pending').forEach(f => {
      setFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'uploading' } : x));
      void importFile(f).catch(error => {
        setFiles(prev => prev.map(x => x.id === f.id ? {
          ...x, status: 'error', progress: 0,
          error: error instanceof Error ? error.message : 'Video upload fail ho gaya.',
        } : x));
      });
    });
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, []);

  const allDone  = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error');
  const anyDone  = files.some(f => f.status === 'done');
  const uploading = files.some(f => f.status === 'uploading');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          📥 Import Video
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Existing videos seedha studio mein laao — koi AI nahi chahiye · default 24 ghante baad auto-delete
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#6366f1' : 'var(--vs-border)'}`,
          borderRadius: '12px',
          padding: '32px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'rgba(99,102,241,0.06)' : 'transparent',
          transition: 'all .15s',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>
          {isDragging ? '📂' : uploading ? '⏳' : '📥'}
        </div>
        <p style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
          {isDragging ? 'Chhod do!' : uploading ? 'Local import ho raha hai...' : 'Videos yahan drop karo'}
        </p>
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Ya click karke select karo · Multiple files ek saath
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {['MP4', 'WebM'].map(f => (
            <span key={f} style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--vs-bg-elevated)', border: '0.5px solid var(--vs-border)', borderRadius: '20px', color: 'var(--vs-text-muted)' }}>
              {f}
            </span>
          ))}
          <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--vs-bg-elevated)', border: '0.5px solid var(--vs-border)', borderRadius: '20px', color: 'var(--vs-text-muted)' }}>
            Max {MAX_SIZE_MB}MB
          </span>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept={ACCEPTED_EXT.join(',')}
        onChange={e => e.target.files && handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.map(f => (
            <div key={f.id} style={{
              padding: '10px 12px',
              background: 'var(--vs-bg)',
              border: `1px solid ${f.status === 'done' ? 'var(--border-success, #8BC34A)' : f.status === 'error' ? 'var(--border-danger, #F09595)' : 'var(--vs-border)'}`,
              borderRadius: '9px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Thumbnail or icon */}
                <div style={{
                  width: '48px', height: '36px', borderRadius: '5px', flexShrink: 0, overflow: 'hidden',
                  background: 'var(--vs-bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {f.result?.thumbnailUrl ? (
                    <img src={f.result.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '18px' }}>
                      {f.status === 'done' ? '✅' : f.status === 'error' ? '❌' : f.status === 'uploading' ? '⏳' : '🎬'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 500, color: 'var(--vs-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.file.name}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--vs-text-muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span>{fmtSize(f.file.size)}</span>
                    {f.result && (
                      <>
                        <span>{fmtDuration(f.result.duration)}</span>
                        <span>{f.result.width}×{f.result.height}</span>
                        <span>{f.result.aspectRatio}</span>
                        <span>{f.result.quality}</span>
                      </>
                    )}
                    {f.error && <span style={{ color: 'var(--text-danger)' }}>{f.error}</span>}
                  </div>
                </div>

                {/* Status badge */}
                <span style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '20px', flexShrink: 0,
                  background: f.status === 'done' ? 'var(--bg-success, #EAF3DE)' : f.status === 'error' ? 'var(--bg-danger, #FCEBEB)' : f.status === 'uploading' ? 'rgba(99,102,241,0.1)' : 'var(--vs-bg-elevated)',
                  color: f.status === 'done' ? 'var(--text-success)' : f.status === 'error' ? 'var(--text-danger)' : f.status === 'uploading' ? '#6366f1' : 'var(--vs-text-muted)',
                  border: `0.5px solid ${f.status === 'done' ? 'var(--border-success)' : f.status === 'error' ? 'var(--border-danger)' : 'var(--vs-border)'}`,
                }}>
                  {f.status === 'done' ? 'Added ✓' : f.status === 'error' ? 'Failed' : f.status === 'uploading' ? `${f.progress}%` : 'Pending'}
                </span>
              </div>

              {/* Progress bar */}
              {f.status === 'uploading' && (
                <div style={{ height: '3px', background: 'var(--vs-border)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                  <div style={{ height: '100%', width: `${f.progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width .3s' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Success message */}
      {anyDone && (
        <div style={{
          padding: '10px 14px', borderRadius: '9px',
          background: 'var(--bg-success, #EAF3DE)', border: '1px solid var(--border-success)',
          fontSize: '12px', color: 'var(--text-success)', lineHeight: 1.6,
        }}>
          ✅ <strong>{files.filter(f => f.status === 'done').length} video(s)</strong> studio mein add ho gayi!
          <br />
          Ab <strong>🎬 Timeline</strong> tab mein jaao aur clips edit karo — Transitions, VFX, Titles, Music sab available hai.
        </div>
      )}

      {/* Clear button */}
      {files.length > 0 && allDone && (
        <button
          onClick={() => setFiles([])}
          style={{
            padding: '9px', background: 'transparent',
            border: '1px dashed var(--vs-border)', borderRadius: '8px',
            color: 'var(--vs-text-muted)', fontSize: '12px', cursor: 'pointer',
          }}>
          🔄 Aur Videos Import Karo
        </button>
      )}

      {/* How it works */}
      {files.length === 0 && (
        <div style={{ padding: '12px 14px', background: 'var(--vs-bg)', border: '0.5px solid var(--vs-border)', borderRadius: '9px', fontSize: '11px', color: 'var(--vs-text-muted)', lineHeight: 1.8 }}>
          <strong style={{ color: 'var(--vs-text-secondary)' }}>Import ke baad kya kar sakte ho:</strong><br />
          🎬 Timeline mein drag-drop edit · ✂️ Trim + Speed ramp<br />
          🎨 Color grading + LUT · 🔤 Animated titles add karo<br />
          🎵 Background music mix · 🏷️ Watermark overlay<br />
          🗣️ Lip sync · 🚀 YouTube/Instagram/TikTok publish<br />
          <br />
          <strong style={{ color: '#6366f1' }}>Koi AI nahi chahiye — seedha edit karo!</strong>
        </div>
      )}
    </div>
  );
}




