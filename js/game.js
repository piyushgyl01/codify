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

/* ------------------------------ skill levels ------------------------------ */

/**
 * Every robotics skill has a level from 1 to 10. The level sets how hard its
 * round is: more questions and less time on each as it climbs.
 *
 * After a round:  every answer right  → up a level, and it comes back later
 *                 one wrong           → same level, back tomorrow
 *                 two or more wrong   → down a level, back tomorrow
 *
 * So a skill you know gets harder until it is automatic, and a skill you do
 * not know keeps coming back until it is. Running out of time counts as wrong.
 */
export const MAX_LEVEL = 10;

/** [questions, seconds for a typed number, seconds for a choice], by level. */
export const LEVELS = [
  null,
  [2, 180, 60], [3, 150, 50], [3, 120, 40], [4, 105, 35], [4, 90, 30],
  [5, 80, 26],  [5, 70, 22],  [6, 60, 20],  [6, 52, 17],  [7, 45, 15],
];

/** Days until a skill comes back after a clean round at each level. */
export const GAPS = [0, 1, 1, 2, 2, 3, 4, 5, 7, 9, 14];

const clampLevel = l => Math.max(1, Math.min(MAX_LEVEL, l));

/** A skill's level. 0 means not started. Older saves stored a Leitner box, which maps across. */
export const levelOf = e => (e ? (e.level ?? e.box ?? 0) : 0);

export function roundFor(level) {
  const [n, num, mc] = LEVELS[clampLevel(level || 1)];
  return { n, secs: { num, mc } };
}

/**
 * Score one round of a skill. `asked` and `right` count answers; `secs` is the
 * total time the answers took. Returns the new entry and which way it moved.
 */
export function scoreRound(entry, { asked, right, secs = 0 }, today) {
  const at = clampLevel(levelOf(entry));
  const miss = asked - right;
  const move = miss === 0 ? 1 : miss === 1 ? 0 : -1;
  const e = {
    seen: 0, right: 0, wrong: 0, hist: [], ...(entry || {}),
  };
  delete e.box;
  e.level = clampLevel(at + move);
  e.best = Math.max(e.best || levelOf(entry), e.level);
  e.seen += asked; e.right += right; e.wrong += miss;
  e.last = today;
  e.due = addDays(today, move > 0 ? GAPS[at] : 1);
  e.hist = [...(e.hist || []), { day: today, level: at, asked, right, secs: Math.round(secs) }].slice(-12);
  return { entry: e, from: levelOf(entry), at, to: e.level, move };
}

/** The last round played, if any. */
export const lastRound = e => e?.hist?.length ? e.hist[e.hist.length - 1] : null;

export const isDue = (entry, today) => levelOf(entry) >= 1 && !!entry.due && entry.due <= today;

/**
 * Which started skills to bring back today: the most overdue first, then the
 * weakest. Fills a question budget, so the check grows as the plan does.
 */
export function pickReviews(pool, state, today, budget, skip = []) {
  const due = pool.filter(id => !skip.includes(id) && isDue(state[id], today))
    .sort((a, b) => state[a].due.localeCompare(state[b].due) || levelOf(state[a]) - levelOf(state[b]));
  const out = [];
  let used = 0;
  for (const id of due) {
    const n = roundFor(levelOf(state[id])).n;
    if (out.length && used + n > budget) continue;
    out.push(id); used += n;
    if (used >= budget) break;
  }
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
