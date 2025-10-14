// components/clan/TaskItem.tsx
import React from 'react';
import { GigTask, MemberAgreement } from '@/types/gig.types';

interface TaskItemProps {
    task: GigTask;
    onUpdate: (taskId: string, updates: Partial<GigTask>) => void;
    memberAgreements: MemberAgreement[];
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, memberAgreements }) => {
    const assignee = memberAgreements.find(ma => ma.assigneeId === task.assigneeUserId);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'REVIEW': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusChange = (newStatus: string) => {
        onUpdate(task.id, { status: newStatus as any });
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{task.title}</h5>
                    {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}

                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>Assignee: {assignee?.assigneeId || 'Unknown'}</span>
                        {task.estimatedHours && (
                            <span>Est. Hours: {task.estimatedHours}</span>
                        )}
                        {task.actualHours && (
                            <span>Actual Hours: {task.actualHours}</span>
                        )}
                    </div>

                    {task.deliverables && task.deliverables.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Deliverables:</p>
                            <ul className="mt-1 space-y-1">
                                {task.deliverables.map((deliverable, index) => (
                                    <li key={index} className="text-sm text-gray-600">• {deliverable}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                    </span>

                    <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="REVIEW">REVIEW</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
