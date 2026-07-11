// ============================================================
// 🚀 Brikes Maker Advertisement - Advance Super v1.0.0
// Advanced Configuration System
// File: frontend/src/config/wan21.config.ts
// ============================================================

// ------------------------------------------------------------
// 📦 TYPE DEFINITIONS
// ------------------------------------------------------------

export type AppEnvironment = 'development' | 'staging' | 'production';
export type AppTier = 'free' | 'advanced' | 'enterprise';
export type OAuthProvider = 'google' | 'github' | 'microsoft';

export interface OAuthProviderConfig {
  enabled: boolean;
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface AuthConfig {
  providers: Record<OAuthProvider, OAuthProviderConfig>;
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  session: {
    timeout: number;
    renewBeforeExpiry: number;
  };
  twoFactor: {
    enabled: boolean;
    issuer: string;
  };
}

export interface FeaturesConfig {
  advancedAnalytics: boolean;
  aiGeneration: boolean;
  teamCollaboration: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  exportHD: boolean;
  bulkOperations: boolean;
  advancedTargeting: boolean;
  themeBuilder: boolean;
}

export interface SecurityConfig {
  encryptionKey: string;
  requireHttps: boolean;
  corsAllowedOrigins: string[];
  rateLimitPerMinute: number;
  csrfEnabled: boolean;
  contentSecurityPolicy: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  endpoints: {
    auth: string;
    users: string;
    campaigns: string;
    analytics: string;
    media: string;
    subscriptions: string;
  };
}

export interface SubscriptionTier {
  name: string;
  campaignLimit: number;
  storageGB: number;
  teamMembers: number;
  apiCallsPerMonth: number;
  exportResolution: '720p' | '1080p' | '4K';
}

export interface SubscriptionConfig {
  tiers: Record<AppTier, SubscriptionTier>;
  stripePublicKey: string;
  planIds: Record<AppTier, string>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  provider: string;
  key: string;
  trackingEvents: string[];
  errorTracking: {
    enabled: boolean;
    dsn: string;
  };
}

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: AppEnvironment;
    tier: AppTier;
    advancedMode: boolean;
  };
  auth: AuthConfig;
  features: FeaturesConfig;
  security: SecurityConfig;
  api: ApiConfig;
  subscription: SubscriptionConfig;
  analytics: AnalyticsConfig;
}

// ------------------------------------------------------------
// ⚙️  DEFAULT CONFIGURATION
// ------------------------------------------------------------

