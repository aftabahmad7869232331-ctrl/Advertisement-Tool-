// ============================================================
// SETTINGS PANEL — Version History + Rate Limiting
// ============================================================
// 2 tabs:
//   📜 Version History — project snapshots, restore karo
//   🚦 Rate Limiting   — Veo budget caps, usage stats
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import { VIDEO_STUDIO_CONFIG } from '../../constants/videoStudioConfig';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

type Tab = 'versions' | 'rates';

interface VersionEntry {
  id:         string;
  versionNum: number;
  label:      string;
  createdAt:  string;
  size:       number;
}

interface RateConfig {
  dailyBudgetUSD:   number;
  monthlyBudgetUSD: number;
  veoCallsPerHour:  number;
  isPaused:         boolean;
}

interface UsageSummary {
  totalEvents:   number;
  totalCostUSD:  number;
  totalCostINR:  number;
  todayCostUSD:  number;
  monthCostUSD:  number;
  hourVeoCalls:  number;
}

export function SettingsPanel() {
  const { project, setProject } = useVideoStudio();
  const [tab,          setTab]          = useState<Tab>('versions');

  // Version History state
  const [versions,     setVersions]     = useState<VersionEntry[]>([]);
  const [vLabel,       setVLabel]       = useState('');
  const [isSaving,     setIsSaving]     = useState(false);
  const [isRestoring,  setIsRestoring]  = useState<string | null>(null);
  const [vMsg,         setVMsg]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Rate Limiting state
  const [config,       setConfig]       = useState<RateConfig | null>(null);
  const [usage,        setUsage]        = useState<UsageSummary | null>(null);
  const [isUpdating,   setIsUpdating]   = useState(false);
  const [rMsg,         setRMsg]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const label: React.CSSProperties = {
    fontSize: '11px', fontWeight: 500,
    color: 'var(--vs-text-secondary)', display: 'block', marginBottom: '4px',
  };
  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '8px 10px',
    background: 'var(--vs-bg)', border: '1px solid var(--vs-border)',
    borderRadius: '7px', color: 'var(--vs-text-primary)', fontSize: '13px', outline: 'none',
  };

  // ── Load versions ────────────────────────────────────────
  const loadVersions = useCallback(async () => {
    if (!project.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/settings/versions/${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch {}
  }, [project.id]);

  useEffect(() => {
    if (tab === 'versions') loadVersions();
  }, [tab, loadVersions]);

  // ── Load rate limits ─────────────────────────────────────
  useEffect(() => {
    if (tab === 'rates') {
      fetch(`${API_BASE}/api/settings/rate-limits`)
        .then(r => r.json())
        .then(data => {
          setConfig(data.config);
          setUsage(data.usage?.summary);
        })
        .catch(() => {});
    }
  }, [tab]);

  // ── Save version ─────────────────────────────────────────
  async function handleSave() {
    if (!project.id) { setVMsg({ type: 'err', text: 'Project ID missing' }); return; }
    setIsSaving(true); setVMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/settings/versions/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          label:     vLabel.trim() || undefined,
          snapshot:  project,
        }),
      });
      if (!res.ok) throw new Error('Save fail ho gaya');
      const data = await res.json();
      setVMsg({ type: 'ok', text: `✅ Version ${data.versionNum} save ho gayi — "${data.label}"` });
      setVLabel('');
      loadVersions();
    } catch (err) {
      setVMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' });
    } finally { setIsSaving(false); }
  }

  // ── Restore version ──────────────────────────────────────
  async function handleRestore(versionId: string, versionNum: number, label: string) {
    if (!confirm(`Version ${versionNum} "${label}" restore karna chahte ho? Current changes lost ho jayenge.`)) return;
    setIsRestoring(versionId); setVMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/settings/versions/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });
      if (!res.ok) throw new Error('Restore fail ho gaya');
      const data = await res.json();
      setProject(data.snapshot);
      setVMsg({ type: 'ok', text: `✅ Version ${versionNum} restore ho gayi!` });
    } catch (err) {
      setVMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' });
    } finally { setIsRestoring(null); }
  }

  // ── Delete version ───────────────────────────────────────
  async function handleDelete(versionId: string) {
    try {
      await fetch(`${API_BASE}/api/settings/versions/${versionId}`, { method: 'DELETE' });
      loadVersions();
    } catch {}
  }

  // ── Update rate limits ───────────────────────────────────
  async function handleUpdateRates() {
    if (!config) return;
    setIsUpdating(true); setRMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/settings/rate-limits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Update fail ho gaya');
      setRMsg({ type: 'ok', text: '✅ Rate limits update ho gayi' });
    } catch (err) {
      setRMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' });
    } finally { setIsUpdating(false); }
  }

  async function handleTogglePause() {
    if (!config) return;
    try {
      const res = await fetch(`${API_BASE}/api/settings/rate-limits/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pause: !config.isPaused }),
      });
      if (res.ok) setConfig(c => c ? { ...c, isPaused: !c.isPaused } : c);
    } catch {}
  }

  function fmtBytes(b: number) {
    return b < 1024 ? `${b}B` : `${(b / 1024).toFixed(0)}KB`;
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleString('hi-IN', { dateStyle: 'short', timeStyle: 'short' });
  }

  // Budget usage percent
  const todayPct   = config && usage ? Math.min(100, (usage.todayCostUSD / config.dailyBudgetUSD) * 100) : 0;
  const monthPct   = config && usage ? Math.min(100, (usage.monthCostUSD / config.monthlyBudgetUSD) * 100) : 0;
  const hourPct    = config && usage ? Math.min(100, (usage.hourVeoCalls / config.veoCallsPerHour) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          ⚙️ Settings
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Version history · Rate limiting · Usage tracking
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--vs-bg)', borderRadius: '8px', padding: '3px', border: '1px solid var(--vs-border)' }}>
        {([{ id: 'versions', label: '📜 Version History' }, { id: 'rates', label: '🚦 Rate Limiting' }] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setVMsg(null); setRMsg(null); }}
            style={{ flex: 1, padding: '7px', background: tab === t.id ? 'var(--vs-bg-elevated)' : 'transparent', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── VERSION HISTORY TAB ── */}
      {tab === 'versions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Save new version */}
          <div style={{ padding: '12px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '9px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
              💾 Abhi Save Karo
            </p>
            <input type="text" value={vLabel} onChange={e => setVLabel(e.target.value)}
              placeholder='Label (optional) — e.g. "Before VFX", "Final version"'
              style={inp}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e  => (e.target.style.borderColor = 'var(--vs-border)')}
              onKeyDown={e => e.key === 'Enter' && handleSave()} />
            <button onClick={handleSave} disabled={isSaving}
              style={{ padding: '9px', background: isSaving ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {isSaving ? '⏳ Saving...' : '💾 Current State Save Karo'}
            </button>
          </div>

          {/* Message */}
          {vMsg && (
            <div style={{ padding: '8px 12px', borderRadius: '7px', fontSize: '12px', background: vMsg.type === 'ok' ? 'var(--bg-success, #EAF3DE)' : 'var(--bg-danger, #FCEBEB)', border: `1px solid ${vMsg.type === 'ok' ? 'var(--border-success)' : 'var(--border-danger)'}`, color: vMsg.type === 'ok' ? 'var(--text-success)' : 'var(--text-danger)' }}>
              {vMsg.text}
            </div>
          )}

          {/* Versions list */}
          {versions.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', border: '2px dashed var(--vs-border)', borderRadius: '9px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>Abhi koi saved versions nahi hain</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--vs-text-muted)' }}>Upar se save karo — pichle state mein wapas aa sakte ho</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--vs-text-muted)' }}>
                {versions.length} versions saved · Last 30 kept
              </p>
              {versions.map(v => (
                <div key={v.id} style={{ padding: '10px 12px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Version badge */}
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: 700, color: '#6366f1' }}>
                    v{v.versionNum}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 500, color: 'var(--vs-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.label}
                    </p>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--vs-text-muted)' }}>
                      {fmtDate(v.createdAt)} · {fmtBytes(v.size)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleRestore(v.id, v.versionNum, v.label)}
                      disabled={isRestoring === v.id}
                      style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer', background: 'rgba(99,102,241,0.1)', border: '1px solid #6366f1', borderRadius: '5px', color: '#6366f1', fontWeight: 500 }}>
                      {isRestoring === v.id ? '⏳' : '↩ Restore'}
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--vs-border)', borderRadius: '5px', color: 'var(--vs-text-muted)' }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ margin: 0, fontSize: '11px', color: 'var(--vs-text-muted)', lineHeight: 1.5 }}>
            💡 Tip: Important steps ke baad save karo — "Before LUT", "After music", "Final v1" etc. Max 30 versions per project.
          </p>
        </div>
      )}

      {/* ── RATE LIMITING TAB ── */}
      {tab === 'rates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Pause toggle */}
          {config && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: config.isPaused ? 'var(--bg-danger, #FCEBEB)' : 'var(--vs-bg)', border: `1px solid ${config.isPaused ? 'var(--border-danger)' : 'var(--vs-border)'}`, borderRadius: '9px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
                  {config.isPaused ? '⏸️ Usage Paused' : '▶️ Usage Active'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
                  {config.isPaused ? 'Koi bhi Veo call nahi hogi' : 'Veo API calls allowed hain'}
                </p>
              </div>
              <button onClick={handleTogglePause}
                style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: config.isPaused ? 'linear-gradient(135deg, #1D9E75, #16856A)' : 'var(--bg-danger, #FCEBEB)', border: `1px solid ${config.isPaused ? '#1D9E75' : 'var(--border-danger)'}`, borderRadius: '7px', color: config.isPaused ? '#fff' : 'var(--text-danger)' }}>
                {config.isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
            </div>
          )}

          {/* Usage meters */}
          {usage && config && (
            <div style={{ padding: '12px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '9px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>📊 Current Usage</p>

              {[
                { label: `Today — $${usage.todayCostUSD.toFixed(3)} / $${config.dailyBudgetUSD}`, pct: todayPct, color: todayPct > 80 ? '#E24B4A' : '#6366f1' },
                { label: `This Month — $${usage.monthCostUSD.toFixed(2)} / $${config.monthlyBudgetUSD}`, pct: monthPct, color: monthPct > 80 ? '#E24B4A' : '#1D9E75' },
                { label: `This Hour (Veo calls) — ${usage.hourVeoCalls} / ${config.veoCallsPerHour}`, pct: hourPct, color: hourPct > 80 ? '#E24B4A' : '#EF9F27' },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--vs-text-secondary)' }}>{m.label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: m.color }}>{Math.round(m.pct)}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--vs-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, transition: 'width .5s' }} />
                  </div>
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '4px' }}>
                {[
                  { label: 'Total Cost', value: `$${usage.totalCostUSD.toFixed(3)}` },
                  { label: 'INR', value: `₹${usage.totalCostINR.toLocaleString('hi-IN')}` },
                  { label: 'Events', value: String(usage.totalEvents) },
                ].map(s => (
                  <div key={s.label} style={{ padding: '7px', background: 'var(--vs-bg-elevated)', borderRadius: '7px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'var(--vs-text-muted)' }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget sliders */}
          {config && (
            <div style={{ padding: '12px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '9px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>🎛️ Budget Limits</p>

              <div>
                <label style={label}>Daily Budget — ${config.dailyBudgetUSD}</label>
                <input type="range" min={1} max={200} value={config.dailyBudgetUSD}
                  onChange={e => setConfig(c => c ? { ...c, dailyBudgetUSD: Number(e.target.value) } : c)}
                  style={{ width: '100%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--vs-text-muted)', marginTop: '2px' }}>
                  <span>$1 (min)</span>
                  <span>≈ ₹{Math.round(config.dailyBudgetUSD * 95).toLocaleString()}/day</span>
                  <span>$200 (max)</span>
                </div>
              </div>

              <div>
                <label style={label}>Monthly Budget — ${config.monthlyBudgetUSD}</label>
                <input type="range" min={10} max={2000} step={10} value={config.monthlyBudgetUSD}
                  onChange={e => setConfig(c => c ? { ...c, monthlyBudgetUSD: Number(e.target.value) } : c)}
                  style={{ width: '100%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--vs-text-muted)', marginTop: '2px' }}>
                  <span>$10</span>
                  <span>≈ ₹{Math.round(config.monthlyBudgetUSD * 95).toLocaleString()}/month</span>
                  <span>$2000</span>
                </div>
              </div>

              <div>
                <label style={label}>Veo Calls per Hour — {config.veoCallsPerHour}</label>
                <input type="range" min={1} max={100} value={config.veoCallsPerHour}
                  onChange={e => setConfig(c => c ? { ...c, veoCallsPerHour: Number(e.target.value) } : c)}
                  style={{ width: '100%' }} />
                <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--vs-text-muted)' }}>
                  Rate limit — zyada calls se unexpected costs aa sakte hain
                </p>
              </div>

              {rMsg && (
                <div style={{ padding: '7px 10px', borderRadius: '7px', fontSize: '12px', background: rMsg.type === 'ok' ? 'var(--bg-success, #EAF3DE)' : 'var(--bg-danger, #FCEBEB)', border: `1px solid ${rMsg.type === 'ok' ? 'var(--border-success)' : 'var(--border-danger)'}`, color: rMsg.type === 'ok' ? 'var(--text-success)' : 'var(--text-danger)' }}>
                  {rMsg.text}
                </div>
              )}

              <button onClick={handleUpdateRates} disabled={isUpdating}
                style={{ padding: '10px', background: isUpdating ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                {isUpdating ? '⏳ Saving...' : '💾 Limits Save Karo'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
