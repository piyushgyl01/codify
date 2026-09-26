/**
 * AI — everything that changes the save.
 *
 *   Mission and boss answers   graded in code, by the shared engine
 *   Builds                     verified on GitHub or on Hugging Face
 *   Frontier days              an entry in your frontier log, checked on GitHub
 *
 * The check completes a mission, as in Robots: a build can take days of
 * training, so it is tracked, not required on the day. Picking a frontier item
 * or reading a link is recorded and pays nothing; the log entry pays.
 */
import { S, emit, award, grantLoot, today } from '../../state.js';
import { rollLoot } from '../../data/loot.js';
import * as E from '../../learn/session.js';
import { SKILLS, skillById, skillsIn } from './skills.js';
import { MISSIONS, MONTHS, PACES, checkBudget, buildById, buildXp, buildCoins, bossFor } from './plan.js';
import { BOSS_HP, BOSS_HEARTS, BOSS_QUESTIONS, BOSS_SECS, bossXp, bossCoins } from '../robotics/bosses.js';
import { generate } from '../../quiz.js';
import { parseRepo, verifyBuild, verifyPortfolio, verifyFrontierEntry } from '../../github.js';
import { parseHf, verifyHf } from '../../hf.js';
import { addDays } from '../../game.js';
import * as M from './model.js';

const T = 'ai';
const r = () => S.tracks.ai;

export const XP_FRONTIER = { xp: 60, coins: 20 };

/* -------------------------------- selectors ------------------------------- */

export const plan = (key = today()) => M.plan(r(), key);
export const isUnlocked = n => M.isUnlocked(r(), n, today());
export const currentPart = () => M.currentPart(r(), today());
export const skillLevel = id => M.skillLevel(r(), id);
export const skillScore = () => M.skillScore(r());
export const skillEntry = id => r().skills?.[id] || null;
export const isVerified = id => M.isVerified(r(), id);
export const partProgress = n => M.partProgress(r(), n);
export const bossReady = n => M.bossReady(r(), n, today());
export const mission = (key = today()) => E.mission(T, key);
export const missionsDone = () => E.missionsDone(T);
export const missionDoneToday = (key = today()) => E.missionDoneToday(T, key);
export const aiDay = (key = today()) => E.counters(T, key);

/* --------------------------------- sessions ------------------------------- */

export const startMission = (key = today(), rng = Math.random) => E.startMission(T, key, rng);
export const startTestOut = (week, key = today(), rng = Math.random) => E.startTestOut(T, week, key, rng);
export const startPractice = (skillId, key = today(), rng = Math.random) => E.startPractice(T, skillId, key, rng);

export function startBoss(part, key = today(), rng = Math.random) {
  if (S.active) return S.active;
  if (!M.bossReady(r(), part, key).ok) return null;
  const pool = skillsIn(part).map(s => s.id);
  S.active = {
    mode:'boss', track: T, day:key, month: part, boss: bossFor(part), hp: BOSS_HP, maxHp: BOSS_HP, hearts: BOSS_HEARTS, maxHearts: BOSS_HEARTS,
    asked: 0, questions: BOSS_QUESTIONS, secs: BOSS_SECS, run:0, best:0, dealt:0, pool, taunt:'intro', shown: -1,
    q: generate(pool[Math.floor(rng() * pool.length)], rng), qStartedAt: Date.now(), results: [],
  };
  emit('session');
  return S.active;
}

function finishBoss(a, rng) {
  const won = a.hp <= 0, prev = r().bosses?.[a.month] || {};
  r().bosses = { ...(r().bosses || {}), [a.month]: {
    won: !!prev.won || won, wonAt: won ? a.day : prev.wonAt || null,
    attempts: (prev.attempts || 0) + 1, lastTry: a.day, bestDealt: Math.max(prev.bestDealt || 0, a.dealt),
  } };
  S.stats.bossFights += 1;
  let reward, drop = null;
  if (won) {
    drop = grantLoot(rollLoot({ minRarity: a.month <= 4 ? 'rare' : 'epic', set: 'desk', rng }));
    reward = award(bossXp(Math.ceil(a.month / 2)), bossCoins(Math.ceil(a.month / 2)), a.boss.name);
  } else reward = award(Math.round(bossXp(Math.ceil(a.month / 2)) * 0.25 * (a.dealt / BOSS_HP)), 0, 'Partial credit');
  const extra = { won, month: a.month, boss: a.boss, dealt: a.dealt, hearts: a.hearts, asked: a.asked };
  if (a.mission) {
    E.completeMission(T, a.mission, a.day, { boss: true, won, score: a.results.filter(x => x.correct).length, total: a.asked });
    extra.n = a.mission;
  }
  return { reward, drop, extra };
}

