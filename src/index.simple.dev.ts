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

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: ['/health', '/api', '/api/status']
  });
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
