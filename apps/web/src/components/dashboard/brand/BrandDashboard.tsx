'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  brandApiClient,
  BrandProfile,
  BrandGig,
  BrandWallet,
} from '@/lib/brand-api-client';
import { DashboardHeader } from '../shared/DashboardHeader';
import { MetricCard } from '../shared/MetricCard';
import { QuickActionsGrid } from '../shared/QuickActions';
import { ProfileCompletionWidget } from '@/components/ProfileCompletionWidget';

interface BrandDashboardData {
  profile: BrandProfile | null;
  gigsStats: {
    totalGigs: number;
    activeGigs: number;
    completedGigs: number;
    totalBudget: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  wallet: BrandWallet | null;
  recentGigs: BrandGig[];
}

export const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<BrandDashboardData>({
    profile: null,
    gigsStats: {
      totalGigs: 0,
      activeGigs: 0,
      completedGigs: 0,
      totalBudget: 0,
    },
    applications: { total: 0, pending: 0, approved: 0, rejected: 0 },
    wallet: null,
    recentGigs: [],
  });
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
      const [profileResponse, gigsResponse, walletResponse] =
        await Promise.allSettled([
          brandApiClient.getProfile(),
          brandApiClient.getMyGigs(),
          brandApiClient.getWallet(),
        ]);

      console.log('Gigs Response:', gigsResponse);
      // Calculate application stats from recent gigs
      let applicationsStats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
      // console.log('Gigs Response:', gigsResponse);
      if (
        gigsResponse.status === 'fulfilled' &&
        gigsResponse.value.success && 
        gigsResponse.value.data?.gigs
      ) {
        // Sum up applications from all gigs
        const gigs = gigsResponse.value.data.gigs;
        // console.log('Gigs array:', gigs);
        console.log('First gig structure:', gigs[0]);

        applicationsStats.total = gigs.reduce((sum, gig) => {

          const appCount =
            gig._count?.applications ||
            gig.stats?.applicationsCount ||
            gig.applicationsCount ||
            0;
          // console.log(`Gig ${gig.id} applications:`, appCount);
          return sum + appCount;
        }, 0);
       
        
        applicationsStats.approved = gigs.reduce((sum, gig) => {
          const acceptedCount = gig.acceptedCount || 0;
          return sum + acceptedCount;
        }, 0);
        applicationsStats.pending =
          applicationsStats.total - applicationsStats.approved;
      }

