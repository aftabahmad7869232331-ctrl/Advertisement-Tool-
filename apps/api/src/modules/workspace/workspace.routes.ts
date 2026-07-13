import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../../database/connection.js';

const collectionSchema = z.enum([
  'campaigns', 'projects', 'gallery_assets', 'support_tickets', 'faqs', 'feedback',
]);
const idSchema = z.string().trim().min(1).max(160);

type StoredRow = { id: string; data_json: string };

export async function workspaceRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { collection: string } }>('/api/workspace/:collection', async (request, reply) => {
    const parsed = collectionSchema.safeParse(request.params.collection);
    if (!parsed.success) return reply.code(404).send({ error: 'Unknown workspace collection.' });
    const rows = db.prepare(
      'SELECT id, data_json FROM workspace_records WHERE collection = ? ORDER BY updated_at DESC',
    ).all(parsed.data) as StoredRow[];
    return rows.map((row) => JSON.parse(row.data_json) as unknown);
  });

  app.put<{ Params: { collection: string; id: string }; Body: unknown }>(
    '/api/workspace/:collection/:id',
    async (request, reply) => {
      const collection = collectionSchema.safeParse(request.params.collection);
      const id = idSchema.safeParse(request.params.id);
      if (!collection.success || !id.success || typeof request.body !== 'object' || request.body === null) {
        return reply.code(400).send({ error: 'Invalid workspace record.' });
      }
      const value = { ...(request.body as Record<string, unknown>), id: id.data };
      db.prepare(`
        INSERT INTO workspace_records (collection, id, data_json, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(collection, id) DO UPDATE SET data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP
      `).run(collection.data, id.data, JSON.stringify(value));
      return reply.code(200).send(value);
    },
  );

  app.patch<{ Params: { collection: string; id: string }; Body: unknown }>(
    '/api/workspace/:collection/:id',
    async (request, reply) => {
      const collection = collectionSchema.safeParse(request.params.collection);
      const id = idSchema.safeParse(request.params.id);
      if (!collection.success || !id.success || typeof request.body !== 'object' || request.body === null) {
        return reply.code(400).send({ error: 'Invalid workspace update.' });
      }
      const row = db.prepare(
        'SELECT data_json FROM workspace_records WHERE collection = ? AND id = ?',
      ).get(collection.data, id.data) as { data_json: string } | undefined;
      const current = row ? JSON.parse(row.data_json) as Record<string, unknown> : { id: id.data };
      const value = { ...current, ...(request.body as Record<string, unknown>), id: id.data };
      db.prepare(`
        INSERT INTO workspace_records (collection, id, data_json, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(collection, id) DO UPDATE SET data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP
      `).run(collection.data, id.data, JSON.stringify(value));
      return value;
    },
  );

  app.delete<{ Params: { collection: string; id: string } }>(
    '/api/workspace/:collection/:id',
    async (request, reply) => {
      const collection = collectionSchema.safeParse(request.params.collection);
      const id = idSchema.safeParse(request.params.id);
      if (!collection.success || !id.success) return reply.code(400).send({ error: 'Invalid record key.' });
      db.prepare('DELETE FROM workspace_records WHERE collection = ? AND id = ?').run(collection.data, id.data);
      return reply.code(204).send();
    },
  );

  app.post<{ Body: { page?: string; action?: string; payload?: unknown } }>(
    '/api/workspace/actions',
    async (request, reply) => {
      const page = idSchema.safeParse(request.body?.page);
      const action = idSchema.safeParse(request.body?.action);
      if (!page.success || !action.success) return reply.code(400).send({ error: 'Invalid page action.' });
      const id = crypto.randomUUID();
      db.prepare('INSERT INTO workspace_actions (id, page, action, payload_json) VALUES (?, ?, ?, ?)')
        .run(id, page.data, action.data, JSON.stringify(request.body.payload ?? {}));
      return reply.code(202).send({ id, accepted: true });
    },
  );
}
