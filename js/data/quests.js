/**
 * Daily quests — three a day, drawn deterministically from the date.
 *
 * Deterministic matters: the same day always produces the same three quests, so
 * they survive a reload, a second device and a timezone argument. They are drawn
 * one per bucket rather than three from one pool, so a day can never roll three
 * problem quests and leave you with nothing to do but grind LeetCode.
 *
 * Goals scale with level but are capped at +50% of the base, because a quest you
 * cannot finish in one day is not a quest, it is a reminder that you are behind.
 */

export const BUCKETS = ['practice', 'problem', 'wild'];

export const QUEST_POOL = [
  /* ------------------------------- practice ------------------------------- */
  { id:'q-min-45',   bucket:'practice', metric:'minutes',      base:45,  step:5,  xp:70,  coins:20, tab:'log',
    name:'Put the hours in',   unit:'min',  hint:'Any mode counts. Log it on the Log tab.' },
  { id:'q-eff-40',   bucket:'practice', metric:'effMinutes',   base:40,  step:5,  xp:90,  coins:26, tab:'log',
    name:'Effective minutes',  unit:'min',  hint:'Weighted by mode — an hour of video is 21 effective minutes.' },
  { id:'q-build-30', bucket:'practice', metric:'buildMinutes', base:30,  step:5,  xp:100, coins:30, tab:'log',
    name:'Build something',    unit:'min',  hint:'Build mode only. Reading about it does not count.' },
  { id:'q-deep-1',   bucket:'practice', metric:'deepSessions', base:1,   step:0,  xp:110, coins:32, tab:'train',
    name:'One deep block',     unit:'block',hint:'A single unbroken session of 45 minutes or more.' },
  { id:'q-drill-1',  bucket:'practice', metric:'drills',       base:1,   step:0,  xp:85,  coins:25, tab:'train',
    name:'Run a drill',        unit:'drill',hint:'Any drill from the Train tab, finished.' },
  { id:'q-deliberate',bucket:'practice',metric:'deliberatePct',base:60,  step:3,  xp:95,  coins:28, tab:'log',
    name:'Mostly deliberate',  unit:'%',    hint:'At least this share of today in Build or Drill.' },
  { id:'q-paths-2',  bucket:'practice', metric:'pathsTouched', base:2,   step:0,  xp:80,  coins:24, tab:'log',
    name:'Two fronts',         unit:'paths',hint:'Practise on two different paths today.' },
  { id:'q-sessions-3',bucket:'practice',metric:'sessions',     base:3,   step:0,  xp:75,  coins:22, tab:'log',
    name:'Three sittings',     unit:'logs', hint:'Three separate logged sessions.' },

  /* -------------------------------- problem ------------------------------- */
  { id:'q-solve-2',  bucket:'problem', metric:'solved',        base:2,   step:1,  xp:80,  coins:24, tab:'log',
    name:'Solve two',          unit:'solved', hint:'Log them under Problems.' },
  { id:'q-nohint-1', bucket:'problem', metric:'solvedNoHint',  base:1,   step:1,  xp:110, coins:32, tab:'log',
    name:'Cold solve',         unit:'solved', hint:'One problem start to finish with no hint and no solution peeked at.' },
  { id:'q-medium-2', bucket:'problem', metric:'mediumSolved',  base:2,   step:1,  xp:120, coins:34, tab:'log',
    name:'Two mediums',        unit:'solved', hint:'Medium difficulty. The bread and butter.' },
  { id:'q-hard-1',   bucket:'problem', metric:'hardSolved',    base:1,   step:0,  xp:180, coins:52, tab:'log',
    name:'One hard',           unit:'solved', hint:'A hard problem, solved. Hints allowed — finishing is the point.' },
  { id:'q-patterns-2',bucket:'problem',metric:'patterns',      base:2,   step:1,  xp:100, coins:30, tab:'log',
    name:'Two patterns',       unit:'patterns', hint:'Problems from two different patterns — variety beats volume.' },
  { id:'q-attempt-3',bucket:'problem', metric:'problems',      base:3,   step:1,  xp:85,  coins:25, tab:'log',
    name:'Three attempts',     unit:'logged', hint:'Attempts count even when you did not get there.' },
  { id:'q-neglected',bucket:'problem', metric:'neglectedPattern', base:1,step:0,  xp:150, coins:44, tab:'log',
    name:'Face the gap',       unit:'solved', hint:'Solve one problem in your least-practised pattern.' },

  /* --------------------------------- wild --------------------------------- */
  { id:'q-retest-1', bucket:'wild', metric:'retests',      base:1, step:0, xp:120, coins:34, tab:'skills',
    name:'Clear a retest',     unit:'retest', hint:'A skill is due. Re-run its task and log honestly.' },
  { id:'q-retest-2', bucket:'wild', metric:'retests',      base:2, step:0, xp:190, coins:55, tab:'skills',
    name:'Clear two retests',  unit:'retests',hint:'Two due skills, re-proven today.' },
  { id:'q-skill-1',  bucket:'wild', metric:'skillsClaimed',base:1, step:0, xp:170, coins:50, tab:'skills',
    name:'Claim a node',       unit:'node',   hint:'Any available node on the tree, task actually done.' },
  { id:'q-ship-1',   bucket:'wild', metric:'ships',        base:1, step:0, xp:130, coins:38, tab:'log',
    name:'Ship it',            unit:'ship',   hint:'A commit, a PR, a release — anything that left your machine.' },
  { id:'q-commit-3', bucket:'wild', metric:'commits',      base:3, step:1, xp:110, coins:32, tab:'log',
    name:'Three commits',      unit:'commits',hint:'Small commits are still commits.' },
  { id:'q-pr-1',     bucket:'wild', metric:'prs',          base:1, step:0, xp:160, coins:46, tab:'log',
    name:'Open a pull request',unit:'PR',     hint:'Ask a human to look at something you wrote.' },
  { id:'q-read-20',  bucket:'wild', metric:'readMinutes',  base:20,step:5, xp:70,  coins:20, tab:'log',
    name:'Read the source',    unit:'min',    hint:'Docs, papers, or somebody else code. Read mode.' },
  { id:'q-notes',    bucket:'wild', metric:'notedSessions',base:1, step:0, xp:90,  coins:26, tab:'log',
    name:'Write it down',      unit:'note',   hint:'Log a session with a note saying what you actually learned.' },
  { id:'q-gauntlet', bucket:'wild', metric:'gauntletAttempts', base:1, step:0, xp:220, coins:64, tab:'train',
    name:'Enter a gauntlet',   unit:'attempt',hint:'Win or lose — showing up is the quest.' },
];

