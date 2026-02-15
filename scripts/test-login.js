import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api/auth/login';

const testLogin = async () => {
    try {
        console.log(`Testing login at ${API_URL}...`);

        const credentials = {
            username: 'admin',
            password: 'admin123'
        };

        const response = await axios.post(API_URL, credentials);

        if (response.status === 200 && response.data.token) {
            console.log('✅ Login Successful!');
            console.log('User Role:', response.data.user.role);
            console.log('Token received (partial):', response.data.token.substring(0, 20) + '...');
        } else {
            console.log('❌ Login Failed (Unexpected response):', response.data);
        }

    } catch (error) {
        if (error.response) {
            console.error('❌ Login Failed:', error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            console.error('❌ Connection Refused. Is the server running on port 5000?');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
};

testLogin();
