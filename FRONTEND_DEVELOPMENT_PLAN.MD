# 50BraIns Frontend Development Reference Guide

## 🎯 **PROJECT OVERVIEW**

**50BraIns** is a Creator Economy Platform that serves as "LinkedIn meets Fiverr" for content creators, influencers, brands, and creative professionals. This document provides a complete reference for building the React/React Native frontend applications.

---

## 🏗️ **BACKEND ARCHITECTURE OVERVIEW**

### **Microservices Structure**

```
API Gateway (Port 3000) → Routes to 9 Services:
├── Auth Service (4001)        ✅ Complete
├── User Service (4002)        ✅ Complete
├── Clan Service (4003)        ✅ Complete
├── Gig Service (4004)         ✅ Complete
├── Credit Service (4005)      ✅ Complete
├── Reputation Service (4006)  ✅ Complete
├── Work History Service (4007) ✅ Complete
├── Social Media Service (4008) ✅ Complete
└── Notification Service (4009) ✅ Complete
```

### **Technology Stack**

- **Backend:** Node.js + Express.js + PostgreSQL + Redis + RabbitMQ
- **Authentication:** JWT + Refresh Tokens
- **Database:** Prisma ORM with PostgreSQL
- **Real-time:** Event-driven architecture with RabbitMQ
- **Rate Limiting:** Built-in with configurable limits
- **Frontend:** Next.js 14 (Port 5173) + React + TypeScript

---

## 🌐 **API CONFIGURATION**

### **Base URLs**

```typescript
const API_CONFIG = {
  DEVELOPMENT: 'http://localhost:3000', // Backend Gateway
  PRODUCTION: 'https://api.50brains.com',
  CLIENT: {
    DEVELOPMENT: 'http://localhost:5173', // Frontend Client
    PRODUCTION: 'https://app.50brains.com',
  },
};
```

### **Global Headers**

```typescript
interface GlobalHeaders {
  'Content-Type': 'application/json';
  Authorization?: 'Bearer <JWT_TOKEN>';
  'X-Requested-With': 'XMLHttpRequest';
  Accept: 'application/json';
}
```

### **Standard Response Formats**

```typescript
// Success Response
interface APISuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    processingTime: number;
  };
}

// Error Response
interface APIErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  requestId: string;
  details?: any;
}
```

---

## 🔐 **AUTHENTICATION SERVICE**

### **User Roles & Permissions**

```typescript
enum UserRole {
  USER = 'USER',
  INFLUENCER = 'INFLUENCER',
  BRAND = 'BRAND',
  CREW = 'CREW',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}
```

### **Key Authentication Endpoints**

| Method | Endpoint                    | Purpose                | Auth Required |
| ------ | --------------------------- | ---------------------- | ------------- |
| POST   | `/api/auth/register`        | User registration      | ❌            |
| POST   | `/api/auth/login`           | User login             | ❌            |
| POST   | `/api/auth/refresh`         | Refresh access token   | ❌            |
| POST   | `/api/auth/logout`          | User logout            | ✅            |
| POST   | `/api/auth/forgot-password` | Request password reset | ❌            |
| POST   | `/api/auth/reset-password`  | Reset password         | ❌            |
| POST   | `/api/auth/change-password` | Change password        | ✅            |
| POST   | `/api/auth/verify-email`    | Verify email           | ❌            |
| GET    | `/api/auth/me`              | Get current user       | ✅            |
| PATCH  | `/api/auth/me`              | Update profile         | ✅            |

### **Token Management**

```typescript
interface TokenPair {
  accessToken: string; // 15 minutes expiry
  refreshToken: string; // 7 days (30 days with rememberMe)
}

// JWT Payload Structure
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
```

### **Security Features**

- **Rate Limiting:** 5 attempts per 15 minutes for login
- **Account Locking:** 5 failed attempts = 30 minutes lock
- **Password Policy:** Min 8 chars, uppercase, lowercase, number, special
- **Email Verification:** Required for account activation

---

## 👤 **USER SERVICE**

### **User Profile Structure**

```typescript
interface User {
  // Basic Info
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;

  // Role-Specific Data
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isProfileVerified: boolean;

  // Contact & Social
  phone?: string;
  website?: string;
  location?: string;
  timezone?: string;

  // Platform Data
  totalGigs: number;
  completedGigs: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;

  // Timestamps
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}
```

### **Multi-Role Profiles**

```typescript
// Influencer Profile Extension
interface InfluencerProfile {
  categories: string[];
  skills: string[];
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
  portfolioItems: PortfolioItem[];
  socialMediaHandles: SocialMediaHandle[];
  rates: {
    hourlyRate?: number;
    projectRate?: number;
    minimumBudget?: number;
  };
}

// Brand Profile Extension
interface BrandProfile {
  companyName: string;
  industry: string;
  companySize: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
  marketingBudget: 'LOW' | 'MEDIUM' | 'HIGH' | 'ENTERPRISE';
  preferredCategories: string[];
}

// Crew Profile Extension
interface CrewProfile {
  specialization: string;
  equipment: string[];
  services: string[];
  availability: 'FULL_TIME' | 'PART_TIME' | 'PROJECT_BASED';
}
```

### **Key User Endpoints**

| Method | Endpoint                      | Purpose                  | Auth Required |
| ------ | ----------------------------- | ------------------------ | ------------- |
| GET    | `/api/user/profile`           | Get current user profile | ✅            |
| PUT    | `/api/user/profile`           | Update profile           | ✅            |
| GET    | `/api/user/feed`              | Get users feed           | ✅            |
| GET    | `/api/user/search`            | Search users             | ✅            |
| GET    | `/api/user/:userId`           | Get user by ID           | ✅            |
| POST   | `/api/user/favorites/:userId` | Add to favorites         | ✅            |
| GET    | `/api/user/analytics`         | Get user analytics       | ✅            |

---

## 🏰 **CLAN SERVICE**

### **Clan Structure**

