import { afterEach, describe, expect, it, vi } from 'vitest';

import { HuggingFaceProvider } from './huggingFace.provider.js';

afterEach(() => vi.restoreAllMocks());

describe('HuggingFaceProvider', () => {
  it('returns only safe public metadata', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ name: 'safe-user', type: 'user', token: 'upstream-secret' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )));

    const provider = new HuggingFaceProvider();
    const secret = 'hf_super_secret_value';
    const validation = await provider.validateCredential(secret);
    const metadata = provider.getPublicMetadata('byok', validation);
    const serialized = JSON.stringify(metadata);

    expect(metadata.account).toEqual({ name: 'safe-user', type: 'user' });
    expect(serialized).not.toContain(secret);
    expect(serialized).not.toContain('upstream-secret');
  });
});

