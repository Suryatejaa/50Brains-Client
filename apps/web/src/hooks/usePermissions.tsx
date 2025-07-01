'use client';

import { useAuth } from '@/hooks/useAuth';

// UserRole type definition
type UserRole =
  | 'USER'
  | 'INFLUENCER'
  | 'BRAND'
  | 'CREW'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

// Define permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  USER: ['profile.view', 'profile.edit', 'notifications.view', 'credits.view'],
  INFLUENCER: [
    'gig.apply',
    'gig.view',
    'profile.edit',
    'portfolio.manage',
    'social.link',
    'notifications.manage',
    'credits.earn',
    'analytics.personal',
  ],
  BRAND: [
    'gig.create',
    'gig.edit',
    'gig.delete',
    'applications.manage',
    'influencer.search',
    'analytics.view',
    'credits.purchase',
    'campaigns.manage',
  ],
  CREW: [
    'gig.apply',
    'services.offer',
    'portfolio.manage',
    'collaboration.join',
    'credits.earn',
  ],
  MODERATOR: [
    'content.moderate',
    'users.warn',
    'reports.handle',
    'community.manage',
  ],
  ADMIN: [
    'users.manage',
    'content.moderate',
    'system.configure',
    'analytics.full',
    'platform.control',
    'clans.manage',
  ],
  SUPER_ADMIN: [
    'users.manage',
    'content.moderate',
    'system.configure',
    'analytics.full',
    'platform.control',
    'database.access',
    'security.manage',
  ],
};

// Permission checking hook
export const usePermissions = () => {
  const { user } = useAuth();
  const roles = user?.roles || [];

  const hasPermission = (permission: string): boolean => {
    return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const getPrimaryRole = (): UserRole => {
    // Priority order for determining primary role
    const rolePriority: UserRole[] = [
      'SUPER_ADMIN',
      'ADMIN',
      'MODERATOR',
      'BRAND',
      'INFLUENCER',
      'CREW',
      'USER',
    ];

    for (const role of rolePriority) {
      if (roles.includes(role)) {
        return role;
      }
    }

    return 'USER';
  };

  const getUserType = (): string => {
    const primaryRole = getPrimaryRole();

    switch (primaryRole) {
      case 'INFLUENCER':
      case 'CREW':
        return 'creator';
      case 'BRAND':
        return 'brand';
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'admin';
      case 'MODERATOR':
        return 'moderator';
      default:
        return 'user';
    }
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getPrimaryRole,
    getUserType,
    roles,
    permissions: roles.flatMap((role) => ROLE_PERMISSIONS[role] || []),
  };
};

// Permission-based component wrapper
interface ProtectedComponentProps {
  permission?: string;
  permissions?: string[];
  role?: UserRole;
  roles?: UserRole[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  children,
  fallback = <div className="text-muted text-sm">Access Denied</div>,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } =
    usePermissions();

  let hasAccess = true;

  // Check single permission
  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    if (requireAll && !hasAllPermissions(permissions)) {
      hasAccess = false;
    } else if (!requireAll && !hasAnyPermission(permissions)) {
      hasAccess = false;
    }
  }

  // Check single role
  if (role && !hasRole(role)) {
    hasAccess = false;
  }

  // Check multiple roles
  if (roles.length > 0) {
    if (requireAll && !roles.every((r) => hasRole(r))) {
      hasAccess = false;
    } else if (!requireAll && !roles.some((r) => hasRole(r))) {
      hasAccess = false;
    }
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