      const data: BrandDashboardData = {
        profile:
          profileResponse.status === 'fulfilled' &&
          profileResponse.value.success
            ? (profileResponse.value.data as any)?.user || null
            : null,

        gigsStats:
          gigsResponse.status === 'fulfilled' &&
          gigsResponse.value.success &&
          gigsResponse.value.data?.gigs
            ? gigsResponse.value.data.gigs.reduce(
                (acc, gig) => {
                  acc.totalGigs += 1;
                  if (gig.status === 'OPEN' || gig.status === 'ASSIGNED') acc.activeGigs += 1;
                  if (gig.status === 'COMPLETED') acc.completedGigs += 1;
                  acc.totalBudget += gig.budgetMax;
                  return acc;
                },
                {
                  totalGigs: 0,
                  activeGigs: 0,
                  completedGigs:0,
                  totalBudget: 0,
                }
              )
            : {
                totalGigs: 0,
                activeGigs: 0,
                completedGigs: 0,
                totalBudget: 0,
              },

        wallet:
          walletResponse.status === 'fulfilled' && walletResponse.value.success
            ? walletResponse.value.data || null
            : null,

        applications: applicationsStats,

        recentGigs:
          gigsResponse.status === 'fulfilled' &&
          gigsResponse.value.success &&
          gigsResponse.value.data?.gigs
            ? gigsResponse.value.data.gigs
                .sort((a, b) => {
                  // Use updatedAt if available, fallback to createdAt
                  const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                  const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                  return dateB - dateA; // Most recent first
                })
                .slice(0, 2) // Only show latest 3 gigs
            : [],
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
      href: '/my-gigs',
      icon: '📢',
      label: 'My Gigs',
      description: 'Manage gigs',
    },
    {
      href: '/influencers/search',
      icon: '🔍',
      label: 'Find Influencers',
      description: 'Discover creators',
      permission: 'influencer.search',
    },
    {
      href: '/applications',
      icon: '📨',
      label: 'Applications',
      description: 'Review applications',
      permission: 'applications.manage',
    },
    {
      href: '/analytics',
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
      <div className="min-h-screen bg-gray-50 px-3 py-2 md:p-3">
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
    <div className="min-h-screen bg-gray-50 px-0 py-0 md:p-1">
      <div className="mx-auto border-1px border-gray-800 max-w-7xl">
        <DashboardHeader
          title={`Welcome back, ${dashboardData.profile?.companyName || 'Brand'}`}
          subtitle="Manage your campaigns and connect with top creators"
        />

        {/* Key Metrics */}
        <div className="mb-1 grid grid-cols-2 gap-1 md:mb-1 md:grid-cols-2 md:gap-1 lg:grid-cols-4">
          <MetricCard
            title="Active Gigs"
            value={dashboardData.gigsStats.activeGigs}
            icon="🎯"
            loading={loading}
            onClick={() => (window.location.href = '/my-gigs?status=ACTIVE')}
          />
          <MetricCard
            title="Pending Applications"
            value={dashboardData.applications.pending}
            icon="📨"
            loading={loading}
            urgent={dashboardData.applications.pending > 10}
            onClick={() =>
              (window.location.href = '/applications?status=pending')
            }
          />
          <MetricCard
            title="Profile Views"
            value={dashboardData.profile?.profileViews || 0}
            icon="�️"
            loading={loading}
            onClick={() => (window.location.href = '/profile')}
          />
          <MetricCard
            title="Credits Balance"
            value={`₹${dashboardData.wallet?.balance || 0}`}
            icon="💰"
            loading={loading}
            onClick={() => (window.location.href = '/credits')}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-0 md:mb-0 mb-0 md:gap-1 lg:grid-cols-3">
          {/* Profile Completion Widget */}
          <div className="lg:col-span-1 sm:mb-1 md:mb-1 mb-1">
            <div className="card-glass p-3 ">
              <h3 className="text-heading text-lg font-semibold">
                🏢 Company Overview
              </h3>

              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-3/4 rounded bg-gray-300"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-300"></div>
                  <div className="h-3 w-2/3 rounded bg-gray-300"></div>
                </div>
              ) : dashboardData.profile ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-heading font-semibold">
                      {dashboardData.profile.companyName || `${dashboardData.profile.firstName} ${dashboardData.profile.lastName}`}
                    </div>
                    <div className="text-muted text-sm">
                      {dashboardData.profile.industry || 'Industry not specified'}
                    </div>
                  </div>

