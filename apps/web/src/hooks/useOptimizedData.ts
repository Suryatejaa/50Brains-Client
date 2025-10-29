// hooks/useOptimizedData.ts
import { useState, useEffect, useCallback } from 'react';

interface CacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
}

interface OptimizedDataHook<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOptimizedData<T>(
  fetchFunction: () => Promise<T>,
  cacheConfig?: CacheConfig
): OptimizedDataHook<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = useCallback((): T | null => {
    if (!cacheConfig) return null;

    try {
      const cached = localStorage.getItem(cacheConfig.key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > cacheConfig.ttl) {
        localStorage.removeItem(cacheConfig.key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }, [cacheConfig]);

  const setCachedData = useCallback(
    (data: T) => {
      if (!cacheConfig) return;

      try {
        localStorage.setItem(
          cacheConfig.key,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      } catch {
        // Storage quota exceeded or other error
      }
    },
    [cacheConfig]
  );

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      setCachedData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, setCachedData]);

  useEffect(() => {
    // Check cache first
    const cached = getCachedData();
    if (cached) {
      setData(cached);
      setLoading(false);

      // Optionally refresh in background
      fetchFunction()
        .then((fresh) => {
          setData(fresh);
          setCachedData(fresh);
        })
        .catch(() => {
          // Keep cached data if refresh fails
        });

      return;
    }

    // No cache, fetch fresh data
    refetch();
  }, [refetch, getCachedData, fetchFunction, setCachedData]);

  return { data, loading, error, refetch };
}

// Pre-built hooks for common pages
export function useDashboardData() {
  return useOptimizedData(
    async () => {
      // Parallel requests for faster loading
      const [profile, stats, notifications] = await Promise.all([
        fetch('/api/user/profile').then((r) => r.json()),
        fetch('/api/user/stats').then((r) => r.json()),
        fetch('/api/notifications?limit=5').then((r) => r.json()),
      ]);

      return { profile, stats, notifications };
    },
    { key: 'dashboard-data', ttl: 5 * 60 * 1000 } // 5 minutes cache
  );
}

export function useMyGigsData() {
  return useOptimizedData(
    async () => {
      const response = await fetch('/api/my/gigs?limit=10');
      return response.json();
    },
    { key: 'my-gigs-data', ttl: 2 * 60 * 1000 } // 2 minutes cache
  );
}

export function useMarketplaceData() {
  return useOptimizedData(
    async () => {
      const [featured, recent, categories] = await Promise.all([
        fetch('/api/gigs/featured?limit=6').then((r) => r.json()),
        fetch('/api/gigs/recent?limit=12').then((r) => r.json()),
        fetch('/api/gigs/categories').then((r) => r.json()),
      ]);

      return { featured, recent, categories };
    },
    { key: 'marketplace-data', ttl: 10 * 60 * 1000 } // 10 minutes cache
  );
}
