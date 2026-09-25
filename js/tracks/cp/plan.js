/**
 * The DSA plan: 120 missions, four months, one a day — the same frame as
 * robotics. Each day:
 *
 *   learn    one idea, with links to learn it from
 *   skills   what today's check starts testing (older ones come back on their own)
 *   solve    problems on Codeforces with a tag, at your level for that tag —
 *            the judge decides, and your level goes up 100 each time you clear it
 *
 * Every month closes with a contest instead of a boss fight. Topics are in the
 * order they build on each other: complexity and arrays, then searching, then
 * structures and graphs, then DP and range queries, then strings, maths and
 * contests.
 */
import { numberDays } from '../../learn/plan.js';

/** How many questions a mission's check may use, by month. */
export const checkBudget = month => 6 + 2 * month;

export const MONTHS = [
  { n:1, title:'Foundations: write it right, write it fast', short:'Found', level:'Beginner', icon:'🧱', color:'var(--blue)', contest:'warmup',
    goal:'Complexity, arrays, searching, greedy and the maths toolkit — and a first contest won.' },
  { n:2, title:'Data structures and graphs', short:'Graphs', level:'Beginner+', icon:'🕸️', color:'var(--cyan)', contest:'sprint',
    goal:'Choose the container that makes a problem easy, and model problems as graphs.' },
  { n:3, title:'Dynamic programming and range queries', short:'DP', level:'Intermediate', icon:'🧮', color:'var(--violet)', contest:'ladder',
    goal:'Find the state and the transition, and answer range queries on changing arrays.' },
  { n:4, title:'Strings, maths and contests', short:'Contest', level:'Advanced', icon:'🏆', color:'var(--orange)', contest:'gauntlet',
    goal:'The advanced toolkit, then contest craft — reading, choosing, and finishing under time.' },
];
export const monthByN = n => MONTHS.find(m => m.n === n);

/* ---------------------------------- links --------------------------------- */

const r = (name, url, note = '') => ({ name, url, price: 'free', note });
const CPH = ch => r(`Competitive Programmer's Handbook — ${ch}`, 'https://cses.fi/book/book.pdf', 'Free PDF by Antti Laaksonen');
const CPA = (path, name) => r(`CP-Algorithms: ${name}`, `https://cp-algorithms.com/${path}.html`);
const USACO = (path, name) => r(`USACO Guide: ${name}`, `https://usaco.guide/${path}`);
const EDU = name => r(`Codeforces EDU: ${name}`, 'https://codeforces.com/edu/courses', 'Free course with its own practice problems');
const CSES = r('CSES Problem Set', 'https://cses.fi/problemset/', 'Good practice. Not checked here — only Codeforces is');

/* ---------------------------------- days ---------------------------------- */

/** One day: what to learn, the Codeforces tag to solve (null: any tag), the skills it starts, the links. */
const D = (learn, tag, skills = [], links = [], count = 2) => ({ learn, tag, skills, links, count });
const BOSS = () => ({ learn: 'Contest day.', tag: null, skills: [], links: [], count: 0 });

