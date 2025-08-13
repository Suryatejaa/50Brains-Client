// types/clan.types.ts - Clan service type definitions

export interface Clan {
    id: string;
    name: string;
    description?: string;
    tagline?: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
    isVerified: boolean;
    isActive: boolean;
    email?: string;
    website?: string;
    instagramHandle?: string;
    twitterHandle?: string;
    linkedinHandle?: string;
    requiresApproval: boolean;
    isPaidMembership: boolean;
    membershipFee?: number;
    maxMembers?: number;
    primaryCategory: string;
    categories: string[];
    skills: string[];
    location?: string;
    timezone?: string;
    portfolioImages: string[];
    portfolioVideos: string[];
    showcaseProjects: string[];
    createdAt: string;
    updatedAt: string;
    members?: ClanMember[];
    applications?: ClanJoinRequest[];
    stats?: {
        totalMembers: number;
        totalGigs: number;
        averageRating: number;
        reputationScore: number;
    };
}

export interface ClanMember {
    id: string;
    clanId: string;
    userId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt: string;
    user?: UserProfile;
}

export interface ClanJoinRequest {
    id: string;
    clanId: string;
    userId: string;
    message?: string;
    requestedRole: 'MEMBER' | 'ADMIN';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    reviewMessage?: string;
    user?: UserProfile;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    skills: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
    hourlyRate?: number;
    rating?: number;
    totalReviews?: number;
    reputationScore?: number;
}

// New GIG-CLAN Workflow Types
export interface ClanWorkPackage {
    id: string;
    gigId: string;
    clanId: string;
    title: string;
    description?: string;
    assigneeUserId: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
    estimatedHours?: number;
    actualHours?: number;
    deliverables: string[];
    notes?: string;
    dueDate?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MemberAgreement {
    id: string;
    clanId: string;
    userId: string;
    gigId: string;
    role: string;
    expectedHours?: number;
    deliverables: string[];
    payoutPercentage?: number;
    payoutFixedAmount?: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    acceptedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClanGigPlanRequest {
    members: {
        userId: string;
        role: string;
        expectedHours: number;
        deliverables: string[];
        payoutPercentage?: number;
        payoutFixedAmount?: number;
    }[];
}

export interface CreateClanTaskRequest {
    title: string;
    description?: string;
    assigneeUserId: string;
    estimatedHours?: number;
    deliverables: string[];
    dueDate?: string;
}

export interface UpdateClanTaskRequest {
    title?: string;
    description?: string;
    assigneeUserId?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
    estimatedHours?: number;
    actualHours?: number;
    deliverables?: string[];
    notes?: string;
    dueDate?: string;
}
