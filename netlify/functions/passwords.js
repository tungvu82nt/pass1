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
      id SERIAL PRIMARY KEY,
      service VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL,
      password TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(service, username)
    );
    
    CREATE INDEX IF NOT EXISTS idx_passwords_service ON passwords(service);
    CREATE INDEX IF NOT EXISTS idx_passwords_username ON passwords(username);
    CREATE INDEX IF NOT EXISTS idx_passwords_updated_at ON passwords(updated_at);
  `;
  
  await client.query(createTableQuery);
};

// GET - Lấy tất cả passwords
const getPasswords = async () => {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await ensureTable(client);
    
    const result = await client.query(`
      SELECT id, service, username, password, notes, created_at, updated_at 
      FROM passwords 
      ORDER BY updated_at DESC
    `);
    
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
  const { service, username, password, notes = '' } = data;
  
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
    await ensureTable(client);
    
    const result = await client.query(`
      INSERT INTO passwords (service, username, password, notes, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (service, username) 
      DO UPDATE SET 
        password = EXCLUDED.password,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, service, username, password, notes, created_at, updated_at
    `, [service, username, password, notes]);
    
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
  const { service, username, password, notes = '' } = data;
  
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
    await ensureTable(client);
    
    const result = await client.query(`
      UPDATE passwords 
      SET service = $1, username = $2, password = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, service, username, password, notes, created_at, updated_at
    `, [service, username, password, notes, id]);
    
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
    await ensureTable(client);
    
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
    
    // Parse ID from path if present (e.g., /passwords/123)
    const pathParts = path.split('/');
    const id = pathParts[pathParts.length - 1];
    const isIdPath = !isNaN(parseInt(id));
    
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
        return await getPasswords();
        
      case 'POST':
        return await createPassword(body);
        
      case 'PUT':
        if (!isIdPath) {
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              success: false,
              error: 'ID required for update'
            })
          };
        }
        return await updatePassword(parseInt(id), body);
        
      case 'DELETE':
        if (!isIdPath) {
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              success: false,
              error: 'ID required for delete'
            })
          };
        }
        return await deletePassword(parseInt(id));
        
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