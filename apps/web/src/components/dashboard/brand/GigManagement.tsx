// components/dashboard/brand/GigManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { brandApiClient, BrandGig } from '@/lib/brand-api-client';
import LoadingSpinner from '@/frontend-profile/components/common/LoadingSpinner';

interface GigManagementProps {
  onCreateNew?: () => void;
}

interface GigFilters {
  status: '' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  category: string;
  search: string;
}

export const GigManagement: React.FC<GigManagementProps> = ({
  onCreateNew,
}) => {
  const [gigs, setGigs] = useState<BrandGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GigFilters>({
    status: '',
    category: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    loadGigs();
  }, [filters.status, pagination.currentPage]);

  const loadGigs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page: pagination.currentPage,
        limit: 10,
      };

      if (filters.status) params.status = filters.status;

      const response = await brandApiClient.getMyGigs(params);

      if (response.success && response.data) {
        setGigs(response.data.gigs);
        setPagination({
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.total,
        });
      } else {
        setError(response.error || 'Failed to load gigs');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    gigId: string,
    newStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
  ) => {
    try {
      const response = await brandApiClient.updateGig(gigId, {
        status: newStatus,
      });

      if (response.success) {
        // Refresh the gigs list
        loadGigs();
      } else {
        alert(response.error || 'Failed to update gig status');
      }
    } catch (error) {
      alert('An unexpected error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGigs = gigs.filter((gig) => {
    if (filters.search) {
      return (
        String(gig.title || '')
          .toLowerCase()
          .includes(String(filters.search || '').toLowerCase()) ||
        String(gig.description || '')
          .toLowerCase()
          .includes(String(filters.search || '').toLowerCase())
      );
    }
    if (filters.category) {
      return gig.category === filters.category;
    }
    return true;
  });

  if (error) {
    return (
      <div className="rounded-none bg-white p-3 shadow-lg">
        <div className="text-center">
          <span className="mb-4 block text-4xl">⚠️</span>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Unable to Load Gigs
          </h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button onClick={loadGigs} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Gigs</h2>
          <p className="text-gray-600">
            View and manage your posted collaborations
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="btn-primary flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Create New Gig</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-none border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search gigs..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as any,
                }))
              }
              className="w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Fashion & Beauty">Fashion & Beauty</option>
              <option value="Technology">Technology</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Travel & Lifestyle">Travel & Lifestyle</option>
              <option value="Health & Fitness">Health & Fitness</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Business">Business</option>
              <option value="Sports">Sports</option>
              <option value="Art & Design">Art & Design</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadGigs}
              className="w-full rounded-none bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Gigs List */}
      <div className="rounded-none border bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600">Loading gigs...</p>
          </div>
        ) : filteredGigs.length === 0 ? (
          <div className="p-8 text-center">
            <span className="mb-4 block text-4xl">📝</span>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No Gigs Found
            </h3>
            <p className="mb-4 text-gray-600">
              {filters.search || filters.status || filters.category
                ? 'No gigs match your current filters'
                : "You haven't created any gigs yet"}
            </p>
            <button onClick={onCreateNew} className="btn-primary">
              Create Your First Gig
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredGigs.map((gig) => (
              <div key={gig.id} className="p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {gig.title}
                      </h3>
                      <span
                        className={`rounded-none px-2 py-1 text-xs font-medium ${getStatusColor(gig.status)}`}
                      >
                        {gig.status}
                      </span>
                    </div>

                    <p className="mb-3 line-clamp-2 text-gray-600">
                      {gig.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 md:grid-cols-4">
                      <div>
                        <span className="font-medium">Budget:</span>
                        <br />₹{gig.budget.toLocaleString() ?? 0}
                      </div>
                      <div>
                        <span className="font-medium">Applications:</span>
                        <br />
                        {gig.applicationsCount} / {gig.maxApplications}
                      </div>
                      <div>
                        <span className="font-medium">Views:</span>
                        <br />
                        {gig.viewsCount}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <br />
                        {gig.category}
                      </div>
                    </div>

                    {gig.deadline && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Deadline:</span>{' '}
                        {new Date(gig.deadline).toLocaleDateString()}
                      </div>
                    )}

                    {gig.preferredPlatforms.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {gig.preferredPlatforms.map((platform, index) => (
                          <span
                            key={index}
                            className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => (window.location.href = `/gig/${gig.id}`)}
                      className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() =>
                        (window.location.href = `/gig/${gig.id}/applications`)
                      }
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    >
                      Applications ({gig.applicationsCount})
                    </button>

                    {gig.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleStatusChange(gig.id, 'PAUSED')}
                        className="rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700"
                      >
                        Pause
                      </button>
                    )}

                    {gig.status === 'PAUSED' && (
                      <button
                        onClick={() => handleStatusChange(gig.id, 'ACTIVE')}
                        className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                      >
                        Activate
                      </button>
                    )}

                    {(gig.status === 'ACTIVE' || gig.status === 'PAUSED') && (
                      <button
                        onClick={() => {
                          if (
                            confirm('Are you sure you want to cancel this gig?')
                          ) {
                            handleStatusChange(gig.id, 'CANCELLED');
                          }
                        }}
                        className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() =>
                        (window.location.href = `/gig/${gig.id}/edit`)
                      }
                      className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-gray-500">
              Showing {(pagination.currentPage - 1) * 10 + 1} to{' '}
              {Math.min(pagination.currentPage * 10, pagination.totalItems)} of{' '}
              {pagination.totalItems} gigs
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
                disabled={pagination.currentPage === 1}
                className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="rounded bg-blue-100 px-3 py-1 text-blue-800">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
                disabled={pagination.currentPage === pagination.totalPages}
                className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
