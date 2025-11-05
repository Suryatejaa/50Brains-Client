import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | 50BraIns - Connecting Brands with Creators',
  description: 'Learn about 50BraIns, the secure marketplace platform connecting brands with talented content creators across India.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering Brands & Creators
          </h1>
          <p className="text-xl md:text-2xl text-teal-50 max-w-3xl mx-auto leading-relaxed">
            50BraIns is India's trusted marketplace connecting brands with talented content creators 
            through secure, transparent, and fair collaborations.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8 space-y-12">
          
          {/* Our Story */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                In today's digital-first world, content is king—but finding the right creator for your 
                brand or the right brand for your creative talents shouldn't feel like searching for a 
                needle in a haystack.
              </p>
              <p>
                50BraIns was born from a simple observation: brands waste countless hours negotiating with 
                agencies that take massive cuts, while talented creators struggle to find fair-paying opportunities. 
                There had to be a better way.
              </p>
              <p>
                We built 50BraIns to eliminate the middleman, protect both parties with secure escrow payments, 
                and create a transparent platform where quality work meets fair compensation. No hidden fees. 
                No agency markups. Just brands and creators collaborating directly.
              </p>
            </div>
          </section>

          {/* Mission & Vision */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <div className="bg-teal-50 border-l-4 border-teal-500 p-6 rounded-md">
              <p className="text-lg text-gray-800 leading-relaxed">
                To democratize brand-creator collaborations by providing a secure, transparent marketplace 
                that rewards quality, ensures timely payments, and fosters long-term partnerships—all while 
                keeping costs fair for everyone.
              </p>
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              We envision a future where every brand—from local cafes to national enterprises—can effortlessly 
              connect with the perfect creator, and every talented individual can monetize their creativity 
              without jumping through corporate hoops. A world where trust, quality, and fairness define the 
              creator economy.
            </p>
          </section>

          {/* What Makes Us Different */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What Makes Us Different</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Escrow System</h3>
                    <p className="text-gray-700">
                      Your money is safe. Payments are held in escrow until work is delivered and approved, 
                      protecting both brands and creators from disputes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair & Transparent Pricing</h3>
                    <p className="text-gray-700">
                      We charge just 15% platform fee—far lower than traditional agencies' 30-50% markups. 
                      Creators keep 85% of every payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Easy</h3>
                    <p className="text-gray-700">
                      Post a gig, review proposals, hire—all in minutes. No lengthy contracts, no agency bureaucracy. 
                      Just quick, efficient collaboration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Built-in Support</h3>
                    <p className="text-gray-700">
                      Disputes? We mediate. Questions? We answer. Every transaction is backed by our 
                      customer support and fair resolution process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How 50BraIns Works</h2>
            
            <div className="space-y-6">
              {/* For Brands */}
              <div className="border-l-4 border-teal-500 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Brands</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center mr-3">1</span>
                    <span><strong>Post Your Gig:</strong> Describe your campaign, budget, and timeline in minutes.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center mr-3">2</span>
                    <span><strong>Review Proposals:</strong> Creators apply with their portfolios and rates. Choose the best fit.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center mr-3">3</span>
                    <span><strong>Secure Payment:</strong> Pay once, funds held in escrow until work is delivered.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center mr-3">4</span>
                    <span><strong>Approve & Release:</strong> Review deliverables, request revisions if needed, then approve to release payment.</span>
                  </li>
                </ol>
              </div>

              {/* For Creators */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Creators</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold flex items-center justify-center mr-3">1</span>
                    <span><strong>Browse Gigs:</strong> Discover campaigns that match your niche and expertise.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold flex items-center justify-center mr-3">2</span>
                    <span><strong>Submit Proposals:</strong> Share your portfolio, rates, and why you're the perfect fit.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold flex items-center justify-center mr-3">3</span>
                    <span><strong>Deliver Great Work:</strong> Create content, meet deadlines, communicate with the brand.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold flex items-center justify-center mr-3">4</span>
                    <span><strong>Get Paid:</strong> Once approved, receive 85% of the gig value directly to your account.</span>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-700 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Trust</h3>
                <p className="text-gray-600">
                  Every transaction is protected with escrow, KYC verification, and dispute resolution.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-700 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600">
                  No hidden fees. No surprises. You see exactly what you pay and what you earn.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-700 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600">
                  We're building more than a platform—we're fostering a community of creators and brands.
                </p>
              </div>
            </div>
          </section>

          {/* By the Numbers */}
          <section className="bg-gradient-to-r from-teal-50 to-purple-50 -mx-8 px-8 py-12 rounded-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">50BraIns in Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">15%</div>
                <div className="text-gray-600 font-medium">Platform Fee</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">85%</div>
                <div className="text-gray-600 font-medium">Creator Earnings</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">7 Days</div>
                <div className="text-gray-600 font-medium">Review Period</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">100%</div>
                <div className="text-gray-600 font-medium">Escrow Protected</div>
              </div>
            </div>
          </section>

          {/* Legal & Registration */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Legal & Registration</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center">
                  <svg className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {/* <span><strong>Registered MSME:</strong> UDYAM-TS-09-0192429</span> */}
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Secured Payments:</strong> Powered by Razorpay</span>
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Compliant Platform:</strong> Adheres to Indian business and data protection laws</span>
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Based in:</strong> Hyderabad, Telangana, India</span>
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-teal-600 to-teal-700 -mx-8 px-8 py-12 rounded-lg text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
              Join hundreds of brands and creators building successful collaborations on 50BraIns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login" 
                className="inline-block bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="inline-block bg-teal-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-900 transition border-2 border-white"
              >
                Sign Up
              </Link>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                Have questions? Want to learn more? We'd love to hear from you.
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> <a href="mailto:hello@50brains.com" className="text-teal-600 hover:underline">hello@50brains.com</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@50brains.com" className="text-teal-600 hover:underline">support@50brains.com</a></p>
                <p><strong>Website:</strong> <a href="https://www.50brains.com" className="text-teal-600 hover:underline">www.50brains.com</a></p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
