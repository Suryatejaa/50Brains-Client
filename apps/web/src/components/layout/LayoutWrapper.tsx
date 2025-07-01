'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Header } from './header';
import { Footer } from './footer';
import { BottomNavigation } from './BottomNavigation';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Routes where we don't show footer (protected routes)
  const protectedRoutes = [
    '/dashboard',
    '/marketplace',
    '/create-gig',
    '/my/',
    '/profile',
    '/clans',
    '/credits',
    '/admin',
    '/analytics',
    '/portfolio',
    '/applications',
    '/social-media',
  ];

  // Check if current route is protected
  const isProtectedRoute =
    isAuthenticated &&
    protectedRoutes.some((route) => pathname.startsWith(route));

  // Routes where we don't show header (e.g., auth pages might want custom headers)
  const noHeaderRoutes = ['/login', '/register'];
  const showHeader = !noHeaderRoutes.includes(pathname);

  // Show bottom navigation only on protected routes and mobile
  const showBottomNav = isProtectedRoute;

  return (
    <>
      {showHeader && <Header />}

      <main
        className={`
        ${showHeader ? 'pt-16' : ''} 
        ${showBottomNav ? 'pb-20' : ''} 
        min-h-screen
      `}
      >
        {children}
      </main>

      {!isProtectedRoute && <Footer />}
      {showBottomNav && <BottomNavigation />}
    </>
  );
};
