'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

type UserRole =
  | 'USER'
  | 'INFLUENCER'
  | 'BRAND'
  | 'CREW'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

interface RoleSwitchContextType {
  currentRole: UserRole;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
  canSwitchRoles: boolean;
  getUserTypeForRole: (role: UserRole) => string;
}

const RoleSwitchContext = createContext<RoleSwitchContextType | undefined>(
  undefined
);

export const RoleSwitchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { hasRole, getPrimaryRole } = usePermissions();

  // Get user's available roles (exclude system roles like USER)
  const availableRoles =
    user?.roles?.filter((role) =>
      [
        'INFLUENCER',
        'BRAND',
        'CREW',
        'MODERATOR',
        'ADMIN',
        'SUPER_ADMIN',
      ].includes(role)
    ) || [];

  // State for current active role
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    // Start with a default that won't conflict with saved role
    // We'll set the proper role in useEffect once user data loads
    return 'USER';
  });

  // Track if we've initialized the role from localStorage
  const hasInitialized = useRef(false);
  // Prevent multiple concurrent initializations
  const isInitializing = useRef(false);

  // Single effect to handle role initialization and validation
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      user &&
      availableRoles.length > 0 &&
      !hasInitialized.current &&
      !isInitializing.current
    ) {
      isInitializing.current = true;

      const savedRole = localStorage.getItem('50brains_active_role');
      const primaryRole = getPrimaryRole();

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [RoleSwitch] Initializing role from localStorage:', {
          savedRole,
          availableRoles,
          currentRole,
          userRoles: user.roles,
          primaryRole,
          hasInitialized: hasInitialized.current,
        });
      }

      // Determine the correct role to use
      let targetRole: UserRole;

      if (savedRole && availableRoles.includes(savedRole as UserRole)) {
        // Use saved role if it's valid
        targetRole = savedRole as UserRole;
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '✅ [RoleSwitch] Using saved role from localStorage:',
            savedRole
          );
        }
      } else {
        // Fall back to primary role
        targetRole = primaryRole;
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '⚠️ [RoleSwitch] Using primary role (saved role invalid):',
            primaryRole
          );
        }
      }

      // Set the target role and mark as initialized
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 [RoleSwitch] Setting initial role to:', targetRole);
      }

      setCurrentRole(targetRole);
      hasInitialized.current = true;
      isInitializing.current = false;
    }
  }, [user, availableRoles, getPrimaryRole]);

  // Update localStorage when role changes (skip initial 'USER' role and during initialization)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      currentRole !== 'USER' &&
      hasInitialized.current &&
      !isInitializing.current
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '💾 [RoleSwitch] Saving role to localStorage:',
          currentRole
        );
      }
      localStorage.setItem('50brains_active_role', currentRole);
    }
  }, [currentRole]);

  const switchRole = (role: UserRole) => {
    if (!hasInitialized.current) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '⚠️ [RoleSwitch] Cannot switch role before initialization'
        );
      }
      return;
    }

    if (availableRoles.includes(role) && role !== currentRole) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '🎭 [RoleSwitch] Switching role from',
          currentRole,
          'to',
          role
        );
      }
      setCurrentRole(role);
    } else if (process.env.NODE_ENV === 'development') {
      if (!availableRoles.includes(role)) {
        console.warn(
          '❌ [RoleSwitch] Cannot switch to role:',
          role,
          'Available roles:',
          availableRoles
        );
      } else if (role === currentRole) {
        console.log('⚡ [RoleSwitch] Role already active:', role);
      }
    }
  };

  const canSwitchRoles = availableRoles.length > 1;

  const getUserTypeForRole = useCallback((role: UserRole): string => {
    switch (role) {
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
  }, []);

  return (
    <RoleSwitchContext.Provider
      value={{
        currentRole,
        availableRoles,
        switchRole,
        canSwitchRoles,
        getUserTypeForRole,
      }}
    >
      {children}
    </RoleSwitchContext.Provider>
  );
};

export const useRoleSwitch = () => {
  const context = useContext(RoleSwitchContext);
  if (context === undefined) {
    throw new Error('useRoleSwitch must be used within a RoleSwitchProvider');
  }
  return context;
};
