import axios from 'axios';

const verify = async () => {
    try {
        console.log('Testing direct access to Delivery Service...');
        const res1 = await axios.get('http://localhost:3005/drones');
        console.log(`Direct Access: ${res1.status} ${res1.statusText}`);
        console.log('Data length:', res1.data.length);

        console.log('\nTesting access via API Gateway...');
        const res2 = await axios.get('http://localhost:3000/api/delivery');
        console.log(`Gateway Access: ${res2.status} ${res2.statusText}`);
        console.log('Data length:', res2.data.length);

        console.log('\n✅ Verification Successful!');
    } catch (err) {
        console.error('\n❌ Verification Failed:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
};

verify();
