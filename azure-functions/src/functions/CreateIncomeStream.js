const { app } = require('@azure/functions');
const { getConnection, ensureUserExists } = require('../../shared/database');
const { verifyFirebaseToken } = require('../../shared/firebase-auth');

app.http('CreateIncomeStream', {
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
            const { name, amount, frequency, accountId, isActive = true } = body;

            if (!name || amount === undefined || !frequency) {
                return {
                    status: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Name, amount, and frequency are required'
                    })
                };
            }

            if (amount < 0) {
                return {
                    status: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Amount cannot be negative'
                    })
                };
            }

            const result = await pool.query(`
                INSERT INTO income_streams (user_id, account_id, name, amount, frequency, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING 
                    income_stream_id as id,
                    name,
                    amount,
                    frequency,
                    is_active as "isActive",
                    account_id as "accountId",
                    created_at as "createdAt"
            `, [userId, accountId || null, name, amount, frequency, isActive]);

            return {
                status: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: result.rows[0]
                })
            };
        } catch (error) {
            context.error('Error creating income stream:', error);
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
