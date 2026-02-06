const { Client } = require('pg');

async function testMultipleFormats() {
    const configs = [
        {
            name: 'Format 1: Just username (ncz24)',
            user: 'ncz24',
        },
        {
            name: 'Format 2: Username with @drexel.edu',
            user: 'ncz24@drexel.edu',
        },
        {
            name: 'Format 3: Admin user (if different)',
            user: 'wisewallet_admin', // Common Azure default
        },
        {
            name: 'Format 4: postgres (default superuser)',
            user: 'postgres',
        }
    ];

    console.log('Testing different username formats...\n');
    console.log('⚠️  Make sure to update the password in this script!\n');

    for (const config of configs) {
        console.log(`\n=== ${config.name} ===`);

        const client = new Client({
            host: 'wisewallet-db.postgres.database.azure.com',
            port: 5432,
            database: 'postgres',
            user: config.user,
            password: 'Neven123', // ⚠️ UPDATE THIS WITH YOUR ACTUAL PASSWORD
            ssl: {
                rejectUnauthorized: false
            }
        });

        try {
            console.log(`Trying: ${config.user}`);
            await client.connect();
            console.log('✅ SUCCESS! This username works!');
            console.log(`\n🎉 Use this in your connection string:`);
            console.log(`User: ${config.user}\n`);

            const result = await client.query('SELECT version()');
            console.log('PostgreSQL:', result.rows[0].version.split('\n')[0]);

            await client.end();
            return; // Stop on first success

        } catch (error) {
            console.log(`❌ Failed: ${error.message.substring(0, 100)}`);
            await client.end().catch(() => { });
        }
    }

    console.log('\n\n⚠️  None of the username formats worked!');
    console.log('\n🔍 Check in Azure Portal:');
    console.log('1. Go to wisewallet-db → Overview');
    console.log('2. Look for "Server admin login name" - use that exact username');
    console.log('3. If you need to reset the password, go to Settings → Reset password');
    console.log('4. Make sure "PostgreSQL authentication" is enabled in Authentication settings');
}

testMultipleFormats().catch(console.error);
