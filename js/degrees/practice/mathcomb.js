/**
 * Mathematics: combinatorics and graph theory (Applied Combinatorics) —
 * compositions with bounds, derangements, Stirling and Catalan numbers,
 * chromatic numbers and maximum matchings. QAA MSOR 3.10; GRE Mathematics:
 * Additional topics.
 *
 * The generator uses formulas, recurrences, backtracking or augmenting paths;
 * each check enumerates every object by brute force.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const C = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

export const MATHCOMB = [
  SKILL('comb.stars', 'Stars and bars', 'Solutions of x₁ + … + x_k = n in non-negative integers: C(n + k − 1, k − 1) — and inclusion–exclusion for upper bounds.', t => {
    const k = t.int(3, 4), n = t.int(5, 12), cap = t.rng() < 0.5 ? null : t.int(2, 5);
    let v = 0;
    if (cap == null) v = C(n + k - 1, k - 1);
    else for (let j = 0; j <= k; j++) v += (-1) ** j * C(k, j) * C(n - j * (cap + 1) + k - 1, k - 1);
    return num(`How many solutions does x₁ + … + x_${k} = ${n} have in integers with 0 ≤ xᵢ${cap == null ? '' : ` ≤ ${cap}`}?`, v,
      cap == null ? `Stars and bars: C(${n} + ${k} − 1, ${k} − 1) = ${v}.` : `Start from C(${n + k - 1}, ${k - 1}) and use inclusion–exclusion over the variables forced above ${cap}: Σ (−1)ʲ C(${k}, j) C(${n} − ${cap + 1}j + ${k - 1}, ${k - 1}) = ${v}. Equivalently the coefficient of x^${n} in (1 + x + … + x^${cap})^${k}.`,
      `from itertools import product\nprint(sum(1 for xs in product(range(${cap == null ? n : cap} + 1), repeat=${k}) if sum(xs) == ${n}))`);
  }),

  SKILL('comb.derange', 'Derangements', 'Permutations with no fixed point: Dₙ = n! Σ (−1)ᵏ/k!, close to n!/e.', t => {
    const n = t.int(3, 8); const D = [1, 0]; for (let i = 2; i <= n; i++) D[i] = (i - 1) * (D[i - 1] + D[i - 2]);
    return num(`${n} people each bring a hat; the hats are handed back at random. In how many of the ${n}! ways does nobody get their own hat?`, D[n],
      `Derangements: Dₙ = (n − 1)(Dₙ₋₁ + Dₙ₋₂), so D_${n} = ${D[n]} — about ${(D[n] / [1, 1, 2, 6, 24, 120, 720, 5040, 40320][n] * 100).toFixed(1)}% of all arrangements, close to 1/e.`,
      `from itertools import permutations\nprint(sum(1 for p in permutations(range(${n})) if all(p[i] != i for i in range(${n}))))`);
  }),

  SKILL('comb.stirling', 'Set partitions', 'S(n, k) counts the ways to split n labelled items into k non-empty unlabelled groups.', t => {
    const n = t.int(4, 7), k = t.int(2, Math.min(4, n - 1));
    const S = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0)); S[0][0] = 1;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= i; j++) S[i][j] = j * S[i - 1][j] + S[i - 1][j - 1];
    return num(`In how many ways can ${n} different people be split into ${k} non-empty teams (the teams are not labelled)?`, S[n][k],
      `Stirling number of the second kind: S(n, k) = k·S(n−1, k) + S(n−1, k−1), giving S(${n}, ${k}) = ${S[n][k]}.`,
      `from itertools import product\n# label the teams, keep only onto labellings, then forget the labels\nimport math\nprint(sum(1 for f in product(range(${k}), repeat=${n}) if len(set(f)) == ${k}) // math.factorial(${k}))`);
  }),

  SKILL('comb.catalan', 'Catalan numbers', 'Balanced bracketings, monotone lattice paths under the diagonal, triangulations: Cₙ = C(2n, n)/(n + 1).', t => {
    const n = t.int(2, 7), v = C(2 * n, n) / (n + 1), form = t.pick(['brackets', 'paths']);
    return num(form === 'brackets' ? `How many strings of ${n} pairs of brackets are balanced, like (()())?` : `How many lattice paths go from (0, 0) to (${n}, ${n}) with unit steps right and up, never rising above the diagonal y = x?`, v,
      `The Catalan number C_${n} = C(${2 * n}, ${n})/${n + 1} = ${v}. The reflection principle subtracts the C(${2 * n}, ${n + 1}) bad paths from C(${2 * n}, ${n}).`,
      `from itertools import product\ndef ok(s):\n    d = 0\n    for c in s:\n        d += 1 if c else -1\n        if d < 0: return False\n    return d == 0\nprint(sum(1 for s in product((1, 0), repeat=${2 * n}) if ok(s)))`);
  }),

  SKILL('comb.chromatic', 'Chromatic number', 'The fewest colours so that adjacent vertices differ.', t => {
    const n = t.int(5, 7), E = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (t.rng() < 0.5) E.push([i, j]);
    if (!E.length) E.push([0, 1]);
    const adj = Array.from({ length: n }, () => new Set()); E.forEach(([a, b]) => { adj[a].add(b); adj[b].add(a); });
    const colourable = k => { const col = Array(n).fill(-1); const go = v => { if (v === n) return true; for (let c = 0; c < k; c++) if ([...adj[v]].every(u => col[u] !== c)) { col[v] = c; if (go(v + 1)) return true; col[v] = -1; } return false; }; return go(0); };
    let k = 1; while (!colourable(k)) k++;
    return num(`A graph on vertices 0–${n - 1} has edges ${E.map(e => e.join('–')).join(', ')}. What is its chromatic number?`, k,
      `Backtracking finds a proper ${k}-colouring and none with ${k - 1}${k >= 3 ? '; look for an odd cycle or a clique as the certificate of the lower bound' : ''}.`,
      `from itertools import product\nn, E = ${n}, ${PY(E)}\nprint(next(k for k in range(1, n + 1) if any(all(c[a] != c[b] for a, b in E) for c in product(range(k), repeat=n))))`);
  }),

  SKILL('comb.matching', 'Bipartite matching', 'The largest matching — and by König\'s theorem, the smallest vertex cover has the same size.', t => {
    const L = t.int(3, 5), R = t.int(3, 5), E = [];
    for (let i = 0; i < L; i++) for (let j = 0; j < R; j++) if (t.rng() < 0.35) E.push([i, j]);
    if (!E.length) E.push([0, 0]);
    const match = Array(R).fill(-1);
    const aug = (u, seen) => { for (const [a, b] of E) if (a === u && !seen.has(b)) { seen.add(b); if (match[b] < 0 || aug(match[b], seen)) { match[b] = u; return true; } } return false; };
    let size = 0; for (let u = 0; u < L; u++) if (aug(u, new Set())) size++;
    const names = i => String.fromCharCode(65 + i);
    return num(`Workers ${[...Array(L).keys()].map(names).join(', ')} and jobs 1–${R}. Worker–job pairs that are allowed: ${E.map(([a, b]) => `${names(a)}${b + 1}`).join(', ')}. What is the largest number of workers that can be given distinct jobs?`, size,
      `Augmenting paths grow a matching of size ${size}; by König's theorem a vertex cover of size ${size} certifies that no larger matching exists.`,
      `from itertools import combinations\nE = ${PY(E)}\nbest = 0\nfor k in range(1, min(${L}, ${R}) + 1):\n    if any(len({a for a, _ in S}) == k and len({b for _, b in S}) == k for S in combinations(E, k)): best = k\nprint(best)`);
  }),
];
