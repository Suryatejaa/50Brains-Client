'use client';

import React from 'react';
import { useInfluencerDashboard } from '@/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { useWorkHistory } from '@/hooks/useWorkHistory';
import { QuickActionsGrid } from '../shared/QuickActions';
import { WorkHistorySummary } from '@/components/WorkHistorySummary';
import { WorkHistoryList } from '@/components/WorkHistoryList';
import { Portfolio } from '@/components/Portfolio';
import { apiClient } from '@/lib/api-client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Achievements } from '@/components/Achievements';
import {
  DollarSignIcon,
  IndianRupeeIcon,
  InstagramIcon,
  MegaphoneIcon,
  PartyPopperIcon,
  SmileIcon,
  TwitterIcon,
  UsersIcon,
  YoutubeIcon,
} from 'lucide-react';
import { BarChartIcon, PhoneIcon, TargetIcon } from 'lucide-react';
import { FileTextIcon, GlobeIcon, StarIcon } from 'lucide-react';
import { TrophyIcon, TicketIcon, UserIcon } from 'lucide-react';
import { LightbulbIcon } from 'lucide-react';
import { TrendingUpIcon } from 'lucide-react';

interface Application {
  id: string;
  gigId: string;
  applicantId: string;
  applicantType: string;
  proposal: string;
  quotedPrice: number;
  estimatedTime: string;
  portfolio: string[] | { title: string; url: string }[];
  status: string;
  appliedAt: string;
  respondedAt: string;
  rejectionReason: string | null;
  gig: Gig;
}

interface Gig {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  budgetType: string;
  status: string;
  deadline: string;
  createdAt: string;
}

