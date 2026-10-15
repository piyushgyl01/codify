/**
 * Programming I — four skills CS2023's Software Development Fundamentals asks
 * for that the original eighteen did not cover: functions that return rather
 * than print, file input and output, unit tests that pass or fail, and
 * recursion (which CS50P itself does not teach — the course page says where
 * to learn it).
 *
 * As with the original eighteen, each question carries `python`: a program
 * that runs the snippet with real Python and prints the answer.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const PREDICT = 'What does this print?';
const indent = (code, n = 4) => code.split('\n').map(l => (l ? ' '.repeat(n) + l : l)).join('\n');
/** Run `code` and print its output lines joined by " / " — the form the options use. */
const capture = code => `import io, contextlib\nbuf = io.StringIO()\nwith contextlib.redirect_stdout(buf):\n${indent(code)}\nprint(' / '.join(buf.getvalue().splitlines()))`;

export const PYTHON_EXTRA = [
  SKILL('py.return', 'Return versus print', 'A function that prints hands back None; only return gives a value to the caller.', t => {
    const a = t.int(2, 9), k = t.int(2, 5), form = t.int(0, 2);
    if (form === 0) {
      const code = `def double(x):\n    print(x * ${k})\n\ny = double(${a})\nprint(y)`;
      const right = `${a * k} / None`;
      return { kind: 'mc', q: `${PREDICT} (lines separated by " / ")`, code, options: [right, `${a * k} / ${a * k}`, `None / ${a * k}`, `${a * k}`], correct: 0,
        explain: 'double prints its result and returns nothing, so y is None — and print(y) prints None.', python: capture(code) };
    }
    if (form === 1) {
      const code = `def f(x):\n    if x > ${a}:\n        return 'big'\n    print('small')\n\nprint(f(${a + 1}))\nprint(f(${a}))`;
      return { kind: 'mc', q: `${PREDICT} (lines separated by " / ")`, code, options: ['big / small / None', 'big / small', 'big / None', 'big / small / small'], correct: 0,
        explain: `f(${a + 1}) returns 'big'. f(${a}) prints 'small', then falls off the end and returns None, which is printed too.`, python: capture(code) };
    }
    const code = `def add(a, b):\n    return a + b\n    print('done')\n\nprint(add(${a}, ${k}) * 2)`;
    return { kind: 'mc', q: `${PREDICT} (lines separated by " / ")`, code, options: [`${(a + k) * 2}`, `done / ${(a + k) * 2}`, `${(a + k) * 2} / done`, `${a + k}`], correct: 0,
      explain: 'return ends the function at once; the print after it never runs.', python: capture(code) };
  }),

  SKILL('py.fileio', 'Reading and writing files', 'Modes w and a, and what read, readlines and iteration hand back.', t => {
    const rows = Array.from({ length: t.int(2, 4) }, () => t.pick(['alpha', 'beta', 'gamma', 'delta'])), extra = t.int(1, 3), form = t.int(0, 2);
    const write = `with open('data.txt', 'w') as f:\n${rows.map(r => `    f.write('${r}\\n')`).join('\n')}\n`;
    const setup = `import os, tempfile\nos.chdir(tempfile.mkdtemp())\n`;
    if (form === 0) {
      const code = `${write}for _ in range(${extra}):\n    with open('data.txt', 'a') as f:\n        f.write('more\\n')\nwith open('data.txt') as f:\n    print(len(f.readlines()))`;
      return { kind: 'num', q: PREDICT, code, answer: rows.length + extra, tol: 0, dp: 0, explain: `'w' writes ${rows.length} lines; each 'a' appends one more: ${rows.length + extra}.`, python: setup + code };
    }
    if (form === 1) {
      const code = `${write}with open('data.txt', 'w') as f:\n    f.write('only\\n')\nwith open('data.txt') as f:\n    print(len(f.readlines()))`;
      return { kind: 'num', q: PREDICT, code, answer: 1, tol: 0, dp: 0, explain: "Opening with 'w' again empties the file before writing, so one line is left.", python: setup + code };
    }
    const code = `${write}with open('data.txt') as f:\n    print(len(f.read()))`;
    const n = rows.reduce((s, r) => s + r.length + 1, 0);
    return { kind: 'num', q: PREDICT, code, answer: n, tol: 0, dp: 0, explain: `read() returns the whole text, newlines included: ${rows.map(r => `${r.length} + 1`).join(' + ')} = ${n} characters.`, python: setup + code };
  }),

  SKILL('py.pytest', 'Unit tests', 'Run the asserts in your head: which tests catch the bug?', t => {
    const bugs = [
      { name: 'is_even', fn: 'def is_even(n):\n    return n % 2 == 1', good: n => n % 2 === 0, desc: 'checks for odd instead of even' },
      { name: 'clamp', fn: 'def clamp(x, lo, hi):\n    return max(lo, min(x, lo))', good: null, desc: 'uses lo where it should use hi' },
      { name: 'last', fn: 'def last(xs):\n    return xs[len(xs) - 2]', good: null, desc: 'is off by one' },
    ];
    const b = t.pick(bugs);
    let tests, fails;
    if (b.name === 'is_even') {
      const ns = t.pickN([0, 1, 2, 3, 7, 10, 11, 14], 4);
      tests = ns.map(n => `assert is_even(${n}) == ${n % 2 === 0 ? 'True' : 'False'}`);
      fails = ns.length; // every case flips
    } else if (b.name === 'clamp') {
      const cases = t.pickN([[5, 0, 10], [-3, 0, 10], [15, 0, 10], [0, 0, 10], [10, 0, 10], [7, 5, 6]], 4);
      tests = cases.map(([x, lo, hi]) => `assert clamp(${x}, ${lo}, ${hi}) == ${Math.max(lo, Math.min(x, hi))}`);
      fails = cases.filter(([x, lo, hi]) => Math.max(lo, Math.min(x, lo)) !== Math.max(lo, Math.min(x, hi))).length;
    } else {
      const cases = t.pickN([[1, 2, 3], [5, 5], [9], [4, 8, 4], [2, 7]], 4);
      tests = cases.map(xs => `assert last([${xs.join(', ')}]) == ${xs.at(-1)}`);
      fails = cases.filter(xs => (xs.length >= 2 ? xs[xs.length - 2] : xs.at(-1)) !== xs.at(-1)).length;
    }
    const code = `${b.fn}\n\n${tests.join('\n')}`;
    return { kind: 'num', q: `If each assert ran as its own test, how many of the ${tests.length} would fail?`, code, answer: fails, tol: 0, dp: 0,
      explain: `${b.name} ${b.desc}. A test fails only when the buggy answer differs from the right one — here ${fails} of ${tests.length} do.${b.name === 'last' ? ' Note [9]: xs[-1] still finds the last item, so that test passes.' : ''}`,
      python: `${b.fn}\nfails = 0\nfor line in ${JSON.stringify(tests)}:\n    try:\n        exec(line)\n    except AssertionError:\n        fails += 1\nprint(fails)` };
  }),

  SKILL('py.recursion', 'Recursion', 'Trace a function that calls itself: base case, recursive case, and how many calls.', t => {
    const form = t.int(0, 2), n = t.int(4, 9);
    if (form === 0) {
      const code = `def f(n):\n    if n <= 1:\n        return n\n    return f(n - 1) + f(n - 2)\n\nprint(f(${n}))`;
      const fib = [0, 1]; for (let i = 2; i <= n; i++) fib.push(fib[i - 1] + fib[i - 2]);
      return { kind: 'num', q: PREDICT, code, answer: fib[n], tol: 0, dp: 0, explain: `f is Fibonacci: f(0) = 0, f(1) = 1, each next the sum of the two before. f(${n}) = ${fib[n]}.`, python: code };
    }
    if (form === 1) {
      const x = t.int(1000, 99999), s = String(x).split('').reduce((a, d) => a + +d, 0);
      const code = `def digits(n):\n    if n < 10:\n        return n\n    return n % 10 + digits(n // 10)\n\nprint(digits(${x}))`;
      return { kind: 'num', q: PREDICT, code, answer: s, tol: 0, dp: 0, explain: `Each call peels off the last digit: ${String(x).split('').join(' + ')} = ${s}.`, python: code };
    }
    const calls = c => (c <= 1 ? 1 : 1 + calls(c - 1) + calls(c - 2));
    const code = `calls = 0\n\ndef f(n):\n    global calls\n    calls += 1\n    if n <= 1:\n        return n\n    return f(n - 1) + f(n - 2)\n\nf(${n})\nprint(calls)`;
    return { kind: 'num', q: PREDICT, code, answer: calls(n), tol: 0, dp: 0, explain: `Each call on n > 1 makes two more: C(n) = 1 + C(n − 1) + C(n − 2), C(0) = C(1) = 1, so C(${n}) = ${calls(n)} — exponential, which is why memoisation exists.`, python: code };
  }),
];
