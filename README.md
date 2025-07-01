# 50BraIns Frontend Development Project

## 🎯 **Project Overview**

50BraIns is a Creator Economy Platform that serves as "LinkedIn meets Fiverr" for content creators, influencers, brands, and creative professionals. This repository contains the frontend applications (Web + Mobile) with a shared component architecture.

## 🏗️ **Architecture**

### **Monorepo Structure**

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
│   └── mobile/                # React Native mobile app (planned)
├── docs/                      # Documentation
├── tools/                     # Build tools & scripts
├── DEV_FLOW.md               # Daily development log
├── FRONTEND_DEVELOPMENT_PLAN.MD # Complete development reference
└── README.md                 # This file
```

### **Technology Stack**

#### **Web Application**

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + Headless UI
- **State Management:** Zustand + React Query
- **Authentication:** NextAuth.js
- **Validation:** Zod + React Hook Form
- **Testing:** Jest + React Testing Library + Playwright
- **Deployment:** Vercel

#### **Mobile Application** (Planned)

- **Framework:** React Native + Expo
- **Language:** TypeScript
- **Styling:** NativeWind (TailwindCSS for RN)
- **State Management:** Zustand + React Query
- **Navigation:** React Navigation v6
- **Testing:** Jest + Detox
- **Deployment:** EAS Build

#### **Shared Packages**

- **API Client:** Comprehensive API layer with caching
- **Types:** Complete TypeScript interfaces
- **Utils:** Shared utility functions
- **Hooks:** Custom React hooks
- **Constants:** App-wide constants

## 📁 **Current Project Status**

### **✅ Completed (Day 1)**

- [x] Backend API analysis and documentation
- [x] Frontend architecture planning
- [x] Monorepo structure design
- [x] Technology stack finalization
- [x] Development phases breakdown
- [x] Shared types package creation
- [x] API client package foundation
- [x] Next.js app configuration
- [x] Project documentation

### **🔄 Next Steps (Day 2)**

- [ ] Install dependencies and initialize packages
- [ ] Complete component providers setup
- [ ] Create authentication system
- [ ] Build basic UI component library
- [ ] Setup development environment

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+
- npm 9+
- Git

### **Installation & Setup**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd 50BraIns-Client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build shared packages**

   ```bash
   npm run build
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open the application**
   - Web: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: See `FRONTEND_DEVELOPMENT_PLAN.MD`

### **Environment Variables**

Create `.env.local` in `apps/web/`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:5173
NEXTAUTH_URL=http://localhost:5173
NEXT_PUBLIC_ENVIRONMENT=development

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Payment Gateways
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key

# Analytics & Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## 📊 **Development Workflow**

### **Available Scripts**

```bash
# Development
npm run dev          # Start all dev servers
npm run build        # Build all packages/apps
npm run lint         # Lint all code
npm run type-check   # TypeScript type checking
npm run test         # Run all tests
npm run test:e2e     # Run E2E tests
npm run clean        # Clean all build artifacts

# Individual packages/apps
cd packages/shared-types && npm run dev
cd apps/web && npm run dev
```

### **Development Process**

1. **Feature Development:**
   - Create feature branch from `main`
   - Update `DEV_FLOW.md` daily
   - Follow TypeScript strict mode
   - Write tests for critical paths
   - Update documentation

2. **Code Quality:**
   - ESLint + Prettier for code formatting
   - Husky pre-commit hooks
   - Conventional commit messages
   - 80%+ test coverage for critical paths

3. **Review Process:**
   - Feature branch → Pull Request
   - Code review required
   - All tests must pass
   - No TypeScript errors

## 📝 **Development Phases**

### **Phase 1: MVP Foundation (Weeks 1-4)**

- [ ] User Authentication System
- [ ] Basic User Profiles
- [ ] Simple Gig Marketplace
- [ ] Basic UI Components
- [ ] Responsive Design

### **Phase 2: Core Features (Weeks 5-8)**

- [ ] Clan System
- [ ] Advanced Gig Features
- [ ] Credit System
- [ ] Social Media Integration
- [ ] Search & Filters

### **Phase 3: Advanced Features (Weeks 9-12)**

