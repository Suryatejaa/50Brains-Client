// components/forms/RoleInfoEditForm.tsx
import React, { useState } from 'react';
import EditableField from '../common/EditableField';

interface RoleInfoEditFormProps {
  role: 'INFLUENCER' | 'BRAND' | 'CREW';
  data: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const RoleInfoEditForm: React.FC<RoleInfoEditFormProps> = ({
  role,
  data,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState(data || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save role info:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateArrayField = (field: string, values: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: values,
    }));
  };

  const addToArray = (field: string, value: string) => {
    if (!value.trim()) return;
    const currentArray = formData[field] || [];
    if (!currentArray.includes(value.trim())) {
      updateArrayField(field, [...currentArray, value.trim()]);
    }
  };

  const removeFromArray = (field: string, index: number) => {
    const currentArray = formData[field] || [];
    updateArrayField(
      field,
      currentArray.filter((_: any, i: number) => i !== index)
    );
  };

  const renderInfluencerForm = () => (
    <>
      <EditableField
        label="Primary Niche"
        value={formData.primaryNiche || ''}
        type="text"
        isEditing={true}
        onChange={(value) => updateField('primaryNiche', value)}
        placeholder="e.g., Fashion, Technology, Food"
      />

      <EditableField
        label="Primary Platform"
        value={formData.primaryPlatform || ''}
        type="text"
        isEditing={true}
        onChange={(value) => updateField('primaryPlatform', value)}
        placeholder="e.g., Instagram, YouTube, TikTok"
      />

      <EditableField
        label="Estimated Followers"
        value={formData.estimatedFollowers || ''}
        type="number"
        isEditing={true}
        onChange={(value) => updateField('estimatedFollowers', Number(value))}
        placeholder="Number of followers"
      />

      <div className="form-field">
        <label>Content Categories:</label>
        <div className="tag-editor">
          <div className="tags-list">
            {(formData.contentCategories || []).map(
              (category: string, index: number) => (
                <span key={index} className="tag">
                  {category}
                  <button
                    type="button"
                    onClick={() => removeFromArray('contentCategories', index)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              )
            )}
          </div>
          <input
            type="text"
            placeholder="Add category and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('contentCategories', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="tag-input"
          />
        </div>
      </div>
    </>
  );

  const renderBrandForm = () => (
    <>
      <EditableField
        label="Company Name"
        value={formData.companyName || ''}
        type="text"
        isEditing={true}
        onChange={(value) => updateField('companyName', value)}
        placeholder="Your company name"
      />

      <EditableField
        label="Industry"
        value={formData.industry || ''}
        type="text"
        isEditing={true}
        onChange={(value) => updateField('industry', value)}
        placeholder="e.g., Technology, Fashion, Healthcare"
      />

      <EditableField
        label="Company Type"
        value={formData.companyType || ''}
        type="text"
        isEditing={true}
        onChange={(value) => updateField('companyType', value)}
        placeholder="e.g., Startup, Enterprise, SMB"
      />

      <EditableField
        label="Marketing Budget"
        value={formData.marketingBudget || ''}
        type="text"
        isEditing={true}
        onChange={(value) => updateField('marketingBudget', value)}
        placeholder="e.g., $10,000 - $50,000"
      />

      <div className="form-field">
        <label>Target Audience:</label>
        <div className="tag-editor">
          <div className="tags-list">
            {(formData.targetAudience || []).map(
              (audience: string, index: number) => (
                <span key={index} className="tag">
                  {audience}
                  <button
                    type="button"
                    onClick={() => removeFromArray('targetAudience', index)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              )
            )}
          </div>
          <input
            type="text"
            placeholder="Add target audience and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('targetAudience', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="tag-input"
          />
        </div>
      </div>
    </>
  );

  const renderCrewForm = () => (
    <>
      <EditableField
        label="Experience Level"
        value={formData.experienceLevel || ''}
        type="text"
        isEditing={true}
        onChange={(value) => updateField('experienceLevel', value)}
        placeholder="e.g., Beginner, Intermediate, Expert"
      />

      <EditableField
        label="Hourly Rate"
        value={formData.hourlyRate || ''}
        type="number"
        isEditing={true}
        onChange={(value) => updateField('hourlyRate', Number(value))}
        placeholder="Rate in USD per hour"
      />

      <EditableField
        label="Availability"
        value={formData.availability || ''}
        type="text"
        isEditing={true}
        onChange={(value) => updateField('availability', value)}
        placeholder="e.g., Full-time, Part-time, Weekends"
      />

      <EditableField
        label="Work Style"
        value={formData.workStyle || ''}
        type="text"
        isEditing={true}
        onChange={(value) => updateField('workStyle', value)}
        placeholder="e.g., Remote, On-site, Hybrid"
      />

      <div className="form-field">
        <label>Skills:</label>
        <div className="tag-editor">
          <div className="tags-list">
            {(formData.crewSkills || []).map((skill: string, index: number) => (
              <span key={index} className="tag">
                {skill}
                <button
                  type="button"
                  onClick={() => removeFromArray('crewSkills', index)}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add skill and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('crewSkills', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="tag-input"
          />
        </div>
      </div>

      <div className="form-field">
        <label>Equipment:</label>
        <div className="tag-editor">
          <div className="tags-list">
            {(formData.equipmentOwned || []).map(
              (equipment: string, index: number) => (
                <span key={index} className="tag">
                  {equipment}
                  <button
                    type="button"
                    onClick={() => removeFromArray('equipmentOwned', index)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              )
            )}
          </div>
          <input
            type="text"
            placeholder="Add equipment and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('equipmentOwned', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="tag-input"
          />
        </div>
      </div>
    </>
  );

  const renderForm = () => {
    switch (role) {
      case 'INFLUENCER':
        return renderInfluencerForm();
      case 'BRAND':
        return renderBrandForm();
      case 'CREW':
        return renderCrewForm();
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="role-info-edit-form">
      <div className="form-content">{renderForm()}</div>

      <div className="form-actions">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn--primary"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="btn btn--secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RoleInfoEditForm;
