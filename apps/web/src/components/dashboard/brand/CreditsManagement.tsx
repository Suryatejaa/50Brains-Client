// components/dashboard/brand/CreditsManagement.tsx
'use client';

import { isFeatureEnabled } from '@/utils/feature-flags';
import CreditFeatureDisabled from '@/components/common/CreditFeatureDisabled';
import React, { useState, useEffect } from 'react';
import { brandApiClient, BrandWallet } from '@/lib/brand-api-client';
import LoadingSpinner from '@/frontend-profile/components/common/LoadingSpinner';

interface CreditTransaction {
  id: string;
  type: 'PURCHASE' | 'SPEND' | 'REFUND' | 'BOOST';
  amount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

interface BoostOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: string;
  benefits: string[];
}

const BOOST_OPTIONS: BoostOption[] = [
  {
    id: 'featured_gig',
    name: 'Featured Gig',
    description: 'Make your gig appear at the top of search results',
    cost: 500,
    duration: '7 days',
    benefits: ['Top position in search', '2x more views', 'Premium badge'],
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get faster response times and dedicated support',
    cost: 1000,
    duration: '30 days',
    benefits: [
      '24/7 priority support',
      'Dedicated account manager',
      'Faster application reviews',
    ],
  },
  {
    id: 'verified_badge',
    name: 'Verified Brand Badge',
    description: 'Display verified status to increase trust',
    cost: 2000,
    duration: '1 year',
    benefits: [
      'Verified badge display',
      'Higher application rate',
      'Trust indicator',
    ],
  },
  {
    id: 'analytics_pro',
    name: 'Advanced Analytics',
    description: 'Access detailed campaign analytics and insights',
    cost: 1500,
    duration: '30 days',
    benefits: [
      'Advanced metrics',
      'Competitor analysis',
      'ROI tracking',
      'Custom reports',
    ],
  },
];

