import {
  APISuccessResponse,
  APIErrorResponse,
  User,
  LoginRequest,
  RegisterRequest,
  TokenPair,
  Gig,
  Clan,
  CreditWallet,
  CreditTransaction,
  ReputationScore,
  Notification,
  SocialMediaHandle,
  PaginationParams,
  SearchFilters,
  InfluencerDashboardMetrics,
  CrewDashboardMetrics,
  SocialMediaAnalytics,
  CampaignApplication,
  WorkHistoryItem,
  BrandRecommendation,
  CrewOpportunity,
} from '@50brains/shared-types';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    public message: string,
    public success?: boolean,
    public errors?: string[],
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface APIClientConfig {
  baseURL: string;
  timeout?: number;
}

export class APIClient {
  private baseURL: string;
  private timeout: number;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private refreshPromise: Promise<void> | null = null; // Prevent multiple refresh calls

  constructor(config: APIClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
  }

  private getHeaders(endpoint?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Authentication is handled by httpOnly cookies automatically
    // No manual Authorization header needed as proven by tests

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache = false
  ): Promise<APISuccessResponse<T>> {
    // Check cache for GET requests
    if (options.method === 'GET' && useCache && this.cache.has(endpoint)) {
      const cached = this.cache.get(endpoint)!;

      // Return stale data immediately
      const result = cached.data;

      // Fetch fresh data in background if cache is stale
      if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
        this.fetchFreshData(endpoint, options).catch(console.error);
      }

      return result;
    }

