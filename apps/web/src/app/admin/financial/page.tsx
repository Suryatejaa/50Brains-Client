'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

export default function AdminFinancialPage() {
  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [overviewRes, transactionsRes, revenueRes] = await Promise.all([
        apiClient.get<any>('/api/gig-admin/financial/overview'),
        apiClient.get<any>('/api/gig-admin/financial/transactions?limit=50'),
        apiClient.get<any>('/api/gig-admin/financial/revenue?period=monthly'),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (transactionsRes.success)
        setTransactions((transactionsRes.data as any)?.transactions || []);
      if (revenueRes.success) setRevenue(revenueRes.data);
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (paymentId: string, action: string) => {
    const reason = action !== 'approve' ? prompt('Enter reason:') : '';

    try {
      await apiClient.post(
        `/api/gig-admin/financial/payments/${paymentId}/process`,
        {
          action,
          reason,
        }
      );
      alert('Payment processed successfully');
      loadFinancialData();
    } catch (error) {
      console.error('Failed to process payment:', error);
      alert('Failed to process payment');
    }
  };

  const handleRefund = async () => {
    const gigId = prompt('Enter Gig ID:');
    if (!gigId) return;

    const amount = prompt('Refund amount:');
    if (!amount) return;

    const reason = prompt('Refund reason:');
    if (!reason) return;

    try {
      await apiClient.post('/api/gig-admin/financial/refunds', {
        gigId,
        amount: parseFloat(amount),
        reason,
        refundToInfluencer: confirm(
          'Refund to influencer? (OK = Yes, Cancel = No)'
        ),
      });
      alert('Refund processed successfully');
      loadFinancialData();
    } catch (error) {
      console.error('Failed to process refund:', error);
      alert('Failed to process refund');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-heading text-2xl font-bold">
            Financial Management
          </h1>
          <button onClick={handleRefund} className="btn-secondary">
            Process Refund
          </button>
        </div>

        {/* Financial Overview */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="card-glass p-4">
            <div className="text-muted mb-2 text-sm">Total Revenue</div>
            <div className="text-heading text-2xl font-bold">
              ${overview?.totalRevenue || 0}
            </div>
          </div>
          <div className="card-glass p-4">
            <div className="text-muted mb-2 text-sm">Daily Revenue</div>
            <div className="text-heading text-2xl font-bold">
              ${overview?.dailyRevenue || 0}
            </div>
          </div>
          <div className="card-glass p-4">
            <div className="text-muted mb-2 text-sm">Total Transactions</div>
            <div className="text-heading text-2xl font-bold">
              {overview?.totalTransactions || 0}
            </div>
          </div>
          <div className="card-glass p-4">
            <div className="text-muted mb-2 text-sm">Pending Payments</div>
            <div className="text-heading text-2xl font-bold">
              {overview?.pendingPayments || 0}
            </div>
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="card-glass mb-6 p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            Revenue Trends
          </h2>
          <div className="text-muted text-center">
            {revenue ? (
              <div className="space-y-2">
                <p>Monthly Revenue: ${revenue.monthlyRevenue || 0}</p>
                <p>Growth: {revenue.growthRate || 0}%</p>
              </div>
            ) : (
              'Loading revenue data...'
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-glass p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            Recent Transactions ({transactions.length})
          </h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-muted text-center">No transactions found</div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-body mb-2 font-medium">
                        {transaction.description || 'Transaction'}
                      </h3>
                      <div className="text-muted space-y-1 text-sm">
                        <p>Amount: ${transaction.amount}</p>
                        <p>Type: {transaction.type}</p>
                        <p>Status: {transaction.status}</p>
                        <p>
                          Date:{' '}
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {transaction.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleProcessPayment(transaction.id, 'approve')
                          }
                          className="btn-primary px-3 py-1 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleProcessPayment(transaction.id, 'reject')
                          }
                          className="btn-secondary px-3 py-1 text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
