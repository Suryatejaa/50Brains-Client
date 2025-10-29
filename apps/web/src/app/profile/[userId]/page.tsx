
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  getPublicProfiles,
  getPublicProfilesByUsernames,
} from '@/lib/user-api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaMapMarkerAlt,
  FaGlobeAsia,
  FaBullseye,
} from 'react-icons/fa';
import LoadingSpinner from '@/frontend-profile/components/common/LoadingSpinner';
import AssignGigModal from '@/components/gig/AssignGigModal';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';

export default function ProfilePage() {
  const params = useParams();
  const identifier = params.userId as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const userType = getUserTypeForRole(currentRole);
  console.log('Current User Type:', userType);
  console.log('Current Role:', currentRole);
  console.log('Current User:', user);
  console.log('Current Profile', profile);
  // Helper function to check if identifier is a UUID
  const isUUID = (str: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        let response;

        // Determine if identifier is UUID or username and use appropriate API
        if (isUUID(identifier)) {
          response = await getPublicProfiles([identifier]);
        } else {
          response = await getPublicProfilesByUsernames([identifier]);
        }

        if (
          response.success &&
          'data' in response &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          console.log('Profile loaded successfully:', response.data[0]);
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
  }, [identifier]);

  const activeFrom = profile?.createdAt ? new Date(profile.createdAt) : null;
  //exclude role USER
  const roles = profile?.roles || [];
  const filteredRoles = roles.filter((role: string) => role !== 'USER');
  console.log('Filtered Roles:', filteredRoles);

  //normalize social handles by stripping  @
  const normalizeSocialLink = (link: string) => {
    return link.startsWith('@') ? link.slice(1) : link;
  };

  // Handle successful assignment
  const handleAssignSuccess = (gigId: string, userId: string) => {
    console.log(`Successfully assigned gig ${gigId} to user ${userId}`);
    setShowAssignModal(false);
  };

  // Check if current user can assign gigs (is a brand and not viewing own profile)
  const canAssignGigs =
    isAuthenticated &&
    userType === 'brand' &&
    user?.id !== profile?.id &&
    profile?.id &&
    (profile.roles?.includes('INFLUENCER') || profile.roles?.includes('CREW'));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-1">
          <div className="content-container py-1">
            <div className="mx-auto max-w-4xl">
              <div className="card-glass p-8 text-center">
                <LoadingSpinner size="large" message="Loading profile..." />
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
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-red-100">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Profile Not Found
                  </h3>
                  <p className="mb-6 text-gray-600">
                    The profile you're looking for doesn't exist or is not
                    public.
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
            <div className="card-glass mb-1 p-1">
              <div className="flex items-center space-x-1">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-2xl font-bold text-white">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    (profile.displayName ||
                      profile.firstName ||
                      'U')[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="mb-2 text-xl font-bold text-gray-900">
                        {profile.displayName ||
                          `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
                          `${profile.username}`}
                      </h1>
                      {filteredRoles.length > 0 && (
                        <p className="mb-2 text-sm text-gray-600">
                          {filteredRoles.join(', ') || 'No Role'}
                        </p>
                      )}
                      {profile.createdAt && (
                        <p className="mb-2 text-sm text-gray-600">
                          Active since {activeFrom?.toLocaleDateString()}
                        </p>
                      )}
                      {profile.bio && (
                        <p className="mb-4 text-gray-700">{profile.bio}</p>
                      )}
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        {profile.location && (
                          <span className="relative flex gap-1">
                            <FaMapMarkerAlt /> {profile.location}
                          </span>
                        )}
                        {profile.totalGigs > 0 && (
                          <span>
                            <FaBullseye /> {profile.totalGigs} gigs
                          </span>
                        )}
                        {profile.averageRating > 0 && (
                          <span>
                            ⭐ {profile.averageRating.toFixed(1)} rating
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Assign Button */}
                    {canAssignGigs && (
                      <div className="ml-4">
                        <button
                          onClick={() => setShowAssignModal(true)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          Assign Gig
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 gap-1 lg:grid-cols-3">
              <div className="space-y-1 lg:col-span-2">
                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="card-glass p-1">
                    <h2 className="mb-1 text-sm font-semibold text-gray-900">
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="card-glass hidden p-1">
                  <h2 className="mb-1 text-sm font-semibold text-gray-900">
                    Performance
                  </h2>
                  <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {profile.totalGigs}
                      </p>
                      <p className="text-sm text-gray-600">Total Gigs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {profile.completedGigs}
                      </p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        ${profile.totalEarnings}
                      </p>
                      <p className="text-sm text-gray-600">Earnings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {profile.averageRating?.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">Rating</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-1">
                {/* Contact Info - Only show if showContact is true */}
                {profile.showContact !== false &&
                  (profile.website || profile.location) && (
                    <div className="card-glass p-1">
                      <h3 className="mb-1 text-sm font-semibold text-gray-900">
                        Contact
                      </h3>
                      <div className="space-y-1">
                        {profile.website && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              <FaGlobeAsia />
                            </span>
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                        {profile.location && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              <FaMapMarkerAlt />
                            </span>
                            <span>{profile.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Social Links - Only show if showContact is true */}
                {profile.showContact !== false &&
                  (profile.instagramHandle ||
                    profile.twitterHandle ||
                    profile.linkedinHandle) && (
                    <div className="card-glass p-1">
                      <h3 className="mb-1 text-sm font-semibold text-gray-900">
                        Social handles
                      </h3>
                      <div className="space-y-1">
                        {profile.instagramHandle && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              <FaInstagram />
                            </span>
                            <a
                              href={`https://instagram.com/${normalizeSocialLink(profile.instagramHandle)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {normalizeSocialLink(profile.instagramHandle)}
                            </a>
                          </div>
                        )}
                        {profile.twitterHandle && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              <FaTwitter />
                            </span>
                            <a
                              href={`https://twitter.com/${profile.twitterHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {profile.twitterHandle}
                            </a>
                          </div>
                        )}
                        {profile.linkedinHandle && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              <FaLinkedin />
                            </span>
                            <a
                              href={`https://linkedin.com/in/${profile.linkedinHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
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
                      <div className="mb-2 text-gray-400">🔒</div>
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

      {/* Assign Gig Modal */}
      {showAssignModal && profile && (
        <AssignGigModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          user={profile}
          onAssignSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
