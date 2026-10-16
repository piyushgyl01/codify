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
  SKILL('alg2.gf', 'Finite fields', 'GF(2ᵏ) = 𝔽₂[x]/(p(x)) for an irreducible p: every non-zero element has an inverse.', t => {
    const k = t.pick([3, 4]), poly = k === 3 ? 0b1011 : 0b10011, a = t.int(2, (1 << k) - 1);
    const mulGF = (x, y) => { let r = 0; while (y) { if (y & 1) r ^= x; y >>= 1; x <<= 1; if (x & (1 << k)) x ^= poly; } return r; };
    let inv = 1; for (let c = 1; c < 1 << k; c++) if (mulGF(a, c) === 1) inv = c;
    const bits = v => v.toString(2).padStart(k, '0'), polyTxt = k === 3 ? 'x³ + x + 1' : 'x⁴ + x + 1';
    return num(`In GF(2^${k}) = 𝔽₂[x]/(${polyTxt}), elements are bit strings of coefficients (highest power first). What is the inverse of ${bits(a)}, as an integer (its bits read in binary)?`, inv,
      `Extended Euclid on polynomials over 𝔽₂ (or a search, since the field has ${(1 << k) - 1} non-zero elements) gives ${bits(inv)} = ${inv}: ${bits(a)} · ${bits(inv)} ≡ 1 mod ${polyTxt}.`,
      `# a^(2^k - 2) is the inverse in a field of 2^k elements (Lagrange on the multiplicative group)\nk, poly, a = ${k}, ${poly}, ${a}\ndef mul(x, y):\n    r = 0\n    for i in range(k):\n        if (y >> i) & 1: r ^= x << i\n    for i in range(2 * k - 2, k - 1, -1):\n        if (r >> i) & 1: r ^= poly << (i - k)\n    return r\nr, b, e = 1, a, 2 ** k - 2\nwhile e:\n    if e & 1: r = mul(r, b)\n    b = mul(b, b); e >>= 1\nprint(r)`);
  }),

  SKILL('alg2.irred', 'Irreducibility mod p', 'A quadratic or cubic over 𝔽ₚ is irreducible exactly when it has no root there.', t => {
    const p = t.pick([2, 3, 5, 7]), deg = t.pick([2, 3]), c = Array.from({ length: deg }, () => t.int(0, p - 1));
    const f = x => { let v = 1; for (let i = deg - 1; i >= 0; i--) v = (v * x + c[i]) % p; return v; };
    // monic: x^deg + c[deg-1] x^(deg-1) + … + c[0]; evaluate by Horner from the leading 1
    const ev = x => { let v = 1; for (let i = deg - 1; i >= 0; i--) v = (v * x + c[i]) % p; return v; };
    const roots = [...Array(p).keys()].filter(x => ev(x) === 0).length, irr = roots === 0;
    const txt = `x${deg === 3 ? '³' : '²'}${c.slice().reverse().map((v, i) => { const e = deg - 1 - i; return v ? ` + ${v}${e ? `x${e > 1 ? '²' : ''}` : ''}` : ''; }).join('')}`;
    return { kind: 'mc', q: `Is ${txt} irreducible over 𝔽_${p}?`, options: irr ? ['Yes', 'No'] : ['No', 'Yes'], correct: 0,
      explain: irr ? `It has no root in 𝔽_${p}; a reducible polynomial of degree ${deg} would have a linear factor, hence a root.` : `It has ${roots} root${roots > 1 ? 's' : ''} in 𝔽_${p}, so it has a linear factor.`,
      python: `from itertools import product\np, c = ${p}, ${PY(c)}\nf = [*c, 1]  # coefficients from x^0 up, monic\ndef mulpoly(a, b):\n    r = [0] * (len(a) + len(b) - 1)\n    for i, x in enumerate(a):\n        for j, y in enumerate(b): r[i + j] = (r[i + j] + x * y) % p\n    return r\n# try every product of two monic factors of positive degree\nn = len(f) - 1\nfactors = any(mulpoly([*a, 1], [*b, 1]) == f for d in range(1, n) for a in product(range(p), repeat=d) for b in product(range(p), repeat=n - d))\nprint('No' if factors else 'Yes')` };
  }),

  SKILL('alg2.degree', 'Degrees of field extensions', '[ℚ(√a, √b) : ℚ] is 4 unless √b already lies in ℚ(√a); the tower law multiplies degrees.', t => {
    const sqfree = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
    const a = t.pick(sqfree), b = t.rng() < 0.3 ? a * t.pick([4, 9]) : t.pick(sqfree.filter(x => x !== a));
    const core = n => { let m = n; for (const q of [2, 3, 5, 7, 11, 13]) while (m % (q * q) === 0) m /= q * q; return m; };
    const same = core(a) === core(b) || core(a * b) === 1;
    const deg = same ? 2 : 4;
    return num(`What is the degree [ℚ(√${a}, √${b}) : ℚ]?`, deg,
      same ? `√${b} = ${core(b) === core(a) ? `${Math.sqrt(b / a)}√${a}` : '…'} already lies in ℚ(√${a}), so the degree is 2.` : `√${b} ∉ ℚ(√${a}) (${a}·${b} is not a square), so by the tower law the degree is 2·2 = 4, with basis 1, √${a}, √${b}, √${a * b}.`,
      `from fractions import Fraction as F\nfrom itertools import product\na, b = ${a}, ${b}\n# √b lies in Q(√a) iff b = (p + q√a)^2 for rationals p, q, i.e. 2pq = 0 and p² + a q² = b\nsq = lambda n: int(round(n ** 0.5)) ** 2 == n\ninside = sq(b) or (b % a == 0 and sq(b // a)) or sq(a * b)\nprint(2 if inside else 4)`, { tol: 0, dp: 0 });
  }),

  SKILL('alg2.cyclotomic', 'Cyclotomic fields', 'ℚ(ζₙ) has degree φ(n): its Galois group is (ℤ/nℤ)ˣ, one automorphism per primitive n-th root of unity.', t => {
    const n = t.pick([5, 7, 8, 9, 10, 12, 15, 16, 18, 20]);
    const phi = [...Array(n).keys()].filter(k => gcd(k, n) === 1).length;
    return num(`What is the order of the Galois group of ℚ(ζ_${n}) over ℚ, where ζ_${n} is a primitive ${n}th root of unity?`, phi,
      `Each automorphism sends ζ to another primitive ${n}th root, ζᵏ with gcd(k, ${n}) = 1; there are φ(${n}) = ${phi}, and the group is (ℤ/${n}ℤ)ˣ.`,
      `import cmath, math\nn = ${n}\n# count the n-th roots of unity whose powers reach 1 first at exactly n\nroots = [cmath.exp(2j * math.pi * k / n) for k in range(n)]\nprimitive = sum(1 for z in roots if all(abs(z ** m - 1) > 1e-9 for m in range(1, n)))\nprint(primitive)`);
  }),
  SKILL('nt.legendre', 'Quadratic residues', 'The Legendre symbol (a/p) is 1 when a is a non-zero square mod p, −1 when it is not — and Euler\'s criterion computes it as a^{(p−1)/2}.', t => {
    const p = t.pick([7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]), a = t.int(2, p - 1);
    let e = 1; for (let i = 0; i < (p - 1) / 2; i++) e = (e * a) % p;
    const v = e === 1 ? 1 : -1;
    return num(`What is the Legendre symbol (${a}/${p})? Answer 1 or −1.`, v,
      `Euler's criterion: ${a}^${(p - 1) / 2} ≡ ${e === 1 ? 1 : p - 1} (mod ${p}), so (${a}/${p}) = ${v}. ${v === 1 ? `${a} is a square mod ${p}.` : `${a} is not a square mod ${p}.`}`,
      `p, a = ${p}, ${a}\nprint(1 if any(x * x % p == a for x in range(1, p)) else -1)`);
  }),

  SKILL('nt.twosquares', 'Sums of two squares', 'A prime p is a sum of two squares exactly when p = 2 or p ≡ 1 (mod 4) — it splits in the Gaussian integers.', t => {
    const p = t.pick([5, 13, 17, 29, 37, 41, 53, 61, 73, 89, 97, 101, 7, 11, 19, 23, 31, 43]);
    let a = 0; for (let x = 1; x * x < p; x++) { const y2 = p - x * x, y = Math.round(Math.sqrt(y2)); if (y * y === y2 && x <= y) { a = x; break; } }
    if (!a) return num(`The prime ${p} is ${p % 4} mod 4. In how many ways can it be written as x² + y² with 0 < x ≤ y?`, 0,
      `p ≡ 3 (mod 4): squares are 0 or 1 mod 4, so a sum of two squares is never 3 mod 4. It stays prime in ℤ[i].`,
      `p = ${p}\nprint(sum(1 for x in range(1, p) for y in range(x, p) if x * x + y * y == p))`);
    return num(`The prime ${p} ≡ 1 (mod 4) is a sum of two squares x² + y² with 0 < x ≤ y. What is x?`, a,
      `${p} = ${a}² + ${Math.round(Math.sqrt(p - a * a))}², so it factors in ℤ[i] as (${a} + ${Math.round(Math.sqrt(p - a * a))}i)(${a} − ${Math.round(Math.sqrt(p - a * a))}i). By Fermat's theorem the representation is unique.`,
      `p = ${p}\nprint(next(x for x in range(1, p) for y in range(x, p) if x * x + y * y == p))`);
  }),

  SKILL('nt.pell', "Pell's equation", 'x² − d y² = 1 has infinitely many solutions, all powers of the smallest one — the fundamental unit of ℤ[√d].', t => {
    const d = t.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13]);
    let x = 0, y = 0; for (y = 1; ; y++) { const x2 = 1 + d * y * y, r = Math.round(Math.sqrt(x2)); if (r * r === x2) { x = r; break; } }
    return num(`What is the smallest x > 1 in a solution of x² − ${d}y² = 1 with y > 0?`, x,
      `Searching y = 1, 2, … (or expanding √${d} as a continued fraction) gives ${x}² − ${d}·${y}² = 1. Every other solution comes from powers of ${x} + ${y}√${d}.`,
      `from fractions import Fraction as F\nimport math\nd = ${d}\n# continued fraction of sqrt(d); the convergents p/q eventually satisfy p^2 - d q^2 = 1\nm, dd, a0 = 0, 1, math.isqrt(d)\na = a0; p0, p1, q0, q1 = 1, a0, 0, 1\nwhile p1 * p1 - d * q1 * q1 != 1:\n    m = dd * a - m; dd = (d - m * m) // dd; a = (a0 + m) // dd\n    p0, p1 = p1, a * p1 + p0; q0, q1 = q1, a * q1 + q0\nprint(p1)`);
  }),

  SKILL('nt.disc', 'Discriminants of quadratic fields', 'The ring of integers of ℚ(√d), d square-free, has discriminant d if d ≡ 1 (mod 4) and 4d otherwise.', t => {
    const d = t.pick([-1, -2, -3, -5, -7, -11, 2, 3, 5, 6, 7, 10, 13, 17, 21]);
    const v = ((d % 4) + 4) % 4 === 1 ? d : 4 * d;
    return num(`What is the discriminant of the ring of integers of ℚ(√${d})?`, v,
      ((d % 4) + 4) % 4 === 1 ? `${d} ≡ 1 (mod 4), so the integers are ℤ[(1 + √${d})/2], with discriminant ${d}.` : `${d} ≢ 1 (mod 4), so the integers are ℤ[√${d}], with discriminant 4·${d} = ${v}.`,
      `d = ${d}\n# is (1 + √d)/2 an algebraic integer? its minimal polynomial is x^2 - x + (1 - d)/4\nhalf_integral = (1 - d) % 4 == 0\n# discriminant = det of the trace form on the integral basis\nimport fractions\nif half_integral:\n    # basis 1, w with w = (1+√d)/2: Tr(1)=2, Tr(w)=1, Tr(w^2)=(1+d)/2\n    print(int(2 * fractions.Fraction(1 + d, 2) - 1))\nelse:\n    # basis 1, √d: Tr(1)=2, Tr(√d)=0, Tr(d)=2d\n    print(2 * 2 * d - 0)`);
  }),

  SKILL('rep.classes', 'Conjugacy classes and representations', 'A finite group has as many irreducible complex representations as conjugacy classes; for Sₙ that is the number of partitions of n.', t => {
    const n = t.int(2, 6), part = [1, 1, 2, 3, 5, 7, 11][n];
    return num(`How many irreducible complex representations does the symmetric group S_${n} have?`, part,
      `Conjugacy classes of S_${n} are cycle types — partitions of ${n} — and there are p(${n}) = ${part}. The number of irreducibles equals the number of classes.`,
      `from itertools import permutations\nn = ${n}\nG = list(permutations(range(n)))\ncomp = lambda a, b: tuple(a[b[i]] for i in range(n))\ninv = lambda a: tuple(sorted(range(n), key=lambda i: a[i]))\nseen, classes = set(), 0\nfor g in G:\n    if g in seen: continue\n    classes += 1\n    seen |= {comp(comp(h, g), inv(h)) for h in G}\nprint(classes)`);
  }),

  SKILL('rep.dims', 'Dimensions of irreducible representations', 'The squares of the irreducible dimensions add up to the order of the group.', t => {
    const groups = [['S₃', 6, [1, 1, 2]], ['D₄ (order 8)', 8, [1, 1, 1, 1, 2]], ['Q₈', 8, [1, 1, 1, 1, 2]], ['A₄', 12, [1, 1, 1, 3]], ['S₄', 24, [1, 1, 2, 3, 3]], ['D₅ (order 10)', 10, [1, 1, 2, 2]]];
    const [name, order, dims] = t.pick(groups), hide = t.int(0, dims.length - 1), known = dims.filter((_, i) => i !== hide);
    return num(`${name} has order ${order} and ${dims.length} irreducible complex representations. ${dims.length - 1} of them have dimensions ${known.join(', ')}. What is the dimension of the last?`, dims[hide],
      `Σ dᵢ² = |G|: ${order} − (${known.map(x => `${x}²`).join(' + ')}) = ${dims[hide] ** 2}, so the missing dimension is ${dims[hide]}.`,
      `import math\nprint(math.isqrt(${order} - sum(x * x for x in ${PY(known)})))`);
  }),

  SKILL('ag.bezout', 'Bézout\'s theorem', 'Two conics meet in 4 points over ℂ counted with multiplicity; how many you see over ℝ depends on the shapes.', t => {
    let a, b; do { a = t.int(1, 4); b = t.int(1, 4); } while (a === b);
    const r = t.int(1, 4);
    // u = x², v = y² solve u + v = r², u/a² + v/b² = 1
    const det = 1 / (b * b) - 1 / (a * a), v = (1 - (r * r) / (a * a)) / det, u = r * r - v;
    const eps = 1e-9, real = u > eps && v > eps ? 4 : (Math.abs(u) <= eps && v > eps) || (Math.abs(v) <= eps && u > eps) ? 2 : 0;
    return num(`How many real points do the circle x² + y² = ${r * r} and the ellipse x²/${a * a} + y²/${b * b} = 1 have in common?`, real,
      `Put u = x², v = y²: u + v = ${r * r} and u/${a * a} + v/${b * b} = 1 give u = ${Math.round(u * 1e4) / 1e4}, v = ${Math.round(v * 1e4) / 1e4}. ${real === 4 ? 'Both positive: four real points (±x, ±y).' : real === 2 ? 'One is zero: two real points, each a tangency counted twice.' : 'A negative value: no real points.'} Bézout always gives 2·2 = 4 over ℂ, counted with multiplicity.`,
      `import math\na, b, r = ${a}, ${b}, ${r}\ng = lambda t: (r * math.cos(t)) ** 2 / a ** 2 + (r * math.sin(t)) ** 2 / b ** 2 - 1\nN = 400000\nvals = [g(2 * math.pi * k / N) for k in range(N)]\nzeros = sum(1 for k in range(N) if abs(vals[k]) < 1e-12)\ncross = sum(1 for k in range(N) if vals[k] * vals[(k + 1) % N] < 0)\nprint(cross + zeros)`);
  }),

  SKILL('ag.monomials', 'Spaces of polynomials', 'Polynomials of degree ≤ d in n variables form a space of dimension C(n + d, d).', t => {
    const n = t.int(1, 4), d = t.int(1, 6), C = (x, y) => { let r = 1; for (let i = 1; i <= y; i++) r = (r * (x - y + i)) / i; return Math.round(r); };
    return num(`What is the dimension of the space of polynomials in ${n} variable${n > 1 ? 's' : ''} of total degree at most ${d}?`, C(n + d, d),
      `Monomials x₁^{e₁}…x_${n}^{e_${n}} with Σeᵢ ≤ ${d}: stars and bars gives C(${n} + ${d}, ${d}) = ${C(n + d, d)}.`,
      `from itertools import product\nprint(sum(1 for e in product(range(${d} + 1), repeat=${n}) if sum(e) <= ${d}))`);
  }),
];
