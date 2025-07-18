import React from 'react';
import { Users, DollarSign, X } from 'lucide-react';
import { ProfileComponentProps } from '../types';

export const CrewProfile: React.FC<ProfileComponentProps> = ({
  profile,
  isEditing,
  onUpdate,
}) => {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
        <Users className="mr-2 h-5 w-5 text-green-500" />
        Crew Profile
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Experience Level
          </label>
          {isEditing ? (
            <select
              value={profile.experienceLevel || ''}
              onChange={(e) => onUpdate('experienceLevel', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select level</option>
              <option value="ENTRY">Entry Level</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="SENIOR">Senior</option>
              <option value="EXPERT">Expert</option>
            </select>
          ) : (
            <p className="text-gray-900">
              {profile.experienceLevel || 'Not specified'}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Availability
          </label>
          {isEditing ? (
            <select
              value={profile.availability || ''}
              onChange={(e) => onUpdate('availability', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select availability</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="FREELANCE">Freelance</option>
              <option value="CONTRACT">Contract</option>
            </select>
          ) : (
            <p className="text-gray-900">
              {profile.availability || 'Not specified'}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hourly Rate ($)
          </label>
          {isEditing ? (
            <input
              type="number"
              value={profile.hourlyRate || ''}
              onChange={(e) =>
                onUpdate('hourlyRate', parseInt(e.target.value) || 0)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter hourly rate"
            />
          ) : (
            <p className="flex items-center text-gray-900">
              <DollarSign className="mr-1 h-4 w-4" />
              {profile.hourlyRate
                ? `${profile.hourlyRate}/hour`
                : 'Not specified'}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Crew Skills
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {(profile.crewSkills || []).map(
                  (skill: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                    >
                      {skill}
                      <button
                        onClick={() => {
                          const updated = (profile.crewSkills || []).filter(
                            (_: any, i: number) => i !== index
                          );
                          onUpdate('crewSkills', updated);
                        }}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                )}
              </div>
              <input
                type="text"
                placeholder="Add skill and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const newSkills = [
                      ...(profile.crewSkills || []),
                      e.currentTarget.value.trim(),
                    ];
                    onUpdate('crewSkills', newSkills);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(profile.crewSkills || []).map(
                (skill: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                  >
                    {skill}
                  </span>
                )
              )}
              {(!profile.crewSkills || profile.crewSkills.length === 0) && (
                <p className="text-gray-500">No skills specified</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
