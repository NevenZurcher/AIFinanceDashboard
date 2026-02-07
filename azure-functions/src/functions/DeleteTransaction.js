const { app } = require('@azure/functions');
const { getConnection, ensureUserExists } = require('../../shared/database');
const { verifyFirebaseToken } = require('../../shared/firebase-auth');

app.http('DeleteTransaction', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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
                        error: 'Transaction ID is required'
                    })
                };
            }

            // Get transaction details for balance reversal
            const txn = await pool.query(`
                SELECT amount, transaction_type, account_id 
                FROM transactions 
                WHERE transaction_id = $1 AND user_id = $2
            `, [id, userId]);

            if (txn.rows.length === 0) {
                return {
                    status: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Transaction not found'
                    })
                };
            }

            const { amount, transaction_type, account_id } = txn.rows[0];

            // Delete the transaction
            await pool.query(`
                DELETE FROM transactions 
                WHERE transaction_id = $1 AND user_id = $2
            `, [id, userId]);

            // Reverse the balance change
            if (account_id) {
                const balanceChange = transaction_type === 'income' ? -amount : Math.abs(amount);
                await pool.query(`
                    UPDATE accounts 
                    SET balance = balance + $1
                    WHERE account_id = $2 AND user_id = $3
                `, [balanceChange, account_id, userId]);
            }

            return {
                status: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Transaction deleted successfully'
                })
            };
        } catch (error) {
            context.error('Error deleting transaction:', error);
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
