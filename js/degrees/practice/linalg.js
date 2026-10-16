/**
 * MATH210 Linear Algebra — 18.06-style computations with exact answers:
 * solving Ax = b, rank and the four subspaces, determinants, inverses,
 * projection and least squares, eigenvalues and powers, singular values and
 * a Markov chain's steady state. CS2023 MSF-Linear 1–8.
 *
 * Matrices are built so the answers are clean (a chosen solution, chosen
 * eigenvalues). Each question carries `python`: exact Fraction arithmetic
 * written separately, which prints the answer.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const mat = M => `[${M.map(r => `[${r.join(', ')}]`).join(', ')}]`;
const r4 = x => Math.round(x * 10000) / 10000;

const PY_FRAC = `from fractions import Fraction as F
def rref(M):
    M = [[F(x) for x in row] for row in M]; r = 0
    for c in range(len(M[0])):
        p = next((i for i in range(r, len(M)) if M[i][c] != 0), None)
        if p is None: continue
        M[r], M[p] = M[p], M[r]
        M[r] = [x / M[r][c] for x in M[r]]
        for i in range(len(M)):
            if i != r and M[i][c] != 0:
                M[i] = [a - M[i][c] * b for a, b in zip(M[i], M[r])]
        r += 1
    return M, r
def det(M):
    M = [[F(x) for x in row] for row in M]; n = len(M); d = F(1)
    for c in range(n):
        p = next((i for i in range(c, n) if M[i][c] != 0), None)
        if p is None: return F(0)
        if p != c: M[c], M[p] = M[p], M[c]; d = -d
        d *= M[c][c]
        for i in range(c + 1, n):
            f = M[i][c] / M[c][c]
            M[i] = [a - f * b for a, b in zip(M[i], M[c])]
    return d
`;

const detJs = M => (M.length === 2 ? M[0][0] * M[1][1] - M[0][1] * M[1][0]
  : M[0].reduce((s, a, j) => s + (j % 2 ? -1 : 1) * a * detJs(M.slice(1).map(r => r.filter((_, k) => k !== j))), 0));
const mul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, a, k) => s + a * B[k][j], 0)));
function rankJs(M) {
  const A = M.map(r => [...r]); let rank = 0;
  for (let c = 0; c < A[0].length && rank < A.length; c++) {
    const p = A.findIndex((r, i) => i >= rank && Math.abs(r[c]) > 1e-9);
    if (p < 0) continue;
    [A[rank], A[p]] = [A[p], A[rank]];
    for (let i = 0; i < A.length; i++) if (i !== rank) { const f = A[i][c] / A[rank][c]; A[i] = A[i].map((x, k) => x - f * A[rank][k]); }
    rank++;
  }
  return rank;
}
/** An invertible integer matrix: a product of unit triangular ones, so det = ±1 and the inverse is integral too. */
function unimodular(t, n) {
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : i > j ? t.int(-2, 2) : 0)));
  const U = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : j > i ? t.int(-2, 2) : 0)));
  return mul(L, U);
}

