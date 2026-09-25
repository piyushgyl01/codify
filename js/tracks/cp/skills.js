/**
 * DSA skills: the things a programming mission's check can test.
 *
 * The same idea as the robotics skills: each one is a generator, and the answer
 * is computed by code from the numbers it just drew — run the algorithm on a
 * small case, by hand, and type what it returns. Nothing asks for trivia.
 *
 * These test understanding. Solving is tested by Codeforces, in the mission's
 * Solve step; nothing here pays for a problem the judge did not accept.
 */

const num = (q, answer, explain, extra = {}) => ({ kind:'num', q, answer, unit:'', dp:0, tol:0, explain, ...extra });
const choice = (q, a, wrong, explain) => ({ kind:'mc', q, options:[a, ...wrong], correct:0, explain });
const csv = a => a.join(', ');
const sum = a => a.reduce((n, x) => n + x, 0);
const gcd2 = (a, b) => (b ? gcd2(b, a % b) : Math.abs(a));
const bin = x => x.toString(2);
const popcount = x => bin(x).split('').filter(c => c === '1').length;
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const edgeText = es => es.map(([u, v, w]) => (w == null ? `${u}–${v}` : `${u}–${v} (${w})`)).join(', ');

/** A random undirected graph on 1..n: a spanning tree, then `extra` edges. Weights optional. */
function graph(t, n, extra, weights = null) {
  const edges = [], seen = new Set();
  const add = (u, v) => {
    const k = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (u === v || seen.has(k)) return false;
    seen.add(k); edges.push([Math.min(u, v), Math.max(u, v)]); return true;
  };
  for (let v = 2; v <= n; v++) add(t.int(1, v - 1), v);
  for (let tries = 0; edges.length < n - 1 + extra && tries < 100; tries++) add(t.int(1, n), t.int(1, n));
  const w = weights ? t.shuffle(weights).slice(0, edges.length) : null;
  return t.shuffle(edges.map((e, i) => (w ? [e[0], e[1], w[i]] : e)));
}

const adjacency = (n, edges) => {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w = 1] of edges) { adj[u].push([v, w]); adj[v].push([u, w]); }
  adj.forEach(l => l.sort((a, b) => a[0] - b[0]));
  return adj;
};

/* ================================ month 1 ================================ */

const BIGO = [
  ['for i in 0..n−1: for j in i..n−1: work()', 'O(n²)', ['O(n)', 'O(n log n)', 'O(n³)'],
    'The inner loop runs n, then n−1, … then 1 times: n(n+1)/2 in total.'],
  ['i = 1; while i < n: i = 2·i', 'O(log n)', ['O(n)', 'O(√n)', 'O(1)'],
    'i doubles each time, so it passes n after about log₂ n steps.'],
  ['for i in 0..n−1: (j = 1; while j < n: j = 2·j)', 'O(n log n)', ['O(n)', 'O(n²)', 'O(log n)'],
    'n outer steps, each with a log₂ n inner loop.'],
  ['i = 1; while i < n: (for j in 0..i−1: work()); i = 2·i', 'O(n)', ['O(n log n)', 'O(n²)', 'O(log n)'],
    'The inner loop runs 1 + 2 + 4 + … < 2n times in total — a geometric series.'],
  ['i = 1; while i·i ≤ n: i = i + 1', 'O(√n)', ['O(log n)', 'O(n)', 'O(n log n)'],
    'It stops once i passes √n.'],
  ['for i in 1..n: for j = i, 2i, 3i, … up to n: work()', 'O(n log n)', ['O(n²)', 'O(n)', 'O(n√n)'],
    'n/1 + n/2 + n/3 + … is n times the harmonic sum, about n ln n.'],
  ['for mask in 0..2ⁿ−1: for i in 0..n−1: work()', 'O(2ⁿ · n)', ['O(n²)', 'O(2ⁿ)', 'O(n!)'],
    '2ⁿ masks, and n bits checked in each.'],
  ['f(n) = f(n−1) + f(n−1), with f(0) = 1', 'O(2ⁿ)', ['O(n)', 'O(n²)', 'O(n log n)'],
    'Each call makes two more, so the call tree doubles at every level.'],
  ['j = 0; for i in 0..n−1: while j < n and ok(i, j): j = j + 1', 'O(n)', ['O(n²)', 'O(n log n)', 'O(log n)'],
    'j only moves forward, so the while loop runs at most n times in total. This is two pointers.'],
  ['q queries, each adding up a[l..r] with a loop', 'O(n · q)', ['O(n + q)', 'O(q log n)', 'O(n log q)'],
    'A query can cover the whole array. Prefix sums bring it down to O(n + q).'],
  ['sort(a); for x in a: binary_search(a, x)', 'O(n log n)', ['O(n²)', 'O(n)', 'O(log n)'],
    'The sort is n log n, and n searches of log n each is also n log n.'],
  ['for i, j, k each in 0..n−1: work()', 'O(n³)', ['O(n²)', 'O(3n)', 'O(n² log n)'],
    'Three nested loops of n each.'],
  ['for every permutation p of n items: check(p), where check is O(n)', 'O(n! · n)', ['O(2ⁿ · n)', 'O(n²)', 'O(nⁿ)'],
    'There are n! permutations, each checked in O(n).'],
];
const bigo = t => {
  const [code, a, w, why] = t.pick(BIGO);
  return choice(`What is the running time of: ${code}`, a, w, why);
};

const ops = t => {
  const v = t.int(0, 3);
  if (v === 0) {
    const k = t.pick([10, 12, 14, 16, 17, 18, 20]), n = 2 ** k;
    return num(`n = 2^${k} = ${n.toLocaleString('en-US')}. Roughly how many steps is n · log₂ n?`, n * k,
      `log₂ n = ${k}, so n · log₂ n = ${n.toLocaleString('en-US')} × ${k} = ${(n * k).toLocaleString('en-US')}.`, { tol: undefined, rtol: 0.02 });
  }
  if (v === 1) {
    const s = t.pick([1, 2, 4]), n = Math.round(Math.sqrt(s * 1e8));
    return num(`A judge runs about 10⁸ simple steps a second. With a ${s}-second limit, roughly the largest n an O(n²) solution can handle?`, n,
      `n² ≤ ${s} × 10⁸ gives n ≤ √(${s} × 10⁸) ≈ ${n.toLocaleString('en-US')}.`, { tol: undefined, rtol: 0.05 });
  }
  if (v === 2) {
    const n = t.int(10, 20);
    return num(`How many subsets does a set of ${n} elements have?`, 2 ** n,
      `Each element is in or out: 2^${n} = ${(2 ** n).toLocaleString('en-US')}. Past about n = 25 this is too many to try.`);
  }
  const n = t.int(5, 10), f = range(1, n).reduce((a, b) => a * b, 1);
  return num(`How many different orders can ${n} distinct items be put in?`, f,
    `n! = ${range(1, n).join(' × ')} = ${f.toLocaleString('en-US')}. Past about n = 11, trying every order is too slow.`);
};