const defaultConfig: AppConfig = {
  // ── App ──────────────────────────────────────────────────
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Brikes Maker Advertisement',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: (import.meta.env.VITE_APP_ENV as AppEnvironment) || 'development',
    tier: (import.meta.env.VITE_APP_TIER as AppTier) || 'advanced',
    advancedMode: import.meta.env.VITE_ADVANCED_MODE === 'true',
  },

  // ── Authentication ───────────────────────────────────────
  auth: {
    providers: {
      google: {
        enabled: !!import.meta.env.VITE_GOOGLE_OAUTH_ID,
        clientId: import.meta.env.VITE_GOOGLE_OAUTH_ID || '',
        redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:5173/auth/callback',
        scopes: ['openid', 'email', 'profile'],
      },
      github: {
        enabled: !!import.meta.env.VITE_GITHUB_OAUTH_ID,
        clientId: import.meta.env.VITE_GITHUB_OAUTH_ID || '',
        redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:5173/auth/callback',
        scopes: ['user:email', 'read:user'],
      },
      microsoft: {
        enabled: !!import.meta.env.VITE_MICROSOFT_OAUTH_ID,
        clientId: import.meta.env.VITE_MICROSOFT_OAUTH_ID || '',
        redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:5173/auth/callback',
        scopes: ['openid', 'email', 'profile'],
      },
    },
    jwt: {
      secret: import.meta.env.VITE_JWT_SECRET || '',
      expiresIn: import.meta.env.VITE_JWT_EXPIRY || '15m',
      refreshExpiresIn: import.meta.env.VITE_REFRESH_TOKEN_EXPIRY || '7d',
    },
    session: {
      timeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 3_600_000, // 1 hour
      renewBeforeExpiry: 300_000, // renew 5 min before expiry
    },
    twoFactor: {
      enabled: import.meta.env.FEATURE_2FA === 'true',
      issuer: 'Brikes Maker',
    },
  },

  // ── Feature Flags ────────────────────────────────────────
  features: {
    advancedAnalytics:  import.meta.env.FEATURE_ADVANCED_ANALYTICS  === 'true',
    aiGeneration:       import.meta.env.FEATURE_AI_GENERATION        === 'true',
    teamCollaboration:  import.meta.env.FEATURE_TEAM_COLLABORATION   === 'true',
    apiAccess:          import.meta.env.FEATURE_API_ACCESS           === 'true',
    customBranding:     import.meta.env.FEATURE_CUSTOM_BRANDING      === 'true',
    prioritySupport:    import.meta.env.FEATURE_PRIORITY_SUPPORT     === 'true',
    exportHD:           import.meta.env.FEATURE_EXPORT_HD            === 'true',
    bulkOperations:     import.meta.env.FEATURE_BULK_OPERATIONS      === 'true',
    advancedTargeting:  import.meta.env.FEATURE_ADVANCED_TARGETING   === 'true',
    themeBuilder:       true,
  },

  // ── Security ─────────────────────────────────────────────
  security: {
    encryptionKey:      import.meta.env.VITE_ENCRYPTION_KEY || '',
    requireHttps:       import.meta.env.VITE_REQUIRE_HTTPS === 'true',
    corsAllowedOrigins: (import.meta.env.VITE_CORS_ALLOWED_ORIGINS || 'http://localhost:5173')
                          .split(',')
                          .map((s: string) => s.trim()),
    rateLimitPerMinute: Number(import.meta.env.VITE_RATE_LIMIT_PER_MINUTE) || 100,
    csrfEnabled:        true,
    contentSecurityPolicy: true,
  },

  // ── API ──────────────────────────────────────────────────
  api: {
    baseUrl:    import.meta.env.VITE_API_BASE_URL || '/api',
    timeout:    Number(import.meta.env.VITE_API_TIMEOUT)    || 30_000,
    retryCount: Number(import.meta.env.VITE_API_RETRY_COUNT) || 3,
    retryDelay: 1_000, // ms between retries
    endpoints: {
      auth:          '/auth',
      users:         '/users',
      campaigns:     '/campaigns',
      analytics:     '/analytics',
      media:         '/media',
      subscriptions: '/subscriptions',
    },
  },

  // ── Subscription Tiers ───────────────────────────────────
  subscription: {
    tiers: {
      free: {
        name:              'Free',
        campaignLimit:     5,
        storageGB:         1,
        teamMembers:       1,
        apiCallsPerMonth:  1_000,
        exportResolution:  '720p',
      },
      advanced: {
        name:              'Advanced',
        campaignLimit:     100,
        storageGB:         50,
        teamMembers:       10,
        apiCallsPerMonth:  50_000,
        exportResolution:  '1080p',
      },
      enterprise: {
        name:              'Enterprise',
        campaignLimit:     -1,       // unlimited
        storageGB:         500,
        teamMembers:       -1,       // unlimited
        apiCallsPerMonth:  -1,       // unlimited
        exportResolution:  '4K',
      },
    },
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
    planIds: {
      free:       '',
      advanced:   import.meta.env.VITE_ADVANCED_PLAN_ID        || '',
      enterprise: import.meta.env.VITE_ENTERPRISE_PLAN_ID || '',
    },
  },

  // ── Analytics ────────────────────────────────────────────
  analytics: {
    enabled:  import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
    provider: 'internal',
    key:      import.meta.env.VITE_ANALYTICS_KEY || '',
    trackingEvents: [
      'page_view', 'campaign_created', 'campaign_published',
      'video_generated', 'user_login', 'user_logout',
      'feature_used', 'export_started', 'subscription_upgraded',
    ],
    errorTracking: {
      enabled: import.meta.env.VITE_ENABLE_ERROR_TRACKING !== 'false',
      dsn:     import.meta.env.VITE_ERROR_TRACKING_KEY || '',
    },
  },
};

