'use client';

import { isFeatureEnabled } from '@/utils/feature-flags';
import CreditFeatureDisabled from '@/components/common/CreditFeatureDisabled';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  discount?: number;
  popular?: boolean;
  features: string[];
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'wallet' | 'bank';
  logo: string;
  fees?: string;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 999,
    currency: '₹',
    features: [
      'Profile boosts',
      'Basic gig promotion',
      'Priority support',
      '30-day validity',
    ],
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 500,
    price: 3999,
    currency: '₹',
    discount: 20,
    popular: true,
    features: [
      'Everything in Starter',
      'Advanced gig promotion',
      'Clan contributions',
      'Featured listings',
      '60-day validity',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 1000,
    price: 6999,
    currency: '₹',
    discount: 30,
    features: [
      'Everything in Professional',
      'Premium placement',
      'Analytics insights',
      'Dedicated support',
      '90-day validity',
    ],
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: 'razorpay',
    name: 'Credit/Debit Card',
    type: 'card',
    logo: '💳',
    fees: 'No additional fees',
  },
  {
    id: 'upi',
    name: 'UPI',
    type: 'wallet',
    logo: '📱',
    fees: 'No additional fees',
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    type: 'bank',
    logo: '🏦',
    fees: 'Bank charges may apply',
  },
];

export default function CreditsPurchasePage() {
  // Return disabled component if credits are not enabled
  if (
    !isFeatureEnabled('CREDITS_ENABLED') ||
    !isFeatureEnabled('CREDIT_PURCHASE')
  ) {
    return <CreditFeatureDisabled feature="Credit Purchase" />;
  }

  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    null
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null
  );
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load current credit balance
  useEffect(() => {
    if (user) {
      loadCreditBalance();
    }
  }, [user]);

  const loadCreditBalance = async () => {
    try {
      const response = await apiClient.get('/api/credits/balance');
      if (response.success) {
        setCurrentBalance((response.data as any)?.balance || 0);
      }
    } catch (error) {
      console.error('Failed to load credit balance:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedPayment) {
      setError('Please select a package and payment method');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Create order
      const orderResponse = await apiClient.post('/api/credits/create-order', {
        packageId: selectedPackage.id,
        paymentMethod: selectedPayment.id,
      });

      if (!orderResponse.success) {
        throw new Error(
          (orderResponse as any).error || 'Failed to create order'
        );
      }

      const { orderId, amount, currency } = orderResponse.data as any;

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: '50BraIns',
        description: `${selectedPackage.name} - ${selectedPackage.credits} Credits`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await apiClient.post(
              '/api/credits/verify-payment',
              {
                orderId: orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }
            );

            if (verifyResponse.success) {
              // Redirect to success page
              router.push(`/credits/success?order=${orderId}` as any);
            } else {
              setError('Payment verification failed');
            }
          } catch (error: any) {
            setError(error.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`.trim(),
          email: user?.email,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      // Load Razorpay script and open checkout
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error: any) {
      setError(error.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  const calculateDiscountedPrice = (pkg: CreditPackage) => {
    if (pkg.discount) {
      return pkg.price - (pkg.price * pkg.discount) / 100;
    }
    return pkg.price;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-8 text-center">
          <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-heading mb-2 text-3xl font-bold">
                Purchase Credits
              </h1>
              <p className="text-muted mb-4">
                Boost your profile, promote gigs, and unlock premium features
              </p>

              {/* Current Balance */}
              <div className="card-glass inline-block p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="text-sm text-gray-600">Current Balance</div>
                    <div className="text-brand-primary text-xl font-bold">
                      {currentBalance.toLocaleString()} Credits
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Credit Packages */}
              <div className="lg:col-span-2">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Choose Your Credit Package
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {creditPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`card-glass cursor-pointer p-3 transition-all hover:shadow-lg ${
                        selectedPackage?.id === pkg.id
                          ? 'ring-brand-primary bg-blue-50 ring-2'
                          : ''
                      } ${pkg.popular ? 'ring-2 ring-purple-500' : ''}`}
                    >
                      {pkg.popular && (
                        <div className="mb-2 text-center">
                          <span className="rounded-none bg-purple-500 px-3 py-1 text-xs font-medium text-white">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="mb-4 text-center">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                          {pkg.name}
                        </h3>

                        <div className="mb-2">
                          <span className="text-brand-primary text-3xl font-bold">
                            {pkg.credits.toLocaleString()}
                          </span>
                          <span className="ml-1 text-gray-600">Credits</span>
                        </div>

                        <div className="flex items-center justify-center space-x-2">
                          {pkg.discount && (
                            <span className="text-lg text-gray-500 line-through">
                              {pkg.currency}
                              {pkg.price}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-gray-900">
                            {pkg.currency}
                            {calculateDiscountedPrice(pkg)}
                          </span>
                          {pkg.discount && (
                            <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              -{pkg.discount}%
                            </span>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-2 text-sm text-gray-600">
                        {pkg.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-green-500">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Checkout */}
              <div className="lg:col-span-1">
                <div className="card-glass sticky top-24 p-3">
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    Payment Method
                  </h2>

                  <div className="mb-6 space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method)}
                        className={`cursor-pointer rounded-none border p-4 transition-all ${
                          selectedPayment?.id === method.id
                            ? 'border-brand-primary bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{method.logo}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {method.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {method.fees}
                            </div>
                          </div>
                          <div
                            className={`h-4 w-4 rounded-none border-2 ${
                              selectedPayment?.id === method.id
                                ? 'border-brand-primary bg-brand-primary'
                                : 'border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  {selectedPackage && (
                    <div className="mb-6 border-t pt-6">
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Order Summary
                      </h3>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Package:</span>
                          <span className="font-medium">
                            {selectedPackage.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Credits:</span>
                          <span className="font-medium">
                            {selectedPackage.credits.toLocaleString()}
                          </span>
                        </div>
                        {selectedPackage.discount && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-medium text-green-600">
                              -{selectedPackage.discount}%
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Total:</span>
                          <span className="text-lg font-bold">
                            {selectedPackage.currency}
                            {calculateDiscountedPrice(selectedPackage)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <button
                    onClick={handlePurchase}
                    disabled={
                      !selectedPackage || !selectedPayment || processing
                    }
                    className="btn-primary flex w-full items-center justify-center"
                  >
                    {processing ? (
                      <>
                        <svg
                          className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Purchase Credits'
                    )}
                  </button>

                  {/* Security Notice */}
                  <div className="mt-4 text-center text-xs text-gray-500">
                    <div className="mb-1 flex items-center justify-center space-x-1">
                      <span>🔒</span>
                      <span>Secured by Razorpay</span>
                    </div>
                    <p>Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="card-glass mt-12 p-8">
              <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900">
                What You Can Do With Credits
              </h2>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-none bg-blue-100">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Boost Profile
                  </h3>
                  <p className="text-sm text-gray-600">
                    Increase visibility and get more opportunities
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-none bg-green-100">
                    <span className="text-2xl">📢</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Promote Gigs
                  </h3>
                  <p className="text-sm text-gray-600">
                    Feature your gigs for maximum reach
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-none bg-purple-100">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Clan Support
                  </h3>
                  <p className="text-sm text-gray-600">
                    Contribute to clan growth and success
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-none bg-yellow-100">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Premium Features
                  </h3>
                  <p className="text-sm text-gray-600">
                    Access exclusive tools and analytics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
