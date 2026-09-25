/**
 * Competitive programming — pure reads over the track's slice of the save.
 * No storage, no network: everything here is a function of its arguments.
 */
import { TOPICS, TIERS, topicById, topicProgress } from './topics.js';
import { SKILLS } from './skills.js';
import { MISSIONS, MONTHS } from './plan.js';
import { daysBetween, levelOf, MAX_LEVEL } from '../../game.js';
import * as P from '../../learn/plan.js';

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
    codeMissions: P.missionsDone(cp) + P.missionsSkipped(cp),
    codeScore: skillScore(cp),
  };
}

/* -------------------------------- missions -------------------------------- */

export function plan(cp, key) {
  const mission = P.nextMission(cp, MISSIONS.length);
  return { mission, done: P.missionsDone(cp), skipped: P.missionsSkipped(cp),
           unlocked: P.unlockedMonths(cp.start || key, key, {}, mission, MONTHS.length) };
}
export const skillLevel = (cp, id) => levelOf(cp.skills?.[id]);
export const skillScore = cp => SKILLS.reduce((n, s) => n + skillLevel(cp, s.id), 0);
export const MAX_SCORE = SKILLS.length * MAX_LEVEL;
export const unlockedSkillIds = (cp, key) => {
  const open = plan(cp, key).unlocked;
  return SKILLS.filter(s => open.includes(s.month)).map(s => s.id);
};

/* ---------------------------------- solve --------------------------------- */

export const MIN_TARGET = 800, MAX_TARGET = 3500;
const round100 = x => Math.round(x / 100) * 100;
const clampTarget = x => Math.max(MIN_TARGET, Math.min(MAX_TARGET, round100(x)));

/**
 * Where a tag's daily problems start, from what the judge already knew about
 * you before today: a hundred above your best solve with that tag, kept within
 * reach of your rating. Today's solves are left out, so solving before you open
 * the app cannot raise the bar they are measured against. A null tag means any tag.
 */
export function startingTarget(cp, tag, key = '9999-12-31') {
  const mine = (cp.solved || []).filter(s => s.rating != null && s.day < key && (!tag || (s.tags || []).includes(tag)));
  let t = mine.length ? Math.max(...mine.map(s => s.rating)) + 100 : MIN_TARGET;
  if (cp.rating != null) t = Math.max(cp.rating - 300, Math.min(t, cp.rating + 100));
  return clampTarget(t);
}
export const targetKey = tag => tag || '*';
export const targetFor = (cp, tag, key) => cp.targets?.[targetKey(tag)] ?? startingTarget(cp, tag, key);
export const nextTarget = t => clampTarget(t + 100);
export const lowerTarget = t => clampTarget(t - 100);

/** Today's solves that count for a mission: the day's tag, at or above the target. */
export function solveStatus(cp, m, key) {
  const target = targetFor(cp, m.tag, key);
  const counted = (cp.solved || []).filter(s => s.day === key && s.rating != null && s.rating >= target
    && (!m.tag || (s.tags || []).includes(m.tag)));
  return { target, need: m.count, counted, met: counted.length >= m.count };
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
