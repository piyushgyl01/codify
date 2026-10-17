/**
 * Mechanical Engineering: machine elements (2.72; FE Mechanical topic 14).
 *
 * Checks take another route: Goodman safety factors by scaling the load line
 * until it meets the failure line, finite lives by bisecting on the
 * log–log S–N line, shaft diameters by bisecting on the safety factor, critical
 * speeds from numerically integrated deflections, bearing ratings by
 * bisection, bolted joints as springs in parallel, spring rates by
 * Castigliano on the twisted wire, gear loads from power over pitch-line
 * speed, belt tensions integrated around the wrap, and clutch torque
 * integrated over the friction face.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));

export const MEMACH = [
  SKILL('mach.goodman', 'Fatigue: endurance limit and Goodman', 'Endurance limit S_e = k_a·k_b·0.5S_ut for steels (machined k_a = 4.51S_ut^−0.265, k_b = 1.24d^−0.107). Under mean and alternating stress, the modified Goodman line gives 1/n = σ_a/S_e + σ_m/S_ut.', t => {
    const Sut = t.pick([500, 600, 700, 800, 900]), d = t.pick([20, 25, 30, 40, 50]), Kt = t.pick([1.6, 1.8, 2.0, 2.2]), q = t.pick([0.75, 0.8, 0.85, 0.9]), ask = t.pick(['n', 'life']);
    const ka = 4.51 * Sut ** -0.265, kb = 1.24 * d ** -0.107, Se = ka * kb * 0.5 * Sut, Kf = 1 + q * (Kt - 1);
    if (ask === 'n') {
      const Ma = t.pick([100, 200, 300, 500, 800]), Tm = t.pick([100, 200, 400, 600]);
      const sa = Kf * 32 * Ma * 1e3 / (Math.PI * d ** 3), sm = Math.sqrt(3) * Kf * 16 * Tm * 1e3 / (Math.PI * d ** 3), n = 1 / (sa / Se + sm / Sut);
      return num(`A rotating ${d} mm machined steel shaft (S_ut = ${Sut} MPa) has a shoulder with K_t = ${Kt} and notch sensitivity q = ${q} (use K_f for both bending and torsion). It carries a fully reversed bending moment of ${Ma} N·m and a steady torque of ${Tm} N·m. Using Marin factors k_a = 4.51S_ut^−0.265 and k_b = 1.24d^−0.107, S_e′ = 0.5S_ut, von Mises stresses and the modified Goodman line, what is the fatigue factor of safety? (4 significant figures)`, r4(n),
        `S_e = ${r4(ka)}·${r4(kb)}·${0.5 * Sut} = ${r4(Se)} MPa; K_f = 1 + q(K_t − 1) = ${r4(Kf)}. σ_a = K_f·32M_a/πd³ = ${r4(sa)} MPa, σ_m′ = √3·K_f·16T_m/πd³ = ${r4(sm)} MPa. 1/n = σ_a/S_e + σ_m′/S_ut, so n = ${r4(n)}.`,
        `import math\n# scale the load line (sigma_a, sigma_m) until it meets the Goodman line, by bisection\nSut, d, Kt, q, Ma, Tm = ${Sut}, ${d}, ${Kt}, ${q}, ${Ma} * 1e3, ${Tm} * 1e3\nSe = 4.51 * Sut ** -0.265 * 1.24 * d ** -0.107 * 0.5 * Sut\nKf = 1 + q * (Kt - 1)\nsa = Kf * 32 * Ma / (math.pi * d ** 3); tm = Kf * 16 * Tm / (math.pi * d ** 3)\nsm = math.sqrt(((0 - 0) ** 2 + 0 ** 2 + 0 ** 2 + 6 * tm ** 2) / 2)   # von Mises of pure shear, from the general formula\nlo, hi = 0.0, 100.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if m * sa / Se + m * sm / Sut < 1 else (lo, m)\nprint(lo)`);
    }
    const sa = Number((Se + (0.9 * Sut - Se) * t.pick([0.2, 0.4, 0.6, 0.8])).toFixed(0)), a = (0.9 * Sut) ** 2 / Se, b = -Math.log10(0.9 * Sut / Se) / 3, N = (sa / a) ** (1 / b);
    return num(`A machined steel part (S_ut = ${Sut} MPa, ${d} mm section, k_a = 4.51S_ut^−0.265, k_b = 1.24d^−0.107, S_e′ = 0.5S_ut) sees a fully reversed stress of ${sa} MPa, above its endurance limit. Taking the S–N line as straight on log–log axes from 0.9S_ut at 10³ cycles to S_e at 10⁶, how many cycles will it last? (4 significant figures)`, r4(N),
      `S_e = ${r4(Se)} MPa. σ = aN^b with a = (0.9S_ut)²/S_e = ${r4(a)} MPa and b = −log(0.9S_ut/S_e)/3 = ${r4(b)}; N = (σ/a)^(1/b) = ${r4(N)} cycles.`,
      `import math\n# bisect on log N along the straight log-log line between (1e3, 0.9 Sut) and (1e6, Se)\nSut, d, s = ${Sut}, ${d}, ${sa}\nSe = 4.51 * Sut ** -0.265 * 1.24 * d ** -0.107 * 0.5 * Sut\nline = lambda lgN: math.log10(0.9 * Sut) + (lgN - 3) / 3 * (math.log10(Se) - math.log10(0.9 * Sut))\nlo, hi = 3.0, 6.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if line(m) > math.log10(s) else (lo, m)\nprint(10 ** lo)`);
  }),

  SKILL('mach.shaft', 'Shaft diameter for fatigue', 'The DE-Goodman criterion sizes a shaft under reversed bending and steady torque: d = [16n/π·(2K_fM_a/S_e + √3K_fsT_m/S_ut)]^(1/3).', t => {
    const Sut = t.pick([600, 700, 800]), Se = Number((Sut * t.pick([0.25, 0.3, 0.35])).toFixed(0)), Kf = t.pick([1.5, 1.7, 2.0]), Kfs = t.pick([1.3, 1.5, 1.7]), Ma = t.pick([100, 200, 400, 700]), Tm = t.pick([100, 300, 500, 800]), n = t.pick([1.5, 2, 2.5]);
    const d = (16 * n / Math.PI * (2 * Kf * Ma * 1e3 / Se + Math.sqrt(3) * Kfs * Tm * 1e3 / Sut)) ** (1 / 3);
    return num(`A shaft carries a fully reversed bending moment of ${Ma} N·m and a steady torque of ${Tm} N·m. With K_f = ${Kf}, K_fs = ${Kfs}, S_e = ${Se} MPa (fully corrected) and S_ut = ${Sut} MPa, what diameter gives a factor of safety of ${n} by DE-Goodman, in mm? (4 significant figures)`, r4(d),
      `d = [16n/π·(2K_fM_a/S_e + √3K_fsT_m/S_ut)]^(1/3) = ${r4(d)} mm.`,
      `import math\n# bisect on the diameter until the Goodman safety factor from von Mises stresses equals the target\nSut, Se, Kf, Kfs, Ma, Tm, n = ${Sut}, ${Se}, ${Kf}, ${Kfs}, ${Ma} * 1e3, ${Tm} * 1e3, ${n}\ndef safety(d):\n    sa = Kf * 32 * Ma / (math.pi * d ** 3); tm = Kfs * 16 * Tm / (math.pi * d ** 3)\n    return 1 / (sa / Se + math.sqrt(3 * tm ** 2) / Sut)\nlo, hi = 1.0, 500.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if safety(m) < n else (lo, m)\nprint(lo)`);
  }),

  SKILL('mach.critical', 'Critical speed of a shaft', 'Rayleigh\'s method estimates a shaft\'s first critical speed from the static deflections yᵢ its disks cause: ω = √(gΣmᵢyᵢ/Σmᵢyᵢ²).', t => {
    const L = t.pick([0.6, 0.8, 1.0, 1.2]), d = t.pick([20, 25, 30, 40]) / 1000, E = 200e9, I = Math.PI * d ** 4 / 64, two = t.rng() < 0.6;
    const disks = two ? [[t.pick([10, 20, 30]), L * t.pick([0.25, 0.3, 0.35])], [t.pick([10, 20, 40]), L * t.pick([0.6, 0.7, 0.75])]] : [[t.pick([20, 40, 60]), L * t.pick([0.3, 0.4, 0.5])]];
    const defl = (x, a, P) => { const b = L - a; if (x > a) { x = L - x; return P * a * x * (L * L - a * a - x * x) / (6 * L * E * I); } return P * b * x * (L * L - b * b - x * x) / (6 * L * E * I); };
    const y = disks.map(([, xi]) => disks.reduce((s, [mj, aj]) => s + defl(xi, aj, mj * 9.81), 0));
    const w = Math.sqrt(9.81 * disks.reduce((s, [m], i) => s + m * y[i], 0) / disks.reduce((s, [m], i) => s + m * y[i] * y[i], 0)), rpm = w * 60 / (2 * Math.PI);
    return num(`A ${d * 1000} mm steel shaft (E = 200 GPa) runs between simple bearings ${L} m apart and carries ${disks.map(([m, a]) => `a ${m} kg disk ${r4(a)} m from the left bearing`).join(' and ')}. Ignoring the shaft's own mass, what is its first critical speed by Rayleigh's method, in rpm? (4 significant figures)`, r4(rpm),
      `Static deflections at the disks (superposing each disk's weight): ${y.map(v => `${r4(v * 1e6)} µm`).join(', ')}. ω = √(gΣmy/Σmy²) = ${r4(w)} rad/s = ${r4(rpm)} rpm.`,
      `import math\n# deflection under the disks' weights by integrating M/EI twice along the shaft, then Rayleigh's quotient\nL, d, E = ${L}, ${d}, 200e9\nEI = E * math.pi * d ** 4 / 64\ndisks = ${JSON.stringify(disks)}\nRB = sum(m * 9.81 * a for m, a in disks) / L; RA = sum(m * 9.81 for m, a in disks) - RB\nM = lambda x: RA * x - sum(m * 9.81 * (x - a) for m, a in disks if x > a)\nn = 100000; dx = L / n; slope = [0.0]; y = [0.0]\nfor i in range(n):\n    slope.append(slope[-1] + (M(i * dx) + M((i + 1) * dx)) / (2 * EI) * dx)\n    y.append(y[-1] + (slope[-2] + slope[-1]) / 2 * dx)\ny = [v - y[-1] * i / n for i, v in enumerate(y)]\nat = lambda x: y[round(x / dx)]\nys = [abs(at(a)) for m, a in disks]\nw = math.sqrt(9.81 * sum(m * v for (m, a), v in zip(disks, ys)) / sum(m * v * v for (m, a), v in zip(disks, ys)))\nprint(w * 60 / (2 * math.pi))`);
  }),

  SKILL('mach.bearing', 'Rolling-bearing life', 'A bearing\'s rated life (90% survive) is L₁₀ = (C/P)^a million revolutions, with a = 3 for ball and 10/3 for roller bearings; P = XF_r + YF_a combines radial and thrust loads.', t => {
    const type = t.pick(['ball', 'roller']), a = type === 'ball' ? 3 : 10 / 3, Fr = t.pick([2, 3, 5, 8]), Fa = type === 'ball' ? t.pick([0, 0.5, 1, 1.5]) : 0, X = 0.56, Y = 1.6, rpm = t.pick([500, 900, 1500, 3000]), ask = t.pick(['life', 'C']);
    const P = Fa > 0 ? X * Fr + Y * Fa : Fr, C = t.pick([20, 30, 40, 55, 75]), life = (C / P) ** a * 1e6 / (60 * rpm), target = t.pick([5000, 10000, 20000, 40000]), Creq = P * (target * 60 * rpm / 1e6) ** (1 / a);
    const load = Fa > 0 ? `a ${Fr} kN radial and ${Fa} kN thrust load (X = ${X}, Y = ${Y})` : `a ${Fr} kN radial load`;
    return num(`A ${type} bearing turning at ${rpm} rpm carries ${load}. ${ask === 'life' ? `Its basic dynamic rating is C = ${C} kN. What is its L₁₀ life, in hours?` : `What basic dynamic rating C gives an L₁₀ life of ${target} hours, in kN?`} (4 significant figures)`, r4(ask === 'life' ? life : Creq),
      `P = ${Fa > 0 ? `XF_r + YF_a = ${r4(P)}` : `${P}`} kN, a = ${type === 'ball' ? 3 : '10/3'}. ${ask === 'life' ? `L₁₀ = (C/P)^a × 10⁶/(60n) = ${r4(life)} h` : `C = P(L·60n/10⁶)^(1/a) = ${r4(Creq)} kN`}.`,
      `import math\n# count revolutions in logarithms, and bisect for the rating\nP, a, rpm = ${P}, ${a}, ${rpm}\nhours = lambda C: math.exp(a * math.log(C / P) + math.log(1e6)) / (60 * rpm)\n${ask === 'life' ? `print(hours(${C}))` : `lo, hi = P, 1e4\nfor _ in range(300):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if hours(m) < ${target} else (lo, m)\nprint(lo)`}`);
  }),

  SKILL('mach.bolt', 'Preloaded bolted joints', 'A preloaded joint shares an external load P between bolt and members by stiffness: the bolt takes only C·P, C = k_b/(k_b + k_m), and the joint separates at P₀ = F_i/(1 − C).', t => {
    const [size, At] = t.pick([['M10', 58], ['M12', 84.3], ['M16', 157], ['M20', 245]]), [cls, Sp] = t.pick([['8.8', 600], ['10.9', 830]]);
    const kb = t.pick([300, 500, 800, 1000]), km = kb * t.pick([2, 3, 4, 5]), Fi = 0.75 * At * Sp / 1000, P = Number((Fi * t.pick([0.3, 0.5, 0.7])).toFixed(1)), C = kb / (kb + km), ask = t.pick(['Fb', 'sep', 'yield']);
    const Fb = Fi + C * P, n0 = Fi / (P * (1 - C)), nL = (Sp * At / 1000 - Fi) / (C * P);
    const what = { Fb: 'the bolt tension under the external load, in kN', sep: 'the factor of safety against joint separation', yield: 'the load factor against the bolt reaching its proof load' }[ask];
    return num(`An ${size} class ${cls} bolt (tensile area ${At} mm², proof strength ${Sp} MPa) is tightened to 75% of its proof load. Bolt stiffness is ${kb} kN/mm and member stiffness ${km} kN/mm. An external load of ${P} kN pulls the joint apart. What is ${what}? (4 significant figures)`, r4({ Fb, sep: n0, yield: nL }[ask]),
      `F_i = 0.75A_tS_p = ${r4(Fi)} kN, C = k_b/(k_b + k_m) = ${r4(C)}. Bolt load F_i + CP = ${r4(Fb)} kN; separation factor F_i/(P(1 − C)) = ${r4(n0)}; proof-load factor (S_pA_t − F_i)/(CP) = ${r4(nL)}.`,
      `# bolt and members as springs in parallel: an external load stretches both by the same extra amount\nkb, km, Fi, P, Fp = ${kb}, ${km}, ${Fi}, ${P}, ${Sp * At / 1000}\ndef stretch(load):\n    lo, hi = 0.0, 10.0\n    for _ in range(200):\n        m = (lo + hi) / 2\n        lo, hi = (m, hi) if kb * m + km * m < load else (lo, m)\n    return lo\nbolt = lambda load: Fi + kb * stretch(load)\nmembers = lambda load: Fi - km * stretch(load)\ndef find(f, target):\n    lo, hi = 0.0, 1e4\n    for _ in range(200):\n        m = (lo + hi) / 2\n        lo, hi = (m, hi) if f(m) < target else (lo, m)\n    return lo\n${{ Fb: 'print(bolt(P))', sep: 'print(find(lambda L: -members(L), 0.0) / P)', yield: 'print(find(bolt, Fp) / P)' }[ask]}`);
  }),

  SKILL('mach.spring', 'Helical compression springs', 'A helical spring is a twisted wire: k = d⁴G/(8D³N_a). Squared and ground ends add two inactive coils, so it closes solid at length d(N_a + 2).', t => {
    const d = t.pick([2, 2.5, 3, 4, 5]), C = t.pick([6, 7, 8, 10]), D = d * C, Na = t.pick([5, 8, 10, 12]), G = 79.3e3, Lf = Number((d * (Na + 2) + t.pick([20, 30, 40, 60])).toFixed(1)), ask = t.pick(['k', 'Fs']);
    const k = d ** 4 * G / (8 * D ** 3 * Na), Ls = d * (Na + 2), Fs = k * (Lf - Ls);
    return num(`A steel helical compression spring (G = 79.3 GPa) is wound from ${d} mm wire to a mean coil diameter of ${D} mm, with ${Na} active coils and squared-and-ground ends; its free length is ${Lf} mm. What is ${ask === 'k' ? 'its rate, in N/mm' : 'the force needed to close it solid, in N'}? (4 significant figures)`, r4(ask === 'k' ? k : Fs),
      `k = d⁴G/(8D³N_a) = ${r4(k)} N/mm. Solid length d(N_a + 2) = ${Ls} mm, so closing it takes k(L_f − L_s) = ${r4(Fs)} N.`,
      `import math\n# Castigliano on the wire: torque F D/2 along length pi D Na stores U = T^2 L / (2 G J); deflection = dU/dF\nd, D, Na, G, Lf = ${d}, ${D}, ${Na}, ${G}, ${Lf}\nJ = math.pi * d ** 4 / 32; length = math.pi * D * Na\nU = lambda F: (F * D / 2) ** 2 * length / (2 * G * J)\nF, h = 100.0, 1e-3\nk = F / ((U(F + h) - U(F - h)) / (2 * h))\nprint(${ask === 'k' ? 'k' : 'k * (Lf - d * (Na + 2))'})`);
  }),

  SKILL('mach.gear', 'Spur gears: tooth load and Lewis stress', 'The transmitted load is W_t = P/V at the pitch line; the Lewis equation gives tooth bending stress σ = K_vW_t/(FmY), with K_v = (6.1 + V)/6.1 for cut teeth.', t => {
    const Np = t.pick([16, 18, 20, 24]), m = t.pick([2, 2.5, 3, 4]), Fw = t.pick([20, 25, 30, 40]), P = t.pick([2, 5, 10, 15]), n = t.pick([600, 1200, 1800]), Y = { 16: 0.296, 18: 0.309, 20: 0.322, 24: 0.337 }[Np], ask = t.pick(['Wt', 'sigma']);
    const d = Np * m, V = Math.PI * d / 1000 * n / 60, T = P * 1e3 / (n * 2 * Math.PI / 60), Wt = 2 * T / (d / 1000), Kv = (6.1 + V) / 6.1, sigma = Kv * Wt / (Fw * m * Y);
    return num(`A ${Np}-tooth spur pinion (module ${m} mm, face width ${Fw} mm, Lewis form factor Y = ${Y}) transmits ${P} kW at ${n} rpm. With cut teeth (K_v = (6.1 + V)/6.1), what is ${ask === 'Wt' ? 'the transmitted tangential load, in N' : 'the Lewis bending stress, in MPa'}? (4 significant figures)`, r4(ask === 'Wt' ? Wt : sigma),
      `d = Nm = ${d} mm; torque ${r4(T)} N·m, so W_t = 2T/d = ${r4(Wt)} N. V = ${r4(V)} m/s, K_v = ${r4(Kv)}. σ = K_vW_t/(FmY) = ${r4(sigma)} MPa.`,
      `import math\n# tangential load from power over pitch-line speed\nNp, m, F, P, n, Y = ${Np}, ${m}, ${Fw}, ${P} * 1e3, ${n}, ${Y}\nV = math.pi * Np * m / 1000 * n / 60\nWt = P / V\nKv = (6.1 + V) / 6.1\nprint(${ask === 'Wt' ? 'Wt' : 'Kv * Wt / (F * m * Y)'})`);
  }),

  SKILL('mach.belt', 'Flat-belt drives', 'A flat belt slips when T₁ − T_c = (T₂ − T_c)e^(μθ); the centrifugal tension T_c = m′V² eats into the useful tension at speed. Power = (T₁ − T₂)V.', t => {
    const mu = t.pick([0.25, 0.3, 0.35, 0.4]), wrap = t.pick([150, 160, 170, 180]), T1 = t.pick([800, 1200, 1500, 2000]), V = t.pick([10, 15, 20, 25, 30]), mp = t.pick([0.2, 0.3, 0.5]);
    const th = wrap * Math.PI / 180, Tc = mp * V * V, T2 = Tc + (T1 - Tc) / Math.exp(mu * th), P = (T1 - T2) * V / 1000;
    return num(`A flat belt (mass ${mp} kg/m) runs at ${V} m/s with μ = ${mu} and ${wrap}° of wrap on the smaller pulley. Its tight-side tension is limited to ${T1} N. At the point of slipping, what power does it transmit, in kW? (4 significant figures)`, r4(P),
      `T_c = m′V² = ${r4(Tc)} N. (T₁ − T_c)/(T₂ − T_c) = e^(μθ) = ${r4(Math.exp(mu * th))}, so T₂ = ${r4(T2)} N and P = (T₁ − T₂)V = ${r4(P)} kW.`,
      `import math\n# integrate dT/dtheta = mu (T - Tc) around the wrap (RK4) from a guessed slack tension; bisect until it reaches T1\nmu, th, T1, V, mp = ${mu}, math.radians(${wrap}), ${T1}, ${V}, ${mp}\nTc = mp * V * V\ndef tight(T2, n=2000):\n    h = th / n; T = T2\n    f = lambda T: mu * (T - Tc)\n    for _ in range(n):\n        k1 = f(T); k2 = f(T + h / 2 * k1); k3 = f(T + h / 2 * k2); k4 = f(T + h * k3)\n        T += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)\n    return T\nlo, hi = Tc, T1\nfor _ in range(100):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if tight(m) < T1 else (lo, m)\nprint((T1 - lo) * V / 1000)`);
  }),

  SKILL('mach.clutch', 'Disk clutches and brakes', 'Once a disk clutch has worn in, pressure falls as 1/r (uniform wear): the clamp force is 2πp_a·r_i(r_o − r_i) and each friction face carries πμp_a·r_i(r_o² − r_i²).', t => {
    const ri = t.pick([50, 60, 75, 100]), ro = ri * t.pick([1.5, 1.75, 2]), pa = t.pick([0.5, 0.8, 1, 1.5]), mu = t.pick([0.25, 0.3, 0.35]), faces = t.pick([1, 2, 4]), ask = t.pick(['T', 'F']);
    const F = 2 * Math.PI * pa * ri * (ro - ri), T = Math.PI * mu * pa * ri * (ro * ro - ri * ri) * faces / 1000;
    return num(`A disk clutch has friction faces from ${ri} mm to ${ro} mm radius, μ = ${mu}, and a maximum allowable pressure of ${pa} MPa. Assuming uniform wear and ${faces} friction face${faces > 1 ? 's' : ''}, what is ${ask === 'T' ? 'its torque capacity, in N·m' : 'the clamping force, in N'}? (4 significant figures)`, r4(ask === 'T' ? T : F),
      `Uniform wear: p = p_a r_i/r. F = 2πp_a r_i(r_o − r_i) = ${r4(F)} N. T = N·πμp_a r_i(r_o² − r_i²) = ${r4(T)} N·m.`,
      `import math\n# integrate the pressure p_a r_i / r over the annulus: force from p dA, torque from mu p r dA\nri, ro, pa, mu, faces = ${ri}, ${ro}, ${pa}, ${mu}, ${faces}\nn = 200000; dr = (ro - ri) / n\nF = T = 0.0\nfor i in range(n):\n    r = ri + (i + 0.5) * dr; dA = 2 * math.pi * r * dr; p = pa * ri / r\n    F += p * dA; T += mu * p * r * dA\nprint(${ask === 'T' ? 'T * faces / 1000' : 'F'})`);
  }),
];
