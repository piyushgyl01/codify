/**
 * Mechanical Engineering: fluid mechanics (1.060, 2.25, 2.06; FE Mechanical
 * topic 10).
 *
 * Checks take another route: pressure summed over thin strips of a gate,
 * Bernoulli and continuity solved by bisection, tanks drained in time (RK4),
 * jet power maximised by golden-section search, the Colebrook equation by
 * fixed-point iteration instead of bisection, operating points and flow
 * splits bisected, similarity by matching dimensionless groups, and laminar
 * plate drag from the Blasius equation solved by shooting.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const g = 9.81, RHO = 1000;
/** Colebrook friction factor, by bisection on 1/√f. */
const colebrook = (Re, rel) => { let lo = 1e-3, hi = 1; for (let i = 0; i < 200; i++) { const f = (lo + hi) / 2, r = 1 / Math.sqrt(f) + 2 * Math.log10(rel / 3.7 + 2.51 / (Re * Math.sqrt(f))); if (r > 0) lo = f; else hi = f; } return lo; };

export const MEFLUIDS = [
  SKILL('fl.gate', 'Hydrostatic force on a gate', 'Pressure grows with depth, so the force on a submerged plane is ρg·(depth of its centroid)·A, acting lower, at the centre of pressure y_c + I/(y_cA).', t => {
    const w = t.pick([1, 1.5, 2, 3]), H = t.pick([1, 1.5, 2, 2.5]), d = t.pick([0, 0.5, 1, 2, 3]), ask = t.pick(['F', 'ycp']);
    const yc = d + H / 2, F = RHO * g * yc * w * H, ycp = yc + (H * H / 12) / yc;
    return num(`A vertical rectangular gate ${w} m wide and ${H} m tall holds back water; its top edge is ${d} m below the surface. What is ${ask === 'F' ? 'the resultant water force on it, in kN' : 'the depth of the centre of pressure below the surface, in m'}? (ρ = 1000 kg/m³, g = 9.81 m/s²; 4 significant figures)`, r4(ask === 'F' ? F / 1000 : ycp),
      `Centroid depth ${yc} m: F = ρg·y_c·A = ${r4(F / 1000)} kN. Centre of pressure: y_c + (H²/12)/y_c = ${r4(ycp)} m.`,
      `# add up the pressure on thin horizontal strips, and its moment about the surface\nrho, g, w, H, d = 1000, 9.81, ${w}, ${H}, ${d}\nn = 200000; dy = H / n\nF = M = 0.0\nfor i in range(n):\n    y = d + (i + 0.5) * dy; dF = rho * g * y * w * dy\n    F += dF; M += dF * y\nprint(${ask === 'F' ? 'F / 1000' : 'M / F'})`);
  }),

  SKILL('fl.bernoulli', 'Bernoulli: venturis and draining tanks', 'Along a streamline p + ½ρV² + ρgz is constant; with continuity (AV constant) a venturi\'s pressure drop gives the flow, and a tank drains at V = Cd√(2gh).', t => {
    if (t.rng() < 0.5) {
      const D1 = t.pick([100, 150, 200]), D2 = D1 * t.pick([0.4, 0.5, 0.6]), dh = t.pick([50, 100, 150, 200, 300]), Cd = 0.98, SG = 13.6;
      const A1 = Math.PI * (D1 / 1000) ** 2 / 4, A2 = Math.PI * (D2 / 1000) ** 2 / 4, dp = (SG - 1) * RHO * g * dh / 1000;
      const V2 = Math.sqrt(2 * dp / RHO / (1 - (A2 / A1) ** 2)), Q = Cd * A2 * V2 * 1000;
      return num(`Water flows through a venturi meter from a ${D1} mm pipe to a ${D2} mm throat. A mercury manometer (SG 13.6) between them reads ${dh} mm. With a discharge coefficient of ${Cd}, what is the flow rate, in L/s? (4 significant figures)`, r4(Q),
        `Δp = (SG − 1)ρg·Δh = ${r4(dp / 1000)} kPa. Bernoulli with continuity: V₂ = √(2Δp/(ρ(1 − (A₂/A₁)²))) = ${r4(V2)} m/s. Q = Cd·A₂·V₂ = ${r4(Q)} L/s.`,
        `import math\n# bisect on the pipe velocity until Bernoulli and continuity both hold\nrho, g, D1, D2, dh, Cd = 1000, 9.81, ${D1} / 1000, ${D2} / 1000, ${dh} / 1000, ${Cd}\nA1, A2 = math.pi * D1 ** 2 / 4, math.pi * D2 ** 2 / 4\ndp = (13.6 - 1) * rho * g * dh\nlo, hi = 0.0, 100.0\nfor _ in range(200):\n    V1 = (lo + hi) / 2; V2 = V1 * A1 / A2\n    lo, hi = (V1, hi) if 0.5 * rho * (V2 ** 2 - V1 ** 2) < dp else (lo, V1)\nprint(Cd * A1 * lo * 1000)`);
    }
    const Dt = t.pick([0.5, 1, 1.5, 2]), d = t.pick([20, 30, 40, 50]), Cd = t.pick([0.6, 0.62, 0.8]), h0 = t.pick([1, 2, 3]), h1 = t.pick([0, 0.2, 0.5]);
    const k = Cd * (d / 1000) ** 2 / Dt ** 2, T = (Math.sqrt(h0) - Math.sqrt(h1)) / (k * Math.sqrt(2 * g) / 2);
    return num(`A cylindrical tank ${Dt} m in diameter drains through a ${d} mm orifice in its base (Cd = ${Cd}). How long does the water level take to fall from ${h0} m to ${h1} m above the orifice, in seconds? (4 significant figures)`, r4(T),
      `A_t dh/dt = −Cd A_o √(2gh) integrates to t = (A_t/(Cd A_o))·√(2/g)·(√h₀ − √h₁) = ${r4(T)} s.`,
      `import math\n# integrate dh/dt = -Cd Ao sqrt(2 g h) / At (RK4) until the level reaches h1\ng, Dt, d, Cd, h, h1 = 9.81, ${Dt}, ${d} / 1000, ${Cd}, ${h0}, ${h1}\nAt, Ao = math.pi * Dt ** 2 / 4, math.pi * d ** 2 / 4\nf = lambda h: -Cd * Ao * math.sqrt(2 * g * max(h, 0.0)) / At\nt, dt = 0.0, 0.05\nwhile True:\n    k1 = f(h); k2 = f(h + dt / 2 * k1); k3 = f(h + dt / 2 * k2); k4 = f(h + dt * k3)\n    nh = h + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)\n    if nh <= h1:\n        t += dt * (h - h1) / (h - nh); break\n    h, t = nh, t + dt\nprint(t)`);
  }),

  SKILL('fl.vane', 'Momentum: jets on vanes', 'A control volume around a vane: the force equals the change in momentum flux. A single vane moving at u is struck by ρA(V − u)(V − u); its power peaks at u = V/3.', t => {
    const V = t.pick([10, 15, 20, 25, 30]), d = t.pick([25, 40, 50, 75]), th = t.pick([60, 90, 120, 150, 180]), ask = t.pick(['F', 'P', 'best']);
    const A = Math.PI * (d / 1000) ** 2 / 4, rad = th * Math.PI / 180, u = Number((V * t.pick([0.2, 0.3, 0.4, 0.5])).toFixed(1));
    const F = RHO * A * V * V * Math.hypot(1 - Math.cos(rad), Math.sin(rad)), Fx = rr => RHO * A * (V - rr) ** 2 * (1 - Math.cos(rad));
    const ans = { F: F, P: Fx(u) * u, best: Fx(V / 3) * (V / 3) }[ask];
    const what = { F: 'the magnitude of the force on the vane when it is held still, in N', P: `the power delivered to the vane when it moves away from the jet at ${u} m/s, in W`, best: 'the largest power the vane can extract, by choosing its speed, in W' }[ask];
    return num(`A ${d} mm water jet at ${V} m/s strikes a single vane that turns it through ${th}°. What is ${what}? (4 significant figures)`, r4(ans),
      `Still vane: F = ρAV²·√((1 − cos θ)² + sin² θ) = ${r4(F)} N. Moving at u: F_x = ρA(V − u)²(1 − cos θ), power F_x·u; maximised at u = V/3, giving ${r4(Fx(V / 3) * V / 3)} W.`,
      `import math\n# momentum flux out minus in, as vectors; and a golden-section search over the vane speed\nrho, V, d, th = 1000, ${V}, ${d} / 1000, math.radians(${th})\nA = math.pi * d * d / 4\ndef force(u):\n    m = rho * A * (V - u); rel = V - u\n    out = (rel * math.cos(th), rel * math.sin(th)); inn = (rel, 0.0)\n    return (m * (inn[0] - out[0]), m * (inn[1] - out[1]))\npower = lambda u: force(u)[0] * u\n${{ F: 'print(math.hypot(*force(0.0)))', P: `print(power(${u}))`, best: 'lo, hi, gr = 0.0, V, (5 ** 0.5 - 1) / 2\nfor _ in range(200):\n    a, b = hi - gr * (hi - lo), lo + gr * (hi - lo)\n    lo, hi = (a, hi) if power(a) < power(b) else (lo, b)\nprint(power((lo + hi) / 2))' }[ask]}`);
  }),

  SKILL('fl.pipe', 'Pipe friction: Darcy–Weisbach and Colebrook', 'Head loss h_f = f(L/D)V²/2g. In turbulent flow f depends on Re and ε/D through the Colebrook equation 1/√f = −2 log₁₀(ε/3.7D + 2.51/(Re√f)).', t => {
    const [pipe, eps] = t.pick([['commercial steel', 0.045], ['cast iron', 0.26], ['drawn tubing', 0.0015], ['galvanised iron', 0.15]]);
    const D = t.pick([50, 75, 100, 150, 200]), L = t.pick([50, 100, 200, 500]), Q = t.pick([2, 5, 10, 20, 40]), nu = 1e-6, ask = t.pick(['f', 'hf', 'dp']);
    const A = Math.PI * (D / 1000) ** 2 / 4, V = Q / 1000 / A, Re = V * D / 1000 / nu, f = colebrook(Re, eps / D), hf = f * L / (D / 1000) * V * V / (2 * g);
    const what = { f: 'the Darcy friction factor', hf: 'the head loss, in m', dp: 'the pressure drop, in kPa' }[ask];
    return num(`Water (ν = 1.0 × 10⁻⁶ m²/s, ρ = 1000 kg/m³) flows at ${Q} L/s through ${L} m of ${D} mm ${pipe} pipe (ε = ${eps} mm), horizontal. Using the Colebrook equation, what is ${what}? (4 significant figures)`, r4({ f, hf, dp: RHO * g * hf / 1000 }[ask]),
      `V = Q/A = ${r4(V)} m/s, Re = VD/ν = ${r4(Re)}, ε/D = ${r4(eps / D)}. Colebrook gives f = ${r4(f)}. h_f = f(L/D)V²/2g = ${r4(hf)} m; Δp = ρgh_f = ${r4(RHO * g * hf / 1000)} kPa.`,
      `import math\n# Colebrook by fixed-point iteration on x = 1/sqrt(f)\nD, L, Q, eps, nu, g = ${D} / 1000, ${L}, ${Q} / 1000, ${eps} / 1000, 1e-6, 9.81\nV = Q / (math.pi * D * D / 4); Re = V * D / nu\nx = 5.0\nfor _ in range(200):\n    x = -2 * math.log10(eps / (3.7 * D) + 2.51 * x / Re)\nf = 1 / x ** 2\nhf = f * L / D * V * V / (2 * g)\nprint(${{ f: 'f', hf: 'hf', dp: '1000 * g * hf / 1000' }[ask]})`);
  }),

  SKILL('fl.pumpop', 'Pump operating point', 'A pump runs where its head curve meets the system curve: H₀ − aQ² = Δz + KQ². The power it draws is ρgQH/η.', t => {
    const H0 = t.pick([30, 40, 50, 60]), Qmax = t.pick([0.04, 0.06, 0.08]), a = H0 / Qmax ** 2, dz = t.pick([5, 10, 15, 20]), K = t.pick([2000, 5000, 10000, 20000]), eta = t.pick([0.6, 0.7, 0.75, 0.8]), ask = t.pick(['Q', 'H', 'P']);
    const Q = Math.sqrt((H0 - dz) / (a + K)), H = dz + K * Q * Q, P = RHO * g * Q * H / eta / 1000;
    const what = { Q: 'the flow rate, in L/s', H: 'the pump head, in m', P: 'the shaft power, in kW' }[ask];
    return num(`A pump's head curve is H = ${H0} − ${r4(a)}Q² (H in m, Q in m³/s). It lifts water ${dz} m through a system whose losses are ${K}Q² m. The pump is ${Math.round(eta * 100)}% efficient. At the operating point, what is ${what}? (4 significant figures)`, r4({ Q: Q * 1000, H, P }[ask]),
      `Set ${H0} − ${r4(a)}Q² = ${dz} + ${K}Q²: Q = √((${H0} − ${dz})/(${r4(a)} + ${K})) = ${r4(Q * 1000)} L/s, H = ${r4(H)} m. Power = ρgQH/η = ${r4(P)} kW.`,
      `# bisect on Q where the pump curve meets the system curve\nH0, a, dz, K, eta = ${H0}, ${a}, ${dz}, ${K}, ${eta}\ngap = lambda Q: (H0 - a * Q * Q) - (dz + K * Q * Q)\nlo, hi = 0.0, 1.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if gap(m) > 0 else (lo, m)\nQ = lo; H = H0 - a * Q * Q\nprint(${{ Q: 'Q * 1000', H: 'H', P: '1000 * 9.81 * Q * H / eta / 1000' }[ask]})`);
  }),

  SKILL('fl.similarity', 'Dynamic similarity in model tests', 'A model behaves like the full-size object when the governing dimensionless group matches: Froude number for ships and spillways, Reynolds number for submerged and enclosed flow.', t => {
    const kind = t.pick(['froude', 'reynolds']), lam = t.pick([10, 16, 20, 25, 50]);
    if (kind === 'froude') {
      const Vp = t.pick([5, 8, 10, 12]), Fm = t.pick([10, 20, 30, 50]), ask = t.pick(['V', 'F']);
      const Vm = Vp / Math.sqrt(lam), Fp = Fm * lam ** 3;
      return num(`A 1:${lam} scale ship model is towed in fresh water to match a full-size ship at ${Vp} m/s (also in fresh water). Matching the Froude number, ${ask === 'V' ? 'what is the model\'s towing speed, in m/s' : `if the model's wave resistance is ${Fm} N, what is the full-size ship's, in kN`}? (4 significant figures)`, r4(ask === 'V' ? Vm : Fp / 1000),
        `Fr = V/√(gL) equal gives V_m = V_p/√λ = ${r4(Vm)} m/s. Forces scale as ρV²L² ∝ λ³, so F_p = ${Fm}·${lam}³ = ${r4(Fp / 1000)} kN.`,
        `import math\n# match Froude numbers by bisection, then match the force coefficient F/(rho V^2 L^2)\ng, lam, Vp, Fm = 9.81, ${lam}, ${Vp}, ${Fm}\nLp = 100.0; Lm = Lp / lam\nFr = lambda V, L: V / math.sqrt(g * L)\nlo, hi = 0.0, Vp\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if Fr(m, Lm) < Fr(Vp, Lp) else (lo, m)\nVm = lo\nCF = Fm / (1000 * Vm ** 2 * Lm ** 2)\nprint(${ask === 'V' ? 'Vm' : 'CF * 1000 * Vp ** 2 * Lp ** 2 / 1000'})`);
    }
    const Vp = t.pick([20, 25, 30]), lamR = t.pick([4, 5, 8, 10]), nuA = 1.5e-5, nuW = 1.0e-6, rhoA = 1.2, Fm = t.pick([200, 500, 1000]), ask = t.pick(['V', 'F']);
    const Vm = Vp * lamR * nuW / nuA, Fp = Fm * (rhoA / RHO) * (Vp / Vm) ** 2 * lamR ** 2;
    return num(`A car is to be studied at ${Vp} m/s in air (ρ = 1.2 kg/m³, ν = 1.5 × 10⁻⁵ m²/s) using a 1:${lamR} model in a water tunnel (ρ = 1000 kg/m³, ν = 1.0 × 10⁻⁶ m²/s), matching the Reynolds number. ${ask === 'V' ? 'What water speed is needed, in m/s?' : `If the model's drag is ${Fm} N, what is the full-size car's drag, in N?`} (4 significant figures)`, r4(ask === 'V' ? Vm : Fp),
      `Re = VL/ν equal: V_m = V_p·λ·ν_w/ν_a = ${r4(Vm)} m/s. Equal Re means equal drag coefficient, so F_p = F_m(ρ_a/ρ_w)(V_p/V_m)²λ² = ${r4(Fp)} N.`,
      `# match Reynolds numbers by bisection, then carry the drag coefficient across\nnuA, nuW, rhoA, rhoW, lam, Vp, Fm = 1.5e-5, 1.0e-6, 1.2, 1000, ${lamR}, ${Vp}, ${Fm}\nLp = 4.0; Lm = Lp / lam\nlo, hi = 0.0, 1e3\nfor _ in range(300):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if m * Lm / nuW < Vp * Lp / nuA else (lo, m)\nVm = lo\nCD = Fm / (0.5 * rhoW * Vm ** 2 * Lm ** 2)\nprint(${ask === 'V' ? 'Vm' : 'CD * 0.5 * rhoA * Vp ** 2 * Lp ** 2'})`);
  }),

  SKILL('fl.plate', 'Laminar boundary layers', 'On a flat plate the laminar (Blasius) boundary layer grows like √x: displacement thickness δ* = 1.7208x/√Re_x, and one face\'s drag is 0.664ρU²bL/√Re_L.', t => {
    const [fluid, rho, nu] = t.pick([['air', 1.2, 1.5e-5], ['water', 1000, 1.0e-6], ['oil', 870, 1.0e-4]]);
    let U, L, Re;
    do { U = t.pick([0.1, 0.2, 0.5, 1, 2, 5]); L = t.pick([0.2, 0.3, 0.5, 1]); Re = U * L / nu; } while (Re > 5e5 || Re < 1e3);
    const b = t.pick([0.5, 1]), ask = t.pick(['D', 'dstar']), D = 0.6641 * rho * U * U * b * L / Math.sqrt(Re), dstar = 1.7208 * L / Math.sqrt(Re);
    return num(`${fluid[0].toUpperCase() + fluid.slice(1)} (ρ = ${rho} kg/m³, ν = ${nu} m²/s) flows at ${U} m/s along a flat plate ${L} m long and ${b} m wide. The boundary layer stays laminar (Re_L = ${r4(Re)}). What is ${ask === 'D' ? 'the drag on one face, in N' : 'the displacement thickness at the trailing edge, in mm'}? (4 significant figures)`, r4(ask === 'D' ? D : dstar * 1000),
      `Re_L = UL/ν = ${r4(Re)}. Drag (one face) = 0.664ρU²bL/√Re_L = ${r4(D)} N. δ* = 1.7208L/√Re_L = ${r4(dstar * 1000)} mm.`,
      `import math\n# solve the Blasius equation f''' + f f''/2 = 0 by shooting on f''(0) so that f'(infinity) = 1\ndef run(s, keep=False):\n    z = [0.0, 0.0, s]; h = 0.002; I = 0.0\n    f = lambda z: [z[1], z[2], -0.5 * z[0] * z[2]]\n    for _ in range(6000):\n        k1 = f(z); k2 = f([a + h / 2 * b for a, b in zip(z, k1)]); k3 = f([a + h / 2 * b for a, b in zip(z, k2)]); k4 = f([a + h * b for a, b in zip(z, k3)])\n        nz = [a + h / 6 * (b + 2 * c + 2 * d + e) for a, b, c, d, e in zip(z, k1, k2, k3, k4)]\n        I += h * (1 - (z[1] + nz[1]) / 2); z = nz\n    return z[1], I\nlo, hi = 0.1, 1.0\nfor _ in range(45):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if run(m)[0] < 1 else (lo, m)\nfpp, dint = lo, run(lo)[1]\nrho, nu, U, L, b = ${rho}, ${nu}, ${U}, ${L}, ${b}\n# wall shear mu U f''(0) sqrt(U/(nu x)) integrated over the plate: 2 mu U f''(0) sqrt(U L / nu)\nmu = rho * nu\nprint(${ask === 'D' ? '2 * mu * U * fpp * math.sqrt(U * L / nu) * b' : 'dint * math.sqrt(nu * L / U) * 1000'})`);
  }),

  SKILL('fl.parallel', 'Pipes in parallel', 'Branches between the same two junctions share one head loss; the flow divides until f(L/D)V²/2g is equal in every branch.', t => {
    const D1 = t.pick([100, 150]), D2 = t.pick([75, 100, 200]), L1 = t.pick([200, 300, 500]), L2 = t.pick([150, 300, 400]), f1 = t.pick([0.018, 0.02, 0.022]), f2 = t.pick([0.018, 0.02, 0.025]), Q = t.pick([20, 40, 60, 80]), ask = t.pick(['Q1', 'hf']);
    const c = (f, L, D) => f * L / (D / 1000) / (2 * g) / (Math.PI * (D / 1000) ** 2 / 4) ** 2;
    const c1 = c(f1, L1, D1), c2 = c(f2, L2, D2), Q1 = Q / 1000 / (1 + Math.sqrt(c1 / c2)), hf = c1 * Q1 * Q1;
    return num(`A flow of ${Q} L/s of water splits between two parallel pipes that rejoin: pipe 1 is ${L1} m of ${D1} mm (f = ${f1}), pipe 2 is ${L2} m of ${D2} mm (f = ${f2}). Treating the friction factors as fixed and ignoring minor losses, what is ${ask === 'Q1' ? 'the flow in pipe 1, in L/s' : 'the head loss between the junctions, in m'}? (4 significant figures)`, r4(ask === 'Q1' ? Q1 * 1000 : hf),
      `Each branch has h_f = c Q² with c = fL/(D·2g·A²): c₁ = ${r4(c1)}, c₂ = ${r4(c2)}. Equal losses give Q₁/Q₂ = √(c₂/c₁), so Q₁ = ${r4(Q1 * 1000)} L/s and h_f = ${r4(hf)} m.`,
      `import math\n# bisect on the flow in pipe 1 until both branches lose the same head\ng = 9.81\npipes = [(${f1}, ${L1}, ${D1} / 1000), (${f2}, ${L2}, ${D2} / 1000)]\nQ = ${Q} / 1000\nloss = lambda q, p: p[0] * p[1] / p[2] * (q / (math.pi * p[2] ** 2 / 4)) ** 2 / (2 * g)\nlo, hi = 0.0, Q\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if loss(m, pipes[0]) < loss(Q - m, pipes[1]) else (lo, m)\nprint(${ask === 'Q1' ? 'lo * 1000' : 'loss(lo, pipes[0])'})`);
  }),
];
