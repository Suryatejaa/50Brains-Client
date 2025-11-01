import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy - 50BraIns',
  description:
    'Refund and cancellation policy for 50BraIns marketplace with 7-day approval window and comprehensive dispute resolution process.',
};

export default function RefundPolicyPage() {
  return (
    <div className="font-inter min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-heading mb-4 text-4xl font-semibold tracking-tight">
                Refund & Cancellation Policy
              </h1>
              <p className="text-muted mx-auto max-w-2xl text-lg font-normal">
                Comprehensive refund and cancellation policy designed to protect
                both clients and creators in our marketplace
              </p>
              <div className="mt-4 text-sm font-medium text-gray-500">
                Last updated: November 1, 2025
              </div>
            </div>

            <div className="card-glass p-8">
              <div className="prose prose-lg max-w-none">
                {/* Overview */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    Overview
                  </h2>
                  <p className="mb-4 text-gray-700">
                    50BraIns operates on a secure escrow-based payment system
                    designed to protect both clients and creators. This policy
                    outlines the refund and cancellation procedures in
                    compliance with the Consumer Protection Act, 2019, and
                    Indian digital marketplace regulations.
                  </p>
                  <div className="mb-4 rounded-none border border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-blue-800">
                      Key Principles:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-blue-700">
                      <li>7-day approval window for all completed work</li>
                      <li>Escrow protection for all payments</li>
                      <li>Fair dispute resolution process</li>
                      <li>Transparent communication requirements</li>
                      <li>Protection for both parties' interests</li>
                    </ul>
                  </div>
                </section>

                {/* Payment & Escrow System */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    1. Payment & Escrow System
                  </h2>
                  <p className="mb-4 text-gray-700">
                    All payments on 50BraIns are processed through our secure
                    escrow system to ensure protection for both parties.
                  </p>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-none border border-green-200 bg-green-50 p-4">
                      <h4 className="mb-2 font-semibold text-green-800">
                        How Escrow Works:
                      </h4>
                      <ol className="list-inside list-decimal space-y-1 text-sm text-green-700">
                        <li>Client makes payment for project</li>
                        <li>Funds held securely in escrow account</li>
                        <li>Creator completes and delivers work</li>
                        <li>7-day approval period begins</li>
                        <li>Funds released to creator after approval</li>
                      </ol>
                    </div>
                    <div className="rounded-none border border-purple-200 bg-purple-50 p-4">
                      <h4 className="mb-2 font-semibold text-purple-800">
                        Escrow Protection:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-purple-700">
                        <li>Funds secure until work completion</li>
                        <li>No payment until deliverables received</li>
                        <li>Automatic dispute escalation if needed</li>
                        <li>RBI-compliant payment processing</li>
                        <li>Bank-grade security for all transactions</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 7-Day Approval Window */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    2. 7-Day Approval Window
                  </h2>
                  <p className="mb-4 text-gray-700">
                    After a creator submits completed work, clients have exactly
                    7 calendar days to review, test, and approve or raise
                    concerns.
                  </p>

                  <div className="mb-4 rounded-none border border-amber-200 bg-amber-50 p-4">
                    <h4 className="mb-2 font-semibold text-amber-800">
                      Approval Window Timeline:
                    </h4>
                    <div className="space-y-2 text-sm text-amber-700">
                      <div>
                        <strong>Day 0:</strong> Creator submits final
                        deliverables
                      </div>
                      <div>
                        <strong>Day 1-6:</strong> Client review period - can
                        request revisions or raise issues
                      </div>
                      <div>
                        <strong>Day 7:</strong> Final day - client must approve
                        or formally dispute
                      </div>
                      <div>
                        <strong>Day 8:</strong> Auto-approval if no response -
                        payment released to creator
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-none border border-green-200 bg-green-50 p-4">
                      <h4 className="mb-2 font-semibold text-green-800">
                        Client Actions During Approval:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-green-700">
                        <li>Review all deliverables thoroughly</li>
                        <li>Test functionality if applicable</li>
                        <li>Request minor revisions if needed</li>
                        <li>Approve work if satisfactory</li>
                        <li>Raise formal dispute if major issues</li>
                      </ul>
                    </div>
                    <div className="rounded-none border border-blue-200 bg-blue-50 p-4">
                      <h4 className="mb-2 font-semibold text-blue-800">
                        Creator Responsibilities:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
                        <li>Deliver work as per agreed specifications</li>
                        <li>Provide necessary files and documentation</li>
                        <li>Respond to client queries promptly</li>
                        <li>Make reasonable revisions if requested</li>
                        <li>Maintain professional communication</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Refund Scenarios */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    3. Refund Scenarios
                  </h2>
                  <p className="mb-4 text-gray-700">
                    Refunds are processed based on specific scenarios and stages
                    of project completion. All refunds comply with Indian
                    consumer protection laws.
                  </p>

                  <div className="space-y-4">
                    {/* Full Refund Scenarios */}
                    <div className="rounded-none border border-red-200 bg-red-50 p-4">
                      <h4 className="mb-2 font-semibold text-red-800">
                        100% Refund Scenarios:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                        <li>
                          <strong>Creator Non-Performance:</strong> Creator
                          fails to start work within 48 hours
                        </li>
                        <li>
                          <strong>Project Abandonment:</strong> Creator
                          disappears or stops communication for 72+ hours
                        </li>
                        <li>
                          <strong>Platform Error:</strong> Technical issues
                          prevent project completion
                        </li>
                        <li>
                          <strong>Fraudulent Creator:</strong> Verified fake
                          profiles or misrepresentation
                        </li>
                        <li>
                          <strong>Client Cancellation:</strong> Within 2 hours
                          of payment (before creator acceptance)
                        </li>
                      </ul>
                    </div>

                    {/* Partial Refund Scenarios */}
                    <div className="rounded-none border border-orange-200 bg-orange-50 p-4">
                      <h4 className="mb-2 font-semibold text-orange-800">
                        Partial Refund Scenarios:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-orange-700">
                        <li>
                          <strong>Partial Delivery (50% refund):</strong>{' '}
                          Creator delivers incomplete work
                        </li>
                        <li>
                          <strong>Mutual Cancellation (varies):</strong> Both
                          parties agree to terminate mid-project
                        </li>
                        <li>
                          <strong>Scope Reduction (prorated):</strong> Project
                          requirements reduced by client
                        </li>
                        <li>
                          <strong>Quality Issues (25-75%):</strong> Work
                          significantly below agreed standards
                        </li>
                      </ul>
                    </div>

                    {/* No Refund Scenarios */}
                    <div className="rounded-none border border-gray-200 bg-gray-50 p-4">
                      <h4 className="mb-2 font-semibold text-gray-800">
                        No Refund Scenarios:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                        <li>
                          <strong>Work Completed & Approved:</strong> Client has
                          approved final deliverables
                        </li>
                        <li>
                          <strong>Auto-Approval:</strong> 7-day window expired
                          without response
                        </li>
                        <li>
                          <strong>Client Provided Content:</strong> Issues with
                          client-supplied materials
                        </li>
                        <li>
                          <strong>Change of Mind:</strong> Client no longer
                          needs the service after completion
                        </li>
                        <li>
                          <strong>External Factors:</strong> Third-party
                          dependencies beyond creator control
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Cancellation Policy */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    4. Cancellation Policy
                  </h2>
                  <p className="mb-4 text-gray-700">
                    Both clients and creators can cancel projects under specific
                    conditions. Cancellation terms depend on project stage and
                    reason.
                  </p>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-none border border-red-200 bg-red-50 p-4">
                      <h4 className="mb-2 font-semibold text-red-800">
                        Client Cancellation Rights:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                        <li>
                          <strong>Pre-Acceptance:</strong> Full refund within 2
                          hours
                        </li>
                        <li>
                          <strong>Early Stage:</strong> 90% refund if less than
                          25% work done
                        </li>
                        <li>
                          <strong>Mid-Project:</strong> Partial refund based on
                          completion
                        </li>
                        <li>
                          <strong>Creator Breach:</strong> Full refund if terms
                          violated
                        </li>
                        <li>
                          <strong>Force Majeure:</strong> Case-by-case
                          evaluation
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-none border border-blue-200 bg-blue-50 p-4">
                      <h4 className="mb-2 font-semibold text-blue-800">
                        Creator Cancellation Rights:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
                        <li>
                          <strong>Scope Creep:</strong> Client requests beyond
                          agreed scope
                        </li>
                        <li>
                          <strong>Non-Payment:</strong> Escrow issues or payment
                          failures
                        </li>
                        <li>
                          <strong>Abusive Client:</strong> Harassment or
                          inappropriate behavior
                        </li>
                        <li>
                          <strong>Force Majeure:</strong> Natural disasters,
                          health emergencies
                        </li>
                        <li>
                          <strong>Platform Violation:</strong> Client violates
                          platform terms
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Dispute Resolution */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    5. Dispute Resolution Process
                  </h2>
                  <p className="mb-4 text-gray-700">
                    Our structured dispute resolution process ensures fair
                    outcomes for both parties while maintaining platform
                    integrity.
                  </p>

                  <div className="mb-4 rounded-none border border-indigo-200 bg-indigo-50 p-4">
                    <h4 className="mb-2 font-semibold text-indigo-800">
                      Resolution Timeline:
                    </h4>
                    <div className="space-y-2 text-sm text-indigo-700">
                      <div>
                        <strong>Step 1 (0-24 hours):</strong> Direct
                        communication between parties
                      </div>
                      <div>
                        <strong>Step 2 (24-72 hours):</strong> Platform
                        mediation team intervention
                      </div>
                      <div>
                        <strong>Step 3 (3-7 days):</strong> Formal review and
                        evidence evaluation
                      </div>
                      <div>
                        <strong>Step 4 (7-14 days):</strong> Final decision and
                        fund allocation
                      </div>
                      <div>
                        <strong>Step 5 (14+ days):</strong> Appeal process if
                        either party objects
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-none border border-purple-200 bg-purple-50 p-3">
                      <h5 className="mb-1 text-sm font-semibold text-purple-800">
                        Evidence Required:
                      </h5>
                      <p className="text-xs text-purple-700">
                        Screenshots, communication logs, deliverable files,
                        original project brief, revision requests, and timeline
                        documentation.
                      </p>
                    </div>

                    <div className="rounded-none border border-green-200 bg-green-50 p-3">
                      <h5 className="mb-1 text-sm font-semibold text-green-800">
                        Mediation Process:
                      </h5>
                      <p className="text-xs text-green-700">
                        Neutral platform mediators review evidence, facilitate
                        communication, and propose fair resolutions based on
                        platform policies.
                      </p>
                    </div>

                    <div className="rounded-none border border-orange-200 bg-orange-50 p-3">
                      <h5 className="mb-1 text-sm font-semibold text-orange-800">
                        Final Arbitration:
                      </h5>
                      <p className="text-xs text-orange-700">
                        Senior platform officials make binding decisions when
                        mediation fails, with appeal rights within 7 days of
                        decision.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Platform Fees */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    6. Platform Fees & Refund Processing
                  </h2>
                  <p className="mb-4 text-gray-700">
                    Platform fees and refund processing charges apply as per our
                    transparent fee structure.
                  </p>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-none border border-yellow-200 bg-yellow-50 p-4">
                      <h4 className="mb-2 font-semibold text-yellow-800">
                        Fee Structure:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
                        <li>
                          <strong>Creator Fee:</strong> 5% of project value
                        </li>
                        <li>
                          <strong>Client Fee:</strong> 2% of project value
                        </li>
                        <li>
                          <strong>Payment Gateway:</strong> 2-3% as per provider
                        </li>
                        <li>
                          <strong>GST:</strong> 18% on platform fees
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-none border border-cyan-200 bg-cyan-50 p-4">
                      <h4 className="mb-2 font-semibold text-cyan-800">
                        Refund Processing:
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-cyan-700">
                        <li>
                          <strong>Processing Time:</strong> 5-7 business days
                        </li>
                        <li>
                          <strong>Gateway Charges:</strong> Non-refundable
                        </li>
                        <li>
                          <strong>Platform Fees:</strong> Refunded if platform
                          error
                        </li>
                        <li>
                          <strong>Bank Charges:</strong> User responsibility
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Consumer Rights */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    7. Consumer Rights & Legal Compliance
                  </h2>
                  <p className="mb-4 text-gray-700">
                    As per the Consumer Protection Act, 2019, and digital
                    marketplace regulations, users have specific rights and
                    protections.
                  </p>

                  <div className="mb-4 rounded-none border border-pink-200 bg-pink-50 p-4">
                    <h4 className="mb-2 font-semibold text-pink-800">
                      Your Consumer Rights:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-pink-700">
                      <li>
                        Right to receive services as per agreed specifications
                      </li>
                      <li>Right to seek redressal for deficient services</li>
                      <li>Right to fair and transparent pricing</li>
                      <li>Right to privacy and data protection</li>
                      <li>Right to file complaints with consumer forums</li>
                      <li>Right to compensation for proven damages</li>
                    </ul>
                  </div>

                  <div className="rounded-none border border-teal-200 bg-teal-50 p-4">
                    <h4 className="mb-2 font-semibold text-teal-800">
                      Legal Remedies:
                    </h4>
                    <p className="text-sm text-teal-700">
                      If unsatisfied with platform resolution, users can
                      approach District Consumer Disputes Redressal Commission,
                      State Consumer Disputes Redressal Commission, or National
                      Consumer Disputes Redressal Commission as applicable based
                      on claim value and jurisdiction.
                    </p>
                  </div>
                </section>

                {/* Contact & Grievance */}
                <section className="mb-8">
                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900">
                    Contact & Grievance Redressal
                  </h2>
                  <p className="mb-4 text-gray-700">
                    For refund requests, cancellations, or disputes, contact our
                    dedicated support team:
                  </p>
                  <div className="rounded-none border border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <strong>Refund Support:</strong> refunds@50brains.com
                      </div>
                      <div>
                        <strong>Dispute Resolution:</strong>{' '}
                        disputes@50brains.com
                      </div>
                      <div>
                        <strong>General Support:</strong> support@50brains.com
                      </div>
                      <div>
                        <strong>Grievance Officer:</strong>{' '}
                        grievance@50brains.com
                      </div>
                      <div>
                        <strong>Phone Support:</strong> +91-XXXXX-XXXXX
                        (Mon-Fri, 9 AM - 6 PM)
                      </div>
                      <div>
                        <strong>Response Time:</strong> 24 hours for
                        acknowledgment, 72 hours for resolution
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
                  Terms & Conditions
                </Link>
                <Link href="/privacy" className="btn-secondary">
                  Privacy Policy
                </Link>
                <Link href="/contact" className="btn-ghost">
                  Contact Support
                </Link>
                <Link href="/dashboard" className="btn-primary">
                  Back to Dashboard
                </Link>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                This policy is designed to ensure fair treatment of all platform
                users while maintaining trust and transparency in our
                marketplace ecosystem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
