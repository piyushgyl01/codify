/**
 * Physics: measurement and chemistry. Uncertainty propagation, weighted
 * means, weighted least-squares slopes, how many trials a precision needs,
 * quantisation noise (8.01X, AAPT Data Analysis and Visualization); molar
 * masses and stoichiometry, pH with a weak acid, hydrogen spectra, Gibbs
 * energy, first-order kinetics and calorimetry (5.111SC).
 *
 * Checks: Monte Carlo propagation, χ² minimised numerically, counting
 * trials, sampled quantisation error, a formula parser for molar masses,
 * charge balance solved by bisection, energy levels from physical constants,
 * a temperature scan, a numerically integrated rate law, and simulated heat
 * exchange.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0.01, dp: 2, explain, python, ...extra });
const PY = JSON.stringify;
const r2 = x => Math.round(x * 100) / 100;
const r4 = x => Math.round(x * 10000) / 10000;

const MASS = { H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.990, Cl: 35.45, S: 32.06, Ca: 40.078, Fe: 55.845, Mg: 24.305 };
const molar = f => { let m = 0; for (const [, el, n] of f.matchAll(/([A-Z][a-z]?)(\d*)/g)) m += MASS[el] * (n ? +n : 1); return m; };

export const PHYSLAB = [
  SKILL('lab.propagate', 'Propagating uncertainty', 'For a product of powers, relative uncertainties add in quadrature, weighted by the powers.', t => {
    const L = t.pick([0.5, 0.75, 1.0, 1.2]), sL = t.pick([0.001, 0.002, 0.005]), T = 2 * Math.PI * Math.sqrt(L / 9.81), sT = t.pick([0.005, 0.01, 0.02]);
    const g = (4 * Math.PI ** 2 * L) / T ** 2, sg = g * Math.sqrt((sL / L) ** 2 + ((2 * sT) / T) ** 2);
    return num(`A pendulum of length ${L} ± ${sL} m has period ${r4(T)} ± ${sT} s. With g = 4π²L/T², what is the uncertainty in g, in m/s²? (3 decimal places)`, Math.round(sg * 1000) / 1000,
      `σ_g/g = √((σ_L/L)² + (2σ_T/T)²) = ${r4(sg / g)}; g = ${r4(g)}, so σ_g = ${Math.round(sg * 1000) / 1000} m/s². The period dominates because it is squared.`,
      `import random, math, statistics\nrandom.seed(2)\nL, sL, T, sT = ${L}, ${sL}, ${T}, ${sT}\ngs = [4 * math.pi ** 2 * random.gauss(L, sL) / random.gauss(T, sT) ** 2 for _ in range(200000)]\nprint(statistics.stdev(gs))`, { tol: 0.004, dp: 3 });
  }),

  SKILL('lab.weighted', 'Weighted means', 'Combine measurements by weighting each with 1/σ²; the result is more precise than any one of them.', t => {
    const n = t.int(2, 4), xs = Array.from({ length: n }, () => r2(9.7 + t.int(0, 20) / 100)), ss = Array.from({ length: n }, () => t.pick([0.02, 0.05, 0.1]));
    const w = ss.map(s => 1 / (s * s)), mean = xs.reduce((a, x, i) => a + w[i] * x, 0) / w.reduce((a, b) => a + b, 0), se = 1 / Math.sqrt(w.reduce((a, b) => a + b, 0));
    const ask = t.pick(['mean', 'se']);
    return num(`Measurements of g: ${xs.map((x, i) => `${x} ± ${ss[i]}`).join(', ')} m/s². What is the ${ask === 'mean' ? 'weighted mean' : 'uncertainty of the weighted mean'}? (4 decimal places)`, r4(ask === 'mean' ? mean : se),
      `Weights 1/σ²: ${w.map(r2).join(', ')}. Mean = Σwx/Σw = ${r4(mean)}; uncertainty 1/√Σw = ${r4(se)} m/s².`,
      `import math\nxs, ss = ${PY(xs)}, ${PY(ss)}\nchi2 = lambda m: sum(((x - m) / s) ** 2 for x, s in zip(xs, ss))\n# minimise chi-square, then find where it rises by 1 (the 1-sigma interval)\nlo, hi = min(xs) - 1, max(xs) + 1\nfor _ in range(200):\n    a, b = lo + (hi - lo) / 3, hi - (hi - lo) / 3\n    if chi2(a) < chi2(b): hi = b\n    else: lo = a\nm = (lo + hi) / 2\nc0 = chi2(m)\nu, v = m, m + 10\nfor _ in range(200):\n    mid = (u + v) / 2\n    if chi2(mid) - c0 < 1: u = mid\n    else: v = mid\nprint(${ask === 'mean' ? 'm' : 'u - m'})`, { tol: 0.0002, dp: 4 });
  }),

  SKILL('lab.fit', 'Weighted least-squares fits', 'Fit y = a + bx by minimising χ² = Σ((y − a − bx)/σ)².', t => {
    const xs = [1, 2, 3, 4, 5], a = t.int(-2, 3), b = t.pick([0.5, 1.5, 2, 3]), ys = xs.map(x => r2(a + b * x + (t.int(-10, 10) / 20))), ss = xs.map(() => t.pick([0.1, 0.2, 0.3]));
    const w = ss.map(s => 1 / (s * s)), S = w.reduce((p, q) => p + q, 0), Sx = w.reduce((p, wi, i) => p + wi * xs[i], 0), Sy = w.reduce((p, wi, i) => p + wi * ys[i], 0);
    const Sxx = w.reduce((p, wi, i) => p + wi * xs[i] ** 2, 0), Sxy = w.reduce((p, wi, i) => p + wi * xs[i] * ys[i], 0), D = S * Sxx - Sx * Sx;
    const slope = (S * Sxy - Sx * Sy) / D;
    return num(`Data (x, y ± σ): ${xs.map((x, i) => `(${x}, ${ys[i]} ± ${ss[i]})`).join(', ')}. What is the weighted least-squares slope? (4 decimal places)`, r4(slope),
      `Normal equations with weights 1/σ²: b = (SΣwxy − ΣwxΣwy)/(SΣwx² − (Σwx)²) = ${r4(slope)}.`,
      `xs, ys, ss = ${PY(xs)}, ${PY(ys)}, ${PY(ss)}\nchi2 = lambda a, b: sum(((y - a - b * x) / s) ** 2 for x, y, s in zip(xs, ys, ss))\n# coordinate descent on chi-square (it is convex), each step a ternary search\na, b = 0.0, 0.0\ndef best(f, lo, hi):\n    for _ in range(100):\n        m1, m2 = lo + (hi - lo) / 3, hi - (hi - lo) / 3\n        if f(m1) < f(m2): hi = m2\n        else: lo = m1\n    return (lo + hi) / 2\nfor _ in range(300):\n    a = best(lambda u: chi2(u, b), -50, 50); b = best(lambda u: chi2(a, u), -50, 50)\nprint(b)`, { tol: 0.0005, dp: 4 });
  }),

  SKILL('lab.trials', 'How many trials?', 'The standard error falls like 1/√n: halving the uncertainty takes four times the data.', t => {
    const s = t.pick([0.02, 0.05, 0.1, 0.3]), u = t.pick([0.005, 0.01, 0.02]);
    const n = Math.ceil((s / u) ** 2 - 1e-9);
    return num(`Single timing measurements scatter with standard deviation ${s} s. How many repeats do you need for the standard error of the mean to be at most ${u} s?`, n,
      `σ/√n ≤ ${u} ⇒ n ≥ (${s}/${u})² = ${r2((s / u) ** 2)}: n = ${n}.`,
      `import math\nprint(next(n for n in range(1, 10 ** 6) if ${s} / math.sqrt(n) <= ${u} + 1e-12))`, { tol: 0, dp: 0 });
  }),

  SKILL('lab.adc', 'Quantisation noise', 'An ideal ADC with step Δ adds noise of Δ/√12 rms.', t => {
    const bits = t.pick([8, 10, 12, 16]), range = t.pick([3.3, 5, 10]), ask = t.pick(['lsb', 'rms']);
    const lsb = range / 2 ** bits, rms = lsb / Math.sqrt(12);
    return num(`A ${bits}-bit ADC spans 0–${range} V. What is ${ask === 'lsb' ? 'its step size (one LSB), in millivolts' : 'the rms quantisation noise, in millivolts'}? (4 decimal places)`, r4((ask === 'lsb' ? lsb : rms) * 1000),
      `LSB = ${range}/2^${bits} = ${r4(lsb * 1000)} mV; rounding error is uniform on ±LSB/2, so its rms is LSB/√12 = ${r4(rms * 1000)} mV.`,
      `import random, math\nrandom.seed(3)\nstep = ${range} / 2 ** ${bits}\nerrs = [v - round(v / step) * step for v in (random.uniform(0, ${range}) for _ in range(400000))]\n${ask === 'lsb' ? 'print(step * 1000)' : 'print(math.sqrt(sum(e * e for e in errs) / len(errs)) * 1000)'}`, { tol: ask === 'lsb' ? 0.0001 : 0.003 * rms * 1000 + 0.0001, dp: 4 });
  }),

  SKILL('ch.stoich', 'Stoichiometry', 'Convert grams to moles with molar masses, use the balanced equation\'s ratio, and convert back.', t => {
    const rxns = [['CH4 + 2 O2 → CO2 + 2 H2O', 'CH4', 1, 'CO2', 1], ['2 H2 + O2 → 2 H2O', 'H2', 2, 'H2O', 2], ['CaCO3 → CaO + CO2', 'CaCO3', 1, 'CO2', 1], ['2 Na + Cl2 → 2 NaCl', 'Na', 2, 'NaCl', 2], ['C3H8 + 5 O2 → 3 CO2 + 4 H2O', 'C3H8', 1, 'H2O', 4], ['2 Mg + O2 → 2 MgO', 'Mg', 2, 'MgO', 2]];
    const [eq, A, a, B, b] = t.pick(rxns), grams = t.int(5, 100);
    const v = (grams / molar(A)) * (b / a) * molar(B);
    return num(`${eq}. How many grams of ${B} form from ${grams} g of ${A}, if it all reacts? (2 decimal places; H 1.008, C 12.011, N 14.007, O 15.999, Na 22.990, Mg 24.305, Ca 40.078, Cl 35.45)`, r2(v),
      `Moles of ${A}: ${grams}/${r2(molar(A))} = ${r4(grams / molar(A))}. Ratio ${b}:${a} gives ${r4((grams / molar(A)) * (b / a))} mol of ${B}, × ${r2(molar(B))} g/mol = ${r2(v)} g.`,
      `import re\nM = ${PY(MASS)}\ndef molar(f):\n    total, i = 0.0, 0\n    while i < len(f):\n        el = f[i] + (f[i + 1] if i + 1 < len(f) and f[i + 1].islower() else '')\n        i += len(el); n = ''\n        while i < len(f) and f[i].isdigit(): n += f[i]; i += 1\n        total += M[el] * (int(n) if n else 1)\n    return total\nprint(${grams} / molar(${PY(A)}) * ${b} / ${a} * molar(${PY(B)}))`);
  }),

  SKILL('ch.ph', 'pH of acids', 'A weak acid only partly dissociates: [H⁺] solves x²/(C − x) = Ka.', t => {
    const strong = t.rng() < 0.3, C = t.pick([0.1, 0.05, 0.01, 0.001]), Ka = t.pick([1.8e-5, 6.3e-5, 4.5e-4, 1.3e-3]);
    const H = strong ? C : (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C)) / 2, pH = -Math.log10(H);
    return num(strong ? `What is the pH of ${C} M hydrochloric acid (a strong acid)? (2 decimal places)` : `A weak acid with Ka = ${Ka} is dissolved at ${C} M. What is the pH? (2 decimal places)`, r2(pH),
      strong ? `It dissociates fully: [H⁺] = ${C}, pH = −log ${C} = ${r2(pH)}.` : `Solve x²/(${C} − x) = ${Ka}: x = [H⁺] = ${H.toExponential(3)} M, pH = ${r2(pH)}. (The approximation x ≈ √(KaC) is fine only when x ≪ C.)`,
      `import math\nC, Ka, Kw = ${C}, ${strong ? 'float("inf")' : Ka}, 1e-14\n# charge balance [H+] = [A-] + [OH-], solved by bisection on log[H+]\ndef excess(h):\n    a = C if Ka == float('inf') else C * Ka / (Ka + h)\n    return h - a - Kw / h\nlo, hi = -14.0, 0.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    if excess(10 ** m) > 0: hi = m\n    else: lo = m\nprint(-(lo + hi) / 2)`);
  }),

  SKILL('ch.hydrogen', 'Hydrogen spectra', 'Transitions in hydrogen emit at 1/λ = R(1/n₁² − 1/n₂²).', t => {
    const n1 = t.pick([1, 2, 3]), n2 = n1 + t.int(1, 4);
    const R = 1.0973731568e7, lam = 1 / (R * (1 / n1 ** 2 - 1 / n2 ** 2)) * 1e9;
    return num(`What wavelength, in nanometres, does hydrogen emit when its electron falls from n = ${n2} to n = ${n1}? (1 decimal place; use the Rydberg constant 1.0973731568 × 10⁷ m⁻¹)`, Math.round(lam * 10) / 10,
      `1/λ = R(1/${n1}² − 1/${n2}²) ⇒ λ = ${lam.toFixed(1)} nm (${n1 === 1 ? 'Lyman, ultraviolet' : n1 === 2 ? 'Balmer, visible or near-UV' : 'Paschen, infrared'}).`,
      `# from physical constants: E_n = -m_e e^4 / (8 eps0^2 h^2 n^2), lambda = h c / dE (infinite nuclear mass, as R_inf assumes)\nme, e, eps0, h, c = 9.1093837015e-31, 1.602176634e-19, 8.8541878128e-12, 6.62607015e-34, 299792458.0\nE = lambda n: -me * e ** 4 / (8 * eps0 ** 2 * h ** 2 * n ** 2)\nprint(h * c / (E(${n2}) - E(${n1})) * 1e9)`, { tol: 0.1, dp: 1 });
  }),

  SKILL('ch.gibbs', 'Gibbs energy and spontaneity', 'ΔG = ΔH − TΔS: when ΔH and ΔS share a sign, temperature decides.', t => {
    // ΔH and ΔS of the same sign, so temperature decides (kJ/mol and kJ/(mol·K))
    const sign = t.pick([1, -1]), dH = sign * t.pick([40, 50, 90, 100, 178]), dS = sign * t.pick([0.1, 0.12, 0.16, 0.2, 0.25]);
    const Tc = dH / dS;
    return num(`ΔH = ${dH} kJ/mol and ΔS = ${dS * 1000} J/(mol·K). Above or below what temperature (K) does the reaction's spontaneity change? (1 decimal place)`, Math.round(Tc * 10) / 10,
      `ΔG = 0 at T = ΔH/ΔS = ${Tc.toFixed(1)} K. ${dH > 0 ? 'Above it the reaction is spontaneous (entropy wins).' : 'Below it the reaction is spontaneous (enthalpy wins).'}`,
      `dG = lambda T: ${dH} - T * ${dS}\nlo, hi = 1e-6, 1e5\nfor _ in range(200):\n    m = (lo + hi) / 2\n    if (dG(lo) > 0) == (dG(m) > 0): lo = m\n    else: hi = m\nprint(lo)`, { tol: 0.1, dp: 1 });
  }),

  SKILL('ch.kinetics', 'First-order kinetics', 'd[A]/dt = −k[A]: concentration halves every ln 2/k, whatever it starts at.', t => {
    const half = t.pick([10, 30, 60, 120]), A0 = t.pick([1, 0.5, 2]), time = t.int(5, 300), ask = t.pick(['conc', 'k']);
    const k = Math.LN2 / half, A = A0 * Math.exp(-k * time);
    if (ask === 'k') return num(`A first-order reaction has a half-life of ${half} s. What is its rate constant k, in s⁻¹? (5 decimal places)`, Math.round(k * 1e5) / 1e5,
      `k = ln 2 / t½ = ${(k).toFixed(5)} s⁻¹.`,
      `import math\n# measure the time to halve by integrating d[A]/dt = -k[A] for trial k, then bisect on k\ndef halftime(k):\n    a, t, h = 1.0, 0.0, 0.01\n    while a > 0.5: a -= k * a * h; t += h\n    return t\nlo, hi = 1e-5, 1.0\nfor _ in range(60):\n    m = (lo + hi) / 2\n    if halftime(m) > ${half}: lo = m\n    else: hi = m\nprint(m)`, { tol: 2e-4, dp: 5 });
    return num(`A first-order reaction (half-life ${half} s) starts at ${A0} M. What is the concentration after ${time} s, in M? (4 decimal places)`, r4(A),
      `[A] = [A]₀e^{−kt} with k = ln 2/${half}: ${r4(A)} M (${r2(time / half)} half-lives).`,
      `import math\nk = math.log(2) / ${half}\na, t, h = ${A0}, 0.0, 0.001\nwhile t < ${time} - 1e-9:\n    k1 = -k * a; k2 = -k * (a + h / 2 * k1); k3 = -k * (a + h / 2 * k2); k4 = -k * (a + h * k3)\n    a += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; t += h\nprint(a)`, { tol: 0.0002, dp: 4 });
  }),

  SKILL('ch.calorimetry', 'Calorimetry', 'Heat lost by the hot body equals heat gained by the cold one: Σ m c (T_f − T_i) = 0.', t => {
    const m1 = t.pick([50, 100, 200]), T1 = t.pick([80, 90, 100]), m2 = t.pick([100, 200, 300]), T2 = t.pick([10, 20, 25]), metal = t.pick([['copper', 0.385], ['aluminium', 0.897], ['iron', 0.449], ['water', 4.186]]);
    const c1 = metal[1], c2 = 4.186, Tf = (m1 * c1 * T1 + m2 * c2 * T2) / (m1 * c1 + m2 * c2);
    return num(`${m1} g of ${metal[0]} (c = ${c1} J/g·K) at ${T1} °C is dropped into ${m2} g of water (c = 4.186 J/g·K) at ${T2} °C in an insulated cup. What is the final temperature, in °C? (2 decimal places)`, r2(Tf),
      `m₁c₁(T_f − ${T1}) + m₂c₂(T_f − ${T2}) = 0 ⇒ T_f = ${r2(Tf)} °C.`,
      `# let heat flow in small packets from hot to cold until the temperatures meet\nC1, C2 = ${m1} * ${c1}, ${m2} * 4.186\nT1, T2 = ${T1}.0, ${T2}.0\nwhile T1 - T2 > 1e-7:\n    q = 0.01 * (T1 - T2) * min(C1, C2)\n    T1 -= q / C1; T2 += q / C2\nprint((T1 + T2) / 2)`);
  }),
];
