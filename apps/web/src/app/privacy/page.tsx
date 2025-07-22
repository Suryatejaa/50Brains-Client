'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-heading mb-4 text-4xl font-bold">
                Privacy Policy
              </h1>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="card-glass p-8">
              <div className="prose prose-lg max-w-none">
                {/* 1. Information We Collect */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    1. Information We Collect
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We collect information you provide directly to us, information we obtain automatically when you use our services, and information from third parties.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-none p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Personal Information:</h4>
                      <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                        <li>Name, email address, phone number</li>
                        <li>Profile pictures and portfolio content</li>
                        <li>Social media handles and links</li>
                        <li>Skills, experience, and bio information</li>
                        <li>Payment and billing information</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-none p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Automatic Information:</h4>
                      <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                        <li>Device information and IP address</li>
                        <li>Browser type and operating system</li>
                        <li>Usage patterns and preferences</li>
                        <li>Cookies and similar technologies</li>
                        <li>Geographic location data</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 2. How We Use Your Information */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    2. How We Use Your Information
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                  </p>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-none p-4 mb-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Primary Uses:</h4>
                    <ul className="list-disc list-inside text-purple-700 space-y-1">
                      <li>Provide and operate the 50BraIns platform</li>
                      <li>Match brands with suitable creators and freelancers</li>
                      <li>Process payments and manage accounts</li>
                      <li>Send notifications and platform updates</li>
                      <li>Provide customer support and assistance</li>
                      <li>Improve our services and develop new features</li>
                      <li>Prevent fraud and ensure platform security</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </div>
                </section>

                {/* 3. Information Sharing */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    3. Information Sharing and Disclosure
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We may share your information in certain limited circumstances as described below. We do not sell your personal information to third parties.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-none p-4">
                      <h4 className="font-semibold text-amber-800 mb-2">With Other Users:</h4>
                      <p className="text-amber-700 text-sm">
                        Your profile information, portfolio, and public activity may be visible to other platform users to facilitate connections and collaborations.
                      </p>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-none p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Service Providers:</h4>
                      <p className="text-red-700 text-sm">
                        We work with third-party service providers who help us operate our platform, process payments, send emails, and provide customer support.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-none p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Legal Requirements:</h4>
                      <p className="text-gray-700 text-sm">
                        We may disclose information when required by law, to respond to legal requests, or to protect our rights and the safety of our users.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 4. Data Security */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    4. Data Security
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-none p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">Security Measures:</h4>
                    <ul className="list-disc list-inside text-green-700 space-y-1">
                      <li>Encryption of data in transit and at rest</li>
                      <li>Secure payment processing through certified providers</li>
                      <li>Regular security audits and vulnerability assessments</li>
                      <li>Access controls and authentication requirements</li>
                      <li>Employee training on data protection practices</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-none p-4">
                    <p className="text-yellow-700 text-sm">
                      <strong>Important:</strong> While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                    </p>
                  </div>
                </section>

                {/* 5. Your Rights and Choices */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    5. Your Rights and Choices
                  </h2>
                  <p className="text-gray-700 mb-4">
                    You have certain rights regarding your personal information. Here's how you can exercise these rights:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-none p-3">
                        <h4 className="font-semibold text-blue-800 text-sm mb-1">Access & Update</h4>
                        <p className="text-blue-700 text-xs">Review and update your profile information through your account settings.</p>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-none p-3">
                        <h4 className="font-semibold text-purple-800 text-sm mb-1">Delete Account</h4>
                        <p className="text-purple-700 text-xs">Request deletion of your account and associated data.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-orange-50 border border-orange-200 rounded-none p-3">
                        <h4 className="font-semibold text-orange-800 text-sm mb-1">Data Portability</h4>
                        <p className="text-orange-700 text-xs">Request a copy of your data in a machine-readable format.</p>
                      </div>
                      
                      <div className="bg-pink-50 border border-pink-200 rounded-none p-3">
                        <h4 className="font-semibold text-pink-800 text-sm mb-1">Marketing Preferences</h4>
                        <p className="text-pink-700 text-xs">Opt-out of marketing communications at any time.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 6. Cookies and Tracking */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    6. Cookies and Tracking Technologies
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content.
                  </p>
                  
                  <div className="bg-indigo-50 border border-indigo-200 rounded-none p-4 mb-4">
                    <h4 className="font-semibold text-indigo-800 mb-2">Types of Cookies:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <strong className="text-indigo-700">Essential:</strong>
                        <p className="text-indigo-600">Required for basic platform functionality</p>
                      </div>
                      <div>
                        <strong className="text-indigo-700">Analytics:</strong>
                        <p className="text-indigo-600">Help us understand how you use our platform</p>
                      </div>
                      <div>
                        <strong className="text-indigo-700">Preferences:</strong>
                        <p className="text-indigo-600">Remember your settings and preferences</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    You can control cookies through your browser settings, but disabling certain cookies may affect platform functionality.
                  </p>
                </section>

                {/* 7. Data Retention */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    7. Data Retention
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
                  </p>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-none p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Retention Periods:</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                      <li><strong>Inactive Accounts:</strong> Data may be retained for up to 3 years</li>
                      <li><strong>Legal Requirements:</strong> Some data retained longer as required by law</li>
                      <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days of deletion request</li>
                    </ul>
                  </div>
                </section>

                {/* 8. Children's Privacy */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    8. Children's Privacy
                  </h2>
                  <div className="bg-red-50 border border-red-200 rounded-none p-4">
                    <p className="text-red-700">
                      <strong>Age Restriction:</strong> Our platform is intended for users who are at least 18 years old. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Contact Us
                  </h2>
                  <p className="text-gray-700 mb-4">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-none p-4">
                    <div className="space-y-2 text-sm text-gray-700">
                      <div><strong>Privacy Officer:</strong> privacy@50brains.com</div>
                      <div><strong>General Support:</strong> support@50brains.com</div>
                      <div><strong>Data Protection Officer:</strong> dpo@50brains.com</div>
                      <div><strong>Mailing Address:</strong> [Company Address]</div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-y-4 mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/terms" 
                  className="btn-secondary"
                >
                  Terms of Service
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
                Your privacy matters to us. We are committed to protecting your personal information and being transparent about our data practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
