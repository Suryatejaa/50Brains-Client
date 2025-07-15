// types/gig.types.ts - Gig service type definitions

export interface Gig {
  id: string;
  title: string;
  description: string;
  postedById: string;
  postedByType: 'user' | 'brand';
  budgetMin?: number;
  budgetMax?: number;
  experienceLevel?: string;
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  roleRequired: string;
  skillsRequired: string[];
  isClanAllowed: boolean;
  location?: string;
  duration?: string;
  urgency: 'urgent' | 'normal' | 'flexible';
  status: GigStatus;
  category: string;
  deliverables: string[];
  requirements?: string;
  deadline?: string;
  assignedToId?: string;
  assignedToType?: 'user' | 'clan';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  applications?: Application[];
  submissions?: Submission[];
  stats?: {
    applicationsCount: number;
    submissionsCount: number;
    daysOld: number;
    daysUntilDeadline: number;
  };
}

export interface CreateGigData {
  title: string;
  description: string;
  category: string;
  roleRequired: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: 'fixed' | 'hourly' | 'negotiable';
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  skillsRequired?: string[];
  isClanAllowed?: boolean;
  location?: string;
  duration?: string;
  urgency?: 'urgent' | 'normal' | 'flexible';
  deliverables?: string[];
  requirements?: string;
  deadline?: string;
}

export interface Application {
  id: string;
  gigId: string;
  applicantId: string;
  applicantType: 'user' | 'clan';
  proposal?: string;
  quotedPrice?: number;
  estimatedTime?: string;
  portfolio: string[];
  status: ApplicationStatus;
  appliedAt: string;
  respondedAt?: string;
  rejectionReason?: string;
  gig?: Gig;
  submissions?: Submission[];
}

export interface CreateApplicationData {
  gigId: string;
  proposal?: string;
  quotedPrice?: number;
  estimatedTime?: string;
  portfolio?: string[];
}

export interface Submission {
  id: string;
  gigId: string;
  applicationId?: string;
  submittedById: string;
  submittedByType: 'user' | 'clan';
  title: string;
  description?: string;
  deliverables: string[];
  notes?: string;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  feedback?: string;
  rating?: number;
  gig?: Gig;
  application?: Application;
}

export interface CreateSubmissionData {
  gigId: string;
  applicationId?: string;
  title: string;
  description?: string;
  deliverables: string[];
  notes?: string;
}

export interface GigFilters {
  category?: string[];
  roleRequired?: string[];
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  urgency?: string[];
  status?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  deadline?: string;
  page?: number;
  limit?: number;
  experienceLevel?: string;
  skillsRequired?: string[];
  isClanAllowed?: boolean;
  budgetType?: 'fixed' | 'hourly' | 'negotiable';
}

export interface GigApiResponse {
  gigs: Gig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    category: string[];
    roleRequired: string[];
    urgency: string[];
    status: string[];
    sortBy: string;
    sortOrder: string;
  };
}

export interface GigStats {
  totalGigs: number;
  openGigs: number;
  inProgressGigs: number;
  completedGigs: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  averageCompletionTime: number;
  totalEarnings: number;
}

export interface GigBoostEvent {
  id: string;
  gigId: string;
  boosterId: string;
  amount: number;
  duration: number;
  eventId: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export enum GigStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISION = 'REVISION',
}

// Category definitions
export const GIG_CATEGORIES = {
  'content-creation': 'Content Creation',
  'video-editing': 'Video Editing',
  photography: 'Photography',
  'graphic-design': 'Graphic Design',
  'social-media': 'Social Media',
  writing: 'Writing & Copywriting',
  'web-development': 'Web Development',
  'mobile-development': 'Mobile Development',
  marketing: 'Marketing',
  consulting: 'Consulting',
} as const;

export const EXPERIENCE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  EXPERT: 'Expert',
} as const;

export const BUDGET_TYPES = {
  fixed: 'Fixed Price',
  hourly: 'Hourly Rate',
  negotiable: 'Negotiable',
} as const;

export const URGENCY_LEVELS = {
  urgent: 'Urgent',
  normal: 'Normal',
  flexible: 'Flexible',
} as const;
