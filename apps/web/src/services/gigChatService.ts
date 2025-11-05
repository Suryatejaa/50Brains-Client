export class GigChatService {
  private ws: WebSocket | null = null;
  private chatCallbacks: Map<string, (message: any) => void> = new Map();
  private currentUserId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ws = null;
  }

  connect(userId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.currentUserId = userId;

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL
      ? `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/ws?userId=${userId}`
      : `ws://localhost:4000/ws?userId=${userId}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('✅ Connected to WebSocket Gateway');
      this.reconnectAttempts = 0;

      // Subscribe to gig chat events
      this.ws?.send(
        JSON.stringify({
          type: 'subscribe_gig_chat',
        })
      );
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.ws = null;

      // Attempt reconnection with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.pow(2, this.reconnectAttempts) * 1000; // 1s, 2s, 4s, 8s, 16s
        this.reconnectAttempts++;

        console.log(
          `Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
        );

        this.reconnectTimeout = setTimeout(() => {
          if (this.currentUserId) {
            this.connect(this.currentUserId);
          }
        }, delay);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'gig_chat_message':
        // Forward to appropriate chat window
        const callback = this.chatCallbacks.get(message.chatId);
        if (callback) {
          callback({
            type: 'message',
            ...message,
          });
        }
        break;

      case 'gig_chat_typing':
        // Handle typing indicators
        const typingCallback = this.chatCallbacks.get(message.chatId);
        if (typingCallback) {
          typingCallback({
            type: 'typing',
            ...message,
          });
        }
        break;

      case 'subscription_confirmed':
        console.log('✅ Subscribed to:', message.service);
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  subscribeToChat(chatId: string, callback: (message: any) => void) {
    this.chatCallbacks.set(chatId, callback);
  }

  unsubscribeFromChat(chatId: string) {
    this.chatCallbacks.delete(chatId);
  }

  sendTyping(chatId: string, recipientId: string, isTyping: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'gig_chat_typing',
          chatId,
          recipientId,
          isTyping,
          senderId: this.currentUserId,
        })
      );
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.send(
        JSON.stringify({
          type: 'unsubscribe_gig_chat',
        })
      );
      this.ws.close();
      this.ws = null;
    }

    this.chatCallbacks.clear();
    this.currentUserId = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const gigChatService = new GigChatService();