    return this.fetchFreshData(endpoint, options);
  }

  private async fetchFreshData<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APISuccessResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    console.log('🌐 === FETCH DEBUG ===');
    console.log('🔗 Making fetch request to:', url);
    console.log('📋 Request options:', {
      method: options.method || 'GET',
      headers: { ...this.getHeaders(), ...options.headers },
      body: options.body,
      credentials: 'include',
    });
    console.log('⏱️ Timeout:', this.timeout, 'ms');
    console.log('========================');

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        credentials: 'include', // Include cookies for authentication
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - don't retry for login endpoints, just fail
      if (
        response.status === 401 &&
        endpoint !== '/api/auth/refresh' &&
        endpoint !== '/api/auth/login'
      ) {
        console.log('↻ 401 detected, attempting token refresh...');

        try {
          await this.handleTokenRefresh();

          // Retry the original request with refreshed token
          console.log('↻ Retrying original request after token refresh...');
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...this.getHeaders(),
              ...options.headers,
            },
            credentials: 'include',
            signal: controller.signal,
          });

          if (!retryResponse.ok) {
            const retryError: APIErrorResponse = await retryResponse.json();
            // Extract error message correctly - prioritize message field over error field
            const retryErrorMessage =
              retryError.message ||
              (typeof retryError.error === 'string'
                ? retryError.error
                : 'Unknown error');
            const retryErrorCode =
              typeof retryError.error === 'object' && retryError.error?.code
                ? retryError.error.code
                : typeof retryError.error === 'string'
                  ? retryError.error
                  : retryErrorMessage;

            throw new APIError(
              retryError.statusCode,
              retryErrorCode,
              retryErrorMessage,
              false,
              undefined,
              retryError.details
            );
          }

          const retryData: APISuccessResponse<T> = await retryResponse.json();

          // Update cache for GET requests
          if (options.method === 'GET' || !options.method) {
            this.cache.set(endpoint, {
              data: retryData,
              timestamp: Date.now(),
            });
          }

          return retryData;
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);

          // If refresh fails, check if it's a network error or server error
          if (refreshError instanceof APIError) {
            // If it's a 401 from refresh, the user needs to re-authenticate
            if (refreshError.statusCode === 401) {
              console.log('🔒 Refresh token expired, user needs to re-login');
              // Don't throw the error, let the calling code handle it gracefully
              // This prevents the cascade of 401 errors
              throw new APIError(
                401,
                'REFRESH_EXPIRED',
                'Session expired. Please sign in again.',
                false
              );
            }
          }

          // For other refresh errors, throw the original 401 error
          const error: APIErrorResponse = await response.json();

          // Extract error message correctly - prioritize message field over error field
          const errorMessage =
            error.message ||
            (typeof error.error === 'string' ? error.error : 'Unknown error');
          const errorCode =
            typeof error.error === 'object' && error.error?.code
              ? error.error.code
              : typeof error.error === 'string'
                ? error.error
                : errorMessage;

          throw new APIError(
            error.statusCode,
            errorCode,
            errorMessage,
            false,
            undefined,
            error.details
          );
        }
      }

      if (!response.ok) {
        const error: APIErrorResponse = await response.json();
        console.log('error:', error);

        // Extract error message correctly - prioritize message field over error field
        const errorMessage =
          error.message ||
          (typeof error.error === 'string' ? error.error : 'Unknown error');
        const errorCode =
          typeof error.error === 'object' && error.error?.code
            ? error.error.code
            : typeof error.error === 'string'
              ? error.error
              : errorMessage;

        throw new APIError(
          error.statusCode,
          errorCode,
          errorMessage,
          false,
          undefined,
          error.details
        );
      }

      console.log('📥 === RESPONSE DEBUG ===');
      console.log('✅ Response status:', response.status);
      console.log(
        '📋 Response headers:',
        response.headers instanceof Headers
          ? Object.fromEntries(
              Object.entries(response.headers).map(([key, value]) => [
                key,
                value,
              ])
            )
          : response.headers
      );
      console.log('🔗 Response URL:', response.url);
      console.log('========================');

      const data: APISuccessResponse<T> = await response.json();

      console.log('📄 Response data:', data);

      // Update cache for GET requests
      if (options.method === 'GET' || !options.method) {
        this.cache.set(endpoint, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      console.log('❌ === ERROR DEBUG ===');
      console.log('🚨 Error occurred:', error);
      console.log(
        '🔍 Error type:',
        error instanceof Error ? error.constructor.name : 'Unknown'
      );
      console.log(
        '📝 Error message:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      console.log('📊 Error details:', error);
      console.log('=====================');

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError(408, 'TIMEOUT', 'Request timeout');
      }

      throw new APIError(500, 'NETWORK_ERROR', 'Network error occurred');
    }
  }

  // Handle token refresh with deduplication
  private async handleTokenRefresh(): Promise<void> {
    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      console.log('↻ Token refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    // For production cross-domain scenarios, log cookie debug info
    if (this.baseURL.includes('railway.app')) {
      console.log('🍪 Cross-domain refresh attempt to Railway:', {
        baseURL: this.baseURL,
        origin:
          typeof window !== 'undefined' ? window.location.origin : 'server',
        cookies:
          typeof document !== 'undefined' ? document.cookie : 'server-side',
      });
    }

    // Start a new refresh process
    this.refreshPromise = this.performTokenRefresh();

    try {
      await this.refreshPromise;
      console.log('✅ Token refresh completed successfully');
    } finally {
      // Clear the refresh promise
      this.refreshPromise = null;
    }
  }

  // Perform the actual token refresh
  private async performTokenRefresh(): Promise<void> {
    console.log('↻ Calling refresh token endpoint...');

    try {
      const refreshResponse = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include', // Include cookies with refresh token
      });

      if (!refreshResponse.ok) {
        const refreshError = await refreshResponse.json();
        console.error('❌ Refresh token request failed:', {
          status: refreshResponse.status,
          statusText: refreshResponse.statusText,
          error: refreshError,
          baseURL: this.baseURL,
          isRailway: this.baseURL.includes('railway.app'),
        });

        // Special handling for cross-domain cookie issues
        if (
          refreshResponse.status === 400 &&
          this.baseURL.includes('railway.app')
        ) {
          console.error(
            '🚨 Cross-domain cookie issue detected. Railway backend not receiving refresh tokens from localhost frontend.'
          );
          console.error(
            '💡 This happens because cookies cannot be shared between localhost and railway.app domains'
          );
          throw new APIError(
            400,
            'CROSS_DOMAIN_COOKIE_ERROR',
            'Cannot refresh tokens due to cross-domain cookie restrictions. Please login again.',
            false
          );
        }

        // If refresh token is expired (401), this is a critical auth failure
        if (refreshResponse.status === 401) {
          throw new APIError(
            401,
            'REFRESH_TOKEN_EXPIRED',
            'Refresh token has expired. User needs to re-authenticate.',
            false
          );
        }

        // For other errors, provide more context
        throw new APIError(
          refreshResponse.status,
          refreshError.error || 'REFRESH_FAILED',
          refreshError.message ||
            `Token refresh failed: ${refreshResponse.status} ${refreshResponse.statusText}`
        );
      }

      console.log('✅ Token refresh successful');
      // The new tokens are automatically set in cookies by the server
    } catch (error) {
      console.error('❌ Token refresh failed with error:', error);

      // Re-throw APIError instances as-is
      if (error instanceof APIError) {
        throw error;
      }

      // Wrap other errors in APIError
      if (error instanceof Error) {
        throw new APIError(
          500,
          'REFRESH_ERROR',
          `Token refresh failed: ${error.message}`
        );
      }

      // Fallback for unknown errors
      throw new APIError(
        500,
        'REFRESH_ERROR',
        'Token refresh failed due to an unknown error'
      );
    }
  }

  async get<T>(
    endpoint: string,
    useCache = true
  ): Promise<APISuccessResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, useCache);
  }

  async post<T>(endpoint: string, data?: any): Promise<APISuccessResponse<T>> {
    console.log('📡 === API CLIENT POST DEBUG ===');
    console.log('🎯 Endpoint:', endpoint);
    console.log('📤 Data being sent:', data);
    console.log('🔗 Full URL:', `${this.baseURL}${endpoint}`);
    console.log(
      '📋 Request body:',
      data ? JSON.stringify(data, null, 2) : 'undefined'
    );
    console.log('================================');

    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<APISuccessResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<APISuccessResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<APISuccessResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload file with progress
  async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<APISuccessResponse<T>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(
              new APIError(500, 'PARSE_ERROR', 'Failed to parse response')
            );
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new APIError(xhr.status, error.error, error.message));
          } catch {
            reject(
              new APIError(
                xhr.status,
                'UNKNOWN_ERROR',
                'Unknown error occurred'
              )
            );
          }
        }
      };

      xhr.onerror = () => {
        reject(new APIError(500, 'NETWORK_ERROR', 'Network error occurred'));
      };

      xhr.open('POST', `${this.baseURL}${endpoint}`);

      // Include credentials for cookie-based authentication
      xhr.withCredentials = true;

      xhr.send(formData);
    });
  }

  // Clear cache
  clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Legacy methods for compatibility (no-ops for cookie-based auth)
  setAuthTokens(accessToken?: string, refreshToken?: string): void {
    console.warn(
      'setAuthTokens is deprecated in cookie-based auth. Use auth.login() instead.'
    );
  }

  clearAuthTokens(): void {
    console.warn(
      'clearAuthTokens is deprecated in cookie-based auth. Use auth.logout() instead.'
    );
  }

  getAccessToken(): string | null {
    console.warn(
      'getAccessToken is deprecated in cookie-based auth. Tokens are in cookies.'
    );
    return null;
  }

  getRefreshToken(): string | null {
    console.warn(
      'getRefreshToken is deprecated in cookie-based auth. Tokens are in cookies.'
    );
    return null;
  }
}

