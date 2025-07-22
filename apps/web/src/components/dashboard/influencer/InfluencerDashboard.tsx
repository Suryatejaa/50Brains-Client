'use client';

import React from 'react';
import { useInfluencerDashboard } from '@/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { QuickActionsGrid } from '../shared/QuickActions';

export const InfluencerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useInfluencerDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 py-2 md:p-3">
        <div className="flex min-h-screen items-center justify-center">
          <div className="card-glass p-3 text-center md:p-3">
            <div className="border-brand-primary mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent md:mb-4 md:h-8 md:w-8"></div>
            <p className="text-muted text-sm md:text-base">
              Loading your influencer dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 py-2 md:p-3">
        <div className="mx-auto max-w-7xl">
          <div className="card-glass p-3 text-center md:p-3">
            <div className="mb-2 text-3xl md:mb-4 md:text-4xl">⚠️</div>
            <h2 className="text-heading mb-1 text-lg font-semibold md:mb-2 md:text-xl">
              Dashboard Error
            </h2>
            <p className="text-muted mb-3 text-sm md:mb-6 md:text-base">
              Unable to load your dashboard data. Please try again.
            </p>
            <button
              onClick={refresh}
              className="btn-primary px-4 py-2 text-sm md:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2 md:p-3">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-2 md:mb-2">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-heading text-xl font-bold md:text-2xl">
                Influencer Dashboard
              </h1>
              <p className="text-muted text-sm md:text-base">
                Welcome back, {user?.username || user?.email || 'Influencer'}!
                🎨
              </p>
            </div>
            <QuickActionsGrid
              actions={[
                { label: 'Browse Gigs', href: '/marketplace', icon: '🎯' },
                {
                  label: 'My Applications',
                  href: '/my-applications',
                  icon: '📋',
                },
                { label: 'Analytics', href: '/analytics', icon: '📊' },
                { label: 'Profile', href: '/profile', icon: '👤' },
              ]}
            />
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="mb-2 grid grid-cols-2 gap-2 md:mb-2 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
          <div className="card-glass p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">Total Followers</p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  {data?.contentMetrics?.totalFollowers?.toLocaleString() ||
                    '0'}
                </p>
                <p className="text-xs text-green-600">
                  {data?.contentMetrics?.growthRate
                    ? `+${data.contentMetrics.growthRate}%`
                    : ''}
                </p>
              </div>
              <div className="text-2xl md:text-3xl">👥</div>
            </div>
          </div>

          <div className="card-glass p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">
                  Monthly Earnings
                </p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  $
                  {data?.earningsMetrics?.monthlyEarnings?.toLocaleString() ||
                    '0'}
                </p>
                <p className="text-muted text-xs">
                  Avg: $
                  {data?.earningsMetrics?.avgGigPayment?.toLocaleString() ||
                    '0'}
                </p>
              </div>
              <div className="text-2xl md:text-3xl">💰</div>
            </div>
          </div>

          <div className="card-glass p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">
                  Active Campaigns
                </p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  {data?.campaignMetrics?.activeCollaborations || 0}
                </p>
                <p className="text-muted text-xs">
                  {data?.campaignMetrics?.pendingApplications || 0} pending
                </p>
              </div>
              <div className="text-2xl md:text-3xl">🎯</div>
            </div>
          </div>

          <div className="card-glass p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">Success Rate</p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  {data?.campaignMetrics?.successRate || 0}%
                </p>
                <p className="text-muted text-xs">
                  Rating: {data?.campaignMetrics?.averageRating || 0}/5
                </p>
              </div>
              <div className="text-2xl md:text-3xl">⭐</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-2 md:gap-2 lg:grid-cols-3">
          {/* Left Column - Content & Campaigns */}
          <div className="space-y-2 md:space-y-2 lg:col-span-2">
            {/* Content Performance */}
            <div className="card-glass p-3 md:p-4">
              <div className="mb-1 flex items-center justify-between md:mb-1">
                <h3 className="text-heading text-lg font-semibold">
                  Content Performance
                </h3>
                <div className="text-xl">📈</div>
              </div>
              <div className="grid grid-cols-3 gap-3 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-muted text-xs md:text-sm">
                    Avg Engagement
                  </p>
                  <p className="text-heading text-lg font-semibold">
                    {data?.contentMetrics?.avgEngagementRate || 0}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted text-xs md:text-sm">Monthly Reach</p>
                  <p className="text-heading text-lg font-semibold">
                    {data?.contentMetrics?.monthlyReach?.toLocaleString() ||
                      '0'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted text-xs md:text-sm">Platforms</p>
                  <p className="text-heading text-lg font-semibold">
                    {data?.contentMetrics?.connectedPlatforms || 0}
                  </p>
                </div>
              </div>
              {data?.contentMetrics?.topPerformingPlatform && (
                <div className="mt-3 rounded-none bg-blue-50 p-2 md:mt-4">
                  <p className="text-xs text-blue-800 md:text-sm">
                    🏆 Top Platform: {data.contentMetrics.topPerformingPlatform}
                  </p>
                </div>
              )}
            </div>

            {/* Social Platforms */}
            {data?.socialPlatforms && data.socialPlatforms.length > 0 && (
              <div className="card-glass p-3 md:p-4">
                <div className="mb-1 flex items-center justify-between md:mb-1">
                  <h3 className="text-heading text-lg font-semibold">
                    Social Platforms
                  </h3>
                  <div className="text-xl">🌐</div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {data.socialPlatforms.map((platform, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-none bg-gray-50 p-2 md:p-3"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="text-lg">
                          {platform.platform === 'Instagram' && '📸'}
                          {platform.platform === 'TikTok' && '🎵'}
                          {platform.platform === 'YouTube' && '📺'}
                          {platform.platform === 'Twitter' && '🐦'}
                          {![
                            'Instagram',
                            'TikTok',
                            'YouTube',
                            'Twitter',
                          ].includes(platform.platform) && '📱'}
                        </div>
                        <div>
                          <p className="text-heading text-sm font-medium md:text-base">
                            {platform.platform}
                          </p>
                          <p className="text-muted text-xs">
                            {platform.followers.toLocaleString()} followers •{' '}
                            {platform.engagement}% engagement
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600 md:text-sm">
                          {platform.growth > 0 ? '+' : ''}
                          {platform.growth}%
                        </p>
                        <p className="text-muted text-xs">
                          {platform.posts} posts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Campaigns */}
            {data?.recentCampaigns && data.recentCampaigns.length > 0 && (
              <div className="card-glass p-3 md:p-4">
                <div className="mb-3 flex items-center justify-between md:mb-4">
                  <h3 className="text-heading text-lg font-semibold">
                    Recent Campaigns
                  </h3>
                  <div className="text-xl">🎯</div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {data.recentCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between rounded-none bg-gray-50 p-2 md:p-3"
                    >
                      <div>
                        <p className="text-heading text-sm font-medium md:text-base">
                          {campaign.title}
                        </p>
                        <p className="text-muted text-xs">
                          {campaign.brand} • Due:{' '}
                          {new Date(campaign.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-heading text-sm font-medium md:text-base">
                          ${campaign.payment.toLocaleString()}
                        </p>
                        <span
                          className={`inline-block rounded-none px-2 py-1 text-xs ${
                            campaign.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'ACTIVE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Insights */}
          <div className="space-y-2 md:space-y-2">
            {/* Earnings Overview */}
            <div className="card-glass p-3 md:p-4">
              <div className="mb-1 flex items-center justify-between md:mb-1">
                <h3 className="text-heading text-lg font-semibold">Earnings</h3>
                <div className="text-xl">💰</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Total Earnings</span>
                  <span className="text-heading font-semibold">
                    $
                    {data?.earningsMetrics?.totalEarnings?.toLocaleString() ||
                      '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">This Month</span>
                  <span className="text-heading font-semibold">
                    $
                    {data?.earningsMetrics?.monthlyEarnings?.toLocaleString() ||
                      '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Pending</span>
                  <span className="font-semibold text-yellow-600">
                    $
                    {data?.earningsMetrics?.pendingPayments?.toLocaleString() ||
                      '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Influencer Tier */}
            {data?.influencerTier && (
              <div className="card-glass p-3 md:p-4">
                <div className="mb-1 flex items-center justify-between md:mb-1">
                  <h3 className="text-heading text-lg font-semibold">
                    Influencer Tier
                  </h3>
                  <div className="text-xl">🏆</div>
                </div>
                <div className="text-center">
                  <div className="text-brand-primary mb-2 text-2xl font-bold md:text-3xl">
                    {data.influencerTier.current}
                  </div>
                  <div className="mb-2 text-4xl">
                    {data.influencerTier.current === 'BRONZE' && '🥉'}
                    {data.influencerTier.current === 'SILVER' && '🥈'}
                    {data.influencerTier.current === 'GOLD' && '🥇'}
                    {data.influencerTier.current === 'DIAMOND' && '💎'}
                    {!['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'].includes(
                      data.influencerTier.current
                    ) && '⭐'}
                  </div>
                  <p className="text-muted mb-3 text-sm">
                    Score: {data.influencerTier.score}/100
                  </p>
                  {data.influencerTier.nextTier && (
                    <div>
                      <p className="text-muted mb-2 text-xs">
                        Next: {data.influencerTier.nextTier}
                      </p>
                      <div className="h-2 rounded-none bg-gray-200">
                        <div
                          className="bg-brand-primary h-2 rounded-none transition-all duration-300"
                          style={{ width: `${data.influencerTier.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-muted mt-1 text-xs">
                        {data.influencerTier.progress}% complete
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {data?.recommendations && (
              <div className="card-glass p-3 md:p-4">
                <div className="mb-3 flex items-center justify-between md:mb-4">
                  <h3 className="text-heading text-lg font-semibold">
                    For You
                  </h3>
                  <div className="text-xl">💡</div>
                </div>
                {data.recommendations &&
                  'suggestedGigs' in data.recommendations &&
                  Array.isArray((data.recommendations as any).suggestedGigs) &&
                  (data.recommendations as any).suggestedGigs.length > 0 && (
                    <div className="mb-3 md:mb-4">
                      <h4 className="text-heading mb-2 text-sm font-medium">
                        Suggested Gigs
                      </h4>
                      <div className="space-y-1 md:space-y-2">
                        {(data.recommendations as any).suggestedGigs
                          .slice(0, 3)
                          .map((gig: any, index: number) => (
                            <div
                              key={index}
                              className="text-brand-primary cursor-pointer text-sm hover:underline"
                            >
                              {gig.title || `Gig ${index + 1}`}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                {data.recommendations.growthTips?.length > 0 && (
                  <div className="mb-3 md:mb-4">
                    <h4 className="text-heading mb-2 text-sm font-medium">
                      Growth Tips
                    </h4>
                    <div className="space-y-1">
                      {data.recommendations.growthTips
                        .slice(0, 2)
                        .map((tip: string, index: number) => (
                          <p key={index} className="text-muted text-xs">
                            💡 {tip}
                          </p>
                        ))}
                    </div>
                  </div>
                )}
                {data.recommendations.trendingHashtags?.length > 0 && (
                  <div>
                    <h4 className="text-heading mb-2 text-sm font-medium">
                      Trending Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {data.recommendations.trendingHashtags
                        .slice(0, 5)
                        .map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="bg-brand-primary/10 text-brand-primary rounded-none px-2 py-1 text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
