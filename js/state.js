/**
 * The save file: one character across every track.
 *
 * The rule every track follows: the game pays only for what it can check.
 *
 *   Programming   solves read from Codeforces, which does not care what you typed
 *   Robotics      answers graded in code; builds verified against your GitHub
 *   Shared        minutes the app's own timer measured; commits read from GitHub
 *
 * There is no field anywhere to type in minutes or claim a solve. Things you
 * choose — a direction, a reading list — are recorded, and pay nothing.
 *
 * Each track keeps its own slice under `tracks`. Everything a character has only
 * once — level, credits, streak, gear, quests, the timer — lives here.
 */
import { ACHIEVEMENTS, BOTIFY_IDS } from './data/achievements.js';
import { lootBonus, RARITY } from './data/loot.js';
import { questsForDay } from './data/quests.js';
import { dayKey, daysBetween, levelFromXp, newlyEarned, XP } from './game.js';
import * as cpModel from './tracks/cp/model.js';
import * as roboModel from './tracks/robotics/model.js';

const SAVE_KEY = 'codify.save.v1';     // unchanged, so an existing Codify save upgrades in place
const BACKUP_KEY = 'codify.save.prior';

export const TRACK_IDS = ['cp', 'robotics'];

/* --------------------------------- themes --------------------------------- */

export const THEMES = [
  { id:'lime',   name:'Lime',   accent:'#B8F02D', ink:'#12100E', cost:0 },
  { id:'acid',   name:'Acid',   accent:'#7BF17B', ink:'#12100E', cost:0 },
  { id:'cyan',   name:'Cyan',   accent:'#45D9E8', ink:'#12100E', cost:250 },
  { id:'sun',    name:'Sun',    accent:'#FFD93D', ink:'#12100E', cost:250 },
  { id:'punch',  name:'Punch',  accent:'#FF5FA2', ink:'#12100E', cost:450 },
  { id:'blaze',  name:'Blaze',  accent:'#FF8A29', ink:'#12100E', cost:450 },
  { id:'grape',  name:'Grape',  accent:'#B06BFF', ink:'#12100E', cost:700 },
  { id:'cobalt', name:'Cobalt', accent:'#4D7CFF', ink:'#FFF8E8', cost:700 },
  { id:'siren',  name:'Siren',  accent:'#FF4B3E', ink:'#FFF8E8', cost:1200 },
  { id:'mint',   name:'Mint',   accent:'#5FE3C0', ink:'#12100E', cost:1800 },
];
export const themeFor = id => THEMES.find(t => t.id === id) || THEMES[0];
export const ownsTheme = id => themeFor(id).cost === 0 || S.owned.includes(id);

export function applyTheme() {
  if (typeof document === 'undefined' || !document.documentElement) return;
  const t = themeFor(S.profile.theme);
  document.documentElement.style.setProperty('--accent', t.accent);
  document.documentElement.style.setProperty('--accent-ink', t.ink);
}

/* ------------------------------- save shape ------------------------------- */

export const emptyDay = () => ({ timer: [], timerMin: 0, timerTagged: 0, timerXp: 0, claimed: [], robotics: null });

const freshCp = () => ({
  handle:'', rating:null, rank:null, avatar:null, solved:[], syncedAt:0, error:'',
  credited:{ problems:{}, tiers:{} }, contest:null, contests:{}, dailySolves:2,
});
const freshRobotics = () => ({ start: dayKey(), direction:null, skills:{}, builds:{}, bosses:{}, read:{} });

