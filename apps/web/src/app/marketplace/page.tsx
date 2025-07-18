'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGigs } from '@/hooks/useGigs';
import type { Gig, GigFilters } from '@/types/gig.types';
import {
  GIG_CATEGORIES,
  EXPERIENCE_LEVELS,
  BUDGET_TYPES,
} from '@/types/gig.types';

export default function MarketplacePage() {
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
    category: [],
    experienceLevel: '',
    budgetType: 'fixed',
    budgetMin: undefined,
    budgetMax: undefined,
    location: '',
    sortBy: 'recent',
    page: 1,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'featured'>('all');

  // Load initial data
  useEffect(() => {
    loadCategories();
    if (activeTab === 'featured') {
      loadFeaturedGigs();
    } else {
      loadPublicGigs(filters);
    }
  }, [activeTab, filters, loadCategories, loadFeaturedGigs, loadPublicGigs]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchGigs(searchQuery, filters);
    } else {
      await loadPublicGigs(filters);
    }
  };

  const updateFilter = (key: keyof GigFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      experienceLevel: '',
      budgetType: 'fixed',
      budgetMin: undefined,
      budgetMax: undefined,
      location: '',
      sortBy: 'recent',
      page: 1,
      limit: 12,
    });
    setSearchQuery('');
  };

  const formatBudget = (gig: Gig) => {
    if (gig.budgetType === 'negotiable') return 'Negotiable';
    if (gig.budgetMin && gig.budgetMax) {
      const prefix = gig.budgetType === 'hourly' ? '/hr' : '';
      return `₹${gig.budgetMin} - ₹${gig.budgetMax}${prefix}`;
    }
    return 'Budget not specified';
  };

  const formatDeadline = (deadline?: string) => {
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
  };

  console.log(gigs)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-heading mb-2 text-3xl font-bold">
                  Marketplace
                </h1>
                <p className="text-muted">
                  Discover amazing opportunities and collaborate with top
                  creators
                </p>
              </div>
              <Link href="/create-gig" className="btn-primary px-6 py-3">
                Post a Gig
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="card-glass p-3">
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Search gigs by title, description, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input w-full"
                    />
                  </div>

                  {/* Quick Category Filter */}
                  <div>
                    <select
                      value={filters.category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="input w-full"
                    >
                      <option value="">All Categories</option>
                      {Object.entries(GIG_CATEGORIES).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Button */}
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

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="card-glass mb-4 p-3">
                <div className="mb-4 flex items-center justify-between">
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Experience Level */}
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Experience Level
                    </label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) =>
                        updateFilter('experienceLevel', e.target.value)
                      }
                      className="input w-full"
                    >
                      <option value="">Any Level</option>
                      {Object.entries(EXPERIENCE_LEVELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget Type */}
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
                      {Object.entries(BUDGET_TYPES).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
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

                  {/* Location/Remote */}
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Location
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="City, State"
                        value={filters.location}
                        onChange={(e) =>
                          updateFilter('location', e.target.value)
                        }
                        className="input w-full"
                      />                     
                    </div>
                  </div>
                </div>

                {/* Budget Range */}
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Min Budget ($)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.budgetMin || ''}
                      onChange={(e) =>
                        updateFilter(
                          'budgetMin',
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Max Budget ($)
                    </label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={filters.budgetMax || ''}
                      onChange={(e) =>
                        updateFilter(
                          'budgetMax',
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 rounded-lg bg-white p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Gigs ({gigs.length})
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'featured'
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ⭐ Featured
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-700">
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
              <span className="ml-2 text-gray-600">Loading gigs...</span>
            </div>
          )}

          {/* Gigs Grid */}
          {!loading && gigs.length > 0 && (
            <div className="grid gap-3 lg:grid-cols-2">
              {gigs.map((gig, index) => (
                <Link
                  key={gig.id}
                  href={`/gig/${gig.id}` as any}
                  className={`card-glass group block p-3 transition-all duration-200 hover:shadow-lg ${
                    index === 0 && activeTab === 'featured'
                      ? 'border-brand-primary/30 bg-brand-light-blue/5 border-2 lg:col-span-2'
                      : ''
                  }`}
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
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
                    </div>
                    <span className="text-muted text-xs">
                      {new Date(gig.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div
                    className={`grid gap-3 ${index === 0 && activeTab === 'featured' ? 'md:grid-cols-3' : ''}`}
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
                            {gig.skillsRequired.slice(0, 3).map((skill) => (
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
                        <div className="text-muted flex items-center space-x-4 text-xs">
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
                      className={`${index === 0 && activeTab === 'featured' ? 'text-center md:text-right' : 'mt-4 flex items-center justify-between'}`}
                    >
                      <div
                        className={
                          index === 0 && activeTab === 'featured'
                            ? ''
                            : 'text-right'
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
                          <span className="btn-primary text-white group-hover:text-white inline-block text-sm font-medium">
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
          {!loading && gigs.length === 0 && (
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

          {/* Load More */}
          {!loading &&
            gigs.length > 0 &&
            gigs.length >= (filters.limit || 12) && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => {
                    const nextPage = (filters.page || 1) + 1;
                    updateFilter('page', nextPage);
                  }}
                  className="btn-ghost px-8 py-3"
                  disabled={loading}
                >
                  Load More Gigs
                </button>
              </div>
            )}

          {/* Quick Actions */}
          <div className="fixed bottom-6 right-6">
            <Link
              href="/create-gig"
              className="bg-brand-primary hover:bg-brand-primary/90 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-colors"
              title="Create New Gig"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
