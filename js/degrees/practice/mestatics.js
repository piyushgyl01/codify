/**
 * Mechanical Engineering: statics and the mechanics of deformable bars
 * (8.01SC, Engineering Statics, FE Mechanical topics 6 and 8).
 *
 * Checks take another route: distributed loads broken into many small point
 * loads and the equilibrium equations solved about a different point, and
 * elongations integrated numerically along the bar.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));

export const MESTATICS = [
  SKILL('sta.beam', 'Beam reactions', 'For a simply supported beam, take moments about one support to find the other reaction, then sum vertical forces: ΣM = 0, ΣF = 0.', t => {
    const L = t.pick([4, 5, 6, 8, 10]), k = t.int(1, 2);
    const P = Array.from({ length: k }, () => t.pick([5, 8, 10, 12, 15, 20])), a = P.map(() => t.int(1, 2 * L - 1) / 2);
    const w = t.pick([0, 2, 3, 4, 5]), c = t.int(0, L - 2), d = t.int(c + 1, L), ask = t.pick(['A', 'B']);
    const tot = P.reduce((s, p) => s + p, 0) + w * (d - c);
    const RB = (P.reduce((s, p, i) => s + p * a[i], 0) + w * (d - c) * (c + d) / 2) / L, RA = tot - RB, R = ask === 'A' ? RA : RB;
    const loads = P.map((p, i) => `${p} kN at x = ${a[i]} m`).join(' and ');
    return num(`A ${L} m beam rests on a pin at A (x = 0) and a roller at B (x = ${L} m). It carries ${loads}${w ? `, and a uniform load of ${w} kN/m from x = ${c} m to x = ${d} m` : ''}. Ignoring its own weight, what is the vertical reaction at ${ask}, in kN? (4 significant figures)`, r4(R),
      `Moments about A: R_B·${L} = Σ Pᵢaᵢ${w ? ` + ${w}·${d - c}·${(c + d) / 2}` : ''}, so R_B = ${r4(RB)} kN. Vertical forces: R_A = ${r4(tot)} − R_B = ${r4(RA)} kN.`,
      `# break the distributed load into many small point loads, then solve both equilibrium equations, taking moments about x = L/3\nL, P, a, w, c, d = ${L}, ${JSON.stringify(P)}, ${JSON.stringify(a)}, ${w}, ${c}, ${d}\nN = 100000\nloads = list(zip(P, a)) + [(w * (d - c) / N, c + (i + 0.5) * (d - c) / N) for i in range(N)]\nx0 = L / 3\nF = sum(f for f, _ in loads); M = sum(f * (x - x0) for f, x in loads)\n# RA + RB = F and RA(0 - x0) + RB(L - x0) = M\nRB = (M + x0 * F) / L; RA = F - RB\nprint(${ask === 'A' ? 'RA' : 'RB'})`);
  }),

  SKILL('sol.axial', 'Axial deformation', 'A bar in tension stretches δ = ∫ P/(A(x)E) dx: PL/AE for a uniform bar, and 4PL/(πE d₁d₂) for one tapering from d₁ to d₂.', t => {
    const [name, E] = t.pick([['steel', 200], ['aluminium', 70], ['titanium', 110], ['brass', 100]]);
    const L = t.pick([0.5, 0.8, 1, 1.2, 1.5, 2]), P = t.pick([10, 20, 25, 40, 50, 80]), d1 = t.pick([10, 12, 16, 20]), d2 = d1 + t.pick([0, 4, 6, 8, 10]);
    const dl = 4 * P * 1e3 * L / (Math.PI * E * 1e9 * d1 * 1e-3 * d2 * 1e-3) * 1e3;
    const shape = d1 === d2 ? `a uniform ${name} rod ${d1} mm in diameter` : `a solid ${name} rod tapering uniformly from ${d1} mm diameter at one end to ${d2} mm at the other`;
    return num(`A ${L} m length of ${shape} (E = ${E} GPa) carries an axial tension of ${P} kN. How much does it stretch, in mm? (4 significant figures)`, r4(dl),
      `δ = ∫ P dx/(A(x)E). ${d1 === d2 ? `For a uniform rod that is PL/AE` : `For a linear taper it integrates to 4PL/(πE d₁d₂)`} = ${r4(dl)} mm.`,
      `import math\n# integrate the strain P/(A(x) E) along the rod with Simpson's rule\nP, L, E, d1, d2 = ${P} * 1e3, ${L}, ${E} * 1e9, ${d1} * 1e-3, ${d2} * 1e-3\nf = lambda x: P / (math.pi * (d1 + (d2 - d1) * x / L) ** 2 / 4 * E)\nn = 2000; h = L / n\ns = f(0) + f(L) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, n))\nprint(s * h / 3 * 1e3)`);
  }),
];
