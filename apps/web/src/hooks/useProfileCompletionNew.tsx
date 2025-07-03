'use client';
import { useState, useEffect } from 'react';

interface ProfileCompletionData {
  // Basic Info
  basicInfo: boolean;
  bio: boolean;
  profilePicture: boolean;
  coverPhoto: boolean;

  // Contact & Location
  contact: boolean;
  location: boolean;

  // Professional
  contentCategories: boolean;
  primaryNiche: boolean;

  // Social Media
  socialMedia: boolean;

  // Verification
  emailVerified: boolean;
}

interface CompletionSection {
  id: keyof ProfileCompletionData;
  title: string;
  description: string;
  weight: number;
}

const COMPLETION_SECTIONS: CompletionSection[] = [
  {
    id: 'basicInfo',
    title: 'Basic Information',
    description: 'Complete your basic profile details',
    weight: 20,
  },
  {
    id: 'bio',
    title: 'Professional Bio',
    description: 'Tell others about yourself',
    weight: 15,
  },
  {
    id: 'profilePicture',
    title: 'Profile Picture',
    description: 'Add a professional photo',
    weight: 15,
  },
  {
    id: 'coverPhoto',
    title: 'Cover Photo',
    description: 'Personalize your profile with a cover image',
    weight: 10,
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Add ways for others to reach you',
    weight: 10,
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Help others find you',
    weight: 5,
  },
  {
    id: 'contentCategories',
    title: 'Content Categories',
    description: 'Specify your content areas',
    weight: 10,
  },
  {
    id: 'primaryNiche',
    title: 'Primary Niche',
    description: 'Define your main focus area',
    weight: 10,
  },
  {
    id: 'socialMedia',
    title: 'Social Media',
    description: 'Connect your social accounts',
    weight: 10,
  },
  {
    id: 'emailVerified',
    title: 'Email Verification',
    description: 'Verify your email address',
    weight: 15,
  },
];

export function useProfileCompletion() {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [incompleteSections, setIncompleteSections] = useState<
    CompletionSection[]
  >([]);

  const calculateCompletion = (profileData: any): number => {
    if (!profileData) return 0;

    const completionData: ProfileCompletionData = {
      basicInfo: !!(
        profileData.firstName &&
        profileData.lastName &&
        profileData.username
      ),
      bio: !!(profileData.bio && profileData.bio.trim().length >= 20),
      profilePicture: !!profileData.profilePicture,
      coverPhoto: !!profileData.coverImage,
      contact: !!(profileData.phone || profileData.website),
      location: !!profileData.location,
      contentCategories: !!(
        profileData.contentCategories &&
        profileData.contentCategories.length > 0
      ),
      primaryNiche: !!profileData.primaryNiche,
      socialMedia: !!(
        profileData.instagramHandle ||
        profileData.twitterHandle ||
        profileData.linkedinHandle ||
        profileData.youtubeHandle
      ),
      emailVerified: !!profileData.emailVerified,
    };

    let totalWeight = 0;
    let completedWeight = 0;
    const incomplete: CompletionSection[] = [];

    COMPLETION_SECTIONS.forEach((section) => {
      totalWeight += section.weight;
      if (completionData[section.id]) {
        completedWeight += section.weight;
      } else {
        incomplete.push(section);
      }
    });

    const percentage =
      totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    setCompletionPercentage(percentage);
    setIncompleteSections(incomplete);

    return percentage;
  };

  const refetchProfile = async () => {
    console.log('Refetching profile...');
    // This would typically fetch fresh data and recalculate
  };

  return {
    completionPercentage,
    incompleteSections,
    refetchProfile,
    calculateCompletion,
  };
}

export default useProfileCompletion;
