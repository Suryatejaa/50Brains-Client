'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

interface AnalyticsData {
  platformStats?: any;
  gigStats?: any;
  userStats?: any;
  financialData?: any;
  performance?: any;
  trends?: any;
  gigDistribution?: any[];
  userDistribution?: any[];
  categoryStats?: any[];
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, userStatsRes, financialRes, overviewRes] =
        await Promise.all([
          apiClient.get<any>(
            `/api/gig-admin/analytics/platform-stats?period=${period}`
          ),
          apiClient.get<any>(`/api/user/admin/stats?period=${period}`),
          apiClient.get<any>(`/api/gig-admin/financial/overview`),

          apiClient.get<any>('/api/gig-admin/dashboard/overview'),
        ]);
      console.log('Fetched Analytics Responses:', {
        statsRes,
        userStatsRes,
        financialRes,
        overviewRes,
      });

      // Use overviewRes for main stats temporarily (statsRes returns zeros)
      const overview = overviewRes.success ? (overviewRes.data as any) : null;

      const data: AnalyticsData = {
        platformStats:
          overview?.stats || (statsRes.success ? statsRes.data : null),
        userStats: userStatsRes.success ? userStatsRes.data : null,
        financialData: financialRes.success ? financialRes.data : null,
      };

      // Extract distribution data from overview
      if (overview) {
        data.gigDistribution = overview.distributions?.gigStatus || [];
        data.userDistribution = overview.distributions?.userRoles || [];
        data.categoryStats = overview.distributions?.categories || [];
      }
      console.log('Loaded Analytics Data:', data);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    const reportType = prompt(
      'Enter report type (gigs, users, financial, platform):'
    );
    if (!reportType) return;

    try {
      const response = await apiClient.post<any>(
        '/api/gig-admin/reports/generate',
        {
          reportType,
          parameters: { period },
          format: 'PDF',
        }
      );

      if (response.success) {
        alert(
          `Report generated successfully. Report ID: ${(response.data as any)?.reportId}`
        );
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-heading text-2xl font-bold">
            📊 Platform Analytics
          </h1>
          <div className="flex gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input-field"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button onClick={handleGenerateReport} className="btn-primary">
              Generate Report
            </button>
          </div>
        </div>

        {/* Platform Overview Statistics */}
        <div className="card-glass mb-6 p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            📈 Platform Overview
          </h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                <div className="text-muted mb-2 text-sm font-medium">
                  Total Gigs
                </div>
                <div className="text-heading text-3xl font-bold">
                  {analyticsData.platformStats?.totalGigs ||
                    analyticsData.gigStats?.totalGigs ||
                    0}
                </div>
                <div className="text-muted mt-1 text-xs">
                  {analyticsData.platformStats?.gigGrowth > 0 ? '↑' : '↓'}{' '}
                  {Math.abs(analyticsData.platformStats?.gigGrowth || 0)}%
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                <div className="text-muted mb-2 text-sm font-medium">
                  Active Users
                </div>
                <div className="text-heading text-3xl font-bold">
                  {analyticsData.userStats?.stats?.activeUsers ||
                    analyticsData.platformStats?.activeUsers ||
                    0}
                </div>
                <div className="text-muted mt-1 text-xs">
                  {analyticsData.userStats?.stats?.activeSessions || 0} active
                  sessions
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                <div className="text-muted mb-2 text-sm font-medium">
                  Total Applications
                </div>
                <div className="text-heading text-3xl font-bold">
                  {analyticsData.platformStats?.totalApplications || 0}
                </div>
                <div className="text-muted mt-1 text-xs">
                  Conversion Rate:{' '}
                  {analyticsData.platformStats?.conversionRate || 0}%
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                <div className="text-muted mb-2 text-sm font-medium">
                  Total Revenue
                </div>
                <div className="text-heading text-3xl font-bold">
                  ₹{analyticsData.financialData?.totalRevenue || 0}
                </div>
                <div className="text-muted mt-1 text-xs">
                  Daily: ₹{analyticsData.financialData?.dailyRevenue || 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gig Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              💼 Gig Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-body">Active Gigs</span>
                <span className="text-heading font-bold">
                  {analyticsData.gigStats?.activeGigs || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-body">Completed Gigs</span>
                <span className="text-heading font-bold">
                  {analyticsData.gigStats?.completedGigs || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-body">Total Gig Applications</span>
                <span className="text-heading font-bold">
                  {analyticsData.gigStats?.totalApplications || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-body">Avg Budget</span>
                <span className="text-heading font-bold">
                  ₹{analyticsData.gigStats?.avgBudget || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-body">Avg Response Time</span>
                <span className="text-heading font-bold">
                  {analyticsData.performance?.avgResponseTime || 0}ms
                </span>
              </div>
            </div>
          </div>

          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              👥 User Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-body">Total Users</span>
                <span className="text-heading font-bold">
                  {analyticsData.userStats?.stats?.totalUsers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-body">New Users ({period})</span>
                <span className="text-heading font-bold">
                  {analyticsData.userStats?.stats?.newUsersToday || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-body">Email Verified</span>
                <span className="text-heading font-bold">
                  {analyticsData.userStats?.stats?.emailVerified || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-body">Active Influencers</span>
                <span className="text-heading font-bold">
                  {analyticsData.userStats?.stats?.influencers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-body">Active Brands</span>
                <span className="text-heading font-bold">
                  {analyticsData.userStats?.stats?.brands || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gig Status Distribution */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              📊 Gig Status Distribution
            </h2>
            <div className="space-y-3">
              {analyticsData.gigDistribution &&
              analyticsData.gigDistribution.length > 0 ? (
                analyticsData.gigDistribution.map(
                  (item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-body font-medium">
                          {item.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-heading font-bold">
                          {item._count?.status || item.count || 0}
                        </div>
                        <div className="text-muted text-xs">
                          {analyticsData.gigDistribution
                            ? (
                                ((item._count?.status || 0) /
                                  analyticsData.gigDistribution.reduce(
                                    (acc: number, g: any) =>
                                      acc + (g._count?.status || 0),
                                    0
                                  )) *
                                100
                              ).toFixed(1) + '%'
                            : '0%'}
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-muted py-4 text-center">
                  No gig distribution data available
                </div>
              )}
            </div>
          </div>

          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              👤 User Roles Distribution
            </h2>
            <div className="space-y-3">
              {analyticsData.userDistribution &&
              analyticsData.userDistribution.length > 0 ? (
                analyticsData.userDistribution.map(
                  (item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                        <span className="text-body font-medium">
                          {item.role || item.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-heading font-bold">
                          {item._count?.role ||
                            item._count?.status ||
                            item.count ||
                            0}
                        </div>
                        <div className="text-muted text-xs">
                          {analyticsData.userDistribution
                            ? (
                                ((item._count?.role ||
                                  item._count?.status ||
                                  0) /
                                  analyticsData.userDistribution.reduce(
                                    (acc: number, u: any) =>
                                      acc +
                                      (u._count?.role || u._count?.status || 0),
                                    0
                                  )) *
                                100
                              ).toFixed(1) + '%'
                            : '0%'}
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-muted py-4 text-center">
                  No user distribution data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Statistics */}
        <div className="card-glass mb-6 p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            🏆 Top Gig Categories
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {analyticsData.categoryStats &&
            analyticsData.categoryStats.length > 0 ? (
              analyticsData.categoryStats
                .slice(0, 4)
                .map((item: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4"
                  >
                    <div className="text-heading mb-2 font-semibold">
                      {item.category}
                    </div>
                    <div className="text-heading text-2xl font-bold">
                      {item._count?.category || item.count || 0}
                    </div>
                    <div className="text-muted mt-2 text-xs">gigs posted</div>
                  </div>
                ))
            ) : (
              <div className="text-muted col-span-4 py-4 text-center">
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              ⚡ Performance Metrics
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body">Average Response Time</span>
                <span className="text-heading font-semibold">
                  {analyticsData.performance?.avgResponseTime || 0}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body">Success Rate</span>
                <span className="text-heading font-semibold">
                  {analyticsData.performance?.successRate || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body">User Satisfaction</span>
                <span className="text-heading font-semibold">
                  {analyticsData.performance?.userSatisfaction || 0}/5 ⭐
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body">Platform Uptime</span>
                <span className="text-heading font-semibold">
                  {analyticsData.performance?.uptime || 99.9}%
                </span>
              </div>
            </div>
          </div>

          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              📈 Trending Categories
            </h2>
            <div className="space-y-3">
              {analyticsData.trends?.topCategories &&
              analyticsData.trends.topCategories.length > 0 ? (
                analyticsData.trends.topCategories
                  .slice(0, 5)
                  .map((category: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <span className="text-body">{category.name}</span>
                      <div className="text-right">
                        <div className="text-heading font-semibold">
                          {category.count}
                        </div>
                        <div className="text-muted text-xs">
                          {category.growth > 0 ? '↑' : '↓'}{' '}
                          {Math.abs(category.growth)}%
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-muted py-4 text-center">
                  No trend data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Behavior Insights */}
        <div className="card-glass p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            🔍 User Behavior Insights
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
              <div className="text-muted mb-2 text-sm font-medium">
                Avg. Session Duration
              </div>
              <div className="text-heading text-2xl font-bold">
                {analyticsData.trends?.avgSessionDuration || '0m'}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
              <div className="text-muted mb-2 text-sm font-medium">
                Bounce Rate
              </div>
              <div className="text-heading text-2xl font-bold">
                {analyticsData.trends?.bounceRate || 0}%
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
              <div className="text-muted mb-2 text-sm font-medium">
                Return User Rate
              </div>
              <div className="text-heading text-2xl font-bold">
                {analyticsData.trends?.returnUserRate || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