// Service classes for different API endpoints
export class AuthService {
  constructor(private client: APIClient) {}

  async login(credentials: LoginRequest): Promise<TokenPair> {
    const response = await this.client.post<TokenPair>(
      '/api/auth/login',
      credentials
    );
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      '/api/auth/register',
      userData
    );
    return response.data;
  }

  async refreshToken(): Promise<TokenPair> {
    const response = await this.client.post<TokenPair>('/api/auth/refresh');
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/api/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/api/user/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.client.patch<User>('/api/user/profile', data);
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await this.client.post('/api/auth/change-password', data);
  }

  async forgotPassword(email: string): Promise<void> {
    await this.client.post('/api/auth/forgot-password', { email });
  }

  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<void> {
    await this.client.post('/api/auth/reset-password', data);
  }

  async verifyEmail(token: string): Promise<void> {
    await this.client.post('/api/auth/verify-email', { token });
  }
}

export class UserService {
  constructor(private client: APIClient) {}

  async getProfile(): Promise<User> {
    const response = await this.client.get<User>('/api/user/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.client.put<User>('/api/user/profile', data);
    return response.data;
  }

  async getUserFeed(
    params?: PaginationParams
  ): Promise<{ users: User[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{ users: User[]; pagination: any }>(
      `/api/user/feed${queryString}`
    );
    return response.data;
  }

  async searchUsers(
    filters: SearchFilters & PaginationParams
  ): Promise<{ users: User[]; pagination: any }> {
    const queryString = `?${new URLSearchParams(filters as any).toString()}`;
    const response = await this.client.get<{ users: User[]; pagination: any }>(
      `/api/user/search${queryString}`
    );
    return response.data;
  }

  async getUserById(userId: string): Promise<User> {
    const response = await this.client.get<User>(`/api/user/${userId}`);
    return response.data;
  }

  async addToFavorites(userId: string): Promise<void> {
    await this.client.post(`/api/user/favorites/${userId}`);
  }

  async removeFromFavorites(userId: string): Promise<void> {
    await this.client.delete(`/api/user/favorites/${userId}`);
  }

  async getUserAnalytics(): Promise<any> {
    const response = await this.client.get<any>('/api/user/analytics');
    return response.data;
  }
}

export class GigService {
  constructor(private client: APIClient) {}

  async getGigFeed(
    params?: PaginationParams
  ): Promise<{ gigs: Gig[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{ gigs: Gig[]; pagination: any }>(
      `/api/gig/feed${queryString}`
    );
    return response.data;
  }

  async createGig(gigData: Partial<Gig>): Promise<Gig> {
    const response = await this.client.post<Gig>('/api/gig', gigData);
    return response.data;
  }

  async getGigById(gigId: string): Promise<Gig> {
    const response = await this.client.get<Gig>(`/api/gig/${gigId}`);
    return response.data;
  }

  async updateGig(gigId: string, data: Partial<Gig>): Promise<Gig> {
    const response = await this.client.put<Gig>(`/api/gig/${gigId}`, data);
    return response.data;
  }

  async deleteGig(gigId: string): Promise<void> {
    await this.client.delete(`/api/gig/${gigId}`);
  }

  async applyToGig(gigId: string, applicationData: any): Promise<void> {
    await this.client.post(`/api/gig/${gigId}/apply`, applicationData);
  }

  async getMyGigs(
    params?: PaginationParams
  ): Promise<{ gigs: Gig[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{ gigs: Gig[]; pagination: any }>(
      `/api/gig/my-posted${queryString}`
    );
    return response.data;
  }

  async getMyApplications(
    params?: PaginationParams & { status?: string }
  ): Promise<{ applications: any[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{
      applications: any[];
      pagination: any;
    }>(`/api/gig/my-applications${queryString}`);
    return response.data;
  }

  // Influencer-specific endpoints
  async getRecommendedGigs(
    params?: PaginationParams
  ): Promise<{ gigs: Gig[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{ gigs: Gig[]; pagination: any }>(
      `/api/gig/recommended${queryString}`
    );
    return response.data;
  }

  async getInfluencerGigs(
    params?: PaginationParams & { category?: string }
  ): Promise<{ gigs: Gig[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{ gigs: Gig[]; pagination: any }>(
      `/api/gig/influencer${queryString}`
    );
    return response.data;
  }

  async getCampaignInsights(gigId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/gig/${gigId}/insights`);
    return response.data;
  }

  // Crew-specific endpoints
  async getCrewGigs(
    params?: PaginationParams & { skillRequired?: string }
  ): Promise<{ gigs: Gig[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{ gigs: Gig[]; pagination: any }>(
      `/api/gig/crew${queryString}`
    );
    return response.data;
  }

  async getProjectTimeline(gigId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/gig/${gigId}/timeline`);
    return response.data;
  }

  async submitDeliverable(gigId: string, data: any): Promise<any> {
    const response = await this.client.post<any>(
      `/api/gig/${gigId}/deliverable`,
      data
    );
    return response.data;
  }

  // Application management
  async updateApplicationStatus(
    applicationId: string,
    status: string,
    data?: any
  ): Promise<any> {
    const response = await this.client.put<any>(
      `/api/gig/applications/${applicationId}/status`,
      {
        status,
        ...data,
      }
    );
    return response.data;
  }

  async getApplicationDetails(applicationId: string): Promise<any> {
    const response = await this.client.get<any>(
      `/api/gig/applications/${applicationId}`
    );
    return response.data;
  }

  async withdrawApplication(applicationId: string): Promise<void> {
    await this.client.delete(`/api/gig/applications/${applicationId}`);
  }
}

export class ClanService {
  constructor(private client: APIClient) {}

  async getClanFeed(
    params?: PaginationParams
  ): Promise<{ clans: Clan[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{ clans: Clan[]; pagination: any }>(
      `/api/clan/feed${queryString}`
    );
    return response.data;
  }

  async createClan(clanData: Partial<Clan>): Promise<Clan> {
    const response = await this.client.post<Clan>('/api/clans', clanData);
    console.log('createClan response:', response);
    return response.data;
  }

  async getClanById(clanId: string): Promise<Clan> {
    const response = await this.client.get<Clan>(`/api/clans/${clanId}`);
    return response.data;
  }

  async updateClan(clanId: string, data: Partial<Clan>): Promise<Clan> {
    const response = await this.client.put<Clan>(`/api/clans/${clanId}`, data);
    return response.data;
  }

  async deleteClan(clanId: string): Promise<void> {
    await this.client.delete(`/api/clans/${clanId}`);
  }

  async getClanMembers(clanId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(
      `/api/clans/${clanId}/members`
    );
    return response.data;
  }

  async inviteMember(data: {
    clanId: string;
    userId: string;
    role?: string;
  }): Promise<void> {
    await this.client.post('/api/clans/invite', data);
  }

  async updateMemberRole(
    clanId: string,
    userId: string,
    role: string
  ): Promise<void> {
    await this.client.put(`/api/clans/${clanId}/members/${userId}/role`, {
      role,
    });
  }

  async removeMember(clanId: string, userId: string): Promise<void> {
    await this.client.delete(`/api/clans/${clanId}/members/${userId}`);
  }

  async leaveClan(clanId: string): Promise<void> {
    await this.client.post(`/api/clans/${clanId}/leave`);
  }
}

export class CreditService {
  constructor(private client: APIClient) {}

  async getWallet(): Promise<CreditWallet> {
    const response = await this.client.get<CreditWallet>('/api/credit/wallet');
    return response.data;
  }

  async purchaseCredits(data: {
    amount: number;
    paymentMethod: string;
  }): Promise<any> {
    const response = await this.client.post<any>('/api/credit/purchase', data);
    return response.data;
  }

  async getTransactions(
    params?: PaginationParams
  ): Promise<{ transactions: CreditTransaction[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{
      transactions: CreditTransaction[];
      pagination: any;
    }>(`/api/credit/transactions${queryString}`);
    return response.data;
  }

  async boostProfile(data: { duration: number }): Promise<void> {
    await this.client.post('/api/credit/boost/profile', data);
  }

  async boostGig(data: { gigId: string; duration: number }): Promise<void> {
    await this.client.post('/api/credit/boost/gig', data);
  }

  async boostClan(data: { clanId: string; duration: number }): Promise<void> {
    await this.client.post('/api/credit/boost/clan', data);
  }
}

export class NotificationService {
  constructor(private client: APIClient) {}

  async getNotifications(
    params?: PaginationParams
  ): Promise<{ notifications: Notification[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{
      notifications: Notification[];
      pagination: any;
    }>(`/api/notification${queryString}`);
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.client.patch(`/api/notification/mark-read/${notificationId}`);
  }

  async markAllAsRead(): Promise<void> {
    await this.client.patch('/api/notification/mark-all-read');
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.client.delete(`/api/notification/${notificationId}`);
  }
}

export class SocialMediaService {
  constructor(private client: APIClient) {}

  // Profile Social Media Management
  async getConnectedAccounts(): Promise<SocialMediaHandle[]> {
    const response = await this.client.get<SocialMediaHandle[]>(
      '/api/social-media/accounts'
    );
    return response.data;
  }

  async connectAccount(data: {
    platform: string;
    username: string;
    accessToken?: string;
  }): Promise<SocialMediaHandle> {
    const response = await this.client.post<SocialMediaHandle>(
      '/api/social-media/connect',
      data
    );
    return response.data;
  }

  async disconnectAccount(accountId: string): Promise<void> {
    await this.client.delete(`/api/social-media/accounts/${accountId}`);
  }

  async updateAccount(
    accountId: string,
    data: Partial<SocialMediaHandle>
  ): Promise<SocialMediaHandle> {
    const response = await this.client.put<SocialMediaHandle>(
      `/api/social-media/accounts/${accountId}`,
      data
    );
    return response.data;
  }

  // Analytics and Insights
  async getAnalytics(userId?: string): Promise<any> {
    const endpoint = userId
      ? `/api/social-media/analytics/${userId}`
      : '/api/social-media/analytics';
    const response = await this.client.get<any>(endpoint);
    return response.data;
  }

  async getPlatformAnalytics(platform: string, userId?: string): Promise<any> {
    const endpoint = userId
      ? `/api/social-media/analytics/${userId}/${platform}`
      : `/api/social-media/analytics/platform/${platform}`;
    const response = await this.client.get<any>(endpoint);
    return response.data;
  }

  async getInfluencerTier(
    userId?: string
  ): Promise<{ tier: string; score: number; nextTier: string }> {
    const endpoint = userId
      ? `/api/social-media/tier/${userId}`
      : '/api/social-media/tier';
    const response = await this.client.get<{
      tier: string;
      score: number;
      nextTier: string;
    }>(endpoint);
    return response.data;
  }

  // Growth and Recommendations
  async getGrowthMetrics(
    timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<any> {
    const response = await this.client.get<any>(
      `/api/social-media/growth?timeframe=${timeframe}`
    );
    return response.data;
  }

  async getRecommendations(): Promise<any> {
    const response = await this.client.get<any>(
      '/api/social-media/recommendations'
    );
    return response.data;
  }

  // Content Performance
  async getContentInsights(platform?: string): Promise<any> {
    const endpoint = platform
      ? `/api/social-media/content-insights?platform=${platform}`
      : '/api/social-media/content-insights';
    const response = await this.client.get<any>(endpoint);
    return response.data;
  }

  async getAudienceInsights(platform?: string): Promise<any> {
    const endpoint = platform
      ? `/api/social-media/audience-insights?platform=${platform}`
      : '/api/social-media/audience-insights';
    const response = await this.client.get<any>(endpoint);
    return response.data;
  }
}

export class ReputationService {
  constructor(private client: APIClient) {}

  async getUserReputation(userId?: string): Promise<ReputationScore> {
    const endpoint = userId
      ? `/api/reputation/users/${userId}`
      : '/api/reputation/profile';
    const response = await this.client.get<ReputationScore>(endpoint);
    return response.data;
  }

  async getReputationHistory(userId?: string): Promise<any[]> {
    const endpoint = userId
      ? `/api/reputation/users/${userId}/history`
      : '/api/reputation/profile/history';
    const response = await this.client.get<any[]>(endpoint);
    return response.data;
  }

  async getReputationBreakdown(userId?: string): Promise<any> {
    const endpoint = userId
      ? `/api/reputation/users/${userId}/breakdown`
      : '/api/reputation/profile/breakdown';
    const response = await this.client.get<any>(endpoint);
    return response.data;
  }

  async getBadges(userId?: string): Promise<any[]> {
    const endpoint = userId
      ? `/api/reputation/users/${userId}/badges`
      : '/api/reputation/badges';
    const response = await this.client.get<any[]>(endpoint);
    return response.data;
  }

  async getLeaderboard(category?: string, timeframe?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (timeframe) params.append('timeframe', timeframe);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await this.client.get<any[]>(
      `/api/reputation/leaderboard${queryString}`
    );
    return response.data;
  }

  async getRanking(
    userId?: string
  ): Promise<{ rank: number; total: number; category: string }> {
    const endpoint = userId
      ? `/api/reputation/users/${userId}/ranking`
      : '/api/reputation/ranking';
    const response = await this.client.get<{
      rank: number;
      total: number;
      category: string;
    }>(endpoint);
    return response.data;
  }
}

export class WorkHistoryService {
  constructor(private client: APIClient) {}

  async getWorkHistory(
    userId?: string,
    params?: PaginationParams
  ): Promise<any> {
    const endpoint = userId
      ? `/api/work-history/users/${userId}`
      : '/api/work-history/profile';
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<any>(`${endpoint}${queryString}`);
    return response.data;
  }

  async getWorkSummary(userId?: string): Promise<any> {
    const endpoint = userId
      ? `/api/work-history/users/${userId}/summary`
      : '/api/work-history/profile/summary';
    const response = await this.client.get<any>(endpoint);
    return response.data;
  }

  async getEarningsHistory(timeframe?: string): Promise<any> {
    const queryString = timeframe ? `?timeframe=${timeframe}` : '';
    const response = await this.client.get<any>(
      `/api/work-history/earnings${queryString}`
    );
    return response.data;
  }

  async getProjectMetrics(): Promise<any> {
    const response = await this.client.get<any>('/api/work-history/metrics');
    return response.data;
  }

  async getClientHistory(): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/work-history/clients');
    return response.data;
  }

  async getCompletionStats(): Promise<any> {
    const response = await this.client.get<any>(
      '/api/work-history/completion-stats'
    );
    return response.data;
  }
}

export class AnalyticsService {
  constructor(private client: APIClient) {}

  async getDashboardAnalytics(): Promise<any> {
    const response = await this.client.get<any>('/api/analytics/dashboard');
    return response.data;
  }

  async getUserInsights(userId?: string): Promise<any> {
    const endpoint = userId
      ? `/api/analytics/user-insights/${userId}`
      : '/api/analytics/user-insights';
    const response = await this.client.get<any>(endpoint);
    return response.data;
  }

  async getPerformanceMetrics(timeframe?: string): Promise<any> {
    const queryString = timeframe ? `?timeframe=${timeframe}` : '';
    const response = await this.client.get<any>(
      `/api/analytics/performance${queryString}`
    );
    return response.data;
  }

  async getEngagementMetrics(): Promise<any> {
    const response = await this.client.get<any>('/api/analytics/engagement');
    return response.data;
  }

  async getRevenueAnalytics(): Promise<any> {
    const response = await this.client.get<any>('/api/analytics/revenue');
    return response.data;
  }

  async getMarketInsights(): Promise<any> {
    const response = await this.client.get<any>(
      '/api/analytics/market-insights'
    );
    return response.data;
  }
}

// Influencer-specific service
export class InfluencerService {
  constructor(private client: APIClient) {}

  // Dashboard Data
  async getDashboardMetrics(): Promise<InfluencerDashboardMetrics> {
    const response = await this.client.get<InfluencerDashboardMetrics>(
      '/api/influencer/dashboard'
    );
    return response.data;
  }

  // Campaign Management
  async getCampaigns(
    params?: PaginationParams & { status?: string }
  ): Promise<{ campaigns: CampaignApplication[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{
      campaigns: CampaignApplication[];
      pagination: any;
    }>(`/api/my/applications${queryString}`);
    return response.data;
  }

  async getActiveCampaigns(): Promise<CampaignApplication[]> {
    const response = await this.client.get<CampaignApplication[]>(
      '/api/my/applications?status=ACCEPTED'
    );
    return response.data;
  }

  async getPendingApplications(): Promise<CampaignApplication[]> {
    const response = await this.client.get<CampaignApplication[]>(
      '/api/my/applications?status=PENDING'
    );
    return response.data;
  }

  async getCompletedCampaigns(): Promise<CampaignApplication[]> {
    const response = await this.client.get<CampaignApplication[]>(
      '/api/my/applications?status=COMPLETED'
    );
    return response.data;
  }

  async applytoCampaign(
    gigId: string,
    applicationData: {
      proposedRate?: number;
      coverLetter?: string;
      deliverables?: string[];
      timeline?: string;
      portfolioLinks?: string[];
      contentType?: string;
      platforms?: string[];
    }
  ): Promise<void> {
    await this.client.post(`/api/gig/${gigId}/apply`, applicationData);
  }

  async withdrawApplication(applicationId: string): Promise<void> {
    await this.client.delete(`/api/gig/applications/${applicationId}`);
  }

  async updateApplication(
    applicationId: string,
    data: Partial<CampaignApplication>
  ): Promise<CampaignApplication> {
    const response = await this.client.put<CampaignApplication>(
      `/api/gig/applications/${applicationId}`,
      data
    );
    return response.data;
  }

  // Content Performance & Analytics
  async getContentMetrics(timeframe?: string): Promise<any> {
    const queryString = timeframe ? `?timeframe=${timeframe}` : '';
    const response = await this.client.get<any>(
      `/api/social-media/content-metrics${queryString}`
    );
    return response.data;
  }

  async getAudienceInsights(): Promise<any> {
    const response = await this.client.get<any>(
      '/api/social-media/audience-insights'
    );
    return response.data;
  }

  async getEngagementTrends(timeframe?: string): Promise<any> {
    const queryString = timeframe ? `?timeframe=${timeframe}` : '';
    const response = await this.client.get<any>(
      `/api/social-media/engagement-trends${queryString}`
    );
    return response.data;
  }

  async getBestPostingTimes(): Promise<any> {
    const response = await this.client.get<any>(
      '/api/social-media/best-posting-times'
    );
    return response.data;
  }

  async getTopContent(contentType?: string): Promise<any> {
    const queryString = contentType ? `?type=${contentType}` : '';
    const response = await this.client.get<any>(
      `/api/social-media/top-content${queryString}`
    );
    return response.data;
  }

  // Brand Discovery & Recommendations
  async getBrandRecommendations(
    params?: PaginationParams & { category?: string; minBudget?: number }
  ): Promise<{ brands: BrandRecommendation[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{
      brands: BrandRecommendation[];
      pagination: any;
    }>(`/api/influencer/brand-recommendations${queryString}`);
    return response.data;
  }

  async getRecommendedGigs(
    params?: PaginationParams & { category?: string }
  ): Promise<{ gigs: Gig[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{ gigs: Gig[]; pagination: any }>(
      `/api/gig/influencer/recommended${queryString}`
    );
    return response.data;
  }

  async searchBrands(
    filters: SearchFilters & {
      industry?: string;
      verified?: boolean;
      budget?: string;
    }
  ): Promise<{ brands: User[]; pagination: any }> {
    const queryString = `?${new URLSearchParams(filters as any).toString()}`;
    const response = await this.client.get<{ brands: User[]; pagination: any }>(
      `/api/search/brands${queryString}`
    );
    return response.data;
  }

  // Campaign Insights & Performance
  async getCampaignInsights(campaignId: string): Promise<any> {
    const response = await this.client.get<any>(
      `/api/gig/${campaignId}/insights`
    );
    return response.data;
  }

  async getCampaignPerformance(): Promise<any> {
    const response = await this.client.get<any>(
      '/api/influencer/campaign-performance'
    );
    return response.data;
  }

  async getEarningsBreakdown(timeframe?: string): Promise<any> {
    const queryString = timeframe ? `?timeframe=${timeframe}` : '';
    const response = await this.client.get<any>(
      `/api/work-history/earnings-breakdown${queryString}`
    );
    return response.data;
  }

  // Profile Enhancement
  async updateInfluencerProfile(data: {
    contentCategories?: string[];
    estimatedFollowers?: number;
    collaborationRates?: any;
    targetAudience?: any;
    mediaKit?: string;
  }): Promise<User> {
    const response = await this.client.put<User>(
      '/api/user/influencer-profile',
      data
    );
    return response.data;
  }

  async uploadMediaKit(file: File): Promise<{ url: string }> {
    const response = await this.client.uploadFile<{ url: string }>(
      '/api/upload/media-kit',
      file
    );
    return response.data;
  }

  // Collaboration History
  async getCollaborationHistory(
    params?: PaginationParams
  ): Promise<{ collaborations: WorkHistoryItem[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{
      collaborations: WorkHistoryItem[];
      pagination: any;
    }>(`/api/work-history/collaborations${queryString}`);
    return response.data;
  }

  async getBrandHistory(): Promise<{ brands: User[]; stats: any }> {
    const response = await this.client.get<{ brands: User[]; stats: any }>(
      '/api/influencer/brand-history'
    );
    return response.data;
  }

  // Industry Insights
  async getIndustryTrends(): Promise<any> {
    const response = await this.client.get<any>(
      '/api/analytics/industry-trends'
    );
    return response.data;
  }

  async getCompetitorAnalysis(): Promise<any> {
    const response = await this.client.get<any>(
      '/api/analytics/competitor-analysis'
    );
    return response.data;
  }

  // Content Scheduling & Management
  async getContentCalendar(month?: string): Promise<any> {
    const queryString = month ? `?month=${month}` : '';
    const response = await this.client.get<any>(
      `/api/content/calendar${queryString}`
    );
    return response.data;
  }

  async scheduleContent(data: {
    platform: string;
    content: string;
    scheduledAt: string;
    hashtags?: string[];
    mentions?: string[];
  }): Promise<any> {
    const response = await this.client.post<any>('/api/content/schedule', data);
    return response.data;
  }
}

// Crew-specific service
export class CrewService {
  constructor(private client: APIClient) {}

  // Dashboard Data
  async getDashboardMetrics(): Promise<CrewDashboardMetrics> {
    const response = await this.client.get<CrewDashboardMetrics>(
      '/api/crew/dashboard'
    );
    return response.data;
  }

  // Project Management
  async getProjects(
    params?: PaginationParams & { status?: string }
  ): Promise<{ projects: CampaignApplication[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{
      projects: CampaignApplication[];
      pagination: any;
    }>(`/api/my/applications${queryString}`);
    return response.data;
  }

  async getActiveProjects(): Promise<CampaignApplication[]> {
    const response = await this.client.get<CampaignApplication[]>(
      '/api/my/applications?status=ACCEPTED'
    );
    return response.data;
  }

  async getPendingBids(): Promise<CampaignApplication[]> {
    const response = await this.client.get<CampaignApplication[]>(
      '/api/my/applications?status=PENDING'
    );
    return response.data;
  }

  async getCompletedProjects(): Promise<CampaignApplication[]> {
    const response = await this.client.get<CampaignApplication[]>(
      '/api/my/applications?status=COMPLETED'
    );
    return response.data;
  }

  async bidOnProject(
    gigId: string,
    bidData: {
      proposedRate?: number;
      coverLetter?: string;
      timeline?: string;
      projectScope?: string;
      technicalRequirements?: string[];
      equipmentNeeded?: string[];
      portfolioLinks?: string[];
    }
  ): Promise<void> {
    await this.client.post(`/api/gig/${gigId}/apply`, bidData);
  }

  async withdrawBid(applicationId: string): Promise<void> {
    await this.client.delete(`/api/gig/applications/${applicationId}`);
  }

  async updateBid(
    applicationId: string,
    data: Partial<CampaignApplication>
  ): Promise<CampaignApplication> {
    const response = await this.client.put<CampaignApplication>(
      `/api/gig/applications/${applicationId}`,
      data
    );
    return response.data;
  }

  // Project Delivery & Timeline
  async getProjectTimeline(projectId: string): Promise<any> {
    const response = await this.client.get<any>(
      `/api/gig/${projectId}/timeline`
    );
    return response.data;
  }

  async submitDeliverable(
    projectId: string,
    deliverable: {
      type: string;
      description: string;
      files?: File[];
      notes?: string;
    }
  ): Promise<any> {
    const response = await this.client.post<any>(
      `/api/gig/${projectId}/deliverable`,
      deliverable
    );
    return response.data;
  }

  async getProjectMilestones(projectId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(
      `/api/gig/${projectId}/milestones`
    );
    return response.data;
  }

  async updateMilestone(
    projectId: string,
    milestoneId: string,
    data: { status: string; notes?: string }
  ): Promise<any> {
    const response = await this.client.put<any>(
      `/api/gig/${projectId}/milestones/${milestoneId}`,
      data
    );
    return response.data;
  }

  // Skills & Equipment Management
  async updateCrewProfile(data: {
    crewSkills?: string[];
    equipmentOwned?: string[];
    hourlyRate?: number;
    experienceLevel?: string;
    serviceCategories?: string[];
    certifications?: string[];
    availabilityStatus?: string;
  }): Promise<User> {
    const response = await this.client.put<User>(
      '/api/user/crew-profile',
      data
    );
    return response.data;
  }

  async addSkill(skill: {
    name: string;
    proficiency: number;
    category: string;
    verified?: boolean;
  }): Promise<any> {
    const response = await this.client.post<any>('/api/crew/skills', skill);
    return response.data;
  }

  async updateSkillProficiency(
    skillId: string,
    proficiency: number
  ): Promise<any> {
    const response = await this.client.put<any>(`/api/crew/skills/${skillId}`, {
      proficiency,
    });
    return response.data;
  }

  async addEquipment(equipment: {
    name: string;
    category: string;
    condition: string;
    availability: boolean;
  }): Promise<any> {
    const response = await this.client.post<any>(
      '/api/crew/equipment',
      equipment
    );
    return response.data;
  }

  async getSkillAssessments(): Promise<any[]> {
    const response = await this.client.get<any[]>(
      '/api/crew/skill-assessments'
    );
    return response.data;
  }

  // Opportunity Discovery
  async getCrewOpportunities(
    params?: PaginationParams & { skill?: string; urgency?: string }
  ): Promise<{ opportunities: CrewOpportunity[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{
      opportunities: CrewOpportunity[];
      pagination: any;
    }>(`/api/crew/opportunities${queryString}`);
    return response.data;
  }

  async getRecommendedProjects(
    params?: PaginationParams
  ): Promise<{ projects: Gig[]; pagination: any }> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const response = await this.client.get<{
      projects: Gig[];
      pagination: any;
    }>(`/api/gig/crew/recommended${queryString}`);
    return response.data;
  }

  async searchProjects(
    filters: SearchFilters & {
      skillRequired?: string;
      projectType?: string;
      complexity?: string;
    }
  ): Promise<{ projects: Gig[]; pagination: any }> {
    const queryString = `?${new URLSearchParams(filters as any).toString()}`;
    const response = await this.client.get<{
      projects: Gig[];
      pagination: any;
    }>(`/api/gig/crew/search${queryString}`);
    return response.data;
  }

  // Business Analytics
  async getBusinessMetrics(timeframe?: string): Promise<any> {
    const queryString = timeframe ? `?timeframe=${timeframe}` : '';
    const response = await this.client.get<any>(
      `/api/crew/business-metrics${queryString}`
    );
    return response.data;
  }

  async getRevenueAnalytics(): Promise<any> {
    const response = await this.client.get<any>('/api/crew/revenue-analytics');
    return response.data;
  }

  async getUtilizationReport(): Promise<any> {
    const response = await this.client.get<any>('/api/crew/utilization-report');
    return response.data;
  }

  async getClientAnalytics(): Promise<any> {
    const response = await this.client.get<any>('/api/crew/client-analytics');
    return response.data;
  }

  // Portfolio Management
  async getPortfolio(): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/portfolio/items');
    return response.data;
  }

  async addPortfolioItem(data: {
    title: string;
    description: string;
    category: string;
    skills: string[];
    images?: File[];
    files?: File[];
    projectUrl?: string;
    clientTestimonial?: string;
  }): Promise<any> {
    const response = await this.client.post<any>('/api/portfolio/items', data);
    return response.data;
  }

  async updatePortfolioItem(itemId: string, data: Partial<any>): Promise<any> {
    const response = await this.client.put<any>(
      `/api/portfolio/items/${itemId}`,
      data
    );
    return response.data;
  }

  async deletePortfolioItem(itemId: string): Promise<void> {
    await this.client.delete(`/api/portfolio/items/${itemId}`);
  }

  async getPortfolioAnalytics(): Promise<any> {
    const response = await this.client.get<any>('/api/portfolio/analytics');
    return response.data;
  }

  // Professional Development
  async getCertifications(): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/crew/certifications');
    return response.data;
  }

  async addCertification(certification: {
    name: string;
    issuer: string;
    dateEarned: string;
    expiryDate?: string;
    credentialUrl?: string;
    skills: string[];
  }): Promise<any> {
    const response = await this.client.post<any>(
      '/api/crew/certifications',
      certification
    );
    return response.data;
  }

  async getSkillGapAnalysis(): Promise<any> {
    const response = await this.client.get<any>('/api/crew/skill-gap-analysis');
    return response.data;
  }

  async getLearningRecommendations(): Promise<any[]> {
    const response = await this.client.get<any[]>(
      '/api/crew/learning-recommendations'
    );
    return response.data;
  }

  // Market Insights
  async getMarketRates(skill?: string): Promise<any> {
    const queryString = skill ? `?skill=${skill}` : '';
    const response = await this.client.get<any>(
      `/api/crew/market-rates${queryString}`
    );
    return response.data;
  }

  async getIndustryTrends(): Promise<any> {
    const response = await this.client.get<any>('/api/crew/industry-trends');
    return response.data;
  }

  async getCompetitorAnalysis(): Promise<any> {
    const response = await this.client.get<any>(
      '/api/crew/competitor-analysis'
    );
    return response.data;
  }
}

// Main API client instance factory
export function createAPIClient(config: APIClientConfig) {
  const client = new APIClient(config);

  return {
    // Expose core HTTP methods directly
    get: client.get.bind(client),
    post: client.post.bind(client),
    put: client.put.bind(client),
    patch: client.patch.bind(client),
    delete: client.delete.bind(client),
    uploadFile: client.uploadFile.bind(client),
    clearCache: client.clearCache.bind(client),

    // Legacy methods for compatibility
    setAuthTokens: client.setAuthTokens.bind(client),
    clearAuthTokens: client.clearAuthTokens.bind(client),
    getAccessToken: client.getAccessToken.bind(client),
    getRefreshToken: client.getRefreshToken.bind(client),

    // Service instances
    client,
    auth: new AuthService(client),
    users: new UserService(client),
    gigs: new GigService(client),
    clans: new ClanService(client),
    credits: new CreditService(client),
    notifications: new NotificationService(client),
    socialMedia: new SocialMediaService(client),
    reputation: new ReputationService(client),
    workHistory: new WorkHistoryService(client),
    analytics: new AnalyticsService(client),
    influencer: new InfluencerService(client),
    crew: new CrewService(client),
  };
}

export type APIClientInstance = ReturnType<typeof createAPIClient>;

// Export types for use in other packages
export type {
  APISuccessResponse,
  APIErrorResponse,
  User,
  LoginRequest,
  RegisterRequest,
  TokenPair,
  Gig,
  Clan,
  CreditWallet,
  CreditTransaction,
  ReputationScore,
  Notification,
  SocialMediaHandle,
  PaginationParams,
  SearchFilters,
  InfluencerDashboardMetrics,
  CrewDashboardMetrics,
  SocialMediaAnalytics,
  CampaignApplication,
  WorkHistoryItem,
  BrandRecommendation,
  CrewOpportunity,
} from '@50brains/shared-types';

export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse;
