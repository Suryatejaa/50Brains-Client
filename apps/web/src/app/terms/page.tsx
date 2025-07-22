'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-heading mb-4 text-4xl font-bold">
                Terms of Service
              </h1>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Please read these Terms of Service carefully before using 50BraIns platform
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="card-glass p-8">
              <div className="prose prose-lg max-w-none">
                {/* 1. Agreement to Terms */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    1. Agreement to Terms
                  </h2>
                  <p className="text-gray-700 mb-4">
                    By accessing and using 50BraIns ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                  <p className="text-gray-700">
                    These Terms of Service ("Terms") govern your use of our website located at 50brains.com (the "Service") operated by 50BraIns.
                  </p>
                </section>

                {/* 2. Description of Service */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    2. Description of Service
                  </h2>
                  <p className="text-gray-700 mb-4">
                    50BraIns is a digital platform that connects brands with talented creators, influencers, and freelancers. Our Service provides:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                    <li>A marketplace for gig-based work opportunities</li>
                    <li>Profile creation and portfolio management tools</li>
                    <li>Application and hiring management systems</li>
                    <li>Credit-based payment processing</li>
                    <li>Communication and collaboration tools</li>
                    <li>Analytics and performance tracking</li>
                  </ul>
                </section>

                {/* 3. User Accounts */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    3. User Accounts
                  </h2>
                  <p className="text-gray-700 mb-4">
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-none p-4 mb-4">
                    <h4 className="font-semibold text-amber-800 mb-2">Account Responsibilities:</h4>
                    <ul className="list-disc list-inside text-amber-700 space-y-1">
                      <li>Maintain accurate and up-to-date information</li>
                      <li>Keep your password secure and confidential</li>
                      <li>Notify us immediately of any unauthorized access</li>
                      <li>Use the platform in compliance with all applicable laws</li>
                    </ul>
                  </div>
                </section>

                {/* 4. User Conduct */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    4. User Conduct
                  </h2>
                  <p className="text-gray-700 mb-4">
                    You agree not to use the Service to:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-50 border border-red-200 rounded-none p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Prohibited Activities:</h4>
                      <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                        <li>Upload harmful or malicious content</li>
                        <li>Violate intellectual property rights</li>
                        <li>Engage in fraudulent activities</li>
                        <li>Harass or abuse other users</li>
                        <li>Spam or send unsolicited messages</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-none p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Expected Behavior:</h4>
                      <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                        <li>Treat all users with respect</li>
                        <li>Provide accurate work samples</li>
                        <li>Honor commitments and deadlines</li>
                        <li>Communicate professionally</li>
                        <li>Report violations to our team</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 5. Payment Terms */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    5. Payment Terms
                  </h2>
                  <p className="text-gray-700 mb-4">
                    50BraIns operates on a credit-based system. All payments must be made in advance through our secure payment gateway.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-none p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Payment Policy:</h4>
                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                      <li>Credits are non-refundable except as required by law</li>
                      <li>Unused credits do not expire but may be subject to service fees</li>
                      <li>Platform fees apply to all transactions</li>
                      <li>Taxes are the responsibility of the user</li>
                      <li>Chargebacks may result in account suspension</li>
                    </ul>
                  </div>
                </section>

                {/* 6. Intellectual Property */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    6. Intellectual Property
                  </h2>
                  <p className="text-gray-700 mb-4">
                    The Service and its original content, features and functionality are and will remain the exclusive property of 50BraIns and its licensors. Users retain ownership of content they create and upload.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-none p-4 mb-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Content Rights:</h4>
                    <p className="text-purple-700 text-sm">
                      By uploading content, you grant 50BraIns a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content solely for the purpose of operating and promoting the Service.
                    </p>
                  </div>
                </section>

                {/* 7. Privacy and Data Protection */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    7. Privacy and Data Protection
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/privacy" 
                      className="btn-primary-sm"
                    >
                      Read Privacy Policy
                    </Link>
                  </div>
                </section>

                {/* 8. Termination */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    8. Termination
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
                  </p>
                  <p className="text-gray-700">
                    Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service.
                  </p>
                </section>

                {/* 9. Disclaimer */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    9. Disclaimer
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-none p-4 mb-4">
                    <p className="text-gray-700 text-sm">
                      THE INFORMATION ON THIS WEBSITE IS PROVIDED ON AN "AS IS" BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, 50BRAINS EXCLUDES ALL REPRESENTATIONS, WARRANTIES, CONDITIONS OR OTHER TERMS WHICH, BUT FOR THIS LEGAL NOTICE, MIGHT HAVE EFFECT IN RELATION TO THIS WEBSITE.
                    </p>
                  </div>
                </section>

                {/* 10. Limitation of Liability */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    10. Limitation of Liability
                  </h2>
                  <p className="text-gray-700 mb-4">
                    In no event shall 50BraIns, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </section>

                {/* 11. Governing Law */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    11. Governing Law
                  </h2>
                  <p className="text-gray-700">
                    These Terms shall be interpreted and governed by the laws of [Jurisdiction], without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                  </p>
                </section>

                {/* 12. Changes to Terms */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    12. Changes to Terms
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-none p-4">
                    <p className="text-yellow-700 text-sm">
                      <strong>Important:</strong> What constitutes a material change will be determined at our sole discretion. Your continued use of the Service after we post any modifications to the Terms constitutes acceptance of those changes.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Contact Information
                  </h2>
                  <p className="text-gray-700 mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-none p-4">
                    <div className="space-y-2 text-sm text-gray-700">
                      <div><strong>Email:</strong> legal@50brains.com</div>
                      <div><strong>Support:</strong> support@50brains.com</div>
                      <div><strong>Address:</strong> [Company Address]</div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-y-4 mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/privacy" 
                  className="btn-secondary"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/contact" 
                  className="btn-ghost"
                >
                  Contact Us
                </Link>
                <Link 
                  href="/dashboard" 
                  className="btn-primary"
                >
                  Back to Dashboard
                </Link>
              </div>
              
              <p className="text-sm text-gray-500 mt-6">
                By using 50BraIns, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
