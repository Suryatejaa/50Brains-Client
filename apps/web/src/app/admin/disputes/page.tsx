'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

interface Dispute {
  id: string;
  gigId: string;
  gigTitle: string;
  type: string;
  priority: string;
  status: string;
  description: string;
  reporterId: string;
  reporterName: string;
  createdAt: string;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadDisputes();
  }, [filters]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());

      const response = await apiClient.get<any>(
        `/api/gig-admin/disputes?${queryParams.toString()}`
      );
      if (response.success) {
        setDisputes((response.data as any)?.disputes || []);
      }
    } catch (error) {
      console.error('Failed to load disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId: string) => {
    const resolution = prompt('Enter resolution description:');
    if (!resolution) return;

    const compensationAmount = prompt(
      'Compensation amount (optional, enter 0 for none):'
    );
    const notes = prompt('Additional notes (optional):');

    try {
      await apiClient.post(`/api/gig-admin/disputes/${disputeId}/resolve`, {
        resolution,
        compensationAmount: compensationAmount
          ? parseFloat(compensationAmount)
          : 0,
        notes,
      });
      alert('Dispute resolved successfully');
      loadDisputes();
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      alert('Failed to resolve dispute');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-600';
      case 'high':
        return 'bg-orange-100 text-orange-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-heading mb-6 text-2xl font-bold">
          Dispute Management
        </h1>

        {/* Filters */}
        <div className="card-glass mb-6 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="input-field"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button onClick={loadDisputes} className="btn-primary">
              Refresh
            </button>
          </div>
        </div>

        {/* Disputes List */}
        <div className="space-y-4">
          {loading ? (
            <div className="card-glass p-8 text-center">Loading...</div>
          ) : disputes.length === 0 ? (
            <div className="card-glass p-8 text-center">
              <span className="mb-2 block text-4xl">✅</span>
              <p className="text-muted">No disputes found</p>
            </div>
          ) : (
            disputes.map((dispute) => (
              <div key={dispute.id} className="card-glass p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-heading text-lg font-semibold">
                        {dispute.gigTitle}
                      </h3>
                      <span
                        className={`rounded px-2 py-1 text-xs ${getPriorityColor(dispute.priority)}`}
                      >
                        {dispute.priority}
                      </span>
                    </div>
                    <div className="text-muted space-y-1 text-sm">
                      <p>Type: {dispute.type}</p>
                      <p>Reporter: {dispute.reporterName}</p>
                      <p>Status: {dispute.status}</p>
                      <p>
                        Created:{' '}
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-3 rounded-none bg-gray-50 p-3">
                      <p className="text-body text-sm">{dispute.description}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleResolve(dispute.id)}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = `/admin/disputes/${dispute.id}`)
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
      </div>
    </div>
  );
}
