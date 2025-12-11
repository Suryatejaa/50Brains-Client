'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, type APIResponse } from '@/lib/api-client';

// Import cache systems for clearing on logout
import profileCache from '@/frontend-profile/hooks/useProfileCache';
import { reputationCacheInstance } from '@/hooks/useReputationCache';

// Types based on complete API documentation
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  phone?: string;
  location?: string;
  currentRole?: string;
  skills?: string[];
  education?: string[];
  experience?: string[];
  profilePicture?: string;
  role: string; // Updated to match API response
  roles?: UserRole[]; // Keep for backward compatibility
  status:
    | 'PENDING_VERIFICATION'
    | 'ACTIVE'
    | 'INACTIVE'
    | 'SUSPENDED'
    | 'BANNED';
  isEmailVerified: boolean;
  isProfileVerified?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

type UserRole =
  | 'USER'
  | 'INFLUENCER'
  | 'BRAND'
  | 'CREW'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  instagramHandle?: string;
  lastName?: string;
  isAgreedToTermsAndRefundPolicy: boolean;
  roles?: UserRole[]; // Optional for registration
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// OTP-based authentication interfaces
interface VerifyRegistrationOtpRequest {
  email: string;
  otp: string;
}

interface InitiateOtpLoginRequest {
  email: string;
}

interface CompleteOtpLoginRequest {
  email: string;
  otp: string;
}

interface InitiatePasswordChangeRequest {
  currentPassword: string;
}

interface CompletePasswordChangeRequest {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordOtpRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface VerifyEmailOtpRequest {
  otp: string;
}

// API Response Types matching backend patterns
interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  message?: string;
}

interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface ForgotPasswordResponse {
  email: string;
  expiresIn: number;
}

interface ResetPasswordResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

// OTP-based response interfaces
interface OtpResponse {
  success: boolean;
  message: string;
  otpSent: boolean;
}

interface OtpAuthResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

interface OtpVerificationResponse {
  success: boolean;
  message: string;
  user?: User;
}

