/**
 * Shared network reads: the helper every source uses, and GitHub.
 *
 * GitHub users/:u/events/public — push events with commit counts. Open to a
 * static page with no key, rate-limited to 60 requests an hour per network.
 * Codeforces lives with the programming track, in tracks/cp/codeforces.js.
 */

const GH = 'https://api.github.com';

/* --------------------------------- helpers -------------------------------- */

export async function getJson(url, { signal, timeout = 20000 } = {}) {
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