const freshSave = () => ({
  v: 3,
  profile: { name:'', theme:'lime', focusGoal:120, tracks:[...TRACK_IDS], onboarded:false, created: dayKey() },
  xp: 0, coins: 0,
  streak: { current:0, best:0, lastActive:null, freezes:1 },
  days: {},
  timer: null,                // { start, day, tag } — the one focus timer
  active: null,               // an unfinished robotics drill, practice set or boss fight
  github: { user:'', avatar:null, pushes:[], syncedAt:0, error:'', credited:{} },
  tracks: { cp: freshCp(), robotics: freshRobotics() },
  earned: {}, owned: [], loot: {},
  stats: {
    xpEarned:0, quests:0, timerMin:0, sessions:0, commits:0, pushes:0,
    solved:0, ratedSolved:0, bestRating:0, tiersCleared:0, contestsWon:0, contestsRun:0,
    drills:0, perfectDrills:0, answered:0, correct:0, bossFights:0,
  },
  settings: { sound:true, reduceMotion:false },
  notice: null,               // a one-time message after an upgrade
  legacy: null,               // anything an older format had that this one no longer shows
  backupAt: 0,
});

/* -------------------------------- migration ------------------------------- */

const isV3 = o => o && o.v === 3 && o.tracks;
const isCodify = o => o && o.platforms && o.credited;                    // Codify, Codeforces era
const isBotify = o => o && o.skills && o.builds && o.profile?.start;     // Botify

function mergeV3(o) {
  const base = freshSave();
  return {
    ...base, ...o,
    profile:  { ...base.profile,  ...(o.profile  || {}) },
    streak:   { ...base.streak,   ...(o.streak   || {}) },
    stats:    { ...base.stats,    ...(o.stats    || {}) },
    settings: { ...base.settings, ...(o.settings || {}) },
    github:   { ...base.github,   ...(o.github   || {}) },
    tracks: {
      cp:       { ...base.tracks.cp,       ...(o.tracks?.cp       || {}) },
      robotics: { ...base.tracks.robotics, ...(o.tracks?.robotics || {}) },
    },
  };
}

/** Codify's daily goals were named; their minutes become the focus goal. */
const CODIFY_GOALS = { casual:[30, 1], levelup:[60, 2], grind:[90, 3], sprint:[120, 4] };

/**
 * Codify → one character. Codeforces progress, gear, streak and achievements
 * carry over as they were. Timed sessions become timer minutes; hand-typed
 * sessions and notes paid nothing and are no longer shown, so they are kept
 * under `legacy` rather than deleted.
 */
export function fromCodify(o) {
  const s = freshSave();
  const [focusGoal, dailySolves] = CODIFY_GOALS[o.profile?.goal] || [60, 2];
  s.profile = { ...s.profile, name: o.profile?.name || '', theme: o.profile?.theme || 'lime',
                focusGoal, onboarded: !!o.profile?.onboarded, created: o.profile?.created || dayKey() };
  Object.assign(s, { xp: o.xp || 0, coins: o.coins || 0, earned: o.earned || {}, owned: o.owned || [], loot: o.loot || {} });
  s.streak = { ...s.streak, ...(o.streak || {}) };
  s.settings = { ...s.settings, ...(o.settings || {}) };
  const cf = o.platforms?.cf || {}, gh = o.platforms?.gh || {};
  s.tracks.cp = { ...freshCp(), handle: cf.handle || '', rating: cf.rating ?? null, rank: cf.rank ?? null,
    solved: cf.solved || [], syncedAt: cf.syncedAt || 0,
    credited: { problems: o.credited?.problems || {}, tiers: o.credited?.tiers || {} },
    contest: o.active?.id && o.active?.startedAt ? o.active : null,
    contests: o.contests || {}, dailySolves };
  s.github = { ...s.github, user: gh.user || '', avatar: gh.avatar || null, pushes: gh.pushes || [],
               syncedAt: gh.syncedAt || 0, credited: o.credited?.pushes || {} };
  const st = o.stats || {};
  Object.assign(s.stats, {
    xpEarned: st.xpEarned || 0, quests: st.quests || 0, timerMin: st.verifiedMinutes || 0,
    sessions: st.sessions || 0, commits: st.commits || 0, pushes: st.pushes || 0,
    solved: st.solved || 0, ratedSolved: st.ratedSolved || 0, bestRating: st.bestRating || 0,
    tiersCleared: st.tiersCleared || 0, contestsWon: st.contestsWon || 0, contestsRun: st.contestsRun || 0,
  });
  const legacy = {};
  for (const [key, d] of Object.entries(o.days || {})) {
    const timed = (d.focus || []).filter(f => f.verified);
    s.days[key] = {
      ...emptyDay(),
      claimed: d.claimed || [],
      timer: timed.map(f => ({ start: (f.ts || 0) - f.minutes * 60000, end: f.ts || 0, min: f.minutes, tag: f.topic ? `cp:${f.topic}` : null })),
      timerMin: timed.reduce((n, f) => n + f.minutes, 0),
      timerTagged: timed.filter(f => f.topic).reduce((n, f) => n + f.minutes, 0),
    };
    const typed = (d.focus || []).filter(f => !f.verified);
    if (typed.length || (d.notes || []).length) legacy[key] = { sessions: typed, notes: d.notes || [] };
  }
  if (Object.keys(legacy).length) s.legacy = { from: 'codify', days: legacy };
  s.notice = 'merged';
  return s;
}

