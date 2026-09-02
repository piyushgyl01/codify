/**
 * The save file.
 *
 * The important rule, and the reason this file was rewritten: the log records
 * what you say, and the game pays only for what it can check.
 *
 * Verified sources are Codeforces solves and GitHub pushes, both read from
 * public APIs that do not care what you typed here. Those award XP. Anything you
 * enter by hand — a LeetCode problem, an hour of reading — is kept in the log
 * because your record should be complete, but it is marked unverified and pays
 * nothing. That is the difference between a tracker and a diary that flatters you.
 *
 * Solves and pushes are not copied into day records. They live in one list per
 * platform and are bucketed by date when something needs them, so re-syncing is
 * idempotent and cannot double-count.
 */
import { TOPICS, TIERS, PATHS, topicById, topicProgress, tierXp, tierCoins } from './data/skilltree.js';
import { ACHIEVEMENTS } from './data/achievements.js';
import { rollLoot, lootBonus } from './data/loot.js';
import { levelFromXp, dayKey, daysBetween, newlyEarned, dailyQuests } from './game.js';
import { contestById, settle, contestReward } from './data/contests.js';

const SAVE_KEY = 'codify.save.v1';
const BACKUP_KEY = 'codify.save.prior';

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
  if (typeof document === 'undefined') return;      // the test suite has no DOM
  const t = themeFor(S.profile.theme);
  const root = document.documentElement;
  if (!root) return;
  root.style.setProperty('--accent', t.accent);
  root.style.setProperty('--accent-ink', t.ink);
}

const emptyDay = () => ({ focus: [], notes: [], claimed: [] });

const freshSave = () => ({
  v: 2,
  profile: { name:'', theme:'lime', goal:'levelup', hours:2, onboarded:false, created:dayKey() },
  xp: 0, coins: 0,
  streak: { current:0, best:0, lastActive:null, freezes:1 },
  days: {},                       // only what this app owns: timer sessions, notes, quests
  platforms: {
    cf: { handle:'', rating:null, rank:null, solved:[], syncedAt:0, error:'' },
    gh: { user:'', avatar:null, pushes:[], syncedAt:0, error:'' },
  },
  /* What has already been paid for. Without this, every sync pays again. */
  credited: { problems:{}, tiers:{}, pushes:{} },
  /* The contest currently running, and the record of past attempts. */
  active: null,                   // { id, startedAt, known: [problemKeys] }
  contests: {},                   // id -> { won, attempts, best, date }
  earned: {},
  owned: [],
  loot: {},
  stats: {
    solved:0, ratedSolved:0, bestRating:0, tiersCleared:0,
    commits:0, pushes:0,
    focusMinutes:0, verifiedMinutes:0, sessions:0,
    quests:0, xpEarned:0, contestsWon:0, contestsRun:0,
  },
  settings: { sound:true, reduceMotion:false },
});

/* ------------------------------ persistence ------------------------------ */

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshSave();
    const parsed = JSON.parse(raw);
    const base = freshSave();
    return {
      ...base, ...parsed,
      profile:   { ...base.profile,   ...(parsed.profile   || {}) },
      streak:    { ...base.streak,    ...(parsed.streak    || {}) },
      stats:     { ...base.stats,     ...(parsed.stats     || {}) },
      settings:  { ...base.settings,  ...(parsed.settings  || {}) },
      credited:  { ...base.credited,  ...(parsed.credited  || {}) },
      contests:  { ...base.contests,  ...(parsed.contests  || {}) },
      platforms: {
        cf: { ...base.platforms.cf, ...(parsed.platforms?.cf || {}) },
        gh: { ...base.platforms.gh, ...(parsed.platforms?.gh || {}) },
      },
    };
  } catch (err) {
    console.warn('Save file unreadable, starting fresh.', err);
    return freshSave();
  }
}

export const S = load();

let saveTimer = null;
let lastSaveFailed = false;
const saveErrorHandlers = new Set();
export const onSaveError = fn => (saveErrorHandlers.add(fn), () => saveErrorHandlers.delete(fn));
export const saveHealthy = () => !lastSaveFailed;

