'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { RoleSwitcher } from './RoleSwitcher';

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
              {/* Role Switcher - Only show if user has multiple roles */}
              <RoleSwitcher />

              {/* Notifications */}
              <Link
                href="/dashboard"
                className="text-body hover:text-accent relative p-2 transition-colors"
                title="Notifications"
              >
                <span className="text-xl">🔔</span>
                {/* Notification badge - you can add logic to show count */}
                {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-none w-5 h-5 flex items-center justify-center text-xs">3</span> */}
              </Link>

              {/* User Avatar & Dropdown */}

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="text-body hover:text-accent bg-gray-200 rounded-full flex items-center space-x-2 transition-colors"
                >
                  <div className="bg-brand-light-blue flex h-8 w-8 items-center justify-center rounded-full">
                    <span className="text-sm">
                      {(user?.firstName?.charAt(0) ||
                        user?.email?.charAt(0))?.toUpperCase() ||
                        '👤'}
                    </span>
                  </div>
                </button>

                {/* Desktop User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="p-2">
                        {/* User Info Header */}
                        <div className="mb-2 border-b border-gray-200 px-3 py-3">
                          <div className="font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user?.email}
                          </div>
                        </div>

                        {/* Menu Items */}
                        <Link
                          href="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <span>👤</span>
                          <span>Profile</span>
                        </Link>

                        <Link
                          href="/credits"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <span>💰</span>
                          <span>Credits</span>
                        </Link>

                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <span>🏠</span>
                          <span>Dashboard</span>
                        </Link>

                        {/* Divider */}
                        <div className="my-2 border-t border-gray-200"></div>

                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-red-600 transition-colors duration-200 hover:bg-red-50"
                        >
                          <span>🚪</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
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
                  <div className="bg-brand-light-blue/20 mr-3 flex h-10 w-10 items-center justify-center rounded-none">
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

                {/* Mobile Role Switcher */}
                <div className="px-3 py-2">
                  <RoleSwitcher variant="tabs" showDescription={false} />
                </div>

                <Link
                  href="/credits"
                  className="text-body hover:text-accent hover:bg-brand-light-blue/30 block rounded-none px-3 py-2 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Credits
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-body hover:text-accent hover:bg-brand-light-blue/30 w-full rounded-none px-3 py-2 text-left transition-all duration-200"
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
                className="text-body hover:text-accent hover:bg-brand-light-blue/30 block rounded-none px-3 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/clans"
                className="text-body hover:text-accent hover:bg-brand-light-blue/30 block rounded-none px-3 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Clans
              </Link>
              <Link
                href="/create-gig"
                className="text-body hover:text-accent hover:bg-brand-light-blue/30 block rounded-none px-3 py-2 transition-all duration-200"
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
