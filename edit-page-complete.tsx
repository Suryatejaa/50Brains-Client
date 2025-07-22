'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';

interface BackendGig {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OPEN';
  
  // Budget & Pricing
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  budgetMin?: number;
  budgetMax?: number;
  
  // Timeline
  deadline?: string;
  duration?: string;
  campaignDuration?: string;
  
  // Location
  location?: string;
  
  // Requirements
  roleRequired: string;
  skillsRequired: string[];
  experienceLevel: string;
  urgency: string;
  requirements?: string;
  
  // Targeting Requirements
  platformRequirements?: string[];
  followerRequirements?: Array<{platform: string; minFollowers: number}>;
  locationRequirements?: string[];
  
  // Deliverables & Applications
  deliverables: string[];
  maxApplications?: number;
  isClanAllowed: boolean;
  
  // Additional
  tags: string[];
  
  // Meta fields
  posterId?: string;
  postedById?: string;
  brand?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  roleRequired: string;
  skillsRequired: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  location?: string;
  isRemote: boolean;
  deadline?: string;
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  budgetMin?: number;
  budgetMax?: number;
  requirements?: string;
  duration?: string;
  campaignDuration?: string;
  urgency: 'urgent' | 'normal' | 'flexible';
  deliverables: string[];
  isClanAllowed: boolean;
  maxApplications?: number;
  tags: string[];
  platformRequirements: string[];
  followerRequirements: Array<{platform: string; minFollowers: number}>;
  locationRequirements: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  roleRequired?: string;
  skillsRequired?: string;
  budgetMin?: string;
  budgetMax?: string;
  budget?: string;
  deliverables?: string;
  general?: string;
}

const categories = [
  'content-creation',
  'social-media-management', 
  'photography',
  'videography',
  'graphic-design',
  'copywriting',
  'influencer-marketing',
  'brand-partnership',
  'product-review',
  'event-coverage',
  'other'
];

const experienceLevels = [
  'beginner',
  'intermediate',
  'expert'
];

const urgencyLevels = [
  'urgent',
  'normal', 
  'flexible'
];

const roleOptions = [
  'influencer',
  'content-creator',
  'photographer',
  'videographer',
  'graphic-designer',
  'copywriter',
  'social-media-manager',
  'brand-ambassador',
  'other'
];

