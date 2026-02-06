const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function viewDatabaseData() {
    // Load connection string
    const settingsPath = path.join(__dirname, 'local.settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const connectionString = settings.Values.POSTGRES_CONNECTION_STRING;

    const pool = new Pool({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('📊 Database Contents\n');
        console.log('='.repeat(80));

        // Check users
        const users = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        console.log('\n👥 USERS (' + users.rows.length + ' total)');
        console.log('-'.repeat(80));
        if (users.rows.length === 0) {
            console.log('  No users yet');
        } else {
            users.rows.forEach(user => {
                console.log(`  • ${user.email || 'No email'}`);
                console.log(`    ID: ${user.user_id}`);
                console.log(`    Firebase UID: ${user.firebase_uid}`);
                console.log(`    Created: ${user.created_at}`);
                console.log('');
            });
        }

        // Check accounts
        const accounts = await pool.query(`
            SELECT a.*, u.email 
            FROM accounts a 
            LEFT JOIN users u ON a.user_id = u.user_id 
            ORDER BY a.created_at DESC
        `);
        console.log('\n💰 ACCOUNTS (' + accounts.rows.length + ' total)');
        console.log('-'.repeat(80));
        if (accounts.rows.length === 0) {
            console.log('  No accounts yet');
        } else {
            accounts.rows.forEach(account => {
                console.log(`  • ${account.account_name} (${account.account_type})`);
                console.log(`    Balance: ${account.currency} ${account.balance}`);
                console.log(`    Owner: ${account.email || 'Unknown'}`);
                console.log(`    Created: ${account.created_at}`);
                console.log('');
            });
        }

        // Check transactions
        const transactions = await pool.query(`
            SELECT t.*, a.account_name, u.email 
            FROM transactions t 
            LEFT JOIN accounts a ON t.account_id = a.account_id 
            LEFT JOIN users u ON t.user_id = u.user_id 
            ORDER BY t.transaction_date DESC 
            LIMIT 20
        `);
        console.log('\n💸 TRANSACTIONS (' + transactions.rows.length + ' total, showing last 20)');
        console.log('-'.repeat(80));
        if (transactions.rows.length === 0) {
            console.log('  No transactions yet');
        } else {
            transactions.rows.forEach(txn => {
                const sign = txn.transaction_type === 'income' ? '+' : '-';
                console.log(`  ${sign} $${txn.amount} - ${txn.category || 'No category'}`);
                console.log(`    ${txn.description || 'No description'}`);
                console.log(`    Account: ${txn.account_name || 'Unknown'}`);
                console.log(`    Date: ${txn.transaction_date}`);
                console.log('');
            });
        }

        // Check AI insights
        const insights = await pool.query(`
            SELECT i.*, u.email 
            FROM ai_insights i 
            LEFT JOIN users u ON i.user_id = u.user_id 
            ORDER BY i.created_at DESC 
            LIMIT 10
        `);
        console.log('\n🤖 AI INSIGHTS (' + insights.rows.length + ' total, showing last 10)');
        console.log('-'.repeat(80));
        if (insights.rows.length === 0) {
            console.log('  No insights yet');
        } else {
            insights.rows.forEach(insight => {
                console.log(`  • ${insight.title} [${insight.insight_type}]`);
                console.log(`    ${insight.description}`);
                console.log(`    Created: ${insight.created_at}`);
                console.log('');
            });
        }

        console.log('='.repeat(80));
        console.log('\n✅ Database query complete!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

viewDatabaseData();
