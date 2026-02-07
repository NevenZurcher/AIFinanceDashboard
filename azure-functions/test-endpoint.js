const https = require('https');

const options = {
    hostname: 'func-finance-dashboard-ncz24.azurewebsites.net',
    path: '/api/GetAccounts',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer 1234567890'
    }
};

console.log('Sending request to', options.hostname + options.path);

const req = https.request(options, res => {
    console.log(`StatusCode: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', chunk => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Body:', data);
    });
});

req.on('error', error => {
    console.error('Error:', error);
});

req.end();
