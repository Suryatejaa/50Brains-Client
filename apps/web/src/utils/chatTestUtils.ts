// Chat Testing Utilities
// Use these functions to debug chat connectivity issues

export function testWebSocketConnection(userId?: string) {
  const testUserId = userId || 'test-user-' + Date.now();

  // Try different WebSocket URLs
  const urls = [
    `ws://localhost:4000/ws?userId=${testUserId}`,
    `ws://localhost:4000?userId=${testUserId}`,
    `ws://localhost:3000/ws?userId=${testUserId}`,
    `ws://localhost:3000?userId=${testUserId}`,
  ];

  console.log('🧪 Testing WebSocket connectivity...');

  urls.forEach((url, index) => {
    console.log(`\n🔗 Test ${index + 1}: ${url}`);

    const ws = new WebSocket(url);

    const timeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        console.log(`⏰ Test ${index + 1}: Connection timeout`);
        ws.close();
      }
    }, 5000);

    ws.onopen = () => {
      clearTimeout(timeout);
      console.log(`✅ Test ${index + 1}: Connected successfully!`);

      // Try to subscribe
      ws.send(
        JSON.stringify({
          type: 'subscribe_gig_chat',
        })
      );

      setTimeout(() => ws.close(), 2000);
    };

    ws.onerror = (error) => {
      clearTimeout(timeout);
      console.log(`❌ Test ${index + 1}: Connection failed`, error);
    };

    ws.onclose = (event) => {
      clearTimeout(timeout);
      console.log(
        `🔌 Test ${index + 1}: Connection closed (${event.code}): ${event.reason}`
      );
    };

    ws.onmessage = (event) => {
      console.log(
        `📨 Test ${index + 1}: Message received:`,
        JSON.parse(event.data)
      );
    };
  });
}

export function testAPIEndpoints(chatId: string, applicationId: string) {
  console.log('🧪 Testing API endpoints...');

  const endpoints = [
    `/api/chat/application/${applicationId}`,
    `/api/chat/${chatId}/messages`,
  ];

  endpoints.forEach(async (endpoint, index) => {
    try {
      console.log(`\n🔗 API Test ${index + 1}: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API Test ${index + 1}: Success`, data);
      } else {
        console.log(
          `❌ API Test ${index + 1}: Failed (${response.status})`,
          await response.text()
        );
      }
    } catch (error) {
      console.log(`❌ API Test ${index + 1}: Error`, error);
    }
  });
}

export function debugChatState(chatData: any, messages: any[]) {
  console.log('🔍 Chat Debug Info:');
  console.log('Chat Data:', chatData);
  console.log('Messages Count:', messages.length);
  console.log('Last Message:', messages[messages.length - 1]);
  console.log('Chat ID:', chatData?.id);
  console.log('User Role:', chatData?.userRole);
  console.log('Is Active:', chatData?.isActive);
}

// Quick test function for browser console
(window as any).testChat = testWebSocketConnection;
(window as any).testAPI = testAPIEndpoints;
(window as any).debugChat = debugChatState;
