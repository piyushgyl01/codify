/**
 * Pure maths. No DOM, no storage, no network — every function here is a function
 * of its arguments, which is why the test suite can cover all of it.
 *
 * The forgetting model that used to live here is gone. It invented its own
 * constants and was then "validated" against tests the user graded themselves,
 * which is two guesses agreeing with each other. What replaced it is in
 * state.js: the date of your last real solve in a topic, straight from the judge.
 */
import { ACHIEVEMENTS } from './data/achievements.js';
import { questsForDay } from './data/quests.js';

/* ------------------------------- levelling -------------------------------- */

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

/** Named after the Codeforces ladder, since that is the ladder being climbed. */
export const RANKS = [
  { at:1,  name:'Newcomer',         icon:'🥚', color:'#57514A' },
  { at:5,  name:'Pupil',            icon:'🌱', color:'#5EA82E' },
  { at:10, name:'Specialist',       icon:'⚔️', color:'#1E9AA8' },
  { at:15, name:'Expert',           icon:'🛡️', color:'#2B5BD7' },
  { at:22, name:'Candidate Master', icon:'🏆', color:'#8A3FD1' },
  { at:30, name:'Master',           icon:'🔮', color:'#C77A0F' },
  { at:40, name:'Grandmaster',      icon:'🌟', color:'#D6265A' },
  { at:52, name:'Legendary',        icon:'🐉', color:'#D64524' },
];
export const rankFor = level => [...RANKS].reverse().find(r => level >= r.at) || RANKS[0];
export const nextRank = level => RANKS.find(r => r.at > level) || null;

/* -------------------------------- targets --------------------------------- */

/**
 * What a day should look like. Kept deliberately small: two numbers you can
 * actually hit, both of them things the app can verify.
 */
export const GOALS = [
  { id:'casual',  name:'Ticking over', icon:'◇', solves:1, minutes:30,
    desc:'Stay in the habit without it taking the evening.' },
  { id:'levelup', name:'Levelling up', icon:'◈', solves:2, minutes:60,
    desc:'Steady progress alongside a job.' },
  { id:'grind',   name:'Contest prep', icon:'◆', solves:3, minutes:90,
    desc:'Rating is the goal and you have the evenings.' },
  { id:'sprint',  name:'Interview sprint', icon:'▲', solves:4, minutes:120,
    desc:'Short and hard. Not sustainable, and not meant to be.' },
];
export const goalFor = id => GOALS.find(g => g.id === id) || GOALS[1];

export function targetsFor(profile) {
  const goal = goalFor(profile.goal);
  return { solves: goal.solves, minutes: goal.minutes, weeklySolves: goal.solves * 6, goal };
}

/* --------------------------------- quests --------------------------------- */

/**
 * Quest metrics read the day's totals, which the caller supplies. Passing the
 * numbers in rather than importing state keeps this module free of a cycle —
 * state imports game, never the other way round.
 */
export function metricValue(metric, totals = {}) {
  switch (metric) {
    case 'solved':          return totals.solved || 0;
    case 'ratedSolved':     return totals.ratedSolved || 0;
    case 'bestRating':      return totals.bestRating || 0;
    case 'tags':            return totals.tags || 0;
    case 'commits':         return totals.commits || 0;
    case 'pushes':          return totals.pushes || 0;
    case 'verifiedMinutes': return totals.verifiedMinutes || 0;
    case 'sessions':        return totals.sessions || 0;
    default:                return 0;
  }
}

export function dailyQuests(dateKey, level, totals) {
  return questsForDay(dateKey, level).map(q => {
    const value = metricValue(q.metric, totals);
    return { ...q, value, done: value >= q.goal, pct: Math.min(100, (value / q.goal) * 100) };
  });
}

/* ------------------------------ achievements ------------------------------ */

export function newlyEarned(stats, earned) {
  return ACHIEVEMENTS.filter(a => !earned[a.id] && a.check(stats));
}

/* ---------------------------------- dates --------------------------------- */

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