/** Botify → the robotics track of a fresh character. Used on its own and by importBotify. */
export function fromBotify(o) {
  const s = freshSave();
  s.profile = { ...s.profile, name: o.profile?.name || '', theme: o.profile?.theme || 'lime',
                focusGoal: o.profile?.goal || 120, tracks: ['robotics'],
                onboarded: !!o.profile?.onboarded, created: o.profile?.created || dayKey() };
  Object.assign(s, { xp: o.xp || 0, coins: o.coins || 0, owned: o.owned || [], loot: o.loot || {},
                     active: o.active || null, backupAt: o.backupAt || 0 });
  s.earned = Object.fromEntries(Object.entries(o.earned || {}).map(([id, d]) => [BOTIFY_IDS[id] || id, d]));
  s.streak = { ...s.streak, ...(o.streak || {}) };
  s.settings = { ...s.settings, ...(o.settings || {}) };
  s.github.user = o.profile?.github || '';
  s.tracks.robotics = { ...freshRobotics(), start: o.profile?.start || dayKey(), direction: o.profile?.direction || null,
    skills: o.skills || {}, builds: o.builds || {}, bosses: o.bosses || {}, read: o.read || {} };
  const st = o.stats || {};
  Object.assign(s.stats, {
    xpEarned: st.xpEarned || 0, quests: st.quests || 0, timerMin: st.benchMin || 0, sessions: st.sessions || 0,
    drills: st.drills || 0, perfectDrills: st.perfectDrills || 0, answered: st.answered || 0,
    correct: st.correct || 0, bossFights: st.bossFights || 0,
  });
  if (o.timer) s.timer = { ...o.timer, tag: o.timer.tag ? `robotics:${o.timer.tag}` : null };
  for (const [key, d] of Object.entries(o.days || {})) {
    s.days[key] = {
      ...emptyDay(),
      claimed: d.claimed || [],
      timer: (d.bench || []).map(b => ({ ...b, tag: b.tag ? `robotics:${b.tag}` : null })),
      timerMin: d.benchMin || 0, timerTagged: d.benchTagged || 0, timerXp: d.benchXp || 0,
      robotics: { drill: d.drill || null, answered: d.answered || 0, correct: d.correct || 0, bestRun: d.bestRun || 0,
                  reviewCorrect: d.reviewCorrect || 0, practiceCorrect: d.practiceCorrect || 0, practiceXp: d.practiceXp || 0 },
    };
  }
  return s;
}

export function migrate(o) {
  if (isV3(o)) return mergeV3(o);
  if (isCodify(o)) return fromCodify(o);
  if (isBotify(o)) return fromBotify(o);
  return null;
}

