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
            const body = JSON.parse(rawData);
            console.log('ERROR_MESSAGE: ' + body.error);
        } catch (e) {
            console.log('RAW_BODY_START: ' + rawData.substring(0, 100));
            console.log('PARSE_ERROR: ' + e.message);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
