'use client';

import React, { useState } from 'react';
import { useWorkHistory } from '@/hooks/useWorkHistory';

interface PortfolioProps {
  userId?: string;
  showPublicOnly?: boolean;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  userId,
  showPublicOnly = true
}) => {
  const { portfolio, loading, error } = useWorkHistory(userId);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredPortfolio = portfolio.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (showPublicOnly && !item.isPublic) return false;
    return true;
  });

  const categories = Array.from(new Set(portfolio.map(item => item.category)));
  const types = Array.from(new Set(portfolio.map(item => item.type)));

  if (loading) {
    return (
      <div className="card-glass p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center text-gray-600 mt-2">Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass p-4">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="input text-sm"
        >
          <option value="all">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolio.length === 0 ? (
        <div className="card-glass p-8 text-center">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-semibold mb-2">No Portfolio Items</h3>
          <p className="text-gray-600">No portfolio items found for the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPortfolio.map((item) => (
            <div key={item.id} className="card-glass p-4 hover:shadow-lg transition-shadow">
              {/* Media Preview */}
              {item.mediaUrls && item.mediaUrls.length > 0 && (
                <div className="mb-3 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={item.mediaUrls[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {item.category}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {item.type}
                  </span>
                </div>

                {/* Work Context */}
                <div className="text-xs text-gray-500">
                  <p>Project: {item.workContext.title}</p>
                  <p>Completed: {new Date(item.workContext.completedAt).toLocaleDateString()}</p>
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