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
  const lastAuthState = useRef<boolean | null>(null);
  const authStateStableTimestamp = useRef<number>(0);

  useEffect(() => {
    // Don't redirect during initial loading to prevent flashing
    if (isLoading) {
      console.log('↻ RouteGuard: Still loading, skipping route check');
      return;
    }

    // Don't process redirects if in emergency mode
    if (RouteDebugger.isEmergencyMode()) {
      RouteDebugger.log(
        'EmergencyMode',
        pathname,
        isAuthenticated,
        isLoading,
        'RouteGuard'
      );
      console.log(
        '🚨 RouteGuard: Emergency mode active, blocking all redirects'
      );
      return;
    }

    // Check if auth state has changed
    if (lastAuthState.current !== isAuthenticated) {
      lastAuthState.current = isAuthenticated;
      authStateStableTimestamp.current = Date.now();
      console.log(
        `🔄 Auth state changed to: ${isAuthenticated}, waiting for stability...`
      );
      return;
    }

    // Wait for auth state to be stable for at least 500ms before making decisions
    const timeSinceChange = Date.now() - authStateStableTimestamp.current;
    if (timeSinceChange < 500) {
      console.log(
        `⏳ Auth state not stable yet (${timeSinceChange}ms), waiting...`
      );
      return;
    }

    // Prevent multiple simultaneous redirects
    if (redirectInProgress.current) {
      console.log('↻ RouteGuard: Redirect already in progress, skipping');
      return;
    }

    // Check for potential redirect loops first
    if (RouteDebugger.detectLoop()) {
      console.error('🚨 Redirect loop detected, emergency mode activated');
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

        // Check for loops before redirecting
        if (RouteDebugger.detectLoop()) {
          console.error(
            '🚨 Emergency mode activated - stopping redirect to dashboard'
          );
          return;
        }

        redirectInProgress.current = true;
        console.log('🚀 [RouteGuard] Starting redirect to /dashboard');

        // Use router.replace instead of window.location for smoother experience
        router.replace('/dashboard');
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

        // Check for loops before redirecting
        if (RouteDebugger.detectLoop()) {
          console.error(
            '🚨 Emergency mode activated - stopping redirect to login'
          );
          return;
        }

        // Save the current path to redirect back after login
        if (typeof window !== 'undefined') {
          localStorage.setItem('authRedirectUrl', pathname);
        }
        redirectInProgress.current = true;
        console.log('🚀 [RouteGuard] Starting redirect to /login');

        // Use router.replace instead of window.location for smoother experience
        router.replace('/login');
        return;
      }
      console.log(`✅ [RouteGuard] Route access allowed for ${pathname}`);
    }, 200); // Increased delay for more stability

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, isLoading, pathname]); // Keep all dependencies for proper tracking

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
