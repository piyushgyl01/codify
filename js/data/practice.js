/**
 * The vocabulary of the three logs: how practice is classified, how problems are
 * tagged, and what counts as shipping.
 *
 * The weights below are the most opinionated numbers in the app, so they are
 * stated plainly rather than buried: an hour of video does not move you as far
 * as an hour of building, and an app that adds them up as equal will happily
 * congratulate you through a year of tutorials. The exact ratios are a judgement
 * call, not a measurement — no study hands you a constant here. What matters is
 * that the ordering is right and that the discount is visible, because the whole
 * point is to make passive hours feel like what they are.
 *
 * They are deliberately not user-editable. A dial that lets you decide your own
 * video hours count double is a dial that removes the only uncomfortable number
 * on the screen.
 */

export const MODES = [
  { id:'build', name:'Build', icon:'⚒', weight:1.00, color:'var(--mode-build)',
    blurb:'Writing code that does something real — a project, a feature, a fix.',
    hint:'The only mode where the thing you make outlives the session.' },
  { id:'drill', name:'Drill', icon:'◎', weight:0.90, color:'var(--mode-drill)',
    blurb:'Problems, katas and exercises with a known answer.',
    hint:'Nearly as good as building, and much easier to schedule.' },
  { id:'read',  name:'Read',  icon:'▤', weight:0.65, color:'var(--mode-read)',
    blurb:'Docs, papers, and other people’s source.',
    hint:'Input, not output. Pairs well with building the same day.' },
  { id:'watch', name:'Watch', icon:'▶', weight:0.35, color:'var(--mode-watch)',
    blurb:'Video courses, conference talks, streams.',
    hint:'The easiest hour to spend and the least to show for it afterwards.' },
];

export const modeFor = id => MODES.find(m => m.id === id) || MODES[0];
export const modeWeight = id => modeFor(id).weight;

/** Build and Drill are the two that produce something you can be wrong about. */
export const DELIBERATE = ['build', 'drill'];
export const isDeliberate = id => DELIBERATE.includes(id);

/** Minutes discounted by what kind of practice they were. */
export const effectiveMinutes = entry => Math.round((entry.minutes || 0) * modeWeight(entry.mode));

/* ------------------------------- problems -------------------------------- */

export const DIFFICULTIES = [
  { id:'easy',   name:'Easy',   xp:18, coins:4,  color:'var(--good)', par:12 },
  { id:'medium', name:'Medium', xp:42, coins:10, color:'var(--warn)', par:28 },
  { id:'hard',   name:'Hard',   xp:85, coins:22, color:'var(--bad)',  par:50 },
];
export const difficultyFor = id => DIFFICULTIES.find(d => d.id === id) || DIFFICULTIES[1];

/**
 * Patterns a problem can be filed under. These map onto the `algo` path, plus a
 * few that only show up in practice sets. Coverage across this list is what the
 * dashboard reports — the pattern you never pick is the pattern that ends you.
 */
export const PATTERNS = [
  { id:'arrays',    name:'Arrays & Strings' },
  { id:'hashing',   name:'Hashing' },
  { id:'twoptr',    name:'Two Pointers' },
  { id:'window',    name:'Sliding Window' },
  { id:'bsearch',   name:'Binary Search' },
  { id:'sorting',   name:'Sorting' },
  { id:'stack',     name:'Stack & Queue' },
  { id:'linked',    name:'Linked List' },
  { id:'trees',     name:'Trees' },
  { id:'heaps',     name:'Heaps & Priority' },
  { id:'graphs',    name:'Graphs' },
  { id:'backtrack', name:'Backtracking' },
  { id:'dp',        name:'Dynamic Programming' },
  { id:'greedy',    name:'Greedy' },
  { id:'bits',      name:'Bit Manipulation' },
  { id:'math',      name:'Math & Geometry' },
  { id:'design',    name:'Design & Simulation' },
  { id:'sysdesign', name:'System Design' },
];
export const patternFor = id => PATTERNS.find(p => p.id === id) || null;
export const patternName = id => patternFor(id)?.name || 'Unfiled';

/**
 * What a solved problem is worth.
 *
 * A hint is not a failure — it is how you learn — but it is not the same as
 * solving it cold, so it is worth less. An unsolved attempt still pays, because
 * an app that pays nothing for a hard problem you lost an hour to is an app that
 * teaches you to only attempt easy ones.
 */
export function problemReward({ difficulty, solved, hinted, minutes }) {
  const d = difficultyFor(difficulty);
  if (!solved) return { xp: Math.round(d.xp * 0.3), coins: Math.round(d.coins * 0.25) };
  const hintFactor = hinted ? 0.6 : 1;
  // Beating par is worth a little extra, capped so speed cannot dominate volume.
  const speed = minutes > 0 ? Math.min(1.25, Math.max(1, d.par / minutes)) : 1;
  return {
    xp: Math.round(d.xp * hintFactor * speed),
    coins: Math.round(d.coins * hintFactor),
  };
}

/* --------------------------------- ships --------------------------------- */

/**
 * Shipping is the third log and the only one measured in artefacts rather than
 * time. It is deliberately coarse: the point is whether things leave your
 * machine, not a precise commit count.
 */
export const SHIP_KINDS = [
  { id:'commit',  name:'Commits',  icon:'●', xp:8,   coins:2,  color:'var(--good)',
    blurb:'Work that left your editor and entered history.', counted:true },
  { id:'pr',      name:'Pull request', icon:'⇄', xp:45, coins:12, color:'var(--info)',
    blurb:'Work you asked another human to look at.', counted:true },
  { id:'release', name:'Release',  icon:'↑', xp:120, coins:35, color:'var(--violet)',
    blurb:'Something users can now get at.', counted:false },
  { id:'project', name:'Project',  icon:'★', xp:400, coins:120, color:'var(--warn)',
    blurb:'A whole thing, finished, with a URL or a README.', counted:false },
];
export const shipKindFor = id => SHIP_KINDS.find(k => k.id === id) || SHIP_KINDS[0];

export const shipReward = (kind, count = 1) => {
  const k = shipKindFor(kind);
  const n = Math.max(1, Math.min(200, Math.round(count)));
  return { xp: k.xp * n, coins: k.coins * n };
};

/* -------------------------------- sources -------------------------------- */

/** Where a session happened. Purely descriptive, but it makes the log readable. */
export const CONTEXTS = [
  { id:'work',    name:'Work',     icon:'■' },
  { id:'side',    name:'Side project', icon:'◆' },
  { id:'study',   name:'Study',    icon:'▲' },
  { id:'prep',    name:'Interview prep', icon:'●' },
];
export const contextFor = id => CONTEXTS.find(c => c.id === id) || null;
