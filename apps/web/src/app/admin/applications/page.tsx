'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

interface Application {
  id: string;
  gigId: string;
  gigTitle: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  message: string;
  appliedAt: string;
  decidedAt?: string;
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    gigId: '',
    search: '',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadApplications();
  }, [filters]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.gigId) queryParams.append('gigId', filters.gigId);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());

      const response = await apiClient.get<any>(
        `/api/gig-admin/applications?${queryParams.toString()}`
      );
      if (response.success) {
        setApplications((response.data as any)?.applications || []);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideDecision = async (
    applicationId: string,
    decision: 'APPROVED' | 'REJECTED'
  ) => {
    const reason = prompt(
      `Enter reason for ${decision === 'APPROVED' ? 'approving' : 'rejecting'} this application:`
    );
    if (!reason) return;

    try {
      await apiClient.post(
        `/api/gig-admin/applications/${applicationId}/override-decision`,
        { decision, reason }
      );
      alert('Decision overridden successfully');
      loadApplications();
    } catch (error) {
      console.error('Failed to override decision:', error);
      alert('Failed to override decision');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return 'bg-green-100 text-green-600';
      case 'rejected':
      case 'declined':
        return 'bg-red-100 text-red-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-heading mb-6 text-2xl font-bold">
          Application Management
        </h1>

        {/* Filters */}
        <div className="card-glass mb-6 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search applications..."
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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
            <input
              type="text"
              placeholder="Filter by Gig ID..."
              value={filters.gigId}
              onChange={(e) =>
                setFilters({ ...filters, gigId: e.target.value })
              }
              className="input-field"
            />
            <button onClick={loadApplications} className="btn-primary">
              Refresh
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="card-glass p-8 text-center">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="card-glass p-8 text-center">
              No applications found
            </div>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="card-glass p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-heading text-lg font-semibold">
                        {app.gigTitle}
                      </h3>
                      <span
                        className={`rounded px-2 py-1 text-xs ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="text-muted space-y-1 text-sm">
                      <p>
                        <strong>Applicant:</strong> {app.applicantName} (
                        {app.applicantEmail})
                      </p>
                      <p>
                        <strong>Applied:</strong>{' '}
                        {new Date(app.appliedAt).toLocaleString()}
                      </p>
                      {app.decidedAt && (
                        <p>
                          <strong>Decided:</strong>{' '}
                          {new Date(app.decidedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {app.message && (
                      <div className="mt-3 rounded-none bg-gray-50 p-3">
                        <p className="text-body text-sm">
                          <strong>Message:</strong> {app.message}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    {app.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() =>
                            handleOverrideDecision(app.id, 'APPROVED')
                          }
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleOverrideDecision(app.id, 'REJECTED')
                          }
                          className="btn-secondary px-4 py-2 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() =>
                        (window.location.href = `/admin/applications/${app.id}`)
                      }
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination would go here */}
      </div>
    </div>
  );
}
