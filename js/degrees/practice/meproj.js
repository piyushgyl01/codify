/**
 * Mechanical Engineering: laboratory signal analysis and project methods
 * (2.672, 15.783J, 16.842; FE Mechanical topics 3, 13 and 14.K).
 *
 * Checks take another route: half-power points found by scanning and
 * bisecting the frequency response, spectral peaks by computing the DFT term
 * by term, fault-tree probabilities by enumerating every combination of
 * component states, and critical paths by listing every path through the
 * network.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const EXACT = { rtol: 0, tol: 0, dp: 0 };

export const MEPROJ = [
  SKILL('exp.halfpower', 'Damping from the half-power bandwidth', 'Where a resonance\'s amplitude falls to 1/√2 of its peak, the half-power points ω₁ and ω₂ give ζ ≈ (ω₂ − ω₁)/(2ω_peak) — accurate for light damping, biased for heavier.', t => {
    const m = t.pick([1, 2, 5]), k = t.pick([1000, 5000, 20000]), z = t.pick([0.02, 0.05, 0.08, 0.12, 0.15]), c = 2 * z * Math.sqrt(k * m), ask = t.pick(['zest', 'bw']);
    const A = m * m, B = -(2 * k * m - c * c), up = (2 * k * m - c * c) / (2 * m * m), Dmin = k * k - (2 * k * m - c * c) ** 2 / (4 * m * m), C = k * k - 2 * Dmin;
    const disc = Math.sqrt(B * B - 4 * A * C), u1 = (-B - disc) / (2 * A), u2 = (-B + disc) / (2 * A), w1 = Math.sqrt(u1), w2 = Math.sqrt(u2), wp = Math.sqrt(up), zest = (w2 - w1) / (2 * wp);
    return num(`A ${m} kg mass on a ${k} N/m spring with damping ratio ${z} is shaken by a harmonic force of swept frequency. Measuring its response, ${ask === 'zest' ? 'what damping ratio does the half-power method report, using (ω₂ − ω₁)/(2ω_peak)' : 'what is the half-power bandwidth f₂ − f₁, in Hz'}? (4 significant figures)`, r4(ask === 'zest' ? zest : (w2 - w1) / (2 * Math.PI)),
      `|X|² ∝ 1/((k − mω²)² + (cω)²) peaks at ω_p = ${r4(wp)} rad/s. Setting it to half the peak gives ω₁ = ${r4(w1)} and ω₂ = ${r4(w2)} rad/s: bandwidth ${r4((w2 - w1) / (2 * Math.PI))} Hz, ζ_est = ${r4(zest)} (true ${z}).`,
      `import math\n# scan the frequency response for its peak, then bisect for the two half-power frequencies\nm, k, c = ${m}, ${k}, ${c}\nH2 = lambda w: 1 / ((k - m * w * w) ** 2 + (c * w) ** 2)\nwn = math.sqrt(k / m)\nws = [wn * (0.2 + 1.6 * i / 200000) for i in range(200001)]\nwp = max(ws, key=H2); lo, hi = wp - wn * 1.6e-5, wp + wn * 1.6e-5\ng = (5 ** 0.5 - 1) / 2\nfor _ in range(100):\n    a, b = hi - g * (hi - lo), lo + g * (hi - lo)\n    lo, hi = (a, hi) if H2(a) < H2(b) else (lo, b)\nwp = (lo + hi) / 2; half = H2(wp) / 2\ndef cross(a, b):\n    for _ in range(200):\n        mid = (a + b) / 2\n        a, b = (mid, b) if (H2(mid) > half) == (H2(a) > half) else (a, mid)\n    return a\nw1 = cross(wn * 0.2, wp); w2 = cross(wp, wn * 1.8)\nprint(${ask === 'zest' ? '(w2 - w1) / (2 * wp)' : '(w2 - w1) / (2 * math.pi)'})`);
  }),

  SKILL('exp.fft', 'Reading a spectrum', 'An N-point DFT of data sampled at f_s has bins f_s/N apart; a tone shows up at the bin nearest its frequency, k ≈ f/(f_s/N).', t => {
    const fs = t.pick([1000, 2000, 5000, 8000]), N = t.pick([128, 256, 512]), df = fs / N, k = t.int(5, N / 2 - 5), delta = t.pick([-0.3, -0.2, 0, 0.15, 0.25]), f0 = Number(((k + delta) * df).toFixed(2)), ask = t.pick(['bin', 'df']);
    const kk = Math.round(f0 / df);
    return num(ask === 'bin' ? `A ${f0} Hz sine is sampled at ${fs} Hz and ${N} samples go into a DFT (no window). Which bin index (0 = DC) holds the largest magnitude below the Nyquist frequency?` : `Data sampled at ${fs} Hz are analysed with a ${N}-point DFT. What is the frequency resolution (bin spacing), in Hz? (4 significant figures)`, ask === 'bin' ? kk : r4(df),
      `Bin spacing f_s/N = ${r4(df)} Hz. ${f0} Hz ÷ ${r4(df)} = ${r4(f0 / df)}, so the peak lands in bin ${kk}.`,
      ask === 'bin'
        ? `import math\n# compute the DFT term by term and take the largest bin below Nyquist\nfs, N, f0 = ${fs}, ${N}, ${f0}\nx = [math.sin(2 * math.pi * f0 * n / fs) for n in range(N)]\nmag = []\nfor kk in range(N // 2):\n    re = sum(x[n] * math.cos(2 * math.pi * kk * n / N) for n in range(N)); im = sum(x[n] * math.sin(2 * math.pi * kk * n / N) for n in range(N))\n    mag.append(re * re + im * im)\nprint(max(range(N // 2), key=lambda i: mag[i]))`
        : `# frequency of each bin of a DFT of the sample times\nfs, N = ${fs}, ${N}\nfreqs = [k * fs / N for k in range(N)]\nprint(freqs[1] - freqs[0])`, ask === 'bin' ? EXACT : {});
  }),

  SKILL('cap.fta', 'Fault-tree analysis', 'With independent basic events, an AND gate multiplies probabilities and an OR gate gives 1 − Π(1 − pᵢ). The top event\'s probability shows where redundancy pays.', t => {
    const names = ['the pump fails', 'the backup pump fails', 'the level sensor fails', 'mains power is lost'], p = names.map(() => t.pick([0.001, 0.002, 0.005, 0.01, 0.02, 0.05]));
    const tpl = t.pick(['or-and', 'and-or', 'or2and', 'and2or', 'vote']);
    const AND = (...x) => x.reduce((s, v) => s * v, 1), OR = (...x) => 1 - x.reduce((s, v) => s * (1 - v), 1);
    const [a, b, c, d] = p;
    const top = { 'or-and': OR(AND(a, b), c), 'and-or': AND(OR(a, b), c), or2and: OR(AND(a, b), AND(c, d)), and2or: AND(OR(a, b), OR(c, d)), vote: a * b + a * c + b * c - 2 * a * b * c }[tpl];
    const L = 'ABCD', desc = { 'or-and': 'TOP = OR(AND(A, B), C)', 'and-or': 'TOP = AND(OR(A, B), C)', or2and: 'TOP = OR(AND(A, B), AND(C, D))', and2or: 'TOP = AND(OR(A, B), OR(C, D))', vote: 'TOP occurs when at least two of A, B, C occur' }[tpl];
    const used = tpl === 'or2and' || tpl === 'and2or' ? 4 : 3;
    return num(`A fault tree has independent basic events ${[...Array(used).keys()].map(i => `${L[i]} (${names[i]}, p = ${p[i]})`).join(', ')}. ${desc}. What is the probability of the top event? (4 significant figures)`, r4(top),
      `Combine gate by gate (AND multiplies, OR is 1 − Π(1 − p)): P(TOP) = ${r4(top)}.`,
      `import itertools\n# enumerate every combination of basic-event states and add up those where the top event occurs\np = ${JSON.stringify(p.slice(0, used))}\nrule = ${JSON.stringify(tpl)}\ndef top(s):\n    A, B, C = s[0], s[1], s[2]; D = s[3] if len(s) > 3 else False\n    return {'or-and': (A and B) or C, 'and-or': (A or B) and C, 'or2and': (A and B) or (C and D), 'and2or': (A or B) and (C or D), 'vote': (A + B + C) >= 2}[rule]\ntotal = 0.0\nfor s in itertools.product((False, True), repeat=len(p)):\n    pr = 1.0\n    for on, q in zip(s, p): pr *= q if on else 1 - q\n    if top(s): total += pr\nprint(total)`);
  }),

  SKILL('cap.cpm', 'Critical path scheduling', 'A project takes as long as its longest chain of dependent tasks. A task\'s total float — how long it can slip without delaying the end — is the latest start minus the earliest start.', t => {
    const n = 7, L = 'ABCDEFG', dur = Array.from({ length: n }, () => t.int(2, 9)), pred = Array.from({ length: n }, (_, i) => (i === 0 ? [] : [...new Set(Array.from({ length: t.int(1, Math.min(2, i)) }, () => t.int(0, i - 1)))]));
    const ES = [], EF = []; for (let i = 0; i < n; i++) { ES[i] = Math.max(0, ...pred[i].map(j => EF[j])); EF[i] = ES[i] + dur[i]; }
    const T = Math.max(...EF), succ = Array.from({ length: n }, (_, i) => [...Array(n).keys()].filter(j => pred[j].includes(i)));
    const LF = [], LS = []; for (let i = n - 1; i >= 0; i--) { LF[i] = succ[i].length ? Math.min(...succ[i].map(j => LS[j])) : T; LS[i] = LF[i] - dur[i]; }
    const which = t.int(0, n - 1), ask = t.pick(['T', 'float']), fl = LS[which] - ES[which];
    const table = dur.map((d, i) => `${L[i]} ${d} days${pred[i].length ? ` (after ${pred[i].map(j => L[j]).join(' and ')})` : ''}`).join('; ');
    return num(`A capstone build has tasks: ${table}. ${ask === 'T' ? 'How many days does the whole project take?' : `How many days of total float does task ${L[which]} have?`}`, ask === 'T' ? T : fl,
      `Forward pass: earliest finishes ${EF.join(', ')}, so the project takes ${T} days. Backward pass: latest starts ${LS.join(', ')}; task ${L[which]} has float ${LS[which]} − ${ES[which]} = ${fl}.`,
      `# list every chain of dependent tasks: the longest sets the duration, and a task's float is that minus the longest chain through it\ndur, pred = ${JSON.stringify(dur)}, ${JSON.stringify(pred)}\nn = len(dur); succ = [[j for j in range(n) if i in pred[j]] for i in range(n)]\npaths = []\ndef walk(i, path):\n    if not succ[i]: paths.append(path); return\n    for j in succ[i]: walk(j, path + [j])\nfor s in range(n):\n    if not pred[s]: walk(s, [s])\nlength = lambda p: sum(dur[i] for i in p)\nT = max(length(p) for p in paths)\nw = ${which}\nthrough = max(length(p) for p in paths if w in p)\nprint(${ask === 'T' ? 'T' : 'T - through'})`, EXACT);
  }),
];
