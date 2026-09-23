/**
 * Pulling from the outside world and folding it into the save.
 *
 * Kept apart from the fetchers (which only fetch) and from the accounting (which
 * only accounts): this decides when, survives one source failing without losing
 * the other, and makes sure two taps do not run two syncs.
 */
import { S, applyPushes, trackOn } from './state.js';
import { fetchPushes } from './platforms.js';
import { fetchSolved } from './tracks/cp/codeforces.js';
import { applySolves } from './tracks/cp/actions.js';

let inFlight = null;
const MIN_GAP_MS = 60_000;

export const isSyncing = () => !!inFlight;
export const lastSync = () => Math.max(S.tracks.cp.syncedAt || 0, S.github.syncedAt || 0);
export const syncedRecently = () => Date.now() - lastSync() < MIN_GAP_MS;
export const hasSources = () => (trackOn('cp') && !!S.tracks.cp.handle) || !!S.github.user;

/** Sync every linked source. Never rejects; per-source errors come back instead. */
export function syncAll({ force = false } = {}) {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const out = { cf: null, gh: null, errors: [], skipped: false };
    if (!force && syncedRecently()) { out.skipped = true; return out; }

    if (trackOn('cp') && S.tracks.cp.handle) {
      try { const solved = await fetchSolved(S.tracks.cp.handle); S.tracks.cp.error = ''; out.cf = applySolves(solved); }
      catch (err) { S.tracks.cp.error = err.message; out.errors.push(`Codeforces: ${err.message}`); }
    }
    if (S.github.user) {
      try { const pushes = await fetchPushes(S.github.user); S.github.error = ''; out.gh = applyPushes(pushes); }
      catch (err) { S.github.error = err.message; out.errors.push(`GitHub: ${err.message}`); }
    }
    return out;
  })().finally(() => { inFlight = null; });
  return inFlight;
}

export function describeSync(r) {
  if (!r) return '';
  if (r.skipped) return 'Already up to date.';
  const bits = [];
  const solves = r.cf?.fresh?.length || 0, tiers = r.cf?.newTiers?.length || 0, commits = r.gh?.commits || 0;
  if (solves) bits.push(`${solves} new solve${solves === 1 ? '' : 's'}`);
  if (tiers) bits.push(`${tiers} tier${tiers === 1 ? '' : 's'} cleared`);
  if (commits) bits.push(`${commits} commit${commits === 1 ? '' : 's'}`);
  if (!bits.length) return r.errors.length ? r.errors[0] : 'Nothing new since last time.';
  return bits.join(' · ');
}

/** Pull on open when something is linked and the last pull is stale. Silent on failure. */
export function autoSync(onDone) {
  if (!hasSources() || syncedRecently()) return;
  syncAll().then(r => { if (r && !r.skipped) onDone?.(r); }).catch(err => console.warn('[sync]', err.message));
}
