import React from 'react';
import { Phone, Globe, X } from 'lucide-react';
import { ProfileComponentProps } from '../types';
import { RoleBasedProfileSections } from './RoleBasedProfileSections';

export const OverviewSection: React.FC<ProfileComponentProps> = ({
  profile,
  userRoles,
  isEditing,
  onUpdate,
}) => {
  // profile IS the user object from the API response
  const user = profile;
  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">About</h3>
        {isEditing ? (
          <textarea
            value={user.bio || ''}
            onChange={(e) => onUpdate('bio', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell others about yourself, your expertise, and what makes you unique..."
          />
        ) : (
          <p className="whitespace-pre-wrap text-gray-700">
            {user.bio || 'No bio provided yet.'}
          </p>
        )}
      </div>

      {/* Skills Section */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Skills & Expertise
        </h3>
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {(user.skills || []).map((skill: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  {skill}
                  <button
                    onClick={() => {
                      const updated = (user.skills || []).filter(
                        (_: any, i: number) => i !== index
                      );
                      onUpdate('skills', updated);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add skill and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const newSkills = [
                    ...(user.skills || []),
                    e.currentTarget.value.trim(),
                  ];
                  onUpdate('skills', newSkills);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(user.skills || []).map((skill: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
              >
                {skill}
              </span>
            ))}
            {(!user.skills || user.skills.length === 0) && (
              <p className="text-gray-500">No skills added yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Role-Based Sections */}
      <RoleBasedProfileSections
        profile={profile}
        userRoles={userRoles}
        isEditing={isEditing}
        onUpdate={onUpdate}
      />

      {/* Contact Information */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={user.phone || ''}
                onChange={(e) => onUpdate('phone', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            ) : (
              <p className="flex items-center text-gray-900">
                <Phone className="mr-2 h-4 w-4" />
                {user.phone || 'Not provided'}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Website
            </label>
            {isEditing ? (
              <input
                type="url"
                value={user.website || ''}
                onChange={(e) => onUpdate('website', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter website URL"
              />
            ) : (
              <p className="flex items-center text-gray-900">
                <Globe className="mr-2 h-4 w-4" />
                {user.website ? (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {user.website}
                  </a>
                ) : (
                  'Not provided'
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
