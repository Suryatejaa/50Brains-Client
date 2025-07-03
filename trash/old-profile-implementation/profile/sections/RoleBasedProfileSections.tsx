import React from 'react';
import { InfluencerProfile } from './InfluencerProfile';
import { BrandProfile } from './BrandProfile';
import { CrewProfile } from './CrewProfile';
import { ProfileComponentProps } from '../types';

export const RoleBasedProfileSections: React.FC<ProfileComponentProps> = ({
  profile,
  userRoles,
  isEditing,
  onUpdate,
}) => {
  const hasInfluencerRole = userRoles.includes('INFLUENCER');
  const hasBrandRole = userRoles.includes('BRAND');
  const hasCrewRole = userRoles.includes('CREW');

  return (
    <div className="space-y-6">
      {/* Influencer-Specific Section */}
      {hasInfluencerRole && (
        <InfluencerProfile
          profile={profile}
          userRoles={userRoles}
          isEditing={isEditing}
          onUpdate={onUpdate}
        />
      )}

      {/* Brand-Specific Section */}
      {hasBrandRole && (
        <BrandProfile
          profile={profile}
          userRoles={userRoles}
          isEditing={isEditing}
          onUpdate={onUpdate}
        />
      )}

      {/* Crew-Specific Section */}
      {hasCrewRole && (
        <CrewProfile
          profile={profile}
          userRoles={userRoles}
          isEditing={isEditing}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};
