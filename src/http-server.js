import http from 'node:http';
import { getSchema } from './tools/get-schema.js';
import { runQuery } from './tools/run-query.js';
import { getUserMetrics } from './tools/get-user-metrics.js';

const PORT = process.env.PORT || 3000;

const tools = {
  get_schema: () => getSchema(),
  run_query: (args) => runQuery(args),
  get_user_metrics: () => getUserMetrics(),
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const match = url.pathname.match(/^\/tools\/(\w+)$/);

  if (!match) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const toolName = match[1];
  const tool = tools[toolName];

  if (!tool) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Unknown tool: ${toolName}` }));
    return;
  }

  try {
    let input = {};
    if (req.method === 'POST') {
      const body = await new Promise((resolve) => {
        let data = '';
        req.on('data', (chunk) => (data += chunk));
        req.on('end', () => resolve(data));
      });
      if (body) {
        input = JSON.parse(body);
      }
    }

    const result = tool(input);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP HTTP server running at http://0.0.0.0:${PORT}`);
});
