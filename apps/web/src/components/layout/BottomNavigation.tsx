'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { useClans } from '@/hooks/useClans';
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
  const { hasPermission, hasRole } = usePermissions();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const pathname = usePathname();
  const { clans } = useClans();

  // Calculate total pending applications across all user's clans
  const totalPendingApplications = React.useMemo(() => {
    if (!clans || clans.length === 0) return 0;

    // For now, we'll return 0 since we need to implement the full pending applications fetching
    // In a real implementation, you'd want to:
    // 1. Fetch pending applications for each clan the user owns/manages
    // 2. Sum up all pending counts
    // 3. Cache this data to avoid excessive API calls

    // This is a placeholder - the actual implementation would require:
    // - A hook to fetch pending applications for multiple clans
    // - Proper caching and state management
    // - Real-time updates when applications are approved/rejected

    return 0;
  }, [clans]);

  // Always show bottom nav for authenticated users (mobile-first approach)
  if (!isAuthenticated || !user) {
    return null;
  }

  const userType = getUserTypeForRole(currentRole);
  console.log('currentRole', currentRole);
  const getNavigationItems = (): NavigationItem[] => {
    // Core navigation that's always visible (like Instagram/TikTok)
    const baseItems: NavigationItem[] = [
      {
        path: '/dashboard',
        label: 'Home',
        icon: Home,
      },
      {
        path: '/marketplace',
        label: 'Explore',
        icon: Search,
      },
    ];

    // Add role-specific center action
    if (currentRole === 'INFLUENCER') {
      baseItems.push({
        path: '/my/applications',
        label: 'Applications',
        icon: Mail,
      });
    } else if (currentRole === 'CREW') {
      baseItems.push({
        path: '/my-bids',
        label: 'Bids',
        icon: Mail,
      });
    } else if (currentRole === 'BRAND') {
      baseItems.push({
        path: '/create-gig',
        label: 'Create',
        icon: Plus,
      });
    } else if (userType === 'admin') {
      baseItems.push({
        path: '/admin',
        label: 'Admin',
        icon: Shield,
      });
    } else {
      // Default for other user types
      baseItems.push({
        path: '/clans',
        label: 'Clans',
        icon: Building2,
      });
    }

    // Always include these core items
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

    // Limit to 5 unique items for optimal mobile UX
    const uniqueItems = baseItems.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.path === item.path)
    );

    return uniqueItems.slice(0, 5);
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
              className={`flex min-w-0 flex-1 flex-col items-center justify-center py-2 transition-all duration-200 relative ${active
                  ? 'scale-105 text-[#6BC5F2]'
                  : 'text-gray-600 hover:text-[#6BC5F2]'
                }`}
            >
              <div
                className={`mb-1 transition-transform duration-200 ${active ? 'scale-110' : ''
                  }`}
              >
                <IconComponent
                  className={`h-6 w-6 ${active ? 'text-[#437ebe]' : 'text-gray-600'
                    }`}
                />
              </div>
              <span
                className={`max-w-full truncate text-xs font-bold leading-none ${active ? 'text-[#437ebe]' : 'text-gray-600'
                  }`}
              >
                {item.label}
              </span>
              {/* Pending Applications Badge for Clans tab */}
              {item.path === '/clans' && totalPendingApplications > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalPendingApplications > 99 ? '99+' : totalPendingApplications}
                </div>
              )}
              {active && (
                <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-[#437ebe]"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
