const { Client } = require('pg');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

async function getAzureToken() {
    try {
        console.log('🔑 Getting Azure AD access token...');
        const { stdout } = await execPromise(
            'az account get-access-token --resource https://ossrdbms-aad.database.windows.net --query accessToken --output tsv'
        );
        return stdout.trim();
    } catch (error) {
        console.error('❌ Failed to get Azure AD token.');
        console.error('Make sure you are logged in with: az login');
        throw error;
    }
}

async function testWithAzureAD() {
    const token = await getAzureToken();
    console.log('✅ Got access token');

    const client = new Client({
        host: 'wisewallet-db.postgres.database.azure.com',
        port: 5432,
        database: 'postgres',
        user: 'ncz24@drexel.edu',
        password: token,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔌 Connecting with Azure AD authentication...');
        await client.connect();
        console.log('✅ Connected!');

        const result = await client.query('SELECT version()');
        console.log('✅ Query successful!');
        console.log('PostgreSQL:', result.rows[0].version.split('\n')[0]);

    } catch (error) {
        console.error('\n❌ Connection failed:', error.message);
    } finally {
        await client.end();
    }
}

testWithAzureAD().catch(console.error);
