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

  // Show header ONLY for unauthenticated users (landing, auth pages)
  const showHeader = !isAuthenticated;

  // Show bottom navigation for ALL authenticated users on ALL pages
  // This creates a mobile-first experience similar to Instagram/TikTok
  const showBottomNav = isAuthenticated;

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

      {showBottomNav && <BottomNavigation />}
    </>
  );
};
