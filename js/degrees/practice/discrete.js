/**
 * MATH110 Discrete Mathematics — practice modelled on MIT 6.042J (Fall 2010)
 * problem sets, its midterm and the 2008 final: comparing propositions by
 * truth table, validity, quantifiers over a finite domain, recurrences,
 * invariants, modular inverses and Fermat's little theorem, graphs, counting,
 * the pigeonhole principle, asymptotics, bounding sums, and discrete
 * probability.
 *
 * Every question carries `python`: a brute-force program — every row of the
 * truth table, every assignment, every arrangement, every play of the game —
 * whose output is the answer. The tests run it, so the answer is checked by
 * enumeration rather than by the reasoning that produced it.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, explain, python, tol: 0, dp: 0, ...extra });
const mc = (q, right, wrong, explain, python) => ({ kind: 'mc', q, options: [right, ...wrong], correct: 0, explain, python });
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const powmod = (b, e, m) => { let r = 1n, x = BigInt(b) % BigInt(m), k = BigInt(e); const M = BigInt(m); while (k > 0n) { if (k & 1n) r = r * x % M; x = x * x % M; k >>= 1n; } return Number(r); };

/* ------------------------------ propositions ------------------------------ */

const VARS = ['A', 'B', 'C'];

/** A random formula: { u: unicode, js: (env) => bool, py: python expression }. */
function formula(t, depth = 2) {
  if (depth === 0 || t.rng() < 0.25) {
    const v = t.pick(VARS), neg = t.rng() < 0.3;
    return { u: neg ? `¬${v}` : v, js: e => (neg ? !e[v] : e[v]), py: neg ? `(not ${v})` : v };
  }
  const a = formula(t, depth - 1), b = formula(t, depth - 1), op = t.pick(['∧', '∨', '⇒']);
  if (op === '∧') return { u: `(${a.u} ∧ ${b.u})`, js: e => a.js(e) && b.js(e), py: `(${a.py} and ${b.py})` };
  if (op === '∨') return { u: `(${a.u} ∨ ${b.u})`, js: e => a.js(e) || b.js(e), py: `(${a.py} or ${b.py})` };
  return { u: `(${a.u} ⇒ ${b.u})`, js: e => !a.js(e) || b.js(e), py: `((not ${a.py}) or ${b.py})` };
}
const ROWS = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ A: !!(i & 4), B: !!(i & 2), C: !!(i & 1) }));
const strip = s => (s.startsWith('(') && s.endsWith(')') ? s.slice(1, -1) : s);
const PY_ROWS = 'from itertools import product\nrows = list(product([False, True], repeat=3))\n';

const RELATION = ['P and Q are equivalent', 'P implies Q, but not the reverse', 'Q implies P, but not the reverse', 'Neither implies the other'];

/** The midterm's pair, then random ones that are not trivially equal. */
function propositionPair(t) {
  if (t.rng() < 0.25) {
    return [{ u: '(A ∨ B) ⇒ C', js: e => !(e.A || e.B) || e.C, py: '((not (A or B)) or C)' },
      { u: '(¬C ⇒ ¬A) ∨ (¬C ⇒ ¬B)', js: e => (e.C || !e.A) || (e.C || !e.B), py: '((C or (not A)) or (C or (not B)))' }];
  }
  for (;;) {
    const p = formula(t), q = formula(t);
    if (p.u !== q.u && p.u.length > 2 && q.u.length > 2) return [p, q];
  }
}

/* --------------------------------- graphs --------------------------------- */

function randomGraph(t, n, p) {
  for (;;) {
    const edges = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (t.rng() < p) edges.push([i, j]);
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
    const seen = new Set([0]), stack = [0];
    while (stack.length) for (const v of adj[stack.pop()]) if (!seen.has(v)) { seen.add(v); stack.push(v); }
    if (seen.size === n && edges.length >= n) return { n, edges, adj };
  }
}
const L = i => 'ABCDEFGH'[i];
const edgeList = g => g.edges.map(([a, b]) => `${L(a)}${L(b)}`).join(', ');
const pyGraph = g => `n = ${g.n}\nedges = ${JSON.stringify(g.edges)}\nadj = {v: set() for v in range(n)}\nfor a, b in edges:\n    adj[a].add(b); adj[b].add(a)\n`;

