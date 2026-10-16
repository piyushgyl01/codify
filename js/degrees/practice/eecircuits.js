/**
 * Electrical Engineering: DC and AC circuits (Lessons in Electric Circuits,
 * 6.002, 6.071). FE Electrical and Computer: Circuit Analysis, Linear
 * Systems, Power.
 *
 * Checks take another route: networks turned into netlists and solved by
 * nodal analysis, two-node circuits relaxed by Gauss–Seidel, Thévenin
 * equivalents from open- and short-circuit tests, transients and AC steady
 * states simulated in the time domain, power averaged over cycles, and
 * optima found by search.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
const ohm = R => (R >= 1e6 ? `${r4(R / 1e6)} MΩ` : R >= 1e3 ? `${r4(R / 1e3)} kΩ` : `${r4(R)} Ω`);
const res = (t, lo = 2, hi = 4) => t.pick(E12) * 10 ** t.int(lo, hi);

/** Python: one RK4 step for y' = f(t, y) with y a list. */
const RK4 = `def rk4(f, t, y, h):\n    k1 = f(t, y); k2 = f(t + h / 2, [a + h / 2 * b for a, b in zip(y, k1)]); k3 = f(t + h / 2, [a + h / 2 * b for a, b in zip(y, k2)]); k4 = f(t + h, [a + h * b for a, b in zip(y, k3)])\n    return [a + h / 6 * (p + 2 * q + 2 * r + s) for a, p, q, r, s in zip(y, k1, k2, k3, k4)]\n`;

