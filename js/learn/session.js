/**
 * The learning engine both tracks share: missions, the daily check, testing out
 * of a week, practice, and — for tracks that have one — a boss fight.
 *
 * A track registers itself with its plan, its skills and a few hooks; the
 * engine keeps everything else identical, so a mission in Robots and a mission
 * in Code behave the same way. Sessions live in S.active so a phone that kills
 * the tab mid-question comes back to the same question, with its clock still
 * running — nobody can reroll a check or buy time by reloading.
 *
 * Each track's slice of the save holds:
 *   skills    { id: level entry }        levels, spacing and history per skill
 *   missions  { n: day }                  missions finished
 *   skipped   { n: day }                  missions skipped by testing out
 *   checks    { n: { day, score, … } }   the check of each mission, once done
 *   scores    { day: skill score }        for the "getting better" chart
 *   testouts  { week: { day, passed } }   one attempt per week per day
 */
import { S, emit, award, grantLoot, getDay, today, touchStreak, save } from '../state.js';
import { rollLoot } from '../data/loot.js';
import { levelOf, roundFor, scoreRound, lastRound, pickReviews, bossCombo, MAX_LEVEL } from '../game.js';
import { generate, grade } from '../quiz.js';
import * as P from './plan.js';

export const XP = {
  right: 5,               // + half the skill's level, for each right answer in a mission
  levelUp: 15, missionDone: 30, missionClean: 20,
  testOutRight: 5,        // testing out pays for the answers, not for the missions it skips
  practiceRight: 4, practiceCap: 120, bossHit: 100,
};

/** Questions in a test-out, the level they are asked at, and how many must be right. */
export const TEST_OUT = { questions: 6, level: 4, pass: 5 };

const TRACKS = {};
export const registerTrack = cfg => { TRACKS[cfg.id] = cfg; };
export const trackCfg = id => TRACKS[id];

const slice = id => TRACKS[id].slice();

/* ------------------------------ day counters ------------------------------ */

const DAY_FIELD = { robotics: 'robotics', cp: 'code' };

export const emptyCounters = () => ({
  mission: null, drill: null, answered: 0, correct: 0, bestRun: 0, ups: 0, practiceCorrect: 0, practiceXp: 0, check: null,
});

/** A day's numbers for a track, created on first use and filled in place — every caller holds the same object. */
export function counters(track, key = today()) {
  const day = getDay(key), f = DAY_FIELD[track];
  if (!day[f]) day[f] = emptyCounters();
  for (const [k, v] of Object.entries(emptyCounters())) if (!(k in day[f])) day[f][k] = v;
  return day[f];
}

/* -------------------------------- selectors ------------------------------- */

export const skillLevel = (track, id) => levelOf(slice(track).skills?.[id]);
export const skillScore = track => TRACKS[track].skills.reduce((n, s) => n + skillLevel(track, s.id), 0);
export const maxScore = track => TRACKS[track].skills.length * MAX_LEVEL;
export const missionsDone = track => P.missionsDone(slice(track));
export const missionsSkipped = track => P.missionsSkipped(slice(track));
export const missionDoneToday = (track, key = today()) => !!P.missionDoneOn(slice(track), key);

/** Today's mission, with whether its check is already done. */
export function mission(track, key = today()) {
  const r = slice(track), m = P.todaysMission(r, TRACKS[track].plan, key);
  return { ...m, check: r.checks?.[m.n] || null };
}

export const testOut = (track, week) => {
  const r = slice(track), t = P.testOutFor(r, TRACKS[track].plan, week);
  const tried = r.testouts?.[week];
  return { ...t, tried, triedToday: tried?.day === today(), passed: !!tried?.passed };
};

/* --------------------------------- missions ------------------------------- */

/** The skills a mission checks: today's new ones, then what is due, then the weakest. */
export function missionSkills(track, m, key = today()) {
  const cfg = TRACKS[track], st = slice(track).skills || {}, pool = cfg.unlockedSkillIds(key);
  const budget = cfg.budget(m.month);
  const cost = id => roundFor(levelOf(st[id])).n;
  const picked = m.boss ? [] : m.skills.filter(id => pool.includes(id));
  let used = picked.reduce((n, id) => n + cost(id), 0);
  for (const id of pickReviews(pool, st, key, budget - used, picked)) { picked.push(id); used += cost(id); }

  // Nothing due: sharpen the weakest skills you have started — on a boss day,
  // the weakest of the month.
  const started = (m.boss ? pool.filter(id => cfg.skillById(id).month === m.month) : pool)
    .filter(id => levelOf(st[id]) >= 1 && !picked.includes(id))
    .sort((a, b) => levelOf(st[a]) - levelOf(st[b]) || (st[a].last || '').localeCompare(st[b].last || ''));
  const want = m.boss ? budget : Math.min(budget, 6);
  for (const id of started) {
    if (picked.length >= 2 && used + cost(id) > want) break;
    picked.push(id); used += cost(id);
  }
  return picked;
}

