'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Creator {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  verified?: boolean;
  location?: string;
  roles: string[]; // Array of roles like ['INFLUENCER', 'CREW', 'BRAND', 'USER']

  // Influencer-specific fields
  primaryNiche?: string;
  primaryPlatform?: string;
  contentCategories?: string[];
  socialHandles?: {
    platform: string;
    handle: string;
    followers?: number;
    verified?: boolean;
  }[];

  // Crew-specific fields
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
  availability?: string;
  workStyle?: string;
  skills?: string[];
  hourlyRate?: number;
  equipment?: string[];

  // Common fields
  totalFollowers?: number;
  avgEngagementRate?: number;
  rating?: number;
  completedProjects?: number;
  isAvailable?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface SearchFilters {
  query: string;
  page: number;
  limit: number;
}

export default function TalentSearchPage() {
  const { user, isAuthenticated } = useAuth();
  const { currentRole } = useRoleSwitch();
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'influencers' | 'crew'>(
    'all'
  );
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    page: 1,
    limit: 18,
  });

  const niches = [
    'fitness',
    'beauty',
    'tech',
    'fashion',
    'food',
    'travel',
    'gaming',
    'business',
    'education',
    'entertainment',
    'sports',
    'art',
    'music',
    'parenting',
    'home',
    'photography',
    'lifestyle',
  ];

  const platforms = ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'TWITTER', 'LINKEDIN'];

  const contentCategories = [
    'posts',
    'stories',
    'reels',
    'videos',
    'tutorials',
    'reviews',
    'unboxing',
    'lifestyle',
    'educational',
    'promotional',
  ];

  const crewSkills = [
    'photography',
    'videography',
    'editing',
    'drone-operation',
    'sound-engineering',
    'lighting',
    'graphic-design',
    'animation',
    'social-media-management',
    'content-writing',
  ];

  const experienceLevels = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];
  const workStyles = ['remote', 'on-site', 'hybrid', 'flexible'];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Add a small delay to prevent too many API calls while typing
    const timeoutId = setTimeout(() => {
      loadCreators();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, filters, searchQuery, activeTab]);

  // Handle tab changes - just reload creators with client-side filtering
  useEffect(() => {
    // Tab changes will be handled by client-side filtering
    // Reset to page 1 when changing tabs
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [activeTab]);

  const loadCreators = async () => {
    try {
      setIsLoading(true);

      console.log('Loading creators with search query:', searchQuery);
      console.log('Active tab:', activeTab);
      console.log('Filters:', filters);

      const params = new URLSearchParams();

      // Add search query if exists
      const queryToUse = searchQuery.trim() || filters.query.trim();
      if (queryToUse) {
        params.append('query', queryToUse);
      }

      // Add pagination
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const apiUrl = `/api/search/users?${params.toString()}`;
      console.log('Making API call to:', apiUrl);

      const response = await apiClient.get(apiUrl);
      console.log('API Response:', response);

      if (response.success && response.data) {
        const responseData = response.data as {
          results?: Creator[];
          pagination?: {
            total: number;
            page: number;
            limit: number;
            pages: number;
          };
        };
        let allCreators: Creator[] = [];

        if (responseData.results && Array.isArray(responseData.results)) {
          allCreators = responseData.results;
          console.log('Raw creators from API:', allCreators.length);
        } else {
          console.log('No results array found in response:', responseData);
        }

        // Client-side filtering based on active tab and roles
        let filteredCreators = allCreators;

        if (activeTab === 'influencers') {
          filteredCreators = allCreators.filter(
            (creator) => creator.roles && creator.roles.includes('INFLUENCER')
          );
          console.log('Filtered for influencers:', filteredCreators.length);
        } else if (activeTab === 'crew') {
          filteredCreators = allCreators.filter(
            (creator) => creator.roles && creator.roles.includes('CREW')
          );
          console.log('Filtered for crew:', filteredCreators.length);
        } else {
          // For 'all' tab, show users who have either INFLUENCER or CREW roles
          filteredCreators = allCreators.filter(
            (creator) =>
              creator.roles &&
              (creator.roles.includes('INFLUENCER') ||
                creator.roles.includes('CREW'))
          );
          console.log('Filtered for all talent:', filteredCreators.length);
        }

        console.log('Final filtered creators:', filteredCreators.length);
        setCreators(filteredCreators);
      } else {
        console.log('API response not successful:', response);
        setCreators([]);
      }
    } catch (error) {
      console.error('Failed to load creators:', error);
      setCreators([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Removed toggleArrayFilter since we don't need complex filtering for MVP

  const clearFilters = () => {
    setFilters({
      query: '',
      page: 1,
      limit: 18,
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
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-2 py-2 sm:px-2 lg:px-2">
          <div className="items-left flex flex-col justify-between gap-1 md:flex-row lg:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Talent</h1>
              <p className="mt-1 text-sm text-gray-600">
                Discover and connect with influencers and crew members for your
                projects
              </p>
            </div>
            <div className="flex space-x-2">
              <Link href="/my-gigs" className="btn-secondary">
                My Gigs
              </Link>
              <Link href="/create-gig" className="btn-primary">
                Create Gig
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex space-x-1 rounded-none bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 rounded-none px-2 py-1 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Talent ({creators.length})
            </button>
            <button
              onClick={() => setActiveTab('influencers')}
              className={`flex-1 rounded-none px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'influencers'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Influencers (
              {
                creators.filter(
                  (c) => c.roles && c.roles.includes('INFLUENCER')
                ).length
              }
              )
            </button>
            <button
              onClick={() => setActiveTab('crew')}
              className={`flex-1 rounded-none px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'crew'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Crew (
              {
                creators.filter((c) => c.roles && c.roles.includes('CREW'))
                  .length
              }
              )
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-2 py-2 sm:px-2 lg:px-2">
        <div className="flex flex-col gap-2 lg:flex-row">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <div className="card-glass sticky top-2 p-2">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <div className="flex space-x-2">
                  {/* <button
                    onClick={async () => {
                      console.log('Testing API endpoints...');
                      try {
                        const testResponse = await apiClient.get(
                          '/api/search/influencers?limit=5'
                        );
                        console.log('Test API response:', testResponse);
                      } catch (error) {
                        console.error('Test API error:', error);
                      }
                    }}
                    className="text-xs text-green-600 hover:text-green-800"
                  >
                    Test API
                  </button> */}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    updateFilter('query', value);
                  }}
                  className="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name, username, bio, or skills..."
                />
                {searchQuery && (
                  <p className="mt-1 text-xs text-gray-500">
                    Searching for: "{searchQuery}"
                  </p>
                )}
                <button
                  onClick={() => {
                    console.log('Manual search triggered');
                    loadCreators();
                  }}
                  className="mt-2 w-full rounded-none bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                >
                  Search Now
                </button>
              </div>

              {/* All filters hidden for MVP - only search by name/username/bio */}

              {/* Content Categories for Influencers */}
              {/* {(activeTab === 'all' || activeTab === 'influencers') && (
                <div className="mb-2">
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Content Types
                  </label>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {contentCategories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.contentCategories.includes(category)}
                          onChange={() =>
                            toggleArrayFilter('contentCategories', category)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )} */}

              {/* All advanced filters hidden for MVP - only search by name/bio */}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isLoading ? 'Loading...' : `${creators.length} creators found`}
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <span className="text-sm text-gray-500">
                  Sorted by relevance
                </span>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card-glass animate-pulse p-3">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-300"></div>
                    <div className="mb-2 h-4 rounded bg-gray-300"></div>
                    <div className="mb-4 h-3 rounded bg-gray-300"></div>
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      <div className="h-8 rounded-full bg-gray-300"></div>
                      <div className="h-8 rounded-full bg-gray-300"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : creators.length === 0 ? (
              <div className="card-glass p-12 text-center">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No creators found
                </h3>
                <p className="mb-6 text-gray-600">
                  Try adjusting your filters or search terms to find more
                  creators
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
                {creators.map((creator) => (
                  <div
                    key={creator.id}
                    className="card-glass flex h-32 cursor-pointer flex-col justify-between p-1 transition-shadow hover:shadow-lg"
                    onClick={() => router.push(`/profile/${creator.id}`)}
                  >
                    {/* Creator Header */}
                    <div className="flex-1">
                      <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900">
                        {`${creator.firstName || ''} ${creator.lastName || ''}`.trim() ||
                          creator.username}
                      </h3>
                      <p className="mb-2 text-sm text-gray-600">
                        @{creator.username}
                      </p>
                      {creator.location && (
                        <p className="mb-2 text-xs text-gray-500">
                          📍 {creator.location}
                        </p>
                      )}
                    </div>

                    {/* Roles - positioned at bottom */}
                    <div className="mt-auto flex flex-wrap gap-1">
                      {creator.roles &&
                        creator.roles.map(
                          (role, index) =>
                            role !== 'USER' && (
                              <span
                                key={index}
                                className={`rounded-full px-2 py-1 text-xs ${
                                  role === 'INFLUENCER'
                                    ? 'bg-purple-100 text-purple-600'
                                    : role === 'CREW'
                                      ? 'bg-blue-100 text-blue-600'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {role.charAt(0).toUpperCase() +
                                  String(role || '')
                                    .slice(1)
                                    .toLowerCase()}
                              </span>
                            )
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {creators.length > 0 && creators.length % 18 === 0 && (
              <div className="mt-12 text-center">
                <button className="btn-secondary">Load More Creators</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
