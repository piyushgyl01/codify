/**
 * Robotics — everything that changes the save.
 *
 *   Drill and boss answers   graded in code against numbers the generator computed
 *   Builds                   verified against your public GitHub folder
 *
 * Reading a resource or choosing a direction is recorded, and pays nothing.
 * Sessions live in S.active so a phone that kills the tab mid-question comes
 * back to the same question — and nobody can reroll a drill by reloading.
 */
import { S, emit, award, grantLoot, getDay, today, touchStreak, save } from '../../state.js';
import { rollLoot } from '../../data/loot.js';
import { review, isDue, pickDrill, drillCombo, bossCombo } from '../../game.js';
import { generate, grade } from '../../quiz.js';
import { skillById, skillsIn } from './skills.js';
import { buildById, buildXp, buildCoins } from './roadmap.js';
import { bossFor, bossXp, bossCoins, bossMinRarity, BOSS_HP, BOSS_HEARTS, BOSS_QUESTIONS } from './bosses.js';
import * as M from './model.js';

export const XP = {
  drillRight: 10, reviewBonus: 5, drillDone: 20, drillPerfect: 30,
  practiceRight: 4, practiceCap: 120, bossHit: 100,
};

const r = () => S.tracks.robotics;

/* -------------------------------- selectors ------------------------------- */

export const plan = (key = today()) => M.plan(r(), key);
export const isUnlocked = n => M.isUnlocked(r(), n, today());
export const currentMonth = () => M.currentMonth(r(), today());
export const skillBox = id => M.skillBox(r(), id);
export const skillEntry = id => r().skills[id] || null;
export const unlockedSkillIds = () => M.unlockedSkillIds(r(), today());
export const dueSkills = () => M.dueSkills(r(), today());
export const isVerified = id => M.isVerified(r(), id);
export const verifiedCount = () => M.verifiedCount(r());
export const claimedTargets = id => M.claimedTargets(r(), id);
export const milestoneDone = ms => M.milestoneDone(r(), ms);
export const monthProgress = n => M.monthProgress(r(), n);
export const bossReady = n => M.bossReady(r(), n, today());

/** Today's robotics numbers, created on first use. */
export function roboDay(key = today()) {
  const day = getDay(key);
  day.robotics = M.roboDayOf(day);
  return day.robotics;
}
export const drillDoneToday = (key = today()) => !!getDay(key).robotics?.drill;

/* --------------------------------- sessions ------------------------------- */

export const hasActive = () => !!S.active;

export function startDrill(key = today(), rng = Math.random) {
  if (S.active) return S.active;
  if (drillDoneToday(key)) return null;
  const ids = pickDrill(unlockedSkillIds(), r().skills, key, rng);
  S.active = {
    mode:'drill', day:key, i:0, run:0, best:0, xp:0,
    qs: ids.map(id => ({ ...generate(id, rng), wasDue: isDue(r().skills[id], key) })),
    results: [],
  };
  emit('session');
  return S.active;
}

export function startPractice(skillId, key = today(), rng = Math.random) {
  if (S.active) return S.active;
  const skill = skillById(skillId);
  if (!skill || !isUnlocked(skill.month)) return null;
  S.active = {
    mode:'practice', day:key, skill: skillId, i:0, run:0, best:0, xp:0,
    qs: Array.from({ length: 5 }, () => generate(skillId, rng)), results: [],
  };
  emit('session');
  return S.active;
}

export function startBoss(month, key = today(), rng = Math.random) {
  if (S.active) return S.active;
  if (!M.bossReady(r(), month, key).ok) return null;
  const pool = skillsIn(month).map(s => s.id);
  S.active = {
    mode:'boss', day:key, month, hp: BOSS_HP, hearts: BOSS_HEARTS, asked: 0,
    run:0, best:0, dealt:0, pool, taunt:'intro',
    q: generate(pool[Math.floor(rng() * pool.length)], rng), qStartedAt: Date.now(), results: [],
  };
  emit('session');
  return S.active;
}

export const currentQuestion = () =>
  !S.active ? null : S.active.mode === 'boss' ? S.active.q : S.active.qs[S.active.i];

