'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { OtpVerificationModal } from '@/components/auth/OtpVerificationModal';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { forgotPassword, resetPasswordWithOtp } = useAuth();
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await forgotPassword({ email });
      setStep('otp');
      setShowOtpModal(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (otpCode: string) => {
    setOtp(otpCode);
    setShowOtpModal(false);
    setStep('password');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(passwords.newPassword);
    const hasLowerCase = /[a-z]/.test(passwords.newPassword);
    const hasNumbers = /\d/.test(passwords.newPassword);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(
      passwords.newPassword
    );

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
      setError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await resetPasswordWithOtp({
        email,
        otp,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });

      // Check if auto-login occurred or if user needs to login manually
      if (result.autoLogin) {
        // User was automatically logged in, redirect to dashboard
        router.push('/dashboard');
      } else {
        // Password reset successful, but user needs to login, redirect to login page
        router.push(
          ('/login?message=' +
            encodeURIComponent(
              'Password reset successful! Please login with your new password.'
            )) as any
        );
      }
    } catch (error: any) {
      setError(error.message || 'Password reset failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpResend = async () => {
    try {
      await forgotPassword({ email });
    } catch (error: any) {
      throw new Error(
        error.message || 'Failed to resend reset code. Please try again.'
      );
    }
  };

  const handlePasswordChange = (
    field: 'newPassword' | 'confirmPassword',
    value: string
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'email'
              ? "Enter your email address and we'll send you a verification code"
              : step === 'otp'
                ? 'Enter the verification code sent to your email'
                : 'Enter your new password'}
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Sending code...
                  </div>
                ) : (
                  'Send reset code'
                )}
              </button>
            </div>
          </form>
        ) : step === 'password' ? (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="••••••••"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      handlePasswordChange('newPassword', e.target.value)
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="••••••••"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange('confirmPassword', e.target.value)
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {passwords.newPassword &&
              passwords.confirmPassword &&
              passwords.newPassword !== passwords.confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}

            <p className="text-xs text-gray-500">
              Password must be at least 8 characters with uppercase, lowercase,
              number, and special character
            </p>

            <div>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !passwords.newPassword ||
                  !passwords.confirmPassword ||
                  passwords.newPassword !== passwords.confirmPassword
                }
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Resetting password...
                  </div>
                ) : (
                  'Reset password'
                )}
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Back to sign in
          </Link>
        </div>

        {/* OTP Verification Modal */}
        <OtpVerificationModal
          isOpen={showOtpModal}
          onClose={() => {
            setShowOtpModal(false);
            setStep('email');
          }}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          email={email}
          title="Reset Your Password"
          description="Enter the verification code sent to your email."
          error={error}
        />
      </div>
    </div>
  );
}
