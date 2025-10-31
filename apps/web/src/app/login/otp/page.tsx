'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { OtpVerificationModal } from '@/components/auth/OtpVerificationModal';
import { BusinessRoadmap } from '@/components/landing/BusinessRoadmap';

export default function OtpLoginPage() {
  const router = useRouter();
  const { initiateOtpLogin, completeOtpLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await initiateOtpLogin({ email });
      setShowOtpModal(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerification = async (otp: string) => {
    try {
      await completeOtpLogin({ email, otp });

      // Check for saved redirect URL
      const savedRedirectUrl = localStorage.getItem('authRedirectUrl');
      if (savedRedirectUrl) {
        localStorage.removeItem('authRedirectUrl');
        router.push(savedRedirectUrl as any);
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(
        error.message || 'OTP verification failed. Please try again.'
      );
    }
  };

  const handleOtpResend = async () => {
    try {
      await initiateOtpLogin({ email });
    } catch (error: any) {
      throw new Error(
        error.message || 'Failed to resend OTP. Please try again.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-none border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-2 bg-white p-1">
      <div className="w-full max-w-md space-y-1">
        <div className="rounded-none border-none border-black/20 bg-white/10 p-1 shadow-none backdrop-blur-lg">
          <div className="text-center">
            <h2 className="mb-2 text-3xl font-bold text-black">
              Sign in with OTP
            </h2>
            <p className="text-black/80">
              Enter your email to receive a verification code
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/20 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-body block text-sm font-medium"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input w-full"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="btn-primary group relative flex w-full justify-center rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Sending OTP...
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-black/60">
              Prefer password login?{' '}
              <Link
                href="/login"
                className="text-accent font-medium hover:underline"
              >
                Sign in with password
              </Link>
            </p>
            <p className="text-black/60">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-accent font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          className="btn-ghost px-1 py-1"
          onClick={() => setShowRoadmap(!showRoadmap)}
        >
          {showRoadmap ? 'Hide Roadmap' : 'Show Roadmap'}
        </button>
      </div>

      {showRoadmap && (
        <div className="w-full space-y-1 rounded-none border-none border-black/20 bg-white p-1 shadow-none backdrop-blur-lg">
          <BusinessRoadmap />
        </div>
      )}

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleOtpVerification}
        onResend={handleOtpResend}
        email={email}
        title="Enter Verification Code"
        description="We've sent a 6-digit verification code to your email address."
        error={error}
      />
    </div>
  );
}
