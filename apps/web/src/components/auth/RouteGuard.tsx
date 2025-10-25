'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { RouteDebugger } from '@/utils/route-debug';
import { LoadingScreen } from '@/components/ui/LoadingScreen';



interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectInProgress = useRef(false);
  const lastAuthState = useRef<boolean | null>(null);
  const authStateStableTimestamp = useRef<number>(0);

  useEffect(() => {
    // Don't redirect during initial loading to prevent flashing
    if (isLoading) {
      //console.log(('↻ RouteGuard: Still loading, skipping route check');
      return;
    }

    // Don't process redirects if in emergency mode
    if (RouteDebugger.isEmergencyMode()) {
      RouteDebugger.log(
        'EmergencyMode',
        pathname,
        isAuthenticated,
        isLoading,
        'RouteGuard'
      );
      //console.log((
      //   '🚨 RouteGuard: Emergency mode active, blocking all redirects'
      // );
      return;
    }

    // Check if auth state has changed
    if (lastAuthState.current !== isAuthenticated) {
      lastAuthState.current = isAuthenticated;
      authStateStableTimestamp.current = Date.now();
      //console.log((
      //   `🔄 Auth state changed to: ${isAuthenticated}, waiting for stability...`
      // );
      return;
    }

    // Wait for auth state to be stable for at least 500ms before making decisions
    const timeSinceChange = Date.now() - authStateStableTimestamp.current;
    if (timeSinceChange < 500) {
      //console.log((
      //   `⏳ Auth state not stable yet (${timeSinceChange}ms), waiting...`
      // );
      return;
    }

    // Prevent multiple simultaneous redirects
    if (redirectInProgress.current) {
      //console.log(('↻ RouteGuard: Redirect already in progress, skipping');
      return;
    }

    // Check for potential redirect loops - but only during the timeout phase
    // Don't check for loops on every render to avoid false positives
    const shouldCheckLoop =
      !redirectInProgress.current && timeSinceChange >= 500;

    // Add a small delay to prevent race conditions during auth state changes
    const timeoutId = setTimeout(() => {
      RouteDebugger.log(
        'RouteCheck',
        pathname,
        isAuthenticated,
        isLoading,
        'RouteGuard'
      );

      //console.log((
      //   `🔍 [RouteGuard] Checking route: ${pathname}, isAuthenticated: ${isAuthenticated}`
      // );

      // Define auth pages that authenticated users shouldn't access
      const authPages = ['/login', '/register', '/forgot-password'];

      // Define protected pages that require authentication
      const protectedPages = [
        '/dashboard',
        '/profile',
        '/credits',
        '/create-gig',
        '/my-applications',
        '/my-bids',
        '/equipment',
        '/campaigns',
        '/social-media',
        '/notifications',
        '/settings',
        '/my-gigs',
        '/applications',
        '/brand',
        '/crew',
        '/influencer',
        '/clan',
        // Note: '/marketplace', '/clans', '/gigs' are public for browsing
      ];

      // Define protected route patterns (for dynamic routes)
      const protectedPatterns = [
        /^\/gig\/[^\/]+\/applications$/, // /gig/[id]/applications
        /^\/gig\/[^\/]+\/submissions$/, // /gig/[id]/submissions
        /^\/user\/[^\/]+\/edit$/, // /user/[id]/edit
        /^\/brand\/[^\/]+\/edit$/, // /brand/[id]/edit
        /^\/clan\/[^\/]+\/manage$/, // /clan/[id]/manage
      ];

      // Check if current path is an auth page (exact matches)
      const isAuthPage =
        authPages.includes(pathname) ||
        authPages.some((page) => pathname.startsWith(page + '/'));

      // Check if current path is a protected page
      const isProtectedPage =
        protectedPages.some((page) => pathname.startsWith(page)) ||
        protectedPatterns.some((pattern) => pattern.test(pathname));

      //console.log((
      //   `🔍 [RouteGuard] isAuthPage: ${isAuthPage}, isProtectedPage: ${isProtectedPage}`
      // );

      // If user is authenticated and trying to access auth pages, redirect to dashboard
      if (isAuthenticated && isAuthPage) {
        // Special case: if user is already on dashboard, don't redirect
        if (pathname === '/dashboard') {
          //console.log((
          //   '✅ [RouteGuard] User authenticated and on dashboard, allowing access'
          // );
          return;
        }

        RouteDebugger.log(
          'RedirectToDashboard',
          pathname,
          isAuthenticated,
          isLoading,
          'RouteGuard'
        );
        //console.log((
        //   `🔒 [RouteGuard] Authenticated user (${isAuthenticated}) accessing auth page (${pathname}), redirecting to dashboard`
        // );

        // Check for loops before redirecting (only if we should check)
        if (shouldCheckLoop && RouteDebugger.detectLoop()) {
          console.error(
            '🚨 Emergency mode activated - stopping redirect to dashboard'
          );
          return;
        }

        redirectInProgress.current = true;
        //console.log(('🚀 [RouteGuard] Starting redirect to /dashboard');

        // Use router.replace instead of window.location for smoother experience
        router.replace('/dashboard');
        return;
      }

      // If user is not authenticated and trying to access protected pages, redirect appropriately
      if (!isAuthenticated && isProtectedPage) {
        RouteDebugger.log(
          'RedirectUnauthenticated',
          pathname,
          isAuthenticated,
          isLoading,
          'RouteGuard'
        );

        // Special case: if accessing dashboard without auth, redirect to home page for better UX
        if (pathname === '/dashboard') {
          //console.log((
          //   `🏠 [RouteGuard] Unauthenticated user accessing dashboard (${pathname}), redirecting to home page`
          // );

          // Check for loops before redirecting (only if we should check)
          if (shouldCheckLoop && RouteDebugger.detectLoop()) {
            console.error(
              '🚨 Emergency mode activated - stopping redirect to home'
            );
            return;
          }

          redirectInProgress.current = true;
          //console.log(('🚀 [RouteGuard] Starting redirect to /');

          // Redirect to home page instead of login for better new user experience
          router.replace('/');
          return;
        }

        // For other protected pages, redirect to login
        //console.log((
        //   `🔒 [RouteGuard] Unauthenticated user (${isAuthenticated}) accessing protected page (${pathname}), redirecting to login`
        // );

        // Check for loops before redirecting (only if we should check)
        if (shouldCheckLoop && RouteDebugger.detectLoop()) {
          console.error(
            '🚨 Emergency mode activated - stopping redirect to login'
          );
          return;
        }

        // Save the current path to redirect back after login
        if (typeof window !== 'undefined') {
          localStorage.setItem('authRedirectUrl', pathname);
        }
        redirectInProgress.current = true;
        //console.log(('🚀 [RouteGuard] Starting redirect to /login');

        // Use router.replace instead of window.location for smoother experience
        router.replace('/login');
        return;
      }
      //console.log((`✅ [RouteGuard] Route access allowed for ${pathname}`);
    }, 200); // Increased delay for more stability

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, isLoading, pathname]); // Keep all dependencies for proper tracking

  // Reset redirect flag when pathname changes (redirect completes)
  useEffect(() => {
    redirectInProgress.current = false;
  }, [pathname]);

  // Conditional rendering without early return to maintain hook order
  if (isLoading) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {/* Brain Icon Container */}
        <div className="relative mb-6">                         
          {/* Spinning Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          
          {/* Brain Icon (or '50' Number) */}
          <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
            <span className="text-3xl font-bold text-blue-600">50</span>
          </div>
        </div>
        
        {/* Brand Name */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          50BraIns
        </h2>
        <p className="text-sm text-gray-500">Connecting brands & influencers...</p>
      </div>
    </div>
  );
}

