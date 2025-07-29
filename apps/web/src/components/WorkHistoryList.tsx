'use client';

import React, { useState } from 'react';
import { useWorkHistory } from '@/hooks/useWorkHistory';

interface WorkHistoryListProps {
    userId?: string;
    showFilters?: boolean;
    limit?: number;
}

export const WorkHistoryList: React.FC<WorkHistoryListProps> = ({
    userId,
    showFilters = true,
    limit = 10
}) => {
    const { workHistory, loading, error, fetchWorkHistory } = useWorkHistory(userId);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredWorkHistory = workHistory.filter(item => {
        if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
        return true;
    });

    const categories = Array.from(new Set(workHistory.map(item => item.category)));
    const statuses = Array.from(new Set(workHistory.map(item => item.status)));

    const handleFilterChange = () => {
        setCurrentPage(1);
        fetchWorkHistory({
            limit,
            offset: 0,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="card-glass p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-center text-gray-600 mt-2">Loading work history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card-glass p-4">
                <p className="text-red-600 text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            {showFilters && (
                <div className="flex flex-wrap gap-2">
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            handleFilterChange();
                        }}
                        className="input text-sm"
                    >
                        <option value="all">All Status</option>
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            handleFilterChange();
                        }}
                        className="input text-sm"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Work History List */}
            {filteredWorkHistory.length === 0 ? (
                <div className="card-glass p-8 text-center">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold mb-2">No Work History</h3>
                    <p className="text-gray-600">No work history found for the selected filters.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredWorkHistory.map((item) => (
                        <div key={item.id} className="card-glass p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="font-semibold text-lg">{item.title}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                        {item.verified && (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 text-sm mb-2">{item.category}</p>

                                    {/* Skills */}
                                    {item.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {item.skills.slice(0, 3).map((skill, index) => (
                                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                    {skill}
                                                </span>
                                            ))}
                                            {item.skills.length > 3 && (
                                                <span className="text-gray-500 text-xs">+{item.skills.length - 3} more</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Client Feedback */}
                                    {item.clientFeedback && (
                                        <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 mb-2">
                                            <span className="font-medium">Client Feedback:</span> {item.clientFeedback}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Completed: {new Date(item.completedAt).toLocaleDateString()}</span>
                                        <span>Rating: ⭐ {item.clientRating}/5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 