export const LINALG = [
  SKILL('la.solve', 'Solving Ax = b', 'Elimination on a 3×3 system to a unique solution.', t => {
    let A; do { A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => t.int(-4, 5))); } while (detJs(A) === 0);
    const x = [t.int(-5, 5), t.int(-5, 5), t.int(-5, 5)], b = A.map(r => r.reduce((s, a, k) => s + a * x[k], 0)), k = t.int(0, 2);
    return num(`Solve Ax = b for A = ${mat(A)} and b = [${b.join(', ')}]. What is x${k + 1}?`, x[k],
      `Eliminate to upper-triangular form and back-substitute: x = (${x.join(', ')}). det A = ${detJs(A)} ≠ 0, so the solution is unique.`,
      `${PY_FRAC}A, b = ${PY(A)}, ${PY(b)}\nR, _ = rref([row + [bi] for row, bi in zip(A, b)])\nprint(R[${k}][3])`);
  }),

  SKILL('la.rank', 'Rank and the four subspaces', 'Rank from elimination, and the dimensions of all four fundamental subspaces.', t => {
    const m = t.pick([3, 4]), n = t.pick([3, 4]), r = t.int(1, Math.min(m, n));
    const B = Array.from({ length: r }, () => Array.from({ length: n }, () => t.int(-3, 3)));
    const C = Array.from({ length: m }, () => Array.from({ length: r }, () => t.int(-2, 2)));
    const A = mul(C, B), rank = rankJs(A);
    const field = t.pick(['rank', 'N(A)', 'N(Aᵀ)', 'C(Aᵀ)']);
    const ans = { rank, 'N(A)': n - rank, 'N(Aᵀ)': m - rank, 'C(Aᵀ)': rank }[field];
    return num(`A = ${mat(A)} (${m}×${n}). ${field === 'rank' ? 'What is its rank?' : `What is the dimension of ${field === 'N(A)' ? 'its nullspace N(A)' : field === 'N(Aᵀ)' ? 'its left nullspace N(Aᵀ)' : 'its row space C(Aᵀ)'}?`}`, ans,
      `Row reduce: rank r = ${rank}. Then dim C(A) = dim C(Aᵀ) = ${rank}, dim N(A) = n − r = ${n - rank}, dim N(Aᵀ) = m − r = ${m - rank}.`,
      `${PY_FRAC}A = ${PY(A)}\n_, r = rref(A)\nm, n = ${m}, ${n}\nprint({'rank': r, 'N(A)': n - r, 'N(Aᵀ)': m - r, 'C(Aᵀ)': r}[${PY(field)}])`);
  }),

  SKILL('la.det', 'Determinants', 'Compute a determinant, and know what row operations do to it.', t => {
    const A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => t.int(-4, 4))), d = detJs(A);
    if (t.rng() < 0.5) return num(`What is the determinant of ${mat(A)}?`, d,
      `Expand along the first row (or eliminate and multiply the pivots): det = ${d}.`, `${PY_FRAC}print(det(${PY(A)}))`);
    const k = t.pick([2, 3, -2]), swap = t.rng() < 0.5;
    const B = A.map(r => [...r]); B[0] = B[0].map(x => x * k); if (swap) [B[1], B[2]] = [B[2], B[1]];
    const dB = d * k * (swap ? -1 : 1);
    return num(`det A = ${d} for A = ${mat(A)}. B is A with row 1 multiplied by ${k}${swap ? ' and rows 2 and 3 swapped' : ''}. What is det B?`, dB,
      `Scaling a row by ${k} multiplies the determinant by ${k}${swap ? '; a row swap flips its sign' : ''}: ${d} × ${k}${swap ? ' × (−1)' : ''} = ${dB}.`,
      `${PY_FRAC}A = ${PY(A)}\nB = [row[:] for row in A]\nB[0] = [x * ${k} for x in B[0]]\n${swap ? 'B[1], B[2] = B[2], B[1]\n' : ''}print(det(B))`);
  }),

  SKILL('la.inverse', 'Inverses', 'The inverse of a 2×2 or 3×3 matrix, entry by entry.', t => {
    const n = t.pick([2, 3]), A = unimodular(t, n), i = t.int(0, n - 1), j = t.int(0, n - 1);
    // An integer inverse, found by Gauss–Jordan.
    const aug = A.map((r, k) => [...r, ...Array.from({ length: n }, (_, l) => (l === k ? 1 : 0))]);
    for (let c = 0; c < n; c++) {
      const p = aug.findIndex((r, k) => k >= c && r[c] !== 0); [aug[c], aug[p]] = [aug[p], aug[c]];
      const pv = aug[c][c]; aug[c] = aug[c].map(x => x / pv);
      for (let k = 0; k < n; k++) if (k !== c) { const f = aug[k][c]; aug[k] = aug[k].map((x, l) => x - f * aug[c][l]); }
    }
    const inv = aug.map(r => r.slice(n).map(x => Math.round(x)));
    return num(`A = ${mat(A)}. What is the entry in row ${i + 1}, column ${j + 1} of A⁻¹?`, inv[i][j],
      `Gauss–Jordan on [A | I] gives A⁻¹ = ${mat(inv)}. Check: A·A⁻¹ = I. (det A = ${detJs(A)}, which is why the inverse has integer entries.)`,
      `${PY_FRAC}A = ${PY(A)}\nn = len(A)\nR, _ = rref([row + [1 if k == i else 0 for k in range(n)] for i, row in enumerate(A)])\nprint(R[${i}][n + ${j}])`);
  }),

  SKILL('la.ls', 'Projection and least squares', 'Project onto a line, and fit the best line through points by the normal equations.', t => {
    if (t.rng() < 0.4) {
      const a = [t.int(-3, 4), t.int(-3, 4), t.int(1, 4)], b = [t.int(-4, 5), t.int(-4, 5), t.int(-4, 5)], k = t.int(0, 2);
      const c = a.reduce((s, x, i) => s + x * b[i], 0) / a.reduce((s, x) => s + x * x, 0), p = a.map(x => x * c);
      return num(`Project b = (${b.join(', ')}) onto the line through a = (${a.join(', ')}). What is component ${k + 1} of the projection p? (4 decimal places)`, r4(p[k]),
        `p = (aᵀb / aᵀa) a = (${a.reduce((s, x, i) => s + x * b[i], 0)} / ${a.reduce((s, x) => s + x * x, 0)}) a, so p${k + 1} = ${r4(p[k])}. The error b − p is perpendicular to a.`,
        `from fractions import Fraction as F\na, b = ${PY(a)}, ${PY(b)}\nc = F(sum(x * y for x, y in zip(a, b)), sum(x * x for x in a))\nprint(float(c * a[${k}]))`, { tol: 0.0001, dp: 4 });
    }
    const ts = [0, 1, 2, 3].slice(0, t.int(3, 4)), ys = ts.map(x => t.int(-3, 8));
    const n = ts.length, st = ts.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0), stt = ts.reduce((a, b) => a + b * b, 0), sty = ts.reduce((a, b, i) => a + b * ys[i], 0);
    const D = (sty * n - st * sy) / (n * stt - st * st), C = (sy - D * st) / n, field = t.pick(['slope', 'intercept']);
    return num(`Fit the least-squares line y = C + Dt through the points ${ts.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}. What is the ${field === 'slope' ? 'slope D' : 'intercept C'}? (4 decimal places)`, r4(field === 'slope' ? D : C),
      `Solve the normal equations AᵀA x̂ = Aᵀb with columns [1, t]: [[${n}, ${st}], [${st}, ${stt}]] [C, D] = [${sy}, ${sty}]. So C = ${r4(C)}, D = ${r4(D)}.`,
      `${PY_FRAC}ts, ys = ${PY(ts)}, ${PY(ys)}\nA = [[1, x] for x in ts]\nAtA = [[sum(A[k][i] * A[k][j] for k in range(len(ts))) for j in range(2)] for i in range(2)]\nAtb = [sum(A[k][i] * ys[k] for k in range(len(ts))) for i in range(2)]\nR, _ = rref([AtA[0] + [Atb[0]], AtA[1] + [Atb[1]]])\nprint(float(R[${field === 'slope' ? 1 : 0}][2]))`, { tol: 0.0001, dp: 4 });
  }),

  SKILL('la.eig2', 'Eigenvalues and powers', 'Eigenvalues of a 2×2 matrix, and Aᵏ through diagonalisation.', t => {
    const l1 = t.int(-3, 4), l2 = t.int(-3, 4), P = unimodular(t, 2), Pi = [[P[1][1], -P[0][1]], [-P[1][0], P[0][0]]];
    const detP = detJs(P), A = mul(mul(P, [[l1, 0], [0, l2]]), Pi).map(r => r.map(x => x * detP));
    if (t.rng() < 0.5) {
      const big = Math.max(l1, l2);
      return num(`What is the larger eigenvalue of A = ${mat(A)}?`, big,
        `The eigenvalues solve λ² − (trace)λ + det = 0: trace ${A[0][0] + A[1][1]}, det ${detJs(A)}, so λ = ${l1} and ${l2}. The larger is ${big}.`,
        `import math\nA = ${PY(A)}\ntr, dt = A[0][0] + A[1][1], A[0][0] * A[1][1] - A[0][1] * A[1][0]\nprint(round((tr + math.sqrt(tr * tr - 4 * dt)) / 2, 9))`);
    }
    const k = t.int(3, 5), Ak = [A, A, A, A, A].slice(0, k).reduce((M, B) => mul(M, B)), i = t.int(0, 1), j = t.int(0, 1);
    return num(`A = ${mat(A)} has eigenvalues ${l1} and ${l2}. What is entry (${i + 1}, ${j + 1}) of A^${k}?`, Ak[i][j],
      `Diagonalise A = PΛP⁻¹, so A^${k} = PΛ^${k}P⁻¹ with Λ^${k} = diag(${l1 ** k}, ${l2 ** k}). That gives A^${k} = ${mat(Ak)}.`,
      `A = ${PY(A)}\nM = [[1, 0], [0, 1]]\nfor _ in range(${k}):\n    M = [[sum(M[i][x] * A[x][j] for x in range(2)) for j in range(2)] for i in range(2)]\nprint(M[${i}][${j}])`);
  }),

  SKILL('la.svd', 'Singular values', 'The singular values of A are the square roots of the eigenvalues of AᵀA.', t => {
    const A = [[t.int(-3, 4), t.int(-3, 4)], [t.int(-3, 4), t.int(-3, 4)]];
    const AtA = mul([[A[0][0], A[1][0]], [A[0][1], A[1][1]]], A), tr = AtA[0][0] + AtA[1][1], dt = detJs(AtA);
    const s1 = Math.sqrt((tr + Math.sqrt(tr * tr - 4 * dt)) / 2);
    return num(`What is the largest singular value σ₁ of A = ${mat(A)}? (4 decimal places)`, r4(s1),
      `AᵀA = ${mat(AtA)}; its eigenvalues are (${tr} ± √(${tr}² − 4·${dt})) / 2. σ₁ is the square root of the larger: ${r4(s1)}. It is also the most A can stretch a unit vector.`,
      `A = ${PY(A)}\n# power iteration on AᵀA\nM = [[sum(A[k][i] * A[k][j] for k in range(2)) for j in range(2)] for i in range(2)]\nv = [1.0, 0.7]\nfor _ in range(2000):\n    w = [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]\n    n = (w[0] ** 2 + w[1] ** 2) ** 0.5\n    if n == 0: break\n    v = [w[0] / n, w[1] / n]\nlam = v[0] * (M[0][0] * v[0] + M[0][1] * v[1]) + v[1] * (M[1][0] * v[0] + M[1][1] * v[1])\nprint(max(lam, 0) ** 0.5)`, { tol: 0.0002, dp: 4 });
  }),

  SKILL('la.markov', 'Markov chains and steady states', 'The steady state of a Markov matrix is its eigenvector for λ = 1 — the idea behind PageRank.', t => {
    const p = t.pick([0.1, 0.2, 0.3, 0.4]), q = t.pick([0.1, 0.2, 0.3, 0.5]);
    const pi1 = q / (p + q);
    return num(`A two-state chain moves from state 1 to state 2 with probability ${p}, and from state 2 to state 1 with probability ${q}. In the long run, what fraction of the time is it in state 1? (4 decimal places)`, r4(pi1),
      `The steady state solves πP = π: π₁·${p} = π₂·${q}, with π₁ + π₂ = 1, so π₁ = ${q} / (${p} + ${q}) = ${r4(pi1)}.`,
      `P = [[1 - ${p}, ${p}], [${q}, 1 - ${q}]]\npi = [1.0, 0.0]\nfor _ in range(5000):\n    pi = [pi[0] * P[0][0] + pi[1] * P[1][0], pi[0] * P[0][1] + pi[1] * P[1][1]]\nprint(pi[0])`, { tol: 0.0001, dp: 4 });
  }),
];
