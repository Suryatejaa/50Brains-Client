import React, { useState } from 'react';
import { clanApiClient } from '@/lib/clan-api';

interface CreateClanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (clan: any) => void;
}

export const CreateClanModal: React.FC<CreateClanModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        tagline: '',
        visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY',
        isVerified: false,
        isActive: true,
        email: '',
        website: '',
        instagramHandle: '',
        twitterHandle: '',
        linkedinHandle: '',
        requiresApproval: true,
        isPaidMembership: false,
        membershipFee: 0,
        maxMembers: 50,
        primaryCategory: '',
        categories: [] as string[],
        skills: [] as string[],
        location: '',
        timezone: '',
        portfolioImages: [] as string[],
        portfolioVideos: [] as string[],
        showcaseProjects: [] as string[]
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    const categories = [
        'Technology',
        'Design',
        'Content Creation',
        'Video Production',
        'Photography',
        'Marketing',
        'Music',
        'Gaming',
        'Fitness',
        'Food',
        'Travel',
        'Fashion',
        'Beauty',
        'Education',
        'Business'
    ];

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Clan name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Clan name must be at least 2 characters';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Clan name cannot exceed 50 characters';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description cannot exceed 500 characters';
        }

        if (formData.tagline && formData.tagline.length > 100) {
            newErrors.tagline = 'Tagline cannot exceed 100 characters';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
            newErrors.website = 'Please enter a valid website URL';
        }

        if (formData.maxMembers < 1 || formData.maxMembers > 1000) {
            newErrors.maxMembers = 'Max members must be between 1 and 1000';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            const response = await clanApiClient.createClan(formData);
            console.log('Clan creation response:', response);

            if (response.success) {
                console.log('Clan data:', response.data);
                onSuccess(response.data);
                onClose();
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    tagline: '',
                    visibility: 'PUBLIC',
                    isVerified: false,
                    isActive: true,
                    email: '',
                    website: '',
                    instagramHandle: '',
                    twitterHandle: '',
                    linkedinHandle: '',
                    requiresApproval: true,
                    isPaidMembership: false,
                    membershipFee: 0,
                    maxMembers: 50,
                    primaryCategory: '',
                    categories: [],
                    skills: [],
                    location: '',
                    timezone: '',
                    portfolioImages: [],
                    portfolioVideos: [],
                    showcaseProjects: []
                });
                setErrors({});
            } else {
                setErrors({ submit: 'Failed to create clan' });
            }
        } catch (error: any) {
            console.error('Error creating clan:', error);
            setErrors({ submit: error.message || 'Failed to create clan' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleCategoryChange = (category: string) => {
        const newCategories = formData.categories.includes(category)
            ? formData.categories.filter(c => c !== category)
            : [...formData.categories, category];
        handleChange('categories', newCategories);
    };

    const handleSkillAdd = (skill: string) => {
        if (skill.trim() && !formData.skills.includes(skill.trim())) {
            handleChange('skills', [...formData.skills, skill.trim()]);
        }
    };

    const handleSkillRemove = (skill: string) => {
        handleChange('skills', formData.skills.filter(s => s !== skill));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Create New Clan</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Clan Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="Enter clan name"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
                            Tagline
                        </label>
                        <input
                            type="text"
                            id="tagline"
                            value={formData.tagline}
                            onChange={(e) => handleChange('tagline', e.target.value)}
                            className={`input w-full ${errors.tagline ? 'border-red-500' : ''}`}
                            placeholder="Brief tagline for your clan"
                            maxLength={100}
                        />
                        {errors.tagline && <p className="text-red-500 text-xs mt-1">{errors.tagline}</p>}
                    </div>

                    <div>
                        <label htmlFor="primaryCategory" className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Category
                        </label>
                        <select
                            id="primaryCategory"
                            value={formData.primaryCategory}
                            onChange={(e) => handleChange('primaryCategory', e.target.value)}
                            className="input w-full"
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category} value={category.toUpperCase().replace(' ', '_')}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className={`input w-full ${errors.description ? 'border-red-500' : ''}`}
                            placeholder="Describe your clan's mission and goals"
                            rows={3}
                            maxLength={500}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                                Visibility
                            </label>
                            <select
                                id="visibility"
                                value={formData.visibility}
                                onChange={(e) => handleChange('visibility', e.target.value)}
                                className="input w-full"
                            >
                                <option value="PUBLIC">Public</option>
                                <option value="PRIVATE">Private</option>
                                <option value="INVITE_ONLY">Invite Only</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1">
                                Max Members
                            </label>
                            <input
                                type="number"
                                id="maxMembers"
                                value={formData.maxMembers}
                                onChange={(e) => handleChange('maxMembers', parseInt(e.target.value))}
                                className={`input w-full ${errors.maxMembers ? 'border-red-500' : ''}`}
                                min={1}
                                max={1000}
                            />
                            {errors.maxMembers && <p className="text-red-500 text-xs mt-1">{errors.maxMembers}</p>}
                        </div>
                    </div>

                    {/* Membership Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="requiresApproval"
                                checked={formData.requiresApproval}
                                onChange={(e) => handleChange('requiresApproval', e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="requiresApproval" className="text-sm font-medium text-gray-700">
                                Requires Approval to Join
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isPaidMembership"
                                checked={formData.isPaidMembership}
                                onChange={(e) => handleChange('isPaidMembership', e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="isPaidMembership" className="text-sm font-medium text-gray-700">
                                Paid Membership
                            </label>
                        </div>

                        {formData.isPaidMembership && (
                            <div>
                                <label htmlFor="membershipFee" className="block text-sm font-medium text-gray-700 mb-1">
                                    Membership Fee ($)
                                </label>
                                <input
                                    type="number"
                                    id="membershipFee"
                                    value={formData.membershipFee}
                                    onChange={(e) => handleChange('membershipFee', parseFloat(e.target.value))}
                                    className="input w-full"
                                    min={0}
                                    step={0.01}
                                />
                            </div>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="clan@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                Website
                            </label>
                            <input
                                type="url"
                                id="website"
                                value={formData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                className={`input w-full ${errors.website ? 'border-red-500' : ''}`}
                                placeholder="https://clan-website.com"
                            />
                            {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
                        </div>
                    </div>

                    {/* Social Media Handles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-700 mb-1">
                                Instagram Handle
                            </label>
                            <input
                                type="text"
                                id="instagramHandle"
                                value={formData.instagramHandle}
                                onChange={(e) => handleChange('instagramHandle', e.target.value)}
                                className="input w-full"
                                placeholder="clanhandle"
                            />
                        </div>

                        <div>
                            <label htmlFor="twitterHandle" className="block text-sm font-medium text-gray-700 mb-1">
                                Twitter Handle
                            </label>
                            <input
                                type="text"
                                id="twitterHandle"
                                value={formData.twitterHandle}
                                onChange={(e) => handleChange('twitterHandle', e.target.value)}
                                className="input w-full"
                                placeholder="clanhandle"
                            />
                        </div>

                        <div>
                            <label htmlFor="linkedinHandle" className="block text-sm font-medium text-gray-700 mb-1">
                                LinkedIn Handle
                            </label>
                            <input
                                type="text"
                                id="linkedinHandle"
                                value={formData.linkedinHandle}
                                onChange={(e) => handleChange('linkedinHandle', e.target.value)}
                                className="input w-full"
                                placeholder="clanhandle"
                            />
                        </div>
                    </div>

                    {/* Location & Timezone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                className="input w-full"
                                placeholder="City, Country"
                            />
                        </div>

                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                                Timezone
                            </label>
                            <select
                                id="timezone"
                                value={formData.timezone}
                                onChange={(e) => handleChange('timezone', e.target.value)}
                                className="input w-full"
                            >
                                <option value="">Select timezone</option>
                                <option value="America/New_York">Eastern Time (ET)</option>
                                <option value="America/Chicago">Central Time (CT)</option>
                                <option value="America/Denver">Mountain Time (MT)</option>
                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                <option value="Europe/London">London (GMT)</option>
                                <option value="Europe/Paris">Paris (CET)</option>
                                <option value="Asia/Tokyo">Tokyo (JST)</option>
                                <option value="Asia/Shanghai">Shanghai (CST)</option>
                                <option value="Australia/Sydney">Sydney (AEST)</option>
                            </select>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categories
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {categories.map((category) => (
                                <label key={category} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.categories.includes(category)}
                                        onChange={() => handleCategoryChange(category)}
                                        className="rounded"
                                    />
                                    <span className="text-sm">{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skills
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded text-sm flex items-center gap-1"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => handleSkillRemove(skill)}
                                        className="text-brand-primary hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a skill"
                                className="input flex-1"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSkillAdd((e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    handleSkillAdd(input.value);
                                    input.value = '';
                                }}
                                className="btn-secondary px-4"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Portfolio Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Portfolio Images (URLs)
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.portfolioImages.map((image, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                                >
                                    Image {index + 1}
                                    <button
                                        type="button"
                                        onClick={() => handleChange('portfolioImages', formData.portfolioImages.filter((_, i) => i !== index))}
                                        className="text-blue-800 hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                className="input flex-1"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const url = (e.target as HTMLInputElement).value;
                                        if (url.trim()) {
                                            handleChange('portfolioImages', [...formData.portfolioImages, url.trim()]);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    const url = input.value.trim();
                                    if (url) {
                                        handleChange('portfolioImages', [...formData.portfolioImages, url]);
                                        input.value = '';
                                    }
                                }}
                                className="btn-secondary px-4"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Portfolio Videos */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Portfolio Videos (URLs)
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.portfolioVideos.map((video, index) => (
                                <span
                                    key={index}
                                    className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                                >
                                    Video {index + 1}
                                    <button
                                        type="button"
                                        onClick={() => handleChange('portfolioVideos', formData.portfolioVideos.filter((_, i) => i !== index))}
                                        className="text-green-800 hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="https://example.com/video.mp4"
                                className="input flex-1"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const url = (e.target as HTMLInputElement).value;
                                        if (url.trim()) {
                                            handleChange('portfolioVideos', [...formData.portfolioVideos, url.trim()]);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    const url = input.value.trim();
                                    if (url) {
                                        handleChange('portfolioVideos', [...formData.portfolioVideos, url]);
                                        input.value = '';
                                    }
                                }}
                                className="btn-secondary px-4"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Showcase Projects */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Showcase Projects
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.showcaseProjects.map((project, index) => (
                                <span
                                    key={index}
                                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                                >
                                    {project}
                                    <button
                                        type="button"
                                        onClick={() => handleChange('showcaseProjects', formData.showcaseProjects.filter((_, i) => i !== index))}
                                        className="text-purple-800 hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Project name"
                                className="input flex-1"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const project = (e.target as HTMLInputElement).value;
                                        if (project.trim()) {
                                            handleChange('showcaseProjects', [...formData.showcaseProjects, project.trim()]);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    const project = input.value.trim();
                                    if (project) {
                                        handleChange('showcaseProjects', [...formData.showcaseProjects, project]);
                                        input.value = '';
                                    }
                                }}
                                className="btn-secondary px-4"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {errors.submit}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-ghost"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Clan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 