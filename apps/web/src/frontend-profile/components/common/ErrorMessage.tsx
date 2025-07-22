import React from 'react';

interface ErrorMessageProps {
  title: string;
  message: string;
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  showRetry = false,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-red-100">
        <svg
          className="h-6 w-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 text-gray-600">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center rounded-none border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
