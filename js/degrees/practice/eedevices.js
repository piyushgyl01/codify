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
];
