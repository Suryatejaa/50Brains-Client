'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'brand' | 'creator';
}

export function GuidelinesModal({
  isOpen,
  onClose,
  type,
}: GuidelinesModalProps) {
  const [activeTab, setActiveTab] = useState<'brand' | 'creator'>(type);

  if (!isOpen) return null;

  const BrandGuidelines = () => (
    <div className="prose prose-sm max-w-none space-y-6">
      {/* Introduction */}
      <section className="rounded border-l-4 border-amber-500 bg-amber-50 p-1">
        <p className="font-medium text-gray-800">
          ⚠️ By posting a gig on 50BraIns, you commit to these guidelines.
          Violations may result in account suspension, refunds, or legal action.
        </p>
      </section>

      {/* 1. Prohibited Products & Services */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          1. Strictly Prohibited Products & Services
        </h2>

        <p className="mb-3 text-gray-700">
          Brands CANNOT promote any of the following:
        </p>

        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="mb-2 font-semibold text-red-700">
              1.1 Gambling & Betting
            </h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>Online betting apps, poker apps, betting websites</li>
              <li>
                Cryptocurrency betting or trading apps promising "easy money"
              </li>
              <li>Fantasy sports betting apps</li>
              <li>Any app/service claiming to predict gambling outcomes</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="mb-2 font-semibold text-red-700">
              1.2 Financial Fraud & Scams
            </h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>
                Schemes promising guaranteed/unrealistic returns (100% profit,
                "quick money")
              </li>
              <li>Forex trading, stock market tips claiming guaranteed wins</li>
              <li>MLM (multi-level marketing) schemes or pyramid schemes</li>
              <li>Fake investment opportunities</li>
              <li>Unlicensed lending or loan apps</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="mb-2 font-semibold text-red-700">
              1.3 Illegal/Dangerous Substances
            </h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>
                Illegal drugs, controlled substances, or counterfeit medicines
              </li>
              <li>
                Steroids, performance-enhancing drugs for human consumption
              </li>
              <li>Unregulated or harmful wellness products</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="mb-2 font-semibold text-red-700">
              1.4 Misleading Health Claims
            </h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>
                Claims to cure serious diseases (cancer, diabetes, COVID)
                without medical approval
              </li>
              <li>Unproven medical treatments or "miracle cures"</li>
              <li>
                Products claiming instant weight loss, cosmetic changes (unless
                FDA/AYUSH approved)
              </li>
              <li>Fake or misleading health supplements</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="mb-2 font-semibold text-red-700">
              1.5 Counterfeit & Illegal Products
            </h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>Counterfeit branded goods or replicas</li>
              <li>Stolen goods or property</li>
              <li>Products violating intellectual property rights</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="mb-2 font-semibold text-red-700">
              1.6 Harassment & Exploitation
            </h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>Content promoting violence, hate, or discrimination</li>
              <li>Child exploitation or endangerment (ANY form)</li>
              <li>Exploitation or abuse content</li>
              <li>Invasive content (doxxing, harassment)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Content Responsibility */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          2. Brand Responsibility for Audience Safety
        </h2>

        <div className="space-y-3 text-gray-700">
          <p>
            <strong>You are responsible for:</strong>
          </p>

          <div className="space-y-2 rounded bg-gray-50 p-4 text-sm">
            <p>
              ✓ Ensuring your promotion does NOT mislead the creator's audience
              into losing money
            </p>
            <p>✓ Being truthful about product/service benefits and risks</p>
            <p>
              ✓ Clearly stating if any health/financial claims are not
              medically/legally proven
            </p>
            <p>✓ Complying with Indian advertising standards (ASCI Code)</p>
            <p>
              ✓ Explicitly disclosing if the creator is being paid for promotion
              (#ad or #sponsorship)
            </p>
          </div>
        </div>
      </section>

      {/* 3. Consequences */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          3. Violations & Consequences
        </h2>

        <div className="space-y-4">
          <div className="rounded border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-800">First Violation</h3>
            <p className="text-sm text-gray-700">
              Gig removed. Brand warned. Account restricted for 7 days.
            </p>
          </div>

          <div className="rounded border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-800">
              Second Violation
            </h3>
            <p className="text-sm text-gray-700">
              Account suspended for 30 days. Creator & audience refunded if
              applicable.
            </p>
          </div>

          <div className="rounded border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-800">
              Third Violation or Severe Misconduct
            </h3>
            <p className="text-sm text-gray-700">
              Permanent account ban. Potential legal action. Reported to
              relevant authorities for illegal activities.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Required Disclosures */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          4. Required Disclosures in Gig Description
        </h2>

        <div className="space-y-2 rounded border-l-4 border-blue-500 bg-blue-50 p-4 text-sm text-gray-700">
          <p>
            <strong>Specify clearly in gig description:</strong>
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>What the product/service is</li>
            <li>Any risks or side effects</li>
            <li>Target audience (age restriction if applicable)</li>
            <li>
              If creator should mention: "I'm being paid for this promotion"
            </li>
            <li>If claims are medically/legally proven or not</li>
            <li>
              Applicable disclaimers (e.g., "Not a substitute for professional
              medical advice")
            </li>
          </ul>
        </div>
      </section>

      {/* 5. Acceptable Promotions */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          5. Examples of ACCEPTABLE Promotions
        </h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="rounded bg-green-50 p-3">
            ✓ Food/restaurant: "Try our new menu at [cafe name]"
          </div>
          <div className="rounded bg-green-50 p-3">
            ✓ Fashion brand: "Check out our new collection"
          </div>
          <div className="rounded bg-green-50 p-3">
            ✓ Real estate: "Luxury apartments available at [location]"
          </div>
          <div className="rounded bg-green-50 p-3">
            ✓ Skincare (certified): "AYUSH-approved natural skincare,
            dermatologist tested"
          </div>
          <div className="rounded bg-green-50 p-3">
            ✓ Fitness: "Join our online fitness program for health"
          </div>
          <div className="rounded bg-green-50 p-3">
            ✓ Education: "Enroll in our course to learn [skill]"
          </div>
        </div>
      </section>

      {/* 6. Acknowledgment */}
      <section className="mt-8 rounded border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-gray-800">
          <strong>By posting a gig, you acknowledge:</strong> You have read and
          agree to these guidelines. You understand that violations may result
          in account suspension, refunds, and legal action. You take full
          responsibility for the content and claims in your promotion.
        </p>
      </section>
    </div>
  );

  const CreatorGuidelines = () => (
    <div className="prose prose-sm max-w-none space-y-6">
      {/* Introduction */}
      <section className="rounded border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="font-medium text-gray-800">
          🛡️ Your reputation is your biggest asset. Protect it by accepting only
          legitimate, honest promotions. Reject anything suspicious—50BraIns
          backs you.
        </p>
      </section>

      {/* 1. What You Can Refuse */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          1. You Have the Right to Refuse
        </h2>

        <p className="mb-3 text-gray-700">
          <strong>Even if a gig is posted, you can reject it if:</strong>
        </p>

        <div className="space-y-3">
          <div className="rounded border-l-4 border-red-500 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-700">
              It's NOT YOUR NICHE
            </h3>
            <p className="text-sm text-gray-700">
              Your audience trusts you for specific content. Promoting something
              off-topic damages your credibility.
            </p>
          </div>

          <div className="rounded border-l-4 border-red-500 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-700">
              It's Suspicious or Sounds Scammy
            </h3>
            <p className="text-sm text-gray-700">
              "Easy money", "unrealistic returns", "get rich quick" = 99% scams.
              Reject immediately.
            </p>
          </div>

          <div className="rounded border-l-4 border-red-500 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-700">
              It Could Harm Your Audience
            </h3>
            <p className="text-sm text-gray-700">
              Betting apps, fake health claims, unproven medicine = Your
              audience loses trust + money. Don't promote.
            </p>
          </div>

          <div className="rounded border-l-4 border-red-500 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-700">
              The Brand Seems Dishonest
            </h3>
            <p className="text-sm text-gray-700">
              Vague descriptions, pressure to promote, red flags = walk away.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Your Responsibilities */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          2. When You Accept a Gig: Your Responsibilities
        </h2>

        <div className="space-y-4">
          <div className="rounded border-l-4 border-green-600 bg-green-50 p-4">
            <h3 className="mb-2 font-semibold text-green-800">
              ✓ Be Honest in Your Promotion
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              <li>Only share truthful information about the product/service</li>
              <li>Don't overstate benefits or hide risks</li>
              <li>
                If you don't personally use/believe in it, reconsider accepting
              </li>
            </ul>
          </div>

          <div className="rounded border-l-4 border-green-600 bg-green-50 p-4">
            <h3 className="mb-2 font-semibold text-green-800">
              ✓ Disclose Paid Promotion
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              <li>
                Always mention "#ad" or "#sponsorship" or "Paid promotion"
              </li>
              <li>
                Clearly state you're being paid (Indian law + ASCI Code
                requirement)
              </li>
              <li>
                Put disclaimer in caption, video description, or first comment
              </li>
            </ul>
          </div>

          <div className="rounded border-l-4 border-green-600 bg-green-50 p-4">
            <h3 className="mb-2 font-semibold text-green-800">
              ✓ Protect Your Audience
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              <li>
                If product has health claims, mention these are NOT medical
                advice
              </li>
              <li>Add disclaimer: "Consult doctor before use"</li>
              <li>
                For financial products: "Results may vary, not guaranteed"
              </li>
            </ul>
          </div>

          <div className="rounded border-l-4 border-green-600 bg-green-50 p-4">
            <h3 className="mb-2 font-semibold text-green-800">
              ✓ Deliver Quality Content
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              <li>
                Match gig requirements (duration, posting format, quality)
              </li>
              <li>Make content authentic to your style</li>
              <li>
                Keep content aligned with platform rules (Instagram, YouTube,
                etc.)
              </li>
            </ul>
          </div>

          <div className="rounded border-l-4 border-green-600 bg-green-50 p-4">
            <h3 className="mb-2 font-semibold text-green-800">
              ✓ Communicate with Brand
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              <li>Ask questions if promotion requirements are unclear</li>
              <li>Share drafts/previews before publishing (if requested)</li>
              <li>Meet agreed-upon deadlines</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Red Flags to REJECT */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          3. Red Flags: REJECT These Gigs Immediately
        </h2>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="rounded bg-red-50 p-3">
            ❌ "Promote betting app, easy money guaranteed"
          </div>
          <div className="rounded bg-red-50 p-3">
            ❌ "This medicine cures cancer (no FDA approval mentioned)"
          </div>
          <div className="rounded bg-red-50 p-3">
            ❌ "Join this scheme, earn ₹1 lakh in 1 month"
          </div>
          <div className="rounded bg-red-50 p-3">
            ❌ "Promote this crypto/forex trading, 100% returns"
          </div>
          <div className="rounded bg-red-50 p-3">
            ❌ "No need to disclose it's a paid promotion"
          </div>
          <div className="rounded bg-red-50 p-3">
            ❌ "Promote this counterfeit product as original"
          </div>
          <div className="rounded bg-red-50 p-3">
            ❌ "Brand suddenly wants to 'hide' contract details"
          </div>
          <div className="rounded bg-red-50 p-3">
            ❌ "No communication channel, very secretive"
          </div>
        </div>
      </section>

      {/* 4. Examples of GOOD Gigs */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          4. Examples of GOOD Gigs to Accept
        </h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="rounded bg-green-50 p-3">
            ✓ "Promote our restaurant's new menu + mention it's a paid
            partnership"
          </div>
          <div className="rounded bg-green-50 p-3">
            ✓ "Create unboxing video for our fashion brand (no false claims)"
          </div>
          <div className="rounded bg-green-50 p-3">
            ✓ "Review this online course (honest opinion, disclose sponsorship)"
          </div>
          <div className="rounded bg-green-50 p-3">
            ✓ "AYUSH-approved skincare brand (comes with certifications)"
          </div>
          <div className="rounded bg-green-50 p-3">
            ✓ "Promote real estate project (transparent pricing, legal docs
            available)"
          </div>
          <div className="rounded bg-green-50 p-3">
            ✓ "Advertise fitness program (realistic results, no false promises)"
          </div>
        </div>
      </section>

      {/* 5. If Brand Asks You to Violate Guidelines */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          5. What If Brand Pressures You to Violate Guidelines?
        </h2>

        <div className="space-y-3 rounded border border-yellow-200 bg-yellow-50 p-4">
          <p className="font-medium text-gray-800">
            🛡️ 50BraIns has your back. If a brand:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
            <li>Forces you to hide the paid promotion disclosure</li>
            <li>Asks you to make false medical/financial claims</li>
            <li>Pressures you to promote something illegal/harmful</li>
            <li>Threatens you for refusing</li>
          </ul>
          <p className="mt-3 font-medium text-gray-800">
            ➜ REPORT IT immediately via support@50brains.com. We will:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            <li>Refund your commission if payment received</li>
            <li>Suspend the brand's account</li>
            <li>Escalate to authorities if illegal</li>
          </ul>
        </div>
      </section>

      {/* 6. Consequences for Creators */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          6. Consequences for Violating Guidelines
        </h2>

        <div className="space-y-3">
          <div className="rounded border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-800">
              Promoting Banned Products (Betting, Illegal Drugs, Scams):
            </p>
            <p className="mt-1 text-xs text-gray-700">
              Immediate account suspension + refund to affected audience members
            </p>
          </div>

          <div className="rounded border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-800">
              Not Disclosing Paid Promotion:
            </p>
            <p className="mt-1 text-xs text-gray-700">
              Warning first, then suspension if repeated
            </p>
          </div>

          <div className="rounded border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-800">
              Multiple Violations:
            </p>
            <p className="mt-1 text-xs text-gray-700">
              Permanent ban from 50BraIns platform
            </p>
          </div>
        </div>
      </section>

      {/* 7. Your Rights */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          7. Your Rights as Creator
        </h2>

        <div className="space-y-2 rounded border-l-4 border-blue-500 bg-blue-50 p-4 text-sm text-gray-700">
          <p>✓ Right to refuse any gig without explanation</p>
          <p>✓ Right to report suspicious brands to 50BraIns</p>
          <p>✓ Right to protection if brand violates guidelines</p>
          <p>✓ Right to fair payment upon delivery</p>
          <p>✓ Right to be heard in dispute resolution</p>
        </div>
      </section>

      {/* Acknowledgment */}
      <section className="mt-8 rounded border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-gray-800">
          <strong>By applying to gigs on 50BraIns, you acknowledge:</strong> You
          have read and agree to these guidelines. You understand that violating
          guidelines may result in account suspension. You take responsibility
          for promotional content you create and understand your legal
          obligations under Indian advertising law.
        </p>
      </section>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center space-x-4">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Community Guidelines
              </h2>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center space-x-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('brand')}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  activeTab === 'brand'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Brand Guidelines
              </button>
              <button
                onClick={() => setActiveTab('creator')}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  activeTab === 'creator'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Creator Guidelines
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(90vh-80px)] overflow-y-auto px-6 py-6">
            <div className="mb-4">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                {activeTab === 'brand' ? 'Brand' : 'Creator'} Community
                Guidelines
              </h1>
              <p className="text-sm text-gray-600">
                Effective November 3, 2025
              </p>
            </div>

            {activeTab === 'brand' ? (
              <BrandGuidelines />
            ) : (
              <CreatorGuidelines />
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DocumentTextIcon className="h-4 w-4" />
              <span>
                These guidelines are legally binding and regularly updated
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {activeTab === 'brand' && (
                <button
                  onClick={() => setActiveTab('creator')}
                  className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <span>View Creator Guidelines</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              )}
              {activeTab === 'creator' && (
                <button
                  onClick={() => setActiveTab('brand')}
                  className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <span>View Brand Guidelines</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              )}

              <button onClick={onClose} className="btn-primary px-4 py-2">
                I Understand
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
