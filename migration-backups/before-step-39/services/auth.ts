// ============================================================
// 🔐 Brikes Maker Advertisement - Advance Super v1.0.0
// Authentication Service
// File: frontend/src/services/auth.service.ts
// ============================================================

import type {
  User, AuthToken, ApiKey, TwoFactorSetup,
  ApiResponse, AsyncResult, OAuthProvider, Permission
} from '../types/advanced.types';
import { getConfig, getApiUrl, is2FAEnabled } from '../config/wan21.config';

// ============================================================
// 🗄️  TOKEN STORAGE (internal)
// ============================================================

class TokenStorage {
  private static readonly ACCESS_KEY  = 'brk_access_token';
  private static readonly REFRESH_KEY = 'brk_refresh_token';
  private static readonly EXPIRY_KEY  = 'brk_token_expiry';

  static save(token: AuthToken): void {
    localStorage.setItem(this.ACCESS_KEY,  token.accessToken);
    localStorage.setItem(this.REFRESH_KEY, token.refreshToken);
    localStorage.setItem(this.EXPIRY_KEY,  String(token.expiresAt));
  }

  static getAccess(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  static getRefresh(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  static isExpired(): boolean {
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() >= Number(expiry);
  }

  static willExpireSoon(): boolean {
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (!expiry) return true;
    const { renewBeforeExpiry } = getConfig().auth.session;
    return Date.now() >= Number(expiry) - renewBeforeExpiry;
  }

  static clear(): void {
    [this.ACCESS_KEY, this.REFRESH_KEY, this.EXPIRY_KEY]
      .forEach(k => localStorage.removeItem(k));
  }
}

// ============================================================
// 👤 SESSION MANAGER (internal)
// ============================================================

class SessionManager {
  private static readonly SESSION_KEY = 'brk_session_user';
  private static timeoutId: ReturnType<typeof setTimeout> | null = null;

  static save(user: User): void {
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    this.resetTimeout();
  }

  static get(): User | null {
    const raw = sessionStorage.getItem(this.SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as User; }
    catch { return null; }
  }

  static clear(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  static resetTimeout(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    const { timeout } = getConfig().auth.session;
    this.timeoutId = setTimeout(() => {
      console.warn('⏰ Session expired — logging out');
      AuthService.logout();
    }, timeout);
  }
}

// ============================================================
// 🔐 MAIN AUTHENTICATION SERVICE
// ============================================================

const AuthService = {

  // ----------------------------------------------------------
  // 1️⃣  EMAIL / PASSWORD LOGIN
  // ----------------------------------------------------------

  async login(email: string, password: string): AsyncResult<AuthToken> {
    try {
      const res = await fetch(`${getApiUrl('auth')}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: ApiResponse<AuthToken> = await res.json();
      if (data.success && data.data) {
        TokenStorage.save(data.data);
        await this._loadAndSaveSession();
      }
      return data;
    } catch (err) {
      return this._networkError<AuthToken>(err);
    }
  },

  // ----------------------------------------------------------
  // 2️⃣  OAUTH 2.0
  // ----------------------------------------------------------

  /**
   * Step 1 — redirect user to the provider's consent screen.
   * Stores a random `state` value in sessionStorage to prevent CSRF.
   */
  initiateOAuth(provider: OAuthProvider): void {
    const config = getConfig().auth.providers[provider];
    if (!config?.enabled) throw new Error(`OAuth provider "${provider}" is not enabled`);

    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_nonce', nonce);
    sessionStorage.setItem('oauth_provider', provider);

    const params = new URLSearchParams({
      client_id:     config.clientId,
      redirect_uri:  config.redirectUri,
      response_type: 'code',
      scope:         config.scopes.join(' '),
      state,
      nonce,
    });

    const urls: Record<OAuthProvider, string> = {
      google:    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      github:    `https://github.com/login/oauth/authorize?${params}`,
      microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`,
    };

    const providerUrl = urls[provider];

    if (!providerUrl) {
      throw new Error(`OAuth URL is not configured for "${provider}"`);
    }

    window.location.href = providerUrl;
  },

  /**
   * Step 2 — exchange the authorization code for tokens.
   * Called from the /auth/callback route.
   */
  async handleOAuthCallback(code: string, state: string): AsyncResult<AuthToken> {
    const savedState    = sessionStorage.getItem('oauth_state');
    const savedProvider = sessionStorage.getItem('oauth_provider');

    if (state !== savedState) {
      return { success: false, data: null,
        error: { code: 'UNAUTHORIZED', message: 'OAuth state mismatch — possible CSRF', timestamp: new Date() } };
    }

    try {
      const res = await fetch(`${getApiUrl('auth')}/oauth/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state, provider: savedProvider }),
      });

      const data: ApiResponse<AuthToken> = await res.json();
      if (data.success && data.data) {
        TokenStorage.save(data.data);
        await this._loadAndSaveSession();
        ['oauth_state', 'oauth_nonce', 'oauth_provider'].forEach(k => sessionStorage.removeItem(k));
      }
      return data;
    } catch (err) {
      return this._networkError<AuthToken>(err);
    }
  },

  // ----------------------------------------------------------
  // 3️⃣  TOKEN MANAGEMENT
  // ----------------------------------------------------------

