import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative mb-2">
        {/* Spinning Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500"></div>
        </div>

        {/* Brain Icon (or '50' Number) */}
        <div className="relative mx-auto flex h-10 w-10 items-center justify-center">
          <span className="text-md font-bold text-blue-600">50</span>
        </div>
      </div>
      {message && (
        <p className="text-center text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
