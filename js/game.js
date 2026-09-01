/**
 * Pure game and model maths. No DOM, no storage, no randomness — everything here
 * is a function of its arguments, which is why the test suite can cover it all.
 */
import { ACHIEVEMENTS } from './data/achievements.js';
import { questsForDay } from './data/quests.js';
import { modeWeight, isDeliberate, PATTERNS } from './data/practice.js';
import { NODES, nodesOfPath, PATHS } from './data/skilltree.js';

/* ------------------------------- LEVELLING -------------------------------- */

/** XP needed to go from `level` to `level + 1`. */
export const xpToNext = level => Math.round(100 * Math.pow(level, 1.25));

export function xpAtLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpToNext(i);
  return total;
}

export function levelFromXp(xp) {
  let level = 1, rem = Math.max(0, xp);
  while (rem >= xpToNext(level) && level < 99) { rem -= xpToNext(level); level++; }
  const need = xpToNext(level);
  return { level, into: rem, need, pct: Math.min(100, (rem / need) * 100) };
}

/** Named after a real engineering ladder, because that is the ladder being climbed. */
export const RANKS = [
  { at:1,  name:'Novice',        icon:'○', color:'#565045' },
  { at:5,  name:'Apprentice',    icon:'◆', color:'#2563EB' },
  { at:10, name:'Practitioner',  icon:'◈', color:'#0C8F86' },
  { at:15, name:'Engineer',      icon:'⬢', color:'#12A150' },
  { at:20, name:'Senior',        icon:'⬡', color:'#C77A0F' },
  { at:30, name:'Staff',         icon:'✦', color:'#6D3FE0' },
  { at:40, name:'Principal',     icon:'✧', color:'#C92A6E' },
  { at:50, name:'Distinguished', icon:'★', color:'#C7530F' },
];
export const rankFor = level => [...RANKS].reverse().find(r => level >= r.at) || RANKS[0];
export const nextRank = level => RANKS.find(r => r.at > level) || null;

/* ------------------------------ DAILY BUDGET ------------------------------ */

/**
 * How much of your stated capacity to aim at.
 *
 * Never 100%. Nobody converts every available hour into deliberate practice, and
 * a target you miss by definition every day stops being information. The goal
 * you pick moves the fraction, not the fiction.
 */
export const GOALS = [
  { id:'maintain', name:'Stay sharp',      icon:'◇', intensity:0.50, deliberate:50, problems:0, ships:1,
    desc:'Hold what you have. Retests and light practice.' },
  { id:'levelup',  name:'Level up',        icon:'◈', intensity:0.70, deliberate:60, problems:1, ships:2,
    desc:'Steady growth alongside a job.' },
  { id:'switch',   name:'Change track',    icon:'◆', intensity:0.85, deliberate:70, problems:2, ships:3,
    desc:'Moving into a new area, or a new role.' },
  { id:'sprint',   name:'Interview sprint',icon:'▲', intensity:0.95, deliberate:75, problems:3, ships:1,
    desc:'Short, hard and time-boxed. Not sustainable, and not meant to be.' },
];
export const goalFor = id => GOALS.find(g => g.id === id) || GOALS[1];

/** What you are aiming at. Steers recommendations and the order of the tree. */
export const TRACKS = [
  { id:'generalist', name:'Generalist',  icon:'◈', paths:['lang','craft','data','web','store','sys','algo','scale'] },
  { id:'backend',    name:'Backend',     icon:'::', paths:['lang','store','scale','sys','craft','data','algo','web'] },
  { id:'frontend',   name:'Frontend',    icon:'@',  paths:['web','lang','craft','data','algo','scale','sys','store'] },
  { id:'systems',    name:'Systems',     icon:'#!', paths:['sys','lang','data','craft','scale','algo','store','web'] },
  { id:'interview',  name:'Interview',   icon:'▩',  paths:['algo','data','lang','scale','store','sys','craft','web'] },
];
export const trackFor = id => TRACKS.find(t => t.id === id) || TRACKS[0];

