'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      await forgotPassword({ email: email.toLowerCase().trim() });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="page-container pb-bottom-nav-safe min-h-screen pt-16">
        <div className="flex min-h-screen items-center justify-center py-12">
          <div className="w-full max-w-md">
            <div className="card-glass p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-heading mb-2 text-2xl font-bold">
                Check Your Email
              </h1>
              <p className="text-muted mb-6">
                We've sent a password reset link to{' '}
                <span className="font-medium">{email}</span>
              </p>
              <p className="text-muted mb-6 text-sm">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-accent hover:underline"
                >
                  try again
                </button>
              </p>
              <Link href="/login" className="btn-primary w-full">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-bottom-nav-safe min-h-screen pt-16">
      <div className="flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-heading mb-2 text-3xl font-bold">
              Reset Password
            </h1>
            <p className="text-muted">
              Enter your email address and we'll send you a link to reset your
              password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card-glass space-y-6 p-8">
            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border-error/20 text-error rounded-none border px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
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
                placeholder="creator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex w-full items-center justify-center py-3"
            >
              {isLoading ? (
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="text-accent text-sm hover:underline"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
