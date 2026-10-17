/**
 * Electrical Engineering: information theory, wireless links and robot
 * planning (6.02, NPTEL information theory, Feedback Systems, ROS).
 * FE Electrical and Computer: Communications, Software.
 *
 * Checks take another route: optimal codes found by trying every set of
 * codeword lengths, capacity by maximising mutual information over inputs,
 * fading error rates by integrating over the channel, inverse kinematics by
 * searching joint space, shortest paths by Bellman–Ford instead of
 * breadth-first search, and robot motion by integrating its kinematics.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));

export const EEAUTO = [
  SKILL('info.huffman', 'Huffman coding', 'Huffman merges the two least likely symbols repeatedly; its average length is within one bit of the entropy and no prefix code does better.', t => {
    const n = t.int(4, 6), counts = Array.from({ length: n }, () => t.int(1, 12)), tot = counts.reduce((a, b) => a + b, 0), p = counts.map(c => c / tot);
    let nodes = p.map((w, i) => ({ w, syms: [i] })), len = Array(n).fill(0);
    while (nodes.length > 1) {
      nodes.sort((a, b) => a.w - b.w);
      const [a, b] = nodes.splice(0, 2);
      for (const s of [...a.syms, ...b.syms]) len[s]++;
      nodes.push({ w: a.w + b.w, syms: [...a.syms, ...b.syms] });
    }
    const L = p.reduce((s, q, i) => s + q * len[i], 0), H = -p.reduce((s, q) => s + q * Math.log2(q), 0);
    return num(`A source emits ${n} symbols with counts ${counts.join(', ')} (out of ${tot}). What is the average codeword length of a Huffman code for it, in bits per symbol? (4 significant figures)`, r4(L),
      `Merging the two least likely symbols each time gives lengths ${len.join(', ')}, so L = Σ pᵢlᵢ = ${r4(L)} bits; the entropy is ${r4(H)} bits.`,
      `import itertools\n# try every set of codeword lengths that satisfies Kraft's inequality and keep the cheapest\ncounts = ${JSON.stringify(counts)}\ntot = sum(counts); p = [c / tot for c in counts]; n = len(p)\nbest = min(sum(q * l for q, l in zip(p, ls)) for ls in itertools.product(range(1, n), repeat=n) if sum(2.0 ** -l for l in ls) <= 1 + 1e-12)\nprint(best)`);
  }),

  SKILL('info.bsc', 'Capacity of a binary symmetric channel', 'A channel that flips bits with probability p carries at most C = 1 − H₂(p) bits per use, reached with equally likely inputs.', t => {
    const p = t.pick([0.01, 0.02, 0.05, 0.1, 0.2, 0.3]), H = x => -x * Math.log2(x) - (1 - x) * Math.log2(1 - x), C = 1 - H(p);
    return num(`A binary symmetric channel flips each bit with probability ${p}. What is its capacity, in bits per channel use? (4 significant figures)`, r4(C),
      `C = 1 − H₂(${p}) = 1 − ${r4(H(p))} = ${r4(C)} bits per use.`,
      `import math\n# maximise the mutual information I(X;Y) over the input distribution\np = ${p}\nH = lambda x: 0.0 if x in (0, 1) else -x * math.log2(x) - (1 - x) * math.log2(1 - x)\nI = lambda q: H(q * (1 - p) + (1 - q) * p) - H(p)\nlo, hi = 0.0, 1.0\nfor _ in range(200):\n    a, b = lo + (hi - lo) / 3, hi - (hi - lo) / 3\n    lo, hi = (a, hi) if I(a) < I(b) else (lo, b)\nprint(I(lo))`);
  }),

  SKILL('com.rayleigh', 'Errors on a fading channel', 'Averaged over Rayleigh fading, BPSK errs with probability ½(1 − √(γ̄/(1 + γ̄))): it falls only as 1/γ̄, which is why diversity matters.', t => {
    const db = t.pick([5, 10, 15, 20, 25, 30]), g = 10 ** (db / 10), pb = 0.5 * (1 - Math.sqrt(g / (1 + g)));
    return num(`BPSK runs over a Rayleigh-fading channel with an average SNR per bit of ${db} dB. What is the average bit error probability? (4 significant figures)`, r4(pb),
      `P_b = ½(1 − √(γ̄/(1 + γ̄))) with γ̄ = ${r4(g)}: ${pb.toPrecision(4)} — far worse than ${(0.5 * erfcApprox(Math.sqrt(g))).toPrecision(3)} without fading.`,
      `import math\n# average the AWGN error rate Q(sqrt(2 gamma)) over the exponential distribution of the instantaneous SNR\ng = 10 ** (${db} / 10)\n# substitute gamma = u^2 so the integrand is smooth at zero\nN = 400000; top = math.sqrt(40 * g); h = top / N\nprint(sum(0.5 * math.erfc((i + .5) * h) * math.exp(-((i + .5) * h) ** 2 / g) / g * 2 * (i + .5) * h * h for i in range(N)))`);
  }),

  SKILL('rob.ik2', 'Two-link inverse kinematics', 'For a planar two-link arm, cos θ₂ = (x² + y² − L₁² − L₂²)/(2L₁L₂); then θ₁ = atan2(y, x) − atan2(L₂ sin θ₂, L₁ + L₂ cos θ₂).', t => {
    const L1 = t.pick([0.4, 0.5, 1]), L2 = t.pick([0.3, 0.4, 0.8]), a = (t.int(1, 10) * 15 * Math.PI) / 180, b = (t.int(1, 9) * 15 * Math.PI) / 180;
    const x = r4(L1 * Math.cos(a) + L2 * Math.cos(a + b)), y = r4(L1 * Math.sin(a) + L2 * Math.sin(a + b));
    const c2 = Math.max(-1, Math.min(1, (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2))), t2 = Math.acos(c2), t1raw = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2)), t1 = Math.atan2(Math.sin(t1raw), Math.cos(t1raw)); // keep θ₁ in (−180°, 180°]
    const ask = t.pick(['t1', 't2']), deg = ((ask === 't1' ? t1 : t2) * 180) / Math.PI;
    return num(`A planar arm has links of ${L1} m and ${L2} m. Taking the elbow-down solution (θ₂ > 0, measured from link 1), what joint angle ${ask === 't1' ? 'θ₁' : 'θ₂'} puts the end-effector at (${x}, ${y}) m, in degrees? (4 significant figures)`, r4(deg),
      `cos θ₂ = (x² + y² − L₁² − L₂²)/(2L₁L₂) gives θ₂ = ${r4((t2 * 180) / Math.PI)}°; then θ₁ = atan2(y, x) − atan2(L₂ sin θ₂, L₁ + L₂ cos θ₂) = ${r4((t1 * 180) / Math.PI)}°.`,
      `import math\n# search joint space (elbow-down) for the angles whose forward kinematics land on the target, then refine with Newton steps\nL1, L2, X, Y = ${L1}, ${L2}, ${x}, ${y}\nfk = lambda a, b: (L1 * math.cos(a) + L2 * math.cos(a + b), L1 * math.sin(a) + L2 * math.sin(a + b))\nerr = lambda a, b: (fk(a, b)[0] - X) ** 2 + (fk(a, b)[1] - Y) ** 2\nbest = min(((i * math.pi / 360 - math.pi, j * math.pi / 360) for i in range(720) for j in range(1, 360)), key=lambda ab: err(*ab))\na, b = best\nfor _ in range(50):\n    ex, ey = fk(a, b)[0] - X, fk(a, b)[1] - Y\n    J = [[-L1 * math.sin(a) - L2 * math.sin(a + b), -L2 * math.sin(a + b)], [L1 * math.cos(a) + L2 * math.cos(a + b), L2 * math.cos(a + b)]]\n    det = J[0][0] * J[1][1] - J[0][1] * J[1][0]\n    if abs(det) < 1e-12: break\n    a -= (J[1][1] * ex - J[0][1] * ey) / det; b -= (-J[1][0] * ex + J[0][0] * ey) / det\nprint(math.degrees(${ask === 't1' ? 'a' : 'b'}))`, { tol: 0.05 });
  }),

  SKILL('plan.grid', 'Shortest paths on a grid', 'Breadth-first search (or A* with an admissible heuristic) finds the fewest moves between two cells around obstacles.', t => {
    const n = t.pick([6, 7]);
    let grid, dist;
    for (;;) {
      grid = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => ((r === 0 && c === 0) || (r === n - 1 && c === n - 1) ? 0 : t.rng() < 0.3 ? 1 : 0)));
      dist = Array.from({ length: n }, () => Array(n).fill(-1));
      dist[0][0] = 0;
      const q = [[0, 0]];
      while (q.length) { const [r, c] = q.shift(); for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const rr = r + dr, cc = c + dc; if (rr >= 0 && cc >= 0 && rr < n && cc < n && !grid[rr][cc] && dist[rr][cc] < 0) { dist[rr][cc] = dist[r][c] + 1; q.push([rr, cc]); } } }
      if (dist[n - 1][n - 1] > 0) break;
    }
    const rows = grid.map(r => r.map(v => (v ? '#' : '.')).join('')).join(' / ');
    return num(`On this ${n}×${n} grid (rows top to bottom, # is an obstacle): ${rows}. Moving up, down, left or right, what is the fewest number of moves from the top-left cell to the bottom-right cell?`, dist[n - 1][n - 1],
      `Breadth-first search from the start reaches the goal after ${dist[n - 1][n - 1]} moves; the obstacle-free minimum would be ${2 * (n - 1)}.`,
      `# Bellman-Ford over every free cell: relax all edges until no distance improves\ngrid = ${JSON.stringify(grid)}\nn = len(grid); INF = 10 ** 9\nd = {(r, c): INF for r in range(n) for c in range(n) if not grid[r][c]}\nd[(0, 0)] = 0\nfor _ in range(n * n):\n    changed = False\n    for (r, c), v in list(d.items()):\n        for rr, cc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):\n            if (rr, cc) in d and v + 1 < d[(rr, cc)]: d[(rr, cc)] = v + 1; changed = True\n    if not changed: break\nprint(d[(n - 1, n - 1)])`, { rtol: 0, tol: 0, dp: 0 });
  }),

  SKILL('rob.diffdrive', 'Differential-drive motion', 'A differential-drive robot moves at v = r(ω_R + ω_L)/2 and turns at ω = r(ω_R − ω_L)/b; constant wheel speeds trace a circular arc.', t => {
    const r = t.pick([0.03, 0.05, 0.1]), b = t.pick([0.2, 0.3, 0.5]), wl = t.pick([5, 8, 10]), wr = wl + t.pick([1, 2, 4, -2]), T = t.pick([1, 2, 3]), ask = t.pick(['dist', 'head']);
    const v = (r * (wr + wl)) / 2, w = (r * (wr - wl)) / b, th = w * T, x = (v / w) * Math.sin(th), y = (v / w) * (1 - Math.cos(th));
    const ans = ask === 'dist' ? Math.hypot(x, y) : (th * 180) / Math.PI;
    return num(`A differential-drive robot (wheel radius ${r} m, track ${b} m) starts at the origin facing +x. Its left wheel turns at ${wl} rad/s and its right at ${wr} rad/s for ${T} s. What is ${ask === 'dist' ? 'its straight-line distance from the start, in metres' : 'its final heading, in degrees'}? (4 significant figures)`, r4(ans),
      `v = r(ω_R + ω_L)/2 = ${r4(v)} m/s and ω = r(ω_R − ω_L)/b = ${r4(w)} rad/s; it follows an arc of radius ${r4(v / w)} m, ending ${r4(Math.hypot(x, y))} m away at heading ${r4((th * 180) / Math.PI)}°.`,
      `import math\n# integrate x' = v cos(theta), y' = v sin(theta), theta' = omega with RK4\nr, b, wl, wr, T = ${r}, ${b}, ${wl}, ${wr}, ${T}\nv, w = r * (wr + wl) / 2, r * (wr - wl) / b\nf = lambda s: [v * math.cos(s[2]), v * math.sin(s[2]), w]\ns, n = [0.0, 0.0, 0.0], 20000\nh = T / n\nfor _ in range(n):\n    k1 = f(s); k2 = f([a + h / 2 * c for a, c in zip(s, k1)]); k3 = f([a + h / 2 * c for a, c in zip(s, k2)]); k4 = f([a + h * c for a, c in zip(s, k3)])\n    s = [a + h / 6 * (p + 2 * q + 2 * rr + z) for a, p, q, rr, z in zip(s, k1, k2, k3, k4)]\nprint(${ask === 'dist' ? 'math.hypot(s[0], s[1])' : 'math.degrees(s[2])'})`);
  }),
];

/** erfc for the explanation text only (not the answer). */
function erfcApprox(x) { const t = 1 / (1 + 0.5 * x); return t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); }
