// components/clan/ClanGigApplicationForm.tsx
import React, { useState } from 'react';
import { useGigApplication } from '@/hooks/useGigApplication';
import type {
    TeamPlan,
    MilestonePlan,
    PayoutSplit,
    TeamMember
} from '@/types/gig.types';
import type { ClanMember } from '@/types/clan.types';
import { apiClient } from '@/lib/api-client';

interface ClanGigApplicationFormProps {
    gigId: string;
    clanId: string;
    clanMembers: ClanMember[];
    onSubmit: (application: any) => void;
    onCancel?: () => void;
}

export const ClanGigApplicationForm: React.FC<ClanGigApplicationFormProps> = ({
    gigId,
    clanId,
    clanMembers,
    onSubmit,
    onCancel,
}) => {
    const { applyToGig, loading, error } = useGigApplication();
    const [currentStep, setCurrentStep] = useState(1);
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
    const [userMap, setUserMap] = useState<Record<string, { username?: string; firstName?: string; lastName?: string; roles?: string[] }>>({});

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
        { id: 1, title: 'Team Plan', component: TeamPlanStep },
        { id: 2, title: 'Milestone Plan', component: MilestoneStep },
        { id: 3, title: 'Payout Split', component: PayoutSplitStep },
        { id: 4, title: 'Review & Submit', component: ReviewStep },
    ];

    const handleStepComplete = (stepData: any) => {
        if (stepData.teamPlan) setTeamPlan(stepData.teamPlan);
        if (stepData.milestonePlan) setMilestonePlan(stepData.milestonePlan);
        if (stepData.payoutSplit) setPayoutSplit(stepData.payoutSplit);

        setCurrentStep(prev => prev + 1);
    };

    const handleSubmit = async (finalData: any) => {
        try {
            const application = await applyToGig(gigId, {
                applicantType: 'clan',
                clanId,
                teamPlan,
                milestonePlan,
                payoutSplit,
                ...finalData,
            });

            if (application) {
                onSubmit(application);
            }
        } catch (error) {
            console.error('Application failed:', error);
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
                data={{ teamPlan, milestonePlan, payoutSplit, userMap }}
                onComplete={handleStepComplete}
                onSubmit={handleSubmit}
                clanMembers={clanMembers}
                onBack={goBack}
                onStepChange={goToStep}
            />

            {error && (
                <div className="mt-3 md:mt-4 p-2.5 md:p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

// Step Components
const TeamPlanStep: React.FC<{
    data: any;
    onComplete: (data: any) => void;
    clanMembers: ClanMember[];
}> = ({ data, onComplete, clanMembers }) => {
    const [members, setMembers] = useState<TeamMember[]>(data.teamPlan?.members || []);
    const [roles, setRoles] = useState<string[]>(data.teamPlan?.roles || []);

    const addMember = () => {
        setMembers([...members, {
            userId: '',
            userName: '',
            role: '',
            expectedHours: 0,
            deliverables: [''],
        }]);
    };

    const removeMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const updateMember = (index: number, field: keyof TeamMember, value: any) => {
        const newMembers = [...members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setMembers(newMembers);
    };

    const handleNext = () => {
        const totalHours = members.reduce((sum, member) => sum + member.expectedHours, 0);
        onComplete({
            teamPlan: {
                members,
                roles,
                estimatedTotalHours: totalHours,
            },
        });
    };

    return (
        <div className="space-y-3 md:space-y-6">
            <h2 className="text-lg md:text-2xl font-semibold">Team Plan</h2>

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
                    <button
                        onClick={addMember}
                        className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base"
                    >
                        Add Member
                    </button>
                </div>

                <div className="space-y-3 md:space-y-4">
                    {members.map((member, index) => (
                        <div key={index} className="border border-gray-200 rounded-md md:rounded-lg p-3 md:p-4 shadow-none md:shadow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Member
                                    </label>
                                    <select
                                        value={member.userName || ''}
                                        onChange={(e) => {
                                            const selectedKey = e.target.value; // username (preferred) or fallback id
                                            // Find selected by matching username in userMap or fallback username in clanMembers
                                            const found = clanMembers.find(cm => {
                                                const profile = data.userMap?.[cm.userId];
                                                const u = profile?.username || cm.user?.username || cm.userId;
                                                return u === selectedKey;
                                            });
                                            if (found) {
                                                updateMember(index, 'userId', found.userId);
                                                const profile = data.userMap?.[found.userId];
                                                const username = profile?.username || found.user?.username || found.userId;
                                                updateMember(index, 'userName', username);
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
                                    <div key={dIndex} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={deliverable}
                                            onChange={(e) => {
                                                const newDeliverables = [...member.deliverables];
                                                newDeliverables[dIndex] = e.target.value;
                                                updateMember(index, 'deliverables', newDeliverables);
                                            }}
                                            className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm"
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

            <div className="flex md:justify-end">
                <button
                    onClick={handleNext}
                    disabled={members.length === 0 || roles.length === 0}
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
    onBack: () => void;
}> = ({ data, onComplete, onBack }) => {
    const [milestones, setMilestones] = useState<MilestonePlan[]>(data.milestonePlan || []);

    const addMilestone = () => {
        setMilestones([...milestones, {
            title: '',
            description: '',
            dueAt: '',
            amount: 0,
            deliverables: [''],
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
        onComplete({ milestonePlan: milestones });
    };

    return (
        <div className="space-y-3 md:space-y-6">
            <h2 className="text-lg md:text-2xl font-semibold">Milestone Plan</h2>

            <div className="flex justify-between items-center mb-3 md:mb-4">
                <p className="text-gray-600 text-sm md:text-base">Define the key milestones and deliverables for this gig</p>
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
                                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                                />
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
                                    Amount ($)
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
                                <div key={dIndex} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={deliverable}
                                        onChange={(e) => {
                                            const newDeliverables = [...milestone.deliverables];
                                            newDeliverables[dIndex] = e.target.value;
                                            updateMilestone(index, 'deliverables', newDeliverables);
                                        }}
                                        className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm"
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
                    onClick={onBack}
                    className="w-full md:w-auto px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 text-sm md:text-base"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={milestones.length === 0}
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
    onBack: () => void;
}> = ({ data, onComplete, onBack }) => {
    const [payoutType, setPayoutType] = useState<'percentage' | 'fixed'>(data.payoutSplit?.type || 'percentage');
    const [distribution, setDistribution] = useState<Record<string, number>>(data.payoutSplit?.distribution || {});

    const handleNext = () => {
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
                        ? 'Set percentage for each member'
                        : 'Set fixed amount for each member'
                    }
                </p>

                <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-3 md:gap-4 p-2.5 bg-gray-50 rounded-md">
                        <span className="font-medium text-sm">Team Member 1</span>
                        <input
                            type="number"
                            value={distribution['member1'] || ''}
                            onChange={(e) => setDistribution({
                                ...distribution,
                                member1: parseFloat(e.target.value) || 0
                            })}
                            className="w-20 md:w-24 px-2 md:px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder={payoutType === 'percentage' ? '50' : '1000'}
                        />
                        <span className="text-gray-600 text-sm">
                            {payoutType === 'percentage' ? '%' : '$'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between gap-2">
                <button
                    onClick={onBack}
                    className="w-full md:w-auto px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 text-sm md:text-base"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="w-full md:w-auto px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base"
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
    onBack: () => void;
    onStepChange: (step: number) => void;
}> = ({ data, onSubmit, onBack, onStepChange }) => {
    const handleSubmit = () => {
        onSubmit(data);
    };

    return (
        <div className="space-y-3 md:space-y-6">
            <h2 className="text-lg md:text-2xl font-semibold">Review & Submit</h2>

            <div className="space-y-3 md:space-y-6">
                {/* Team Plan Review */}
                <div className="border border-gray-200 rounded-md md:rounded-lg p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Team Plan</h3>
                    <div className="space-y-1.5 md:space-y-2 text-sm md:text-base">
                        <p><strong>Total Members:</strong> {data.teamPlan?.members?.length || 0}</p>
                        <p><strong>Total Hours:</strong> {data.teamPlan?.estimatedTotalHours || 0}</p>
                        <p><strong>Roles:</strong> {data.teamPlan?.roles?.join(', ') || 'None'}</p>
                    </div>
                    <button
                        onClick={() => onStepChange(1)}
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
                        <p><strong>Total Amount:</strong> ${data.milestonePlan?.reduce((sum: number, m: any) => sum + m.amount, 0) || 0}</p>
                    </div>
                    <button
                        onClick={() => onStepChange(2)}
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
                        onClick={() => onStepChange(3)}
                        className="text-blue-600 hover:text-blue-800 text-xs md:text-sm mt-2"
                    >
                        Edit Payout Split
                    </button>
                </div>
            </div>

            <div className="flex justify-between gap-2">
                <button
                    onClick={onBack}
                    className="w-full md:w-auto px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 text-sm md:text-base"
                >
                    Back
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
