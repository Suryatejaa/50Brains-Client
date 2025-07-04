// components/dashboard/brand/CreateGigForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { brandApiClient, BrandGig } from '@/lib/brand-api-client';
import LoadingSpinner from '@/frontend-profile/components/common/LoadingSpinner';

interface CreateGigFormProps {
  onSuccess?: (gig: BrandGig) => void;
  onCancel?: () => void;
}

interface GigFormData {
  title: string;
  description: string;
  budget: number;
  budgetType: 'FIXED' | 'HOURLY';
  category: string;
  subcategory: string;
  requirements: string[];
  deliverables: string[];
  deadline: string;
  applicationDeadline: string;
  maxApplications: number;
  preferredPlatforms: string[];
  targetAudience: string[];
  campaignObjectives: string[];
}

const CATEGORIES = [
  'Fashion & Beauty',
  'Technology',
  'Food & Beverage',
  'Travel & Lifestyle',
  'Health & Fitness',
  'Education',
  'Entertainment',
  'Business',
  'Sports',
  'Art & Design',
  'Other',
];

const PLATFORMS = [
  'Instagram',
  'YouTube',
  'TikTok',
  'Twitter',
  'Facebook',
  'LinkedIn',
  'Pinterest',
  'Snapchat',
  'Blog/Website',
];

const OBJECTIVES = [
  'Brand Awareness',
  'Product Launch',
  'User Acquisition',
  'Engagement',
  'Content Creation',
  'Lead Generation',
  'Sales Conversion',
  'Event Promotion',
];

export const CreateGigForm: React.FC<CreateGigFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<GigFormData>({
    title: '',
    description: '',
    budget: 0,
    budgetType: 'FIXED',
    category: '',
    subcategory: '',
    requirements: [],
    deliverables: [],
    deadline: '',
    applicationDeadline: '',
    maxApplications: 10,
    preferredPlatforms: [],
    targetAudience: [],
    campaignObjectives: [],
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newAudience, setNewAudience] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.budget ||
      !formData.category
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await brandApiClient.createGig(formData);

      if (response.success && response.data) {
        onSuccess?.(response.data);
      } else {
        setError(response.error || 'Failed to create gig');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setFormData((prev) => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()],
      }));
      setNewDeliverable('');
    }
  };

  const addAudience = () => {
    if (newAudience.trim()) {
      setFormData((prev) => ({
        ...prev,
        targetAudience: [...prev.targetAudience, newAudience.trim()],
      }));
      setNewAudience('');
    }
  };

  const removeItem = (
    array: string[],
    index: number,
    field: keyof GigFormData
  ) => {
    const newArray = array.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const toggleArrayItem = (
    array: string[],
    item: string,
    field: keyof GigFormData
  ) => {
    const newArray = array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Create New Gig
        </h2>
        <p className="text-gray-600">
          Post a collaboration opportunity for influencers
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Gig Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Instagram Post for Beauty Product Launch"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your collaboration opportunity in detail..."
          />
        </div>

        {/* Budget */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Budget *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.budget}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  budget: Number(e.target.value),
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Budget Type
            </label>
            <select
              value={formData.budgetType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  budgetType: e.target.value as 'FIXED' | 'HOURLY',
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FIXED">Fixed Price</option>
              <option value="HOURLY">Hourly Rate</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Max Applications
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.maxApplications}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maxApplications: Number(e.target.value),
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Deadlines */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Application Deadline
            </label>
            <input
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  applicationDeadline: e.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Project Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, deadline: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Preferred Platforms */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Preferred Platforms
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {PLATFORMS.map((platform) => (
              <label
                key={platform}
                className="flex cursor-pointer items-center space-x-2"
              >
                <input
                  type="checkbox"
                  checked={formData.preferredPlatforms.includes(platform)}
                  onChange={() =>
                    toggleArrayItem(
                      formData.preferredPlatforms,
                      platform,
                      'preferredPlatforms'
                    )
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{platform}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Campaign Objectives */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Campaign Objectives
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {OBJECTIVES.map((objective) => (
              <label
                key={objective}
                className="flex cursor-pointer items-center space-x-2"
              >
                <input
                  type="checkbox"
                  checked={formData.campaignObjectives.includes(objective)}
                  onChange={() =>
                    toggleArrayItem(
                      formData.campaignObjectives,
                      objective,
                      'campaignObjectives'
                    )
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{objective}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Requirements
          </label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a requirement..."
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addRequirement())
                }
              />
              <button
                type="button"
                onClick={addRequirement}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map((req, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  {req}
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(formData.requirements, index, 'requirements')
                    }
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Deliverables
          </label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a deliverable..."
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addDeliverable())
                }
              />
              <button
                type="button"
                onClick={addDeliverable}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.deliverables.map((del, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                >
                  {del}
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(formData.deliverables, index, 'deliverables')
                    }
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Target Audience
          </label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newAudience}
                onChange={(e) => setNewAudience(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add target audience..."
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addAudience())
                }
              />
              <button
                type="button"
                onClick={addAudience}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetAudience.map((aud, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800"
                >
                  {aud}
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(
                        formData.targetAudience,
                        index,
                        'targetAudience'
                      )
                    }
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 border-t pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="small" />}
            <span>{loading ? 'Creating...' : 'Create Gig'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
