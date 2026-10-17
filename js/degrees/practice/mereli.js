/**
 * Mechanical Engineering: reliability, safety and engineering economy
 * (22.38, 16.63J, ESD.932; FE Mechanical topics 2, 4, 9.J and 14.K).
 *
 * Checks take another route: Weibull life by integrating the reliability and
 * the hazard, damage by bisecting on the S–N line, crack growth by
 * integrating Paris's law numerically, availability from a Markov chain's
 * balance equations, failure rates by maximising the likelihood, interference
 * by a numerical double integral, loan payments by running the amortisation
 * schedule, internal rates of return by Newton's method instead of
 * bisection, annual worths by repeating both alternatives over a common
 * horizon, and test plans from the binomial recurrence.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const EXACT = { rtol: 0, tol: 0, dp: 0 };
const lgamma = x => { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp); let s = 1.000000000190015; for (const v of c) s += v / ++y; return -tmp + Math.log(2.5066282746310005 * s / x); };
const tail = x => { const b = Math.max(x, 0) + 12, n = 20000, h = (b - x) / n, f = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); let s = f(x) + f(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(x + i * h); return s * h / 3; };

export const MERELI = [
  SKILL('rel.weibull', 'Weibull reliability', 'Many lives follow R(t) = e^(−(t/η)^β): β < 1 for early failures, β = 1 for random ones, β > 1 for wear-out. The B10 life is η(−ln 0.9)^(1/β); the mean is ηΓ(1 + 1/β).', t => {
    const beta = t.pick([0.8, 1.5, 2, 2.5, 3.5]), eta = t.pick([1000, 5000, 10000, 20000]), T = Math.round(eta * t.pick([0.2, 0.5, 0.8, 1.2])), ask = t.pick(['R', 'B10', 'mttf']);
    const R = Math.exp(-((T / eta) ** beta)), B10 = eta * (-Math.log(0.9)) ** (1 / beta), mttf = eta * Math.exp(lgamma(1 + 1 / beta));
    return num(`A bearing population follows a Weibull distribution with shape β = ${beta} and scale η = ${eta} h. What is ${{ R: `the probability one survives ${T} h`, B10: 'its B10 life (10% failed), in hours', mttf: 'its mean life, in hours' }[ask]}? (4 significant figures)`, r4({ R, B10, mttf }[ask]),
      `R(${T}) = e^(−(${T}/${eta})^${beta}) = ${r4(R)}. B10 = η(−ln 0.9)^(1/β) = ${r4(B10)} h. Mean = ηΓ(1 + 1/β) = ${r4(mttf)} h.`,
      `import math\nbeta, eta, T = ${beta}, ${eta}, ${T}\n# survival from the cumulative hazard, integrated numerically; the mean as the area under R(t)\nh = lambda t: beta / eta * (t / eta) ** (beta - 1)\nH = lambda t, n=200000: sum(h((i + 0.5) * t / n) * t / n for i in range(n))\nR = lambda t: math.exp(-((t / eta) ** beta))\n${{ R: 'print(math.exp(-H(T)))', B10: 'lo, hi = 0.0, 100 * eta\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if R(m) > 0.9 else (lo, m)\nprint(lo)', mttf: 'top = 60 * eta; n = 200000; dt = top / n\nprint((R(0) + R(top) + sum((4 if i % 2 else 2) * R(i * dt) for i in range(1, n))) * dt / 3)' }[ask]}`);
  }),

  SKILL('rel.miner', 'Cumulative fatigue: Miner\'s rule', 'Each block of cycles at stress σᵢ uses up nᵢ/Nᵢ of the life, with Nᵢ from the S–N curve; failure is predicted when the fractions sum to 1.', t => {
    const sf = t.pick([800, 900, 1000]), b = t.pick([-0.085, -0.09, -0.1]), k = t.int(2, 3), sig = Array.from({ length: k }, () => t.pick([300, 350, 400, 450, 500])), n = sig.map(() => t.pick([1000, 2000, 5000, 10000]));
    const N = sig.map(s => 0.5 * (s / sf) ** (1 / b)), D = n.reduce((a, v, i) => a + v / N[i], 0), ask = t.pick(['D', 'blocks']);
    return num(`A shaft's S–N curve is σ_a = ${sf}(2N)^${b} MPa (Basquin). Each duty block applies ${sig.map((s, i) => `${n[i]} cycles at ${s} MPa`).join(', ')}. By Miner's rule, ${ask === 'D' ? 'what fraction of the life does one block use' : 'how many blocks will it survive'}? (4 significant figures)`, r4(ask === 'D' ? D : 1 / D),
      `Lives: ${N.map(v => r4(v)).join(', ')} cycles from N = ½(σ/${sf})^(1/b). Damage per block Σnᵢ/Nᵢ = ${r4(D)}, so ${r4(1 / D)} blocks.`,
      `import math\n# find each life by bisecting on log N along the S-N curve, then add the damage\nsf, b, sig, n = ${sf}, ${b}, ${JSON.stringify(sig)}, ${JSON.stringify(n)}\ndef life(s):\n    lo, hi = 0.0, 30.0\n    for _ in range(200):\n        m = (lo + hi) / 2\n        lo, hi = (m, hi) if sf * (2 * 10 ** m) ** b > s else (lo, m)\n    return 10 ** lo\nD = sum(ni / life(s) for s, ni in zip(sig, n))\nprint(${ask === 'D' ? 'D' : '1 / D'})`);
  }),

  SKILL('rel.paris', 'Fatigue crack growth: Paris\'s law', 'A crack grows by da/dN = C(ΔK)^m with ΔK = YΔσ√(πa), until K_max reaches the toughness. Integrating gives the cycles left — most of them spent while the crack is still small.', t => {
    const C = 6.9e-12, m = 3, Y = t.pick([1, 1.12]), ds = t.pick([80, 100, 150, 200]), a0 = t.pick([0.5, 1, 2]) / 1000, KIC = t.pick([50, 60, 80, 100]), ask = t.pick(['N', 'ac']);
    const ac = (KIC / (Y * ds)) ** 2 / Math.PI, N = (ac ** (1 - m / 2) - a0 ** (1 - m / 2)) / (C * (Y * ds * Math.sqrt(Math.PI)) ** m * (1 - m / 2));
    return num(`A steel plate (K_IC = ${KIC} MPa√m, Paris constants C = 6.9 × 10⁻¹² m/cycle and m = 3 with ΔK in MPa√m) has a ${a0 * 1000} mm crack with Y = ${Y}. It sees stress cycling from 0 to ${ds} MPa. ${ask === 'N' ? 'How many cycles until it fractures?' : 'At what crack length does it fracture, in mm?'} (4 significant figures)`, r4(ask === 'N' ? N : ac * 1000),
      `Critical length a_c = (K_IC/(YΔσ))²/π = ${r4(ac * 1000)} mm. N = ∫ da/(C(YΔσ√(πa))^m) from a₀ to a_c = ${r4(N)} cycles.`,
      `import math\n# integrate the growth law numerically in the crack length (Simpson in sqrt(a) to tame the start)\nC, m, Y, ds, a0, KIC = 6.9e-12, 3, ${Y}, ${ds}, ${a0}, ${KIC}\nlo, hi = 1e-9, 10.0\nfor _ in range(200):\n    mid = (lo + hi) / 2\n    lo, hi = (mid, hi) if Y * ds * math.sqrt(math.pi * mid) < KIC else (lo, mid)\nac = lo\n# substitute a = s^2: da = 2 s ds\nf = lambda s: 2 * s / (C * (Y * ds * math.sqrt(math.pi) * s) ** m)\nn = 20000; s0, s1 = math.sqrt(a0), math.sqrt(ac); h = (s1 - s0) / n\nN = (f(s0) + f(s1) + sum((4 if i % 2 else 2) * f(s0 + i * h) for i in range(1, n))) * h / 3\nprint(${ask === 'N' ? 'N' : 'ac * 1000'})`);
  }),

  SKILL('rel.availability', 'Availability of redundant systems', 'A repairable unit is up a fraction A = MTBF/(MTBF + MTTR) of the time. With independent repairs, a 1-of-2 system is down only when both are: 1 − (1 − A)².', t => {
    const mtbf = t.pick([500, 1000, 2000, 5000]), mttr = t.pick([4, 8, 24, 48, 72]), cfg = t.pick(['1of2', '2of3', 'single']), ask = t.pick(['A', 'down']);
    const A = mtbf / (mtbf + mttr), As = { single: A, '1of2': 1 - (1 - A) ** 2, '2of3': A ** 3 + 3 * A * A * (1 - A) }[cfg], down = (1 - As) * 8760;
    const desc = { single: 'a single repairable pump', '1of2': 'two identical pumps where either one suffices, each with its own repair crew', '2of3': 'three identical pumps where any two suffice, each with its own repair crew' }[cfg];
    return num(`A cooling system has ${desc}. Each pump has MTBF ${mtbf} h and MTTR ${mttr} h (exponential failure and repair). What is ${ask === 'A' ? 'the steady-state availability of the system' : 'its expected downtime, in hours per year'}? (4 significant figures)`, r4(ask === 'A' ? As : down),
      `Unit availability A = ${mtbf}/(${mtbf} + ${mttr}) = ${r4(A)}. System: ${r4(As)}; downtime (1 − A_sys)·8760 = ${r4(down)} h/yr.`,
      `# a Markov chain on the number of failed pumps, solved for its steady state from the balance equations\nlam, mu = 1 / ${mtbf}, 1 / ${mttr}\nn, need = ${{ single: '1, 1', '1of2': '2, 1', '2of3': '3, 2' }[cfg]}\n# birth-death: failed k -> k+1 at (n - k) lam, k -> k-1 at k mu (each pump has its own crew)\np = [1.0]\nfor k in range(n):\n    p.append(p[-1] * (n - k) * lam / ((k + 1) * mu))\ns = sum(p); p = [v / s for v in p]\nup = sum(p[k] for k in range(n + 1) if n - k >= need)\nprint(${ask === 'A' ? 'up' : '(1 - up) * 8760'})`);
  }),

  SKILL('rel.censored', 'Estimating failure rates from censored tests', 'When a test stops before every unit fails, the survivors still count: for a constant failure rate, λ̂ = r/(total time on test), so MTBF = (Σtᵢ + survivors × T)/r.', t => {
    const n = t.int(8, 15), r = t.int(3, Math.min(6, n - 2)), T = t.pick([500, 1000, 2000]), times = Array.from({ length: r }, () => t.int(Math.round(T * 0.05), T - 1)).sort((a, b) => a - b);
    const ttt = times.reduce((a, v) => a + v, 0) + (n - r) * T, mtbf = ttt / r;
    return num(`${n} actuators are tested for ${T} h. ${r} fail, at ${times.join(', ')} h; the rest are still working when the test stops. Assuming a constant failure rate, what is the maximum-likelihood estimate of the MTBF, in hours? (4 significant figures)`, r4(mtbf),
      `Total time on test = Σ failure times + survivors × T = ${times.reduce((a, v) => a + v, 0)} + ${n - r}·${T} = ${ttt} h. λ̂ = r/TTT, so MTBF = ${r4(mtbf)} h — ignoring the survivors would badly underestimate it.`,
      `import math\n# maximise the likelihood: failures contribute lam e^(-lam t), survivors e^(-lam T)\nn, T, times = ${n}, ${T}, ${JSON.stringify(times)}\nll = lambda lam: sum(math.log(lam) - lam * t for t in times) - (n - len(times)) * lam * T\nlo, hi, g = 1e-9, 1.0, (5 ** 0.5 - 1) / 2\nfor _ in range(300):\n    a, b = hi - g * (hi - lo), lo + g * (hi - lo)\n    lo, hi = (a, hi) if ll(a) < ll(b) else (lo, b)\nprint(1 / ((lo + hi) / 2))`);
  }),

  SKILL('rel.interference', 'Stress–strength interference', 'A part fails when the load exceeds its strength. With both normal, failure probability is Φ(−β) with reliability index β = (μ_S − μ_L)/√(σ_S² + σ_L²).', t => {
    const muS = t.pick([400, 500, 600]), sS = t.pick([20, 30, 40, 50]), muL = Math.round(muS * t.pick([0.6, 0.7, 0.75, 0.8])), sL = t.pick([15, 20, 30, 40]), ask = t.pick(['beta', 'pf']);
    const beta = (muS - muL) / Math.sqrt(sS * sS + sL * sL), pf = tail(beta);
    return num(`A bracket's strength is normal with mean ${muS} MPa and standard deviation ${sS} MPa; the stress it sees is normal with mean ${muL} MPa and standard deviation ${sL} MPa, independent of the strength. What is ${ask === 'beta' ? 'the reliability index β' : 'the probability of failure'}? (4 significant figures)`, r4(ask === 'beta' ? beta : pf),
      `β = (${muS} − ${muL})/√(${sS}² + ${sL}²) = ${r4(beta)}; P_f = Φ(−β) = ${r4(pf)}.`,
      ask === 'beta' ? `import math\n# the margin S - L is normal: its mean over its standard deviation, from the variance of a difference built by numerical integration\nmuS, sS, muL, sL = ${muS}, ${sS}, ${muL}, ${sL}\n# variance of S - L as E[(S-L)^2] - (E[S-L])^2 by integrating over both densities on a grid\nn = 400; zs = [-8 + 16 * (i + 0.5) / n for i in range(n)]; w = [math.exp(-z * z / 2) / math.sqrt(2 * math.pi) * 16 / n for z in zs]\nm1 = sum(wa * wb * ((muS + sS * za) - (muL + sL * zb)) for za, wa in zip(zs, w) for zb, wb in zip(zs, w))\nm2 = sum(wa * wb * ((muS + sS * za) - (muL + sL * zb)) ** 2 for za, wa in zip(zs, w) for zb, wb in zip(zs, w))\nprint(m1 / math.sqrt(m2 - m1 * m1))`
        : `import math\n# integrate the load density times the chance the strength is below that load\nmuS, sS, muL, sL = ${muS}, ${sS}, ${muL}, ${sL}\nfL = lambda x: math.exp(-((x - muL) / sL) ** 2 / 2) / (sL * math.sqrt(2 * math.pi))\nFS = lambda x: 0.5 * math.erfc(-(x - muS) / (sS * math.sqrt(2)))\na, b, n = muL - 12 * sL, muL + 12 * sL, 200000; h = (b - a) / n\nprint((fL(a) * FS(a) + fL(b) * FS(b) + sum((4 if i % 2 else 2) * fL(a + i * h) * FS(a + i * h) for i in range(1, n))) * h / 3)`);
  }),

  SKILL('econ.annuity', 'Loans and capital recovery', 'A present sum P repaid over n periods at rate i costs A = P·i(1 + i)ⁿ/((1 + i)ⁿ − 1) per period — the capital recovery factor.', t => {
    const P = t.pick([50000, 100000, 250000, 1e6]), i = t.pick([0.04, 0.05, 0.06, 0.08, 0.1]), n = t.pick([5, 8, 10, 15, 20]), ask = t.pick(['A', 'interest']);
    const A = P * i * (1 + i) ** n / ((1 + i) ** n - 1), interest = A * n - P;
    return num(`A $${P.toLocaleString('en-US')} machine is financed at ${i * 100}% a year over ${n} years with equal end-of-year payments. What is ${ask === 'A' ? 'the annual payment, in $' : 'the total interest paid, in $'}? (4 significant figures)`, r4(ask === 'A' ? A : interest),
      `A = P·i(1 + i)ⁿ/((1 + i)ⁿ − 1) = ${r4(A)} $/yr; over ${n} years that is ${r4(A * n)}, of which ${r4(interest)} is interest.`,
      `# run the amortisation schedule and bisect on the payment until the balance reaches zero\nP, i, n = ${P}, ${i}, ${n}\ndef left(A):\n    b = P\n    for _ in range(n): b = b * (1 + i) - A\n    return b\nlo, hi = 0.0, P\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if left(m) > 0 else (lo, m)\nprint(${ask === 'A' ? 'lo' : 'lo * n - P'})`);
  }),

  SKILL('econ.irr', 'Internal rate of return', 'The IRR is the discount rate at which a project\'s net present value is zero. Compare it with the minimum attractive rate of return to decide.', t => {
    const C0 = t.pick([20000, 50000, 100000, 200000]), n = t.pick([5, 8, 10]), S = Math.round(C0 * t.pick([0.15, 0.2, 0.25, 0.3]) / 100) * 100, salvage = Math.round(C0 * t.pick([0, 0.1, 0.2]) / 100) * 100;
    const npv = r => -C0 + Array.from({ length: n }, (_, k) => S / (1 + r) ** (k + 1)).reduce((a, v) => a + v, 0) + salvage / (1 + r) ** n;
    let lo = -0.5, hi = 2; for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (npv(m) > 0) lo = m; else hi = m; }
    return num(`An upgrade costs $${C0.toLocaleString('en-US')} now, saves $${S.toLocaleString('en-US')} a year for ${n} years, and is sold for $${salvage.toLocaleString('en-US')} at the end. What is its internal rate of return, in percent? (4 significant figures)`, r4(lo * 100),
      `Solve −${C0} + Σ ${S}/(1 + r)^k + ${salvage}/(1 + r)^${n} = 0: r = ${r4(lo * 100)}%.`,
      `# Newton's method on the net present value, with a numerical derivative\nC0, S, n, salvage = ${C0}, ${S}, ${n}, ${salvage}\nnpv = lambda r: -C0 + sum(S / (1 + r) ** k for k in range(1, n + 1)) + salvage / (1 + r) ** n\nr = 0.1\nfor _ in range(100):\n    d = (npv(r + 1e-7) - npv(r - 1e-7)) / 2e-7\n    r -= npv(r) / d\nprint(r * 100)`);
  }),

  SKILL('econ.eaw', 'Comparing alternatives with different lives', 'Alternatives with unequal lives compare fairly by equivalent annual worth, A = (P − S/(1 + i)ⁿ)·CRF + annual cost — which assumes each can be repeated like for like.', t => {
    const i = t.pick([0.06, 0.08, 0.1, 0.12]), A = [t.pick([20000, 30000, 40000]), t.pick([3000, 5000, 6000]), t.pick([3, 4, 6]), t.pick([0, 2000, 4000])], B = [t.pick([50000, 60000, 80000]), t.pick([1500, 2000, 3000]), t.pick([6, 8, 12]), t.pick([0, 5000, 10000])], which = t.pick(['A', 'B']);
    const crf = n => i * (1 + i) ** n / ((1 + i) ** n - 1), eaw = ([P, c, n, s]) => (P - s / (1 + i) ** n) * crf(n) + c, alt = which === 'A' ? A : B;
    const d = ([P, c, n, s], name) => `${name}: $${P.toLocaleString('en-US')} first cost, $${c.toLocaleString('en-US')} a year to run, ${n}-year life, $${s.toLocaleString('en-US')} salvage`;
    return num(`Two compressors are compared at a ${i * 100}% interest rate. ${d(A, 'A')}. ${d(B, 'B')}. What is the equivalent annual cost of ${which}, in $ per year? (4 significant figures)`, r4(eaw(alt)),
      `EAC = (P − S/(1 + i)ⁿ)·CRF(n) + annual cost. A: ${r4(eaw(A))} $/yr; B: ${r4(eaw(B))} $/yr. ${eaw(A) < eaw(B) ? 'A' : 'B'} is cheaper per year.`,
      `import math\n# repeat the alternative over the least common multiple of both lives, discount every cash flow, then spread the total evenly\ni, A, B = ${i}, ${JSON.stringify(A)}, ${JSON.stringify(B)}\nH = A[2] * B[2] // math.gcd(A[2], B[2])\nP, c, n, s = ${which}\npw = 0.0\nfor start in range(0, H, n):\n    pw += P / (1 + i) ** start - s / (1 + i) ** (start + n)\npw += sum(c / (1 + i) ** t for t in range(1, H + 1))\nprint(pw * i * (1 + i) ** H / ((1 + i) ** H - 1))`);
  }),

  SKILL('cap.successrun', 'How many tests demonstrate reliability?', 'To show reliability R with confidence C, enough units must pass: with no failures allowed, n ≥ ln(1 − C)/ln R. Each failure allowed raises n further.', t => {
    const R = t.pick([0.9, 0.95, 0.97, 0.99]), C = t.pick([0.8, 0.9, 0.95]), f = t.pick([0, 0, 1, 2]);
    const lc = (n, k) => lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1), cdf = n => { let s = 0; for (let k = 0; k <= f; k++) s += Math.exp(lc(n, k) + k * Math.log(1 - R) + (n - k) * Math.log(R)); return s; };
    let n = f + 1; while (cdf(n) > 1 - C + 1e-12) n++;
    return num(`A capstone team must show their latch is at least ${R * 100}% reliable with ${C * 100}% confidence, by testing units to the duty cycle${f ? ` and allowing up to ${f} failure${f > 1 ? 's' : ''}` : ' with no failures allowed'}. What is the smallest number of units they must test?`, n,
      `They need P(at most ${f} failures | R = ${R}) ≤ ${r4(1 - C)}. ${f === 0 ? `With no failures: n ≥ ln(1 − C)/ln R = ${r4(Math.log(1 - C) / Math.log(R))}, so ${n}.` : `Searching the binomial distribution gives n = ${n}.`}`,
      `# binomial probabilities by the recurrence p(k+1) = p(k) (n-k)/(k+1) q/R\nR, C, f = ${R}, ${C}, ${f}\nq = 1 - R\nn = f + 1\nwhile True:\n    p = R ** n; s = p\n    for k in range(f):\n        p *= (n - k) / (k + 1) * q / R; s += p\n    if s <= 1 - C + 1e-12: break\n    n += 1\nprint(n)`, EXACT);
  }),
];
