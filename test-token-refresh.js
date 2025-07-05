// Test token refresh functionality
const axios = require('axios');

const baseURL = 'http://localhost:3000';

async function testTokenRefresh() {
    console.log('🔄 Testing Token Refresh Functionality');
    console.log(`🌐 Backend URL: ${baseURL}`);

    try {
        // Step 1: Login to get valid tokens
        console.log('\n📝 Step 1: Login to get tokens');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'admin1@gmail.com',
            password: 'Admin123!'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true
        });

        console.log(`✅ Login successful: ${loginResponse.status}`);
        console.log(`🍪 Cookies received:`, loginResponse.headers['set-cookie']);

        // Step 2: Extract cookies from response
        const cookies = loginResponse.headers['set-cookie'];
        let cookieString = '';
        if (cookies) {
            cookieString = cookies.map(cookie => cookie.split(';')[0]).join('; ');
        }

        console.log(`🍪 Using cookies: ${cookieString}`);

        // Step 3: Test protected endpoint (should work)
        console.log('\n📝 Step 2: Test protected endpoint with valid tokens');
        const profileResponse = await axios.get(`${baseURL}/api/user/profile`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': cookieString
            },
            withCredentials: true,
            validateStatus: () => true
        });

        console.log(`📊 Profile response status: ${profileResponse.status}`);
        if (profileResponse.status === 200) {
            console.log(`✅ Profile data received successfully`);
        } else {
            console.log(`❌ Profile request failed:`, profileResponse.data);
        }

        // Step 4: Test PUT request to roles-info (the endpoint that was failing)
        console.log('\n📝 Step 3: Test PUT /api/user/roles-info endpoint');
        const rolesResponse = await axios.put(`${baseURL}/api/user/roles-info`, {
            experienceLevel: 'INTERMEDIATE',
            hourlyRate: 75,
            availability: 'Available weekdays',
            workStyle: 'Remote',
            crewSkills: ['Video Editing', 'Motion Graphics'],
            equipmentOwned: ['Camera', 'Editing Software'],
            specializations: ['Corporate Videos']
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': cookieString
            },
            withCredentials: true,
            validateStatus: () => true
        });

        console.log(`📊 Roles update response status: ${rolesResponse.status}`);
        if (rolesResponse.status === 200) {
            console.log(`✅ Roles updated successfully`);
            console.log(`📄 Response:`, JSON.stringify(rolesResponse.data, null, 2));
        } else {
            console.log(`❌ Roles update failed:`, rolesResponse.data);
        }

        // Step 5: Test refresh endpoint directly
        console.log('\n📝 Step 4: Test refresh endpoint directly');
        const refreshResponse = await axios.post(`${baseURL}/api/auth/refresh`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': cookieString
            },
            withCredentials: true,
            validateStatus: () => true
        });

        console.log(`📊 Refresh response status: ${refreshResponse.status}`);
        if (refreshResponse.status === 200) {
            console.log(`✅ Token refresh successful`);
            console.log(`🍪 New cookies:`, refreshResponse.headers['set-cookie']);
        } else {
            console.log(`❌ Token refresh failed:`, refreshResponse.data);
        }

    } catch (error) {
        console.log(`❌ Test failed:`, error.message);
        if (error.response) {
            console.log(`📄 Error Response:`, error.response.data);
            console.log(`📊 Error Status:`, error.response.status);
        }
    }
}

// Run the test
testTokenRefresh().catch(console.error);
