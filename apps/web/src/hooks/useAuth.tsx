'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  firstName: string;
  lastName?: string;
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

// Context interface with additional methods
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (
    userData: RegisterRequest
  ) => Promise<{ user: User; message: string }>;
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

  // Cache key for localStorage
  const CACHE_KEY = '50brains_user_cache';
  const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days - extended for better persistence across refreshes

  // Load user from cache on mount
  useEffect(() => {
    if (isInitialized) {
      console.log('🔄 Auth already initialized, skipping...');
      return;
    }

    console.log('🔄 AuthProvider initializing...');

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
  }, []); // Empty dependency array to ensure this only runs once

  // Save user to cache whenever user state changes
  useEffect(() => {
    if (user) {
      saveUserToCache(user);
    } else {
      clearUserCache();
    }
  }, [user]);

  const saveUserToCache = (userData: User) => {
    try {
      const cacheData = {
        user: userData,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 User data cached successfully');
    } catch (error) {
      console.warn('Failed to cache user data:', error);
    }
  };

  const loadUserFromCache = (): User | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRY;

      if (!isExpired && cacheData.user) {
        console.log('📱 User data found in cache');
        return cacheData.user;
      } else if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        console.log('🗑️ Expired cache data removed');
      }
    } catch (error) {
      console.warn('Failed to load user from cache:', error);
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  };

  const clearUserCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
      console.log('🗑️ User cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  };

  const clearAllCachesOnLogout = () => {
    try {
      console.log('🗑️ Clearing all caches on logout...');

      // Clear profile cache (clear all profiles)
      if (profileCache && profileCache.clear) {
        profileCache.clear(); // Clear all cache when no key provided
        console.log('✅ Profile cache cleared');
      }

      // Clear reputation cache
      if (reputationCacheInstance && reputationCacheInstance.clearAll) {
        reputationCacheInstance.clearAll();
        console.log('✅ Reputation cache cleared');
      }

      // Clear data persistence cache (localStorage items starting with '50brains_')
      try {
        const keys = Object.keys(localStorage).filter((key) =>
          key.startsWith('50brains_')
        );
        keys.forEach((key) => localStorage.removeItem(key));
        console.log(`✅ Data persistence cache cleared (${keys.length} items)`);
      } catch (error) {
        console.warn('Failed to clear data persistence cache:', error);
      }

      console.log('🎉 All caches cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing caches on logout:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const checkAuthStatus = async () => {
    // Prevent multiple simultaneous auth checks
    if (isLoading && isInitialized) {
      console.log('🔄 Auth check already in progress, skipping...');
      return;
    }

    try {
      console.log('🔄 Starting auth status check...');

      // First try to load from cache immediately and keep user state stable
      const cachedUser = loadUserFromCache();

      // If cached user data is available, set it immediately and keep auth stable
      if (cachedUser) {
        console.log('📱 Using cached auth data - maintaining authentication');
        console.log('👤 Cached user:', { 
          id: cachedUser.id, 
          email: cachedUser.email, 
          displayName: cachedUser.displayName 
        });
        setUser(cachedUser);
        // Set loading to false immediately when using cache to prevent redirects
        setIsLoading(false);
        console.log('✅ Auth restored from cache, user is authenticated');
        
        // For demo mode, don't even try to contact server
        if (cachedUser.id === 'demo-user-id') {
          console.log('🎭 Demo mode detected, skipping server verification');
          return;
        }
      } else {
        // Keep loading true until API call completes
        console.log('🔄 No cached user, checking with server...');
        setIsLoading(true);
      }

      // Then try to verify with server in background (only if we have a backend)
      try {
        console.log('🌐 Attempting server verification...');
        const response = await apiClient.get<{ user: User }>(
          '/api/user/profile'
        );
        if (response.success && response.data) {
          console.log('✅ Server verification successful');
          setUser(response.data.user);
          console.log('✅ Auth status verified with server');
        } else if (!cachedUser) {
          // Only logout if there's no cached user data AND it's not a 404/network error
          console.log('❌ Auth check failed, no cached user data');
          setUser(null);
        }
      } catch (error) {
        console.log('⚠️ Auth status check failed:', error);

        // Check for various error types that shouldn't cause logout
        const anyError = error as any;
        const isNetworkError =
          anyError.code === 'ERR_NETWORK' ||
          anyError.message?.includes('Network Error') ||
          anyError.message?.includes('fetch');
        const isCorsError = anyError.message?.includes('CORS');
        const is404Error = anyError.statusCode === 404 || anyError.status === 404;
        const isConnectionError = anyError.message?.includes('Failed to fetch') ||
          anyError.message?.includes('ECONNREFUSED') ||
          anyError.code === 'ECONNREFUSED';

        console.log('🔍 Error analysis:', {
          isNetworkError,
          isCorsError,
          is404Error,
          isConnectionError,
          hasCachedUser: !!cachedUser,
          errorCode: anyError.code,
          errorStatus: anyError.status || anyError.statusCode,
          errorMessage: anyError.message
        });

        // If it's any kind of network/connection issue, keep cached auth
        if (isNetworkError || isCorsError || is404Error || isConnectionError) {
          console.log(
            '⚠️ Network/connection error detected - keeping cached authentication'
          );
          // Keep the cached user if available, otherwise set a default "offline" user
          if (!cachedUser) {
            // Don't logout on network errors - instead keep no user but don't set loading
            console.log('⚠️ No backend available, staying unauthenticated');
            setUser(null);
          } else {
            console.log('✅ Keeping cached user despite network error');
          }
        } else if (anyError.statusCode === 401) {
          // Only logout on explicit 401 Unauthorized
          console.log('❌ 401 Unauthorized - clearing auth state');
          setUser(null);
          clearUserCache();
        } else if (!cachedUser) {
          // For other errors, only clear if no cached data
          console.log('❌ Other error with no cached user data, clearing auth state');
          setUser(null);
        } else {
          console.log('⚠️ Server error but keeping cached user data');
          // Keep the cached user for other errors
        }
      }
    } finally {
      // Always set loading to false after API call completes
      console.log('✅ Auth initialization complete');
      setIsLoading(false);
      console.log('🏁 Auth verification complete, loading set to false');
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<{ user: User; message?: string }>(
        '/api/auth/login',
        credentials
      );

      if (response.success) {
        // For cookie-based auth, we don't need to store tokens
        // The server will set auth cookies automatically
        console.log('✅ Login successful, setting user data');
        setUser(response.data.user);
        // Force save to cache immediately
        saveUserToCache(response.data.user);
        return;
      } else {
        // Handle specific login errors based on API documentation
        const errorMessage =
          response.message || 'Login failed. Please try again.';

        // Map specific error messages to user-friendly messages
        switch (errorMessage) {
          case 'Invalid credentials':
            throw new Error('Email or password is incorrect.');
          case 'Account suspended':
            throw new Error(
              'Your account has been suspended. Contact support.'
            );
          case 'Account locked':
            const lockMessage = response.details?.remainingTime
              ? `Account locked for ${Math.ceil(response.details.remainingTime / 60)} minutes.`
              : 'Account is temporarily locked due to too many failed attempts.';
            throw new Error(lockMessage);
          case 'Validation failed':
            throw new Error('Please check your email and password format.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      // Handle case where backend is not available
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('fetch') ||
          error.code === 'ERR_NETWORK') {
        console.log('⚠️ Backend not available, using demo login');
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
        console.log('✅ Demo login successful');
        return;
      }

      const errorMessage =
        error.message ||
        'Unable to sign in. Please check your connection and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<{ user: User; message?: string }>(
        '/api/auth/register',
        userData
      );

      if (response.success) {
        // For cookie-based auth, auto-login after successful registration
        // The server will set auth cookies automatically
        setUser(response.data.user);

        return {
          user: response.data.user,
          message: 'User registered successfully. Please verify your email.',
        };
      } else {
        // Handle specific registration errors
        const errorMessage =
          response.message || 'Registration failed. Please try again.';

        switch (errorMessage) {
          case 'Email already registered':
            throw new Error(
              'An account with this email already exists. Please sign in instead.'
            );
          case 'Validation failed':
            // Handle validation details if available
            if (response.details) {
              const validationErrors = Object.values(response.details).join(
                ', '
              );
              throw new Error(`Please check your input: ${validationErrors}`);
            }
            throw new Error('Please check your input and try again.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<ForgotPasswordResponse>(
        '/api/auth/forgot-password',
        data
      );

      if (response.success) {
        return {
          message: 'Password reset email sent successfully',
          email: response.data.email,
          expiresIn: response.data.expiresIn,
        };
      } else {
        const errorMessage =
          response.message || 'Failed to send reset email. Please try again.';

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
      const errorMessage =
        error.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<ResetPasswordResponse>(
        '/api/auth/reset-password',
        data
      );

      if (response.success) {
        // Auto-login after successful password reset
        if (response.data.accessToken && response.data.refreshToken) {
          apiClient.setAuthTokens(
            response.data.accessToken,
            response.data.refreshToken
          );
          setUser(response.data.user);
        }

        return {
          message: 'Password reset successfully',
          user: response.data.user,
        };
      } else {
        const errorMessage =
          response.message || 'Failed to reset password. Please try again.';

        switch (errorMessage) {
          case 'Invalid reset token':
            throw new Error(
              'Reset link is invalid or has expired. Please request a new one.'
            );
          case 'Token expired':
            throw new Error(
              'Reset link has expired. Please request a new one.'
            );
          case 'Validation failed':
            if (response.details?.password) {
              throw new Error(response.details.password);
            }
            throw new Error('Password does not meet security requirements.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logout function called');
      console.trace('🔍 Logout call stack trace');
      setError(null);

      // For cookie-based auth, tell server to clear auth cookies
      await apiClient.post('/api/auth/logout').catch(() => {
        // Ignore logout errors - user is logging out anyway
        console.log('⚠️ Server logout failed, but continuing with local logout');
      });
    } finally {
      // Always clear local state
      console.log('🗑️ Clearing local auth state...');
      apiClient.clearAuthTokens();
      clearUserCache(); // Explicitly clear user cache on logout

      // Clear ALL cache systems on logout
      clearAllCachesOnLogout();

      setUser(null);
      console.log('✅ User state cleared');

      // Only redirect to home if this was triggered by user action (not on auth check failure)
      // And avoid redirecting during initial loading to prevent redirect loops
      if (!isLoading) {
        // Add some logging to track logout redirects
        console.log('🚪 Logout complete, redirecting to home');
        router.push('/');
      } else {
        console.log('🔄 Silent logout during auth check, not redirecting');
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
          console.log('✅ Token refreshed successfully and user data updated');
          return;
        }
      }

      throw new Error('Failed to refresh token');
    } catch (error) {
      // Token refresh failed, logout user
      console.error('❌ Token refresh failed:', error);
      apiClient.clearAuthTokens();
      setUser(null);
      setError('Session expired. Please sign in again.');
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<{ message: string }>(
        '/api/auth/change-password',
        data
      );

      if (response.success) {
        return {
          message: response.data.message || 'Password changed successfully',
        };
      } else {
        const errorMessage =
          response.message || 'Failed to change password. Please try again.';

        switch (errorMessage) {
          case 'Invalid current password':
            throw new Error('The current password you entered is incorrect.');
          case 'Validation failed':
            if (response.details?.password) {
              throw new Error(response.details.password);
            }
            throw new Error('Password does not meet security requirements.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
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
    changePassword,
    refreshToken,
    clearError,
    checkAuthStatus,
    verifyEmail,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
