// frontend/src/components/PaymentButton.tsx
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentButtonProps {
  gigId: string;
  applicationId: string;
  amount: number;
  gigTitle: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PaymentButton({
  gigId,
  applicationId,
  amount,
  gigTitle,
  onSuccess,
  onError
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      console.log('💳 Initiating payment for:', { gigId, amount });

      // Step 1: Create order on backend
      const { data } = await apiClient.post(
        `/api/applications/payments/orders/${gigId}`,
        {
          applicationId,
          amount // in rupees, e.g., 50 for ₹50
        }
      );

      console.log('📝 Order created:', (data as any).data.razorpayOrderId);

      // Step 2: Load Razorpay script
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });

      // Step 3: Configure Razorpay checkout options
      const options = {
        key: (data as any).data.razorpayKeyId, // From backend response
        amount: (data as any).data.amount, // In paise
        currency: 'INR',
        name: '50BraIns',
        description: `Payment for ${gigTitle}`,
        order_id: (data as any).data.razorpayOrderId,
        handler: async (response: any) => {
          try {
            console.log('✅ Payment completed by user');
            console.log('Response:', response);

            // Step 4: Verify payment on backend
            const verifyResponse = await apiClient.post('/api/applications/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            console.log('✅ Payment verified successfully');
            alert('✅ Payment successful! Creator will be notified soon.');
            
            onSuccess?.();
          } catch (error: any) {
            console.error('❌ Payment verification failed:', error);
            const errorMsg = error.response?.data?.error || 'Payment verification failed';
            alert(`❌ ${errorMsg}`);
            onError?.(errorMsg);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: 'Brand Name',
          email: 'brand@example.com'
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            console.log('User closed Razorpay modal');
            setLoading(false);
          }
        }
      };

      // Step 5: Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Payment failed';
      alert(`❌ ${errorMsg}`);
      onError?.(errorMsg);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`
        px-6 py-3 rounded-lg font-medium text-white
        transition-all duration-200
        ${loading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-green-500 hover:bg-green-600 active:scale-95'
        }
      `}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          Processing...
        </span>
      ) : (
        `Pay ₹${amount}`
      )}
    </button>
  );
}
