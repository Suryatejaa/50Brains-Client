'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { BusinessRoadmap } from '@/components/landing/BusinessRoadmap';
import Link from 'next/link';

interface SearchResult {
  type: 'GIG' | 'USER' | 'CLAN';
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  skills?: string[];
  budget?: {
    type: string;
    min?: number;
    max?: number;
    currency: string;
  };
  location?: string;
  rating?: number;
  reviewCount?: number;
  isRemote?: boolean;
  profilePicture?: string;
  roles?: string[];
}

interface TopUser {
  rank: number;
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  profilePicture: string | null;
  bio: string | null;
  location: string | null;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastActiveAt: string;
  tokenCount: number;
  equipmentCount: number;
  reputation: {
    finalScore: number;
    tier: string;
    badges: any[];
    ranking: {
      global: number | null;
    };
  };
  // Social media fields (if available)
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export default function SearchPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTopUsers, setLoadingTopUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'users',
    category: searchParams.get('category') || '',
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    location: searchParams.get('location') || '',
    isRemote: searchParams.get('remote') === 'true',
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    } else {
      // Load top users when no search query
      loadTopUsers();
    }
  }, [searchParams]);

  const loadTopUsers = async () => {
    try {
      setLoadingTopUsers(true);
      const response = await apiClient.get('/api/feed/top-users?limit=5&criteria=score');
      if (response.success) {
        setTopUsers((response.data as any)?.users as TopUser[] || []);
      } else {
        console.error('Failed to load top users:', response);
        setTopUsers([]);
      }
    } catch (error: any) {
      console.error('Error loading top users:', error);
      setTopUsers([]);
    } finally {
      setLoadingTopUsers(false);
    }
  };

  const endpointMap: Record<string, string> = {
    users: '/api/user/search/users',
    influencers: '/api/user/search/influencers',
    brands: '/api/user/search/brands',
    crew: '/api/user/search/crew',
  };

  const performSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        query: searchQuery,
        ...(filters.category && { category: filters.category }),
        ...(filters.minBudget && { minBudget: filters.minBudget }),
        ...(filters.maxBudget && { maxBudget: filters.maxBudget }),
        ...(filters.location && { location: filters.location }),
        ...(filters.isRemote && { remote: 'true' }),
      });

      const endpoint = endpointMap[filters.type] || endpointMap['users'];
      const response = await apiClient.get(`${endpoint}?${params}`);
      console.log(response);
      if (response.success) {
        setResults(((response.data as any)?.results as SearchResult[]) || []);
      } else {
        setError('Search failed');
      }
    } catch (error: any) {
      setError(error.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Update URL
      const params = new URLSearchParams({
        q: query,
        ...(filters.type !== 'ALL' && { type: filters.type }),
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.isRemote && { remote: 'true' }),
      });

      router.push(`/search?${params}`);
      performSearch();
    }
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Auto-search when filters change if there's a query
    if (query.trim()) {
      performSearch();
    }
  };

  const renderGigResult = (result: SearchResult) => (
    <div key={result.id} className="card-glass p-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              GIG
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              {result.title}
            </h3>
            {result.isRemote && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                Remote
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {result.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
            {result.category && <span>🏷️ {result.category}</span>}
            {result.budget && (
              <span>
                💰 {result.budget.type === 'NEGOTIABLE' ? 'Negotiable' :
                  `${result.budget.currency} ${result.budget.min}${result.budget.max ? ` - ${result.budget.max}` : '+'}`}
              </span>
            )}
            {result.location && <span>📍 {result.location}</span>}
          </div>

          {result.skills && result.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.skills.slice(0, 5).map((skill) => (
                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {skill}
                </span>
              ))}
              {result.skills.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  +{result.skills.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="ml-6">
          <Link
            href={`/gig/${result.id}` as any}
            className="btn-primary"
          >
            View Gig
          </Link>
        </div>
      </div>
    </div>
  );

  const renderUserResult = (result: SearchResult) => (
    <div key={result.id} className="card-glass p-3">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white font-semibold text-lg">
          {result.profilePicture ? (
            <img
              src={result.profilePicture}
              alt="Profile"
              className="w-16 h-16 rounded-none object-cover"
            />
          ) : (
            result.name?.[0]?.toUpperCase() || 'U'
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
              {result.roles?.includes('INFLUENCER') ? 'INFLUENCER' :
                result.roles?.includes('CREW') ? 'CREW' : 'USER'}
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              {result.name}
            </h3>
            {result.rating && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <span className="text-yellow-400">★</span>
                <span>{result.rating.toFixed(1)}</span>
                <span>({result.reviewCount || 0})</span>
              </div>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {result.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
            {result.category && <span>🏷️ {result.category}</span>}
            {result.location && <span>📍 {result.location}</span>}
          </div>

          {result.skills && result.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.skills.slice(0, 5).map((skill) => (
                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {skill}
                </span>
              ))}
              {result.skills.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  +{result.skills.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Link
            href={`/profile/${result.id}` as any}
            className="btn-ghost-sm"
          >
            View Profile
          </Link>

          {isAuthenticated && user?.roles?.includes('BRAND') && (
            <Link
              href={`/messages/new?to=${result.id}` as any}
              className="btn-primary-sm"
            >
              Contact
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  const renderTopUser = (user: TopUser) => (
    <div key={user.id} className="card-glass p-3">
      <div className="flex items-start space-x-3">
        {/* Profile Picture - Smaller on mobile */}
        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white font-semibold text-sm md:text-lg flex-shrink-0">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-12 h-12 md:w-16 md:h-16 rounded-none object-cover"
            />
          ) : (
            user.fullName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
            <div className="flex items-center space-x-2 mb-1 sm:mb-0">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                TOP #{user.rank}
              </span>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                {user.fullName !== 'null null' ? user.fullName : user.username}
              </h3>
            </div>

            {/* Stats - Horizontal on mobile, vertical on larger screens */}
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600">
              {user.reputation && user.reputation.finalScore !== null && (
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">🏆</span>
                  <span>{user.reputation.finalScore.toFixed(1)}</span>
                </div>
              )}
              {user.reputation && user.reputation.tier && (
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">🏆</span>
                  <span>{user.reputation.tier}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio - Truncated on mobile */}
          <p className="text-gray-600 text-xs md:text-sm mb-1 line-clamp-2">
            {user.bio || `Top performing user on 50BraIns - ${user.roles.join(', ')}`}
          </p>

          {/* Location and Social Media - Compact on mobile */}
          <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mb-1">
            {user.location && (
              <span className="flex items-center">
                <span className="mr-1">📍</span>
                <span className="truncate">{user.location}</span>
              </span>
            )}

            {/* Social Media Icons - Only show on larger screens or as tooltips */}
            <div className="hidden sm:flex items-center space-x-2">
              {user.instagram && (
                <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0-3 3V18a3 3 0 1 0 3-3" /><circle cx="12" cy="12" r="3" /><path d="M19.5 6h-15" /><path d="M22 12h-4" /><path d="M18 18h-2" /><path d="M15 15h-3" /></svg>
                </a>
              )}
              {user.twitter && (
                <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.5-.5" /><path d="M9 10.5h.01" /><path d="M16 10.5h.01" /><path d="M11 10.5h.01" /><path d="M18 10.5h.01" /></svg>
                </a>
              )}
              {user.linkedin && (
                <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7H4v-7a6 6 0 0 1 6-6" /><circle cx="12" cy="12" r="3" /></svg>
                </a>
              )}
            </div>
          </div>

          {/* Equipment and Tokens - Compact display */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            {user.equipmentCount > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-green-500">⚙️</span>
                <span>{user.equipmentCount}</span>
              </div>
            )}
            {user.tokenCount > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-blue-500">💰</span>
                <span>{user.tokenCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Stack vertically on mobile */}
        <div className="flex flex-col space-y-1 ml-2">
          <Link
            href={`/profile/${user.id}` as any}
            className="btn-ghost-sm text-xs px-2 py-1"
          >
            View
          </Link>

          {isAuthenticated && user?.roles?.includes('BRAND') && (
            <Link
              href={`/messages/new?to=${user.id}` as any}
              className="btn-primary-sm text-xs px-2 py-1"
            >
              Contact
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-1">
          <div className="mx-auto max-w-6xl">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Link href="/marketplace" className="hover:text-brand-primary">
                Marketplace
              </Link>
              <span>›</span>
              <Link href="/search" className="hover:text-brand-primary">
                Search People
              </Link>
            </nav>
            {/* Search Header */}
            <div className="mb-1">
              <h1 className="text-heading mb-1 text-3xl font-bold">
                Search
              </h1>

              <form onSubmit={handleSearch} className="space-y-1">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for influencers, brands, or crew members..."
                    className="input flex-1 text-lg py-1"
                  />
                  <button type="submit" className="btn-primary px-1">
                    Search
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input w-auto"
                  >
                    <option value="users">Users</option>
                    <option value="influencers">Influencers</option>
                    <option value="brands">Brands</option>
                    <option value="crew">Crew</option>
                  </select>

                  <input
                    type="text"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    placeholder="Category"
                    className="input w-32"
                  />

                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Location"
                    className="input w-32"
                  />

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.isRemote}
                      onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Remote only</span>
                  </label>
                </div>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="card-glass p-8 text-center">
                <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
                <p className="text-muted">Searching...</p>
              </div>
            ) : query && !loading ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Search Results for "{query}"
                  </h2>
                  <p className="text-gray-600">
                    Found {results.length} results
                  </p>
                </div>

                {results.length === 0 ? (
                  <div className="card-glass p-8 text-center">
                    <div className="mb-4">
                      <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-2xl">🔍</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result) =>
                      result.type === 'GIG' ? renderGigResult(result) : renderUserResult(result)
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-1">
                {/* Top Users Section */}
                <div className="mb-1">
                  <div className="flex flex-row justify-between items-center sm:flex-row sm:items-center sm:justify-between mb-1">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-0">
                      Top Users
                    </h2>
                    <span className="text-xs md:text-sm text-gray-500">
                      Highest scoring users on 50BraIns
                    </span>
                  </div>

                  {loadingTopUsers ? (
                    <div className="card-glass p-1 text-center">
                      <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
                      <p className="text-muted text-sm">Loading top users...</p>
                    </div>
                  ) : topUsers.length > 0 ? (
                    <div className="space-y-1">
                      {topUsers.map(renderTopUser)}
                    </div>
                  ) : (
                    <div className="card-glass p-1 text-center">
                      <div className="mb-1">
                        <div className="mx-auto mb-1 h-12 w-12 md:h-16 md:w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-xl md:text-2xl">👥</span>
                        </div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                          No top users available
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Top users will appear here
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* <div className="card-glass p-8 text-center">
                  <div className="mb-4">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Search 50Brains
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Find influencers, brands, and crew members
                    </p>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-none">
                      <div className="text-2xl mb-2">👥</div>
                      <h4 className="font-medium text-gray-900">Find Influencers</h4>
                      <p className="text-sm text-gray-600">Browse available influencers</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-none">
                      <div className="text-2xl mb-2">💰</div>
                      <h4 className="font-medium text-gray-900">Find Brands</h4>
                      <p className="text-sm text-gray-600">Discover brands</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-none">
                      <div className="text-2xl mb-2">👥</div>
                      <h4 className="font-medium text-gray-900">Find Crew</h4>
                      <p className="text-sm text-gray-600">Discover crew members</p>
                    </div>
                  </div> 
                </div> */}
                {/* Business Roadmap */}
                <div className="mt-6">
                  <BusinessRoadmap />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
