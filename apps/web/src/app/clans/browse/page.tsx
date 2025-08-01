'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Clan {
  id: string;
  name: string;
  description: string;
  category: string;
  size: number;
  maxMembers: number;
  isPublic: boolean;
  requirements: string[];
  skills: string[];
  language: string;
  timezone: string;
  createdAt: string;
  owner: {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    profilePicture?: string;
  };
  stats: {
    activeProjects: number;
    completedProjects: number;
    totalEarnings: number;
    averageRating: number;
  };
  members: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    role: string;
  }>;
}

const clanCategories = [
  'Content Creation',
  'Video Production',
  'Graphic Design',
  'Social Media',
  'Marketing',
  'Development',
  'Photography',
  'Writing',
  'Consulting',
  'Other'
];

const sizeBrackets = [
  { label: 'Small (2-5 members)', value: 'small', min: 2, max: 5 },
  { label: 'Medium (6-15 members)', value: 'medium', min: 6, max: 15 },
  { label: 'Large (16-50 members)', value: 'large', min: 16, max: 50 },
  { label: 'Enterprise (50+ members)', value: 'enterprise', min: 50, max: 1000 }
];

export default function ClansBrowsePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    category: '',
    size: '',
    language: '',
    search: '',
    isPublic: true,
    hasOpenings: false,
    sortBy: 'newest'
  });

  useEffect(() => {
    loadClans();
  }, [filters, currentPage]);

  const loadClans = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(filters.category && { category: filters.category }),
        ...(filters.size && { size: filters.size }),
        ...(filters.language && { language: filters.language }),
        ...(filters.search && { search: filters.search }),
        isPublic: filters.isPublic.toString(),
        ...(filters.hasOpenings && { hasOpenings: 'true' }),
        sortBy: filters.sortBy
      });

      const response = await apiClient.get(`/api/clan/browse?${params}`);

      if (response.success) {
        setClans((response.data as any)?.clans || []);
        setTotalCount((response.data as any)?.total || 0);
      } else {
        setError('Failed to load clans');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load clans');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleJoinClan = async (clanId: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login' as any);
      return;
    }

    try {
      const response = await apiClient.post(`/api/clan/${clanId}/join`);

      if (response.success) {
        // Refresh clans to show updated membership
        loadClans();
      } else {
        alert('Failed to join clan. Please try again.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to join clan');
    }
  };

  const getClanSizeLabel = (size: number, maxMembers: number) => {
    if (size >= maxMembers) return 'Full';
    const available = maxMembers - size;
    return `${available} spots available`;
  };

  const formatEarnings = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const totalPages = Math.ceil(totalCount / 12);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-1">
          <div className="mx-auto max-w-7xl">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Link href="/clans" className="hover:text-brand-primary">
                Clans
              </Link>
              <span>›</span>
              <Link href="/clans/browse" className="hover:text-brand-primary">
                Browse
              </Link>
            </nav>
            {/* Header */}
            <div className="mb-1">
              <h1 className="text-heading mb-2 text-3xl font-bold">
                Browse Clans
              </h1>
              <p className="text-muted">
                Discover and join creative teams to collaborate on exciting projects
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="card-glass p-3 sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Filter Clans
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
                      placeholder="Search clans..."
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
                      {clanCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Size */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clan Size
                    </label>
                    <select
                      value={filters.size}
                      onChange={(e) => handleFilterChange('size', e.target.value)}
                      className="input w-full"
                    >
                      <option value="">Any Size</option>
                      {sizeBrackets.map((bracket) => (
                        <option key={bracket.value} value={bracket.value}>
                          {bracket.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={filters.language}
                      onChange={(e) => handleFilterChange('language', e.target.value)}
                      className="input w-full"
                    >
                      <option value="">Any Language</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Availability */}
                  <div className="mb-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.hasOpenings}
                        onChange={(e) => handleFilterChange('hasOpenings', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Only show clans with openings
                      </span>
                    </label>
                  </div>

                  {/* Public/Private */}
                  <div className="mb-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.isPublic}
                        onChange={(e) => handleFilterChange('isPublic', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Public clans only
                      </span>
                    </label>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setFilters({
                        category: '',
                        size: '',
                        language: '',
                        search: '',
                        isPublic: true,
                        hasOpenings: false,
                        sortBy: 'newest'
                      });
                      setCurrentPage(1);
                    }}
                    className="btn-ghost w-full"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Clans List */}
              <div className="lg:col-span-3">
                {/* Sort and Results Count */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="text-gray-600">
                    {loading ? 'Loading...' : `${totalCount.toLocaleString()} clans found`}
                  </div>

                  <div className="mt-4 sm:mt-0">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="input w-auto"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="earnings">Highest Earnings</option>
                      <option value="rating">Best Rated</option>
                      <option value="size">Largest First</option>
                    </select>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4">
                    <p className="text-red-600">❌ {error}</p>
                  </div>
                )}

                {/* Clans Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="card-glass p-3 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : clans.length === 0 ? (
                  <div className="card-glass p-8 text-center">
                    <div className="mb-4">
                      <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-2xl">👥</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No clans found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your filters or create your own clan
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => {
                          setFilters({
                            category: '',
                            size: '',
                            language: '',
                            search: '',
                            isPublic: true,
                            hasOpenings: false,
                            sortBy: 'newest'
                          });
                          setCurrentPage(1);
                        }}
                        className="btn-secondary"
                      >
                        Clear Filters
                      </button>
                      <Link href={"/clans/create" as any} className="btn-primary">
                        Create Your Own Clan
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {clans.map((clan) => (
                      <div key={clan.id} className="card-glass p-3 hover:shadow-lg transition-shadow">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Link
                              href={`/clan/${clan.id}` as any}
                              className="text-lg font-semibold text-gray-900 hover:text-brand-primary line-clamp-1"
                            >
                              {clan.name}
                            </Link>
                            <p className="text-sm text-gray-600">{clan.category}</p>
                          </div>

                          {!clan.isPublic && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                              Private
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {clan.description}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-none">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{clan.size}/{clan.maxMembers}</p>
                            <p className="text-xs text-gray-600">Members</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{clan.stats.activeProjects}</p>
                            <p className="text-xs text-gray-600">Active Projects</p>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="flex items-center justify-between mb-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total Earnings:</span>
                            <span className="font-semibold text-green-600 ml-1">
                              {formatEarnings(clan.stats.totalEarnings)}
                            </span>
                          </div>

                          {clan.stats.averageRating > 0 && (
                            <div className="flex items-center space-x-1">
                              {renderStars(clan.stats.averageRating)}
                              <span className="text-gray-600 text-xs">
                                ({clan.stats.averageRating.toFixed(1)})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        {clan.skills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {clan.skills.slice(0, 3).map((skill) => (
                                <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                              {clan.skills.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  +{clan.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Members Preview */}
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex -space-x-2">
                            {clan.members.slice(0, 3).map((member, index) => (
                              <div key={member.id} className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                                {member.profilePicture ? (
                                  <img
                                    src={member.profilePicture}
                                    alt="Member"
                                    className="w-8 h-8 rounded-none object-cover"
                                  />
                                ) : (
                                  (member.firstName || 'U')[0]?.toUpperCase()
                                )}
                              </div>
                            ))}
                            {clan.members.length > 3 && (
                              <div className="w-8 h-8 bg-gray-400 rounded-none flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                                +{clan.members.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            {clan.size} members
                          </span>
                        </div>

                        {/* Owner */}
                        <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                          <span>👑</span>
                          <span>
                            Led by {clan.owner.displayName ||
                              `${clan.owner.firstName || ''} ${clan.owner.lastName || ''}`.trim() ||
                              'Anonymous'}
                          </span>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {getClanSizeLabel(clan.size, clan.maxMembers)}
                          </div>

                          <div className="flex space-x-2">
                            <Link
                              href={`/clan/${clan.id}` as any}
                              className="btn-ghost-sm"
                            >
                              View Details
                            </Link>

                            {clan.size < clan.maxMembers && isAuthenticated && (
                              <button
                                onClick={() => handleJoinClan(clan.id)}
                                className="btn-primary-sm"
                              >
                                Join Clan
                              </button>
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
                            className={`px-3 py-1 rounded text-sm ${currentPage === page
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
