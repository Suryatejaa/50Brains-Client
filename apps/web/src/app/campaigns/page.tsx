'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RocketIcon } from 'lucide-react';
import { DollarSignIcon } from 'lucide-react';
import { SearchIcon } from 'lucide-react';
import { PlusIcon } from 'lucide-react';
import { CopyIcon } from 'lucide-react';
import { BarChartIcon } from 'lucide-react';
import { LineChartIcon } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'brand_awareness' | 'lead_generation' | 'sales' | 'engagement' | 'content_creation';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  timeline: {
    startDate: string;
    endDate: string;
    duration: number; // in days
  };
  targeting: {
    demographics: {
      ageRange: string;
      gender: string[];
      location: string[];
    };
    interests: string[];
    skills: string[];
    categories: string[];
  };
  deliverables: Array<{
    id: string;
    type: 'video' | 'image' | 'blog_post' | 'social_media' | 'website' | 'other';
    title: string;
    description: string;
    requirements: string[];
    deadline: string;
    budget: number;
    status: 'pending' | 'in_progress' | 'review' | 'completed' | 'rejected';
  }>;
  performance: {
    applications: number;
    views: number;
    engagement: number;
    conversions: number;
    roi: number;
  };
  collaborators: Array<{
    id: string;
    name: string;
    role: string;
    status: 'invited' | 'accepted' | 'working' | 'completed';
    profilePicture?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const campaignTypes = [
  { value: 'brand_awareness', label: 'Brand Awareness', icon: '📢', description: 'Increase brand visibility and recognition' },
  { value: 'lead_generation', label: 'Lead Generation', icon: '🎯', description: 'Generate qualified leads and prospects' },
  { value: 'sales', label: 'Sales', icon: '💰', description: 'Drive direct sales and conversions' },
  { value: 'engagement', label: 'Engagement', icon: '❤️', description: 'Boost audience engagement and interaction' },
  { value: 'content_creation', label: 'Content Creation', icon: '📝', description: 'Create high-quality content assets' }
];

const deliverableTypes = [
  { value: 'video', label: 'Video Content', icon: '🎥' },
  { value: 'image', label: 'Image/Graphics', icon: '🖼️' },
  { value: 'blog_post', label: 'Blog Post', icon: '📄' },
  { value: 'social_media', label: 'Social Media', icon: '📱' },
  { value: 'website', label: 'Website/Landing Page', icon: '🌐' },
  { value: 'other', label: 'Other', icon: '📦' }
];

export default function CampaignsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadCampaigns();
    }
  }, [isAuthenticated, filters, currentPage]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.search && { search: filters.search }),
        sortBy: filters.sortBy
      });
      
      const response = await apiClient.get(`/api/campaigns?${params}`);
      
      if (response.success) {
        setCampaigns((response.data as any)?.campaigns || []);
        setTotalCount((response.data as any)?.total || 0);
      } else {
        setError('Failed to load campaigns');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const pauseCampaign = async (campaignId: string) => {
    try {
      const response = await apiClient.put(`/api/campaigns/${campaignId}/pause`);
      
      if (response.success) {
        loadCampaigns();
      } else {
        alert('Failed to pause campaign');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to pause campaign');
    }
  };

  const resumeCampaign = async (campaignId: string) => {
    try {
      const response = await apiClient.put(`/api/campaigns/${campaignId}/resume`);
      
      if (response.success) {
        loadCampaigns();
      } else {
        alert('Failed to resume campaign');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to resume campaign');
    }
  };

  const duplicateCampaign = async (campaignId: string) => {
    try {
      const response = await apiClient.post(`/api/campaigns/${campaignId}/duplicate`);
      
      if (response.success) {
        loadCampaigns();
      } else {
        alert('Failed to duplicate campaign');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to duplicate campaign');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    
    return `px-2 py-1 rounded text-xs font-medium ${badges[status]}`;
  };

  const getTypeIcon = (type: Campaign['type']) => {
    const typeData = campaignTypes.find(t => t.value === type);
    return typeData?.icon || '📝';
  };

  const totalPages = Math.ceil(totalCount / 12);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget.total, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.budget.spent, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-2xl">
              <div className="card-glass p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Please Sign In
                </h3>
                <p className="text-gray-600 mb-6">
                  You need to be signed in to manage campaigns.
                </p>
                <Link href={"/auth/login" as any} className="btn-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-heading mb-2 text-3xl font-bold">
                    Campaign Management
                  </h1>
                  <p className="text-muted">
                    Create and manage your marketing campaigns
                  </p>
                </div>
                
                <div className="mt-4 lg:mt-0 flex space-x-3">
                  <Link href={"/campaigns/create" as any} className="btn-primary">
                    Create Campaign
                  </Link>
                  <Link href={"/campaigns/templates" as any} className="btn-secondary">
                    Browse Templates
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
              <div className="card-glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                  </div>
                  <div className="text-2xl">
                    <BarChartIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>
              
              <div className="card-glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                    <p className="text-2xl font-bold text-green-600">{activeCampaigns}</p>
                  </div>
                  <div className="text-2xl">
                    <RocketIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>
              
              <div className="card-glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBudget)}</p>
                  </div>
                  <div className="text-2xl">
                    <DollarSignIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>
              
              <div className="card-glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalSpent)}</p>
                  </div>
                  <div className="text-2xl">
                    <LineChartIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="card-glass p-3 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-wrap gap-4">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search campaigns..."
                      className="input w-64 pl-10"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <SearchIcon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input w-auto"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  {/* Type Filter */}
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input w-auto"
                  >
                    <option value="">All Types</option>
                    {campaignTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  
                  {/* Sort */}
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="input w-auto"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="budget-high">Highest Budget</option>
                    <option value="budget-low">Lowest Budget</option>
                    <option value="performance">Best Performance</option>
                  </select>
                </div>
                
                {/* View Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded ${view === 'grid' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    <PlusIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded ${view === 'list' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Campaigns */}
            {loading ? (
              <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-4'}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card-glass p-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No campaigns yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first campaign to start reaching your audience
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={"/campaigns/create" as any} className="btn-primary">
                    Create Your First Campaign
                  </Link>
                  <Link href={"/campaigns/templates" as any} className="btn-secondary">
                    Browse Templates
                  </Link>
                </div>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="card-glass p-3 hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {campaign.title}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {campaign.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      
                      <span className={getStatusBadge(campaign.status)}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {campaign.description}
                    </p>
                    
                    {/* Budget & Timeline */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.total)}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-none h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-none transition-all" 
                          style={{ width: `${Math.min(100, (campaign.budget.spent / campaign.budget.total) * 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Timeline:</span>
                        <span className="text-gray-900">
                          {formatDate(campaign.timeline.startDate)} - {formatDate(campaign.timeline.endDate)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Performance */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-none text-sm">
                      <div className="text-center">
                        <p className="font-bold text-gray-900">{campaign.performance.applications}</p>
                        <p className="text-xs text-gray-600">Applications</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900">{campaign.performance.views.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Views</p>
                      </div>
                    </div>
                    
                    {/* Collaborators */}
                    {campaign.collaborators.length > 0 && (
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex -space-x-2">
                          {campaign.collaborators.slice(0, 3).map((collaborator) => (
                            <div key={collaborator.id} className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                              {collaborator.profilePicture ? (
                                <img 
                                  src={collaborator.profilePicture} 
                                  alt="Collaborator" 
                                  className="w-8 h-8 rounded-none object-cover"
                                />
                              ) : (
                                collaborator.name[0]?.toUpperCase()
                              )}
                            </div>
                          ))}
                          {campaign.collaborators.length > 3 && (
                            <div className="w-8 h-8 bg-gray-400 rounded-none flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                              +{campaign.collaborators.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {campaign.collaborators.length} collaborator{campaign.collaborators.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/campaigns/${campaign.id}` as any}
                        className="btn-ghost-sm flex-1 text-center"
                      >
                        View Details
                      </Link>
                      
                      {campaign.status === 'active' ? (
                        <button
                          onClick={() => pauseCampaign(campaign.id)}
                          className="btn-ghost-sm"
                        >
                          Pause
                        </button>
                      ) : campaign.status === 'paused' ? (
                        <button
                          onClick={() => resumeCampaign(campaign.id)}
                          className="btn-primary-sm"
                        >
                          Resume
                        </button>
                      ) : null}
                      
                      <button
                        onClick={() => duplicateCampaign(campaign.id)}
                        className="btn-ghost-sm"
                        title="Duplicate campaign"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="card-glass p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {campaign.title}
                            </h3>
                            <span className={getStatusBadge(campaign.status)}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {campaign.description}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span>
                              Budget: {formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.total)}
                            </span>
                            <span>
                              Timeline: {formatDate(campaign.timeline.startDate)} - {formatDate(campaign.timeline.endDate)}
                            </span>
                            <span>
                              {campaign.performance.applications} applications
                            </span>
                            <span>
                              {campaign.collaborators.length} collaborators
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/campaigns/${campaign.id}` as any}
                          className="btn-ghost-sm"
                        >
                          View
                        </Link>
                        
                        {campaign.status === 'active' ? (
                          <button
                            onClick={() => pauseCampaign(campaign.id)}
                            className="btn-ghost-sm"
                          >
                            Pause
                          </button>
                        ) : campaign.status === 'paused' ? (
                          <button
                            onClick={() => resumeCampaign(campaign.id)}
                            className="btn-primary-sm"
                          >
                            Resume
                          </button>
                        ) : null}
                        
                        <button
                          onClick={() => duplicateCampaign(campaign.id)}
                          className="btn-ghost-sm"
                          title="Duplicate"
                        >
                          <CopyIcon className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-ghost-sm"
                >
                  ← Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded text-sm ${
                          currentPage === page
                            ? 'bg-brand-primary text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-ghost-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
