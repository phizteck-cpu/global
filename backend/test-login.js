import axios from 'axios';

async function testLogin() {
    try {
        console.log('Attempting login with superadmin...');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'superadmin',
            password: 'superadmin123'
        });
        console.log('Login successful!');
        console.log('Status:', response.status);
        console.log('Body:', response.data);
    } catch (error) {
        console.error('Login failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testLogin();
