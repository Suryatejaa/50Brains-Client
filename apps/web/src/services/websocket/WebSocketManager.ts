import { MockWebSocketServer } from './MockWebSocketServer';

// Service types
type WebSocketService = 'notifications' | 'clan-chat' | 'gig';

// Extended WebSocket interface to include health check properties
interface ExtendedWebSocket extends WebSocket {
  healthCheckInterval?: NodeJS.Timeout;
  healthCheckPaused?: boolean;
}

export class WebSocketManager {
  private connections = new Map<string, ExtendedWebSocket>();
  private eventHandlers = new Map<string, Set<Function>>();
  private reconnectAttempts = new Map<string, number>();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private useMockServer = false;
  private mockServer = MockWebSocketServer.getInstance();

  // Add unique tab identifier
  private tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Singleton pattern for global access
  private static instance: WebSocketManager;

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
      console.log('🏗️ WebSocketManager: Singleton instance created');
    }
    return WebSocketManager.instance;
  }

  constructor() {
    // Listen for tab visibility changes and page unload
    if (typeof window !== 'undefined') {
      // Handle tab visibility change
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

      // Handle page unload
      window.addEventListener('beforeunload', this.handlePageUnload.bind(this));

      // Handle tab focus/blur
      window.addEventListener('focus', this.handleTabFocus.bind(this));
      window.addEventListener('blur', this.handleTabBlur.bind(this));
    }
  }

  // Connect to different services
  async connect(service: WebSocketService, params: any): Promise<WebSocket> {
    // Include tab ID in connection params to ensure uniqueness
    const uniqueParams = { ...params, tabId: this.tabId };
    const connectionId = `${service}_${JSON.stringify(uniqueParams)}`;

    console.log('🔌 WebSocketManager: Attempting to connect to service:', service, 'with params:', uniqueParams);
    console.log('🔌 WebSocketManager: Tab ID:', this.tabId);
    console.log('🔌 WebSocketManager: Connection ID:', connectionId);
    console.log('🔌 WebSocketManager: Current connections:', Array.from(this.connections.keys()));

    if (this.connections.has(connectionId)) {
      console.log('🔌 WebSocketManager: Connection already exists, returning existing connection');
      const existingWs = this.connections.get(connectionId)!;
      console.log('🔌 WebSocketManager: Existing WebSocket state:', existingWs.readyState);
      return Promise.resolve(existingWs);
    }

    return new Promise((resolve, reject) => {
      const wsUrl = this.buildWebSocketUrl(service, uniqueParams);
      console.log('🔌 WebSocketManager: Building WebSocket URL:', wsUrl);
      console.log('🔌 WebSocketManager: Attempting connection to:', wsUrl);

      const ws = new WebSocket(wsUrl) as ExtendedWebSocket;

      // Set up WebSocket event handlers
      this.setupWebSocketHandlers(ws, connectionId, service, uniqueParams, resolve, reject);

      // Set connection timeout
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log(`⏰ WebSocketManager: Connection timeout for ${service}`);
          console.log(`⏰ WebSocketManager: Current readyState:`, ws.readyState);
          ws.close();

          // Don't automatically fall back to mock server - let the user decide
          console.log('❌ WebSocketManager: WebSocket connection timeout. Please check if your backend server is running.');
          reject(new Error(`Connection timeout for ${service}. Check if backend server is running.`));
        }
      }, 10000);
    });
  }

  // Enhanced WebSocket event handlers
  private setupWebSocketHandlers(
    ws: ExtendedWebSocket,
    connectionId: string,
    service: WebSocketService,
    params: any,
    resolve: (ws: WebSocket) => void,
    reject: (error: any) => void
  ): void {
    ws.onopen = () => {
      console.log(`✅ WebSocketManager: Successfully connected to ${service}`);
      console.log(`✅ WebSocketManager: WebSocket readyState:`, ws.readyState);
      console.log(`✅ WebSocketManager: Adding connection to map with ID:`, connectionId);
      this.connections.set(connectionId, ws);
      console.log(`✅ WebSocketManager: Current connections after adding:`, Array.from(this.connections.keys()));
      this.emit('connected', { service, params });

      // Start health check
      this.startHealthCheck(ws, connectionId, service, params);

      resolve(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocketManager: Received message from', service, ':', data);
        this.handleMessage(service, data);
      } catch (error) {
        console.error('❌ WebSocketManager: Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log(`❌ WebSocketManager: Connection closed for ${service}:`, event.code, event.reason);
      console.log(`❌ WebSocketManager: Close event details:`, event);

      // Clear health check interval
      if (ws.healthCheckInterval) {
        clearInterval(ws.healthCheckInterval);
      }

      this.connections.delete(connectionId);
      this.emit('disconnected', { service, params, code: event.code });

      // Don't automatically fall back to mock server - let the user decide
      console.log('❌ WebSocketManager: WebSocket connection failed. Please check if your backend server is running.');
      console.log('🔧 WebSocketManager: To fix this:');
      console.log('   • Make sure your backend clan service is running on port 4003');
      console.log('   • Check if WebSocket endpoint /ws is available');
      console.log('   • Verify firewall/network settings');
      console.log('   • Use Mock Server for testing without backend');

      // Attempt reconnection
      this.handleReconnection(service, params, connectionId);

      reject(new Error(`WebSocket connection failed for ${service}. Check if backend server is running.`));
    };

    ws.onerror = (error) => {
      console.error(`❌ WebSocketManager: WebSocket error for ${service}:`, error);
      console.error(`❌ WebSocketManager: Error details:`, error);

      // Don't automatically fall back to mock server - let the user decide
      console.log('❌ WebSocketManager: WebSocket error occurred. Please check if your backend server is running.');
      this.handleConnectionFailure(connectionId, service, params);
      reject(error);
    };
  }

  // Add connection health monitoring
  private startHealthCheck(ws: ExtendedWebSocket, connectionId: string, service: WebSocketService, params: any): void {
    const healthCheckInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        // Send ping to keep connection alive
        try {
          ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          console.log('💓 WebSocketManager: Health check ping sent for', connectionId);
        } catch (error) {
          console.error('❌ WebSocketManager: Health check failed for', connectionId, error);
          this.handleConnectionFailure(connectionId, service, params);
        }
      } else {
        console.log('❌ WebSocketManager: Connection not open during health check, state:', ws.readyState);
        clearInterval(healthCheckInterval);
      }
    }, 30000); // Every 30 seconds

    // Store interval reference for cleanup
    ws.healthCheckInterval = healthCheckInterval;
  }

  private handleConnectionFailure(connectionId: string, service: WebSocketService, params: any): void {
    console.log('❌ WebSocketManager: Handling connection failure for', connectionId);
    const ws = this.connections.get(connectionId);

    if (ws) {
      // Clear health check interval
      if (ws.healthCheckInterval) {
        clearInterval(ws.healthCheckInterval);
      }

      // Close and remove connection
      ws.close();
      this.connections.delete(connectionId);
      this.emit('disconnected', { service, params, code: 1006 });
    }
  }

  // Browser tab event handlers
  private handleVisibilityChange(): void {
    if (document.hidden) {
      console.log('👁️ WebSocketManager: Tab became hidden, pausing health checks');
      this.pauseHealthChecks();
    } else {
      console.log('👁️ WebSocketManager: Tab became visible, resuming health checks');
      this.resumeHealthChecks();
    }
  }

  private handlePageUnload(): void {
    console.log('🚪 WebSocketManager: Page unloading, closing all connections');
    this.closeAllConnections();
  }

  private handleTabFocus(): void {
    console.log('🎯 WebSocketManager: Tab focused, checking connection health');
    this.checkAllConnections();
  }

  private handleTabBlur(): void {
    console.log('👁️ WebSocketManager: Tab blurred');
  }

  private pauseHealthChecks(): void {
    this.connections.forEach((ws, connectionId) => {
      if (ws.healthCheckInterval) {
        clearInterval(ws.healthCheckInterval);
        ws.healthCheckPaused = true;
      }
    });
  }

  private resumeHealthChecks(): void {
    this.connections.forEach((ws, connectionId) => {
      if (ws.healthCheckPaused) {
        // Restart health check with proper service type
        let service: WebSocketService;
        if (connectionId.startsWith('clan-chat')) {
          service = 'clan-chat';
        } else if (connectionId.startsWith('gig')) {
          service = 'gig';
        } else {
          service = 'notifications';
        }
        this.startHealthCheck(ws, connectionId, service, {});
        ws.healthCheckPaused = false;
      }
    });
  }

  private checkAllConnections(): void {
    this.connections.forEach((ws, connectionId) => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.log('❌ WebSocketManager: Found dead connection, removing:', connectionId);
        this.connections.delete(connectionId);
      }
    });
  }

  private closeAllConnections(): void {
    this.connections.forEach((ws, connectionId) => {
      if (ws.healthCheckInterval) {
        clearInterval(ws.healthCheckInterval);
      }
      ws.close();
    });
    this.connections.clear();
  }

  private async fallbackToMockServer(
    service: string,
    params: any,
    connectionId: string,
    resolve: (ws: any) => void,
    reject: (error: any) => void
  ): Promise<void> {
    try {
      console.log('🎭 WebSocketManager: Attempting to connect to mock server for:', service);
      this.useMockServer = true;

      const success = await this.mockServer.simulateConnection(service, params);
      if (success) {
        // Create a mock WebSocket object
        const mockWs = this.createMockWebSocket(connectionId, service, params);
        this.connections.set(connectionId, mockWs);

        console.log('✅ WebSocketManager: Successfully connected to mock server for:', service);
        this.emit('connected', { service, params });
        resolve(mockWs);
      } else {
        reject(new Error(`Failed to connect to mock server for ${service}`));
      }
    } catch (error) {
      console.error('❌ WebSocketManager: Failed to connect to mock server:', error);
      reject(error);
    }
  }

  private createMockWebSocket(connectionId: string, service: string, params: any): any {
    const mockWs = {
      readyState: WebSocket.OPEN,
      send: (data: string) => {
        console.log('📤 WebSocketManager: Mock WebSocket sending message:', data);
        // The mock server will handle this message
        this.mockServer.simulateMessage(connectionId, service, params, JSON.parse(data));
      },
      close: () => {
        console.log('🔌 WebSocketManager: Mock WebSocket closing connection:', connectionId);
        this.connections.delete(connectionId);
        this.mockServer.disconnectClient(connectionId);
      }
    };

    // Set up message handling from mock server
    this.mockServer.onMessage(connectionId, (message: any) => {
      console.log('📨 WebSocketManager: Mock WebSocket received message:', message);
      this.handleMessage(service, message);
    });

    return mockWs;
  }

  private buildWebSocketUrl(service: WebSocketService, params: any): string {
    // All services connect to the central WebSocket Gateway on port 4000
    const baseUrl = 'ws://localhost:4000/ws';  // WebSocket Gateway

    // Add service type to params so the gateway knows how to route
    const gatewayParams = { ...params, serviceType: service };
    const queryParams = new URLSearchParams(gatewayParams);
    const fullUrl = `${baseUrl}?${queryParams.toString()}`;

    console.log('🔌 WebSocketManager: Built URL for', service, ':', fullUrl);
    console.log('🔌 WebSocketManager: Using central WebSocket Gateway for all services');
    return fullUrl;
  }

  // Event-driven message handling
  private handleMessage(service: string, data: any) {
    const eventType = `${service}.${data.type}`;
    console.log('📡 WebSocketManager: Emitting event:', eventType, 'with data:', data);

    // Emit service-specific event
    this.emit(eventType, data);

    // Only emit generic message event for non-chat messages to prevent duplicates
    if (data.type !== 'chat') {
      console.log('📡 WebSocketManager: Emitting generic message event for non-chat message');
      this.emit('message', { service, data });
    } else {
      console.log('📡 WebSocketManager: Skipping generic message event for chat message to prevent duplicates');
    }
  }

  // Event system (Observer pattern)
  on(event: string, handler: Function): () => void {
    console.log('🎧 WebSocketManager: Registering event handler for:', event);

    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      console.log('🎧 WebSocketManager: Unregistering event handler for:', event);
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      console.log('📡 WebSocketManager: Emitting event:', event, 'to', handlers.size, 'handlers');
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ WebSocketManager: Error in event handler for ${event}:`, error);
        }
      });
    } else {
      console.log('⚠️ WebSocketManager: No handlers registered for event:', event);
    }
  }

  // Automatic reconnection with exponential backoff
  private handleReconnection(service: WebSocketService, params: any, connectionId: string) {
    const attempts = this.reconnectAttempts.get(connectionId) || 0;

    if (attempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, attempts);

      console.log(`↻ WebSocketManager: Scheduling reconnection to ${service} in ${delay}ms (attempt ${attempts + 1})`);

      setTimeout(() => {
        console.log(`↻ WebSocketManager: Attempting to reconnect to ${service} (attempt ${attempts + 1})`);
        this.reconnectAttempts.set(connectionId, attempts + 1);
        this.connect(service, params);
      }, delay);
    } else {
      console.error(`❌ WebSocketManager: Max reconnection attempts reached for ${service}`);
      this.emit('reconnection_failed', { service, params });
    }
  }

  // Send message to specific service
  send(service: string, params: any, message: any): boolean {
    // Include tab ID in params for connection lookup
    const uniqueParams = { ...params, tabId: this.tabId };
    const connectionId = `${service}_${JSON.stringify(uniqueParams)}`;
    const ws = this.connections.get(connectionId);

    console.log('📤 WebSocketManager: Attempting to send message to', service, ':', message);
    console.log('📤 WebSocketManager: Connection ID:', connectionId);
    console.log('📤 WebSocketManager: WebSocket state:', ws ? ws.readyState : 'null');
    console.log('📤 WebSocketManager: All available connections:', Array.from(this.connections.keys()));

    if (ws && ws.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(message);
      console.log('📤 WebSocketManager: Sending message string:', messageStr);
      ws.send(messageStr);
      console.log('✅ WebSocketManager: Message sent successfully');
      return true;
    } else {
      console.log('❌ WebSocketManager: Cannot send message - WebSocket not ready');
      console.log('❌ WebSocketManager: WebSocket exists:', !!ws);
      console.log('❌ WebSocketManager: WebSocket state:', ws ? ws.readyState : 'null');
      console.log('❌ WebSocketManager: Available connections:', Array.from(this.connections.keys()));
      console.log('❌ WebSocketManager: Looking for connection ID:', connectionId);
      return false;
    }
  }

  // Disconnect from specific service
  disconnect(service: string, params: any): void {
    // Include tab ID in params for connection lookup
    const uniqueParams = { ...params, tabId: this.tabId };
    const connectionId = `${service}_${JSON.stringify(uniqueParams)}`;
    const ws = this.connections.get(connectionId);

    console.log('🔌 WebSocketManager: Disconnecting from', service, 'with connection ID:', connectionId);

    if (ws) {
      // Clear health check interval
      if (ws.healthCheckInterval) {
        clearInterval(ws.healthCheckInterval);
      }

      ws.close();
      this.connections.delete(connectionId);
      this.reconnectAttempts.delete(connectionId);
      console.log('🔌 WebSocketManager: Successfully disconnected from', service);
    } else {
      console.log('⚠️ WebSocketManager: No connection found for', service, 'with connection ID:', connectionId);
    }
  }

  // Get connection status
  getConnectionStatus(service: string, params: any): 'connected' | 'connecting' | 'disconnected' {
    // Include tab ID in params for connection lookup
    const uniqueParams = { ...params, tabId: this.tabId };
    const connectionId = `${service}_${JSON.stringify(uniqueParams)}`;
    const ws = this.connections.get(connectionId);

    let status: 'connected' | 'connecting' | 'disconnected';

    if (!ws) {
      status = 'disconnected';
    } else if (ws.readyState === WebSocket.OPEN) {
      status = 'connected';
    } else if (ws.readyState === WebSocket.CONNECTING) {
      status = 'connecting';
    } else {
      status = 'disconnected';
    }

    console.log('🔍 WebSocketManager: Connection status for', service, ':', status, 'WebSocket state:', ws ? ws.readyState : 'null');
    return status;
  }

  // Get all active connections (for debugging)
  getActiveConnections(): string[] {
    const activeConnections = Array.from(this.connections.keys());
    console.log('🔍 WebSocketManager: Active connections:', activeConnections);
    return activeConnections;
  }

  // Check if using mock server
  isUsingMockServer(): boolean {
    return this.useMockServer;
  }

  // Get tab ID for debugging
  getTabId(): string {
    return this.tabId;
  }
}
