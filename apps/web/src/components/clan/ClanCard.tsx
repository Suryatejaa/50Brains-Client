import React, { useMemo } from 'react';
import Link from 'next/link';
import { Clan } from '@/hooks/useClans';
import { useAuth } from '@/hooks/useAuth';

interface ClanCardProps {
    clan: Clan;
    showActions?: boolean;
    onJoin?: (clanId: string) => void;
    onView?: (clanId: string) => void;
    onManage?: (clanId: string) => void;
    onLeave?: (clanId: string) => void;
    pendingRequestsCount?: number;
}

export const ClanCard: React.FC<ClanCardProps> = ({
    clan,
    showActions = true,
    onJoin,
    onView,
    onManage,
    onLeave,
    pendingRequestsCount = 0
}) => {
    const { user } = useAuth();
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

    const canJoin = useMemo(() => {
        const userId = user?.id ?? '';
        return (
            !!userId &&
            !clan.memberIds?.includes(userId) &&
            !clan.pendingJoinUserIds?.includes(userId)
        );
    }, [clan, user?.id]);

    return (
        <div className="card-glass hover:bg-brand-light-blue/5 p-2 transition-all duration-200 h-auto flex flex-col"
            onClick={() => onView?.(clan.id)}
        >
            <div className="mb-2 flex items-start space-x-2">
                <div className="from-brand-primary/20 to-brand-light-blue/20 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br">
                    <span className="text-2xl">
                        {getClanIcon(clan.primaryCategory || 'default')}
                    </span>
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="flex flex-row items-center text-heading mb-1 text-lg font-semibold">
                                {clan.name}
                            </h3>
                            {/* Pending Applications Badge */}
                            {pendingRequestsCount > 0 && (
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                        <span className="inline-block mr-1 h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
                                        {pendingRequestsCount} pending application{pendingRequestsCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                            <div className="text-muted flex items-center space-x-4 text-sm">
                                <span>{clan.memberCount || clan._count?.members || 0} members</span>
                                {/* <span>⭐ {clan.averageRating?.toFixed(1) || '0.0'}</span> */}
                                {/* <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(clan.reputationScore || 0)}`}>
                                    {getTierName(clan.reputationScore || 0)} Tier
                                </span> */}
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            {clan.isVerified && (
                                <span className="bg-success/10 text-success mb-2 rounded-none px-2 py-1 text-xs font-medium">
                                    ✓ Verified
                                </span>
                            )}
                            <span className="text-muted text-xs">
                                Created {new Date(clan.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                {clan.tagline && (
                    <p className="text-muted mb-1 text-sm italic">
                        {clan.tagline}
                    </p>
                )}

                {clan.description && (
                    <p className="text-muted mb-1 text-sm overflow-hidden" style={{
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
                    <div className="flex flex-wrap gap-2">
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

            </div>

            {/* Footer */}
            {/* <div className="grid grid-cols-1 items-start justify-start">
                {showActions && (
                    <div className="flex space-x-1 mt-2">
                        {onJoin && canJoin && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onJoin(clan.id);
                                }}
                                className="btn-primary px-2 py-1 text-sm"
                            >
                                Request to Join
                            </button>
                        )}
                        {onLeave && clan.memberIds?.includes(user?.id || '') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLeave(clan.id);
                                }}
                                className="btn-secondary px-2 py-1 text-sm"
                            >
                                Leave Clan
                            </button>
                        )}
                        {onManage && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onManage(clan.id);
                                }}
                                className="btn-primary px-2 py-1 text-sm"
                            >
                                Manage
                            </button>
                        )}
                    </div>
                )}
                {user?.id && clan.pendingJoinUserIds?.includes(user.id) && (
                    <div className="text-muted text-xs mt-2">
                        You have requested to join this clan, please wait for approval.
                    </div>
                )}
                {user?.id && clan.memberIds?.includes(user.id) && (
                    <div className="text-muted text-xs mt-2">
                        You are a member of this clan.
                    </div>
                )}
                {user?.id === clan.headId && (
                    <div className="text-muted text-xs mt-2">
                        You are the owner of this clan.
                    </div>
                )}
            </div> */}
        </div>
    );
}; 