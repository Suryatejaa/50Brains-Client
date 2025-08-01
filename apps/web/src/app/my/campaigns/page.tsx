'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  category: string;
  createdAt: string;
  
  // Application metrics
  applicationCount: number;
  acceptedCount: number;
  rejectedCount: number;
  completedCount: number;
  
  // Campaign specifics
  maxApplications?: number;
  requirements: string[];
  deliverables?: string[];
  campaignDuration?: string;
  
  // Performance
  totalReach?: number;
  totalEngagement?: number;
  conversionRate?: number;
  roi?: number;
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalSpent: number;
  totalApplications: number;
  averageROI: number;
}

export default function MyCampaignsPage() {
  const { user, isAuthenticated } = useAuth();
  const { currentRole } = useRoleSwitch();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'COMPLETED' | 'PAUSED'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'budget' | 'applications'>('newest');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (currentRole !== 'BRAND') {
      router.push('/dashboard');
      return;
    }

    loadCampaigns();
    loadStats();
  }, [isAuthenticated, currentRole, filter, sortBy]);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      params.append('sortBy', sortBy);

      const response = await apiClient.get(`/api/brand/campaigns?${params.toString()}`);
      
      if (response.success && response.data) {
        const campaigns = (response.data as any)?.campaigns || [];
        setCampaigns(campaigns as Campaign[]);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/api/brand/campaigns/stats');
      if (response.success) {
        setStats(response.data as CampaignStats);
      }
    } catch (error) {
      console.error('Failed to load campaign stats:', error);
    }
  };

  const updateCampaignStatus = async (campaignId: string, newStatus: Campaign['status']) => {
    try {
      const response = await apiClient.put(`/api/brand/campaigns/${campaignId}/status`, {
        status: newStatus
      });

      if (response.success) {
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus }
            : campaign
        ));
        loadStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/brand/campaigns/${campaignId}`);
      if (response.success) {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
        loadStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    filter === 'ALL' || campaign.status === filter
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your campaigns...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your influencer marketing campaigns
              </p>
            </div>
            <Link href="/create-gig" className="btn-primary">
              + Create New Campaign
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-8">
            <div className="card-glass p-3">
              <div className="text-sm font-medium text-gray-500">Total Campaigns</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</div>
            </div>
            <div className="card-glass p-3">
              <div className="text-sm font-medium text-gray-500">Active</div>
              <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
            </div>
            <div className="card-glass p-3">
              <div className="text-sm font-medium text-gray-500">Completed</div>
              <div className="text-2xl font-bold text-blue-600">{stats.completedCampaigns}</div>
            </div>
            <div className="card-glass p-3">
              <div className="text-sm font-medium text-gray-500">Total Spent</div>
              <div className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</div>
            </div>
            <div className="card-glass p-3">
              <div className="text-sm font-medium text-gray-500">Applications</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalApplications}</div>
            </div>
            <div className="card-glass p-3">
              <div className="text-sm font-medium text-gray-500">Avg ROI</div>
              <div className="text-2xl font-bold text-green-600">{stats.averageROI.toFixed(1)}%</div>
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="card-glass p-3 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            {/* Status Filter */}
            <div className="flex space-x-2">
              {(['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED', 'PAUSED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-none text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border border-gray-300 rounded-none px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budget">Budget (High to Low)</option>
                <option value="applications">Most Applications</option>
              </select>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        {filteredCampaigns.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'ALL' ? 'No campaigns yet' : `No ${filter.toLowerCase()} campaigns`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'ALL' 
                ? 'Create your first campaign to start working with influencers'
                : `You don't have any ${filter.toLowerCase()} campaigns at the moment`
              }
            </p>
            {filter === 'ALL' && (
              <Link href="/create-gig" className="btn-primary">
                Create Your First Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="card-glass p-3 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{campaign.title}</h3>
                      <span className={`px-2 py-1 rounded-none text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {campaign.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{campaign.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div>Budget: <span className="font-semibold text-green-600">${campaign.budget.toLocaleString()}</span></div>
                      <div>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</div>
                      <div>Created: {new Date(campaign.createdAt).toLocaleDateString()}</div>
                      {campaign.campaignDuration && <div>Duration: {campaign.campaignDuration}</div>}
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-gray-900">${campaign.budget.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Budget</div>
                  </div>
                </div>

                {/* Application Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-500">Applications</div>
                    <div className="text-lg font-semibold">
                      {campaign.applicationCount}
                      {campaign.maxApplications && `/${campaign.maxApplications}`}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm text-gray-500">Accepted</div>
                    <div className="text-lg font-semibold text-green-600">{campaign.acceptedCount}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-gray-500">Completed</div>
                    <div className="text-lg font-semibold text-blue-600">{campaign.completedCount}</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <div className="text-sm text-gray-500">Rejected</div>
                    <div className="text-lg font-semibold text-red-600">{campaign.rejectedCount}</div>
                  </div>
                </div>

                {/* Performance Metrics (if available) */}
                {(campaign.totalReach || campaign.totalEngagement || campaign.roi) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Total Reach</div>
                      <div className="text-lg font-semibold">{campaign.totalReach?.toLocaleString() || '--'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Engagement</div>
                      <div className="text-lg font-semibold">{campaign.totalEngagement?.toLocaleString() || '--'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">ROI</div>
                      <div className="text-lg font-semibold text-green-600">
                        {campaign.roi ? `${campaign.roi.toFixed(1)}%` : '--'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <Link 
                      href={`/gig/${campaign.id}` as any}
                      className="btn-ghost text-blue-600"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/campaigns/${campaign.id}/applications` as any}
                      className="btn-ghost text-blue-600"
                    >
                      Applications ({campaign.applicationCount})
                    </Link>
                    {campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED' && (
                      <Link 
                        href={`/campaigns/${campaign.id}/edit` as any}
                        className="btn-ghost text-blue-600"
                      >
                        Edit
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Actions */}
                    {campaign.status === 'DRAFT' && (
                      <button 
                        onClick={() => updateCampaignStatus(campaign.id, 'ACTIVE')}
                        className="btn-sm btn-primary"
                      >
                        Publish
                      </button>
                    )}
                    {campaign.status === 'ACTIVE' && (
                      <button 
                        onClick={() => updateCampaignStatus(campaign.id, 'PAUSED')}
                        className="btn-sm btn-secondary"
                      >
                        Pause
                      </button>
                    )}
                    {campaign.status === 'PAUSED' && (
                      <button 
                        onClick={() => updateCampaignStatus(campaign.id, 'ACTIVE')}
                        className="btn-sm btn-primary"
                      >
                        Resume
                      </button>
                    )}
                    
                    {/* Delete Button */}
                    {(campaign.status === 'DRAFT' || campaign.status === 'CANCELLED') && (
                      <button 
                        onClick={() => deleteCampaign(campaign.id)}
                        className="btn-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 card-glass p-3">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/create-gig" className="p-4 border-2 border-dashed border-gray-300 rounded-none hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">Create New Campaign</div>
              <div className="text-sm text-gray-600">Start a new influencer campaign</div>
            </Link>
            <Link href="/influencers/search" className="p-4 border-2 border-dashed border-gray-300 rounded-none hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium">Find Influencers</div>
              <div className="text-sm text-gray-600">Browse our creator marketplace</div>
            </Link>
            <Link href="/analytics" className="p-4 border-2 border-dashed border-gray-300 rounded-none hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">View Analytics</div>
              <div className="text-sm text-gray-600">Track your campaign performance</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
