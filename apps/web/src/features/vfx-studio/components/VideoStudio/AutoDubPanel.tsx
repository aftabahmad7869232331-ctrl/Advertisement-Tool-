// ============================================================
// AUTO-DUB PANEL
// ============================================================
// Existing video ko ek language se dusri mein "dub" karta hai —
// audio transcribe → translate → naye voice mein TTS → lip-sync.

import React, { useState } from 'react';
import { autoDubService, DUB_LANGUAGES, DUB_STATUS_LABELS, type DubJobStatus } from '../../services/autoDub.service';

interface AutoDubPanelProps {
  videoId: string | null;
  onDubComplete?: (outputUrl: string) => void;
}

type Step = 'configure' | 'processing' | 'done';

export function AutoDubPanel({ videoId, onDubComplete }: AutoDubPanelProps) {
  const [step, setStep]                 = useState<Step>('configure');
  const [sourceLanguage, setSourceLang] = useState('en');
  const [targetLanguage, setTargetLang] = useState('hi');
  const [job, setJob]                   = useState<DubJobStatus | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [isStarting, setIsStarting]     = useState(false);

  const label: React.CSSProperties = {
    fontSize: '12px', fontWeight: 500, color: 'var(--vs-text-secondary)', display: 'block', marginBottom: '5px',
  };
  const selectStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '8px 11px',
    background: 'var(--vs-bg)', border: '1px solid var(--vs-border)',
    borderRadius: '8px', color: 'var(--vs-text-primary)', fontSize: '13px',
  };

  async function handleStart() {
    if (!videoId) return;
    setIsStarting(true); setError(null);
    try {
      const { jobId } = await autoDubService.start({ videoId, sourceLanguage, targetLanguage });
      setStep('processing');
      const final = await autoDubService.pollUntilDone(jobId, setJob);
      if (final.status === 'done' && final.outputUrl) {
        setStep('done');
        onDubComplete?.(final.outputUrl);
      } else {
        setError(final.error || 'Dubbing fail ho gayi.');
        setStep('configure');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dubbing fail ho gayi.');
      setStep('configure');
    } finally {
      setIsStarting(false);
    }
  }

  function reset() {
    setStep('configure'); setJob(null); setError(null);
  }

  if (!videoId) {
    return (
      <div style={{ fontSize: '13px', color: 'var(--vs-text-secondary)', padding: '20px', textAlign: 'center' }}>
        Pehle koi video select/import karo, phir yahan dub kar sakte ho.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
          🌐 Auto-Dub
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Video ki audio ko translate karke naye language mein dubbing + lip-sync ek saath.
        </p>
      </div>

      {step === 'configure' && (
        <>
          <div>
            <label style={label}>Original video ki language</label>
            <select value={sourceLanguage} onChange={e => setSourceLang(e.target.value)} style={selectStyle}>
              {DUB_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Dub kis language mein karna hai</label>
            <select value={targetLanguage} onChange={e => setTargetLang(e.target.value)} style={selectStyle}>
              {DUB_LANGUAGES.filter(l => l.code !== sourceLanguage).map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {error && <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-error)' }}>{error}</p>}

          <button
            onClick={handleStart}
            disabled={isStarting}
            style={{
              padding: '11px', borderRadius: '8px', border: 'none',
              background: 'var(--vs-primary)', color: '#fff', fontSize: '14px', fontWeight: 700,
              cursor: isStarting ? 'not-allowed' : 'pointer', opacity: isStarting ? 0.6 : 1,
            }}
          >
            {isStarting ? 'Shuru ho raha hai...' : 'Auto-Dub Start Karo'}
          </button>
        </>
      )}

      {step === 'processing' && job && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--vs-text-primary)' }}>
            {DUB_STATUS_LABELS[job.status]}
          </p>
          <div style={{ height: '8px', background: 'var(--vs-bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${job.progress}%`, height: '100%', background: 'var(--vs-accent)',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--vs-text-muted)' }}>{job.progress}%</span>
          {job.translatedText && (
            <div style={{ fontSize: '12px', color: 'var(--vs-text-secondary)', background: 'var(--vs-bg-elevated)', padding: '10px', borderRadius: '6px' }}>
              <strong>Translated script:</strong> {job.translatedText}
            </div>
          )}
        </div>
      )}

      {step === 'done' && job?.outputUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--vs-success, #4ade80)' }}>✅ Dubbing complete!</p>
          <video src={job.outputUrl} controls style={{ width: '100%', borderRadius: '8px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href={job.outputUrl} download
              style={{
                flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px',
                background: 'var(--vs-primary)', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
              }}
            >
              Download
            </a>
            <button
              onClick={reset}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--vs-border)',
                background: 'var(--vs-bg-elevated)', color: 'var(--vs-text-secondary)', fontSize: '13px', cursor: 'pointer',
              }}
            >
              Naya Dub Karo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
