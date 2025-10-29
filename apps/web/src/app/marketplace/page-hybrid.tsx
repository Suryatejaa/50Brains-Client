// app/marketplace/page-hybrid.tsx
// TRUE HYBRID SSR/CSR APPROACH

import { Suspense } from 'react';
import { GIG_CATEGORIES } from '@/types/gig.types';
import { MarketplaceClient } from './components/MarketplaceClient';
import { MarketplaceSkeleton } from './components/MarketplaceSkeleton';

// SERVER-SIDE RENDERED PART (Instant Loading)
export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-1">
          {/* 🚀 INSTANT SSR HEADER - Loads immediately */}
          <div className="mb-1">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-1">
                <div className="flex flex-row justify-between sm:gap-4 md:gap-4 lg:gap-4">
                  <h1 className="text-heading flex text-4xl font-bold">
                    Marketplace ⚡ SSR
                  </h1>
                  <a href="/search" className="btn-primary flex px-3 py-2">
                    Search People
                  </a>
                </div>
                <p className="text-muted flex">
                  ⚡ Server-side rendered for instant loading - Discover amazing
                  opportunities
                </p>
              </div>
            </div>
          </div>

          {/* 🚀 INSTANT SSR SEARCH FORM - No JavaScript needed initially */}
          <div className="mb-2">
            <form method="GET" action="/marketplace" className="mb-0">
              <div className="card-glass p-1">
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="search"
                      placeholder="Search gigs by title, description, or skills..."
                      className="input w-full border-2 border-gray-700"
                      defaultValue=""
                    />
                  </div>

                  <div>
                    <select
                      name="category"
                      className="input w-full border-2 border-gray-700"
                    >
                      <option value="">All Categories</option>
                      {Object.entries(GIG_CATEGORIES).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary flex-1">
                      Search
                    </button>
                    <button type="button" className="btn-secondary px-4">
                      More Filters
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* 🚀 INSTANT SSR TABS - Static HTML, enhanced with JS later */}
            <div className="flex space-x-1 rounded-none bg-white p-1">
              <a
                href="/marketplace?tab=all"
                className="flex-1 rounded-none bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white"
              >
                All Gigs
              </a>
              <a
                href="/marketplace?tab=featured"
                className="flex-1 rounded-none px-4 py-2 text-center text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ⭐ Featured
              </a>
            </div>
          </div>

          {/* 🚀 PROGRESSIVE ENHANCEMENT - Load data with Suspense */}
          <Suspense fallback={<MarketplaceSkeleton />}>
            <MarketplaceClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
