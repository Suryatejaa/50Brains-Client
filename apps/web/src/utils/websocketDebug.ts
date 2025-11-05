// WebSocket Debug Helper
// Use this in browser console to test WebSocket connection

export function testWebSocketConnection(userId: string = 'test-user') {
  const wsUrl =
    process.env.NODE_ENV === 'production'
      ? `wss://api.50brains.com/ws?userId=${userId}`
      : `ws://localhost:4000/ws?userId=${userId}`;

  console.log('🔌 Connecting to:', wsUrl);

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('✅ WebSocket Connected!');

    // Subscribe to gig chat
    ws.send(
      JSON.stringify({
        type: 'subscribe_gig_chat',
      })
    );

    console.log('📡 Sent subscription request');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('📨 Received message:', data);
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };

  ws.onclose = (event) => {
    console.log('🔌 WebSocket closed:', event.code, event.reason);
  };

  // Return WebSocket for manual testing
  return ws;
}

// Test function to send a sample message
export function sendTestMessage(
  ws: WebSocket,
  chatId: string,
  message: string
) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'gig_chat_message',
        chatId,
        message,
      })
    );
    console.log('📤 Sent test message:', message);
  } else {
    console.error('❌ WebSocket not connected');
  }
}

// Quick test in browser console:
// const ws = testWebSocketConnection('your-user-id');
// sendTestMessage(ws, 'chat-id', 'Hello World!');
