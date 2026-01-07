// Health check function cho Memory Safe Guard
exports.handler = async (event, context) => {
  try {
    // Kiểm tra method
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: ''
      };
    }

    // Health check response
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Memory Safe Guard API',
      version: '1.0.0',
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        hasDatabase: !!process.env.DATABASE_URL,
        useNeonDB: process.env.VITE_USE_NEONDB === 'true'
      },
      netlify: {
        deployId: context.deployID,
        requestId: context.requestID,
        region: context.region || 'unknown'
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(healthData)
    };

  } catch (error) {
    console.error('Health check error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      })
    };
  }
};