'use client';

import React, { useState, useEffect } from 'react';
import { User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDataPersistence } from '../../hooks/useDataPersistence';
import useProfileCompletion from '../../hooks/useProfileCompletion';
import { UserAPI, UserProfile } from '../../lib/user-api';
import {
  ProfileHeader,
  ProfileNavigation,
  OverviewSection,
  ProfileAnalytics,
  PlaceholderSection,
} from '../../components/profile';

export default function EnhancedProfilePage() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Profile completion tracking
  const { completionPercentage, incompleteSections, refetchProfile } =
    useProfileCompletion();

  // Add data persistence
  const { cachePageData, getPageData } = useDataPersistence();

  // Load cached data first, then fetch fresh data
  useEffect(() => {
    // Try to load from cache first
    const cachedProfile = getPageData('enhanced-profile');
    if (cachedProfile) {
      setProfileData(cachedProfile.profile);
      setAnalytics(cachedProfile.analytics);
      setIsLoading(false);
      console.log('📱 Enhanced Profile loaded from cache');
    }

    // Always fetch fresh data
    fetchAllProfileData();
  }, [getPageData]);

  const fetchAllProfileData = async () => {
    try {
      if (!profileData) {
        setIsLoading(true);
      }
      setError(null);

      // Fetch profile and analytics in parallel
      const [profileResponse, analyticsResponse] = await Promise.all([
        UserAPI.getCurrentProfile(),
        UserAPI.getUserAnalytics().catch(() => ({
          success: false,
          data: null,
        })), // Analytics optional
      ]);

      console.log('📡 Enhanced Profile API Response:', {
        profileResponse,
        analyticsResponse,
      });

      if (profileResponse.success && profileResponse.data) {
        setProfileData(profileResponse.data);

        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data);
        }

        // Cache the combined data
        cachePageData('enhanced-profile', {
          profile: profileResponse.data,
          analytics: analyticsResponse.success ? analyticsResponse.data : null,
        });

        console.log('✅ Enhanced Profile data cached successfully');
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      console.error('Enhanced Profile fetch error:', err);
      // Only show error if no cached data is available
      if (!profileData) {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileField = (field: string, value: any) => {
    setProfileData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!profileData) return;

    try {
      setSaving(true);
      setError(null);

      // Check if roles were updated
      if (
        profileData.roles &&
        JSON.stringify(profileData.roles) !== JSON.stringify(user?.roles)
      ) {
        // Role updates need special handling with a different API call
        try {
          // This is where you would call an API to update user roles
          console.log(
            'Role update would be sent to backend:',
            profileData.roles
          );
          // TODO: Implement API call for role updates
          // await UserAPI.updateUserRoles(profileData.roles);
        } catch (error) {
          console.error('Error updating user roles:', error);
        }
      }

      // Prepare different update requests based on data type
      const basicUpdate = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        displayName: profileData.displayName,
        bio: profileData.bio,
        phone: profileData.phone,
        website: profileData.website,
        location: profileData.location,
        timezone: profileData.timezone,
        currentRole: profileData.currentRole,
        skills: profileData.skills,
        portfolioUrl: profileData.portfolioUrl,
        isPublic: profileData.isPublic,
        allowMessages: profileData.allowMessages,
        showEmail: profileData.showEmail,
        showPhone: profileData.showPhone,
        showLocation: profileData.showLocation,
        allowDirectBooking: profileData.allowDirectBooking,
      };

      // Update basic profile
      const response = await UserAPI.updateProfile(basicUpdate);

      if (response.success && response.data) {
        setProfileData(response.data);

        // Update role-specific data
        const userRoles = user?.roles || [];

        if (userRoles.includes('INFLUENCER')) {
          await UserAPI.updateInfluencerInfo({
            contentCategories: profileData.contentCategories,
            primaryNiche: profileData.primaryNiche,
            primaryPlatform: profileData.primaryPlatform,
            followerCount: profileData.followerCount,
            engagementRate: profileData.engagementRate,
            audienceDemographics: profileData.audienceDemographics,
          });
        }

        if (userRoles.includes('BRAND')) {
          await UserAPI.updateBrandInfo({
            companyName: profileData.companyName,
            industry: profileData.industry,
            companyType: profileData.companyType,
            companySize: profileData.companySize,
            foundedYear: profileData.foundedYear,
            campaignTypes: profileData.campaignTypes,
            marketingBudget: profileData.marketingBudget,
            targetAudience: profileData.targetAudience,
          });
        }

        if (userRoles.includes('CREW')) {
          await UserAPI.updateCrewInfo({
            crewSkills: profileData.crewSkills,
            experienceLevel: profileData.experienceLevel,
            availability: profileData.availability,
            hourlyRate: profileData.hourlyRate,
            equipment: profileData.equipment,
            certifications: profileData.certifications,
            languages: profileData.languages,
          });
        }

        // Update social handles
        await UserAPI.updateSocialHandles({
          instagramHandle: profileData.instagramHandle,
          twitterHandle: profileData.twitterHandle,
          linkedinHandle: profileData.linkedinHandle,
          youtubeHandle: profileData.youtubeHandle,
          tiktokHandle: profileData.tiktokHandle,
          facebookHandle: profileData.facebookHandle,
          snapchatHandle: profileData.snapchatHandle,
        });

        // Clear cache to force fresh data
        cachePageData('enhanced-profile', null);

        // Refresh completion data
        await refetchProfile();

        setIsEditing(false);
        console.log('✅ Enhanced Profile saved successfully');
      } else {
        setError('Failed to save profile');
      }
    } catch (err: any) {
      setError('Failed to save profile');
      console.error('Enhanced Profile save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (isLoading && !profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading your enhanced profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md p-3 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Failed to Load Profile
          </h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={fetchAllProfileData}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
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
          <User className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  const userRoles = user?.roles || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Tool - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-6 pt-6">
          <div className="rounded-lg border bg-gray-100 p-4">
            <h4 className="mb-2 font-semibold text-gray-700">Debug Info</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>User ID: {user?.id}</p>
              <p>Profile Data: {profileData ? 'Loaded' : 'Not loaded'}</p>
              <p>Completion: {completionPercentage}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <ProfileHeader
        profileData={profileData}
        userRoles={userRoles}
        isEditing={isEditing}
        isSaving={isSaving}
        completionPercentage={completionPercentage}
        incompleteSections={incompleteSections}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        onUpdate={updateProfileField}
      />

      {/* Profile Navigation */}
      <ProfileNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewSection
            profile={profileData}
            userRoles={userRoles}
            isEditing={isEditing}
            onUpdate={updateProfileField}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <ProfileAnalytics analytics={analytics} />
          </div>
        )}

        {/* Other tabs - placeholder sections */}
        {activeTab !== 'overview' && activeTab !== 'analytics' && (
          <PlaceholderSection title={activeTab} />
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-red-500 px-6 py-3 text-white shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
