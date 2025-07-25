'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Users,
  Building,
  Palette,
  Shield,
  Crown,
  User,
} from 'lucide-react';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';

type UserRole =
  | 'USER'
  | 'INFLUENCER'
  | 'BRAND'
  | 'CREW'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    description: string;
  }
> = {
  USER: {
    label: 'User',
    icon: User,
    color: 'gray',
    description: 'Basic user access',
  },
  INFLUENCER: {
    label: 'Creator',
    icon: Users,
    color: 'purple',
    description: 'Content creator dashboard',
  },
  BRAND: {
    label: 'Brand',
    icon: Building,
    color: 'blue',
    description: 'Brand management dashboard',
  },
  CREW: {
    label: 'Crew',
    icon: Palette,
    color: 'green',
    description: 'Creative professional dashboard',
  },
  MODERATOR: {
    label: 'Moderator',
    icon: Shield,
    color: 'orange',
    description: 'Content moderation tools',
  },
  ADMIN: {
    label: 'Admin',
    icon: Crown,
    color: 'red',
    description: 'Administrative dashboard',
  },
  SUPER_ADMIN: {
    label: 'Super Admin',
    icon: Crown,
    color: 'red',
    description: 'Full system access',
  },
};

interface RoleSwitcherProps {
  variant?: 'dropdown' | 'tabs';
  showDescription?: boolean;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  variant = 'dropdown',
  showDescription = true,
}) => {
  const { currentRole, availableRoles, switchRole, canSwitchRoles } =
    useRoleSwitch();
  const [isOpen, setIsOpen] = useState(false);

  if (!canSwitchRoles) {
    return null;
  }

  const currentRoleConfig = ROLE_CONFIG[currentRole];
  const CurrentIcon = currentRoleConfig.icon;

  if (variant === 'tabs') {
    return (
      <div className="flex flex-wrap gap-2">
        {availableRoles.map((role) => {
          const config = ROLE_CONFIG[role];
          const Icon = config.icon;
          const isActive = role === currentRole;

          return (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {config.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-none border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
      >
        <CurrentIcon className="h-4 w-4" />
        <span>{currentRoleConfig.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-none border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Switch Dashboard
              </div>
              {availableRoles.map((role) => {
                const config = ROLE_CONFIG[role];
                const Icon = config.icon;
                const isActive = role === currentRole;

                return (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-start gap-3 rounded-none px-3 py-3 text-left transition-colors duration-200 ${
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon
                      className={`mt-0.5 h-5 w-5 ${
                        isActive ? 'text-brand-primary' : 'text-gray-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={`font-medium ${
                          isActive ? 'text-brand-primary' : 'text-gray-900'
                        }`}
                      >
                        {config.label}
                        {isActive && (
                          <span className="bg-brand-primary ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white">
                            Active
                          </span>
                        )}
                      </div>
                      {showDescription && (
                        <div
                          className={`text-sm ${
                            isActive ? 'text-brand-primary/70' : 'text-gray-500'
                          }`}
                        >
                          {config.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
