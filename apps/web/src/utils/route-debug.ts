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

  private static emergencyMode = false;
  private static emergencyActivatedAt = 0;

  static log(
    event: string,
    pathname: string,
    isAuthenticated: boolean,
    isLoading: boolean,
    source: string
  ) {
    // If emergency mode is active, don't log redirects
    if (
      this.emergencyMode &&
      (event.includes('redirect') || event.includes('Redirect'))
    ) {
      console.warn(
        '🚫 [RouteDebugger] Emergency mode active - blocking redirect logging'
      );
      return;
    }

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
    // If emergency mode is active for less than 30 seconds, keep it active
    if (this.emergencyMode && Date.now() - this.emergencyActivatedAt < 30000) {
      console.warn(
        '🚫 [RouteDebugger] Emergency mode still active, blocking all redirects'
      );
      return true;
    } else if (this.emergencyMode) {
      // Reset emergency mode after 30 seconds
      console.log('🔄 [RouteDebugger] Emergency mode expired, resetting...');
      this.emergencyMode = false;
      this.emergencyActivatedAt = 0;
    }

    // Check for rapid alternating redirects in the last 10 seconds
    const now = Date.now();
    const recentLogs = this.logs.filter((log) => now - log.timestamp < 10000);

    const redirectLogs = recentLogs.filter(
      (log) => log.event.includes('redirect') || log.event.includes('Redirect')
    );

    // More sophisticated loop detection - require 4+ redirects and check for ping-pong pattern
    if (redirectLogs.length >= 4) {
      const paths = redirectLogs.map((log) => log.pathname);
      const uniquePaths = Array.from(new Set(paths));

      // Check for ping-pong pattern between 2 routes (login <-> dashboard)
      if (uniquePaths.length === 2 && redirectLogs.length >= 4) {
        // Check if it's actually alternating between the two paths
        const isAlternating = redirectLogs.every((log, index) => {
          if (index === 0) return true;
          const prevPath = redirectLogs[index - 1].pathname;
          return log.pathname !== prevPath;
        });

        if (isAlternating) {
          console.error(
            '🚨 [RouteDebugger] Redirect loop detected! Activating emergency mode.',
            {
              paths: uniquePaths,
              redirectCount: redirectLogs.length,
              logs: redirectLogs,
              pattern: 'alternating',
            }
          );

          // Activate emergency mode
          this.emergencyMode = true;
          this.emergencyActivatedAt = Date.now();

          // Clear logs to reset the detection
          this.clear();
          return true;
        }
      }
    }

    return false;
  }

  static isEmergencyMode() {
    return this.emergencyMode;
  }

  static resetEmergencyMode() {
    this.emergencyMode = false;
    this.emergencyActivatedAt = 0;
    console.log('🔄 [RouteDebugger] Emergency mode manually reset');
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).RouteDebugger = RouteDebugger;
  (window as any).resetRouteEmergency = () => {
    RouteDebugger.resetEmergencyMode();
    console.log('🔄 Emergency mode reset from console');
  };
}