export default function EditGigPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  
  const [gig, setGig] = useState<BackendGig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we should publish after editing
  const shouldPublish = searchParams.get('publish') === 'true' || 
    (typeof window !== 'undefined' && sessionStorage.getItem('publishDraftIntent') === 'true');

  const gigId = params.id as string;
  const userType = getUserTypeForRole(currentRole);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    roleRequired: '',
    skillsRequired: [],
    experienceLevel: 'intermediate',
    location: '',
    isRemote: true,
    deadline: '',
    budgetType: 'fixed',
    budgetMin: undefined,
    budgetMax: undefined,
    requirements: '',
    duration: '',
    campaignDuration: '',
    urgency: 'normal',
    deliverables: [],
    isClanAllowed: true,
    maxApplications: undefined,
    tags: [],
    platformRequirements: [],
    followerRequirements: [],
    locationRequirements: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (gigId && isAuthenticated) {
      loadGig();
    }
  }, [gigId, isAuthenticated]);

  const loadGig = async () => {
    try {
      const response = await apiClient.get(`/api/gig/${gigId}`);
      
      if (response.success && response.data) {
        const gigData = response.data as BackendGig;
        setGig(gigData);
        
        // Populate form with gig data
        setFormData({
          title: gigData.title || '',
          description: gigData.description || '',
          category: gigData.category || '',
          roleRequired: gigData.roleRequired || '',
          skillsRequired: gigData.skillsRequired || [],
          experienceLevel: (gigData.experienceLevel as 'beginner' | 'intermediate' | 'expert') || 'intermediate',
          location: gigData.location === 'remote' ? '' : gigData.location || '',
          isRemote: gigData.location === 'remote',
          deadline: gigData.deadline ? new Date(gigData.deadline).toISOString().split('T')[0] : '',
          budgetType: gigData.budgetType || 'fixed',
          budgetMin: gigData.budgetMin || undefined,
          budgetMax: gigData.budgetMax || undefined,
          requirements: gigData.requirements || '',
          duration: gigData.duration || '',
          campaignDuration: gigData.campaignDuration || '',
          urgency: (gigData.urgency as 'urgent' | 'normal' | 'flexible') || 'normal',
          deliverables: gigData.deliverables || [],
          isClanAllowed: gigData.isClanAllowed ?? true,
          maxApplications: gigData.maxApplications || undefined,
          tags: gigData.tags || [],
          platformRequirements: gigData.platformRequirements || [],
          followerRequirements: gigData.followerRequirements || [],
          locationRequirements: gigData.locationRequirements || [],
        });
      } else {
        setError('Failed to load gig');
      }
    } catch (error) {
      console.error('Failed to load gig:', error);
      setError('Failed to load gig');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const addTag = (field: 'skillsRequired' | 'deliverables' | 'tags' | 'platformRequirements' | 'locationRequirements') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeTag = (field: 'skillsRequired' | 'deliverables' | 'tags' | 'platformRequirements' | 'locationRequirements', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateTag = (field: 'skillsRequired' | 'deliverables' | 'tags' | 'platformRequirements' | 'locationRequirements', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addPlatformRequirement = () => {
    setFormData(prev => ({
      ...prev,
      platformRequirements: [...prev.platformRequirements, '']
    }));
  };

  const removePlatformRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      platformRequirements: prev.platformRequirements.filter((_, i) => i !== index)
    }));
  };

  const addLocationRequirement = () => {
    setFormData(prev => ({
      ...prev,
      locationRequirements: [...prev.locationRequirements, '']
    }));
  };

  const removeLocationRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locationRequirements: prev.locationRequirements.filter((_, i) => i !== index)
    }));
  };

  const addFollowerRequirement = () => {
    setFormData(prev => ({
      ...prev,
      followerRequirements: [...prev.followerRequirements, { platform: '', minFollowers: 0 }]
    }));
  };

  const removeFollowerRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      followerRequirements: prev.followerRequirements.filter((_, i) => i !== index)
    }));
  };

  const updateFollowerRequirement = (index: number, field: 'platform' | 'minFollowers', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      followerRequirements: prev.followerRequirements.map((req, i) => 
        i === index ? { ...req, [field]: value } : req
      )
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
      isValid = false;
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
      isValid = false;
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
      isValid = false;
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description must not exceed 2000 characters';
      isValid = false;
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
      isValid = false;
    }

    // Role required validation
    if (!formData.roleRequired.trim()) {
      newErrors.roleRequired = 'Please select a role';
      isValid = false;
    }

    // Skills validation
    const validSkills = formData.skillsRequired.filter(skill => skill.trim());
    if (validSkills.length === 0) {
      newErrors.skillsRequired = 'At least one skill is required';
      isValid = false;
    }

    // Deliverables validation
    const validDeliverables = formData.deliverables.filter(d => d.trim());
    if (validDeliverables.length === 0) {
      newErrors.deliverables = 'At least one deliverable is required';
      isValid = false;
    }

    // Budget validation
    if (formData.budgetType !== 'negotiable') {
      if (!formData.budgetMin || formData.budgetMin <= 0) {
        newErrors.budgetMin = 'Please enter a valid minimum budget';
        isValid = false;
      }

      if (!formData.budgetMax || formData.budgetMax <= 0) {
        newErrors.budgetMax = 'Please enter a valid maximum budget';
        isValid = false;
      }

      if (formData.budgetMin && formData.budgetMax && formData.budgetMin > formData.budgetMax) {
        newErrors.budgetMax = 'Maximum budget must be greater than minimum budget';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const prepareSubmissionData = () => {
    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      roleRequired: formData.roleRequired.trim(),
      skillsRequired: formData.skillsRequired.filter(skill => skill.trim()),
      experienceLevel: formData.experienceLevel,
      location: formData.isRemote ? 'remote' : formData.location || 'remote',
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      budgetType: formData.budgetType,
      ...(formData.budgetType !== 'negotiable' && {
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
      }),
      requirements: formData.requirements?.trim() || undefined,
      duration: formData.duration?.trim() || undefined,
      campaignDuration: formData.campaignDuration?.trim() || undefined,
      urgency: formData.urgency,
      deliverables: formData.deliverables.filter(d => d.trim()),
      isClanAllowed: formData.isClanAllowed,
      maxApplications: formData.maxApplications || undefined,
      tags: formData.tags.filter(tag => tag.trim()),
      platformRequirements: formData.platformRequirements.filter(req => req.trim()),
      followerRequirements: formData.followerRequirements.filter(req => req.platform.trim() && req.minFollowers > 0),
      locationRequirements: formData.locationRequirements.filter(req => req.trim()),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!validateForm()) {
      setIsSaving(false);
      return;
    }

    try {
      const submissionData = prepareSubmissionData();
      const response = await apiClient.put(`/api/gig/${gigId}`, submissionData);
      
      if (response.success) {
        alert('Gig updated successfully!');
        router.push(`/gig/${gigId}`);
      } else {
        throw new Error(response.error || 'Failed to update gig');
      }
    } catch (error: any) {
      console.error('Failed to update gig:', error);
      setError(error.message || 'Failed to update gig');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishDraft = async () => {
    setIsPublishing(true);
    setError(null);

    if (!validateForm()) {
      setIsPublishing(false);
      return;
    }

    try {
      // First update the gig
      const submissionData = prepareSubmissionData();
      const updateResponse = await apiClient.put(`/api/gig/${gigId}`, submissionData);
      
      if (!updateResponse.success) {
        throw new Error('Failed to update gig before publishing');
      }

      // Then publish
      const publishResponse = await apiClient.post(`/api/gig/draft/${gigId}/publish`);
      
      if (publishResponse.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('publishDraftIntent');
        }
        alert('Gig published successfully!');
        router.push('/my-gigs');
      } else {
        throw new Error('Failed to publish gig');
      }
    } catch (error: any) {
      console.error('Failed to publish gig:', error);
      setError(error.message || 'Failed to publish gig');
    } finally {
      setIsPublishing(false);
    }
  };

  // Clear publish intent on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('publishDraftIntent');
      }
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to edit gigs.</p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (userType !== 'brand') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is only available for brand accounts.</p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-none mx-auto mb-4"></div>
          <p>Loading gig...</p>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Gig Not Found</h1>
          <p className="text-gray-600 mb-6">The gig you're trying to edit doesn't exist or you don't have permission to edit it.</p>
          <Link href="/my-gigs" className="btn-primary">
            Back to My Gigs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {shouldPublish ? 'Publish Draft' : 'Edit Gig'}
                  </h1>
                  <p className="text-gray-600">
                    {shouldPublish 
                      ? 'Review and complete your gig details before publishing'
                      : 'Update your gig details'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link href={`/gig/${gigId}`} className="btn-secondary">
                    ← Back to Gig
                  </Link>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-none">
                {error}
              </div>
            )}

            {shouldPublish && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-none p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Publish?</h3>
                <p className="text-blue-700">
                  Please review and complete your gig details before publishing. 
                  Once published, your gig will be visible to all users in the marketplace.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gig Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Create Instagram content for fashion brand"
                      maxLength={200}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.title.length}/200 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows={6}
                      placeholder="Describe your project, requirements, and what you're looking for..."
                      maxLength={2000}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/2000 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.category ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role Required *
                      </label>
                      <select
                        value={formData.roleRequired}
                        onChange={(e) => handleInputChange('roleRequired', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.roleRequired ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a role</option>
                        {roleOptions.map(role => (
                          <option key={role} value={role}>
                            {role.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </option>
                        ))}
                      </select>
                      {errors.roleRequired && (
                        <p className="mt-1 text-sm text-red-600">{errors.roleRequired}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Level
                      </label>
                      <select
                        value={formData.experienceLevel}
                        onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {urgencyLevels.map(level => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRemote"
                      checked={formData.isRemote}
                      onChange={(e) => handleInputChange('isRemote', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRemote" className="ml-2 block text-sm text-gray-700">
                      Remote work allowed
                    </label>
                  </div>

                  {!formData.isRemote && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specific Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Mumbai, Delhi, Bangalore"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Budget */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Budget</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Type *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['fixed', 'hourly', 'negotiable'].map(type => (
                        <label key={type} className="flex items-center p-3 border rounded-none cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="budgetType"
                            value={type}
                            checked={formData.budgetType === type}
                            onChange={(e) => handleInputChange('budgetType', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm font-medium">
                            {type === 'fixed' ? 'Fixed Project Budget' : 
                             type === 'hourly' ? 'Hourly Rate' : 'Negotiable'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.budgetType !== 'negotiable' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.budgetType === 'fixed' ? 'Minimum Budget (₹) *' : 'Minimum Rate (₹/hour) *'}
                        </label>
                        <input
                          type="number"
                          value={formData.budgetMin || ''}
                          onChange={(e) => handleInputChange('budgetMin', Number(e.target.value) || undefined)}
                          className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.budgetMin ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="1"
                          placeholder="Enter minimum amount"
                        />
                        {errors.budgetMin && (
                          <p className="mt-1 text-sm text-red-600">{errors.budgetMin}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.budgetType === 'fixed' ? 'Maximum Budget (₹) *' : 'Maximum Rate (₹/hour) *'}
                        </label>
                        <input
                          type="number"
                          value={formData.budgetMax || ''}
                          onChange={(e) => handleInputChange('budgetMax', Number(e.target.value) || undefined)}
                          className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.budgetMax ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="1"
                          placeholder="Enter maximum amount"
                        />
                        {errors.budgetMax && (
                          <p className="mt-1 text-sm text-red-600">{errors.budgetMax}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Required */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Skills Required *</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Skills
                    </label>
                    <div className="space-y-2">
                      {formData.skillsRequired.map((skill, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => updateTag('skillsRequired', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Content Writing, Photo Editing, Social Media"
                          />
                          <button
                            type="button"
                            onClick={() => removeTag('skillsRequired', index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTag('skillsRequired')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Add skill
                      </button>
                    </div>
                    {errors.skillsRequired && (
                      <p className="mt-1 text-sm text-red-600">{errors.skillsRequired}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Deliverables *</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Deliverables
                    </label>
                    <div className="space-y-2">
                      {formData.deliverables.map((deliverable, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={deliverable}
                            onChange={(e) => updateTag('deliverables', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Final logo files, Source files, Brand guidelines"
                          />
                          <button
                            type="button"
                            onClick={() => removeTag('deliverables', index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTag('deliverables')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Add deliverable
                      </button>
                    </div>
                    {errors.deliverables && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliverables}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Requirements */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Additional Requirements</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Duration
                    </label>
                    <select
                      value={formData.duration || ''}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select duration</option>
                      <option value="1 day">1 day</option>
                      <option value="2-3 days">2-3 days</option>
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                      <option value="1 month">1 month</option>
                      <option value="2-3 months">2-3 months</option>
                      <option value="3+ months">3+ months</option>
                      <option value="Ongoing">Ongoing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Duration (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.campaignDuration || ''}
                      onChange={(e) => handleInputChange('campaignDuration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 3 months, ongoing, 6 weeks"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      How long should the campaign or content be active for?
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Applications (optional)
                    </label>
                    <input
                      type="number"
                      value={formData.maxApplications || ''}
                      onChange={(e) => handleInputChange('maxApplications', Number(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Requirements (optional)
                    </label>
                    <textarea
                      value={formData.requirements || ''}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Any additional requirements or notes for applicants..."
                    />
                  </div>
                </div>
              </div>

              {/* Platform Requirements */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Platform Requirements</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Platforms (optional)
                    </label>
                    <div className="space-y-2">
                      {formData.platformRequirements.map((platform, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={platform}
                            onChange={(e) => updateTag('platformRequirements', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Instagram, YouTube, TikTok, LinkedIn"
                          />
                          <button
                            type="button"
                            onClick={() => removePlatformRequirement(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addPlatformRequirement}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Add platform
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follower Requirements */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Follower Requirements</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Follower Requirements (optional)
                    </label>
                    <div className="space-y-2">
                      {formData.followerRequirements.map((req, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={req.platform}
                            onChange={(e) => updateFollowerRequirement(index, 'platform', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Platform (e.g., Instagram)"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={req.minFollowers}
                              onChange={(e) => updateFollowerRequirement(index, 'minFollowers', Number(e.target.value))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Min followers"
                              min="0"
                            />
                            <button
                              type="button"
                              onClick={() => removeFollowerRequirement(index)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFollowerRequirement}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Add follower requirement
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Requirements */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Location Requirements</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Locations (optional)
                    </label>
                    <div className="space-y-2">
                      {formData.locationRequirements.map((location, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => updateTag('locationRequirements', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Mumbai, Delhi, India, Global"
                          />
                          <button
                            type="button"
                            onClick={() => removeLocationRequirement(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addLocationRequirement}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Add location
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Specify target geographic locations for the campaign or content audience.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (optional)
                    </label>
                    <div className="space-y-2">
                      {formData.tags.map((tag, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => updateTag('tags', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., urgent, startup, remote"
                          />
                          <button
                            type="button"
                            onClick={() => removeTag('tags', index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTag('tags')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Add tag
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clan Settings */}
              <div className="card-glass p-6">
                <h2 className="text-xl font-semibold mb-4">Clan Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isClanAllowed"
                      checked={formData.isClanAllowed}
                      onChange={(e) => handleInputChange('isClanAllowed', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isClanAllowed" className="ml-2 block text-sm text-gray-700">
                      Allow clan applications
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Allow teams of creators to apply for this gig together.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              {shouldPublish ? (
                <div className="flex items-center justify-between">
                  <Link href={`/gig/${gigId}`} className="btn-secondary">
                    Cancel
                  </Link>
                  <div className="space-x-3">
                    <button
                      type="submit"
                      disabled={isSaving || isPublishing}
                      className={`btn-ghost ${(isSaving || isPublishing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSaving ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button
                      type="button"
                      onClick={handlePublishDraft}
                      disabled={isSaving || isPublishing}
                      className={`btn-primary ${(isSaving || isPublishing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isPublishing ? 'Publishing...' : 'Publish Gig'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Link href={`/gig/${gigId}`} className="btn-secondary">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`btn-primary ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? 'Updating...' : 'Update Gig'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Tips */}
              <div className="card-glass p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">💡 Tips for Success</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Write a clear, descriptive title</li>
                  <li>• Provide detailed requirements</li>
                  <li>• Set realistic budget and timeline</li>
                  <li>• Be specific about deliverables</li>
                  <li>• Include relevant skills and experience level</li>
                  {shouldPublish && (
                    <li className="text-blue-600 font-medium">• Review all details before publishing</li>
                  )}
                </ul>
              </div>

              {/* Preview */}
              <div className="card-glass p-6">
                <h3 className="text-lg font-semibold mb-4">📝 Gig Preview</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Title:</span>
                    <p className="text-gray-600 mt-1">{formData.title || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <p className="text-gray-600 mt-1">
                      {formData.category ? 
                        formData.category.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ') : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span>
                    <p className="text-gray-600 mt-1">
                      {formData.budgetType === 'negotiable' ? 'Negotiable' :
                       formData.budgetMin && formData.budgetMax ? 
                        `₹${formData.budgetMin} - ₹${formData.budgetMax}` : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Skills Required:</span>
                    <p className="text-gray-600 mt-1">
                      {formData.skillsRequired.filter(s => s.trim()).length > 0 ? 
                        formData.skillsRequired.filter(s => s.trim()).join(', ') : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Deliverables:</span>
                    <p className="text-gray-600 mt-1">
                      {formData.deliverables.filter(d => d.trim()).length > 0 ? 
                        formData.deliverables.filter(d => d.trim()).join(', ') : 'Not specified'
                      }
                    </p>
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
