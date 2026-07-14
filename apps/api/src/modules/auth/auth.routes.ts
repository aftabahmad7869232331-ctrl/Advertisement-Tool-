import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import {
  authenticatePassword, createSession, publicUser, refreshSession,
  registerUser, requireUser, revokeAccessSession, createActionToken,
  verifyEmailToken, beginPasswordReset, resetPassword, findUserForVerification,
} from '../../services/auth.service.js';
import { sendAuthEmail } from '../../services/authEmail.service.js';

const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(10).max(128),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/auth/register', async (request, reply) => {
    const parsed = credentialsSchema.extend({
      firstName: z.string().trim().max(80).optional(),
      lastName: z.string().trim().max(80).optional(),
    }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, data: null, error: { code: 'invalid_input', message: 'Valid email aur minimum 10-character password required hai.' } });
    const user = registerUser({
      email: parsed.data.email,
      password: parsed.data.password,
      ...(parsed.data.firstName ? { firstName: parsed.data.firstName } : {}),
      ...(parsed.data.lastName ? { lastName: parsed.data.lastName } : {}),
    });
    const delivery = await sendAuthEmail({ email: user.email, token: createActionToken(user.id, 'verify_email'), purpose: 'verify_email' });
    return reply.status(201).send({ success: true, data: createSession(user.id), error: null, meta: { emailVerification: delivery } });
  });

  app.post('/api/auth/login', async (request, reply) => {
    const parsed = credentialsSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, data: null, error: { code: 'invalid_input', message: 'Email/password invalid hai.' } });
    const user = authenticatePassword(parsed.data.email, parsed.data.password);
    return { success: true, data: createSession(user.id), error: null };
  });

  app.post('/api/auth/refresh', async (request, reply) => {
    const parsed = z.object({ refreshToken: z.string().min(32).max(256) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, data: null, error: { code: 'invalid_input', message: 'Refresh token required hai.' } });
    return { success: true, data: refreshSession(parsed.data.refreshToken), error: null };
  });

  app.post('/api/auth/logout', async (request) => {
    revokeAccessSession(request);
    return { success: true, data: null, error: null };
  });

  app.post('/api/auth/verify-email', async (request, reply) => {
    const parsed = z.object({ token: z.string().min(32).max(256) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, data: null, error: { code: 'invalid_input', message: 'Verification token required hai.' } });
    return { success: true, data: publicUser(verifyEmailToken(parsed.data.token)), error: null };
  });

  app.post('/api/auth/resend-verification', async (request, reply) => {
    const parsed = z.object({ email: z.email().max(254) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, data: null, error: { code: 'invalid_input', message: 'Valid email required hai.' } });
    const user = findUserForVerification(parsed.data.email);
    const delivery = user
      ? await sendAuthEmail({ email: user.email, token: createActionToken(user.id, 'verify_email'), purpose: 'verify_email' })
      : null;
    return { success: true, data: { message: 'Agar verification pending hai to email bhej di gayi hai.' }, error: null, ...(delivery && process.env.NODE_ENV !== 'production' ? { meta: { emailVerification: delivery } } : {}) };
  });

  app.post('/api/auth/forgot-password', async (request, reply) => {
    const parsed = z.object({ email: z.email().max(254) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, data: null, error: { code: 'invalid_input', message: 'Valid email required hai.' } });
    const reset = beginPasswordReset(parsed.data.email);
    const delivery = reset
      ? await sendAuthEmail({ email: reset.user.email, token: reset.token, purpose: 'reset_password' })
      : null;
    return { success: true, data: { message: 'Agar account exist karta hai to reset email bhej di gayi hai.' }, error: null, ...(delivery && process.env.NODE_ENV !== 'production' ? { meta: { passwordReset: delivery } } : {}) };
  });

  app.post('/api/auth/reset-password', async (request, reply) => {
    const parsed = z.object({ token: z.string().min(32).max(256), password: z.string().min(10).max(128) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, data: null, error: { code: 'invalid_input', message: 'Valid reset token aur minimum 10-character password required hai.' } });
    resetPassword(parsed.data.token, parsed.data.password);
    return { success: true, data: { message: 'Password update ho gaya. Ab login karein.' }, error: null };
  });

  app.get('/api/users/me', async (request) => ({ success: true, data: publicUser(requireUser(request)), error: null }));
}
