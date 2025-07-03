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
      <div className="page-container flex min-h-screen items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-muted">Loading...</p>
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
