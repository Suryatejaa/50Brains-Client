// components/ProfileHeader.tsx
import React, { useState } from 'react'
import { UserProfileData, AnalyticsData, ReputationData } from '../types/profile.types'
import RoleBadges from './common/RoleBadges'
import EditableField from './common/EditableField'
import ImageUpload from './common/ImageUpload'
import './ProfileHeader.css'

interface ProfileHeaderProps {
  user: UserProfileData
  analytics?: AnalyticsData | null
  reputation?: ReputationData | null
  isOwner: boolean
  isEditing: boolean
  onEditClick: () => void
  onSaveEdit: (data: any) => Promise<void>
  onCancelEdit: () => void
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  analytics,
  reputation,
  isOwner,
  isEditing,
  onEditClick,
  onSaveEdit,
  onCancelEdit
}) => {
  const [editData, setEditData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    location: user.location || '',
    profilePicture: user.profilePicture || '',
    coverImage: user.coverImage || ''
  })

  const handleSave = async () => {
    await onSaveEdit(editData)
  }

  const handleCancel = () => {
    setEditData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      location: user.location || '',
      profilePicture: user.profilePicture || '',
      coverImage: user.coverImage || ''
    })
    onCancelEdit()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="profile-header">
      {/* Cover Image */}
      <div className="profile-header__cover">
        {isEditing ? (
          <ImageUpload
            value={editData.coverImage}
            onChange={(url) => setEditData({ ...editData, coverImage: url })}
            type="cover"
            placeholder="Upload cover image"
          />
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
        <div className="profile-header__main">
          {/* Profile Picture */}
          <div className="profile-header__avatar">
            {isEditing ? (
              <ImageUpload
                value={editData.profilePicture}
                onChange={(url) => setEditData({ ...editData, profilePicture: url })}
                type="avatar"
                placeholder="Upload profile picture"
              />
            ) : (
              <img 
                src={user.profilePicture || '/default-avatar.jpg'} 
                alt={`${user.firstName} ${user.lastName}`}
                className="profile-header__avatar-image"
              />
            )}
          </div>

          {/* Basic Info */}
          <div className="profile-header__info">
            <div className="profile-header__name">
              {isEditing ? (
                <div className="profile-header__name-edit">
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    placeholder="First name"
                    className="profile-header__name-input"
                  />
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    placeholder="Last name"
                    className="profile-header__name-input"
                  />
                </div>
              ) : (
                <h1 className="profile-header__full-name">
                  {user.firstName} {user.lastName}
                </h1>
              )}
              <p className="profile-header__username">@{user.username}</p>
            </div>

            <RoleBadges roles={user.roles} />

            {/* Location */}
            {(user.location || isEditing) && (
              <div className="profile-header__location">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    placeholder="Location"
                    className="profile-header__location-input"
                  />
                ) : (
                  <span className="profile-header__location-text">
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
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="profile-header__bio-textarea"
                  rows={3}
                />
              ) : (
                <p className="profile-header__bio-text">
                  {user.bio || 'No bio available'}
                </p>
              )}
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
                  <span className="profile-header__stat-label">Profile Views</span>
                </div>
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">
                    {analytics.popularityScore.toFixed(1)}
                  </span>
                  <span className="profile-header__stat-label">Popularity Score</span>
                </div>
              </>
            )}
            
            {reputation && (
              <div className="profile-header__stat">
                <span className="profile-header__stat-value">
                  {reputation.overallRating.toFixed(1)} ⭐
                </span>
                <span className="profile-header__stat-label">
                  ({reputation.totalReviews} reviews)
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

          {/* Action Buttons */}
          <div className="profile-header__actions">
            {isEditing ? (
              <div className="profile-header__edit-actions">
                <button 
                  onClick={handleSave}
                  className="profile-header__save-btn"
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleCancel}
                  className="profile-header__cancel-btn"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {isOwner ? (
                  <button 
                    onClick={onEditClick}
                    className="profile-header__edit-btn"
                  >
                    ✏️ Edit Profile
                  </button>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
