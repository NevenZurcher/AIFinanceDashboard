const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function checkData() {
    const settingsPath = path.join(__dirname, 'local.settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath));
    const connectionString = settings.Values.POSTGRES_CONNECTION_STRING;

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const data = {};

        const users = await client.query('SELECT user_id, firebase_uid, email FROM users');
        data.users = users.rows;

        const accounts = await client.query('SELECT account_id, user_id, account_name FROM accounts LIMIT 5');
        data.accounts = accounts.rows;

        const streams = await client.query('SELECT income_stream_id, user_id, account_id, name, amount FROM income_streams');
        data.income_streams = streams.rows;

        console.log(JSON.stringify(data, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkData();
