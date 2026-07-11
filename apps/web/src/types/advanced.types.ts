// ============================================================
// 🚀 Brikes Maker Advertisement - Advance Super v1.0.0
// Advanced Type System
// File: frontend/src/types/advanced.types.ts
// ============================================================

// ============================================================
// 👤 1. USER & AUTHENTICATION TYPES
// ============================================================

export type UserTier = 'free' | 'advanced' | 'enterprise';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'publish' | 'export';
export type PermissionResource = 'campaign' | 'video' | 'analytics' | 'team' | 'billing' | 'api';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'email';

export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;           // never store raw key
  prefix: string;            // e.g. "brk_" for display
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  scopes: PermissionResource[];
  isActive: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;         // Unix timestamp (ms)
  tokenType: 'Bearer';
  scope: string[];
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

/** Base user — shared with the standard version. */
export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Extended user for Advanced / Enterprise tiers. */
export interface User extends BaseUser {
  tier: UserTier;
  permissions: Permission[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;   // encrypted at rest
  apiKeys: ApiKey[];
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: Date | null;
  oauthProviders: OAuthProvider[];
  organizationId: string | null;
  teamRole: TeamRole | null;
  preferences: UserPreferences;
  usageStats: UserUsageStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  dashboardLayout: 'grid' | 'list';
}

export interface UserUsageStats {
  campaignsCreated: number;
  videosGenerated: number;
  storageUsedMB: number;
  apiCallsThisMonth: number;
  lastLoginAt: Date;
}

// ============================================================
// 📢 2. CAMPAIGNS & CONTENT TYPES
// ============================================================

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived';
export type CampaignObjective = 'awareness' | 'engagement' | 'conversion' | 'retention';
export type AdFormat = 'video' | 'banner' | 'carousel' | 'story' | 'interstitial';
export type DevicePlatform = 'mobile' | 'desktop' | 'tablet' | 'ctv';

export interface TargetingRules {
  ageRange: { min: number; max: number };
  genders: ('male' | 'female' | 'other')[];
  locations: string[];          // ISO country/region codes
  languages: string[];
  interests: string[];
  devices: DevicePlatform[];
  customAudiences: string[];    // audience segment IDs
}

export interface ConversionTracker {
  id: string;
  name: string;
  type: 'purchase' | 'signup' | 'click' | 'view' | 'custom';
  trackingPixelUrl: string;
  value: number | null;
  currency: string;
  windowDays: number;
}

export interface AIInsight {
  type: 'performance' | 'audience' | 'creative' | 'budget';
  title: string;
  description: string;
  recommendedAction: string;
  confidenceScore: number;       // 0–1
  potentialUplift: string;       // e.g. "+12% CTR"
  generatedAt: Date;
}

export interface DetailedMetrics {
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  spend: number;
  cpm: number;
  cpc: number;
  cpa: number;
  roas: number;
  videoViews: number;
  videoCompletionRate: number;
  engagementRate: number;
}

/** Base campaign — shared with standard version. */
export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** Extended campaign for Advanced / Enterprise. */
export interface AdvancedCampaign extends Campaign {
  objective: CampaignObjective;
  budget: {
    total: number;
    daily: number;
    currency: string;
  };
  schedule: {
    startDate: Date;
    endDate: Date | null;
    timezone: string;
  };
  targeting: TargetingRules;
  adFormats: AdFormat[];
  aiInsights: AIInsight[];
  performanceMetrics: DetailedMetrics;
  conversionTracking: ConversionTracker[];
  advancedTargeting: TargetingRules[];
  createdBy: string;            // User.id
  teamId: string | null;
  tags: string[];
  notes: string;
}

export interface Creative {
  id: string;
  campaignId: string;
  type: AdFormat;
  name: string;
  assetUrl: string;
  thumbnailUrl: string;
  duration: number | null;      // seconds, for video
  dimensions: { width: number; height: number };
  fileSize: number;             // bytes
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  performanceMetrics: DetailedMetrics;
  createdAt: Date;
}

// ============================================================
// 🎬 3. VIDEO & STUDIO TYPES
// ============================================================

export type VideoResolution = '480p' | '720p' | '1080p' | '4K';
export type VideoFormat = 'mp4' | 'webm' | 'mov' | 'avi';
export type StudioElementType = 'text' | 'image' | 'video' | 'audio' | 'shape' | 'animation';
export type ProjectStatus = 'draft' | 'rendering' | 'rendered' | 'published' | 'failed';

export interface VideoAsset {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  duration: number;             // seconds
  resolution: VideoResolution;
  format: VideoFormat;
  fileSize: number;
  metadata: {
    fps: number;
    bitrate: number;
    codec: string;
    hasAudio: boolean;
  };
  createdAt: Date;
}

export interface StudioElement {
  id: string;
  type: StudioElementType;
  name: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number };
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  properties: Record<string, unknown>;  // type-specific props
  animations: Animation[];
  timeline: { startMs: number; endMs: number };
}