/* ------------------------------ persistence ------------------------------- */

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshSave();
    return migrate(JSON.parse(raw)) || freshSave();
  } catch (err) {
    console.warn('Save unreadable, starting fresh.', err);
    return freshSave();
  }
}

export const S = load();

// An upgraded save is written back at once, so the migration runs a single time.
try {
  const stored = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  if (stored && stored.v !== 3) localStorage.setItem(SAVE_KEY, JSON.stringify(S));
} catch { /* unreadable or full — load() already fell back */ }

let saveTimer = null, lastSaveFailed = false;
const saveErrorHandlers = new Set();
export const onSaveError = fn => (saveErrorHandlers.add(fn), () => saveErrorHandlers.delete(fn));
export const saveHealthy = () => !lastSaveFailed;

/** A failed write means everything after it is being thrown away. Say so. */
export function save({ immediate = false } = {}) {
  clearTimeout(saveTimer);
  const write = () => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); lastSaveFailed = false; }
    catch (err) { lastSaveFailed = true; console.error('Could not save.', err); saveErrorHandlers.forEach(fn => fn(err)); }
  };
  if (immediate) write(); else saveTimer = setTimeout(write, 140);
}

function replaceS(next) {
  Object.keys(S).forEach(k => delete S[k]);
  Object.assign(S, next);
}

export function resetSave() {
  localStorage.removeItem(SAVE_KEY);
  replaceS(freshSave());
  emit('reset');
}

export const exportSave = () => JSON.stringify(S, null, 2);
export const backupFilename = () => `codify-backup-${today()}.json`;
export function markBackup() { S.backupAt = Date.now(); save(); }

export const needsBackup = () => {
  if (!S.profile.onboarded || S.xp <= 0) return false;
  const since = S.backupAt || new Date((S.profile.created || dayKey()) + 'T00:00:00').getTime();
  return Date.now() - since > 7 * 86400000;
};

export function describeSave(obj) {
  const o = migrate(obj) || freshSave();
  return {
    name: o.profile.name || '(no name)',
    level: levelFromXp(o.xp).level,
    days: Object.keys(o.days).length,
    handle: o.tracks.cp.handle || '—',
    solved: (o.tracks.cp.solved || []).length,
    builds: roboModel.verifiedCount(o.tracks.robotics),
    bosses: Object.values(o.tracks.robotics.bosses).filter(b => b.won).length,
    kind: isV3(obj) ? 'Codify' : isCodify(obj) ? 'Codify (older)' : isBotify(obj) ? 'Botify' : '?',
  };
}

function stashPrior() {
  try { localStorage.setItem(BACKUP_KEY, JSON.stringify(S)); } catch { /* no room for an undo copy */ }
}

/** Replace everything with a backup — this app's, older Codify's, or Botify's. */
export function importSave(text) {
  let obj;
  try { obj = JSON.parse(text); }
  catch { return { ok:false, error:'That is not valid JSON. Paste the whole file, braces included.' }; }
  const next = migrate(obj);
  if (!next) return { ok:false, error:'That JSON is not a Codify or Botify backup.' };
  stashPrior();
  const summary = describeSave(obj);
  if (next.notice === 'merged' && isV3(obj)) next.notice = null;
  replaceS(next);
  save({ immediate: true }); applyTheme();
  emit('import', { summary });
  return { ok:true, summary };
}

/**
 * Fold a Botify backup into this character instead of replacing it: its robotics
 * progress becomes this robotics track, and its XP, credits, gear and history
 * are added to yours. For anyone who used both apps before they became one.
 */
