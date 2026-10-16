/**
 * CS330 Software Engineering — the parts of the craft with exact answers:
 * Git history (checked by running real git), branch coverage, cyclomatic
 * complexity, npm version ranges, delivery metrics and flaky CI.
 * CS2023 SE-Tools, SE-Testing, SE-Construction, SE-Maintenance.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;

/* A Python preamble that runs git commands in a throwaway repository. */
const GIT_PY = `import os, subprocess, tempfile
d = tempfile.mkdtemp()
env = {**os.environ, 'GIT_AUTHOR_NAME': 't', 'GIT_AUTHOR_EMAIL': 't@t', 'GIT_COMMITTER_NAME': 't', 'GIT_COMMITTER_EMAIL': 't@t', 'GIT_CONFIG_GLOBAL': '/dev/null', 'GIT_CONFIG_NOSYSTEM': '1'}
def git(*a):
    return subprocess.run(['git', *a], cwd=d, env=env, capture_output=True, text=True, check=True).stdout.strip()
n = [0]
def commit():
    n[0] += 1
    open(os.path.join(d, f'f{n[0]}'), 'w').write(str(n[0]))
    git('add', '.'); git('commit', '-q', '-m', f'c{n[0]}')
git('init', '-q', '-b', 'main')
`;

export const SE = [
  SKILL('se.git', 'Git history', 'Branches are pointers; ranges, merges and fast-forwards follow from the commit graph.', t => {
    const a = t.int(1, 4), b = t.int(1, 4), c = t.int(0, 3);
    const story = `On main you make ${a} commit${a > 1 ? 's' : ''}, then create branch feature and make ${b} commit${b > 1 ? 's' : ''} on it. Back on main you make ${c} more commit${c === 1 ? '' : 's'}.`;
    const build = `${GIT_PY}for _ in range(${a}): commit()\ngit('checkout', '-q', '-b', 'feature')\nfor _ in range(${b}): commit()\ngit('checkout', '-q', 'main')\nfor _ in range(${c}): commit()\n`;
    const form = t.pick(['range', 'back', 'merge']);
    if (form === 'range') return num(`${story} How many commits does git log --oneline main..feature list?`, b,
      `main..feature means "reachable from feature but not from main": the ${b} commit${b > 1 ? 's' : ''} made on feature.`,
      `${build}print(git('rev-list', '--count', 'main..feature'))`);
    if (form === 'back') return num(`${story} How many commits does git log --oneline feature..main list?`, c,
      `feature..main is what main has that feature lacks: the ${c} commit${c === 1 ? '' : 's'} made on main after branching.`,
      `${build}print(git('rev-list', '--count', 'feature..main'))`);
    const total = a + b + c + (c > 0 ? 1 : 0);
    return num(`${story} Then, on main, you run git merge feature (accepting the default message). How many commits are reachable from main now?`, total,
      c > 0 ? `main and feature have diverged, so Git makes a merge commit: ${a} + ${b} + ${c} + 1 = ${total}.`
        : `main has not moved since the branch, so the merge is a fast-forward — no merge commit: ${a} + ${b} = ${total}.`,
      `${build}git('merge', '-q', '--no-edit', 'feature')\nprint(git('rev-list', '--count', 'main'))`);
  }),

  SKILL('se.coverage', 'Branch coverage', 'Which branch outcomes do your tests exercise — and which have never run?', t => {
    const k1 = t.int(0, 20), k2 = t.int(0, 20), k3 = t.int(1, 9);
    const code = `def grade(x, y):\n    if x > ${k1}:\n        r = 1\n    else:\n        r = 0\n    if y > ${k2}:\n        r += 2\n    if x % ${k3} == 0:\n        r *= 3\n    return r`;
    const tests = Array.from({ length: t.int(2, 4) }, () => [t.int(-5, 30), t.int(-5, 30)]);
    const conds = [([x]) => x > k1, ([, y]) => y > k2, ([x]) => x % k3 === 0];
    const hit = new Set(); tests.forEach(tc => conds.forEach((c, i) => hit.add(`${i}${c(tc)}`)));
    return num(`The function has three if-conditions, so six branch outcomes (each true or false). The tests call grade${tests.map(([x, y]) => `(${x}, ${y})`).join(', grade')}. How many of the six outcomes do they exercise?`, hit.size,
      `Evaluate each condition for each test and collect the distinct (condition, outcome) pairs: ${hit.size} of 6. ${hit.size < 6 ? 'The missing ones are untested code paths.' : 'Full branch coverage — which still does not prove the function right.'}`,
      `seen = set()\ndef h(i, v):\n    seen.add((i, bool(v))); return v\ndef grade(x, y):\n    if h(0, x > ${k1}):\n        r = 1\n    else:\n        r = 0\n    if h(1, y > ${k2}):\n        r += 2\n    if h(2, x % ${k3} == 0):\n        r *= 3\n    return r\nfor x, y in ${PY(tests)}:\n    grade(x, y)\nprint(len(seen))`, { code });
  }),

  SKILL('se.complexity', 'Cyclomatic complexity', 'McCabe complexity: one plus the number of decision points.', t => {
    const parts = [], lines = ['def f(xs, k):', '    total = 0'];
    let decisions = 0;
    if (t.rng() < 0.8) { lines.push('    for x in xs:'); decisions++; parts.push('for'); }
    const ind = parts.includes('for') ? '        ' : '    ';
    const nIf = t.int(1, 3);
    for (let i = 0; i < nIf; i++) {
      const andOr = t.rng() < 0.4;
      lines.push(`${ind}${i === 0 ? 'if' : 'elif'} x > ${i}${andOr ? ' and k < 9' : ''}:`.replace(/x >/, parts.includes('for') ? 'x >' : 'k >'));
      lines.push(`${ind}    total += ${i + 1}`);
      decisions += 1 + (andOr ? 1 : 0);
    }
    if (t.rng() < 0.5) { lines.push('    while total > 100:'); lines.push('        total -= 100'); decisions++; }
    lines.push('    return total');
    const code = lines.join('\n');
    return num('What is the cyclomatic complexity of this function? (1 + one for each if, elif, for, while, and each extra and/or operand)', decisions + 1,
      `Decision points: ${decisions}. Complexity = ${decisions} + 1 = ${decisions + 1}. It is the number of independent paths, and a floor for how many tests branch coverage needs.`,
      `import ast\nsrc = ${PY(code)}\nn = 1\nfor node in ast.walk(ast.parse(src)):\n    if isinstance(node, (ast.If, ast.For, ast.While, ast.IfExp)): n += 1\n    elif isinstance(node, ast.BoolOp): n += len(node.values) - 1\nprint(n)`, { code });
  }),

  SKILL('se.ranges', 'Dependency ranges', 'npm\'s caret and tilde: which versions a range lets in.', t => {
    const [M, m, p] = [t.int(0, 3), t.int(0, 5), t.int(0, 9)], op = t.pick(['^', '~']);
    const cands = [...new Set(Array.from({ length: 7 }, () => `${t.int(Math.max(0, M - 1), M + 1)}.${t.int(0, 7)}.${t.int(0, 12)}`))];
    const cmp = (x, y) => { for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };
    const lo = [M, m, p], hi = op === '~' ? [M, m + 1, 0] : M > 0 ? [M + 1, 0, 0] : m > 0 ? [0, m + 1, 0] : [0, 0, p + 1];
    const ok = cands.filter(v => { const x = v.split('.').map(Number); return cmp(x, lo) >= 0 && cmp(x, hi) < 0; });
    return num(`package.json asks for "${op}${M}.${m}.${p}". Of ${cands.join(', ')}, how many does the range accept?`, ok.length,
      `${op}${M}.${m}.${p} means ≥ ${lo.join('.')} and < ${hi.join('.')}${op === '^' && M === 0 ? ' (for 0.x versions the caret is stricter: the first non-zero part is treated as the major)' : ''}. Accepted: ${ok.join(', ') || 'none'}.`,
      `def parse(v): return tuple(int(x) for x in v.split('.'))\nM, m, p, op = ${M}, ${m}, ${p}, ${PY(op)}\nlo = (M, m, p)\nif op == '~': hi = (M, m + 1, 0)\nelif M > 0: hi = (M + 1, 0, 0)\nelif m > 0: hi = (0, m + 1, 0)\nelse: hi = (0, 0, p + 1)\nprint(sum(1 for v in ${PY(cands)} if lo <= parse(v) < hi))`);
  }),

  SKILL('se.delivery', 'Delivery metrics', 'Change failure rate and time to restore, from a deploy log.', t => {
    const deploys = Array.from({ length: t.int(6, 10) }, (_, i) => ({ id: i + 1, failed: t.rng() < 0.3, restore: t.int(10, 240) }));
    if (!deploys.some(d => d.failed)) deploys[0].failed = true;
    const fails = deploys.filter(d => d.failed);
    const form = t.rng() < 0.5;
    const ans = form ? Math.round((fails.length / deploys.length) * 10000) / 100 : Math.round((fails.reduce((s, d) => s + d.restore, 0) / fails.length) * 100) / 100;
    return num(`Deploy log: ${deploys.map(d => `#${d.id} ${d.failed ? `failed, restored in ${d.restore} min` : 'ok'}`).join('; ')}. What is the ${form ? 'change failure rate, in %' : 'mean time to restore, in minutes'}? (2 decimal places)`, ans,
      form ? `${fails.length} of ${deploys.length} deploys caused a failure: ${ans}%.` : `Average the restore times of the ${fails.length} failed deploys: ${ans} min.`,
      `D = ${PY(deploys.map(d => [d.failed ? 1 : 0, d.restore]))}\nF = [r for f, r in D if f]\nprint(${form ? '100 * len(F) / len(D)' : 'sum(F) / len(F)'})`, { tol: 0.006, dp: 2 });
  }),

  SKILL('se.flaky', 'Flaky tests', 'How a few flaky tests make a whole CI run unreliable — and what retries buy.', t => {
    const k = t.int(2, 20), p = t.pick([0.01, 0.02, 0.05]), retries = t.int(0, 2);
    const pass = (1 - p ** (retries + 1)) ** k;
    return num(`A suite has ${k} flaky tests, each failing independently with probability ${p} per run (the code is fine). ${retries ? `Each failing test is retried up to ${retries} time${retries > 1 ? 's' : ''}.` : 'There are no retries.'} What is the probability the CI run passes? (4 decimal places)`, Math.round(pass * 10000) / 10000,
      `A test fails the run only if every attempt fails: ${p}^${retries + 1}. All ${k} must pass: (1 − ${p}^${retries + 1})^${k} = ${pass.toFixed(4)}. ${retries ? 'Retries hide flakiness — they do not fix it.' : 'Without retries a handful of flaky tests turns red builds into noise.'}`,
      `from fractions import Fraction as F\np = F('${p}')\n# a test passes on the first attempt that passes\nok, still_failing = F(0), F(1)\nfor _ in range(${retries} + 1):\n    ok += still_failing * (1 - p); still_failing *= p\nrun = F(1)\nfor _ in range(${k}):\n    run *= ok\nprint(float(run))`, { tol: 0.0001, dp: 4 });
  }),
];