```typescript
interface Clan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  isActive: boolean;
  isVerified: boolean;
  clanHeadId: string;

  // Contact Info
  email?: string;
  website?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;

  // Settings
  requiresApproval: boolean;
  isPaidMembership: boolean;
  membershipFee?: number;
  maxMembers: number;

  // Classification
  primaryCategory?: string;
  categories: string[];
  skills: string[];
  location?: string;
  timezone?: string;

  // Metrics
  totalGigs: number;
  completedGigs: number;
  totalRevenue: number;
  averageRating: number;
  memberCount: number;
  portfolioCount: number;
  reviewCount: number;
  reputationScore: number;

  // Calculated Score
  score: number;
  scoreBreakdown: {
    memberScore: number;
    portfolioScore: number;
    reviewScore: number;
    activityScore: number;
    verificationBonus: number;
  };

  createdAt: string;
  updatedAt: string;
}
```

### **Clan Member Roles & Permissions**

```typescript
enum ClanRole {
  HEAD = 'HEAD',
  CO_HEAD = 'CO_HEAD',
  ADMIN = 'ADMIN',
  SENIOR_MEMBER = 'SENIOR_MEMBER',
  MEMBER = 'MEMBER',
  TRAINEE = 'TRAINEE',
}

enum ClanPermission {
  INVITE_MEMBERS = 'INVITE_MEMBERS',
  REMOVE_MEMBERS = 'REMOVE_MEMBERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  EDIT_CLAN = 'EDIT_CLAN',
  MANAGE_PORTFOLIO = 'MANAGE_PORTFOLIO',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_GIGS = 'MANAGE_GIGS',
  MANAGE_FINANCES = 'MANAGE_FINANCES',
}

interface ClanMember {
  id: string;
  userId: string;
  clanId: string;
  role: ClanRole;
  customRole?: string;
  permissions: ClanPermission[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LEFT';
  isCore: boolean;
  gigsParticipated: number;
  revenueGenerated: number;
  contributionScore: number;
  joinedAt: string;
  lastActiveAt: string;
}
```

### **Key Clan Endpoints**

| Method | Endpoint                                    | Purpose            | Auth Required   |
| ------ | ------------------------------------------- | ------------------ | --------------- |
| GET    | `/api/clan/feed`                            | Get clans feed     | ✅              |
| POST   | `/api/clan`                                 | Create clan        | ✅              |
| GET    | `/api/clan/:clanId`                         | Get clan details   | ✅              |
| PUT    | `/api/clan/:clanId`                         | Update clan        | ✅ (Head/Admin) |
| DELETE | `/api/clan/:clanId`                         | Delete clan        | ✅ (Head only)  |
| GET    | `/api/members/:clanId`                      | Get clan members   | ✅              |
| POST   | `/api/members/invite`                       | Invite member      | ✅              |
| PUT    | `/api/members/:clanId/members/:userId/role` | Update member role | ✅              |
| DELETE | `/api/members/:clanId/members/:userId`      | Remove member      | ✅              |
| POST   | `/api/members/:clanId/leave`                | Leave clan         | ✅              |
| GET    | `/api/analytics/:clanId`                    | Get clan analytics | ✅ (Members)    |
| GET    | `/api/rankings`                             | Get clan rankings  | ✅              |

---

## 💼 **GIG SERVICE**

### **Gig Structure**

```typescript
interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  skills: string[];

  // Posting Details
  posterId: string;
  posterType: 'USER' | 'BRAND' | 'CLAN';
  postingType: 'INDIVIDUAL' | 'CLAN_POSTING';

  // Requirements
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'ANY';
  location?: string;
  isRemote: boolean;
  deadline?: string;
  estimatedDuration?: string;

  // Compensation
  budgetType: 'FIXED' | 'HOURLY' | 'NEGOTIABLE';
  budgetMin?: number;
  budgetMax?: number;
  currency: string;

  // Application Settings
  maxApplicants?: number;
  applicationDeadline?: string;

  // Status & Metrics
  status:
    | 'DRAFT'
    | 'ACTIVE'
    | 'PAUSED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  applicationCount: number;
  viewCount: number;
  isUrgent: boolean;
  isFeatured: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

### **Gig Application System**

```typescript
interface GigApplication {
  id: string;
  gigId: string;
  applicantId: string;
  applicantType: 'USER' | 'CLAN';

  // Application Details
  coverLetter: string;
  proposedRate?: number;
  proposedTimeline?: string;
  availability: string;
  portfolioItems: string[];

  // Status Tracking
  status: 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  isViewed: boolean;

  // Communication
  clientQuestions?: Array<{
    question: string;
    answer: string;
  }>;

  createdAt: string;
  updatedAt: string;
}
```

### **Work Submission System**

```typescript
interface WorkSubmission {
  id: string;
  gigId: string;
  applicationId: string;
  workerId: string;

  // Submission Details
  title: string;
  description: string;
  deliverables: Array<{
    type: 'FILE' | 'LINK' | 'TEXT';
    url?: string;
    content?: string;
    fileName?: string;
  }>;

  // Status & Review
  status:
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'REVISION_REQUESTED'
    | 'APPROVED'
    | 'REJECTED';
  submissionRound: number;
  reviewNotes?: string;
  revisionCount: number;

  createdAt: string;
  updatedAt: string;
}
```

### **Key Gig Endpoints**

| Method | Endpoint                                      | Purpose                 | Auth Required |
| ------ | --------------------------------------------- | ----------------------- | ------------- |
| GET    | `/api/gig/feed`                               | Get gigs feed           | ✅            |
| POST   | `/api/gig`                                    | Create gig              | ✅            |
| GET    | `/api/gig/:gigId`                             | Get gig details         | ✅            |
| PUT    | `/api/gig/:gigId`                             | Update gig              | ✅ (Owner)    |
| DELETE | `/api/gig/:gigId`                             | Delete gig              | ✅ (Owner)    |
| POST   | `/api/gig/:gigId/apply`                       | Apply to gig            | ✅            |
| GET    | `/api/gig/:gigId/applications`                | Get applications        | ✅ (Owner)    |
| PUT    | `/api/gig/applications/:applicationId/status` | Update application      | ✅            |
| POST   | `/api/gig/submit-work`                        | Submit work             | ✅            |
| GET    | `/api/gig/my-gigs`                            | Get user's gigs         | ✅            |
| GET    | `/api/gig/my-applications`                    | Get user's applications | ✅            |

---

## 💳 **CREDIT SERVICE**

### **Credit System**

```typescript
interface CreditWallet {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  currency: string;
  lastUpdated: string;
}

