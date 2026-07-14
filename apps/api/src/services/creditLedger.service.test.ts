import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { db, initializeDatabase } from '../database/connection.js';
import { ProcessingJobModel } from '../models/ProcessingJob.model.js';
import {
  captureReservedCredits,
  estimateVideoGenerationCredits,
  getCreditAccount,
  grantCredits,
  releaseReservedCredits,
  reserveCredits,
} from './creditLedger.service.js';

initializeDatabase();
const users: string[] = [];
const jobs: string[] = [];
const previousDefaultBalance = process.env.DEFAULT_CREDIT_BALANCE;

beforeAll(() => { process.env.DEFAULT_CREDIT_BALANCE = '0'; });
afterAll(() => {
  if (previousDefaultBalance === undefined) delete process.env.DEFAULT_CREDIT_BALANCE;
  else process.env.DEFAULT_CREDIT_BALANCE = previousDefaultBalance;
});

afterEach(() => {
  for (const jobId of jobs.splice(0)) db.prepare('DELETE FROM processing_jobs WHERE id=$id').run({ $id: jobId });
  for (const userId of users.splice(0)) db.prepare('DELETE FROM credit_accounts WHERE user_id=$id').run({ $id: userId });
});

function setup(credits = 100): { userId: string; jobId: string } {
  const userId = `credit-test-${randomUUID()}`;
  const jobId = randomUUID();
  users.push(userId); jobs.push(jobId);
  ProcessingJobModel.create({ id: jobId, jobType: 'video_generation', userId });
  grantCredits(userId, credits, `test-grant:${jobId}`);
  return { userId, jobId };
}

describe('credit ledger', () => {
  it('reserves estimated credits and captures only actual usage', () => {
    const { userId, jobId } = setup();
    reserveCredits({ userId, jobId, credits: 30 });
    expect(getCreditAccount(userId)).toMatchObject({ availableCredits: 70, reservedCredits: 30 });

    expect(captureReservedCredits(jobId, 20)).toBe(20);
    expect(getCreditAccount(userId)).toMatchObject({
      availableCredits: 80,
      reservedCredits: 0,
      totalSpentCredits: 20,
    });
    expect(captureReservedCredits(jobId, 20)).toBe(20);
  });

  it('fully refunds a failed or cancelled reservation idempotently', () => {
    const { userId, jobId } = setup();
    reserveCredits({ userId, jobId, credits: 40 });
    expect(releaseReservedCredits(jobId, 'test_failure')).toBe(40);
    expect(releaseReservedCredits(jobId, 'duplicate')).toBe(0);
    expect(getCreditAccount(userId)).toMatchObject({ availableCredits: 100, reservedCredits: 0 });
  });

  it('prices duration, prompt count and quality deterministically', () => {
    expect(estimateVideoGenerationCredits({ durationSeconds: 5, promptCount: 1, quality: '720p' })).toBe(20);
    expect(estimateVideoGenerationCredits({ durationSeconds: 5, promptCount: 2, quality: '1080p' })).toBe(50);
  });
});
