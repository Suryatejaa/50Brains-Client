'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { CreatorDashboardClient } from './creator/CreatorDashboardClient';
import { InfluencerDashboard } from './influencer/InfluencerDashboard';
import { CrewDashboard } from './crew/CrewDashboard';
import { BrandDashboard } from './brand/BrandDashboard';
import { ClanDashboard } from './clan/ClanDashboard';
import { AdminDashboard } from './admin/AdminDashboard';
import { RoleSwitchDebugger } from '../debug/RoleSwitchDebugger';

export const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasRole } = usePermissions();
  const { currentRole, availableRoles, getUserTypeForRole } = useRoleSwitch();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-3 text-center md:p-3">
          <div className="border-brand-primary mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent md:mb-4 md:h-8 md:w-8"></div>
          <p className="text-muted text-sm md:text-base">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    window.location.href = '/login';
    return null;
  }

  const userType = getUserTypeForRole(currentRole);

  // Add debugging for role switching - only log when role changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🎭 Dashboard Routing - Current Role: ${currentRole}, User Type: ${userType}, Available Roles:`,
        availableRoles
      );
    }
  }, [currentRole, userType, availableRoles]);

  // If user can switch roles, show a role indicator
  const showRoleDebugInfo =
    process.env.NODE_ENV === 'development' && availableRoles.length > 1;

  // Route to appropriate dashboard based on current active role
  switch (userType) {
    case 'creator':
      // Route to specific dashboard based on exact role
      if (currentRole === 'INFLUENCER') {
        return (
          <div>
            {showRoleDebugInfo && (
              <div className="mb-2 rounded-md border border-pink-300 bg-pink-100 px-2 py-1 text-sm text-pink-800 md:mb-4 md:px-4 md:py-2">
                🎨 Influencer Dashboard Active | Role: {currentRole} |
                Available: {availableRoles.join(', ')}
              </div>
            )}
            <InfluencerDashboard />
          </div>
        );
      } else if (currentRole === 'CREW') {
        return (
          <div>
            {showRoleDebugInfo && (
              <div className="mb-2 rounded-md border border-orange-300 bg-orange-100 px-2 py-1 text-sm text-orange-800 md:mb-4 md:px-4 md:py-2">
                🎬 Crew Dashboard Active | Role: {currentRole} | Available:{' '}
                {availableRoles.join(', ')}
              </div>
            )}
            <CrewDashboard />
          </div>
        );
      } else {
        // Generic creator dashboard for other creator types
        return (
          <div>
            {showRoleDebugInfo && (
              <div className="mb-2 rounded-md border border-purple-300 bg-purple-100 px-2 py-1 text-sm text-purple-800 md:mb-4 md:px-4 md:py-2">
                🎨 Creator Dashboard Active | Role: {currentRole} | Available:{' '}
                {availableRoles.join(', ')}
              </div>
            )}
            <CreatorDashboardClient userId={user.id} />
          </div>
        );
      }

    case 'brand':
      return (
        <div>
          {/* <RoleSwitchDebugger /> */}
          {showRoleDebugInfo && (
            <div className="mb-2 rounded-md border border-blue-300 bg-blue-100 px-2 py-1 text-sm text-blue-800 md:mb-4 md:px-4 md:py-2">
              🏢 Brand Dashboard Active | Role: {currentRole} | Available:{' '}
              {availableRoles.join(', ')}
            </div>
          )}
          <BrandDashboard />
        </div>
      );

    case 'admin':
    case 'moderator':
      return (
        <div>
          {showRoleDebugInfo && (
            <div className="mb-2 rounded-md border border-red-300 bg-red-100 px-2 py-1 text-sm text-red-800 md:mb-4 md:px-4 md:py-2">
              ⚡ Admin Dashboard Active | Role: {currentRole} | Available:{' '}
              {availableRoles.join(', ')}
            </div>
          )}
          <AdminDashboard />
        </div>
      );

    default:
      // Check if user has admin or moderator roles that might want clan management
      if (hasRole('ADMIN') || hasRole('SUPER_ADMIN') || hasRole('MODERATOR')) {
        return (
          <div>
            {showRoleDebugInfo && (
              <div className="mb-2 rounded-md border border-green-300 bg-green-100 px-2 py-1 text-sm text-green-800 md:mb-4 md:px-4 md:py-2">
                👥 Clan Dashboard Active | Role: {currentRole} | Available:{' '}
                {availableRoles.join(', ')}
              </div>
            )}
            <ClanDashboard />
          </div>
        );
      }

      // Default user dashboard (basic functionality)
      return (
        <div className="min-h-screen bg-gray-50 px-3 py-2 md:p-3">
          {/* <RoleSwitchDebugger /> */}
          {showRoleDebugInfo && (
            <div className="mb-2 rounded-md border border-yellow-300 bg-yellow-100 px-2 py-1 text-sm text-yellow-800 md:mb-4 md:px-4 md:py-2">
              🚀 Default Dashboard Active | Role: {currentRole} | Available:{' '}
              {availableRoles.join(', ')}
            </div>
          )}
          <div className="mx-auto max-w-7xl">
            <div className="card-glass p-3 text-center md:p-3">
              <span className="mb-2 block text-3xl md:mb-4 md:text-4xl">
                👋
              </span>
              <h2 className="text-heading mb-1 text-lg font-semibold md:mb-2 md:text-xl">
                Welcome to 50BraIns!
              </h2>
              <p className="text-muted mb-3 text-sm md:mb-6 md:text-base">
                To get started, please complete your profile and select your
                role.
              </p>

              <div className="mb-3 grid grid-cols-1 gap-2 md:mb-6 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                <div className="card-glass p-2 text-center md:p-4">
                  <span className="mb-1 block text-xl md:mb-2 md:text-2xl">
                    🎨
                  </span>
                  <h3 className="mb-1 text-sm font-semibold md:mb-2 md:text-base">
                    Creator
                  </h3>
                  <p className="text-muted mb-2 text-xs md:mb-3 md:text-sm">
                    Showcase your talent and find opportunities
                  </p>
                  <button
                    onClick={() =>
                      (window.location.href = '/profile/setup?role=creator')
                    }
                    className="btn-primary w-full py-1.5 text-sm md:py-2 md:text-base"
                  >
                    Become a Creator
                  </button>
                </div>

                <div className="card-glass p-2 text-center md:p-4">
                  <span className="mb-1 block text-xl md:mb-2 md:text-2xl">
                    🏢
                  </span>
                  <h3 className="mb-1 text-sm font-semibold md:mb-2 md:text-base">
                    Brand
                  </h3>
                  <p className="text-muted mb-2 text-xs md:mb-3 md:text-sm">
                    Find and collaborate with creators
                  </p>
                  <button
                    onClick={() =>
                      (window.location.href = '/profile/setup?role=brand')
                    }
                    className="btn-primary w-full py-1.5 text-sm md:py-2 md:text-base"
                  >
                    Setup Brand
                  </button>
                </div>

                <div className="card-glass p-2 text-center md:p-4">
                  <span className="mb-1 block text-xl md:mb-2 md:text-2xl">
                    👥
                  </span>
                  <h3 className="mb-1 text-sm font-semibold md:mb-2 md:text-base">
                    Join Clan
                  </h3>
                  <p className="text-muted mb-2 text-xs md:mb-3 md:text-sm">
                    Connect with like-minded creators
                  </p>
                  <button
                    onClick={() => (window.location.href = '/clans/browse')}
                    className="btn-primary w-full py-1.5 text-sm md:py-2 md:text-base"
                  >
                    Explore Clans
                  </button>
                </div>
              </div>

              <div className="space-x-2 md:space-x-4">
                <button
                  onClick={() => (window.location.href = '/marketplace')}
                  className="btn-secondary px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base"
                >
                  Browse Marketplace
                </button>
                <button
                  onClick={() => (window.location.href = '/profile/edit')}
                  className="btn-secondary px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base"
                >
                  Complete Profile
                </button>
              </div>

              {/* User info */}
              <div className="mt-3 border-t border-gray-200 pt-3 md:mt-6 md:pt-6">
                <div className="text-muted text-xs md:text-sm">
                  <p>
                    Logged in as:{' '}
                    <span className="font-medium">{user.email}</span>
                  </p>
                  <p>
                    Current role:{' '}
                    <span className="font-medium">{currentRole}</span>
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
