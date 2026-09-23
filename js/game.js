/**
 * Pure game maths shared by every track. No DOM, no storage, no network — each
 * function is a function of its arguments, which is what lets the tests cover it.
 */

/* --------------------------------- dates ---------------------------------- */

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function daysBetween(aKey, bKey) {
  const a = new Date(aKey + 'T00:00:00'), b = new Date(bKey + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

export function addDays(key, n) {
  const d = new Date(key + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

/* ------------------------------- levelling -------------------------------- */

/**
 * One curve for the whole character. Tuned so six honest months on a single
 * track land around level 45; two tracks get there sooner, which is the point
 * of doing more.
 */
export const xpToNext = level => Math.round(50 * Math.pow(level, 1.2));

export function xpAtLevel(level) {
  let t = 0;
  for (let i = 1; i < level; i++) t += xpToNext(i);
  return t;
}

export function levelFromXp(xp) {
  let level = 1, rem = Math.max(0, xp);
  while (rem >= xpToNext(level) && level < 99) { rem -= xpToNext(level); level++; }
  const need = xpToNext(level);
  return { level, into: rem, need, pct: Math.min(100, (rem / need) * 100) };
}

/** A career ladder, since that is roughly what levelling across tech looks like. */
export const RANKS = [
  { at:1,  name:'Newbie',    icon:'🥚', color:'#57514A' },
  { at:5,  name:'Tinkerer',  icon:'🔌', color:'#5EA82E' },
  { at:10, name:'Builder',   icon:'🛠️', color:'#C77A0F' },
  { at:15, name:'Engineer',  icon:'⚙️', color:'#D64524' },
  { at:20, name:'Senior',    icon:'🧭', color:'#1E9AA8' },
  { at:28, name:'Architect', icon:'🏛️', color:'#2B5BD7' },
  { at:36, name:'Principal', icon:'🧠', color:'#8A3FD1' },
  { at:45, name:'Legend',    icon:'🐉', color:'#D6265A' },
];
export const rankFor = level => [...RANKS].reverse().find(r => level >= r.at) || RANKS[0];
export const nextRank = level => RANKS.find(r => r.at > level) || null;

/* ------------------------------ spaced review ----------------------------- */

/**
 * Leitner boxes. A right answer moves a skill up a box and pushes its next
 * review out; a wrong one sends it back to box 1, due tomorrow. A long-standing,
 * well-understood method — every number in it is visible right here.
 */
export const INTERVALS = [0, 1, 2, 4, 8, 16];
export const MAX_BOX = 5;

export function review(entry, correct, today) {
  const e = { box: 0, due: today, seen: 0, right: 0, wrong: 0, last: null, ...(entry || {}) };
  e.seen += 1;
  e.last = today;
  if (correct) { e.right += 1; e.box = Math.min(MAX_BOX, e.box + 1); }
  else         { e.wrong += 1; e.box = 1; }
  e.due = addDays(today, INTERVALS[e.box]);
  return e;
}

export const isDue = (entry, today) => !!entry && entry.box >= 1 && entry.due <= today;

/**
 * Pick a drill: due reviews first, because that is where forgetting happens;
 * then up to two new skills in the order they are introduced; then the rest.
 */
export function pickDrill(pool, state, today, rng = Math.random, size = 5) {
  const due = pool.filter(id => isDue(state[id], today))
    .sort((a, b) => state[a].due.localeCompare(state[b].due) || state[a].box - state[b].box);
  const fresh = pool.filter(id => !state[id] || !state[id].box);
  const out = [];
  const take = (list, k) => { for (const id of list) { if (out.length >= size || k <= 0) break; if (!out.includes(id)) { out.push(id); k--; } } };
  take(due, 3); take(fresh, 2); take(due, size); take(fresh, size);
  if (out.length < size) {
    const rest = pool.filter(id => !out.includes(id))
      .map(id => ({ id, k: (state[id]?.box || 0) + rng() })).sort((a, b) => a.k - b.k).map(x => x.id);
    take(rest, size);
  }
  let i = 0;
  while (out.length < size && pool.length) out.push(pool[i++ % pool.length]);
  return out;
}

/* --------------------------------- combos --------------------------------- */

export const drillCombo = run => Math.min(1.5, 1 + 0.1 * Math.max(0, run - 1));
export const bossCombo  = run => Math.min(1.9, 1 + 0.15 * Math.max(0, run - 1));

/* ----------------------------- shared payouts ----------------------------- */

export const XP = {
  timerPerMin: 1,          // the focus timer, shared by every track
  timerCapFactor: 1.5,     // × the daily focus goal, per day
  commit: 6,               // a public commit, read from GitHub
  levelPurse: 25,          // credits × the level reached
};

/** Achievements newly satisfied by a stats snapshot. */
export const newlyEarned = (list, stats, earned) => list.filter(a => !earned[a.id] && a.check(stats));
