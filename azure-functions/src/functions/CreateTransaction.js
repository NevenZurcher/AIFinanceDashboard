const { app } = require('@azure/functions');
const { getConnection, ensureUserExists } = require('../../shared/database');
const { verifyFirebaseToken } = require('../../shared/firebase-auth');

app.http('CreateTransaction', {
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
            const { amount, category, description, type, accountId, date } = body;

            if (amount === undefined || !type) {
                return {
                    status: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Amount and type are required'
                    })
                };
            }

            const transactionDate = date ? new Date(date) : new Date();

            const result = await pool.query(`
                INSERT INTO transactions (user_id, account_id, amount, category, description, transaction_type, transaction_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING 
                    transaction_id as id,
                    amount,
                    category,
                    description,
                    transaction_date as date,
                    transaction_type as type
            `, [userId, accountId || null, amount, category, description, type, transactionDate]);

            // Update account balance
            if (accountId) {
                const balanceChange = type === 'income' ? amount : -Math.abs(amount);
                await pool.query(`
                    UPDATE accounts 
                    SET balance = balance + $1
                    WHERE account_id = $2 AND user_id = $3
                `, [balanceChange, accountId, userId]);
            }

            return {
                status: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: result.rows[0]
                })
            };
        } catch (error) {
            context.error('Error creating transaction:', error);
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
