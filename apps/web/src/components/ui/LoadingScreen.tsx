// components/ui/LoadingScreen.tsx
'use client';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading your workspace...' 
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center px-4">
        {/* Logo Badge with Spinner */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-900 border-t-teal-500 animate-spin w-20 h-20"></div>
          
          <div className="relative bg-white dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center shadow-xl">
            <div className="text-center">
              <span className="block text-2xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                50
              </span>
              <span className="block text-[10px] font-semibold text-gray-500 -mt-1">
                BraIns
              </span>
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          50BraIns
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Connecting Brands & Influencers
        </p>
        
        <div className="w-48 mx-auto">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 animate-loading-bar"></div>
          </div>
        </div>
        
        {message && (
          <p className="text-xs text-gray-500 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
};
