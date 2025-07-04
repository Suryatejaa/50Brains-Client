// components/ProfileHeaderStatic.tsx - Server Component for static profile header
import React from 'react';
import {
  UserProfileData,
  AnalyticsData,
  ReputationData,
} from '../types/profile.types';
import './ProfileHeader.css';

interface ProfileHeaderStaticProps {
  user: UserProfileData;
  analytics?: AnalyticsData | null;
  reputation?: ReputationData | null;
  showEditButton?: boolean;
}

// Server Component - no interactivity, pure SSR
const ProfileHeaderStatic: React.FC<ProfileHeaderStaticProps> = ({
  user,
  analytics,
  reputation,
  showEditButton = false,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="profile-header">
      {/* Cover Image */}
      <div className="profile-header__cover">
        <img
          src={user.coverImage || '/default-cover.jpg'}
          alt="Cover"
          className="profile-header__cover-image"
        />
      </div>

      {/* Profile Content */}
      <div className="profile-header__content">
        <div className="profile-header__main">
          {/* Profile Picture */}
          <div className="profile-header__avatar">
            <img
              src={user.profilePicture || '/default-avatar.jpg'}
              alt={`${user.firstName} ${user.lastName}`}
              className="profile-header__avatar-image"
            />
          </div>

          {/* Basic Info */}
          <div className="profile-header__info">
            <div className="profile-header__name">
              <h1 className="profile-header__full-name">
                {user.firstName} {user.lastName}
              </h1>
              <p className="profile-header__username">@{user.username}</p>
            </div>

            {/* Role Badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              {user.roles?.map((role: string) => (
                <span
                  key={role}
                  className="bg-primary-100 text-primary-700 rounded-lg px-3 py-1 text-sm font-medium"
                >
                  {role}
                </span>
              ))}
            </div>

            {/* Location */}
            {user.location && (
              <div className="profile-header__location">
                <span className="profile-header__location-text">
                  📍 {user.location}
                </span>
              </div>
            )}

            {/* Bio */}
            <div className="profile-header__bio">
              <p className="profile-header__bio-text">
                {user.bio || 'No bio available'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="profile-header__sidebar">
          {/* Quick Stats */}
          <div className="profile-header__stats">
            {analytics && (
              <>
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">
                    {formatNumber(analytics.profileViews)}
                  </span>
                  <span className="profile-header__stat-label">
                    Profile Views
                  </span>
                </div>
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">
                    {analytics.popularityScore.toFixed(1)}
                  </span>
                  <span className="profile-header__stat-label">
                    Popularity Score
                  </span>
                </div>
              </>
            )}

            {reputation &&
              reputation.metrics &&
              typeof reputation.metrics.averageRating === 'number' && (
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">
                    {reputation.metrics.averageRating.toFixed(1)} ⭐
                  </span>
                  <span className="profile-header__stat-label">
                    ({reputation.metrics.gigsCompleted || 0} gigs)
                  </span>
                </div>
              )}

            {user.roles.includes('INFLUENCER') && user.estimatedFollowers && (
              <div className="profile-header__stat">
                <span className="profile-header__stat-value">
                  {formatNumber(user.estimatedFollowers)}
                </span>
                <span className="profile-header__stat-label">Followers</span>
              </div>
            )}
          </div>

          {/* Static Action Buttons */}
          <div className="profile-header__actions">
            {showEditButton ? (
              <div className="profile-header__owner-actions">
                <a href="/profile/edit" className="profile-header__edit-btn">
                  ✏️ Edit Profile
                </a>
              </div>
            ) : (
              <div className="profile-header__public-actions">
                <button className="profile-header__contact-btn">
                  💬 Contact
                </button>
                <button className="profile-header__follow-btn">
                  ⭐ Follow
                </button>
              </div>
            )}
            <button className="profile-header__share-btn">
              🔗 Share Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderStatic;