interface CreditTransaction {
  id: string;
  userId: string;
  type:
    | 'PURCHASE'
    | 'BOOST_PROFILE'
    | 'BOOST_GIG'
    | 'BOOST_CLAN'
    | 'CONTRIBUTE_CLAN'
    | 'REFUND';
  amount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reference?: string;
  paymentGateway?: 'RAZORPAY' | 'STRIPE';
  externalReference?: string;
  createdAt: string;
}
```

### **Boost System**

```typescript
interface BoostEvent {
  id: string;
  boosterId: string;
  targetType: 'PROFILE' | 'GIG' | 'CLAN';
  targetId: string;
  creditsSpent: number;
  duration: number; // hours
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

// Boost Types & Costs
const BOOST_COSTS = {
  PROFILE: {
    24: 10, // 24 hours = 10 credits
    48: 15, // 48 hours = 15 credits
    168: 45, // 1 week = 45 credits
  },
  GIG: {
    24: 15, // 24 hours = 15 credits
    48: 25, // 48 hours = 25 credits
    168: 60, // 1 week = 60 credits
  },
  CLAN: {
    24: 20, // 24 hours = 20 credits
    48: 35, // 48 hours = 35 credits
    168: 80, // 1 week = 80 credits
  },
};
```

### **Key Credit Endpoints**

| Method | Endpoint                      | Purpose                 | Auth Required |
| ------ | ----------------------------- | ----------------------- | ------------- |
| GET    | `/api/credit/wallet`          | Get wallet balance      | ✅            |
| POST   | `/api/credit/purchase`        | Purchase credits        | ✅            |
| GET    | `/api/credit/transactions`    | Get transaction history | ✅            |
| POST   | `/api/credit/boost/profile`   | Boost profile           | ✅            |
| POST   | `/api/credit/boost/gig`       | Boost gig               | ✅            |
| POST   | `/api/credit/boost/clan`      | Boost clan              | ✅            |
| GET    | `/api/credit/boosts`          | Get active boosts       | ✅            |
| POST   | `/api/credit/contribute/clan` | Contribute to clan      | ✅            |

---

## 🏆 **REPUTATION SERVICE**

### **Reputation System**

```typescript
interface ReputationScore {
  id: string;
  userId: string;

  // Core Metrics
  gigsCompleted: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
  profileViews: number;
  clanContributions: number;

  // Engagement Metrics
  applicationSuccess: number; // Success rate %
  responseTime: number; // Average hours
  completionRate: number; // On-time completion %

  // Calculated Scores
  baseScore: number;
  bonusScore: number;
  penaltyScore: number;
  finalScore: number;

  // Tier System
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'LEGEND';
  badges: string[];

  // Admin Controls
  isVerified: boolean;
  isSuspended: boolean;
  adminOverride?: number;

  updatedAt: string;
}
```

### **Tier System**

```typescript
const REPUTATION_TIERS = {
  BRONZE: { minScore: 0, maxScore: 99, color: '#CD7F32' },
  SILVER: { minScore: 100, maxScore: 499, color: '#C0C0C0' },
  GOLD: { minScore: 500, maxScore: 1499, color: '#FFD700' },
  PLATINUM: { minScore: 1500, maxScore: 3999, color: '#E5E4E2' },
  DIAMOND: { minScore: 4000, maxScore: 9999, color: '#B9F2FF' },
  LEGEND: { minScore: 10000, maxScore: Infinity, color: '#FF69B4' },
};
```

### **Achievement Badges**

```typescript
const ACHIEVEMENT_BADGES = {
  FIRST_GIG: 'Completed first gig',
  SPEED_DEMON: '10 gigs completed in 24 hours',
  TEAM_PLAYER: 'Active clan member for 6 months',
  TOP_RATED: 'Maintained 4.8+ rating with 50+ reviews',
  EARLY_BIRD: 'Quick responder (avg <2 hours)',
  RELIABLE: '95%+ on-time completion rate',
  POPULAR: '1000+ profile views in a month',
  MENTOR: 'Helped 10+ new users',
  VETERAN: '2+ years on platform',
};
```

### **Key Reputation Endpoints**

| Method | Endpoint                          | Purpose              | Auth Required |
| ------ | --------------------------------- | -------------------- | ------------- |
| GET    | `/api/reputation/score/:userId`   | Get reputation score | ✅            |
| GET    | `/api/reputation/history/:userId` | Get score history    | ✅            |
| GET    | `/api/reputation/leaderboard`     | Get leaderboard      | ✅            |
| GET    | `/api/reputation/badges/:userId`  | Get user badges      | ✅            |
| GET    | `/api/reputation/stats`           | Get platform stats   | ✅            |

---

## 📋 **WORK HISTORY SERVICE**

### **Work History Structure**

```typescript
interface WorkHistoryEntry {
  id: string;
  workerId: string;
  clientId: string;
  gigId?: string;
  clanId?: string;

  // Project Details
  projectTitle: string;
  projectDescription: string;
  category: string;
  skills: string[];
  projectType: 'INDIVIDUAL' | 'CLAN_PROJECT';

  // Timeline
  startDate: string;
  endDate?: string;
  duration?: number; // days

  // Financial
  projectValue: number;
  currency: string;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'DISPUTED';

  // Performance
  rating?: number;
  review?: string;
  isCompleted: boolean;
  deliveryStatus: 'ON_TIME' | 'LATE' | 'EARLY';

  // Additional Info
  clientIndustry?: string;
  isPublic: boolean;
  portfolioIncluded: boolean;
  tags: string[];

