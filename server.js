console.log('Starting MallOS Enterprise Server...');

const express = require('express');

// Check if cors is available, if not provide basic CORS manually
let cors;
try {
  cors = require('cors');
} catch (err) {
  console.log('CORS package not available, using manual CORS');
  cors = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  };
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
if (typeof cors === 'function') {
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));
} else {
  app.use(cors);
}

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'MallOS Enterprise is running!', 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    features: {
      ai: process.env.ENABLE_AI_ANALYTICS === 'true',
      iot: process.env.ENABLE_IOT_INTEGRATION === 'true',
      blockchain: process.env.ENABLE_BLOCKCHAIN === 'true',
      computerVision: process.env.ENABLE_COMPUTER_VISION === 'true'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'mallos-enterprise',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/status', (req, res) => {
  res.json({
    status: 'running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    features: {
      ai: process.env.ENABLE_AI_ANALYTICS === 'true',
      iot: process.env.ENABLE_IOT_INTEGRATION === 'true',
      blockchain: process.env.ENABLE_BLOCKCHAIN === 'true',
      computerVision: process.env.ENABLE_COMPUTER_VISION === 'true'
    }
  });
});

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    endpoint: '/api/test',
    method: 'GET',
    timestamp: new Date().toISOString(),
    query: req.query
  });
});

app.post('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    endpoint: '/api/test',
    method: 'POST',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Frontend static files (if available)
try {
  app.use(express.static('frontend/dist'));
  console.log('Frontend static files enabled');
} catch (err) {
  console.log('Frontend static files not available');
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 MallOS Enterprise running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🧪 API Status: http://localhost:${port}/api/v1/status`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Features enabled:`, {
    ai: process.env.ENABLE_AI_ANALYTICS === 'true',
    iot: process.env.ENABLE_IOT_INTEGRATION === 'true',
    blockchain: process.env.ENABLE_BLOCKCHAIN === 'true',
    computerVision: process.env.ENABLE_COMPUTER_VISION === 'true'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
