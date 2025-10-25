'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  skills: string[];
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'ANY';
  location?: string;
  isRemote: boolean;
  deadline?: string;
  budgetType: 'FIXED' | 'HOURLY' | 'NEGOTIABLE';
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  applicationCount: number;
  viewCount: number;
  isUrgent: boolean;
  isFeatured: boolean;
  createdAt: string;
  poster?: {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    profilePicture?: string;
    averageRating: number;
    reviewCount: number;
  };
}

const categories = [
  'Content Creation',
  'Social Media',
  'Video Production',
  'Photography',
  'Graphic Design',
  'Writing',
  'Marketing',
  'Development',
  'Consulting',
  'Other'
];

const experienceLevels = [
  { value: 'ANY', label: 'Any Level' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'EXPERT', label: 'Expert' }
];

export default function GigsBrowsePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    experienceLevel: searchParams.get('experience') || '',
    isRemote: searchParams.get('remote') === 'true',
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    location: searchParams.get('location') || '',
    search: searchParams.get('q') || '',
    sortBy: searchParams.get('sort') || 'recent'
  });

  useEffect(() => {
    loadGigs();
  }, [filters, currentPage]);

  const loadGigs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.category && { category: filters.category }),
        ...(filters.experienceLevel && { experienceLevel: filters.experienceLevel }),
        ...(filters.isRemote && { isRemote: 'true' }),
        ...(filters.minBudget && { minBudget: filters.minBudget }),
        ...(filters.maxBudget && { maxBudget: filters.maxBudget }),
        ...(filters.location && { location: filters.location }),
        ...(filters.search && { search: filters.search }),
        sortBy: filters.sortBy
      });
      
      const response = await apiClient.get(`/api/gigs/browse?${params}`);
      
      if (response.success) {
        setGigs((response.data as any)?.gigs || []);
        setTotalCount((response.data as any)?.total || 0);
      } else {
        setError('Failed to load gigs');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    
    // Update URL
    const newParams = new URLSearchParams();
    const newFilters = { ...filters, [key]: value };
    
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '') {
        newParams.set(k === 'search' ? 'q' : k, v.toString());
      }
    });
    
    router.push(`/gigs/browse?${newParams.toString()}`, { scroll: false });
  };

  const formatBudget = (gig: Gig) => {
    if (gig.budgetType === 'NEGOTIABLE') return 'Negotiable';
    if (gig.budgetMin && gig.budgetMax) {
      return `${gig.currency} ${gig.budgetMin.toLocaleString() ?? 0} - ${gig.budgetMax.toLocaleString() ?? 0}`;
    }
    if (gig.budgetMin) {
      return `${gig.currency} ${gig.budgetMin.toLocaleString() ?? 0}+`;
    }
    return 'Budget not specified';
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-heading mb-2 text-3xl font-bold">
                Browse Gigs
              </h1>
              <p className="text-muted">
                Discover opportunities that match your skills and interests
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="card-glass p-3 sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Filter Gigs
                  </h3>
                  
                  {/* Search */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search gigs..."
                      className="input w-full"
                    />
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="input w-full"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                      className="input w-full"
                    >
                      {experienceLevels.map((level) => (
                        <option key={level.value} value={level.value === 'ANY' ? '' : level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minBudget}
                        onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                        className="input"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxBudget}
                        onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="City, Country"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="input w-full"
                    />
                  </div>

                  {/* Remote Work */}
                  <div className="mb-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.isRemote}
                        onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Remote work only
                      </span>
                    </label>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setFilters({
                        category: '',
                        experienceLevel: '',
                        isRemote: false,
                        minBudget: '',
                        maxBudget: '',
                        location: '',
                        search: '',
                        sortBy: 'recent'
                      });
                      setCurrentPage(1);
                      router.push('/gigs/browse');
                    }}
                    className="btn-ghost w-full"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Gigs List */}
              <div className="lg:col-span-3">
                {/* Sort and Results Count */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="text-gray-600">
                    {loading ? 'Loading...' : `${totalCount.toLocaleString() ?? 0} gigs found`}
                  </div>
                  
                  <div className="mt-4 sm:mt-0">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="input w-auto"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="budget_high">Highest Budget</option>
                      <option value="budget_low">Lowest Budget</option>
                      <option value="deadline">Deadline Soon</option>
                      <option value="applications">Most Applications</option>
                    </select>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4">
                    <p className="text-red-600">❌ {error}</p>
                  </div>
                )}

                {/* Gigs */}
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="card-glass p-3 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : gigs.length === 0 ? (
                  <div className="card-glass p-8 text-center">
                    <div className="mb-4">
                      <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-2xl">🔍</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No gigs found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your filters to see more opportunities
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setFilters({
                          category: '',
                          experienceLevel: '',
                          isRemote: false,
                          minBudget: '',
                          maxBudget: '',
                          location: '',
                          search: '',
                          sortBy: 'recent'
                        });
                        setCurrentPage(1);
                        router.push('/gigs/browse');
                      }}
                      className="btn-primary"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {gigs.map((gig) => (
                      <div key={gig.id} className="card-glass p-3 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            {/* Header */}
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <Link
                                href={`/gig/${gig.id}` as any}
                                className="text-lg font-semibold text-gray-900 hover:text-brand-primary"
                              >
                                {gig.title}
                              </Link>
                              
                              {gig.isFeatured && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                  Featured
                                </span>
                              )}
                              
                              {gig.isUrgent && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                  Urgent
                                </span>
                              )}
                              
                              {gig.isRemote && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  Remote
                                </span>
                              )}
                            </div>
                            
                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {gig.description}
                            </p>
                            
                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                              <span>🏷️ {gig.category}</span>
                              <span>💰 {formatBudget(gig)}</span>
                              <span>📊 {gig.experienceLevel}</span>
                              {gig.location && <span>📍 {gig.location}</span>}
                              <span>👥 {gig.applicationCount} applications</span>
                              <span>👁️ {gig.viewCount} views</span>
                              <span>📅 {formatDate(gig.createdAt)}</span>
                              {gig.deadline && (
                                <span className="text-red-600">⏰ Due {formatDate(gig.deadline)}</span>
                              )}
                            </div>
                            
                            {/* Skills */}
                            {gig.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {gig.skills.slice(0, 5).map((skill) => (
                                  <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                                {gig.skills.length > 5 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    +{gig.skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Poster Info */}
                            {gig.poster && (
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white text-xs font-semibold">
                                  {gig.poster.profilePicture ? (
                                    <img 
                                      src={gig.poster.profilePicture} 
                                      alt="Profile" 
                                      className="w-6 h-6 rounded-none object-cover"
                                    />
                                  ) : (
                                    (gig.poster.displayName || gig.poster.firstName || 'U')[0]?.toUpperCase()
                                  )}
                                </div>
                                
                                <span className="text-sm text-gray-600">
                                  {gig.poster.displayName || 
                                   `${gig.poster.firstName || ''} ${gig.poster.lastName || ''}`.trim() || 
                                   'Anonymous'}
                                </span>
                                
                                {gig.poster.averageRating > 0 && (
                                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    {renderStars(gig.poster.averageRating)}
                                    <span>{gig.poster.averageRating.toFixed(1)}</span>
                                    <span>({gig.poster.reviewCount})</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2 lg:min-w-[120px]">
                            <Link
                              href={`/gig/${gig.id}` as any}
                              className="btn-primary-sm text-center"
                            >
                              View Details
                            </Link>
                            
                            {isAuthenticated && (
                              <Link
                                href={`/gig/${gig.id}/apply` as any}
                                className="btn-ghost-sm text-center"
                              >
                                Apply Now
                              </Link>
                            )}
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
      </div>
    </div>
  );
}
