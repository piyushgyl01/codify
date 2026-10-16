/**
 * CS401 Theory of Computation — Sipser-style questions with exact answers:
 * DFAs and the strings they accept, regular expressions, the subset
 * construction, DFA minimisation, context-free grammars, Turing machine
 * runs, and the decidability landscape. CS2023 AL-Models.
 *
 * Checks take other routes: brute force over every string, Python's own
 * regex engine, distinguishing states by every string up to a bound
 * (Myhill–Nerode), and generating a grammar's language by derivation.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;

function randomDfa(t, n) {
  const delta = Array.from({ length: n }, () => [t.int(0, n - 1), t.int(0, n - 1)]);
  let accept = Array.from({ length: n }, () => t.rng() < 0.4);
  if (!accept.some(Boolean)) accept[n - 1] = true;
  if (accept.every(Boolean)) accept[0] = false;
  return { delta, accept };
}
const dfaText = ({ delta, accept }) => delta.map(([z, o], q) => `q${q}${accept[q] ? '*' : ''}: 0→q${z}, 1→q${o}`).join('; ');

export const THEORY = [
  SKILL('tc.dfa', 'Finite automata', 'Run a DFA, and count the strings of a given length it accepts.', t => {
    const n = t.int(3, 4), D = randomDfa(t, n), len = t.int(3, 7);
    let counts = Array(n).fill(0); counts[0] = 1;
    for (let i = 0; i < len; i++) { const next = Array(n).fill(0); counts.forEach((c, q) => { next[D.delta[q][0]] += c; next[D.delta[q][1]] += c; }); counts = next; }
    const ans = counts.reduce((s, c, q) => s + (D.accept[q] ? c : 0), 0);
    return num(`A DFA over {0, 1} starts in q0; accepting states are starred. ${dfaText(D)}. How many binary strings of length ${len} does it accept?`, ans,
      `Count paths, not strings: track how many strings of each length end in each state (a vector updated once per symbol), then add the accepting states: ${ans}.`,
      `from itertools import product\ndelta, acc = ${PY(D.delta)}, ${PY(D.accept.map(Number))}\nn = 0\nfor w in product((0, 1), repeat=${len}):\n    q = 0\n    for c in w: q = delta[q][c]\n    n += acc[q]\nprint(n)`);
  }),

  SKILL('tc.regex', 'Regular expressions', 'Read a regular expression precisely: count the strings of a length that it matches.', t => {
    const res = ['(a|b)*abb', 'a*b*', '(ab|b)*', '(a|b)*a(a|b)', 'b*(ab*ab*)*', '(aa|bb)*', 'a(a|b)*b', '(a|ba)*'];
    const re = t.pick(res), len = t.int(3, 7);
    const rx = new RegExp(`^(?:${re})$`);
    let ans = 0;
    for (let m = 0; m < 1 << len; m++) { const s = Array.from({ length: len }, (_, i) => (m >> i & 1 ? 'b' : 'a')).join(''); if (rx.test(s)) ans++; }
    return num(`Over the alphabet {a, b}, how many strings of length ${len} match the regular expression ${re} exactly?`, ans,
      `Work out the language the expression denotes, then count the length-${len} strings in it: ${ans}. ${re === 'b*(ab*ab*)*' ? 'This one is "an even number of a\'s".' : re === '(a|b)*a(a|b)' ? 'This one is "the second-to-last symbol is a" — a DFA for it needs only four states, but the version for the k-th-from-last needs 2^k.' : ''}`,
      `import re, itertools\nprint(sum(1 for w in itertools.product('ab', repeat=${len}) if re.fullmatch(${PY(re)}, ''.join(w))))`);
  }),

  SKILL('tc.subset', 'The subset construction', 'Convert an NFA to a DFA: each DFA state is a set of NFA states.', t => {
    const n = t.int(3, 4);
    const delta = Array.from({ length: n }, () => [0, 1].map(() => [...new Set(Array.from({ length: t.int(0, 2) }, () => t.int(0, n - 1)))].sort()));
    const seen = new Map(), todo = [[0]]; seen.set('0', true);
    while (todo.length) {
      const S = todo.pop();
      for (const c of [0, 1]) { const T = [...new Set(S.flatMap(q => delta[q][c]))].sort((a, b) => a - b), k = T.join(','); if (!seen.has(k)) { seen.set(k, true); todo.push(T); } }
    }
    return num(`An NFA over {0, 1} (no ε-moves) starts in q0. Transitions: ${delta.map((d, q) => `q${q}: 0→{${d[0].map(x => `q${x}`).join(',')}}, 1→{${d[1].map(x => `q${x}`).join(',')}}`).join('; ')}. How many states does the subset construction produce (counting only reachable sets, including the empty set if reached)?`, seen.size,
      `Start from {q0}; for each symbol, the next DFA state is the union of the NFA moves. Keep going until no new sets appear: ${seen.size} reachable subsets.`,
      `delta = ${PY(delta)}\nstart = frozenset([0]); seen = {start}; todo = [start]\nwhile todo:\n    S = todo.pop()\n    for c in (0, 1):\n        T = frozenset(x for q in S for x in delta[q][c])\n        if T not in seen: seen.add(T); todo.append(T)\nprint(len(seen))`);
  }),

  SKILL('tc.minimize', 'Minimising DFAs', 'Merge states no string can tell apart; what is left is the unique minimal DFA.', t => {
    const n = t.int(4, 5), D = randomDfa(t, n);
    // Reachable states, then partition refinement.
    const reach = new Set([0]), stack = [0];
    while (stack.length) { const q = stack.pop(); for (const r of D.delta[q]) if (!reach.has(r)) { reach.add(r); stack.push(r); } }
    const states = [...reach];
    let block = Object.fromEntries(states.map(q => [q, D.accept[q] ? 1 : 0]));
    for (;;) {
      const sig = Object.fromEntries(states.map(q => [q, `${block[q]}|${block[D.delta[q][0]]}|${block[D.delta[q][1]]}`]));
      const ids = [...new Set(Object.values(sig))], next = Object.fromEntries(states.map(q => [q, ids.indexOf(sig[q])]));
      if (new Set(Object.values(next)).size === new Set(Object.values(block)).size) break;
      block = next;
    }
    const ans = new Set(Object.values(block)).size;
    return num(`A DFA over {0, 1} starts in q0; accepting states are starred. ${dfaText(D)}. How many states does the minimal equivalent DFA have?`, ans,
      `Drop unreachable states (${n - states.length}), then split states into blocks until every state in a block goes to the same blocks on 0 and on 1, starting from accepting against non-accepting. ${ans} blocks remain.`,
      `from itertools import product\ndelta, acc = ${PY(D.delta)}, ${PY(D.accept.map(Number))}\nn = len(delta)\nreach, todo = {0}, [0]\nwhile todo:\n    q = todo.pop()\n    for r in delta[q]:\n        if r not in reach: reach.add(r); todo.append(r)\ndef run(q, w):\n    for c in w: q = delta[q][c]\n    return acc[q]\n# Myhill–Nerode: states are equivalent iff no string up to length n separates them\nwords = [w for k in range(n + 1) for w in product((0, 1), repeat=k)]\nsigs = {tuple(run(q, w) for w in words) for q in reach}\nprint(len(sigs))`);
  }),

  SKILL('tc.cfg', 'Context-free grammars', 'What a grammar generates — and how many strings of each length.', t => {
    const G = t.pick([
      { rules: 'S → aSb | ε', gen: n => (n % 2 === 0 ? 1 : 0), py: "S -> aSb | ''" },
      { rules: 'S → SS | (S) | ε', gen: n => { if (n % 2) return 0; const k = n / 2; let c = 1; for (let i = 0; i < k; i++) c = (c * 2 * (2 * i + 1)) / (i + 2); return Math.round(c); }, py: "S -> SS | (S) | ''" },
      { rules: 'S → aS | bS | a', gen: n => (n >= 1 ? 2 ** (n - 1) : 0), py: 'S -> aS | bS | a' },
      { rules: 'S → aSa | bSb | a | b | ε', gen: n => 2 ** Math.ceil(n / 2), py: "S -> aSa | bSb | a | b | ''" },
    ]);
    const len = t.int(2, 8), ans = G.gen(len);
    const prods = { 'S → aSb | ε': ['aSb', ''], 'S → SS | (S) | ε': ['SS', '(S)', ''], 'S → aS | bS | a': ['aS', 'bS', 'a'], 'S → aSa | bSb | a | b | ε': ['aSa', 'bSb', 'a', 'b', ''] }[G.rules];
    return num(`The grammar ${G.rules}. How many distinct strings of length ${len} does it generate?`, ans,
      `${G.rules.startsWith('S → aSb') ? 'It generates aⁿbⁿ: one string for each even length.' : G.rules.startsWith('S → SS') ? 'Balanced parentheses: the count is a Catalan number.' : G.rules.startsWith('S → aS') ? 'Every string over {a, b} ending in a.' : 'Every palindrome over {a, b}: the first half (and the middle) choose the rest.'} For length ${len}: ${ans}.`,
      `from itertools import product\nfrom functools import lru_cache\nP = ${PY(prods)}\nT = sorted({c for p in P for c in p if c != 'S'})\nbusy = set()\n@lru_cache(None)\ndef derives(s):\n    if s in busy: return False\n    busy.add(s)\n    ok = any(match(p, s) for p in P)\n    busy.discard(s)\n    return ok\ndef match(p, s):\n    if not p: return s == ''\n    if p[0] == 'S': return any(derives(s[:i]) and match(p[1:], s[i:]) for i in range(len(s) + 1))\n    return bool(s) and s[0] == p[0] and match(p[1:], s[1:])\nprint(sum(1 for w in product(T, repeat=${len}) if derives(''.join(w))))`);
  }),

  SKILL('tc.tm', 'Turing machines', 'Run a Turing machine by hand: tape, head and state, step by step.', t => {
    const k = t.int(1, 30), bits = k.toString(2);
    const program = 'q0: on 0/1 move right; on blank move left, go to q1.\nq1: on 1 write 0, move left; on 0 or blank write 1, halt.';
    return num(`This Turing machine increments a binary number. The tape holds ${bits}, the head on the leftmost digit. ${program} When it halts, what number (in decimal) is on the tape?`, k + 1,
      `q0 walks to the right end; q1 turns trailing 1s into 0s and the first 0 (or blank) into 1 — binary carrying. ${bits} + 1 = ${(k + 1).toString(2)} = ${k + 1}.`,
      `tape = list(${PY(bits)}); pos, q = 0, 'q0'\ndef get(i): return tape[i] if 0 <= i < len(tape) else '_'\nwhile True:\n    s = get(pos)\n    if q == 'q0':\n        if s in '01': pos += 1\n        else: pos -= 1; q = 'q1'\n    else:\n        if s == '1': tape[pos] = '0'; pos -= 1\n        else:\n            if pos < 0: tape.insert(0, '1')\n            else: tape[pos] = '1'\n            break\nprint(int(''.join(tape), 2))`);
  }),

  SKILL('tc.decide', 'Decidability', 'Decidable, recognizable, co-recognizable, or neither — the map of what computers can answer.', t => {
    const FACTS = [
      ['A_DFA = {⟨D, w⟩ : DFA D accepts w}', 'Decidable'],
      ['E_CFG = {⟨G⟩ : CFG G generates no strings}', 'Decidable'],
      ['A_TM = {⟨M, w⟩ : TM M accepts w}', 'Recognizable but not decidable'],
      ['HALT_TM = {⟨M, w⟩ : M halts on w}', 'Recognizable but not decidable'],
      ['E_TM = {⟨M⟩ : L(M) is empty}', 'Co-recognizable but not decidable'],
      ['EQ_TM = {⟨M₁, M₂⟩ : L(M₁) = L(M₂)}', 'Neither recognizable nor co-recognizable'],
      ['ALL_CFG = {⟨G⟩ : G generates every string}', 'Co-recognizable but not decidable'],
      ['EQ_DFA = {⟨A, B⟩ : L(A) = L(B)}', 'Decidable'],
    ];
    const [lang, right] = t.pick(FACTS);
    const all = ['Decidable', 'Recognizable but not decidable', 'Co-recognizable but not decidable', 'Neither recognizable nor co-recognizable'];
    return { kind: 'mc', q: `Classify ${lang}.`, options: [right, ...all.filter(x => x !== right)], correct: 0,
      explain: right === 'Decidable' ? 'An algorithm always halts with the answer — simulate (for DFAs) or mark reachable variables (for CFGs).'
        : right.startsWith('Recognizable') ? 'Simulate and accept if it accepts (or halts) — but you may wait forever on no-instances. Its undecidability follows from diagonalisation or a reduction from A_TM.'
          : right.startsWith('Co-') ? 'Its complement is recognizable (search for a counterexample string), but by Rice-style reductions it is undecidable.'
            : 'Both it and its complement reduce from A_TM\'s complement, so neither can be recognized.' };
  }),
];
