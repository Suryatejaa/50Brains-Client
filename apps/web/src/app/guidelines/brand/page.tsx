import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Brand Guidelines | 50BraIns',
  description: 'Community guidelines for brands posting gigs on 50BraIns marketplace.',
};

export default function BrandGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Community Guidelines</h1>
        <p className="text-sm text-gray-600 mb-8">Effective November 3, 2025</p>

        <div className="prose prose-sm max-w-none space-y-6">
          
          {/* Introduction */}
          <section className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-gray-800 font-medium">
              ⚠️ By posting a gig on 50BraIns, you commit to these guidelines. Violations may result in 
              account suspension, refunds, or legal action.
            </p>
          </section>

          {/* 1. Prohibited Products & Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Strictly Prohibited Products & Services</h2>
            
            <p className="text-gray-700 mb-3">Brands CANNOT promote any of the following:</p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-700 mb-2">1.1 Gambling & Betting</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li>Online betting apps, poker apps, betting websites</li>
                  <li>Cryptocurrency betting or trading apps promising "easy money"</li>
                  <li>Fantasy sports betting apps</li>
                  <li>Any app/service claiming to predict gambling outcomes</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-700 mb-2">1.2 Financial Fraud & Scams</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li>Schemes promising guaranteed/unrealistic returns (100% profit, "quick money")</li>
                  <li>Forex trading, stock market tips claiming guaranteed wins</li>
                  <li>MLM (multi-level marketing) schemes or pyramid schemes</li>
                  <li>Fake investment opportunities</li>
                  <li>Unlicensed lending or loan apps</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-700 mb-2">1.3 Illegal/Dangerous Substances</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li>Illegal drugs, controlled substances, or counterfeit medicines</li>
                  <li>Steroids, performance-enhancing drugs for human consumption</li>
                  <li>Unregulated or harmful wellness products</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-700 mb-2">1.4 Misleading Health Claims</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li>Claims to cure serious diseases (cancer, diabetes, COVID) without medical approval</li>
                  <li>Unproven medical treatments or "miracle cures"</li>
                  <li>Products claiming instant weight loss, cosmetic changes (unless FDA/AYUSH approved)</li>
                  <li>Fake or misleading health supplements</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-700 mb-2">1.5 Counterfeit & Illegal Products</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                  <li>Counterfeit branded goods or replicas</li>
                  <li>Stolen goods or property</li>
                  <li>Products violating intellectual property rights</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-700 mb-2">1.6 Harassment & Exploitation</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Brand Responsibility for Audience Safety</h2>
            
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>You are responsible for:</strong>
              </p>
              
              <div className="bg-gray-50 p-4 rounded space-y-2 text-sm">
                <p>
                  ✓ Ensuring your promotion does NOT mislead the creator's audience into losing money
                </p>
                <p>
                  ✓ Being truthful about product/service benefits and risks
                </p>
                <p>
                  ✓ Clearly stating if any health/financial claims are not medically/legally proven
                </p>
                <p>
                  ✓ Complying with Indian advertising standards (ASCI Code)
                </p>
                <p>
                  ✓ Explicitly disclosing if the creator is being paid for promotion (#ad or #sponsorship)
                </p>
              </div>
            </div>
          </section>

          {/* 3. Consequences */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Violations & Consequences</h2>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <h3 className="font-semibold text-red-800 mb-2">First Violation</h3>
                <p className="text-sm text-gray-700">Gig removed. Brand warned. Account restricted for 7 days.</p>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <h3 className="font-semibold text-red-800 mb-2">Second Violation</h3>
                <p className="text-sm text-gray-700">Account suspended for 30 days. Creator & audience refunded if applicable.</p>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <h3 className="font-semibold text-red-800 mb-2">Third Violation or Severe Misconduct</h3>
                <p className="text-sm text-gray-700">Permanent account ban. Potential legal action. Reported to relevant authorities for illegal activities.</p>
              </div>
            </div>
          </section>

          {/* 4. Required Disclosures */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Required Disclosures in Gig Description</h2>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-2 text-sm text-gray-700">
              <p>
                <strong>Specify clearly in gig description:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>What the product/service is</li>
                <li>Any risks or side effects</li>
                <li>Target audience (age restriction if applicable)</li>
                <li>If creator should mention: "I'm being paid for this promotion"</li>
                <li>If claims are medically/legally proven or not</li>
                <li>Applicable disclaimers (e.g., "Not a substitute for professional medical advice")</li>
              </ul>
            </div>
          </section>

          {/* 5. Acceptable Promotions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Examples of ACCEPTABLE Promotions</h2>
            
            <div className="space-y-3 text-gray-700 text-sm">
              <div className="bg-green-50 p-3 rounded">
                ✓ Food/restaurant: "Try our new menu at [cafe name]"
              </div>
              <div className="bg-green-50 p-3 rounded">
                ✓ Fashion brand: "Check out our new collection"
              </div>
              <div className="bg-green-50 p-3 rounded">
                ✓ Real estate: "Luxury apartments available at [location]"
              </div>
              <div className="bg-green-50 p-3 rounded">
                ✓ Skincare (certified): "AYUSH-approved natural skincare, dermatologist tested"
              </div>
              <div className="bg-green-50 p-3 rounded">
                ✓ Fitness: "Join our online fitness program for health"
              </div>
              <div className="bg-green-50 p-3 rounded">
                ✓ Education: "Enroll in our course to learn [skill]"
              </div>
            </div>
          </section>

          {/* 6. Acknowledgment */}
          <section className="bg-yellow-50 border border-yellow-200 p-4 rounded mt-8">
            <p className="text-sm text-gray-800">
              <strong>By posting a gig, you acknowledge:</strong> You have read and agree to these guidelines. 
              You understand that violations may result in account suspension, refunds, and legal action. 
              You take full responsibility for the content and claims in your promotion.
            </p>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link 
            href="/guidelines/creator"
            className="text-blue-600 hover:underline font-medium"
          >
            View Creator Guidelines →
          </Link>
        </div>
      </div>
    </div>
  );
}
