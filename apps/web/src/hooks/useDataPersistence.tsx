'use client';

import { useEffect, useCallback } from 'react';

interface CacheOptions {
  key: string;
  data: any;
  ttl?: number; // Time to live in milliseconds
}

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

export const useDataPersistence = () => {
  const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  const setCache = useCallback(
    ({ key, data, ttl = DEFAULT_TTL }: CacheOptions) => {
      try {
        const cacheItem: CacheItem = {
          data,
          timestamp: Date.now(),
          ttl,
        };
        localStorage.setItem(key, JSON.stringify(cacheItem));
        console.log(`💾 Data cached for key: ${key}`);
      } catch (error) {
        console.warn(`Failed to cache data for key ${key}:`, error);
      }
    },
    [DEFAULT_TTL]
  );

  const getCache = useCallback((key: string) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem = JSON.parse(cached);
      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;

      if (isExpired) {
        localStorage.removeItem(key);
        console.log(`🗑️ Expired cache removed for key: ${key}`);
        return null;
      }

      console.log(`📱 Data loaded from cache for key: ${key}`);
      return cacheItem.data;
    } catch (error) {
      console.warn(`Failed to load cache for key ${key}:`, error);
      localStorage.removeItem(key);
      return null;
    }
  }, []);

  const clearCache = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Cache cleared for key: ${key}`);
    } catch (error) {
      console.warn(`Failed to clear cache for key ${key}:`, error);
    }
  }, []);

  const clearAllCache = useCallback(() => {
    try {
      // Clear all 50brains related cache
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith('50brains_')
      );
      keys.forEach((key) => localStorage.removeItem(key));
      console.log('🗑️ All app cache cleared');
    } catch (error) {
      console.warn('Failed to clear all cache:', error);
    }
  }, []);

  // Cache management for page data
  const cachePageData = useCallback(
    (page: string, data: any, ttl?: number) => {
      setCache({ key: `50brains_page_${page}`, data, ttl });
    },
    [setCache]
  );

  const getPageData = useCallback(
    (page: string) => {
      return getCache(`50brains_page_${page}`);
    },
    [getCache]
  );

  // Form data persistence (for when user is filling forms)
  const cacheFormData = useCallback(
    (formId: string, data: any) => {
      setCache({
        key: `50brains_form_${formId}`,
        data,
        ttl: 60 * 60 * 1000, // 1 hour for forms
      });
    },
    [setCache]
  );

  const getFormData = useCallback(
    (formId: string) => {
      return getCache(`50brains_form_${formId}`);
    },
    [getCache]
  );

  const clearFormData = useCallback(
    (formId: string) => {
      clearCache(`50brains_form_${formId}`);
    },
    [clearCache]
  );

  // Navigation state persistence
  const cacheNavState = useCallback(
    (state: any) => {
      setCache({
        key: '50brains_nav_state',
        data: state,
        ttl: 24 * 60 * 60 * 1000, // 24 hours
      });
    },
    [setCache]
  );

  const getNavState = useCallback(() => {
    return getCache('50brains_nav_state');
  }, [getCache]);

  // Auto-save functionality
  const setupAutoSave = useCallback(
    (
      formId: string,
      getData: () => any,
      interval: number = 30000 // 30 seconds
    ) => {
      const autoSaveInterval = setInterval(() => {
        const data = getData();
        if (data && Object.keys(data).length > 0) {
          cacheFormData(formId, data);
        }
      }, interval);

      return () => clearInterval(autoSaveInterval);
    },
    [cacheFormData]
  );

  return {
    setCache,
    getCache,
    clearCache,
    clearAllCache,
    cachePageData,
    getPageData,
    cacheFormData,
    getFormData,
    clearFormData,
    cacheNavState,
    getNavState,
    setupAutoSave,
  };
};
