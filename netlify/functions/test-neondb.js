// NeonDB connection test function cho Memory Safe Guard
exports.handler = async (event, context) => {
  try {
    // Kiểm tra environment variables
    const databaseUrl = process.env.DATABASE_URL;
    const useNeonDB = process.env.VITE_USE_NEONDB;
    const apiBaseUrl = process.env.VITE_API_BASE_URL;
    
    console.log('Environment check:', {
      hasDatabaseUrl: !!databaseUrl,
      useNeonDB,
      apiBaseUrl,
      databaseUrlLength: databaseUrl?.length || 0
    });

    // Nếu không có DATABASE_URL, trả về thông tin environment
    if (!databaseUrl) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          success: false,
          message: 'No DATABASE_URL configured',
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            VITE_USE_NEONDB: useNeonDB,
            VITE_API_BASE_URL: apiBaseUrl,
            hasDatabaseUrl: false
          },
          recommendation: 'Configure DATABASE_URL environment variable in Netlify dashboard'
        })
      };
    }

    // Test database connection
    try {
      // Import pg để test connection
      const { Pool } = require('pg');
      
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false
        }
      });

      // Test connection
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
      client.release();
      await pool.end();

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          success: true,
          message: 'NeonDB connection successful',
          data: {
            currentTime: result.rows[0].current_time,
            postgresVersion: result.rows[0].postgres_version,
            connectionTest: 'PASSED'
          },
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            VITE_USE_NEONDB: useNeonDB,
            databaseConfigured: true
          }
        })
      };

    } catch (dbError) {
      console.error('Database connection error:', dbError);
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          success: false,
          message: 'Database connection failed',
          error: dbError.message,
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            VITE_USE_NEONDB: useNeonDB,
            databaseConfigured: true,
            connectionTest: 'FAILED'
          }
        })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: false,
        message: 'Function execution error',
        error: error.message,
        stack: error.stack
      })
    };
  }
};