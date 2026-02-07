const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function checkTypes() {
    const settingsPath = path.join(__dirname, 'local.settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath));
    const connectionString = settings.Values.POSTGRES_CONNECTION_STRING;

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('accounts', 'income_streams') 
            AND column_name = 'account_id'
        `);

        console.log('Column Types:');
        res.rows.forEach(row => {
            console.log(`${row.table_name}.${row.column_name}: ${row.data_type}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkTypes();
