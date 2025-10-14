'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { AuthProvider } from '../hooks/useAuth';
import { RoleSwitchProvider } from '../hooks/useRoleSwitch';
import { ThemeProvider } from './theme-provider';
import { APIProvider } from './api-provider';
import { NotificationProvider } from './NotificationProvider';
import { NotificationToast } from './NotificationToast';
import { LayoutWrapper } from './layout/LayoutWrapper';
import { RouteGuard } from './auth/RouteGuard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes (increased from 5)
      gcTime: 20 * 60 * 1000, // 20 minutes (increased from 10)
      retry: 1, // Reduced from 3
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Prevent refetch on component mount
      refetchOnReconnect: false, // Prevent refetch on network reconnect
      refetchInterval: false, // Disable automatic polling
      refetchIntervalInBackground: false, // Disable background polling
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
              <NotificationProvider>
                <NotificationToast enabled={true} />
                <RouteGuard>
                  <LayoutWrapper>{children}</LayoutWrapper>
                </RouteGuard>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 2000,
                    style: {
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    },
                  }}
                />
              </NotificationProvider>
            </RoleSwitchProvider>
          </AuthProvider>
        </APIProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
