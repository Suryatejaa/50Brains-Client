'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGigs } from '@/hooks/useGigs';
import type { CreateGigData, GigStatus } from '@/types/gig.types';
import { Map, MapPin } from 'lucide-react';
import { GuidelinesModal } from '@/components/modals/GuidelinesModal';
import { useGuidelinesModal } from '@/hooks/useGuidelinesModal';

interface FormData {
  title: string;
  description: string;
  category: string;
  roleRequired: string;
  skillsRequired: string[];
  isPublic: boolean;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  location?: string;
  latitude?: number;
  longitude?: number;
  isRemote: boolean;
  gigType: 'PRODUCT' | 'VISIT' | 'REMOTE';
  address?: string;
  deadline?: string;
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  budgetMin?: number;
  budgetMax?: number;
  requirements?: string;
  duration?: string;
  urgency: 'urgent' | 'normal' | 'flexible';
  deliverables: string[];
  isClanAllowed: boolean;
  agreedToTerms: boolean;
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
  address?: string;
  general?: string;
}

export default function CreateGigPage() {
  const router = useRouter();
  const {
    createGig,
    createDraftGig,
    categories,
    popularSkills,
    creating,
    error,
    loadCategories,
    loadPopularSkills,
  } = useGigs();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    roleRequired: '', // Keep empty to require selection
    skillsRequired: [],
    experienceLevel: 'intermediate',
    location: '',
    latitude: undefined,
    longitude: undefined,
    isRemote: true,
    isPublic: true,
    gigType: 'REMOTE',
    address: '',
    deadline: '',
    budgetType: 'fixed',
    budgetMin: undefined,
    budgetMax: undefined,
    requirements: '',
    duration: '',
    urgency: 'normal',
    deliverables: [],
    isClanAllowed: true,
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDraft, setIsDraft] = useState(false);
  const { isOpen, guidelinesType, openGuidelines, closeGuidelines } =
    useGuidelinesModal();

  // Load categories and skills on mount
  useEffect(() => {
    loadCategories();
    loadPopularSkills();
  }, [loadCategories, loadPopularSkills]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation (5-200 characters)
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    // Description validation (10-2000 characters)
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description must not exceed 2000 characters';
    }

    // Category validation
    if (!formData.category.trim()) {
      newErrors.category = 'Please select a category';
    }

    // Role required validation
    if (!formData.roleRequired.trim()) {
      newErrors.roleRequired = 'Please select a role required';
    }

    // Skills validation
    if (formData.skillsRequired.length === 0) {
      newErrors.skillsRequired = 'Please add at least one required skill';
    }

    // Budget validation
    if (formData.budgetType !== 'negotiable') {
      if (!formData.budgetMin || formData.budgetMin <= 0) {
        newErrors.budgetMin = 'Please enter a valid minimum budget';
      }
      if (
        formData.budgetMax &&
        formData.budgetMin &&
        formData.budgetMax < formData.budgetMin
      ) {
        newErrors.budgetMax =
          'Maximum budget must be greater than minimum budget';
      }
    }

    // Deliverables validation
    if (formData.deliverables.length === 0) {
      newErrors.deliverables = 'Please add at least one deliverable';
    }

    // Address validation when gigType is VISIT
    if (formData.gigType === 'VISIT' && !formData.address?.trim()) {
      newErrors.address = 'Address is required for visit-type gigs';
    }

    // Terms agreement validation
    if (!formData.agreedToTerms) {
      newErrors.general =
        'You must agree to the Terms of Service and Community Guidelines';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    setIsDraft(asDraft);

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare base gig data (without new fields that might cause backend issues)
      const baseGigData: CreateGigData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        roleRequired: formData.roleRequired,
        skillsRequired: formData.skillsRequired,
        experienceLevel: formData.experienceLevel,
        location: formData.isRemote ? 'remote' : formData.location || undefined,
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : undefined,
        budgetType: formData.budgetType,
        budgetMin:
          formData.budgetMin && formData.budgetMin > 0
            ? Number(formData.budgetMin)
            : undefined,
        budgetMax:
          formData.budgetMax && formData.budgetMax > 0
            ? Number(formData.budgetMax)
            : undefined,
        requirements: formData.requirements?.trim() || undefined,
        duration: formData.duration?.trim() || undefined,
        urgency: formData.urgency,
        deliverables: formData.deliverables.filter((d) => d.trim()),
        isClanAllowed: formData.isClanAllowed,
        agreedToTerms: formData.agreedToTerms,
      };

      // Add new optional fields only if they have values
      const gigData: CreateGigData = {
        ...baseGigData,
        ...(formData.gigType && { gigType: formData.gigType }),
        ...(formData.gigType === 'VISIT' &&
          formData.address?.trim() && { address: formData.address.trim() }),
        ...(formData.latitude !== undefined && { latitude: formData.latitude }),
        ...(formData.longitude !== undefined && {
          longitude: formData.longitude,
        }),
      };

      // console.log('Creating gig with data:', JSON.stringify(gigData, null, 2));

      // Use appropriate API call based on draft status
      let gig;
      try {
        gig = asDraft
          ? await createDraftGig(gigData)
          : await createGig(gigData);
      } catch (apiError) {
        console.warn(
          'API call failed with new fields, trying with legacy format:',
          apiError
        );

        // If the API call fails, try again without the new fields
        const legacyGigData: CreateGigData = {
          title: baseGigData.title,
          description: baseGigData.description,
          category: baseGigData.category,
          roleRequired: baseGigData.roleRequired,
          skillsRequired: baseGigData.skillsRequired,
          experienceLevel: baseGigData.experienceLevel,
          location: baseGigData.location,
          deadline: baseGigData.deadline,
          budgetType: baseGigData.budgetType,
          budgetMin: baseGigData.budgetMin,
          budgetMax: baseGigData.budgetMax,
          requirements: baseGigData.requirements,
          duration: baseGigData.duration,
          urgency: baseGigData.urgency,
          deliverables: baseGigData.deliverables,
          isClanAllowed: baseGigData.isClanAllowed,
        };

        // console.log(
        //   'Retrying with legacy format:',
        //   JSON.stringify(legacyGigData, null, 2)
        // );

        gig = asDraft
          ? await createDraftGig(legacyGigData)
          : await createGig(legacyGigData);
      }

      if (asDraft) {
        alert('Gig saved as draft successfully!');
        router.push('/dashboard');
      } else {
        alert('Gig published successfully!');
        router.push('/marketplace');
      }
    } catch (error) {
      console.error('Error creating gig:', error);

      // Try to extract more detailed error information
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;

        // If it's an API error, try to get more details
        if (
          error.message.includes('500') ||
          error.message.includes('Internal Server Error')
        ) {
          errorMessage =
            'Server error: Please check if all required fields are properly formatted. The backend may not support some new fields yet.';
        }
      }

      console.error('Detailed error analysis:', {
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        formData: formData,
      });

      setErrors({
        general: errorMessage,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Special handling for gigType changes
      if (name === 'gigType') {
        if (value === 'REMOTE') {
          newData.isRemote = true;
        } else if (value === 'VISIT' || value === 'PRODUCT') {
          newData.isRemote = false;
          // Clear location coordinates when switching away from VISIT
          if (value === 'PRODUCT') {
            newData.latitude = undefined;
            newData.longitude = undefined;
            newData.address = '';
          }
        }
      }

      return newData;
    });

    // Clear field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skillsRequired.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skill],
      }));

      // Clear skills error when user adds a skill
      if (errors.skillsRequired) {
        setErrors((prev) => ({
          ...prev,
          skillsRequired: undefined,
        }));
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(
        (skill: string) => skill !== skillToRemove
      ),
    }));
  };

  const addDeliverable = (deliverable: string) => {
    if (deliverable && !formData.deliverables.includes(deliverable)) {
      setFormData((prev) => ({
        ...prev,
        deliverables: [...prev.deliverables, deliverable],
      }));

      // Clear deliverables error when user adds a deliverable
      if (errors.deliverables) {
        setErrors((prev) => ({
          ...prev,
          deliverables: undefined,
        }));
      }
    }
  };

  const removeDeliverable = (deliverableToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter(
        (deliverable: string) => deliverable !== deliverableToRemove
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-2">
          {/* Header */}
          <div className="mb-2">
            <h1 className="text-heading mb-2 text-3xl font-bold">
              Create a New Gig
            </h1>
            <p className="text-muted">
              Find the perfect creators for your project
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-2 lg:grid-cols-3">
            {/* General Error Display */}
            {errors.general && (
              <div className="mb-4 rounded-none border border-red-200 bg-red-50 p-4 lg:col-span-3">
                <p className="text-sm font-medium text-red-600">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Main Form */}
            <div className="space-y-1 lg:col-span-2">
              {/* Basic Information */}
              <div className="card-glass p-1">
                <h2 className="text-heading mb-2 text-xl font-semibold">
                  Basic Information
                </h2>

                <div className="space-y-2">
                  {/* Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className="text-body mb-2 block text-sm font-medium"
                    >
                      Gig Title *
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      className={`input w-full ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                      placeholder="e.g., Instagram Content Creator for Tech Brand"
                      value={formData.title}
                      onChange={handleChange}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.title.length}/200 characters
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="text-body mb-2 block text-sm font-medium"
                    >
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={6}
                      className={`input w-full ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                      placeholder="Describe your project, requirements, and what you're looking for..."
                      value={formData.description}
                      onChange={handleChange}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/2000 characters
                    </p>
                  </div>

                  {/* Category & Role Required */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="category"
                        className="text-body mb-2 block text-sm font-medium"
                      >
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        className={`input w-full ${errors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Select category</option>
                        <option value="content-creation">
                          Content Creation
                        </option>
                        <option value="video-editing">Video Editing</option>
                        <option value="photography">Photography</option>
                        <option value="graphic-design">Graphic Design</option>
                        <option value="social-media">Social Media</option>
                        <option value="writing">Writing & Copywriting</option>
                        <option value="web-development">Web Development</option>
                        <option value="mobile-development">
                          Mobile Development
                        </option>
                        <option value="marketing">Marketing</option>
                        <option value="consulting">Consulting</option>
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.category}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="roleRequired"
                        className="text-body mb-2 block text-sm font-medium"
                      >
                        Role Required *
                      </label>
                      <select
                        id="roleRequired"
                        name="roleRequired"
                        required
                        className={`input w-full ${errors.roleRequired ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                        value={formData.roleRequired}
                        onChange={handleChange}
                      >
                        <option value="">Select role</option>
                        <option value="influencer">Influencer</option>
                        <option value="content-creator">Content Creator</option>
                        <option value="video-editor">Video Editor</option>
                        <option value="photographer">Photographer</option>
                        <option value="graphic-designer">
                          Graphic Designer
                        </option>
                        <option value="copywriter">Copywriter</option>
                        <option value="social-media-manager">
                          Social Media Manager
                        </option>
                        <option value="writer">Writer</option>
                        <option value="designer">Designer</option>
                        <option value="editor">Editor</option>
                        <option value="developer">Developer</option>
                        <option value="marketer">Marketer</option>
                      </select>
                      {errors.roleRequired && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.roleRequired}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="card-glass p-1">
                <h2 className="text-heading mb-1 text-xl font-semibold">
                  Requirements
                </h2>

                <div className="space-y-2">
                  {/* Skills */}
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Required Skills *
                    </label>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {formData.skillsRequired.map((skill: string) => (
                        <span
                          key={skill}
                          className="bg-brand-primary/10 text-brand-primary flex items-center space-x-2 rounded-none px-3 py-1 text-sm"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
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
                        className={`input flex-1 ${errors.skillsRequired ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                        placeholder="Add a skill and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                    {errors.skillsRequired && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.skillsRequired}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        'Instagram Marketing',
                        'Video Editing',
                        'Photography',
                        'Graphic Design',
                        'Copywriting',
                      ].map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="bg-brand-soft border-brand-border text-body hover:bg-brand-light-blue/20 rounded border px-2 py-1 text-xs transition-colors"
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label
                      htmlFor="experienceLevel"
                      className="text-body mb-2 block text-sm font-medium"
                    >
                      Experience Level
                    </label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      className="input w-full"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  {/* Gig Type */}
                  <div>
                    <label className="text-body mb-3 block text-sm font-medium">
                      Gig Type *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          value: 'REMOTE',
                          label: 'Remote',
                          description: 'Work from anywhere',
                        },
                        {
                          value: 'VISIT',
                          label: 'Visit',
                          description: 'On-site work required',
                        },
                        {
                          value: 'PRODUCT',
                          label: 'Product',
                          description: 'Product-based delivery',
                        },
                      ].map((type) => (
                        <label
                          key={type.value}
                          className={`
                            cursor-pointer rounded-none border p-3 transition-all duration-200
                            ${
                              formData.gigType === type.value
                                ? 'border-brand-primary bg-brand-light-blue/20'
                                : 'border-brand-border hover:border-brand-primary/50 hover:bg-brand-light-blue/10'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="gigType"
                            value={type.value}
                            checked={formData.gigType === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="text-body text-sm font-medium">
                            {type.label}
                          </div>
                          <div className="text-muted text-xs">
                            {type.description}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Address and Location - only show when gigType is VISIT */}
                  {formData.gigType === 'VISIT' && (
                    <div className="space-y-4">
                      {/* Address */}
                      <div>
                        <label
                          htmlFor="address"
                          className="text-body mb-2 block text-sm font-medium"
                        >
                          Address *
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          rows={3}
                          className={`input w-full ${
                            errors.address
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              : ''
                          }`}
                          placeholder="Enter the complete address where the work needs to be done..."
                          value={formData.address}
                          onChange={handleChange}
                        />
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.address}
                          </p>
                        )}
                      </div>

                      {/* Location Name */}
                      <div>
                        <label
                          htmlFor="location"
                          className="text-body mb-2 block text-sm font-medium"
                        >
                          Location Name
                        </label>
                        <input
                          id="location"
                          name="location"
                          type="text"
                          className="input w-full"
                          placeholder="e.g., Downtown Office, Client's Studio"
                          value={formData.location}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Location Picker */}
                      <div>
                        <label className="text-body mb-2 block text-sm font-medium">
                          Exact Location (Required for Visit Gigs)
                        </label>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  (position) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      latitude: position.coords.latitude,
                                      longitude: position.coords.longitude,
                                      location:
                                        prev.location ||
                                        `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
                                    }));
                                  },
                                  (error) => {
                                    console.error(
                                      'Error getting location:',
                                      error
                                    );
                                    alert(
                                      'Unable to get your current location. Please ensure location permissions are enabled.'
                                    );
                                  }
                                );
                              } else {
                                alert(
                                  'Geolocation is not supported by this browser.'
                                );
                              }
                            }}
                            className="btn-ghost px-4 py-2 text-sm"
                          >
                            <MapPin className="inline-block h-4 w-4 text-green-500" />{' '}
                            Use Current Location
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              // Create a simple location picker using OpenStreetMap (no API key required)
                              const mapWindow = window.open(
                                '',
                                '_blank',
                                'width=800,height=600,scrollbars=yes,resizable=yes'
                              );

                              if (mapWindow) {
                                const searchQuery = encodeURIComponent(
                                  formData.address ||
                                    formData.location ||
                                    'Hyderabad, India'
                                );

                                mapWindow.document.write(`
                                  <!DOCTYPE html>
                                  <html>
                                    <head>
                                      <title>Select Location - 50Brains</title>
                                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                                      <link rel="preconnect" href="https://fonts.googleapis.com">
                                      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                                      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                                      <style>
                                        * { box-sizing: border-box; }
                                        body { 
                                          margin: 0; padding: 0; 
                                          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                          min-height: 100vh;
                                          overflow-x: hidden;
                                        }
                                        
                                        .container {
                                          max-width: 1200px;
                                          margin: 0 auto;
                                          padding: 20px;
                                          min-height: 100vh;
                                          display: flex;
                                          flex-direction: column;
                                        }
                                        
                                        .header {
                                          background: rgba(255, 255, 255, 0.95);
                                          backdrop-filter: blur(20px);
                                          border-radius: 20px;
                                          padding: 24px 32px;
                                          margin-bottom: 20px;
                                          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                                          border: 1px solid rgba(255, 255, 255, 0.2);
                                        }
                                        
                                        .header h1 {
                                          margin: 0 0 8px 0;
                                          font-size: 28px;
                                          font-weight: 700;
                                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                          -webkit-background-clip: text;
                                          -webkit-text-fill-color: transparent;
                                          background-clip: text;
                                          display: flex;
                                          align-items: center;
                                          gap: 12px;
                                        }
                                        
                                        .header p {
                                          margin: 0;
                                          color: #6b7280;
                                          font-size: 16px;
                                          font-weight: 400;
                                        }
                                        
                                        .search-section {
                                          background: rgba(255, 255, 255, 0.95);
                                          backdrop-filter: blur(20px);
                                          border-radius: 16px;
                                          padding: 24px;
                                          margin-bottom: 20px;
                                          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
                                          border: 1px solid rgba(255, 255, 255, 0.2);
                                        }
                                        
                                        .search-container {
                                          display: flex;
                                          gap: 12px;
                                          margin-bottom: 16px;
                                          flex-wrap: wrap;
                                        }
                                        
                                        .search-input {
                                          flex: 1;
                                          min-width: 300px;
                                          padding: 14px 18px;
                                          border: 2px solid #e5e7eb;
                                          border-radius: 12px;
                                          font-size: 15px;
                                          font-weight: 400;
                                          transition: all 0.2s ease;
                                          background: white;
                                          outline: none;
                                        }
                                        
                                        .search-input:focus {
                                          border-color: #667eea;
                                          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                                        }
                                        
                                        .controls {
                                          display: flex;
                                          gap: 12px;
                                          flex-wrap: wrap;
                                        }
                                        
                                        .btn {
                                          display: inline-flex;
                                          align-items: center;
                                          gap: 8px;
                                          padding: 12px 20px;
                                          border: none;
                                          border-radius: 12px;
                                          font-size: 14px;
                                          font-weight: 500;
                                          cursor: pointer;
                                          transition: all 0.2s ease;
                                          text-decoration: none;
                                          white-space: nowrap;
                                          position: relative;
                                          overflow: hidden;
                                        }
                                        
                                        .btn:before {
                                          content: '';
                                          position: absolute;
                                          top: 0;
                                          left: -100%;
                                          width: 100%;
                                          height: 100%;
                                          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                                          transition: left 0.5s;
                                        }
                                        
                                        .btn:hover:before {
                                          left: 100%;
                                        }
                                        
                                        .btn-primary {
                                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                          color: white;
                                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                                        }
                                        
                                        .btn-primary:hover {
                                          transform: translateY(-2px);
                                          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                                        }
                                        
                                        .btn-secondary {
                                          background: rgba(255, 255, 255, 0.9);
                                          color: #374151;
                                          border: 2px solid #e5e7eb;
                                          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                                        }
                                        
                                        .btn-secondary:hover {
                                          background: white;
                                          border-color: #d1d5db;
                                          transform: translateY(-1px);
                                          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                                        }
                                        
                                        .btn-success {
                                          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                          color: white;
                                          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                                        }
                                        
                                        .btn-success:hover {
                                          transform: translateY(-2px);
                                          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
                                        }
                                        
                                        .btn-danger {
                                          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                                          color: white;
                                          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
                                        }
                                        
                                        .btn-danger:hover {
                                          transform: translateY(-2px);
                                          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
                                        }
                                        
                                        .map-container {
                                          flex: 1;
                                          background: rgba(255, 255, 255, 0.95);
                                          backdrop-filter: blur(20px);
                                          border-radius: 20px;
                                          padding: 24px;
                                          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                                          border: 1px solid rgba(255, 255, 255, 0.2);
                                          display: flex;
                                          flex-direction: column;
                                          min-height: 600px;
                                        }
                                        
                                        #map {
                                          flex: 1;
                                          min-height: 500px;
                                          border-radius: 16px;
                                          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
                                          overflow: hidden;
                                          border: 2px solid rgba(255, 255, 255, 0.3);
                                        }
                                        
                                        .info-panel {
                                          background: rgba(255, 255, 255, 0.95);
                                          backdrop-filter: blur(20px);
                                          border-radius: 16px;
                                          padding: 24px;
                                          margin-top: 20px;
                                          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
                                          border: 1px solid rgba(255, 255, 255, 0.2);
                                        }
                                        
                                        .status {
                                          padding: 16px 20px;
                                          border-radius: 12px;
                                          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                                          border: 1px solid #93c5fd;
                                          color: #1e40af;
                                          margin-bottom: 20px;
                                          font-weight: 500;
                                        }
                                        
                                        .coordinates-display {
                                          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                                          border: 1px solid #86efac;
                                          color: #166534;
                                          padding: 20px;
                                          border-radius: 12px;
                                          margin: 16px 0;
                                        }
                                        
                                        .coordinates {
                                          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                                          font-weight: 600;
                                          font-size: 16px;
                                          color: #059669;
                                          background: rgba(255, 255, 255, 0.8);
                                          padding: 8px 12px;
                                          border-radius: 8px;
                                          display: inline-block;
                                          margin: 8px 0;
                                        }
                                        
                                        .icon {
                                          width: 20px;
                                          height: 20px;
                                          display: inline-block;
                                          vertical-align: middle;
                                        }
                                        
                                        .loading {
                                          display: inline-block;
                                          width: 16px;
                                          height: 16px;
                                          border: 2px solid transparent;
                                          border-top: 2px solid currentColor;
                                          border-radius: 50%;
                                          animation: spin 1s linear infinite;
                                        }
                                        
                                        @keyframes spin {
                                          0% { transform: rotate(0deg); }
                                          100% { transform: rotate(360deg); }
                                        }
                                        
                                        @media (max-width: 768px) {
                                          .container { padding: 16px; }
                                          .header { padding: 20px 24px; }
                                          .header h1 { font-size: 24px; }
                                          .search-container { flex-direction: column; }
                                          .search-input { min-width: auto; }
                                          .controls { justify-content: center; }
                                          .map-container { min-height: 400px; }
                                          #map { min-height: 350px; }
                                        }
                                        
                                        /* Leaflet popup customization */
                                        .leaflet-popup-content-wrapper {
                                          border-radius: 12px !important;
                                          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
                                        }
                                        
                                        .leaflet-popup-tip {
                                          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                                        }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="container">
                                        <div class="header">
                                          <h1>
                                            <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                            </svg>
                                            Select Location for Your Gig
                                          </h1>
                                          <p>Choose the perfect location where your project will take place</p>
                                        </div>
                                        
                                        <div class="search-section">
                                          <div class="search-container">
                                            <input type="text" id="searchInput" class="search-input" placeholder="Search for an address, city, or landmark..." value="${formData.address || formData.location || ''}" />
                                            <button class="btn btn-primary" onclick="searchAddress()">
                                              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                              </svg>
                                              Search
                                            </button>
                                          </div>
                                          
                                          <div class="controls">
                                            <button class="btn btn-secondary" onclick="getCurrentLocation()">
                                              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                              </svg>
                                              Use My Location
                                            </button>
                                            <button class="btn btn-secondary" onclick="centerOnIndia()">
                                              🇮🇳 Center on India
                                            </button>
                                          </div>
                                        </div>
                                        
                                        <div class="map-container">
                                          <div class="status">
                                            <strong>💡 Instructions:</strong> Click anywhere on the map to select a location for your gig.
                                          </div>
                                          
                                          <div id="selectedCoords" style="display: none;">
                                            <div class="coordinates-display">
                                              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                                <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
                                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                                </svg>
                                                <strong>Selected Location:</strong>
                                              </div>
                                              <div class="coordinates" id="coordsDisplay"></div>
                                              <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
                                                <button class="btn btn-success" onclick="confirmLocation()">
                                                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                                  </svg>
                                                  Use This Location
                                                </button>
                                                <button class="btn btn-danger" onclick="clearSelection()">
                                                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                                  </svg>
                                                  Clear Selection
                                                </button>
                                              </div>
                                            </div>
                                          </div>

                                          <div id="map"></div>
                                        </div>
                                      </div>
                                      
                                      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                                      <script>
                                        let map, marker, selectedLat, selectedLng;
                                        
                                        // Initialize map
                                        function initMap() {
                                          // Default to Delhi, India
                                          map = L.map('map').setView([28.6139, 77.2090], 10);
                                          
                                          // Add OpenStreetMap tiles
                                          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                            attribution: '© OpenStreetMap contributors',
                                            maxZoom: 19
                                          }).addTo(map);
                                          
                                          // Add click listener
                                          map.on('click', function(e) {
                                            placeMarker(e.latlng.lat, e.latlng.lng);
                                          });
                                          
                                          // Search for initial location if provided
                                          const initialSearch = '${searchQuery}';
                                          if (initialSearch && initialSearch !== 'location') {
                                            searchAddress(initialSearch);
                                          }
                                        }
                                        
                                        function placeMarker(lat, lng) {
                                          // Remove existing marker
                                          if (marker) {
                                            map.removeLayer(marker);
                                          }
                                          
                                          // Add new marker
                                          marker = L.marker([lat, lng]).addTo(map);
                                          
                                          selectedLat = lat;
                                          selectedLng = lng;
                                          
                                          document.getElementById('coordsDisplay').textContent = 
                                            lat.toFixed(6) + ', ' + lng.toFixed(6);
                                          document.getElementById('selectedCoords').style.display = 'block';
                                        }
                                        
                                        function getCurrentLocation() {
                                          if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(function(position) {
                                              const lat = position.coords.latitude;
                                              const lng = position.coords.longitude;
                                              map.setView([lat, lng], 15);
                                              placeMarker(lat, lng);
                                            }, function(error) {
                                              alert('Unable to get your location: ' + error.message);
                                            });
                                          } else {
                                            alert('Geolocation is not supported by this browser.');
                                          }
                                        }
                                        
                                        function centerOnIndia() {
                                          map.setView([20.5937, 78.9629], 5);
                                        }
                                        
                                        function searchAddress(query) {
                                          const searchQuery = query || document.getElementById('searchInput').value;
                                          if (!searchQuery) return;
                                          
                                          // Use Nominatim API for geocoding (free)
                                          fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(searchQuery)}&limit=1\`)
                                            .then(response => response.json())
                                            .then(data => {
                                              if (data && data.length > 0) {
                                                const result = data[0];
                                                const lat = parseFloat(result.lat);
                                                const lng = parseFloat(result.lon);
                                                map.setView([lat, lng], 15);
                                                placeMarker(lat, lng);
                                              } else {
                                                alert('Location not found. Please try a different search term.');
                                              }
                                            })
                                            .catch(error => {
                                              console.error('Search error:', error);
                                              alert('Search failed. Please try again.');
                                            });
                                        }
                                        
                                        function clearSelection() {
                                          if (marker) {
                                            map.removeLayer(marker);
                                            marker = null;
                                          }
                                          selectedLat = null;
                                          selectedLng = null;
                                          document.getElementById('selectedCoords').style.display = 'none';
                                        }
                                        
                                        function confirmLocation() {
                                          if (selectedLat && selectedLng) {
                                            // Send coordinates back to parent window
                                            if (window.opener && !window.opener.closed) {
                                              window.opener.postMessage({
                                                type: 'LOCATION_SELECTED',
                                                latitude: selectedLat,
                                                longitude: selectedLng
                                              }, '*');
                                              window.close();
                                            } else {
                                              alert('Parent window not found. Please copy these coordinates manually:\\n' + 
                                                    'Latitude: ' + selectedLat.toFixed(6) + '\\n' +
                                                    'Longitude: ' + selectedLng.toFixed(6));
                                            }
                                          } else {
                                            alert('Please select a location on the map first.');
                                          }
                                        }
                                        
                                        // Enter key support for search
                                        document.addEventListener('DOMContentLoaded', function() {
                                          document.getElementById('searchInput').addEventListener('keypress', function(e) {
                                            if (e.key === 'Enter') {
                                              searchAddress();
                                            }
                                          });
                                        });
                                        
                                        // Initialize the map when page loads
                                        window.onload = initMap;
                                      </script>
                                    </body>
                                  </html>
                                `);

                                mapWindow.document.close();

                                // Listen for location selection message
                                const messageHandler = (
                                  event: MessageEvent
                                ) => {
                                  if (
                                    event.data &&
                                    event.data.type === 'LOCATION_SELECTED'
                                  ) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      latitude: event.data.latitude,
                                      longitude: event.data.longitude,
                                      location:
                                        prev.location ||
                                        `${event.data.latitude.toFixed(6)}, ${event.data.longitude.toFixed(6)}`,
                                    }));

                                    // Remove event listener
                                    window.removeEventListener(
                                      'message',
                                      messageHandler
                                    );
                                  }
                                };

                                window.addEventListener(
                                  'message',
                                  messageHandler
                                );

                                // Cleanup when map window is closed
                                const checkClosed = setInterval(() => {
                                  if (mapWindow.closed) {
                                    window.removeEventListener(
                                      'message',
                                      messageHandler
                                    );
                                    clearInterval(checkClosed);
                                  }
                                }, 1000);
                              } else {
                                alert(
                                  'Please allow popups for this site to use the map selector.'
                                );
                              }
                            }}
                            className="btn-ghost ml-2 px-4 py-2 text-sm"
                          >
                            <Map className="inline-block h-4 w-4 text-green-500" />{' '}
                            Select on Map
                          </button>
                        </div>

                        {/* Coordinate Display */}
                        {formData.latitude !== undefined &&
                          formData.longitude !== undefined && (
                            <div className="mt-2 rounded border border-green-200 bg-green-50 p-3">
                              <p className="text-sm text-green-700">
                                <MapPin className="inline-block h-4 w-4 text-green-500" />{' '}
                                Selected coordinates:{' '}
                                {formData.latitude.toFixed(6)},{' '}
                                {formData.longitude.toFixed(6)}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    latitude: undefined,
                                    longitude: undefined,
                                  }));
                                }}
                                className="mt-1 text-xs text-red-600 hover:text-red-800"
                              >
                                Clear coordinates
                              </button>
                            </div>
                          )}

                        <p className="mt-2 text-xs text-gray-500">
                          💡 Providing exact coordinates helps creators find the
                          location easily
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Remote Work Option - only show when gigType is not VISIT */}
                  {formData.gigType !== 'VISIT' && (
                    <div>
                      <div className="mb-3 flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isRemote"
                            checked={formData.isRemote}
                            onChange={handleChange}
                            className="border-brand-border text-brand-primary focus:ring-brand-primary/20 rounded"
                          />
                          <span className="text-body ml-2 text-sm">
                            Remote work allowed
                          </span>
                        </label>
                      </div>
                      {!formData.isRemote && (
                        <div>
                          <label
                            htmlFor="location"
                            className="text-body mb-2 block text-sm font-medium"
                          >
                            Preferred Location
                          </label>
                          <input
                            id="location"
                            name="location"
                            type="text"
                            className="input w-full"
                            placeholder="e.g., San Francisco, CA"
                            value={formData.location}
                            onChange={handleChange}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expected Deliverables */}
                  <div>
                    <label className="text-body mb-1 block text-sm font-medium">
                      Expected Deliverables *
                    </label>
                    <div className="mb-1 flex flex-wrap gap-2">
                      {formData.deliverables.map((deliverable: string) => (
                        <span
                          key={deliverable}
                          className="bg-brand-primary/10 text-brand-primary flex items-center space-x-2 rounded-none px-3 py-1 text-sm"
                        >
                          <span>{deliverable}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                deliverables: prev.deliverables.filter(
                                  (d: string) => d !== deliverable
                                ),
                              }));
                            }}
                            className="text-brand-primary/60 hover:text-brand-primary text-lg"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        className={`input flex-1 ${errors.deliverables ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                        placeholder="Add a deliverable and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (
                              value &&
                              !formData.deliverables.includes(value)
                            ) {
                              setFormData((prev) => ({
                                ...prev,
                                deliverables: [...prev.deliverables, value],
                              }));
                              e.currentTarget.value = '';

                              // Clear deliverables error when user adds a deliverable
                              if (errors.deliverables) {
                                setErrors((prev) => ({
                                  ...prev,
                                  deliverables: undefined,
                                }));
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    {errors.deliverables && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.deliverables}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        'Final video file',
                        'Raw footage',
                        'Social media posts',
                        'High-res images',
                        'Written content',
                        'Source files',
                      ].map((deliverable) => (
                        <button
                          key={deliverable}
                          type="button"
                          onClick={() => {
                            if (!formData.deliverables.includes(deliverable)) {
                              setFormData((prev) => ({
                                ...prev,
                                deliverables: [
                                  ...prev.deliverables,
                                  deliverable,
                                ],
                              }));

                              // Clear deliverables error when user adds a deliverable
                              if (errors.deliverables) {
                                setErrors((prev) => ({
                                  ...prev,
                                  deliverables: undefined,
                                }));
                              }
                            }
                          }}
                          className="bg-brand-soft border-brand-border text-body hover:bg-brand-light-blue/20 rounded border px-2 py-1 text-xs transition-colors"
                        >
                          + {deliverable}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div>
                    <label
                      htmlFor="requirements"
                      className="text-body mb-2 block text-sm font-medium"
                    >
                      Additional Requirements
                    </label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      rows={4}
                      className="input w-full"
                      placeholder="Any specific requirements, preferences, or additional details..."
                      value={formData.requirements}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Team Options */}
                  <div>
                    <div className="mb-3 flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isClanAllowed"
                          checked={formData.isClanAllowed}
                          onChange={handleChange}
                          className="border-brand-border text-brand-primary focus:ring-brand-primary/20 rounded"
                        />
                        <span className="text-body ml-2 text-sm">
                          Allow team/clan applications
                        </span>
                      </label>
                    </div>
                    <p className="text-muted text-xs">
                      Teams can collaborate to deliver comprehensive solutions
                      for your project
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="card-glass p-1">
                <h2 className="text-heading mb-1 text-xl font-semibold">
                  Budget & Timeline
                </h2>

                <div className="space-y-2">
                  {/* Budget Type */}{' '}
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Budget Type
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        {
                          value: 'fixed',
                          label: 'Fixed Price',
                          description: 'One-time payment',
                        },
                        {
                          value: 'hourly',
                          label: 'Hourly Rate',
                          description: 'Pay per hour',
                        },
                        // {
                        //   value: 'negotiable',
                        //   label: 'Negotiable',
                        //   description: 'Discuss with applicants',
                        // },
                      ].map((type) => (
                        <label
                          key={type.value}
                          className={`
                            cursor-pointer rounded-none border p-4 transition-all duration-200
                            ${
                              formData.budgetType === type.value
                                ? 'border-brand-primary bg-brand-light-blue/20'
                                : 'border-brand-border hover:border-brand-primary/50 hover:bg-brand-light-blue/10'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="budgetType"
                            value={type.value}
                            checked={formData.budgetType === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="text-body font-medium">
                            {type.label}
                          </div>
                          <div className="text-muted text-sm">
                            {type.description}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Budget Range */}
                  {formData.budgetType !== 'negotiable' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="budgetMin"
                          className="text-body mb-2 block text-sm font-medium"
                        >
                          {formData.budgetType === 'hourly'
                            ? 'Min Rate (₹/hour) *'
                            : 'Min Budget (₹) *'}
                        </label>
                        <input
                          id="budgetMin"
                          name="budgetMin"
                          type="number"
                          min="1"
                          className={`input w-full ${errors.budgetMin ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          placeholder="0"
                          value={formData.budgetMin || ''}
                          onChange={handleChange}
                        />
                        {errors.budgetMin && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.budgetMin}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="budgetMax"
                          className="text-body mb-2 block text-sm font-medium"
                        >
                          {formData.budgetType === 'hourly'
                            ? 'Max Rate (₹/hour)'
                            : 'Max Budget (₹)'}
                        </label>
                        <input
                          id="budgetMax"
                          name="budgetMax"
                          type="number"
                          min="1"
                          className={`input w-full ${errors.budgetMax ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          placeholder="0"
                          value={formData.budgetMax || ''}
                          onChange={handleChange}
                        />
                        {errors.budgetMax && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.budgetMax}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Deadline */}
                  <div>
                    <label
                      htmlFor="deadline"
                      className="text-body mb-2 block text-sm font-medium"
                    >
                      Project Deadline
                    </label>
                    {/* past date not allowed */}

                    <input
                      id="deadline"
                      name="deadline"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="input w-full"
                      value={formData.deadline}
                      onChange={handleChange}
                    />
                  </div>
                  {/* Duration */}
                  <div>
                    <label
                      htmlFor="duration"
                      className="text-body mb-2 block text-sm font-medium"
                    >
                      Project Duration
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      className="input w-full"
                      value={formData.duration}
                      onChange={handleChange}
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
                  {/* Urgency */}
                  <div>
                    <label className="text-body mb-3 block text-sm font-medium">
                      Project Urgency
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          value: 'flexible',
                          label: 'Flexible',
                          description: 'No rush',
                        },
                        {
                          value: 'normal',
                          label: 'Normal',
                          description: 'Standard timeline',
                        },
                        {
                          value: 'urgent',
                          label: 'Urgent',
                          description: 'Need it ASAP',
                        },
                      ].map((urgency) => (
                        <label
                          key={urgency.value}
                          className={`
                            cursor-pointer rounded-none border p-3 transition-all duration-200
                            ${
                              formData.urgency === urgency.value
                                ? 'border-brand-primary bg-brand-light-blue/20'
                                : 'border-brand-border hover:border-brand-primary/50 hover:bg-brand-light-blue/10'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="urgency"
                            value={urgency.value}
                            checked={formData.urgency === urgency.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="text-body text-sm font-medium">
                            {urgency.label}
                          </div>
                          <div className="text-muted text-xs">
                            {urgency.description}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/*Visibility Public or private toggle isPublic true or false*/}
                  <div>
                    <label className="text-body mb-3 block text-sm font-medium">
                      Visibility
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          value: true,
                          label: 'Public',
                          description: 'Visible to everyone',
                        },
                        {
                          value: false,
                          label: 'Private',
                          description: 'Visible to invited creators only',
                        },
                      ].map((visibility) => (
                        <label
                          key={String(visibility.value)}
                          className={`
                            cursor-pointer rounded-none border p-3 transition-all duration-200
                            ${
                              formData.isPublic === visibility.value
                                ? 'border-brand-primary bg-brand-light-blue/20'
                                : 'border-brand-border hover:border-brand-primary/50 hover:bg-brand-light-blue/10'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="visibility"
                            value={String(visibility.value)}
                            checked={formData.isPublic === visibility.value}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                isPublic: e.target.value === 'true',
                              }));
                            }}
                            className="sr-only"
                          />
                          <div className="text-body text-sm font-medium">
                            {visibility.label}
                          </div>
                          <div className="text-muted text-xs">
                            {visibility.description}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-2">
              {/* Preview */}
              <div className="card-glass p-2">
                <h3 className="text-heading mb-2 text-lg font-semibold">
                  Preview
                </h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-body text-sm font-medium">Title</h4>
                    <p className="text-heading">
                      {formData.title || 'Your gig title...'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-body text-sm font-medium">Category</h4>
                    <p className="text-muted capitalize">
                      {formData.category || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-body text-sm font-medium">
                      Role Required
                    </h4>
                    <p className="text-muted capitalize">
                      {formData.roleRequired || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-body text-sm font-medium">Gig Type</h4>
                    <p className="text-muted capitalize">
                      {String(formData.gigType || '').toLowerCase()}
                    </p>
                  </div>
                  {formData.latitude !== undefined &&
                    formData.longitude !== undefined && (
                      <div>
                        <h4 className="text-body text-sm font-medium">
                          Location
                        </h4>
                        <p className="text-muted text-xs">
                          📍 {formData.latitude.toFixed(4)},{' '}
                          {formData.longitude.toFixed(4)}
                        </p>
                      </div>
                    )}
                  <div>
                    <h4 className="text-body text-sm font-medium">Budget</h4>
                    <p className="text-heading">
                      {formData.budgetType === 'negotiable'
                        ? 'Negotiable'
                        : formData.budgetMin && formData.budgetMax
                          ? `₹${formData.budgetMin} - ₹${formData.budgetMax}`
                          : 'Not set'}
                    </p>
                  </div>
                  {formData.skillsRequired.length > 0 && (
                    <div>
                      <h4 className="text-body text-sm font-medium">Skills</h4>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {formData.skillsRequired
                          .slice(0, 3)
                          .map((skill: string) => (
                            <span
                              key={skill}
                              className="bg-brand-primary/10 text-brand-primary rounded px-2 py-1 text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        {formData.skillsRequired.length > 3 && (
                          <span className="text-muted text-xs">
                            +{formData.skillsRequired.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="card-glass p-3">
                <h3 className="text-heading mb-4 text-lg font-semibold">
                  💡 Tips for Success
                </h3>
                <div className="text-muted space-y-3 text-sm">
                  <p>• Write a clear, detailed description</p>
                  <p>• Set a realistic budget and timeline</p>
                  <p>• Add relevant skills and requirements</p>
                  <p>• Include examples or references</p>
                  <p>• Respond quickly to applications</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-700"
                    >
                      Terms of Service
                    </a>
                    ,{' '}
                    <a
                      href="/refund"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-700"
                    >
                      Refund Policy
                    </a>
                    , and{' '}
                    <button
                      type="button"
                      onClick={() => openGuidelines('brand')}
                      className="text-blue-600 underline hover:text-blue-700"
                    >
                      Community Guidelines
                    </button>
                    . I confirm this gig does NOT violate 50BraIns policies and
                    commit to fair, honest promotion.
                  </span>
                </label>
              </div>
              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={creating || !formData.agreedToTerms}
                  className="btn-primary flex w-full items-center justify-center py-3"
                >
                  {creating ? (
                    <>
                      <svg
                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Gig...
                    </>
                  ) : (
                    'Publish Gig'
                  )}
                </button>
                {/* <button
                  type="button"
                  className="btn-ghost w-full py-3"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={creating}
                >
                  Save as Draft
                </button> */}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Guidelines Modal */}
      <GuidelinesModal
        isOpen={isOpen}
        onClose={closeGuidelines}
        type={guidelinesType}
      />
    </div>
  );
}
