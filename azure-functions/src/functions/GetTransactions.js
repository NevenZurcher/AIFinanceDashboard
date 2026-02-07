const { app } = require('@azure/functions');
const { getConnection, ensureUserExists } = require('../../shared/database');
const { verifyFirebaseToken } = require('../../shared/firebase-auth');

app.http('GetTransactions', {
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
            const decodedToken = await verifyFirebaseToken(request);
            const pool = getConnection();

            const userId = await ensureUserExists(
                decodedToken.uid,
                decodedToken.email,
                decodedToken.name
            );

            const url = new URL(request.url);
            const limit = parseInt(url.searchParams.get('limit') || '50');
            const accountId = url.searchParams.get('accountId');

            let query = `
                SELECT 
                    t.transaction_id as id,
                    t.amount,
                    t.category,
                    t.description,
                    t.transaction_date as date,
                    t.transaction_type as type,
                    a.account_name as "accountName"
                FROM transactions t
                LEFT JOIN accounts a ON t.account_id = a.account_id
                WHERE t.user_id = $1
            `;
            const params = [userId];

            if (accountId) {
                query += ` AND t.account_id = $2`;
                params.push(accountId);
            }

            query += ` ORDER BY t.transaction_date DESC LIMIT $${params.length + 1}`;
            params.push(limit);

            const result = await pool.query(query, params);

            return {
                status: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: result.rows
                })
            };
        } catch (error) {
            context.error('Error getting transactions:', error);
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
