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
  SKILL('meas.cantor', 'Measure of Cantor-type sets', 'Remove the open middle fraction at every stage: what remains has measure (1 − r)ⁿ — zero in the limit, yet uncountable.', t => {
    const r = t.pick([1 / 3, 1 / 5, 1 / 2]), n = t.int(1, 6);
    const v = (1 - r) ** n, rtxt = { [1 / 3]: '1/3', [1 / 5]: '1/5', [1 / 2]: '1/2' }[r];
    return num(`Start with [0, 1]. At each stage remove the open middle ${rtxt} of every interval that remains. What is the total length left after ${n} stages? (4 decimal places)`, r4(v),
      `Each stage keeps a fraction 1 − ${rtxt} of what is there: (1 − ${rtxt})^${n} = ${r4(v)}. As n → ∞ the measure tends to 0.`,
      `from fractions import Fraction as F\nr = F(${r === 1 / 3 ? '1, 3' : r === 1 / 5 ? '1, 5' : '1, 2'})\nI = [(F(0), F(1))]\nfor _ in range(${n}):\n    J = []\n    for a, b in I:\n        L = b - a; cut = L * r\n        J += [(a, a + (L - cut) / 2), (b - (L - cut) / 2, b)]\n    I = J\nprint(float(sum(b - a for a, b in I)))`);
  }),

  SKILL('meas.simple', 'Lebesgue integrals of simple functions', '∫ Σ cᵢ 1_{Aᵢ} dμ = Σ cᵢ μ(Aᵢ) — measure the sets, not the intervals of x.', t => {
    const pieces = Array.from({ length: t.int(2, 3) }, () => { const a = t.int(0, 8) / 10; return [a, Math.min(1, a + t.int(1, 4) / 10), t.int(1, 5)]; });
    // f = Σ c 1_[a,b) (overlaps add)
    const v = pieces.reduce((s, [a, b, c]) => s + c * (b - a), 0);
    return num(`f = ${pieces.map(([a, b, c]) => `${c}·1_[${a}, ${b})`).join(' + ')} on [0, 1] (indicators may overlap, and then add). What is ∫ f dλ? (4 decimal places)`, r4(v),
      `Linearity: Σ cᵢ λ(Aᵢ) = ${pieces.map(([a, b, c]) => `${c}·${r4(b - a)}`).join(' + ')} = ${r4(v)}.`,
      `P = ${PY(pieces)}\nN = 1_000_000\nf = lambda x: sum(c for a, b, c in P if a <= x < b)\nprint(sum(f((i + .5) / N) for i in range(N)) / N)`, { tol: 0.0005 });
  }),

  SKILL('meas.lp', 'Lᵖ norms', '‖f‖_p = (∫|f|ᵖ)^{1/p}; on [0, 1], xᵃ is in Lᵖ exactly when ap > −1.', t => {
    const a = t.pick([-0.25, 0.5, 1, 2]), pw = t.pick([1, 2, 3]);
    const v = (1 / (a * pw + 1)) ** (1 / pw);
    return num(`On [0, 1], what is the L^${pw} norm of f(x) = x^${a}? (4 decimal places)`, r4(v),
      `∫₀¹ x^${a * pw} dx = 1/(${a * pw} + 1), so ‖f‖_${pw} = (1/${r4(a * pw + 1)})^{1/${pw}} = ${r4(v)}.`,
      `import math\n# substitute x = e^(-u) to tame the endpoint, then integrate numerically\np, a = ${pw}, ${a}\nN, U = 400000, 60.0\nh = U / N\nI = sum(math.exp(-(a * p + 1) * (i + .5) * h) for i in range(N)) * h\nprint(I ** (1 / p))`);
  }),

  SKILL('top.euler', 'Euler characteristic and surfaces', 'χ = V − E + F classifies closed surfaces: orientable genus g has χ = 2 − 2g.', t => {
    const g = t.int(0, 4), ask = t.pick(['chi', 'genus']);
    const chi = 2 - 2 * g;
    if (ask === 'chi') return num(`What is the Euler characteristic of a closed orientable surface of genus ${g} (${['a sphere', 'a torus', 'a two-holed torus', 'a three-holed torus', 'a four-holed torus'][g]})?`, chi,
      `χ = 2 − 2g = ${chi}. A triangulation of it has V − E + F = ${chi} however it is drawn.`,
      `# glue a 4g-gon as a1 b1 a1^-1 b1^-1 ... (one face); count the vertex and edge classes\ng = ${g}\nif g == 0: print(2)\nelse:\n    V, E, F = 1, 2 * g, 1  # all corners of the standard polygon become one point; edges pair up\n    print(V - E + F)`, { tol: 0, dp: 0 });
    const V = t.int(6, 12), E = V + 2 * g - 2 + t.int(3, 6), F = E - V + chi;
    return num(`A triangulated closed orientable surface has ${V} vertices, ${E} edges and ${F} faces. What is its genus?`, g,
      `χ = ${V} − ${E} + ${F} = ${chi}; genus = (2 − χ)/2 = ${g}.`,
      `V, E, F = ${V}, ${E}, ${F}\nchi = V - E + F\nprint(next(g for g in range(50) if 2 - 2 * g == chi))`, { tol: 0, dp: 0 });
  }),

  SKILL('top.count', 'Topologies on finite sets', 'A topology is a family of subsets containing ∅ and X, closed under unions and intersections.', t => {
    const n = t.int(1, 3), counts = [1, 1, 4, 29], ask = t.pick(['all', 'T0']), T0 = [1, 1, 3, 19];
    const v = ask === 'all' ? counts[n] : T0[n];
    return num(`How many ${ask === 'all' ? 'topologies' : 'T₀ topologies (any two points separated by some open set)'} are there on a set with ${n} element${n > 1 ? 's' : ''}?`, v,
      `Listing the families of subsets closed under union and intersection that contain ∅ and the whole set gives ${counts[n]}${ask === 'T0' ? `, of which ${T0[n]} are T₀` : ''}.`,
      `from itertools import combinations\nn = ${n}\nX = frozenset(range(n))\nsubsets = [frozenset(c) for k in range(n + 1) for c in combinations(range(n), k)]\nrest = [s for s in subsets if s and s != X]\ncount = t0 = 0\nfor k in range(len(rest) + 1):\n    for extra in combinations(rest, k):\n        T = set(extra) | {frozenset(), X}\n        if all(a | b in T and a & b in T for a in T for b in T):\n            count += 1\n            if all(any((x in U) != (y in U) for U in T) for x in range(n) for y in range(x + 1, n)): t0 += 1\nprint(${ask === 'all' ? 'count' : 't0'})`, { tol: 0, dp: 0 });
  }),
  SKILL('fa.fourier', 'Fourier coefficients', 'bₙ = (1/π)∫ f(x) sin(nx) dx on [−π, π]: the square wave has only odd harmonics, falling like 1/n.', t => {
    const wave = t.pick(['square', 'sawtooth']), n = t.int(1, 6);
    // square: f = sign(x) → bₙ = 4/(nπ) for odd n, 0 for even; sawtooth f = x → bₙ = 2(−1)^{n+1}/n
    const v = wave === 'square' ? (n % 2 ? 4 / (n * Math.PI) : 0) : (2 * (-1) ** (n + 1)) / n;
    return num(`On [−π, π], f(x) = ${wave === 'square' ? 'sign(x) (a square wave)' : 'x (a sawtooth, extended periodically)'}. What is the sine coefficient b_${n} = (1/π)∫ f(x) sin(${n}x) dx? (4 decimal places)`, r4(v),
      wave === 'square' ? `f is odd, so only sines appear: bₙ = 4/(nπ) for odd n and 0 for even n. b_${n} = ${r4(v)}.` : `Integrating by parts, bₙ = 2(−1)^{n+1}/n: b_${n} = ${r4(v)}. The slow 1/n decay reflects the jump at ±π.`,
      `import math\nN = 400000\nf = ${wave === 'square' ? 'lambda x: (x > 0) - (x < 0)' : 'lambda x: x'}\nh = 2 * math.pi / N\nprint(sum(f(-math.pi + (k + .5) * h) * math.sin(${n} * (-math.pi + (k + .5) * h)) for k in range(N)) * h / math.pi)`);
  }),

  SKILL('fa.parseval', "Parseval's identity", 'The energy of a function equals the sum of the squares of its Fourier coefficients.', t => {
    const p = t.pick([2, 4]);
    // Σ 1/n² = π²/6 (Parseval on the sawtooth); Σ 1/n⁴ = π⁴/90 (Parseval on x² or Fourier of a parabola)
    const v = p === 2 ? Math.PI ** 2 / 6 : Math.PI ** 4 / 90;
    return num(`Parseval's identity applied to ${p === 2 ? 'the sawtooth f(x) = x' : 'f(x) = x² on [−π, π]'} evaluates Σ_{n≥1} 1/n^${p}. What is its value? (4 decimal places)`, r4(v),
      p === 2 ? `The sawtooth has bₙ = 2(−1)^{n+1}/n; Parseval gives (1/π)∫x² = Σ 4/n², i.e. 2π²/3 = 4Σ1/n², so Σ 1/n² = π²/6 = ${r4(v)}.` : `x² has aₙ = 4(−1)ⁿ/n²; Parseval gives Σ 1/n⁴ = π⁴/90 = ${r4(v)}.`,
      `N = 2_000_000\ns = sum(1 / n ** ${p} for n in range(1, N))\n# add the tail ∫_N^∞ x^-p dx\nprint(s + 1 / ((${p} - 1) * N ** (${p} - 1)))`);
  }),

  SKILL('fa.opnorm', 'Operator norms', 'The 2-norm of a matrix is its largest singular value — the most it can stretch a unit vector.', t => {
    const A = [[t.int(-4, 4), t.int(-4, 4)], [t.int(-4, 4), t.int(-4, 4)]];
    const [a, b] = A[0], [c, d] = A[1], S = a * a + b * b + c * c + d * d, D = a * d - b * c;
    const v = Math.sqrt((S + Math.sqrt(Math.max(0, S * S - 4 * D * D))) / 2);
    return num(`What is the operator 2-norm ‖A‖ = max ‖Ax‖/‖x‖ of A = [[${a}, ${b}], [${c}, ${d}]]? (4 decimal places)`, r4(v),
      `σ_max² is the larger eigenvalue of AᵀA: (‖A‖_F² + √(‖A‖_F⁴ − 4 det²))/2 with ‖A‖_F² = ${S}, det = ${D}. So ‖A‖ = ${r4(v)}.`,
      `import math\na, b, c, d = ${a}, ${b}, ${c}, ${d}\n# maximise |Ax| over unit vectors on a fine grid of angles\nprint(max(math.hypot(a * math.cos(t) + b * math.sin(t), c * math.cos(t) + d * math.sin(t)) for t in [k * math.pi / 200000 for k in range(200000)]))`);
  }),

  SKILL('dg.curvature', 'Curvature of curves', 'κ = |r′ × r″| / |r′|³ — a circle of radius R has κ = 1/R; a helix also twists, with torsion τ.', t => {
    const form = t.pick(['parabola', 'helix-k', 'helix-t']);
    if (form === 'parabola') {
      const a = t.int(1, 3), x = t.int(-2, 2), v = (2 * a) / (1 + (2 * a * x) ** 2) ** 1.5;
      return num(`What is the curvature of y = ${a === 1 ? '' : a}x² at x = ${x}? (4 decimal places)`, r4(v),
        `κ = |y″|/(1 + y′²)^{3/2} = ${2 * a}/(1 + ${(2 * a * x) ** 2})^{3/2} = ${r4(v)}.`,
        `import math\n# fit a circle through three nearby points and take 1/radius\nf = lambda x: ${a} * x * x\nh = 1e-3\n(x1, y1), (x2, y2), (x3, y3) = [(${x} + k * h, f(${x} + k * h)) for k in (-1, 0, 1)]\nA = math.dist((x1, y1), (x2, y2)); B = math.dist((x2, y2), (x3, y3)); C = math.dist((x1, y1), (x3, y3))\narea = abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)) / 2\nprint(4 * area / (A * B * C))`);
    }
    const R = t.int(1, 4), c = t.int(1, 3), k = R / (R * R + c * c), tau = c / (R * R + c * c);
    return num(`The helix r(t) = (${R}cos t, ${R}sin t, ${c}t). What is its ${form === 'helix-k' ? 'curvature κ' : 'torsion τ'}? (4 decimal places)`, r4(form === 'helix-k' ? k : tau),
      `For a helix with radius a = ${R} and pitch parameter b = ${c}: κ = a/(a² + b²) = ${r4(k)}, τ = b/(a² + b²) = ${r4(tau)}, both constant.`,
      `import math\nR, c = ${R}, ${c}\nr = lambda t: (R * math.cos(t), R * math.sin(t), c * t)\nh = 1e-3\nd = lambda f, t: tuple((p - q) / (2 * h) for p, q in zip(f(t + h), f(t - h)))\nr1 = lambda t: d(r, t); r2 = lambda t: d(r1, t); r3 = lambda t: d(r2, t)\ncross = lambda u, v: (u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0])\nnorm = lambda u: math.sqrt(sum(x * x for x in u))\nt0 = 0.7\nc12 = cross(r1(t0), r2(t0))\n${form === 'helix-k' ? 'print(norm(c12) / norm(r1(t0)) ** 3)' : 'print(sum(a * b for a, b in zip(c12, r3(t0))) / norm(c12) ** 2)'}`, { tol: 0.0005 });
  }),

  SKILL('dg.gauss', 'Gaussian curvature', 'For a graph z = f(x, y): K = (f_xx f_yy − f_xy²)/(1 + f_x² + f_y²)².', t => {
    const a = t.int(-2, 2) || 1, b = t.int(-2, 2), c = t.int(-2, 2) || 1, x = t.int(-1, 1), y = t.int(-1, 1);
    // f = a x² + b x y + c y²
    const fx = 2 * a * x + b * y, fy = b * x + 2 * c * y, K = (4 * a * c - b * b) / (1 + fx * fx + fy * fy) ** 2;
    return num(`What is the Gaussian curvature of the surface z = ${a}x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}xy ${c < 0 ? '−' : '+'} ${Math.abs(c)}y² at (x, y) = (${x}, ${y})? (4 decimal places)`, r4(K),
      `f_xx f_yy − f_xy² = ${2 * a}·${2 * c} − ${b}² = ${4 * a * c - b * b}; 1 + f_x² + f_y² = ${1 + fx * fx + fy * fy}. K = ${r4(K)}. ${4 * a * c - b * b > 0 ? 'Positive: locally like a cap.' : 4 * a * c - b * b < 0 ? 'Negative: a saddle.' : 'Zero: flat in one direction.'}`,
      `import math\n# K = det(second fundamental form)/det(first), with every derivative taken by finite differences\nf = lambda x, y: ${a} * x * x + ${b} * x * y + ${c} * y * y\nh = 1e-4; X, Y = ${x}, ${y}\nfx = (f(X + h, Y) - f(X - h, Y)) / (2 * h); fy = (f(X, Y + h) - f(X, Y - h)) / (2 * h)\nfxx = (f(X + h, Y) - 2 * f(X, Y) + f(X - h, Y)) / h ** 2; fyy = (f(X, Y + h) - 2 * f(X, Y) + f(X, Y - h)) / h ** 2\nfxy = (f(X + h, Y + h) - f(X + h, Y - h) - f(X - h, Y + h) + f(X - h, Y - h)) / (4 * h * h)\nE, F, G = 1 + fx * fx, fx * fy, 1 + fy * fy\nW = math.sqrt(E * G - F * F)\nL, M, N = fxx / W, fxy / W, fyy / W\nprint((L * N - M * M) / (E * G - F * F))`, { tol: 0.001 });
  }),

  SKILL('pde.heat', 'The heat equation', 'Each Fourier mode of u_t = u_xx on [0, π] decays like e^{−n²t}: high frequencies die first.', t => {
    const B = [t.int(1, 4), 0, t.int(-2, 2)], T = t.pick([0.1, 0.25, 0.5, 1]), x = t.pick([Math.PI / 2, Math.PI / 4, Math.PI / 3]);
    // u(x,0) = B1 sin x + B3 sin 3x → u = B1 e^{−t} sin x + B3 e^{−9t} sin 3x
    const v = B[0] * Math.exp(-T) * Math.sin(x) + B[2] * Math.exp(-9 * T) * Math.sin(3 * x);
    const xt = { [Math.PI / 2]: 'π/2', [Math.PI / 4]: 'π/4', [Math.PI / 3]: 'π/3' }[x];
    return num(`u_t = u_xx on 0 < x < π with u = 0 at both ends and u(x, 0) = ${B[0]} sin x ${B[2] < 0 ? '−' : '+'} ${Math.abs(B[2])} sin 3x. What is u(${xt}, ${T})? (4 decimal places)`, r4(v),
      `Separation of variables: u = ${B[0]}e^{−t} sin x ${B[2] < 0 ? '−' : '+'} ${Math.abs(B[2])}e^{−9t} sin 3x. At (${xt}, ${T}): ${r4(v)}.`,
      `import math\n# explicit finite differences, well inside the stability limit\nN = 200; dx = math.pi / N; dt = 0.2 * dx * dx\nu = [${B[0]} * math.sin(i * dx) + ${B[2]} * math.sin(3 * i * dx) for i in range(N + 1)]\nsteps = round(${T} / dt); dt = ${T} / steps\nfor _ in range(steps):\n    u = [0.0] + [u[i] + dt / dx ** 2 * (u[i + 1] - 2 * u[i] + u[i - 1]) for i in range(1, N)] + [0.0]\nX = ${x}\ni = int(X / dx); w = X / dx - i\nprint(u[i] * (1 - w) + u[i + 1] * w)`, { tol: 0.002 });
  }),

  SKILL('pde.cfl', 'Stability of explicit schemes', 'Explicit Euler for u_t = α u_xx is stable only if α Δt/Δx² ≤ ½.', t => {
    const alpha = t.pick([0.5, 1, 2]), dx = t.pick([0.1, 0.05, 0.02]);
    const v = dx * dx / (2 * alpha);
    return num(`Explicit finite differences for u_t = ${alpha}·u_xx with Δx = ${dx}. What is the largest stable time step Δt? (6 decimal places)`, Math.round(v * 1e6) / 1e6,
      `Stability needs r = αΔt/Δx² ≤ ½, so Δt ≤ Δx²/(2α) = ${dx}²/(2·${alpha}) = ${v.toFixed(6)}. Halving Δx quarters the step — one reason implicit methods exist.`,
      `# von Neumann: the amplification factor 1 - 4r sin^2(theta/2) must stay in [-1, 1]; scan r\nimport math\nr = max(k / 10000 for k in range(1, 20000) if all(abs(1 - 4 * k / 10000 * math.sin(th / 2) ** 2) <= 1 + 1e-12 for th in [j * math.pi / 200 for j in range(201)]))\nprint(r * ${dx} ** 2 / ${alpha})`, { tol: 2e-6, dp: 6 });
  }),

  SKILL('pde.classify', 'Classifying second-order PDEs', 'a u_xx + 2b u_xy + c u_yy: elliptic if b² < ac, parabolic if b² = ac, hyperbolic if b² > ac.', t => {
    const a = t.int(-3, 3) || 1, b = t.int(-3, 3), c = t.int(-3, 3);
    const D = b * b - a * c, kind = D < 0 ? 'Elliptic' : D === 0 ? 'Parabolic' : 'Hyperbolic';
    return { kind: 'mc', q: `Classify ${a}u_xx ${b < 0 ? '−' : '+'} ${Math.abs(2 * b)}u_xy ${c < 0 ? '−' : '+'} ${Math.abs(c)}u_yy = 0.`, options: [kind, ...['Elliptic', 'Parabolic', 'Hyperbolic'].filter(o => o !== kind)], correct: 0,
      explain: `b² − ac = ${b}² − (${a})(${c}) = ${D}. ${kind === 'Elliptic' ? 'Like Laplace\'s equation: smooth, no characteristics.' : kind === 'Parabolic' ? 'Like the heat equation: one family of characteristics.' : 'Like the wave equation: two families of characteristics.'}`,
      python: `import cmath\na, b, c = ${a}, ${b}, ${c}\n# characteristic slopes solve a m^2 - 2 b m + c = 0; count the distinct real ones\nd = cmath.sqrt(4 * b * b - 4 * a * c)\nroots = [(2 * b + d) / (2 * a), (2 * b - d) / (2 * a)]\nreal = [r for r in roots if abs(r.imag) < 1e-12]\nprint('Elliptic' if not real else 'Parabolic' if abs(roots[0] - roots[1]) < 1e-12 else 'Hyperbolic')` };
  }),

  SKILL('cv.euler', 'The Euler–Lagrange equation', 'Minimise ∫(y′² + k²y²) dx with fixed ends: the minimiser solves y″ = k²y.', t => {
    const k = t.pick([1, 2]), L = t.pick([1, 2]), A = t.int(0, 3), B = t.int(1, 5), xq = L / 2;
    // y = (A sinh(k(L−x)) + B sinh(kx)) / sinh(kL)
    const y = x => (A * Math.sinh(k * (L - x)) + B * Math.sinh(k * x)) / Math.sinh(k * L);
    return num(`Among functions with y(0) = ${A} and y(${L}) = ${B}, which minimises J[y] = ∫₀^${L} (y′² + ${k * k}y²) dx? Give y(${xq}) for the minimiser. (4 decimal places)`, r4(y(xq)),
      `Euler–Lagrange: d/dx(2y′) = 2·${k * k}y, so y″ = ${k * k}y with the boundary values: y = (${A} sinh(${k}(${L} − x)) + ${B} sinh(${k}x))/sinh(${k * L}). At x = ${xq}: ${r4(y(xq))}.`,
      `# minimise the discretised functional directly: it is quadratic, so solve its tridiagonal optimality system\nN = 4000; L, k = ${L}, ${k}; h = L / N\n# interior unknowns y1..y(N-1); gradient = 0 gives (2/h + k^2 h) y_i - (1/h)(y_{i-1} + y_{i+1}) = 0 (trapezoid on y^2)\na = [-1 / h] * (N - 1); b = [2 / h + k * k * h] * (N - 1); c = [-1 / h] * (N - 1); d = [0.0] * (N - 1)\nd[0] += ${A} / h; d[-1] += ${B} / h\nfor i in range(1, N - 1):\n    m = a[i] / b[i - 1]; b[i] -= m * c[i - 1]; d[i] -= m * d[i - 1]\ny = [0.0] * (N - 1); y[-1] = d[-1] / b[-1]\nfor i in range(N - 3, -1, -1): y[i] = (d[i] - c[i] * y[i + 1]) / b[i]\nprint(y[N // 2 - 1])`, { tol: 0.0005 });
  }),
];