/** Paths ordered by how much this track cares about them. */
export const pathOrder = trackId => {
  const order = trackFor(trackId).paths;
  return [...PATHS].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Daily targets from the profile.
 *
 * `capacity` is what you said you have. `focus` is what to aim at. `ceiling` is
 * the line above which you are overreaching — an app that only ever says "more"
 * is an app that helps you burn out on schedule.
 */
export function targetsFor(profile) {
  const goal = goalFor(profile.goal);
  const capacity = clamp(Math.round((+profile.hours || 2) * 60), 15, 720);
  const focus = clamp(Math.round((capacity * goal.intensity) / 5) * 5, 15, 600);

  return {
    capacity,
    focus,
    weekly: focus * 6,                  // one rest day is assumed, not earned
    ceiling: Math.round(capacity * 1.4),
    deliberate: goal.deliberate,        // percent floor
    problems: goal.problems,            // per day
    ships: goal.ships,                  // per week
    goal,
  };
}

/* -------------------------------- THE DAY --------------------------------- */

/** Everything a single day adds up to, across all three logs. */
export function totalsOf(day) {
  const focus = day?.focus || [];
  const problems = day?.problems || [];
  const ships = day?.ships || [];
  const retests = day?.retests || [];

  const minutes = focus.reduce((n, e) => n + (e.minutes || 0), 0);
  const effMinutes = focus.reduce((n, e) => n + (e.minutes || 0) * modeWeight(e.mode), 0);
  const deliberateMin = focus.filter(e => isDeliberate(e.mode))
                             .reduce((n, e) => n + (e.minutes || 0), 0);

  const byMode = { build:0, drill:0, read:0, watch:0 };
  for (const e of focus) byMode[e.mode] = (byMode[e.mode] || 0) + (e.minutes || 0);

  const solved = problems.filter(p => p.solved);

  return {
    minutes,
    effMinutes: Math.round(effMinutes),
    deliberateMin,
    deliberatePct: minutes ? Math.round((deliberateMin / minutes) * 100) : 0,
    byMode,
    sessions: focus.length,
    problems: problems.length,
    solved: solved.length,
    solvedNoHint: solved.filter(p => !p.hinted).length,
    hardSolved: solved.filter(p => p.difficulty === 'hard').length,
    mediumSolved: solved.filter(p => p.difficulty === 'medium').length,
    patterns: new Set(problems.map(p => p.pattern).filter(Boolean)).size,
    ships: ships.length,
    commits: ships.filter(s => s.kind === 'commit').reduce((n, s) => n + (s.count || 1), 0),
    prs: ships.filter(s => s.kind === 'pr').reduce((n, s) => n + (s.count || 1), 0),
    retests: retests.length,
    retestsPassed: retests.filter(r => r.passed).length,
    paths: new Set(focus.map(e => e.path).filter(Boolean)).size,
  };
}

/** Read one quest metric out of a day. `ctx` carries what a day alone cannot know. */
export function metricValue(metric, day, ctx = {}) {
  const t = totalsOf(day);
  const focus = day?.focus || [];

  switch (metric) {
    case 'minutes':        return t.minutes;
    case 'effMinutes':     return t.effMinutes;
    case 'buildMinutes':   return t.byMode.build || 0;
    case 'readMinutes':    return t.byMode.read || 0;
    case 'deliberatePct':  return t.deliberatePct;
    case 'sessions':       return t.sessions;
    case 'pathsTouched':   return t.paths;
    case 'deepSessions':   return focus.filter(e => (e.minutes || 0) >= 45).length;
    case 'notedSessions':  return focus.filter(e => (e.note || '').trim().length >= 8).length;
    case 'drills':         return focus.filter(e => e.drillId && !e.gauntlet).length;
    case 'gauntletAttempts': return (day?.gauntlets || []).length;

    case 'problems':       return t.problems;
    case 'solved':         return t.solved;
    case 'solvedNoHint':   return t.solvedNoHint;
    case 'hardSolved':     return t.hardSolved;
    case 'mediumSolved':   return t.mediumSolved;
    case 'patterns':       return t.patterns;
    case 'neglectedPattern':
      return ctx.neglected
        ? (day?.problems || []).filter(p => p.pattern === ctx.neglected && p.solved).length
        : t.solved;                          // no history yet: any solve counts

    case 'ships':          return t.ships;
    case 'commits':        return t.commits;
    case 'prs':            return t.prs;

    case 'retests':        return t.retests;
    case 'retestsPassed':  return t.retestsPassed;
    case 'skillsClaimed':  return (day?.skillsClaimed || []).length;

    default: return 0;
  }
}

export function dailyQuests(dateKey, level, day, ctx = {}) {
  return questsForDay(dateKey, level).map(q => {
    const value = metricValue(q.metric, day, ctx);
    return { ...q, value, done: value >= q.goal, pct: Math.min(100, (value / q.goal) * 100) };
  });
}

/* ------------------------------ ACHIEVEMENTS ------------------------------ */

export function newlyEarned(stats, earned) {
  return ACHIEVEMENTS.filter(a => !earned[a.id] && a.check(stats));
}

/* -------------------------------- RETENTION ------------------------------- */

/**
 * The model the whole app is built to test.
 *
 * A skill decays exponentially from the day you last proved you had it. How
 * slowly depends on two things this app can actually observe: how many effective
 * hours you have put into that path, and how many times you have already
 * re-proven the node. Both widen the half-life, which is exactly what spacing
 * research finds qualitatively — each successful recall buys longer than the last.
 *
 * The constants are a defensible starting shape, not a measurement of you. That
 * is the point of the calibration in analytics.js: it compares what this model
 * predicts against what your retests actually show, and tells you when the model
 * is flattering you. A model nobody checks is a horoscope.
 */
export const BASE_HALF_LIFE = 9;          // days, for a node with no hours behind it
export const HOURS_FACTOR = 1.0;          // how much path experience widens it
export const PASS_FACTOR = 0.45;          // how much each successful retest widens it

export function halfLifeDays(pathHours = 0, passes = 0) {
  const experience = 1 + HOURS_FACTOR * Math.log2(1 + Math.max(0, pathHours));
  const spacing = 1 + PASS_FACTOR * Math.max(0, passes);
  return BASE_HALF_LIFE * experience * spacing;
}

/** Modelled probability the node is still yours, 0..1. */
export function predictedRetention(daysSince, pathHours = 0, passes = 0) {
  if (daysSince <= 0) return 1;
  return Math.pow(2, -daysSince / halfLifeDays(pathHours, passes));
}

/** How a retention figure is described on screen. */
export const FRESHNESS = [
  { id:'fresh', at:0.80, name:'Fresh', color:'var(--good)', badge:'good' },
  { id:'warm',  at:0.50, name:'Warm',  color:'var(--info)', badge:'info' },
  { id:'rusty', at:0.25, name:'Rusty', color:'var(--warn)', badge:'warn' },
  { id:'cold',  at:0,    name:'Cold',  color:'var(--bad)',  badge:'bad'  },
];
export const freshnessFor = r => FRESHNESS.find(f => r >= f.at) || FRESHNESS.at(-1);

/**
 * Spacing schedule, in days after the last successful proof. Each rung is roughly
 * three times the last — far enough to be worth something, near enough that a
 * failure is recoverable.
 */
export const RETEST_STEPS = [7, 21, 60, 150, 365];
/** A failed retest comes back quickly, and drops a rung rather than resetting. */
export const RETEST_AFTER_FAIL = 3;

/** When the next retest is due, as a day offset from the last proof. */
export function nextRetestGap(passes = 0, lastFailed = false) {
  if (lastFailed) return RETEST_AFTER_FAIL;
  return RETEST_STEPS[Math.min(passes, RETEST_STEPS.length - 1)];
}

/* --------------------------------- DATES ---------------------------------- */

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function daysBetween(aKey, bKey) {
  const a = new Date(aKey + 'T00:00:00'), b = new Date(bKey + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

export function shiftDay(key, days) {
  const d = new Date(key + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

/* --------------------------------- LOOKUPS -------------------------------- */

export const PATTERN_IDS = PATTERNS.map(p => p.id);
export const pathNodeCount = pathId => nodesOfPath(pathId).length;
export const TOTAL_NODES = NODES.length;
