const https = require('https');

const options = {
    hostname: 'func-finance-dashboard-ncz24.azurewebsites.net',
    path: '/api/GetAccounts',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer 1234567890' // Dummy token
    }
};

console.log('Sending request...');

const req = https.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            console.log('BODY:', rawData);
        } catch (e) {
            console.error(e.message);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
