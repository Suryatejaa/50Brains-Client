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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'APPROVED';
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
  APPROVED: 'bg-blue-100 text-blue-700',
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
      console.log('Loading applications...');
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/applications/received');
      
      if (response.success) {
        // Handle the nested structure: response.data.applications
        const applicationsData = response.data as any;
        console.log('Applications loaded successfully:', applicationsData?.applications?.length || 0, 'applications');
        setApplications(applicationsData?.applications || []);
      } else {
        console.error('Failed to load applications:', response);
        setError('Failed to load applications');
      }
    } catch (error: any) {
      console.error('Error loading applications:', error);
      setError(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      console.log('Updating application status:', applicationId, 'to', newStatus);
      const response = await apiClient.post(`/api/gig/applications/${applicationId}/${newStatus === 'APPROVED' ? 'approve' : 'reject'}`);
      
      if (response.success) {
        console.log('Application status updated successfully, refreshing data...');
        // Refresh the applications list to get updated data from server
        await loadApplications();
        console.log('Data refreshed successfully');
        alert(`Application ${newStatus.toLowerCase()} successfully!`);
      } else {
        console.error('Failed to update application status:', response);
        alert('Failed to update application status');
      }
    } catch (error: any) {
      console.error('Error updating application status:', error);
      alert(error?.message || error || 'Failed to update application status');
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
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="mx-auto max-w-7xl px-2 sm:px-2 lg:px-2">
        {/* Header */}
        <div className="mb-2">
          <div className="flex flex-col lg:flex-row md:flex-row gap-1 items-left justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Applications Received</h1>
              <p className="text-gray-600">Manage applications for your gigs</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadApplications}
                className="btn-secondary"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
              <Link href="/my-gigs" className="btn-primary">
                View My Gigs
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-glass p-2 mb-2">
          <div className="flex flex-col lg:flex-row md:flex-row gap-1 items-left justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="flex text-lg font-semibold">Filter Applications</h3>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="pr-8 px-1 py-0 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Applications</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 rounded-none"></div>
                <span>Pending: {applications.filter(a => a.status === 'PENDING').length}</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 rounded-none"></div>
                <span>Approved: {applications.filter(a => a.status === 'APPROVED').length}</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 rounded-none"></div>
                <span>Rejected: {applications.filter(a => a.status === 'REJECTED').length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-2">
            {filteredApplications.map((application) => (
              <div key={application.id} className="card-glass p-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-none flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {getApplicantName(application.applicantId)[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {getApplicantName(application.applicantId)}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Type: {application.applicantType}</span>
                        <span>Estimated Time: {application.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0 rounded-none text-sm font-medium ${statusColors[application.status]}`}>
                      {application.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied {formatDate(application.appliedAt)}
                    </p>
                  </div>
                </div>

                {/* Gig Details */}
                <div className="bg-gray-50 p-2 rounded-none mb-2">
                  <h4 className="font-semibold mb-2">Gig: {application.gig.title}</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <span>Category: {application.gig.category}</span>
                    <span>Budget: ₹{application.gig.budgetMin} - ₹{application.gig.budgetMax}</span>
                    <span>Type: {application.gig.budgetType}</span>
                    <span>Deadline: {formatDate(application.gig.deadline)}</span>
                  </div>
                </div>

                {/* Application Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold mb-2">Proposal</h4>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded-none whitespace-pre-wrap">
                      {application.proposal}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold mb-2">Application Details</h4>
                      <div className="space-y-1 text-sm">
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
                  <div className="mb-2">
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
                  <div className="mb-2">
                    <h4 className="font-semibold mb-2 text-red-600">Rejection Reason</h4>
                    <p className="text-gray-700 bg-red-50 p-2 rounded-none">
                      {application.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {application.status === 'PENDING' && (
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleStatusChange(application.id, 'REJECTED')}
                      className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(application.id, 'APPROVED')}
                      className="btn-primary"
                    >
                      Approve
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
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
          <div className="card-glass p-2 text-center">
            <div className="text-6xl mb-2">📨</div>
            <h3 className="text-xl font-semibold mb-2">No Applications</h3>
            <p className="text-gray-600 mb-2">
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
