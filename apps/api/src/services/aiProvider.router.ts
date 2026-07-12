export type AIProviderName =
  | 'auto'
  | 'local-wan'
  | 'huggingface'
  | 'google'
  | 'openai';

export type ConcreteAIProvider = Exclude<AIProviderName, 'auto'>;

export interface ProviderSelectionInput {
  requestedProvider?: AIProviderName;
  userKeyProvider?: ConcreteAIProvider;
  localWorkerAvailable: boolean;
  allowPaidCloud: boolean;
  estimatedCostUsd: number;
  remainingBudgetUsd: number;
}

export interface ProviderSelectionResult {
  provider: ConcreteAIProvider;
  model: string;
  usesUserKey: boolean;
  usesPaidCloud: boolean;
  reason: string;
}

function ensureBudget(
  estimatedCostUsd: number,
  remainingBudgetUsd: number,
): void {
  if (estimatedCostUsd > remainingBudgetUsd) {
    throw new Error(
      `AI budget insufficient hai. Estimated: $${estimatedCostUsd.toFixed(2)}, remaining: $${remainingBudgetUsd.toFixed(2)}.`,
    );
  }
}

function defaultModel(provider: ConcreteAIProvider): string {
  switch (provider) {
    case 'local-wan':
      return 'Wan2.1-T2V-1.3B';
    case 'huggingface':
      return 'provider-default';
    case 'google':
      return 'provider-default';
    case 'openai':
      return 'provider-default';
  }
}

export function selectAIProvider(
  input: ProviderSelectionInput,
): ProviderSelectionResult {
  const requestedProvider = input.requestedProvider ?? 'auto';

  if (requestedProvider === 'local-wan') {
    if (!input.localWorkerAvailable) {
      throw new Error('Local Wan2.1 worker available nahi hai.');
    }

    return {
      provider: 'local-wan',
      model: defaultModel('local-wan'),
      usesUserKey: false,
      usesPaidCloud: false,
      reason: 'Local Wan2.1 explicitly selected.',
    };
  }

  if (requestedProvider !== 'auto') {
    const usesUserKey = input.userKeyProvider === requestedProvider;

    if (!usesUserKey && !input.allowPaidCloud) {
      throw new Error(
        `${requestedProvider} ke liye user API key ya paid-cloud permission chahiye.`,
      );
    }

    if (!usesUserKey) {
      ensureBudget(
        input.estimatedCostUsd,
        input.remainingBudgetUsd,
      );
    }

    return {
      provider: requestedProvider,
      model: defaultModel(requestedProvider),
      usesUserKey,
      usesPaidCloud: !usesUserKey,
      reason: `${requestedProvider} explicitly selected.`,
    };
  }

  if (input.userKeyProvider) {
    return {
      provider: input.userKeyProvider,
      model: defaultModel(input.userKeyProvider),
      usesUserKey: true,
      usesPaidCloud: false,
      reason: 'User-owned API key available hai.',
    };
  }

  if (input.localWorkerAvailable) {
    return {
      provider: 'local-wan',
      model: defaultModel('local-wan'),
      usesUserKey: false,
      usesPaidCloud: false,
      reason: 'Paid AI cost avoid karne ke liye local Wan2.1 selected.',
    };
  }

  if (input.allowPaidCloud) {
    ensureBudget(
      input.estimatedCostUsd,
      input.remainingBudgetUsd,
    );

    return {
      provider: 'huggingface',
      model: defaultModel('huggingface'),
      usesUserKey: false,
      usesPaidCloud: true,
      reason: 'Local worker unavailable; approved cloud budget selected.',
    };
  }

  throw new Error(
    'Koi safe AI provider available nahi hai. User API key, local worker, ya paid-cloud budget configure kijiye.',
  );
}