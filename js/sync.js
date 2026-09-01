/**
 * Pulling from the platforms and folding the result into the save.
 *
 * Kept separate from platforms.js (which only knows how to fetch) and from
 * state.js (which only knows how to account). This is the part that decides
 * when, handles a failure without losing the other source, and makes sure two
 * taps on the button do not run two syncs.
 */
import { S, applySolves, applyPushes, isLinked } from './state.js';
import { fetchSolved, fetchPushes } from './platforms.js';

let inFlight = null;

export const isSyncing = () => !!inFlight;

/** Long enough not to hammer a rate-limited API on every repaint. */
const MIN_GAP_MS = 60_000;

export const lastSync = () => Math.max(S.platforms.cf.syncedAt || 0, S.platforms.gh.syncedAt || 0);
export const syncedRecently = () => Date.now() - lastSync() < MIN_GAP_MS;

/**
 * Sync both sources. One failing does not stop the other — a GitHub rate limit
 * should not cost you your Codeforces solves.
 *
 * Never rejects; the result carries per-source errors instead.
 */
export function syncAll({ force = false } = {}) {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const out = { cf: null, gh: null, errors: [], skipped: false };

    if (!force && syncedRecently()) {
      out.skipped = true;
      return out;
    }

    const cfHandle = S.platforms.cf.handle;
    const ghUser = S.platforms.gh.user;

    if (cfHandle) {
      try {
        const solved = await fetchSolved(cfHandle);
        S.platforms.cf.error = '';
        out.cf = applySolves(solved);
      } catch (err) {
        S.platforms.cf.error = err.message;
        out.errors.push(`Codeforces: ${err.message}`);
      }
    }

    if (ghUser) {
      try {
        const pushes = await fetchPushes(ghUser);
        S.platforms.gh.error = '';
        out.gh = applyPushes(pushes);
      } catch (err) {
        S.platforms.gh.error = err.message;
        out.errors.push(`GitHub: ${err.message}`);
      }
    }

    return out;
  })().finally(() => { inFlight = null; });

  return inFlight;
}

/** A one-line summary of what a sync actually changed. */
export function describeSync(result) {
  if (!result) return '';
  if (result.skipped) return 'Already up to date.';
  const bits = [];
  const solves = result.cf?.fresh?.length || 0;
  const tiers = result.cf?.newTiers?.length || 0;
  const commits = result.gh?.commits || 0;
  if (solves) bits.push(`${solves} new solve${solves === 1 ? '' : 's'}`);
  if (tiers) bits.push(`${tiers} tier${tiers === 1 ? '' : 's'} cleared`);
  if (commits) bits.push(`${commits} commit${commits === 1 ? '' : 's'}`);
  if (!bits.length) return result.errors.length ? result.errors[0] : 'Nothing new since last time.';
  return bits.join(' · ');
}

/** Pull on open when linked and the last pull is stale. Silent on failure. */
export function autoSync(onDone) {
  if (!isLinked() || syncedRecently()) return;
  syncAll().then(r => { if (r && !r.skipped) onDone?.(r); })
           .catch(err => console.warn('[sync]', err.message));
}