export function importBotify(text) {
  let obj;
  try { obj = JSON.parse(text); } catch { return { ok:false, error:'That is not valid JSON.' }; }
  if (!isBotify(obj)) return { ok:false, error:'That is not a Botify backup.' };
  const b = fromBotify(obj);
  stashPrior();

  S.tracks.robotics = b.tracks.robotics;
  S.xp += b.xp; S.coins += b.coins;
  for (const k of ['xpEarned', 'quests', 'timerMin', 'sessions', 'drills', 'perfectDrills', 'answered', 'correct', 'bossFights']) {
    S.stats[k] = (S.stats[k] || 0) + (b.stats[k] || 0);
  }
  for (const [id, n] of Object.entries(b.loot)) S.loot[id] = Math.max(S.loot[id] || 0, n);
  for (const [id, d] of Object.entries(b.earned)) if (!S.earned[id]) S.earned[id] = d;
  S.owned = [...new Set([...S.owned, ...b.owned])];
  S.streak.best = Math.max(S.streak.best, b.streak.best);
  S.streak.freezes = Math.max(S.streak.freezes, b.streak.freezes);
  if ((b.streak.lastActive || '') > (S.streak.lastActive || '')) {
    S.streak.current = b.streak.current; S.streak.lastActive = b.streak.lastActive;
  }
  for (const [key, d] of Object.entries(b.days)) {
    const mine = getDay(key);
    mine.robotics = d.robotics;
    mine.timer.push(...d.timer);
    mine.timerMin += d.timerMin; mine.timerTagged += d.timerTagged; mine.timerXp += d.timerXp;
  }
  if (!S.github.user && b.github.user) S.github.user = b.github.user;
  if (!S.profile.tracks.includes('robotics')) S.profile.tracks.push('robotics');
  if (!S.active && b.active) S.active = b.active;
  save({ immediate: true });
  emit('import', { botify: true });
  return { ok:true, summary: describeSave(obj) };
}

export function priorSave() {
  try { const raw = localStorage.getItem(BACKUP_KEY); return raw ? describeSave(JSON.parse(raw)) : null; }
  catch { return null; }
}
export function undoImport() {
  const raw = localStorage.getItem(BACKUP_KEY);
  if (!raw) return false;
  const r = importSave(raw);
  if (r.ok) localStorage.removeItem(BACKUP_KEY);
  return r.ok;
}

/* -------------------------------- event bus ------------------------------- */

const listeners = new Set();
export const on = fn => (listeners.add(fn), () => listeners.delete(fn));
export function emit(type, detail) {
  save();
  listeners.forEach(fn => { try { fn(type, detail); } catch (err) { console.error(err); } });
}

/* -------------------------------- selectors ------------------------------- */

export const today = () => dayKey();

export function getDay(key = today()) {
  S.days[key] = { ...emptyDay(), ...(S.days[key] || {}) };
  for (const k of ['timer', 'claimed']) if (!Array.isArray(S.days[key][k])) S.days[key][k] = [];
  return S.days[key];
}

export const progress = () => levelFromXp(S.xp);
export const gearBonus = () => lootBonus(S.loot);

export const enabledTracks = () => TRACK_IDS.filter(t => S.profile.tracks.includes(t));
export const trackOn = id => S.profile.tracks.includes(id);
export const cp = () => S.tracks.cp;
export const robo = () => S.tracks.robotics;

/** A track deals quests once it can actually be checked. */
export const usableTracks = () => enabledTracks().filter(t => t !== 'cp' || !!S.tracks.cp.handle);

export const commitsOn = (key = today()) =>
  (S.github.pushes || []).filter(p => p.day === key).reduce((n, p) => n + p.commits, 0);

/**
 * A day counts when something verified happened on it, in any track: a solve the
 * judge accepted, a finished drill, a commit, or twenty timed minutes.
 */
export function dayIsActive(key = today()) {
  const day = S.days[key];
  return cpModel.solvesOn(S.tracks.cp, key).length >= 1
    || !!day?.robotics?.drill
    || commitsOn(key) >= 1
    || (day?.timerMin || 0) >= 20;
}

