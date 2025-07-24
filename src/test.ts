import express from 'express';

const app = express();
const port = 3001;

console.log('Starting server...');

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!', status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
