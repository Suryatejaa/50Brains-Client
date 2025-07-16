'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio: string;
  verified: boolean;
  
  // Social metrics
  totalFollowers: number;
  avgEngagementRate: number;
  categories: string[];
  location?: string;
  
  // Platform stats
  platforms: {
    platform: string;
    followers: number;
    handle: string;
    verified: boolean;
  }[];
  
  // Portfolio
  portfolioItems: {
    id: string;
    title: string;
    thumbnail: string;
    platform: string;
    views?: number;
    likes?: number;
  }[];
  
  // Rates and availability
  rates: {
    post: number;
    story: number;
    reel: number;
    video: number;
  };
  
  // Performance
  rating: number;
  completedCampaigns: number;
  responseTime: string; // e.g., "Within 24 hours"
  
  // Availability
  isAvailable: boolean;
  nextAvailableDate?: string;
}

interface SearchFilters {
  category: string;
  location: string;
  minFollowers: number;
  maxFollowers: number;
  platforms: string[];
  minEngagement: number;
  maxRate: number;
  availability: 'all' | 'available' | 'verified';
  sortBy: 'followers' | 'engagement' | 'rating' | 'rate';
}

export default function InfluencersSearchPage() {
  const { user, isAuthenticated } = useAuth();
  const { currentRole } = useRoleSwitch();
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    location: '',
    minFollowers: 0,
    maxFollowers: 0,
    platforms: [],
    minEngagement: 0,
    maxRate: 0,
    availability: 'all',
    sortBy: 'followers'
  });

  const categories = [
    'Fashion & Style', 'Beauty & Makeup', 'Fitness & Health', 'Food & Cooking',
    'Travel & Lifestyle', 'Technology', 'Gaming', 'Business & Finance',
    'Education', 'Entertainment', 'Sports', 'Art & Design', 'Music',
    'Parenting & Family', 'Home & Garden', 'Photography'
  ];

  const platforms = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn'];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadCreators();
  }, [isAuthenticated, filters, searchQuery]);

  const loadCreators = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.minFollowers > 0) params.append('minFollowers', filters.minFollowers.toString());
      if (filters.maxFollowers > 0) params.append('maxFollowers', filters.maxFollowers.toString());
      if (filters.platforms.length > 0) params.append('platforms', filters.platforms.join(','));
      if (filters.minEngagement > 0) params.append('minEngagement', filters.minEngagement.toString());
      if (filters.maxRate > 0) params.append('maxRate', filters.maxRate.toString());
      if (filters.availability !== 'all') params.append('availability', filters.availability);
      params.append('sortBy', filters.sortBy);

      const response = await apiClient.get(`/api/creators/search?${params.toString()}`);
      
      if (response.success) {
        setCreators(((response.data as any)?.creators || []) as Creator[]);
      }
    } catch (error) {
      console.error('Failed to load creators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const togglePlatform = (platform: string) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      minFollowers: 0,
      maxFollowers: 0,
      platforms: [],
      minEngagement: 0,
      maxRate: 0,
      availability: 'all',
      sortBy: 'followers'
    });
    setSearchQuery('');
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Influencers</h1>
              <p className="mt-1 text-sm text-gray-600">
                Discover and connect with creators for your campaigns
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/my-gigs" className="btn-secondary">
                My Gigs
              </Link>
              <Link href="/create-gig" className="btn-primary">
                Create Gig
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <div className="card-glass p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by name, username, or keyword..."
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Platforms */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platforms
                </label>
                <div className="space-y-2">
                  {platforms.map(platform => (
                    <label key={platform} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.platforms.includes(platform)}
                        onChange={() => togglePlatform(platform)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Followers Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Followers Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={filters.minFollowers || ''}
                    onChange={(e) => updateFilter('minFollowers', Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={filters.maxFollowers || ''}
                    onChange={(e) => updateFilter('maxFollowers', Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Engagement Rate */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Engagement Rate (%)
                </label>
                <input
                  type="number"
                  value={filters.minEngagement || ''}
                  onChange={(e) => updateFilter('minEngagement', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3.5"
                  step="0.1"
                />
              </div>

              {/* Max Rate */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Rate per Post ($)
                </label>
                <input
                  type="number"
                  value={filters.maxRate || ''}
                  onChange={(e) => updateFilter('maxRate', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Budget limit"
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>

              {/* Availability */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => updateFilter('availability', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Creators</option>
                  <option value="available">Available Now</option>
                  <option value="verified">Verified Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {isLoading ? 'Loading...' : `${creators.length} creators found`}
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="followers">Followers</option>
                  <option value="engagement">Engagement Rate</option>
                  <option value="rating">Rating</option>
                  <option value="rate">Rate (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card-glass p-6 animate-pulse">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="h-8 bg-gray-300 rounded"></div>
                      <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : creators.length === 0 ? (
              <div className="card-glass p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No creators found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find more creators
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creators.map((creator) => (
                  <div key={creator.id} className="card-glass p-6 hover:shadow-lg transition-shadow">
                    {/* Creator Header */}
                    <div className="text-center mb-4">
                      <div className="relative inline-block">
                        <img
                          src={creator.avatar || '/default-avatar.png'}
                          alt={creator.name}
                          className="w-16 h-16 rounded-full mx-auto mb-3"
                        />
                        {creator.verified && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                        {!creator.isAvailable && (
                          <div className="absolute -bottom-1 right-0 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                        )}
                        {creator.isAvailable && (
                          <div className="absolute -bottom-1 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{creator.name}</h3>
                      <p className="text-sm text-gray-600">@{creator.username}</p>
                      {creator.location && (
                        <p className="text-xs text-gray-500">📍 {creator.location}</p>
                      )}
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{creator.bio}</p>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {creator.categories.slice(0, 2).map((category, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {category}
                        </span>
                      ))}
                      {creator.categories.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{creator.categories.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatFollowers(creator.totalFollowers)}
                        </div>
                        <div className="text-xs text-gray-600">Total Followers</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {creator.avgEngagementRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Engagement</div>
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="flex justify-center space-x-2 mb-4">
                      {creator.platforms.slice(0, 4).map((platform, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xs text-gray-600">{platform.platform}</div>
                          <div className="text-sm font-medium">{formatFollowers(platform.followers)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Rating and Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium">{creator.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-600">({creator.completedCampaigns})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">${creator.rates.post}</div>
                        <div className="text-xs text-gray-600">per post</div>
                      </div>
                    </div>

                    {/* Response Time */}
                    <div className="text-center mb-4">
                      <span className="text-xs text-gray-600">Response: {creator.responseTime}</span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link 
                        href={`/influencer/${creator.id}` as any}
                        className="btn-primary w-full text-center block"
                      >
                        View Profile
                      </Link>
                      <button className="btn-secondary w-full">
                        Send Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {creators.length > 0 && creators.length % 18 === 0 && (
              <div className="text-center mt-12">
                <button className="btn-secondary">
                  Load More Creators
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
