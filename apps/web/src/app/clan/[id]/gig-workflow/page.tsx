'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    ClipboardDocumentListIcon,
    UserGroupIcon,
    ChartBarIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ArrowLeftIcon,
    BriefcaseIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { useClan } from '@/hooks/useClans';
import { useClanMembers } from '@/hooks/useClans';
import { useClanGigWorkflow } from '@/hooks/useClanGigWorkflow';
import { useAuth } from '@/hooks/useAuth';
import type { ClanMember } from '@/types/clan.types';
import { ClanTaskManagement } from '@/components/clan/ClanTaskManagement';
import { ClanGigApplicationForm } from '@/components/clan/ClanGigApplicationForm';
import TaskDashboard from '@/components/clan/TaskDashboard';

const GIG_CLAN_WORKFLOW_PAGE: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const clanId = params.id as string;
    const searchParams = useSearchParams();
    const initialGigId = (searchParams.get('gigId') || '').trim();
    const initialTab = (searchParams.get('tab') || '').trim();

    const { user } = useAuth();

    const { clan, loading: clanLoading, error: clanError } = useClan(clanId);
    const { members: enrichedMembers, loading: membersLoading } = useClanMembers(clanId);

    // Check if user can manage the clan (owner, co-head, or admin)
    const canManageClan = user?.id && clan && (
        clan.headId === user.id ||
        (enrichedMembers && enrichedMembers.some((member: any) =>
            member.userId === user.id &&
            ['HEAD', 'CO_HEAD', 'ADMIN'].includes(member.role)
        ))
    );

    // Local fallbacks for overview metrics until data wiring is complete
    const clanGigPlans: any[] = [];
    const clanTasks: Array<{ status: string; title: string; description?: string; id: string }> = [];

    const [activeTab, setActiveTab] = useState(initialTab && ['overview', 'active-gigs', 'tasks', 'dashboard', 'team'].includes(initialTab) ? initialTab : (initialGigId ? 'tasks' : 'overview'));

    // Update activeTab if user doesn't have permission for application tab
    React.useEffect(() => {
        if (activeTab === 'application' && !canManageClan) {
            setActiveTab('overview');
        }
    }, [activeTab, canManageClan]);

    // Handle initial tab permission check
    React.useEffect(() => {
        if (initialTab === 'application' && !canManageClan) {
            setActiveTab('overview');
        }
    }, [initialTab, canManageClan]);
    const [selectedGigId, setSelectedGigId] = useState(initialGigId);

    // Add the new workflow hook
    const {
        assignments,
        milestones,
        tasks,
        memberAgreements,
        activeAssignments,
        loading: workflowLoading
    } = useClanGigWorkflow(clanId, selectedGigId);

    const tabs = [
        { id: 'overview', name: 'Overview', icon: ChartBarIcon },
        { id: 'active-gigs', name: 'Active Gigs', icon: BriefcaseIcon },
        ...(canManageClan ? [{ id: 'application', name: 'Gig Application', icon: DocumentTextIcon }] : []),
        { id: 'tasks', name: 'Task Management', icon: ClipboardDocumentListIcon },
        { id: 'dashboard', name: 'Task Dashboard', icon: CheckCircleIcon },
        { id: 'team', name: 'Team Management', icon: UserGroupIcon },
    ] as const;

    // Mobile swipe handling
    const touchStartXRef = useRef<number | null>(null);
    const touchEndXRef = useRef<number | null>(null);
    const swipeThreshold = 50; // px

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartXRef.current = e.changedTouches[0].clientX;
        touchEndXRef.current = null;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndXRef.current = e.changedTouches[0].clientX;
    };

    console.log('activeTab', activeAssignments[0]?.gig?.title);

    const handleTouchEnd = () => {
        const startX = touchStartXRef.current;
        const endX = touchEndXRef.current;
        if (startX == null || endX == null) return;
        const deltaX = endX - startX;
        if (Math.abs(deltaX) < swipeThreshold) return;

        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        if (deltaX < 0 && currentIndex < tabs.length - 1) {
            // swipe left -> next tab
            setActiveTab(tabs[currentIndex + 1].id);
        } else if (deltaX > 0 && currentIndex > 0) {
            // swipe right -> prev tab
            setActiveTab(tabs[currentIndex - 1].id);
        }
    };

    if (clanLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (clanError || !clan) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Clan Not Found</h1>
                    <p className="text-gray-600 text-sm md:text-base">The clan you're looking for doesn't exist or you don't have access to it.</p>
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-4 md:space-y-6">
                        <div className="bg-white rounded-lg shadow p-4 md:p-6">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Workflow Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <DocumentTextIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-2" />
                                    <h3 className="font-medium text-gray-900 text-sm md:text-base">Active Gigs</h3>
                                    <p className="text-xl md:text-2xl font-bold text-blue-600">
                                        {activeAssignments?.length || 0}
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <ClipboardDocumentListIcon className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto mb-2" />
                                    <h3 className="font-medium text-gray-900 text-sm md:text-base">Active Tasks</h3>
                                    <p className="text-xl md:text-2xl font-bold text-green-600">
                                        {tasks?.filter(t => t.status !== 'COMPLETED').length || 0}
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <CheckCircleIcon className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mx-auto mb-2" />
                                    <h3 className="font-medium text-gray-900 text-sm md:text-base">Completed Tasks</h3>
                                    <p className="text-xl md:text-2xl font-bold text-purple-600">
                                        {tasks?.filter(t => t.status === 'COMPLETED').length || 0}
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <StarIcon className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mx-auto mb-2" />
                                    <h3 className="font-medium text-gray-900 text-sm md:text-base">Milestones</h3>
                                    <p className="text-xl md:text-2xl font-bold text-orange-600">
                                        {milestones?.length || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Active Gig Assignments */}
                        {activeAssignments && activeAssignments.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-4 md:p-6">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Active Gig Assignments</h3>
                                <div className="space-y-3">
                                    {activeAssignments.slice(0, 3).map((assignment) => (
                                        <div key={assignment.id} className="border-l-4 border-blue-500 pl-3 md:pl-4 py-2">
                                            <h4 className="font-medium text-gray-900 text-sm md:text-base">
                                                {assignment?.gig?.title}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Status: {assignment.status} |
                                                Milestones: {milestones?.filter(m => m.assignmentId === assignment.id).length || 0}
                                            </p>
                                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                                <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                                                <button
                                                    onClick={() => setSelectedGigId(assignment.gigId)}
                                                    className="ml-4 text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Manage →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {clanGigPlans && clanGigPlans.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-4 md:p-6">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Recent Gig Plans</h3>
                                <div className="space-y-3">
                                    {clanGigPlans.slice(0, 3).map((plan) => (
                                        <div key={plan.id} className="border-l-4 border-blue-500 pl-3 md:pl-4 py-2">
                                            <h4 className="font-medium text-gray-900 text-sm md:text-base">{plan.gigTitle}</h4>
                                            <p className="text-sm text-gray-600">{plan.description}</p>
                                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                                <span>Budget: ${plan.budget}</span>
                                                <span className="mx-2">•</span>
                                                <span>Timeline: {plan.timeline} days</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Tasks */}
                        {tasks && tasks.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-4 md:p-6">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Recent Tasks</h3>
                                <div className="space-y-3">
                                    {tasks.slice(0, 5).map((task) => (
                                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900 text-sm md:text-base">{task.title}</h4>
                                                <p className="text-xs md:text-sm text-gray-600">
                                                    {task.description || 'No description'}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                    task.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'active-gigs':
                return (
                    <div className="space-y-4 md:space-y-6">
                        <div className="bg-white rounded-lg shadow p-4 md:p-6">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Active Gig Assignments</h2>

                            {workflowLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : activeAssignments && activeAssignments.length > 0 ? (
                                <div className="space-y-4">
                                    {activeAssignments.map(assignment => (
                                        <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 text-lg">
                                                        {assignment.gig?.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Status: <span className="font-medium text-blue-600">{assignment.status}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                                                    </p>

                                                    {assignment.milestonePlanSnapshot && (
                                                        <div className="mt-3">
                                                            <p className="text-sm font-medium text-gray-700">Milestones:</p>
                                                            <div className="mt-2 space-y-1">
                                                                {assignment.milestonePlanSnapshot.map((milestone, index) => (
                                                                    <div key={index} className="text-sm text-gray-600">
                                                                        • {milestone.title} - ${milestone.amount}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="ml-4 flex flex-col space-y-2">
                                                    <button
                                                        onClick={() => setSelectedGigId(assignment.gigId)}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                                    >
                                                        Manage Tasks
                                                    </button>

                                                    <button
                                                        onClick={() => window.location.href = `/gig/${assignment.gigId}`}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        View Gig Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <BriefcaseIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium mb-2">No active gig assignments</p>
                                    <p className="text-sm">When your clan applications get approved, they'll appear here.</p>
                                    {canManageClan && (
                                        <button
                                            onClick={() => setActiveTab('application')}
                                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Apply for Gigs
                                        </button>
                                    )}
                                    {!canManageClan && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Only clan owners and admins can apply for gigs.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'application':
                if (!canManageClan) {
                    return (
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <div className="text-red-500 mb-4">
                                <BriefcaseIcon className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
                            <p className="text-gray-600">Only clan owners and admins can apply for gigs.</p>
                            <button
                                onClick={() => setActiveTab('overview')}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Back to Overview
                            </button>
                        </div>
                    );
                }

                return (
                    <div className="bg-white rounded-lg shadow p-2 md:p-0">
                        <ClanGigApplicationForm
                            clanId={clanId}
                            clanSlug={clan?.slug}
                            gigId={selectedGigId}
                            clanMembers={(enrichedMembers as unknown as ClanMember[]) || []}
                            onSubmit={() => { }}
                        />
                    </div>
                );

            case 'tasks':
                return (
                    <div className="bg-white rounded-lg shadow">
                        {!selectedGigId && (
                            <div className="p-3 md:p-4 text-sm text-gray-600 border-b">Select or open a gig to manage tasks. If you just applied as a clan, you will be redirected here with the gig pre-selected.</div>
                        )}
                        <ClanTaskManagement clanId={clanId} gigId={selectedGigId} />
                    </div>
                );

            case 'dashboard':
                return (
                    <div className="bg-white rounded-lg shadow">
                        {!selectedGigId && (
                            <div className="p-3 md:p-4 text-sm text-gray-600 border-b">Select a gig to view the task dashboard.</div>
                        )}
                        <TaskDashboard clanId={clanId} gigId={selectedGigId} />
                    </div>
                );

            case 'team':
                return (
                    <div className="bg-white rounded-lg shadow p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Team Management</h2>
                        <p className="text-sm md:text-base text-gray-600">Team management features coming soon...</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur sticky top-0 z-40 shadow">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 md:h-16">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => router.back()}
                                aria-label="Go back"
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">GIG-CLAN Workflow</h1>
                                <p className="text-xs md:text-sm text-gray-600">{clan.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs md:text-sm font-medium bg-blue-100 text-blue-800">
                                {clan.memberCount || 0} Members
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white border-t border-b">
                    <div className="max-w-7xl mx-auto">
                        <nav
                            className="flex space-x-4 md:space-x-8 overflow-x-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 no-scrollbar"
                            role="tablist"
                            aria-label="Workflow tabs"
                        >
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        role="tab"
                                        aria-selected={isActive}
                                        className={`flex items-center space-x-2 py-2 px-1 md:px-2 border-b-2 font-medium text-sm md:text-base min-w-max transition-colors ${isActive
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{tab.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div
                className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {renderTabContent()}
            </div>
        </div>
    );
};

export default GIG_CLAN_WORKFLOW_PAGE;
