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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-8 text-center">
          <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-muted">Loading...</p>
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
