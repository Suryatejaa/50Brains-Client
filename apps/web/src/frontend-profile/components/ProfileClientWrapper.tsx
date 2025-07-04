'use client';

// components/ProfileClientWrapper.tsx - Client wrapper for authenticated user profile
import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import ProfilePage from './ProfilePage';

// Client Component wrapper for authenticated users
const ProfileClientWrapper: React.FC = () => {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
};

export default ProfileClientWrapper;
