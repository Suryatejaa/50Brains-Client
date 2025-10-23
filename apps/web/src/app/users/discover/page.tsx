'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  title?: string;
  location?: string;
  experience: string;
  skills: string[];
  categories: string[];
  languages: string[];
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  responseTime: string;
  completedProjects: number;
  successRate: number;
  reputation: number;
  averageRating: number;
  reviewCount: number;
  portfolio: Array<{
    id: string;
    title: string;
    image?: string;
    category: string;
  }>;
  isOnline: boolean;
  lastSeen: string;
  verified: boolean;
  badges: string[];
}

const experienceLevels = [
  'Entry Level (0-1 years)',
  'Intermediate (2-4 years)',
  'Experienced (5-7 years)',
  'Expert (8+ years)',
];

const availabilityOptions = [
  {
    value: 'available',
    label: 'Available',
    color: 'bg-green-100 text-green-700',
  },
  { value: 'busy', label: 'Busy', color: 'bg-yellow-100 text-yellow-700' },
  {
    value: 'unavailable',
    label: 'Unavailable',
    color: 'bg-red-100 text-red-700',
  },
];

const skillCategories = [
  'Content Creation',
  'Video Production',
  'Graphic Design',
  'Social Media Marketing',
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Photography',
  'Writing & Editing',
  'Digital Marketing',
  'SEO/SEM',
  'Data Analysis',
  'Consulting',
  'Project Management',
  'Other',
];

