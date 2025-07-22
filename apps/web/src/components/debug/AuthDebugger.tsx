'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';

export function AuthDebugger() {
  const { user, isLoading: authLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      cookies: typeof window !== 'undefined' ? document.cookie : 'N/A (server)',
      userFromAuth: user,
      tests: {},
    };

    try {
      // Test 1: Auth status
      console.log('🔍 Testing auth status...');
      try {
        const authTest = await apiClient.get('/api/auth/me');
        results.tests.authTest = authTest;
      } catch (error: any) {
        results.tests.authTest = { error: error?.message || 'Unknown error' };
      }

      // Test 2: Direct API calls
      console.log('🔍 Testing /api/user/profile...');
      try {
        const authMeResponse = await apiClient.get('/api/user/profile');
        results.tests.authMe = authMeResponse;
      } catch (error: any) {
        results.tests.authMe = { error: error?.message || 'Unknown error' };
      }

      console.log('🔍 Testing /api/user/profile...');
      try {
        const profileResponse = await apiClient.get('/api/user/profile');
        results.tests.userProfile = profileResponse;
      } catch (error: any) {
        results.tests.userProfile = {
          error: error?.message || 'Unknown error',
        };
      }

      // Test 3: Check base URLs and config
      results.config = {
        baseURL:
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
        currentURL:
          typeof window !== 'undefined' ? window.location.href : 'N/A',
      };
    } catch (error: any) {
      results.error = error?.message || 'Unknown error';
      console.error('Debug test failed:', error);
    }

    setDebugInfo(results);
    setIsLoading(false);
  };

  return (
    <div className="mb-6 rounded-none border-2 border-yellow-200 bg-yellow-50 p-4">
      <div className="mb-4 flex items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-800">
          Auth Debug Tool
        </h3>
        <button
          onClick={runTests}
          disabled={isLoading}
          className="ml-auto flex items-center space-x-2 rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Testing...' : 'Run Tests'}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-yellow-800">Auth Hook Status</h4>
            <div className="mt-1 text-sm">
              <div className="flex items-center space-x-2">
                {authLoading ? (
                  <Info className="h-4 w-4 text-blue-500" />
                ) : user ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {authLoading
                    ? 'Loading...'
                    : user
                      ? `Logged in as: ${user.email}`
                      : 'Not logged in'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-yellow-800">Cookies</h4>
            <div className="mt-1 break-all text-sm text-gray-600">
              {typeof window !== 'undefined'
                ? document.cookie || 'No cookies'
                : 'Server-side'}
            </div>
          </div>
        </div>

        {debugInfo && (
          <div>
            <h4 className="font-medium text-yellow-800">Test Results</h4>
            <pre className="mt-2 max-h-96 overflow-auto rounded border bg-white p-3 text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
