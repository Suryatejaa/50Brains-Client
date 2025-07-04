// app/profile/[userId]/page.tsx - Server Component for SSR
import { notFound } from 'next/navigation';
import ProfileServerWrapper from '@/frontend-profile/components/ProfileServerWrapper';
import { getProfileData } from '@/frontend-profile/services/profileService';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

// This is a Server Component - runs on the server for SSR
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = params;

  try {
    // Fetch profile data on the server
    const profileData = await getProfileData(userId);

    if (!profileData) {
      notFound();
    }

    // Server-side rendering with initial data
    return (
      <ProfileServerWrapper
        initialProfileData={profileData}
        userId={userId}
        isPublicView={true}
      />
    );
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    notFound();
  }
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 60; // Revalidate every 60 seconds
