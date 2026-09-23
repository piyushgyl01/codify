/**
 * Daily quests — three a day, dealt from the date.
 *
 * One is always from the shared focus pool. The other two come from the tracks
 * you have switched on: with two tracks, one from each; with one, both from it;
 * with more, two tracks rotate by date. A track only deals quests once it can be
 * checked — programming quests need a Codeforces handle, shipping quests need a
 * GitHub username — because a quest you cannot possibly finish is not a quest.
 *
 * Every quest reads a number from `ctx`, which state.js builds from things the
 * app measured: judge-accepted solves, graded answers, timed minutes, commits.
 */

const q = (track, pool, id, name, desc, goal, xp, coins, go, value, available) =>
  ({ track, pool, id, name, desc, goal, xp, coins, go, value, available });

export const QUESTS = [
  /* shared: the focus timer and shipping */
  q('core', 'focus', 't45',    'Forty-five',     '45 minutes on the focus timer',        45, 45, 15, 'timer', c => c.day.timerMin),
  q('core', 'focus', 't60',    'An hour',        '60 minutes on the focus timer',        60, 55, 18, 'timer', c => c.day.timerMin),
  q('core', 'focus', 't90',    'Ninety',         '90 minutes on the focus timer',        90, 70, 22, 'timer', c => c.day.timerMin),
  q('core', 'focus', 'tag30',  'On something',   '30 timer minutes tagged to a task',    30, 50, 15, 'timer', c => c.day.timerTagged),
  q('core', 'focus', 'ship1',  'Push something', 'One public commit, read from GitHub',   1, 60, 18, 'hero',  c => c.commits, c => c.github),
  q('core', 'focus', 'ship3',  'Three commits',  'Three public commits today',            3, 90, 28, 'hero',  c => c.commits, c => c.github),

  /* competitive programming */
  q('cp', 'solve', 'solve1', 'One a day',   'One accepted problem on Codeforces',   1, 60,  18, 'cp', c => c.cp.solved),
  q('cp', 'solve', 'solve2', 'Solve two',   'Two accepted problems',                2, 90,  26, 'cp', c => c.cp.solved),
  q('cp', 'solve', 'rated2', 'Two rated',   'Two problems that carry a rating',     2, 110, 32, 'cp', c => c.cp.ratedSolved),
  q('cp', 'solve', 'solve3', 'Solve three', 'A proper session, not a token one',    3, 140, 40, 'cp', c => c.cp.solved),
  q('cp', 'depth', 'tags2',  'Two topics',  'Solves across two different tags',     2, 80,  24, 'cp', c => c.cp.tags),
  q('cp', 'depth', 'tags3',  'Three topics','Solves across three different tags',   3, 120, 34, 'cp', c => c.cp.tags),
  // A rating goal is only dealt when it is within reach of your actual rating.
  q('cp', 'depth', 'r1300',  'Reach 1300',  'Solve something rated 1300+ today', 1300, 150, 44, 'cp', c => c.cp.bestRating, c => (c.rating || 800) + 300 >= 1300),
  q('cp', 'depth', 'r1600',  'Reach 1600',  'Solve something rated 1600+ today', 1600, 220, 64, 'cp', c => c.cp.bestRating, c => (c.rating || 800) + 300 >= 1600),
  q('cp', 'depth', 'r1900',  'Reach 1900',  'Solve something rated 1900+ today', 1900, 320, 92, 'cp', c => c.cp.bestRating, c => (c.rating || 800) + 300 >= 1900),

  /* robotics */
  q('robotics', 'drill',    'four',  'Four of five',     'Score 4+ in today\'s drill',          4,  50, 15, 'drill',    c => c.robo.drill?.score || 0),
  q('robotics', 'drill',    'clean', 'Clean sheet',      'Five from five in today\'s drill',    5,  80, 25, 'drill',    c => c.robo.drill?.score || 0),
  q('robotics', 'drill',    'run3',  'Three in a row',   'Three right answers back to back',    3,  45, 15, 'drill',    c => c.robo.bestRun),
  q('robotics', 'drill',    'ten',   'Ten answered',     'Answer ten robotics questions',       10, 40, 12, 'practice', c => c.robo.answered),
  q('robotics', 'practice', 'prac5', 'Extra reps',       '5 right in practice mode',            5,  50, 15, 'practice', c => c.robo.practiceCorrect),
  q('robotics', 'practice', 'rt10',  'Ten right',        '10 correct robotics answers today',   10, 55, 18, 'practice', c => c.robo.correct),
  q('robotics', 'practice', 'ans15', 'Fifteen answered', 'Answer fifteen robotics questions',   15, 50, 15, 'practice', c => c.robo.answered),
];

/** The pools each track deals from, in order. */
export const TRACK_POOLS = { cp: ['solve', 'depth'], robotics: ['drill', 'practice'] };

/** FNV-1a with a final avalanche, so consecutive dates do not deal alike. */
export function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function dealFrom(track, pool, key, ctx, taken) {
  const list = QUESTS.filter(x => x.track === track && x.pool === pool && !taken.includes(x.id) && (!x.available || x.available(ctx)));
  return list.length ? list[hash(`${key}:${track}:${pool}`) % list.length] : null;
}

/**
 * The day's three quests. `ctx.usable` lists the tracks that are switched on and
 * checkable — the caller decides that, because it knows which accounts exist.
 */
export function questsForDay(key, ctx) {
  const out = [];
  const add = x => { if (x) out.push(x); };
  add(dealFrom('core', 'focus', key, ctx, []));

  const tracks = [...(ctx.usable || [])].filter(t => TRACK_POOLS[t]).sort();
  if (tracks.length >= 2) {
    const start = hash(`${key}:rotate`) % tracks.length;
    for (const t of [tracks[start], tracks[(start + 1) % tracks.length]]) {
      const pools = TRACK_POOLS[t];
      add(dealFrom(t, pools[hash(`${key}:${t}`) % pools.length], key, ctx, out.map(x => x.id)));
    }
  } else if (tracks.length === 1) {
    for (const p of TRACK_POOLS[tracks[0]]) add(dealFrom(tracks[0], p, key, ctx, out.map(x => x.id)));
  }
  while (out.length < 3) {
    const extra = dealFrom('core', 'focus', `${key}:${out.length}`, ctx, out.map(x => x.id));
    if (!extra) break;
    out.push(extra);
  }
  return out;
}
