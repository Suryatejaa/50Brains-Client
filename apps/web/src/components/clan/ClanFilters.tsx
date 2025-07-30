import React from 'react';
import { ClanFilters as ClanFiltersType } from '@/hooks/useClans';

interface ClanFiltersProps {
    filters: ClanFiltersType;
    onFiltersChange: (filters: Partial<ClanFiltersType>) => void;
    onSearch: (query: string) => void;
    searchQuery: string;
}

export const ClanFilters: React.FC<ClanFiltersProps> = ({
    filters,
    onFiltersChange,
    onSearch,
    searchQuery
}) => {
    const categories = [
        'All Categories',
        'Technology',
        'Design',
        'Content Creation',
        'Video Production',
        'Photography',
        'Marketing',
        'Music',
        'Gaming',
        'Fitness',
        'Food',
        'Travel',
        'Fashion',
        'Beauty',
        'Education',
        'Business'
    ];

    const sortOptions = [
        { value: 'score', label: 'Score' },
        { value: 'name', label: 'Name' },
        { value: 'reputationScore', label: 'Reputation' },
        { value: 'totalGigs', label: 'Total Gigs' },
        { value: 'averageRating', label: 'Rating' },
        { value: 'createdAt', label: 'Recently Created' }
    ];

    const visibilityOptions = [
        { value: '', label: 'All Visibility' },
        { value: 'PUBLIC', label: 'Public' },
        { value: 'PRIVATE', label: 'Private' },
        { value: 'INVITE_ONLY', label: 'Invite Only' }
    ];

    return (
        <div className="card-glass p-4 mb-6">
            <div className="flex flex-col lg:flex-row md:flex-row gap-2 items-start justify-between">
                <div className="flex flex-col lg:flex-row md:flex-row gap-2 items-left justify-between w-full">
                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search clans..."
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
                            className="input w-full lg:w-64 md:w-64"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex-1">
                        <select
                            value={filters.category || ''}
                            onChange={(e) => onFiltersChange({ category: e.target.value || undefined })}
                            className="input w-auto"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category === 'All Categories' ? '' : category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Visibility Filter */}
                    <div className="flex-1">
                        <select
                            value={filters.visibility || ''}
                            onChange={(e) => onFiltersChange({ visibility: e.target.value as any || undefined })}
                            className="input w-auto"
                        >
                            {visibilityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div className="flex-1">
                        <select
                            value={filters.sortBy || 'score'}
                            onChange={(e) => onFiltersChange({ sortBy: e.target.value as any })}
                            className="input w-auto"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div className="flex-1">
                        <select
                            value={filters.order || 'desc'}
                            onChange={(e) => onFiltersChange({ order: e.target.value as any })}
                            className="input w-auto"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>

                    {/* Verified Only */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="verifiedOnly"
                            checked={filters.isVerified || false}
                            onChange={(e) => onFiltersChange({ isVerified: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="verifiedOnly" className="text-sm text-muted">
                            Verified Only
                        </label>
                    </div>
                </div>
            </div>

            {/* Additional Filters */}
            <div className="mt-4 flex flex-wrap gap-4">
                {/* Member Count Range */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Members:</span>
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.minMembers || ''}
                        onChange={(e) => onFiltersChange({ minMembers: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="input w-20"
                    />
                    <span className="text-sm text-muted">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxMembers || ''}
                        onChange={(e) => onFiltersChange({ maxMembers: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="input w-20"
                    />
                </div>

                {/* Location */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Location:</span>
                    <input
                        type="text"
                        placeholder="City, Country"
                        value={filters.location || ''}
                        onChange={(e) => onFiltersChange({ location: e.target.value || undefined })}
                        className="input w-32"
                    />
                </div>

                {/* Clear Filters */}
                <button
                    onClick={() => {
                        onFiltersChange({});
                        onSearch('');
                    }}
                    className="btn-ghost text-sm"
                >
                    Clear Filters
                </button>
            </div>
        </div>
    );
}; 