'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Influencer {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  location?: string;
  skills?: string[];
  averageRating: number;
  reviewCount: number;
  completedGigs: number;
  totalFollowers?: number;
  contentCategories?: string[];
  collaborationRates?: {
    postRate?: number;
    storyRate?: number;
    reelRate?: number;
    videoRate?: number;
  };
  isVerified?: boolean;
  tier?: string;
}

const tierColors = {
  'BRONZE': 'bg-amber-100 text-amber-700',
  'SILVER': 'bg-gray-100 text-gray-700',
  'GOLD': 'bg-yellow-100 text-yellow-700',
  'PLATINUM': 'bg-purple-100 text-purple-700',
  'DIAMOND': 'bg-blue-100 text-blue-700',
  'LEGEND': 'bg-red-100 text-red-700',
};

export default function InfluencersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minFollowers: '',
    maxRate: '',
    tier: '',
    verified: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInfluencers();
  }, [filters]);

  const loadInfluencers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        ...(searchQuery && { q: searchQuery }),
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minFollowers && { minFollowers: filters.minFollowers }),
        ...(filters.maxRate && { maxRate: filters.maxRate }),
        ...(filters.tier && { tier: filters.tier }),
        ...(filters.verified && { verified: 'true' }),
      });
      
      const response = await apiClient.get(`/api/influencers?${params}`);
      
      if (response.success) {
        setInfluencers(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Failed to load influencers');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load influencers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInfluencers();
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      minFollowers: '',
      maxRate: '',
      tier: '',
      verified: false,
    });
    setSearchQuery('');
  };

  const getInfluencerName = (influencer: Influencer) => {
    if (influencer.displayName) return influencer.displayName;
    if (influencer.firstName || influencer.lastName) {
      return `${influencer.firstName || ''} ${influencer.lastName || ''}`.trim();
    }
    return 'Influencer';
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-heading mb-4 text-3xl font-bold">
                Discover Influencers
              </h1>
              <p className="text-muted">
                Find and connect with top creators and influencers for your brand campaigns
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 card-glass p-3">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search influencers by name, bio, or skills..."
                    className="input flex-1"
                  />
                  <button type="submit" className="btn-primary px-8">
                    Search
                  </button>
                </div>
                
                {/* Filters Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input"
                  >
                    <option value="">All Categories</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Technology">Technology</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                  
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Location"
                    className="input"
                  />
                  
                  <select
                    value={filters.minFollowers}
                    onChange={(e) => handleFilterChange('minFollowers', e.target.value)}
                    className="input"
                  >
                    <option value="">Min Followers</option>
                    <option value="1000">1K+</option>
                    <option value="10000">10K+</option>
                    <option value="100000">100K+</option>
                    <option value="1000000">1M+</option>
                  </select>
                  
                  <select
                    value={filters.tier}
                    onChange={(e) => handleFilterChange('tier', e.target.value)}
                    className="input"
                  >
                    <option value="">All Tiers</option>
                    <option value="BRONZE">Bronze</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="DIAMOND">Diamond</option>
                    <option value="LEGEND">Legend</option>
                  </select>
                  
                  <input
                    type="number"
                    value={filters.maxRate}
                    onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                    placeholder="Max Rate (₹)"
                    className="input"
                  />
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => handleFilterChange('verified', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Verified only</span>
                  </label>
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn-ghost text-sm"
                  >
                    Clear Filters
                  </button>
                  <span className="text-sm text-gray-600">
                    {influencers.length} influencers found
                  </span>
                </div>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Influencers Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="card-glass p-3 animate-pulse">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : influencers.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No influencers found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
                
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {influencers.map((influencer) => (
                  <div key={influencer.id} className="card-glass p-3 hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {influencer.profilePicture ? (
                          <img 
                            src={influencer.profilePicture} 
                            alt="Profile" 
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          getInfluencerName(influencer)[0]?.toUpperCase() || 'I'
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {getInfluencerName(influencer)}
                          </h3>
                          {influencer.isVerified && (
                            <span className="text-blue-500 text-sm">✓</span>
                          )}
                        </div>
                        
                        {influencer.tier && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tierColors[influencer.tier as keyof typeof tierColors] || 'bg-gray-100 text-gray-700'
                          }`}>
                            {influencer.tier}
                          </span>
                        )}
                        
                        {influencer.location && (
                          <p className="text-sm text-gray-600 mt-1">📍 {influencer.location}</p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {influencer.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {influencer.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Followers</span>
                        <span className="font-medium">
                          {influencer.totalFollowers ? formatFollowers(influencer.totalFollowers) : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(influencer.averageRating)}
                          <span className="text-gray-600 ml-1">
                            ({influencer.reviewCount})
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Completed Gigs</span>
                        <span className="font-medium">{influencer.completedGigs}</span>
                      </div>
                      
                      {influencer.collaborationRates?.postRate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Post Rate</span>
                          <span className="font-medium">₹{influencer.collaborationRates.postRate}</span>
                        </div>
                      )}
                    </div>

                    {/* Categories */}
                    {influencer.contentCategories && influencer.contentCategories.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {influencer.contentCategories.slice(0, 3).map((category) => (
                            <span key={category} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {category}
                            </span>
                          ))}
                          {influencer.contentCategories.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{influencer.contentCategories.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {influencer.skills && influencer.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {influencer.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                          {influencer.skills.length > 4 && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              +{influencer.skills.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/profile/${influencer.id}` as any}
                        className="btn-ghost-sm flex-1 text-center"
                      >
                        View Profile
                      </Link>
                      
                      {isAuthenticated && user?.roles?.includes('BRAND') && (
                        <Link
                          href={`/messages/new?to=${influencer.id}` as any}
                          className="btn-primary-sm flex-1 text-center"
                        >
                          Contact
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {influencers.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadInfluencers}
                  className="btn-ghost"
                  disabled={loading}
                >
                  Load More Influencers
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