E.registerTrack({
  id: T, slice: r, plan: MISSIONS, months: MONTHS, skills: SKILLS, skillById, lootSet: 'desk', paces: PACES,
  unlockedSkillIds: key => M.unlockedSkillIds(r(), key),
  budget: checkBudget,
  onCheck: (n, key, info) => E.completeMission(T, n, key, info),
  startBoss: (m, key, rng) => {
    if (!M.bossReady(r(), m.month, key).ok) return false;
    startBoss(m.month, key, rng);
    S.active.mission = m.n;
    return true;
  },
  finishBoss,
  bossReady: n => M.bossReady(r(), n, today()),
  fight: n => startBoss(n),
});

/* --------------------------------- builds --------------------------------- */

export function linkHf({ user, avatar = null }) { r().hf = { user, avatar }; emit('profile'); }
export function unlinkHf() { r().hf = null; emit('profile'); }
export const hfUser = () => r().hf?.user || '';

/** Where a build is checked, parsed from what was typed. Null if it cannot be read. */
export function parseTarget(build, input) {
  if (build.verify === 'hf') return parseHf(input, build.proof.hf?.kind || 'model');
  if (build.verify === 'github') return parseRepo(input);
  return {};
}

/** Run a build's check: GitHub, Hugging Face, or across your other builds. */
export async function checkBuild(build, target, fetchImpl) {
  if (build.verify === 'portfolio') return verifyPortfolio(build, r().builds || {});
  if (build.verify === 'hf') return verifyHf(build, target, { user: hfUser(), fetchImpl });
  return verifyBuild(build, target, { user: S.github.user, usedBy: M.claimedTargets(r(), build.id), fetchImpl });
}

/** Store a verification result. The first pass pays once; a later failing re-check takes nothing back. */
export function applyVerification(buildId, target, result, rng = Math.random) {
  const build = buildById(buildId);
  if (!build || !result?.ok) return null;
  const prev = r().builds?.[buildId] || {};
  const newly = result.verified && !prev.verified;
  r().builds = { ...(r().builds || {}), [buildId]: {
    target: result.verified || !prev.verified ? target : prev.target,
    checks: result.checks, checkedAt: Date.now(),
    verified: !!prev.verified || result.verified,
    verifiedAt: prev.verifiedAt || (result.verified ? today() : null),
    meta: result.verified ? result.meta : (prev.meta || result.meta),
    lastPassed: result.verified,
  } };
  let reward = null, drop = null;
  if (newly) {
    drop = grantLoot(rollLoot({ chance: build.capstone ? 1 : 0.5, set: 'desk', rng }));
    reward = award(buildXp(build), buildCoins(build), build.name);
  }
  emit('build', { buildId, newly, reward, drop });
  return { newly, reward, drop };
}

/* -------------------------------- frontier -------------------------------- */

export const frontierFor = n => r().frontier?.[n] || null;
export const frontierRepo = () => r().frontierRepo || null;

/** Choose what to try on frontier mission n. Changing your mind is fine until it is verified. */
export function pickFrontier(n, item, key = today()) {
  if (frontierFor(n)?.verified) return false;
  r().frontier = { ...(r().frontier || {}), [n]: { item, picked: key } };
  emit('profile');
  return true;
}

export function setFrontierRepo(input) {
  const t = parseRepo(input);
  if (!t) return null;
  r().frontierRepo = { owner: t.owner, repo: t.repo };
  emit('profile');
  return r().frontierRepo;
}

/** Check the log: a commit by you since the pick (within a week of it), mentioning what you picked. */
export async function verifyFrontier(n, fetchImpl, key = today()) {
  const f = frontierFor(n), repo = frontierRepo();
  if (!f || !repo) return { ok: false, error: !f ? 'Pick something first.' : 'Set your frontier-log repo first.' };
  if (f.verified) return { ok: true, verified: true, already: true, checks: [] };
  const since = new Date(`${addDays(f.picked, -1)}T00:00:00`).toISOString();
  const needles = [f.item.url, f.item.id].filter(Boolean);
  const res = await verifyFrontierEntry(repo, { user: S.github.user, needles, since, fetchImpl });
  if (res.ok && res.verified) {
    r().frontier = { ...r().frontier, [n]: { ...f, verified: key } };
    res.reward = award(XP_FRONTIER.xp, XP_FRONTIER.coins, 'Frontier log');
    emit('build', { frontier: n });
  }
  return res;
}
