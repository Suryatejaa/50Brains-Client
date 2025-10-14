// components/reputation/ReputationCacheIndicator.tsx - Cache debug indicator for reputation
'use client';

import React from 'react';

interface ReputationCacheIndicatorProps {
  userId: string;
  cacheInfo: { age: number; expiresIn: number } | null;
  onForceRefresh: () => void;
  className?: string;
}

const ReputationCacheIndicator: React.FC<ReputationCacheIndicatorProps> = ({
  userId,
  cacheInfo,
  onForceRefresh,
  className = 'absolute top-2 right-2 z-10',
}) => {
  if (!cacheInfo) {
    return (
      <div className={`${className} flex flex-col gap-1`}>
        <div className="rounded border border-red-300 bg-red-100 px-2 py-1 text-xs text-red-700">
          ❌ No Cache
        </div>
        <button
          onClick={onForceRefresh}
          className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
          title="Force refresh reputation"
        >
          ↻ Refresh
        </button>
      </div>
    );
  }

  const ageSeconds = Math.round(cacheInfo.age / 1000);
  const expiresInSeconds = Math.round(cacheInfo.expiresIn / 1000);
  const isExpiring = expiresInSeconds < 60; // Show warning if expires in < 1 minute

  return (
    <div className={`${className} flex flex-col gap-1`}>
      <div
        className={`rounded border px-2 py-1 text-xs ${isExpiring
          ? 'border-yellow-300 bg-yellow-100 text-yellow-700'
          : 'border-green-300 bg-green-100 text-green-700'
          }`}
      >
        <div className="font-medium">
          {isExpiring ? '⚠️' : '✅'} Reputation Cache
        </div>
        <div>Age: {ageSeconds}s</div>
        <div>Expires: {expiresInSeconds}s</div>
      </div>
      <button
        onClick={onForceRefresh}
        className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
        title="Force refresh reputation"
      >
        ↻ Refresh
      </button>
    </div>
  );
};

export default ReputationCacheIndicator;
