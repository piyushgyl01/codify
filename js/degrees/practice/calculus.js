/**
 * MATH120 Calculus for Computing — practice modelled on MIT 18.01SC
 * (Fall 2010) exams 1–4 and the final: derivatives by rule, higher
 * derivatives, tangent lines, linear and Taylor approximation, optimisation,
 * related rates, definite integrals, the fundamental theorem, the trapezoid
 * rule and limits.
 *
 * Each question computes its answer in closed form, and carries `python`: a
 * program that gets the same number a different way — finite differences,
 * Simpson's rule, a Cauchy-integral derivative, a grid search, a small time
 * step — so the tests check the maths against arithmetic, not against itself.
 */

const sup = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹⁻'['0123456789-'.indexOf(c)]).join('');
const r4 = x => Math.round(x * 1e4) / 1e4;
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, explain, python, rtol: 0.005, dp: 4, ...extra });
const PY_HEAD = 'from math import *\n';
const pyDeriv = (f, x0) => `${PY_HEAD}f = lambda x: ${f}\nh = 1e-5\nprint((f(${x0}+h) - f(${x0}-h)) / (2*h))`;
const pySimpson = (f, a, b) => `${PY_HEAD}f = lambda x: ${f}\na, b, n = ${a}, ${b}, 20000\nh = (b-a)/n\ns = f(a) + f(b) + sum((4 if i % 2 else 2) * f(a + i*h) for i in range(1, n))\nprint(s * h / 3)`;
/** The n-th derivative at a point, from Cauchy's integral formula on a circle — no differentiation rules involved. */
const pyCauchy = (f, x0, n) => `${PY_HEAD}import cmath\nf = lambda z: ${f}\nN, r = 256, 0.5\ns = sum(f(${x0} + r*cmath.exp(2j*pi*k/N)) * cmath.exp(-2j*pi*k*${n}/N) for k in range(N))\nprint((factorial(${n}) * s / (N * r**${n})).real)`;

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });

