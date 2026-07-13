export type SupportedCloudProvider = 'huggingface';

export type CredentialSource = 'byok' | 'server' | 'none';

export interface ProviderCredential {
  source: CredentialSource;
  value?: string;
}

export interface SafeProviderAccount {
  name?: string;
  type?: string;
}

export interface CredentialValidationResult {
  valid: boolean;
  available: boolean;
  account?: SafeProviderAccount;
}

export interface ProviderPublicMetadata {
  provider: SupportedCloudProvider;
  model: string;
  available: boolean;
  credentialSource: CredentialSource;
  account?: SafeProviderAccount;
}

export interface CloudProviderAdapter {
  readonly name: SupportedCloudProvider;
  readonly model: string;
  validateCredential(credential: string): Promise<CredentialValidationResult>;
  getPublicMetadata(
    credentialSource: CredentialSource,
    validation?: CredentialValidationResult,
  ): ProviderPublicMetadata;
  generate?: (input: unknown, credential: string) => Promise<unknown>;
}

export class InvalidProviderCredentialError extends Error {}
export class ProviderUnavailableError extends Error {}

