'use client';

import React from 'react';
import { useWorkHistory } from '@/hooks/useWorkHistory';

interface WorkHistorySummaryProps {
    userId?: string;
}

export const WorkHistorySummary: React.FC<WorkHistorySummaryProps> = ({
    userId
}) => {
    const { workSummary, skills, loading, error } = useWorkHistory(userId);

    if (loading) {
        return (
            <div className="card-glass p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-center text-gray-600 mt-2">Loading work summary...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card-glass p-4">
                <p className="text-red-600 text-center">{error}</p>
            </div>
        );
    }

    if (!workSummary) {
        return (
            <div className="card-glass p-4">
                <p className="text-gray-600 text-center">No work summary available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-glass p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{workSummary.totalProjects}</div>
                    <div className="text-sm text-gray-600">Total Projects</div>
                </div>

                <div className="card-glass p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{workSummary.completedProjects}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                </div>

                <div className="card-glass p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">⭐ {workSummary.averageRating?.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                </div>

                <div className="card-glass p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">₹{workSummary.totalEarnings?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
            </div>

            {/* Success Rate & Verification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-glass p-4">
                    <h3 className="font-semibold mb-3">Success Rate</h3>
                    <div className="flex items-center space-x-3">
                        <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${workSummary.successRate}%` }}
                                ></div>
                            </div>
                        </div>
                        <span className="text-sm font-medium">{workSummary.successRate}%</span>
                    </div>
                </div>

                <div className="card-glass p-4">
                    <h3 className="font-semibold mb-3">Verification Level</h3>
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${workSummary.verificationLevel === 'verified' ? 'bg-green-100 text-green-800' :
                                workSummary.verificationLevel === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {workSummary.verificationLevel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Top Skills */}
            {skills.length > 0 && (
                <div className="card-glass p-4">
                    <h3 className="font-semibold mb-3">Top Skills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {skills.slice(0, 6).map((skill, index) => (
                            <div key={skill.skill} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium">{skill.skill}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">{skill.proficiency}</span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {skill.score}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}; 