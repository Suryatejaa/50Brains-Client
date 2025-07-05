import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (file: File | null) => void;
  label: string;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'auto';
  maxSize?: number; // in MB
  accept?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  label,
  className = '',
  aspectRatio = 'auto',
  maxSize = 5,
  accept = 'image/*',
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'wide':
        return 'aspect-[16/9]';
      default:
        return '';
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file';
    }
    return null;
  };

  const handleFileChange = (file: File | null) => {
    setError(null);

    if (!file) {
      setPreview(null);
      onImageChange(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onImageChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div
        className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${getAspectRatioClass()}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {preview ? (
          <div
            className={`relative h-full w-full ${aspectRatio === 'square' ? 'min-h-[120px] sm:min-h-[200px]' : 'min-h-[100px] sm:min-h-[150px]'}`}
          >
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white transition-colors hover:bg-red-600"
              type="button"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center p-0 ${aspectRatio === 'square' ? 'min-h-[80px] sm:min-h-[100px]' : 'min-h-[60px] sm:min-h-[80px]'}`}
          >
            <svg
              className="mb-2 h-6 w-6 text-gray-400 sm:h-8 sm:w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-center text-xs leading-tight text-gray-600 sm:text-sm">
              <span className="font-medium">Click to upload</span>
              <span className="hidden sm:inline"> or drag and drop</span>
            </p>
            <p className="mt-1 hidden text-xs text-gray-500 sm:block">
              PNG, JPG up to {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUpload;
