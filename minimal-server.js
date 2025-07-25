console.log('Starting minimal server...');

const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  
  const response = {
    message: 'MallOS Enterprise - Minimal Server',
    status: 'ok',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    headers: req.headers
  };
  
  res.end(JSON.stringify(response, null, 2));
});

const port = process.env.PORT || 3001;

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Minimal server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
