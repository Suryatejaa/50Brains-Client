import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - 50BraIns',
  description:
    'Privacy policy for 50BraIns marketplace platform handling user data including email, phone, and UPI information in compliance with Indian data protection laws.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="font-inter min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-heading mb-4 text-4xl font-semibold tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-muted mx-auto max-w-2xl text-lg font-normal">
                Your privacy is important to us. This Privacy Policy explains
                how we collect, use, and protect your information.
              </p>
              <div className="mt-4 text-sm font-medium text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="card-glass p-8">
              <div className="prose prose-lg max-w-none">
                {/* 1. Information We Collect */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    1. Information We Collect
                  </h2>
                  <p className="mb-4 text-gray-700">
                    We collect information you provide directly to us,
                    information we obtain automatically when you use our
                    services, and information from third parties.
                  </p>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-none border border-blue-200 bg-blue-50 p-4">
                      <h4 className="mb-2 font-semibold text-blue-800">
                        Personal Information:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
                        <li>Name, email address, phone number</li>
                        <li>Profile pictures and portfolio content</li>
                        <li>Social media handles and links</li>
                        <li>Skills, experience, and bio information</li>
                        <li>Payment and billing information</li>
                      </ul>
                    </div>
                    <div className="rounded-none border border-green-200 bg-green-50 p-4">
                      <h4 className="mb-2 font-semibold text-green-800">
                        Automatic Information:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-green-700">
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
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    2. How We Use Your Information
                  </h2>
                  <p className="mb-4 text-gray-700">
                    We use the information we collect to provide, maintain, and
                    improve our services, process transactions, and communicate
                    with you.
                  </p>

                  <div className="mb-4 rounded-none border border-purple-200 bg-purple-50 p-4">
                    <h4 className="mb-2 font-semibold text-purple-800">
                      Primary Uses:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-purple-700">
                      <li>Provide and operate the 50BraIns platform</li>
                      <li>
                        Match brands with suitable creators and freelancers
                      </li>
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
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    3. Information Sharing and Disclosure
                  </h2>
                  <p className="mb-4 text-gray-700">
                    We may share your information in certain limited
                    circumstances as described below. We do not sell your
                    personal information to third parties.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-none border border-amber-200 bg-amber-50 p-4">
                      <h4 className="mb-2 font-semibold text-amber-800">
                        With Other Users:
                      </h4>
                      <p className="text-sm text-amber-700">
                        Your profile information, portfolio, and public activity
                        may be visible to other platform users to facilitate
                        connections and collaborations.
                      </p>
                    </div>

                    <div className="rounded-none border border-red-200 bg-red-50 p-4">
                      <h4 className="mb-2 font-semibold text-red-800">
                        Service Providers:
                      </h4>
                      <p className="text-sm text-red-700">
                        We work with third-party service providers who help us
                        operate our platform, process payments, send emails, and
                        provide customer support.
                      </p>
                    </div>

                    <div className="rounded-none border border-gray-200 bg-gray-50 p-4">
                      <h4 className="mb-2 font-semibold text-gray-800">
                        Legal Requirements:
                      </h4>
                      <p className="text-sm text-gray-700">
                        We may disclose information when required by law, to
                        respond to legal requests, or to protect our rights and
                        the safety of our users.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 4. Data Security */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    4. Data Security
                  </h2>
                  <p className="mb-4 text-gray-700">
                    We implement appropriate technical and organizational
                    measures to protect your personal information against
                    unauthorized access, alteration, disclosure, or destruction.
                  </p>

                  <div className="mb-4 rounded-none border border-green-200 bg-green-50 p-4">
                    <h4 className="mb-2 font-semibold text-green-800">
                      Security Measures:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-green-700">
                      <li>Encryption of data in transit and at rest</li>
                      <li>
                        Secure payment processing through certified providers
                      </li>
                      <li>
                        Regular security audits and vulnerability assessments
                      </li>
                      <li>Access controls and authentication requirements</li>
                      <li>Employee training on data protection practices</li>
                    </ul>
                  </div>

                  <div className="rounded-none border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> While we strive to protect
                      your information, no method of transmission over the
                      internet or electronic storage is 100% secure. We cannot
                      guarantee absolute security.
                    </p>
                  </div>
                </section>

                {/* 5. Your Rights and Choices */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    5. Your Rights and Choices
                  </h2>
                  <p className="mb-4 text-gray-700">
                    You have certain rights regarding your personal information.
                    Here's how you can exercise these rights:
                  </p>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="rounded-none border border-blue-200 bg-blue-50 p-3">
                        <h4 className="mb-1 text-sm font-semibold text-blue-800">
                          Access & Update
                        </h4>
                        <p className="text-xs text-blue-700">
                          Review and update your profile information through
                          your account settings.
                        </p>
                      </div>

                      <div className="rounded-none border border-purple-200 bg-purple-50 p-3">
                        <h4 className="mb-1 text-sm font-semibold text-purple-800">
                          Delete Account
                        </h4>
                        <p className="text-xs text-purple-700">
                          Request deletion of your account and associated data.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-none border border-orange-200 bg-orange-50 p-3">
                        <h4 className="mb-1 text-sm font-semibold text-orange-800">
                          Data Portability
                        </h4>
                        <p className="text-xs text-orange-700">
                          Request a copy of your data in a machine-readable
                          format.
                        </p>
                      </div>

                      <div className="rounded-none border border-pink-200 bg-pink-50 p-3">
                        <h4 className="mb-1 text-sm font-semibold text-pink-800">
                          Marketing Preferences
                        </h4>
                        <p className="text-xs text-pink-700">
                          Opt-out of marketing communications at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 6. Cookies and Tracking */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    6. Cookies and Tracking Technologies
                  </h2>
                  <p className="mb-4 text-gray-700">
                    We use cookies and similar technologies to enhance your
                    experience, analyze usage patterns, and provide personalized
                    content.
                  </p>

                  <div className="mb-4 rounded-none border border-indigo-200 bg-indigo-50 p-4">
                    <h4 className="mb-2 font-semibold text-indigo-800">
                      Types of Cookies:
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                      <div>
                        <strong className="text-indigo-700">Essential:</strong>
                        <p className="text-indigo-600">
                          Required for basic platform functionality
                        </p>
                      </div>
                      <div>
                        <strong className="text-indigo-700">Analytics:</strong>
                        <p className="text-indigo-600">
                          Help us understand how you use our platform
                        </p>
                      </div>
                      <div>
                        <strong className="text-indigo-700">
                          Preferences:
                        </strong>
                        <p className="text-indigo-600">
                          Remember your settings and preferences
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    You can control cookies through your browser settings, but
                    disabling certain cookies may affect platform functionality.
                  </p>
                </section>

                {/* 7. Data Retention */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    7. Data Retention
                  </h2>
                  <p className="mb-4 text-gray-700">
                    We retain your personal information for as long as necessary
                    to provide our services, comply with legal obligations,
                    resolve disputes, and enforce our agreements.
                  </p>

                  <div className="rounded-none border border-gray-200 bg-gray-50 p-4">
                    <h4 className="mb-2 font-semibold text-gray-800">
                      Retention Periods:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                      <li>
                        <strong>Active Accounts:</strong> Data retained while
                        your account is active
                      </li>
                      <li>
                        <strong>Inactive Accounts:</strong> Data may be retained
                        for up to 3 years
                      </li>
                      <li>
                        <strong>Legal Requirements:</strong> Some data retained
                        longer as required by law
                      </li>
                      <li>
                        <strong>Deleted Accounts:</strong> Most data deleted
                        within 30 days of deletion request
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 8. Children's Privacy */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    8. Children's Privacy
                  </h2>
                  <div className="rounded-none border border-red-200 bg-red-50 p-4">
                    <p className="text-red-700">
                      <strong>Age Restriction:</strong> Our platform is intended
                      for users who are at least 18 years old. We do not
                      knowingly collect personal information from children under
                      18. If we become aware that we have collected personal
                      information from a child under 18, we will take steps to
                      delete such information.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    Contact Us
                  </h2>
                  <p className="mb-4 text-gray-700">
                    If you have any questions about this Privacy Policy or our
                    data practices, please contact us:
                  </p>
                  <div className="rounded-none border border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <strong>Privacy Officer:</strong> privacy@50brains.com
                      </div>
                      <div>
                        <strong>General Support:</strong> support@50brains.com
                      </div>
                      <div>
                        <strong>Data Protection Officer:</strong>{' '}
                        dpo@50brains.com
                      </div>
                      <div>
                        <strong>Mailing Address:</strong> [Company Address]
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4 text-center">
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/terms" className="btn-secondary">
                  Terms of Service
                </Link>
                <Link href="/contact" className="btn-ghost">
                  Contact Us
                </Link>
                <Link href="/dashboard" className="btn-primary">
                  Back to Dashboard
                </Link>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Your privacy matters to us. We are committed to protecting your
                personal information and being transparent about our data
                practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
