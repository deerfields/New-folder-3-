import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'MallOS Enterprise is running!', 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// API test endpoints
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    endpoint: '/api/test',
    method: 'GET',
    timestamp: new Date().toISOString()
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

// Error handling
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🚀 MallOS Enterprise running on port ${port}`);
  console.log(`📊 Health check available at http://localhost:${port}/health`);
  console.log(`🧪 Test API available at http://localhost:${port}/api/test`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
