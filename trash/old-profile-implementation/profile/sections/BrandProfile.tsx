import React from 'react';
import { Briefcase } from 'lucide-react';
import { ProfileComponentProps } from '../types';

export const BrandProfile: React.FC<ProfileComponentProps> = ({
  profile,
  isEditing,
  onUpdate,
}) => {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
        <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
        Brand Profile
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Company Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profile.companyName || ''}
              onChange={(e) => onUpdate('companyName', e.target.value)}
              className="w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter company name"
            />
          ) : (
            <p className="text-gray-900">
              {profile.companyName || 'Not specified'}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Industry
          </label>
          {isEditing ? (
            <select
              value={profile.industry || ''}
              onChange={(e) => onUpdate('industry', e.target.value)}
              className="w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select industry</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="retail">Retail</option>
              <option value="education">Education</option>
              <option value="entertainment">Entertainment</option>
              <option value="automotive">Automotive</option>
              <option value="real-estate">Real Estate</option>
              <option value="food-beverage">Food & Beverage</option>
              <option value="fashion">Fashion</option>
            </select>
          ) : (
            <p className="text-gray-900">
              {profile.industry || 'Not specified'}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Company Type
          </label>
          {isEditing ? (
            <select
              value={profile.companyType || ''}
              onChange={(e) => onUpdate('companyType', e.target.value)}
              className="w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="STARTUP">Startup</option>
              <option value="SME">Small/Medium Enterprise</option>
              <option value="ENTERPRISE">Enterprise</option>
              <option value="AGENCY">Agency</option>
              <option value="NONPROFIT">Non-Profit</option>
            </select>
          ) : (
            <p className="text-gray-900">
              {profile.companyType || 'Not specified'}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Company Size
          </label>
          {isEditing ? (
            <select
              value={profile.companySize || ''}
              onChange={(e) => onUpdate('companySize', e.target.value)}
              className="w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          ) : (
            <p className="text-gray-900">
              {profile.companySize || 'Not specified'}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Marketing Budget (Annual)
          </label>
          {isEditing ? (
            <select
              value={profile.marketingBudget || ''}
              onChange={(e) => onUpdate('marketingBudget', e.target.value)}
              className="w-full rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select budget range</option>
              <option value="UNDER_10K">Under $10,000</option>
              <option value="10K_50K">$10,000 - $50,000</option>
              <option value="50K_100K">$50,000 - $100,000</option>
              <option value="100K_500K">$100,000 - $500,000</option>
              <option value="500K_1M">$500,000 - $1M</option>
              <option value="OVER_1M">Over $1M</option>
            </select>
          ) : (
            <p className="text-gray-900">
              {profile.marketingBudget
                ? profile.marketingBudget
                    .replace(/_/g, ' ')
                    .replace(/K/g, ',000')
                    .replace(/M/g, 'M')
                : 'Not specified'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
