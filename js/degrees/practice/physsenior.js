/**
 * Physics, final year: cosmology and gravitational waves (8.962), many-body
 * and quantum materials (8.511), particle physics (8.701), Bayesian data
 * analysis (18.650) and the senior laboratory (8.13/8.14).
 *
 * Checks take another route: the Friedmann equation integrated in time,
 * Peters' orbital decay with Kepler's law, the quadrupole formula
 * differentiated numerically, Fock-space Hamiltonians built from fermion
 * operators and diagonalised, chains diagonalised by Sturm bisection, the BCS
 * gap equation solved, configurations enumerated, four-vectors summed, the
 * incomplete gamma function integrated, the beta–binomial identity, grid
 * posteriors, and exact autocovariance sums.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const G = 6.6743e-11, C = 299792458, MSUN = 1.98847e30, MPC = 3.0856775814913673e22, KB_MEV = 8.617333262e-8;

/** Python: the lowest k eigenvalues of a symmetric tridiagonal matrix by Sturm-sequence bisection. */
const STURM = `def sturm_count(d, e, x):\n    c, q = 0, 1.0\n    for i in range(len(d)):\n        q = d[i] - x - (e[i - 1] ** 2 / q if i else 0.0)\n        if q == 0: q = 1e-300\n        if q < 0: c += 1\n    return c\ndef eig(d, e, k):\n    lo, hi = min(d) - 2 * max(abs(v) for v in e) - 1, max(d) + 2 * max(abs(v) for v in e) + 1\n    a, b = lo, hi\n    for _ in range(200):\n        m = (a + b) / 2\n        if sturm_count(d, e, m) >= k: b = m\n        else: a = m\n    return (a + b) / 2\n`;

/** Simpson's rule on [a, b] with n (even) intervals. */
const simpson = (f, a, b, n = 2000) => {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
};
/** One-sided Gaussian tail probability Q(z). */
const gaussTail = z => simpson(t => Math.exp(-t * t / 2) / Math.sqrt(2 * Math.PI), z, z + 14, 4000);

