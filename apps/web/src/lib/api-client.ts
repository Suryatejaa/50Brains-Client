'use client';

import { createAPIClient } from '@50brains/api-client';

// Create and export the API client instance with comprehensive services
export const apiClient = createAPIClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
});

// Re-export types for convenience
export type {
  APIResponse,
  APISuccessResponse,
  APIErrorResponse,
} from '@50brains/api-client';
