# 🏰 Clan Notifications Implementation Guide

This document outlines the implementation of real-time clan notifications using WebSocket channels for the GIG-CLAN workflow system.

## 🌐 **WebSocket Channel Structure**

### **Channel Naming Convention**
```
clan:{clanId}:{eventType}
```

### **Available Channels**

| Channel | Description | Subscribers | Payload Type |
|---------|-------------|-------------|--------------|
| `clan:{clanId}:gig_approved` | Gig application approved | All clan members | `ClanGigApprovedNotification` |
| `clan:{clanId}:milestone_created` | New milestone created | All clan members | `ClanMilestoneNotification` |
| `clan:{clanId}:milestone_approved` | Milestone approved | All clan members | `ClanMilestoneNotification` |
| `clan:{clanId}:member:{memberId}:task_assigned` | Task assigned to member | Specific member | `ClanTaskNotification` |
| `clan:{clanId}:member:{memberId}:task_updated` | Task status updated | Specific member | `ClanTaskNotification` |

## 🔧 **Implementation Components**

### **1. Type Definitions** (`types/notification.types.ts`)

```typescript
// Clan-specific notification interfaces
export interface ClanGigApprovedNotification {
    type: 'clan_gig_approved';
    data: {
        gigId: string;
        gigTitle: string;
        clanId: string;
        gigOwnerId: string;
        applicationId: string;
        memberCount: number;
        milestoneCount: number;
        totalAmount: number;
        assignedAt: string;
    };
}

export interface ClanMilestoneNotification {
    type: 'clan_milestone_created' | 'clan_milestone_approved';
    data: {
        gigId: string;
        gigTitle: string;
        milestoneId: string;
        milestoneTitle: string;
        milestoneAmount: number;
        clanId: string;
        dueAt?: string;
        deliverables?: string[];
        approvedAt?: string;
        feedback?: string;
        payoutSplit?: any;
        createdAt: string;
    };
}

export interface ClanTaskNotification {
    type: 'clan_task_assigned' | 'clan_task_status_updated';
    data: {
        gigId: string;
        gigTitle: string;
        taskId: string;
        taskTitle: string;
        taskDescription?: string;
        clanId: string;
        estimatedHours?: number;
        deliverables?: string[];
        dueDate?: string;
        milestoneId?: string;
        oldStatus?: string;
        newStatus?: string;
        createdAt: string;
    };
}

export type ClanWebSocketMessage = 
    | ClanGigApprovedNotification 
    | ClanMemberNotification 
    | ClanMilestoneNotification 
    | ClanTaskNotification;
```

### **2. API Client** (`lib/notification-api.ts`)

```typescript
// Subscribe to clan notification channels
export const subscribeToClanChannels = async (
    userId: string,
    clanIds: string[]
): Promise<{ success: boolean; message: string }> => {
    const channels = clanIds.flatMap(clanId => [
        `clan:${clanId}:gig_approved`,
        `clan:${clanId}:milestone_created`,
        `clan:${clanId}:milestone_approved`,
        `clan:${clanId}:member:${userId}:task_assigned`,
        `clan:${clanId}:member:${userId}:task_updated`
    ]);

    return apiClient.post('/api/notification/clan/subscribe', {
        userId,
        channels
    });
};

// Unsubscribe from clan channels
export const unsubscribeFromClanChannels = async (
    userId: string,
    clanIds: string[]
): Promise<{ success: boolean; message: string }> => {
    // Similar implementation for unsubscribing
};

// Test clan WebSocket connection
export const testClanWebSocketConnection = async (
    userId: string,
    clanId: string
): Promise<{ success: boolean; message: string }> => {
    // WebSocket connection test
};
```

### **3. Main Notifications Hook** (`hooks/useNotifications.ts`)

The main hook now includes clan notification handling:

