/**
 * Mathematics: numerical analysis (18.330) and mathematical modelling (SIAM
 * M3). Bisection counts, polynomial interpolation, Simpson's rule, fixed-point
 * iteration, condition numbers, the order of a method from step halving; the
 * logistic model, Buckingham π, epidemic thresholds and the M/M/1 queue.
 * QAA MSOR 3.16, 3.18–3.19; GRE Mathematics: Additional topics.
 *
 * Checks: running the bisection, Newton's divided differences, a
 * high-resolution reference integral, the iteration itself, singular values
 * by power iteration, RK4 at two step sizes, rank of a dimension matrix,
 * a simulated epidemic, and a simulated queue.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0.0001, dp: 4, explain, python, ...extra });
const PY = JSON.stringify;
const r4 = x => Math.round(x * 10000) / 10000;

export const MATHAPPLIED = [
  SKILL('na.bisect', 'Bisection', 'Each step halves the bracket: after n steps the error is at most (b − a)/2ⁿ.', t => {
    const L = t.pick([1, 2, 4]), tol = t.pick([1e-2, 1e-3, 1e-4, 1e-6]);
    const n = Math.ceil(Math.log2(L / tol));
    return num(`Bisection starts on an interval of length ${L}. How many steps guarantee the root is within ${tol} (i.e. the bracket is at most ${tol} long)?`, n,
      `After n steps the bracket is ${L}/2ⁿ; we need ${L}/2ⁿ ≤ ${tol}, so n ≥ log₂(${L}/${tol}) = ${r4(Math.log2(L / tol))}: n = ${n}.`,
      `from fractions import Fraction as F\na, b, n = F(0), F(${L}), 0\nwhile b - a > F('${tol}'):\n    m = (a + b) / 2\n    a, b = (a, m) if n % 2 else (m, b)  # either half; only the length matters\n    n += 1\nprint(n)`, { tol: 0, dp: 0 });
  }),

  SKILL('na.interp', 'Polynomial interpolation', 'Through n + 1 points passes exactly one polynomial of degree ≤ n.', t => {
    const xs = [0, 1, 2, 3].slice(0, t.int(3, 4)), ys = xs.map(() => t.int(-5, 5)), x = t.pick([0.5, 1.5, 2.5, -1, 4]);
    let v = 0; xs.forEach((xi, i) => { let L = 1; xs.forEach((xj, j) => { if (j !== i) L *= (x - xj) / (xi - xj); }); v += ys[i] * L; });
    return num(`The interpolating polynomial through ${xs.map((xi, i) => `(${xi}, ${ys[i]})`).join(', ')} — what is its value at x = ${x}? (4 decimal places)`, r4(v),
      `Lagrange form: Σ yᵢ ∏_{j≠i} (x − xⱼ)/(xᵢ − xⱼ) = ${r4(v)}.${x < 0 || x > xs.at(-1) ? ' Outside the data this is extrapolation — trust it less.' : ''}`,
      `from fractions import Fraction as F\nxs, ys, x = ${PY(xs)}, ${PY(ys)}, F('${x}')\n# Newton's divided differences\nc = [F(y) for y in ys]\nfor k in range(1, len(xs)):\n    for i in range(len(xs) - 1, k - 1, -1): c[i] = (c[i] - c[i - 1]) / (xs[i] - xs[i - k])\nv = c[-1]\nfor i in range(len(xs) - 2, -1, -1): v = v * (x - xs[i]) + c[i]\nprint(float(v))`);
  }),

  SKILL('na.simpson', "Simpson's rule", 'Fit parabolas through pairs of panels; the error falls like h⁴.', t => {
    const n = t.pick([2, 4, 6]), b = t.pick([1, 2]), f = t.pick(['exp', 'cos', 'cube']);
    const F = { exp: Math.exp, cos: Math.cos, cube: x => x ** 3 + x }[f], h = b / n;
    let s = F(0) + F(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * F(i * h);
    const v = (h / 3) * s;
    return num(`Approximate ∫₀^${b} ${{ exp: 'eˣ', cos: 'cos x', cube: '(x³ + x)' }[f]} dx with Simpson's rule on ${n} subintervals. (4 decimal places)`, r4(v),
      `h = ${r4(h)}; (h/3)[f₀ + 4f₁ + 2f₂ + … + f_${n}] = ${r4(v)}.${f === 'cube' ? ' Simpson is exact for cubics.' : ''}`,
      `import math\nf = ${f === 'exp' ? 'math.exp' : f === 'cos' ? 'math.cos' : 'lambda x: x ** 3 + x'}\nn, b = ${n}, ${b}\nh = b / n\n# composite Simpson as a weighted sum of parabola integrals, panel pair by panel pair\ns = 0.0\nfor k in range(0, n, 2):\n    x0, x1, x2 = k * h, (k + 1) * h, (k + 2) * h\n    s += (x2 - x0) / 6 * (f(x0) + 4 * f(x1) + f(x2))\nprint(s)`);
  }),

  SKILL('na.fixed', 'Fixed-point iteration', 'x ← g(x) converges near a fixed point when |g′| < 1 there, faster the smaller it is.', t => {
    const a = t.pick([2, 3, 5]), c = t.pick([0.25, 0.5, 0.8]), k = t.int(2, 6), x0 = t.int(1, 3);
    // g(x) = x − c(x² − a)/(2x0') ... keep it simple: g(x) = x + c(a/x − x)/2 has fixed point √a, g′(√a) = 1 − c
    let x = x0; for (let i = 0; i < k; i++) x = x + c * (a / x - x) / 2;
    return num(`Iterate g(x) = x + ${c}·(${a}/x − x)/2 from x₀ = ${x0}. What is x_${k}? Its fixed point is √${a}. (6 decimal places)`, Math.round(x * 1e6) / 1e6,
      `g′(√${a}) = 1 − ${c} = ${r4(1 - c)}, so the error shrinks by about that factor each step. x_${k} = ${x.toFixed(6)} against √${a} = ${Math.sqrt(a).toFixed(6)}.${c === 1 ? '' : ' With c = 1 it would be Newton\'s method and converge quadratically.'}`,
      `from fractions import Fraction as F\nx, c = F(${x0}), F('${c}')\nfor _ in range(${k}): x = x + c * (F(${a}) / x - x) / 2\nprint(float(x))`, { tol: 1e-6, dp: 6 });
  }),

  SKILL('na.cond', 'Condition numbers', 'κ(A) = σ_max/σ_min: how much relative error in b can grow in x.', t => {
    let A; do { A = [[t.int(-5, 5), t.int(-5, 5)], [t.int(-5, 5), t.int(-5, 5)]]; } while (A[0][0] * A[1][1] - A[0][1] * A[1][0] === 0);
    const [a, b] = A[0], [c, d] = A[1], S = a * a + b * b + c * c + d * d, D = Math.abs(a * d - b * c);
    const smax = Math.sqrt((S + Math.sqrt(S * S - 4 * D * D)) / 2), smin = D / smax;
    return num(`What is the 2-norm condition number κ(A) of A = [[${a}, ${b}], [${c}, ${d}]]? (4 decimal places)`, r4(smax / smin),
      `σ² are the eigenvalues of AᵀA: σ_max = ${r4(smax)}, σ_min = |det A|/σ_max = ${r4(smin)}, κ = ${r4(smax / smin)}. A relative error ε in b can become κε in x.`,
      `import math\nA = ${PY(A)}\nAt = [[A[j][i] for j in range(2)] for i in range(2)]\nM = [[sum(At[i][k] * A[k][j] for k in range(2)) for j in range(2)] for i in range(2)]\ndef top(M):\n    v = [1.0, 0.3]\n    for _ in range(5000):\n        w = [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]\n        n = math.hypot(*w); v = [w[0] / n, w[1] / n]\n    return v[0] * (M[0][0] * v[0] + M[0][1] * v[1]) + v[1] * (M[1][0] * v[0] + M[1][1] * v[1])\nlmax = top(M)\n# the inverse's largest singular value gives sigma_min\ndet = A[0][0] * A[1][1] - A[0][1] * A[1][0]\nAi = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]]\nAiT = [[Ai[j][i] for j in range(2)] for i in range(2)]\nMi = [[sum(AiT[i][k] * Ai[k][j] for k in range(2)) for j in range(2)] for i in range(2)]\nprint(math.sqrt(lmax) * math.sqrt(top(Mi)))`, { rtol: 1e-6 });
  }),

  SKILL('na.order', 'Order of a method', 'Halve the step; if the error drops by 2ᵖ the method has order p.', t => {
    const method = t.pick(['Euler', 'midpoint', 'RK4']), p = { Euler: 1, midpoint: 2, RK4: 4 }[method];
    return num(`You solve y′ = y, y(0) = 1 to t = 1 with ${method === 'RK4' ? 'classical fourth-order Runge–Kutta' : method === 'Euler' ? 'Euler\'s method' : 'the explicit midpoint method'} at step h and then h/2. By roughly what factor should the global error shrink?`, 2 ** p,
      `${method} has global order ${p}, so the error scales like hᵖ: halving h divides it by 2^${p} = ${2 ** p}.`,
      `import math\ndef solve(n):\n    h, y = 1 / n, 1.0\n    f = lambda y: y\n    for _ in range(n):\n        ${method === 'Euler' ? 'y += h * f(y)' : method === 'midpoint' ? 'y += h * f(y + h / 2 * f(y))' : 'k1 = f(y); k2 = f(y + h / 2 * k1); k3 = f(y + h / 2 * k2); k4 = f(y + h * k3); y += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)'}\n    return abs(y - math.e)\nprint(round(solve(${method === 'RK4' ? 20 : 400}) / solve(${method === 'RK4' ? 40 : 800})))`, { tol: 0, dp: 0 });
  }),

  SKILL('mod.logistic', 'Logistic growth', 'P(t) = K / (1 + ((K − P₀)/P₀) e^{−rt}): growth that saturates at the carrying capacity.', t => {
    const K = t.pick([100, 500, 1000]), P0 = t.pick([10, 20, 50]), r = t.pick([0.2, 0.5, 1]), T = t.int(2, 10);
    const v = K / (1 + ((K - P0) / P0) * Math.exp(-r * T));
    return num(`A population follows P′ = ${r}P(1 − P/${K}), P(0) = ${P0}. What is P(${T})? (2 decimal places)`, Math.round(v * 100) / 100,
      `Logistic solution: P = ${K}/(1 + ${(K - P0) / P0}e^{−${r}t}) = ${v.toFixed(2)} at t = ${T}. Growth is fastest when P = K/2.`,
      `f = lambda p: ${r} * p * (1 - p / ${K})\np, h = ${P0}.0, 1e-3\nfor _ in range(${T} * 1000):\n    k1 = f(p); k2 = f(p + h / 2 * k1); k3 = f(p + h / 2 * k2); k4 = f(p + h * k3)\n    p += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)\nprint(p)`, { tol: 0.01, dp: 2 });
  }),

  SKILL('mod.pi', 'Dimensional analysis', 'Buckingham π: n variables built from r independent dimensions form n − r dimensionless groups.', t => {
    const sets = [
      [['drag force F', [1, 1, -2]], ['speed v', [0, 1, -1]], ['diameter D', [0, 1, 0]], ['density ρ', [1, -3, 0]], ['viscosity μ', [1, -1, -1]]],
      [['period T', [0, 0, 1]], ['length L', [0, 1, 0]], ['gravity g', [0, 1, -2]], ['mass m', [1, 0, 0]]],
      [['pressure drop Δp', [1, -1, -2]], ['pipe length L', [0, 1, 0]], ['diameter D', [0, 1, 0]], ['speed v', [0, 1, -1]], ['density ρ', [1, -3, 0]], ['viscosity μ', [1, -1, -1]], ['roughness ε', [0, 1, 0]]],
      [['wave speed c', [0, 1, -1]], ['wavelength λ', [0, 1, 0]], ['depth h', [0, 1, 0]], ['gravity g', [0, 1, -2]]],
    ];
    const S = t.pick(sets);
    const M = S.map(x => x[1]); const rk = (() => { const A = M.map(r => [...r]); let rank = 0; for (let c = 0; c < 3; c++) { const p = A.findIndex((r, i) => i >= rank && Math.abs(r[c]) > 1e-12); if (p < 0) continue; [A[rank], A[p]] = [A[p], A[rank]]; for (let i = 0; i < A.length; i++) if (i !== rank) { const f = A[i][c] / A[rank][c]; A[i] = A[i].map((x, j) => x - f * A[rank][j]); } rank++; } return rank; })();
    return num(`A model involves ${S.map(x => x[0]).join(', ')}. How many independent dimensionless groups does Buckingham's π theorem give?`, S.length - rk,
      `${S.length} variables; their dimensions (in M, L, T) have rank ${rk}; so ${S.length} − ${rk} = ${S.length - rk} groups.${S.length - rk === 1 ? ' One group means the relationship is fixed up to a constant.' : ''}`,
      `from fractions import Fraction as F\nfrom itertools import combinations\nM = ${PY(M)}\ndef det(A):\n    A = [[F(x) for x in r] for r in A]; n = len(A); d = F(1)\n    for c in range(n):\n        p = next((i for i in range(c, n) if A[i][c] != 0), None)\n        if p is None: return 0\n        if p != c: A[c], A[p] = A[p], A[c]; d = -d\n        d *= A[c][c]\n        for i in range(c + 1, n): f = A[i][c] / A[c][c]; A[i] = [a - f * b for a, b in zip(A[i], A[c])]\n    return d\nrk = max(k for k in range(0, 4) if k == 0 or any(det([[M[i][j] for j in cs] for i in rs]) != 0 for rs in combinations(range(len(M)), k) for cs in combinations(range(3), k)))\nprint(len(M) - rk)`, { tol: 0, dp: 0 });
  }),

  SKILL('mod.sir', 'Epidemic thresholds', 'R₀ = β/γ in the SIR model; vaccinating a fraction 1 − 1/R₀ stops an outbreak growing.', t => {
    const beta = t.pick([0.3, 0.4, 0.5, 0.6]), gamma = t.pick([0.1, 0.2]), ask = t.pick(['r0', 'herd']);
    const R0 = beta / gamma;
    if (ask === 'r0') return num(`SIR model with transmission rate β = ${beta}/day and recovery rate γ = ${gamma}/day. What is R₀? (4 decimal places)`, r4(R0),
      `R₀ = β/γ = ${r4(R0)}: each case infects ${r4(R0)} others in a fully susceptible population.`,
      `import math\n# measure the early exponential growth rate r of a tiny outbreak; then R0 = 1 + r/gamma\nb, g = ${beta}, ${gamma}\nS, I, dt, T = 1.0, 1e-12, 1e-4, 5.0\nfor _ in range(int(T / dt)):\n    dS = -b * S * I * dt; dI = (b * S * I - g * I) * dt\n    S += dS; I += dI\nr = math.log(I / 1e-12) / T\nprint(1 + r / g)`, { rtol: 1e-3 });
    const v = 1 - 1 / R0;
    return num(`SIR model with β = ${beta}/day, γ = ${gamma}/day. What fraction of the population must be immune to prevent an outbreak? (4 decimal places)`, r4(v),
      `R₀ = ${r4(R0)}; the threshold is 1 − 1/R₀ = ${r4(v)}. Above it, each case infects fewer than one other on average.`,
      `# find the smallest immune fraction for which a tiny outbreak shrinks, by simulation and bisection\nb, g = ${beta}, ${gamma}\ndef grows(p):\n    S, I, dt = 1 - p - 1e-6, 1e-6, 0.01\n    for _ in range(2000):\n        dI = (b * S * I - g * I) * dt; S -= b * S * I * dt; I += dI\n    return I > 1e-6\nlo, hi = 0.0, 1.0\nfor _ in range(40):\n    m = (lo + hi) / 2\n    if grows(m): lo = m\n    else: hi = m\nprint(hi)`, { tol: 0.002 });
  }),

  SKILL('mod.queue', 'Queues', 'M/M/1 with utilisation ρ = λ/μ: on average ρ/(1 − ρ) customers in the system — exploding as ρ → 1.', t => {
    const mu = t.pick([10, 12, 20]), rho = t.pick([0.5, 0.75, 0.8, 0.9]), lam = mu * rho, ask = t.pick(['L', 'W']);
    const L = rho / (1 - rho), W = L / lam;
    return num(`An M/M/1 queue: arrivals at λ = ${lam}/hour, service at μ = ${mu}/hour. What is the mean ${ask === 'L' ? 'number in the system L' : 'time in the system W, in minutes'}? (2 decimal places)`, Math.round((ask === 'L' ? L : W * 60) * 100) / 100,
      `ρ = λ/μ = ${rho}. L = ρ/(1 − ρ) = ${L.toFixed(2)}; by Little's law W = L/λ = ${(W * 60).toFixed(2)} minutes.`,
      `import random\nrandom.seed(1)\nlam, mu = ${lam}, ${mu}\n# simulate customers through a single server\nt = free = 0.0; total = 0.0; n = 400000\nfor _ in range(n):\n    t += random.expovariate(lam)\n    start = max(t, free); free = start + random.expovariate(mu)\n    total += free - t\nW = total / n\nprint(${ask === 'L' ? 'lam * W' : 'W * 60'})`, { rtol: 0.06, dp: 2 });
  }),
];
