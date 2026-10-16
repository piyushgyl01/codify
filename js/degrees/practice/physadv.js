/**
 * Physics, second-year core: quantum mechanics (8.04), thermal physics
 * (8.044), analytical mechanics (8.223), electromagnetic theory (8.07) and
 * mathematical methods. GRE Physics: Quantum Mechanics, Thermodynamics and
 * Statistical Mechanics, Classical Mechanics, Electromagnetism.
 *
 * Checks take another route: Hamiltonians discretised and diagonalised by
 * Sturm-sequence bisection, the Schrödinger equation integrated through a
 * barrier, Pauli matrices, thermodynamic paths integrated, cycles simulated,
 * Planck's law maximised and integrated, orbits and beads simulated, surface
 * charge integrated, Laplace's equation relaxed on a grid.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const HBAR = 1.054571817e-34, ME = 9.1093837015e-31, EV = 1.602176634e-19, H = 6.62607015e-34, C = 299792458, KB = 1.380649e-23;

/** Python: the lowest k eigenvalues of a symmetric tridiagonal matrix by Sturm-sequence bisection. */
const STURM = `def sturm_count(d, e, x):\n    c, q = 0, 1.0\n    for i in range(len(d)):\n        q = d[i] - x - (e[i - 1] ** 2 / q if i else 0.0)\n        if q == 0: q = 1e-300\n        if q < 0: c += 1\n    return c\ndef eig(d, e, k):\n    lo, hi = min(d) - 2 * max(abs(v) for v in e) - 1, max(d) + 2 * max(abs(v) for v in e) + 1\n    a, b = lo, hi\n    for _ in range(200):\n        m = (a + b) / 2\n        if sturm_count(d, e, m) >= k: b = m\n        else: a = m\n    return (a + b) / 2\n`;

