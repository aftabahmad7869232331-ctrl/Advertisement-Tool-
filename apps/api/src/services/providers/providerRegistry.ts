import { huggingFaceProvider } from './huggingFace.provider.js';
import type {
  CloudProviderAdapter,
  SupportedCloudProvider,
} from './types.js';

const providers: Record<SupportedCloudProvider, CloudProviderAdapter> = {
  huggingface: huggingFaceProvider,
};

export function getProviderAdapter(
  provider: SupportedCloudProvider,
): CloudProviderAdapter {
  return providers[provider];
}

export function isSupportedCloudProvider(
  provider: string,
): provider is SupportedCloudProvider {
  return Object.hasOwn(providers, provider);
}

