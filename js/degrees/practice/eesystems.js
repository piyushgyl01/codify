/**
 * Electrical Engineering: embedded timing and engineering economics (6.004,
 * NPTEL embedded systems, the FE exam's economics). FE Electrical and
 * Computer: Computer Systems, Engineering Economics.
 *
 * Checks take another route: every prescaler and count tried by brute force,
 * preemptive schedules simulated tick by tick, cash flows discounted year by
 * year, and failure counts enumerated from the binomial distribution.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const money = x => `$${Math.round(x).toLocaleString('en-US')}`;

export const EESYSTEMS = [
  SKILL('emb.timer', 'Timer prescalers', 'A timer interrupt fires at f_clk/(prescaler × count); with a 16-bit counter, pick the prescaler and count that land closest to the target.', t => {
    const fclk = t.pick([8e6, 16e6, 48e6, 72e6]), f = t.pick([1, 10, 50, 100, 440, 1000, 38000]), P = [1, 8, 64, 256, 1024];
    let best = Infinity;
    for (const p of P) {
      const count = Math.min(65536, Math.max(1, Math.round(fclk / (p * f))));
      best = Math.min(best, Math.abs(fclk / (p * count) - f) / f);
    }
    const ppm = best * 1e6;
    return num(`A ${fclk / 1e6} MHz microcontroller has a 16-bit timer (counts 1 to 65 536) with prescalers 1, 8, 64, 256 and 1024. What is the smallest error, in parts per million, with which it can generate a ${f} Hz interrupt? (4 significant figures)`, r4(ppm),
      `For each prescaler p, the best count is f_clk/(p·f) rounded (and within 16 bits); the closest of these gives an error of ${r4(ppm)} ppm.${ppm === 0 ? ' The division is exact.' : ''}`,
      `# try every prescaler with every 16-bit count\nfclk, f = ${fclk}, ${f}\nbest = min(abs(fclk / (p * c) - f) / f for p in (1, 8, 64, 256, 1024) for c in range(1, 65537))\nprint(best * 1e6)`, { tol: 1e-3 });
  }),

  SKILL('emb.rta', 'Real-time response time', 'Under fixed-priority preemption, a task\'s worst response time R solves R = C + Σ ⌈R/T_j⌉C_j over the higher-priority tasks.', t => {
    let T, C, R;
    for (;;) {
      T = t.pickN([5, 10, 20, 25, 40, 50, 100], 3).sort((a, b) => a - b);
      C = T.map(p => t.int(1, Math.max(1, Math.floor(p * 0.3))));
      if (C.reduce((s, c, i) => s + c / T[i], 0) > 0.9) continue;
      R = C[2];
      for (let i = 0; i < 100; i++) { const next = C[2] + Math.ceil(R / T[0]) * C[0] + Math.ceil(R / T[1]) * C[1]; if (next === R) break; R = next; }
      if (R <= T[2]) break;
    }
    return num(`Three periodic tasks run under rate-monotonic priorities: (C, T) = (${C[0]}, ${T[0]}), (${C[1]}, ${T[1]}) and (${C[2]}, ${T[2]}) in milliseconds, all released together at t = 0. What is the worst-case response time of the lowest-priority task, in ms?`, R,
      `Iterate R = ${C[2]} + ⌈R/${T[0]}⌉·${C[0]} + ⌈R/${T[1]}⌉·${C[1]} from R = ${C[2]} until it stops changing: R = ${R} ms, within its ${T[2]} ms deadline.`,
      `# simulate the preemptive schedule one millisecond at a time from the critical instant\nC, T = ${JSON.stringify(C)}, ${JSON.stringify(T)}\nleft = [0, 0, 0]\nfor t in range(10000):\n    for i in range(3):\n        if t % T[i] == 0 and i < 2: left[i] += C[i]\n    if t == 0: left[2] = C[2]\n    for i in range(3):\n        if left[i] > 0:\n            left[i] -= 1\n            break\n    if left[2] == 0:\n        print(t + 1); break`, { rtol: 0, tol: 0, dp: 0 });
  }),

  SKILL('econ.npv', 'Present worth and life-cycle cost', 'Money later is worth less now: a uniform annual amount A over N years at rate i is worth A(1 − (1+i)^−N)/i today.', t => {
    const r = t.pick([0.04, 0.06, 0.08, 0.1]), N = t.pick([5, 10, 15, 20]), af = (1 - (1 + r) ** -N) / r, ask = t.pick(['npv', 'lcc']);
    if (ask === 'npv') {
      const C0 = t.pick([10, 25, 50, 100]) * 1e3, S = t.int(3, 25) * 1e3, npv = -C0 + S * af;
      return num(`An efficiency upgrade costs ${money(C0)} now and saves ${money(S)} a year for ${N} years. At a ${r * 100}% discount rate, what is its net present value, in dollars? (4 significant figures)`, r4(npv),
        `NPV = −${money(C0)} + ${money(S)} × (1 − 1.${String(Math.round(r * 100)).padStart(2, '0')}^−${N})/${r} = ${money(npv)}. ${npv > 0 ? 'Positive: worth doing at this rate.' : 'Negative: not worth it at this rate.'}`,
        `# discount each year's saving separately\nC0, S, r, N = ${C0}, ${S}, ${r}, ${N}\nprint(-C0 + sum(S / (1 + r) ** y for y in range(1, N + 1)))`);
    }
    const PA = t.pick([2, 3, 5]) * 1e3, PB = PA + t.pick([1, 2, 4]) * 1e3, EA = t.pick([800, 1200, 2000]), EB = Math.round(EA * t.pick([0.4, 0.6, 0.75]));
    const diff = PB + EB * af - (PA + EA * af);
    return num(`Motor A costs ${money(PA)} and ${money(EA)} a year to run; motor B costs ${money(PB)} and ${money(EB)} a year. Over ${N} years at ${r * 100}%, by how much does B's life-cycle cost exceed A's, in present dollars? (Negative means B is cheaper; 4 significant figures)`, r4(diff),
      `Life-cycle cost = price + running cost × (1 − (1+i)^−N)/i. B − A = ${money(PB - PA)} + (${money(EB - EA)}) × ${r4(af)} = ${money(diff)}.`,
      `# discount every year's running cost for both motors and compare the totals\nPA, PB, EA, EB, r, N = ${PA}, ${PB}, ${EA}, ${EB}, ${r}, ${N}\ncost = lambda P, E: P + sum(E / (1 + r) ** y for y in range(1, N + 1))\nprint(cost(PB, EB) - cost(PA, EA))`);
  }),

  SKILL('econ.risk', 'Failure risk over a lifetime', 'With independent yearly failure probability p, the chance of at least one failure in N years is 1 − (1 − p)^N, and the expected number is Np.', t => {
    const p = t.pick([0.01, 0.02, 0.05, 0.1]), N = t.pick([5, 10, 20]), ask = t.pick(['any', 'cost']);
    if (ask === 'any') {
      const P = (1 - (1 - p) ** N) * 100;
      return num(`A component fails in any given year with probability ${p}, independently. What is the probability, in percent, that it fails at least once in ${N} years? (4 significant figures)`, r4(P),
        `P(at least one) = 1 − (1 − ${p})^${N} = ${r4(P)}% — well above N·p = ${r4(N * p * 100)}% would suggest if failures could not repeat.`,
        `import math\n# add up the binomial probabilities of 1, 2, ..., N failures\np, N = ${p}, ${N}\nprint(100 * sum(math.comb(N, k) * p ** k * (1 - p) ** (N - k) for k in range(1, N + 1)))`);
    }
    const cost = t.pick([10, 50, 200]) * 1e3, E = N * p * cost;
    return num(`A component fails in any given year with probability ${p}, independently, and each failure costs ${money(cost)} to repair. What is the expected total repair cost over ${N} years, in dollars (undiscounted)? (4 significant figures)`, r4(E),
      `By linearity, the expected number of failures is N·p = ${r4(N * p)}, so the expected cost is ${money(E)}.`,
      `import math\n# enumerate the number of failures with its binomial probability\np, N, cost = ${p}, ${N}, ${cost}\nprint(sum(k * cost * math.comb(N, k) * p ** k * (1 - p) ** (N - k) for k in range(N + 1)))`);
  }),
];
