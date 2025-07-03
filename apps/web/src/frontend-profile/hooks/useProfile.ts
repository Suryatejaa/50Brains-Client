// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { CompleteProfileData, ProfileState } from '../types/profile.types';

export const useProfile = (userId?: string) => {
  const [state, setState] = useState<ProfileState>({
    profile: null,
    loading: true,
    editing: { section: null, data: null },
    errors: {},
    isOwner: false,
  });

  // Fetch complete profile data from all services
  const fetchProfile = async (targetUserId?: string) => {
    try {
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
            ? userResult.value.data.user || userResult.value.data
            : null,
        workHistory:
          workHistoryResult.status === 'fulfilled' &&
          workHistoryResult.value.success
            ? workHistoryResult.value.data
            : null,
        analytics:
          analyticsResult.status === 'fulfilled' &&
          analyticsResult.value.success
            ? analyticsResult.value.data
            : null,
        reputation:
          reputationResult.status === 'fulfilled' &&
          reputationResult.value.success
            ? reputationResult.value.data
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
        // Update local state with new data
        setState((prev) => ({
          ...prev,
          profile: prev.profile
            ? {
                ...prev.profile,
                user: {
                  ...prev.profile.user,
                  ...(response.success ? response.data.user : {}),
                },
              }
            : null,
          editing: { section: null, data: null },
          loading: false,
        }));

        // Track profile edit
        trackProfileEdit(section, Object.keys(data));

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Update failed' };
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

  // Load profile on mount or when userId changes
  useEffect(() => {
    fetchProfile(userId);
  }, [userId]);



  return {
    ...state,
    fetchProfile,
    updateProfileSection,
    startEditing,
    cancelEditing,
    refreshSection,
    isLoading: state.loading,
    hasError: Object.keys(state.errors).length > 0,
  };
};