const DAYS = [
  /* ========================= Month 1 — foundations ========================= */
  // Week 1: complexity, brute force, sorting, prefix sums
  D('Complexity: count the steps, and what 10⁸ a second means for your n', 'implementation', ['bigo', 'ops'],
    [CPH('Time complexity'), USACO('bronze/time-comp', 'Time complexity')]),
  D('Implementation: read the statement twice, then simulate exactly what it says', 'implementation', [], [CPH('Introduction')]),
  D('Brute force: when n is small enough to try everything', 'brute force', ['subsets'],
    [CPH('Complete search'), USACO('bronze/intro-complete', 'Complete search')]),
  D('Sorting: sort first, then scan — and counting inversions', 'sortings', ['inversions'],
    [CPH('Sorting'), USACO('bronze/intro-sorting', 'Introduction to sorting')]),
  D('Prefix sums: any range sum in O(1)', 'implementation', ['prefix'], [USACO('silver/prefix-sums', 'Prefix sums')]),
  D('Difference arrays: many range updates, one pass', 'implementation', ['diffarr'], [USACO('silver/more-prefix-sums', 'More on prefix sums')]),
  D('Strings: scanning, counting characters, palindromes', 'strings', [], [CPH('String algorithms')]),

  // Week 2: searching and greedy
  D('Binary search on a sorted array: lower and upper bound', 'binary search', ['bsearch'],
    [CPA('num_methods/binary_search', 'Binary search'), USACO('silver/binary-search', 'Binary search')]),
  D('Binary search on the answer: find where a yes/no test turns true', 'binary search', [], [EDU('Binary search')]),
  D('Two pointers: pairs in a sorted array', 'two pointers', ['twoptr'], [USACO('silver/two-pointers', 'Two pointers'), EDU('Two pointers method')]),
  D('Sliding windows: the longest or shortest window that fits a condition', 'two pointers', [], [EDU('Two pointers method')]),
  D('Greedy: take the local best, and argue why it is safe', 'greedy', ['intervals'],
    [CPH('Greedy algorithms'), USACO('silver/greedy-sorting', 'Greedy with sorting')]),
  D('Greedy with sorting: scheduling and deadlines', 'greedy', [], [USACO('silver/greedy-sorting', 'Greedy with sorting')]),
  D('Constructive problems: build any answer that meets the conditions', 'constructive algorithms', [], [CSES]),

  // Week 3: the maths toolkit
  D('GCD and LCM with Euclid', 'number theory', ['gcd'], [CPA('algebra/euclid-algorithm', 'Euclidean algorithm')]),
  D('Primes: the sieve, factorising, counting divisors', 'number theory', ['primes'],
    [CPA('algebra/sieve-of-eratosthenes', 'Sieve of Eratosthenes'), CPH('Number theory')]),
  D('Modular arithmetic, and fast exponentiation', 'math', ['modpow'], [CPA('algebra/binary-exp', 'Binary exponentiation')]),
  D('Modular inverses: dividing under a prime modulus', 'number theory', ['modinv'], [CPA('algebra/module-inverse', 'Modular inverse')]),
  D('Bits: AND, OR, XOR, shifts and popcount', 'bitmasks', ['bits'], [CPA('algebra/bit-manipulation', 'Bit manipulation'), CPH('Bit manipulation')]),
  D('XOR tricks: prefix XOR, and pairs that cancel', 'bitmasks', [], [CPH('Bit manipulation')]),
  D('Maths by observation: parity, invariants, small cases first', 'math', [], [USACO('bronze/ad-hoc', 'Ad hoc problems')]),

  // Week 4: putting it together
  D('Backtracking: generating subsets and permutations', 'brute force', [], [CPH('Complete search')]),
  D('Reading constraints: n tells you the complexity you need', 'implementation', [], [CPH('Time complexity')]),
  D('Sorting and binary search together', 'binary search', []),
  D('Two pointers with prefix sums', 'two pointers', []),
  D('Greedy, harder', 'greedy', []),
  D('Number theory, harder', 'number theory', []),
  D('Constructive, harder', 'constructive algorithms', []),
  D('A virtual Div. 3 round under time, then upsolve', null, [], [r('Codeforces contests', 'https://codeforces.com/contests', 'Pick a past Div. 3 and press "Virtual participation"')], 3),
  BOSS(),

  /* =================== Month 2 — data structures and graphs ================== */
  // Week 5: containers
  D('Stacks: brackets, and the next greater element', 'data structures', ['nextgreater'],
    [CPH('Data structures'), CPA('data_structures/stack_queue_modification', 'Minimum stack and queue')]),
  D('Deques: the sliding window maximum', 'data structures', ['slidingmax'], [CPA('data_structures/stack_queue_modification', 'Minimum queue')]),
  D('Maps and sets: counting, lookups, ordered sets', 'data structures', ['freq'], [CPH('Data structures')]),
  D('Hashing pitfalls: why unordered_map can time out, and the fix', 'hashing', [],
    [r('Blowing up unordered_map, and how to stop getting hacked on it', 'https://codeforces.com/blog/entry/62393')]),
  D('Heaps: the k smallest, and merging sorted lists', 'data structures', ['heap'], [CPH('Data structures')]),
  D('A priority queue inside a greedy', 'greedy', []),
  D('Picking the container that makes the problem easy', 'data structures', []),

  // Week 6: graph basics
  D('Graphs: adjacency lists, and turning a problem into nodes and edges', 'graphs', [], [CPH('Basics of graphs')]),
  D('DFS: components and flood fill', 'dfs and similar', ['dfs'], [CPA('graph/depth-first-search', 'Depth-first search')]),
  D('BFS: shortest paths when every edge costs the same', 'dfs and similar', ['bfs'], [CPA('graph/breadth-first-search', 'Breadth-first search')]),
  D('Multi-source BFS, and 0-1 BFS', 'shortest paths', [], [CPA('graph/01_bfs', '0-1 BFS')]),
  D('Cycles and bipartite graphs: two-colouring', 'dfs and similar', [], [CPA('graph/bipartite-check', 'Bipartite check')]),
  D('Topological sort: ordering a DAG', 'graphs', ['topo'], [CPA('graph/topological-sort', 'Topological sort')]),
  D('Union–find: merging sets in almost constant time', 'dsu', ['dsu'], [CPA('data_structures/disjoint_set_union', 'Disjoint set union')]),

  // Week 7: weights and trees
  D('Dijkstra: shortest paths with weights', 'shortest paths', ['dijkstra'], [CPA('graph/dijkstra', 'Dijkstra')]),
  D('Dijkstra on states: when a node is more than a place', 'shortest paths', []),
  D('Minimum spanning trees: Kruskal with union–find', 'graphs', ['mst'], [CPA('graph/mst_kruskal_with_dsu', 'Kruskal with DSU')]),
  D('Trees: rooting, parents, depths, subtree sizes', 'trees', ['subtree'], [CPH('Tree algorithms')]),
  D('Tree diameters and distances', 'trees', [], [CPH('Tree algorithms')]),
  D('Negative edges: Bellman–Ford and Floyd–Warshall', 'shortest paths', [],
    [CPA('graph/bellman_ford', 'Bellman–Ford'), CPA('graph/all-pair-shortest-path-floyd-warshall', 'Floyd–Warshall')]),
  D('Union–find tricks: answering queries in reverse', 'dsu', []),

  // Week 8: practice
  D('Graph modelling practice', 'graphs', []),
  D('Trees practice', 'trees', []),
  D('BFS on grids practice', 'dfs and similar', []),
  D('Data structures practice', 'data structures', []),
  D('Shortest paths practice', 'shortest paths', []),
  D('Greedy with a heap, practice', 'greedy', []),
  D('A virtual Div. 3 round under time, then upsolve', null, [], [r('Codeforces contests', 'https://codeforces.com/contests', 'Pick a past Div. 3 and press "Virtual participation"')], 3),
  D('Upsolve: finish what you could not in the contest', null, []),
  BOSS(),

  /* ============ Month 3 — dynamic programming and range queries ============ */
  // Week 9: DP foundations
  D('DP: a state, a transition, a base case — counting ways to climb stairs', 'dp', ['stairs'],
    [CPA('dynamic_programming/intro-to-dp', 'Introduction to DP'), CPH('Dynamic programming')]),
  D('Coin problems: fewest coins, and the number of ways', 'dp', ['coins'], [CPH('Dynamic programming')]),
  D('0/1 knapsack', 'dp', ['knapsack'], [CPA('dynamic_programming/knapsack', 'Knapsack')]),
  D('Longest increasing subsequence: O(n²), then O(n log n)', 'dp', ['lis'], [CPA('sequences/longest_increasing_subsequence', 'Longest increasing subsequence')]),
  D('Grid DP: paths around obstacles', 'dp', ['gridpaths'], [USACO('gold/paths-grids', 'Paths on grids')]),
  D('Two-string DP: LCS and edit distance', 'dp', ['lcs'], [CPH('Dynamic programming')]),
  D('DP practice: finding the state', 'dp', []),

  // Week 10: DP, harder
  D('Interval DP: the best answer on a[l..r]', 'dp', []),
  D('Bitmask DP: states that are subsets', 'bitmasks', [], [USACO('gold/dp-bitmasks', 'Bitmask DP')]),
  D('DP on trees: combine the children into the parent', 'trees', [], [USACO('gold/dp-trees', 'DP on trees')]),
  D('DP on DAGs: longest paths in topological order', 'dp', []),
  D('Counting DP under a modulus', 'combinatorics', []),
  D('Speeding DP up with prefix sums', 'dp', []),
  D('DP practice', 'dp', []),

  // Week 11: range queries
  D('Sparse tables: range minimum in O(1)', 'data structures', [], [CPA('data_structures/sparse-table', 'Sparse table')]),
  D('Fenwick trees: prefix sums that change', 'data structures', ['fenwick'], [CPA('data_structures/fenwick', 'Fenwick tree')]),
  D('Segment trees: point update, range query', 'data structures', [], [CPA('data_structures/segment_tree', 'Segment tree'), EDU('Segment tree')]),
  D('Segment trees for minimum, maximum and counts', 'data structures', [], [EDU('Segment tree')]),
  D('Lazy propagation: range updates', 'data structures', ['rangeadd'], [CPA('data_structures/segment_tree', 'Segment tree')]),
  D('Coordinate compression, and inversions with a Fenwick tree', 'data structures', []),
  D('Range queries practice', 'data structures', []),

  // Week 12: mixed, intermediate
  D('Binary search inside a data structure', 'binary search', []),
  D('Greedy, intermediate', 'greedy', []),
  D('Graphs meet DP', 'dp', []),
  D('Two pointers, intermediate', 'two pointers', []),
  D('Constructive, intermediate', 'constructive algorithms', []),
  D('A virtual Div. 2 round under time, then upsolve', null, [], [r('Codeforces contests', 'https://codeforces.com/contests', 'Pick a past Div. 2 and press "Virtual participation"')], 3),
  D('Upsolve: finish what you could not in the contest', null, []),
  D('Your weakest topic', null, []),
  BOSS(),

  /* =============== Month 4 — strings, maths and contests =============== */
  // Week 13: strings and counting
  D('Prefix function and KMP', 'strings', ['kmp'], [CPA('string/prefix-function', 'Prefix function')]),
  D('The Z-function', 'strings', ['zfunc'], [CPA('string/z-function', 'Z-function')]),
  D('String hashing, and avoiding collisions', 'hashing', ['strhash'], [CPA('string/string-hashing', 'String hashing')]),
  D('Tries: prefix trees for many strings', 'strings', [], [CPH('String algorithms')]),
  D('Strings practice', 'strings', []),
  D('Combinatorics: nCr, Pascal and factorials mod p', 'combinatorics', ['ncr'], [CPA('combinatorics/binomial-coefficients', 'Binomial coefficients')]),
  D('Inclusion–exclusion', 'combinatorics', ['inclexcl'], [CPA('combinatorics/inclusion-exclusion', 'Inclusion–exclusion')]),

  // Week 14: probability, games, trees, geometry
  D('Expected value and probability', 'probabilities', ['expect'], [CPH('Probability')]),
  D('Games: Nim and Grundy numbers', 'games', ['nim'], [CPA('game_theory/sprague-grundy-nim', 'Sprague–Grundy and Nim')]),
  D('Lowest common ancestor with binary lifting', 'trees', ['lca'], [CPA('graph/lca_binary_lifting', 'LCA with binary lifting')]),
  D('Euler tours: subtree queries as ranges', 'trees', [], [USACO('gold/tree-euler', 'Euler tour technique')]),
  D('Geometry basics: cross products and orientation', 'geometry', ['cross'], [CPA('geometry/oriented-triangle-area', 'Oriented area of a triangle')]),
  D('Divide and conquer', 'divide and conquer', []),
  D('Meet in the middle', 'meet-in-the-middle', [], [CPH('Complete search')]),

  // Week 15: advanced practice
  D('Interactive problems: asking questions within a limit', 'interactive', []),
  D('Constructive, advanced', 'constructive algorithms', []),
  D('Number theory, advanced', 'number theory', []),
  D('DP, advanced', 'dp', []),
  D('Graphs, advanced', 'graphs', []),
  D('A virtual Div. 2 round under time, then upsolve', null, [], [r('Codeforces contests', 'https://codeforces.com/contests', 'Pick a past Div. 2 and press "Virtual participation"')], 3),
  D('Upsolve: finish what you could not in the contest', null, []),

  // Week 16: contest craft
  D('Contest craft: read every problem first, and know when to switch', null, []),
  D('Implementation under time', 'implementation', []),
  D('Data structures under time', 'data structures', []),
  D('Maths under time', 'math', []),
  D('A virtual Div. 2 round under time, then upsolve', null, [], [r('Codeforces contests', 'https://codeforces.com/contests', 'Pick a past Div. 2 and press "Virtual participation"')], 3),
  D('Upsolve: finish what you could not in the contest', null, []),
  D('Your weakest topic', null, []),
  D('Light review before the contest', null, [], [], 1),
  BOSS(),
];

export const MISSIONS = numberDays(DAYS);
export const TOTAL_MISSIONS = MISSIONS.length;
export const missionAt = n => MISSIONS[Math.max(1, Math.min(MISSIONS.length, n)) - 1];
export const PLAN_DAYS = MISSIONS.length;
