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
  budgetMin: number;
  budgetMax: number;
  
  // Timeline
  deadline: string;
  duration: string;
  campaignDuration: string;
  
  // Location
  location: string;
  
  // Requirements
  roleRequired: string;
  skillsRequired: string[];
  experienceLevel: string;
  urgency: string;
  requirements: string;
  
  // Targeting Requirements
  platformRequirements: string[];
  followerRequirements: Array<{platform: string; minFollowers: number}>;
  locationRequirements: string[];
  
  // Deliverables & Applications
  deliverables: string[];
  maxApplications: number;
  isClanAllowed: boolean;
  
  // Additional
  tags: string[];
  
  // Meta fields
  posterId: string;
  postedById: string;
  brand: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const categories = [
  'content-creation',
  'video-editing',
  'photography',
  'graphic-design',
  'social-media',
  'writing',
  'web-development',
  'mobile-development',
  'marketing',
  'consulting'
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

  console.log('Edit page - shouldPublish:', shouldPublish);
  console.log('Edit page - search param publish:', searchParams.get('publish'));
  console.log('Edit page - sessionStorage publishDraftIntent:', typeof window !== 'undefined' ? sessionStorage.getItem('publishDraftIntent') : 'server-side');

  const gigId = params.id as string;
  const userType = getUserTypeForRole(currentRole);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    roleRequired: '',
    skillsRequired: [''],
    experienceLevel: '',
    location: '',
    isRemote: true,
    deadline: '',
    budgetType: 'fixed' as 'fixed' | 'hourly' | 'negotiable',
    budgetMin: 0,
    budgetMax: 0,
    requirements: '',
    duration: '',
    campaignDuration: '',
    urgency: 'normal' as 'urgent' | 'normal' | 'flexible',
    deliverables: [''],
    maxApplications: null as number | null,
    isClanAllowed: false,
    tags: [''],
    platformRequirements: [''],
    followerRequirements: [{ platform: '', minFollowers: 0 }],
    locationRequirements: ['']
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
        const canEdit = gigData.brand?.id === userId || gigData.postedById === userId;

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
          skillsRequired: gigData.skillsRequired && gigData.skillsRequired.length > 0 ? gigData.skillsRequired : [''],
          experienceLevel: gigData.experienceLevel || '',
          location: gigData.location === 'remote' ? '' : (gigData.location || ''),
          isRemote: gigData.location === 'remote' || !gigData.location,
          deadline: gigData.deadline ? new Date(gigData.deadline).toISOString().split('T')[0] : '',
          budgetType: (gigData.budgetType as 'fixed' | 'hourly' | 'negotiable') || 'fixed',
          budgetMin: gigData.budgetMin || 0,
          budgetMax: gigData.budgetMax || 0,
          requirements: gigData.requirements && gigData.requirements !== 'N/A' ? gigData.requirements : '',
          duration: gigData.duration || '',
          campaignDuration: gigData.campaignDuration || '',
          urgency: (gigData.urgency as 'urgent' | 'normal' | 'flexible') || 'normal',
          deliverables: gigData.deliverables && gigData.deliverables.length > 0 ? gigData.deliverables : [''],
          maxApplications: gigData.maxApplications ?? null,
          isClanAllowed: gigData.isClanAllowed ?? false,
          tags: gigData.tags && gigData.tags.length > 0 ? gigData.tags : [''],
          platformRequirements: gigData.platformRequirements && gigData.platformRequirements.length > 0 ? gigData.platformRequirements : [''],
          followerRequirements: gigData.followerRequirements && gigData.followerRequirements.length > 0 ? gigData.followerRequirements : [{ platform: '', minFollowers: 0 }],
          locationRequirements: gigData.locationRequirements && gigData.locationRequirements.length > 0 ? gigData.locationRequirements : ['']
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

  const handleFollowerRequirementChange = (index: number, field: 'platform' | 'minFollowers', value: string | number) => {
    setFormData(prev => {
      const newFollowerReqs = [...prev.followerRequirements];
      newFollowerReqs[index] = {
        ...newFollowerReqs[index],
        [field]: field === 'minFollowers' ? Number(value) : value
      };
      return {
        ...prev,
        followerRequirements: newFollowerReqs
      };
    });
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

  const validateForm = () => {
    const errors = {
      title: '',
      description: '',
      category: '',
      roleRequired: '',
      budgetMin: '',
      budgetMax: ''
    };

    const validationMessages: string[] = [];
    let isValid = true;

    // Title validation (5-200 characters) - matching create-gig
    if (!formData.title || typeof formData.title !== 'string' || !formData.title.trim()) {
      errors.title = 'Title is required';
      validationMessages.push('• Title is required');
      isValid = false;
    } else if (formData.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long';
      validationMessages.push(`• Title is too short (${formData.title.trim().length}/5 characters minimum)`);
      isValid = false;
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Title must not exceed 200 characters';
      validationMessages.push(`• Title is too long (${formData.title.trim().length}/200 characters maximum)`);
      isValid = false;
    }

    // Description validation (10-2000 characters) - matching create-gig
    if (!formData.description || typeof formData.description !== 'string' || !formData.description.trim()) {
      errors.description = 'Description is required';
      validationMessages.push('• Description is required');
      isValid = false;
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
      validationMessages.push(`• Description is too short (${formData.description.trim().length}/10 characters minimum)`);
      isValid = false;
    } else if (formData.description.trim().length > 2000) {
      errors.description = 'Description must not exceed 2000 characters';
      validationMessages.push(`• Description is too long (${formData.description.trim().length}/2000 characters maximum)`);
      isValid = false;
    }

    // Category validation
    if (!formData.category) {
      errors.category = 'Please select a category';
      validationMessages.push('• Please select a category from the dropdown');
      isValid = false;
    }

    // Role required validation
    if (!formData.roleRequired || typeof formData.roleRequired !== 'string' || !formData.roleRequired.trim()) {
      errors.roleRequired = 'Please select a role required';
      validationMessages.push('• Please select a role required from the dropdown');
      isValid = false;
    }

    // Skills validation - matching create-gig
    if (shouldPublish) {
      const validSkills = formData.skillsRequired.filter(skill => skill && skill.trim());
      if (validSkills.length === 0) {
        validationMessages.push('• Please add at least one required skill before publishing');
        isValid = false;
      }
    }

    // Deliverables validation - matching create-gig  
    if (shouldPublish) {
      const validDeliverables = formData.deliverables.filter(d => d && d.trim());
      if (validDeliverables.length === 0) {
        validationMessages.push('• Please add at least one deliverable before publishing');
        isValid = false;
      }
    }

    // Experience level validation for publishing
    if (shouldPublish && !formData.experienceLevel) {
      validationMessages.push('• Please select an experience level before publishing');
      isValid = false;
    }

    // Duration validation for publishing
    if (shouldPublish && (!formData.duration || !formData.duration.trim())) {
      validationMessages.push('• Please select a project duration before publishing');
      isValid = false;
    }

    // Budget validation for non-negotiable types
    if (formData.budgetType !== 'negotiable') {
      if (!formData.budgetMin || formData.budgetMin <= 0) {
        errors.budgetMin = 'Please enter a valid minimum budget';
        validationMessages.push('• Please enter a valid minimum budget (must be greater than 0)');
        isValid = false;
      }

      if (!formData.budgetMax || formData.budgetMax <= 0) {
        errors.budgetMax = 'Please enter a valid maximum budget';
        validationMessages.push('• Please enter a valid maximum budget (must be greater than 0)');
        isValid = false;
      }

      if (formData.budgetMin && formData.budgetMax && formData.budgetMin > formData.budgetMax) {
        errors.budgetMax = 'Maximum budget must be greater than minimum budget';
        validationMessages.push(`• Maximum budget (₹${formData.budgetMax}) must be greater than minimum budget (₹${formData.budgetMin})`);
        isValid = false;
      }
    }

    // Set a comprehensive error message with specific issues
    if (validationMessages.length > 0) {
      const errorHeader = shouldPublish ? 
        'Please fix the following issues before publishing:' : 
        'Please fix the following issues:';
      setError(`${errorHeader}\n\n${validationMessages.join('\n')}`);
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
        
        // Location
        location: formData.isRemote ? 'remote' : formData.location || undefined,
        
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
        ...(formData.duration && typeof formData.duration === 'string' && formData.duration.trim() && {
          duration: formData.duration.trim()
        }),
        ...(formData.campaignDuration && formData.campaignDuration.trim() && {
          campaignDuration: formData.campaignDuration.trim()
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
        
        // New targeting fields
        platformRequirements: (formData.platformRequirements || []).filter((item: string) => item && typeof item === 'string' && item.trim() !== ''),
        followerRequirements: (formData.followerRequirements || []).filter((req: any) => req.platform && req.platform.trim() && req.minFollowers > 0),
        locationRequirements: (formData.locationRequirements || []).filter((item: string) => item && typeof item === 'string' && item.trim() !== ''),
        
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

  const handlePublishDraft = async () => {
    setIsPublishing(true);
    setError(null);
    setFormErrors({
      title: '',
      description: '',
      category: '',
      roleRequired: '',
      budgetMin: '',
      budgetMax: ''
    });

    // Validate form first
    if (!validateForm()) {
      setIsPublishing(false);
      return;
    }

    try {
      // First update the gig with current form data
      const cleanedData = {
        // Required fields
        title: (formData.title || '').trim(),
        description: (formData.description || '').trim(),
        category: formData.category,
        roleRequired: (formData.roleRequired || '').trim(),
        
        // Location
        location: formData.isRemote ? 'remote' : formData.location || undefined,
        
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
        ...(formData.duration && typeof formData.duration === 'string' && formData.duration.trim() && {
          duration: formData.duration.trim()
        }),
        ...(formData.campaignDuration && formData.campaignDuration.trim() && {
          campaignDuration: formData.campaignDuration.trim()
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
        
        // New targeting fields
        platformRequirements: (formData.platformRequirements || []).filter((item: string) => item && typeof item === 'string' && item.trim() !== ''),
        followerRequirements: (formData.followerRequirements || []).filter((req: any) => req.platform && req.platform.trim() && req.minFollowers > 0),
        locationRequirements: (formData.locationRequirements || []).filter((item: string) => item && typeof item === 'string' && item.trim() !== ''),
        
        // Settings
        isClanAllowed: formData.isClanAllowed,
      };

      // Update the gig first
      const updateResponse = await apiClient.put(`/api/gig/${gigId}`, cleanedData);
      
      if (!updateResponse.success) {
        throw new Error('Failed to update gig before publishing');
      }

      // Then publish the draft
      const publishResponse = await apiClient.post(`/api/gig/draft/${gigId}/publish`);
      
      if (publishResponse.success) {
        // Clear publish intent
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('publishDraftIntent');
          // Set a flag to force refresh the my-gigs page
          sessionStorage.setItem('refresh-my-gigs', 'true');
        }
        
        alert('Gig published successfully!');
        // Use replace instead of push to avoid back navigation issues
        // Add timestamp to force refresh of my-gigs page data
        router.replace('/my-gigs?refresh=' + Date.now());
      } else {
        throw new Error('Failed to publish gig');
      }
    } catch (error: any) {
      console.error('Failed to publish the gig:', error);
      
      let errorMessage = 'Failed to publish gig';
      
      if (error.details && Array.isArray(error.details)) {
        errorMessage = `Validation failed: ${error.details.join(', ')}`;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  // Clear publish intent when component unmounts or navigation happens
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
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-none">
            <div className="whitespace-pre-line">{error}</div>
          </div>
        )}

        {shouldPublish && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-none p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Publishing Checklist</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-none ${formData.title && formData.title.trim().length >= 5 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className={formData.title && formData.title.trim().length >= 5 ? 'text-green-700' : 'text-gray-600'}>
                  Title (5+ characters) {formData.title ? `- ${formData.title.trim().length}/200` : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-none ${formData.description && formData.description.trim().length >= 10 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className={formData.description && formData.description.trim().length >= 10 ? 'text-green-700' : 'text-gray-600'}>
                  Description (10+ characters) {formData.description ? `- ${formData.description.trim().length}/2000` : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-none ${formData.category ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className={formData.category ? 'text-green-700' : 'text-gray-600'}>
                  Category selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-none ${formData.roleRequired ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className={formData.roleRequired ? 'text-green-700' : 'text-gray-600'}>
                  Role required selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-none ${formData.skillsRequired.filter(skill => skill && skill.trim()).length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className={formData.skillsRequired.filter(skill => skill && skill.trim()).length > 0 ? 'text-green-700' : 'text-gray-600'}>
                  At least one skill required ({formData.skillsRequired.filter(skill => skill && skill.trim()).length} added)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-none ${formData.deliverables.filter(d => d && d.trim()).length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className={formData.deliverables.filter(d => d && d.trim()).length > 0 ? 'text-green-700' : 'text-gray-600'}>
                  At least one deliverable ({formData.deliverables.filter(d => d && d.trim()).length} added)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-none ${formData.experienceLevel ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className={formData.experienceLevel ? 'text-green-700' : 'text-gray-600'}>
                  Experience level selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-none ${formData.duration && formData.duration.trim() ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className={formData.duration && formData.duration.trim() ? 'text-green-700' : 'text-gray-600'}>
                  Project duration selected
                </span>
              </div>
              {formData.budgetType !== 'negotiable' && (
                <>
                  <div className="flex items-center space-x-2">
                    <span className={`w-4 h-4 rounded-none ${formData.budgetMin && formData.budgetMin > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className={formData.budgetMin && formData.budgetMin > 0 ? 'text-green-700' : 'text-gray-600'}>
                      Minimum budget set
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-4 h-4 rounded-none ${formData.budgetMax && formData.budgetMax > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className={formData.budgetMax && formData.budgetMax > 0 ? 'text-green-700' : 'text-gray-600'}>
                      Maximum budget set
                    </span>
                  </div>
                </>
              )}
            </div>
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
                    formErrors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  placeholder="e.g., Create Instagram content for fashion brand"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
                {shouldPublish && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.title.length}/200 characters
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={shouldPublish ? 6 : 4}
                  required
                  placeholder={shouldPublish ? "Describe your project, requirements, and what you're looking for..." : "Describe what you need help with..."}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
                {shouldPublish && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.description.length}/2000 characters
                  </p>
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
                    className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="content-creation">Content Creation</option>
                    <option value="video-editing">Video Editing</option>
                    <option value="photography">Photography</option>
                    <option value="graphic-design">Graphic Design</option>
                    <option value="social-media">Social Media</option>
                    <option value="writing">Writing & Copywriting</option>
                    <option value="web-development">Web Development</option>
                    <option value="mobile-development">Mobile Development</option>
                    <option value="marketing">Marketing</option>
                    <option value="consulting">Consulting</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="mb-3 flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isRemote}
                      onChange={(e) => handleInputChange('isRemote', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Remote work</span>
                  </label>
                </div>
                {!formData.isRemote && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select duration</option>
                  <option value="1 day">1 day</option>
                  <option value="2 days">2 days</option>
                  <option value="3 days">3 days</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="3 weeks">3 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="2 months">2 months</option>
                  <option value="3 months">3 months</option>
                  <option value="ongoing">Ongoing</option>
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                      className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                  <select
                    value={formData.roleRequired}
                    onChange={(e) => handleInputChange('roleRequired', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.roleRequired ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select role</option>
                    <option value="influencer">Influencer</option>
                    <option value="content-creator">Content Creator</option>
                    <option value="video-editor">Video Editor</option>
                    <option value="photographer">Photographer</option>
                    <option value="graphic-designer">Graphic Designer</option>
                    <option value="copywriter">Copywriter</option>
                    <option value="social-media-manager">Social Media Manager</option>
                    <option value="writer">Writer</option>
                    <option value="designer">Designer</option>
                    <option value="editor">Editor</option>
                    <option value="developer">Developer</option>
                    <option value="marketer">Marketer</option>
                  </select>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., urgent, startup, remote"
                    />
                    {formData.tags.length >= 1 && (
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

          {/* Campaign Duration */}
          <div className="card-glass p-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Duration</h2>
            
            <div className="space-y-4">
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
                {formData.platformRequirements.map((platform: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={platform}
                      onChange={(e) => handleArrayChange('platformRequirements', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Instagram, YouTube, TikTok, LinkedIn"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('platformRequirements', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('platformRequirements')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add platform
                </button>
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
                {formData.followerRequirements.map((req: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={req.platform}
                      onChange={(e) => handleFollowerRequirementChange(index, 'platform', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Platform (e.g., Instagram)"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={req.minFollowers}
                        onChange={(e) => handleFollowerRequirementChange(index, 'minFollowers', Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Min followers"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => removeFollowerRequirement(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFollowerRequirement}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add follower requirement
                </button>
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
                {formData.locationRequirements.map((location: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => handleArrayChange('locationRequirements', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mumbai, Delhi, India, Global"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('locationRequirements', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('locationRequirements')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add location
                </button>
                <p className="mt-1 text-sm text-gray-500">
                  Specify target geographic locations for the campaign or content audience.
                </p>
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
          {shouldPublish ? (
            // Show publish flow buttons when coming from publish intent
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-none p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Publish?</h3>
                <p className="text-blue-700 mb-3">
                  Please review and complete your gig details before publishing. 
                  Once published, your gig will be visible to all users in the marketplace.
                </p>
              </div>
              
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
            </div>
          ) : (
            // Show regular edit buttons
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
    </div>
  );
}
