import type {
  CredentialSource,
  CredentialValidationResult,
} from './providers/types.js';

export type AIProviderName = 'auto' | 'local-wan' | 'huggingface';
export type ConcreteAIProvider = Exclude<AIProviderName, 'auto'>;

export interface ProviderSelectionInput {
  requestedProvider?: AIProviderName;
  localWanReady: boolean;
  huggingFaceCredential?: {
    source: Exclude<CredentialSource, 'none'>;
    validation: CredentialValidationResult;
  };
  huggingFaceModel: string;
}

export interface ProviderSelectionResult {
  provider: ConcreteAIProvider;
  model: string;
  credentialSource: CredentialSource;
  reason: string;
}

export function selectAIProvider(
  input: ProviderSelectionInput,
): ProviderSelectionResult {
  const requested = input.requestedProvider ?? 'auto';

  if (requested === 'local-wan') {
    if (!input.localWanReady) {
      throw new Error('Local Wan2.1 worker available nahi hai.');
    }
    return {
      provider: 'local-wan',
      model: 'Wan2.1-T2V-1.3B',
      credentialSource: 'none',
      reason: 'Local Wan2.1 explicitly selected.',
    };
  }

  if (requested === 'huggingface') {
    if (!input.huggingFaceCredential?.validation.valid) {
      throw new Error('Hugging Face ke liye valid credential chahiye.');
    }
    return {
      provider: 'huggingface',
      model: input.huggingFaceModel,
      credentialSource: input.huggingFaceCredential.source,
      reason: 'Validated Hugging Face credential selected.',
    };
  }

  if (input.localWanReady) {
    return {
      provider: 'local-wan',
      model: 'Wan2.1-T2V-1.3B',
      credentialSource: 'none',
      reason: 'Ready local Wan2.1 runtime selected.',
    };
  }

  if (input.huggingFaceCredential?.validation.valid) {
    return {
      provider: 'huggingface',
      model: input.huggingFaceModel,
      credentialSource: input.huggingFaceCredential.source,
      reason: 'Local runtime unavailable; validated Hugging Face selected.',
    };
  }

  throw new Error(
    'Koi safe AI provider available nahi hai. BYOK key dein, local worker ready karein, ya paid cloud explicitly configure karein.',
  );
}
