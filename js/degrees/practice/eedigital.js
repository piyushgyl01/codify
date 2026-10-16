/**
 * Electrical Engineering: digital logic and hardware description (Lessons in
 * Electric Circuits vol. IV, 6.111, 6.004). FE Electrical and Computer:
 * Digital Systems.
 *
 * Checks take another route: minimal covers found by dynamic programming over
 * every implicant (not Quine–McCluskey's primes), and sequence detectors run
 * as KMP automata rather than by scanning the string.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const exact = (q, answer, explain, python) => ({ kind: 'num', q, answer, rtol: 0, tol: 0, dp: 0, explain, python });

/** Quine–McCluskey prime implicants of an on-set over n variables; cubes are [value, mask] with mask bits = don't care. */
const primes = (n, on) => {
  let level = [...new Set(on)].map(m => [m, 0]), all = [];
  while (level.length) {
    const used = new Set(), next = new Map();
    for (let i = 0; i < level.length; i++) for (let j = i + 1; j < level.length; j++) {
      const [a, ma] = level[i], [b, mb] = level[j];
      if (ma !== mb) continue;
      const d = a ^ b;
      if (d && !(d & (d - 1))) { next.set(`${a & ~d},${ma | d}`, [a & ~d, ma | d]); used.add(i); used.add(j); }
    }
    level.forEach((c, i) => { if (!used.has(i)) all.push(c); });
    level = [...next.values()];
  }
  return all;
};
const covers = ([v, m], x) => (x & ~m) === v;
const literals = (n, [, m]) => n - [...Array(n).keys()].filter(i => m >> i & 1).length;

export const EEDIGITAL = [
  SKILL('dig.sop', 'Minimal sum of products', 'Group adjacent 1s in a Karnaugh map into the largest power-of-two blocks; each block is one product term, and bigger blocks need fewer literals.', t => {
    const n = t.pick([3, 4]), N = 1 << n;
    let on;
    do on = [...Array(N).keys()].filter(() => t.rng() < 0.45); while (on.length < 2 || on.length > N - 2);
    const P = primes(n, on);
    let best = Infinity, bestSet = [];
    for (let s = 1; s < 1 << P.length; s++) {
      const chosen = P.filter((_, i) => s >> i & 1);
      if (!on.every(x => chosen.some(c => covers(c, x)))) continue;
      const lit = chosen.reduce((a, c) => a + literals(n, c), 0);
      if (lit < best) { best = lit; bestSet = chosen; }
    }
    const V = 'ABCD'.slice(0, n), term = ([v, m]) => [...V].map((ch, i) => { const b = n - 1 - i; return m >> b & 1 ? '' : (v >> b & 1 ? ch : ch + '′'); }).join('');
    return exact(`f(${[...V].join(', ')}) = Σm(${on.join(', ')}). How many literals are in a minimal sum-of-products form of f? (${V[0]} is the most significant bit.)`, best,
      `The prime implicants are ${P.map(term).join(', ')}; the cheapest set that covers every minterm is ${bestSet.map(term).join(' + ')}, with ${best} literals.`,
      `# every cube that lies inside the on-set is an implicant; dynamic programming over covered-minterm masks finds the fewest literals\nn, on = ${n}, ${JSON.stringify(on)}\nonset = set(on)\nimps = []\nfor mask in range(1 << n):\n    for v in range(1 << n):\n        if v & mask: continue\n        pts = [x for x in range(1 << n) if (x & ~mask) == v]\n        if all(x in onset for x in pts):\n            bits = sum(1 << on.index(x) for x in pts)\n            imps.append((bits, n - bin(mask).count('1')))\nfull = (1 << len(on)) - 1\nINF = 10 ** 9; dp = [INF] * (full + 1); dp[0] = 0\nfor s in range(full + 1):\n    if dp[s] == INF: continue\n    for bits, lit in imps:\n        t2 = s | bits\n        if dp[s] + lit < dp[t2]: dp[t2] = dp[s] + lit\nprint(dp[full])`);
  }),

  SKILL('dig.fsm', 'Sequence detectors', 'A detector for a bit pattern is a finite-state machine whose state is how much of the pattern it has just seen; overlapping matches count.', t => {
    const pat = Array.from({ length: t.int(3, 4) }, () => t.int(0, 1)).join(''), bits = Array.from({ length: t.int(16, 24) }, () => t.int(0, 1)).join('');
    let count = 0;
    for (let i = 0; i + pat.length <= bits.length; i++) if (bits.slice(i, i + pat.length) === pat) count++;
    return exact(`A Moore machine outputs 1 each time the last ${pat.length} input bits are ${pat} (overlaps allowed). For the input ${bits}, how many times does it output 1?`, count,
      `Slide a ${pat.length}-bit window along the input: it matches ${pat} ${count} time${count === 1 ? '' : 's'}. In hardware the state records the longest suffix that is also a prefix of ${pat}, so overlaps are caught.`,
      `# build the detector as a KMP automaton (state = length of the longest matching prefix) and run it\npat, s = '${pat}', '${bits}'\nfail = [0] * len(pat)\nk = 0\nfor i in range(1, len(pat)):\n    while k and pat[i] != pat[k]: k = fail[k - 1]\n    if pat[i] == pat[k]: k += 1\n    fail[i] = k\nstate = out = 0\nfor ch in s:\n    while state and (state == len(pat) or ch != pat[state]): state = fail[state - 1]\n    if ch == pat[state]: state += 1\n    if state == len(pat): out += 1\nprint(out)`);
  }),
];
