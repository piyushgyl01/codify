/** The save file: persistence, selectors, mutations, and the bus the UI listens to. */
import { NODES, nodeById, nodesOfPath, PATHS } from './data/skilltree.js';
import { ACHIEVEMENTS } from './data/achievements.js';
import { rollLoot, lootBonus } from './data/loot.js';
import {
  MODES, modeWeight, isDeliberate, effectiveMinutes,
  problemReward, shipReward, PATTERNS, difficultyFor,
} from './data/practice.js';
import {
  levelFromXp, targetsFor, dayKey, daysBetween, shiftDay,
  dailyQuests, newlyEarned, totalsOf, predictedRetention,
  nextRetestGap, freshnessFor, halfLifeDays,
} from './game.js';

const SAVE_KEY = 'codify.save.v1';
const BACKUP_KEY = 'codify.save.prior';

/**
 * Accent themes. Free ones are always available; the rest cost credits.
 * `ink` is what sits on top of the accent — a mid-tone accent with white text on
 * it is the one place this palette can fail an eye test, so it is stated rather
 * than derived.
 */
export const THEMES = [
  { id:'cobalt',    name:'Cobalt',    accent:'#2F6BFF', ink:'#FFFDF6', cost:0 },
  { id:'lemon',     name:'Lemon',     accent:'#FFD93D', ink:'#14120F', cost:0 },
  { id:'mint',      name:'Mint',      accent:'#22D3A7', ink:'#14120F', cost:250 },
  { id:'magenta',   name:'Magenta',   accent:'#FF3D8B', ink:'#FFFDF6', cost:250 },
  { id:'violet',    name:'Violet',    accent:'#7C4DFF', ink:'#FFFDF6', cost:450 },
  { id:'tangerine', name:'Tangerine', accent:'#FF7A2C', ink:'#14120F', cost:450 },
  { id:'sky',       name:'Sky',       accent:'#38BDF8', ink:'#14120F', cost:700 },
  { id:'coral',     name:'Coral',     accent:'#FF5A5F', ink:'#FFFDF6', cost:700 },
  { id:'lime',      name:'Lime',      accent:'#A3E635', ink:'#14120F', cost:1200 },
  { id:'ultra',     name:'Ultraviolet', accent:'#5B21B6', ink:'#FFFDF6', cost:1800 },
];

export const themeFor = id => THEMES.find(t => t.id === id) || THEMES[0];
export const ownsTheme = id => themeFor(id).cost === 0 || S.owned.includes(id);

export function applyTheme() {
  // Runs under the test suite too, where there is no document at all.
  if (typeof document === 'undefined') return;
  const t = themeFor(S.profile.theme);
  const root = document.documentElement;
  if (!root) return;
  root.style.setProperty('--accent', t.accent);
  root.style.setProperty('--accent-ink', t.ink);
}

const emptyDay = () => ({
  focus: [], problems: [], ships: [], retests: [],
  gauntlets: [],          // gauntlet attempt ids, for the quest metric
  claimed: [],            // quest ids already banked
  skillsClaimed: [],      // node ids mastered today
});

const freshSave = () => ({
  v: 1,
  profile: {
    name: '', theme: 'cobalt', track: 'generalist', goal: 'levelup',
    hours: 2, onboarded: false, created: dayKey(),
  },
  xp: 0, coins: 0,
  streak: { current: 0, best: 0, lastActive: null, freezes: 1 },
  days: {},
  /* nodeId -> { date, minutes, passes, fails, lastProof, lastFailed, history:[] } */
  skills: {},
  earned: {},             // achievementId -> date
  gauntlets: {},          // gauntletId -> { won, date, attempts, best }
  owned: [],              // purchased theme ids
  loot: {},               // lootId -> count
  stats: {
    sessions: 0, minutes: 0, effMinutes: 0, buildMinutes: 0,
    problems: 0, solved: 0, solvedNoHint: 0, hardSolved: 0,
    ships: 0, commits: 0, prs: 0, releases: 0, projects: 0,
    drills: 0, gauntlets: 0, gauntletComebacks: 0,
    retestsPassed: 0, retestsFailed: 0, clearedQueue: 0,
    quests: 0, deliberateDays: 0, bestCombo: 0,
    earlyBird: 0, nightOwl: 0, xpEarned: 0,
  },
  settings: { sound: true, reduceMotion: false },
});

