I'll provide you with all the Brand-related APIs across all services. Let me search through the codebase to find all Brand-specific routes and general routes that Brands can access. Now let me search for more specific brand-related APIs across different services: Now let me search for other services that brands can access: Summarized conversation historyBased on the comprehensive search across the entire 50BraIns ecosystem, I can now provide the complete Brand API documentation you requested:

# 🏢 Complete Brand API Documentation - 50BraIns Platform

Here's the comprehensive list of **ALL Brand APIs** across the entire 50BraIns ecosystem with JSON request/response examples:

## 📡 **API GATEWAY (Port 3000)**
Base URL: `http://localhost:3000`


### **GET /api/auth/profile** (Protected)
Get brand profile

```json
// Response
{
  "success": true,
  "data": {
    "id": "brand_123",
    "email": "john@brandcompany.com",
    "roles": "BRAND",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "Brand Company Inc",
    "industry": "Technology",
    "companyType": "CORPORATION",
    "isVerified": false,
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

---

## 👤 **2. USER SERVICE APIs**

### **GET /api/user/profile** (Protected)
Get brand's own profile

```json
// Response
{
  "success": true,
  "data": {
    "id": "brand_123",
    "email": "john@brandcompany.com",
    "roles": "BRAND",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "Brand Company Inc",
    "industry": "Technology",
    "website": "https://brandcompany.com",
    "bio": "Leading technology solutions provider",
    "profileViews": 245,
    "isVerified": false,
    "analytics": {
      "profileScore": 85,
      "completionPercentage": 90
    }
  }
}
```

### **PUT /api/user/profile** (Protected)
Update brand profile

```json
// Request Body
{
  "bio": "Updated company description",
  "website": "https://newbrandsite.com",
  "location": "San Francisco, CA",
  "targetAudience": ["Tech Professionals", "Startups"]
}

// Response
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "brand_123",
    "bio": "Updated company description",
    "website": "https://newbrandsite.com",
    "location": "San Francisco, CA",
    "updatedAt": "2025-01-01T12:00:00Z"
  }
}
```

### **GET /api/user/search** (Public/Protected)
Search for brands and influencers

```json
// Query Parameters: ?role=BRAND&industry=Technology&verified=true&limit=10

