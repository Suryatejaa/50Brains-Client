'use client';

import { useState, useEffect } from 'react';
import { useGigs } from '@/hooks/useGigs';
import { apiClient } from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';

interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  budgetMin: number;
  budgetMax: number;
  deadline?: string;
  createdAt: string;
  isPublic: boolean;
  applicationCount: number;
  gigType: string;
  location: string;
  skillsRequired: string[];
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  verified?: boolean;
  location?: string;
  roles: string[];
}

interface AssignGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onAssignSuccess?: (gigId: string, userId: string) => void;
}

export default function AssignGigModal({
  isOpen,
  onClose,
  user,
  onAssignSuccess,
}: AssignGigModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [showAssignDetailsModal, setShowAssignDetailsModal] = useState(false);
  const [assignmentDetails, setAssignmentDetails] = useState({
    quotedPrice: '',
    estimatedTime: '',
    proposal: '',
  });
  const [isAssigning, setIsAssigning] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const { myPostedGigs, loading, error, loadMyPostedGigs } = useGigs();

  // Show toast notification
  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Load owned gigs when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMyPostedGigs({
        status: ['ACTIVE', 'OPEN', 'ASSIGNED'], // Only assignable gigs
        page: 1,
        limit: 50,
      }).catch((error) => {
        console.error('Failed to load owned gigs:', error);
        showToast('error', 'Failed to load your gigs');
      });
    }
  }, [isOpen, loadMyPostedGigs]);

  // Filter gigs based on search query
  const filteredGigs = myPostedGigs.filter((gig: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      gig.title.toLowerCase().includes(query) ||
      gig.description.toLowerCase().includes(query) ||
      gig.category.toLowerCase().includes(query) ||
      gig.skillsRequired.some((skill: any) =>
        skill.toLowerCase().includes(query)
      )
    );
  });
  console.log('filteredGigs', filteredGigs);
  // Handle gig selection and show assignment details modal
  const handleSelectGig = (gig: Gig) => {
    if (gig.gigType === 'PRODUCT') {
      showToast(
        'error',
        'Assignment is only available for Visit or Remote gigs, not Product gigs'
      );
      return;
    }

    setSelectedGig(gig);
    setAssignmentDetails({
      quotedPrice: gig.budgetMin?.toString() || '',
      estimatedTime: '',
      proposal: `Hi ${user.firstName || user.username}, we'd love to have you work on this project. Your profile matches perfectly with our requirements.`,
    });

    setShowAssignDetailsModal(true);
  };

  // Handle final assignment with details
  const handleFinalAssignment = async () => {
    if (!selectedGig || !user.id) {
      showToast('error', 'Missing required data for assignment');
      return;
    }

    if (
      !assignmentDetails.quotedPrice ||
      !assignmentDetails.estimatedTime ||
      !assignmentDetails.proposal.trim()
    ) {
      showToast('error', 'Please fill in all assignment details');
      return;
    }

    try {
      setIsAssigning(true);
      const response = await apiClient.post(
        `/api/gig/${selectedGig.id}/assign`,
        {
          applicantId: user.id,
          applicantType: 'owner',
          proposal: assignmentDetails.proposal.trim(),
          quotedPrice: Number(assignmentDetails.quotedPrice),
          estimatedTime: assignmentDetails.estimatedTime,
        }
      );

      if (response.success) {
        showToast(
          'success',
          `Successfully assigned ${user.firstName || user.username} to "${selectedGig.title}"`
        );
        setShowAssignDetailsModal(false);
        setSelectedGig(null);
        onAssignSuccess?.(selectedGig.id, user.id);

        // Refresh gigs list
        loadMyPostedGigs({
          status: ['ACTIVE', 'OPEN', 'ASSIGNED'],
          page: 1,
          limit: 50,
        });
      } else {
        showToast('error', response.message || 'Failed to assign user to gig');
      }
    } catch (error: any) {
      console.error('Error assigning user to gig:', error);
      showToast('error', error.message || 'Failed to assign user to gig');
    } finally {
      setIsAssigning(false);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Assign Gig to {user.firstName || user.username}
                </h2>
                <p className="text-sm text-gray-600">
                  Select one of your gigs to assign to this user
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="border-b border-gray-200 px-6 py-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Search your gigs by title, description, category, or skills..."
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading your gigs...</span>
              </div>
            ) : filteredGigs.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">📝</div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  {searchQuery.trim()
                    ? 'No matching gigs found'
                    : 'No assignable gigs found'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery.trim()
                    ? 'Try adjusting your search terms'
                    : 'Create some gigs first or make sure they are active and assignable'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredGigs.map((gig: any) => (
                  <div
                    key={gig.id}
                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                  >
                    {/* Gig Header */}
                    <div className="mb-3">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                          {gig.title}
                        </h3>
                        <span
                          className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
                            gig.status === 'ACTIVE' || gig.status === 'OPEN'
                              ? 'bg-green-100 text-green-800'
                              : gig.status === 'ASSIGNED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {gig.status}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {gig.description}
                      </p>
                    </div>

                    {/* Gig Details */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Budget:</span>
                        <span className="font-medium">
                          {gig.budgetType === 'fixed'
                            ? `₹${(gig.budget || 0).toLocaleString()}`
                            : gig.budgetType === 'hourly'
                              ? `₹${(gig.budgetMin || 0).toLocaleString()}/hr - ₹${(gig.budgetMax || 0).toLocaleString()}/hr`
                              : 'Negotiable'}
                        </span>
                      </div>
                      <div className="flex  items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{gig.category}</span>
                      </div>
                      <div className="flex hidden items-center justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium">{gig.gigType}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Applications:</span>
                        <span className="font-medium">
                          {gig._count.applications}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Submissions:</span>
                        <span className="font-medium">
                          {gig._count.submissions}
                        </span>
                      </div>
                      {gig.deadline && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Deadline:</span>
                          <span className="font-medium">
                            {formatDistanceToNow(new Date(gig.deadline), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {gig.skillsRequired && gig.skillsRequired.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 text-sm font-medium text-gray-700">
                          Required Skills:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {gig.skillsRequired
                            .slice(0, 3)
                            .map((skill: any, index: number) => (
                              <span
                                key={index}
                                className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                              >
                                {skill}
                              </span>
                            ))}
                          {gig.skillsRequired.length > 3 && (
                            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                              +{gig.skillsRequired.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Assign Button */}
                    <button
                      onClick={() => handleSelectGig(gig)}
                      disabled={gig.gigType === 'PRODUCT'}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        gig.gigType === 'PRODUCT'
                          ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {gig.gigType === 'PRODUCT'
                        ? 'Not Assignable'
                        : 'Assign This Gig'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Details Modal */}
      {showAssignDetailsModal && selectedGig && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Assignment Details</h3>

            <div className="mb-4">
              <p className="mb-2 text-sm text-gray-600">
                Assigning <strong>{user.firstName || user.username}</strong> to:
              </p>
              <p className="font-medium">{selectedGig.title}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quoted Price (₹) *
                </label>
                <input
                  type="number"
                  value={assignmentDetails.quotedPrice}
                  onChange={(e) =>
                    setAssignmentDetails((prev) => ({
                      ...prev,
                      quotedPrice: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quoted price"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Estimated Time *
                </label>
                <select
                  value={assignmentDetails.estimatedTime}
                  onChange={(e) =>
                    setAssignmentDetails((prev) => ({
                      ...prev,
                      estimatedTime: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select estimated time</option>
                  <option value="1-3 days">1-3 days</option>
                  <option value="4-7 days">4-7 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="2+ months">2+ months</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Proposal Message *
                </label>
                <textarea
                  value={assignmentDetails.proposal}
                  onChange={(e) =>
                    setAssignmentDetails((prev) => ({
                      ...prev,
                      proposal: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your proposal message..."
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowAssignDetailsModal(false);
                  setSelectedGig(null);
                }}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isAssigning}
              >
                Cancel
              </button>
              <button
                onClick={handleFinalAssignment}
                disabled={
                  isAssigning ||
                  !assignmentDetails.quotedPrice ||
                  !assignmentDetails.estimatedTime ||
                  !assignmentDetails.proposal.trim()
                }
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isAssigning ? 'Assigning...' : 'Assign Gig'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed right-4 top-4 z-[80] max-w-md">
          <div
            className={`rounded-lg border-l-4 p-4 shadow-lg ${
              toast.type === 'success'
                ? 'border-green-500 bg-green-50 text-green-800'
                : toast.type === 'warning'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                  : 'border-red-500 bg-red-50 text-red-800'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <span className="text-green-500">✓</span>
                )}
                {toast.type === 'warning' && (
                  <span className="text-yellow-500">⚠</span>
                )}
                {toast.type === 'error' && (
                  <span className="text-red-500">✕</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
