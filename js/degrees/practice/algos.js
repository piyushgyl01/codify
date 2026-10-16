/**
 * CS301 Algorithm Design — 6.046-style analysis with exact answers: the
 * master theorem and exact recurrences, weighted interval scheduling (where
 * greedy fails), maximum flow and its certificate, vertex cover and its
 * 2-approximation, and satisfiability for reductions. CS2023 AL-Strategies,
 * AL-Complexity, AL-Foundational 13.
 *
 * Checks are deliberately different routes to the answer: brute force over
 * every subset or every cut (max-flow = min-cut) in Python, never the
 * generator's own algorithm.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const fmtPow = e => (e === 0 ? '1' : e === 1 ? 'n' : Number.isInteger(e) ? `n^${e}` : `n^${e.toFixed(2)}`);

export const ALGOS = [
  SKILL('alg.master', 'Recurrences and the master theorem', 'Read the running time of divide and conquer off its recurrence — and compute one exactly.', t => {
    if (t.rng() < 0.6) {
      const a = t.pick([1, 2, 3, 4, 7, 8]), b = t.pick([2, 2, 4]), d = t.pick([0, 1, 2, 3]);
      const crit = Math.log(a) / Math.log(b), cmp = Math.abs(crit - d) < 1e-9 ? 0 : crit > d ? 1 : -1;
      const right = cmp === 0 ? `Θ(${fmtPow(d)} log n)` : cmp > 0 ? `Θ(${fmtPow(crit)})` : `Θ(${fmtPow(d)})`;
      const pool = [`Θ(${fmtPow(d)})`, `Θ(${fmtPow(d)} log n)`, `Θ(${fmtPow(crit)})`, `Θ(${fmtPow(crit)} log n)`, `Θ(${fmtPow(d + 1)})`];
      const wrong = [...new Set(pool)].filter(x => x !== right).slice(0, 3);
      return { kind: 'mc', q: `T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${fmtPow(d) === '1' ? 'Θ(1)' : `Θ(${fmtPow(d)})`}. What is T(n)?`, options: [right, ...wrong], correct: 0,
        explain: `Compare the work at the leaves, n^(log_${b} ${a}) = ${fmtPow(crit)}, with the work at the root, ${fmtPow(d)}. ${cmp === 0 ? 'They tie, so every level costs the same and there are log n levels.' : cmp > 0 ? 'The leaves dominate.' : 'The root dominates.'} So ${right}.`,
        python: `import math\na, b, d = ${a}, ${b}, ${d}\nc = math.log(a) / math.log(b)\ndef f(e):\n    if e == 0: return '1'\n    if e == 1: return 'n'\n    return f'n^{int(e)}' if abs(e - round(e)) < 1e-9 else f'n^{e:.2f}'\nif abs(c - d) < 1e-9: print(f'Θ({f(d)} log n)')\nelif c > d: print(f'Θ({f(c)})')\nelse: print(f'Θ({f(d)})')` };
    }
    const a = t.pick([2, 3, 4]), c = t.pick([1, 2, 3]), k = t.int(3, 6), n = 2 ** k;
    const T = m => (m === 1 ? 1 : a * T(m / 2) + c * m);
    return num(`T(1) = 1 and T(n) = ${a}T(n/2) + ${c === 1 ? '' : c}n for n a power of 2. What is T(${n}) exactly?`, T(n),
      `Unroll it level by level, or just compute T(2), T(4), … up to T(${n}) = ${T(n)}.`,
      `from functools import lru_cache\n@lru_cache(None)\ndef T(n):\n    return 1 if n == 1 else ${a} * T(n // 2) + ${c} * n\nprint(T(${n}))`);
  }),

  SKILL('alg.wis', 'Weighted interval scheduling', 'When jobs have values, earliest-finish greedy fails; dynamic programming over sorted finishes does not.', t => {
    const jobs = Array.from({ length: t.int(5, 7) }, () => { const s = t.int(0, 12); return [s, s + t.int(2, 5), t.int(1, 12)]; });
    const byF = [...jobs].sort((x, y) => x[1] - y[1]);
    const p = byF.map((j, i) => { let k = i - 1; while (k >= 0 && byF[k][1] > j[0]) k--; return k; });
    const M = []; byF.forEach((j, i) => { M[i] = Math.max(i ? M[i - 1] : 0, j[2] + (p[i] >= 0 ? M[p[i]] : 0)); });
    const best = M.at(-1);
    let greedy = 0, end = -1; for (const j of byF) if (j[0] >= end) { greedy += j[2]; end = j[1]; }
    const askGreedy = t.rng() < 0.3;
    return num(`Jobs (start, finish, value): ${jobs.map(j => `(${j.join(', ')})`).join(', ')}. Jobs may touch but not overlap. ${askGreedy ? 'What total value does earliest-finish greedy (ignoring values) collect?' : 'What is the largest total value of a compatible set?'}`, askGreedy ? greedy : best,
      `Sort by finish; M[i] = max(M[i−1], v_i + M[p(i)]) where p(i) is the last job finishing by job i's start. Optimum ${best}; earliest-finish greedy gets ${greedy}${greedy < best ? ', which is why greedy is wrong here' : ''}.`,
      askGreedy
        ? `jobs = sorted(${PY(jobs)}, key=lambda j: j[1])\ntotal, end = 0, -1\nfor s, f, v in jobs:\n    if s >= end: total += v; end = f\nprint(total)`
        : `from itertools import combinations\njobs = ${PY(jobs)}\nbest = 0\nfor k in range(len(jobs) + 1):\n    for c in combinations(jobs, k):\n        c = sorted(c, key=lambda j: j[0])\n        if all(c[i][1] <= c[i + 1][0] for i in range(len(c) - 1)):\n            best = max(best, sum(j[2] for j in c))\nprint(best)`);
  }),

  SKILL('alg.maxflow', 'Maximum flow and minimum cut', 'Augment along residual paths; a minimum cut certifies the answer.', t => {
    const n = t.int(4, 6), cap = Array.from({ length: n }, () => Array(n).fill(0)), edges = [];
    for (let u = 0; u < n - 1; u++) for (let v = 1; v < n; v++) if (u !== v && v > u && t.rng() < 0.55) { cap[u][v] = t.int(1, 9); edges.push([u, v, cap[u][v]]); }
    if (!edges.some(e => e[0] === 0)) { cap[0][1] = t.int(1, 9); edges.push([0, 1, cap[0][1]]); }
    if (!edges.some(e => e[1] === n - 1)) { cap[n - 2][n - 1] = t.int(1, 9); edges.push([n - 2, n - 1, cap[n - 2][n - 1]]); }
    // Edmonds–Karp
    const r = cap.map(row => [...row]); let flow = 0;
    for (;;) {
      const prev = Array(n).fill(-1); prev[0] = 0; const q = [0];
      while (q.length && prev[n - 1] < 0) { const u = q.shift(); for (let v = 0; v < n; v++) if (prev[v] < 0 && r[u][v] > 0) { prev[v] = u; q.push(v); } }
      if (prev[n - 1] < 0) break;
      let b = Infinity; for (let v = n - 1; v !== 0; v = prev[v]) b = Math.min(b, r[prev[v]][v]);
      for (let v = n - 1; v !== 0; v = prev[v]) { r[prev[v]][v] -= b; r[v][prev[v]] += b; }
      flow += b;
    }
    const name = i => (i === 0 ? 's' : i === n - 1 ? 't' : String.fromCharCode(96 + i));
    return num(`Directed network, source s and sink t. Edges (capacity): ${edges.sort((x, y) => x[0] - y[0] || x[1] - y[1]).map(([u, v, c]) => `${name(u)}→${name(v)} (${c})`).join(', ')}. What is the maximum flow from s to t?`, flow,
      `Augment along shortest residual paths until none is left: ${flow}. The nodes still reachable from s in the residual graph form a minimum cut whose capacity is exactly ${flow} — the certificate that nothing better exists.`,
      `from itertools import product\nn, E = ${n}, ${PY(edges)}\nbest = None\nfor side in product([0, 1], repeat=n - 2):\n    S = {0} | {i + 1 for i, x in enumerate(side) if x}\n    c = sum(w for u, v, w in E if u in S and v not in S)\n    best = c if best is None else min(best, c)\nprint(best)`);
  }),

  SKILL('alg.vc', 'Vertex cover and approximation', 'The matching-based 2-approximation against the true minimum.', t => {
    const n = t.int(5, 7), edges = [];
    for (let u = 1; u <= n; u++) for (let v = u + 1; v <= n; v++) if (t.rng() < 0.35) edges.push([u, v]);
    if (edges.length < 3) edges.push([1, 2], [2, 3], [3, 4]);
    const order = t.shuffle(edges), covered = new Set();
    for (const [u, v] of order) if (!covered.has(u) && !covered.has(v)) { covered.add(u); covered.add(v); }
    let best = n;
    for (let m = 0; m < 1 << n; m++) { const S = new Set(Array.from({ length: n }, (_, i) => i + 1).filter(v => m >> (v - 1) & 1)); if (edges.every(([u, v]) => S.has(u) || S.has(v))) best = Math.min(best, S.size); }
    const askApprox = t.rng() < 0.5;
    return num(`Graph on 1..${n}, edges in this order: ${order.map(([u, v]) => `${u}–${v}`).join(', ')}. ${askApprox ? 'The 2-approximation scans the edges in that order and, for any edge with neither end covered, adds both ends. How big is the cover it returns?' : 'What is the size of a minimum vertex cover?'}`, askApprox ? covered.size : best,
      `The approximation picks a maximal matching and takes both ends: ${covered.size} vertices. The true minimum is ${best}. Any cover must hit each matched edge separately, so the approximation is never more than twice the optimum.`,
      askApprox
        ? `cov = set()\nfor u, v in ${PY(order)}:\n    if u not in cov and v not in cov: cov |= {u, v}\nprint(len(cov))`
        : `from itertools import combinations\nE = ${PY(edges)}\nprint(next(k for k in range(${n} + 1) for S in combinations(range(1, ${n} + 1), k) if all(u in S or v in S for u, v in E)))`);
  }),

  SKILL('alg.sat', 'Satisfiability and reductions', 'Check a 3-CNF formula, and size the standard 3-SAT → vertex cover reduction.', t => {
    const vars = ['x', 'y', 'z', 'w'].slice(0, t.int(3, 4)), m = t.int(3, 5);
    const clauses = Array.from({ length: m }, () => t.pickN(vars, 3).map(v => (t.rng() < 0.5 ? `¬${v}` : v)));
    const text = clauses.map(c => `(${c.join(' ∨ ')})`).join(' ∧ ');
    if (t.rng() < 0.5) {
      let sat = false;
      for (let a = 0; a < 1 << vars.length && !sat; a++) { const val = Object.fromEntries(vars.map((v, i) => [v, !!(a >> i & 1)])); sat = clauses.every(c => c.some(l => (l[0] === '¬' ? !val[l.slice(1)] : val[l]))); }
      return { kind: 'mc', q: `Is ${text} satisfiable?`, options: sat ? ['Yes', 'No'] : ['No', 'Yes'], correct: 0,
        explain: sat ? 'Some assignment makes every clause true — try them, or reason clause by clause.' : `Every one of the ${2 ** vars.length} assignments falsifies some clause.`,
        python: `from itertools import product\nvs, C = ${PY(vars)}, ${PY(clauses)}\nlit = lambda l, a: (not a[l[1:]]) if l.startswith('¬') else a[l]\nprint('Yes' if any(all(any(lit(l, dict(zip(vs, bits))) for l in c) for c in C) for bits in product([False, True], repeat=len(vs))) else 'No')` };
    }
    const field = t.pick(['vertices', 'edges', 'k']), nv = vars.length;
    const ans = { vertices: 2 * nv + 3 * m, edges: nv + 6 * m, k: nv + 2 * m }[field];
    return num(`The standard reduction from 3-SAT to vertex cover builds, for ${text}, an edge for each variable (x and ¬x), a triangle for each clause, and an edge from each clause corner to its literal. ${field === 'k' ? 'The formula is satisfiable exactly when the graph has a vertex cover of size k. What is k?' : `How many ${field} does the graph have?`}`, ans,
      `${nv} variables and ${m} clauses: vertices 2·${nv} + 3·${m} = ${2 * nv + 3 * m}; edges ${nv} (variable) + 3·${m} (triangles) + 3·${m} (links) = ${nv + 6 * m}; k = ${nv} + 2·${m} = ${nv + 2 * m}, one per variable gadget and two per triangle.`,
      `vs, C = ${PY(vars)}, ${PY(clauses)}\nV = [(v, s) for v in vs for s in (0, 1)] + [(i, j) for i in range(len(C)) for j in range(3)]\nE = [((v, 0), (v, 1)) for v in vs]\nfor i, c in enumerate(C):\n    E += [((i, 0), (i, 1)), ((i, 1), (i, 2)), ((i, 0), (i, 2))]\n    E += [((i, j), (l.lstrip('¬'), 1 if l.startswith('¬') else 0)) for j, l in enumerate(c)]\nprint({'vertices': len(V), 'edges': len(E), 'k': len(vs) + 2 * len(C)}[${PY(field)}])`);
  }),
];
