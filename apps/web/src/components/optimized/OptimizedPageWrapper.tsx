// components/optimized/OptimizedPageWrapper.tsx
'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { DashboardSkeleton } from '../skeletons/DashboardSkeleton';

interface OptimizedPageWrapperProps {
  children: React.ReactNode;
  pageType:
    | 'dashboard'
    | 'marketplace'
    | 'profile'
    | 'gig'
    | 'applications'
    | 'submissions'
    | 'bids'
    | 'notifications';
  className?: string;
  enablePreload?: boolean;
  enableSkeleton?: boolean;
}

// Simple loading state management
const useOptimizedLoading = (pageType: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate optimized data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Quick loading simulation

    return () => clearTimeout(timer);
  }, [pageType]);

  const preloadData = async () => {
    try {
      // Add preloading logic here
      console.log(`Preloading data for ${pageType}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loading error');
    }
  };

  return { isLoading, error, preloadData };
};

export const OptimizedPageWrapper: React.FC<OptimizedPageWrapperProps> = ({
  children,
  pageType,
  className = '',
  enablePreload = true,
  enableSkeleton = true,
}) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(enableSkeleton);

  // Use our optimized loading hook
  const { isLoading, error, preloadData } = useOptimizedLoading(pageType);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (enablePreload) {
      preloadData();
    }
  }, [enablePreload, preloadData]);

  // Show skeleton during initial load and data fetching
  useEffect(() => {
    if (!isInitialLoad && !isLoading) {
      const hideTimer = setTimeout(() => {
        setShowSkeleton(false);
      }, 200);
      return () => clearTimeout(hideTimer);
    }
  }, [isInitialLoad, isLoading]);

  if (showSkeleton && (isInitialLoad || isLoading)) {
    return (
      <div className={`optimized-page-wrapper ${className}`}>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`optimized-page-wrapper error-state ${className}`}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-red-600">⚠️ Loading Error</div>
            <p className="mb-4 text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`optimized-page-wrapper loaded ${className}`}>
      <Suspense fallback={<DashboardSkeleton />}>
        {children}
      </Suspense>
    </div>
  );
};

// Enhanced error boundary for performance monitoring
export class OptimizedErrorBoundary extends React.Component<
  { children: React.ReactNode; pageType: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; pageType: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Performance Error in ${this.props.pageType}:`,
      error,
      errorInfo
    );

    // Optional: Send to monitoring service
    if (typeof window !== 'undefined') {
      try {
        // Example: Analytics tracking for performance issues
        (window as any).gtag?.('event', 'page_error', {
          page_type: this.props.pageType,
          error_message: error.message,
        });
      } catch (e) {
        // Ignore analytics errors
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold text-red-600">
              Something went wrong
            </h2>
            <p className="mb-4 text-gray-600">
              We're sorry, but there was an error loading this page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance monitoring hook
export const usePerformanceMonitoring = (pageType: string) => {
  useEffect(() => {
    const startTime = performance.now();

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`${pageType} Performance:`, entry.name, entry.duration);
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      performance.mark(`${pageType}-load-end`);
      performance.measure(
        `${pageType}-total-load`,
        `${pageType}-load-start`,
        `${pageType}-load-end`
      );

      // Log performance metrics
      console.log(`${pageType} total load time:`, loadTime);

      observer.disconnect();
    };
  }, [pageType]);
};
