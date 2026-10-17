/**
 * Mechanical Engineering: materials processing, manufacturing and quality
 * (3.044, 2.008, DoITPoMS, the NIST e-Handbook; FE Mechanical topics 9.B,
 * 9.F, 9.G and 14.K).
 *
 * Checks take another route: true stress from volume constancy, forming work
 * and strain integrated numerically, Brinell areas integrated over the
 * spherical cap, casting moduli from polygon and slice geometry, tool-life
 * exponents and transformation times bisected, turning simulated revolution by
 * revolution, out-of-spec fractions from Python's erfc, and mould cooling
 * solved by finite differences.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
/** Upper normal tail Q(x) = P(Z > x), by Simpson's rule (accurate far into the tail, unlike an erf series). */
const tail = x => { const b = Math.max(x, 0) + 12, a = x, n = 20000, h = (b - a) / n, f = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); let s = f(a) + f(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return s * h / 3; };

export const MEMFG = [
  SKILL('mfg.tensile', 'Engineering and true stress', 'Before necking, volume is conserved: true stress σ_t = σ(1 + ε) and true strain ε_t = ln(1 + ε), from engineering stress σ = F/A₀ and strain ε = ΔL/L₀.', t => {
    const d0 = t.pick([6, 8, 10, 12.5]), L0 = 50, A0 = Math.PI * d0 * d0 / 4, sig = t.int(300, 600), F = Number((sig * A0 / 1000).toFixed(1));
    const L = Number((L0 * (1 + t.int(2, 20) / 100)).toFixed(1)), e = (L - L0) / L0, s = F * 1000 / A0, ask = t.pick(['eng', 'true', 'strain']);
    const ans = { eng: s, true: s * (1 + e), strain: Math.log(1 + e) }[ask];
    return num(`A round tensile specimen, ${d0} mm in diameter with a ${L0} mm gauge length, carries ${F} kN when the gauge length has stretched to ${L} mm (before necking). What is ${{ eng: 'the engineering stress, in MPa', true: 'the true stress, in MPa', strain: 'the true strain' }[ask]}? (4 significant figures)`, r4(ans),
      `σ = F/A₀ = ${F * 1000}/${r4(A0)} = ${r4(s)} MPa; ε = ${r4(e)}. True stress σ(1 + ε) = ${r4(s * (1 + e))} MPa; true strain ln(1 + ε) = ${r4(Math.log(1 + e))}.`,
      `import math\n# volume is conserved, so the current area is A0 L0 / L; true strain is the integral of dL/L\nd0, L0, L, F = ${d0}, ${L0}, ${L}, ${F} * 1000\nA0 = math.pi * d0 ** 2 / 4; A = A0 * L0 / L\nn = 20000; h = (L - L0) / n\nstrain = sum(h / (L0 + (i + 0.5) * h) for i in range(n))\nprint(${{ eng: 'F / A0', true: 'F / A', strain: 'strain' }[ask]})`);
  }),

  SKILL('mfg.flow', 'Flow stress and forming work', 'A work-hardening metal flows at σ = Kεⁿ; deforming it to true strain ε takes Kε^(n+1)/(n+1) of work per unit volume — the average flow stress Kεⁿ/(1+n) times ε.', t => {
    const [name, K, n] = t.pick([['annealed copper', 315, 0.54], ['low-carbon steel', 530, 0.26], ['304 stainless steel', 1275, 0.45], ['1100-O aluminium', 180, 0.2], ['70-30 brass', 895, 0.49]]);
    const D0 = t.pick([20, 25, 30, 40]), h0 = t.pick([40, 50, 60]), h1 = h0 * t.pick([0.4, 0.5, 0.6, 0.7]), e = Math.log(h0 / h1), ask = t.pick(['avg', 'work', 'force']);
    const V = Math.PI * D0 * D0 / 4 * h0, avg = K * e ** n / (1 + n), work = avg * e * V / 1000, force = K * e ** n * V / h1 / 1000;
    const what = { avg: 'the average flow stress over the operation, in MPa', work: 'the ideal work of deformation, in J', force: 'the frictionless forging force at the end of the stroke, in kN' }[ask];
    return num(`A ${D0} mm diameter, ${h0} mm tall cylinder of ${name} (K = ${K} MPa, n = ${n}) is upset between flat dies to ${h1} mm. Ignoring friction, what is ${what}? (4 significant figures)`, r4({ avg, work, force }[ask]),
      `True strain ε = ln(${h0}/${h1}) = ${r4(e)}. Average flow stress Kεⁿ/(1+n) = ${r4(avg)} MPa; ideal work = average × ε × volume = ${r4(work)} J; final force = Kεⁿ × final area (volume/${h1}) = ${r4(force)} kN.`,
      `import math\n# integrate K e^n over the strain path; volume constancy gives the final area\nK, n, D0, h0, h1 = ${K}, ${n}, ${D0}, ${h0}, ${h1}\nV = math.pi * D0 ** 2 / 4 * h0; e = math.log(h0 / h1)\nN = 200000; de = e / N\nw = sum(K * ((i + 0.5) * de) ** n * de for i in range(N))   # MJ/m^3 = N mm/mm^3\nprint(${{ avg: 'w / e', work: 'w * V / 1000', force: 'K * e ** n * (V / h1) / 1000' }[ask]})`);
  }),

  SKILL('mfg.hardness', 'Brinell hardness', 'HB is the load in kgf over the curved area of the dent: HB = 2F/(πD(D − √(D² − d²))). For steels, tensile strength ≈ 3.45·HB MPa.', t => {
    const [F, mat] = t.pick([[3000, 'a steel'], [3000, 'a cast iron'], [500, 'an aluminium alloy'], [500, 'a brass']]), D = 10;
    const d = Number((F === 3000 ? 2.6 + 2.6 * t.rng() : 2.5 + 3 * t.rng()).toFixed(2)), HB = 2 * F / (Math.PI * D * (D - Math.sqrt(D * D - d * d)));
    const ask = F === 3000 && mat === 'a steel' ? t.pick(['HB', 'UTS']) : 'HB';
    return num(`A Brinell test on ${mat} presses a ${D} mm ball with ${F} kgf and leaves a dent ${d} mm across. What is ${ask === 'HB' ? 'the Brinell hardness' : 'the tensile strength estimated from it, in MPa (use 3.45·HB)'}? (4 significant figures)`, r4(ask === 'HB' ? HB : 3.45 * HB),
      `HB = 2·${F}/(π·${D}·(${D} − √(${D}² − ${d}²))) = ${r4(HB)}${ask === 'UTS' ? `; UTS ≈ 3.45 × ${r4(HB)} = ${r4(3.45 * HB)} MPa` : ''}.`,
      `import math\n# integrate the area of the spherical cap the dent covers, then divide the load by it\nF, D, d = ${F}, ${D}, ${d}\nR = D / 2; top = math.asin(d / D); n = 20000; h = top / n\nf = lambda p: 2 * math.pi * R * math.sin(p) * R\narea = (f(0) + f(top) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, n))) * h / 3\nprint(${ask === 'HB' ? 'F / area' : '3.45 * F / area'})`);
  }),

  SKILL('mfg.chvorinov', 'Casting: Chvorinov\'s rule', 'A casting solidifies in t = B(V/A)²: the volume-to-surface ratio (the modulus) sets the time, so chunky shapes freeze last.', t => {
    const a = t.pick([50, 60, 80, 100]), t1 = t.pick([2, 3, 4, 5, 8, 10]), shape = t.pick(['cylinder', 'sphere', 'plate']);
    let V, A, desc, py;
    if (shape === 'cylinder') {
      const D = t.pick([50, 60, 80, 100, 120]), H = t.pick([50, 80, 100, 150, 200]);
      V = Math.PI * D * D / 4 * H; A = Math.PI * D * H + Math.PI * D * D / 2; desc = `a cylinder ${D} mm in diameter and ${H} mm tall`;
      py = `D, H = ${D}, ${H}\nN = 100000; ang = 2 * math.pi / N\nbase = N * 0.5 * (D / 2) ** 2 * math.sin(ang); rim = N * 2 * (D / 2) * math.sin(ang / 2)   # the circle as a 100 000-gon\nV, A = base * H, 2 * base + rim * H`;
    } else if (shape === 'sphere') {
      const D = t.pick([60, 80, 100, 120]);
      V = Math.PI * D ** 3 / 6; A = Math.PI * D * D; desc = `a sphere ${D} mm in diameter`;
      py = `R = ${D} / 2\nN = 20000; h = math.pi / N\n# slices: volume from discs, area from bands, both integrated over the polar angle (Simpson)\nfv = lambda p: math.pi * (R * math.sin(p)) ** 2 * R * math.sin(p)\nfa = lambda p: 2 * math.pi * R * math.sin(p) * R\nsimp = lambda f: (f(0) + f(math.pi) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, N))) * h / 3\nV, A = simp(fv), simp(fa)`;
    } else {
      const Lp = t.pick([150, 200, 250]), W = t.pick([100, 120, 150]), T = t.pick([10, 15, 20, 25]);
      V = Lp * W * T; A = 2 * (Lp * W + Lp * T + W * T); desc = `a ${Lp} × ${W} × ${T} mm plate`;
      py = `L, W, T = ${Lp}, ${W}, ${T}\n# a box: volume and its six faces\nV = L * W * T; A = 2 * (L * W) + 2 * (L * T) + 2 * (W * T)`;
    }
    const M1 = a / 6, M2 = V / A, t2 = t1 * (M2 / M1) ** 2;
    return num(`In a sand mould, a ${a} mm cube of a cast alloy solidifies in ${t1} min. Using Chvorinov's rule with exponent 2, how long, in minutes, does ${desc} of the same alloy and mould take? (4 significant figures)`, r4(t2),
      `Cube modulus V/A = a/6 = ${r4(M1)} mm. This casting: V/A = ${r4(M2)} mm. t = ${t1} × (${r4(M2)}/${r4(M1)})² = ${r4(t2)} min.`,
      `import math\n${py}\nM1 = ${a} ** 3 / (6 * ${a} ** 2)\nprint(${t1} * (V / A / M1) ** 2)`);
  }),

  SKILL('mfg.taylor', 'Tool life: Taylor\'s equation', 'Cutting faster wears tools faster: VTⁿ = C. Two tests fix n and C; then any speed gives a life, or any life a speed.', t => {
    const n = t.pick([0.12, 0.15, 0.2, 0.25, 0.3]), C = t.pick([150, 200, 250, 300, 400]), V1 = Math.round(C * t.pick([0.35, 0.4, 0.45])), V2 = Math.round(C * t.pick([0.55, 0.6, 0.65]));
    const T1 = Number(((C / V1) ** (1 / n)).toPrecision(3)), T2 = Number(((C / V2) ** (1 / n)).toPrecision(3));
    const ne = Math.log(V1 / V2) / Math.log(T2 / T1), Ce = V1 * T1 ** ne, ask = t.pick(['life', 'speed']);
    const V3 = Math.round(C * t.pick([0.45, 0.5])), T3 = t.pick([15, 20, 30, 45, 60]);
    const ans = ask === 'life' ? (Ce / V3) ** (1 / ne) : Ce / T3 ** ne;
    return num(`A tool lasts ${T1} min cutting at ${V1} m/min and ${T2} min at ${V2} m/min. Using Taylor's equation, ${ask === 'life' ? `how long does it last at ${V3} m/min, in minutes` : `what cutting speed gives a ${T3}-minute life, in m/min`}? (4 significant figures)`, r4(ans),
      `n = ln(V₁/V₂)/ln(T₂/T₁) = ${r4(ne)}; C = V₁T₁ⁿ = ${r4(Ce)}. ${ask === 'life' ? `T = (C/V)^(1/n) = ${r4(ans)} min` : `V = C/Tⁿ = ${r4(ans)} m/min`}.`,
      `# bisect for n from the two tests, then bisect again for the answer\nV1, T1, V2, T2 = ${V1}, ${T1}, ${V2}, ${T2}\nlo, hi = 0.01, 1.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if V1 * T1 ** m < V2 * T2 ** m else (lo, m)\nn = lo; C = V1 * T1 ** n\n${ask === 'life' ? `lo, hi = 1e-6, 1e6\nfor _ in range(300):\n    m = (lo * hi) ** 0.5\n    lo, hi = (m, hi) if ${V3} * m ** n < C else (lo, m)\nprint(lo)` : `lo, hi = 0.0, 1e4\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if m * ${T3} ** n < C else (lo, m)\nprint(lo)`}`);
  }),

  SKILL('mfg.turning', 'Turning: time, removal rate and power', 'Spindle speed N = v/(πD); a pass takes L/(fN); material goes at π D_avg d f N; power is specific energy times removal rate.', t => {
    const D = t.pick([50, 60, 80, 100]), Lc = t.pick([100, 150, 200, 250, 300]), d = t.pick([1, 1.5, 2, 2.5]), f = t.pick([0.15, 0.2, 0.25, 0.3]), v = t.pick([80, 100, 120, 150, 200]);
    const [mat, u] = t.pick([['carbon steel', 2.7], ['aluminium', 0.7], ['grey cast iron', 1.6]]), ask = t.pick(['time', 'mrr', 'power']);
    const N = v * 1000 / (Math.PI * D), time = Lc / (f * N), mrr = Math.PI * (D - d) * d * f * N, P = u * mrr / 60 / 1000;
    const what = { time: 'the cutting time for one pass, in minutes', mrr: 'the material removal rate, in cm³/min', power: 'the cutting power, in kW' }[ask];
    return num(`A ${D} mm diameter ${mat} bar is turned over ${Lc} mm at ${v} m/min (at the starting diameter), ${f} mm/rev feed and ${d} mm depth of cut. The specific cutting energy is ${u} W·s/mm³. What is ${what}? (4 significant figures)`, r4({ time, mrr: mrr / 1000, power: P }[ask]),
      `N = v/(πD) = ${r4(N)} rpm. Time = L/(fN) = ${r4(time)} min. MRR = π·D_avg·d·f·N = π·${D - d}·${d}·${f}·${r4(N)} = ${r4(mrr / 1000)} cm³/min. Power = u·MRR = ${r4(P)} kW.`,
      `import math\n# step through the cut one revolution at a time: each removes an annulus of thickness f\nD, L, d, f, v, u = ${D}, ${Lc}, ${d}, ${f}, ${v}, ${u}\nrpm = v * 1000 / (math.pi * D)\nrevs = round(L / f)\nvol = sum(math.pi / 4 * (D ** 2 - (D - 2 * d) ** 2) * f for _ in range(revs))   # mm^3\nminutes = revs / rpm\nprint(${{ time: 'minutes', mrr: 'vol / minutes / 1000', power: 'u * vol / (minutes * 60) / 1000' }[ask]})`);
  }),

  SKILL('mfg.cpk', 'Process capability', 'Cp = (USL − LSL)/6σ compares the tolerance with the spread; Cpk = min(USL − μ, μ − LSL)/3σ also charges for an off-centre mean. Out-of-spec parts follow from the normal tails.', t => {
    let tol, off, sig, Cp, Cpk;
    do {
      tol = t.pick([0.02, 0.03, 0.05]); off = t.pick([0, 0.002, -0.004, 0.005, -0.008, 0.01]); sig = t.pick([0.004, 0.005, 0.006, 0.008, 0.01]);
      Cp = 2 * tol / (6 * sig); Cpk = Math.min(tol - off, tol + off) / (3 * sig);
    } while (Cpk < 0.6 || Cpk > 1.5);
    const nom = t.pick([10, 20, 25, 40]), mu = nom + off, ask = t.pick(['cp', 'cpk', 'ppm']);
    const ppm = 1e6 * (tail((tol - off) / sig) + tail((tol + off) / sig));
    return num(`A shaft is toleranced ${nom}.000 ± ${tol} mm. The process runs with mean ${mu.toFixed(3)} mm and standard deviation ${sig} mm, normally distributed. What is ${{ cp: 'Cp', cpk: 'Cpk', ppm: 'the expected number of out-of-tolerance parts per million' }[ask]}? (4 significant figures)`, r4({ cp: Cp, cpk: Cpk, ppm }[ask]),
      `Cp = ${2 * tol}/(6·${sig}) = ${r4(Cp)}. Cpk = min(${r4(tol - off)}, ${r4(tol + off)})/(3·${sig}) = ${r4(Cpk)}. Out of tolerance: P(Z > ${r4((tol - off) / sig)}) + P(Z > ${r4((tol + off) / sig)}) = ${r4(ppm)} ppm.`,
      `import math\nnom, tol, mu, s = ${nom}, ${tol}, ${mu}, ${sig}\nUSL, LSL = nom + tol, nom - tol\n# Cpk as (1 - k) Cp, with k the mean's offset as a fraction of the half-tolerance\nCp = (USL - LSL) / (6 * s); k = abs(mu - nom) / tol\nppm = 1e6 * 0.5 * (math.erfc((USL - mu) / (s * math.sqrt(2))) + math.erfc((mu - LSL) / (s * math.sqrt(2))))\nprint(${{ cp: 'Cp', cpk: '(1 - k) * Cp', ppm: 'ppm' }[ask]})`);
  }),

  SKILL('mfg.cooling', 'Cooling time in a mould', 'A moulded wall of thickness h cools from both faces; its centre reaches ejection temperature after about (h²/π²α) ln((4/π)(T_m − T_w)/(T_e − T_w)).', t => {
    const [poly, Tm, Te, alpha] = t.pick([['polypropylene', 230, 90, 0.8e-7], ['ABS', 240, 85, 1.0e-7], ['polycarbonate', 300, 125, 1.3e-7], ['nylon 6', 260, 110, 1.0e-7]]);
    const h = t.pick([1.5, 2, 2.5, 3, 4]), Tw = t.pick([30, 40, 50, 60]), target = (Te - Tw) / (Tm - Tw), H = h * 1e-3;
    const centre = s => { let v = 0; for (let k = 0; k < 200; k++) { const m = 2 * k + 1; v += 4 / (m * Math.PI) * (k % 2 ? -1 : 1) * Math.exp(-m * m * Math.PI * Math.PI * alpha * s / (H * H)); } return v; };
    let lo = 0.01, hi = 600;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (centre(m) > target) lo = m; else hi = m; }
    const one = H * H / (Math.PI * Math.PI * alpha) * Math.log(4 / Math.PI / target);
    return num(`A ${h} mm thick ${poly} wall is injected at ${Tm} °C into a mould held at ${Tw} °C and can be ejected when its centre reaches ${Te} °C. With thermal diffusivity ${alpha * 1e7} × 10⁻⁷ m²/s and the mould faces at ${Tw} °C, how long must it cool, in seconds? (4 significant figures)`, r4(lo),
      `The centre follows θ = Σ (4/kπ)(±1) e^(−k²π²αt/h²) over odd k. Solving for θ = (${Te} − ${Tw})/(${Tm} − ${Tw}) = ${r4(target)} gives t = ${r4(lo)} s. The one-term formula gives ${r4(one)} s.`,
      `# conduction across the wall by finite differences (r = 1/6), both faces at the mould temperature, until the centre cools to ejection\nh, a, Tm, Tw, Te = ${H}, ${alpha}, ${Tm}, ${Tw}, ${Te}\nN = 120; dx = h / N; dt = dx * dx / (6 * a); r = 1 / 6\nT = [Tw] + [Tm] * (N - 1) + [Tw]; t = 0.0\nwhile True:\n    new = [Tw] + [T[i] + r * (T[i - 1] - 2 * T[i] + T[i + 1]) for i in range(1, N)] + [Tw]\n    if new[N // 2] <= Te:\n        t += dt * (T[N // 2] - Te) / (T[N // 2] - new[N // 2]); break\n    T = new; t += dt\nprint(t)`);
  }),

  SKILL('mfg.avrami', 'Transformation kinetics', 'Diffusional transformations follow the Avrami equation f = 1 − exp(−ktⁿ): slow to start, fast in the middle, slow to finish.', t => {
    const n = t.pick([1.5, 2, 2.5, 3, 4]), t1 = t.pick([20, 50, 100, 150, 200]), f1 = t.pick([0.2, 0.3, 0.5]), f2 = t.pick([0.9, 0.95, 0.99]);
    const k = -Math.log(1 - f1) / t1 ** n, t2 = (-Math.log(1 - f2) / k) ** (1 / n);
    return num(`At a fixed temperature, a steel transforms following the Avrami equation with n = ${n}. ${Math.round(f1 * 100)}% has transformed after ${t1} s. How long, in seconds, until ${Math.round(f2 * 100)}% has transformed? (4 significant figures)`, r4(t2),
      `k = −ln(1 − ${f1})/${t1}^${n} = ${r4(k)}. Then t = (−ln(1 − ${f2})/k)^(1/n) = ${r4(t2)} s.`,
      `import math\n# bisect for k from the first point, then for the time of the second\nn, t1, f1, f2 = ${n}, ${t1}, ${f1}, ${f2}\nf = lambda k, t: 1 - math.exp(-k * t ** n)\nlo, hi = 1e-30, 1.0\nfor _ in range(400):\n    m = (lo * hi) ** 0.5\n    lo, hi = (m, hi) if f(m, t1) < f1 else (lo, m)\nk = lo\nlo, hi = t1, t1 * 1e3\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if f(k, m) < f2 else (lo, m)\nprint(lo)`);
  }),
  SKILL('mfg.spc', 'Control charts: X̄ and R', 'An X̄ chart\'s limits sit at X̿ ± A₂R̄, where A₂ = 3/(d₂√n) and d₂ is the expected range of n standard normal values (2.059 for n = 4, 2.326 for 5, 2.534 for 6).', t => {
    const n = t.pick([4, 5, 6]), d2 = { 4: 2.059, 5: 2.326, 6: 2.534 }[n], X = t.pick([10, 12.5, 20, 25, 50]), R = t.pick([0.02, 0.03, 0.05, 0.08]), ask = t.pick(['ucl', 'lcl', 'sigma']);
    const A2 = 3 / (d2 * Math.sqrt(n)), ans = { ucl: X + A2 * R, lcl: X - A2 * R, sigma: R / d2 }[ask];
    return num(`Subgroups of ${n} parts give a grand mean X̿ = ${X} mm and an average range R̄ = ${R} mm. What is ${{ ucl: 'the upper control limit of the X̄ chart, in mm', lcl: 'the lower control limit of the X̄ chart, in mm', sigma: 'the estimated process standard deviation R̄/d₂, in mm' }[ask]}? (Use d₂ = ${d2}; 4 significant figures)`, r4(ans),
      `A₂ = 3/(d₂√n) = ${r4(A2)}. UCL = X̿ + A₂R̄ = ${r4(X + A2 * R)}, LCL = ${r4(X - A2 * R)}, σ̂ = R̄/d₂ = ${r4(R / d2)} mm.`,
      `import math\n# d2 from first principles: the expected range of n standard normals, integral of 1 - F^n - (1 - F)^n\nn, X, R = ${n}, ${X}, ${R}\nPhi = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))\nN = 40000; h = 16 / N\nd2 = sum((1 - Phi(-8 + (i + 0.5) * h) ** n - (1 - Phi(-8 + (i + 0.5) * h)) ** n) * h for i in range(N))\nA2 = 3 / (d2 * math.sqrt(n))\nprint(${{ ucl: 'X + A2 * R', lcl: 'X - A2 * R', sigma: 'R / d2' }[ask]})`);
  }),

  SKILL('mfg.merchant', 'Orthogonal cutting: Merchant\'s model', 'Merchant assumed the shear plane sets itself to minimise cutting energy: φ = 45° + α/2 − β/2. The cutting force is then F_c = τ_s·w·t₀·cos(β − α)/(sin φ·cos(φ + β − α)).', t => {
    const alpha = t.pick([0, 5, 10, 15]), mu = t.pick([0.5, 0.6, 0.7, 0.8]), tau = t.pick([250, 300, 400, 500]), w = t.pick([2, 3, 4]), t0 = t.pick([0.1, 0.15, 0.2, 0.25]), V = t.pick([60, 100, 150]), ask = t.pick(['phi', 'Fc', 'P']);
    const beta = Math.atan(mu) * 180 / Math.PI, phi = 45 + alpha / 2 - beta / 2, rad = x => x * Math.PI / 180;
    const Fc = tau * w * t0 * Math.cos(rad(beta - alpha)) / (Math.sin(rad(phi)) * Math.cos(rad(phi + beta - alpha))), P = Fc * V / 60 / 1000;
    return num(`In orthogonal cutting with rake angle ${alpha}°, tool–chip friction coefficient ${mu}, work shear strength ${tau} MPa, width of cut ${w} mm and uncut chip thickness ${t0} mm at ${V} m/min, what is ${{ phi: 'the shear angle by Merchant\'s theory, in degrees', Fc: 'the cutting force, in N', P: 'the cutting power, in kW' }[ask]}? (4 significant figures)`, r4({ phi, Fc, P }[ask]),
      `β = atan μ = ${r4(beta)}°; φ = 45 + α/2 − β/2 = ${r4(phi)}°. F_c = τ_s·w·t₀·cos(β − α)/(sin φ·cos(φ + β − α)) = ${r4(Fc)} N; power F_c·V = ${r4(P)} kW.`,
      `import math\n# Merchant's principle: search the shear angle that minimises the cutting force (golden section)\nalpha, beta = math.radians(${alpha}), math.atan(${mu})\ntau, w, t0, V = ${tau}, ${w}, ${t0}, ${V}\nFc = lambda p: tau * w * t0 * math.cos(beta - alpha) / (math.sin(p) * math.cos(p + beta - alpha))\nlo, hi, g = 0.01, math.pi / 2 - (beta - alpha) - 0.01, (5 ** 0.5 - 1) / 2\nfor _ in range(200):\n    a, b = hi - g * (hi - lo), lo + g * (hi - lo)\n    lo, hi = (lo, b) if Fc(a) < Fc(b) else (a, hi)\np = (lo + hi) / 2\nprint(${{ phi: 'math.degrees(p)', Fc: 'Fc(p)', P: 'Fc(p) * V / 60 / 1000' }[ask]})`);
  }),
];