/** A failed write means every action after it is being discarded. Say so. */
export function save({ immediate = false } = {}) {
  clearTimeout(saveTimer);
  const write = () => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); lastSaveFailed = false; }
    catch (err) {
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

export function describeSave(obj) {
  const days = Object.keys(obj?.days || {}).sort();
  return {
    name: obj?.profile?.name || '(no name)',
    level: levelFromXp(obj?.xp || 0).level,
    created: obj?.profile?.created || '?',
    days: days.length,
    firstDay: days[0] || null,
    lastDay: days.at(-1) || null,
    handle: obj?.platforms?.cf?.handle || '—',
    solved: (obj?.platforms?.cf?.solved || []).length,
    commits: obj?.stats?.commits || 0,
  };
}

const looksLikeSave = obj =>
  !!obj && typeof obj === 'object' && !Array.isArray(obj)
  && typeof obj.profile === 'object' && obj.profile !== null
  && ('xp' in obj);

export function importSave(text) {
  let obj;
  try { obj = JSON.parse(text); }
  catch { return { ok:false, error:'That is not valid JSON. Paste the whole file, braces included.' }; }
  if (!looksLikeSave(obj)) return { ok:false, error:'That JSON is not a Codify backup.' };

  try { localStorage.setItem(BACKUP_KEY, JSON.stringify(S)); } catch { /* no room for undo */ }

  const fresh = freshSave();
  const summary = describeSave(obj);
  Object.keys(S).forEach(k => delete S[k]);
  Object.assign(S, fresh, obj, {
    profile:   { ...fresh.profile,   ...(obj.profile   || {}) },
    streak:    { ...fresh.streak,    ...(obj.streak    || {}) },
    stats:     { ...fresh.stats,     ...(obj.stats     || {}) },
    settings:  { ...fresh.settings,  ...(obj.settings  || {}) },
    credited:  { ...fresh.credited,  ...(obj.credited  || {}) },
    contests:  { ...fresh.contests,  ...(obj.contests  || {}) },
    platforms: {
      cf: { ...fresh.platforms.cf, ...(obj.platforms?.cf || {}) },
      gh: { ...fresh.platforms.gh, ...(obj.platforms?.gh || {}) },
    },
  });
  save({ immediate: true });
  emit('import', { summary });
  return { ok:true, summary };
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

/* ------------------------------- event bus -------------------------------- */

const listeners = new Set();
export const on = fn => (listeners.add(fn), () => listeners.delete(fn));
export function emit(type, detail) { save(); listeners.forEach(fn => fn(type, detail)); }

/* -------------------------------- selectors ------------------------------- */

export const today = () => dayKey();

export function getDay(key = today()) {
  if (!S.days[key]) S.days[key] = emptyDay();
  const d = S.days[key];
  for (const k of ['focus', 'notes', 'claimed']) if (!Array.isArray(d[k])) d[k] = [];
  return d;
}

export const progress = () => levelFromXp(S.xp);
export const gearBonus = () => lootBonus(S.loot);

export const solvedList = () => S.platforms.cf.solved || [];
export const pushList = () => S.platforms.gh.pushes || [];
export const isLinked = () => !!S.platforms.cf.handle;

/** Verified solves on a given day. */
export const solvesOn = (key = today()) => solvedList().filter(s => s.day === key);
export const pushesOn = (key = today()) => pushList().filter(p => p.day === key);
export const commitsOn = (key = today()) => pushesOn(key).reduce((n, p) => n + p.commits, 0);

/** Everything a day adds up to, verified and unverified kept apart. */
export function dayTotals(key = today()) {
  const d = getDay(key);
  const solves = solvesOn(key);
  const focus = d.focus || [];
  return {
    solved: solves.length,
    ratedSolved: solves.filter(s => s.rating != null).length,
    bestRating: solves.reduce((n, s) => Math.max(n, s.rating || 0), 0),
    tags: new Set(solves.flatMap(s => s.tags || [])).size,
    commits: commitsOn(key),
    pushes: pushesOn(key).length,
    minutes: focus.reduce((n, e) => n + (e.minutes || 0), 0),
    verifiedMinutes: focus.filter(e => e.verified).reduce((n, e) => n + (e.minutes || 0), 0),
    sessions: focus.length,
    notes: (d.notes || []).length,
  };
}

export const quests = (key = today()) => dailyQuests(key, progress().level, dayTotals(key));

/* --------------------------------- the tree ------------------------------- */

export const treeProgress = () => TOPICS.map(t => topicProgress(t, solvedList()));

export function topicStatus(id) {
  const t = topicById(id);
  return t ? topicProgress(t, solvedList()) : null;
}

/**
 * Days since the most recent solve carrying this tag.
 *
 * This replaces the forgetting model that used to live here. That model invented
 * its own constants and then checked itself against tests you graded yourself —
 * two guesses agreeing with each other. "You last solved a graph problem 74 days
 * ago" is not a model at all. It is a date, from a judge, and it is the only
 * honest thing this app can say about what has gone stale.
 */
export function staleness(topicId) {
  const t = topicById(topicId);
  if (!t) return null;
  const mine = solvedList().filter(s => (s.tags || []).includes(t.cf));
  if (!mine.length) return { never: true, days: null, last: null };
  const last = mine.reduce((a, b) => (a.at > b.at ? a : b));
  return { never: false, days: daysBetween(last.day, today()), last };
}

/** Stalest first: topics you have touched, ordered by how long ago. */
export function rustiest(limit = 5) {
  return TOPICS
    .map(t => ({ topic: t, ...staleness(t.id) }))
    .filter(x => !x.never)
    .sort((a, b) => b.days - a.days)
    .slice(0, limit);
}

/* --------------------------------- history -------------------------------- */

export function historySeries(n = 30) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const t = dayTotals(key);
    out.push({ key, date: d, ...t, logged: t.solved > 0 || t.commits > 0 || t.minutes > 0 });
  }
  return out;
}