const subsets = t => {
  const n = t.int(5, 6), a = t.pickN(range(1, 12), n).sort((x, y) => x - y);
  const pick = a.filter(() => t.int(0, 1)), S = sum(pick.length ? pick : [a[0], a[1]]);
  const hits = [];
  for (let m = 1; m < 1 << n; m++) {
    const s = a.filter((_, i) => m >> i & 1);
    if (sum(s) === S) hits.push(`{${csv(s)}}`);
  }
  return num(`How many subsets of {${csv(a)}} add up to exactly ${S}?`, hits.length,
    `Try all 2^${n} = ${1 << n} subsets as bitmasks. The ones that work: ${hits.join(', ')}.`);
};

const inversions = t => {
  const a = t.pickN(range(1, 9), t.int(5, 7));
  const per = a.map((x, i) => a.slice(i + 1).filter(y => y < x).length);
  return num(`How many pairs i < j have a[i] > a[j] in [${csv(a)}]? It is also how many swaps bubble sort makes.`, sum(per),
    `For each element, count the smaller ones to its right: ${per.join(' + ')} = ${sum(per)}.`);
};

const prefix = t => {
  const a = Array.from({ length: 8 }, () => t.int(-5, 9));
  const l = t.int(1, 6), r = t.int(l + 1, 8);
  const p = [0]; a.forEach(x => p.push(p[p.length - 1] + x));
  return num(`a = [${csv(a)}], positions 1 to 8. What is a[${l}] + … + a[${r}]?`, p[r] - p[l - 1],
    `With prefix sums p[i] = a[1] + … + a[i]: p[${r}] − p[${l - 1}] = ${p[r]} − ${p[l - 1]} = ${p[r] - p[l - 1]}. One subtraction, however long the range.`);
};

const diffarr = t => {
  const ups = Array.from({ length: 3 }, () => { const l = t.int(1, 7); return [l, t.int(l, 8), t.int(1, 5)]; });
  const i = t.int(1, 8);
  const hit = ups.filter(([l, r]) => l <= i && i <= r).map(u => u[2]);
  return num(`Start with eight zeros. Add ${ups.map(([l, r, v]) => `${v} to positions ${l}–${r}`).join(', ')}. What is at position ${i}?`, sum(hit),
    `A difference array records +v at l and −v just after r; one running sum rebuilds the array. Position ${i} is covered by ${hit.length ? `${hit.join(' + ')} = ${sum(hit)}` : 'none of them, so 0'}.`);
};

const bsearch = t => {
  const v = t.int(0, 2);
  if (v === 0) {
    const a = Array.from({ length: 10 }, () => t.int(1, 30)).sort((x, y) => x - y);
    const x = t.int(1, 32), i = a.findIndex(y => y >= x), ans = i < 0 ? a.length : i;
    return num(`a = [${csv(a)}], indexed from 0. lower_bound(${x}) is the first index with a[i] ≥ ${x} (or 10 if none). Which index?`, ans,
      ans === a.length ? `Nothing is ≥ ${x}, so it returns the end: 10.` : `a[${ans}] = ${a[ans]} is the first value ≥ ${x}${ans ? `; a[${ans - 1}] = ${a[ans - 1]} is smaller` : ''}.`);
  }
  if (v === 1) {
    const n = t.pick([1000, 100000, 1000000, 2 ** 20, 1e9]), k = Math.floor(Math.log2(n)) + 1;
    return num(`Binary search over ${n.toLocaleString('en-US')} sorted items. At most how many middle elements does it look at?`, k,
      `Each look halves what is left, so the worst case is ⌊log₂ n⌋ + 1 = ${k}.`);
  }
  const N = t.int(50, 1000000);
  let k = Math.ceil(Math.sqrt(N));
  while ((k - 1) * (k - 1) >= N) k--;
  while (k * k < N) k++;
  return num(`What is the smallest integer k with k² ≥ ${N.toLocaleString('en-US')}?`, k,
    `"k² ≥ N" is false and then true as k grows, so you can binary search for the first true. ${k - 1}² = ${((k - 1) ** 2).toLocaleString('en-US')} and ${k}² = ${(k * k).toLocaleString('en-US')}, so k = ${k}.`);
};

const twoptr = t => {
  if (t.int(0, 1) === 0) {
    const a = Array.from({ length: 8 }, () => t.int(1, 20)).sort((x, y) => x - y), K = t.int(10, 30);
    let c = 0;
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (a[i] + a[j] <= K) c++;
    return num(`a = [${csv(a)}] is sorted. How many pairs i < j have a[i] + a[j] ≤ ${K}?`, c,
      `Put a pointer at each end. If a[l] + a[r] ≤ ${K}, a[l] pairs with everything up to r: add r − l and move l right. Otherwise move r left. Total: ${c}.`);
  }
  const a = Array.from({ length: 9 }, () => t.int(1, 9)), S = t.int(10, 20);
  let best = 0, bl = 0;
  for (let l = 0, r = 0, s = 0; r < a.length; r++) {
    s += a[r];
    while (s > S) s -= a[l++];
    if (r - l + 1 > best) { best = r - l + 1; bl = l; }
  }
  return num(`a = [${csv(a)}], all positive. How long is the longest run of consecutive elements with sum ≤ ${S}?`, best,
    `A sliding window: grow on the right, shrink from the left while the sum is over ${S}. Best: [${csv(a.slice(bl, bl + best))}], length ${best}.`);
};

const intervals = t => {
  const iv = Array.from({ length: 6 }, () => { const s = t.int(0, 16); return [s, s + t.int(1, 6)]; });
  const sorted = [...iv].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const took = []; let end = -Infinity;
  for (const [s, e] of sorted) if (s >= end) { took.push([s, e]); end = e; }
  return num(`Intervals: ${iv.map(([s, e]) => `[${s}, ${e}]`).join(', ')}. Pick as many as you can with no two overlapping — touching ends is fine. How many?`, took.length,
    `Sort by end and take each one that starts after the last one you took ends: ${took.map(([s, e]) => `[${s}, ${e}]`).join(', ')}.`);
};

