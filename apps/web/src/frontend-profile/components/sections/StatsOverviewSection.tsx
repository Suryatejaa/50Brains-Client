// components/sections/StatsOverviewSection.tsx
import React from 'react';
import {
  UserProfileData,
  AnalyticsData,
  ReputationData,
} from '../../types/profile.types';

interface StatsOverviewSectionProps {
  user: UserProfileData;
  analytics?: AnalyticsData | null;
  reputation?: ReputationData | null;
}

const StatsOverviewSection: React.FC<StatsOverviewSectionProps> = ({
  user,
  analytics,
  reputation,
}) => {
  return (
    <div className="stats-overview-section">
      <h3>Stats Overview</h3>

      <div className="stats-grid">
        {/* Basic Stats */}
        <div className="stat-item">
          <span className="stat-value">{user.roles.length}</span>
          <span className="stat-label">Active Roles</span>
        </div>

        <div className="stat-item">
          <span className="stat-value">
            {new Date().getFullYear() - new Date(user.createdAt).getFullYear()}
          </span>
          <span className="stat-label">Years Active</span>
        </div>

        {/* Analytics Stats */}
        {analytics && (
          <>
            <div className="stat-item">
              <span className="stat-value">{analytics.profileViews || 0}</span>
              <span className="stat-label">Profile Views</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">
                {analytics.searchAppearances || 0}
              </span>
              <span className="stat-label">Search Appearances</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">
                {analytics.popularityScore || 0}
              </span>
              <span className="stat-label">Popularity Score</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">
                {analytics.engagementScore || 0}%
              </span>
              <span className="stat-label">Engagement Rate</span>
            </div>
          </>
        )}

        {/* Reputation Stats */}
        {reputation && (
          <>
            <div className="stat-item">
              <span className="stat-value">
                ⭐ {reputation.metrics?.averageRating?.toFixed(1) || 'N/A'}
              </span>
              <span className="stat-label">Average Rating</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">
                {reputation.metrics?.gigsCompleted || 0}
              </span>
              <span className="stat-label">Completed Gigs</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">{reputation.finalScore || 0}</span>
              <span className="stat-label">Reputation Score</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">
                {reputation.badges?.length || 0}
              </span>
              <span className="stat-label">Badges Earned</span>
            </div>
          </>
        )}

        {/* Role-specific stats */}
        {user.roles.includes('INFLUENCER') && (
          <>
            <div className="stat-item">
              <span className="stat-value">
                {user.estimatedFollowers?.toLocaleString() || 'N/A'}
              </span>
              <span className="stat-label">Followers</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">
                {user.contentCategories?.length || 0}
              </span>
              <span className="stat-label">Content Categories</span>
            </div>
          </>
        )}

        {user.roles.includes('CREW') && (
          <>
            <div className="stat-item">
              <span className="stat-value">${user.hourlyRate || 0}/hr</span>
              <span className="stat-label">Hourly Rate</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">{user.crewSkills?.length || 0}</span>
              <span className="stat-label">Skills</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">
                {user.equipmentOwned?.length || 0}
              </span>
              <span className="stat-label">Equipment</span>
            </div>
          </>
        )}
      </div>

      {/* Badges Section */}
      {reputation?.badges && reputation.badges.length > 0 && (
        <div className="badges-section">
          <h4>Badges</h4>
          <div className="badges-list">
            {reputation.badges.map((badge: string, index: number) => (
              <span key={index} className="badge">
                🏆 {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Verification Status */}
      <div className="verification-section">
        <h4>Verification Status</h4>
        <div className="verification-items">
          <div
            className={`verification-item ${user.emailVerified ? 'verified' : 'unverified'}`}
          >
            {user.emailVerified ? '✓' : '⚠'} Email Verified
          </div>

          {reputation?.tier && (
            <div
              className={`verification-item ${reputation.tier !== 'BRONZE' ? 'verified' : 'unverified'}`}
            >
              {reputation.tier !== 'BRONZE' ? '✓' : '⚠'} {reputation.tier} Tier
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsOverviewSection;
