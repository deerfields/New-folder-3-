import express from 'express';

const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.json({ message: 'MallOS Enterprise Test Server is running!', status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on port ${port}`);
});
