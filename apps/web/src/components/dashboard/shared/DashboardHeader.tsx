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
    <div className="card-glass dashboard-section-margin dashboard-card-padding">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading mb-1 text-2xl font-bold">{title}</h1>
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
      </div>
    </div>
  );
};
