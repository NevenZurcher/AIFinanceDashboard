const { app } = require('@azure/functions');
const { getConnection, ensureUserExists } = require('../../shared/database');
const { verifyFirebaseToken } = require('../../shared/firebase-auth');

app.http('GetAIInsights', {
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

            const result = await pool.query(`
                SELECT 
                    insight_id as id,
                    title,
                    description,
                    insight_type as type,
                    created_at as "createdAt"
                FROM ai_insights 
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT 10
            `, [userId]);

            return {
                status: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: result.rows
                })
            };
        } catch (error) {
            context.error('Error getting AI insights:', error);
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
