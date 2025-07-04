// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { CompleteProfileData, ProfileState } from '../types/profile.types';
import { useProfileCache } from './useProfileCache';

export const useProfile = (userId?: string) => {
  const {
    getFromCache,
    setInCache,
    isValidInCache,
    clearFromCache,
    getCacheInfo,
  } = useProfileCache();

  const [state, setState] = useState<ProfileState>({
    profile: null,
    loading: true,
    editing: { section: null, data: null },
    errors: {},
    isOwner: false,
  });

  // Fetch complete profile data from all services
  const fetchProfile = async (targetUserId?: string, forceRefresh = false) => {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedProfile = getFromCache(targetUserId);
        if (cachedProfile) {
          const cacheInfo = getCacheInfo(targetUserId);
          console.log(
            `🎯 Using cached profile data (age: ${Math.round((cacheInfo?.age || 0) / 1000)}s, expires in: ${Math.round((cacheInfo?.expiresIn || 0) / 1000)}s)`
          );

          setState((prev) => ({
            ...prev,
            profile: cachedProfile,
            loading: false,
            isOwner: !targetUserId,
            errors: {},
          }));
          return;
        }
      }

      setState((prev) => ({ ...prev, loading: true, errors: {} }));

      const isPublicView = !!targetUserId;
      const profileId = targetUserId || 'me';

      // Determine API endpoints based on whether it's own profile or public view
      const endpoints = isPublicView
        ? {
            user: `/api/public/users/${targetUserId}`,
            workHistory: `/api/work-history/users/${targetUserId}/summary`,
            analytics: `/api/analytics/user-insights/${targetUserId}`,
            reputation: `/api/reputation/users/${targetUserId}`,
          }
        : {
            user: '/api/user/profile',
            workHistory: '/api/work-history/profile/summary',
            analytics: '/api/analytics/dashboard',
            reputation: '/api/reputation/profile',
          };

      // Fetch data from all services in parallel
      const [userResult, workHistoryResult, analyticsResult, reputationResult] =
        await Promise.allSettled([
          apiClient.get(endpoints.user),
          apiClient.get(endpoints.workHistory),
          apiClient.get(endpoints.analytics),
          apiClient.get(endpoints.reputation),
        ]);

      // Process results with fallbacks for failed requests
      const profile: CompleteProfileData = {
        user:
          userResult.status === 'fulfilled' && userResult.value.success
            ? (userResult.value.data as any).user ||
              (userResult.value.data as any)
            : null,
        workHistory:
          workHistoryResult.status === 'fulfilled' &&
          workHistoryResult.value.success
            ? (workHistoryResult.value.data as any)
            : null,
        analytics:
          analyticsResult.status === 'fulfilled' &&
          analyticsResult.value.success
            ? (analyticsResult.value.data as any)
            : null,
        reputation:
          reputationResult.status === 'fulfilled' &&
          reputationResult.value.success
            ? (reputationResult.value.data as any)
            : null,
      };

      // Log any failed requests (non-critical)
      if (userResult.status === 'rejected')
        console.warn('Failed to fetch user data:', userResult.reason);
      if (workHistoryResult.status === 'rejected')
        console.warn('Failed to fetch work history:', workHistoryResult.reason);
      if (analyticsResult.status === 'rejected')
        console.warn('Failed to fetch analytics:', analyticsResult.reason);
      if (reputationResult.status === 'rejected')
        console.warn('Failed to fetch reputation:', reputationResult.reason);

      setState((prev) => ({
        ...prev,
        profile,
        loading: false,
        isOwner: !isPublicView,
      }));

      // Cache the profile data for 60 seconds
      if (profile.user) {
        console.log('💾 Caching profile data for 60 seconds');
        setInCache(profile, targetUserId, 60 * 1000); // 60 seconds
      }

      // Track profile view for analytics
      if (isPublicView && profile.user) {
        trackProfileView(profile.user.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        errors: { general: 'Failed to load profile data' },
      }));
    }
  };

  // Update specific section of profile
  const updateProfileSection = async (
    section: string,
    data: any
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setState((prev) => ({ ...prev, loading: true, errors: {} }));

      let endpoint = '';
      let payload = data;

      switch (section) {
        case 'basicInfo':
          endpoint = '/api/user/profile';
          break;
        case 'socialMedia':
          endpoint = '/api/user/social';
          break;
        case 'roleInfo':
          endpoint = '/api/user/roles-info';
          break;
        case 'settings':
          endpoint = '/api/user/settings';
          break;
        default:
          throw new Error(`Unknown section: ${section}`);
      }

      const response = await apiClient.put(endpoint, payload);

      if (response.success) {
        // Clear cache since profile was updated
        console.log('🗑️ Clearing profile cache due to update');
        clearFromCache(userId);

        // Update local state with new data
        const updatedProfile = state.profile
          ? {
              ...state.profile,
              user: {
                ...state.profile.user,
                ...(response.success ? (response.data as any).user : {}),
              },
            }
          : null;

        setState((prev) => ({
          ...prev,
          profile: updatedProfile,
          editing: { section: null, data: null },
          loading: false,
        }));

        // Cache the updated profile
        if (updatedProfile) {
          setInCache(updatedProfile, userId, 60 * 1000);
        }

        // Track profile edit
        trackProfileEdit(section, Object.keys(data));

        return { success: true };
      } else {
        return { success: false, error: 'Update failed' };
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        errors: { [section]: error.message || 'Update failed' },
      }));
      return { success: false, error: error.message || 'Update failed' };
    }
  };

  // Start editing a section
  const startEditing = (section: string, initialData: any) => {
    setState((prev) => ({
      ...prev,
      editing: { section, data: initialData },
    }));
  };

  // Cancel editing
  const cancelEditing = () => {
    setState((prev) => ({
      ...prev,
      editing: { section: null, data: null },
      errors: {},
    }));
  };

  // Track profile view for analytics
  const trackProfileView = async (profileUserId: string) => {
    try {
      await apiClient.post('/api/analytics/profile-view', {
        profileUserId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Analytics tracking is non-critical, just log
      console.warn('Failed to track profile view:', error);
    }
  };

  // Track profile edit for analytics
  const trackProfileEdit = async (section: string, fields: string[]) => {
    try {
      await apiClient.post('/api/analytics/profile-edit', {
        section,
        fields,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Analytics tracking is non-critical, just log
      console.warn('Failed to track profile edit:', error);
    }
  };

  // Refresh specific data section
  const refreshSection = async (
    section: 'workHistory' | 'analytics' | 'reputation'
  ) => {
    try {
      let endpoint = '';
      switch (section) {
        case 'workHistory':
          endpoint = state.isOwner
            ? '/api/work-history/profile/summary'
            : `/api/work-history/users/${state.profile?.user.id}/summary`;
          break;
        case 'analytics':
          endpoint = state.isOwner
            ? '/api/analytics/dashboard'
            : `/api/analytics/user-insights/${state.profile?.user.id}`;
          break;
        case 'reputation':
          endpoint = state.isOwner
            ? '/api/reputation/profile'
            : `/api/reputation/users/${state.profile?.user.id}`;
          break;
      }

      const response = await apiClient.get(endpoint);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          profile: prev.profile
            ? {
                ...prev.profile,
                [section]: response.data,
              }
            : null,
        }));
      }
    } catch (error) {
      console.warn(`Failed to refresh ${section}:`, error);
    }
  };

  // Force refresh profile (bypasses cache)
  const forceRefreshProfile = async () => {
    console.log('🔄 Force refreshing profile (bypassing cache)');
    clearFromCache(userId);
    await fetchProfile(userId, true);
  };

  // Load profile on mount or when userId changes
  useEffect(() => {
    fetchProfile(userId);
  }, [userId]);

  return {
    ...state,
    fetchProfile,
    forceRefreshProfile,
    updateProfileSection,
    startEditing,
    cancelEditing,
    refreshSection,
    clearCache: () => clearFromCache(userId),
    getCacheInfo: () => getCacheInfo(userId),
    isLoading: state.loading,
    hasError: Object.keys(state.errors).length > 0,
  };
};
