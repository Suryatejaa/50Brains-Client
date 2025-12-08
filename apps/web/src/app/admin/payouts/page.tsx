'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useParams, useRouter } from 'next/navigation';

interface Payout {
  id: string;
  gigId?: string;
  gigTitle: string;
  creatorId?: string;
  creatorAmount: number;
  upiId: string;
  receipt: string;
  status: string;
  submittedAt?: string;
  approvedAt?: string;
}
interface Applicant {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  upiId?: string;
  email: string;
  profilePicture?: string;
  primaryPlatform?: string;
  primaryNiche?: string;
  location?: string;
  experienceLevel?: string;
  followers?: number;
  avgEngagement?: number;
}

export default function AdminPayoutsPage() {
  const [pendingPayouts, setPendingPayouts] = useState<Payout[]>([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [applicantProfiles, setApplicantProfiles] = useState<{
    [key: string]: Applicant;
  }>({});
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendingResponse, approvedResponse] = await Promise.all([
        apiClient.get('/api/gig-admin/payouts/pending'),
        apiClient.get('/api/gig-admin/payouts/approved-submissions'),
      ]);

      console.log('Pending Payouts Response:', pendingResponse);
      console.log('Approved Submissions Response:', approvedResponse);

      if (pendingResponse.success) {
        setPendingPayouts((pendingResponse.data as any)?.payments || []);
      }
      if (approvedResponse.success) {
        setApprovedSubmissions(
          (approvedResponse.data as any)?.submissions || []
        );
      }
    } catch (error) {
      console.error('Failed to load payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicantDetailsbyIds = async (applicantIds: string[]) => {
    if (applicantIds.length === 0) return;

    try {
      const response = await apiClient.post(
        '/api/public/profiles/internal/by-ids',
        {
          userIds: applicantIds,
        }
      );
      console.log('Response from applicant details API:', response);
      if (response.success) {
        const profiles = Array.isArray(response.data) ? response.data : [];
        setApplicantProfiles((prev) => ({
          ...prev,
          ...Object.fromEntries(profiles.map((p) => [p.id, p])),
        }));
        console.log('Applicant profiles fetched:', profiles.length);
        console.log('Applicant Profiles Data:', profiles);
      }
    } catch (error) {
      console.error('Error fetching applicant details:', error);
    }
  };

  useEffect(() => {
    if (pendingPayouts.length > 0 || approvedSubmissions.length > 0) {
      const pendingCreatorIds = pendingPayouts
        .map((payout: any) => payout.creatorId)
        .filter(Boolean);
      const approvedCreatorIds = approvedSubmissions
        .map((sub: any) => sub.creatorId)
        .filter(Boolean);
      const allCreatorIds = Array.from(
        new Set([...pendingCreatorIds, ...approvedCreatorIds])
      );

      console.log('Creator IDs to fetch details for:', allCreatorIds);
      if (allCreatorIds.length > 0) {
        fetchApplicantDetailsbyIds(allCreatorIds);
      }
    }
  }, [pendingPayouts, approvedSubmissions]);

  const getApplicantName = (creatorId?: string): string => {
    if (!creatorId || !applicantProfiles[creatorId]) {
      return 'Unknown Creator';
    }
    const profile = applicantProfiles[creatorId];
    return (
      `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
      profile.username ||
      'Unknown Creator'
    );
  };

  const handleProcessDailyPayouts = async () => {
    if (
      !confirm(
        'Process all daily payouts? This will create payment records for all eligible submissions.'
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      const response = await apiClient.post<any>(
        '/api/gig-admin/payouts/process-daily'
      );
      if (response.success) {
        alert(
          `Successfully processed ${(response.data as any)?.processedCount || 0} payouts`
        );
        loadData();
      }
    } catch (error) {
      console.error('Failed to process daily payouts:', error);
      alert('Failed to process payouts');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    const transactionId = prompt('Enter transaction ID:');
    if (!transactionId) return;

    const paymentMethod = prompt(
      'Enter payment method (e.g., Bank Transfer, PayPal):'
    );
    const notes = prompt('Additional notes (optional):');

    try {
      await apiClient.post(`/api/gig-admin/payouts/${paymentId}/mark-paid`, {
        transactionId,
        paymentMethod,
        notes,
        notifyUsers: true,
      });
      alert('Payment marked as paid successfully');
      loadData();
    } catch (error) {
      console.error('Failed to mark payment as paid:', error);
      alert('Failed to mark payment as paid');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-heading text-2xl font-bold">Payout Management</h1>
          <button
            onClick={handleProcessDailyPayouts}
            disabled={processing}
            className="btn-primary"
          >
            {processing ? 'Processing...' : 'Process Daily Payouts'}
          </button>
        </div>

        {/* Pending Payouts */}
        <div className="card-glass mb-6 p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            Pending Payouts ({pendingPayouts.length})
          </h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : pendingPayouts.length === 0 ? (
            <div className="text-muted text-center">No pending payouts</div>
          ) : (
            <div className="space-y-4">
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-body mb-2 font-medium">
                        {payout.gigTitle}
                      </h3>
                      <div className="text-muted space-y-1 text-sm">
                        <p>Creator: <span className='underline hover:cursor-pointer'
                        onClick={() => router.push(`/profile/${payout.creatorId}`)}
                        >{getApplicantName(payout.creatorId)}</span></p>
                        <p>Amount: ₹{payout.creatorAmount}</p>
                        <p>Status: {payout.status}</p>
                        <p>UPI: {payout.upiId}</p>
                        <p>Receipt: {payout.receipt}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkPaid(payout.id)}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Mark as Paid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Submissions Ready for Payout */}
        <div className="card-glass p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            Approved Submissions Ready for Payout ({approvedSubmissions.length})
          </h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : approvedSubmissions.length === 0 ? (
            <div className="text-muted text-center">
              No approved submissions ready for payout
            </div>
          ) : (
            <div className="space-y-4">
              {approvedSubmissions.map((submission: any) => (
                <div
                  key={submission.paymentId}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-body mb-2 font-medium">
                        {submission.gigTitle}
                      </h3>
                      <div className="text-muted space-y-1 text-sm">
                        <p>Creator:  <span className='underline hover:cursor-pointer'
                        onClick={() => router.push(`/profile/${submission.creatorId}`)}
                        >{getApplicantName(submission.creatorId)}</span></p>
                        <p>Amount: ₹{submission.creatorAmount}</p>
                        <p>
                          Approved:{' '}
                          {new Date(submission.approvedAt).toLocaleDateString()}
                        </p>
                        <p>UPI: {submission.upiId}</p>
                        <p>Receipt: {submission.receipt}</p>
                      </div>
                    </div>
                    <span className="rounded bg-green-100 px-3 py-1 text-sm text-green-600">
                      Ready for Payout
                    </span>
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
