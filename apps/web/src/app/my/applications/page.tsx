'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface Gig {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  budgetType: string;
  status: string;
  deadline: string;
  createdAt: string;
}

interface Application {
  id: string;
  gigId: string;
  applicantId: string;
  applicantType: string;
  proposal: string;
  quotedPrice: number;
  estimatedTime: string;
  portfolio: string[] | { title: string; url: string }[];
  status: string;
  appliedAt: string;
  respondedAt: string;
  rejectionReason: string | null;
  gig: Gig;
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Under Review' },
  APPROVED: { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Approved' },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: '❌', label: 'Rejected' },
  CLOSED: { color: 'bg-blue-100 text-blue-800', icon: '🎉', label: 'Completed' },
  CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: '⚪', label: 'Cancelled' }
};

export default function MyApplicationsPage() {``
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadApplications();
    }
  }, [isAuthenticated, user]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/my/applications');

      console.log(response);
      if (response.success && response.data) {
        const { applications = [] } = response.data as { applications: Application[] };
        setApplications(applications);
        console.log(applications);
        // Calculate stats
        setStats({
          total: applications.length,
          pending: applications.filter((app: Application) => app.status === 'PENDING').length,
          approved: applications.filter((app: Application) => app.status === 'APPROVED').length,
          completed: applications.filter((app: Application) => app.status === 'COMPLETED').length
        });
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    filter === 'ALL' || app.status === filter
  );
  const router = useRouter();
  const withdrawApplication = async (applicationId: string) => {
    try {
      const response = await apiClient.delete(`/api/applications/${applicationId}`);
      if (response.success) {
        await loadApplications(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to withdraw application:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your applications.</p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="mx-auto max-w-6xl px-2 sm:px-6 lg:px-2">
        {/* Header */}
        <div className="mb-2">
          <div className="flex flex-col md:flex-row items-left justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600">Track your campaign applications and collaborations</p>
            </div>
            <div className="space-x-1 mt-2">
              <Link href="/marketplace" className="btn-secondary">
                Browse
              </Link>
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-1">
          <div className="card-glass p-1 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-gray-600">Total Applications</div>
          </div>
          <div className="card-glass p-1 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-600">Under Review</div>
          </div>
          <div className="card-glass p-1 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="card-glass p-1 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-glass p-1 mb-1">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-none font-medium transition-colors ${filter === status
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status === 'ALL' ? 'All Applications' : status.toLowerCase().replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="card-glass p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading your applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="card-glass p-4 text-center">
            <div className="text-5xl mb-2">📝</div>
            <h3 className="text-xl font-semibold mb-2">
              {filter === 'ALL' ? 'No Applications Yet' : `No ${filter.toLowerCase()} applications`}
            </h3>
            <p className="text-gray-600 mb-2">
              {filter === 'ALL'
                ? 'Start applying to gigs to see them here!'
                : `You don't have any ${filter.toLowerCase()} applications at the moment.`}
            </p>
            <Link href="/marketplace" className="btn-primary">
              Browse Available Gigs
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredApplications.map((application) => {
              const config = statusConfig[application.status as keyof typeof statusConfig];
              const isWithdrawable = application.status === 'PENDING';
              return (
                <div key={application.id} className="card-glass p-2"
                  onClick={() => router.push(`/gig/${application.gigId}`)}

                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.gig.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-none text-sm font-medium ${config?.color}`}>
                        {config?.icon} {config?.label}
                      </span>
                      {isWithdrawable && (
                        <button
                          onClick={() => withdrawApplication(application.id)}
                          className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Budget</label>
                      <div className="text-lg font-semibold text-green-600">
                        ₹{application.gig.budgetMin.toLocaleString()} - ₹{application.gig.budgetMax.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-500">Deadline</label>
                      <div className="text-lg">
                        {new Date(application.gig.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-500">Applied</label>
                      <div className="text-lg">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="text-sm font-bold text-gray-500">Description</label>
                    <p className="text-gray-800 mt-1">{application.gig.description}</p>
                  </div>

                  {application.portfolio && application.portfolio.length > 0 && (
                    <div className="mb-2">
                      <label className="text-sm font-bold text-gray-500">Submitted Portfolio</label>
                      <div className="mt-2 space-y-2">
                        {application.portfolio.map((item, index) => {
                          if (typeof item === 'string') {
                            return (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm">{item}</span>
                                <a
                                  href={item}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View →
                                </a>
                              </div>
                            );
                          } else {
                            return (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm">{item.title}</span>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View →
                                </a>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="text-sm text-gray-500">
                      Application ID: {application.id}
                    </div>
                    <div className="space-x-2">                     
                      {application.status === 'ACCEPTED' && (
                        <Link
                          href={`/collaboration/${application.id}` as any}
                          className="btn-primary btn-sm"
                        >
                          Manage Collaboration
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-none p-3">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Link href="/marketplace" className="btn-secondary text-center">
              🔍 Browse New Gigs
            </Link>
            <Link href="/profile" className="btn-secondary text-center">
              👤 Update Profile
            </Link>
            <Link href="/portfolio" className="btn-secondary text-center">
              📁 Manage Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
