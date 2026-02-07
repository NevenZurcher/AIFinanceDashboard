const { app } = require('@azure/functions');
const { getConnection, ensureUserExists } = require('../../shared/database');
const { verifyFirebaseToken } = require('../../shared/firebase-auth');

app.http('UpdateAccount', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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
            const id = url.searchParams.get('id');

            if (!id) {
                return {
                    status: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Account ID is required'
                    })
                };
            }

            const body = await request.json();
            const { name, type } = body;

            const result = await pool.query(`
                UPDATE accounts 
                SET account_name = COALESCE($1, account_name),
                    account_type = COALESCE($2, account_type),
                    updated_at = CURRENT_TIMESTAMP
                WHERE account_id = $3 AND user_id = $4
                RETURNING 
                    account_id as id,
                    account_name as name,
                    account_type as type,
                    balance,
                    currency,
                    created_at as "createdAt"
            `, [name, type, id, userId]);

            if (result.rows.length === 0) {
                return {
                    status: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Account not found'
                    })
                };
            }

            return {
                status: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: result.rows[0]
                })
            };
        } catch (error) {
            context.error('Error updating account:', error);
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
