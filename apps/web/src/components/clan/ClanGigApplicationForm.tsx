// components/clan/ClanGigApplicationForm.tsx
import React, { useState, useEffect } from 'react';
import { useGigApplication } from '@/hooks/useGigApplication';
import { useGigs } from '@/hooks/useGigs';
import type {
    TeamPlan,
    MilestonePlan,
    PayoutSplit,
    TeamMember,
    Gig,
    GigFilters
} from '@/types/gig.types';
import type { ClanMember } from '@/types/clan.types';
import { apiClient } from '@/lib/api-client';

interface ClanGigApplicationFormProps {
    gigId?: string; // Made optional since we'll select it in the form
    clanId: string;
    clanSlug?: string;
    clanMembers: ClanMember[];
    onSubmit: (application: any) => void;
    onCancel?: () => void;
}

export const ClanGigApplicationForm: React.FC<ClanGigApplicationFormProps> = ({
    gigId: initialGigId,
    clanId,
    clanSlug,
    clanMembers,
    onSubmit,
    onCancel,
}) => {
    // Log the props received
    console.log('🎯 ClanGigApplicationForm: Props received:', {
        initialGigId,
        clanId,
        clanSlug: clanSlug || 'NOT_PROVIDED',
        clanMembersCount: clanMembers?.length || 0
    });
    const { applyToGig, loading, error } = useGigApplication();
    const { gigs, loading: gigsLoading, loadPublicGigs, searchGigs } = useGigs();

    // Log the useGigs hook state
    console.log('🎣 useGigs hook state:', {
        gigsCount: gigs?.length || 0,
        gigsLoading,
        loadPublicGigs: typeof loadPublicGigs,
        searchGigs: typeof searchGigs,
        gigs: gigs?.slice(0, 2) || [] // Show first 2 gigs for debugging
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedGigId, setSelectedGigId] = useState<string>(initialGigId || '');
    const [teamPlan, setTeamPlan] = useState<TeamPlan>({
        members: [],
        roles: [],
        estimatedTotalHours: 0,
    });
    const [milestonePlan, setMilestonePlan] = useState<MilestonePlan[]>([]);
    const [payoutSplit, setPayoutSplit] = useState<PayoutSplit>({
        type: 'percentage',
        distribution: {},
    });

    // Basic application fields
    const [proposal, setProposal] = useState('');
    const [quotedPrice, setQuotedPrice] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState('');
    const [portfolio, setPortfolio] = useState<string[]>([]);

    // Gig search and filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [gigFilters, setGigFilters] = useState<GigFilters>({
        category: [],
        experienceLevel: '',
        budgetType: 'fixed',
        budgetMin: undefined,
        budgetMax: undefined,
        location: '',
        sortBy: 'recent',
        page: 1,
        limit: 50, // Higher limit for better selection
    });

    const [userMap, setUserMap] = useState<Record<string, { username?: string; firstName?: string; lastName?: string; roles?: string[] }>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load available gigs on component mount
    useEffect(() => {
        console.log('🔄 ClanGigApplicationForm: Loading gigs on mount...');
        console.log('📋 Current filters:', gigFilters);
        console.log('🔗 loadPublicGigs function:', typeof loadPublicGigs);
        loadPublicGigs(gigFilters).then(() => {
            console.log('✅ Gigs loaded successfully');
        }).catch((error) => {
            console.error('❌ Error loading gigs:', error);
        });
    }, [loadPublicGigs, gigFilters]);

    // Load user profiles
    React.useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const unique = new Set<string>();
                clanMembers.forEach(m => unique.add(m.userId));
                const ids = Array.from(unique);
                if (ids.length === 0) return;
                const res = await apiClient.post('/api/public/profiles/internal/by-ids',
                    { userIds: ids }
                );
                console.log('res', res);
                if ((res as any)?.success && (res as any)?.data) {
                    const profiles = (res as any).data as Array<{ id: string; username?: string; firstName?: string; lastName?: string; roles?: string[] }>;
                    const map: Record<string, { username?: string; firstName?: string; lastName?: string; roles?: string[] }> = {};
                    profiles.forEach(p => { map[p.id] = { username: (p as any).username, firstName: (p as any).firstName, lastName: (p as any).lastName, roles: (p as any).roles || [] }; });
                    setUserMap(map);
                }
            } catch (e) {
                // silent fail; fallback to existing clanMembers user object
            }
        };
        fetchProfiles();
    }, [clanMembers]);

    const steps = [
        { id: 1, title: 'Select Gig', component: GigSelectionStep },
        { id: 2, title: 'Application Details', component: ApplicationDetailsStep },
        { id: 3, title: 'Team Plan', component: TeamPlanStep },
        { id: 4, title: 'Milestone Plan', component: MilestoneStep },
        { id: 5, title: 'Payout Split', component: PayoutSplitStep },
        { id: 6, title: 'Review & Submit', component: ReviewStep },
    ];

    const handleStepComplete = (stepData: any) => {
        if (stepData.selectedGigId) setSelectedGigId(stepData.selectedGigId);
        if (stepData.proposal) setProposal(stepData.proposal);
        if (stepData.quotedPrice !== undefined) setQuotedPrice(stepData.quotedPrice);
        if (stepData.estimatedTime) setEstimatedTime(stepData.estimatedTime);
        if (stepData.portfolio) setPortfolio(stepData.portfolio);
        if (stepData.teamPlan) setTeamPlan(stepData.teamPlan);
        if (stepData.milestonePlan) setMilestonePlan(stepData.milestonePlan);
        if (stepData.payoutSplit) setPayoutSplit(stepData.payoutSplit);

        setCurrentStep(prev => prev + 1);
    };

    const handleSubmit = async (finalData: any) => {
        if (!selectedGigId) {
            console.error('No gig selected');
            return;
        }

        setIsSubmitting(true);

        // Final validation: check if quoted price exceeds gig budget
        const selectedGig = gigs.find(gig => gig.id === selectedGigId);
        if (selectedGig && quotedPrice > (selectedGig.budgetMax || 0)) {
            console.error('Quoted price exceeds gig budget');
            setIsSubmitting(false);
            return;
        }

        try {
            // Validate required fields for clan application
            if (!teamPlan.members || teamPlan.members.length === 0) {
                console.error('❌ Clan application requires at least one team member');
                setIsSubmitting(false);
                return;
            }

            if (!milestonePlan || milestonePlan.length === 0) {
                console.error('❌ Clan application requires at least one milestone');
                setIsSubmitting(false);
                return;
            }

            // Validate milestone dates
            const invalidMilestones = milestonePlan.filter(milestone => {
                if (!milestone.dueAt || milestone.dueAt.trim() === '') {
                    return true;
                }
                const date = new Date(milestone.dueAt);
                return isNaN(date.getTime());
            });

            if (invalidMilestones.length > 0) {
                console.error('❌ Some milestones have invalid dates:', invalidMilestones);
                setIsSubmitting(false);
                return;
            }

            // Validate that total milestone amount doesn't exceed quoted price
            const totalMilestoneAmount = milestonePlan.reduce((sum, milestone) => sum + milestone.amount, 0);
            if (totalMilestoneAmount > quotedPrice) {
                console.error(`❌ Total milestone amount (₹${totalMilestoneAmount}) exceeds quoted price (₹${quotedPrice})`);
                setIsSubmitting(false);
                return;
            }

            // Validate payout split has at least one distribution
            if (!payoutSplit.distribution || Object.keys(payoutSplit.distribution).length === 0) {
                console.error('❌ Payout split must have at least one member with a distribution');
                setIsSubmitting(false);
                return;
            }

            // Validate that all team members have valid data
            const invalidTeamMembers = teamPlan.members?.filter(member =>
                !member.userId ||
                !member.role ||
                member.expectedHours <= 0 ||
                !member.deliverables ||
                member.deliverables.length === 0 ||
                member.deliverables.every(d => !d.trim())
            ) || [];

            if (invalidTeamMembers.length > 0) {
                console.error('❌ Some team members have incomplete information:', invalidTeamMembers);
                setIsSubmitting(false);
                return;
            }

            // Transform the data to match server schema
            const transformedTeamPlan = teamPlan.members?.map(member => ({
                role: member.role,
                memberId: member.userId, // TeamMember has userId, not memberId
                hours: member.expectedHours, // TeamMember has expectedHours, not hours
                deliverables: member.deliverables || []
            })) || [];

            const transformedMilestonePlan = milestonePlan.map(milestone => {
                // Validate and format the due date
                let formattedDueAt: string;
                try {
                    if (!milestone.dueAt || milestone.dueAt.trim() === '') {
                        throw new Error('Due date is required');
                    }
                    const date = new Date(milestone.dueAt);
                    if (isNaN(date.getTime())) {
                        throw new Error('Invalid date format');
                    }
                    formattedDueAt = date.toISOString();
                } catch (error) {
                    console.error('❌ Invalid milestone date:', milestone.dueAt, error);
                    // Use a fallback date (1 month from now) or skip this milestone
                    const fallbackDate = new Date();
                    fallbackDate.setMonth(fallbackDate.getMonth() + 1);
                    formattedDueAt = fallbackDate.toISOString();
                }

                return {
                    title: milestone.title,
                    dueAt: formattedDueAt,
                    amount: milestone.amount,
                    deliverables: milestone.deliverables || []
                };
            });

            const transformedPayoutSplit = Object.entries(payoutSplit.distribution).map(([memberId, value]) => {
                if (payoutSplit.type === 'percentage') {
                    return {
                        memberId,
                        percentage: value
                    };
                } else {
                    return {
                        memberId,
                        fixedAmount: value
                    };
                }
            });

            const applicationData: any = {
                applicantType: 'clan',
                clanId,
                proposal,
                portfolio,
                quotedPrice,
                estimatedTime,
                teamPlan: transformedTeamPlan,
                milestonePlan: transformedMilestonePlan,
                payoutSplit: transformedPayoutSplit,
            };



            // Only add clanSlug if it has a value
            if (clanSlug && clanSlug.trim()) {
                applicationData.clanSlug = clanSlug;
            } else {
                // Try to construct a fallback slug from clanId if possible
                // This is a temporary fix until we ensure clanSlug is always provided
                const fallbackSlug = `clan-${clanId}`;
                applicationData.clanSlug = fallbackSlug;
                console.warn(`⚠️ ClanGigApplicationForm: clanSlug not provided, using fallback: ${fallbackSlug}`);
            }

            // Log the application data being sent
            console.log('📤 ClanGigApplicationForm: Sending application data:', {
                selectedGigId,
                clanId,
                clanSlug: clanSlug || 'NOT_PROVIDED',
                hasClanSlug: !!(clanSlug && clanSlug.trim()),
                transformedTeamPlan,
                transformedMilestonePlan,
                transformedPayoutSplit,
                applicationData
            });

            const application = await applyToGig(selectedGigId, applicationData);
            console.log('🎯 ClanGigApplicationForm: Application:', application);

            if (application) {
                setIsSubmitted(true);
                setIsSubmitting(false);

                // Call the parent's onSubmit callback
                onSubmit(application);

                // Auto-close after a short delay
                setTimeout(() => {
                    if (onCancel) {
                        onCancel();
                    }
                }, 2000); // Close after 2 seconds
            }
        } catch (error) {
            console.error('Application failed:', error);
            setIsSubmitting(false);

            // Show error message
            if (typeof window !== 'undefined') {
                alert('❌ Application failed. Please check the console for details.');
            }
        }
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const StepComponent = steps[currentStep - 1].component;

    // Add logging for debugging
    console.log('🎯 ClanGigApplicationForm: Main component state:', {
        currentStep,
        gigsCount: gigs.length,
        gigsLoading,
        selectedGigId,
        gigs: gigs.slice(0, 3).map(g => ({ id: g.id, title: g.title })) // Show first 3 gigs
    });

    // Show success message if submitted
    if (isSubmitted) {
        return (
            <div className="max-w-4xl mx-auto px-2 py-3 md:p-6 text-center">
                <div className="bg-green-50 border border-green-200 rounded-md p-8">
                    <div className="text-green-500 text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted Successfully!</h2>
                    <p className="text-green-700 mb-4">Your clan application has been sent to the brand.</p>
                    <p className="text-sm text-green-600">This form will close automatically in a few seconds...</p>
                </div>
            </div>
        );
    }

    // Show loading state if submitting
    if (isSubmitting) {
        return (
            <div className="max-w-4xl mx-auto px-2 py-3 md:p-6 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-8">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4"></div>
                    <h2 className="text-xl font-semibold text-blue-800 mb-2">Submitting Application...</h2>
                    <p className="text-blue-700">Please wait while we submit your application.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-2 py-3 md:p-6">
            <h1 className="text-xl md:text-3xl font-bold mb-3 md:mb-8">Apply to Gig as Clan</h1>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-4 md:mb-8">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${currentStep > step.id ? 'bg-green-500 text-white' :
                            currentStep === step.id ? 'bg-blue-500 text-white' :
                                'bg-gray-300 text-gray-600'
                            }`}>
                            <span className="text-[10px] md:text-sm">{currentStep > step.id ? '✓' : step.id}</span>
                        </div>
                        <span className="ml-2 text-xs md:text-sm font-medium whitespace-nowrap">{step.title}</span>
                        {index < steps.length - 1 && (
                            <div className="w-8 md:w-16 h-0.5 bg-gray-300 mx-2 md:mx-3" />
                        )}
                    </div>
                ))}
            </div>

            {/* Current Step Component */}
            <StepComponent
                data={{
                    selectedGigId,
                    proposal,
                    quotedPrice,
                    estimatedTime,
                    portfolio,
                    teamPlan,
                    milestonePlan,
                    payoutSplit,
                    userMap
                }}
                onComplete={handleStepComplete}
                onSubmit={handleSubmit}
                clanMembers={clanMembers}
                onStepChange={goToStep}
                gigs={gigs}
                gigsLoading={gigsLoading}
                loadPublicGigs={loadPublicGigs}
                searchGigs={searchGigs}
                selectedGig={gigs.find(gig => gig.id === selectedGigId)}
            />

            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
                    <h4 className="font-bold mb-2">🔍 Debug Info:</h4>
                    <p>Current Step: {currentStep}</p>
                    <p>Total Gigs: {gigs.length}</p>
                    <p>Clan-Allowed Gigs: {gigs.filter(gig => gig.isClanAllowed !== false).length}</p>
                    <p>Filtered Out: {gigs.filter(gig => gig.isClanAllowed === false).length}</p>
                    <p>Gigs Loading: {gigsLoading ? 'Yes' : 'No'}</p>
                    <p>Selected Gig ID: {selectedGigId || 'None'}</p>
                    <p>Step Component: {steps[currentStep - 1]?.component?.name || 'Unknown'}</p>
                </div>
            )}

            {error && (
                <div className="mt-3 md:mt-4 p-2.5 md:p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

// Step Components
const GigSelectionStep: React.FC<{
    data: any;
    onComplete: (data: any) => void;
    onStepChange: (step: number) => void;
    gigs: Gig[];
    gigsLoading: boolean;
    loadPublicGigs: (filters?: GigFilters) => Promise<any>;
    searchGigs: (query: string, filters?: GigFilters) => Promise<any>;
}> = ({ data, onComplete, onStepChange, gigs, gigsLoading, loadPublicGigs, searchGigs }) => {
    const [selectedGigId, setSelectedGigId] = useState<string>(data.selectedGigId || '');

    // Local state for search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [gigFilters, setGigFilters] = useState<GigFilters>({
        category: [],
        experienceLevel: '',
        budgetType: 'fixed',
        budgetMin: undefined,
        budgetMax: undefined,
        location: '',
        sortBy: 'recent',
        page: 1,
        limit: 50,
    });

    const handleNext = () => {
        if (!selectedGigId) return;
        console.log('🚀 GigSelectionStep: Proceeding with gig ID:', selectedGigId);
        onComplete({ selectedGigId });
    };

    const selectedGig = gigs.find(gig => gig.id === selectedGigId);

    // Add logging for debugging
    const clanAllowedGigs = gigs.filter(gig => gig.isClanAllowed !== false);
    console.log('🔍 GigSelectionStep: Current state:', {
        totalGigsCount: gigs.length,
        clanAllowedGigsCount: clanAllowedGigs.length,
        filteredOutCount: gigs.length - clanAllowedGigs.length,
        gigsLoading,
        selectedGigId,
        selectedGig: selectedGig ? { id: selectedGig.id, title: selectedGig.title } : null,
        searchQuery,
        gigFilters
    });

    return (
        <div className="space-y-3 md:space-y-6">
            <h2 className="text-lg md:text-2xl font-semibold">Select Gig to Apply For</h2>

            {/* Clan Application Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-sm text-blue-800">
                    ℹ️ Only gigs that allow clan applications will be shown. Individual gigs are filtered out.
                </p>
            </div>

            {/* Navigation Hint */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                <p className="text-sm text-gray-600">
                    💡 You can go back to any previous step to modify your selections at any time.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Gigs
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, description, or skills..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button
                            onClick={() => {
                                console.log('🔍 GigSelectionStep: Searching gigs with query:', searchQuery, 'filters:', gigFilters);
                                searchGigs(searchQuery, gigFilters).then(() => {
                                    console.log('✅ Search completed successfully');
                                }).catch((error) => {
                                    console.error('❌ Search error:', error);
                                });
                            }}
                            disabled={gigsLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                            {gigsLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Budget Type
                        </label>
                        <select
                            value={gigFilters.budgetType}
                            onChange={(e) => setGigFilters(prev => ({ ...prev, budgetType: e.target.value as "fixed" | "hourly" | "negotiable" }))}
                            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="fixed">Fixed</option>
                            <option value="hourly">Hourly</option>
                            <option value="negotiable">Negotiable</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort By
                        </label>
                        <select
                            value={gigFilters.sortBy}
                            onChange={(e) => setGigFilters(prev => ({ ...prev, sortBy: e.target.value as "recent" | "budget_high" | "budget_low" | "deadline" }))}
                            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="budget_high">Highest Budget</option>
                            <option value="budget_low">Lowest Budget</option>
                            <option value="deadline">Deadline</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => {
                        console.log('🔄 GigSelectionStep: Refreshing gigs with filters:', gigFilters);
                        loadPublicGigs(gigFilters).then(() => {
                            console.log('✅ Refresh completed successfully');
                        }).catch((error) => {
                            console.error('❌ Refresh error:', error);
                        });
                    }}
                    disabled={gigsLoading}
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
                >
                    {gigsLoading ? 'Loading...' : 'Refresh Gigs'}
                </button>
            </div>

            {/* Gig Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a Gig * ({gigs.filter(gig => gig.isClanAllowed !== false).length} available)
                </label>
                {gigsLoading ? (
                    <div className="text-center py-4">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading available gigs...</p>
                    </div>
                ) : gigs.filter(gig => gig.isClanAllowed !== false).length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        <p>No gigs available for clan applications. Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <select
                        value={selectedGigId}
                        onChange={(e) => setSelectedGigId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                    >
                        <option value="">Select a gig</option>
                        {gigs
                            .filter(gig => gig.isClanAllowed !== false)
                            .map((gig: Gig) => (
                                <option key={gig.id} value={gig.id}>
                                    {gig.title} - Budget: ₹{gig.budgetMin?.toLocaleString()}{gig.budgetMax && gig.budgetMax !== gig.budgetMin ? ` - ₹${gig.budgetMax?.toLocaleString()}` : ''} ({gig.budgetType})
                                </option>
                            ))}
                    </select>
                )}
            </div>

            {selectedGig && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Selected Gig Details</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Title:</span> {selectedGig.title}</p>
                        <p><span className="font-medium">Description:</span> {selectedGig.description?.substring(0, 100)}...</p>
                        <p><span className="font-medium">Budget:</span> ₹{selectedGig.budgetMin?.toLocaleString()}{selectedGig.budgetMax && selectedGig.budgetMax !== selectedGig.budgetMin ? ` - ₹${selectedGig.budgetMax?.toLocaleString()}` : ''} ({selectedGig.budgetType})</p>
                        {selectedGig.location && (
                            <p><span className="font-medium">Location:</span> {selectedGig.location}</p>
                        )}
                        {selectedGig.experienceLevel && (
                            <p><span className="font-medium">Experience Level:</span> {selectedGig.experienceLevel}</p>
                        )}
                        {selectedGig.skillsRequired && selectedGig.skillsRequired.length > 0 && (
                            <p><span className="font-medium">Skills:</span> {selectedGig.skillsRequired.slice(0, 3).join(', ')}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-between gap-2">
                <button
                    onClick={() => onStepChange(1)}
                    className="w-full md:w-auto px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 text-sm md:text-base"
                >
                    ← Back to Gig Selection
                </button>
                <button
                    onClick={handleNext}
                    disabled={!selectedGigId}
                    className="w-full md:w-auto px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                    Next: Application Details
                </button>
            </div>
        </div>
    );
};

const ApplicationDetailsStep: React.FC<{
    data: any;
    onComplete: (data: any) => void;
    onStepChange: (step: number) => void;
    clanMembers: ClanMember[];
    selectedGig?: Gig;
}> = ({ data, onComplete, onStepChange, clanMembers, selectedGig }) => {
    const [proposal, setProposal] = useState(data.proposal || '');
    const [quotedPrice, setQuotedPrice] = useState(data.quotedPrice || 0);
    const [estimatedTime, setEstimatedTime] = useState(data.estimatedTime || '');
    const [portfolio, setPortfolio] = useState<string[]>(data.portfolio || []);

    const addPortfolioItem = () => {
        setPortfolio([...portfolio, '']);
    };

    const removePortfolioItem = (index: number) => {
        setPortfolio(portfolio.filter((_, i) => i !== index));
    };

    const updatePortfolioItem = (index: number, value: string) => {
        const newPortfolio = [...portfolio];
        newPortfolio[index] = value;
        setPortfolio(newPortfolio);
    };

    const handleNext = () => {
        // Validate quoted price against gig budget
        if (selectedGig && quotedPrice > (selectedGig.budgetMax || 0)) {
            return; // Don't proceed if validation fails
        }

        onComplete({
            proposal,
            quotedPrice,
            estimatedTime,
            portfolio: portfolio.filter(item => item.trim() !== ''),
        });
    };

    // Calculate max allowed price
    const maxAllowedPrice = selectedGig?.budgetMax || 0;
    const isPriceValid = !selectedGig || quotedPrice <= maxAllowedPrice;

    return (
        <div className="space-y-3 md:space-y-6">
            <h2 className="text-lg md:text-2xl font-semibold">Application Details</h2>

            {/* Proposal */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposal *
                </label>
                <textarea
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your approach, experience, and why you're the best fit for this gig..."
                    required
                />
            </div>

            {/* Quoted Price */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quoted Price (₹) *
                    {selectedGig && (
                        <span className="text-sm text-gray-500 ml-2">
                            (Max: ₹{selectedGig.budgetMax?.toLocaleString() || 'Unlimited'})
                        </span>
                    )}
                </label>
                <input
                    type="number"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isPriceValid ? 'border-gray-300' : 'border-red-500'
                        }`}
                    placeholder="0"
                    min="0"
                    max={maxAllowedPrice || undefined}
                    step="0.01"
                    required
                />
                {!isPriceValid && (
                    <p className="mt-1 text-sm text-red-600">
                        ❌ Quoted price cannot exceed the gig's maximum budget of ₹{maxAllowedPrice.toLocaleString()}
                    </p>
                )}
                {selectedGig && (
                    <p className="mt-1 text-sm text-gray-500">
                        💡 Gig budget: ₹{selectedGig.budgetMin?.toLocaleString() || 0} - ₹{selectedGig.budgetMax?.toLocaleString() || 'Unlimited'}
                    </p>
                )}
            </div>

            {/* Estimated Time */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time *
                </label>
                <select
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                >
                    <option value="">Select estimated time</option>
                    <option value="1-3 days">1-3 days</option>
                    <option value="4-7 days">4-7 days</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="2-4 weeks">2-4 weeks</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="2+ months">2+ months</option>
                </select>
            </div>

            {/* Portfolio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Items
                </label>
                <div className="space-y-2">
                    {portfolio.map((item, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => updatePortfolioItem(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Portfolio item (URL or description)"
                            />
                            <button
                                onClick={() => removePortfolioItem(index)}
                                className="px-3 py-2 text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addPortfolioItem}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        + Add Portfolio Item
                    </button>
                </div>
            </div>

            <div className="flex justify-between gap-2">
                <button
                    onClick={() => onStepChange(1)}
                    className="w-full md:w-auto px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 text-sm md:text-base"
                >
                    ← Back to Gig Selection
                </button>
                <button
                    onClick={handleNext}
                    disabled={!proposal.trim() || quotedPrice <= 0 || !estimatedTime.trim() || !isPriceValid}
                    className="w-full md:w-auto px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                    Next: Team Plan
                </button>
            </div>
        </div>
    );
};

const TeamPlanStep: React.FC<{
    data: any;
    onComplete: (data: any) => void;
    onStepChange: (step: number) => void;
    clanMembers: ClanMember[];
}> = ({ data, onComplete, onStepChange, clanMembers }) => {
    const [members, setMembers] = useState<TeamMember[]>(data.teamPlan?.members || []);
    const [roles, setRoles] = useState<string[]>(data.teamPlan?.roles || []);

    // Debug initial state
    console.log('🔍 TeamPlanStep initial state:', {
        dataTeamPlan: data.teamPlan,
        initialMembers: data.teamPlan?.members || [],
        initialRoles: data.teamPlan?.roles || []
    });

    // Helper function to check if a member is complete
    const isMemberComplete = (member: TeamMember) => {
        const result = member.userId &&
            member.role &&
            member.expectedHours > 0 &&
            member.deliverables &&
            member.deliverables.length > 0 &&
            member.deliverables.some(d => d.trim());

        // Debug logging for incomplete members
        if (!result) {
            console.log('🔍 Member incomplete:', {
                member,
                checks: {
                    hasUserId: !!member.userId,
                    hasRole: !!member.role,
                    hasHours: member.expectedHours > 0,
                    hasDeliverables: !!(member.deliverables && member.deliverables.length > 0),
                    hasNonEmptyDeliverable: member.deliverables && member.deliverables.some(d => d.trim())
                }
            });
        }

        return result;
    };

    const addMember = () => {
        const newMember = {
            userId: '',
            userName: '',
            role: '',
            expectedHours: 0,
            deliverables: ['First deliverable'], // Start with a non-empty deliverable
        };
        console.log('➕ Adding new member:', newMember);
        setMembers([...members, newMember]);
    };

    const removeMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const updateMember = (index: number, field: keyof TeamMember, value: any) => {
        const newMembers = [...members];
        const oldValue = newMembers[index][field];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setMembers(newMembers);

        console.log(`🔄 Updated member ${index}.${field}:`, {
            from: oldValue,
            to: value,
            member: newMembers[index]
        });
    };

    const handleNext = () => {
        // Validate that all members have required fields
        const invalidMembers = members.filter(member =>
            !member.userId ||
            !member.role ||
            member.expectedHours <= 0 ||
            !member.deliverables ||
            member.deliverables.length === 0 ||
            member.deliverables.every(d => !d.trim())
        );

        if (invalidMembers.length > 0) {
            console.error('❌ Cannot proceed: Some team members have incomplete information:', invalidMembers);
            return;
        }

        // Filter out empty deliverables before sending
        const cleanedMembers = members.map(member => ({
            ...member,
            deliverables: member.deliverables.filter(d => d.trim() !== '')
        }));

        const totalHours = cleanedMembers.reduce((sum, member) => sum + member.expectedHours, 0);
        onComplete({
            teamPlan: {
                members: cleanedMembers,
                roles,
                estimatedTotalHours: totalHours,
            },
        });
    };

    return (
        <div className="space-y-3 md:space-y-6">
            <h2 className="text-lg md:text-2xl font-semibold">Team Plan</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-sm text-blue-800">
                    ℹ️ All team members must have: a selected member, role, expected hours, and at least one deliverable.
                </p>

                {/* Debug Button */}
                {process.env.NODE_ENV === 'development' && (
                    <button
                        onClick={() => {
                            console.log('🔍 Current team members state:', members);
                            members.forEach((member, index) => {
                                console.log(`Member ${index}:`, member);
                                console.log(`Member ${index} complete:`, isMemberComplete(member));
                            });

                            console.log('🔍 Clan members data:', clanMembers);
                            console.log('🔍 User map data:', data.userMap);
                        }}
                        className="mt-2 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                    >
                        Debug: Check Member States
                    </button>
                )}
            </div>

            {/* Roles */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Roles
                </label>
                <div className="flex flex-wrap gap-2">
                    {roles.map((role, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => {
                                    const newRoles = [...roles];
                                    newRoles[index] = e.target.value;
                                    setRoles(newRoles);
                                }}
                                className="px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                                placeholder="Role name"
                            />
                            <button
                                onClick={() => setRoles(roles.filter((_, i) => i !== index))}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => setRoles([...roles, ''])}
                        className="px-2 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:border-gray-400 text-sm"
                    >
                        + Add Role
                    </button>
                </div>
            </div>

            {/* Team Members */}
            <div>
                <div className="flex justify-between items-center mb-3 md:mb-4">
                    <h3 className="text-base md:text-lg font-medium">Team Members</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={addMember}
                            className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base"
                        >
                            Add Member
                        </button>

                        {/* Debug: Add a test member */}
                        {/* {process.env.NODE_ENV === 'development' && (
                            <button
                                onClick={() => {
                                    const testMember = {
                                        userId: 'test-user-id',
                                        userName: 'Test User',
                                        role: 'TEST_ROLE',
                                        expectedHours: 10,
                                        deliverables: ['Test deliverable'],
                                    };
                                    console.log('🧪 Adding test member:', testMember);
                                    setMembers([...members, testMember]);
                                }}
                                className="px-2 py-2 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                            >
                                Add Test Member
                            </button>
                        )} */}
                    </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                    {members.map((member, index) => (
                        <div key={index} className={`border rounded-md md:rounded-lg p-3 md:p-4 shadow-none md:shadow ${isMemberComplete(member)
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                            }`}>
                            {/* Member Status Indicator */}
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${isMemberComplete(member)
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {isMemberComplete(member) ? '✓ Complete' : '⚠ Incomplete'}
                                </span>

                                {/* Debug Info */}
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="text-xs text-gray-500">
                                        <div>userId: {member.userId || 'EMPTY'}</div>
                                        <div>role: {member.role || 'EMPTY'}</div>
                                        <div>hours: {member.expectedHours}</div>
                                        <div>deliverables: {member.deliverables?.length || 0}</div>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Member
                                    </label>
                                    <select
                                        value={member.userName || ''}
                                        onChange={(e) => {
                                            const selectedKey = e.target.value;
                                            console.log('🔍 Member selection changed:', {
                                                selectedKey,
                                                memberIndex: index,
                                                currentMember: member,
                                                clanMembers: clanMembers.map(cm => ({
                                                    userId: cm.userId,
                                                    username: data.userMap?.[cm.userId]?.username || cm.user?.username || cm.userId
                                                }))
                                            });

                                            // Find selected by matching username in userMap or fallback username in clanMembers
                                            const found = clanMembers.find(cm => {
                                                const profile = data.userMap?.[cm.userId];
                                                const u = profile?.username || cm.user?.username || cm.userId;
                                                return u === selectedKey;
                                            });

                                            if (found) {
                                                console.log('✅ Found clan member:', found);
                                                // Update both userId and userName in a single operation to avoid race conditions
                                                const updatedMember = {
                                                    ...member,
                                                    userId: found.userId,
                                                    userName: selectedKey
                                                };

                                                // Update the member directly in the members array
                                                const newMembers = [...members];
                                                newMembers[index] = updatedMember;
                                                setMembers(newMembers);

                                                console.log('✅ Updated member:', {
                                                    index,
                                                    userId: found.userId,
                                                    userName: selectedKey,
                                                    updatedMember
                                                });
                                            } else {
                                                console.error('❌ Could not find clan member for selection:', selectedKey);
                                            }
                                        }}
                                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                                    >
                                        <option value="">Select member</option>
                                        {clanMembers.map((clanMember) => {
                                            const profile = data.userMap?.[clanMember.userId];

                                            const username = profile?.username || clanMember.user?.username || clanMember.userId;
                                            const fullName = (profile?.firstName || profile?.lastName)
                                                ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
                                                : (clanMember.user?.firstName || clanMember.user?.lastName)
                                                    ? `${clanMember.user?.firstName || ''} ${clanMember.user?.lastName || ''}`.trim()
                                                    : undefined;
                                            const optionLabel = fullName ? `${fullName} (${username})` : username;
                                            return (
                                                <option key={clanMember.userId} value={username}>
                                                    {optionLabel}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={member.role}
                                        onChange={(e) => updateMember(index, 'role', e.target.value)}
                                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                                    >
                                        <option value="">Select role</option>
                                        {(() => {
                                            // Resolve profile by userId, or by matching current username selection
                                            let profile = data.userMap?.[member.userId];
                                            if (!profile && member.userName) {
                                                const cm = clanMembers.find(cm => {
                                                    const uname = (data.userMap?.[cm.userId]?.username) || cm.user?.username || cm.userId;
                                                    return uname === member.userName;
                                                });
                                                if (cm) profile = data.userMap?.[cm.userId];
                                            }
                                            const fetchedRoles = (profile?.roles || []).filter((r: string) => (r || '').toUpperCase() !== 'USER');
                                            const availableRoles = Array.from(new Set([...(roles || []), ...fetchedRoles]));
                                            return availableRoles.map((role: string) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ));
                                        })()}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expected Hours
                                    </label>
                                    <input
                                        type="number"
                                        value={member.expectedHours}
                                        onChange={(e) => updateMember(index, 'expectedHours', parseInt(e.target.value) || 0)}
                                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="mb-3 md:mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deliverables
                                </label>
                                {member.deliverables.map((deliverable, dIndex) => (
                                    <div key={dIndex} className="mb-2">
                                        <div className="flex gap-2 mb-1">
                                            <input
                                                type="text"
                                                value={deliverable}
                                                onChange={(e) => {
                                                    const newDeliverables = [...member.deliverables];
                                                    newDeliverables[dIndex] = e.target.value;
                                                    updateMember(index, 'deliverables', newDeliverables);
                                                }}
                                                className={`flex-1 px-2 py-2 border rounded-md text-sm ${deliverable.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Deliverable description"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newDeliverables = member.deliverables.filter((_, i) => i !== dIndex);
                                                    updateMember(index, 'deliverables', newDeliverables);
                                                }}
                                                className="px-3 py-1 text-red-500 hover:text-red-700 text-sm"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        {deliverable.trim() === '' && (
                                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                                                <span>⚠️</span>
                                                <span>Please enter a deliverable description</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newDeliverables = [...member.deliverables, ''];
                                        updateMember(index, 'deliverables', newDeliverables);
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    + Add Deliverable
                                </button>
                            </div>

                            <button
                                onClick={() => removeMember(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove Member
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between gap-2">
                <button
                    onClick={() => onStepChange(2)}
                    className="w-full md:w-auto px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 text-sm md:text-base"
                >
                    ← Back to Application Details
                </button>
                <button
                    onClick={handleNext}
                    disabled={
                        members.length === 0 ||
                        roles.length === 0 ||
                        members.some(member =>
                            !member.userId ||
                            !member.role ||
                            member.expectedHours <= 0 ||
                            !member.deliverables ||
                            member.deliverables.length === 0 ||
                            member.deliverables.every(d => !d.trim())
                        )
                    }
                    className="w-full md:w-auto px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                    Next: Milestone Plan
                </button>
            </div>
        </div>
    );
};

const MilestoneStep: React.FC<{
    data: any;
    onComplete: (data: any) => void;
    onStepChange: (step: number) => void;
}> = ({ data, onComplete, onStepChange }) => {
    const [milestones, setMilestones] = useState<MilestonePlan[]>(data.milestonePlan || []);

    const addMilestone = () => {
        setMilestones([...milestones, {
            title: '',
            description: '',
            dueAt: '',
            amount: 0,
            deliverables: ['First milestone deliverable'], // Start with non-empty deliverable
        }]);
    };

    const removeMilestone = (index: number) => {
        setMilestones(milestones.filter((_, i) => i !== index));
    };

    const updateMilestone = (index: number, field: keyof MilestonePlan, value: any) => {
        const newMilestones = [...milestones];
        newMilestones[index] = { ...newMilestones[index], [field]: value };
        setMilestones(newMilestones);
    };

    const handleNext = () => {
        // Validate that all milestones have valid dates
        const invalidMilestones = milestones.filter(milestone => {
            if (!milestone.dueAt || milestone.dueAt.trim() === '') {
                return true;
            }
            const date = new Date(milestone.dueAt);
            return isNaN(date.getTime()) || date.getTime() < new Date().getTime();
        });

        if (invalidMilestones.length > 0) {
            console.error('❌ Cannot proceed: Some milestones have invalid or past dates');
            return;
        }

        // Validate that total milestone amount doesn't exceed quoted price
        const totalMilestoneAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
        const quotedPrice = data.quotedPrice || 0;

        if (totalMilestoneAmount > quotedPrice) {
            console.error(`❌ Cannot proceed: Total milestone amount (₹${totalMilestoneAmount}) exceeds quoted price (₹${quotedPrice})`);
            return;
        }

        // Filter out empty deliverables before sending
        const cleanedMilestones = milestones.map(milestone => ({
            ...milestone,
            deliverables: milestone.deliverables.filter(d => d.trim() !== '')
        }));

        onComplete({ milestonePlan: cleanedMilestones });
    };

    return (
        <div className="space-y-3 md:space-y-6">
            <h2 className="text-lg md:text-2xl font-semibold">Milestone Plan</h2>

            <div className="flex justify-between items-center mb-3 md:mb-4">
                <div>
                    <p className="text-gray-600 text-sm md:text-base">Define the key milestones and deliverables for this gig</p>
                    {/* Total Amount Display */}
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                            Total Milestone Amount: ₹{milestones.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                            / ₹{(data.quotedPrice || 0).toLocaleString()} (Quoted Price)
                        </span>
                        {milestones.length > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${milestones.reduce((sum, m) => sum + m.amount, 0) > (data.quotedPrice || 0)
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                                }`}>
                                {milestones.reduce((sum, m) => sum + m.amount, 0) > (data.quotedPrice || 0)
                                    ? 'Exceeds Budget'
                                    : 'Within Budget'
                                }
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={addMilestone}
                    className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base"
                >
                    Add Milestone
                </button>
            </div>

            <div className="space-y-3 md:space-y-4">
                {milestones.map((milestone, index) => (
                    <div key={index} className="border border-gray-200 rounded-md md:rounded-lg p-3 md:p-4 shadow-none md:shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={milestone.title}
                                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Milestone title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={milestone.dueAt}
                                    onChange={(e) => updateMilestone(index, 'dueAt', e.target.value)}
                                    className={`w-full px-2 py-2 border rounded-md text-sm ${milestone.dueAt && new Date(milestone.dueAt).getTime() < new Date().getTime()
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                        }`}
                                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                                    required
                                />
                                {milestone.dueAt && new Date(milestone.dueAt).getTime() < new Date().getTime() && (
                                    <p className="mt-1 text-xs text-red-600">
                                        ⚠️ Date cannot be in the past
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mb-3 md:mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={milestone.description}
                                onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                                rows={3}
                                placeholder="Milestone description"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    value={milestone.amount}
                                    onChange={(e) => updateMilestone(index, 'amount', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="mb-3 md:mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deliverables
                            </label>
                            {milestone.deliverables.map((deliverable, dIndex) => (
                                <div key={dIndex} className="mb-2">
                                    <div className="flex gap-2 mb-1">
                                        <input
                                            type="text"
                                            value={deliverable}
                                            onChange={(e) => {
                                                const newDeliverables = [...milestone.deliverables];
                                                newDeliverables[dIndex] = e.target.value;
                                                updateMilestone(index, 'deliverables', newDeliverables);
                                            }}
                                            className={`flex-1 px-2 py-2 border rounded-md text-sm ${deliverable.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            placeholder="Deliverable description"
                                        />
                                        <button
                                            onClick={() => {
                                                const newDeliverables = milestone.deliverables.filter((_, i) => i !== dIndex);
                                                updateMilestone(index, 'deliverables', newDeliverables);
                                            }}
                                            className="px-3 py-1 text-red-500 hover:text-red-700 text-sm"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    {deliverable.trim() === '' && (
                                        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                                            <span>⚠️</span>
                                            <span>Please enter a deliverable description or remove this field</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    const newDeliverables = [...milestone.deliverables, ''];
                                    updateMilestone(index, 'deliverables', newDeliverables);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                + Add Deliverable
                            </button>
                        </div>

                        <button
                            onClick={() => removeMilestone(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                        >
                            Remove Milestone
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-between gap-2">
                <button
                    onClick={() => onStepChange(3)}
                    className="w-full md:w-auto px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 text-sm md:text-base"
                >
                    ← Back to Team Plan
                </button>
                <button
                    onClick={handleNext}
                    disabled={
                        milestones.length === 0 ||
                        milestones.some(m => !m.dueAt || new Date(m.dueAt).getTime() < new Date().getTime()) ||
                        milestones.reduce((sum, m) => sum + m.amount, 0) > (data.quotedPrice || 0)
                    }
                    className="w-full md:w-auto px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                    Next: Payout Split
                </button>
            </div>
        </div>
    );
};

const PayoutSplitStep: React.FC<{
    data: any;
    onComplete: (data: any) => void;
    onStepChange: (step: number) => void;
    clanMembers: ClanMember[];
}> = ({ data, onComplete, onStepChange, clanMembers }) => {
    const [payoutType, setPayoutType] = useState<'percentage' | 'fixed'>(data.payoutSplit?.type || 'percentage');
    const [distribution, setDistribution] = useState<Record<string, number>>(data.payoutSplit?.distribution || {});

    const handleNext = () => {
        // Validate that at least one member has a payout distribution
        const hasDistribution = Object.values(distribution).some(value => value > 0);

        if (!hasDistribution) {
            console.error('❌ Cannot proceed: At least one member must have a payout distribution');
            return;
        }

        onComplete({ payoutSplit: { type: payoutType, distribution } });
    };

    return (
        <div className="space-y-3 md:space-y-6">
            <h2 className="text-lg md:text-2xl font-semibold">Payout Split</h2>

            <div className="mb-3 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout Type
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center text-sm">
                        <input
                            type="radio"
                            value="percentage"
                            checked={payoutType === 'percentage'}
                            onChange={(e) => setPayoutType(e.target.value as 'percentage' | 'fixed')}
                            className="mr-2"
                        />
                        Percentage
                    </label>
                    <label className="flex items-center text-sm">
                        <input
                            type="radio"
                            value="fixed"
                            checked={payoutType === 'fixed'}
                            onChange={(e) => setPayoutType(e.target.value as 'percentage' | 'fixed')}
                            className="mr-2"
                        />
                        Fixed
                    </label>
                </div>
            </div>

            <div className="mb-3 md:mb-6">
                <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Distribution</h3>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
                    {payoutType === 'percentage'
                        ? 'Set percentage for each member (should add up to 100%)'
                        : 'Set fixed amount for each member (should add up to quoted price)'
                    }
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-blue-800">
                        ℹ️ At least one member must have a payout distribution to proceed.
                    </p>
                </div>

                <div className="space-y-2 md:space-y-3">
                    {clanMembers.map((member, index) => {
                        const hasDistribution = distribution[member.userId] && distribution[member.userId] > 0;
                        return (
                            <div key={member.userId} className={`flex items-center gap-3 md:gap-4 p-2.5 rounded-md ${hasDistribution ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                                }`}>
                                {/* Distribution Status Indicator */}
                                <span className={`text-xs px-2 py-1 rounded-full ${hasDistribution ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {hasDistribution ? '✓ Set' : 'Not Set'}
                                </span>
                                <span className="font-medium text-sm">
                                    {member.user?.firstName || member.user?.username || `Member ${index + 1}`}
                                </span>
                                <input
                                    type="number"
                                    value={distribution[member.userId] || ''}
                                    onChange={(e) => setDistribution({
                                        ...distribution,
                                        [member.userId]: parseFloat(e.target.value) || 0
                                    })}
                                    className="w-20 md:w-24 px-2 md:px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder={payoutType === 'percentage' ? '50' : '1000'}
                                />
                                <span className="text-gray-600 text-sm">
                                    {payoutType === 'percentage' ? '%' : '$'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between gap-2">
                <button
                    onClick={() => onStepChange(4)}
                    className="w-full md:w-auto px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 text-sm md:text-base"
                >
                    ← Back to Milestone Plan
                </button>
                <button
                    onClick={handleNext}
                    disabled={!Object.values(distribution).some(value => value > 0)}
                    className="w-full md:w-auto px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                    Next: Review
                </button>
            </div>
        </div>
    );
};

const ReviewStep: React.FC<{
    data: any;
    onSubmit: (data: any) => void;
    onStepChange: (step: number) => void;
}> = ({ data, onSubmit, onStepChange }) => {
    const handleSubmit = () => {
        onSubmit(data);
    };

    return (
        <div className="space-y-3 md:space-y-6">
            <h2 className="text-lg md:text-2xl font-semibold">Review & Submit</h2>

            {/* Validation Status */}
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="text-sm text-green-800">
                    ✅ All required information has been provided. Review your application details below.
                </p>
            </div>

            <div className="space-y-3 md:space-y-6">
                {/* Selected Gig Review */}
                <div className="border border-gray-200 rounded-md md:rounded-lg p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Selected Gig</h3>
                    <div className="space-y-1.5 md:space-y-2 text-sm md:text-base">
                        <p><strong>Gig ID:</strong> {data.selectedGigId || 'Not selected'}</p>
                    </div>
                    <button
                        onClick={() => onStepChange(1)}
                        className="text-blue-600 hover:text-blue-800 text-xs md:text-sm mt-2"
                    >
                        Change Gig Selection
                    </button>
                </div>

                {/* Application Details Review */}
                <div className="border border-gray-200 rounded-md md:rounded-lg p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Application Details</h3>
                    <div className="space-y-1.5 md:space-y-2 text-sm md:text-base">
                        <p><strong>Proposal:</strong> {data.proposal || 'Not provided'}</p>
                        <p><strong>Quoted Price:</strong> ₹{data.quotedPrice || 0}</p>
                        <p><strong>Estimated Time:</strong> {data.estimatedTime || 'Not specified'}</p>
                        <p><strong>Portfolio Items:</strong> {data.portfolio?.length || 0} items</p>
                    </div>
                    <button
                        onClick={() => onStepChange(2)}
                        className="text-blue-600 hover:text-blue-800 text-xs md:text-sm mt-2"
                    >
                        Edit Application Details
                    </button>
                </div>

                {/* Team Plan Review */}
                <div className="border border-gray-200 rounded-md md:rounded-lg p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Team Plan</h3>
                    <div className="space-y-1.5 md:space-y-2 text-sm md:text-base">
                        <p><strong>Total Members:</strong> {data.teamPlan?.members?.length || 0}</p>
                        <p><strong>Total Hours:</strong> {data.teamPlan?.estimatedTotalHours || 0}</p>
                        <p><strong>Roles:</strong> {data.teamPlan?.roles?.join(', ') || 'None'}</p>
                    </div>
                    <button
                        onClick={() => onStepChange(3)}
                        className="text-blue-600 hover:text-blue-800 text-xs md:text-sm mt-2"
                    >
                        Edit Team Plan
                    </button>
                </div>

                {/* Milestone Plan Review */}
                <div className="border border-gray-200 rounded-md md:rounded-lg p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Milestone Plan</h3>
                    <div className="space-y-1.5 md:space-y-2 text-sm md:text-base">
                        <p><strong>Total Milestones:</strong> {data.milestonePlan?.length || 0}</p>
                        <p><strong>Total Amount:</strong> ₹{data.milestonePlan?.reduce((sum: number, m: any) => sum + m.amount, 0) || 0}</p>
                    </div>
                    <button
                        onClick={() => onStepChange(4)}
                        className="text-blue-600 hover:text-blue-800 text-xs md:text-sm mt-2"
                    >
                        Edit Milestone Plan
                    </button>
                </div>

                {/* Payout Split Review */}
                <div className="border border-gray-200 rounded-md md:rounded-lg p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Payout Split</h3>
                    <div className="space-y-1.5 md:space-y-2 text-sm md:text-base">
                        <p><strong>Type:</strong> {data.payoutSplit?.type || 'Not set'}</p>
                        <p><strong>Distribution:</strong> {Object.keys(data.payoutSplit?.distribution || {}).length} members</p>
                    </div>
                    <button
                        onClick={() => onStepChange(5)}
                        className="text-blue-600 hover:text-blue-800 text-xs md:text-sm mt-2"
                    >
                        Edit Payout Split
                    </button>
                </div>
            </div>

            <div className="flex justify-between gap-2">
                <button
                    onClick={() => onStepChange(5)}
                    className="w-full md:w-auto px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 text-sm md:text-base"
                >
                    ← Back to Payout Split
                </button>
                <button
                    onClick={handleSubmit}
                    className="w-full md:w-auto px-4 md:px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm md:text-base"
                >
                    Submit Application
                </button>
            </div>
        </div>
    );
};
