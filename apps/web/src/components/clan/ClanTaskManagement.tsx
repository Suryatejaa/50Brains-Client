// components/clan/ClanTaskManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useClanGigPlan } from '@/hooks/useClanGigPlan';
import { useClanGigWorkflow } from '@/hooks/useClanGigWorkflow';
import type { ClanWorkPackage, CreateClanTaskRequest, MemberAgreement } from '@/types/clan.types';
import type { GigMilestone, GigTask } from '@/types/gig.types';
import { TaskItem } from './TaskItem';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'COMPLETED':
            return 'bg-green-100 text-green-800';
        case 'IN_PROGRESS':
            return 'bg-blue-100 text-blue-800';
        case 'REVIEW':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'COMPLETED':
            return '✓';
        case 'IN_PROGRESS':
            return '▶';
        case 'REVIEW':
            return '👁';
        default:
            return '○';
    }
};

interface ClanTaskManagementProps {
    clanId: string;
    gigId: string;
}

export const ClanTaskManagement: React.FC<ClanTaskManagementProps> = ({
    clanId,
    gigId,
}) => {
    const {
        createClanTask,
        updateClanTask,
        getClanTasks,
        loading,
        error
    } = useClanGigPlan();

    // Add the workflow hook
    const {
        milestones,
        tasks,
        memberAgreements,
        loading: workflowLoading
    } = useClanGigWorkflow(clanId, gigId);

    const [showCreateForm, setShowCreateForm] = useState(false);

    // Group tasks by milestone
    const tasksByMilestone = useMemo(() => {
        const grouped: { [milestoneId: string]: GigTask[] } = {};

        milestones.forEach(milestone => {
            grouped[milestone.id] = tasks.filter(task => task.milestoneId === milestone.id);
        });

        return grouped;
    }, [milestones, tasks]);

    const handleCreateTask = async (taskData: CreateClanTaskRequest) => {
        try {
            const newTask = await createClanTask(clanId, gigId, taskData);
            if (newTask) {
                setShowCreateForm(false);
                // The workflow hook will automatically refresh the data
            }
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<GigTask>) => {
        try {
            // Convert GigTask updates to UpdateClanTaskRequest format
            const clanTaskUpdates: any = {
                ...updates,
                // Map any necessary field conversions
            };

            const updatedTask = await updateClanTask(clanId, gigId, taskId, clanTaskUpdates);
            if (updatedTask) {
                // The workflow hook will automatically refresh the data
            }
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    if (!gigId) {
        return (
            <div className="p-6 text-center text-gray-500">
                <p>Select a gig to manage tasks</p>
            </div>
        );
    }

    if (workflowLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Management</h2>
                <p className="text-gray-600">Organize and track work for this gig</p>
            </div>

            {/* Milestones and Tasks */}
            <div className="space-y-6">
                {milestones && milestones.length > 0 ? (
                    milestones.map(milestone => (
                        <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                                    <p className="text-sm text-gray-600">
                                        Due: {new Date(milestone.dueAt).toLocaleDateString()} |
                                        Amount: ${milestone.amount}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Status: <span className={`font-medium ${milestone.status === 'APPROVED' ? 'text-green-600' :
                                            milestone.status === 'SUBMITTED' ? 'text-blue-600' :
                                                milestone.status === 'IN_PROGRESS' ? 'text-yellow-600' :
                                                    'text-gray-600'
                                            }`}>
                                            {milestone.status}
                                        </span>
                                    </p>
                                </div>

                                {milestone.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => {/* TODO: Implement milestone submission */ }}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                    >
                                        Submit for Review
                                    </button>
                                )}
                            </div>

                            {/* Tasks for this milestone */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-700">Tasks</h4>

                                {tasksByMilestone[milestone.id]?.length > 0 ? (
                                    tasksByMilestone[milestone.id].map(task => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            onUpdate={handleUpdateTask}
                                            memberAgreements={memberAgreements}
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No tasks created yet</p>
                                )}

                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    + Add Task
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No milestones found for this gig.</p>
                        <p className="text-sm">Tasks will be organized by milestones.</p>
                    </div>
                )}
            </div>

            {/* Create Task Form */}
            {showCreateForm && (
                <CreateTaskForm
                    onSubmit={handleCreateTask}
                    onCancel={() => setShowCreateForm(false)}
                    milestones={milestones}
                    memberAgreements={memberAgreements}
                />
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

// Task Card Component
const TaskCard: React.FC<{
    task: ClanWorkPackage;
    onUpdate: (taskId: string, updates: Partial<ClanWorkPackage>) => void;
}> = ({ task, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: task.title,
        description: task.description || '',
        status: task.status,
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0,
        notes: task.notes || '',
    });

    const handleSave = () => {
        onUpdate(task.id, editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({
            title: task.title,
            description: task.description || '',
            status: task.status,
            estimatedHours: task.estimatedHours || 0,
            actualHours: task.actualHours || 0,
            notes: task.notes || '',
        });
        setIsEditing(false);
    };

    const updateStatus = (newStatus: string) => {
        onUpdate(task.id, { status: newStatus as any });
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estimated Hours
                            </label>
                            <input
                                type="number"
                                value={editData.estimatedHours}
                                onChange={(e) => setEditData({ ...editData, estimatedHours: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Actual Hours
                            </label>
                            <input
                                type="number"
                                value={editData.actualHours}
                                onChange={(e) => setEditData({ ...editData, actualHours: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={editData.notes}
                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={2}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-lg">{task.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {getStatusIcon(task.status)} {task.status}
                            </span>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✏️
                            </button>
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                            <span className="text-gray-500">Assignee:</span>
                            <span className="ml-2 font-medium">{task.assigneeUserId}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Due Date:</span>
                            <span className="ml-2 font-medium">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Estimated Hours:</span>
                            <span className="ml-2 font-medium">{task.estimatedHours || 'Not set'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Actual Hours:</span>
                            <span className="ml-2 font-medium">{task.actualHours || 'Not set'}</span>
                        </div>
                    </div>

                    {task.deliverables && task.deliverables.length > 0 && (
                        <div className="mb-3">
                            <span className="text-gray-500 text-sm">Deliverables:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {task.deliverables.map((deliverable, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                    >
                                        {deliverable}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Update Buttons */}
                    <div className="flex gap-2 mt-4">
                        {task.status === 'TODO' && (
                            <button
                                onClick={() => updateStatus('IN_PROGRESS')}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                            >
                                Start Work
                            </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                            <button
                                onClick={() => updateStatus('REVIEW')}
                                className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-md hover:bg-yellow-700"
                            >
                                Submit for Review
                            </button>
                        )}
                        {task.status === 'REVIEW' && (
                            <button
                                onClick={() => updateStatus('COMPLETED')}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                            >
                                Mark Complete
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Create Task Form Component
const CreateTaskForm: React.FC<{
    onSubmit: (taskData: CreateClanTaskRequest) => void;
    onCancel: () => void;
    milestones?: GigMilestone[];
    memberAgreements?: MemberAgreement[];
}> = ({ onSubmit, onCancel, milestones = [], memberAgreements = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigneeUserId: '',
        estimatedHours: 0,
        deliverables: [''],
        dueDate: '',
        milestoneId: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            deliverables: formData.deliverables.filter(d => d.trim() !== ''),
        });
    };

    const addDeliverable = () => {
        setFormData({
            ...formData,
            deliverables: [...formData.deliverables, ''],
        });
    };

    const removeDeliverable = (index: number) => {
        setFormData({
            ...formData,
            deliverables: formData.deliverables.filter((_, i) => i !== index),
        });
    };

    const updateDeliverable = (index: number, value: string) => {
        const newDeliverables = [...formData.deliverables];
        newDeliverables[index] = value;
        setFormData({
            ...formData,
            deliverables: newDeliverables,
        });
    };

    return (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Create New Task</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Title *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter task title"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Describe the task requirements"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assignee *
                        </label>
                        <select
                            required
                            value={formData.assigneeUserId}
                            onChange={(e) => setFormData({ ...formData, assigneeUserId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Select Member</option>
                            {memberAgreements.map(agreement => (
                                <option key={agreement.userId} value={agreement.userId}>
                                    {agreement.userId}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Hours
                        </label>
                        <input
                            type="number"
                            value={formData.estimatedHours}
                            onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Milestone
                    </label>
                    <select
                        value={formData.milestoneId || ''}
                        onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">No Milestone</option>
                        {milestones.map(milestone => (
                            <option key={milestone.id} value={milestone.id}>
                                {milestone.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                    </label>
                    <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deliverables
                    </label>
                    {formData.deliverables.map((deliverable, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={deliverable}
                                onChange={(e) => updateDeliverable(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Deliverable description"
                            />
                            <button
                                type="button"
                                onClick={() => removeDeliverable(index)}
                                className="px-3 py-2 text-red-500 hover:text-red-700"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addDeliverable}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        + Add Deliverable
                    </button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Create Task
                    </button>
                </div>
            </form>
        </div>
    );
};
