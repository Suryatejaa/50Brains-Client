// hooks/useReputationCache.ts - Client-side reputation caching system
'use client';

import { useCallback } from 'react';
import type { ReputationData } from '../lib/reputation-service';

interface CacheEntry {
  data: ReputationData;
  timestamp: number;
  expiry: number;
}

interface CacheInfo {
  age: number; // milliseconds since cached
  expiresIn: number; // milliseconds until expiry
}

class ReputationCache {
  private static instance: ReputationCache;
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes for reputation data

  public static getInstance(): ReputationCache {
    if (!ReputationCache.instance) {
      ReputationCache.instance = new ReputationCache();
    }
    return ReputationCache.instance;
  }

  // Generate cache key for user reputation
  private getCacheKey(
    userId: string,
    type: 'reputation' | 'leaderboard' = 'reputation'
  ): string {
    return `${type}:${userId}`;
  }

  // Check if cache entry is valid
  isValidInCache(userId: string, type?: 'reputation' | 'leaderboard'): boolean {
    const key = this.getCacheKey(userId, type);
    const entry = this.cache.get(key);

    if (!entry) return false;

    const now = Date.now();
    const isValid = now < entry.expiry;

    if (!isValid) {
      console.log(`🗑️ [ReputationCache] Expired cache for ${key}`);
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Get cached reputation data
  getFromCache(
    userId: string,
    type?: 'reputation' | 'leaderboard'
  ): ReputationData | null {
    const key = this.getCacheKey(userId, type);

    if (!this.isValidInCache(userId, type)) {
      return null;
    }

    const entry = this.cache.get(key);
    if (entry) {
      console.log(`📦 [ReputationCache] Cache hit for ${key}`);
      return entry.data;
    }

    return null;
  }

  // Set reputation data in cache
  setInCache(
    data: ReputationData,
    userId: string,
    ttlMs?: number,
    type?: 'reputation' | 'leaderboard'
  ): void {
    const key = this.getCacheKey(userId, type);
    const now = Date.now();
    const ttl = ttlMs || this.DEFAULT_TTL;

    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiry: now + ttl,
    };

    this.cache.set(key, entry);
    console.log(`💾 [ReputationCache] Cached ${key} for ${ttl}ms`);
  }

  // Clear specific user's reputation cache
  clearUser(userId: string): void {
    const reputationKey = this.getCacheKey(userId, 'reputation');
    const leaderboardKey = this.getCacheKey(userId, 'leaderboard');

    let cleared = 0;
    if (this.cache.delete(reputationKey)) cleared++;
    if (this.cache.delete(leaderboardKey)) cleared++;

    if (cleared > 0) {
      console.log(
        `🗑️ [ReputationCache] Cleared ${cleared} cache entries for user ${userId}`
      );
    }
  }

  // Clear all reputation cache
  clearAll(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ [ReputationCache] Cleared all cache (${size} entries)`);
  }

  // Get cache info for debugging
  getCacheInfo(
    userId: string,
    type?: 'reputation' | 'leaderboard'
  ): CacheInfo | null {
    const key = this.getCacheKey(userId, type);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    return {
      age: now - entry.timestamp,
      expiresIn: entry.expiry - now,
    };
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    this.cache.forEach((entry) => {
      if (now < entry.expiry) {
        valid++;
      } else {
        expired++;
      }
    });

    return {
      total: this.cache.size,
      valid,
      expired,
    };
  }
}

export const useReputationCache = () => {
  const cache = ReputationCache.getInstance();

  const setCache = useCallback(
    (
      userId: string,
      data: ReputationData,
      ttlMs?: number,
      type?: 'reputation' | 'leaderboard'
    ) => {
      cache.setInCache(data, userId, ttlMs, type);
    },
    [cache]
  );

  const getCache = useCallback(
    (userId: string, type?: 'reputation' | 'leaderboard') => {
      return cache.getFromCache(userId, type);
    },
    [cache]
  );

  const isValidInCache = useCallback(
    (userId: string, type?: 'reputation' | 'leaderboard') => {
      return cache.isValidInCache(userId, type);
    },
    [cache]
  );

  const clearUser = useCallback(
    (userId: string) => {
      cache.clearUser(userId);
    },
    [cache]
  );

  const clearAll = useCallback(() => {
    cache.clearAll();
  }, [cache]);

  const getCacheInfo = useCallback(
    (userId: string, type?: 'reputation' | 'leaderboard') => {
      return cache.getCacheInfo(userId, type);
    },
    [cache]
  );

  const getStats = useCallback(() => {
    return cache.getStats();
  }, [cache]);

  return {
    setCache,
    getCache,
    isValidInCache,
    clearUser,
    clearAll,
    getCacheInfo,
    getStats,
  };
};

// Export singleton instance for direct cache clearing
export const reputationCacheInstance = ReputationCache.getInstance();
