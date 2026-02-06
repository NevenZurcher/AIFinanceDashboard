const { Pool } = require('pg');

let pool;

function getConnection() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.POSTGRES_CONNECTION_STRING,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }
    return pool;
}

async function ensureUserExists(firebaseUID, email, displayName) {
    const pool = getConnection();

    // Check if user exists
    const result = await pool.query(
        'SELECT user_id FROM users WHERE firebase_uid = $1',
        [firebaseUID]
    );

    if (result.rows.length > 0) {
        return result.rows[0].user_id;
    }

    // Create new user
    const insertResult = await pool.query(
        `INSERT INTO users (firebase_uid, email, display_name)
         VALUES ($1, $2, $3)
         RETURNING user_id`,
        [firebaseUID, email, displayName]
    );

    return insertResult.rows[0].user_id;
}

module.exports = { getConnection, ensureUserExists };
