import React, { useEffect, useState } from 'react';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import { videoExportService } from '../../services/videoExport.service';
import type { VideoFormat, VideoQuality } from '../../types/video.types';

export function ExportPanel() {
  const { selectedVideo } = useVideoStudio();
  const [format, setFormat] = useState<VideoFormat>('mp4');
  const [quality, setQuality] = useState<VideoQuality>('1080p');
  const [estimate, setEstimate] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedVideo) return;
    void videoExportService.estimateExportSize(selectedVideo.id, { format, quality, includeSubtitles: true, watermark: true })
      .then(setEstimate);
  }, [selectedVideo, format, quality]);

  if (!selectedVideo) return <p style={{ color: 'var(--vs-text-muted)' }}>Export ke liye pehle video select karein.</p>;

  const run = async () => {
    setBusy(true); setError(null);
    try { await videoExportService.export(selectedVideo.id, { format, quality, includeSubtitles: true, watermark: true }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Export fail ho gaya.'); }
    finally { setBusy(false); }
  };

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <h3 style={{ margin: 0 }}>⬇️ Local FFmpeg Export</h3>
    <label>Format <select value={format} onChange={(e) => setFormat(e.target.value as VideoFormat)}><option value="mp4">MP4</option><option value="webm">WebM</option><option value="mov">MOV</option></select></label>
    <label>Quality <select value={quality} onChange={(e) => setQuality(e.target.value as VideoQuality)}><option value="720p">720p</option><option value="1080p">1080p</option><option value="4k">4K</option></select></label>
    <p style={{ margin: 0, color: 'var(--vs-text-muted)', fontSize: 12 }}>Estimated size: {(estimate / 1024 / 1024).toFixed(1)} MB</p>
    {error && <p style={{ color: 'var(--text-danger)' }}>⚠️ {error}</p>}
    <button onClick={run} disabled={busy} style={{ padding: 11, border: 0, borderRadius: 8, background: 'var(--vs-primary)', color: '#fff', cursor: 'pointer' }}>{busy ? 'Exporting...' : `Export ${format.toUpperCase()}`}</button>
  </div>;
}
