import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | 50BraIns',
  description: 'Refund and cancellation policy for 50BraIns marketplace transactions.',
};

export default function RefundPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Refund & Cancellation Policy</h1>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Last Updated: November 12, 2025
      </p>

      <div className="space-y-8 text-gray-800 dark:text-gray-200">
        
        {/* Introduction */}
        <section>
          <p className="mb-4">
            This Refund & Cancellation Policy governs transactions on the 50BraIns marketplace platform. 
            Our escrow-based payment system protects both Brands and Creators while ensuring fair outcomes.
          </p>
        </section>

        {/* How Payment Works */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. How Escrow Payments Work</h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-3">Payment Flow Timeline</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Brand Accepts Application</h4>
                  <p className="text-sm">
                    Payment is charged to Brand and held securely in escrow. Creator can now begin work.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Creator Completes Work</h4>
                  <p className="text-sm">
                    Creator submits deliverables through the platform. Brand has 24-72 hours to review.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Brand Approves Work</h4>
                  <p className="text-sm">
                    Once approved, payment is processed and transferred to Creator within <strong>2-3 working days</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Creator Receives Payout</h4>
                  <p className="text-sm">
                    Funds are credited to Creator&apos;s registered bank account. Additional 1-2 days may apply for bank processing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm italic">
            This system ensures Creators get paid for completed work while Brands receive quality deliverables.
          </p>
        </section>

        {/* Creator Payment Details */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Creator Payment Timeline</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">Standard Processing</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Payment initiation: <strong>2-3 working days</strong> after Brand approval</li>
                <li>Bank credit time: Additional 1-2 days depending on your bank</li>
                <li>Total timeline: <strong>3-5 working days</strong> from approval to bank credit</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">Auto-Approval</h3>
              <p className="text-sm mb-2">
                If Brand doesn&apos;t respond within the review period (24-72 hours):
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Work is automatically approved</li>
                <li>Payment processing begins immediately</li>
                <li>Same 2-3 working day timeline applies</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4">
            <p className="text-sm">
              <strong>Note:</strong> &quot;Working days&quot; exclude weekends and public holidays. 
              Payments initiated on Friday will begin processing on the following Monday.
            </p>
          </div>
        </section>

        {/* Cancellation Policy */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Cancellation Policy</h2>
          
          <h3 className="text-lg font-semibold mb-3">Before Work Begins</h3>
          <div className="mb-6">
            <p className="mb-2">Brands may cancel campaigns:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Before accepting any Creator application:</strong> Cancel anytime with no charge
              </li>
              <li>
                <strong>After accepting a Creator but before Creator starts work:</strong> Contact support 
                immediately. Partial or full refund may be possible minus processing fees.
              </li>
            </ul>
          </div>

          <h3 className="text-lg font-semibold mb-3">After Work Has Started</h3>
          <div className="mb-6">
            <p className="mb-4">
              Once a Creator begins work, cancellation is subject to dispute resolution. 
              Brands must have valid reasons such as:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Creator did not follow campaign brief</li>
              <li>Deliverables do not meet specified requirements</li>
              <li>Creator failed to submit work within agreed timeline</li>
              <li>Content violates platform policies or contains prohibited material</li>
            </ul>
          </div>

          <h3 className="text-lg font-semibold mb-3">Creator-Initiated Cancellation</h3>
          <div>
            <p className="mb-2">Creators may cancel:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Before starting work:</strong> Contact support for penalty-free cancellation. 
                Brand receives full refund.
              </li>
              <li>
                <strong>After starting work:</strong> May result in negative impact on Creator rating 
                and potential account restrictions. Partial payment may be owed depending on work completed.
              </li>
            </ul>
          </div>
        </section>

        {/* Disputes and Refunds */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Disputes and Refunds</h2>
          
          <h3 className="text-lg font-semibold mb-3">If Brand Disputes Deliverables</h3>
          <div className="mb-4">
            <p className="mb-4">
              Brands must raise disputes before approving work. Our mediation process:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Brand submits dispute:</strong> Clearly states issues with deliverables
              </li>
              <li>
                <strong>Creator responds:</strong> Has 48 hours to address concerns or provide clarification
              </li>
              <li>
                <strong>Platform review:</strong> Our team evaluates both sides against campaign requirements
              </li>
              <li>
                <strong>Decision made:</strong> Within 3-5 business days, we determine appropriate action
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-4">
            <h4 className="font-semibold mb-3">Possible Outcomes:</h4>
            <div className="space-y-3">
              <div className="border-l-4 border-green-500 pl-4">
                <h5 className="font-semibold text-sm">Creator revises work</h5>
                <p className="text-sm">
                  Creator makes requested changes. Payment held until Brand approves revisions.
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h5 className="font-semibold text-sm">Partial refund</h5>
                <p className="text-sm">
                  If work is partially completed or meets some requirements. Split determined by platform.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h5 className="font-semibold text-sm">Full refund to Brand</h5>
                <p className="text-sm">
                  If deliverables completely fail to meet requirements or Creator violated terms.
                </p>
              </div>
            </div>
          </div>

          <p className="italic text-sm">
            Platform decisions are final. Users may pursue legal recourse if unsatisfied, 
            but dispute mediation decisions are binding for escrow release.
          </p>
        </section>

        {/* Refund Processing */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Refund Processing Time</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">Standard Refund Timeline</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Refund approval: Within 3-5 business days of dispute resolution</li>
                <li>Processing time: 5-10 business days to original payment method</li>
                <li>Platform fee: Non-refundable portion (payment gateway charges) may apply</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold mb-2">What Gets Refunded</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Full refund:</strong> Creator&apos;s quoted price + Brand&apos;s platform fee</li>
                <li><strong>Partial refund:</strong> Proportional amount based on dispute outcome</li>
                <li><strong>Non-refundable:</strong> Payment gateway processing fees (typically 2-3%)</li>
              </ul>
            </div>
          </div>

          <p className="mt-4 text-sm">
            Actual credit time depends on your bank or card issuer. Contact <strong>support@50brains.com</strong> if 
            refund is delayed beyond 10 business days.
          </p>
        </section>

        {/* Force Majeure */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Force Majeure</h2>
          <p className="mb-4">
            In case of unforeseen circumstances (natural disasters, platform technical failures, 
            government regulations, or other events beyond our control):
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Payments may be delayed beyond stated timelines</li>
            <li>Campaign deadlines may be extended</li>
            <li>Refunds will be processed as soon as circumstances allow</li>
            <li>We will communicate transparently about any delays</li>
          </ul>
        </section>

        {/* Platform Fee Policy */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Platform Fee Refund Policy</h2>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Fee Structure Recap:</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Creator fee (5%):</strong> Deducted from quoted price. Refundable if work not delivered.
              </li>
              <li>
                <strong>Brand fee (5%):</strong> Added to quoted price. Refundable if campaign cancelled before work.
              </li>
              <li>
                <strong>Payment gateway charges:</strong> Non-refundable processing fees (typically 2-3%).
              </li>
            </ul>

            <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded">
              <h4 className="font-semibold mb-2">Refund Example:</h4>
              <div className="text-sm space-y-1">
                <p>Original transaction: Creator quoted ₹10,000</p>
                <p>Brand paid: ₹10,680 (₹10,000 + ₹500 fee + ₹180 GST)</p>
                <hr className="my-2" />
                <p><strong>Full refund scenario:</strong></p>
                <p>Brand receives: ₹10,680 - gateway fees (₹~200-300)</p>
                <p>Final refund: ₹10,380-10,480</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact for Refunds */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us for Refund Inquiries</h2>
          <p className="mb-4">
            For questions about refunds, cancellations, or payment issues:
          </p>
          <ul className="list-none space-y-2">
            <li><strong>Email:</strong> echoliftagency@gmail.com</li>
            <li><strong>Response time:</strong> Within 24-48 hours</li>
            <li><strong>Include:</strong> Transaction ID, campaign details, and nature of inquiry</li>
          </ul>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
            <p className="text-sm">
              <strong>Tip:</strong> Most payment and refund questions can be resolved quickly by providing 
              your transaction reference number and clear description of the issue.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
