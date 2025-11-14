// frontend/src/app/applications/[id]/page.tsx
'use client';

import PaymentButton from '@/components/PaymentButton';
import { useState } from 'react';

export default function ApplicationPage(props: any) {
  const { params } = props;
  const [paymentDone, setPaymentDone] = useState(false);

  // Assume you fetched application data
  const application = {
    id: params.id,
    gig: {
      id: 'gig-123',
      title: 'Instagram Reel 30s',
      amount: 5000, // ₹50.00
    },
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-3xl font-bold">{application.gig.title}</h1>

      {paymentDone ? (
        <div className="rounded-lg border border-green-300 bg-green-100 p-4">
          <p className="text-green-800">
            ✅ Payment completed! Creator has been notified.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Ready to pay the creator?
          </h2>

          <div className="mb-6">
            <p className="text-lg text-gray-700">
              Amount:{' '}
              <span className="text-2xl font-bold">
                ₹{application.gig.amount / 100}
              </span>
            </p>
          </div>

          <PaymentButton
            gigId={application.gig.id}
            applicationId={application.id}
            amount={application.gig.amount / 100} // Convert paise to rupees
            gigTitle={application.gig.title}
            onSuccess={() => {
              setPaymentDone(true);
              // Optionally: Refresh data from server
            }}
            onError={(error) => {
              console.error('Payment failed:', error);
            }}
          />
        </div>
      )}
    </div>
  );
}