const gcd = t => {
  if (t.int(0, 1) === 0) {
    const g = t.int(2, 30), a = g * t.int(2, 40), b = g * t.int(2, 40);
    const steps = []; let x = Math.max(a, b), y = Math.min(a, b);
    while (y) { steps.push(`gcd(${x}, ${y})`); [x, y] = [y, x % y]; }
    return num(`What is gcd(${a}, ${b})?`, x, `Euclid: ${steps.join(' → ')} → ${x}. Each step replaces (x, y) with (y, x mod y).`);
  }
  const a = t.int(4, 60), b = t.int(4, 60), g = gcd2(a, b), l = (a * b) / g;
  return num(`What is lcm(${a}, ${b})?`, l, `lcm(a, b) = a × b / gcd(a, b) = ${a} × ${b} / ${g} = ${l}.`);
};

const PRIMES = range(2, 200).filter(n => range(2, Math.floor(Math.sqrt(n))).every(d => n % d));
const factor = n => { const f = []; for (let p = 2; p * p <= n; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) f.push([p, e]); } if (n > 1) f.push([n, 1]); return f; };
const primes = t => {
  const v = t.int(0, 2);
  if (v === 0) {
    const N = t.int(20, 120), ps = PRIMES.filter(p => p <= N);
    return num(`How many primes are there from 1 to ${N}?`, ps.length,
      `The sieve crosses out multiples of each prime up to √${N}. What is left: ${csv(ps)} — ${ps.length} of them.`);
  }
  if (v === 1) {
    let n; do { n = t.int(12, 1000); } while (factor(n).reduce((d, [, e]) => d * (e + 1), 1) < 6);
    const f = factor(n), d = f.reduce((x, [, e]) => x * (e + 1), 1);
    return num(`How many positive divisors does ${n} have?`, d,
      `${n} = ${f.map(([p, e]) => (e > 1 ? `${p}^${e}` : p)).join(' · ')}, so it has ${f.map(([, e]) => `(${e}+1)`).join('')} = ${d}.`);
  }
  const p = t.pick([7, 11, 13, 17, 19, 23, 29, 31]), q = t.pick(PRIMES.filter(x => x >= p && x * p <= 5000));
  return num(`What is the smallest prime factor of ${p * q}?`, p,
    `Trial division by 2, 3, 5, … up to √${p * q} ≈ ${Math.floor(Math.sqrt(p * q))}: the first that divides is ${p} (${p} × ${q}).`);
};

const powmod = (a, e, m) => { let r = 1 % m, b = a % m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e >>= 1; } return r; };
const modpow = t => {
  if (t.int(0, 2) > 0) {
    const m = t.pick([7, 11, 13, 17, 19, 23, 29, 31]), a = t.int(2, 9), e = t.int(10, 60), r = e % (m - 1);
    return num(`What is ${a}^${e} mod ${m}?`, powmod(a, e, m),
      `${m} is prime and does not divide ${a}, so ${a}^${m - 1} ≡ 1 and only ${e} mod ${m - 1} = ${r} matters: ${a}^${r} mod ${m} = ${powmod(a, e, m)}. In code, square-and-multiply does it in log e steps.`);
  }
  const m = t.int(5, 13), a = t.int(1, 20), b = t.int(a + 1, 40), ans = (((a - b) % m) + m) % m;
  return num(`In C++, (${a} − ${b}) % ${m} is negative. What is the proper non-negative value of (${a} − ${b}) mod ${m}?`, ans,
    `${a} − ${b} = ${a - b}; C++ gives ${(a - b) % m}. Add ${m} once more: (x % m + m) % m = ${ans}.`);
};

const modinv = t => {
  const p = t.pick([7, 11, 13, 17, 19, 23]), a = t.int(2, p - 1), x = powmod(a, p - 2, p);
  return num(`What is the inverse of ${a} modulo ${p} — the x from 1 to ${p - 1} with ${a}·x ≡ 1 (mod ${p})?`, x,
    `${a} × ${x} = ${a * x} = ${Math.floor((a * x) / p)} × ${p} + 1. For a prime p, x = a^(p−2) mod p (Fermat).`);
};

const bits = t => {
  const x = t.int(1, 255), y = t.int(1, 255), v = t.int(0, 4);
  const q = s => `x = ${x} (binary ${bin(x)})${s}`;
  if (v === 0) return num(q('. What is popcount(x), the number of 1 bits?'), popcount(x), `${bin(x)} has ${popcount(x)} ones.`);
  if (v === 1) return num(q('. What is x & (x − 1)?'), x & (x - 1),
    `x − 1 flips the lowest 1 bit and everything below it, so x & (x − 1) clears the lowest 1 bit: ${bin(x)} → ${bin(x & (x - 1)) || '0'} = ${x & (x - 1)}.`);
  if (v === 2) return num(q('. What is x & −x?'), x & -x,
    `x & −x keeps only the lowest 1 bit: ${bin(x)} → ${bin(x & -x)} = ${x & -x}. Fenwick trees are built on this.`);
  if (v === 3) return num(q(` and y = ${y} (binary ${bin(y)}). What is x XOR y?`), x ^ y,
    `XOR sets a bit where exactly one of them has it: ${bin(x)} ^ ${bin(y)} = ${bin(x ^ y)} = ${x ^ y}.`);
  const k = t.int(1, 4);
  return num(q(`. What is x >> ${k}?`), x >> k, `Shifting right by ${k} divides by 2^${k} and drops the remainder: ⌊${x} / ${2 ** k}⌋ = ${x >> k}.`);
};

/* ================================ month 2 ================================ */

const nextgreater = t => {
  const a = Array.from({ length: 8 }, () => t.int(1, 20)), i = t.int(1, 7);
  const j = a.findIndex((y, k) => k > i - 1 && y > a[i - 1]), ans = j < 0 ? -1 : a[j];
  return num(`a = [${csv(a)}]. Position ${i} holds ${a[i - 1]}. What is the next greater element to its right? Answer −1 if there is none.`, ans,
    ans < 0 ? `Nothing to the right of position ${i} is bigger than ${a[i - 1]}, so −1.`
      : `The first value to the right bigger than ${a[i - 1]} is ${ans}, at position ${j + 1}. A monotonic stack finds every one of these in one pass.`);
};

