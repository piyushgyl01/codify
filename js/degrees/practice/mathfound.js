/**
 * Mathematics, first year: the parts of Calculus I, Proofs, Linear Algebra I
 * and Mathematical Programming that the existing practice did not reach —
 * series and improper integrals, the mean value theorem, relations and
 * counting functions, orthogonal projection, floating-point behaviour and
 * Newton's method. QAA MSOR 3.8, 3.14, 3.16.
 *
 * Checks never reuse the generator's formula: partial sums and numerical
 * integration on a log scale, bisection, brute force over every pair or every
 * function, golden-section minimisation, and Python's own floats.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0.0001, dp: 4, explain, python, ...extra });
const PY = JSON.stringify;
const r4 = x => Math.round(x * 10000) / 10000;
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const frac = (p, q) => { const g = gcd(p, q); return q / g === 1 ? `${p / g}` : `${p / g}/${q / g}`; };

export const MATHFOUND = [
  SKILL('m.series', 'Series', 'Sum a convergent series, or find a power series\' radius of convergence.', t => {
    const form = t.pick(['geometric', 'telescoping', 'radius']);
    if (form === 'geometric') {
      const a = t.int(1, 6), p = t.int(1, 4), q = t.pick([5, 6, 7, 8]) * t.pick([1, -1]), r = p / q;
      return num(`What is the sum of Σ_{n=0}^∞ ${a}·(${q < 0 ? '−' : ''}${frac(p, Math.abs(q))})ⁿ? (4 decimal places)`, r4(a / (1 - r)),
        `Geometric with ratio r = ${q < 0 ? '−' : ''}${frac(p, Math.abs(q))}, |r| < 1, so the sum is a/(1 − r) = ${a}/(1 − (${r4(r)})) = ${r4(a / (1 - r))}.`,
        `a, r = ${a}, ${p} / ${q}\nprint(sum(a * r ** n for n in range(3000)))`);
    }
    if (form === 'telescoping') {
      const k = t.int(1, 4); let h = 0; for (let i = 1; i <= k; i++) h += 1 / i;
      return num(`What is Σ_{n=1}^∞ 1/(n(n + ${k}))? (4 decimal places)`, r4(h / k),
        `Partial fractions: 1/(n(n+${k})) = (1/${k})(1/n − 1/(n+${k})). The sum telescopes to (1/${k})(1 + … + 1/${k}) = ${r4(h / k)}.`,
        `N = 2_000_000\ns = sum(1 / (n * (n + ${k})) for n in range(1, N))\n# the tail beyond N is below ${k}/N\nprint(s + ${k} / N)`, { tol: 0.0002 });
    }
    const c = t.int(2, 9), pw = t.int(0, 3);
    return num(`What is the radius of convergence of Σ_{n=1}^∞ ${pw ? `n${pw > 1 ? `^${pw}` : ''}·` : ''}xⁿ / ${c}ⁿ?`, c,
      `Ratio test: |a_{n+1}/a_n| → |x|/${c}, so the series converges for |x| < ${c}. ${pw ? `The factor n${pw > 1 ? `^${pw}` : ''} does not change the radius.` : ''}`,
      `import math\n# the root test, numerically: |a_n|^(-1/n) at large n\nn = 10 ** 6\nprint(round(1 / math.exp((${pw} * math.log(n) - n * math.log(${c})) / n), 3))`, { tol: 0.01, dp: 2 });
  }),

  SKILL('m.improper', 'Improper integrals', '∫ x^(−p) converges at infinity only when p > 1, and near zero only when p < 1.', t => {
    const p = t.pick([0.5, 1, 1.5, 2, 3, 4]), atInf = t.rng() < 0.6;
    const conv = atInf ? p > 1 : p < 1, val = conv ? (atInf ? 1 / (p - 1) : 1 / (1 - p)) : -1;
    return num(`Evaluate ${atInf ? '∫₁^∞' : '∫₀¹'} x^(−${p}) dx. Answer −1 if it diverges. (4 decimal places)`, r4(val),
      conv ? `The antiderivative x^(1−${p})/(1−${p}) has a finite limit ${atInf ? 'as x → ∞' : 'as x → 0⁺'}: the value is ${r4(val)}.` : `With p = ${p} the antiderivative grows without bound ${atInf ? 'as x → ∞' : 'as x → 0⁺'} (p = 1 gives ln x), so it diverges.`,
      `import math\n# substitute x = e^u and integrate e^((1 - p)u) over a long u-interval, twice\np, at_inf = ${p}, ${atInf ? 'True' : 'False'}\ndef I(U, n=200000):\n    h = U / n\n    f = (lambda u: math.exp((1 - p) * u)) if at_inf else (lambda u: math.exp(-(1 - p) * u))\n    return h * sum(f((i + 0.5) * h) for i in range(n))\na, b = I(40), I(80)\nprint(b if abs(b - a) < 1e-6 else -1)`);
  }),

  SKILL('m.mvt', 'The mean value theorem', 'Somewhere inside, the instantaneous rate equals the average rate.', t => {
    const a = t.int(0, 3), b = a + t.int(1, 4), k = t.pick([1, 2, 3]);
    const c = Math.sqrt((a * a + a * b + b * b) / 3);
    return num(`f(x) = ${k === 1 ? '' : k}x³ on [${a}, ${b}]. Find the c in (${a}, ${b}) with f′(c) = (f(${b}) − f(${a}))/(${b} − ${a}). (4 decimal places)`, r4(c),
      `Average rate = ${k}(${b}³ − ${a}³)/(${b} − ${a}) = ${k}(${a * a + a * b + b * b}). Setting ${3 * k}c² equal to it gives c = √(${a * a + a * b + b * b}/3) = ${r4(c)}, which lies in (${a}, ${b}) as the theorem promises.`,
      `f = lambda x: ${k} * x ** 3\nfp = lambda x: 3 * ${k} * x ** 2\nslope = (f(${b}) - f(${a})) / (${b} - ${a})\nlo, hi = ${a}, ${b}\nfor _ in range(200):\n    m = (lo + hi) / 2\n    if fp(m) < slope: lo = m\n    else: hi = m\nprint(lo)`);
  }),

  SKILL('m.relation', 'Relations', 'Reflexive, symmetric, transitive — and an equivalence relation when all three hold.', t => {
    const n = t.int(3, 4), S = Array.from({ length: n }, (_, i) => i + 1);
    let R = new Set(); const add = (a, b) => R.add(`${a},${b}`);
    if (t.rng() < 0.4) { const cls = S.map(() => t.int(0, 1)); for (const a of S) for (const b of S) if (cls[a - 1] === cls[b - 1]) add(a, b); }
    else for (const a of S) for (const b of S) if (t.rng() < 0.45) add(a, b);
    const has = (a, b) => R.has(`${a},${b}`);
    const refl = S.every(a => has(a, a)), sym = S.every(a => S.every(b => !has(a, b) || has(b, a)));
    const trans = S.every(a => S.every(b => S.every(c => !(has(a, b) && has(b, c)) || has(a, c))));
    const props = [refl && 'reflexive', sym && 'symmetric', trans && 'transitive'].filter(Boolean);
    const right = props.length ? props.join(', ') : 'none of them';
    const opts = ['reflexive, symmetric, transitive', 'reflexive, symmetric', 'reflexive, transitive', 'symmetric, transitive', 'reflexive', 'symmetric', 'transitive', 'none of them'];
    const pairs = [...R].map(p => `(${p})`).join(', ') || '∅';
    return { kind: 'mc', q: `On {${S.join(', ')}}, R = {${pairs}}. Which of reflexive, symmetric and transitive does R have?`,
      options: [right, ...t.pickN(opts.filter(o => o !== right), 3)], correct: 0,
      explain: `${refl ? 'Every (a, a) is present' : 'Some (a, a) is missing'}; ${sym ? 'every pair has its reverse' : 'some pair lacks its reverse'}; ${trans ? 'every chain (a,b),(b,c) is closed by (a,c)' : 'some chain (a,b),(b,c) lacks (a,c)'}.${props.length === 3 ? ' So it is an equivalence relation.' : ''}`,
      python: `S, R = ${PY(S)}, {tuple(map(int, p.split(','))) for p in ${PY([...R])}}\nprops = []\nif all((a, a) in R for a in S): props.append('reflexive')\nif all((b, a) in R for (a, b) in R): props.append('symmetric')\nif all((a, d) in R for (a, b) in R for (c, d) in R if b == c): props.append('transitive')\nprint(', '.join(props) or 'none of them')` };
  }),

  SKILL('m.functions', 'Counting functions', 'How many functions, injections and surjections run from an m-set to an n-set.', t => {
    const m = t.int(2, 5), n = t.int(2, 4), kind = t.pick(['functions', 'injective functions', 'surjective functions']);
    const fact = k => (k <= 1 ? 1 : k * fact(k - 1)), C = (a, b) => fact(a) / (fact(b) * fact(a - b));
    const val = kind === 'functions' ? n ** m : kind === 'injective functions' ? (m > n ? 0 : fact(n) / fact(n - m))
      : Array.from({ length: n + 1 }, (_, k) => (-1) ** k * C(n, k) * (n - k) ** m).reduce((s, x) => s + x, 0);
    return num(`How many ${kind} are there from a ${m}-element set to a ${n}-element set?`, val,
      kind === 'functions' ? `Each of the ${m} inputs has ${n} choices: ${n}^${m} = ${val}.` : kind === 'injective functions' ? (m > n ? 'More inputs than outputs: by pigeonhole, none.' : `Choose distinct images in order: ${n}·${n - 1}·… (${m} factors) = ${val}.`)
        : `Inclusion–exclusion over the outputs that are missed: Σ (−1)ᵏ C(${n},k)(${n}−k)^${m} = ${val}.`,
      `from itertools import product\nfs = list(product(range(${n}), repeat=${m}))\nk = ${PY(kind)}\nprint(len(fs) if k == 'functions' else sum(1 for f in fs if len(set(f)) == ${m}) if k.startswith('inj') else sum(1 for f in fs if len(set(f)) == ${n}))`, { tol: 0, dp: 0 });
  }),

  SKILL('m.proj', 'Orthogonal projection', 'The projection of b onto the line through a is (a·b / a·a) a — the closest point on that line.', t => {
    const a = [t.int(-3, 3) || 1, t.int(-3, 3), t.int(-3, 3)], b = [t.int(-4, 4), t.int(-4, 4), t.int(-4, 4)], i = t.int(0, 2);
    const ab = a.reduce((s, x, k) => s + x * b[k], 0), aa = a.reduce((s, x) => s + x * x, 0), p = a.map(x => (ab / aa) * x);
    return num(`Project b = (${b.join(', ')}) onto the line spanned by a = (${a.join(', ')}). What is component ${i + 1} of the projection? (4 decimal places)`, r4(p[i]),
      `p = (a·b / a·a) a = (${ab}/${aa}) a, so component ${i + 1} is ${r4(p[i])}. The residual b − p is orthogonal to a.`,
      `a, b = ${PY(a)}, ${PY(b)}\n# the closest point t·a to b, by golden-section search on the distance\nd = lambda t: sum((t * x - y) ** 2 for x, y in zip(a, b))\nlo, hi, g = -50.0, 50.0, (5 ** 0.5 - 1) / 2\nfor _ in range(200):\n    c1, c2 = hi - g * (hi - lo), lo + g * (hi - lo)\n    if d(c1) < d(c2): hi = c2\n    else: lo = c1\nprint((lo + hi) / 2 * a[${i}])`);
  }),

  SKILL('m.float', 'Floating-point arithmetic', 'Doubles carry 53 bits: some decimals are not exact, big plus small can lose the small, and subtraction can cancel.', t => {
    const cases = [
      ['0.1 + 0.2 == 0.3', 'False', 'Neither 0.1 nor 0.2 is exact in binary; their rounded sum is 0.30000000000000004.'],
      ['(1e16 + 1) - 1e16', '0.0', 'Above 2^53 the spacing between doubles is 2, so 1e16 + 1 rounds back to 1e16.'],
      ['(1e15 + 1) - 1e15', '1.0', 'Below 2^53 ≈ 9.007e15, integers are exact.'],
      ['1 + 2**-53 == 1', 'True', 'Machine epsilon is 2^−52; adding half of it rounds back to 1 (ties to even).'],
      ['1 + 2**-52 == 1', 'False', '2^−52 is exactly the gap between 1 and the next double.'],
      ['sum([0.1] * 10) == 1.0', 'False', 'Each addition rounds; the errors accumulate to 0.9999999999999999.'],
      ['0.5 + 0.25 == 0.75', 'True', 'Powers of two are exact in binary.'],
      ['float(2**53 + 1) == float(2**53)', 'True', '2^53 + 1 is the first integer a double cannot hold; it rounds to 2^53.'],
    ];
    const [expr, ans, why] = t.pick(cases);
    const opts = ans === 'True' || ans === 'False' ? ['True', 'False'] : ['0.0', '1.0', '2.0'];
    return { kind: 'mc', q: `In Python (IEEE-754 doubles), what does ${expr} give?`, options: [ans, ...opts.filter(o => o !== ans)], correct: 0,
      explain: why, python: `print(${expr})` };
  }),

  SKILL('m.newton', "Newton's method", 'x ← x − f(x)/f′(x): quadratic convergence near a simple root.', t => {
    const a = t.pick([2, 3, 5, 7, 10]), x0 = t.pick([1, 2, 3]), k = t.int(1, 4);
    let x = x0; for (let i = 0; i < k; i++) x -= (x * x - a) / (2 * x);
    return num(`Apply Newton's method to f(x) = x² − ${a} from x₀ = ${x0}. What is x_${k}? (6 decimal places)`, Math.round(x * 1e6) / 1e6,
      `Each step is x ← (x + ${a}/x)/2 — the Babylonian square root. After ${k} step${k > 1 ? 's' : ''}: ${x.toFixed(6)}, against √${a} = ${Math.sqrt(a).toFixed(6)}. The number of correct digits roughly doubles each step.`,
      `from fractions import Fraction as F\nx = F(${x0})\nfor _ in range(${k}):\n    x = x - (x * x - ${a}) / (2 * x)\nprint(float(x))`, { tol: 1e-6, dp: 6 });
  }),
];
