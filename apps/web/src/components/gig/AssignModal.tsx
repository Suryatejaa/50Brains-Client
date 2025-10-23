'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface Creator {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  verified?: boolean;
  location?: string;
  roles: string[];
  createdAt: string;
  updatedAt?: string;
}

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (user: Creator) => void;
  gigId?: string;
  title?: string;
}

export default function AssignModal({
  isOpen,
  onClose,
  onAssign,
  gigId,
  title = 'Assign User to Gig',
}: AssignModalProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'influencers' | 'crew'>(
    'all'
  );

  const router = useRouter();

  // Search and filter logic
  const loadCreators = async () => {
    try {
      setIsLoading(true);

      //console.log(('Loading creators with search query:', searchQuery);
      //console.log(('Active tab:', activeTab);

      const params = new URLSearchParams();

      // Add search query if exists
      const queryToUse = searchQuery.trim();
      if (queryToUse) {
        params.append('query', queryToUse);
      }

      // Add pagination
      params.append('page', '1');
      params.append('limit', '20');

      const apiUrl = `/api/search/users?${params.toString()}`;
      //console.log(('Making API call to:', apiUrl);

      const response = await apiClient.get(apiUrl);
      //console.log(('API Response:', response);

      if (response.success && response.data) {
        const responseData = response.data as {
          results?: Creator[];
          pagination?: {
            total: number;
            page: number;
            limit: number;
            pages: number;
          };
        };
        let allCreators: Creator[] = [];

        if (responseData.results && Array.isArray(responseData.results)) {
          allCreators = responseData.results;
          //console.log(('Raw creators from API:', allCreators.length);
        } else {
          //console.log(('No results array found in response:', responseData);
        }

        // Filter out BRAND users and only show INFLUENCER/CREW
        let filteredCreators = allCreators.filter(
          (creator) =>
            creator.roles &&
            (creator.roles.includes('INFLUENCER') ||
              creator.roles.includes('CREW')) &&
            !creator.roles.includes('BRAND')
        );

        // Additional client-side filtering based on active tab
        if (activeTab === 'influencers') {
          filteredCreators = filteredCreators.filter(
            (creator) => creator.roles && creator.roles.includes('INFLUENCER')
          );
          //console.log(('Filtered for influencers:', filteredCreators.length);
        } else if (activeTab === 'crew') {
          filteredCreators = filteredCreators.filter(
            (creator) => creator.roles && creator.roles.includes('CREW')
          );
          //console.log(('Filtered for crew:', filteredCreators.length);
        }

        //console.log(('Final filtered creators:', filteredCreators.length);
        setCreators(filteredCreators);
      } else {
        //console.log(('API response not successful:', response);
        setCreators([]);
      }
    } catch (error) {
      console.error('Failed to load creators:', error);
      setCreators([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load creators when modal opens or search/tab changes
  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        loadCreators();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, searchQuery, activeTab]);

  // Handle assign button click
  const handleAssign = (user: Creator) => {
    onAssign(user);
    onClose();
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="border-b border-gray-200 px-2 py-2">
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name, username, or bio..."
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 rounded-sm bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 rounded-sm px-2 py-2 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Talent ({creators.length})
            </button>
            <button
              onClick={() => setActiveTab('influencers')}
              className={`flex-1 rounded-sm px-2 py-2 text-sm font-medium transition-colors ${
                activeTab === 'influencers'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Influencers (
              {
                creators.filter(
                  (c) => c.roles && c.roles.includes('INFLUENCER')
                ).length
              }
              )
            </button>
            <button
              onClick={() => setActiveTab('crew')}
              className={`flex-1 rounded-sm px-2 py-2 text-sm font-medium transition-colors ${
                activeTab === 'crew'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Crew (
              {
                creators.filter((c) => c.roles && c.roles.includes('CREW'))
                  .length
              }
              )
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <div className="h-8 w-8 animate-spin rounded-sm border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : creators.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No users found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters to find users
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className="rounded-sm border border-gray-200 p-1 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    {/* User Info */}
                    <div
                      className="flex-1"
                      onClick={() => router.push(`/profile/${creator.id}`)}
                    >
                      <h3 className="mb-1 font-semibold text-gray-900">
                        {`${creator.firstName || ''} ${creator.lastName || ''}`.trim() ||
                          creator.username}
                      </h3>
                      <p className="mb-2 text-sm text-gray-600">
                        @{creator.username}
                      </p>

                      {creator.location && (
                        <p className="mb-2 text-xs text-gray-500">
                          📍 {creator.location}
                        </p>
                      )}

                      {/* Roles */}
                      <div className="mb-3 flex flex-wrap gap-1">
                        {creator.roles &&
                          creator.roles.map(
                            (role, index) =>
                              role !== 'USER' &&
                              role !== 'BRAND' && (
                                <span
                                  key={index}
                                  className={`rounded-full px-2 py-1 text-xs ${
                                    role === 'INFLUENCER'
                                      ? 'bg-purple-100 text-purple-600'
                                      : role === 'CREW'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {role.charAt(0).toUpperCase() +
                                    String(role || '')
                                      .slice(1)
                                      .toLowerCase()}
                                </span>
                              )
                          )}
                      </div>

                      {/* Bio excerpt */}
                      {creator.bio && (
                        <p className="line-clamp-2 text-sm text-gray-700">
                          {creator.bio}
                        </p>
                      )}
                    </div>

                    {/* Assign Button */}
                    <button
                      onClick={() => handleAssign(creator)}
                      className="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
