const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'MallOS Enterprise Test Server',
    status: 'ok',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  }));
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`🚀 Test server running on port ${port}`);
});
