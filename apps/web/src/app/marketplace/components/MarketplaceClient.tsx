// app/marketplace/components/MarketplaceClient.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useGigs } from '@/hooks/useGigs';
import type { Gig, GigFilters } from '@/types/gig.types';

// CLIENT-SIDE PROGRESSIVE ENHANCEMENT
export function MarketplaceClient() {
  const { gigs, loading, error, loadPublicGigs, searchGigs, loadFeaturedGigs } =
    useGigs();

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

  const [activeTab, setActiveTab] = useState<'all' | 'featured'>('all');

  // Load initial data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeTab === 'featured') {
          await loadFeaturedGigs();
        } else {
          await loadPublicGigs(filters);
        }
      } catch (error) {
        console.error('Failed to load marketplace data:', error);
      }
    };

    loadData();
  }, [activeTab]); // Only reload when tab changes

  // Optimized gig filtering and sorting
  const displayGigs = useMemo(() => {
    let filteredGigs = gigs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredGigs = gigs.filter((gig) => {
        const searchableContent = [
          gig.title,
          gig.description,
          gig.category,
          gig.brand?.name,
          ...(gig.skillsRequired || []),
        ]
          .join(' ')
          .toLowerCase();
        return searchableContent.includes(query);
      });
    }

    // Apply other filters
    if (filters.category) {
      filteredGigs = filteredGigs.filter(
        (gig) => gig.category === filters.category
      );
    }

    // Sort gigs
    return [...filteredGigs].sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }, [gigs, searchQuery, filters]);

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

  // Handle search with enhanced form
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchGigs(searchQuery, filters);
    } else {
      await loadPublicGigs(filters);
    }
  };

  // Enhanced search input that works with SSR form
  useEffect(() => {
    // Get search params from URL (for SSR compatibility)
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');

    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (categoryParam) {
      setFilters((prev) => ({ ...prev, category: categoryParam }));
    }
  }, []);

  if (error) {
    return (
      <div className="mb-8 rounded-none bg-red-50 p-4 text-red-700">
        <p>Error loading gigs: {error}</p>
        <button
          onClick={() => loadPublicGigs(filters)}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (loading && displayGigs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-brand-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">⚡ Loading gigs...</span>
      </div>
    );
  }

  if (displayGigs.length === 0) {
    return (
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
          <button
            onClick={() => {
              setSearchQuery('');
              setFilters((prev) => ({ ...prev, category: '' }));
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
          <Link href="/create-gig" className="btn-primary">
            Post a Gig
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Search Form - Progressive Enhancement */}
      <div className="mb-4 hidden rounded border bg-white p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Enhance your search with real-time filtering..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Enhanced Tabs - Progressive Enhancement */}
      <div className="mb-4 flex space-x-1 rounded-none bg-white p-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 rounded-none px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-700 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Gigs ({displayGigs.length})
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

      {/* Gigs Grid - Enhanced with real-time interactions */}
      <div className="grid gap-1 lg:grid-cols-3">
        {displayGigs.map((gig: Gig, index: number) => (
          <Link
            key={gig.id}
            href={`/gig/${gig.id}`}
            className="card-glass group block p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-brand-primary/10 text-brand-primary rounded px-2 py-1 text-xs font-medium capitalize">
                  {gig.category.replace('-', ' ')}
                </span>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    gig.status === 'OPEN'
                      ? 'bg-green-100 text-green-600'
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
              <div className="mb-3 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
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

            {/* Title & Description */}
            <h3 className="text-heading group-hover:text-brand-primary mb-2 text-lg font-semibold transition-colors">
              {gig.title}
            </h3>
            <p className="text-muted mb-4 line-clamp-2 text-sm">
              {gig.description}
            </p>

            {/* Skills */}
            {gig.skillsRequired && gig.skillsRequired.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {gig.skillsRequired.slice(0, 3).map((skill: string) => (
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

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-heading text-lg font-bold">
                  {formatBudget(gig)}
                </div>
                <div className="text-muted text-xs">
                  ⏰ {formatDeadline(gig.deadline)}
                </div>
              </div>
              <span className="btn-primary inline-block text-sm font-medium text-white group-hover:text-white">
                Apply Now →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {displayGigs.length >= (filters.limit || 12) && (
        <div className="mt-8 text-center">
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                limit: (prev.limit || 12) + 12,
              }))
            }
            className="rounded bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Gigs ⚡'}
          </button>
        </div>
      )}
    </>
  );
}
