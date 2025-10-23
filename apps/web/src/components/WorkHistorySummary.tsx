'use client';

import React from 'react';
import { useWorkHistory } from '@/hooks/useWorkHistory';

interface WorkHistorySummaryProps {
  userId?: string;
}

export const WorkHistorySummary: React.FC<WorkHistorySummaryProps> = ({
  userId,
}) => {
  const { workSummary, skills, reputation, loading, error } =
    useWorkHistory(userId);

  if (loading) {
    return (
      <div className="card-glass p-1">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <p className="mt-2 text-center text-gray-600">
          Loading work summary...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass p-1">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  if (!workSummary) {
    return (
      <div className="card-glass p-1">
        <p className="text-center text-gray-600">No work summary available</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-glass p-1 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {workSummary.totalProjects}
          </div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>

        <div className="card-glass p-1 text-center">
          <div className="text-2xl font-bold text-green-600">
            {workSummary.completedProjects}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>

        <div className="card-glass p-1 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            ⭐ {workSummary.averageRating?.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>

        <div className="card-glass p-1 text-center">
          <div className="text-2xl font-bold text-purple-600">
            ₹{(workSummary.totalEarnings || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Earnings</div>
        </div>
      </div>

      {/* Success Rate & Verification */}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
        <div className="card-glass p-1">
          <h3 className="mb-1 font-semibold">Success Rate</h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${workSummary.successRate}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium">
              {workSummary.successRate}%
            </span>
          </div>
        </div>

        <div className="card-glass p-1">
          <h3 className="mb-3 font-semibold">Reputation Tier</h3>
          <div className="flex items-center space-x-2">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                reputation?.tier === 'DIAMOND'
                  ? 'bg-blue-100 text-blue-800'
                  : reputation?.tier === 'GOLD'
                    ? 'bg-yellow-100 text-yellow-800'
                    : reputation?.tier === 'SILVER'
                      ? 'bg-gray-100 text-gray-800'
                      : reputation?.tier === 'BRONZE'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
              }`}
            >
              {reputation?.tier || workSummary.verificationLevel || 'Unranked'}
            </span>
            {reputation && (
              <span className="text-xs text-gray-600">
                Score: {reputation.finalScore}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top Skills */}
      {skills.length > 0 && (
        <div className="card-glass p-1">
          <h3 className="mb-1 font-semibold">Top Skills</h3>
          <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
            {skills.slice(0, 6).map((skill, index) => (
              <div
                key={skill.skill}
                className="flex items-center justify-between rounded bg-gray-50 p-2"
              >
                <span className="text-sm font-medium">{skill.skill}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{skill.level}</span>
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    {skill.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
