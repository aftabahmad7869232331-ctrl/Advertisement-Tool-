import { describe, expect, it } from 'vitest';

import { selectAIProvider } from './aiProvider.router.js';

const base = {
  localWanReady: false,
  huggingFaceModel: 'Wan-AI/Wan2.1-T2V-1.3B',
};

describe('selectAIProvider', () => {
  it('returns the safe error when auto has no provider', () => {
    expect(() => selectAIProvider(base)).toThrow('Koi safe AI provider');
  });

  it('considers validated BYOK Hugging Face in auto mode', () => {
    const result = selectAIProvider({
      ...base,
      huggingFaceCredential: {
        source: 'byok',
        validation: { valid: true, available: true },
      },
    });

    expect(result).toMatchObject({
      provider: 'huggingface',
      credentialSource: 'byok',
    });
  });

  it('rejects explicit Hugging Face without a credential', () => {
    expect(() => selectAIProvider({
      ...base,
      requestedProvider: 'huggingface',
    })).toThrow('valid credential');
  });

  it('rejects explicit local Wan when unavailable', () => {
    expect(() => selectAIProvider({
      ...base,
      requestedProvider: 'local-wan',
    })).toThrow('available nahi');
  });
});

