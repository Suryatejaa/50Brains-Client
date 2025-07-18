'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api-client';
import { DashboardHeader } from '../shared/DashboardHeader';
import { MetricCard } from '../shared/MetricCard';
import { QuickActionsGrid } from '../shared/QuickActions';

interface AdminDashboardData {
  systemStats: {
    totalUsers: number;
    activeUsers: number;
    totalGigs: number;
    totalClans: number;
    totalTransactions: number;
    systemUptime: number;
  };
  userAnalytics: {
    newUsers: number;
    userGrowth: number;
    activeToday: number;
    topUserCountries: Array<{
      country: string;
      count: number;
    }>;
  };
  platformMetrics: {
    activeGigs: number;
    completedGigs: number;
    totalRevenue: number;
    dailyRevenue: number;
    conversionRate: number;
    averageOrderValue: number;
  };
  moderationQueue: Array<{
    id: string;
    type: 'user_report' | 'content_report' | 'gig_dispute' | 'clan_report';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reportedAt: string;
    reporterId: string;
    targetId: string;
    status: 'pending' | 'in_review' | 'resolved';
  }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'online' | 'offline' | 'degraded';
      responseTime: number;
      uptime: number;
    }>;
    lastChecked: string;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'error';
  }>;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminDashboardData();
  }, []);

  // Check if user has admin permissions
  if (
    !hasPermission('platform.control') &&
    !hasPermission('system.configure')
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-3">
        <div className="mx-auto max-w-7xl">
          <div className="card-glass p-8 text-center">
            <span className="mb-4 block text-4xl">🚫</span>
            <h2 className="text-heading mb-2 text-xl font-semibold">
              Access Denied
            </h2>
            <p className="text-muted mb-4">
              You don't have permission to access the admin dashboard.
            </p>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="btn-primary"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const loadAdminDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        systemStatsResponse,
        userAnalyticsResponse,
        platformMetricsResponse,
        moderationResponse,
        systemHealthResponse,
        activitiesResponse,
      ] = await Promise.allSettled([
        apiClient.get('/api/admin/stats/system'),
        apiClient.get('/api/admin/analytics/users'),
        apiClient.get('/api/admin/metrics/platform'),
        apiClient.get('/api/admin/moderation/queue'),
        apiClient.get('/api/health'),
        apiClient.get('/api/admin/activities/recent'),
      ]);

      const data: AdminDashboardData = {
        systemStats:
          systemStatsResponse.status === 'fulfilled' &&
          systemStatsResponse.value.success
            ? (systemStatsResponse.value.data as AdminDashboardData['systemStats'])
            : {
                totalUsers: 0,
                activeUsers: 0,
                totalGigs: 0,
                totalClans: 0,
                totalTransactions: 0,
                systemUptime: 0,
              },

        userAnalytics:
          userAnalyticsResponse.status === 'fulfilled' &&
          userAnalyticsResponse.value.success
            ? (userAnalyticsResponse.value.data as AdminDashboardData['userAnalytics'])
            : {
                newUsers: 0,
                userGrowth: 0,
                activeToday: 0,
                topUserCountries: [],
              },

        platformMetrics:
          platformMetricsResponse.status === 'fulfilled' &&
          platformMetricsResponse.value.success
            ? (platformMetricsResponse.value.data as AdminDashboardData['platformMetrics'])
            : {
                activeGigs: 0,
                completedGigs: 0,
                totalRevenue: 0,
                dailyRevenue: 0,
                conversionRate: 0,
                averageOrderValue: 0,
              },

        moderationQueue:
          moderationResponse.status === 'fulfilled' &&
          moderationResponse.value.success
            ? (moderationResponse.value.data as AdminDashboardData['moderationQueue'])
            : [],

        systemHealth:
          systemHealthResponse.status === 'fulfilled' &&
          systemHealthResponse.value.success
            ? (systemHealthResponse.value.data as AdminDashboardData['systemHealth'])
            : {
                status: 'warning',
                services: [],
                lastChecked: new Date().toISOString(),
              },

        recentActivities:
          activitiesResponse.status === 'fulfilled' &&
          activitiesResponse.value.success
            ? (activitiesResponse.value.data as AdminDashboardData['recentActivities'])
            : [],
      };

      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
      setError('Failed to load admin dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      href: '/admin/users',
      icon: '👤',
      label: 'User Management',
      description: 'Manage users',
      permission: 'users.manage',
    },
    {
      href: '/admin/moderation',
      icon: '⚠️',
      label: 'Moderation',
      description: 'Review reports',
      permission: 'content.moderate',
    },
    {
      href: '/admin/analytics',
      icon: '📊',
      label: 'Analytics',
      description: 'View insights',
      permission: 'analytics.full',
    },
    {
      href: '/admin/system',
      icon: '⚙️',
      label: 'System Settings',
      description: 'Configure platform',
      permission: 'system.configure',
    },
    {
      href: '/admin/payments',
      icon: '💳',
      label: 'Payments',
      description: 'Transaction logs',
    },
    {
      href: '/admin/logs',
      icon: '📝',
      label: 'System Logs',
      description: 'View logs',
    },
    {
      href: '/admin/backup',
      icon: '💾',
      label: 'Backup',
      description: 'Data backup',
    },
    {
      href: '/admin/notifications',
      icon: '📢',
      label: 'Notifications',
      description: 'Send alerts',
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-3">
        <div className="mx-auto max-w-7xl">
          <div className="card-glass p-8 text-center">
            <span className="mb-4 block text-4xl">⚠️</span>
            <h2 className="text-heading mb-2 text-xl font-semibold">
              Unable to Load Admin Dashboard
            </h2>
            <p className="text-muted mb-4">{error}</p>
            <button onClick={loadAdminDashboardData} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getSystemHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="System administration and platform management"
        />

        {/* System Health Alert */}
        {dashboardData?.systemHealth?.status === 'critical' && (
          <div className="card-glass mb-6 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">🚨</span>
              <div>
                <h3 className="text-heading font-semibold">
                  Critical System Alert
                </h3>
                <p className="text-muted text-sm">
                  One or more services are experiencing issues. Immediate
                  attention required.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={dashboardData?.systemStats?.totalUsers || 0}
            icon="👤"
            trend={dashboardData?.userAnalytics?.userGrowth}
            loading={loading}
            onClick={() => (window.location.href = '/admin/users')}
          />
          <MetricCard
            title="Active Gigs"
            value={dashboardData?.platformMetrics?.activeGigs || 0}
            icon="💼"
            loading={loading}
            onClick={() => (window.location.href = '/admin/gigs')}
          />
          <MetricCard
            title="Daily Revenue"
            value={`$${dashboardData?.platformMetrics?.dailyRevenue || 0}`}
            icon="💰"
            loading={loading}
            onClick={() => (window.location.href = '/admin/revenue')}
          />
          <MetricCard
            title="Moderation Queue"
            value={dashboardData?.moderationQueue?.length || 0}
            icon="⚠️"
            loading={loading}
            urgent={(dashboardData?.moderationQueue?.length || 0) > 10}
            onClick={() => (window.location.href = '/admin/moderation')}
          />
        </div>

        {/* System Status */}
        <div className="card-glass mb-8 p-3">
          <h3 className="text-heading mb-6 text-lg font-semibold">
            🔧 System Status
          </h3>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span
                className={`text-lg font-semibold ${getSystemHealthColor(dashboardData?.systemHealth?.status || 'warning')}`}
              >
                {dashboardData?.systemHealth?.status?.toUpperCase() ||
                  'UNKNOWN'}
              </span>
              <span className="text-muted text-sm">
                Last checked:{' '}
                {dashboardData?.systemHealth?.lastChecked
                  ? new Date(
                      dashboardData.systemHealth.lastChecked
                    ).toLocaleTimeString()
                  : 'Unknown'}
              </span>
            </div>
            <button
              onClick={loadAdminDashboardData}
              className="btn-secondary text-sm"
            >
              Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardData?.systemHealth?.services?.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-3 w-3 rounded-full ${getServiceStatusColor(service.status)}`}
                  ></div>
                  <span className="text-body text-sm font-medium">
                    {service.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-muted text-xs">
                    {service.responseTime}ms
                  </div>
                  <div className="text-muted text-xs">
                    {service.uptime}% uptime
                  </div>
                </div>
              </div>
            )) || (
              <div className="col-span-4 py-4 text-center">
                <span className="text-muted">No service data available</span>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* Platform Analytics */}
          <div className="lg:col-span-2">
            <div className="card-glass p-3">
              <h3 className="text-heading mb-6 text-lg font-semibold">
                📊 Platform Analytics
              </h3>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-3/4 rounded bg-gray-300"></div>
                  <div className="h-32 rounded bg-gray-300"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      {dashboardData?.systemStats?.activeUsers || 0}
                    </div>
                    <div className="text-muted text-sm">Active Users (24h)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      {dashboardData?.platformMetrics?.completedGigs || 0}
                    </div>
                    <div className="text-muted text-sm">Completed Gigs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      ${dashboardData?.platformMetrics?.totalRevenue || 0}
                    </div>
                    <div className="text-muted text-sm">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      {dashboardData?.platformMetrics?.conversionRate || 0}%
                    </div>
                    <div className="text-muted text-sm">Conversion Rate</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Moderation Queue */}
          <div className="card-glass p-3">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              ⚠️ Priority Reports
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded border border-gray-200 p-3">
                    <div className="mb-2 h-3 w-3/4 rounded bg-gray-300"></div>
                    <div className="h-2 w-1/2 rounded bg-gray-300"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData?.moderationQueue?.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="text-body text-sm font-medium">
                        {report.title}
                      </h4>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          report.priority === 'urgent'
                            ? 'bg-red-100 text-red-600'
                            : report.priority === 'high'
                              ? 'bg-orange-100 text-orange-600'
                              : report.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {report.priority}
                      </span>
                    </div>
                    <p className="text-muted mb-2 text-xs">
                      {report.description}
                    </p>
                    <div className="text-muted text-xs">
                      {new Date(report.reportedAt).toLocaleDateString()}
                    </div>
                  </div>
                )) || (
                  <div className="py-4 text-center">
                    <span className="mb-2 block text-2xl">✅</span>
                    <p className="text-muted">No pending reports</p>
                  </div>
                )}

                {dashboardData?.moderationQueue &&
                  dashboardData.moderationQueue.length > 5 && (
                    <div className="border-t pt-2">
                      <button
                        onClick={() =>
                          (window.location.href = '/admin/moderation')
                        }
                        className="text-accent w-full text-sm hover:underline"
                      >
                        View All Reports ({dashboardData.moderationQueue.length}
                        )
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities & User Analytics */}
        <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="card-glass p-3">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              🔄 Recent System Activities
            </h3>

            <div className="space-y-3">
              {dashboardData?.recentActivities?.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 text-sm"
                >
                  <span className="text-lg">
                    {activity.severity === 'error'
                      ? '❌'
                      : activity.severity === 'warning'
                        ? '⚠️'
                        : 'ℹ️'}
                  </span>
                  <div className="flex-1">
                    <div className="text-body">{activity.description}</div>
                    <div className="text-muted text-xs">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="py-4 text-center">
                  <span className="mb-2 block text-2xl">📋</span>
                  <p className="text-muted">No recent activities</p>
                </div>
              )}
            </div>
          </div>

          <div className="card-glass p-3">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              👥 User Analytics
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body">New Users (24h)</span>
                <span className="text-heading font-semibold">
                  {dashboardData?.userAnalytics?.newUsers || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body">Active Today</span>
                <span className="text-heading font-semibold">
                  {dashboardData?.userAnalytics?.activeToday || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body">User Growth</span>
                <span
                  className={`font-semibold ${
                    (dashboardData?.userAnalytics?.userGrowth || 0) > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {dashboardData?.userAnalytics?.userGrowth || 0}%
                </span>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-body mb-3 text-sm font-medium">
                  Top Countries
                </h4>
                <div className="space-y-2">
                  {dashboardData?.userAnalytics?.topUserCountries
                    ?.slice(0, 3)
                    .map((country, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-body">{country.country}</span>
                        <span className="text-heading font-medium">
                          {country.count}
                        </span>
                      </div>
                    )) || (
                    <p className="text-muted text-sm">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionsGrid actions={quickActions} title="Admin Tools" />
      </div>
    </div>
  );
};
