'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useClanGigPlan } from '@/hooks/useClanGigPlan';
import { CreateClanTaskRequest } from '@/types/clan.types';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    clanId: string;
    gigId: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
    isOpen,
    onClose,
    clanId,
    gigId
}) => {
    const { createClanTask, loading, error } = useClanGigPlan();

    const [formData, setFormData] = useState<CreateClanTaskRequest>({
        title: '',
        description: '',
        assigneeUserId: '',
        estimatedHours: 0,
        deliverables: [],
        dueDate: '',
    });

    const handleInputChange = (field: keyof CreateClanTaskRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.assigneeUserId.trim()) {
            return;
        }

        try {
            const payload: CreateClanTaskRequest = {
                ...formData,
                deliverables: formData.deliverables || [],
            };
            await createClanTask(clanId, gigId, payload);
            setFormData({
                title: '',
                description: '',
                assigneeUserId: '',
                estimatedHours: 0,
                deliverables: [],
                dueDate: '',
            });
            onClose();
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            assigneeUserId: '',
            estimatedHours: 0,
            deliverables: [],
            dueDate: '',
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                            {String(error)}
                        </div>
                    )}

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter task description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                                Assignee User ID *
                            </label>
                            <input
                                type="text"
                                id="assignee"
                                value={formData.assigneeUserId}
                                onChange={(e) => handleInputChange('assigneeUserId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter assignee ID"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                id="dueDate"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
                                Estimated Hours
                            </label>
                            <input
                                type="number"
                                id="estimatedHours"
                                value={formData.estimatedHours}
                                onChange={(e) => handleInputChange('estimatedHours', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                                min="0"
                                step="0.5"
                            />
                        </div>

                        <div>
                            <label htmlFor="deliverables" className="block text-sm font-medium text-gray-700 mb-1">
                                Deliverables (comma-separated)
                            </label>
                            <input
                                type="text"
                                id="deliverables"
                                value={(formData.deliverables || []).join(', ')}
                                onChange={(e) => handleInputChange('deliverables', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Asset A, Report B"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.title.trim()}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
