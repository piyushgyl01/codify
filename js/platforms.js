/**
 * Ground truth.
 *
 * Everything the game pays out for comes from here — an external service that
 * does not care what you typed into this app. That is the whole point: a tracker
 * you can talk your way past measures nothing.
 *
 * Two sources, both readable from a static page with no key and no backend:
 *
 *   Codeforces  api/user.status — every submission, with verdict, problem tags,
 *               rating and timestamp. Sends Access-Control-Allow-Origin: *.
 *   GitHub      users/:u/events/public — push events with commit counts.
 *               Also open, but rate-limited to 60 requests an hour per IP.
 *
 * LeetCode is deliberately absent. Its GraphQL endpoint returns data to curl but
 * sends no CORS header, so a browser cannot read it and no amount of client-side
 * cleverness changes that. The app links out to LeetCode for practice and says
 * plainly that it cannot check the result — which is better than inventing a
 * number, and better than pretending a backend exists.
 */

const CF = 'https://codeforces.com/api';
const GH = 'https://api.github.com';

/* --------------------------------- helpers -------------------------------- */

async function getJson(url, { signal, timeout = 20000 } = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  signal?.addEventListener('abort', () => ctl.abort());
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { accept: 'application/json' } });
    if (res.status === 403) throw new Error('Rate limited — try again in a few minutes.');
    if (res.status === 404) throw new Error('No such user.');
    if (!res.ok) throw new Error(`Request failed (HTTP ${res.status}).`);
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('The request timed out.');
    // A network failure and a CORS rejection look identical here by design.
    if (err instanceof TypeError) throw new Error('Could not reach the service. Check your connection.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const dayOf = seconds => {
  const d = new Date(seconds * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* ------------------------------- codeforces ------------------------------- */

/** Does this handle exist? Called before saving one, so a typo fails loudly. */
export async function checkHandle(handle) {
  const clean = String(handle || '').trim();
  if (!/^[\w.-]{2,24}$/.test(clean)) throw new Error('That does not look like a Codeforces handle.');
  const body = await getJson(`${CF}/user.info?handles=${encodeURIComponent(clean)}`);
  if (body.status !== 'OK' || !body.result?.length) throw new Error('No such handle on Codeforces.');
  const u = body.result[0];
  return { handle: u.handle, rating: u.rating || null, rank: u.rank || null, avatar: u.titlePhoto || null };
}

/**
 * Every distinct problem this handle has actually solved.
 *
 * A problem can be submitted many times, and only the first accepted one counts,
 * so results are keyed by problem and keep the earliest OK. `count` is generous
 * because the API pages from newest and there is no cheap way to ask for "since".
 */
export async function fetchSolved(handle, { count = 3000, signal } = {}) {
  const body = await getJson(
    `${CF}/user.status?handle=${encodeURIComponent(handle)}&from=1&count=${count}`, { signal });
  if (body.status !== 'OK') throw new Error(body.comment || 'Codeforces refused the request.');

  const solved = new Map();
  for (const sub of body.result) {
    if (sub.verdict !== 'OK' || !sub.problem) continue;
    const p = sub.problem;
    const key = `${p.contestId ?? 'x'}${p.index ?? ''}`;
    const prev = solved.get(key);
    if (prev && prev.at <= sub.creationTimeSeconds) continue;
    solved.set(key, {
      key,
      name: p.name,
      contestId: p.contestId ?? null,
      index: p.index ?? '',
      rating: p.rating ?? null,
      tags: p.tags || [],
      at: sub.creationTimeSeconds,
      day: dayOf(sub.creationTimeSeconds),
      lang: sub.programmingLanguage || '',
    });
  }
  return [...solved.values()].sort((a, b) => a.at - b.at);
}

/** A link to the problem itself. Gym and problemset use different URL shapes. */
export const problemUrl = p =>
  p.contestId >= 100000
    ? `https://codeforces.com/gym/${p.contestId}/problem/${p.index}`
    : `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;

/**
 * Unsolved problems carrying a tag, inside a rating band — what to actually go
 * and do next. The problemset endpoint returns the whole set for a tag, so the
 * filtering happens here rather than in the query.
 */
export async function suggestProblems(tag, { minRating, maxRating, solvedKeys = new Set(), limit = 8, signal } = {}) {
  const body = await getJson(`${CF}/problemset.problems?tags=${encodeURIComponent(tag)}`, { signal });
  if (body.status !== 'OK') throw new Error('Could not load the problem set.');

  const pool = body.result.problems.filter(p =>
    p.rating != null &&
    p.rating >= minRating && p.rating <= maxRating &&
    p.contestId != null &&
    !solvedKeys.has(`${p.contestId}${p.index}`));

  // Deterministic shuffle so the same tier does not reshuffle on every repaint.
  let seed = (minRating * 31 + tag.length) >>> 0;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, limit).map(p => ({
    key: `${p.contestId}${p.index}`,
    name: p.name, contestId: p.contestId, index: p.index,
    rating: p.rating, tags: p.tags || [],
    url: problemUrl(p),
  }));
}

/* ---------------------------------- github -------------------------------- */

export async function checkGithub(user) {
  const clean = String(user || '').trim();
  if (!/^[\w-]{1,39}$/.test(clean)) throw new Error('That does not look like a GitHub username.');
  const u = await getJson(`${GH}/users/${encodeURIComponent(clean)}`);
  return { login: u.login, name: u.name || null, avatar: u.avatar_url || null, repos: u.public_repos ?? 0 };
}

/**
 * Recent public push events.
 *
 * GitHub keeps roughly 90 days or 300 events, whichever runs out first, so this
 * is a rolling window rather than a full history — enough to credit what you
 * pushed recently, not enough to reconstruct a year. Each push carries its own
 * id, which is what stops the same commits being counted twice on every sync.
 */
export async function fetchPushes(user, { pages = 2, signal } = {}) {
  const out = [];
  for (let page = 1; page <= pages; page++) {
    const events = await getJson(
      `${GH}/users/${encodeURIComponent(user)}/events/public?per_page=100&page=${page}`, { signal });
    if (!Array.isArray(events) || !events.length) break;
    for (const e of events) {
      if (e.type !== 'PushEvent') continue;
      const commits = e.payload?.commits?.length || 0;
      if (!commits) continue;
      out.push({
        id: e.id,
        repo: e.repo?.name || '',
        commits,
        at: Math.floor(new Date(e.created_at).getTime() / 1000),
        day: dayOf(Math.floor(new Date(e.created_at).getTime() / 1000)),
      });
    }
    if (events.length < 100) break;
  }
  return out.sort((a, b) => a.at - b.at);
}

/* --------------------------------- leetcode ------------------------------- */

/**
 * Practice links only. Stated as a limitation in the UI rather than hidden:
 * anything logged from here is marked unverified and pays nothing.
 */
export const LEETCODE_VERIFIABLE = false;
export const leetcodeTagUrl = slug => `https://leetcode.com/tag/${slug}/`;