const slidingmax = t => {
  const a = Array.from({ length: 9 }, () => t.int(1, 20)), k = t.int(2, 4);
  const m = range(0, a.length - k).map(i => Math.max(...a.slice(i, i + k)));
  return num(`a = [${csv(a)}]. Take the maximum of every window of ${k} consecutive elements. What do those maxima add up to?`, sum(m),
    `The window maxima are ${m.join(' + ')} = ${sum(m)}. A deque of candidates in decreasing order keeps each one at the front.`);
};

const freq = t => {
  const a = Array.from({ length: 10 }, () => t.int(1, 5));
  const f = {}; a.forEach(x => { f[x] = (f[x] || 0) + 1; });
  if (t.int(0, 1) === 0) {
    const c = Object.values(f).reduce((n, k) => n + (k * (k - 1)) / 2, 0);
    return num(`a = [${csv(a)}]. How many pairs i < j have a[i] = a[j]?`, c,
      `Count each value, then add k·(k−1)/2 for each count k: ${Object.entries(f).map(([v, k]) => `${v}×${k}`).join(', ')} → ${c}.`);
  }
  const T = t.int(4, 9); let c = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === T) c++;
  return num(`a = [${csv(a)}]. How many pairs i < j have a[i] + a[j] = ${T}?`, c,
    `Scan left to right keeping a map of counts seen so far; for each x add count[${T} − x]. Total: ${c}.`);
};

const heap = t => {
  const a = t.pickN(range(1, 50), 8), s = [...a].sort((x, y) => x - y);
  if (t.int(0, 1) === 0) {
    const k = t.int(1, 4);
    return num(`Push ${csv(a)} into a min-heap, then pop ${k} time${k > 1 ? 's' : ''}. What is at the top now?`, s[k],
      `A min-heap always has the smallest at the top. Popping removes ${csv(s.slice(0, k))}, leaving ${s[k]} on top.`);
  }
  const k = t.int(2, 4), d = [...s].reverse();
  return num(`Scan ${csv(a)} keeping a min-heap of size ${k}: push each value, and pop whenever it holds more than ${k}. What is on top at the end?`, d[k - 1],
    `The heap ends holding the ${k} largest (${csv(d.slice(0, k))}), and its top is the smallest of them — the ${k}th largest, ${d[k - 1]}.`);
};

