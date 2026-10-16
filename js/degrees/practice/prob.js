/**
 * STAT210 Probability for Computing — Stat 110-style calculations: the
 * birthday problem, Bayes with base rates, independence from a table,
 * binomial / geometric / Poisson, continuous tails, covariance, the normal
 * approximation with continuity correction, and indicator variables for
 * hashing and load balancing. CS2023 MSF-Probability 1–6.
 *
 * Each question carries `python`: exact Fractions or math.erf, written
 * separately, which prints the answer.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0.0001, dp: 4, explain, python, ...extra });
const r4 = x => Math.round(x * 10000) / 10000;
const comb = (n, k) => { let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return Math.round(c); };
const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
/** Φ(z) by Abramowitz–Stegun 7.1.26 — Python checks it with math.erf. */
const Phi = z => { const x = Math.abs(z) / Math.SQRT2, tt = 1 / (1 + 0.3275911 * x); const e = 1 - (((((1.061405429 * tt - 1.453152027) * tt) + 1.421413741) * tt - 0.284496736) * tt + 0.254829592) * tt * Math.exp(-x * x); return 0.5 * (1 + (z >= 0 ? e : -e)); };

export const PROB = [
  SKILL('pr.birthday', 'Counting and collisions', 'The birthday problem — and why hash collisions arrive sooner than you think.', t => {
    const d = t.pick([365, 1000, 10000]), n = d === 365 ? t.int(10, 40) : t.int(20, 120);
    let none = 1; for (let i = 0; i < n; i++) none *= (d - i) / d;
    return num(`${n} items are each given one of ${d} equally likely ${d === 365 ? 'birthdays' : 'hash values'}, independently. What is the probability that at least two share one? (4 decimal places)`, r4(1 - none),
      `Use the complement: P(all different) = ${d}/${d} · ${d - 1}/${d} · … · ${d - n + 1}/${d} = ${none.toFixed(4)}, so P(a collision) = ${r4(1 - none)}. Collisions become likely near √${d} ≈ ${Math.round(Math.sqrt(d))} items.`,
      `from fractions import Fraction as F\np = F(1)\nfor i in range(${n}):\n    p *= F(${d} - i, ${d})\nprint(float(1 - p))`);
  }),

  SKILL('pr.bayes', 'Bayes and base rates', 'Positive predictive value: why a good test for a rare condition still misleads.', t => {
    const prev = t.pick([0.001, 0.01, 0.02, 0.03, 0.05, 0.1]), sens = t.pick([0.9, 0.92, 0.95, 0.99]), spec = t.pick([0.9, 0.95, 0.96, 0.99]);
    const pos = t.rng() < 0.65;
    const ans = pos ? (prev * sens) / (prev * sens + (1 - prev) * (1 - spec)) : (prev * (1 - sens)) / (prev * (1 - sens) + (1 - prev) * spec);
    return num(`A condition has prevalence ${prev}. A test has sensitivity ${sens} and specificity ${spec}. Given a ${pos ? 'positive' : 'negative'} result, what is the probability of having the condition? (4 decimal places)`, r4(ans),
      pos ? `Bayes: P(D | +) = P(+ | D)P(D) / P(+) = ${sens}·${prev} / (${sens}·${prev} + ${(1 - spec).toFixed(2)}·${(1 - prev).toFixed(3)}) = ${r4(ans)}. False positives from the large healthy group swamp the true ones.`
        : `P(D | −) = P(− | D)P(D) / P(−) = ${(1 - sens).toFixed(2)}·${prev} / (${(1 - sens).toFixed(2)}·${prev} + ${spec}·${(1 - prev).toFixed(3)}) = ${r4(ans)}.`,
      `from fractions import Fraction as F\nprev, sens, spec = F('${prev}'), F('${sens}'), F('${spec}')\n${pos ? 'print(float(prev * sens / (prev * sens + (1 - prev) * (1 - spec))))' : 'print(float(prev * (1 - sens) / (prev * (1 - sens) + (1 - prev) * spec)))'}`);
  }),

  SKILL('pr.indep', 'Independence', 'Test independence from a table of counts: P(A ∩ B) against P(A)·P(B).', t => {
    const indep = t.rng() < 0.5;
    let n11, n12, n21, n22;
    if (indep) { const a = t.int(1, 4), b = t.int(1, 4), c = t.int(1, 4), d = t.int(1, 4), k = t.int(2, 5); [n11, n12, n21, n22] = [a * c * k, a * d * k, b * c * k, b * d * k]; }
    else { do { [n11, n12, n21, n22] = [t.int(5, 40), t.int(5, 40), t.int(5, 40), t.int(5, 40)]; } while (n11 * n22 === n12 * n21); }
    const N = n11 + n12 + n21 + n22;
    return { kind: 'mc', q: `Among ${N} requests: ${n11} were cached and fast, ${n12} cached and slow, ${n21} uncached and fast, ${n22} uncached and slow. Picking one at random, are "cached" and "fast" independent events?`,
      options: indep ? ['Yes', 'No'] : ['No', 'Yes'], correct: 0,
      explain: `Independent means P(cached and fast) = P(cached)·P(fast): ${n11}/${N} against ${n11 + n12}/${N} · ${n11 + n21}/${N}. Equivalently ${n11}·${n22} ${indep ? '=' : '≠'} ${n12}·${n21}, so ${indep ? 'they are independent' : 'they are not'}.`,
      python: `from fractions import Fraction as F\nn11, n12, n21, n22 = ${n11}, ${n12}, ${n21}, ${n22}\nN = n11 + n12 + n21 + n22\nprint('Yes' if F(n11, N) == F(n11 + n12, N) * F(n11 + n21, N) else 'No')` };
  }),

  SKILL('pr.discrete', 'Binomial, geometric and Poisson', 'The workhorse discrete distributions, and when each one fits.', t => {
    const form = t.int(0, 2);
    if (form === 0) {
      const n = t.int(5, 15), p = t.pick([0.1, 0.2, 0.3, 0.5]), k = t.int(0, Math.min(n, 5));
      const ans = comb(n, k) * p ** k * (1 - p) ** (n - k);
      return num(`Each of ${n} independent packets is lost with probability ${p}. What is the probability exactly ${k} are lost?`, r4(ans),
        `Binomial: C(${n}, ${k}) · ${p}^${k} · ${(1 - p).toFixed(1)}^${n - k} = ${comb(n, k)} × … = ${r4(ans)}.`,
        `from math import comb\nprint(comb(${n}, ${k}) * ${p} ** ${k} * (1 - ${p}) ** ${n - k})`);
    }
    if (form === 1) {
      const p = t.pick([0.1, 0.2, 0.25, 0.5]), k = t.int(1, 6);
      const ans = (1 - p) ** (k - 1) * p;
      return num(`A retry succeeds with probability ${p}, independently each time. What is the probability the first success is on attempt ${k}?`, r4(ans),
        `Geometric: ${k - 1} failures then a success, (1 − ${p})^${k - 1} · ${p} = ${r4(ans)}. The expected number of attempts is 1/${p} = ${1 / p}.`,
        `print((1 - ${p}) ** ${k - 1} * ${p})`);
    }
    const lam = t.pick([0.5, 1, 2, 3, 4]), k = t.int(0, 5), ans = Math.exp(-lam) * lam ** k / fact(k);
    return num(`Requests arrive at a server as a Poisson process with an average of ${lam} per second. What is the probability of exactly ${k} in a given second?`, r4(ans),
      `Poisson: e^(−${lam}) · ${lam}^${k} / ${k}! = ${r4(ans)}.`,
      `from math import exp, factorial\nprint(exp(-${lam}) * ${lam} ** ${k} / factorial(${k}))`);
  }),

  SKILL('pr.continuous', 'Continuous distributions', 'Exponential waiting times and normal tails.', t => {
    if (t.rng() < 0.5) {
      const mean = t.pick([2, 5, 10, 20]), x = t.pick([1, 3, 5, 10, 15]), ans = Math.exp(-x / mean);
      return num(`The time until a disk fails is exponential with mean ${mean} years. What is the probability it survives more than ${x} years?`, r4(ans),
        `P(T > ${x}) = e^(−${x}/${mean}) = ${r4(ans)}. It is memoryless: having lasted already does not change the odds for the next year.`,
        `import math\nprint(math.exp(-${x} / ${mean}))`);
    }
    const mu = t.pick([100, 200, 50]), sd = t.pick([10, 15, 20]), x = mu + sd * t.pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2]);
    const ans = Phi((x - mu) / sd);
    return num(`Response times are normal with mean ${mu} ms and standard deviation ${sd} ms. What fraction are below ${x} ms?`, r4(ans),
      `Standardise: z = (${x} − ${mu}) / ${sd} = ${(x - mu) / sd}. Φ(${(x - mu) / sd}) = ${r4(ans)}.`,
      `import math\nprint(0.5 * (1 + math.erf((${x} - ${mu}) / ${sd} / math.sqrt(2))))`);
  }),

  SKILL('pr.cov', 'Joint distributions and covariance', 'From a joint table to E[XY], covariance and correlation.', t => {
    let w; do { w = Array.from({ length: 4 }, () => t.int(0, 6)); } while (w.reduce((a, b) => a + b, 0) === 0);
    const tot = w.reduce((a, b) => a + b, 0), pts = [[0, 0], [0, 1], [1, 0], [1, 1]];
    const p = w.map(x => x / tot), EX = p[2] + p[3], EY = p[1] + p[3], EXY = p[3], cov = EXY - EX * EY;
    return num(`X and Y are each 0 or 1. Their joint probabilities are P(0,0) = ${w[0]}/${tot}, P(0,1) = ${w[1]}/${tot}, P(1,0) = ${w[2]}/${tot}, P(1,1) = ${w[3]}/${tot}. What is Cov(X, Y)? (4 decimal places)`, r4(cov),
      `E[X] = ${r4(EX)}, E[Y] = ${r4(EY)}, E[XY] = P(1,1) = ${r4(EXY)}. Cov = E[XY] − E[X]E[Y] = ${r4(cov)}. Zero covariance alone would not prove independence in general.`,
      `from fractions import Fraction as F\nw = ${JSON.stringify(w)}\npts = ${JSON.stringify(pts)}\np = [F(x, sum(w)) for x in w]\nEX = sum(pi * x for pi, (x, y) in zip(p, pts)); EY = sum(pi * y for pi, (x, y) in zip(p, pts)); EXY = sum(pi * x * y for pi, (x, y) in zip(p, pts))\nprint(float(EXY - EX * EY))`);
  }),

  SKILL('pr.clt', 'The normal approximation', 'The central limit theorem for counts, with the continuity correction.', t => {
    const n = t.pick([100, 200, 400, 900]), p = t.pick([0.1, 0.2, 0.3, 0.5]), mu = n * p, sd = Math.sqrt(n * p * (1 - p));
    const k = Math.round(mu + sd * t.pick([-1, -0.5, 0.5, 1, 1.5]));
    const ans = Phi((k + 0.5 - mu) / sd);
    return num(`${n} independent trials each succeed with probability ${p}. Using the normal approximation with continuity correction, what is P(at most ${k} successes)?`, r4(ans),
      `Mean np = ${mu}, sd √(np(1 − p)) = ${sd.toFixed(3)}. With the correction, P(X ≤ ${k}) ≈ Φ((${k} + 0.5 − ${mu}) / ${sd.toFixed(3)}) = Φ(${((k + 0.5 - mu) / sd).toFixed(3)}) = ${r4(ans)}.`,
      `import math\nmu, sd = ${n} * ${p}, math.sqrt(${n} * ${p} * (1 - ${p}))\nprint(0.5 * (1 + math.erf((${k} + 0.5 - mu) / sd / math.sqrt(2))))`, { tol: 0.0002 });
  }),

  SKILL('pr.indicator', 'Indicators and linearity', 'Expected empty servers and colliding pairs, by summing indicator variables.', t => {
    const m = t.int(5, 20), n = t.int(3, 10);
    if (t.rng() < 0.5) {
      const ans = n * (1 - 1 / n) ** m;
      return num(`${m} requests are each sent to one of ${n} servers uniformly at random, independently. What is the expected number of servers that get no requests? (4 decimal places)`, r4(ans),
        `Let I_j = 1 if server j is empty: P(I_j = 1) = (1 − 1/${n})^${m}. By linearity, E[empty] = ${n} · (${n - 1}/${n})^${m} = ${r4(ans)}.`,
        `from fractions import Fraction as F\nprint(float(${n} * (1 - F(1, ${n})) ** ${m}))`);
    }
    const ans = (m * (m - 1)) / 2 / n;
    return num(`${m} keys are hashed uniformly and independently into ${n} buckets. What is the expected number of pairs of keys that collide (land in the same bucket)?`, r4(ans),
      `There are C(${m}, 2) = ${(m * (m - 1)) / 2} pairs, each colliding with probability 1/${n}: E = ${(m * (m - 1)) / 2} / ${n} = ${r4(ans)}.`,
      `from math import comb\nfrom fractions import Fraction as F\nprint(float(F(comb(${m}, 2), ${n})))`);
  }),
];
