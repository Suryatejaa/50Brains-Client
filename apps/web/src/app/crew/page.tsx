'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CrewMember {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  location?: string;
  skills?: string[];
  averageRating: number;
  reviewCount: number;
  completedGigs: number;
  hourlyRate?: number;
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'SPECIALIST';
  serviceCategories?: string[];
  equipmentOwned?: string[];
  availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  certifications?: string[];
  portfolioItems?: any[];
  isVerified?: boolean;
}

const experienceLevelColors = {
  'BEGINNER': 'bg-green-100 text-green-700',
  'INTERMEDIATE': 'bg-blue-100 text-blue-700',
  'EXPERT': 'bg-purple-100 text-purple-700',
  'SPECIALIST': 'bg-red-100 text-red-700',
};

const availabilityColors = {
  'AVAILABLE': 'bg-green-100 text-green-700',
  'BUSY': 'bg-yellow-100 text-yellow-700',
  'UNAVAILABLE': 'bg-red-100 text-red-700',
};

export default function CrewPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    experienceLevel: '',
    maxRate: '',
    availability: '',
    verified: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCrewMembers();
  }, [filters]);

  const loadCrewMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        ...(searchQuery && { q: searchQuery }),
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.experienceLevel && { experienceLevel: filters.experienceLevel }),
        ...(filters.maxRate && { maxRate: filters.maxRate }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.verified && { verified: 'true' }),
      });
      
      const response = await apiClient.get(`/api/crew?${params}`);
      
      if (response.success) {
        setCrewMembers(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Failed to load crew members');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load crew members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCrewMembers();
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      experienceLevel: '',
      maxRate: '',
      availability: '',
      verified: false,
    });
    setSearchQuery('');
  };

  const getCrewName = (crew: CrewMember) => {
    if (crew.displayName) return crew.displayName;
    if (crew.firstName || crew.lastName) {
      return `${crew.firstName || ''} ${crew.lastName || ''}`.trim();
    }
    return 'Crew Member';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-heading mb-4 text-3xl font-bold">
                Find Crew Members
              </h1>
              <p className="text-muted">
                Discover talented photographers, videographers, editors, and technical experts for your projects
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 card-glass p-3">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search crew by name, skills, or equipment..."
                    className="input flex-1"
                  />
                  <button type="submit" className="btn-primary px-8">
                    Search
                  </button>
                </div>
                
                {/* Filters Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input"
                  >
                    <option value="">All Categories</option>
                    <option value="Photography">Photography</option>
                    <option value="Videography">Videography</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Audio Production">Audio Production</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Animation">Animation</option>
                    <option value="Live Streaming">Live Streaming</option>
                    <option value="Social Media Management">Social Media Management</option>
                  </select>
                  
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Location"
                    className="input"
                  />
                  
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    className="input"
                  >
                    <option value="">All Levels</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                    <option value="SPECIALIST">Specialist</option>
                  </select>
                  
                  <select
                    value={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="input"
                  >
                    <option value="">All Availability</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                  
                  <input
                    type="number"
                    value={filters.maxRate}
                    onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                    placeholder="Max Rate (₹/hr)"
                    className="input"
                  />
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => handleFilterChange('verified', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Verified only</span>
                  </label>
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn-ghost text-sm"
                  >
                    Clear Filters
                  </button>
                  <span className="text-sm text-gray-600">
                    {crewMembers.length} crew members found
                  </span>
                </div>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Crew Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="card-glass p-3 animate-pulse">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-none"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : crewMembers.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No crew members found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
                
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {crewMembers.map((crew) => (
                  <div key={crew.id} className="card-glass p-3 hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-none flex items-center justify-center text-white font-semibold text-lg">
                        {crew.profilePicture ? (
                          <img 
                            src={crew.profilePicture} 
                            alt="Profile" 
                            className="w-16 h-16 rounded-none object-cover"
                          />
                        ) : (
                          getCrewName(crew)[0]?.toUpperCase() || 'C'
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {getCrewName(crew)}
                          </h3>
                          {crew.isVerified && (
                            <span className="text-blue-500 text-sm">✓</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {crew.experienceLevel && (
                            <span className={`px-2 py-1 rounded-none text-xs font-medium ${
                              experienceLevelColors[crew.experienceLevel] || 'bg-gray-100 text-gray-700'
                            }`}>
                              {crew.experienceLevel}
                            </span>
                          )}
                          
                          {crew.availabilityStatus && (
                            <span className={`px-2 py-1 rounded-none text-xs font-medium ${
                              availabilityColors[crew.availabilityStatus] || 'bg-gray-100 text-gray-700'
                            }`}>
                              {crew.availabilityStatus}
                            </span>
                          )}
                        </div>
                        
                        {crew.location && (
                          <p className="text-sm text-gray-600">📍 {crew.location}</p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {crew.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {crew.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(crew.averageRating)}
                          <span className="text-gray-600 ml-1">
                            ({crew.reviewCount})
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Completed Gigs</span>
                        <span className="font-medium">{crew.completedGigs}</span>
                      </div>
                      
                      {crew.hourlyRate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Hourly Rate</span>
                          <span className="font-medium">₹{crew.hourlyRate}/hr</span>
                        </div>
                      )}
                      
                      {crew.portfolioItems && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Portfolio Items</span>
                          <span className="font-medium">{crew.portfolioItems.length}</span>
                        </div>
                      )}
                    </div>

                    {/* Service Categories */}
                    {crew.serviceCategories && crew.serviceCategories.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {crew.serviceCategories.slice(0, 3).map((category) => (
                            <span key={category} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                              {category}
                            </span>
                          ))}
                          {crew.serviceCategories.length > 3 && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                              +{crew.serviceCategories.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {crew.skills && crew.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {crew.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                          {crew.skills.length > 4 && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              +{crew.skills.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Equipment */}
                    {crew.equipmentOwned && crew.equipmentOwned.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-2">Equipment:</p>
                        <div className="flex flex-wrap gap-2">
                          {crew.equipmentOwned.slice(0, 3).map((equipment) => (
                            <span key={equipment} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                              🛠️ {equipment}
                            </span>
                          ))}
                          {crew.equipmentOwned.length > 3 && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                              +{crew.equipmentOwned.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {crew.certifications && crew.certifications.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-2">Certifications:</p>
                        <div className="flex flex-wrap gap-2">
                          {crew.certifications.slice(0, 2).map((cert) => (
                            <span key={cert} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                              🏆 {cert}
                            </span>
                          ))}
                          {crew.certifications.length > 2 && (
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                              +{crew.certifications.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/profile/${crew.id}` as any}
                        className="btn-ghost-sm flex-1 text-center"
                      >
                        View Profile
                      </Link>
                      
                      {isAuthenticated && user?.roles?.includes('BRAND') && (
                        <Link
                          href={`/messages/new?to=${crew.id}` as any}
                          className="btn-primary-sm flex-1 text-center"
                        >
                          Contact
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {crewMembers.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadCrewMembers}
                  className="btn-ghost"
                  disabled={loading}
                >
                  Load More Crew Members
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
