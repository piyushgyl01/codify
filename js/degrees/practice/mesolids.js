/**
 * Mechanical Engineering: mechanics of materials (2.001, 16.001; FE
 * Mechanical topic 8 and 9.J).
 *
 * Checks take another route: wall forces bisected until the bars fit,
 * polar moments integrated over rings, bending moments scanned along the
 * beam, deflections integrated twice from the curvature, stress tensors
 * rotated and searched, principal stresses from the full 3-D tensor, buckling
 * loads by shooting on the fourth-order column equation, hoop stress from the
 * pressure integrated over a half-shell, crack lengths bisected, and
 * Castigliano deflections from a numerically differentiated strain energy.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const MATS = { steel: [200, 12e-6], aluminium: [70, 23e-6], brass: [100, 19e-6], copper: [117, 17e-6] };

export const MESOLIDS = [
  SKILL('sol.thermal', 'Thermal stress and indeterminate bars', 'A bar that cannot expand freely is squeezed: compatibility (total stretch = what the supports allow) gives the force; with rigid walls, σ = −EαΔT.', t => {
    const two = t.rng() < 0.5, names = Object.keys(MATS), n1 = t.pick(names), n2 = t.pick(names.filter(x => x !== n1));
    const segs = two ? [[n1, t.pick([200, 300, 400]), t.pick([20, 25, 30])], [n2, t.pick([200, 300, 400]), t.pick([20, 25, 30])]] : [[n1, t.pick([500, 800, 1000]), t.pick([20, 25, 30])]];
    const dT = t.pick([30, 40, 50, 60, 80]), free = segs.reduce((s, [m, L]) => s + MATS[m][1] * dT * L, 0);
    const gap = two ? 0 : t.pick([0, 0.1, 0.2].filter(g => g < free * 0.8)), flex = segs.reduce((s, [m, L, d]) => s + L / (MATS[m][0] * 1e3 * Math.PI * d * d / 4), 0);
    const F = Math.max(0, (free - gap) / flex), which = two ? t.int(0, 1) : 0, d = segs[which][2], sigma = F / (Math.PI * d * d / 4);
    const desc = segs.map(([m, L, dd]) => `a ${m} rod ${L} mm long and ${dd} mm in diameter`).join(' joined end to end with ');
    return num(`${desc[0].toUpperCase() + desc.slice(1)} sits between rigid walls${gap ? ` with a ${gap} mm gap at one end` : ', just touching both'}. It is heated by ${dT} °C. (E and α: steel 200 GPa, 12 × 10⁻⁶/°C; aluminium 70 GPa, 23 × 10⁻⁶; brass 100 GPa, 19 × 10⁻⁶; copper 117 GPa, 17 × 10⁻⁶.) What compressive stress develops in the ${segs[which][0]}, in MPa? (4 significant figures)`, r4(sigma),
      `Free expansion Σ αΔTL = ${r4(free)} mm${gap ? `, of which the gap absorbs ${gap}` : ''}. The wall force must squeeze back the rest: F = ${r4(free - gap)}/Σ L/(AE) = ${r4(F / 1000)} kN, so σ = F/A = ${r4(sigma)} MPa.`,
      `import math\n# bisect on the wall force until the heated bars exactly fill the space\nsegs, dT, gap = ${JSON.stringify(segs.map(([m, L, dd]) => [MATS[m][0] * 1e3, MATS[m][1], L, dd]))}, ${dT}, ${gap}\ngrow = lambda F: sum(a * dT * L - F * L / (E * math.pi * d * d / 4) for E, a, L, d in segs)\nlo, hi = 0.0, 1e8\nif grow(0) <= gap: hi = 0.0\nfor _ in range(300):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if grow(m) > gap else (lo, m)\nd = segs[${which}][3]\nprint(lo / (math.pi * d * d / 4))`);
  }),

  SKILL('sol.torsion', 'Torsion of shafts', 'A shaft carrying power P at angular speed ω has torque T = P/ω; it shears most at the surface, τ = Tc/J, and twists φ = Σ TL/(GJ).', t => {
    const P = t.pick([5, 10, 20, 50, 100]), N = t.pick([300, 600, 1200, 1800, 3000]), hollow = t.rng() < 0.4, d = t.pick([30, 40, 50, 60]), di = hollow ? d * t.pick([0.5, 0.6, 0.7]) : 0;
    const L = t.pick([0.5, 1, 1.5, 2]), G = 80, ask = t.pick(['tau', 'twist']), T = P * 1e3 / (N * 2 * Math.PI / 60);
    const J = Math.PI * (d ** 4 - di ** 4) / 32, tau = T * 1e3 * (d / 2) / J, phi = T * 1e3 * L * 1e3 / (G * 1e3 * J) * 180 / Math.PI;
    return num(`A ${hollow ? `hollow steel shaft (outside ${d} mm, inside ${di} mm)` : `solid steel shaft ${d} mm in diameter`}, ${L} m long, transmits ${P} kW at ${N} rpm (G = ${G} GPa). What is ${ask === 'tau' ? 'the maximum shear stress, in MPa' : 'the angle of twist over its length, in degrees'}? (4 significant figures)`, r4(ask === 'tau' ? tau : phi),
      `T = P/ω = ${r4(T)} N·m. J = π(d⁴ − dᵢ⁴)/32 = ${r4(J)} mm⁴. τ = Tc/J = ${r4(tau)} MPa; φ = TL/(GJ) = ${r4(phi)}°.`,
      `import math\n# integrate the polar moment over thin rings, then apply the torque\nP, N, d, di, L, G = ${P} * 1e3, ${N}, ${d}, ${di}, ${L} * 1e3, ${G} * 1e3\nT = P / (N * 2 * math.pi / 60) * 1e3  # N mm\nn = 20000; dr = (d - di) / 2 / n\nJ = sum(2 * math.pi * (di / 2 + (i + 0.5) * dr) ** 3 * dr for i in range(n))\nprint(${ask === 'tau' ? 'T * (d / 2) / J' : 'math.degrees(T * L / (G * J))'})`);
  }),

  SKILL('sol.bending', 'Bending stress in beams', 'Bending stress grows linearly from the neutral axis: σ = My/I, largest at the outer fibre where the moment is largest.', t => {
    const L = t.pick([2, 3, 4, 5, 6]), load = t.pick(['point', 'udl']), b = t.pick([50, 75, 100]), h = t.pick([100, 150, 200, 250]);
    const P = t.pick([5, 10, 20, 30]), a = load === 'point' ? t.int(1, 2 * L - 1) / 2 : 0, w = t.pick([2, 5, 8, 10]);
    const M = load === 'point' ? P * a * (L - a) / L : w * L * L / 8, I = b * h ** 3 / 12, sigma = M * 1e6 * (h / 2) / I;
    return num(`A simply supported ${L} m beam with a ${b} mm wide × ${h} mm deep rectangular section carries ${load === 'point' ? `a ${P} kN point load ${a} m from the left support` : `a uniform load of ${w} kN/m over its whole span`}. Ignoring self-weight, what is the largest bending stress, in MPa? (4 significant figures)`, r4(sigma),
      `M_max = ${load === 'point' ? 'Pab/L' : 'wL²/8'} = ${r4(M)} kN·m. I = bh³/12 = ${r4(I)} mm⁴. σ = M(h/2)/I = ${r4(sigma)} MPa.`,
      `# scan the bending moment along the beam from the reactions, and integrate I over thin strips\nL, b, h = ${L}, ${b}, ${h}\n${load === 'point' ? `P, a = ${P}, ${a}\nRA = P * (L - a) / L\nM = lambda x: RA * x - (P * (x - a) if x > a else 0.0)` : `w = ${w}\nRA = w * L / 2\nM = lambda x: RA * x - w * x * x / 2`}\nMmax = max(abs(M(L * i / 100000)) for i in range(100001))  # kN m\nn = 20000; dy = h / n\nI = sum(b * ((i + 0.5) * dy - h / 2) ** 2 * dy for i in range(n))\nprint(Mmax * 1e6 * (h / 2) / I)`);
  }),

  SKILL('sol.deflect', 'Beam deflection', 'Curvature is M/EI; integrating twice with the support conditions gives the deflection — PL³/48EI at the centre for a central point load, wL⁴/8EI at the tip of a uniformly loaded cantilever.', t => {
    const kind = t.pick(['ss-point', 'cant-udl', 'cant-point']), L = t.pick([1, 1.5, 2, 3, 4]), E = 200, b = t.pick([40, 50, 60]), h = t.pick([80, 100, 120, 150]);
    const I = b * h ** 3 / 12, EI = E * 1e3 * I; // N mm²
    let y, desc, py;
    if (kind === 'ss-point') {
      const P = t.pick([5, 10, 20]), a = L * t.pick([0.25, 0.3, 0.4, 0.5]), bb = Math.min(a, L - a), Lm = L * 1e3, bm = bb * 1e3, Pn = P * 1e3;
      y = Pn * bm * (Lm * Lm - bm * bm) ** 1.5 / (9 * Math.sqrt(3) * Lm * EI);
      desc = `simply supported over ${L} m, with a ${P} kN point load ${a} m from the left support`;
      py = `L, P, a = ${Lm}, ${Pn}, ${a * 1e3}\nRA = P * (L - a) / L\nM = lambda x: RA * x - (P * (x - a) if x > a else 0.0)\npinned = True`;
    } else if (kind === 'cant-udl') {
      const w = t.pick([1, 2, 5, 8]); y = w * (L * 1e3) ** 4 / (8 * EI);
      desc = `a ${L} m cantilever carrying ${w} kN/m along its whole length`;
      py = `L, w = ${L * 1e3}, ${w}\nM = lambda x: -w * (L - x) ** 2 / 2\npinned = False`;
    } else {
      const P = t.pick([2, 5, 10]); y = P * 1e3 * (L * 1e3) ** 3 / (3 * EI);
      desc = `a ${L} m cantilever with a ${P} kN load at its free end`;
      py = `L, P = ${L * 1e3}, ${P * 1e3}\nM = lambda x: -P * (L - x)\npinned = False`;
    }
    return num(`A steel beam (E = ${E} GPa) with a ${b} × ${h} mm rectangular section (bending about the strong axis) is ${desc}. What is its largest deflection, in mm? (4 significant figures)`, r4(y),
      `I = bh³/12 = ${r4(I)} mm⁴. ${kind === 'ss-point' ? 'For an off-centre point load the largest deflection is Pb(L² − b²)^(3/2)/(9√3 LEI), at x = √((L² − b²)/3)' : kind === 'cant-udl' ? 'Tip deflection wL⁴/8EI' : 'Tip deflection PL³/3EI'} = ${r4(y)} mm.`,
      `# integrate the curvature M/EI twice (trapezoid), then apply the support conditions\nEI = ${E * 1e3} * ${I}\n${py}\nn = 100000; dx = L / n\nslope = [0.0]; y = [0.0]\nfor i in range(n):\n    x0, x1 = i * dx, (i + 1) * dx\n    slope.append(slope[-1] + (M(x0) + M(x1)) / (2 * EI) * dx)\n    y.append(y[-1] + (slope[-2] + slope[-1]) / 2 * dx)\nif pinned:  # add the rigid rotation that brings the far support back to zero\n    y = [v - y[-1] * i / n for i, v in enumerate(y)]\nprint(max(abs(v) for v in y))`);
  }),

  SKILL('sol.mohr', 'Stress transformation: Mohr\'s circle', 'Rotating the axes turns (σx, σy, τxy) around a circle centred at (σx + σy)/2 with radius √(((σx − σy)/2)² + τxy²): principal stresses at its ends, the largest in-plane shear at its top.', t => {
    const sx = t.pick([-80, -40, 0, 20, 50, 80, 120]), sy = t.pick([-60, -20, 0, 30, 60, 100]), txy = t.pick([-50, -30, -20, 20, 40, 60]), ask = t.pick(['s1', 's2', 'tmax', 'theta']);
    const c = (sx + sy) / 2, R = Math.hypot((sx - sy) / 2, txy), th = t.pick([20, 30, 45, 60]), rad = th * Math.PI / 180;
    const sth = c + (sx - sy) / 2 * Math.cos(2 * rad) + txy * Math.sin(2 * rad);
    const what = { s1: 'the larger principal stress, in MPa', s2: 'the smaller principal stress, in MPa', tmax: 'the largest in-plane shear stress, in MPa', theta: `the normal stress on a face whose normal is ${th}° anticlockwise from x, in MPa` }[ask];
    return num(`At a point, σx = ${sx} MPa, σy = ${sy} MPa and τxy = ${txy} MPa (plane stress). What is ${what}? (4 significant figures)`, r4({ s1: c + R, s2: c - R, tmax: R, theta: sth }[ask]),
      `Centre ${r4(c)}, radius √(${r4((sx - sy) / 2)}² + ${txy}²) = ${r4(R)}. σ₁ = ${r4(c + R)}, σ₂ = ${r4(c - R)}, τ_max = ${r4(R)} MPa. On the ${th}° face: σ = c + ((σx − σy)/2) cos 2θ + τxy sin 2θ = ${r4(sth)} MPa.`,
      `import math\n# rotate the stress tensor and search the angle\nS = [[${sx}, ${txy}], [${txy}, ${sy}]]\ndef rot(th):\n    c, s = math.cos(th), math.sin(th)\n    n = (c, s); m = (-s, c)\n    sn = sum(n[i] * S[i][j] * n[j] for i in range(2) for j in range(2)); tn = sum(n[i] * S[i][j] * m[j] for i in range(2) for j in range(2))\n    return sn, tn\nangles = [math.pi * i / 200000 for i in range(200000)]\n${{ s1: 'print(max(rot(a)[0] for a in angles))', s2: 'print(min(rot(a)[0] for a in angles))', tmax: 'print(max(abs(rot(a)[1]) for a in angles))', theta: `print(rot(math.radians(${th}))[0])` }[ask]}`);
  }),

  SKILL('sol.vonmises', 'Combined loading and failure theories', 'A shaft in bending and torsion sees σ = 32M/πd³ and τ = 16T/πd³ at its surface; von Mises gives σ′ = √(σ² + 3τ²), Tresca 2τ_max = √(σ² + 4τ²).', t => {
    const d = t.pick([25, 30, 40, 50]), M = t.pick([100, 200, 400, 600, 800]), T = t.pick([100, 200, 300, 500, 800]), Sy = t.pick([250, 350, 450, 530]), theory = t.pick(['von Mises', 'Tresca']);
    const s = 32 * M * 1e3 / (Math.PI * d ** 3), tau = 16 * T * 1e3 / (Math.PI * d ** 3), eq = theory === 'von Mises' ? Math.sqrt(s * s + 3 * tau * tau) : Math.sqrt(s * s + 4 * tau * tau), n = Sy / eq;
    return num(`A ${d} mm solid steel shaft carries a bending moment of ${M} N·m and a torque of ${T} N·m. Its yield strength is ${Sy} MPa. By the ${theory} criterion, what is the factor of safety against yielding? (4 significant figures)`, r4(n),
      `σ = 32M/πd³ = ${r4(s)} MPa, τ = 16T/πd³ = ${r4(tau)} MPa. ${theory === 'von Mises' ? `σ′ = √(σ² + 3τ²)` : `σ₁ − σ₃ = √(σ² + 4τ²)`} = ${r4(eq)} MPa, so n = ${Sy}/${r4(eq)} = ${r4(n)}.`,
      `import math\n# principal stresses of the full 3-D tensor at the surface (Jacobi rotations), then the criterion\nd, M, T, Sy = ${d}, ${M} * 1e3, ${T} * 1e3, ${Sy}\ns = 32 * M / (math.pi * d ** 3); tau = 16 * T / (math.pi * d ** 3)\nA = [[s, tau, 0.0], [tau, 0.0, 0.0], [0.0, 0.0, 0.0]]\nfor _ in range(50):\n    for p in range(3):\n        for q in range(p + 1, 3):\n            if abs(A[p][q]) < 1e-15: continue\n            th = 0.5 * math.atan2(2 * A[p][q], A[q][q] - A[p][p]); c, sn = math.cos(th), math.sin(th)\n            R = [[1.0 if i == j else 0.0 for j in range(3)] for i in range(3)]; R[p][p] = R[q][q] = c; R[p][q] = sn; R[q][p] = -sn\n            A = [[sum(R[k][i] * A[k][l] * R[l][j] for k in range(3) for l in range(3)) for j in range(3)] for i in range(3)]\np1, p2, p3 = sorted(A[i][i] for i in range(3))[::-1]\nvm = math.sqrt(((p1 - p2) ** 2 + (p2 - p3) ** 2 + (p3 - p1) ** 2) / 2)\nprint(Sy / ${theory === 'von Mises' ? 'vm' : '(p1 - p3)'})`);
  }),

  SKILL('sol.buckling', 'Euler buckling of columns', 'A slender column buckles at P_cr = π²EI/(KL)², where the effective-length factor K is 1 pinned–pinned, 2 fixed–free, 0.699 fixed–pinned and 0.5 fixed–fixed.', t => {
    const [ends, K] = t.pick([['pinned at both ends', 1], ['fixed at the base and free at the top', 2], ['fixed at one end and pinned at the other', 0.6992], ['fixed at both ends', 0.5]]);
    const L = t.pick([1, 1.5, 2, 3, 4]), sec = t.pick(['round', 'rect']), E = t.pick([70, 200]), d = t.pick([30, 40, 50, 60]), b = t.pick([30, 40]), hh = t.pick([50, 60, 80]);
    const I = sec === 'round' ? Math.PI * d ** 4 / 64 : hh * b ** 3 / 12, P = Math.PI ** 2 * E * 1e3 * I / (K * L * 1e3) ** 2 / 1000;
    const code = { 1: 'pp', 2: 'ff', 0.6992: 'fp', 0.5: 'xx' }[K];
    return num(`A ${L} m ${E === 200 ? 'steel' : 'aluminium'} column (E = ${E} GPa) with a ${sec === 'round' ? `solid round section ${d} mm in diameter` : `${b} × ${hh} mm rectangular section`} is ${ends}. What is its Euler buckling load, in kN? (4 significant figures)`, r4(P),
      `I_min = ${sec === 'round' ? 'πd⁴/64' : 'hb³/12 (it buckles about the weak axis)'} = ${r4(I)} mm⁴. K = ${K}, so P_cr = π²EI/(KL)² = ${r4(P)} kN.`,
      `import math\n# shoot on E I y'''' + P y'' = 0 (with E I = L = 1): find the smallest p where the end conditions can be met\nends = '${code}'\ndef final(p, z):\n    f = lambda z: [z[1], z[2], z[3], -p * z[2]]\n    n = 400; h = 1.0 / n\n    for _ in range(n):\n        k1 = f(z); k2 = f([a + h / 2 * b for a, b in zip(z, k1)]); k3 = f([a + h / 2 * b for a, b in zip(z, k2)]); k4 = f([a + h * b for a, b in zip(z, k3)])\n        z = [a + h / 6 * (b + 2 * c + 2 * d + e) for a, b, c, d, e in zip(z, k1, k2, k3, k4)]\n    return z\ndef det(p):\n    free0 = {'pp': (1, 3), 'ff': (2, 3), 'fp': (2, 3), 'xx': (2, 3)}[ends]   # unknown initial derivatives\n    cols = []\n    for i in free0:\n        z0 = [0.0] * 4; z0[i] = 1.0; cols.append(final(p, z0))\n    rows = {'pp': lambda z: (z[0], z[2]), 'ff': lambda z: (z[2], z[3] + p * z[1]), 'fp': lambda z: (z[0], z[2]), 'xx': lambda z: (z[0], z[1])}[ends]\n    (a, c), (b, d) = rows(cols[0]), rows(cols[1])\n    return a * d - b * c\nps = [0.05 * i for i in range(1, 2000)]\nprev = det(ps[0])\nfor lo, hi in zip(ps, ps[1:]):\n    cur = det(hi)\n    if (prev > 0) != (cur > 0): break\n    prev = cur\nfor _ in range(60):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if (det(m) > 0) == (det(lo) > 0) else (lo, m)\nE, I, L = ${E} * 1e3, ${I}, ${L} * 1e3\nprint(lo * E * I / L ** 2 / 1000)`);
  }),

  SKILL('sol.vessel', 'Thin-walled pressure vessels', 'Cutting a cylinder lengthwise, the pressure on the half-shell is held by two wall strips: hoop stress σ_h = pr/t, twice the axial stress pr/2t.', t => {
    const p = t.pick([0.5, 1, 1.5, 2, 3]), D = t.pick([500, 800, 1000, 1500, 2000]), tw = t.pick([6, 8, 10, 12, 16]), allow = t.pick([120, 140, 160]), ask = t.pick(['hoop', 'axial', 'thick']);
    const hoop = p * D / (2 * tw), axial = p * D / (4 * tw), thick = p * D / (2 * allow);
    const what = { hoop: `the hoop stress in a ${tw} mm wall, in MPa`, axial: `the axial stress in a ${tw} mm wall, in MPa`, thick: `the smallest wall thickness that keeps the hoop stress at or below ${allow} MPa, in mm` }[ask];
    return num(`A closed cylindrical tank of inside diameter ${D} mm holds gas at ${p} MPa gauge. Treating the wall as thin, what is ${what}? (4 significant figures)`, r4({ hoop, axial, thick }[ask]),
      `σ_h = pD/2t = ${r4(hoop)} MPa, σ_a = pD/4t = ${r4(axial)} MPa. For σ_h ≤ ${allow}: t ≥ pD/(2·${allow}) = ${r4(thick)} mm.`,
      `import math\n# hoop: integrate the pressure on a half-shell (per mm of length) and share it between two wall strips\n# axial: the pressure on the end cap is carried by the ring of wall around it\np, D, t = ${p}, ${D}, ${tw}\nr = D / 2; n = 20000; h = math.pi / n\nf = lambda th: p * r * math.sin(th)\nforce = (f(0) + f(math.pi) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, n))) * h / 3\n${{ hoop: 'print(force / (2 * t))', axial: 'print(p * math.pi * r * r / (math.pi * D * t))', thick: `allow = ${allow}\nprint(force / (2 * allow))` }[ask]}`);
  }),

  SKILL('sol.fracture', 'Fracture: critical crack size', 'A crack of length a under stress σ has stress intensity K = Yσ√(πa); it runs when K reaches the toughness K_IC.', t => {
    const [mat, KIC] = t.pick([['4340 steel', 50], ['7075-T6 aluminium', 24], ['Ti-6Al-4V', 55], ['2024-T3 aluminium', 44]]);
    const kind = t.pick(['centre', 'edge']), Y = kind === 'centre' ? 1 : 1.12, sig = t.pick([100, 150, 200, 250, 300, 400]), ask = t.pick(['a', 'sigma']);
    const a = (KIC / (Y * sig)) ** 2 / Math.PI, a0 = t.pick([1, 2, 3, 5]), sc = KIC / (Y * Math.sqrt(Math.PI * a0 / 1000));
    const crack = kind === 'centre' ? 'a through-crack in the middle of a wide plate (Y = 1, a = half the crack length)' : 'an edge crack in a wide plate (Y = 1.12, a = the crack depth)';
    return num(`A ${mat} plate (K_IC = ${KIC} MPa√m) has ${crack}. ${ask === 'a' ? `Under a ${sig} MPa stress, at what crack size a does it fracture, in mm?` : `With a = ${a0} mm, what stress fractures it, in MPa?`} (4 significant figures)`, r4(ask === 'a' ? a * 1000 : sc),
      `K = Yσ√(πa) = K_IC. ${ask === 'a' ? `a = (K_IC/Yσ)²/π = ${r4(a * 1000)} mm` : `σ = K_IC/(Y√(πa)) = ${r4(sc)} MPa`}.`,
      `import math\n# bisect on the unknown until the stress intensity reaches the toughness\nK, Y = ${KIC}, ${Y}\n${ask === 'a' ? `s = ${sig}\nlo, hi = 0.0, 10.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if Y * s * math.sqrt(math.pi * m) < K else (lo, m)\nprint(lo * 1000)` : `a = ${a0} / 1000\nlo, hi = 0.0, 1e5\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if Y * m * math.sqrt(math.pi * a) < K else (lo, m)\nprint(lo)`}`);
  }),

  SKILL('sol.energy', 'Energy methods: Castigliano', 'The deflection under a load is the derivative of the strain energy with respect to that load: δ = ∂U/∂P, with U = ∫M²/(2EI) dx for bending.', t => {
    const a = t.pick([300, 400, 500, 600]), b = t.pick([200, 300, 400]), P = t.pick([200, 500, 1000]), d = t.pick([20, 25, 30]), E = 200;
    const I = Math.PI * d ** 4 / 64, EI = E * 1e3 * I, delta = P * b ** 3 / (3 * EI) + P * b * b * a / EI;
    return num(`An L-shaped steel bracket (E = ${E} GPa, solid round ${d} mm bar) is built in at a wall. Its first arm runs ${a} mm horizontally from the wall; its second arm hangs ${b} mm straight down from the end of the first. A ${P} N horizontal force, parallel to the first arm, pulls on the bottom tip. Counting bending only, how far does the tip move along the force, in mm? (4 significant figures)`, r4(delta),
      `Down the vertical arm M = Py (y from the tip); along the horizontal arm M = Pb throughout. U = ∫M²/2EI, so δ = ∂U/∂P = Pb³/3EI + Pb²a/EI = ${r4(delta)} mm (I = ${r4(I)} mm⁴).`,
      `import math\n# strain energy as a function of the load, integrated along both arms, then differentiated numerically\na, b, d, E = ${a}, ${b}, ${d}, ${E} * 1e3\nEI = E * math.pi * d ** 4 / 64; n = 20000\ndef U(P):\n    vert = sum((P * (i + 0.5) * b / n) ** 2 for i in range(n)) * (b / n)\n    horiz = (P * b) ** 2 * a\n    return (vert + horiz) / (2 * EI)\nP, h = ${P}, 1e-3 * ${P}\nprint((U(P + h) - U(P - h)) / (2 * h))`);
  }),
];
