/**
 * Intelligence Cache Service
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 26: Cache Invalidation & Request Hashing Engine
 */

import { env } from '../../config/env.js';

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
  inputHash: string;
  modelVersion: string;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs: number;

  constructor() {
    this.defaultTtlMs = (env.INTELLIGENCE_CACHE_TTL || 900) * 1000;
  }

  /**
   * Generates a deterministic cache key
   */
  public generateKey(entityType: string, entityId: string, modelVersion: string = '1.0.0'): string {
    return `${entityType.toLowerCase()}:${entityId.toLowerCase()}:${modelVersion}`;
  }

  /**
   * Simple hash utility for request input snapshots
   */
  public hashInput(input: unknown): string {
    const str = JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `hash-${Math.abs(hash).toString(16)}`;
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public set<T>(
    key: string,
    data: T,
    inputHash: string,
    modelVersion: string,
    customTtlMs?: number
  ): void {
    const ttl = customTtlMs || this.defaultTtlMs;
    const now = Date.now();
    this.cache.set(key, {
      data,
      cachedAt: now,
      expiresAt: now + ttl,
      inputHash,
      modelVersion,
    });
  }

  public invalidate(entityType: string, entityId: string): void {
    const prefix = `${entityType.toLowerCase()}:${entityId.toLowerCase()}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  public invalidateAll(): void {
    this.cache.clear();
  }
}

export const intelligenceCache = new CacheService();
