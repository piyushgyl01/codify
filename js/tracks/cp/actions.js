/**
 * Competitive programming — everything that changes the save.
 *
 * The accounting is pure with respect to the network: the caller fetches, this
 * folds the result in and pays for what is new. Every solve and every tier is
 * credited once, by key, so re-syncing is idempotent and cannot double-pay.
 */
import { S, emit, award, grantLoot, today, touchStreak } from '../../state.js';
import { rollLoot } from '../../data/loot.js';
import * as E from '../../learn/session.js';
import * as M from './model.js';
import { tierXp, tierCoins, topicById, topicProgress } from './topics.js';
import { contestById, settle, contestReward } from './contests.js';
import { SKILLS, skillById } from './skills.js';
import { MISSIONS, MONTHS, checkBudget } from './plan.js';

const cp = () => S.tracks.cp;

/* -------------------------------- selectors ------------------------------- */

export const isLinked = () => !!cp().handle;
export const solvedList = () => cp().solved || [];
export const solvesOn = (key = today()) => M.solvesOn(cp(), key);
export const dayTotals = (key = today()) => M.dayTotals(cp(), key);
export const treeProgress = () => M.treeProgress(cp());
export const treeCompletion = () => M.treeCompletion(cp());
export const staleness = id => M.staleness(cp(), id, today());
export function topicStatus(id) {
  const t = topicById(id);
  return t ? topicProgress(t, solvedList()) : null;
}

/* -------------------------------- missions -------------------------------- */

/*
 * A programming mission is done when both halves are: the check, graded here,
 * and the solves, accepted by Codeforces on the same day at your level for the
 * day's tag. Clearing it moves that level up 100, so tomorrow's problems in that
 * tag are harder than today's.
 */
const T = 'cp';
export const plan = (key = today()) => M.plan(cp(), key);
export const isUnlocked = n => plan().unlocked.includes(n);
export const currentMonth = () => Math.max(...plan().unlocked);
export const mission = (key = today()) => E.mission(T, key);
export const missionsDone = () => E.missionsDone(T);
export const missionDoneToday = (key = today()) => E.missionDoneToday(T, key);
export const missionSkills = (m, key = today()) => E.missionSkills(T, m, key);
export const skillLevel = id => M.skillLevel(cp(), id);
export const skillEntry = id => cp().skills?.[id] || null;
export const skillScore = () => M.skillScore(cp());
export const unlockedSkillIds = () => M.unlockedSkillIds(cp(), today());
export const testOut = week => E.testOut(T, week);
export const codeDay = (key = today()) => E.counters(T, key);
export const targetFor = (tag, key = today()) => M.targetFor(cp(), tag, key);
export const solveStatus = (m = mission(), key = today()) => M.solveStatus(cp(), m, key);
export const contestFor = m => contestById(MONTHS[m.month - 1].contest);

export const startMission = (key = today(), rng = Math.random) => E.startMission(T, key, rng);
export const startTestOut = (week, key = today(), rng = Math.random) => E.startTestOut(T, week, key, rng);
export const startPractice = (skillId, key = today(), rng = Math.random) => E.startPractice(T, skillId, key, rng);

/** Keep the day's starting level fixed once you start, so a sync mid-day cannot move the goalposts. */
function fixTarget(tag, key = today()) {
  const k = M.targetKey(tag);
  if (cp().targets?.[k] == null) cp().targets = { ...(cp().targets || {}), [k]: M.startingTarget(cp(), tag, key) };
}

/** Finish today's mission if both halves are done. Called after a check and after a sync. */
export function settleMission(key = today()) {
  const m = mission(key);
  if (m.done || m.boss || !m.check) return false;
  fixTarget(m.tag, key);
  const st = M.solveStatus(cp(), m, key);
  if (!st.met) return false;
  const k = M.targetKey(m.tag);
  cp().targets = { ...cp().targets, [k]: M.nextTarget(st.target) };
  return E.completeMission(T, m.n, key, { ...m.check, solved: st.counted.length, target: st.target });
}

/** Too hard today? Drop this tag's level by 100. It only ever makes the mission easier, so there is nothing to check. */
export function lowerTarget(tag) {
  const k = M.targetKey(tag), now = M.targetFor(cp(), tag, today());
  cp().targets = { ...(cp().targets || {}), [k]: M.lowerTarget(now) };
  emit('profile');
  settleMission();
}