export const CALCULUS = [
  SKILL('calc.deriv', 'Derivatives by rule', 'Product, quotient and chain rules, evaluated at a point.', t => {
    const form = t.int(0, 3), x0 = t.pick([0.5, 1, 1.5, 2]);
    if (form === 0) {
      const n = t.int(2, 4), k = t.pick([-1, 2, 3]);
      const d = (n * x0 ** (n - 1) + k * x0 ** n) * Math.exp(k * x0);
      return num(`f(x) = x${sup(n)}·e^(${k}x). What is f′(${x0})? (to 3 decimal places)`, r4(d),
        `Product rule: f′(x) = ${n}x${sup(n - 1)}e^(${k}x) + ${k}x${sup(n)}e^(${k}x). At x = ${x0} that is ${r4(d)}.`, pyDeriv(`x**${n} * exp(${k}*x)`, x0));
    }
    if (form === 1) {
      const a = t.int(1, 3), b = t.int(0, 3), d = 2 * a * x0 * Math.cos(a * x0 * x0 + b);
      return num(`f(x) = sin(${a}x² + ${b}). What is f′(${x0})? (to 3 decimal places)`, r4(d),
        `Chain rule: f′(x) = cos(${a}x² + ${b}) · ${2 * a}x. At x = ${x0}: ${r4(d)}.`, pyDeriv(`sin(${a}*x**2 + ${b})`, x0), { tol: 0.002 });
    }
    if (form === 2) {
      const p = t.int(1, 5), q = t.int(-3, 3), d = (p * (x0 * x0 + 1) - (p * x0 + q) * 2 * x0) / (x0 * x0 + 1) ** 2;
      return num(`f(x) = (${p}x ${q < 0 ? '−' : '+'} ${Math.abs(q)}) / (x² + 1). What is f′(${x0})? (to 3 decimal places)`, r4(d),
        `Quotient rule: f′ = (${p}(x² + 1) − (${p}x ${q < 0 ? '−' : '+'} ${Math.abs(q)})·2x) / (x² + 1)². At x = ${x0}: ${r4(d)}.`, pyDeriv(`(${p}*x + ${q}) / (x**2 + 1)`, x0), { tol: 0.002 });
    }
    const c = t.int(1, 9), d = 2 * x0 / (x0 * x0 + c);
    return num(`f(x) = ln(x² + ${c}). What is f′(${x0})? (to 3 decimal places)`, r4(d),
      `Chain rule: f′(x) = 2x / (x² + ${c}). At x = ${x0}: ${r4(d)}.`, pyDeriv(`log(x**2 + ${c})`, x0), { tol: 0.002 });
  }),

  SKILL('calc.nth', 'Higher derivatives', 'Spot the pattern in repeated derivatives of sin, cos and e^(kx).', t => {
    const k = t.int(2, 3), n = t.int(3, 8), fn = t.pick(['sin', 'cos', 'exp']);
    const val = fn === 'exp' ? k ** n : Math.round(k ** n * (fn === 'sin' ? Math.sin(n * Math.PI / 2) : Math.cos(n * Math.PI / 2)));
    const name = fn === 'exp' ? `e^(${k}x)` : `${fn}(${k}x)`;
    return num(`f(x) = ${name}. What is f⁽${n}⁾(0), the ${n}th derivative at 0?`, val,
      fn === 'exp' ? `Each derivative multiplies by ${k}: f⁽${n}⁾(x) = ${k}${sup(n)}e^(${k}x), so f⁽${n}⁾(0) = ${val}.`
        : `Derivatives of ${fn} cycle every four with a factor of ${k} each time: f⁽${n}⁾(x) = ${k}${sup(n)}·${fn}(${k}x + ${n}π/2), so f⁽${n}⁾(0) = ${val}.`,
      pyCauchy(fn === 'exp' ? `cmath.exp(${k}*z)` : `cmath.${fn}(${k}*z)`, 0, n), { rtol: 0, tol: 0.5, dp: 0 });
  }),

  SKILL('calc.tangent', 'Tangent lines', 'The line touching a curve: its slope and where it crosses the y-axis.', t => {
    const a = t.int(1, 4), b = t.int(-6, 6), c = t.int(-5, 5), x0 = t.int(-2, 3);
    const m = 2 * a * x0 + b, y0 = a * x0 * x0 + b * x0 + c, B = y0 - m * x0, ask = t.pick(['m', 'b']);
    const curve = `y = ${a}x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x ${c < 0 ? '−' : '+'} ${Math.abs(c)}`;
    return num(`The tangent to ${curve} at x = ${x0} is y = mx + b. What is ${ask}?`, ask === 'm' ? m : B,
      `Slope m = y′(${x0}) = ${2 * a}·${x0} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${m}. The point is (${x0}, ${y0}), so b = ${y0} − ${m}·${x0} = ${B}.`,
      ask === 'm' ? pyDeriv(`${a}*x**2 + ${b}*x + ${c}`, x0) : `${pyDeriv(`${a}*x**2 + ${b}*x + ${c}`, x0).replace(/print\((.*)\)$/, 'm = $1')}\nprint(f(${x0}) - m*${x0})`,
      { rtol: 0, tol: 0.01, dp: 0 });
  }),

  SKILL('calc.linapprox', 'Linear approximation', 'Estimate a value with the tangent line: f(a) + f′(a)(x − a).', t => {
    const form = t.int(0, 2);
    if (form === 0) {
      const a = t.pick([4, 9, 16, 25, 36, 49, 64, 81, 100]), d = t.pick([-2, -1, 1, 2, 3]), x = a + d, L = Math.sqrt(a) + d / (2 * Math.sqrt(a));
      return num(`Use the linear approximation of √x at x = ${a} to estimate √${x}. (4 decimal places)`, r4(L),
        `L(x) = √${a} + (x − ${a})/(2√${a}) = ${Math.sqrt(a)} + ${d}/${2 * Math.sqrt(a)} = ${r4(L)}. (The true value is ${r4(Math.sqrt(x))}.)`,
        `${pyDeriv('sqrt(x)', a).replace(/print\((.*)\)$/, 'd = $1')}\nprint(f(${a}) + d*(${x}-${a}))`, { rtol: 0, tol: 0.0006 });
    }
    if (form === 1) {
      const h = t.pick([0.02, 0.05, 0.1, -0.05]), L = h;
      return num(`Use the linear approximation of ln(1 + x) at x = 0 to estimate ln(${1 + h}).`, L,
        `ln(1 + x) ≈ ln 1 + 1·x = x near 0, so ln(${1 + h}) ≈ ${h}. (True: ${r4(Math.log(1 + h))}.)`,
        `${pyDeriv('log(1+x)', 0).replace(/print\((.*)\)$/, 'd = $1')}\nprint(f(0) + d*${h})`, { rtol: 0, tol: 0.0006 });
    }
    const k = t.pick([3, 4, 5, 10]), h = t.pick([0.01, 0.02, 0.03]), L = 1 + k * h;
    return num(`Use the linear approximation of (1 + x)${sup(k)} at x = 0 to estimate ${(1 + h).toFixed(2)}${sup(k)}.`, r4(L),
      `(1 + x)^k ≈ 1 + kx near 0: 1 + ${k}·${h} = ${r4(L)}. (True: ${r4((1 + h) ** k)}.)`,
      `${pyDeriv(`(1+x)**${k}`, 0).replace(/print\((.*)\)$/, 'd = $1')}\nprint(f(0) + d*${h})`, { rtol: 0, tol: 0.0006 });
  }),

  SKILL('calc.optimize', 'Optimisation', 'Set up a quantity, differentiate, and find where it is smallest or largest.', t => {
    if (t.int(0, 1) === 0) {
      const A = t.pick([50, 72, 96, 128, 200]), top = t.pick([2, 3, 4]), side = t.pick([1, 2]);
      const w = Math.sqrt(A * side / top), h = A / w, W = w + 2 * side, H = h + 2 * top, ask = t.pick(['width', 'height']);
      return num(`A poster has ${A} in² of print, ${top}-inch margins at top and bottom and ${side}-inch margins at each side. What ${ask} of poster uses the least paper? (inches, 2 decimal places)`,
        r4(ask === 'width' ? W : H),
        `Print w × h with wh = ${A}. Paper P(w) = (w + ${2 * side})(${A}/w + ${2 * top}). P′(w) = ${2 * top} − ${2 * side * A}/w² = 0 gives w = √(${A}·${side}/${top}) = ${r4(w)}, h = ${r4(h)}. Poster: ${r4(W)} × ${r4(H)}.`,
        `P = lambda w: (w+${2 * side})*(${A}/w+${2 * top})\nlo, hi = 0.01, 100.0\nfor _ in range(300):\n    a, b = lo + (hi-lo)/3, hi - (hi-lo)/3\n    lo, hi = (lo, b) if P(a) < P(b) else (a, hi)\nw = (lo+hi)/2\nprint(${ask === 'width' ? `w+${2 * side}` : `${A}/w+${2 * top}`})`,
        { rtol: 0.002 });
    }
    const V = t.pick([32, 108, 256, 500]), x = Math.cbrt(2 * V), hgt = V / (x * x);
    return num(`An open-top box with a square base must hold ${V} cm³. What base side length uses the least material? (cm, 2 decimal places)`, r4(x),
      `Material S(x) = x² + 4x·(${V}/x²) = x² + ${4 * V}/x. S′(x) = 2x − ${4 * V}/x² = 0 gives x³ = ${2 * V}, x = ${r4(x)} (height ${r4(hgt)}).`,
      `S = lambda x: x*x + ${4 * V}/x\nlo, hi = 0.01, 100.0\nfor _ in range(300):\n    a, b = lo + (hi-lo)/3, hi - (hi-lo)/3\n    lo, hi = (lo, b) if S(a) < S(b) else (a, hi)\nprint((lo+hi)/2)`, { rtol: 0.002 });
  }),

  SKILL('calc.related', 'Related rates', 'Differentiate a relation in time to turn one rate into another.', t => {
    if (t.int(0, 1) === 0) {
      const L = t.pick([10, 13, 17, 25]), triples = { 10: [6, 8], 13: [5, 12], 17: [8, 15], 25: [7, 24] }[L];
      const [x, y] = t.pick([triples, [...triples].reverse()]), v = t.pick([1, 2, 3]), rate = x * v / y;
      return num(`A ${L} ft ladder leans on a wall. Its foot slides away at ${v} ft/s. How fast is the top sliding down when the foot is ${x} ft from the wall? (ft/s)`, r4(rate),
        `x² + y² = ${L * L}, so 2x·x′ + 2y·y′ = 0 and y′ = −x·x′/y = −${x}·${v}/${y}. The top falls at ${r4(rate)} ft/s.`,
        `${PY_HEAD}dt = 1e-6\ny = lambda x: sqrt(${L * L} - x*x)\nprint((y(${x}) - y(${x} + ${v}*dt)) / dt)`, { rtol: 0.002 });
    }
    // MIT 18.01SC final, problem 6: the plane and the car approach each other along the road.
    const D = 1.5, g = Math.sqrt(D * D - 1), vp = t.pick([100, 120]), r = t.pick([136, 150, 160]), vc = r * D / g - vp;
    return num(`A patrol plane flies 1 mile above a straight road at ${vp} mph toward an oncoming car. The straight-line distance between them is ${D} miles and shrinking at ${r} mph. How fast is the car going? (mph, 1 decimal place)`, Math.round(vc * 10) / 10,
      `Ground gap g = √(${D}² − 1) = ${r4(g)}. D² = g² + 1, so D·D′ = g·g′ and g′ = ${D}·(−${r})/${r4(g)} = −${r4(r * D / g)} mph. The gap closes at the sum of the two speeds, so the car does ${r4(r * D / g)} − ${vp} = ${Math.round(vc * 10) / 10} mph.`,
      `from math import *\nD, vp, r = ${D}, ${vp}, ${r}\ng = sqrt(D*D - 1)\ndef rate(vc, dt=1e-7):\n    return (sqrt((g - (vp + vc)*dt)**2 + 1) - D) / dt\nlo, hi = 0.0, 1000.0\nfor _ in range(200):\n    mid = (lo + hi) / 2\n    lo, hi = (mid, hi) if rate(mid) > -r else (lo, mid)\nprint(lo)`, { rtol: 0.002, dp: 1 });
  }),

  SKILL('calc.integral', 'Definite integrals', 'Antiderivatives — including by parts and substitution — evaluated between limits.', t => {
    const form = t.int(0, 3);
    if (form === 0) {
      const a = t.int(0, 1), b = t.int(2, 3), c = t.int(1, 4), d = t.int(-3, 3), e = t.int(-4, 4);
      const F = x => c * x ** 3 / 3 + d * x * x / 2 + e * x, v = F(b) - F(a);
      return num(`Compute ∫ from ${a} to ${b} of (${c}x² ${d < 0 ? '−' : '+'} ${Math.abs(d)}x ${e < 0 ? '−' : '+'} ${Math.abs(e)}) dx. (4 decimal places)`, r4(v),
        `Antiderivative ${c}x³/3 ${d < 0 ? '−' : '+'} ${Math.abs(d)}x²/2 ${e < 0 ? '−' : '+'} ${Math.abs(e)}x, evaluated: ${r4(F(b))} − ${r4(F(a))} = ${r4(v)}.`,
        pySimpson(`${c}*x**2 + ${d}*x + ${e}`, a, b), { rtol: 0, tol: 0.001 });
    }
    if (form === 1) {
      const b = t.pick([2, 3, Math.E]), v = b * b * Math.log(b) / 2 - b * b / 4 + 1 / 4, bs = b === Math.E ? 'e' : b;
      return num(`Compute ∫ from 1 to ${bs} of x·ln x dx. (4 decimal places)`, r4(v),
        `By parts with u = ln x, dv = x dx: x²ln x/2 − x²/4. From 1 to ${bs}: ${r4(v)}.`, pySimpson('x*log(x)', 1, b), { rtol: 0, tol: 0.001 });
    }
    if (form === 2) {
      const k = t.pick([1, 2, 3]), v = (1 - Math.exp(-k)) / k;
      return num(`Compute ∫ from 0 to 1 of e^(−${k}x) dx. (4 decimal places)`, r4(v),
        `Antiderivative −e^(−${k}x)/${k}: (1 − e^(−${k}))/${k} = ${r4(v)}.`, pySimpson(`exp(-${k}*x)`, 0, 1), { rtol: 0, tol: 0.001 });
    }
    const v = 1; // ∫0^{π/4} tan x sec² x dx = tan²/2 → 1/2; vary with multiplier
    const m = t.int(1, 4);
    return num(`Compute ∫ from 0 to π/4 of ${m === 1 ? '' : `${m}·`}tan x·sec²x dx.`, m * 0.5 * v,
      `Substitute u = tan x, du = sec²x dx: ∫ from 0 to 1 of ${m}u du = ${m}/2.`, pySimpson(`${m}*tan(x)/cos(x)**2`, 0, 'pi/4'), { rtol: 0, tol: 0.001 });
  }),

  SKILL('calc.ftc', 'The fundamental theorem', 'Differentiate an integral whose limit moves: d/dx ∫ f(t) dt.', t => {
    const x0 = t.pick([1, 1.5, 2]), fn = t.pick([['sin(t)', 'sin t', Math.sin], ['exp(-t)', 'e^(−t)', z => Math.exp(-z)], ['1/(1+t)', '1/(1 + t)', z => 1 / (1 + z)]]);
    const ans = fn[2](x0 * x0) * 2 * x0;
    return num(`F(x) = ∫ from 1 to x² of ${fn[1]} dt. What is F′(${x0})? (3 decimal places)`, r4(ans),
      `FTC with the chain rule: F′(x) = f(x²)·2x, so F′(${x0}) = f(${x0 * x0})·${2 * x0} = ${r4(ans)}.`,
      `${PY_HEAD}g = lambda t: ${fn[0]}\ndef F(x, n=4000):\n    a, b = 1, x*x\n    h = (b-a)/n\n    return h/3*(g(a)+g(b)+sum((4 if i%2 else 2)*g(a+i*h) for i in range(1,n)))\nh = 1e-4\nprint((F(${x0}+h) - F(${x0}-h)) / (2*h))`, { rtol: 0.003 });
  }),

  SKILL('calc.trapezoid', 'The trapezoid rule', 'Estimate an integral with n trapezoids, as MIT\'s final exam does with a table.', t => {
    const n = t.pick([2, 4]), a = 1, b = t.pick([3, 5]), fn = t.pick([['x*x', 'x²', x => x * x], ['1/x', '1/x', x => 1 / x], ['sqrt(x)', '√x', Math.sqrt]]);
    const h = (b - a) / n, ys = Array.from({ length: n + 1 }, (_, i) => fn[2](a + i * h));
    const T = h * (ys[0] / 2 + ys.slice(1, -1).reduce((s, y) => s + y, 0) + ys[n] / 2);
    return num(`Estimate ∫ from ${a} to ${b} of ${fn[1]} dx with the trapezoid rule and ${n} equal trapezoids. (4 decimal places)`, r4(T),
      `Width h = ${h}. T = h·(f₀/2 + f₁ + … + f${n - 1 > 0 ? '₍ₙ₋₁₎' : ''} + fₙ/2) = ${r4(T)}. (Exact: ${r4(fn[0] === 'x*x' ? (b ** 3 - 1) / 3 : fn[0] === '1/x' ? Math.log(b) : (2 / 3) * (b ** 1.5 - 1))}.)`,
      `${PY_HEAD}f = lambda x: ${fn[0]}\nn, a, b = ${n}, ${a}, ${b}\nh = (b-a)/n\nleft = sum(f(a+i*h) for i in range(n))*h\nright = sum(f(a+(i+1)*h) for i in range(n))*h\nprint((left+right)/2)`, { rtol: 0, tol: 0.0006 });
  }),

  SKILL('calc.taylor', 'Taylor polynomials', 'Approximate a function by its Taylor polynomial about 0.', t => {
    const fn = t.pick(['exp', 'sin', 'cos', 'log1p']), n = t.pick([2, 3, 4]), x = t.pick([0.1, 0.2, 0.5]);
    const coef = k => fn === 'exp' ? 1 / fact(k) : fn === 'sin' ? (k % 2 ? (-1) ** ((k - 1) / 2) / fact(k) : 0)
      : fn === 'cos' ? (k % 2 ? 0 : (-1) ** (k / 2) / fact(k)) : (k === 0 ? 0 : (-1) ** (k + 1) / k);
    const P = Array.from({ length: n + 1 }, (_, k) => coef(k) * x ** k).reduce((s, v) => s + v, 0);
    const name = { exp: 'eˣ', sin: 'sin x', cos: 'cos x', log1p: 'ln(1 + x)' }[fn];
    return num(`Evaluate the degree-${n} Taylor polynomial of ${name} about 0 at x = ${x}. (6 decimal places)`, Math.round(P * 1e6) / 1e6,
      `The coefficients are f⁽ᵏ⁾(0)/k!: ${Array.from({ length: n + 1 }, (_, k) => r4(coef(k))).join(', ')}. Summed at x = ${x}: ${Math.round(P * 1e6) / 1e6}.`,
      `${PY_HEAD}import cmath\nf = lambda z: ${fn === 'log1p' ? 'cmath.log(1+z)' : `cmath.${fn}(z)`}\nN, r = 256, 0.5\ndef c(k):\n    s = sum(f(r*cmath.exp(2j*pi*j/N)) * cmath.exp(-2j*pi*j*k/N) for j in range(N))\n    return (s / (N * r**k)).real\nprint(sum(c(k) * ${x}**k for k in range(${n + 1})))`, { rtol: 0, tol: 2e-6, dp: 6 });
  }),

  SKILL('calc.limit', 'Limits', 'Riemann sums as integrals, and limits by L\'Hôpital\'s rule.', t => {
    if (t.int(0, 1) === 0) {
      const p = t.pick([1, 2, 3]), c = t.int(1, 3), v = c / (p + 1);
      return num(`What is the limit as n → ∞ of (1/n)·Σ from i = 1 to n of ${c}(i/n)${sup(p)}?`, r4(v),
        `It is a Riemann sum for ∫ from 0 to 1 of ${c}x${sup(p)} dx = ${c}/${p + 1} = ${r4(v)}.`,
        `n = 200000\nprint(sum(${c}*(i/n)**${p} for i in range(1, n+1)) / n)`, { rtol: 0, tol: 0.0006 });
    }
    const k = t.pick([2, 3, 5]), m = t.pick([1, 2, 4]), v = k / m;
    return num(`What is the limit as x → 0 of sin(${k}x) / (${m}x)?`, r4(v),
      `Both go to 0; by L'Hôpital, ${k}cos(${k}x)/${m} → ${k}/${m} = ${r4(v)}.`, `${PY_HEAD}x = 1e-7\nprint(sin(${k}*x)/(${m}*x))`, { rtol: 0, tol: 0.0006 });
  }),
];

function fact(n) { let p = 1; for (let i = 2; i <= n; i++) p *= i; return p; }