export function statsSnapshot() {
  const tree = treeProgress();
  return {
    ...S.stats,
    level: progress().level,
    bestStreak: S.streak.best,
    tiersCleared: tree.reduce((n, t) => n + t.cleared, 0),
    contestsWon: S.stats.contestsWon || 0,
    topicsStarted: tree.filter(t => t.total > 0).length,
    topicsMaxed: tree.filter(t => t.cleared === TIERS.length).length,
    linked: isLinked() ? 1 : 0,
  };
}

/* --------------------------------- rewards -------------------------------- */

export function award(rawXp, coins = 0, reason = '') {
  const bonus = gearBonus();
  const xp = Math.round(rawXp * bonus);
  const before = progress().level;
  S.xp += xp; S.coins += coins; S.stats.xpEarned += xp;
  const after = progress().level;

  const levelUps = [];
  for (let l = before + 1; l <= after; l++) {
    levelUps.push(l);
    S.coins += 40 * l;
    if (l % 5 === 0) S.streak.freezes += 1;
  }

  const unlocked = newlyEarned(statsSnapshot(), S.earned);
  for (const a of unlocked) { S.earned[a.id] = today(); S.xp += a.xp; S.stats.xpEarned += a.xp; }
  return { xp, coins, reason, levelUps, achievements: unlocked, gearBonus: bonus > 1 ? bonus : null };
}

export function checkAchievements() {
  const unlocked = newlyEarned(statsSnapshot(), S.earned);
  for (const a of unlocked) { S.earned[a.id] = today(); S.xp += a.xp; S.stats.xpEarned += a.xp; }
  return unlocked;
}

/** What one accepted problem is worth. Difficulty is the judge's rating. */
export const solveXp = rating => (rating == null ? 20 : Math.round(20 + Math.pow(rating / 100, 1.6)));
export const solveCoins = rating => (rating == null ? 5 : Math.round(5 + rating / 60));

/* --------------------------------- streak --------------------------------- */

/** A day counts when something verifiable happened on it. */
export const dayIsActive = (key = today()) => {
  const t = dayTotals(key);
  return t.solved >= 1 || t.commits >= 1 || t.verifiedMinutes >= 20;
};

export function touchStreak(key = today()) {
  if (key !== today() || !dayIsActive(key)) return;
  const st = S.streak, t = today();
  if (st.lastActive === t) return;
  const gap = st.lastActive ? daysBetween(st.lastActive, t) : 1;
  if (gap === 1 || !st.lastActive) st.current += 1;
  else if (gap > 1 && st.freezes > 0 && gap - 1 <= st.freezes) { st.freezes -= (gap - 1); st.current += 1; }
  else st.current = 1;
  st.lastActive = t;
  st.best = Math.max(st.best, st.current);
}

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

/* ------------------------------ platform sync ----------------------------- */

