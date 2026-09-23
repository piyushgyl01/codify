/**
 * Verifying a build against its GitHub folder.
 *
 * This is the scale. A build pays out only when a public repo you own contains
 * the write-up the article asks every project to have: a photo or video, the
 * numbers you measured, a section on what broke, and a commit history that shows
 * iteration rather than a finished demo dropped in one commit.
 *
 * Be clear about what it proves. It checks that the evidence exists, not that
 * the robot works — a fake write-up would pass. But a convincing fake costs about
 * as much as the real thing, and either way you end the month with a portfolio,
 * which is what the roadmap is for.
 *
 * Everything goes through GitHub's unauthenticated REST API: public data only,
 * no token, nothing sent but the repo name. The limit is 60 requests an hour per
 * network, and a check costs three or four, so it is plenty for real use.
 */

export const API = 'https://api.github.com';

/* ------------------------------ reading input ------------------------------ */

/**
 * Accepts "owner/repo", "owner/repo/some/folder", or a pasted GitHub URL,
 * including /tree/<branch>/folder links. Returns { owner, repo, path } or null.
 */
export function parseRepo(input) {
  let s = String(input || '').trim().replace(/\.git$/, '').replace(/\/+$/, '');
  s = s.replace(/^https?:\/\/(?:www\.)?github\.com\//i, '').replace(/^github\.com\//i, '');
  const parts = s.split(/[?#]/)[0].split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const [owner, repo, ...rest] = parts;
  const path = (rest[0] === 'tree' || rest[0] === 'blob') ? rest.slice(2) : rest;
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(owner)) return null;
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(repo)) return null;
  return { owner, repo, path: path.map(decodeURIComponent).join('/') };
}

export const targetKey = t => `${t.owner}/${t.repo}/${t.path || ''}`.toLowerCase();
export const targetUrl = t => `https://github.com/${t.owner}/${t.repo}${t.path ? `/tree/HEAD/${t.path}` : ''}`;

/* ---------------------------- reading a write-up --------------------------- */

const IMAGE = /!\[[^\]]*\]\([^)]+\)|<img\b[^>]*>/gi;
const VIDEO = new RegExp([
  '<video\\b',
  'https?:\\/\\/(?:www\\.)?(?:youtube\\.com|youtu\\.be|vimeo\\.com|loom\\.com)\\/\\S+',
  '\\S+\\.(?:mp4|mov|webm|gif)\\b',
  // GitHub drag-and-drop videos arrive as a bare asset URL on a line of its own.
  '^\\s*https:\\/\\/github\\.com\\/user-attachments\\/assets\\/[\\w-]+\\s*$',
].join('|'), 'gim');

export function countMedia(md) {
  const text = String(md || '');
  const videos = (text.match(VIDEO) || []).length;
  // An image link to a .gif is both; count it once, as a video.
  const images = (text.match(IMAGE) || []).filter(m => !/\.gif\b/i.test(m)).length;
  return { images, videos, total: images + videos };
}