export function startMission(track, key = today(), rng = Math.random) {
  if (S.active) return S.active;
  const cfg = TRACKS[track], r = slice(track);
  if (missionDoneToday(track, key) || P.missionsDone(r) + P.missionsSkipped(r) >= cfg.plan.length) return null;
  const m = mission(track, key);
  if (m.check) return null;                                  // waiting on the rest of the mission, not another check
  if (m.boss && cfg.startBoss?.(m, key, rng)) return S.active;
  if (m.boss && cfg.bossIsNotACheck) return null;
  const qs = [], groups = [];
  for (const id of missionSkills(track, m, key)) {
    const e = r.skills?.[id], level = Math.max(1, levelOf(e)), round = roundFor(level);
    groups.push({ skill: id, level, from: levelOf(e), n: round.n, start: qs.length, prev: lastRound(e), isNew: !levelOf(e) });
    for (let k = 0; k < round.n; k++) {
      const q = generate(id, rng);
      qs.push({ ...q, grp: groups.length - 1, secs: round.secs[q.kind] || round.secs.num });
    }
  }
  if (!qs.length) return null;
  S.active = { mode:'mission', track, n: m.n, month: m.month, day:key, i:0, run:0, best:0, xp:0, qs, groups, results: [], shown: -1 };
  emit('session');
  return S.active;
}

/**
 * Mark mission n done on `key`, and note how far the skill score moved.
 * Called by the track once everything the mission asks for has happened.
 */
export function completeMission(track, n, key, info = {}) {
  const r = slice(track), day = counters(track, key);
  if (r.missions?.[n]) return false;
  const last = Object.entries(r.scores || {}).filter(([d]) => d < key).sort(([x], [y]) => x.localeCompare(y)).at(-1);
  const scoreTo = skillScore(track);
  r.missions = { ...(r.missions || {}), [n]: key };
  r.scores = { ...(r.scores || {}), [key]: scoreTo };
  day.mission = { n, ...info, scoreFrom: last ? last[1] : 0, scoreTo, at: Date.now() };
  touchStreak(key);
  emit('mission', { track, n });
  return true;
}

/* --------------------------------- test out ------------------------------- */

/** Six questions across a week's skills at level 4. Five right skips the rest of the week. */
export function startTestOut(track, week, key = today(), rng = Math.random) {
  if (S.active) return S.active;
  const t = testOut(track, week);
  if (!t.ok || t.triedToday) return null;
  const skills = [...t.skills].sort(() => rng() - 0.5), round = roundFor(TEST_OUT.level);
  const qs = Array.from({ length: TEST_OUT.questions }, (_, i) => {
    const q = generate(skills[i % skills.length], rng);
    return { ...q, secs: round.secs[q.kind] || round.secs.num };
  });
  S.active = { mode:'testout', track, week, day:key, i:0, run:0, best:0, xp:0, qs, results: [], shown: -1 };
  emit('session');
  return S.active;
}

/* --------------------------------- practice ------------------------------- */

export function startPractice(track, skillId, key = today(), rng = Math.random) {
  if (S.active) return S.active;
  const cfg = TRACKS[track], skill = cfg.skillById(skillId);
  if (!skill || !cfg.unlockedSkillIds(key).includes(skillId)) return null;
  S.active = {
    mode:'practice', track, day:key, skill: skillId, i:0, run:0, best:0, xp:0,
    qs: Array.from({ length: 5 }, () => generate(skillId, rng)), results: [],
  };
  emit('session');
  return S.active;
}

/* --------------------------------- answering ------------------------------ */

export const currentQuestion = () =>
  !S.active ? null : S.active.mode === 'boss' ? S.active.q : S.active.qs[S.active.i];

const questionNo = a => (a.mode === 'boss' ? a.asked : a.i);

/** Seconds allowed for the current question, or 0 for none. */
export function timeLimit() {
  const a = S.active, q = currentQuestion();
  if (!a || !q) return 0;
  if (a.mode === 'boss') return a.secs?.[q.kind] || 60;
  return a.mode === 'practice' ? 0 : q.secs;
}

