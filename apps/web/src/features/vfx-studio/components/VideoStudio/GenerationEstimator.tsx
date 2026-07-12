// ============================================================
// GENERATION ESTIMATOR — Level 2 Phase A2
// ============================================================
// Generate karne se pehle user ko batata hai ki kitna time lagega
// aur (Veo API use ho rahi ho toh) approximately kitna cost aayega —
// taaki koi surprise na ho, khaaskar jab clip count zyada ho.

import { useEffect, useState } from 'react';
import { VIDEO_STUDIO_CONFIG } from '../../constants/videoStudioConfig';

interface Limits {
  maxClipCount: number;
  clipDurationSeconds: number;
  provider: 'veo' | 'hf' | 'local';
  veoModel: string | null;
  costPerSecondUsd: number;
  costNote: string;
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
}

export function GenerationEstimator({ clipCount }: { clipCount: number }) {
  const [limits, setLimits] = useState<Limits | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${VIDEO_STUDIO_CONFIG.api.baseUrl}/api/config/limits`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled && data) setLimits(data); })
      .catch(() => { /* estimator optional hai — fail silently, Generate button block nahi hoga */ });
    return () => { cancelled = true; };
  }, []);

  if (!limits || clipCount === 0) return null;

  const totalSeconds  = clipCount * limits.clipDurationSeconds;
  const estimatedCost = limits.provider === 'veo' ? clipCount * limits.clipDurationSeconds * limits.costPerSecondUsd : 0;
  // Har clip generate + poll karne mein roughly khud ka processing time bhi lagta hai
  // (Veo async generation + poll interval) — video-length se alag, wait-time estimate
  const estimatedWaitSeconds = clipCount * 25; // rough: ~25 sec/clip generation+poll overhead

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '4px',
      padding: '10px 12px', marginBottom: '8px',
      background: 'var(--vs-bg-elevated)', border: '1px solid var(--vs-border)',
      borderRadius: '8px', fontSize: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--vs-text-secondary)' }}>
        <span>📹 Video length</span>
        <span style={{ color: 'var(--vs-text-primary)', fontWeight: 600 }}>{formatDuration(totalSeconds)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--vs-text-secondary)' }}>
        <span>⏱️ Estimated wait time</span>
        <span style={{ color: 'var(--vs-text-primary)', fontWeight: 600 }}>~{formatDuration(estimatedWaitSeconds)}</span>
      </div>
      {limits.provider === 'veo' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--vs-text-secondary)' }}>
          <span>💰 Estimated cost</span>
          <span style={{ color: 'var(--vs-accent)', fontWeight: 700 }}>~${estimatedCost.toFixed(2)}</span>
        </div>
      )}
      <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'var(--vs-text-muted)' }}>{limits.costNote}</p>
    </div>
  );
}