export const InfluencerDashboard: React.FC = () => {
  const { data, loading, error, refresh } = useInfluencerDashboard();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Enhanced work history hooks for additional dashboard metrics
  const {
    workSummary,
    skills,
    portfolio,
    achievements,
    reputation,
    fetchWorkStatistics,
    fetchSkills,
    fetchPortfolio,
    fetchAchievements,
  } = useWorkHistory(user?.id);

  console.log('🎯 Influencer Dashboard Data:', data);
  console.log('📊 Work History Data:', {
    workSummary,
    skills,
    portfolio,
    achievements,
    reputation,
  });

  const [applications, setApplications] = React.useState<Application[]>([]);
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadApplications();
    }
  }, [isAuthenticated, user]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/my/applications');

      console.log(response);
      if (response.success && response.data) {
        const { applications = [] } = response.data as {
          applications: Application[];
        };
        setApplications(applications);
        console.log(applications);
        // Calculate stats
        setStats({
          total: applications.length,
          pending: applications.filter(
            (app: Application) => app.status === 'PENDING'
          ).length,
          approved: applications.filter(
            (app: Application) => app.status === 'APPROVED'
          ).length,
          completed: applications.filter(
            (app: Application) => app.status === 'COMPLETED'
          ).length,
        });
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeApplications = applications.filter(
    (app) => app.status === 'PENDING' || app.status === 'APPROVED'
  );

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
    <div className="min-h-screen bg-gray-50 px-1 py-0 md:p-3">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-1 md:mb-1">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-heading text-xl font-bold md:text-2xl">
                Influencer Dashboard
              </h1>
              <p className="text-muted flex items-center gap-1 text-sm md:text-base">
                Welcome back, {user?.username || user?.email || 'Influencer'}!{' '}
                <SmileIcon className="h-4 w-4" />
              </p>
            </div>
            <QuickActionsGrid
              actions={[
                {
                  label: 'Browse Gigs',
                  href: '/marketplace',
                  icon: <MegaphoneIcon className="h-6 w-6" />,
                },
                {
                  label: 'View Submissions',
                  href: '/my/submissions',
                  icon: <FileTextIcon className="h-6 w-6" />,
                },
                // {
                //   label: 'Analytics',
                //   href: '/analytics',
                //   icon: <BarChartIcon className="h-6 w-6" />,
                // },
                // {
                //   label: 'Clans',
                //   href: '/clans',
                //   icon: <UsersIcon className="h-6 w-6" />,
                // },
              ]}
            />
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="mb-1 grid grid-cols-1 gap-1 md:mb-1 md:grid-cols-3 md:gap-1 lg:grid-cols-3">
          <div className="card-glass hidden p-3 md:p-4">
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
              <div className="text-2xl md:text-3xl">
                <UsersIcon className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card-glass p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">
                  Monthly Earnings
                </p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  ₹
                  {data?.earningsMetrics?.monthlyEarnings?.toLocaleString() ||
                    '0'}
                </p>
                <p className="text-muted text-xs">
                  Avg: ₹
                  {data?.earningsMetrics?.avgGigPayment?.toLocaleString() ||
                    '0'}
                </p>
              </div>
              <div className="text-2xl md:text-3xl">
                <IndianRupeeIcon className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div
            className="card-glass p-3 md:p-4"
            onClick={() => router.push('/my/applications')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">
                  Active Campaigns
                </p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  {activeApplications.length || 0}
                </p>
                <p className="text-muted text-xs">
                  {data?.campaignMetrics?.pendingApplications || 0} pending
                </p>
              </div>
              <div className="text-2xl md:text-3xl">
                <TargetIcon className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card-glass p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">Success Rate</p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  {workSummary?.successRate || 0}%
                </p>
                <p className="text-muted text-xs">
                  Rating: {workSummary?.averageRating || 0}/5
                </p>
              </div>
              <div className="text-2xl md:text-3xl">
                <StarIcon className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-1 md:gap-1 lg:grid-cols-3">
          {/* Left Column - Content & Campaigns */}
          <div className="space-y-1 md:space-y-1 lg:col-span-2">
            {/* Content Performance */}
            <div className="card-glass relative p-3 md:p-4">
              {/* Blur overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-sm">
                <div className="text-center">
                  <div className="mb-2 flex justify-center">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Coming Soon
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Content Performance Analytics
                  </p>
                </div>
              </div>

              {/* Blurred content */}
              <div className="blur-sm">
                <div className="mb-1 flex items-center justify-between md:mb-1">
                  <h3 className="text-heading text-lg font-semibold">
                    Content Performance
                  </h3>
                  <div className="text-xl">
                    <TrendingUpIcon className="h-6 w-6" />
                  </div>
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
                    <p className="text-muted text-xs md:text-sm">
                      Monthly Reach
                    </p>
                    <p className="text-heading text-lg font-semibold">
                      {data?.contentMetrics?.monthlyReach?.toLocaleString() ||
                        '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted text-xs md:text-sm">
                      Success Rate
                    </p>
                    <p className="text-heading text-lg font-semibold">
                      {workSummary?.successRate ||
                        data?.contentMetrics?.connectedPlatforms ||
                        0}
                      %
                    </p>
                  </div>
                </div>
                {data?.contentMetrics?.topPerformingPlatform && (
                  <div className="mt-3 rounded-none bg-blue-50 p-2 md:mt-4">
                    <p className="text-xs text-blue-800 md:text-sm">
                      🏆 Top Platform:{' '}
                      {data.contentMetrics.topPerformingPlatform}
                    </p>
                  </div>
                )}

                {/* Work History Performance Metrics */}
                {workSummary && (
                  <div className="mt-3 grid grid-cols-2 gap-2 md:mt-4">
                    <div className="rounded-none bg-green-50 p-2 text-center">
                      <p className="text-xs text-green-800 md:text-sm">
                        ⭐ {workSummary.averageRating?.toFixed(1) || 0}/5 Rating
                      </p>
                    </div>
                    <div className="rounded-none bg-purple-50 p-2 text-center">
                      <p className="text-xs text-purple-800 md:text-sm">
                        📊 {workSummary.totalProjects || 0} Projects
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Platforms */}
            {data?.socialPlatforms && data.socialPlatforms.length > 0 && (
              <div className="card-glass p-3 md:p-4">
                <div className="mb-1 flex items-center justify-between md:mb-1">
                  <h3 className="text-heading text-lg font-semibold">
                    Social Platforms
                  </h3>
                  <div className="text-xl">
                    <GlobeIcon className="h-6 w-6" />
                  </div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {data.socialPlatforms.map((platform, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-none bg-gray-50 p-2 md:p-3"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="text-lg">
                          {platform.platform === 'Instagram' && (
                            <InstagramIcon className="h-6 w-6" />
                          )}
                          {platform.platform === 'TikTok' && (
                            <TicketIcon className="h-6 w-6" />
                          )}
                          {platform.platform === 'YouTube' && (
                            <YoutubeIcon className="h-6 w-6" />
                          )}
                          {platform.platform === 'Twitter' && (
                            <TwitterIcon className="h-6 w-6" />
                          )}
                          {![
                            'Instagram',
                            'TikTok',
                            'YouTube',
                            'Twitter',
                          ].includes(platform.platform) && (
                            <PhoneIcon className="h-6 w-6" />
                          )}
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
                  <div className="text-xl">
                    <TargetIcon className="h-6 w-6" />
                  </div>
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

            {/* Work History Section */}
            <div className="mt-1 space-y-1 md:space-y-1">
              <div className="card-glass p-1 md:p-1">
                <div className="mb-1 flex items-center justify-between md:mb-1">
                  <h3 className="text-heading text-lg font-semibold">
                    Work History & Portfolio
                  </h3>
                  <div className="text-xl">
                    <BarChartIcon className="h-6 w-6" />
                  </div>
                </div>

                {/* Work History Summary */}
                <div className="mb-1">
                  <WorkHistorySummary userId={user?.id} />
                </div>

                {/* Recent Work and Achievements Grid */}
                <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-2">
                  <div>
                    <h4 className="text-heading mb-1 text-sm font-medium md:text-base">
                      Recent Work
                    </h4>
                    <div className="max-h-64 overflow-y-auto">
                      <WorkHistoryList
                        userId={user?.id}
                        showFilters={false}
                        limit={3}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-heading mb-2 text-sm font-medium md:text-base">
                      Recent Achievements
                    </h4>
                    <div className="max-h-64 overflow-y-auto">
                      <Achievements
                        userId={user?.id}
                        showVerifiedOnly={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Portfolio Preview */}
                <div className="mt-1">
                  <h4 className="text-heading mb-1 text-sm font-medium md:text-base">
                    Portfolio Highlights
                  </h4>
                  <div className="max-h-48 overflow-y-auto">
                    <Portfolio userId={user?.id} showPublicOnly={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Insights */}
          <div className="space-y-1 md:space-y-1">
            {/* Earnings Overview */}
            <div className="card-glass p-3 md:p-4">
              <div className="mb-1 flex items-center justify-between md:mb-1">
                <h3 className="text-heading text-lg font-semibold">Earnings</h3>
                <div className="text-xl">
                  <IndianRupeeIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Total Earnings</span>
                  <span className="text-heading font-semibold">
                    ₹
                    {workSummary?.totalEarnings?.toLocaleString() ||
                      data?.earningsMetrics?.totalEarnings?.toLocaleString() ||
                      '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">This Month</span>
                  <span className="text-heading font-semibold">
                    ₹
                    {data?.earningsMetrics?.monthlyEarnings?.toLocaleString() ||
                      '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Pending</span>
                  <span className="font-semibold text-yellow-600">
                    ₹
                    {data?.earningsMetrics?.pendingPayments?.toLocaleString() ||
                      '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Completed Projects</span>
                  <span className="text-heading font-semibold">
                    {workSummary?.completedProjects || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Reputation Tier */}
            {(reputation || data?.influencerTier) && (
              <div className="card-glass p-3 md:p-4">
                <div className="mb-1 flex items-center justify-between md:mb-1">
                  <h3 className="text-heading text-lg font-semibold">
                    Reputation Tier
                  </h3>
                  {/* <div className="text-xl">
                    <TrophyIcon className="h-6 w-6" />
                  </div> */}
                </div>
                <div className="items-center text-center">
                  <div className="text-brand-primary mb-2 text-2xl font-bold md:text-3xl">
                    {reputation?.tier || 'UNRANKED'}
                  </div>
                  <div className="mb-2 flex items-center justify-center">
                    {reputation?.tier === 'BRONZE' && (
                      <TrophyIcon className="h-12 w-12 text-amber-600" />
                    )}
                    {reputation?.tier === 'SILVER' && (
                      <TrophyIcon className="h-12 w-12 text-gray-400" />
                    )}
                    {reputation?.tier === 'GOLD' && (
                      <TrophyIcon className="h-12 w-12 text-yellow-500" />
                    )}
                    {reputation?.tier === 'DIAMOND' && (
                      <TrophyIcon className="h-12 w-12 text-cyan-400" />
                    )}
                    {!['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'].includes(
                      reputation?.tier || data?.influencerTier?.current || ''
                    ) && <StarIcon className="h-12 w-12 text-gray-400" />}
                  </div>
                  <p className="text-muted mb-3 text-sm">
                    Score:{' '}
                    {reputation?.finalScore || data?.influencerTier?.score || 0}
                    {reputation ? '' : '/100'}
                  </p>

                  <div className="mb-3 text-xs text-gray-600">
                    <p>
                      Global Rank: #{reputation?.ranking?.global?.rank || 'N/A'}
                    </p>
                    <p>
                      Tier Rank: #{reputation?.ranking?.tier?.rank || 'N/A'}
                    </p>
                  </div>

                  {reputation?.badges && reputation.badges.length > 0 && (
                    <div className="mb-3">
                      <p className="text-muted mb-2 text-xs font-medium">
                        Badges
                      </p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {reputation.badges.slice(0, 4).map((badge, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800"
                          >
                            🏆 {badge.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                      {reputation.badges.length > 4 && (
                        <p className="mt-1 text-xs text-gray-500">
                          +{reputation.badges.length - 4} more
                        </p>
                      )}
                    </div>
                  )}

                  {data?.influencerTier?.nextTier && (
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
                  <div className="text-xl">
                    <LightbulbIcon className="h-6 w-6" />
                  </div>
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

            {/* Skills & Expertise */}
            {skills && skills.length > 0 && (
              <div className="card-glass p-3 md:p-4">
                <div className="mb-3 flex items-center justify-between md:mb-4">
                  <h3 className="text-heading text-lg font-semibold">
                    Skills & Expertise
                  </h3>
                  <div className="text-xl">
                    <TrendingUpIcon className="h-6 w-6" />
                  </div>
                </div>
                <div className="space-y-2">
                  {skills.slice(0, 5).map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-heading text-sm font-medium">
                            {skill.skill}
                          </span>
                          <span className="text-muted text-xs">
                            {skill.projectCount} projects
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${skill.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-3 text-right">
                        <span className="text-heading text-sm font-semibold">
                          {skill.score}%
                        </span>
                        <p className="text-muted text-xs">
                          {skill.proficiency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {skills.length > 5 && (
                  <div className="mt-3 text-center">
                    <button className="text-brand-primary text-sm hover:underline">
                      View All Skills ({skills.length})
                    </button>
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