export const PHYSADV = [
  SKILL('pq.box', 'The infinite square well', 'Eₙ = n²h²/(8mL²): confinement quantises energy, and the levels spread as n².', t => {
    const L = t.pick([0.2, 0.5, 1, 2]), n = t.int(1, 4), ask = t.pick(['E', 'lambda']);
    const E1 = (H * H) / (8 * ME * (L * 1e-9) ** 2) / EV, En = n * n * E1;
    if (ask === 'E') return num(`An electron is confined to a 1-D box ${L} nm wide. What is the energy of level n = ${n}, in eV? (4 significant figures)`, r4(En),
      `E₁ = h²/(8mL²) = ${r4(E1)} eV; Eₙ = n²E₁ = ${r4(En)} eV.`,
      `${STURM}# finite differences for -hbar^2/2m psi'' with psi = 0 at the walls, in eV and nm\nhbar, me, eV = ${HBAR}, ${ME}, ${EV}\nN, L = 2000, ${L}e-9\nh = L / (N + 1); c = hbar ** 2 / (2 * me * h * h) / eV\nd, e = [2 * c] * N, [-c] * (N - 1)\nprint(eig(d, e, ${n}))`);
    const m = n + 1, dE = (m * m - n * n) * E1, lam = (H * C) / (dE * EV) * 1e9;
    return num(`An electron in a 1-D box ${L} nm wide drops from n = ${m} to n = ${n}. What wavelength of light is emitted, in nm? (4 significant figures)`, r4(lam),
      `ΔE = (${m}² − ${n}²)E₁ = ${r4(dE)} eV, λ = hc/ΔE = ${r4(lam)} nm.`,
      `${STURM}hbar, me, eV, h_, c_ = ${HBAR}, ${ME}, ${EV}, ${H}, ${C}\nN, L = 2000, ${L}e-9\nh = L / (N + 1); c = hbar ** 2 / (2 * me * h * h) / eV\nd, e = [2 * c] * N, [-c] * (N - 1)\ndE = eig(d, e, ${m}) - eig(d, e, ${n})\nprint(h_ * c_ / (dE * eV) * 1e9)`);
  }),

  SKILL('pq.finite', 'The finite square well', 'A finite well always has a bound state; its energy sits below the infinite-well value because the wavefunction leaks out.', t => {
    const V0 = t.pick([5, 10, 20]), a = t.pick([0.5, 1, 2]);
    // solve √(E) tan(k a/2) = √(V0−E) for the even ground state (energies in eV, a in nm)
    const k = E => Math.sqrt((2 * ME * E * EV)) / HBAR, kap = E => Math.sqrt(2 * ME * (V0 - E) * EV) / HBAR;
    let lo = 1e-9, hi = Math.min(V0 - 1e-9, (H * H) / (8 * ME * (a * 1e-9) ** 2) / EV - 1e-9);
    const f = E => k(E) * Math.tan((k(E) * a * 1e-9) / 2) - kap(E);
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
    const E = (lo + hi) / 2;
    return num(`An electron sits in a finite square well ${a} nm wide and ${V0} eV deep. What is its ground-state energy above the well bottom, in eV? (4 significant figures)`, r4(E),
      `Matching ψ and ψ′ at the walls for the even state gives k tan(ka/2) = κ. Solving: E = ${r4(E)} eV — below the infinite-well ${r4((H * H) / (8 * ME * (a * 1e-9) ** 2) / EV)} eV.`,
      `${STURM}hbar, me, eV = ${HBAR}, ${ME}, ${EV}\na, V0 = ${a}e-9, ${V0}\nL = a + 2.5e-9  # box with room for the evanescent tails\nN = 3000; h = L / (N + 1); c = hbar ** 2 / (2 * me * h * h) / eV\nx = [-L / 2 + (i + 1) * h for i in range(N)]\nd = [2 * c + (0.0 if abs(xi) < a / 2 else V0) for xi in x]\ne = [-c] * (N - 1)\nprint(eig(d, e, 1))`, { rtol: 0.004 });
  }),

  SKILL('pq.tunnel', 'Tunnelling', 'A particle below a barrier still gets through with probability that falls exponentially with width.', t => {
    const V0 = t.pick([5, 10]), E = t.pick([1, 2, 3, 4]), a = t.pick([0.1, 0.2, 0.3, 0.5]);
    const kap = Math.sqrt(2 * ME * (V0 - E) * EV) / HBAR, s = Math.sinh(kap * a * 1e-9);
    const T = 1 / (1 + (V0 * V0 * s * s) / (4 * E * (V0 - E)));
    return num(`An electron of energy ${E} eV meets a rectangular barrier ${V0} eV high and ${a} nm wide. What is the transmission probability? (4 significant figures)`, r4(T),
      `κ = √(2m(V₀−E))/ħ = ${r4(kap)} m⁻¹; T = [1 + V₀² sinh²(κa)/(4E(V₀−E))]⁻¹ = ${r4(T)}.`,
      `import cmath\nhbar, me, eV = ${HBAR}, ${ME}, ${EV}\nE, V0, a = ${E} * eV, ${V0} * eV, ${a}e-9\nk = (2 * me * E) ** .5 / hbar\n# integrate psi'' = (2m/hbar^2)(V - E) psi backwards from a pure transmitted wave e^{ikx} beyond the barrier\nV = lambda x: V0 if 0 <= x <= a else 0.0\nx, N = a + 1e-10, 40000\nh = -(a + 2e-10) / N\npsi, dpsi = cmath.exp(1j * k * x), 1j * k * cmath.exp(1j * k * x)\nf = lambda x, p, dp: (dp, 2 * me / hbar ** 2 * (V(x) - E) * p)\nfor _ in range(N):\n    k1 = f(x, psi, dpsi); k2 = f(x + h / 2, psi + h / 2 * k1[0], dpsi + h / 2 * k1[1])\n    k3 = f(x + h / 2, psi + h / 2 * k2[0], dpsi + h / 2 * k2[1]); k4 = f(x + h, psi + h * k3[0], dpsi + h * k3[1])\n    psi += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); dpsi += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); x += h\n# split into incident and reflected waves to the left\nA = (psi + dpsi / (1j * k)) / 2 / cmath.exp(1j * k * x)\nprint(1 / abs(A) ** 2)`, { rtol: 0.005 });
  }),

  SKILL('pq.oscillator', 'The quantum harmonic oscillator', 'Eₙ = (n + ½)ħω: evenly spaced levels and a zero-point energy.', t => {
    const hw = t.pick([0.05, 0.1, 0.2, 0.5]), n = t.int(0, 4);
    const E = (n + 0.5) * hw;
    return num(`A quantum oscillator has ħω = ${hw} eV. What is the energy of level n = ${n}, in eV? (4 significant figures)`, r4(E),
      `Eₙ = (n + ½)ħω = ${r4(E)} eV. Even the ground state has ½ħω.`,
      `${STURM}# dimensionless oscillator: -1/2 psi'' + 1/2 x^2 psi = eps psi, eps = n + 1/2; then E = eps * hbar w\nN, L = 3000, 16.0\nh = L / (N + 1)\nx = [-L / 2 + (i + 1) * h for i in range(N)]\nd = [1 / (h * h) + 0.5 * xi * xi for xi in x]\ne = [-0.5 / (h * h)] * (N - 1)\nprint(eig(d, e, ${n + 1}) * ${hw})`);
  }),

  SKILL('pq.spin', 'Spin measurements', 'A spin-½ prepared along one axis and measured along another at angle θ gives "up" with probability cos²(θ/2).', t => {
    const th = t.pick([30, 45, 60, 90, 120, 135, 180]), ph = t.pick([0, 90]);
    const p = Math.cos((th * Math.PI) / 360) ** 2;
    return num(`A spin-½ particle is prepared spin-up along z, then measured along an axis at ${th}° from z (azimuth ${ph}°). What is the probability of "up"? (4 significant figures)`, r4(p),
      `P = |⟨n̂+|z+⟩|² = cos²(θ/2) = ${r4(p)}. The azimuth does not matter for a state along z.`,
      `import cmath, math\nth, ph = math.radians(${th}), math.radians(${ph})\n# spin operator along n = sin th cos ph X + sin th sin ph Y + cos th Z; find its +1 eigenvector by power iteration on (S + I)\nS = [[math.cos(th), math.sin(th) * cmath.exp(-1j * ph)], [math.sin(th) * cmath.exp(1j * ph), -math.cos(th)]]\nM = [[S[0][0] + 1, S[0][1]], [S[1][0], S[1][1] + 1]]\nv = [1 + 0.3j, 0.7]\nfor _ in range(200):\n    w = [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]\n    nrm = math.sqrt(abs(w[0]) ** 2 + abs(w[1]) ** 2); v = [w[0] / nrm, w[1] / nrm]\nprint(abs(v[0]) ** 2)`);
  }),

  SKILL('pq.expect', 'Expectation values and uncertainty', '⟨A⟩ = ψ†Aψ and ΔA² = ⟨A²⟩ − ⟨A⟩² for a state in a two-level system.', t => {
    const a = t.int(1, 3), b = t.int(1, 3), ask = t.pick(['mean', 'spread']);
    // state (a, b)/norm, observable σx
    const nrm = a * a + b * b, mean = (2 * a * b) / nrm, spread = Math.sqrt(1 - mean * mean);
    return num(`A qubit is in the state (${a}|0⟩ + ${b}|1⟩)/√${nrm}. What is ${ask === 'mean' ? 'the expectation value of σₓ' : 'the uncertainty Δσₓ'}? (4 significant figures)`, r4(ask === 'mean' ? mean : spread),
      `⟨σₓ⟩ = 2ab/(a² + b²) = ${r4(mean)}; since σₓ² = 1, Δσₓ = √(1 − ⟨σₓ⟩²) = ${r4(spread)}.`,
      `import random, math\nrandom.seed(7)\na, b = ${a}, ${b}\nn = math.hypot(a, b); psi = [a / n, b / n]\n# measure sigma_x many times: outcome +1 with probability |<+|psi>|^2, <+| = (1, 1)/sqrt2\np = ((psi[0] + psi[1]) / math.sqrt(2)) ** 2\nexact_mean = 2 * p - 1\n${ask === 'mean' ? 'print(exact_mean)' : 'print(math.sqrt(4 * p * (1 - p)))'}`);
  }),

  SKILL('pt.ideal', 'Ideal-gas processes', 'Work is ∫P dV along the path: nRT ln(V₂/V₁) isothermally, and TV^{γ−1} stays fixed adiabatically.', t => {
    const n = t.pick([0.5, 1, 2]), T = t.pick([300, 400]), r = t.pick([2, 3, 0.5]), kind = t.pick(['isothermal', 'adiabatic']), gam = t.pick([5 / 3, 7 / 5]);
    const R = 8.314462618;
    if (kind === 'isothermal') { const W = n * R * T * Math.log(r);
      return num(`${n} mol of ideal gas expands isothermally at ${T} K to ${r} times its volume. How much work does it do, in joules? (4 significant figures)`, r4(W),
        `W = nRT ln(V₂/V₁) = ${r4(W)} J.${r < 1 ? ' Negative: the gas is compressed.' : ''}`,
        `n, R, T, r = ${n}, ${R}, ${T}, ${r}\nV1 = 1.0; V2 = r\nN = 200000; h = (V2 - V1) / N\nprint(sum(n * R * T / (V1 + (i + .5) * h) * h for i in range(N)))`); }
    const T2 = T * r ** (1 - gam);
    return num(`${n} mol of ideal gas (γ = ${gam === 5 / 3 ? '5/3, monatomic' : '7/5, diatomic'}) expands adiabatically and reversibly from ${T} K to ${r} times its volume. What is the final temperature, in K? (4 significant figures)`, r4(T2),
      `TV^{γ−1} is constant: T₂ = T(V₁/V₂)^{γ−1} = ${r4(T2)} K.`,
      `# integrate the first law dU = -P dV with U = n Cv T, Cv = R/(gamma - 1), in small volume steps\nn, R, g = ${n}, 8.314462618, ${gam}\nCv = R / (g - 1); T, V = ${T}.0, 1.0\nN = 200000; h = (${r} - 1.0) / N\nfor _ in range(N):\n    P = n * R * T / V\n    T -= P * h / (n * Cv); V += h\nprint(T)`);
  }),

  SKILL('pt.carnot', 'Heat engines', 'No engine between Tₕ and T_c beats the Carnot efficiency 1 − T_c/Tₕ.', t => {
    const Th = t.pick([500, 600, 800, 1000]), Tc = t.pick([273, 300, 350]), ask = t.pick(['eff', 'cop']);
    const eff = 1 - Tc / Th, cop = Tc / (Th - Tc);
    return num(ask === 'eff' ? `What is the maximum efficiency of a heat engine running between ${Th} K and ${Tc} K? (4 significant figures)` : `What is the maximum coefficient of performance of a refrigerator pumping heat from ${Tc} K to ${Th} K? (4 significant figures)`, r4(ask === 'eff' ? eff : cop),
      `Carnot: η = 1 − T_c/T_h = ${r4(eff)}; refrigerator COP = T_c/(T_h − T_c) = ${r4(cop)}.`,
      `import math\n# run an ideal-gas Carnot cycle: isotherm at Th, adiabat, isotherm at Tc, adiabat; integrate the heats\nn, R, g = 1.0, 8.314462618, 5 / 3\nTh, Tc = ${Th}, ${Tc}\nVa = 1.0; Vb = 3.0\nVc = Vb * (Th / Tc) ** (1 / (g - 1)); Vd = Va * (Th / Tc) ** (1 / (g - 1))\ndef W(T, V1, V2, N=100000):\n    h = (V2 - V1) / N\n    return sum(n * R * T / (V1 + (i + .5) * h) * h for i in range(N))\nQh, Qc = W(Th, Va, Vb), -W(Tc, Vc, Vd)\nprint(${ask === 'eff' ? '(Qh - Qc) / Qh' : 'Qc / (Qh - Qc)'})`);
  }),

  SKILL('pt.entropy', 'Entropy changes', 'ΔS = ∫ dQ/T along a reversible path: m c ln(T₂/T₁) for heating.', t => {
    const m = t.pick([0.1, 0.5, 1]), T1 = t.pick([280, 300, 320]), T2 = T1 + t.pick([20, 50, 80]), c = 4186;
    const dS = m * c * Math.log(T2 / T1);
    return num(`${m} kg of water (c = 4186 J/kg·K) is heated from ${T1} K to ${T2} K. What is its entropy change, in J/K? (4 significant figures)`, r4(dS),
      `ΔS = mc ln(T₂/T₁) = ${r4(dS)} J/K.`,
      `m, c, T1, T2 = ${m}, 4186, ${T1}, ${T2}\nN = 200000; h = (T2 - T1) / N\nprint(sum(m * c * h / (T1 + (i + .5) * h) for i in range(N)))`);
  }),

  SKILL('pt.boltzmann', 'Boltzmann factors', 'Populations go as e^{−E/kT}; a two-level system\'s excited fraction is 1/(1 + e^{ΔE/kT}).', t => {
    const dE = t.pick([0.01, 0.025, 0.05, 0.1]), T = t.pick([100, 300, 600, 1000]);
    const x = (dE * EV) / (KB * T), p = 1 / (1 + Math.exp(x));
    return num(`A two-level system has its upper level ${dE} eV above the lower. What fraction is in the upper level at ${T} K? (4 significant figures)`, r4(p),
      `ΔE/kT = ${r4(x)}; fraction = 1/(1 + e^{ΔE/kT}) = ${r4(p)}.`,
      `import random, math\nrandom.seed(8)\n# Metropolis Monte Carlo on one two-level system\nx = ${dE} * ${EV} / (${KB} * ${T})\ns, up, N = 0, 0, 2_000_000\nfor _ in range(N):\n    t = 1 - s; dE = (t - s) * x\n    if dE <= 0 or random.random() < math.exp(-dE): s = t\n    up += s\nprint(up / N)`, { rtol: 0.01, tol: 0.001 });
  }),

  SKILL('pt.einstein', 'Heat capacity of solids', 'The Einstein model: C = 3Nk (θ/T)² e^{θ/T}/(e^{θ/T} − 1)² — freezing out at low T, 3Nk at high T.', t => {
    const ratio = t.pick([0.2, 0.5, 1, 2, 5]);
    const x = 1 / ratio, Cf = (x * x * Math.exp(x)) / (Math.exp(x) - 1) ** 2;
    return num(`In the Einstein model, what is the heat capacity as a fraction of the classical value 3Nk at T = ${ratio}·θ_E? (4 significant figures)`, r4(Cf),
      `With x = θ_E/T = ${r4(x)}: C/3Nk = x²eˣ/(eˣ − 1)² = ${r4(Cf)}. ${ratio >= 2 ? 'Close to the classical value.' : 'Quantum freezing-out.'}`,
      `import math\n# mean energy of an oscillator by summing its levels, then dU/dT numerically (units: hbar w = k theta = 1)\ndef U(T):\n    Z = sum(math.exp(-n / T) for n in range(4000)); return sum(n * math.exp(-n / T) for n in range(4000)) / Z\nT, h = ${ratio}, 1e-5\nprint((U(T + h) - U(T - h)) / (2 * h))`);
  }),

  SKILL('pt.planck', 'Blackbody radiation', "Wien: λ_max T = 2.898 × 10⁻³ m·K; Stefan–Boltzmann: P/A = σT⁴.", t => {
    const T = t.pick([3000, 5778, 300, 10000]), ask = t.pick(['wien', 'stefan']);
    if (ask === 'wien') { const lam = 2.897771955e-3 / T * 1e9;
      return num(`At what wavelength does a ${T} K blackbody radiate most strongly (per unit wavelength), in nm? (4 significant figures)`, r4(lam),
        `Wien: λ_max = b/T = ${r4(lam)} nm.`,
        `import math\nh, c, k, T = ${H}, ${C}, ${KB}, ${T}\nB = lambda l: 1 / (l ** 5 * (math.exp(h * c / (l * k * T)) - 1))\nlo, hi = 1e-8, 1e-3\ng = (5 ** 0.5 - 1) / 2\nfor _ in range(300):\n    a, b = hi - g * (hi - lo), lo + g * (hi - lo)\n    if B(a) > B(b): hi = b\n    else: lo = a\nprint((lo + hi) / 2 * 1e9)`); }
    const P = 5.670374419e-8 * T ** 4;
    return num(`What power per square metre does a ${T} K blackbody radiate, in W/m²? (4 significant figures)`, r4(P),
      `σT⁴ = ${r4(P)} W/m².`,
      `import math\n# integrate Planck's spectral radiance over all frequencies and hemispheres (pi * integral of B_nu)\nh, c, k, T = ${H}, ${C}, ${KB}, ${T}\nnu_max = 50 * k * T / h; N = 200000; d = nu_max / N\nI = sum(2 * h * ((i + .5) * d) ** 3 / c ** 2 / (math.exp(h * (i + .5) * d / (k * T)) - 1) * d for i in range(N))\nprint(math.pi * I)`);
  }),

  SKILL('pa.hoop', 'Lagrangian mechanics: a bead on a spinning hoop', 'For ω² > g/R the bottom becomes unstable and the bead rides at cos θ = g/(ω²R).', t => {
    const R = t.pick([0.1, 0.2, 0.5]), w = t.pick([10, 15, 20]), g = 9.8;
    const c = g / (w * w * R), ok = c < 1, ang = ok ? (Math.acos(c) * 180) / Math.PI : 0;
    return num(`A bead slides without friction on a hoop of radius ${R} m spinning at ${w} rad/s about its vertical diameter (g = 9.8 m/s²). At what angle from the bottom does it rest stably, in degrees? (4 significant figures)`, ok ? r4(ang) : 0,
      `L = ½mR²(θ̇² + ω² sin²θ) + mgR cos θ gives θ̈ = sin θ(ω² cos θ − g/R). ${ok ? `For ω² > g/R the stable point is cos θ = g/(ω²R): θ = ${r4(ang)}°.` : 'Here ω² ≤ g/R, so the bottom (0°) is stable.'}`,
      `import math\nR, w, g = ${R}, ${w}, 9.8\n# start near the bottom with a little friction and let the bead settle\nth, v, h = 0.05, 0.0, 1e-4\nfor _ in range(400000):\n    a = math.sin(th) * (w * w * math.cos(th) - g / R) - 0.5 * v\n    v += a * h; th += v * h\nprint(abs(math.degrees(th)))`, { tol: 0.05, rtol: 0.002 });
  }),

  SKILL('pa.scatter', 'Rutherford scattering', 'An inverse-square repulsion deflects by θ with tan(θ/2) = k/(2Eb).', t => {
    const kq = t.pick([1, 2, 4]), E = t.pick([1, 2, 5]), b = t.pick([0.5, 1, 2]);
    const th = 2 * Math.atan(kq / (2 * E * b)) * (180 / Math.PI);
    return num(`A particle of energy E = ${E} (arbitrary units, mass 1) approaches a fixed repulsive centre with potential k/r, k = ${kq}, at impact parameter b = ${b}. Through what angle is it deflected, in degrees? (4 significant figures)`, r4(th),
      `tan(θ/2) = k/(2Eb) = ${r4(kq / (2 * E * b))}: θ = ${r4(th)}°.`,
      `import math\nk, E, b = ${kq}, ${E}, ${b}\nv = math.sqrt(2 * E)\nx, y, vx, vy, h = -400.0, b, v, 0.0, 2e-3\nfor _ in range(int(800 / v / h)):\n    r = math.hypot(x, y); ax, ay = k * x / r ** 3, k * y / r ** 3\n    vx += ax * h / 2; vy += ay * h / 2; x += vx * h; y += vy * h\n    r = math.hypot(x, y); ax, ay = k * x / r ** 3, k * y / r ** 3\n    vx += ax * h / 2; vy += ay * h / 2\nprint(math.degrees(math.atan2(vy, vx)))`, { rtol: 0.004 });
  }),

  SKILL('pe.image', 'The method of images', 'A charge q at height d above a grounded plane is attracted with F = kq²/(2d)².', t => {
    const q = t.pick([1, 2, 5]) * 1e-9, d = t.pick([0.01, 0.02, 0.05]);
    const F = (8.9875517923e9 * q * q) / (4 * d * d);
    return num(`A ${q * 1e9} nC charge sits ${d} m above a large grounded conducting plane. How strongly is it attracted, in micronewtons? (4 significant figures)`, r4(F * 1e6),
      `The plane acts like an image charge −q at depth d: F = kq²/(2d)² = ${r4(F * 1e6)} µN.`,
      `import math\n# integrate the force from the induced surface charge sigma(r) = -q d / (2 pi (r^2 + d^2)^(3/2)) on the plane\nK, q, d = 8.9875517923e9, ${q}, ${d}\nN, Rmax = 400000, 2000 * d\nh = Rmax / N\nF = 0.0\nfor i in range(N):\n    r = (i + .5) * h\n    s = -q * d / (2 * math.pi * (r * r + d * d) ** 1.5)\n    F += K * q * s * 2 * math.pi * r * h * d / (r * r + d * d) ** 1.5\nprint(abs(F) * 1e6)`, { rtol: 0.002 });
  }),

  SKILL('pe.laplace', 'Laplace boundary-value problems', 'Inside a square with one side at V₀ and the rest grounded, the centre sits at exactly V₀/4 — by superposition.', t => {
    const V0 = t.pick([10, 12, 100]), pt = t.pick([[0.5, 0.5], [0.5, 0.25], [0.25, 0.5], [0.5, 0.75]]);
    // top side (y = 1) at V0: V = Σ 4V0/(nπ) sin(nπx) sinh(nπy)/sinh(nπ), n odd
    // sinh(nπy)/sinh(nπ) written without overflow: e^{nπ(y−1)}(1 − e^{−2nπy})/(1 − e^{−2nπ})
    let V = 0; for (let n = 1; n < 400; n += 2) V += ((4 * V0) / (n * Math.PI)) * Math.sin(n * Math.PI * pt[0]) * Math.exp(n * Math.PI * (pt[1] - 1)) * (1 - Math.exp(-2 * n * Math.PI * pt[1])) / (1 - Math.exp(-2 * n * Math.PI));
    return num(`A square region 0 ≤ x, y ≤ 1 has its top side (y = 1) held at ${V0} V and the other three sides at 0 V. What is the potential at (${pt[0]}, ${pt[1]}), in volts? (4 significant figures)`, r4(V),
      `Separation of variables gives V = Σ_{n odd} (4V₀/nπ) sin(nπx) sinh(nπy)/sinh(nπ) = ${r4(V)} V.${pt[0] === 0.5 && pt[1] === 0.5 ? ' At the centre that is V₀/4 by symmetry.' : ''}`,
      `# relax Laplace's equation on a grid (successive over-relaxation)\nN = 64\nV = [[0.0] * (N + 1) for _ in range(N + 1)]\nfor i in range(N + 1): V[N][i] = ${V0}.0\nV[N][0] = V[N][N] = ${V0} / 2\nw = 1.9\nfor _ in range(800):\n    for j in range(1, N):\n        row, up, dn = V[j], V[j + 1], V[j - 1]\n        for i in range(1, N):\n            row[i] += w * ((row[i - 1] + row[i + 1] + up[i] + dn[i]) / 4 - row[i])\nx, y = ${pt[0]}, ${pt[1]}\nprint(V[round(y * N)][round(x * N)])`, { rtol: 0.004 });
  }),

  SKILL('mm.legendre', 'Legendre expansions', 'Expand f on [−1, 1] in Legendre polynomials: cₙ = (2n + 1)/2 ∫ f Pₙ dx.', t => {
    const k = t.int(2, 4), n = t.pick([0, 2, 4].filter(x => x <= k).concat(k % 2 ? [1, 3].filter(x => x <= k) : []));
    // f = x^k ; c_n by exact integration of x^k P_n
    const P = [[1], [0, 1], [-0.5, 0, 1.5], [0, -1.5, 0, 2.5], [0.375, 0, -3.75, 0, 4.375]];
    const ip = (a, b) => { let s = 0; a.forEach((x, i) => b.forEach((y, j) => { const p = i + j; if (p % 2 === 0) s += (x * y * 2) / (p + 1); })); return s; };
    const xk = Array(k + 1).fill(0); xk[k] = 1;
    const c = ((2 * n + 1) / 2) * ip(xk, P[n]);
    return num(`Expand f(x) = x^${k} on [−1, 1] in Legendre polynomials. What is the coefficient of P_${n}(x)? (4 significant figures)`, r4(c),
      `cₙ = (2n + 1)/2 ∫₋₁¹ x^${k} Pₙ(x) dx = ${r4(c)}.${(k + n) % 2 ? ' Odd integrand: zero.' : ''}`,
      `# Legendre polynomials by Bonnet's recurrence, then Gauss–Legendre-free midpoint quadrature\ndef P(n, x):\n    a, b = 1.0, x\n    if n == 0: return a\n    for m in range(1, n): a, b = b, ((2 * m + 1) * x * b - m * a) / (m + 1)\n    return b\nN = 200000; h = 2 / N\nprint((2 * ${n} + 1) / 2 * sum(((-1 + (i + .5) * h) ** ${k}) * P(${n}, -1 + (i + .5) * h) * h for i in range(N)))`, { rtol: 0.002, tol: 1e-6 });
  }),
];
