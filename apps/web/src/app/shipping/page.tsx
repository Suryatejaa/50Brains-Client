import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Delivery Policy | 50BraIns',
  description: 'Delivery policy for digital services on the 50BraIns marketplace platform.',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: November 3, 2025</p>

        <div className="prose prose-sm max-w-none space-y-6">
          
          {/* 1. Nature of Services */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Nature of Services</h2>
            <p className="text-gray-700 leading-relaxed">
              50BraIns is a <strong>digital services marketplace</strong>. We do not sell or ship physical products. 
              All transactions involve digital content creation services, influencer marketing campaigns, and 
              creative collaborations delivered electronically.
            </p>
          </section>

          {/* 2. Digital Delivery */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Digital Delivery</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              All deliverables are provided digitally through the platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Content Files:</strong> Photos, videos, graphics, written content uploaded to platform</li>
              <li><strong>Social Media Posts:</strong> Published directly to brand's specified channels</li>
              <li><strong>Campaign Assets:</strong> Digital files accessible through platform dashboard</li>
              <li><strong>Communication:</strong> All deliverables shared via platform messaging or direct upload</li>
            </ul>
          </section>

          {/* 3. Delivery Timeline */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Delivery Timeline</h2>
            <p className="text-gray-700 leading-relaxed">
              Delivery timelines are agreed upon between Brand and Creator at the time of gig acceptance:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li><strong>Standard Delivery:</strong> As specified in gig description (typically 3-14 days)</li>
              <li><strong>Rush Delivery:</strong> May be available for additional fees (negotiated directly)</li>
              <li><strong>Milestone-Based:</strong> Phased delivery for multi-part projects</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Creators commit to delivering work by the agreed deadline. Late deliveries may be subject to 
              cancellation or refund as per our <Link href="/refund" className="text-blue-600 hover:underline">Refund Policy</Link>.
            </p>
          </section>

          {/* 4. Delivery Confirmation */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Delivery Confirmation</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              When a Creator delivers work:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Creator uploads deliverables to the platform and marks gig as "Delivered"</li>
              <li>Brand receives notification via email and platform dashboard</li>
              <li>Brand has <strong>7 days</strong> to review and respond</li>
              <li>Brand can: (a) Approve, (b) Request revisions, or (c) Raise dispute</li>
              <li>If no response within 7 days, work is auto-approved and payment released</li>
            </ol>
          </section>

          {/* 5. File Formats & Specifications */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. File Formats & Specifications</h2>
            <p className="text-gray-700 leading-relaxed">
              Creators deliver work in formats agreed upon in gig requirements:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li><strong>Images:</strong> JPEG, PNG, RAW (as specified)</li>
              <li><strong>Videos:</strong> MP4, MOV, AVI (standard resolutions: 1080p, 4K)</li>
              <li><strong>Graphics:</strong> PSD, AI, PDF, SVG</li>
              <li><strong>Documents:</strong> DOCX, PDF, TXT</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              If deliverables don't meet agreed specifications, Brands can request revisions within the 
              review period.
            </p>
          </section>

          {/* 6. Revisions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Revisions</h2>
            <p className="text-gray-700 leading-relaxed">
              Number of revisions is agreed upon at gig acceptance (default: 2 revisions included):
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Revisions must be within the original scope of work</li>
              <li>Request revisions within 7-day review period</li>
              <li>Creator delivers revised work within agreed timeline (typically 2-5 days)</li>
              <li>Additional revisions beyond agreed count may incur extra charges</li>
            </ul>
          </section>

          {/* 7. Failed Delivery */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Failed Delivery or No Delivery</h2>
            <p className="text-gray-700 leading-relaxed">
              If a Creator fails to deliver:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Brand can raise a dispute after deadline passes</li>
              <li>Platform reviews the case and mediates</li>
              <li>Full refund issued if Creator did not deliver without valid reason</li>
              <li>Creator's account may be suspended for repeated failures</li>
            </ul>
          </section>

          {/* 8. Platform Storage */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Platform Storage & Access</h2>
            <p className="text-gray-700 leading-relaxed">
              Delivered files are stored on 50BraIns platform for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li><strong>Active Gigs:</strong> Throughout the project and 30 days after completion</li>
              <li><strong>Completed Gigs:</strong> Files accessible for 90 days post-approval</li>
              <li><strong>Download:</strong> Brands should download deliverables promptly</li>
              <li><strong>After Expiry:</strong> Files may be archived or deleted; not recoverable</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We recommend Brands download and back up deliverables immediately upon approval.
            </p>
          </section>

          {/* 9. No Physical Shipping */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. No Physical Shipping</h2>
            <p className="text-gray-700 leading-relaxed">
              50BraIns does <strong>not</strong> handle:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Physical product shipment</li>
              <li>Courier or logistics services</li>
              <li>International shipping or customs</li>
              <li>Physical merchandise or printed materials</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              If your campaign requires physical elements (e.g., product samples for influencer review), 
              coordination of physical shipping must be arranged directly between Brand and Creator outside 
              the platform.
            </p>
          </section>

          {/* 10. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Questions About Delivery</h2>
            <p className="text-gray-700 leading-relaxed">
              For delivery-related queries or issues, contact:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700"><strong>50BraIns Support</strong></p>
              <p className="text-gray-700">Email: support@50brains.com</p>
              <p className="text-gray-700">Delivery Issues: delivery@50brains.com</p>
              <p className="text-gray-700">Response Time: 24-48 hours</p>
            </div>
          </section>

          {/* Note */}
          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 italic">
              This Delivery Policy applies to all digital services facilitated through the 50BraIns platform. 
              For payment terms and cancellation conditions, refer to our{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link> and{' '}
              <Link href="/refund" className="text-blue-600 hover:underline">Refund Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
