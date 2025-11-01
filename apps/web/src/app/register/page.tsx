'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { BusinessRoadmap } from '@/components/landing/BusinessRoadmap';
import { OtpVerificationModal } from '@/components/auth/OtpVerificationModal';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    roles: [] as string[],
    instagramHandle: '',
    agreedToTerms: false,
    subscribeToNewsletter: false,
  });
  const [isLoadingInternal, setIsLoadingInternal] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const {
    register,
    verifyRegistrationOtp,
    isAuthenticated,
    isLoading,
    clearError,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Remove the useEffect that was causing the redirect loop
  // RouteGuard will handle redirecting authenticated users away from register page

  // Available roles for client-side registration (excluding admin roles)
  const availableRoles = [
    {
      value: 'INFLUENCER',
      title: 'Content Creator / Influencer',
      description: 'I create content and want to monetize my skills',
      category: 'creator',
    },
    {
      value: 'BRAND',
      title: 'Brand / Business',
      description: 'I represent a brand looking for creators and services',
      category: 'business',
    },
    {
      value: 'CREW',
      title: 'Freelancer / Service Provider',
      description: 'I offer professional services and want to find clients',
      category: 'service',
    },
  ];

  const handleNext = () => {
    // Validate step 1
    if (step === 1) {
      if (!formData.email) {
        setError('Please fill in your email address.');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    // Validate step 2
    if (step === 2) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please fill in both password fields.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      // Password strength validation
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumbers = /\d/.test(formData.password);
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
        setError(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        );
        return;
      }
    }

    setError(''); // Clear any previous errors
    clearError();
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }

    // Final validation for step 3
    if (formData.roles.length === 0) {
      setError('Please select at least one role to continue.');
      return;
    }

    // Validate Instagram handle for CREW and INFLUENCER roles
    const requiresInstagram = formData.roles.some(
      (role) => role === 'CREW' || role === 'INFLUENCER'
    );

    if (requiresInstagram && !formData.instagramHandle.trim()) {
      setError(
        'Instagram handle is required for Content Creators and Freelancers.'
      );
      return;
    }

    if (!formData.agreedToTerms) {
      setError(
        'Please agree to the Terms of Service and Privacy Policy to continue.'
      );
      return;
    }

    setIsLoadingInternal(true);
    setError('');
    clearError();

    try {
      // Format username according to server Joi validation
      const formatUsername = (email: string): string => {
        const baseUsername = email.split('@')[0];
        // Only allow letters, numbers, periods, underscores, and hyphens
        const cleanUsername = baseUsername.replace(/[^a-zA-Z0-9._-]/g, '');
        // Ensure minimum 3 characters, maximum 30 characters
        if (cleanUsername.length < 3) {
          return cleanUsername.padEnd(3, '0'); // Pad with zeros if too short
        }
        return cleanUsername.substring(0, 30); // Truncate if too long
      };

      const result = await register({
        email: String(formData.email || '')
          .toLowerCase()
          .trim(),
        password: formData.password,
        username: formatUsername(formData.email),
        roles: formData.roles as any[],
        instagramHandle: formData.instagramHandle.trim(),
      });

      // Registration initiated - now show OTP verification modal
      console.log('Registration initiated:', result);
      console.log('OTP sent:', result.otpSent);
      console.log('Setting registration email:', formData.email);
      setRegistrationEmail(formData.email);
      setShowOtpModal(true);
      setIsLoadingInternal(false); // Allow user to interact with OTP modal
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoadingInternal(false);
    }
  };

  // Handle OTP verification
  const handleOtpVerification = async (otp: string) => {
    try {
      const result = await verifyRegistrationOtp({
        email: registrationEmail,
        otp,
      });

      console.log('Registration verified successfully:', result.message);
      setShowOtpModal(false);

      // Check for saved redirect URL (similar to login)
      const savedRedirectUrl = localStorage.getItem('authRedirectUrl');
      if (savedRedirectUrl) {
        localStorage.removeItem('authRedirectUrl');
        router.push(savedRedirectUrl as any);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      throw new Error(
        err.message || 'OTP verification failed. Please try again.'
      );
    }
  };

  // Handle OTP resend (re-register)
  const handleOtpResend = async () => {
    try {
      const formatUsername = (email: string): string => {
        const baseUsername = email.split('@')[0];
        const cleanUsername = baseUsername.replace(/[^a-zA-Z0-9._-]/g, '');
        if (cleanUsername.length < 3) {
          return cleanUsername.padEnd(3, '0');
        }
        return cleanUsername.substring(0, 30);
      };

      await register({
        email: String(formData.email || '')
          .toLowerCase()
          .trim(),
        password: formData.password,
        username: formatUsername(formData.email),
        roles: formData.roles as any[],
        instagramHandle: formData.instagramHandle.trim(),
      });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to resend verification code.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    // Remove spaces from password and confirmPassword fields
    let processedValue = value;
    if (name === 'password' || name === 'confirmPassword') {
      processedValue = value.replace(/\s/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue,
    }));

    // Clear errors when user types
    if (error) {
      setError('');
      clearError();
    }
  };

  const handleRoleToggle = (roleValue: string) => {
    setFormData((prev) => {
      let newRoles = [...prev.roles];

      if (roleValue === 'BRAND') {
        // If selecting BRAND, remove all other roles and only keep BRAND
        if (prev.roles.includes('BRAND')) {
          newRoles = newRoles.filter((r) => r !== 'BRAND');
        } else {
          newRoles = ['BRAND']; // Only BRAND, remove all others
        }
      } else {
        // If selecting INFLUENCER or CREW, remove BRAND first
        newRoles = newRoles.filter((r) => r !== 'BRAND');

        // Then toggle the selected role
        if (prev.roles.includes(roleValue)) {
          newRoles = newRoles.filter((r) => r !== roleValue);
        } else {
          newRoles = [...newRoles, roleValue];
        }
      }

      return {
        ...prev,
        roles: newRoles,
      };
    });

    if (error) {
      setError('');
      clearError();
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-1 flex items-center justify-center">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-none text-sm font-semibold transition-all duration-200 ${
              step >= stepNumber
                ? 'bg-brand-primary shadow-soft text-white'
                : 'bg-brand-light-blue text-brand-text-muted border-brand-border border'
            }`}
          >
            {step > stepNumber ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              stepNumber
            )}
          </div>
          {stepNumber < 3 && (
            <div
              className={`mx-3 h-1 w-12 rounded-none transition-all duration-200 ${
                step > stepNumber ? 'bg-brand-primary' : 'bg-brand-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-1">
      <div className="mb-1 text-center">
        <h2 className="text-heading mb-2 text-2xl font-bold">Account Setup</h2>
        <p className="text-muted">Enter your email to get started</p>
      </div>

      <div className="space-y-1">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-body block text-sm font-medium"
          >
            Email Address *
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
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-1">
      <div className="mb-1 text-center">
        <h2 className="text-heading mb-2 text-2xl font-bold">Security</h2>
        <p className="text-muted">Create a strong password</p>
      </div>

      <div className="space-y-1">
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
        <p className="text-muted text-xs">
          Password must be at least 8 characters with uppercase, lowercase, and
          number
        </p>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="confirmPassword"
          className="text-body block text-sm font-medium"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            className="input w-full pr-12"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
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

      {formData.password &&
        formData.confirmPassword &&
        formData.password !== formData.confirmPassword && (
          <p className="text-error text-sm">Passwords do not match</p>
        )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-1">
      <div className="mb-1 text-center">
        <h2 className="text-heading mb-2 text-2xl font-bold">Your Roles</h2>
        <p className="text-muted">
          Select one or more roles that describe you (you can change these
          later)
        </p>
        {formData.roles.length === 0 && step === 3 && (
          <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-700">
              <strong>Required:</strong> Please select at least one role to
              continue.
            </p>
          </div>
        )}
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Brand accounts are separate from individual
            creator accounts. You can be both an Influencer and Freelancer, but
            Brand is exclusive.
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {availableRoles.map((role) => {
          const isSelected = formData.roles.includes(role.value);
          const isDisabled =
            (role.value === 'BRAND' &&
              formData.roles.some((r) => r !== 'BRAND')) ||
            (role.value !== 'BRAND' && formData.roles.includes('BRAND'));

          return (
            <label
              key={role.value}
              className={`block rounded-none border-2 p-4 transition-all duration-200 ${
                isDisabled
                  ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50'
                  : 'cursor-pointer hover:shadow-md'
              } ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary/5 shadow-md'
                  : isDisabled
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-brand-border hover:border-brand-primary/30 hover:bg-brand-light-blue/5 bg-white'
              }`}
              onClick={() => !isDisabled && handleRoleToggle(role.value)}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center">
                  <div
                    className={`h-4 w-4 rounded border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary'
                        : isDisabled
                          ? 'border-gray-300 bg-gray-200'
                          : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-base font-semibold ${
                      isSelected
                        ? 'text-brand-primary'
                        : isDisabled
                          ? 'text-gray-400'
                          : 'text-gray-900'
                    }`}
                  >
                    {role.title}
                    {isDisabled && (
                      <span className="ml-2 text-xs font-normal text-gray-400">
                        (Not compatible with current selection)
                      </span>
                    )}
                  </h3>
                  <p
                    className={`mt-1 text-sm leading-relaxed ${
                      isDisabled ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {role.description}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Instagram Handle Field for CREW and INFLUENCER */}
      {formData.roles.some(
        (role) => role === 'CREW' || role === 'INFLUENCER'
      ) && (
        <div className="mt-4 space-y-2 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <label
            htmlFor="instagramHandle"
            className="text-body block text-sm font-medium"
          >
            Instagram Handle *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              @
            </span>
            <input
              id="instagramHandle"
              name="instagramHandle"
              type="text"
              required
              className="input w-full pl-8"
              placeholder="your_instagram_handle"
              value={formData.instagramHandle}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>
          <p className="text-xs text-gray-600">
            Required for Content Creators and Freelancers to showcase your work
          </p>
        </div>
      )}

      <div className="mt-1 space-y-1 border-t border-gray-200 pt-1">
        <label className="flex items-start space-x-3">
          <input
            name="agreedToTerms"
            type="checkbox"
            required
            className="text-brand-primary focus:ring-brand-primary mt-1 h-4 w-4 rounded border-gray-300 focus:ring-offset-0"
            checked={formData.agreedToTerms}
            onChange={handleChange}
          />
          <span className="text-sm leading-relaxed text-gray-700">
            I agree to the{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary font-medium hover:underline"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary font-medium hover:underline"
            >
              Privacy Policy
            </a>
          </span>
        </label>

        <label className="flex items-start space-x-3">
          <input
            name="subscribeToNewsletter"
            type="checkbox"
            className="text-brand-primary focus:ring-brand-primary mt-1 h-4 w-4 rounded border-gray-300 focus:ring-offset-0"
            checked={formData.subscribeToNewsletter}
            onChange={handleChange}
          />
          <span className="text-sm leading-relaxed text-gray-700">
            I want to receive updates about new features and opportunities
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="page-container pb-bottom-nav-safe min-h-screen pt-0">
      <div className="flex min-h-screen flex-col items-center justify-center space-y-2 py-0">
        <div className="w-full max-w-2xl space-y-1">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-heading mb-2 text-3xl font-bold">
              Join 50BraIns
            </h1>
            <p className="text-muted">Create your account and start earning</p>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Form */}
          <form onSubmit={handleSubmit} className="card-glass p-8">
            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border-error/20 text-error mb-6 rounded-none border px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Step Content */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="mt-1 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="btn-ghost border border-gray-300 px-1 py-1"
                  disabled={isLoadingInternal}
                >
                  Previous
                </button>
              )}

              <div className="ml-auto">
                <button
                  type="submit"
                  disabled={
                    isLoadingInternal ||
                    (step === 3 &&
                      (formData.roles.length === 0 ||
                        !formData.agreedToTerms ||
                        (formData.roles.some(
                          (role) => role === 'CREW' || role === 'INFLUENCER'
                        ) &&
                          !formData.instagramHandle.trim())))
                  }
                  className="btn-primary flex items-center justify-center px-1 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoadingInternal ? (
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
                      Creating Account...
                    </>
                  ) : step === 3 ? (
                    formData.roles.length === 0 ? (
                      'Select a Role to Continue'
                    ) : (
                      'Create Account'
                    )
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-1 text-center">
            <p className="text-muted text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-accent font-medium hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
        {/* toggle to show/hide the roadmap */}
        <div className="flex justify-center">
          <button
            className="btn-ghost px-1 py-1"
            onClick={() => setShowRoadmap(!showRoadmap)}
          >
            {showRoadmap ? 'Hide Roadmap' : 'Show Roadmap'}
          </button>
        </div>
        {showRoadmap && (
          <div className="w-full space-y-1 rounded-3xl border border-black/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
            <BusinessRoadmap />
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleOtpVerification}
        onResend={handleOtpResend}
        email={registrationEmail}
        title="Verify Your Email"
        description="We've sent a 6-digit verification code to your email address. Please enter it below to complete your registration."
        error={error}
      />
    </div>
  );
}
