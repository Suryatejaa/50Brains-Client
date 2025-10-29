// components/optimized/LazyComponent.tsx
import { lazy, Suspense, useState, useEffect } from 'react';

// Lazy load heavy components with correct named exports
export const LazyGigManagement = lazy(() =>
  import('../dashboard/brand/GigManagement').then((module) => ({
    default: module.GigManagement,
  }))
);

export const LazyApplicationManagement = lazy(() =>
  import('../dashboard/brand/ApplicationManagement').then((module) => ({
    default: module.ApplicationManagement,
  }))
);

export const LazyProfileCompletion = lazy(() =>
  import('../ProfileCompletionWidget').then((module) => ({
    default: module.ProfileCompletionWidget,
  }))
);

export const LazyNotificationCenter = lazy(() =>
  import('../NotificationBell').then((module) => ({
    default: module.default,
  }))
);

// Wrapper component for lazy loading with skeleton
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function LazyWrapper({
  children,
  fallback,
  className,
}: LazyWrapperProps) {
  const defaultFallback = (
    <div className={`animate-pulse ${className || ''}`}>
      <div className="h-20 rounded bg-gray-200"></div>
    </div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
}

// Progressive loading HOC
export function withProgressiveLoading<T extends object>(
  Component: React.ComponentType<T>,
  priority: 'high' | 'medium' | 'low' = 'medium'
) {
  return function ProgressiveComponent(props: T) {
    const [shouldLoad, setShouldLoad] = useState(priority === 'high');

    useEffect(() => {
      if (priority === 'high') return;

      const timeout = setTimeout(
        () => {
          setShouldLoad(true);
        },
        priority === 'medium' ? 100 : 300
      );

      return () => clearTimeout(timeout);
    }, [priority]);

    if (!shouldLoad) {
      return (
        <div className="animate-pulse">
          <div className="h-16 rounded bg-gray-200"></div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