/* ------------------------------ persistence ------------------------------ */

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshSave();
    const parsed = JSON.parse(raw);
    const base = freshSave();
    // Merge onto a fresh save so a file written by an older build gains any
    // fields added since, rather than loading with holes in it.
    return {
      ...base, ...parsed,
      profile:  { ...base.profile,  ...(parsed.profile  || {}) },
      streak:   { ...base.streak,   ...(parsed.streak   || {}) },
      stats:    { ...base.stats,    ...(parsed.stats    || {}) },
      settings: { ...base.settings, ...(parsed.settings || {}) },
    };
  } catch (err) {
    console.warn('Save file unreadable, starting fresh.', err);
    return freshSave();
  }
}

export const S = load();

/**
 * Writes are debounced, and a failure is reported rather than swallowed.
 *
 * A quota error here means every subsequent action is being silently discarded,
 * which is the single worst thing this app can do to someone. `onSaveError` lets
 * the shell surface it; the flag lets any view ask whether the last write landed.
 */
let saveTimer = null;
let lastSaveFailed = false;
const saveErrorHandlers = new Set();
export const onSaveError = fn => (saveErrorHandlers.add(fn), () => saveErrorHandlers.delete(fn));
export const saveHealthy = () => !lastSaveFailed;

export function save({ immediate = false } = {}) {
  clearTimeout(saveTimer);
  const write = () => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(S));
      lastSaveFailed = false;
    } catch (err) {
      lastSaveFailed = true;
      console.error('Could not write the save.', err);
      saveErrorHandlers.forEach(fn => fn(err));
    }
  };
  if (immediate) write(); else saveTimer = setTimeout(write, 140);
}

export function resetSave() {
  localStorage.removeItem(SAVE_KEY);
  Object.assign(S, freshSave());
  emit('reset');
}

export const exportSave = () => JSON.stringify(S, null, 2);
export const backupFilename = () => `codify-backup-${today()}.json`;

/** Summarise a file so someone can confirm it before it overwrites what they have. */
export function describeSave(obj) {
  const days = Object.keys(obj?.days || {}).sort();
  const count = (key) => days.reduce((n, k) => n + (obj.days[k]?.[key]?.length || 0), 0);
  const minutes = days.reduce(
    (n, k) => n + (obj.days[k]?.focus || []).reduce((m, e) => m + (e.minutes || 0), 0), 0);
  return {
    name: obj?.profile?.name || '(no name)',
    level: levelFromXp(obj?.xp || 0).level,
    created: obj?.profile?.created || '?',
    days: days.length,
    firstDay: days[0] || null,
    lastDay: days.at(-1) || null,
    sessions: count('focus'),
    problems: count('problems'),
    hours: Math.round(minutes / 60),
    skills: Object.keys(obj?.skills || {}).length,
    bestStreak: obj?.streak?.best || 0,
  };
}

const looksLikeSave = obj =>
  !!obj && typeof obj === 'object' && !Array.isArray(obj)
  && typeof obj.profile === 'object' && obj.profile !== null
  && typeof obj.days === 'object' && obj.days !== null
  && ('xp' in obj);

/**
 * Replace everything with a backup. The save being overwritten is stashed first,
 * so restoring the wrong file is recoverable rather than final.
 */
export function importSave(text) {
  let obj;
  try { obj = JSON.parse(text); }
  catch { return { ok:false, error:'That is not valid JSON. Paste the whole file, braces included.' }; }

  if (!looksLikeSave(obj)) {
    return { ok:false, error:'That JSON is not a Codify backup — no profile, no day history.' };
  }

  try { localStorage.setItem(BACKUP_KEY, JSON.stringify(S)); }
  catch { /* no room for a rollback copy; the import itself still stands */ }

  const fresh = freshSave();
  const summary = describeSave(obj);
  Object.keys(S).forEach(k => delete S[k]);
  Object.assign(S, fresh, obj, {
    profile:  { ...fresh.profile,  ...(obj.profile  || {}) },
    streak:   { ...fresh.streak,   ...(obj.streak   || {}) },
    stats:    { ...fresh.stats,    ...(obj.stats    || {}) },
    settings: { ...fresh.settings, ...(obj.settings || {}) },
  });
  save({ immediate: true });
  emit('import', { summary });
  return { ok:true, summary };
}

export function priorSave() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    return raw ? describeSave(JSON.parse(raw)) : null;
  } catch { return null; }
}

