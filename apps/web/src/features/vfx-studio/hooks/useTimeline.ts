// ============================================================
// useTimeline HOOK — Timeline state management
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import type { TimelineClip, TransitionType, ClipFilter, SpeedPreset, GeneratedVideo } from '../types/video.types';

let _clipIdCounter = 0;
function newClipId() { return `clip-${Date.now()}-${++_clipIdCounter}`; }

function computeStartTimes(clips: TimelineClip[]): TimelineClip[] {
  let t = 0;
  return clips.map(c => {
    const duration = Math.max(0.1, (c.sourceDuration - c.trimStart - c.trimEnd) / c.speed);
    const updated = { ...c, duration, startTime: t };
    t += duration;
    return updated;
  });
}

export function useTimeline() {
  const [clips, setClips]               = useState<TimelineClip[]>([]);
  const [selectedClipId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom]                 = useState(1);    // px per second
  const [isRendering, setIsRendering]   = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStep, setRenderStep]     = useState('');
  const [outputUrl, setOutputUrl]       = useState<string | null>(null);

  const recomputed = useMemo(() => computeStartTimes(clips), [clips]);
  const totalDuration = recomputed.reduce((s, c) => s + c.duration, 0);
  const selectedClip  = recomputed.find(c => c.id === selectedClipId) ?? null;

  // Add video as clip
  const addClip = useCallback((video: GeneratedVideo) => {
    setClips(prev => {
      const next: TimelineClip = {
        id:           newClipId(),
        trackIndex:   prev.length,
        videoId:      video.id,
        url:          video.url,
        thumbnailUrl: video.thumbnailUrl,
        label:        `Clip ${prev.length + 1}`,
        sourceDuration: video.duration,
        trimStart:    0,
        trimEnd:      0,
        duration:     video.duration,
        startTime:    0,
        speed:        1.0,
        filter:       'none',
        volume:       1.0,
        transition:   'none',
        transitionDuration: 0.5,
        isSelected:   false,
        isMuted:      false,
      };
      return computeStartTimes([...prev, next]);
    });
  }, []);

  // Remove clip
  const removeClip = useCallback((id: string) => {
    setClips(prev => computeStartTimes(
      prev.filter(c => c.id !== id).map((c, i) => ({ ...c, trackIndex: i, label: `Clip ${i + 1}` }))
    ));
    if (selectedClipId === id) setSelectedId(null);
  }, [selectedClipId]);

  // Reorder (drag-drop)
  const reorderClips = useCallback((fromIdx: number, toIdx: number) => {
    setClips(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIdx, 1);

      if (!moved) {
        return prev;
      }

      arr.splice(toIdx, 0, moved);
      return computeStartTimes(arr.map((c, i) => ({ ...c, trackIndex: i, label: `Clip ${i + 1}` })));
    });
  }, []);

  // Update single clip property
  const updateClip = useCallback((id: string, patch: Partial<TimelineClip>) => {
    setClips(prev => computeStartTimes(
      prev.map(c => c.id === id ? { ...c, ...patch } : c)
    ));
  }, []);

  // Trim
  const setTrimStart = useCallback((id: string, val: number) => {
    setClips(prev => computeStartTimes(
      prev.map(c => c.id === id ? { ...c, trimStart: Math.max(0, Math.min(val, c.sourceDuration - c.trimEnd - 0.5)) } : c)
    ));
  }, []);

  const setTrimEnd = useCallback((id: string, val: number) => {
    setClips(prev => computeStartTimes(
      prev.map(c => c.id === id ? { ...c, trimEnd: Math.max(0, Math.min(val, c.sourceDuration - c.trimStart - 0.5)) } : c)
    ));
  }, []);

  // Render timeline via backend
  const renderTimeline = useCallback(async (quality = '1080p', format = 'mp4') => {
    if (!recomputed.length) return;
    setIsRendering(true);
    setRenderProgress(0);
    setOutputUrl(null);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/timeline/render`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ clips: recomputed, format, quality, aspectRatio: '16:9', fps: 30 }),
      });
      if (!res.ok) throw new Error(`Render failed: ${res.statusText}`);
      const { jobId } = await res.json();

      // Poll
      const deadline = Date.now() + 15 * 60 * 1000;
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API_BASE}/api/timeline/${jobId}/status`);
        const data = await poll.json();
        setRenderProgress(data.progress);
        setRenderStep(data.step || '');
        if (data.status === 'done') { setOutputUrl(data.outputUrl); break; }
        if (data.status === 'error') throw new Error(data.error);
      }
    } catch (err) {
      console.error('Timeline render error:', err);
    } finally {
      setIsRendering(false);
    }
  }, [recomputed]);

  return {
    clips: recomputed,
    selectedClip, selectedClipId, setSelectedId,
    zoom, setZoom,
    totalDuration,
    isRendering, renderProgress, renderStep, outputUrl,
    addClip, removeClip, reorderClips, updateClip,
    setTrimStart, setTrimEnd,
    renderTimeline,
  };
}

