const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
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

        // Read migration file
        const migrationPath = path.join(__dirname, 'database', 'add-income-streams.sql');
        const migration = fs.readFileSync(migrationPath, 'utf8');

        console.log('\nRunning income_streams migration...');
        await client.query(migration);
        console.log('✅ Migration complete!');

        // Verify table was created
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'income_streams'
            ORDER BY ordinal_position
        `);

        console.log('\n📋 income_streams table columns:');
        result.rows.forEach(row => {
            console.log(`  • ${row.column_name}: ${row.data_type}`);
        });

        console.log('\n✅ Income streams table is ready!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
