// components/clan/CreateTaskForm.tsx
import React, { useState } from 'react';
import type { CreateClanTaskRequest } from '@/types/clan.types';
import type { GigMilestone, MemberAgreement } from '@/types/gig.types';

interface CreateTaskFormProps {
    onSubmit: (data: CreateClanTaskRequest) => void;
    onCancel: () => void;
    milestones?: GigMilestone[];
    memberAgreements?: MemberAgreement[];
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
    onSubmit,
    onCancel,
    milestones = [],
    memberAgreements = []
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigneeUserId: '',
        estimatedHours: '',
        deliverables: [''],
        dueDate: '',
        milestoneId: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            estimatedHours: parseInt(formData.estimatedHours) || 0,
            deliverables: formData.deliverables.filter(d => d.trim() !== ''),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Create New Task</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                            <select
                                value={formData.assigneeUserId}
                                onChange={(e) => setFormData(prev => ({ ...prev, assigneeUserId: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                required
                            >
                                <option value="">Select Member</option>
                                {memberAgreements.map(agreement => (
                                    <option key={agreement.userId} value={agreement.userId}>
                                        {agreement.user?.name || agreement.userId}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Milestone</label>
                            <select
                                value={formData.milestoneId}
                                onChange={(e) => setFormData(prev => ({ ...prev, milestoneId: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="">No Milestone</option>
                                {milestones.map(milestone => (
                                    <option key={milestone.id} value={milestone.id}>
                                        {milestone.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                            <input
                                type="number"
                                value={formData.estimatedHours}
                                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                min="0"
                                step="0.5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables</label>
                        {formData.deliverables.map((deliverable, index) => (
                            <div key={index} className="flex space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={deliverable}
                                    onChange={(e) => {
                                        const newDeliverables = [...formData.deliverables];
                                        newDeliverables[index] = e.target.value;
                                        setFormData(prev => ({ ...prev, deliverables: newDeliverables }));
                                    }}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="Enter deliverable"
                                />
                                {formData.deliverables.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newDeliverables = formData.deliverables.filter((_, i) => i !== index);
                                            setFormData(prev => ({ ...prev, deliverables: newDeliverables }));
                                        }}
                                        className="px-3 py-2 text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                deliverables: [...prev.deliverables, '']
                            }))}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            + Add Deliverable
                        </button>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
