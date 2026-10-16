/**
 * Term 6 electives with exact answers: vision and NLP (CS632, CS633) —
 * convolution, pooling, TF-IDF and BLEU; parallel computing (CS634) —
 * work, span, Brent's bound, scans and Gustafson's law; Android (CS635) —
 * density-independent pixels, frame budgets and back-off; applied
 * cryptography (CS636) — one-time-pad reuse, PKCS#7, Diffie–Hellman, the
 * Chinese remainder theorem and nonce collisions.
 *
 * Checks are separate implementations: explicit loops for convolution,
 * collections.Counter for TF-IDF and BLEU, a DAG longest path for span,
 * itertools.accumulate for scans, Python's pow() and brute force for number
 * theory.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const r4 = x => Math.round(x * 10000) / 10000;

export const SYSTEMS6 = [
  SKILL('cv.conv', 'Convolution by hand', 'One output of a 2-D convolution (as deep-learning libraries do it: cross-correlation).', t => {
    const img = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => t.int(0, 5))), k = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => t.int(-1, 1)));
    const i = t.int(0, 1), j = t.int(0, 1);
    let v = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) v += img[i + a][j + b] * k[a][b];
    return num(`Image (4×4, rows top to bottom): ${img.map(r => `[${r.join(' ')}]`).join(' ')}. Kernel: ${k.map(r => `[${r.join(' ')}]`).join(' ')}. With stride 1 and no padding, what is output (${i}, ${j}) (0-based row, column)?`, v,
      `Lay the kernel over the 3×3 patch starting at (${i}, ${j}), multiply elementwise and add: ${v}. Frameworks do not flip the kernel.`,
      `img, k = ${PY(img)}, ${PY(k)}\npatch = [row[${j}:${j} + 3] for row in img[${i}:${i} + 3]]\nprint(sum(p * q for pr, kr in zip(patch, k) for p, q in zip(pr, kr)))`);
  }),

  SKILL('cv.pool', 'Pooling', '2×2 max pooling with stride 2 keeps the strongest response in each block.', t => {
    const img = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => t.int(0, 9))), i = t.int(0, 1), j = t.int(0, 1);
    const v = Math.max(img[2 * i][2 * j], img[2 * i][2 * j + 1], img[2 * i + 1][2 * j], img[2 * i + 1][2 * j + 1]);
    return num(`Input (4×4): ${img.map(r => `[${r.join(' ')}]`).join(' ')}. After 2×2 max pooling with stride 2, what is output (${i}, ${j})?`, v,
      `Block (${i}, ${j}) covers rows ${2 * i}–${2 * i + 1}, columns ${2 * j}–${2 * j + 1}; its maximum is ${v}.`,
      `img = ${PY(img)}\nout = [[max(img[r][c] for r in (2 * a, 2 * a + 1) for c in (2 * b, 2 * b + 1)) for b in range(2)] for a in range(2)]\nprint(out[${i}][${j}])`);
  }),

  SKILL('nlp.tfidf', 'TF-IDF', 'Weight a term by how often it appears here and how rare it is everywhere.', t => {
    const vocab = ['model', 'data', 'token', 'learn', 'graph', 'loss'];
    const docs = Array.from({ length: 4 }, () => Array.from({ length: t.int(4, 7) }, () => t.pick(vocab)));
    const d = t.int(0, 3), term = t.pick(docs[d]);
    const tf = docs[d].filter(w => w === term).length / docs[d].length, df = docs.filter(doc => doc.includes(term)).length, idf = Math.log(docs.length / df);
    return num(`Documents: ${docs.map((doc, i) => `d${i + 1} = "${doc.join(' ')}"`).join('; ')}. With tf = count/length and idf = ln(N/df), what is tf-idf of "${term}" in d${d + 1}? (4 decimal places)`, r4(tf * idf),
      `tf = ${docs[d].filter(w => w === term).length}/${docs[d].length}; it appears in ${df} of ${docs.length} documents, so idf = ln(${docs.length}/${df}) = ${r4(idf)}; tf-idf = ${r4(tf * idf)}.${df === docs.length ? ' A word in every document gets weight 0.' : ''}`,
      `import math\nfrom collections import Counter\ndocs = ${PY(docs)}\nc = Counter(docs[${d}])\ndf = sum(1 for doc in docs if ${PY(term)} in set(doc))\nprint(c[${PY(term)}] / sum(c.values()) * math.log(len(docs) / df))`, { tol: 0.0001, dp: 4 });
  }),

  SKILL('nlp.bleu', 'BLEU precision', 'Clipped n-gram precision: the heart of BLEU, and why repeating a word does not help.', t => {
    const ref = t.pick(['the cat sat on the mat', 'a model learns from data', 'the loss goes down slowly']).split(' ');
    const cand = Array.from({ length: t.int(4, 7) }, () => (t.rng() < 0.7 ? t.pick(ref) : t.pick(['dog', 'is', 'fast', 'a', 'the'])));
    const n = t.pick([1, 2]), grams = a => a.slice(0, a.length - n + 1).map((_, i) => a.slice(i, i + n).join(' '));
    const rc = {}; grams(ref).forEach(g => { rc[g] = (rc[g] || 0) + 1; });
    const cc = {}; grams(cand).forEach(g => { cc[g] = (cc[g] || 0) + 1; });
    const total = grams(cand).length, clipped = Object.entries(cc).reduce((s, [g, c]) => s + Math.min(c, rc[g] || 0), 0);
    return num(`Reference: "${ref.join(' ')}". Candidate: "${cand.join(' ')}". What is the clipped ${n}-gram precision? (4 decimal places)`, total ? r4(clipped / total) : 0,
      `Count each candidate ${n}-gram, but credit it at most as often as it appears in the reference: ${clipped} of ${total}. Clipping stops "the the the" from scoring well.`,
      `from collections import Counter\nref, cand, n = ${PY(ref)}, ${PY(cand)}, ${n}\ng = lambda a: Counter(tuple(a[i:i + n]) for i in range(len(a) - n + 1))\nr, c = g(ref), g(cand)\ntotal = sum(c.values())\nprint(sum(min(v, r[k]) for k, v in c.items()) / total if total else 0)`, { tol: 0.0001, dp: 4 });
  }),

  SKILL('par.workspan', 'Work and span', 'Work is total operations; span is the longest dependency chain; their ratio is the parallelism.', t => {
    const n = t.int(5, 7), cost = Array.from({ length: n }, () => t.int(1, 6)), deps = Array.from({ length: n }, (_, i) => (i === 0 ? [] : t.pickN([...Array(i).keys()], t.int(1, Math.min(2, i)))));
    const work = cost.reduce((a, b) => a + b, 0), fin = []; cost.forEach((c, i) => { fin[i] = c + Math.max(0, ...deps[i].map(d => fin[d])); });
    const span = Math.max(...fin), p = t.pick([2, 4, 8]), ask = t.pick(['work', 'span', 'brent']);
    const brent = work / p + span;
    return num(`A computation DAG: ${cost.map((c, i) => `task ${i} costs ${c}${deps[i].length ? ` after ${deps[i].join(' and ')}` : ''}`).join('; ')}. ${ask === 'work' ? 'What is its work T₁?' : ask === 'span' ? 'What is its span T∞?' : `Brent's bound gives T_p ≤ T₁/p + T∞. What is that bound for p = ${p}? (2 decimal places)`}`, ask === 'brent' ? Math.round(brent * 100) / 100 : ask === 'work' ? work : span,
      `Work = sum of costs = ${work}. Span = longest path through the dependencies = ${span}. Parallelism T₁/T∞ = ${r4(work / span)}: beyond about that many processors, more do not help. Brent: ${work}/${p} + ${span} = ${Math.round(brent * 100) / 100}.`,
      `from functools import lru_cache\ncost, deps = ${PY(cost)}, ${PY(deps)}\n@lru_cache(None)\ndef finish(i): return cost[i] + max([finish(d) for d in deps[i]] or [0])\nW, S = sum(cost), max(finish(i) for i in range(len(cost)))\nprint(${ask === 'work' ? 'W' : ask === 'span' ? 'S' : `W / ${p} + S`})`, ask === 'brent' ? { tol: 0.006, dp: 2 } : {});
  }),

  SKILL('par.scan', 'Parallel scan', 'Prefix sums: the building block of parallel algorithms — inclusive or exclusive.', t => {
    const a = Array.from({ length: 8 }, () => t.int(0, 9)), k = t.int(0, 7), excl = t.rng() < 0.5;
    const val = a.slice(0, excl ? k : k + 1).reduce((s, x) => s + x, 0);
    return num(`What is element ${k} (0-based) of the ${excl ? 'exclusive' : 'inclusive'} prefix sum of [${a.join(', ')}]?`, val,
      `${excl ? 'Exclusive: the sum of everything before index' : 'Inclusive: the sum up to and including index'} ${k} = ${val}. A work-efficient parallel scan (Blelloch) does it in O(n) work and O(log n) span.`,
      `from itertools import accumulate\na = ${PY(a)}\nv = [0] + list(accumulate(a))\nprint(v[${excl ? k : k + 1}])`);
  }),

  SKILL('par.gustafson', "Gustafson's law", 'Scale the problem with the machine and the serial part matters less.', t => {
    const s = t.pick([0.05, 0.1, 0.2, 0.3]), p = t.pick([4, 16, 64]);
    const g = p - s * (p - 1), a = 1 / (s + (1 - s) / p);
    const ask = t.rng() < 0.5 ? 'gustafson' : 'amdahl';
    return num(`A program spends a fraction ${s} of its time in serial code on ${p} processors. What is the ${ask === 'gustafson' ? 'scaled speed-up (Gustafson: the problem grows with p)' : 'fixed-size speed-up (Amdahl)'}? (4 decimal places)`, r4(ask === 'gustafson' ? g : a),
      `Gustafson: p − s(p − 1) = ${r4(g)}. Amdahl, same s for a fixed problem: 1/(s + (1 − s)/p) = ${r4(a)}. Bigger problems are how supercomputers stay useful.`,
      `from fractions import Fraction as F\ns, p = F('${s}'), ${p}\n${ask === 'gustafson' ? 'serial, parallel = s, (1 - s) * p   # time on one processor of the work done by p in unit time\nprint(float((serial + parallel) / (s + (1 - s))))' : 'print(float(1 / (s + (1 - s) / p)))'}`, { tol: 0.0001, dp: 4 });
  }),

  SKILL('and.dp', 'Density-independent pixels', 'Android lays out in dp; px = dp × (dpi / 160).', t => {
    const dp = t.pick([8, 16, 24, 48, 56]), dpi = t.pick([120, 160, 240, 320, 480, 640]);
    return num(`A ${dp} dp button on a ${dpi} dpi screen: how many physical pixels wide is it?`, (dp * dpi) / 160,
      `px = dp × dpi/160 = ${dp} × ${dpi / 160} = ${(dp * dpi) / 160}. 48 dp is Android's minimum touch target.`,
      `from fractions import Fraction as F\ninches = F(${dp}, 160)\nprint(float(inches * ${dpi}))`, { tol: 0.01, dp: 1 });
  }),

  SKILL('and.frames', 'Frame budgets and jank', 'At 60 Hz each frame has 16.7 ms; a frame that takes longer drops one or more.', t => {
    const hz = t.pick([60, 90, 120]), times = Array.from({ length: 8 }, () => t.pick([4, 8, 10, 12, 15, 18, 22, 35, 40]));
    const budget = 1000 / hz, janky = times.filter(x => x > budget).length;
    return num(`On a ${hz} Hz display, frames took ${times.join(', ')} ms to render. How many missed the frame deadline?`, janky,
      `The budget is 1000/${hz} = ${budget.toFixed(1)} ms; ${janky} frames went over and were shown late (jank). Move work off the main thread to stay under it.`,
      `from fractions import Fraction as F\nprint(sum(1 for x in ${PY(times)} if F(x) > F(1000, ${hz})))`);
  }),

  SKILL('and.backoff', 'Retries and back-off', 'Exponential back-off spaces retries out so a struggling server can recover.', t => {
    const base = t.pick([10, 30]), k = t.int(2, 6), cap = t.pick([300, 18000]);
    let total = 0; for (let i = 0; i < k; i++) total += Math.min(base * 2 ** i, cap);
    return num(`WorkManager-style exponential back-off: the first retry waits ${base} s and each later wait doubles, capped at ${cap} s. How many seconds of waiting before the ${k + 1}th attempt?`, total,
      `Waits ${Array.from({ length: k }, (_, i) => Math.min(base * 2 ** i, cap)).join(' + ')} = ${total} s. Add jitter in production so clients do not retry in lock-step.`,
      `w, total = ${base}, 0\nfor _ in range(${k}):\n    total += min(w, ${cap}); w *= 2\nprint(total)`);
  }),

  SKILL('cr.otp', 'One-time pad reuse', 'Reuse a pad and c₁ ⊕ c₂ = m₁ ⊕ m₂ — the key cancels out.', t => {
    const m1 = Array.from({ length: 4 }, () => t.int(32, 126)), m2 = Array.from({ length: 4 }, () => t.int(32, 126)), key = Array.from({ length: 4 }, () => t.int(0, 255));
    const c1 = m1.map((x, i) => x ^ key[i]), c2 = m2.map((x, i) => x ^ key[i]), i = t.int(0, 3);
    return num(`Two messages were encrypted with the same one-time pad. Ciphertext bytes: c₁ = [${c1.join(', ')}], c₂ = [${c2.join(', ')}]. You learn m₁ = [${m1.join(', ')}]. What is byte ${i} of m₂?`, m2[i],
      `c₁ ⊕ c₂ = m₁ ⊕ m₂, so m₂ = c₁ ⊕ c₂ ⊕ m₁: ${c1[i]} ⊕ ${c2[i]} ⊕ ${m1[i]} = ${m2[i]}. The pad is "one-time" for exactly this reason.`,
      `c1, c2, m1 = ${PY(c1)}, ${PY(c2)}, ${PY(m1)}\nkey = [a ^ b for a, b in zip(c1, m1)]   # recover the pad itself\nprint(c2[${i}] ^ key[${i}])`);
  }),

  SKILL('cr.pkcs7', 'Padding and modes', 'PKCS#7 padding and how long a CBC ciphertext is.', t => {
    const len = t.int(1, 60), bs = 16;
    const pad = bs - (len % bs), ask = t.rng() < 0.5 ? 'pad' : 'len';
    return num(ask === 'pad' ? `A ${len}-byte message is padded with PKCS#7 for a 16-byte block cipher. How many padding bytes are added (each holding that count)?` : `A ${len}-byte message is encrypted with AES-CBC and PKCS#7 padding, with the 16-byte IV sent in front. How many bytes is the output?`, ask === 'pad' ? pad : 16 + len + pad,
      `PKCS#7 always adds 1–16 bytes so the length becomes a multiple of 16: ${pad} here${len % 16 === 0 ? ' — a full block, even though the message already fitted' : ''}. CBC output = IV (16) + padded message (${len + pad}) = ${16 + len + pad}.`,
      `m = bytes(${len})\np = 16 - len(m) % 16\npadded = m + bytes([p]) * p\n${ask === 'pad' ? 'print(p)' : 'print(16 + len(padded))'}`);
  }),

  SKILL('cr.dh', 'Diffie–Hellman', 'Agree a shared secret over a public channel: g^(ab) mod p.', t => {
    const p = t.pick([23, 29, 47, 59, 83]), g = t.pick([2, 3, 5]), a = t.int(2, p - 2), b = t.int(2, p - 2);
    const pw = (x, e) => { let r = 1; x %= p; for (let i = 0; i < e; i++) r = (r * x) % p; return r; };
    const A = pw(g, a), B = pw(g, b), s = pw(B, a);
    return num(`Diffie–Hellman with p = ${p}, g = ${g}. Alice's secret is a = ${a}, Bob's is b = ${b}. What shared secret do they compute?`, s,
      `Alice sends A = g^a mod p = ${A}; Bob sends B = g^b mod p = ${B}. Each computes the other's value to their own secret: B^a = A^b = ${s} (mod ${p}). Without authentication, a man in the middle can do this with both sides.`,
      `print(pow(pow(${g}, ${a}, ${p}), ${b}, ${p}))`);
  }),

  SKILL('cr.crt', 'The Chinese remainder theorem', 'Combine residues modulo coprime numbers — the trick inside fast RSA decryption.', t => {
    const m = t.pick([[3, 5], [5, 7], [4, 9], [7, 11], [3, 5, 7]]), x = t.int(1, m.reduce((a, b) => a * b, 1) - 1), r = m.map(k => x % k);
    return num(`Find the smallest non-negative x with ${m.map((k, i) => `x ≡ ${r[i]} (mod ${k})`).join(', ')}.`, x,
      `The moduli are pairwise coprime, so there is exactly one solution modulo ${m.reduce((a, b) => a * b, 1)}: x = ${x}. RSA-CRT decrypts modulo p and q separately and recombines this way, about 4× faster.`,
      `m, r = ${PY(m)}, ${PY(r)}\nprint(next(x for x in range(1000) if all(x % k == v for k, v in zip(m, r))))`);
  }),

  SKILL('cr.nonce', 'Nonce collisions', 'Random 96-bit GCM nonces collide by the birthday bound — and a repeat is catastrophic.', t => {
    const bits = t.pick([32, 48, 64, 96]), msgs = t.pick([2 ** 16, 2 ** 20, 2 ** 24, 2 ** 32]);
    const p = -Math.expm1(-(msgs * (msgs - 1)) / 2 / 2 ** bits);
    return num(`A key encrypts 2^${Math.log2(msgs)} messages, each with a fresh random ${bits}-bit nonce. Approximately what is the probability that two share a nonce? Give log₁₀ of it (2 decimal places).`, Math.round(Math.log10(p) * 100) / 100,
      `Birthday bound: p ≈ 1 − exp(−n(n−1)/2^(b+1)) = ${p.toExponential(3)}, so log₁₀ ≈ ${Math.log10(p).toFixed(2)}. NIST caps random-nonce GCM at 2^32 messages per key for this reason.`,
      `import math\nn, b = ${msgs}, ${bits}\nprint(math.log10(-math.expm1(-n * (n - 1) / 2 / 2 ** b)))`, { tol: 0.011, dp: 2 });
  }),
];
