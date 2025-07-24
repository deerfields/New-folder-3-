const express = require('express');

console.log('Starting basic Express server...');

const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.json({ message: 'Basic server working!', status: 'ok' });
});

app.listen(port, () => {
  console.log(`Basic server running on port ${port}`);
});
