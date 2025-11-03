import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | 50BraIns',
  description: 'Terms and conditions for using the 50BraIns marketplace platform connecting brands with content creators.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: November 3, 2025</p>

        <div className="prose prose-sm max-w-none space-y-6">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to 50BraIns ("Platform", "we", "us", or "our"), operated under UDYAM-TS-09-0192429. 
              By accessing or using our marketplace platform at www.50brains.com, you agree to be bound by these 
              Terms and Conditions. If you do not agree, please do not use our services.
            </p>
          </section>

          {/* 2. Definitions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>"Brand"</strong> refers to businesses, companies, or individuals seeking content creation services.</li>
              <li><strong>"Creator"</strong> refers to content creators, influencers, or freelancers offering services.</li>
              <li><strong>"Gig"</strong> refers to a project or campaign posted by a Brand.</li>
              <li><strong>"Platform"</strong> refers to the 50BraIns marketplace and all associated services.</li>
              <li><strong>"User"</strong> refers to any person accessing or using the Platform.</li>
            </ul>
          </section>

          {/* 3. Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-2">To use 50BraIns, you must:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations in India</li>
            </ul>
          </section>

          {/* 4. Platform Services */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Platform Services</h2>
            <p className="text-gray-700 leading-relaxed mb-2">50BraIns provides:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>A marketplace connecting Brands with Creators</li>
              <li>Secure payment processing and escrow services</li>
              <li>Communication tools for project collaboration</li>
              <li>Dispute resolution assistance (best effort basis)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We act as an intermediary platform only. We do not employ Creators, nor do we guarantee 
              the quality, safety, or legality of services provided through the Platform.
            </p>
          </section>

          {/* 5. Account Registration */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Account Registration</h2>
            <p className="text-gray-700 leading-relaxed mb-2">Users must:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide valid email address and phone number</li>
              <li>Choose a secure password</li>
              <li>Complete KYC verification for payment transactions (PAN required)</li>
              <li>Not create multiple accounts or share account access</li>
              <li>Notify us immediately of any unauthorized account use</li>
            </ul>
          </section>

          {/* 6. Payment Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Payment Terms</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">6.1 Platform Commission</h3>
            <p className="text-gray-700 leading-relaxed">
              50BraIns charges a <strong>15% service fee</strong> on the total transaction value. 
              This fee is deducted from payments before release to Creators.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">6.2 Payment Flow</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Brands pay the full gig amount upfront</li>
              <li>Funds are held in secure escrow until work is delivered and approved</li>
              <li>Upon approval, 85% is released to Creator, 15% retained by Platform</li>
              <li>All payments processed via Razorpay with applicable payment gateway charges</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">6.3 Escrow Protection</h3>
            <p className="text-gray-700 leading-relaxed">
              Funds remain in escrow until the Brand approves deliverables or the dispute resolution 
              period expires (7 days from delivery). This protects both Brands and Creators.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">6.4 Taxes</h3>
            <p className="text-gray-700 leading-relaxed">
              Users are responsible for all applicable taxes (GST, TDS, income tax) as per Indian tax laws. 
              Platform fees are exclusive of GST where applicable.
            </p>
          </section>

          {/* 7. Gig Posting & Applications */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Gig Posting & Applications</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">7.1 Brand Responsibilities</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide clear, accurate gig descriptions</li>
              <li>Specify deliverables, timelines, and budget</li>
              <li>Respond to Creator applications within 48 hours</li>
              <li>Pay promptly upon accepting a Creator</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">7.2 Creator Responsibilities</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Apply only to gigs you can deliver</li>
              <li>Meet agreed deadlines and quality standards</li>
              <li>Communicate proactively with Brands</li>
              <li>Deliver work that complies with all laws and platform policies</li>
            </ul>
          </section>

          {/* 8. Prohibited Activities */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Prohibited Activities</h2>
            <p className="text-gray-700 leading-relaxed mb-2">Users must NOT:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Engage in fraudulent, misleading, or illegal activities</li>
              <li>Post offensive, defamatory, or infringing content</li>
              <li>Circumvent platform fees by transacting off-platform</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Use bots, scrapers, or automated tools without permission</li>
              <li>Violate intellectual property rights</li>
              <li>Share or sell account access</li>
            </ul>
          </section>

          {/* 9. Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All Platform content (logo, design, code, text) is owned by 50BraIns or licensed to us. 
              Users retain ownership of content they create but grant us a worldwide, non-exclusive license 
              to display, reproduce, and distribute such content for platform operations.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              For work commissioned through gigs, IP rights transfer as agreed between Brand and Creator. 
              Platform assumes no liability for IP disputes between parties.
            </p>
          </section>

          {/* 10. Dispute Resolution */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              If a dispute arises between Brand and Creator:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Parties should first attempt direct resolution</li>
              <li>Either party may request Platform mediation within 7 days of delivery</li>
              <li>Platform will review evidence and make a binding decision on escrow release</li>
              <li>Decisions are final unless legal proceedings are initiated</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Platform mediation is offered as a courtesy. We are not liable for outcomes and may charge 
              a dispute handling fee in case of frivolous claims.
            </p>
          </section>

          {/* 11. Refunds & Cancellations */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Refunds & Cancellations</h2>
            <p className="text-gray-700 leading-relaxed">
              Refer to our <a href="/refund" className="text-blue-600 hover:underline">Refund Policy</a> for 
              detailed terms on cancellations, refunds, and escrow release conditions.
            </p>
          </section>

          {/* 12. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, 50BraIns is not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Quality, legality, or safety of services provided by Creators</li>
              <li>Actions or omissions of Brands or Creators</li>
              <li>Loss of data, revenue, or business opportunities</li>
              <li>Indirect, incidental, or consequential damages</li>
              <li>Failures caused by third-party services (payment gateways, hosting providers)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Our maximum liability is limited to the platform fees paid by the affected party in the 
              3 months prior to the claim.
            </p>
          </section>

          {/* 13. Account Termination */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Account Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We may suspend or terminate accounts for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Repeated disputes or poor conduct</li>
              <li>Non-payment or chargebacks</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Users may close accounts at any time, but remain liable for pending obligations. 
              Termination does not affect accrued rights or obligations.
            </p>
          </section>

          {/* 14. Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of the Platform is subject to our{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>, 
              which explains how we collect, use, and protect your personal data.
            </p>
          </section>

          {/* 15. Modifications */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Modifications to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to update these Terms at any time. Changes will be effective upon 
              posting. Continued use after changes constitutes acceptance. Material changes will be 
              notified via email or platform notification.
            </p>
          </section>

          {/* 16. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">16. Governing Law & Jurisdiction</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of India. Any disputes shall be subject to the 
              exclusive jurisdiction of courts in Hyderabad, Telangana.
            </p>
          </section>

          {/* 17. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">17. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms, contact us at:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700"><strong>50BraIns</strong></p>
              <p className="text-gray-700">UDYAM Registration: UDYAM-TS-09-0192429</p>
              <p className="text-gray-700">Email: legal@50brains.com</p>
              <p className="text-gray-700">Website: www.50brains.com</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 italic">
              By using 50BraIns, you acknowledge that you have read, understood, and agree to be bound 
              by these Terms and Conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
