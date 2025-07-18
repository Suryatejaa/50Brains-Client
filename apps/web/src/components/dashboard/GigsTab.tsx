// components/dashboard/GigsTab.tsx - Dashboard tab for gig management

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGigs } from '@/hooks/useGigs';
import type { Gig } from '@/types/gig.types';

interface GigsTabProps {
  userRole: 'INFLUENCER' | 'BRAND' | 'CREW';
}

export function GigsTab({ userRole }: GigsTabProps) {
  const {
    myPostedGigs,
    myDraftGigs,
    myApplications,
    myActiveGigs,
    myCompletedGigs,
    gigStats,
    loading,
    error,
    loadMyPostedGigs,
    loadMyDraftGigs,
    loadMyApplications,
    loadMyActiveGigs,
    loadMyCompletedGigs,
    loadMyGigStats,
    deleteGig,
    publishGig,
    closeGig,
  } = useGigs();

  const [activeSubTab, setActiveSubTab] = useState<
    'posted' | 'applications' | 'active' | 'completed' | 'drafts'
  >('posted');

  // Load data based on user role
  useEffect(() => {
    loadMyGigStats();

    // Brands typically post gigs, others typically apply
    if (userRole === 'BRAND') {
      loadMyPostedGigs();
      loadMyDraftGigs();
      setActiveSubTab('posted');
    } else {
      loadMyApplications();
      loadMyActiveGigs();
      setActiveSubTab('applications');
    }

    loadMyCompletedGigs();
  }, [
    userRole,
    loadMyPostedGigs,
    loadMyDraftGigs,
    loadMyApplications,
    loadMyActiveGigs,
    loadMyCompletedGigs,
    loadMyGigStats,
  ]);

  const handleDeleteGig = async (gigId: string) => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        await deleteGig(gigId);
        alert('Gig deleted successfully');
      } catch (error) {
        alert('Failed to delete gig');
      }
    }
  };

  const handlePublishGig = async (gigId: string) => {
    try {
      await publishGig(gigId);
      alert('Gig published successfully');
    } catch (error) {
      alert('Failed to publish gig');
    }
  };

  const handleCloseGig = async (gigId: string) => {
    if (window.confirm('Are you sure you want to close this gig?')) {
      try {
        await closeGig(gigId);
        alert('Gig closed successfully');
      } catch (error) {
        alert('Failed to close gig');
      }
    }
  };

  const formatBudget = (gig: Gig) => {
    if (gig.budgetType === 'negotiable') return 'Negotiable';
    if (gig.budgetMin && gig.budgetMax) {
      const suffix = gig.budgetType === 'hourly' ? '/hr' : '';
      return `$${gig.budgetMin} - $${gig.budgetMax}${suffix}`;
    }
    return 'Budget not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-brand-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading gigs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        <p>Error loading gigs: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {gigStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card-glass p-4 text-center">
            <div className="text-brand-primary text-2xl font-bold">
              {gigStats.totalGigs}
            </div>
            <div className="text-sm text-gray-600">Total Gigs</div>
          </div>
          <div className="card-glass p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {gigStats.completedGigs}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="card-glass p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {gigStats.inProgressGigs}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="card-glass p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${gigStats.totalEarnings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
        {userRole === 'BRAND' && (
          <>
            <button
              onClick={() => setActiveSubTab('posted')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeSubTab === 'posted'
                  ? 'text-brand-primary bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Posted Gigs ({myPostedGigs.length})
            </button>
            <button
              onClick={() => setActiveSubTab('drafts')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeSubTab === 'drafts'
                  ? 'text-brand-primary bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Drafts ({myDraftGigs.length})
            </button>
          </>
        )}

        {(userRole === 'INFLUENCER' || userRole === 'CREW') && (
          <button
            onClick={() => setActiveSubTab('applications')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeSubTab === 'applications'
                ? 'text-brand-primary bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Applications ({myApplications.length})
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('active')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeSubTab === 'active'
              ? 'text-brand-primary bg-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active ({myActiveGigs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('completed')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeSubTab === 'completed'
              ? 'text-brand-primary bg-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({myCompletedGigs.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {/* Posted Gigs (Brand) */}
        {activeSubTab === 'posted' && userRole === 'BRAND' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Posted Gigs</h3>
              <Link href="/create-gig" className="btn-primary">
                Create New Gig
              </Link>
            </div>

            {myPostedGigs.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4 text-4xl text-gray-400">📝</div>
                <h4 className="mb-2 text-lg font-medium text-gray-900">
                  No posted gigs yet
                </h4>
                <p className="mb-4 text-gray-600">
                  Start by creating your first gig to find talented creators.
                </p>
                <Link href="/create-gig" className="btn-primary">
                  Create Your First Gig
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myPostedGigs.map((gig) => (
                  <div key={gig.id} className="card-glass p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-1">
                          <h4 className="text-lg font-semibold">{gig.title}</h4>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(gig.status)}`}
                          >
                            {gig.status}
                          </span>
                        </div>
                        <p className="mb-3 line-clamp-2 text-gray-600">
                          {gig.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>💰 {formatBudget(gig)}</span>
                          <span>📅 Posted {formatDate(gig.createdAt)}</span>
                          <span>
                            📧 {gig.applications?.length || 0} applications
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <Link
                          href={`/gig/${gig.id}` as any}
                          className="btn-secondary text-sm"
                        >
                          View
                        </Link>
                        {gig.status === 'OPEN' && (
                          <button
                            onClick={() => handleCloseGig(gig.id)}
                            className="btn-secondary text-sm"
                          >
                            Close
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteGig(gig.id)}
                          className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Draft Gigs (Brand) */}
        {activeSubTab === 'drafts' && userRole === 'BRAND' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Draft Gigs</h3>
              <Link href="/create-gig" className="btn-primary">
                Create New Gig
              </Link>
            </div>

            {myDraftGigs.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4 text-4xl text-gray-400">📋</div>
                <h4 className="mb-2 text-lg font-medium text-gray-900">
                  No draft gigs
                </h4>
                <p className="text-gray-600">
                  Your saved draft gigs will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myDraftGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="card-glass border-l-4 border-yellow-400 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="mb-2 text-lg font-semibold">
                          {gig.title}
                        </h4>
                        <p className="mb-3 line-clamp-2 text-gray-600">
                          {gig.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>💰 {formatBudget(gig)}</span>
                          <span>📝 Saved {formatDate(gig.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <Link
                          href={`/create-gig?edit=${gig.id}` as any}
                          className="btn-secondary text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handlePublishGig(gig.id)}
                          className="btn-primary text-sm"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => handleDeleteGig(gig.id)}
                          className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications (Influencer/Crew) */}
        {activeSubTab === 'applications' &&
          (userRole === 'INFLUENCER' || userRole === 'CREW') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">My Applications</h3>
                <Link href="/marketplace" className="btn-primary">
                  Browse Gigs
                </Link>
              </div>

              {myApplications.length === 0 ? (
                <div className="card-glass p-8 text-center">
                  <div className="mb-4 text-4xl text-gray-400">📬</div>
                  <h4 className="mb-2 text-lg font-medium text-gray-900">
                    No applications yet
                  </h4>
                  <p className="mb-4 text-gray-600">
                    Browse the marketplace to find gigs that match your skills.
                  </p>
                  <Link href="/marketplace" className="btn-primary">
                    Explore Opportunities
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((application) => (
                    <div key={application.id} className="card-glass p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <h4 className="text-lg font-semibold">
                              {application.gig?.title}
                            </h4>
                            <span
                              className={`rounded px-2 py-1 text-xs font-medium ${getApplicationStatusColor(application.status)}`}
                            >
                              {application.status}
                            </span>
                          </div>
                          <p className="mb-3 line-clamp-2 text-gray-600">
                            {application.proposal}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>💰 ${application.quotedPrice}</span>
                            <span>
                              📅 Applied {formatDate(application.appliedAt)}
                            </span>
                            {application.estimatedTime && (
                              <span>⏱️ {application.estimatedTime}</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <Link
                            href={`/gig/${application.gigId}` as any}
                            className="btn-secondary text-sm"
                          >
                            View Gig
                          </Link>
                          {application.status === 'PENDING' && (
                            <button className="btn-secondary text-sm text-red-600 hover:bg-red-50">
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                      {application.rejectionReason && (
                        <div className="mt-3 rounded bg-red-50 p-3 text-sm">
                          <strong>Rejection reason:</strong>{' '}
                          {application.rejectionReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Active Gigs */}
        {activeSubTab === 'active' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Gigs</h3>

            {myActiveGigs.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4 text-4xl text-gray-400">⚡</div>
                <h4 className="mb-2 text-lg font-medium text-gray-900">
                  No active gigs
                </h4>
                <p className="text-gray-600">
                  Your active projects will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myActiveGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="card-glass border-l-4 border-blue-400 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="mb-2 text-lg font-semibold">
                          {gig.title}
                        </h4>
                        <p className="mb-3 line-clamp-2 text-gray-600">
                          {gig.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>💰 {formatBudget(gig)}</span>
                          <span>📅 Started {formatDate(gig.createdAt)}</span>
                          {gig.deadline && (
                            <span>⏰ Due {formatDate(gig.deadline)}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <Link
                          href={`/gig/${gig.id}` as any}
                          className="btn-primary text-sm"
                        >
                          Work on Gig
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Completed Gigs */}
        {activeSubTab === 'completed' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Completed Gigs</h3>

            {myCompletedGigs.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4 text-4xl text-gray-400">🎉</div>
                <h4 className="mb-2 text-lg font-medium text-gray-900">
                  No completed gigs yet
                </h4>
                <p className="text-gray-600">
                  Your finished projects will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myCompletedGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="card-glass border-l-4 border-green-400 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="mb-2 text-lg font-semibold">
                          {gig.title}
                        </h4>
                        <p className="mb-3 line-clamp-2 text-gray-600">
                          {gig.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>💰 {formatBudget(gig)}</span>
                          <span>
                            ✅ Completed{' '}
                            {gig.completedAt
                              ? formatDate(gig.completedAt)
                              : 'Recently'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <Link
                          href={`/gig/${gig.id}` as any}
                          className="btn-secondary text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GigsTab;