- [ ] Real-time Notifications
- [ ] Analytics Dashboard
- [ ] Reputation System
- [ ] Achievement Badges
- [ ] Mobile App Development

### **Phase 4: Performance & Polish (Weeks 13-16)**

- [ ] Performance Optimization
- [ ] Accessibility Improvements
- [ ] Comprehensive Testing
- [ ] Security Audits
- [ ] Production Deployment

## 🎨 **Design System**

### **Color Palette**

```typescript
const colors = {
  primary: '#6366f1', // Indigo
  secondary: '#ec4899', // Pink
  success: '#10b981', // Emerald
  warning: '#f59e0b', // Amber
  error: '#ef4444', // Red
  info: '#3b82f6', // Blue

  reputation: {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
    legend: '#FF69B4',
  },
};
```

### **Component Library**

- Atomic Design principles
- Compound component patterns
- Full TypeScript support
- Accessibility-first approach
- Mobile-responsive design

## 🔧 **API Integration**

### **Backend Services**

The platform integrates with 9 microservices:

- **Authentication Service** (Port 4001)
- **User Service** (Port 4002)
- **Clan Service** (Port 4003)
- **Gig Service** (Port 4004)
- **Credit Service** (Port 4005)
- **Reputation Service** (Port 4006)
- **Work History Service** (Port 4007)
- **Social Media Service** (Port 4008)
- **Notification Service** (Port 4009)

### **API Client Features**

- Automatic caching with stale-while-revalidate
- Request deduplication
- Error handling with user-friendly messages
- File upload with progress tracking
- Authentication token management
- Rate limiting and retry logic

## 🧪 **Testing Strategy**

### **Testing Pyramid**

- **Unit Tests (70%):** Component logic, utilities, hooks
- **Integration Tests (20%):** Feature workflows, API integration
- **E2E Tests (10%):** Critical user journeys

### **Testing Tools**

- **Jest:** Unit and integration testing
- **React Testing Library:** Component testing
- **Playwright:** E2E testing
- **Storybook:** Component documentation (planned)

## 📱 **Mobile Development**

### **React Native Strategy**

- Maximum code reuse with shared packages
- Platform-specific adaptations
- Native features integration
- Performance optimization

### **Shared Architecture**

- Business logic in shared hooks
- API client reuse
- Type definitions sharing
- Utility functions sharing

## 🚀 **Deployment**

### **Web Application**

- **Platform:** Vercel
- **Environment:** Preview + Production
- **Features:** Automatic deployments, edge functions

### **Mobile Application** (Planned)

- **Platform:** EAS Build (Expo)
- **Distribution:** App Store + Google Play
- **Updates:** OTA updates with Expo Updates

## 📚 **Documentation**

### **Key Documents**

- `FRONTEND_DEVELOPMENT_PLAN.MD` - Complete technical reference
- `DEV_FLOW.md` - Daily development log
- `50BRAINS_BACKEND_API_DOCUMENTATION.md` - Backend API reference
- `App_Desc.md` - Product overview

### **Code Documentation**

- JSDoc comments for all public APIs
- TypeScript interfaces for all data structures
- Component prop documentation
- Hook usage examples

## 🤝 **Contributing**

### **Development Guidelines**

1. Follow TypeScript strict mode
2. Use functional components with hooks
3. Implement proper error boundaries
4. Write accessible components
5. Follow responsive design principles
6. Update documentation with changes

### **Commit Convention**

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 📞 **Support**

For questions, issues, or contributions:

- Check existing documentation
- Review `DEV_FLOW.md` for current status
- Create GitHub issues for bugs/features
- Follow coding standards and conventions

---

**Project Status:** Foundation Phase (Week 1)  
**Last Updated:** July 1, 2025  
**Next Milestone:** Authentication System Implementation


Based on the comprehensive 50BraIns backend API documentation, I'll describe how client developers can build role-based dashboards using the available APIs and services.

# 🏗️ **CLIENT DEVELOPMENT GUIDE: ROLE-BASED DASHBOARDS**

## **Overview**
The 50BraIns platform supports multiple user roles with distinct capabilities and dashboard requirements. Here's how to build role-based dashboards using the documented APIs.

---

## 👥 **USER ROLES & PERMISSIONS**

Based on the API documentation, the platform supports these primary roles:

### **🎨 Creator/Influencer Role**
- Content creators, influencers, freelancers
- Focus: Gig completion, social media growth, reputation building

### **🏢 Brand/Client Role** 
- Companies and brands seeking influencer partnerships
- Focus: Gig posting, influencer discovery, campaign management

### **👥 Clan Leader Role**
- Community managers and team leaders
- Focus: Member management, collaboration, team growth

### **⚡ Super Admin Role**
- Platform administrators
- Focus: System monitoring, user management, analytics

---

## 🎯 **ROLE-BASED DASHBOARD ARCHITECTURE**

### **1. Authentication & Role Detection**

```typescript
// First, authenticate and get user profile with roles
const authenticateUser = async (credentials: LoginCredentials) => {
  // Step 1: Login via Auth Service
  const authResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const { token, user } = await authResponse.json();
  
  // Step 2: Get detailed user profile
  const profileResponse = await fetch(`/api/user/profile/${user.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const profile = await profileResponse.json();
  
  return {
    token,
    user: profile.data,
    roles: profile.data.roles,
    userType: profile.data.userType // 'creator', 'brand', 'clan_leader', 'admin'
  };
};

// Role-based routing
const getDashboardRoute = (userType: string, roles: string[]) => {
  if (roles.includes('super_admin')) return '/admin-dashboard';
  if (userType === 'brand') return '/brand-dashboard';
  if (userType === 'creator') return '/creator-dashboard';
  if (roles.includes('clan_leader')) return '/clan-dashboard';
  return '/user-dashboard';
};
```

### **2. Dashboard Layout Component**

```typescript
const DashboardLayout: React.FC = () => {
  const { user, roles, userType } = useAuth();
  
  return (
    <div className="dashboard-layout">
      <Sidebar userType={userType} roles={roles} />
      <Header user={user} />
      <main className="dashboard-content">
        <Routes>
          {/* Role-based route rendering */}
          {userType === 'creator' && <Route path="/*" element={<CreatorDashboard />} />}
          {userType === 'brand' && <Route path="/*" element={<BrandDashboard />} />}
          {roles.includes('clan_leader') && <Route path="/clan/*" element={<ClanDashboard />} />}
          {roles.includes('super_admin') && <Route path="/admin/*" element={<AdminDashboard />} />}
        </Routes>
      </main>
    </div>
  );
};
```

---

## 🎨 **CREATOR/INFLUENCER DASHBOARD**

### **Dashboard Overview**
```typescript
const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadCreatorDashboardData();
  }, []);

  const loadCreatorDashboardData = async () => {
    const [
      reputation,
      socialMedia,
      activeGigs,
      workHistory,
      notifications,
      credits
    ] = await Promise.all([
      // Reputation Service
      fetch(`/api/reputation/${user.id}`).then(r => r.json()),
      
      // Social Media Service  
      fetch(`/api/social-media/${user.id}`).then(r => r.json()),
      
      // Gig Service - My active applications
      fetch(`/api/my/applications?status=ACTIVE`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Work History Service
      fetch(`/api/work-history/${user.id}/summary`).then(r => r.json()),
      
      // Notification Service
      fetch(`/api/notifications/unread/${user.id}`).then(r => r.json()),
      
      // Credit Service
      fetch(`/api/credit/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json())
    ]);

    setDashboardData({
      reputation: reputation.data,
      socialMedia: socialMedia.data,
      activeGigs: activeGigs.data,
      workHistory: workHistory.data,
      notifications: notifications.data,
      credits: credits.data
    });
  };

  return (
    <div className="creator-dashboard">
      <DashboardHeader title="Creator Dashboard" user={user} />
      
      {/* Key Metrics Row */}
      <div className="metrics-grid">
        <MetricCard 
          title="Reputation Score" 
          value={dashboardData?.reputation?.totalScore || 0}
          icon="🏆"
          trend={dashboardData?.reputation?.trend}
        />
        <MetricCard 
          title="Total Followers" 
          value={dashboardData?.socialMedia?.totalFollowers || 0}
          icon="👥"
        />
        <MetricCard 
          title="Active Gigs" 
          value={dashboardData?.activeGigs?.length || 0}
          icon="💼"
        />
        <MetricCard 
          title="Credits Balance" 
          value={dashboardData?.credits?.balance || 0}
          icon="💰"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>🔔 Recent Notifications</h3>
          <NotificationsList notifications={dashboardData?.notifications} />
        </div>
        
        <div className="dashboard-section">
          <h3>💼 Active Gig Applications</h3>
          <ActiveGigsList gigs={dashboardData?.activeGigs} />
        </div>
        
        <div className="dashboard-section">
          <h3>📈 Social Media Growth</h3>
          <SocialMediaChart data={dashboardData?.socialMedia} />
        </div>
        
        <div className="dashboard-section">
          <h3>🏆 Recent Achievements</h3>
          <AchievementsList achievements={dashboardData?.workHistory?.recentAchievements} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <QuickActionButton href="/gigs/browse" icon="🔍" label="Browse Gigs" />
        <QuickActionButton href="/profile/edit" icon="✏️" label="Edit Profile" />
        <QuickActionButton href="/portfolio" icon="📁" label="Portfolio" />
        <QuickActionButton href="/credits/purchase" icon="💳" label="Buy Credits" />
      </div>
    </div>
  );
};
```

### **Creator-Specific Components**

```typescript
// Gig Application Tracker
const ActiveGigsList: React.FC<{ gigs: any[] }> = ({ gigs }) => {
  return (
    <div className="active-gigs-list">
      {gigs?.map(gig => (
        <div key={gig.id} className="gig-item">
          <div className="gig-info">
            <h4>{gig.title}</h4>
            <p>Status: <span className={`status ${gig.status.toLowerCase()}`}>{gig.status}</span></p>
            <p>Deadline: {new Date(gig.deadline).toLocaleDateString()}</p>
          </div>
          <div className="gig-actions">
            <button onClick={() => viewGigDetails(gig.id)}>View Details</button>
            {gig.status === 'IN_PROGRESS' && (
              <button onClick={() => submitWork(gig.id)}>Submit Work</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Social Media Analytics Widget
const SocialMediaChart: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="social-media-chart">
      {data?.accounts?.map(account => (
        <div key={account.id} className="platform-stat">
          <div className="platform-icon">{getPlatformIcon(account.platform)}</div>
          <div className="stat-info">
            <span className="follower-count">{account.followers.toLocaleString()}</span>
            <span className="growth-rate">+{account.growth}% this week</span>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 🏢 **BRAND/CLIENT DASHBOARD**

### **Dashboard Overview**
```typescript
const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);

  const loadBrandDashboardData = async () => {
    const [
      activeGigs,
      applications,
      analytics,
      influencerSearch,
      credits,
      reputation
    ] = await Promise.all([
      // My posted gigs
      fetch(`/api/my/posted`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Applications to my gigs
      fetch(`/api/applications/received`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Analytics
      fetch(`/api/analytics/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Trending influencers for discovery
      fetch(`/api/analytics/trending-influencers`).then(r => r.json()),
      
      // Credit balance
      fetch(`/api/credit/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Brand reputation
      fetch(`/api/reputation/${user.id}`).then(r => r.json())
    ]);

    setDashboardData({
      activeGigs: activeGigs.data,
      applications: applications.data,
      analytics: analytics.data,
      trendingInfluencers: influencerSearch.data,
      credits: credits.data,
      reputation: reputation.data
    });
  };

  return (
    <div className="brand-dashboard">
      <DashboardHeader title="Brand Dashboard" user={user} />
      
      {/* Brand Metrics */}
      <div className="metrics-grid">
        <MetricCard 
          title="Active Campaigns" 
          value={dashboardData?.activeGigs?.length || 0}
          icon="📢"
        />
        <MetricCard 
          title="Total Applications" 
          value={dashboardData?.applications?.length || 0}
          icon="📨"
        />
        <MetricCard 
          title="Successful Collaborations" 
          value={dashboardData?.analytics?.completedGigs || 0}
          icon="🤝"
        />
        <MetricCard 
          title="Brand Score" 
          value={dashboardData?.reputation?.totalScore || 0}
          icon="⭐"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-section large">
          <h3>📊 Campaign Performance</h3>
          <CampaignAnalyticsChart data={dashboardData?.analytics} />
        </div>
        
        <div className="dashboard-section">
          <h3>📨 Recent Applications</h3>
          <ApplicationsList applications={dashboardData?.applications} />
        </div>
        
        <div className="dashboard-section">
          <h3>🔥 Trending Influencers</h3>
          <TrendingInfluencersList influencers={dashboardData?.trendingInfluencers} />
        </div>
        
        <div className="dashboard-section">
          <h3>💼 Active Campaigns</h3>
          <ActiveCampaignsList gigs={dashboardData?.activeGigs} />
        </div>
      </div>

      {/* Quick Actions for Brands */}
      <div className="quick-actions">
        <QuickActionButton href="/gigs/create" icon="➕" label="Create Campaign" />
        <QuickActionButton href="/influencers/search" icon="🔍" label="Find Influencers" />
        <QuickActionButton href="/analytics" icon="📊" label="View Analytics" />
        <QuickActionButton href="/credits/purchase" icon="💳" label="Buy Credits" />
      </div>
    </div>
  );
};
```

### **Brand-Specific Components**

```typescript
// Application Management Component
const ApplicationsList: React.FC<{ applications: any[] }> = ({ applications }) => {
  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject') => {
    try {
      await fetch(`/api/applications/${applicationId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Refresh applications list
    } catch (error) {
      console.error(`Failed to ${action} application:`, error);
    }
  };

  return (
    <div className="applications-list">
      {applications?.map(app => (
        <div key={app.id} className="application-item">
          <div className="applicant-info">
            <img src={app.applicant.avatar} alt={app.applicant.name} />
            <div>
              <h4>{app.applicant.name}</h4>
              <p>Reputation: {app.applicant.reputationScore}</p>
              <p>Followers: {app.applicant.totalFollowers}</p>
            </div>
          </div>
          <div className="application-message">
            <p>{app.message}</p>
          </div>
          <div className="application-actions">
            <button 
              className="accept-btn"
              onClick={() => handleApplicationAction(app.id, 'accept')}
            >
              Accept
            </button>
            <button 
              className="reject-btn"
              onClick={() => handleApplicationAction(app.id, 'reject')}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Influencer Discovery Component
const TrendingInfluencersList: React.FC<{ influencers: any[] }> = ({ influencers }) => {
  const sendCollaborationInvite = async (influencerId: string) => {
    // Implementation for sending collaboration invites
  };

  return (
    <div className="trending-influencers">
      {influencers?.map(influencer => (
        <div key={influencer.id} className="influencer-card">
          <img src={influencer.avatar} alt={influencer.name} />
          <h4>{influencer.name}</h4>
          <p>Niche: {influencer.primaryNiche}</p>
          <p>Followers: {influencer.totalFollowers.toLocaleString()}</p>
          <p>Engagement: {influencer.avgEngagement}%</p>
          <button onClick={() => sendCollaborationInvite(influencer.id)}>
            Invite to Collaborate
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## 👥 **CLAN LEADER DASHBOARD**

### **Dashboard Overview**
```typescript
const ClanDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clanData, setClanData] = useState(null);

  const loadClanDashboardData = async () => {
    const [
      clanInfo,
      members,
      rankings,
      activities,
      invitations,
      projects
    ] = await Promise.all([
      // Clan basic info
      fetch(`/api/clan/${user.clanId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Clan members
      fetch(`/api/members/${user.clanId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Clan rankings
      fetch(`/api/rankings/clan/${user.clanId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Recent activities
      fetch(`/api/clan/${user.clanId}/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Pending invitations
      fetch(`/api/clan/${user.clanId}/invitations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Collaborative projects
      fetch(`/api/clan/${user.clanId}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json())
    ]);

    setClanData({
      clanInfo: clanInfo.data,
      members: members.data,
      rankings: rankings.data,
      activities: activities.data,
      invitations: invitations.data,
      projects: projects.data
    });
  };

  return (
    <div className="clan-dashboard">
      <DashboardHeader title={`${clanData?.clanInfo?.name} - Leadership Dashboard`} />
      
      {/* Clan Metrics */}
      <div className="metrics-grid">
        <MetricCard 
          title="Total Members" 
          value={clanData?.members?.length || 0}
          icon="👥"
        />
        <MetricCard 
          title="Clan Rank" 
          value={clanData?.rankings?.position || 'N/A'}
          icon="🏆"
        />
        <MetricCard 
          title="Active Projects" 
          value={clanData?.projects?.active?.length || 0}
          icon="🚀"
        />
        <MetricCard 
          title="Total Reputation" 
          value={clanData?.clanInfo?.totalReputation || 0}
          icon="⭐"
        />
      </div>

      {/* Clan Management Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>👥 Member Management</h3>
          <MemberManagementPanel members={clanData?.members} />
        </div>
        
        <div className="dashboard-section">
          <h3>📊 Clan Performance</h3>
          <ClanPerformanceChart data={clanData?.rankings} />
        </div>
        
        <div className="dashboard-section">
          <h3>💌 Pending Invitations</h3>
          <InvitationsList invitations={clanData?.invitations} />
        </div>
        
        <div className="dashboard-section">
          <h3>🔄 Recent Activities</h3>
          <ActivityFeed activities={clanData?.activities} />
        </div>
      </div>

      {/* Clan Leader Actions */}
      <div className="quick-actions">
        <QuickActionButton href="/clan/invite" icon="➕" label="Invite Members" />
        <QuickActionButton href="/clan/projects/create" icon="🚀" label="Start Project" />
        <QuickActionButton href="/clan/settings" icon="⚙️" label="Clan Settings" />
        <QuickActionButton href="/clan/analytics" icon="📈" label="View Analytics" />
      </div>
    </div>
  );
};
```

---

## ⚡ **SUPER ADMIN DASHBOARD**

### **System Overview Dashboard**
```typescript
const AdminDashboard: React.FC = () => {
  const [systemData, setSystemData] = useState(null);

  const loadAdminDashboardData = async () => {
    const [
      systemStats,
      userAnalytics,
      platformMetrics,
      recentActivities,
      systemHealth,
      moderationQueue
    ] = await Promise.all([
      // System-wide statistics
      fetch(`/api/admin/stats/system`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // User analytics
      fetch(`/api/admin/analytics/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Platform metrics
      fetch(`/api/admin/metrics/platform`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Recent platform activities
      fetch(`/api/admin/activities/recent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // System health checks
      fetch(`/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      
      // Content moderation queue
      fetch(`/api/admin/moderation/queue`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json())
    ]);

    setSystemData({
      systemStats: systemStats.data,
      userAnalytics: userAnalytics.data,
      platformMetrics: platformMetrics.data,
      recentActivities: recentActivities.data,
      systemHealth: systemHealth,
      moderationQueue: moderationQueue.data
    });
  };

  return (
    <div className="admin-dashboard">
      <DashboardHeader title="System Administration Dashboard" />
      
      {/* System Health Indicators */}
      <div className="system-health-bar">
        <SystemHealthIndicator services={systemData?.systemHealth?.services} />
      </div>

      {/* Admin Metrics */}
      <div className="metrics-grid">
        <MetricCard 
          title="Total Users" 
          value={systemData?.systemStats?.totalUsers || 0}
          icon="👤"
          trend={systemData?.userAnalytics?.growth}
        />
        <MetricCard 
          title="Active Gigs" 
          value={systemData?.platformMetrics?.activeGigs || 0}
          icon="💼"
        />
        <MetricCard 
          title="Revenue (24h)" 
          value={`$${systemData?.platformMetrics?.dailyRevenue || 0}`}
          icon="💰"
        />
        <MetricCard 
          title="Pending Moderation" 
          value={systemData?.moderationQueue?.length || 0}
          icon="⚠️"
          urgent={systemData?.moderationQueue?.length > 10}
        />
      </div>

      {/* Admin Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-section large">
          <h3>📊 Platform Analytics</h3>
          <PlatformAnalyticsChart data={systemData?.platformMetrics} />
        </div>
        
        <div className="dashboard-section">
          <h3>⚠️ Moderation Queue</h3>
          <ModerationQueue items={systemData?.moderationQueue} />
        </div>
        
        <div className="dashboard-section">
          <h3>👥 User Management</h3>
          <RecentUserActions data={systemData?.recentActivities} />
        </div>
        
        <div className="dashboard-section">
          <h3>🔧 System Status</h3>
          <SystemStatusPanel health={systemData?.systemHealth} />
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="quick-actions">
        <QuickActionButton href="/admin/users" icon="👤" label="Manage Users" />
        <QuickActionButton href="/admin/content" icon="📝" label="Content Moderation" />
        <QuickActionButton href="/admin/analytics" icon="📊" label="Full Analytics" />
        <QuickActionButton href="/admin/settings" icon="⚙️" label="System Settings" />
      </div>
    </div>
  );
};
```

---

## 🔐 **ROLE-BASED ACCESS CONTROL (RBAC)**

### **Permission Management System**
```typescript
// Define permissions for each role
const ROLE_PERMISSIONS = {
  creator: [
    'gig.apply',
    'gig.view',
    'profile.edit',
    'portfolio.manage',
    'social.link',
    'notifications.manage'
  ],
  brand: [
    'gig.create',
    'gig.edit',
    'gig.delete',
    'applications.manage',
    'influencer.search',
    'analytics.view'
  ],
  clan_leader: [
    'clan.manage',
    'members.invite',
    'members.remove',
    'projects.create',
    'clan.settings'
  ],
  super_admin: [
    'users.manage',
    'content.moderate',
    'system.configure',
    'analytics.full',
    'platform.control'
  ]
};

// Permission checking hook
const usePermissions = () => {
  const { user, roles } = useAuth();
  
  const hasPermission = (permission: string) => {
    return roles.some(role => 
      ROLE_PERMISSIONS[role]?.includes(permission)
    );
  };
  
  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some(permission => hasPermission(permission));
  };
  
  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every(permission => hasPermission(permission));
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};

// Permission-based component rendering
const ProtectedComponent: React.FC<{
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, children, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback || <div>Access Denied</div>}</>;
};
```

### **Dynamic Navigation Based on Roles**
```typescript
const DynamicNavigation: React.FC = () => {
  const { userType, roles } = useAuth();
  const { hasPermission } = usePermissions();
  
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' }
    ];
    
    // Creator-specific navigation
    if (userType === 'creator') {
      baseItems.push(
        { path: '/gigs/browse', label: 'Browse Gigs', icon: '🔍' },
        { path: '/my/applications', label: 'My Applications', icon: '📨' },
        { path: '/portfolio', label: 'Portfolio', icon: '📁' },
        { path: '/social-media', label: 'Social Media', icon: '📱' }
      );
    }
    
    // Brand-specific navigation
    if (userType === 'brand') {
      baseItems.push(
        { path: '/gigs/create', label: 'Create Campaign', icon: '➕' },
        { path: '/my/campaigns', label: 'My Campaigns', icon: '📢' },
        { path: '/influencers', label: 'Find Influencers', icon: '🔍' },
        { path: '/analytics', label: 'Analytics', icon: '📊' }
      );
    }
    
    // Clan leader navigation
    if (roles.includes('clan_leader')) {
      baseItems.push(
        { path: '/clan/manage', label: 'Manage Clan', icon: '👥' },
        { path: '/clan/projects', label: 'Projects', icon: '🚀' }
      );
    }
    
    // Admin navigation
    if (roles.includes('super_admin')) {
      baseItems.push(
        { path: '/admin/users', label: 'User Management', icon: '👤' },
        { path: '/admin/moderation', label: 'Moderation', icon: '⚠️' },
        { path: '/admin/system', label: 'System Settings', icon: '⚙️' }
      );
    }
    
    return baseItems;
  };
  
  return (
    <nav className="dashboard-navigation">
      {getNavigationItems().map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
```

---

## 📊 **SHARED COMPONENTS & UTILITIES**

### **Universal Dashboard Components**
```typescript
// Reusable metric card component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  trend?: number;
  urgent?: boolean;
}> = ({ title, value, icon, trend, urgent }) => {
  return (
    <div className={`metric-card ${urgent ? 'urgent' : ''}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <h3>{title}</h3>
        <div className="metric-value">{value}</div>
        {trend && (
          <div className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↗️' : '↘️'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

// Universal notification bell
const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount, getNotificationCounts } = useNotifications();
  
  useEffect(() => {
    getNotificationCounts(user.id);
    // Poll every 30 seconds
    const interval = setInterval(() => {
      getNotificationCounts(user.id);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user.id]);
  
  return (
    <div className="notification-bell">
      <button className="bell-button">
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
    </div>
  );
};

// Dashboard search component
const DashboardSearch: React.FC = () => {
  const { userType } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const getSearchPlaceholder = () => {
    switch (userType) {
      case 'creator': return 'Search gigs, opportunities...';
      case 'brand': return 'Search influencers, campaigns...';
      case 'clan_leader': return 'Search members, projects...';
      default: return 'Search...';
    }
  };
  
  return (
    <div className="dashboard-search">
      <input
        type="text"
        placeholder={getSearchPlaceholder()}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className="search-button">🔍</button>
    </div>
  );
};
```

---

## 🎨 **DASHBOARD STYLING & RESPONSIVE DESIGN**

### **CSS Framework for Dashboards**
```scss
// Dashboard layout variables
:root {
  --sidebar-width: 280px;
  --header-height: 70px;
  --primary-color: #6366f1;
  --secondary-color: #f8fafc;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}

// Dashboard layout
.dashboard-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--header-height) 1fr;
  grid-template-areas: 
    "sidebar header"
    "sidebar content";
  height: 100vh;
}

.dashboard-sidebar {
  grid-area: sidebar;
  background: var(--secondary-color);
  border-right: 1px solid #e2e8f0;
}

.dashboard-header {
  grid-area: header;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-content {
  grid-area: content;
  padding: 2rem;
  overflow-y: auto;
  background: #f8fafc;
}

// Responsive design
@media (max-width: 1024px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    grid-template-rows: var(--header-height) 1fr;
    grid-template-areas: 
      "header"
      "content";
  }
  
  .dashboard-sidebar {
    position: fixed;
    left: -100%;
    transition: left 0.3s ease;
    z-index: 1000;
    
    &.mobile-open {
      left: 0;
    }
  }
}

// Metrics grid
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &.urgent {
    border-left: 4px solid var(--danger-color);
  }
}

// Dashboard grid for sections
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.dashboard-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &.large {
    grid-column: span 2;
  }
  
  h3 {
    margin: 0 0 1rem 0;
    color: #374151;
    font-size: 1.125rem;
    font-weight: 600;
  }
}
```

---

## 🚀 **IMPLEMENTATION STEPS**

### **Phase 1: Authentication & Role Detection**
1. Implement authentication flow using Auth Service APIs
2. Create role detection logic
3. Set up protected routing based on user roles

### **Phase 2: Base Dashboard Components**
1. Create reusable dashboard layout components
2. Implement permission-based access control
3. Build shared components (MetricCard, NotificationBell, etc.)

### **Phase 3: Role-Specific Dashboards**
1. **Creator Dashboard**: Focus on gig management, social media, portfolio
2. **Brand Dashboard**: Emphasize campaign management, influencer discovery
3. **Clan Dashboard**: Member management, collaboration tools
4. **Admin Dashboard**: System monitoring, user management, analytics

### **Phase 4: Real-Time Features**
1. Implement WebSocket connections for real-time notifications
2. Add live data updates for metrics and activities
3. Create real-time collaboration features for clan projects

### **Phase 5: Advanced Analytics**
1. Integrate chart libraries (Chart.js, D3.js, or Recharts)
2. Create comprehensive analytics dashboards
3. Implement data export functionality

---

## 📈 **SUCCESS METRICS**

### **Dashboard Performance Metrics**
- **Load Time**: < 2 seconds for initial dashboard load
- **Real-Time Updates**: < 500ms notification delivery
- **Mobile Responsiveness**: 100% feature parity on mobile devices
- **User Engagement**: Track time spent in each dashboard section

### **Role-Specific KPIs**
- **Creators**: Gig application success rate, portfolio views
- **Brands**: Campaign completion rate, influencer discovery efficiency  
- **Clan Leaders**: Member engagement, project completion rate
- **Admins**: System health monitoring, moderation queue clearance

This comprehensive guide provides everything needed to build sophisticated, role-based dashboards using the 50BraIns backend APIs. Each dashboard is tailored to specific user needs while maintaining consistency and security across the platform.