E.registerTrack({
  id: T, slice: cp, plan: MISSIONS, months: MONTHS, skills: SKILLS, skillById, lootSet: 'desk',
  unlockedSkillIds: key => M.unlockedSkillIds(cp(), key),
  budget: checkBudget,
  onCheck: (n, key) => { fixTarget(MISSIONS[n - 1].tag, key); return settleMission(key); },
  bossIsNotACheck: true,   // a programming month ends with a contest, settled by the judge
});

/* ---------------------------------- sync ---------------------------------- */

/** Fold a fetched solve list into the save and pay for what is new. */
export function applySolves(solved) {
  const clearedBefore = new Set();
  M.treeProgress(cp()).forEach(p => p.tiers.forEach(t => { if (t.cleared) clearedBefore.add(`${p.topic.id}:${t.n}`); }));

  cp().solved = solved;
  cp().syncedAt = Date.now();

  let xp = 0, coins = 0;
  const fresh = [];
  for (const s of solved) {
    if (cp().credited.problems[s.key]) continue;
    cp().credited.problems[s.key] = s.day;
    fresh.push(s);
    xp += M.solveXp(s.rating); coins += M.solveCoins(s.rating);
    S.stats.solved += 1;
    if (s.rating != null) { S.stats.ratedSolved += 1; S.stats.bestRating = Math.max(S.stats.bestRating, s.rating); }
  }

  const newTiers = [];
  for (const p of M.treeProgress(cp())) {
    for (const t of p.tiers) {
      const id = `${p.topic.id}:${t.n}`;
      if (!t.cleared || clearedBefore.has(id) || cp().credited.tiers[id]) continue;
      cp().credited.tiers[id] = today();
      newTiers.push({ topic: p.topic, tier: t });
      xp += tierXp(t); coins += tierCoins(t);
      S.stats.tiersCleared += 1;
    }
  }

  // One roll per sync that found something, from the desk set.
  const drop = fresh.length ? grantLoot(rollLoot({ chance: Math.min(0.7, 0.18 * fresh.length), set: 'desk' })) : null;
  const reward = (xp || coins) ? award(xp, coins, 'Codeforces') : null;
  touchStreak();
  const settled = settleMission();
  emit('sync', { source:'cf', fresh, newTiers, reward, drop, settled });
  return { fresh, newTiers, reward, drop, settled };
}

export function linkCodeforces({ handle, rating = null, rank = null, avatar = null }) {
  Object.assign(cp(), { handle, rating, rank, avatar, error:'' });
  emit('profile');
}
export function unlinkCodeforces() {
  Object.assign(cp(), { handle:'', rating:null, rank:null, avatar:null, solved:[], syncedAt:0, error:'' });
  emit('profile');
}
export function setDailySolves(n) { cp().dailySolves = Math.max(1, Math.min(6, Math.round(n))); emit('profile'); }

/* -------------------------------- contests -------------------------------- */

/**
 * Start the clock. Everything already solved is recorded now, so a problem you
 * finished last week cannot count towards the run.
 */
export function startContest(id) {
  const contest = contestById(id);
  if (!contest || cp().contest) return null;
  cp().contest = { id, startedAt: Date.now(), known: solvedList().map(s => s.key) };
  S.stats.contestsRun += 1;
  emit('contest', { started: contest });
  return cp().contest;
}

export function activeContest() {
  const a = cp().contest;
  if (!a) return null;
  const contest = contestById(a.id);
  if (!contest) return null;
  return { contest, startedAt: a.startedAt, ...settle(contest, a.startedAt, solvedList(), new Set(a.known)) };
}

export function finishContest() {
  const live = activeContest();
  if (!live) return null;
  const { contest } = live;
  const prev = cp().contests[contest.id] || { won:false, attempts:0, best:0 };
  cp().contests[contest.id] = {
    won: prev.won || live.won, attempts: prev.attempts + 1,
    best: Math.max(prev.best, live.solved), date: live.won ? today() : prev.date,
  };
  if (live.won && !prev.won) S.stats.contestsWon += 1;
  const { xp, coins } = contestReward(contest, live);
  const drop = live.won ? grantLoot(rollLoot({ minRarity: 'rare', set: 'desk' })) : null;
  const reward = (xp || coins) ? award(xp, coins, contest.name) : null;
  cp().contest = null;
  touchStreak();
  // On a contest day, the month's contest is the mission — won or lost.
  const m = mission();
  if (m.boss && !m.done && contestFor(m).id === contest.id) E.completeMission(T, m.n, today(), { boss: true, won: live.won, score: live.solved, total: contest.need });
  emit('contest', { finished: contest, result: live, reward, drop });
  return { contest, result: live, reward, drop };
}

export function abandonContest() {
  if (!cp().contest) return false;
  cp().contest = null;
  emit('contest', {});
  return true;
}
