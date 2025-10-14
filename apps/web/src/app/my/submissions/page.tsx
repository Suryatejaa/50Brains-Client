'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { GigAPI } from '@/lib/gig-api';
import { Submission, SubmissionStatus } from '@/types/gig.types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function MySubmissionsPage() {
    const { user, isAuthenticated } = useAuth();
    const { currentRole, getUserTypeForRole } = useRoleSwitch();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'ALL'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSubmissions, setTotalSubmissions] = useState(0);

    const userType = getUserTypeForRole(currentRole);
    const itemsPerPage = 20;

    useEffect(() => {
        if (isAuthenticated && user) {
            loadSubmissions();
        }
    }, [isAuthenticated, user, filterStatus, currentPage]);

    const loadSubmissions = async () => {
        try {
            setIsLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString()
            });

            if (filterStatus !== 'ALL') {
                params.append('status', filterStatus);
            }

            // Note: This would need to be implemented in the API
            // For now, we'll use a mock approach or get all submissions
            const data = await GigAPI.getMySubmissions(params.toString());
            const submissionsArray = data.submissions || data;
            setSubmissions(submissionsArray);
            setTotalPages(data.pagination?.pages || 1);
            setTotalSubmissions(data.pagination?.total || submissionsArray.length);
        } catch (error) {
            console.error('Failed to load submissions:', error);
            toast.error('Failed to load submissions');
        } finally {
            setIsLoading(false);
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

    const handleStatusFilter = (status: SubmissionStatus | 'ALL') => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
                        <p className="text-gray-600">Please log in to view your submissions.</p>
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
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/dashboard" className="btn-secondary">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">My Work Submissions</h1>
                    </div>
                    <p className="text-gray-600">Track all your submitted work and their review status</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{totalSubmissions}</div>
                        <div className="text-sm text-gray-600">Total Submissions</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-2xl font-bold text-yellow-600">
                            {submissions.filter(s => s.status === 'PENDING').length}
                        </div>
                        <div className="text-sm text-gray-600">Pending Review</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            {submissions.filter(s => s.status === 'APPROVED').length}
                        </div>
                        <div className="text-sm text-gray-600">Approved</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-2xl font-bold text-red-600">
                            {submissions.filter(s => s.status === 'REJECTED').length}
                        </div>
                        <div className="text-sm text-gray-600">Rejected</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleStatusFilter('ALL')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === 'ALL'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All ({totalSubmissions})
                        </button>
                        <button
                            onClick={() => handleStatusFilter(SubmissionStatus.PENDING)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === SubmissionStatus.PENDING
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Pending ({submissions.filter(s => s.status === SubmissionStatus.PENDING).length})
                        </button>
                        <button
                            onClick={() => handleStatusFilter(SubmissionStatus.APPROVED)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === SubmissionStatus.APPROVED
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Approved ({submissions.filter(s => s.status === SubmissionStatus.APPROVED).length})
                        </button>
                        <button
                            onClick={() => handleStatusFilter(SubmissionStatus.REJECTED)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === SubmissionStatus.REJECTED
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Rejected ({submissions.filter(s => s.status === SubmissionStatus.REJECTED).length})
                        </button>
                        <button
                            onClick={() => handleStatusFilter(SubmissionStatus.REVISION)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === SubmissionStatus.REVISION
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Revision ({submissions.filter(s => s.status === SubmissionStatus.REVISION).length})
                        </button>
                    </div>
                </div>

                {/* Submissions List */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your submissions...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">📝</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                            <p className="text-gray-600 mb-4">
                                {filterStatus === 'ALL'
                                    ? "You haven't submitted any work yet. Start by applying to gigs and submitting completed work."
                                    : `No ${filterStatus.toLowerCase()} submissions found.`
                                }
                            </p>
                            {filterStatus === 'ALL' && (
                                <Link href="/marketplace" className="btn-primary">
                                    Browse Available Gigs
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {submissions.map((submission) => (
                                <div key={submission.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {submission.title}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                                    {getStatusIcon(submission.status)} {submission.status}
                                                </span>
                                            </div>

                                            {submission.gig && (
                                                <div className="mb-3">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-1">Gig:</h4>
                                                    <Link
                                                        href={`/gig/${submission.gig.id}`}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        {submission.gig.title}
                                                    </Link>
                                                </div>
                                            )}

                                            {submission.description && (
                                                <p className="text-gray-600 mb-3">{submission.description}</p>
                                            )}

                                            <div className="mb-3">
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Deliverables:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {submission.deliverables.map((deliverable, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                                        >
                                                            {deliverable}
                                                        </span>
                                                    ))}
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

                                        <div className="ml-4 flex flex-col gap-2">
                                            <Link
                                                href={`/gig/${submission.gigId}`}
                                                className="btn-secondary text-sm px-4 py-2"
                                            >
                                                View Gig
                                            </Link>

                                            {submission.status === 'REVISION' && (
                                                <button className="btn-primary text-sm px-4 py-2">
                                                    Submit Revision
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 border rounded-md ${currentPage === page
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
