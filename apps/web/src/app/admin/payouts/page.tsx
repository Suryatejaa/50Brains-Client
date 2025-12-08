'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useParams, useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

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
  const [paidRecords, setPaidRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [applicantProfiles, setApplicantProfiles] = useState<{
    [key: string]: Applicant;
  }>({});
  const params = useParams();
  const router = useRouter();
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [payoutDialog, setPayoutDialog] = useState<{
    isOpen: boolean;
    paymentId: string;
    paymentData: {
      transactionId: string;
      paymentMethod: string;
      notes: string;
    };
  }>({
    isOpen: false,
    paymentId: '',
    paymentData: {
      transactionId: '',
      paymentMethod: '',
      notes: '',
    },
  });
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [activeSection, setActiveSection] = useState<
    'pending' | 'approved' | 'paid'
  >('pending');

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 1300);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string
  ) => {
    setToast({ type, message });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendingResponse, approvedResponse, paidRecords] =
        await Promise.all([
          apiClient.get('/api/gig-admin/payouts/pending'),
          apiClient.get('/api/gig-admin/payouts/approved-submissions'),
          apiClient.get('/api/gig-admin/financial/paid-records'),
        ]);

      console.log('Pending Payouts Response:', pendingResponse);
      console.log('Approved Submissions Response:', approvedResponse);
      console.log('Paid Records Response:', paidRecords.data);

      if (pendingResponse.success) {
        setPendingPayouts((pendingResponse.data as any)?.payments || []);
      }
      if (approvedResponse.success) {
        setApprovedSubmissions(
          (approvedResponse.data as any)?.submissions || []
        );
      }
      if (paidRecords.success) {
        setPaidRecords((paidRecords as any).data || []);
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
    if (
      pendingPayouts.length > 0 ||
      approvedSubmissions.length > 0 ||
      paidRecords.length > 0
    ) {
      const pendingCreatorIds = pendingPayouts
        .map((payout: any) => payout.creatorId)
        .filter(Boolean);
      const approvedCreatorIds = approvedSubmissions
        .map((sub: any) => sub.creatorId)
        .filter(Boolean);
      const paidUserIds = paidRecords
        .map((paid: any) => paid.paidTo)
        .filter(Boolean);
      const allCreatorIds = Array.from(
        new Set([...pendingCreatorIds, ...approvedCreatorIds, ...paidUserIds])
      );

      console.log('Creator IDs to fetch details for:', allCreatorIds);
      if (allCreatorIds.length > 0) {
        fetchApplicantDetailsbyIds(allCreatorIds);
      }
    }
  }, [pendingPayouts, approvedSubmissions, paidRecords]);

  const getApplicantName = (creatorId?: string): string => {
    if (!creatorId || !applicantProfiles[creatorId]) {
      return 'Unknown Creator';
    }
    const profile = applicantProfiles[creatorId];
    console.log('User Profile: ', profile);
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

  const handleMarkPaid = (paymentId: string) => {
    setPayoutDialog({
      isOpen: true,
      paymentId,
      paymentData: {
        transactionId: '',
        paymentMethod: '',
        notes: '',
      },
    });
  };

  const handleConfirmPayout = async () => {
    const { paymentId, paymentData } = payoutDialog;

    if (!paymentData.transactionId.trim()) {
      showToast('warning', 'Transaction ID is required');
      return;
    }

    if (!paymentData.paymentMethod.trim()) {
      showToast('warning', 'Payment method is required');
      return;
    }

    try {
      setIsSubmittingPayout(true);
      await apiClient.post(`/api/gig-admin/payouts/${paymentId}/mark-paid`, {
        transactionId: paymentData.transactionId,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes,
        notifyUsers: true,
      });
      showToast('success', 'Payment marked as paid successfully');
      setPayoutDialog({
        isOpen: false,
        paymentId: '',
        paymentData: { transactionId: '', paymentMethod: '', notes: '' },
      });
      loadData();
    } catch (error) {
      console.error('Failed to mark payment as paid:', error);
      showToast('error', 'Failed to mark payment as paid');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleCancelPayout = () => {
    setPayoutDialog({
      isOpen: false,
      paymentId: '',
      paymentData: {
        transactionId: '',
        paymentMethod: '',
        notes: '',
      },
    });
  };

  const formatIST = (isoString: string | null | undefined): string => {
    if (!isoString) return 'N/A';

    const date = new Date(isoString);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    // Format the time components specifically for IST
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    };

    // Get the time string (e.g., "15:57:00")
    const timeString = new Intl.DateTimeFormat('en-GB', timeOptions).format(
      date
    );

    // Combine the manually formatted date part and the time part
    return `${day}-${month}-${year}, ${timeString} IST`;
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

        {/* Navigation Menu */}
        <div className="mb-6 flex gap-4 border-b">
          <button
            onClick={() => setActiveSection('pending')}
            className={`px-4 py-3 font-medium transition-all ${
              activeSection === 'pending'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Payouts ({pendingPayouts.length})
          </button>
          <button
            onClick={() => setActiveSection('approved')}
            className={`px-4 py-3 font-medium transition-all ${
              activeSection === 'approved'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approved Submissions ({approvedSubmissions.length})
          </button>
          <button
            onClick={() => setActiveSection('paid')}
            className={`px-4 py-3 font-medium transition-all ${
              activeSection === 'paid'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Paid Records ({paidRecords.length})
          </button>
        </div>

        {/* Pending Payouts Section */}
        {activeSection === 'pending' && (
          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              Pending Payouts
            </h2>
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : pendingPayouts.length === 0 ? (
              <div className="text-muted text-center">No pending payouts</div>
            ) : (
              <div className="space-y-4">
                {pendingPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-body mb-2 font-medium">
                          {payout.gigTitle}
                        </h3>
                        <div className="text-muted space-y-1 text-sm">
                          <p>
                            <b>Creator:</b>{' '}
                            <span
                              className="underline hover:cursor-pointer"
                              onClick={() =>
                                router.push(`/profile/${payout.creatorId}`)
                              }
                            >
                              {getApplicantName(payout.creatorId)}
                            </span>
                          </p>
                          <p><b>Amount:</b> ₹{payout.creatorAmount}</p>
                          <p><b>Status:</b> {payout.status}</p>
                          <p>
                            <b>UPI:</b>{' '}
                            <span
                              onClick={() => {
                                navigator.clipboard.writeText(payout.upiId);
                                //TOAST to indicate copied
                                showToast(
                                  'success',
                                  'UPI ID copied to clipboard!'
                                );
                              }}
                              className="space-x-2 underline hover:cursor-pointer"
                            >
                              {payout.upiId}{' '}
                              <Copy className="inline-block h-4 w-4 pl-1" />
                            </span>
                          </p>
                          <p><b>Receipt:</b> {payout.receipt}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkPaid(payout.id)}
                        className="h-10 w-40 rounded bg-green-200 px-0 text-sm font-semibold text-green-600 hover:bg-blue-700 sm:w-40 sm:px-0 md:w-20 md:px-1 lg:w-20"
                      >
                        Mark as Paid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Approved Submissions Section */}
        {activeSection === 'approved' && (
          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              Approved Submissions Ready for Payout
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
                          <p>
                            <b>Creator:</b>{' '}
                            <span
                              className="underline hover:cursor-pointer"
                              onClick={() =>
                                router.push(`/profile/${submission.creatorId}`)
                              }
                            >
                              {getApplicantName(submission.creatorId)}
                            </span>
                          </p>
                          <p><b>Amount:</b> ₹{submission.creatorAmount}</p>
                          <p>
                            <b>Approved:</b>{' '}
                            {new Date(
                              submission.approvedAt
                            ).toLocaleDateString()}
                          </p>
                          <p>
                            <b>UPI:</b>{' '}
                            <span
                              className="underline hover:cursor-pointer"
                              //copy to clipboard
                              onClick={() => {
                                navigator.clipboard.writeText(submission.upiId);
                                showToast(
                                  'success',
                                  'UPI ID copied to clipboard!'
                                );
                              }}
                            >
                              {submission.upiId}{' '}
                              <Copy className="inline-block h-4 w-4 pl-1" />
                            </span>
                          </p>
                          <p><b>Receipt:</b> {submission.receipt}</p>
                        </div>
                      </div>
                      <span className="rounded bg-green-100 px-1 py-1 text-sm text-green-600">
                        Ready for Payout
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Paid Records Section */}

        {activeSection === 'paid' && (
          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              Paid Records
            </h2>
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : paidRecords.length === 0 ? (
              <div className="text-muted text-center">
                No paid records found
              </div>
            ) : (
              <div className="space-y-4">
                {paidRecords.map((record: any) => (
                  <div
                    key={record.id}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        {/* Assuming gigTitle comes from the flattened record structure */}
                        <h3 className="text-body mb-2 font-medium">
                          {record.gigTitle}
                        </h3>
                        <div className="text-muted space-y-1 text-sm">
                          <p>
                            <b>Creator:</b>{' '}
                            <span
                              className="underline hover:cursor-pointer"
                              onClick={() =>
                                router.push(`/profile/${record.paidTo}`)
                              }
                            >
                              {getApplicantName(record.paidTo)}
                            </span>
                          </p>
                          <p><b>Amount:</b> ₹{record.creatorAmount}</p>
                          <p>
                            <b>Paid On:</b>{' '}
                            {/* Assuming paidAt comes from the flattened record structure */}
                            {formatIST(record.notes.payoutProcessedAt)}
                          </p>
                          <p><b>Transaction ID:</b> {record.notes.transactionId}</p>
                          <p><b>Payment Method:</b> {record.notes.paymentMethod}</p>
                          {/* REMOVED: record.notes is an object and cannot be rendered directly */}
                          {/* {record.notes && <p>Notes: {record.notes}</p>} */}
                        </div>
                      </div>
                      <span className="rounded bg-blue-100 px-1 py-1 text-sm text-blue-600">
                        Paid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed right-4 top-4 z-50 max-w-md">
            <div
              className={`rounded-lg border-l-4 p-4 shadow-lg ${
                toast.type === 'success'
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : toast.type === 'warning'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                    : 'border-red-500 bg-red-50 text-red-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div className="text-lg">
                    {toast.type === 'success'
                      ? '✅'
                      : toast.type === 'warning'
                        ? '⚠️'
                        : '❌'}
                  </div>
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToast(null)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payout Confirmation Dialog */}
        {payoutDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Mark Payment as Paid
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={payoutDialog.paymentData.transactionId}
                    onChange={(e) =>
                      setPayoutDialog({
                        ...payoutDialog,
                        paymentData: {
                          ...payoutDialog.paymentData,
                          transactionId: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., TXN123456789"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Payment Method *
                  </label>
                  <select
                    value={payoutDialog.paymentData.paymentMethod}
                    onChange={(e) =>
                      setPayoutDialog({
                        ...payoutDialog,
                        paymentData: {
                          ...payoutDialog.paymentData,
                          paymentMethod: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select payment method</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    value={payoutDialog.paymentData.notes}
                    onChange={(e) =>
                      setPayoutDialog({
                        ...payoutDialog,
                        paymentData: {
                          ...payoutDialog.paymentData,
                          notes: e.target.value,
                        },
                      })
                    }
                    placeholder="Optional notes about this payment"
                    rows={3}
                    className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleCancelPayout}
                  disabled={isSubmittingPayout}
                  className="flex-1 rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayout}
                  disabled={
                    isSubmittingPayout ||
                    !payoutDialog.paymentData.transactionId.trim() ||
                    !payoutDialog.paymentData.paymentMethod.trim()
                  }
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingPayout ? 'Processing...' : 'Confirm Payout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
