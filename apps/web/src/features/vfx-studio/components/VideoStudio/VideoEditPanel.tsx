// ============================================================
// VIDEO EDIT PANEL
// ============================================================

import React, { useState } from 'react';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import { videoEditingService } from '../../services/videoEditing.service';
import { LoadingSpinner } from '../Common/LoadingSpinner';

export function VideoEditPanel() {
  const { selectedVideo, project, setProject } = useVideoStudio();
  const [isProcessing, setIsProcessing] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [textOverlay, setTextOverlay] = useState('');
  const [activeEdit, setActiveEdit] = useState<'trim' | 'speed' | 'text' | 'filter' | null>(null);

  if (!selectedVideo) {
    return (
      <div style={{
        background: 'var(--vs-bg-card)', border: '1px solid var(--vs-border)',
        borderRadius: 'var(--vs-radius-lg)', padding: '32px', textAlign: 'center',
      }}>
        <p style={{ color: 'var(--vs-text-muted)', fontSize: '14px', margin: 0 }}>
          Generate a video first to access editing tools.
        </p>
      </div>
    );
  }

  const apply = async (action: () => Promise<unknown>) => {
    setIsProcessing(true);
    try {
      const updated = await action();
      // update project videos list
    } catch (err) {
      console.error('Edit failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const EDIT_TOOLS = [
    { id: 'trim',   icon: '✂️',  label: 'Trim' },
    { id: 'speed',  icon: '⚡',  label: 'Speed' },
    { id: 'text',   icon: '𝐓',   label: 'Text' },
    { id: 'filter', icon: '🎨',  label: 'Filter' },
  ] as const;

  return (
    <div style={{
      background: 'var(--vs-bg-card)', border: '1px solid var(--vs-border)',
      borderRadius: 'var(--vs-radius-lg)', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '16px',
    }}>
      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
        ✂️ Edit Tools
      </h4>

      {/* Tool selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {EDIT_TOOLS.map(tool => (
          <button key={tool.id}
            onClick={() => setActiveEdit(activeEdit === tool.id ? null : tool.id)}
            style={{
              padding: '10px 8px', border: '1px solid',
              borderColor: activeEdit === tool.id ? 'var(--vs-primary)' : 'var(--vs-border)',
              borderRadius: '8px', cursor: 'pointer',
              background: activeEdit === tool.id ? 'rgba(99,102,241,0.15)' : 'var(--vs-bg-elevated)',
              color: activeEdit === tool.id ? 'var(--vs-primary)' : 'var(--vs-text-secondary)',
              fontSize: '13px', fontWeight: 500,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              transition: 'all var(--vs-transition-fast)',
            }}
          >
            <span style={{ fontSize: '20px' }}>{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>

      {/* Trim controls */}
      {activeEdit === 'trim' && (
        <div style={{ background: 'var(--vs-bg-elevated)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '13px', color: 'var(--vs-text-secondary)' }}>
            Start Time (sec)
            <input type="number" min={0} value={trimStart} onChange={e => setTrimStart(Number(e.target.value))}
              style={{ marginLeft: '8px', width: '70px', background: 'var(--vs-bg-primary)', border: '1px solid var(--vs-border)', borderRadius: '4px', padding: '4px 6px', color: 'var(--vs-text-primary)', fontSize: '13px' }} />
          </label>
          <label style={{ fontSize: '13px', color: 'var(--vs-text-secondary)' }}>
            End Time (sec)
            <input type="number" min={0} value={trimEnd} onChange={e => setTrimEnd(Number(e.target.value))}
              style={{ marginLeft: '8px', width: '70px', background: 'var(--vs-bg-primary)', border: '1px solid var(--vs-border)', borderRadius: '4px', padding: '4px 6px', color: 'var(--vs-text-primary)', fontSize: '13px' }} />
          </label>
          <button onClick={() => apply(() => videoEditingService.trimVideo(selectedVideo.id, trimStart, trimEnd))}
            disabled={isProcessing}
            style={{ padding: '8px 16px', background: 'var(--vs-primary)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
            {isProcessing ? 'Trimming...' : 'Apply Trim'}
          </button>
        </div>
      )}

      {/* Speed controls */}
      {activeEdit === 'speed' && (
        <div style={{ background: 'var(--vs-bg-elevated)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--vs-text-secondary)' }}>Speed: {speed}x</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.5, 0.75, 1.0, 1.5, 2.0].map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  style={{ padding: '4px 8px', fontSize: '12px', background: speed === s ? 'var(--vs-primary)' : 'var(--vs-bg-primary)', border: '1px solid var(--vs-border)', borderRadius: '4px', color: speed === s ? '#fff' : 'var(--vs-text-secondary)', cursor: 'pointer' }}>
                  {s}x
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => apply(() => videoEditingService.changeSpeed(selectedVideo.id, speed))}
            disabled={isProcessing}
            style={{ padding: '8px 16px', background: 'var(--vs-primary)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
            {isProcessing ? 'Processing...' : 'Apply Speed'}
          </button>
        </div>
      )}

      {/* Text overlay */}
      {activeEdit === 'text' && (
        <div style={{ background: 'var(--vs-bg-elevated)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea value={textOverlay} onChange={e => setTextOverlay(e.target.value)}
            placeholder="Enter text overlay..."
            style={{ background: 'var(--vs-bg-primary)', border: '1px solid var(--vs-border)', borderRadius: '6px', color: 'var(--vs-text-primary)', padding: '8px', fontSize: '13px', resize: 'vertical', minHeight: '60px', fontFamily: 'inherit' }} />
          <button onClick={() => apply(() => videoEditingService.addTextOverlay(selectedVideo.id, textOverlay, 0, 5, {}))}
            disabled={isProcessing || !textOverlay.trim()}
            style={{ padding: '8px 16px', background: 'var(--vs-primary)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '13px', opacity: !textOverlay.trim() ? 0.5 : 1 }}>
            {isProcessing ? 'Adding...' : 'Add Text Overlay'}
          </button>
        </div>
      )}

      {isProcessing && <LoadingSpinner size="sm" label="Applying edit..." />}
    </div>
  );
}
