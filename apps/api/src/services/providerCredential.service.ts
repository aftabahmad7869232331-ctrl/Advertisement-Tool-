import type { ProviderCredential } from './providers/types.js';

function environmentFlag(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return !['0', 'false', 'no', 'off'].includes(value.trim().toLowerCase());
}

function cleanCredential(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed || undefined;
}

export function resolveHuggingFaceCredential(input: {
  byokHeader?: string | string[];
  allowServerCredential?: boolean;
}): ProviderCredential {
  const byok = cleanCredential(input.byokHeader);

  if (byok && environmentFlag('ALLOW_BYOK', true)) {
    return { source: 'byok', value: byok };
  }

  const allowServer =
    input.allowServerCredential ?? environmentFlag('ALLOW_PAID_CLOUD', false);
  const serverToken = cleanCredential(process.env.HF_TOKEN);

  if (allowServer && serverToken) {
    return { source: 'server', value: serverToken };
  }

  return { source: 'none' };
}

