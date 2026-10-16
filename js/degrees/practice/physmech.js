/**
 * Physics: mechanics and special relativity (8.012) — projectiles, inclines
 * with friction, collisions, rotation and rolling, oscillation, orbits, work,
 * Lorentz transformations and invariant mass. GRE Physics: Classical
 * Mechanics, Special Relativity.
 *
 * Checks simulate rather than reuse the formula: equations of motion
 * integrated numerically, collisions solved as a linear system, moments of
 * inertia summed over mass elements, periods timed from simulated motion,
 * boosts applied to four-vectors.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0.01, dp: 2, explain, python, ...extra });
const r2 = x => Math.round(x * 100) / 100;
const r4 = x => Math.round(x * 10000) / 10000;
const G = 9.8;

export const PHYSMECH = [
  SKILL('pm.projectile', 'Projectile motion', 'Horizontal and vertical motion are independent; with no drag the range is v² sin 2θ / g.', t => {
    const v = t.int(8, 30), th = t.pick([20, 30, 45, 55, 60, 70]), ask = t.pick(['range', 'height', 'time']);
    const r = (th * Math.PI) / 180, vx = v * Math.cos(r), vy = v * Math.sin(r);
    const T = (2 * vy) / G, R = vx * T, H = (vy * vy) / (2 * G), val = { range: R, height: H, time: T }[ask];
    return num(`A ball leaves level ground at ${v} m/s, ${th}° above horizontal (g = 9.8 m/s², no air resistance). What is its ${{ range: 'horizontal range (m)', height: 'maximum height (m)', time: 'time of flight (s)' }[ask]}? (2 decimal places)`, r2(val),
      `vₓ = ${r2(vx)}, v_y = ${r2(vy)} m/s. Time aloft 2v_y/g = ${r2(T)} s; range vₓT = ${r2(R)} m; peak v_y²/2g = ${r2(H)} m.`,
      `import math\nvx, vy = ${v} * math.cos(math.radians(${th})), ${v} * math.sin(math.radians(${th}))\nx = y = t = 0.0; h = 1e-5; top = 0.0\nwhile True:\n    xn, yn, vyn = x + vx * h, y + vy * h - 0.5 * 9.8 * h * h, vy - 9.8 * h\n    if yn < 0:\n        f = y / (y - yn); t += f * h; x += f * (xn - x); break\n    x, y, vy, t = xn, yn, vyn, t + h; top = max(top, y)\nprint(${ask === 'range' ? 'x' : ask === 'height' ? 'top' : 't'})`);
  }),

  SKILL('pm.incline', 'Inclines and friction', 'Along the slope: g sin θ pulls down, kinetic friction μ g cos θ resists.', t => {
    const th = t.pick([20, 25, 30, 35, 40]), mu = t.pick([0.1, 0.2, 0.3]), d = t.int(2, 10);
    const r = (th * Math.PI) / 180, a = G * (Math.sin(r) - mu * Math.cos(r)), v = Math.sqrt(2 * a * d);
    return num(`A block slides from rest down a ${th}° incline with kinetic friction coefficient ${mu} (g = 9.8 m/s²). What is its speed after ${d} m along the slope, in m/s? (2 decimal places)`, r2(v),
      `a = g(sin θ − μ cos θ) = ${r2(a)} m/s²; v = √(2ad) = ${r2(v)} m/s. Energy view: mgh lost = ½mv² + friction work μmg cos θ · d.`,
      `import math\n# forces as vectors: gravity, normal (cancels the perpendicular part), friction opposing motion\nth, mu = math.radians(${th}), ${mu}\ndown = (math.cos(th), -math.sin(th))  # unit vector down the slope\nnormal = (math.sin(th), math.cos(th))\ng = (0.0, -9.8)\nN = -(g[0] * normal[0] + g[1] * normal[1])\na_along = g[0] * down[0] + g[1] * down[1] - mu * N\ns = v = 0.0; h = 1e-5\nwhile s < ${d}: v += a_along * h; s += v * h\nprint(v)`);
  }),

  SKILL('pm.collision', 'Collisions', 'Momentum is conserved; the coefficient of restitution e sets how much relative speed survives.', t => {
    const m1 = t.int(1, 5), m2 = t.int(1, 5), v1 = t.int(2, 8), v2 = t.int(-4, 2), e = t.pick([0, 0.5, 1]), which = t.pick([1, 2]);
    const v1p = (m1 * v1 + m2 * v2 + m2 * e * (v2 - v1)) / (m1 + m2), v2p = (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) / (m1 + m2);
    const kind = e === 1 ? 'elastic' : e === 0 ? 'perfectly inelastic' : `partly elastic (e = ${e})`;
    return num(`A ${m1} kg cart at ${v1} m/s hits a ${m2} kg cart moving at ${v2} m/s along the same line. The collision is ${kind}. What is the ${which === 1 ? 'first' : 'second'} cart's velocity afterwards, in m/s? (2 decimal places)`, r2(which === 1 ? v1p : v2p),
      `Momentum: ${m1}·${v1} + ${m2}·${v2} = ${m1 * v1 + m2 * v2} kg·m/s before and after. Restitution: v₂′ − v₁′ = ${e}(v₁ − v₂). Solving: v₁′ = ${r2(v1p)}, v₂′ = ${r2(v2p)} m/s.`,
      `from fractions import Fraction as F\nm1, m2, v1, v2, e = ${m1}, ${m2}, ${v1}, ${v2}, F('${e}')\n# solve [m1 m2; -1 1] [v1' v2'] = [m1 v1 + m2 v2, e (v1 - v2)] by Cramer\na, b, c, d = m1, m2, -1, 1\nr1, r2 = m1 * v1 + m2 * v2, e * (v1 - v2)\ndet = a * d - b * c\nprint(float(${which === 1 ? '(r1 * d - b * r2) / det' : '(a * r2 - c * r1) / det'}))`);
  }),

  SKILL('pm.rolling', 'Rotation and rolling', 'A rolling body shares its energy between translation and rotation: v = √(2gh / (1 + I/mr²)).', t => {
    const shape = t.pick(['solid sphere', 'solid cylinder', 'hoop', 'hollow sphere']), h = t.pick([0.5, 1, 2, 3]);
    const k = { 'solid sphere': 2 / 5, 'solid cylinder': 1 / 2, hoop: 1, 'hollow sphere': 2 / 3 }[shape], v = Math.sqrt((2 * G * h) / (1 + k));
    return num(`A ${shape} rolls without slipping from rest down a ramp, dropping ${h} m in height (g = 9.8 m/s²). How fast is its centre moving at the bottom, in m/s? (2 decimal places)`, r2(v),
      `I = ${k === 1 ? '' : `${{ 0.4: '2/5', 0.5: '1/2', [2 / 3]: '2/3' }[k] || k}`}mr² for a ${shape}. mgh = ½mv² + ½Iω² with ω = v/r gives v = √(2gh/(1 + ${r4(k)})) = ${r2(v)} m/s.`,
      `import math\n# moment of inertia by summing mass elements of a unit-radius, unit-mass body\nshape = ${JSON.stringify(shape)}\nN = 200\nif shape == 'hoop': k = 1.0\nelif shape == 'solid cylinder':\n    k = sum(((i + .5) / N) ** 2 * 2 * ((i + .5) / N) / N for i in range(N))  # rings of mass 2r dr\nelif shape == 'solid sphere':\n    # shells: mass of shell at r is 3 r^2 dr; each shell contributes (2/3) m r^2 about an axis\n    k = sum(3 * ((i + .5) / N) ** 2 / N * (2 / 3) * ((i + .5) / N) ** 2 for i in range(N))\nelse:\n    # thin shell: average of x^2 + y^2 over the sphere surface, sampled\n    import random\n    random.seed(1); s = 0.0; M = 200000\n    for _ in range(M):\n        u, ph = random.uniform(-1, 1), random.uniform(0, 2 * math.pi)\n        s += 1 - u * u\n    k = s / M\nprint(math.sqrt(2 * 9.8 * ${h} / (1 + k)))`, { tol: 0.02 });
  }),

  SKILL('pm.oscillator', 'Simple harmonic motion', 'A mass on a spring has period 2π√(m/k), independent of amplitude.', t => {
    const m = t.pick([0.2, 0.5, 1, 2]), k = t.pick([5, 10, 20, 50, 100]), ask = t.pick(['period', 'vmax']), A = t.pick([0.05, 0.1, 0.2]);
    const T = 2 * Math.PI * Math.sqrt(m / k), vmax = A * Math.sqrt(k / m);
    return num(`A ${m} kg mass on a spring of stiffness ${k} N/m oscillates with amplitude ${A} m. What is its ${ask === 'period' ? 'period, in seconds' : 'maximum speed, in m/s'}? (${ask === 'period' ? 2 : 3} decimal places)`, ask === 'period' ? r2(T) : Math.round(vmax * 1000) / 1000,
      `ω = √(k/m) = ${r4(Math.sqrt(k / m))} rad/s. Period 2π/ω = ${r4(T)} s; maximum speed Aω = ${r4(vmax)} m/s.`,
      `m, k, A = ${m}, ${k}, ${A}\nx, v, t, h = A, 0.0, 0.0, 1e-5\ncross, vmax = [], 0.0\nwhile len(cross) < 3:\n    a = -k / m * x\n    v += a * h; xn = x + v * h; t += h\n    vmax = max(vmax, abs(v))\n    if x > 0 >= xn: cross.append(t)\n    x = xn\nprint(${ask === 'period' ? '(cross[2] - cross[0]) / 2' : 'vmax'})`, ask === 'period' ? {} : { tol: 0.002, dp: 3 });
  }),

  SKILL('pm.orbit', 'Orbits', 'For a circular orbit, gravity supplies the centripetal force: v = √(GM/r), T² ∝ r³.', t => {
    const GM = 3.986e14, alt = t.pick([400, 800, 2000, 20200, 35786]), r = 6.371e6 + alt * 1000, ask = t.pick(['period', 'speed']);
    const v = Math.sqrt(GM / r), T = (2 * Math.PI * r) / v;
    return num(`A satellite circles Earth (GM = 3.986×10¹⁴ m³/s², radius 6371 km) at an altitude of ${alt} km. What is its ${ask === 'period' ? 'orbital period, in minutes' : 'orbital speed, in km/s'}? (2 decimal places)`, r2(ask === 'period' ? T / 60 : v / 1000),
      `r = ${r2(r / 1000)} km; v = √(GM/r) = ${r2(v / 1000)} km/s; T = 2πr/v = ${r2(T / 60)} min.${alt === 35786 ? ' One sidereal day: geostationary.' : ''}`,
      `import math\nGM, r = 3.986e14, ${r}\n# integrate the orbit with velocity Verlet and time one revolution\nv0 = math.sqrt(GM / r)\nx, y, vx, vy, t, h = r, 0.0, 0.0, v0, 0.0, 1.0\nax, ay = -GM * x / r ** 3, -GM * y / r ** 3\nprev = y\nwhile True:\n    x += vx * h + .5 * ax * h * h; y += vy * h + .5 * ay * h * h\n    d = math.hypot(x, y); nax, nay = -GM * x / d ** 3, -GM * y / d ** 3\n    vx += .5 * (ax + nax) * h; vy += .5 * (ay + nay) * h; ax, ay = nax, nay; t += h\n    if prev < 0 <= y: break\n    prev = y\n${ask === 'period' ? 'print(t / 60)' : 'print(2 * math.pi * r / t / 1000)'}`, { tol: 0.02 });
  }),

  SKILL('pm.work', 'Work by a varying force', 'W = ∫ F dx — the area under the force–position curve.', t => {
    const k = t.int(10, 200), n = t.pick([1, 2, 3]), a = t.pick([0, 0.1, 0.2]), b = a + t.pick([0.1, 0.2, 0.3, 0.5]);
    const W = (k * (b ** (n + 1) - a ** (n + 1))) / (n + 1);
    return num(`A force F(x) = ${k}·x${n > 1 ? `^${n}` : ''} N acts along x. How much work does it do as the object moves from x = ${a} m to x = ${b} m, in joules? (4 decimal places)`, r4(W),
      `W = ∫ ${k}x${n > 1 ? `^${n}` : ''} dx = ${k}/${n + 1}·(b^${n + 1} − a^${n + 1}) = ${r4(W)} J.${n === 1 ? ' For a spring this is the change in ½kx².' : ''}`,
      `N = 200000\nh = (${b} - ${a}) / N\nprint(sum(${k} * (${a} + (i + .5) * h) ** ${n} for i in range(N)) * h)`, { tol: 0.0002, dp: 4 });
  }),

  SKILL('pm.lorentz', 'Time dilation and length contraction', 'γ = 1/√(1 − v²/c²): moving clocks run slow and moving rods are short.', t => {
    const beta = t.pick([0.6, 0.8, 0.9, 0.95, 0.99]), ask = t.pick(['time', 'length', 'addvel']), t0 = t.int(1, 10), L0 = t.int(10, 100);
    const g = 1 / Math.sqrt(1 - beta * beta);
    if (ask === 'addvel') { const u = t.pick([0.5, 0.6, 0.8]), w = (u + beta) / (1 + u * beta);
      return num(`A ship moving at ${beta}c fires a probe forward at ${u}c relative to the ship. What is the probe's speed relative to the ground, as a fraction of c? (4 decimal places)`, r4(w),
        `Relativistic addition: (u + v)/(1 + uv/c²) = (${u} + ${beta})/(1 + ${u}·${beta}) = ${r4(w)}c — never more than c.`,
        `import math\n# add rapidities: speeds add as tanh of the sum of artanh\nprint(math.tanh(math.atanh(${u}) + math.atanh(${beta})))`, { tol: 0.0001, dp: 4 }); }
    const val = ask === 'time' ? g * t0 : L0 / g;
    return num(ask === 'time' ? `A clock moving at ${beta}c ticks off ${t0} s in its own frame. How much time passes in the lab frame, in seconds? (2 decimal places)` : `A rod of rest length ${L0} m moves along its length at ${beta}c. What length does the lab measure, in metres? (2 decimal places)`, r2(val),
      `γ = ${r4(g)}. ${ask === 'time' ? `Δt = γΔτ = ${r2(val)} s.` : `L = L₀/γ = ${r2(val)} m.`}`,
      `import math\nb = ${beta}; g = 1 / math.sqrt(1 - b * b)\nboost = lambda t, x: (g * (t - b * x), g * (x - b * t))  # c = 1\n${ask === 'time' ? `# the clock's ticks at x' = 0, t' = 0 and t' = tau; transform back to the lab with the inverse boost\ninv = lambda t, x: (g * (t + b * x), g * (x + b * t))\nprint(inv(${t0}, 0)[0] - inv(0, 0)[0])` : `# the far end's worldline is x' = L0 in the rod frame; find the event on it at lab time t = 0\ninv = lambda tp, xp: (g * (tp + b * xp), g * (xp + b * tp))\nlo, hi = -1e3, 1e3\nfor _ in range(200):\n    m = (lo + hi) / 2\n    if inv(m, ${L0})[0] > 0: hi = m\n    else: lo = m\n# the near end passes x = 0 at t = 0, so the lab length is the far end's lab position then\nprint(inv(lo, ${L0})[1] - inv(0, 0)[1])`}`);
  }),

  SKILL('pm.invariant', 'Four-momentum and invariant mass', 'E² − (pc)² = (mc²)² is the same in every frame; for a system it gives the mass available to make new particles.', t => {
    const m1 = t.pick([0.511, 105.7, 938.3, 139.6]), m2 = t.pick([0.511, 105.7, 938.3, 139.6]), p1 = t.int(100, 2000), p2 = t.int(-1500, 1500);
    const E1 = Math.hypot(m1, p1), E2 = Math.hypot(m2, p2), M = Math.sqrt((E1 + E2) ** 2 - (p1 + p2) ** 2);
    return num(`Two particles move along a line: masses ${m1} and ${m2} MeV/c², momenta ${p1} and ${p2} MeV/c. What is the system's invariant mass, in MeV/c²? (2 decimal places)`, r2(M),
      `E₁ = √(m₁² + p₁²) = ${r2(E1)} MeV, E₂ = ${r2(E2)} MeV. M² = (E₁ + E₂)² − (p₁ + p₂)²: M = ${r2(M)} MeV/c².`,
      `import math\nE = [math.hypot(${m1}, ${p1}), math.hypot(${m2}, ${p2})]; P = [${p1}, ${p2}]\n# boost to the frame where the total momentum vanishes; the total energy there is the invariant mass\nb = sum(P) / sum(E); g = 1 / math.sqrt(1 - b * b)\nprint(sum(g * (e - b * p) for e, p in zip(E, P)))`, { tol: 0.02 });
  }),
];
