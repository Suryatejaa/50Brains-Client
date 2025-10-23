
## Context
I have a 50BraIns platform with 9 microservices. Currently using a shared dashboard for both Influencer and Crew roles. Need to separate into role-specific dashboards using existing APIs from Auth, User, Gig, Credit, Reputation, Social Media, Work History, Clan, and Notification services.

## Task Requirements

### 1. Edit Existing Influencer Dashboard
**File Location**: `frontend/src/pages/InfluencerDashboard.jsx` (or similar)

**Requirements**:
- Remove crew-specific elements (hourly rates, technical skills, equipment)
- Focus on content creator metrics: followers, engagement, campaigns
- Add content performance widgets using Social Media Service APIs
- Implement campaign management section using Gig Service APIs
- Add brand discovery recommendations
- Include earnings tracking from Work History Service

**Key APIs to Use**:
```javascript
// Profile data
GET /api/user/profile
GET /api/social-media/analytics/${userId}

// Campaign data  
GET /api/my/applications?status=ACCEPTED
GET /api/my/applications?status=PENDING
GET /api/my/applications?status=COMPLETED

// Performance data
GET /api/reputation/user/${userId}
GET /api/work-history/user/${userId}
GET /api/credit/wallet
GET /api/notifications?limit=5
```

### 2. Create New Crew Dashboard
**File Location**: `frontend/src/pages/CrewDashboard.jsx`

**Requirements**:
- Project management hub with active projects timeline
- Skills & equipment center displaying technical capabilities
- Business analytics showing revenue, utilization rates
- Professional portfolio showcase
- Client relationship tracking

**Key APIs to Use**:
```javascript
// Profile & skills
GET /api/user/profile (focus on crewSkills, experienceLevel, hourlyRate)

// Project data
GET /api/my/applications?status=ACCEPTED
GET /api/my/applications?status=PENDING  
GET /api/my/applications?status=COMPLETED
GET /api/gig?roleRequired=crew&limit=10

// Business metrics
GET /api/work-history/user/${userId}
GET /api/portfolio/user/${userId}
GET /api/credit/wallet
GET /api/clan/my-memberships
```

### 3. Dashboard Routing & Role Detection
**File Location**: `frontend/src/App.jsx` or routing file

**Requirements**:
- Implement role-based routing
- Redirect users to appropriate dashboard based on user.roles
- Protect routes with authentication middleware

```javascript
// Route structure needed
/dashboard/influencer  // For INFLUENCER role
/dashboard/crew       // For CREW role  
/dashboard/brand      // For BRAND role (existing)

// Role detection logic
if (user.roles === 'INFLUENCER') redirect('/dashboard/influencer')
else if (user.roles === 'CREW') redirect('/dashboard/crew')
else if (user.roles === 'BRAND') redirect('/dashboard/brand')
```

### 4. Dashboard Data Hooks
**File Location**: `frontend/src/hooks/useDashboardData.js`

**Requirements**:
- Create `useInfluencerDashboard(userId)` hook
- Create `useCrewDashboard(userId)` hook
- Implement parallel API calls with Promise.allSettled()
- Handle loading states and error scenarios
- Calculate derived metrics from API responses

**Key Metrics to Calculate**:

**Influencer Metrics**:
```javascript
const influencerMetrics = {
  contentMetrics: {
    totalFollowers: socialAnalytics.totalFollowers,
    avgEngagementRate: socialAnalytics.averageEngagement,
    monthlyReach: socialAnalytics.reachScore
  },
  campaignMetrics: {
    activeCollaborations: activeGigs.data.length,
    pendingApplications: pendingApplications.data.length,
    completedCampaigns: completedCampaigns.data.length,
    successRate: (completed.length / (completed.length + pending.length)) * 100
  },
  earningsMetrics: {
    monthlyEarnings: workHistory.monthlyEarnings,
    totalEarnings: workHistory.totalEarnings,
    avgGigPayment: calculateAverage(completedGigs, 'finalBudget')
  }
};
```

**Crew Metrics**:
```javascript
const crewMetrics = {
  projectMetrics: {
    activeProjects: activeProjects.data.length,
    pendingBids: pendingBids.data.length,
    completedProjects: completedProjects.data.length,
    avgProjectValue: calculateAverage(completedProjects, 'finalBudget')
  },
  skillMetrics: {
    totalSkills: profile.crewSkills.length,
    expertiseLevel: profile.experienceLevel,
    hourlyRate: profile.hourlyRate,
    equipmentCount: profile.equipmentOwned.length
  },
  businessMetrics: {
    monthlyRevenue: workHistory.monthlyRevenue,
    utilizationRate: (activeProjects.length / 5) * 100,
    clientRetentionRate: workHistory.repeatClientPercentage
  }
};
```

### 5. Dashboard Components

**Influencer Components Needed**:
- `ContentMetrics.jsx` - Follower growth, engagement charts
- `CampaignManager.jsx` - Active campaigns, applications timeline  
- `SocialAnalytics.jsx` - Platform performance, audience insights
- `BrandDiscovery.jsx` - Recommended gigs, brand matches
- `CreatorInsights.jsx` - Performance recommendations

**Crew Components Needed**:
- `ProjectMetrics.jsx` - Active projects, delivery timelines
- `SkillsCenter.jsx` - Technical skills, certifications, equipment
- `BusinessAnalytics.jsx` - Revenue trends, utilization charts
- `TechnicalPortfolio.jsx` - Work samples, client testimonials
- `OpportunityFinder.jsx` - Matching project recommendations

### 6. API Error Handling & Fallbacks

**Requirements**:
- Graceful degradation when services are unavailable
- Show partial dashboard data if some APIs fail
- Implement retry logic for critical endpoints
- Display meaningful error messages to users

```javascript
// Error handling pattern needed
const responses = await Promise.allSettled(apiCalls);
const safeData = responses.map(result => 
  result.status === 'fulfilled' ? result.value : null
);

// Provide fallback values
const dashboardData = {
  totalFollowers: socialAnalytics?.data?.totalFollowers || 0,
  activeProjects: activeProjects?.data?.length || 0,
  // ... with safe navigation
};
```

### 7. Dashboard Layout & Design

**Requirements**:
- Responsive grid layout for dashboard widgets
- Role-specific color schemes and icons
- Loading skeletons for better UX
- Empty states for new users
- Interactive charts and progress indicators

### 8. Navigation & User Experience

**Requirements**:
- Update main navigation to show role-appropriate dashboard link
- Add breadcrumbs showing current dashboard type
- Quick role switcher if user has multiple roles
- Dashboard customization options (widget ordering)

## Implementation Priority

1. **Phase 1**: Role-based routing and basic dashboard separation
2. **Phase 2**: Data fetching hooks with existing API integration  
3. **Phase 3**: Dashboard widgets and component implementation
4. **Phase 4**: Advanced features (recommendations, analytics)
5. **Phase 5**: Performance optimization and error handling

## Key Files to Reference

1. **Crew_Influencer_Dashboard_Doc.md** - Complete dashboard specifications
2. **Role_APIs.md** - All available API endpoints for each role

## Success Criteria

- ✅ Influencers see content-focused dashboard with social metrics
- ✅ Crew members see project-focused dashboard with technical metrics  
- ✅ Users automatically redirect to appropriate dashboard
- ✅ All dashboard data loads from existing microservice APIs
- ✅ No new backend services required
- ✅ Graceful error handling and loading states
- ✅ Responsive design works on mobile and desktop

Please implement this dashboard separation using the existing API endpoints and create role-specific user experiences that match each user type's workflow and goals.
