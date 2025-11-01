// components/tabs/OverviewTabServer.tsx - Server Component for Overview tab
import React from 'react';
import { CompleteProfileData } from '../../types/profile.types';
import '../tabs/OverviewTab.css';

interface OverviewTabServerProps {
  profile: CompleteProfileData;
  isPublicView: boolean;
}

// Server Component - renders static overview content
const OverviewTabServer: React.FC<OverviewTabServerProps> = ({
  profile,
  isPublicView,
}) => {
  const { user, analytics } = profile;

  return (
    <div className="overview-tab">
      <div className="overview-tab__grid">
        {/* User Stats */}
        {analytics && (
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{analytics.profileViews || 0}</span>
              <span className="stat-label">Profile Views</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {analytics.popularityScore?.toFixed(1) || '0.0'}
              </span>
              <span className="stat-label">Popularity</span>
            </div>
            {/* {reputation && (
              <div className="stat-item">
                <span className="stat-value">
                  {reputation.metrics?.averageRating?.toFixed(1) || '0.0'} ⭐
                </span>
                <span className="stat-label">
                  {reputation.metrics?.gigsCompleted || 0} Gigs
                </span>
              </div>
            )} */}
          </div>
        )}

        {/* About Section */}
        <div className="overview-about">
          <h3>About</h3>
          <p>{user.bio || 'No bio available'}</p>
        </div>

        {/* Role-specific Information */}
        <div className="overview-tab__role-section">
          <div className="section-header">
            <h4>Professional Information</h4>
          </div>
          <div className="overview-tab__role-content">
            {/* Role Fields */}
            <div className="overview-tab__field">
              <label>Roles:</label>
              <div className="overview-tab__tags">
                {user.roles?.map((role: string) => (
                  <span key={role} className="overview-tab__tag">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {user.location && (
              <div className="overview-tab__field">
                <label>Location:</label>
                <span>{user.location}</span>
              </div>
            )}

            {user.estimatedFollowers && (
              <div className="overview-tab__field">
                <label>Estimated Followers:</label>
                <span>{(user.estimatedFollowers || 0).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {/* {workHistory?.skills && workHistory.skills.length > 0 && (
          <div className="overview-skills">
            <h3>Top Skills</h3>
            <div className="overview-skills-grid">
              {workHistory.skills
                .slice(0, 6)
                .map((skill: any, index: number) => (
                  <span key={index} className="overview-skill-tag">
                    {skill.name || skill}
                  </span>
                ))}
            </div>
          </div>
        )} */}

        {/* Verification Status */}
        <div className="verification-section">
          <h4>Verification Status</h4>
          <div className="verification-items">
            <div
              className={`verification-item ${user.emailVerified ? 'verified' : 'unverified'}`}
            >
              Email {user.emailVerified ? 'Verified' : 'Not Verified'}
            </div>
            <div className="verification-item verified">Profile Active</div>
          </div>
        </div>

        {/* Contact Actions - Only for public profiles */}
        {isPublicView && (
          <div className="contact-actions">
            <div className="btn btn-primary cursor-not-allowed opacity-60">
              💬 Send Message
            </div>
            <div className="btn btn-secondary cursor-not-allowed opacity-60">
              🤝 Connect
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Interactive features coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTabServer;