export function undoImport() {
  const raw = localStorage.getItem(BACKUP_KEY);
  if (!raw) return false;
  const result = importSave(raw);
  if (result.ok) localStorage.removeItem(BACKUP_KEY);
  return result.ok;
}

/* ------------------------------- event bus -------------------------------- */

const listeners = new Set();
export const on = fn => (listeners.add(fn), () => listeners.delete(fn));
export function emit(type, detail) {
  save();
  listeners.forEach(fn => fn(type, detail));
}

/* -------------------------------- selectors ------------------------------- */

export const today = () => dayKey();

export function getDay(key = today()) {
  if (!S.days[key]) S.days[key] = emptyDay();
  const d = S.days[key];
  // Days written by an older build may predate a log. Fill in rather than crash.
  for (const k of ['focus','problems','ships','retests','gauntlets','claimed','skillsClaimed']) {
    if (!Array.isArray(d[k])) d[k] = [];
  }
  return d;
}

export const dayTotals = (key = today()) => totalsOf(getDay(key));
export const targets = () => targetsFor(S.profile);
export const progress = () => levelFromXp(S.xp);
export const gearBonus = () => lootBonus(S.loot);

export const quests = (key = today()) =>
  dailyQuests(key, progress().level, getDay(key), { neglected: neglectedPattern() });

/* ------------------------------ path experience --------------------------- */

/**
 * Effective hours logged against each path, all time.
 *
 * This is what widens a node's half-life, so it is deliberately the *effective*
 * figure: an afternoon of video does not buy the same durability as an afternoon
 * of building, and the retention model should not pretend otherwise.
 */
export function pathHours() {
  const out = Object.fromEntries(PATHS.map(p => [p.id, 0]));
  for (const key of Object.keys(S.days)) {
    for (const e of S.days[key].focus || []) {
      if (e.path && out[e.path] != null) out[e.path] += (e.minutes || 0) * modeWeight(e.mode);
    }
  }
  for (const k of Object.keys(out)) out[k] = out[k] / 60;
  return out;
}

/* -------------------------------- the tree -------------------------------- */

/** Mastered, available (level + prerequisite met), or locked. */
export function nodeState(node) {
  if (S.skills[node.id]) return 'mastered';
  const level = progress().level;
  const prereqOk = !node.needs || !!S.skills[node.needs];
  return level >= node.lvl && prereqOk ? 'available' : 'locked';
}

/**
 * Everything the UI needs to say about one mastered node: how much of it the
 * model thinks you still hold, when it is next due, and how overdue it is.
 */
export function skillStatus(nodeId, hoursByPath = null) {
  const rec = S.skills[nodeId];
  const node = nodeById(nodeId);
  if (!rec || !node) return null;

  const hours = (hoursByPath || pathHours())[node.path] || 0;
  const since = daysBetween(rec.lastProof || rec.date, today());
  const retention = predictedRetention(since, hours, rec.passes || 0);
  const gap = nextRetestGap(rec.passes || 0, !!rec.lastFailed);
  const dueOn = shiftDay(rec.lastProof || rec.date, gap);
  const dueIn = daysBetween(today(), dueOn);

  return {
    node, rec, since, retention,
    freshness: freshnessFor(retention),
    halfLife: halfLifeDays(hours, rec.passes || 0),
    dueOn, dueIn,
    due: dueIn <= 0,
    passes: rec.passes || 0,
    fails: rec.fails || 0,
  };
}

/** Every mastered node whose retest is due, most overdue first. */
export function dueRetests() {
  const hours = pathHours();
  return Object.keys(S.skills)
    .map(id => skillStatus(id, hours))
    .filter(s => s && s.due)
    .sort((a, b) => a.dueIn - b.dueIn);
}

/** Mastered nodes sorted by how little of them the model thinks is left. */
export function decayRanking(limit = 5) {
  const hours = pathHours();
  return Object.keys(S.skills)
    .map(id => skillStatus(id, hours))
    .filter(Boolean)
    .sort((a, b) => a.retention - b.retention)
    .slice(0, limit);
}

/* -------------------------------- patterns -------------------------------- */

/** Problems solved per pattern, all time. */
export function patternTally() {
  const tally = Object.fromEntries(PATTERNS.map(p => [p.id, 0]));
  for (const key of Object.keys(S.days)) {
    for (const p of S.days[key].problems || []) {
      if (p.solved && tally[p.pattern] != null) tally[p.pattern] += 1;
    }
  }
  return tally;
}

