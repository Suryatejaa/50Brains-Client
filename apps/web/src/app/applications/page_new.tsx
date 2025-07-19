'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Application {
  id: string;
  gigId: string;
  applicantId: string;
  applicantType: 'user' | 'clan';
  proposal: string;
  quotedPrice: number;
  estimatedTime: string;
  portfolio: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  appliedAt: string;
  respondedAt?: string;
  rejectionReason?: string;
  submissionsCount: number;
  gig: {
    id: string;
    title: string;
    description: string;
    budgetMin: number;
    budgetMax: number;
    budgetType: string;
    category: string;
    status: string;
    deadline: string;
    createdAt: string;
    daysOld: number;
    daysUntilDeadline: number;
  };
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-700',
};

export default function ApplicationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'>('ALL');

  const userType = getUserTypeForRole(currentRole);

  // Redirect if not authenticated or not a brand
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userType !== 'brand')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, userType, router]);

  // Load applications
  useEffect(() => {
    if (isAuthenticated && userType === 'brand') {
      loadApplications();
    }
  }, [isAuthenticated, userType]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/applications/received');
      
      if (response.success) {
        // Handle the nested structure: response.data.applications
        const applicationsData = response.data as any;
        setApplications(applicationsData?.applications || []);
      } else {
        setError('Failed to load applications');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await apiClient.put(`/api/applications/${applicationId}/status`, {
        status: newStatus,
      });
      
      if (response.success) {
        setApplications(applications.map(app =>
          app.id === applicationId ? { ...app, status: newStatus as any } : app
        ));
      } else {
        alert('Failed to update application status');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update application status');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'ALL') return true;
    return app.status === filter;
  });

  const formatBudget = (app: Application) => {
    return `₹${app.quotedPrice}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getApplicantName = (applicantId: string) => {
    return `Applicant ${applicantId.slice(-8)}`;
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (userType !== 'brand') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is only available for brand accounts.</p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={loadApplications} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Applications Received</h1>
              <p className="text-gray-600">Manage applications for your gigs</p>
            </div>
            <Link href="/my-gigs" className="btn-primary">
              View My Gigs
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card-glass p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">Filter Applications</h3>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Applications</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 rounded-full"></div>
                <span>Pending: {applications.filter(a => a.status === 'PENDING').length}</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                <span>Accepted: {applications.filter(a => a.status === 'ACCEPTED').length}</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 rounded-full"></div>
                <span>Rejected: {applications.filter(a => a.status === 'REJECTED').length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <div key={application.id} className="card-glass p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {getApplicantName(application.applicantId)[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {getApplicantName(application.applicantId)}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Type: {application.applicantType}</span>
                        <span>Estimated Time: {application.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[application.status]}`}>
                      {application.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied {formatDate(application.appliedAt)}
                    </p>
                  </div>
                </div>

                {/* Gig Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Gig: {application.gig.title}</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <span>Category: {application.gig.category}</span>
                    <span>Budget: ₹{application.gig.budgetMin} - ₹{application.gig.budgetMax}</span>
                    <span>Type: {application.gig.budgetType}</span>
                    <span>Deadline: {formatDate(application.gig.deadline)}</span>
                  </div>
                </div>

                {/* Application Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2">Proposal</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {application.proposal}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Application Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quoted Price:</span>
                          <span className="font-medium">₹{application.quotedPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Time:</span>
                          <span className="font-medium">{application.estimatedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Submissions:</span>
                          <span className="font-medium">{application.submissionsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portfolio */}
                {application.portfolio && application.portfolio.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Portfolio</h4>
                    <div className="space-y-2">
                      {application.portfolio.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:underline text-sm"
                        >
                          Portfolio Item {index + 1}: {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {application.status === 'REJECTED' && application.rejectionReason && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-red-600">Rejection Reason</h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                      {application.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {application.status === 'PENDING' && (
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => handleStatusChange(application.id, 'REJECTED')}
                      className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(application.id, 'ACCEPTED')}
                      className="btn-primary"
                    >
                      Accept
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    href={`/gig/${application.gigId}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Gig Details →
                  </Link>
                  <Link 
                    href={`/gig/${application.gigId}/applications`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Manage All Applications →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-glass p-12 text-center">
            <div className="text-6xl mb-4">📨</div>
            <h3 className="text-xl font-semibold mb-2">No Applications</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'ALL' 
                ? 'No applications received yet.' 
                : `No ${filter.toLowerCase()} applications found.`}
            </p>
            <Link href="/my-gigs" className="btn-primary">
              View My Gigs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
