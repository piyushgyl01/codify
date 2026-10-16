/**
 * CS440 Human–Computer Interaction — the quantitative side of HCI: Fitts's
 * and Hick's laws, the keystroke-level model, the System Usability Scale,
 * how many users a usability test needs, a confidence interval for task
 * success, and WCAG 2.2 target size. CS2023 HCI-User, HCI-Evaluation,
 * HCI-Accessibility.
 *
 * Checks are separate Python implementations of each published formula.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const r = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

export const HCI = [
  SKILL('hci.fitts', "Fitts's law", 'Pointing time grows with distance and shrinks with target size: MT = a + b·log₂(D/W + 1).', t => {
    const a = t.pick([50, 100, 150]), b = t.pick([100, 150, 200]), D = t.pick([100, 200, 400, 800]), W = t.pick([10, 20, 40, 80]);
    const mt = a + b * Math.log2(D / W + 1);
    return num(`With a = ${a} ms and b = ${b} ms/bit, how long does it take to point at a ${W} px target ${D} px away? (Shannon form, 2 decimal places)`, r(mt),
      `ID = log₂(${D}/${W} + 1) = ${Math.log2(D / W + 1).toFixed(3)} bits; MT = ${a} + ${b} × ${Math.log2(D / W + 1).toFixed(3)} = ${r(mt)} ms. Doubling the target width saves as much as halving the distance — why screen edges and big buttons are fast.`,
      `import math\nprint(${a} + ${b} * math.log(${D} / ${W} + 1, 2))`, { tol: 0.006, dp: 2 });
  }),

  SKILL('hci.hick', "Hick's law", 'Choice time grows with the log of the number of equally likely options.', t => {
    const a = t.pick([200, 250, 300]), b = t.pick([100, 150, 200]), n = t.int(2, 16);
    const rt = a + b * Math.log2(n + 1);
    return num(`Reaction time is a + b·log₂(n + 1) with a = ${a} ms and b = ${b} ms. How long to choose among ${n} equally likely options? (2 decimal places)`, r(rt),
      `${a} + ${b} × log₂ ${n + 1} = ${r(rt)} ms. Doubling a menu adds a constant, not double the time — but only for familiar, equally likely options.`,
      `import math\nprint(${a} + ${b} * math.log2(${n} + 1))`, { tol: 0.006, dp: 2 });
  }),

  SKILL('hci.klm', 'The keystroke-level model', 'Predict expert task time by adding up operators.', t => {
    const OPS = { K: 0.28, P: 1.1, H: 0.4, M: 1.35, B: 0.1 };
    const seq = Array.from({ length: t.int(5, 10) }, () => t.pick(['K', 'K', 'P', 'H', 'M', 'B']));
    const total = seq.reduce((s, o) => s + OPS[o], 0);
    return num(`KLM operators: K (keystroke) 0.28 s, P (point) 1.1 s, H (move hand to device) 0.4 s, M (mental preparation) 1.35 s, B (button press) 0.1 s. How long does the sequence ${seq.join(' ')} take? (2 decimal places)`, r(total),
      `Add the operator times: ${seq.map(o => OPS[o]).join(' + ')} = ${r(total)} s. Removing an M (a decision) often saves more than removing several keystrokes.`,
      `T = {'K': 0.28, 'P': 1.1, 'H': 0.4, 'M': 1.35, 'B': 0.1}\nprint(sum(T[o] for o in ${PY(seq)}))`, { tol: 0.006, dp: 2 });
  }),

  SKILL('hci.sus', 'The System Usability Scale', 'Score ten 1–5 answers the SUS way: odd items positive, even items negative, ×2.5.', t => {
    const resp = Array.from({ length: 10 }, () => t.int(1, 5));
    const score = resp.reduce((s, x, i) => s + (i % 2 === 0 ? x - 1 : 5 - x), 0) * 2.5;
    return num(`One participant's SUS answers (items 1–10, each 1–5): ${resp.join(', ')}. What is their SUS score?`, score,
      `Odd items score (answer − 1), even items (5 − answer); sum and multiply by 2.5: ${score}. Around 68 is average; it is not a percentage.`,
      `a = ${PY(resp)}\nprint(2.5 * (sum(a[i] - 1 for i in range(0, 10, 2)) + sum(5 - a[i] for i in range(1, 10, 2))))`, { tol: 0.01, dp: 1 });
  }),

  SKILL('hci.users', 'How many test users', 'The share of problems found by n users: 1 − (1 − L)ⁿ.', t => {
    const L = t.pick([0.15, 0.2, 0.25, 0.31, 0.4]);
    if (t.rng() < 0.5) {
      const n = t.int(1, 8), p = 1 - (1 - L) ** n;
      return num(`Each user uncovers a given usability problem with probability ${L}. What share of the problems do ${n} users find, on average? (4 decimal places)`, r(p, 4),
        `1 − (1 − ${L})^${n} = ${r(p, 4)}. The curve flattens fast: several small rounds beat one big study.`,
        `from fractions import Fraction as F\nL = F('${L}')\nmissed = F(1)\nfor _ in range(${n}):\n    missed *= 1 - L\nprint(float(1 - missed))`, { tol: 0.0001, dp: 4 });
    }
    const target = t.pick([0.75, 0.85, 0.9, 0.95]);
    let n = 1; while (1 - (1 - L) ** n < target) n++;
    return num(`Each user uncovers a given problem with probability ${L}. How many users do you need to find at least ${target * 100}% of problems on average?`, n,
      `Find the smallest n with 1 − (1 − ${L})ⁿ ≥ ${target}: n = ${n}.`,
      `import math\nn = 1\nwhile 1 - (1 - ${L}) ** n < ${target}: n += 1\nprint(n)`);
  }),

  SKILL('hci.ci', 'Task success with small samples', 'An adjusted-Wald 95% interval for a completion rate.', t => {
    const n = t.int(5, 20), k = t.int(Math.max(0, n - 6), n), z = 1.96;
    const pAdj = (k + z * z / 2) / (n + z * z), nAdj = n + z * z, half = z * Math.sqrt(pAdj * (1 - pAdj) / nAdj);
    const lo = Math.max(0, pAdj - half);
    return num(`${k} of ${n} participants completed the task. What is the lower bound of the adjusted-Wald 95% confidence interval for the completion rate? (4 decimal places)`, r(lo, 4),
      `Add z²/2 successes and z² trials: p̂ = (${k} + 1.92) / (${n} + 3.84) = ${pAdj.toFixed(4)}; margin = 1.96 √(p̂(1 − p̂)/${nAdj.toFixed(2)}) = ${half.toFixed(4)}; lower bound ${r(lo, 4)}. With small samples, "${k}/${n}" is a wide range.`,
      `import math\nk, n, z = ${k}, ${n}, 1.96\np = (k + z * z / 2) / (n + z * z)\nprint(max(0.0, p - z * math.sqrt(p * (1 - p) / (n + z * z))))`, { tol: 0.0001, dp: 4 });
  }),

  SKILL('hci.target', 'Target size (WCAG 2.2)', 'Interactive targets need 24×24 CSS pixels — or enough spacing that a 24 px circle around each does not overlap its neighbour.', t => {
    const w = t.pick([16, 20, 24, 32, 44]), h = t.pick([16, 20, 24, 32]), gap = t.pick([0, 4, 8, 12]);
    const big = w >= 24 && h >= 24, spaced = w + gap >= 24;   // centres of neighbours in a row are w + gap apart
    const ok = big || spaced;
    return { kind: 'mc', q: `A row of icon buttons, each ${w}×${h} CSS px, with ${gap} px between them. Do they meet WCAG 2.2 success criterion 2.5.8 (Target Size, Minimum)?`, options: ok ? ['Yes', 'No'] : ['No', 'Yes'], correct: 0,
      explain: big ? 'Each target is at least 24×24, so it passes outright.' : spaced ? `They are smaller than 24×24, but neighbouring centres are ${w} + ${gap} = ${w + gap} px apart, so a 24 px circle centred on each touches neither its neighbour nor the neighbour's circle — the spacing exception applies.` : `They are under 24×24 and their centres are only ${w + gap} px apart, so 24 px circles around them overlap: fail.`,
      python: `import math\nw, h, gap = ${w}, ${h}, ${gap}\nif w >= 24 and h >= 24:\n    ok = True\nelse:\n    # three buttons in a row; a 24 px circle on each centre must not meet another target or another circle\n    rects = [(i * (w + gap), 0, i * (w + gap) + w, h) for i in range(3)]\n    centres = [((x0 + x1) / 2, (y0 + y1) / 2) for x0, y0, x1, y1 in rects]\n    def dist_to_rect(c, r):\n        dx = max(r[0] - c[0], 0, c[0] - r[2]); dy = max(r[1] - c[1], 0, c[1] - r[3])\n        return math.hypot(dx, dy)\n    ok = all(math.dist(centres[i], centres[j]) >= 24 and dist_to_rect(centres[i], rects[j]) >= 12 for i in range(3) for j in range(3) if i != j)\nprint('Yes' if ok else 'No')` };
  }),
];
