/**
 * Robotics — everything that changes the save.
 *
 *   Mission and boss answers   graded in code against numbers the generator computed
 *   Builds                     verified against your public GitHub folder
 *
 * Reading a resource or choosing a direction is recorded, and pays nothing.
 * Sessions live in S.active so a phone that kills the tab mid-question comes
 * back to the same question, with its clock still running — nobody can reroll
 * a mission or buy time by reloading.
 */
import { S, emit, award, grantLoot, getDay, today, touchStreak, save } from '../../state.js';
import { rollLoot } from '../../data/loot.js';
import { levelOf, roundFor, scoreRound, lastRound, pickReviews, bossCombo } from '../../game.js';
import { checkBudget } from './missions.js';
import { generate, grade } from '../../quiz.js';
import { skillById, skillsIn } from './skills.js';
import { buildById, buildXp, buildCoins, PLAN_DAYS } from './roadmap.js';
import { bossFor, bossXp, bossCoins, bossMinRarity, BOSS_HP, BOSS_HEARTS, BOSS_QUESTIONS, BOSS_SECS } from './bosses.js';
import * as M from './model.js';

export const XP = {
  right: 5,               // + half the skill's level, for each right answer in a mission
  levelUp: 15, missionDone: 30, missionClean: 20,
  practiceRight: 4, practiceCap: 120, bossHit: 100,
};

const r = () => S.tracks.robotics;

/* -------------------------------- selectors ------------------------------- */

export const plan = (key = today()) => M.plan(r(), key);
export const isUnlocked = n => M.isUnlocked(r(), n, today());
export const currentMonth = () => M.currentMonth(r(), today());
export const skillLevel = id => M.skillLevel(r(), id);
export const skillScore = () => M.skillScore(r());
export const mission = (key = today()) => M.todaysMission(r(), key);
export const missionsDone = () => M.missionsDone(r());
export const skillEntry = id => r().skills[id] || null;
export const unlockedSkillIds = () => M.unlockedSkillIds(r(), today());
export const dueSkills = () => M.dueSkills(r(), today());
export const isVerified = id => M.isVerified(r(), id);
export const verifiedCount = () => M.verifiedCount(r());
export const claimedTargets = id => M.claimedTargets(r(), id);
export const milestoneDone = ms => M.milestoneDone(r(), ms);
export const monthProgress = n => M.monthProgress(r(), n);
export const bossReady = n => M.bossReady(r(), n, today());

/** A day's robotics numbers, created on first use and filled in place — so every caller holds the same object. */
export function roboDay(key = today()) {
  const day = getDay(key);
  if (!day.robotics) day.robotics = M.emptyRoboDay();
  for (const [k, v] of Object.entries(M.emptyRoboDay())) if (!(k in day.robotics)) day.robotics[k] = v;
  return day.robotics;
}
export const missionDoneToday = (key = today()) => !!M.missionDoneOn(r(), key);

/* --------------------------------- sessions ------------------------------- */

export const hasActive = () => !!S.active;

/** The skills a mission checks, weakest link first: today's new ones, then what is due. */
export function missionSkills(m, key = today()) {
  const st = r().skills, pool = unlockedSkillIds();
  const budget = checkBudget(m.month);
  const cost = id => roundFor(levelOf(st[id])).n;
  let picked = m.boss ? [] : m.skills.filter(id => pool.includes(id));
  let used = picked.reduce((n, id) => n + cost(id), 0);
  for (const id of pickReviews(pool, st, key, budget - used, picked)) { picked.push(id); used += cost(id); }

  // Nothing due: sharpen the weakest skills you have started — on the boss day,
  // the weakest of the month.
  const started = (m.boss ? pool.filter(id => skillById(id).month === m.month) : pool)
    .filter(id => levelOf(st[id]) >= 1 && !picked.includes(id))
    .sort((a, b) => levelOf(st[a]) - levelOf(st[b]) || (st[a].last || '').localeCompare(st[b].last || ''));
  const want = m.boss ? budget : Math.min(budget, 6);
  for (const id of started) {
    if (picked.length >= 2 && used + cost(id) > want) break;
    picked.push(id); used += cost(id);
  }
  return picked;
}

export function startMission(key = today(), rng = Math.random) {
  if (S.active) return S.active;
  if (missionDoneToday(key) || M.missionsDone(r()) >= PLAN_DAYS) return null;
  const m = mission(key);
  if (m.boss && M.bossReady(r(), m.month, key).ok) {
    startBoss(m.month, key, rng);
    S.active.mission = m.n;
    return S.active;
  }
  const qs = [], groups = [];
  for (const id of missionSkills(m, key)) {
    const e = r().skills[id], level = Math.max(1, levelOf(e)), round = roundFor(level);
    groups.push({ skill: id, level, from: levelOf(e), n: round.n, start: qs.length, prev: lastRound(e), isNew: !levelOf(e) });
    for (let k = 0; k < round.n; k++) {
      const q = generate(id, rng);
      qs.push({ ...q, grp: groups.length - 1, secs: round.secs[q.kind] || round.secs.num });
    }
  }
  S.active = { mode:'mission', n: m.n, month: m.month, day:key, i:0, run:0, best:0, xp:0, qs, groups, results: [], shown: -1 };
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
    run:0, best:0, dealt:0, pool, taunt:'intro', shown: -1,
    q: generate(pool[Math.floor(rng() * pool.length)], rng), qStartedAt: Date.now(), results: [],
  };
  emit('session');
  return S.active;
}