  createdAt: string;
  updatedAt: string;
}
```

### **Key Work History Endpoints**

| Method | Endpoint                     | Purpose          | Auth Required |
| ------ | ---------------------------- | ---------------- | ------------- |
| GET    | `/api/work-history`          | Get work history | ✅            |
| POST   | `/api/work-history`          | Add entry        | ✅            |
| PUT    | `/api/work-history/:entryId` | Update entry     | ✅            |
| DELETE | `/api/work-history/:entryId` | Delete entry     | ✅            |
| GET    | `/api/work-history/stats`    | Get statistics   | ✅            |

---

## 📱 **SOCIAL MEDIA SERVICE**

### **Social Media Integration**

```typescript
interface SocialMediaHandle {
  id: string;
  userId: string;
  platform:
    | 'INSTAGRAM'
    | 'TIKTOK'
    | 'YOUTUBE'
    | 'TWITTER'
    | 'LINKEDIN'
    | 'FACEBOOK';
  handle: string;
  url: string;
  isVerified: boolean;
  followerCount?: number;
  isPublic: boolean;
  lastUpdated: string;
}

interface SocialMediaAnalytics {
  id: string;
  userId: string;
  platform: string;

  // Metrics
  followerCount: number;
  engagementRate: number;
  averageLikes: number;
  averageComments: number;
  postFrequency: number;

  // Growth
  followerGrowth: number;
  engagementGrowth: number;

  lastSynced: string;
}
```

### **Key Social Media Endpoints**

| Method | Endpoint                              | Purpose            | Auth Required |
| ------ | ------------------------------------- | ------------------ | ------------- |
| GET    | `/api/social-media/handles`           | Get social handles | ✅            |
| POST   | `/api/social-media/handles`           | Add social handle  | ✅            |
| PUT    | `/api/social-media/handles/:handleId` | Update handle      | ✅            |
| DELETE | `/api/social-media/handles/:handleId` | Delete handle      | ✅            |
| POST   | `/api/social-media/verify/:handleId`  | Verify handle      | ✅            |
| GET    | `/api/social-media/analytics`         | Get analytics      | ✅            |

---

## 🔔 **NOTIFICATION SERVICE**

### **Notification System**

```typescript
interface Notification {
  id: string;
  userId: string;
  type:
    | 'GIG_APPLICATION'
    | 'CLAN_INVITATION'
    | 'WORK_SUBMISSION'
    | 'RATING_RECEIVED'
    | 'BOOST_APPLIED'
    | 'PAYMENT_RECEIVED';
  title: string;
  message: string;

  // Related Data
  relatedId?: string;
  relatedType?: 'GIG' | 'CLAN' | 'USER' | 'APPLICATION' | 'SUBMISSION';
  actionUrl?: string;

  // Status
  isRead: boolean;
  isArchived: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  // Delivery
  deliveryMethod: 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS';
  isDelivered: boolean;
  deliveredAt?: string;

  createdAt: string;
  readAt?: string;
}
```

### **Key Notification Endpoints**

| Method | Endpoint                                  | Purpose             | Auth Required |
| ------ | ----------------------------------------- | ------------------- | ------------- |
| GET    | `/api/notifications`                      | Get notifications   | ✅            |
| PUT    | `/api/notifications/:notificationId/read` | Mark as read        | ✅            |
| PUT    | `/api/notifications/read-all`             | Mark all as read    | ✅            |
| DELETE | `/api/notifications/:notificationId`      | Delete notification | ✅            |
| PUT    | `/api/notifications/settings`             | Update preferences  | ✅            |

---

## 🔧 **FRONTEND IMPLEMENTATION PATTERNS**

### **API Client Setup**

```typescript
class APIClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APISuccessResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: APIErrorResponse = await response.json();
      throw new APIError(error);
    }

    return response.json();
  }

  async get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
```

### **Authentication Hook**

```typescript
interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Implementation details...

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    refreshToken,
  };
};
```

### **Data Fetching Hook**

```typescript
interface UseDataReturn<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export const useData = <T>(
  endpoint: string,
  options?: {
    dependencies?: any[];
    enabled?: boolean;
  }
): UseDataReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Implementation details...

  return { data, error, isLoading, refetch };
};
```

---

## 📊 **STATE MANAGEMENT STRUCTURE**

### **Redux Store Structure** (if using Redux)

```typescript
interface RootState {
  auth: {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
  users: {
    feed: User[];
    searchResults: User[];
    favorites: User[];
    analytics: UserAnalytics | null;
  };
  clans: {
    feed: Clan[];
    userClans: Clan[];
    selectedClan: Clan | null;
    members: ClanMember[];
    analytics: ClanAnalytics | null;
  };
  gigs: {
    feed: Gig[];
    userGigs: Gig[];
    applications: GigApplication[];
    selectedGig: Gig | null;
  };
  credits: {
    wallet: CreditWallet | null;
    transactions: CreditTransaction[];
    boosts: BoostEvent[];
  };
  reputation: {
    userScore: ReputationScore | null;
    leaderboard: LeaderboardEntry[];
    badges: string[];
  };
  notifications: {
    items: Notification[];
    unreadCount: number;
  };
  ui: {
    loading: Record<string, boolean>;
    errors: Record<string, string>;
    modals: Record<string, boolean>;
  };
}
```

---

## 🎨 **UI/UX CONSIDERATIONS**

### **Responsive Design Breakpoints**

```typescript
const BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
};
```

### **Design System - 50BraIns Glassmorphism Theme**

```typescript
// 🎨 50BraIns Light Theme (Glass + Frosted Style)
// ✨ Glassmorphism x Minimal UI x Creator SaaS
const THEME = {
  // Core Brand Colors
  brand: {
    primary: '#247eab', // Cyan-blue for CTAs & accents
    base: '#FFFFFF', // Main background (paper white)
    glass: 'rgba(255,255,255,0.6)', // Frosted cards
    lightBlue: '#E0F5FE', // Hover BG, input focus highlight
    soft: '#F8FBFF', // Extra light backgrounds
  },

  // Typography
  text: {
    main: '#1E1E1E', // Headers and content
    muted: '#5E6A79', // Placeholder, secondary text
    white: '#FFFFFF', // Text on colored backgrounds
  },

  // UI Elements
  border: {
    light: '#E5EAF2', // Card, input borders
    focus: '#247eab', // Focus states
  },

  // Effects
  effects: {
    glassBlur: 'blur(10px)', // Backdrop blur for frosted glass
    shadowSoft: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    shadowMd: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },

  // Status Colors (subtle, minimal)
  status: {
    success: '#10B981', // Emerald
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    info: '#247eab', // Brand blue
  },

  // Reputation System Colors
  reputation: {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
    legend: '#FF69B4',
  },
};

