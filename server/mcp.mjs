/**
 * The Model Context Protocol, by hand: JSON-RPC 2.0 messages in, responses
 * out. Enough of the spec for any MCP client — initialize, ping, tools/list
 * and tools/call — with no SDK and no session state, so it runs the same
 * behind HTTP (api/mcp.js) and over stdin/stdout (server/stdio.mjs).
 */
import { TOOLS, ToolError, callTool, repoFor } from './codify.mjs';
import { APP_VERSION } from '../js/version.js';

export const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

const INSTRUCTIONS = [
  'Codify is the learner\'s own study app: daily missions in Programming, Robotics and AI, and five university degrees (cs, ee, me, phys, math) built from free courses.',
  'Call get_overview first. Read with get_mission, get_skills, get_degree, get_course, read_save and get_log; change things with quiz, update_degree, update_track, update_profile and write_save.',
  'Every change is saved to the learner\'s private GitHub repo and appears in the app within a minute.',
  'The app only pays for what it can check. When quizzing, ask the learner and pass on their answer; tick work only when they say it is done.',
].join(' ');

const ok = (id, result) => ({ jsonrpc: '2.0', id, result });
const err = (id, code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

/**
 * Handle one JSON-RPC message (or a batch). Returns the response, or null for
 * a notification. `auth` is { token, repo?, client? }.
 */
export async function handleMessage(msg, auth) {
  if (Array.isArray(msg)) {
    const out = (await Promise.all(msg.map(m => handleMessage(m, auth)))).filter(Boolean);
    return out.length ? out : null;
  }
  if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') return msg && 'id' in msg && !('result' in msg || 'error' in msg) ? err(msg.id, -32600, 'Invalid request') : null;
  const { id, method, params = {} } = msg;
  const notification = !('id' in msg);
  try {
    switch (method) {
      case 'initialize': {
        const asked = params.protocolVersion;
        auth.client = params.clientInfo?.name || auth.client;
        return ok(id, {
          protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'codify', title: 'Codify', version: APP_VERSION },
          instructions: INSTRUCTIONS,
        });
      }
      case 'ping': return notification ? null : ok(id, {});
      case 'tools/list':
        return ok(id, { tools: TOOLS.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema, annotations: { readOnlyHint: !!t.readOnly, destructiveHint: t.name === 'write_save', openWorldHint: false } })) });
      case 'tools/call': {
        if (!TOOLS.some(t => t.name === params.name)) return err(id, -32602, `Unknown tool: ${params.name}`);
        if (!auth.token) return ok(id, toolResult({ error: 'No GitHub token. Connect with the token as a Bearer header, or with the URL Codify shows under Hero → AI & sync.' }, true));
        try {
          const repo = await repoFor(auth.token, auth.repo);
          const result = await callTool(params.name, params.arguments || {}, { token: auth.token, repo, client: auth.client || 'an AI app' });
          return ok(id, toolResult(result, false));
        } catch (e) {
          if (e instanceof ToolError || e.name === 'CloudError' || e.constructor?.name === 'CloudError') return ok(id, toolResult({ error: e.message }, true));
          throw e;
        }
      }
      default:
        if (notification) return null;   // notifications/initialized, notifications/cancelled, …
        return err(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    console.error(e);
    return notification ? null : err(id, -32603, `Codify hit an error: ${e.message}`);
  }
}

function toolResult(value, isError) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 1);
  return { content: [{ type: 'text', text }], ...(value && typeof value === 'object' && !Array.isArray(value) && !isError ? { structuredContent: value } : {}), isError };
}
