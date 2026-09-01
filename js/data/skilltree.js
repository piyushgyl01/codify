/**
 * The skill tree: real Codeforces tags at rating tiers.
 *
 * There is nothing to hand-grade and nothing to self-report. Codeforces returns
 * a tag list and a rating on every accepted submission, so "three problems
 * tagged `dp` rated 1500 or above" is a fact this app reads rather than a claim
 * you make. Clearing a tier means a real judge accepted real code.
 *
 * A harder problem counts towards every tier below it, which is why a 2100 solve
 * advances five rows at once. That is deliberate: the tiers describe the level
 * you are working at, not a checklist to grind in order.
 *
 * `lc` is a LeetCode tag slug for the same topic. It is a practice link only —
 * LeetCode sends no CORS header, so nothing solved there can be verified from a
 * page with no backend, and the app says so rather than counting it.
 */

/** Rating bands, straight off the Codeforces scale. */
export const TIERS = [
  { n:1, name:'I',   min:800,  max:1199, need:3, label:'Newcomer' },
  { n:2, name:'II',  min:1200, max:1499, need:3, label:'Pupil' },
  { n:3, name:'III', min:1500, max:1799, need:3, label:'Specialist' },
  { n:4, name:'IV',  min:1800, max:2099, need:3, label:'Expert' },
  { n:5, name:'V',   min:2100, max:3500, need:3, label:'Candidate Master' },
];

export const PATHS = [
  { id:'found',  name:'Foundations', short:'Found', icon:'{}', color:'var(--info)',
    blurb:'Writing the thing correctly and quickly, before it gets clever.' },
  { id:'search', name:'Searching',   short:'Search', icon:'->', color:'var(--teal)',
    blurb:'Narrowing a space instead of walking all of it.' },
  { id:'struct', name:'Structures',  short:'Struct', icon:'[]', color:'var(--violet)',
    blurb:'Choosing the container that makes the problem easy.' },
  { id:'graph',  name:'Graphs',      short:'Graph', icon:'<>', color:'var(--pink)',
    blurb:'Where most interview and contest difficulty actually lives.' },
  { id:'dpmath', name:'DP & Maths',  short:'DP', icon:'^^', color:'var(--warn)',
    blurb:'Recurrences, counting, and the number theory that shows up anyway.' },
];

export const pathFor = id => PATHS.find(p => p.id === id) || PATHS[0];

/**
 * `cf` must match a Codeforces tag exactly — it is used both to read your
 * submissions and to query the problem set for something to do next.
 */
export const TOPICS = [
  { id:'implementation', cf:'implementation', lc:'simulation', path:'found',
    name:'Implementation', blurb:'Long statements, fiddly rules, no trick.' },
  { id:'sortings', cf:'sortings', lc:'sorting', path:'found',
    name:'Sorting', blurb:'Sorting first is often the entire solution.' },
  { id:'strings', cf:'strings', lc:'string', path:'found',
    name:'Strings', blurb:'Scanning, matching and building without an O(n²) accident.' },
  { id:'bruteforce', cf:'brute force', lc:'backtracking', path:'found',
    name:'Brute Force', blurb:'Knowing when the search space is small enough to just try it.' },

  { id:'binarysearch', cf:'binary search', lc:'binary-search', path:'search',
    name:'Binary Search', blurb:'On the answer, not just on an array.' },
  { id:'twopointers', cf:'two pointers', lc:'two-pointers', path:'search',
    name:'Two Pointers', blurb:'One pass with a window or a pair of ends.' },
  { id:'greedy', cf:'greedy', lc:'greedy', path:'search',
    name:'Greedy', blurb:'Taking the local best, and being able to argue it is safe.' },

  { id:'datastructures', cf:'data structures', lc:'ordered-set', path:'struct',
    name:'Data Structures', blurb:'Heaps, sets, stacks and the odd segment tree.' },
  { id:'dsu', cf:'dsu', lc:'union-find', path:'struct',
    name:'Union Find', blurb:'Connectivity, merged in almost constant time.' },
  { id:'trees', cf:'trees', lc:'tree', path:'struct',
    name:'Trees', blurb:'Rooting, subtree sums, and depth-first recursion on them.' },

  { id:'graphs', cf:'graphs', lc:'graph', path:'graph',
    name:'Graphs', blurb:'Modelling the problem as nodes and edges in the first place.' },
  { id:'dfs', cf:'dfs and similar', lc:'depth-first-search', path:'graph',
    name:'DFS & BFS', blurb:'Traversal, components, and flood fill.' },
  { id:'shortestpaths', cf:'shortest paths', lc:'shortest-path', path:'graph',
    name:'Shortest Paths', blurb:'Dijkstra, BFS on unweighted graphs, and knowing which applies.' },

  { id:'dp', cf:'dp', lc:'dynamic-programming', path:'dpmath',
    name:'Dynamic Programming', blurb:'Finding the state, then the transition.' },
  { id:'math', cf:'math', lc:'math', path:'dpmath',
    name:'Maths', blurb:'The arithmetic and algebra that hides inside contest problems.' },
  { id:'numbertheory', cf:'number theory', lc:'number-theory', path:'dpmath',
    name:'Number Theory', blurb:'Primes, divisors, modular arithmetic.' },
  { id:'combinatorics', cf:'combinatorics', lc:'combinatorics', path:'dpmath',
    name:'Combinatorics', blurb:'Counting without enumerating.' },
  { id:'bitmasks', cf:'bitmasks', lc:'bit-manipulation', path:'dpmath',
    name:'Bitmasks', blurb:'Subsets as integers, and the DP that rides on them.' },
];

export const topicById = id => TOPICS.find(t => t.id === id) || null;
export const topicsOfPath = path => TOPICS.filter(t => t.path === path);
export const TOPIC_IDS = TOPICS.map(t => t.id);

/** Every tier of every topic — the tree has this many rows in total. */
export const TOTAL_NODES = TOPICS.length * TIERS.length;

export const tierFor = n => TIERS.find(t => t.n === n) || TIERS[0];

/**
 * Progress for one topic against the solved list from Codeforces.
 *
 * A solve counts towards a tier when its rating meets that tier's floor, so a
 * 2100 counts for all five. Unrated problems count for nothing — there is no
 * honest way to place them on the scale.
 */
export function topicProgress(topic, solved) {
  const mine = solved.filter(s => s.rating != null && (s.tags || []).includes(topic.cf));

  const tiers = TIERS.map(t => {
    const hits = mine.filter(s => s.rating >= t.min);
    return {
      ...t,
      solved: hits.length,
      cleared: hits.length >= t.need,
      pct: Math.min(100, (hits.length / t.need) * 100),
      newest: hits.length ? hits.reduce((a, b) => (a.at > b.at ? a : b)) : null,
    };
  });

  const clearedCount = tiers.filter(t => t.cleared).length;
  return {
    topic,
    total: mine.length,
    best: mine.reduce((n, s) => Math.max(n, s.rating), 0),
    tiers,
    cleared: clearedCount,
    // The first tier you have not finished — what to actually go and work on.
    next: tiers.find(t => !t.cleared) || null,
  };
}

/** XP for clearing one tier. Higher bands pay more because they cost more. */
export const tierXp = tier => 120 * tier.n;
export const tierCoins = tier => 35 * tier.n;
