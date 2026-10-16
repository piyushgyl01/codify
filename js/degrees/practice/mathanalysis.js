/**
 * Mathematics: analysis. Real analysis (18.100A) — suprema, ε–N limits,
 * uniform convergence, Riemann sums; complex analysis (18.04) — polar form,
 * roots of unity, the Cauchy–Riemann equations, residues and the residue
 * theorem, radii of convergence from singularities. QAA MSOR 3.10, 3.14;
 * GRE Mathematics: Calculus and Additional topics.
 *
 * Checks: computing the set or sequence itself, scanning n, sampling the
 * supremum on a fine grid, numerical contour integrals around the poles, and
 * finite-difference derivatives in the complex plane.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0.0001, dp: 4, explain, python, ...extra });
const PY = JSON.stringify;
const r4 = x => Math.round(x * 10000) / 10000;

export const MATHANALYSIS = [
  SKILL('ra.sup', 'Supremum and infimum', 'The least upper bound need not belong to the set.', t => {
    const a = t.int(1, 5), b = t.int(2, 6), sign = t.pick([1, -1]), ask = t.pick(['sup', 'inf']);
    // S = { a + sign·(−1)ⁿ b/n : n ≥ 1 }: values alternate around a, largest/smallest at n = 1 or 2
    const v = n => a + sign * (-1) ** n * b / n, vals = [1, 2].map(v);
    const sup = Math.max(...vals), inf = Math.min(...vals);
    return num(`S = { ${a} ${sign > 0 ? '+' : '−'} (−1)ⁿ·${b}/n : n = 1, 2, 3, … }. What is ${ask} S? (4 decimal places)`, r4(ask === 'sup' ? sup : inf),
      `Odd and even terms approach ${a} from opposite sides, shrinking like 1/n, so the extremes are at n = 1 and n = 2: ${r4(vals[0])} and ${r4(vals[1])}. ${ask} S = ${r4(ask === 'sup' ? sup : inf)}, attained.`,
      `S = [${a} + ${sign} * (-1) ** n * ${b} / n for n in range(1, 100000)]\nprint(${ask === 'sup' ? 'max' : 'min'}(S))`);
  }),

  SKILL('ra.epsn', 'ε–N limits', 'For each ε find an N beyond which every term is within ε of the limit.', t => {
    const c = t.int(1, 5), d = t.int(1, 4), eps = t.pick([0.1, 0.05, 0.01, 0.001]);
    // a_n = (c n + 1)/(d n) → c/d ; |a_n − c/d| = 1/(d n) < ε ⇔ n > 1/(d ε)
    const N = Math.floor(1 / (d * eps)) + 1;
    return num(`aₙ = (${c}n + 1)/(${d}n) → ${c}/${d}. What is the smallest N such that |aₙ − ${c}/${d}| < ${eps} for every n ≥ N?`, N,
      `|aₙ − ${c}/${d}| = 1/(${d}n), which is below ${eps} exactly when n > 1/(${d}·${eps}) = ${r4(1 / (d * eps))}. So N = ${N}.`,
      `from fractions import Fraction as F\nL, eps = F(${c}, ${d}), F('${eps}')\na = lambda n: F(${c} * n + 1, ${d} * n)\n# the error decreases with n, so the first n that works is the answer\nprint(next(n for n in range(1, 10 ** 6) if abs(a(n) - L) < eps))`, { tol: 0, dp: 0 });
  }),

  SKILL('ra.uniform', 'Uniform convergence', 'fₙ → f uniformly when sup |fₙ − f| → 0; pointwise convergence is not enough.', t => {
    const n = t.int(2, 12), form = t.pick(['xn', 'bump']);
    // xⁿ(1 − x) on [0,1]: max at x = n/(n+1); n x e^{−n x}: max 1/e at x = 1/n
    const v = form === 'xn' ? (n / (n + 1)) ** n / (n + 1) : 1 / Math.E;
    return num(form === 'xn' ? `fₙ(x) = xⁿ(1 − x) on [0, 1] tends to 0 pointwise. What is sup |f_${n}| (the distance from the limit)? (4 decimal places)` : `fₙ(x) = n·x·e^(−n·x) on [0, ∞) tends to 0 pointwise. What is sup |f_${n}|? (4 decimal places)`, r4(v),
      form === 'xn' ? `The maximum is at x = n/(n + 1): (n/(n+1))ⁿ/(n + 1) = ${r4(v)} → 0 like 1/(e n), so the convergence is uniform.` : `The maximum is at x = 1/n with value 1/e = ${r4(v)} for every n — the sup does not go to 0, so the convergence is not uniform.`,
      `import math\nf = lambda x: ${form === 'xn' ? `x ** ${n} * (1 - x)` : `${n} * x * math.exp(-${n} * x)`}\nhi = ${form === 'xn' ? 1 : 5}\nprint(max(f(hi * k / 2_000_000) for k in range(2_000_001)))`);
  }),

  SKILL('ra.riemann', 'Riemann sums', 'Upper and lower sums squeeze the integral; their gap measures how far the partition is from fine enough.', t => {
    const n = t.int(2, 8), p = t.pick([1, 2, 3]), ask = t.pick(['upper', 'lower']);
    // f(x) = x^p increasing on [0,1]: upper uses right endpoints, lower uses left
    let s = 0; for (let i = 0; i < n; i++) s += ((ask === 'upper' ? i + 1 : i) / n) ** p / n;
    return num(`f(x) = x^${p} on [0, 1], partitioned into ${n} equal pieces. What is the ${ask} Darboux sum? (4 decimal places)`, r4(s),
      `f is increasing, so the ${ask === 'upper' ? 'supremum on each piece is at its right end' : 'infimum on each piece is at its left end'}: Σ (${ask === 'upper' ? 'i' : 'i − 1'}/${n})^${p}·(1/${n}) = ${r4(s)}. The integral, 1/${p + 1}, lies between the lower and upper sums.`,
      `# take sup or inf of f on each piece by sampling it finely\nn, p = ${n}, ${p}\nf = lambda x: x ** p\ns = 0.0\nfor i in range(n):\n    xs = [i / n + k / (n * 2000) for k in range(2001)]\n    s += ${ask === 'upper' ? 'max' : 'min'}(f(x) for x in xs) / n\nprint(s)`);
  }),

  SKILL('cx.polar', 'Complex numbers in polar form', 'z = r e^{iθ}: moduli multiply and arguments add.', t => {
    const a = t.int(-4, 4) || 1, b = t.int(-4, 4), k = t.int(2, 5), ask = t.pick(['modulus', 'argument']);
    // zᵏ exactly, in integers, so a result on the negative real axis has argument π, not −π
    let re = 1, im = 0; for (let i = 0; i < k; i++) [re, im] = [re * a - im * b, re * b + im * a];
    const r = Math.hypot(a, b) ** k, arg = Math.atan2(im, re);
    return num(`z = ${a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}i. What is the ${ask === 'modulus' ? 'modulus |z^' + k + '|' : 'principal argument of z^' + k + ' (in (−π, π])'}? (4 decimal places)`, r4(ask === 'modulus' ? r : arg),
      `|z| = √${a * a + b * b}, arg z = ${r4(Math.atan2(b, a))}. De Moivre: |z^${k}| = |z|^${k} = ${r4(r)}, arg z^${k} = ${k}·arg z, reduced to (−π, π]: ${r4(arg)}.`,
      `import cmath\nw = complex(${a}, ${b}) ** ${k}\nprint(${ask === 'modulus' ? 'abs(w)' : 'cmath.phase(w)'})`, { rtol: 1e-6 });
  }),

  SKILL('cx.roots', 'Roots of complex numbers', 'w has n distinct n-th roots, equally spaced on a circle of radius |w|^{1/n}.', t => {
    const n = t.int(3, 6), R = t.pick([1, 8, 16, 27]), phi = t.pick([0, Math.PI / 2, Math.PI]), k = t.int(0, n - 1), ask = t.pick(['re', 'im']);
    const w = { re: R * Math.cos(phi), im: R * Math.sin(phi) }, rr = R ** (1 / n), ang = (phi + 2 * Math.PI * k) / n;
    const z = [rr * Math.cos(ang), rr * Math.sin(ang)];
    const wtxt = phi === 0 ? `${R}` : phi === Math.PI ? `−${R}` : `${R}i`;
    return num(`The ${n}th roots of ${wtxt} are r·e^{i(φ + 2πk)/${n}}, k = 0, …, ${n - 1}. What is the ${ask === 're' ? 'real' : 'imaginary'} part of the root with k = ${k}? (4 decimal places)`, r4(ask === 're' ? z[0] : z[1]),
      `r = ${R}^{1/${n}} = ${r4(rr)}, φ = arg(${wtxt}) = ${r4(phi)}; angle (φ + 2π·${k})/${n} = ${r4(ang)}. The root is ${r4(z[0])} ${z[1] < 0 ? '−' : '+'} ${r4(Math.abs(z[1]))}i.`,
      `import cmath, math\nw = complex(${r4(w.re)}, ${r4(w.im)})\n# Newton on z^n = w from the predicted angle's neighbourhood, then confirm it is a root\nz = cmath.rect(abs(w) ** (1 / ${n}), (cmath.phase(w) + 2 * math.pi * ${k}) / ${n}) * (1 + 0.01j)\nfor _ in range(60): z -= (z ** ${n} - w) / (${n} * z ** ${n - 1})\nprint(z.${ask === 're' ? 'real' : 'imag'})`);
  }),

  SKILL('cx.cr', 'The Cauchy–Riemann equations', 'f = u + iv is complex-differentiable where uₓ = v_y and u_y = −vₓ.', t => {
    const cases = [
      ['z² (u = x² − y², v = 2xy)', 'x*x - y*y', '2*x*y', () => true],
      ['z̄ (u = x, v = −y)', 'x', '-y', () => false],
      ['|z|² (u = x² + y², v = 0)', 'x*x + y*y', '0*x', (x, y) => x === 0 && y === 0],
      ['e^z (u = eˣ cos y, v = eˣ sin y)', 'math.exp(x)*math.cos(y)', 'math.exp(x)*math.sin(y)', () => true],
      ['x² + iy² (u = x², v = y²)', 'x*x', 'y*y', (x, y) => x === y],
      ['z³ (u = x³ − 3xy², v = 3x²y − y³)', 'x**3 - 3*x*y*y', '3*x*x*y - y**3', () => true],
    ];
    const [name, u, v, at] = t.pick(cases), x0 = t.int(1, 3), y0 = t.int(1, 3), an = at(x0, y0);
    const ans = an ? 'Yes' : 'No';
    return { kind: 'mc', q: `Is f = ${name} complex-differentiable at ${x0} + ${y0}i?`, options: [ans, ans === 'Yes' ? 'No' : 'Yes'], correct: 0,
      explain: an ? (at(0.5, 1.5) ? 'Its partial derivatives satisfy uₓ = v_y and u_y = −vₓ everywhere: it is entire.' : 'The Cauchy–Riemann equations hold at this point (only along a line, so it is differentiable here but analytic nowhere).') : 'The Cauchy–Riemann equations fail at this point.',
      python: `import math\nu = lambda x, y: ${u}\nv = lambda x, y: ${v}\nh, x, y = 1e-6, ${x0}, ${y0}\nux = (u(x + h, y) - u(x - h, y)) / (2 * h); uy = (u(x, y + h) - u(x, y - h)) / (2 * h)\nvx = (v(x + h, y) - v(x - h, y)) / (2 * h); vy = (v(x, y + h) - v(x, y - h)) / (2 * h)\nprint('Yes' if abs(ux - vy) < 1e-4 and abs(uy + vx) < 1e-4 else 'No')` };
  }),

  SKILL('cx.residue', 'Residues and the residue theorem', '∮ f dz = 2πi × (sum of residues inside the contour).', t => {
    const a = t.int(-3, 3), b = t.int(-3, 3) || 4, R = t.pick([1, 2, 5]), m = t.int(1, 3);
    // f(z) = m / ((z − a)(z − b)) with a ≠ b; residues m/(a − b), m/(b − a)
    const bb = b === a ? a + 2 : b, inside = [a, bb].filter(p => Math.abs(p) < R);
    const res = { [a]: m / (a - bb), [bb]: m / (bb - a) };
    if ([a, bb].some(p => Math.abs(Math.abs(p) - R) < 1e-9)) return num(`What is the residue of f(z) = ${m}/((z − ${a})(z − ${bb})) at z = ${a}? (4 decimal places)`, r4(res[a]),
      `A simple pole: Res = lim (z − ${a}) f(z) = ${m}/(${a} − ${bb}) = ${r4(res[a])}.`,
      `z0, eps, N = ${a}, 1e-3, 20000\nimport cmath, math\nf = lambda z: ${m} / ((z - ${a}) * (z - ${bb}))\n# residue = (1/2πi) ∮ around a tiny circle\nprint((sum(f(z0 + eps * cmath.exp(2j * math.pi * k / N)) * eps * 2j * math.pi / N * cmath.exp(2j * math.pi * k / N) for k in range(N)) / (2j * math.pi)).real)`);
    const total = inside.reduce((s, p) => s + res[p], 0), val = 2 * Math.PI * total;
    return num(`Compute (1/i)·∮_{|z| = ${R}} ${m}/((z − ${a})(z − ${bb})) dz, counter-clockwise. (4 decimal places)`, r4(val),
      `Poles at ${a} and ${bb}; inside |z| < ${R}: ${inside.length ? inside.join(' and ') : 'none'}. Residue theorem: ∮ = 2πi·(${inside.map(p => r4(res[p])).join(' + ') || '0'}), so (1/i)∮ = ${r4(val)}.${inside.length === 2 ? ' Both residues cancel.' : ''}`,
      `import cmath, math\nN = 200000\nf = lambda z: ${m} / ((z - ${a}) * (z - ${bb}))\ns = sum(f(${R} * cmath.exp(2j * math.pi * (k + .5) / N)) * ${R} * 2j * math.pi / N * cmath.exp(2j * math.pi * (k + .5) / N) for k in range(N))\nprint((s / 1j).real)`, { tol: 0.001 });
  }),

  SKILL('cx.radius', 'Radius of convergence', 'A power series about z₀ converges out to the nearest singularity.', t => {
    const z0 = [t.int(-2, 2), t.int(-2, 2)], poles = [[t.int(-3, 3), t.int(-3, 3)], [t.int(-3, 3), t.int(-3, 3)]].filter(p => p[0] !== z0[0] || p[1] !== z0[1]);
    if (!poles.length) poles.push([z0[0] + 2, z0[1]]);
    const d = Math.min(...poles.map(p => Math.hypot(p[0] - z0[0], p[1] - z0[1])));
    const ptxt = p => `${p[0]}${p[1] < 0 ? '−' : '+'}${Math.abs(p[1])}i`;
    return num(`f(z) = 1/(${poles.map(p => `(z − (${ptxt(p)}))`).join('')}). What is the radius of convergence of its Taylor series about z₀ = ${ptxt(z0)}? (4 decimal places)`, r4(d),
      `f is analytic except at its poles, so the series converges in the largest disc about z₀ that avoids them: distance to the nearest pole = ${r4(d)}.`,
      `import cmath\n# expand the denominator into a polynomial and recover its roots from the coefficients alone\nP = [complex(*p) for p in ${PY(poles)}]\nc = [1 + 0j]\nfor p in P: c = [b - p * a for a, b in zip(c + [0], [0] + c)]\n# c holds coefficients from z^0 upward\nif len(c) == 2: roots = [-c[0] / c[1]]\nelse:\n    a, b, k = c[2], c[1], c[0]\n    d = cmath.sqrt(b * b - 4 * a * k)\n    roots = [(-b + d) / (2 * a), (-b - d) / (2 * a)]\nz0 = complex(${z0[0]}, ${z0[1]})\nprint(min(abs(x - z0) for x in roots))`, { tol: 0.0001, dp: 4 });
  }),
];
