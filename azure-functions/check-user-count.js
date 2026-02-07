const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function checkUserCount() {
    const settingsPath = path.join(__dirname, 'local.settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath));
    const connectionString = settings.Values.POSTGRES_CONNECTION_STRING;

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT count(*) FROM users');
        console.log('Total Users:', res.rows[0].count);

        const res2 = await client.query('SELECT firebase_uid, count(*) FROM users GROUP BY firebase_uid HAVING count(*) > 1');
        if (res2.rows.length > 0) {
            console.log('Duplicate Firebase UIDs found!');
        } else {
            console.log('No duplicate Firebase UIDs.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUserCount();
