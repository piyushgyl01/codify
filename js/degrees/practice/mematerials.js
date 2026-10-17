/**
 * Mechanical Engineering: chemistry and materials (3.091SC, OpenStax
 * Chemistry 2e, DoITPoMS; FE Mechanical topic 9).
 *
 * Checks take another route: bond energies minimised numerically, densities
 * from counting atoms in a block of cells, diffusion profiles from a
 * finite-difference simulation, phase compositions bisected on the phase
 * boundaries, beams sized by bisection on a numerically integrated deflection,
 * cell voltages from the equilibrium constant, and composites as stacks of
 * fibre and matrix layers.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const sci = x => { const [m, e] = x.toExponential(2).split('e'); return `${m} × 10^${+e}`; };
const erf = z => { let s = 0, term = z; for (let n = 0; n < 120; n++) { s += term / (2 * n + 1); term *= -z * z / (n + 1); } return 2 / Math.sqrt(Math.PI) * s; };
const NA = 6.02214076e23, F = 96485.33212, R = 8.314462618;

export const MEMATERIALS = [
  SKILL('mat.bond', 'Bond energy and spacing', 'Net bond energy E(r) = −A/r + B/rⁿ: attraction plus short-range repulsion. The spacing r₀ sits where dE/dr = 0, and E(r₀) is the bonding energy.', t => {
    const n = t.pick([8, 9, 10]), A = 1.436, guess = t.pick([0.24, 0.26, 0.28, 0.3, 0.32]);
    const B = Number((A * guess ** (n - 1) / n).toPrecision(3)), r0 = (n * B / A) ** (1 / (n - 1)), E0 = -A / r0 + B / r0 ** n, ask = t.pick(['r', 'E']);
    return num(`For an ion pair, the net energy is E(r) = −A/r + B/rⁿ with A = 1.436 eV·nm, B = ${sci(B)} eV·nm^${n} and n = ${n} (r in nm). What is ${ask === 'r' ? 'the equilibrium spacing r₀, in nm' : 'the bonding energy E(r₀), in eV'}? (4 significant figures)`, r4(ask === 'r' ? r0 : E0),
      `dE/dr = A/r² − nB/r^(n+1) = 0 gives r₀ = (nB/A)^(1/(n−1)) = ${r4(r0)} nm, and E₀ = −A/r₀ + B/r₀ⁿ = ${r4(E0)} eV.`,
      `# minimise E(r) by golden-section search\nA, B, n = 1.436, ${B}, ${n}\nE = lambda r: -A / r + B / r ** n\nlo, hi, g = 0.05, 1.0, (5 ** 0.5 - 1) / 2\nfor _ in range(200):\n    a, b = hi - g * (hi - lo), lo + g * (hi - lo)\n    lo, hi = (lo, b) if E(a) < E(b) else (a, hi)\nr = (lo + hi) / 2\nprint(${ask === 'r' ? 'r' : 'E(r)'})`);
  }),

  SKILL('mat.density', 'Density from crystal structure', 'ρ = nA/(a³N_A): n atoms per cell (4 for FCC, 2 for BCC), with atoms touching along a face diagonal (a = 2√2R) or a body diagonal (a = 4R/√3).', t => {
    const [name, kind, Rnm, Am] = t.pick([['aluminium', 'FCC', 0.1431, 26.98], ['copper', 'FCC', 0.1278, 63.55], ['nickel', 'FCC', 0.1246, 58.69], ['silver', 'FCC', 0.1445, 107.87], ['lead', 'FCC', 0.175, 207.2],
      ['α-iron', 'BCC', 0.1241, 55.85], ['chromium', 'BCC', 0.1249, 52.0], ['molybdenum', 'BCC', 0.1363, 95.94], ['tungsten', 'BCC', 0.1371, 183.84], ['tantalum', 'BCC', 0.143, 180.95]]);
    const n = kind === 'FCC' ? 4 : 2, a = kind === 'FCC' ? 2 * Math.SQRT2 * Rnm : 4 * Rnm / Math.sqrt(3), rho = n * Am / ((a * 1e-7) ** 3 * NA), ask = t.pick(['rho', 'a']);
    return num(`${name[0].toUpperCase() + name.slice(1)} is ${kind}, with atomic radius ${Rnm} nm and atomic mass ${Am} g/mol. Treating atoms as touching hard spheres, what is ${ask === 'rho' ? 'its theoretical density, in g/cm³' : 'its lattice parameter a, in nm'}? (4 significant figures)`, r4(ask === 'rho' ? rho : a),
      `${kind}: ${n} atoms per cell, a = ${kind === 'FCC' ? '2√2R' : '4R/√3'} = ${r4(a)} nm. ρ = nA/(a³N_A) = ${n}·${Am}/((${r4(a)} × 10⁻⁷ cm)³ · 6.022 × 10²³) = ${r4(rho)} g/cm³.`,
      `import math\n# build a 4 x 4 x 4 block of cells with a = 1; nearest neighbours touch, so their distance is 2R\nkind, R, A = '${kind}', ${Rnm}, ${Am}\nbasis = [(0, 0, 0), (.5, .5, 0), (.5, 0, .5), (0, .5, .5)] if kind == 'FCC' else [(0, 0, 0), (.5, .5, .5)]\npts = [(i + b[0], j + b[1], k + b[2]) for i in range(4) for j in range(4) for k in range(4) for b in basis]\nd = min(math.dist(p, q) for p in pts for q in pts if p != q)\na = 2 * R / d\nmass = len(pts) * A / 6.02214076e23\nprint(${ask === 'rho' ? 'mass / (4 * a * 1e-7) ** 3' : 'a'})`);
  }),

  SKILL('mat.diffusion', 'Diffusion: carburising', 'Into a semi-infinite solid with fixed surface concentration, C(x, t) = C_s − (C_s − C₀) erf(x/2√(Dt)), with D = D₀e^(−Q/RT).', t => {
    const T = t.pick([900, 950, 1000, 1050]), D = 2.3e-5 * Math.exp(-148000 / (R * (T + 273.15)));
    const C0 = t.pick([0.1, 0.15, 0.2, 0.25]), Cs = t.pick([0.9, 1.0, 1.1, 1.2]), x = t.pick([0.5, 0.75, 1, 1.25, 1.5]), ask = t.pick(['conc', 'time']);
    const head = `Steel with ${C0} wt% C is carburised at ${T} °C with its surface held at ${Cs} wt% C. For carbon in austenite, D₀ = 2.3 × 10⁻⁵ m²/s and Q = 148 kJ/mol.`;
    if (ask === 'conc') {
      const hrs = t.pick([1, 2, 4, 6, 8, 10, 12, 16, 20, 24].filter(h => { const z = x * 1e-3 / (2 * Math.sqrt(D * h * 3600)); return z >= 0.3 && z <= 1.5; }));
      const z = x * 1e-3 / (2 * Math.sqrt(D * hrs * 3600)), C = Cs - (Cs - C0) * erf(z);
      return num(`${head} What is the carbon concentration ${x} mm below the surface after ${hrs} hours, in wt%? (4 significant figures)`, r4(C),
        `D = ${sci(D)} m²/s; x/2√(Dt) = ${r4(z)}; C = ${Cs} − ${r4(Cs - C0)}·erf(${r4(z)}) = ${r4(C)} wt%.`,
        `import math\n# solve the diffusion equation by finite differences (r = 1/6, which is fourth-order accurate) and read C at depth x\nD, t, x, C0, Cs = ${D}, ${hrs} * 3600, ${x} * 1e-3, ${C0}, ${Cs}\nk = max(10, math.ceil(8 * math.sqrt(D * t) / x)); N = 40 * k; dx = k * x / N\nsteps = math.ceil(t / (dx * dx / (6 * D))); r = D * (t / steps) / (dx * dx)\nc = [Cs] + [C0] * N\nfor _ in range(steps):\n    c = [Cs] + [c[i] + r * (c[i - 1] - 2 * c[i] + c[i + 1]) for i in range(1, N)] + [C0]\nprint(c[40])`);
    }
    const zt = 0.4 + 0.8 * t.rng(), Cstar = Number((Cs - (Cs - C0) * erf(zt)).toFixed(2));
    let lo = 0, hi = 4;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (erf(m) < (Cs - Cstar) / (Cs - C0)) lo = m; else hi = m; }
    const hrs = (x * 1e-3 / (2 * lo)) ** 2 / D / 3600;
    return num(`${head} How long, in hours, until the carbon concentration ${x} mm below the surface reaches ${Cstar} wt%? (4 significant figures)`, r4(hrs),
      `erf(z) = (C_s − C)/(C_s − C₀) = ${r4((Cs - Cstar) / (Cs - C0))} gives z = ${r4(lo)}. With D = ${sci(D)} m²/s, t = (x/2z)²/D = ${r4(hrs)} h.`,
      `import math\n# step the diffusion equation forward (finite differences, r = 1/6) until depth x reaches C*\nD, x, C0, Cs, Cstar = ${D}, ${x} * 1e-3, ${C0}, ${Cs}, ${Cstar}\nN = 400; dx = 10 * x / N; dt = dx * dx / (6 * D); r = 1 / 6\nc = [Cs] + [C0] * N; t = 0.0\nwhile True:\n    new = [Cs] + [c[i] + r * (c[i - 1] - 2 * c[i] + c[i + 1]) for i in range(1, N)] + [C0]\n    if new[40] >= Cstar:\n        t += dt * (Cstar - c[40]) / (new[40] - c[40]); break\n    c = new; t += dt\nprint(t / 3600)`);
  }),

  SKILL('mat.lever', 'Phase diagrams: the lever rule', 'In a two-phase region, a tie line at temperature T gives each phase\'s composition; the mass fractions follow from a mass balance: W_L = (C_α − C₀)/(C_α − C_L).', t => {
    const TA = 1085, TB = 1455, T = t.pick([1150, 1175, 1200, 1225, 1250, 1275, 1300, 1325, 1350, 1375, 1400]);
    const u = (T - TA) / (TB - TA), CL = 100 * u, Ca = 100 * Math.sqrt(u);
    const C0 = t.int(Math.ceil(CL + 1), Math.floor(Ca - 1)), WL = (Ca - C0) / (Ca - CL), ask = t.pick(['WL', 'Wa', 'CL', 'Ca']);
    const what = { WL: 'the mass fraction of liquid', Wa: 'the mass fraction of solid α', CL: 'the nickel content of the liquid, in wt% Ni', Ca: 'the nickel content of the solid α, in wt% Ni' }[ask];
    const ans = { WL, Wa: 1 - WL, CL, Ca }[ask];
    return num(`Model the Cu–Ni diagram (copper melts at ${TA} °C, nickel at ${TB} °C) with liquidus T = ${TA} + ${TB - TA}·(C/100) and solidus T = ${TA} + ${TB - TA}·(C/100)², C in wt% Ni. An alloy of ${C0} wt% Ni is held at ${T} °C. What is ${what}? (4 significant figures)`, r4(ans),
      `The tie line at ${T} °C meets the liquidus at C_L = ${r4(CL)} and the solidus at C_α = ${r4(Ca)} wt% Ni. Lever rule: W_L = (C_α − C₀)/(C_α − C_L) = ${r4(WL)}, W_α = ${r4(1 - WL)}.`,
      `# bisect each boundary for the composition at T, then solve the mass balance W_L + W_a = 1, W_L C_L + W_a C_a = C0\nTA, TB, T, C0 = ${TA}, ${TB}, ${T}, ${C0}\ndef on(curve):\n    lo, hi = 0.0, 100.0\n    for _ in range(200):\n        m = (lo + hi) / 2\n        lo, hi = (m, hi) if curve(m) < T else (lo, m)\n    return lo\nCL = on(lambda C: TA + (TB - TA) * C / 100)\nCa = on(lambda C: TA + (TB - TA) * (C / 100) ** 2)\ndet = Ca - CL\nWL = (Ca - C0) / det; Wa = (C0 - CL) / det\nprint(${{ WL: 'WL', Wa: 'Wa', CL: 'CL', Ca: 'Ca' }[ask]})`);
  }),

  SKILL('mat.index', 'Material selection for a stiff, light beam', 'For a beam of given length and stiffness with a free square section, mass ∝ ρ/E^½: the material index E^½/ρ ranks the candidates.', t => {
    const [name, E, rho] = t.pick([['steel', 210, 7850], ['aluminium alloy', 70, 2700], ['titanium alloy', 110, 4430], ['magnesium alloy', 45, 1740], ['quasi-isotropic CFRP', 60, 1550], ['GFRP', 25, 1900], ['spruce (along the grain)', 10, 450]]);
    const L = t.pick([0.5, 1, 1.5, 2]), S = t.pick([5, 10, 20, 50]);
    const b = (4 * S * 1e3 * L ** 3 / (E * 1e9)) ** 0.25, m = rho * b * b * L;
    return num(`A ${L} m cantilever with a solid square section must have a tip stiffness of ${S} kN/m. Made of ${name} (E = ${E} GPa, ρ = ${rho} kg/m³) and sized exactly, what is its mass, in kg? (4 significant figures)`, r4(m),
      `S = 3EI/L³ with I = b⁴/12, so b = (4SL³/E)^¼ = ${r4(b * 1000)} mm and m = ρb²L = ${r4(m)} kg. Eliminating b, m ∝ ρ/E^½: the index E^½/ρ ranks materials.`,
      `# size the section by bisection: tip deflection under a unit load by the unit-load integral, integral of (L - x)^2/(E I) dx\nE, rho, L, S = ${E} * 1e9, ${rho}, ${L}, ${S} * 1e3\ndef delta(b):\n    I = b ** 4 / 12; n = 1000; h = L / n\n    f = lambda x: (L - x) ** 2 / (E * I)\n    return (f(0) + f(L) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, n))) * h / 3\nlo, hi = 1e-4, 1.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if delta(m) > 1 / S else (lo, m)\nprint(rho * lo * lo * L)`);
  }),

  SKILL('mat.corrosion', 'Corrosion rate from current', 'Faraday\'s law: a corrosion current density i removes metal at i·M/(nFρ) — about 0.0116 mm per year per µA/cm² for iron.', t => {
    const [name, n, M, rho] = t.pick([['iron', 2, 55.85, 7.87], ['zinc', 2, 65.38, 7.14], ['aluminium', 3, 26.98, 2.70], ['copper', 2, 63.55, 8.96], ['nickel', 2, 58.69, 8.90], ['magnesium', 2, 24.31, 1.74]]);
    const i = t.pick([0.5, 1, 2, 5, 10, 20]), yr = 365.25 * 86400, cpr = i * 1e-6 * M / (n * F * rho) * yr * 10, ask = t.pick(['rate', 'life']);
    if (ask === 'rate') {
      return num(`A ${name} surface corrodes uniformly (M = ${M} g/mol, ρ = ${rho} g/cm³, ${n} electrons per atom) at a corrosion current density of ${i} µA/cm². What is the penetration rate, in mm per year? (4 significant figures)`, r4(cpr),
        `Rate = iM/(nFρ) = ${i} × 10⁻⁶ · ${M}/(${n} · 96 485 · ${rho}) cm/s = ${r4(cpr)} mm/year.`,
        `# a year of charge per cm^2 -> moles of electrons -> moles of metal -> grams -> cm^3 -> depth\ni, M, n, rho = ${i} * 1e-6, ${M}, ${n}, ${rho}\nq = i * 365.25 * 86400\nmetal_mol = q / 96485.33212 / n\nprint(metal_mol * M / rho * 10)`);
    }
    const allow = t.pick([0.5, 1, 1.5, 2, 3]), life = allow / cpr;
    return num(`A ${name} part (M = ${M} g/mol, ρ = ${rho} g/cm³, ${n} electrons per atom) has a corrosion allowance of ${allow} mm and corrodes uniformly at ${i} µA/cm². How many years until the allowance is used up? (4 significant figures)`, r4(life),
      `Penetration rate iM/(nFρ) = ${r4(cpr)} mm/year, so the allowance lasts ${allow}/${r4(cpr)} = ${r4(life)} years.`,
      `# charge needed to dissolve the allowance from 1 cm^2, divided by the current\ni, M, n, rho, allow = ${i} * 1e-6, ${M}, ${n}, ${rho}, ${allow}\ngrams = allow / 10 * rho\ncharge = grams / M * n * 96485.33212\nprint(charge / i / (365.25 * 86400))`);
  }),

  SKILL('mat.nernst', 'Cell voltage: the Nernst equation', 'Away from standard concentrations, E = E° − (RT/nF) ln Q; for M₁ | M₁²⁺ || M₂²⁺ | M₂, Q = [M₁²⁺]/[M₂²⁺].', t => {
    const couples = [['Zn', -0.763], ['Fe', -0.44], ['Cd', -0.403], ['Ni', -0.257], ['Sn', -0.138], ['Pb', -0.126], ['Cu', 0.34]];
    const i = t.int(0, couples.length - 2), j = t.int(i + 1, couples.length - 1), [an, Ea] = couples[i], [ca, Ec] = couples[j];
    const c1 = t.pick([0.001, 0.01, 0.05, 0.1, 0.5, 1, 2]), c2 = t.pick([0.001, 0.01, 0.05, 0.1, 0.5, 1, 2]), TC = t.pick([25, 40, 60]), T = TC + 273.15;
    const E0 = Ec - Ea, E = E0 - R * T / (2 * F) * Math.log(c1 / c2), ask = t.pick(['E', 'G']), G = -2 * F * E / 1000;
    return num(`A cell ${an} | ${an}²⁺ (${c1} M) || ${ca}²⁺ (${c2} M) | ${ca} runs at ${TC} °C. Standard potentials: ${an}²⁺/${an} ${Ea} V, ${ca}²⁺/${ca} ${Ec} V. What is ${ask === 'E' ? 'the cell voltage, in V' : 'ΔG for the cell reaction, in kJ per mole of metal'}? (4 significant figures)`, r4(ask === 'E' ? E : G),
      `E° = ${Ec} − (${Ea}) = ${r4(E0)} V. Q = ${c1}/${c2}; E = E° − (RT/2F) ln Q = ${r4(E)} V; ΔG = −2FE = ${r4(G)} kJ/mol.`,
      `import math\n# from the equilibrium constant: ln K = nFE°/RT, then dG = RT ln(Q/K) and E = -dG/nF\nR, F, T, n = 8.314462618, 96485.33212, ${T}, 2\nlnK = n * F * (${Ec} - (${Ea})) / (R * T)\ndG = R * T * (math.log(${c1} / ${c2}) - lnK)\nprint(${ask === 'E' ? '-dG / (n * F)' : 'dG / 1000'})`);
  }),

  SKILL('mat.composite', 'Fibre composites: rule of mixtures', 'Along the fibres the phases strain together: E₁ = V_fE_f + V_mE_m. Across them they carry the same stress: 1/E₂ = V_f/E_f + V_m/E_m.', t => {
    const [fib, Ef] = t.pick([['E-glass', 72.5], ['carbon', 230], ['aramid', 125]]), Em = 3.4, Vf = t.pick([0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65]), Vm = 1 - Vf;
    const E1 = Vf * Ef + Vm * Em, E2 = 1 / (Vf / Ef + Vm / Em), share = Vf * Ef / E1, ask = t.pick(['E1', 'E2', 'share']);
    const what = { E1: 'its modulus along the fibres, in GPa', E2: 'its modulus across the fibres, in GPa', share: 'the fraction of an axial load carried by the fibres' }[ask];
    return num(`A unidirectional ${fib}–epoxy composite has ${Math.round(Vf * 100)}% fibres by volume (E_f = ${Ef} GPa, epoxy E_m = ${Em} GPa). What is ${what}? (4 significant figures)`, r4({ E1, E2, share }[ask]),
      `Equal strain along the fibres: E₁ = ${Vf}·${Ef} + ${r4(Vm)}·${Em} = ${r4(E1)} GPa, of which the fibres carry ${r4(share)}. Equal stress across them: E₂ = 1/(${Vf}/${Ef} + ${r4(Vm)}/${Em}) = ${r4(E2)} GPa.`,
      `# a stack of 1000 thin layers, fibre or matrix in proportion\nEf, Em, Vf = ${Ef}, ${Em}, ${Vf}\nN = 1000; nf = round(Vf * N)\nlayers = [Ef] * nf + [Em] * (N - nf)\n# along: impose a strain and add the layer forces; across: impose a stress and add the layer stretches\neps = 1e-3\nforces = [E * eps / N for E in layers]\nE1 = sum(forces) / eps\nE2 = 1.0 / sum(1.0 / E / N for E in layers)\nshare = sum(forces[:nf]) / sum(forces)\nprint(${ask})`);
  }),
];
