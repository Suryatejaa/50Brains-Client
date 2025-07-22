// components/reputation/ReputationClientWrapper.tsx - Client component for reputation with caching
'use client';

import React from 'react';
import { useReputation } from '../../hooks/useReputation';
import ReputationDisplay from './ReputationDisplay';
import LoadingSpinner from '../../frontend-profile/components/common/LoadingSpinner';
import ErrorMessage from '../../frontend-profile/components/common/ErrorMessage';
import CacheIndicator from './ReputationCacheIndicator';

interface ReputationClientWrapperProps {
  userId: string;
  showBadges?: boolean;
  showRanking?: boolean;
  showMetrics?: boolean;
  compact?: boolean;
  className?: string;
  showCacheDebug?: boolean;
}

const ReputationClientWrapper: React.FC<ReputationClientWrapperProps> = ({
  userId,
  showBadges = true,
  showRanking = true,
  showMetrics = false,
  compact = false,
  className = '',
  showCacheDebug = false,
}) => {
  const {
    reputation,
    isLoading,
    error,
    refreshReputation,
    forceRefreshReputation,
    cacheInfo,
  } = useReputation(userId);

  // Loading state (only show if no cached data)
  if (isLoading && !reputation) {
    return (
      <div className={`reputation-client-wrapper ${className}`}>
        <LoadingSpinner size="medium" message="Loading reputation..." />
      </div>
    );
  }

  // Error state (only show if no cached data)
  if (error && !reputation) {
    return (
      <div className={`reputation-client-wrapper ${className}`}>
        <ErrorMessage
          title="Reputation Error"
          message={error}
          showRetry
          onRetry={refreshReputation}
        />
      </div>
    );
  }

  // No data state
  if (!reputation) {
    return (
      <div className={`reputation-client-wrapper ${className}`}>
        <ErrorMessage
          title="No Reputation Data"
          message="No reputation information available for this user"
          showRetry
          onRetry={refreshReputation}
        />
      </div>
    );
  }

  return (
    <div className={`reputation-client-wrapper relative ${className}`}>
      {/* Cache Debug Indicator */}
      {showCacheDebug && process.env.NODE_ENV === 'development' && (
        <CacheIndicator
          userId={userId}
          cacheInfo={cacheInfo}
          onForceRefresh={forceRefreshReputation}
        />
      )}

      {/* Reputation Display */}
      <ReputationDisplay
        reputation={reputation}
        showBadges={showBadges}
        showRanking={showRanking}
        showMetrics={showMetrics}
        compact={compact}
      />

      {/* Loading overlay for updates */}
      {isLoading && reputation && (
        <div className="absolute inset-0 flex items-center justify-center rounded-none bg-white bg-opacity-50">
          <LoadingSpinner size="small" message="Updating..." />
        </div>
      )}
    </div>
  );
};

export default ReputationClientWrapper;