export const EECIRCUITS = [
  SKILL('ckt.req', 'Series–parallel resistance', 'Series resistances add; parallel ones add as conductances. Reduce the network from the inside out.', t => {
    const build = d => {
      if (d === 0 || t.rng() < 0.25) { const R = res(t, 2, 3); return { R, s: ohm(R), net: ['R', R] }; }
      const a = build(d - 1), b = build(d - 1), par = t.rng() < 0.5;
      return par ? { R: 1 / (1 / a.R + 1 / b.R), s: `(${a.s} ∥ ${b.s})`, net: ['P', a.net, b.net] } : { R: a.R + b.R, s: `(${a.s} + ${b.s})`, net: ['S', a.net, b.net] };
    };
    let tree;
    do tree = build(3); while (tree.net[0] === 'R');
    const s = tree.s.replace(/^\((.*)\)$/, '$1');
    return num(`What is the equivalent resistance of ${s}, in kΩ? (+ means series, ∥ means parallel; 4 significant figures)`, r4(tree.R / 1e3),
      `Work outwards from the innermost brackets: series values add, parallel values combine as 1/(1/a + 1/b). Total ${r4(tree.R / 1e3)} kΩ.`,
      `# turn the network into a netlist, drive it with 1 V, and solve the nodal equations\nnet = ${JSON.stringify(tree.net)}\nedges, count = [], [2]\ndef place(n, a, b):\n    if n[0] == 'R': edges.append((a, b, n[1])); return\n    if n[0] == 'P': place(n[1], a, b); place(n[2], a, b); return\n    m = count[0]; count[0] += 1\n    place(n[1], a, m); place(n[2], m, b)\nplace(net, 1, 0)\nN = count[0]\nG = [[0.0] * N for _ in range(N)]\nfor a, b, R in edges:\n    g = 1 / R; G[a][a] += g; G[b][b] += g; G[a][b] -= g; G[b][a] -= g\n# node 0 grounded, node 1 held at 1 V; solve for the rest by Gaussian elimination\nfree = list(range(2, N)); n = len(free)\nA = [[G[i][j] for j in free] + [-G[i][1]] for i in free]\nfor c in range(n):\n    p = max(range(c, n), key=lambda r: abs(A[r][c])); A[c], A[p] = A[p], A[c]\n    for r in range(n):\n        if r != c:\n            f = A[r][c] / A[c][c]\n            A[r] = [x - f * y for x, y in zip(A[r], A[c])]\nV = [0.0, 1.0] + [A[i][n] / A[i][i] for i in range(n)]\nI = sum((V[1] - V[b if a == 1 else a]) / R for a, b, R in edges if 1 in (a, b))\nprint(1 / I / 1e3)`);
  }),

  SKILL('ckt.nodal', 'Nodal analysis', 'Write KCL at each unknown node in terms of node voltages, then solve the linear system.', t => {
    const Vs = t.pick([5, 9, 12, 15]), Is = t.pick([0, 1, 2, -1]) / 1e3, [R1, R2, R3, R4] = [res(t), res(t), res(t), res(t)];
    const a11 = 1 / R1 + 1 / R2 + 1 / R3, a12 = -1 / R3, a22 = 1 / R3 + 1 / R4, b1 = Vs / R1, b2 = Is;
    const det = a11 * a22 - a12 * a12, VB = (a11 * b2 - a12 * b1) / det;
    return num(`A ${Vs} V source feeds node A through R1 = ${ohm(R1)}. R2 = ${ohm(R2)} runs from A to ground, R3 = ${ohm(R3)} from A to node B, and R4 = ${ohm(R4)} from B to ground. A current source pushes ${r4(Is * 1e3)} mA into B. What is the voltage at B, in volts? (4 significant figures)`, r4(VB),
      `KCL at A: (V_A − ${Vs})/R1 + V_A/R2 + (V_A − V_B)/R3 = 0. KCL at B: (V_B − V_A)/R3 + V_B/R4 = ${r4(Is * 1e3)} mA. Solving: V_B = ${r4(VB)} V.`,
      `# relax the two node voltages with Gauss-Seidel until they stop changing\nVs, Is = ${Vs}, ${Is}\nR1, R2, R3, R4 = ${R1}, ${R2}, ${R3}, ${R4}\nVA = VB = 0.0\nfor _ in range(200000):\n    VA = (Vs / R1 + VB / R3) / (1 / R1 + 1 / R2 + 1 / R3)\n    nb = (VA / R3 + Is) / (1 / R3 + 1 / R4)\n    if abs(nb - VB) < 1e-14: VB = nb; break\n    VB = nb\nprint(VB)`, { tol: 1e-4 });
  }),

  SKILL('ckt.thevenin', 'Thévenin equivalents', 'Any linear two-terminal network is a source V_th behind R_th: V_th is the open-circuit voltage, R_th = V_oc/I_sc.', t => {
    const Vs = t.pick([5, 10, 12, 24]), [R1, R2, R3, R4] = [res(t), res(t), res(t), res(t)];
    const r12 = (R1 * R2) / (R1 + R2), Rth = 1 / (1 / R4 + 1 / (R3 + r12)), Vth = ((Vs * R2) / (R1 + R2)) * (R4 / (R4 + R3 + r12));
    const ask = t.pick(['V', 'R']);
    return num(`A ${Vs} V source drives R1 = ${ohm(R1)} into node A; R2 = ${ohm(R2)} goes from A to ground and R3 = ${ohm(R3)} from A to the output B, with R4 = ${ohm(R4)} from B to ground. What is the Thévenin ${ask === 'V' ? 'voltage at B, in volts' : 'resistance seen at B, in kΩ'}? (4 significant figures)`, r4(ask === 'V' ? Vth : Rth / 1e3),
      `Turn the source off to find R_th = R4 ∥ (R3 + R1 ∥ R2) = ${r4(Rth / 1e3)} kΩ. The open-circuit voltage is the divider at A, ${r4((Vs * R2) / (R1 + R2))} V, divided again by R4/(R4 + R3 + R1∥R2): V_th = ${r4(Vth)} V.`,
      `# open-circuit test: solve the nodes; short-circuit test: tie B to ground and find the current; R_th = V_oc / I_sc\nVs, R1, R2, R3, R4 = ${Vs}, ${R1}, ${R2}, ${R3}, ${R4}\ndef solve(a, b, c, d, e, f):\n    det = a * d - b * c\n    return (e * d - b * f) / det, (a * f - e * c) / det\nVA, VB = solve(1 / R1 + 1 / R2 + 1 / R3, -1 / R3, -1 / R3, 1 / R3 + 1 / R4, Vs / R1, 0.0)\nVA_sc = (Vs / R1) / (1 / R1 + 1 / R2 + 1 / R3)\nIsc = VA_sc / R3\nprint(${ask === 'V' ? 'VB' : 'VB / Isc / 1e3'})`);
  }),

  SKILL('ckt.rl', 'RL transients', 'Switch a voltage onto R in series with L and the current rises as (V/R)(1 − e^(−t/τ)), τ = L/R.', t => {
    const V = t.pick([5, 12, 24]), R = t.pick([10, 22, 47, 100]), L = t.pick([1, 4.7, 10, 22]) / 1e3, tau = L / R;
    const tt = r4(tau * t.pick([0.5, 1, 2, 3])), i = (V / R) * (1 - Math.exp(-tt / tau));
    return num(`At t = 0 a ${V} V supply is switched onto R = ${R} Ω in series with L = ${r4(L * 1e3)} mH. What is the current at t = ${r4(tt * 1e6)} μs, in mA? (4 significant figures)`, r4(i * 1e3),
      `τ = L/R = ${r4(tau * 1e6)} μs, so i = (V/R)(1 − e^(−t/τ)) = ${r4(i * 1e3)} mA. After about 5τ it settles at V/R = ${r4((V / R) * 1e3)} mA.`,
      `${RK4}# integrate L di/dt = V - R i from rest\nV, R, L, T = ${V}, ${R}, ${L}, ${tt}\nf = lambda t, y: [(V - R * y[0]) / L]\ny, n = [0.0], 20000\nfor k in range(n): y = rk4(f, k * T / n, y, T / n)\nprint(y[0] * 1e3)`);
  }),

  SKILL('ckt.phasor', 'AC steady state with phasors', 'In a series RLC driven at ω, the current amplitude is V/|Z| with Z = R + j(ωL − 1/ωC).', t => {
    const Vp = t.pick([5, 10]), R = t.pick([50, 100, 220]), L = t.pick([1, 4.7, 10]) / 1e3, C = t.pick([0.47, 1, 2.2, 10]) / 1e6, f = t.pick([500, 1000, 2000]);
    const w = 2 * Math.PI * f, X = w * L - 1 / (w * C), Z = Math.hypot(R, X), I = Vp / Z;
    return num(`A ${Vp} V-amplitude, ${f} Hz sine drives R = ${R} Ω, L = ${r4(L * 1e3)} mH and C = ${r4(C * 1e6)} μF in series. What is the amplitude of the steady-state current, in mA? (4 significant figures)`, r4(I * 1e3),
      `X = ωL − 1/ωC = ${r4(X)} Ω, |Z| = √(R² + X²) = ${r4(Z)} Ω, so |I| = ${Vp}/${r4(Z)} = ${r4(I * 1e3)} mA.`,
      `${RK4}import math\n# simulate the circuit in time until the transient dies, then read the current's peak\nVp, R, L, C, f = ${Vp}, ${R}, ${L}, ${C}, ${f}\nw = 2 * math.pi * f\nfn = lambda t, y: [y[1], (Vp * math.sin(w * t) - R * y[1] - y[0] / C) / L]  # y = [charge, current]\nT = 1 / f; n = 2000; h = T / n\ny, t, peak = [0.0, 0.0], 0.0, 0.0\nfor k in range(60 * n):\n    y = rk4(fn, t, y, h); t += h\n    if k >= 58 * n: peak = max(peak, abs(y[1]))\nprint(peak * 1e3)`);
  }),

  SKILL('ckt.power', 'Real power and power factor', 'For a load Z = R + jX on V_rms: P = V²R/|Z|², and the power factor is cos φ = R/|Z|.', t => {
    const Vr = t.pick([120, 230]), f = Vr === 120 ? 60 : 50, R = t.pick([5, 10, 20]), L = t.pick([10, 20, 50]) / 1e3;
    const X = 2 * Math.PI * f * L, Z2 = R * R + X * X, P = (Vr * Vr * R) / Z2, pf = R / Math.sqrt(Z2), ask = t.pick(['P', 'pf']);
    return num(`A load of R = ${R} Ω in series with L = ${r4(L * 1e3)} mH is connected to ${Vr} V rms at ${f} Hz. What is ${ask === 'P' ? 'the real power it draws, in watts' : 'its power factor'}? (4 significant figures)`, r4(ask === 'P' ? P : pf),
      `X_L = 2πfL = ${r4(X)} Ω, |Z| = ${r4(Math.sqrt(Z2))} Ω. P = V²R/|Z|² = ${r4(P)} W and pf = R/|Z| = ${r4(pf)} (lagging).`,
      `${RK4}import math\n# simulate the RL load on the sine supply, then average v*i over whole cycles after the transient\nVr, f, R, L = ${Vr}, ${f}, ${R}, ${L}\nw = 2 * math.pi * f; Vp = Vr * math.sqrt(2)\nfn = lambda t, y: [(Vp * math.sin(w * t) - R * y[0]) / L]\nn = 2000; h = 1 / f / n\ny, t, E, Irms2, Vrms2 = [0.0], 0.0, 0.0, 0.0, 0.0\nfor k in range(60 * n):\n    v = Vp * math.sin(w * t); i0 = y[0]\n    y = rk4(fn, t, y, h); t += h\n    if k >= 40 * n:\n        vm, im = Vp * math.sin(w * (t - h / 2)), (i0 + y[0]) / 2\n        E += vm * im * h; Irms2 += im * im * h; Vrms2 += vm * vm * h\nP = E / (20 / f)\nprint(${ask === 'P' ? 'P' : 'P / math.sqrt(Vrms2 / (20 / f) * Irms2 / (20 / f))'})`);
  }),

  SKILL('ckt.pfc', 'Power-factor correction', 'A lagging load drawing Q vars is corrected to unity by a parallel capacitor with ωCV² = Q.', t => {
    const Vr = t.pick([230, 400, 480]), f = Vr === 480 ? 60 : 50, P = t.pick([5, 10, 25, 50]) * 1e3, pf = t.pick([0.7, 0.75, 0.8, 0.85]), target = t.pick([1, 0.95]);
    const Q = P * Math.tan(Math.acos(pf)), Qt = target === 1 ? 0 : P * Math.tan(Math.acos(target)), Cf = (Q - Qt) / (2 * Math.PI * f * Vr * Vr);
    return num(`A ${P / 1e3} kW load runs at power factor ${pf} lagging from ${Vr} V rms, ${f} Hz. What parallel capacitance raises the power factor to ${target === 1 ? 'unity' : target + ' lagging'}, in μF? (4 significant figures)`, r4(Cf * 1e6),
      `Q = P tan(arccos ${pf}) = ${r4(Q / 1e3)} kvar; the target needs ${r4(Qt / 1e3)} kvar, so the capacitor supplies ${r4((Q - Qt) / 1e3)} kvar: C = ΔQ/(ωV²) = ${r4(Cf * 1e6)} μF.`,
      `import math\n# model the load as an admittance, add jwC, and bisect on C until the combined power factor reaches the target\nV, f, P, pf, target = ${Vr}, ${f}, ${P}, ${pf}, ${target}\nQ = P * math.tan(math.acos(pf))\nY = complex(P, -Q) / V ** 2\nw = 2 * math.pi * f\ndef pf_of(C):\n    S = V * V * (Y + 1j * w * C).conjugate()\n    return S.real / abs(S)\nlo, hi = 0.0, 0.1\nfor _ in range(200):\n    m = (lo + hi) / 2\n    S = V * V * (Y + 1j * w * m).conjugate()\n    lo, hi = (m, hi) if (S.imag > 0 and pf_of(m) < target) else (lo, m)\nprint(lo * 1e6)`);
  }),

  SKILL('ckt.bode', 'First-order filters', 'An RC low-pass passes f ≪ f_c = 1/(2πRC) and falls at 20 dB/decade above it; at f_c it is −3 dB.', t => {
    const R = res(t, 3, 4), C = t.pick([10, 47, 100, 470]) * 1e-9, fc = 1 / (2 * Math.PI * R * C), f = r4(fc * t.pick([0.2, 0.5, 1, 2, 5, 10]));
    const dB = -10 * Math.log10(1 + (f / fc) ** 2);
    return num(`An RC low-pass filter has R = ${ohm(R)} and C = ${r4(C * 1e9)} nF. What is its gain at ${f} Hz, in dB? (4 significant figures)`, r4(dB),
      `f_c = 1/(2πRC) = ${r4(fc)} Hz; |H| = 1/√(1 + (f/f_c)²), so the gain is ${r4(dB)} dB.`,
      `${RK4}import math\n# drive the RC circuit with a sine in the time domain and measure the output amplitude once settled\nR, C, f = ${R}, ${C}, ${f}\nw = 2 * math.pi * f; tau = R * C\nfn = lambda t, y: [(math.sin(w * t) - y[0]) / tau]\nT = 1 / f; n = 2000; h = T / n\ncycles = int(12 * tau / T) + 6\ny, t, peak = [0.0], 0.0, 0.0\nfor k in range(cycles * n):\n    y = rk4(fn, t, y, h); t += h\n    if k >= (cycles - 2) * n: peak = max(peak, abs(y[0]))\nprint(20 * math.log10(peak))`, { tol: 0.01 });
  }),

  SKILL('ckt.overshoot', 'Second-order step response', 'A series RLC has ζ = (R/2)√(C/L); below ζ = 1 the capacitor voltage overshoots by e^(−ζπ/√(1−ζ²)).', t => {
    const L = 10e-3, C = 1e-6, z = t.pick([0.1, 0.2, 0.3, 0.5, 0.7]), R = r4(2 * z * Math.sqrt(L / C));
    const zeta = (R / 2) * Math.sqrt(C / L), os = 100 * Math.exp((-zeta * Math.PI) / Math.sqrt(1 - zeta * zeta));
    return num(`A 1 V step is applied at t = 0 to R = ${R} Ω, L = 10 mH and C = 1 μF in series (initially at rest). By what percentage does the capacitor voltage overshoot its final value? (4 significant figures)`, r4(os),
      `ζ = (R/2)√(C/L) = ${r4(zeta)}, so the overshoot is 100·e^(−ζπ/√(1−ζ²)) = ${r4(os)}%.`,
      `${RK4}# simulate the step response and find the capacitor voltage's peak\nR, L, C = ${R}, ${L}, ${C}\nfn = lambda t, y: [y[1] / C, (1 - R * y[1] - y[0]) / L]  # y = [vC, i]\ny, t, h, peak = [0.0, 0.0], 0.0, 2e-7, 0.0\nfor _ in range(60000):\n    y = rk4(fn, t, y, h); t += h; peak = max(peak, y[0])\nprint((peak - 1) * 100)`);
  }),

  SKILL('ckt.maxpower', 'Maximum power transfer', 'A load takes the most power from a source V_th, R_th when R_L = R_th, and then gets V_th²/4R_th at 50% efficiency.', t => {
    const Vth = t.pick([3.3, 5, 9, 12]), Rth = t.pick([4, 8, 50, 75, 600]), ask = t.pick(['P', 'eff']);
    const RL = ask === 'eff' ? Rth * t.pick([0.5, 2, 4]) : Rth;
    const P = (Vth * Vth) / (4 * Rth), eff = RL / (RL + Rth);
    if (ask === 'eff') return num(`A source with V_th = ${Vth} V and R_th = ${Rth} Ω drives a ${RL} Ω load. What fraction of the power the source produces reaches the load? (4 significant figures)`, r4(eff),
      `The same current flows through both resistances, so the load gets R_L/(R_L + R_th) = ${r4(eff)} of the power.`,
      `# find the current, then compare the power dissipated in the load with the power the source delivers\nVth, Rth, RL = ${Vth}, ${Rth}, ${RL}\ni = Vth / (Rth + RL)\nprint(i * i * RL / (Vth * i))`);
    return num(`A source with V_th = ${Vth} V and R_th = ${Rth} Ω drives a resistive load. What is the most power it can deliver to the load, in mW? (4 significant figures)`, r4(P * 1e3),
      `P(R_L) = V²R_L/(R_L + R_th)² peaks at R_L = R_th = ${Rth} Ω, giving V²/4R_th = ${r4(P * 1e3)} mW.`,
      `import math\n# golden-section search for the load that maximises V^2 RL / (RL + Rth)^2\nVth, Rth = ${Vth}, ${Rth}\nP = lambda RL: Vth ** 2 * RL / (RL + Rth) ** 2\nlo, hi = 0.0, 100 * Rth; g = (math.sqrt(5) - 1) / 2\nfor _ in range(200):\n    a, b = hi - g * (hi - lo), lo + g * (hi - lo)\n    lo, hi = (a, hi) if P(a) < P(b) else (lo, b)\nprint(P(lo) * 1e3)`);
  }),
];
