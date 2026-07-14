// ============================================================
// 🗄️  Brikes Maker Advertisement - Advance Super v1.0.0
// Advanced Data Management Service
// File: frontend/src/data.ts
// ============================================================

import type { ApiResponse, AsyncResult } from './types/advanced.types';
import { getConfig } from './config/wan21.config';
import AuthService from './services/auth';
import { createSecureId } from './utils/createId';

// ============================================================
// 📦 CACHE LAYER  (Redis-like in-memory store)
// ============================================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;          // Unix ms
  version: number;
  tags: string[];
}

class CacheStore {
  private store = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000;    // 5 minutes

  set<T>(key: string, data: T, ttlMs = this.DEFAULT_TTL, tags: string[] = []): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs, version: Date.now(), tags });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    return entry.data;
  }

  invalidate(key: string): void { this.store.delete(key); }

  /** Invalidate all keys that share a given tag. */
  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.store) {
      if (entry.tags.includes(tag)) this.store.delete(key);
    }
  }

  clear(): void { this.store.clear(); }

  stats(): { size: number; keys: string[] } {
    return { size: this.store.size, keys: [...this.store.keys()] };
  }
}

// ============================================================
// 📬 OFFLINE QUEUE
// ============================================================

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: unknown;
  timestamp: number;
  retries: number;
}

class OfflineQueue {
  private static readonly STORAGE_KEY = 'brk_offline_queue';

