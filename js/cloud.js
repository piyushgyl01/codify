/**
 * The save on GitHub: one file in a private repo you own.
 *
 * Without this, the save lives only in this browser. With it, the same save
 * syncs between your devices, and an AI app connected to Codify's MCP server
 * (api/mcp.js) reads and changes it with the app's own code. Both sides
 * write the file with the sha they last read, so neither can silently
 * overwrite the other; when both changed, the two are merged.
 *
 * The token is a fine-grained GitHub token limited to that one repo (Contents:
 * read and write). It is kept apart from the save, so it never lands in a
 * backup or in the repo itself.
 *
 * The store functions at the top have no browser dependencies; the server
 * uses them too. The sync controller below them runs only in the app.
 */
import { S, on, importSave, describeSave } from './state.js';

const API = 'https://api.github.com';
export const CLOUD_FILE = 'codify-save.json';
export const CLOUD_REPO = 'codify-save';
export const CLOUD_FORMAT = 'codify-cloud-save';

/* --------------------------------- store ---------------------------------- */

function b64encode(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
const b64decode = b64 => new TextDecoder().decode(Uint8Array.from(atob(String(b64).replace(/\s/g, '')), c => c.charCodeAt(0)));

export class CloudError extends Error {
  constructor(message, { status = 0, conflict = false } = {}) { super(message); this.status = status; this.conflict = conflict; }
}

async function gh(token, path, { method = 'GET', body, etag, fetchImpl = globalThis.fetch } = {}) {
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' };
  if (body) headers['Content-Type'] = 'application/json';
  if (etag) headers['If-None-Match'] = etag;
  let res;
  try { res = await fetchImpl(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' }); }
  catch { throw new CloudError('Could not reach GitHub — check the connection.'); }
  if (res.status === 401) throw new CloudError('GitHub rejected the token — it may have expired or been revoked.', { status: 401 });
  if (res.status === 403 || res.status === 429) {
    const left = res.headers.get('x-ratelimit-remaining');
    throw new CloudError(left === '0' ? 'GitHub\'s rate limit is used up for now — try again within the hour.' : 'The token is not allowed to do that — give it Contents: read and write on the save repo.', { status: res.status });
  }
  return res;
}

/** The repo, as "owner/name", from what you typed — or yours/codify-save. */
export function cloudRepo(input, login) {
  const s = String(input || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/, '').replace(/\/+$/, '');
  if (!s) return login ? `${login}/${CLOUD_REPO}` : null;
  if (/^[A-Za-z0-9._-]{1,100}$/.test(s) && login) return `${login}/${s}`;
  return /^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/.test(s) ? s : null;
}

/** Who the token belongs to. */
export async function cloudWho(token, fetchImpl) {
  const res = await gh(token, '/user', { fetchImpl });
  if (!res.ok) throw new CloudError(`GitHub said ${res.status} for the token's owner.`, { status: res.status });
  return (await res.json()).login;
}

/** The repo's settings, or a plain reason it cannot hold a save. */
export async function cloudCheckRepo(token, repo, fetchImpl) {
  const res = await gh(token, `/repos/${repo}`, { fetchImpl });
  if (res.status === 404) throw new CloudError(`There is no repo ${repo} that this token can see. Create it (private), and give the token access to it.`, { status: 404 });
  if (!res.ok) throw new CloudError(`GitHub said ${res.status} for ${repo}.`, { status: res.status });
  const r = await res.json();
  if (!r.private) throw new CloudError(`${repo} is public — anyone could read your save. Make it private first.`);
  if (r.permissions && !r.permissions.push) throw new CloudError(`The token can read ${repo} but not write to it — give it Contents: read and write.`);
  return r;
}

/**
 * Read the save file. With `etag`, an unchanged file costs nothing and comes
 * back { status: 'same' }. A missing file is { status: 'missing' }.
 */
export async function cloudRead({ token, repo, etag = null, fetchImpl }) {
  const res = await gh(token, `/repos/${repo}/contents/${CLOUD_FILE}`, { etag, fetchImpl });
  if (res.status === 304) return { status: 'same' };
  if (res.status === 404) {
    await cloudCheckRepo(token, repo, fetchImpl);   // a clearer error if it is the repo that is missing
    return { status: 'missing' };
  }
  if (!res.ok) throw new CloudError(`GitHub said ${res.status} reading the save.`, { status: res.status });
  const meta = await res.json();
  let content = meta.content;
  if (!content && meta.encoding === 'none') {        // over 1 MB: fetch the blob itself
    const blob = await gh(token, `/repos/${repo}/git/blobs/${meta.sha}`, { fetchImpl });
    if (!blob.ok) throw new CloudError(`GitHub said ${blob.status} reading the save.`, { status: blob.status });
    content = (await blob.json()).content;
  }
  let file;
  try { file = JSON.parse(b64decode(content)); } catch { throw new CloudError(`${CLOUD_FILE} in ${repo} is not valid JSON.`); }
  if (file?.format !== CLOUD_FORMAT || !file.save) throw new CloudError(`${CLOUD_FILE} in ${repo} is not a Codify save.`);
  return { status: 'ok', file, sha: meta.sha, etag: res.headers.get('etag') };
}

/** Write the save file over the version `sha` names; a newer one there is a conflict. */
export async function cloudWrite({ token, repo, file, sha = null, message = 'Codify: save', fetchImpl }) {
  const res = await gh(token, `/repos/${repo}/contents/${CLOUD_FILE}`, {
    method: 'PUT', fetchImpl, body: { message, content: b64encode(JSON.stringify(file)), ...(sha ? { sha } : {}) },
  });
  if (res.status === 409 || res.status === 422) throw new CloudError('The save on GitHub changed since it was read.', { status: res.status, conflict: true });
  if (res.status === 404) throw new CloudError(`There is no repo ${repo} that this token can write to.`, { status: 404 });
  if (!res.ok) throw new CloudError(`GitHub said ${res.status} writing the save.`, { status: res.status });
  return { sha: (await res.json()).content.sha };
}

/** The file around a save: who wrote it, when, and in which time zone the day rolls over. */
export const wrapSave = (save, by, tz = Intl.DateTimeFormat().resolvedOptions().timeZone) =>
  ({ format: CLOUD_FORMAT, v: 1, savedAt: new Date().toISOString(), by, tz, save });

/* --------------------------------- merge ---------------------------------- */

const same = (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b);
const isObj = x => x !== null && typeof x === 'object' && !Array.isArray(x);

/**
 * Three-way merge of two saves that both changed since `base`. Whatever only
 * one side changed is kept; objects merge key by key; where both changed the
 * same value, `theirs` (already on GitHub) wins. Lists are whole values.
 */
export function merge3(base, mine, theirs) {
  if (same(mine, theirs)) return mine;
  if (same(base, mine)) return theirs;
  if (same(base, theirs)) return mine;
  if (isObj(mine) && isObj(theirs)) {
    const b = isObj(base) ? base : {}, out = {};
    for (const k of new Set([...Object.keys(mine), ...Object.keys(theirs)])) {
      const v = merge3(b[k], mine[k], theirs[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  return theirs;
}

/* ------------------------------ sync (the app) ----------------------------- */

const CFG_KEY = 'codify.cloud.v1', BASE_KEY = 'codify.cloud.base';
const QUIET_MS = 30_000, MAX_WAIT_MS = 180_000, POLL_MS = 60_000;

const readJson = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const writeJson = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch { /* full: sync still works this session */ } };

let cfg = (typeof localStorage !== 'undefined' && readJson(CFG_KEY)) || {};
const keep = () => writeJson(CFG_KEY, cfg);
const clone = x => JSON.parse(JSON.stringify(x));
const listeners = new Set();
const changed = () => listeners.forEach(fn => { try { fn(cloudState()); } catch (e) { console.error(e); } });

let applying = false, edits = 0, timer = null, firstDirty = 0, inFlight = null, started = false, onRemote = null;

export const cloudOn = () => !!(cfg.token && cfg.repo && cfg.linked);
export const cloudToken = () => cfg.token || '';
export const onCloud = fn => (listeners.add(fn), () => listeners.delete(fn));
export const cloudState = () => ({
  on: cloudOn(), repo: cfg.repo || '', login: cfg.login || '', dirty: !!cfg.dirty, busy: !!inFlight,
  pushedAt: cfg.pushedAt || 0, pulledAt: cfg.pulledAt || 0, error: cfg.error || '', lastBy: cfg.lastBy || '',
});

function apply(save) {
  applying = true;
  try { return importSave(JSON.stringify(save)); } finally { applying = false; }
}

/** Fold in the save on GitHub if it moved. Never while a question round is running. */
async function pull() {
  if (S.active) return 'busy';
  const r = await cloudRead({ token: cfg.token, repo: cfg.repo, etag: cfg.sha ? cfg.etag : null });
  cfg.pulledAt = Date.now();
  if (r.status === 'same') return 'same';
  if (r.status === 'missing') { cfg.sha = null; cfg.etag = null; cfg.dirty = true; return 'missing'; }
  cfg.etag = r.etag;
  if (r.sha === cfg.sha) return 'same';
  const theirs = r.file.save;
  const next = cfg.dirty ? merge3(readJson(BASE_KEY), clone(S), theirs) : theirs;
  const res = apply(next);
  if (!res.ok) throw new CloudError(`The save on GitHub could not be loaded: ${res.error}`);
  writeJson(BASE_KEY, theirs);
  cfg.sha = r.sha; cfg.lastBy = r.file.by || '';
  cfg.dirty = !same(next, theirs);
  onRemote?.({ by: r.file.by, merged: cfg.dirty });
  return 'pulled';
}

async function push() {
  if (!cfg.dirty) return 'clean';
  const snapshot = clone(S), at = edits;
  const { sha } = await cloudWrite({ token: cfg.token, repo: cfg.repo, file: wrapSave(snapshot, 'app'), sha: cfg.sha, message: 'Codify: saved from the app' });
  cfg.sha = sha; cfg.etag = null; cfg.pushedAt = Date.now(); cfg.lastBy = 'app';
  writeJson(BASE_KEY, snapshot);
  if (edits === at) { cfg.dirty = false; firstDirty = 0; }
  return 'pushed';
}

/** Pull, then push if anything is left to send. A conflict on push pulls (and merges) once and tries again. */
export function cloudSync() {
  if (!cloudOn()) return Promise.resolve(null);
  if (inFlight) return inFlight;
  clearTimeout(timer); timer = null;
  inFlight = (async () => {
    try {
      await pull();
      try { await push(); }
      catch (e) { if (!e.conflict) throw e; await pull(); await push(); }
      cfg.error = '';
    } catch (e) {
      cfg.error = e.message || String(e);
      if (e.status === 401) cfg.linked = false;
    } finally { keep(); inFlight = null; changed(); }
  })();
  changed();
  return inFlight;
}

function schedule() {
  if (!cloudOn()) return;
  clearTimeout(timer);
  const wait = Math.max(0, Math.min(QUIET_MS, firstDirty + MAX_WAIT_MS - Date.now()));
  timer = setTimeout(cloudSync, wait);
}

/** Start syncing: on open, after changes go quiet, when the app is hidden, and every minute while it is open. */
export function startCloudSync({ onPulled } = {}) {
  onRemote = onPulled || null;
  if (started) return;
  started = true;
  on(() => {
    if (applying || !cloudOn()) return;
    edits++;
    if (!cfg.dirty) { cfg.dirty = true; firstDirty = Date.now(); keep(); }
    schedule();
  });
  document.addEventListener('visibilitychange', () => { if (cloudOn()) cloudSync(); });
  setInterval(() => { if (cloudOn() && document.visibilityState === 'visible') cloudSync(); }, POLL_MS);
  cloudSync();
}

/**
 * Link a repo with a token. If the repo already holds a save, nothing is
 * overwritten: the result describes it, and `cloudChoose` decides which wins.
 */
export async function cloudConnect(token, repoInput) {
  token = String(token || '').trim();
  if (!/^(github_pat_|ghp_|gho_)[A-Za-z0-9_]{20,}$/.test(token)) throw new CloudError('That does not look like a GitHub token — it starts with github_pat_.');
  const login = await cloudWho(token);
  const repo = cloudRepo(repoInput, login);
  if (!repo) throw new CloudError('Use a repo name like codify-save, or owner/codify-save.');
  await cloudCheckRepo(token, repo);
  const r = await cloudRead({ token, repo });
  cfg = { token, repo, login, linked: false, sha: null, etag: null, dirty: false };
  keep();
  if (r.status === 'missing') { await cloudChoose('mine'); return { repo, remote: null }; }
  return { repo, remote: { ...describeSave(r.file.save), savedAt: r.file.savedAt, by: r.file.by } };
}

/** After connecting to a repo that has a save: keep `mine` (this device's) or take `theirs`. */
export async function cloudChoose(which) {
  const r = await cloudRead({ token: cfg.token, repo: cfg.repo });
  cfg.sha = r.status === 'ok' ? r.sha : null;
  if (which === 'theirs' && r.status === 'ok') {
    const res = apply(r.file.save);
    if (!res.ok) throw new CloudError(`The save on GitHub could not be loaded: ${res.error}`);
    writeJson(BASE_KEY, r.file.save);
    cfg.dirty = false;
  } else {
    writeJson(BASE_KEY, null);
    cfg.dirty = true; firstDirty = Date.now();
  }
  cfg.linked = true;
  keep();
  await cloudSync();
  if (cfg.error) throw new CloudError(cfg.error);
  return cloudState();
}

export function cloudDisconnect() {
  clearTimeout(timer);
  cfg = {};
  writeJson(CFG_KEY, null); writeJson(BASE_KEY, null);
  changed();
}
