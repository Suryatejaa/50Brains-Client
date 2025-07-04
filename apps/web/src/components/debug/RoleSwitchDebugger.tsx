'use client';

import React, { useEffect, useState } from 'react';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { useAuth } from '@/hooks/useAuth';

export const RoleSwitchDebugger: React.FC = () => {
  const { currentRole, availableRoles, getUserTypeForRole } = useRoleSwitch();
  const { user } = useAuth();
  const [renderCount, setRenderCount] = useState(0);

  // TEMPORARILY DISABLED - Count renders - only increment when role actually changes
  // useEffect(() => {
  //   setRenderCount((count) => count + 1);
  // }, [currentRole]); // Only increment when role changes

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 Role Switch Debug - Role changed:', {
        currentRole,
        userType: getUserTypeForRole(currentRole),
        availableRoles,
        timestamp: new Date().toISOString(),
      });
    }
  }, [currentRole, availableRoles]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-lg bg-black bg-opacity-80 p-4 text-sm text-white">
      <div className="mb-2 font-bold">🎭 Role Switch Debug</div>
      <div>Render Count: {renderCount} (disabled)</div>
      <div>Current Role: {currentRole}</div>
      <div>User Type: {getUserTypeForRole(currentRole)}</div>
      <div>Available: {availableRoles.join(', ')}</div>
      <div>User Roles: {user?.roles?.join(', ') || 'none'}</div>
      <div>Timestamp: {new Date().toLocaleTimeString()}</div>
    </div>
  );
};