  async refreshAccessToken(): AsyncResult<AuthToken> {
    const refreshToken = TokenStorage.getRefresh();
    if (!refreshToken) {
      return { success: false, data: null,
        error: { code: 'UNAUTHORIZED', message: 'No refresh token found', timestamp: new Date() } };
    }

    try {
      const res = await fetch(`${getApiUrl('auth')}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data: ApiResponse<AuthToken> = await res.json();
      if (data.success && data.data) {
        TokenStorage.save(data.data);
        SessionManager.resetTimeout();
      }
      return data;
    } catch (err) {
      return this._networkError<AuthToken>(err);
    }
  },

  getAccessToken(): string | null {
    return TokenStorage.getAccess();
  },

  isAuthenticated(): boolean {
    return !!TokenStorage.getAccess() && !TokenStorage.isExpired();
  },

  /** Returns a valid token, refreshing silently if it will expire soon. */
  async getValidToken(): Promise<string | null> {
    if (TokenStorage.willExpireSoon()) {
      const result = await this.refreshAccessToken();
      if (!result.success) return null;
    }
    return TokenStorage.getAccess();
  },

  // ----------------------------------------------------------
  // 4️⃣  TWO-FACTOR AUTHENTICATION (2FA / TOTP)
  // ----------------------------------------------------------

  async enable2FA(): AsyncResult<TwoFactorSetup> {
    if (!is2FAEnabled()) {
      return { success: false, data: null,
        error: { code: 'FORBIDDEN', message: '2FA is not enabled in config', timestamp: new Date() } };
    }

    try {
      const res = await this._authorizedFetch(`${getApiUrl('auth')}/2fa/enable`, { method: 'POST' });
      return await res.json();
    } catch (err) {
      return this._networkError<AuthToken>(err);
    }
  },

  async verify2FACode(code: string): AsyncResult<{ verified: boolean }> {
    try {
      const res = await this._authorizedFetch(`${getApiUrl('auth')}/2fa/verify`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      return await res.json();
    } catch (err) {
      return this._networkError<AuthToken>(err);
    }
  },

  async disable2FA(code: string): AsyncResult<{ disabled: boolean }> {
    try {
      const res = await this._authorizedFetch(`${getApiUrl('auth')}/2fa/disable`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      return await res.json();
    } catch (err) {
      return this._networkError<AuthToken>(err);
    }
  },

  // ----------------------------------------------------------
  // 5️⃣  API KEY MANAGEMENT
  // ----------------------------------------------------------

  async createApiKey(name: string, scopes: string[] = []): AsyncResult<ApiKey & { rawKey: string }> {
    try {
      const res = await this._authorizedFetch(`${getApiUrl('auth')}/api-keys`, {
        method: 'POST',
        body: JSON.stringify({ name, scopes }),
      });
      return await res.json();
    } catch (err) {
      return this._networkError<AuthToken>(err);
    }
  },

  async getApiKeys(): AsyncResult<ApiKey[]> {
    try {
      const res = await this._authorizedFetch(`${getApiUrl('auth')}/api-keys`);
      return await res.json();
    } catch (err) {
      return this._networkError<AuthToken>(err);
    }
  },

  async revokeApiKey(keyId: string): AsyncResult<{ revoked: boolean }> {
    try {
      const res = await this._authorizedFetch(`${getApiUrl('auth')}/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err) {
      return this._networkError<AuthToken>(err);
    }
  },

  // ----------------------------------------------------------
  // 6️⃣  SESSION & PROFILE
  // ----------------------------------------------------------

  getCurrentUser(): User | null {
    return SessionManager.get();
  },

  async fetchCurrentUser(): AsyncResult<User> {
    try {
      const res = await this._authorizedFetch(`${getApiUrl('users')}/me`);
      const data: ApiResponse<User> = await res.json();
      if (data.success && data.data) SessionManager.save(data.data);
      return data;
    } catch (err) {
      return this._networkError<AuthToken>(err);
    }
  },

  hasPermission(resource: string, action: string): boolean {
    const user = SessionManager.get();
    if (!user) return false;
    return user.permissions.some(
      (p: Permission) => p.resource === resource && p.actions.includes(action as never)
    );
  },

  async logout(): Promise<void> {
    try {
      const token = TokenStorage.getAccess();
      if (token) {
        await fetch(`${getApiUrl('auth')}/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {}); // best-effort
      }
    } finally {
      TokenStorage.clear();
      SessionManager.clear();
      window.location.href = '/login';
    }
  },

  // ----------------------------------------------------------
  // 🔧 PRIVATE HELPERS
  // ----------------------------------------------------------

  async _authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getValidToken();
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },

  async _loadAndSaveSession(): Promise<void> {
    try {
      const result = await this.fetchCurrentUser();
      if (result.success && result.data) SessionManager.save(result.data);
    } catch { /* non-fatal */ }
  },

  _networkError<T>(err: unknown): ApiResponse<T> {
    console.error('Auth network error:', err);
    return {
      success: false, data: null,
      error: { code: 'NETWORK_ERROR', message: 'Network request failed', timestamp: new Date() },
    } as ApiResponse<T>;
  },
};

export default AuthService;
export { TokenStorage, SessionManager };

