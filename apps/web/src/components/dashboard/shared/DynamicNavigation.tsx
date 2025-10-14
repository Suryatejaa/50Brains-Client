'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';

type UserRole =
  | 'USER'
  | 'INFLUENCER'
  | 'BRAND'
  | 'CREW'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  permission?: string;
  role?: UserRole;
}

export const DynamicNavigation: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();

  if (!isAuthenticated || !user) {
    return null;
  }

  const userType = getUserTypeForRole(currentRole);

  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { path: '/profile', label: 'Profile', icon: '👤' },
    ];

    // Creator-specific navigation
    if (userType === 'creator') {
      baseItems.push(
        {
          path: '/marketplace',
          label: 'Browse Gigs',
          icon: '🔍',
          permission: 'gig.view',
        },
        { path: '/my/applications', label: 'My Applications', icon: '📨' },
        { path: '/my/submissions', label: 'My Submissions', icon: '📝' },
        {
          path: '/portfolio',
          label: 'Portfolio',
          icon: '📁',
          permission: 'portfolio.manage',
        },
        {
          path: '/social-media',
          label: 'Social Media',
          icon: '📱',
          permission: 'social.link',
        }
      );
    }

    // Brand-specific navigation
    if (userType === 'brand') {
      baseItems.push(
        {
          path: '/create-gig',
          label: 'Create Campaign',
          icon: '➕',
          permission: 'gig.create',
        },
        { path: '/my-gigs', label: 'My Gigs', icon: '📢' },
        { path: '/my/submissions', label: 'Review Submissions', icon: '📝' },
        {
          path: '/influencers/search',
          label: 'Find Influencers',
          icon: '🔍',
          permission: 'influencer.search',
        },
        {
          path: '/analytics',
          label: 'Analytics',
          icon: '📊',
          permission: 'analytics.view',
        }
      );
    }

    // Clan-related navigation (available to all users)
    baseItems.push({ path: '/clans', label: 'Clans', icon: '👥' });

    // Admin navigation
    if (userType === 'admin') {
      baseItems.push(
        {
          path: '/admin/users',
          label: 'User Management',
          icon: '👤',
          permission: 'users.manage',
        },
        {
          path: '/admin/moderation',
          label: 'Moderation',
          icon: '⚠️',
          permission: 'content.moderate',
        },
        {
          path: '/admin/system',
          label: 'System',
          icon: '⚙️',
          permission: 'system.configure',
        }
      );
    }

    // Credits (available to all)
    baseItems.push({ path: '/credits', label: 'Credits', icon: '💰' });

    return baseItems;
  };

  const navigationItems = getNavigationItems().filter((item) => {
    // Filter based on permissions
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    if (item.role && !hasRole(item.role)) {
      return false;
    }
    return true;
  });

  return (
    <nav className="hidden items-center space-x-6 md:flex">
      {navigationItems.map((item) => (
        <Link
          key={item.path}
          href={item.path as any}
          className="text-body hover:text-accent flex items-center space-x-2 font-medium transition-colors duration-200"
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};
