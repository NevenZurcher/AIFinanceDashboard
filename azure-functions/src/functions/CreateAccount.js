const { app } = require('@azure/functions');
const { getConnection, ensureUserExists } = require('../../shared/database');
const { verifyFirebaseToken } = require('../../shared/firebase-auth');

app.http('CreateAccount', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

            const body = await request.json();
            const { name, type, balance = 0, currency = 'USD' } = body;

            if (!name || !type) {
                return {
                    status: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Name and type are required'
                    })
                };
            }

            const result = await pool.query(`
                INSERT INTO accounts (user_id, account_name, account_type, balance, currency)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING 
                    account_id as id,
                    account_name as name,
                    account_type as type,
                    balance,
                    currency,
                    created_at as "createdAt"
            `, [userId, name, type, balance, currency]);

            return {
                status: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: result.rows[0]
                })
            };
        } catch (error) {
            context.error('Error creating account:', error);
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
