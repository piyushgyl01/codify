/**
 * Physics, third year: instrumentation (20.309), relativity (8.033),
 * condensed matter and AMO (3.024), astrophysics, quantum information
 * (8.370x) and nuclear physics (22.01). GRE Physics: Special Relativity,
 * Atomic Physics, Specialized Topics, Laboratory Methods.
 *
 * Checks take another route: transfer functions swept and bisected, noise
 * spectra integrated, DFTs of sampled tones, Bessel zeros found from Bessel's
 * integral, the Schwarzschild metric used exactly, orbits and light rays
 * integrated, structure factors summed, tight-binding chains diagonalised,
 * Fermi–Dirac integrals solved for neutrality, phonon modes counted, J²
 * projected in a product basis, state vectors multiplied out, Kraus maps
 * averaged over the Bloch sphere, decay chains integrated, kinematics solved
 * exactly, and binaries simulated.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const HBAR = 1.054571817e-34, ME = 9.1093837015e-31, EV = 1.602176634e-19, C = 299792458, KB = 1.380649e-23, MUB = 9.2740100783e-24;
const GMSUN = 1.32712440018e20, GMEARTH = 3.986004418e14, AU = 1.495978707e11, RSUN = 6.957e8;
const ARCSEC = (180 * 3600) / Math.PI;

/** Python: the lowest k eigenvalues of a symmetric tridiagonal matrix by Sturm-sequence bisection. */
const STURM = `def sturm_count(d, e, x):\n    c, q = 0, 1.0\n    for i in range(len(d)):\n        q = d[i] - x - (e[i - 1] ** 2 / q if i else 0.0)\n        if q == 0: q = 1e-300\n        if q < 0: c += 1\n    return c\ndef eig(d, e, k):\n    lo, hi = min(d) - 2 * max(abs(v) for v in e) - 1, max(d) + 2 * max(abs(v) for v in e) + 1\n    a, b = lo, hi\n    for _ in range(200):\n        m = (a + b) / 2\n        if sturm_count(d, e, m) >= k: b = m\n        else: a = m\n    return (a + b) / 2\n`;

/** Python: one RK4 step for y' = f(y) with y a list. */
const RK4 = `def rk4(f, y, h):\n    k1 = f(y); k2 = f([a + h / 2 * b for a, b in zip(y, k1)]); k3 = f([a + h / 2 * b for a, b in zip(y, k2)]); k4 = f([a + h * b for a, b in zip(y, k3)])\n    return [a + h / 6 * (p + 2 * q + 2 * r + s) for a, p, q, r, s in zip(y, k1, k2, k3, k4)]\n`;

const ohms = R => (R >= 1e6 ? `${R / 1e6} MΩ` : `${R / 1e3} kΩ`);
const farads = F => (F >= 1e-9 ? `${r4(F * 1e9)} nF` : `${r4(F * 1e12)} pF`);

