/**
 * CS501 Artificial Intelligence — CS188-style questions with exact answers:
 * uniform-cost and A* search, minimax with alpha-beta pruning, constraint
 * satisfaction, Bayes-net inference, value iteration and Q-learning.
 * CS2023 AI-Search, AI-KRR, AI-Probability, AI-Planning, AI-ML (RL).
 *
 * Checks: separate search implementations, brute-force game-tree and CSP
 * enumeration, inference by full joint enumeration, and Python simulation.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const r4 = x => Math.round(x * 10000) / 10000;

export const AIPLAN = [
  SKILL('ai.search', 'Search: UCS and A*', 'Uniform-cost search and A* find the cheapest path; a consistent heuristic lets A* expand less.', t => {
    const n = 6, edges = [];
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (t.rng() < 0.45) edges.push([u, v, t.int(1, 9)]);
    for (let u = 0; u < n - 1; u++) if (!edges.some(e => e[0] === u && e[1] === u + 1)) edges.push([u, u + 1, t.int(3, 9)]);
    const adj = Array.from({ length: n }, () => []); edges.forEach(([u, v, w]) => { adj[u].push([v, w]); adj[v].push([u, w]); });
    const dist = Array(n).fill(Infinity); dist[0] = 0; const done = new Set();
    while (done.size < n) { let u = -1; for (let v = 0; v < n; v++) if (!done.has(v) && (u < 0 || dist[v] < dist[u])) u = v; done.add(u); for (const [v, w] of adj[u]) dist[v] = Math.min(dist[v], dist[u] + w); }
    const name = i => String.fromCharCode(65 + i);
    return num(`Undirected graph, edge costs: ${edges.map(([u, v, w]) => `${name(u)}–${name(v)} ${w}`).join(', ')}. What path cost does uniform-cost search (or A* with an admissible heuristic) return from A to ${name(n - 1)}?`, dist[n - 1],
      `UCS expands nodes in order of path cost g; A* in order of g + h, and with an admissible h it returns the same optimal cost: ${dist[n - 1]}.`,
      `from itertools import permutations\nE = ${PY(edges)}\nw = {}\nfor u, v, c in E: w[(u, v)] = w[(v, u)] = c\nbest = float('inf')\nmid = range(1, ${n - 1})\nfor k in range(0, ${n - 1}):\n    for p in permutations(mid, k):\n        path = (0, *p, ${n - 1})\n        if all((a, b) in w for a, b in zip(path, path[1:])):\n            best = min(best, sum(w[(a, b)] for a, b in zip(path, path[1:])))\nprint(best)`);
  }),

  SKILL('ai.minimax', 'Minimax and alpha-beta', 'The value of a game tree, and how many leaves alpha-beta never looks at.', t => {
    const leaves = Array.from({ length: 9 }, () => t.int(0, 9)), groups = [0, 1, 2].map(i => leaves.slice(3 * i, 3 * i + 3));
    const value = Math.max(...groups.map(g => Math.min(...g)));
    let alpha = -Infinity, evaluated = 0;
    for (const g of groups) { let v = Infinity; for (const x of g) { evaluated++; v = Math.min(v, x); if (v <= alpha) break; } alpha = Math.max(alpha, v); }
    const ask = t.rng() < 0.5 ? 'value' : 'evaluated';
    return num(`A max node has three min children, whose leaves are, left to right, (${groups.map(g => g.join(', ')).join('), (')}). ${ask === 'value' ? 'What is the minimax value at the root?' : 'Searching left to right with alpha-beta pruning, how many leaves are evaluated?'}`, ask === 'value' ? value : evaluated,
      `Root value = max of the minimums = ${value}. Alpha-beta prunes a min node as soon as one of its leaves is no better than what max already has: ${evaluated} of 9 leaves evaluated.`,
      ask === 'value' ? `G = ${PY(groups)}\nprint(max(min(g) for g in G))`
        : `G = ${PY(groups)}\nseen = 0\ndef ab(node, depth, a, b, maximize):\n    global seen\n    if depth == 0:\n        seen += 1; return node\n    if maximize:\n        v = float('-inf')\n        for c in node:\n            v = max(v, ab(c, depth - 1, a, b, False)); a = max(a, v)\n            if a >= b: break\n        return v\n    v = float('inf')\n    for c in node:\n        v = min(v, ab(c, depth - 1, a, b, True)); b = min(b, v)\n        if b <= a: break\n    return v\nab(G, 2, float('-inf'), float('inf'), True)\nprint(seen)`);
  }),

  SKILL('ai.csp', 'Constraint satisfaction', 'Count the solutions of a map-colouring problem — and see why ordering and propagation matter.', t => {
    const regions = ['A', 'B', 'C', 'D', 'E'].slice(0, t.int(4, 5)), k = t.pick([2, 3, 3, 4]), edges = [];
    for (let i = 0; i < regions.length; i++) for (let j = i + 1; j < regions.length; j++) if (t.rng() < 0.5) edges.push([regions[i], regions[j]]);
    if (!edges.length) edges.push([regions[0], regions[1]]);
    let count = 0;
    const assign = (i, col) => { if (i === regions.length) { count++; return; } for (let c = 0; c < k; c++) { if (edges.every(([a, b]) => !((a === regions[i] && col[b] === c) || (b === regions[i] && col[a] === c)))) { col[regions[i]] = c; assign(i + 1, col); delete col[regions[i]]; } } };
    assign(0, {});
    return num(`Colour regions ${regions.join(', ')} with ${k} colours so that neighbours differ. Neighbours: ${edges.map(e => e.join('–')).join(', ')}. How many valid colourings are there?`, count,
      `Backtracking search: assign a region, check its neighbours, continue; count each complete assignment. ${count} in total.${count === 0 ? ' With this few colours the constraint graph cannot be coloured.' : ''}`,
      `from itertools import product\nR, E, k = ${PY(regions)}, ${PY(edges)}, ${k}\nprint(sum(1 for cols in product(range(k), repeat=len(R)) if all(cols[R.index(a)] != cols[R.index(b)] for a, b in E)))`);
  }),

  SKILL('ai.bayesnet', 'Bayes nets', 'Inference in Burglary → Alarm ← Earthquake, by enumeration.', t => {
    const pB = t.pick([0.001, 0.01, 0.05]), pE = t.pick([0.002, 0.02, 0.1]);
    const pA = { TT: t.pick([0.95, 0.9]), TF: t.pick([0.94, 0.8]), FT: t.pick([0.29, 0.3]), FF: t.pick([0.001, 0.01]) };
    let num1 = 0, den = 0;
    for (const b of [true, false]) for (const e of [true, false]) {
      const p = (b ? pB : 1 - pB) * (e ? pE : 1 - pE) * pA[`${b ? 'T' : 'F'}${e ? 'T' : 'F'}`];
      den += p; if (b) num1 += p;
    }
    const ans = num1 / den;
    return num(`Burglary (P = ${pB}) and Earthquake (P = ${pE}) are independent causes of Alarm: P(A | B, E) = ${pA.TT}, P(A | B, ¬E) = ${pA.TF}, P(A | ¬B, E) = ${pA.FT}, P(A | ¬B, ¬E) = ${pA.FF}. Given the alarm sounds, what is P(Burglary)? (4 decimal places)`, r4(ans),
      `Sum the joint over the hidden variable: P(B, A) = Σₑ P(B)P(e)P(A | B, e), P(A) = Σ_b,e P(b)P(e)P(A | b, e). Divide: ${r4(ans)}.`,
      `import random\nfrom fractions import Fraction as F\npB, pE = F('${pB}'), F('${pE}')\npA = {(1, 1): F('${pA.TT}'), (1, 0): F('${pA.TF}'), (0, 1): F('${pA.FT}'), (0, 0): F('${pA.FF}')}\njoint = {(b, e, a): (pB if b else 1 - pB) * (pE if e else 1 - pE) * (pA[(b, e)] if a else 1 - pA[(b, e)]) for b in (0, 1) for e in (0, 1) for a in (0, 1)}\nprint(float(sum(p for (b, e, a), p in joint.items() if b and a) / sum(p for (b, e, a), p in joint.items() if a)))`, { tol: 0.0001, dp: 4 });
  }),

  SKILL('ai.mdp', 'Value iteration', 'Bellman backups on a small MDP until the values settle.', t => {
    const R = [0, 0, t.pick([1, 5, 10])], g = t.pick([0.5, 0.8, 0.9]), p = t.pick([0.8, 0.9, 1]), k = t.int(1, 4);
    // A chain s0 → s1 → s2 (terminal, reward on entry); action "right" succeeds with p, else stays.
    let V = [0, 0, 0];
    for (let it = 0; it < k; it++) {
      const nv = [...V];
      for (const s of [0, 1]) nv[s] = Math.max(p * (R[s + 1] + g * (s + 1 === 2 ? 0 : V[s + 1])) + (1 - p) * g * V[s], g * V[s]);
      V = nv;
    }
    return num(`A chain s0 → s1 → s2. From s0 or s1 the action "right" moves one step with probability ${p} (else stays); "stay" stays. Entering s2 (terminal) pays ${R[2]}; every other step pays 0; discount ${g}. Starting from V = 0, what is V(s0) after ${k} round${k > 1 ? 's' : ''} of value iteration? (4 decimal places)`, r4(V[0]),
      `Each round: V(s) ← max over actions of Σ P(s′|s,a)[R + γV(s′)]. Reward has to propagate back one state per round, so V(s0) stays 0 until round 2. After ${k}: ${r4(V[0])}.`,
      `p, g, R = ${p}, ${g}, ${R[2]}\nV = {0: 0.0, 1: 0.0, 2: 0.0}\nfor _ in range(${k}):\n    new = dict(V)\n    for s in (0, 1):\n        nxt = s + 1\n        right = p * ((R if nxt == 2 else 0) + g * (0 if nxt == 2 else V[nxt])) + (1 - p) * (g * V[s])\n        new[s] = max(right, g * V[s])\n    V = new\nprint(V[0])`, { tol: 0.0001, dp: 4 });
  }),

  SKILL('ai.qlearn', 'Q-learning', 'One temporal-difference update: Q ← Q + α(r + γ max Q′ − Q).', t => {
    const q = t.int(-2, 6), r = t.int(-1, 5), a = t.pick([0.1, 0.2, 0.5]), g = t.pick([0.9, 0.99]), nexts = [t.int(-2, 8), t.int(-2, 8), t.int(-2, 8)];
    const nq = q + a * (r + g * Math.max(...nexts) - q);
    return num(`Q(s, a) = ${q}. Taking a gives reward ${r} and lands in s′, where Q(s′, ·) = ${nexts.join(', ')}. With α = ${a} and γ = ${g}, what is Q(s, a) after one Q-learning update? (4 decimal places)`, r4(nq),
      `Target r + γ max Q(s′, ·) = ${r} + ${g} × ${Math.max(...nexts)} = ${r4(r + g * Math.max(...nexts))}; move ${a} of the way: ${q} + ${a}(${r4(r + g * Math.max(...nexts))} − ${q}) = ${r4(nq)}. It uses the max (off-policy), unlike SARSA.`,
      `from fractions import Fraction as F\nq, r, a, g = F(${q}), F(${r}), F('${a}'), F('${g}')\ntarget = r + g * max(F(x) for x in ${PY(nexts)})\nprint(float((1 - a) * q + a * target))`, { tol: 0.0001, dp: 4 });
  }),
];
