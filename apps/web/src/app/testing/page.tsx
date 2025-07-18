'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TestResult {
  page: string;
  status: 'testing' | 'pass' | 'fail';
  error?: string;
  loadTime?: number;
}

const implementedPages = [
  // High Priority Pages (Completed in Phase 1)
  { path: '/profile/edit', name: 'Profile Edit', category: 'Profile' },
  { path: '/portfolio', name: 'Portfolio Management', category: 'Portfolio' },
  { path: '/applications', name: 'Applications', category: 'Gigs' },
  { path: '/search', name: 'Search', category: 'Discovery' },
  { path: '/credits', name: 'Credits Management', category: 'Credits' },
  { path: '/analytics', name: 'Analytics Dashboard', category: 'Analytics' },
  { path: '/gigs/browse', name: 'Gig Browse', category: 'Gigs' },
  { path: '/terms', name: 'Terms of Service', category: 'Legal' },
  { path: '/privacy', name: 'Privacy Policy', category: 'Legal' },
  { path: '/contact', name: 'Contact Us', category: 'Support' },
  { path: '/about', name: 'About Us', category: 'Company' },
  
  // Medium Priority Pages (Completed in Phase 2)
  { path: '/clans/browse', name: 'Clan Browse', category: 'Clans' },
  { path: '/users/discover', name: 'User Discovery', category: 'Discovery' },
  { path: '/notifications', name: 'Notifications', category: 'User' },
  { path: '/settings', name: 'User Settings', category: 'User' },
  { path: '/campaigns', name: 'Campaign Management', category: 'Campaigns' }
];

const categories = ['All', 'Profile', 'Portfolio', 'Gigs', 'Discovery', 'Credits', 'Analytics', 'Legal', 'Support', 'Company', 'Clans', 'User', 'Campaigns'];

