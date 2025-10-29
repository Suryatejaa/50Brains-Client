// app/marketplace/page-optimized.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  OptimizedPageWrapper,
  usePerformanceMonitoring,
} from '@/components/optimized/OptimizedPageWrapper';
import { useGigs } from '@/hooks/useGigs';
import type { Gig, GigFilters } from '@/types/gig.types';
import { GIG_CATEGORIES } from '@/types/gig.types';

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Optimized marketplace component
const OptimizedMarketplaceContent = () => {
  usePerformanceMonitoring('marketplace');

  const {
    gigs,
    loading,
    error,
    loadPublicGigs,
    searchGigs,
    loadFeaturedGigs,
    categories,
    loadCategories,
  } = useGigs();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GigFilters>({
    category: '',
    experienceLevel: '',
    budgetType: undefined,
    budgetMin: undefined,
    budgetMax: undefined,
    location: '',
    sortBy: 'recent',
    page: 1,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'featured'>('all');

  // Memoized filtered and sorted gigs for performance
  const { displayGigs, totalCount } = useMemo(() => {
    performance.mark('marketplace-filter-start');

    const filteredGigs = gigs.filter((gig) => {
      // Optimized search - early returns for better performance
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableContent = [
          gig.title,
          gig.description,
          gig.category,
          gig.brand?.name,
          ...(gig.skillsRequired || []),
        ]
          .join(' ')
          .toLowerCase();

        if (!searchableContent.includes(query)) return false;
      }

      // Quick filter checks
      if (filters.category && gig.category !== filters.category) return false;
      if (filters.budgetType && gig.budgetType !== filters.budgetType)
        return false;
      if (
        filters.experienceLevel &&
        gig.roleRequired !== filters.experienceLevel
      )
        return false;

      // Budget range validation
      if (
        filters.budgetMin &&
        gig.budgetMin &&
        gig.budgetMin < filters.budgetMin
      )
        return false;
      if (
        filters.budgetMax &&
        gig.budgetMax &&
        gig.budgetMax > filters.budgetMax
      )
        return false;

      // Location filter
      if (filters.location?.trim()) {
        const locationQuery = filters.location.toLowerCase();
        const gigLocation = gig.location?.toLowerCase() || '';
        if (!gigLocation.includes(locationQuery)) return false;
      }

      return true;
    });

    // Optimized sorting
    const sortedGigs = [...filteredGigs].sort((a, b) => {
      switch (filters.sortBy) {
        case 'budget_high':
          return (
            (b.budgetMax || b.budgetMin || 0) -
            (a.budgetMax || a.budgetMin || 0)
          );
        case 'budget_low':
          return (
            (a.budgetMin || a.budgetMax || 0) -
            (b.budgetMin || b.budgetMax || 0)
          );
        case 'deadline':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        case 'recent':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    performance.mark('marketplace-filter-end');
    performance.measure(
      'marketplace-filter',
      'marketplace-filter-start',
      'marketplace-filter-end'
    );

    const result = activeTab === 'featured' ? gigs : sortedGigs;
    return {
      displayGigs: result,
      totalCount: result.length,
    };
  }, [gigs, searchQuery, filters, activeTab]);

  // Debounced search for better performance
  const debouncedSearch = useCallback(
    debounce(async (query: string, currentFilters: GigFilters) => {
      if (query.trim()) {
        await searchGigs(query, currentFilters);
      } else {
        await loadPublicGigs(currentFilters);
      }
    }, 300),
    [searchGigs, loadPublicGigs]
  );

  // Optimized data loading
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        await Promise.all([
          loadCategories(),
          activeTab === 'featured'
            ? loadFeaturedGigs()
            : loadPublicGigs(filters),
        ]);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to load marketplace data:', error);
        }
      }
    };

    loadData();

    return () => controller.abort();
  }, [activeTab, filters.category, filters.budgetType]); // Only essential dependencies

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      debouncedSearch(searchQuery, filters);
    },
    [searchQuery, filters, debouncedSearch]
  );

  const updateFilter = useCallback((key: keyof GigFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      experienceLevel: '',
      budgetType: undefined,
      budgetMin: undefined,
      budgetMax: undefined,
      location: '',
      sortBy: 'recent',
      page: 1,
      limit: 12,
    });
    setSearchQuery('');
  }, []);

  // Optimized format functions
  const formatBudget = useCallback((gig: Gig) => {
    if (gig.budgetType === 'negotiable') return 'Negotiable';
    if (gig.budgetMin && gig.budgetMax) {
      const prefix = gig.budgetType === 'hourly' ? '/hr' : '';
      return `₹${gig.budgetMin} - ₹${gig.budgetMax}${prefix}`;
    }
    return 'Budget not specified';
  }, []);

  const formatDeadline = useCallback((deadline?: string) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-1">
          {/* Optimized Header */}
          <div className="mb-1">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-1">
                <div className="flex flex-row justify-between sm:gap-4 md:gap-4 lg:gap-4">
                  <h1 className="text-heading flex text-4xl font-bold">
                    Marketplace ⚡
                  </h1>
                  <Link href="/search" className="btn-primary flex px-3 py-2">
                    Search People
                  </Link>
                </div>
                <p className="text-muted flex">
                  ⚡ Optimized for speed - Discover amazing opportunities and
                  collaborate with top creators
                </p>
              </div>
            </div>
          </div>

          {/* Quick Search and Basic Filters */}
          <div className="mb-2">
            <form onSubmit={handleSearch} className="mb-0">
              <div className="card-glass p-1">
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Search gigs by title, description, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input w-full border-2 border-gray-700"
                    />
                  </div>

                  <div>
                    <select
                      value={filters.category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="input w-full border-2 border-gray-700"
                    >
                      <option value="">All Categories</option>
                      {Object.entries(GIG_CATEGORIES).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn-primary flex-1"
                      disabled={loading}
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className="btn-secondary px-4"
                    >
                      {showFilters ? 'Hide' : 'More'} Filters
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Inline Advanced Filters for better performance */}
            {showFilters && (
              <div className="card-glass mb-1 p-1">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-heading text-lg font-semibold">
                    Advanced Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-brand-primary hover:text-brand-primary/80 text-sm"
                  >
                    Clear all
                  </button>
                </div>

                <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Role Required
                    </label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) =>
                        updateFilter('experienceLevel', e.target.value)
                      }
                      className="input w-full"
                    >
                      <option value="">Any Role</option>
                      <option value="influencer">Influencer</option>
                      <option value="crew">Crew</option>
                      <option value="creator">Creator</option>
                      <option value="editor">Editor</option>
                      <option value="photographer">Photographer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Budget Type
                    </label>
                    <select
                      value={filters.budgetType}
                      onChange={(e) =>
                        updateFilter('budgetType', e.target.value)
                      }
                      className="input w-full"
                    >
                      <option value="">All Types</option>
                      <option value="fixed">Fixed Price</option>
                      <option value="hourly">Hourly Rate</option>
                      <option value="negotiable">Negotiable</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        updateFilter('sortBy', e.target.value as any)
                      }
                      className="input w-full"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="budget_high">Highest Budget</option>
                      <option value="budget_low">Lowest Budget</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="City, State"
                      value={filters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Optimized Tabs with performance counter */}
            <div className="flex space-x-1 rounded-none bg-white p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 rounded-none px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Gigs ({totalCount})
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`flex-1 rounded-none px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'featured'
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ⭐ Featured
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 rounded-none bg-red-50 p-4 text-red-700">
              <p>Error loading gigs: {error}</p>
              <button
                onClick={() => loadPublicGigs(filters)}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="border-brand-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
              <span className="ml-2 text-gray-600">
                ⚡ Loading optimized gigs...
              </span>
            </div>
          )}

          {/* Optimized Gigs Grid */}
          {!loading && displayGigs.length > 0 && (
            <div className="grid gap-1 lg:grid-cols-3">
              {displayGigs.map((gig: Gig, index: number) => (
                <Link
                  key={gig.id}
                  href={`/gig/${gig.id}`}
                  className={`card-glass group block p-2 transition-all duration-200 hover:shadow-lg ${
                    index === 0 && activeTab === 'featured'
                      ? 'border-brand-primary/30 bg-brand-light-blue/5 border-2 lg:col-span-2'
                      : ''
                  }`}
                >
                  {/* Header */}
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-brand-primary/10 text-brand-primary rounded px-2 py-1 text-xs font-medium capitalize">
                        {gig.category.replace('-', ' ')}
                      </span>
                      {index === 0 && activeTab === 'featured' && (
                        <span className="bg-brand-primary rounded px-2 py-1 text-xs font-medium text-white">
                          ⭐ Featured
                        </span>
                      )}
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          gig.urgency === 'urgent'
                            ? 'bg-red-100 text-red-600'
                            : gig.urgency === 'normal'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {gig.urgency}
                      </span>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          gig.status === 'OPEN'
                            ? 'bg-green-100 text-green-600'
                            : gig.status === 'ASSIGNED'
                              ? 'bg-blue-100 text-blue-600'
                              : gig.status === 'COMPLETED'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {gig.status}
                      </span>
                    </div>
                    <span className="text-muted text-xs">
                      {new Date(gig.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Brand Info */}
                  {gig.brand && (
                    <div className="mb-2 flex items-center space-x-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                        {gig.brand.name?.[0]?.toUpperCase() || 'B'}
                      </div>
                      <span className="text-sm text-gray-600">
                        {gig.brand.name}
                        {gig.brand.verified && (
                          <span className="ml-1 text-blue-500">✓</span>
                        )}
                      </span>
                    </div>
                  )}

                  <div
                    className={`grid gap-1 ${index === 0 && activeTab === 'featured' ? 'md:grid-cols-3' : ''}`}
                  >
                    <div
                      className={
                        index === 0 && activeTab === 'featured'
                          ? 'md:col-span-2'
                          : ''
                      }
                    >
                      <h3
                        className={`text-heading group-hover:text-brand-primary mb-2 font-semibold transition-colors ${
                          index === 0 && activeTab === 'featured'
                            ? 'text-xl'
                            : 'text-lg'
                        }`}
                      >
                        {gig.title}
                      </h3>
                      <p className="text-muted mb-4 line-clamp-2 text-sm">
                        {gig.description}
                      </p>

                      {/* Skills */}
                      {gig.skillsRequired && gig.skillsRequired.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {gig.skillsRequired
                              .slice(0, 3)
                              .map((skill: string) => (
                                <span
                                  key={skill}
                                  className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                >
                                  {skill}
                                </span>
                              ))}
                            {gig.skillsRequired.length > 3 && (
                              <span className="text-muted text-xs">
                                +{gig.skillsRequired.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Additional details for non-featured */}
                      {!(index === 0 && activeTab === 'featured') && (
                        <div className="text-muted flex items-center space-x-2 text-xs">
                          <span>📍 {gig.location || 'Remote'}</span>
                          <span>⏰ {formatDeadline(gig.deadline)}</span>
                          {gig.experienceLevel && (
                            <span>🎯 {gig.experienceLevel}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price and Action Section */}
                    <div
                      className={`${index === 0 && activeTab === 'featured' ? 'text-center md:text-right' : 'mt-2 flex items-center justify-between'}`}
                    >
                      <div
                        className={
                          index === 0 && activeTab === 'featured'
                            ? ''
                            : 'text-left'
                        }
                      >
                        <div
                          className={`text-heading font-bold ${index === 0 && activeTab === 'featured' ? 'mb-2 text-3xl' : 'text-lg'}`}
                        >
                          {formatBudget(gig)}
                        </div>
                        {index === 0 && activeTab === 'featured' && (
                          <div className="text-muted mb-4 text-sm">
                            {gig.budgetType} price
                          </div>
                        )}
                        <div
                          className={`${index === 0 && activeTab === 'featured' ? 'mb-3' : 'mt-2'}`}
                        >
                          <span className="btn-primary inline-block text-sm font-medium text-white group-hover:text-white">
                            Apply Now →
                          </span>
                        </div>
                        {index === 0 && activeTab === 'featured' && (
                          <div className="text-muted text-xs">
                            {gig.applications?.length || 0} applications •{' '}
                            {formatDeadline(gig.deadline)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && displayGigs.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-muted mb-4 text-6xl">🔍</div>
              <h3 className="text-heading mb-2 text-xl font-semibold">
                No gigs found
              </h3>
              <p className="text-muted mb-6">
                Try adjusting your search criteria or check back later for new
                opportunities.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button onClick={clearFilters} className="btn-secondary">
                  Clear Filters
                </button>
                <Link href="/create-gig" className="btn-primary">
                  Post a Gig
                </Link>
              </div>
            </div>
          )}

          {/* Load More with optimization */}
          {!loading &&
            displayGigs.length > 0 &&
            displayGigs.length >= (filters.limit || 12) && (
              <div className="mt-1 text-center">
                <button
                  onClick={() => updateFilter('page', (filters.page || 1) + 1)}
                  className="btn-ghost px-8 py-1"
                  disabled={loading}
                >
                  Load More Gigs ⚡
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Main optimized page export
export default function OptimizedMarketplacePage() {
  return (
    <OptimizedPageWrapper
      pageType="marketplace"
      enableSkeleton={true}
      enablePreload={true}
    >
      <OptimizedMarketplaceContent />
    </OptimizedPageWrapper>
  );
}
