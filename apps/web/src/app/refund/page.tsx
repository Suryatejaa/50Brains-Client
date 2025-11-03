import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | 50BraIns',
  description: 'Refund and cancellation policy for 50BraIns marketplace transactions.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: November 3, 2025</p>

        <div className="prose prose-sm max-w-none space-y-6">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              This Refund & Cancellation Policy governs transactions on the 50BraIns marketplace platform. 
              Our escrow-based payment system protects both Brands and Creators while ensuring fair outcomes.
            </p>
          </section>

          {/* 2. Payment Escrow System */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Payment Escrow System</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              When a Brand accepts a Creator's application:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Brand pays the full gig amount upfront</li>
              <li>Funds are held in secure escrow by 50BraIns</li>
              <li>Creator delivers the work as per agreed terms</li>
              <li>Brand reviews and approves or requests revisions</li>
              <li>Upon approval, 85% is released to Creator, 15% retained by Platform</li>
            </ol>
            <p className="text-gray-700 leading-relaxed mt-3">
              This system ensures Creators get paid for completed work while Brands receive quality deliverables.
            </p>
          </section>

          {/* 3. Cancellation by Brand */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cancellation by Brand</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">3.1 Before Creator Accepts</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Brands can cancel gigs anytime before a Creator is selected</li>
              <li><strong>Refund:</strong> Full refund minus payment gateway charges (typically 2-3%)</li>
              <li><strong>Processing Time:</strong> 5-7 business days</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">3.2 After Payment (Work Not Started)</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Brand can request cancellation within 24 hours of Creator acceptance</li>
              <li>Creator must confirm cancellation</li>
              <li><strong>Refund:</strong> Full amount minus payment gateway charges</li>
              <li><strong>Platform Fee:</strong> Not charged if cancelled before work begins</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">3.3 After Work Begins</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Both parties must mutually agree to cancellation</li>
              <li>Creator is entitled to compensation for work completed</li>
              <li><strong>Partial Payment:</strong> Based on milestone completion (if applicable)</li>
              <li>Platform mediates in case of disagreement</li>
            </ul>
          </section>

          {/* 4. Cancellation by Creator */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cancellation by Creator</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">4.1 Before Starting Work</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Creator may cancel within 12 hours of acceptance without penalty</li>
              <li><strong>Brand Refund:</strong> Full amount minus payment gateway charges</li>
              <li>Repeated cancellations may affect Creator's account standing</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">4.2 After Starting Work</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Creator must provide valid justification (scope change, Brand unresponsiveness, etc.)</li>
              <li>Platform reviews the case and determines fair compensation</li>
              <li>May result in account warnings for repeated cancellations</li>
            </ul>
          </section>

          {/* 5. Delivery & Review Period */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Delivery & Review Period</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">5.1 Creator Deliverables</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Creator submits work through the platform</li>
              <li>Brand has <strong>7 days</strong> to review and respond</li>
              <li>Brand can: (a) Approve, (b) Request revisions, or (c) Dispute</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">5.2 Auto-Approval</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>If Brand does not respond within 7 days, work is auto-approved</li>
              <li>Payment is automatically released to Creator</li>
              <li>No refunds after auto-approval</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">5.3 Revision Requests</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Brands can request reasonable revisions within original scope</li>
              <li>Number of revisions as agreed in gig terms (default: 2 revisions)</li>
              <li>Additional revisions may incur extra charges</li>
              <li>Creator must deliver revisions within agreed timeline</li>
            </ul>
          </section>

          {/* 6. Refund Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Refund Eligibility</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">6.1 Full Refund Cases</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Creator fails to deliver work after multiple reminders</li>
              <li>Delivered work is substantially different from agreed scope</li>
              <li>Creator violates platform policies (plagiarism, copyright infringement)</li>
              <li>Mutual agreement between both parties before completion</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">6.2 Partial Refund Cases</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Work partially completed with Brand's approval</li>
              <li>Milestone-based gigs where some milestones are met</li>
              <li>Mutual agreement on partial delivery</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">6.3 No Refund Cases</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Work delivered as per agreed scope and approved by Brand</li>
              <li>Auto-approval after 7-day review period</li>
              <li>Brand changes requirements after work is delivered</li>
              <li>Subjective dissatisfaction without valid technical issues</li>
              <li>Brand fails to provide necessary inputs/feedback in time</li>
            </ul>
          </section>

          {/* 7. Dispute Resolution */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Dispute Resolution Process</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              If Brand disputes the deliverables:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Brand raises a dispute within 7 days of delivery</li>
              <li>Both parties submit evidence (work samples, communication logs, scope documents)</li>
              <li>50BraIns reviews the case within 3-5 business days</li>
              <li>Platform makes a binding decision on escrow release</li>
              <li>Possible outcomes:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Full payment to Creator (work met requirements)</li>
                  <li>Full refund to Brand (work failed to meet requirements)</li>
                  <li>Partial payment (compromise based on completion percentage)</li>
                  <li>Revision request with extended timeline</li>
                </ul>
              </li>
            </ol>
            <p className="text-gray-700 leading-relaxed mt-3">
              Platform decisions are final. Users may pursue legal recourse if unsatisfied, but 
              dispute mediation decisions are binding for escrow release.
            </p>
          </section>

          {/* 8. Platform Commission */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Platform Commission</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>50BraIns charges a <strong>15% service fee</strong> on all completed transactions</li>
              <li>Platform fee is <strong>non-refundable</strong> once work is delivered and approved</li>
              <li>If full refund is issued (pre-delivery cancellation), platform fee is not charged</li>
              <li>In partial refunds, platform fee is calculated on the amount retained by Creator</li>
            </ul>
          </section>

          {/* 9. Payment Gateway Charges */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Payment Gateway Charges</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Payment gateway fees (Razorpay: ~2-3%) are borne by the Brand</li>
              <li>Gateway charges are <strong>non-refundable</strong> even if transaction is cancelled</li>
              <li>Refunds are processed through the original payment method</li>
              <li>International card fees may apply as per Razorpay policies</li>
            </ul>
          </section>

          {/* 10. Refund Processing Time */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Refund Processing Time</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Initiated by Platform:</strong> Within 24 hours of decision</li>
              <li><strong>Bank Processing:</strong> 5-7 business days for most banks</li>
              <li><strong>Credit Card Refunds:</strong> 7-10 business days</li>
              <li><strong>UPI/Wallet Refunds:</strong> 2-3 business days</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Actual credit time depends on your bank or card issuer. Contact support@50brains.com if 
              refund is delayed beyond 10 business days.
            </p>
          </section>

          {/* 11. Force Majeure */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Force Majeure</h2>
            <p className="text-gray-700 leading-relaxed">
              In case of unforeseen circumstances (natural disasters, platform outages, legal restrictions), 
              both parties may mutually agree to cancel or extend timelines without penalty. Platform will 
              assist in fair resolution.
            </p>
          </section>

          {/* 12. Account Violations */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Account Violations</h2>
            <p className="text-gray-700 leading-relaxed">
              If a user is found violating platform policies (fraud, harassment, IP theft):
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Affected party receives full refund</li>
              <li>Violating user's account is suspended/terminated</li>
              <li>Platform may withhold payments pending investigation</li>
              <li>Legal action may be pursued for serious violations</li>
            </ul>
          </section>

          {/* 13. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact for Refund Queries</h2>
            <p className="text-gray-700 leading-relaxed">
              For refund or cancellation requests, contact:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700"><strong>50BraIns Support Team</strong></p>
              <p className="text-gray-700">Email: support@50brains.com</p>
              <p className="text-gray-700">Refunds Email: refunds@50brains.com</p>
              <p className="text-gray-700">Website: www.50brains.com</p>
              <p className="text-gray-700">Response Time: 24-48 hours</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 italic">
              By using 50BraIns, you acknowledge and accept this Refund & Cancellation Policy. 
              This policy is subject to our Terms & Conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
