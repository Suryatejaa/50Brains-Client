import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Creator Guidelines | 50BraIns',
  description: 'Community guidelines for creators accepting gigs on 50BraIns marketplace.',
};

export default function CreatorGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Community Guidelines</h1>
        <p className="text-sm text-gray-600 mb-8">Effective November 3, 2025</p>

        <div className="prose prose-sm max-w-none space-y-6">
          
          {/* Introduction */}
          <section className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-gray-800 font-medium">
              🛡️ Your reputation is your biggest asset. Protect it by accepting only legitimate, 
              honest promotions. Reject anything suspicious—50BraIns backs you.
            </p>
          </section>

          {/* 1. What You Can Refuse */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. You Have the Right to Refuse</h2>
            
            <p className="text-gray-700 mb-3">
              <strong>Even if a gig is posted, you can reject it if:</strong>
            </p>
            
            <div className="space-y-3">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-semibold text-red-700 mb-2">It's NOT YOUR NICHE</h3>
                <p className="text-sm text-gray-700">
                  Your audience trusts you for specific content. Promoting something off-topic damages your credibility.
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-semibold text-red-700 mb-2">It's Suspicious or Sounds Scammy</h3>
                <p className="text-sm text-gray-700">
                  "Easy money", "unrealistic returns", "get rich quick" = 99% scams. Reject immediately.
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-semibold text-red-700 mb-2">It Could Harm Your Audience</h3>
                <p className="text-sm text-gray-700">
                  Betting apps, fake health claims, unproven medicine = Your audience loses trust + money. Don't promote.
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-semibold text-red-700 mb-2">The Brand Seems Dishonest</h3>
                <p className="text-sm text-gray-700">
                  Vague descriptions, pressure to promote, red flags = walk away.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Your Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. When You Accept a Gig: Your Responsibilities</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <h3 className="font-semibold text-green-800 mb-2">✓ Be Honest in Your Promotion</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Only share truthful information about the product/service</li>
                  <li>Don't overstate benefits or hide risks</li>
                  <li>If you don't personally use/believe in it, reconsider accepting</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <h3 className="font-semibold text-green-800 mb-2">✓ Disclose Paid Promotion</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Always mention "#ad" or "#sponsorship" or "Paid promotion"</li>
                  <li>Clearly state you're being paid (Indian law + ASCI Code requirement)</li>
                  <li>Put disclaimer in caption, video description, or first comment</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <h3 className="font-semibold text-green-800 mb-2">✓ Protect Your Audience</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>If product has health claims, mention these are NOT medical advice</li>
                  <li>Add disclaimer: "Consult doctor before use"</li>
                  <li>For financial products: "Results may vary, not guaranteed"</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <h3 className="font-semibold text-green-800 mb-2">✓ Deliver Quality Content</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Match gig requirements (duration, posting format, quality)</li>
                  <li>Make content authentic to your style</li>
                  <li>Keep content aligned with platform rules (Instagram, YouTube, etc.)</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <h3 className="font-semibold text-green-800 mb-2">✓ Communicate with Brand</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Ask questions if promotion requirements are unclear</li>
                  <li>Share drafts/previews before publishing (if requested)</li>
                  <li>Meet agreed-upon deadlines</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Red Flags to REJECT */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Red Flags: REJECT These Gigs Immediately</h2>
            
            <div className="space-y-2 text-sm text-gray-700">
              <div className="bg-red-50 p-3 rounded">
                ❌ "Promote betting app, easy money guaranteed"
              </div>
              <div className="bg-red-50 p-3 rounded">
                ❌ "This medicine cures cancer (no FDA approval mentioned)"
              </div>
              <div className="bg-red-50 p-3 rounded">
                ❌ "Join this scheme, earn ₹1 lakh in 1 month"
              </div>
              <div className="bg-red-50 p-3 rounded">
                ❌ "Promote this crypto/forex trading, 100% returns"
              </div>
              <div className="bg-red-50 p-3 rounded">
                ❌ "No need to disclose it's a paid promotion"
              </div>
              <div className="bg-red-50 p-3 rounded">
                ❌ "Promote this counterfeit product as original"
              </div>
              <div className="bg-red-50 p-3 rounded">
                ❌ "Brand suddenly wants to 'hide' contract details"
              </div>
              <div className="bg-red-50 p-3 rounded">
                ❌ "No communication channel, very secretive"
              </div>
            </div>
          </section>

          {/* 4. Examples of GOOD Gigs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Examples of GOOD Gigs to Accept</h2>
            
            <div className="space-y-3 text-gray-700 text-sm">
              <div className="bg-green-50 p-3 rounded">
                ✓ "Promote our restaurant's new menu + mention it's a paid partnership"
              </div>
              <div className="bg-green-50 p-3 rounded">
                ✓ "Create unboxing video for our fashion brand (no false claims)"
              </div>
              <div className="bg-green-50 p-3 rounded">
                ✓ "Review this online course (honest opinion, disclose sponsorship)"
              </div>
              <div className="bg-green-50 p-3 rounded">
                ✓ "AYUSH-approved skincare brand (comes with certifications)"
              </div>
              <div className="bg-green-50 p-3 rounded">
                ✓ "Promote real estate project (transparent pricing, legal docs available)"
              </div>
              <div className="bg-green-50 p-3 rounded">
                ✓ "Advertise fitness program (realistic results, no false promises)"
              </div>
            </div>
          </section>

          {/* 5. If Brand Asks You to Violate Guidelines */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. What If Brand Pressures You to Violate Guidelines?</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded space-y-3">
              <p className="text-gray-800 font-medium">
                🛡️ 50BraIns has your back. If a brand:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Forces you to hide the paid promotion disclosure</li>
                <li>Asks you to make false medical/financial claims</li>
                <li>Pressures you to promote something illegal/harmful</li>
                <li>Threatens you for refusing</li>
              </ul>
              <p className="text-gray-800 font-medium mt-3">
                ➜ REPORT IT immediately via support@50brains.com. We will:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Refund your commission if payment received</li>
                <li>Suspend the brand's account</li>
                <li>Escalate to authorities if illegal</li>
              </ul>
            </div>
          </section>

          {/* 6. Consequences for Creators */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Consequences for Violating Guidelines</h2>
            
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <p className="text-sm font-semibold text-red-800">
                  Promoting Banned Products (Betting, Illegal Drugs, Scams):
                </p>
                <p className="text-xs text-gray-700 mt-1">Immediate account suspension + refund to affected audience members</p>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <p className="text-sm font-semibold text-red-800">
                  Not Disclosing Paid Promotion:
                </p>
                <p className="text-xs text-gray-700 mt-1">Warning first, then suspension if repeated</p>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <p className="text-sm font-semibold text-red-800">
                  Multiple Violations:
                </p>
                <p className="text-xs text-gray-700 mt-1">Permanent ban from 50BraIns platform</p>
              </div>
            </div>
          </section>

          {/* 7. Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights as Creator</h2>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-2 text-sm text-gray-700">
              <p>
                ✓ Right to refuse any gig without explanation
              </p>
              <p>
                ✓ Right to report suspicious brands to 50BraIns
              </p>
              <p>
                ✓ Right to protection if brand violates guidelines
              </p>
              <p>
                ✓ Right to fair payment upon delivery
              </p>
              <p>
                ✓ Right to be heard in dispute resolution
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="bg-yellow-50 border border-yellow-200 p-4 rounded mt-8">
            <p className="text-sm text-gray-800">
              <strong>By applying to gigs on 50BraIns, you acknowledge:</strong> You have read and agree to these guidelines. 
              You understand that violating guidelines may result in account suspension. You take responsibility for 
              promotional content you create and understand your legal obligations under Indian advertising law.
            </p>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link 
            href="/guidelines/brand" 
            className="text-blue-600 hover:underline font-medium"
          >
            View Brand Guidelines →
          </Link>
        </div>
      </div>
    </div>
  );
}
