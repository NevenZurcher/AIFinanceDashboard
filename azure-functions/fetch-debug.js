const https = require('https');

const options = {
    hostname: 'func-finance-dashboard-ncz24.azurewebsites.net',
    path: '/api/GetIncomeStreams?debug=true',
    method: 'GET'
};

https.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('FULL_USER_ID: ' + json.sample_user.user_id);
        } catch (e) {
            console.log(data);
        }
    });
}).on('error', (err) => {
    console.log('Error: ' + err.message);
});
