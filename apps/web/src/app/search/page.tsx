'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { BusinessRoadmap } from '@/components/landing/BusinessRoadmap';
import Link from 'next/link';

interface SearchResult {
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
  const [allSearchResults, setAllSearchResults] = useState<SearchResult[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTopUsers, setLoadingTopUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'users',
    location: searchParams.get('location') || '',
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
      const response = await apiClient.get(
        '/api/feed/top-users?limit=5&criteria=score'
      );
      console.log('Top Users API Response:', response);
      if (response.success) {
        setTopUsers(((response.data as any)?.users as TopUser[]) || []);
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

  // Single endpoint for all user searches, filter by role on client side
  const searchEndpoint = '/api/user/search/users';

  // Function to apply filters to existing results
  const applyFilters = (users: SearchResult[]) => {
    return users.filter((user) => {
      // Role filter - only show users that match the selected role
      if (filters.type === 'influencers') {
        if (!user.roles.includes('INFLUENCER')) return false;
      } else if (filters.type === 'brands') {
        if (!user.roles.includes('BRAND')) return false;
      } else if (filters.type === 'crew') {
        if (!user.roles.includes('CREW')) return false;
      }
      // If filters.type === 'users', show all users (no role filtering)

      // Location filter (case insensitive partial match)
      if (filters.location && user.location) {
        if (
          !user.location.toLowerCase().includes(filters.location.toLowerCase())
        )
          return false;
      } else if (filters.location && !user.location) {
        return false; // If location filter is set but user has no location
      }

      return true;
    });
  };

  const performSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      setError(null);

      // Only send the search query to API, no filters
      const params = new URLSearchParams({
        query: searchQuery,
      });

      const response = await apiClient.get(`${searchEndpoint}?${params}`);
      console.log('Search API Response:', response);
      if (response.success) {
        const allUsers = ((response.data as any)?.results as TopUser[]) || [];

        // Convert TopUser format to SearchResult format for compatibility
        const searchResults: SearchResult[] = allUsers.map((user) => ({
          rank: user.rank,
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          location: user.location,
          roles: user.roles,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          lastActiveAt: user.lastActiveAt,
          tokenCount: user.tokenCount,
          equipmentCount: user.equipmentCount,
          reputation: user.reputation,
          instagram: user.instagram,
          twitter: user.twitter,
          linkedin: user.linkedin,
          youtube: user.youtube,
          tiktok: user.tiktok,
        }));

        // Store all results for filtering
        setAllSearchResults(searchResults);

        // Apply current filters and set filtered results
        const filteredResults = applyFilters(searchResults);
        setResults(filteredResults);
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
        ...(filters.type !== 'users' && { type: filters.type }),
        ...(filters.location && { location: filters.location }),
      });

      router.push(`/search?${params}`);
      performSearch();
    }
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // If we have search results, just re-filter them instead of making new API call
    if (allSearchResults.length > 0) {
      // Apply filters with the new filter values
      const filteredResults = allSearchResults.filter((user) => {
        // Role filter - only show users that match the selected role
        if (newFilters.type === 'influencers') {
          if (!user.roles.includes('INFLUENCER')) return false;
        } else if (newFilters.type === 'brands') {
          if (!user.roles.includes('BRAND')) return false;
        } else if (newFilters.type === 'crew') {
          if (!user.roles.includes('CREW')) return false;
        }
        // If newFilters.type === 'users', show all users (no role filtering)

        // Location filter (case insensitive partial match)
        if (newFilters.location && user.location) {
          if (
            !user.location
              .toLowerCase()
              .includes(newFilters.location.toLowerCase())
          )
            return false;
        } else if (newFilters.location && !user.location) {
          return false; // If location filter is set but user has no location
        }

        return true;
      });

      setResults(filteredResults);
    }
  };

  // const renderGigResult = (result: SearchResult) => (
  //   <div key={result.id} className="card-glass p-3">
  //     <div className="flex items-start justify-between">
  //       <div className="flex-1">
  //         <div className="mb-2 flex items-center space-x-3">
  //           <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
  //             GIG
  //           </span>
  //           <h3 className="text-lg font-semibold text-gray-900">
  //             {result.title}
  //           </h3>
  //           {result.isRemote && (
  //             <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
  //               Remote
  //             </span>
  //           )}
  //         </div>

  //         <p className="mb-3 line-clamp-2 text-sm text-gray-600">
  //           {result.description}
  //         </p>

  //         <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
  //           {result.category && <span>🏷️ {result.category}</span>}
  //           {result.budget && (
  //             <span>
  //               💰{' '}
  //               {result.budget.type === 'NEGOTIABLE'
  //                 ? 'Negotiable'
  //                 : `${result.budget.currency} ${result.budget.min}${result.budget.max ? ` - ${result.budget.max}` : '+'}`}
  //             </span>
  //           )}
  //           {result.location && <span>📍 {result.location}</span>}
  //         </div>

  //         {result.skills && result.skills.length > 0 && (
  //           <div className="flex flex-wrap gap-2">
  //             {result.skills.slice(0, 5).map((skill) => (
  //               <span
  //                 key={skill}
  //                 className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
  //               >
  //                 {skill}
  //               </span>
  //             ))}
  //             {result.skills.length > 5 && (
  //               <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
  //                 +{result.skills.length - 5} more
  //               </span>
  //             )}
  //           </div>
  //         )}
  //       </div>

  //       <div className="ml-6">
  //         <Link href={`/gig/${result.id}` as any} className="btn-primary">
  //           View Gig
  //         </Link>
  //       </div>
  //     </div>
  //   </div>
  // );

  const renderUserCard = (
    user: SearchResult | TopUser,
    isTopUser: boolean = false
  ) => (
    <div
      key={user.id}
      className="card-glass cursor-pointer p-3 transition-shadow hover:shadow-md"
      onClick={() => router.push(`/profile/${user.username}`)}
    >
      <div className="flex items-start space-x-3">
        {/* Profile Picture - Smaller on mobile */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-semibold text-white md:h-16 md:w-16 md:text-lg">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="h-12 w-12 rounded-full object-cover md:h-16 md:w-16"
            />
          ) : (
            (user.fullName !== 'null null'
              ? user.fullName?.[0]
              : user.username?.[0]
            )?.toUpperCase() || 'U'
          )}
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Header Row - Stack on mobile */}
          <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <div className="mb-1 flex items-center space-x-2 sm:mb-0">
              {isTopUser && (
                <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                  TOP #{user.rank}
                </span>
              )}
              <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                {user.roles?.includes('BRAND')
                  ? 'BRAND'
                  : user.roles?.includes('INFLUENCER') &&
                      user.roles?.includes('CREW')
                    ? 'INFLUENCER + CREW'
                    : user.roles?.includes('INFLUENCER')
                      ? 'INFLUENCER'
                      : user.roles?.includes('CREW')
                        ? 'CREW'
                        : 'USER'}
              </span>
              <h3 className="truncate text-base font-semibold text-gray-900 md:text-lg">
                {user.fullName !== 'null null' ? user.fullName : user.username}
              </h3>
            </div>

            {/* Stats - Horizontal on mobile */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 md:text-sm">
              {user.reputation && user.reputation.finalScore !== null && (
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">🏆</span>
                  <span>{user.reputation.finalScore.toFixed(1)}</span>
                </div>
              )}
              {user.reputation && user.reputation.tier && (
                <div className="flex items-center space-x-1">
                  <span className="text-blue-500">�</span>
                  <span>{user.reputation.tier}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio - Truncated on mobile */}
          <p className="mb-1 line-clamp-2 text-xs text-gray-600 md:text-sm">
            {user.bio || `User on 50BraIns - ${user.roles.join(', ')}`}
          </p>

          {/* Location and Social Media - Compact on mobile */}
          <div className="mb-1 flex flex-wrap items-center gap-1 text-xs text-gray-500">
            {user.location && (
              <span className="flex items-center">
                <span className="mr-1">📍</span>
                <span className="truncate">{user.location}</span>
              </span>
            )}

            {/* Equipment and Tokens - Compact display */}
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
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-1">
          <div className="mx-auto max-w-6xl">
            <nav className="mb-2 flex items-center space-x-2 text-sm text-gray-600">
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
              <h1 className="text-heading mb-1 text-3xl font-bold">Search</h1>

              <form onSubmit={handleSearch} className="space-y-1">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for influencers, brands, or crew members..."
                    className="input flex-1 py-1 text-lg"
                  />
                  <button type="submit" className="btn-primary px-1">
                    Search
                  </button>
                </div>

                {/* User Filters */}
                <div className="flex flex-wrap gap-4">
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input w-auto"
                  >
                    <option value="users">All Users</option>
                    <option value="influencers">Influencers</option>
                    <option value="brands">Brands</option>
                    <option value="crew">Crew</option>
                  </select>

                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange('location', e.target.value)
                    }
                    placeholder="Location"
                    className="input w-32"
                  />
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
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-gradient-to-r from-blue-500 to-purple-600">
                        <span className="text-2xl">🔍</span>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        No results found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result) => renderUserCard(result, false))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-1">
                {/* Top Users Section */}
                <div className="mb-1">
                  <div className="mb-1 flex flex-row items-center justify-between sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="mb-1 text-lg font-semibold text-gray-900 sm:mb-0 md:text-xl">
                      Top Users
                    </h2>
                    <span className="text-xs text-gray-500 md:text-sm">
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
                      {topUsers.map((user) => renderUserCard(user, true))}
                    </div>
                  ) : (
                    <div className="card-glass p-1 text-center">
                      <div className="mb-1">
                        <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-none bg-gradient-to-r from-blue-500 to-purple-600 md:h-16 md:w-16">
                          <span className="text-xl md:text-2xl">👥</span>
                        </div>
                        <h3 className="mb-2 text-base font-semibold text-gray-900 md:text-lg">
                          No top users available
                        </h3>
                        <p className="text-sm text-gray-600">
                          Top users will appear here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Business Roadmap */}
                <div className="flex justify-center">
                  <button
                    className="btn-ghost px-1 py-1"
                    onClick={() => setShowRoadmap(!showRoadmap)}
                  >
                    {showRoadmap ? 'Hide Roadmap' : 'Show Roadmap'}
                  </button>
                </div>
                {showRoadmap && (
                  <div className="w-full space-y-1 rounded-none border-none border-black/20 bg-white p-1 shadow-none backdrop-blur-lg">
                    <BusinessRoadmap />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
