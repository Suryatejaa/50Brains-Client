'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

interface Gig {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number | null;
  status: string;
  category: string;
  brandName: string;
  brandUsername: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
  };
}

export default function AdminGigsPage() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadGigs();
  }, [filters]);

  const loadGigs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());

      const response = await apiClient.get<any>(
        `/api/gig-admin/gigs?${queryParams.toString()}`
      );
      if (response.success) {
        setGigs((response.data as any) || []);
      }
    } catch (error) {
      console.error('Failed to load gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (gigId: string) => {
    try {
      await apiClient.post(`/api/gig-admin/gigs/${gigId}/approve`);
      loadGigs();
    } catch (error) {
      console.error('Failed to approve gig:', error);
    }
  };

  const handleReject = async (gigId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await apiClient.post(`/api/gig-admin/gigs/${gigId}/reject`, { reason });
      loadGigs();
    } catch (error) {
      console.error('Failed to reject gig:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-heading mb-6 text-2xl font-bold">Gig Management</h1>

        {/* Filters */}
        <div className="card-glass mb-6 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search gigs..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="input-field"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="content-creation">Content Creation</option>
              <option value="photography">Photography</option>
              <option value="video-editing">Video Editing</option>
              <option value="web-development">Web Development</option>
            </select>
            <button onClick={loadGigs} className="btn-primary">
              Refresh
            </button>
          </div>
        </div>

        {/* Gigs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="card-glass p-8 text-center">Loading...</div>
          ) : gigs.length === 0 ? (
            <div className="card-glass p-8 text-center">No gigs found</div>
          ) : (
            gigs.map((gig) => (
              <div key={gig.id} className="card-glass p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-heading text-lg font-semibold">
                        {gig.title}
                      </h3>
                      <span
                        className={`rounded-none px-2 py-1 text-xs font-medium ${
                          gig.status === 'OPEN'
                            ? 'bg-green-100 text-green-700'
                            : gig.status === 'ASSIGNED'
                              ? 'bg-blue-100 text-blue-700'
                              : gig.status === 'COMPLETED'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {gig.status}
                      </span>
                    </div>
                    <p className="text-muted mb-3 text-sm">{gig.description}</p>
                    <div className="text-muted grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                      <div>
                        <span className="font-medium">Brand:</span>{' '}
                        {gig.brandName}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>{' '}
                        {gig.category}
                      </div>
                      <div>
                        <span className="font-medium">Budget:</span> $
                        {gig.budgetMin}
                        {gig.budgetMax ? ` - $${gig.budgetMax}` : '+'}
                      </div>
                      <div>
                        <span className="font-medium">Applications:</span>{' '}
                        {gig._count.applications}
                      </div>
                    </div>
                    <div className="text-muted mt-2 text-xs">
                      Created: {new Date(gig.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(gig.id)}
                      className="rounded-none border border-green-500 bg-green-50 px-3 py-1 text-sm text-green-600 hover:bg-green-100"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(gig.id)}
                      className="rounded-none border border-red-500 bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => (window.location.href = `/gigs/${gig.id}`)}
                      className="rounded-none border border-blue-500 bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
