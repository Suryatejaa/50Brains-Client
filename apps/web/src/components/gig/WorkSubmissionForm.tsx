'use client';

import { useState, useEffect, useCallback } from 'react';
import { GigAPI } from '@/lib/gig-api';
import {
  CreateSubmissionData,
  EnhancedDeliverable,
  DELIVERABLE_TYPES,
  SOCIAL_PLATFORMS,
} from '@/types/gig.types';
import { toast } from 'react-hot-toast';

interface WorkSubmissionFormProps {
  gigId: string;
  gigTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type FormStep = 'basic-info' | 'deliverables' | 'review';

const FORM_STORAGE_KEY = 'gig_work_submission_form';

export default function WorkSubmissionForm({
  gigId,
  gigTitle,
  onSuccess,
  onCancel,
}: WorkSubmissionFormProps) {
  // Debug logging for gigId prop
  useEffect(() => {
    console.log('🔍 === WORK SUBMISSION FORM DEBUG ===');
    console.log('🆔 Received gigId prop:', gigId);
    console.log('📝 Received gigTitle prop:', gigTitle);
    console.log('🔗 Current URL:', window.location.href);
    console.log('================================');
  }, [gigId, gigTitle]);

  const [currentStep, setCurrentStep] = useState<FormStep>('basic-info');
  const [formData, setFormData] = useState<CreateSubmissionData>({
    title: '',
    description: '',
    deliverables: [
      {
        type: 'social_post',
        platform: 'instagram',
        content: '',
        url: '',
        description: '',
      },
    ],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
    deliverables?: string[];
  }>({
    title: undefined,
    description: undefined,
    deliverables: [],
  });

  // Enhanced deliverable state
  const [enhancedDeliverables, setEnhancedDeliverables] = useState<
    EnhancedDeliverable[]
  >([
    {
      type: 'social_post',
      platform: 'instagram',
      content: '',
      url: '',
      description: '',
    },
  ]);

  // Load saved form data on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(`${FORM_STORAGE_KEY}_${gigId}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);

        // Check if this is old form data that needs migration
        if (
          parsed.formData &&
          (parsed.formData.challenges ||
            parsed.formData.improvements ||
            parsed.formData.qualityChecks ||
            parsed.formData.estimatedHours)
        ) {
          console.log(
            '🔄 Detected old form data, clearing for new simplified structure'
          );
          localStorage.removeItem(`${FORM_STORAGE_KEY}_${gigId}`);
          return; // Don't restore old data
        }

        if (
          parsed.formData &&
          parsed.enhancedDeliverables &&
          parsed.currentStep
        ) {
          // Only restore data that matches the new simplified structure
          const cleanFormData = {
            title: parsed.formData.title || '',
            description: parsed.formData.description || '',
            deliverables: parsed.formData.deliverables || [''],
            notes: parsed.formData.notes || '',
          };

          setFormData(cleanFormData);
          setEnhancedDeliverables(parsed.enhancedDeliverables);
          setCurrentStep(parsed.currentStep);
          console.log(
            '📝 WorkSubmissionForm: Restored saved form data (cleaned)'
          );
        }
      }
    } catch (error) {
      console.warn('Failed to restore form data:', error);
      // Clear corrupted data
      localStorage.removeItem(`${FORM_STORAGE_KEY}_${gigId}`);
    }
  }, [gigId]);

  // Save form data whenever it changes
  const saveFormData = useCallback(() => {
    try {
      const dataToSave = {
        formData,
        enhancedDeliverables,
        currentStep,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `${FORM_STORAGE_KEY}_${gigId}`,
        JSON.stringify(dataToSave)
      );
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  }, [formData, enhancedDeliverables, currentStep, gigId]);

  // Auto-save form data with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveFormData();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [saveFormData]);

  // Clear saved form data on successful submission
  const clearSavedData = () => {
    try {
      localStorage.removeItem(`${FORM_STORAGE_KEY}_${gigId}`);
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  };

  // Clear all old form data (for debugging)
  const clearAllOldData = () => {
    try {
      // Clear current gig's data
      localStorage.removeItem(`${FORM_STORAGE_KEY}_${gigId}`);

      // Clear any other old form data
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('gig_work_submission_form_')) {
          localStorage.removeItem(key);
        }
      });

      // Reset form to initial state
      setFormData({
        title: '',
        description: '',
        deliverables: [
          {
            type: 'social_post',
            platform: 'instagram',
            content: '',
            url: '',
            description: '',
          },
        ],
        notes: '',
      });
      setEnhancedDeliverables([
        {
          type: 'social_post',
          platform: 'instagram',
          content: '',
          url: '',
          description: '',
        },
      ]);
      setCurrentStep('basic-info');

      toast.success('All old form data cleared!');
      console.log('🧹 Cleared all old form data');
    } catch (error) {
      console.warn('Failed to clear old form data:', error);
      toast.error('Failed to clear old data');
    }
  };

  // Test submission function for debugging
  const testSubmission = async () => {
    console.log('🧪 === TESTING SUBMISSION ===');

    const testData = {
      gigId,
      title: 'Test Submission',
      description: 'This is a test submission for debugging purposes',
      deliverables: ['Test deliverable'],
      notes: 'Test notes',
    };

    console.log('📤 Test data being sent:', testData);

    try {
      // Convert testData.deliverables to match EnhancedDeliverable[]
      const enhancedTestData = {
        ...testData,
        deliverables: [
          {
            type: 'social_post',
            platform: 'instagram',
            content: '',
            url: '',
            description: testData.deliverables[0] || '',
          },
        ],
      };
      const result = await GigAPI.createSubmission(
        gigId,
        enhancedTestData as CreateSubmissionData
      );
      console.log('✅ Test submission successful:', result);
      toast.success('Test submission successful!');
    } catch (error) {
      console.error('❌ Test submission failed:', error);
      toast.error('Test submission failed. Check console for details.');
    }
  };

  const handleInputChange = (field: keyof CreateSubmissionData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeliverableChange = (
    index: number,
    field: keyof EnhancedDeliverable,
    value: any
  ) => {
    const newDeliverables = [...enhancedDeliverables];
    newDeliverables[index] = { ...newDeliverables[index], [field]: value };
    setEnhancedDeliverables(newDeliverables);
  };

  const addDeliverable = () => {
    setEnhancedDeliverables((prev) => [
      ...prev,
      {
        type: 'social_post',
        platform: 'instagram',
        content: '',
        url: '',
        description: '',
      },
    ]);
  };

  const removeDeliverable = (index: number) => {
    if (enhancedDeliverables.length > 1) {
      setEnhancedDeliverables((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (index: number, file: File | undefined) => {
    if (file) {
      handleDeliverableChange(index, 'file', file);
    }
  };

  const validateStep = (step: FormStep): boolean => {
    switch (step) {
      case 'basic-info':
        return Boolean(formData.title.trim() && formData.description?.trim());
      case 'deliverables':
        return enhancedDeliverables.every((d) =>
          Boolean(d.description.trim() && d.type)
        );
      default:
        return true;
    }
  };

  const nextStep = () => {
    const errors: {
      title?: string;
      description?: string;
      deliverables?: string[];
    } = {};

    if (currentStep === 'basic-info') {
      if (!formData.title.trim()) {
        errors.title = 'Title is required';
      }
      if (!formData.description?.trim()) {
        errors.description = 'Description is required';
      }
    } else if (currentStep === 'deliverables') {
      const deliverableErrors = enhancedDeliverables
        .map((d, index) => {
          if (!d.description.trim()) {
            return `Deliverable ${index + 1} description is required`;
          }
          if (!d.type) {
            return `Deliverable ${index + 1} type is required`;
          }
          if (!d.url) {
            return `Deliverable ${index + 1} needs URL`;
          }
          return null;
        })
        .filter(Boolean) as string[];

      if (deliverableErrors.length > 0) {
        errors.deliverables = deliverableErrors;
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please complete all required fields before proceeding');
      return;
    }

    setValidationErrors({});
    const steps: FormStep[] = ['basic-info', 'deliverables', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: FormStep[] = ['basic-info', 'deliverables', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Filter out empty fields and create clean submission data
      const cleanEnhancedDeliverables = enhancedDeliverables
        .filter((d) => d.description.trim() && d.type)
        .map((d) => {
          const cleanDeliverable: any = {
            type: d.type,
            description: d.description.trim(),
          };

          // Only add fields that have actual content (not empty strings)
          if (d.platform && d.platform.trim()) {
            cleanDeliverable.platform = d.platform;
          }
          if (d.content && d.content.trim()) {
            cleanDeliverable.content = d.content.trim();
          }
          if (d.url && d.url.trim()) {
            cleanDeliverable.url = d.url.trim();
          }
          if (d.file) {
            cleanDeliverable.file = d.file;
          }

          return cleanDeliverable;
        });

      // Additional filtering to remove any objects with empty string values
      const finalDeliverables = cleanEnhancedDeliverables.map((deliverable) => {
        const final: any = {};
        Object.entries(deliverable).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            final[key] = value;
          }
        });
        return final;
      });

      const submissionData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        deliverables: finalDeliverables, // Use the cleaned deliverables
        notes: formData.notes?.trim() || undefined,
      };

      // Remove undefined fields
      Object.keys(submissionData).forEach((key) => {
        if (submissionData[key as keyof typeof submissionData] === undefined) {
          delete submissionData[key as keyof typeof submissionData];
        }
      });

      // Comprehensive logging for debugging
      console.log('🚀 === WORK SUBMISSION DEBUG ===');
      console.log('📝 Original Form Data:', formData);
      console.log('📦 Enhanced Deliverables (ORIGINAL):', enhancedDeliverables);
      console.log('🧹 Cleaned Deliverables:', cleanEnhancedDeliverables);
      console.log('✨ Final Deliverables (CLEANED):', finalDeliverables);
      console.log('📤 Final Submission Data:', submissionData);
      console.log(
        '🔍 Deliverables being sent to API:',
        submissionData.deliverables
      );
      console.log('🌐 API Endpoint:', `/api/gig/${gigId}/submit`);
      console.log('🆔 Gig ID:', gigId);
      console.log('📅 Timestamp:', new Date().toISOString());
      console.log('================================');

      // Double-check: ensure we're not sending empty fields
      const apiPayload = {
        ...submissionData,
        deliverables: finalDeliverables, // Explicitly use cleaned deliverables
      };

      console.log('🎯 FINAL API PAYLOAD:', apiPayload);

      await GigAPI.createSubmission(gigId, apiPayload);

      toast.success('Work submitted successfully!');
      onSuccess();
      clearSavedData(); // Clear saved data on successful submission
    } catch (error) {
      console.error('Failed to submit work:', error);
      toast.error('Failed to submit work. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      {
        key: 'basic-info',
        label: 'What did you deliver?',
        shortLabel: 'Deliver',
        icon: '📝',
      },
      {
        key: 'deliverables',
        label: 'Show your work',
        shortLabel: 'Show',
        icon: '📦',
      },
      {
        key: 'review',
        label: 'Quick review & submit',
        shortLabel: 'Review',
        icon: '👀',
      },
    ];

    return (
      <div className="mb-6">
        {/* Mobile layout - vertical stack */}
        <div className="flex flex-col space-y-3 sm:hidden">
          {steps.map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted =
              index < steps.findIndex((s) => s.key === currentStep);

            return (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    isActive
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-gray-100 text-gray-400'
                  }`}
                >
                  <span className="text-xs">
                    {isCompleted ? '✓' : step.icon}
                  </span>
                </div>

                <div className="ml-3 flex-1">
                  <div
                    className={`text-sm font-medium ${
                      isActive
                        ? 'text-blue-600'
                        : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-500'
                    }`}
                  >
                    Step {index + 1}: {step.shortLabel}
                  </div>
                  {isActive && (
                    <div className="mt-1 text-xs text-gray-500">
                      {step.label}
                    </div>
                  )}
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-4 mt-8 h-6 w-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop layout - horizontal */}
        <div className="hidden items-center justify-center sm:flex">
          {steps.map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted =
              index < steps.findIndex((s) => s.key === currentStep);

            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 md:h-12 md:w-12 ${
                      isActive
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-gray-100 text-gray-400'
                    }`}
                  >
                    <span className="text-sm md:text-base">
                      {isCompleted ? '✓' : step.icon}
                    </span>
                  </div>

                  <div className="mt-2 text-center">
                    <div
                      className={`text-xs font-medium md:text-sm ${
                        isActive
                          ? 'text-blue-600'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {step.shortLabel}
                    </div>
                    <div
                      className={`mt-1 max-w-20 text-xs text-gray-500 md:max-w-24 lg:max-w-none ${
                        isActive ? 'block' : 'hidden lg:block'
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-8 md:mx-4 md:w-12 lg:w-16 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-4">
      <div className="mb-4 rounded bg-blue-50 p-3">
        <h3 className="mb-1 font-semibold text-blue-900">
          Step 1: What did you deliver?
        </h3>
        <p className="text-sm text-blue-700">
          Provide a clear title and description of your completed work.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Submission Title *
        </label>
        <div>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              handleInputChange('title', e.target.value);
              if (validationErrors.title) {
                setValidationErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            className={`w-full border p-3 ${validationErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:border-transparent focus:ring-2 focus:ring-blue-500`}
            placeholder="e.g., Social Media Campaign Content Delivered"
          />
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.title}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Work Description *
        </label>
        <div>
          <textarea
            value={formData.description}
            onChange={(e) => {
              handleInputChange('description', e.target.value);
              if (validationErrors.description) {
                setValidationErrors((prev) => ({
                  ...prev,
                  description: undefined,
                }));
              }
            }}
            rows={4}
            className={`w-full border p-3 ${validationErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:border-transparent focus:ring-2 focus:ring-blue-500`}
            placeholder="Describe the work you've completed, including key achievements and deliverables..."
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.description}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          placeholder="Any additional notes, special instructions followed, or context for the brand..."
        />
      </div>
    </div>
  );

  const renderDeliverablesStep = () => (
    <div className="space-y-4">
      <div className="mb-4 rounded bg-blue-50 p-3">
        <h3 className="mb-1 font-semibold text-blue-900">
          Step 2: Show your work
        </h3>
        <p className="text-sm text-blue-700">
          Describe each deliverable with its type, platform, and details.
        </p>
      </div>

      {validationErrors.deliverables &&
        validationErrors.deliverables.length > 0 && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3">
            <ul className="list-inside list-disc text-sm text-red-600">
              {validationErrors.deliverables.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      {enhancedDeliverables.map((deliverable, index) => (
        <div
          key={index}
          className={`rounded-lg border bg-gray-50 p-4 ${validationErrors.deliverables?.some((e) => e.includes(`Deliverable ${index + 1}`)) ? 'border-red-300' : 'border-gray-200'}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium text-gray-700">
              Deliverable {index + 1}
            </h4>
            {enhancedDeliverables.length > 1 && (
              <button
                type="button"
                onClick={() => removeDeliverable(index)}
                className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-800"
              >
                ✕ Remove
              </button>
            )}
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <select
              value={deliverable.type}
              onChange={(e) =>
                handleDeliverableChange(index, 'type', e.target.value)
              }
              className="rounded border p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              {Object.entries(DELIVERABLE_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {deliverable.type === 'social_post' && (
              <select
                value={deliverable.platform}
                onChange={(e) =>
                  handleDeliverableChange(index, 'platform', e.target.value)
                }
                className="rounded border p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Platform</option>
                {Object.entries(SOCIAL_PLATFORMS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <input
            type="text"
            value={deliverable.description}
            onChange={(e) =>
              handleDeliverableChange(index, 'description', e.target.value)
            }
            placeholder="Describe the deliverable..."
            className="mb-2 w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* {deliverable.type === 'social_post' && (
                        <textarea
                            value={deliverable.content}
                            onChange={(e) => handleDeliverableChange(index, 'content', e.target.value)}
                            placeholder="Enter the actual content/caption..."
                            className="w-full p-2 border rounded mb-2 focus:ring-2 focus:ring-blue-500"
                            rows={2}
                        />
                    )} */}

          <input
            type="url"
            value={deliverable.url}
            onChange={(e) =>
              handleDeliverableChange(index, 'url', e.target.value)
            }
            placeholder="URL to the deliverable (if published online)"
            className="mb-2 w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* <input
                        type="file"
                        onChange={(e) => handleFileUpload(index, e.target.files?.[0])}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                    />
                    {deliverable.file && (
                        <p className="text-sm text-green-600 mt-1">✓ File selected: {deliverable.file.name}</p>
                    )} */}
        </div>
      ))}

      <button
        type="button"
        onClick={addDeliverable}
        className="rounded p-2 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-800"
      >
        + Add Another Deliverable
      </button>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="mb-4 rounded bg-blue-50 p-3">
        <h3 className="mb-1 font-semibold text-blue-900">
          Step 3: Quick review & submit
        </h3>
        <p className="text-sm text-blue-700">
          Review your submission before final submission.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h4 className="mb-2 font-medium text-gray-700">Submission Summary</h4>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Title:</strong> {formData.title}
            </p>
            <p>
              <strong>Description:</strong> {formData.description}
            </p>
            <p>
              <strong>Deliverables:</strong> {enhancedDeliverables.length} items
            </p>
            <p>
              <strong>Notes:</strong> {formData.notes || 'None'}
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h4 className="mb-2 font-medium text-gray-700">
            Deliverables Preview
          </h4>
          <div className="space-y-2">
            {enhancedDeliverables.map((deliverable, index) => (
              <div key={index} className="rounded bg-gray-50 p-2 text-sm">
                <p>
                  <strong>
                    {
                      DELIVERABLE_TYPES[
                        deliverable.type as keyof typeof DELIVERABLE_TYPES
                      ]
                    }
                  </strong>
                </p>
                {deliverable.platform && (
                  <p className="text-gray-600">
                    Platform:{' '}
                    {
                      SOCIAL_PLATFORMS[
                        deliverable.platform as keyof typeof SOCIAL_PLATFORMS
                      ]
                    }
                  </p>
                )}
                <p className="text-gray-600">{deliverable.description}</p>
                {deliverable.content && (
                  <p className="text-gray-600">
                    Content: {deliverable.content.substring(0, 100)}...
                  </p>
                )}
                {deliverable.url && (
                  <p className="text-xs text-blue-600">{deliverable.url}</p>
                )}
                {deliverable.file && (
                  <p className="text-xs text-green-600">
                    ✓ File: {deliverable.file.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return renderBasicInfoStep();
      case 'deliverables':
        return renderDeliverablesStep();
      case 'review':
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderStepNavigation = () => {
    const isFirstStep = currentStep === 'basic-info';
    const isLastStep = currentStep === 'review';

    return (
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        {/* Manual Save Button */}
        <button
          type="button"
          onClick={saveFormData}
          className="btn-secondary flex-1"
          disabled={isSubmitting}
        >
          💾 Save Progress
        </button>

        {!isFirstStep && (
          <button
            type="button"
            onClick={prevStep}
            className="btn-secondary flex-1"
            disabled={isSubmitting}
          >
            Previous
          </button>
        )}

        {!isLastStep ? (
          <button
            type="button"
            onClick={nextStep}
            className="btn-primary flex-1"
            disabled={isSubmitting}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Work'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
        <div className="p-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Submit Completed Work</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Form Persistence Notice */}
          {/* <div className="mb-4 p-3 display-none bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center display-none justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-green-600">💾</span>
                                <div>
                                    <h4 className="font-medium text-green-800">Auto-Save Enabled</h4>
                                    <p className="text-sm text-green-700">Your progress is automatically saved. If the form refreshes, your data will be restored.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={saveFormData}
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                                >
                                    Save Now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log('🔍 === DEBUG: CURRENT FORM STATE ===');
                                        console.log('📝 Form Data:', formData);
                                        console.log('📦 Enhanced Deliverables:', enhancedDeliverables);
                                        console.log('📍 Current Step:', currentStep);
                                        console.log('🆔 Gig ID:', gigId);
                                        console.log('================================');
                                    }}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                                >
                                    Debug State
                                </button>
                                <button
                                    type="button"
                                    onClick={testSubmission}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
                                >
                                    Test API
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAllOldData}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                                >
                                    Clear All Old Data
                                </button>
                            </div>
                        </div>
                    </div> */}

          <div className="mb-4 rounded bg-blue-50 p-3">
            <h3 className="mb-1 font-semibold text-blue-900">
              Gig: {gigTitle}
            </h3>
            <p className="text-sm text-blue-700">
              Please complete all steps to submit your work for review.
            </p>
          </div>

          {renderStepIndicator()}

          <div className="space-y-4">
            {renderCurrentStep()}

            {renderStepNavigation()}
          </div>

          <div className="mt-6 rounded bg-gray-50 p-3 text-sm text-gray-600">
            <h4 className="mb-2 font-medium">What happens next?</h4>
            <ul className="space-y-1">
              <li>• Your work will be reviewed by the brand</li>
              <li>• You'll receive feedback and rating upon review</li>
              <li>• Upon approval, you'll receive your payment</li>
              <li>• Your work history will be updated</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
