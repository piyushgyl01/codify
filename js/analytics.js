/**
 * Derived numbers.
 *
 * Everything here is computed from verified data — accepted submissions and
 * public pushes. There is no predictive model in this file any more, and that is
 * deliberate: the previous version invented a forgetting curve and then checked
 * it against tests the user marked themselves, which measured nothing. What
 * replaced it is arithmetic over facts.
 */
import { S, historySeries, solvedList, pushList, treeProgress, staleness } from './state.js';
import { TOPICS, TIERS } from './data/skilltree.js';
import { daysBetween, dayKey } from './game.js';

/* --------------------------------- ratings -------------------------------- */

/** The Codeforces bands, so the histogram reads the way the site does. */
export const BANDS = [
  { min:800,  max:1199, name:'Newcomer',   color:'var(--muted)' },
  { min:1200, max:1399, name:'Pupil',      color:'var(--acid)' },
  { min:1400, max:1599, name:'Specialist', color:'var(--cyan)' },
  { min:1600, max:1899, name:'Expert',     color:'var(--blue)' },
  { min:1900, max:2099, name:'Cand. Mas',  color:'var(--violet)' },
  { min:2100, max:3500, name:'Master+',    color:'var(--red)' },
];

export const bandFor = rating =>
  rating == null ? null : BANDS.find(b => rating >= b.min && rating <= b.max) || BANDS.at(-1);

export const colorForRating = rating => bandFor(rating)?.color || 'var(--muted)';

/** How many solves sit in each band. The shape of your comfort zone. */
export function ratingHistogram() {
  const solved = solvedList().filter(s => s.rating != null);
  return BANDS.map(b => ({
    ...b,
    count: solved.filter(s => s.rating >= b.min && s.rating <= b.max).length,
  }));
}

/**
 * Highest rating solved, as a running maximum over time.
 *
 * A running max rather than a scatter: the question this answers is "has the
 * ceiling moved", and a single lucky solve months ago should stay visible rather
 * than being averaged away.
 */
export function ceilingOverTime(weeks = 12) {
  const solved = solvedList().filter(s => s.rating != null).sort((a, b) => a.at - b.at);
  if (!solved.length) return [];
  const out = [];
  let best = 0;
  const start = Date.now() / 1000 - weeks * 7 * 86400;
  for (const s of solved) {
    best = Math.max(best, s.rating);
    if (s.at >= start) out.push({ at: s.at, day: s.day, value: best });
  }
  // Nothing recent: still show the flat line at the level already reached.
  if (!out.length) out.push({ at: Date.now() / 1000, day: dayKey(), value: best });
  return out;
}

/* ---------------------------------- topics -------------------------------- */

/** Solves per topic, plus how long since each was last touched. */
export function topicCoverage() {
  const rows = treeProgress().map(p => {
    const st = staleness(p.topic.id);
    return {
      topic: p.topic,
      solves: p.total,
      best: p.best,
      cleared: p.cleared,
      days: st?.days ?? null,
      never: !!st?.never,
    };
  });
  return {
    rows: [...rows].sort((a, b) => b.solves - a.solves),
    started: rows.filter(r => r.solves > 0).length,
    of: TOPICS.length,
    untouched: rows.filter(r => r.solves === 0).map(r => r.topic),
  };
}

/** Above this many days with no solve, a topic is worth calling out. */
export const STALE_AFTER = 45;

export function staleTopics(limit = 5) {
  return topicCoverage().rows
    .filter(r => !r.never && r.days >= STALE_AFTER)
    .sort((a, b) => b.days - a.days)
    .slice(0, limit);
}

/** Tiers cleared out of every tier there is. */
export function treeCompletion() {
  const tree = treeProgress();
  const cleared = tree.reduce((n, t) => n + t.cleared, 0);
  const total = TOPICS.length * TIERS.length;
  return { cleared, total, pct: total ? (cleared / total) * 100 : 0 };
}

/* ----------------------------------- days --------------------------------- */

export function movingAverage(days, key, window = 7) {
  return days.map((_, i) => {
    const slice = days.slice(Math.max(0, i - window + 1), i + 1);
    if (!slice.length) return null;
    return slice.reduce((n, d) => n + (d[key] || 0), 0) / slice.length;
  });
}

export function rollingAverages(windowDays = 7) {
  const days = historySeries(windowDays);
  const avg = key => days.reduce((n, d) => n + (d[key] || 0), 0) / days.length;
  return {
    solved: Math.round(avg('solved') * 10) / 10,
    commits: Math.round(avg('commits') * 10) / 10,
    minutes: Math.round(avg('verifiedMinutes')),
    activeDays: days.filter(d => d.logged).length,
    window: windowDays,
  };
}

/** Consecutive days ending today with at least one accepted solve. */
export function solveStreak() {
  const days = historySeries(120);
  let n = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].solved > 0) n++; else break;
  }
  return n;
}

export function weeklyBuckets(weeks = 8) {
  const days = historySeries(weeks * 7);
  const out = [];
  for (let w = 0; w < weeks; w++) {
    const slice = days.slice(w * 7, w * 7 + 7);
    if (!slice.length) continue;
    out.push({
      label: slice[0].key.slice(5),
      from: slice[0].key, to: slice.at(-1).key,
      solved: slice.reduce((n, d) => n + d.solved, 0),
      commits: slice.reduce((n, d) => n + d.commits, 0),
      minutes: slice.reduce((n, d) => n + d.verifiedMinutes, 0),
      activeDays: slice.filter(d => d.logged).length,
    });
  }
  return out;
}

/* -------------------------------- the mix --------------------------------- */

/**
 * Verified against unverified activity.
 *
 * Shown because the whole design rests on the distinction, and someone whose log
 * is mostly hand-typed should be able to see that at a glance rather than
 * discovering it when their XP does not move.
 */
export function verifiedMix(windowDays = 30) {
  const days = historySeries(windowDays);
  const verified = days.reduce((n, d) => n + d.verifiedMinutes, 0);
  const total = days.reduce((n, d) => n + d.minutes, 0);
  const notes = days.reduce((n, d) => n + d.notes, 0);
  return {
    verified, total, notes,
    unverified: Math.max(0, total - verified),
    pct: total ? (verified / total) * 100 : 0,
  };
}

/* -------------------------------- freshness ------------------------------- */

/** Days since the most recent solve of any kind. The bluntest honest number. */
export function daysSinceLastSolve() {
  const solved = solvedList();
  if (!solved.length) return null;
  const last = solved.reduce((a, b) => (a.at > b.at ? a : b));
  return { days: daysBetween(last.day, dayKey()), problem: last };
}

export const lastSyncAt = () => Math.max(S.platforms.cf.syncedAt || 0, S.platforms.gh.syncedAt || 0);
