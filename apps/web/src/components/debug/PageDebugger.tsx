'use client';

import { useState } from 'react';

interface PageDebuggerProps {
  pageName: string;
  routePath: string;
  children?: React.ReactNode;
}

export function PageDebugger({
  pageName,
  routePath,
  children,
}: PageDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return (
    <>
      {/* Debug Panel Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-brand-primary hover:bg-brand-primary/90 fixed right-4 top-4 z-50 rounded-none px-3 py-2 text-sm font-medium text-white shadow-lg transition-all"
        title="Toggle Debug Panel"
      >
        🐛 Debug
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="border-brand-border fixed right-4 top-16 z-40 max-h-96 w-80 overflow-y-auto rounded-none border bg-white p-4 shadow-lg">
          <div className="space-y-3">
            <div className="border-b pb-2">
              <h3 className="text-brand-text-main font-semibold">
                Page Debug Info
              </h3>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-brand-text-main font-medium">Page:</span>
                <span className="text-brand-text-muted ml-2">{pageName}</span>
              </div>

              <div>
                <span className="text-brand-text-main font-medium">Route:</span>
                <span className="text-brand-text-muted ml-2">{routePath}</span>
              </div>

              <div>
                <span className="text-brand-text-main font-medium">URL:</span>
                <span className="text-brand-text-muted ml-2 break-all">
                  {typeof window !== 'undefined' ? window.location.href : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-brand-text-main font-medium">
                  Environment:
                </span>
                <span className="text-brand-text-muted ml-2">
                  {process.env.NODE_ENV || 'development'}
                </span>
              </div>
            </div>

            <div className="border-t pt-2">
              <h4 className="text-brand-text-main mb-2 font-medium">
                Quick Actions
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-brand-light-blue/20 hover:bg-brand-light-blue/40 w-full rounded px-2 py-1 text-left text-sm transition-colors"
                >
                  🔄 Reload Page
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="bg-brand-light-blue/20 hover:bg-brand-light-blue/40 w-full rounded px-2 py-1 text-left text-sm transition-colors"
                >
                  🏠 Go Home
                </button>
                <button
                  onClick={() =>
                    console.log('Page Debug Info:', {
                      pageName,
                      routePath,
                      url: window.location.href,
                    })
                  }
                  className="bg-brand-light-blue/20 hover:bg-brand-light-blue/40 w-full rounded px-2 py-1 text-left text-sm transition-colors"
                >
                  📝 Log to Console
                </button>
              </div>
            </div>

            <div className="border-t pt-2">
              <h4 className="text-brand-text-main mb-2 font-medium">
                Navigation
              </h4>
              <div className="space-y-1">
                <a
                  href="/"
                  className="text-brand-primary block text-sm hover:underline"
                >
                  → Home
                </a>
                <a
                  href="/login"
                  className="text-brand-primary block text-sm hover:underline"
                >
                  → Login
                </a>
                <a
                  href="/register"
                  className="text-brand-primary block text-sm hover:underline"
                >
                  → Register
                </a>
                <a
                  href="/dashboard"
                  className="text-brand-primary block text-sm hover:underline"
                >
                  → Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      {children}
    </>
  );
}
