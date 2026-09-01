/**
 * The derived numbers — and one of them is the reason this app exists.
 *
 * calibration() compares what the retention model predicted against what your
 * retests actually showed. Every learning tracker will happily tell you how many
 * hours you put in. Only a check like this can tell you those hours are not
 * turning into anything, which is the failure mode that quietly wastes years.
 *
 * It is also, deliberately, a check on the app itself. The half-life model in
 * game.js is a defensible guess, not a law. If it consistently over-predicts what
 * you retain, the honest thing is to say so on screen rather than keep issuing
 * confident numbers.
 */
import { S, historySeries, targets, pathHours, patternTally, skillStatus } from './state.js';
import { PATTERNS, MODES, modeWeight, isDeliberate } from './data/practice.js';
import { PATHS, nodeById, nodesOfPath } from './data/skilltree.js';
import { predictedRetention, daysBetween, dayKey, shiftDay, totalsOf, freshnessFor } from './game.js';

/* -------------------------------- calibration ----------------------------- */

/** Below this many retests there is nothing to say, and saying it anyway is noise. */
export const MIN_RETESTS = 5;

/**
 * Effective hours per path as of each date, so a retest taken in March is scored
 * against the experience you had in March rather than the experience you have now.
 */
function hoursTimeline() {
  const keys = Object.keys(S.days).sort();
  const running = Object.fromEntries(PATHS.map(p => [p.id, 0]));
  const timeline = [];
  for (const key of keys) {
    for (const e of S.days[key].focus || []) {
      if (e.path && running[e.path] != null) running[e.path] += (e.minutes || 0) * modeWeight(e.mode);
    }
    timeline.push({ key, hours: { ...running } });
  }
  return timeline;
}

/** Path hours as they stood on `date` — the last snapshot at or before it. */
function hoursAsOf(timeline, date, path) {
  let found = 0;
  for (const row of timeline) {
    if (row.key > date) break;
    found = row.hours[path] || 0;
  }
  return found / 60;
}

/**
 * Replay every node's history into individual retest events, each carrying what
 * the model would have predicted at the moment it was taken.
 */
