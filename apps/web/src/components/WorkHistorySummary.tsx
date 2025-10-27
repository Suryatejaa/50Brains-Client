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

  console.log('Work Summary:', workSummary);
  console.log('Skills:', skills);
  console.log('Reputation:', reputation);

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
            {(reputation as any)?.metrics?.totalGigs ||
              workSummary.totalProjects ||
              0}
          </div>
          <div className="text-sm text-gray-600">Total Gigs</div>
        </div>

        <div className="card-glass p-1 text-center">
          <div className="text-2xl font-bold text-green-600">
            {(reputation as any)?.metrics?.completedGigs ||
              workSummary.completedProjects ||
              0}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>

        <div className="card-glass p-1 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            ⭐{' '}
            {(
              (reputation as any)?.overallRating ||
              workSummary.averageRating ||
              0
            ).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Overall Rating</div>
        </div>

        <div className="card-glass p-1 text-center">
          <div className="text-2xl font-bold text-purple-600">
            ₹{(workSummary.totalEarnings || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Earnings</div>
        </div>
      </div>

      {/* Reputation Scores */}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-glass p-1">
          <h4 className="mb-1 text-sm font-medium text-gray-600">
            Reliability
          </h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{
                    width: `${(reputation as any)?.reliabilityScore || 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium">
              {(reputation as any)?.reliabilityScore || 0}
            </span>
          </div>
        </div>

        <div className="card-glass p-1">
          <h4 className="mb-1 text-sm font-medium text-gray-600">Quality</h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{
                    width: `${(reputation as any)?.qualityScore || 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium">
              {(reputation as any)?.qualityScore || 0}
            </span>
          </div>
        </div>

        <div className="card-glass p-1">
          <h4 className="mb-1 text-sm font-medium text-gray-600">
            Communication
          </h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-yellow-500"
                  style={{
                    width: `${(reputation as any)?.communicationScore || 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium">
              {(reputation as any)?.communicationScore || 0}
            </span>
          </div>
        </div>

        <div className="card-glass p-1">
          <h4 className="mb-1 text-sm font-medium text-gray-600">Timeliness</h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{
                    width: `${(reputation as any)?.timelinessScore || 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium">
              {(reputation as any)?.timelinessScore || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Tier, Ranking & Performance */}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
        <div className="card-glass p-1">
          <h3 className="mb-2 font-semibold">Reputation Level</h3>
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                (reputation as any)?.level === 'DIAMOND'
                  ? 'bg-blue-100 text-blue-800'
                  : (reputation as any)?.level === 'GOLD'
                    ? 'bg-yellow-100 text-yellow-800'
                    : (reputation as any)?.level === 'SILVER'
                      ? 'bg-gray-100 text-gray-800'
                      : (reputation as any)?.level === 'BRONZE'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
              }`}
            >
              {(reputation as any)?.level ||
                workSummary.verificationLevel ||
                'Unverified'}
            </span>
            <span className="text-sm text-gray-600">
              Score: {(reputation as any)?.totalScore || 0}
            </span>
          </div>
        </div>

        <div className="card-glass p-1">
          <h3 className="mb-2 font-semibold">Global Ranking</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600">
              #{(reputation as any)?.ranking?.global?.rank || 'N/A'}
            </span>
            <span className="text-sm text-gray-600">Global</span>
          </div>
        </div>

        <div className="card-glass p-1">
          <h3 className="mb-2 font-semibold">Success Rate</h3>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${workSummary.successRate || 0}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium">
              {workSummary.successRate || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-glass p-1 text-center">
          <div className="text-lg font-bold text-blue-600">
            {(reputation as any)?.metrics?.onTimeDeliveryRate ||
              workSummary.onTimeDeliveryRate ||
              0}
            %
          </div>
          <div className="text-xs text-gray-600">On-Time Delivery</div>
        </div>

        <div className="card-glass p-1 text-center">
          <div className="text-lg font-bold text-green-600">
            {(reputation as any)?.metrics?.clientSatisfactionRate || 0}%
          </div>
          <div className="text-xs text-gray-600">Client Satisfaction</div>
        </div>

        <div className="card-glass p-1 text-center">
          <div className="text-lg font-bold text-yellow-600">
            {workSummary.currentStreak || 0}
          </div>
          <div className="text-xs text-gray-600">Current Streak</div>
        </div>

        <div className="card-glass p-1 text-center">
          <div className="text-lg font-bold text-purple-600">
            ₹{(workSummary.averageProjectValue || 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Avg Project Value</div>
        </div>
      </div>

      {/* Badges & Achievements */}
      {(reputation as any)?.badges && (reputation as any).badges.length > 0 && (
        <div className="card-glass p-1">
          <h3 className="mb-2 font-semibold">Badges & Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {(reputation as any).badges.map((badge: string, index: number) => (
              <span
                key={index}
                className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-sm font-medium text-white"
              >
                {badge
                  .replace('_', ' ')
                  .toLowerCase()
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rating Breakdown */}
      {workSummary.totalRatings > 0 && (
        <div className="card-glass p-1">
          <h3 className="mb-2 font-semibold">Rating Breakdown</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>5 Stars</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-20 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-400"
                    style={{
                      width: `${workSummary.totalRatings > 0 ? (workSummary.fiveStarCount / workSummary.totalRatings) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="w-8 text-right">
                  {workSummary.fiveStarCount}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>4 Stars</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-20 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-400"
                    style={{
                      width: `${workSummary.totalRatings > 0 ? (workSummary.fourStarCount / workSummary.totalRatings) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="w-8 text-right">
                  {workSummary.fourStarCount}
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Total Reviews: {workSummary.totalRatings}
            </div>
          </div>
        </div>
      )}

      {/* Top Skills */}
      {skills.length > 0 && (
        <div className="card-glass p-1">
          <h3 className="mb-2 font-semibold">Top Skills</h3>
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

      {/* Top Categories */}
      {workSummary.topCategories && workSummary.topCategories.length > 0 && (
        <div className="card-glass p-1">
          <h3 className="mb-2 font-semibold">Top Categories</h3>
          <div className="flex flex-wrap gap-2">
            {workSummary.topCategories.slice(0, 5).map((category, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
        <div className="card-glass p-1">
          <h4 className="mb-1 text-sm font-medium text-gray-600">This Month</h4>
          <div className="text-lg font-bold text-blue-600">
            {workSummary.projectsThisMonth || 0} projects
          </div>
        </div>

        <div className="card-glass p-1">
          <h4 className="mb-1 text-sm font-medium text-gray-600">This Year</h4>
          <div className="text-lg font-bold text-green-600">
            {workSummary.projectsThisYear || 0} projects
          </div>
        </div>

        <div className="card-glass p-1">
          <h4 className="mb-1 text-sm font-medium text-gray-600">
            Last Active
          </h4>
          <div className="text-sm text-gray-600">
            {workSummary.lastActiveDate
              ? new Date(workSummary.lastActiveDate).toLocaleDateString()
              : 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
};
