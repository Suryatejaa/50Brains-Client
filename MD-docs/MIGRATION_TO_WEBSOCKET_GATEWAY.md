# 🚀 Migration to WebSocket Gateway

This guide helps you migrate from the old multiple WebSocket connections to the new unified WebSocket Gateway service.

## 📋 **What's Changing**

### **Before (Old System):**
- ❌ Multiple WebSocket connections (notifications, clan chat)
- ❌ Separate WebSocketManager for each service
- ❌ Complex connection management
- ❌ Port-specific URLs (3000, 4003)

### **After (New System):**
- ✅ Single WebSocket Gateway connection (port 4000)
- ✅ Unified service for all real-time features
- ✅ Simple connection management
- ✅ Centralized message routing

## 🔄 **Migration Steps**

### **Step 1: Update Clan Chat Component**

**Replace this in your clan page:**
```tsx
// OLD: Multiple WebSocket connections
import { ClanChat } from '../../components/ClanChat/ClanChat';

// NEW: Single WebSocket Gateway
import { ClanChatGateway } from '../../components/ClanChat/ClanChatGateway';
```

**Update the component usage:**
```tsx
// OLD
<ClanChat
  userId={user.id}
  clanId={clan.id}
  clanName={clan.name}
  memberDetails={memberDetails}
/>

// NEW
<ClanChatGateway
  userId={user.id}
  clanId={clan.id}
  clanName={clan.name}
  memberDetails={memberDetails}
/>
```

### **Step 2: Update Notification System**

**Replace old notification handling:**
```tsx
// OLD: Separate WebSocket for notifications
import { useWebSocket } from '../../hooks/useWebSocket';

// NEW: Unified WebSocket Gateway
import { NotificationHandler } from '../../components/NotificationHandler/NotificationHandler';
```

**Add to your layout:**
```tsx
// In your main layout or app component
import { NotificationHandler } from '../components/NotificationHandler/NotificationHandler';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const userId = 'your-user-id'; // Get from auth context

  return (
    <html>
      <body>
        <NotificationHandler userId={userId} />
        {children}
      </body>
    </html>
  );
}
```

### **Step 3: Environment Configuration**

**Create or update `.env.local`:**
```bash
# WebSocket Gateway Configuration
NEXT_PUBLIC_WEBSOCKET_GATEWAY_URL=ws://localhost:4000

# Service URLs (if needed)
NEXT_PUBLIC_CLAN_SERVICE_URL=http://localhost:4003
NEXT_PUBLIC_NOTIFICATION_SERVICE_URL=http://localhost:4001
```

### **Step 4: Remove Old WebSocket Code**

**Files to remove or replace:**
- `src/services/websocket/WebSocketManager.ts` → Replace with `websocket-gateway.service.ts`
- `src/services/clanChat/ClanChatService.ts` → Replace with new hook
- `src/hooks/useWebSocket.ts` → Replace with `useWebSocketGateway.ts`

## 🧪 **Testing the Migration**

### **1. Start WebSocket Gateway**
```bash
cd services/websocket-gateway
npm install
npm run dev
```

**Expected Output:**
```
🚀 WebSocket Gateway Service Started!
🔌 WebSocket: ws://localhost:4000/ws
✅ Connected to RabbitMQ
```

### **2. Test Connection**
Open browser console and look for:
```
🔌 Connecting to WebSocket Gateway: ws://localhost:4000/ws?userId=...
✅ Connected to WebSocket Gateway
🔔 Subscribed to notifications
🏛️ Subscribed to clan chat: [clan-id]
```

### **3. Test Chat Functionality**
- Navigate to a clan page
- Send a test message
- Check if message appears in chat
- Verify typing indicators work

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. Connection Failed**
```
❌ WebSocket Error: Connection failed
```
**Solution:** Ensure WebSocket Gateway is running on port 4000

#### **2. Messages Not Received**
```
📨 WebSocket Gateway received: [message]
```
**Check:** Verify message handlers are properly set up

#### **3. Subscription Errors**
```
❌ Failed to subscribe to clan chat
```
**Solution:** Check if userId and clanId are valid

### **Debug Commands:**
```typescript
// In browser console
const ws = document.querySelector('[data-websocket]');
console.log('WebSocket state:', ws?.readyState);
```

## 📱 **Usage Examples**

### **Basic Chat Usage:**
```tsx
import { useWebSocketGateway } from '../../hooks/useWebSocketGateway';

function MyChatComponent() {
  const { isConnected, sendChatMessage, subscribeToClanChat } = useWebSocketGateway({
    userId: 'user-123',
    gatewayUrl: 'ws://localhost:4000'
  });

  useEffect(() => {
    if (isConnected) {
      subscribeToClanChat('clan-456');
    }
  }, [isConnected]);

  const handleSend = () => {
    sendChatMessage('clan-456', 'Hello World!');
  };

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
}
```

### **Notification Handling:**
```tsx
import { NotificationHandler } from '../../components/NotificationHandler/NotificationHandler';

function App() {
  const handleNotification = (notification: any) => {
    console.log('New notification:', notification);
    // Show toast, update UI, etc.
  };

  return (
    <div>
      <NotificationHandler 
        userId="user-123" 
        onNotification={handleNotification} 
      />
      {/* Your app content */}
    </div>
  );
}
```

## 🎯 **Migration Checklist**

- [ ] WebSocket Gateway service running on port 4000
- [ ] Updated clan chat component to use `ClanChatGateway`
- [ ] Added `NotificationHandler` to main layout
- [ ] Environment variables configured
- [ ] Old WebSocket code removed/replaced
- [ ] Chat functionality tested
- [ ] Notifications working
- [ ] Connection status displayed correctly
- [ ] Error handling working
- [ ] Auto-reconnection tested

## 🚨 **Rollback Plan**

If issues arise, you can quickly rollback:

1. **Stop WebSocket Gateway**: `npm stop` in gateway directory
2. **Revert component changes**: Use git to restore old files
3. **Restore old WebSocket services**: Re-enable old WebSocketManager
4. **Test old functionality**: Verify everything works as before

## 📞 **Support**

If you encounter issues:

1. Check WebSocket Gateway logs
2. Verify all services are running
3. Test with HTML test client first
4. Check browser console for errors
5. Verify network connectivity

## 🎉 **Benefits After Migration**

1. **Simplified Architecture**: One WebSocket connection
2. **Better Performance**: Reduced connection overhead
3. **Easier Maintenance**: Single service to manage
4. **Scalable**: Easy to add new real-time features
5. **Reliable**: Built-in reconnection and error handling
6. **Type Safe**: Full TypeScript support

---

**Remember:** Test thoroughly in development before deploying to production. The WebSocket Gateway is designed to be a drop-in replacement for your existing WebSocket infrastructure.
