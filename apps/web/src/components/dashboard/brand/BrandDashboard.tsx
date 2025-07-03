'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { DashboardHeader } from '../shared/DashboardHeader';
import { MetricCard } from '../shared/MetricCard';
import { QuickActionsGrid } from '../shared/QuickActions';
import { ProfileCompletionWidget } from '@/components/ProfileCompletionWidget';

interface BrandDashboardData {
  campaigns: {
    active: number;
    completed: number;
    totalSpent: number;
    averageROI: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  analytics: {
    totalReach: number;
    totalEngagement: number;
    conversionRate: number;
    topPerformingCampaign: string;
  };
  reputation: {
    score: number;
    reviews: number;
    averageRating: number;
  };
  credits: {
    balance: number;
    spent: number;
    reserved: number;
  };
}

export const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<BrandDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBrandDashboardData();
  }, []);

  const loadBrandDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [
        campaignsResponse,
        applicationsResponse,
        analyticsResponse,
        reputationResponse,
        creditsResponse,
      ] = await Promise.allSettled([
        apiClient.get('/api/my/campaigns/summary'),
        apiClient.get('/api/applications/received/summary'),
        apiClient.get('/api/analytics/campaigns'),
        apiClient.get(`/api/reputation/${user.id}`),
        apiClient.get('/api/credit/balance'),
      ]);

      const data: BrandDashboardData = {
        campaigns:
          campaignsResponse.status === 'fulfilled' &&
          campaignsResponse.value.success
            ? campaignsResponse.value.data
            : { active: 0, completed: 0, totalSpent: 0, averageROI: 0 },

        applications:
          applicationsResponse.status === 'fulfilled' &&
          applicationsResponse.value.success
            ? applicationsResponse.value.data
            : { total: 0, pending: 0, approved: 0, rejected: 0 },

        analytics:
          analyticsResponse.status === 'fulfilled' &&
          analyticsResponse.value.success
            ? analyticsResponse.value.data
            : {
                totalReach: 0,
                totalEngagement: 0,
                conversionRate: 0,
                topPerformingCampaign: 'N/A',
              },

        reputation:
          reputationResponse.status === 'fulfilled' &&
          reputationResponse.value.success
            ? reputationResponse.value.data
            : { score: 0, reviews: 0, averageRating: 0 },

        credits:
          creditsResponse.status === 'fulfilled' &&
          creditsResponse.value.success
            ? creditsResponse.value.data
            : { balance: 0, spent: 0, reserved: 0 },
      };

      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load brand dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      href: '/create-gig',
      icon: '➕',
      label: 'Create Campaign',
      description: 'Launch new campaign',
      permission: 'gig.create',
    },
    {
      href: '/my/campaigns',
      icon: '📢',
      label: 'My Campaigns',
      description: 'Manage campaigns',
    },
    {
      href: '/influencers/search',
      icon: '🔍',
      label: 'Find Influencers',
      description: 'Discover creators',
      permission: 'influencer.search',
    },
    {
      href: '/applications/received',
      icon: '📨',
      label: 'Applications',
      description: 'Review applications',
      permission: 'applications.manage',
    },
    {
      href: '/analytics/campaigns',
      icon: '📊',
      label: 'Analytics',
      description: 'Campaign insights',
      permission: 'analytics.view',
    },
    {
      href: '/credits/purchase',
      icon: '💳',
      label: 'Buy Credits',
      description: 'Add budget',
      permission: 'credits.purchase',
    },
    {
      href: '/brand/profile',
      icon: '🏢',
      label: 'Brand Profile',
      description: 'Update brand info',
    },
    {
      href: '/support',
      icon: '🎧',
      label: 'Support',
      description: 'Get help',
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="card-glass p-8 text-center">
            <span className="mb-4 block text-4xl">⚠️</span>
            <h2 className="text-heading mb-2 text-xl font-semibold">
              Unable to Load Dashboard
            </h2>
            <p className="text-muted mb-4">{error}</p>
            <button onClick={loadBrandDashboardData} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          title="Brand Dashboard"
          subtitle="Manage your influencer marketing campaigns and track performance"
        />

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Campaigns"
            value={dashboardData?.campaigns?.active || 0}
            icon="📢"
            loading={loading}
            onClick={() =>
              (window.location.href = '/my/campaigns?status=active')
            }
          />
          <MetricCard
            title="Pending Applications"
            value={dashboardData?.applications?.pending || 0}
            icon="📨"
            loading={loading}
            urgent={(dashboardData?.applications?.pending || 0) > 10}
            onClick={() =>
              (window.location.href = '/applications/received?status=pending')
            }
          />
          <MetricCard
            title="Total Reach"
            value={dashboardData?.analytics?.totalReach || 0}
            icon="👥"
            loading={loading}
            onClick={() => (window.location.href = '/analytics/reach')}
          />
          <MetricCard
            title="Credits Balance"
            value={`$${dashboardData?.credits?.balance || 0}`}
            icon="💰"
            loading={loading}
            onClick={() => (window.location.href = '/credits')}
          />
        </div>

        {/* Campaign Performance Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Completion Widget */}
          <div className="lg:col-span-1">
            <ProfileCompletionWidget />
          </div>

          <div className="lg:col-span-2">
            <div className="card-glass p-6">
              <h3 className="text-heading mb-6 text-lg font-semibold">
                📊 Campaign Performance
              </h3>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-3/4 rounded bg-gray-300"></div>
                  <div className="h-32 rounded bg-gray-300"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      {dashboardData?.campaigns?.completed || 0}
                    </div>
                    <div className="text-muted text-sm">
                      Completed Campaigns
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      ${dashboardData?.campaigns?.totalSpent || 0}
                    </div>
                    <div className="text-muted text-sm">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      {dashboardData?.analytics?.conversionRate || 0}%
                    </div>
                    <div className="text-muted text-sm">Conversion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      {dashboardData?.campaigns?.averageROI || 0}%
                    </div>
                    <div className="text-muted text-sm">Average ROI</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="card-glass p-6">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              📨 Recent Applications
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                    <div className="flex-1">
                      <div className="mb-1 h-3 w-3/4 rounded bg-gray-300"></div>
                      <div className="h-2 w-1/2 rounded bg-gray-300"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                      <span className="text-xs font-semibold text-white">
                        JD
                      </span>
                    </div>
                    <div>
                      <div className="text-body font-medium">John Doe</div>
                      <div className="text-muted text-xs">
                        Instagram Campaign
                      </div>
                    </div>
                  </div>
                  <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-600">
                    Pending
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-500">
                      <span className="text-xs font-semibold text-white">
                        SM
                      </span>
                    </div>
                    <div>
                      <div className="text-body font-medium">Sarah Miller</div>
                      <div className="text-muted text-xs">TikTok Campaign</div>
                    </div>
                  </div>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-600">
                    Approved
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <span className="text-xs font-semibold text-white">
                        MJ
                      </span>
                    </div>
                    <div>
                      <div className="text-body font-medium">Mike Johnson</div>
                      <div className="text-muted text-xs">YouTube Campaign</div>
                    </div>
                  </div>
                  <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-600">
                    Pending
                  </span>
                </div>

                <div className="border-t pt-2">
                  <button
                    onClick={() =>
                      (window.location.href = '/applications/received')
                    }
                    className="text-accent w-full text-sm hover:underline"
                  >
                    View All Applications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics & Budget */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card-glass p-6">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              📈 Analytics Overview
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-1/3 rounded bg-gray-300"></div>
                    <div className="h-3 w-1/4 rounded bg-gray-300"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-body">Total Engagement</span>
                  <span className="text-heading font-semibold">
                    {(
                      dashboardData?.analytics?.totalEngagement || 0
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-body">Conversion Rate</span>
                  <span className="text-heading font-semibold">
                    {dashboardData?.analytics?.conversionRate || 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-body">Top Campaign</span>
                  <span className="text-heading text-sm font-semibold">
                    {dashboardData?.analytics?.topPerformingCampaign || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-body">Brand Rating</span>
                  <span className="text-heading font-semibold">
                    {dashboardData?.reputation?.averageRating || 0}/5 ⭐
                  </span>
                </div>

                <div className="border-t pt-2">
                  <button
                    onClick={() =>
                      (window.location.href = '/analytics/detailed')
                    }
                    className="text-accent w-full text-sm hover:underline"
                  >
                    View Detailed Analytics
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card-glass p-6">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              💰 Budget Management
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body">Available Credits</span>
                <span className="text-heading font-semibold text-green-600">
                  ${dashboardData?.credits?.balance || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body">Reserved for Campaigns</span>
                <span className="text-heading font-semibold text-yellow-600">
                  ${dashboardData?.credits?.reserved || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body">Total Spent</span>
                <span className="text-heading font-semibold">
                  ${dashboardData?.credits?.spent || 0}
                </span>
              </div>

              <div className="pt-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => (window.location.href = '/credits/purchase')}
                    className="btn-primary flex-1"
                  >
                    Add Credits
                  </button>
                  <button
                    onClick={() => (window.location.href = '/credits/history')}
                    className="btn-secondary flex-1"
                  >
                    View History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionsGrid actions={quickActions} title="Brand Tools" />
      </div>
    </div>
  );
};
