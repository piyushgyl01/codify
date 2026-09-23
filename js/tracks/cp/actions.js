/**
 * Competitive programming — everything that changes the save.
 *
 * The accounting is pure with respect to the network: the caller fetches, this
 * folds the result in and pays for what is new. Every solve and every tier is
 * credited once, by key, so re-syncing is idempotent and cannot double-pay.
 */
import { S, emit, award, grantLoot, today, touchStreak } from '../../state.js';
import { rollLoot } from '../../data/loot.js';
import * as M from './model.js';
import { tierXp, tierCoins, topicById, topicProgress } from './topics.js';
import { contestById, settle, contestReward } from './contests.js';

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
  emit('sync', { source:'cf', fresh, newTiers, reward, drop });
  return { fresh, newTiers, reward, drop };
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
  emit('contest', { finished: contest, result: live, reward, drop });
  return { contest, result: live, reward, drop };
}

export function abandonContest() {
  if (!cp().contest) return false;
  cp().contest = null;
  emit('contest', {});
  return true;
}
