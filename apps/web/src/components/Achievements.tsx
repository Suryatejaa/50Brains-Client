'use client';

import React, { useState } from 'react';
import { useWorkHistory } from '@/hooks/useWorkHistory';

interface AchievementsProps {
    userId?: string;
    showVerifiedOnly?: boolean;
}

export const Achievements: React.FC<AchievementsProps> = ({
    userId,
    showVerifiedOnly = true
}) => {
    const { achievements, loading, error } = useWorkHistory(userId);
    const [selectedType, setSelectedType] = useState<string>('all');

    const filteredAchievements = achievements.filter(achievement => {
        if (showVerifiedOnly && !achievement.verified) return false;
        if (selectedType !== 'all' && achievement.type !== selectedType) return false;
        if (achievement.expiresAt && new Date(achievement.expiresAt) < new Date()) return false;
        return true;
    });

    const types = Array.from(new Set(achievements.map(achievement => achievement.type)));

    const getAchievementIcon = (type: string) => {
        switch (type) {
            case 'milestone': return '🏆';
            case 'badge': return '🎖️';
            case 'certification': return '📜';
            case 'streak': return '🔥';
            default: return '⭐';
        }
    };

    if (loading) {
        return (
            <div className="card-glass p-1">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-center text-gray-600 mt-2">Loading achievements...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card-glass p-1">
                <p className="text-red-600 text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {/* Filter */}
            <div className="flex flex-wrap gap-1">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="input text-sm"
                >
                    <option value="all">All Types</option>
                    {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Achievements Grid */}
            {filteredAchievements.length === 0 ? (
                <div className="card-glass p-1 text-center">
                    <div className="text-4xl mb-1">🏆</div>
                    <h3 className="text-lg font-semibold mb-1">No Achievements</h3>
                    <p className="text-gray-600">No achievements found for the selected filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                    {filteredAchievements.map((achievement) => (
                        <div key={achievement.id} className="card-glass p-1 hover:shadow-lg transition-shadow">
                            <div className="flex items-start space-x-3">
                                {/* Icon */}
                                <div className="text-3xl">
                                    {achievement.iconUrl ? (
                                        <img src={achievement.iconUrl} alt={achievement.title} className="w-8 h-8" />
                                    ) : (
                                        getAchievementIcon(achievement.type)
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1">{achievement.title}</h3>
                                    <p className="text-gray-600 text-sm mb-1">{achievement.description}</p>

                                    {/* Meta Info */}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className="capitalize">{achievement.type}</span>
                                        <span>{new Date(achievement.achievedAt).toLocaleDateString()}</span>
                                    </div>

                                    {/* Value */}
                                    {achievement.value && (
                                        <div className="mt-1">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                Value: {achievement.value}
                                            </span>
                                        </div>
                                    )}

                                    {/* Verification Badge */}
                                    {achievement.verified && (
                                        <div className="mt-1">
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                ✓ Verified
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};