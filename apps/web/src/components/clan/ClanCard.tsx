import React from 'react';
import Link from 'next/link';
import { Clan } from '@/hooks/useClans';

interface ClanCardProps {
    clan: Clan;
    showActions?: boolean;
    onJoin?: (clanId: string) => void;
    onView?: (clanId: string) => void;
    onManage?: (clanId: string) => void;
}

export const ClanCard: React.FC<ClanCardProps> = ({
    clan,
    showActions = true,
    onJoin,
    onView,
    onManage
}) => {
    const getClanIcon = (category: string) => {
        const icons: { [key: string]: string } = {
            'Technology': '💻',
            'Design': '🎨',
            'Content Creation': '📱',
            'Video Production': '🎬',
            'Photography': '📸',
            'Marketing': '📈',
            'Music': '🎵',
            'Gaming': '🎮',
            'Fitness': '💪',
            'Food': '🍳',
            'Travel': '✈️',
            'Fashion': '👗',
            'Beauty': '💄',
            'Education': '📚',
            'Business': '💼',
            'default': '👥'
        };
        return icons[category] || icons.default;
    };

    const getTierColor = (reputationScore: number) => {
        if (reputationScore >= 900) return 'text-purple-600 bg-purple-100';
        if (reputationScore >= 800) return 'text-yellow-600 bg-yellow-100';
        if (reputationScore >= 700) return 'text-gray-600 bg-gray-100';
        if (reputationScore >= 600) return 'text-orange-600 bg-orange-100';
        return 'text-gray-600 bg-gray-100';
    };

    const getTierName = (reputationScore: number) => {
        if (reputationScore >= 900) return 'Diamond';
        if (reputationScore >= 800) return 'Platinum';
        if (reputationScore >= 700) return 'Gold';
        if (reputationScore >= 600) return 'Silver';
        return 'Bronze';
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
        return `$${amount?.toLocaleString()}`;
    };

    return (
        <div className="card-glass hover:bg-brand-light-blue/5 p-2 transition-all duration-200 h-80 flex flex-col">
            <div className="mb-2 flex items-start space-x-2">
                <div className="from-brand-primary/20 to-brand-light-blue/20 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br">
                    <span className="text-2xl">
                        {getClanIcon(clan.primaryCategory || 'default')}
                    </span>
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-heading mb-1 text-lg font-semibold">
                                {clan.name}
                            </h3>
                            <div className="text-muted flex items-center space-x-4 text-sm">
                                <span>{clan.memberCount} members</span>
                                <span>⭐ {clan.averageRating.toFixed(1)}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(clan.reputationScore)}`}>
                                    {getTierName(clan.reputationScore)} Tier
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            {clan.isVerified && (
                                <span className="bg-success/10 text-success mb-2 rounded-none px-2 py-1 text-xs font-medium">
                                    ✓ Verified
                                </span>
                            )}
                            <span className="text-muted text-xs">
                                {clan.totalGigs} active gigs
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                {clan.tagline && (
                    <p className="text-muted mb-2 text-sm italic">
                        {clan.tagline}
                    </p>
                )}

                {clan.description && (
                    <p className="text-muted mb-3 text-sm overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                    }}>
                        {clan.description}
                    </p>
                )}

                {/* Skills */}
                {clan.skills && clan.skills.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {clan.skills.slice(0, 3).map((skill) => (
                            <span
                                key={skill}
                                className="bg-brand-soft border-brand-border text-body rounded-none border px-2 py-1 text-xs"
                            >
                                {skill}
                            </span>
                        ))}
                        {clan.skills.length > 3 && (
                            <span className="text-muted rounded-none px-2 py-1 text-xs">
                                +{clan.skills.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Categories */}
                {clan.categories && clan.categories.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {clan.categories.slice(0, 2).map((category) => (
                            <span
                                key={category}
                                className="bg-brand-primary/10 text-brand-primary rounded-none px-2 py-1 text-xs"
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats */}
                <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                        <div className="text-muted">Revenue</div>
                        <div className="font-semibold">{formatCurrency(clan.totalRevenue)}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-muted">Success Rate</div>
                        <div className="font-semibold">
                            {clan.totalGigs > 0 ? Math.round((clan.completedGigs / clan.totalGigs) * 100) : 0}%
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-muted">Score</div>
                        <div className="font-semibold">{clan.reputationScore}</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-3">
                    {clan.location && (
                        <span className="text-muted text-xs">📍 {clan.location}</span>
                    )}
                    <span className="text-muted text-xs">
                        Created {new Date(clan.createdAt).toLocaleDateString()}
                    </span>
                </div>
                {showActions && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onView?.(clan.id)}
                            className="btn-ghost px-4 py-2 text-sm"
                        >
                            View Details
                        </button>
                        {onJoin && (
                            <button
                                onClick={() => onJoin(clan.id)}
                                className="btn-primary px-4 py-2 text-sm"
                            >
                                Request to Join
                            </button>
                        )}
                        {onManage && (
                            <button
                                onClick={() => onManage(clan.id)}
                                className="btn-secondary px-4 py-2 text-sm"
                            >
                                Manage
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}; 