'use client';

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Types for API responses - Updated to match backend patterns
interface APISuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface APIErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  requestId?: string;
  details?: any;
  statusCode?: number;
}

export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse;

class APIClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true, // Include cookies in requests
      // Allow all status codes to be handled as responses instead of throwing errors
      validateStatus: () => true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - no need to add auth token since backend uses cookies
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Backend handles authentication via cookies, so no Authorization header needed
        // The withCredentials: true option ensures cookies are sent automatically

        // Debug: Log outgoing requests
        console.log('📤 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          withCredentials: config.withCredentials,
          headers: config.headers,
        });

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Don't throw errors for 4xx status codes - let the API methods handle them
        // Only throw for actual network/axios errors
        return response;
      },
      async (error: AxiosError) => {
        // Handle 401 errors (authentication failures) - but only if it's not already handled
        if (error.response?.status === 401) {
          // Since backend manages auth via cookies, just handle auth failure
          this.handleAuthFailure();
          return Promise.reject(error);
        }

        // Don't redirect on server errors (5xx), only on auth failures
        if (error.response && error.response.status >= 500) {
          // Just return the error, don't redirect
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  private handleAuthFailure(): void {
    // Since backend manages auth via cookies, just redirect to login
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;

      // Don't redirect if already on login/register pages
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register')
      ) {
        // Use setTimeout to avoid redirect during request processing
        setTimeout(() => {
          // Check if we're on a protected route that requires auth
          const protectedRoutes = ['/dashboard', '/profile', '/my/', '/admin'];
          const isProtectedRoute = protectedRoutes.some((route) =>
            currentPath.startsWith(route)
          );

          if (isProtectedRoute) {
            window.location.href =
              '/login?returnUrl=' + encodeURIComponent(currentPath);
          }
        }, 100);
      }
    }
  }

  // Public methods for making API calls
  public async get<T = any>(
    url: string,
    config?: any
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.axiosInstance.get(url, config);

      console.log('📡 API GET Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        url: response.config.url,
        method: response.config.method,
      });

      // Check if the response status indicates an error or if response data has success: false
      if (
        response.status >= 400 ||
        (response.data &&
          typeof response.data === 'object' &&
          'success' in response.data &&
          !response.data.success)
      ) {
        console.log('📡 API GET indicates failure:', {
          status: response.status,
          data: response.data,
        });

        // If we have response data with error info, use it; otherwise create from status
        if (
          response.data &&
          typeof response.data === 'object' &&
          'message' in response.data
        ) {
          const errorResponse: APIErrorResponse = {
            success: false,
            error: response.data.error || `HTTP_${response.status}`,
            message: response.data.message || 'Request failed',
            timestamp: response.data.timestamp || new Date().toISOString(),
            statusCode: response.status,
            details: response.data.details || response.data,
          };
          return errorResponse;
        } else {
          // Create error response from status code
          const errorResponse: APIErrorResponse = {
            success: false,
            error: `HTTP_${response.status}`,
            message: response.statusText || 'Request failed',
            timestamp: new Date().toISOString(),
            statusCode: response.status,
          };
          return errorResponse;
        }
      }

      return response.data;
    } catch (error) {
      console.log('📡 API GET Error (caught):', error);
      return this.handleError(error as AxiosError);
    }
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.axiosInstance.post(url, data, config);

      console.log('📡 API POST Success:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        url: response.config.url,
        method: response.config.method,
      });

      // Check if the response data indicates an error (either via status code or success flag)
      if (
        response.status >= 400 ||
        (response.data &&
          typeof response.data === 'object' &&
          'success' in response.data &&
          !response.data.success)
      ) {
        console.log('📡 API Response indicates failure:', {
          status: response.status,
          data: response.data,
        });

        // If we have response data with error info, use it; otherwise create from status
        if (
          response.data &&
          typeof response.data === 'object' &&
          'message' in response.data
        ) {
          const errorResponse: APIErrorResponse = {
            success: false,
            error: response.data.error || `HTTP_${response.status}`,
            message: response.data.message || 'Request failed',
            timestamp: response.data.timestamp || new Date().toISOString(),
            statusCode: response.status,
            details: response.data.details || response.data,
          };
          return errorResponse;
        } else {
          // Create error response from status code
          const error = new Error(
            `Request failed with status ${response.status}`
          ) as any;
          error.response = response;
          error.config = response.config;
          throw error;
        }
      }

      return response.data;
    } catch (error) {
      console.log('📡 API POST Error Details:', {
        message: (error as AxiosError).message,
        code: (error as AxiosError).code,
        url: (error as AxiosError).config?.url,
        method: (error as AxiosError).config?.method,
        requestData: (error as AxiosError).config?.data,
        requestHeaders: (error as AxiosError).config?.headers,
        responseStatus: (error as AxiosError)?.response?.status,
        responseStatusText: (error as AxiosError)?.response?.statusText,
        responseData: (error as AxiosError)?.response?.data,
        responseHeaders: (error as AxiosError)?.response?.headers,
      });
      return this.handleError(error as AxiosError);
    }
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.axiosInstance.patch(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  public async delete<T = any>(
    url: string,
    config?: any
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  private handleError(error: AxiosError): APIErrorResponse {
    const timestamp = new Date().toISOString();

    // Handle network errors
    if (!error.response) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message:
          'Unable to connect to the server. Please check your internet connection.',
        timestamp,
      };
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'TIMEOUT_ERROR',
        message: 'Request timed out. Please try again.',
        timestamp,
      };
    }

    // Handle server response errors
    const responseData = error.response.data;

    if (responseData && typeof responseData === 'object') {
      // If response follows our API error format
      if ('success' in responseData && !responseData.success) {
        const apiError = responseData as APIErrorResponse;
        return {
          ...apiError,
          timestamp: apiError.timestamp || timestamp,
        };
      }

      // Handle different error formats
      if (
        'message' in responseData &&
        typeof responseData.message === 'string'
      ) {
        return {
          success: false,
          error: `HTTP_${error.response.status}`,
          message: responseData.message,
          details: responseData,
          timestamp,
          statusCode: error.response.status,
        };
      }
    }

    // Handle HTTP status codes with proper error mappings
    switch (error.response.status) {
      case 400:
        return {
          success: false,
          error: 'Validation failed',
          message: 'Invalid request. Please check your input and try again.',
          timestamp,
          statusCode: 400,
        };
      case 401:
        return {
          success: false,
          error: 'Invalid credentials',
          message: 'Authentication failed. Please check your credentials.',
          timestamp,
          statusCode: 401,
        };
      case 403:
        return {
          success: false,
          error: 'Account suspended',
          message: 'You do not have permission to perform this action.',
          timestamp,
          statusCode: 403,
        };
      case 404:
        return {
          success: false,
          error: 'User not found',
          message: 'The requested resource was not found.',
          timestamp,
          statusCode: 404,
        };
      case 409:
        return {
          success: false,
          error: 'Email already registered',
          message: 'This resource already exists.',
          timestamp,
          statusCode: 409,
        };
      case 422:
        return {
          success: false,
          error: 'Validation failed',
          message: 'Please check your input and try again.',
          details: responseData,
          timestamp,
          statusCode: 422,
        };
      case 423:
        return {
          success: false,
          error: 'Account locked',
          message:
            'Your account is temporarily locked. Please try again later.',
          timestamp,
          statusCode: 423,
        };
      case 429:
        return {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please wait a moment and try again.',
          timestamp,
          statusCode: 429,
        };
      case 500:
        return {
          success: false,
          error: 'Internal server error',
          message: 'Server error. Please try again later.',
          timestamp,
          statusCode: 500,
        };
      case 503:
        return {
          success: false,
          error: 'Service unavailable',
          message: 'Service temporarily unavailable. Please try again later.',
          timestamp,
          statusCode: 503,
        };
      default:
        return {
          success: false,
          error: `HTTP_${error.response.status}`,
          message: error.message || 'An unexpected error occurred.',
          timestamp,
          statusCode: error.response.status,
        };
    }
  }

  // Method to check if user is authenticated (with cookie-based auth, we'll rely on API responses)
  public isAuthenticated(): boolean {
    // With cookie-based auth, we can't easily check auth status from frontend
    // This will need to be determined by making an API call to a protected endpoint
    // For now, return true and let API responses handle auth failures
    return true;
  }

  // Token management methods (no-ops for cookie-based auth)
  public setAuthTokens(accessToken: string, refreshToken: string): void {
    // No-op for cookie-based auth - tokens are managed by server via cookies
    console.log('🍪 Token management handled by server cookies');
  }

  public clearAuthTokens(): void {
    // No-op for cookie-based auth - tokens are managed by server via cookies
    console.log('🍪 Token cleanup handled by server cookies');
  }

  public getAccessToken(): string | null {
    // Not applicable for cookie-based auth
    return null;
  }

  public getRefreshToken(): string | null {
    // Not applicable for cookie-based auth
    return null;
  }

  // Method to test authentication by making a simple API call
  public async testAuth(): Promise<{
    isAuthenticated: boolean;
    cookies?: string;
  }> {
    try {
      // Check for auth cookies in browser
      const cookies =
        typeof window !== 'undefined' ? document.cookie : 'N/A (server)';
      console.log('🍪 Current cookies:', cookies);

      // Try multiple auth endpoints to see which one works
      const endpoints = [
        '/api/auth/me',
        '/api/user/profile',
        '/api/auth/check',
      ];
      const results: any = {};

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Testing endpoint: ${endpoint}`);
          const response = await this.get(endpoint);
          results[endpoint] = response;

          if (response.success) {
            console.log(`✅ ${endpoint} succeeded`);
            return { isAuthenticated: true, cookies };
          }
        } catch (error) {
          console.log(`❌ ${endpoint} failed:`, error);
          results[endpoint] = { error: error };
        }
      }

      console.log('📊 All endpoint results:', results);
      return { isAuthenticated: false, cookies };
    } catch (error) {
      console.log('🔐 Auth test failed:', error);
      return {
        isAuthenticated: false,
        cookies:
          typeof window !== 'undefined' ? document.cookie : 'N/A (server)',
      };
    }
  }
}

// Create and export a singleton instance
export const apiClient = new APIClient();

// Export types for use in other files
export type { APISuccessResponse, APIErrorResponse };
