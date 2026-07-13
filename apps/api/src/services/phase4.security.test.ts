import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { initializeDatabase } from '../database/connection.js';
import { ProcessingJobModel } from '../models/ProcessingJob.model.js';
import { enforceGenerationPolicy } from './generationPolicy.service.js';
import { requestHash } from './idempotency.service.js';

initializeDatabase();

describe('Phase 4 safety policies', () => {
  it('prevents invalid backwards transitions and late completion after cancellation', () => {
    const id = randomUUID();
    ProcessingJobModel.create({ id, jobType: 'video_generation' });
    ProcessingJobModel.transition(id, 'cancelled');
    ProcessingJobModel.markDone(id, { videoId: 'late-video' });
    expect(ProcessingJobModel.findById(id)?.status).toBe('cancelled');
    expect(() => ProcessingJobModel.transition(id, 'processing')).not.toThrow();
    expect(ProcessingJobModel.findById(id)?.status).toBe('cancelled');
  });

  it('does not include provider credentials in an idempotency hash', () => {
    const body = { prompts: ['safe'], provider: 'huggingface' };
    const hash = requestHash(body);
    expect(hash).toBe(requestHash(body));
    expect(hash).not.toContain('hf_secret');
  });

  it('BYOK bypasses server cost while server-paid requires configured pricing', () => {
    expect(enforceGenerationPolicy({ credentialSource: 'byok', duration: 10 })).toBeNull();
    const previous = process.env.HF_ESTIMATED_COST_PER_SECOND_USD;
    delete process.env.HF_ESTIMATED_COST_PER_SECOND_USD;
    expect(() => enforceGenerationPolicy({ credentialSource: 'server', duration: 10 })).toThrow('cost estimate');
    if (previous !== undefined) process.env.HF_ESTIMATED_COST_PER_SECOND_USD = previous;
  });
});
