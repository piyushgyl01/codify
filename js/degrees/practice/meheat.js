/**
 * Mechanical Engineering: heat and mass transfer (Lienhard and Lienhard, A
 * Heat Transfer Textbook; MIT Unified notes; FE Mechanical topic 12).
 *
 * Checks take another route: walls and fins solved as finite-difference
 * networks, insulation resistance integrated radially, cooling and pipe flow
 * marched in time or along the pipe (RK4), slab transients by finite
 * differences with a convective boundary instead of the eigenfunction series,
 * radiation through a radiosity network solved as linear equations, heat
 * exchangers marched along their length, and mass transfer from the
 * Sherwood–Nusselt analogy instead of the Lewis-number form.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const SIGMA = 5.670374e-8;

export const MEHEAT = [
  SKILL('ht.wall', 'Composite walls and thermal resistance', 'Heat flows through layers in series like current through resistors: q = ΔT/ΣR, with R = L/kA for each layer and 1/hA for each surface film.', t => {
    const n = t.int(2, 3), mats = [['brick', 0.7], ['insulation', 0.04], ['concrete', 1.4], ['plaster', 0.5], ['wood', 0.12], ['steel', 45]];
    const layers = Array.from({ length: n }, () => { const [m, k] = t.pick(mats); return [m, k, t.pick([10, 20, 50, 100, 150]) / 1000]; });
    const hi = t.pick([5, 8, 10]), ho = t.pick([15, 25, 40]), Ti = t.pick([20, 22, 25]), To = t.pick([-15, -5, 0, 5]), ask = t.pick(['q', 'Tsurf']);
    const R = 1 / hi + layers.reduce((s, [, k, L]) => s + L / k, 0) + 1 / ho, q = (Ti - To) / R, Ts = Ti - q / hi;
    return num(`A wall is built, inside to outside, of ${layers.map(([m, k, L]) => `${L * 1000} mm of ${m} (k = ${k} W/m·K)`).join(', ')}. Inside air is at ${Ti} °C (h = ${hi} W/m²K) and outside air at ${To} °C (h = ${ho} W/m²K). What is ${ask === 'q' ? 'the heat loss per square metre, in W/m²' : 'the inside surface temperature, in °C'}? (4 significant figures)`, r4(ask === 'q' ? q : Ts),
      `R = 1/h_i + ΣL/k + 1/h_o = ${r4(R)} m²K/W, so q = ΔT/R = ${r4(q)} W/m². Inside surface: T_i − q/h_i = ${r4(Ts)} °C.`,
      `# finite-difference conduction through the layers, with convective boundaries, solved as a tridiagonal system\nlayers, hi, ho, Ti, To = ${JSON.stringify(layers.map(([, k, L]) => [k, L]))}, ${hi}, ${ho}, ${Ti}, ${To}\nnodes = []  # (k to the right, dx to the right)\nfor k, L in layers:\n    for _ in range(200): nodes.append((k, L / 200))\nN = len(nodes) + 1\na = [0.0] * N; b = [0.0] * N; c = [0.0] * N; d = [0.0] * N\nfor i in range(N):\n    gl = nodes[i - 1][0] / nodes[i - 1][1] if i > 0 else hi\n    gr = nodes[i][0] / nodes[i][1] if i < N - 1 else ho\n    b[i] = -(gl + gr)\n    if i > 0: a[i] = gl\n    else: d[i] -= gl * Ti\n    if i < N - 1: c[i] = gr\n    else: d[i] -= gr * To\nfor i in range(1, N):\n    m = a[i] / b[i - 1]; b[i] -= m * c[i - 1]; d[i] -= m * d[i - 1]\nT = [0.0] * N; T[-1] = d[-1] / b[-1]\nfor i in range(N - 2, -1, -1): T[i] = (d[i] - c[i] * T[i + 1]) / b[i]\nprint(${ask === 'q' ? 'hi * (Ti - T[0])' : 'T[0]'})`);
  }),

  SKILL('ht.cylinder', 'Insulated pipes and the critical radius', 'A cylindrical layer has resistance ln(r₂/r₁)/(2πkL). Insulation on a thin wire can increase heat loss until the outer radius passes the critical radius k/h.', t => {
    const ri = t.pick([10, 15, 25, 40]) / 1000, tp = t.pick([2, 3, 5]) / 1000, kp = t.pick([15, 45]), ti = t.pick([10, 20, 30, 50]) / 1000, ki = t.pick([0.035, 0.04, 0.05, 0.08]);
    const hin = t.pick([500, 1000, 2000]), ho = t.pick([5, 10, 20]), Tin = t.pick([80, 120, 150, 200]), Tout = t.pick([15, 20, 25]), ask = t.pick(['q', 'rc']);
    const r1 = ri, r2 = ri + tp, r3 = r2 + ti, R = 1 / (hin * 2 * Math.PI * r1) + Math.log(r2 / r1) / (2 * Math.PI * kp) + Math.log(r3 / r2) / (2 * Math.PI * ki) + 1 / (ho * 2 * Math.PI * r3), q = (Tin - Tout) / R;
    if (ask === 'rc') return num(`Insulation with k = ${ki} W/m·K is wrapped around a thin wire in air with h = ${ho} W/m²K. Above what outer radius does adding more insulation reduce the heat loss, in mm? (4 significant figures)`, r4(ki / ho * 1000),
      `The total resistance ln(r/r₁)/(2πk) + 1/(2πrh) is smallest at r_c = k/h = ${r4(ki / ho * 1000)} mm; beyond it, more insulation reduces heat loss.`,
      `import math\n# minimise the resistance per metre over the outer radius by golden-section search\nk, h, r1 = ${ki}, ${ho}, 1e-4\nR = lambda r: math.log(r / r1) / (2 * math.pi * k) + 1 / (2 * math.pi * r * h)\nlo, hi, g = r1, 1.0, (5 ** 0.5 - 1) / 2\nfor _ in range(200):\n    a, b = hi - g * (hi - lo), lo + g * (hi - lo)\n    lo, hi = (lo, b) if R(a) < R(b) else (a, hi)\nprint((lo + hi) / 2 * 1000)`);
    return num(`A steel pipe (inside radius ${ri * 1000} mm, wall ${tp * 1000} mm, k = ${kp} W/m·K) carries fluid at ${Tin} °C (inside h = ${hin} W/m²K). It has ${ti * 1000} mm of insulation (k = ${ki} W/m·K) and loses heat to air at ${Tout} °C (h = ${ho} W/m²K). What is the heat loss per metre of pipe, in W/m? (4 significant figures)`, r4(q),
      `Resistances per metre: inside film 1/(h·2πr₁), pipe ln(r₂/r₁)/(2πk), insulation ln(r₃/r₂)/(2πk), outside film 1/(h·2πr₃); total ${r4(R)} K·m/W, so q′ = ΔT/R = ${r4(q)} W/m.`,
      `import math\n# integrate each layer's radial resistance dr/(2 pi k r) numerically, plus the two films\nr1, r2, r3, kp, ki, hin, ho, Tin, Tout = ${r1}, ${r2}, ${r3}, ${kp}, ${ki}, ${hin}, ${ho}, ${Tin}, ${Tout}\ndef radial(a, b, k, n=100000):\n    h = (b - a) / n\n    return sum(h / (2 * math.pi * k * (a + (i + 0.5) * h)) for i in range(n))\nR = 1 / (hin * 2 * math.pi * r1) + radial(r1, r2, kp) + radial(r2, r3, ki) + 1 / (ho * 2 * math.pi * r3)\nprint((Tin - Tout) / R)`);
  }),

  SKILL('ht.fin', 'Fins', 'A fin\'s temperature excess obeys θ″ = m²θ with m = √(hP/kA); with an insulated tip it sheds q = √(hPkA)·θ_b·tanh(mL), and its efficiency is tanh(mL)/(mL).', t => {
    const [mat, k] = t.pick([['aluminium', 205], ['copper', 385], ['steel', 45], ['stainless steel', 15]]), D = t.pick([3, 5, 8, 10]) / 1000, L = t.pick([20, 40, 60, 100]) / 1000, h = t.pick([10, 25, 50, 100]), Tb = t.pick([60, 80, 100]), Tinf = 25, ask = t.pick(['q', 'eta', 'Ttip']);
    const P = Math.PI * D, A = Math.PI * D * D / 4, m = Math.sqrt(h * P / (k * A)), th = Tb - Tinf, q = Math.sqrt(h * P * k * A) * th * Math.tanh(m * L), eta = Math.tanh(m * L) / (m * L), Ttip = Tinf + th / Math.cosh(m * L);
    const what = { q: 'the heat it sheds, in W', eta: 'its fin efficiency', Ttip: 'its tip temperature, in °C' }[ask];
    return num(`A ${mat} pin fin (k = ${k} W/m·K), ${D * 1000} mm in diameter and ${L * 1000} mm long, has its base at ${Tb} °C in air at ${Tinf} °C with h = ${h} W/m²K. Treating the tip as insulated, what is ${what}? (4 significant figures)`, r4({ q, eta, Ttip }[ask]),
      `m = √(hP/kA) = ${r4(m)} m⁻¹, mL = ${r4(m * L)}. q = √(hPkA)·θ_b·tanh(mL) = ${r4(q)} W; η = tanh(mL)/(mL) = ${r4(eta)}; T_tip = T∞ + θ_b/cosh(mL) = ${r4(Ttip)} °C.`,
      `import math\n# finite differences along the fin (tridiagonal), then add up the convection from its surface\nk, D, L, h, Tb, Tinf = ${k}, ${D}, ${L}, ${h}, ${Tb}, ${Tinf}\nP, A = math.pi * D, math.pi * D * D / 4\nN = 4000; dx = L / N; m2 = h * P / (k * A)\n# nodes 1..N (node 0 is the base); interior: th[i-1] - (2 + m2 dx^2) th[i] + th[i+1] = 0; tip: insulated (ghost node mirrors)\na = [1.0] * (N + 1); b = [-(2 + m2 * dx * dx)] * (N + 1); c = [1.0] * (N + 1); d = [0.0] * (N + 1)\nc[N] = 0.0; a[N] = 2.0; d[1] -= (Tb - Tinf); a[1] = 0.0\nfor i in range(2, N + 1):\n    f = a[i] / b[i - 1]; b[i] -= f * c[i - 1]; d[i] -= f * d[i - 1]\nth = [0.0] * (N + 1); th[N] = d[N] / b[N]\nfor i in range(N - 1, 0, -1): th[i] = (d[i] - c[i] * th[i + 1]) / b[i]\nth[0] = Tb - Tinf\nq = h * P * dx * (sum(th[1:N]) + (th[0] + th[N]) / 2)\nprint(${{ q: 'q', eta: 'q / (h * P * L * (Tb - Tinf))', Ttip: 'Tinf + th[N]' }[ask]})`);
  }),

  SKILL('ht.lumped', 'Lumped-capacitance cooling', 'If Bi = hL_c/k < 0.1 the body stays nearly uniform and cools exponentially: (T − T∞)/(Tᵢ − T∞) = e^(−t/τ), with τ = ρcV/(hA).', t => {
    const [mat, rho, c, k] = t.pick([['aluminium', 2700, 900, 205], ['copper', 8930, 385, 385], ['steel', 7850, 470, 45]]), D = t.pick([5, 10, 20, 30]) / 1000, h = t.pick([10, 25, 50, 100, 200]);
    const Ti = t.pick([150, 200, 300, 400]), Tinf = t.pick([20, 25, 30]), T = Number((Tinf + (Ti - Tinf) * t.pick([0.1, 0.2, 0.3, 0.5])).toFixed(0)), ask = t.pick(['time', 'Bi']);
    const V = Math.PI * D ** 3 / 6, A = Math.PI * D * D, tau = rho * c * V / (h * A), time = tau * Math.log((Ti - Tinf) / (T - Tinf)), Bi = h * (V / A) / k;
    return num(`A ${D * 1000} mm ${mat} sphere (ρ = ${rho} kg/m³, c = ${c} J/kg·K, k = ${k} W/m·K) at ${Ti} °C is cooled in air at ${Tinf} °C with h = ${h} W/m²K. ${ask === 'time' ? `How long until it reaches ${T} °C, in seconds?` : 'What is its Biot number based on V/A?'} (4 significant figures)`, r4(ask === 'time' ? time : Bi),
      `V/A = D/6 = ${r4(V / A * 1000)} mm; Bi = h(V/A)/k = ${r4(Bi)} (< 0.1, so lumped). τ = ρcV/(hA) = ${r4(tau)} s; t = τ ln((Tᵢ − T∞)/(T − T∞)) = ${r4(time)} s.`,
      ask === 'time'
        ? `import math\n# march the energy balance rho c V dT/dt = -h A (T - Tinf) in time (RK4)\nrho, c, D, h, Ti, Tinf, Tend = ${rho}, ${c}, ${D}, ${h}, ${Ti}, ${Tinf}, ${T}\nV, A = math.pi * D ** 3 / 6, math.pi * D * D\nf = lambda T: -h * A * (T - Tinf) / (rho * c * V)\nT, t, dt = Ti, 0.0, 0.01\nwhile True:\n    k1 = f(T); k2 = f(T + dt / 2 * k1); k3 = f(T + dt / 2 * k2); k4 = f(T + dt * k3)\n    nT = T + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)\n    if nT <= Tend: t += dt * (T - Tend) / (T - nT); break\n    T, t = nT, t + dt\nprint(t)`
        : `import math\n# volume and area of the sphere by integrating slices\nD, h, k = ${D}, ${h}, ${k}\nR = D / 2; n = 200000; dz = D / n\nV = sum(math.pi * (R * R - (-R + (i + 0.5) * dz) ** 2) * dz for i in range(n))\nA = 2 * math.pi * R * D  # each slice of a sphere has the same band area, 2 pi R dz\nprint(h * (V / A) / k)`);
  }),

  SKILL('ht.slab', 'Transient conduction in a slab', 'When the Biot number is not small, the slab\'s centre lags its surface: θ/θᵢ = Σ Cₙ e^(−ζₙ²Fo) cos(ζₙx/L), with ζₙ tan ζₙ = Bi.', t => {
    const [mat, k, alpha] = t.pick([['steel', 45, 1.2e-5], ['concrete', 1.4, 6.9e-7], ['stainless steel', 15, 4e-6], ['aluminium', 205, 8.4e-5]]), L = t.pick([10, 20, 30, 50]) / 1000, h = t.pick([50, 100, 200, 500, 1000]);
    const Bi = h * L / k, Ti = t.pick([20, 25]), Tinf = t.pick([300, 500, 800]), Fo = t.pick([0.2, 0.3, 0.5, 0.8, 1.2]), time = Fo * L * L / alpha;
    const zetas = []; for (let n = 0; n < 40; n++) { let lo = n * Math.PI + 1e-12, hi = n * Math.PI + Math.PI / 2 - 1e-12; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (m * Math.tan(m) < Bi) lo = m; else hi = m; } zetas.push(lo); }
    const theta = zetas.reduce((s, z) => s + 4 * Math.sin(z) / (2 * z + Math.sin(2 * z)) * Math.exp(-z * z * Fo), 0), Tc = Tinf + (Ti - Tinf) * theta;
    return num(`A ${2 * L * 1000} mm thick ${mat} plate (k = ${k} W/m·K, α = ${alpha} m²/s) at ${Ti} °C is plunged into a furnace at ${Tinf} °C, heated on both faces with h = ${h} W/m²K. What is its centre temperature after ${r4(time)} s, in °C? (4 significant figures)`, r4(Tc),
      `Half-thickness L = ${L * 1000} mm: Bi = hL/k = ${r4(Bi)}, Fo = αt/L² = ${Fo}. The series with ζ₁ = ${r4(zetas[0])} (ζ tan ζ = Bi) gives θ_centre/θᵢ = ${r4(theta)}, so T = ${r4(Tc)} °C.`,
      `# finite differences across the half-slab: symmetry at the centre, convection at the surface (implicit Crank-Nicolson)\nk, alpha, L, h, Ti, Tinf, tend = ${k}, ${alpha}, ${L}, ${h}, ${Ti}, ${Tinf}, ${time}\nN = 100; dx = L / N; steps = 4000; dt = tend / steps; r = alpha * dt / (dx * dx); Bi = h * dx / k\nT = [Ti] * (N + 1)\ndef solve(a, b, c, d):\n    n = len(d); b = b[:]; d = d[:]\n    for i in range(1, n):\n        m = a[i] / b[i - 1]; b[i] -= m * c[i - 1]; d[i] -= m * d[i - 1]\n    x = [0.0] * n; x[-1] = d[-1] / b[-1]\n    for i in range(n - 2, -1, -1): x[i] = (d[i] - c[i] * x[i + 1]) / b[i]\n    return x\n# node 0 is the centre (mirror), node N the surface (ghost node from the convective condition)\na = [-r / 2] * (N + 1); b = [1 + r] * (N + 1); c = [-r / 2] * (N + 1)\nc[0] = -r; a[N] = -r; b[N] = 1 + r + r * Bi\nfor _ in range(steps):\n    d = [0.0] * (N + 1)\n    d[0] = (1 - r) * T[0] + r * T[1]\n    for i in range(1, N): d[i] = r / 2 * T[i - 1] + (1 - r) * T[i] + r / 2 * T[i + 1]\n    d[N] = r * T[N - 1] + (1 - r - r * Bi) * T[N] + 2 * r * Bi * Tinf\n    T = solve(a, b, c, d)\nprint(T[0])`);
  }),

  SKILL('ht.pipeflow', 'Heating fluid in a pipe', 'With a constant wall temperature, the bulk temperature approaches the wall exponentially along the pipe: T_s − T_out = (T_s − T_in)·e^(−hPL/ṁc_p); turbulent h comes from Dittus–Boelter, Nu = 0.023Re^0.8Pr^0.4.', t => {
    const D = t.pick([10, 15, 20, 25]) / 1000, L = t.pick([2, 3, 5, 8]), mdot = t.pick([0.05, 0.1, 0.2, 0.3]), Tin = t.pick([15, 20]), Ts = t.pick([60, 80, 100]);
    const mu = 6.5e-4, k = 0.63, cp = 4180, Pr = mu * cp / k, Re = 4 * mdot / (Math.PI * D * mu), Nu = 0.023 * Re ** 0.8 * Pr ** 0.4, h = Nu * k / D;
    const Tout = Ts - (Ts - Tin) * Math.exp(-h * Math.PI * D * L / (mdot * cp)), ask = t.pick(['Tout', 'h']);
    return num(`Water (μ = 6.5 × 10⁻⁴ Pa·s, k = 0.63 W/m·K, c_p = 4180 J/kg·K) flows at ${mdot} kg/s through a ${D * 1000} mm pipe ${L} m long whose wall is held at ${Ts} °C. It enters at ${Tin} °C. Using Dittus–Boelter for h, what is ${ask === 'h' ? 'the heat-transfer coefficient, in W/m²K' : 'the outlet temperature, in °C'}? (4 significant figures)`, r4(ask === 'h' ? h : Tout),
      `Re = 4ṁ/(πDμ) = ${r4(Re)} (turbulent), Pr = ${r4(Pr)}, Nu = 0.023Re^0.8Pr^0.4 = ${r4(Nu)}, h = Nu·k/D = ${r4(h)} W/m²K. T_out = T_s − (T_s − T_in)e^(−hπDL/ṁc_p) = ${r4(Tout)} °C.`,
      `import math\n# h from the Reynolds and Prandtl numbers, then march the bulk temperature along the pipe (RK4)\nD, L, mdot, Tin, Ts = ${D}, ${L}, ${mdot}, ${Tin}, ${Ts}\nmu, k, cp = 6.5e-4, 0.63, 4180\nV = mdot / (1000 * math.pi * D * D / 4); Re = 1000 * V * D / mu; Pr = mu * cp / k\nh = 0.023 * Re ** 0.8 * Pr ** 0.4 * k / D\nf = lambda T: h * math.pi * D * (Ts - T) / (mdot * cp)\nT, n = Tin, 10000; dx = L / n\nfor _ in range(n):\n    k1 = f(T); k2 = f(T + dx / 2 * k1); k3 = f(T + dx / 2 * k2); k4 = f(T + dx * k3)\n    T += dx / 6 * (k1 + 2 * k2 + 2 * k3 + k4)\nprint(${ask === 'h' ? 'h' : 'T'})`);
  }),

  SKILL('ht.radiation', 'Radiation between gray surfaces', 'Between large parallel gray plates, q = σ(T₁⁴ − T₂⁴)/(1/ε₁ + 1/ε₂ − 1). A thin shield between them adds two more surface resistances and cuts the exchange.', t => {
    const T1 = t.pick([400, 500, 600, 800]), T2 = t.pick([300, 320, 350]), e1 = t.pick([0.2, 0.5, 0.8, 0.9]), e2 = t.pick([0.3, 0.6, 0.85]), shield = t.rng() < 0.5, es = t.pick([0.05, 0.1, 0.2]);
    const Rp = 1 / e1 + 1 / e2 - 1, q = shield ? SIGMA * (T1 ** 4 - T2 ** 4) / (Rp + 2 / es - 1) : SIGMA * (T1 ** 4 - T2 ** 4) / Rp;
    return num(`Two large parallel plates face each other: one at ${T1} K (ε = ${e1}), the other at ${T2} K (ε = ${e2})${shield ? `, with a thin radiation shield (ε = ${es} on both faces) between them` : ''}. What is the net radiative exchange, in W/m²? (σ = 5.670 × 10⁻⁸ W/m²K⁴; 4 significant figures)`, r4(q),
      `Resistances per unit area: 1/ε₁ + 1/ε₂ − 1 = ${r4(Rp)}${shield ? `, plus 2/ε_s − 1 = ${r4(2 / es - 1)} for the shield` : ''}. q = σ(T₁⁴ − T₂⁴)/ΣR = ${r4(q)} W/m².`,
      `# radiosity network: unknown radiosities (and shield temperature), solved as linear equations\nsig, T1, T2, e1, e2 = 5.670374e-8, ${T1}, ${T2}, ${e1}, ${e2}\nEb1, Eb2 = sig * T1 ** 4, sig * T2 ** 4\nshield, es = ${shield ? 'True' : 'False'}, ${es}\ndef gauss(M):\n    n = len(M)\n    for c in range(n):\n        p = max(range(c, n), key=lambda r: abs(M[r][c])); M[c], M[p] = M[p], M[c]\n        for r in range(n):\n            if r != c: f = M[r][c] / M[c][c]; M[r] = [u - f * v for u, v in zip(M[r], M[c])]\n    return [M[i][n] / M[i][i] for i in range(n)]\nif not shield:\n    # surface nodes: (Eb - J) e/(1 - e) = (J - J_other) (view factor 1)\n    g1, g2 = e1 / (1 - e1), e2 / (1 - e2)\n    J1, J2 = gauss([[g1 + 1, -1, g1 * Eb1], [-1, g2 + 1, g2 * Eb2]])\n    print(J1 - J2)\nelse:\n    # unknowns J1, Js1, Js2, J2, Ebs; the shield passes its net heat straight through\n    g1, g2, gs = e1 / (1 - e1), e2 / (1 - e2), es / (1 - es)\n    M = [[g1 + 1, -1, 0, 0, 0, g1 * Eb1],\n         [-1, 1 + gs, 0, 0, -gs, 0],\n         [0, 0, 1 + gs, -1, -gs, 0],\n         [0, 0, -1, g2 + 1, 0, g2 * Eb2],\n         [0, -gs, -gs, 0, 2 * gs, 0]]\n    J1, Js1, Js2, J2, Ebs = gauss(M)\n    print(J1 - Js1)`);
  }),

  SKILL('ht.hx', 'Heat exchangers: effectiveness–NTU', 'NTU = UA/C_min sets how close a heat exchanger gets to the ideal: for counterflow ε = (1 − e^(−NTU(1−C_r)))/(1 − C_r e^(−NTU(1−C_r))), and q = εC_min(T_h,in − T_c,in).', t => {
    const mh = t.pick([0.5, 1, 2]), mc = t.pick([0.5, 1, 1.5, 2]), cph = t.pick([2100, 4180]), cpc = 4180, Thi = t.pick([120, 150, 180]), Tci = t.pick([15, 20, 25]), UA = t.pick([1000, 2000, 4000, 8000]), flow = t.pick(['counterflow', 'parallel-flow']), ask = t.pick(['q', 'Tco', 'Tho']);
    const Ch = mh * cph, Cc = mc * cpc, Cmin = Math.min(Ch, Cc), Cr = Cmin / Math.max(Ch, Cc), N = UA / Cmin;
    const eps = flow === 'counterflow' ? (Math.abs(1 - Cr) < 1e-9 ? N / (1 + N) : (1 - Math.exp(-N * (1 - Cr))) / (1 - Cr * Math.exp(-N * (1 - Cr)))) : (1 - Math.exp(-N * (1 + Cr))) / (1 + Cr);
    const q = eps * Cmin * (Thi - Tci), Tco = Tci + q / Cc, Tho = Thi - q / Ch;
    const what = { q: 'the heat duty, in kW', Tco: 'the cold-stream outlet temperature, in °C', Tho: 'the hot-stream outlet temperature, in °C' }[ask];
    return num(`A ${flow} heat exchanger with UA = ${UA} W/K cools ${mh} kg/s of a liquid (c_p = ${cph} J/kg·K) entering at ${Thi} °C, using ${mc} kg/s of water (c_p = ${cpc}) entering at ${Tci} °C. What is ${what}? (4 significant figures)`, r4({ q: q / 1000, Tco, Tho }[ask]),
      `C_h = ${Ch}, C_c = ${Cc} W/K; C_min = ${Cmin}, C_r = ${r4(Cr)}, NTU = UA/C_min = ${r4(N)}. ε = ${r4(eps)}, q = εC_min(T_h,in − T_c,in) = ${r4(q / 1000)} kW. Outlets: cold ${r4(Tco)} °C, hot ${r4(Tho)} °C.`,
      `# march both streams along the exchanger (RK4); for counterflow, bisect on the unknown cold outlet\nCh, Cc, UA, Thi, Tci = ${Ch}, ${Cc}, ${UA}, ${Thi}, ${Tci}\ncounter = ${flow === 'counterflow' ? 'True' : 'False'}\ndef march(Tc0, n=2000):\n    Th, Tc, dA = Thi, Tc0, UA / n\n    s = -1 if counter else 1\n    f = lambda Th, Tc: (-(Th - Tc) / Ch, s * (Th - Tc) / Cc)\n    for _ in range(n):\n        a = f(Th, Tc); b = f(Th + dA / 2 * a[0], Tc + dA / 2 * a[1]); c = f(Th + dA / 2 * b[0], Tc + dA / 2 * b[1]); d = f(Th + dA * c[0], Tc + dA * c[1])\n        Th += dA / 6 * (a[0] + 2 * b[0] + 2 * c[0] + d[0]); Tc += dA / 6 * (a[1] + 2 * b[1] + 2 * c[1] + d[1])\n    return Th, Tc\nif counter:\n    lo, hi = Tci, Thi\n    for _ in range(60):\n        m = (lo + hi) / 2\n        lo, hi = (m, hi) if march(m)[1] < Tci else (lo, m)\n    Tco = lo; Tho = march(lo)[0]\nelse:\n    Tho, Tco = march(Tci)\nq = Ch * (Thi - Tho)\nprint(${{ q: 'q / 1000', Tco: 'Tco', Tho: 'Tho' }[ask]})`);
  }),

  SKILL('ht.mass', 'Mass transfer by analogy', 'Heat and mass transfer follow the same boundary-layer physics: h_m = h/(ρc_p)·Le^(−2/3), with Le = α/D_AB. Evaporation then runs at ṁ = h_mA(ρ_v,s − ρ_v,∞).', t => {
    const h = t.pick([10, 20, 30, 50]), A = t.pick([0.1, 0.25, 0.5, 1]), rho = 1.16, cp = 1007, alpha = 2.25e-5, Dab = 2.6e-5, Le = alpha / Dab;
    const rvs = t.pick([0.0173, 0.0230, 0.0304]), rvinf = Number((rvs * t.pick([0.2, 0.3, 0.5])).toFixed(4)), hm = h / (rho * cp) * Le ** (-2 / 3), mdot = hm * A * (rvs - rvinf), ask = t.pick(['hm', 'evap']);
    return num(`Air (ρ = 1.16 kg/m³, c_p = 1007 J/kg·K, α = 2.25 × 10⁻⁵ m²/s) flows over a wet surface of ${A} m², with h = ${h} W/m²K. Water vapour diffuses in air with D = 2.6 × 10⁻⁵ m²/s. The vapour density is ${rvs} kg/m³ at the surface and ${rvinf} kg/m³ in the free stream. Using the Chilton–Colburn analogy, what is ${ask === 'hm' ? 'the mass-transfer coefficient, in mm/s' : 'the evaporation rate, in g/h'}? (4 significant figures)`, r4(ask === 'hm' ? hm * 1000 : mdot * 3.6e6),
      `Le = α/D = ${r4(Le)}; h_m = h/(ρc_p)·Le^(−2/3) = ${r4(hm * 1000)} mm/s. Evaporation = h_mA(ρ_s − ρ_∞) = ${r4(mdot * 3.6e6)} g/h.`,
      `# the same analogy through dimensionless groups: Sh/Nu = (Sc/Pr)^(1/3), so h_m = (h L/k)(Sc/Pr)^(1/3) D/L\nh, A, rho, cp, alpha, D = ${h}, ${A}, 1.16, 1007, 2.25e-5, 2.6e-5\nnu = 1.6e-5; k = alpha * rho * cp; Pr = nu / alpha; Sc = nu / D; Lc = 0.3\nNu = h * Lc / k; Sh = Nu * (Sc / Pr) ** (1 / 3); hm = Sh * D / Lc\nprint(${ask === 'hm' ? 'hm * 1000' : `hm * A * (${rvs} - ${rvinf}) * 3.6e6`})`);
  }),
];
