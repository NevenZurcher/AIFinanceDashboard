const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function checkUsers() {
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
        const users = await client.query('SELECT user_id, firebase_uid FROM users');
        console.log(JSON.stringify(users.rows, null, 2));

        console.log('\n--- Income Streams Count ---');
        const counts = await client.query('SELECT user_id, count(*) FROM income_streams GROUP BY user_id');
        console.log(JSON.stringify(counts.rows, null, 2));

        // Check exact join match for first stream
        const firstStream = await client.query('SELECT user_id, account_id FROM income_streams LIMIT 1');
        if (firstStream.rows.length > 0) {
            const uid = firstStream.rows[0].user_id;
            const aid = firstStream.rows[0].account_id;
            console.log(`\nChecking Join for User ${uid}, Account ${aid}`);

            const joinCheck = await client.query(`
                SELECT i.income_stream_id, a.account_name 
                FROM income_streams i 
                LEFT JOIN accounts a ON i.account_id = a.account_id 
                WHERE i.user_id = $1
            `, [uid]);
            console.log('Join Result:', joinCheck.rows);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUsers();
