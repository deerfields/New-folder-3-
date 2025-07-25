const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.json({ message: 'MallOS Enterprise Server is running!', status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'MallOS Enterprise API',
    version: '1.0.0',
    description: 'IoT & AI Integration Hub for Mall Management',
    status: 'running'
  });
});

app.listen(port, () => {
  console.log(`🚀 MallOS Enterprise running on port ${port}`);
  console.log(`📊 Environment: development`);
  console.log(`🔗 API Documentation: http://localhost:${port}/api`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
});
