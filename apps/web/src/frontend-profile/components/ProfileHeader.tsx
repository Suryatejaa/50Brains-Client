// components/ProfileHeader.tsx
import React, { useState } from 'react';
import {
  UserProfileData,
  AnalyticsData,
  ReputationData,
} from '../types/profile.types';
import RoleBadges from './common/RoleBadges';
import EditableField from './common/EditableField';
import ImageUpload from './common/ImageUpload';
import './ProfileHeader.css';

interface ProfileHeaderProps {
  user: UserProfileData;
  analytics?: AnalyticsData | null;
  reputation?: ReputationData | null;
  isOwner: boolean;
  isEditing: boolean;
  onEditClick: () => void;
  onSaveEdit: (data: any) => Promise<void>;
  onCancelEdit: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  analytics,
  reputation,
  isOwner,
  isEditing,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
}) => {
  const [editData, setEditData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    location: user.location || '',
    profilePicture: user.profilePicture || '',
    coverImage: user.coverImage || '',
  });

  const handleSave = async () => {
    await onSaveEdit(editData);
  };

  const handleCancel = () => {
    setEditData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      location: user.location || '',
      profilePicture: user.profilePicture || '',
      coverImage: user.coverImage || '',
    });
    onCancelEdit();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="profile-header">
      {/* Cover Image */}
      <div className="profile-header__cover">
        {isEditing ? (
          <div className="h-full">
            <ImageUpload
              currentImage={editData.coverImage}
              onImageChange={(file) => {
                if (file) {
                  const url = URL.createObjectURL(file);
                  setEditData({ ...editData, coverImage: url });
                } else {
                  setEditData({ ...editData, coverImage: '' });
                }
              }}
              label="Cover Image"
              className="h-full"
            />
          </div>
        ) : (
          <img
            src={user.coverImage || '/default-cover.jpg'}
            alt="Cover"
            className="profile-header__cover-image"
          />
        )}
      </div>

      {/* Profile Content */}
      <div className="profile-header__content">
        <div className="profile-header__main flex flex-col gap-2 lg:flex-row">
          {/* Profile Picture */}
          <div className="profile-header__avatar flex-shrink-0 lg:order-1">
            {isEditing ? (
              <ImageUpload
                currentImage={editData.profilePicture}
                onImageChange={(file) => {
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setEditData({ ...editData, profilePicture: url });
                  } else {
                    setEditData({ ...editData, profilePicture: '' });
                  }
                }}
                label="Profile Picture"
                aspectRatio="square"
                className="w-full max-w-xs"
              />
            ) : (
              <img
                src={user.profilePicture || '/default-avatar.jpg'}
                alt={`${user.firstName}`}
                className="profile-header__avatar-image border-2 rounded-full shadow-lg lg:h-32 lg:w-32"
              />
            )}
          </div>

          {/* Basic Info */}
          <div className="profile-header__info flex-1 lg:order-2">
            <div className="profile-header__name mb-4">
              {isEditing ? (
                <div className="profile-header__name-edit flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) =>
                      setEditData({ ...editData, firstName: e.target.value })
                    }
                    placeholder="First name"
                    className="profile-header__name-input flex-1 rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) =>
                      setEditData({ ...editData, lastName: e.target.value })
                    }
                    placeholder="Last name"
                    className="profile-header__name-input flex-1 rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <h1 className="profile-header__full-name text-2xl font-bold text-gray-900 lg:text-3xl">
                  {user.firstName} {user.lastName}
                </h1>
              )}
              <p className="profile-header__username mt-1 text-gray-600">
                @{user.username}
              </p>
            </div>

            <div className="mb-4">
              <RoleBadges roles={user.roles} />
            </div>

            {/* Location */}
            {(user.location || isEditing) && (
              <div className="profile-header__location mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) =>
                      setEditData({ ...editData, location: e.target.value })
                    }
                    placeholder="Location"
                    className="profile-header__location-input w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="profile-header__location-text text-gray-600">
                    📍 {user.location}
                  </span>
                )}
              </div>
            )}

            {/* Bio */}
            <div className="profile-header__bio">
              {isEditing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  className="profile-header__bio-textarea resize-vertical w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              ) : (
                <p className="profile-header__bio-text leading-relaxed text-gray-700">
                  {user.bio || 'No bio available'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="profile-header__sidebar mt-2 lg:mt-0">
          {/* Quick Stats */}
          <div className="profile-header__stats mb-2 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
            {analytics && (
              <>
                <div className="profile-header__stat rounded-none bg-gray-50 p-3 text-center">
                  <span className="profile-header__stat-value block text-xl font-bold text-gray-900">
                    {formatNumber(analytics.profileViews)}
                  </span>
                  <span className="profile-header__stat-label text-sm text-gray-600">
                    Profile Views
                  </span>
                </div>
                <div className="profile-header__stat rounded-none bg-gray-50 p-3 text-center">
                  <span className="profile-header__stat-value block text-xl font-bold text-gray-900">
                    {analytics.popularityScore.toFixed(1)}
                  </span>
                  <span className="profile-header__stat-label text-sm text-gray-600">
                    Popularity Score
                  </span>
                </div>
              </>
            )}

            {reputation &&
              reputation.metrics &&
              typeof reputation.metrics.averageRating === 'number' && (
                <div className="profile-header__stat rounded-none bg-gray-50 p-3 text-center">
                  <span className="profile-header__stat-value block text-xl font-bold text-gray-900">
                    {reputation.metrics.averageRating.toFixed(1)} ⭐
                  </span>
                  <span className="profile-header__stat-label text-sm text-gray-600">
                    ({reputation.metrics.gigsCompleted || 0} gigs)
                  </span>
                </div>
              )}

            {user.roles.includes('INFLUENCER') && user.estimatedFollowers && (
              <div className="profile-header__stat rounded-none bg-gray-50 p-3 text-center">
                <span className="profile-header__stat-value block text-xl font-bold text-gray-900">
                  {formatNumber(user.estimatedFollowers)}
                </span>
                <span className="profile-header__stat-label text-sm text-gray-600">
                  Followers
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="profile-header__actions">
            {isEditing ? (
              <div className="profile-header__edit-actions flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleSave}
                  className="btn btn-primary flex-1 rounded-none bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary flex-1 rounded-none bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {isOwner ? (
                  <button
                    onClick={onEditClick}
                    className="profile-header__edit-btn w-full rounded-none bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <div className="profile-header__public-actions flex flex-col gap-2 sm:flex-row">
                    <button className="profile-header__contact-btn flex-1 rounded-none bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700">
                      💬 Contact
                    </button>
                    <button className="profile-header__follow-btn flex-1 rounded-none bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700">
                      ⭐ Follow
                    </button>
                  </div>
                )}
                <button className="profile-header__share-btn w-full rounded-none bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200">
                  🔗 Share Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
