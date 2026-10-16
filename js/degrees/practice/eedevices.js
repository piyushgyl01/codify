/**
 * Electrical Engineering: electronic materials and semiconductor devices
 * (6.012, 3.024). FE Electrical and Computer: Electrical Materials,
 * Electronics.
 *
 * Checks take another route: carrier densities found by solving for the
 * Fermi level, and depletion regions found by integrating Poisson's equation
 * on a grid and bisecting on the depletion edge.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const Q = 1.602176634e-19, NI = 1e10, VT = 0.02585, ES = 11.7 * 8.8541878128e-14; // C; cm⁻³; V at 300 K; F/cm for silicon
const sci = x => x.toExponential(0).replace('e+', '×10^');

export const EEDEVICES = [
  SKILL('mat.doping', 'Resistivity of doped silicon', 'Dopants set the carriers: n − p = N_D − N_A with np = nᵢ², and ρ = 1/(q(nμ_n + pμ_p)).', t => {
    const major = t.pick([1e15, 1e16, 1e17]), comp = t.pick([0, 0.1, 0.5]), ntype = t.rng() < 0.5;
    const [ND, NA] = ntype ? [major, major * comp] : [major * comp, major];
    const mun = 1350, mup = 480, net = ND - NA, n = net / 2 + Math.sqrt((net / 2) ** 2 + NI * NI), p = (NI * NI) / n;
    const rho = 1 / (Q * (n * mun + p * mup));
    return num(`Silicon at 300 K is doped with N_D = ${ND ? sci(ND) : 0} cm⁻³ and N_A = ${NA ? sci(NA) : 0} cm⁻³. Taking nᵢ = 10¹⁰ cm⁻³, μ_n = 1350 and μ_p = 480 cm²/V·s, what is its resistivity, in Ω·cm? (4 significant figures)`, r4(rho),
      `Net doping ${sci(Math.abs(net))} cm⁻³ ${net > 0 ? 'donors' : 'acceptors'}, so the majority density is ${r4(Math.max(n, p)).toExponential(3)} cm⁻³ and ρ = 1/(q(nμ_n + pμ_p)) = ${r4(rho)} Ω·cm.`,
      `import math\n# find the Fermi level that makes the crystal neutral, then the carriers it implies\nq, ni, VT = ${Q}, ${NI}, ${VT}\nND, NA = ${ND}, ${NA}\nnet = lambda phi: ni * math.exp(-phi / VT) - ni * math.exp(phi / VT) + ND - NA  # p - n + ND - NA, phi = Ef - Ei\nlo, hi = -1.0, 1.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if net(m) > 0 else (lo, m)\nn, p = ni * math.exp(lo / VT), ni * math.exp(-lo / VT)\nprint(1 / (q * (n * 1350 + p * 480)))`);
  }),

  SKILL('dev.junction', 'The pn junction', 'V_bi = (kT/q) ln(N_A N_D/nᵢ²); the depletion width is W = √(2ε(V_bi + V_R)/q · (1/N_A + 1/N_D)).', t => {
    const NA = t.pick([1e15, 1e16, 1e17]), ND = t.pick([1e15, 1e16, 1e17, 1e18]), VR = t.pick([0, 1, 5]), ask = t.pick(['vbi', 'w', 'emax']);
    const vbi = VT * Math.log((NA * ND) / (NI * NI)), W = Math.sqrt(((2 * ES * (vbi + VR)) / Q) * (1 / NA + 1 / ND));
    const xp = (W * ND) / (NA + ND), Emax = (Q * NA * xp) / ES;
    const ans = ask === 'vbi' ? vbi : ask === 'w' ? W * 1e4 : Emax / 1e3;
    const what = { vbi: 'built-in potential, in volts', w: `depletion width at ${VR} V reverse bias, in μm`, emax: `peak electric field at ${VR} V reverse bias, in kV/cm` }[ask];
    return num(`A silicon pn junction at 300 K has N_A = ${sci(NA)} cm⁻³ and N_D = ${sci(ND)} cm⁻³ (nᵢ = 10¹⁰ cm⁻³, ε_r = 11.7, kT/q = 25.85 mV). What is its ${what}? (Depletion approximation; 4 significant figures)`, r4(ans),
      `V_bi = (kT/q) ln(N_A N_D/nᵢ²) = ${r4(vbi)} V. W = √(2ε(V_bi + V_R)/q · (1/N_A + 1/N_D)) = ${r4(W * 1e4)} μm, and the field peaks at the junction: E_max = qN_A x_p/ε = ${r4(Emax / 1e3)} kV/cm.`,
      `import math\nq, ni, VT, es = ${Q}, ${NI}, ${VT}, ${ES}\nNA, ND, VR = ${NA}, ${ND}, ${VR}\n# built-in potential from the Fermi levels that neutralise each side\ndef phi(Nd, Na):\n    f = lambda x: ni * math.exp(-x / VT) - ni * math.exp(x / VT) + Nd - Na\n    lo, hi = -1.5, 1.5\n    for _ in range(200):\n        m = (lo + hi) / 2\n        lo, hi = (m, hi) if f(m) > 0 else (lo, m)\n    return lo\nvbi = phi(ND, 0) - phi(0, NA)\n# integrate Poisson's equation across the depletion region on a grid; bisect on x_p until the potential drop is vbi + VR\ndef drop(xp):\n    xn = NA * xp / ND; N = 2000\n    xs = [-xp + xp * i / N for i in range(N)] + [xn * i / N for i in range(N + 1)]  # a node exactly at the junction\n    E = [0.0]; V = [0.0]\n    for i in range(len(xs) - 1):\n        xm = (xs[i] + xs[i + 1]) / 2; h = xs[i + 1] - xs[i]\n        rho = -q * NA if xm < 0 else q * ND\n        E.append(E[-1] + rho / es * h)\n        V.append(V[-1] - (E[-2] + E[-1]) / 2 * h)\n    return V[-1], max(abs(e) for e in E)\nlo, hi = 0.0, 1e-2\nfor _ in range(100):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if drop(m)[0] < vbi + VR else (lo, m)\nxp = lo; W = xp + NA * xp / ND\nprint(${ask === 'vbi' ? 'vbi' : ask === 'w' ? 'W * 1e4' : 'drop(xp)[1] / 1e3'})`, { rtol: 0.004 });
  }),
  SKILL('dev.diode', 'Diode operating point', 'A diode and resistor in series settle where the Shockley curve I = I_s(e^(V/V_T) − 1) meets the load line I = (V_s − V)/R.', t => {
    const Is = t.pick([1e-14, 1e-12]), Vs = t.pick([1, 2, 5]), R = t.pick([100, 470, 1000]), ask = t.pick(['I', 'V']);
    let lo = 0, hi = Vs; // the diode current minus the load-line current rises with V: bisect on V
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (Is * (Math.exp(m / VT) - 1) < (Vs - m) / R) lo = m; else hi = m; }
    const V = (lo + hi) / 2;
    const I = (Vs - V) / R;
    return num(`A ${Vs} V source drives a silicon diode (I_s = ${Is.toExponential(0)} A, ideality 1, V_T = 25.85 mV) through ${R} Ω. What is the diode ${ask === 'I' ? 'current, in mA' : 'voltage, in volts'}? (4 significant figures)`, r4(ask === 'I' ? I * 1e3 : V),
      `Solve I_s(e^(V/V_T) − 1) = (V_s − V)/R: V_D = ${r4(V)} V and I = ${r4(I * 1e3)} mA. The "0.7 V" rule would have given ${r4(((Vs - 0.7) / R) * 1e3)} mA.`,
      `import math\n# bisect on the current: the diode voltage that carries it plus the resistor drop must equal the source\nIs, VT, Vs, R = ${Is}, ${VT}, ${Vs}, ${R}\nlo, hi = 0.0, Vs / R\nfor _ in range(200):\n    I = (lo + hi) / 2\n    V = VT * math.log(I / Is + 1)\n    lo, hi = (I, hi) if V + I * R < Vs else (lo, I)\nprint(${ask === 'I' ? 'lo * 1e3' : 'VT * math.log(lo / Is + 1)'})`);
  }),

  SKILL('dev.mosfet', 'MOSFET drain current', 'Above threshold an NMOS conducts I_D = k[(V_ov)V_DS − V_DS²/2] in triode and (k/2)V_ov²(1 + λV_DS) in saturation, with V_ov = V_GS − V_T.', t => {
    const k = t.pick([0.5, 1, 2]) / 1e3, VT0 = t.pick([0.4, 0.7]), lam = t.pick([0, 0.05]), VGS = t.pick([1, 1.5, 2]), VDS = t.pick([0.2, 0.5, 1, 3]);
    const Vov = VGS - VT0, sat = VDS >= Vov, ID = sat ? (k / 2) * Vov * Vov * (1 + lam * VDS) : k * (Vov * VDS - (VDS * VDS) / 2);
    return num(`An NMOS transistor has k = μCox·W/L = ${k * 1e3} mA/V², V_T = ${VT0} V and λ = ${lam} V⁻¹. With V_GS = ${VGS} V and V_DS = ${VDS} V, what is the drain current, in mA? (Square-law model, λ applied in saturation only; 4 significant figures)`, r4(ID * 1e3),
      `V_ov = ${r4(Vov)} V; V_DS ${sat ? '≥' : '<'} V_ov, so it is in ${sat ? 'saturation' : 'triode'}: I_D = ${r4(ID * 1e3)} mA.`,
      `# gradual-channel model: integrate the channel charge k(V_ov - V) along the channel voltage up to the pinch-off point or V_DS\nk, VT0, lam, VGS, VDS = ${k}, ${VT0}, ${lam}, ${VGS}, ${VDS}\nVov = VGS - VT0\nVeff = min(VDS, Vov)\nN = 100000; h = Veff / N\nI = sum(k * (Vov - (i + .5) * h) * h for i in range(N))\nif VDS >= Vov: I *= 1 + lam * VDS\nprint(I * 1e3)`);
  }),

  SKILL('dev.bjtgain', 'Common-emitter gain', 'With g_m = I_C/V_T and r_π = β/g_m, a common-emitter stage gives A_v = −βR_C/(R_s + r_π + (β + 1)R_E): emitter degeneration trades gain for predictability.', t => {
    const beta = t.pick([100, 150, 200]), IC = t.pick([0.5, 1, 2]) / 1e3, RC = t.pick([2200, 4700, 10000]), RE = t.pick([0, 100, 220, 470]), Rs = t.pick([50, 600, 1000]);
    const gm = IC / VT, rpi = beta / gm, Av = (-beta * RC) / (Rs + rpi + (beta + 1) * RE);
    return num(`A common-emitter stage is biased at I_C = ${IC * 1e3} mA (β = ${beta}, V_T = 25.85 mV) with R_C = ${RC} Ω, unbypassed R_E = ${RE} Ω, and a source resistance of ${Rs} Ω. Ignoring r_o, what is its small-signal voltage gain v_out/v_s? (4 significant figures)`, r4(Av),
      `g_m = ${r4(gm * 1e3)} mA/V and r_π = ${r4(rpi)} Ω, so A_v = −βR_C/(R_s + r_π + (β+1)R_E) = ${r4(Av)}.`,
      `# stamp the hybrid-pi model (r_pi and a transconductance) into a nodal matrix and solve\nbeta, IC, VT, RC, RE, Rs = ${beta}, ${IC}, ${VT}, ${RC}, ${RE}, ${Rs}\ngm = IC / VT; rpi = beta / gm\n# unknowns: v_s(0), v_b(1), v_e(2), v_c(3), source current(4)\nN = 5; G = [[0.0] * N for _ in range(N)]; b = [0.0] * N\ndef R(a, c, val):\n    g = 1 / val\n    for i, j, s in [(a, a, g), (c, c, g), (a, c, -g), (c, a, -g)]:\n        if i is not None and j is not None: G[i][j] += s\nR(0, 1, Rs); R(1, 2, rpi); R(3, None, RC)\nif RE > 0: R(2, None, RE)\nelse: G[2][2] += 1e9  # emitter grounded\n# collector current gm*(vb - ve) flows from c to e through the transistor\nG[3][1] += gm; G[3][2] -= gm; G[2][1] -= gm; G[2][2] += gm\nG[0][4] += 1; G[4][0] += 1; b[4] = 1.0\nA = [row[:] + [bb] for row, bb in zip(G, b)]\nfor c in range(N):\n    p = max(range(c, N), key=lambda r: abs(A[r][c])); A[c], A[p] = A[p], A[c]\n    for r in range(N):\n        if r != c:\n            f = A[r][c] / A[c][c]; A[r] = [x - f * y for x, y in zip(A[r], A[c])]\nprint(A[3][N] / A[3][3])`);
  }),
];