                  {dashboardData.profile.bio && (
                    <p className="text-body text-sm">
                      {dashboardData.profile.bio}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <span>📍</span>
                      <span>{dashboardData.profile.location || 'Location not specified'}</span>
                    </span>
                    {dashboardData.profile.website && (
                      <span className="flex items-center space-x-1">
                        <span>🌐</span>
                        <a 
                          href={dashboardData.profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`flex items-center space-x-1 ${
                      dashboardData.profile.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <span>{dashboardData.profile.status === 'ACTIVE' ? '✓' : '⚠'}</span>
                      <span>{dashboardData.profile.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                    </span>
                    {dashboardData.profile.emailVerified && (
                      <span className="flex items-center space-x-1 text-blue-600">
                        <span>✓</span>
                        <span>Email Verified</span>
                      </span>
                    )}
                  </div>

                  {dashboardData.profile.analytics && (
                    <div className="mt-4 rounded-none bg-gray-50 p-3">
                      <div className="text-sm font-medium text-gray-700">
                        Profile Completion
                      </div>
                      <div className="mt-1 flex items-center">
                        <div className="h-2 flex-1 rounded-none bg-gray-200">
                          <div
                            className="h-2 rounded-none bg-blue-500"
                            style={{
                              width: `${dashboardData.profile.analytics.completionPercentage}%`,
                            }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {dashboardData.profile.analytics.completionPercentage}
                          %
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted text-center">
                  <p>Profile information not available</p>
                  <button
                    onClick={() => (window.location.href = '/profile/edit')}
                    className="btn-primary mt-2"
                  >
                    Complete Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Gigs */}
          <div className="lg:col-span-2">
            <div className="sm:mb-1 md:mb-1 mb-1 card-glass p-2">
              <div className="flex items-center justify-between">
                <h3 className="text-heading text-lg font-semibold">
                  📝 Recent Gigs
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Latest 2</span>
                  <button
                    onClick={() => (window.location.href = '/create-gig')}
                    className="btn-primary text-sm"
                  >
                    Create New
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b border-gray-200 pb-2">
                      <div className="mb-2 h-4 w-3/4 rounded-full bg-gray-300"></div>
                      <div className="h-3 w-1/2 rounded-full bg-gray-300"></div>
                    </div>
                  ))}
                </div>
              ) : dashboardData.recentGigs.length > 0 ? (
                <div className="space-y-2">
                  {dashboardData.recentGigs.map((gig) => (
                    <div
                      key={gig.id}
                      className="cursor-pointer rounded-none border-b border-gray-200 p-2 pb-2 last:border-b-0 hover:bg-gray-50"
                      onClick={() => (window.location.href = `/gig/${gig.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-heading font-medium">
                            {gig.title}
                          </h4>
                          <p className="text-muted mt-1 text-sm">
                            {gig.description.substring(0, 100)}
                            {gig.description.length > 100 ? '...' : ''}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              Min-Budget: ₹{gig.budgetMin.toLocaleString()}
                            </span>
                            <span>
                              Max-Budget: ₹{gig.budgetMax.toLocaleString()}
                            </span>
                            <span>Applications: {gig.applicationsCount}</span>
                            <span>Views: {gig.viewsCount}</span>
                            <span>
                              Updated: {new Date(gig.updatedAt || gig.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        <span
                          className={`rounded-none px-1 py-1 text-xs font-medium ${
                            gig.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : gig.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {gig.status}
                          </span>
                        </div>                          
                      </div>
                    </div>
                  ))}

                  <div className="text-right">
                    <p
                      onClick={() => (window.location.href = '/my-gigs')}
                      className="text-sm cursor-pointer text-blue-600 hover:underline"
                    >
                      View All Gigs
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <span className="mb-2 block text-4xl">📝</span>
                  <p className="text-muted mb-4">No gigs posted yet</p>
                  <button
                    onClick={() => (window.location.href = '/create-gig')}
                    className="btn-primary"
                  >
                    Create Your First Gig
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <QuickActionsGrid actions={quickActions} title="Brand Tools" />

        {/* Performance and Applications Grid */}
        <div className="mb-1 mt-1 grid grid-cols-1 gap-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card-glass p-3">
              <h3 className="text-heading mb-6 text-lg font-semibold">
                📊 Gig Performance
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
                      {dashboardData.gigsStats.completedGigs}
                    </div>
                    <div className="text-muted text-sm">Completed Gigs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      ₹{dashboardData.gigsStats.totalBudget.toLocaleString()}
                    </div>
                    <div className="text-muted text-sm">Total Budget</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      {dashboardData.applications.total}
                    </div>
                    <div className="text-muted text-sm">Total Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading text-2xl font-bold">
                      {dashboardData.applications.approved}
                    </div>
                    <div className="text-muted text-sm">Approved</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="card-glass p-3">
            <h3 className="text-heading mb-2 text-lg font-semibold">
              📨 Recent Applications
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                    <div className="flex-1">
                      <div className="mb-1 h-3 w-3/4 rounded-full bg-gray-300"></div>
                      <div className="h-2 w-1/2 rounded-full bg-gray-300"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {dashboardData.applications.total > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-heading text-lg font-bold">
                          {dashboardData.applications.pending}
                        </div>
                        <div className="text-muted text-xs">Pending</div>
                      </div>
                      <div>
                        <div className="text-heading text-lg font-bold">
                          {dashboardData.applications.approved}
                        </div>
                        <div className="text-muted text-xs">Approved</div>
                      </div>
                      <div>
                        <div className="text-heading text-lg font-bold">
                          {dashboardData.applications.rejected}
                        </div>
                        <div className="text-muted text-xs">Rejected</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-center">
                        <div className="text-heading mb-2 text-2xl">
                          {dashboardData.applications.total}
                        </div>
                        <div className="text-muted mb-2 text-sm">
                          Total Applications Received
                        </div>
                        <button
                          onClick={() =>
                            (window.location.href = '/applications')
                          }
                          className="btn-primary w-full font-medium"
                        >
                          Review Applications
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-center">
                    <span className="mb-2 block text-4xl">📨</span>
                    <p className="text-muted mb-4">
                      No applications received yet
                    </p>
                    <button
                      onClick={() => (window.location.href = '/create-gig')}
                      className="btn-primary"
                    >
                      Create Your First Gig
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Analytics & Budget */}
        <div className="mb-1 grid grid-cols-1 gap-1 lg:grid-cols-2">
          <div className="card-glass p-2">
            <h3 className="text-heading mb-3 text-lg font-semibold">
              📈 Gig Analytics
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-body">Total Gigs Posted</span>
                  <span className="text-heading font-semibold">
                    {dashboardData.gigsStats.totalGigs}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-body">Active Gigs</span>
                  <span className="text-heading font-semibold">
                    {dashboardData.gigsStats.activeGigs}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-body">Completed Gigs</span>
                  <span className="text-heading font-semibold">
                    {dashboardData.gigsStats.completedGigs}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-body">Company Status</span>
                  <span className="text-heading font-semibold">
                    {dashboardData.profile?.status === 'ACTIVE'
                      ? 'Active ✓'
                      : 'Inactive'}
                  </span>
                </div>

                <div className="border-t pt-2">
                  <button
                    onClick={() => (window.location.href = '/analytics')}
                    className="text-accent w-full text-sm hover:underline"
                  >
                    View Detailed Analytics
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card-glass p-2">
            <h3 className="text-heading mb-3 text-lg font-semibold">
              💰 Wallet Management
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-body">Available Credits</span>
                <span className="text-heading font-semibold text-green-600">
                  ₹{dashboardData.wallet?.balance || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body">Total Purchased</span>
                <span className="text-heading font-semibold text-blue-600">
                  ₹{dashboardData.wallet?.totalPurchased || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body">Total Spent</span>
                <span className="text-heading font-semibold">
                  ₹{dashboardData.wallet?.totalSpent || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body">Currency</span>
                <span className="text-heading text-sm font-medium">
                  {dashboardData.wallet?.currency || 'INR'}
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

        {/* Performance Overview */}
        <div className="mb-0">
          <div className="card-glass p-3">
            <h3 className="text-heading mb-3 text-lg font-semibold">
              📈 Performance Overview
            </h3>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="text-center">
                <div className="text-heading text-2xl font-bold">
                  {dashboardData.gigsStats.completedGigs}
                </div>
                <div className="text-muted text-sm">Completed Gigs</div>
              </div>
              <div className="text-center">
                <div className="text-heading text-2xl font-bold">
                  ₹{dashboardData.gigsStats.totalBudget.toLocaleString()}
                </div>
                <div className="text-muted text-sm">Total Investment</div>
              </div>
              <div className="text-center">
                <div className="text-heading text-2xl font-bold">
                  {dashboardData.wallet?.totalSpent.toLocaleString() || 0}
                </div>
                <div className="text-muted text-sm">Credits Spent</div>
              </div>
              <div className="text-center">
                <div className="text-heading text-2xl font-bold">
                  {dashboardData.profile?.profileViews || 0}
                </div>
                <div className="text-muted text-sm">Profile Views</div>
              </div>
            </div>
          </div>
        </div>        
      </div>
    </div>
  );
};
