// Simple Node.js script to test the login API
const axios = require('axios');

const baseURL = 'http://localhost:3000';

async function testLogin(email, password, description) {
    console.log(`\n🧪 Testing ${description}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${'*'.repeat(password.length)}`);

    try {
        const response = await axios.post(`${baseURL}/api/auth/login`, {
            email,
            password
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: () => true // Don't throw on any status code
        });

        console.log(`✅ Response Status: ${response.status} ${response.statusText}`);
        console.log(`📄 Response Data:`, JSON.stringify(response.data, null, 2));
        console.log(`📋 Response Headers:`, response.headers);

    } catch (error) {
        console.log(`❌ Request Failed:`, error.message);
        if (error.response) {
            console.log(`📄 Error Response:`, error.response.data);
            console.log(`📊 Error Status:`, error.response.status);
        } else if (error.request) {
            console.log(`📡 No Response Received:`, error.request);
        }
    }
}

async function runTests() {
    console.log('🚀 Starting Login API Tests');
    console.log(`🌐 Backend URL: ${baseURL}`);

    // Test correct credentials
    await testLogin('admin1@gmail.com', 'Admin123!', 'CORRECT CREDENTIALS');

    // Test wrong password
    await testLogin('admin1@gmail.com', 'WrongPassword123!', 'WRONG PASSWORD');

    // Test non-existent email
    await testLogin('nonexistent@gmail.com', 'SomePassword123!', 'NON-EXISTENT EMAIL');

    console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);
