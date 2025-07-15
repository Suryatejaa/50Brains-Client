'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useSearchParams, useRouter } from 'next/navigation';
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

export default function SearchPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'ALL',
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
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        q: searchQuery,
        type: filters.type,
        ...(filters.category && { category: filters.category }),
        ...(filters.minBudget && { minBudget: filters.minBudget }),
        ...(filters.maxBudget && { maxBudget: filters.maxBudget }),
        ...(filters.location && { location: filters.location }),
        ...(filters.isRemote && { remote: 'true' }),
      });
      
      const response = await apiClient.get(`/api/search?${params}`);
      
      if (response.success) {
        setResults((response.data as SearchResult[]) || []);
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
    <div key={result.id} className="card-glass p-6">
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
    <div key={result.id} className="card-glass p-6">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {result.profilePicture ? (
            <img 
              src={result.profilePicture} 
              alt="Profile" 
              className="w-16 h-16 rounded-full object-cover"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Search Header */}
            <div className="mb-8">
              <h1 className="text-heading mb-4 text-3xl font-bold">
                Search
              </h1>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for gigs, influencers, or crew members..."
                    className="input flex-1 text-lg py-3"
                  />
                  <button type="submit" className="btn-primary px-8">
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
                    <option value="ALL">All Results</option>
                    <option value="GIG">Gigs Only</option>
                    <option value="USER">People Only</option>
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
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
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
                      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
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
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Search 50Brains
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Find gigs, influencers, crew members, and more
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">💼</div>
                    <h4 className="font-medium text-gray-900">Find Gigs</h4>
                    <p className="text-sm text-gray-600">Browse available projects and campaigns</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">👥</div>
                    <h4 className="font-medium text-gray-900">Find Talent</h4>
                    <p className="text-sm text-gray-600">Discover influencers and crew members</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-medium text-gray-900">Smart Filters</h4>
                    <p className="text-sm text-gray-600">Use advanced filters to find exactly what you need</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
