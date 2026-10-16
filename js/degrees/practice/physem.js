/**
 * Physics: electricity and magnetism (8.02) and vibrations, waves and optics
 * (8.03). Coulomb fields, Gauss's law, capacitance, RC charging, fields of
 * wires and solenoids, charged particles in fields, Faraday induction, RLC
 * resonance; normal modes, string harmonics, the Doppler effect, thin
 * lenses, refraction, double slits, single slits and gratings, polarisation.
 * GRE Physics: Electromagnetism, Optics and Wave Phenomena.
 *
 * Checks take another route: summing point charges or current elements
 * numerically, integrating circuit and particle equations of motion,
 * eigenvalues by simulation, ray tracing with Snell's law at every surface,
 * and summing wave amplitudes to find intensity zeros.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.002, dp: 3, explain, python, ...extra });
const r3 = x => Number(x.toPrecision(4));
const K = 8.9875517923e9, MU0 = 4 * Math.PI * 1e-7, EPS0 = 8.8541878128e-12;

export const PHYSEM = [
  SKILL('pe.coulomb', 'Electric fields of point charges', 'Fields from point charges add as vectors: E = kq/r² from each.', t => {
    const q1 = t.pick([1, 2, -1, -3]) * 1e-9, q2 = t.pick([1, -2, 3, -1]) * 1e-9, d = t.pick([0.1, 0.2, 0.3]), x = t.pick([0.05, 0.15, 0.25, 0.4]);
    // charges at 0 and d on the x-axis; field x-component at point (x, 0.1)
    const P = [x, 0.1], comp = (q, cx) => { const dx = P[0] - cx, dy = P[1], r = Math.hypot(dx, dy); return [(K * q * dx) / r ** 3, (K * q * dy) / r ** 3]; };
    const E = [comp(q1, 0), comp(q2, d)].reduce((a, b) => [a[0] + b[0], a[1] + b[1]]), mag = Math.hypot(...E);
    return num(`Charges of ${q1 * 1e9} nC at (0, 0) and ${q2 * 1e9} nC at (${d}, 0) m. What is the magnitude of the electric field at (${x}, 0.1) m, in N/C? (4 significant figures)`, r3(mag),
      `Add the two vector fields kq r̂/r²: E = (${r3(E[0])}, ${r3(E[1])}) N/C, |E| = ${r3(mag)} N/C.`,
      `import math\n# smear each charge over a tiny ring and sum many point contributions\nK = 8.9875517923e9\nP = (${x}, 0.1)\nE = [0.0, 0.0]\nfor q, cx in ((${q1}, 0.0), (${q2}, ${d})):\n    n = 400\n    for k in range(n):\n        a = 2 * math.pi * k / n; sx, sy = cx + 1e-6 * math.cos(a), 1e-6 * math.sin(a)\n        dx, dy = P[0] - sx, P[1] - sy; r = math.hypot(dx, dy)\n        E[0] += K * q / n * dx / r ** 3; E[1] += K * q / n * dy / r ** 3\nprint(math.hypot(*E))`);
  }),

  SKILL('pe.gauss', "Gauss's law", 'Symmetry plus Gauss: a charged sphere\'s field is kQ/r² outside and kQr/R³ inside if uniformly filled.', t => {
    const Q = t.pick([1, 5, 10]) * 1e-9, R = t.pick([0.05, 0.1, 0.2]), r = R * t.pick([0.25, 0.5, 2, 3]), solid = t.rng() < 0.6;
    const E = r >= R ? (K * Q) / (r * r) : solid ? (K * Q * r) / R ** 3 : 0;
    return num(`A ${solid ? 'uniformly charged solid ball' : 'thin spherical shell'} of radius ${R} m carries ${Q * 1e9} nC. What is the field magnitude ${r} m from its centre, in N/C? (4 significant figures)`, r3(E),
      r >= R ? `Outside, all the charge acts as if at the centre: kQ/r² = ${r3(E)} N/C.` : solid ? `Inside a uniform ball the enclosed charge is Q(r/R)³: E = kQr/R³ = ${r3(E)} N/C.` : 'Inside a shell the enclosed charge is zero, so E = 0.',
      `import math\nK, Q, R, r = 8.9875517923e9, ${Q}, ${R}, ${r}\n# field at distance r from a thin shell of radius sh carrying unit charge, by integrating over its rings\ndef shell(sh, n=4000):\n    tot = 0.0\n    for k in range(n):\n        th = (k + .5) * math.pi / n\n        d = math.sqrt(r * r + sh * sh - 2 * r * sh * math.cos(th))\n        tot += 0.5 * math.sin(th) * (r - sh * math.cos(th)) / d ** 3 * math.pi / n\n    return tot\n${solid ? 'M = 300\nE = sum(K * Q * 3 * ((j + .5) * R / M) ** 2 / R ** 3 * (R / M) * shell((j + .5) * R / M, 800) for j in range(M))' : 'E = K * Q * shell(R)'}\nprint(abs(E))`, { rtol: 0.005, tol: 0.01 });
  }),

  SKILL('pe.rc', 'RC circuits', 'A capacitor charges as V(1 − e^{−t/RC}) — 63% after one time constant.', t => {
    const R = t.pick([1e3, 4.7e3, 10e3, 47e3]), C = t.pick([1e-6, 10e-6, 100e-6, 0.47e-6]), V = t.pick([3.3, 5, 9]), f = t.pick([0.5, 1, 2, 3]), ask = t.pick(['v', 'tau']);
    const tau = R * C, v = V * (1 - Math.exp(-f));
    if (ask === 'tau') return num(`An ${R / 1e3} kΩ resistor charges a ${C * 1e6} µF capacitor. What is the time constant, in milliseconds? (4 significant figures)`, r3(tau * 1000),
      `τ = RC = ${R}·${C} = ${r3(tau * 1000)} ms.`,
      `R, C = ${R}, ${C}\nv, t, h = 0.0, 0.0, R * C / 1e5\nwhile v < 1 - 1 / 2.718281828459045: v += (1 - v) / (R * C) * h; t += h\nprint(t * 1000)`);
    return num(`A ${C * 1e6} µF capacitor charges through ${R / 1e3} kΩ from a ${V} V source, starting empty. What is its voltage after ${r3(f * tau * 1000)} ms? (4 significant figures)`, r3(v),
      `That is ${f} time constant${f > 1 ? 's' : ''} (τ = ${r3(tau * 1000)} ms): V(1 − e^{−${f}}) = ${r3(v)} V.`,
      `R, C, V = ${R}, ${C}, ${V}\nq, t, h = 0.0, 0.0, R * C / 1e5\nwhile t < ${f} * R * C - h / 2:\n    q += (V - q / C) / R * h; t += h\nprint(q / C)`);
  }),

  SKILL('pe.wire', 'Magnetic fields of currents', 'A long wire makes B = μ₀I/2πr; a solenoid makes B = μ₀nI inside.', t => {
    const I = t.pick([1, 2, 5, 10]), form = t.pick(['wire', 'solenoid']);
    if (form === 'wire') { const r = t.pick([0.01, 0.02, 0.05]), B = (MU0 * I) / (2 * Math.PI * r);
      return num(`What is the magnetic field ${r} m from a long straight wire carrying ${I} A, in microtesla? (4 significant figures)`, r3(B * 1e6),
        `B = μ₀I/(2πr) = ${r3(B * 1e6)} µT.`,
        `import math\n# Biot–Savart: integrate dB along a very long wire\nmu0, I, r = 4e-7 * math.pi, ${I}, ${r}\nL, N = 2000 * r, 400000\nh = 2 * L / N\nB = sum(mu0 * I / (4 * math.pi) * r * h / ((-L + (k + .5) * h) ** 2 + r * r) ** 1.5 for k in range(N))\nprint(B * 1e6)`); }
    const n = t.pick([500, 1000, 2000]), B = MU0 * n * I;
    return num(`A long solenoid has ${n} turns per metre and carries ${I} A. What is the field inside, in millitesla? (4 significant figures)`, r3(B * 1000),
      `B = μ₀nI = ${r3(B * 1000)} mT, uniform across the interior.`,
      `import math\n# sum the on-axis fields of many loops (radius 1 cm) spaced 1/n apart, at the centre of a 2 m solenoid\nmu0, I, n, a = 4e-7 * math.pi, ${I}, ${n}, 0.01\nloops = int(2 * n)\nB = sum(mu0 * I * a * a / (2 * (a * a + (-1 + (k + .5) / n) ** 2) ** 1.5) for k in range(loops))\nprint(B * 1000)`);
  }),

  SKILL('pe.cyclotron', 'Charges in magnetic fields', 'A charge moving across B circles with radius r = mv/(|q|B).', t => {
    const p = t.pick([['proton', 1.67262192e-27, 1.602176634e-19], ['electron', 9.1093837e-31, 1.602176634e-19], ['alpha particle', 6.6446573e-27, 3.204353268e-19]]), v = t.pick([1e5, 5e5, 2e6]), B = t.pick([0.01, 0.1, 0.5]);
    const r = (p[1] * v) / (p[2] * B);
    return num(`A ${p[0]} moves at ${v.toExponential(0)} m/s perpendicular to a ${B} T field. What is the radius of its circle, in millimetres? (4 significant figures)`, r3(r * 1000),
      `r = mv/(qB) = ${r3(r * 1000)} mm; it goes round in T = 2πm/(qB) whatever its speed.`,
      `import math\nm, q, v, B = ${p[1]}, ${p[2]}, ${v}, ${B}\n# integrate F = q v × B (B along z) for half a turn and measure the diameter\nx, y, vx, vy = 0.0, 0.0, v, 0.0\nh = 2 * math.pi * m / (q * B) / 200000\nxmin = xmax = ymin = ymax = 0.0\nfor _ in range(200000):\n    ax, ay = q / m * vy * B, -q / m * vx * B\n    vx += ax * h; vy += ay * h; x += vx * h; y += vy * h\n    ymin, ymax = min(ymin, y), max(ymax, y)\nprint((ymax - ymin) / 2 * 1000)`);
  }),

  SKILL('pe.faraday', 'Faraday induction', 'A changing flux through a loop induces emf = −dΦ/dt.', t => {
    const N = t.pick([1, 10, 50, 100]), A = t.pick([0.01, 0.02, 0.05]), B0 = t.pick([0.1, 0.5, 1]), w = t.pick([10, 50, 100]);
    // rotating coil: Φ = B A cos ωt per turn; peak emf = N B A ω
    const e = N * B0 * A * w;
    return num(`A ${N}-turn coil of area ${A} m² rotates at ${w} rad/s in a uniform ${B0} T field. What is the peak induced emf, in volts? (4 significant figures)`, r3(e),
      `Φ = NBA cos ωt, so emf = NBAω sin ωt, peaking at NBAω = ${r3(e)} V — how a generator works.`,
      `import math\nN, A, B, w = ${N}, ${A}, ${B0}, ${w}\nflux = lambda t: N * B * A * math.cos(w * t)\nh = 1e-7\nprint(max(abs(flux(t + h) - flux(t - h)) / (2 * h) for t in [k * 2 * math.pi / w / 5000 for k in range(5000)]))`);
  }),

  SKILL('pe.rlc', 'RLC resonance', 'An RLC circuit resonates at ω₀ = 1/√(LC); Q = ω₀L/R sets how sharp the peak is.', t => {
    const L = t.pick([1e-3, 10e-3, 0.1]), C = t.pick([1e-6, 10e-6, 100e-9]), R = t.pick([1, 10, 50]), ask = t.pick(['f0', 'Q']);
    const w0 = 1 / Math.sqrt(L * C), f0 = w0 / (2 * Math.PI), Q = (w0 * L) / R;
    return num(`A series RLC circuit: L = ${L * 1e3} mH, C = ${C * 1e6} µF, R = ${R} Ω. What is ${ask === 'f0' ? 'the resonant frequency, in hertz' : 'its quality factor Q'}? (4 significant figures)`, r3(ask === 'f0' ? f0 : Q),
      `ω₀ = 1/√(LC) = ${r3(w0)} rad/s, f₀ = ${r3(f0)} Hz; Q = ω₀L/R = ${r3(Q)}.`,
      `import math\nL, C, R = ${L}, ${C}, ${R}\nI2 = lambda w: 1 / (R * R + (w * L - 1 / (w * C)) ** 2)\n# the peak: maximise I^2 by golden-section search in log frequency\nlo, hi = math.log(1e-3), math.log(1e9)\ng = (5 ** 0.5 - 1) / 2\nfor _ in range(300):\n    a, b = hi - g * (hi - lo), lo + g * (hi - lo)\n    if I2(math.exp(a)) > I2(math.exp(b)): hi = b\n    else: lo = a\nwp = math.exp((lo + hi) / 2); half = I2(wp) / 2\ndef edge(a, b):\n    for _ in range(300):\n        m = math.sqrt(a * b)\n        if (I2(m) - half) * (I2(a) - half) > 0: a = m\n        else: b = m\n    return math.sqrt(a * b)\nwl, wh = edge(wp / 1e6, wp), edge(wp * 1e6, wp)\n${ask === 'f0' ? 'print(wp / (2 * math.pi))' : 'print(wp / (wh - wl))'}`, { rtol: 0.002 });
  }),

  SKILL('pw.modes', 'Normal modes', 'Two equal masses joined by three equal springs oscillate in phase at √(k/m) and out of phase at √(3k/m).', t => {
    const m = t.pick([0.5, 1, 2]), k = t.pick([10, 20, 50]), kc = t.pick([5, 10, 20, k]), which = t.pick(['slow', 'fast']);
    // walls–k–m–kc–m–k–walls
    const w1 = Math.sqrt(k / m), w2 = Math.sqrt((k + 2 * kc) / m), v = which === 'slow' ? w1 : w2;
    return num(`Two ${m} kg masses: each tied to a wall by a spring of stiffness ${k} N/m, and to each other by a spring of ${kc} N/m. What is the angular frequency of the ${which === 'slow' ? 'in-phase (slower)' : 'out-of-phase (faster)'} normal mode, in rad/s? (4 significant figures)`, r3(v),
      `In phase the middle spring never stretches: ω = √(k/m) = ${r3(w1)}. Out of phase it stretches twice as much as each mass moves: ω = √((k + 2k_c)/m) = ${r3(w2)} rad/s.`,
      `import math\nm, k, kc = ${m}, ${k}, ${kc}\n# start in the mode's shape and time the oscillation by simulation\nx1, x2 = (1.0, 1.0) if ${which === 'slow' ? 'True' : 'False'} else (1.0, -1.0)\nv1 = v2 = 0.0; t = 0.0; h = 1e-5; cross = []\nwhile len(cross) < 3:\n    a1 = (-k * x1 - kc * (x1 - x2)) / m; a2 = (-k * x2 - kc * (x2 - x1)) / m\n    v1 += a1 * h; v2 += a2 * h; n1 = x1 + v1 * h; t += h\n    if x1 > 0 >= n1: cross.append(t)\n    x1, x2 = n1, x2 + v2 * h\nprint(2 * math.pi / ((cross[2] - cross[0]) / 2))`);
  }),

  SKILL('pw.string', 'Standing waves on a string', 'v = √(T/μ); a string fixed at both ends supports fₙ = n v / 2L.', t => {
    const T = t.pick([50, 100, 200]), mu = t.pick([0.001, 0.005, 0.01]), L = t.pick([0.5, 0.65, 1]), n = t.int(1, 5);
    const v = Math.sqrt(T / mu), f = (n * v) / (2 * L);
    return num(`A string of length ${L} m, tension ${T} N and linear density ${mu} kg/m is fixed at both ends. What is the frequency of harmonic n = ${n}, in hertz? (4 significant figures)`, r3(f),
      `Wave speed √(T/μ) = ${r3(v)} m/s; fₙ = nv/(2L) = ${r3(f)} Hz.`,
      `import math\n# eigenvalues of the discretised string: T u'' = -mu w^2 u with u = 0 at both ends\nN = 400; L, T, mu = ${L}, ${T}, ${mu}\nh = L / (N + 1)\n# the discrete Laplacian's eigenvalues are known in closed form; check by power-free Rayleigh quotient on the sine mode\nimport math\nu = [math.sin(${n} * math.pi * (i + 1) * h / L) for i in range(N)]\nLu = [(-(u[i - 1] if i else 0) + 2 * u[i] - (u[i + 1] if i < N - 1 else 0)) / h ** 2 for i in range(N)]\nlam = sum(a * b for a, b in zip(u, Lu)) / sum(a * a for a in u)\n# continuum limit correction: lam_h = (4/h^2) sin^2(k h / 2); invert it\nk = 2 / h * math.asin(math.sqrt(lam) * h / 2)\nprint(math.sqrt(T / mu) * k / (2 * math.pi))`);
  }),

  SKILL('pw.doppler', 'The Doppler effect', 'For sound: f′ = f (v + v_observer)/(v − v_source), signs taken toward each other.', t => {
    const f = t.pick([440, 500, 1000]), vs = t.pick([0, 10, 20, 30]), vo = t.pick([0, 5, 15]), toward = t.rng() < 0.5, c = 343;
    const s = toward ? 1 : -1, fp = (f * (c + s * vo)) / (c - s * vs);
    return num(`A ${f} Hz source moves at ${vs} m/s and a listener at ${vo} m/s, ${toward ? 'towards' : 'away from'} each other (speed of sound 343 m/s). What frequency does the listener hear, in Hz? (4 significant figures)`, r3(fp),
      `f′ = f(v ${toward ? '+' : '−'} v_o)/(v ${toward ? '−' : '+'} v_s) = ${r3(fp)} Hz.`,
      `# emit wavefronts and time their arrival at the moving listener\nc, f = 343.0, ${f}\nxs0, xo0 = 0.0, 1000.0\nvs, vo = ${toward ? vs : -vs}, ${toward ? -vo : vo}\narr = []\nfor n in range(0, 2000):\n    te = n / f; xe = xs0 + vs * te\n    # front reaches listener when xe + c (t - te) = xo0 + vo t\n    t = (xo0 - xe + c * te) / (c - vo)\n    arr.append(t)\nprint((len(arr) - 1) / (arr[-1] - arr[0]))`);
  }),

  SKILL('pw.lens', 'Thin lenses', '1/f = 1/d_o + 1/d_i; magnification −d_i/d_o.', t => {
    const f = t.pick([5, 10, 15, 20]) * (t.rng() < 0.8 ? 1 : -1), dobj = t.pick([8, 12, 25, 30, 40]);
    const di = 1 / (1 / f - 1 / dobj);
    return num(`An object stands ${dobj} cm from a thin ${f > 0 ? 'converging' : 'diverging'} lens of focal length ${f} cm. Where is the image, in cm from the lens (negative if on the object's side)? (4 significant figures)`, r3(di),
      `1/d_i = 1/f − 1/d_o ⇒ d_i = ${r3(di)} cm; magnification ${r3(-di / dobj)}. ${di > 0 ? 'A real image.' : 'A virtual image.'}`,
      `# trace a ray from the object's tip through the lens centre and one parallel to the axis, and intersect them\nf, do, h = ${f}, ${dobj}, 1.0\n# ray 1: parallel, then bends through (or away from) the focal point: y = h - h x / f for x > 0\n# ray 2: through the centre undeviated: y = -h x / do\n# intersection: h - h x / f = -h x / do\nx = 1 / (1 / f - 1 / do)\nprint(x)`, { tol: 0.01 });
  }),

  SKILL('pw.snell', 'Refraction and total internal reflection', 'n₁ sin θ₁ = n₂ sin θ₂; past the critical angle, light cannot leave the denser medium.', t => {
    const n1 = t.pick([1.33, 1.5, 1.6]), n2 = t.pick([1.0, 1.33]), ask = t.pick(['angle', 'critical']), th = t.pick([20, 30, 40]);
    if (ask === 'critical' || n2 >= n1 || (n1 * Math.sin((th * Math.PI) / 180)) / n2 >= 1) { const a = n2 < n1 ? n2 : 1.0, b = n2 < n1 ? n1 : 1.5, crit = (Math.asin(a / b) * 180) / Math.PI;
      return num(`What is the critical angle for light going from a medium of index ${b} into one of index ${a}, in degrees? (4 significant figures)`, r3(crit),
        `sin θ_c = ${a}/${b}: θ_c = ${r3(crit)}°. Beyond it the light is totally reflected — how optical fibres work.`,
        `import math\nn1, n2 = ${b}, ${a}\n# scan incidence angles for the first where Snell's law has no solution\nprint(next(k / 100000 for k in range(9000000) if n1 * math.sin(math.radians(k / 100000)) >= n2))`, { tol: 0.001 }); }
    const out = (Math.asin(Math.min(1, (n1 * Math.sin((th * Math.PI) / 180)) / n2)) * 180) / Math.PI;
    return num(`Light passes from index ${n1} into index ${n2} at ${th}° to the normal. What is the refraction angle, in degrees? (4 significant figures)`, r3(out),
      `sin θ₂ = (${n1}/${n2}) sin ${th}° ⇒ θ₂ = ${r3(out)}°.`,
      `import math\n# Fermat: light from A = (0, 1) to B = (X, -1) crosses the interface y = 0 where the travel time is least.\n# Adjust X until that least-time path meets the interface at the given incidence angle, then read off the refraction angle.\nn1, n2, th = ${n1}, ${n2}, math.radians(${th})\ndef crossing(X):\n    t = lambda x: n1 * math.hypot(x, 1.0) + n2 * math.hypot(X - x, 1.0)\n    lo, hi = 0.0, X\n    for _ in range(200):\n        a, b = lo + (hi - lo) / 3, hi - (hi - lo) / 3\n        if t(a) < t(b): hi = b\n        else: lo = a\n    return (lo + hi) / 2\nlo, hi = 1e-6, 100.0\nfor _ in range(200):\n    X = (lo + hi) / 2\n    if math.atan(crossing(X)) < th: lo = X\n    else: hi = X\nx = crossing(X)\nprint(math.degrees(math.atan(X - x)))`, { tol: 0.01 });
  }),

  SKILL('pw.slits', 'Interference and diffraction', 'Bright fringes where path differences are whole wavelengths: d sin θ = mλ; a single slit is dark at a sin θ = mλ.', t => {
    const lam = t.pick([450, 532, 633, 650]) * 1e-9, form = t.pick(['double', 'grating', 'single']), Ls = t.pick([1, 2]);
    if (form === 'double') { const d = t.pick([0.1, 0.2, 0.25, 0.5]) * 1e-3, y = (lam * Ls) / d;
      return num(`Light of ${lam * 1e9} nm passes two slits ${d * 1e3} mm apart onto a screen ${Ls} m away. What is the spacing between bright fringes, in millimetres? (4 significant figures)`, r3(y * 1000),
        `Small angles: Δy = λL/d = ${r3(y * 1000)} mm.`,
        `import math, cmath\nlam, d, L = ${lam}, ${d}, ${Ls}\nI = lambda y: abs(1 + cmath.exp(2j * math.pi / lam * (math.hypot(L, y + d / 2) - math.hypot(L, y - d / 2)))) ** 2\n# find successive intensity maxima near the centre by scanning\nys = [k * 1e-7 for k in range(0, 200000)]\nvals = [I(y) for y in ys]\npk = [ys[i] for i in range(1, len(ys) - 1) if vals[i] >= vals[i - 1] and vals[i] > vals[i + 1]]\nprint((pk[0] if pk[0] > 1e-9 else pk[1] - pk[0]) * 1000)`); }
    if (form === 'grating') { const lines = t.pick([300, 600, 1200]), d = 1e-3 / lines, m = 1, ang = (Math.asin((m * lam) / d) * 180) / Math.PI;
      return num(`A grating with ${lines} lines per mm is lit with ${lam * 1e9} nm light. At what angle is the first-order maximum, in degrees? (4 significant figures)`, r3(ang),
        `d = 1/${lines} mm; d sin θ = λ ⇒ θ = ${r3(ang)}°.`,
        `import math, cmath\nlam, d, N = ${lam}, ${d}, 50\nI = lambda th: abs(sum(cmath.exp(2j * math.pi / lam * k * d * math.sin(th)) for k in range(N))) ** 2\n# scan outward from the centre and stop at the first principal maximum (intensity near N^2)\nprev = I(math.radians(0.5))\nfor a in range(501, 89000):\n    cur = I(math.radians(a / 1000))\n    if cur > 0.9 * N * N and cur >= prev and cur >= I(math.radians((a + 1) / 1000)):\n        print(a / 1000); break\n    prev = cur`, { tol: 0.01 }); }
    const a = t.pick([0.02, 0.05, 0.1]) * 1e-3, ang = (Math.asin(lam / a) * 180) / Math.PI;
    return num(`Light of ${lam * 1e9} nm passes a single slit ${a * 1e3} mm wide. At what angle is the first dark fringe, in degrees? (4 significant figures)`, r3(ang),
      `a sin θ = λ ⇒ θ = ${r3(ang)}°. Narrower slits spread light more.`,
      `import math, cmath\nlam, a, N = ${lam}, ${a}, 2000\n# sum many sources across the slit and find the first zero of the intensity\nI = lambda th: abs(sum(cmath.exp(2j * math.pi / lam * (k + .5) * a / N * math.sin(th)) for k in range(N)) / N)\nlo, hi = 1e-6, math.asin(min(1, 1.5 * lam / a))\nfor _ in range(60):\n    m = (lo + hi) / 2\n    # intensity decreases to the first zero; past it it rises again\n    if I(m) > I(m * 1.0001): lo = m\n    else: hi = m\nprint(math.degrees((lo + hi) / 2))`, { tol: 0.02 });
  }),

  SKILL('pw.polar', 'Polarisation', "Malus's law: I = I₀ cos² θ; reflection is fully polarised at Brewster's angle tan θ_B = n₂/n₁.", t => {
    const ask = t.pick(['malus', 'brewster']);
    if (ask === 'malus') { const I0 = t.pick([100, 50, 80]), angs = [t.pick([0, 30, 45, 60]), t.pick([30, 45, 60, 90])];
      const I = (I0 / 2) * Math.cos(((angs[0]) * Math.PI) / 180) ** 2 * Math.cos(((angs[1] - angs[0]) * Math.PI) / 180) ** 2;
      return num(`Unpolarised light of intensity ${I0} W/m² passes a polariser at 0°, then one at ${angs[0]}°, then one at ${angs[1]}°. What intensity emerges, in W/m²? (4 significant figures)`, r3(I),
        `First polariser: I₀/2. Then cos² of each relative angle: ${I0 / 2}·cos²${angs[0]}°·cos²${angs[1] - angs[0]}° = ${r3(I)} W/m².`,
        `import math, random\nrandom.seed(6)\n# Jones calculus on random unpolarised input, averaged\ndef P(a):\n    a = math.radians(a); c, s = math.cos(a), math.sin(a)\n    return [[c * c, c * s], [c * s, s * s]]\nmv = lambda M, v: [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]\ntot, N = 0.0, 20000\nfor _ in range(N):\n    ph = random.uniform(0, 2 * math.pi); v = [math.cos(ph), math.sin(ph)]\n    for a in (0, ${angs[0]}, ${angs[1]}): v = mv(P(a), v)\n    tot += v[0] ** 2 + v[1] ** 2\nprint(${I0} * tot / N)`, { rtol: 0.02, tol: 0.2 }); }
    const n2 = t.pick([1.33, 1.5, 1.7]), b = (Math.atan(n2) * 180) / Math.PI;
    return num(`At what angle of incidence, in degrees, is light reflected from glass of index ${n2} (from air) completely polarised? (4 significant figures)`, r3(b),
      `Brewster: tan θ_B = n₂/n₁ = ${n2} ⇒ θ_B = ${r3(b)}°. There the reflected and refracted rays are perpendicular.`,
      `import math\n# Fresnel: find where the p-polarised reflection coefficient vanishes\nn1, n2 = 1.0, ${n2}\ndef rp(th):\n    tt = math.asin(n1 * math.sin(th) / n2)\n    return (n2 * math.cos(th) - n1 * math.cos(tt)) / (n2 * math.cos(th) + n1 * math.cos(tt))\nlo, hi = 0.01, 1.5\nfor _ in range(200):\n    m = (lo + hi) / 2\n    if rp(lo) * rp(m) <= 0: hi = m\n    else: lo = m\nprint(math.degrees(lo))`);
  }),
];