const components = (n, edges) => {
  const p = range(0, n); const f = x => (p[x] === x ? x : (p[x] = f(p[x])));
  edges.forEach(([u, v]) => { p[f(u)] = f(v); });
  const groups = {}; range(1, n).forEach(v => { (groups[f(v)] ||= []).push(v); });
  return Object.values(groups);
};
const dfs = t => {
  const n = 8, all = [];
  for (let u = 1; u <= n; u++) for (let v = u + 1; v <= n; v++) all.push([u, v]);
  const edges = t.pickN(all, t.int(5, 7)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const comps = components(n, edges);
  const adj = adjacency(n, edges), order = [], seen = new Set();
  const go = u => { seen.add(u); order.push(u); for (const [v] of adj[u]) if (!seen.has(v)) go(v); };
  go(1);
  if (order.length >= 4 && t.int(0, 1) === 0) {
    const k = t.int(2, order.length);
    return num(`Undirected graph on 1..8. Edges: ${edgeText(edges)}. A DFS starts at 1 and always tries the smallest unvisited neighbour first. Which node is visited ${k}th?`, order[k - 1],
      `The visiting order is ${order.join(' → ')}, so the ${k}th is ${order[k - 1]}.`);
  }
  return num(`Undirected graph on nodes 1 to 8. Edges: ${edgeText(edges)}. How many connected components are there? (A node with no edges is one on its own.)`, comps.length,
    `Run a DFS from every unvisited node: ${comps.map(c => `{${csv(c)}}`).join(', ')} — ${comps.length}.`);
};

const bfsDist = (n, edges, s) => {
  const adj = adjacency(n, edges), d = Array(n + 1).fill(-1), layers = [[s]]; d[s] = 0;
  while (layers[layers.length - 1].length) {
    const next = [];
    for (const u of layers[layers.length - 1]) for (const [v] of adj[u]) if (d[v] < 0) { d[v] = d[u] + 1; next.push(v); }
    layers.push(next);
  }
  return { d, layers: layers.filter(l => l.length) };
};
const bfs = t => {
  const n = t.int(7, 8), edges = graph(t, n, t.int(1, 3)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const { d, layers } = bfsDist(n, edges, 1);
  return num(`Undirected graph on 1..${n}. Edges: ${edgeText(edges)}. What is the fewest number of edges on a path from 1 to ${n}?`, d[n],
    `BFS goes layer by layer: ${layers.map((l, i) => `${i}: {${csv(l)}}`).join(', ')}. Node ${n} is in layer ${d[n]}.`);
};

const topo = t => {
  const n = 5, hidden = t.shuffle(range(1, n)), edges = [];
  for (let tries = 0; edges.length < 6 && tries < 50; tries++) {
    const i = t.int(0, n - 2), j = t.int(i + 1, n - 1), e = [hidden[i], hidden[j]];
    if (!edges.some(([a, b]) => a === e[0] && b === e[1])) edges.push(e);
  }
  const valid = ord => edges.every(([a, b]) => ord.indexOf(a) < ord.indexOf(b));
  // Kahn's algorithm, smallest available first — a valid order by construction.
  const indeg = Array(n + 1).fill(0); edges.forEach(([, b]) => indeg[b]++);
  const ready = range(1, n).filter(v => !indeg[v]), out = [];
  while (ready.length) {
    ready.sort((a, b) => a - b); const u = ready.shift(); out.push(u);
    edges.filter(([a]) => a === u).forEach(([, b]) => { if (!--indeg[b]) ready.push(b); });
  }
  const fmt = o => o.join(' → '), wrong = new Set();
  for (let tries = 0; wrong.size < 3 && tries < 200; tries++) { const o = t.shuffle(range(1, n)); if (!valid(o)) wrong.add(fmt(o)); }
  const bad = [...wrong][0].split(' → ').map(Number), broken = edges.find(([a, b]) => bad.indexOf(a) > bad.indexOf(b));
  return choice(`Directed edges: ${edges.map(([a, b]) => `${a} → ${b}`).join(', ')}. Which order is a valid topological order?`,
    fmt(out), [...wrong],
    `Every edge must point forward in the order. Kahn's algorithm — keep taking a node with no incoming edges left — gives ${fmt(out)}. For example ${fmt(bad)} breaks ${broken[0]} → ${broken[1]}.`);
};

const dsu = t => {
  const ops = Array.from({ length: t.int(5, 6) }, () => { const a = t.int(1, 8); let b; do { b = t.int(1, 8); } while (b === a); return [a, b]; });
  const comps = components(8, ops);
  if (t.int(0, 1) === 0) {
    return num(`Eight nodes, 1 to 8, each in its own set. Then union(${ops.map(([a, b]) => `${a}, ${b}`).join('), union(')}). How many sets are left?`, comps.length,
      `After the unions the sets are ${comps.map(c => `{${csv(c)}}`).join(', ')} — ${comps.length}.`);
  }
  const x = t.pick(ops)[0], c = comps.find(g => g.includes(x));
  return num(`Eight nodes, each in its own set. Then union(${ops.map(([a, b]) => `${a}, ${b}`).join('), union(')}). How big is the set containing ${x}?`, c.length,
    `${x} ends up in {${csv(c)}} — size ${c.length}. Union by size keeps these trees shallow.`);
};

const dijkstraRun = (n, edges, s) => {
  const adj = adjacency(n, edges), d = Array(n + 1).fill(Infinity), prev = Array(n + 1).fill(0), done = new Set(); d[s] = 0;
  for (let k = 0; k < n; k++) {
    let u = 0;
    for (let v = 1; v <= n; v++) if (!done.has(v) && (u === 0 || d[v] < d[u])) u = v;
    done.add(u);
    for (const [v, w] of adj[u]) if (d[u] + w < d[v]) { d[v] = d[u] + w; prev[v] = u; }
  }
  return { d, prev };
};
const dijkstra = t => {
  const n = 6, edges = graph(t, n, 3, range(1, 9).concat(range(1, 9))).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const { d, prev } = dijkstraRun(n, edges, 1);
  const path = [n]; while (path[0] !== 1) path.unshift(prev[path[0]]);
  return num(`Undirected weighted graph on 1..6. Edges (weight): ${edgeText(edges)}. What is the shortest distance from 1 to 6?`, d[n],
    `Dijkstra settles the nearest unsettled node each time. The best path is ${path.join(' → ')}, total ${d[n]}.`);
};

const mst = t => {
  const n = t.int(5, 6), edges = graph(t, n, 3, range(1, 15)).sort((a, b) => a[2] - b[2]);
  const p = range(0, n); const f = x => (p[x] === x ? x : (p[x] = f(p[x])));
  const took = [];
  for (const e of edges) if (f(e[0]) !== f(e[1])) { p[f(e[0])] = f(e[1]); took.push(e); }
  const shown = [...edges].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return num(`Undirected weighted graph on 1..${n}. Edges (weight): ${edgeText(shown)}. What is the total weight of a minimum spanning tree?`, sum(took.map(e => e[2])),
    `Kruskal: take edges cheapest first, skipping any that would close a cycle: ${edgeText(took)} — total ${sum(took.map(e => e[2]))}.`);
};

const tree = (t, n) => { const p = [0, 0]; for (let v = 2; v <= n; v++) p.push(t.int(1, v - 1)); return p; };
const treeText = p => range(2, p.length - 1).map(v => `p(${v}) = ${p[v]}`).join(', ');
const subtree = t => {
  const n = 9, p = tree(t, n), kids = v => range(2, n).filter(c => p[c] === v);
  const size = v => 1 + sum(kids(v).map(size)), depth = v => (v === 1 ? 0 : 1 + depth(p[v]));
  const va = t.int(0, 2);
  if (va === 0) {
    const v = t.pick(range(1, n).filter(x => kids(x).length)) || 1;
    return num(`A tree rooted at 1 has parents ${treeText(p)}. How many nodes are in the subtree of ${v}, counting ${v} itself?`, size(v),
      `size(v) = 1 + the sizes of its children. ${v}'s children are ${csv(kids(v))}, giving ${size(v)}.`);
  }
  if (va === 1) {
    const v = t.int(4, n), chain = [v]; while (chain[0] !== 1) chain.unshift(p[chain[0]]);
    return num(`A tree rooted at 1 has parents ${treeText(p)}. What is the depth of node ${v}? (The root has depth 0.)`, depth(v),
      `Follow parents up: ${chain.reverse().join(' → ')} — ${depth(v)} edges.`);
  }
  const leaves = range(1, n).filter(v => !kids(v).length);
  return num(`A tree rooted at 1 has parents ${treeText(p)}. How many leaves does it have?`, leaves.length,
    `The nodes with no children are ${csv(leaves)} — ${leaves.length}.`);
};

/* ================================ month 3 ================================ */

const stairs = t => {
  const steps = t.pick([[1, 2], [1, 2, 3], [1, 3], [2, 3]]), n = t.int(5, 14), w = [1];
  for (let i = 1; i <= n; i++) w.push(sum(steps.map(s => (i >= s ? w[i - s] : 0))));
  return num(`You climb ${n} stairs taking ${steps.join(' or ')} at a time. In how many different ways can you reach the top?`, w[n],
    `ways[i] = ${steps.map(s => `ways[i−${s}]`).join(' + ')}, with ways[0] = 1: ${w.slice(0, n + 1).join(', ')}.`);
};

const coins = t => {
  if (t.int(0, 1) === 0) {
    const c = t.pick([[1, 3, 4], [1, 5, 6, 9], [1, 4, 5], [1, 7, 10], [1, 3, 5], [1, 6, 10]]), A = t.int(6, 20);
    const best = [0]; for (let a = 1; a <= A; a++) best.push(1 + Math.min(...c.filter(x => x <= a).map(x => best[a - x])));
    let g = 0, r = A; for (const x of [...c].reverse()) { g += Math.floor(r / x); r %= x; }
    return num(`Coins worth ${csv(c)}, as many of each as you like. What is the fewest coins that make ${A}?`, best[A],
      `best[a] = 1 + min(best[a − coin]). best[${A}] = ${best[A]}.${g > best[A] ? ` Greedy — biggest coin first — would use ${g}, which is why this needs DP.` : ''}`);
  }
  const c = t.pick([[1, 2, 5], [2, 3, 5], [1, 3, 4], [2, 5, 10]]), A = t.int(5, 12), ways = [1, ...Array(A).fill(0)];
  for (const x of c) for (let a = x; a <= A; a++) ways[a] += ways[a - x];
  return num(`Coins worth ${csv(c)}, as many of each as you like. In how many ways can you make ${A}? (Order does not matter.)`, ways[A],
    `Loop over coin types on the outside, so each combination is counted once: ways[a] += ways[a − coin]. ways[${A}] = ${ways[A]}.`);
};

const knapsack = t => {
  const k = t.int(4, 5), items = Array.from({ length: k }, () => [t.int(1, 6), t.int(2, 20)]), W = t.int(7, 12);
  let best = 0, bm = 0;
  for (let m = 0; m < 1 << k; m++) {
    const s = items.filter((_, i) => m >> i & 1);
    if (sum(s.map(x => x[0])) <= W && sum(s.map(x => x[1])) > best) { best = sum(s.map(x => x[1])); bm = m; }
  }
  const took = items.map((x, i) => [i + 1, ...x]).filter((_, i) => bm >> i & 1);
  return num(`Knapsack of capacity ${W}. Items (weight, value): ${items.map(([w, v]) => `(${w}, ${v})`).join(', ')}. Each at most once. Best total value?`, best,
    `dp[c] = max(dp[c], dp[c − w] + v), looping capacity downwards for each item. Best: ${took.length ? took.map(([i, w, v]) => `item ${i} (${w}, ${v})`).join(' + ') : 'nothing fits'} = ${best}.`);
};

const lis = t => {
  const a = Array.from({ length: 8 }, () => t.int(1, 15));
  const L = a.map(() => 1), from = a.map(() => -1);
  a.forEach((x, i) => { for (let j = 0; j < i; j++) if (a[j] < x && L[j] + 1 > L[i]) { L[i] = L[j] + 1; from[i] = j; } });
  let e = L.indexOf(Math.max(...L)); const seq = [];
  while (e >= 0) { seq.unshift(a[e]); e = from[e]; }
  return num(`a = [${csv(a)}]. How long is the longest strictly increasing subsequence?`, seq.length,
    `One longest: ${csv(seq)}. The O(n log n) version keeps, for each length, the smallest possible last value.`);
};

const gridpaths = t => {
  for (;;) {
    const R = t.int(3, 5), C = t.int(3, 5), k = t.int(1, 3), blocked = new Set();
    while (blocked.size < k) { const r = t.int(1, R), c = t.int(1, C); if ((r > 1 || c > 1) && (r < R || c < C)) blocked.add(`${r},${c}`); }
    const w = Array.from({ length: R + 1 }, () => Array(C + 1).fill(0));
    for (let r = 1; r <= R; r++) for (let c = 1; c <= C; c++) {
      w[r][c] = blocked.has(`${r},${c}`) ? 0 : r === 1 && c === 1 ? 1 : w[r - 1][c] + w[r][c - 1];
    }
    if (!w[R][C]) continue;
    return num(`A ${R} × ${C} grid. You start at the top-left (1, 1), end at the bottom-right (${R}, ${C}), and move only right or down. Blocked cells (row, column): ${[...blocked].map(b => `(${b.replace(',', ', ')})`).join(', ')}. How many paths are there?`, w[R][C],
      `paths(r, c) = paths(r−1, c) + paths(r, c−1), and 0 on a blocked cell. Filling the table row by row gives ${w[R][C]}.`);
  }
};

const lcs = t => {
  const s = (n, abc) => Array.from({ length: n }, () => t.pick(abc)).join('');
  if (t.int(0, 1) === 0) {
    const a = s(t.int(5, 7), ['A', 'B', 'C', 'D']), b = s(t.int(5, 7), ['A', 'B', 'C', 'D']);
    const L = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) L[i][j] = a[i - 1] === b[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
    return num(`What is the length of the longest common subsequence of "${a}" and "${b}"?`, L[a.length][b.length],
      `L[i][j] = L[i−1][j−1] + 1 when the letters match, otherwise max(L[i−1][j], L[i][j−1]). The table ends at ${L[a.length][b.length]}.`);
  }
  const a = s(t.int(3, 6), ['a', 'b', 'c']), b = s(t.int(3, 6), ['a', 'b', 'c']);
  const E = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i ? (j ? 0 : i) : j)));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) E[i][j] = Math.min(E[i - 1][j] + 1, E[i][j - 1] + 1, E[i - 1][j - 1] + (a[i - 1] !== b[j - 1]));
  return num(`Edit distance: the fewest single-letter inserts, deletes or replacements turning "${a}" into "${b}"?`, E[a.length][b.length],
    `E[i][j] = min(delete, insert, replace-or-keep) from the three neighbouring cells. The table ends at ${E[a.length][b.length]}.`);
};

