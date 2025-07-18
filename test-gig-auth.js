const axios = require('axios');

async function testGigCreation() {
    console.log('🧪 Testing Gig Creation API - Regular vs Draft');
    
    try {
        // Login first
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin1@gmail.com',
            password: 'Admin123!'
        }, {
            withCredentials: true,
            validateStatus: () => true
        });
        
        console.log('✅ Login status:', loginResponse.status);
        const cookies = loginResponse.headers['set-cookie'];
        let cookieString = '';
        if (cookies) {
            cookieString = cookies.map(cookie => cookie.split(';')[0]).join('; ');
        }
        
        const baseGigData = {
            title: 'Instagram reel test',
            description: 'Instagram reel desc to let creators understand more to deliver the expected output',
            budgetMin: 10,
            budgetMax: 100,
            budgetType: 'fixed',
            roleRequired: 'editor',
            experienceLevel: 'intermediate',
            skillsRequired: [
                'Copywriting',
                'Photography', 
                'Video Editing',
                'Instagram Marketing'
            ],
            isClanAllowed: true,
            location: 'remote',
            duration: '3 days',
            urgency: 'normal',
            category: 'content-creation',
            deliverables: [
                '1 Instagram Reel (60 seconds)',
                '3 Instagram Stories',
                'Caption with hashtags'
            ],
            requirements: 'Must have experience with fashion/lifestyle content',
            deadline: '2025-07-12T23:59:59.000Z'
        };
        
        console.log('\n📝 Testing REGULAR gig creation: /api/gig');
        const regularResponse = await axios.post('http://localhost:3000/api/gig', baseGigData, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieString
            },
            withCredentials: true,
            validateStatus: () => true
        });
        
        console.log('📊 Regular gig response status:', regularResponse.status);
        if (regularResponse.status === 200 || regularResponse.status === 201) {
            console.log('✅ Regular gig created successfully!');
        } else {
            console.log('❌ Regular gig failed:', regularResponse.data);
        }
        
        console.log('\n� Testing DRAFT gig creation: /api/gig with status=DRAFT');
        const draftData = { ...baseGigData, status: 'DRAFT', title: 'Instagram reel DRAFT test' };
        const draftResponse = await axios.post('http://localhost:3000/api/gig', draftData, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieString
            },
            withCredentials: true,
            validateStatus: () => true
        });
        
        console.log('📊 Draft gig response status:', draftResponse.status);
        if (draftResponse.status === 200 || draftResponse.status === 201) {
            console.log('✅ Draft gig created successfully!');
        } else {
            console.log('❌ Draft gig failed:', draftResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testGigCreation();