/**
 * The pattern you have practised least.
 *
 * Ties break towards the earlier entry in PATTERNS rather than randomly, so the
 * quest that points at it does not change target halfway through the day.
 */
export function neglectedPattern() {
  const tally = patternTally();
  let worst = null, worstN = Infinity;
  for (const p of PATTERNS) {
    if (tally[p.id] < worstN) { worst = p.id; worstN = tally[p.id]; }
  }
  return worst;
}

/* --------------------------------- history -------------------------------- */

/** The last `n` days, oldest first, each summarised. Feeds every chart. */
export function historySeries(n = 30) {
  const t = targets();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const day = S.days[key];
    const tot = day ? totalsOf(day) : totalsOf(emptyDay());
    out.push({
      key, date: d, ...tot,
      target: t.focus,
      logged: !!day && (tot.minutes > 0 || tot.problems > 0 || tot.ships > 0 || tot.retests > 0),
    });
  }
  return out;
}

/** Lifetime snapshot the achievement predicates read. */
export function statsSnapshot() {
  const skills = Object.keys(S.skills);
  const touched = new Set(skills.map(id => nodeById(id)?.path).filter(Boolean));
  const complete = PATHS.filter(p =>
    nodesOfPath(p.id).every(n => S.skills[n.id])).length;
  const tally = patternTally();

  return {
    ...S.stats,
    level: progress().level,
    bestStreak: S.streak.best,
    skills: skills.length,
    pathsTouched: touched.size,
    pathsComplete: complete,
    patternsCovered: Object.values(tally).filter(n => n > 0).length,
    gauntlets: Object.values(S.gauntlets).filter(g => g.won).length,
  };
}

/* --------------------------------- rewards -------------------------------- */

export function award(rawXp, coins = 0, reason = '') {
  const bonus = gearBonus();
  const xp = Math.round(rawXp * bonus);
  const before = progress().level;

  S.xp += xp;
  S.coins += coins;
  S.stats.xpEarned += xp;

  const after = progress().level;
  const levelUps = [];
  for (let l = before + 1; l <= after; l++) {
    levelUps.push(l);
    S.coins += 40 * l;                        // level-up purse
    if (l % 5 === 0) S.streak.freezes += 1;   // a freeze every five levels
  }

  const unlocked = newlyEarned(statsSnapshot(), S.earned);
  for (const a of unlocked) {
    S.earned[a.id] = today();
    S.xp += a.xp;
    S.stats.xpEarned += a.xp;
  }

  return { xp, coins, reason, levelUps, achievements: unlocked,
           gearBonus: bonus > 1 ? bonus : null };
}

export function checkAchievements() {
  const unlocked = newlyEarned(statsSnapshot(), S.earned);
  for (const a of unlocked) { S.earned[a.id] = today(); S.xp += a.xp; S.stats.xpEarned += a.xp; }
  return unlocked;
}

/* --------------------------------- streak --------------------------------- */

/** A day is active once you have done any real thing on it. */
export const dayIsActive = (key = today()) => {
  const t = totalsOf(getDay(key));
  return t.minutes >= 20 || t.solved >= 1 || t.ships >= 1 || t.retests >= 1;
};

export function touchStreak(key = today()) {
  if (key !== today()) return;
  if (!dayIsActive(key)) return;

  const st = S.streak, t = today();
  if (st.lastActive === t) return;

  const gap = st.lastActive ? daysBetween(st.lastActive, t) : 1;
  if (gap === 1 || !st.lastActive) st.current += 1;
  else if (gap > 1 && st.freezes > 0 && gap - 1 <= st.freezes) {
    st.freezes -= (gap - 1);
    st.current += 1;
  } else st.current = 1;

  st.lastActive = t;
  st.best = Math.max(st.best, st.current);
}

/** Break the streak on load if too many days lapsed while the app was closed. */
export function auditStreak() {
  const st = S.streak;
  if (!st.lastActive) return;
  const gap = daysBetween(st.lastActive, today());
  if (gap <= 1) return;
  const missed = gap - 1;
  if (st.freezes >= missed) { st.freezes -= missed; st.lastActive = today(); }
  else st.current = 0;
  save();
}

/**
 * Count a day as deliberate exactly once, and un-count it if a later edit drops
 * it back under the line. Without the second half the number only ever goes up.
 */
