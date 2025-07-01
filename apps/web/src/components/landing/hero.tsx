'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Hero() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="page-container">
      <div className="content-container section-spacing">
        <div className="text-center">
          {/* 🧠 Hero Badge */}
          <div className="border-brand-border bg-brand-glass text-brand-text-muted mb-6 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-md">
            ✨ Where Creativity Meets Opportunity
          </div>

          {/* 🎯 Hero Title */}
          <h1 className="text-heading mb-6 text-4xl font-bold md:text-6xl lg:text-7xl">
            The Future of
            <span className="text-accent"> Creator Economy</span>
          </h1>

          {/* 📝 Hero Description */}
          <p className="text-muted mx-auto mb-8 max-w-3xl text-xl lg:text-2xl">
            Connect brands with content creators, influencers, and creative
            professionals. Build your career, grow your brand, collaborate in
            teams with glassmorphism elegance.
          </p>

          {/* 🚀 Hero CTAs */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn-primary px-8 py-4 text-lg font-semibold"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/marketplace"
                  className="btn-secondary px-8 py-4 text-lg font-semibold"
                >
                  Explore Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn-primary px-8 py-4 text-lg font-semibold"
                >
                  Start Creating Today
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary px-8 py-4 text-lg font-semibold"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* 💡 Trust Indicators */}
          <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row">
            <div className="text-muted text-sm">
              Trusted by 50,000+ creators
            </div>
            <div className="bg-brand-border hidden h-4 w-px sm:block"></div>
            <div className="text-muted text-sm">
              $10M+ earned by our community
            </div>
            <div className="bg-brand-border hidden h-4 w-px sm:block"></div>
            <div className="text-muted text-sm">99.9% uptime guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
}
