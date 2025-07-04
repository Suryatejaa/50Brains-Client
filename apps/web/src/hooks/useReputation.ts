// hooks/useReputation.ts - Client-side reputation hook with caching
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useReputationCache } from './useReputationCache';
import { reputationClient } from '../lib/reputation-client';
import type { ReputationData } from '../lib/reputation-service';

interface UseReputationState {
  reputation: ReputationData | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface UseReputationReturn extends UseReputationState {
  refreshReputation: () => Promise<void>;
  forceRefreshReputation: () => Promise<void>;
  cacheInfo: { age: number; expiresIn: number } | null;
}

export const useReputation = (userId?: string): UseReputationReturn => {
  const { user, isAuthenticated } = useAuth();
  const targetUserId = userId || user?.id || '';

  const { getCache, setCache, isValidInCache, clearUser, getCacheInfo } =
    useReputationCache();

  const [state, setState] = useState<UseReputationState>({
    reputation: null,
    isLoading: false,
    error: null,
    isAuthenticated,
  });

  // Fetch reputation data
  const fetchReputation = useCallback(
    async (forceRefresh = false) => {
      if (!targetUserId) {
        console.warn('⚠️ [useReputation] No userId provided');
        return;
      }

      console.log(
        `🏆 [useReputation] Fetching reputation for user: ${targetUserId}`
      );

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedReputation = getCache(targetUserId, 'reputation');
        if (cachedReputation) {
          console.log(
            `📦 [useReputation] Using cached reputation for ${targetUserId}`
          );
          setState((prev) => ({
            ...prev,
            reputation: cachedReputation,
            isLoading: false,
            error: null,
          }));
          return;
        }
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await reputationClient.getReputation(targetUserId);

        if (response.success && response.data) {
          const reputationData = response.data as ReputationData;

          setState((prev) => ({
            ...prev,
            reputation: reputationData,
            isLoading: false,
            error: null,
          }));

          // Cache the fresh data (5 minutes TTL)
          setCache(targetUserId, reputationData, 5 * 60 * 1000, 'reputation');
          console.log(
            `✅ [useReputation] Successfully fetched and cached reputation for ${targetUserId}`
          );
        } else {
          const errorMessage =
            response.error?.message || 'Failed to fetch reputation data';
          setState((prev) => ({
            ...prev,
            reputation: null,
            isLoading: false,
            error: errorMessage,
          }));
          console.error(
            `❌ [useReputation] API response not successful:`,
            response
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Network error occurred';
        setState((prev) => ({
          ...prev,
          reputation: null,
          isLoading: false,
          error: errorMessage,
        }));
        console.error(`❌ [useReputation] Network error:`, error);
      }
    },
    [targetUserId, getCache, setCache]
  );

  // Regular refresh (checks cache first)
  const refreshReputation = useCallback(async () => {
    await fetchReputation(false);
  }, [fetchReputation]);

  // Force refresh (bypasses cache)
  const forceRefreshReputation = useCallback(async () => {
    console.log(
      `🔄 [useReputation] Force refreshing reputation for ${targetUserId}`
    );
    clearUser(targetUserId);
    await fetchReputation(true);
  }, [fetchReputation, clearUser, targetUserId]);

  // Load reputation on mount or when userId changes
  useEffect(() => {
    if (targetUserId && isAuthenticated) {
      fetchReputation(false);
    }
  }, [targetUserId, isAuthenticated, fetchReputation]);

  // Update authentication state
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isAuthenticated,
    }));
  }, [isAuthenticated]);

  return {
    reputation: state.reputation,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    refreshReputation,
    forceRefreshReputation,
    cacheInfo: targetUserId ? getCacheInfo(targetUserId, 'reputation') : null,
  };
};