  private static load(): QueuedRequest[] {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  private static save(queue: QueuedRequest[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
  }

  static enqueue(req: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>): void {
    const queue = this.load();
    queue.push({ ...req, id: createSecureId(), timestamp: Date.now(), retries: 0 });
    this.save(queue);
  }

  static dequeue(): QueuedRequest | null {
    const queue = this.load();
    if (queue.length === 0) return null;
    const [first, ...rest] = queue;
    this.save(rest);
    return first ?? null;
  }

  static peek(): QueuedRequest[] { return this.load(); }

  static clear(): void { localStorage.removeItem(this.STORAGE_KEY); }
}

// ============================================================
// 🔄 DATA SYNCHRONIZATION
// ============================================================

type SyncStatus = 'idle' | 'syncing' | 'error';
type SyncListener = (status: SyncStatus) => void;

class SyncManager {
  private status: SyncStatus = 'idle';
  private listeners: SyncListener[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly SYNC_INTERVAL = 30_000;   // 30 s

  start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.flush(), this.SYNC_INTERVAL);
    window.addEventListener('online', () => this.flush());
  }

  stop(): void {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  onStatusChange(listener: SyncListener): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private setStatus(s: SyncStatus): void {
    this.status = s;
    this.listeners.forEach(l => l(s));
  }

  async flush(): Promise<void> {
    if (!navigator.onLine) return;
    const queue = OfflineQueue.peek();
    if (queue.length === 0) return;

    this.setStatus('syncing');
    let hasError = false;

    for (const req of queue) {
      try {
        const token = await AuthService.getValidToken();
        const requestInit: RequestInit = {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };

        if (req.body !== undefined) {
          requestInit.body = JSON.stringify(req.body);
        }

        const res = await fetch(req.url, requestInit);

        if (res.ok) {
          OfflineQueue.dequeue();
        } else if (res.status >= 500) {
          hasError = true; break;
        } else {
          // 4xx — drop unrecoverable requests
          OfflineQueue.dequeue();
        }
      } catch {
        hasError = true; break;
      }
    }

    this.setStatus(hasError ? 'error' : 'idle');
  }
}

// ============================================================
// 🗜️ DATA COMPRESSION  (simple JSON + LZ-style stub)
// ============================================================

const Compressor = {
  /** Serialize and Base64-encode data for compact storage. */
  compress(data: unknown): string {
    return btoa(encodeURIComponent(JSON.stringify(data)));
  },
  decompress<T>(encoded: string): T {
    return JSON.parse(decodeURIComponent(atob(encoded))) as T;
  },
};

// ============================================================
// 🏛️ DATA VERSION CONTROL
// ============================================================

interface DataVersion<T> {
  version: number;
  data: T;
  createdAt: number;
  checksum: string;
}

class VersionControl {
  private static readonly MAX_VERSIONS = 10;

  private static storageKey(id: string): string { return `brk_vc_${id}`; }

  static async save<T>(id: string, data: T): Promise<void> {
    const existing = this.getAll<T>(id);
    const checksum = await this._hash(JSON.stringify(data));
    const entry: DataVersion<T> = { version: Date.now(), data, createdAt: Date.now(), checksum };
    const versions = [entry, ...existing].slice(0, this.MAX_VERSIONS);
    localStorage.setItem(this.storageKey(id), Compressor.compress(versions));
  }

  static getLatest<T>(id: string): T | null {
    const versions = this.getAll<T>(id);
    return versions[0]?.data ?? null;
  }

  static getAll<T>(id: string): DataVersion<T>[] {
    const raw = localStorage.getItem(this.storageKey(id));
    if (!raw) return [];
    try { return Compressor.decompress<DataVersion<T>[]>(raw); }
    catch { return []; }
  }

  static rollback<T>(id: string, version: number): T | null {
    const entry = this.getAll<T>(id).find(v => v.version === version);
    return entry?.data ?? null;
  }

  private static async _hash(input: string): Promise<string> {
    if (typeof globalThis.crypto?.subtle?.digest === 'function') {
      const buf = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // LAN HTTP does not expose SubtleCrypto. This checksum detects local version
    // corruption; it is not used for passwords, signatures or authentication.
    let hash = 0x811c9dc5;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }
}

// ============================================================
// 💾 MAIN DATA SERVICE
// ============================================================

export const cache = new CacheStore();
export const syncManager = new SyncManager();

export const INITIAL_CAMPAIGNS = [
  {
    id: "campaign-obsidian-facade",
    name: "Obsidian Facade Launch",
    productName: "Obsidian Facade Launch",
    description: "Premium masonry campaign for luxury villas and architectural studios.",
    tone: "Luxury Enterprise",
    targetAudience: "Architects, builders, and high-net-worth homeowners",
    status: "Active",
    createdAt: "2026-06-20",
    updatedAt: "2026-06-26",
    spend: 4200,
    impressions: 184500,
    clicks: 9250,
    conversions: 318,
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    adCopy: {
      headlines: ["Build With Presence", "Luxury Masonry, Reimagined", "Facades That Command"],
      primaryText: "Create a landmark exterior with precision-made masonry, curated textures, and premium structural finish.",
      hashtags: ["#BrickMaker", "#LuxuryMasonry", "#ArchitecturalDesign"],
      imagePrompt: "Luxury villa facade with premium brick texture, warm gold lighting, cinematic architectural photography",
      demographics: {
        ageRange: "28-55",
        interests: ["Architecture", "Luxury homes", "Construction"],
        channelFocus: "LinkedIn"
      }
    },
    pamphlet: {
      title: "Obsidian Facade System",
      subtitle: "Premium architectural masonry for landmark builds",
      aboutProduct: "A polished masonry presentation built for villas, showrooms, and high-end development launches.",
      keyBenefits: [
        { label: "Premium Finish", description: "Sharp texture, rich contrast, and refined structural presence." },
        { label: "Fast Planning", description: "Ready-to-adapt layouts for quick client presentations." },
        { label: "Print Ready", description: "Designed for crisp digital and physical campaign output." }
      ],
      ctaTitle: "Book Design Consultation",
      ctaPhone: "+91 98765 43210",
      ctaWebsite: "brickmaker.studio",
      imagePrompt: "Obsidian brick facade brochure with gold accents and luxury construction visuals",
      designTheme: "gold"
    }
  },
  {
    id: "campaign-school-admission",
    name: "School Admission Flyer",
    productName: "School Admission Flyer",
    description: "Enrollment promotion template for schools and coaching institutes.",
    tone: "Trustworthy and aspirational",
    targetAudience: "Parents and students",
    status: "Paused",
    createdAt: "2026-06-18",
    updatedAt: "2026-06-25",
    spend: 1800,
    impressions: 96500,
    clicks: 4100,
    conversions: 142,
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80",
    adCopy: {
      headlines: ["Admissions Open", "Shape Tomorrow", "Learn With Confidence"],
      primaryText: "Promote admissions with a polished flyer that feels credible, warm, and action focused.",
      hashtags: ["#AdmissionsOpen", "#Education", "#SchoolMarketing"],
      imagePrompt: "Modern school admission flyer with students, clean academic layout, blue and gold accents",
      demographics: {
        ageRange: "24-48",
        interests: ["Education", "Parenting", "School admission"],
        channelFocus: "Meta"
      }
    }
  },
  {
    id: "campaign-restaurant-menu",
    name: "Restaurant Menu Promotion",
    productName: "Restaurant Menu Promotion",
    description: "High-conversion menu and offer campaign for restaurants.",
    tone: "Warm and premium",
    targetAudience: "Local diners and food lovers",
    status: "Active",
    createdAt: "2026-06-14",
    updatedAt: "2026-06-24",
    spend: 2600,
    impressions: 132800,
    clicks: 7150,
    conversions: 256,
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    adCopy: {
      headlines: ["Taste The Signature", "Reserve The Moment", "Premium Dining Offers"],
      primaryText: "Turn your menu into a visual campaign with polished offers, rich imagery, and clear calls to action.",
      hashtags: ["#RestaurantMarketing", "#MenuDesign", "#FoodOffers"],
      imagePrompt: "Elegant restaurant menu advertisement with warm lighting and premium dish photography",
      demographics: {
        ageRange: "18-45",
        interests: ["Dining", "Food delivery", "Restaurants"],
        channelFocus: "Google"
      }
    }
  }
] as any[];

export const INITIAL_PROJECTS = [
  {
    id: "project-business-flyer",
    priority: "High",
    createdAt: "2026-06-22",
    name: "Business Flyer Pack",
    description: "Premium promotional flyer set for local business launches.",
    category: "Business Promotion",
    projectType: "Flyer",
    language: "English",
    theme: "Brick Gold",
    targetAudience: "Business owners",
    deadline: "2026-07-05",
    outputFormat: "Print Ready",
    status: "In Progress",
    isPinned: true,
    assets: []
  },
  {
    id: "project-corporate-brochure",
    priority: "Medium",
    createdAt: "2026-06-19",
    name: "Corporate Brochure",
    description: "Company capability brochure with premium service sections.",
    category: "Corporate",
    projectType: "Brochure",
    language: "English",
    theme: "Midnight Black",
    targetAudience: "Enterprise clients",
    deadline: "2026-07-10",
    outputFormat: "PDF",
    status: "Not Started",
    isPinned: false,
    assets: []
  }
] as any[];

export const PLATFORM_DATA = [
  { name: "LinkedIn Ads", value: 3500, color: "#f59e0b" },
  { name: "Meta Ads", value: 4200, color: "#d97706" },
  { name: "Google Display", value: 6000, color: "#b45309" },
  { name: "YouTube Video", value: 1200, color: "#78350f" }
];

const DataService = {

  // ----------------------------------------------------------
  // 1️⃣  GENERIC FETCH  (with cache + offline support)
  // ----------------------------------------------------------

  async get<T>(
    endpoint: string,
    cacheKey?: string,
    ttlMs?: number,
    tags: string[] = [],
  ): AsyncResult<T> {
    // Cache hit
    if (cacheKey) {
      const cached = cache.get<T>(cacheKey);
      if (cached) return { success: true, data: cached, error: null };
    }

    if (!navigator.onLine) {
      return { success: false, data: null,
        error: { code: 'NETWORK_ERROR', message: 'Device is offline', timestamp: new Date() } };
    }

    try {
      const res = await this._fetch(endpoint);
      const data: ApiResponse<T> = await res.json();
      if (data.success && data.data && cacheKey) {
        cache.set(cacheKey, data.data, ttlMs, tags);
      }
      return data;
    } catch (err) {
      return this._networkError<T>(err);
    }
  },

  // ----------------------------------------------------------
  // 2️⃣  MUTATING REQUESTS  (with offline queue)
  // ----------------------------------------------------------

  async post<T>(endpoint: string, body: unknown): AsyncResult<T> {
    return this._mutate('POST', endpoint, body) as AsyncResult<T>;
  },

  async put<T>(endpoint: string, body: unknown): AsyncResult<T> {
    return this._mutate('PUT', endpoint, body) as AsyncResult<T>;
  },

  async patch<T>(endpoint: string, body: unknown): AsyncResult<T> {
    return this._mutate('PATCH', endpoint, body) as AsyncResult<T>;
  },

  async delete<T>(endpoint: string): AsyncResult<T> {
    return this._mutate('DELETE', endpoint, undefined) as AsyncResult<T>;
  },

  // ----------------------------------------------------------
  // 3️⃣  PAGINATED DATA
  // ----------------------------------------------------------

  async getPaginated<T>(
    endpoint: string,
    page = 1,
    pageSize = 20,
    cacheKey?: string,
  ): AsyncResult<T[]> {
    const url = `${endpoint}?page=${page}&pageSize=${pageSize}`;
    return this.get(url, cacheKey ? `${cacheKey}_p${page}` : undefined) as AsyncResult<T[]>;
  },

  // ----------------------------------------------------------
  // 4️⃣  VERSIONED DATA OPERATIONS
  // ----------------------------------------------------------

  async saveWithVersion<T>(id: string, data: T): Promise<void> {
    await VersionControl.save(id, data);
  },

  getLatestVersion<T>(id: string): T | null {
    return VersionControl.getLatest<T>(id);
  },

  getAllVersions<T>(id: string) {
    return VersionControl.getAll<T>(id);
  },

  rollbackTo<T>(id: string, version: number): T | null {
    return VersionControl.rollback<T>(id, version);
  },

  // ----------------------------------------------------------
  // 5️⃣  CACHE HELPERS
  // ----------------------------------------------------------

  invalidateCache(key: string): void { cache.invalidate(key); },
  invalidateCacheByTag(tag: string): void { cache.invalidateByTag(tag); },
  clearCache(): void { cache.clear(); },
  cacheStats() { return cache.stats(); },

  // ----------------------------------------------------------
  // 6️⃣  SYNC CONTROL
  // ----------------------------------------------------------

  startSync(): void  { syncManager.start(); },
  stopSync(): void   { syncManager.stop(); },
  flushQueue(): Promise<void> { return syncManager.flush(); },
  onSyncStatus(cb: SyncListener) { return syncManager.onStatusChange(cb); },
  offlineQueueSize(): number { return OfflineQueue.peek().length; },

  // ----------------------------------------------------------
  // 🔧 PRIVATE HELPERS
  // ----------------------------------------------------------

  async _fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const { baseUrl, timeout } = getConfig().api;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    const token   = await AuthService.getValidToken();
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeout);

    try {
      return await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers ?? {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } finally {
      clearTimeout(tid);
    }
  },

  async _mutate<T>(method: string, endpoint: string, body: unknown): AsyncResult<T> {
    if (!navigator.onLine) {
      OfflineQueue.enqueue({ url: endpoint, method, body });
      return { success: true, data: null,
        error: null,
      } as ApiResponse<T>;
    }

    try {
      const requestInit: RequestInit = {
        method,
      };

      if (body !== undefined) {
        requestInit.body = JSON.stringify(body);
      }

      const res = await this._fetch(endpoint, requestInit);
      return await res.json();
    } catch (err) {
      // Queue for later if network fails mid-flight
      if (method !== 'GET') OfflineQueue.enqueue({ url: endpoint, method, body });
      return this._networkError<T>(err);
    }
  },

  _networkError<T>(err: unknown): ApiResponse<T> {
    console.error('Data service error:', err);
    return {
      success: false, data: null,
      error: { code: 'NETWORK_ERROR', message: 'Network request failed', timestamp: new Date() },
    } as ApiResponse<T>;
  },
};

export default DataService;
export { CacheStore, OfflineQueue, SyncManager, VersionControl, Compressor };

