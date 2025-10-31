'use client';
import React, { useState, useEffect } from 'react';
import { OtpInput } from './OtpInput';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  email: string;
  title: string;
  description: string;
  isLoading?: boolean;
  error?: string | null;
  resendCooldown?: number; // seconds
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  onResend,
  email,
  title,
  description,
  isLoading = false,
  error = null,
  resendCooldown = 60,
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setIsVerifying(false);
      setVerificationError(null); // Clear verification errors when modal opens
      setResendTimer(resendCooldown);
      setCanResend(false);
    }
  }, [isOpen, resendCooldown]);

  // Countdown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    // Clear verification error when user starts typing a new OTP
    if (verificationError) {
      setVerificationError(null);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    try {
      setIsVerifying(true);
      setVerificationError(null); // Clear any previous errors
      await onVerify(otp);
    } catch (error: any) {
      // Extract a useful message from various error shapes (APIError, Axios, plain Error, string)
      const extractedMessage =
        error?.message ||
        error?.error ||
        error?.data?.message ||
        error?.response?.data?.message ||
        (typeof error === 'string' ? error : undefined) ||
        String(error);

      // Display the verification error in the modal
      setVerificationError(
        extractedMessage || 'Verification failed. Please try again.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !onResend) return;

    try {
      await onResend();
      setResendTimer(resendCooldown);
      setCanResend(false);
      setOtp(''); // Clear current OTP
    } catch (error) {
      // Error handled by parent component
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.length === 6 && !isVerifying) {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
          <p className="mt-1 text-sm font-medium text-blue-600">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="mb-3 block text-center text-sm font-medium text-gray-700">
            Enter 6-digit verification code
          </label>
          <OtpInput
            value={otp}
            onChange={handleOtpChange}
            disabled={isVerifying || isLoading}
            autoFocus
            className="mb-4"
          />
        </div>

        {/* Error Message */}
        {(error || verificationError) && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error || verificationError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying || isLoading}
            onKeyDown={handleKeyPress}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend */}
          {onResend && (
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                >
                  Resend verification code
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend code in {resendTimer}s
                </p>
              )}
            </div>
          )}

          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={isVerifying || isLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;
