import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - 50BraIns',
  description:
    'Terms and conditions for using 50BraIns marketplace platform connecting brands with creators in India.',
};

export default function TermsOfServicePage() {
  return (
    <div className="font-inter min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-heading mb-4 text-4xl font-semibold tracking-tight">
                Terms & Conditions
              </h1>
              <p className="text-muted mx-auto max-w-2xl text-lg font-normal">
                Please read these Terms & Conditions carefully before using
                50BraIns platform
              </p>
              <div className="mt-4 text-sm font-medium text-gray-500">
                Last updated: November 1, 2025
              </div>
            </div>

            <div className="card-glass p-8">
              <div className="prose prose-lg max-w-none">
                {/* 1. Agreement to Terms */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    1. Agreement to Terms
                  </h2>
                  <p className="mb-4 text-gray-700">
                    By accessing and using 50BraIns ("Platform," "we," "our," or
                    "us"), you ("User," "you," or "your") accept and agree to be
                    bound by these Terms & Conditions. If you do not agree to
                    these terms, please do not use this platform.
                  </p>
                  <p className="text-gray-700">
                    50BraIns is operated under Indian jurisdiction and complies
                    with the Information Technology Act, 2000, Consumer
                    Protection Act, 2019, and other applicable Indian laws.
                    These Terms constitute a legal agreement between you and
                    50BraIns for use of our marketplace platform.
                  </p>
                </section>

                {/* 2. Platform Description */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    2. Platform Description
                  </h2>
                  <p className="mb-4 text-gray-700">
                    50BraIns is a digital marketplace registered in India that
                    connects brands, businesses, and individuals with talented
                    creators, influencers, freelancers, and content creators
                    across India. Our platform facilitates:
                  </p>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-none border border-blue-200 bg-blue-50 p-4">
                      <h4 className="mb-2 font-semibold text-blue-800">
                        For Brands & Businesses:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
                        <li>Access to verified creators and freelancers</li>
                        <li>Project posting and management tools</li>
                        <li>Secure payment processing via UPI/Bank transfer</li>
                        <li>Performance analytics and ROI tracking</li>
                        <li>Dispute resolution mechanisms</li>
                      </ul>
                    </div>
                    <div className="rounded-none border border-green-200 bg-green-50 p-4">
                      <h4 className="mb-2 font-semibold text-green-800">
                        For Creators & Freelancers:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-green-700">
                        <li>Portfolio showcase and skill verification</li>
                        <li>Gig application and proposal systems</li>
                        <li>Secure payment guarantee with escrow</li>
                        <li>Reputation and rating systems</li>
                        <li>Direct communication with clients</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 3. User Registration & Eligibility */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    3. User Registration & Eligibility
                  </h2>
                  <div className="mb-4 rounded-none border border-red-200 bg-red-50 p-4">
                    <h4 className="mb-2 font-semibold text-red-800">
                      Eligibility Requirements:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-red-700">
                      <li>
                        Must be at least 18 years old or have parental consent
                      </li>
                      <li>
                        Must be a legal resident of India or registered Indian
                        entity
                      </li>
                      <li>
                        Must have a valid Indian mobile number and email address
                      </li>
                      <li>
                        Must provide accurate identity verification documents
                      </li>
                      <li>
                        Must have a valid Indian bank account or UPI ID for
                        payments
                      </li>
                    </ul>
                  </div>
                  <p className="mb-4 text-gray-700">
                    By creating an account, you represent that all information
                    provided is accurate, complete, and current. You are
                    responsible for maintaining the confidentiality of your
                    account credentials and for all activities that occur under
                    your account.
                  </p>
                  <div className="mb-4 rounded-none border border-amber-200 bg-amber-50 p-4">
                    <h4 className="mb-2 font-semibold text-amber-800">
                      Account Security & KYC Compliance:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-amber-700">
                      <li>Complete KYC verification as per RBI guidelines</li>
                      <li>
                        Maintain accurate PAN/Aadhaar information for tax
                        compliance
                      </li>
                      <li>Secure your account with strong passwords and 2FA</li>
                      <li>Report suspicious activities immediately</li>
                      <li>
                        Comply with FEMA regulations for international
                        transactions
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 4. User Conduct */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    4. User Conduct
                  </h2>
                  <p className="mb-4 text-gray-700">
                    You agree not to use the Service to:
                  </p>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-none border border-red-200 bg-red-50 p-4">
                      <h4 className="mb-2 font-semibold text-red-800">
                        Prohibited Activities:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                        <li>Upload harmful or malicious content</li>
                        <li>Violate intellectual property rights</li>
                        <li>Engage in fraudulent activities</li>
                        <li>Harass or abuse other users</li>
                        <li>Spam or send unsolicited messages</li>
                      </ul>
                    </div>
                    <div className="rounded-none border border-green-200 bg-green-50 p-4">
                      <h4 className="mb-2 font-semibold text-green-800">
                        Expected Behavior:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-green-700">
                        <li>Treat all users with respect</li>
                        <li>Provide accurate work samples</li>
                        <li>Honor commitments and deadlines</li>
                        <li>Communicate professionally</li>
                        <li>Report violations to our team</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 5. Payment Terms & Indian Compliance */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    5. Payment Terms & Indian Compliance
                  </h2>
                  <p className="mb-4 text-gray-700">
                    50BraIns operates an escrow-based payment system in
                    compliance with RBI guidelines. All transactions are
                    processed through authorized Indian payment gateways.
                  </p>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-none border border-blue-200 bg-blue-50 p-4">
                      <h4 className="mb-2 font-semibold text-blue-800">
                        Accepted Payment Methods:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
                        <li>UPI (PhonePe, Google Pay, Paytm, etc.)</li>
                        <li>Net Banking (all major Indian banks)</li>
                        <li>Credit/Debit Cards (Visa, Mastercard, RuPay)</li>
                        <li>Digital wallets (Paytm, PhonePe, etc.)</li>
                        <li>RTGS/NEFT for large transactions</li>
                      </ul>
                    </div>
                    <div className="rounded-none border border-green-200 bg-green-50 p-4">
                      <h4 className="mb-2 font-semibold text-green-800">
                        Tax & Compliance:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-green-700">
                        <li>GST applicable as per Indian tax laws</li>
                        <li>TDS deduction for payments above ₹30,000</li>
                        <li>Form 16A/TDS certificates provided</li>
                        <li>Annual tax statements for income reporting</li>
                        <li>PAN mandatory for payments above ₹50,000</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mb-4 rounded-none border border-purple-200 bg-purple-50 p-4">
                    <h4 className="mb-2 font-semibold text-purple-800">
                      Escrow & Payment Security:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-purple-700">
                      <li>
                        Payments held in escrow until work completion and
                        approval
                      </li>
                      <li>
                        7-day approval window for clients to review deliverables
                      </li>
                      <li>
                        Automatic release if no disputes raised within approval
                        period
                      </li>
                      <li>Platform fee: 5% for creators, 2% for clients</li>
                      <li>Refunds processed as per our Refund Policy</li>
                      <li>Dispute resolution through platform mediation</li>
                    </ul>
                  </div>
                </section>

                {/* 6. Intellectual Property */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    6. Intellectual Property
                  </h2>
                  <p className="mb-4 text-gray-700">
                    The Service and its original content, features and
                    functionality are and will remain the exclusive property of
                    50BraIns and its licensors. Users retain ownership of
                    content they create and upload.
                  </p>
                  <div className="mb-4 rounded-none border border-purple-200 bg-purple-50 p-4">
                    <h4 className="mb-2 font-semibold text-purple-800">
                      Content Rights:
                    </h4>
                    <p className="text-sm text-purple-700">
                      By uploading content, you grant 50BraIns a non-exclusive,
                      worldwide, royalty-free license to use, display, and
                      distribute your content solely for the purpose of
                      operating and promoting the Service.
                    </p>
                  </div>
                </section>

                {/* 7. Privacy and Data Protection */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    7. Privacy and Data Protection
                  </h2>
                  <p className="mb-4 text-gray-700">
                    Your privacy is important to us. Please review our Privacy
                    Policy, which also governs your use of the Service, to
                    understand our practices.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Link href="/privacy" className="btn-primary-sm">
                      Read Privacy Policy
                    </Link>
                  </div>
                </section>

                {/* 8. Termination */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    8. Termination
                  </h2>
                  <p className="mb-4 text-gray-700">
                    We may terminate or suspend your account and bar access to
                    the Service immediately, without prior notice or liability,
                    under our sole discretion, for any reason whatsoever,
                    including but not limited to a breach of the Terms.
                  </p>
                  <p className="text-gray-700">
                    Upon termination, your right to use the Service will cease
                    immediately. If you wish to terminate your account, you may
                    simply discontinue using the Service.
                  </p>
                </section>

                {/* 9. Disclaimer */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    9. Disclaimer
                  </h2>
                  <div className="mb-4 rounded-none border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-700">
                      THE INFORMATION ON THIS WEBSITE IS PROVIDED ON AN "AS IS"
                      BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, 50BRAINS
                      EXCLUDES ALL REPRESENTATIONS, WARRANTIES, CONDITIONS OR
                      OTHER TERMS WHICH, BUT FOR THIS LEGAL NOTICE, MIGHT HAVE
                      EFFECT IN RELATION TO THIS WEBSITE.
                    </p>
                  </div>
                </section>

                {/* 10. Limitation of Liability */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    10. Limitation of Liability
                  </h2>
                  <p className="mb-4 text-gray-700">
                    In no event shall 50BraIns, nor its directors, employees,
                    partners, agents, suppliers, or affiliates, be liable for
                    any indirect, incidental, special, consequential, or
                    punitive damages, including without limitation, loss of
                    profits, data, use, goodwill, or other intangible losses.
                  </p>
                </section>

                {/* 11. Governing Law & Jurisdiction */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    11. Governing Law & Jurisdiction
                  </h2>
                  <p className="mb-4 text-gray-700">
                    These Terms shall be governed by and construed in accordance
                    with the laws of India, including but not limited to:
                  </p>
                  <div className="mb-4 rounded-none border border-indigo-200 bg-indigo-50 p-4">
                    <h4 className="mb-2 font-semibold text-indigo-800">
                      Applicable Indian Laws:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-indigo-700">
                      <li>
                        Information Technology Act, 2000 and IT Rules 2021
                      </li>
                      <li>Consumer Protection Act, 2019</li>
                      <li>Indian Contract Act, 1872</li>
                      <li>Payment and Settlement Systems Act, 2007</li>
                      <li>Income Tax Act, 1961 and GST laws</li>
                      <li>Foreign Exchange Management Act (FEMA), 1999</li>
                    </ul>
                  </div>
                  <p className="text-gray-700">
                    Any disputes arising from these Terms shall be subject to
                    the exclusive jurisdiction of courts in [City], India. Users
                    agree to submit to such jurisdiction and waive any
                    objections to venue.
                  </p>
                </section>

                {/* 12. Changes to Terms */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    12. Changes to Terms
                  </h2>
                  <p className="mb-4 text-gray-700">
                    We reserve the right, at our sole discretion, to modify or
                    replace these Terms at any time. If a revision is material,
                    we will provide at least 30 days notice prior to any new
                    terms taking effect.
                  </p>
                  <div className="rounded-none border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> What constitutes a material
                      change will be determined at our sole discretion. Your
                      continued use of the Service after we post any
                      modifications to the Terms constitutes acceptance of those
                      changes.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    Contact Information
                  </h2>
                  <p className="mb-4 text-gray-700">
                    For any questions regarding these Terms & Conditions, please
                    contact us:
                  </p>
                  <div className="rounded-none border border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <strong>Legal Queries:</strong> legal@50brains.com
                      </div>
                      <div>
                        <strong>General Support:</strong> support@50brains.com
                      </div>
                      <div>
                        <strong>Grievance Officer:</strong>{' '}
                        grievance@50brains.com
                      </div>
                      <div>
                        <strong>Phone:</strong> +91-XXXXX-XXXXX
                      </div>
                      <div>
                        <strong>Registered Address:</strong> [To be filled -
                        Indian registered office address]
                      </div>
                      <div>
                        <strong>CIN:</strong> [Company Identification Number]
                      </div>
                      <div>
                        <strong>GST No:</strong> [GSTIN Number]
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-none border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-700">
                      <strong>Grievance Redressal:</strong> As per IT Rules
                      2021, we have appointed a Grievance Officer to address
                      user complaints. Grievances will be acknowledged within 24
                      hours and resolved within 15 days.
                    </p>
                  </div>
                </section>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4 text-center">
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/privacy" className="btn-secondary">
                  Privacy Policy
                </Link>
                <Link href="/contact" className="btn-ghost">
                  Contact Us
                </Link>
                <Link href="/dashboard" className="btn-primary">
                  Back to Dashboard
                </Link>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                By using 50BraIns, you acknowledge that you have read and
                understood these Terms of Service and agree to be bound by them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