export const PHYSFRONT = [
  // ---- instrumentation ----
  SKILL('el.opamp', 'The gain–bandwidth trade-off', 'With a single-pole op-amp, closed-loop bandwidth ≈ GBW ÷ noise gain: more gain, less bandwidth.', t => {
    const gbw = t.pick([1e6, 3e6, 10e6]), G = t.pick([2, 5, 10, 21, 101]);
    const f = gbw / G;
    return num(`A non-inverting amplifier with gain ${G} uses an op-amp with a gain–bandwidth product of ${gbw / 1e6} MHz (single pole, open-loop gain 10⁵). What is its −3 dB bandwidth, in kHz? (4 significant figures)`, r4(f / 1e3),
      `The loop gain Aβ falls as GBW/(f·${G}); the closed loop holds its gain until that reaches 1, at f ≈ GBW/${G} = ${r4(f / 1e3)} kHz.`,
      `# closed loop H = A / (1 + A beta), A(f) = A0 / (1 + j f / fp); bisect for |H| = |H(0)| / sqrt(2)\nA0, gbw, G = 1e5, ${gbw}, ${G}\nfp, beta = gbw / A0, 1 / G\ndef H(f):\n    A = A0 / (1 + 1j * f / fp)\n    return abs(A / (1 + beta * A))\ntarget = H(0) / 2 ** 0.5\nlo, hi = 1.0, 1e10\nfor _ in range(200):\n    mid = (lo * hi) ** 0.5\n    lo, hi = (mid, hi) if H(mid) > target else (lo, mid)\nprint(lo / 1e3)`);
  }),

  SKILL('el.ktc', 'kT/C noise', 'The thermal noise left on a capacitor is √(kT/C), whatever resistor charged it.', t => {
    const Cf = t.pick([1e-12, 10e-12, 100e-12, 1e-9]), T = t.pick([77, 300]), R = t.pick([1e3, 1e4, 1e6]);
    const v = Math.sqrt((KB * T) / Cf) * 1e6;
    return num(`A ${ohms(R)} resistor at ${T} K is connected across a ${farads(Cf)} capacitor. What is the rms noise voltage on the capacitor, in μV? (4 significant figures)`, r4(v),
      `Integrating the resistor's 4kTR noise through the RC low-pass gives ⟨V²⟩ = kT/C, so the rms is ${r4(v)} μV. R sets both the noise density and the bandwidth, and the two cancel.`,
      `import math\n# integrate the Johnson noise density 4kTR through the RC filter over all frequencies, on a log grid\nk, T, R, C = ${KB}, ${T}, ${R}, ${Cf}\nfc = 1 / (2 * math.pi * R * C)\nN, lo, hi = 200000, math.log(fc * 1e-8), math.log(fc * 1e8)\ns = 0.0\nfor i in range(N):\n    f = math.exp(lo + (i + .5) * (hi - lo) / N)\n    s += 4 * k * T * R / (1 + (f / fc) ** 2) * f * (hi - lo) / N\nprint(math.sqrt(s) * 1e6)`);
  }),

  SKILL('el.alias', 'Aliasing', 'Sampling at fₛ folds every frequency into 0 … fₛ/2: f appears at |f − fₛ·round(f/fₛ)|.', t => {
    const fs = t.pick([400, 500, 800]), f = t.int(1, 5 * fs - 1);
    const a = Math.abs(f - fs * Math.round(f / fs));
    return num(`A ${f} Hz sine wave is sampled at ${fs} Hz with no anti-aliasing filter. At what frequency between 0 and ${fs / 2} Hz does it appear in the samples?`, a,
      `The samples cannot tell f from f − n·fₛ, so the tone folds to |${f} − ${fs} × ${Math.round(f / fs)}| = ${a} Hz. An analogue low-pass filter before the converter prevents it.`,
      `import math\n# sample one second, take the DFT (1 Hz bins), and report the strongest bin\nf, fs = ${f}, ${fs}\nx = [math.cos(2 * math.pi * f * n / fs + 0.3) for n in range(fs)]\nbest, at = -1.0, 0\nfor k in range(fs // 2 + 1):\n    re = sum(x[n] * math.cos(2 * math.pi * k * n / fs) for n in range(fs))\n    im = sum(x[n] * math.sin(2 * math.pi * k * n / fs) for n in range(fs))\n    if re * re + im * im > best: best, at = re * re + im * im, k\nprint(at)`, { rtol: 0, tol: 0, dp: 0 });
  }),

  SKILL('op.rayleigh', 'The diffraction limit', 'A circular aperture of diameter D resolves angles down to θ ≈ 1.22λ/D, the first dark ring of its Airy pattern.', t => {
    const [name, D] = t.pick([['the eye (pupil 5 mm)', 0.005], ['a 10 cm telescope', 0.1], ['a 2.4 m space telescope', 2.4], ['a 30 m telescope', 30]]);
    const lam = t.pick([450, 550, 650]) * 1e-9, th = ((1.22 * lam) / D) * ARCSEC;
    return num(`What is the diffraction-limited angular resolution of ${name} at ${r4(lam * 1e9)} nm, in arcseconds? (4 significant figures)`, r4(th),
      `θ = 1.22λ/D = ${r4(th)}″. The 1.22 is the first zero of J₁ (3.832) divided by π.`,
      `import math\n# Bessel's integral J1(x) = (1/pi) int_0^pi cos(t - x sin t) dt; bisect for its first zero, then sin(theta) = x lambda / (pi D)\ndef J1(x, N=2000):\n    return sum(math.cos((i + .5) * math.pi / N - x * math.sin((i + .5) * math.pi / N)) for i in range(N)) / N\nlo, hi = 3.0, 4.5\nfor _ in range(60):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if J1(lo) * J1(m) > 0 else (lo, m)\nlam, D = ${lam}, ${D}\nprint(math.asin(lo * lam / (math.pi * D)) * 180 * 3600 / math.pi)`);
  }),

  // ---- relativity ----
  SKILL('rel.gps', 'Clocks in orbit', 'An orbiting clock gains from weaker gravity, GM/c²·(1/R − 1/r), and loses from its speed, v²/2c².', t => {
    const [name, r] = t.pick([['a GPS satellite (orbit radius 26 560 km)', 26560e3], ['a Galileo satellite (orbit radius 29 600 km)', 29600e3], ['a geostationary satellite (orbit radius 42 164 km)', 42164e3], ['the International Space Station (orbit radius 6 780 km)', 6780e3]]);
    const R = 6371e3, rate = (GMEARTH / (C * C)) * (1 / R - 1 / r) - GMEARTH / r / (2 * C * C), us = rate * 86400e6;
    return num(`By how many microseconds per day does a clock on ${name} run fast compared with one on the ground? Treat the Earth as non-rotating, radius 6371 km, GM = 3.986 × 10¹⁴ m³/s²; answer negative if it runs slow. (4 significant figures)`, r4(us),
      `Gravity: GM/c²·(1/R − 1/r) = ${r4((GMEARTH / (C * C)) * (1 / R - 1 / r) * 86400e6)} μs/day fast. Speed: v²/2c² = GM/(2rc²) = ${r4((GMEARTH / r / (2 * C * C)) * 86400e6)} μs/day slow. Net ${r4(us)} μs/day.`,
      `import math\n# exact Schwarzschild rates: a circular orbit ticks at sqrt(1 - 3GM/rc^2), a static clock at sqrt(1 - 2GM/Rc^2)\nGM, c, R, r = ${GMEARTH}, ${C}, ${R}, ${r}\nprint((math.sqrt(1 - 3 * GM / (r * c * c)) / math.sqrt(1 - 2 * GM / (R * c * c)) - 1) * 86400e6)`);
  }),

  SKILL('rel.precession', 'Perihelion precession', 'General relativity turns each orbit by 6πGM/(c²a(1 − e²)): 43″ a century for Mercury.', t => {
    const [name, aAU, e] = t.pick([['Mercury', 0.3871, 0.2056], ['Venus', 0.7233, 0.0068], ['Earth', 1.0, 0.0167], ['Mars', 1.5237, 0.0934], ['the asteroid Icarus', 1.0778, 0.8269]]);
    const a = aAU * AU, dphi = (6 * Math.PI * GMSUN) / (C * C * a * (1 - e * e)), P = (2 * Math.PI * Math.sqrt(a ** 3 / GMSUN)) / (365.25 * 86400);
    const cent = (dphi * ARCSEC * 100) / P;
    return num(`${name[0].toUpperCase() + name.slice(1)} orbits the Sun with a = ${aAU} AU and e = ${e}. How fast does general relativity advance its perihelion, in arcseconds per century? (4 significant figures)`, r4(cent),
      `Δφ = 6πGM/(c²a(1 − e²)) = ${r4(dphi)} rad per orbit; the period is ${r4(P)} years, so ${r4(cent)}″ per century.`,
      `import math\n${RK4}# integrate the relativistic orbit equation U'' = 1 - U + eps U^2 (U = p/r, eps = 3GM/(c^2 p)) from perihelion to the next\nGM, c, a, e = ${GMSUN}, ${C}, ${a}, ${e}\np = a * (1 - e * e); eps = 3 * GM / (c * c * p)\nf = lambda y: [y[1], 1 - y[0] + eps * y[0] ** 2]\ny, phi, h = [1 + e, 0.0], 0.0, 1e-3\nwhile phi < math.pi: y = rk4(f, y, h); phi += h\nwhile True:\n    yn = rk4(f, y, h)\n    if y[1] > 0 and yn[1] <= 0: break\n    y, phi = yn, phi + h\nlo, hi = 0.0, h\nfor _ in range(60):\n    m = (lo + hi) / 2\n    if rk4(f, y, m)[1] > 0: lo = m\n    else: hi = m\nP = 2 * math.pi * math.sqrt(a ** 3 / GM) / (365.25 * 86400)\nprint((phi + lo - 2 * math.pi) * 180 * 3600 / math.pi * 100 / P)`);
  }),

  SKILL('rel.deflection', 'Bending of light', 'Light passing a mass at impact parameter b is deflected by 4GM/(c²b), twice the Newtonian guess.', t => {
    const [name, GM, b] = t.pick([['the Sun, grazing its edge', GMSUN, RSUN], ['the Sun, at 2 solar radii', GMSUN, 2 * RSUN], ['the Sun, at 10 solar radii', GMSUN, 10 * RSUN], ['Jupiter, grazing its edge (GM = 1.267 × 10¹⁷ m³/s², R = 71 492 km)', 1.26686534e17, 71492e3], ['the white dwarf Sirius B, grazing its edge (1.02 M☉, R = 5 800 km)', 1.02 * GMSUN, 5.8e6]]);
    const d = ((4 * GM) / (C * C * b)) * ARCSEC;
    return num(`Starlight passes ${name}. By how much is it deflected, in arcseconds? (4 significant figures)`, r4(d),
      `α = 4GM/(c²b) = ${r4(d)}″. Eddington's 1919 eclipse measurement of 1.75″ at the solar limb tested exactly this.`,
      `import math\n${RK4}# integrate the null geodesic U'' = -U + eps U^2 (U = b/r, eps = 3GM/(c^2 b)) from U = 0 back to U = 0\nGM, c, b = ${GM}, ${C}, ${b}\neps = 3 * GM / (c * c * b)\nf = lambda y: [y[1], -y[0] + eps * y[0] ** 2]\ny, phi, h = [0.0, 1.0], 0.0, 1e-3\nwhile True:\n    yn = rk4(f, y, h)\n    if phi > 1 and yn[0] <= 0: break\n    y, phi = yn, phi + h\nlo, hi = 0.0, h\nfor _ in range(60):\n    m = (lo + hi) / 2\n    if rk4(f, y, m)[0] > 0: lo = m\n    else: hi = m\nprint((phi + lo - math.pi) * 180 * 3600 / math.pi)`);
  }),

  SKILL('rel.radii', 'Radii around a black hole', 'Around mass M (with r_g = GM/c²): horizon 2r_g, photon sphere 3r_g, innermost stable circular orbit 6r_g.', t => {
    const [name, M] = t.pick([['a 5 M☉ black hole', 5], ['a 10 M☉ black hole', 10], ['the 62 M☉ black hole left by GW150914', 62], ['Sagittarius A* (4.3 × 10⁶ M☉)', 4.3e6]]);
    const which = t.pick(['horizon', 'photon', 'isco']), rg = (GMSUN * M) / (C * C);
    const r = { horizon: 2, photon: 3, isco: 6 }[which] * rg / 1e3;
    const label = { horizon: 'event horizon (Schwarzschild radius)', photon: 'photon sphere', isco: 'innermost stable circular orbit' }[which];
    return num(`What is the radius of the ${label} of ${name}, in km? (Non-rotating; 4 significant figures)`, r4(r),
      `With r_g = GM/c² = ${r4(rg / 1e3)} km, the ${label} is at ${{ horizon: 2, photon: 3, isco: 6 }[which]}r_g = ${r4(r)} km.`,
      `import math\n# work in units of r_g = GM/c^2\nrg = ${GMSUN} * ${M} / ${C} ** 2\nwhich = '${which}'\nif which == 'horizon':\n    lo, hi = 1.0, 10.0  # where g_tt = 1 - 2/r vanishes\n    for _ in range(100):\n        m = (lo + hi) / 2\n        lo, hi = (lo, m) if 1 - 2 / m > 0 else (m, hi)\n    r = lo\nelif which == 'photon':\n    V = lambda r: (1 - 2 / r) / r ** 2  # light's effective potential; circular orbit at its maximum\n    lo, hi = 2.1, 20.0\n    for _ in range(200):\n        m1, m2 = lo + (hi - lo) / 3, hi - (hi - lo) / 3\n        lo, hi = (m1, hi) if V(m1) < V(m2) else (lo, m2)\n    r = lo\nelse:\n    def curv(r):  # V'' at r for the angular momentum of a circular orbit there\n        L2 = r * r / (r - 3)\n        V = lambda x: (1 - 2 / x) * (1 + L2 / x ** 2)\n        d = 1e-3\n        return V(r + d) - 2 * V(r) + V(r - d)\n    lo, hi = 3.5, 30.0\n    for _ in range(100):\n        m = (lo + hi) / 2\n        lo, hi = (m, hi) if curv(m) < 0 else (lo, m)\n    r = lo\nprint(r * rg / 1e3)`);
  }),

  // ---- condensed matter and atoms ----
  SKILL('cmp.bragg', 'X-ray diffraction from cubic crystals', 'Peaks satisfy 2d sin θ = λ with d = a/√(h² + k² + l²); bcc and fcc lattices forbid some (hkl).', t => {
    const [name, type, a] = t.pick([['copper', 'fcc', 3.615], ['aluminium', 'fcc', 4.0495], ['α-iron', 'bcc', 2.8665], ['tungsten', 'bcc', 3.1652], ['α-polonium', 'sc', 3.359]]);
    const nth = t.int(1, 3), lam = 1.5406;
    const allowed = (h, k, l) => type === 'sc' || (type === 'bcc' ? (h + k + l) % 2 === 0 : h % 2 === k % 2 && k % 2 === l % 2);
    const Ns = new Set();
    for (let h = 0; h <= 4; h++) for (let k = 0; k <= 4; k++) for (let l = 0; l <= 4; l++) if (h + k + l && allowed(h, k, l)) Ns.add(h * h + k * k + l * l);
    const N = [...Ns].sort((x, y) => x - y)[nth - 1], d = a / Math.sqrt(N), tt = 2 * Math.asin(lam / (2 * d)) * (180 / Math.PI);
    return num(`${name[0].toUpperCase() + name.slice(1)} is ${type} with a = ${a} Å. With Cu Kα X-rays (λ = 1.5406 Å), at what angle 2θ does its ${['first', 'second', 'third'][nth - 1]} diffraction peak appear, in degrees? (4 significant figures)`, r4(tt),
      `${type === 'sc' ? 'Simple cubic allows every (hkl)' : type === 'bcc' ? 'bcc needs h + k + l even' : 'fcc needs h, k, l all odd or all even'}, so peak ${nth} has h² + k² + l² = ${N}: d = ${r4(d)} Å and 2θ = ${r4(tt)}°.`,
      `import math, cmath\n# sum the structure factor over the conventional cell's basis; keep reflections where it does not vanish\nbasis = {'sc': [(0, 0, 0)], 'bcc': [(0, 0, 0), (.5, .5, .5)], 'fcc': [(0, 0, 0), (.5, .5, 0), (.5, 0, .5), (0, .5, .5)]}['${type}']\nNs = set()\nfor h in range(-4, 5):\n    for k in range(-4, 5):\n        for l in range(-4, 5):\n            if (h, k, l) == (0, 0, 0): continue\n            F = sum(cmath.exp(2j * math.pi * (h * x + k * y + l * z)) for x, y, z in basis)\n            if abs(F) > 1e-6: Ns.add(h * h + k * k + l * l)\nN = sorted(Ns)[${nth - 1}]\nd = ${a} / math.sqrt(N)\nprint(2 * math.degrees(math.asin(1.5406 / (2 * d))))`);
  }),

  SKILL('cmp.effmass', 'Effective mass in a band', 'In a tight-binding band E = −2t cos ka, electrons near the bottom move with m* = ħ²/(2ta²).', t => {
    const hop = t.pick([0.5, 1, 2]), a = t.pick([2, 3, 4]);
    const m = (HBAR * HBAR) / (2 * hop * EV * (a * 1e-10) ** 2) / ME;
    return num(`A one-dimensional chain with lattice spacing ${a} Å has nearest-neighbour hopping t = ${hop} eV. What is the effective mass at the bottom of its band, in units of the electron mass? (4 significant figures)`, r4(m),
      `E(k) = −2t cos ka ≈ −2t + ta²k², so ħ²/2m* = ta² and m* = ħ²/(2ta²) = ${r4(m)} mₑ. Wider bands (larger t) mean lighter carriers.`,
      `${STURM}# diagonalise an open chain of N sites; its levels are E_n near the bottom with k_n = n pi / ((N + 1) a)\nimport math\nhbar, me, eV = ${HBAR}, ${ME}, ${EV}\nN, t, a = 2000, ${hop}, ${a}e-10\nd, e = [0.0] * N, [-t] * (N - 1)\nE1, E2 = eig(d, e, 1), eig(d, e, 2)\nk1, k2 = math.pi / ((N + 1) * a), 2 * math.pi / ((N + 1) * a)\nc = (E2 - E1) * eV / (k2 ** 2 - k1 ** 2)  # = hbar^2 / 2m*\nprint(hbar ** 2 / (2 * c) / me)`);
  }),

  SKILL('cmp.intrinsic', 'Intrinsic carriers', 'In a pure semiconductor n = p = nᵢ = √(N_c N_v) e^(−E_g/2kT): the gap sets the conductivity.', t => {
    const [name, Nc, Nv, Eg] = t.pick([['silicon', 2.8e19, 1.04e19, 1.12], ['germanium', 1.04e19, 6.0e18, 0.66], ['gallium arsenide', 4.7e17, 7.0e18, 1.424]]);
    const T = t.pick([300, 350, 400]), s = (T / 300) ** 1.5, kT = (KB * T) / EV;
    const ni = Math.sqrt(Nc * s * Nv * s) * Math.exp(-Eg / (2 * kT));
    return num(`${name[0].toUpperCase() + name.slice(1)} has E_g = ${Eg} eV, N_c = ${Nc.toExponential(2)} cm⁻³ and N_v = ${Nv.toExponential(2)} cm⁻³ at 300 K (both scale as T^3/2; take E_g fixed). What is its intrinsic carrier density at ${T} K, in cm⁻³? (4 significant figures)`, r4(ni),
      `nᵢ = √(N_c N_v) e^(−E_g/2kT) with kT = ${r4(kT)} eV: ${r4(ni)} cm⁻³.`,
      `import math\n# Fermi-Dirac integrals for electrons and holes; bisect the chemical potential until n = p\nNc, Nv, Eg, kT = ${Nc} * ${s}, ${Nv} * ${s}, ${Eg}, ${kT}\ndef F(eta):  # (2/sqrt(pi)) int_0^inf sqrt(x) / (1 + e^(x - eta)) dx, with x = y^2\n    N, top, s = 4000, 7.0, 0.0\n    for i in range(N):\n        y = (i + .5) * top / N\n        s += 2 * y * y / (1 + math.exp(y * y - eta)) * top / N\n    return 2 / math.sqrt(math.pi) * s\nlo, hi = 0.0, Eg\nfor _ in range(80):\n    mu = (lo + hi) / 2\n    if Nc * F((mu - Eg) / kT) > Nv * F(-mu / kT): hi = mu\n    else: lo = mu\nprint(Nc * F((lo - Eg) / kT))`);
  }),

  SKILL('cmp.debye', 'Debye heat capacity', 'Phonons up to the Debye cutoff give C = 9Nk(T/θ)³∫₀^{θ/T} x⁴eˣ/(eˣ − 1)² dx: Dulong–Petit when hot, T³ when cold.', t => {
    const [name, th] = t.pick([['copper', 343], ['aluminium', 428], ['lead', 105], ['silver', 225]]);
    const T = t.pick([77, 150, 300]), xd = th / T, n = 2000, h = xd / n;
    const g = x => (x === 0 ? 0 : (x ** 4 * Math.exp(x)) / Math.expm1(x) ** 2);
    let s = g(0) + g(xd);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * g(i * h);
    const frac = (3 / xd ** 3) * ((s * h) / 3), Cm = 3 * 8.314462618 * frac;
    return num(`${name[0].toUpperCase() + name.slice(1)} has a Debye temperature of ${th} K. What is its molar heat capacity at ${T} K in the Debye model, in J/(mol·K)? (4 significant figures)`, r4(Cm),
      `C = 3R · 3(T/θ)³∫₀^{θ/T} x⁴eˣ/(eˣ − 1)² dx = 3R × ${r4(frac)} = ${r4(Cm)} J/(mol·K). Dulong–Petit would give 24.94.`,
      `import math\n# count phonon modes on a cubic lattice of wavevectors inside the Debye sphere, each with omega proportional to |k|,\n# and add up their Einstein heat capacities\nxd, R = ${xd}, 60\ncount = {}\nfor i in range(R + 1):\n    for j in range(R + 1):\n        for k in range(R + 1):\n            r2 = i * i + j * j + k * k\n            if 0 < r2 <= R * R:\n                count[r2] = count.get(r2, 0) + (1 if i == 0 else 2) * (1 if j == 0 else 2) * (1 if k == 0 else 2)\ntot = sum(count.values()); s = 0.0\nfor r2, w in count.items():\n    x = xd * math.sqrt(r2) / R\n    s += w * x * x * math.exp(x) / math.expm1(x) ** 2\nprint(3 * 8.314462618 * s / tot)`, { rtol: 0.004 });
  }),

  SKILL('at.lande', 'The Landé g-factor', 'In a weak field a level splits into 2J + 1 sublevels spaced g_J μ_B B, with g_J = 1 + [J(J+1) + S(S+1) − L(L+1)]/2J(J+1).', t => {
    const [label, L, S, J] = t.pick([['²P₁/₂', 1, 0.5, 0.5], ['²P₃/₂', 1, 0.5, 1.5], ['²D₃/₂', 2, 0.5, 1.5], ['²D₅/₂', 2, 0.5, 2.5], ['³P₁', 1, 1, 1], ['³P₂', 1, 1, 2], ['³D₁', 2, 1, 1], ['⁴F₃/₂', 3, 1.5, 1.5], ['⁵D₄', 2, 2, 4]]);
    const g = 1 + (J * (J + 1) + S * (S + 1) - L * (L + 1)) / (2 * J * (J + 1)), B = t.pick([0, 0.5, 1, 2]);
    const py = `import math\n# build the |mL, mS> states with mL + mS = J, project onto total angular momentum J with J^2, then g = <Lz + 2 Sz> / J\nL, S, J = ${L}, ${S}, ${J}\nbasis = [(L - i, S - j) for i in range(int(round(2 * L)) + 1) for j in range(int(round(2 * S)) + 1) if abs(L - i + S - j - J) < 1e-9]\nidx = {s: n for n, s in enumerate(basis)}\nc = lambda j, m, up: math.sqrt(j * (j + 1) - m * (m + (1 if up else -1)))\ndef Jsq(v):\n    out = [0.0] * len(v)\n    for (a, b), n in idx.items():\n        out[n] += (L * (L + 1) + S * (S + 1) + 2 * a * b) * v[n]\n        if (a + 1, b - 1) in idx: out[idx[(a + 1, b - 1)]] += c(L, a, True) * c(S, b, False) * v[n]\n        if (a - 1, b + 1) in idx: out[idx[(a - 1, b + 1)]] += c(L, a, False) * c(S, b, True) * v[n]\n    return out\nv = [1 + 0.37 * n for n in range(len(basis))]\nJp = J + 1\nwhile Jp <= L + S + 1e-9:\n    w = Jsq(v); v = [(x - Jp * (Jp + 1) * y) for x, y in zip(w, v)]; Jp += 1\nnorm = sum(x * x for x in v)\ng = sum(x * x * (a + 2 * b) for x, (a, b) in zip(v, basis)) / norm / J\n`;
    if (!B) return num(`What is the Landé g-factor of an atomic ${label} level (taking g_s = 2)? (4 significant figures)`, r4(g),
      `L = ${L}, S = ${S}, J = ${J}: g_J = 1 + [${J * (J + 1)} + ${S * (S + 1)} − ${L * (L + 1)}]/${2 * J * (J + 1)} = ${r4(g)}.`,
      `${py}print(g)`, { tol: 1e-4 });
    const dE = (g * MUB * B) / EV * 1e6;
    return num(`An atomic ${label} level sits in a ${B} T field. What is the energy spacing between neighbouring Zeeman sublevels, in μeV? (Take g_s = 2; 4 significant figures)`, r4(dE),
      `g_J = ${r4(g)}, so ΔE = g_J μ_B B = ${r4(g)} × 57.88 μeV/T × ${B} T = ${r4(dE)} μeV.`,
      `${py}print(g * ${MUB} * ${B} / ${EV} * 1e6)`);
  }),

  // ---- quantum information ----
  SKILL('qi.circuit', 'Single-qubit circuits', 'Each gate rotates the Bloch vector; the chance of reading 1 is (1 − z)/2.', t => {
    const seq = Array.from({ length: t.int(3, 6) }, () => t.pick(['H', 'X', 'Y', 'Z', 'S', 'T', 'H', 'T']));
    let [x, y, z] = [0, 0, 1];
    const s2 = Math.SQRT1_2;
    for (const g of seq) {
      if (g === 'H') [x, y, z] = [z, -y, x];
      else if (g === 'X') [y, z] = [-y, -z];
      else if (g === 'Y') [x, z] = [-x, -z];
      else if (g === 'Z') [x, y] = [-x, -y];
      else if (g === 'S') [x, y] = [-y, x];
      else [x, y] = [s2 * (x - y), s2 * (x + y)];
    }
    const p = (1 - z) / 2;
    return num(`A qubit starts in |0⟩ and passes through the gates ${seq.join(', ')} (in that order). What is the probability of measuring 1? (4 significant figures)`, r4(p),
      `Follow the Bloch vector: H swaps x and z and flips y, X/Y/Z are half-turns, S and T turn about z by 90° and 45°. It ends at z = ${r4(z)}, so P(1) = (1 − z)/2 = ${r4(p)}.`,
      `import cmath, math\n# multiply the state vector by each gate's matrix\nr = 1 / math.sqrt(2)\nG = {'H': [[r, r], [r, -r]], 'X': [[0, 1], [1, 0]], 'Y': [[0, -1j], [1j, 0]], 'Z': [[1, 0], [0, -1]], 'S': [[1, 0], [0, 1j]], 'T': [[1, 0], [0, cmath.exp(1j * math.pi / 4)]]}\npsi = [1 + 0j, 0j]\nfor g in ${JSON.stringify(seq)}:\n    m = G[g]; psi = [m[0][0] * psi[0] + m[0][1] * psi[1], m[1][0] * psi[0] + m[1][1] * psi[1]]\nprint(abs(psi[1]) ** 2)`, { tol: 1e-4 });
  }),

  SKILL('qi.chsh', 'The CHSH inequality', 'For the singlet E(a, b) = −cos(a − b); local hidden variables keep |S| ≤ 2, quantum mechanics reaches 2√2.', t => {
    const opt = t.rng() < 0.3, ang = () => 15 * t.int(-6, 6);
    const [a, a2, b, b2] = opt ? [0, 90, 45, 135] : [ang(), ang(), ang(), ang()];
    const E = (p, q) => -Math.cos(((p - q) * Math.PI) / 180), S = Math.abs(E(a, b) - E(a, b2) + E(a2, b) + E(a2, b2));
    return num(`Alice and Bob share a singlet and measure spin along directions in the x–z plane at angles a = ${a}°, a′ = ${a2}° and b = ${b}°, b′ = ${b2}° from z. What is |S| = |E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′)|? (4 significant figures)`, r4(S),
      `For the singlet E(a, b) = −cos(a − b), so |S| = ${r4(S)}${S > 2 + 1e-9 ? ' — above the local bound of 2' : ''}. The maximum, 2√2 = 2.828, is Tsirelson's bound.`,
      `import math\n# build the singlet and the measurement operators cos(t) Z + sin(t) X explicitly; E = <psi| A (x) B |psi>\nr = 1 / math.sqrt(2)\npsi = [0, r, -r, 0]  # (|01> - |10>)/sqrt2 in basis 00, 01, 10, 11\ndef op(t):\n    t = math.radians(t)\n    return [[math.cos(t), math.sin(t)], [math.sin(t), -math.cos(t)]]\ndef E(p, q):\n    A, B = op(p), op(q)\n    M = [[A[i // 2][j // 2] * B[i % 2][j % 2] for j in range(4)] for i in range(4)]\n    return sum(psi[i] * M[i][j] * psi[j] for i in range(4) for j in range(4))\na, a2, b, b2 = ${a}, ${a2}, ${b}, ${b2}\nprint(abs(E(a, b) - E(a, b2) + E(a2, b) + E(a2, b2)))`, { tol: 1e-4 });
  }),

  SKILL('qi.entropy', 'Entanglement entropy', 'The entanglement of a pure two-qubit state is the entropy of either reduced state, set by its Schmidt coefficients.', t => {
    let amp;
    do amp = Array.from({ length: 4 }, () => t.int(-2, 2)); while (amp.every(v => v === 0) || Math.abs(amp[0] * amp[3] - amp[1] * amp[2]) === 0);
    const [a, b, c, d] = amp, n2 = a * a + b * b + c * c + d * d, Cn = (2 * Math.abs(a * d - b * c)) / n2;
    const lp = (1 + Math.sqrt(Math.max(0, 1 - Cn * Cn))) / 2, lm = 1 - lp;
    const S = -[lp, lm].filter(l => l > 1e-15).reduce((s, l) => s + l * Math.log2(l), 0);
    const term = (v, k) => (v === 0 ? '' : `${v < 0 ? ' − ' : ' + '}${Math.abs(v) === 1 ? '' : Math.abs(v)}|${k}⟩`);
    const ket = (term(a, '00') + term(b, '01') + term(c, '10') + term(d, '11')).replace(/^ \+ /, '').replace(/^ − /, '−');
    return num(`The two-qubit state is proportional to ${ket}. What is its entanglement entropy, in bits? (4 significant figures)`, r4(S),
      `Normalise by √${n2}. The concurrence is 2|ad − bc| = ${r4(Cn)}, the reduced state's eigenvalues are ${r4(lp)} and ${r4(lm)}, and S = −Σλ log₂λ = ${r4(S)} bits.`,
      `import math\n# Schmidt coefficients: power iteration on M M^T, with M the 2x2 amplitude matrix; the other eigenvalue is 1 minus it\na, b, c, d = ${a}, ${b}, ${c}, ${d}\nn = math.sqrt(a * a + b * b + c * c + d * d)\nM = [[a / n, b / n], [c / n, d / n]]\nP = [[sum(M[i][k] * M[j][k] for k in range(2)) for j in range(2)] for i in range(2)]\nv = [1.0, 0.7]\nfor _ in range(2000):\n    w = [P[0][0] * v[0] + P[0][1] * v[1], P[1][0] * v[0] + P[1][1] * v[1]]\n    s = math.hypot(*w); v = [w[0] / s, w[1] / s]\nl1 = v[0] * (P[0][0] * v[0] + P[0][1] * v[1]) + v[1] * (P[1][0] * v[0] + P[1][1] * v[1])\nprint(-sum(l * math.log2(l) for l in (l1, 1 - l1) if l > 1e-15))`, { tol: 1e-4 });
  }),

  SKILL('qi.channel', 'Noisy channels', 'Average fidelity of a qubit sent through a channel: depolarising 1 − p/2; amplitude damping ½ + √(1−γ)/3 + (1−γ)/6.', t => {
    const kind = t.pick(['depol', 'damp']), p = kind === 'depol' ? t.pick([0.05, 0.1, 0.2, 0.3]) : t.pick([0.1, 0.2, 0.5, 0.8]);
    const F = kind === 'depol' ? 1 - p / 2 : 0.5 + Math.sqrt(1 - p) / 3 + (1 - p) / 6;
    return num(`A qubit in a random pure state passes through ${kind === 'depol' ? `a depolarising channel, ρ → (1 − p)ρ + pI/2, with p = ${p}` : `an amplitude-damping channel with γ = ${p}`}. What is the average fidelity between input and output? (4 significant figures)`, r4(F),
      kind === 'depol' ? `The Bloch vector shrinks by 1 − p, so F = (1 + (1 − p))/2 = ${r4(F)}.` : `Amplitude damping shrinks x and y by √(1−γ) and pulls z toward +1; averaging (1 + r·r′)/2 over the sphere gives ½ + √(1−γ)/3 + (1−γ)/6 = ${r4(F)}.`,
      `import cmath, math\n# apply the channel's Kraus operators to pure states over a grid on the Bloch sphere and average <psi|rho'|psi>\np = ${p}\nif '${kind}' == 'depol':\n    q = math.sqrt(p / 4)\n    K = [[[math.sqrt(1 - 3 * p / 4), 0], [0, math.sqrt(1 - 3 * p / 4)]], [[0, q], [q, 0]], [[0, -1j * q], [1j * q, 0]], [[q, 0], [0, -q]]]\nelse:\n    K = [[[1, 0], [0, math.sqrt(1 - p)]], [[0, math.sqrt(p)], [0, 0]]]\nNt, Np = 120, 60\nnum = den = 0.0\nfor i in range(Nt):\n    th = (i + .5) * math.pi / Nt\n    for j in range(Np):\n        ph = 2 * math.pi * j / Np\n        psi = [math.cos(th / 2), cmath.exp(1j * ph) * math.sin(th / 2)]\n        F = 0.0\n        for k in K:\n            v = [k[0][0] * psi[0] + k[0][1] * psi[1], k[1][0] * psi[0] + k[1][1] * psi[1]]\n            F += abs(psi[0].conjugate() * v[0] + psi[1].conjugate() * v[1]) ** 2\n        num += F * math.sin(th); den += math.sin(th)\nprint(num / den)`, { tol: 1e-4 });
  }),

  // ---- nuclear ----
  SKILL('nu.chain', 'Decay chains', 'A daughter fed by a parent grows as λ_D/(λ_D − λ_P)·(e^(−λ_P t) − e^(−λ_D t)) and peaks at t = ln(λ_D/λ_P)/(λ_D − λ_P).', t => {
    const [name, TP, TD, times] = t.pick([['molybdenum-99 (66.0 h) → technetium-99m (6.01 h)', 65.94, 6.007, [6, 12, 24, 48]], ['barium-140 (12.75 d) → lanthanum-140 (1.678 d)', 306.0, 40.27, [24, 48, 96, 168]], ['tellurium-132 (3.204 d) → iodine-132 (2.295 h)', 76.9, 2.295, [2, 4, 8, 24]]]);
    const lP = Math.LN2 / TP, lD = Math.LN2 / TD, ask = t.pick(['ratio', 'tmax']);
    if (ask === 'tmax') {
      const tm = Math.log(lD / lP) / (lD - lP);
      return num(`A pure sample of ${name} is prepared at t = 0 (half-lives ${TP} h and ${TD} h). After how many hours is the daughter's activity greatest? (4 significant figures)`, r4(tm),
        `dN_D/dt = λ_P N_P − λ_D N_D vanishes at t = ln(λ_D/λ_P)/(λ_D − λ_P) = ${r4(tm)} h. A radionuclide generator gives the most daughter if eluted then.`,
        `import math\n${RK4}# integrate the chain and find where the daughter stops growing\nlP, lD = math.log(2) / ${TP}, math.log(2) / ${TD}\nf = lambda y: [-lP * y[0], lP * y[0] - lD * y[1]]\ny, t, h = [1.0, 0.0], 0.0, ${TD} / 2000\nwhile True:\n    yn = rk4(f, y, h)\n    if lP * yn[0] - lD * yn[1] <= 0: break\n    y, t = yn, t + h\nlo, hi = 0.0, h\nfor _ in range(60):\n    m = (lo + hi) / 2\n    z = rk4(f, y, m)\n    lo, hi = (m, hi) if lP * z[0] - lD * z[1] > 0 else (lo, m)\nprint(t + lo)`);
    }
    const tt = t.pick(times), A = (lD / (lD - lP)) * (Math.exp(-lP * tt) - Math.exp(-lD * tt));
    return num(`A pure sample of ${name} is prepared at t = 0 (half-lives ${TP} h and ${TD} h). At t = ${tt} h, what is the daughter's activity as a fraction of the parent's initial activity? (4 significant figures)`, r4(A),
      `Bateman: A_D/A_P(0) = λ_D/(λ_D − λ_P)·(e^(−λ_P t) − e^(−λ_D t)) = ${r4(A)}.`,
      `import math\n${RK4}# integrate dN_P/dt = -lP N_P, dN_D/dt = lP N_P - lD N_D with A_P(0) = 1\nlP, lD = math.log(2) / ${TP}, math.log(2) / ${TD}\nf = lambda y: [-lP * y[0], lP * y[0] - lD * y[1]]\ny, n = [1 / lP, 0.0], 20000\nfor _ in range(n): y = rk4(f, y, ${tt} / n)\nprint(lD * y[1])`);
  }),

  SKILL('nu.shield', 'Gamma shielding', 'A narrow gamma beam falls as e^(−μx), with μ = (μ/ρ)·ρ; the half-value layer is ln 2/μ.', t => {
    const [name, mr, rho] = t.pick([['lead', 0.111, 11.35], ['iron', 0.0738, 7.874], ['concrete', 0.0775, 2.3], ['water', 0.086, 1.0]]);
    const mu = mr * rho, ask = t.pick(['T', 'x']);
    if (ask === 'T') {
      const x = t.pick([1, 2, 5, 10]), T = Math.exp(-mu * x) * 100;
      return num(`Taking μ/ρ = ${mr} cm²/g for 662 keV gammas (caesium-137) and ρ = ${rho} g/cm³, what percentage of a narrow beam passes through ${x} cm of ${name}? (4 significant figures)`, r4(T),
        `μ = ${r4(mu)} cm⁻¹, so I/I₀ = e^(−${r4(mu * x)}) = ${r4(T)}%. A broad beam lets more through (build-up from scattered photons).`,
        `# each thin layer dx removes the fraction mu dx of what reaches it\nmu, x, N = ${mu}, ${x}, 200000\nI = 1.0\nfor _ in range(N): I *= 1 - mu * x / N\nprint(I * 100)`);
    }
    const f = t.pick([0.5, 0.1, 0.01]), x = Math.log(1 / f) / mu;
    return num(`Taking μ/ρ = ${mr} cm²/g for 662 keV gammas and ρ = ${rho} g/cm³, how thick must ${name} be to cut a narrow beam to ${f * 100}%, in cm? (4 significant figures)`, r4(x),
      `x = ln(1/${f})/μ = ${r4(x)} cm${f === 0.5 ? ' — the half-value layer' : ''}.`,
      `# bisect on thickness, with transmission found by removing mu dx layer by layer\nmu, f = ${mu}, ${f}\ndef T(x, N=20000):\n    I = 1.0\n    for _ in range(N): I *= 1 - mu * x / N\n    return I\nlo, hi = 0.0, 500.0\nfor _ in range(50):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if T(m) > f else (lo, m)\nprint(lo)`);
  }),

  SKILL('nu.compton', 'Compton edges', 'A gamma of energy E gives an electron at most E·2α/(1 + 2α) (α = E/mₑc²): the Compton edge in a detector spectrum.', t => {
    const [name, E] = t.pick([['caesium-137 (662 keV)', 661.7], ['cobalt-60 (1173 keV)', 1173.2], ['cobalt-60 (1332 keV)', 1332.5], ['potassium-40 (1461 keV)', 1460.8], ['annihilation (511 keV)', 511.0]]);
    const al = E / 510.999, ask = t.pick(['edge', 'back']), edge = (E * 2 * al) / (1 + 2 * al), back = E / (1 + 2 * al);
    const ans = ask === 'edge' ? edge : back;
    return num(`For the ${name} gamma line, at what energy is the ${ask === 'edge' ? 'Compton edge' : 'backscatter peak'} in a detector spectrum, in keV? (4 significant figures)`, r4(ans),
      `α = E/mₑc² = ${r4(al)}. Backscattered photons keep E/(1 + 2α) = ${r4(back)} keV, so the electron's maximum (the edge) is ${r4(edge)} keV.`,
      `import math\n# a photon of energy E backscatters off an electron at rest: conserve energy and momentum exactly, bisecting on E'\nm, E = 510.999, ${E}\ndef excess(Ep):  # energy after minus before, with electron momentum E + E'\n    return Ep + math.sqrt((E + Ep) ** 2 + m * m) - (E + m)\nlo, hi = 0.0, E\nfor _ in range(100):\n    mid = (lo + hi) / 2\n    lo, hi = (lo, mid) if excess(mid) > 0 else (mid, hi)\nprint(${ask === 'edge' ? 'E - lo' : 'lo'})`);
  }),

  SKILL('nu.alpha', 'Alpha-decay kinematics', 'The Q-value is shared by momentum: the alpha takes Q·M_D/(M_D + M_α), the daughter recoils with the rest.', t => {
    const [name, Q, AD] = t.pick([['polonium-210 → lead-206', 5.4075, 206], ['radium-226 → radon-222', 4.8706, 222], ['uranium-238 → thorium-234', 4.2699, 234], ['americium-241 → neptunium-237', 5.6378, 237], ['plutonium-239 → uranium-235', 5.2445, 235]]);
    const Ma = 3727.379, MD = AD * 931.494, Ta = (Q * MD) / (MD + Ma), ask = t.pick(['alpha', 'recoil']);
    const ans = ask === 'alpha' ? Ta : (Q - Ta) * 1e3;
    return num(`In the alpha decay ${name}, Q = ${Q} MeV. Taking the daughter's mass as ${AD} × 931.494 MeV/c² and the alpha's as 3727.379 MeV/c², what is the ${ask === 'alpha' ? 'alpha particle\'s kinetic energy, in MeV' : 'daughter\'s recoil energy, in keV'}? (4 significant figures)`, r4(ans),
      `Equal and opposite momenta split Q in inverse proportion to mass: T_α = Q·M_D/(M_D + M_α) = ${r4(Ta)} MeV, leaving ${r4((Q - Ta) * 1e3)} keV of recoil.`,
      `import math\n# relativistic two-body decay: find the momentum p with E_alpha + E_daughter = M_parent, by bisection\nMa, MD, Q = 3727.379, ${AD} * 931.494, ${Q}\nM = Ma + MD + Q\nlo, hi = 0.0, 1000.0\nfor _ in range(200):\n    p = (lo + hi) / 2\n    lo, hi = (p, hi) if math.sqrt(p * p + Ma * Ma) + math.sqrt(p * p + MD * MD) < M else (lo, p)\nTa = math.sqrt(lo * lo + Ma * Ma) - Ma\nprint(${ask === 'alpha' ? 'Ta' : '(Q - Ta) * 1e3'})`);
  }),

  // ---- astrophysics ----
  SKILL('as.distance', 'The distance modulus', 'm − M = 5 log₁₀(d/10 pc) + A: magnitudes compare fluxes, and dust (A) makes stars look farther.', t => {
    const M = t.pick([-1.0, 0.6, 4.8, 8.0]), A = t.pick([0, 0.3, 1.2]), m = r4(M + A + t.int(5, 12) + t.int(0, 9) / 10);
    const d = 10 ** ((m - M - A + 5) / 5);
    return num(`A star of absolute magnitude M = ${M} is seen at apparent magnitude m = ${m}, behind ${A} magnitudes of extinction. How far away is it, in parsecs? (4 significant figures)`, r4(d),
      `m − M − A = 5 log₁₀(d/10 pc), so d = 10^((${m} − ${M} − ${A} + 5)/5) = ${r4(d)} pc. Ignoring the dust would put it at ${r4(10 ** ((m - M + 5) / 5))} pc.`,
      `import math\n# magnitudes compare fluxes: m - M = -2.5 log10(F / F10); flux falls as 1/d^2 and dust passes 10^(-0.4 A); bisect on d\nm, M, A = ${m}, ${M}, ${A}\nmag = lambda d: -2.5 * math.log10((10 / d) ** 2 * 10 ** (-0.4 * A))\nlo, hi = 0.0, 12.0  # log10 of distance in pc\nfor _ in range(100):\n    mid = (lo + hi) / 2\n    lo, hi = (mid, hi) if mag(10 ** mid) < m - M else (lo, mid)\nprint(10 ** lo)`);
  }),

  SKILL('as.binary', 'Weighing binary stars', 'Kepler\'s third law in solar units: M₁ + M₂ = a³/P², with a in AU and P in years.', t => {
    const a = t.pick([2, 5, 10, 20, 30]), e = t.pick([0, 0.3, 0.6]), Mt = t.pick([0.8, 1.5, 2.3, 3.1, 4.2]);
    const P = r4(Math.sqrt(a ** 3 / Mt)), M = a ** 3 / (P * P);
    return num(`A visual binary has relative orbit semi-major axis ${a} AU, eccentricity ${e} and period ${P} years. What is the total mass of the pair, in solar masses? (4 significant figures)`, r4(M),
      `M₁ + M₂ = a³/P² = ${a ** 3}/${r4(P * P)} = ${r4(M)} M☉. The eccentricity does not enter.`,
      `import math\n${RK4}# simulate the relative orbit (G = 4 pi^2 AU^3 / (Msun yr^2)) and bisect on the mass until the period matches\na, e, P = ${a}, ${e}, ${P}\ndef period(M):\n    GM = 4 * math.pi ** 2 * M\n    r0 = a * (1 - e)\n    y = [r0, 0.0, 0.0, math.sqrt(GM * (1 + e) / r0)]\n    f = lambda y: [y[2], y[3], -GM * y[0] / (y[0] ** 2 + y[1] ** 2) ** 1.5, -GM * y[1] / (y[0] ** 2 + y[1] ** 2) ** 1.5]\n    T = 2 * math.pi * math.sqrt(a ** 3 / GM); h = T / 3000; t = 0.0\n    while True:\n        yn = rk4(f, y, h)\n        if y[1] < 0 and yn[1] >= 0 and yn[0] > 0:\n            return t + h * (-y[1]) / (yn[1] - y[1])\n        y, t = yn, t + h\nlo, hi = 0.05, 50.0\nfor _ in range(40):\n    mid = (lo * hi) ** 0.5\n    lo, hi = (mid, hi) if period(mid) > P else (lo, mid)\nprint(lo)`);
  }),
];
