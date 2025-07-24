import express from 'express';
import { logger } from '@/utils/logger';

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.json({ message: 'MallOS Enterprise is running!', status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  logger.info(`🚀 MallOS Enterprise running on port ${port}`);
  console.log(`🚀 MallOS Enterprise running on port ${port}`);
});
