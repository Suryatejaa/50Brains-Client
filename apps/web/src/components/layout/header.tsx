'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    // Minimal header for authenticated users - most navigation happens in bottom nav
    return (
      <header className="border-brand-border bg-brand-glass fixed top-0 z-50 w-full border-b backdrop-blur-md">
        <div className="content-container">
          <div className="flex h-16 items-center justify-between">
            {/* 🧠 Logo */}
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-accent text-2xl font-bold">50BraIns</h1>
            </Link>

            {/* 🚀 Desktop User Menu */}
            <div className="hidden items-center space-x-4 md:flex">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="text-body hover:text-accent flex items-center space-x-2 transition-colors"
                >
                  <div className="bg-brand-light-blue flex h-8 w-8 items-center justify-center rounded-full">
                    <span className="text-sm">
                      {user?.firstName?.charAt(0) ||
                        user?.email?.charAt(0) ||
                        '👤'}
                    </span>
                  </div>                                  
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="bg-brand-glass border-brand-border absolute right-0 mt-2 w-48 rounded-lg border py-2 shadow-lg backdrop-blur-md">
                    <Link
                      href="/profile"
                      className="text-body hover:bg-brand-light-blue/20 block px-4 py-2 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/credits"
                      className="text-body hover:bg-brand-light-blue/20 block px-4 py-2 transition-colors"
                    >
                      Credits
                    </Link>
                    <div className="border-brand-border my-2 border-t"></div>
                    <button
                      onClick={logout}
                      className="text-body hover:bg-brand-light-blue/20 block w-full px-4 py-2 text-left transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 📱 Mobile menu button */}
            <button
              className="text-body hover:text-accent p-2 transition-colors md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>

          {/* 📱 Mobile User Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="border-brand-border bg-brand-glass space-y-1 border-t px-2 pb-3 pt-2 backdrop-blur-md">
                <div className="border-brand-border mb-2 flex items-center border-b px-3 py-3">
                  <div className="bg-brand-light-blue/20 mr-3 flex h-10 w-10 items-center justify-center rounded-full">
                    <span className="text-lg font-medium">
                      {user?.firstName?.charAt(0) ||
                        user?.email?.charAt(0) ||
                        '👤'}
                    </span>
                  </div>
                  <div>
                    <div className="text-brand-text-main font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-brand-text-muted text-sm">
                      {user?.email}
                    </div>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="text-body hover:text-accent hover:bg-brand-light-blue/30 block rounded-lg px-3 py-2 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/credits"
                  className="text-body hover:text-accent hover:bg-brand-light-blue/30 block rounded-lg px-3 py-2 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Credits
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-body hover:text-accent hover:bg-brand-light-blue/30 w-full rounded-lg px-3 py-2 text-left transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  // Full header for unauthenticated users
  return (
    <header className="border-brand-border bg-brand-glass fixed top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="content-container">
        <div className="flex h-16 items-center justify-between">
          {/* 🧠 Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-accent text-2xl font-bold">50BraIns</h1>
          </Link>

          {/* 🧭 Desktop Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
            <Link
              href="/marketplace"
              className="text-body hover:text-accent font-medium transition-colors duration-200"
            >
              Marketplace
            </Link>
            <Link
              href="/clans"
              className="text-body hover:text-accent font-medium transition-colors duration-200"
            >
              Clans
            </Link>
            <Link
              href="/create-gig"
              className="text-body hover:text-accent font-medium transition-colors duration-200"
            >
              Create Gig
            </Link>
          </nav>

          {/* 🚀 Desktop CTA */}
          <div className="hidden items-center space-x-4 md:flex">
            <Link href="/login" className="btn-ghost px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary px-6 py-2">
              Get Started
            </Link>
          </div>

          {/* 📱 Mobile menu button */}
          <button
            className="text-body hover:text-accent p-2 transition-colors md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              />
            </svg>
          </button>
        </div>

        {/* 📱 Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="border-brand-border bg-brand-glass space-y-1 border-t px-2 pb-3 pt-2 backdrop-blur-md">
              <Link
                href="/marketplace"
                className="text-body hover:text-accent hover:bg-brand-light-blue/30 block rounded-lg px-3 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/clans"
                className="text-body hover:text-accent hover:bg-brand-light-blue/30 block rounded-lg px-3 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Clans
              </Link>
              <Link
                href="/create-gig"
                className="text-body hover:text-accent hover:bg-brand-light-blue/30 block rounded-lg px-3 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Gig
              </Link>
              <div className="border-brand-border mt-4 space-y-2 border-t px-3 py-2">
                <Link
                  href="/login"
                  className="btn-ghost w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-primary w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
