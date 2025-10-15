'use client';

import React, { useState } from 'react';
import { useWorkHistory } from '@/hooks/useWorkHistory';

interface PortfolioProps {
  userId?: string;
  showPublicOnly?: boolean;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  userId,
  showPublicOnly = true,
}) => {
  const { portfolio, loading, error } = useWorkHistory(userId);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredPortfolio = portfolio.filter((item) => {
    if (
      selectedCategory !== 'all' &&
      item.workContext.category !== selectedCategory
    )
      return false;
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (showPublicOnly && !item.isPublic) return false;
    return true;
  });

  const categories = Array.from(
    new Set(portfolio.map((item) => item.workContext.category))
  );
  const types = Array.from(new Set(portfolio.map((item) => item.type)));

  if (loading) {
    return (
      <div className="card-glass p-1">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <p className="mt-2 text-center text-gray-600">Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass p-1">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Filters */}
      <div className="flex flex-wrap gap-1">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="input text-sm"
        >
          <option value="all">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolio.length === 0 ? (
        <div className="card-glass p-1 text-center">
          <div className="mb-1 text-4xl">📁</div>
          <h3 className="mb-1 text-lg font-semibold">No Portfolio Items</h3>
          <p className="text-gray-600">
            No portfolio items found for the selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPortfolio.map((item) => (
            <div
              key={item.id}
              className="card-glass p-1 transition-shadow hover:shadow-lg"
            >
              {/* Media Preview */}
              {(item.thumbnailUrl || item.url !== '#') && (
                <div className="mb-1 h-48 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="mb-1 line-clamp-2 text-sm text-gray-600">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="mb-1 flex flex-wrap gap-1">
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    {item.workContext.category}
                  </span>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                    {item.type}
                  </span>
                </div>

                {/* Work Context */}
                <div className="text-xs text-gray-500">
                  <p>Project: {item.workContext.title}</p>
                  <p>
                    Completed:{' '}
                    {new Date(
                      item.workContext.completedAt
                    ).toLocaleDateString()}
                  </p>
                  {item.workContext.clientRating && (
                    <p>Rating: ⭐ {item.workContext.clientRating}/5</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
