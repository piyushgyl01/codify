/**
 * Robotics — everything that changes the save.
 *
 *   Mission and boss answers   graded in code, by the shared engine
 *   Builds                     verified against your public GitHub folder
 *
 * The daily mission's check completes the mission here: a build step can wait
 * on parts in the post, so it is tracked, not required. Reading a resource or
 * choosing a direction is recorded, and pays nothing.
 */
import { S, emit, award, grantLoot, today } from '../../state.js';
import { rollLoot } from '../../data/loot.js';
import * as E from '../../learn/session.js';
import { SKILLS, skillById, skillsIn } from './skills.js';
import { buildById, buildXp, buildCoins, MONTHS } from './roadmap.js';
import { MISSIONS, checkBudget } from './plan.js';
import { bossFor, bossXp, bossCoins, bossMinRarity, BOSS_HP, BOSS_HEARTS, BOSS_QUESTIONS, BOSS_SECS } from './bosses.js';
import { generate } from '../../quiz.js';
import * as M from './model.js';

export const XP = E.XP;
const T = 'robotics';
const r = () => S.tracks.robotics;

/* -------------------------------- selectors ------------------------------- */

export const plan = (key = today()) => M.plan(r(), key);
export const isUnlocked = n => M.isUnlocked(r(), n, today());
export const currentMonth = () => M.currentMonth(r(), today());
export const skillLevel = id => M.skillLevel(r(), id);
export const skillScore = () => M.skillScore(r());
export const skillEntry = id => r().skills[id] || null;
export const unlockedSkillIds = () => M.unlockedSkillIds(r(), today());
export const isVerified = id => M.isVerified(r(), id);
export const verifiedCount = () => M.verifiedCount(r());
export const claimedTargets = id => M.claimedTargets(r(), id);
export const milestoneDone = ms => M.milestoneDone(r(), ms);
export const monthProgress = n => M.monthProgress(r(), n);
export const bossReady = n => M.bossReady(r(), n, today());

export const mission = (key = today()) => E.mission(T, key);
export const missionsDone = () => E.missionsDone(T);
export const missionDoneToday = (key = today()) => E.missionDoneToday(T, key);
export const missionSkills = (m, key = today()) => E.missionSkills(T, m, key);
export const testOut = week => E.testOut(T, week);
export const roboDay = (key = today()) => E.counters(T, key);

/* --------------------------------- sessions ------------------------------- */

export const hasActive = () => !!S.active;
export const startMission = (key = today(), rng = Math.random) => E.startMission(T, key, rng);
export const startTestOut = (week, key = today(), rng = Math.random) => E.startTestOut(T, week, key, rng);
export const startPractice = (skillId, key = today(), rng = Math.random) => E.startPractice(T, skillId, key, rng);
export const { currentQuestion, answer, sessionOver, finishSession, abandonSession, markShown, timeLimit } = E;

export function startBoss(month, key = today(), rng = Math.random) {
  if (S.active) return S.active;
  if (!M.bossReady(r(), month, key).ok) return null;
  const pool = skillsIn(month).map(s => s.id);
  S.active = {
    mode:'boss', track: T, day:key, month, hp: BOSS_HP, maxHp: BOSS_HP, hearts: BOSS_HEARTS, asked: 0,
    questions: BOSS_QUESTIONS, secs: BOSS_SECS, run:0, best:0, dealt:0, pool, taunt:'intro', shown: -1,
    q: generate(pool[Math.floor(rng() * pool.length)], rng), qStartedAt: Date.now(), results: [],
  };
  emit('session');
  return S.active;
}

function finishBoss(a, rng) {
  const won = a.hp <= 0;
  const prev = r().bosses[a.month] || {};
  r().bosses[a.month] = {
    won: !!prev.won || won, wonAt: won ? a.day : prev.wonAt || null,
    attempts: (prev.attempts || 0) + 1, lastTry: a.day,
    bestDealt: Math.max(prev.bestDealt || 0, a.dealt),
  };
  S.stats.bossFights += 1;
  let reward, drop = null;
  if (won) {
    drop = grantLoot(rollLoot({ minRarity: bossMinRarity(a.month), set: 'bench', rng }));
    reward = award(bossXp(a.month), bossCoins(a.month), bossFor(a.month).name);
  } else {
    reward = award(Math.round(bossXp(a.month) * 0.25 * (a.dealt / BOSS_HP)), 0, 'Partial credit');
  }
  const extra = { won, month: a.month, dealt: a.dealt, hearts: a.hearts, asked: a.asked };
  if (a.mission) {
    E.completeMission(T, a.mission, a.day, { boss: true, won, score: a.results.filter(x => x.correct).length, total: a.asked });
    extra.n = a.mission;
  }
  return { reward, drop, extra };
}

E.registerTrack({
  id: T, slice: r, plan: MISSIONS, months: MONTHS, skills: SKILLS, skillById, lootSet: 'bench',
  unlockedSkillIds: key => M.unlockedSkillIds(r(), key),
  budget: checkBudget,
  // The check is the mission: builds wait on parts, so they are tracked, not required.
  onCheck: (n, key, info) => E.completeMission(T, n, key, info),
  // On the boss day the fight is the mission, when the boss is ready for it.
  startBoss: (m, key, rng) => {
    if (!M.bossReady(r(), m.month, key).ok) return false;
    startBoss(m.month, key, rng);
    S.active.mission = m.n;
    return true;
  },
  finishBoss,
});

/* --------------------------------- builds --------------------------------- */

/**
 * Store a verification result. The first pass pays once; a later failing
 * re-check does not take anything back, but its results are shown.
 */
export function applyVerification(buildId, target, result, rng = Math.random) {
  const build = buildById(buildId);
  if (!build || !result?.ok) return null;
  const prev = r().builds[buildId] || {};
  const newly = result.verified && !prev.verified;
  r().builds[buildId] = {
    target: result.verified || !prev.verified ? target : prev.target,
    checks: result.checks, checkedAt: Date.now(),
    verified: !!prev.verified || result.verified,
    verifiedAt: prev.verifiedAt || (result.verified ? today() : null),
    meta: result.verified ? result.meta : (prev.meta || result.meta),
    lastPassed: result.verified,
  };
  let reward = null, drop = null;
  if (newly) {
    drop = grantLoot(rollLoot({ chance: 0.6, set: 'bench', rng }));
    reward = award(buildXp(build), buildCoins(build), build.name);
  }
  emit('build', { buildId, newly, reward, drop });
  return { newly, reward, drop };
}

/* ---------------------------------- misc ---------------------------------- */

export function toggleRead(url) {
  if (r().read[url]) delete r().read[url]; else r().read[url] = today();
  emit('read');
}
export function setDirection(id) { r().direction = id; emit('profile'); }
export function setStart(key) { r().start = key; emit('profile'); }

export { skillById };
