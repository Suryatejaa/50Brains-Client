import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | 50BraIns',
  description: 'Get in touch with the 50BraIns team for support, inquiries, or partnerships.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-8">We'd love to hear from you. Reach out to our team for any questions or support.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-teal-600 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">General Inquiries</h3>
                    <a href="mailto:hello@50brains.com" className="text-teal-600 hover:underline">hello@50brains.com</a>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-teal-600 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Customer Support</h3>
                    <a href="mailto:support@50brains.com" className="text-teal-600 hover:underline">support@50brains.com</a>
                    <p className="text-sm text-gray-600 mt-1">Response time: 24-48 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-teal-600 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Payment & Refunds</h3>
                    <a href="mailto:refunds@50brains.com" className="text-teal-600 hover:underline">refunds@50brains.com</a>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-teal-600 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Partnerships</h3>
                    <a href="mailto:partnerships@50brains.com" className="text-teal-600 hover:underline">partnerships@50brains.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Business Address</h3>
              <p className="text-gray-700">
                50BraIns<br />
                Hyderabad, Telangana<br />
                India
              </p>
              <p className="text-sm text-gray-600 mt-2">UDYAM Registration: UDYAM-TS-09-0192429</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <div className="bg-teal-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Help</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/about" className="text-teal-700 hover:text-teal-800 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    About 50BraIns
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-teal-700 hover:text-teal-800 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-teal-700 hover:text-teal-800 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/refund" className="text-teal-700 hover:text-teal-800 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a href="/shipping" className="text-teal-700 hover:text-teal-800 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Delivery Policy
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">For Brands</h3>
              <p className="text-gray-700 text-sm mb-3">
                Looking to launch a campaign? We can help connect you with the perfect creators.
              </p>
              <a href="/signup?type=brand" className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
                Get Started
              </a>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">For Creators</h3>
              <p className="text-gray-700 text-sm mb-3">
                Ready to monetize your creativity? Join our platform and find exciting gigs.
              </p>
              <a href="/signup?type=creator" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                Join as Creator
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
