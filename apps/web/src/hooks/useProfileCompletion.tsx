'use client';

import { useState, useEffect } from 'react';
import { UserAPI, UserProfile } from '../lib/user-api';
import { useAuth } from './useAuth';

interface ProfileCompletionData {
  firstName: boolean;
  lastName: boolean;
  bio: boolean;
  phone: boolean;
  location: boolean;
  currentRole: boolean;
  skills: boolean;
  socialMedia: boolean;
  roleSpecific: boolean;
  profilePicture: boolean;
}

interface UseProfileCompletionReturn {
  completionPercentage: number;
  completionData: ProfileCompletionData;
  missingFields: string[];
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
  updateCompletion: (
    field: keyof ProfileCompletionData,
    completed: boolean
  ) => void;
  calculateCompletion: (profileData: UserProfile | any) => number;
}

export function useProfileCompletion(): UseProfileCompletionReturn {
  const { user } = useAuth();
  const [completionData, setCompletionData] = useState<ProfileCompletionData>({
    firstName: false,
    lastName: false,
    bio: false,
    phone: false,
    location: false,
    currentRole: false,
    skills: false,
    socialMedia: false,
    roleSpecific: false,
    profilePicture: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateCompletionPercentage = (
    data: ProfileCompletionData
  ): number => {
    const totalFields = Object.keys(data).length;
    const completedFields = Object.values(data).filter(Boolean).length;
    return Math.round((completedFields / totalFields) * 100);
  };

  const calculateCompletion = (profileData: UserProfile | any): number => {
    const updatedData: ProfileCompletionData = {
      firstName: profileData?.firstName && profileData.firstName.trim() !== '',
      lastName: profileData?.lastName && profileData.lastName.trim() !== '',
      bio: profileData?.bio && profileData.bio.trim() !== '',
      phone: profileData?.phone && profileData.phone.trim() !== '',
      location: profileData?.location && profileData.location.trim() !== '',
      currentRole:
        profileData?.currentRole && profileData.currentRole.trim() !== '',
      skills: profileData?.skills && profileData.skills.length > 0,
      socialMedia: !!(
        profileData?.instagramHandle ||
        profileData?.twitterHandle ||
        profileData?.linkedinHandle ||
        profileData?.youtubeHandle ||
        profileData?.tiktokHandle
      ),
      roleSpecific: calculateRoleSpecificCompletion(profileData),
      profilePicture:
        profileData?.profilePicture && profileData.profilePicture.trim() !== '',
    };

    setCompletionData(updatedData);
    return calculateCompletionPercentage(updatedData);
  };

  const calculateRoleSpecificCompletion = (
    profileData: UserProfile | any
  ): boolean => {
    if (!profileData?.role) return false;

    switch (profileData.role.toLowerCase()) {
      case 'influencer':
        return !!(
          profileData.contentCategories?.length > 0 ||
          profileData.primaryNiche ||
          profileData.primaryPlatform
        );
      case 'brand':
        return !!(
          profileData.companyName ||
          profileData.industry ||
          profileData.companyType
        );
      case 'crew':
        return !!(
          profileData.crewSkills?.length > 0 ||
          profileData.experienceLevel ||
          profileData.equipment?.length > 0
        );
      default:
        return true; // For roles without specific requirements
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await UserAPI.getCurrentProfile();
      if (response.success && response.data) {
        calculateCompletion(response.data);
      } else {
        setError(response.message || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('Failed to fetch profile');
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchProfile = async () => {
    await fetchProfile();
  };

  // Fetch profile on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const updateCompletion = (
    field: keyof ProfileCompletionData,
    completed: boolean
  ) => {
    setCompletionData((prev) => ({
      ...prev,
      [field]: completed,
    }));
  };

  const getMissingFields = (): string[] => {
    const fieldLabels: Record<keyof ProfileCompletionData, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      bio: 'Bio/About',
      phone: 'Phone Number',
      location: 'Location',
      currentRole: 'Current Role',
      skills: 'Skills',
      socialMedia: 'Social Media',
      roleSpecific: 'Role-specific Information',
      profilePicture: 'Profile Picture',
    };

    return Object.entries(completionData)
      .filter(([_, completed]) => !completed)
      .map(([field, _]) => fieldLabels[field as keyof ProfileCompletionData]);
  };

  const completionPercentage = calculateCompletionPercentage(completionData);
  const missingFields = getMissingFields();

  return {
    completionPercentage,
    completionData,
    missingFields,
    isLoading,
    error,
    refetchProfile,
    updateCompletion,
    calculateCompletion,
  };
}
