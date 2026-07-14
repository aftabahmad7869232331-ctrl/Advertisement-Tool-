// ============================================================
// PUBLISH PANEL — Phase 5: Distribution & Publishing
// ============================================================
// 4 tabs:
//   🚀 Publish     — YouTube / Instagram / TikTok direct
//   📅 Schedule    — Future date/time publish
//   🔗 Share       — Public share link
//   🧪 A/B Test    — 2 videos ek saath compare
//   📋 History     — Past publishes
// ============================================================

import React, { useState, useEffect } from 'react';
import { distributionService, PLATFORMS, type Platform, type PublishRecord } from '../../services/distribution.service';
import { copyText } from '../../../../utils/copyText';

interface PublishPanelProps {
  videoId:   string | null;
  videoIds?: string[];
  videoTitle?: string;
  aspectRatio?: string;
}

type Tab = 'publish' | 'schedule' | 'share' | 'abtest' | 'history';

export function PublishPanel({ videoId, videoIds = [], videoTitle = '', aspectRatio = '16:9' }: PublishPanelProps) {
  const [tab,          setTab]         = useState<Tab>('publish');
  const [platform,     setPlatform]    = useState<Platform>('youtube');
  const [title,        setTitle]       = useState(videoTitle);
  const [description,  setDescription] = useState('');
  const [tags,         setTags]        = useState('');
  const [privacy,      setPrivacy]     = useState<'public' | 'private' | 'unlisted'>('public');
  const [scheduleDate, setScheduleDate] = useState('');
  const [shareUrl,     setShareUrl]    = useState<string | null>(null);
  const [history,      setHistory]     = useState<PublishRecord[]>([]);
  const [abVideoB,     setAbVideoB]    = useState('');
  const [abTitleA,     setAbTitleA]    = useState('');
  const [abTitleB,     setAbTitleB]    = useState('');
  const [result,       setResult]      = useState<unknown>(null);
  const [isRunning,    setIsRunning]   = useState(false);
  const [error,        setError]       = useState<string | null>(null);
  const [success,      setSuccess]     = useState<string | null>(null);

  const label: React.CSSProperties = { fontSize: '11px', fontWeight: 500, color: 'var(--vs-text-secondary)', display: 'block', marginBottom: '4px' };
  const inp:   React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '7px', color: 'var(--vs-text-primary)', fontSize: '12px', outline: 'none' };

  const selectedPlatform = PLATFORMS.find(p => p.value === platform)!;

  useEffect(() => {
    if (tab === 'history') {
      distributionService.getHistory().then(setHistory).catch(() => {});
    }
  }, [tab]);

  async function handlePublish() {
    if (!videoId) { setError('Pehle video generate karo'); return; }
    if (!title.trim()) { setError('Title zaroori hai'); return; }
    setError(null); setSuccess(null); setIsRunning(true);
    try {
      const res = await distributionService.publish({
        videoId, platform, title, description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        privacy, aspectRatio,
      });
      setSuccess(`✅ ${selectedPlatform.label} par publish ho gaya!`);
      setResult(res);
    } catch (err) { setError(err instanceof Error ? err.message : 'Publish fail'); }
    finally { setIsRunning(false); }
  }

  async function handleSchedule() {
    if (!videoId || !title.trim() || !scheduleDate) { setError('Video, title, aur date zaroori hain'); return; }
    setError(null); setSuccess(null); setIsRunning(true);
    try {
      const res = await distributionService.schedule({ videoId, platform, title, description, scheduledAt: scheduleDate });
      setSuccess(`📅 ${res.message}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Schedule fail'); }
    finally { setIsRunning(false); }
  }

  async function handleShare() {
    if (!videoId) { setError('Pehle video generate karo'); return; }
    setError(null); setIsRunning(true);
    try {
      const url = await distributionService.getShareLink(videoId);
      setShareUrl(url);
    } catch (err) { setError(err instanceof Error ? err.message : 'Share link fail'); }
    finally { setIsRunning(false); }
  }

  async function handleABTest() {
    if (!videoId || !abVideoB.trim()) { setError('Dono video IDs chahiye'); return; }
    setError(null); setSuccess(null); setIsRunning(true);
    try {
      const res = await distributionService.abTest({ videoIdA: videoId, videoIdB: abVideoB, platform, titleA: abTitleA, titleB: abTitleB });
      setResult(res);
      setSuccess('🧪 A/B test publish ho gaya!');
    } catch (err) { setError(err instanceof Error ? err.message : 'A/B test fail'); }
    finally { setIsRunning(false); }
  }

  const Spinner = () => <span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />;

  // Common platform + metadata form
  const MetaForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Platform selector */}
      <div>
        <label style={label}>Platform</label>
        <div style={{ display: 'flex', gap: '6px' }}>
          {PLATFORMS.map(p => (
            <button key={p.value} onClick={() => setPlatform(p.value)}
              style={{ flex: 1, padding: '9px 6px', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${platform === p.value ? p.color : 'var(--vs-border)'}`, background: platform === p.value ? p.color + '15' : 'var(--vs-bg)', transition: 'all .12s' }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{p.emoji}</div>
              <div style={{ fontSize: '11px', fontWeight: platform === p.value ? 600 : 400, color: platform === p.value ? p.color : 'var(--vs-text-secondary)' }}>{p.label}</div>
              <div style={{ fontSize: '9px', color: 'var(--vs-text-muted)' }}>{p.ratios.join(' · ')}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={label}>Title *</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={inp} placeholder="Video ka title..." maxLength={100}
          onFocus={e => (e.target.style.borderColor = '#6366f1')} onBlur={e => (e.target.style.borderColor = 'var(--vs-border)')} />
      </div>

      <div>
        <label style={label}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
          style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
          placeholder="Video description..." maxLength={2200}
          onFocus={e => (e.target.style.borderColor = '#6366f1')} onBlur={e => (e.target.style.borderColor = 'var(--vs-border)')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={label}>Tags (comma separated)</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} style={inp} placeholder="ad, brand, product" />
        </div>
        <div>
          <label style={label}>Privacy</label>
          <select value={privacy} onChange={e => setPrivacy(e.target.value as any)} style={{ ...inp }}>
            <option value="public">🌍 Public</option>
            <option value="unlisted">🔗 Unlisted</option>
            <option value="private">🔒 Private</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>🚀 Publish & Distribute</h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>YouTube · Instagram · TikTok · Schedule · A/B Test</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '3px', background: 'var(--vs-bg)', borderRadius: '8px', padding: '3px', border: '1px solid var(--vs-border)', flexWrap: 'wrap' }}>
        {([
          { id: 'publish',  label: '🚀 Publish'  },
          { id: 'schedule', label: '📅 Schedule'  },
          { id: 'share',    label: '🔗 Share'     },
          { id: 'abtest',   label: '🧪 A/B Test'  },
          { id: 'history',  label: '📋 History'   },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setError(null); setSuccess(null); }}
            style={{ flex: '1 1 auto', padding: '6px 4px', background: tab === t.id ? 'var(--vs-bg-elevated)' : 'transparent', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PUBLISH TAB ── */}
      {tab === 'publish' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <MetaForm />
          {result && (result as any).postUrl && (
            <a href={(result as any).postUrl} target="_blank" rel="noreferrer"
              style={{ padding: '10px', textAlign: 'center', background: 'var(--bg-success, #EAF3DE)', border: '1px solid var(--border-success)', borderRadius: '8px', color: 'var(--text-success)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
              ✅ {selectedPlatform.label} par dekho →
            </a>
          )}
          <button onClick={handlePublish} disabled={!videoId || isRunning}
            style={{ padding: '12px', background: !videoId ? 'var(--vs-bg-elevated)' : isRunning ? 'rgba(99,102,241,.6)' : `linear-gradient(135deg, ${selectedPlatform.color}, ${selectedPlatform.color}cc)`, border: 'none', borderRadius: '9px', color: !videoId ? 'var(--vs-text-muted)' : '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isRunning ? <><Spinner /> Publishing...</> : !videoId ? '🎬 Pehle video generate karo' : `${selectedPlatform.emoji} ${selectedPlatform.label} par Publish Karo`}
          </button>
        </div>
      )}

      {/* ── SCHEDULE TAB ── */}
      {tab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <MetaForm />
          <div>
            <label style={label}>Publish Date & Time *</label>
            <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              style={{ ...inp }} />
          </div>
          <button onClick={handleSchedule} disabled={!videoId || isRunning}
            style={{ padding: '11px', background: !videoId ? 'var(--vs-bg-elevated)' : isRunning ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '9px', color: !videoId ? 'var(--vs-text-muted)' : '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isRunning ? <><Spinner /> Scheduling...</> : '📅 Schedule Publish Karo'}
          </button>
        </div>
      )}

      {/* ── SHARE TAB ── */}
      {tab === 'share' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)', lineHeight: 1.6 }}>
            Video ka public share link generate karo — kisi bhi platform par share kar sakte ho, koi account chahiye nahi.
          </p>
          {shareUrl && (
            <div style={{ padding: '10px 12px', background: 'var(--vs-bg)', border: '1px solid #6366f1', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', color: 'var(--vs-text-muted)' }}>Share Link:</p>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <code style={{ flex: 1, fontSize: '11px', color: '#6366f1', wordBreak: 'break-all' }}>{shareUrl}</code>
                <button onClick={() => { void copyText(shareUrl); }}
                  style={{ padding: '5px 8px', fontSize: '11px', background: 'rgba(99,102,241,0.1)', border: '1px solid #6366f1', borderRadius: '5px', color: '#6366f1', cursor: 'pointer', flexShrink: 0 }}>
                  Copy
                </button>
              </div>
            </div>
          )}
          <button onClick={handleShare} disabled={!videoId || isRunning}
            style={{ padding: '11px', background: !videoId ? 'var(--vs-bg-elevated)' : isRunning ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '9px', color: !videoId ? 'var(--vs-text-muted)' : '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isRunning ? <><Spinner /> Generating...</> : '🔗 Share Link Generate Karo'}
          </button>
        </div>
      )}

      {/* ── A/B TEST TAB ── */}
      {tab === 'abtest' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)', lineHeight: 1.6 }}>
            2 video versions ek saath publish karo — analytics se dekho kaun sa better perform karta hai.
          </p>
          <div>
            <label style={label}>Platform</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {PLATFORMS.map(p => (
                <button key={p.value} onClick={() => setPlatform(p.value)}
                  style={{ flex: 1, padding: '7px', cursor: 'pointer', borderRadius: '7px', border: `1px solid ${platform === p.value ? p.color : 'var(--vs-border)'}`, background: platform === p.value ? p.color + '15' : 'var(--vs-bg)', fontSize: '12px', color: platform === p.value ? p.color : 'var(--vs-text-secondary)', fontWeight: platform === p.value ? 600 : 400 }}>
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '10px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: '#6366f1' }}>Version A (current video)</p>
              <label style={label}>Title A</label>
              <input type="text" value={abTitleA} onChange={e => setAbTitleA(e.target.value)} style={inp} placeholder="Version A ka title..." />
              <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'var(--vs-text-muted)' }}>ID: {videoId || 'not selected'}</p>
            </div>
            <div style={{ padding: '10px', background: 'rgba(29,158,117,0.05)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: '#1D9E75' }}>Version B</p>
              <label style={label}>Video B ID</label>
              <input type="text" value={abVideoB} onChange={e => setAbVideoB(e.target.value)} style={inp} placeholder="video_xyz.mp4" />
              <label style={{ ...label, marginTop: '6px' }}>Title B</label>
              <input type="text" value={abTitleB} onChange={e => setAbTitleB(e.target.value)} style={inp} placeholder="Version B ka title..." />
            </div>
          </div>
          {Boolean(result) && (
            <div style={{ padding: '10px', background: 'var(--bg-success, #EAF3DE)', border: '1px solid var(--border-success)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-success)' }}>
              A/B test publish ho gaya! Analytics check karo to compare performance.
            </div>
          )}
          <button onClick={handleABTest} disabled={!videoId || isRunning}
            style={{ padding: '11px', background: !videoId ? 'var(--vs-bg-elevated)' : isRunning ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '9px', color: !videoId ? 'var(--vs-text-muted)' : '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isRunning ? <><Spinner /> Publishing both...</> : '🧪 A/B Test Shuru Karo'}
          </button>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {history.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', border: '2px dashed var(--vs-border)', borderRadius: '10px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--vs-text-muted)' }}>Abhi koi publish history nahi hai</p>
            </div>
          ) : history.map(r => (
            <div key={r.id} style={{ padding: '10px 12px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px' }}>{PLATFORMS.find(p => p.value === r.platform)?.emoji || '📤'}</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--vs-text-primary)', flex: 1 }}>{r.title}</span>
                <span style={{
                  fontSize: '10px', padding: '2px 7px', borderRadius: '20px',
                  background: r.status === 'published' ? 'var(--bg-success)' : r.status === 'failed' ? 'var(--bg-danger)' : 'var(--bg-warning)',
                  color: r.status === 'published' ? 'var(--text-success)' : r.status === 'failed' ? 'var(--text-danger)' : 'var(--text-warning)',
                }}>
                  {r.status}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--vs-text-muted)', display: 'flex', gap: '10px' }}>
                <span>{r.platform}</span>
                <span>{new Date(r.publishedAt).toLocaleDateString('hi-IN')}</span>
                {r.postUrl && <a href={r.postUrl} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>View post →</a>}
              </div>
              {r.error && <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-danger)' }}>{r.error}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Error / Success */}
      {error && <div style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--bg-danger, #FCEBEB)', border: '1px solid var(--border-danger)', color: 'var(--text-danger)' }}>⚠️ {error}</div>}
      {success && <div style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--bg-success, #EAF3DE)', border: '1px solid var(--border-success)', color: 'var(--text-success)' }}>{success}</div>}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