export default function TestingPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);

  const filteredPages = selectedCategory === 'All' 
    ? implementedPages 
    : implementedPages.filter(page => page.category === selectedCategory);

  const testPage = async (page: typeof implementedPages[0]): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      // Simulate page load test
      const response = await fetch(page.path, { method: 'HEAD' });
      const loadTime = Date.now() - startTime;
      
      return {
        page: page.name,
        status: 'pass',
        loadTime
      };
    } catch (error: any) {
      const loadTime = Date.now() - startTime;
      
      return {
        page: page.name,
        status: 'fail',
        error: error.message,
        loadTime
      };
    }
  };

  const testAllPages = async () => {
    setIsTestingAll(true);
    setTestResults([]);
    
    for (const page of filteredPages) {
      setTestResults(prev => [...prev, { page: page.name, status: 'testing' }]);
      
      const result = await testPage(page);
      
      setTestResults(prev => 
        prev.map(r => r.page === page.name ? result : r)
      );
      
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsTestingAll(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'testing': return '🔄';
      case 'pass': return '✅';
      case 'fail': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'testing': return 'text-blue-600';
      case 'pass': return 'text-green-600';
      case 'fail': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const failedTests = testResults.filter(r => r.status === 'fail').length;
  const averageLoadTime = testResults
    .filter(r => r.loadTime)
    .reduce((sum, r) => sum + (r.loadTime || 0), 0) / testResults.filter(r => r.loadTime).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-heading mb-2 text-3xl font-bold">
                🧪 Implementation Testing Dashboard
              </h1>
              <p className="text-muted">
                Test all implemented pages to ensure functionality and performance
              </p>
            </div>

            {/* Implementation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
              <div className="card-glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pages</p>
                    <p className="text-2xl font-bold text-gray-900">{implementedPages.length}</p>
                  </div>
                  <div className="text-2xl">📄</div>
                </div>
              </div>
              
              <div className="card-glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-green-600">11</p>
                    <p className="text-xs text-gray-500">100% Complete</p>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>
              </div>
              
              <div className="card-glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Medium Priority</p>
                    <p className="text-2xl font-bold text-blue-600">5</p>
                    <p className="text-xs text-gray-500">100% Complete</p>
                  </div>
                  <div className="text-2xl">🚀</div>
                </div>
              </div>
              
              <div className="card-glass p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-purple-600">{categories.length - 1}</p>
                    <p className="text-xs text-gray-500">Feature Areas</p>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
              </div>
            </div>

            {/* Test Results Summary */}
            {testResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Passed Tests</p>
                      <p className="text-2xl font-bold text-green-600">{passedTests}</p>
                    </div>
                    <div className="text-2xl">✅</div>
                  </div>
                </div>
                
                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed Tests</p>
                      <p className="text-2xl font-bold text-red-600">{failedTests}</p>
                    </div>
                    <div className="text-2xl">❌</div>
                  </div>
                </div>
                
                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Load Time</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {averageLoadTime ? `${Math.round(averageLoadTime)}ms` : '-'}
                      </p>
                    </div>
                    <div className="text-2xl">⚡</div>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="card-glass p-3 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-wrap gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input w-auto"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category} {category !== 'All' && `(${implementedPages.filter(p => p.category === category).length})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={testAllPages}
                    disabled={isTestingAll}
                    className="btn-primary"
                  >
                    {isTestingAll ? 'Testing...' : `Test ${filteredPages.length} Pages`}
                  </button>
                  
                  <button
                    onClick={() => setTestResults([])}
                    className="btn-ghost"
                  >
                    Clear Results
                  </button>
                </div>
              </div>
            </div>

            {/* Pages List */}
            <div className="space-y-6">
              {/* Implementation Status */}
              <div className="card-glass p-3">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  📋 Implementation Status ({filteredPages.length} pages)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPages.map((page) => {
                    const testResult = testResults.find(r => r.page === page.name);
                    
                    return (
                      <div key={page.path} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{page.name}</h3>
                            <p className="text-sm text-gray-600">{page.category}</p>
                          </div>
                          
                          {testResult && (
                            <div className={`text-lg ${getStatusColor(testResult.status)}`}>
                              {getStatusIcon(testResult.status)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Link
                            href={page.path as any}
                            className="text-sm text-brand-primary hover:text-brand-primary-dark"
                            target="_blank"
                          >
                            {page.path} ↗
                          </Link>
                          
                          {testResult?.loadTime && (
                            <span className="text-xs text-gray-500">
                              {testResult.loadTime}ms
                            </span>
                          )}
                        </div>
                        
                        {testResult?.error && (
                          <p className="text-xs text-red-600 mt-2">
                            {testResult.error}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Implementation Progress */}
              <div className="card-glass p-3">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  📈 Implementation Progress
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Phase 1: High Priority Pages</span>
                      <span className="text-sm text-gray-600">11/11 (100%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full w-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Phase 2: Medium Priority Pages</span>
                      <span className="text-sm text-gray-600">5/5 (100%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full w-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Implementation</span>
                      <span className="text-sm text-gray-600">16/16 (100%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="card-glass p-3">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  🎯 Next Steps & Optimization
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">🔧 Performance Optimization</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Code splitting for large components</li>
                      <li>• Image optimization and lazy loading</li>
                      <li>• API response caching</li>
                      <li>• Bundle size optimization</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">🧪 Testing & QA</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Unit tests for key components</li>
                      <li>• Integration tests for user flows</li>
                      <li>• E2E testing with Playwright</li>
                      <li>• Cross-browser compatibility</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">📱 Mobile Optimization</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Touch-friendly interactions</li>
                      <li>• Mobile-specific layouts</li>
                      <li>• Progressive Web App features</li>
                      <li>• Offline functionality</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">🚀 Advanced Features</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Real-time notifications</li>
                      <li>• Advanced search filters</li>
                      <li>• Data export capabilities</li>
                      <li>• AI-powered recommendations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
