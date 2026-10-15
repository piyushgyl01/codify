#!/usr/bin/env node
/**
 * Codify's MCP server over stdin/stdout, for AI apps that run local servers
 * (Claude Code, Claude Desktop, Cursor and the like) and would rather not
 * send the token over the network to a server in between.
 *
 *   CODIFY_GITHUB_TOKEN=github_pat_… node server/stdio.mjs [--repo owner/name]
 *
 * One JSON-RPC message per line in, one response per line out. Logs go to stderr.
 */
import { createInterface } from 'node:readline';

console.log = (...a) => console.error(...a);   // stdout is the protocol; keep it clean
const { handleMessage } = await import('./mcp.mjs');

const repoArg = process.argv.indexOf('--repo');
const auth = {
  token: process.env.CODIFY_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '',
  repo: repoArg > 0 ? process.argv[repoArg + 1] : process.env.CODIFY_REPO || null,
  client: null,
};
if (!auth.token) console.error('codify: set CODIFY_GITHUB_TOKEN to the GitHub token Codify syncs with.');

const out = m => process.stdout.write(JSON.stringify(m) + '\n');
for await (const line of createInterface({ input: process.stdin })) {
  if (!line.trim()) continue;
  let msg;
  try { msg = JSON.parse(line); } catch { out({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); continue; }
  const reply = await handleMessage(msg, auth);
  if (reply) out(reply);
}
