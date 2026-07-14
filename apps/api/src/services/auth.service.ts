import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import type { FastifyRequest } from 'fastify';

import { db } from '../database/connection.js';
import { ApplicationError } from '../errors/applicationError.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  email_verified_at: string | null;
}

interface SessionRow {
  id: string;
  user_id: string;
  access_token_hash: string;
  refresh_token_hash: string;
  access_expires_at: string;
  refresh_expires_at: string;
  revoked_at: string | null;
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function hashPassword(password: string, salt: string): Buffer {
  return scryptSync(password, salt, 64, { N: 16_384, r: 8, p: 1 });
}

function selectUserByEmail(email: string): UserRow | undefined {
  return db.prepare(`SELECT * FROM users WHERE email=$email COLLATE NOCASE`)
    .get({ $email: email.trim().toLowerCase() }) as UserRow | undefined;
}

export function selectUserById(id: string): UserRow | undefined {
  return db.prepare(`SELECT * FROM users WHERE id=$id`).get({ $id: id }) as UserRow | undefined;
}

export function publicUser(user: UserRow) {
  const lastLogin = user.last_login_at ?? user.created_at;
  return {
    id: user.id,
    email: user.email,
    emailVerified: Boolean(user.email_verified_at),
    firstName: user.first_name,
    lastName: user.last_name,
    avatarUrl: null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    tier: 'free',
    permissions: [{ resource: 'video', actions: ['create', 'read', 'update', 'delete', 'export'] }],
    twoFactorEnabled: false,
    apiKeys: [],
    subscriptionStatus: 'active',
    subscriptionExpiresAt: null,
    oauthProviders: ['email'],
    organizationId: null,
    teamRole: user.role,
    preferences: {
      theme: 'system', language: 'en', timezone: 'Asia/Calcutta',
      emailNotifications: true, marketingEmails: false, dashboardLayout: 'grid',
    },
    usageStats: {
      campaignsCreated: 0, videosGenerated: 0, storageUsedMB: 0,
      apiCallsThisMonth: 0, lastLoginAt: lastLogin,
    },
  };
}

export function registerUser(input: { email: string; password: string; firstName?: string; lastName?: string }) {
  if (selectUserByEmail(input.email)) throw new ApplicationError('email_exists', 'Is email ka account pehle se bana hua hai.', 409);
  const id = randomUUID();
  const salt = randomBytes(16).toString('hex');
  const passwordHash = hashPassword(input.password, salt).toString('hex');
  db.prepare(`
    INSERT INTO users (id,email,password_hash,password_salt,first_name,last_name)
    VALUES ($id,$email,$hash,$salt,$firstName,$lastName)
  `).run({
    $id: id, $email: input.email.trim().toLowerCase(), $hash: passwordHash, $salt: salt,
    $firstName: input.firstName?.trim() ?? '', $lastName: input.lastName?.trim() ?? '',
  });
  return selectUserById(id)!;
}

export function authenticatePassword(email: string, password: string): UserRow {
  const user = selectUserByEmail(email);
  if (!user || user.status !== 'active') throw new ApplicationError('invalid_credentials', 'Email ya password incorrect hai.', 401);
  const expected = Buffer.from(user.password_hash, 'hex');
  const supplied = hashPassword(password, user.password_salt);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw new ApplicationError('invalid_credentials', 'Email ya password incorrect hai.', 401);
  }
  if ((process.env.AUTH_REQUIRE_EMAIL_VERIFICATION === 'true' || process.env.NODE_ENV === 'production') && !user.email_verified_at) {
    throw new ApplicationError('email_not_verified', 'Login se pehle email verify karein.', 403);
  }
  db.prepare(`UPDATE users SET last_login_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=$id`).run({ $id: user.id });
  return selectUserById(user.id)!;
}

export function createSession(userId: string) {
  const id = randomUUID();
  const accessToken = `brk_at_${randomBytes(32).toString('base64url')}`;
  const refreshToken = `brk_rt_${randomBytes(48).toString('base64url')}`;
  const accessMs = Number(process.env.AUTH_ACCESS_TOKEN_MINUTES ?? 15) * 60_000;
  const refreshMs = Number(process.env.AUTH_REFRESH_TOKEN_DAYS ?? 30) * 86_400_000;
  const accessExpires = new Date(Date.now() + accessMs);
  const refreshExpires = new Date(Date.now() + refreshMs);
  db.prepare(`
    INSERT INTO auth_sessions (id,user_id,access_token_hash,refresh_token_hash,access_expires_at,refresh_expires_at)
    VALUES ($id,$userId,$accessHash,$refreshHash,$accessExpires,$refreshExpires)
  `).run({
    $id: id, $userId: userId, $accessHash: tokenHash(accessToken), $refreshHash: tokenHash(refreshToken),
    $accessExpires: accessExpires.toISOString(), $refreshExpires: refreshExpires.toISOString(),
  });
  return { accessToken, refreshToken, expiresAt: accessExpires.getTime(), tokenType: 'Bearer' as const, scope: ['video', 'credits'] };
}