```typescript
export function useNotifications(options: UseNotificationsOptions = {}) {
    // ... existing state ...
    
    // Clan notification state
    const [clanChannels, setClanChannels] = useState<string[]>([]);
    const [clanNotifications, setClanNotifications] = useState<ClanWebSocketMessage[]>([]);

    // Handle clan-specific WebSocket messages
    const handleWebSocketMessage = (data: any) => {
        if (data.type && data.type.startsWith('clan_')) {
            console.log('🏰 === CLAN NOTIFICATION MESSAGE ===');
            
            // Add to clan notifications
            setClanNotifications(prev => {
                const newNotification = data as ClanWebSocketMessage;
                // Check for duplicates and add
                return [newNotification, ...prev];
            });
            
            // Show browser notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                const title = getClanNotificationTitle(data);
                const message = getClanNotificationMessage(data);
                
                new Notification(title, {
                    body: message,
                    icon: '/favicon.ico',
                    tag: `clan-${data.type}-${data.data.clanId}`
                });
            }
            
            // Play notification sound and update counts
            playNotificationSound();
            setUnreadCount(prev => prev + 1);
            
            return; // Don't process as regular notification
        }
        
        // ... existing notification handling ...
    };

    // Helper functions for clan notifications
    const getClanNotificationTitle = useCallback((data: ClanWebSocketMessage): string => {
        // Return appropriate title based on notification type
    }, []);

    const getClanNotificationMessage = useCallback((data: ClanWebSocketMessage): string => {
        // Return appropriate message based on notification type
    }, []);

    return {
        // ... existing returns ...
        clanChannels,
        clanNotifications,
        subscribeToClanNotifications,
        unsubscribeFromClanNotifications,
        fetchClanNotificationChannels,
    };
}
```

### **4. Clan Notifications Hook** (`hooks/useClanNotifications.ts`)

A specialized hook for clan-specific notifications:

```typescript
export function useClanNotifications() {
    const { 
        clanChannels, 
        clanNotifications, 
        subscribeToClanNotifications, 
        unsubscribeFromClanNotifications,
        fetchClanNotificationChannels 
    } = useNotifications();
    
    const { clans: publicClans } = useClans();
    const { clans: myClans } = useMyClans();

    // Get all clan IDs the user is associated with
    const getUserClanIds = useCallback(() => {
        const allClans = [...(myClans || []), ...(publicClans || [])];
        return allClans.map(clan => clan.id);
    }, [myClans, publicClans]);

    // Subscribe to notifications for all user's clans
    const subscribeToUserClans = useCallback(async () => {
        const clanIds = getUserClanIds();
        if (clanIds.length > 0) {
            await subscribeToClanNotifications(clanIds);
        }
    }, [getUserClanIds, subscribeToClanNotifications]);

    // Auto-subscribe when clans change
    useEffect(() => {
        const clanIds = getUserClanIds();
        if (clanIds.length > 0) {
            subscribeToUserClans();
        }

        return () => {
            if (clanIds.length > 0) {
                unsubscribeFromClans(clanIds);
            }
        };
    }, [getUserClanIds, subscribeToUserClans, unsubscribeFromClans]);

    return {
        clanChannels,
        clanNotifications,
        subscribeToUserClans,
        unsubscribeFromClans,
        fetchClanNotificationChannels,
        getClanNotificationsByClan,
        getClanNotificationsByGig,
        getClanNotificationsByType,
        getUserClanIds,
        getUnreadClanNotificationCount,
        markClanNotificationProcessed,
        totalClanNotifications: clanNotifications.length,
        hasClanNotifications: clanNotifications.length > 0,
    };
}
```

### **5. Notification Center Component** (`components/clan/ClanNotificationCenter.tsx`)

A UI component for displaying clan notifications:

```typescript
export default function ClanNotificationCenter({ className = '', showBadge = true }) {
    const [isOpen, setIsOpen] = useState(false);
    const {
        clanNotifications,
        totalClanNotifications,
        hasClanNotifications,
        markClanNotificationProcessed
    } = useClanNotifications();

    const handleNotificationClick = (notification: ClanWebSocketMessage) => {
        // Mark as processed and navigate based on type
        markClanNotificationProcessed(notification.data.gigId);
        
        switch (notification.type) {
            case 'clan_gig_approved':
                window.location.href = `/clan/${notification.data.clanId}/gig-workflow?gigId=${notification.data.gigId}`;
                break;
            case 'clan_milestone_created':
            case 'clan_milestone_approved':
                window.location.href = `/clan/${notification.data.clanId}/gig-workflow?gigId=${notification.data.gigId}&tab=tasks`;
                break;
            // ... other cases
        }
        
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Notification Bell with Badge */}
            <button onClick={() => setIsOpen(!isOpen)}>
                <BellIcon className="h-6 w-6" />
                {showBadge && hasClanNotifications && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {totalClanNotifications > 9 ? '9+' : totalClanNotifications}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header, Notifications List, Footer */}
                </div>
            )}
        </div>
    );
}
```

