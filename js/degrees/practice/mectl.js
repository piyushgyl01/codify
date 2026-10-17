/**
 * Mechanical Engineering: feedback control and experimental methods
 * (Feedback Systems; the NIST/SEMATECH e-Handbook; FE Mechanical topics
 * 2 and 13).
 *
 * Checks take another route: gains bisected on a simulated step response,
 * state-feedback gains from the trace and determinant of A − BK instead of
 * Ackermann's formula, sampled loops built by integrating the plant between
 * samples (RK4), PI responses simulated in state space, factorial effects by
 * least-squares regression, uncertainty budgets by numerical partial
 * derivatives, p-values from the incomplete beta function instead of
 * integrating the t density, and sensor lag by simulating the sensor.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const lgamma = x => { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp); let s = 1.000000000190015; for (const v of c) s += v / ++y; return -tmp + Math.log(2.5066282746310005 * s / x); };
/** Two-sided p for Student's t with ν degrees of freedom, by Simpson's rule on the density. */
const pT = (tv, nu) => { const f = x => Math.exp(lgamma((nu + 1) / 2) - lgamma(nu / 2) - 0.5 * Math.log(nu * Math.PI) - (nu + 1) / 2 * Math.log(1 + x * x / nu)); const n = 20000, h = Math.abs(tv) / n; let s = f(0) + f(Math.abs(tv)); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(i * h); return 1 - 2 * s * h / 3; };

