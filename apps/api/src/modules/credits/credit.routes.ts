import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import {
  estimateVideoGenerationCredits,
  getCreditAccount,
  listCreditLedger,
} from '../../services/creditLedger.service.js';
import { resolveUserId } from '../../services/auth.service.js';

function publicAccount(account: ReturnType<typeof getCreditAccount>) {
  return {
    available: account.availableCredits,
    reserved: account.reservedCredits,
    spent: account.totalSpentCredits,
    currency: 'credits',
  };
}

export async function creditRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/credits/balance', async (request) => ({
    status: 'ok',
    account: publicAccount(getCreditAccount(resolveUserId(request))),
  }));

  app.get('/api/credits/ledger', async (request, reply) => {
    const parsed = z.object({ limit: z.coerce.number().int().min(1).max(100).default(50) })
      .safeParse(request.query);
    if (!parsed.success) return reply.status(400).send({ status: 'error', error: 'Invalid ledger query.' });
    const entries = listCreditLedger(resolveUserId(request), parsed.data.limit).map((entry) => {
      const metadata = typeof entry.metadataJson === 'string'
        ? JSON.parse(entry.metadataJson) as Record<string, unknown>
        : {};
      const { metadataJson: _metadataJson, ...rest } = entry;
      return { ...rest, metadata };
    });
    return { status: 'ok', entries };
  });

  app.post('/api/credits/estimate/video', async (request, reply) => {
    const parsed = z.object({
      durationSeconds: z.number().positive().max(60),
      promptCount: z.number().int().min(1).max(10),
      quality: z.enum(['720p', '1080p', '4k']),
    }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ status: 'error', error: 'Invalid credit estimate request.' });
    return {
      status: 'ok',
      estimatedCredits: estimateVideoGenerationCredits(parsed.data),
      refundableReservation: true,
    };
  });
}
