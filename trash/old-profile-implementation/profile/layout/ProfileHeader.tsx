import React from 'react';
import {
  User,
  Camera,
  Upload,
  Edit3,
  Save,
  X,
  MapPin,
  Star,
  CheckCircle,
  Info,
} from 'lucide-react';
import { RoleManager } from '../shared/RoleManager';
import { ProfileHeaderProps } from '../types';
import { useAuth } from '../../../hooks/useAuth';

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  userRoles,
  isEditing,
  isSaving,
  completionPercentage,
  incompleteSections,
  onEdit,
  onSave,
  onCancel,
  onUpdate,
}) => {
  const { user } = useAuth();
  // profileData IS the user object from the API response
  const userData = profileData;
  const isVerified = userData.emailVerified && userData.profilePicture;

  console.log(userData.crewSkills);

  return (
    <>
      {/* Enhanced Cover Photo Section */}
      <div className="relative h-80 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600">
        {userData.coverImage ? (
          <img
            src={userData.coverImage}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-white">
              <Camera className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <p className="text-lg opacity-75">
                Add a cover photo to personalize your profile
              </p>
            </div>
          </div>
        )}

        {isEditing && (
          <button className="absolute bottom-4 right-4 flex items-center space-x-2 rounded-none bg-black/50 px-4 py-2 text-white transition-colors hover:bg-black/60">
            <Upload className="h-4 w-4" />
            <span>Change Cover</span>
          </button>
        )}

        {/* Profile completion overlay */}
        {completionPercentage < 100 && (
          <div className="absolute left-4 top-4 rounded-none bg-black/50 px-4 py-2 text-white">
            <div className="text-sm">
              Profile {completionPercentage}% complete
            </div>
            <div className="mt-1 h-1 w-32 rounded-none bg-white/30">
              <div
                className="h-1 rounded-none bg-white transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Profile Header */}
      <div className="relative px-6">
        <div className="relative -mt-20 flex flex-col items-center sm:flex-row sm:items-end sm:space-x-6">
          {/* Enhanced Profile Picture */}
          <div className="relative">
            <div className="h-40 w-40 overflow-hidden rounded-none border-4 border-white bg-gray-200 shadow-lg">
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <User className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>

            {/* Verification Badge */}
            {isVerified && (
              <div className="absolute -bottom-2 -right-2 rounded-none bg-green-500 p-2 text-white">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}

            {isEditing && (
              <button className="absolute bottom-2 right-2 rounded-none bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600">
                <Camera className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Enhanced Profile Info */}
          <div className="mt-6 flex-1 text-center sm:mt-0 sm:text-left">
            <div className="flex flex-col items-center sm:flex-row sm:items-start sm:justify-between">
              <div className="mt-10">
                <h1 className="text-3xl font-bold text-gray-900">
                  {userData.username ||
                    `${userData.firstName} ${userData.lastName}`.trim() ||
                    'Anonymous User'}
                </h1>
                <p className="text-lg text-gray-600">
                  @{userData.username || userData.email?.split('@')[0]}
                </p>

                {/* Role Badges */}
                <RoleManager
                  userRoles={userRoles}
                  isEditing={isEditing}
                  onUpdate={onUpdate}
                />

                <div className="mt-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={
                        userData.designationTitle || userData.primaryNiche || ''
                      }
                      onChange={(e) =>
                        onUpdate('designationTitle', e.target.value)
                      }
                      className="w-full rounded-none border border-gray-300 px-3 py-1 text-sm sm:w-auto"
                      placeholder="Your current role or position"
                    />
                  ) : (
                    (userData.designationTitle || userData.primaryNiche) && (
                      <p className="text-gray-600">
                        {userData.designationTitle || userData.primaryNiche}
                      </p>
                    )
                  )}
                </div>

                {userData.location && (
                  <p className="mt-1 flex items-center text-gray-600">
                    <MapPin className="mr-1 h-4 w-4" />
                    {userData.location}
                  </p>
                )}

                {/* Bio */}
                {userData.bio && (
                  <p className="mt-2 max-w-md text-sm text-gray-700">
                    {userData.bio}
                  </p>
                )}

                {/* Performance Metrics */}
                <div className="mt-3 flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="mr-1 h-4 w-4 text-yellow-500" />
                    4.8 (12 reviews)
                  </div>
                  <div className="text-sm text-gray-600">
                    {userData.estimatedFollowers
                      ? `${(userData.estimatedFollowers / 1000).toFixed(0)}K followers`
                      : '0 projects completed'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex space-x-3 sm:mt-0">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={onSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2 rounded-none bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={onCancel}
                      className="flex items-center space-x-2 rounded-none bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onEdit}
                    className="flex items-center space-x-2 rounded-none bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Suggestions */}
        {incompleteSections.length > 0 && (
          <div className="mt-6 rounded-none border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start">
              <Info className="mr-3 mt-0.5 h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  Complete Your Profile
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Add the following to improve your profile visibility:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {incompleteSections.slice(0, 3).map((section: any) => (
                    <span
                      key={section.id}
                      className="inline-flex items-center rounded bg-amber-100 px-2 py-1 text-xs text-amber-800"
                    >
                      {section.title}
                    </span>
                  ))}
                  {incompleteSections.length > 3 && (
                    <span className="text-xs text-amber-700">
                      +{incompleteSections.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
