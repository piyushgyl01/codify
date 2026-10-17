/**
 * Mechanical Engineering: statics and the mechanics of deformable bars
 * (8.01SC, Engineering Statics, FE Mechanical topics 6 and 8).
 *
 * Checks take another route: distributed loads broken into many small point
 * loads and the equilibrium equations solved about a different point,
 * elongations integrated numerically along the bar, whole trusses solved
 * joint by joint as one linear system, belt tension integrated around the
 * wrap, screw threads unrolled into an inclined plane, and second moments of
 * area summed over thin strips.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));

export const MESTATICS = [
  SKILL('sta.beam', 'Beam reactions', 'For a simply supported beam, take moments about one support to find the other reaction, then sum vertical forces: ΣM = 0, ΣF = 0.', t => {
    const L = t.pick([4, 5, 6, 8, 10]), k = t.int(1, 2);
    const P = Array.from({ length: k }, () => t.pick([5, 8, 10, 12, 15, 20])), a = P.map(() => t.int(1, 2 * L - 1) / 2);
    const w = t.pick([0, 2, 3, 4, 5]), c = t.int(0, L - 2), d = t.int(c + 1, L), ask = t.pick(['A', 'B']);
    const tot = P.reduce((s, p) => s + p, 0) + w * (d - c);
    const RB = (P.reduce((s, p, i) => s + p * a[i], 0) + w * (d - c) * (c + d) / 2) / L, RA = tot - RB, R = ask === 'A' ? RA : RB;
    const loads = P.map((p, i) => `${p} kN at x = ${a[i]} m`).join(' and ');
    return num(`A ${L} m beam rests on a pin at A (x = 0) and a roller at B (x = ${L} m). It carries ${loads}${w ? `, and a uniform load of ${w} kN/m from x = ${c} m to x = ${d} m` : ''}. Ignoring its own weight, what is the vertical reaction at ${ask}, in kN? (4 significant figures)`, r4(R),
      `Moments about A: R_B·${L} = Σ Pᵢaᵢ${w ? ` + ${w}·${d - c}·${(c + d) / 2}` : ''}, so R_B = ${r4(RB)} kN. Vertical forces: R_A = ${r4(tot)} − R_B = ${r4(RA)} kN.`,
      `# break the distributed load into many small point loads, then solve both equilibrium equations, taking moments about x = L/3\nL, P, a, w, c, d = ${L}, ${JSON.stringify(P)}, ${JSON.stringify(a)}, ${w}, ${c}, ${d}\nN = 100000\nloads = list(zip(P, a)) + [(w * (d - c) / N, c + (i + 0.5) * (d - c) / N) for i in range(N)]\nx0 = L / 3\nF = sum(f for f, _ in loads); M = sum(f * (x - x0) for f, x in loads)\n# RA + RB = F and RA(0 - x0) + RB(L - x0) = M\nRB = (M + x0 * F) / L; RA = F - RB\nprint(${ask === 'A' ? 'RA' : 'RB'})`);
  }),

  SKILL('sol.axial', 'Axial deformation', 'A bar in tension stretches δ = ∫ P/(A(x)E) dx: PL/AE for a uniform bar, and 4PL/(πE d₁d₂) for one tapering from d₁ to d₂.', t => {
    const [name, E] = t.pick([['steel', 200], ['aluminium', 70], ['titanium', 110], ['brass', 100]]);
    const L = t.pick([0.5, 0.8, 1, 1.2, 1.5, 2]), P = t.pick([10, 20, 25, 40, 50, 80]), d1 = t.pick([10, 12, 16, 20]), d2 = d1 + t.pick([0, 4, 6, 8, 10]);
    const dl = 4 * P * 1e3 * L / (Math.PI * E * 1e9 * d1 * 1e-3 * d2 * 1e-3) * 1e3;
    const shape = d1 === d2 ? `a uniform ${name} rod ${d1} mm in diameter` : `a solid ${name} rod tapering uniformly from ${d1} mm diameter at one end to ${d2} mm at the other`;
    return num(`A ${L} m length of ${shape} (E = ${E} GPa) carries an axial tension of ${P} kN. How much does it stretch, in mm? (4 significant figures)`, r4(dl),
      `δ = ∫ P dx/(A(x)E). ${d1 === d2 ? `For a uniform rod that is PL/AE` : `For a linear taper it integrates to 4PL/(πE d₁d₂)`} = ${r4(dl)} mm.`,
      `import math\n# integrate the strain P/(A(x) E) along the rod with Simpson's rule\nP, L, E, d1, d2 = ${P} * 1e3, ${L}, ${E} * 1e9, ${d1} * 1e-3, ${d2} * 1e-3\nf = lambda x: P / (math.pi * (d1 + (d2 - d1) * x / L) ** 2 / 4 * E)\nn = 2000; h = L / n\ns = f(0) + f(L) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, n))\nprint(s * h / 3 * 1e3)`);
  }),

  SKILL('sta.resultant', 'Resultant of a force system', 'Any planar force system reduces to one resultant R = ΣF, whose line of action is placed so its moment matches ΣM.', t => {
    let F, Rx, Ry;
    do {
      F = Array.from({ length: 3 }, () => [t.pick([-30, -20, -10, 10, 20, 30, 40]), t.pick([-40, -30, -20, -10, 10, 20])]);
      Rx = F.reduce((s, f) => s + f[0], 0); Ry = F.reduce((s, f) => s + f[1], 0);
    } while (Math.abs(Ry) < 5);
    const P = F.map(() => [t.int(0, 8), t.int(0, 4)]), C = t.pick([0, -50, -20, 20, 50]);
    const M = F.reduce((s, f, i) => s + P[i][0] * f[1] - P[i][1] * f[0], 0) + C, x = M / Ry, ask = t.pick(['R', 'x']);
    const desc = F.map((f, i) => `(${f[0]}, ${f[1]}) kN at (${P[i][0]}, ${P[i][1]}) m`).join(', ');
    return num(`Three forces act on a plate: ${desc}${C ? `, plus a couple of ${C} kN·m (anticlockwise positive)` : ''}. What is ${ask === 'R' ? 'the magnitude of the resultant, in kN' : 'the x coordinate, in m, where the resultant\'s line of action crosses the x-axis'}? (4 significant figures)`, r4(ask === 'R' ? Math.hypot(Rx, Ry) : x),
      `R = (${Rx}, ${Ry}) kN, |R| = ${r4(Math.hypot(Rx, Ry))} kN. ΣM_O = Σ(xF_y − yF_x)${C ? ` + ${C}` : ''} = ${M} kN·m; on the x-axis the resultant's moment is x·R_y, so x = ${M}/${Ry} = ${r4(x)} m.`,
      ask === 'R'
        ? `import math\nF = ${JSON.stringify(F)}\n# add the forces head to tail\nx = y = 0.0\nfor fx, fy in F: x += fx; y += fy\nprint(math.hypot(x, y))`
        : `# bisect along the x-axis for the point about which the whole system has zero moment\nF, P, C = ${JSON.stringify(F)}, ${JSON.stringify(P)}, ${C}\nM = lambda x0: sum((p[0] - x0) * f[1] - p[1] * f[0] for f, p in zip(F, P)) + C\nlo, hi = -1e4, 1e4\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if (M(m) > 0) == (M(lo) > 0) else (lo, m)\nprint(lo)`);
  }),

  SKILL('sta.truss', 'Trusses: the method of sections', 'Cut through three members and take moments about where two of them meet: the third member\'s force falls out of one equation.', t => {
    const N = t.pick([4, 6]), a = t.pick([2, 3, 4]), h = t.pick([2, 3, 4]), loads = Array.from({ length: N - 1 }, () => t.pick([0, 5, 10, 15, 20]));
    if (loads.every(v => v === 0)) loads[N / 2 - 1] = 10;
    const k = t.int(1, N - 2), ask = t.pick(['bottom', 'top', 'diag']), L = Math.hypot(a, h);
    const RB = loads.reduce((s, p, i) => s + p * (i + 1) * a, 0) / (N * a), RA = loads.reduce((s, p) => s + p, 0) - RB;
    const Mx = x => RA * x - loads.reduce((s, p, i) => s + ((i + 1) * a < x ? p * (x - (i + 1) * a) : 0), 0);
    const V = RA - loads.slice(0, k).reduce((s, p) => s + p, 0), left = k + 1 <= N / 2;
    const F = { bottom: (left ? Mx(k * a) : Mx((k + 1) * a)) / h, top: -(left ? Mx((k + 1) * a) : Mx(k * a)) / h, diag: (left ? 1 : -1) * V * L / h }[ask];
    const member = { bottom: `the bottom chord between x = ${k * a} and ${(k + 1) * a} m`, top: `the top chord between x = ${k * a} and ${(k + 1) * a} m`, diag: `the diagonal in the panel from x = ${k * a} to ${(k + 1) * a} m` }[ask];
    return num(`A Pratt truss spans ${N * a} m in ${N} panels of ${a} m, ${h} m deep, pinned at the left support and on a roller at the right. Its diagonals run down toward mid-span, and the end posts slope from the supports to the first top joints. The bottom joints carry ${loads.map((p, i) => `${p} kN at x = ${(i + 1) * a} m`).join(', ')}. What is the force in ${member}, in kN (tension positive)? (4 significant figures)`, r4(F),
      `Reactions: R_A = ${r4(RA)} kN, R_B = ${r4(RB)} kN. Cut through panel ${k + 1}. ${ask === 'diag' ? `Vertical forces on the left part: shear ${r4(V)} kN = F·h/L, so F = ${r4(F)} kN.` : `Moments about the joint where the other two cut members meet, which carries the bending moment of a simple beam there: F = ±M/h = ${r4(F)} kN.`}`,
      `import math\n# solve the whole truss by the method of joints: one linear system for every member force and reaction\nN, a, h, loads = ${N}, ${a}, ${h}, ${JSON.stringify(loads)}\nnodes = {('B', i): (i * a, 0.0) for i in range(N + 1)}\nnodes.update({('T', i): (i * a, float(h)) for i in range(1, N)})\nmem = [(('B', i), ('B', i + 1)) for i in range(N)] + [(('T', i), ('T', i + 1)) for i in range(1, N - 1)]\nmem += [(('B', i), ('T', i)) for i in range(1, N)] + [(('B', 0), ('T', 1)), (('B', N), ('T', N - 1))]\nmem += [(('T', i), ('B', i + 1)) if i + 1 <= N // 2 else (('T', i + 1), ('B', i)) for i in range(1, N - 1)]\nnames = list(nodes); idx = {n: j for j, n in enumerate(names)}\nunk = len(mem) + 3; A = [[0.0] * unk for _ in range(2 * len(names))]; b = [0.0] * (2 * len(names))\nfor m, (p, q) in enumerate(mem):\n    (x1, y1), (x2, y2) = nodes[p], nodes[q]; Lm = math.hypot(x2 - x1, y2 - y1)\n    for n, s in ((p, 1), (q, -1)):\n        A[2 * idx[n]][m] += s * (x2 - x1) / Lm; A[2 * idx[n] + 1][m] += s * (y2 - y1) / Lm\nA[2 * idx[('B', 0)]][len(mem)] = 1; A[2 * idx[('B', 0)] + 1][len(mem) + 1] = 1; A[2 * idx[('B', N)] + 1][len(mem) + 2] = 1\nfor i, P in enumerate(loads): b[2 * idx[('B', i + 1)] + 1] = P\nM = [row + [v] for row, v in zip(A, b)]; n = len(M)\nfor c in range(n):\n    piv = max(range(c, n), key=lambda r: abs(M[r][c])); M[c], M[piv] = M[piv], M[c]\n    for r in range(n):\n        if r != c and M[r][c]:\n            f = M[r][c] / M[c][c]; M[r] = [u - f * v for u, v in zip(M[r], M[c])]\nx = [M[i][n] / M[i][i] for i in range(n)]\nk = ${k}\nwant = {'bottom': (('B', k), ('B', k + 1)), 'top': (('T', k), ('T', k + 1)), 'diag': (('T', k), ('B', k + 1)) if k + 1 <= N // 2 else (('T', k + 1), ('B', k))}['${ask}']\nprint(x[mem.index(want)])`);
  }),

  SKILL('sta.friction', 'Friction: belts and screws', 'A rope on a drum holds T₂ = T₁e^(μβ). A square-thread screw needs torque T = W·r·tan(φ + λ) to raise a load, where tan φ = μ and tan λ = lead/(2πr).', t => {
    const mode = t.pick(['belt', 'screw']), mu = t.pick([0.1, 0.15, 0.2, 0.25, 0.3]);
    if (mode === 'belt') {
      const turns = t.pick([0.5, 1, 1.5, 2, 2.5]), W = t.pick([500, 1000, 2000, 5000]), beta = 2 * Math.PI * turns, T1 = W / Math.exp(mu * beta);
      return num(`A rope wrapped ${turns} turns around a fixed post (μ = ${mu}) holds a ${W} N load. What is the smallest pull on the free end that stops the load slipping, in N? (4 significant figures)`, r4(T1),
        `T_load = T_pull·e^(μβ) with β = 2π·${turns} = ${r4(beta)} rad, so T_pull = ${W}/e^(${r4(mu * beta)}) = ${r4(T1)} N.`,
        `import math\n# integrate dT/dtheta = mu T around the wrap (RK4) from a unit pull, then scale to the load\nmu, beta, W = ${mu}, 2 * math.pi * ${turns}, ${W}\nn = 10000; h = beta / n; T = 1.0\nfor _ in range(n):\n    k1 = mu * T; k2 = mu * (T + h / 2 * k1); k3 = mu * (T + h / 2 * k2); k4 = mu * (T + h * k3)\n    T += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)\nprint(W / T)`);
    }
    const d = t.pick([20, 25, 30, 40]), lead = t.pick([4, 5, 6, 8, 10]), W = t.pick([5, 10, 20, 30]), r = d / 2;
    const lam = Math.atan(lead / (2 * Math.PI * r)), phi = Math.atan(mu), T = W * 1e3 * r * 1e-3 * Math.tan(phi + lam);
    return num(`A square-thread screw jack has mean diameter ${d} mm and lead ${lead} mm, with μ = ${mu} on the thread (ignore collar friction). What torque raises a ${W} kN load, in N·m? (4 significant figures)`, r4(T),
      `Lead angle λ = atan(${lead}/(π·${d})) = ${r4(lam * 180 / Math.PI)}°, friction angle φ = atan ${mu} = ${r4(phi * 180 / Math.PI)}°. T = W r tan(φ + λ) = ${r4(T)} N·m.`,
      `import math\n# unroll the thread into an incline of angle lambda; a horizontal push P at the mean radius moves the load up it.\n# Solve the two equilibrium equations for P and the normal force N, with friction mu N opposing the motion.\nW, r, lead, mu = ${W} * 1e3, ${r} * 1e-3, ${lead} * 1e-3, ${mu}\nlam = math.atan(lead / (2 * math.pi * r)); c, s = math.cos(lam), math.sin(lam)\n# along the incline: P c - W s - mu N = 0 ; normal to it: N - P s - W c = 0\na11, a12, b1 = c, -mu, W * s\na21, a22, b2 = -s, 1.0, W * c\ndet = a11 * a22 - a12 * a21\nP = (b1 * a22 - a12 * b2) / det\nprint(P * r)`);
  }),

  SKILL('sta.inertia', 'Second moment of area', 'For a composite section, find the centroid, then add each part\'s own I plus its area times the squared distance to the centroid: I = Σ(Īᵢ + Aᵢdᵢ²).', t => {
    const shape = t.pick(['T', 'I']), bf = t.pick([100, 120, 150, 200]), tf = t.pick([10, 12, 15, 20]), hw = t.pick([100, 150, 200]), tw = t.pick([8, 10, 12]);
    const parts = shape === 'T' ? [[bf, tf, hw + tf / 2], [tw, hw, hw / 2]] : [[bf, tf, hw + tf + tf / 2], [tw, hw, tf + hw / 2], [bf, tf, tf / 2]];
    const A = parts.reduce((s, [b, hh]) => s + b * hh, 0), yb = parts.reduce((s, [b, hh, y]) => s + b * hh * y, 0) / A;
    const I = parts.reduce((s, [b, hh, y]) => s + b * hh ** 3 / 12 + b * hh * (y - yb) ** 2, 0), ask = t.pick(['y', 'I']);
    const desc = shape === 'T' ? `a T-section: a ${bf} × ${tf} mm flange on top of a ${tw} mm thick, ${hw} mm deep web` : `a symmetric I-section: two ${bf} × ${tf} mm flanges joined by a ${tw} mm thick, ${hw} mm deep web`;
    return num(`A beam has ${desc}. What is ${ask === 'y' ? 'the height of its centroid above the bottom, in mm' : 'its second moment of area about the horizontal axis through the centroid, in 10⁶ mm⁴'}? (4 significant figures)`, r4(ask === 'y' ? yb : I / 1e6),
      `ȳ = ΣAᵢyᵢ/ΣAᵢ = ${r4(yb)} mm. I = Σ(bh³/12 + A d²) = ${r4(I / 1e6)} × 10⁶ mm⁴.`,
      `# slice the section into 200 000 thin horizontal strips and sum y dA and y^2 dA\nparts = ${JSON.stringify(parts)}\ntop = max(y + hh / 2 for b, hh, y in parts); n = 200000; dy = top / n\nwidth = lambda y: sum(b for b, hh, yc in parts if abs(y - yc) < hh / 2)\nstrips = [((i + 0.5) * dy, width((i + 0.5) * dy) * dy) for i in range(n)]\nA = sum(dA for _, dA in strips); yb = sum(y * dA for y, dA in strips) / A\nI = sum((y - yb) ** 2 * dA for y, dA in strips)\nprint(${ask === 'y' ? 'yb' : 'I / 1e6'})`);
  }),

  SKILL('sta.bracket', 'Frames: a strut-braced bracket', 'A strut pinned at both ends and loaded only there is a two-force member: its force acts along its line, which turns a frame into a few equilibrium equations.', t => {
    const L = t.pick([1.5, 2, 2.5, 3]), c = t.pick([0.8, 1, 1.2, 1.5].filter(v => v < L)), dd = t.pick([0.6, 0.8, 1, 1.2]), W = t.pick([2, 5, 8, 10]), ask = t.pick(['strut', 'pin']);
    const Ls = Math.hypot(c, dd), F = W * L * Ls / (c * dd), Ax = F * c / Ls, Ay = W - F * dd / Ls, Ap = Math.hypot(Ax, Ay);
    return num(`A horizontal arm ${L} m long is pinned to a wall at A and carries ${W} kN at its free end. A strut, pinned at both ends, runs from the arm ${c} m out from A down to the wall ${dd} m below A. Ignoring self-weight, what is ${ask === 'strut' ? 'the compressive force in the strut, in kN' : 'the magnitude of the pin force at A, in kN'}? (4 significant figures)`, r4(ask === 'strut' ? F : Ap),
      `Moments about A: F·(${dd}/${r4(Ls)})·${c} = ${W}·${L}, so F = ${r4(F)} kN. Then A_x = F·${c}/${r4(Ls)} = ${r4(Ax)} kN and A_y = ${W} − F·${dd}/${r4(Ls)} = ${r4(Ay)} kN: |A| = ${r4(Ap)} kN.`,
      `import math\n# unknowns A_x, A_y and the strut's compression F along its line; three equilibrium equations, with moments about the free end\nL, c, d, W = ${L}, ${c}, ${dd}, ${W}\nLs = math.hypot(c, d); ux, uy = c / Ls, d / Ls\nM = [[1.0, 0.0, ux, 0.0], [0.0, 1.0, uy, W], [0.0, -L, (c - L) * uy, 0.0]]\nfor col in range(3):\n    piv = max(range(col, 3), key=lambda r: abs(M[r][col])); M[col], M[piv] = M[piv], M[col]\n    for r in range(3):\n        if r != col:\n            f = M[r][col] / M[col][col]; M[r] = [a - f * b for a, b in zip(M[r], M[col])]\nAx, Ay, F = (M[i][3] / M[i][i] for i in range(3))\nprint(${ask === 'strut' ? 'F' : 'math.hypot(Ax, Ay)'})`);
  }),

  SKILL('sta.distload', 'Distributed loads on a cantilever', 'A distributed load acts like its resultant — the area under w(x) — placed at the centroid of that area.', t => {
    const L = t.pick([2, 3, 4, 5]), w1 = t.pick([0, 2, 4, 6]), w2 = t.pick([4, 6, 8, 10, 12]), ask = t.pick(['V', 'M']);
    const R = (w1 + w2) / 2 * L, xb = L * (w1 + 2 * w2) / (3 * (w1 + w2)), Mf = R * xb;
    return num(`A ${L} m cantilever is fixed at x = 0. It carries a distributed load rising linearly from ${w1} kN/m at the wall to ${w2} kN/m at the free end. What is ${ask === 'V' ? 'the vertical reaction at the wall, in kN' : 'the magnitude of the moment reaction at the wall, in kN·m'}? (4 significant figures)`, r4(ask === 'V' ? R : Mf),
      `Resultant = area = (${w1} + ${w2})/2 · ${L} = ${r4(R)} kN, at x̄ = L(w₁ + 2w₂)/(3(w₁ + w₂)) = ${r4(xb)} m. Wall moment = ${r4(R)} · ${r4(xb)} = ${r4(Mf)} kN·m.`,
      `# add up the load in many thin slices, and each slice's moment about the wall\nL, w1, w2 = ${L}, ${w1}, ${w2}\nn = 200000; dx = L / n\nw = lambda x: w1 + (w2 - w1) * x / L\nV = sum(w((i + 0.5) * dx) * dx for i in range(n)); M = sum(w((i + 0.5) * dx) * dx * (i + 0.5) * dx for i in range(n))\nprint(${ask === 'V' ? 'V' : 'M'})`);
  }),
];
