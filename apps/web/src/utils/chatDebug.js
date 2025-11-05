// Chat Debug Helper - Add to browser console for debugging
// Usage: testChatConnectivity()

function testChatConnectivity() {
    console.log('🧪 Testing Chat Connectivity...');

    // Test WebSocket connections
    const testUrls = [
        'ws://localhost:4000/ws?userId=test-user',
        'ws://localhost:4000?userId=test-user'
    ];

    testUrls.forEach((url, index) => {
        console.log(`\n🔗 Testing: ${url}`);

        const ws = new WebSocket(url);

        const timeout = setTimeout(() => {
            console.log(`⏰ Test ${index + 1}: Timeout`);
            ws.close();
        }, 5000);

        ws.onopen = () => {
            clearTimeout(timeout);
            console.log(`✅ Test ${index + 1}: Connected!`);

            // Test subscription
            ws.send(JSON.stringify({
                type: 'subscribe_gig_chat'
            }));

            setTimeout(() => ws.close(), 2000);
        };

        ws.onerror = (error) => {
            clearTimeout(timeout);
            console.log(`❌ Test ${index + 1}: Failed`, error);
        };

        ws.onclose = (event) => {
            console.log(`🔌 Test ${index + 1}: Closed (${event.code})`);
        };

        ws.onmessage = (event) => {
            console.log(`📨 Test ${index + 1}: Message:`, JSON.parse(event.data));
        };
    });
}

// Test API endpoints
async function testChatAPI(applicationId) {
    console.log('🧪 Testing Chat API...');

    try {
        const response = await fetch(`/api/chat/application/${applicationId}`);
        const data = await response.json();
        console.log('✅ Chat API Response:', data);
        return data;
    } catch (error) {
        console.error('❌ Chat API Error:', error);
    }
}

// Export for browser console
window.testChatConnectivity = testChatConnectivity;
window.testChatAPI = testChatAPI;

console.log('💡 Chat debugging functions loaded!');
console.log('Run: testChatConnectivity() to test WebSocket');
console.log('Run: testChatAPI("application-id") to test API');