'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGigs } from '@/hooks/useGigs';
import type { CreateGigData, GigStatus } from '@/types/gig.types';

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
  urgency: 'urgent' | 'normal' | 'flexible';
  deliverables: string[];
  isClanAllowed: boolean;
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
    isRemote: true,
    deadline: '',
    budgetType: 'fixed',
    budgetMin: undefined,
    budgetMax: undefined,
    requirements: '',
    duration: '',
    urgency: 'normal',
    deliverables: [],
    isClanAllowed: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDraft, setIsDraft] = useState(false);

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
      const gigData: CreateGigData = {
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
      };

      console.log('Creating gig:', gigData);

      // Use appropriate API call based on draft status
      const gig = asDraft
        ? await createDraftGig(gigData)
        : await createGig(gigData);

      if (asDraft) {
        alert('Gig saved as draft successfully!');
        router.push('/dashboard');
      } else {
        alert('Gig published successfully!');
        router.push('/marketplace');
      }
    } catch (error) {
      console.error('Error creating gig:', error);
      setErrors({
        general:
          error instanceof Error ? error.message : 'Unknown error occurred',
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

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

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
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-heading mb-2 text-3xl font-bold">
              Create a New Gig
            </h1>
            <p className="text-muted">
              Find the perfect creators for your project
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
            {/* General Error Display */}
            {errors.general && (
              <div className="mb-4 rounded-none border border-red-200 bg-red-50 p-4 lg:col-span-3">
                <p className="text-sm font-medium text-red-600">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Main Form */}
            <div className="space-y-8 lg:col-span-2">
              {/* Basic Information */}
              <div className="card-glass p-3">
                <h2 className="text-heading mb-6 text-xl font-semibold">
                  Basic Information
                </h2>

                <div className="space-y-6">
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
                  <div className="grid grid-cols-2 gap-4">
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
              <div className="card-glass p-3">
                <h2 className="text-heading mb-6 text-xl font-semibold">
                  Requirements
                </h2>

                <div className="space-y-6">
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

                  {/* Location */}
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
                          Location
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

                  {/* Expected Deliverables */}
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Expected Deliverables *
                    </label>
                    <div className="mb-3 flex flex-wrap gap-2">
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
              <div className="card-glass p-3">
                <h2 className="text-heading mb-6 text-xl font-semibold">
                  Budget & Timeline
                </h2>

                <div className="space-y-6">
                  {/* Budget Type */}{' '}
                  <div>
                    <label className="text-body mb-3 block text-sm font-medium">
                      Budget Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
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
                        {
                          value: 'negotiable',
                          label: 'Negotiable',
                          description: 'Discuss with applicants',
                        },
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
                    <input
                      id="deadline"
                      name="deadline"
                      type="date"
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
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preview */}
              <div className="card-glass p-3">
                <h3 className="text-heading mb-4 text-lg font-semibold">
                  Preview
                </h3>
                <div className="space-y-4">
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
                    <h4 className="text-body text-sm font-medium">Budget</h4>
                    <p className="text-heading">
                      {formData.budgetType === 'negotiable'
                        ? 'Negotiable'
                        : formData.budgetMin && formData.budgetMax
                          ? `$${formData.budgetMin} - $${formData.budgetMax}`
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

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={creating}
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
                <button
                  type="button"
                  className="btn-ghost w-full py-3"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={creating}
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