/** A heading — or a bold line — about what went wrong. */
const BROKE = /^(?:#{1,6}\s+|\*\*|__)[^\n]*\b(?:broke|broken|break|fail(?:ed|ure|s)?|debug(?:ging)?|went wrong|fix(?:ed|es)?|problems?|issues?|lessons?|mistakes?|gotchas?)\b/im;
export const hasBrokeSection = md => BROKE.test(String(md || ''));

/** Words of prose: code blocks, URLs and markup do not count. */
export function wordCount(md) {
  const prose = String(md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ');
  return (prose.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || []).length;
}

/** Does a photo or video appear near the top — the article's "video at the top"? */
export function mediaNearTop(md, lines = 20) {
  const head = String(md || '').split('\n').filter(l => l.trim()).slice(0, lines).join('\n');
  return countMedia(head).total > 0;
}

export function countMatches(text, re) {
  const flags = re.flags.includes('g') ? re.flags : re.flags + 'g';
  return (String(text || '').match(new RegExp(re.source, flags)) || []).length;
}

/** Lines that are questions, for the interview write-up. */
export const questionLines = md =>
  String(md || '').split('\n').filter(l => /\?\s*(?:\*\*|__)?\s*$/.test(l.trim())).length;

const decode = b64 => {
  const bin = atob(String(b64 || '').replace(/\s/g, ''));
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
};

/* --------------------------------- network --------------------------------- */

class GitHubError extends Error {}

async function getJson(url, fetchImpl) {
  let res;
  try {
    res = await fetchImpl(url, { headers: { Accept: 'application/vnd.github+json' } });
  } catch {
    throw new GitHubError('Could not reach GitHub. Check your connection and try again.');
  }
  const remaining = res.headers?.get?.('x-ratelimit-remaining');
  if ((res.status === 403 || res.status === 429) && remaining === '0') {
    const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000;
    const at = reset ? new Date(reset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'the top of the hour';
    throw new GitHubError(`GitHub's hourly limit for this network is used up. It resets at ${at}.`);
  }
  if (res.status === 404 || res.status === 409) return null;   // 409: empty repository
  if (!res.ok) throw new GitHubError(`GitHub answered ${res.status}. Try again in a minute.`);
  return res.json();
}

/* --------------------------------- checking -------------------------------- */

const check = (label, pass, detail = '') => ({ label, pass: !!pass, detail });

/**
 * Run a build's checks against a GitHub folder.
 *
 *   build    an entry from BUILDS
 *   target   { owner, repo, path } from parseRepo
 *   user     the GitHub username the app is linked to
 *   usedBy   targetKeys already claimed by other builds
 *
 * Resolves { ok:true, verified, checks, meta } — or { ok:false, error } when
 * GitHub could not be asked at all (offline, rate-limited), which is not a
 * failed check and must not be shown as one.
 */
export async function verifyBuild(build, target, { user, usedBy = [], fetchImpl = globalThis.fetch } = {}) {
  const proof = build.proof || {};
  const universal = proof.universal !== false;
  const { owner, repo, path } = target;
  const base = `${API}/repos/${owner}/${repo}`;
  const where = path ? `/${path}` : ' root';
  const checks = [];

  try {
    const info = await getJson(base, fetchImpl);
    const mine = !!info && !info.private && String(info.owner?.login || '').toLowerCase() === String(user || '').toLowerCase();
    checks.push(check('A public repo you own', mine,
      !info ? 'Not found. Check the name — and that the repo is public.'
        : info.private ? 'That repo is private, so it cannot be checked or shown to anyone.'
        : !mine ? `It belongs to ${info.owner?.login}, not ${user}. It has to be your work.` : ''));
    if (!mine) return { ok: true, verified: false, checks, meta: {} };

    const key = targetKey(target);
    checks.push(check('Not already used for another build', !usedBy.includes(key),
      'Each build needs its own folder and its own write-up.'));

    const docName = proof.doc || 'README';
    const docJson = proof.doc
      ? await getJson(`${base}/contents/${[path, proof.doc].filter(Boolean).map(encodeURIComponent).join('/')}`, fetchImpl)
      : await getJson(`${base}/readme${path ? '/' + path.split('/').map(encodeURIComponent).join('/') : ''}`, fetchImpl);
    const doc = docJson?.content ? decode(docJson.content) : null;
    checks.push(check(`${docName} in the repo${where}`, !!doc, doc ? '' : `No ${docName} found there.`));

    const minWords = proof.words ?? 120;
    const words = wordCount(doc);
    checks.push(check(`At least ${minWords} words of write-up`, words >= minWords, `${words} so far.`));

    const media = countMedia(doc);
    if (universal) {
      checks.push(check('A photo or video of it', media.total >= 1, 'Drag an image into the README on GitHub.'));
      checks.push(check('A section on what broke and how you fixed it', hasBrokeSection(doc),
        'A heading like "## What broke" — the part that cannot be faked from a tutorial.'));
    }
    if (proof.video) {
      checks.push(check(proof.video > 1 ? `${proof.video} videos of it moving` : 'A video of it moving',
        media.videos >= proof.video, `${media.videos} found. A GIF, MP4, YouTube link or a video dropped into the README all count.`));
    }
    if (proof.questions) {
      const qs = questionLines(doc);
      checks.push(check(`${proof.questions}+ questions answered`, qs >= proof.questions, `${qs} question lines found (lines ending in "?").`));
    }

    for (const need of proof.readme || []) {
      const got = countMatches(doc, need.re);
      const min = need.min || 1;
      checks.push(check(need.label, got >= min, min > 1 ? `${got} of ${min} found.` : ''));
    }
    for (const bad of proof.forbid || []) {
      checks.push(check(bad.label, countMatches(doc, bad.re) === 0, 'Found in the write-up.'));
    }

    if (proof.files?.length) {
      const branch = info.default_branch || 'HEAD';
      const tree = await getJson(`${base}/git/trees/${encodeURIComponent(branch)}?recursive=1`, fetchImpl);
      const prefix = path ? path.replace(/\/+$/, '') + '/' : '';
      const files = (tree?.tree || []).filter(e => e.type === 'blob' && e.path.startsWith(prefix)).map(e => e.path);
      for (const need of proof.files) {
        checks.push(check(need.label, files.some(f => need.re.test(f)), 'Not found in that folder.'));
      }
    }

    const minCommits = universal ? 3 : 1;
    const q = new URLSearchParams({ author: user, per_page: '30' });
    if (path) q.set('path', path);
    const commits = await getJson(`${base}/commits?${q}`, fetchImpl);
    const count = Array.isArray(commits) ? commits.length : 0;
    checks.push(check(minCommits > 1 ? `${minCommits}+ commits by you touching it` : 'At least one commit by you',
      count >= minCommits,
      minCommits > 1 ? `${count} so far. One finished-demo commit reads as a tutorial; iteration reads as engineering.` : `${count} found.`));

    return {
      ok: true,
      verified: checks.every(c => c.pass),
      checks,
      meta: { url: targetUrl(target), commits: count, words, mediaTop: mediaNearTop(doc), media: media.total },
    };
  } catch (err) {
    if (err instanceof GitHubError) return { ok: false, error: err.message };
    throw err;
  }
}

/**
 * The portfolio build is checked across your other builds rather than one
 * folder: it passes once enough verified builds open with a photo or video.
 */
export function verifyPortfolio(build, builds) {
  const need = build.proof.count || 3;
  const good = Object.entries(builds || {}).filter(([id, b]) => id !== build.id && b.verified && b.meta?.mediaTop);
  return {
    ok: true,
    verified: good.length >= need,
    checks: [check(`${need} verified builds with a photo or video at the top of the README`, good.length >= need,
      `${good.length} so far. Re-check a build after you rewrite its README.`)],
    meta: { builds: good.map(([id]) => id) },
  };
}
