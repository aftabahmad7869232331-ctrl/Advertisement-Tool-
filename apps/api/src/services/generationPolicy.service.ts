import { db } from '../database/connection.js';

function numberEnv(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

export function enforceGenerationPolicy(input: {
  credentialSource: 'byok' | 'server' | 'none'; duration: number;
}): number | null {
  const dailyLimit = numberEnv('MAX_DAILY_CLOUD_JOBS', 20);
  const count = (db.prepare("SELECT COUNT(*) AS count FROM ai_usage_events WHERE created_at >= datetime('now','-1 day')").get() as { count: number }).count;
  if (count >= dailyLimit) throw new Error('Daily cloud job limit reach ho gayi.');
  if (input.credentialSource !== 'server') return null;
  const perSecondRaw = process.env.HF_ESTIMATED_COST_PER_SECOND_USD?.trim();
  if (!perSecondRaw) throw new Error('Server-paid cost estimate configured nahi hai.');
  const estimate = Number(perSecondRaw) * input.duration;
  const spent = (db.prepare("SELECT COALESCE(SUM(estimated_cost_usd),0) AS total FROM ai_usage_events WHERE credential_source='server' AND created_at >= datetime('now','-1 day')").get() as { total: number }).total;
  if (spent + estimate > numberEnv('MAX_DAILY_ESTIMATED_COST_USD', 5)) throw new Error('Daily cloud budget limit exceed hogi.');
  return estimate;
}

export function recordUsage(input: {
  jobId: string; provider: string; model: string; credentialSource: string;
  estimatedCostUsd: number | null; duration: number; status: string;
}): void {
  db.prepare(`INSERT OR IGNORE INTO ai_usage_events
    (job_id,provider,model,credential_source,estimated_cost_usd,duration_requested,status)
    VALUES ($jobId,$provider,$model,$source,$cost,$duration,$status)`).run({
      $jobId: input.jobId, $provider: input.provider, $model: input.model,
      $source: input.credentialSource, $cost: input.estimatedCostUsd,
      $duration: input.duration, $status: input.status,
    });
}
