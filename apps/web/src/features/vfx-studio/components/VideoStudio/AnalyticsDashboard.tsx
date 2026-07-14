// ============================================================
// ANALYTICS DASHBOARD — recharts powered
// ============================================================
// Real-time cost + usage tracking:
//   - Total spend (USD + INR)
//   - Daily activity chart (bar)
//   - Cost by feature (pie)
//   - Veo model distribution (bar)
//   - Success rate
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { VIDEO_STUDIO_CONFIG } from '../../constants/videoStudioConfig';
import { authenticatedFetch } from '../../../../services/auth';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

interface AnalyticsData {
  period:        { days: number; since: string };
  summary:       { totalEvents: number; totalCostUSD: number; totalCostINR: number; successRate: number };
  byType:        { type: string; cost: number }[];
  byModel:       { model: string; count: number }[];
  dailyActivity: { date: string; count: number; cost: number }[];
  veoModels:     Record<string, number>;
}

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#1D9E75', '#EF9F27', '#E24B4A', '#3B82F6'];

const TYPE_LABELS: Record<string, string> = {
  veo_generate:   'Veo Generate',
  style_transfer: 'Style Transfer',
  broll:          'B-Roll',
  lipsync:        'Lip Sync',
  export:         'Export',
  other:          'Other',
};

const MODEL_LABELS: Record<string, string> = {
  'veo-3.1-lite-generate-preview': 'Lite',
  'veo-3.1-fast-generate-001':     'Fast',
  'veo-3.1-generate-preview':      'Quality',
};

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ padding: '12px 14px', background: 'var(--vs-bg)', border: '0.5px solid var(--vs-border)', borderRadius: '10px' }}>
      <p style={{ margin: '0 0 3px', fontSize: '11px', color: 'var(--vs-text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: color || 'var(--vs-text-primary)' }}>{value}</p>
      {sub && <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--vs-text-muted)' }}>{sub}</p>}
    </div>
  );
}

export function AnalyticsDashboard() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days,    setDays]    = useState(7);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    authenticatedFetch(`${API_BASE}/api/pro/analytics?days=${days}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Analytics load nahi ho paya'))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return (
    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--vs-text-muted)' }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
      <p style={{ margin: 0, fontSize: '13px' }}>Analytics load ho raha hai...</p>
    </div>
  );

  if (error || !data) return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-danger)' }}>⚠️ {error}</div>
  );

  const pieData = data.byType.filter(t => t.cost > 0).map(t => ({
    name:  TYPE_LABELS[t.type] || t.type,
    value: Number(t.cost.toFixed(3)),
  }));

  const modelData = data.byModel.map(m => ({
    name:  MODEL_LABELS[m.model] || m.model,
    count: m.count,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
            📊 Analytics Dashboard
          </h3>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--vs-text-muted)' }}>
            Cost tracking + usage stats
          </p>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setDays(d)}
              style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer', borderRadius: '6px',
                background: days === d ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg)',
                border: `1px solid ${days === d ? '#6366f1' : 'var(--vs-border)'}`,
                color: days === d ? '#6366f1' : 'var(--vs-text-secondary)',
                fontWeight: days === d ? 600 : 400 }}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <StatCard label="Total Spend" value={`$${data.summary.totalCostUSD}`} sub={`≈ ₹${data.summary.totalCostINR.toLocaleString()}`} color="#6366f1" />
        <StatCard label="Total Events" value={String(data.summary.totalEvents)} sub={`Last ${days} days`} />
        <StatCard label="Success Rate" value={`${data.summary.successRate}%`} color={data.summary.successRate >= 90 ? 'var(--text-success)' : 'var(--text-warning)'} />
        <StatCard label="Veo Models" value={String(Object.keys(data.veoModels).length)} sub="active" />
      </div>

      {/* Daily Activity Chart */}
      {data.dailyActivity.length > 0 && (
        <div style={{ padding: '12px', background: 'var(--vs-bg)', border: '0.5px solid var(--vs-border)', borderRadius: '10px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-secondary)' }}>
            Daily Activity
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={data.dailyActivity} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip
                formatter={(value, name) => [name === 'cost' ? `$${value}` : value, name === 'cost' ? 'Cost' : 'Events']}
                labelFormatter={l => `Date: ${l}`}
                contentStyle={{ fontSize: '11px', background: 'var(--surface-1)', border: '1px solid var(--border)' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cost by Feature + Model Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>

        {/* Cost Pie */}
        <div style={{ padding: '12px', background: 'var(--vs-bg)', border: '0.5px solid var(--vs-border)', borderRadius: '10px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-secondary)' }}>Cost by Feature</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length] ?? '#8884d8'}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`$${v}`, 'Cost']} contentStyle={{ fontSize: '10px' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ margin: '20px 0', textAlign: 'center', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
              No cost data yet
            </p>
          )}
        </div>

        {/* Model Distribution */}
        <div style={{ padding: '12px', background: 'var(--vs-bg)', border: '0.5px solid var(--vs-border)', borderRadius: '10px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-secondary)' }}>Veo Model Usage</p>
          {modelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={modelData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={45} />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ margin: '20px 0', textAlign: 'center', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
              No model data yet
            </p>
          )}
        </div>
      </div>

      {/* Veo cost reference */}
      <div style={{ padding: '10px 12px', background: 'var(--vs-bg)', border: '0.5px solid var(--vs-border)', borderRadius: '9px', fontSize: '11px', color: 'var(--vs-text-muted)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--vs-text-secondary)' }}>Veo 3.1 Reference Rates:</strong><br />
        Lite: $0.04/sec (~₹3.8) &nbsp;·&nbsp; Fast: $0.12/sec (~₹11.4) &nbsp;·&nbsp; Quality: $0.30/sec (~₹28.5)<br />
        5 clips × 6 sec = 30 sec → Lite: <strong>~₹114</strong> · Fast: <strong>~₹342</strong> · Quality: <strong>~₹855</strong>
      </div>
    </div>
  );
}

