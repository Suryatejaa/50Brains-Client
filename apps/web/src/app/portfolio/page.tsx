'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
  projectUrl?: string;
  tags: string[];
  clientName?: string;
  completedAt: string;
  metrics?: {
    views?: number;
    engagement?: number;
    reach?: number;
    conversions?: number;
  };
}

export default function PortfolioPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [categories, setCategories] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load portfolio items
  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/portfolio');
      
      if (response.success) {
        const items = (response.data as PortfolioItem[]) || [];
        setPortfolioItems(items);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(items.map(item => item.category).filter(Boolean))
        );
        setCategories(uniqueCategories);
      } else {
        setError('Failed to load portfolio');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    
    try {
      const response = await apiClient.delete(`/api/portfolio/${itemId}`);
      
      if (response.success) {
        setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        alert('Failed to delete portfolio item');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete portfolio item');
    }
  };

  const filteredItems = portfolioItems.filter(item => {
    if (filter === 'ALL') return true;
    return item.category === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderMetrics = (metrics?: PortfolioItem['metrics']) => {
    if (!metrics) return null;
    
    return (
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
        {metrics.views && <span>👁️ {metrics.views.toLocaleString()} views</span>}
        {metrics.engagement && <span>❤️ {metrics.engagement}% engagement</span>}
        {metrics.reach && <span>📊 {metrics.reach.toLocaleString()} reach</span>}
        {metrics.conversions && <span>🎯 {metrics.conversions} conversions</span>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-heading mb-2 text-3xl font-bold">
                  My Portfolio
                </h1>
                <p className="text-muted">
                  Showcase your best work and achievements
                </p>
              </div>
              
              <Link
                href={"/portfolio/add" as any}
                className="btn-primary mt-4 sm:mt-0"
              >
                + Add Portfolio Item
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Filters */}
            {categories.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`px-4 py-2 rounded-none text-sm font-medium transition-colors ${
                    filter === 'ALL'
                      ? 'bg-brand-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All ({portfolioItems.length})
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-4 py-2 rounded-none text-sm font-medium transition-colors ${
                      filter === category
                        ? 'bg-brand-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category} ({portfolioItems.filter(item => item.category === category).length})
                  </button>
                ))}
              </div>
            )}

            {/* Portfolio Grid */}
            {loading ? (
              <div className="card-glass p-8 text-center">
                <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
                <p className="text-muted">Loading portfolio...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {filter === 'ALL' ? 'No portfolio items yet' : `No ${filter} items`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'ALL' 
                      ? 'Start building your portfolio by adding your best work.'
                      : `You don't have any ${filter} items in your portfolio yet.`
                    }
                  </p>
                </div>
                
                {filter === 'ALL' && (
                  <Link
                    href={"/portfolio/add" as any}
                    className="btn-primary"
                  >
                    Add Your First Portfolio Item
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredItems.map((item) => (
                  <div key={item.id} className="card-glass overflow-hidden">
                    {/* Media */}
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : item.videoUrl ? (
                        <video
                          src={item.videoUrl}
                          className="w-full h-full object-cover"
                          controls
                          poster="/placeholder-video.jpg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                          <span className="text-white text-2xl">🎯</span>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-black/50 text-white rounded text-xs font-medium">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      
                      {/* Client & Date */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        {item.clientName && <span>Client: {item.clientName}</span>}
                        <span>Completed: {formatDate(item.completedAt)}</span>
                      </div>
                      
                      {/* Metrics */}
                      {renderMetrics(item.metrics)}
                      
                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex space-x-2 mt-4">
                        <Link
                          href={`/portfolio/${item.id}` as any}
                          className="btn-ghost-sm flex-1 text-center"
                        >
                          View
                        </Link>
                        
                        <Link
                          href={`/portfolio/${item.id}/edit` as any}
                          className="btn-ghost-sm flex-1 text-center"
                        >
                          Edit
                        </Link>
                        
                        {item.projectUrl && (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary-sm flex-1 text-center"
                          >
                            View Live
                          </a>
                        )}
                        
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="btn-ghost-sm text-red-600 px-3"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Portfolio Stats */}
            {portfolioItems.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-brand-primary">
                    {portfolioItems.length}
                  </div>
                  <div className="text-sm text-gray-600">Portfolio Items</div>
                </div>
                
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {portfolioItems.reduce((sum, item) => sum + (item.metrics?.views || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {portfolioItems.reduce((sum, item) => sum + (item.metrics?.reach || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Reach</div>
                </div>
              </div>
            )}

            {/* Portfolio Tips */}
            {portfolioItems.length === 0 && (
              <div className="mt-8 card-glass p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  💡 Portfolio Tips
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex space-x-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Quality over Quantity</h4>
                      <p className="text-sm text-gray-600">Showcase your best 5-10 projects rather than everything you've done.</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Include Metrics</h4>
                      <p className="text-sm text-gray-600">Add performance data like views, engagement, and conversions when possible.</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="text-2xl">🎨</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Visual Appeal</h4>
                      <p className="text-sm text-gray-600">Use high-quality images and videos to make your work stand out.</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="text-2xl">📝</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Tell the Story</h4>
                      <p className="text-sm text-gray-600">Describe the challenge, your approach, and the results achieved.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