/* ---------------------------- deterministic draw ---------------------------- */

/** FNV-1a. Small, stable, and identical on every device — which is the point. */
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Above this, a percentage quest stops being a stretch and becomes a trap. */
export const MAX_PERCENT_GOAL = 80;

/**
 * Scale a goal with level, never past +50% of the base.
 *
 * A percentage metric is capped harder. The deliberate-share quest reaches 90%
 * on the raw curve, and a day that is 90% Build and Drill is a day with almost
 * no room to read documentation or a paper — which is not a better day, just a
 * narrower one. Eighty is demanding and still leaves an hour in three for input.
 */
export function goalFor(quest, level) {
  const raw = quest.base + quest.step * Math.floor(Math.max(0, level - 1) / 3);
  const capped = Math.min(raw, Math.round(quest.base * 1.5));
  return quest.unit === '%' ? Math.min(MAX_PERCENT_GOAL, capped) : capped;
}

/** The three quests for a date, with their goals resolved. */
export function questsForDay(dateKey, level = 1) {
  return BUCKETS.map((bucket, i) => {
    const pool = QUEST_POOL.filter(q => q.bucket === bucket);
    const pick = pool[hash(`${dateKey}:${bucket}:${i}`) % pool.length];
    return { ...pick, goal: goalFor(pick, level) };
  });
}
