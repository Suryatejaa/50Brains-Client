'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { DashboardHeader } from '../shared/DashboardHeader';
import { MetricCard } from '../shared/MetricCard';
import { QuickActionsGrid } from '../shared/QuickActions';
import { ProfileCompletionWidget } from '@/components/ProfileCompletionWidget';

interface CreatorDashboardData {
  reputation: {
    totalScore: number;
    trend: number;
    level: string;
    nextLevelPoints: number;
  };
  socialMedia: {
    totalFollowers: number;
    totalEngagement: number;
    connectedAccounts: number;
    growth: number;
    accounts: Array<{
      platform: string;
      followers: number;
      engagement: number;
    }>;
  };
  gigs: {
    activeApplications: number;
    completedGigs: number;
    totalEarnings: number;
    averageRating: number;
    pendingWork: number;
  };
  credits: {
    balance: number;
    earned: number;
    spent: number;
  };
  portfolio: {
    totalItems: number;
    views: number;
    likes: number;
  };
}

export const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<CreatorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCreatorDashboardData();
  }, []);

  const loadCreatorDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [
        reputationResponse,
        socialMediaResponse,
        gigsResponse,
        creditsResponse,
        portfolioResponse,
      ] = await Promise.allSettled([
        apiClient.get(`/api/reputation/${user.id}`),
        apiClient.get(`/api/social-media/${user.id}`),
        apiClient.get('/api/my/gigs/summary'),
        apiClient.get('/api/credit/balance'),
        apiClient.get('/api/portfolio/summary'),
      ]);

      const data: CreatorDashboardData = {
        reputation:
          reputationResponse.status === 'fulfilled' &&
          reputationResponse.value.success
            ? reputationResponse.value.data
            : {
                totalScore: 0,
                trend: 0,
                level: 'Bronze',
                nextLevelPoints: 100,
              },

        socialMedia:
          socialMediaResponse.status === 'fulfilled' &&
          socialMediaResponse.value.success
            ? socialMediaResponse.value.data
            : {
                totalFollowers: 0,
                totalEngagement: 0,
                connectedAccounts: 0,
                growth: 0,
                accounts: [],
              },

        gigs:
          gigsResponse.status === 'fulfilled' && gigsResponse.value.success
            ? gigsResponse.value.data
            : {
                activeApplications: 0,
                completedGigs: 0,
                totalEarnings: 0,
                averageRating: 0,
                pendingWork: 0,
              },

        credits:
          creditsResponse.status === 'fulfilled' &&
          creditsResponse.value.success
            ? creditsResponse.value.data
            : { balance: 0, earned: 0, spent: 0 },

        portfolio:
          portfolioResponse.status === 'fulfilled' &&
          portfolioResponse.value.success
            ? portfolioResponse.value.data
            : { totalItems: 0, views: 0, likes: 0 },
      };

      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load creator dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      href: '/marketplace',
      icon: '🔍',
      label: 'Browse Gigs',
      description: 'Find new opportunities',
      permission: 'gig.view',
    },
    {
      href: '/my/applications',
      icon: '📨',
      label: 'My Applications',
      description: 'Track your applications',
    },
    {
      href: '/portfolio',
      icon: '📁',
      label: 'Portfolio',
      description: 'Showcase your work',
      permission: 'portfolio.manage',
    },
    {
      href: '/profile/edit',
      icon: '✏️',
      label: 'Edit Profile',
      description: 'Update your info',
      permission: 'profile.edit',
    },
    {
      href: '/social-media',
      icon: '📱',
      label: 'Social Media',
      description: 'Link your accounts',
      permission: 'social.link',
    },
    {
      href: '/credits/purchase',
      icon: '💳',
      label: 'Buy Credits',
      description: 'Boost your visibility',
    },
    {
      href: '/analytics',
      icon: '📊',
      label: 'Analytics',
      description: 'View your performance',
      permission: 'analytics.personal',
    },
    {
      href: '/clans/browse',
      icon: '👥',
      label: 'Join Clan',
      description: 'Find your community',
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
            <button onClick={loadCreatorDashboardData} className="btn-primary">
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
          title="Creator Dashboard"
          subtitle="Manage your creative career and track your growth"
        />

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Reputation Score"
            value={dashboardData?.reputation?.totalScore || 0}
            icon="🏆"
            trend={dashboardData?.reputation?.trend}
            loading={loading}
            onClick={() => (window.location.href = '/reputation')}
          />
          <MetricCard
            title="Total Followers"
            value={dashboardData?.socialMedia?.totalFollowers || 0}
            icon="👥"
            loading={loading}
            onClick={() => (window.location.href = '/social-media')}
          />
          <MetricCard
            title="Active Applications"
            value={dashboardData?.gigs?.activeApplications || 0}
            icon="📨"
            loading={loading}
            onClick={() => (window.location.href = '/my/applications')}
          />
          <MetricCard
            title="Credits Balance"
            value={dashboardData?.credits?.balance || 0}
            icon="💰"
            loading={loading}
            onClick={() => (window.location.href = '/credits')}
          />
        </div>

        {/* Dashboard Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Completion Widget */}
          <div className="lg:col-span-1">
            <ProfileCompletionWidget />
          </div>

          {/* Performance Overview */}
          <div className="lg:col-span-2">
            <div className="card-glass p-6">
              <h3 className="text-heading mb-6 text-lg font-semibold">
                📈 Performance Overview
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
                      {dashboardData?.gigs?.completedGigs || 0}
                    </div>
                    <div className="text-muted text-sm">Completed Gigs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      ${dashboardData?.gigs?.totalEarnings || 0}
                    </div>
                    <div className="text-muted text-sm">Total Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      {dashboardData?.gigs?.averageRating || 0}/5
                    </div>
                    <div className="text-muted text-sm">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      {dashboardData?.portfolio?.views || 0}
                    </div>
                    <div className="text-muted text-sm">Portfolio Views</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-glass p-6">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              ⚡ Recent Activity
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
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-lg">📝</span>
                  <div>
                    <div className="text-body">Applied to new gig</div>
                    <div className="text-muted text-xs">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-lg">✅</span>
                  <div>
                    <div className="text-body">Completed project delivery</div>
                    <div className="text-muted text-xs">1 day ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-lg">⭐</span>
                  <div>
                    <div className="text-body">Received 5-star review</div>
                    <div className="text-muted text-xs">2 days ago</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social Media Growth */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Social Media Growth */}
          <div className="lg:col-span-2">
            <div className="card-glass p-6">
              <h3 className="text-heading mb-6 text-lg font-semibold">
                📱 Social Media Growth
              </h3>

              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded bg-gray-300"></div>
                        <div className="h-3 w-20 rounded bg-gray-300"></div>
                      </div>
                      <div className="h-3 w-16 rounded bg-gray-300"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.socialMedia?.accounts?.map(
                    (account, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {account.platform === 'instagram'
                              ? '📸'
                              : account.platform === 'tiktok'
                                ? '🎵'
                                : account.platform === 'youtube'
                                  ? '📺'
                                  : '📱'}
                          </span>
                          <span className="text-body font-medium capitalize">
                            {account.platform}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-heading font-semibold">
                            {account.followers.toLocaleString()}
                          </div>
                          <div className="text-muted text-xs">
                            {account.engagement}% engagement
                          </div>
                        </div>
                      </div>
                    )
                  ) || (
                    <div className="py-6 text-center">
                      <span className="mb-2 block text-4xl">📱</span>
                      <p className="text-muted">
                        No social media accounts connected
                      </p>
                      <button
                        onClick={() => (window.location.href = '/social-media')}
                        className="btn-primary mt-3"
                      >
                        Connect Accounts
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card-glass p-6">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              🎯 Goals & Progress
            </h3>

            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-body">Next Reputation Level</span>
                  <span className="text-muted">
                    {dashboardData?.reputation?.totalScore || 0} /{' '}
                    {dashboardData?.reputation?.nextLevelPoints || 100}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{
                      width: `${Math.min(100, ((dashboardData?.reputation?.totalScore || 0) / (dashboardData?.reputation?.nextLevelPoints || 100)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-body">Monthly Gig Goal</span>
                  <span className="text-muted">3 / 5</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: '60%' }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-body">Portfolio Items</span>
                  <span className="text-muted">
                    {dashboardData?.portfolio?.totalItems || 0} / 10
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-500"
                    style={{
                      width: `${Math.min(100, ((dashboardData?.portfolio?.totalItems || 0) / 10) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionsGrid actions={quickActions} />
      </div>
    </div>
  );
};
