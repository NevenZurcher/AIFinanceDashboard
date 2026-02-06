const { app } = require('@azure/functions');
const { getConnection, ensureUserExists } = require('../../shared/database');
const { verifyFirebaseToken } = require('../../shared/firebase-auth');

app.http('UpdateIncomeStream', {
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
                        error: 'Income stream ID is required'
                    })
                };
            }

            const body = await request.json();
            const { name, amount, frequency, accountId, isActive } = body;

            if (amount !== undefined && amount < 0) {
                return {
                    status: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Amount cannot be negative'
                    })
                };
            }

            // Build dynamic update query
            const updates = [];
            const values = [];
            let paramIndex = 1;

            if (name !== undefined) {
                updates.push(`name = $${paramIndex++}`);
                values.push(name);
            }
            if (amount !== undefined) {
                updates.push(`amount = $${paramIndex++}`);
                values.push(amount);
            }
            if (frequency !== undefined) {
                updates.push(`frequency = $${paramIndex++}`);
                values.push(frequency);
            }
            if (accountId !== undefined) {
                updates.push(`account_id = $${paramIndex++}`);
                values.push(accountId || null);
            }
            if (isActive !== undefined) {
                updates.push(`is_active = $${paramIndex++}`);
                values.push(isActive);
            }

            if (updates.length === 0) {
                return {
                    status: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'No fields to update'
                    })
                };
            }

            values.push(id, userId);

            const result = await pool.query(`
                UPDATE income_streams 
                SET ${updates.join(', ')}
                WHERE income_stream_id = $${paramIndex++} AND user_id = $${paramIndex}
                RETURNING 
                    income_stream_id as id,
                    name,
                    amount,
                    frequency,
                    is_active as "isActive",
                    account_id as "accountId",
                    created_at as "createdAt"
            `, values);

            if (result.rows.length === 0) {
                return {
                    status: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Income stream not found'
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
            context.error('Error updating income stream:', error);
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
