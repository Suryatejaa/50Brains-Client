'use client';

// components/ProfileClientActions.tsx - Client Component for interactive actions
import React from 'react';
import { CompleteProfileData } from '../types/profile.types';
import { useProfile } from '../hooks/useProfile';

interface ProfileClientActionsProps {
  userId: string;
  initialProfileData: CompleteProfileData;
}

// Client Component for profile editing and interactions
const ProfileClientActions: React.FC<ProfileClientActionsProps> = ({
  userId,
  initialProfileData,
}) => {
  const {
    profile,
    editing,
    updateProfileSection,
    startEditing,
    cancelEditing,
    isLoading,
  } = useProfile();

  // This component handles all the interactive editing functionality
  // that requires client-side state management

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4">
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <div className="border-primary-500 h-6 w-6 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-client-actions">
      {/* Floating Edit Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() =>
            startEditing('header', {
              firstName: initialProfileData.user.firstName,
              lastName: initialProfileData.user.lastName,
              bio: initialProfileData.user.bio,
              location: initialProfileData.user.location,
            })
          }
          className="bg-primary-500 hover:bg-primary-600 rounded-full p-4 text-white shadow-lg transition-all duration-200"
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* Edit Modal/Overlay */}
      {editing.section && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Edit Profile</h3>
            {/* Edit form content would go here */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => updateProfileSection('basicInfo', editing.data)}
                className="btn btn-primary flex-1"
              >
                Save Changes
              </button>
              <button
                onClick={cancelEditing}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileClientActions;
