# 🔧 API Gateway WebSocket Proxy Fix

## **Problem Analysis**

From the console logs, I can see:
- ❌ **"Connection failed"** in the notification bell UI
- ❌ **WebSocket error: Event {isTrusted: true, type: 'error', target: WebSocket...}**
- ❌ **WebSocket disconnected: 1006** (abnormal closure)
- ❌ **WebSocket connection timeout, falling back to polling**

The issue is that your API Gateway doesn't have WebSocket proxy support configured.

## **Root Cause**

Your frontend is trying to connect to:
```
ws://localhost:3000/api/notifications/ws
```

But your API Gateway only has HTTP proxy middleware, not WebSocket proxy middleware.

## **Solution: Add WebSocket Proxy to API Gateway**

### **1. Install WebSocket Proxy Dependencies**

```bash
# In your API Gateway directory
npm install ws http-proxy-middleware
```

### **2. Update API Gateway Configuration**

**Find your API Gateway's main file** (usually `index.js`, `server.js`, or `app.js`) and add this WebSocket proxy code:

```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);

// WebSocket server for proxying
const wss = new WebSocket.Server({ noServer: true });

// WebSocket upgrade handler
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url;
  
  if (pathname.startsWith('/api/notifications/ws')) {
    // Extract userId from query params
    const url = new URL(request.url, `http://${request.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    console.log('🔌 WebSocket upgrade request:', pathname, 'for user:', userId);
    
    // Proxy to notification service
    const notificationServiceUrl = 'ws://localhost:4009';
    const proxyWs = new WebSocket(notificationServiceUrl);
    
    proxyWs.on('open', () => {
      console.log('✅ WebSocket proxy connected to notification service');
      
      // Upgrade the client connection
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
        
        // Forward messages between client and notification service
        ws.on('message', (message) => {
          console.log('📤 Client -> Notification Service:', message.toString());
          proxyWs.send(message);
        });
        
        proxyWs.on('message', (message) => {
          console.log('📥 Notification Service -> Client:', message.toString());
          ws.send(message);
        });
        
        ws.on('close', () => {
          console.log('🔌 Client WebSocket closed');
          proxyWs.close();
        });
        
        proxyWs.on('close', () => {
          console.log('🔌 Notification Service WebSocket closed');
          ws.close();
        });
      });
    });
    
    proxyWs.on('error', (error) => {
      console.error('❌ WebSocket proxy error:', error);
      socket.destroy();
    });
    
  } else {
    socket.destroy();
  }
});

// Existing HTTP proxy middleware
app.use('/api/notification', createProxyMiddleware({
  target: 'http://localhost:4009',
  changeOrigin: true,
  pathRewrite: {
    '^/api/notification': '/api/notification'
  }
}));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`🔌 WebSocket proxy available at ws://localhost:${PORT}/api/notifications/ws`);
});
```

### **3. Alternative: Simple WebSocket Proxy**

If you prefer a simpler approach, you can use a dedicated WebSocket proxy:

```javascript
// websocket-proxy.js
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, request) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const userId = url.searchParams.get('userId');
  
  console.log('🔌 Client connected:', userId);
  
  // Connect to notification service
  const notificationWs = new WebSocket(`ws://localhost:4009?userId=${userId}`);
  
  notificationWs.on('open', () => {
    console.log('✅ Connected to notification service');
  });
  
  // Forward messages
  ws.on('message', (data) => {
    notificationWs.send(data);
  });
  
  notificationWs.on('message', (data) => {
    ws.send(data);
  });
  
  // Handle disconnections
  ws.on('close', () => {
    notificationWs.close();
  });
  
  notificationWs.on('close', () => {
    ws.close();
  });
});

server.listen(3001, () => {
  console.log('🔌 WebSocket proxy running on port 3001');
});
```

### **4. Update Frontend Configuration**

Update your frontend to use the correct WebSocket URL:

```typescript
// In useNotifications.ts
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/notifications/ws';
```

### **5. Environment Variables**

Create `.env.local` in your frontend:

```env
# API Gateway Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:3000/api/notifications/ws
```

## **Testing Steps**

### **1. Test API Gateway WebSocket Proxy**

```bash
# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" http://localhost:3000/api/notifications/ws?userId=test-user
```

### **2. Test Frontend Connection**

1. **Go to `/notifications` page**
2. **Click "Test WebSocket"** in the debugger
3. **Check console logs** for connection status

### **3. Expected Console Output**

```
🔌 Connecting to WebSocket via API Gateway: ws://localhost:3000/api/notifications/ws?userId=user-id
✅ WebSocket connected for user: user-id
🔔 Real-time notification received: {...}
```

## **Troubleshooting**

### **If WebSocket Still Fails:**

1. **Check API Gateway logs:**
   ```bash
   # Look for WebSocket upgrade requests
   tail -f api-gateway.log | grep WebSocket
   ```

2. **Test notification service directly:**
   ```bash
   # Test if notification service WebSocket is working
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:4009?userId=test-user
   ```

3. **Check CORS settings:**
   ```javascript
   // In API Gateway
   app.use(cors({
     origin: ['http://localhost:3000', 'http://localhost:5173'],
     credentials: true
   }));
   ```

## **Alternative: Use Polling Only**

If WebSocket continues to fail, you can disable WebSocket and use polling only:

```typescript
// In useNotifications.ts
const connect = useCallback(() => {
  // Disable WebSocket for now
  console.log('WebSocket disabled, using polling only');
  setConnectionStatus('disabled');
  return;
}, [user?.id]);
```

## **Expected Results**

After implementing the WebSocket proxy:

- ✅ **"Connection successful"** in notification bell
- ✅ **Real-time notifications** without page refresh
- ✅ **No more error 1006** in console
- ✅ **Immediate UI updates** when notifications arrive

The notification system should work perfectly with real-time updates! 🎉 