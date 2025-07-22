'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function AuthTestPage() {
  const { user, isAuthenticated, isLoading, login, logout, error } = useAuth();
  const [credentials, setCredentials] = useState({
    email: 'demo@50brains.com',
    password: 'password123'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-none shadow p-3">
        <h1 className="text-2xl font-bold mb-6 text-center">Auth Test Page</h1>
        
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Current Auth State:</h2>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          {user && (
            <div className="mt-2">
              <p><strong>User:</strong> {user.displayName || user.firstName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          )}
          {error && (
            <div className="mt-2 text-red-600">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-none hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login (Demo)
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 text-green-800 rounded">
              ✅ You are logged in as {user?.displayName || user?.firstName}
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-none hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded text-sm">
          <h3 className="font-semibold mb-2">🧪 Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Login with any email/password (uses demo mode)</li>
            <li>Refresh the page (Ctrl+F5 or Cmd+R)</li>
            <li>Verify you stay logged in after refresh</li>
            <li>Open DevTools Console to see auth logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
