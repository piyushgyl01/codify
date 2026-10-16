/**
 * Ethics (CS530), data science (CS601) and research methods (CS610): the
 * parts with exact answers — group fairness metrics and why they conflict,
 * k-anonymity and differential privacy; confidence intervals, permutation
 * tests, Simpson's paradox and selection-bias correction; power, multiple
 * comparisons, effect sizes and back-door adjustment. CS2023 SEP-Ethical-Analysis,
 * SEP-Privacy, AI-SEP, MSF-Statistics.
 *
 * Checks: exact enumeration (every permutation, every row), Fractions and
 * the standard library's NormalDist — never the generator's formula.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0.0001, dp: 4, explain, python, ...extra });
const PY = JSON.stringify;
const r4 = x => Math.round(x * 10000) / 10000;
const Phi = z => { const x = Math.abs(z) / Math.SQRT2, tt = 1 / (1 + 0.3275911 * x); const e = 1 - (((((1.061405429 * tt - 1.453152027) * tt) + 1.421413741) * tt - 0.284496736) * tt + 0.254829592) * tt * Math.exp(-x * x); return 0.5 * (1 + (z >= 0 ? e : -e)); };
const Zinv = p => { let lo = -10, hi = 10; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; } return lo; };

export const INFERENCE = [
  SKILL('eth.fairness', 'Group fairness metrics', 'Demographic parity, equal opportunity and predictive parity from two confusion matrices.', t => {
    const g = () => ({ tp: t.int(10, 60), fp: t.int(5, 40), fn: t.int(5, 40), tn: t.int(30, 120) });
    const A = g(), B = g(), metric = t.pick(['selection', 'tpr', 'fpr', 'ppv']);
    const f = { selection: m => (m.tp + m.fp) / (m.tp + m.fp + m.fn + m.tn), tpr: m => m.tp / (m.tp + m.fn), fpr: m => m.fp / (m.fp + m.tn), ppv: m => m.tp / (m.tp + m.fp) }[metric];
    const name = { selection: 'selection rate (demographic parity)', tpr: 'true-positive rate (equal opportunity)', fpr: 'false-positive rate', ppv: 'precision (predictive parity)' }[metric];
    const diff = f(A) - f(B);
    return num(`A screening model's confusion matrices — group A: TP ${A.tp}, FP ${A.fp}, FN ${A.fn}, TN ${A.tn}; group B: TP ${B.tp}, FP ${B.fp}, FN ${B.fn}, TN ${B.tn}. What is the ${name} of A minus that of B? (4 decimal places)`, r4(diff),
      `${name}: A ${r4(f(A))}, B ${r4(f(B))}, difference ${r4(diff)}. Different fairness criteria use different cells — and when base rates differ they cannot all be equal at once.`,
      `from fractions import Fraction as F\nrows = {'A': ${PY(A)}, 'B': ${PY(B)}}\ndef rate(m):\n    pred_pos, actual_pos, actual_neg = m['tp'] + m['fp'], m['tp'] + m['fn'], m['fp'] + m['tn']\n    return {'selection': F(pred_pos, pred_pos + m['fn'] + m['tn']), 'tpr': F(m['tp'], actual_pos), 'fpr': F(m['fp'], actual_neg), 'ppv': F(m['tp'], pred_pos)}[${PY(metric)}]\nprint(float(rate(rows['A']) - rate(rows['B'])))`);
  }),

  SKILL('eth.baserate', 'Fairness and base rates', 'Equal error rates with unequal base rates force unequal precision — the impossibility result.', t => {
    const tpr = t.pick([0.7, 0.8, 0.9]), fpr = t.pick([0.05, 0.1, 0.2]), b1 = t.pick([0.1, 0.2, 0.3]), b2 = t.pick([0.4, 0.5, 0.6]);
    const ppv = b => (tpr * b) / (tpr * b + fpr * (1 - b)), d = ppv(b2) - ppv(b1);
    return num(`A classifier has the same TPR (${tpr}) and FPR (${fpr}) in two groups whose base rates are ${b1} and ${b2}. By how much does its precision (PPV) differ between them, higher minus lower? (4 decimal places)`, r4(d),
      `PPV = TPR·b / (TPR·b + FPR·(1 − b)): ${r4(ppv(b1))} against ${r4(ppv(b2))}. Equal error rates plus different base rates make predictive parity impossible (Chouldechova; Kleinberg et al.).`,
      `from fractions import Fraction as F\ntpr, fpr = F('${tpr}'), F('${fpr}')\ndef ppv(b):\n    b = F(b); n = 10000\n    pos = n * b; neg = n - pos\n    return (tpr * pos) / (tpr * pos + fpr * neg)\nprint(float(ppv('${b2}') - ppv('${b1}')))`);
  }),

  SKILL('eth.kanon', 'k-anonymity', 'The smallest group sharing the same quasi-identifiers sets k — and re-identification risk.', t => {
    const zips = ['021**', '021**', '022**'], ages = ['20–29', '30–39', '40–49'];
    const rows = Array.from({ length: t.int(8, 12) }, () => [t.pick(zips), t.pick(ages), t.pick(['flu', 'asthma', 'none'])]);
    const groups = {}; rows.forEach(r => { const k = `${r[0]}|${r[1]}`; groups[k] = (groups[k] || 0) + 1; });
    const k = Math.min(...Object.values(groups));
    return num(`A released table has quasi-identifiers (ZIP, age band) and a sensitive diagnosis: ${rows.map(r => `(${r.join(', ')})`).join(' ')}. What k-anonymity does it achieve?`, k,
      `Group the rows by (ZIP, age band); k is the size of the smallest group: ${k}. ${k === 1 ? 'k = 1 means someone is unique — anyone who knows their ZIP and age learns their diagnosis.' : 'k-anonymity still leaks if a group shares one diagnosis (that is what l-diversity adds).'}`,
      `from collections import Counter\nrows = ${PY(rows)}\nprint(min(Counter((z, a) for z, a, _ in rows).values()))`, { tol: 0, dp: 0 });
  }),

  SKILL('eth.dp', 'Differential privacy', 'The Laplace mechanism: noise scale = sensitivity / ε, and what that does to accuracy.', t => {
    const eps = t.pick([0.1, 0.5, 1, 2]), sens = t.pick([1, 1, 2, 5]), within = t.pick([1, 2, 5, 10]);
    const b = sens / eps, p = 1 - Math.exp(-within / b);
    if (t.rng() < 0.5) return num(`A count query has sensitivity ${sens}. To release it with ε = ${eps} differential privacy by the Laplace mechanism, what is the noise scale b?`, r4(b),
      `b = Δf/ε = ${sens}/${eps} = ${r4(b)}. Smaller ε (more privacy) means more noise.`,
      `from fractions import Fraction as F\nprint(float(F(${sens}) / F('${eps}')))`);
    return num(`Laplace noise with scale b = ${r4(b)} (sensitivity ${sens}, ε = ${eps}) is added to a count. What is the probability the released value is within ±${within} of the truth? (4 decimal places)`, r4(p),
      `For Laplace(0, b), P(|X| ≤ t) = 1 − e^(−t/b) = 1 − e^(−${within}/${r4(b)}) = ${r4(p)}.`,
      `import math\nb, t = ${sens} / ${eps}, ${within}\n# integrate the Laplace density 1/(2b)·e^(−|x|/b) over [−t, t] numerically\nn = 200000; h = 2 * t / n\nprint(sum(math.exp(-abs(-t + (i + 0.5) * h) / b) / (2 * b) * h for i in range(n)))`);
  }),

  SKILL('st.ci', 'Confidence intervals', 'A 95% interval for a mean from a small sample, using the t distribution.', t => {
    const xs = Array.from({ length: t.int(5, 10) }, () => t.int(10, 30));
    const n = xs.length, m = xs.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1));
    const T = { 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262 }[n - 1], half = T * sd / Math.sqrt(n);
    return num(`Sample: ${xs.join(', ')}. What is the half-width of a 95% t-interval for the mean? (t* for ${n - 1} degrees of freedom is ${T}; 4 decimal places)`, r4(half),
      `x̄ = ${r4(m)}, s = ${r4(sd)} (dividing by n − 1), so t*·s/√n = ${T} × ${r4(sd)} / √${n} = ${r4(half)}.`,
      `import statistics as st, math\nxs = ${PY(xs)}\nprint(${T} * st.stdev(xs) / math.sqrt(len(xs)))`);
  }),

  SKILL('st.permtest', 'Permutation tests', 'An exact p-value: how often does shuffling the labels give a difference this large?', t => {
    const a = Array.from({ length: 4 }, () => t.int(5, 20)), b = Array.from({ length: 4 }, () => t.int(8, 25));
    const all = [...a, ...b], obs = Math.abs(a.reduce((s, x) => s + x, 0) / 4 - b.reduce((s, x) => s + x, 0) / 4);
    let hits = 0, total = 0;
    for (let m = 0; m < 256; m++) { if ([...Array(8).keys()].filter(i => m >> i & 1).length !== 4) continue; total++; const g1 = all.filter((_, i) => m >> i & 1), g2 = all.filter((_, i) => !(m >> i & 1)); if (Math.abs(g1.reduce((s, x) => s + x, 0) / 4 - g2.reduce((s, x) => s + x, 0) / 4) >= obs - 1e-9) hits++; }
    return num(`Control: ${a.join(', ')}. Treatment: ${b.join(', ')}. Using every way to split the 8 values into two groups of 4, what is the two-sided permutation-test p-value for the difference in means? (4 decimal places)`, r4(hits / total),
      `${hits} of the ${total} splits give a mean difference at least as large as the observed ${r4(obs)}: p = ${r4(hits / total)}. No distributional assumption is needed.`,
      `from itertools import combinations\nfrom fractions import Fraction as F\na, b = ${PY(a)}, ${PY(b)}\nv = a + b\nobs = abs(F(sum(a), 4) - F(sum(b), 4))\nsplits = list(combinations(range(8), 4))\nhits = sum(1 for s in splits if abs(F(sum(v[i] for i in s), 4) - F(sum(v[i] for i in range(8) if i not in s), 4)) >= obs)\nprint(hits / len(splits))`);
  }),

  SKILL('st.simpson', "Simpson's paradox", 'A treatment better in every group can look worse overall, when groups differ in size.', t => {
    const s = [[t.int(60, 90), 100], [t.int(10, 40), t.int(150, 300)]], u = [[t.int(50, s[0][0]), t.int(150, 300)], [t.int(5, s[1][0] - 1), 100]];
    const rate = ([k, n]) => k / n, overall = g => (g[0][0] + g[1][0]) / (g[0][1] + g[1][1]);
    const d = overall(s) - overall(u);
    return num(`Treatment S: easy cases ${s[0][0]}/${s[0][1]} cured, hard cases ${s[1][0]}/${s[1][1]}. Treatment U: easy ${u[0][0]}/${u[0][1]}, hard ${u[1][0]}/${u[1][1]}. What is S's overall cure rate minus U's? (4 decimal places)`, r4(d),
      `Within groups: easy ${r4(rate(s[0]))} vs ${r4(rate(u[0]))}, hard ${r4(rate(s[1]))} vs ${r4(rate(u[1]))}. Overall ${r4(overall(s))} vs ${r4(overall(u))}: difference ${r4(d)}. ${d < 0 ? 'S wins in each group yet loses overall — because S got mostly hard cases.' : ''}`,
      `from fractions import Fraction as F\nS, U = ${PY(s)}, ${PY(u)}\ncured = lambda g: sum(k for k, n in g); size = lambda g: sum(n for k, n in g)\nprint(float(F(cured(S), size(S)) - F(cured(U), size(U))))`);
  }),

  SKILL('st.ipw', 'Selection bias and weighting', 'Undo a biased sample with inverse-probability weights.', t => {
    const yHi = t.int(12, 20), yLo = t.int(4, 10), share = t.pick([0.2, 0.3, 0.4, 0.5]), pHi = t.pick([0.2, 0.4, 0.6]), pLo = t.pick([0.05, 0.1, 0.2]);
    const N = 10000, nHi = N * share * pHi, nLo = N * (1 - share) * pLo;
    const naive = (nHi * yHi + nLo * yLo) / (nHi + nLo), truth = share * yHi + (1 - share) * yLo;
    const ask = t.rng() < 0.5 ? 'naive' : 'truth';
    return num(`A population is ${share * 100}% "high" (outcome ${yHi}) and ${(1 - share) * 100}% "low" (outcome ${yLo}). High units are sampled with probability ${pHi}, low ones with ${pLo}. ${ask === 'naive' ? 'What does the unweighted sample mean estimate?' : 'Weighting each sampled unit by 1/(its sampling probability), what mean do you estimate?'} (4 decimal places)`, r4(ask === 'naive' ? naive : truth),
      `The sample over-represents "high" units: naive mean ${r4(naive)}. Weighting by 1/π restores the population mix: ${r4(truth)} — the true mean.`,
      `from fractions import Fraction as F\nshare, pH, pL = F('${share}'), F('${pHi}'), F('${pLo}')\nunits = [(${yHi}, pH)] * int(1000 * share) + [(${yLo}, pL)] * int(1000 * (1 - share))\nsampled = [(y, p, p) for y, p in units]   # expected-count sampling: each unit contributes its probability\nnaive = sum(y * p for y, p, _ in sampled) / sum(p for _, p, _ in sampled)\nipw = sum(y * p / q for y, p, q in sampled) / sum(p / q for _, p, q in sampled)\nprint(float(${ask === 'naive' ? 'naive' : 'ipw'}))`);
  }),

  SKILL('st.power', 'Power and sample size', 'How many per group to detect a difference in means with 80% power.', t => {
    const d = t.pick([0.2, 0.3, 0.5, 0.8]), alpha = 0.05, power = t.pick([0.8, 0.9]);
    const n = Math.ceil(2 * ((Zinv(1 - alpha / 2) + Zinv(power)) / d) ** 2);
    return num(`A two-sided two-sample test at α = 0.05 with ${power * 100}% power, to detect a standardised effect d = ${d} (normal approximation). How many participants per group?`, n,
      `n = 2(z₁₋α/₂ + z_power)² / d² = 2(1.96 + ${Zinv(power).toFixed(3)})² / ${d}² → ${n} per group. Halving the effect quadruples the sample.`,
      `from statistics import NormalDist\nimport math\nz = NormalDist().inv_cdf\nprint(math.ceil(2 * ((z(1 - 0.05 / 2) + z(${power})) / ${d}) ** 2))`, { tol: 0, dp: 0 });
  }),

  SKILL('st.multiple', 'Multiple comparisons', 'Bonferroni and Benjamini–Hochberg: how many of many tests survive.', t => {
    const ps = Array.from({ length: t.int(6, 10) }, () => t.pick([0.001, 0.004, 0.008, 0.012, 0.02, 0.03, 0.04, 0.06, 0.2, 0.5])).sort((a, b) => a - b), q = 0.05, m = ps.length;
    const bonf = ps.filter(p => p <= q / m).length;
    let bh = 0; ps.forEach((p, i) => { if (p <= ((i + 1) / m) * q) bh = i + 1; });
    const method = t.pick(['Bonferroni', 'Benjamini–Hochberg']);
    return num(`${m} tests give p-values ${ps.join(', ')}. At level 0.05, how many are significant with ${method}?`, method === 'Bonferroni' ? bonf : bh,
      `Bonferroni compares each p to 0.05/${m} = ${(q / m).toFixed(4)}: ${bonf}. Benjamini–Hochberg finds the largest i with p₍ᵢ₎ ≤ (i/${m})·0.05 and keeps the first i: ${bh}. BH controls the false discovery rate, so it keeps more.`,
      method === 'Bonferroni' ? `ps = ${PY(ps)}\nprint(sum(1 for p in ps if p * len(ps) <= 0.05))` : `from fractions import Fraction as F\nps = sorted(F(str(p)) for p in ${PY(ps)})\nm = len(ps)\nkeep = [i for i in range(1, m + 1) if ps[i - 1] <= F(i, m) * F('0.05')]\nprint(max(keep) if keep else 0)`, { tol: 0, dp: 0 });
  }),

  SKILL('st.adjust', 'Confounding and adjustment', 'The back-door formula: stratify by the confounder, then average over its distribution.', t => {
    const pZ = t.pick([0.3, 0.5, 0.7]);
    const y = { '11': t.pick([0.6, 0.7, 0.8]), '01': t.pick([0.4, 0.5, 0.6]), '10': t.pick([0.3, 0.4]), '00': t.pick([0.1, 0.2]) }; // y[tz]
    const pTgivenZ = { 1: t.pick([0.7, 0.8, 0.9]), 0: t.pick([0.1, 0.2, 0.3]) };
    const adj = pZ * (y['11'] - y['01']) + (1 - pZ) * (y['10'] - y['00']);
    const pZgivenT = tt => { const a = pZ * (tt ? pTgivenZ[1] : 1 - pTgivenZ[1]), b = (1 - pZ) * (tt ? pTgivenZ[0] : 1 - pTgivenZ[0]); return a / (a + b); };
    const naive = (pZgivenT(1) * y['11'] + (1 - pZgivenT(1)) * y['10']) - (pZgivenT(0) * y['01'] + (1 - pZgivenT(0)) * y['00']);
    const ask = t.rng() < 0.5 ? 'adjusted' : 'naive';
    return num(`Z confounds T and Y. P(Z = 1) = ${pZ}; P(T = 1 | Z = 1) = ${pTgivenZ[1]}, P(T = 1 | Z = 0) = ${pTgivenZ[0]}. P(Y = 1 | T, Z): (1,1) ${y['11']}, (0,1) ${y['01']}, (1,0) ${y['10']}, (0,0) ${y['00']}. What is the ${ask === 'adjusted' ? 'back-door adjusted effect of T on P(Y = 1)' : 'naive difference P(Y = 1 | T = 1) − P(Y = 1 | T = 0)'}? (4 decimal places)`, r4(ask === 'adjusted' ? adj : naive),
      `Adjusted: Σ_z P(z)[P(Y|T=1,z) − P(Y|T=0,z)] = ${r4(adj)}. Naive: ${r4(naive)} — it mixes in the effect of Z because treated units mostly have Z = 1.`,
      `from fractions import Fraction as F\npZ = F('${pZ}'); pT = {1: F('${pTgivenZ[1]}'), 0: F('${pTgivenZ[0]}')}\npY = {(1, 1): F('${y['11']}'), (0, 1): F('${y['01']}'), (1, 0): F('${y['10']}'), (0, 0): F('${y['00']}')}\njoint = {(t, z): (pZ if z else 1 - pZ) * (pT[z] if t else 1 - pT[z]) for t in (0, 1) for z in (0, 1)}\ncond = lambda t: sum(joint[(t, z)] * pY[(t, z)] for z in (0, 1)) / sum(joint[(t, z)] for z in (0, 1))\nadj = sum((pZ if z else 1 - pZ) * (pY[(1, z)] - pY[(0, z)]) for z in (0, 1))\nprint(float(${ask === 'adjusted' ? 'adj' : 'cond(1) - cond(0)'}))`);
  }),

  SKILL('st.effect', 'Effect sizes', "Cohen's d: the difference in means in units of pooled standard deviation.", t => {
    const a = Array.from({ length: 5 }, () => t.int(10, 20)), b = Array.from({ length: 5 }, () => t.int(13, 25));
    const mean = v => v.reduce((x, y) => x + y, 0) / v.length, vr = v => v.reduce((x, y) => x + (y - mean(v)) ** 2, 0) / (v.length - 1);
    const d = (mean(b) - mean(a)) / Math.sqrt((vr(a) + vr(b)) / 2);
    return num(`Group A: ${a.join(', ')}. Group B: ${b.join(', ')}. What is Cohen's d (B minus A, pooled standard deviation, equal group sizes)? (4 decimal places)`, r4(d),
      `d = (x̄_B − x̄_A) / s_pooled = (${mean(b)} − ${mean(a)}) / ${r4(Math.sqrt((vr(a) + vr(b)) / 2))} = ${r4(d)}. Around 0.2 is small, 0.5 medium, 0.8 large.`,
      `import statistics as st, math\na, b = ${PY(a)}, ${PY(b)}\nprint((st.mean(b) - st.mean(a)) / math.sqrt((st.variance(a) + st.variance(b)) / 2))`);
  }),
];
