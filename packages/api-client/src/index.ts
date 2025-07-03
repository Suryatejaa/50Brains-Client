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
} from '@50brains/shared-types';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
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

  constructor(config: APIClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Note: We rely on cookies for authentication, so no Authorization header needed
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

      if (!response.ok) {
        const error: APIErrorResponse = await response.json();
        throw new APIError(
          error.statusCode,
          error.error,
          error.message,
          error.details
        );
      }

      const data: APISuccessResponse<T> = await response.json();

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

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError(408, 'TIMEOUT', 'Request timeout');
      }

      throw new APIError(500, 'NETWORK_ERROR', 'Network error occurred');
    }
  }

  async get<T>(
    endpoint: string,
    useCache = true
  ): Promise<APISuccessResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, useCache);
  }

  async post<T>(endpoint: string, data?: any): Promise<APISuccessResponse<T>> {
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

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const response = await this.client.post<TokenPair>('/api/auth/refresh', {
      refreshToken,
    });
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
      `/api/gig/my-gigs${queryString}`
    );
    return response.data;
  }

  async getMyApplications(
    params?: PaginationParams
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
    const response = await this.client.post<Clan>('/api/clan', clanData);
    return response.data;
  }

  async getClanById(clanId: string): Promise<Clan> {
    const response = await this.client.get<Clan>(`/api/clan/${clanId}`);
    return response.data;
  }

  async updateClan(clanId: string, data: Partial<Clan>): Promise<Clan> {
    const response = await this.client.put<Clan>(`/api/clan/${clanId}`, data);
    return response.data;
  }

  async deleteClan(clanId: string): Promise<void> {
    await this.client.delete(`/api/clan/${clanId}`);
  }

  async getClanMembers(clanId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/members/${clanId}`);
    return response.data;
  }

  async inviteMember(data: {
    clanId: string;
    userId: string;
    role?: string;
  }): Promise<void> {
    await this.client.post('/api/members/invite', data);
  }

  async updateMemberRole(
    clanId: string,
    userId: string,
    role: string
  ): Promise<void> {
    await this.client.put(`/api/members/${clanId}/members/${userId}/role`, {
      role,
    });
  }

  async removeMember(clanId: string, userId: string): Promise<void> {
    await this.client.delete(`/api/members/${clanId}/members/${userId}`);
  }

  async leaveClan(clanId: string): Promise<void> {
    await this.client.post(`/api/members/${clanId}/leave`);
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
    }>(`/api/notifications${queryString}`);
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.client.put(`/api/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await this.client.put('/api/notifications/read-all');
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.client.delete(`/api/notifications/${notificationId}`);
  }
}

// Main API client instance factory
export function createAPIClient(config: APIClientConfig) {
  const client = new APIClient(config);

  return {
    client,
    auth: new AuthService(client),
    users: new UserService(client),
    gigs: new GigService(client),
    clans: new ClanService(client),
    credits: new CreditService(client),
    notifications: new NotificationService(client),
  };
}

export type APIClientInstance = ReturnType<typeof createAPIClient>;
