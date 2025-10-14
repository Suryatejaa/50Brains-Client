/**
 * Mock WebSocket Server for Testing Clan Chat
 * 
 * This is a simple mock server that simulates the behavior of a real WebSocket server
 * for testing purposes. It handles connections, messages, and broadcasts to connected clients.
 */

export class MockWebSocketServer {
  private static instance: MockWebSocketServer;
  private clients = new Map<string, any>();
  private messageHandlers = new Map<string, Set<Function>>();
  private messageHistory: any[] = [];
  private maxHistorySize = 100;

  static getInstance(): MockWebSocketServer {
    if (!MockWebSocketServer.instance) {
      MockWebSocketServer.instance = new MockWebSocketServer();
    }
    return MockWebSocketServer.instance;
  }

  // Simulate WebSocket connection
  simulateConnection(service: string, params: any): Promise<boolean> {
    const clientId = `${service}_${JSON.stringify(params)}`;

    console.log('🎭 MockWebSocketServer: Simulating connection for:', clientId);

    // Simulate connection delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a mock WebSocket object
        const mockWs = this.createMockWebSocket(clientId, service, params);
        this.clients.set(clientId, mockWs);

        console.log('✅ MockWebSocketServer: Simulated connection successful for:', clientId);
        resolve(true);
      }, 500); // Simulate 500ms connection time
    });
  }

  // Simulate receiving a message from a client
  simulateMessage(clientId: string, service: string, params: any, message: any): void {
    console.log('📨 MockWebSocketServer: Simulating message from client:', clientId, ':', message);
    this.handleMessage(clientId, service, params, message);
  }

  // Set up message handler for a client
  onMessage(clientId: string, handler: Function): () => void {
    if (!this.messageHandlers.has(clientId)) {
      this.messageHandlers.set(clientId, new Set());
    }

    this.messageHandlers.get(clientId)!.add(handler);

    return () => {
      this.messageHandlers.get(clientId)?.delete(handler);
    };
  }

  private createMockWebSocket(clientId: string, service: string, params: any): any {
    const mockWs = {
      readyState: WebSocket.OPEN,
      send: (data: string) => {
        console.log('📤 MockWebSocketServer: Received message from client:', clientId, ':', data);
        this.handleMessage(clientId, service, params, JSON.parse(data));
      },
      close: () => {
        console.log('🔌 MockWebSocketServer: Client disconnected:', clientId);
        this.clients.delete(clientId);
      }
    };

    // Send welcome message
    setTimeout(() => {
      this.sendToClient(clientId, {
        type: 'system',
        content: `Welcome to ${service}! You are now connected.`,
        timestamp: new Date().toISOString()
      });
    }, 100);

    return mockWs;
  }

  private handleMessage(clientId: string, service: string, params: any, message: any): void {
    console.log('📨 MockWebSocketServer: Handling message from:', clientId, ':', message);

    switch (message.type) {
      case 'chat':
        this.handleChatMessage(clientId, service, params, message);
        break;
      case 'typing':
        this.handleTypingIndicator(clientId, service, params, message);
        break;
      case 'get_recent_messages':
        this.handleGetRecentMessages(clientId, service, params, message);
        break;
      case 'get_older_messages':
        this.handleGetOlderMessages(clientId, service, params, message);
        break;
      default:
        console.log('⚠️ MockWebSocketServer: Unknown message type:', message.type);
    }
  }

  private handleChatMessage(clientId: string, service: string, params: any, message: any): void {
    const chatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'chat',
      content: message.content,
      messageType: message.messageType || 'TEXT',
      timestamp: new Date().toISOString(),
      userId: params.userId,
      clanId: params.clanId
    };

    // Add to history
    this.messageHistory.push(chatMessage);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }

    // Broadcast to all clients in the same clan
    this.broadcastToClan(params.clanId, {
      ...chatMessage
    });

    console.log('📨 MockWebSocketServer: Chat message broadcasted to clan:', params.clanId);
  }

  private handleTypingIndicator(clientId: string, service: string, params: any, message: any): void {
    const typingMessage = {
      type: 'typing',
      isTyping: message.isTyping,
      userId: params.userId,
      clanId: params.clanId,
      timestamp: new Date().toISOString()
    };

    // Broadcast typing indicator to all clients in the same clan (except sender)
    this.broadcastToClan(params.clanId, typingMessage, params.userId);

    console.log('⌨️ MockWebSocketServer: Typing indicator broadcasted to clan:', params.clanId);
  }

  private handleGetRecentMessages(clientId: string, service: string, params: any, message: any): void {
    const limit = message.limit || 50;
    const clanMessages = this.messageHistory.filter(msg =>
      msg.clanId === params.clanId && msg.type === 'chat'
    ).slice(-limit);

    this.sendToClient(clientId, {
      type: 'recent_messages',
      messages: clanMessages,
      timestamp: new Date().toISOString()
    });

    console.log('📚 MockWebSocketServer: Sent recent messages to client:', clientId, 'count:', clanMessages.length);
  }

  private handleGetOlderMessages(clientId: string, service: string, params: any, message: any): void {
    const limit = message.limit || 50;
    const startIndex = this.messageHistory.findIndex(msg =>
      msg.id === message.lastMessageId && msg.clanId === params.clanId && msg.type === 'chat'
    );

    if (startIndex === -1) {
      this.sendToClient(clientId, {
        type: 'older_messages',
        messages: [],
        timestamp: new Date().toISOString()
      });
      console.log('📚 MockWebSocketServer: No older messages found for client:', clientId);
      return;
    }

    const olderMessages = this.messageHistory.slice(0, startIndex).slice(-limit);

    this.sendToClient(clientId, {
      type: 'older_messages',
      messages: olderMessages,
      timestamp: new Date().toISOString()
    });

    console.log('📚 MockWebSocketServer: Sent older messages to client:', clientId, 'count:', olderMessages.length);
  }

  private broadcastToClan(clanId: string, message: any, excludeUserId?: string): void {
    this.clients.forEach((client, clientId) => {
      // Parse clientId to extract params
      try {
        const paramsStr = clientId.split('_').slice(1).join('_');
        const params = JSON.parse(paramsStr);

        // Send to clients in the same clan, excluding the sender if specified
        if (params.clanId === clanId && params.userId !== excludeUserId) {
          this.sendToClient(clientId, message);
        }
      } catch (error) {
        console.error('❌ MockWebSocketServer: Error parsing client params:', error);
      }
    });
  }

  private sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (client) {
      // Trigger the message handler if it exists
      const handlers = this.messageHandlers.get(clientId);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('❌ MockWebSocketServer: Error in message handler:', error);
          }
        });
      }

      console.log('📤 MockWebSocketServer: Message sent to client:', clientId, ':', message);
    }
  }

  // Get connection status for a client
  getConnectionStatus(clientId: string): 'connected' | 'connecting' | 'disconnected' {
    if (this.clients.has(clientId)) {
      return 'connected';
    }
    return 'disconnected';
  }

  // Get all connected clients
  getConnectedClients(): string[] {
    return Array.from(this.clients.keys());
  }

  // Disconnect a specific client
  disconnectClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.close();
      this.clients.delete(clientId);
      this.messageHandlers.delete(clientId);
      console.log('🔌 MockWebSocketServer: Client disconnected:', clientId);
    }
  }

  // Clear all connections (for testing)
  clearAllConnections(): void {
    this.clients.forEach(client => client.close());
    this.clients.clear();
    this.messageHandlers.clear();
    console.log('🧹 MockWebSocketServer: All connections cleared');
  }
}
