const { app } = require('@azure/functions');
const { getConnection, ensureUserExists } = require('../../shared/database');
const { verifyFirebaseToken } = require('../../shared/firebase-auth');

app.http('GetIncomeStreams', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };

        if (request.method === 'OPTIONS') {
            return { status: 200, headers };
        }

        try {
            if (request.query.get('debug') === 'true') {
                console.log('Debug mode activated: Using first user');
                const pool = getConnection(); // Ensure pool is ready
                const userRes = await pool.query('SELECT user_id FROM users LIMIT 1');
                if (userRes.rows.length > 0) {
                    const debugUserId = userRes.rows[0].user_id;
                    console.log(`Debug simulating user: ${debugUserId}`);
                    // Proceed to normal flow but override userId logic? 
                    // No, easier to just run query here and return
                    const result = await pool.query(`
                        SELECT 
                            i.income_stream_id as id,
                            i.name,
                            i.amount,
                            i.frequency,
                            i.is_active as "isActive",
                            i.account_id as "accountId",
                            a.account_name as "accountName",
                            i.last_deposit_date as "lastDepositDate",
                            i.next_deposit_date as "nextDepositDate",
                            i.created_at as "createdAt"
                        FROM income_streams i
                        LEFT JOIN accounts a ON i.account_id = a.account_id
                        WHERE i.user_id = $1
                        ORDER BY i.created_at DESC
                    `, [debugUserId]);

                    return {
                        status: 200,
                        headers,
                        body: JSON.stringify({
                            debug: true,
                            simulated_userId: debugUserId,
                            result_count: result.rows.length,
                            data: result.rows
                        }, null, 2)
                    };
                }
            }

            const decodedToken = await verifyFirebaseToken(request);
            const pool = getConnection();

            const userId = await ensureUserExists(
                decodedToken.uid,
                decodedToken.email,
                decodedToken.name
            );

            console.log(`GetIncomeStreams for userId: ${userId}`);

            const result = await pool.query(`
                SELECT 
                    i.income_stream_id as id,
                    i.name,
                    i.amount,
                    i.frequency,
                    i.is_active as "isActive",
                    i.account_id as "accountId",
                    a.account_name as "accountName",
                    i.last_deposit_date as "lastDepositDate",
                    i.next_deposit_date as "nextDepositDate",
                    i.created_at as "createdAt"
                FROM income_streams i
                LEFT JOIN accounts a ON i.account_id = a.account_id
                WHERE i.user_id = $1
                ORDER BY i.created_at DESC
            `, [userId]);

            console.log(`Found ${result.rows.length} income streams`);
            console.log('Result sample:', JSON.stringify(result.rows[0]));

            return {
                status: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: result.rows
                })
            };
        } catch (error) {
            context.error('Error getting income streams:', error);
            return {
                status: error.message.includes('token') ? 401 : 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: error.message
                })
            };
        }
    }
});