// TailwindCSS Configuration
const TAILWIND_THEME = {
  extend: {
    colors: {
      brand: {
        primary: '#247eab',
        base: '#FFFFFF',
        glass: 'rgba(255,255,255,0.6)',
        'light-blue': '#E0F5FE',
        soft: '#F8FBFF',
        text: {
          main: '#1E1E1E',
          muted: '#5E6A79',
        },
        border: '#E5EAF2',
      },
    },
    backdropBlur: {
      sm: '4px',
      md: '10px',
      lg: '16px',
    },
    boxShadow: {
      glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
  },
};
```

### **Design System Rules**

````typescript
// ✅ Component Design Patterns
interface DesignSystemRules {
  cards: {
    base: 'bg-white shadow-soft border border-brand-border rounded-lg';
    glass: 'bg-brand-glass backdrop-blur-md border border-brand-border rounded-lg';
    hover: 'hover:shadow-md hover:bg-brand-light-blue/20 transition-all duration-200';
  };

  buttons: {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-2 focus:ring-brand-primary/50';
    secondary: 'border border-brand-primary text-brand-primary hover:bg-brand-light-blue';
    ghost: 'text-brand-text-main hover:bg-brand-light-blue';
  };

  inputs: {
    base: 'bg-brand-glass backdrop-blur-sm border border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-light-blue';
    placeholder: 'placeholder:text-brand-text-muted';
  };

  text: {
    heading: 'text-brand-text-main font-semibold';
    body: 'text-brand-text-main';
    muted: 'text-brand-text-muted';
    accent: 'text-brand-primary';
  };

  layout: {
    page: 'bg-brand-base min-h-screen';
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
    section: 'py-12 md:py-20';
  };
}

// 🛠️ Component Examples
const COMPONENT_PATTERNS = {
  // Glass Card Pattern
  card: `
    <div className="bg-white/60 backdrop-blur-md border border-brand-border rounded-lg p-3
                    hover:shadow-md hover:bg-brand-light-blue/20 transition-all duration-200">
      <h3 className="text-brand-text-main font-semibold mb-2">Card Title</h3>
      <p className="text-brand-text-muted">Card content with muted text</p>
      <button className="mt-4 bg-brand-primary text-white px-4 py-2 rounded-lg
                        hover:bg-brand-primary/90 transition-colors">
        Action
      </button>
    </div>
  `,

  // Modal Pattern
  modal: `
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-md border border-brand-border rounded-xl p-3 m-4">
        Modal content with frosted glass effect
      </div>
    </div>
  `,

  // Input Pattern
  input: `
    <input className="w-full bg-brand-glass backdrop-blur-sm border border-brand-border
                     rounded-lg px-4 py-3 text-brand-text-main placeholder:text-brand-text-muted
                     focus:border-brand-primary focus:ring-2 focus:ring-brand-light-blue
                     transition-all duration-200"
           placeholder="Enter text..." />
  `,
### **Complete Glassmorphism Component Examples**

```tsx
// 🎯 Example: Glassmorphism Gig Card Component
interface GigCardProps {
  gig: {
    title: string;
    description: string;
    budget: number;
    skills: string[];
    posterName: string;
    timePosted: string;
    isUrgent?: boolean;
  };
}

export const GigCard: React.FC<GigCardProps> = ({ gig }) => {
  return (
    <div className="group card-glass p-3 hover:bg-brand-light-blue/10 transition-all duration-300">
      {/* Header with Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-heading text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
            {gig.title}
          </h3>
          <p className="text-muted text-sm">by {gig.posterName} • {gig.timePosted}</p>
        </div>
        {gig.isUrgent && (
          <span className="bg-error/10 text-error px-2 py-1 rounded-full text-xs font-medium border border-error/20">
            Urgent
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-body text-sm mb-4 line-clamp-3">
        {gig.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {gig.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="bg-brand-soft border border-brand-border px-2 py-1 rounded-lg text-xs text-muted"
          >
            {skill}
          </span>
        ))}
        {gig.skills.length > 3 && (
          <span className="text-xs text-muted">+{gig.skills.length - 3} more</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-heading font-semibold">
          ${gig.budget.toLocaleString()}
        </div>
        <button className="btn-primary px-4 py-2 text-sm">
          Apply Now
        </button>
      </div>

      {/* Hover Effect Line */}
      <div className="h-0.5 w-0 bg-brand-primary mt-4 transition-all duration-300 group-hover:w-full rounded-full"></div>
    </div>
  );
};

// 🔮 Example: Glassmorphism Modal Component
interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-content max-w-md w-full p-3 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-body transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-body">
          {children}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button className="btn-primary">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ✨ Example: Glassmorphism Input Form
export const GlassForm: React.FC = () => {
  return (
    <form className="card-glass p-8 max-w-md mx-auto space-y-6">
      <h2 className="text-heading text-2xl font-semibold text-center mb-6">
        Join 50BraIns
      </h2>

      {/* Input Group */}
      <div className="space-y-4">
        <div>
          <label className="block text-body text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="input"
            placeholder="creator@example.com"
          />
        </div>

        <div>
          <label className="block text-body text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-body text-sm font-medium mb-2">
            User Type
          </label>
          <select className="input">
            <option>Content Creator</option>
            <option>Brand Manager</option>
            <option>Creative Team</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button type="submit" className="btn-primary w-full py-3">
          Create Account
        </button>
        <button type="button" className="btn-secondary w-full py-3">
          Sign in with Google
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-muted text-xs">
        By signing up, you agree to our{' '}
        <a href="#" className="text-accent hover:underline">Terms</a> and{' '}
        <a href="#" className="text-accent hover:underline">Privacy Policy</a>
      </p>
    </form>
  );
};

// 🏆 Example: Reputation Badge with Glassmorphism
interface ReputationBadgeProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend';
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  tier,
  score,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  const tierIcons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '💠',
    legend: '👑',
  };

  return (
    <div className="relative group">
      <div className={`
        ${sizeClasses[size]}
        bg-brand-glass backdrop-blur-md border border-brand-border
        rounded-full flex items-center justify-center
        group-hover:scale-110 transition-all duration-300
        reputation-${tier}
      `}>
        <span className="text-xl">{tierIcons[tier]}</span>
      </div>

      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2
                      bg-black text-white px-2 py-1 rounded text-xs
                      opacity-0 group-hover:opacity-100 transition-opacity
                      pointer-events-none whitespace-nowrap">
        {tier.charAt(0).toUpperCase() + tier.slice(1)} • {score} points
      </div>
    </div>
  );
};
````