const fenwick = t => {
  const i = t.int(3, 63), v = t.int(0, 2), low = i & -i;
  if (v === 0) {
    const idx = []; for (let j = i; j > 0; j -= j & -j) idx.push(j);
    return num(`How many tree cells does a Fenwick-tree prefix query at index ${i} add up?`, idx.length,
      `The query jumps j → j − (j & −j): ${idx.join(', ')}. That is one cell per 1 bit of ${i} (${bin(i)}): ${idx.length}.`);
  }
  if (v === 1) return num(`A Fenwick-tree update at index ${i} (size 64) touches which index next?`, i + low,
    `An update jumps j → j + (j & −j): ${i} + ${low} = ${i + low}.`);
  return num(`In a Fenwick tree, cell ${i} stores the sum of how many array positions?`, low,
    `Cell i covers the ${low} positions ending at i, where ${low} = i & −i (${bin(i)} → ${bin(low)}).`);
};

const rangeadd = t => {
  const a = Array.from({ length: 8 }, () => t.int(0, 5)), b = [...a];
  const ups = Array.from({ length: 3 }, () => { const l = t.int(1, 7); return [l, t.int(l, 8), t.int(1, 4)]; });
  ups.forEach(([l, r, v]) => { for (let i = l; i <= r; i++) b[i - 1] += v; });
  const l = t.int(1, 6), r = t.int(l + 1, 8), ans = sum(b.slice(l - 1, r));
  return num(`a = [${csv(a)}], positions 1 to 8. Add ${ups.map(([x, y, v]) => `${v} to ${x}–${y}`).join(', ')}. Then what is a[${l}] + … + a[${r}]?`, ans,
    `After the updates a = [${csv(b)}], and positions ${l}–${r} add up to ${ans}. A lazy segment tree gets there without touching every cell.`);
};

