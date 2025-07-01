'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Home,
  Search,
  Mail,
  FolderOpen,
  Plus,
  Megaphone,
  BarChart3,
  Users,
  Shield,
  Settings,
  User,
  Building2,
} from 'lucide-react';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  roles?: string[];
}

export const BottomNavigation: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { getUserType, hasPermission, hasRole } = usePermissions();
  const pathname = usePathname();

  if (!isAuthenticated || !user) {
    return null;
  }

  const userType = getUserType();

  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        path: '/dashboard',
        label: 'Home',
        icon: Home,
      },
    ];

    // Creator-specific navigation
    if (userType === 'creator') {
      baseItems.push(
        {
          path: '/marketplace',
          label: 'Browse',
          icon: Search,
          permission: 'gig.view',
        },
        {
          path: '/my/applications',
          label: 'Applications',
          icon: Mail,
        },
        {
          path: '/portfolio',
          label: 'Portfolio',
          icon: FolderOpen,
          permission: 'portfolio.manage',
        }
      );
    }

    // Brand-specific navigation
    if (userType === 'brand') {
      baseItems.push(
        {
          path: '/create-gig',
          label: 'Create',
          icon: Plus,
          permission: 'gig.create',
        },
        {
          path: '/my/campaigns',
          label: 'Campaigns',
          icon: Megaphone,
        },
        {
          path: '/analytics',
          label: 'Analytics',
          icon: BarChart3,
          permission: 'analytics.view',
        }
      );
    }

    // Admin navigation
    if (userType === 'admin') {
      baseItems.push(
        {
          path: '/admin/users',
          label: 'Users',
          icon: Users,
          permission: 'users.manage',
        },
        {
          path: '/admin/moderation',
          label: 'Moderation',
          icon: Shield,
          permission: 'content.moderate',
        },
        {
          path: '/admin/system',
          label: 'System',
          icon: Settings,
          permission: 'system.configure',
        }
      );
    }

    // Common items for all users
    baseItems.push(
      {
        path: '/clans',
        label: 'Clans',
        icon: Building2,
      },
      {
        path: '/profile',
        label: 'Profile',
        icon: User,
      }
    );

    // Limit to 5 items for better mobile UX
    return baseItems.slice(0, 5);
  };

  const navigationItems = getNavigationItems().filter((item) => {
    // Filter based on permissions
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    if (item.roles && !item.roles.some((role) => hasRole(role as any))) {
      return false;
    }
    return true;
  });

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="pb-safe fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path as any}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center py-2 transition-all duration-200 ${
                active
                  ? 'scale-105 text-[#6BC5F2]'
                  : 'text-gray-600 hover:text-[#6BC5F2]'
              }`}
            >
              <div
                className={`mb-1 transition-transform duration-200 ${
                  active ? 'scale-110' : ''
                }`}
              >
                <IconComponent 
                  className={`h-6 w-6 ${
                    active ? 'text-[#247eab]' : 'text-gray-600'
                  }`} 
                />
              </div>
              <span
                className={`max-w-full truncate text-xs font-medium leading-none ${
                  active ? 'text-[#247eab]' : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-[#247eab]"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};