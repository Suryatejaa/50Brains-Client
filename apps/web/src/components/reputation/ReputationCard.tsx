// components/reputation/ReputationCard.tsx - Compact reputation card for dashboard
'use client';

import React from 'react';
import type { ReputationData } from '../../lib/reputation-service';

interface ReputationCardProps {
  reputation: ReputationData;
  onClick?: () => void;
  className?: string;
}

const ReputationCard: React.FC<ReputationCardProps> = ({
  reputation,
  onClick,
  className = '',
}) => {
  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'BRONZE':
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
          border: 'border-amber-200',
          text: 'text-amber-700',
          icon: '🥉',
        };
      case 'SILVER':
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: '🥈',
        };
      case 'GOLD':
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: '🥇',
        };
      case 'PLATINUM':
        return {
          bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
          border: 'border-indigo-200',
          text: 'text-indigo-700',
          icon: '💎',
        };
      case 'DIAMOND':
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
          border: 'border-purple-200',
          text: 'text-purple-700',
          icon: '💠',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: '🏆',
        };
    }
  };

  const tierStyle = getTierColor(reputation.tier);
  const hasInteraction = Boolean(onClick);

  return (
    <div
      className={`
        reputation-card 
        ${tierStyle.bg} 
        ${tierStyle.border} 
        rounded-xl border p-3 
        ${hasInteraction ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tierStyle.icon}</span>
          <div>
            <div className={`text-lg font-bold ${tierStyle.text}`}>
              {reputation.tier}
            </div>
            <div className="text-sm text-gray-600">Tier</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${tierStyle.text}`}>
            {reputation.finalScore.toLocaleString() ?? 0}
          </div>
          <div className="text-sm text-gray-600">Points</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            #{reputation.ranking.global.rank}
          </div>
          <div className="text-xs text-gray-600">Global</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            #{reputation.ranking.tier.rank}
          </div>
          <div className="text-xs text-gray-600">{reputation.tier}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {reputation.metrics.gigsCompleted}
          </div>
          <div className="text-xs text-gray-600">Gigs</div>
        </div>
      </div>

      {/* Progress to Next Tier */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress to next tier</span>
          <span className={`font-medium ${tierStyle.text}`}>
            {Math.min(85, (reputation.finalScore / 1000) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-none bg-gray-200">
          <div
            className={`h-2 rounded-none ${tierStyle.bg} ${tierStyle.border}`}
            style={{
              width: `${Math.min(85, (reputation.finalScore / 1000) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Badges Preview */}
      {reputation.badges.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {reputation.badges.length} Badge
              {reputation.badges.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-1">
              {reputation.badges.slice(0, 3).map((_, index) => (
                <span key={index} className="text-sm">
                  🏅
                </span>
              ))}
              {reputation.badges.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{reputation.badges.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationCard;
