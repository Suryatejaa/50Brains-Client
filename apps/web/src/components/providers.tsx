'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { AuthProvider } from '../hooks/useAuth';
import { RoleSwitchProvider } from '../hooks/useRoleSwitch';
import { ThemeProvider } from './theme-provider';
import { APIProvider } from './api-provider';
import { LayoutWrapper } from './layout/LayoutWrapper';
import { RouteGuard } from './auth/RouteGuard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <APIProvider>
          <AuthProvider>
            <RoleSwitchProvider>
              <RouteGuard>
                <LayoutWrapper>{children}</LayoutWrapper>
              </RouteGuard>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  },
                }}
              />
            </RoleSwitchProvider>
          </AuthProvider>
        </APIProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
