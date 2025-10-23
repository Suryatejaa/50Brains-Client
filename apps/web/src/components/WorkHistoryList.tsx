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
  limit = 10,
}) => {
  const { workHistory, loading, error, fetchWorkHistory } =
    useWorkHistory(userId);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  //console.log(('Work History:', workHistory);
  const filteredWorkHistory = workHistory.filter((item) => {
    // Only filter by status if the item has a status field
    if (
      selectedStatus !== 'all' &&
      item.status &&
      item.status !== selectedStatus
    )
      return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory)
      return false;
    return true;
  });

  const categories = Array.from(
    new Set(workHistory.map((item) => item.category).filter(Boolean))
  );
  const statuses = Array.from(
    new Set(workHistory.map((item) => item.status).filter(Boolean))
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchWorkHistory({
      limit,
      offset: 0,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="card-glass p-4">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <p className="mt-2 text-center text-gray-600">
          Loading work history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass p-4">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Filters */}
      {showFilters && categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              handleFilterChange();
            }}
            className="input text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category
                  .replace('-', ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>

          <div className="flex items-center text-xs text-gray-500">
            {filteredWorkHistory.length} of {workHistory.length} projects
          </div>
        </div>
      )}

      {/* Work History List */}
      {filteredWorkHistory.length === 0 ? (
        <div className="card-glass p-2 text-center">
          <div className="mb-4 text-4xl">📋</div>
          <h3 className="mb-2 text-lg font-semibold">
            {workHistory.length === 0 ? 'No Work History' : 'No Results Found'}
          </h3>
          <p className="text-gray-600">
            {workHistory.length === 0
              ? 'Complete your first gig to see your work history here.'
              : 'No work history found for the selected filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredWorkHistory.slice(0, limit).map((item) => (
            <div
              key={item.id}
              className="card-glass p-2 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    {item.status && (
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    )}
                    {!item.status && (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                        Completed
                      </span>
                    )}
                    {item.verified && (
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <div className="mb-2 flex items-center gap-3">
                    <p className="text-sm text-gray-600">
                      Category:{' '}
                      <span className="font-medium capitalize">
                        {item.category.replace('-', ' ')}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Gig ID: {item.gigId.slice(-8)}
                    </p>
                  </div>
                  <div className="mb-2 flex items-center gap-3">
                    <p className="text-xs text-gray-500">
                      Earnings: {item.actualBudget}
                    </p>
                  </div>

                  {/* Skills */}
                  {item.skills && item.skills.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {item.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {item.skills.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Client Feedback */}
                  {item.clientFeedback && (
                    <div className="mb-2 rounded bg-gray-50 p-2 text-sm text-gray-700">
                      <span className="font-medium">Client Feedback:</span>{' '}
                      {item.clientFeedback}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
                    <span>
                      Completed:{' '}
                      {new Date(item.completedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        ⭐ {item.clientRating}/5
                      </span>
                      {item.clientRating === 5 && (
                        <span className="text-xs text-green-600">Perfect!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredWorkHistory.length > limit && (
            <div className="mt-4 text-center">
              <p className="mb-2 text-sm text-gray-600">
                Showing {limit} of {filteredWorkHistory.length} projects
              </p>
              <button
                onClick={() => (window.location.href = '/work-history')}
                className="text-brand-primary text-sm font-medium hover:underline"
              >
                View All Work History →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
