# Clan Chat System 🏛️💬

A modern, real-time clan chat system built with WebSocket technology and React, following industry-standard architectural patterns.

## 🏗️ Architecture Overview

### **Multi-Layer Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                ClanChat Component                   │   │
│  │  • Real-time messaging                             │   │
│  │  • Typing indicators                               │   │
│  │  • Connection status                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  ClanChatService                          │
│  • Message handling                                       │
│  • Typing indicators                                     │
│  • Read receipts                                         │
│  • Message caching                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                WebSocketManager                           │
│  • Connection management                                  │
│  • Automatic reconnection                                │
│  • Event handling                                        │
│  • Multi-service support                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                WebSocket Server                           │
│  • Real-time communication                               │
│  • Message broadcasting                                  │
│  • User presence                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Features

### **Core Functionality**
- ✅ **Real-time messaging** with WebSocket
- ✅ **Typing indicators** with debouncing
- ✅ **Read receipts** for message tracking
- ✅ **Message caching** for performance
- ✅ **Auto-scroll** to latest messages
- ✅ **Connection status** monitoring

### **Advanced Features**
- 🔄 **Automatic reconnection** with exponential backoff
- 📱 **Mobile-responsive** design
- 🌙 **Dark mode** support
- 🎨 **Beautiful animations** and transitions
- 📊 **Message queuing** when offline

### **Developer Experience**
- 🧪 **Demo mode** for testing
- 🔧 **TypeScript** support
- 📚 **Comprehensive** documentation
- 🎯 **Industry-standard** patterns

## 📦 Installation & Usage

### **1. Import the Component**
```tsx
import { ClanChat } from '@/components/ClanChat';
```

### **2. Use in Your Component**
```tsx
<ClanChat
  userId={user.id}
  clanId={clan.id}
  clanName={clan.name}
/>
```

### **3. Basic Implementation**
```tsx
import React from 'react';
import { ClanChat } from '@/components/ClanChat';

interface ClanPageProps {
  user: { id: string };
  clan: { id: string; name: string };
}

export const ClanPage: React.FC<ClanPageProps> = ({ user, clan }) => {
  return (
    <div className="clan-page">
      <h1>{clan.name}</h1>
      
      {/* Clan Chat */}
      <div className="chat-container">
        <ClanChat
          userId={user.id}
          clanId={clan.id}
          clanName={clan.name}
        />
      </div>
    </div>
  );
};
```

## ⚙️ Configuration

### **WebSocket Server**
The system is configured to connect to:
- **Development**: `ws://localhost:4009/ws`
- **Production**: Configure in `WebSocketManager.ts`

### **Connection Parameters**
```typescript
{
  userId: string;    // Current user's ID
  clanId: string;   // Clan ID for chat room
}
```

### **Message Types**
```typescript
type MessageType = 'TEXT' | 'IMAGE' | 'FILE';

interface ChatMessage {
  type: 'chat';
  content: string;
  messageType: MessageType;
  timestamp: string;
  userId: string;
  id?: string;
}
```

## 🎨 Customization

### **Styling**
The component uses CSS modules with CSS custom properties for easy theming:

```css
/* Custom colors */
:root {
  --chat-primary: #667eea;
  --chat-secondary: #764ba2;
  --chat-background: #ffffff;
  --chat-text: #2d3748;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --chat-background: #1a202c;
    --chat-text: #e2e8f0;
  }
}
```

### **Themes**
- **Light Mode**: Clean, modern design
- **Dark Mode**: Easy on the eyes
- **Mobile**: Touch-friendly interface

## 🔧 Development

### **Running Locally**
1. **Start WebSocket server** on port 4009
2. **Import component** in your React app
3. **Test with demo messages**

### **Adding New Features**
1. **Extend ClanChatService** for new functionality
2. **Update event handlers** in the component
3. **Add new message types** as needed

### **Testing**
```typescript
// Send demo message
chatService.sendDemoMessage();

// Get demo messages
const demoMessages = chatService.getDemoMessages();
```

## 📱 Mobile Support

### **Responsive Design**
- **Touch-friendly** input fields
- **Swipe gestures** for navigation
- **Optimized** for small screens
- **iOS zoom** prevention

### **Performance**
- **Lazy loading** of messages
- **Efficient** re-rendering
- **Memory management** for large chats

## 🚨 Error Handling

### **Connection Issues**
- **Automatic reconnection** attempts
- **Exponential backoff** strategy
- **User feedback** on status
- **Graceful degradation**

### **Message Failures**
- **Queue system** for offline messages
- **Retry logic** for failed sends
- **Error boundaries** for crashes

## 🔒 Security

### **Authentication**
- **User ID validation** on connection
- **Clan membership** verification
- **Message sanitization** for XSS prevention

### **Privacy**
- **End-to-end** message encryption (planned)
- **User consent** for data collection
- **GDPR compliance** ready

## 📈 Performance

### **Optimizations**
- **Message virtualization** for large chats
- **Debounced typing** indicators
- **Efficient** state management
- **Memory cleanup** on unmount

### **Monitoring**
- **Connection metrics** tracking
- **Message delivery** statistics
- **Performance profiling** tools

## 🚀 Future Roadmap

### **Phase 2: Enhanced Features**
- [ ] **File sharing** support
- [ ] **Voice messages** integration
- [ ] **Reactions** and emojis
- [ ] **Message threading**

### **Phase 3: Advanced Features**
- [ ] **End-to-end encryption**
- [ ] **Message search** functionality
- [ ] **Chat analytics** dashboard
- [ ] **Bot integration** support

### **Phase 4: Enterprise Features**
- [ ] **Multi-clan** support
- [ ] **Admin controls** and moderation
- [ ] **Audit logging** and compliance
- [ ] **API integration** for external tools

## 🤝 Contributing

### **Code Style**
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional commits** for history

### **Testing**
- **Unit tests** for services
- **Integration tests** for components
- **E2E tests** for user flows
- **Performance testing** for scalability

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../../LICENSE) file for details.

## 🙏 Acknowledgments

- **Discord** for chat UI inspiration
- **Slack** for enterprise patterns
- **React** team for the amazing framework
- **WebSocket** community for standards

---

**Built with ❤️ by the 50BraIns team**
