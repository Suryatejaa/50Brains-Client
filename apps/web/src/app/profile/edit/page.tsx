'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface ProfileData {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  website: string;
  instagramHandle: string;
  twitterHandle: string;
  linkedinHandle: string;
  youtubeHandle: string;
  skills: string[];
}

export default function ProfileEditPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
    instagramHandle: '',
    twitterHandle: '',
    linkedinHandle: '',
    youtubeHandle: '',
    skills: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load current profile data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: '',
        instagramHandle: '',
        twitterHandle: '',
        linkedinHandle: '',
        youtubeHandle: '',
        skills: user.skills || [],
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.put('/api/user/profile', formData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        setError('Failed to update profile');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-heading mb-2 text-3xl font-bold">
                Edit Profile
              </h1>
              <p className="text-muted">
                Update your profile information and preferences
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-green-600">
                  ✅ Profile updated successfully! Redirecting...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="card-glass p-3">
                <h2 className="text-heading mb-6 text-xl font-semibold">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-body mb-2 block text-sm font-medium">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="mt-6">
                  <label className="text-body mb-2 block text-sm font-medium">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="card-glass p-3">
                <h2 className="text-heading mb-6 text-xl font-semibold">
                  Social Media & Website
                </h2>
                
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      name="instagramHandle"
                      value={formData.instagramHandle}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Twitter Handle
                    </label>
                    <input
                      type="text"
                      name="twitterHandle"
                      value={formData.twitterHandle}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      LinkedIn Handle
                    </label>
                    <input
                      type="text"
                      name="linkedinHandle"
                      value={formData.linkedinHandle}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      YouTube Handle
                    </label>
                    <input
                      type="text"
                      name="youtubeHandle"
                      value={formData.youtubeHandle}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="@channelname"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="card-glass p-3">
                <h2 className="text-heading mb-6 text-xl font-semibold">
                  Skills & Expertise
                </h2>
                
                <div className="mb-4 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-brand-primary/10 text-brand-primary flex items-center space-x-2 rounded-lg px-3 py-1 text-sm"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="text-brand-primary hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Add a skill and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSkillAdd(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Brand Specific Fields - Removed for now */}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="btn-ghost px-6 py-3"
                  disabled={saving}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center px-6 py-3"
                >
                  {saving ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