### **Layout Examples with Glassmorphism**

```tsx
// 📱 Example: Dashboard Layout with Glass Sidebar
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="page-container min-h-screen">
      {/* Glass Sidebar */}
      <aside
        className="bg-brand-glass border-brand-border fixed left-0 top-16 
                        h-[calc(100vh-4rem)] w-64 border-r backdrop-blur-md"
      >
        <nav className="space-y-2 p-3">
          <a
            href="#"
            className="text-body hover:bg-brand-light-blue/30 flex items-center space-x-3 
                               rounded-lg p-3 transition-all"
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </a>
          <a
            href="#"
            className="text-body hover:bg-brand-light-blue/30 flex items-center space-x-3 
                               rounded-lg p-3 transition-all"
          >
            <span>💼</span>
            <span>My Gigs</span>
          </a>
          <a
            href="#"
            className="text-body hover:bg-brand-light-blue/30 flex items-center space-x-3 
                               rounded-lg p-3 transition-all"
          >
            <span>👥</span>
            <span>My Clans</span>
          </a>
          <a
            href="#"
            className="text-accent bg-brand-light-blue/20 flex items-center space-x-3 
                               rounded-lg p-3 transition-all"
          >
            <span>💎</span>
            <span>Credits</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

// 🎨 Example: Landing Page Section with Glass Cards
export const LandingSection: React.FC = () => {
  return (
    <section className="page-container section-spacing">
      <div className="content-container">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-heading mb-4 text-4xl font-bold">
            Built for the Modern Creator
          </h2>
          <p className="text-muted mx-auto max-w-3xl text-xl">
            Experience the future of creator collaboration with our
            glassmorphism-powered platform
          </p>
        </div>

        {/* Feature Grid with Glass Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="card-glass hover:bg-brand-light-blue/10 group p-8 text-center"
            >
              <div
                className="bg-brand-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full 
                            transition-transform group-hover:scale-110"
              >
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-heading mb-4 text-xl font-semibold">
                Glass Feature {item}
              </h3>
              <p className="text-muted">
                Beautiful glassmorphism design with smooth animations and
                elegant interactions.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

```typescript
// 🔮 Design References
const DESIGN_REFERENCES = {
  inspiration: [
    'Linear - Glassy, blue-accented, elegant',
    'Framer - Clean white with frosted hover effects',
    'Notion - Pure minimal white with subtle accents',
    'Superhuman - Blue highlights on white base',
    'Apple Design System - Glassmorphism and translucency',
  ],

  principles: [
    'Mostly white and transparent backgrounds',
    'Cyan-blue (#247eab) used sparingly but boldly for CTAs & accents',
    'Neutral grays for borders and secondary text',
    'Soft shadows and subtle blur effects',
    'Generous whitespace and clean typography',
    'Minimal UI with purposeful interactions',
  ],

  uiHierarchy: {
    primary: 'Brand blue (#247eab) - CTAs, active states, links',
    secondary: 'White with blue accents - cards, containers',
    tertiary: 'Light backgrounds (#F8FBFF) - subtle highlights',
    text: 'Dark (#1E1E1E) for content, muted (#5E6A79) for secondary',
  },
};
```

### **Component Architecture**

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── user/           # User profile components
│   ├── clan/           # Clan management components
│   ├── gig/            # Gig marketplace components
│   ├── credit/         # Credit & boost components
│   ├── reputation/     # Reputation & leaderboard
│   ├── notifications/  # Notification components
│   └── shared/         # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API service classes
├── store/              # State management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── constants/          # App constants
```

---

## 🚀 **DEPLOYMENT CONSIDERATIONS**

### **Environment Variables**

```typescript
interface EnvironmentConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  RAZORPAY_KEY_ID: string;
  STRIPE_PUBLISHABLE_KEY: string;
  SENTRY_DSN?: string;
  ANALYTICS_ID?: string;
}
```

### **Performance Optimization**

- **Code Splitting:** Route-based and component-based
- **Image Optimization:** WebP format with fallbacks
- **API Caching:** React Query or SWR for data fetching
- **Bundle Analysis:** Regular bundle size monitoring
- **Service Worker:** For offline functionality

### **Security Best Practices**

- **Token Storage:** Secure storage for refresh tokens
- **XSS Prevention:** Input sanitization
- **CSRF Protection:** CSRF tokens for sensitive operations
- **Content Security Policy:** Strict CSP headers
- **Rate Limiting:** Client-side request throttling

---

## 📱 **MOBILE APP CONSIDERATIONS**

### **React Native Specific Features**

- **Biometric Authentication:** Face ID / Touch ID
- **Push Notifications:** FCM integration
- **Deep Linking:** Universal links for content sharing
- **Offline Storage:** AsyncStorage for user preferences
- **Camera Integration:** Profile picture and portfolio uploads
- **Location Services:** For location-based features

### **Platform-Specific Adaptations**

- **iOS Human Interface Guidelines** compliance
- **Android Material Design** principles
- **Navigation patterns** appropriate to each platform
- **Performance optimization** for mobile devices

---

## 🎯 **FRONTEND DEVELOPMENT STRATEGY**

### **Development Approach**

