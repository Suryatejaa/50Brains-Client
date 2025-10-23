// Debug utility for tracking route changes and authentication state
export class RouteDebugger {
  private static logs: Array<{
    timestamp: number;
    event: string;
    pathname: string;
    isAuthenticated: boolean;
    isLoading: boolean;
    source: string;
  }> = [];

  static log(
    event: string,
    pathname: string,
    isAuthenticated: boolean,
    isLoading: boolean,
    source: string
  ) {
    const logEntry = {
      timestamp: Date.now(),
      event,
      pathname,
      isAuthenticated,
      isLoading,
      source,
    };

    this.logs.push(logEntry);

    // Keep only last 20 logs to prevent memory issues
    if (this.logs.length > 20) {
      this.logs = this.logs.slice(-20);
    }

    console.log(
      `🔍 [${source}] ${event} - Path: ${pathname}, Auth: ${isAuthenticated}, Loading: ${isLoading}`
    );
  }

  static getLogs() {
    return [...this.logs];
  }

  static clear() {
    this.logs = [];
  }

  static detectLoop() {
    // Check for rapid alternating redirects in the last 5 seconds
    const now = Date.now();
    const recentLogs = this.logs.filter((log) => now - log.timestamp < 5000);

    const redirectLogs = recentLogs.filter(
      (log) => log.event.includes('redirect') || log.event.includes('Redirect')
    );

    if (redirectLogs.length >= 4) {
      const paths = redirectLogs.map((log) => log.pathname);
      const uniquePaths = Array.from(new Set(paths));

      if (uniquePaths.length <= 2 && redirectLogs.length >= 4) {
        console.error('🚨 [RouteDebugger] Potential redirect loop detected!', {
          paths: uniquePaths,
          redirectCount: redirectLogs.length,
          logs: redirectLogs,
        });
        return true;
      }
    }

    return false;
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).RouteDebugger = RouteDebugger;
}
