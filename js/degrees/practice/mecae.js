/**
 * Mechanical Engineering: computational mechanics (2.092, 2.094, 2.29, the
 * NPARC verification tutorial; FE Mechanical topic 1.E).
 *
 * Checks take another route: bar elements assembled into a global stiffness
 * matrix and solved, two-bar trusses by statics and compatibility instead of
 * stiffness assembly, convergence orders by bisection on the three-mesh
 * equations, convection–diffusion by fine finite differences or by testing
 * each mesh for wiggles, and plate temperatures by over-relaxed Gauss–Seidel.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));

export const MECAE = [
  SKILL('cae.bar', 'Finite elements for a tapered bar', 'Linear bar elements with constant area each turn a tapered bar into springs in series; the error against the exact taper shrinks as the mesh is refined.', t => {
    const L = t.pick([0.5, 1, 1.5, 2]), d1 = t.pick([20, 30, 40]), d2 = d1 * t.pick([0.4, 0.5, 0.6]), E = t.pick([70, 200]), P = t.pick([5, 10, 20, 50]), N = t.pick([2, 3, 4, 6, 8]), ask = t.pick(['u', 'err']);
    const area = x => Math.PI * (d1 + (d2 - d1) * x / L) ** 2 / 4, h = L / N;
    let u = 0; for (let e = 0; e < N; e++) u += P * 1e3 * h * 1e3 / (E * 1e3 * area((e + 0.5) * h));
    const exact = 4 * P * 1e3 * L * 1e3 / (Math.PI * E * 1e3 * d1 * d2), err = (u - exact) / exact * 100;
    return num(`A ${L} m bar tapers linearly from ${d1} mm diameter at its fixed end to ${d2} mm at its free end (E = ${E} GPa) and carries ${P} kN axial tension at the tip. It is modelled with ${N} equal linear bar elements, each given the cross-section at its own midpoint. What is ${ask === 'u' ? 'the finite-element tip displacement, in mm' : 'the percentage error of that tip displacement against the exact value 4PL/(πEd₁d₂)'}? (4 significant figures)`, r4(ask === 'u' ? u : err),
      `Each element has stiffness EA_e/h; in series the tip moves Σ Ph/(EA_e) = ${r4(u)} mm. Exact: ${r4(exact)} mm, so the error is ${r4(err)}% — it falls roughly as 1/N².`,
      `import math\n# assemble the global stiffness matrix of the bar elements, fix node 0, and solve K u = F by elimination\nL, d1, d2, E, P, N = ${L} * 1e3, ${d1}, ${d2}, ${E} * 1e3, ${P} * 1e3, ${N}\nh = L / N; area = lambda x: math.pi * (d1 + (d2 - d1) * x / L) ** 2 / 4\nK = [[0.0] * (N + 1) for _ in range(N + 1)]\nfor e in range(N):\n    k = E * area((e + 0.5) * h) / h\n    for i, j, s in ((e, e, 1), (e, e + 1, -1), (e + 1, e, -1), (e + 1, e + 1, 1)): K[i][j] += s * k\nM = [row[1:] + [0.0] for row in K[1:]]; M[-1][-1] = P\nn = len(M)\nfor c in range(n):\n    for r in range(c + 1, n):\n        f = M[r][c] / M[c][c]; M[r] = [a - f * b for a, b in zip(M[r], M[c])]\nu = [0.0] * n\nfor i in range(n - 1, -1, -1): u[i] = (M[i][n] - sum(M[i][j] * u[j] for j in range(i + 1, n))) / M[i][i]\nexact_n = 2000; hh = L / exact_n; f = lambda x: P / (E * area(x))\nexact = (f(0) + f(L) + sum((4 if i % 2 else 2) * f(i * hh) for i in range(1, exact_n))) * hh / 3\nprint(${ask === 'u' ? 'u[-1]' : '(u[-1] - exact) / exact * 100'})`);
  }),

  SKILL('cae.truss2', 'Direct stiffness: a two-bar truss', 'Each bar adds (EA/L)·nnᵀ to the stiffness of the joint it shares; solving Ku = F gives the joint\'s displacement, and each bar\'s force follows from its stretch.', t => {
    const E = 200, A = t.pick([100, 200, 300, 500]), a1 = t.pick([30, 45, 60]), a2 = t.pick([120, 135, 150]), L1 = t.pick([1, 1.5, 2]), L2 = t.pick([1, 1.5, 2]), Fx = t.pick([0, 5, 10, -5]), Fy = t.pick([-10, -20, -30]), ask = t.pick(['ux', 'uy', 'F1']);
    // bars run from the free joint C (origin) up to supports at angles a1, a2 (degrees from +x)
    const n = a => [Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180)], n1 = n(a1), n2 = n(a2), k1 = E * 1e3 * A / (L1 * 1e3), k2 = E * 1e3 * A / (L2 * 1e3);
    const K = [[k1 * n1[0] ** 2 + k2 * n2[0] ** 2, k1 * n1[0] * n1[1] + k2 * n2[0] * n2[1]], [0, k1 * n1[1] ** 2 + k2 * n2[1] ** 2]]; K[1][0] = K[0][1];
    const det = K[0][0] * K[1][1] - K[0][1] * K[1][0], F = [Fx * 1e3, Fy * 1e3], u = [(F[0] * K[1][1] - K[0][1] * F[1]) / det, (K[0][0] * F[1] - K[1][0] * F[0]) / det];
    const T1 = -k1 * (u[0] * n1[0] + u[1] * n1[1]) / 1e3; // tension positive: the joint moving toward the support shortens the bar
    return num(`Two steel bars (E = 200 GPa, ${A} mm² each) meet at a free joint. Bar 1 is ${L1} m long and runs from the joint to a pinned support at ${a1}° above the +x axis; bar 2 is ${L2} m long, to a pinned support at ${a2}°. The joint carries (${Fx}, ${Fy}) kN. What is ${{ ux: 'the joint\'s x-displacement, in mm', uy: 'the joint\'s y-displacement, in mm', F1: 'the force in bar 1, in kN (tension positive)' }[ask]}? (4 significant figures)`, r4({ ux: u[0], uy: u[1], F1: T1 }[ask]),
      `Bar stiffnesses EA/L = ${r4(k1)} and ${r4(k2)} N/mm along n₁ = (${r4(n1[0])}, ${r4(n1[1])}), n₂ = (${r4(n2[0])}, ${r4(n2[1])}). K = Σk·nnᵀ; solving Ku = F gives u = (${r4(u[0])}, ${r4(u[1])}) mm. Bar 1 force = −k₁(u·n₁) = ${r4(T1)} kN.`,
      `import math\n# statics first: the joint's equilibrium gives both bar forces; then each bar's stretch F L/(E A) fixes u along it (compatibility)\nE, A, L1, L2 = 200e3, ${A}, ${L1} * 1e3, ${L2} * 1e3\nn1 = (math.cos(math.radians(${a1})), math.sin(math.radians(${a1}))); n2 = (math.cos(math.radians(${a2})), math.sin(math.radians(${a2})))\nFx, Fy = ${Fx} * 1e3, ${Fy} * 1e3\n# tensions T pull the joint toward each support: T1 n1 + T2 n2 + F = 0\ndet = n1[0] * n2[1] - n2[0] * n1[1]\nT1 = (-Fx * n2[1] + n2[0] * Fy) / det; T2 = (-n1[0] * Fy + Fx * n1[1]) / det\n# stretch of bar i = -(u . n_i) = T_i L_i / (E A)\ne1, e2 = -T1 * L1 / (E * A), -T2 * L2 / (E * A)\nux = (e1 * n2[1] - n1[1] * e2) / det; uy = (n1[0] * e2 - e1 * n2[0]) / det\nprint(${{ ux: 'ux', uy: 'uy', F1: 'T1 / 1e3' }[ask]})`);
  }),

  SKILL('cae.richardson', 'Mesh convergence and Richardson extrapolation', 'Three meshes refined by 2 give an observed order p = ln((f₁ − f₂)/(f₂ − f₃))/ln 2, an extrapolated answer f₃ + (f₃ − f₂)/(2^p − 1), and a grid-convergence index 1.25|ε|/(2^p − 1).', t => {
    const fstar = Number((t.pick([1, 2, 5, 10]) * (1 + t.rng())).toFixed(4)), p = Number((1.5 + t.rng()).toFixed(2)), C = (t.rng() < 0.5 ? -1 : 1) * fstar * t.pick([0.05, 0.1, 0.2]), h0 = 1;
    const f = [h0, h0 / 2, h0 / 4].map(h => Number((fstar + C * h ** p).toPrecision(7))), ask = t.pick(['p', 'fext', 'gci']);
    const po = Math.log((f[0] - f[1]) / (f[1] - f[2])) / Math.LN2, fext = f[2] + (f[2] - f[1]) / (2 ** po - 1), gci = 1.25 * Math.abs((f[2] - f[1]) / f[2]) / (2 ** po - 1) * 100;
    return num(`A simulation gives a peak stress of ${f[0]}, ${f[1]} and ${f[2]} MPa on three meshes, each with half the element size of the last. What is ${{ p: 'the observed order of convergence', fext: 'the Richardson-extrapolated value, in MPa', gci: 'the fine-mesh grid-convergence index, in percent (safety factor 1.25)' }[ask]}? (4 significant figures)`, r4({ p: po, fext, gci }[ask]),
      `p = ln((f₁ − f₂)/(f₂ − f₃))/ln 2 = ${r4(po)}. Extrapolated: f₃ + (f₃ − f₂)/(2^p − 1) = ${r4(fext)} MPa. GCI = 1.25·|(f₃ − f₂)/f₃|/(2^p − 1) = ${r4(gci)}%.`,
      `import math\n# fit f = F + C h^p through the three points: bisect on p, then solve for F\nf1, f2, f3 = ${f[0]}, ${f[1]}, ${f[2]}\nh = [1.0, 0.5, 0.25]\ndef resid(p):\n    C = (f1 - f2) / (h[0] ** p - h[1] ** p)\n    return (f2 - f3) - C * (h[1] ** p - h[2] ** p)\nlo, hi = 0.1, 6.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if (resid(m) > 0) == (resid(lo) > 0) else (lo, m)\np = lo; C = (f1 - f2) / (h[0] ** p - h[1] ** p); F = f3 - C * h[2] ** p\nprint(${{ p: 'p', fext: 'F', gci: '1.25 * abs((f3 - f2) / f3) / (2 ** p - 1) * 100' }[ask]})`);
  }),

  SKILL('cae.convdiff', 'Convection–diffusion and the cell Péclet number', 'Steady 1-D convection–diffusion has φ = (e^(Pe·x/L) − 1)/(e^(Pe) − 1). Central differencing stays free of wiggles only while the cell Péclet number ρuΔx/Γ ≤ 2.', t => {
    const Pe = t.pick([5, 9, 13, 17.5, 25, 31, 47]), ask = t.pick(['phi', 'N']), xr = t.pick([0.5, 0.8, 0.9, 0.95]);
    const phi = Math.expm1(Pe * xr) / Math.expm1(Pe), N = Math.ceil(Pe / 2 - 1e-12);
    return num(ask === 'phi' ? `In steady 1-D convection–diffusion with φ = 0 at x = 0 and φ = 1 at x = L, the global Péclet number ρuL/Γ is ${Pe}. What is the exact φ at x/L = ${xr}? (4 significant figures)` : `A 1-D convection–diffusion problem has global Péclet number ${Pe}. Using central differencing on a uniform mesh, what is the smallest number of intervals that keeps the solution free of oscillations?`, ask === 'phi' ? r4(phi) : N,
      `Exact: φ(x) = (e^(Pe·x/L) − 1)/(e^(Pe) − 1) = ${r4(phi)} at x/L = ${xr}. Central differencing needs cell Pe = Pe/N ≤ 2, so N ≥ ${Pe}/2: N = ${N}.`,
      ask === 'phi'
        ? `import math\n# solve the central-difference equations on a very fine mesh (Thomas algorithm) and read off phi\nPe, xr = ${Pe}, ${xr}\nN = 20000; Pc = Pe / N\na, b, c = 1 + Pc / 2, -2.0, 1 - Pc / 2   # phi[i-1], phi[i], phi[i+1]\nn = N - 1; d = [0.0] * n; d[-1] = -c * 1.0\nbb = [b] * n; dd = d[:]\nfor i in range(1, n):\n    m = a / bb[i - 1]; bb[i] -= m * c; dd[i] -= m * dd[i - 1]\nphi = [0.0] * n; phi[-1] = dd[-1] / bb[-1]\nfor i in range(n - 2, -1, -1): phi[i] = (dd[i] - c * phi[i + 1]) / bb[i]\nfull = [0.0] + phi + [1.0]\nprint(full[round(xr * N)])`
        : `# try meshes until the central-difference solution stops wiggling\nPe = ${Pe}\ndef wiggles(N):\n    Pc = Pe / N; a, b, c = 1 + Pc / 2, -2.0, 1 - Pc / 2\n    n = N - 1; bb = [b] * n; dd = [0.0] * n; dd[-1] = -c\n    for i in range(1, n):\n        m = a / bb[i - 1]; bb[i] -= m * c; dd[i] -= m * dd[i - 1]\n    phi = [0.0] * n; phi[-1] = dd[-1] / bb[-1]\n    for i in range(n - 2, -1, -1): phi[i] = (dd[i] - c * phi[i + 1]) / bb[i]\n    full = [0.0] + phi + [1.0]\n    return any(y < x - 1e-12 for x, y in zip(full, full[1:])) or min(full) < -1e-12 or max(full) > 1 + 1e-12\nN = 2\nwhile wiggles(N): N += 1\nprint(N)`, ask === 'N' ? { rtol: 0, tol: 0, dp: 0 } : {});
  }),

  SKILL('cae.fdgrid', 'Finite differences on a plate', 'For steady conduction with no sources, each interior node of a square grid is the average of its four neighbours; with fixed edge temperatures that gives one linear equation per node.', t => {
    const n = t.pick([3, 4]), T = { top: t.pick([100, 80, 50]), bottom: t.pick([0, 20]), left: t.pick([0, 30, 60]), right: t.pick([0, 40, 75]) }, r = t.int(0, n - 1), c = t.int(0, n - 1);
    const idx = (i, j) => i * n + j, m = n * n, A = Array.from({ length: m }, () => Array(m + 1).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const k = idx(i, j); A[k][k] = 4;
      for (const [di, dj, edge] of [[-1, 0, 'top'], [1, 0, 'bottom'], [0, -1, 'left'], [0, 1, 'right']]) { const ii = i + di, jj = j + dj; if (ii < 0 || ii >= n || jj < 0 || jj >= n) A[k][m] += T[edge]; else A[k][idx(ii, jj)] = -1; }
    }
    for (let col = 0; col < m; col++) { let p = col; for (let row = col + 1; row < m; row++) if (Math.abs(A[row][col]) > Math.abs(A[p][col])) p = row; [A[col], A[p]] = [A[p], A[col]]; for (let row = 0; row < m; row++) if (row !== col) { const f = A[row][col] / A[col][col]; for (let k = col; k <= m; k++) A[row][k] -= f * A[col][k]; } }
    const sol = A.map((row, i) => row[m] / row[i]), v = sol[idx(r, c)];
    return num(`A square plate is meshed with ${n} × ${n} interior nodes. Its edges are held at top ${T.top} °C, bottom ${T.bottom} °C, left ${T.left} °C and right ${T.right} °C (corners ignored). Using the five-point finite-difference scheme for steady conduction, what is the temperature at interior node row ${r + 1}, column ${c + 1} (counting from the top left), in °C? (4 significant figures)`, r4(v),
      `Each node satisfies 4Tᵢⱼ = sum of its four neighbours, edge values included. Solving the ${m} equations gives T = ${r4(v)} °C there.`,
      `# over-relaxed Gauss-Seidel sweeps until the field stops changing\nn, T = ${n}, ${JSON.stringify(T)}\ngrid = [[0.0] * n for _ in range(n)]\nget = lambda i, j: T['top'] if i < 0 else T['bottom'] if i >= n else T['left'] if j < 0 else T['right'] if j >= n else grid[i][j]\nfor _ in range(5000):\n    for i in range(n):\n        for j in range(n):\n            new = (get(i - 1, j) + get(i + 1, j) + get(i, j - 1) + get(i, j + 1)) / 4\n            grid[i][j] += 1.5 * (new - grid[i][j])\nprint(grid[${r}][${c}])`);
  }),
];
