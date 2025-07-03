'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import ProfilePage from '@/frontend-profile/components/ProfilePage';

export default function ProfilePageRoute() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