export function statsSnapshot() {
  const cpSnap = cpModel.snapshot(S.tracks.cp);
  const roSnap = roboModel.snapshot(S.tracks.robotics);
  const tracksActive = (S.stats.solved > 0 ? 1 : 0) + (S.stats.drills > 0 || roSnap.builds > 0 ? 1 : 0);
  return { ...S.stats, ...cpSnap, ...roSnap, level: progress().level, bestStreak: S.streak.best, tracksActive };
}

/* --------------------------------- quests --------------------------------- */

export function questContext(key = today()) {
  const day = getDay(key);
  return {
    key, day,
    cp: cpModel.dayTotals(S.tracks.cp, key),
    robo: roboModel.roboDayOf(day),
    commits: commitsOn(key),
    rating: S.tracks.cp.rating,
    github: !!S.github.user,
    usable: usableTracks(),
  };
}

export function quests(key = today()) {
  const ctx = questContext(key);
  return questsForDay(key, ctx).map(q => {
    const value = q.value(ctx) || 0;
    return { ...q, value, done: value >= q.goal, claimed: ctx.day.claimed.includes(q.id),
             pct: Math.min(100, (value / q.goal) * 100) };
  });
}

export function claimQuest(id, key = today()) {
  const q = quests(key).find(x => x.id === id);
  if (!q || !q.done || q.claimed) return null;
  getDay(key).claimed.push(id);
  S.stats.quests += 1;
  const r = award(q.xp, q.coins, q.name);
  emit('quest', { quest: q, reward: r });
  return r;
}

/* --------------------------------- rewards -------------------------------- */

export function award(rawXp, coins = 0, reason = '') {
  const bonus = gearBonus();
  const xp = Math.round(rawXp * bonus);
  const before = progress().level;
  S.xp += xp; S.coins += coins; S.stats.xpEarned += xp;

  const levelUps = [];
  for (let l = before + 1; l <= progress().level; l++) {
    levelUps.push(l);
    S.coins += XP.levelPurse * l;
    if (l % 5 === 0) S.streak.freezes += 1;
  }

  const achievements = newlyEarned(ACHIEVEMENTS, statsSnapshot(), S.earned);
  for (const a of achievements) { S.earned[a.id] = today(); S.xp += a.xp; S.stats.xpEarned += a.xp; }
  return { xp, coins, reason, levelUps, achievements, gearBonus: bonus > 1 ? bonus : null };
}

/** Add a piece of gear. A duplicate converts to credits instead. */
export function grantLoot(item) {
  if (!item) return null;
  if (S.loot[item.id]) {
    const credit = RARITY[item.rarity].dupe;
    S.coins += credit;
    return { ...item, dupe: true, credit };
  }
  S.loot[item.id] = 1;
  return { ...item, dupe: false };
}

/* --------------------------------- streak --------------------------------- */

/** Advance the streak once today has something verified in it. */
export function touchStreak(key = today()) {
  if (key !== today() || !dayIsActive(key)) return;
  const st = S.streak;
  if (st.lastActive === key) return;
  const gap = st.lastActive ? daysBetween(st.lastActive, key) : 1;
  if (gap === 1 || !st.lastActive) st.current += 1;
  else if (gap > 1 && st.freezes >= gap - 1) { st.freezes -= gap - 1; st.current += 1; }
  else st.current = 1;
  st.lastActive = key;
  st.best = Math.max(st.best, st.current);
}

/** On open: spend freezes on missed days, or break the streak. */
export function auditStreak(key = today()) {
  const st = S.streak;
  if (!st.lastActive) return;
  const gap = daysBetween(st.lastActive, key);
  if (gap <= 1) return;
  const missed = gap - 1;
  if (st.freezes >= missed) {
    st.freezes -= missed;
    const d = new Date(key + 'T00:00:00'); d.setDate(d.getDate() - 1);
    st.lastActive = dayKey(d);
  } else st.current = 0;
  save();
}

/* ---------------------------------- timer --------------------------------- */

/** One session counts for at most four hours. A forgotten timer should not pay. */
export const MAX_SESSION_MIN = 240;

