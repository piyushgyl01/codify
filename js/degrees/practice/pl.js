/**
 * CS410 Programming Languages — PLAI-style semantics with exact answers:
 * lexical against dynamic scope, closures capturing a loop variable,
 * folds and associativity, let and shadowing, Church numerals, and how
 * often call-by-name evaluates an argument. CS2023 FPL-Functional,
 * FPL-Translation (scope, binding), FPL-Types.
 *
 * Checks: a separate mini-interpreter in Python that runs both scoping
 * rules, Node for real JavaScript closures, functools.reduce for folds, and
 * Python lambdas for Church numerals.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;

export const PL = [
  SKILL('pl.scope', 'Lexical and dynamic scope', 'A free variable means the binding where the function was written — unless scope is dynamic.', t => {
    const x1 = t.int(1, 9), x2 = t.int(10, 20), k = t.int(1, 5), op = t.pick(['+', '*']), dynamic = t.rng() < 0.4;
    const code = `let x = ${x1} in\nlet f = fun y -> x ${op} y in\nlet x = ${x2} in\nf ${k}`;
    const val = op === '+' ? (dynamic ? x2 : x1) + k : (dynamic ? x2 : x1) * k;
    return num(`What does this evaluate to under ${dynamic ? 'dynamic' : 'lexical (static)'} scope?`, val,
      dynamic ? `Dynamic scope looks x up in the environment at the call, where the newer x = ${x2} is in force: ${x2} ${op} ${k} = ${val}.`
        : `Lexical scope closes f over the x in force where f was written (${x1}); the later let x = ${x2} shadows it only for code inside it, not for f's body: ${x1} ${op} ${k} = ${val}. That is what a closure is.`,
      `# A tiny interpreter: let, fun, application, variables, numbers, + and *.\nimport operator\nOPS = {'+': operator.add, '*': operator.mul}\nprog = ('let', 'x', ('num', ${x1}), ('let', 'f', ('fun', 'y', ('op', '${op}', ('var', 'x'), ('var', 'y'))), ('let', 'x', ('num', ${x2}), ('app', ('var', 'f'), ('num', ${k})))))\nDYN = ${dynamic ? 'True' : 'False'}\ndef ev(e, env):\n    k = e[0]\n    if k == 'num': return e[1]\n    if k == 'var': return env[e[1]]\n    if k == 'op': return OPS[e[1]](ev(e[2], env), ev(e[3], env))\n    if k == 'let': return ev(e[3], {**env, e[1]: ev(e[2], env)})\n    if k == 'fun': return ('closure', e[1], e[2], env)\n    if k == 'app':\n        _, p, body, cenv = ev(e[1], env)\n        return ev(body, {**(env if DYN else cenv), p: ev(e[2], env)})\nprint(ev(prog, {}))`, { code });
  }),

  SKILL('pl.closure', 'Closures and loop variables', 'Do three closures made in a loop share one variable or get one each?', t => {
    const kw = t.pick(['var', 'let']), n = t.int(3, 4), k = t.int(1, 3);
    const code = `const fs = [];\nfor (${kw} i = 0; i < ${n}; i++) {\n  fs.push(() => i * ${k});\n}\nconsole.log(fs.map(f => f()).join(','));`;
    const right = Array.from({ length: n }, (_, i) => (kw === 'var' ? n : i) * k).join(',');
    const other = Array.from({ length: n }, (_, i) => (kw === 'var' ? i : n) * k).join(',');
    return { kind: 'mc', q: 'What does this JavaScript print?', code, options: [right, other, Array.from({ length: n }, (_, i) => (i + 1) * k).join(','), Array(n).fill(0).join(',')].filter((v, i, a) => a.indexOf(v) === i), correct: 0,
      explain: kw === 'var' ? `var gives the whole loop one variable i; every closure captures that same binding, which is ${n} after the loop ends. Each prints ${n} × ${k}.` : `let gives each iteration a fresh binding of i, so each closure captures its own value: ${right}.`,
      node: code };
  }),

  SKILL('pl.fold', 'Folds', 'foldl and foldr agree only when the operation is associative.', t => {
    const xs = Array.from({ length: t.int(3, 5) }, () => t.int(1, 9)), init = t.int(0, 10), dir = t.pick(['foldl', 'foldr']);
    const val = dir === 'foldl' ? xs.reduce((a, x) => a - x, init) : xs.reduceRight((a, x) => x - a, init);
    return num(`What is ${dir} (−) ${init} [${xs.join(', ')}]? (${dir === 'foldl' ? 'foldl f z [a, b, c] = f(f(f(z, a), b), c)' : 'foldr f z [a, b, c] = f(a, f(b, f(c, z)))'})`, val,
      dir === 'foldl' ? `Left to right from ${init}: ((${init} − ${xs[0]}) − ${xs[1]})… = ${val}.` : `Right to left, nesting from the end: ${xs[0]} − (${xs[1]} − (… − ${init})) = ${val}. Subtraction is not associative, so the two folds differ.`,
      dir === 'foldl' ? `from functools import reduce\nprint(reduce(lambda a, x: a - x, ${PY(xs)}, ${init}))` : `def foldr(f, z, xs):\n    return z if not xs else f(xs[0], foldr(f, z, xs[1:]))\nprint(foldr(lambda x, a: x - a, ${init}, ${PY(xs)}))`);
  }),

  SKILL('pl.let', 'Let and shadowing', 'Evaluate nested lets: each binding is visible in its body, shadowing outer ones.', t => {
    const a = t.int(1, 6), b = t.int(1, 6), c = t.int(1, 6);
    const code = `let x = ${a} in\nlet y = x + ${b} in\nlet x = x * y in\nlet y = x - ${c} in\nx + y`;
    const x1 = a, y1 = x1 + b, x2 = x1 * y1, y2 = x2 - c, val = x2 + y2;
    return num('What does this evaluate to?', val,
      `x = ${x1}; y = ${x1} + ${b} = ${y1}; the second x = ${x1} × ${y1} = ${x2} shadows the first; y = ${x2} − ${c} = ${y2}; so x + y = ${val}.`,
      `def ev(e, env):\n    if isinstance(e, int): return e\n    if isinstance(e, str): return env[e]\n    k = e[0]\n    if k == 'let': return ev(e[3], {**env, e[1]: ev(e[2], env)})\n    a, b = ev(e[1], env), ev(e[2], env)\n    return {'+': a + b, '-': a - b, '*': a * b}[k]\nprog = ('let', 'x', ${a}, ('let', 'y', ('+', 'x', ${b}), ('let', 'x', ('*', 'x', 'y'), ('let', 'y', ('-', 'x', ${c}), ('+', 'x', 'y')))))\nprint(ev(prog, {}))`, { code });
  }),

  SKILL('pl.church', 'Church numerals', 'Numbers as functions: n applies f n times. Addition, multiplication and powers fall out.', t => {
    const m = t.int(1, 4), n = t.int(1, 4), op = t.pick(['plus', 'times', 'exp']);
    const val = op === 'plus' ? m + n : op === 'times' ? m * n : m ** n;   // EXP m n = n m: m composed with itself n times
    const def = { plus: 'PLUS = λm.λn.λf.λx. m f (n f x)', times: 'TIMES = λm.λn.λf. m (n f)', exp: 'EXP = λm.λn. n m' }[op];
    return num(`With Church numerals (n = λf.λx. fⁿ x) and ${def}, ${op === 'exp' ? `EXP ${m} ${n}` : `${op.toUpperCase()} ${m} ${n}`} is the numeral for which number?`, val,
      op === 'plus' ? `Apply f n times, then m more: ${m} + ${n} = ${val}.` : op === 'times' ? `m applications of "apply f n times": ${m} × ${n} = ${val}.` : `n applied to m composes m with itself n times: ${m}^${n} = ${val}.`,
      `church = lambda k: (lambda f: (lambda x: x if k == 0 else f(church(k - 1)(f)(x))))\nPLUS = lambda m: lambda n: lambda f: lambda x: m(f)(n(f)(x))\nTIMES = lambda m: lambda n: lambda f: m(n(f))\nEXP = lambda m: lambda n: n(m)\nr = ${({ plus: 'PLUS', times: 'TIMES', exp: 'EXP' })[op]}(church(${m}))(church(${n}))\nprint(r(lambda k: k + 1)(0))`);
  }),

  SKILL('pl.strategy', 'Evaluation strategies', 'Call-by-value evaluates an argument once; call-by-name once per use; call-by-need at most once.', t => {
    const uses = t.int(0, 4), strat = t.pick(['value', 'name', 'need']);
    const evals = strat === 'value' ? 1 : strat === 'name' ? uses : Math.min(uses, 1);
    const body = uses === 0 ? '42' : Array(uses).fill('x').join(' + ');
    return num(`f = λx. ${body}. Calling f (expensive()), how many times is expensive() evaluated under call-by-${strat}?`, evals,
      strat === 'value' ? 'Call-by-value evaluates the argument exactly once, before the call, whether or not it is used.' : strat === 'name' ? `Call-by-name substitutes the unevaluated argument, so it runs once per use: ${uses}.` : `Call-by-need (lazy evaluation) evaluates on first use and remembers it: ${evals}.`,
      `count = 0\ndef expensive():\n    global count; count += 1; return 1\nuses, strat = ${uses}, ${PY(strat)}\nif strat == 'value':\n    v = expensive(); thunk = lambda: v\nelif strat == 'name':\n    thunk = expensive\nelse:\n    memo = []\n    def thunk():\n        if not memo: memo.append(expensive())\n        return memo[0]\nsum(thunk() for _ in range(uses))\nprint(count)`);
  }),
];
