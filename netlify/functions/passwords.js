// Password CRUD operations function cho Memory Safe Guard
const { Pool } = require('pg');

// Database connection pool
let pool = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Handle CORS preflight
const handleCors = (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  return null;
};

// Create passwords table if not exists
const ensureTable = async (client) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS passwords (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL,
      password TEXT NOT NULL,
      url VARCHAR(500),
      notes TEXT,
      folder VARCHAR(255),
      tags TEXT[],
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(service, username)
    );
    
    CREATE INDEX IF NOT EXISTS idx_passwords_service ON passwords(service);
    CREATE INDEX IF NOT EXISTS idx_passwords_username ON passwords(username);
    CREATE INDEX IF NOT EXISTS idx_passwords_updated_at ON passwords(updated_at DESC);
  `;

  await client.query(createTableQuery);
};

// GET - Lấy tất cả passwords
const getPasswords = async (event) => {
  const pool = getPool();
  const client = await pool.connect();
  const search = event.queryStringParameters && event.queryStringParameters.search;

  try {
    // await ensureTable(client); // Skip ensuring on every read for performance

    let query = `
      SELECT id, service, username, password, url, notes, folder, tags, created_at, updated_at 
      FROM passwords 
    `;

    const params = [];

    if (search) {
      query += ` WHERE service ILIKE $1 OR username ILIKE $1 `;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY updated_at DESC`;

    const result = await client.query(query, params);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: result.rows,
        count: result.rows.length
      })
    };
  } finally {
    client.release();
  }
};

// POST - Tạo password mới
const createPassword = async (data) => {
  const { service, username, password, url, notes, folder, tags } = data;

  if (!service || !username || !password) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Service, username, and password are required'
      })
    };
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    // await ensureTable(client);

    const result = await client.query(`
      INSERT INTO passwords (service, username, password, url, notes, folder, tags, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (service, username) 
      DO UPDATE SET 
        password = EXCLUDED.password,
        url = EXCLUDED.url,
        notes = EXCLUDED.notes,
        folder = EXCLUDED.folder,
        tags = EXCLUDED.tags,
        updated_at = NOW()
      RETURNING *
    `, [service, username, password, url || null, notes || null, folder || null, tags || null]);

    return {
      statusCode: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: result.rows[0]
      })
    };
  } finally {
    client.release();
  }
};

// PUT - Cập nhật password
const updatePassword = async (id, data) => {
  const { service, username, password, url, notes, folder, tags } = data;

  if (!service || !username || !password) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Service, username, and password are required'
      })
    };
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    const result = await client.query(`
      UPDATE passwords 
      SET service = $1, username = $2, password = $3, url = $4, notes = $5, folder = $6, tags = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [service, username, password, url || null, notes || null, folder || null, tags || null, id]);

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Password not found'
        })
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: result.rows[0]
      })
    };
  } finally {
    client.release();
  }
};

// DELETE - Xóa password
const deletePassword = async (id) => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const result = await client.query(`
      DELETE FROM passwords WHERE id = $1
      RETURNING id, service, username
    `, [id]);

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Password not found'
        })
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Password deleted successfully',
        data: result.rows[0]
      })
    };
  } finally {
    client.release();
  }
};

// Main handler
exports.handler = async (event, context) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(event);
    if (corsResponse) return corsResponse;

    // Check database connection
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Database not configured'
        })
      };
    }

    const method = event.httpMethod;
    const path = event.path;

    // Parse ID from path
    const pathParts = path.split('/');
    const id = pathParts[pathParts.length - 1];

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isIdPath = uuidRegex.test(id);

    // Parse request body
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: 'Invalid JSON in request body'
          })
        };
      }
    }

    // Route requests
    switch (method) {
      case 'GET':
        return await getPasswords(event);

      case 'POST':
        return await createPassword(body);

      case 'PUT':
        if (!isIdPath) {
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              success: false,
              error: 'Valid UUID required for update'
            })
          };
        }
        return await updatePassword(id, body);

      case 'DELETE':
        if (!isIdPath) {
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              success: false,
              error: 'Valid UUID required for delete'
            })
          };
        }
        return await deletePassword(id);

      default:
        return {
          statusCode: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: 'Method not allowed'
          })
        };
    }

  } catch (error) {
    console.error('Function error:', error);

    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};