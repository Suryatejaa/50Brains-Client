'use client';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="card-glass p-8">
          <div className="mb-6">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
              <span className="text-3xl">🚫</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              404
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              Sorry, the page you're looking for doesn't exist or is still under development.
            </p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => window.history.back()} 
              className="btn-secondary w-full"
            >
              ← Go Back
            </button>
            <a 
              href="/dashboard" 
              className="btn-primary w-full inline-block"
            >
              Go to Dashboard
            </a>
            <a 
              href="/" 
              className="btn-outline w-full inline-block"
            >
              Go to Home
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