export const CreditsManagement: React.FC = () => {
  // Return disabled component if credits are not enabled
  if (!isFeatureEnabled('CREDITS_ENABLED')) {
    return <CreditFeatureDisabled feature="Credits Management" />;
  }

  const [wallet, setWallet] = useState<BrandWallet | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(1000);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'purchase' | 'boost' | 'history'
  >('overview');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [walletResponse, historyResponse] = await Promise.allSettled([
        brandApiClient.getWallet(),
        brandApiClient.getCreditHistory(),
      ]);

      if (
        walletResponse.status === 'fulfilled' &&
        walletResponse.value.success
      ) {
        setWallet(walletResponse.value.data || null);
      }

      if (
        historyResponse.status === 'fulfilled' &&
        historyResponse.value.success
      ) {
        setTransactions(historyResponse.value.data?.transactions || []);
      }
    } catch (error) {
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCredits = async () => {
    if (purchaseAmount < 100) {
      alert('Minimum purchase amount is ₹100');
      return;
    }

    setPurchasing(true);

    try {
      const response = await brandApiClient.purchaseCredits({
        packageId: 'custom',
        amount: purchaseAmount,
        paymentMethod: 'stripe', // This would be selected by user
      });

      if (response.success) {
        // In a real app, this would redirect to payment gateway
        alert(
          'Credit purchase initiated! You will be redirected to payment gateway.'
        );
        loadWalletData(); // Refresh wallet data
      } else {
        alert(response.error || 'Failed to initiate credit purchase');
      }
    } catch (error) {
      alert('An unexpected error occurred');
    } finally {
      setPurchasing(false);
    }
  };

  const handleBoostPurchase = async (boostOption: BoostOption) => {
    if (!wallet || wallet.balance < boostOption.cost) {
      alert('Insufficient credits. Please purchase more credits first.');
      return;
    }

    if (!confirm(`Purchase ${boostOption.name} for ₹${boostOption.cost}?`)) {
      return;
    }

    try {
      const response = await brandApiClient.purchaseBoost({
        boostType: boostOption.id,
        cost: boostOption.cost,
      });

      if (response.success) {
        alert(`${boostOption.name} activated successfully!`);
        loadWalletData(); // Refresh wallet data
      } else {
        alert(response.error || 'Failed to purchase boost');
      }
    } catch (error) {
      alert('An unexpected error occurred');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return '💳';
      case 'SPEND':
        return '💸';
      case 'REFUND':
        return '💰';
      case 'BOOST':
        return '🚀';
      default:
        return '💼';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'PURCHASE':
      case 'REFUND':
        return 'text-green-600';
      case 'SPEND':
      case 'BOOST':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <div className="rounded-none bg-white p-3 shadow-lg">
        <div className="text-center">
          <span className="mb-4 block text-4xl">⚠️</span>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Unable to Load Wallet
          </h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button onClick={loadWalletData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Credits & Wallet</h2>
        <p className="text-gray-600">
          Manage your credits and boost your campaigns
        </p>
      </div>

      {/* Wallet Overview */}
      <div className="rounded-none bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold">
              {loading ? '...' : `₹${wallet?.balance.toLocaleString() || 0}`}
            </div>
            <div className="text-blue-100">Available Balance</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {loading
                ? '...'
                : `₹${wallet?.totalPurchased.toLocaleString() || 0}`}
            </div>
            <div className="text-blue-100">Total Purchased</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {loading ? '...' : `₹${wallet?.totalSpent.toLocaleString() || 0}`}
            </div>
            <div className="text-blue-100">Total Spent</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'purchase', label: 'Purchase Credits', icon: '💳' },
            { id: 'boost', label: 'Boost Options', icon: '🚀' },
            { id: 'history', label: 'Transaction History', icon: '📋' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-none border bg-white p-3 shadow-sm">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Wallet Overview</h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('purchase')}
                    className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Purchase Credits
                  </button>
                  <button
                    onClick={() => setActiveTab('boost')}
                    className="w-full rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                  >
                    Explore Boosts
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    View History
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Usage Tips</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    • Credits are used for posting gigs and boosting campaigns
                  </li>
                  <li>• Featured gigs get 2x more visibility</li>
                  <li>• Purchase in bulk for better rates</li>
                  <li>• Credits never expire</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Purchase Credits</h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Credit Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                    className="w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setPurchaseAmount(amount)}
                      className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      ₹{amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePurchaseCredits}
                  disabled={purchasing || purchaseAmount < 100}
                  className="flex w-full items-center justify-center space-x-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {purchasing && <LoadingSpinner size="small" />}
                  <span>
                    {purchasing ? 'Processing...' : 'Purchase Credits'}
                  </span>
                </button>
              </div>

              <div className="rounded-none bg-gray-50 p-4">
                <h4 className="mb-3 font-medium text-gray-900">
                  Payment Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Credits:</span>
                    <span>₹{purchaseAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span>
                      ₹{Math.round(purchaseAmount * 0.02).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total:</span>
                    <span>
                      ₹
                      {(
                        purchaseAmount + Math.round(purchaseAmount * 0.02)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'boost' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Boost Your Campaigns</h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {BOOST_OPTIONS.map((boost) => (
                <div
                  key={boost.id}
                  className="rounded-none border p-4 transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h4 className="font-semibold text-gray-900">
                      {boost.name}
                    </h4>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{boost.cost}
                    </span>
                  </div>

                  <p className="mb-3 text-sm text-gray-600">
                    {boost.description}
                  </p>

                  <div className="mb-4">
                    <div className="mb-2 text-sm text-gray-500">
                      Duration: {boost.duration}
                    </div>
                    <div className="space-y-1">
                      {boost.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <span className="mr-2 text-green-500">✓</span>
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleBoostPurchase(boost)}
                    disabled={!wallet || wallet.balance < boost.cost}
                    className="w-full rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {!wallet || wallet.balance < boost.cost
                      ? 'Insufficient Credits'
                      : 'Purchase Boost'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Transaction History</h3>

            {loading ? (
              <div className="py-8 text-center">
                <LoadingSpinner />
                <p className="mt-2 text-gray-600">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center">
                <span className="mb-4 block text-4xl">📋</span>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">
                  No Transactions
                </h4>
                <p className="text-gray-600">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-none border p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getTransactionIcon(transaction.type)}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${getTransactionColor(transaction.type)}`}
                      >
                        {transaction.type === 'PURCHASE' ||
                        transaction.type === 'REFUND'
                          ? '+'
                          : '-'}
                        ₹{transaction.amount.toLocaleString()}
                      </div>
                      <div
                        className={`text-xs ${
                          transaction.status === 'COMPLETED'
                            ? 'text-green-600'
                            : transaction.status === 'PENDING'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