export const currentQuestion = () =>
  !S.active ? null : S.active.mode === 'boss' ? S.active.q : S.active.qs[S.active.i];

const questionNo = a => (a.mode === 'boss' ? a.asked : a.i);

/** Seconds allowed for the current question, or 0 for none. */
export function timeLimit() {
  const a = S.active, q = currentQuestion();
  if (!a || !q) return 0;
  if (a.mode === 'boss') return BOSS_SECS[q.kind] || 60;
  return a.mode === 'mission' ? q.secs : 0;
}

/**
 * Start the current question's clock the first time it is on screen. Reading
 * the last answer's explanation costs nothing; a reload does not reset it.
 */
export function markShown(now = Date.now()) {
  const a = S.active;
  if (!a || a.shown === questionNo(a)) return;
  a.shown = questionNo(a);
  a.qStartedAt = now;
  save();
}

/** Answer the current question. `input` is an option index or typed text; null means time ran out. */
export function answer(input, rng = Math.random) {
  const a = S.active;
  if (!a) return null;
  const q = currentQuestion();
  const res = input === null
    ? { correct:false, expected: grade(q, '').expected, given:'—', note:'Out of time.' }
    : grade(q, input);

  const limit = timeLimit();
  const took = a.qStartedAt ? Math.max(0, (Date.now() - a.qStartedAt) / 1000) : 0;
  const late = limit && input !== null && took > limit + 1;
  if (late) { res.correct = false; res.note = 'Over time.'; }
  const secs = limit ? Math.min(took, limit) : took;

  const day = roboDay(a.day);
  day.answered += 1; S.stats.answered += 1;
  a.run = res.correct ? a.run + 1 : 0;
  a.best = Math.max(a.best, a.run);
  day.bestRun = Math.max(day.bestRun, a.run);
  if (res.correct) { day.correct += 1; S.stats.correct += 1; }

  let xp = 0, dmg = 0, round = null;
  if (a.mode === 'mission') {
    const g = a.groups[q.grp];
    if (res.correct) xp = XP.right + Math.ceil(g.level / 2);
    const mine = [...a.results.filter(x => x.grp === q.grp), { correct: res.correct, secs }];
    if (mine.length === g.n) {
      // The skill's round is over: move its level once, on the whole round.
      const out = scoreRound(r().skills[q.skill], {
        asked: g.n, right: mine.filter(x => x.correct).length, secs: mine.reduce((n, x) => n + x.secs, 0),
      }, a.day);
      r().skills[q.skill] = out.entry;
      g.to = out.to; g.move = out.move; g.right = out.entry.hist.at(-1).right; g.secs = out.entry.hist.at(-1).secs;
      if (out.move > 0) { xp += XP.levelUp; day.ups += 1; S.stats.levelUps = (S.stats.levelUps || 0) + 1; }
      round = { ...g };
    }
  } else if (a.mode === 'practice') {
    // Practice never moves a level — only a mission can, once a day — but a
    // first right answer starts a skill you had not met.
    if (res.correct && !skillLevel(q.skill)) {
      r().skills[q.skill] = { level: 1, best: 1, due: a.day, seen: 0, right: 0, wrong: 0, last: null, hist: [] };
    }
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
  a.results.push({ skill: q.skill, grp: q.grp, ...res, secs: Math.round(secs), xp, dmg });

  if (a.mode === 'boss') {
    if (!sessionOver()) {
      const others = a.pool.filter(id => id !== a.q.skill);
      const pool = others.length ? others : a.pool;
      a.q = generate(pool[Math.floor(rng() * pool.length)], rng);
    }
  } else a.i += 1;
  save();
  return { ...res, xp, dmg, round };
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

  if (a.mode === 'mission') {
    const total = a.qs.length, perfect = right === total && a.results.length === total;
    const ups = a.groups.filter(g => g.move > 0).length, downs = a.groups.filter(g => g.move < 0).length;
    completeMission(a.n, a.day, { score: right, total, ups, downs });
    S.stats.drills += 1;
    if (perfect) S.stats.perfectDrills += 1;
    if (perfect) drop = grantLoot(rollLoot({ chance: 0.1, set: 'bench', rng }));
    reward = award(a.xp + XP.missionDone + (perfect ? XP.missionClean : 0), 5 + right * 2 + (perfect ? 10 : 0),
      perfect ? 'Clean mission' : `Mission ${a.n}`);
    extra = { score: right, total, perfect, n: a.n, groups: a.groups, scoreFrom: day.mission.scoreFrom, scoreTo: day.mission.scoreTo };
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
    if (a.mission) { completeMission(a.mission, a.day, { boss: true, won, score: a.results.filter(x => x.correct).length, total: a.asked }); extra.n = a.mission; }
  }

  const summary = { mode: a.mode, results: a.results, best: a.best, reward, drop, ...extra };
  S.active = null;
  emit(a.mode === 'boss' ? 'boss' : 'drill', summary);
  return summary;
}

/** Mark mission n done today and note how far the skill score moved. */
function completeMission(n, key, info) {
  const day = roboDay(key);
  const last = Object.entries(r().scores || {}).filter(([d]) => d < key).sort(([x], [y]) => x.localeCompare(y)).at(-1);
  const scoreTo = M.skillScore(r());
  r().missions = { ...(r().missions || {}), [n]: key };
  r().scores = { ...(r().scores || {}), [key]: scoreTo };
  day.mission = { n, ...info, scoreFrom: last ? last[1] : 0, scoreTo, at: Date.now() };
  touchStreak(key);
}

/** A mission or practice set waits to be resumed; leaving a boss fight forfeits it. */
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
