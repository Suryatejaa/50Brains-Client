'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WorkHistorySummary } from '@/components/WorkHistorySummary';
import { WorkHistoryList } from '@/components/WorkHistoryList';
import { Portfolio } from '@/components/Portfolio';
import { Achievements } from '@/components/Achievements';

const InfluencerWorkHistory: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'work-history', label: 'Work History', icon: '📋' },
        { id: 'portfolio', label: 'Portfolio', icon: '📁' },
        { id: 'achievements', label: 'Achievements', icon: '🏆' },
    ];

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="card-glass p-8 text-center">
                    <p className="text-gray-600">Please log in to view your dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.username || user.email}!
                </h1>
                <p className="text-gray-600">Manage your influencer profile and track your progress</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <WorkHistorySummary userId={user.id} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Recent Work</h2>
                                <WorkHistoryList userId={user.id} showFilters={false} limit={5} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
                                <Achievements userId={user.id} showVerifiedOnly={false} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'work-history' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Work History</h2>
                        <WorkHistoryList userId={user.id} />
                    </div>
                )}

                {activeTab === 'portfolio' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
                        <Portfolio userId={user.id} showPublicOnly={false} />
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
                        <Achievements userId={user.id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfluencerWorkHistory;
