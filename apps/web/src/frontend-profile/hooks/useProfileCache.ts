// hooks/useProfileCache.ts - Client-side caching for profile data
import { useState, useCallback } from 'react';
import { CompleteProfileData } from '../types/profile.types';

interface CacheEntry {
  data: CompleteProfileData;
  timestamp: number;
  expiresAt: number;
}

class ProfileCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 60 * 1000; // 60 seconds

  set(
    key: string,
    data: CompleteProfileData,
    ttl: number = this.DEFAULT_TTL
  ): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  get(key: string): CompleteProfileData | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  isValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    return Date.now() <= entry.expiresAt;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Get cache info for debugging
  getInfo(key: string): { age: number; expiresIn: number } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    return {
      age: now - entry.timestamp,
      expiresIn: entry.expiresAt - now,
    };
  }
}

// Singleton cache instance
const profileCache = new ProfileCache();

export const useProfileCache = () => {
  const [cacheKeys] = useState(() => new Set<string>());

  const getCacheKey = useCallback((userId?: string): string => {
    return userId ? `profile_${userId}` : 'profile_me';
  }, []);

  const getFromCache = useCallback(
    (userId?: string): CompleteProfileData | null => {
      const key = getCacheKey(userId);
      return profileCache.get(key);
    },
    [getCacheKey]
  );

  const setInCache = useCallback(
    (data: CompleteProfileData, userId?: string, ttl?: number): void => {
      const key = getCacheKey(userId);
      profileCache.set(key, data, ttl);
      cacheKeys.add(key);
    },
    [getCacheKey, cacheKeys]
  );

  const isValidInCache = useCallback(
    (userId?: string): boolean => {
      const key = getCacheKey(userId);
      return profileCache.isValid(key);
    },
    [getCacheKey]
  );

  const clearFromCache = useCallback(
    (userId?: string): void => {
      const key = getCacheKey(userId);
      profileCache.clear(key);
      cacheKeys.delete(key);
    },
    [getCacheKey, cacheKeys]
  );

  const getCacheInfo = useCallback(
    (userId?: string) => {
      const key = getCacheKey(userId);
      return profileCache.getInfo(key);
    },
    [getCacheKey]
  );

  return {
    getFromCache,
    setInCache,
    isValidInCache,
    clearFromCache,
    getCacheInfo,
  };
};

export default profileCache;
