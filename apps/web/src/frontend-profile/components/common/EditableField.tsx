import React, { useState } from 'react';

interface EditableFieldProps {
  label: string;
  value: string | number | undefined;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'textarea';
  placeholder?: string;
  isEditing: boolean;
  onChange: (value: string | number) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  rows?: number;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  type = 'text',
  placeholder,
  isEditing,
  disabled,
  onChange,
  className = '',
  required = false,
  maxLength,
  rows = 3,
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue =
      type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setLocalValue(e.target.value);
    onChange(newValue);
  };

  const displayValue = value || 'Not specified';

  if (!isEditing) {
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="min-h-[20px] text-sm text-gray-900">
          {value ? (
            String(value)
          ) : (
            <span className="italic text-gray-400">Not specified</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-none border border-gray-300 px-1 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={rows}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          maxLength={maxLength}
          required={required}
        />
      )}
      {maxLength && (
        <div className="text-right text-xs text-gray-500">
          {String(localValue).length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default EditableField;