export function retestEvents() {
  const timeline = hoursTimeline();
  const events = [];

  for (const [nodeId, rec] of Object.entries(S.skills)) {
    const node = nodeById(nodeId);
    const history = rec.history || [];
    if (!node || history.length < 2) continue;

    let passes = 0;
    let lastProof = history[0].date;

    for (const h of history.slice(1)) {
      const since = Math.max(0, daysBetween(lastProof, h.date));
      const hours = hoursAsOf(timeline, h.date, node.path);
      events.push({
        nodeId, node, date: h.date, daysSince: since,
        predicted: predictedRetention(since, hours, passes),
        passed: !!h.passed,
        minutes: h.minutes || 0,
      });
      passes = h.passed ? passes + 1 : Math.max(0, passes - 1);
      lastProof = h.date;
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Tolerance shrinks as evidence accumulates. Five retests cannot separate a real
 * gap from a run of bad luck; fifty can.
 */
const toleranceFor = n => Math.max(0.08, 0.45 / Math.sqrt(n));

export function calibration() {
  const events = retestEvents();
  if (events.length < MIN_RETESTS) {
    return { tooFew: true, have: events.length, need: MIN_RETESTS };
  }

  const predicted = events.reduce((n, e) => n + e.predicted, 0) / events.length;
  const actual = events.filter(e => e.passed).length / events.length;
  const gap = actual - predicted;
  const tolerance = toleranceFor(events.length);

  return {
    events: events.length,
    predicted, actual, gap, tolerance,
    passed: events.filter(e => e.passed).length,
    verdict: verdictFor(gap, tolerance),
    recent: events.slice(-12),
  };
}

function verdictFor(gap, tolerance) {
  if (Math.abs(gap) <= tolerance) {
    return { key:'match', tone:'good', title:'The model matches your recall',
      text:'What this app predicts you still know is what your retests keep showing. ' +
           'The retention numbers on the tree can be trusted as they stand.' };
  }
  if (gap < 0) {
    return { key:'optimistic', tone:'bad', title:'You are forgetting faster than your log implies',
      text:'Your retests fail more often than the hours you logged would suggest. The usual causes, ' +
           'in order: too much of the time was passive, the spacing is too generous for how new the ' +
           'material is, or the hours went somewhere other than the skill being tested.' };
  }
  return { key:'conservative', tone:'info', title:'You are holding more than your log accounts for',
    text:'You pass retests the model expected you to fail. Usually that means real practice is ' +
         'happening that never gets logged — work at your job, or reading you did not count.' };
}

/* --------------------------------- forecast ------------------------------- */

const today = () => dayKey();

/**
 * Average predicted retention across everything you hold, projected forward.
 * The shape of the decay is the argument for the retest queue existing at all.
 */
export function retentionForecast(days = 60) {
  const ids = Object.keys(S.skills);
  if (!ids.length) return [];

  const hours = pathHours();
  const out = [];
  for (let d = 0; d <= days; d += Math.max(1, Math.round(days / 30))) {
    let sum = 0;
    for (const id of ids) {
      const rec = S.skills[id];
      const node = nodeById(id);
      if (!node) continue;
      const since = daysBetween(rec.lastProof || rec.date, today()) + d;
      sum += predictedRetention(since, hours[node.path] || 0, rec.passes || 0);
    }
    out.push({ day: d, value: sum / ids.length });
  }
  return out;
}

/** How many retests fall due on each of the next `days` days. */
export function queueForecast(days = 14) {
  const hours = pathHours();
  const buckets = Array.from({ length: days + 1 }, (_, i) => ({ day: i, key: shiftDay(today(), i), count: 0 }));
  for (const id of Object.keys(S.skills)) {
    const st = skillStatus(id, hours);
    if (!st) continue;
    const idx = Math.max(0, Math.min(days, st.dueIn));
    buckets[idx].count += 1;
  }
  return buckets;
}

/** Overall health of what you hold: counts per freshness band. */
export function retentionBands() {
  const hours = pathHours();
  const bands = { fresh:0, warm:0, rusty:0, cold:0 };
  for (const id of Object.keys(S.skills)) {
    const st = skillStatus(id, hours);
    if (st) bands[st.freshness.id] += 1;
  }
  const total = Object.values(bands).reduce((a, b) => a + b, 0);
  return { bands, total, held: total ? (bands.fresh + bands.warm) / total : 0 };
}

/* --------------------------------- practice ------------------------------- */

/**
 * Trailing average. `overLogged` picks which days count: totals average over days
 * with a non-zero value, shares over every logged day. Getting this backwards is
 * how a chart ends up drawing a flat 100% deliberate line over a month of video.
 */
export function movingAverage(days, key, window = 7, { overLogged = false } = {}) {
  return days.map((_, i) => {
    const slice = days.slice(Math.max(0, i - window + 1), i + 1)
      .filter(d => (overLogged ? d.logged : d[key] > 0));
    if (!slice.length) return null;
    return slice.reduce((n, d) => n + (d[key] || 0), 0) / slice.length;
  });
}

/**
 * Average over days where the metric was actually in play.
 *
 * For a total like minutes, "in play" means non-zero — a day you did not practise
 * should not drag the average of days you did.
 */
const avgOf = (days, key) => {
  const on = days.filter(d => d[key] > 0);
  return on.length ? on.reduce((n, d) => n + d[key], 0) / on.length : 0;
};

/**
 * Average over every logged day, zeros included.
 *
 * Required for any percentage or count: a day that was 100% video has a
 * deliberate share of exactly 0, and dropping it because the value is zero turns
 * the worst days invisible and reports the average as perfect.
 */
const avgOverLogged = (days, key) => {
  const on = days.filter(d => d.logged);
  return on.length ? on.reduce((n, d) => n + (d[key] || 0), 0) / on.length : 0;
};

/** Colour band for how close a day landed to its focus target, in minutes. */
export function focusBand(minutes, target) {
  if (!minutes) return 'none';
  if (minutes >= target) return 'on';
  if (minutes >= target * 0.6) return 'near';
  return 'off';
}

export const BAND_COLOR = {
  on:   'var(--good)',
  near: 'var(--warn)',
  off:  'var(--bad)',
  none: 'var(--muted)',
};

/** Share of a day's minutes by practice mode — the tutorial-hell meter. */
export function modeBreakdown(day) {
  const focus = day?.focus || [];
  const total = focus.reduce((n, e) => n + (e.minutes || 0), 0);
  if (!total) return null;

  const byMode = {};
  for (const e of focus) byMode[e.mode] = (byMode[e.mode] || 0) + (e.minutes || 0);

  return {
    total,
    groups: MODES.map(m => ({
      ...m,
      minutes: byMode[m.id] || 0,
      pct: ((byMode[m.id] || 0) / total) * 100,
    })),
    deliberatePct: (MODES.filter(m => isDeliberate(m.id))
      .reduce((n, m) => n + (byMode[m.id] || 0), 0) / total) * 100,
    passivePct: ((byMode.watch || 0) / total) * 100,
  };
}

export function rollingAverages(windowDays = 7) {
  const days = historySeries(windowDays);
  return {
    minutes: Math.round(avgOf(days, 'minutes')),
    effMinutes: Math.round(avgOf(days, 'effMinutes')),
    // Shares and counts average over every logged day — see avgOverLogged.
    solved: Math.round(avgOverLogged(days, 'solved') * 10) / 10,
    deliberatePct: Math.round(avgOverLogged(days, 'deliberatePct')),
    loggedDays: days.filter(d => d.logged).length,
    window: windowDays,
  };
}

/** Consecutive days ending today that met the focus target. */
export function targetStreak() {
  const days = historySeries(90);
  const t = targets();
  let n = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].minutes >= t.focus) n++; else break;
  }
  return n;
}

/**
 * Sustained practice above stated capacity.
 *
 * Every other number in this app points the same direction — more. This one does
 * not, and it is here because the failure mode it catches (three good weeks
 * followed by three months off) is more common among the people who would use
 * this app than laziness is.
 */
