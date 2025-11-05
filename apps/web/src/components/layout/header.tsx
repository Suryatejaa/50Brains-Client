'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { RoleSwitcher } from './RoleSwitcher';
import NotificationBell from '@/components/NotificationBell';
import { GuidelinesModal } from '@/components/modals/GuidelinesModal';
import { useGuidelinesModal } from '@/hooks/useGuidelinesModal';
import {
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  PhoneIcon,
  UserIcon,
  HomeIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { isOpen, guidelinesType, openGuidelines, closeGuidelines } =
    useGuidelinesModal();

  const hasMultiRoles = user?.roles && user.roles.length > 2;

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

            {/* 📱 Mobile Header Actions */}
            <div className="flex items-center space-x-0 md:hidden">
              {/* Help Menu for Mobile */}
              <div className="relative">
                <button
                  onClick={() => setIsHelpMenuOpen(!isHelpMenuOpen)}
                  className="text-body hover:text-accent p-1 transition-colors"
                >
                  <QuestionMarkCircleIcon className="h-6 w-6" />
                </button>

                {/* Mobile Help Dropdown */}
                {isHelpMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsHelpMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="p-2">
                        <div className="mb-2 border-b border-gray-200 px-3 py-2">
                          <div className="font-medium text-gray-900">
                            Help & Legal
                          </div>
                        </div>
                        <Link
                          href="/terms"
                          onClick={() => setIsHelpMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                          <span>Terms & Conditions</span>
                        </Link>
                        <Link
                          href="/privacy"
                          onClick={() => setIsHelpMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <ShieldCheckIcon className="h-4 w-4 text-gray-500" />
                          <span>Privacy Policy</span>
                        </Link>
                        <Link
                          href="/refund"
                          onClick={() => setIsHelpMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                          <span>Refund Policy</span>
                        </Link>
                        <Link
                          href="/shipping"
                          onClick={() => setIsHelpMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <TruckIcon className="h-4 w-4 text-gray-500" />
                          <span>Service Delivery</span>
                        </Link>
                        <Link
                          href="/about"
                          onClick={() => setIsHelpMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <InformationCircleIcon className="h-4 w-4 text-gray-500" />
                          <span>About Us</span>
                        </Link>
                        <div className="mt-2 border-t border-gray-200 pt-2">
                          <div className="mb-2 px-3 py-1">
                            <div className="text-xs font-medium text-gray-600">
                              Community Guidelines
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              openGuidelines('brand');
                              setIsHelpMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                          >
                            <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
                            <span>Brand Guidelines</span>
                          </button>
                          <button
                            onClick={() => {
                              openGuidelines('creator');
                              setIsHelpMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                          >
                            <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
                            <span>Creator Guidelines</span>
                          </button>
                        </div>
                        <div className="mt-2 border-t border-gray-200 pt-2">
                          <Link
                            href="/contact"
                            onClick={() => setIsHelpMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                          >
                            <PhoneIcon className="h-4 w-4 text-gray-500" />
                            <span>Contact Support</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <NotificationBell />

              {/* Mobile menu button */}
              <button
                className="text-body hover:text-accent p-2 transition-colors"
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

            {/* 🚀 Desktop User Menu */}
            <div className="hidden items-center space-x-0 md:flex">
              {/* Role Switcher - Only show if user has multiple roles */}
              {hasMultiRoles && <RoleSwitcher />}

              {/* Help Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsHelpMenuOpen(!isHelpMenuOpen)}
                  className="text-body hover:text-accent p-2 transition-colors"
                >
                  <QuestionMarkCircleIcon className="h-6 w-6" />
                </button>

                {/* Desktop Help Dropdown */}
                {isHelpMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsHelpMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="p-2">
                        <div className="mb-2 border-b border-gray-200 px-3 py-3">
                          <div className="font-medium text-gray-900">
                            Help & Legal
                          </div>
                          <div className="text-sm text-gray-500">
                            Support and information
                          </div>
                        </div>
                        <Link
                          href="/terms"
                          onClick={() => setIsHelpMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                          <span>Terms & Conditions</span>
                        </Link>
                        <Link
                          href="/privacy"
                          onClick={() => setIsHelpMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <ShieldCheckIcon className="h-4 w-4 text-gray-500" />
                          <span>Privacy Policy</span>
                        </Link>
                        <Link
                          href="/refund"
                          onClick={() => setIsHelpMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                          <span>Refund Policy</span>
                        </Link>
                        <Link
                          href="/shipping"
                          onClick={() => setIsHelpMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <TruckIcon className="h-4 w-4 text-gray-500" />
                          <span>Service Delivery</span>
                        </Link>
                        <Link
                          href="/about"
                          onClick={() => setIsHelpMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <InformationCircleIcon className="h-4 w-4 text-gray-500" />
                          <span>About Us</span>
                        </Link>
                        <div className="mt-2 border-t border-gray-200 pt-2">
                          <div className="mb-2 px-3 py-1">
                            <div className="text-xs font-medium text-gray-600">
                              Community Guidelines
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              openGuidelines('brand');
                              setIsHelpMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                          >
                            <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
                            <span>Brand Guidelines</span>
                          </button>
                          <button
                            onClick={() => {
                              openGuidelines('creator');
                              setIsHelpMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                          >
                            <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
                            <span>Creator Guidelines</span>
                          </button>
                        </div>
                        <div className="mt-2 border-t border-gray-200 pt-2">
                          <Link
                            href="/contact"
                            onClick={() => setIsHelpMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                          >
                            <PhoneIcon className="h-4 w-4 text-gray-500" />
                            <span>Contact Support</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User Avatar & Dropdown */}

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="text-body hover:text-accent flex items-center space-x-2 rounded-full bg-gray-200 transition-colors"
                >
                  <div className="bg-brand-light-blue flex h-8 w-8 items-center justify-center rounded-full">
                    <span className="text-sm">
                      {(
                        user?.firstName?.charAt(0) || user?.email?.charAt(0)
                      )?.toUpperCase() || '👤'}
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
                          <UserIcon className="h-4 w-4 text-gray-500" />
                          <span>Profile</span>
                        </Link>

                        {/* <Link
                          href="/credits"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <span>💰</span>
                          <span>Credits</span>
                        </Link> */}

                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                        >
                          <HomeIcon className="h-4 w-4 text-gray-500" />
                          <span>Dashboard</span>
                        </Link>

                        {/* Divider */}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 📱 Mobile User Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="border-brand-border bg-brand-glass space-y-1 border-none">
                {/* User Info Header */}
                <div className="border-brand-border border-b px-2 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-brand-light-blue flex h-10 w-10 items-center justify-center rounded-full">
                      <span className="text-lg font-medium text-white">
                        {(
                          user?.firstName?.charAt(0) || user?.email?.charAt(0)
                        )?.toUpperCase() || '👤'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="px-2 py-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                  >
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                  >
                    <HomeIcon className="h-4 w-4 text-gray-500" />
                    <span>Dashboard</span>
                  </Link>
                </div>

                {/* Mobile Role Switcher */}
                {hasMultiRoles && (
                  <div className="border-brand-border border-t px-3 py-3">
                    <RoleSwitcher variant="tabs" showDescription={false} />
                  </div>
                )}
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
            className="text-body hover:text-accent hidden p-2 transition-colors md:hidden"
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
              {/* <Link
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
              </Link> */}
              {/* <Link
                href="/create-gig"
                className="text-body hover:text-accent hover:bg-brand-light-blue/30 block rounded-none px-3 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Gig
              </Link> */}
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

      {/* Guidelines Modal */}
      <GuidelinesModal
        isOpen={isOpen}
        onClose={closeGuidelines}
        type={guidelinesType}
      />
    </header>
  );
}
