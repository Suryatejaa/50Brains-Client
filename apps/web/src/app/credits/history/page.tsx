'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface CreditTransaction {
  id: string;
  type: 'EARNED' | 'SPENT' | 'BONUS' | 'REFUND' | 'PENALTY' | 'WITHDRAWAL' | 'DEPOSIT';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
  
  // Related entity info
  relatedEntity?: {
    type: 'GIG' | 'CAMPAIGN' | 'APPLICATION' | 'WITHDRAWAL' | 'SYSTEM';
    id: string;
    title?: string;
    url?: string;
  };
  
  // Transaction metadata
  metadata?: {
    gigId?: string;
    applicationId?: string;
    campaignId?: string;
    withdrawalId?: string;
    bonusReason?: string;
    penaltyReason?: string;
  };
  
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

interface CreditSummary {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalWithdrawn: number;
  pendingAmount: number;
  
  // Monthly breakdown
  monthlyBreakdown: {
    month: string;
    earned: number;
    spent: number;
    withdrawn: number;
  }[];
  
  // Transaction type breakdown
  typeBreakdown: {
    type: string;
    amount: number;
    count: number;
  }[];
}

export default function CreditsHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const userType = getUserTypeForRole(currentRole);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCreditsHistory();
    }
  }, [isAuthenticated, user, typeFilter, timeFilter, currentPage]);

  const loadCreditsHistory = async () => {
    try {
      setIsLoading(true);
      
      const [transactionsResponse, summaryResponse] = await Promise.allSettled([
        apiClient.get(`/api/credits/history?type=${typeFilter}&timeframe=${timeFilter}&page=${currentPage}&limit=20`),
        apiClient.get(`/api/credits/summary?timeframe=${timeFilter}`)
      ]);

      if (transactionsResponse.status === 'fulfilled' && transactionsResponse.value.success) {
        const data = transactionsResponse.value.data as any;
        setTransactions(data.transactions || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }

      if (summaryResponse.status === 'fulfilled' && summaryResponse.value.success) {
        setSummary(summaryResponse.value.data as CreditSummary);
      }
    } catch (error) {
      console.error('Failed to load credits history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    // This would open a withdrawal modal or redirect to withdrawal page
    alert('Withdrawal feature coming soon!');
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'EARNED': return '💰';
      case 'SPENT': return '💳';
      case 'BONUS': return '🎁';
      case 'REFUND': return '↩️';
      case 'PENALTY': return '⚠️';
      case 'WITHDRAWAL': return '🏦';
      case 'DEPOSIT': return '📥';
      default: return '💱';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'EARNED':
      case 'BONUS':
      case 'REFUND':
      case 'DEPOSIT':
        return 'text-green-600';
      case 'SPENT':
      case 'PENALTY':
      case 'WITHDRAWAL':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your credits history.</p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Credits History</h1>
              <p className="text-gray-600">Track your earnings, spending, and credit transactions</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Transactions</option>
                <option value="EARNED">Earnings</option>
                <option value="SPENT">Spending</option>
                <option value="BONUS">Bonuses</option>
                <option value="WITHDRAWAL">Withdrawals</option>
                <option value="DEPOSIT">Deposits</option>
              </select>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <Link href="/dashboard" className="btn-secondary">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="card-glass p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading your credits history...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Credit Summary */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Balance</p>
                      <p className="text-2xl font-bold text-green-600">${summary.currentBalance.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      💰
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleWithdrawal}
                      className="btn-primary w-full text-sm"
                      disabled={summary.currentBalance < 10}
                    >
                      🏦 Withdraw
                    </button>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earned</p>
                      <p className="text-2xl font-bold text-blue-600">${summary.totalEarned.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      📈
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-red-600">${summary.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      💳
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Withdrawn</p>
                      <p className="text-2xl font-bold text-purple-600">${summary.totalWithdrawn.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      🏦
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                      <p className="text-2xl font-bold text-yellow-600">${summary.pendingAmount.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      ⏳
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Breakdown Chart */}
            {summary && summary.monthlyBreakdown.length > 0 && (
              <div className="card-glass p-3">
                <h2 className="text-xl font-semibold mb-4">📊 Monthly Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {summary.monthlyBreakdown.slice(0, 6).map((month, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">{month.month}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-600">Earned:</span>
                          <span className="font-medium">${month.earned.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">Spent:</span>
                          <span className="font-medium">${month.spent.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Withdrawn:</span>
                          <span className="font-medium">${month.withdrawn.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-1 flex justify-between font-semibold">
                          <span>Net:</span>
                          <span className={month.earned - month.spent - month.withdrawn >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ${(month.earned - month.spent - month.withdrawn).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions List */}
            <div className="card-glass p-3">
              <h2 className="text-xl font-semibold mb-6">📝 Transaction History</h2>

              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                            {getTransactionTypeIcon(transaction.type)}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                              <span>Type: {transaction.type}</span>
                              {transaction.relatedEntity && (
                                <span>
                                  Related: {transaction.relatedEntity.type}
                                  {transaction.relatedEntity.title && ` - ${transaction.relatedEntity.title}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-lg font-bold ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.type === 'EARNED' || transaction.type === 'BONUS' || transaction.type === 'REFUND' || transaction.type === 'DEPOSIT' ? '+' : '-'}
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Balance: ${transaction.balance.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      {transaction.metadata && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                            {transaction.metadata.gigId && (
                              <div>
                                <span className="font-medium">Gig ID:</span> {transaction.metadata.gigId}
                              </div>
                            )}
                            {transaction.metadata.applicationId && (
                              <div>
                                <span className="font-medium">Application ID:</span> {transaction.metadata.applicationId}
                              </div>
                            )}
                            {transaction.metadata.campaignId && (
                              <div>
                                <span className="font-medium">Campaign ID:</span> {transaction.metadata.campaignId}
                              </div>
                            )}
                            {transaction.metadata.bonusReason && (
                              <div>
                                <span className="font-medium">Bonus Reason:</span> {transaction.metadata.bonusReason}
                              </div>
                            )}
                            {transaction.metadata.penaltyReason && (
                              <div>
                                <span className="font-medium">Penalty Reason:</span> {transaction.metadata.penaltyReason}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Related Entity Link */}
                      {transaction.relatedEntity && transaction.relatedEntity.url && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <a
                            href={transaction.relatedEntity.url}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Related {transaction.relatedEntity.type.toLowerCase()} →
                          </a>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center space-x-2 mt-8">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50"
                      >
                        ← Previous
                      </button>
                      <span className="px-3 py-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💳</div>
                  <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
                  <p className="text-gray-600 mb-6">
                    {typeFilter === 'all' 
                      ? 'You haven\'t made any credit transactions yet. Start by applying for gigs or creating campaigns!'
                      : `No transactions of type "${typeFilter.toLowerCase()}" found.`}
                  </p>
                  {typeFilter === 'all' ? (
                    <div className="space-x-3">
                      {userType === 'creator' ? (
                        <Link href="/marketplace" className="btn-primary">
                          🔍 Browse Gigs
                        </Link>
                      ) : (
                        <Link href="/create-gig" className="btn-primary">
                          ➕ Create Campaign
                        </Link>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setTypeFilter('all')}
                      className="btn-secondary"
                    >
                      🔄 Show All Transactions
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Transaction Type Breakdown */}
            {summary && summary.typeBreakdown.length > 0 && (
              <div className="card-glass p-3">
                <h2 className="text-xl font-semibold mb-4">📈 Transaction Type Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary.typeBreakdown.map((typeData, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getTransactionTypeIcon(typeData.type)}</span>
                          <span className="font-semibold">{typeData.type}</span>
                        </div>
                        <span className="text-sm text-gray-600">{typeData.count} transactions</span>
                      </div>
                      <div className={`text-xl font-bold ${getTransactionTypeColor(typeData.type)}`}>
                        ${Math.abs(typeData.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userType === 'creator' ? (
                  <>
                    <Link href="/marketplace" className="btn-secondary text-center">
                      🔍 Browse New Gigs
                    </Link>
                    <Link href="/my/applications" className="btn-secondary text-center">
                      📝 View My Applications
                    </Link>
                    <Link href="/analytics" className="btn-secondary text-center">
                      📊 View Analytics
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/create-gig" className="btn-secondary text-center">
                      ➕ Create New Campaign
                    </Link>
                    <Link href="/my-gigs" className="btn-secondary text-center">
                      📢 Manage Campaigns
                    </Link>
                    <Link href="/applications/received" className="btn-secondary text-center">
                      📥 Review Applications
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
