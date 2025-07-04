/**
 * Dashboard API Utilities
 * Common patterns for fetching dashboard data as described in the role-based dashboard guide
 */

import React from 'react';
import { apiClient } from '@/lib/api-client';

// Generic dashboard data loader
export async function loadDashboardData<T>(
  userId: string,
  endpoints: Array<{
    key: string;
    url: string;
  }>
): Promise<T> {
  try {
    const responses = await Promise.allSettled(
      endpoints.map((endpoint) => apiClient.get(endpoint.url))
    );

    const data: any = {};

    endpoints.forEach((endpoint, index) => {
      const response = responses[index];
      data[endpoint.key] =
        response.status === 'fulfilled' && response.value.success
          ? response.value.data
          : null;
    });

    return data as T;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    throw error;
  }
}

// Creator Dashboard Data Loader
export async function loadCreatorDashboardData(userId: string) {
  const endpoints = [
    {
      key: 'reputation',
      url: `/api/reputation/${userId}`,
    },
    {
      key: 'socialMedia',
      url: `/api/social-media/${userId}`,
    },
    {
      key: 'gigs',
      url: '/api/my/gigs/summary',
    },
    {
      key: 'credits',
      url: '/api/credit/balance',
    },
    {
      key: 'portfolio',
      url: '/api/portfolio/summary',
    },
  ];

  return loadDashboardData(userId, endpoints);
}

// Brand Dashboard Data Loader
export async function loadBrandDashboardData(userId: string) {
  const endpoints = [
    {
      key: 'campaigns',
      url: '/api/my/campaigns/summary',
    },
    {
      key: 'applications',
      url: '/api/applications/received/summary',
    },
    {
      key: 'analytics',
      url: '/api/analytics/campaigns',
    },
    {
      key: 'reputation',
      url: `/api/reputation/${userId}`,
    },
    {
      key: 'credits',
      url: '/api/credit/balance',
    },
  ];

  return loadDashboardData(userId, endpoints);
}

// Clan Dashboard Data Loader
export async function loadClanDashboardData(clanId: string) {
  const endpoints = [
    {
      key: 'clanInfo',
      url: `/api/clan/${clanId}`,
    },
    {
      key: 'members',
      url: `/api/members/${clanId}`,
    },
    {
      key: 'rankings',
      url: `/api/rankings/clan/${clanId}`,
    },
    {
      key: 'projects',
      url: `/api/clan/${clanId}/projects`,
    },
    {
      key: 'activities',
      url: `/api/clan/${clanId}/activities?limit=10`,
    },
    {
      key: 'invitations',
      url: `/api/clan/${clanId}/invitations`,
    },
  ];

  return loadDashboardData('', endpoints);
}

// Admin Dashboard Data Loader
export async function loadAdminDashboardData() {
  const endpoints = [
    {
      key: 'systemStats',
      url: '/api/admin/stats/system',
    },
    {
      key: 'userAnalytics',
      url: '/api/admin/analytics/users',
    },
    {
      key: 'platformMetrics',
      url: '/api/admin/metrics/platform',
    },
    {
      key: 'moderationQueue',
      url: '/api/admin/moderation/queue',
    },
    {
      key: 'systemHealth',
      url: '/api/health',
    },
    {
      key: 'recentActivities',
      url: '/api/admin/activities/recent',
    },
  ];

  return loadDashboardData('', endpoints);
}

// Real-time updates using polling
export function useRealTimeUpdates(
  fetchFunction: () => Promise<any>,
  interval: number = 30000 // 30 seconds default
) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        setError(null);
        const result = await fetchFunction();
        setData(result);
      } catch (err) {
        console.error('Real-time update failed:', err);
        setError(err instanceof Error ? err.message : 'Update failed');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    intervalId = setInterval(fetchData, interval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchFunction, interval]);

  return { data, loading, error, refetch: fetchFunction };
}

// Permission-based API calls
export async function callWithPermission<T>(
  permission: string,
  apiCall: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  // This would integrate with your permission system
  // For now, just call the API - permission checking happens in components
  try {
    return await apiCall();
  } catch (error) {
    console.error(`API call failed for permission ${permission}:`, error);
    return fallback;
  }
}

// Notification handling for dashboard updates
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  try {
    await apiClient.post(`/api/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  try {
    const response = await apiClient.get(
      `/api/notifications/unread/${userId}/count`
    );
    return response.success ? (response.data as { count: number }).count : 0;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    return 0;
  }
}

// Application management for brands
export async function handleGigApplication(
  applicationId: string,
  action: 'accept' | 'reject',
  message?: string
): Promise<boolean> {
  try {
    const response = await apiClient.post(
      `/api/applications/${applicationId}/${action}`,
      {
        message,
      }
    );
    return response.success;
  } catch (error) {
    console.error(`Failed to ${action} application:`, error);
    return false;
  }
}

// Credit management
export async function purchaseCredits(
  amount: number,
  paymentMethod: string
): Promise<boolean> {
  try {
    const response = await apiClient.post('/api/credit/purchase', {
      amount,
      paymentMethod,
    });
    return response.success;
  } catch (error) {
    console.error('Failed to purchase credits:', error);
    return false;
  }
}

// Boost management
export async function boostProfile(
  duration: number,
  credits: number
): Promise<boolean> {
  try {
    const response = await apiClient.post('/api/boost/profile', {
      duration,
      credits,
    });
    return response.success;
  } catch (error) {
    console.error('Failed to boost profile:', error);
    return false;
  }
}

export async function boostGig(
  gigId: string,
  duration: number,
  credits: number
): Promise<boolean> {
  try {
    const response = await apiClient.post('/api/boost/gig', {
      gigId,
      duration,
      credits,
    });
    return response.success;
  } catch (error) {
    console.error('Failed to boost gig:', error);
    return false;
  }
}

// Analytics data fetching
export async function getAnalyticsData(
  type: 'user' | 'brand' | 'clan' | 'admin',
  timeRange: '24h' | '7d' | '30d' | '90d' = '7d'
) {
  try {
    const response = await apiClient.get(
      `/api/analytics/${type}?range=${timeRange}`
    );
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    return null;
  }
}

// Export all dashboard utilities
export const dashboardAPI = {
  loadCreatorDashboardData,
  loadBrandDashboardData,
  loadClanDashboardData,
  loadAdminDashboardData,
  markNotificationAsRead,
  getUnreadNotificationCount,
  handleGigApplication,
  purchaseCredits,
  boostProfile,
  boostGig,
  getAnalyticsData,
};
