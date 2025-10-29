// components/dashboard/brand/BrandDashboardClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  RocketIcon,
  MailIcon,
  EyeIcon,
  DollarSignIcon,
  PlusIcon,
  MegaphoneIcon,
  SearchIcon,
  BarChartIcon,
  Building2Icon,
} from 'lucide-react';
import {
  brandApiClient,
  BrandGig,
  BrandProfile,
  BrandWallet,
} from '@/lib/brand-api-client';

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

// CLIENT-SIDE PROGRESSIVE ENHANCEMENT
export function BrandDashboardClient() {
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
    if (user) {
      loadBrandDashboardData();
    }
  }, [user]);

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

      // Calculate application stats from recent gigs
      let applicationsStats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      if (
        gigsResponse.status === 'fulfilled' &&
        gigsResponse.value.success &&
        gigsResponse.value.data?.gigs
      ) {
        const gigs = gigsResponse.value.data.gigs;

        applicationsStats.total = gigs.reduce((sum, gig) => {
          const appCount =
            gig._count?.applications ||
            gig.stats?.applicationsCount ||
            gig.applicationsCount ||
            0;
          return sum + appCount;
        }, 0);

        applicationsStats.approved = gigs.reduce((sum, gig) => {
          const acceptedCount =
            gig.applications?.filter(
              (app) => app.status === 'APPROVED' || app.status === 'CLOSED'
            ).length || 0;
          return sum + acceptedCount;
        }, 0);

        applicationsStats.pending =
          (gigsResponse.value.data as any).summary
            ?.totalPendingApplicationsAcrossAllGigs || 0;
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
          (gigsResponse.value.data as any).summary
            ? {
                totalGigs:
                  (gigsResponse.value.data as any).summary.totalGigs || 0,
                activeGigs:
                  (gigsResponse.value.data as any).summary.totalActiveGigs || 0,
                completedGigs:
                  (gigsResponse.value.data as any).summary.totalCompletedGigs ||
                  0,
                totalBudget:
                  (gigsResponse.value.data as any).summary.totalBudget || 0,
              }
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
                  const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                  const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                  return dateB - dateA;
                })
                .slice(0, 3)
            : [],
      };
      console.log('Loaded Brand Dashboard Data:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load brand dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
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
    );
  }

  return (
    <>
      {/* Enhanced Metrics with Real Data */}
      <div className="mb-1 grid grid-cols-1 gap-1 md:mb-1 md:grid-cols-2 md:gap-1 lg:grid-cols-2">
        <div
          className="card-glass cursor-pointer p-3 transition-shadow hover:shadow-lg md:p-4"
          onClick={() => (window.location.href = '/my-gigs?status=ACTIVE')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-xs md:text-sm">Active Gigs</p>
              <p className="text-heading text-lg font-semibold md:text-xl">
                {dashboardData.gigsStats.activeGigs}
              </p>
              <p className="text-muted text-xs">
                {dashboardData.gigsStats.totalGigs} total campaigns
              </p>
            </div>
            <div className="text-2xl md:text-3xl">
              <RocketIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div
          className="card-glass cursor-pointer p-3 transition-shadow hover:shadow-lg md:p-4"
          onClick={() =>
            (window.location.href = '/applications?status=pending')
          }
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-xs md:text-sm">
                Pending Applications
              </p>
              <p className="text-heading text-lg font-semibold md:text-xl">
                {dashboardData.applications.pending}
              </p>
              <p className="text-muted text-xs">
                {dashboardData.applications.total} total applications
              </p>
            </div>
            <div className="text-2xl md:text-3xl">
              <MailIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="mb-0 grid grid-cols-1 gap-0 md:mb-0 md:gap-1 lg:grid-cols-3">
        {/* Profile Section */}
        <div className="mb-1 sm:mb-1 md:mb-1 lg:col-span-1">
          <div className="card-glass p-3">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-3/4 rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200"></div>
              </div>
            ) : dashboardData.profile ? (
              <div>
                <h3 className="text-heading mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Building2Icon className="h-5 w-5" />
                  Brand Profile
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {dashboardData.profile.companyName ||
                        `${dashboardData.profile.firstName || ''} ${dashboardData.profile.lastName || ''}`.trim() ||
                        'Brand Name'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {dashboardData.profile.industry ||
                        'Industry not specified'}
                    </p>
                  </div>

                  {dashboardData.profile.bio && (
                    <div>
                      <p className="line-clamp-3 text-xs text-gray-700">
                        {dashboardData.profile.bio}
                      </p>
                    </div>
                  )}

                  {dashboardData.profile.location && (
                    <div>
                      <p className="text-xs text-gray-600">
                        📍 {dashboardData.profile.location}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-2">
                    <a
                      href="/profile/edit"
                      className="btn-secondary w-full text-center"
                    >
                      Edit Profile
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="mb-3 text-3xl">🏢</div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  Complete Your Profile
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  Add your company information to attract better creators
                </p>
                <a href="/profile/setup?role=brand" className="btn-primary">
                  Setup Brand Profile
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Recent Gigs */}
        <div className="lg:col-span-2">
          <div className="card-glass mb-1 p-2 sm:mb-1 md:mb-1">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-heading flex items-center gap-2 text-lg font-semibold">
                <MegaphoneIcon className="h-5 w-5" />
                Recent Campaigns
              </h3>
              <a
                href="/my-gigs"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All →
              </a>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded border p-3">
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="mb-2 h-3 w-full rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            ) : dashboardData.recentGigs.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="rounded border p-3 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="mb-1 font-medium text-gray-900">
                          {gig.title}
                        </h4>
                        <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                          {gig.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            ₹{gig.budgetMin} - ₹{gig.budgetMax}
                          </span>
                          <span
                            className={`rounded px-2 py-1 ${
                              gig.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : gig.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {gig.status}
                          </span>
                          <span>
                            {new Date(gig.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <a
                          href={`/gig/${gig.id}`}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mb-3 text-4xl">📢</div>
                <p className="mb-4 text-gray-600">No campaigns yet</p>
                <a href="/create-gig" className="btn-primary">
                  Create Your First Campaign
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="card-glass mb-4 p-3">
        <h3 className="text-heading mb-3 text-lg font-semibold">Brand Tools</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <a
            href="/create-gig"
            className="rounded border p-3 text-center transition-shadow hover:shadow-sm"
          >
            <PlusIcon className="mx-auto mb-2 h-6 w-6 text-blue-600" />
            <div className="text-sm font-medium">Create Campaign</div>
            <div className="text-xs text-gray-600">Launch new gig</div>
          </a>
          <a
            href="/my-gigs"
            className="rounded border p-3 text-center transition-shadow hover:shadow-sm"
          >
            <MegaphoneIcon className="mx-auto mb-2 h-6 w-6 text-green-600" />
            <div className="text-sm font-medium">My Gigs</div>
            <div className="text-xs text-gray-600">Manage campaigns</div>
          </a>
          <a
            href="/influencers/search"
            className="rounded border p-3 text-center transition-shadow hover:shadow-sm"
          >
            <SearchIcon className="mx-auto mb-2 h-6 w-6 text-purple-600" />
            <div className="text-sm font-medium">Find Creators</div>
            <div className="text-xs text-gray-600">Discover talent</div>
          </a>
          <a
            href="/applications"
            className="rounded border p-3 text-center transition-shadow hover:shadow-sm"
          >
            <MailIcon className="mx-auto mb-2 h-6 w-6 text-orange-600" />
            <div className="text-sm font-medium">Applications</div>
            <div className="text-xs text-gray-600">Review submissions</div>
          </a>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="card-glass p-3">
        <h3 className="text-heading mb-3 flex items-center gap-2 text-lg font-semibold">
          <BarChartIcon className="h-6 w-6" /> Performance Overview
        </h3>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded border p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.gigsStats.totalGigs}
            </div>
            <div className="text-sm text-gray-600">Total Campaigns</div>
          </div>
          <div className="rounded border p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {dashboardData.gigsStats.activeGigs}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="rounded border p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.applications.total}
            </div>
            <div className="text-sm text-gray-600">Applications</div>
          </div>
          <div className="rounded border p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">
              ₹{dashboardData.gigsStats.totalBudget}
            </div>
            <div className="text-sm text-gray-600">Total Budget</div>
          </div>
        </div>
      </div>
    </>
  );
}
