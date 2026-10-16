/**
 * Mathematics: abstract linear algebra and groups. Characteristic
 * polynomials, rank–nullity, definiteness of quadratic forms and Jordan
 * structure (Linear Algebra II); orders of elements, subgroups of cyclic
 * groups, homomorphisms, units, permutation parity and dihedral groups
 * (Abstract Algebra I). QAA MSOR 3.10, 3.14; GRE Mathematics: Algebra.
 *
 * Checks: the characteristic polynomial interpolated from det(λI − A) at four
 * points; rank from the largest non-zero minor; eigenvalues by Jacobi
 * rotations; Jordan blocks from the ranks of (A − λI)ᵏ; every group property
 * by brute force over the elements.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a, b) => (a / gcd(a, b)) * b;
const mat = A => `[${A.map(r => `[${r.join(', ')}]`).join(', ')}]`;
const mul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
const det3 = M => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
/** Fraction-free elimination rank (Bareiss), for the generator's own answer. */
const rankOf = A0 => {
  const A = A0.map(r => [...r]); let rank = 0, prev = 1;
  for (let c = 0; c < A[0].length && rank < A.length; c++) {
    const p = A.findIndex((r, i) => i >= rank && r[c] !== 0); if (p < 0) continue;
    [A[rank], A[p]] = [A[p], A[rank]];
    for (let i = rank + 1; i < A.length; i++) { for (let j = c + 1; j < A[0].length; j++) A[i][j] = (A[rank][c] * A[i][j] - A[i][c] * A[rank][j]) / prev; A[i][c] = 0; }
    prev = A[rank][c]; rank++;
  }
  return rank;
};
/** An integer matrix with determinant 1, so P·J·P⁻¹ stays integral. */
const unimodular = t => mul([[1, 0, 0], [t.int(-2, 2), 1, 0], [t.int(-1, 1), t.int(-2, 2), 1]], [[1, t.int(-2, 2), t.int(-1, 1)], [0, 1, t.int(-2, 2)], [0, 0, 1]]);
const inv3 = M => { const d = det3(M), C = (i, j) => { const m = M.filter((_, r) => r !== i).map(r => r.filter((_, k) => k !== j)); return ((i + j) % 2 ? -1 : 1) * (m[0][0] * m[1][1] - m[0][1] * m[1][0]); }; return [0, 1, 2].map(i => [0, 1, 2].map(j => C(j, i) / d)); };