export default function UsersDiscoveryPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    category: '',
    experience: '',
    availability: '',
    location: '',
    minRating: '',
    maxRate: '',
    skills: [] as string[],
    search: '',
    onlineOnly: false,
    verifiedOnly: false,
    sortBy: 'reputation',
  });

  const [showSkillsFilter, setShowSkillsFilter] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filters, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(filters.category && { category: filters.category }),
        ...(filters.experience && { experience: filters.experience }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minRating && { minRating: filters.minRating }),
        ...(filters.maxRate && { maxRate: filters.maxRate }),
        ...(filters.search && { search: filters.search }),
        ...(filters.onlineOnly && { onlineOnly: 'true' }),
        ...(filters.verifiedOnly && { verifiedOnly: 'true' }),
        sortBy: filters.sortBy,
      });

      if (filters.skills.length > 0) {
        params.append('skills', filters.skills.join(','));
      }

      const response = await apiClient.get(`/api/users/discover?${params}`);

      if (response.success) {
        setUsers((response.data as any)?.users || []);
        setTotalCount((response.data as any)?.total || 0);
      } else {
        setError('Failed to load users');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    key: string,
    value: string | boolean | string[]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSkillToggle = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
    setCurrentPage(1);
  };

  const handleConnectUser = async (userId: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login' as any);
      return;
    }

    try {
      const response = await apiClient.post(`/api/users/${userId}/connect`);

      if (response.success) {
        alert('Connection request sent successfully!');
      } else {
        alert('Failed to send connection request. Please try again.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to send connection request');
    }
  };

  const formatRate = (rate: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rate);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  const getAvailabilityStyle = (availability: string) => {
    const option = availabilityOptions.find(
      (opt) => opt.value === availability
    );
    return option ? option.color : 'bg-gray-100 text-gray-700';
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const totalPages = Math.ceil(totalCount / 12);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-heading mb-2 text-3xl font-bold">
                Discover Talent
              </h1>
              <p className="text-muted">
                Find skilled creators and collaborators for your next project
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="card-glass sticky top-24 p-3">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Filter Talent
                  </h3>

                  {/* Search */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Search
                    </label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange('search', e.target.value)
                      }
                      placeholder="Search by name, skills, title..."
                      className="input w-full"
                    />
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange('category', e.target.value)
                      }
                      className="input w-full"
                    >
                      <option value="">All Categories</option>
                      {skillCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Experience Level
                    </label>
                    <select
                      value={filters.experience}
                      onChange={(e) =>
                        handleFilterChange('experience', e.target.value)
                      }
                      className="input w-full"
                    >
                      <option value="">Any Experience</option>
                      {experienceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Availability */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Availability
                    </label>
                    <select
                      value={filters.availability}
                      onChange={(e) =>
                        handleFilterChange('availability', e.target.value)
                      }
                      className="input w-full"
                    >
                      <option value="">Any Availability</option>
                      {availabilityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Skills
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSkillsFilter(!showSkillsFilter)}
                      className="input flex w-full items-center justify-between text-left"
                    >
                      <span>
                        {filters.skills.length === 0
                          ? 'Select skills...'
                          : `${filters.skills.length} skills selected`}
                      </span>
                      <span>{showSkillsFilter ? '▲' : '▼'}</span>
                    </button>

                    {showSkillsFilter && (
                      <div className="mt-2 max-h-48 overflow-y-auto rounded-none border border-gray-200 p-2">
                        {skillCategories.map((skill) => (
                          <label
                            key={skill}
                            className="flex items-center space-x-2 rounded p-2 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={filters.skills.includes(skill)}
                              onChange={() => handleSkillToggle(skill)}
                              className="rounded"
                            />
                            <span className="text-sm">{skill}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.minRating}
                      onChange={(e) =>
                        handleFilterChange('minRating', e.target.value)
                      }
                      className="input w-full"
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="4.8">4.8+ Stars</option>
                    </select>
                  </div>

                  {/* Max Hourly Rate */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Max Hourly Rate
                    </label>
                    <input
                      type="number"
                      value={filters.maxRate}
                      onChange={(e) =>
                        handleFilterChange('maxRate', e.target.value)
                      }
                      placeholder="$150"
                      className="input w-full"
                    />
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange('location', e.target.value)
                      }
                      placeholder="City, Country"
                      className="input w-full"
                    />
                  </div>

                  {/* Quick Filters */}
                  <div className="mb-6 space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.onlineOnly}
                        onChange={(e) =>
                          handleFilterChange('onlineOnly', e.target.checked)
                        }
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Online now
                      </span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.verifiedOnly}
                        onChange={(e) =>
                          handleFilterChange('verifiedOnly', e.target.checked)
                        }
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Verified only
                      </span>
                    </label>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setFilters({
                        category: '',
                        experience: '',
                        availability: '',
                        location: '',
                        minRating: '',
                        maxRate: '',
                        skills: [],
                        search: '',
                        onlineOnly: false,
                        verifiedOnly: false,
                        sortBy: 'reputation',
                      });
                      setCurrentPage(1);
                    }}
                    className="btn-ghost w-full"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Users List */}
              <div className="lg:col-span-3">
                {/* Sort and Results Count */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-gray-600">
                    {loading
                      ? 'Loading...'
                      : `${(totalCount || 0).toLocaleString()} creators found`}
                  </div>

                  <div className="mt-4 sm:mt-0">
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange('sortBy', e.target.value)
                      }
                      className="input w-auto"
                    >
                      <option value="reputation">Highest Reputation</option>
                      <option value="rating">Best Rated</option>
                      <option value="recent">Recently Active</option>
                      <option value="experience">Most Experienced</option>
                      <option value="rate-low">Lowest Rate</option>
                      <option value="rate-high">Highest Rate</option>
                    </select>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4">
                    <p className="text-red-600">❌ {error}</p>
                  </div>
                )}

                {/* Users Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="card-glass animate-pulse p-3">
                        <div className="mb-4 flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                          <div className="flex-1">
                            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                            <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                          </div>
                        </div>
                        <div className="mb-2 h-3 w-full rounded bg-gray-200"></div>
                        <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="card-glass p-8 text-center">
                    <div className="mb-4">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                        <span className="text-2xl">👤</span>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        No creators found
                      </h3>
                      <p className="mb-6 text-gray-600">
                        Try adjusting your filters to find more creators
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setFilters({
                          category: '',
                          experience: '',
                          availability: '',
                          location: '',
                          minRating: '',
                          maxRate: '',
                          skills: [],
                          search: '',
                          onlineOnly: false,
                          verifiedOnly: false,
                          sortBy: 'reputation',
                        });
                        setCurrentPage(1);
                      }}
                      className="btn-secondary"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="card-glass p-3 transition-shadow hover:shadow-lg"
                      >
                        {/* Header */}
                        <div className="mb-4 flex items-start space-x-3">
                          <div className="relative">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 font-semibold text-white">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt="User"
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                (user.firstName ||
                                  user.displayName ||
                                  'U')[0]?.toUpperCase()
                              )}
                            </div>
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/profile/${user.id}` as any}
                                className="hover:text-brand-primary truncate font-semibold text-gray-900"
                              >
                                {user.displayName ||
                                  `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                                  'Anonymous User'}
                              </Link>
                              {user.verified && (
                                <span className="text-sm text-blue-500">✓</span>
                              )}
                            </div>
                            <p className="truncate text-sm text-gray-600">
                              {user.title || 'Creative Professional'}
                            </p>
                            {user.location && (
                              <p className="text-xs text-gray-500">
                                📍 {user.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="mb-3 flex items-center justify-between">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${getAvailabilityStyle(user.availability)}`}
                          >
                            {user.availability.charAt(0).toUpperCase() +
                              user.availability.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.isOnline
                              ? 'Online now'
                              : `Last seen ${timeAgo(user.lastSeen)}`}
                          </span>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                            {user.bio}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="mb-4 grid grid-cols-2 gap-4 rounded-none bg-gray-50 p-3 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-gray-900">
                              {user.completedProjects}
                            </p>
                            <p className="text-xs text-gray-600">Projects</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-gray-900">
                              {user.successRate}%
                            </p>
                            <p className="text-xs text-gray-600">
                              Success Rate
                            </p>
                          </div>
                        </div>

                        {/* Rating and Rate */}
                        <div className="mb-4 flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            {renderStars(user.averageRating)}
                            <span className="text-xs text-gray-600">
                              ({user.reviewCount})
                            </span>
                          </div>

                          {user.hourlyRate && (
                            <div className="text-right">
                              <p className="font-semibold text-green-600">
                                {formatRate(user.hourlyRate)}/hr
                              </p>
                              <p className="text-xs text-gray-600">
                                {user.responseTime} response
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        {user.skills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {user.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                                >
                                  {skill}
                                </span>
                              ))}
                              {user.skills.length > 3 && (
                                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                  +{user.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Badges */}
                        {user.badges.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {user.badges.slice(0, 2).map((badge) => (
                                <span
                                  key={badge}
                                  className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700"
                                >
                                  🏆 {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reputation */}
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-gray-600">Reputation:</span>
                            <span className="text-brand-primary ml-1 font-semibold">
                              ⭐ {(user.reputation || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Portfolio Preview */}
                        {user.portfolio.length > 0 && (
                          <div className="mb-4">
                            <p className="mb-2 text-sm font-medium text-gray-700">
                              Recent Work
                            </p>
                            <div className="flex space-x-2">
                              {user.portfolio.slice(0, 3).map((item) => (
                                <div
                                  key={item.id}
                                  className="h-16 w-16 overflow-hidden rounded-full bg-gray-200"
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                                      {item.category[0]?.toUpperCase()}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Link
                            href={`/profile/${user.id}` as any}
                            className="btn-ghost-sm flex-1 text-center"
                          >
                            View Profile
                          </Link>

                          {isAuthenticated && user.id !== user?.id && (
                            <button
                              onClick={() => handleConnectUser(user.id)}
                              className="btn-primary-sm flex-1"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="btn-ghost-sm"
                    >
                      ← Previous
                    </button>

                    <div className="flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page =
                            currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                          if (page > totalPages) return null;

                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`rounded px-3 py-1 text-sm ${
                                currentPage === page
                                  ? 'bg-brand-primary text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
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
