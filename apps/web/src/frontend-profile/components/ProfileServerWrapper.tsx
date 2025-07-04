// components/ProfileServerWrapper.tsx - Server Component wrapper
import React from 'react';
import { CompleteProfileData } from '../types/profile.types';
import ProfileTabsServer from './ProfileTabsServer';
import ProfileHeaderStatic from './ProfileHeaderStatic';

interface ProfileServerWrapperProps {
  initialProfileData: CompleteProfileData;
  userId: string;
  isPublicView: boolean;
}

// This is a Server Component - no 'use client' directive
const ProfileServerWrapper: React.FC<ProfileServerWrapperProps> = ({
  initialProfileData,
  userId,
  isPublicView,
}) => {
  const { user, analytics, reputation, workHistory } = initialProfileData;

  if (!user) {
    return (
      <div className="profile-page not-found">
        <div className="mx-auto max-w-md py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Profile Not Found
          </h1>
          <p className="text-gray-600">
            The requested user profile could not be found.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="profile-page">
      {/* Static Profile Header - Server Component */}
      <ProfileHeaderStatic
        user={user}
        analytics={analytics}
        reputation={reputation}
        showEditButton={!isPublicView}
      />

      {/* Profile Tabs - Server Component with Client Islands */}
      <ProfileTabsServer
        profile={initialProfileData}
        isPublicView={isPublicView}
      />

      {/* Client-side actions would go here for authenticated users */}
    </div>
  );
};

export default ProfileServerWrapper;
