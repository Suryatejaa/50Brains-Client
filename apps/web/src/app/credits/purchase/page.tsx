'use client';

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
      '30-day validity'
    ]
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
      '60-day validity'
    ]
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
      '90-day validity'
    ]
  }
];

const paymentMethods: PaymentMethod[] = [
  {
    id: 'razorpay',
    name: 'Credit/Debit Card',
    type: 'card',
    logo: '💳',
    fees: 'No additional fees'
  },
  {
    id: 'upi',
    name: 'UPI',
    type: 'wallet',
    logo: '📱',
    fees: 'No additional fees'
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    type: 'bank',
    logo: '🏦',
    fees: 'Bank charges may apply'
  }
];

export default function CreditsPurchasePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
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
        throw new Error((orderResponse as any).error || 'Failed to create order');
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
            const verifyResponse = await apiClient.post('/api/credits/verify-payment', {
              orderId: orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

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
      return pkg.price - (pkg.price * pkg.discount / 100);
    }
    return pkg.price;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              <div className="card-glass p-4 inline-block">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="text-sm text-gray-600">Current Balance</div>
                    <div className="text-xl font-bold text-brand-primary">
                      {currentBalance.toLocaleString()} Credits
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Credit Packages */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Choose Your Credit Package
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {creditPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`card-glass p-6 cursor-pointer transition-all hover:shadow-lg ${
                        selectedPackage?.id === pkg.id
                          ? 'ring-2 ring-brand-primary bg-blue-50'
                          : ''
                      } ${pkg.popular ? 'ring-2 ring-purple-500' : ''}`}
                    >
                      {pkg.popular && (
                        <div className="text-center mb-2">
                          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {pkg.name}
                        </h3>
                        
                        <div className="mb-2">
                          <span className="text-3xl font-bold text-brand-primary">
                            {pkg.credits.toLocaleString()}
                          </span>
                          <span className="text-gray-600 ml-1">Credits</span>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2">
                          {pkg.discount && (
                            <span className="text-lg text-gray-500 line-through">
                              {pkg.currency}{pkg.price}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-gray-900">
                            {pkg.currency}{calculateDiscountedPrice(pkg)}
                          </span>
                          {pkg.discount && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                              -{pkg.discount}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <ul className="space-y-2 text-sm text-gray-600">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
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
                <div className="card-glass p-6 sticky top-24">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Payment Method
                  </h2>
                  
                  <div className="space-y-3 mb-6">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
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
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedPayment?.id === method.id
                              ? 'border-brand-primary bg-brand-primary'
                              : 'border-gray-300'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  {selectedPackage && (
                    <div className="border-t pt-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Order Summary
                      </h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Package:</span>
                          <span className="font-medium">{selectedPackage.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Credits:</span>
                          <span className="font-medium">{selectedPackage.credits.toLocaleString()}</span>
                        </div>
                        {selectedPackage.discount && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-medium text-green-600">
                              -{selectedPackage.discount}%
                            </span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-lg">
                            {selectedPackage.currency}{calculateDiscountedPrice(selectedPackage)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <button
                    onClick={handlePurchase}
                    disabled={!selectedPackage || !selectedPayment || processing}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Purchase Credits'
                    )}
                  </button>

                  {/* Security Notice */}
                  <div className="mt-4 text-xs text-gray-500 text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <span>🔒</span>
                      <span>Secured by Razorpay</span>
                    </div>
                    <p>Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 card-glass p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                What You Can Do With Credits
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Boost Profile</h3>
                  <p className="text-sm text-gray-600">Increase visibility and get more opportunities</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📢</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Promote Gigs</h3>
                  <p className="text-sm text-gray-600">Feature your gigs for maximum reach</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Clan Support</h3>
                  <p className="text-sm text-gray-600">Contribute to clan growth and success</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Premium Features</h3>
                  <p className="text-sm text-gray-600">Access exclusive tools and analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
