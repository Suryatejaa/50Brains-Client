# 🎯 WebSocket Configuration for Gig Service Events

This document provides the complete configuration for real-time gig events using the WebSocket Gateway service.

## 🌐 **WebSocket Gateway Architecture**

### **Connection Details**
- **Gateway URL**: `ws://localhost:4000/ws?userId={userId}`
- **Protocol**: WebSocket over HTTP/HTTPS
- **Authentication**: User ID passed as query parameter
- **Reconnection**: Automatic with exponential backoff

### **Service Channels**
The gig service uses multiple specialized channels for different event types:

| Service | Channel Pattern | Description |
|---------|----------------|-------------|
| `gig` | `gig:{gigId}` | Main gig lifecycle events |
| `gig-applications` | `gig-applications:{gigId}` | Application-related events |
| `gig-work` | `gig-work:{gigId}` | Work submission events |
| `gig-milestones` | `gig-milestones:{gigId}` | Milestone tracking events |

## 📡 **Available Gig Events**

### **1. Gig Lifecycle Events**
```typescript
// Gig creation and management
'gig_created'           // New gig posted
'gig_updated'           // Gig details modified
'gig_deleted'           // Gig removed
'gig_status_changed'    // Status updated (OPEN, ASSIGNED, COMPLETED, etc.)
```

### **2. Application Events**
```typescript
// Application workflow
'application_submitted'  // New application received
'application_accepted'   // Application approved
'application_rejected'   // Application declined
'application_withdrawn'  // Application withdrawn by applicant
```

### **3. Work Events**
```typescript
// Work submission and review
'work_submitted'         // Work deliverables submitted
'work_approved'          // Work approved by client
'work_rejected'          // Work needs revision
```

### **4. Completion Events**
```typescript
// Project completion
'gig_completed'          // Gig finished successfully
'gig_cancelled'          // Gig cancelled/terminated
```

### **5. Milestone Events**
```typescript
// Milestone tracking
'milestone_created'      // New milestone added
'milestone_updated'      // Milestone details changed
'milestone_completed'    // Milestone finished
```

### **6. Payment & Dispute Events**
```typescript
// Financial and conflict resolution
'payment_released'       // Payment sent to creator
'dispute_created'        // Dispute filed
'dispute_resolved'       // Dispute settled
```

## 🔧 **Implementation Examples**

### **Basic Gig Event Listening**
```typescript
import { useGigWebSocket, GigEventTypes } from '@/hooks/useGigWebSocket';

function GigDetailsPage({ gigId, userId }) {
  const { isConnected, isSubscribed, on, error } = useGigWebSocket({
    userId,
    gigId,
    autoSubscribe: true
  });

  useEffect(() => {
    // Listen to application submissions
    const unsubscribe = on(GigEventTypes.APPLICATION_SUBMITTED, (data) => {
      console.log('New application received:', data);
      // Update UI, show notification, etc.
    });

    // Listen to work submissions
    const unsubscribeWork = on(GigEventTypes.WORK_SUBMITTED, (data) => {
      console.log('Work submitted:', data);
      // Refresh work list, notify client, etc.
    });

    return () => {
      unsubscribe();
      unsubscribeWork();
    };
  }, [on]);

  if (error) {
    return <div>WebSocket Error: {error}</div>;
  }

  return (
    <div>
      <div>Connection: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
      <div>Subscribed: {isSubscribed ? '✅ Subscribed' : '❌ Not Subscribed'}</div>
      {/* Your gig details UI */}
    </div>
  );
}
```

### **Advanced Event Handling**
```typescript
function GigDashboard({ userId }) {
  const { subscribeToUserGigs, onAny, isSubscribed } = useGigWebSocket({
    userId,
    autoSubscribe: false // Manual subscription
  });

  useEffect(() => {
    // Subscribe to all gigs for the user
    subscribeToUserGigs();
  }, [subscribeToUserGigs]);

  useEffect(() => {
    if (isSubscribed) {
      // Listen to ALL gig events
      const unsubscribe = onAny((eventType, data) => {
        switch (eventType) {
          case 'gig_created':
            handleGigCreated(data);
            break;
          case 'application_submitted':
            handleNewApplication(data);
            break;
          case 'work_submitted':
            handleWorkSubmission(data);
            break;
          case 'gig_completed':
            handleGigCompletion(data);
            break;
          default:
            console.log('Unhandled gig event:', eventType, data);
        }
      });

      return unsubscribe;
    }
  }, [isSubscribed, onAny]);

  const handleGigCreated = (data) => {
    // Update gig list, show notification
    console.log('New gig created:', data.gigTitle);
  };

  const handleNewApplication = (data) => {
    // Update application count, show notification
    console.log('New application for gig:', data.gigTitle);
  };

  const handleWorkSubmission = (data) => {
    // Update work status, notify client
    console.log('Work submitted for gig:', data.gigTitle);
  };

  const handleGigCompletion = (data) => {
    // Update gig status, show completion message
    console.log('Gig completed:', data.gigTitle);
  };

  return (
    <div>
      <h1>Gig Dashboard</h1>
      {/* Your dashboard UI */}
    </div>
  );
}
```

