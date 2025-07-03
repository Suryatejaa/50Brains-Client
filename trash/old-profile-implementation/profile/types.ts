// Enhanced interface for comprehensive user analytics
export interface UserAnalytics {
  profileViews: number;
  searchAppearances: number;
  lastViewedAt?: string;
  popularityScore: number;
  engagementScore: number;
  monthlyGrowth: number;
  totalConnections: number;
  responseRate: number;
  avgResponseTime: number;
  gigApplications: number;
  gigWinRate: number;
  averageProjectValue: number;
  clientRetentionRate: number;
  totalEarnings: number;
  completedGigs: number;
  activeGigs: number;
  averageRating: number;
  reviewCount: number;
  repeatClients: number;
}

// Profile component props
export interface ProfileComponentProps {
  profile: any;
  userRoles: string[];
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}

export interface ProfileHeaderProps {
  profileData: any;
  userRoles: string[];
  isEditing: boolean;
  isSaving: boolean;
  completionPercentage: number;
  incompleteSections: any[];
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (field: string, value: any) => void;
}

export interface ProfileAnalyticsProps {
  analytics: UserAnalytics | null;
}
