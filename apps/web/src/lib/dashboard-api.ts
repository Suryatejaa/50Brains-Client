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
    defaultValue: any;
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
          : endpoint.defaultValue;
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
      defaultValue: {
        totalScore: 0,
        trend: 0,
        level: 'Bronze',
        nextLevelPoints: 100,
      },
    },
    {
      key: 'socialMedia',
      url: `/api/social-media/${userId}`,
      defaultValue: {
        totalFollowers: 0,
        totalEngagement: 0,
        connectedAccounts: 0,
        growth: 0,
        accounts: [],
      },
    },
    {
      key: 'gigs',
      url: '/api/my/gigs/summary',
      defaultValue: {
        activeApplications: 0,
        completedGigs: 0,
        totalEarnings: 0,
        averageRating: 0,
        pendingWork: 0,
      },
    },
    {
      key: 'credits',
      url: '/api/credit/balance',
      defaultValue: { balance: 0, earned: 0, spent: 0 },
    },
    {
      key: 'portfolio',
      url: '/api/portfolio/summary',
      defaultValue: { totalItems: 0, views: 0, likes: 0 },
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
      defaultValue: { active: 0, completed: 0, totalSpent: 0, averageROI: 0 },
    },
    {
      key: 'applications',
      url: '/api/applications/received/summary',
      defaultValue: { total: 0, pending: 0, approved: 0, rejected: 0 },
    },
    {
      key: 'analytics',
      url: '/api/analytics/campaigns',
      defaultValue: {
        totalReach: 0,
        totalEngagement: 0,
        conversionRate: 0,
        topPerformingCampaign: 'N/A',
      },
    },
    {
      key: 'reputation',
      url: `/api/reputation/${userId}`,
      defaultValue: { score: 0, reviews: 0, averageRating: 0 },
    },
    {
      key: 'credits',
      url: '/api/credit/balance',
      defaultValue: { balance: 0, spent: 0, reserved: 0 },
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
      defaultValue: {
        id: '',
        name: 'Unknown Clan',
        description: '',
        memberCount: 0,
        totalReputation: 0,
        level: 'Bronze',
        createdAt: '',
      },
    },
    {
      key: 'members',
      url: `/api/members/${clanId}`,
      defaultValue: [],
    },
    {
      key: 'rankings',
      url: `/api/rankings/clan/${clanId}`,
      defaultValue: {
        position: 0,
        totalClans: 0,
        category: 'General',
        monthlyRank: 0,
      },
    },
    {
      key: 'projects',
      url: `/api/clan/${clanId}/projects`,
      defaultValue: { active: [], completed: 0, totalEarnings: 0 },
    },
    {
      key: 'activities',
      url: `/api/clan/${clanId}/activities?limit=10`,
      defaultValue: [],
    },
    {
      key: 'invitations',
      url: `/api/clan/${clanId}/invitations`,
      defaultValue: [],
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
      defaultValue: {
        totalUsers: 0,
        activeUsers: 0,
        totalGigs: 0,
        totalClans: 0,
        totalTransactions: 0,
        systemUptime: 0,
      },
    },
    {
      key: 'userAnalytics',
      url: '/api/admin/analytics/users',
      defaultValue: {
        newUsers: 0,
        userGrowth: 0,
        activeToday: 0,
        topUserCountries: [],
      },
    },
    {
      key: 'platformMetrics',
      url: '/api/admin/metrics/platform',
      defaultValue: {
        activeGigs: 0,
        completedGigs: 0,
        totalRevenue: 0,
        dailyRevenue: 0,
        conversionRate: 0,
        averageOrderValue: 0,
      },
    },
    {
      key: 'moderationQueue',
      url: '/api/admin/moderation/queue',
      defaultValue: [],
    },
    {
      key: 'systemHealth',
      url: '/api/health',
      defaultValue: {
        status: 'warning',
        services: [],
        lastChecked: new Date().toISOString(),
      },
    },
    {
      key: 'recentActivities',
      url: '/api/admin/activities/recent',
      defaultValue: [],
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
    return response.success ? response.data.count : 0;
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
