// components/reputation/ReputationDisplay.tsx - Display component for reputation data
'use client';

import React from 'react';
import type { ReputationData } from '../../lib/reputation-service';

interface ReputationDisplayProps {
  reputation: ReputationData;
  showBadges?: boolean;
  showRanking?: boolean;
  showMetrics?: boolean;
  compact?: boolean;
  className?: string;
}

const ReputationDisplay: React.FC<ReputationDisplayProps> = ({
  reputation,
  showBadges = true,
  showRanking = true,
  showMetrics = false,
  compact = false,
  className = '',
}) => {
  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'BRONZE':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'SILVER':
        return 'text-gray-600 bg-gray-50 border-gray-300';
      case 'GOLD':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'PLATINUM':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'DIAMOND':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'BRONZE':
        return '🥉';
      case 'SILVER':
        return '🥈';
      case 'GOLD':
        return '🥇';
      case 'PLATINUM':
        return '💎';
      case 'DIAMOND':
        return '💠';
      default:
        return '🏆';
    }
  };

  if (compact) {
    return (
      <div
        className={`reputation-display-compact flex items-center gap-3 ${className}`}
      >
        <div
          className={`rounded-none border px-3 py-1 text-sm font-medium ${getTierColor(reputation.tier)}`}
        >
          <span className="mr-1">{getTierIcon(reputation.tier)}</span>
          {reputation.tier}
        </div>
        <span className="text-sm font-medium text-gray-600">
          {(reputation.finalScore || 0).toLocaleString()} pts
        </span>
        {showRanking && (
          <span className="text-xs text-gray-500">
            #{reputation.ranking.global.rank} Global
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`reputation-display rounded-none border border-gray-200 bg-white p-3 ${className}`}
    >
      {/* Header - Tier and Score */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-none border px-4 py-2 font-semibold ${getTierColor(reputation.tier)}`}
          >
            <span className="mr-2 text-lg">{getTierIcon(reputation.tier)}</span>
            {reputation.tier} TIER
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {(reputation.finalScore || 0).toLocaleString()  }
          </div>
          <div className="text-sm text-gray-500">Total Points</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-none bg-blue-50 p-3">
          <div className="text-lg font-semibold text-blue-600">
            {(reputation.baseScore || 0).toLocaleString()}
          </div>
          <div className="text-sm text-blue-500">Base Score</div>
        </div>
        <div className="rounded-none bg-green-50 p-3">
          <div className="text-lg font-semibold text-green-600">
            +{(reputation.bonusScore || 0).toLocaleString()}
          </div>
          <div className="text-sm text-green-500">Bonus Points</div>
        </div>
      </div>

      {/* Rankings */}
      {showRanking && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-none bg-gray-50 p-3 text-center">
            <div className="text-xl font-bold text-gray-900">
              #{reputation.ranking.global.rank}
            </div>
            <div className="text-sm text-gray-600">Global Rank</div>
          </div>
          <div className="rounded-none bg-gray-50 p-3 text-center">
            <div className="text-xl font-bold text-gray-900">
              #{reputation.ranking.tier.rank}
            </div>
            <div className="text-sm text-gray-600">{reputation.tier} Rank</div>
          </div>
        </div>
      )}

      {/* Badges */}
      {showBadges && reputation.badges.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Badges</h4>
          <div className="flex flex-wrap gap-2">
            {reputation.badges.map((badge, index) => (
              <span
                key={index}
                className="rounded-none bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700"
              >
                🏅 {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {showMetrics && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-700">
            Key Metrics
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Gigs Completed:</span>
              <span className="font-medium">
                {reputation.metrics.gigsCompleted}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Rating:</span>
              <span className="font-medium">
                {reputation.metrics.averageRating > 0
                  ? `${reputation.metrics.averageRating.toFixed(1)} ⭐`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completion Rate:</span>
              <span className="font-medium">
                {reputation.metrics.completionRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Profile Views:</span>
              <span className="font-medium">
                {(reputation.metrics.profileViews || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last Activity */}
      <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
        Last activity:{' '}
        {new Date(reputation.lastActivityAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default ReputationDisplay;
