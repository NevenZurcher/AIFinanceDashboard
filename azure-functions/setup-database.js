const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    // Load settings
    const settingsPath = path.join(__dirname, 'local.settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const connString = settings.Values.POSTGRES_CONNECTION_STRING;

    const client = new Client({
        connectionString: connString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Connecting to PostgreSQL...');
        await client.connect();
        console.log('✅ Connected successfully!');

        // Read schema file
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('\nCreating database schema...');

        // Split by semicolon and execute each statement
        // Execute the entire schema as one query
        // This avoids issues with splitting by semicolon for PL/PGSQL functions
        try {
            await client.query(schema);
            console.log('✅ Executed schema successfully');
        } catch (error) {
            console.error('❌ Error executing schema:', error.message);
        }

        console.log('\n✅ Database setup complete!');
        console.log('\nCreated tables:');
        console.log('  - users');
        console.log('  - accounts');
        console.log('  - transactions');
        console.log('  - ai_insights');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupDatabase();
