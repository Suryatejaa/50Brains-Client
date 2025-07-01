'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { CreatorDashboard } from './creator/CreatorDashboard';
import { BrandDashboard } from './brand/BrandDashboard';
import { ClanDashboard } from './clan/ClanDashboard';
import { AdminDashboard } from './admin/AdminDashboard';

export const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { getUserType, getPrimaryRole, hasRole } = usePermissions();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-8 text-center">
          <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    window.location.href = '/login';
    return null;
  }

  const userType = getUserType();
  const primaryRole = getPrimaryRole();

  // Route to appropriate dashboard based on user type/role
  switch (userType) {
    case 'creator':
      return <CreatorDashboard />;

    case 'brand':
      return <BrandDashboard />;

    case 'admin':
    case 'moderator':
      return <AdminDashboard />;

    default:
      // Check if user has admin or moderator roles that might want clan management
      if (hasRole('ADMIN') || hasRole('SUPER_ADMIN') || hasRole('MODERATOR')) {
        return <ClanDashboard />;
      }

      // Default user dashboard (basic functionality)
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="card-glass p-8 text-center">
              <span className="mb-4 block text-4xl">👋</span>
              <h2 className="text-heading mb-2 text-xl font-semibold">
                Welcome to 50BraIns!
              </h2>
              <p className="text-muted mb-6">
                To get started, please complete your profile and select your
                role.
              </p>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="card-glass p-4 text-center">
                  <span className="mb-2 block text-2xl">🎨</span>
                  <h3 className="mb-2 font-semibold">Creator</h3>
                  <p className="text-muted mb-3 text-sm">
                    Showcase your talent and find opportunities
                  </p>
                  <button
                    onClick={() =>
                      (window.location.href = '/profile/setup?role=creator')
                    }
                    className="btn-primary w-full"
                  >
                    Become a Creator
                  </button>
                </div>

                <div className="card-glass p-4 text-center">
                  <span className="mb-2 block text-2xl">🏢</span>
                  <h3 className="mb-2 font-semibold">Brand</h3>
                  <p className="text-muted mb-3 text-sm">
                    Find and collaborate with creators
                  </p>
                  <button
                    onClick={() =>
                      (window.location.href = '/profile/setup?role=brand')
                    }
                    className="btn-primary w-full"
                  >
                    Setup Brand
                  </button>
                </div>

                <div className="card-glass p-4 text-center">
                  <span className="mb-2 block text-2xl">👥</span>
                  <h3 className="mb-2 font-semibold">Join Clan</h3>
                  <p className="text-muted mb-3 text-sm">
                    Connect with like-minded creators
                  </p>
                  <button
                    onClick={() => (window.location.href = '/clans/browse')}
                    className="btn-primary w-full"
                  >
                    Explore Clans
                  </button>
                </div>
              </div>

              <div className="space-x-4">
                <button
                  onClick={() => (window.location.href = '/marketplace')}
                  className="btn-secondary"
                >
                  Browse Marketplace
                </button>
                <button
                  onClick={() => (window.location.href = '/profile/edit')}
                  className="btn-secondary"
                >
                  Complete Profile
                </button>
              </div>

              {/* User info */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="text-muted text-sm">
                  <p>
                    Logged in as:{' '}
                    <span className="font-medium">{user.email}</span>
                  </p>
                  <p>
                    Current role:{' '}
                    <span className="font-medium">{primaryRole}</span>
                  </p>
                  <p>
                    User type: <span className="font-medium">{userType}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }
};
