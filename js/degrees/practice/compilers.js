/**
 * CS420 Compilers — Crafting Interpreters-style questions with exact
 * answers: precedence and associativity, scanning, FIRST sets, a stack
 * virtual machine, mark-sweep garbage collection and register allocation.
 * CS2023 FPL-Syntax, FPL-Translation, FPL-Code, FPL-Run-Time.
 *
 * Checks: Python's own parser evaluates expressions; a separate regex
 * scanner counts tokens; a separate fixed-point computes FIRST sets; a
 * separate VM runs the bytecode; reachability by BFS; and brute-force
 * colouring for registers.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;

/* A random arithmetic expression, evaluated by a precedence-climbing parser written here. */
function expr(t, depth = 0) {
  if (depth > 2 || t.rng() < 0.3) return String(t.int(1, 9));
  const op = t.pick(['+', '-', '*', '-', '+']);
  const l = expr(t, depth + 1), r = expr(t, depth + 1);
  return t.rng() < 0.25 ? `(${l} ${op} ${r})` : `${l} ${op} ${r}`;
}
function evaluate(src) {
  const toks = src.match(/\d+|[-+*()]/g); let i = 0;
  const prec = { '+': 1, '-': 1, '*': 2 };
  const primary = () => { const tk = toks[i++]; if (tk === '(') { const v = climb(0); i++; return v; } if (tk === '-') return -primary(); return +tk; };
  const climb = min => {
    let lhs = primary();
    while (i < toks.length && prec[toks[i]] > min - 1 && prec[toks[i]] >= min) {
      const op = toks[i++], rhs = climb(prec[op] + 1);   // left-associative: the right side binds tighter
      lhs = op === '+' ? lhs + rhs : op === '-' ? lhs - rhs : lhs * rhs;
    }
    return lhs;
  };
  return climb(1);
}

