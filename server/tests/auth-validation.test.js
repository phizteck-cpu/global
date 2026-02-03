import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

async function testValidation() {
    console.log('🧪 Starting Auth Validation Tests...\n');

    // Test 1: Signup with Short Password
    try {
        console.log('1️⃣ Testing Short Password (should fail)...');
        await axios.post(`${BASE_URL}/auth/signup`, {
            firstName: 'Test',
            lastName: 'User',
            username: 'validuser', // Valid
            email: 'valid@example.com', // Valid
            password: '123' // Invalid (too short)
        });
        console.log('❌ Failed: Server accepted short password!');
    } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.message === 'Validation Error') {
            console.log('✅ Passed: Short password rejected correctly.');
        } else {
            console.log('❌ Failed: Unexpected error:', error.code || error.message);
            if (error.response) console.log('Response data:', error.response.data);
        }
    }

    // Test 2: Signup with Invalid Email
    try {
        console.log('\n2️⃣ Testing Invalid Email (should fail)...');
        await axios.post(`${BASE_URL}/auth/signup`, {
            firstName: 'Test',
            lastName: 'User',
            username: 'validuser2',
            email: 'not-an-email', // Invalid
            password: 'ValidPassword123'
        });
        console.log('❌ Failed: Server accepted invalid email!');
    } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.message === 'Validation Error') {
            console.log('✅ Passed: Invalid email rejected correctly.');
        } else {
            console.log('❌ Failed: Unexpected error:', error.code || error.message);
            if (error.response) console.log('Response data:', error.response.data);
        }
    }

    // Test 3: Signup with Valid Data (should succeed or fail with duplicate user if already exists)
    try {
        console.log('\n3️⃣ Testing Valid Signup...');
        // Use random username/email to ensure uniqueness
        const uniqueId = Date.now();
        await axios.post(`${BASE_URL}/auth/signup`, {
            firstName: 'Test',
            lastName: 'User',
            username: `valid${uniqueId}`,
            email: `valid${uniqueId}@example.com`,
            password: 'ValidPassword123'
        });
        console.log('✅ Passed: Valid signup accepted.');
    } catch (error) {
        // If user already exists (from previous runs), that's also technically a "pass" for format validation
        if (error.response && error.response.data.message.includes('already exists')) {
            console.log('✅ Passed: Format valid (User duplicate check working).');
        } else {
            console.log('❌ Failed:', error.response ? error.response.data : error.message);
        }
    }
}

testValidation();
