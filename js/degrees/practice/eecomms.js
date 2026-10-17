/**
 * Electrical Engineering: fields, links, DSP and statistical signal
 * processing (6.013, 6.02, RES.6-008, 6.011). FE Electrical and Computer:
 * Electromagnetics, Communications, Signal Processing.
 *
 * Checks take another route: standing waves scanned along the line, lines
 * built from thousands of lumped LC sections, link budgets in watts through
 * effective aperture, noise from kTB, error rates from erfc, DTFTs summed term
 * by term, quantisers simulated, detection thresholds bisected on Gaussian
 * tails, and principal components found by searching every direction.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const C = 299792458;
const simpson = (f, a, b, n = 4000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return (s * h) / 3; };
const Q = z => simpson(t => Math.exp(-t * t / 2) / Math.sqrt(2 * Math.PI), z, z + 14);
const Qinv = p => { let lo = -8, hi = 8; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (Q(m) > p) lo = m; else hi = m; } return (lo + hi) / 2; };
const cx = (re, im) => ({ re, im });
const cdiv = (a, b) => { const d = b.re * b.re + b.im * b.im; return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
const zs = (R, X) => `${R}${X ? (X > 0 ? ' + j' : ' − j') + Math.abs(X) : ''} Ω`;

export const EECOMMS = [
  SKILL('com.tline', 'Reflections on a line', 'A load Z_L on a line Z₀ reflects Γ = (Z_L − Z₀)/(Z_L + Z₀); the standing-wave ratio is (1 + |Γ|)/(1 − |Γ|).', t => {
    const Z0 = t.pick([50, 75]);
    let R, X;
    do { R = t.pick([25, 50, 75, 100, 150]); X = t.pick([-50, -25, 0, 25, 50]); } while (R === Z0 && X === 0);
    const G = cdiv(cx(R - Z0, X), cx(R + Z0, X)), g = Math.hypot(G.re, G.im), ask = t.pick(['gamma', 'vswr', 'rl']);
    const ans = ask === 'gamma' ? g : ask === 'vswr' ? (1 + g) / (1 - g) : -20 * Math.log10(g);
    return num(`A ${Z0} Ω line is terminated in Z_L = ${zs(R, X)}. What is ${ask === 'gamma' ? 'the magnitude of the reflection coefficient' : ask === 'vswr' ? 'the voltage standing-wave ratio' : 'the return loss, in dB'}? (4 significant figures)`, r4(ans),
      `Γ = (Z_L − Z₀)/(Z_L + Z₀), |Γ| = ${r4(g)}; VSWR = (1 + |Γ|)/(1 − |Γ|) = ${r4((1 + g) / (1 - g))}; return loss = −20 log₁₀|Γ| = ${r4(-20 * Math.log10(g))} dB.`,
      `import cmath, math\n# solve for the forward and reflected waves from the load's boundary conditions, then scan the standing wave\nZ0, ZL = ${Z0}, complex(${R}, ${X})\n# V+ + V- = V_L, (V+ - V-)/Z0 = V_L/ZL with V_L = 1\nVp = (1 + Z0 / ZL) / 2; Vm = (1 - Z0 / ZL) / 2\nmags = [abs(Vp * cmath.exp(1j * 2 * math.pi * k / 4000) + Vm * cmath.exp(-1j * 2 * math.pi * k / 4000)) for k in range(4000)]\nvswr = max(mags) / min(mags); g = (vswr - 1) / (vswr + 1)\nprint(${ask === 'gamma' ? 'g' : ask === 'vswr' ? 'vswr' : '-20 * math.log10(g)'})`);
  }),

  SKILL('com.inputz', 'Input impedance of a line', 'A lossless line of electrical length βl transforms its load: Z_in = Z₀(Z_L + jZ₀ tan βl)/(Z₀ + jZ_L tan βl).', t => {
    const Z0 = t.pick([50, 75]), frac = t.pick([0.1, 0.125, 0.2, 0.3, 0.375]), R = t.pick([25, 100, 150]), X = t.pick([-50, 0, 50]);
    const tn = Math.tan(2 * Math.PI * frac), Zin = cdiv(cx(Z0 * R, Z0 * (X + Z0 * tn)), cx(Z0 - X * tn, R * tn)), m = Math.hypot(Zin.re, Zin.im);
    return num(`A lossless ${Z0} Ω line ${frac} wavelengths long is terminated in ${zs(R, X)}. What is the magnitude of its input impedance, in ohms? (4 significant figures)`, r4(m),
      `βl = 2π × ${frac}; Z_in = Z₀(Z_L + jZ₀ tan βl)/(Z₀ + jZ_L tan βl) = ${r4(Zin.re)} ${Zin.im >= 0 ? '+' : '−'} j${r4(Math.abs(Zin.im))} Ω, magnitude ${r4(m)} Ω.`,
      `import math\n# build the line from 4000 lumped L-C sections and cascade their ABCD matrices\nZ0, frac, ZL = ${Z0}, ${frac}, complex(${R}, ${X})\nN = 4000; bdz = 2 * math.pi * frac / N  # electrical length per section\nzL, yC = 1j * Z0 * bdz, 1j * bdz / Z0\nA, B, Cc, D = 1, 0, 0, 1\nfor _ in range(N):\n    # series inductor then shunt capacitor\n    A, B, Cc, D = A + B * yC, A * zL + B * (1 + zL * yC), Cc + D * yC, Cc * zL + D * (1 + zL * yC)\nprint(abs((A * ZL + B) / (Cc * ZL + D)))`);
  }),

  SKILL('com.friis', 'Link budgets', 'Received power in dBm = P_t + G_t + G_r − 20 log₁₀(4πd/λ): the free-space path loss grows 20 dB per decade of distance.', t => {
    const Pt = t.pick([0, 10, 20, 30]), Gt = t.pick([0, 3, 10]), Gr = t.pick([0, 3, 10, 20]), f = t.pick([433e6, 915e6, 2.4e9, 5.8e9]), d = t.pick([10, 100, 1000, 10000]);
    const lam = C / f, Pr = Pt + Gt + Gr - 20 * Math.log10((4 * Math.PI * d) / lam);
    return num(`A ${f / 1e6} MHz transmitter puts out ${Pt} dBm through a ${Gt} dBi antenna; the receiver ${d} m away has a ${Gr} dBi antenna. In free space, what power is received, in dBm? (4 significant figures)`, r4(Pr),
      `Free-space path loss = 20 log₁₀(4πd/λ) = ${r4(20 * Math.log10((4 * Math.PI * d) / lam))} dB, so P_r = ${Pt} + ${Gt} + ${Gr} − that = ${r4(Pr)} dBm.`,
      `import math\n# in watts: power density at d from the transmitter, times the receive antenna's effective aperture\nPt, Gt, Gr, f, d = ${Pt}, ${Gt}, ${Gr}, ${f}, ${d}\nlam = ${C} / f\nS = 1e-3 * 10 ** (Pt / 10) * 10 ** (Gt / 10) / (4 * math.pi * d * d)\nAe = 10 ** (Gr / 10) * lam ** 2 / (4 * math.pi)\nprint(10 * math.log10(S * Ae / 1e-3))`);
  }),

  SKILL('com.snr', 'Noise floor and SNR', 'Thermal noise in bandwidth B is kTB (−174 dBm/Hz at 290 K); a receiver with noise figure NF adds NF dB on top.', t => {
    const Pr = t.pick([-60, -75, -90, -100]), B = t.pick([10e3, 200e3, 1e6, 20e6]), NF = t.pick([2, 5, 8]);
    const floor = 10 * Math.log10((1.380649e-23 * 290 * B) / 1e-3) + NF, snr = Pr - floor;
    return num(`A receiver with a ${NF} dB noise figure and ${B >= 1e6 ? B / 1e6 + ' MHz' : B / 1e3 + ' kHz'} bandwidth receives ${Pr} dBm. What is its signal-to-noise ratio, in dB (290 K)? (4 significant figures)`, r4(snr),
      `Noise floor = kT₀B (≈ −174 dBm/Hz + 10 log₁₀ B) + NF = ${r4(floor)} dBm, so SNR = ${Pr} − (${r4(floor)}) = ${r4(snr)} dB.`,
      `import math\n# compute the noise power kTB in watts directly, raise it by the noise figure, compare with the signal\nk, T, B, NF, Pr = 1.380649e-23, 290, ${B}, ${NF}, ${Pr}\nN = k * T * B * 10 ** (NF / 10)\nS = 1e-3 * 10 ** (Pr / 10)\nprint(10 * math.log10(S / N))`);
  }),

  SKILL('com.ber', 'Bit errors in noise', 'BPSK in white Gaussian noise errs with probability Q(√(2E_b/N₀)): every 3 dB of E_b/N₀ matters most at low error rates.', t => {
    const ebn0 = t.pick([0, 2, 4, 6, 8, 9]), g = 10 ** (ebn0 / 10), ber = Q(Math.sqrt(2 * g));
    return num(`BPSK is received in additive white Gaussian noise at E_b/N₀ = ${ebn0} dB. What is the bit error probability? (4 significant figures)`, r4(ber),
      `P_b = Q(√(2E_b/N₀)) with E_b/N₀ = ${r4(g)}: ${ber.toPrecision(4)}.`,
      `import math\n# Q(x) = erfc(x / sqrt 2) / 2\ng = 10 ** (${ebn0} / 10)\nprint(0.5 * math.erfc(math.sqrt(g)))`);
  }),

  SKILL('dsp.ma', 'Moving-average filters', 'An M-point moving average has |H(f)| = |sin(πfM)/(M sin(πf))|: a crude low-pass with nulls at multiples of 1/M.', t => {
    const M = t.pick([3, 4, 5, 8, 10]), f = r4(t.pick([0.02, 0.05, 0.1, 0.15, 0.3, 0.45])), ask = t.pick(['lin', 'db']);
    const H = Math.abs(Math.sin(Math.PI * f * M) / (M * Math.sin(Math.PI * f))), ans = ask === 'lin' ? H : 20 * Math.log10(H);
    return num(`What is the ${ask === 'lin' ? 'magnitude response' : 'gain in dB'} of a ${M}-point moving-average filter at a normalised frequency of ${f} cycles per sample? (4 significant figures)`, r4(ans),
      `|H(f)| = |sin(π·${f}·${M})/(${M}·sin(π·${f}))| = ${r4(H)}${ask === 'db' ? `, which is ${r4(ans)} dB` : ''}.`,
      `import cmath, math\n# sum the DTFT of the impulse response term by term\nM, f = ${M}, ${f}\nH = abs(sum(cmath.exp(-2j * math.pi * f * n) / M for n in range(M)))\nprint(${ask === 'lin' ? 'H' : '20 * math.log10(H)'})`, { tol: 1e-3 });
  }),

  SKILL('dsp.qsnr', 'Quantisation noise', 'An N-bit quantiser gives a full-scale sine an SNR of about 6.02N + 1.76 dB; every dB of backoff costs a dB.', t => {
    let N, back;
    do { N = t.pick([8, 10, 12, 16]); back = t.pick([0, 6, 12]); } while (2 ** (N - 1) * 10 ** (-back / 20) < 120); // the formula holds once the sine spans many steps
    const snr = 6.02 * N + 1.76 - back;
    return num(`A sine wave ${back ? back + ' dB below' : 'at'} full scale is quantised by an ideal ${N}-bit converter. What is the signal-to-quantisation-noise ratio, in dB? (4 significant figures)`, r4(snr),
      `Uniform quantisation error has power Δ²/12; a full-scale sine has (2^(N−1)Δ)²/2. The ratio is 6.02N + 1.76 dB, less the ${back} dB backoff: ${r4(snr)} dB.`,
      `import math\n# quantise a long sine record (mid-rise, saturating) and measure the error power\nN, back = ${N}, ${back}\nD = 1.0\nA = 2 ** (N - 1) * D * 10 ** (-back / 20)\ntop = 2 ** (N - 1) - 0.5\nsig = err = 0.0\nfor i in range(200000):\n    x = A * math.sin(2 * math.pi * 0.1234567 * i + 0.3)\n    q = max(-top, min(top, math.floor(x / D) + 0.5)) * D\n    sig += x * x; err += (x - q) ** 2\nprint(10 * math.log10(sig / err))`, { tol: 0.2 });
  }),

  SKILL('sig.detect', 'Detecting a signal in noise', 'For a mean shift μ in Gaussian noise σ, a threshold set for false-alarm rate P_FA detects with P_D = Q(Q⁻¹(P_FA) − μ/σ).', t => {
    const d = t.pick([1, 1.5, 2, 3]), pfa = t.pick([0.1, 0.05, 0.01, 0.001]), pd = Q(Qinv(pfa) - d);
    return num(`A detector compares a Gaussian statistic (σ = 1 under both hypotheses) with a threshold. The signal shifts its mean by ${d}. If the threshold is set for a false-alarm probability of ${pfa}, what is the detection probability? (4 significant figures)`, r4(pd),
      `Threshold γ = Q⁻¹(${pfa}) = ${r4(Qinv(pfa))}; P_D = Q(γ − ${d}) = ${r4(pd)}.`,
      `import math\n# bisect for the threshold with the right false-alarm tail, then read the detection tail\nQ = lambda x: 0.5 * math.erfc(x / math.sqrt(2))\nd, pfa = ${d}, ${pfa}\nlo, hi = -10.0, 10.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if Q(m) > pfa else (lo, m)\nprint(Q(lo - d))`);
  }),

  SKILL('ml.pca', 'Principal components', 'The first principal component is the direction of greatest variance; its share of the total is λ₁/(λ₁ + λ₂) for the covariance matrix\'s eigenvalues.', t => {
    const n = t.int(5, 7), pts = Array.from({ length: n }, () => { const a = t.int(-5, 5); return [a + t.int(-2, 2), Math.round(a * t.pick([0.5, 1, 2])) + t.int(-2, 2)]; });
    const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
    const sxx = pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0) / (n - 1), syy = pts.reduce((s, p) => s + (p[1] - my) ** 2, 0) / (n - 1), sxy = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / (n - 1);
    const tr = sxx + syy, det = sxx * syy - sxy * sxy, l1 = tr / 2 + Math.sqrt((tr / 2) ** 2 - det), share = l1 / tr;
    return num(`For the points ${pts.map(p => `(${p[0]}, ${p[1]})`).join(', ')}, what fraction of the total variance does the first principal component explain? (4 significant figures)`, r4(share),
      `The sample covariance is [[${r4(sxx)}, ${r4(sxy)}], [${r4(sxy)}, ${r4(syy)}]]; its larger eigenvalue ${r4(l1)} over the trace ${r4(tr)} is ${r4(share)}.`,
      `import math\n# search every direction for the projection with the largest variance\npts = ${JSON.stringify(pts)}\nn = len(pts); mx = sum(p[0] for p in pts) / n; my = sum(p[1] for p in pts) / n\nvar = lambda th: sum(((p[0] - mx) * math.cos(th) + (p[1] - my) * math.sin(th)) ** 2 for p in pts) / (n - 1)\nbest = max(range(20000), key=lambda i: var(math.pi * i / 20000))\nlo, hi = math.pi * (best - 1) / 20000, math.pi * (best + 1) / 20000\nfor _ in range(100):\n    a, b = lo + (hi - lo) / 3, hi - (hi - lo) / 3\n    lo, hi = (a, hi) if var(a) < var(b) else (lo, b)\ntotal = var(0) + var(math.pi / 2)\nprint(var(lo) / total)`);
  }),
];