function reconcileDay(key) {
  const day = getDay(key);
  const t = totalsOf(day);
  const good = t.minutes >= 25 && t.deliberatePct >= 60;
  if (good && !day.countedDeliberate) { day.countedDeliberate = true; S.stats.deliberateDays += 1; }
  else if (!good && day.countedDeliberate) { day.countedDeliberate = false; S.stats.deliberateDays -= 1; }
}

/* -------------------------------- mutations ------------------------------- */

export function saveProfile(patch) {
  Object.assign(S.profile, patch);
  applyTheme();
  emit('profile');
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`);

/**
 * Log a focus session.
 *
 * XP is paid on effective minutes, not wall-clock minutes — which is the entire
 * argument of this app expressed as a number the player feels.
 */
export function logFocus({ minutes, mode = 'build', path = null, topic = '', note = '',
                           ctx = null, drillId = null, gauntlet = false, ts = null }, key = today()) {
  const m = Math.max(1, Math.min(720, Math.round(+minutes || 0)));
  const entry = {
    uid: uid(), minutes: m, mode, path, topic: String(topic || '').slice(0, 80),
    note: String(note || '').slice(0, 300), ctx, drillId, gauntlet,
    ts: ts || Date.now(),
  };
  getDay(key).focus.push(entry);

  const eff = effectiveMinutes(entry);
  const hour = new Date(entry.ts).getHours();
  Object.assign(S.stats, {
    sessions: S.stats.sessions + 1,
    minutes: S.stats.minutes + m,
    effMinutes: S.stats.effMinutes + eff,
    buildMinutes: S.stats.buildMinutes + (mode === 'build' ? m : 0),
    earlyBird: S.stats.earlyBird + (hour < 7 ? 1 : 0),
    nightOwl: S.stats.nightOwl + (hour >= 22 ? 1 : 0),
  });

  const r = award(Math.round(eff * 1.6), Math.round(eff * 0.5), 'Focus logged');
  touchStreak(key);
  reconcileDay(key);
  emit('focus', { entry, reward: r });
  return r;
}

export function removeFocus(id, key = today()) {
  const day = getDay(key);
  const entry = day.focus.find(e => e.uid === id);
  if (!entry) return false;
  day.focus = day.focus.filter(e => e.uid !== id);
  // Lifetime totals are a ledger, not a cache: undo the entry rather than
  // leaving stats that no day in the file supports any more.
  S.stats.sessions = Math.max(0, S.stats.sessions - 1);
  S.stats.minutes = Math.max(0, S.stats.minutes - entry.minutes);
  S.stats.effMinutes = Math.max(0, S.stats.effMinutes - effectiveMinutes(entry));
  if (entry.mode === 'build') S.stats.buildMinutes = Math.max(0, S.stats.buildMinutes - entry.minutes);
  reconcileDay(key);
  emit('focus', {});
  return true;
}

export function logProblem({ name, pattern, difficulty = 'medium', minutes = 0,
                             solved = true, hinted = false, note = '' }, key = today()) {
  const entry = {
    uid: uid(),
    name: String(name || 'Problem').slice(0, 90),
    pattern: pattern || null,
    difficulty: difficultyFor(difficulty).id,
    minutes: Math.max(0, Math.min(600, Math.round(+minutes || 0))),
    solved: !!solved, hinted: !!hinted,
    note: String(note || '').slice(0, 300),
    ts: Date.now(),
  };
  getDay(key).problems.push(entry);

  Object.assign(S.stats, {
    problems: S.stats.problems + 1,
    solved: S.stats.solved + (entry.solved ? 1 : 0),
    solvedNoHint: S.stats.solvedNoHint + (entry.solved && !entry.hinted ? 1 : 0),
    hardSolved: S.stats.hardSolved + (entry.solved && entry.difficulty === 'hard' ? 1 : 0),
  });

  const { xp, coins } = problemReward(entry);
  const r = award(xp, coins, entry.solved ? 'Problem solved' : 'Attempt logged');
  touchStreak(key);
  emit('problem', { entry, reward: r });
  return r;
}

export function removeProblem(id, key = today()) {
  const day = getDay(key);
  const entry = day.problems.find(p => p.uid === id);
  if (!entry) return false;
  day.problems = day.problems.filter(p => p.uid !== id);
  S.stats.problems = Math.max(0, S.stats.problems - 1);
  if (entry.solved) {
    S.stats.solved = Math.max(0, S.stats.solved - 1);
    if (!entry.hinted) S.stats.solvedNoHint = Math.max(0, S.stats.solvedNoHint - 1);
    if (entry.difficulty === 'hard') S.stats.hardSolved = Math.max(0, S.stats.hardSolved - 1);
  }
  emit('problem', {});
  return true;
}

export function logShip({ kind = 'commit', count = 1, repo = '', note = '' }, key = today()) {
  const entry = {
    uid: uid(), kind,
    count: Math.max(1, Math.min(200, Math.round(+count || 1))),
    repo: String(repo || '').slice(0, 60),
    note: String(note || '').slice(0, 300),
    ts: Date.now(),
  };
  getDay(key).ships.push(entry);

  S.stats.ships += 1;
  if (kind === 'commit')  S.stats.commits  += entry.count;
  if (kind === 'pr')      S.stats.prs      += entry.count;
  if (kind === 'release') S.stats.releases += entry.count;
  if (kind === 'project') S.stats.projects += entry.count;

  const { xp, coins } = shipReward(kind, entry.count);
  const r = award(xp, coins, 'Shipped');
  touchStreak(key);
  emit('ship', { entry, reward: r });
  return r;
}

export function removeShip(id, key = today()) {
  const day = getDay(key);
  const entry = day.ships.find(s => s.uid === id);
  if (!entry) return false;
  day.ships = day.ships.filter(s => s.uid !== id);
  S.stats.ships = Math.max(0, S.stats.ships - 1);
  const field = { commit:'commits', pr:'prs', release:'releases', project:'projects' }[entry.kind];
  if (field) S.stats[field] = Math.max(0, S.stats[field] - entry.count);
  emit('ship', {});
  return true;
}

/* --------------------------------- skills --------------------------------- */

/** Claim a node by having done its task. `minutes` is how long it took you. */
export function claimNode(nodeId, minutes = 0) {
  const node = nodeById(nodeId);
  if (!node || S.skills[nodeId] || nodeState(node) !== 'available') return null;

  const t = today();
  S.skills[nodeId] = {
    date: t, lastProof: t, passes: 0, fails: 0, lastFailed: false,
    minutes: Math.max(0, Math.round(+minutes || 0)),
    history: [{ date: t, passed: true, minutes: Math.round(+minutes || 0), first: true }],
  };
  getDay(t).skillsClaimed.push(nodeId);

  const r = award(80 + node.lvl * 22, 30 + node.lvl * 8, `Claimed ${node.name}`);
  touchStreak(t);
  emit('skill', { node, reward: r });
  return r;
}

/**
 * Log a retest.
 *
 * A pass pushes the node out to the next rung of the spacing schedule. A failure
 * drops it back one rung and brings it round again in days, not weeks — and it
 * is recorded, because a retest log you can quietly skip when it goes badly
 * measures nothing at all.
 */
export function logRetest(nodeId, passed, minutes = 0, key = today()) {
  const rec = S.skills[nodeId];
  const node = nodeById(nodeId);
  if (!rec || !node) return null;

  const mins = Math.max(0, Math.round(+minutes || 0));
  rec.history = rec.history || [];
  rec.history.push({ date: key, passed: !!passed, minutes: mins });

  if (passed) {
    rec.passes = (rec.passes || 0) + 1;
    rec.lastFailed = false;
    rec.lastProof = key;
    S.stats.retestsPassed += 1;
  } else {
    rec.fails = (rec.fails || 0) + 1;
    rec.lastFailed = true;
    // Drop a rung: the spacing that produced a failure was too generous.
    rec.passes = Math.max(0, (rec.passes || 0) - 1);
    rec.lastProof = key;
    S.stats.retestsFailed += 1;
  }

  getDay(key).retests.push({ uid: uid(), nodeId, passed: !!passed, minutes: mins, ts: Date.now() });

  // Clearing the queue is its own small event, and worth noticing.
  if (passed && dueRetests().length === 0) S.stats.clearedQueue += 1;

  const base = passed ? 40 + node.lvl * 8 : 15;
  const r = award(base, passed ? 15 + node.lvl * 3 : 5,
                  passed ? `Held ${node.name}` : `Retest failed: ${node.name}`);
  touchStreak(key);
  emit('retest', { node, passed: !!passed, reward: r });
  return r;
}

/** Give up a node entirely — it goes back to available and its history is kept. */
export function releaseNode(nodeId) {
  if (!S.skills[nodeId]) return false;
  delete S.skills[nodeId];
  emit('skill', {});
  return true;
}

/* ------------------------------ drills & runs ----------------------------- */

/**
 * Record a finished drill or gauntlet.
 * `result` = { steps:[{label, minutes, done}], seconds, comboMult, bestCombo, passed }
 */
export function finishSession(session, result, key = today()) {
  const doneSteps = result.steps.filter(s => s.done);
  const ratio = result.steps.length ? doneSteps.length / result.steps.length : 0;
  const minutes = Math.max(1, Math.round(result.seconds / 60));

  // The session writes into the focus log like any other practice, so a drill and
  // a hand-typed hour are the same kind of thing on every chart downstream.
  const entry = {
    uid: uid(), minutes, mode: session.mode, path: session.path,
    topic: session.name, note: '', ctx: null,
    drillId: session.id, gauntlet: !!session.isGauntlet, ts: Date.now(),
  };
  getDay(key).focus.push(entry);

  const eff = effectiveMinutes(entry);
  const hour = new Date().getHours();
  Object.assign(S.stats, {
    sessions: S.stats.sessions + 1,
    minutes: S.stats.minutes + minutes,
    effMinutes: S.stats.effMinutes + eff,
    buildMinutes: S.stats.buildMinutes + (session.mode === 'build' ? minutes : 0),
    drills: S.stats.drills + (session.isGauntlet ? 0 : 1),
    earlyBird: S.stats.earlyBird + (hour < 7 ? 1 : 0),
    nightOwl: S.stats.nightOwl + (hour >= 22 ? 1 : 0),
    bestCombo: Math.max(S.stats.bestCombo, result.bestCombo || 0),
  });

  if (session.isGauntlet) {
    const prev = S.gauntlets[session.id] || { won:false, attempts:0 };
    const lostBefore = !prev.won && prev.attempts > 0;
    S.gauntlets[session.id] = {
      won: prev.won || !!result.passed,
      date: result.passed ? key : prev.date,
      attempts: (prev.attempts || 0) + 1,
      best: Math.max(prev.best || 0, Math.round(ratio * 100)),
    };
    if (result.passed && !prev.won) {
      S.stats.gauntlets += 1;
      if (lostBefore) S.stats.gauntletComebacks += 1;
    }
    getDay(key).gauntlets.push(session.id);
  }

  // Partial credit is real: bailing halfway is worth more than not starting, and
  // much less than finishing. The combo rewards not skipping.
  const combo = result.comboMult || 1;
  const xp = Math.round(session.xp * (0.4 + 0.6 * ratio) * combo);
  const coins = Math.round((session.coins || session.xp * 0.3) * ratio);
  const r = award(xp, coins, session.name);

  const drop = session.isGauntlet
    ? (result.passed ? rollLoot({ minRarity: 'rare' }) : null)
    : rollLoot({ chance: 0.22 + 0.08 * session.tier * ratio });
  if (drop) S.loot[drop.id] = (S.loot[drop.id] || 0) + 1;

  touchStreak(key);
  reconcileDay(key);
  emit('session', { entry, reward: r, drop, session, result });
  return { ...r, entry, drop, combo, ratio };
}

/* --------------------------------- quests --------------------------------- */

export function claimQuest(questId, key = today()) {
  const day = getDay(key);
  if (day.claimed.includes(questId)) return null;
  const q = quests(key).find(x => x.id === questId);
  if (!q || !q.done) return null;

  day.claimed.push(questId);
  S.stats.quests += 1;
  const r = award(q.xp, q.coins, q.name);
  emit('quest', { quest: q, reward: r });
  return r;
}

/* ---------------------------------- shop ---------------------------------- */

export function buyTheme(id) {
  const t = THEMES.find(x => x.id === id);
  if (!t || ownsTheme(id) || S.coins < t.cost) return false;
  S.coins -= t.cost;
  S.owned.push(id);
  S.profile.theme = id;
  applyTheme();
  emit('shop', { theme: t });
  return true;
}

export function selectTheme(id) {
  if (!ownsTheme(id)) return false;
  S.profile.theme = id;
  applyTheme();
  emit('shop', { theme: themeFor(id) });
  return true;
}

export function buyFreeze(cost = 200) {
  if (S.coins < cost) return false;
  S.coins -= cost;
  S.streak.freezes += 1;
  emit('shop', { freeze: true });
  return true;
}

export const ACHIEVEMENT_LIST = ACHIEVEMENTS;
export { MODES, PATTERNS, NODES, PATHS };
