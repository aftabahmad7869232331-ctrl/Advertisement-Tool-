import type {
  CloudProviderAdapter,
  CredentialSource,
  CredentialValidationResult,
  ProviderPublicMetadata,
} from './types.js';
import {
  InvalidProviderCredentialError,
  ProviderUnavailableError,
} from './types.js';

interface HuggingFaceWhoAmI {
  name?: unknown;
  type?: unknown;
}

function connectTimeoutMilliseconds(): number {
  const seconds = Number(process.env.HF_CONNECT_TIMEOUT_SECONDS ?? 15);
  return Number.isFinite(seconds) && seconds > 0
    ? seconds * 1_000
    : 15_000;
}

export class HuggingFaceProvider implements CloudProviderAdapter {
  readonly name = 'huggingface' as const;
  readonly model = process.env.HF_VIDEO_MODEL?.trim() ?? '';

  async validateCredential(
    credential: string,
  ): Promise<CredentialValidationResult> {
    try {
      const response = await fetch('https://huggingface.co/api/whoami-v2', {
        method: 'GET',
        headers: { Authorization: `Bearer ${credential}` },
        signal: AbortSignal.timeout(connectTimeoutMilliseconds()),
      });

      if (response.status === 401 || response.status === 403) {
        throw new InvalidProviderCredentialError(
          'Hugging Face credential invalid hai.',
        );
      }

      if (!response.ok) {
        throw new ProviderUnavailableError(
          'Hugging Face credential service unavailable hai.',
        );
      }

      const data = (await response.json()) as HuggingFaceWhoAmI;
      const account = {
        ...(typeof data.name === 'string' ? { name: data.name } : {}),
        ...(typeof data.type === 'string' ? { type: data.type } : {}),
      };

      return { valid: true, available: true, account };
    } catch (error) {
      if (
        error instanceof InvalidProviderCredentialError ||
        error instanceof ProviderUnavailableError
      ) {
        throw error;
      }

      throw new ProviderUnavailableError(
        'Hugging Face credential service se connection fail hua.',
      );
    }
  }

  getPublicMetadata(
    credentialSource: CredentialSource,
    validation?: CredentialValidationResult,
  ): ProviderPublicMetadata {
    return {
      provider: this.name,
      model: this.model,
      available: validation?.available === true,
      credentialSource,
      ...(validation?.account ? { account: validation.account } : {}),
    };
  }
}

export const huggingFaceProvider = new HuggingFaceProvider();