1. **Web First:** Start with Next.js web application (TypeScript + TailwindCSS)
2. **Mobile Second:** React Native app with maximum component reusability
3. **Shared Architecture:** Extract common logic into shared packages
4. **Progressive Enhancement:** MVP → Feature releases → Performance optimizations

### **Technology Stack**

```typescript
// Web Application
const WEB_STACK = {
  framework: 'Next.js 14 (App Router)',
  language: 'TypeScript',
  styling: 'TailwindCSS + Headless UI',
  stateManagement: 'Zustand + React Query',
  authentication: 'NextAuth.js',
  validation: 'Zod',
  testing: 'Jest + React Testing Library',
  deployment: 'Vercel',
};

// Mobile Application
const MOBILE_STACK = {
  framework: 'React Native + Expo',
  language: 'TypeScript',
  styling: 'NativeWind (TailwindCSS for RN)',
  stateManagement: 'Zustand + React Query',
  navigation: 'React Navigation v6',
  testing: 'Jest + Detox',
  deployment: 'EAS Build',
};

// Shared Packages
const SHARED_PACKAGES = {
  api: '@50brains/api-client',
  types: '@50brains/types',
  utils: '@50brains/utils',
  hooks: '@50brains/hooks',
  constants: '@50brains/constants',
};
```

---

## 📁 **PROJECT STRUCTURE**

### **Monorepo Architecture**

```
50BraIns-Client/
├── packages/                    # Shared packages
│   ├── shared-types/           # TypeScript interfaces & types
│   ├── shared-utils/           # Utility functions
│   ├── shared-hooks/           # Custom React hooks
│   ├── shared-constants/       # App constants
│   ├── api-client/            # API service layer
│   └── shared-components/      # Reusable UI components
├── apps/
│   ├── web/                   # Next.js web application
│   └── mobile/                # React Native mobile app
├── docs/                      # Documentation
├── tools/                     # Build tools & scripts
├── DEV_FLOW.md               # Daily development log
├── package.json              # Root package.json
├── turbo.json               # Turborepo configuration
└── README.md                # Project overview
```

### **Web App Structure (apps/web/)**

```
apps/web/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth route group
│   │   ├── (dashboard)/      # Dashboard route group
│   │   ├── (marketplace)/    # Marketplace route group
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   ├── user/            # User-related components
│   │   ├── clan/            # Clan components
│   │   ├── gig/             # Gig marketplace components
│   │   ├── credit/          # Credit system components
│   │   ├── reputation/      # Reputation components
│   │   ├── notifications/   # Notification components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand stores
│   ├── lib/                 # Utility libraries
│   ├── types/               # TypeScript types
│   └── constants/           # App constants
├── public/                  # Static assets
├── tailwind.config.js       # TailwindCSS config
├── next.config.js          # Next.js config
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

---

## 🏗️ **DEVELOPMENT PHASES**

### **Phase 1: MVP Foundation (Weeks 1-4)**

```typescript
interface MVPFeatures {
  core: [
    'User Authentication (Login/Register/Profile)',
    'Basic User Profiles (All roles)',
    'Simple Gig Marketplace (Post/Browse/Apply)',
    'Basic Messaging System',
    'Credit Wallet (View balance)',
    'Basic Reputation Display',
  ];
  pages: [
    'Landing Page',
    'Auth Pages (Login/Register)',
    'Dashboard',
    'Profile Pages',
    'Gig Marketplace',
    'Gig Details',
    'User Settings',
  ];
  architecture: [
    'API Client Setup',
    'State Management Foundation',
    'Component Library Basics',
    'Authentication Flow',
    'Error Handling System',
    'Loading States',
  ];
}
```

### **Phase 2: Core Features (Weeks 5-8)**

```typescript
interface CoreFeatures {
  clan: [
    'Clan Creation & Management',
    'Member Invitation System',
    'Role-based Permissions',
    'Clan Portfolio',
    'Clan Analytics Dashboard',
  ];
  gig: [
    'Advanced Gig Filters',
    'Application Management',
    'Work Submission System',
    'Rating & Review System',
    'Gig Analytics',
  ];
  credit: [
    'Credit Purchase Flow',
    'Boost System (Profile/Gig/Clan)',
    'Transaction History',
    'Contribution System',
  ];
  social: [
    'Social Media Integration',
    'Portfolio Management',
    'Advanced Search & Filters',
    'Follow/Favorite System',
  ];
}
```

### **Phase 3: Advanced Features (Weeks 9-12)**

```typescript
interface AdvancedFeatures {
  realtime: [
    'Real-time Notifications',
    'Live Chat System',
    'Activity Feeds',
    'Status Updates',
  ];
  analytics: [
    'User Analytics Dashboard',
    'Clan Performance Metrics',
    'Gig Success Tracking',
    'Revenue Analytics',
  ];
  advanced: [
    'Advanced Reputation System',
    'Achievement Badges',
    'Leaderboards',
    'Verification System',
    'Content Moderation',
  ];
  mobile: [
    'React Native App Development',
    'Platform-specific Features',
    'Push Notifications',
    'Offline Support',
  ];
}
```

### **Phase 4: Performance & Polish (Weeks 13-16)**

```typescript
interface PolishFeatures {
  performance: [
    'Code Splitting & Lazy Loading',
    'Image Optimization',
    'Caching Strategies',
    'Bundle Size Optimization',
    'Core Web Vitals Optimization',
  ];
  ux: [
    'Animations & Transitions',
    'Loading Skeletons',
    'Error Boundaries',
    'Accessibility Improvements',
    'Mobile Responsiveness',
  ];
  quality: [
    'Comprehensive Testing',
    'Security Audits',
    'Performance Monitoring',
    'SEO Optimization',
    'Documentation',
  ];
}
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **State Management Architecture**

