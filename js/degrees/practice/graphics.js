/**
 * CS631 Computer Graphics — CS184-style geometry with exact answers:
 * barycentric coordinates and point-in-triangle tests, ray-sphere
 * intersection, homogeneous transforms, de Casteljau's algorithm, mesh
 * topology (Euler's formula) and Lambertian shading. CS2023 GIT-Rendering,
 * GIT-Geometric-Modeling, MSF-Linear 8.
 *
 * Checks: exact Fractions, solving the ray-sphere quadratic by bisection,
 * matrix products written out, the Bernstein polynomial form, and counting
 * the mesh's own vertices, edges and faces.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0.0001, dp: 4, explain, python, ...extra });
const PY = JSON.stringify;
const r4 = x => Math.round(x * 10000) / 10000;

export const GRAPHICS = [
  SKILL('gr.bary', 'Barycentric coordinates', 'Rasterisers test coverage and interpolate attributes with barycentric weights.', t => {
    const A = [0, 0], B = [t.int(4, 10), 0], C = [t.int(0, 8), t.int(4, 10)], P = [t.int(0, 8), t.int(0, 8)];
    const area = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
    const T = area(A, B, C), wA = area(P, B, C) / T, wB = area(A, P, C) / T, wC = area(A, B, P) / T;
    const which = t.pick(['α', 'β', 'γ', 'inside']);
    if (which === 'inside') {
      const inside = wA >= 0 && wB >= 0 && wC >= 0;
      return { kind: 'mc', q: `Triangle A(${A}), B(${B}), C(${C}). Is the point P(${P}) inside it (or on an edge)?`, options: inside ? ['Yes', 'No'] : ['No', 'Yes'], correct: 0,
        explain: `Barycentric weights (α, β, γ) = (${r4(wA)}, ${r4(wB)}, ${r4(wC)}); P is inside exactly when all three are ≥ 0.`,
        python: `from fractions import Fraction as F\nA, B, C, P = ${PY(A)}, ${PY(B)}, ${PY(C)}, ${PY(P)}\n# same side of every edge as the opposite vertex\ns = lambda p, q, r: (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])\nok = all(s(u, v, P) * s(u, v, w) >= 0 for u, v, w in ((A, B, C), (B, C, A), (C, A, B)))\nprint('Yes' if ok else 'No')` };
    }
    const w = { α: wA, β: wB, γ: wC }[which];
    return num(`Triangle A(${A}), B(${B}), C(${C}); point P(${P}). What is its barycentric weight ${which} (the weight on ${{ α: 'A', β: 'B', γ: 'C' }[which]})? (4 decimal places)`, r4(w),
      `Each weight is the area of the sub-triangle opposite its vertex over the whole area: (${r4(wA)}, ${r4(wB)}, ${r4(wC)}), summing to 1. Negative means P is outside across that edge.`,
      `from fractions import Fraction as F\nA, B, C, P = ${PY(A)}, ${PY(B)}, ${PY(C)}, ${PY(P)}\n# solve P = αA + βB + γC with α + β + γ = 1 by Cramer's rule\nm = [[A[0], B[0], C[0]], [A[1], B[1], C[1]], [1, 1, 1]]\nrhs = [P[0], P[1], 1]\ndet = lambda M: M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])\nD = det(m); i = ${PY(['α', 'β', 'γ'].indexOf(which))}\nmi = [[rhs[r] if c == i else m[r][c] for c in range(3)] for r in range(3)]\nprint(float(F(det(mi), D)))`);
  }),

  SKILL('gr.ray', 'Ray–sphere intersection', 'Where a ray first hits a sphere: solve |o + td − c|² = r².', t => {
    const c = [t.int(-2, 2), t.int(-2, 2), t.int(5, 10)], r = t.int(1, 3), d0 = [t.int(-1, 1) * 0.1, t.int(-1, 1) * 0.1, 1];
    const len = Math.hypot(...d0), d = d0.map(x => x / len), o = [0, 0, 0];
    const oc = o.map((x, i) => x - c[i]), b = 2 * d.reduce((s, x, i) => s + x * oc[i], 0), cc = oc.reduce((s, x) => s + x * x, 0) - r * r;
    const disc = b * b - 4 * cc;
    const hit = disc >= 0 ? (-b - Math.sqrt(disc)) / 2 : null;
    return num(`A ray starts at the origin with unit direction ≈ (${d.map(x => x.toFixed(4)).join(', ')}) (normalised from (${d0.join(', ')})). Sphere: centre (${c.join(', ')}), radius ${r}. At what distance t does it first hit the sphere? Answer −1 if it misses. (4 decimal places)`, hit == null ? -1 : r4(hit),
      hit == null ? `The discriminant b² − 4c = ${r4(disc)} < 0: no real root, a miss.` : `Substitute the ray into the sphere: t² + bt + c = 0 with b = ${r4(b)}, c = ${r4(cc)}. The smaller root is the first hit: t = ${r4(hit)}.`,
      `import math\nd0, c, r = ${PY(d0)}, ${PY(c)}, ${r}\nn = math.sqrt(sum(x * x for x in d0)); d = [x / n for x in d0]\nf = lambda t: sum((t * d[i] - c[i]) ** 2 for i in range(3)) - r * r\n# march to the first sign change, then bisect\nstep, t = 0.001, 0.0\nwhile t < 50 and f(t) > 0: t += step\nif t >= 50: print(-1)\nelse:\n    lo, hi = t - step, t\n    for _ in range(100):\n        m = (lo + hi) / 2\n        if f(m) > 0: lo = m\n        else: hi = m\n    print(hi)`, { tol: 0.0005 });
  }),

  SKILL('gr.transform', 'Homogeneous transforms', 'Translate, rotate and scale with 3×3 matrices — and why order matters.', t => {
    const p = [t.int(-3, 3), t.int(-3, 3)], s = t.pick([1, 2, 3]), th = t.pick([0, 90, 180, 270]), tx = t.int(-4, 4), ty = t.int(-4, 4);
    const order = t.rng() < 0.5 ? 'scale, then rotate, then translate' : 'translate, then rotate, then scale';
    const rot = ([x, y]) => { const c = Math.round(Math.cos(th * Math.PI / 180)), sn = Math.round(Math.sin(th * Math.PI / 180)); return [c * x - sn * y, sn * x + c * y]; };
    let q = [...p];
    if (order.startsWith('scale')) { q = q.map(v => v * s); q = rot(q); q = [q[0] + tx, q[1] + ty]; } else { q = [q[0] + tx, q[1] + ty]; q = rot(q); q = q.map(v => v * s); }
    const axis = t.pick(['x', 'y']);
    return num(`Apply to the point (${p.join(', ')}), in this order: ${order}, with scale ${s}, rotation ${th}° counter-clockwise about the origin, translation (${tx}, ${ty}). What is the resulting ${axis}?`, axis === 'x' ? q[0] : q[1],
      `Applying the steps in that order gives (${q.join(', ')}). As matrices the product is written right to left — M = T·R·S for "scale, then rotate, then translate".`,
      `import math\nc, s_ = round(math.cos(math.radians(${th}))), round(math.sin(math.radians(${th})))\nS = [[${s}, 0, 0], [0, ${s}, 0], [0, 0, 1]]\nR = [[c, -s_, 0], [s_, c, 0], [0, 0, 1]]\nT = [[1, 0, ${tx}], [0, 1, ${ty}], [0, 0, 1]]\nmul = lambda A, B: [[sum(A[i][k] * B[k][j] for k in range(3)) for j in range(3)] for i in range(3)]\nM = ${order.startsWith('scale') ? 'mul(T, mul(R, S))' : 'mul(S, mul(R, T))'}\nv = [sum(M[i][k] * x for k, x in enumerate([${p[0]}, ${p[1]}, 1])) for i in range(3)]\nprint(v[${axis === 'x' ? 0 : 1}])`, { tol: 0, dp: 0 });
  }),

  SKILL('gr.bezier', 'Bézier curves', "de Casteljau's algorithm: repeated linear interpolation between control points.", t => {
    const n = t.int(2, 3), P = Array.from({ length: n + 1 }, () => [t.int(0, 10), t.int(0, 10)]), u = t.pick([0.25, 0.5, 0.75, 0.2]);
    let pts = P.map(p => [...p]);
    while (pts.length > 1) pts = pts.slice(1).map((p, i) => [(1 - u) * pts[i][0] + u * p[0], (1 - u) * pts[i][1] + u * p[1]]);
    const axis = t.pick(['x', 'y']);
    return num(`A ${n === 2 ? 'quadratic' : 'cubic'} Bézier curve has control points ${P.map(p => `(${p.join(', ')})`).join(', ')}. What is the ${axis}-coordinate at u = ${u}? (4 decimal places)`, r4(axis === 'x' ? pts[0][0] : pts[0][1]),
      `de Casteljau: interpolate each pair of neighbours at u, repeat until one point remains: (${r4(pts[0][0])}, ${r4(pts[0][1])}). It always lies inside the control points' convex hull.`,
      `from fractions import Fraction as F\nfrom math import comb\nP, u = ${PY(P)}, F('${u}')\nn = len(P) - 1\n# the Bernstein form: Σ C(n,i) uⁱ(1−u)ⁿ⁻ⁱ Pᵢ\nprint(float(sum(comb(n, i) * u ** i * (1 - u) ** (n - i) * P[i][${axis === 'x' ? 0 : 1}] for i in range(n + 1))))`);
  }),

  SKILL('gr.euler', 'Mesh topology', "Euler's formula V − E + F = 2 − 2g ties a closed mesh's counts to its genus.", t => {
    const solids = { tetrahedron: [4, 6, 4], cube: [8, 12, 6], octahedron: [6, 12, 8], 'triangular prism': [6, 9, 5], 'square pyramid': [5, 8, 5] };
    const name = t.pick(Object.keys(solids)), [V, E, F] = solids[name], hide = t.pick(['V', 'E', 'F']);
    const ans = { V, E, F }[hide];
    const known = { V: `E = ${E}, F = ${F}`, E: `V = ${V}, F = ${F}`, F: `V = ${V}, E = ${E}` }[hide];
    return num(`A closed genus-0 mesh (a ${name}) has ${known}. What is ${hide}?`, ans,
      `V − E + F = 2 for a closed surface of genus 0: ${hide} = ${ans}. A half-edge mesh that breaks this has a topology bug.`,
      `# build the solid's faces and count its own vertices and edges\nsolids = {'tetrahedron': [(0,1,2),(0,1,3),(0,2,3),(1,2,3)], 'cube': [(0,1,2,3),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)], 'octahedron': [(a, b, c) for a in (0, 1) for b in (2, 3) for c in (4, 5)], 'triangular prism': [(0,1,2),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)], 'square pyramid': [(0,1,2,3),(0,1,4),(1,2,4),(2,3,4),(3,0,4)]}\nF = solids[${PY(name)}]\nV = {v for f in F for v in f}\nE = {frozenset((f[i], f[(i + 1) % len(f)])) for f in F for i in range(len(f))}\nprint({'V': len(V), 'E': len(E), 'F': len(F)}[${PY(hide)}])`, { tol: 0, dp: 0 });
  }),

  SKILL('gr.lambert', 'Diffuse shading', "Lambert's law: brightness ∝ max(0, n·l) — light at a glancing angle is spread thin.", t => {
    const nrm = [0, 0, 1], ang = t.pick([0, 30, 45, 60, 80, 100]), I = t.pick([1, 0.8, 2]), kd = t.pick([0.5, 0.7, 0.9]);
    const l = [Math.sin(ang * Math.PI / 180), 0, Math.cos(ang * Math.PI / 180)], val = kd * I * Math.max(0, l[2]);
    return num(`A surface with normal (0, 0, 1) and diffuse albedo ${kd} is lit by a light of intensity ${I} arriving ${ang}° from the normal. What is the diffuse radiance kd·I·max(0, n·l)? (4 decimal places)`, r4(val),
      `n·l = cos ${ang}° = ${r4(Math.cos(ang * Math.PI / 180))}; × ${kd} × ${I} = ${r4(val)}.${ang > 90 ? ' Light from behind contributes nothing.' : ''}`,
      `import math\n# integrate over a unit patch: a beam of cross-section 1 covers 1/cos θ of surface\nth = math.radians(${ang})\nirr = 0.0 if math.cos(th) <= 0 else ${I} / (1 / math.cos(th))\nprint(${kd} * irr)`);
  }),
];
