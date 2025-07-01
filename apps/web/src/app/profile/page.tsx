'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { UserAPI, UserProfile, UpdateProfileRequest } from '@/lib/user-api';
import { AuthDebugger } from '@/components/debug/AuthDebugger';
import {
  User,
  Camera,
  MapPin,
  Phone,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  Edit,
  Save,
  X,
  Upload,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const {
    completionPercentage,
    missingFields,
    isLoading: profileLoading,
    error: profileError,
    refetchProfile,
  } = useProfileCompletion();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await UserAPI.getCurrentProfile();
      console.log(response);
      if (response.success && response.data) {
        setProfileData(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileField = (field: keyof UserProfile, value: any) => {
    setProfileData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!profileData) return;

    try {
      setSaving(true);
      setError(null);

      const updateData: UpdateProfileRequest = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        phone: profileData.phone,
        website: profileData.website,
        location: profileData.location,
        currentRole: profileData.currentRole,
        isPublic: profileData.isPublic,
        allowMessages: profileData.allowMessages,
        showEmail: profileData.showEmail,
        showPhone: profileData.showPhone,
      };

      const response = await UserAPI.updateProfile(updateData);
      if (response.success && response.data) {
        setProfileData(response.data);
        setIsEditing(false);
        // Refresh profile completion
        await refetchProfile();
      } else {
        setError(response.message || 'Failed to save profile');
      }
    } catch (err) {
      setError('Failed to save profile');
      console.error('Profile save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (
      !profileData ||
      !newSkill.trim() ||
      profileData.skills?.includes(newSkill.trim())
    ) {
      return;
    }

    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            skills: [...(prev.skills || []), newSkill.trim()],
          }
        : null
    );
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    if (!profileData) return;

    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            skills: (prev.skills || []).filter(
              (skill) => skill !== skillToRemove
            ),
          }
        : null
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Failed to load profile
          </h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={fetchProfileData}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Profile not found
          </h3>
          <p className="text-gray-600">Unable to load profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Debug Tool - Remove in production */}
      <div className="px-6 pt-6">
        <AuthDebugger />
      </div>

      {/* Cover Photo Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {profileData.coverPhoto ? (
          <img
            src={profileData.coverPhoto}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Camera className="h-12 w-12 text-white/50" />
          </div>
        )}

        {isEditing && (
          <button className="absolute bottom-4 right-4 flex items-center space-x-2 rounded-lg bg-black/50 px-4 py-2 text-white">
            <Upload className="h-4 w-4" />
            <span>Change Cover</span>
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="relative px-6">
        <div className="relative -mt-16 flex flex-col items-center sm:flex-row sm:items-end sm:space-x-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-200">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-2 text-white">
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
            <div className="flex flex-col items-center sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-gray-600">@{profileData.username}</p>
                {profileData.currentRole && (
                  <p className="text-blue-600">{profileData.currentRole}</p>
                )}
                {profileData.location && (
                  <div className="flex items-center justify-center space-x-1 text-gray-500 sm:justify-start">
                    <MapPin className="h-4 w-4" />
                    <span>{profileData.location}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex space-x-3 sm:mt-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setError(null);
                      }}
                      disabled={isSaving}
                      className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Profile Completion
            </span>
            <span className="text-sm font-bold text-blue-600">
              {completionPercentage}%
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          {completionPercentage < 100 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Complete your profile to increase visibility and opportunities
              </p>
              {missingFields.length > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  Missing: {missingFields.slice(0, 3).join(', ')}
                  {missingFields.length > 3 &&
                    ` +${missingFields.length - 3} more`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200 bg-white">
        <div className="flex overflow-x-auto px-6">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'experience', label: 'Experience', icon: Briefcase },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'skills', label: 'Skills', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Bio Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                About
              </h3>
              {isEditing ? (
                <textarea
                  value={profileData.bio || ''}
                  onChange={(e) => updateProfileField('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm"
                  rows={4}
                />
              ) : (
                <p className="text-gray-600">
                  {profileData.bio ||
                    'No bio added yet. Click edit to add your bio.'}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone || ''}
                      onChange={(e) =>
                        updateProfileField('phone', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <p className="mt-1 text-gray-600">
                      {profileData.phone || 'Not provided'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.website || ''}
                      onChange={(e) =>
                        updateProfileField('website', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    <p className="mt-1 text-gray-600">
                      {profileData.website || 'Not provided'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location || ''}
                      onChange={(e) =>
                        updateProfileField('location', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="mt-1 text-gray-600">
                      {profileData.location || 'Not provided'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Current Role
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.currentRole || ''}
                      onChange={(e) =>
                        updateProfileField('currentRole', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                      placeholder="Your current job title"
                    />
                  ) : (
                    <p className="mt-1 text-gray-600">
                      {profileData.currentRole || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Social Media
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    key: 'linkedinHandle',
                    label: 'LinkedIn',
                    placeholder: 'https://linkedin.com/in/username',
                  },
                  {
                    key: 'twitterHandle',
                    label: 'Twitter',
                    placeholder: 'https://twitter.com/username',
                  },
                  {
                    key: 'instagramHandle',
                    label: 'Instagram',
                    placeholder: 'https://instagram.com/username',
                  },
                  {
                    key: 'youtubeHandle',
                    label: 'YouTube',
                    placeholder: 'https://youtube.com/channel/...',
                  },
                ].map((social) => (
                  <div key={social.key}>
                    <label className="text-sm font-medium text-gray-700">
                      {social.label}
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={(profileData as any)[social.key] || ''}
                        onChange={(e) =>
                          updateProfileField(
                            social.key as keyof UserProfile,
                            e.target.value
                          )
                        }
                        className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                        placeholder={social.placeholder}
                      />
                    ) : (
                      <p className="mt-1 text-gray-600">
                        {(profileData as any)[social.key] || 'Not provided'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Skills</h3>

            {isEditing && (
              <div className="mb-4 flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
                  placeholder="Add a skill..."
                />
                <button
                  onClick={addSkill}
                  className="flex items-center space-x-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(profileData.skills || []).map((skill, index) => (
                <span
                  key={index}
                  className="flex items-center space-x-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
              {(!profileData.skills || profileData.skills.length === 0) && (
                <p className="text-gray-500">No skills added yet.</p>
              )}
            </div>
          </div>
        )}

        {/* TODO: Add Experience and Education tabs */}
        {activeTab === 'experience' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Work Experience
            </h3>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Education
            </h3>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
