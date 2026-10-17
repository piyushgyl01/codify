/**
 * Electrical Engineering: feedback control, estimation, robot kinematics and
 * power electronics (Åström & Murray, RES.6-010, 6.622, 6.061). FE
 * Electrical and Computer: Control Systems, Power Systems, Electronics.
 *
 * Checks take another route: closed loops simulated to steady state,
 * frequency responses sampled and interpolated, polynomial roots found
 * numerically rather than by Routh's array, Riccati recursions iterated,
 * homogeneous transforms composed, converters switched cycle by cycle, and
 * motors and heat sinks integrated in time.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const RK4 = `def rk4(f, t, y, h):\n    k1 = f(t, y); k2 = f(t + h / 2, [a + h / 2 * b for a, b in zip(y, k1)]); k3 = f(t + h / 2, [a + h / 2 * b for a, b in zip(y, k2)]); k4 = f(t + h, [a + h * b for a, b in zip(y, k3)])\n    return [a + h / 6 * (p + 2 * q + 2 * r + s) for a, p, q, r, s in zip(y, k1, k2, k3, k4)]\n`;

export const EECONTROL = [
  SKILL('ctl.sse', 'Steady-state error', 'A unity-feedback loop\'s steady-state error depends on its type: 1/(1 + K_p) for a step into a type-0 loop, 1/K_v for a ramp into a type-1 loop.', t => {
    const type = t.pick([0, 1]), K = t.pick([2, 5, 10, 20]), a = t.pick([1, 2, 4]), b = t.pick([3, 5]);
    const ess = type === 0 ? 1 / (1 + K / (a * b)) : a / K;
    const plant = type === 0 ? `G(s) = ${K}/((s + ${a})(s + ${b}))` : `G(s) = ${K}/(s(s + ${a}))`;
    return num(`A unity-feedback loop has ${plant}. What is the steady-state error for a unit ${type === 0 ? 'step' : 'ramp'} input? (4 significant figures)`, r4(ess),
      type === 0 ? `Type 0: K_p = G(0) = ${r4(K / (a * b))}, so e_ss = 1/(1 + K_p) = ${r4(ess)}.` : `Type 1: K_v = lim sG(s) = ${r4(K / a)}, so the ramp error is 1/K_v = ${r4(ess)}.`,
      `${RK4}# simulate the closed loop until the error settles\ntype_, K, a, b = ${type}, ${K}, ${a}, ${b}\nr = (lambda t: 1.0) if type_ == 0 else (lambda t: t)\nif type_ == 0:  # y'' + (a+b) y' + ab y = K e\n    f = lambda t, y: [y[1], K * (r(t) - y[0]) - (a + b) * y[1] - a * b * y[0]]\nelse:            # y'' + a y' = K e\n    f = lambda t, y: [y[1], K * (r(t) - y[0]) - a * y[1]]\ny, t, h = [0.0, 0.0], 0.0, 1e-3\nfor _ in range(60000): y = rk4(f, t, y, h); t += h\nprint(r(t) - y[0])`);
  }),

  SKILL('ctl.margin', 'Phase margin', 'Phase margin is 180° plus the loop\'s phase where |L(jω)| = 1: how much extra lag the loop can take before it oscillates.', t => {
    let K, a, b, wc, pm;
    do {
      K = t.pick([1, 2, 5, 10, 20, 50]); a = t.pick([1, 2, 5]); b = t.pick([5, 10, 20]);
      const mag = w => K / (w * Math.hypot(w, a) * Math.hypot(w, b));
      let lo = 1e-4, hi = 1e4;
      for (let i = 0; i < 200; i++) { const m = Math.sqrt(lo * hi); if (mag(m) > 1) lo = m; else hi = m; }
      wc = Math.sqrt(lo * hi);
      pm = 180 - 90 - (Math.atan(wc / a) * 180) / Math.PI - (Math.atan(wc / b) * 180) / Math.PI;
    } while (pm < 10 || pm > 80);
    return num(`A loop has L(s) = ${K}/(s(s + ${a})(s + ${b})). What is its phase margin, in degrees? (4 significant figures)`, r4(pm),
      `|L(jω)| = 1 at ω_c = ${r4(wc)} rad/s, where the phase is −90° − arctan(ω_c/${a}) − arctan(ω_c/${b}) = ${r4(pm - 180)}°, so PM = ${r4(pm)}°.`,
      `import cmath, math\n# sample L(jw) on a fine log grid, find where |L| crosses 1 by interpolation, and read the phase there\nK, a, b = ${K}, ${a}, ${b}\nL = lambda w: K / (1j * w * (1j * w + a) * (1j * w + b))\nws = [10 ** (-4 + 8 * i / 200000) for i in range(200001)]\nfor w0, w1 in zip(ws, ws[1:]):\n    if abs(L(w0)) >= 1 > abs(L(w1)):\n        f = (math.log(abs(L(w0)))) / (math.log(abs(L(w0))) - math.log(abs(L(w1))))\n        wc = w0 * (w1 / w0) ** f\n        break\nph = math.degrees(cmath.phase(L(wc)))\nif ph > 0: ph -= 360\nprint(180 + ph)`);
  }),

  SKILL('ctl.routh', 'Routh–Hurwitz stability', 'The number of sign changes down the first column of the Routh array is the number of right-half-plane roots.', t => {
    let c, changes;
    for (;;) {
      c = [1, t.int(-3, 6), t.int(-4, 10), t.int(-5, 12)];
      if (t.rng() < 0.5) c.push(t.int(-4, 10));
      const n = c.length - 1, rows = [c.filter((_, i) => i % 2 === 0), c.filter((_, i) => i % 2 === 1)];
      while (rows[1].length < rows[0].length) rows[1].push(0);
      let ok = true;
      for (let r = 2; r <= n; r++) {
        const a = rows[r - 2], b = rows[r - 1], row = [];
        if (b[0] === 0) { ok = false; break; }
        for (let j = 0; j < a.length - 1; j++) row.push((b[0] * (a[j + 1] ?? 0) - a[0] * (b[j + 1] ?? 0)) / b[0]);
        row.push(0);
        rows.push(row);
      }
      if (!ok) continue;
      const first = rows.slice(0, n + 1).map(r => r[0]);
      if (first.some(v => Math.abs(v) < 1e-9)) continue;
      changes = first.slice(1).reduce((s, v, i) => s + (Math.sign(v) !== Math.sign(first[i]) ? 1 : 0), 0);
      break;
    }
    const poly = c.map((v, i) => { const p = c.length - 1 - i; return v === 0 ? '' : `${v < 0 ? ' − ' : ' + '}${Math.abs(v) === 1 && p ? '' : Math.abs(v)}${p ? (p === 1 ? 's' : `s${'⁰¹²³⁴'[p]}`) : ''}`; }).join('').replace(/^ \+ /, '');
    return num(`How many roots of ${poly} = 0 lie in the right half-plane?`, changes,
      `Build the Routh array; its first column has ${changes} sign change${changes === 1 ? '' : 's'}, so ${changes} root${changes === 1 ? '' : 's'} lie in the right half-plane.`,
      `# find all roots numerically (Durand–Kerner) and count those with positive real part\nc = ${JSON.stringify(c)}\nn = len(c) - 1\nz = [complex(0.4, 0.9) ** k for k in range(n)]\np = lambda x: sum(ci * x ** (n - i) for i, ci in enumerate(c))\nfor _ in range(2000):\n    new = []\n    for i in range(n):\n        den = 1\n        for j in range(n):\n            if j != i: den *= z[i] - z[j]\n        new.append(z[i] - p(z[i]) / den)\n    z = new\nprint(sum(1 for r in z if r.real > 1e-9))`, { rtol: 0, tol: 0, dp: 0 });
  }),

  SKILL('est.kalman', 'The steady-state Kalman filter', 'Tracking a random walk (process variance q) with noisy readings (variance r), the filter settles where P = (−q + √(q² + 4qr))/2.', t => {
    const q = t.pick([0.01, 0.1, 1]), r = t.pick([0.1, 1, 4]), ask = t.pick(['P', 'K']);
    const P = (-q + Math.sqrt(q * q + 4 * q * r)) / 2, K = (P + q) / (P + q + r);
    return num(`A 1-D Kalman filter tracks a random walk with process-noise variance q = ${q} using measurements with noise variance r = ${r}. What is the steady-state ${ask === 'P' ? 'posterior variance' : 'Kalman gain'}? (4 significant figures)`, r4(ask === 'P' ? P : K),
      `At steady state the variance after an update solves P² + qP − qr = 0: P = ${r4(P)}; the gain is (P + q)/(P + q + r) = ${r4(K)}.`,
      `# run the predict-update recursion until it stops changing\nq, r = ${q}, ${r}\nP = 100.0\nfor _ in range(100000):\n    M = P + q\n    K = M / (M + r)\n    P = (1 - K) * M\nprint(${ask === 'P' ? 'P' : 'K'})`);
  }),

  SKILL('rob.fk2', 'Planar arm kinematics', 'A two-link arm reaches x = L₁cos θ₁ + L₂cos(θ₁ + θ₂), y = L₁sin θ₁ + L₂sin(θ₁ + θ₂).', t => {
    const L1 = t.pick([0.3, 0.5, 1]), L2 = t.pick([0.2, 0.4, 0.8]), t1 = t.int(-12, 12) * 15, t2 = t.int(-10, 10) * 15, ask = t.pick(['x', 'y', 'r']);
    const a = (t1 * Math.PI) / 180, b = ((t1 + t2) * Math.PI) / 180, x = L1 * Math.cos(a) + L2 * Math.cos(b), y = L1 * Math.sin(a) + L2 * Math.sin(b);
    const ans = ask === 'x' ? x : ask === 'y' ? y : Math.hypot(x, y);
    return num(`A planar arm has links of ${L1} m and ${L2} m, with joint angles θ₁ = ${t1}° and θ₂ = ${t2}° (θ₂ measured from link 1). What is ${ask === 'r' ? 'the distance from the base to the end-effector' : `the end-effector's ${ask} coordinate`}, in metres? (4 significant figures)`, r4(ans),
      `x = L₁cos θ₁ + L₂cos(θ₁ + θ₂) = ${r4(x)}, y = L₁sin θ₁ + L₂sin(θ₁ + θ₂) = ${r4(y)}; distance ${r4(Math.hypot(x, y))} m.`,
      `import math\n# compose homogeneous transforms: rotate by each joint, then translate along each link\ndef T(th, L):\n    c, s = math.cos(th), math.sin(th)\n    return [[c, -s, L * c], [s, c, L * s], [0, 0, 1]]\nmul = lambda A, B: [[sum(A[i][k] * B[k][j] for k in range(3)) for j in range(3)] for i in range(3)]\nM = mul(T(math.radians(${t1}), ${L1}), T(math.radians(${t2}), ${L2}))\nx, y = M[0][2], M[1][2]\nprint(${ask === 'x' ? 'x' : ask === 'y' ? 'y' : 'math.hypot(x, y)'})`, { tol: 1e-4 });
  }),

  SKILL('pwr.buck', 'The buck converter', 'In continuous conduction a buck converter steps down by its duty cycle, V_out = D·V_in, with inductor ripple ΔI = (V_in − V_out)D/(Lf).', t => {
    const Vin = t.pick([12, 24, 48]), Vout = t.pick([1.8, 3.3, 5]), f = t.pick([100e3, 250e3, 500e3]), L = t.pick([4.7, 10, 22, 47]) * 1e-6, ask = t.pick(['D', 'ripple']);
    const D = Vout / Vin, dI = ((Vin - Vout) * D) / (L * f);
    return num(`An ideal buck converter steps ${Vin} V down to ${Vout} V at ${f / 1e3} kHz with a ${r4(L * 1e6)} μH inductor (continuous conduction). What is ${ask === 'D' ? 'its duty cycle, in percent' : 'the peak-to-peak inductor ripple current, in mA'}? (4 significant figures)`, r4(ask === 'D' ? D * 100 : dI * 1e3),
      `Volt-second balance on the inductor: (V_in − V_out)·D = V_out·(1 − D), so D = V_out/V_in = ${r4(D * 100)}%. Ripple ΔI = (V_in − V_out)·D/(L·f) = ${r4(dI * 1e3)} mA.`,
      `# switch the inductor cycle by cycle: find the duty that gives zero net current change, then measure the ripple\nVin, Vout, f, L = ${Vin}, ${Vout}, ${f}, ${L}\nT = 1 / f\ndef drift(D, n=20000):\n    i = 0.0; lo = hi = 0.0\n    for k in range(n):\n        v = (Vin - Vout) if k < D * n else -Vout\n        i += v / L * T / n\n        lo, hi = min(lo, i), max(hi, i)\n    return i, hi - lo\nlo, hi = 0.0, 1.0\nfor _ in range(60):\n    m = (lo + hi) / 2\n    lo, hi = (lo, m) if drift(m)[0] > 0 else (m, hi)\nD = lo\nprint(${ask === 'D' ? 'D * 100' : 'drift(Vout / Vin, 200000)[1] * 1e3'})`, { tol: 0.01 });
  }),

  SKILL('pwr.boost', 'The boost converter', 'A boost converter steps up: V_out = V_in/(1 − D), from volt-second balance on its inductor.', t => {
    const Vin = t.pick([3.3, 5, 12]), ratio = t.pick([1.5, 2, 3, 4]), Vout = r4(Vin * ratio), D = 1 - Vin / Vout;
    return num(`An ideal boost converter raises ${Vin} V to ${Vout} V in continuous conduction. What duty cycle does it need, in percent? (4 significant figures)`, r4(D * 100),
      `Inductor volt-seconds balance: V_in·D = (V_out − V_in)(1 − D), so D = 1 − V_in/V_out = ${r4(D * 100)}%.`,
      `# bisect on the duty until the inductor current returns to where it started each cycle\nVin, Vout = ${Vin}, ${Vout}\ndef drift(D, n=4000):\n    i = 0.0\n    for k in range(n):\n        i += (Vin if k < D * n else Vin - Vout) / n\n    return i\nlo, hi = 0.0, 1.0\nfor _ in range(60):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if drift(m) < 0 else (lo, m)\nprint(lo * 100)`, { tol: 0.05 });
  }),

  SKILL('pwr.dcmotor', 'DC motor operating point', 'A permanent-magnet DC motor settles where V = IR + kω and kI = T_load + bω.', t => {
    const V = t.pick([12, 24]), R = t.pick([0.5, 1, 2]), k = t.pick([0.02, 0.05, 0.1]), TL = t.pick([0.02, 0.05, 0.1]), b = t.pick([0, 1e-4]), ask = t.pick(['rpm', 'I']);
    const w = (V * k - R * TL) / (k * k + R * b), I = (TL + b * w) / k;
    return num(`A DC motor (R = ${R} Ω, k = ${k} V·s/rad, viscous friction ${b} N·m·s) runs from ${V} V against a ${TL} N·m load. What is its steady ${ask === 'rpm' ? 'speed, in rpm' : 'current, in amps'}? (4 significant figures)`, r4(ask === 'rpm' ? (w * 60) / (2 * Math.PI) : I),
      `Solve V = IR + kω with kI = T_L + bω: ω = (Vk − RT_L)/(k² + Rb) = ${r4(w)} rad/s (${r4((w * 60) / (2 * Math.PI))} rpm), I = ${r4(I)} A.`,
      `${RK4}import math\n# integrate the electrical and mechanical equations (with some inductance and inertia) to steady state\nV, R, k, TL, b = ${V}, ${R}, ${k}, ${TL}, ${b}\nL, J = 1e-3, 1e-5\nf = lambda t, y: [(V - R * y[0] - k * y[1]) / L, (k * y[0] - TL - b * y[1]) / J]\ny, t, h = [0.0, 0.0], 0.0, 1e-5\nfor _ in range(100000): y = rk4(f, t, y, h); t += h\nprint(${ask === 'rpm' ? 'y[1] * 60 / (2 * math.pi)' : 'y[0]'})`);
  }),

  SKILL('pwr.thermal', 'Junction temperature', 'Heat flows through thermal resistances in series: T_j = T_a + P(θ_jc + θ_cs + θ_sa).', t => {
    const P = t.pick([2, 5, 10, 20]), jc = t.pick([0.5, 1, 2]), cs = t.pick([0.2, 0.5]), sa = t.pick([1, 2, 4]), Ta = t.pick([25, 40]), ask = t.pick(['Tj', 'Pmax']), Tmax = 150;
    const Tj = Ta + P * (jc + cs + sa), Pmax = (Tmax - Ta) / (jc + cs + sa);
    return num(ask === 'Tj' ? `A transistor dissipates ${P} W. With θ_jc = ${jc}, θ_cs = ${cs} and θ_sa = ${sa} °C/W in ${Ta} °C air, what is its steady junction temperature, in °C? (4 significant figures)` : `With θ_jc = ${jc}, θ_cs = ${cs} and θ_sa = ${sa} °C/W in ${Ta} °C air, how much power can a transistor dissipate before its junction reaches ${Tmax} °C, in watts? (4 significant figures)`, r4(ask === 'Tj' ? Tj : Pmax),
      `The thermal resistances add: ${r4(jc + cs + sa)} °C/W. T_j = T_a + Pθ = ${r4(Tj)} °C; the limit is (${Tmax} − ${Ta})/θ = ${r4(Pmax)} W.`,
      `${RK4}# model junction, case and sink as three thermal masses joined by the resistances, and integrate to steady state\njc, cs, sa, Ta = ${jc}, ${cs}, ${sa}, ${Ta}\ndef settle(P):\n    Cj, Cc, Cs = 0.5, 2.0, 20.0\n    f = lambda t, y: [(P - (y[0] - y[1]) / jc) / Cj, ((y[0] - y[1]) / jc - (y[1] - y[2]) / cs) / Cc, ((y[1] - y[2]) / cs - (y[2] - Ta) / sa) / Cs]\n    y, t, h = [Ta, Ta, Ta], 0.0, 0.01\n    for _ in range(200000): y = rk4(f, t, y, h); t += h\n    return y[0]\n${ask === 'Tj' ? `print(settle(${P}))` : `# the network is linear, so one simulated watt gives the temperature rise per watt\nprint((${Tmax} - Ta) / (settle(1.0) - Ta))`}`);
  }),
];
