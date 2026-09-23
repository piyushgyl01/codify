/**
 * Competitive programming — pure reads over the track's slice of the save.
 * No storage, no network: everything here is a function of its arguments.
 */
import { TOPICS, TIERS, topicById, topicProgress } from './topics.js';
import { daysBetween } from '../../game.js';

export const solvesOn = (cp, key) => (cp.solved || []).filter(s => s.day === key);

export function dayTotals(cp, key) {
  const s = solvesOn(cp, key);
  return {
    solved: s.length,
    ratedSolved: s.filter(x => x.rating != null).length,
    bestRating: s.reduce((n, x) => Math.max(n, x.rating || 0), 0),
    tags: new Set(s.flatMap(x => x.tags || [])).size,
  };
}

export const treeProgress = cp => TOPICS.map(t => topicProgress(t, cp.solved || []));

export function treeCompletion(cp) {
  const tree = treeProgress(cp);
  const cleared = tree.reduce((n, t) => n + t.cleared, 0), total = TOPICS.length * TIERS.length;
  return { cleared, total, pct: total ? (cleared / total) * 100 : 0 };
}

/**
 * Days since your last accepted solve carrying a topic's tag — a date from the
 * judge, which is the only honest thing the app can say about what has gone stale.
 */
export function staleness(cp, topicId, today) {
  const t = topicById(topicId);
  if (!t) return null;
  const mine = (cp.solved || []).filter(s => (s.tags || []).includes(t.cf));
  if (!mine.length) return { never: true, days: null, last: null };
  const last = mine.reduce((a, b) => (a.at > b.at ? a : b));
  return { never: false, days: daysBetween(last.day, today), last };
}

export function snapshot(cp) {
  const tree = treeProgress(cp);
  return {
    linked: cp.handle ? 1 : 0,
    tiersCleared: tree.reduce((n, t) => n + t.cleared, 0),
    topicsStarted: tree.filter(t => t.total > 0).length,
    topicsMaxed: tree.filter(t => t.cleared === TIERS.length).length,
  };
}

/** What one accepted problem is worth. Difficulty is the judge's rating. */
export const solveXp = rating => (rating == null ? 20 : Math.round(20 + Math.pow(rating / 100, 1.6)));
export const solveCoins = rating => (rating == null ? 5 : Math.round(5 + rating / 60));

/** Codeforces' own colour bands, in this app's palette. */
export const BANDS = [
  { min: 0,    name: 'Newcomer',   color: 'var(--muted)' },
  { min: 1200, name: 'Pupil',      color: 'var(--acid)' },
  { min: 1400, name: 'Specialist', color: 'var(--cyan)' },
  { min: 1600, name: 'Expert',     color: 'var(--blue)' },
  { min: 1900, name: 'Candidate',  color: 'var(--violet)' },
  { min: 2100, name: 'Master+',    color: 'var(--red)' },
];
export const bandFor = rating => [...BANDS].reverse().find(b => (rating || 0) >= b.min) || BANDS[0];
export const colorForRating = rating => (rating == null ? 'var(--muted)' : bandFor(rating).color);
