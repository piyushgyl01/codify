/**
 * Daily quests — three a day, drawn deterministically from the date.
 *
 * Every metric here is one the app can check against Codeforces or GitHub. There
 * is deliberately no quest for "read for 30 minutes": a goal you complete by
 * telling the app you completed it is not a goal.
 *
 * One quest per bucket rather than three from one pool, so a day can never roll
 * three problems and leave nothing else to do. Goals scale with level but never
 * past +50% of the base — a quest you cannot finish in a day is a reminder that
 * you are behind, not a quest.
 *
 * Six per bucket rather than four, because four collides often enough that
 * consecutive days visibly repeat. The output bucket deliberately mixes GitHub
 * metrics with solve and timer ones: without that, anyone who has not linked
 * GitHub has one impossible quest every single day.
 */

export const BUCKETS = ['solve', 'depth', 'output'];

export const QUEST_POOL = [
  /* --------------------------------- solve -------------------------------- */
  { id:'q-solve-1',  bucket:'solve', metric:'solved', base:1, step:0, xp:60,  coins:18,
    name:'One a day',        unit:'solved', hint:'One accepted problem. The floor, not the target.' },
  { id:'q-solve-2',  bucket:'solve', metric:'solved', base:2, step:1, xp:90,  coins:26,
    name:'Solve two',        unit:'solved', hint:'Any two accepted problems on Codeforces.' },
  { id:'q-solve-3',  bucket:'solve', metric:'solved', base:3, step:1, xp:140, coins:40,
    name:'Solve three',      unit:'solved', hint:'A proper session rather than a token one.' },
  { id:'q-rated-2',  bucket:'solve', metric:'ratedSolved', base:2, step:1, xp:110, coins:32,
    name:'Two rated',        unit:'solved', hint:'Unrated problems do not count towards this.' },
  { id:'q-rated-3',  bucket:'solve', metric:'ratedSolved', base:3, step:1, xp:150, coins:44,
    name:'Three rated',      unit:'solved', hint:'Three problems that carry a difficulty rating.' },
  { id:'q-sessions', bucket:'solve', metric:'sessions', base:2, step:0, xp:70,  coins:20,
    name:'Two sittings',     unit:'sessions', hint:'Two logged practice sessions today.' },

  /* --------------------------------- depth -------------------------------- */
  { id:'q-tags-2',   bucket:'depth', metric:'tags', base:2, step:1, xp:80,  coins:24,
    name:'Two topics',       unit:'tags', hint:'Solves covering two different Codeforces tags.' },
  { id:'q-tags-3',   bucket:'depth', metric:'tags', base:3, step:1, xp:120, coins:34,
    name:'Three topics',     unit:'tags', hint:'Spread the day across three tags.' },
  { id:'q-rating-1300', bucket:'depth', metric:'bestRating', base:1300, step:0, xp:150, coins:44,
    name:'Reach 1300',       unit:'rating', hint:'Solve something rated 1300 or above today.' },
  { id:'q-rating-1600', bucket:'depth', metric:'bestRating', base:1600, step:0, xp:220, coins:64,
    name:'Reach 1600',       unit:'rating', hint:'Solve something rated 1600 or above today.' },
  { id:'q-rating-1900', bucket:'depth', metric:'bestRating', base:1900, step:0, xp:320, coins:92,
    name:'Reach 1900',       unit:'rating', hint:'One properly hard problem. Worth a whole evening.' },
  { id:'q-minutes',  bucket:'depth', metric:'verifiedMinutes', base:45, step:5, xp:100, coins:28,
    name:'Timed practice',   unit:'min', hint:'Minutes the app timed itself. Typed hours do not count.' },

  /* --------------------------------- output ------------------------------- */
  /* Deliberately not all GitHub: a quest nobody without a linked account can
     ever finish is a quest that makes one third of every day impossible. */
  { id:'q-commits-1', bucket:'output', metric:'commits', base:1, step:0, xp:60,  coins:18,
    name:'Push something',   unit:'commits', hint:'One public commit. Small ones still count.' },
  { id:'q-commits-3', bucket:'output', metric:'commits', base:3, step:1, xp:100, coins:30,
    name:'Three commits',    unit:'commits', hint:'Public pushes, read from GitHub.' },
  { id:'q-push-2',    bucket:'output', metric:'pushes', base:2, step:0, xp:110, coins:32,
    name:'Two pushes',       unit:'pushes', hint:'Two separate pushes, not one big one.' },
  { id:'q-solve-4',   bucket:'output', metric:'solved', base:4, step:1, xp:190, coins:55,
    name:'Four in a day',    unit:'solved', hint:'A heavy day. Usually a contest or a long evening.' },
  { id:'q-minutes-90',bucket:'output', metric:'verifiedMinutes', base:90, step:5, xp:170, coins:48,
    name:'Ninety minutes',   unit:'min', hint:'An hour and a half on the timer.' },
  { id:'q-rated-4',   bucket:'output', metric:'ratedSolved', base:4, step:1, xp:200, coins:58,
    name:'Four rated',       unit:'solved', hint:'Four rated problems in one day.' },
];

/** FNV-1a. Small, stable, and identical on every device — which is the point. */
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

/** A rating goal is a threshold, not a count, so it must not scale with level. */
const isThreshold = q => q.metric === 'bestRating';

export function goalFor(quest, level) {
  if (isThreshold(quest)) return quest.base;
  const raw = quest.base + quest.step * Math.floor(Math.max(0, level - 1) / 3);
  return Math.min(raw, Math.round(quest.base * 1.5));
}

export function questsForDay(dateKey, level = 1) {
  return BUCKETS.map((bucket, i) => {
    const pool = QUEST_POOL.filter(q => q.bucket === bucket);
    const pick = pool[hash(`${dateKey}:${bucket}:${i}`) % pool.length];
    return { ...pick, goal: goalFor(pick, level) };
  });
}