export function refreshSession(refreshToken: string) {
  const session = db.prepare(`SELECT * FROM auth_sessions WHERE refresh_token_hash=$hash`)
    .get({ $hash: tokenHash(refreshToken) }) as SessionRow | undefined;
  if (!session || session.revoked_at || Date.parse(session.refresh_expires_at) <= Date.now()) {
    throw new ApplicationError('invalid_refresh_token', 'Session expire ho gayi. Dobara login karein.', 401);
  }
  db.prepare(`UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE id=$id`).run({ $id: session.id });
  return createSession(session.user_id);
}

function bearerToken(request: FastifyRequest): string | null {
  const value = request.headers.authorization;
  if (!value?.startsWith('Bearer ')) return null;
  return value.slice(7).trim() || null;
}

export function authenticatedUser(request: FastifyRequest): UserRow | null {
  const token = bearerToken(request);
  if (!token) return null;
  const session = db.prepare(`
    SELECT * FROM auth_sessions
    WHERE access_token_hash=$hash AND revoked_at IS NULL AND datetime(access_expires_at) > datetime('now')
  `).get({ $hash: tokenHash(token) }) as SessionRow | undefined;
  if (!session) return null;
  db.prepare(`UPDATE auth_sessions SET last_used_at=CURRENT_TIMESTAMP WHERE id=$id`).run({ $id: session.id });
  return selectUserById(session.user_id) ?? null;
}

export function requireUser(request: FastifyRequest): UserRow {
  const user = authenticatedUser(request);
  if (!user) throw new ApplicationError('unauthorized', 'Login required hai.', 401);
  return user;
}

export function resolveUserId(request: FastifyRequest): string {
  const user = authenticatedUser(request);
  if (user) return user.id;
  const authRequired = process.env.AUTH_REQUIRED === 'true' || process.env.NODE_ENV === 'production';
  if (authRequired) throw new ApplicationError('unauthorized', 'Login required hai.', 401);
  return `dev:${request.ip}`;
}

export function revokeAccessSession(request: FastifyRequest): void {
  const token = bearerToken(request);
  if (!token) return;
  db.prepare(`UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE access_token_hash=$hash`)
    .run({ $hash: tokenHash(token) });
}

type ActionPurpose = 'verify_email' | 'reset_password';

export function createActionToken(userId: string, purpose: ActionPurpose): string {
  const token = `brk_${purpose === 'verify_email' ? 'ev' : 'pr'}_${randomBytes(32).toString('base64url')}`;
  const ttlMinutes = purpose === 'verify_email'
    ? Number(process.env.AUTH_EMAIL_VERIFY_HOURS ?? 24) * 60
    : Number(process.env.AUTH_PASSWORD_RESET_MINUTES ?? 30);
  db.prepare(`UPDATE auth_action_tokens SET used_at=CURRENT_TIMESTAMP WHERE user_id=$userId AND purpose=$purpose AND used_at IS NULL`)
    .run({ $userId: userId, $purpose: purpose });
  db.prepare(`
    INSERT INTO auth_action_tokens (id,user_id,purpose,token_hash,expires_at)
    VALUES ($id,$userId,$purpose,$hash,$expiresAt)
  `).run({
    $id: randomUUID(), $userId: userId, $purpose: purpose, $hash: tokenHash(token),
    $expiresAt: new Date(Date.now() + ttlMinutes * 60_000).toISOString(),
  });
  return token;
}

export function consumeActionToken(token: string, purpose: ActionPurpose): UserRow {
  const row = db.prepare(`
    SELECT * FROM auth_action_tokens
    WHERE token_hash=$hash AND purpose=$purpose AND used_at IS NULL AND datetime(expires_at) > datetime('now')
  `).get({ $hash: tokenHash(token), $purpose: purpose }) as { id: string; user_id: string } | undefined;
  if (!row) throw new ApplicationError('invalid_or_expired_token', 'Link invalid ya expire ho chuka hai.', 400);
  db.prepare(`UPDATE auth_action_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=$id`).run({ $id: row.id });
  const user = selectUserById(row.user_id);
  if (!user) throw new ApplicationError('invalid_or_expired_token', 'Link invalid ya expire ho chuka hai.', 400);
  return user;
}

export function verifyEmailToken(token: string): UserRow {
  const user = consumeActionToken(token, 'verify_email');
  db.prepare(`UPDATE users SET email_verified_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=$id`).run({ $id: user.id });
  return selectUserById(user.id)!;
}

export function beginPasswordReset(email: string): { user: UserRow; token: string } | null {
  const user = selectUserByEmail(email);
  if (!user || user.status !== 'active') return null;
  return { user, token: createActionToken(user.id, 'reset_password') };
}

export function resetPassword(token: string, password: string): void {
  const user = consumeActionToken(token, 'reset_password');
  const salt = randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt).toString('hex');
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`UPDATE users SET password_hash=$hash,password_salt=$salt,updated_at=CURRENT_TIMESTAMP WHERE id=$id`)
      .run({ $hash: passwordHash, $salt: salt, $id: user.id });
    db.prepare(`UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE user_id=$id AND revoked_at IS NULL`).run({ $id: user.id });
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function findUserForVerification(email: string): UserRow | null {
  const user = selectUserByEmail(email);
  return user && !user.email_verified_at ? user : null;
}
