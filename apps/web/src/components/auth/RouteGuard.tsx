'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { RouteDebugger } from '@/utils/route-debug';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectInProgress = useRef(false);

  useEffect(() => {
    // Don't redirect during initial loading to prevent flashing
    if (isLoading) {
      console.log('↻ RouteGuard: Still loading, skipping route check');
      return;
    }

    // Prevent multiple simultaneous redirects
    if (redirectInProgress.current) {
      console.log('↻ RouteGuard: Redirect already in progress, skipping');
      return;
    }

    // Check for potential redirect loops first
    if (RouteDebugger.detectLoop()) {
      console.error('🚨 Redirect loop detected, aborting further redirects');
      redirectInProgress.current = true; // Prevent further redirects
      return;
    }

    // Add a small delay to prevent race conditions during auth state changes
    const timeoutId = setTimeout(() => {
      RouteDebugger.log(
        'RouteCheck',
        pathname,
        isAuthenticated,
        isLoading,
        'RouteGuard'
      );

      console.log(
        `🔍 [RouteGuard] Checking route: ${pathname}, isAuthenticated: ${isAuthenticated}`
      );

      // Define auth pages that authenticated users shouldn't access
      const authPages = ['/login', '/register', '/forgot-password'];

      // Define protected pages that require authentication
      const protectedPages = [
        '/dashboard',
        '/profile',
        '/credits',
        '/create-gig',
        '/my-applications',
        '/my-bids',
        '/equipment',
        '/campaigns',
        '/social-media',
        '/notifications',
        '/settings',
        '/my-gigs',
        '/applications',
        '/brand',
        '/crew',
        '/influencer',
        '/clan',
        // Note: '/marketplace', '/clans', '/gigs' are public for browsing
      ];

      // Define protected route patterns (for dynamic routes)
      const protectedPatterns = [
        /^\/gig\/[^\/]+\/applications$/, // /gig/[id]/applications
        /^\/gig\/[^\/]+\/submissions$/, // /gig/[id]/submissions
        /^\/user\/[^\/]+\/edit$/, // /user/[id]/edit
        /^\/brand\/[^\/]+\/edit$/, // /brand/[id]/edit
        /^\/clan\/[^\/]+\/manage$/, // /clan/[id]/manage
      ];

      // Check if current path is an auth page (exact matches)
      const isAuthPage =
        authPages.includes(pathname) ||
        authPages.some((page) => pathname.startsWith(page + '/'));

      // Check if current path is a protected page
      const isProtectedPage =
        protectedPages.some((page) => pathname.startsWith(page)) ||
        protectedPatterns.some((pattern) => pattern.test(pathname));

      console.log(
        `🔍 [RouteGuard] isAuthPage: ${isAuthPage}, isProtectedPage: ${isProtectedPage}`
      );

      // If user is authenticated and trying to access auth pages, redirect to dashboard
      if (isAuthenticated && isAuthPage) {
        RouteDebugger.log(
          'RedirectToDashboard',
          pathname,
          isAuthenticated,
          isLoading,
          'RouteGuard'
        );
        console.log(
          `🔒 [RouteGuard] Authenticated user (${isAuthenticated}) accessing auth page (${pathname}), redirecting to dashboard`
        );
        redirectInProgress.current = true;
        console.log('🚀 [RouteGuard] Starting redirect to /dashboard');

        // Use window.location for more reliable redirect
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        } else {
          router.push('/dashboard');
        }
        return;
      }

      // If user is not authenticated and trying to access protected pages, redirect to login
      if (!isAuthenticated && isProtectedPage) {
        RouteDebugger.log(
          'RedirectToLogin',
          pathname,
          isAuthenticated,
          isLoading,
          'RouteGuard'
        );
        console.log(
          `🔒 [RouteGuard] Unauthenticated user (${isAuthenticated}) accessing protected page (${pathname}), redirecting to login`
        );
        // Save the current path to redirect back after login
        if (typeof window !== 'undefined') {
          localStorage.setItem('authRedirectUrl', pathname);
        }
        redirectInProgress.current = true;
        console.log('🚀 [RouteGuard] Starting redirect to /login');

        // Use window.location for more reliable redirect
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        } else {
          router.push('/login');
        }
        return;
      }

      console.log(`✅ [RouteGuard] Route access allowed for ${pathname}`);
    }, 100); // Increased delay to give more time for route changes

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, isLoading, pathname]); // Removed router from dependencies to prevent unnecessary re-runs

  // Reset redirect flag when pathname changes (redirect completes)
  useEffect(() => {
    redirectInProgress.current = false;
  }, [pathname]);

  // Conditional rendering without early return to maintain hook order
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-8 text-center">
          <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
