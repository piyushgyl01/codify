/**
 * CS320 Database Systems — 15-445-style questions with exact answers: SQL
 * semantics (joins, GROUP BY, and the NULL traps), functional dependencies
 * and keys, BCNF, join I/O costs, B+ tree capacity, conflict
 * serializability, write-ahead-log recovery and cardinality estimates.
 * CS2023 DM-Relational, DM-Querying, DM-Internals, DM-Transactions.
 *
 * SQL is checked by running it in sqlite3; the rest by separate Python:
 * attribute closures over every subset, precedence graphs, and log replay.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const ATTRS = ['A', 'B', 'C', 'D', 'E'];

function closure(attrs, fds) {
  const c = new Set(attrs);
  for (let grew = true; grew;) { grew = false; for (const [l, r] of fds) if (l.every(a => c.has(a)) && !r.every(a => c.has(a))) { r.forEach(a => c.add(a)); grew = true; } }
  return c;
}

export const DB = [
  SKILL('db.sql', 'SQL semantics', 'Joins, GROUP BY and HAVING, and the places NULL changes the answer.', t => {
    const depts = [[1, 'eng'], [2, 'ops'], [3, 'law']].slice(0, t.int(2, 3));
    const emps = Array.from({ length: t.int(5, 7) }, (_, i) => [i + 1, `e${i + 1}`, t.rng() < 0.2 ? null : t.pick(depts.map(d => d[0]).concat([9])), t.int(3, 9) * 10]);
    const schema = `CREATE TABLE dept (id INTEGER, name TEXT);\nCREATE TABLE emp (id INTEGER, name TEXT, dept_id INTEGER, pay INTEGER);\nINSERT INTO dept VALUES ${depts.map(([i, n]) => `(${i}, '${n}')`).join(', ')};\nINSERT INTO emp VALUES ${emps.map(([i, n, d, p]) => `(${i}, '${n}', ${d ?? 'NULL'}, ${p})`).join(', ')};`;
    const form = t.int(0, 3);
    const deptIds = new Set(depts.map(d => d[0]));
    let sql, ans, why;
    if (form === 0) { sql = 'SELECT COUNT(*) FROM emp e JOIN dept d ON e.dept_id = d.id;'; ans = emps.filter(e => e[2] != null && deptIds.has(e[2])).length; why = 'An inner join keeps only rows with a match: NULL and unknown department ids drop out.'; }
    else if (form === 1) { sql = 'SELECT COUNT(*) FROM emp e LEFT JOIN dept d ON e.dept_id = d.id;'; ans = emps.length; why = 'A LEFT JOIN keeps every employee, matched or not (each dept id is unique here).'; }
    else if (form === 2) {
      const k = t.int(1, 2);
      sql = `SELECT COUNT(*) FROM (SELECT dept_id FROM emp GROUP BY dept_id HAVING COUNT(*) > ${k});`;
      const g = {}; emps.forEach(e => { const key = e[2] ?? 'null'; g[key] = (g[key] || 0) + 1; });
      ans = Object.values(g).filter(c => c > k).length; why = `GROUP BY puts all NULL dept_ids in one group; HAVING keeps groups with more than ${k} rows.`;
    } else {
      const bad = t.rng() < 0.5;
      sql = bad ? 'SELECT COUNT(*) FROM dept WHERE id NOT IN (SELECT dept_id FROM emp);' : 'SELECT COUNT(*) FROM dept WHERE id NOT IN (SELECT dept_id FROM emp WHERE dept_id IS NOT NULL);';
      const used = new Set(emps.filter(e => e[2] != null).map(e => e[2])), hasNull = emps.some(e => e[2] == null);
      ans = bad && hasNull ? 0 : depts.filter(d => !used.has(d[0])).length;
      why = bad && hasNull ? 'NOT IN against a list containing NULL is never true: x <> NULL is unknown, so no row qualifies. That is why NOT EXISTS is safer.' : 'With no NULL in the list, NOT IN returns the departments nobody works in.';
    }
    return num(`Tables: dept(id, name) = ${depts.map(([i, n]) => `(${i}, ${n})`).join(', ')}; emp(id, name, dept_id, pay) = ${emps.map(([i, n, d, p]) => `(${i}, ${n}, ${d ?? 'NULL'}, ${p})`).join(', ')}. What does this return?`, ans,
      `${why} Result: ${ans}.`, undefined, { sql: `${schema}\n${sql}`, code: sql });
  }),

  SKILL('db.fd', 'Functional dependencies and keys', 'Attribute closure, superkeys and candidate keys from a set of FDs.', t => {
    const attrs = ATTRS.slice(0, t.int(4, 5)), fds = [];
    for (let i = 0; i < t.int(3, 4); i++) { const l = t.pickN(attrs, t.int(1, 2)).sort(), r = [t.pick(attrs.filter(a => !l.includes(a)))]; fds.push([l, r]); }
    const fdText = fds.map(([l, r]) => `${l.join('')} → ${r.join('')}`).join(', ');
    if (t.rng() < 0.45) {
      const x = t.pickN(attrs, t.int(1, 2)).sort(), c = [...closure(x, fds)].sort();
      return num(`R(${attrs.join(', ')}) with FDs ${fdText}. How many attributes are in the closure ${x.join('')}⁺?`, c.length,
        `Start with ${x.join('')} and apply any FD whose left side is already in: ${x.join('')}⁺ = {${c.join(', ')}}.`,
        `attrs, F = ${PY(attrs)}, ${PY(fds)}\nc = set(${PY(x)})\nwhile True:\n    new = c | {a for l, r in F if set(l) <= c for a in r}\n    if new == c: break\n    c = new\nprint(len(c))`);
    }
    const keys = [];
    for (let m = 1; m < 1 << attrs.length; m++) {
      const s = attrs.filter((_, i) => m >> i & 1);
      if (closure(s, fds).size === attrs.length && !keys.some(k => k.every(a => s.includes(a)))) keys.push(s);
    }
    keys.sort((a, b) => a.length - b.length);
    const minimal = keys.filter(k => !keys.some(o => o !== k && o.every(a => k.includes(a))));
    return num(`R(${attrs.join(', ')}) with FDs ${fdText}. How many candidate keys does R have?`, minimal.length,
      `A candidate key is a minimal set whose closure is every attribute. Here: ${minimal.map(k => k.join('')).join(', ')}.`,
      `from itertools import combinations\nattrs, F = ${PY(attrs)}, ${PY(fds)}\ndef clo(s):\n    c = set(s)\n    while True:\n        new = c | {a for l, r in F if set(l) <= c for a in r}\n        if new == c: return c\n        c = new\nsupers = [set(s) for k in range(1, len(attrs) + 1) for s in combinations(attrs, k) if clo(s) == set(attrs)]\nprint(sum(1 for s in supers if not any(o < s for o in supers)))`);
  }),

  SKILL('db.bcnf', 'Normal forms', 'BCNF: every non-trivial FD\'s left side must be a superkey.', t => {
    const attrs = ATTRS.slice(0, 4), fds = [];
    for (let i = 0; i < t.int(2, 3); i++) { const l = t.pickN(attrs, t.int(1, 2)).sort(), r = [t.pick(attrs.filter(a => !l.includes(a)))]; fds.push([l, r]); }
    const viol = fds.filter(([l]) => closure(l, fds).size < attrs.length);
    const ok = !viol.length;
    return { kind: 'mc', q: `R(${attrs.join(', ')}) with FDs ${fds.map(([l, r]) => `${l.join('')} → ${r.join('')}`).join(', ')}. Is R in BCNF?`, options: ok ? ['Yes', 'No'] : ['No', 'Yes'], correct: 0,
      explain: ok ? 'Every FD\'s left side determines all of R, so each is a superkey: BCNF.' : `${viol.map(([l, r]) => `${l.join('')} → ${r.join('')}`).join(', ')} has a left side that is not a superkey (${viol[0][0].join('')}⁺ ≠ R), so R is not in BCNF; decompose on it.`,
      python: `attrs, F = ${PY(attrs)}, ${PY(fds)}\ndef clo(s):\n    c = set(s)\n    while True:\n        new = c | {a for l, r in F if set(l) <= c for a in r}\n        if new == c: return c\n        c = new\nprint('Yes' if all(clo(l) == set(attrs) for l, r in F) else 'No')` };
  }),

  SKILL('db.joincost', 'Join costs', 'Page I/Os for block nested loop, sort-merge and Grace hash join.', t => {
    const M = t.pick([500, 1000, 2000]), N = t.pick([200, 400, 800, 1000]), Bf = t.pick([12, 52, 102]), alg = t.pick(['bnl', 'grace', 'smj']);
    const outer = Math.min(M, N), inner = Math.max(M, N);
    const cost = alg === 'bnl' ? outer + Math.ceil(outer / (Bf - 2)) * inner : alg === 'grace' ? 3 * (M + N) : 5 * (M + N);
    return num(`R has ${M} pages, S has ${N}, and there are ${Bf} buffer pages. Ignoring the cost of writing the output, how many page I/Os does ${alg === 'bnl' ? 'block nested loop join take, with the smaller table as the outer' : alg === 'grace' ? 'Grace hash join take (one partitioning pass)' : 'sort-merge join take if each table sorts in two passes and the merge reads each once'}?`, cost,
      alg === 'bnl' ? `Read the outer once (${outer}), and the inner once per chunk of ${Bf} − 2 outer pages: ⌈${outer}/${Bf - 2}⌉ × ${inner} = ${Math.ceil(outer / (Bf - 2)) * inner}. Total ${cost}.`
        : alg === 'grace' ? `Partition both (read and write: 2(M + N)), then read the partitions once (M + N): 3 × (${M} + ${N}) = ${cost}.`
          : `Sorting each table in two passes costs 4 × its pages; the merge reads each once more: 5 × (${M} + ${N}) = ${cost}.`,
      `M, N, B, alg = ${M}, ${N}, ${Bf}, ${PY(alg)}\nimport math\nif alg == 'bnl':\n    o, i = min(M, N), max(M, N)\n    print(o + math.ceil(o / (B - 2)) * i)\nelif alg == 'grace':\n    print(2 * (M + N) + (M + N))\nelse:\n    print(2 * 2 * M + 2 * 2 * N + M + N)`);
  }),

  SKILL('db.btree', 'B+ tree capacity', 'How tall a B+ tree must be to index N keys at a given fan-out.', t => {
    const f = t.pick([100, 200, 400, 500]), L = t.pick([50, 100, 200]), N = t.pick([1e5, 1e6, 1e7, 1e8, 1e9]);
    let leaves = Math.ceil(N / L), h = 1, nodes = leaves; while (nodes > 1) { nodes = Math.ceil(nodes / f); h++; }
    return num(`A B+ tree's leaves hold ${L} keys each and its inner nodes have fan-out ${f}. With every node full, how many levels (counting the leaves) does it need for ${N.toLocaleString('en-US')} keys?`, h,
      `${N.toLocaleString('en-US')} / ${L} = ${leaves.toLocaleString('en-US')} leaves; each level above divides by ${f} until one root is left: ${h} levels. That is ${h} page reads per lookup — why B+ trees win on disk.`,
      `import math\nN, L, f = ${N}, ${L}, ${f}\nh, cap = 1, L\nwhile cap < N:\n    cap *= f; h += 1\nprint(h)`);
  }),

  SKILL('db.serial', 'Conflict serializability', 'Build the precedence graph; a cycle means the schedule is not conflict-serializable.', t => {
    const tx = ['T1', 'T2', 'T3'].slice(0, t.int(2, 3)), items = ['A', 'B'];
    const ops = Array.from({ length: t.int(5, 7) }, () => [t.pick(tx), t.pick(['R', 'W']), t.pick(items)]);
    const edges = new Set();
    ops.forEach(([ti, oi, xi], i) => ops.slice(i + 1).forEach(([tj, oj, xj]) => { if (ti !== tj && xi === xj && (oi === 'W' || oj === 'W')) edges.add(`${ti}>${tj}`); }));
    const adj = Object.fromEntries(tx.map(x => [x, [...edges].filter(e => e.startsWith(`${x}>`)).map(e => e.split('>')[1])]));
    const color = {}; let cyc = false;
    const dfs = u => { color[u] = 1; for (const v of adj[u]) { if (color[v] === 1) cyc = true; else if (!color[v]) dfs(v); } color[u] = 2; };
    tx.forEach(x => { if (!color[x]) dfs(x); });
    return { kind: 'mc', q: `Schedule: ${ops.map(([a, o, x]) => `${o}${a.slice(1)}(${x})`).join(', ')}. Is it conflict-serializable?`, options: cyc ? ['No', 'Yes'] : ['Yes', 'No'], correct: 0,
      explain: `Two operations conflict when they are from different transactions, on the same item, and at least one writes. Each conflict adds an edge to the precedence graph: ${[...edges].map(e => e.replace('>', ' → ')).join(', ') || 'none'}. ${cyc ? 'There is a cycle, so no serial order respects every conflict.' : 'No cycle, so any topological order is an equivalent serial schedule.'}`,
      python: `from itertools import permutations\nops, tx = ${PY(ops)}, ${PY(tx)}\ndef respects(order):\n    pos = {t: i for i, t in enumerate(order)}\n    for i, (ti, oi, xi) in enumerate(ops):\n        for tj, oj, xj in ops[i + 1:]:\n            if ti != tj and xi == xj and 'W' in (oi, oj) and pos[ti] > pos[tj]:\n                return False\n    return True\nprint('Yes' if any(respects(o) for o in permutations(tx)) else 'No')` };
  }),

  SKILL('db.recovery', 'Logging and recovery', 'After a crash, write-ahead logging redoes committed work and undoes the rest.', t => {
    const log = [], state = { A: 10, B: 20, C: 30 }, txs = ['T1', 'T2', 'T3'];
    // Strict two-phase locking: a transaction holds its write locks until it commits, so no one
    // overwrites uncommitted data (a dirty write would make undo clobber a committed value).
    const owner = {}, done = new Set();
    for (const tx of txs) log.push(`<${tx} start>`);
    for (let i = 0; i < t.int(6, 9); i++) {
      const tx = t.pick(txs.filter(x => !done.has(x)).concat([]));
      if (!tx) break;
      const free = ['A', 'B', 'C'].filter(x => !owner[x] || owner[x] === tx);
      if (free.length && t.rng() < 0.8) {
        const x = t.pick(free), before = state[x], after = before + t.int(1, 9);
        owner[x] = tx; log.push(`<${tx}, ${x}, ${before}, ${after}>`); state[x] = after;
      } else if (log.some(l => l.startsWith(`<${tx}, `))) {
        log.push(`<${tx} commit>`); done.add(tx);
        for (const x of Object.keys(owner)) if (owner[x] === tx) delete owner[x];
      }
    }
    const committed = new Set(log.filter(l => l.endsWith('commit>')).map(l => l.slice(1, 3)));
    const item = t.pick(['A', 'B', 'C']);
    // After recovery, each item holds the last value written by a committed transaction, else its original value.
    let val = { A: 10, B: 20, C: 30 }[item];
    for (const l of log) { const m = l.match(/^<(T\d), (\w), (\d+), (\d+)>$/); if (m && m[2] === item && committed.has(m[1])) val = +m[4]; }
    return num(`The database crashes after this log is flushed (A, B, C started at 10, 20, 30): ${log.join(' ')}. After undo/redo recovery, what is ${item}?`, val,
      `Redo every update in log order, then undo the updates of transactions with no commit record, newest first. Committed: ${[...committed].join(', ') || 'none'}. ${item} ends at ${val}.`,
      `import re\nlog = ${PY(log)}\ndb = {'A': 10, 'B': 20, 'C': 30}\ncommitted = {l[1:3] for l in log if l.endswith('commit>')}\nups = [m.groups() for m in (re.match(r'^<(T\\d), (\\w), (\\d+), (\\d+)>$', l) for l in log) if m]\nfor t, x, b, a in ups:\n    db[x] = int(a)\nfor t, x, b, a in reversed(ups):\n    if t not in committed: db[x] = int(b)\nprint(db[${PY(item)}])`);
  }),

  SKILL('db.estimate', 'Cardinality estimates', 'The optimiser\'s guesses: selectivity from distinct counts, and join sizes.', t => {
    const nr = t.pick([10000, 50000, 100000]), vr = t.pick([10, 50, 100, 1000]), ns = t.pick([5000, 20000, 40000]), vs = t.pick([10, 100, 500]);
    if (t.rng() < 0.5) return num(`R has ${nr.toLocaleString('en-US')} rows and ${vr} distinct values of a, uniformly spread. How many rows does the optimiser estimate for σ(a = const)(R)?`, nr / vr,
      `Selectivity 1/V(R, a) = 1/${vr}, so ${nr} / ${vr} = ${nr / vr}.`, `print(${nr} / ${vr})`, { tol: 0.5, dp: 0 });
    const est = (nr * ns) / Math.max(vr, vs);
    return num(`R(a) has ${nr.toLocaleString('en-US')} rows with ${vr} distinct a; S(a) has ${ns.toLocaleString('en-US')} rows with ${vs} distinct a. Under the usual containment assumption, how many rows does the optimiser estimate for R ⋈ S on a?`, est,
      `|R ⋈ S| ≈ |R|·|S| / max(V(R, a), V(S, a)) = ${nr} × ${ns} / ${Math.max(vr, vs)} = ${est.toLocaleString('en-US')}.`, `print(${nr} * ${ns} / max(${vr}, ${vs}))`, { tol: 0.5, dp: 0 });
  }),
];
