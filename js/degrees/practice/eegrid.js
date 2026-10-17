/**
 * Electrical Engineering: power systems, protection and deployment economics
 * (6.061, 6.622, the FE exam's power and economics topics). FE Electrical
 * and Computer: Power Systems, Engineering Economics.
 *
 * Checks take another route: instantaneous phase powers summed over a cycle,
 * fault currents in ohms instead of per unit, network angles relaxed by
 * Gauss–Seidel, converters balanced by bisection, relay settings and
 * confidence bounds found by search, governors simulated to steady state, and
 * profit stepped unit by unit.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const RK4 = `def rk4(f, t, y, h):\n    k1 = f(t, y); k2 = f(t + h / 2, [a + h / 2 * b for a, b in zip(y, k1)]); k3 = f(t + h / 2, [a + h / 2 * b for a, b in zip(y, k2)]); k4 = f(t + h, [a + h * b for a, b in zip(y, k3)])\n    return [a + h / 6 * (p + 2 * q + 2 * r + s) for a, p, q, r, s in zip(y, k1, k2, k3, k4)]\n`;

export const EEGRID = [
  SKILL('pwr.threephase', 'Balanced three-phase power', 'A balanced Y load draws I_L = (V_LL/√3)/|Z| and P = 3I_L²R = √3·V_LL·I_L·pf.', t => {
    const VLL = t.pick([208, 400, 480]), R = t.pick([4, 8, 12, 20]), X = t.pick([0, 3, 6, 9]), ask = t.pick(['P', 'I']);
    const Z = Math.hypot(R, X), I = VLL / Math.sqrt(3) / Z, P = 3 * I * I * R;
    return num(`A balanced Y-connected load of ${R} + j${X} Ω per phase is fed at ${VLL} V line-to-line. What is ${ask === 'P' ? 'the total real power, in kW' : 'the line current, in amps'}? (4 significant figures)`, r4(ask === 'P' ? P / 1e3 : I),
      `Phase voltage ${r4(VLL / Math.sqrt(3))} V over |Z| = ${r4(Z)} Ω gives I_L = ${r4(I)} A; P = 3I²R = ${r4(P / 1e3)} kW.`,
      `import cmath, math\n# sum the three instantaneous phase powers v(t) i(t) over a cycle\nVLL, Z = ${VLL}, complex(${R}, ${X})\nVp = VLL / math.sqrt(3) * math.sqrt(2)\nN = 20000; E = 0.0; Ipk = abs(Vp / Z)\nfor k in range(N):\n    wt = 2 * math.pi * k / N\n    for ph in (0, -2 * math.pi / 3, 2 * math.pi / 3):\n        E += Vp * math.cos(wt + ph) * Ipk * math.cos(wt + ph - cmath.phase(Z))\nprint(${ask === 'P' ? 'E / N / 1e3' : 'Ipk / math.sqrt(2)'})`);
  }),

  SKILL('pwr.fault', 'Three-phase fault current', 'In per unit, a bolted three-phase fault draws 1/Σx: add the source, transformer and line reactances on one base, then convert back to amps.', t => {
    const Ssc = t.pick([500, 1000, 2000]) * 1e6, St = t.pick([10, 20, 50]) * 1e6, zt = t.pick([0.06, 0.08, 0.1]), kV = t.pick([11, 13.8, 33]), xl = t.pick([0.5, 1, 2, 4]);
    const Sb = 100e6, Vb = kV * 1e3, x = Sb / Ssc + zt * (Sb / St) + xl * (Sb / (Vb * Vb)), Ib = Sb / (Math.sqrt(3) * Vb), If = Ib / x;
    return num(`A utility source (fault level ${Ssc / 1e6} MVA) feeds a ${St / 1e6} MVA transformer (${zt * 100}% reactance) to a ${kV} kV bus, then a line of ${xl} Ω reactance to a load bus. Ignoring resistance, what is the three-phase fault current at the load bus, in kA? (4 significant figures)`, r4(If / 1e3),
      `On a 100 MVA base: source ${r4(Sb / Ssc)} pu, transformer ${r4(zt * (Sb / St))} pu, line ${r4(xl * (Sb / (Vb * Vb)))} pu; total ${r4(x)} pu. I_base = ${r4(Ib)} A, so I_f = ${r4(If / 1e3)} kA.`,
      `import math\n# work in ohms at the fault voltage instead of per unit\nSsc, St, zt, kV, xl = ${Ssc}, ${St}, ${zt}, ${kV}, ${xl}\nV = kV * 1e3\nX = V * V / Ssc + zt * V * V / St + xl\nprint(V / math.sqrt(3) / X / 1e3)`);
  }),

  SKILL('pwr.dcflow', 'DC power flow', 'For screening, line flows follow angle differences: P_ij = (θᵢ − θⱼ)/x_ij, with the angles from Bθ = P.', t => {
    const x = { '12': t.pick([0.1, 0.2]), '13': t.pick([0.1, 0.25]), '23': t.pick([0.05, 0.1, 0.2]) }, P2 = t.pick([-1, -0.5, 0.5]), P3 = t.pick([-1.5, -1, -0.8]);
    const b12 = 1 / x['12'], b13 = 1 / x['13'], b23 = 1 / x['23'];
    const B = [[b12 + b23, -b23], [-b23, b13 + b23]], det = B[0][0] * B[1][1] - B[0][1] * B[1][0];
    const t2 = (P2 * B[1][1] - B[0][1] * P3) / det, t3 = (B[0][0] * P3 - B[1][0] * P2) / det;
    const line = t.pick(['12', '13', '23']), flow = line === '12' ? (0 - t2) / x['12'] : line === '13' ? (0 - t3) / x['13'] : (t2 - t3) / x['23'];
    return num(`In a three-bus network (bus 1 is the slack, angle 0) the lines have reactances x₁₂ = ${x['12']}, x₁₃ = ${x['13']} and x₂₃ = ${x['23']} pu. Bus 2 injects ${P2} pu and bus 3 injects ${P3} pu. Using DC power flow, what flows from bus ${line[0]} to bus ${line[1]}, in pu? (4 significant figures)`, r4(flow),
      `Solve Bθ = P for the angles: θ₂ = ${r4(t2)}, θ₃ = ${r4(t3)} rad. Then P_${line} = (θ_${line[0]} − θ_${line[1]})/x_${line} = ${r4(flow)} pu.`,
      `# relax the bus angles with Gauss-Seidel: each angle is the injection-weighted average of its neighbours\nx = {(1, 2): ${x['12']}, (1, 3): ${x['13']}, (2, 3): ${x['23']}}\nP = {2: ${P2}, 3: ${P3}}\nth = {1: 0.0, 2: 0.0, 3: 0.0}\nnbr = lambda i: [(j, x[(min(i, j), max(i, j))]) for j in (1, 2, 3) if j != i]\nfor _ in range(20000):\n    for i in (2, 3):\n        th[i] = (P[i] + sum(th[j] / xx for j, xx in nbr(i))) / sum(1 / xx for j, xx in nbr(i))\na, b = ${line[0]}, ${line[1]}\nprint((th[a] - th[b]) / x[(a, b)])`, { tol: 1e-4 });
  }),

  SKILL('pwr.buckboost', 'The buck-boost converter', 'An inverting buck-boost gives |V_out| = V_in·D/(1 − D): below D = 0.5 it steps down, above it steps up.', t => {
    const Vin = t.pick([5, 12, 24]), ratio = t.pick([0.25, 0.5, 1, 2, 3]), Vo = r4(Vin * ratio), D = Vo / (Vo + Vin);
    return num(`An ideal inverting buck-boost converter makes −${Vo} V from ${Vin} V in continuous conduction. What duty cycle does it need, in percent? (4 significant figures)`, r4(D * 100),
      `Inductor volt-seconds: V_in·D = |V_out|·(1 − D), so D = |V_out|/(|V_out| + V_in) = ${r4(D * 100)}%.`,
      `# bisect on the duty until the inductor current returns to its starting value each cycle\nVin, Vo = ${Vin}, ${Vo}\ndef drift(D, n=20000):\n    i = 0.0\n    for k in range(n):\n        i += (Vin if k < D * n else -Vo) / n\n    return i\nlo, hi = 0.0, 1.0\nfor _ in range(60):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if drift(m) < 0 else (lo, m)\nprint(lo * 100)`, { tol: 0.01 });
  }),

  SKILL('pwr.relay', 'Relay coordination', 'An IEC standard-inverse relay trips in t = TMS·0.14/((I/I_s)^0.02 − 1); the upstream relay must wait a coordination interval longer than the downstream one.', t => {
    const If = t.pick([2000, 4000, 8000]), IsB = t.pick([200, 300, 400]), IsA = t.pick([500, 600, 800]), TB = t.pick([0.05, 0.1, 0.2]), cti = t.pick([0.3, 0.4]);
    const tB = (TB * 0.14) / ((If / IsB) ** 0.02 - 1), TA = ((tB + cti) * ((If / IsA) ** 0.02 - 1)) / 0.14;
    return num(`A downstream relay (pickup ${IsB} A, TMS ${TB}) and an upstream relay (pickup ${IsA} A) both see a ${If} A fault. Both use the IEC standard-inverse curve. What is the smallest TMS for the upstream relay that keeps a ${cti} s coordination interval? (4 significant figures)`, r4(TA),
      `Downstream trips in ${r4(tB)} s, so the upstream relay must take ${r4(tB + cti)} s: TMS = (t)((I/I_s)^0.02 − 1)/0.14 = ${r4(TA)}.`,
      `# bisect on the upstream time multiplier until it trips exactly one interval after the downstream relay\nIf, IsB, IsA, TB, cti = ${If}, ${IsB}, ${IsA}, ${TB}, ${cti}\ncurve = lambda tms, Is: tms * 0.14 / ((If / Is) ** 0.02 - 1)\ntarget = curve(TB, IsB) + cti\nlo, hi = 0.0, 10.0\nfor _ in range(100):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if curve(m, IsA) < target else (lo, m)\nprint(lo)`);
  }),

  SKILL('pwr.droop', 'Frequency droop', 'Generators with droop R share a load step in proportion to rating/R; the frequency settles at Δf = −ΔP·f₀/Σ(Sᵢ/Rᵢ).', t => {
    const f0 = t.pick([50, 60]), S1 = t.pick([100, 200]), S2 = t.pick([50, 100, 300]), R1 = t.pick([0.04, 0.05]), R2 = t.pick([0.03, 0.05, 0.06]), dP = t.pick([10, 20, 40]), ask = t.pick(['df', 'p1']);
    const df = (-dP * f0) / (S1 / R1 + S2 / R2), p1 = (-df * S1) / (R1 * f0);
    return num(`Two generators share a ${f0} Hz island: ${S1} MW with ${R1 * 100}% droop and ${S2} MW with ${R2 * 100}% droop. The load rises by ${dP} MW. After the governors settle (no secondary control), what is ${ask === 'df' ? 'the frequency change, in Hz' : 'the first generator\'s share of the increase, in MW'}? (4 significant figures)`, r4(ask === 'df' ? df : p1),
      `Each unit raises output by −Δf·S/(R·f₀). Summing to ${dP} MW gives Δf = ${r4(df)} Hz; the first unit supplies ${r4(p1)} MW.`,
      `${RK4}# simulate inertia and two first-order governors until frequency stops moving\nf0, S1, S2, R1, R2, dP = ${f0}, ${S1}, ${S2}, ${R1}, ${R2}, ${dP}\nM, T1, T2 = 20.0, 0.5, 1.0  # MW*s/Hz and governor lags\nf = lambda t, y: [(y[1] + y[2] - dP) / M, (-y[0] * S1 / (R1 * f0) - y[1]) / T1, (-y[0] * S2 / (R2 * f0) - y[2]) / T2]\ny, t, h = [0.0, 0.0, 0.0], 0.0, 1e-3\nfor _ in range(100000): y = rk4(f, t, y, h); t += h\nprint(${ask === 'df' ? 'y[0]' : 'y[1]'})`);
  }),

  SKILL('rel.bound', 'Reliability from test data', 'After r failures in T test-hours, the one-sided upper bound on the failure rate at confidence CL is λ_U = χ²_CL(2r + 2)/(2T).', t => {
    const r = t.int(0, 5), T = t.pick([1000, 5000, 10000, 50000]), CL = t.pick([0.6, 0.9, 0.95]);
    const pois = mu => { let term = Math.exp(-mu), s = term; for (let k = 1; k <= r; k++) { term *= mu / k; s += term; } return s; };
    let lo = 0, hi = 100;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (pois(m) > 1 - CL) lo = m; else hi = m; }
    const mtbf = T / ((lo + hi) / 2);
    return num(`A test of ${T} unit-hours produced ${r} failure${r === 1 ? '' : 's'}. What is the ${CL * 100}% lower confidence bound on the MTBF, in hours? (4 significant figures)`, r4(mtbf),
      `The rate bound λ_U makes ${r} or fewer failures improbable: P(N ≤ ${r}; λ_U·T) = ${r4(1 - CL)}. That gives λ_U·T = ${r4(T / mtbf)}, so MTBF ≥ ${r4(mtbf)} h.`,
      `import math\n# chi-square quantile with 2r + 2 degrees of freedom, by integrating the density and bisecting\nr, T, CL = ${r}, ${T}, ${CL}\nk = r + 1  # nu / 2\ncdf = lambda x: sum(math.exp((k - 1) * math.log((i + .5) * x / 4000) - (i + .5) * x / 8000 - k * math.log(2) - math.lgamma(k)) * x / 4000 for i in range(4000))\nlo, hi = 0.0, 100.0\nfor _ in range(60):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if cdf(m) < CL else (lo, m)\nprint(T / (lo / 2))`);
  }),

  SKILL('econ.breakeven', 'Break-even volume', 'A product breaks even after fixed costs ÷ (price − variable cost per unit) units.', t => {
    const F = t.pick([20, 50, 120, 300]) * 1e3, v = t.pick([12, 25, 40]), p = v + t.pick([8, 15, 30]);
    const Q = Math.ceil(F / (p - v));
    return num(`A sensor costs $${v} per unit to build and sells for $${p}. Tooling, certification and setup cost $${F.toLocaleString('en-US')}. How many units must be sold to break even?`, Q,
      `Each unit contributes $${p - v}; $${F.toLocaleString('en-US')} / $${p - v} = ${r4(F / (p - v))}, so ${Q} units.`,
      `# add up profit one unit at a time until it is no longer negative\nF, p, v = ${F}, ${p}, ${v}\nprofit, n = -F, 0\nwhile profit < 0:\n    n += 1; profit += p - v\nprint(n)`, { rtol: 0, tol: 0, dp: 0 });
  }),
];
