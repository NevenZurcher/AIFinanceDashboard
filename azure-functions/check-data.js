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

        console.log('--- Users ---');
        const users = await client.query('SELECT user_id, firebase_uid, email FROM users');
        console.table(users.rows);

        console.log('\n--- Accounts ---');
        const accounts = await client.query('SELECT account_id, user_id, account_name FROM accounts LIMIT 5');
        console.table(accounts.rows);

        console.log('\n--- Income Streams ---');
        const streams = await client.query('SELECT * FROM income_streams');
        console.table(streams.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkData();
