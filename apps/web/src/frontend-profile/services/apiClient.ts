// services/apiClient.ts
import { apiClient as mainApiClient } from '@/lib/api-client';

// Re-export the main API client with the same interface
export const apiClient = mainApiClient;

// For compatibility with frontend-profile components, also export the types
export type { APIResponse } from '@/lib/api-client';