function bfs(g, s) {
  const d = Array(g.n).fill(Infinity); d[s] = 0; const q = [s];
  while (q.length) { const v = q.shift(); for (const w of g.adj[v]) if (d[w] === Infinity) { d[w] = d[v] + 1; q.push(w); } }
  return d;
}

/* ---------------------------------- skills -------------------------------- */

export const DISCRETE = [
  SKILL('dm.equiv', 'Comparing propositions', 'Use a truth table to see whether two propositions are equivalent or one implies the other.', t => {
    const [P, Q] = propositionPair(t);
    const pq = ROWS.every(e => !P.js(e) || Q.js(e)), qp = ROWS.every(e => !Q.js(e) || P.js(e));
    const right = RELATION[pq && qp ? 0 : pq ? 1 : qp ? 2 : 3];
    return mc(`P: ${strip(P.u)}\nQ: ${strip(Q.u)}\nWhich best describes how P and Q are related?`, right, RELATION.filter(x => x !== right),
      `Check all 8 rows of A, B, C. P ⇒ Q holds in every row: ${pq ? 'yes' : 'no'}. Q ⇒ P holds in every row: ${qp ? 'yes' : 'no'}.`,
      `${PY_ROWS}P = lambda A, B, C: ${P.py}\nQ = lambda A, B, C: ${Q.py}\npq = all((not P(*r)) or Q(*r) for r in rows)\nqp = all((not Q(*r)) or P(*r) for r in rows)\nprint(${JSON.stringify(RELATION)}[0 if pq and qp else 1 if pq else 2 if qp else 3])`);
  }),

  SKILL('dm.valid', 'Validity and satisfiability', 'Decide whether a formula is true in every row, some rows, or none.', t => {
    const KINDS = ['Valid — true in every row', 'Satisfiable, but not valid', 'Unsatisfiable — true in no row'];
    const special = t.rng() < 0.3 ? t.pick([
      { u: '(A ⇒ B) ∨ (B ⇒ A)', js: e => (!e.A || e.B) || (!e.B || e.A), py: '(((not A) or B) or ((not B) or A))' },
      { u: '(A ∧ ¬A) ∨ (B ∧ ¬B)', js: e => (e.A && !e.A) || (e.B && !e.B), py: '((A and (not A)) or (B and (not B)))' },
      { u: '((A ⇒ B) ∧ (B ⇒ C)) ⇒ (A ⇒ C)', js: e => !((!e.A || e.B) && (!e.B || e.C)) || (!e.A || e.C), py: '((not (((not A) or B) and ((not B) or C))) or ((not A) or C))' },
    ]) : formula(t, 3);
    const trues = ROWS.filter(e => special.js(e)).length, right = KINDS[trues === 8 ? 0 : trues ? 1 : 2];
    return mc(`Is this formula valid, satisfiable or unsatisfiable?\n${strip(special.u)}`, right, KINDS.filter(k => k !== right),
      `It is true in ${trues} of the 8 rows of its truth table.`,
      `${PY_ROWS}F = lambda A, B, C: ${special.py}\nk = sum(1 for r in rows if F(*r))\nprint(${JSON.stringify(KINDS)}[0 if k == 8 else 1 if k else 2])`);
  }),

  SKILL('dm.quant', 'Quantifiers', 'Decide nested ∀ / ∃ statements over a small domain — and see why order matters.', t => {
    const n = t.int(4, 7), k = t.int(0, n - 1), form = t.int(0, 3);
    const D = [...Array(n).keys()];
    const stmts = [
      [`∀x ∃y: x + y ≡ ${k} (mod ${n})`, () => D.every(x => D.some(y => (x + y) % n === k)), `all(any((x + y) % n == ${k} for y in D) for x in D)`],
      [`∃y ∀x: x + y ≡ ${k} (mod ${n})`, () => D.some(y => D.every(x => (x + y) % n === k)), `any(all((x + y) % n == ${k} for x in D) for y in D)`],
      [`∀x ∃y: x · y ≡ 1 (mod ${n})`, () => D.every(x => D.some(y => (x * y) % n === 1)), 'all(any((x * y) % n == 1 for y in D) for x in D)'],
      [`∀x ≠ 0 ∃y: x · y ≡ 1 (mod ${n})`, () => D.filter(x => x).every(x => D.some(y => (x * y) % n === 1)), 'all(any((x * y) % n == 1 for y in D) for x in D if x)'],
    ][form];
    const val = stmts[1]();
    return mc(`x and y range over {0, 1, …, ${n - 1}}. Is this true?\n${stmts[0]}`, val ? 'True' : 'False', [val ? 'False' : 'True'],
      [`For each x, y = ${k} − x (mod ${n}) works.`, 'No single y works for every x: x + y takes every value as x varies.',
        'x = 0 has no inverse, so it fails.', `Every nonzero x has an inverse mod ${n} exactly when ${n} is prime — ${n} ${[2, 3, 5, 7].includes(n) ? 'is' : 'is not'}.`][form],
      `n = ${n}\nD = range(n)\nprint('True' if ${stmts[2]} else 'False')`);
  }),

  SKILL('dm.recur', 'Recurrences', 'Unroll a recursive definition — the kind induction proofs are about.', t => {
    const a = t.int(1, 3), b = t.int(1, 3), c = t.pick([0, 0, 1, 3]), g0 = 1, g1 = t.int(1, 3), g2 = t.int(2, 9), k = t.int(6, 10);
    const G = [g0, g1, g2];
    for (let i = 3; i <= k; i++) G.push(a * G[i - 1] + b * G[i - 2] + c * G[i - 3]);
    const rule = `Gₙ = ${a === 1 ? '' : a}Gₙ₋₁ + ${b === 1 ? '' : b}Gₙ₋₂${c ? ` + ${c === 1 ? '' : c}Gₙ₋₃` : ''}`;
    return num(`G₀ = ${g0}, G₁ = ${g1}, G₂ = ${g2}, and ${rule} for n ≥ 3. What is G${String(k).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('')}?`, G[k],
      `Unroll it: ${G.slice(3).map((v, i) => `G${i + 3} = ${v}`).join(', ')}.`,
      `G = [${g0}, ${g1}, ${g2}]\nfor i in range(3, ${k + 1}):\n    G.append(${a}*G[i-1] + ${b}*G[i-2] + ${c}*G[i-3])\nprint(G[${k}])`);
  }),

  SKILL('dm.invariant', 'Invariants', 'Find what a process never changes — and so where it must end up.', t => {
    if (t.rng() < 0.6) {
      const circles = t.int(1, 9), squares = t.int(1, 9), right = circles % 2 ? 'A circle' : 'A square';
      return mc(`Squares and Circles (6.042 midterm): start with ${circles} circles and ${squares} squares. Each move replaces two shapes with one — two identical shapes become a square, two different shapes become a circle. When one shape is left, what is it?`,
        right, [right === 'A circle' ? 'A square' : 'A circle', 'It depends on the moves'],
        `The parity of the number of circles never changes: two circles → a square (−2), two squares → a square (0), one of each → a circle (0). ${circles} is ${circles % 2 ? 'odd' : 'even'}, so the last shape is ${right.toLowerCase()}.`,
        `import random\nends = set()\nfor seed in range(300):\n    random.seed(seed)\n    s = ['c'] * ${circles} + ['s'] * ${squares}\n    while len(s) > 1:\n        random.shuffle(s)\n        a, b = s.pop(), s.pop()\n        s.append('s' if a == b else 'c')\n    ends.add(s[0])\nprint('It depends on the moves' if len(ends) > 1 else ('A circle' if ends == {'c'} else 'A square'))`);
    }
    const x = t.int(-6, 6), y = t.int(-6, 6), ok = (x + y) % 2 === 0;
    return mc(`A robot starts at (0, 0) and each move goes diagonally: (±1, ±1). Can it ever reach (${x}, ${y})?`, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'],
      `x + y changes by −2, 0 or +2 on every move, so its parity is invariant. It starts even; ${x} + ${y} = ${x + y} is ${ok ? 'even — and every even point is reachable' : 'odd, so never'}.`,
      `from collections import deque\nseen = {(0, 0)}\nq = deque([(0, 0)])\nwhile q:\n    a, b = q.popleft()\n    for da in (-1, 1):\n        for db in (-1, 1):\n            p = (a + da, b + db)\n            if abs(p[0]) <= 8 and abs(p[1]) <= 8 and p not in seen:\n                seen.add(p); q.append(p)\nprint('Yes' if (${x}, ${y}) in seen else 'No')`);
  }),

  SKILL('dm.inverse', 'Modular inverses', 'Find x with a·x ≡ 1 (mod p), by the extended Euclidean algorithm.', t => {
    const p = t.pick([13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 101, 113]), a = t.int(2, p - 1);
    let x = 1; while ((a * x) % p !== 1) x++;
    return num(`Find x in {0, 1, …, ${p - 1}} such that ${a}x ≡ 1 (mod ${p}).`, x,
      `${a}·${x} = ${a * x} = ${Math.floor(a * x / p)}·${p} + 1. The extended Euclidean algorithm on (${a}, ${p}) finds it without trying every x.`,
      `print(pow(${a}, -1, ${p}))`);
  }),

  SKILL('dm.fermat', 'Fermat\'s little theorem', 'Reduce a huge power mod a prime by cutting the exponent mod p − 1.', t => {
    const p = t.pick([7, 11, 13, 17, 19, 23, 113]), a = t.int(2, 30), e = t.int(1000, 99999);
    const ans = powmod(a, e, p), r = e % (p - 1);
    return num(`What is ${a}^${e} mod ${p}? (${p} is prime)`, ans,
      `${p} is prime and does not divide ${a}, so ${a}^${p - 1} ≡ 1. ${e} = ${Math.floor(e / (p - 1))}·${p - 1} + ${r}, so ${a}^${e} ≡ ${a}^${r} ≡ ${ans} (mod ${p}).`,
      `print(pow(${a}, ${e}, ${p}))`);
  }),

  SKILL('dm.graph', 'Graph properties', 'Diameter, colouring, Euler tours, degrees and minimum spanning trees on a small graph.', t => {
    const g = randomGraph(t, t.int(5, 6), 0.5), ask = t.int(0, 4);
    if (ask === 0) {
      const diam = Math.max(...[...Array(g.n).keys()].flatMap(s => bfs(g, s)));
      return num(`A graph has vertices ${[...Array(g.n).keys()].map(L).join(', ')} and edges ${edgeList(g)}. What is its diameter?`, diam,
        'The diameter is the largest shortest-path distance between any two vertices — run BFS from each vertex.',
        `${pyGraph(g)}from collections import deque\ndef far(s):\n    d = {s: 0}; q = deque([s])\n    while q:\n        v = q.popleft()\n        for w in adj[v]:\n            if w not in d: d[w] = d[v] + 1; q.append(w)\n    return max(d.values())\nprint(max(far(s) for s in range(n)))`);
    }
    if (ask === 1) {
      let chi = 1;
      const colourable = k => { const c = Array(g.n).fill(-1); const go = v => { if (v === g.n) return true; for (let x = 0; x < k; x++) if (g.adj[v].every(w => c[w] !== x)) { c[v] = x; if (go(v + 1)) return true; c[v] = -1; } return false; }; return go(0); };
      while (!colourable(chi)) chi++;
      return num(`A graph has vertices ${[...Array(g.n).keys()].map(L).join(', ')} and edges ${edgeList(g)}. What is the fewest colours that colour it so no edge joins two vertices of the same colour?`, chi,
        `It can be coloured with ${chi} colours and not with ${chi - 1}${chi >= 3 ? ' — look for a triangle or an odd cycle' : ''}.`,
        `${pyGraph(g)}from itertools import product\nprint(next(k for k in range(1, n + 1) if any(all(c[a] != c[b] for a, b in edges) for c in product(range(k), repeat=n))))`);
    }
    if (ask === 2) {
      const odd = g.adj.filter(a => a.length % 2).length, right = odd === 0 ? 'Yes' : 'No';
      return mc(`A connected graph has vertices ${[...Array(g.n).keys()].map(L).join(', ')} and edges ${edgeList(g)}. Does it have an Eulerian cycle (a closed walk using every edge exactly once)?`, right, [right === 'Yes' ? 'No' : 'Yes'],
        `A connected graph has an Eulerian cycle exactly when every vertex has even degree. Degrees: ${g.adj.map((a, i) => `${L(i)} ${a.length}`).join(', ')}.`,
        `${pyGraph(g)}import sys\nsys.setrecursionlimit(10000)\ndef tour(v, used):\n    if len(used) == len(edges): return v == 0\n    for i, (a, b) in enumerate(edges):\n        if i not in used and v in (a, b):\n            if tour(b if v == a else a, used | {i}): return True\n    return False\nprint('Yes' if tour(0, frozenset()) else 'No')`);
    }
    if (ask === 3) {
      const w = g.edges.map(() => t.int(1, 9)), order = g.edges.map((e, i) => i).sort((a, b) => w[a] - w[b] || a - b);
      const parent = [...Array(g.n).keys()], find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
      let total = 0; for (const i of order) { const [a, b] = g.edges[i]; if (find(a) !== find(b)) { parent[find(a)] = find(b); total += w[i]; } }
      return num(`A weighted graph has edges ${g.edges.map(([a, b], i) => `${L(a)}${L(b)}=${w[i]}`).join(', ')}. What is the total weight of a minimum spanning tree?`, total,
        'Kruskal: take edges from lightest to heaviest, skipping any that would close a cycle, until the tree has n − 1 edges.',
        `${pyGraph(g)}w = ${JSON.stringify(w)}\nfrom itertools import combinations\nbest = None\nfor T in combinations(range(len(edges)), n - 1):\n    p = list(range(n))\n    def f(x):\n        while p[x] != x: x = p[x]\n        return x\n    ok = True\n    for i in T:\n        a, b = f(edges[i][0]), f(edges[i][1])\n        if a == b: ok = False; break\n        p[a] = b\n    if ok:\n        s = sum(w[i] for i in T)\n        best = s if best is None else min(best, s)\nprint(best)`);
    }
    const sum = g.edges.length * 2;
    return num(`A graph has vertices ${[...Array(g.n).keys()].map(L).join(', ')} and edges ${edgeList(g)}. What is the sum of the degrees of all its vertices?`, sum,
      `The handshake lemma: every edge adds 2 to the total degree, so it is 2 × ${g.edges.length} = ${sum}.`,
      `${pyGraph(g)}print(sum(len(adj[v]) for v in range(n)))`);
  }),

  SKILL('dm.count', 'Counting', 'Sum and product rules, inclusion–exclusion, stars and bars, and arrangements with repeats.', t => {
    const form = t.int(0, 3);
    if (form === 0) {
      const N = t.pick([100, 120, 300, 1000]), [a, b, c] = t.pick([[2, 3, 5], [3, 5, 7], [2, 5, 7], [4, 6, 9]]);
      let n = 0; for (let i = 1; i <= N; i++) if (i % a === 0 || i % b === 0 || i % c === 0) n++;
      return num(`How many integers from 1 to ${N} are divisible by ${a}, ${b} or ${c}?`, n,
        'Inclusion–exclusion: add the counts for each, subtract each pair (divisible by their lcm), add back the triple.',
        `print(sum(1 for i in range(1, ${N} + 1) if i % ${a} == 0 or i % ${b} == 0 or i % ${c} == 0))`);
    }
    if (form === 1) {
      const k = t.int(3, 4), n = t.int(5, 10), choose = (x, y) => { let r = 1; for (let i = 1; i <= y; i++) r = r * (x - y + i) / i; return Math.round(r); };
      return num(`How many ways can ${n} identical sweets be shared among ${k} children (some may get none)?`, choose(n + k - 1, k - 1),
        `Stars and bars: ${n} stars and ${k - 1} bars in a row, C(${n + k - 1}, ${k - 1}) = ${choose(n + k - 1, k - 1)}.`,
        `from itertools import product\nprint(sum(1 for c in product(range(${n} + 1), repeat=${k}) if sum(c) == ${n}))`);
    }
    if (form === 2) {
      const word = t.pick(['LEVEL', 'BANANA', 'COOKIE', 'GRAPH', 'TOFFEE', 'ALGEBRA']);
      const fact = x => (x <= 1 ? 1 : x * fact(x - 1)), counts = {};
      for (const ch of word) counts[ch] = (counts[ch] || 0) + 1;
      const n = fact(word.length) / Object.values(counts).reduce((p, c) => p * fact(c), 1);
      return num(`How many distinct arrangements are there of the letters of ${word}?`, n,
        `${word.length}! divided by the factorial of each repeated letter's count (${Object.entries(counts).filter(([, c]) => c > 1).map(([k, c]) => `${k}×${c}`).join(', ') || 'none repeat'}) = ${n}.`,
        `from itertools import permutations\nprint(len(set(permutations('${word}'))))`);
    }
    const n = t.int(5, 8), k = t.int(2, 3);
    let ways = 0; const choose = (x, y) => { let r = 1; for (let i = 1; i <= y; i++) r = r * (x - y + i) / i; return Math.round(r); };
    ways = choose(n, k) - choose(n - 2, k - 2);
    return num(`A team of ${k} is chosen from ${n} people, but Ana and Ben refuse to serve together. How many teams are possible?`, ways,
      `All teams C(${n}, ${k}) = ${choose(n, k)}, minus those with both: C(${n - 2}, ${k - 2}) = ${choose(n - 2, k - 2)}. That leaves ${ways}.`,
      `from itertools import combinations\nprint(sum(1 for T in combinations(range(${n}), ${k}) if not (0 in T and 1 in T)))`);
  }),

  SKILL('dm.pigeon', 'The pigeonhole principle', 'The fewest items that guarantee some box gets enough.', t => {
    const [m, what] = t.pick([[12, 'birth months'], [7, 'days of the week'], [26, 'first letters'], [10, 'last digits']]), k = t.int(2, 5);
    const n = (k - 1) * m + 1;
    return num(`What is the fewest people needed to be sure that at least ${k} share the same of ${m} ${what}?`, n,
      `With (k − 1)·m = ${(k - 1) * m} people each box could hold only ${k - 1}. One more forces a box to ${k}: ${n}.`,
      `m, k = ${m}, ${k}\nn = 1\nwhile True:\n    worst = max(n - (k - 1) * m, 0)\n    if worst > 0:\n        break\n    n += 1\nprint(n)`);
  }),

  SKILL('dm.asymp', 'Asymptotic growth', 'Which function grows fastest — the order notation that running times are stated in.', t => {
    // Each function as log f(n), written in L = ln n, so nothing overflows at n = 10^300 — far past every crossover.
    const FNS = [
      ['log n', 'log(L)'], ['(log n)²', '2*log(L)'], ['√n', '0.5*L'], ['n', 'L'], ['n log n', 'L + log(L)'], ['n¹·⁵', '1.5*L'],
      ['n²', '2*L'], ['n³', '3*L'], ['2^√n', 'exp(0.5*L)*log(2)'], ['2ⁿ', 'exp(L)*log(2)'], ['n!', 'lgamma(exp(L) + 1)'],
    ];
    const order = ['log n', '(log n)²', '√n', 'n', 'n log n', 'n¹·⁵', 'n²', 'n³', '2^√n', '2ⁿ', 'n!'];
    const picked = t.pickN(FNS, 4), names = picked.map(f => f[0]).sort((a, b) => order.indexOf(b) - order.indexOf(a));
    return mc('Which of these grows fastest as n → ∞?', names[0], names.slice(1),
      `From slowest to fastest: ${order.join(' ≺ ')}.`,
      `from math import *\nL = 300*log(10)\nf = {${picked.map(([u, py]) => `${JSON.stringify(u)}: ${py}`).join(', ')}}\nprint(max(f, key=f.get))`);
  }),

  SKILL('dm.sumbound', 'Bounding sums', 'Trap a sum between integrals, as the 6.042 midterm does for Σ 1/i^p.', t => {
    const p = t.pick([1.5, 2, 3]), upper = 1 + 1 / (p - 1);
    return num(`The integral method bounds Σ from i = 1 to ∞ of 1/i^${p} above by f(1) + ∫ from 1 to ∞ of x^(−${p}) dx. What is that upper bound?`, Math.round(upper * 1e4) / 1e4,
      `f(1) = 1 and ∫ from 1 to ∞ of x^(−${p}) dx = 1/(${p} − 1) = ${Math.round(1 / (p - 1) * 1e4) / 1e4}. The bound is ${Math.round(upper * 1e4) / 1e4}; the lower bound, the integral alone, differs by exactly 1.`,
      `from math import *\nf = lambda x: x**(-${p})\na, b, n = 1, 1e6, 2000000\nh = (log(b) - log(a)) / n\nI = sum(f(exp(log(a) + (i + 0.5)*h)) * exp(log(a) + (i + 0.5)*h) * h for i in range(n)) + b**(1-${p})/(${p}-1)\nS = sum(f(i) for i in range(1, 2000000))\nassert I <= S <= 1 + I\nprint(1 + I)`, { tol: 0.002, dp: 4 });
  }),

  SKILL('dm.prob', 'Discrete probability', 'Count outcomes in a sample space, including conditional probability.', t => {
    const form = t.int(0, 2);
    if (form === 0) {
      const s = t.int(4, 10), d = t.int(1, 6);
      let both = 0, given = 0;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a === d || b === d) { given++; if (a + b === s) both++; }
      return num(`Two fair dice are rolled. Given that at least one shows ${d}, what is the probability the total is ${s}? (4 decimal places)`, Math.round(both / given * 1e4) / 1e4,
        `${given} of the 36 outcomes show a ${d}; ${both} of those total ${s}. ${both}/${given}.`,
        `from itertools import product\nB = [(a, b) for a, b in product(range(1, 7), repeat=2) if ${d} in (a, b)]\nprint(sum(1 for a, b in B if a + b == ${s}) / len(B))`, { tol: 0.0001, dp: 4 });
    }
    if (form === 1) {
      const n = t.int(3, 5), k = t.int(1, n);
      let hits = 0; for (let m = 0; m < 2 ** n; m++) { let c = 0; for (let i = 0; i < n; i++) if (m >> i & 1) c++; if (c >= k) hits++; }
      return num(`A fair coin is flipped ${n} times. What is the probability of at least ${k} heads? (4 decimal places)`, Math.round(hits / 2 ** n * 1e4) / 1e4,
        `Count the ${2 ** n} equally likely sequences: ${hits} have at least ${k} heads.`,
        `from itertools import product\nprint(sum(1 for s in product('HT', repeat=${n}) if s.count('H') >= ${k}) / 2**${n})`, { tol: 0.0001, dp: 4 });
    }
    let total = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) total += Math.max(a, b);
    return num('Two fair dice are rolled. What is the expected value of the larger of the two? (4 decimal places)', Math.round(total / 36 * 1e4) / 1e4,
      'Expectation is the average over all 36 equally likely outcomes: 161/36.',
      'from itertools import product\nprint(sum(max(a, b) for a, b in product(range(1, 7), repeat=2)) / 36)', { tol: 0.0001, dp: 4 });
  }),
];
