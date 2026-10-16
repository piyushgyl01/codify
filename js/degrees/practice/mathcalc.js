/**
 * Mathematics, second year: multivariable calculus and differential
 * equations (18.02 and 18.03). Gradients and directional derivatives,
 * Lagrange multipliers, double integrals, line integrals and Green's theorem,
 * divergence and curl; first- and second-order linear ODEs, Laplace
 * transforms, phase-plane classification, equilibria and Euler's method.
 * QAA MSOR 3.8, 3.10, 3.16; GRE Mathematics: Calculus.
 *
 * Checks take another route: central differences, brute-force search on the
 * constraint, midpoint-rule integration, parametrised path sums, a numerical
 * ODE solver against the closed form, and numerical Laplace integrals.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0.0001, dp: 4, explain, python, ...extra });
const PY = JSON.stringify;
const r4 = x => Math.round(x * 10000) / 10000;

export const MATHCALC = [
  SKILL('mv.gradient', 'Gradients and directional derivatives', '∇f points uphill; the rate in direction u is ∇f·u.', t => {
    const a = t.int(1, 4), b = t.int(1, 4), c = t.int(-3, 3), x = t.int(-2, 2), y = t.int(-2, 2);
    // f(x, y) = a x² y + b y³ + c x
    const fx = 2 * a * x * y + c, fy = a * x * x + 3 * b * y * y, u = t.pick([[3, 4], [1, 0], [0, 1], [4, -3]]), len = Math.hypot(...u);
    const dd = (fx * u[0] + fy * u[1]) / len;
    return num(`f(x, y) = ${a}x²y + ${b}y³ ${c < 0 ? '−' : '+'} ${Math.abs(c)}x. What is the directional derivative at (${x}, ${y}) in the direction of (${u.join(', ')})? (4 decimal places)`, r4(dd),
      `∇f = (2·${a}xy + ${c}, ${a}x² + 3·${b}y²) = (${fx}, ${fy}) at the point. The unit direction is (${u.join(', ')})/${len}, so D_u f = (${fx}·${u[0]} + ${fy}·${u[1]})/${len} = ${r4(dd)}.`,
      `f = lambda x, y: ${a} * x * x * y + ${b} * y ** 3 + ${c} * x\nu = [${u[0]} / ${len}, ${u[1]} / ${len}]\nh = 1e-5\nprint((f(${x} + h * u[0], ${y} + h * u[1]) - f(${x} - h * u[0], ${y} - h * u[1])) / (2 * h))`);
  }),

  SKILL('mv.lagrange', 'Lagrange multipliers', 'At a constrained extremum, ∇f is parallel to ∇g.', t => {
    const p = t.int(1, 5), q = t.int(1, 5), r = t.pick([5, 10, 13, 25]), ask = t.pick(['max', 'min']);
    // extremise f = p x + q y on x² + y² = r²  → ±r·√(p² + q²)
    const v = (ask === 'max' ? 1 : -1) * r * Math.hypot(p, q);
    return num(`Find the ${ask === 'max' ? 'maximum' : 'minimum'} of f(x, y) = ${p}x + ${q}y on the circle x² + y² = ${r * r}. (4 decimal places)`, r4(v),
      `∇f = (${p}, ${q}) = λ(2x, 2y) puts (x, y) along (${p}, ${q}): (x, y) = ±${r}(${p}, ${q})/√${p * p + q * q}. Then f = ±${r}√${p * p + q * q} = ${r4(v)}.`,
      `import math\n# walk the whole constraint curve\nvals = [${p} * ${r} * math.cos(k * 2 * math.pi / 2_000_000) + ${q} * ${r} * math.sin(k * 2 * math.pi / 2_000_000) for k in range(2_000_000)]\nprint(${ask}(vals))`, { tol: 0.001 });
  }),

  SKILL('mv.double', 'Double integrals', 'Integrate over a region — in polar coordinates the area element is r dr dθ.', t => {
    if (t.rng() < 0.5) {
      const a = t.int(1, 3), b = t.int(1, 3), m = t.int(1, 3), n = t.int(0, 2);
      const v = (a ** (m + 1) / (m + 1)) * (b ** (n + 1) / (n + 1));
      return num(`Evaluate ∬ x^${m} y^${n} dA over the rectangle 0 ≤ x ≤ ${a}, 0 ≤ y ≤ ${b}. (4 decimal places)`, r4(v),
        `It separates: (∫₀^${a} x^${m} dx)(∫₀^${b} y^${n} dy) = (${a}^${m + 1}/${m + 1})(${b}^${n + 1}/${n + 1}) = ${r4(v)}.`,
        `N = 1000\nhx, hy = ${a} / N, ${b} / N\nprint(sum(((i + .5) * hx) ** ${m} for i in range(N)) * hx * sum(((j + .5) * hy) ** ${n} for j in range(N)) * hy)`, { tol: 0.001 });
    }
    const R = t.int(1, 4), k = t.pick([0, 1, 2]);
    const v = (2 * Math.PI * R ** (k + 2)) / (k + 2);
    return num(`Evaluate ∬ ${['1', '√(x² + y²)', '(x² + y²)'][k]} dA over the disc x² + y² ≤ ${R * R}. (4 decimal places)`, r4(v),
      `In polar coordinates the integrand is r^${k} and dA = r dr dθ: ∫₀^{2π}∫₀^${R} r^${k + 1} dr dθ = 2π·${R}^${k + 2}/${k + 2} = ${r4(v)}.`,
      `import math\n# midpoint rule on a square grid, keeping the cells whose centre is inside\nN, R = 1200, ${R}\nh = 2 * R / N\ns = 0.0\nfor i in range(N):\n    x = -R + (i + .5) * h\n    for j in range(N):\n        y = -R + (j + .5) * h\n        q = x * x + y * y\n        if q <= R * R: s += q ** (${k} / 2)\nprint(s * h * h)`, { rtol: 0.003, dp: 3 });
  }),

  SKILL('mv.line', 'Line integrals and Green\'s theorem', 'Work along a path, and Green\'s theorem turning a loop integral into an area integral.', t => {
    const a = t.int(-3, 3), b = t.int(1, 4), R = t.int(1, 3);
    // F = (−b y + a x, b x) around the circle of radius R counter-clockwise: ∮ = ∬ (∂Q/∂x − ∂P/∂y) = (b + b)·πR²
    const v = 2 * b * Math.PI * R * R;
    return num(`F(x, y) = (${a}x − ${b}y, ${b}x). Compute ∮ F · dr counter-clockwise around the circle x² + y² = ${R * R}. (4 decimal places)`, r4(v),
      `Green: ∮ P dx + Q dy = ∬ (∂Q/∂x − ∂P/∂y) dA = ∬ (${b} + ${b}) dA = ${2 * b}·π·${R}² = ${r4(v)}. The ${a}x term is a gradient field and contributes nothing around a loop.`,
      `import math\nN = 200000\ns = 0.0\nfor k in range(N):\n    t0, t1 = 2 * math.pi * k / N, 2 * math.pi * (k + 1) / N\n    tm = (t0 + t1) / 2\n    x, y = ${R} * math.cos(tm), ${R} * math.sin(tm)\n    dx, dy = ${R} * (math.cos(t1) - math.cos(t0)), ${R} * (math.sin(t1) - math.sin(t0))\n    s += (${a} * x - ${b} * y) * dx + ${b} * x * dy\nprint(s)`, { tol: 0.001 });
  }),

  SKILL('mv.divcurl', 'Divergence and curl', 'div F measures outflow per volume; curl F measures rotation.', t => {
    const a = t.int(1, 4), b = t.int(1, 4), c = t.int(1, 4), x = t.int(-2, 2), y = t.int(-2, 2), z = t.int(-2, 2), ask = t.pick(['div', 'curl z']);
    // F = (a x² y, b y z, c x z²)
    const div = 2 * a * x * y + b * z + 2 * c * x * z, curlz = 0 - a * x * x;
    const v = ask === 'div' ? div : curlz;
    return num(`F = (${a}x²y, ${b}yz, ${c}xz²). What is ${ask === 'div' ? 'div F' : 'the z-component of curl F'} at (${x}, ${y}, ${z})?`, v,
      ask === 'div' ? `div F = ∂(${a}x²y)/∂x + ∂(${b}yz)/∂y + ∂(${c}xz²)/∂z = ${2 * a}xy + ${b}z + ${2 * c}xz = ${v}.` : `(curl F)_z = ∂F₂/∂x − ∂F₁/∂y = 0 − ${a}x² = ${v}.`,
      `F = lambda x, y, z: (${a} * x * x * y, ${b} * y * z, ${c} * x * z * z)\nh = 1e-5\nP = (${x}, ${y}, ${z})\nd = lambda i, j: (F(*[P[k] + (h if k == j else 0) for k in range(3)])[i] - F(*[P[k] - (h if k == j else 0) for k in range(3)])[i]) / (2 * h)\nprint(round(${ask === 'div' ? 'd(0, 0) + d(1, 1) + d(2, 2)' : 'd(1, 0) - d(0, 1)'}, 6))`, { tol: 0.001, dp: 0 });
  }),

  SKILL('de.linear1', 'First-order linear ODEs', 'y′ + p y = q with an integrating factor; the solution relaxes to the forced state.', t => {
    const k = t.int(1, 4), A = t.int(1, 10), y0 = t.int(0, 10), T = t.pick([0.5, 1, 2]);
    // y' = −k y + A, y(0) = y0 → y = A/k + (y0 − A/k) e^{−kt}
    const v = A / k + (y0 - A / k) * Math.exp(-k * T);
    return num(`Solve y′ = −${k}y + ${A}, y(0) = ${y0}. What is y(${T})? (4 decimal places)`, r4(v),
      `Integrating factor e^{${k}t}: y = ${A}/${k} + (${y0} − ${A}/${k})e^{−${k}t}. At t = ${T}: ${r4(v)}. The steady state is ${r4(A / k)}, approached with time constant 1/${k}.`,
      `# fourth-order Runge–Kutta with a small step\nf = lambda t, y: -${k} * y + ${A}\ny, t, h = ${y0}.0, 0.0, 1e-4\nwhile t < ${T} - 1e-12:\n    k1 = f(t, y); k2 = f(t + h / 2, y + h * k1 / 2); k3 = f(t + h / 2, y + h * k2 / 2); k4 = f(t + h, y + h * k3)\n    y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; t += h\nprint(y)`);
  }),

  SKILL('de.oscillator', 'Damped oscillators', 'm x″ + b x′ + k x = 0 is under-, critically or over-damped by the sign of b² − 4mk.', t => {
    const m = t.int(1, 3), k = t.pick([4, 9, 16, 25]) * m, bc = 2 * Math.sqrt(m * k), b = t.pick([0, Math.round(bc / 2), bc, 2 * bc]);
    const disc = b * b - 4 * m * k, kind = disc < 0 ? 'Underdamped' : disc === 0 ? 'Critically damped' : 'Overdamped';
    if (t.rng() < 0.5) {
      return { kind: 'mc', q: `m = ${m}, b = ${b}, k = ${k} in m x″ + b x′ + k x = 0. How does it behave?`, options: [kind, ...['Underdamped', 'Critically damped', 'Overdamped'].filter(o => o !== kind)], correct: 0,
        explain: `b² − 4mk = ${b * b} − ${4 * m * k} = ${disc}: ${disc < 0 ? 'complex roots, a decaying oscillation' : disc === 0 ? 'a repeated root, the fastest return without oscillating' : 'two negative real roots, a slow return without oscillating'}.`,
        python: `import cmath\nm, b, k = ${m}, ${b}, ${k}\nr = [(-b + s * cmath.sqrt(b * b - 4 * m * k)) / (2 * m) for s in (1, -1)]\nprint('Critically damped' if abs(r[0] - r[1]) < 1e-12 else 'Underdamped' if abs(r[0].imag) > 1e-12 else 'Overdamped')` };
    }
    const wd = Math.sqrt(Math.max(0, 4 * m * k - b * b)) / (2 * m);
    if (disc >= 0) return num(`m = ${m}, b = ${b}, k = ${k}: what is the undamped natural frequency ω₀ = √(k/m) in rad/s? (4 decimal places)`, r4(Math.sqrt(k / m)),
      `ω₀ = √(${k}/${m}) = ${r4(Math.sqrt(k / m))}. With b = ${b} the system is ${kind.toLowerCase()} and does not oscillate.`,
      `import math\nprint(math.sqrt(${k} / ${m}))`);
    return num(`m = ${m}, b = ${b}, k = ${k}: what is the damped angular frequency ω_d in rad/s? (4 decimal places)`, r4(wd),
      `Roots −b/2m ± iω_d with ω_d = √(4mk − b²)/(2m) = ${r4(wd)}.`,
      `import math\n# simulate and time zero crossings of x(t)\nm, b, k = ${m}, ${b}, ${k}\nx, v, t, h = 1.0, 0.0, 0.0, 1e-5\ncross = []\nwhile len(cross) < 5:\n    a = -(b * v + k * x) / m\n    v += a * h; xn = x + v * h; t += h\n    if x > 0 >= xn or x < 0 <= xn: cross.append(t)\n    x = xn\nprint(math.pi / ((cross[-1] - cross[0]) / (len(cross) - 1)))`, { tol: 0.002 });
  }),

  SKILL('de.laplace', 'Laplace transforms', 'Turn derivatives into algebra: L{f′} = sF − f(0).', t => {
    const form = t.pick(['exp', 'sin', 'tpow']), s = t.int(3, 6);
    const a = t.int(1, 2), w = t.int(1, 3), n = t.int(1, 3), fact = k => (k <= 1 ? 1 : k * fact(k - 1));
    const [f, F, v] = form === 'exp' ? [`e^{${a}t}`, `1/(s − ${a})`, 1 / (s - a)] : form === 'sin' ? [`sin(${w}t)`, `${w}/(s² + ${w * w})`, w / (s * s + w * w)] : [`t^${n}`, `${n}!/s^${n + 1}`, fact(n) / s ** (n + 1)];
    return num(`What is the Laplace transform of ${f}, evaluated at s = ${s}? (4 decimal places)`, r4(v),
      `L{${f}} = ${F}; at s = ${s} that is ${r4(v)}.`,
      `import math\nf = lambda t: ${form === 'exp' ? `math.exp(${a} * t)` : form === 'sin' ? `math.sin(${w} * t)` : `t ** ${n}`}\nh, T = 1e-4, 40.0\nprint(sum(f((i + .5) * h) * math.exp(-${s} * (i + .5) * h) for i in range(int(T / h))) * h)`, { tol: 0.0005 });
  }),

  SKILL('de.phase', 'Linear systems in the plane', 'The trace and determinant of A classify x′ = Ax: saddle, node, spiral or centre.', t => {
    const A = [[t.int(-4, 3), t.int(-4, 4)], [t.int(-4, 4), t.int(-4, 3)]];
    const tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] * A[1][0], disc = tr * tr - 4 * det;
    const kind = det < 0 ? 'Saddle (unstable)' : det === 0 ? 'Degenerate (a line of equilibria)' : disc < 0 ? (tr < 0 ? 'Stable spiral' : tr > 0 ? 'Unstable spiral' : 'Centre') : (tr < 0 ? 'Stable node' : 'Unstable node');
    const opts = ['Saddle (unstable)', 'Stable node', 'Unstable node', 'Stable spiral', 'Unstable spiral', 'Centre', 'Degenerate (a line of equilibria)'];
    return { kind: 'mc', q: `Classify the origin for x′ = Ax with A = [[${A[0].join(', ')}], [${A[1].join(', ')}]].`, options: [kind, ...t.pickN(opts.filter(o => o !== kind), 3)], correct: 0,
      explain: `tr A = ${tr}, det A = ${det}, tr² − 4 det = ${disc}. ${det < 0 ? 'Negative determinant: real eigenvalues of opposite sign.' : det === 0 ? 'A zero eigenvalue.' : disc < 0 ? 'Complex eigenvalues with real part tr/2.' : 'Real eigenvalues of one sign, the sign of the trace.'}`,
      python: `import cmath\na, b, c, d = ${A[0][0]}, ${A[0][1]}, ${A[1][0]}, ${A[1][1]}\ntr, det = a + d, a * d - b * c\nl = [(tr + s * cmath.sqrt(tr * tr - 4 * det)) / 2 for s in (1, -1)]\nre = [x.real for x in l]; im = abs(l[0].imag)\nif abs(det) < 1e-12: print('Degenerate (a line of equilibria)')\nelif re[0] * re[1] < 0 and im < 1e-12: print('Saddle (unstable)')\nelif im > 1e-12: print('Centre' if abs(re[0]) < 1e-12 else 'Stable spiral' if re[0] < 0 else 'Unstable spiral')\nelse: print('Stable node' if max(re) < 0 else 'Unstable node')` };
  }),

  SKILL('de.equilibria', 'Equilibria and stability', 'For x′ = f(x), an equilibrium is stable when f′ < 0 there.', t => {
    const r = t.int(1, 3), K = t.pick([10, 20, 50, 100]), h = t.pick([0, 0.1, 0.2]) * r * K / 4 * 4;
    // logistic with harvesting: x' = r x (1 − x/K) − h ; equilibria roots of r x − r x²/K − h = 0
    const disc = r * r - 4 * (r / K) * h;
    const hi = (r + Math.sqrt(disc)) / (2 * r / K);
    return num(`x′ = ${r === 1 ? '' : r}x(1 − x/${K})${h ? ` − ${r4(h)} (logistic growth with constant harvesting)` : ' (logistic growth)'}. What is the stable equilibrium? (4 decimal places)`, r4(hi),
      `Set ${r}x − ${r}x²/${K} − ${h} = 0. The larger root, ${r4(hi)}, is stable (f′ < 0 there); the smaller is unstable.${h === 0 ? ' Without harvesting it is the carrying capacity.' : ''}`,
      `f = lambda x: ${r} * x * (1 - x / ${K}) - ${h}\n# run the dynamics forward from near the carrying capacity\nx, dt = ${K} * 0.9, 1e-3\nfor _ in range(400000): x += f(x) * dt\nprint(x)`, { tol: 0.001 });
  }),

  SKILL('de.euler', "Euler's method", 'One step: y ← y + h f(t, y). Its global error shrinks in proportion to h.', t => {
    const k = t.pick([-1, -2, 1]), y0 = t.int(1, 3), h = t.pick([0.1, 0.25, 0.5]), n = t.int(2, 4);
    let y = y0; for (let i = 0; i < n; i++) y += h * k * y;
    return num(`Apply Euler's method to y′ = ${k}y, y(0) = ${y0}, with step h = ${h}. What is the estimate of y(${r4(n * h)}) after ${n} steps? (4 decimal places)`, r4(y),
      `Each step multiplies by (1 + ${k}·${h}) = ${r4(1 + k * h)}: ${y0}·${r4(1 + k * h)}^${n} = ${r4(y)}, against the true ${r4(y0 * Math.exp(k * n * h))}.`,
      `from fractions import Fraction as F\ny, h = F(${y0}), F('${h}')\nfor _ in range(${n}): y = y + h * ${k} * y\nprint(float(y))`);
  }),
];