// Response
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "brand_123",
        "firstName": "John",
        "lastName": "Doe",
        "companyName": "Brand Company Inc",
        "industry": "Technology",
        "roles": "BRAND",
        "isVerified": true,
        "profileViews": 245,
        "analytics": {
          "profileScore": 85
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### **GET /api/user/:userId** (Public)
Get public brand profile

```json
// Response
{
  "success": true,
  "data": {
    "id": "brand_123",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "Brand Company Inc",
    "industry": "Technology",
    "bio": "Leading technology solutions provider",
    "website": "https://brandcompany.com",
    "isVerified": true,
    "profileViews": 245,
    "memberSince": "2024-01-01",
    "stats": {
      "totalGigs": 25,
      "activeGigs": 5,
      "completedGigs": 20,
      "avgRating": 4.8
    }
  }
}
```

---

## 💼 **3. GIG SERVICE APIs**

### **POST /api/gig** (Protected - Brand Only)
Create new gig posting

```json
// Request Body
{
  "title": "Tech Product Launch Campaign",
  "description": "Looking for tech influencers to promote our new AI tool",
  "category": "Technology",
  "subcategory": "AI/ML",
  "budget": 5000,
  "budgetType": "FIXED",
  "requirements": [
    "Tech-focused content creator",
    "Minimum 10K followers",
    "Previous tech campaigns"
  ],
  "deliverables": [
    "3 Instagram posts",
    "1 YouTube video",
    "Story series"
  ],
  "deadline": "2025-02-15T00:00:00Z",
  "applicationDeadline": "2025-01-30T00:00:00Z",
  "maxApplications": 50,
  "preferredPlatforms": ["Instagram", "YouTube"],
  "targetAudience": ["Tech Professionals", "Students"],
  "campaignObjectives": ["Brand Awareness", "Product Launch"]
}

// Response
{
  "success": true,
  "message": "Gig posted successfully",
  "data": {
    "id": "gig_789",
    "title": "Tech Product Launch Campaign",
    "status": "ACTIVE",
    "budget": 5000,
    "createdAt": "2025-01-01T10:00:00Z",
    "deadline": "2025-02-15T00:00:00Z",
    "applicationsCount": 0,
    "viewsCount": 0
  }
}
```

### **GET /api/gig/my/posted** (Protected - Brand Only)
Get brand's posted gigs

```json
// Query Parameters: ?status=ACTIVE&page=1&limit=10

// Response
{
  "success": true,
  "data": {
    "gigs": [
      {
        "id": "gig_789",
        "title": "Tech Product Launch Campaign",
        "status": "ACTIVE",
        "budget": 5000,
        "category": "Technology",
        "createdAt": "2025-01-01T10:00:00Z",
        "deadline": "2025-02-15T00:00:00Z",
        "applicationsCount": 12,
        "acceptedCount": 3,
        "viewsCount": 156
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    },
    "stats": {
      "totalGigs": 25,
      "activeGigs": 5,
      "completedGigs": 20,
      "totalBudget": 125000
    }
  }
}
```

### **GET /api/gig/:gigId/applications** (Protected - Brand Only)
Get applications for brand's gig

```json
// Response
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app_456",
        "gigId": "gig_789",
        "applicantId": "influencer_321",
        "status": "PENDING",
        "proposedBudget": 4800,
        "coverLetter": "I'm excited to promote your AI tool...",
        "portfolio": [
          {
            "title": "Previous Tech Campaign",
            "url": "https://instagram.com/p/example",
            "metrics": {
              "views": 50000,
              "engagement": 4.2
            }
          }
        ],
        "applicant": {
          "id": "influencer_321",
          "firstName": "Jane",
          "lastName": "Smith",
          "primaryPlatform": "Instagram",
          "followers": 25000,
          "avgEngagement": 4.5,
          "niche": "Technology"
        },
        "appliedAt": "2025-01-05T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10
    }
  }
}
```

### **POST /api/gig/applications/:applicationId/accept** (Protected - Brand Only)
Accept influencer application

```json
// Request Body
{
  "finalBudget": 4800,
  "notes": "Looking forward to working with you!",
  "additionalTerms": [
    "Content approval required before posting",
    "Usage rights for 6 months"
  ]
}

// Response
{
  "success": true,
  "message": "Application accepted successfully",
  "data": {
    "applicationId": "app_456",
    "status": "ACCEPTED",
    "finalBudget": 4800,
    "contractId": "contract_789",
    "acceptedAt": "2025-01-06T10:00:00Z"
  }
}
```

### **POST /api/gig/applications/:applicationId/reject** (Protected - Brand Only)
Reject influencer application

```json
// Request Body
{
  "reason": "Budget mismatch",
  "feedback": "Great portfolio, but looking for different audience size"
}

// Response
{
  "success": true,
  "message": "Application rejected",
  "data": {
    "applicationId": "app_456",
    "status": "REJECTED",
    "rejectedAt": "2025-01-06T10:00:00Z"
  }
}
```

### **GET /api/gig/:gigId/submissions** (Protected - Brand Only)
Get work submissions for gig

```json
// Response
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "sub_123",
        "gigId": "gig_789",
        "influencerId": "influencer_321",
        "status": "PENDING_REVIEW",
        "submittedAt": "2025-01-20T15:00:00Z",
        "deliverables": [
          {
            "type": "Instagram Post",
            "url": "https://instagram.com/p/campaign-post",
            "description": "Main campaign post",
            "metrics": {
              "views": 15000,
              "likes": 1200,
              "comments": 85
            }
          }
        ],
        "influencerNotes": "Campaign performed better than expected!",
        "influencer": {
          "firstName": "Jane",
          "lastName": "Smith",
          "primaryPlatform": "Instagram"
        }
      }
    ]
  }
}
```

### **POST /api/gig/submissions/:submissionId/approve** (Protected - Brand Only)
Approve work submission

```json
// Request Body
{
  "rating": 5,
  "feedback": "Excellent work! Great engagement numbers.",
  "bonusAmount": 500
}

// Response
{
  "success": true,
  "message": "Submission approved successfully",
  "data": {
    "submissionId": "sub_123",
    "status": "APPROVED",
    "rating": 5,
    "totalPayout": 5300,
    "approvedAt": "2025-01-21T10:00:00Z"
  }
}
```

---

## 💳 **4. CREDIT SERVICE APIs**

### **GET /api/credit/wallet** (Protected)
Get brand's credit wallet

```json
// Response
{
  "success": true,
  "data": {
    "walletId": "wallet_brand_123",
    "balance": 2500,
    "totalPurchased": 5000,
    "totalSpent": 2500,
    "currency": "INR",
    "lastUpdated": "2025-01-01T12:00:00Z"
  }
}
```

### **POST /api/credit/purchase** (Protected)
Purchase credits for campaigns

```json
// Request Body
{
  "packageId": "pkg_1000",
  "amount": 1000,
  "paymentMethod": "RAZORPAY"
}

// Response
{
  "success": true,
  "message": "Payment order created",
  "data": {
    "orderId": "order_xyz789",
    "amount": 1000,
    "currency": "INR",
    "paymentGateway": "RAZORPAY",
    "razorpayOrderId": "order_razorpay_123"
  }
}
```

### **POST /api/credit/boost/profile** (Protected)
Boost brand profile visibility

```json
// Request Body
{
  "duration": 48
}

// Response
{
  "success": true,
  "message": "Profile boosted successfully",
  "data": {
    "boostId": "boost_456",
    "creditsSpent": 50,
    "remainingBalance": 2450,
    "boostUntil": "2025-01-03T10:00:00Z",
    "externalServiceApplied": true
  }
}
```

### **POST /api/credit/boost/gig** (Protected)
Boost specific gig visibility

```json
// Request Body
{
  "gigId": "gig_789",
  "duration": 24
}

// Response
{
  "success": true,
  "message": "Gig boosted successfully",
  "data": {
    "boostId": "boost_789",
    "gigId": "gig_789",
    "creditsSpent": 100,
    "remainingBalance": 2350,
    "boostUntil": "2025-01-02T10:00:00Z"
  }
}
```

---

## 🏆 **5. REPUTATION SERVICE APIs**

### **GET /api/reputation/user/:userId** (Protected)
Get brand reputation score

```json
// Response
{
  "success": true,
  "data": {
    "userId": "brand_123",
    "overallScore": 850,
    "tier": "GOLD",
    "rank": 45,
    "scores": {
      "reliability": 92,
      "communication": 88,
      "paymentHistory": 95,
      "projectQuality": 85
    },
    "badges": [
      {
        "id": "reliable_partner",
        "name": "Reliable Partner",
        "description": "Consistently delivers on commitments",
        "earnedAt": "2024-12-15T10:00:00Z"
      }
    ],
    "recentActivity": [
      {
        "type": "GIG_COMPLETED",
        "score": +15,
        "description": "Successfully completed tech campaign",
        "date": "2025-01-01T10:00:00Z"
      }
    ]
  }
}
```

### **GET /api/reputation/leaderboard** (Public)
Get brand leaderboard

```json
// Query Parameters: ?role=BRAND&category=Technology&limit=20

// Response
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "brand_456",
        "companyName": "Tech Leader Inc",
        "overallScore": 950,
        "tier": "PLATINUM",
        "industry": "Technology",
        "completedGigs": 45
      },
      {
        "rank": 2,
        "userId": "brand_123",
        "companyName": "Brand Company Inc",
        "overallScore": 850,
        "tier": "GOLD",
        "industry": "Technology",
        "completedGigs": 20
      }
    ],
    "userRank": {
      "currentUser": "brand_123",
      "rank": 2,
      "score": 850
    }
  }
}
```

---

## 📊 **6. SOCIAL MEDIA SERVICE APIs**

### **POST /api/social-media/analytics/connect** (Protected)
Connect brand's social media accounts

```json
// Request Body
{
  "platform": "INSTAGRAM",
  "accessToken": "instagram_access_token",
  "accountId": "@brandcompany"
}

// Response
{
  "success": true,
  "message": "Instagram account connected successfully",
  "data": {
    "connectionId": "conn_456",
    "platform": "INSTAGRAM",
    "accountId": "@brandcompany",
    "connectedAt": "2025-01-01T10:00:00Z",
    "isActive": true
  }
}
```

### **GET /api/social-media/analytics/dashboard** (Protected)
Get brand's social media analytics

```json
// Response
{
  "success": true,
  "data": {
    "summary": {
      "totalFollowers": 125000,
      "totalEngagement": 4.2,
      "reachThisMonth": 890000,
      "mentionsThisMonth": 156
    },
    "platforms": {
      "INSTAGRAM": {
        "followers": 85000,
        "posts": 245,
        "avgEngagement": 4.5,
        "reachThisMonth": 560000
      },
      "TWITTER": {
        "followers": 40000,
        "tweets": 1200,
        "avgEngagement": 3.8,
        "reachThisMonth": 330000
      }
    },
    "campaigns": [
      {
        "id": "campaign_123",
        "name": "Product Launch",
        "reach": 45000,
        "engagement": 1890,
        "mentions": 23,
        "sentiment": 0.8
      }
    ]
  }
}
```

---

## 📈 **7. WORK HISTORY SERVICE APIs**

### **GET /api/work-history/brand/:brandId** (Protected)
Get brand's collaboration history

```json
// Response
{
  "success": true,
  "data": {
    "collaborations": [
      {
        "id": "collab_456",
        "gigId": "gig_789",
        "influencerId": "influencer_321",
        "projectTitle": "Tech Product Launch Campaign",
        "status": "COMPLETED",
        "budget": 5000,
        "startDate": "2025-01-01T00:00:00Z",
        "endDate": "2025-01-20T00:00:00Z",
        "rating": 5,
        "feedback": "Excellent collaboration",
        "deliverables": [
          {
            "type": "Instagram Post",
            "url": "https://instagram.com/p/campaign",
            "metrics": {
              "views": 50000,
              "engagement": 4.2
            }
          }
        ],
        "influencer": {
          "firstName": "Jane",
          "lastName": "Smith",
          "primaryPlatform": "Instagram"
        }
      }
    ],
    "stats": {
      "totalCollaborations": 25,
      "successfulProjects": 23,
      "avgRating": 4.8,
      "totalSpent": 125000,
      "repeatCollaborators": 8
    }
  }
}
```

### **POST /api/work-history/portfolio** (Protected)
Add collaboration to brand portfolio

```json
// Request Body
{
  "gigId": "gig_789",
  "title": "Successful Tech Campaign",
  "description": "AI tool launch with 500% ROI increase",
  "category": "Technology",
  "results": {
    "reach": 500000,
    "engagement": 4.5,
    "conversions": 1250,
    "roi": 500
  },
  "mediaUrls": [
    "https://example.com/campaign-video.mp4",
    "https://example.com/results-image.jpg"
  ],
  "isPublic": true
}

// Response
{
  "success": true,
  "message": "Portfolio item added successfully",
  "data": {
    "portfolioId": "portfolio_789",
    "title": "Successful Tech Campaign",
    "category": "Technology",
    "addedAt": "2025-01-01T10:00:00Z"
  }
}
```

---

## 🏰 **8. CLAN SERVICE APIs**

### **GET /api/clan/search** (Public)
Search for clans to collaborate with

```json
// Query Parameters: ?category=Technology&skills=AI&location=SF&verified=true

// Response
{
  "success": true,
  "data": {
    "clans": [
      {
        "id": "clan_456",
        "name": "Tech Creators Collective",
        "primaryCategory": "Technology",
        "memberCount": 12,
        "skills": ["AI", "Tech Reviews", "Programming"],
        "location": "San Francisco",
        "isVerified": true,
        "rating": 4.8,
        "completedProjects": 35,
        "portfolioHighlights": [
          {
            "title": "AI Startup Campaign",
            "reach": 200000,
            "engagement": 4.2
          }
        ]
      }
    ]
  }
}
```

### **GET /api/clan/:clanId** (Public)
Get detailed clan information

```json
// Response
{
  "success": true,
  "data": {
    "id": "clan_456",
    "name": "Tech Creators Collective",
    "description": "Elite group of tech content creators",
    "primaryCategory": "Technology",
    "skills": ["AI", "Tech Reviews", "Programming"],
    "memberCount": 12,
    "isVerified": true,
    "location": "San Francisco",
    "rating": 4.8,
    "members": [
      {
        "id": "influencer_321",
        "firstName": "Jane",
        "lastName": "Smith",
        "role": "Tech Reviewer",
        "followers": 25000,
        "specialties": ["AI", "Gadgets"]
      }
    ],
    "portfolio": [
      {
        "title": "AI Startup Campaign",
        "description": "Multi-platform campaign for AI tool",
        "results": {
          "reach": 200000,
          "engagement": 4.2,
          "conversions": 850
        }
      }
    ],
    "stats": {
      "totalProjects": 35,
      "successRate": 94,
      "avgProjectValue": 8500,
      "clientSatisfaction": 4.8
    }
  }
}
```

---

## 🔔 **9. NOTIFICATION SERVICE APIs**

### **GET /api/notifications** (Protected)
Get brand notifications

```json
// Response
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_789",
        "type": "NEW_APPLICATION",
        "title": "New Gig Application",
        "message": "Jane Smith applied to your Tech Campaign",
        "data": {
          "gigId": "gig_789",
          "applicationId": "app_456",
          "applicantName": "Jane Smith"
        },
        "isRead": false,
        "createdAt": "2025-01-05T14:30:00Z"
      },
      {
        "id": "notif_790",
        "type": "SUBMISSION_RECEIVED",
        "title": "Work Submission",
        "message": "Campaign deliverables submitted for review",
        "data": {
          "gigId": "gig_789",
          "submissionId": "sub_123"
        },
        "isRead": false,
        "createdAt": "2025-01-20T15:00:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

### **PUT /api/notifications/:notificationId/read** (Protected)
Mark notification as read

```json
// Response
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notificationId": "notif_789",
    "isRead": true,
    "readAt": "2025-01-06T10:00:00Z"
  }
}
```

---

## 📋 **COMMON ROUTES BETWEEN ALL ROLES**

### **Health Check (Public)**
```json
// GET /api/health
{
  "success": true,
  "service": "API Gateway",
  "timestamp": "2025-01-01T10:00:00Z",
  "uptime": 86400
}
```

### **File Upload (Protected)**
```json
// POST /api/upload
// Multipart form-data with file
{
  "success": true,
  "data": {
    "fileId": "file_123",
    "url": "https://cdn.50brains.com/uploads/file_123.jpg",
    "filename": "campaign-image.jpg",
    "size": 245760,
    "uploadedAt": "2025-01-01T10:00:00Z"
  }
}
```

---

## 🔐 **AUTHENTICATION & AUTHORIZATION**

### **Brand Route Protection**
- All `/api/gig/my/*` routes require Brand role
- All `/api/gig/applications/*` routes require Brand role
- All `/api/gig/submissions/*` routes require Brand role
- Credit purchase and boost endpoints require authentication
- Profile management requires authentication

### **Public Brand Routes**
- Brand search and discovery
- Public brand profiles
- Public gig listings
- Clan discovery
- Reputation leaderboards

---

This comprehensive API documentation covers **ALL Brand-related endpoints** across the entire 50BraIns platform ecosystem. Each service provides specific functionality for Brand users, from registration and profile management to gig posting, collaboration management, and analytics tracking.