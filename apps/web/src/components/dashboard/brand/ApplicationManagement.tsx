// components/dashboard/brand/ApplicationManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { brandApiClient, GigApplication } from '@/lib/brand-api-client';
import LoadingSpinner from '@/frontend-profile/components/common/LoadingSpinner';

interface ApplicationManagementProps {
  gigId?: string; // If provided, show applications for specific gig
}

interface ApplicationFilters {
  status: '' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  gigId: string;
  search: string;
}

export const ApplicationManagement: React.FC<ApplicationManagementProps> = ({
  gigId,
}) => {
  const [applications, setApplications] = useState<GigApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ApplicationFilters>({
    status: '',
    gigId: gigId || '',
    search: '',
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, [filters.status, filters.gigId]);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      if (filters.gigId) {
        // Load applications for specific gig
        const response = await brandApiClient.getGigApplications(filters.gigId);

        if (response.success && response.data) {
          setApplications(response.data.applications);
        } else {
          setError(response.error || 'Failed to load applications');
        }
      } else {
        // Load all applications across all gigs
        // Note: This would need a dedicated endpoint in the API
        setApplications([]);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    const finalBudget = prompt('Enter final budget amount:');
    if (!finalBudget || isNaN(Number(finalBudget))) return;

    const notes = prompt('Add any notes (optional):') || '';

    setActionLoading(applicationId);

    try {
      const response = await brandApiClient.acceptApplication(applicationId, {
        finalBudget: Number(finalBudget),
        notes,
      });

      if (response.success) {
        loadApplications(); // Refresh list
      } else {
        alert(response.error || 'Failed to accept application');
      }
    } catch (error) {
      alert('An unexpected error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    const feedback = prompt('Additional feedback (optional):') || '';

    setActionLoading(applicationId);

    try {
      const response = await brandApiClient.rejectApplication(applicationId, {
        reason,
        feedback,
      });

      if (response.success) {
        loadApplications(); // Refresh list
      } else {
        alert(response.error || 'Failed to reject application');
      }
    } catch (error) {
      alert('An unexpected error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filters.status && app.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = String(filters.search || '').toLowerCase();
      return (
        String(app.applicant?.firstName || '')
          .toLowerCase()
          .includes(searchLower) ||
        String(app.applicant?.lastName || '')
          .toLowerCase()
          .includes(searchLower) ||
        String(app.coverLetter || '')
          .toLowerCase()
          .includes(searchLower)
      );
    }
    return true;
  });

  if (error) {
    return (
      <div className="rounded-none bg-white p-3 shadow-lg">
        <div className="text-center">
          <span className="mb-4 block text-4xl">⚠️</span>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Unable to Load Applications
          </h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button onClick={loadApplications} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {gigId ? 'Gig Applications' : 'All Applications'}
        </h2>
        <p className="text-gray-600">
          Review and manage influencer applications
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-none border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              placeholder="Search by influencer name or message..."
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
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadApplications}
              className="w-full rounded-none bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="rounded-none border bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-8 text-center">
            <span className="mb-4 block text-4xl">📨</span>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No Applications Found
            </h3>
            <p className="text-gray-600">
              {filters.search || filters.status
                ? 'No applications match your current filters'
                : gigId
                  ? 'No applications received for this gig yet'
                  : 'No applications received yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredApplications.map((application) => (
              <div key={application.id} className="p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-none bg-gradient-to-r from-blue-500 to-purple-500">
                        <span className="text-sm font-semibold text-white">
                          {application.applicant.firstName[0]}
                          {application.applicant.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.applicant.firstName}{' '}
                          {application.applicant.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Primary Platform:{' '}
                          {application.applicant.primaryPlatform} |{' '}
                          {(application.applicant.followers || 0).toLocaleString()}{' '}
                          followers
                        </p>
                        <p className="text-xs text-gray-400">
                          Niche: {application.applicant.niche} | Avg Engagement:{' '}
                          {application.applicant.avgEngagement}%
                        </p>
                      </div>
                      <span
                        className={`rounded-none px-2 py-1 text-xs font-medium ${getStatusColor(application.status)}`}
                      >
                        {application.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="mb-2 font-medium text-gray-900">
                        Proposed Budget
                      </h4>
                      <p className="text-lg font-bold text-green-600">
                        ₹{(application.proposedBudget || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="mb-2 font-medium text-gray-900">
                        Cover Letter
                      </h4>
                      <p className="rounded bg-gray-50 p-3 text-gray-600">
                        {application.coverLetter}
                      </p>
                    </div>

                    {application.portfolio &&
                      application.portfolio.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-2 font-medium text-gray-900">
                            Portfolio
                          </h4>
                          <div className="space-y-2">
                            {application.portfolio.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded bg-gray-50 p-2"
                              >
                                <div>
                                  <div className="font-medium">
                                    {item.title}
                                  </div>
                                  {item.metrics && (
                                    <div className="mt-1 text-xs text-gray-400">
                                      Views: {item.metrics.views} | Engagement:{' '}
                                      {item.metrics.engagement}%
                                    </div>
                                  )}
                                </div>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  View →
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="text-sm text-gray-500">
                      Applied on:{' '}
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {application.status === 'PENDING' && (
                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => handleAcceptApplication(application.id)}
                        disabled={actionLoading === application.id}
                        className="flex items-center space-x-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading === application.id ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          <span>✓</span>
                        )}
                        <span>Accept</span>
                      </button>

                      <button
                        onClick={() => handleRejectApplication(application.id)}
                        disabled={actionLoading === application.id}
                        className="flex items-center space-x-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading === application.id ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          <span>✗</span>
                        )}
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() =>
                          (window.location.href = `/influencer/${application.applicant.id}`)
                        }
                        className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        View Profile
                      </button>
                    </div>
                  )}

                  {application.status === 'ACCEPTED' && (
                    <div className="ml-4 flex flex-col space-y-2">
                      <div className="rounded bg-green-100 px-4 py-2 text-center text-green-800">
                        ✓ Accepted
                      </div>
                      <button
                        onClick={() =>
                          (window.location.href = `/collaboration/${application.id}`)
                        }
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        Manage Project
                      </button>
                      <button
                        onClick={() =>
                          (window.location.href = `/influencer/${application.applicant.id}`)
                        }
                        className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        View Profile
                      </button>
                    </div>
                  )}

                  {application.status === 'REJECTED' && (
                    <div className="ml-4 flex flex-col space-y-2">
                      <div className="rounded bg-red-100 px-4 py-2 text-center text-red-800">
                        ✗ Rejected
                      </div>
                      <button
                        onClick={() =>
                          (window.location.href = `/influencer/${application.applicant.id}`)
                        }
                        className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        View Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