/* ================================ month 4 ================================ */

const abString = (t, n) => {
  const base = Array.from({ length: t.int(2, 4) }, () => t.pick(['a', 'b'])).join('');
  let s = ''; while (s.length < n) s += base;
  s = s.slice(0, n).split('');
  s[t.int(1, n - 1)] = t.pick(['a', 'b']);
  return s.join('');
};

const kmp = t => {
  const s = abString(t, t.int(8, 10)), i = t.int(3, s.length);
  const p = s.slice(0, i); let k = i - 1;
  while (k > 0 && p.slice(0, k) !== p.slice(i - k)) k--;
  return num(`s = "${s}". π(${i}) is the length of the longest proper prefix of s[1..${i}] = "${p}" that is also its suffix. What is π(${i})?`, k,
    k ? `"${p.slice(0, k)}" is both a prefix and a suffix of "${p}", and nothing longer is.` : `No proper prefix of "${p}" is also its suffix, so 0.`);
};

const zfunc = t => {
  const s = abString(t, t.int(8, 10)), i = t.int(1, s.length - 1);
  let z = 0; while (i + z < s.length && s[z] === s[i + z]) z++;
  return num(`s = "${s}", indexed from 0. z[${i}] is the length of the longest common prefix of s and s[${i}..] = "${s.slice(i)}". What is z[${i}]?`, z,
    z ? `Both start with "${s.slice(0, z)}", and the next letters differ${i + z >= s.length ? ' (or the string ends)' : ''}.` : `"${s.slice(i)}" starts with "${s[i]}", s starts with "${s[0]}" — no match, so 0.`);
};

const strhash = t => {
  const w = Array.from({ length: 3 }, () => String.fromCharCode(97 + t.int(0, 25))).join('');
  const c = [...w].map(ch => ch.charCodeAt(0) - 96), h = c[0] * 961 + c[1] * 31 + c[2];
  return num(`h(s) = s₀·31² + s₁·31 + s₂, with a = 1, b = 2, …, z = 26. What is h("${w}")?`, h,
    `${c[0]} × 961 + ${c[1]} × 31 + ${c[2]} = ${h}. Real hashes do this mod a large prime, which is why two strings can collide.`);
};

const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
const ncr = t => {
  const v = t.int(0, 2);
  if (v === 0) {
    const n = t.int(5, 20), k = t.int(2, n - 2);
    return num(`What is C(${n}, ${k}), the number of ways to choose ${k} of ${n}?`, C(n, k),
      `C(n, k) = n! / (k!(n−k)!) = ${C(n, k).toLocaleString('en-US')}. Pascal's rule C(n, k) = C(n−1, k−1) + C(n−1, k) builds a whole table.`);
  }
  if (v === 1) {
    const n = t.int(3, 10), k = t.int(2, 4);
    return num(`In how many ways can ${n} identical sweets be shared among ${k} children, if some may get none?`, C(n + k - 1, k - 1),
      `Stars and bars: ${n} stars and ${k - 1} bars, C(${n + k - 1}, ${k - 1}) = ${C(n + k - 1, k - 1)}.`);
  }
  const a = t.int(2, 6), b = t.int(2, 6);
  return num(`Moving only right or up, how many paths go from (0, 0) to (${a}, ${b})?`, C(a + b, a),
    `Every path is ${a + b} moves, ${a} of them right: C(${a + b}, ${a}) = ${C(a + b, a)}.`);
};

const lcm = (a, b) => (a * b) / gcd2(a, b);
const inclexcl = t => {
  const N = t.int(100, 1000);
  if (t.int(0, 1) === 0) {
    const [a, b] = t.pickN(range(2, 12), 2), l = lcm(a, b), ans = Math.floor(N / a) + Math.floor(N / b) - Math.floor(N / l);
    return num(`How many integers from 1 to ${N} are divisible by ${a} or by ${b}?`, ans,
      `⌊${N}/${a}⌋ + ⌊${N}/${b}⌋ − ⌊${N}/${l}⌋ = ${Math.floor(N / a)} + ${Math.floor(N / b)} − ${Math.floor(N / l)} = ${ans}. Numbers divisible by both were counted twice.`);
  }
  const [a, b, c] = t.pickN([2, 3, 5, 7], 3).sort((x, y) => x - y), f = d => Math.floor(N / d);
  const ans = f(a) + f(b) + f(c) - f(a * b) - f(a * c) - f(b * c) + f(a * b * c);
  return num(`How many integers from 1 to ${N} are divisible by at least one of ${a}, ${b} and ${c}?`, ans,
    `Add the singles, subtract the pairs, add the triple back: ${f(a)} + ${f(b)} + ${f(c)} − ${f(a * b)} − ${f(a * c)} − ${f(b * c)} + ${f(a * b * c)} = ${ans}.`);
};

const expect = t => {
  const v = t.int(0, 2);
  if (v === 0) {
    const s = t.pick([4, 6, 8, 10, 12, 20]);
    return num(`You roll a fair ${s}-sided die until it shows a 1. On average, how many rolls does that take?`, s,
      `Each roll succeeds with probability 1/${s}. The expected wait for something with probability p is 1/p = ${s}.`, { dp: 2, tol: 0.01 });
  }
  if (v === 1) {
    const k = t.int(2, 5), s = t.pick([4, 6, 8, 10]), e = (k * (s + 1)) / 2;
    return num(`What is the expected total of ${k} fair ${s}-sided dice?`, e,
      `Expectation adds up: each die averages (1 + ${s}) / 2 = ${(s + 1) / 2}, so ${k} of them average ${e}.`, { dp: 2, tol: 0.01 });
  }
  const s = t.int(4, 8), e = sum(range(1, s).map(m => m * (2 * m - 1))) / (s * s);
  return num(`Roll two fair ${s}-sided dice. What is the expected value of the larger one? (Two decimals.)`, e,
    `P(max = m) = (2m − 1) / ${s * s}. Adding m × P(max = m) for m = 1..${s} gives ${e.toFixed(2)}.`, { dp: 2, tol: 0.01 });
};

