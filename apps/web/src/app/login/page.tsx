'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { BusinessRoadmap } from '@/components/landing/BusinessRoadmap';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<
    'default' | 'suspended' | 'banned'
  >('default');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check for success message from URL parameters
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      // Clear the URL parameter after displaying the message
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  // Remove the useEffect that was causing the redirect loop
  // RouteGuard will handle redirecting authenticated users away from login page

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setErrorType('default');
    setSuccessMessage(''); // Clear success message when attempting login

    try {
      await login(formData);
      // The login function will handle the redirect to dashboard
      console.log('Login successful - redirect handled by useAuth');
    } catch (error: any) {
      // Extract error message from different error structures
      let errorMessage = 'Login failed. Please try again.';

      console.log('Login error:', error);

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.data?.message) {
        // Direct response data
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      const lowerMessage = errorMessage.toLowerCase();

      // Check for suspension/ban messages
      if (lowerMessage.includes('suspended')) {
        setErrorType('suspended');
        setError(
          'Your account has been suspended. Please contact support@50brains.com for assistance.'
        );
      } else if (lowerMessage.includes('banned')) {
        setErrorType('banned');
        setError(
          'Your account has been banned. Please contact support@50brains.com for assistance.'
        );
      } else {
        setErrorType('default');
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
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
            <h2 className="mb-2 text-3xl font-bold text-black">Welcome Back</h2>
            <p className="text-black/80">Sign in to your account</p>
          </div>

          {successMessage && (
            <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/20 p-4 text-sm text-green-800">
              {successMessage}
            </div>
          )}

          {error && (
            <div
              className={`mt-6 rounded-xl border p-4 text-sm ${
                errorType === 'suspended' || errorType === 'banned'
                  ? 'border-orange-500/30 bg-orange-500/20 text-orange-800'
                  : 'border-red-500/30 bg-red-500/20 text-red-800'
              }`}
            >
              {error}
              {(errorType === 'suspended' || errorType === 'banned') && (
                <div className="mt-3 text-xs">
                  <p className="font-semibold">Need help?</p>
                  <p className="mt-1">
                    Email:{' '}
                    <a
                      href="mailto:support@50brains.com"
                      className="underline hover:no-underline"
                    >
                      support@50brains.com
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-body block text-sm font-medium"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input w-full"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-body block text-sm font-medium"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input w-full pr-12"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="password"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="text-accent h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="text-accent ml-2 block text-sm"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/reset-password"
                  className="text-accent font-medium transition-colors duration-200 hover:text-blue-100"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary group relative flex w-full justify-center rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-black/60">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-accent font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
            <p className="mt-2 hidden text-black/60">
              Prefer OTP login?{' '}
              <Link
                href="/login/otp"
                className="text-accent font-medium hover:underline"
              >
                Sign in with OTP
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
    </div>
  );
}
