import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | 50BraIns',
  description: 'Privacy policy explaining how 50BraIns collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: November 3, 2025</p>

        <div className="prose prose-sm max-w-none space-y-6">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              50BraIns ("we", "us", or "our") respects your privacy and is committed to protecting your 
              personal data. This Privacy Policy explains how we collect, use, store, and share your information 
              when you use our marketplace platform at www.50brains.com.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              By using our services, you consent to the data practices described in this policy.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
              <li><strong>Profile Information:</strong> Bio, profile photo, portfolio links, social media handles</li>
              <li><strong>Payment Information:</strong> PAN number (for KYC), bank account details for payouts</li>
              <li><strong>Communication Data:</strong> Messages, gig descriptions, proposals, reviews</li>
              <li><strong>Transaction Data:</strong> Payment history, gig details, invoices</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.2 Information We Collect Automatically</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device ID</li>
              <li><strong>Cookies & Tracking:</strong> Session cookies, analytics cookies, preference cookies</li>
              <li><strong>Log Data:</strong> Access times, error logs, API calls</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-2">We use your data to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide and operate the 50BraIns platform</li>
              <li>Process payments and manage escrow transactions</li>
              <li>Verify your identity for KYC compliance</li>
              <li>Facilitate communication between Brands and Creators</li>
              <li>Send transactional emails (gig updates, payment notifications)</li>
              <li>Improve platform features and user experience</li>
              <li>Detect and prevent fraud, spam, and security threats</li>
              <li>Comply with legal obligations and enforce our Terms</li>
              <li>Send promotional communications (you can opt-out anytime)</li>
            </ul>
          </section>

          {/* 4. Legal Basis for Processing */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Legal Basis for Processing</h2>
            <p className="text-gray-700 leading-relaxed mb-2">We process your data based on:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Contract Performance:</strong> To provide services you requested</li>
              <li><strong>Legal Obligation:</strong> KYC requirements, tax compliance, fraud prevention</li>
              <li><strong>Legitimate Interest:</strong> Platform security, analytics, service improvement</li>
              <li><strong>Consent:</strong> Marketing communications, cookies (where required)</li>
            </ul>
          </section>

          {/* 5. Sharing Your Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Sharing Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-2">We share your data with:</p>
            
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">5.1 Other Platform Users</h3>
            <p className="text-gray-700 leading-relaxed">
              Your profile information (name, bio, portfolio) is visible to other users. Brands and Creators 
              can see each other's details when collaborating on gigs.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">5.2 Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Razorpay:</strong> Payment processing and escrow services</li>
              <li><strong>Supabase:</strong> Database hosting and authentication</li>
              <li><strong>Vercel/Railway:</strong> Web hosting and infrastructure</li>
              <li><strong>Resend:</strong> Transactional email delivery</li>
              <li><strong>CloudAMQP:</strong> Message queue services</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">5.3 Legal & Compliance</h3>
            <p className="text-gray-700 leading-relaxed">
              We may disclose data to comply with legal obligations, court orders, government requests, 
              or to protect our rights and prevent illegal activity.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">5.4 Business Transfers</h3>
            <p className="text-gray-700 leading-relaxed">
              In case of merger, acquisition, or asset sale, your data may be transferred to the acquiring entity.
            </p>

            <p className="text-gray-700 leading-relaxed mt-4 font-medium">
              We do NOT sell your personal data to third parties for marketing purposes.
            </p>
          </section>

          {/* 6. Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-2">We implement industry-standard security measures:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>HTTPS encryption for all data transmission</li>
              <li>Encrypted password storage using bcrypt</li>
              <li>Secure database access with row-level security (RLS)</li>
              <li>Regular security audits and vulnerability testing</li>
              <li>Access controls limiting employee data access</li>
              <li>Automatic session expiration and logout</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              However, no system is 100% secure. We cannot guarantee absolute security but will notify 
              you promptly of any data breaches as required by law.
            </p>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Active Accounts:</strong> As long as your account is active</li>
              <li><strong>Closed Accounts:</strong> Up to 7 years for tax and legal compliance</li>
              <li><strong>Transaction Records:</strong> 7 years as per Indian tax laws</li>
              <li><strong>Analytics Data:</strong> Anonymized after 2 years</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You can request data deletion, subject to our legal retention obligations.
            </p>
          </section>

          {/* 8. Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing for marketing or legitimate interests</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for optional data processing</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise these rights, email us at privacy@50brains.com. We will respond within 30 days.
            </p>
          </section>

          {/* 9. Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Cookies & Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-2">We use cookies to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Essential Cookies:</strong> Enable core functionality (login, session management)</li>
              <li><strong>Analytics Cookies:</strong> Understand usage patterns and improve the platform</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You can control cookies through your browser settings. Disabling essential cookies may 
              affect platform functionality.
            </p>
          </section>

          {/* 10. Third-Party Links */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform may contain links to external websites (e.g., Creator portfolios, brand websites). 
              We are not responsible for the privacy practices of third-party sites. Please review their 
              privacy policies before sharing data.
            </p>
          </section>

          {/* 11. Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not intended for users under 18. We do not knowingly collect data from 
              children. If we discover such data, we will delete it immediately.
            </p>
          </section>

          {/* 12. International Transfers */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your data is primarily stored in India. Some service providers (e.g., Vercel, Supabase) may 
              process data in other countries. We ensure adequate safeguards are in place for such transfers.
            </p>
          </section>

          {/* 13. Updates */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. Changes will be posted on this page with 
              an updated "Last Updated" date. Material changes will be communicated via email.
            </p>
          </section>

          {/* 14. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For privacy-related questions or to exercise your rights, contact:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700"><strong>50BraIns - Data Protection Officer</strong></p>
              <p className="text-gray-700">Email: echoliftagency@gmail.com</p>
              <p className="text-gray-700">Website: www.50brains.in</p>
              {/* <p className="text-gray-700">UDYAM: UDYAM-TS-09-0192429</p> */}
            </div>
          </section>

          {/* Consent */}
          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 italic">
              By using 50BraIns, you acknowledge that you have read and understood this Privacy Policy 
              and consent to the collection and use of your information as described.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
