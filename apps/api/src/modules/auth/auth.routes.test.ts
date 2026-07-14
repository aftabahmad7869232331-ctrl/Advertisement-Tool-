import Fastify from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';

import { initializeDatabase, db } from '../../database/connection.js';
import { applicationPlugin } from '../../plugins/application.plugin.js';
import { creditRoutes } from '../credits/credit.routes.js';
import { authRoutes } from './auth.routes.js';
import { grantCredits } from '../../services/creditLedger.service.js';

const app = Fastify({ logger: false });
const emails: string[] = [];

async function register(email: string, password = 'StrongPassword!42') {
  emails.push(email);
  const response = await app.inject({
    method: 'POST', url: '/api/auth/register', payload: { email, password },
  });
  return { response, body: response.json() as {
    data: { accessToken: string; refreshToken: string };
    meta?: { emailVerification?: { debugToken?: string } };
  } };
}

beforeAll(async () => {
  initializeDatabase();
  await app.register(applicationPlugin);
  await app.register(authRoutes);
  await app.register(creditRoutes);
  await app.ready();
});

afterAll(async () => {
  for (const email of emails) {
    const user = db.prepare('SELECT id FROM users WHERE email=$email').get({ $email: email }) as { id: string } | undefined;
    if (user) {
      db.prepare('DELETE FROM credit_accounts WHERE user_id=$id').run({ $id: user.id });
      db.prepare('DELETE FROM users WHERE id=$id').run({ $id: user.id });
    }
  }
  await app.close();
});

describe('authentication routes', () => {
  it('registers, authenticates /me and rejects duplicate registration', async () => {
    const email = `auth-${randomUUID()}@example.com`;
    const created = await register(email);
    expect(created.response.statusCode).toBe(201);
    expect(created.body.data.accessToken).toMatch(/^brk_at_/);

    const me = await app.inject({
      method: 'GET', url: '/api/users/me',
      headers: { authorization: `Bearer ${created.body.data.accessToken}` },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().data.email).toBe(email);

    const duplicate = await app.inject({
      method: 'POST', url: '/api/auth/register', payload: { email, password: 'StrongPassword!42' },
    });
    expect(duplicate.statusCode).toBe(409);
  });

  it('validates passwords and rotates refresh sessions', async () => {
    const email = `refresh-${randomUUID()}@example.com`;
    const created = await register(email);
    const badLogin = await app.inject({
      method: 'POST', url: '/api/auth/login', payload: { email, password: 'WrongPassword!42' },
    });
    expect(badLogin.statusCode).toBe(401);

    const refreshed = await app.inject({
      method: 'POST', url: '/api/auth/refresh', payload: { refreshToken: created.body.data.refreshToken },
    });
    expect(refreshed.statusCode).toBe(200);
    expect(refreshed.json().data.accessToken).not.toBe(created.body.data.accessToken);

    const oldAccess = await app.inject({
      method: 'GET', url: '/api/users/me',
      headers: { authorization: `Bearer ${created.body.data.accessToken}` },
    });
    expect(oldAccess.statusCode).toBe(401);
  });

  it('keeps credit balances isolated by authenticated user id', async () => {
    const first = await register(`credit-a-${randomUUID()}@example.com`);
    const second = await register(`credit-b-${randomUUID()}@example.com`);
    const firstMe = await app.inject({ method: 'GET', url: '/api/users/me', headers: { authorization: `Bearer ${first.body.data.accessToken}` } });
    grantCredits(firstMe.json().data.id, 75, `auth-test-${randomUUID()}`);

    const firstBalance = await app.inject({ method: 'GET', url: '/api/credits/balance', headers: { authorization: `Bearer ${first.body.data.accessToken}` } });
    const secondBalance = await app.inject({ method: 'GET', url: '/api/credits/balance', headers: { authorization: `Bearer ${second.body.data.accessToken}` } });
    expect(firstBalance.json().account.available).toBe(secondBalance.json().account.available + 75);
  });

  it('verifies email with a single-use expiring token', async () => {
    const created = await register(`verify-${randomUUID()}@example.com`);
    const token = created.body.meta?.emailVerification?.debugToken;
    expect(token).toMatch(/^brk_ev_/);
    const verified = await app.inject({ method: 'POST', url: '/api/auth/verify-email', payload: { token } });
    expect(verified.statusCode).toBe(200);
    expect(verified.json().data.emailVerified).toBe(true);
    const reused = await app.inject({ method: 'POST', url: '/api/auth/verify-email', payload: { token } });
    expect(reused.statusCode).toBe(400);
  });

  it('resets password, revokes old sessions and keeps forgot response generic', async () => {
    const email = `reset-${randomUUID()}@example.com`;
    const created = await register(email);
    const forgot = await app.inject({ method: 'POST', url: '/api/auth/forgot-password', payload: { email } });
    expect(forgot.statusCode).toBe(200);
    const token = forgot.json().meta.passwordReset.debugToken as string;
    const reset = await app.inject({ method: 'POST', url: '/api/auth/reset-password', payload: { token, password: 'NewStrongPassword!84' } });
    expect(reset.statusCode).toBe(200);
    const oldSession = await app.inject({ method: 'GET', url: '/api/users/me', headers: { authorization: `Bearer ${created.body.data.accessToken}` } });
    expect(oldSession.statusCode).toBe(401);
    const oldPassword = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password: 'StrongPassword!42' } });
    expect(oldPassword.statusCode).toBe(401);
    const newPassword = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password: 'NewStrongPassword!84' } });
    expect(newPassword.statusCode).toBe(200);

    const unknown = await app.inject({ method: 'POST', url: '/api/auth/forgot-password', payload: { email: `missing-${randomUUID()}@example.com` } });
    expect(unknown.statusCode).toBe(200);
    expect(unknown.json().data.message).toBe(forgot.json().data.message);
  });
});