### **Conditional Service Subscription**
```typescript
function GigManagementPage({ gigId, userId, userRole }) {
  const { subscribeToGig, on, isSubscribed } = useGigWebSocket({
    userId,
    gigId,
    autoSubscribe: false,
    enableApplications: userRole === 'brand', // Only brands see applications
    enableWork: true,                         // Everyone sees work
    enableMilestones: userRole === 'brand'    // Only brands manage milestones
  });

  useEffect(() => {
    if (gigId) {
      subscribeToGig();
    }
  }, [gigId, subscribeToGig]);

  useEffect(() => {
    if (isSubscribed) {
      // Different events based on user role
      if (userRole === 'brand') {
        // Brand-specific events
        const unsubscribe = on('application_submitted', (data) => {
          showNotification(`New application from ${data.applicantType}`);
        });
        return unsubscribe;
      } else {
        // Creator-specific events
        const unsubscribe = on('work_approved', (data) => {
          showNotification('Your work has been approved!');
        });
        return unsubscribe;
      }
    }
  }, [isSubscribed, on, userRole]);

  return (
    <div>
      <h1>Gig Management</h1>
      {/* Role-specific UI */}
    </div>
  );
}
```

## 📊 **Event Data Structures**

### **Gig Application Event**
```typescript
interface ApplicationSubmittedEvent {
  gigId: string;
  gigTitle: string;
  applicationId: string;
  applicantId: string;
  applicantType: 'user' | 'clan';
  quotedPrice?: number;
  estimatedTime?: string;
  timestamp: string;
}
```

### **Gig Work Event**
```typescript
interface WorkSubmittedEvent {
  gigId: string;
  gigTitle: string;
  workId: string;
  submitterId: string;
  submitterType: 'user' | 'clan';
  workType: 'deliverable' | 'milestone' | 'final';
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  timestamp: string;
}
```

### **Gig Milestone Event**
```typescript
interface MilestoneCreatedEvent {
  gigId: string;
  gigTitle: string;
  milestoneId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  timestamp: string;
}
```

## 🚀 **Performance Optimizations**

### **1. Selective Subscription**
```typescript
// Only subscribe to services you need
const { subscribeToGig } = useGigWebSocket({
  userId,
  gigId,
  enableApplications: false,  // Don't need application events
  enableWork: true,           // Need work events
  enableMilestones: false     // Don't need milestone events
});
```

### **2. Event Handler Cleanup**
```typescript
useEffect(() => {
  const unsubscribe = on('application_submitted', handleApplication);
  
  // Always return cleanup function
  return unsubscribe;
}, [on]);
```

### **3. Debounced Event Handling**
```typescript
import { debounce } from 'lodash';

const debouncedHandler = debounce((data) => {
  // Handle event with debouncing
  updateUI(data);
}, 300);

useEffect(() => {
  const unsubscribe = on('gig_updated', debouncedHandler);
  return () => {
    unsubscribe();
    debouncedHandler.cancel(); // Cancel pending debounced calls
  };
}, [on]);
```

## 🔒 **Security Considerations**

### **1. User Authentication**
- User ID is validated on the server side
- Events are filtered based on user permissions
- No sensitive data exposed in WebSocket messages

### **2. Channel Isolation**
- Users can only subscribe to gigs they have access to
- Brand users see their own gigs and applications
- Creator users see gigs they've applied to or are working on

### **3. Rate Limiting**
- WebSocket connections are rate-limited per user
- Event emission is throttled to prevent spam
- Automatic disconnection for abusive behavior

## 📱 **Mobile Considerations**

### **1. Connection Management**
```typescript
// Handle mobile app state changes
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // App in background - consider disconnecting
      console.log('App in background');
    } else {
      // App in foreground - ensure connection
      console.log('App in foreground');
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### **2. Battery Optimization**
- WebSocket reconnection logic respects battery state
- Automatic backoff for mobile devices
- Graceful degradation when connection is poor

## 🧪 **Testing & Debugging**

### **1. Event Logging**
```typescript
// Enable detailed logging in development
if (process.env.NODE_ENV === 'development') {
  const unsubscribe = onAny((eventType, data) => {
    console.log(`🎯 [DEV] Gig Event: ${eventType}`, data);
  });
  
  return unsubscribe;
}
```

### **2. Connection Monitoring**
```typescript
const { isConnected, isSubscribed, error } = useGigWebSocket({
  userId,
  gigId
});

// Monitor connection status
useEffect(() => {
  console.log('WebSocket Status:', {
    connected: isConnected,
    subscribed: isSubscribed,
    error: error
  });
}, [isConnected, isSubscribed, error]);
```

## 🔄 **Migration from Old System**

### **Before (Multiple WebSocket Connections)**
```typescript
// OLD: Separate connections for different services
const notificationWS = new WebSocket('ws://localhost:3000');
const clanChatWS = new WebSocket('ws://localhost:4003');
const gigWS = new WebSocket('ws://localhost:4004');
```

### **After (Unified WebSocket Gateway)**
```typescript
// NEW: Single connection with service subscriptions
const { subscribeToGig, on } = useGigWebSocket({
  userId,
  gigId,
  enableApplications: true,
  enableWork: true
});
```

This configuration provides a robust, scalable, and maintainable solution for real-time gig events while maintaining backward compatibility and performance.
