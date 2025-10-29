'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  urgent?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  urgent = false,
  loading = false,
  onClick,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return (val || 0).toLocaleString() ?? 0;
    }
    return val;
  };

  const cardClassName = ` border-1px border-gray-800
    card-glass dashboard-card-padding transition-all duration-200 hover:shadow-lg
    ${urgent ? 'border-l-4 border-red-500' : ''}
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
  `.trim();

  if (loading) {
    return (
      <div className={cardClassName}>
        <div className="animate-pulse">
          <div className="mb-mobile flex items-center justify-between">
            <div className="h-4 w-20 rounded bg-gray-300"></div>
            <div className="h-8 w-8 rounded bg-gray-300"></div>
          </div>
          <div className="h-8 w-16 rounded bg-gray-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName} onClick={onClick}>
      <div className="mb-mobile flex items-center justify-between">
        <h3 className="text-muted text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        <span className="text-2xl">{icon}</span>
      </div>

      <div className="flex items-end justify-between">
        <div className="text-heading text-2xl font-bold">
          {formatValue(value)}
        </div>

        {trend !== undefined && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend > 0
                ? 'text-green-600'
                : trend < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
            }`}
          >
            {trend > 0 ? '↗️' : trend < 0 ? '↘️' : '➡️'}
            <span className="ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {urgent && (
        <div className="mt-2 text-xs font-medium text-red-600">
          Requires attention
        </div>
      )}
    </div>
  );
};
