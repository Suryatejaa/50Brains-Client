'use client';

import { Header } from '@/components/layout/header';
import Link from 'next/link';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          {/* Marketplace Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-heading mb-2 text-3xl font-bold">
                  Marketplace
                </h1>
                <p className="text-muted">
                  Discover amazing opportunities and collaborate with top
                  creators
                </p>
              </div>
              <Link href="/create-gig" className="btn-primary px-6 py-3">
                Post a Gig
              </Link>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="card-glass mb-8 p-6">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search gigs, skills, or categories..."
                  className="input w-full"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select className="input w-full">
                  <option>All Categories</option>
                  <option>Content Creation</option>
                  <option>Video Editing</option>
                  <option>Photography</option>
                  <option>Social Media</option>
                  <option>Graphic Design</option>
                </select>
              </div>

              {/* Budget Filter */}
              <div>
                <select className="input w-full">
                  <option>Any Budget</option>
                  <option>$0 - $500</option>
                  <option>$500 - $1,500</option>
                  <option>$1,500 - $5,000</option>
                  <option>$5,000+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Simple Gig Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Featured Gig */}
            <div className="lg:col-span-2">
              <div className="card-glass border-brand-primary/30 bg-brand-light-blue/5 border-2 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-brand-primary rounded-full px-3 py-1 text-sm font-medium text-white">
                      ⭐ Featured
                    </span>
                    <span className="bg-error/10 text-error rounded-full px-2 py-1 text-xs font-medium">
                      Urgent
                    </span>
                  </div>
                  <span className="text-muted text-sm">Posted 2 hours ago</span>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <h3 className="text-heading mb-2 text-xl font-semibold">
                      Instagram Content Creator for Tech Brand Campaign
                    </h3>
                    <p className="text-muted mb-4">
                      We're looking for a passionate tech content creator to
                      help us launch our new product line. Perfect for creators
                      with 50K+ followers in tech/lifestyle space.
                    </p>

                    <div className="text-muted flex items-center space-x-4 text-sm">
                      <span>🏢 TechFlow Inc.</span>
                      <span>⭐ 4.9 rating</span>
                      <span>✅ Verified</span>
                    </div>
                  </div>

                  <div className="text-center md:text-right">
                    <div className="text-heading mb-2 text-3xl font-bold">
                      $2,500
                    </div>
                    <div className="text-muted mb-4 text-sm">Fixed price</div>
                    <button className="btn-primary mb-3 w-full px-6 py-3 md:w-auto">
                      Apply Now
                    </button>
                    <div className="text-muted text-xs">
                      12 proposals • Deadline: 3 days
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regular Gigs */}
            {[1, 2, 3, 4].map((gig) => (
              <div
                key={gig}
                className="card-glass hover:bg-brand-light-blue/5 p-6 transition-all duration-200"
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="bg-brand-soft border-brand-border text-body rounded-full border px-2 py-1 text-xs">
                    Content Creation
                  </span>
                  <span className="text-muted text-xs">{gig}h ago</span>
                </div>

                <h3 className="text-heading mb-2 text-lg font-semibold">
                  YouTube Video Editor for Gaming Channel
                </h3>
                <p className="text-muted mb-4 text-sm">
                  Looking for a skilled video editor to help with our growing
                  gaming channel. Need someone who can create engaging
                  thumbnails and edit gameplay footage.
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-muted flex items-center space-x-4 text-xs">
                    <span>👤 GameMaster Pro</span>
                    <span>⭐ 4.{gig + 5}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-heading font-semibold">
                      ${500 * gig}
                    </div>
                    <button className="btn-secondary mt-2 px-4 py-2 text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="btn-ghost px-8 py-3">Load More Gigs</button>
          </div>
        </div>
      </div>
    </div>
  );
}