export const MATHALG = [
  SKILL('la2.charpoly', 'Characteristic polynomials', 'det(λI − A) = λ³ − (tr A)λ² + c₁λ − det A, where c₁ sums the principal 2×2 minors.', t => {
    const A = [0, 1, 2].map(() => [0, 1, 2].map(() => t.int(-3, 3))), which = t.pick(['λ²', 'λ', 'constant']);
    const tr = A[0][0] + A[1][1] + A[2][2], m2 = (i, j) => A[i][i] * A[j][j] - A[i][j] * A[j][i], c1 = m2(0, 1) + m2(0, 2) + m2(1, 2), d = det3(A);
    const v = { 'λ²': -tr, λ: c1, constant: -d }[which];
    return num(`A = ${mat(A)}. In det(λI − A) = λ³ + aλ² + bλ + c, what is the coefficient of ${which === 'constant' ? 'the constant term' : which}?`, v,
      `det(λI − A) = λ³ − (tr A)λ² + (sum of principal 2×2 minors)λ − det A = λ³ − ${tr}λ² + ${c1}λ − ${d}.`,
      `from fractions import Fraction as F\nA = ${PY(A)}\ndet = lambda M: M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])\np = lambda l: det([[(l if i == j else 0) - A[i][j] for j in range(3)] for i in range(3)])\n# interpolate the cubic from four values: p(l) = l^3 + a l^2 + b l + c\nv = [p(l) - l ** 3 for l in range(4)]  # a l^2 + b l + c at l = 0..3\nc = v[0]; a = F(v[2] - 2 * v[1] + v[0], 2); b = v[1] - c - a\nprint(int(${{ 'λ²': 'a', λ: 'b', constant: 'c' }[which]}))`);
  }),

  SKILL('la2.ranknull', 'Rank and nullity', 'dim ker T + dim im T = dim of the domain.', t => {
    const m = t.int(3, 4), n = t.int(3, 5), r = t.int(1, Math.min(m, n));
    const B = Array.from({ length: m }, () => Array.from({ length: r }, () => t.int(-2, 2))), C = Array.from({ length: r }, () => Array.from({ length: n }, () => t.int(-2, 2)));
    const A = mul(B, C), rank = rankOf(A), ask = t.pick(['rank', 'nullity']);
    return num(`T: ℝ^${n} → ℝ^${m} has matrix ${mat(A)}. What is ${ask === 'rank' ? 'its rank (dim im T)' : 'its nullity (dim ker T)'}?`, ask === 'rank' ? rank : n - rank,
      `Row-reduce: rank ${rank}. By rank–nullity, dim ker T = ${n} − ${rank} = ${n - rank}.`,
      `from itertools import combinations\nfrom fractions import Fraction as F\nA = ${PY(A)}\ndef det(M):\n    M = [[F(x) for x in r] for r in M]; n = len(M); d = F(1)\n    for c in range(n):\n        p = next((i for i in range(c, n) if M[i][c] != 0), None)\n        if p is None: return 0\n        if p != c: M[c], M[p] = M[p], M[c]; d = -d\n        d *= M[c][c]\n        for i in range(c + 1, n):\n            f = M[i][c] / M[c][c]\n            M[i] = [a - f * b for a, b in zip(M[i], M[c])]\n    return d\n# rank = the size of the largest non-zero minor\nrk = max([k for k in range(1, min(len(A), len(A[0])) + 1) if any(det([[A[i][j] for j in cs] for i in rs]) != 0 for rs in combinations(range(len(A)), k) for cs in combinations(range(len(A[0])), k))] or [0])\nprint(${ask === 'rank' ? 'rk' : `${n} - rk`})`);
  }),

  SKILL('la2.definite', 'Quadratic forms', 'xᵀAx is positive definite when every eigenvalue of the symmetric A is positive.', t => {
    const n = t.pick([2, 3]); let A;
    do { const L = Array.from({ length: n }, () => Array.from({ length: n }, () => t.int(-2, 2))); A = L.map((r, i) => r.map((_, j) => L[i][j] + L[j][i])); for (let i = 0; i < n; i++) A[i][i] += t.int(-3, 6); } while (n === 3 ? det3(A) === 0 : A[0][0] * A[1][1] - A[0][1] ** 2 === 0);
    const m1 = A[0][0], m2 = A[0][0] * A[1][1] - A[0][1] * A[1][0], m3 = n === 3 ? det3(A) : null;
    const minors = n === 3 ? [m1, m2, m3] : [m1, m2];
    const kind = minors.every(x => x > 0) ? 'Positive definite' : minors.every((x, i) => (i % 2 ? x > 0 : x < 0)) ? 'Negative definite' : 'Indefinite';
    return { kind: 'mc', q: `Classify the quadratic form xᵀAx with A = ${mat(A)} (A is invertible).`, options: [kind, ...['Positive definite', 'Negative definite', 'Indefinite'].filter(o => o !== kind)], correct: 0,
      explain: `Leading principal minors: ${minors.join(', ')}. Sylvester: all positive → positive definite; alternating starting negative → negative definite; otherwise (with det ≠ 0) indefinite.`,
      python: `import math\nA = [[float(x) for x in r] for r in ${PY(A)}]\nn = len(A)\n# Jacobi eigenvalue rotations\nfor _ in range(200):\n    p, q = max(((i, j) for i in range(n) for j in range(i + 1, n)), key=lambda ij: abs(A[ij[0]][ij[1]]))\n    if abs(A[p][q]) < 1e-14: break\n    th = 0.5 * math.atan2(2 * A[p][q], A[q][q] - A[p][p]); c, s = math.cos(th), math.sin(th)\n    for k in range(n):\n        akp, akq = A[k][p], A[k][q]; A[k][p], A[k][q] = c * akp - s * akq, s * akp + c * akq\n    for k in range(n):\n        apk, aqk = A[p][k], A[q][k]; A[p][k], A[q][k] = c * apk - s * aqk, s * apk + c * aqk\nev = [A[i][i] for i in range(n)]\nprint('Positive definite' if min(ev) > 0 else 'Negative definite' if max(ev) < 0 else 'Indefinite')` };
  }),

  SKILL('la2.jordan', 'Jordan form', 'The largest Jordan block for λ is the power at which the ranks of (A − λI)ᵏ stop falling.', t => {
    const lam = t.int(-2, 3), sizes = t.pick([[3], [2, 1], [1, 1, 1]]), J = [[lam, 0, 0], [0, lam, 0], [0, 0, lam]];
    if (sizes[0] >= 2) J[0][1] = 1; if (sizes[0] === 3) J[1][2] = 1;
    const P = unimodular(t), A = mul(mul(P, J), inv3(P)).map(r => r.map(x => Math.round(x)));
    const ask = t.rng() < 0.5 ? 'largest' : 'count';
    return num(`A = ${mat(A)} has the single eigenvalue ${lam}. ${ask === 'largest' ? 'What is the size of its largest Jordan block?' : 'How many Jordan blocks does it have (the geometric multiplicity)?'}`, ask === 'largest' ? sizes[0] : sizes.length,
      `N = A − ${lam}I has rank ${3 - sizes.length}, so there are ${sizes.length} block${sizes.length > 1 ? 's' : ''}; the powers of N vanish at k = ${sizes[0]}, the largest block. Blocks: ${sizes.join(' + ')}.`,
      `from fractions import Fraction as F\nA = ${PY(A)}\nN = [[F(A[i][j] - (${lam} if i == j else 0)) for j in range(3)] for i in range(3)]\ndef rank(M):\n    M = [r[:] for r in M]; r = 0\n    for c in range(3):\n        p = next((i for i in range(r, 3) if M[i][c] != 0), None)\n        if p is None: continue\n        M[r], M[p] = M[p], M[r]\n        for i in range(3):\n            if i != r: f = M[i][c] / M[r][c]; M[i] = [a - f * b for a, b in zip(M[i], M[r])]\n        r += 1\n    return r\nmm = lambda X, Y: [[sum(X[i][k] * Y[k][j] for k in range(3)) for j in range(3)] for i in range(3)]\nranks, P = [], N\nfor k in range(1, 5): ranks.append(rank(P)); P = mm(P, N)\n${ask === 'largest' ? 'print(next(k + 1 for k in range(4) if ranks[k] == 0))' : 'print(3 - ranks[0])'}`);
  }),

  SKILL('alg.order', 'Orders of elements', 'In ℤₙ the order of k is n / gcd(n, k); a permutation\'s order is the lcm of its cycle lengths.', t => {
    if (t.rng() < 0.5) {
      const n = t.int(6, 40), k = t.int(1, n - 1);
      return num(`What is the order of ${k} in the additive group ℤ_${n}?`, n / gcd(n, k),
        `n / gcd(n, k) = ${n} / ${gcd(n, k)} = ${n / gcd(n, k)}: the smallest m with m·${k} ≡ 0 (mod ${n}).`,
        `print(next(m for m in range(1, ${n} + 1) if m * ${k} % ${n} == 0))`);
    }
    const n = t.int(5, 9), perm = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = t.int(0, i); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    const seen = new Set(), cyc = [];
    for (let i = 0; i < n; i++) if (!seen.has(i)) { let c = 0, j = i; while (!seen.has(j)) { seen.add(j); j = perm[j]; c++; } cyc.push(c); }
    const ord = cyc.reduce(lcm, 1);
    return num(`The permutation of {1, …, ${n}} sends i to the i-th entry of [${perm.map(x => x + 1).join(', ')}]. What is its order?`, ord,
      `Its cycle lengths are ${cyc.sort((a, b) => b - a).join(', ')}; the order is their lcm, ${ord}.`,
      `p = ${PY(perm)}\nq, k = p[:], 1\nwhile q != list(range(len(p))): q = [p[x] for x in q]; k += 1\nprint(k)`);
  }),

  SKILL('alg.subgroups', 'Subgroups of cyclic groups', 'ℤₙ has exactly one subgroup of each order dividing n.', t => {
    const n = t.pick([12, 18, 20, 24, 30, 36, 42, 60]), ask = t.rng() < 0.5 ? 'count' : 'gen';
    const divs = [...Array(n).keys()].map(i => i + 1).filter(d => n % d === 0), d = t.pick(divs.filter(x => x > 1 && x < n));
    if (ask === 'count') return num(`How many subgroups does ℤ_${n} have?`, divs.length,
      `One for each divisor of ${n}: ${divs.join(', ')} — ${divs.length} in all.`,
      `n = ${n}\nprint(len({frozenset(k * m % n for m in range(n)) for k in range(n)}))`);
    const phi = [...Array(d).keys()].filter(k => gcd(k, d) === 1).length;
    return num(`ℤ_${n} has one subgroup of order ${d}. How many of its elements generate that subgroup?`, phi,
      `The subgroup is cyclic of order ${d}, generated by ${n / d}; its generators are the elements of order exactly ${d}: φ(${d}) = ${phi}.`,
      `from math import gcd\nn, d = ${n}, ${d}\nprint(sum(1 for k in range(n) if n // gcd(n, k) == d))`);
  }),

  SKILL('alg.homs', 'Homomorphisms', 'A homomorphism ℤₘ → ℤₙ is fixed by where 1 goes, and 1 must go to an element whose order divides m.', t => {
    const m = t.int(2, 30), n = t.int(2, 30);
    return num(`How many group homomorphisms are there from ℤ_${m} to ℤ_${n}?`, gcd(m, n),
      `φ(1) = a must satisfy m·a ≡ 0 (mod ${n}); there are gcd(${m}, ${n}) = ${gcd(m, n)} such a.`,
      `m, n = ${m}, ${n}\n# try every candidate map x -> a*x and check it respects addition mod m\nprint(sum(1 for a in range(n) if all((a * ((x + y) % m)) % n == (a * x + a * y) % n for x in range(m) for y in range(m))))`);
  }),

  SKILL('alg.units', 'Units modulo n', 'U(n) has φ(n) elements; an element\'s order divides φ(n).', t => {
    const n = t.pick([7, 9, 10, 11, 13, 14, 15, 16, 18, 20, 21]), units = [...Array(n).keys()].filter(k => gcd(k, n) === 1);
    if (t.rng() < 0.5) return num(`How many elements does the group of units U(${n}) have?`, units.length,
      `U(${n}) = the residues coprime to ${n}: ${units.join(', ')} — φ(${n}) = ${units.length}.`,
      `print(sum(1 for k in range(1, ${n}) if any(k * j % ${n} == 1 for j in range(1, ${n}))))`);
    const a = t.pick(units.filter(x => x > 1)); let o = 1, p = a % n; while (p !== 1) { p = (p * a) % n; o++; }
    return num(`What is the order of ${a} in U(${n})?`, o,
      `Powers of ${a} mod ${n} reach 1 at the ${o}th; ${o} divides φ(${n}) = ${units.length}, as Lagrange requires.`,
      `print(next(k for k in range(1, ${n}) if pow(${a}, k, ${n}) == 1))`);
  }),

  SKILL('alg.sign', 'Permutation parity', 'A permutation is even or odd by the parity of its transpositions — or of its inversions.', t => {
    const n = t.int(4, 7), perm = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = t.int(0, i); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    const seen = new Set(); let trans = 0;
    for (let i = 0; i < n; i++) if (!seen.has(i)) { let c = 0, j = i; while (!seen.has(j)) { seen.add(j); j = perm[j]; c++; } trans += c - 1; }
    const sign = trans % 2 ? 'Odd' : 'Even';
    return { kind: 'mc', q: `Is the permutation [${perm.map(x => x + 1).join(', ')}] of {1, …, ${n}} even or odd?`, options: [sign, sign === 'Odd' ? 'Even' : 'Odd'], correct: 0,
      explain: `A k-cycle is k − 1 transpositions; summing over its cycles gives ${trans}, which is ${sign.toLowerCase()}. It lies ${sign === 'Even' ? 'in' : 'outside'} A_${n}.`,
      python: `p = ${PY(perm)}\ninv = sum(1 for i in range(len(p)) for j in range(i + 1, len(p)) if p[i] > p[j])\nprint('Odd' if inv % 2 else 'Even')` };
  }),

  SKILL('alg.dihedral', 'Dihedral groups', 'Dₙ, the symmetries of a regular n-gon, has 2n elements: n rotations and n reflections.', t => {
    const n = t.int(3, 10), ask = t.pick(['order2', 'center']);
    const v = ask === 'order2' ? (n % 2 ? n : n + 1) : (n % 2 ? 1 : 2);
    return num(ask === 'order2' ? `How many elements of order 2 does D_${n} (symmetries of a regular ${n}-gon, order ${2 * n}) have?` : `How many elements are in the centre of D_${n}?`, v,
      ask === 'order2' ? `All ${n} reflections have order 2${n % 2 ? '' : `, and so does the half-turn r^${n / 2}`}: ${v}.` : `${n % 2 ? 'Only the identity commutes with everything.' : `The identity and the half-turn r^${n / 2}.`}`,
      `n = ${n}\n# realise D_n as permutations of the polygon's vertices\nrot = [tuple((i + k) % n for i in range(n)) for k in range(n)]\nref = [tuple((k - i) % n for i in range(n)) for k in range(n)]\nG = rot + ref\nI = tuple(range(n))\nc = lambda a, b: tuple(a[b[i]] for i in range(n))\n${ask === 'order2' ? 'print(sum(1 for g in G if g != I and c(g, g) == I))' : 'print(sum(1 for g in G if all(c(g, h) == c(h, g) for h in G)))'}`);
  }),
];
