// components/ProfilePage.tsx
import React from 'react';
import { useProfile } from '../hooks/useProfile';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import './ProfilePage.css';
import './common/ComponentStyles.css';

interface ProfilePageProps {
  userId?: string; // If provided, shows public profile; otherwise shows own profile
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const {
    profile,
    isLoading,
    hasError,
    errors,
    isOwner,
    editing,
    updateProfileSection,
    startEditing,
    cancelEditing,
    refreshSection,
  } = useProfile(userId);

  if (isLoading && !profile) {
    return (
      <div className="profile-page loading">
        <LoadingSpinner size="large" message="Loading profile..." />
      </div>
    );
  }

  if (hasError && !profile) {
    return (
      <div className="profile-page error">
        <ErrorMessage
          title="Failed to Load Profile"
          message={errors.general || 'Please try again later'}
          showRetry
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!profile?.user) {
    return (
      <div className="profile-page not-found">
        <ErrorMessage
          title="Profile Not Found"
          message="The requested user profile could not be found"
        />
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Profile Header Section */}
      <ProfileHeader
        user={profile.user}
        analytics={profile.analytics}
        reputation={profile.reputation}
        isOwner={isOwner}
        isEditing={editing.section === 'header'}
        onEditClick={() =>
          startEditing('header', {
            firstName: profile.user.firstName,
            lastName: profile.user.lastName,
            bio: profile.user.bio,
            location: profile.user.location,
            profilePicture: profile.user.profilePicture,
            coverImage: profile.user.coverImage,
          })
        }
        onSaveEdit={async (data) => {
          const result = await updateProfileSection('basicInfo', data);
          if (result && !result.success) {
            // Handle error
            console.error('Failed to update header:', result.error);
          }
        }}
        onCancelEdit={cancelEditing}
      />

      {/* Profile Content Tabs */}
      <ProfileTabs
        profile={profile}
        isOwner={isOwner}
        editing={editing}
        onStartEditing={startEditing}
        onUpdateSection={updateProfileSection}
        onCancelEditing={cancelEditing}
        onRefreshSection={refreshSection}
      />

      {/* Loading overlay for updates */}
      {isLoading && profile && (
        <div className="profile-page__loading-overlay">
          <LoadingSpinner size="medium" message="Updating..." />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