/** Answer the current question. `input` is an option index or typed text; null means time ran out. */
export function answer(input, rng = Math.random) {
  const a = S.active;
  if (!a) return null;
  const q = currentQuestion();
  const res = input === null
    ? { correct:false, expected: grade(q, '').expected, given:'—', note:'Out of time.' }
    : grade(q, input);

  const day = roboDay(a.day);
  day.answered += 1; S.stats.answered += 1;
  a.run = res.correct ? a.run + 1 : 0;
  a.best = Math.max(a.best, a.run);
  day.bestRun = Math.max(day.bestRun, a.run);
  if (res.correct) { day.correct += 1; S.stats.correct += 1; }

  let xp = 0, dmg = 0;
  if (a.mode === 'drill') {
    r().skills[q.skill] = review(r().skills[q.skill], res.correct, a.day);
    if (res.correct) {
      xp = Math.round(XP.drillRight * drillCombo(a.run)) + (q.wasDue ? XP.reviewBonus : 0);
      if (q.wasDue) day.reviewCorrect += 1;
    }
  } else if (a.mode === 'practice') {
    // Practice never moves a skill between boxes — only a scheduled review can —
    // but a first right answer introduces a skill you had not met.
    if (res.correct && !skillBox(q.skill)) r().skills[q.skill] = review(r().skills[q.skill], true, a.day);
    if (res.correct) {
      day.practiceCorrect += 1;
      xp = Math.max(0, Math.min(XP.practiceRight, XP.practiceCap - day.practiceXp));
      day.practiceXp += xp;
    }
  } else {
    a.asked += 1;
    if (res.correct) { dmg = Math.round(XP.bossHit * bossCombo(a.run)); a.hp = Math.max(0, a.hp - dmg); a.dealt += dmg; }
    else a.hearts -= 1;
    a.taunt = a.hp <= BOSS_HP / 2 && a.taunt === 'intro' ? 'half' : a.taunt === 'half' ? 'shown' : a.taunt;
  }
  a.xp += xp;
  a.results.push({ skill: q.skill, ...res, xp, dmg });

  if (a.mode === 'boss') {
    if (!sessionOver()) {
      const others = a.pool.filter(id => id !== a.q.skill);
      const pool = others.length ? others : a.pool;
      a.q = generate(pool[Math.floor(rng() * pool.length)], rng);
      a.qStartedAt = Date.now();
    }
  } else a.i += 1;
  save();
  return { ...res, xp, dmg };
}

export function sessionOver() {
  const a = S.active;
  if (!a) return true;
  if (a.mode === 'boss') return a.hp <= 0 || a.hearts <= 0 || a.asked >= BOSS_QUESTIONS;
  return a.i >= a.qs.length;
}

/** Close out the active session and pay for it. Returns a summary for the results screen. */
export function finishSession(rng = Math.random) {
  const a = S.active;
  if (!a) return null;
  const day = roboDay(a.day);
  const right = a.results.filter(x => x.correct).length;
  let reward, drop = null, extra = {};

  if (a.mode === 'drill') {
    const total = a.qs.length, perfect = right === total && a.results.length === total;
    day.drill = { score: right, total, at: Date.now() };
    S.stats.drills += 1;
    if (perfect) S.stats.perfectDrills += 1;
    if (perfect) drop = grantLoot(rollLoot({ chance: 0.1, set: 'bench', rng }));
    reward = award(a.xp + XP.drillDone + (perfect ? XP.drillPerfect : 0), right * 3 + (perfect ? 10 : 0), perfect ? 'Clean sheet' : 'Daily drill');
    touchStreak(a.day);
    extra = { score: right, total, perfect };
  } else if (a.mode === 'practice') {
    reward = award(a.xp, 0, 'Practice');
    extra = { score: right, total: a.qs.length, capped: day.practiceXp >= XP.practiceCap };
  } else {
    const won = a.hp <= 0;
    const prev = r().bosses[a.month] || {};
    r().bosses[a.month] = {
      won: !!prev.won || won, wonAt: won ? a.day : prev.wonAt || null,
      attempts: (prev.attempts || 0) + 1, lastTry: a.day,
      bestDealt: Math.max(prev.bestDealt || 0, a.dealt),
    };
    S.stats.bossFights += 1;
    if (won) {
      drop = grantLoot(rollLoot({ minRarity: bossMinRarity(a.month), set: 'bench', rng }));
      reward = award(bossXp(a.month), bossCoins(a.month), bossFor(a.month).name);
    } else {
      reward = award(Math.round(bossXp(a.month) * 0.25 * (a.dealt / BOSS_HP)), 0, 'Partial credit');
    }
    extra = { won, month: a.month, dealt: a.dealt, hearts: a.hearts, asked: a.asked };
  }

  const summary = { mode: a.mode, results: a.results, best: a.best, reward, drop, ...extra };
  S.active = null;
  emit(a.mode === 'boss' ? 'boss' : 'drill', summary);
  return summary;
}

/** A drill or practice set waits to be resumed; leaving a boss fight forfeits it. */
export function abandonSession() {
  const a = S.active;
  if (!a) return null;
  if (a.mode === 'boss') { a.hearts = 0; return finishSession(); }
  return null;
}

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
