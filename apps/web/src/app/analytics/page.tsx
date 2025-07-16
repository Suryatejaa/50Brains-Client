'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface AnalyticsData {
  // Common analytics
  profileViews: number;
  profileViewsChange: number;
  
  // Creator analytics
  totalApplications?: number;
  acceptedApplications?: number;
  completedCampaigns?: number;
  totalEarnings?: number;
  averageRating?: number;
  
  // Brand analytics  
  totalCampaigns?: number;
  activeCampaigns?: number;
  totalSpent?: number;
  averageCampaignCost?: number;
  successfulCampaigns?: number;
  
  // Social media analytics
  totalFollowers?: number;
  totalPosts?: number;
  averageEngagement?: number;
  influencerTier?: string;
  
  // Time series data
  weeklyData?: Array<{
    date: string;
    views: number;
    applications?: number;
    campaigns?: number;
  }>;
}

export default function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const userType = getUserTypeForRole(currentRole);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAnalytics();
    }
  }, [isAuthenticated, user, timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Load different analytics based on user type
      const endpoints = userType === 'creator' ? [
        apiClient.get(`/api/analytics/dashboard?timeframe=${timeRange}`),
        apiClient.get(`/api/social-media/analytics/${user?.id}`),
        apiClient.get(`/api/my/applications/stats`)
      ] : [
        apiClient.get(`/api/analytics/dashboard?timeframe=${timeRange}`),
        apiClient.get('/api/my-gigs/stats'),
        apiClient.get('/api/analytics/spending')
      ];

      const results = await Promise.allSettled(endpoints);
      
      let combinedData: AnalyticsData = {
        profileViews: 0,
        profileViewsChange: 0
      };

      // Process dashboard analytics
      if (results[0].status === 'fulfilled' && results[0].value.success) {
        const dashboardData = results[0].value.data as any;
        combinedData = { ...combinedData, ...dashboardData };
      }

      // Process role-specific analytics
      if (userType === 'creator') {
        // Social media analytics
        if (results[1].status === 'fulfilled' && results[1].value.success) {
          const socialData = results[1].value.data as any;
          combinedData.totalFollowers = socialData?.totalFollowers;
          combinedData.totalPosts = socialData?.totalPosts;
          combinedData.averageEngagement = socialData?.averageEngagement;
          combinedData.influencerTier = socialData?.influencerTier;
        }
        
        // Application stats
        if (results[2].status === 'fulfilled' && results[2].value.success) {
          const appData = results[2].value.data as any;
          combinedData.totalApplications = appData?.total;
          combinedData.acceptedApplications = appData?.accepted;
          combinedData.completedCampaigns = appData?.completed;
          combinedData.totalEarnings = appData?.totalEarnings;
          combinedData.averageRating = appData?.averageRating;
        }
      } else if (userType === 'brand') {
        // Campaign stats
        if (results[1].status === 'fulfilled' && results[1].value.success) {
          const campaignData = results[1].value.data as any;
          combinedData.totalCampaigns = campaignData?.total;
          combinedData.activeCampaigns = campaignData?.active;
          combinedData.successfulCampaigns = campaignData?.successful;
        }
        
        // Spending analytics
        if (results[2].status === 'fulfilled' && results[2].value.success) {
          const spendingData = results[2].value.data as any;
          combinedData.totalSpent = spendingData?.totalSpent;
          combinedData.averageCampaignCost = spendingData?.averageCost;
        }
      }

      setAnalytics(combinedData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view analytics.</p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">
                {userType === 'creator' ? 'Track your creator performance and earnings' : 'Monitor your campaign performance and ROI'}
              </p>
            </div>
            <div className="space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <Link href="/dashboard" className="btn-secondary">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="card-glass p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading your analytics...</p>
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-glass p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Views</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.profileViews?.toLocaleString() || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    👁️
                  </div>
                </div>
                <p className={`text-sm mt-2 ${analytics.profileViewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.profileViewsChange >= 0 ? '↗️' : '↘️'} {Math.abs(analytics.profileViewsChange || 0)}% vs last period
                </p>
              </div>

              {userType === 'creator' ? (
                <>
                  <div className="card-glass p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.totalApplications || 0}</p>
                      </div>
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        📝
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {analytics.acceptedApplications || 0} accepted
                    </p>
                  </div>

                  <div className="card-glass p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Followers</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.totalFollowers?.toLocaleString() || 0}</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        👥
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {analytics.influencerTier || 'Emerging Creator'}
                    </p>
                  </div>

                  <div className="card-glass p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                        <p className="text-2xl font-bold text-gray-900">${analytics.totalEarnings?.toLocaleString() || 0}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        💰
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {analytics.completedCampaigns || 0} campaigns completed
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="card-glass p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.totalCampaigns || 0}</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        📢
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {analytics.activeCampaigns || 0} currently active
                    </p>
                  </div>

                  <div className="card-glass p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">${analytics.totalSpent?.toLocaleString() || 0}</p>
                      </div>
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        💳
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Avg: ${analytics.averageCampaignCost?.toLocaleString() || 0} per campaign
                    </p>
                  </div>

                  <div className="card-glass p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.totalCampaigns ? Math.round(((analytics.successfulCampaigns || 0) / analytics.totalCampaigns) * 100) : 0}%
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        🎯
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {analytics.successfulCampaigns || 0} successful campaigns
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Creator Specific Analytics */}
            {userType === 'creator' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Social Media Performance */}
                <div className="card-glass p-6">
                  <h3 className="text-lg font-semibold mb-4">📱 Social Media Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Posts</span>
                      <span className="font-semibold">{analytics.totalPosts || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Engagement</span>
                      <span className="font-semibold">{analytics.averageEngagement?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Influencer Tier</span>
                      <span className="font-semibold text-purple-600">{analytics.influencerTier || 'Emerging'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Rating</span>
                      <span className="font-semibold">
                        {analytics.averageRating ? `${analytics.averageRating.toFixed(1)}/5.0 ⭐` : 'No ratings yet'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Application Success */}
                <div className="card-glass p-6">
                  <h3 className="text-lg font-semibold mb-4">📈 Application Success</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Acceptance Rate</span>
                      <span className="font-semibold text-green-600">
                        {analytics.totalApplications ? 
                          Math.round(((analytics.acceptedApplications || 0) / analytics.totalApplications) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-blue-600">
                        {analytics.acceptedApplications ? 
                          Math.round(((analytics.completedCampaigns || 0) / analytics.acceptedApplications) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg Earnings per Campaign</span>
                      <span className="font-semibold text-green-600">
                        ${analytics.completedCampaigns ? 
                          Math.round((analytics.totalEarnings || 0) / analytics.completedCampaigns).toLocaleString() : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Brand Specific Analytics */}
            {userType === 'brand' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Campaign Performance */}
                <div className="card-glass p-6">
                  <h3 className="text-lg font-semibold mb-4">📊 Campaign Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-semibold text-green-600">
                        {analytics.totalCampaigns ? 
                          Math.round(((analytics.successfulCampaigns || 0) / analytics.totalCampaigns) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Campaigns</span>
                      <span className="font-semibold text-blue-600">{analytics.activeCampaigns || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Cost</span>
                      <span className="font-semibold">${analytics.averageCampaignCost?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                {/* ROI Analysis */}
                <div className="card-glass p-6">
                  <h3 className="text-lg font-semibold mb-4">💹 ROI Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Investment</span>
                      <span className="font-semibold">${analytics.totalSpent?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cost per Success</span>
                      <span className="font-semibold">
                        ${analytics.successfulCampaigns ? 
                          Math.round((analytics.totalSpent || 0) / analytics.successfulCampaigns).toLocaleString() : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Campaign Efficiency</span>
                      <span className="font-semibold text-purple-600">
                        {analytics.totalCampaigns ? 
                          ((analytics.successfulCampaigns || 0) / analytics.totalCampaigns * 100).toFixed(1) : 0}% success rate
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userType === 'creator' ? (
                  <>
                    <Link href="/marketplace" className="btn-secondary text-center">
                      🔍 Browse New Gigs
                    </Link>
                    <Link href="/social-media" className="btn-secondary text-center">
                      📱 Update Social Media
                    </Link>
                    <Link href="/portfolio" className="btn-secondary text-center">
                      📁 Manage Portfolio
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/create-gig" className="btn-secondary text-center">
                      ➕ Create New Campaign
                    </Link>
                    <Link href={"/my-gigs" as any} className="btn-secondary text-center">
                      📢 Manage Gigs
                    </Link>
                    <Link href={"/influencers/search" as any} className="btn-secondary text-center">
                      🔍 Find Influencers
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card-glass p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No Analytics Data Available</h3>
            <p className="text-gray-600 mb-6">
              {userType === 'creator' 
                ? 'Start applying to gigs to see your analytics!' 
                : 'Create your first campaign to see analytics data!'}
            </p>
            <Link 
              href={userType === 'creator' ? '/marketplace' : '/create-gig'} 
              className="btn-primary"
            >
              {userType === 'creator' ? 'Browse Gigs' : 'Create Campaign'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
