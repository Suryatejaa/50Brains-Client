// app/profile/page.tsx - SSR Profile Page for Current User
import { redirect } from 'next/navigation';
import ProfileClientWrapper from '@/frontend-profile/components/ProfileClientWrapper';

// Server Component for current user's profile
export default function CurrentUserProfilePage() {
  // For current user's profile, we need authentication
  // This will be handled by the client wrapper for now
  return <ProfileClientWrapper />;
}
