'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  requiredRoles = [],
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect during initial loading to prevent flashing
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      // Save the current path to redirect back after login
      try {
        // Save current URL to localStorage for more reliable persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('authRedirectUrl', pathname);
        }

        const returnUrl = encodeURIComponent(pathname);
        router.push(`${redirectTo}?returnUrl=${returnUrl}` as any);
      } catch (error) {
        // Fallback if there's an issue
        router.push(redirectTo as any);
      }
      return;
    }

    // If user is authenticated but doesn't have required role
    if (requireAuth && isAuthenticated && requiredRoles.length > 0 && user) {
      const hasRequiredRole = user.roles?.some((role: string) =>
        requiredRoles.includes(role)
      );
      if (!hasRequiredRole) {
        router.push('/dashboard'); // Redirect to dashboard if no permission
        return;
      }
    }

    // If user is authenticated but trying to access auth pages
    if (
      !requireAuth &&
      isAuthenticated &&
      (pathname.startsWith('/login') || pathname.startsWith('/register'))
    ) {
      router.push('/dashboard');
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    requiredRoles,
    pathname,
    router,
    user?.roles,
    redirectTo,
    user,
  ]);

  // Show loading spinner while checking authentication
  if (isLoading) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {/* Brain Icon Container */}
        <div className="relative mb-6">                         
          {/* Spinning Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          
          {/* Brain Icon (or '50' Number) */}
          <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
            <span className="text-3xl font-bold text-blue-600">50</span>
          </div>
        </div>
        
        {/* Brand Name */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          50BraIns
        </h2>
        <p className="text-sm text-gray-500">Connecting brands & influencers...</p>
      </div>
    </div>
  );
}

  // Show content if all checks pass
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (requireAuth && requiredRoles.length > 0) {
    const hasRequiredRole = user?.roles?.some((role: string) =>
      requiredRoles.includes(role)
    );
    if (!hasRequiredRole) {
      return null; // Will redirect in useEffect
    }
  }

  return <>{children}</>;
};
