const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function getUserId() {
    const settingsPath = path.join(__dirname, 'local.settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath));
    const connectionString = settings.Values.POSTGRES_CONNECTION_STRING;

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT user_id FROM users LIMIT 1');
        if (res.rows.length > 0) {
            console.log(res.rows[0].user_id);
        } else {
            console.log('NO_USER');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

getUserId();
