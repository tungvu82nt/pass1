import { Pool } from 'pg';

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

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
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return createResponse(200, {});
    }

    const { httpMethod, path, queryStringParameters } = event;
    
    try {
        // Parse path để lấy route
        const pathParts = path.split('/').filter(Boolean);
        const isPasswordsRoute = pathParts.includes('passwords');
        
        if (!isPasswordsRoute) {
            return createResponse(404, { error: 'Route not found' });
        }

        // GET /api/passwords - List all passwords
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

        // POST /api/passwords - Create new password
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

        // PUT /api/passwords/:id - Update password
        if (httpMethod === 'PUT') {
            const id = pathParts[pathParts.length - 1];
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

        // DELETE /api/passwords/:id - Delete password
        if (httpMethod === 'DELETE') {
            const id = pathParts[pathParts.length - 1];
            
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