/**
 * Fold a fetched solve list into the save and pay for what is new.
 *
 * Pure with respect to the network: the caller does the fetching, this does the
 * accounting. That is what lets the whole thing be tested without a socket.
 *
 * Returns a summary of what was newly credited.
 */
export function applySolves(solved) {
  const before = treeProgress();
  const clearedBefore = new Set();
  before.forEach(p => p.tiers.forEach(t => { if (t.cleared) clearedBefore.add(`${p.topic.id}:${t.n}`); }));

  S.platforms.cf.solved = solved;
  S.platforms.cf.syncedAt = Date.now();

  let xp = 0, coins = 0;
  const fresh = [];
  for (const s of solved) {
    if (S.credited.problems[s.key]) continue;
    S.credited.problems[s.key] = s.day;
    fresh.push(s);
    xp += solveXp(s.rating);
    coins += solveCoins(s.rating);
    S.stats.solved += 1;
    if (s.rating != null) {
      S.stats.ratedSolved += 1;
      S.stats.bestRating = Math.max(S.stats.bestRating, s.rating);
    }
  }

  const newTiers = [];
  for (const p of treeProgress()) {
    for (const t of p.tiers) {
      const id = `${p.topic.id}:${t.n}`;
      if (!t.cleared || clearedBefore.has(id) || S.credited.tiers[id]) continue;
      S.credited.tiers[id] = today();
      newTiers.push({ topic: p.topic, tier: t });
      xp += tierXp(t);
      coins += tierCoins(t);
      S.stats.tiersCleared += 1;
    }
  }

  // One drop per sync that actually found something, so gear tracks real work.
  const drop = fresh.length ? rollLoot({ chance: Math.min(0.7, 0.18 * fresh.length) }) : null;
  if (drop) S.loot[drop.id] = (S.loot[drop.id] || 0) + 1;

  const reward = (xp || coins) ? award(xp, coins, 'Codeforces sync') : null;
  touchStreak();
  emit('sync', { source:'cf', fresh, newTiers, reward, drop });
  return { fresh, newTiers, reward, drop };
}

export function applyPushes(pushes) {
  S.platforms.gh.pushes = pushes;
  S.platforms.gh.syncedAt = Date.now();

  let xp = 0, coins = 0, commits = 0;
  const fresh = [];
  for (const p of pushes) {
    if (S.credited.pushes[p.id]) continue;
    S.credited.pushes[p.id] = p.day;
    fresh.push(p);
    commits += p.commits;
    S.stats.commits += p.commits;
    S.stats.pushes += 1;
    xp += 6 * p.commits;
    coins += 2 * p.commits;
  }

  const reward = (xp || coins) ? award(xp, coins, 'GitHub sync') : null;
  touchStreak();
  emit('sync', { source:'gh', fresh, commits, reward });
  return { fresh, commits, reward };
}

export function linkCodeforces({ handle, rating, rank }) {
  Object.assign(S.platforms.cf, { handle, rating, rank, error:'' });
  emit('profile');
}
export function linkGithub({ login, avatar }) {
  Object.assign(S.platforms.gh, { user: login, avatar, error:'' });
  emit('profile');
}
export function unlinkCodeforces() {
  Object.assign(S.platforms.cf, { handle:'', rating:null, rank:null, solved:[], syncedAt:0 });
  emit('profile');
}
export function unlinkGithub() {
  Object.assign(S.platforms.gh, { user:'', avatar:null, pushes:[], syncedAt:0 });
  emit('profile');
}

