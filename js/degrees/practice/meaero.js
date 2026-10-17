/**
 * Mechanical Engineering: aerodynamics, compressible flow and energy
 * conversion (16.100, NASA Glenn's Beginner's Guide, 2.60J; FE Mechanical
 * topics 10.F–10.I and 11).
 *
 * Checks take another route: the atmosphere by integrating hydrostatic
 * balance, finite wings by solving Prandtl's lifting-line equation by
 * collocation, area ratios from explicit mass fluxes, normal shocks from the
 * three conservation laws, oblique shocks from the density-ratio form of the
 * shock relation, choked flow from the sonic state, best glide by searching
 * the polar, pump work from velocity vectors, similarity by matching
 * coefficients, flame temperature from an atom balance, fuel cells from the
 * equilibrium constant and electron counting, batteries by bisection, wind
 * power by optimising the actuator disc, and solar energy by integrating
 * through the day.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const G = 1.4, rad = d => d * Math.PI / 180;

export const MEAERO = [
  SKILL('aero.isa', 'The standard atmosphere', 'In the troposphere temperature falls 6.5 K per km from 288.15 K; hydrostatic balance then gives p = 101.325(T/288.15)^5.256 kPa and ρ = p/RT.', t => {
    const h = t.pick([1000, 2000, 3000, 5000, 8000, 10000]), ask = t.pick(['T', 'p', 'rho', 'a']);
    const T = 288.15 - 0.0065 * h, p = 101325 * (T / 288.15) ** (9.80665 / (287.05 * 0.0065)), rho = p / (287.05 * T), a = Math.sqrt(G * 287.05 * T);
    return num(`In the International Standard Atmosphere (T₀ = 288.15 K, p₀ = 101.325 kPa, lapse rate 6.5 K/km, R = 287.05 J/kg·K, g = 9.80665 m/s²), what is ${{ T: 'the temperature', p: 'the pressure, in kPa', rho: 'the density, in kg/m³', a: 'the speed of sound, in m/s' }[ask]} at ${h} m? (4 significant figures${ask === 'T' ? ', in K' : ''})`, r4({ T, p: p / 1000, rho, a }[ask]),
      `T = 288.15 − 0.0065h = ${r4(T)} K; p = p₀(T/T₀)^(g/RL) = ${r4(p / 1000)} kPa; ρ = p/RT = ${r4(rho)} kg/m³; a = √(γRT) = ${r4(a)} m/s.`,
      `import math\n# integrate dp/dh = -rho g with rho = p/(R T(h)) upward from sea level (RK4)\nR, g, h_end = 287.05, 9.80665, ${h}\nT = lambda h: 288.15 - 0.0065 * h\nf = lambda h, p: -p / (R * T(h)) * g\np, h, dh = 101325.0, 0.0, 1.0\nwhile h < h_end - 1e-9:\n    k1 = f(h, p); k2 = f(h + dh / 2, p + dh / 2 * k1); k3 = f(h + dh / 2, p + dh / 2 * k2); k4 = f(h + dh, p + dh * k3)\n    p += dh / 6 * (k1 + 2 * k2 + 2 * k3 + k4); h += dh\nTe = T(h_end)\nprint(${{ T: 'Te', p: 'p / 1000', rho: 'p / (R * Te)', a: 'math.sqrt(1.4 * R * Te)' }[ask]})`);
  }),

  SKILL('aero.liftline', 'Finite wings: lift and induced drag', 'An elliptically loaded wing of aspect ratio AR has lift slope a₀/(1 + a₀/(πAR)), with a₀ = 2π per radian, and induced drag C_Di = C_L²/(πAR).', t => {
    const AR = t.pick([4, 6, 8, 10, 12]), alpha = t.pick([2, 3, 4, 5, 6]), ask = t.pick(['CL', 'CDi']);
    const a0 = 2 * Math.PI, a = a0 / (1 + a0 / (Math.PI * AR)), CL = a * rad(alpha), CDi = CL * CL / (Math.PI * AR);
    return num(`An untwisted wing with an elliptical planform, aspect ratio ${AR}, uses thin airfoils (lift slope 2π per radian) at ${alpha}° above their zero-lift angle. By lifting-line theory, what is ${ask === 'CL' ? 'its lift coefficient' : 'its induced-drag coefficient'}? (4 significant figures)`, r4(ask === 'CL' ? CL : CDi),
      `Lift slope a = 2π/(1 + 2π/(π·${AR})) = ${r4(a)} per rad, so C_L = ${r4(CL)}. Induced drag C_L²/(πAR) = ${r4(CDi)}.`,
      `import math\n# Prandtl's lifting line by collocation: Gamma = 2 b V sum A_n sin(n th), elliptical chord c = c0 sin th\nAR, alpha = ${AR}, math.radians(${alpha})\nb = 1.0; S = b * b / AR; c0 = 4 * S / (math.pi * b); a0 = 2 * math.pi\nN = 15; ths = [(i + 0.5) * math.pi / (2 * N) for i in range(N)]   # half span, odd terms by symmetry\nns = [2 * k + 1 for k in range(N)]\nM = []\nfor th in ths:\n    c = c0 * math.sin(th); mu = c * a0 / (4 * b)\n    M.append([math.sin(n * th) * (1 + mu * n / math.sin(th)) for n in ns] + [mu * alpha])\nfor col in range(N):\n    p = max(range(col, N), key=lambda r: abs(M[r][col])); M[col], M[p] = M[p], M[col]\n    for r in range(N):\n        if r != col: f = M[r][col] / M[col][col]; M[r] = [x - f * y for x, y in zip(M[r], M[col])]\nA = [M[i][N] / M[i][i] for i in range(N)]\nCL = math.pi * AR * A[0]\nCDi = math.pi * AR * sum(n * a * a for n, a in zip(ns, A))\nprint(${ask === 'CL' ? 'CL' : 'CDi'})`);
  }),

  SKILL('aero.isentropic', 'Isentropic compressible flow', 'Along an isentropic streamtube, T₀/T = 1 + ((γ−1)/2)M², p₀/p = (T₀/T)^(γ/(γ−1)), and the area relative to the sonic throat is A/A* = (1/M)[(2/(γ+1))(1 + ((γ−1)/2)M²)]^((γ+1)/(2(γ−1))).', t => {
    const ask = t.pick(['T', 'p', 'A', 'M']), M = t.pick([0.3, 0.5, 0.8, 1.5, 2, 2.5, 3]), AA = t.pick([1.2, 1.5, 2, 3, 4]);
    const Tr = 1 + 0.2 * M * M, pr = Tr ** 3.5, ar = m => (1 / m) * ((2 / 2.4) * (1 + 0.2 * m * m)) ** 3;
    let lo = 1, hi = 10; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (ar(m) < AA) lo = m; else hi = m; }
    const ans = { T: Tr, p: pr, A: ar(M), M: lo }[ask];
    return num(ask === 'M' ? `Air (γ = 1.4) expands isentropically through a nozzle. Where the area is ${AA} times the throat area on the supersonic side, what is the Mach number? (4 significant figures)` : `Air (γ = 1.4) flows isentropically at Mach ${M}. What is ${{ T: 'the stagnation-to-static temperature ratio T₀/T', p: 'the stagnation-to-static pressure ratio p₀/p', A: 'the area ratio A/A*' }[ask]}? (4 significant figures)`, r4(ans),
      ask === 'M' ? `Solve A/A* = ${AA} on the supersonic branch: M = ${r4(lo)}.` : `T₀/T = 1 + 0.2M² = ${r4(Tr)}; p₀/p = (T₀/T)^3.5 = ${r4(pr)}; A/A* = ${r4(ar(M))}.`,
      `import math\n# work from the flow itself: temperature, density and velocity at each Mach number, then the mass flux per area\ng = 1.4\ndef state(M):\n    T = 1 / (1 + (g - 1) / 2 * M * M); rho = T ** (1 / (g - 1)); V = M * math.sqrt(T)\n    return T, rho, V\nflux = lambda M: state(M)[1] * state(M)[2]\nratio = lambda M: flux(1.0) / flux(M)\n${ask === 'M' ? `lo, hi = 1.0, 10.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if ratio(m) < ${AA} else (lo, m)\nprint(lo)` : `M = ${M}\nT = state(M)[0]\nprint(${{ T: '1 / T', p: '(1 / T) ** (g / (g - 1))', A: 'ratio(M)' }[ask]})`}`);
  }),

  SKILL('aero.shock', 'Normal shocks', 'Across a normal shock mass, momentum and energy are conserved: M₂² = (1 + 0.2M₁²)/(1.4M₁² − 0.2) for air, pressure jumps by 1 + (2γ/(γ+1))(M₁² − 1), and stagnation pressure is lost.', t => {
    const M1 = t.pick([1.2, 1.5, 1.8, 2, 2.5, 3, 4]), ask = t.pick(['M2', 'p', 'T', 'p0']);
    const M2 = Math.sqrt((1 + 0.2 * M1 * M1) / (G * M1 * M1 - 0.2)), pr = 1 + 2 * G / (G + 1) * (M1 * M1 - 1), rr = (G + 1) * M1 * M1 / ((G - 1) * M1 * M1 + 2), Tr = pr / rr;
    const p0r = pr * ((1 + 0.2 * M2 * M2) / (1 + 0.2 * M1 * M1)) ** 3.5;
    return num(`Air (γ = 1.4) at Mach ${M1} passes through a normal shock. What is ${{ M2: 'the downstream Mach number', p: 'the static pressure ratio p₂/p₁', T: 'the static temperature ratio T₂/T₁', p0: 'the stagnation pressure ratio p₀₂/p₀₁' }[ask]}? (4 significant figures)`, r4({ M2, p: pr, T: Tr, p0: p0r }[ask]),
      `M₂ = ${r4(M2)}; p₂/p₁ = ${r4(pr)}; ρ₂/ρ₁ = ${r4(rr)}, so T₂/T₁ = ${r4(Tr)}; p₀₂/p₀₁ = ${r4(p0r)} (the loss is entropy generated in the shock).`,
      `import math\n# solve the three conservation laws for the downstream velocity (p1 = rho1 = 1), skipping the trivial root u2 = u1\ng, M1 = 1.4, ${M1}\nu1 = M1 * math.sqrt(g)\ndef resid(u2):\n    rho2 = u1 / u2; p2 = 1 + u1 * u1 - u1 * u2\n    return g / (g - 1) * p2 / rho2 + u2 * u2 / 2 - (g / (g - 1) + u1 * u1 / 2)\nlo, hi = u1 / 6 * 1.0001, u1 * (1 - 1e-7)\nfor _ in range(300):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if (resid(m) > 0) == (resid(lo) > 0) else (lo, m)\nu2 = lo; rho2 = u1 / u2; p2 = 1 + u1 * u1 - u1 * u2; T2 = p2 / rho2\nM2 = u2 / math.sqrt(g * T2)\np0 = lambda p, M: p * (1 + (g - 1) / 2 * M * M) ** (g / (g - 1))\nprint(${{ M2: 'M2', p: 'p2', T: 'T2', p0: 'p0(p2, M2) / p0(1.0, M1)' }[ask]})`);
  }),

  SKILL('aero.oblique', 'Oblique shocks', 'A supersonic flow turned through a wedge angle θ forms an oblique shock at angle β; only the normal component M₁sin β is shocked. The weak solution is the one usually seen.', t => {
    const M1 = t.pick([1.8, 2, 2.5, 3, 4]), th = t.pick([5, 8, 10, 12, 15]), ask = t.pick(['beta', 'M2', 'p']);
    const tanth = b => 2 / Math.tan(b) * (M1 * M1 * Math.sin(b) ** 2 - 1) / (M1 * M1 * (G + Math.cos(2 * b)) + 2);
    const mu = Math.asin(1 / M1); let bmax = mu, best = -1; for (let i = 0; i <= 20000; i++) { const b = mu + (Math.PI / 2 - mu) * i / 20000, v = tanth(b); if (v > best) { best = v; bmax = b; } }
    let lo = mu, hi = bmax; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (tanth(m) < Math.tan(rad(th))) lo = m; else hi = m; }
    const beta = lo, Mn1 = M1 * Math.sin(beta), Mn2 = Math.sqrt((1 + 0.2 * Mn1 * Mn1) / (G * Mn1 * Mn1 - 0.2)), M2 = Mn2 / Math.sin(beta - rad(th)), pr = 1 + 2 * G / (G + 1) * (Mn1 * Mn1 - 1);
    return num(`Air (γ = 1.4) at Mach ${M1} meets a wedge that turns it through ${th}°, forming a weak attached oblique shock. What is ${{ beta: 'the shock angle β, in degrees', M2: 'the downstream Mach number', p: 'the pressure ratio p₂/p₁' }[ask]}? (4 significant figures)`, r4({ beta: beta * 180 / Math.PI, M2, p: pr }[ask]),
      `Solve the θ–β–M relation for the weak root: β = ${r4(beta * 180 / Math.PI)}°. Normal Mach M₁sin β = ${r4(Mn1)}; after the shock Mₙ₂ = ${r4(Mn2)}, so M₂ = Mₙ₂/sin(β − θ) = ${r4(M2)}; p₂/p₁ = ${r4(pr)}.`,
      `import math\n# the shock as a normal shock on M1 sin(beta): the density ratio must match tan(beta)/tan(beta - theta); first root above the Mach angle\ng, M1, th = 1.4, ${M1}, math.radians(${th})\ndef f(b):\n    Mn = M1 * math.sin(b)\n    return math.tan(b - th) / math.tan(b) - ((g - 1) * Mn * Mn + 2) / ((g + 1) * Mn * Mn)\nmu = math.asin(1 / M1)\nbs = [max(mu, th) + 1e-6 + (math.pi / 2 - max(mu, th) - 2e-6) * i / 20000 for i in range(20001)]\nlo = next(bs[i] for i in range(20000) if (f(bs[i]) > 0) != (f(bs[i + 1]) > 0)); hi = lo + (bs[1] - bs[0])\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if (f(m) > 0) == (f(lo) > 0) else (lo, m)\nb = lo; Mn1 = M1 * math.sin(b); Mn2 = math.sqrt((1 + (g - 1) / 2 * Mn1 ** 2) / (g * Mn1 ** 2 - (g - 1) / 2))\nprint(${{ beta: 'math.degrees(b)', M2: 'Mn2 / math.sin(b - th)', p: '1 + 2 * g / (g + 1) * (Mn1 ** 2 - 1)' }[ask]})`);
  }),

  SKILL('aero.nozzle', 'Choked mass flow', 'Once a nozzle chokes, its mass flow depends only on the throat and the reservoir: ṁ = A*p₀√(γ/RT₀)·(2/(γ+1))^((γ+1)/(2(γ−1))).', t => {
    const p0 = t.pick([200, 500, 1000, 2000]), T0 = t.pick([300, 500, 800, 1200]), d = t.pick([10, 20, 30, 50]), R = 287;
    const A = Math.PI * (d / 1000) ** 2 / 4, m = A * p0 * 1e3 * Math.sqrt(G / (R * T0)) * (2 / (G + 1)) ** ((G + 1) / (2 * (G - 1)));
    return num(`Air (γ = 1.4, R = 287 J/kg·K) flows from a reservoir at ${p0} kPa and ${T0} K through a nozzle with a ${d} mm throat, which is choked. What is the mass flow, in kg/s? (4 significant figures)`, r4(m),
      `ṁ = A*p₀√(γ/RT₀)(2/(γ+1))^3 = ${r4(m)} kg/s.`,
      `import math\n# compute the sonic state at the throat, then rho* a* A*\ng, R, p0, T0, d = 1.4, 287.0, ${p0} * 1e3, ${T0}, ${d} / 1000\nTs = T0 * 2 / (g + 1); ps = p0 * (Ts / T0) ** (g / (g - 1)); rhos = ps / (R * Ts); a = math.sqrt(g * R * Ts)\nprint(rhos * a * math.pi * d * d / 4)`);
  }),

  SKILL('aero.polar', 'Drag polar and best glide', 'With C_D = C_D0 + kC_L², k = 1/(πeAR), the lift-to-drag ratio peaks at C_L = √(C_D0/k), where induced and parasite drag are equal: (L/D)max = 1/(2√(kC_D0)).', t => {
    const CD0 = t.pick([0.015, 0.02, 0.025, 0.03]), e = t.pick([0.75, 0.8, 0.85]), AR = t.pick([6, 8, 10, 15, 25]), W = t.pick([5000, 10000, 50000]), S = t.pick([10, 15, 30]), rho = 1.225, ask = t.pick(['LD', 'CL', 'V']);
    const k = 1 / (Math.PI * e * AR), CL = Math.sqrt(CD0 / k), LD = 1 / (2 * Math.sqrt(k * CD0)), V = Math.sqrt(2 * W / (rho * S * CL));
    return num(`An aircraft has C_D = ${CD0} + kC_L² with Oswald efficiency ${e} and aspect ratio ${AR}${ask === 'V' ? `, weight ${W} N and wing area ${S} m², at sea level (ρ = 1.225 kg/m³)` : ''}. What is ${{ LD: 'its maximum lift-to-drag ratio', CL: 'the lift coefficient for best glide', V: 'its best-glide airspeed, in m/s' }[ask]}? (4 significant figures)`, r4({ LD, CL, V }[ask]),
      `k = 1/(πeAR) = ${r4(k)}. Best glide at C_L = √(C_D0/k) = ${r4(CL)}, (L/D)max = 1/(2√(kC_D0)) = ${r4(LD)}; V = √(2W/(ρSC_L)) = ${r4(V)} m/s.`,
      `import math\n# golden-section search over C_L for the largest C_L/C_D\nCD0, e, AR, W, S, rho = ${CD0}, ${e}, ${AR}, ${W}, ${S}, 1.225\nk = 1 / (math.pi * e * AR)\nLD = lambda CL: CL / (CD0 + k * CL * CL)\nlo, hi, gr = 0.01, 5.0, (5 ** 0.5 - 1) / 2\nfor _ in range(200):\n    a, b = hi - gr * (hi - lo), lo + gr * (hi - lo)\n    lo, hi = (a, hi) if LD(a) < LD(b) else (lo, b)\nCL = (lo + hi) / 2\nprint(${{ LD: 'LD(CL)', CL: 'CL', V: 'math.sqrt(2 * W / (rho * S * CL))' }[ask]})`);
  }),

  SKILL('en.euler', 'Pump impellers: the Euler equation', 'An impeller adds energy by changing the fluid\'s angular momentum: w = U₂V_θ2 − U₁V_θ1. With no inlet swirl and backward-curved blades, V_θ2 = U₂ − V_r2 cot β₂.', t => {
    const r2 = t.pick([0.1, 0.125, 0.15, 0.2]), b2 = t.pick([0.01, 0.015, 0.02]), beta = t.pick([20, 25, 30, 35]), N = t.pick([1450, 1750, 2900]), Q = t.pick([0.01, 0.02, 0.04]), ask = t.pick(['H', 'P']);
    const U = N * 2 * Math.PI / 60 * r2, Vr = Q / (2 * Math.PI * r2 * b2), Vt = U - Vr / Math.tan(rad(beta)), H = U * Vt / 9.81, P = 1000 * 9.81 * Q * H / 1000;
    return num(`A centrifugal pump impeller has outlet radius ${r2} m, outlet width ${b2} m and backward-curved blades at β₂ = ${beta}° from the tangent, turning at ${N} rpm and passing ${Q} m³/s of water with no inlet swirl. Assuming the flow follows the blades, what is ${ask === 'H' ? 'the ideal (Euler) head, in m' : 'the ideal power transferred to the water, in kW'}? (4 significant figures)`, r4(ask === 'H' ? H : P),
      `U₂ = ωr₂ = ${r4(U)} m/s, V_r2 = Q/(2πr₂b₂) = ${r4(Vr)} m/s, V_θ2 = U₂ − V_r2 cot β₂ = ${r4(Vt)} m/s. H = U₂V_θ2/g = ${r4(H)} m; P = ρgQH = ${r4(P)} kW.`,
      `import math\n# build the outlet velocity triangle as vectors: absolute = blade speed + relative; torque = mass flow x r x tangential velocity\nr2, b2, beta, N, Q = ${r2}, ${b2}, math.radians(${beta}), ${N}, ${Q}\nw = N * 2 * math.pi / 60\nU = (w * r2, 0.0)   # (tangential, radial)\nVr = Q / (2 * math.pi * r2 * b2)\nWrel = (-Vr / math.tan(beta), Vr)   # relative velocity along a backward-curved blade\nV = (U[0] + Wrel[0], U[1] + Wrel[1])\ntorque = 1000 * Q * r2 * V[0]\nP = torque * w\nprint(${ask === 'H' ? 'P / (1000 * 9.81 * Q)' : 'P / 1000'})`);
  }),

  SKILL('en.affinity', 'Pump similarity (affinity laws)', 'Geometrically similar pumps share flow, head and power coefficients: Q ∝ ND³, H ∝ N²D², P ∝ N³D⁵.', t => {
    const N1 = t.pick([1450, 1750, 2900]), D1 = t.pick([0.2, 0.25, 0.3]), Q1 = t.pick([0.02, 0.05, 0.1]), H1 = t.pick([20, 30, 40]), P1 = t.pick([10, 20, 50]), N2 = t.pick([1200, 1450, 1750, 2900, 3500]), D2 = D1 * t.pick([0.8, 1, 1.2, 1.5]), ask = t.pick(['Q', 'H', 'P']);
    const n = N2 / N1, d = D2 / D1, ans = { Q: Q1 * n * d ** 3, H: H1 * n * n * d * d, P: P1 * n ** 3 * d ** 5 }[ask];
    return num(`A pump with a ${D1} m impeller at ${N1} rpm delivers ${Q1} m³/s at ${H1} m head, drawing ${P1} kW. A geometrically similar pump has a ${r4(D2)} m impeller and runs at ${N2} rpm. At the similar operating point, what is ${{ Q: 'its flow, in m³/s', H: 'its head, in m', P: 'its power, in kW' }[ask]}? (4 significant figures)`, r4(ans),
      `Ratios: N₂/N₁ = ${r4(n)}, D₂/D₁ = ${r4(d)}. Q ∝ ND³, H ∝ N²D², P ∝ N³D⁵ give ${r4(ans)}.`,
      `# carry the dimensionless coefficients across: C_Q = Q/(N D^3), C_H = g H/(N^2 D^2), C_P = P/(rho N^3 D^5)\nimport math\nN1, D1, Q1, H1, P1, N2, D2 = ${N1}, ${D1}, ${Q1}, ${H1}, ${P1}, ${N2}, ${D2}\nw1, w2 = N1 * 2 * math.pi / 60, N2 * 2 * math.pi / 60\nCQ, CH, CP = Q1 / (w1 * D1 ** 3), 9.81 * H1 / (w1 ** 2 * D1 ** 2), P1 * 1e3 / (1000 * w1 ** 3 * D1 ** 5)\nprint(${{ Q: 'CQ * w2 * D2 ** 3', H: 'CH * w2 ** 2 * D2 ** 2 / 9.81', P: 'CP * 1000 * w2 ** 3 * D2 ** 5 / 1e3' }[ask]})`);
  }),

  SKILL('en.flame', 'Adiabatic flame temperature', 'If all the fuel\'s heating value warms the products, T_ad = T₀ + LHV/((1 + AFR)·c̄_p). Excess air dilutes the products and lowers it.', t => {
    const [fuel, x, y, LHV] = t.pick([['methane', 1, 4, 50010], ['propane', 3, 8, 46350], ['octane', 8, 18, 44430]]), ex = t.pick([0, 10, 20, 50, 100]), cp = t.pick([1.15, 1.2, 1.25]), T0 = 298;
    const a = (x + y / 4) * (1 + ex / 100), Mf = 12.011 * x + 1.008 * y, AFR = a * (31.998 + 3.76 * 28.014) / Mf, Tad = T0 + LHV / ((1 + AFR) * cp);
    return num(`${fuel[0].toUpperCase() + fuel.slice(1)} (LHV ${LHV} kJ/kg) burns completely with ${ex}% excess air (O₂ + 3.76 N₂), both entering at ${T0} K. Taking the products' mean specific heat as ${cp} kJ/kg·K and no heat loss, what is the adiabatic flame temperature, in K? (Molar masses: C 12.011, H 1.008, O₂ 31.998, N₂ 28.014; 4 significant figures)`, r4(Tad),
      `Air–fuel ratio ${r4(AFR)}; products ${r4(1 + AFR)} kg per kg of fuel. T_ad = ${T0} + ${LHV}/(${r4(1 + AFR)}·${cp}) = ${r4(Tad)} K.`,
      `# products from an atom balance, then bisect on the temperature at which they have absorbed the heating value\nx, y, ex, LHV, cp, T0 = ${x}, ${y}, ${ex}, ${LHV}, ${cp}, ${T0}\na = (x + y / 4) * (1 + ex / 100)\nmoles = {'CO2': x, 'H2O': y / 2, 'O2': a - (x + y / 4), 'N2': 3.76 * a}\nM = {'CO2': 12.011 + 31.998, 'H2O': 2 * 1.008 + 15.999, 'O2': 31.998, 'N2': 28.014}\nmass = sum(moles[s] * M[s] for s in moles) / (12.011 * x + 1.008 * y)   # per kg of fuel\nlo, hi = T0, 6000.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if mass * cp * (m - T0) < LHV else (lo, m)\nprint(lo)`, { rtol: 0.003 });
  }),

  SKILL('en.fuelcell', 'Hydrogen fuel cells', 'A hydrogen cell\'s reversible voltage is −ΔG/2F (1.229 V at 25 °C with liquid water), falling as temperature rises; every two electrons consume one H₂ molecule.', t => {
    const T = t.pick([298.15, 323.15, 353.15]), pH2 = t.pick([1, 1.5, 2, 3]), pO2 = t.pick([0.21, 0.5, 1]), cells = t.pick([20, 50, 100]), I = t.pick([20, 50, 100, 200]), ask = t.pick(['E', 'h2']);
    const F = 96485.33212, R = 8.314462618, dH = -285830, dS = -163.2, E = -(dH - T * dS) / (2 * F) + R * T / (2 * F) * Math.log(pH2 * Math.sqrt(pO2)), h2 = cells * I / (2 * F) * 2.016 * 3600;
    return num(ask === 'E' ? `A hydrogen–oxygen fuel cell making liquid water runs at ${r4(T - 273.15)} °C with H₂ at ${pH2} bar and O₂ at ${pO2} bar. Taking ΔH = −285.83 kJ/mol and ΔS = −163.2 J/mol·K as constant, what is its reversible voltage, in V? (4 significant figures)` : `A ${cells}-cell hydrogen fuel-cell stack carries ${I} A. How much hydrogen does it consume, in g/h? (H₂ = 2.016 g/mol, F = 96 485 C/mol; 4 significant figures)`, r4(ask === 'E' ? E : h2),
      ask === 'E' ? `ΔG = ΔH − TΔS = ${r4((dH - T * dS) / 1000)} kJ/mol; E° = −ΔG/2F = ${r4(-(dH - T * dS) / (2 * F))} V; Nernst adds (RT/2F) ln(p_H₂√p_O₂), giving ${r4(E)} V.` : `Each cell passes I = ${I} A, so the stack draws N·I/2F = ${r4(cells * I / (2 * F))} mol/s of H₂ = ${r4(h2)} g/h.`,
      ask === 'E'
        ? `import math\n# from the equilibrium constant: ln K = -dG/RT, then dG = RT ln(Q/K) with Q = 1/(pH2 sqrt(pO2)), E = -dG/2F\nR, F, T = 8.314462618, 96485.33212, ${T}\nlnK = -(-285830 - T * -163.2) / (R * T)\nQ = 1 / (${pH2} * math.sqrt(${pO2}))\nprint(-(R * T * (math.log(Q) - lnK)) / (2 * F))`
        : `# count electrons for an hour, two per hydrogen molecule\nF, cells, I = 96485.33212, ${cells}, ${I}\nelectrons_mol = cells * I * 3600 / F\nprint(electrons_mol / 2 * 2.016)`);
  }),

  SKILL('en.battery', 'Battery packs under load', 'A pack of N_s cells in series and N_p in parallel has open-circuit voltage N_sV and resistance N_sr/N_p. Delivering power P it draws I with P = (V − IR)I, and loses I²R as heat.', t => {
    const Ns = t.pick([12, 24, 96]), Np = t.pick([1, 2, 4]), V = 3.6, C = t.pick([2.5, 3, 5]), r = t.pick([20, 30, 50]) / 1000, ask = t.pick(['I', 'heat', 'time']);
    const Voc = Ns * V, Rp = Ns * r / Np, Pmax = Voc * Voc / (4 * Rp), P = Number((Pmax * t.pick([0.05, 0.1, 0.2])).toPrecision(2)), I = (Voc - Math.sqrt(Voc * Voc - 4 * Rp * P)) / (2 * Rp);
    const heat = I * I * Rp, time = Np * C / I * 60;
    return num(`A battery pack has ${Ns} cells in series and ${Np} in parallel; each cell is 3.6 V, ${C} Ah and ${r * 1000} mΩ. It supplies a steady ${P} W. Ignoring the change in voltage as it discharges, what is ${{ I: 'the pack current, in A', heat: 'the heat generated in the cells, in W', time: 'the run time to empty, in minutes' }[ask]}? (4 significant figures)`, r4({ I, heat, time }[ask]),
      `V_oc = ${r4(Voc)} V, R = N_sr/N_p = ${r4(Rp)} Ω. P = (V − IR)I gives I = ${r4(I)} A (the smaller root). Heat I²R = ${r4(heat)} W; capacity ${Np * C} Ah lasts ${r4(time)} min.`,
      `# bisect on the current until the terminal power matches\nNs, Np, V, C, r, P = ${Ns}, ${Np}, 3.6, ${C}, ${r}, ${P}\nVoc, R = Ns * V, Ns * r / Np\nlo, hi = 0.0, Voc / (2 * R)\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if (Voc - m * R) * m < P else (lo, m)\nI = lo\nprint(${{ I: 'I', heat: 'I * I * R', time: 'Np * C / I * 60' }[ask]})`);
  }),

  SKILL('en.wind', 'Wind power and the Betz limit', 'An ideal rotor extracts at most 16/27 of the kinetic power ½ρAv³ crossing it, at an axial induction a = 1/3, which slows the far wake to v/3.', t => {
    const D = t.pick([40, 80, 100, 120]), v = t.pick([6, 8, 10, 12]), rho = 1.225, ask = t.pick(['P', 'wake']);
    const A = Math.PI * D * D / 4, P = 16 / 27 * 0.5 * rho * A * v ** 3 / 1e6;
    return num(ask === 'P' ? `What is the most power an ideal rotor ${D} m in diameter could extract from a ${v} m/s wind (ρ = 1.225 kg/m³), in MW? (4 significant figures)` : `An ideal rotor runs at the Betz optimum in a ${v} m/s wind. What is the wind speed far downstream, in m/s? (4 significant figures)`, r4(ask === 'P' ? P : v / 3),
      `Kinetic power ½ρAv³ = ${r4(0.5 * rho * A * v ** 3 / 1e6)} MW; the Betz limit 16/27 of it is ${r4(P)} MW. At the optimum a = 1/3, the far wake moves at v(1 − 2a) = ${r4(v / 3)} m/s.`,
      `import math\n# actuator disc: power coefficient 4a(1 - a)^2, maximised over the induction factor by golden-section search\nD, v, rho = ${D}, ${v}, 1.225\nCp = lambda a: 4 * a * (1 - a) ** 2\nlo, hi, g = 0.0, 0.5, (5 ** 0.5 - 1) / 2\nfor _ in range(200):\n    x, y = hi - g * (hi - lo), lo + g * (hi - lo)\n    lo, hi = (x, hi) if Cp(x) < Cp(y) else (lo, y)\na = (lo + hi) / 2\nprint(${ask === 'P' ? 'Cp(a) * 0.5 * rho * math.pi * D * D / 4 * v ** 3 / 1e6' : 'v * (1 - 2 * a)'})`);
  }),

  SKILL('en.pv', 'A day of solar energy', 'A PV module makes P = P_stc(G/1000)(1 + γ(T_cell − 25)), and its cell runs hotter than the air: T_cell = T_a + (NOCT − 20)G/800. Over a clear day, irradiance rises and falls roughly as a half-sine.', t => {
    const Pstc = t.pick([300, 350, 400, 450]), gam = t.pick([-0.0035, -0.004, -0.0045]), NOCT = t.pick([44, 45, 46]), Ta = t.pick([10, 20, 30]), Gm = t.pick([700, 850, 1000]), Lh = t.pick([10, 12, 14]), ask = t.pick(['Tcell', 'E']);
    const k = (NOCT - 20) / 800, L = Lh, Tc = Ta + k * Gm;
    // E = ∫ Pstc (G/1000)(1 + γ(Ta + kG − 25)) dt with G = Gm sin(πt/L): ∫sin = 2L/π, ∫sin² = L/2
    const E = Pstc / 1000 * ((1 + gam * (Ta - 25)) * Gm * 2 * L / Math.PI + gam * k * Gm * Gm * L / 2) / 1000;
    return num(ask === 'Tcell' ? `A PV module (NOCT ${NOCT} °C) sits in ${Ta} °C air under ${Gm} W/m². What is its cell temperature, in °C? (4 significant figures)` : `A ${Pstc} W PV module (temperature coefficient ${gam * 100}%/°C, NOCT ${NOCT} °C) sees irradiance rising and falling as a half-sine peaking at ${Gm} W/m² over a ${Lh}-hour day, with the air at ${Ta} °C throughout. How much energy does it make that day, in kWh? (4 significant figures)`, r4(ask === 'Tcell' ? Tc : E),
      ask === 'Tcell' ? `T_cell = T_a + (NOCT − 20)G/800 = ${r4(Tc)} °C.` : `P(t) = P_stc(G/1000)(1 + γ(T_a + kG − 25)) with k = (NOCT − 20)/800. Integrating G = G_m sin(πt/L) (∫sin = 2L/π, ∫sin² = L/2) gives ${r4(E)} kWh.`,
      `import math\n# integrate the module's power through the day (Simpson's rule)\nPstc, gam, NOCT, Ta, Gm, L = ${Pstc}, ${gam}, ${NOCT}, ${Ta}, ${Gm}, ${Lh}\nk = (NOCT - 20) / 800\nP = lambda t: Pstc * (Gm * math.sin(math.pi * t / L) / 1000) * (1 + gam * (Ta + k * Gm * math.sin(math.pi * t / L) - 25))\nn = 20000; h = L / n\nE = (P(0) + P(L) + sum((4 if i % 2 else 2) * P(i * h) for i in range(1, n))) * h / 3\nprint(${ask === 'Tcell' ? 'Ta + k * Gm' : 'E / 1000'})`);
  }),
];
