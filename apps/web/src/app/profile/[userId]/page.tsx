'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPublicProfiles } from '@/lib/user-api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaInstagram, FaTwitter, FaLinkedin,FaMapMarkerAlt,FaGlobeAsia, FaBullseye } from 'react-icons/fa';


export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getPublicProfiles([userId]);
        console.log(response);
        if (response.success && 'data' in response && Array.isArray(response.data) && response.data.length > 0) {
          setProfile(response.data[0]);
        } else {
          setError('Profile not found');
        }
      } catch (error: any) {
        console.error('Failed to load profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-1">
          <div className="content-container py-1">
            <div className="mx-auto max-w-4xl">
              <div className="card-glass p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-1">
          <div className="content-container py-1">
            <div className="mx-auto max-w-4xl">
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-red-100 flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Profile Not Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    The profile you're looking for doesn't exist or is not public.
                  </p>
                </div>
                <Link href="/clans" className="btn-primary">
                  Browse Clans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-1">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            {/* <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
              <Link href="/clans" className="hover:text-brand-primary">
                Clans
              </Link>
              <span>›</span>
              <span className="text-gray-900">{profile.displayName || profile.firstName || 'User'}</span>
            </nav> */}

            {/* Profile Header */}
            <div className="card-glass p-1 mb-1">
              <div className="flex items-center space-x-1">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    (profile.displayName || profile.firstName || 'U')[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Anonymous User'}
                  </h1>
                  {profile.currentRole && (
                    <p className="text-sm text-gray-600 mb-2">{profile.currentRole}</p>
                  )}
                  {profile.bio && (
                    <p className="text-gray-700 mb-4">{profile.bio}</p>
                  )}
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    {profile.location && (
                      <span className='flex gap-1 relative' ><FaMapMarkerAlt /> {profile.location}</span>
                    )}
                    {profile.totalGigs > 0 && (
                      <span><FaBullseye /> {profile.totalGigs} gigs</span>
                    )}
                    {profile.averageRating > 0 && (
                      <span>⭐ {profile.averageRating.toFixed(1)} rating</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
              <div className="lg:col-span-2 space-y-1">
                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="card-glass p-1">
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Skills</h2>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="card-glass p-1 hidden">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Performance</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{profile.totalGigs}</p>
                      <p className="text-sm text-gray-600">Total Gigs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{profile.completedGigs}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">${profile.totalEarnings}</p>
                      <p className="text-sm text-gray-600">Earnings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{profile.averageRating?.toFixed(1)}</p>
                      <p className="text-sm text-gray-600">Rating</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-1">
                {/* Contact Info - Only show if showContact is true */}
                {profile.showContact !== false && (
                  <div className="card-glass p-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Contact</h3>
                    <div className="space-y-1">
                      {profile.website && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600"><FaGlobeAsia /></span>
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600"><FaMapMarkerAlt /></span>
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Social Links - Only show if showContact is true */}
                {profile.showContact !== false && (profile.instagramHandle || profile.twitterHandle || profile.linkedinHandle) && (
                  <div className="card-glass p-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Social</h3>
                    <div className="space-y-1">
                      {profile.instagramHandle && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600"><FaInstagram /></span>
                          <a href={`https://instagram.com/${profile.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.instagramHandle}
                          </a>
                        </div>
                      )}
                      {profile.twitterHandle && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600"><FaTwitter /></span>
                          <a href={`https://twitter.com/${profile.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.twitterHandle}
                          </a>
                        </div>
                      )}
                      {profile.linkedinHandle && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600"><FaLinkedin /></span>
                          <a href={`https://linkedin.com/in/${profile.linkedinHandle}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.linkedinHandle}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Privacy Notice */}
                {profile.showContact === false && (
                  <div className="card-glass p-1">
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">🔒</div>
                      <p className="text-xs text-gray-500">
                        Contact information is private
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
