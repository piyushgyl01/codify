/**
 * Mechanical Engineering: dynamics and vibration (2.003SC; FE Mechanical
 * topic 7).
 *
 * Checks take another route: polar kinematics differentiated numerically in
 * Cartesian coordinates, mechanisms differentiated along their position
 * function, falling bodies and hoists integrated in time (RK4), damped and
 * forced oscillators simulated until their peaks or steady state can be
 * measured, and two-degree-of-freedom modes found by power and inverse
 * iteration.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const g = 9.81;

export const MEDYN = [
  SKILL('dyn.polar', 'Kinematics in polar coordinates', 'In polar coordinates a_r = r̈ − rθ̇² and a_θ = rθ̈ + 2ṙθ̇: the centripetal and Coriolis terms appear even when r and θ change steadily.', t => {
    const a = t.pick([0.5, 1, 1.5, 2]), b = t.pick([0.1, 0.2, 0.3, 0.5]), c = t.pick([0.5, 1, 1.5, 2]), d = t.pick([0.1, 0.25, 0.5]), T = t.pick([1, 1.5, 2, 2.5, 3]), ask = t.pick(['a', 'v']);
    const r = a + b * T * T, rd = 2 * b * T, rdd = 2 * b, th = c + 2 * d * T, thdd = 2 * d;
    const ar = rdd - r * th * th, at = r * thdd + 2 * rd * th, v = Math.hypot(rd, r * th), acc = Math.hypot(ar, at);
    return num(`A collar slides along a rotating rod so that r = ${a} + ${b}t² m and θ = ${c}t + ${d}t² rad. At t = ${T} s, what is ${ask === 'a' ? 'the magnitude of its acceleration, in m/s²' : 'its speed, in m/s'}? (4 significant figures)`, r4(ask === 'a' ? acc : v),
      `At t = ${T}: r = ${r4(r)}, ṙ = ${r4(rd)}, r̈ = ${rdd}, θ̇ = ${r4(th)}, θ̈ = ${thdd}. v = √(ṙ² + (rθ̇)²) = ${r4(v)} m/s. a_r = r̈ − rθ̇² = ${r4(ar)}, a_θ = rθ̈ + 2ṙθ̇ = ${r4(at)}, |a| = ${r4(acc)} m/s².`,
      `import math\n# differentiate x(t) and y(t) numerically with five-point stencils\nr = lambda t: ${a} + ${b} * t * t; th = lambda t: ${c} * t + ${d} * t * t\nx = lambda t: r(t) * math.cos(th(t)); y = lambda t: r(t) * math.sin(th(t))\nh, T = 1e-3, ${T}\nd1 = lambda f: (f(T - 2 * h) - 8 * f(T - h) + 8 * f(T + h) - f(T + 2 * h)) / (12 * h)\nd2 = lambda f: (-f(T - 2 * h) + 16 * f(T - h) - 30 * f(T) + 16 * f(T + h) - f(T + 2 * h)) / (12 * h * h)\nprint(${ask === 'a' ? 'math.hypot(d2(x), d2(y))' : 'math.hypot(d1(x), d1(y))'})`);
  }),

  SKILL('dyn.slider', 'Slider-crank velocities', 'For a slider-crank, the slider moves at v = −rω sin θ (1 + r cos θ/√(l² − r² sin² θ)) and the rod turns at ω_rod = rω cos θ/(l cos φ), where sin φ = r sin θ/l.', t => {
    const r = t.pick([40, 50, 60, 75]), l = r * t.pick([3, 3.5, 4, 5]), N = t.pick([600, 1200, 1800, 3000]), deg = t.pick([30, 45, 60, 90, 120, 135, 150]), ask = t.pick(['v', 'w']);
    const w = N * 2 * Math.PI / 60, th = deg * Math.PI / 180, s = Math.sqrt(l * l - r * r * Math.sin(th) ** 2);
    const v = Math.abs(-r * w * Math.sin(th) * (1 + r * Math.cos(th) / s)) / 1000, phi = Math.asin(r * Math.sin(th) / l), wr = Math.abs(r * w * Math.cos(th) / (l * Math.cos(phi)));
    return num(`A slider-crank has a ${r} mm crank and a ${l} mm connecting rod, with the slider on a line through the crank pivot. The crank turns at a steady ${N} rpm. When the crank is ${deg}° from the slider's line (measured from the outer dead centre), what is ${ask === 'v' ? 'the slider\'s speed, in m/s' : 'the connecting rod\'s angular speed, in rad/s'}? (4 significant figures)`, r4(ask === 'v' ? v : wr),
      `ω = ${r4(w)} rad/s. Rod angle φ = asin(r sin θ/l) = ${r4(phi * 180 / Math.PI)}°. Slider speed = rω sin θ (1 + r cos θ/√(l² − r² sin² θ)) = ${r4(v)} m/s; rod speed = rω cos θ/(l cos φ) = ${r4(wr)} rad/s.`,
      `import math\n# differentiate the slider position and the rod angle along the motion (central differences in time)\nr, l, w, th0 = ${r} / 1000, ${l} / 1000, ${N} * 2 * math.pi / 60, math.radians(${deg})\nx = lambda t: r * math.cos(th0 + w * t) + math.sqrt(l * l - (r * math.sin(th0 + w * t)) ** 2)\nphi = lambda t: math.asin(r * math.sin(th0 + w * t) / l)\nh = 1e-6\nprint(${ask === 'v' ? 'abs(x(h) - x(-h)) / (2 * h)' : 'abs(phi(h) - phi(-h)) / (2 * h)'})`);
  }),

  SKILL('dyn.rod', 'A falling rod on a pivot', 'A uniform rod pinned at one end and released from horizontal has ω² = 3g sin θ/L and α = 3g cos θ/(2L); the pivot supplies the centre\'s acceleration and holds up the weight.', t => {
    const m = t.pick([2, 3, 5, 8, 10]), L = t.pick([0.5, 0.8, 1, 1.2, 1.5, 2]), deg = t.pick([15, 30, 45, 60, 75, 90]), ask = t.pick(['w', 'alpha', 'R']);
    const th = deg * Math.PI / 180, w2 = 3 * g * Math.sin(th) / L, al = 3 * g * Math.cos(th) / (2 * L);
    const Rn = m * w2 * L / 2 + m * g * Math.sin(th), Rt = m * g * Math.cos(th) - m * al * L / 2, R = Math.hypot(Rn, Rt);
    const what = { w: 'its angular speed, in rad/s', alpha: 'its angular acceleration, in rad/s²', R: 'the magnitude of the pivot force, in N' }[ask];
    return num(`A uniform ${m} kg rod, ${L} m long, is pinned at one end and released from rest horizontal. When it has swung ${deg}° below horizontal, what is ${what}? (4 significant figures)`, r4({ w: Math.sqrt(w2), alpha: al, R }[ask]),
      `Energy: ½(mL²/3)ω² = mg(L/2) sin θ, so ω = ${r4(Math.sqrt(w2))} rad/s. Moments about the pivot: (mL²/3)α = mg(L/2) cos θ, so α = ${r4(al)} rad/s². Along the rod the pivot supplies m(ω²L/2) + mg sin θ = ${r4(Rn)} N; across it mg cos θ − mαL/2 = ${r4(Rt)} N; |R| = ${r4(R)} N.`,
      `import math\n# integrate the swing (RK4) until the rod reaches the angle, then apply F = m a to the centre in x-y\nm, L, g, target = ${m}, ${L}, ${g}, math.radians(${deg})\nf = lambda th: 1.5 * g * math.cos(th) / L\nth, w, h = 0.0, 0.0, 1e-5\nwhile True:\n    k1t, k1w = w, f(th); k2t, k2w = w + h / 2 * k1w, f(th + h / 2 * k1t); k3t, k3w = w + h / 2 * k2w, f(th + h / 2 * k2t); k4t, k4w = w + h * k3w, f(th + h * k3t)\n    nth, nw = th + h / 6 * (k1t + 2 * k2t + 2 * k3t + k4t), w + h / 6 * (k1w + 2 * k2w + 2 * k3w + k4w)\n    if nth >= target:\n        s = (target - th) / (nth - th); w = w + s * (nw - w); th = target; break\n    th, w = nth, nw\nal = f(th)\n# centre at (L/2 cos th, -L/2 sin th): differentiate twice\nax = -L / 2 * (math.sin(th) * al + math.cos(th) * w * w); ay = -L / 2 * (math.cos(th) * al - math.sin(th) * w * w)\nRx, Ry = m * ax, m * ay + m * g\nprint(${{ w: 'w', alpha: 'al', R: 'math.hypot(Rx, Ry)' }[ask]})`);
  }),

  SKILL('dyn.hoist', 'A hoist drum: work and energy', 'A falling load turns a drum: m g h − T_f h/r = ½mv² + ½I(v/r)², so the drum\'s inertia acts like extra mass I/r².', t => {
    const m = t.pick([20, 50, 80, 100]), r = t.pick([0.1, 0.15, 0.2, 0.25]), I = t.pick([0.5, 1, 2, 4]), Tf = t.pick([0, 2, 5, 10]), h = t.pick([1, 2, 3, 5]), ask = t.pick(['v', 'T']);
    const a = (m * g - Tf / r) / (m + I / (r * r)), v = Math.sqrt(2 * a * h), T = m * (g - a);
    return num(`A ${m} kg load hangs from a cable wound on a drum of radius ${r} m and moment of inertia ${I} kg·m²${Tf ? `, whose bearing friction is a steady ${Tf} N·m` : ' turning freely'}. Released from rest, ${ask === 'v' ? `how fast is the load moving after it has fallen ${h} m, in m/s` : 'what is the cable tension while it falls, in N'}? (4 significant figures)`, r4(ask === 'v' ? v : T),
      `Energy: mgh − T_f·h/r = ½(m + I/r²)v², so v = ${r4(v)} m/s; equivalently a = (mg − T_f/r)/(m + I/r²) = ${r4(a)} m/s². Tension T = m(g − a) = ${r4(T)} N.`,
      `# integrate load and drum separately in time (RK4), coupled by the cable tension each step\nm, r, I, Tf, h, g = ${m}, ${r}, ${I}, ${Tf}, ${h}, ${g}\n# unknowns at any instant: a and T with m a = m g - T and I a / r = T r - Tf\ndef accel():\n    A = [[m, 1.0], [I / r, -r]]; b = [m * g, -Tf]\n    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]\n    return (b[0] * A[1][1] - A[0][1] * b[1]) / det, (A[0][0] * b[1] - b[0] * A[1][0]) / det\na, T = accel()\nx = v = 0.0; dt = 1e-4\nwhile x < h:\n    k1x, k1v = v, a; k2x = v + dt / 2 * k1v; k3x = v + dt / 2 * a; k4x = v + dt * a\n    nx = x + dt / 6 * (k1x + 2 * k2x + 2 * k3x + k4x); nv = v + dt * a\n    if nx >= h: v = v + (nv - v) * (h - x) / (nx - x); break\n    x, v = nx, nv\nprint(${ask === 'v' ? 'v' : 'T'})`);
  }),

  SKILL('vib.free', 'Free damped vibration', 'm ẍ + c ẋ + k x = 0 rings at ω_d = ω_n√(1 − ζ²), with ζ = c/(2√(km)); each cycle the amplitude shrinks by e^(−2πζ/√(1−ζ²)).', t => {
    const m = t.pick([1, 2, 5, 10, 20]), k = t.pick([500, 1000, 2000, 5000, 10000]), z = t.pick([0.02, 0.05, 0.1, 0.15, 0.2, 0.3]), c = Number((2 * z * Math.sqrt(k * m)).toPrecision(3));
    const wn = Math.sqrt(k / m), ze = c / (2 * Math.sqrt(k * m)), wd = wn * Math.sqrt(1 - ze * ze), n = t.pick([3, 5, 10]), ask = t.pick(['fd', 'decay', 'delta']);
    const delta = 2 * Math.PI * ze / Math.sqrt(1 - ze * ze), ans = { fd: wd / (2 * Math.PI), decay: Math.exp(-n * delta), delta }[ask];
    const what = { fd: 'its damped natural frequency, in Hz', decay: `the ratio of the ${n}th peak after release to the first (the release point)`, delta: 'its logarithmic decrement' }[ask];
    return num(`A ${m} kg mass on a ${k} N/m spring has a ${c} N·s/m damper. It is pulled aside and released. What is ${what}? (4 significant figures)`, r4(ans),
      `ω_n = √(k/m) = ${r4(wn)} rad/s, ζ = c/(2√(km)) = ${r4(ze)}, f_d = ω_n√(1 − ζ²)/2π = ${r4(wd / (2 * Math.PI))} Hz. δ = 2πζ/√(1 − ζ²) = ${r4(delta)}; after ${n} cycles the amplitude is e^(−${n}δ) = ${r4(Math.exp(-n * delta))} of the start.`,
      `import math\n# release from x = 1 at rest, integrate (RK4) and read the peaks\nm, k, c = ${m}, ${k}, ${c}\nf = lambda x, v: (v, -(c * v + k * x) / m)\nx, v, t = 1.0, 0.0, 0.0; dt = 2 * math.pi / math.sqrt(k / m) / 4000\npeaks = [(0.0, 1.0)]\nwhile len(peaks) < ${n + 1}:\n    a1 = f(x, v); a2 = f(x + dt / 2 * a1[0], v + dt / 2 * a1[1]); a3 = f(x + dt / 2 * a2[0], v + dt / 2 * a2[1]); a4 = f(x + dt * a3[0], v + dt * a3[1])\n    nx = x + dt / 6 * (a1[0] + 2 * a2[0] + 2 * a3[0] + a4[0]); nv = v + dt / 6 * (a1[1] + 2 * a2[1] + 2 * a3[1] + a4[1])\n    if v > 0 >= nv:  # a positive peak: place it where v crosses zero\n        s = v / (v - nv); peaks.append((t + s * dt, x + s * (nx - x)))\n    x, v, t = nx, nv, t + dt\nT = (peaks[-1][0] - peaks[1][0]) / (len(peaks) - 2) if len(peaks) > 2 else peaks[1][0]\nprint(${{ fd: '1 / T', decay: 'peaks[-1][1] / peaks[0][1]', delta: 'math.log(peaks[1][1] / peaks[2][1])' }[ask]})`);
  }),

  SKILL('vib.forced', 'Forced vibration and transmissibility', 'Driven at frequency ratio r = ω/ω_n, the steady amplitude is (F₀/k)/√((1 − r²)² + (2ζr)²); the force passed to the floor is that times k√(1 + (2ζr)²).', t => {
    const m = t.pick([5, 10, 20, 50]), k = t.pick([2e4, 5e4, 1e5, 2e5]), z = t.pick([0.05, 0.1, 0.2, 0.3]), F0 = t.pick([50, 100, 200, 500]), rr = t.pick([0.5, 0.8, 0.9, 1.2, 1.5, 2, 3]);
    const wn = Math.sqrt(k / m), w = rr * wn, f = Number((w / (2 * Math.PI)).toPrecision(3)), r = 2 * Math.PI * f / wn, c = 2 * z * Math.sqrt(k * m), ask = t.pick(['X', 'FT']);
    const X = F0 / k / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2), FT = X * Math.sqrt(k * k + (c * 2 * Math.PI * f) ** 2);
    return num(`A ${m} kg machine sits on mounts of total stiffness ${k} N/m and damping ratio ${z}. An unbalance drives it with a ${F0} N force at ${f} Hz. At steady state, what is ${ask === 'X' ? 'the vibration amplitude, in mm' : 'the amplitude of the force passed to the floor, in N'}? (4 significant figures)`, r4(ask === 'X' ? X * 1000 : FT),
      `ω_n = ${r4(wn)} rad/s, r = ω/ω_n = ${r4(r)}. X = (F₀/k)/√((1 − r²)² + (2ζr)²) = ${r4(X * 1000)} mm. Transmitted force = X√(k² + (cω)²) = ${r4(FT)} N (transmissibility ${r4(FT / F0)}).`,
      `import math\n# simulate from rest (RK4) until the transient has died away, then read the peaks of x and of k x + c v\nm, k, c, F0, w = ${m}, ${k}, ${c}, ${F0}, 2 * math.pi * ${f}\nwn = math.sqrt(k / m); zeta = c / (2 * math.sqrt(k * m))\nf = lambda t, x, v: (v, (F0 * math.sin(w * t) - c * v - k * x) / m)\ndt = 2 * math.pi / max(w, wn) / 400; Tend = 25 / (zeta * wn); Tper = 2 * math.pi / w\nx = v = t = 0.0; X = FT = 0.0\nwhile t < Tend + 3 * Tper:\n    a1 = f(t, x, v); a2 = f(t + dt / 2, x + dt / 2 * a1[0], v + dt / 2 * a1[1]); a3 = f(t + dt / 2, x + dt / 2 * a2[0], v + dt / 2 * a2[1]); a4 = f(t + dt, x + dt * a3[0], v + dt * a3[1])\n    x += dt / 6 * (a1[0] + 2 * a2[0] + 2 * a3[0] + a4[0]); v += dt / 6 * (a1[1] + 2 * a2[1] + 2 * a3[1] + a4[1]); t += dt\n    if t > Tend: X = max(X, abs(x)); FT = max(FT, abs(k * x + c * v))\nprint(${ask === 'X' ? 'X * 1000' : 'FT'})`);
  }),

  SKILL('vib.2dof', 'Two-degree-of-freedom modes', 'Two masses on springs have two natural frequencies, the roots of det(K − ω²M) = 0, each with its own mode shape.', t => {
    const m1 = t.pick([1, 2, 5]), m2 = t.pick([1, 2, 5]), k1 = t.pick([1000, 2000, 5000]), k2 = t.pick([500, 1000, 2000]), k3 = t.pick([0, 0, 1000, 2000]), ask = t.pick(['f1', 'f2', 'ratio']);
    const A = m1 * m2, B = -(m1 * (k2 + k3) + m2 * (k1 + k2)), C = (k1 + k2) * (k2 + k3) - k2 * k2, disc = Math.sqrt(B * B - 4 * A * C);
    const l1 = (-B - disc) / (2 * A), l2 = (-B + disc) / (2 * A), ratio = (k1 + k2 - l1 * m1) / k2;
    const what = { f1: 'the lower natural frequency, in Hz', f2: 'the higher natural frequency, in Hz', ratio: 'the lower mode\'s amplitude ratio x₂/x₁' }[ask];
    return num(`Mass m₁ = ${m1} kg is tied to a wall by k₁ = ${k1} N/m and to mass m₂ = ${m2} kg by k₂ = ${k2} N/m${k3 ? `; m₂ is tied to a second wall by k₃ = ${k3} N/m` : '; m₂ is otherwise free'}. Motion is along one line, undamped. What is ${what}? (4 significant figures)`, r4({ f1: Math.sqrt(l1) / (2 * Math.PI), f2: Math.sqrt(l2) / (2 * Math.PI), ratio }[ask]),
      `det(K − ω²M) = 0: ${A}λ² ${B < 0 ? '−' : '+'} ${Math.abs(B)}λ + ${C} = 0 gives λ = ω² = ${r4(l1)} and ${r4(l2)}, so f = ${r4(Math.sqrt(l1) / (2 * Math.PI))} and ${r4(Math.sqrt(l2) / (2 * Math.PI))} Hz. Lower mode: x₂/x₁ = (k₁ + k₂ − ω₁²m₁)/k₂ = ${r4(ratio)}.`,
      `import math\n# power iteration on M^-1 K for the highest mode, inverse iteration for the lowest\nm1, m2, k1, k2, k3 = ${m1}, ${m2}, ${k1}, ${k2}, ${k3}\nA = [[(k1 + k2) / m1, -k2 / m1], [-k2 / m2, (k2 + k3) / m2]]\nmul = lambda M, v: [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]\ndet = A[0][0] * A[1][1] - A[0][1] * A[1][0]\nAi = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]]\ndef iterate(M):\n    v = [1.0, 0.3]\n    for _ in range(5000):\n        w = mul(M, v); n = max(abs(w[0]), abs(w[1])); v = [w[0] / n, w[1] / n]\n    w = mul(M, v)\n    return (w[0] * v[0] + w[1] * v[1]) / (v[0] * v[0] + v[1] * v[1]), v\nhi, _ = iterate(A); lo_inv, vlo = iterate(Ai)\nprint(${{ f1: 'math.sqrt(1 / lo_inv) / (2 * math.pi)', f2: 'math.sqrt(hi) / (2 * math.pi)', ratio: 'vlo[1] / vlo[0]' }[ask]})`);
  }),
];
