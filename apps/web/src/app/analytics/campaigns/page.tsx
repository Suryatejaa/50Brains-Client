'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CampaignAnalytics {
  id: string;
  title: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  deadline?: string;
  budgetMin: number;
  budgetMax: number;
  
  // Analytics data
  analytics: {
    views: number;
    applications: number;
    acceptedApplications: number;
    completedSubmissions: number;
    totalSpent: number;
    conversionRate: number;
    averageApplicationQuality: number;
    
    // Performance metrics
    performanceScore: number;
    reach: number;
    engagement: number;
    impressions: number;
    clicks: number;
    
    // Time series data
    dailyMetrics?: Array<{
      date: string;
      views: number;
      applications: number;
      engagement: number;
    }>;
    
    // ROI data
    roi: number;
    costPerAcquisition: number;
    costPerEngagement: number;
  };
}

interface CampaignSummary {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalSpent: number;
  totalApplications: number;
  averageROI: number;
  successRate: number;
}

export default function CampaignAnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignAnalytics[]>([]);
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'date' | 'performance' | 'roi' | 'applications'>('date');

  const userType = getUserTypeForRole(currentRole);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (userType !== 'brand') {
        router.push('/analytics');
        return;
      }
      loadCampaignAnalytics();
    }
  }, [isAuthenticated, user, userType, timeRange]);

  const loadCampaignAnalytics = async () => {
    try {
      setIsLoading(true);
      
      const [campaignsResponse, summaryResponse] = await Promise.allSettled([
        apiClient.get(`/api/analytics/campaigns?timeframe=${timeRange}&sort=${sortBy}`),
        apiClient.get(`/api/analytics/campaigns/summary?timeframe=${timeRange}`)
      ]);

      if (campaignsResponse.status === 'fulfilled' && campaignsResponse.value.success) {
        setCampaigns((campaignsResponse.value.data as any)?.campaigns || []);
      }

      if (summaryResponse.status === 'fulfilled' && summaryResponse.value.success) {
        setSummary(summaryResponse.value.data as CampaignSummary);
      }
    } catch (error) {
      console.error('Failed to load campaign analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view campaign analytics.</p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (userType !== 'brand') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is only available for brand accounts.</p>
          <Link href="/analytics" className="btn-primary">
            Go to Analytics
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
              <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
              <p className="text-gray-600">Detailed performance insights for your campaigns</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="performance">Sort by Performance</option>
                <option value="roi">Sort by ROI</option>
                <option value="applications">Sort by Applications</option>
              </select>
              <Link href="/analytics" className="btn-secondary">
                ← Back to Analytics
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="card-glass p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading campaign analytics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Statistics */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.totalCampaigns}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-none flex items-center justify-center">
                      📢
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {summary.activeCampaigns} active campaigns
                  </p>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">${summary.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-none flex items-center justify-center">
                      💳
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Avg: ${Math.round(summary.totalSpent / (summary.totalCampaigns || 1)).toLocaleString()} per campaign
                  </p>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.totalApplications}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-none flex items-center justify-center">
                      📝
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Avg: {Math.round(summary.totalApplications / (summary.totalCampaigns || 1))} per campaign
                  </p>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average ROI</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.averageROI.toFixed(1)}%</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-none flex items-center justify-center">
                      📈
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Success rate: {summary.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {/* Campaign List */}
            <div className="card-glass p-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">📊 Campaign Performance</h2>
                <Link href="/create-gig" className="btn-primary">
                  ➕ Create New Campaign
                </Link>
              </div>

              {campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className={`border border-gray-200 rounded-none p-3 hover:border-blue-300 transition-colors cursor-pointer ${
                        selectedCampaign === campaign.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedCampaign(selectedCampaign === campaign.id ? null : campaign.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                            <span className={`px-2 py-1 rounded-none text-sm font-medium ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Performance Score</p>
                              <p className={`text-lg font-semibold ${getPerformanceColor(campaign.analytics.performanceScore)}`}>
                                {campaign.analytics.performanceScore}/100
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Applications</p>
                              <p className="text-lg font-semibold text-gray-900">{campaign.analytics.applications}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Conversion Rate</p>
                              <p className="text-lg font-semibold text-blue-600">{campaign.analytics.conversionRate.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">ROI</p>
                              <p className={`text-lg font-semibold ${campaign.analytics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {campaign.analytics.roi.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Spent</p>
                              <p className="text-lg font-semibold text-gray-900">${campaign.analytics.totalSpent.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Reach</p>
                              <p className="text-lg font-semibold text-purple-600">{campaign.analytics.reach.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <p className="text-sm text-gray-600">Created</p>
                          <p className="text-sm font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                          {campaign.deadline && (
                            <>
                              <p className="text-sm text-gray-600 mt-1">Deadline</p>
                              <p className="text-sm font-medium">{new Date(campaign.deadline).toLocaleDateString()}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedCampaign === campaign.id && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Detailed Metrics */}
                            <div>
                              <h4 className="text-lg font-semibold mb-4">📈 Detailed Metrics</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Views</span>
                                  <span className="font-semibold">{campaign.analytics.views.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Impressions</span>
                                  <span className="font-semibold">{campaign.analytics.impressions.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Clicks</span>
                                  <span className="font-semibold">{campaign.analytics.clicks.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Engagement Rate</span>
                                  <span className="font-semibold text-blue-600">{campaign.analytics.engagement.toFixed(2)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Accepted Applications</span>
                                  <span className="font-semibold text-green-600">{campaign.analytics.acceptedApplications}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Completed Submissions</span>
                                  <span className="font-semibold text-purple-600">{campaign.analytics.completedSubmissions}</span>
                                </div>
                              </div>
                            </div>

                            {/* Cost Analysis */}
                            <div>
                              <h4 className="text-lg font-semibold mb-4">💰 Cost Analysis</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Budget Range</span>
                                  <span className="font-semibold">${campaign.budgetMin.toLocaleString()} - ${campaign.budgetMax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Cost per Acquisition</span>
                                  <span className="font-semibold">${campaign.analytics.costPerAcquisition.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Cost per Engagement</span>
                                  <span className="font-semibold">${campaign.analytics.costPerEngagement.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Application Quality</span>
                                  <span className="font-semibold text-blue-600">{campaign.analytics.averageApplicationQuality.toFixed(1)}/10</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Budget Utilization</span>
                                  <span className="font-semibold">
                                    {((campaign.analytics.totalSpent / campaign.budgetMax) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-6 flex space-x-3">
                            <Link
                              href={`/gig/${campaign.id}`}
                              className="btn-secondary"
                            >
                              👁️ View Campaign
                            </Link>
                            <Link
                              href={`/my-gigs?campaign=${campaign.id}`}
                              className="btn-secondary"
                            >
                              📝 Manage Applications
                            </Link>
                            {campaign.status === 'ACTIVE' && (
                              <a
                                href={`/gig/${campaign.id}/edit`}
                                className="btn-secondary"
                              >
                                ✏️ Edit Campaign
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">No Campaign Analytics Available</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first campaign to see detailed analytics and performance metrics.
                  </p>
                  <Link href="/create-gig" className="btn-primary">
                    ➕ Create Your First Campaign
                  </Link>
                </div>
              )}
            </div>

            {/* Performance Insights */}
            {campaigns.length > 0 && (
              <div className="card-glass p-3">
                <h2 className="text-xl font-semibold mb-4">💡 Performance Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-none p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">🎯 Top Performing Campaign</h3>
                    <p className="text-sm text-blue-800">
                      {campaigns.length > 0 && 
                        campaigns.reduce((prev, current) => 
                          prev.analytics.performanceScore > current.analytics.performanceScore ? prev : current
                        ).title
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-none p-4">
                    <h3 className="font-semibold text-green-900 mb-2">💰 Best ROI Campaign</h3>
                    <p className="text-sm text-green-800">
                      {campaigns.length > 0 && 
                        campaigns.reduce((prev, current) => 
                          prev.analytics.roi > current.analytics.roi ? prev : current
                        ).title
                      }
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-none p-4">
                    <h3 className="font-semibold text-purple-900 mb-2">📝 Most Applications</h3>
                    <p className="text-sm text-purple-800">
                      {campaigns.length > 0 && 
                        campaigns.reduce((prev, current) => 
                          prev.analytics.applications > current.analytics.applications ? prev : current
                        ).title
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