// if (isLoading) {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
//       <div className="text-center">
//         {/* Logo/Brand */}
//         <div className="mb-8">
//           <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
//             50BraIns
//           </h1>
//           <p className="text-sm text-gray-500">Influencer Marketing Platform</p>
//         </div>
        
//         {/* Dots Animation */}
//         <div className="flex gap-2 justify-center">
//           <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0ms' }}></div>
//           <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce-dot" style={{ animationDelay: '150ms' }}></div>
//           <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce-dot" style={{ animationDelay: '300ms' }}></div>
//         </div>
//       </div>
//     </div>
//   );
// }

// if (isLoading) {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
//       <div className="text-center">
//         {/* Logo Container with Circular Progress */}
//         <div className="relative inline-block mb-6">
//           {/* Circular Progress */}
//           <svg className="w-24 h-24 animate-spin-slow" viewBox="0 0 100 100">
//             <circle
//               cx="50"
//               cy="50"
//               r="45"
//               fill="none"
//               stroke="#e5e7eb"
//               strokeWidth="6"
//             />
//             <circle
//               cx="50"
//               cy="50"
//               r="45"
//               fill="none"
//               stroke="#14b8a6"
//               strokeWidth="6"
//               strokeDasharray="283"
//               strokeDashoffset="75"
//               strokeLinecap="round"
//               className="animate-dash"
//             />
//           </svg>
          
//           {/* Logo/Brand in Center */}
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
//               <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
//                 50
//               </span>
//             </div>
//           </div>
//         </div>
        
//         {/* Brand Text */}
//         <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
//           50BraIns
//         </h2>
//         <p className="text-sm text-gray-500">Loading your dashboard...</p>
//       </div>
//     </div>
//   );
// }

// if (isLoading) {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
//       <div className="text-center px-4">
//         {/* Logo Badge with Spinner */}
//         <div className="relative inline-block mb-6">
//           {/* Outer spinning ring */}
//           <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-500 animate-spin"></div>
          
//           {/* Logo Container */}
//           <div className="relative bg-white dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center shadow-xl">
//             <div className="text-center">
//               <span className="block text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
//                 50
//               </span>
//               <span className="block text-[10px] font-semibold text-gray-500 -mt-1">
//                 BraIns
//               </span>
//             </div>
//           </div>
//         </div>
        
//         {/* Brand Title */}
//         <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
//           50BraIns
//         </h1>
        
//         {/* Subtitle */}
//         <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//           Connecting Brands & Influencers
//         </p>
        
//         {/* Loading Progress */}
//         <div className="w-48 mx-auto">
//           <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 animate-loading-bar"></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// if (isLoading) {
//   return <LoadingScreen message="Verifying authentication..." />;
// }

  return <>{children}</>;
};
