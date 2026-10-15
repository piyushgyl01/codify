/**
 * Codify's MCP server over Streamable HTTP, for any AI app or agent.
 *
 *   https://<app>/mcp            with  Authorization: Bearer <GitHub token>
 *   https://<app>/mcp/<token>    for apps that only take a URL
 *
 * The token is the fine-grained GitHub token the app syncs with; the save is
 * read from and written to <token owner>/codify-save (or ?repo=owner/name).
 * Nothing is stored here: each call reads the save from GitHub and writes it
 * back. Stateless, so every POST stands alone and GET has no stream to offer.
 */
import { handleMessage } from '../server/mcp.mjs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

function send(res, status, body, headers = {}) {
  res.statusCode = status;
  for (const [k, v] of Object.entries({ ...CORS, 'Cache-Control': 'no-store', ...headers })) res.setHeader(k, v);
  if (body === undefined) return res.end();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204);
  if (req.method === 'GET') {
    // A browser visiting the URL, or a client asking for a server-sent stream this server does not keep.
    if (String(req.headers.accept || '').includes('text/event-stream')) return send(res, 405, undefined, { Allow: 'POST' });
    return send(res, 200, { name: 'Codify MCP server', how: 'POST JSON-RPC here from an MCP client. Authenticate with your Codify GitHub token as a Bearer header, or use the URL Codify shows under Hero → AI & sync.' });
  }
  if (req.method === 'DELETE') return send(res, 405, undefined, { Allow: 'POST' });
  if (req.method !== 'POST') return send(res, 405, undefined, { Allow: 'POST, GET, OPTIONS' });

  const url = new URL(req.url, 'http://x');
  const bearer = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '')?.[1]?.trim();
  const token = bearer || url.searchParams.get('token') || '';
  const auth = { token, repo: url.searchParams.get('repo') || null, client: null };

  let msg;
  try { msg = await readBody(req); } catch { return send(res, 400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
  const reply = await handleMessage(msg, auth);
  if (reply === null) return send(res, 202);
  return send(res, 200, reply);
}
