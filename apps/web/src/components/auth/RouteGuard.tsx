'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect during initial loading to prevent flashing
    if (isLoading) return;

    // Define auth pages that authenticated users shouldn't access
    const authPages = ['/login', '/register', '/forgot-password'];

    // Define protected pages that require authentication
    const protectedPages = [
      '/dashboard',
      '/profile',
      '/marketplace',
      '/gigs',
      '/clans',
      '/credits',
    ];

    // Check if current path is an auth page
    const isAuthPage = authPages.some((page) => pathname.startsWith(page));

    // Check if current path is a protected page
    const isProtectedPage = protectedPages.some((page) =>
      pathname.startsWith(page)
    );

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && isAuthPage) {
      console.log(
        '🔒 [RouteGuard] Authenticated user accessing auth page, redirecting to dashboard'
      );
      router.push('/dashboard');
      return;
    }

    // If user is not authenticated and trying to access protected pages, redirect to login
    if (!isAuthenticated && isProtectedPage) {
      console.log(
        '🔒 [RouteGuard] Unauthenticated user accessing protected page, redirecting to login'
      );
      // Save the current path to redirect back after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('authRedirectUrl', pathname);
      }
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Don't render anything during loading to prevent flash
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
