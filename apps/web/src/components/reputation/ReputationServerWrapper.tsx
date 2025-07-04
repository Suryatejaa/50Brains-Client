// components/reputation/ReputationServerWrapper.tsx - Server component for SSR reputation
import React from 'react';
import { reputationService } from '../../lib/reputation-service';
import ReputationDisplay from './ReputationDisplay';
import ErrorMessage from '../../frontend-profile/components/common/ErrorMessage';

interface ReputationServerWrapperProps {
  userId: string;
  showBadges?: boolean;
  showRanking?: boolean;
  showMetrics?: boolean;
  compact?: boolean;
  className?: string;
}

const ReputationServerWrapper: React.FC<ReputationServerWrapperProps> = async ({
  userId,
  showBadges = true,
  showRanking = true,
  showMetrics = false,
  compact = false,
  className = '',
}) => {
  console.log(
    `🏆 [ReputationServerWrapper] SSR fetching reputation for user: ${userId}`
  );

  try {
    const reputationResponse = await reputationService.getReputation(userId);

    if (!reputationResponse.success || !reputationResponse.data) {
      console.error(
        `❌ [ReputationServerWrapper] Failed to load reputation:`,
        reputationResponse.error
      );

      return (
        <div className={`reputation-server-wrapper ${className}`}>
          <ErrorMessage
            title="Reputation Unavailable"
            message={
              reputationResponse.error?.message ||
              'Unable to load reputation data'
            }
          />
        </div>
      );
    }

    const reputation = reputationResponse.data;
    console.log(
      `✅ [ReputationServerWrapper] SSR loaded reputation for ${userId}: ${reputation.tier} (${reputation.finalScore} points)`
    );

    return (
      <div className={`reputation-server-wrapper ${className}`}>
        <ReputationDisplay
          reputation={reputation}
          showBadges={showBadges}
          showRanking={showRanking}
          showMetrics={showMetrics}
          compact={compact}
        />
      </div>
    );
  } catch (error) {
    console.error(`❌ [ReputationServerWrapper] SSR error:`, error);

    return (
      <div className={`reputation-server-wrapper ${className}`}>
        <ErrorMessage
          title="Reputation Error"
          message="Unable to load reputation data at this time"
        />
      </div>
    );
  }
};

export default ReputationServerWrapper;