const nim = t => {
  const piles = Array.from({ length: t.int(3, 4) }, () => t.int(1, 15)), x = piles.reduce((a, b) => a ^ b, 0);
  if (t.int(0, 1) === 0) {
    return num(`Nim piles: ${csv(piles)}. What is the XOR of the pile sizes?`, x,
      `${piles.map(bin).join(' ^ ')} = ${bin(x)} = ${x}.`);
  }
  return choice(`Nim with piles ${csv(piles)}: players take any number from one pile, and whoever takes the last wins. Who wins with perfect play?`,
    x ? 'The first player' : 'The second player', [x ? 'The second player' : 'The first player'],
    `The XOR of the piles is ${x}. ${x ? 'Non-zero: the first player can always move to XOR 0 and keep it there.' : 'Zero: every move makes it non-zero, and the second player restores it.'}`);
};

const lca = t => {
  const n = 10, p = tree(t, n), up = v => { const a = [v]; while (a[a.length - 1] !== 1) a.push(p[a[a.length - 1]]); return a; };
  const u = t.int(2, n); let v; do { v = t.int(2, n); } while (v === u);
  const au = up(u), av = up(v), l = au.find(x => av.includes(x));
  return num(`A tree rooted at 1 has parents ${treeText(p)}. What is the lowest common ancestor of ${u} and ${v}?`, l,
    `Up from ${u}: ${au.join(' → ')}. Up from ${v}: ${av.join(' → ')}. The first node they share is ${l}. Binary lifting jumps up in powers of two to find it in O(log n).`);
};

const cross = t => {
  if (t.int(0, 1) === 0) {
    const [a, b, c, d] = Array.from({ length: 4 }, () => t.int(-9, 9)), x = a * d - c * b;
    return num(`What is the cross product (${a}, ${b}) × (${c}, ${d}) = x₁·y₂ − x₂·y₁?`, x,
      `${a} × ${d} − ${c} × ${b} = ${a * d} − ${c * b} = ${x}. Its sign says which way the second vector turns from the first.`);
  }
  const P = () => [t.int(-5, 5), t.int(-5, 5)];
  const A = P(); let B; do { B = P(); } while (B[0] === A[0] && B[1] === A[1]);
  const Cp = P(), x = (B[0] - A[0]) * (Cp[1] - A[1]) - (B[1] - A[1]) * (Cp[0] - A[0]);
  const opts = ['To the left (counter-clockwise)', 'To the right (clockwise)', 'Exactly on the line'];
  const a = x > 0 ? opts[0] : x < 0 ? opts[1] : opts[2];
  return choice(`A = (${A.join(', ')}), B = (${B.join(', ')}), C = (${Cp.join(', ')}). Looking from A towards B, where is C?`, a, opts.filter(o => o !== a),
    `cross(B − A, C − A) = ${x}. Positive means left, negative means right, zero means on the line.`);
};

/* ================================ registry ================================ */

/** [id, month, topic, name, generator], in the order the plan introduces them. */
const LIST = [
  ['bigo',        1, 'implementation', 'Big-O of a loop',              bigo],
  ['ops',         1, 'implementation', 'Will it run in time?',         ops],
  ['subsets',     1, 'bruteforce',     'Subsets as bitmasks',          subsets],
  ['inversions',  1, 'sortings',       'Inversions',                   inversions],
  ['prefix',      1, 'implementation', 'Prefix sums',                  prefix],
  ['diffarr',     1, 'implementation', 'Difference arrays',            diffarr],
  ['bsearch',     1, 'binarysearch',   'Binary search',                bsearch],
  ['twoptr',      1, 'twopointers',    'Two pointers',                 twoptr],
  ['intervals',   1, 'greedy',         'Interval scheduling',          intervals],
  ['gcd',         1, 'numbertheory',   'GCD and LCM',                  gcd],
  ['primes',      1, 'numbertheory',   'Primes and divisors',          primes],
  ['modpow',      1, 'math',           'Modular arithmetic',           modpow],
  ['modinv',      1, 'numbertheory',   'Modular inverses',             modinv],
  ['bits',        1, 'bitmasks',       'Bit tricks',                   bits],

  ['nextgreater', 2, 'datastructures', 'Monotonic stacks',             nextgreater],
  ['slidingmax',  2, 'datastructures', 'Sliding window maximum',       slidingmax],
  ['freq',        2, 'datastructures', 'Counting with maps',           freq],
  ['heap',        2, 'datastructures', 'Heaps',                        heap],
  ['dfs',         2, 'dfs',            'DFS and components',           dfs],
  ['bfs',         2, 'dfs',            'BFS distances',                bfs],
  ['topo',        2, 'graphs',         'Topological order',            topo],
  ['dsu',         2, 'dsu',            'Union–find',                   dsu],
  ['dijkstra',    2, 'shortestpaths',  'Dijkstra',                     dijkstra],
  ['mst',         2, 'graphs',         'Minimum spanning trees',       mst],
  ['subtree',     2, 'trees',          'Rooted trees',                 subtree],

  ['stairs',      3, 'dp',             'Counting DP',                  stairs],
  ['coins',       3, 'dp',             'Coin DP',                      coins],
  ['knapsack',    3, 'dp',             '0/1 knapsack',                 knapsack],
  ['lis',         3, 'dp',             'Longest increasing subsequence', lis],
  ['gridpaths',   3, 'dp',             'Grid DP',                      gridpaths],
  ['lcs',         3, 'dp',             'LCS and edit distance',        lcs],
  ['fenwick',     3, 'datastructures', 'Fenwick trees',                fenwick],
  ['rangeadd',    3, 'datastructures', 'Range updates',                rangeadd],

  ['kmp',         4, 'strings',        'Prefix function',              kmp],
  ['zfunc',       4, 'strings',        'Z-function',                   zfunc],
  ['strhash',     4, 'strings',        'String hashing',               strhash],
  ['ncr',         4, 'combinatorics',  'Binomials and counting',       ncr],
  ['inclexcl',    4, 'combinatorics',  'Inclusion–exclusion',          inclexcl],
  ['expect',      4, 'math',           'Expected value',               expect],
  ['nim',         4, 'math',           'Nim',                          nim],
  ['lca',         4, 'trees',          'Lowest common ancestor',       lca],
  ['cross',       4, 'math',           'Cross products',               cross],
];

export const SKILLS = LIST.map(([id, month, topic, name, gen], order) => ({ id, month, topic, name, gen, order, track: 'cp' }));
export const skillById = id => SKILLS.find(s => s.id === id);
export const skillsIn = m => SKILLS.filter(s => s.month === m);

/** Exposed for the tests, which check these answers against slower brute force. */
export const _internals = { dijkstraRun, bfsDist, components, C, powmod };
