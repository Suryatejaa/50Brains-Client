'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Bid {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  bidAmount: number;
  proposedDuration: string;
  message: string;
  status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN'
    | 'EXPIRED'
    | 'APPROVED';
  submittedAt: string;
  responseAt?: string;
  projectDeadline: string;
  applicantType: 'owner' | 'user';
  projectBudget: {
    min: number;
    max: number;
    type: string;
  };
  attachments: string[];
  skills: string[];
  equipment: string[];
  location: string;
  isRemote: boolean;
  expiresAt: string;
}

interface BidStats {
  totalBids: number;
  pendingBids: number;
  acceptedBids: number;
  rejectedBids: number;
  approvedBids: number;
  successRate: number;
  avgResponseTime: number;
  totalValue: number;
}

export default function MyBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [stats, setStats] = useState<BidStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'recent',
    page: 1,
    limit: 20,
    search: '',
  });
  const router = useRouter();
  useEffect(() => {
    loadBids();
    loadStats();
  }, [filters]);

  const loadBids = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await apiClient.get(`/api/crew/bids?${params}`);
      if (response.success) {
        // Explicitly type response.data to avoid 'unknown' error
        const data = response.data as { bids: Bid[] };
        //console.log(('Fetched bids:', data.bids);
        setBids(data.bids);
      }
    } catch (error) {
      console.error('Failed to load bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/api/crew/bids/stats');
      if (response.success) {
        setStats(response.data as BidStats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  //POST /applications/:id/accept-invitation
  const handleAcceptAssignment = async (bidId: string) => {
    try {
      const response = await apiClient.post(
        `/api/applications/${bidId}/accept-invitation`
      );
      if (response.success) {
        // Refresh bids and stats
        await loadBids();
        await loadStats();
      }
    } catch (error) {
      console.error('Failed to accept assignment:', error);
    }
  };

  const handleReject = async (bidId: string) => {
    try {
      const response = await apiClient.post(
        `/api/applications/${bidId}/reject-invitation`
      );
      if (response.success) {
        // Refresh bids and stats
        await loadBids();
        await loadStats();
      }
    } catch (error) {
      console.error('Failed to reject bid:', error);
    }
  };

  const handleWithdraw = async (bidId: string) => {
    try {
      const response = await apiClient.delete(`/api/applications/${bidId}`);
      if (response.success) {
        // Refresh bids and stats
        await loadBids();
        await loadStats();
      }
    } catch (error) {
      console.error('Failed to withdraw bid:', error);
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
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      case 'EXPIRED':
        return 'bg-orange-100 text-orange-800';
      case 'APPROVED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-1">
      <div className="mx-auto max-w-6xl px-1">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          <p className="text-gray-600">
            Manage your project bids and track performance
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-1 grid grid-cols-4 gap-1 md:grid-cols-4">
            <div className="card-glass p-1 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalBids}
              </div>
              <div className="text-sm text-gray-600">Total Bids</div>
            </div>
            <div className="card-glass p-1 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingBids}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="card-glass p-1 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.acceptedBids}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="card-glass p-1 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.successRate}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card-glass mb-1 p-1">
          <div className="flex flex-wrap gap-1">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="input"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="input"
            >
              <option value="recent">Most Recent</option>
              <option value="amount">Highest Amount</option>
              <option value="deadline">Earliest Deadline</option>
            </select>

            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="input flex-1"
            />
          </div>
        </div>

        {/* Bids List */}
        {loading ? (
          <div className="card-glass p-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <p>Loading bids...</p>
          </div>
        ) : bids.length === 0 ? (
          <div className="card-glass p-2 text-center">
            <div className="mb-2 text-6xl">📝</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              No bids found
            </h3>
            <p className="mb-2 text-gray-600">
              Start bidding on projects to see them here
            </p>
            <Link href="/marketplace" className="btn-primary">
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="card-glass p-2"
                onClick={() => router.push(`/gig/${bid.projectId}`)}
              >
                <div className="mb-1 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center space-x-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {bid.projectTitle}
                      </h3>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-sm font-medium ${getStatusColor(bid.status)}`}
                    >
                      {bid.status}
                    </span>

                    <p className="mb-1 line-clamp-2 text-sm text-gray-600">
                      {bid.message}
                    </p>

                    <div className="mb-1 grid grid-cols-2 gap-1 text-sm text-gray-500 md:grid-cols-4">
                      <div>
                        <span className="font-medium">Bid Amount:</span>
                        <div className="font-semibold text-green-600">
                          ₹{bid.bidAmount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <div>{bid.proposedDuration}</div>
                      </div>
                      <div>
                        <span className="font-medium">Project Budget:</span>
                        <div>
                          ₹{bid.projectBudget.min.toLocaleString()} - ₹
                          {bid.projectBudget.max.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Deadline:</span>
                        <div>
                          {new Date(bid.projectDeadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {bid.skills.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {bid.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">                  
                    {bid.status === 'PENDING' &&
                      bid.applicantType === 'owner' && (
                        <div className="flex flex-col space-y-1">
                          <button
                            className="btn-primary "
                            onClick={() => handleAcceptAssignment(bid.id)}
                          >
                            Accept
                          </button>
                          <button
                            className="btn-secondary text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(bid.id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                    {bid.status === 'PENDING' &&
                      bid.applicantType !== 'owner' && (
                        <button
                          onClick={() => handleWithdraw(bid.id)}
                          className="btn-secondary-sm text-red-600 hover:bg-red-50"
                        >
                          Withdraw
                        </button>
                      )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Submitted: {new Date(bid.submittedAt).toLocaleDateString()}
                  {bid.responseAt &&
                    ` • Responded: ${new Date(bid.responseAt).toLocaleDateString()}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