export const PHYSSENIOR = [
  // ---- cosmology and gravitational waves ----
  SKILL('cos.distance', 'Cosmological distances', 'In a flat universe d_L = (1 + z)·(c/H₀)∫₀^z dz′/E(z′), with E = √(Ω_m(1 + z)³ + Ω_Λ).', t => {
    const H0 = t.pick([67.4, 70]), Om = t.pick([0.3, 0.315]), z = t.pick([0.1, 0.5, 1, 2]), ask = t.pick(['dl', 'mu']);
    const E = x => Math.sqrt(Om * (1 + x) ** 3 + (1 - Om));
    const dc = (299792.458 / H0) * simpson(x => 1 / E(x), 0, z), dl = (1 + z) * dc, mu = 5 * Math.log10(dl * 1e6 / 10);
    const ans = ask === 'dl' ? dl : mu;
    return num(`In a flat ΛCDM universe with H₀ = ${H0} km/s/Mpc and Ω_m = ${Om} (no radiation), what is the ${ask === 'dl' ? 'luminosity distance to z = ' + z + ', in Mpc' : 'distance modulus of a supernova at z = ' + z}? (4 significant figures)`, r4(ans),
      `The comoving distance is (c/H₀)∫₀^z dz′/E(z′) = ${r4(dc)} Mpc, so d_L = (1 + z) × that = ${r4(dl)} Mpc${ask === 'mu' ? ` and μ = 5 log₁₀(d_L/10 pc) = ${r4(mu)}` : ''}.`,
      `import math\n# integrate the Friedmann equation backwards in time (tau = H0 t) together with the light ray: da/dtau = a E(a), dchi/dtau = -(c/H0)/a\nH0, Om, z = ${H0}, ${Om}, ${z}\nch = 299792.458 / H0\nf = lambda a: a * math.sqrt(Om / a ** 3 + 1 - Om)\ndef step(a, chi, h):  # RK4 with tau decreasing by h\n    k1a, k1c = -f(a), ch / a\n    k2a, k2c = -f(a + h / 2 * k1a), ch / (a + h / 2 * k1a)\n    k3a, k3c = -f(a + h / 2 * k2a), ch / (a + h / 2 * k2a)\n    k4a, k4c = -f(a + h * k3a), ch / (a + h * k3a)\n    return a + h / 6 * (k1a + 2 * k2a + 2 * k3a + k4a), chi + h / 6 * (k1c + 2 * k2c + 2 * k3c + k4c)\nat = 1 / (1 + z); a, chi, h = 1.0, 0.0, 1e-4\nwhile True:\n    an, cn = step(a, chi, h)\n    if an <= at: break\n    a, chi = an, cn\nlo, hi = 0.0, h\nfor _ in range(60):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if step(a, chi, m)[0] > at else (lo, m)\nchi = step(a, chi, lo)[1]\ndl = (1 + z) * chi\nprint(${ask === 'dl' ? 'dl' : '5 * math.log10(dl * 1e6 / 10)'})`);
  }),

  SKILL('cos.age', 'The age of the universe', 'A flat matter-plus-Λ universe is t₀ = 2/(3H₀√Ω_Λ)·arsinh√(Ω_Λ/Ω_m) old.', t => {
    const H0 = t.pick([67.4, 70, 73]), Om = t.pick([0.25, 0.3, 0.315, 1]);
    const hub = 977.792221 / H0, OL = 1 - Om;
    const age = OL > 0 ? ((2 * hub) / (3 * Math.sqrt(OL))) * Math.asinh(Math.sqrt(OL / Om)) : (2 / 3) * hub;
    return num(`How old is a flat universe with H₀ = ${H0} km/s/Mpc and Ω_m = ${Om}${OL > 0 ? `, Ω_Λ = ${r4(OL)}` : ' (matter only)'}, in billions of years? (Ignore radiation; 4 significant figures)`, r4(age),
      `1/H₀ = ${r4(hub)} Gyr. ${OL > 0 ? `t₀ = (2/3H₀√Ω_Λ) arsinh√(Ω_Λ/Ω_m) = ${r4(age)} Gyr.` : `With matter only, a ∝ t^(2/3) and t₀ = 2/(3H₀) = ${r4(age)} Gyr — younger than the oldest stars, one reason Λ was needed.`}`,
      `import math\n# t0 = int_0^1 da / (a H(a)); substitute a = u^2 to remove the singularity at a = 0, then Simpson\nH0, Om = ${H0}, ${Om}\nhub = 977.792221 / H0\ng = lambda u: 2 * u * u / math.sqrt(Om + (1 - Om) * u ** 6)  # da / (a E(a)) with a = u^2\nN = 20000; h = 1 / N\ns = g(0) + g(1) + sum((4 if i % 2 else 2) * g(i * h) for i in range(1, N))\nprint(hub * s * h / 3)`);
  }),

  SKILL('gw.chirp', 'Inspiral time', 'A binary radiating gravitational waves at frequency f merges in τ = (5/256)(GM_c/c³)^(−5/3)(πf)^(−8/3), set by the chirp mass alone.', t => {
    const [name, m1, m2] = t.pick([['GW150914-like (36 + 29 M☉)', 36, 29], ['GW170817-like (1.46 + 1.27 M☉)', 1.46, 1.27], ['a 10 + 10 M☉ binary', 10, 10], ['a 30 + 8 M☉ binary', 30, 8]]);
    const f = t.pick([10, 20, 30]), Mc = ((m1 * m2) ** 0.6 / (m1 + m2) ** 0.2) * MSUN;
    const tau = (5 / 256) * ((G * Mc) / C ** 3) ** (-5 / 3) * (Math.PI * f) ** (-8 / 3);
    return num(`A ${name} is emitting gravitational waves at ${f} Hz. How long until it merges, in seconds? (Leading order; 4 significant figures)`, r4(tau),
      `M_c = (m₁m₂)^(3/5)/(m₁ + m₂)^(1/5) = ${r4(Mc / MSUN)} M☉, so τ = (5/256)(GM_c/c³)^(−5/3)(πf)^(−8/3) = ${r4(tau)} s.`,
      `import math\n# Kepler gives the separation at orbital angular frequency pi f; Peters' formula da/dt = -beta / a^3 then runs it to zero\nG, c, Ms = ${G}, ${C}, ${MSUN}\nm1, m2, f = ${m1} * Ms, ${m2} * Ms, ${f}\nM = m1 + m2\nw = math.pi * f\na0 = (G * M / w ** 2) ** (1 / 3)\nbeta = 64 / 5 * G ** 3 * m1 * m2 * M / c ** 5\nN = 100000; h = a0 / N\nprint(sum(((i + .5) * h) ** 3 / beta * h for i in range(N)))`);
  }),

  SKILL('gw.strain', 'Gravitational-wave strain', 'A face-on circular binary at distance r produces h = (4/r)(GM_c/c²)^(5/3)(πf/c)^(2/3).', t => {
    const [name, m1, m2, rMpc] = t.pick([['GW150914-like binary (36 + 29 M☉) at 410 Mpc', 36, 29, 410], ['GW170817-like binary (1.46 + 1.27 M☉) at 40 Mpc', 1.46, 1.27, 40], ['10 + 10 M☉ binary at 500 Mpc', 10, 10, 500]]);
    const f = t.pick([30, 50, 100]), Mc = ((m1 * m2) ** 0.6 / (m1 + m2) ** 0.2) * MSUN, r = rMpc * MPC;
    const h = (4 / r) * ((G * Mc) / C ** 2) ** (5 / 3) * ((Math.PI * f) / C) ** (2 / 3);
    return num(`What strain amplitude does a ${name}, seen face-on, produce at a gravitational-wave frequency of ${f} Hz? Give h × 10²¹. (4 significant figures)`, r4(h * 1e21),
      `h = (4/r)(GM_c/c²)^(5/3)(πf/c)^(2/3) with M_c = ${r4(Mc / MSUN)} M☉: h = ${r4(h)}, so ${r4(h * 1e21)} × 10⁻²¹.`,
      `import math\n# quadrupole formula: h+ = (G / c^4 r) d^2(Ixx - Iyy)/dt^2 for a face-on circular orbit, differentiated numerically\nG, c, Ms, Mpc = ${G}, ${C}, ${MSUN}, ${MPC}\nm1, m2, f, r = ${m1} * Ms, ${m2} * Ms, ${f}, ${rMpc} * Mpc\nM, mu = m1 + m2, m1 * m2 / (m1 + m2)\nw = math.pi * f  # orbital angular frequency\na = (G * M / w ** 2) ** (1 / 3)\nI = lambda t: mu * a * a * (math.cos(w * t) ** 2 - math.sin(w * t) ** 2)\ndt = 1e-5 / f\nprint(G / (c ** 4 * r) * abs(I(dt) - 2 * I(0) + I(-dt)) / dt ** 2 * 1e21)`);
  }),

  // ---- many-body physics ----
  SKILL('mb.fock', 'Counting many-body states', 'N fermions in M orbitals have C(M, N) states; N bosons have C(N + M − 1, N).', t => {
    const M = t.int(4, 10), N = t.int(2, Math.min(5, M)), kind = t.pick(['fermions', 'bosons']);
    const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
    const ans = kind === 'fermions' ? comb(M, N) : comb(N + M - 1, N);
    return num(`How many states are there for ${N} identical spinless ${kind} in ${M} single-particle orbitals?`, ans,
      kind === 'fermions' ? `Each orbital holds 0 or 1 fermion, so choose which ${N} are filled: C(${M}, ${N}) = ${ans}.` : `Bosons can share orbitals: stars and bars gives C(${N} + ${M} − 1, ${N}) = ${ans}.`,
      `import itertools\n# list the occupation patterns directly\nM, N = ${M}, ${N}\nprint(sum(1 for _ in itertools.${kind === 'fermions' ? 'combinations' : 'combinations_with_replacement'}(range(M), N)))`, { rtol: 0, tol: 0, dp: 0 });
  }),

  SKILL('mb.hubbard2', 'The two-site Hubbard model', 'Two electrons on two sites: E₀ = (U − √(U² + 16t²))/2, crossing from a covalent bond to a magnet with J = 4t²/U.', t => {
    const U = t.pick([0, 1, 2, 4, 8, 16]);
    const E0 = (U - Math.sqrt(U * U + 16)) / 2;
    return num(`Two electrons share a two-site Hubbard model with hopping t = 1 and on-site repulsion U = ${U}. What is the ground-state energy (in units of t)? (4 significant figures)`, r4(E0),
      `In the singlet sector the doubly occupied states mix with the covalent state: E₀ = (U − √(U² + 16t²))/2 = ${r4(E0)}.${U >= 8 ? ` For large U this is ≈ −4t²/U = ${r4(-4 / U)}, the Heisenberg exchange.` : ''}`,
      `import math\n# build H on the 2-electron Fock states of 4 spin-orbitals (1up, 1dn, 2up, 2dn) with fermion signs, then Jacobi-diagonalise\nt, U = 1.0, ${U}\nstates = [s for s in range(16) if bin(s).count('1') == 2]\nidx = {s: i for i, s in enumerate(states)}\ndef hop(s, i, j):  # c+_j c_i acting on bitstring s; returns (sign, new) or None\n    if not s >> i & 1 or (s >> j & 1 and i != j): return None\n    s1 = s & ~(1 << i); sign = (-1) ** bin(s1 & ((1 << i) - 1)).count('1')\n    sign *= (-1) ** bin(s1 & ((1 << j) - 1)).count('1')\n    return sign, s1 | (1 << j)\nn = len(states); H = [[0.0] * n for _ in range(n)]\nfor s in states:\n    for (i, j) in [(0, 2), (2, 0), (1, 3), (3, 1)]:\n        r = hop(s, i, j)\n        if r: H[idx[r[1]]][idx[s]] += -t * r[0]\n    H[idx[s]][idx[s]] += U * ((s & 1 and s >> 1 & 1) + (s >> 2 & 1 and s >> 3 & 1))\nfor _ in range(100):  # cyclic Jacobi rotations\n    for p in range(n):\n        for q in range(p + 1, n):\n            if abs(H[p][q]) < 1e-15: continue\n            th = 0.5 * math.atan2(2 * H[p][q], H[q][q] - H[p][p]); c, s_ = math.cos(th), math.sin(th)\n            for k in range(n):\n                hp, hq = H[k][p], H[k][q]; H[k][p], H[k][q] = c * hp - s_ * hq, s_ * hp + c * hq\n            for k in range(n):\n                hp, hq = H[p][k], H[q][k]; H[p][k], H[q][k] = c * hp - s_ * hq, s_ * hp + c * hq\nprint(min(H[i][i] for i in range(n)))`, { tol: 1e-4 });
  }),

  SKILL('mb.ssh', 'The SSH chain', 'Alternating hoppings v, w open a gap 2|v − w|; when w > v an open chain carries two zero-energy edge states.', t => {
    let v, w;
    do { v = t.pick([0.5, 1, 1.5]); w = t.pick([0.5, 1, 1.5, 2]); } while (v === w);
    const ask = t.pick(['gap', 'edge']);
    if (ask === 'edge') return num(`An open SSH chain of 400 unit cells has intra-cell hopping v = ${v} and inter-cell hopping w = ${w} (it starts and ends on a v bond). How many zero-energy edge states does it have?`, w > v ? 2 : 0,
      `The winding number is ${w > v ? 1 : 0} (w ${w > v ? '>' : '<'} v), so there ${w > v ? 'are two edge states, one at each end' : 'are none'}.`,
      `${STURM}# count eigenvalues of the open chain within 1e-6 of zero by Sturm sequences\nN, v, w = 400, ${v}, ${w}\nd = [0.0] * (2 * N)\ne = [v if i % 2 == 0 else w for i in range(2 * N - 1)]\nprint(sturm_count(d, e, 1e-6) - sturm_count(d, e, -1e-6))`, { rtol: 0, tol: 0, dp: 0 });
    return num(`An SSH chain has intra-cell hopping v = ${v} and inter-cell hopping w = ${w}. What is its bulk band gap? (4 significant figures)`, r4(2 * Math.abs(v - w)),
      `The bands are ±|v + w e^(ik)|, closest at k = π: the gap is 2|v − w| = ${r4(2 * Math.abs(v - w))}.`,
      `${STURM}# diagonalise a long open chain; skip any edge states near zero and take the lowest positive bulk level\nN, v, w = 1000, ${v}, ${w}\nd = [0.0] * (2 * N)\ne = [v if i % 2 == 0 else w for i in range(2 * N - 1)]\nk = sturm_count(d, e, 1e-6) + 1\nprint(2 * eig(d, e, k))`);
  }),

  SKILL('mb.bcs', 'The BCS gap', 'Weak-coupling BCS theory fixes the ratio Δ(0) = 1.764 k_B T_c.', t => {
    const [name, Tc] = t.pick([['aluminium', 1.18], ['tin', 3.72], ['indium', 3.41], ['niobium', 9.25], ['lead', 7.19]]);
    const D = 1.764 * KB_MEV * Tc * 1e3, ask = t.pick(['gap', 'edge']);
    const ans = ask === 'gap' ? D : 2 * D;
    return num(`${name[0].toUpperCase() + name.slice(1)} superconducts below ${Tc} K. In weak-coupling BCS theory, what is ${ask === 'gap' ? 'its zero-temperature gap Δ(0)' : 'the minimum energy to break a Cooper pair, 2Δ(0)'}, in meV? (4 significant figures)`, r4(ans),
      `Δ(0) = 1.764 k_B T_c = 1.764 × ${r4(KB_MEV * Tc * 1e3)} meV = ${r4(D)} meV${ask === 'edge' ? `, so 2Δ = ${r4(2 * D)} meV` : ''}. (Lead and niobium are strong-coupling; their measured ratios are larger.)`,
      `import math\n# solve the BCS gap equation: choose the coupling so that Tc comes out right, then solve for Delta at T = 0\nkB, Tc, wD = ${KB_MEV * 1e3}, ${Tc}, 100.0  # meV/K, K, Debye cutoff in meV\ndef inv_lambda(T):  # int_0^wD tanh(x / 2kT) / x dx on a log grid\n    lo, hi, N = math.log(1e-7 * kB * T), math.log(wD), 40000\n    h = (hi - lo) / N\n    return sum(math.tanh(math.exp(lo + (i + .5) * h) / (2 * kB * T)) for i in range(N)) * h + 0.5e-7  # below the grid tanh(x/2kT)/x = 1/2kT\ninvl = inv_lambda(Tc)\nDelta = wD / math.sinh(invl)\nprint(${ask === 'gap' ? 'Delta' : '2 * Delta'})`);
  }),

  // ---- particle physics ----
  SKILL('pp.invmass', 'Invariant mass', 'Two nearly massless particles combine to m² = 2p_T1 p_T2 (cosh Δη − cos Δφ): how resonances such as the Z are found.', t => {
    let pt1, pt2, e1, e2, p1, p2, m;
    do { // keep pairs above 10 GeV, where the muon mass is negligible
      pt1 = r4(20 + t.int(0, 400) / 10); pt2 = r4(20 + t.int(0, 400) / 10);
      e1 = r4(t.int(-240, 240) / 100); e2 = r4(t.int(-240, 240) / 100); p1 = r4(t.int(-314, 314) / 100); p2 = r4(t.int(-314, 314) / 100);
      m = Math.sqrt(2 * pt1 * pt2 * (Math.cosh(e1 - e2) - Math.cos(p1 - p2)));
    } while (m < 10);
    return num(`A collider event has two muons with (p_T, η, φ) = (${pt1} GeV, ${e1}, ${p1}) and (${pt2} GeV, ${e2}, ${p2}). What is their invariant mass, in GeV? (Treat the muons as massless; 4 significant figures)`, r4(m),
      `m² = 2p_T1 p_T2 (cosh Δη − cos Δφ) with Δη = ${r4(e1 - e2)}, Δφ = ${r4(p1 - p2)}: m = ${r4(m)} GeV.${Math.abs(m - 91.19) < 5 ? ' Close to the Z boson.' : ''}`,
      `import math\n# build each muon's four-vector (with its real mass) and add them\nmmu = 0.105658\ndef p4(pt, eta, phi):\n    px, py, pz = pt * math.cos(phi), pt * math.sin(phi), pt * math.sinh(eta)\n    return (math.sqrt(px * px + py * py + pz * pz + mmu * mmu), px, py, pz)\na, b = p4(${pt1}, ${e1}, ${p1}), p4(${pt2}, ${e2}, ${p2})\nE, x, y, z = (a[i] + b[i] for i in range(4))\nprint(math.sqrt(E * E - x * x - y * y - z * z))`);
  }),

  SKILL('pp.threshold', 'Production thresholds', 'On a fixed target, making final mass M needs s = M²: E_beam = (M² − m_b² − m_t²)/2m_t, far more than M.', t => {
    const mp = 938.272, rx = t.pick([
      ['p + p → p + p + π⁰ (proton beam, proton target)', mp, mp, 2 * mp + 134.977],
      ['p + p → p + p + p + p̄ (proton beam, proton target)', mp, mp, 4 * mp],
      ['p + p → p + Λ + K⁺ (proton beam, proton target)', mp, mp, mp + 1115.683 + 493.677],
      ['γ + p → p + π⁰ (photon beam, proton target)', 0, mp, mp + 134.977],
      ['e⁺ + e⁻ → μ⁺ + μ⁻ (positron beam, electron target)', 0.51100, 0.51100, 2 * 105.658],
    ]);
    const [label, mb, mt, M] = rx, E = (M * M - mb * mb - mt * mt) / (2 * mt), T = E - mb;
    return num(`What beam kinetic energy is needed to reach the threshold of ${label}, in MeV? (4 significant figures)`, r4(T),
      `Threshold is s = (Σ m_final)² = ${r4(M)}² MeV². With the target at rest, s = m_b² + m_t² + 2m_t E_b, so E_b = ${r4(E)} MeV and T = E_b − m_b = ${r4(T)} MeV.`,
      `import math\n# bisect on the beam kinetic energy until the invariant mass of beam + target equals the final-state mass\nmb, mt, M = ${mb}, ${mt}, ${M}\ndef sqrt_s(T):\n    E = T + mb; p = math.sqrt(max(E * E - mb * mb, 0.0))\n    return math.sqrt((E + mt) ** 2 - p * p)\nlo, hi = 0.0, 1e6\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if sqrt_s(m) < M else (lo, m)\nprint(lo)`);
  }),

  SKILL('pp.pvalue', 'Significance of an excess', 'With b background expected and n seen, p = P(N ≥ n | b), quoted as a one-sided Gaussian Z; 5σ is discovery.', t => {
    const b = t.pick([3.2, 5, 10, 25]), zt = t.pick([2, 3, 4, 5]), n = Math.max(Math.ceil(b) + 1, Math.round(b + zt * Math.sqrt(b) + zt * zt / 2));
    let term = Math.exp(-b);
    for (let k = 1; k <= n; k++) term *= b / k;
    let p = 0, tk = term;
    for (let k = n; k < n + 600; k++) { p += tk; tk *= b / (k + 1); }
    let lo = -5, hi = 9;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (gaussTail(m) > p) lo = m; else hi = m; }
    const Z = (lo + hi) / 2;
    return num(`A search expects ${b} background events and sees ${n}. What is the significance of the excess, as a one-sided Gaussian Z (in σ)? (4 significant figures)`, r4(Z),
      `p = P(N ≥ ${n} | ${b}) = ${p.toPrecision(3)} from the Poisson tail, which corresponds to Z = ${r4(Z)}σ.${Z >= 5 ? ' Enough to claim a discovery, if the background is right.' : ''}`,
      `import math\n# P(N >= n | b) equals the regularised incomplete gamma P(n, b) = int_0^b t^(n-1) e^-t dt / Gamma(n); then invert erfc\nb, n = ${b}, ${n}\nN = 200000; h = b / N\ns = sum(math.exp((n - 1) * math.log((i + .5) * h) - (i + .5) * h - math.lgamma(n)) for i in range(N)) * h\nlo, hi = -5.0, 9.0\nfor _ in range(100):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if 0.5 * math.erfc(m / math.sqrt(2)) > s else (lo, m)\nprint(lo)`);
  }),

  // ---- Bayesian data analysis ----
  SKILL('bay.beta', 'Beta–binomial updating', 'A Beta(a, b) prior and k successes in n trials give a Beta(a + k, b + n − k) posterior.', t => {
    const a0 = t.pick([1, 2]), b0 = t.pick([1, 2]), n = t.int(10, 40), k = t.int(1, n - 1), p0 = t.pick([0.3, 0.5, 0.7]);
    const a = a0 + k, b = b0 + n - k;
    let lb = 0;
    for (let i = 1; i < a; i++) lb += Math.log(i);
    for (let i = 1; i < b; i++) lb += Math.log(i);
    for (let i = 1; i < a + b; i++) lb -= Math.log(i);
    const P = simpson(x => (x <= 0 || x >= 1 ? 0 : Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lb)), p0, 1, 4000);
    return num(`With a Beta(${a0}, ${b0}) prior on a detector's efficiency p, you see ${k} detections in ${n} trials. What is the posterior probability that p > ${p0}? (4 significant figures)`, r4(P),
      `The posterior is Beta(${a}, ${b}); integrating it from ${p0} to 1 gives ${r4(P)}.`,
      `import math\n# for integer a, b: P(Beta(a, b) > x) = P(Binomial(a + b - 1, x) <= a - 1)\na, b, x = ${a}, ${b}, ${p0}\nm = a + b - 1\nprint(sum(math.comb(m, j) * x ** j * (1 - x) ** (m - j) for j in range(a)))`, { tol: 1e-4 });
  }),

  SKILL('bay.normal', 'Updating a measurement', 'A normal prior and normal data combine by adding precisions: 1/σ²_post = 1/τ² + n/σ².', t => {
    const mu0 = 9.8, tau = t.pick([0.02, 0.05, 0.1]), n = t.pick([5, 10, 20]), sig = t.pick([0.03, 0.06, 0.1]), xb = r4(9.8 + t.int(-8, 8) / 100);
    const prec = 1 / tau ** 2 + n / sig ** 2, mean = (mu0 / tau ** 2 + (n * xb) / sig ** 2) / prec, sd = 1 / Math.sqrt(prec), ask = t.pick(['mean', 'sd']);
    return num(`Your prior for g is ${mu0} ± ${tau} m/s² (normal). You time ${n} drops, each with independent normal error ${sig} m/s², and their mean is ${xb}. What is the posterior ${ask === 'mean' ? 'mean, in m/s²' : 'standard deviation, in m/s²'}? (4 significant figures)`, r4(ask === 'mean' ? mean : sd),
      `Precisions add: 1/${tau}² + ${n}/${sig}² = ${r4(prec)}, so σ_post = ${r4(sd)}; the mean is the precision-weighted average, ${r4(mean)}.`,
      `import math\n# evaluate log prior + log likelihood on a fine grid, normalise, and take moments\nmu0, tau, n, sig, xb = ${mu0}, ${tau}, ${n}, ${sig}, ${xb}\nlo, hi, N = 9.0, 10.6, 160000\nh = (hi - lo) / N\nxs = [lo + (i + .5) * h for i in range(N)]\nlw = [-(x - mu0) ** 2 / (2 * tau ** 2) - n * (x - xb) ** 2 / (2 * sig ** 2) for x in xs]\nmx = max(lw); w = [math.exp(v - mx) for v in lw]; Z = sum(w)\nm = sum(x * q for x, q in zip(xs, w)) / Z\nv = sum((x - m) ** 2 * q for x, q in zip(xs, w)) / Z\nprint(${ask === 'mean' ? 'm' : 'math.sqrt(v)'})`, { tol: 1e-4 });
  }),

  SKILL('bay.ess', 'Effective sample size', 'N draws from a chain with lag-1 autocorrelation ρ (AR(1)) carry about N(1 − ρ)/(1 + ρ) independent samples\' worth of information.', t => {
    const [rho, N] = t.pick([[0.5, 10000], [0.8, 10000], [0.9, 10000], [0.9, 50000], [0.95, 50000], [0.99, 200000]]);
    const ess = (N * (1 - rho)) / (1 + rho);
    return num(`An MCMC chain of ${N.toLocaleString('en-US')} draws behaves like an AR(1) process with lag-1 autocorrelation ${rho}. What is its effective sample size? (4 significant figures)`, r4(ess),
      `The autocorrelation time is (1 + ρ)/(1 − ρ) = ${r4((1 + rho) / (1 - rho))}, so ESS = N(1 − ρ)/(1 + ρ) = ${r4(ess)}. Error bars from the raw N would be ${r4(Math.sqrt(N / ess))} times too small.`,
      `# exact variance of the mean of N AR(1) draws: (1/N^2) sum_ij rho^|i-j|; ESS = 1 / that\nrho, N = ${rho}, ${N}\ns, r = float(N), 1.0\nfor k in range(1, N):\n    r *= rho\n    if r < 1e-18: break\n    s += 2 * (N - k) * r\nprint(N * N / s)`);
  }),

  SKILL('lab.chi2', 'χ² goodness of fit', 'If a model is right, χ² follows the χ² distribution with ν degrees of freedom; the p-value is P(χ²_ν ≥ observed).', t => {
    const nu = t.pick([2, 4, 6, 8, 10, 20]), x = r4(nu * t.pick([0.6, 1, 1.4, 1.8, 2.2]) + t.int(0, 9) / 10);
    let term = 1, s = 0;
    for (let k = 0; k < nu / 2; k++) { s += term; term *= x / 2 / (k + 1); }
    const p = Math.exp(-x / 2) * s;
    return num(`A fit with ${nu} degrees of freedom gives χ² = ${x}. What is the p-value, P(χ²_${nu} ≥ ${x})? (4 significant figures)`, r4(p),
      `For even ν the tail is e^(−x/2) Σ_{k<ν/2} (x/2)^k/k! = ${r4(p)}. ${p < 0.01 ? 'Small: the model or the error bars are wrong.' : p > 0.99 ? 'Suspiciously large: error bars may be overestimated.' : 'Acceptable.'}`,
      `import math\n# integrate the chi-squared density from x upward\nnu, x = ${nu}, ${x}\nk = nu / 2\npdf = lambda y: math.exp((k - 1) * math.log(y) - y / 2 - k * math.log(2) - math.lgamma(k))\nN, top = 200000, x + 400\nh = (top - x) / N\nprint(sum(pdf(x + (i + .5) * h) for i in range(N)) * h)`, { tol: 1e-4 });
  }),
];
