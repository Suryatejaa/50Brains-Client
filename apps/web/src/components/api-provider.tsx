'use client';

import { createContext, useContext } from 'react';
import { createAPIClient, type APIClientInstance } from '@50brains/api-client';

const APIContext = createContext<APIClientInstance | undefined>(undefined);

export function APIProvider({ children }: { children: React.ReactNode }) {
  const apiClient = createAPIClient({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  });

  return (
    <APIContext.Provider value={apiClient}>{children}</APIContext.Provider>
  );
}

export function useAPI() {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
}