```typescript
// Zustand Store Structure
interface AppStore {
  // Auth Store
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
  };

  // UI Store
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    notifications: Notification[];
    modals: Record<string, boolean>;
    loading: Record<string, boolean>;
    setSidebarOpen: (open: boolean) => void;
    toggleTheme: () => void;
    showModal: (modal: string) => void;
    hideModal: (modal: string) => void;
  };

  // Feature Stores (separate stores for better performance)
  gigs: GigStore;
  clans: ClanStore;
  credits: CreditStore;
  reputation: ReputationStore;
}

// React Query for Server State
const useGigs = () => {
  return useQuery({
    queryKey: ['gigs'],
    queryFn: () => apiClient.gigs.getFeed(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### **API Client with Caching**

```typescript
class APIClient {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async get<T>(endpoint: string, useCache = true): Promise<T> {
    // Return cached data immediately if available
    if (useCache && this.cache.has(endpoint)) {
      const cached = this.cache.get(endpoint)!;

      // Return stale data immediately
      const result = cached.data;

      // Fetch fresh data in background if cache is stale
      if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
        this.fetchFreshData(endpoint);
      }

      return result;
    }

    // Fetch fresh data
    return this.fetchFreshData(endpoint);
  }

  private async fetchFreshData<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(),
    });

    const data = await response.json();

    // Update cache
    this.cache.set(endpoint, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }
}
```

### **Component Architecture Patterns**

```typescript
// Compound Component Pattern for Complex UI
export const GigCard = {
  Root: ({ children, gig }: { children: React.ReactNode; gig: Gig }) => (
    <div className="bg-white rounded-lg shadow-md p-3">{children}</div>
  ),
  Header: ({ gig }: { gig: Gig }) => (
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-semibold">{gig.title}</h3>
      <GigBadge status={gig.status} />
    </div>
  ),
  Content: ({ gig }: { gig: Gig }) => (
    <p className="text-gray-600 mb-4">{gig.description}</p>
  ),
  Footer: ({ gig }: { gig: Gig }) => (
    <div className="flex justify-between items-center">
      <span className="text-lg font-bold">${gig.budgetMax}</span>
      <Button>Apply Now</Button>
    </div>
  ),
};

// Usage
<GigCard.Root gig={gig}>
  <GigCard.Header gig={gig} />
  <GigCard.Content gig={gig} />
  <GigCard.Footer gig={gig} />
</GigCard.Root>
```

### **Error Handling Strategy**

```typescript
// Global Error Boundary
export class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Global error caught:', error, errorInfo);
    // Send to Sentry or similar
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// API Error Handling Hook
export const useErrorHandler = () => {
  const toast = useToast();

  return useCallback((error: unknown) => {
    if (error instanceof APIError) {
      switch (error.statusCode) {
        case 401:
          // Redirect to login
          window.location.href = '/login';
          break;
        case 403:
          toast.error('You do not have permission to perform this action');
          break;
        case 429:
          toast.error('Too many requests. Please try again later');
          break;
        default:
          toast.error(error.message || 'Something went wrong');
      }
    } else {
      toast.error('An unexpected error occurred');
    }
  }, [toast]);
};
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Code Splitting Strategy**

```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const GigMarketplace = lazy(() => import('@/pages/GigMarketplace'));
const ClanManagement = lazy(() => import('@/pages/ClanManagement'));

// Component-based code splitting
const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));

// Preload on hover
const PreloadableLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const handleMouseEnter = () => {
    import(`@/pages/${to}`);
  };

  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
};
```

### **Image Optimization**

```typescript
// Next.js Image component with optimization
import Image from 'next/image';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      className="rounded-lg"
    />
  );
};
```

---

## 🧪 **TESTING STRATEGY**

### **Testing Pyramid**

```typescript
// Unit Tests (70%)
describe('UserCard Component', () => {
  it('renders user information correctly', () => {
    const mockUser = createMockUser();
    render(<UserCard user={mockUser} />);

    expect(screen.getByText(mockUser.displayName)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });
});

// Integration Tests (20%)
describe('Gig Application Flow', () => {
  it('allows user to apply for a gig', async () => {
    const { user } = renderWithProviders(<GigDetails gigId="123" />);

    await user.click(screen.getByRole('button', { name: /apply now/i }));
    await user.type(screen.getByLabelText(/cover letter/i), 'Test application');
    await user.click(screen.getByRole('button', { name: /submit application/i }));

    expect(screen.getByText(/application submitted/i)).toBeInTheDocument();
  });
});

// E2E Tests (10%)
describe('User Registration Flow', () => {
  it('allows new user to register and verify email', () => {
    cy.visit('/register');
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('SecurePassword123!');
    cy.get('[data-testid=register-button]').click();

    cy.url().should('include', '/verify-email');
    cy.contains('Check your email for verification link');
  });
});
```

---

## 🔒 **SECURITY IMPLEMENTATION**

### **Authentication & Authorization**

```typescript
// Route Protection HOC
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) => {
  return (props: P) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login');
      }

      if (requiredRole && user && user.role !== requiredRole) {
        router.push('/unauthorized');
      }
    }, [user, isLoading, router]);

    if (isLoading) return <LoadingSpinner />;
    if (!user) return null;
    if (requiredRole && user.role !== requiredRole) return null;

    return <Component {...props} />;
  };
};

// Content Security Policy
const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.50brains.com;
  `.replace(/\s+/g, ' ').trim(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
};
```

---

## 📱 **MOBILE APP CONSIDERATIONS**

### **Shared Component Strategy**

```typescript
// Platform-specific components
// packages/shared-components/src/Button/Button.tsx
export interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

// packages/shared-components/src/Button/Button.web.tsx
export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg ${
        variant === 'primary'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      {children}
    </button>
  );
};

// packages/shared-components/src/Button/Button.native.tsx
import { TouchableOpacity, Text } from 'react-native';

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg ${
        variant === 'primary'
          ? 'bg-blue-500'
          : 'bg-gray-200'
      }`}
    >
      <Text className={`text-center ${
        variant === 'primary'
          ? 'text-white'
          : 'text-gray-800'
      }`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};
```

---

## 📊 **MONITORING & ANALYTICS**

### **Performance Monitoring**

```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // Send to your analytics service
  console.log(metric);
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Error tracking with Sentry
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

This comprehensive development plan provides a scalable, maintainable foundation for building the 50BraIns platform with maximum code reusability between web and mobile applications. The architecture supports LinkedIn/Netflix-level scalability while maintaining excellent developer experience and code quality.
