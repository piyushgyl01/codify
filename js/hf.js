/**
 * Verifying work published on Hugging Face: a model, a dataset or a demo
 * (a Space) under your account, with a card that says what it is and how well
 * it does.
 *
 * Hugging Face's public API answers a browser directly, with no key. A private
 * or missing repo answers 401, which is reported as "not found or private" —
 * the app can only show what anyone could see.
 */

export const HF = 'https://huggingface.co';
const KINDS = { model: '', dataset: 'datasets/', space: 'spaces/' };
const API_KIND = { model: 'models', dataset: 'datasets', space: 'spaces' };

/** "user/name", or a pasted huggingface.co link to a model, dataset or Space. */
export function parseHf(input, kind = 'model') {
  let s = String(input || '').trim().replace(/\/+$/, '');
  s = s.replace(/^https?:\/\/(?:www\.)?huggingface\.co\//i, '').replace(/^huggingface\.co\//i, '');
  const parts = s.split(/[?#]/)[0].split('/').filter(Boolean);
  if (parts[0] === 'spaces' || parts[0] === 'datasets') { kind = parts[0] === 'spaces' ? 'space' : 'dataset'; parts.shift(); }
  if (parts.length < 2) return null;
  const [user, name] = parts;
  if (!/^[A-Za-z0-9][\w.-]{0,95}$/.test(user) || !/^[\w.-]{1,96}$/.test(name)) return null;
  return { kind, id: `${user}/${name}` };
}

export const hfUrl = t => `${HF}/${KINDS[t.kind]}${t.id}`;

class HfError extends Error {}

async function get(url, fetchImpl, as = 'json') {
  let res;
  try { res = await fetchImpl(url); } catch { throw new HfError('Could not reach Hugging Face. Check your connection and try again.'); }
  if (res.status === 401 || res.status === 404) return null;
  if (res.status === 429) throw new HfError('Hugging Face is rate-limiting this network. Try again in a few minutes.');
  if (!res.ok) throw new HfError(`Hugging Face answered ${res.status}. Try again in a minute.`);
  return as === 'json' ? res.json() : res.text();
}

/** Does this Hugging Face username exist? */
export async function checkHfUser(name, fetchImpl = globalThis.fetch) {
  const clean = String(name || '').trim().replace(/^@/, '');
  if (!/^[A-Za-z0-9][\w.-]{0,95}$/.test(clean)) throw new Error('That does not look like a Hugging Face username.');
  const u = await get(`${HF}/api/users/${encodeURIComponent(clean)}/overview`, fetchImpl);
  if (!u) throw new Error('No such user on Hugging Face.');
  return { user: u.user || clean, avatar: u.avatarUrl || null };
}

const check = (label, pass, detail = '') => ({ label, pass: !!pass, detail });
const words = md => (String(md || '').replace(/^---[\s\S]*?---/, '').replace(/```[\s\S]*?```/g, ' ')
  .match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || []).length;

/**
 * Check a build published on Hugging Face. `build.proof.hf` is
 * { kind: 'model' | 'dataset' | 'space', words?, card?: [{ label, re, min }] }.
 */
export async function verifyHf(build, target, { user, fetchImpl = globalThis.fetch } = {}) {
  const spec = build.proof?.hf || {};
  const checks = [];
  try {
    const info = await get(`${HF}/api/${API_KIND[target.kind]}/${target.id}`, fetchImpl);
    const owner = String(info?.author || target.id.split('/')[0]).toLowerCase();
    const mine = !!info && !info.private && owner === String(user || '').toLowerCase();
    checks.push(check(`A public ${target.kind === 'space' ? 'Space' : target.kind} under your account`, mine,
      !info ? 'Not found, or private. Check the name and make it public.' : !mine ? `It belongs to ${owner}, not ${user}.` : ''));
    if (spec.kind && spec.kind !== target.kind) {
      checks.push(check(`It is a ${spec.kind === 'space' ? 'Space (a live demo)' : spec.kind}`, false, `That link is a ${target.kind}.`));
    }
    if (!mine) return { ok: true, verified: false, checks, meta: {} };

    const card = await get(`${hfUrl(target)}/raw/main/README.md`, fetchImpl, 'text');
    const n = words(card);
    const min = spec.words ?? 80;
    checks.push(check(`A card (README) with ${min}+ words`, n >= min, card ? `${n} so far.` : 'No README found.'));
    for (const need of spec.card || []) {
      const got = (String(card || '').match(new RegExp(need.re.source, need.re.flags.includes('g') ? need.re.flags : need.re.flags + 'g')) || []).length;
      checks.push(check(need.label, got >= (need.min || 1), (need.min || 1) > 1 ? `${got} of ${need.min} found.` : ''));
    }
    if (target.kind === 'space') {
      const stage = info.runtime?.stage;
      checks.push(check('The demo is running', stage === 'RUNNING', stage ? `It is ${stage.toLowerCase().replace(/_/g, ' ')}.` : 'No running status yet.'));
    }
    return { ok: true, verified: checks.every(c => c.pass), checks, meta: { url: hfUrl(target), likes: info.likes || 0, downloads: info.downloads || 0 } };
  } catch (err) {
    if (err instanceof HfError) return { ok: false, error: err.message };
    throw err;
  }
}
