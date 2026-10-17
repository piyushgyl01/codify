/**
 * Mechanical Engineering: autonomy, propulsion and energy-system design
 * (Labbe's Kalman filters, Modern Robotics, 16.50, MIT Unified notes,
 * 22.081J, Lienhard; FE Mechanical topics 4, 10, 11, 12 and 13).
 *
 * Checks take another route: Kalman steps by a grid Bayes filter, camera
 * projection by intersecting rays with the image plane, stereo depth by
 * triangulating two rays, histogram localisation by enumerating every
 * path, turbojets station by station, rockets by integrating the burn,
 * nozzles from the isentropic exit state, cruise range by integrating fuel
 * burn, heat-exchanger area by marching the exchanger, insulation by
 * bisecting on the derivative of cost, levelised cost by discounting every
 * year, storage by integrating the tank, and wind resource by integrating
 * over the speed distribution.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const rad = d => d * Math.PI / 180;
const lgamma = x => { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp); let s = 1.000000000190015; for (const v of c) s += v / ++y; return -tmp + Math.log(2.5066282746310005 * s / x); };

export const MEAUTO = [
  SKILL('auto.kf1d', 'A Kalman filter by hand', 'Predict: mean += motion, variance += Q. Update: gain K = P/(P + R), mean += K(z − mean), variance ×= (1 − K). Each measurement pulls the estimate toward it in proportion to how much it is trusted.', t => {
    const m0 = t.pick([0, 5, 10]), P0 = t.pick([1, 4, 9]), u = t.pick([1, 2, 3]), Q = t.pick([0.1, 0.25, 0.5, 1]), R = t.pick([0.5, 1, 2, 4]), steps = t.int(2, 3);
    const z = []; let truth = m0; for (let k = 0; k < steps; k++) { truth += u; z.push(Number((truth + (t.rng() * 2 - 1) * 1.5).toFixed(1))); }
    let m = m0, P = P0; for (const zk of z) { m += u; P += Q; const K = P / (P + R); m += K * (zk - m); P *= 1 - K; }
    const ask = t.pick(['m', 'P']);
    return num(`A cart's position starts as N(${m0}, ${P0}). Each step it is commanded forward ${u} m with process noise variance ${Q} m², then a sensor reads its position with noise variance ${R} m². The readings are ${z.join(', ')} m. After the last update, what is ${ask === 'm' ? 'the estimated position, in m' : 'the estimate\'s variance, in m²'}? (4 significant figures)`, r4(ask === 'm' ? m : P),
      `Each step: predict (mean + ${u}, variance + ${Q}), then K = P/(P + ${R}), update the mean toward the reading and shrink P by (1 − K). Final: ${r4(m)} m, variance ${r4(P)} m².`,
      `# solve the whole trajectory at once (batch least squares in information form); the last state's mean and variance must match the filter\nm0, P0, u, Q, R, z = ${m0}, ${P0}, ${u}, ${Q}, ${R}, ${JSON.stringify(z)}\nn = len(z) + 1\nJ = [[0.0] * n for _ in range(n)]; b = [0.0] * n\nJ[0][0] += 1 / P0; b[0] += m0 / P0\nfor k in range(n - 1):\n    # (x[k+1] - x[k] - u)^2 / Q\n    J[k][k] += 1 / Q; J[k + 1][k + 1] += 1 / Q; J[k][k + 1] -= 1 / Q; J[k + 1][k] -= 1 / Q\n    b[k] -= u / Q; b[k + 1] += u / Q\n    J[k + 1][k + 1] += 1 / R; b[k + 1] += z[k] / R\ndef solve(A, y):\n    M = [row[:] + [v] for row, v in zip(A, y)]\n    for c in range(n):\n        for r in range(n):\n            if r != c: f = M[r][c] / M[c][c]; M[r] = [a - f * bb for a, bb in zip(M[r], M[c])]\n    return [M[i][n] / M[i][i] for i in range(n)]\nmean = solve(J, b)[-1]\nvar = solve(J, [0.0] * (n - 1) + [1.0])[-1]\nprint(${ask === 'm' ? 'mean' : 'var'})`, { rtol: 0.003 });
  }),

  SKILL('auto.pinhole', 'Projecting points into a camera', 'A pinhole camera maps a point (X, Y, Z) in its own frame to pixel u = f·X/Z + c_x, v = f·Y/Z + c_y. Points in the world are first moved into the camera frame.', t => {
    const f = t.pick([400, 600, 800]), cx = t.pick([320, 640]), cy = t.pick([240, 360]), yaw = t.pick([0, 10, 20, -15]), P = [t.pick([-1, -0.5, 0.5, 1, 1.5]), t.pick([-0.5, -0.2, 0.2, 0.4]), t.pick([3, 4, 5, 8])], ask = t.pick(['u', 'v']);
    // camera at the origin, turned by yaw about its y axis: camera-frame point = Rᵀ·P
    const c = Math.cos(rad(yaw)), s = Math.sin(rad(yaw)), Xc = c * P[0] - s * P[2], Yc = P[1], Zc = s * P[0] + c * P[2];
    const u = f * Xc / Zc + cx, v = f * Yc / Zc + cy;
    return num(`A camera (f = ${f} px, principal point (${cx}, ${cy})) sits at the world origin, turned ${yaw}° about its vertical (y) axis from looking straight down the world z axis (positive turns z toward +x). A world point is at (${P.join(', ')}) m. At what pixel ${ask === 'u' ? 'column u' : 'row v'} does it appear? (4 significant figures)`, r4(ask === 'u' ? u : v),
      `In the camera frame the point is (${r4(Xc)}, ${r4(Yc)}, ${r4(Zc)}). Then u = f·X/Z + c_x = ${r4(u)}, v = f·Y/Z + c_y = ${r4(v)}.`,
      `import math\n# intersect the ray from the camera centre through the point with the image plane one focal length along the optical axis\nf, cx, cy, yaw, P = ${f}, ${cx}, ${cy}, math.radians(${yaw}), ${JSON.stringify(P)}\nax = (math.sin(yaw), 0.0, math.cos(yaw))     # optical axis in the world\nxr = (math.cos(yaw), 0.0, -math.sin(yaw))    # image x direction\nyr = (0.0, 1.0, 0.0)\ndot = lambda a, b: sum(x * y for x, y in zip(a, b))\ns = f / dot(P, ax)                            # scale so the ray reaches the plane\nhit = [s * x for x in P]\nprint(${ask === 'u' ? 'dot(hit, xr) + cx' : 'dot(hit, yr) + cy'})`);
  }),

  SKILL('auto.stereo', 'Depth from stereo', 'Two parallel cameras a baseline B apart see a point shifted by disparity d: depth Z = fB/d. Depth error grows as Z²: a one-pixel disparity error costs about Z²/(fB).', t => {
    const f = t.pick([500, 700, 1000]), B = t.pick([0.06, 0.12, 0.2, 0.3]), d = t.pick([20, 30, 40, 60, 80]), ask = t.pick(['Z', 'dZ']);
    const Z = f * B / d, dZ = Z * Z / (f * B);
    return num(`A stereo rig has focal length ${f} px and baseline ${B} m. A feature has disparity ${d} px. What is ${ask === 'Z' ? 'its depth, in m' : 'the depth error caused by a 1-pixel disparity error, in m (to first order)'}? (4 significant figures)`, r4(ask === 'Z' ? Z : dZ),
      `Z = fB/d = ${r4(Z)} m. ∂Z/∂d = −fB/d² = −Z²/(fB), so 1 px costs ${r4(dZ)} m.`,
      `import math\n# triangulate: closest point between the two back-projected rays\nf, B, d = ${f}, ${B}, ${d}\ndef depth(disp):\n    xl = 50.0; xr = xl - disp                 # pixel x in each camera, measured from its principal point\n    o1, r1 = (0.0, 0.0, 0.0), (xl / f, 0.0, 1.0)\n    o2, r2 = (B, 0.0, 0.0), (xr / f, 0.0, 1.0)\n    w = [a - b for a, b in zip(o1, o2)]\n    dot = lambda a, b: sum(x * y for x, y in zip(a, b))\n    a, b, c, dd, e = dot(r1, r1), dot(r1, r2), dot(r2, r2), dot(r1, w), dot(r2, w)\n    s = (b * e - c * dd) / (a * c - b * b)\n    return s * r1[2]\n${ask === 'Z' ? 'print(depth(d))' : 'print((depth(d - 0.5) - depth(d + 0.5)))'}`);
  }),

  SKILL('auto.histogram', 'Histogram localisation', 'A grid of beliefs is shifted by each motion (blurring it by the motion noise) and multiplied by the sensor likelihood at each cell, then renormalised.', t => {
    const N = 10, doors = [...new Set(Array.from({ length: 3 }, () => t.int(0, N - 1)))].sort((a, b) => a - b), hit = 0.8, fa = 0.2, steps = t.int(2, 3);
    const obs = Array.from({ length: steps }, () => t.rng() < 0.5), pexact = 0.8, pover = 0.1, punder = 0.1, cell = t.int(0, N - 1);
    let bel = Array(N).fill(1 / N);
    const sense = (b, o) => { const nb = b.map((v, i) => v * (doors.includes(i) ? (o ? hit : 1 - hit) : (o ? fa : 1 - fa))); const s = nb.reduce((a, v) => a + v, 0); return nb.map(v => v / s); };
    const move = b => b.map((_, i) => pexact * b[(i - 1 + N) % N] + pover * b[(i - 2 + N) % N] + punder * b[i]);
    for (const o of obs) { bel = move(bel); bel = sense(bel, o); }
    return num(`A robot in a circular corridor of ${N} cells (0–${N - 1}) has doors at cells ${doors.join(', ')}. It starts with no idea where it is. Each step it tries to move one cell forward (exactly one with probability 0.8, two with 0.1, none with 0.1), then its door sensor reads (it reports a door with probability 0.8 at a door and 0.2 elsewhere). The readings are ${obs.map(o => (o ? 'door' : 'no door')).join(', ')}. What is the probability that it is now in cell ${cell}? (4 significant figures)`, r4(bel[cell]),
      `Run the histogram filter: shift-and-blur for each move, multiply by the door likelihood, normalise. Belief in cell ${cell}: ${r4(bel[cell])}.`,
      `import itertools\n# enumerate every start cell and every sequence of motion outcomes, weight each path by its probability and the readings it explains\nN, doors, obs, cell = ${N}, ${JSON.stringify(doors)}, ${JSON.stringify(obs.map(o => (o ? 1 : 0)))}, ${cell}\nmoves = [(1, 0.8), (2, 0.1), (0, 0.1)]\nlik = lambda c, o: (0.8 if o else 0.2) if c in doors else (0.2 if o else 0.8)\nend = [0.0] * N\nfor start in range(N):\n    for seq in itertools.product(moves, repeat=len(obs)):\n        c, w = start, 1.0 / N\n        for (step, pm), o in zip(seq, obs):\n            c = (c + step) % N; w *= pm * lik(c, o)\n        end[c] += w\nprint(end[cell] / sum(end))`);
  }),

  SKILL('prop.turbojet', 'The ideal turbojet', 'Station by station: ram compression, the compressor, the burner to T_t4, a turbine that just drives the compressor, then a nozzle expanding to ambient. Specific thrust is V₉ − V₀.', t => {
    const M0 = t.pick([0, 0.5, 0.8, 1.5, 2]), T0 = t.pick([216.7, 250, 288.15]), pc = t.pick([8, 10, 15, 20, 30]), Tt4p = t.pick([1400, 1600, 1800]), cp = 1004, g = 1.4, hPR = 42.8e6, ask = t.pick(['F', 'S']);
    let Tt4 = Tt4p; while (Tt4 / T0 < 1.3 * (1 + 0.2 * M0 * M0) * pc ** ((g - 1) / g)) Tt4 += 200;
    const a0 = Math.sqrt((g - 1) * cp * T0), tr = 1 + 0.2 * M0 * M0, tc = pc ** ((g - 1) / g), tl = Tt4 / T0, tt = 1 - tr / tl * (tc - 1);
    const V9a0 = Math.sqrt(2 / (g - 1) * tl / (tr * tc) * (tr * tc * tt - 1)), F = a0 * (V9a0 - M0), f = cp * T0 / hPR * (tl - tr * tc), S = f / F * 1e6;
    return num(`An ideal turbojet flies at Mach ${M0} where the air is at ${T0} K (γ = 1.4, c_p = 1004 J/kg·K). Its compressor pressure ratio is ${pc}, turbine inlet temperature ${Tt4} K, and fuel heating value 42 800 kJ/kg; the nozzle expands to ambient pressure. What is ${ask === 'F' ? 'its specific thrust F/ṁ, in N·s/kg' : 'its thrust-specific fuel consumption, in mg/(N·s)'}? (4 significant figures)`, r4(ask === 'F' ? F : S),
      `τ_r = ${r4(tr)}, τ_c = ${r4(tc)}, τ_λ = ${r4(tl)}, τ_t = 1 − (τ_r/τ_λ)(τ_c − 1) = ${r4(tt)}. V₉/a₀ = ${r4(V9a0)}, so F/ṁ = a₀(V₉/a₀ − M₀) = ${r4(F)} N·s/kg; f = ${r4(f)}, TSFC = f/(F/ṁ) = ${r4(S)} mg/(N·s).`,
      `import math\n# march through the engine: stagnation temperatures and pressures station by station, isentropic states by bisection\ng, cp, T0, M0, pc, Tt4, hPR = 1.4, 1004.0, ${T0}, ${M0}, ${pc}, ${Tt4}, 42.8e6\nR = cp * (g - 1) / g\ndef iso(Ta, pr):  # temperature after an isentropic pressure change\n    lo, hi = 1.0, 1e4\n    for _ in range(200):\n        m = (lo + hi) / 2\n        lo, hi = (m, hi) if cp * math.log(m / Ta) - R * math.log(pr) < 0 else (lo, m)\n    return lo\nV0 = M0 * math.sqrt(g * R * T0)\nTt2 = T0 + V0 * V0 / (2 * cp); pt2 = (Tt2 / T0) ** (cp / R)          # relative to ambient pressure\nTt3 = iso(Tt2, pc); pt3 = pt2 * pc\nf = cp * (Tt4 - Tt3) / hPR\nTt5 = Tt4 - (Tt3 - Tt2)                                                   # turbine drives the compressor\npt5 = pt3 * (Tt5 / Tt4) ** (cp / R)\nT9 = iso(Tt5, 1 / pt5)\nV9 = math.sqrt(2 * cp * (Tt5 - T9))\nF = V9 - V0\nprint(${ask === 'F' ? 'F' : 'f / F * 1e6'})`);
  }),

  SKILL('prop.rocket', 'The rocket equation', 'With exhaust velocity c = I_sp·g₀, a rocket burning from mass m₀ to m_f gains Δv = c·ln(m₀/m_f), however fast it burns (ignoring gravity and drag).', t => {
    const Isp = t.pick([250, 300, 350, 450]), m0 = t.pick([1000, 5000, 20000]), frac = t.pick([0.6, 0.7, 0.8, 0.85]), ask = t.pick(['dv', 'mp']), dvT = t.pick([2000, 3000, 4000]);
    const c = Isp * 9.80665, dv = c * Math.log(1 / (1 - frac)), mp = m0 * (1 - Math.exp(-dvT / c));
    return num(ask === 'dv' ? `A stage with I_sp = ${Isp} s starts at ${m0} kg, ${frac * 100}% of it propellant. Ignoring gravity and drag, what Δv does it give, in m/s? (4 significant figures)` : `A ${m0} kg spacecraft (I_sp = ${Isp} s) needs ${dvT} m/s of Δv. How much propellant must it burn, in kg? (4 significant figures)`, r4(ask === 'dv' ? dv : mp),
      `c = I_sp·g₀ = ${r4(c)} m/s. ${ask === 'dv' ? `Δv = c·ln(m₀/m_f) = ${r4(dv)} m/s.` : `m_f = m₀e^(−Δv/c), so the propellant is m₀(1 − e^(−Δv/c)) = ${r4(mp)} kg.`}`,
      `import math\n# integrate dv/dt = mdot c / m(t) for a steady burn (RK4), stopping at the burnout mass\nc, m0 = ${Isp} * 9.80665, ${m0}\nmdot = m0 / 100.0\ndef burn(mf, n=20000):\n    T = (m0 - mf) / mdot; h = T / n; v = 0.0\n    a = lambda t: mdot * c / (m0 - mdot * t)\n    for k in range(n):\n        t = k * h\n        v += h / 6 * (a(t) + 4 * a(t + h / 2) + a(t + h))\n    return v\n${ask === 'dv' ? `print(burn(m0 * (1 - ${frac})))` : `lo, hi = 1e-6, m0\nfor _ in range(100):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if burn(m, 4000) > ${dvT} else (lo, m)\nprint(m0 - lo)`}`);
  }),

  SKILL('prop.nozzle', 'Rocket nozzle exhaust velocity', 'Expanding chamber gas isentropically to the exit pressure turns enthalpy into speed: V_e = √(2γ/(γ−1)·(R̄/M)T_c·(1 − (p_e/p_c)^((γ−1)/γ))). Specific impulse is V_e/g₀.', t => {
    const Tc = t.pick([2800, 3200, 3500]), M = t.pick([12, 18, 22, 25]), gam = t.pick([1.2, 1.25]), pc = t.pick([5, 7, 10, 20]), pe = t.pick([0.05, 0.1, 0.101325]), ask = t.pick(['V', 'Isp']);
    const R = 8314.46 / M, Ve = Math.sqrt(2 * gam / (gam - 1) * R * Tc * (1 - (pe / pc) ** ((gam - 1) / gam)));
    return num(`A rocket chamber holds gas at ${Tc} K and ${pc} MPa (molar mass ${M} kg/kmol, γ = ${gam}). The nozzle expands it isentropically to ${pe} MPa. What is ${ask === 'V' ? 'the exhaust velocity, in m/s' : 'the specific impulse at optimum expansion, in s'}? (4 significant figures)`, r4(ask === 'V' ? Ve : Ve / 9.80665),
      `R = 8314/M = ${r4(R)} J/kg·K. V_e = √(2γ/(γ−1)·RT_c·(1 − (p_e/p_c)^((γ−1)/γ))) = ${r4(Ve)} m/s; I_sp = V_e/g₀ = ${r4(Ve / 9.80665)} s.`,
      `import math\n# find the exit temperature by bisecting on zero entropy change, then V = sqrt(2 cp (Tc - Te))\nTc, M, g, pc, pe = ${Tc}, ${M}, ${gam}, ${pc}, ${pe}\nR = 8314.46 / M; cp = g * R / (g - 1)\nlo, hi = 1.0, Tc\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if cp * math.log(m / Tc) - R * math.log(pe / pc) < 0 else (lo, m)\nV = math.sqrt(2 * cp * (Tc - lo))\nprint(${ask === 'V' ? 'V' : 'V / 9.80665'})`);
  }),

  SKILL('prop.breguet', 'Cruise range: Breguet', 'In steady cruise thrust equals drag = W/(L/D), so a jet burning fuel at rate c·T covers R = (V/c)(L/D)ln(W_i/W_f).', t => {
    const V = t.pick([200, 230, 250]), LD = t.pick([15, 17, 18, 20]), c = t.pick([0.5, 0.55, 0.6, 0.7]) / 3600, Wi = t.pick([400, 600, 800]) * 1e3, ff = t.pick([0.2, 0.25, 0.3, 0.35]);
    const Wf = Wi * (1 - ff), R = V / c * LD * Math.log(Wi / Wf) / 1000;
    return num(`A jet cruises at ${V} m/s with L/D = ${LD} and thrust-specific fuel consumption ${r4(c * 3600)} per hour (fuel weight per unit thrust per hour). It starts cruise at ${Wi / 1000} kN and burns ${ff * 100}% of that weight as fuel. What is its range, in km? (4 significant figures)`, r4(R),
      `R = (V/c)(L/D)ln(W_i/W_f) = (${V}/${r4(c)})·${LD}·ln(1/${r4(1 - ff)}) = ${r4(R)} km.`,
      `import math\n# integrate the weight down in time: dW/dt = -c T with T = D = W/(L/D); distance = V t\nV, LD, c, Wi, Wf = ${V}, ${LD}, ${c}, ${Wi}, ${Wf}\nf = lambda W: -c * W / LD\nW, t, dt = Wi, 0.0, 10.0\nwhile True:\n    k1 = f(W); k2 = f(W + dt / 2 * k1); k3 = f(W + dt / 2 * k2); k4 = f(W + dt * k3)\n    nW = W + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)\n    if nW <= Wf: t += dt * (W - Wf) / (W - nW); break\n    W, t = nW, t + dt\nprint(V * t / 1000)`);
  }),

  SKILL('en.lmtd', 'Sizing a heat exchanger: LMTD', 'For a counterflow exchanger, q = UA·ΔT_lm with ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂) across the two ends; given the temperatures, that fixes the area.', t => {
    let mh, cph, Thi, Tho, Tci, mc, q, Tco;
    do { mh = t.pick([0.5, 1, 2]); cph = t.pick([2000, 4180]); Thi = t.pick([120, 150]); Tho = t.pick([60, 70, 80]); Tci = t.pick([15, 20]); mc = t.pick([1, 1.5, 2]); q = mh * cph * (Thi - Tho); Tco = Tci + q / (mc * 4180); } while (Thi - Tco < 5 || Tho - Tci < 5);
    const U = t.pick([300, 500, 800, 1000]), d1 = Thi - Tco, d2 = Tho - Tci, lm = Math.abs(d1 - d2) < 1e-9 ? d1 : (d1 - d2) / Math.log(d1 / d2), A = q / (U * lm);
    return num(`A counterflow heat exchanger (U = ${U} W/m²K) must cool ${mh} kg/s of a liquid (c_p = ${cph} J/kg·K) from ${Thi} °C to ${Tho} °C with ${mc} kg/s of water (c_p = 4180) entering at ${Tci} °C. What area does it need, in m²? (4 significant figures)`, r4(A),
      `q = ${r4(q / 1000)} kW; water leaves at ${r4(Tco)} °C. End differences ${r4(d1)} and ${r4(d2)} K give ΔT_lm = ${r4(lm)} K, so A = q/(UΔT_lm) = ${r4(A)} m².`,
      `# with the cold outlet from the energy balance, march both streams from the hot end (RK4) until the hot stream reaches its outlet; the area used is the answer\nCh, Cc, U, Thi, Tho, Tci = ${mh * cph}, ${mc * 4180}, ${U}, ${Thi}, ${Tho}, ${Tci}\nTco = Tci + Ch * (Thi - Tho) / Cc\nf = lambda Th, Tc: (-U * (Th - Tc) / Ch, -U * (Th - Tc) / Cc)\nTh, Tc, A, dA = Thi, Tco, 0.0, 1e-3\nwhile True:\n    a = f(Th, Tc); b = f(Th + dA / 2 * a[0], Tc + dA / 2 * a[1]); c = f(Th + dA / 2 * b[0], Tc + dA / 2 * b[1]); d = f(Th + dA * c[0], Tc + dA * c[1])\n    nTh = Th + dA / 6 * (a[0] + 2 * b[0] + 2 * c[0] + d[0]); nTc = Tc + dA / 6 * (a[1] + 2 * b[1] + 2 * c[1] + d[1])\n    if nTh <= Tho: A += dA * (Th - Tho) / (Th - nTh); break\n    Th, Tc, A = nTh, nTc, A + dA\nprint(A)`);
  }),

  SKILL('en.insulation', 'Economic insulation thickness', 'More insulation costs more to buy but less to run. The best thickness minimises the annual total of capital charge and lost-heat cost.', t => {
    const r1 = t.pick([25, 50, 75]) / 1000, Ts = t.pick([120, 150, 180]), Ta = 20, h = t.pick([8, 10, 15]), k = t.pick([0.035, 0.04, 0.05]), cins = t.pick([300, 500, 800]), crf = t.pick([0.1, 0.12, 0.15]), ce = t.pick([0.03, 0.05, 0.08]);
    const q = th => (Ts - Ta) / (Math.log((r1 + th) / r1) / (2 * Math.PI * k) + 1 / (2 * Math.PI * (r1 + th) * h));
    const cost = th => cins * Math.PI * ((r1 + th) ** 2 - r1 * r1) * crf + q(th) * 8760 / 1000 * ce;
    let lo = 0, hi = 0.5; const gr = (Math.sqrt(5) - 1) / 2; for (let i = 0; i < 200; i++) { const a = hi - gr * (hi - lo), b = lo + gr * (hi - lo); if (cost(a) < cost(b)) hi = b; else lo = a; }
    const best = (lo + hi) / 2;
    return num(`A steam pipe of outer radius ${r1 * 1000} mm at ${Ts} °C runs year-round in ${Ta} °C air (h = ${h} W/m²K). Insulation (k = ${k} W/m·K) costs $${cins} per m³ installed, charged at a capital recovery factor of ${crf} per year; heat costs $${ce} per kWh. Per metre of pipe, what insulation thickness minimises the total annual cost, in mm? (4 significant figures)`, r4(best * 1000),
      `Annual cost = c_ins·π((r₁ + t)² − r₁²)·CRF + q′(t)·8760 h·c_e, with q′ through the insulation and outer film. Its minimum is at t = ${r4(best * 1000)} mm (heat loss ${r4(q(best))} W/m).`,
      `import math\n# bisect on where the derivative of the annual cost changes sign\nr1, Ts, Ta, h, k, cins, crf, ce = ${r1}, ${Ts}, ${Ta}, ${h}, ${k}, ${cins}, ${crf}, ${ce}\nq = lambda t: (Ts - Ta) / (math.log((r1 + t) / r1) / (2 * math.pi * k) + 1 / (2 * math.pi * (r1 + t) * h))\ncost = lambda t: cins * math.pi * ((r1 + t) ** 2 - r1 * r1) * crf + q(t) * 8760 / 1000 * ce\nd = lambda t: (cost(t + 1e-7) - cost(t - 1e-7)) / 2e-7\nlo, hi = 1e-6, 0.5\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if d(m) < 0 else (lo, m)\nprint(lo * 1000)`);
  }),

  SKILL('en.lcoe', 'Levelised cost of energy', 'LCOE spreads a plant\'s lifetime cost over its lifetime output, both discounted: for constant output, (CRF·capital + annual O&M)/(annual energy).', t => {
    const capex = t.pick([1000, 1500, 2500, 4000]), om = t.pick([20, 30, 50]), cf = t.pick([0.2, 0.25, 0.35, 0.5, 0.9]), n = t.pick([20, 25, 30]), i = t.pick([0.05, 0.07, 0.08]);
    const crf = i * (1 + i) ** n / ((1 + i) ** n - 1), lcoe = (crf * capex + om) / (8760 * cf) * 100;
    return num(`A power plant costs $${capex} per kW to build, $${om} per kW-year to operate, runs at a ${cf * 100}% capacity factor for ${n} years, and is financed at ${i * 100}%. What is its levelised cost of energy, in cents per kWh? (4 significant figures)`, r4(lcoe),
      `CRF = i(1 + i)ⁿ/((1 + i)ⁿ − 1) = ${r4(crf)}. Annual cost per kW = ${r4(crf * capex + om)} $; annual energy per kW = 8760·${cf} = ${r4(8760 * cf)} kWh. LCOE = ${r4(lcoe)} ¢/kWh.`,
      `# discount every year's cost and every year's energy, then divide\ncapex, om, cf, n, i = ${capex}, ${om}, ${cf}, ${n}, ${i}\ncost = capex + sum(om / (1 + i) ** t for t in range(1, n + 1))\nenergy = sum(8760 * cf / (1 + i) ** t for t in range(1, n + 1))\nprint(cost / energy * 100)`);
  }),

  SKILL('en.storage', 'Hot-water thermal storage', 'A mixed tank holding mass m loses heat at UA(T − T_amb) and cools exponentially with time constant mc/UA; drawing hot water with cold make-up dilutes it with time constant m/ṁ.', t => {
    const V = t.pick([0.2, 0.3, 0.5, 1]), Th = t.pick([60, 70, 80]), Tmin = t.pick([45, 50]), Tamb = t.pick([15, 20]), UA = t.pick([1, 2, 3]), Tcold = t.pick([10, 15]), mdot = t.pick([0.05, 0.1, 0.2]), mode = t.pick(['standby', 'draw']);
    const m = 1000 * V, c = 4180, tStand = m * c / UA * Math.log((Th - Tamb) / (Tmin - Tamb)) / 3600, tDraw = m / mdot * Math.log((Th - Tcold) / (Tmin - Tcold)) / 60;
    return num(mode === 'standby' ? `A well-mixed ${V} m³ water tank at ${Th} °C stands in a ${Tamb} °C room and loses heat at UA = ${UA} W/K. With nothing drawn off, how long until it cools to ${Tmin} °C, in hours? (4 significant figures)` : `A well-mixed ${V} m³ tank of water at ${Th} °C supplies hot water at ${mdot} kg/s, refilled with ${Tcold} °C mains water. Ignoring losses, how long until the outlet falls to ${Tmin} °C, in minutes? (4 significant figures)`, r4(mode === 'standby' ? tStand : tDraw),
      mode === 'standby' ? `Time constant mc/UA = ${r4(m * c / UA / 3600)} h; t = (mc/UA)·ln((T₀ − T_amb)/(T − T_amb)) = ${r4(tStand)} h.` : `Time constant m/ṁ = ${r4(m / mdot / 60)} min; t = (m/ṁ)·ln((T₀ − T_cold)/(T − T_cold)) = ${r4(tDraw)} min.`,
      `# integrate the tank's energy balance in time (RK4)\nm, c, Th, Tmin = ${m}, 4180, ${Th}, ${Tmin}\n${mode === 'standby' ? `UA, Tamb = ${UA}, ${Tamb}\nf = lambda T: -UA * (T - Tamb) / (m * c)\ndt = 10.0; scale = 3600` : `mdot, Tcold = ${mdot}, ${Tcold}\nf = lambda T: mdot * (Tcold - T) / m\ndt = 0.5; scale = 60`}\nT, t = Th, 0.0\nwhile True:\n    k1 = f(T); k2 = f(T + dt / 2 * k1); k3 = f(T + dt / 2 * k2); k4 = f(T + dt * k3)\n    nT = T + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)\n    if nT <= Tmin: t += dt * (T - Tmin) / (T - nT); break\n    T, t = nT, t + dt\nprint(t / scale)`);
  }),

  SKILL('en.windresource', 'Wind resource from a Weibull distribution', 'Wind speeds at a site often follow a Weibull distribution (shape k, scale c). Mean speed is cΓ(1 + 1/k), but mean power density is ½ρc³Γ(1 + 3/k) — far more than ½ρv̄³, because power goes as v³.', t => {
    const k = t.pick([1.6, 1.8, 2, 2.2, 2.5]), c = t.pick([5, 6, 7, 8, 9]), rho = 1.225, ask = t.pick(['vbar', 'P', 'ratio']);
    const G = x => Math.exp(lgamma(x)), vbar = c * G(1 + 1 / k), P = 0.5 * rho * c ** 3 * G(1 + 3 / k), ratio = P / (0.5 * rho * vbar ** 3);
    return num(`Wind speeds at a site follow a Weibull distribution with shape k = ${k} and scale c = ${c} m/s (ρ = 1.225 kg/m³). What is ${{ vbar: 'the mean wind speed, in m/s', P: 'the mean wind power density, in W/m²', ratio: 'the ratio of the mean power density to the power density at the mean speed' }[ask]}? (4 significant figures)`, r4({ vbar, P, ratio }[ask]),
      `v̄ = cΓ(1 + 1/k) = ${r4(vbar)} m/s. Mean power density ½ρc³Γ(1 + 3/k) = ${r4(P)} W/m², which is ${r4(ratio)} times ½ρv̄³.`,
      `import math\n# integrate over the speed distribution\nk, c, rho = ${k}, ${c}, 1.225\nf = lambda v: k / c * (v / c) ** (k - 1) * math.exp(-((v / c) ** k))\nn = 200000; top = 10 * c; h = top / n\nsimp = lambda g: (g(1e-12) + g(top) + sum((4 if i % 2 else 2) * g(i * h) for i in range(1, n))) * h / 3\nvbar = simp(lambda v: v * f(v)); P = simp(lambda v: 0.5 * rho * v ** 3 * f(v))\nprint(${{ vbar: 'vbar', P: 'P', ratio: 'P / (0.5 * rho * vbar ** 3)' }[ask]})`);
  }),
];