// Context interface with additional methods
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (
    userData: RegisterRequest
  ) => Promise<{ user: User; message: string; otpSent?: boolean }>;
  logout: () => Promise<void>;
  forgotPassword: (
    data: ForgotPasswordRequest
  ) => Promise<{ message: string; email: string; expiresIn: number }>;
  resetPassword: (
    data: ResetPasswordRequest
  ) => Promise<{ message: string; user: User }>;
  changePassword: (data: ChangePasswordRequest) => Promise<{ message: string }>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ message: string }>;
  resendVerification: () => Promise<{
    message: string;
    email: string;
    expiresIn: number;
  }>;
  deactivateAccount: (password: string) => Promise<boolean>;
  deleteAccount: (password: string) => Promise<boolean>;
  // OTP-based authentication methods
  verifyRegistrationOtp: (
    data: VerifyRegistrationOtpRequest
  ) => Promise<{ message: string; user: User }>;
  initiateOtpLogin: (
    data: InitiateOtpLoginRequest
  ) => Promise<{ message: string; otpSent: boolean }>;
  completeOtpLogin: (data: CompleteOtpLoginRequest) => Promise<void>;
  initiatePasswordChange: (
    data: InitiatePasswordChangeRequest
  ) => Promise<{ message: string; otpSent: boolean }>;
  completePasswordChange: (
    data: CompletePasswordChangeRequest
  ) => Promise<{ message: string }>;
  resetPasswordWithOtp: (
    data: ResetPasswordOtpRequest
  ) => Promise<{ message: string; user?: User; autoLogin: boolean }>;
  sendEmailVerificationOtp: () => Promise<{
    message: string;
    otpSent: boolean;
  }>;
  verifyEmailOtp: (
    data: VerifyEmailOtpRequest
  ) => Promise<{ message: string; user: User }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const authCheckInProgress = useRef(false);

  // Cache key for localStorage
  const CACHE_KEY = '50brains_user_cache';
  const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days - extended for better persistence across refreshes

  // Define all utility functions first using useCallback to prevent re-creation
  const saveUserToCache = useCallback(
    (userData: User) => {
      try {
        const cacheData = {
          user: userData,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        // //console.log('💾 User data cached successfully');
      } catch (error) {
        console.warn('Failed to cache user data:', error);
      }
    },
    [CACHE_KEY]
  );

  const loadUserFromCache = useCallback((): User | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRY;

      if (!isExpired && cacheData.user) {
        // //console.log('📱 User data found in cache');
        return cacheData.user;
      } else if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        // //console.log('🗑️ Expired cache data removed');
      }
    } catch (error) {
      console.warn('Failed to load user from cache:', error);
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  }, [CACHE_KEY, CACHE_EXPIRY]);

  const clearUserCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      // //console.log('🗑️ User cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, [CACHE_KEY]);

  const clearAllCachesOnLogout = useCallback(() => {
    try {
      // //console.log('🗑️ Clearing all caches on logout...');

      // Clear profile cache (clear all profiles)
      if (profileCache && profileCache.clear) {
        profileCache.clear(); // Clear all cache when no key provided
        // //console.log('✅ Profile cache cleared');
      }

      // Clear reputation cache
      if (reputationCacheInstance && reputationCacheInstance.clearAll) {
        reputationCacheInstance.clearAll();
        // //console.log('✅ Reputation cache cleared');
      }

      // Clear data persistence cache (localStorage items starting with '50brains_')
      try {
        const keys = Object.keys(localStorage).filter((key) =>
          key.startsWith('50brains_')
        );
        keys.forEach((key) => localStorage.removeItem(key));
        // //console.log(`✅ Data persistence cache cleared (${keys.length} items)`);
      } catch (error) {
        console.warn('Failed to clear data persistence cache:', error);
      }

      // //console.log('🎉 All caches cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing caches on logout:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkAuthStatus = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (authCheckInProgress.current) {
      //    //console.log('↻ Auth check already in progress, skipping...');
      return;
    }

    // Access current state values directly instead of relying on stale closures
    const currentIsLoading = isLoading;
    const currentIsInitialized = isInitialized;

    if (currentIsLoading && currentIsInitialized) {
      // //console.log('↻ Auth already loading and initialized, skipping...');
      return;
    }

    authCheckInProgress.current = true;

    try {
      // //console.log('↻ Starting auth status check...');

      // First try to load from cache immediately and keep user state stable
      const cachedUser = loadUserFromCache();

      // If cached user data is available, set it immediately and verify with server
      if (cachedUser) {
        // //console.log('📱 Using cached auth data - maintaining authentication');
        // //console.log('👤 Cached user:', {
        //   id: cachedUser.id,
        //   email: cachedUser.email,
        //   displayName: cachedUser.displayName,
        // });
        setUser(cachedUser);
        // Don't set loading to false here - let the finally block handle it
        // //console.log('✅ Auth restored from cache, user is authenticated');

        // For demo mode, don't even try to contact server
        if (cachedUser.id === 'demo-user-id') {
          // //console.log('🎭 Demo mode detected, skipping server verification');
          return;
        }
      } else {
        // Keep loading true until API call completes
        // //console.log('↻ No cached user, checking with server...');
        // Don't set loading here - it should already be true from initialization
      }

      // Then try to verify with server - THIS IS CRITICAL FOR SECURITY
      // We MUST verify that the server actually has valid HttpOnly cookies
      try {
        console.log('🌐 Attempting server verification...');
        const response = await apiClient.get<{ user: User }>(
          '/api/user/profile'
        );
        if (response.success && response.data) {
          console.log(
            '✅ Server verification successful - user is authenticated'
          );
          setUser(response.data.user);
        } else {
          // Server responded but said not authenticated - clear everything
          console.log(
            '❌ Server says not authenticated - clearing all auth state'
          );
          setUser(null);
          clearUserCache();
        }
      } catch (error) {
        console.log('⚠️ Auth status check failed:', error);

        // Check for various error types
        const anyError = error as any;
        const isNetworkError =
          anyError.code === 'ERR_NETWORK' ||
          anyError.message?.includes('Network Error') ||
          anyError.message?.includes('fetch');
        const isCorsError = anyError.message?.includes('CORS');
        const is404Error =
          anyError.statusCode === 404 || anyError.status === 404;
        const isConnectionError =
          anyError.message?.includes('Failed to fetch') ||
          anyError.message?.includes('ECONNREFUSED') ||
          anyError.code === 'ECONNREFUSED';
        const isUnauthorized =
          anyError.statusCode === 401 ||
          anyError.status === 401 ||
          anyError.error === 'UNAUTHORIZED' ||
          anyError.message?.includes('Unauthorized') ||
          anyError.message?.includes('Authentication token is required');
        const isRefreshExpired =
          anyError.error === 'REFRESH_EXPIRED' ||
          anyError.message?.includes('Session expired') ||
          anyError.message?.includes('Refresh token has expired');

        console.log('🔍 Error analysis:', {
          isNetworkError,
          isCorsError,
          is404Error,
          isConnectionError,
          isUnauthorized,
          isRefreshExpired,
          hasCachedUser: !!cachedUser,
          errorCode: anyError.code,
          errorStatus: anyError.status || anyError.statusCode,
          errorMessage: anyError.message,
        });

        // CRITICAL: If server explicitly says unauthorized (401), ALWAYS clear auth
        // This means the HttpOnly cookies are missing or invalid
        if (isUnauthorized || isRefreshExpired) {
          console.log(
            '❌ 401 Unauthorized or refresh expired - clearing ALL auth state'
          );
          setUser(null);
          clearUserCache();

          // Redirect to login if not already on an auth page
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const authPages = [
              '/login',
              '/register',
              '/forgot-password',
              '/login/otp',
            ];

            const publicPages = [
              '/',
              '/landing',
              '/about',
              '/contact',
              '/terms',
              '/privacy',
              '/refund',
              '/shipping',
              '/help',
            ];

            const isOnAuthPage = authPages.some((page) =>
              currentPath.startsWith(page)
            );
            const isOnPublicPage = publicPages.some(
              (page) =>
                currentPath === page || currentPath.startsWith(page + '/')
            );

            // Only redirect if NOT on auth page AND NOT on public page
            if (!isOnAuthPage && !isOnPublicPage) {
              console.log('↗️ Redirecting to login - no valid authentication');
              router.push('/login');
            }
          }
          return;
        }

        // If it's a network/connection issue (backend not reachable), keep cached auth
        if (isNetworkError || isCorsError || is404Error || isConnectionError) {
          console.log(
            '⚠️ Network/connection error detected - keeping cached authentication'
          );
          // Keep the cached user if available
          if (!cachedUser) {
            console.log(
              '⚠️ No backend available and no cached user, staying unauthenticated'
            );
            setUser(null);
          } else {
            console.log('✅ Keeping cached user despite network error');
          }
        } else {
          // For other unexpected errors, clear auth to be safe
          console.log('❌ Unexpected error - clearing auth state to be safe');
          setUser(null);
          clearUserCache();
        }
      }
    } finally {
      // Always set loading to false after API call completes
      //console.log('✅ Auth initialization complete');
      setIsLoading(false);
      authCheckInProgress.current = false;
      //console.log('🏁 Auth verification complete, loading set to false');
    }
  }, [loadUserFromCache, clearUserCache, router]); // Remove isLoading and isInitialized to prevent dependency cycles

  // Load user from cache on mount
  useEffect(() => {
    if (isInitialized) {
      //console.log('↻ Auth already initialized, skipping...');
      return;
    }

    //console.log('↻ AuthProvider initializing...');

    let isMounted = true; // Prevent state updates if component unmounts

    // Don't set loading to false until checkAuthStatus completes
    const initializeAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
        // Even on error, we should stop loading
        if (isMounted) {
          setIsLoading(false);
        }
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false; // Cleanup to prevent memory leaks
    };
  }, []); // Keep empty deps to run only once on mount

  // Global error handler for 401 errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Check if this is an authentication error but NOT a login error
      if (
        (event.error?.message?.includes('Authentication token is required') ||
          event.error?.message?.includes('401') ||
          event.error?.message?.includes('Unauthorized') ||
          event.error?.error === 'REFRESH_EXPIRED') &&
        !event.error?.message?.includes('Invalid credentials') &&
        event.error?.error !== 'Invalid credentials' &&
        event.error?.message !== 'Invalid credentials'
      ) {
        //console.log('🔒 Global auth error detected:', event.error);

        // Don't show these errors to users, just log them
        event.preventDefault();

        // If it's a refresh token expired error, clear auth state gracefully
        if (event.error?.error === 'REFRESH_EXPIRED') {
          //console.log('🔒 Handling expired refresh token globally');
          setUser(null);
          clearUserCache();

          // Redirect to login if not already on an auth page
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const authPages = ['/login', '/register', '/forgot-password'];
            const isOnAuthPage = authPages.some((page) =>
              currentPath.startsWith(page)
            );

            if (!isOnAuthPage) {
              //console.log(
              //   '🔄 Global redirect to login due to expired refresh token'
              // );
              router.push('/login');
            }
          }
        }
      }
    };

    // Add unhandled rejection handler for async errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        (event.reason?.message?.includes('Authentication token is required') ||
          event.reason?.message?.includes('401') ||
          event.reason?.message?.includes('Unauthorized') ||
          event.reason?.error === 'REFRESH_EXPIRED') &&
        !event.reason?.message?.includes('Invalid credentials') &&
        event.reason?.error !== 'Invalid credentials' &&
        event.reason?.message !== 'Invalid credentials'
      ) {
        //console.log('🔒 Global auth promise rejection detected:', event.reason);

        // Don't show these errors to users, just log them
        event.preventDefault();

        // If it's a refresh token expired error, clear auth state gracefully
        if (event.reason?.error === 'REFRESH_EXPIRED') {
          //console.log(
          //   '🔒 Handling expired refresh token globally (promise rejection)'
          // );
          setUser(null);
          clearUserCache();

          // Redirect to login if not already on an auth page
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const authPages = ['/login', '/register', '/forgot-password'];
            const isOnAuthPage = authPages.some((page) =>
              currentPath.startsWith(page)
            );

            if (!isOnAuthPage) {
              //console.log(
              //  '🔄 Global redirect to login due to expired refresh token (promise rejection)'
              //);
              router.push('/login');
            }
          }
        }
      }
    };

    // Add event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, [clearUserCache, router]); // Include dependencies

  // Save user to cache whenever user state changes
  useEffect(() => {
    //console.log(`🔄 [useAuth] User state changed:`, {
    //   hasUser: !!user,
    //   userId: user?.id,
    //   userEmail: user?.email,
    //   isAuthenticated: !!user,
    // });

    if (user) {
      saveUserToCache(user);
    } else {
      clearUserCache();
    }
  }, [user, saveUserToCache, clearUserCache]);

  const login = async (credentials: LoginRequest) => {
    // Prevent login if auth check is in progress
    if (authCheckInProgress.current) {
      //console.log('↻ Auth check in progress, waiting before login...');
      // Wait a bit for the auth check to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
      setError(null);

      const response = await apiClient.post<any>(
        '/api/auth/login',
        credentials
      );
      console.log('🔍 Login response:', response);
      // Handle both nested and flat response structures
      const responseData = response;

      if (responseData.success) {
        // For cookie-based auth, we don't need to store tokens
        // The server will set auth cookies automatically
        console.log('✅ Login successful, setting user data');

        // Check if user is in nested data structure or directly available
        const userData = responseData.data?.user || responseData.data.user;

        if (userData) {
          // Note: Auth cookies are HttpOnly and not accessible via document.cookie
          // They will be automatically sent with API requests by the browser
          setUser(userData);
          // Force save to cache immediately
          saveUserToCache(userData);
          console.log('🏠 Redirecting to dashboard...');
          router.push('/dashboard');
          return;
        } else {
          throw new Error(
            'Login successful but user data not found in response'
          );
        }
      } else {
        // Handle specific login errors based on API documentation
        const errorMessage =
          responseData.message || 'Login failed. Please try again.';
        console.log('❌ Login failed with message:', errorMessage);
        // Map specific error messages to user-friendly messages
        switch (errorMessage) {
          case 'Invalid credentials':
          case 'Invalid email or password':
            throw new Error('Email or password is incorrect.');
          case 'Account not verified':
            throw new Error(
              'Please verify your email address before signing in.'
            );
          case 'Account is suspended':
            throw new Error(
              'Your account has been suspended. Please contact support.'
            );
          case 'Account deactivated':
            throw new Error(
              'Your account has been deactivated. Please contact support to reactivate.'
            );
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      console.log('🔍 Login error details:', error);

      // Extract the actual error message from the error object
      let errorMessage = 'Login failed. Please try again.';

      // Try to get message from various places in the error object
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message && !error.message.includes('Error:')) {
        errorMessage = error.message;
      }

      console.log('📝 Extracted error message:', errorMessage);

      // Handle specific authentication errors first (401 = invalid credentials)
      if (
        error?.statusCode === 401 ||
        error?.status === 401 ||
        error?.response?.status === 401
      ) {
        // Check for suspended/banned messages
        const lowerMessage = errorMessage.toLowerCase();
        if (lowerMessage.includes('suspended')) {
          console.log('❌ Account suspended:', errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        } else if (lowerMessage.includes('banned')) {
          console.log('❌ Account banned:', errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }

        // Otherwise treat as invalid credentials
        const credentialsError =
          error?.error === 'Invalid credentials' ||
          errorMessage?.includes('Invalid credentials') ||
          error?.message === 'Invalid credentials'
            ? 'Email or password is incorrect.'
            : error?.error === 'User not found'
              ? 'No account found with this email address.'
              : errorMessage || 'Invalid email or password.';

        console.log('❌ Authentication failed:', credentialsError);
        setError(credentialsError);
        throw new Error(credentialsError);
      }

      // Handle case where backend is not available
      if (
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('fetch') ||
        error?.code === 'ERR_NETWORK'
      ) {
        //console.log('⚠️ Backend not available, using demo login');
        // For demo purposes when backend is not available
        const demoUser: User = {
          id: 'demo-user-id',
          email: credentials.email,
          firstName: 'Demo',
          lastName: 'User',
          displayName: 'Demo User',
          role: 'INFLUENCER',
          status: 'ACTIVE',
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
        };
        setUser(demoUser);
        saveUserToCache(demoUser);
        //console.log('✅ Demo login successful');
        return;
      }

      // Handle other API errors with proper messaging
      console.log('❌ Login failed with error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<any>(
        '/api/auth/register',
        userData
      );

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (response.success) {
        console.log('✅ Registration successful, user data received');

        // The registration is successful but user needs OTP verification
        // Don't set user yet since they need to verify OTP first
        return {
          user: responseData.data?.user || responseData.user,
          message:
            response.message ||
            'Registration successful! Please check your email to verify your account.',
          otpSent: responseData.otpSent || true,
        };
      } else {
        const errorMessage =
          responseData.message || 'Registration failed. Please try again.';

        // Handle specific registration errors
        switch (errorMessage) {
          case 'Email already exists':
          case 'User already exists':
            throw new Error(
              'An account with this email already exists. Please sign in instead.'
            );
          case 'Username already taken':
            throw new Error(
              'This username is already taken. Please choose a different one.'
            );
          case 'Invalid email format':
            throw new Error('Please enter a valid email address.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage =
        error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<any>(
        '/api/auth/forgot-password',
        data
      );

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success || responseData.otpSent) {
        console.log('✅ Password reset email sent successfully');
        return {
          message:
            responseData.message || 'Password reset email sent successfully',
          email: data.email, // Use the email from request since server may not return it
          expiresIn: responseData.expiresIn || 300, // Default 5 minutes if not provided
        };
      } else {
        const errorMessage =
          responseData.message ||
          'Failed to send reset email. Please try again.';

        switch (errorMessage) {
          case 'User not found':
            throw new Error('No account found with this email address.');
          case 'Rate limit exceeded':
            throw new Error(
              'Too many password reset requests. Please try again later.'
            );
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage =
        error.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<any>(
        '/api/auth/reset-password',
        data
      );

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success) {
        console.log('✅ Password reset successful, setting user data');

        // Check if user is in nested data structure or directly available
        const userData = responseData.data?.user || responseData.user;

        if (userData) {
          setUser(userData);
          saveUserToCache(userData);

          return {
            message: responseData.message || 'Password reset successfully',
            user: userData,
          };
        } else {
          throw new Error(
            'Password reset successful but user data not found in response'
          );
        }
      } else {
        const errorMessage =
          responseData.message || 'Failed to reset password. Please try again.';

        switch (errorMessage) {
          case 'Invalid token':
          case 'Token expired':
            throw new Error(
              'Reset link has expired. Please request a new password reset.'
            );
          case 'Token already used':
            throw new Error(
              'This reset link has already been used. Please request a new password reset.'
            );
          case 'User not found':
            throw new Error(
              'Account not found. Please check your email and try again.'
            );
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage =
        error.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      //console.log('🚪 Logout function called');
      console.trace('🔍 Logout call stack trace');
      setError(null);

      // For cookie-based auth, tell server to clear auth cookies
      await apiClient.post('/api/auth/logout').catch(() => {
        // Ignore logout errors - user is logging out anyway
        //console.log(
        //   '⚠️ Server logout failed, but continuing with local logout'
        // );
      });
    } finally {
      // Always clear local state
      //console.log('🗑️ Clearing local auth state...');
      apiClient.clearAuthTokens();
      clearUserCache(); // Explicitly clear user cache on logout

      // Clear ALL cache systems on logout
      clearAllCachesOnLogout();

      setUser(null);
      //console.log('✅ User state cleared');

      // Only redirect to home if this was triggered by user action (not on auth check failure)
      // And avoid redirecting during initial loading to prevent redirect loops
      if (!isLoading) {
        // Add some logging to track logout redirects
        //console.log('🚪 Logout complete, redirecting to home');
        router.push('/');
      } else {
        //console.log('↻ Silent logout during auth check, not redirecting');
      }
    }
  };

  const refreshToken = async () => {
    try {
      setError(null);

      // Call the refresh endpoint using the AuthService
      const tokenData = await apiClient.auth.refreshToken();

      if (tokenData) {
        // Get updated user data after token refresh
        const profileResponse = await apiClient.get<{ user: User }>(
          '/api/user/profile'
        );

        if (profileResponse.success) {
          setUser(profileResponse.data.user);
          //console.log('✅ Token refreshed successfully and user data updated');
          return;
        }
      }

      throw new Error('Failed to refresh token');
    } catch (error: any) {
      // Token refresh failed, logout user
      console.error('❌ Token refresh failed:', error);

      // Clear all authentication state
      apiClient.clearAuthTokens();
      clearUserCache();
      clearAllCachesOnLogout();
      setUser(null);

      // Don't set error immediately to avoid UI flash during silent auth checks
      // Only set error if this was an explicit user action
      if (!authCheckInProgress.current) {
        setError('Session expired. Please sign in again.');
      }

      // If this is a 401 or token not found error, redirect to login
      if (
        error.statusCode === 401 ||
        error.message?.includes('Invalid or expired')
      ) {
        console.log('🚪 Token expired, redirecting to login');
        router.push('/login');
      }

      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<{
        success?: boolean;
        message?: string;
        error?: string;
      }>('/api/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success || (response as any).success) {
        return {
          message:
            responseData.message ||
            (response as any).message ||
            'Password changed successfully',
        };
      } else {
        const errorMessage =
          responseData.error ||
          responseData.message ||
          (response as any).message ||
          'Failed to change password. Please try again.';

        switch (errorMessage) {
          case 'Current password is required':
          case 'Invalid current password':
            throw new Error('The current password you entered is incorrect.');
          case 'New password must be at least 8 characters long':
          case 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character':
            throw new Error(errorMessage);
          case 'New password is required':
            throw new Error('New password is required.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage =
        error.message || 'Failed to change password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setError(null);

      const response = await apiClient.post<{ user: User }>(
        '/api/auth/verify-email',
        { token }
      );

      if (response.success) {
        // Update user data after email verification
        setUser(response.data.user);
        return { message: 'Email verified successfully' };
      } else {
        const errorMessage =
          response.message || 'Failed to verify email. Please try again.';

        switch (errorMessage) {
          case 'Invalid verification token':
            throw new Error('Email verification token is invalid or expired.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to verify email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resendVerification = async () => {
    try {
      setError(null);

      const response = await apiClient.post<{
        email: string;
        expiresIn: number;
      }>('/api/auth/resend-verification');

      if (response.success) {
        return {
          message: 'Verification email sent successfully',
          email: response.data.email,
          expiresIn: response.data.expiresIn,
        };
      } else {
        const errorMessage =
          response.message ||
          'Failed to send verification email. Please try again.';

        switch (errorMessage) {
          case 'Email already verified':
            throw new Error('This email address is already verified.');
          case 'Rate limit exceeded':
            throw new Error(
              'Too many verification emails sent. Please wait before requesting another.'
            );
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to send verification email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deactivateAccount = async (password: string) => {
    try {
      console.log(
        '🔒 Attempting to deactivate account with password length:',
        password.length
      );
      setError(null);

      const response = await apiClient.post<{
        message: string;
        error?: string;
        success?: boolean;
      }>('/api/auth/deactivate-account', {
        password,
      });

      console.log('📋 Deactivate account response:', response);

      if (response.success) {
        console.log('✅ Account deactivated successfully');
        setUser(null);
        return true;
      } else {
        // Handle API error response structure - check both response.data.error and response.message
        const errorMessage =
          response.data?.error ||
          response.message ||
          'Failed to deactivate account. Please try again.';
        console.log('❌ Deactivate account failed:', errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.log('🔍 Deactivate account error details:', error);
      const errorMessage =
        error.message || 'Failed to deactivate account. Please try again.';
      console.log('❌ Final deactivate error message:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      console.log(
        '🗑️ Attempting to delete account with password length:',
        password.length
      );
      setError(null);

      const response = await apiClient.post<{
        message: string;
        error?: string;
        success?: boolean;
      }>('/api/auth/delete-account', {
        password,
      });
      console.log('🗑️ Delete account response:', response);
      if (response.success) {
        console.log('✅ Account deleted successfully');
        setUser(null);
        return true;
      } else {
        // Handle API error response structure - check both response.data.error and response.message
        const errorMessage =
          response.data?.error ||
          response.message ||
          'Failed to delete account. Please try again.';
        console.log('❌ Delete account error message:', errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.log('🔍 Delete account error details:', error);
      const errorMessage =
        error.message || 'Failed to delete account. Please try again.';
      console.log('❌ Final delete error message:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // OTP-based authentication methods
  const verifyRegistrationOtp = async (data: VerifyRegistrationOtpRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<any>(
        '/api/auth/verify-registration-otp',
        data
      );

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success) {
        console.log(
          '✅ Registration OTP verified successfully, setting user data'
        );

        // Check if user is in nested data structure or directly available
        const userData = responseData.user || responseData.data?.user;

        if (userData) {
          setUser(userData);
          saveUserToCache(userData);

          return {
            message:
              responseData.message || 'Registration verified successfully',
            user: userData,
          };
        } else {
          throw new Error(
            'Registration verified but user data not found in response'
          );
        }
      } else {
        const errorMessage =
          responseData.message || 'Failed to verify registration OTP';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Verify registration OTP error:', error);
      const errorMessage =
        error.message || 'Failed to verify registration OTP. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const initiateOtpLogin = async (data: InitiateOtpLoginRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<OtpResponse>(
        '/api/auth/otp-login/initiate',
        data
      );

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success || responseData.otpSent) {
        return {
          message: responseData.message || 'OTP sent to your email',
          otpSent: responseData.otpSent || true,
        };
      } else {
        const errorMessage =
          responseData.message || 'Failed to initiate OTP login';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Initiate OTP login error:', error);
      const errorMessage =
        error.message || 'Failed to initiate OTP login. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const completeOtpLogin = async (data: CompleteOtpLoginRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<any>(
        '/api/auth/otp-login/complete',
        data
      );

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success) {
        console.log('✅ OTP login successful, setting user data');

        // Check if user is in nested data structure or directly available
        const userData = responseData.data?.user || responseData.user;

        if (userData) {
          setUser(userData);
          saveUserToCache(userData);
        } else {
          throw new Error(
            'OTP login successful but user data not found in response'
          );
        }
      } else {
        const errorMessage =
          responseData.message || 'Failed to complete OTP login';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Complete OTP login error:', error);
      const errorMessage =
        error.message || 'Failed to complete OTP login. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const initiatePasswordChange = async (
    data: InitiatePasswordChangeRequest
  ) => {
    try {
      setError(null);

      const response = await apiClient.post<OtpResponse>(
        '/api/auth/change-password/initiate',
        data
      );

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success || responseData.otpSent) {
        return {
          message: responseData.message || 'OTP sent for password change',
          otpSent: responseData.otpSent || true,
        };
      } else {
        const errorMessage =
          responseData.message || 'Failed to initiate password change';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Initiate password change error:', error);
      const errorMessage =
        error.message ||
        'Failed to initiate password change. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const completePasswordChange = async (
    data: CompletePasswordChangeRequest
  ) => {
    try {
      setError(null);

      const response = await apiClient.post<{
        message: string;
        success?: boolean;
      }>('/api/auth/change-password/complete', data);

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success || responseData.message) {
        console.log('✅ Password change completed successfully');
        return {
          message: responseData.message || 'Password changed successfully',
        };
      } else {
        const errorMessage =
          responseData.message || 'Failed to change password';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Complete password change error:', error);
      const errorMessage =
        error.message || 'Failed to change password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPasswordWithOtp = async (data: ResetPasswordOtpRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<any>(
        '/api/auth/reset-password',
        data
      );

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success) {
        console.log('✅ Password reset with OTP successful');

        // If user data is provided, log them in automatically
        const userData = responseData.data?.user || responseData.user;
        if (userData) {
          setUser(userData);
          saveUserToCache(userData);
          return {
            message: responseData.message || 'Password reset successfully',
            user: userData,
            autoLogin: true,
          };
        } else {
          // Password reset successful, but user needs to login again
          return {
            message:
              responseData.message ||
              'Password reset successfully. Please login with your new password.',
            autoLogin: false,
          };
        }
      } else {
        const errorMessage = responseData.message || 'Failed to reset password';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Reset password with OTP error:', error);
      const errorMessage =
        error.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendEmailVerificationOtp = async () => {
    try {
      setError(null);

      const response = await apiClient.post<OtpResponse>(
        '/api/auth/email-verification/send'
      );

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success || responseData.otpSent) {
        return {
          message:
            responseData.message || 'Verification OTP sent to your email',
          otpSent: responseData.otpSent || true,
        };
      } else {
        const errorMessage =
          responseData.message || 'Failed to send verification OTP';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Send email verification OTP error:', error);
      const errorMessage =
        error.message || 'Failed to send verification OTP. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyEmailOtp = async (data: VerifyEmailOtpRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<any>(
        '/api/auth/email-verification/verify',
        data
      );

      // Handle both nested and flat response structures
      const responseData = response.data || response;

      if (responseData.success) {
        // Check if user is in nested data structure or directly available
        const userData = responseData.data?.user || responseData.user;

        if (userData) {
          console.log('✅ Email OTP verified successfully, updating user data');
          setUser(userData);
          saveUserToCache(userData);
        }

        return {
          message: responseData.message || 'Email verified successfully',
          user: userData || user!,
        };
      } else {
        const errorMessage = responseData.message || 'Failed to verify email';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Verify email OTP error:', error);
      const errorMessage =
        error.message || 'Failed to verify email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    deactivateAccount,
    deleteAccount,
    changePassword,
    refreshToken,
    clearError,
    checkAuthStatus,
    verifyEmail,
    resendVerification,
    // OTP-based authentication methods
    verifyRegistrationOtp,
    initiateOtpLogin,
    completeOtpLogin,
    initiatePasswordChange,
    completePasswordChange,
    resetPasswordWithOtp,
    sendEmailVerificationOtp,
    verifyEmailOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
