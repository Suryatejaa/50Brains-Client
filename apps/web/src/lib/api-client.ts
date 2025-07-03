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

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/pricing',
  '/features',
  '/blog',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/refresh',
  '/api/public',
];

class APIClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      // Enable cookies for cookie-based authentication
      withCredentials: true,
      // Let axios throw errors for 4xx/5xx so interceptors can handle them
      validateStatus: (status) => status < 400,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for setting common headers
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // For cookie-based auth we don't need to set Authorization headers
        // as cookies are automatically sent with requests

        // Note: Removed custom headers that were causing CORS issues
        // We don't need to add these headers for the API to function properly

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh via cookies
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Check for 401 Unauthorized error
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Prevent infinite retry loops
          originalRequest._retry = true;

          console.log(
            '🔄 Got 401 error - attempting token refresh via cookies'
          );

          try {
            // Try to refresh the token
            const refreshResponse = await this.refreshTokenViaCookies();
            if (refreshResponse.success) {
              console.log(
                '✅ Token refresh successful, retrying original request'
              );

              // Retry the original request with fresh cookies
              return this.axiosInstance(originalRequest);
            } else {
              console.error('❌ Token refresh rejected by server');
              // Let the error propagate - auth will handle it
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed with error:', refreshError);
            // Don't handle auth failure here, just let the error propagate
          }
        }

        // For network errors, add more user-friendly context
        if (!error.response && error.code === 'ERR_NETWORK') {
          console.warn('Network error detected - could be offline');
          error.isOffline = true; // Add flag for auth handler
        }

        // For all other errors, or if refresh fails, reject the promise
        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.failedQueue = [];
  }

  private async refreshTokenViaCookies(): Promise<APIResponse<any>> {
    try {
      console.log('🍪 Calling refresh endpoint with cookies');

      const response = await axios.post(
        `${this.axiosInstance.defaults.baseURL}/api/auth/refresh`,
        {}, // Empty body - backend reads refresh token from cookies
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // Include cookies
          validateStatus: (status) => status < 500, // Allow 4xx for error handling
        }
      );

      console.log('🔄 Refresh response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ Token refresh successful - cookies updated by backend');
        return response.data;
      } else {
        return {
          success: false,
          error: 'REFRESH_FAILED',
          message: response.data?.message || 'Token refresh failed',
          timestamp: new Date().toISOString(),
          statusCode: response.status,
        };
      }
    } catch (error) {
      console.log('❌ Refresh request failed:', error);
      return {
        success: false,
        error: 'REFRESH_ERROR',
        message: 'Failed to refresh token',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Check if a route is public (doesn't require authentication)
  public isPublicRoute(path: string): boolean {
    return PUBLIC_ROUTES.some((route) => {
      if (route.endsWith('*')) {
        // Handle wildcard routes
        return path.startsWith(route.slice(0, -1));
      }
      return path === route || path.startsWith(route + '/');
    });
  }

  // Check if current route is protected
  public isProtectedRoute(path?: string): boolean {
    const currentPath =
      path || (typeof window !== 'undefined' ? window.location.pathname : '/');
    return !this.isPublicRoute(currentPath);
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
        url: response.config.url,
        success: response.data?.success,
      });

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

      console.log('📡 API POST Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        success: response.data?.success,
      });

      return response.data;
    } catch (error) {
      console.log('📡 API POST Error Details:', {
        message: (error as AxiosError).message,
        code: (error as AxiosError).code,
        url: (error as AxiosError).config?.url,
        responseStatus: (error as AxiosError)?.response?.status,
        responseData: (error as AxiosError)?.response?.data,
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

  private createErrorResponse(response: AxiosResponse): APIErrorResponse {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'message' in response.data
    ) {
      return {
        success: false,
        error: response.data.error || `HTTP_${response.status}`,
        message: response.data.message || 'Request failed',
        timestamp: response.data.timestamp || new Date().toISOString(),
        statusCode: response.status,
        details: response.data.details || response.data,
      };
    } else {
      return {
        success: false,
        error: `HTTP_${response.status}`,
        message: response.statusText || 'Request failed',
        timestamp: new Date().toISOString(),
        statusCode: response.status,
      };
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
          error: 'Access forbidden',
          message: 'You do not have permission to perform this action.',
          timestamp,
          statusCode: 403,
        };
      case 404:
        return {
          success: false,
          error: 'Resource not found',
          message: 'The requested resource was not found.',
          timestamp,
          statusCode: 404,
        };
      case 409:
        return {
          success: false,
          error: 'Resource conflict',
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

  // Method to check if user is authenticated (for cookie-based auth)
  public isAuthenticated(): boolean {
    // For cookie-based auth, we can't reliably check on client side
    // The server will validate via cookies on each request
    // We can make a simple check by trying to access a protected endpoint
    return true; // Optimistic - real validation happens on server
  }

  // Method to test authentication by making API calls
  public async testAuth(): Promise<{
    isAuthenticated: boolean;
    user?: any;
  }> {
    try {
      console.log('🔍 Testing authentication with cookies');

      // Try auth endpoints
      const endpoints = [
        '/api/user/profile',
        '/api/auth/check',
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Testing endpoint: ${endpoint}`);
          const response = await this.get(endpoint);

          if (response.success) {
            console.log(`✅ ${endpoint} succeeded - user is authenticated`);
            return {
              isAuthenticated: true,
              user: response.data,
            };
          }
        } catch (error) {
          console.log(`❌ ${endpoint} failed:`, error);
        }
      }

      console.log('❌ All auth endpoints failed');
      return {
        isAuthenticated: false,
      };
    } catch (error) {
      console.log('🔐 Auth test failed:', error);
      return {
        isAuthenticated: false,
      };
    }
  }

  // Logout method - calls backend to clear cookies
  public async logout(): Promise<APIResponse<any>> {
    try {
      const response = await this.post('/api/auth/logout');

      if (response.success) {
        console.log('🚪 Logout successful - cookies cleared by backend');
        // Optionally redirect to login page
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }

      return response;
    } catch (error) {
      console.log('❌ Logout failed:', error);
      return {
        success: false,
        error: 'LOGOUT_ERROR',
        message: 'Failed to logout',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Add or remove routes from public routes array
  public addPublicRoute(route: string): void {
    if (!PUBLIC_ROUTES.includes(route)) {
      PUBLIC_ROUTES.push(route);
    }
  }

  public removePublicRoute(route: string): void {
    const index = PUBLIC_ROUTES.indexOf(route);
    if (index > -1) {
      PUBLIC_ROUTES.splice(index, 1);
    }
  }

  public getPublicRoutes(): string[] {
    return [...PUBLIC_ROUTES];
  }

  // Legacy token methods - no-ops for cookie-based auth
  public setAuthTokens(accessToken?: string, refreshToken?: string): void {
    console.log(
      '🍪 Cookie-based auth: setAuthTokens is a no-op - backend manages cookies'
    );
  }

  public clearAuthTokens(): void {
    console.log(
      '🍪 Cookie-based auth: clearAuthTokens is a no-op - use logout() instead'
    );
  }

  public getAccessToken(): string | null {
    console.log(
      '🍪 Cookie-based auth: getAccessToken is a no-op - tokens in cookies'
    );
    return null;
  }

  public getRefreshToken(): string | null {
    console.log(
      '🍪 Cookie-based auth: getRefreshToken is a no-op - tokens in cookies'
    );
    return null;
  }
}

// Create and export a singleton instance
export const apiClient = new APIClient();

// Export types for use in other files
export type { APISuccessResponse, APIErrorResponse };