// ------------------------------------------------------------
// ✅ VALIDATION
// ------------------------------------------------------------

function validateConfig(config: AppConfig): void {
  const errors: string[] = [];

  if (config.app.environment === 'production') {
    if (!config.auth.jwt.secret || config.auth.jwt.secret.length < 32)
      errors.push('VITE_JWT_SECRET must be at least 32 characters in production');
    if (!config.security.encryptionKey || config.security.encryptionKey.length < 32)
      errors.push('VITE_ENCRYPTION_KEY must be at least 32 characters in production');
    if (!config.security.requireHttps)
      errors.push('VITE_REQUIRE_HTTPS should be true in production');
  }

  const hasProvider = Object.values(config.auth.providers).some(p => p.enabled);
  if (!hasProvider && config.app.environment !== 'development') {
    errors.push('At least one OAuth provider must be configured');
  }

  if (errors.length > 0) {
    console.error('❌ Config Validation Errors:\n' + errors.map(e => `  • ${e}`).join('\n'));
    if (config.app.environment === 'production') {
      throw new Error('Invalid production configuration. Fix the errors above.');
    }
  } else {
    console.info(`✅ Config loaded — env: ${config.app.environment}, tier: ${config.app.tier}`);
  }
}

// ------------------------------------------------------------
// 📤 EXPORTED HELPERS
// ------------------------------------------------------------

let _config: AppConfig | null = null;

/** Returns the validated singleton config instance. */
export function getConfig(): AppConfig {
  if (!_config) {
    validateConfig(defaultConfig);
    _config = defaultConfig;
  }
  return _config;
}

/** Check whether a feature flag is enabled. */
export function isFeatureEnabled(feature: keyof FeaturesConfig): boolean {
  return getConfig().features[feature];
}

/** Get tier limits for a given tier. */
export function getTierLimits(tier: AppTier): SubscriptionTier {
  return getConfig().subscription.tiers[tier];
}

/** Check if the app is running in production mode. */
export function isProduction(): boolean {
  return getConfig().app.environment === 'production';
}

/** Check if 2FA is enabled globally. */
export function is2FAEnabled(): boolean {
  return getConfig().auth.twoFactor.enabled;
}

/** Get the full URL for an API endpoint. */
export function getApiUrl(endpoint: keyof ApiConfig['endpoints']): string {
  const { baseUrl, endpoints } = getConfig().api;
  return `${baseUrl}${endpoints[endpoint]}`;
}

export const wan21Config = {
  enginePath: import.meta.env.VITE_WAN21_ENGINE_PATH || "./engines/Wan2.1",
  modelPath: import.meta.env.VITE_WAN21_MODEL_PATH || "./models/Wan2.1-T2V-1.3B",
  githubRepoUrl: import.meta.env.VITE_WAN21_GITHUB_URL || "https://github.com/Wan-Video/Wan2.1.git",
  hfModelId: import.meta.env.VITE_WAN21_HF_MODEL_ID || "Wan-AI/Wan2.1-T2V-1.3B",
  defaultQuality: import.meta.env.VITE_WAN21_DEFAULT_QUALITY || "480P",
  validation: {
    enginePathValid: true,
    modelPathValid: true,
    githubUrlValid: true,
    hfModelIdValid: true,
    rawEnginePath: import.meta.env.VITE_WAN21_ENGINE_PATH || "./engines/Wan2.1",
    rawModelPath: import.meta.env.VITE_WAN21_MODEL_PATH || "./models/Wan2.1-T2V-1.3B",
    rawGithubUrl: import.meta.env.VITE_WAN21_GITHUB_URL || "https://github.com/Wan-Video/Wan2.1.git",
    rawHfModelId: import.meta.env.VITE_WAN21_HF_MODEL_ID || "Wan-AI/Wan2.1-T2V-1.3B",
    warnings: [] as string[]
  }
};

export default getConfig;