export function overreach(windowDays = 7) {
  const days = historySeries(windowDays).filter(d => d.logged);
  const t = targets();
  if (days.length < 5) return null;
  const avg = days.reduce((n, d) => n + d.minutes, 0) / days.length;
  if (avg <= t.ceiling) return null;
  return { avg: Math.round(avg), ceiling: t.ceiling, capacity: t.capacity, days: days.length };
}

/* --------------------------------- coverage ------------------------------- */

/** Problems solved per pattern, with the thin end called out. */
export function patternCoverage() {
  const tally = patternTally();
  const rows = PATTERNS.map(p => ({ ...p, count: tally[p.id] || 0 }));
  const total = rows.reduce((n, r) => n + r.count, 0);
  const covered = rows.filter(r => r.count > 0).length;
  return {
    rows: rows.sort((a, b) => b.count - a.count),
    total, covered, of: PATTERNS.length,
    thin: rows.filter(r => r.count === 0).slice(0, 6),
  };
}

/** Effective hours and node progress per path — where your attention actually went. */
export function pathBalance() {
  const hours = pathHours();
  const rows = PATHS.map(p => {
    const nodes = nodesOfPath(p.id);
    const held = nodes.filter(n => S.skills[n.id]).length;
    return { ...p, hours: hours[p.id] || 0, held, nodes: nodes.length,
             pct: nodes.length ? (held / nodes.length) * 100 : 0 };
  });
  const total = rows.reduce((n, r) => n + r.hours, 0);
  return {
    rows: rows.sort((a, b) => b.hours - a.hours),
    total,
    starved: rows.filter(r => r.hours < total * 0.03).map(r => r.name),
  };
}

/* ---------------------------------- days ---------------------------------- */

export function dayStats(day) {
  const t = targets();
  const tot = totalsOf(day);
  const modes = modeBreakdown(day);
  return {
    ...tot,
    target: t.focus,
    band: focusBand(tot.minutes, t.focus),
    over: tot.minutes - t.focus,
    deliberateFloor: t.deliberate,
    hitDeliberate: tot.deliberatePct >= t.deliberate,
    modes,
  };
}

/** Group history into weeks, newest last. */
export function weeklyBuckets(weeks = 8) {
  const days = historySeries(weeks * 7);
  const out = [];
  for (let w = 0; w < weeks; w++) {
    const slice = days.slice(w * 7, w * 7 + 7);
    if (!slice.length) continue;
    const logged = slice.filter(d => d.logged);
    out.push({
      label: slice[0].key.slice(5),
      from: slice[0].key, to: slice.at(-1).key,
      minutes: slice.reduce((n, d) => n + d.minutes, 0),
      effMinutes: slice.reduce((n, d) => n + d.effMinutes, 0),
      solved: slice.reduce((n, d) => n + d.solved, 0),
      ships: slice.reduce((n, d) => n + d.ships, 0),
      loggedDays: logged.length,
      deliberatePct: logged.length
        ? logged.reduce((n, d) => n + d.deliberatePct, 0) / logged.length : 0,
    });
  }
  return out;
}

/* -------------------------------- problems -------------------------------- */

/** Solve rate and hint rate over a window — is the difficulty right? */
export function problemHealth(windowDays = 30) {
  const rows = [];
  const days = historySeries(windowDays);
  for (const d of days) rows.push(...(S.days[d.key]?.problems || []));
  if (!rows.length) return null;

  const solved = rows.filter(p => p.solved);
  const byDifficulty = ['easy', 'medium', 'hard'].map(id => {
    const set = rows.filter(p => p.difficulty === id);
    const won = set.filter(p => p.solved);
    return {
      id, attempted: set.length, solved: won.length,
      rate: set.length ? won.length / set.length : 0,
      medianMinutes: median(won.map(p => p.minutes).filter(m => m > 0)),
    };
  });

  return {
    attempted: rows.length,
    solved: solved.length,
    solveRate: solved.length / rows.length,
    hintRate: solved.length ? solved.filter(p => p.hinted).length / solved.length : 0,
    byDifficulty,
    /* A solve rate near 100% means the problems are too easy to teach you
       anything; near zero means they are too hard to finish. The interesting
       band is uncomfortable on purpose. */
    note: difficultyNote(solved.length / rows.length),
  };
}

function difficultyNote(rate) {
  if (rate >= 0.92) return 'Almost everything you attempt, you solve. Reach for harder problems.';
  if (rate <= 0.35) return 'Most attempts do not land. Drop a difficulty — finishing teaches more than failing.';
  return null;
}

const median = arr => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
};
export { median };

/* --------------------------------- sorting -------------------------------- */

export const LOG_SORTS = {
  time:    { label:'Time',    fn:(a, b) => a.ts - b.ts },
  length:  { label:'Length',  fn:(a, b) => (b.minutes || 0) - (a.minutes || 0) },
  weight:  { label:'Weight',  fn:(a, b) => (b.minutes * modeWeight(b.mode)) - (a.minutes * modeWeight(a.mode)) },
};
