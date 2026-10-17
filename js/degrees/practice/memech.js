/**
 * Mechanical Engineering: mechatronics and robot mechanics (2.737, 2.72,
 * Modern Robotics; FE Mechanical topics 5.D, 7.G and 13).
 *
 * Checks take another route: gear ratios by maximising acceleration with
 * the motor and load solved as coupled equations, encoder counts by counting
 * edges of simulated quadrature signals, PWM ripple by switching the winding
 * cycle by cycle, RMS torque by integrating a simulated move, Jacobians by
 * differencing the forward kinematics, holding torques by differentiating the
 * potential energy (virtual work), trajectories from solving the boundary
 * conditions as a linear system, and rotations by summing the matrix
 * exponential's series.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const g = 9.81, rad = d => d * Math.PI / 180;

export const MEMECH = [
  SKILL('mech.gearratio', 'Matching a motor to its load', 'Through a gear ratio N, the load\'s inertia looks like J_L/N² to the motor. The load accelerates at α = NT/(J_L + N²J_m), fastest when N = √(J_L/J_m).', t => {
    const Jm = t.pick([2e-5, 5e-5, 1e-4, 2e-4]), JL = t.pick([0.002, 0.005, 0.01, 0.05]), T = t.pick([0.1, 0.2, 0.5, 1]), ask = t.pick(['N', 'alpha']), N = t.pick([5, 10, 20, 30]);
    const Nopt = Math.sqrt(JL / Jm), alpha = N * T / (JL + N * N * Jm);
    return num(`A motor (rotor inertia ${Jm} kg·m², torque ${T} N·m) drives a load of inertia ${JL} kg·m² through an ideal gearbox. ${ask === 'N' ? 'What gear ratio gives the load the greatest angular acceleration?' : `With a ${N}:1 reduction, what is the load's angular acceleration, in rad/s²?`} (4 significant figures)`, r4(ask === 'N' ? Nopt : alpha),
      `α_L = NT/(J_L + N²J_m), maximised at N = √(J_L/J_m) = ${r4(Nopt)}. At N = ${N}: α_L = ${r4(alpha)} rad/s².`,
      `import math\n# motor and load as two bodies coupled by the gear: T - Tg = Jm am, N Tg = JL aL, am = N aL; maximise aL over N\nJm, JL, T = ${Jm}, ${JL}, ${T}\ndef accel(N):\n    # unknowns Tg, aL: Tg + Jm N aL = T ; N Tg - JL aL = 0\n    a11, a12, a21, a22 = 1.0, Jm * N, N, -JL\n    det = a11 * a22 - a12 * a21\n    return (a11 * 0.0 - a21 * T) / det\n${ask === 'N' ? 'lo, hi, g = 0.01, 1e4, (5 ** 0.5 - 1) / 2\nfor _ in range(300):\n    a, b = hi - g * (hi - lo), lo + g * (hi - lo)\n    lo, hi = (a, hi) if accel(a) < accel(b) else (lo, b)\nprint((lo + hi) / 2)' : `print(accel(${N}))`}`);
  }),

  SKILL('mech.encoder', 'Quadrature encoders', 'A quadrature encoder gives four counts per line per revolution. Behind a gearbox or leadscrew that sets the load\'s resolution; at speed it sets the count rate the counter must keep up with.', t => {
    const L = t.pick([100, 256, 500, 1000, 1024, 2048]), G = t.pick([1, 5, 10, 20]), lead = t.pick([2, 4, 5, 10]), rpm = t.pick([1000, 3000, 6000]), ask = t.pick(['deg', 'um', 'rate']);
    const counts = 4 * L, ans = { deg: 360 / (counts * G), um: lead * 1000 / (counts * G), rate: counts * rpm / 60 / 1000 }[ask];
    const setup = { deg: `A motor with a ${L}-line quadrature encoder drives a joint through a ${G}:1 gearbox. What angle of the joint does one count represent, in degrees?`, um: `A motor with a ${L}-line quadrature encoder drives a ${lead} mm-lead screw through a ${G}:1 reduction. How far does the nut move per count, in µm?`, rate: `A motor with a ${L}-line quadrature encoder spins at ${rpm} rpm. At what rate must the counter accept edges, in kHz?` }[ask];
    return num(`${setup} (Count every edge of both channels; 4 significant figures)`, r4(ans),
      `Counts per motor revolution: 4 × ${L} = ${counts}. ${{ deg: `Joint: 360°/(${counts}·${G}) = ${r4(ans)}°`, um: `Nut: ${lead} mm/(${counts}·${G}) = ${r4(ans)} µm`, rate: `Edges: ${counts} × ${rpm}/60 = ${r4(ans)} kHz` }[ask]}.`,
      `import math\n# generate channels A and B (B a quarter-period behind) over one revolution and count their edges\nL, G, lead, rpm = ${L}, ${G}, ${lead}, ${rpm}\nS = 40 * L\nA = [math.sin(2 * math.pi * L * k / S + 0.1) > 0 for k in range(S + 1)]\nB = [math.sin(2 * math.pi * L * k / S + 0.1 - math.pi / 2) > 0 for k in range(S + 1)]\nedges = sum(A[k] != A[k + 1] for k in range(S)) + sum(B[k] != B[k + 1] for k in range(S))\nprint(${{ deg: '360 / (edges * G)', um: 'lead * 1000 / (edges * G)', rate: 'edges * rpm / 60 / 1000' }[ask]})`);
  }),

  SKILL('mech.ripple', 'PWM current ripple in a motor winding', 'A PWM-driven winding averages to I = (DV − E)/R, while its inductance limits the ripple to about V·D(1 − D)/(Lf) — set by the switching frequency, not by the load.', t => {
    const V = t.pick([12, 24, 48]), R = t.pick([0.5, 1, 2]), Lh = t.pick([0.5, 1, 2]) * 1e-3, f = t.pick([10, 20, 40]) * 1e3, D = t.pick([0.3, 0.5, 0.7]), E = Number((V * D * t.pick([0.3, 0.5, 0.7])).toFixed(1)), ask = t.pick(['avg', 'ripple']);
    const T = 1 / f, tau = Lh / R, a = Math.exp(-D * T / tau), b = Math.exp(-(1 - D) * T / tau), ion = (V - E) / R, ioff = -E / R;
    // periodic steady state: imax = ion + (imin - ion)a, imin = ioff + (imax - ioff)b
    const imin = (ioff * (1 - b) + b * ion * (1 - a)) / (1 - a * b), imax = ion + (imin - ion) * a, avg = (D * V - E) / R;
    return num(`A brushed motor winding (R = ${R} Ω, L = ${Lh * 1e3} mH, back-EMF ${E} V) is driven from ${V} V by PWM at ${f / 1000} kHz with duty ${D} (the winding sees V when on and 0 when off). At steady state, what is ${ask === 'avg' ? 'the average current, in A' : 'the peak-to-peak current ripple, in mA'}? (4 significant figures)`, r4(ask === 'avg' ? avg : (imax - imin) * 1000),
      `Average: (DV − E)/R = ${r4(avg)} A. Solving the exponential charge and discharge for a repeating cycle gives ${r4(imin)} to ${r4(imax)} A: ripple ${r4((imax - imin) * 1000)} mA (≈ VD(1 − D)/(Lf) = ${r4(V * D * (1 - D) / (Lh * f) * 1000)} mA).`,
      `import math\n# switch the winding cycle by cycle (RK4) until the cycle repeats, then measure\nV, R, L, f, D, E = ${V}, ${R}, ${Lh}, ${f}, ${D}, ${E}\nT = 1 / f; n = 400; i = 0.0\ndef run(i, Vapp, dt, steps):\n    fn = lambda i: (Vapp - E - R * i) / L\n    for _ in range(steps):\n        k1 = fn(i); k2 = fn(i + dt / 2 * k1); k3 = fn(i + dt / 2 * k2); k4 = fn(i + dt * k3)\n        i += dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)\n    return i\ncycles = int(20 * L / R / T) + 50\nfor _ in range(cycles):\n    i = run(i, V, D * T / n, n); hi = i\n    i = run(i, 0.0, (1 - D) * T / n, n); lo = i\n# the average over the last cycle, by integrating i\ns, ii, dt = 0.0, lo, D * T / n\nfn_on = lambda i: (V - E - R * i) / L\nfor _ in range(n): s += ii * dt; ii = run(ii, V, dt, 1)\ndt2 = (1 - D) * T / n\nfor _ in range(n): s += ii * dt2; ii = run(ii, 0.0, dt2, 1)\nprint(${ask === 'avg' ? 's / T' : '(hi - lo) * 1000'})`);
  }),

  SKILL('mech.rms', 'RMS torque for motor sizing', 'A motor\'s heating follows its RMS torque over the duty cycle, √(ΣT²t/Σt), while its peak torque must cover the hardest acceleration.', t => {
    const J = t.pick([0.001, 0.002, 0.005]), Tf = t.pick([0.05, 0.1, 0.2]), w = t.pick([100, 200, 300]), ta = t.pick([0.05, 0.1, 0.2]), tc = t.pick([0.2, 0.5, 1]), tw = t.pick([0, 0.2, 0.5]), ask = t.pick(['rms', 'peak']);
    const al = w / ta, Ta = J * al + Tf, Td = J * al - Tf, rms = Math.sqrt((Ta * Ta * ta + Tf * Tf * tc + Td * Td * ta) / (2 * ta + tc + tw)), peak = Ta;
    return num(`A motor drives a total inertia of ${J} kg·m² against ${Tf} N·m of friction. Each cycle it accelerates to ${w} rad/s in ${ta} s, cruises for ${tc} s, decelerates to rest in ${ta} s, then dwells for ${tw} s. What is ${ask === 'rms' ? 'the RMS torque over the cycle, in N·m' : 'the peak torque, in N·m'}? (4 significant figures)`, r4(ask === 'rms' ? rms : peak),
      `Accelerating: Jα + T_f = ${r4(Ta)} N·m; cruising ${Tf}; decelerating Jα − T_f = ${r4(Td)} N·m (friction helps). RMS = √((${r4(Ta)}²·${ta} + ${Tf}²·${tc} + ${r4(Td)}²·${ta})/${r4(2 * ta + tc + tw)}) = ${r4(rms)} N·m.`,
      `import math\n# step through the move, find the torque from J dw/dt + friction, and integrate T^2\nJ, Tf, w, ta, tc, tw = ${J}, ${Tf}, ${w}, ${ta}, ${tc}, ${tw}\nTtot = 2 * ta + tc + tw; n = 200000; dt = Ttot / n\ndef speed(t):\n    if t < ta: return w * t / ta\n    if t < ta + tc: return w\n    if t < 2 * ta + tc: return w * (2 * ta + tc - t) / ta\n    return 0.0\nsq, pk = 0.0, 0.0\nfor k in range(n):\n    t = (k + 0.5) * dt\n    dw = (speed(t + 1e-7) - speed(t - 1e-7)) / 2e-7\n    T = J * dw + (Tf if speed(t) > 1e-9 else 0.0)\n    sq += T * T * dt; pk = max(pk, abs(T))\nprint(${ask === 'rms' ? 'math.sqrt(sq / Ttot)' : 'pk'})`);
  }),

  SKILL('rob.jacobian', 'Manipulator Jacobians', 'For a two-link planar arm, ẋ = J(θ)θ̇ with J = [[−l₁s₁ − l₂s₁₂, −l₂s₁₂], [l₁c₁ + l₂c₁₂, l₂c₁₂]]; det J = l₁l₂ sin θ₂ vanishes at the singularities θ₂ = 0, 180°.', t => {
    const l1 = t.pick([0.3, 0.4, 0.5]), l2 = t.pick([0.2, 0.3, 0.4]), t1 = t.pick([0, 20, 30, 45, 60]), t2 = t.pick([30, 45, 60, 90, 120]), d1 = t.pick([0.5, 1, -0.5]), d2 = t.pick([0.5, 1, 1.5, -1]), ask = t.pick(['v', 'det']);
    const s1 = Math.sin(rad(t1)), c1 = Math.cos(rad(t1)), s12 = Math.sin(rad(t1 + t2)), c12 = Math.cos(rad(t1 + t2));
    const vx = (-l1 * s1 - l2 * s12) * d1 - l2 * s12 * d2, vy = (l1 * c1 + l2 * c12) * d1 + l2 * c12 * d2, det = l1 * l2 * Math.sin(rad(t2));
    return num(`A two-link planar arm has links ${l1} m and ${l2} m, at θ₁ = ${t1}° and θ₂ = ${t2}° (θ₂ relative to link 1). ${ask === 'v' ? `With joint rates θ̇₁ = ${d1} and θ̇₂ = ${d2} rad/s, how fast is the tip moving, in m/s?` : 'What is the determinant of its Jacobian, in m²?'} (4 significant figures)`, r4(ask === 'v' ? Math.hypot(vx, vy) : det),
      `J = [[−l₁s₁ − l₂s₁₂, −l₂s₁₂], [l₁c₁ + l₂c₁₂, l₂c₁₂]]. ${ask === 'v' ? `Jθ̇ = (${r4(vx)}, ${r4(vy)}) m/s, speed ${r4(Math.hypot(vx, vy))} m/s.` : `det J = l₁l₂ sin θ₂ = ${r4(det)} m².`}`,
      `import math\n# difference the forward kinematics instead of using the formula\nl1, l2, t1, t2 = ${l1}, ${l2}, math.radians(${t1}), math.radians(${t2})\nfk = lambda a, b: (l1 * math.cos(a) + l2 * math.cos(a + b), l1 * math.sin(a) + l2 * math.sin(a + b))\nh = 1e-6\ncol = lambda i: [(p - m) / (2 * h) for p, m in zip(fk(t1 + h * (i == 0), t2 + h * (i == 1)), fk(t1 - h * (i == 0), t2 - h * (i == 1)))]\nJ0, J1 = col(0), col(1)\n${ask === 'v' ? `d1, d2 = ${d1}, ${d2}\nprint(math.hypot(J0[0] * d1 + J1[0] * d2, J0[1] * d1 + J1[1] * d2))` : 'print(J0[0] * J1[1] - J1[0] * J0[1])'}`);
  }),

  SKILL('rob.statics', 'Holding torques against gravity', 'To hold a pose, each joint must supply the torque of all the weight beyond it: τ = Jᵀ(−F) for a tip load, plus each link\'s own weight at its centre.', t => {
    const l1 = t.pick([0.4, 0.5, 0.6]), l2 = t.pick([0.3, 0.4, 0.5]), m1 = t.pick([2, 3, 4]), m2 = t.pick([1, 1.5, 2]), mp = t.pick([0.5, 1, 2, 5]), t1 = t.pick([0, 15, 30, 45]), t2 = t.pick([-30, 0, 30, 60]), ask = t.pick(['t1', 't2']);
    const c1 = Math.cos(rad(t1)), c12 = Math.cos(rad(t1 + t2));
    const tau2 = (m2 * l2 / 2 + mp * l2) * g * c12, tau1 = m1 * g * l1 / 2 * c1 + m2 * g * (l1 * c1 + l2 / 2 * c12) + mp * g * (l1 * c1 + l2 * c12);
    return num(`A two-link arm moves in a vertical plane: link 1 (${l1} m, ${m1} kg) at θ₁ = ${t1}° above horizontal, link 2 (${l2} m, ${m2} kg) at θ₂ = ${t2}° relative to link 1, both uniform, with a ${mp} kg payload at the tip. What torque must joint ${ask === 't1' ? 1 : 2} supply to hold it still, in N·m? (g = 9.81 m/s²; 4 significant figures)`, r4(ask === 't1' ? tau1 : tau2),
      `Joint 2 carries link 2's weight at l₂/2 and the payload at l₂, horizontally: τ₂ = (m₂l₂/2 + m_pl₂)g cos(θ₁ + θ₂) = ${r4(tau2)} N·m. Joint 1 carries everything: τ₁ = ${r4(tau1)} N·m.`,
      `import math\n# virtual work: the holding torques are the gradient of the potential energy\nl1, l2, m1, m2, mp, g = ${l1}, ${l2}, ${m1}, ${m2}, ${mp}, 9.81\ndef V(a, b):\n    y1 = l1 / 2 * math.sin(a); y2 = l1 * math.sin(a) + l2 / 2 * math.sin(a + b); yp = l1 * math.sin(a) + l2 * math.sin(a + b)\n    return g * (m1 * y1 + m2 * y2 + mp * yp)\na, b, h = math.radians(${t1}), math.radians(${t2}), 1e-6\nprint(${ask === 't1' ? '(V(a + h, b) - V(a - h, b)) / (2 * h)' : '(V(a, b + h) - V(a, b - h)) / (2 * h)'})`);
  }),

  SKILL('rob.traj', 'Polynomial joint trajectories', 'A cubic from rest to rest over T peaks in speed at 1.5Δ/T and in acceleration at 6Δ/T²; a quintic, which also starts and ends with zero acceleration, peaks at 1.875Δ/T and 5.774Δ/T².', t => {
    const kind = t.pick(['cubic', 'quintic']), q0 = t.pick([0, 10, 20]), dq = t.pick([30, 45, 60, 90]), T = t.pick([0.5, 1, 1.5, 2]), ask = t.pick(['v', 'a']);
    const vmax = (kind === 'cubic' ? 1.5 : 1.875) * dq / T, amax = (kind === 'cubic' ? 6 : 10 / Math.sqrt(3)) * dq / (T * T);
    return num(`A joint moves from ${q0}° to ${q0 + dq}° in ${T} s along a ${kind} polynomial that starts and ends at rest${kind === 'quintic' ? ' with zero acceleration' : ''}. What is its peak ${ask === 'v' ? 'speed, in °/s' : 'acceleration magnitude, in °/s²'}? (4 significant figures)`, r4(ask === 'v' ? vmax : amax),
      `${kind === 'cubic' ? 'q = q₀ + Δ(3s² − 2s³)' : 'q = q₀ + Δ(10s³ − 15s⁴ + 6s⁵)'}, s = t/T. Peak speed ${kind === 'cubic' ? '1.5' : '1.875'}Δ/T = ${r4(vmax)} °/s; peak acceleration ${kind === 'cubic' ? '6' : '10/√3'}·Δ/T² = ${r4(amax)} °/s².`,
      `# solve the boundary conditions for the coefficients, then sample the derivatives\nq0, dq, T = ${q0}, ${dq}, ${T}\nkind = '${kind}'\nn = 4 if kind == 'cubic' else 6\nrows, rhs = [], []\ndef row(t, d):\n    r = []\n    for k in range(n):\n        c = 1.0\n        for j in range(d): c *= (k - j)\n        r.append(c * t ** (k - d) if k >= d else 0.0)\n    return r\nfor t, d, v in [(0, 0, q0), (T, 0, q0 + dq), (0, 1, 0), (T, 1, 0)] + ([(0, 2, 0), (T, 2, 0)] if n == 6 else []):\n    rows.append(row(t, d)); rhs.append(v)\nM = [r + [v] for r, v in zip(rows, rhs)]\nfor c in range(n):\n    p = max(range(c, n), key=lambda r: abs(M[r][c])); M[c], M[p] = M[p], M[c]\n    for r in range(n):\n        if r != c: f = M[r][c] / M[c][c]; M[r] = [a - f * b for a, b in zip(M[r], M[c])]\nco = [M[i][n] / M[i][i] for i in range(n)]\nderiv = lambda t, d: sum(co[k] * row(t, d)[k] for k in range(n))\nts = [T * i / 20000 for i in range(20001)]\nprint(max(abs(deriv(t, ${ask === 'v' ? 1 : 2})) for t in ts))`);
  }),

  SKILL('rob.rodrigues', 'Rotations about an axis', 'Rotating by θ about a unit axis ω̂ gives R = I + sin θ[ω̂] + (1 − cos θ)[ω̂]² (Rodrigues\' formula), the closed form of the matrix exponential e^([ω̂]θ).', t => {
    const ax = t.pick([[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1], [1, 2, 2]]), th = t.pick([30, 45, 60, 90, 120]), i = t.int(0, 2), j = t.int(0, 2);
    const nrm = Math.hypot(...ax), w = ax.map(v => v / nrm), W = [[0, -w[2], w[1]], [w[2], 0, -w[0]], [-w[1], w[0], 0]];
    const W2 = W.map((r, a) => r.map((_, b) => W[a].reduce((s, _, k) => s + W[a][k] * W[k][b], 0))), R = W.map((r, a) => r.map((v, b) => (a === b ? 1 : 0) + Math.sin(rad(th)) * v + (1 - Math.cos(rad(th))) * W2[a][b]));
    return num(`A rigid body is rotated by ${th}° about the axis (${ax.join(', ')}) (normalise it first). What is entry R${i + 1}${j + 1} of the rotation matrix (row ${i + 1}, column ${j + 1})? (4 significant figures)`, (Math.abs(R[i][j]) < 1e-12 ? 0 : r4(R[i][j])), `ω̂ = (${w.map(r4).join(', ')}). Rodrigues: R = I + sin θ[ω̂] + (1 − cos θ)[ω̂]², so R${i + 1}${j + 1} = ${Math.abs(R[i][j]) < 1e-12 ? 0 : r4(R[i][j])}.`,
      `import math\n# sum the matrix exponential's power series for [w]theta\nax, th = ${JSON.stringify(ax)}, math.radians(${th})\nn = math.sqrt(sum(v * v for v in ax)); w = [v / n * th for v in ax]\nA = [[0, -w[2], w[1]], [w[2], 0, -w[0]], [-w[1], w[0], 0]]\nmul = lambda X, Y: [[sum(X[a][k] * Y[k][b] for k in range(3)) for b in range(3)] for a in range(3)]\nR = [[1.0 if a == b else 0.0 for b in range(3)] for a in range(3)]; term = [r[:] for r in R]\nfor k in range(1, 40):\n    term = [[v / k for v in r] for r in mul(term, A)]\n    R = [[R[a][b] + term[a][b] for b in range(3)] for a in range(3)]\nprint(R[${i}][${j}])`, { tol: 1e-9 });
  }),
];