export const COMPILERS = [
  SKILL('comp.prec', 'Precedence and associativity', 'What a parser must decide: * binds tighter than + and −, and − groups to the left.', t => {
    let src; do { src = expr(t); } while (!/[-+*]/.test(src));
    const v = evaluate(src);
    return num(`Using the usual rules (* before + and −; operators of equal precedence group left to right), what does ${src} evaluate to?`, v,
      `Parse before you evaluate: * groups first, and a − b − c is (a − b) − c. Value: ${v}. A recursive-descent parser gets this by giving each precedence level its own function.`,
      `print(${src})`);
  }),

  SKILL('comp.scan', 'Scanning', 'Turn characters into tokens: maximal munch, two-character operators, strings and comments.', t => {
    const pieces = t.pickN(['var', 'x', '=', '42', ';', 'if', '(', 'x', '>=', '10', ')', 'print', '"hi there"', ';', 'y', '!=', 'z', '// note', '3.14', '+', 'count', '<=', 'fun'], t.int(6, 10));
    const line = pieces.join(' ');
    const re = /\/\/.*$|"[^"]*"|\d+(?:\.\d+)?|[A-Za-z_]\w*|==|!=|<=|>=|[-+*/;=()<>!{}]/g;
    const toks = (line.match(re) || []).filter(x => !x.startsWith('//'));
    return num(`How many tokens does a Lox scanner produce for this line? (Strings are one token; // starts a comment to the end of the line; >=, <= and != are single tokens; ignore the EOF token.)`, toks.length,
      `Maximal munch takes the longest token at each point: ${toks.map(x => `⟨${x}⟩`).join(' ')} — ${toks.length}. Everything after // is skipped.`,
      `import re\nline = ${PY(line)}\nT = []\ni = 0\nwhile i < len(line):\n    c = line[i]\n    if c.isspace(): i += 1; continue\n    if line.startswith('//', i): break\n    if c == '"':\n        j = line.index('"', i + 1); T.append(line[i:j + 1]); i = j + 1; continue\n    m = re.match(r'\\d+(\\.\\d+)?|[A-Za-z_]\\w*|[=!<>]=|.', line[i:])\n    T.append(m.group(0)); i += len(m.group(0))\nprint(len(T))`, { code: line });
  }),

  SKILL('comp.first', 'FIRST sets', 'Which terminals can begin a nonterminal — the table an LL(1) parser predicts from.', t => {
    const G = t.pick([
      { S: [['A', 'b'], ['c']], A: [['a', 'A'], []] },
      { E: [['T', "E'"]], "E'": [['+', 'T', "E'"], []], T: [['F', "T'"]], "T'": [['*', 'F', "T'"], []], F: [['(', 'E', ')'], ['id']] },
      { S: [['A', 'B']], A: [['a'], []], B: [['b'], ['c'], []] },
      { S: [['x', 'S'], ['A', 'y']], A: [['z', 'A'], ['w'], []] },
    ]);
    const nts = Object.keys(G), X = t.pick(nts);
    const first = Object.fromEntries(nts.map(n => [n, new Set()]));
    for (let changed = true; changed;) {
      changed = false;
      for (const n of nts) for (const rhs of G[n]) {
        let allEps = true;
        for (const s of rhs) {
          const add = G[s] ? [...first[s]].filter(x => x !== 'ε') : [s];
          for (const a of add) if (!first[n].has(a)) { first[n].add(a); changed = true; }
          if (!(G[s] && first[s].has('ε'))) { allEps = false; break; }
        }
        if (allEps && !first[n].has('ε')) { first[n].add('ε'); changed = true; }
      }
    }
    const text = nts.map(n => `${n} → ${G[n].map(r => (r.length ? r.join(' ') : 'ε')).join(' | ')}`).join('; ');
    return num(`Grammar: ${text}. How many symbols are in FIRST(${X}) (count ε if it is there)?`, first[X].size,
      `FIRST(${X}) = {${[...first[X]].join(', ')}}: the terminals that can start a string derived from ${X}, plus ε if ${X} can vanish. Iterate until nothing changes.`,
      `G = ${PY(G)}\nfrom functools import lru_cache\ndef first_of(sym, stack=()):\n    if sym not in G: return {sym}\n    if sym in stack: return set()\n    out = set()\n    for rhs in G[sym]:\n        eps = True\n        for s in rhs:\n            f = first_of(s, stack + (sym,))\n            out |= f - {'ε'}\n            if 'ε' not in f: eps = False; break\n        if eps: out.add('ε')\n    return out\nprint(len(first_of(${PY(X)})))`);
  }),

  SKILL('comp.vm', 'A stack virtual machine', 'Run bytecode on a stack VM: push, arithmetic, and conditional jumps.', t => {
    const a = t.int(2, 9), b = t.int(1, 5), n = t.int(2, 5);
    const prog = t.rng() < 0.5
      ? [`PUSH ${a}`, `PUSH ${b}`, 'ADD', 'DUP', 'MUL', `PUSH ${n}`, 'SUB', 'HALT']
      : [`PUSH 0`, `PUSH ${n}`, 'L: DUP', 'JZ END', 'SWAP', `PUSH ${a}`, 'ADD', 'SWAP', 'PUSH 1', 'SUB', 'JMP L', 'END: POP', 'HALT'];
    const run = () => {
      const code = prog.map(l => l.replace(/^\w+:\s*/, '')), labels = {}; prog.forEach((l, i) => { const m = l.match(/^(\w+):/); if (m) labels[m[1]] = i; });
      const st = []; let pc = 0;
      for (let steps = 0; steps < 1000; steps++) {
        const [op, arg] = code[pc++].split(' ');
        if (op === 'PUSH') st.push(+arg); else if (op === 'ADD') st.push(st.pop() + st.pop()); else if (op === 'MUL') st.push(st.pop() * st.pop());
        else if (op === 'SUB') { const y = st.pop(); st.push(st.pop() - y); } else if (op === 'DUP') st.push(st.at(-1)); else if (op === 'POP') st.pop();
        else if (op === 'SWAP') { const y = st.pop(), x = st.pop(); st.push(y, x); } else if (op === 'JZ') { if (st.pop() === 0) pc = labels[arg]; }
        else if (op === 'JMP') pc = labels[arg]; else if (op === 'HALT') return st.at(-1);
      }
      return null;
    };
    const v = run();
    return num('What is on top of the stack when this bytecode halts? (SUB computes second-from-top minus top; JZ pops and jumps if zero; DUP copies the top; SWAP exchanges the top two.)', v,
      `Trace the stack instruction by instruction: it halts with ${v} on top. ${prog.length > 8 ? 'The loop adds the constant once per count-down step — a multiplication done the slow way.' : ''}`,
      `prog = ${PY(prog)}\nlabels = {l.split(':')[0]: i for i, l in enumerate(prog) if ':' in l}\ncode = [l.split(':', 1)[1].strip() if ':' in l else l for l in prog]\ns, pc = [], 0\nwhile True:\n    parts = code[pc].split(); op = parts[0]; pc += 1\n    if op == 'PUSH': s.append(int(parts[1]))\n    elif op == 'ADD': b, a = s.pop(), s.pop(); s.append(a + b)\n    elif op == 'MUL': b, a = s.pop(), s.pop(); s.append(a * b)\n    elif op == 'SUB': b, a = s.pop(), s.pop(); s.append(a - b)\n    elif op == 'DUP': s.append(s[-1])\n    elif op == 'POP': s.pop()\n    elif op == 'SWAP': s[-1], s[-2] = s[-2], s[-1]\n    elif op == 'JZ':\n        if s.pop() == 0: pc = labels[parts[1]]\n    elif op == 'JMP': pc = labels[parts[1]]\n    elif op == 'HALT': print(s[-1]); break`, { code: prog.join('\n') });
  }),

  SKILL('comp.gc', 'Garbage collection', 'Mark from the roots, sweep the rest: which objects a collection frees.', t => {
    const n = t.int(6, 9), objs = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
    const refs = Object.fromEntries(objs.map(o => [o, t.pickN(objs, t.int(0, 2)).filter(x => x !== o)]));
    const roots = t.pickN(objs, t.int(1, 2));
    const marked = new Set(), gray = [...roots];
    while (gray.length) { const o = gray.pop(); if (marked.has(o)) continue; marked.add(o); gray.push(...refs[o]); }
    return num(`Heap objects and their references: ${objs.map(o => `${o}→{${refs[o].join(',')}}`).join(' ')}. Roots: ${roots.join(', ')}. How many objects does a mark-sweep collection free?`, n - marked.size,
      `Mark everything reachable from the roots (a gray worklist, as in clox): {${[...marked].sort().join(', ')}}. Sweep frees the other ${n - marked.size} — including any cycle nothing reaches, which reference counting would leak.`,
      `from collections import deque\nrefs, roots = ${PY(refs)}, ${PY(roots)}\nseen = set(roots); q = deque(roots)\nwhile q:\n    for r in refs[q.popleft()]:\n        if r not in seen: seen.add(r); q.append(r)\nprint(len(refs) - len(seen))`);
  }),

  SKILL('comp.regs', 'Register allocation', 'Live ranges that overlap cannot share a register: how many registers a block needs.', t => {
    const vars = ['a', 'b', 'c', 'd', 'e', 'f'].slice(0, t.int(4, 6));
    const live = Object.fromEntries(vars.map(v => { const s = t.int(1, 10); return [v, [s, s + t.int(1, 5)]]; }));
    let maxOverlap = 0;
    for (let p = 0; p <= 16; p++) maxOverlap = Math.max(maxOverlap, vars.filter(v => live[v][0] <= p && p < live[v][1]).length);
    return num(`In a straight-line block, each variable is live from its definition to its last use (half-open intervals): ${vars.map(v => `${v} [${live[v][0]}, ${live[v][1]})`).join(', ')}. What is the fewest registers that can hold them all without spilling?`, maxOverlap,
      `Variables whose live ranges overlap interfere and need different registers. For intervals the answer is simply the most ranges alive at once: ${maxOverlap}. (Linear-scan allocators rely on exactly this.)`,
      `from itertools import product\nL = ${PY(vars.map(v => live[v]))}\ninter = lambda a, b: a[0] < b[1] and b[0] < a[1]\nn = len(L)\nfor k in range(1, n + 1):\n    if any(all(not (c[i] == c[j] and inter(L[i], L[j])) for i in range(n) for j in range(i + 1, n)) for c in product(range(k), repeat=n)):\n        print(k); break`);
  }),
];
