import { z } from 'zod';

const booleanValue = z.string().optional().transform((value) =>
  value === undefined ? undefined : ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase()),
);

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().trim().min(1).default('127.0.0.1'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGIN: z.string().trim().default('http://localhost:5173'),
  AI_WORKER_URL: z.string().url().default('http://127.0.0.1:8100'),
  ALLOW_BYOK: booleanValue.default(true),
  ALLOW_PAID_CLOUD: booleanValue.default(false),
  STORAGE_PROVIDER: z.enum(['local']).default('local'),
  MAX_VIDEO_FILE_SIZE_MB: z.coerce.number().positive().default(500),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type Environment = z.infer<typeof environmentSchema>;

let cached: Environment | undefined;

export function getEnvironment(): Environment {
  cached ??= environmentSchema.parse(process.env);
  return cached;
}

export function resetEnvironmentForTests(): void {
  cached = undefined;
}

