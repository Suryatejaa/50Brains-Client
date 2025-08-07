'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface QuickActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  permission?: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  href,
  icon,
  label,
  permission,
  description,
  onClick,
  disabled = false,
}) => {
  const { hasPermission } = usePermissions();

  // Check permission if specified
  if (permission && !hasPermission(permission)) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!disabled) {
      window.location.href = href;
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        dashboard-card-padding group flex flex-col items-center border transition-all duration-200
        ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
            : 'card-glass cursor-pointer hover:scale-105 hover:shadow-lg'
        }
      `}
      title={description}
    >
      <div
        className={`
        mb-2 text-3xl transition-transform duration-200
        ${!disabled ? 'group-hover:scale-110' : ''}
      `}
      >
        {icon}
      </div>
      <span
        className={`
        text-center text-sm font-medium
        ${disabled ? 'text-gray-400' : 'text-heading group-hover:text-accent'}
      `}
      >
        {label}
      </span>
      {description && (
        <span className="text-muted mt-1 max-w-20 text-center text-xs">
          {description}
        </span>
      )}
    </button>
  );
};

interface QuickActionsGridProps {
  actions: QuickActionButtonProps[];
  title?: string;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  actions,
  title = 'Quick Actions',
}) => {
  return (
    <div className="card-glass dashboard-card-padding">
      <h3 className="flex items-center gap-2 text-heading mb-mobile text-lg font-semibold">{title}</h3>
      <div className="dashboard-grid-gap grid grid-cols-2 md:grid-cols-4">
        {actions.map((action, index) => (
          <QuickActionButton key={index} {...action} />
        ))}
      </div>
    </div>
  );
};