## 🚀 **Usage Examples**

### **Basic Usage in Component**

```typescript
import { useClanNotifications } from '@/hooks/useClanNotifications';
import ClanNotificationCenter from '@/components/clan/ClanNotificationCenter';

export default function MyComponent() {
    const { 
        clanNotifications, 
        hasClanNotifications, 
        totalClanNotifications 
    } = useClanNotifications();

    return (
        <div>
            {/* Show notification count */}
            {hasClanNotifications && (
                <div className="text-red-600">
                    {totalClanNotifications} new clan notifications
                </div>
            )}

            {/* Notification center */}
            <ClanNotificationCenter />

            {/* List notifications */}
            {clanNotifications.map((notification, index) => (
                <div key={index}>
                    {notification.type}: {notification.data.gigTitle}
                </div>
            ))}
        </div>
    );
}
```

### **Manual Subscription Management**

```typescript
import { useClanNotifications } from '@/hooks/useClanNotifications';

export default function ClanManager() {
    const { 
        subscribeToUserClans, 
        unsubscribeFromClans,
        getUserClanIds 
    } = useClanNotifications();

    const handleJoinClan = async (clanId: string) => {
        // After joining clan, subscribe to notifications
        await subscribeToUserClans();
    };

    const handleLeaveClan = async (clanId: string) => {
        // Before leaving clan, unsubscribe from notifications
        await unsubscribeFromClans([clanId]);
    };

    return (
        <div>
            <button onClick={subscribeToUserClans}>
                Subscribe to All Clans
            </button>
            <button onClick={() => unsubscribeFromClans(getUserClanIds())}>
                Unsubscribe from All Clans
            </button>
        </div>
    );
}
```

## 🧪 **Testing**

### **Test Page**
Visit `/testing/clan-notifications` to test the system:

- **ClanNotificationCenter**: Live notification display
- **ClanNotificationDebugger**: Connection testing and debugging
- **WebSocket Testing**: Test clan WebSocket connections
- **Notification Simulation**: Simulate clan notifications

### **Debug Features**
- Real-time connection status
- Active clan channels
- Received notifications
- WebSocket message handling
- Manual subscription/unsubscription

## 🔌 **Backend Integration**

### **WebSocket Endpoints**
The system expects these backend endpoints:

- `POST /api/notification/clan/subscribe` - Subscribe to clan channels
- `POST /api/notification/clan/unsubscribe` - Unsubscribe from clan channels
- `GET /api/notification/clan/channels/:userId` - Get user's clan channels
- `WS /api/notifications/clan/ws` - Clan WebSocket connection

### **Message Format**
Backend should send messages in this format:

```json
{
  "type": "clan_gig_approved",
  "data": {
    "gigId": "string",
    "gigTitle": "string",
    "clanId": "string",
    "gigOwnerId": "string",
    "applicationId": "string",
    "memberCount": 3,
    "milestoneCount": 2,
    "totalAmount": 5000,
    "assignedAt": "2025-08-13T13:16:52.437Z",
    "createdAt": "2025-08-13T13:16:52.437Z"
  }
}
```

## 📱 **Mobile Optimization**

The notification system is fully responsive and mobile-optimized:

- Touch-friendly notification bell
- Responsive notification panel
- Mobile-optimized typography and spacing
- Swipe gestures for mobile interaction
- Adaptive badge positioning

## 🔒 **Security Considerations**

- User authentication required for channel subscription
- Clan membership validation
- WebSocket connection authentication
- Rate limiting for subscription requests
- Secure channel naming to prevent channel hijacking

## 🚀 **Next Steps**

1. **Backend Implementation**: Implement the required WebSocket endpoints
2. **Event Publishing**: Set up RabbitMQ events for clan activities
3. **Testing**: Test with real clan workflows
4. **Performance**: Monitor WebSocket connection performance
5. **Analytics**: Track notification engagement metrics

This implementation provides a robust, real-time notification system for the GIG-CLAN workflow, ensuring team members stay informed of all important activities and updates! 🎉