export interface StudioProject {
  id: string;
  name: string;
  status: ProjectStatus;
  duration: number;
  resolution: VideoResolution;
  fps: number;
  elements: StudioElement[];
  assets: VideoAsset[];
  outputUrl: string | null;
  renderProgress: number;       // 0–100
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// 📊 4. ANALYTICS & REPORTING TYPES
// ============================================================

export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'heatmap';
export type ReportPeriod = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'custom';
export type MetricKey = keyof DetailedMetrics;

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: Date;
  color?: string;
}

export interface ChartData {
  type: ChartType;
  title: string;
  metric: MetricKey;
  period: ReportPeriod;
  dataPoints: ChartDataPoint[];
  total: number;
  change: number;               // % change vs previous period
  trend: 'up' | 'down' | 'flat';
}

export interface ConversionFunnelStep {
  name: string;
  count: number;
  dropOff: number;              // %
  avgTimeSeconds: number;
}

export interface ConversionFunnel {
  id: string;
  name: string;
  steps: ConversionFunnelStep[];
  overallConversionRate: number;
  period: ReportPeriod;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  period: ReportPeriod;
  dateRange: { from: Date; to: Date };
  summary: DetailedMetrics;
  charts: ChartData[];
  funnels: ConversionFunnel[];
  topCampaigns: Array<{ campaignId: string; metrics: DetailedMetrics }>;
  generatedAt: Date;
  exportUrl: string | null;
}

// ============================================================
// ❌ 5. ERRORS & API RESPONSES
// ============================================================

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'TOKEN_EXPIRED'
  | 'INVALID_2FA_CODE';

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
  requestId?: string;
  timestamp: Date;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  pagination?: PaginationInfo;
  meta?: Record<string, unknown>;
}

// ============================================================
// 🏢 6. ORGANIZATION & TEAM TYPES
// ============================================================

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  userId: string;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'avatarUrl'>;
  role: TeamRole;
  joinedAt: Date;
  invitedBy: string;
  isActive: boolean;
  permissions: Permission[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  tier: UserTier;
  ownerId: string;
  members: TeamMember[];
  maxMembers: number;
  createdAt: Date;
  settings: {
    allowPublicCampaigns: boolean;
    requireApprovalForPublish: boolean;
    defaultCampaignTags: string[];
    brandKit: BrandKit | null;
  };
}

export interface BrandKit {
  id: string;
  organizationId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  fontFamily: string;
  customCss: string;
}

// ============================================================
// ✅ 7. VALIDATION TYPES
// ============================================================

export type ValidationRuleType = 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'custom';

export interface ValidationRule {
  type: ValidationRuleType;
  value?: number | string | RegExp;
  message: string;
  validator?: (value: unknown) => boolean;
}

export interface FieldValidation {
  field: string;
  rules: ValidationRule[];
  value: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;   // field → error messages
}

// ============================================================
// 🚩 8. FEATURE TOGGLE TYPE (runtime override)
// ============================================================

export interface FeatureToggle {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;          // 0–100
  enabledForTiers: UserTier[];
  enabledForUserIds: string[];        // specific user overrides
  description: string;
  updatedAt: Date;
}

// ============================================================
// 📤 CONVENIENCE RE-EXPORTS
// ============================================================

export type ID = string;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<ApiResponse<T>>;
