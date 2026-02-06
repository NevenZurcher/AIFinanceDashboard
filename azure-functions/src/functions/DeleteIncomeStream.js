const { app } = require('@azure/functions');
const { getConnection, ensureUserExists } = require('../../shared/database');
const { verifyFirebaseToken } = require('../../shared/firebase-auth');

app.http('DeleteIncomeStream', {
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
                        error: 'Income stream ID is required'
                    })
                };
            }

            const result = await pool.query(`
                DELETE FROM income_streams 
                WHERE income_stream_id = $1 AND user_id = $2
                RETURNING income_stream_id
            `, [id, userId]);

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
                    message: 'Income stream deleted successfully'
                })
            };
        } catch (error) {
            context.error('Error deleting income stream:', error);
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
