import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | 50BraIns',
  description: 'Terms and conditions for using the 50BraIns marketplace platform connecting brands with content creators.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Last Updated: November 12, 2025
      </p>

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        
        {/* Introduction */}
        <section>
          <p className="mb-4">
            Welcome to 50BraIns (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated under UDYAM-TS-09-0192429. 
            By accessing or using our marketplace platform at www.50brains.com, you agree to be bound by these Terms and Conditions. 
            If you do not agree, please do not use our services.
          </p>
        </section>

        {/* Eligibility */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Eligibility</h2>
          <p className="mb-2">To use 50BraIns, you must:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Be at least 18 years of age</li>
            <li>Have the legal capacity to enter into binding contracts</li>
            <li>Provide accurate and complete registration information</li>
            <li>Comply with all applicable laws and regulations in India</li>
          </ul>
        </section>

        {/* Platform Services */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Platform Services</h2>
          <p className="mb-2">50BraIns provides:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>A marketplace connecting Brands with Content Creators</li>
            <li>Secure escrow-based payment processing</li>
            <li>Campaign management tools</li>
            <li>Dispute resolution services</li>
          </ul>
          <p className="mt-4 italic">
            We act as an intermediary platform only. We do not employ Creators, nor do we guarantee 
            the quality, safety, or legality of services provided through the Platform.
          </p>
        </section>

        {/* User Responsibilities */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <p className="mb-2">Users must:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintain accurate account information</li>
            <li>Keep login credentials confidential</li>
            <li>Not engage in fraudulent, abusive, or illegal activities</li>
            <li>Respect intellectual property rights of others</li>
            <li>Provide honest and accurate information in all transactions</li>
            <li>Respond promptly to communications regarding transactions</li>
          </ul>
        </section>

        {/* Platform Fees */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Platform Fees</h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-4">
            <h3 className="text-xl font-semibold mb-3">Fair Split Fee Structure</h3>
            <p className="mb-4">
              50BraIns charges a <strong>10% total platform fee</strong>, split equally between both parties:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold mb-2">For Creators:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>5% fee</strong> deducted from the quoted price</li>
                  <li>If you quote ₹1,000, you receive ₹950 (₹1,000 - ₹50 fee)</li>
                  <li>Minimum fee: ₹1 for transactions above ₹5</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold mb-2">For Brands:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>5% fee</strong> added to the quoted price</li>
                  <li>If creator quotes ₹1,000, you pay ₹1,050 (₹1,000 + ₹50 fee)</li>
                  <li>Plus applicable GST on the platform fee</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded">
              <h4 className="font-semibold mb-2">Example Breakdown:</h4>
              <div className="text-sm space-y-1">
                <p>Creator quotes: <strong>₹10,000</strong></p>
                <p>Creator fee (5%): <strong>-₹500</strong></p>
                <p>Creator receives: <strong>₹9,500</strong></p>
                <hr className="my-2" />
                <p>Brand fee (5%): <strong>+₹500</strong></p>
                <p>GST on total fee (18%): <strong>+₹180</strong></p>
                <p>Brand pays: <strong>₹10,680</strong></p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm">
            <strong>Note:</strong> No platform fees are charged for transactions below ₹5. 
            All fees above ₹5 have a minimum charge of ₹1 per party.
          </p>
        </section>

        {/* Payment Terms */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
          
          <h3 className="text-lg font-semibold mb-2">Escrow System</h3>
          <p className="mb-4">
            All payments are held securely in escrow until work is completed and approved. 
            This protects both Brands and Creators.
          </p>

          <h3 className="text-lg font-semibold mb-2">Payment Timeline</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>When Brand accepts application:</strong> Payment is charged to the Brand and 
              held in escrow
            </li>
            <li>
              <strong>When Creator submits work:</strong> Brand has 24-72 hours to review and approve
            </li>
            <li>
              <strong>After Brand approval:</strong> Payment is processed within <strong>2-3 working days</strong> 
              to the Creator&apos;s bank account
            </li>
            <li>
              <strong>Automatic approval:</strong> If Brand doesn&apos;t respond within the review period, 
              work is auto-approved and payment is released
            </li>
          </ul>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Processing Note:</strong> Payouts are initiated within 2-3 working days after approval. 
              Actual credit time to your bank account may vary by 1-2 days depending on your bank&apos;s processing time.
            </p>
          </div>
        </section>

        {/* Dispute Resolution */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Dispute Resolution</h2>
          <p className="mb-4">
            If a Brand is unsatisfied with deliverables, they may raise a dispute before approving. 
            Our mediation team will:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Review submitted work against campaign requirements</li>
            <li>Communicate with both parties</li>
            <li>Make a binding decision on escrow release</li>
            <li>Determine if revision, partial payment, or full refund is appropriate</li>
          </ul>
          <p className="mt-4">
            Platform decisions are final for escrow purposes. Users may pursue legal recourse independently, 
            but dispute mediation decisions are binding for payment release.
          </p>
        </section>

        {/* Prohibited Activities */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Prohibited Activities</h2>
          <p className="mb-2">Users must not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Attempt to bypass platform payments or communicate off-platform to avoid fees</li>
            <li>Upload or share illegal, obscene, or defamatory content</li>
            <li>Impersonate others or misrepresent credentials</li>
            <li>Attempt to manipulate reviews, ratings, or platform algorithms</li>
            <li>Use the platform for any purpose other than legitimate brand-creator collaborations</li>
            <li>Scrape, copy, or redistribute platform data without authorization</li>
          </ul>
          <p className="mt-4">
            Violation of these terms may result in account suspension or termination without refund.
          </p>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
          <p className="mb-4">
            <strong>Platform IP:</strong> The 50BraIns name, logo, design, and all platform features 
            are owned by 50BraIns and protected by applicable intellectual property laws.
          </p>
          <p>
            <strong>User Content:</strong> Creators retain ownership of their work. By accepting a 
            campaign, Creators grant Brands the usage rights specified in the campaign terms. 
            Brands must respect these usage rights and not exceed agreed-upon terms.
          </p>
        </section>

        {/* Liability Limitations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
          <p className="mb-4">
            50BraIns provides the platform &quot;as is&quot; without warranties. We are not liable for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Quality or accuracy of services provided by Creators</li>
            <li>Conduct or content of users on the platform</li>
            <li>Losses resulting from user interactions or transactions</li>
            <li>Technical issues, downtime, or data loss (though we take measures to prevent these)</li>
            <li>Third-party payment processor delays or failures</li>
          </ul>
          <p className="mt-4">
            Maximum liability is limited to the platform fees paid in the relevant transaction.
          </p>
        </section>

        {/* Account Termination */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Account Termination</h2>
          <p className="mb-4">
            We reserve the right to suspend or terminate accounts that violate these terms, 
            engage in fraudulent activity, or harm the platform community.
          </p>
          <p>
            Users may close their accounts at any time, but must complete all pending transactions first. 
            Pending escrow payments will be processed according to campaign outcomes.
          </p>
        </section>

        {/* Changes to Terms */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
          <p>
            We may update these Terms periodically. Continued use of the platform after changes 
            constitutes acceptance. Material changes will be communicated via email and platform notification.
          </p>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of India. Any disputes shall be subject to the 
            exclusive jurisdiction of courts in Hyderabad, Telangana.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
          <p className="mb-2">For questions about these Terms, contact us at:</p>
          <ul className="list-none space-y-1">
            <li><strong>Email:</strong> echoliftagency@gmail.com</li>
            <li><strong>Address:</strong> Hyderabad</li>
            {/* <li><strong>UDYAM:</strong> UDYAM-TS-09-0192429</li> */}
          </ul>
        </section>

      </div>
    </div>
  );
}
