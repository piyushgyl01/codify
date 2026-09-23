/**
 * Codeforces — the programming track's ground truth.
 *
 * api/user.status returns every submission with verdict, tags, rating and
 * timestamp, and sends Access-Control-Allow-Origin: *, so a static page can read
 * it with no key and no backend. The judge does not care what you typed here.
 *
 * LeetCode is deliberately absent: its GraphQL endpoint sends no CORS header, so
 * a browser cannot read it. The app links out to it for practice and says plainly
 * that it cannot check the result.
 */
import { getJson, dayOf } from '../../platforms.js';

const CF = 'https://codeforces.com/api';

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

/* --------------------------------- leetcode ------------------------------- */

/**
 * Practice links only. Stated as a limitation in the UI rather than hidden:
 * anything logged from here is marked unverified and pays nothing.
 */
export const LEETCODE_VERIFIABLE = false;
export const leetcodeTagUrl = slug => `https://leetcode.com/tag/${slug}/`;
