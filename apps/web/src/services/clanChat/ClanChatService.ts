import { WebSocketManager } from '../websocket/WebSocketManager';

export class ClanChatService {
  private ws: WebSocket | null = null;
  private messageHandlers = new Map<string, Set<Function>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Message deduplication
  private sentMessageIds = new Set<string>();
  private pendingMessages = new Map<string, { content: string; timestamp: number; retries: number }>();
  private maxRetries = 3;

  constructor(
    private userId: string,
    private clanId: string
  ) {
    console.log('🏗️ ClanChatService: Created for user:', userId, 'clan:', clanId);
  }

  // Generate unique message ID to prevent duplicates
  private generateMessageId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `msg_${timestamp}_${random}`;
  }

  // Check if message was already sent
  private isMessageDuplicate(messageId: string): boolean {
    return this.sentMessageIds.has(messageId);
  }

  // Handle message acknowledgment from server
  private handleMessageAcknowledgment(serverMessageId: string, clientMessageId: string): void {
    console.log('✅ ClanChatService: Message acknowledged by server:', { serverMessageId, clientMessageId });

    // Remove from sent messages set
    this.sentMessageIds.delete(clientMessageId);

    // Clean up pending message
    this.pendingMessages.forEach((data, content) => {
      if (data.timestamp < Date.now() - 10000) {
        this.pendingMessages.delete(content);
      }
    });
  }

  // Connect to clan chat directly
  async connect(): Promise<void> {
    try {
      console.log('🔌 ClanChatService: Attempting to connect directly to clan service...');
      console.log('🔌 ClanChatService: User ID:', this.userId);
      console.log('🔌 ClanChatService: Clan ID:', this.clanId);

      // Check if already connected
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('⚠️ ClanChatService: Already connected, closing existing connection');
        this.ws.close();
      }

      // Connect directly to clan service WebSocket on port 4003
      const wsUrl = `ws://localhost:4003/ws?userId=${this.userId}&clanId=${this.clanId}`;
      console.log('🔌 ClanChatService: Connecting to:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ ClanChatService: Successfully connected to clan service WebSocket');
        this.reconnectAttempts = 0;
        this.emit('connected', { userId: this.userId, clanId: this.clanId });

        // Clear any pending messages that might have been sent during disconnection
        this.pendingMessages.clear();

        // Request recent messages after connection
        this.requestRecentMessages();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received WebSocket message:', data);

          switch (data.type) {
            case 'message':
            case 'chat': // Handle both message types for compatibility
              this.emit('message', data);
              break;
            case 'typing_started':
              this.emit('typing_started', data);
              break;
            case 'typing_stopped':
              this.emit('typing_stopped', data);
              break;
            case 'message_sent':
              // Handle message acknowledgment
              if (data.clientMessageId) {
                this.handleMessageAcknowledgment(data.id || data.messageId, data.clientMessageId);
              }
              this.emit('message_sent', data);
              break;
            case 'delivery_confirmed':
              this.emit('delivery_confirmed', data);
              break;
            case 'read_receipt':
              this.emit('read_receipt', data);
              break;
            case 'message_deleted':
              this.emit('message_deleted', data);
              break;
            case 'message_status':
              this.emit('message_status', data);
              break;
            case 'delivery_details':
              this.emit('delivery_details', data);
              break;
            case 'recent_messages':
              this.emit('recent_messages', data);
              break;
            case 'more_messages':
              this.emit('more_messages', data);
              break;
            case 'connected':
              this.emit('connected', data);
              break;
            case 'disconnected':
              this.emit('disconnected', data);
              break;
            default:
              console.log('⚠️ Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('❌ ClanChatService: WebSocket connection closed:', event.code, event.reason);
        this.emit('disconnected', { code: event.code, reason: event.reason });

        // Attempt reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          console.log(`🔄 ClanChatService: Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
          setTimeout(() => this.connect(), delay);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ ClanChatService: WebSocket error:', error);
      };

    } catch (error) {
      console.error('❌ ClanChatService: Failed to connect to clan chat:', error);
      throw error;
    }
  }

  // Send chat message with deduplication
  sendMessage(content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'): boolean {
    console.log('📤 ClanChatService: Sending message:', { content, messageType, userId: this.userId, clanId: this.clanId });

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ ClanChatService: WebSocket not connected');
      return false;
    }

    // Generate unique message ID
    const messageId = this.generateMessageId();

    // Check if this exact content was sent recently (within 5 seconds)
    const now = Date.now();
    const recentMessage = this.pendingMessages.get(content);
    if (recentMessage && (now - recentMessage.timestamp) < 5000) {
      console.warn('⚠️ ClanChatService: Duplicate message detected, skipping:', content);
      return false;
    }

    // Store pending message
    this.pendingMessages.set(content, { content, timestamp: now, retries: 0 });

    const message = {
      type: 'chat',
      clanId: this.clanId,
      content,
      messageType,
      clientMessageId: messageId, // Use generated ID
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log('✅ ClanChatService: Message sent successfully with ID:', messageId);

      // Add to sent messages set
      this.sentMessageIds.add(messageId);

      // Clean up pending message after 10 seconds
      setTimeout(() => {
        this.pendingMessages.delete(content);
      }, 10000);

      return true;
    } catch (error) {
      console.error('❌ ClanChatService: Failed to send message:', error);
      this.pendingMessages.delete(content);
      return false;
    }
  }

  // Send typing indicator
  sendTypingIndicator(isTyping: boolean): boolean {
    console.log('⌨️ ClanChatService: Sending typing indicator:', isTyping);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ ClanChatService: WebSocket not connected');
      return false;
    }

    const message = {
      type: 'typing_indicator', // Changed from 'typing' to 'typing_indicator'
      clanId: this.clanId,
      isTyping,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log('✅ ClanChatService: Typing indicator sent:', isTyping);
      return true;
    } catch (error) {
      console.error('❌ ClanChatService: Error sending typing indicator:', error);
      return false;
    }
  }

  // Mark message as read
  markMessageAsRead(messageId: string): boolean {
    console.log('👁️ ClanChatService: Marking message as read:', { messageId, userId: this.userId, clanId: this.clanId });

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ ClanChatService: WebSocket not connected');
      return false;
    }

    const message = {
      type: 'read_receipt',
      clanId: this.clanId,
      messageId,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log('✅ ClanChatService: Read receipt sent successfully');
      return true;
    } catch (error) {
      console.error('❌ ClanChatService: Failed to send read receipt:', error);
      return false;
    }
  }

  // Delete message
  deleteMessage(messageId: string): boolean {
    console.log('🗑️ ClanChatService: Deleting message:', { messageId, userId: this.userId, clanId: this.clanId });

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ ClanChatService: WebSocket not connected');
      return false;
    }

    const message = {
      type: 'delete_message',
      clanId: this.clanId,
      messageId,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log('✅ ClanChatService: Delete message request sent successfully');
      return true;
    } catch (error) {
      console.error('❌ ClanChatService: Failed to send delete message request:', error);
      return false;
    }
  }

  // Get message status
  getMessageStatus(messageId: string): boolean {
    console.log('📊 ClanChatService: Getting message status:', { messageId, userId: this.userId, clanId: this.clanId });

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ ClanChatService: WebSocket not connected');
      return false;
    }

    const message = {
      type: 'get_message_status',
      clanId: this.clanId,
      messageId,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log('✅ ClanChatService: Message status request sent successfully');
      return true;
    } catch (error) {
      console.error('❌ ClanChatService: Failed to send message status request:', error);
      return false;
    }
  }

  // Get delivery details
  getDeliveryDetails(messageId: string): boolean {
    console.log('📋 ClanChatService: Getting delivery details:', { messageId, userId: this.userId, clanId: this.clanId });

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ ClanChatService: WebSocket not connected');
      return false;
    }

    const message = {
      type: 'get_delivery_details',
      clanId: this.clanId,
      messageId,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log('✅ ClanChatService: Delivery details request sent successfully');
      return true;
    } catch (error) {
      console.error('❌ ClanChatService: Failed to send delivery details request:', error);
      return false;
    }
  }

  // Request recent messages
  requestRecentMessages(): boolean {
    console.log('📚 ClanChatService: Requesting recent messages for clan:', this.clanId);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ ClanChatService: WebSocket not connected');
      return false;
    }

    const message = {
      type: 'get_recent_messages',
      clanId: this.clanId,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(message));
      console.log('✅ ClanChatService: Recent messages request sent successfully');
      return true;
    } catch (error) {
      console.error('❌ ClanChatService: Failed to send recent messages request:', error);
      return false;
    }
  }

  // Request more messages (pagination)
  async requestMoreMessages(page: number = 1, limit: number = 20): Promise<boolean> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('❌ WebSocket not connected, cannot request more messages');
      return false;
    }

    try {
      const message = {
        type: 'get_more_messages',
        page,
        limit,
        timestamp: new Date().toISOString()
      };

      this.ws.send(JSON.stringify(message));
      console.log(`📚 Requesting more messages: page ${page}, limit ${limit}`);
      return true;
    } catch (error) {
      console.error('❌ Error requesting more messages:', error);
      return false;
    }
  }

  // Handle incoming messages
  private handleIncomingMessage(data: any): void {
    console.log('📨 ClanChatService: Processing incoming message:', data);

    // Handle different message types
    switch (data.type) {
      case 'chat':
        this.emit('message', data);
        break;
      case 'typing':
        if (data.isTyping) {
          this.emit('typing_started', data);
        } else {
          this.emit('typing_stopped', data);
        }
        break;
      case 'message_sent':
        this.emit('message_sent', data);
        break;
      case 'delivery_confirmed':
        this.emit('delivery_confirmed', data);
        break;
      case 'read_receipt':
        this.emit('read_receipt', data);
        break;
      case 'message_deleted':
        this.emit('message_deleted', data);
        break;
      case 'message_status':
        this.emit('message_status', data);
        break;
      case 'delivery_details':
        this.emit('delivery_details', data);
        break;
      case 'recent_messages':
        this.emit('recent_messages', data);
        break;
      default:
        console.log('⚠️ ClanChatService: Unknown message type:', data.type);
    }
  }

  // Event handling system
  on(event: string, handler: Function): () => void {
    console.log('🎧 ClanChatService: Registering event handler for:', event);

    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }

    this.messageHandlers.get(event)!.add(handler);

    return () => {
      console.log('🎧 ClanChatService: Unregistering event handler for:', event);
      this.messageHandlers.get(event)?.delete(handler);
    };
  }

  private emit(event: string, data: any): void {
    console.log('📡 ClanChatService: Emitting event:', event, 'with data:', data);

    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    } else {
      console.log('⚠️ ClanChatService: No handlers registered for event:', event);
    }
  }

  // Handle typing with timeout
  handleTyping(isTyping: boolean): void {
    console.log('⌨️ ClanChatService: Handling typing:', { isTyping, userId: this.userId });

    if (isTyping) {
      // Send typing started
      this.sendTypingIndicator(true);
      this.emit('typing_started', { userId: this.userId, clanId: this.clanId });
    } else {
      // Send typing stopped immediately
      this.sendTypingIndicator(false);
      this.emit('typing_stopped', { userId: this.userId, clanId: this.clanId });
    }
  }

  // Check if all clan members have seen a message
  async checkMessageSeenByAll(messageId: string): Promise<boolean> {
    console.log('👥 ClanChatService: Checking if message seen by all members:', messageId);

    try {
      const deliveryDetails = await this.getDeliveryDetails(messageId);
      if (deliveryDetails) {
        // This would need to be implemented on the server side
        // For now, return false as a placeholder
        return false;
      }
      return false;
    } catch (error) {
      console.error('❌ ClanChatService: Error checking message seen by all:', error);
      return false;
    }
  }

  // Get read receipts for a message
  async getReadReceipts(messageId: string): Promise<any[]> {
    console.log('👁️ ClanChatService: Getting read receipts for message:', messageId);

    try {
      const deliveryDetails = await this.getDeliveryDetails(messageId);
      if (deliveryDetails) {
        // This would need to be implemented on the server side
        // For now, return empty array as a placeholder
        return [];
      }
      return [];
    } catch (error) {
      console.error('❌ ClanChatService: Error getting read receipts:', error);
      return [];
    }
  }

  // Disconnect
  disconnect(): void {
    console.log('🔌 ClanChatService: Disconnecting from clan chat');

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Get connection status
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.ws) {
      return 'disconnected';
    }

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
      default:
        return 'disconnected';
    }
  }

  // Send delivery confirmation
  sendDeliveryConfirmation(messageId: string): void {
    console.log('📬 ClanChatService: Sending delivery confirmation for message:', messageId);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ ClanChatService: Cannot send delivery confirmation - not connected');
      return;
    }

    try {
      const message = {
        type: 'delivery_confirmation',
        messageId: messageId,
        userId: this.userId,
        clanId: this.clanId,
        timestamp: new Date().toISOString()
      };

      this.ws.send(JSON.stringify(message));
      console.log('✅ ClanChatService: Delivery confirmation sent successfully');
    } catch (error) {
      console.error('❌ ClanChatService: Failed to send delivery confirmation:', error);
    }
  }
}
