import { randomUUID } from 'node:crypto';

import { db } from '../database/connection.js';

export interface CreditAccount {
  userId: string;
  availableCredits: number;
  reservedCredits: number;
  totalSpentCredits: number;
}

interface CreditAccountRow {
  user_id: string;
  available_credits: number;
  reserved_credits: number;
  total_spent_credits: number;
}

interface ReservationRow {
  job_id: string;
  user_id: string;
  reserved_credits: number;
  captured_credits: number;
  status: string;
}

export class InsufficientCreditsError extends Error {
  constructor(
    public readonly requiredCredits: number,
    public readonly availableCredits: number,
  ) {
    super(`Insufficient credits: ${requiredCredits} required, ${availableCredits} available.`);
  }
}

function numericEnvironment(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function creditsEnabled(): boolean {
  return !['0', 'false', 'no', 'off'].includes(
    (process.env.CREDIT_SYSTEM_ENABLED ?? 'true').trim().toLowerCase(),
  );
}

function roundCredits(value: number): number {
  return Math.round(Math.max(0, value) * 100) / 100;
}

function initialCreditBalance(): number {
  const fallback = process.env.NODE_ENV === 'production' ? 0 : 500;
  return roundCredits(numericEnvironment('DEFAULT_CREDIT_BALANCE', fallback));
}

function rowToAccount(row: CreditAccountRow): CreditAccount {
  return {
    userId: row.user_id,
    availableCredits: row.available_credits,
    reservedCredits: row.reserved_credits,
    totalSpentCredits: row.total_spent_credits,
  };
}

function selectAccount(userId: string): CreditAccountRow {
  const row = db.prepare(`
    SELECT user_id, available_credits, reserved_credits, total_spent_credits
    FROM credit_accounts WHERE user_id = $userId
  `).get({ $userId: userId }) as CreditAccountRow | undefined;
  if (!row) throw new Error('Credit account create nahi hua.');
  return row;
}

function transaction<T>(operation: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = operation();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function appendLedger(input: {
  userId: string;
  jobId?: string;
  eventType: string;
  amount: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}): void {
  const account = selectAccount(input.userId);
  db.prepare(`
    INSERT OR IGNORE INTO credit_ledger (
      id, user_id, job_id, event_type, amount_credits,
      balance_after, reserved_after, metadata_json, idempotency_key
    ) VALUES (
      $id, $userId, $jobId, $eventType, $amount,
      $balanceAfter, $reservedAfter, $metadataJson, $idempotencyKey
    )
  `).run({
    $id: randomUUID(),
    $userId: input.userId,
    $jobId: input.jobId ?? null,
    $eventType: input.eventType,
    $amount: roundCredits(input.amount),
    $balanceAfter: account.available_credits,
    $reservedAfter: account.reserved_credits,
    $metadataJson: JSON.stringify(input.metadata ?? {}),
    $idempotencyKey: input.idempotencyKey,
  });
}

export function ensureCreditAccount(userId: string): CreditAccount {
  return transaction(() => {
    const initial = initialCreditBalance();
    const inserted = db.prepare(`
      INSERT OR IGNORE INTO credit_accounts (
        user_id, available_credits, reserved_credits, total_spent_credits
      ) VALUES ($userId, $initial, 0, 0)
    `).run({ $userId: userId, $initial: initial });
    if (Number(inserted.changes) > 0 && initial > 0) {
      appendLedger({
        userId,
        eventType: 'grant',
        amount: initial,
        idempotencyKey: `initial-grant:${userId}`,
        metadata: { source: 'initial_balance' },
      });
    }
    return rowToAccount(selectAccount(userId));
  });
}

export function getCreditAccount(userId: string): CreditAccount {
  return ensureCreditAccount(userId);
}

export function grantCredits(
  userId: string,
  amount: number,
  idempotencyKey = `grant:${randomUUID()}`,
): CreditAccount {
  const safeAmount = roundCredits(amount);
  if (safeAmount <= 0) throw new Error('Credit grant amount positive hona chahiye.');
  ensureCreditAccount(userId);
  return transaction(() => {
    const duplicate = db.prepare('SELECT id FROM credit_ledger WHERE idempotency_key=$key')
      .get({ $key: idempotencyKey });
    if (duplicate) return rowToAccount(selectAccount(userId));
    db.prepare(`
      UPDATE credit_accounts SET
        available_credits = available_credits + $amount,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $userId
    `).run({ $amount: safeAmount, $userId: userId });
    appendLedger({ userId, eventType: 'grant', amount: safeAmount, idempotencyKey });
    return rowToAccount(selectAccount(userId));
  });
}

export function estimateVideoGenerationCredits(input: {
  durationSeconds: number;
  promptCount: number;
  quality: '720p' | '1080p' | '4k';
}): number {
  const base = numericEnvironment('VIDEO_GENERATION_BASE_CREDITS', 10);
  const perSecond = numericEnvironment('VIDEO_GENERATION_CREDITS_PER_SECOND', 2);
  const qualityMultiplier = input.quality === '4k' ? 4 : input.quality === '1080p' ? 2 : 1;
  return Math.ceil(base + input.durationSeconds * input.promptCount * perSecond * qualityMultiplier);
}

export function reserveCredits(input: {
  userId: string;
  jobId: string;
  credits: number;
}): { account: CreditAccount; reservedCredits: number } {
  if (!creditsEnabled()) return { account: ensureCreditAccount(input.userId), reservedCredits: 0 };
  const amount = roundCredits(input.credits);
  if (amount <= 0) return { account: ensureCreditAccount(input.userId), reservedCredits: 0 };
  ensureCreditAccount(input.userId);
  return transaction(() => {
    const existing = db.prepare('SELECT * FROM credit_reservations WHERE job_id=$jobId')
      .get({ $jobId: input.jobId }) as ReservationRow | undefined;
    if (existing) {
      return {
        account: rowToAccount(selectAccount(existing.user_id)),
        reservedCredits: existing.reserved_credits,
      };
    }
    const account = selectAccount(input.userId);
    if (account.available_credits < amount) {
      throw new InsufficientCreditsError(amount, account.available_credits);
    }
    db.prepare(`
      UPDATE credit_accounts SET
        available_credits = available_credits - $amount,
        reserved_credits = reserved_credits + $amount,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $userId
    `).run({ $amount: amount, $userId: input.userId });
    db.prepare(`
      INSERT INTO credit_reservations (job_id, user_id, reserved_credits)
      VALUES ($jobId, $userId, $amount)
    `).run({ $jobId: input.jobId, $userId: input.userId, $amount: amount });
    appendLedger({
      userId: input.userId,
      jobId: input.jobId,
      eventType: 'reserve',
      amount,
      idempotencyKey: `reserve:${input.jobId}`,
    });
    return { account: rowToAccount(selectAccount(input.userId)), reservedCredits: amount };
  });
}

export function captureReservedCredits(jobId: string, actualCredits?: number): number {
  if (!creditsEnabled()) return 0;
  return transaction(() => {
    const reservation = db.prepare('SELECT * FROM credit_reservations WHERE job_id=$jobId')
      .get({ $jobId: jobId }) as ReservationRow | undefined;
    if (!reservation || reservation.status !== 'reserved') return reservation?.captured_credits ?? 0;
    const capture = roundCredits(Math.min(
      reservation.reserved_credits,
      actualCredits ?? reservation.reserved_credits,
    ));
    const refund = roundCredits(reservation.reserved_credits - capture);
    db.prepare(`
      UPDATE credit_accounts SET
        available_credits = available_credits + $refund,
        reserved_credits = MAX(0, reserved_credits - $reserved),
        total_spent_credits = total_spent_credits + $capture,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $userId
    `).run({
      $refund: refund,
      $reserved: reservation.reserved_credits,
      $capture: capture,
      $userId: reservation.user_id,
    });
    db.prepare(`
      UPDATE credit_reservations SET captured_credits=$capture, status='captured', updated_at=CURRENT_TIMESTAMP
      WHERE job_id=$jobId
    `).run({ $capture: capture, $jobId: jobId });
    appendLedger({
      userId: reservation.user_id,
      jobId,
      eventType: 'capture',
      amount: capture,
      idempotencyKey: `capture:${jobId}`,
      metadata: { reservedCredits: reservation.reserved_credits, refundedCredits: refund },
    });
    return capture;
  });
}

export function releaseReservedCredits(jobId: string, reason: string): number {
  if (!creditsEnabled()) return 0;
  return transaction(() => {
    const reservation = db.prepare('SELECT * FROM credit_reservations WHERE job_id=$jobId')
      .get({ $jobId: jobId }) as ReservationRow | undefined;
    if (!reservation || reservation.status !== 'reserved') return 0;
    db.prepare(`
      UPDATE credit_accounts SET
        available_credits = available_credits + $amount,
        reserved_credits = MAX(0, reserved_credits - $amount),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $userId
    `).run({ $amount: reservation.reserved_credits, $userId: reservation.user_id });
    db.prepare(`
      UPDATE credit_reservations SET status='released', updated_at=CURRENT_TIMESTAMP
      WHERE job_id=$jobId
    `).run({ $jobId: jobId });
    appendLedger({
      userId: reservation.user_id,
      jobId,
      eventType: 'release',
      amount: reservation.reserved_credits,
      idempotencyKey: `release:${jobId}`,
      metadata: { reason },
    });
    return reservation.reserved_credits;
  });
}

export function releaseTerminalCreditReservations(): number {
  const rows = db.prepare(`
    SELECT r.job_id AS jobId
    FROM credit_reservations r
    JOIN processing_jobs j ON j.id = r.job_id
    WHERE r.status='reserved' AND j.status IN ('failed','error','cancelled','timed_out')
  `).all() as Array<{ jobId: string }>;
  for (const row of rows) releaseReservedCredits(row.jobId, 'terminal_job_reconciliation');
  return rows.length;
}

export function listCreditLedger(userId: string, limit = 50): Array<Record<string, unknown>> {
  ensureCreditAccount(userId);
  return db.prepare(`
    SELECT id, job_id AS jobId, event_type AS eventType, amount_credits AS amountCredits,
      balance_after AS balanceAfter, reserved_after AS reservedAfter,
      metadata_json AS metadataJson, created_at AS createdAt
    FROM credit_ledger WHERE user_id=$userId
    ORDER BY created_at DESC LIMIT $limit
  `).all({ $userId: userId, $limit: Math.max(1, Math.min(100, Math.floor(limit))) }) as Array<Record<string, unknown>>;
}
