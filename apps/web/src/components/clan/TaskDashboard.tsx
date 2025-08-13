'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useClanGigPlan } from '@/hooks/useClanGigPlan';
import { ClanWorkPackage, UpdateClanTaskRequest } from '@/types/clan.types';
import CreateTaskModal from './CreateTaskModal';

interface TaskDashboardProps {
    clanId: string;
    gigId: string;
}

interface TaskColumn {
    id: 'todo' | 'in-progress' | 'review' | 'completed';
    title: string;
    tasks: ClanWorkPackage[];
}

interface SortableTaskItemProps {
    task: ClanWorkPackage;
    onEdit: (task: ClanWorkPackage) => void;
    isEditing: boolean;
    editForm: Partial<ClanWorkPackage>;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditFormChange: (field: keyof ClanWorkPackage, value: any) => void;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
    task,
    onEdit,
    isEditing,
    editForm,
    onSaveEdit,
    onCancelEdit,
    onEditFormChange,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white rounded-lg p-3 md:p-4 mb-3 shadow-sm border-l-4 border-blue-500 cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-lg opacity-50' : ''
                }`}
        >
            {isEditing ? (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={(e) => onEditFormChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Task title"
                    />
                    <textarea
                        value={editForm.description || ''}
                        onChange={(e) => onEditFormChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Task description"
                        rows={2}
                    />
                    <div className="flex space-x-2">
                        <button
                            onClick={onSaveEdit}
                            className="flex-1 px-3 py-1 bg-green-600 text-white text-xs md:text-sm rounded hover:bg-green-700"
                        >
                            <CheckIcon className="h-4 w-4 inline mr-1" />
                            Save
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="flex-1 px-3 py-1 bg-gray-600 text-white text-xs md:text-sm rounded hover:bg-gray-700"
                        >
                            <XMarkIcon className="h-4 w-4 inline mr-1" />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => onEdit(task)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full border ${getPriorityColor(undefined)}`}>
                            N/A
                        </span>
                        {task.dueDate && (
                            <span>
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    {task.assigneeUserId && (
                        <div className="mt-2 text-xs text-gray-500">
                            Assigned to: {task.assigneeUserId}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const toApiStatus = (columnId: TaskColumn['id']): UpdateClanTaskRequest['status'] => {
    switch (columnId) {
        case 'todo': return 'TODO';
        case 'in-progress': return 'IN_PROGRESS';
        case 'review': return 'REVIEW';
        case 'completed': return 'COMPLETED';
        default: return undefined;
    }
};

const fromApiStatus = (status: ClanWorkPackage['status']): TaskColumn['id'] => {
    switch (status) {
        case 'TODO': return 'todo';
        case 'IN_PROGRESS': return 'in-progress';
        case 'REVIEW': return 'review';
        case 'COMPLETED': return 'completed';
        default: return 'todo';
    }
};

const TaskDashboard: React.FC<TaskDashboardProps> = ({ clanId, gigId }) => {
    const {
        getClanTasks,
        updateClanTask,
        loading,
        error,
    } = useClanGigPlan();

    const [columns, setColumns] = useState<TaskColumn[]>([
        { id: 'todo', title: 'To Do', tasks: [] },
        { id: 'in-progress', title: 'In Progress', tasks: [] },
        { id: 'review', title: 'Review', tasks: [] },
        { id: 'completed', title: 'Completed', tasks: [] }
    ]);

    const [allTasks, setAllTasks] = useState<ClanWorkPackage[]>([]);
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<ClanWorkPackage>>({});
    const [activeTask, setActiveTask] = useState<ClanWorkPackage | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const loadTasks = useCallback(async () => {
        const result = await getClanTasks(clanId, gigId);
        if (result) {
            setAllTasks(result);
            const updated = columns.map(col => ({
                ...col,
                tasks: result.filter(t => fromApiStatus(t.status) === col.id)
            }));
            setColumns(updated);
        }
    }, [getClanTasks, clanId, gigId]);

    useEffect(() => {
        loadTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clanId, gigId]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = allTasks.find(t => t.id === active.id);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over || active.id === over.id) return;

        const movedTask = allTasks.find(t => t.id === String(active.id));
        if (!movedTask) return;

        const newStatus = toApiStatus(over.id as TaskColumn['id']);

        if (movedTask.status !== newStatus && newStatus) {
            try {
                const updateData: UpdateClanTaskRequest = {
                    status: newStatus,
                };

                await updateClanTask(clanId, gigId, movedTask.id, updateData);
                await loadTasks();
            } catch (error) {
                console.error('Failed to update task status:', error);
                await loadTasks();
            }
        }
    }, [allTasks, updateClanTask, clanId, gigId, loadTasks]);

    const handleEditTask = (task: ClanWorkPackage) => {
        setEditingTask(task.id);
        setEditForm({
            title: task.title,
            description: task.description,
            assigneeUserId: task.assigneeUserId,
            dueDate: task.dueDate
        });
    };

    const handleEditFormChange = (field: keyof ClanWorkPackage, value: any) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveEdit = async () => {
        if (!editingTask || !editForm.title) return;

        try {
            const updateData: UpdateClanTaskRequest = {
                title: editForm.title,
                description: editForm.description,
                assigneeUserId: editForm.assigneeUserId,
                dueDate: editForm.dueDate
            };

            await updateClanTask(clanId, gigId, editingTask, updateData);
            setEditingTask(null);
            setEditForm({});
            await loadTasks();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingTask(null);
        setEditForm({});
    };

    if (loading && allTasks.length === 0) {
        return (
            <div className="flex items-center justify-center p-6 md:p-8">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-6 md:p-8 text-red-600">
                <p>Failed to load tasks: {String(error)}</p>
                <button
                    onClick={() => loadTasks()}
                    className="mt-4 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-2 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-6">
                <h2 className="text-base md:text-2xl font-bold text-gray-900">Task Dashboard</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Task
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex md:grid md:grid-cols-2 md:grid-rows-2 md:gap-5 -mx-2 md:mx-0 overflow-x-auto no-scrollbar px-2 md:px-0 gap-2 md:gap-0">
                    {columns.map((column) => (
                        <div key={column.id} className="bg-gray-50 rounded-lg p-2.5 md:p-4 flex-1 md:flex-initial min-w-[70%] md:min-w-0">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{column.title}</h3>
                                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs md:text-sm">
                                    {column.tasks.length}
                                </span>
                            </div>

                            <SortableContext
                                items={column.tasks.map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="min-h-[180px]">
                                    {column.tasks.map((task) => (
                                        <SortableTaskItem
                                            key={task.id}
                                            task={task}
                                            onEdit={handleEditTask}
                                            isEditing={editingTask === task.id}
                                            editForm={editForm}
                                            onSaveEdit={handleSaveEdit}
                                            onCancelEdit={handleCancelEdit}
                                            onEditFormChange={handleEditFormChange}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </div>
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg border-l-4 border-blue-500 opacity-80">
                            <h4 className="font-medium text-gray-900 text-sm">{activeTask.title}</h4>
                            {activeTask.description && (
                                <p className="text-gray-600 text-sm mt-2">{activeTask.description}</p>
                            )}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <div className="mt-3 md:mt-6 flex md:justify-end">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full md:w-auto px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base"
                >
                    Create Task
                </button>
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                clanId={clanId}
                gigId={gigId}
            />
        </div>
    );
};

export default TaskDashboard;
