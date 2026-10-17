/**
 * Electrical Engineering: VLSI, FPGA arithmetic and system reliability
 * (6.012, 6.111, 6.004, the FE exam's reliability topics).
 *
 * Checks take another route: RC ladders simulated and the first moment of
 * their response integrated, inverter thresholds bisected where the device
 * currents meet, every fixed-point code tried, and system reliability summed
 * over every combination of component states.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));

export const EEVLSI = [
  SKILL('vlsi.elmore', 'Elmore delay', 'For an RC ladder the Elmore delay to the far end is Σᵢ Cᵢ × (resistance from the driver to node i).', t => {
    const n = t.int(3, 5), R = Array.from({ length: n }, () => t.pick([50, 100, 200, 500])), Cf = Array.from({ length: n }, () => t.pick([5, 10, 20, 50]));
    let up = 0, tau = 0;
    for (let i = 0; i < n; i++) { up += R[i]; tau += Cf[i] * 1e-15 * up; }
    return num(`A wire is modelled as an RC ladder driven at one end: resistances ${R.join(', ')} Ω in series, with capacitances ${Cf.join(', ')} fF to ground at the successive nodes. What is the Elmore delay to the far end, in ps? (4 significant figures)`, r4(tau * 1e12),
      `Each capacitor is charged through all the resistance between it and the driver: τ = Σ Cᵢ·Rᵢ↑ = ${r4(tau * 1e12)} ps (the 50% delay is about 0.69τ).`,
      `# simulate the ladder step response and integrate (1 - v_end): the first moment of the impulse response is the Elmore delay\nR, C = ${JSON.stringify(R)}, [c * 1e-15 for c in ${JSON.stringify(Cf)}]\nn = len(R)\ndef f(v):\n    out = []\n    for i in range(n):\n        left = 1.0 if i == 0 else v[i - 1]\n        i_in = (left - v[i]) / R[i]\n        i_out = (v[i] - v[i + 1]) / R[i + 1] if i + 1 < n else 0.0\n        out.append((i_in - i_out) / C[i])\n    return out\ntau = sum(C[i] * sum(R[:i + 1]) for i in range(n))\nh = tau / 2000; v = [0.0] * n; area = 0.0\nfor _ in range(60000):  # thirty Elmore delays\n    k1 = f(v); k2 = f([a + h / 2 * b for a, b in zip(v, k1)]); k3 = f([a + h / 2 * b for a, b in zip(v, k2)]); k4 = f([a + h * b for a, b in zip(v, k3)])\n    nv = [a + h / 6 * (p + 2 * q + 2 * r + s) for a, p, q, r, s in zip(v, k1, k2, k3, k4)]\n    area += ((1 - v[-1]) + (1 - nv[-1])) / 2 * h\n    v = nv\nprint(area * 1e12)`);
  }),

  SKILL('vlsi.vm', 'CMOS inverter threshold', 'An inverter switches where its NMOS and PMOS currents are equal: V_M = (√k_n V_Tn + √k_p (V_DD − |V_Tp|))/(√k_n + √k_p).', t => {
    const VDD = t.pick([1.2, 1.8, 3.3]), VTn = t.pick([0.3, 0.4]), VTp = t.pick([0.3, 0.4]), ratio = t.pick([0.5, 1, 2, 3]);
    const kn = 1, kp = ratio, VM = (Math.sqrt(kn) * VTn + Math.sqrt(kp) * (VDD - VTp)) / (Math.sqrt(kn) + Math.sqrt(kp));
    return num(`A CMOS inverter runs from ${VDD} V with V_Tn = ${VTn} V, |V_Tp| = ${VTp} V and k_p/k_n = ${ratio}. In the square-law model, at what input voltage does it switch (V_in = V_out)? (4 significant figures)`, r4(VM),
      `With both transistors saturated, (k_n/2)(V_M − V_Tn)² = (k_p/2)(V_DD − V_M − |V_Tp|)², so V_M = ${r4(VM)} V. A stronger PMOS (k_p/k_n > 1) pulls V_M up.`,
      `# bisect on V_in for the point where the NMOS current equals the PMOS current\nVDD, VTn, VTp, kn, kp = ${VDD}, ${VTn}, ${VTp}, 1.0, ${ratio}\nIn = lambda v: kn / 2 * max(v - VTn, 0) ** 2\nIp = lambda v: kp / 2 * max(VDD - v - VTp, 0) ** 2\nlo, hi = 0.0, VDD\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if In(m) < Ip(m) else (lo, m)\nprint(lo)`);
  }),

  SKILL('fpga.fixed', 'Fixed-point arithmetic', 'A 16-bit signed number with n fractional bits stores code/2ⁿ for codes −32768 … 32767: resolution 2⁻ⁿ, range ±2¹⁵⁻ⁿ.', t => {
    const n = t.pick([8, 10, 12, 14]), ask = t.pick(['err', 'max']);
    if (ask === 'max') {
      const mx = (2 ** 15 - 1) / 2 ** n;
      return num(`A signal is stored as a 16-bit two's-complement number with ${n} fractional bits. What is the largest positive value it can hold? (4 significant figures)`, r4(mx),
        `The largest code is 32767, so the largest value is 32767/2^${n} = ${r4(mx)}.`,
        `n = ${n}\nprint(max(c / 2 ** n for c in range(-32768, 32768)))`);
    }
    const lim = 2 ** (15 - n) * 0.9, x = r4((t.rng() * 2 - 1) * lim), code = Math.max(-32768, Math.min(32767, Math.round(x * 2 ** n))), err = Math.abs(x - code / 2 ** n);
    return num(`The value ${x} is stored, rounded to nearest, as a 16-bit two's-complement number with ${n} fractional bits. What is the magnitude of the rounding error? (4 significant figures)`, r4(err),
      `The nearest code is round(${x} × 2^${n}) = ${code}, which stands for ${code / 2 ** n}; the error is ${r4(err)} (never more than 2^−${n + 1} = ${2 ** -(n + 1)}).`,
      `# try every code and keep the nearest\nx, n = ${x}, ${n}\nprint(min(abs(x - c / 2 ** n) for c in range(-32768, 32768)))`, { tol: 1e-9 });
  }),

  SKILL('sys.reliability', 'System reliability', 'Series parts multiply reliabilities; a redundant pair fails only if both fail: R = 1 − (1 − Rᵢ)². With constant failure rate λ, Rᵢ(t) = e^(−λt).', t => {
    const k = t.int(2, 4), lam = Array.from({ length: k }, () => t.pick([1, 2, 5, 10, 20])), lp = t.pick([10, 50, 100]), hours = t.pick([1000, 5000, 10000, 20000]);
    const Rs = Math.exp(-lam.reduce((s, l) => s + l, 0) * 1e-6 * hours), Rp1 = Math.exp(-lp * 1e-6 * hours), R = Rs * (1 - (1 - Rp1) ** 2);
    return num(`A system has ${k} parts in series with failure rates ${lam.join(', ')} per million hours, plus a redundant pair (either one suffices) whose units each fail at ${lp} per million hours. What is its reliability at ${hours} hours? (4 significant figures)`, r4(R),
      `Series: e^(−Σλ·t) = ${r4(Rs)}. Each paired unit: e^(−${lp}e−6·${hours}) = ${r4(Rp1)}, the pair 1 − (1 − ${r4(Rp1)})² = ${r4(1 - (1 - Rp1) ** 2)}. Product: ${r4(R)}.`,
      `import itertools, math\n# sum the probability of every combination of working and failed parts in which the system still works\nlam, lp, t = ${JSON.stringify(lam)}, ${lp}, ${hours}\nparts = [math.exp(-l * 1e-6 * t) for l in lam] + [math.exp(-lp * 1e-6 * t)] * 2\nk = len(lam); total = 0.0\nfor state in itertools.product((0, 1), repeat=len(parts)):\n    p = 1.0\n    for up, r in zip(state, parts): p *= r if up else 1 - r\n    if all(state[:k]) and (state[k] or state[k + 1]): total += p\nprint(total)`);
  }),
];
