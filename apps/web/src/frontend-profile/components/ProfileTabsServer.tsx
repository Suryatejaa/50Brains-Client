// components/ProfileTabsServer.tsx - Server Component for tabs
import React from 'react';
import { CompleteProfileData } from '../types/profile.types';
import OverviewTabServer from './tabs/OverviewTabServer';
import ProfileTabsClient from './ProfileTabsClient';

interface ProfileTabsServerProps {
  profile: CompleteProfileData;
  isPublicView: boolean;
}

// Server Component that renders static content
const ProfileTabsServer: React.FC<ProfileTabsServerProps> = ({
  profile,
  isPublicView,
}) => {
  // For SSR, we'll render the Overview tab by default
  // The client component will handle tab switching
  return (
    <div className="profile-tabs">
      {/* Client Component for Interactive Tab Navigation */}
      <ProfileTabsClient defaultTab="overview" isPublicView={isPublicView} />

      {/* Server-rendered tab content */}
      <div className="profile-tabs__content">
        <OverviewTabServer profile={profile} isPublicView={isPublicView} />
      </div>
    </div>
  );
};

export default ProfileTabsServer;
