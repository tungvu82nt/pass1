import { Pool } from 'pg';

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize database table if not exists
const initializeDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS passwords (
                id SERIAL PRIMARY KEY,
                service VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create index for better search performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_passwords_service ON passwords(service);
            CREATE INDEX IF NOT EXISTS idx_passwords_username ON passwords(username);
        `);
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

// Helper function để parse request body
const parseBody = (event) => {
    try {
        return JSON.parse(event.body || '{}');
    } catch {
        return {};
    }
};

// Helper function để tạo response
const createResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify(body)
});

export const handler = async (event, context) => {
    // Initialize database on first request
    await initializeDatabase();
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return createResponse(200, {});
    }

    const { httpMethod, path, queryStringParameters } = event;
    
    try {
        // Parse path để lấy route - Netlify Functions sẽ có path như /.netlify/functions/api
        const pathParts = path.split('/').filter(Boolean);
        
        // Lấy ID từ path nếu có (cho PUT/DELETE operations)
        const id = pathParts[pathParts.length - 1];
        const isIdPath = id && !isNaN(Number(id));

        // GET /api - List all passwords
        if (httpMethod === 'GET') {
            const { searchQuery } = queryStringParameters || {};
            let query = 'SELECT * FROM passwords ORDER BY updated_at DESC';
            let params = [];

            if (searchQuery) {
                query = `
                    SELECT * FROM passwords 
                    WHERE service ILIKE $1 OR username ILIKE $1 
                    ORDER BY updated_at DESC
                `;
                params = [`%${searchQuery}%`];
            }

            const { rows } = await pool.query(query, params);
            return createResponse(200, rows);
        }

        // POST /api - Create new password
        if (httpMethod === 'POST') {
            const { service, username, password } = parseBody(event);
            
            if (!service || !username || !password) {
                return createResponse(400, { error: 'Missing required fields' });
            }

            const { rows } = await pool.query(
                'INSERT INTO passwords (service, username, password) VALUES ($1, $2, $3) RETURNING *',
                [service, username, password]
            );
            return createResponse(201, rows[0]);
        }

        // PUT /api/:id - Update password
        if (httpMethod === 'PUT' && isIdPath) {
            const { service, username, password } = parseBody(event);

            if (!service || !username || !password) {
                return createResponse(400, { error: 'Missing required fields' });
            }

            const { rows } = await pool.query(
                'UPDATE passwords SET service = $1, username = $2, password = $3 WHERE id = $4 RETURNING *',
                [service, username, password, id]
            );

            if (rows.length === 0) {
                return createResponse(404, { error: 'Password not found' });
            }

            return createResponse(200, rows[0]);
        }

        // DELETE /api/:id - Delete password
        if (httpMethod === 'DELETE' && isIdPath) {
            const { rowCount } = await pool.query('DELETE FROM passwords WHERE id = $1', [id]);
            
            if (rowCount === 0) {
                return createResponse(404, { error: 'Password not found' });
            }

            return createResponse(200, { message: 'Password deleted' });
        }

        return createResponse(405, { error: 'Method not allowed' });

    } catch (error) {
        console.error('API Error:', error);
        return createResponse(500, { error: 'Internal server error' });
    }
};