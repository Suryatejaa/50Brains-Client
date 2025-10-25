'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { BusinessRoadmap } from '@/components/landing/BusinessRoadmap';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Testimonials } from '@/components/landing/testimonials';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/layout/footer';
export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while auth is initializing
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

  // If not authenticated, show landing page
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <Hero />
          <Features />
          <BusinessRoadmap />
          <HowItWorks />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    );
  }

  // If authenticated, redirect will happen via useEffect
  return null;
}