/** Start the current question's clock the first time it is on screen. Reading feedback costs nothing; a reload does not reset it. */
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
  const q = currentQuestion(), r = slice(a.track);
  const res = input === null
    ? { correct:false, expected: grade(q, '').expected, given:'—', note:'Out of time.' }
    : grade(q, input);

  const limit = timeLimit();
  const took = a.qStartedAt ? Math.max(0, (Date.now() - a.qStartedAt) / 1000) : 0;
  if (limit && input !== null && took > limit + 1) { res.correct = false; res.note = 'Over time.'; }
  const secs = limit ? Math.min(took, limit) : took;

  const day = counters(a.track, a.day);
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
      const out = scoreRound(r.skills?.[q.skill], {
        asked: g.n, right: mine.filter(x => x.correct).length, secs: mine.reduce((n, x) => n + x.secs, 0),
      }, a.day);
      r.skills = { ...(r.skills || {}), [q.skill]: out.entry };
      Object.assign(g, { to: out.to, move: out.move, right: out.entry.hist.at(-1).right, secs: out.entry.hist.at(-1).secs });
      if (out.move > 0) { xp += XP.levelUp; day.ups += 1; S.stats.levelUps = (S.stats.levelUps || 0) + 1; }
      round = { ...g };
    }
  } else if (a.mode === 'testout') {
    if (res.correct) xp = XP.testOutRight;
  } else if (a.mode === 'practice') {
    // Practice never moves a level — only a mission can, once a day — but a
    // first right answer starts a skill you had not met.
    if (res.correct && !levelOf(r.skills?.[q.skill])) {
      r.skills = { ...(r.skills || {}), [q.skill]: { level: 1, best: 1, due: a.day, seen: 0, right: 0, wrong: 0, last: null, hist: [] } };
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
    a.taunt = a.hp <= a.maxHp / 2 && a.taunt === 'intro' ? 'half' : a.taunt === 'half' ? 'shown' : a.taunt;
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
  if (a.mode === 'boss') return a.hp <= 0 || a.hearts <= 0 || a.asked >= a.questions;
  return a.i >= a.qs.length;
}

/* -------------------------------- finishing ------------------------------- */

/** Close out the active session and pay for it. Returns a summary for the results screen. */
export function finishSession(rng = Math.random) {
  const a = S.active;
  if (!a) return null;
  const cfg = TRACKS[a.track], r = slice(a.track);
  const right = a.results.filter(x => x.correct).length;
  let reward, drop = null, extra = {};

  if (a.mode === 'mission') {
    const total = a.qs.length, perfect = right === total && a.results.length === total;
    const ups = a.groups.filter(g => g.move > 0).length, downs = a.groups.filter(g => g.move < 0).length;
    const info = { score: right, total, ups, downs };
    r.checks = { ...(r.checks || {}), [a.n]: { day: a.day, ...info } };
    counters(a.track, a.day).check = { n: a.n, ...info };
    if (a.track === 'robotics') { S.stats.drills += 1; if (perfect) S.stats.perfectDrills += 1; }
    if (perfect) drop = grantLoot(rollLoot({ chance: 0.1, set: cfg.lootSet, rng }));
    reward = award(a.xp + XP.missionDone + (perfect ? XP.missionClean : 0), 5 + right * 2 + (perfect ? 10 : 0),
      perfect ? 'Clean check' : `Mission ${a.n}`);
    const scoreFrom = Object.entries(r.scores || {}).filter(([d]) => d < a.day).sort(([x], [y]) => x.localeCompare(y)).at(-1)?.[1] ?? 0;
    touchStreak(a.day);
    const completed = cfg.onCheck(a.n, a.day, info);
    extra = { ...info, perfect, n: a.n, groups: a.groups, scoreFrom, scoreTo: skillScore(a.track), completed };
  } else if (a.mode === 'testout') {
    const t = P.testOutFor(r, cfg.plan, a.week), passed = right >= TEST_OUT.pass;
    r.testouts = { ...(r.testouts || {}), [a.week]: { day: a.day, right, total: a.qs.length, passed } };
    let skipped = 0;
    if (passed) {
      r.skipped = { ...(r.skipped || {}) };
      for (const m of t.left) { r.skipped[m.n] = a.day; skipped++; }
      for (const id of t.skills) {
        const e = r.skills?.[id], lvl = Math.max(3, levelOf(e));
        r.skills = { ...(r.skills || {}), [id]: { seen: 0, right: 0, wrong: 0, hist: [], ...(e || {}), level: lvl, best: Math.max(e?.best || 0, lvl), due: a.day } };
      }
    }
    reward = award(a.xp, 0, passed ? `Tested out of week ${a.week}` : 'Test-out');
    extra = { score: right, total: a.qs.length, passed, week: a.week, skipped };
  } else if (a.mode === 'practice') {
    reward = award(a.xp, 0, 'Practice');
    extra = { score: right, total: a.qs.length, capped: counters(a.track, a.day).practiceXp >= XP.practiceCap };
  } else {
    ({ reward, drop, extra } = cfg.finishBoss(a, rng));
  }

  const summary = { mode: a.mode, track: a.track, results: a.results, best: a.best, reward, drop, ...extra };
  S.active = null;
  emit(a.mode === 'boss' ? 'boss' : 'drill', summary);
  return summary;
}

/** A check or practice set waits to be resumed; leaving a boss fight forfeits it. */
export function abandonSession() {
  const a = S.active;
  if (!a) return null;
  if (a.mode === 'boss') { a.hearts = 0; return finishSession(); }
  return null;
}
