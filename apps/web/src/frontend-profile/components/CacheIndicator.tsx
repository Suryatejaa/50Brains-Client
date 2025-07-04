'use client';

// components/CacheIndicator.tsx - Shows cache status for debugging
import React, { useState, useEffect } from 'react';
import { useProfileCache } from '../hooks/useProfileCache';

interface CacheIndicatorProps {
  userId?: string;
  className?: string;
}

const CacheIndicator: React.FC<CacheIndicatorProps> = ({
  userId,
  className = 'fixed top-4 right-4 z-50',
}) => {
  const { getCacheInfo, isValidInCache } = useProfileCache();
  const [cacheInfo, setCacheInfo] = useState<{
    age: number;
    expiresIn: number;
  } | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const updateCacheInfo = () => {
      const info = getCacheInfo(userId);
      const valid = isValidInCache(userId);
      setCacheInfo(info);
      setIsValid(valid);
    };

    // Update immediately
    updateCacheInfo();

    // Update every second
    const interval = setInterval(updateCacheInfo, 1000);

    return () => clearInterval(interval);
  }, [userId, getCacheInfo, isValidInCache]);

  if (!isValid || !cacheInfo) {
    return (
      <div
        className={`${className} rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-xs`}
      >
        <div className="font-medium text-red-700">❌ No Cache</div>
      </div>
    );
  }

  const ageSeconds = Math.round(cacheInfo.age / 1000);
  const expiresInSeconds = Math.round(cacheInfo.expiresIn / 1000);

  return (
    <div
      className={`${className} rounded-lg border border-green-300 bg-green-100 px-3 py-2 text-xs`}
    >
      <div className="font-medium text-green-700">✅ Cached Data</div>
      <div className="text-green-600">Age: {ageSeconds}s</div>
      <div className="text-green-600">Expires: {expiresInSeconds}s</div>
    </div>
  );
};

export default CacheIndicator;
