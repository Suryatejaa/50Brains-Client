'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface BackendGig {
    
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OPEN';
  
  // Budget & Pricing - backend enum values
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  budgetMin?: number;
  budgetMax?: number;
  
  // Timeline
  deadline?: string;
  
  // Requirements - backend field names
  roleRequired: string;
  skillsRequired: string[];
  experienceLevel: string;
  urgency: string;
  requirements?: string;
  
  // Deliverables & Applications
  deliverables: string[];
  maxApplications?: number;
  isClanAllowed: boolean;
  
  // Additional
  tags: string[];
  
  // Meta fields
  posterId?: string;
  postedById?: string;
  brand: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
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

export default function EditGigPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const [gig, setGig] = useState<BackendGig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gigId = params.id as string;
  const userType = getUserTypeForRole(currentRole);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    roleRequired: '',
    budgetType: 'fixed' as 'fixed' | 'hourly' | 'negotiable',
    budgetMin: 0,
    budgetMax: 0,
    deadline: '',
    skillsRequired: [''],
    experienceLevel: '',
    urgency: 'normal' as 'urgent' | 'normal' | 'flexible',
    requirements: '',
    deliverables: [''],
    maxApplications: null as number | null,
    isClanAllowed: false,
    tags: ['']
    // status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OPEN'
  });

  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    category: '',
    roleRequired: '',
    budgetMin: '',
    budgetMax: ''
  });

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
        
        // Check ownership - check if user ID matches the poster
        const userId = user?.id;
        const canEdit = gigData.brand.id === userId || gigData.postedById === userId;

        //checking if the user is the owner or has the right role
        console.log(gigData)
        if (!canEdit) {
          setError('You do not have permission to edit this gig');
          return;
        }
        
        setGig(gigData);
        
        // Populate form with backend field names
        setFormData({
          title: gigData.title || '',
          description: gigData.description || '',
          category: gigData.category || '',
          roleRequired: gigData.roleRequired || '',
          budgetType: (gigData.budgetType as 'fixed' | 'hourly' | 'negotiable') || 'fixed',
          budgetMin: gigData.budgetMin || 0,
          budgetMax: gigData.budgetMax || 0,
          deadline: gigData.deadline ? new Date(gigData.deadline).toISOString().split('T')[0] : '',
          skillsRequired: gigData.skillsRequired && gigData.skillsRequired.length > 0 ? gigData.skillsRequired : [''],
          experienceLevel: gigData.experienceLevel || '',
          urgency: (gigData.urgency as 'urgent' | 'normal' | 'flexible') || 'normal',
          requirements: gigData.requirements || '',
          deliverables: gigData.deliverables && gigData.deliverables.length > 0 ? gigData.deliverables : [''],
          maxApplications: gigData.maxApplications ?? null,
          isClanAllowed: gigData.isClanAllowed ?? false,
          tags: gigData.tags && gigData.tags.length > 0 ? gigData.tags : [''],
        //   status: (gigData.status === 'OPEN' ? 'ACTIVE' : gigData.status) as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OPEN'
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const arrayField = prev[field as keyof typeof prev] as string[];
      if (!Array.isArray(arrayField)) return prev;
      
      return {
        ...prev,
        [field]: arrayField.map((item: string, i: number) => 
          i === index ? value : item
        )
      };
    });
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => {
      const arrayField = prev[field as keyof typeof prev] as string[];
      if (!Array.isArray(arrayField)) return prev;
      
      return {
        ...prev,
        [field]: [...arrayField, '']
      };
    });
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const arrayField = prev[field as keyof typeof prev] as string[];
      if (!Array.isArray(arrayField)) return prev;
      
      return {
        ...prev,
        [field]: arrayField.filter((_: any, i: number) => i !== index)
      };
    });
  };

  const validateForm = () => {
    const errors = {
      title: '',
      description: '',
      category: '',
      roleRequired: '',
      budgetMin: '',
      budgetMax: ''
    };

    let isValid = true;

    // Required field validation
    if (!formData.title || typeof formData.title !== 'string' || !formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }

    if (!formData.description || typeof formData.description !== 'string' || !formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }

    if (!formData.category) {
      errors.category = 'Category is required';
      isValid = false;
    }

    if (!formData.roleRequired || typeof formData.roleRequired !== 'string' || !formData.roleRequired.trim()) {
      errors.roleRequired = 'Role required is required';
      isValid = false;
    }

    // Budget validation for non-negotiable types
    if (formData.budgetType !== 'negotiable') {
      if (!formData.budgetMin || formData.budgetMin <= 0) {
        errors.budgetMin = 'Minimum budget must be greater than 0';
        isValid = false;
      }

      if (!formData.budgetMax || formData.budgetMax <= 0) {
        errors.budgetMax = 'Maximum budget must be greater than 0';
        isValid = false;
      }

      if (formData.budgetMin && formData.budgetMax && formData.budgetMin > formData.budgetMax) {
        errors.budgetMax = 'Maximum budget must be greater than minimum budget';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setFormErrors({
      title: '',
      description: '',
      category: '',
      roleRequired: '',
      budgetMin: '',
      budgetMax: ''
    });

    // Validate form
    if (!validateForm()) {
      setIsSaving(false);
      setError('Please fix the validation errors below');
      return;
    }

    try {
      // Clean up data for backend - match Postman structure
      const cleanedData = {
        // Required fields
        title: (formData.title || '').trim(),
        description: (formData.description || '').trim(),
        category: formData.category,
        roleRequired: (formData.roleRequired || '').trim(),
        
        // Budget (only if not negotiable)
        ...(formData.budgetType !== 'negotiable' && {
          budgetMin: Number(formData.budgetMin),
          budgetMax: Number(formData.budgetMax),
        }),
        budgetType: formData.budgetType,
        
        // Optional fields
        ...(formData.deadline && {
          deadline: new Date(formData.deadline).toISOString()
        }),
        urgency: formData.urgency,
        ...(formData.maxApplications && {
          maxApplications: Number(formData.maxApplications)
        }),
        
        // Requirements and details
        ...(formData.requirements && typeof formData.requirements === 'string' && formData.requirements.trim() && {
          requirements: formData.requirements.trim()
        }),
        deliverables: (formData.deliverables || []).filter((item: string) => item && typeof item === 'string' && item.trim() !== ''),
        
        // Skills and experience
        ...(formData.experienceLevel && {
          experienceLevel: formData.experienceLevel
        }),
        skillsRequired: (formData.skillsRequired || []).filter((item: string) => item && typeof item === 'string' && item.trim() !== ''),
        tags: (formData.tags || []).filter((item: string) => item && typeof item === 'string' && item.trim() !== ''),
        
        // Settings
        isClanAllowed: formData.isClanAllowed,
        // status: formData.status
      };

      console.log('Sending data to API:', JSON.stringify(cleanedData, null, 2));
      console.log('Budget type value:', formData.budgetType, 'Type:', typeof formData.budgetType);
      
      const response = await apiClient.put(`/api/gig/${gigId}`, cleanedData);
      console.log('API response:', response);
      
      if (response.success) {
        alert('Gig updated successfully!');
        router.push(`/gig/${gigId}`);
      } else {
        // Handle API error response - response might be of error type
        console.log('API returned error:', response);
        let errorMessage = 'Failed to update gig';
        
        const errorResponse = response as any; // Type assertion for error response
        
        if (errorResponse.details && Array.isArray(errorResponse.details)) {
          errorMessage = `Validation failed: ${errorResponse.details.join(', ')}`;
        } else if (errorResponse.error) {
          errorMessage = errorResponse.error;
        } else if (errorResponse.message) {
          errorMessage = errorResponse.message;
        }
        
        setError(errorMessage);
      }
    } catch (error: any) {
      console.error('Failed to update the gig:', error);
      
      // Extract detailed error information
      let errorMessage = 'Failed to update gig';
      
      if (error.details && Array.isArray(error.details)) {
        // Backend validation errors
        errorMessage = `Validation failed: ${error.details.join(', ')}`;
      } else if (error.error) {
        // Backend error message
        errorMessage = error.error;
      } else if (error.message) {
        // JavaScript error message
        errorMessage = error.message;
      }
      
      console.log('Detailed error:', {
        error: error.error,
        details: error.details,
        message: error.message,
        full: error
      });
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Gig</h1>
              <p className="text-gray-600">Update your gig details</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/gig/${gigId}`} className="btn-secondary">
                ← Back to Gig
              </Link>
              <Link href="/my-gigs" className="btn-secondary">
                My Gigs
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  placeholder="e.g., Create Instagram content for fashion brand"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={4}
                  required
                  placeholder="Describe what you need help with..."
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
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
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
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
                <select
                  value={formData.budgetType}
                  onChange={(e) => handleInputChange('budgetType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="fixed">Fixed Project Budget</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>

              {formData.budgetType !== 'negotiable' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.budgetType === 'fixed' ? 'Minimum Budget (₹) *' : 'Minimum Rate (₹/hour) *'}
                    </label>
                    <input
                      type="number"
                      value={formData.budgetMin}
                      onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.budgetMin ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                      required
                    />
                    {formErrors.budgetMin && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.budgetMin}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.budgetType === 'fixed' ? 'Maximum Budget (₹) *' : 'Maximum Rate (₹/hour) *'}
                    </label>
                    <input
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.budgetMax ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                      required
                    />
                    {formErrors.budgetMax && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.budgetMax}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="card-glass p-6">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Required *
                  </label>
                  <input
                    type="text"
                    value={formData.roleRequired}
                    onChange={(e) => handleInputChange('roleRequired', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.roleRequired ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    placeholder="e.g., influencer, content-creator, photographer"
                  />
                  {formErrors.roleRequired && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.roleRequired}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any experience level</option>
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {urgencyLevels.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Applications (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.maxApplications || ''}
                    onChange={(e) => handleInputChange('maxApplications', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements (optional)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any additional requirements or notes for applicants..."
                />
              </div>
            </div>
          </div>

          {/* Skills Required */}
          <div className="card-glass p-6">
            <h2 className="text-xl font-semibold mb-4">Skills Required</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills Required
                </label>
                {formData.skillsRequired.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('skillsRequired', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Content Writing, Photo Editing, Social Media"
                    />
                    {formData.skillsRequired.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('skillsRequired', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('skillsRequired')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add skill
                </button>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="card-glass p-6">
            <h2 className="text-xl font-semibold mb-4">Deliverables</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Deliverables
                </label>
                {formData.deliverables.map((deliverable: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={deliverable}
                      onChange={(e) => handleArrayChange('deliverables', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Final logo files, Source files, Brand guidelines"
                    />
                    {formData.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('deliverables', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('deliverables')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add deliverable
                </button>
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
                {formData.tags.map((tag: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., urgent, startup, remote"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('tags', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('tags')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add tag
                </button>
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
            </div>
          </div>

          {/* Submit Button */}
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
        </form>
      </div>
    </div>
  );
}