export const MECTL = [
  SKILL('ctl.rootlocus', 'Gain for a target overshoot', 'With proportional gain K on G = 1/(s(s + a)), the closed loop is s² + as + K: ζ = a/(2√K). Overshoot e^(−πζ/√(1−ζ²)) fixes ζ, and so K.', t => {
    const a = t.pick([2, 4, 5, 8, 10]), OS = t.pick([5, 10, 15, 20, 25, 30]), L = Math.log(OS / 100), z = -L / Math.sqrt(Math.PI ** 2 + L * L), K = a * a / (4 * z * z), ask = t.pick(['K', 'tp']);
    const wn = Math.sqrt(K), tp = Math.PI / (wn * Math.sqrt(1 - z * z));
    return num(`A plant G(s) = 1/(s(s + ${a})) is under unity feedback with proportional gain K. ${ask === 'K' ? `What K gives ${OS}% overshoot to a step?` : `With K chosen for ${OS}% overshoot, when does the step response peak, in seconds?`} (4 significant figures)`, r4(ask === 'K' ? K : tp),
      `ζ = −ln(OS)/√(π² + ln²(OS)) = ${r4(z)}. The closed loop s² + ${a}s + K has 2ζ√K = ${a}, so K = a²/(4ζ²) = ${r4(K)}. ω_n = ${r4(wn)} rad/s; peak time π/(ω_n√(1 − ζ²)) = ${r4(tp)} s.`,
      `import math\n# simulate the closed-loop step (RK4) and bisect on K until the overshoot matches\na, OS = ${a}, ${OS} / 100\ndef response(K, T=None):\n    x, v, t, dt = 0.0, 0.0, 0.0, 1e-3 / math.sqrt(K)\n    f = lambda x, v: (v, K * (1 - x) - a * v)\n    peak, tpk = 0.0, 0.0\n    while t < (T or 20 / a + 20 / math.sqrt(K)):\n        k1 = f(x, v); k2 = f(x + dt / 2 * k1[0], v + dt / 2 * k1[1]); k3 = f(x + dt / 2 * k2[0], v + dt / 2 * k2[1]); k4 = f(x + dt * k3[0], v + dt * k3[1])\n        x += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); v += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); t += dt\n        if x > peak: peak, tpk = x, t\n        if v < 0 and peak > 1: break\n    return peak - 1, tpk\nlo, hi = a * a / 4, a * a * 100\nfor _ in range(50):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if response(m)[0] < OS else (lo, m)\nprint(${ask === 'K' ? 'lo' : 'response(lo)[1]'})`);
  }),

  SKILL('ctl.place', 'Pole placement by state feedback', 'With u = −Kx, the closed loop ẋ = (A − BK)x has characteristic polynomial s² − tr(A − BK)s + det(A − BK); choosing K places both poles, if (A, B) is controllable.', t => {
    let A, B;
    do { A = [[t.int(-3, 3), t.int(-3, 3)], [t.int(-3, 3), t.int(-3, 3)]]; B = [t.int(-2, 2), t.int(-2, 2)]; } while (Math.abs(B[0] * (A[1][0] * B[0] + A[1][1] * B[1]) - B[1] * (A[0][0] * B[0] + A[0][1] * B[1])) < 1);
    const p1 = t.pick([1, 2, 3, 4]), p2 = t.pick([2, 3, 5, 6]), a1 = p1 + p2, a0 = p1 * p2, which = t.int(0, 1);
    // Ackermann: K = [0 1] C⁻¹ φ(A), C = [B, AB], φ(A) = A² + a1A + a0I
    const AB = [A[0][0] * B[0] + A[0][1] * B[1], A[1][0] * B[0] + A[1][1] * B[1]], C = [[B[0], AB[0]], [B[1], AB[1]]], det = C[0][0] * C[1][1] - C[0][1] * C[1][0];
    const Ci = [[C[1][1] / det, -C[0][1] / det], [-C[1][0] / det, C[0][0] / det]];
    const A2 = [[A[0][0] * A[0][0] + A[0][1] * A[1][0], A[0][0] * A[0][1] + A[0][1] * A[1][1]], [A[1][0] * A[0][0] + A[1][1] * A[1][0], A[1][0] * A[0][1] + A[1][1] * A[1][1]]];
    const phi = [[A2[0][0] + a1 * A[0][0] + a0, A2[0][1] + a1 * A[0][1]], [A2[1][0] + a1 * A[1][0], A2[1][1] + a1 * A[1][1] + a0]];
    const K = [Ci[1][0] * phi[0][0] + Ci[1][1] * phi[1][0], Ci[1][0] * phi[0][1] + Ci[1][1] * phi[1][1]];
    return num(`For ẋ = Ax + Bu with A = [[${A[0].join(', ')}], [${A[1].join(', ')}]] and B = [${B.join(', ')}]ᵀ, find the state-feedback gain K = [k₁ k₂] (u = −Kx) that puts the closed-loop poles at −${p1} and −${p2}. What is k${which + 1}? (4 significant figures)`, r4(K[which]),
      `Desired polynomial s² + ${a1}s + ${a0}. Ackermann: K = [0 1]·[B AB]⁻¹·φ(A) with φ(A) = A² + ${a1}A + ${a0}I, giving K = [${r4(K[0])}, ${r4(K[1])}].`,
      `# trace and determinant of A - BK are affine in K: probe them at three gains, then solve for the target polynomial\nA, B, a1, a0 = ${JSON.stringify(A)}, ${JSON.stringify(B)}, ${a1}, ${a0}\ndef td(k1, k2):\n    M = [[A[i][j] - B[i] * (k1, k2)[j] for j in range(2)] for i in range(2)]\n    return M[0][0] + M[1][1], M[0][0] * M[1][1] - M[0][1] * M[1][0]\nt0, d0 = td(0, 0); t1, d1 = td(1, 0); t2, d2 = td(0, 1)\n# want trace = -a1 and det = a0\nM = [[t1 - t0, t2 - t0, -a1 - t0], [d1 - d0, d2 - d0, a0 - d0]]\ndet = M[0][0] * M[1][1] - M[0][1] * M[1][0]\nk1 = (M[0][2] * M[1][1] - M[0][1] * M[1][2]) / det; k2 = (M[0][0] * M[1][2] - M[0][2] * M[1][0]) / det\nprint(${which === 0 ? 'k1' : 'k2'})`);
  }),

  SKILL('ctl.discrete', 'Sampled-data control', 'Behind a zero-order hold, K/(τs + 1) becomes y⁺ = ay + bu with a = e^(−T/τ), b = K(1 − a). Proportional control is stable only while |a − bK_p| < 1, so K_p < (1 + a)/b.', t => {
    const K = t.pick([1, 2, 5]), tau = t.pick([0.5, 1, 2, 5]), T = t.pick([0.1, 0.2, 0.5, 1]), ask = t.pick(['kmax', 'sse']);
    const a = Math.exp(-T / tau), b = K * (1 - a), kmax = (1 + a) / b, Kp = Number((kmax * t.pick([0.2, 0.4, 0.6])).toPrecision(3)), y = b * Kp / (1 - a + b * Kp), e = 1 - y;
    return num(`A plant ${K}/(${tau}s + 1) is controlled digitally with proportional gain K_p, sampled every ${T} s through a zero-order hold. ${ask === 'kmax' ? 'Above what K_p does the sampled loop go unstable?' : `With K_p = ${Kp}, what is the steady-state error to a unit step?`} (4 significant figures)`, r4(ask === 'kmax' ? kmax : e),
      `a = e^(−T/τ) = ${r4(a)}, b = K(1 − a) = ${r4(b)}. Closed-loop pole a − bK_p: unstable once it passes −1, at K_p = (1 + a)/b = ${r4(kmax)}. Steady state y = bK_p/(1 − a + bK_p) = ${r4(y)}, error ${r4(e)}.`,
      `import math\n# build the sampled loop by integrating the plant between samples (RK4, input held)\nK, tau, T = ${K}, ${tau}, ${T}\ndef step(y, u, n=200):\n    h = T / n; f = lambda y: (K * u - y) / tau\n    for _ in range(n):\n        k1 = f(y); k2 = f(y + h / 2 * k1); k3 = f(y + h / 2 * k2); k4 = f(y + h * k3)\n        y += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)\n    return y\n${ask === 'kmax' ? `# the closed-loop map y -> y+ is linear: its slope is the pole; bisect on Kp for slope = -1\nslope = lambda Kp: step(1.0, -Kp) - step(0.0, 0.0)\nlo, hi = 0.0, 1e3\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if slope(m) > -1 else (lo, m)\nprint(lo)` : `Kp, y = ${Kp}, 0.0\nfor _ in range(3000): y = step(y, Kp * (1 - y), 20)\nprint(1 - y)`}`);
  }),

  SKILL('ctl.pi', 'PI control of a first-order plant', 'PI control removes steady-state error but adds a zero: the closed loop K(K_ps + K_i)/(τs² + (1 + KK_p)s + KK_i) can overshoot more than its damping ratio alone suggests.', t => {
    const K = t.pick([1, 2, 4]), tau = t.pick([1, 2, 5]), Kp = t.pick([0.5, 1, 2]), Ki = t.pick([1, 2, 4, 8]);
    const wn = Math.sqrt(K * Ki / tau), z = (1 + K * Kp) / (2 * tau * wn);
    if (z >= 0.95) return num(`A plant ${K}/(${tau}s + 1) under PI control (K_p = ${Kp}, K_i = ${Ki}) has closed-loop poles from τs² + (1 + KK_p)s + KK_i. What is the closed-loop damping ratio? (4 significant figures)`, r4(z),
      `ω_n = √(KK_i/τ) = ${r4(wn)}, 2ζω_n = (1 + KK_p)/τ, so ζ = ${r4(z)}.`, `import math\n# damping ratio from the roots of the closed-loop polynomial\nK, tau, Kp, Ki = ${K}, ${tau}, ${Kp}, ${Ki}\na, b, c = tau, 1 + K * Kp, K * Ki\ndisc = b * b - 4 * a * c\nif disc < 0:\n    re, im = -b / (2 * a), math.sqrt(-disc) / (2 * a)\n    print(-re / math.hypot(re, im))\nelse:\n    r1, r2 = (-b + math.sqrt(disc)) / (2 * a), (-b - math.sqrt(disc)) / (2 * a)\n    print((-(r1 + r2)) / (2 * math.sqrt(r1 * r2)))`);
    const wd = wn * Math.sqrt(1 - z * z), y = s => 1 - Math.exp(-z * wn * s) * (Math.cos(wd * s) + z * wn / wd * Math.sin(wd * s)) + Kp / Ki * wn * wn / wd * Math.exp(-z * wn * s) * Math.sin(wd * s);
    let best = 0, bt = 0; for (let i = 1; i <= 200000; i++) { const s = i * 20 / (z * wn) / 200000, v = y(s); if (v > best) { best = v; bt = s; } }
    const OS = (best - 1) * 100;
    return num(`A plant ${K}/(${tau}s + 1) is under PI control with K_p = ${Kp} and K_i = ${Ki} (unity feedback). What is the percentage overshoot of its step response? (4 significant figures)`, r4(OS),
      `Closed loop: K(K_ps + K_i)/(τs² + (1 + KK_p)s + KK_i), ω_n = ${r4(wn)} rad/s, ζ = ${r4(z)}. The zero adds (K_p/K_i)·dy/dt to the standard response; its peak is ${r4(best)} at t = ${r4(bt)} s: ${r4(OS)}% overshoot.`,
      `import math\n# simulate plant and integrator in state space (RK4) and record the peak\nK, tau, Kp, Ki = ${K}, ${tau}, ${Kp}, ${Ki}\ndef f(y, xi):\n    e = 1 - y\n    return ((K * (Kp * e + Ki * xi) - y) / tau, e)\ny = xi = t = 0.0; dt = 2e-3 / math.sqrt(K * Ki / tau); peak = 0.0\nend = 30 * 2 * tau / (1 + K * Kp)\nwhile t < end:\n    a = f(y, xi); b = f(y + dt / 2 * a[0], xi + dt / 2 * a[1]); c = f(y + dt / 2 * b[0], xi + dt / 2 * b[1]); d = f(y + dt * c[0], xi + dt * c[1])\n    y += dt / 6 * (a[0] + 2 * b[0] + 2 * c[0] + d[0]); xi += dt / 6 * (a[1] + 2 * b[1] + 2 * c[1] + d[1]); t += dt\n    peak = max(peak, y)\nprint((peak - 1) * 100)`);
  }),

  SKILL('exp.factorial', 'Factorial experiments', 'In a two-level factorial, an effect is the average response at the high level minus the average at the low level; interactions use the product of the coded columns.', t => {
    const k = t.pick([2, 3]), runs = 2 ** k, y = Array.from({ length: runs }, () => t.int(10, 60));
    const col = (i, j) => (Math.floor(i / 2 ** j) % 2 ? 1 : -1), names = ['A', 'B', 'C'];
    const opts = k === 2 ? [[0], [1], [0, 1]] : [[0], [1], [2], [0, 1], [0, 2], [1, 2]], f = t.pick(opts);
    const sign = i => f.reduce((s, j) => s * col(i, j), 1), eff = y.reduce((s, v, i) => s + sign(i) * v, 0) / (runs / 2), label = f.map(j => names[j]).join('');
    const table = y.map((v, i) => `(${[...Array(k).keys()].map(j => (col(i, j) > 0 ? '+' : '−')).join('')}) ${v}`).join(', ');
    return num(`A 2^${k} factorial experiment (factors ${names.slice(0, k).join(', ')} at coded levels −/+) gives these responses, runs in standard order: ${table}. What is the ${f.length > 1 ? `${label} interaction` : `main effect of ${label}`}? (4 significant figures)`, r4(eff),
      `Multiply each response by the sign of the ${label} column and sum, then divide by ${runs / 2}: effect = ${r4(eff)}.`,
      `# fit y = b0 + sum of b_term * x_term by least squares on the coded design; an effect is twice its coefficient\nimport itertools, math\nk, y = ${k}, ${JSON.stringify(y)}\nterms = [t for r in range(1, k + 1) for t in itertools.combinations(range(k), r)]\nX = [[1.0] + [math.prod(1 if (i >> j) & 1 else -1 for j in t) for t in terms] for i in range(2 ** k)]\nn = len(X[0])\nN = [[sum(X[r][i] * X[r][j] for r in range(len(y))) for j in range(n)] + [sum(X[r][i] * y[r] for r in range(len(y)))] for i in range(n)]\nfor c in range(n):\n    p = max(range(c, n), key=lambda r: abs(N[r][c])); N[c], N[p] = N[p], N[c]\n    for r in range(n):\n        if r != c: g = N[r][c] / N[c][c]; N[r] = [u - g * v for u, v in zip(N[r], N[c])]\nb = [N[i][n] / N[i][i] for i in range(n)]\nprint(2 * b[1 + terms.index(${JSON.stringify(f).replace('[', '(').replace(']', ',)')})])`);
  }),

  SKILL('exp.budget', 'Uncertainty budgets', 'For a result f(x₁, …, xₙ) from independent inputs, u_c² = Σ(∂f/∂xᵢ · u(xᵢ))². The expanded uncertainty U = k·u_c with k = 2 covers about 95%.', t => {
    const L1 = t.pick([200, 250, 300, 500]), dL = t.pick([0.2, 0.3, 0.5, 0.8]), L2 = Number((L1 + dL).toFixed(3)), T1 = t.pick([20, 22, 25]), T2 = t.pick([80, 100, 120, 150]);
    const uL = t.pick([0.005, 0.01, 0.02]), uT = t.pick([0.2, 0.5, 1]), ask = t.pick(['uc', 'U']);
    const a = (L2 - L1) / (L1 * (T2 - T1)), dA = { L2: 1 / (L1 * (T2 - T1)), L1: -L2 / (L1 * L1 * (T2 - T1)), T2: -a / (T2 - T1), T1: a / (T2 - T1) };
    const uc = Math.sqrt((dA.L2 * uL) ** 2 + (dA.L1 * uL) ** 2 + (dA.T2 * uT) ** 2 + (dA.T1 * uT) ** 2);
    return num(`A rod's expansion coefficient is found from α = (L₂ − L₁)/(L₁(T₂ − T₁)). Measured: L₁ = ${L1} mm at T₁ = ${T1} °C and L₂ = ${L2} mm at T₂ = ${T2} °C. Each length has standard uncertainty ${uL} mm and each temperature ${uT} °C, all independent. What is ${ask === 'uc' ? 'the combined standard uncertainty of α' : 'the expanded uncertainty of α (k = 2)'}, in units of 10⁻⁶/°C? (4 significant figures)`, r4((ask === 'uc' ? uc : 2 * uc) * 1e6),
      `α = ${r4(a * 1e6)} × 10⁻⁶/°C. Sensitivities: ∂α/∂L₂ = 1/(L₁ΔT), ∂α/∂L₁ = −L₂/(L₁²ΔT), ∂α/∂T₂ = −α/ΔT, ∂α/∂T₁ = α/ΔT. u_c = √Σ(cᵢuᵢ)² = ${r4(uc * 1e6)} × 10⁻⁶/°C; U = 2u_c = ${r4(2 * uc * 1e6)}.`,
      `import math\n# sensitivities by central differences, then the root-sum-square\nx = {'L1': ${L1}, 'L2': ${L2}, 'T1': ${T1}, 'T2': ${T2}}\nu = {'L1': ${uL}, 'L2': ${uL}, 'T1': ${uT}, 'T2': ${uT}}\nf = lambda v: (v['L2'] - v['L1']) / (v['L1'] * (v['T2'] - v['T1']))\nuc2 = 0.0\nfor k in x:\n    h = 1e-6 * max(abs(x[k]), 1)\n    up = dict(x); up[k] += h; dn = dict(x); dn[k] -= h\n    uc2 += ((f(up) - f(dn)) / (2 * h) * u[k]) ** 2\nprint(${ask === 'uc' ? '1' : '2'} * math.sqrt(uc2) * 1e6)`);
  }),

  SKILL('exp.ttest', 'Comparing two means: Welch\'s t-test', 'Welch\'s t = (x̄₁ − x̄₂)/√(s₁²/n₁ + s₂²/n₂) does not assume equal variances; its degrees of freedom come from the Welch–Satterthwaite formula.', t => {
    const n1 = t.int(6, 15), n2 = t.int(6, 15), m1 = t.pick([50, 100, 200]), diff = t.pick([0.5, 1, 1.5, 2, 3]), s1 = t.pick([1, 1.5, 2, 3]), s2 = t.pick([1, 2, 2.5, 4]), m2 = m1 + diff;
    const v1 = s1 * s1 / n1, v2 = s2 * s2 / n2, tv = (m1 - m2) / Math.sqrt(v1 + v2), nu = (v1 + v2) ** 2 / (v1 * v1 / (n1 - 1) + v2 * v2 / (n2 - 1)), p = pT(tv, nu), ask = t.pick(['t', 'nu', 'p']);
    return num(`Two settings of a process give part lengths: setting 1, n = ${n1}, mean ${m1}, s = ${s1}; setting 2, n = ${n2}, mean ${m2}, s = ${s2} (mm). For Welch's two-sample t-test, what is ${{ t: 'the t statistic (setting 1 minus setting 2)', nu: 'the Welch–Satterthwaite degrees of freedom', p: 'the two-sided p-value' }[ask]}? (4 significant figures)`, r4({ t: tv, nu, p }[ask]),
      `t = (x̄₁ − x̄₂)/√(s₁²/n₁ + s₂²/n₂) = ${r4(tv)}; ν = (s₁²/n₁ + s₂²/n₂)²/Σ((sᵢ²/nᵢ)²/(nᵢ − 1)) = ${r4(nu)}; two-sided p = ${r4(p)}.`,
      `import math\n# p from the regularised incomplete beta function: P(|T| > t) = I_{nu/(nu + t^2)}(nu/2, 1/2), by continued fraction\nn1, m1, s1, n2, m2, s2 = ${n1}, ${m1}, ${s1}, ${n2}, ${m2}, ${s2}\nv1, v2 = s1 * s1 / n1, s2 * s2 / n2\nt = (m1 - m2) / math.sqrt(v1 + v2)\nnu = (v1 + v2) ** 2 / (v1 * v1 / (n1 - 1) + v2 * v2 / (n2 - 1))\ndef betacf(a, b, x):\n    qab, qap, qam = a + b, a + 1, a - 1; c, d = 1.0, 1 - qab * x / qap; d = 1 / d; h = d\n    for m in range(1, 300):\n        m2 = 2 * m; aa = m * (b - m) * x / ((qam + m2) * (a + m2)); d = 1 / (1 + aa * d); c = 1 + aa / c; h *= d * c\n        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2)); d = 1 / (1 + aa * d); c = 1 + aa / c; h *= d * c\n    return h\ndef ibeta(a, b, x):\n    bt = math.exp(math.lgamma(a + b) - math.lgamma(a) - math.lgamma(b) + a * math.log(x) + b * math.log(1 - x))\n    return bt * betacf(a, b, x) / a if x < (a + 1) / (a + b + 2) else 1 - bt * betacf(b, a, 1 - x) / b\np = ibeta(nu / 2, 0.5, nu / (nu + t * t))\nprint(${{ t: 't', nu: 'nu', p: 'p' }[ask]})`);
  }),

  SKILL('exp.dynamic', 'Dynamic response of a first-order sensor', 'A first-order sensor τẏ + y = x lags a ramp by rate·τ, and passes a sine of frequency ω with amplitude ratio 1/√(1 + (ωτ)²) and phase lag atan(ωτ).', t => {
    const tau = t.pick([0.5, 1, 2, 5, 10]), mode = t.pick(['ramp', 'amp', 'phase']), rate = t.pick([0.5, 1, 2, 5]), f = Number((t.pick([0.2, 0.5, 1, 2, 4]) / (2 * Math.PI * tau)).toPrecision(3)), w = 2 * Math.PI * f;
    const ans = { ramp: rate * tau, amp: 1 / Math.sqrt(1 + (w * tau) ** 2), phase: Math.atan(w * tau) * 180 / Math.PI }[mode];
    const q = mode === 'ramp' ? `A thermocouple with time constant ${tau} s measures air whose temperature rises steadily at ${rate} °C/s. Once the transient has passed, how far behind does the reading lag, in °C?` : `A sensor with time constant ${tau} s measures a quantity oscillating at ${f} Hz. What is ${mode === 'amp' ? 'the ratio of indicated to true amplitude' : 'the phase lag of the reading, in degrees'}?`;
    return num(`${q} (4 significant figures)`, r4(ans),
      `ωτ = ${r4(w * tau)}. Ramp lag = rate·τ = ${r4(rate * tau)} °C; amplitude ratio 1/√(1 + (ωτ)²) = ${r4(1 / Math.sqrt(1 + (w * tau) ** 2))}; phase lag atan(ωτ) = ${r4(Math.atan(w * tau) * 180 / Math.PI)}°.`,
      `import math\n# simulate tau y' + y = x(t) (RK4) past the transient, then measure\ntau, rate, f = ${tau}, ${rate}, ${f}\nw = 2 * math.pi * f\nx = ${mode === 'ramp' ? 'lambda t: rate * t' : 'lambda t: math.sin(w * t)'}\nend = 30 * tau + ${mode === 'ramp' ? '0' : '5 / f'}; dt = min(tau, 1 / f) / 2000\ny, t = 0.0, 0.0\nfy = lambda t, y: (x(t) - y) / tau\nrec = []\nwhile t < end:\n    k1 = fy(t, y); k2 = fy(t + dt / 2, y + dt / 2 * k1); k3 = fy(t + dt / 2, y + dt / 2 * k2); k4 = fy(t + dt, y + dt * k3)\n    y += dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4); t += dt\n    if t > end - 2 / f: rec.append((t, y))\n${mode === 'ramp' ? 'print(x(t) - y)' : `# project the last two periods onto sin and cos: y = A sin(wt - phi)\nT0 = rec[0][0]; rec = [(tt, v) for tt, v in rec if tt <= T0 + 2 / f]\nS = sum(v * math.sin(w * tt) for tt, v in rec) * dt; C = sum(v * math.cos(w * tt) for tt, v in rec) * dt\nA = math.hypot(S, C) * f; phi = math.degrees(math.atan2(-C, S))\nprint(${mode === 'amp' ? 'A' : 'phi'})`}`);
  }),
];