export const timerRunning = () => !!S.timer;
export const timerMinutes = () => (S.timer ? Math.floor((Date.now() - S.timer.start) / 60000) : 0);
export const timerCap = () => Math.round((S.profile.focusGoal || 120) * XP.timerCapFactor);

/** `tag` is "track:item" — a topic, a build — or null for general work. */
export function timerStart(tag = null) {
  if (S.timer) return S.timer;
  S.timer = { start: Date.now(), day: today(), tag };
  emit('timer');
  return S.timer;
}

/** Stop the timer. `keep` trims a session down — never up. */
export function timerStop(keep = null) {
  const t = S.timer;
  if (!t) return null;
  const elapsed = Math.floor((Date.now() - t.start) / 60000);
  let min = Math.min(elapsed, MAX_SESSION_MIN);
  if (keep != null) min = Math.max(0, Math.min(min, Math.round(keep)));
  S.timer = null;
  if (min < 1) { emit('timer'); return { min: 0, reward: null }; }

  const day = getDay(t.day);
  day.timer.push({ start: t.start, end: Date.now(), min, tag: t.tag });
  day.timerMin += min;
  if (t.tag) day.timerTagged += min;
  S.stats.timerMin += min; S.stats.sessions += 1;

  const xp = Math.max(0, Math.min(min * XP.timerPerMin, timerCap() - day.timerXp));
  day.timerXp += xp;
  const reward = award(xp, 0, 'Focus time');
  touchStreak(t.day);
  emit('timer', { min, reward });
  return { min, reward };
}

/* ---------------------------------- github -------------------------------- */

export function linkGithub({ login, avatar = null }) {
  Object.assign(S.github, { user: login, avatar, error:'' });
  emit('profile');
}
export function unlinkGithub() {
  Object.assign(S.github, { user:'', avatar:null, pushes:[], syncedAt:0, error:'' });
  emit('profile');
}

/** Fold fetched push events into the save; each event id pays once. */
export function applyPushes(pushes) {
  S.github.pushes = pushes;
  S.github.syncedAt = Date.now();
  let commits = 0;
  const fresh = [];
  for (const p of pushes) {
    if (S.github.credited[p.id]) continue;
    S.github.credited[p.id] = p.day;
    fresh.push(p);
    commits += p.commits;
    S.stats.commits += p.commits; S.stats.pushes += 1;
  }
  const reward = commits ? award(XP.commit * commits, 2 * commits, 'GitHub') : null;
  touchStreak();
  emit('sync', { source:'gh', fresh, commits, reward });
  return { fresh, commits, reward };
}

/* ------------------------------ profile & shop ---------------------------- */

export function saveProfile(patch) { Object.assign(S.profile, patch); applyTheme(); emit('profile'); }

export function setTrack(id, on) {
  if (!TRACK_IDS.includes(id)) return false;
  const next = on ? [...new Set([...S.profile.tracks, id])] : S.profile.tracks.filter(t => t !== id);
  if (!next.length) return false;              // a character needs at least one track
  S.profile.tracks = TRACK_IDS.filter(t => next.includes(t));
  emit('profile');
  return true;
}

export function dismissNotice() { S.notice = null; emit('profile'); }

export function buyTheme(id) {
  const t = THEMES.find(x => x.id === id);
  if (!t || ownsTheme(id) || S.coins < t.cost) return false;
  S.coins -= t.cost; S.owned.push(id); S.profile.theme = id;
  applyTheme(); emit('shop'); return true;
}
export function selectTheme(id) {
  if (!ownsTheme(id)) return false;
  S.profile.theme = id; applyTheme(); emit('shop'); return true;
}
export const FREEZE_COST = 200;
export function buyFreeze() {
  if (S.coins < FREEZE_COST) return false;
  S.coins -= FREEZE_COST; S.streak.freezes += 1; emit('shop'); return true;
}
