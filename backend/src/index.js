import 'dotenv/config';
import http from 'http';
import { createTicket, listTickets, updateTicket, deleteTicket, getStats } from './handlers/tickets.js';

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': FRONTEND_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function addCors(res) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
}

const server = http.createServer(async (req, res) => {
  addCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (req.method === 'GET' && path === '/tickets/stats') return await getStats(req, res);
    if (req.method === 'POST' && path === '/tickets') return await createTicket(req, res);
    if (req.method === 'GET' && path === '/tickets') return await listTickets(req, res);

    const matchId = path.match(/^\/tickets\/([^/]+)$/);
    if (matchId) {
      const id = matchId[1];
      if (req.method === 'PATCH') return await updateTicket(req, res, id);
      if (req.method === 'DELETE') return await deleteTicket(req, res, id);
    }

    const body = JSON.stringify({ error: 'Not found' });
    res.writeHead(404, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
    res.end(body);
  } catch (err) {
    const body = JSON.stringify({ error: 'Internal server error' });
    res.writeHead(500, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
    res.end(body);
  }
});

server.listen(PORT, () => {
  console.log(`DeskFlow API running on port ${PORT}`);
});
