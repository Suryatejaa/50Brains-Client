'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from './NotificationBell';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  actions,
}) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="card-glass mb-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading mb-2 text-2xl font-bold">{title}</h1>
          {subtitle ? (
            <p className="text-muted">{subtitle}</p>
          ) : (
            <p className="text-muted">
              {getGreeting()},{' '}
              {user?.firstName || user?.displayName || user?.email}! Welcome to
              your dashboard.
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {actions}
          <NotificationBell />

          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.displayName || user.email}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-white">
                  {(
                    user?.firstName?.[0] ||
                    user?.displayName?.[0] ||
                    user?.email?.[0] ||
                    'U'
                  ).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
