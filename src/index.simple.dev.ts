/**
 * Simple Development Server for MallOS Enterprise
 * Minimal version without complex dependencies for initial development
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

const app = express();
const port = process.env.PORT || 3001;

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from frontend/dist if it exists
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API documentation
app.get('/api', (_req, res) => {
  res.json({
    name: 'MallOS Enterprise API',
    version: '1.0.0',
    description: 'IoT & AI Integration Hub for Mall Management',
    status: 'development mode - simplified',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Basic API route
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'running',
    mode: 'development',
    features: {
      database: false,
      redis: false,
      iot: false,
      ai: false,
      computerVision: false
    }
  });
});

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      error: 'API endpoint not found',
      availableEndpoints: ['/health', '/api', '/api/status']
    });
  } else {
    // Serve a simple HTML page for development
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MallOS Enterprise - Development Mode</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .status { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px; }
          .endpoint code { background: #fff; padding: 2px 8px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>🚀 MallOS Enterprise - Development Server</h1>
        <div class="status">
          <h2>✅ System Status: Running</h2>
          <p>Backend API is operational in simplified development mode.</p>
        </div>

        <h3>Available API Endpoints:</h3>
        <div class="endpoint">
          <strong>Health Check:</strong> <code>GET /health</code>
          <br><a href="/health" target="_blank">Test Health Check</a>
        </div>
        <div class="endpoint">
          <strong>API Info:</strong> <code>GET /api</code>
          <br><a href="/api" target="_blank">View API Documentation</a>
        </div>
        <div class="endpoint">
          <strong>System Status:</strong> <code>GET /api/status</code>
          <br><a href="/api/status" target="_blank">Check System Status</a>
        </div>

        <h3>Development Notes:</h3>
        <ul>
          <li>Running in simplified mode - full features disabled for initial development</li>
          <li>Database, Redis, IoT, and AI services are not active</li>
          <li>Frontend React application will be integrated separately</li>
        </ul>

        <p><em>For technical support, check the logs or contact the development team.</em></p>
      </body>
      </html>
    `);
  }
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 MallOS Enterprise Development Server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Documentation: http://localhost:${port}/api`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
  console.log(`📈 Status: http://localhost:${port}/api/status`);
});

export default app;
