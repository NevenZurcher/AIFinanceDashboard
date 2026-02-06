const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function checkSchema() {
    const settingsPath = path.join(__dirname, 'local.settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const connString = settings.Values.POSTGRES_CONNECTION_STRING;

    const client = new Client({
        connectionString: connString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database\n');

        // Check accounts table
        const accounts = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'accounts'
            ORDER BY ordinal_position
        `);

        console.log('ACCOUNTS table columns:');
        accounts.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));

        // Check users table
        const users = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);

        console.log('\nUSERS table columns:');
        users.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

checkSchema();