/* -------------------------------- the log --------------------------------- */

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`);

/**
 * A practice session the app timed itself.
 *
 * `verified` is true only when the app held the clock. A hand-typed duration is
 * recorded and shown, but pays nothing — see the note at the top of this file.
 */
export function logSession({ minutes, topic = null, note = '', verified = false }, key = today()) {
  const m = Math.max(1, Math.min(600, Math.round(+minutes || 0)));
  const entry = { uid: uid(), minutes: m, topic, note: String(note || '').slice(0, 300),
                  verified: !!verified, ts: Date.now() };
  getDay(key).focus.push(entry);
  S.stats.sessions += 1;
  S.stats.focusMinutes += m;
  if (entry.verified) S.stats.verifiedMinutes += m;

  const reward = entry.verified ? award(Math.round(m * 1.2), Math.round(m * 0.4), 'Timed session') : null;
  touchStreak(key);
  emit('session', { entry, reward });
  return reward;
}

export function removeSession(id, key = today()) {
  const d = getDay(key);
  const e = d.focus.find(x => x.uid === id);
  if (!e) return false;
  d.focus = d.focus.filter(x => x.uid !== id);
  S.stats.sessions = Math.max(0, S.stats.sessions - 1);
  S.stats.focusMinutes = Math.max(0, S.stats.focusMinutes - e.minutes);
  if (e.verified) S.stats.verifiedMinutes = Math.max(0, S.stats.verifiedMinutes - e.minutes);
  emit('session', {});
  return true;
}

/** An unverified note — a LeetCode problem, a chapter read. Kept, never paid. */
export function logNote({ text, source = 'note' }, key = today()) {
  const entry = { uid: uid(), text: String(text || '').slice(0, 300), source, ts: Date.now() };
  getDay(key).notes.push(entry);
  emit('note', { entry });
  return entry;
}

export function removeNote(id, key = today()) {
  const d = getDay(key);
  d.notes = d.notes.filter(n => n.uid !== id);
  emit('note', {});
}

/* --------------------------------- quests --------------------------------- */

export function claimQuest(questId, key = today()) {
  const d = getDay(key);
  if (d.claimed.includes(questId)) return null;
  const q = quests(key).find(x => x.id === questId);
  if (!q || !q.done) return null;
  d.claimed.push(questId);
  S.stats.quests += 1;
  const r = award(q.xp, q.coins, q.name);
  emit('quest', { quest: q, reward: r });
  return r;
}

/* -------------------------------- contests -------------------------------- */

/**
 * Start the clock. Everything already solved is recorded at this moment, so a
 * problem you finished last week cannot be counted towards the run.
 */
export function startContest(id) {
  const contest = contestById(id);
  if (!contest || S.active) return null;
  S.active = { id, startedAt: Date.now(), known: solvedList().map(s => s.key) };
  S.stats.contestsRun += 1;
  emit('contest', { started: contest });
  return S.active;
}

/** How the running contest currently stands. Null when none is running. */
export function activeContest() {
  if (!S.active) return null;
  const contest = contestById(S.active.id);
  if (!contest) return null;
  return {
    contest,
    startedAt: S.active.startedAt,
    ...settle(contest, S.active.startedAt, solvedList(), new Set(S.active.known)),
  };
}

/** Bank the running contest, won or lost. */
export function finishContest() {
  const live = activeContest();
  if (!live) return null;

  const { contest } = live;
  const prev = S.contests[contest.id] || { won:false, attempts:0, best:0 };
  S.contests[contest.id] = {
    won: prev.won || live.won,
    attempts: prev.attempts + 1,
    best: Math.max(prev.best, live.solved),
    date: live.won ? today() : prev.date,
  };
  if (live.won && !prev.won) S.stats.contestsWon += 1;

  const { xp, coins } = contestReward(contest, live);
  const reward = (xp || coins) ? award(xp, coins, contest.name) : null;
  const drop = live.won ? rollLoot({ minRarity: 'rare' }) : null;
  if (drop) S.loot[drop.id] = (S.loot[drop.id] || 0) + 1;

  S.active = null;
  touchStreak();
  emit('contest', { finished: contest, result: live, reward, drop });
  return { contest, result: live, reward, drop };
}

export function abandonContest() {
  if (!S.active) return false;
  S.active = null;
  emit('contest', {});
  return true;
}

/* ---------------------------------- shop ---------------------------------- */

export function buyTheme(id) {
  const t = THEMES.find(x => x.id === id);
  if (!t || ownsTheme(id) || S.coins < t.cost) return false;
  S.coins -= t.cost; S.owned.push(id); S.profile.theme = id;
  applyTheme(); emit('shop', { theme: t });
  return true;
}
export function selectTheme(id) {
  if (!ownsTheme(id)) return false;
  S.profile.theme = id; applyTheme(); emit('shop', {});
  return true;
}
export function buyFreeze(cost = 200) {
  if (S.coins < cost) return false;
  S.coins -= cost; S.streak.freezes += 1; emit('shop', { freeze:true });
  return true;
}
export function saveProfile(patch) { Object.assign(S.profile, patch); applyTheme(); emit('profile'); }

export const ACHIEVEMENT_LIST = ACHIEVEMENTS;
export { TOPICS, TIERS, PATHS };
