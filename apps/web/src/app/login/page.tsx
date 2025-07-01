'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, clearError, error: authError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      router.push(
        (returnUrl && returnUrl.startsWith('/')
          ? returnUrl
          : '/dashboard') as any
      );
    }
  }, [isAuthenticated, router]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (
      (authError || validationError) &&
      (formData.email || formData.password)
    ) {
      clearError();
      setValidationError('');
    }
  }, [
    formData.email,
    formData.password,
    clearError,
    authError,
    validationError,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationError('');
    clearError();

    // Basic validation
    if (!formData.email || !formData.password) {
      setValidationError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      // Success - redirect will happen via useEffect
    } catch (err: any) {
      // Error is already set in auth context by the login function
      setError(err.message);
      console.error('Login failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  return (
    <div className="page-container pb-bottom-nav-safe min-h-screen pt-16">
      <div className="flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-heading mb-2 text-3xl font-bold">
              Welcome Back
            </h1>
            <p className="text-muted">Sign in to your 50BraIns account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="card-glass space-y-6 p-8">
            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border-error/20 text-error rounded-lg border px-4 py-3 text-sm">
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
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
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
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  name="rememberMe"
                  type="checkbox"
                  className="border-brand-border text-brand-primary focus:ring-brand-primary/20 rounded"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="text-body ml-2 text-sm">Remember me</span>
              </label>
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="btn-primary flex w-full items-center justify-center py-3 disabled:cursor-not-allowed disabled:opacity-50"
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-muted text-sm">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-accent font-medium hover:underline"
              >
                Create one now
              </Link>
            </p>
          </div>

          {/* Help Text */}
          <div className="card-glass mt-6 p-4">
            <p className="text-muted text-center text-sm">
              Having trouble signing in? Make sure you're using the correct
              email and password. If you continue to have issues, please{' '}
              <a
                href="mailto:support@50brains.com"
                className="text-accent hover:underline"
              >
                contact support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
