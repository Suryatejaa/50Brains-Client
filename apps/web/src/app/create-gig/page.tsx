'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function CreateGigPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    skills: [] as string[],
    experienceLevel: '',
    location: '',
    isRemote: true,
    deadline: '',
    budgetType: 'FIXED',
    budgetMin: '',
    budgetMax: '',
    maxApplicants: '',
    requirements: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement API call
      console.log('Creating gig:', formData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('Gig created successfully!');
    } catch (error) {
      console.error('Error creating gig:', error);
    } finally {
      setIsLoading(false);
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
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
            {/* Main Form */}
            <div className="space-y-8 lg:col-span-2">
              {/* Basic Information */}
              <div className="card-glass p-6">
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
                      className="input w-full"
                      placeholder="e.g., Instagram Content Creator for Tech Brand"
                      value={formData.title}
                      onChange={handleChange}
                    />
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
                      className="input w-full"
                      placeholder="Describe your project, requirements, and what you're looking for..."
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Category & Subcategory */}
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
                        className="input w-full"
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
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="subcategory"
                        className="text-body mb-2 block text-sm font-medium"
                      >
                        Subcategory
                      </label>
                      <select
                        id="subcategory"
                        name="subcategory"
                        className="input w-full"
                        value={formData.subcategory}
                        onChange={handleChange}
                      >
                        <option value="">Select subcategory</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="card-glass p-6">
                <h2 className="text-heading mb-6 text-xl font-semibold">
                  Requirements
                </h2>

                <div className="space-y-6">
                  {/* Skills */}
                  <div>
                    <label className="text-body mb-2 block text-sm font-medium">
                      Required Skills
                    </label>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-brand-primary/10 text-brand-primary flex items-center space-x-2 rounded-lg px-3 py-1 text-sm"
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
                        className="input flex-1"
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
                      <option value="">Any level</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="EXPERT">Expert</option>
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
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="card-glass p-6">
                <h2 className="text-heading mb-6 text-xl font-semibold">
                  Budget & Timeline
                </h2>

                <div className="space-y-6">
                  {/* Budget Type */}
                  <div>
                    <label className="text-body mb-3 block text-sm font-medium">
                      Budget Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          value: 'FIXED',
                          label: 'Fixed Price',
                          description: 'One-time payment',
                        },
                        {
                          value: 'HOURLY',
                          label: 'Hourly Rate',
                          description: 'Pay per hour',
                        },
                        {
                          value: 'NEGOTIABLE',
                          label: 'Negotiable',
                          description: 'Discuss with applicants',
                        },
                      ].map((type) => (
                        <label
                          key={type.value}
                          className={`
                            cursor-pointer rounded-lg border p-4 transition-all duration-200
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
                  {formData.budgetType !== 'NEGOTIABLE' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="budgetMin"
                          className="text-body mb-2 block text-sm font-medium"
                        >
                          {formData.budgetType === 'HOURLY'
                            ? 'Min Rate ($/hour)'
                            : 'Min Budget ($)'}
                        </label>
                        <input
                          id="budgetMin"
                          name="budgetMin"
                          type="number"
                          className="input w-full"
                          placeholder="0"
                          value={formData.budgetMin}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="budgetMax"
                          className="text-body mb-2 block text-sm font-medium"
                        >
                          {formData.budgetType === 'HOURLY'
                            ? 'Max Rate ($/hour)'
                            : 'Max Budget ($)'}
                        </label>
                        <input
                          id="budgetMax"
                          name="budgetMax"
                          type="number"
                          className="input w-full"
                          placeholder="0"
                          value={formData.budgetMax}
                          onChange={handleChange}
                        />
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

                  {/* Max Applicants */}
                  <div>
                    <label
                      htmlFor="maxApplicants"
                      className="text-body mb-2 block text-sm font-medium"
                    >
                      Maximum Applicants
                    </label>
                    <select
                      id="maxApplicants"
                      name="maxApplicants"
                      className="input w-full"
                      value={formData.maxApplicants}
                      onChange={handleChange}
                    >
                      <option value="">No limit</option>
                      <option value="5">5 applicants</option>
                      <option value="10">10 applicants</option>
                      <option value="20">20 applicants</option>
                      <option value="50">50 applicants</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preview */}
              <div className="card-glass p-6">
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
                    <h4 className="text-body text-sm font-medium">Budget</h4>
                    <p className="text-heading">
                      {formData.budgetType === 'NEGOTIABLE'
                        ? 'Negotiable'
                        : formData.budgetMin && formData.budgetMax
                          ? `$${formData.budgetMin} - $${formData.budgetMax}`
                          : 'Not set'}
                    </p>
                  </div>
                  {formData.skills.length > 0 && (
                    <div>
                      <h4 className="text-body text-sm font-medium">Skills</h4>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {formData.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="bg-brand-primary/10 text-brand-primary rounded px-2 py-1 text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {formData.skills.length > 3 && (
                          <span className="text-muted text-xs">
                            +{formData.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="card-glass p-6">
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
                  disabled={isLoading}
                  className="btn-primary flex w-full items-center justify-center py-3"
                >
                  {isLoading ? (
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
                <button type="button" className="btn-ghost w-full py-3">
                  Save as Draft
                </button>
              </div>
            </div>
          </form>
        </div>
        <Footer />
      </div>
    </div>
  );
}
