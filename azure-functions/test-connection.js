const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function testConnection() {
    // Load local.settings.json
    const settingsPath = path.join(__dirname, 'local.settings.json');
    let connectionString = process.env.POSTGRES_CONNECTION_STRING;

    if (!connectionString && fs.existsSync(settingsPath)) {
        console.log('📄 Loading connection string from local.settings.json...');
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        connectionString = settings.Values.POSTGRES_CONNECTION_STRING;
    }

    if (!connectionString) {
        console.error('❌ No connection string found!');
        console.error('Please set POSTGRES_CONNECTION_STRING in local.settings.json');
        return;
    }

    console.log('🔗 Connection string found');
    console.log('Host:', connectionString.match(/\/\/[^:]+@([^:]+)/)?.[1] || 'unknown');

    const pool = new Pool({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('\n🔌 Testing PostgreSQL connection...');
        const result = await pool.query('SELECT NOW() as current_time, version() as version');
        console.log('✅ Connection successful!');
        console.log('📅 Current time:', result.rows[0].current_time);
        console.log('🐘 PostgreSQL version:', result.rows[0].version.split('\n')[0]);

        // Test if tables exist
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('\n📊 Existing tables:');
        if (tablesResult.rows.length === 0) {
            console.log('  ⚠️  No tables found. Run "node setup-database.js" to create schema.');
        } else {
            tablesResult.rows.forEach(row => {
                console.log(`  ✓ ${row.table_name}`);
            });
        }

    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error.message);
        console.error('Code:', error.code);

        console.error('\n🔧 Troubleshooting:');
        if (error.code === 'ENOTFOUND') {
            console.error('  → DNS resolution failed. Check your internet connection.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('  → Connection refused. Check firewall settings.');
        } else if (error.message.includes('password')) {
            console.error('  → Authentication failed. Check username and password.');
        } else if (error.message.includes('no pg_hba.conf')) {
            console.error('  → Firewall blocking connection. Add your IP in Azure Portal:');
            console.error('     1. Go to Azure Portal → wisewallet-db');
            console.error('     2. Click "Networking" or "Connection security"');
            console.error('     3. Add your current IP address');
            console.error('     4. Click Save and wait 1-2 minutes');
        } else {
            console.error('  → Check that POSTGRES_CONNECTION_STRING is correct in local.settings.json');
            console.error('  → Verify firewall allows your IP in Azure Portal');
            console.error('  → Confirm credentials work in pgAdmin');
        }
    } finally {
        await pool.end();
    }
}

testConnection();
