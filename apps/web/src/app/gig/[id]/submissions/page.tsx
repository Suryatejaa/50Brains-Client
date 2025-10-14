'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { useParams, useRouter } from 'next/navigation';
import { GigAPI } from '@/lib/gig-api';
import { Submission, SubmissionStatus } from '@/types/gig.types';
import { toast } from 'react-hot-toast';

export default function GigSubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { currentRole, getUserTypeForRole } = useRoleSwitch();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({
        status: SubmissionStatus.APPROVED,
        rating: 5,
        feedback: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const gigId = params.id as string;
    const userType = getUserTypeForRole(currentRole);

    useEffect(() => {
        if (isAuthenticated && user) {
            loadSubmissions();
        }
    }, [isAuthenticated, user, gigId]);

    const loadSubmissions = async () => {
        try {
            setIsLoading(true);
            const data = await GigAPI.getGigSubmissions(gigId);
            console.log('Loaded submissions:', data);
            setSubmissions(data);
        } catch (error) {
            console.error('Failed to load submissions:', error);
            toast.error('Failed to load submissions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReview = async () => {
        if (!selectedSubmission) return;

        try {
            setIsSubmitting(true);

            if (reviewData.status === 'APPROVED') {
                await GigAPI.approveSubmission(selectedSubmission.id, reviewData.rating, reviewData.feedback);
                toast.success('Work approved successfully!');
            } else if (reviewData.status === 'REJECTED') {
                await GigAPI.rejectSubmission(selectedSubmission.id, reviewData.feedback);
                toast.success('Work rejected');
            } else if (reviewData.status === 'REVISION') {
                await GigAPI.requestRevision(selectedSubmission.id, reviewData.feedback);
                toast.success('Revision requested');
            }

            // Reload submissions
            await loadSubmissions();
            setShowReviewModal(false);
            setSelectedSubmission(null);
            setReviewData({ status: SubmissionStatus.APPROVED, rating: 5, feedback: '' });
        } catch (error) {
            console.error('Failed to review submission:', error);
            toast.error('Failed to review submission');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: SubmissionStatus) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-600 bg-yellow-100';
            case 'APPROVED': return 'text-green-600 bg-green-100';
            case 'REJECTED': return 'text-red-600 bg-red-100';
            case 'REVISION': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: SubmissionStatus) => {
        switch (status) {
            case 'PENDING': return '⏳';
            case 'APPROVED': return '✅';
            case 'REJECTED': return '❌';
            case 'REVISION': return '🔄';
            default: return '❓';
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
                        <p className="text-gray-600">Please log in to view gig submissions.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="btn-secondary mb-4"
                    >
                        ← Back to Gig
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gig Submissions</h1>
                    <p className="text-gray-600">Review and manage submitted work for this gig</p>
                </div>

                {/* Submissions List */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading submissions...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">📝</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                            <p className="text-gray-600">Work submissions will appear here once creators submit their completed work.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {submissions.map((submission) => (
                                <div key={submission.id} className="p-2 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-start md:flex-row flex-col sm:gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {submission.title}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                                    {getStatusIcon(submission.status)} {submission.status}
                                                </span>
                                            </div>

                                            {submission.description && (
                                                <p className="text-gray-600 mb-3">{submission.description}</p>
                                            )}

                                            <div className="mb-3">
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Deliverables:</h4>
                                                <div className="space-y-2">
                                                    {submission.deliverables.map((deliverable, index) => {
                                                        // Parse JSON string if it's a string
                                                        let item: any;
                                                        if (typeof deliverable === 'string') {
                                                            try {
                                                                item = JSON.parse(deliverable);
                                                            } catch (e) {
                                                                // If parsing fails, treat as plain string
                                                                return (
                                                                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                        <span className="text-blue-800 text-sm">{deliverable}</span>
                                                                    </div>
                                                                );
                                                            }
                                                        } else {
                                                            item = deliverable;
                                                        }

                                                        return (
                                                            <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        {item.type && (
                                                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
                                                                                {item.type.replace('_', ' ').toUpperCase()}
                                                                            </span>
                                                                        )}
                                                                        {item.platform && (
                                                                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mb-2 ml-2">
                                                                                {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                                                                            </span>
                                                                        )}
                                                                        {item.description && (
                                                                            <p className="text-gray-700 text-sm mb-2">{item.description}</p>
                                                                        )}
                                                                        {item.url && (
                                                                            <a 
                                                                                href={item.url} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-600 hover:text-blue-800 text-sm underline break-all"
                                                                            >
                                                                                {item.url}
                                                                            </a>
                                                                        )}
                                                                        {item.name && (
                                                                            <p className="text-gray-700 text-sm font-medium">{item.name}</p>
                                                                        )}
                                                                        {item.title && (
                                                                            <p className="text-gray-700 text-sm font-medium">{item.title}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {submission.notes && (
                                                <div className="mb-3">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-1">Notes:</h4>
                                                    <p className="text-sm text-gray-600">{submission.notes}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                                                {submission.reviewedAt && (
                                                    <span>Reviewed: {new Date(submission.reviewedAt).toLocaleDateString()}</span>
                                                )}
                                                {submission.rating && (
                                                    <span className="flex items-center gap-1">
                                                        Rating: {submission.rating}/5 ⭐
                                                    </span>
                                                )}
                                            </div>

                                            {submission.feedback && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-1">Feedback:</h4>
                                                    <p className="text-sm text-gray-600">{submission.feedback}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-shrink-0 flex flex-col gap-2 mt-2 md:mt-0">
                                            {submission.status === 'PENDING' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedSubmission(submission);
                                                        setShowReviewModal(true);
                                                    }}
                                                    className="btn-primary text-sm px-4 py-2"
                                                >
                                                    Review Work
                                                </button>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setSelectedSubmission(submission);
                                                    setShowReviewModal(true);
                                                }}
                                                className="btn-secondary text-sm px-4 py-2"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Review Submission</h2>
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">{selectedSubmission.title}</h3>
                                <p className="text-gray-600 text-sm">{selectedSubmission.description}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={reviewData.status}
                                        onChange={(e) => setReviewData({ ...reviewData, status: e.target.value as SubmissionStatus })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="APPROVED">Approve</option>
                                        <option value="REJECTED">Reject</option>
                                        <option value="REVISION">Request Revision</option>
                                    </select>
                                </div>

                                {reviewData.status === 'APPROVED' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rating (1-5 stars)
                                        </label>
                                        <select
                                            value={reviewData.rating}
                                            onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <option key={rating} value={rating}>
                                                    {rating} {rating === 1 ? 'star' : 'stars'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Feedback
                                    </label>
                                    <textarea
                                        value={reviewData.feedback}
                                        onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                                        rows={4}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Provide feedback on the submitted work..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="btn-secondary flex-1"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReview}
                                    className="btn-primary flex-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
