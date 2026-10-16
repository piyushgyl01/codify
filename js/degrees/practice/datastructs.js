/**
 * CS201 Data Structures — the operations whose results can be worked out by
 * hand and checked: amortised growth, stacks and queues, hashing with open
 * addressing and chaining, binary search trees, array heaps, and stable and
 * radix sorting. CS2023 AL-Foundational and SDF-Data-Structures.
 *
 * Every question carries `python`: an independent program (Python's own
 * collections, heapq and sorted where they apply) that prints the answer.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const csv = a => a.join(', ');
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;

export const DATASTRUCTS = [
  SKILL('ds.amortized', 'Dynamic arrays, amortised', 'A dynamic array doubles when full: count the copies, and see why appends are O(1) on average.', t => {
    const c0 = t.pick([1, 2, 4, 8]), n = t.int(20, 200), form = t.int(0, 1);
    let cap = c0, size = 0, copies = 0;
    for (let i = 0; i < n; i++) { if (size === cap) { copies += size; cap *= 2; } size++; }
    const py = `cap, size, copies = ${c0}, 0, 0\nfor _ in range(${n}):\n    if size == cap:\n        copies += size\n        cap *= 2\n    size += 1\nprint(${form === 0 ? 'copies' : 'cap'})`;
    return form === 0
      ? num(`A dynamic array starts with capacity ${c0} and doubles whenever it is full before an append. After ${n} appends, how many element copies have the resizes made in total?`, copies,
        `Each resize copies every element present: ${c0} + ${c0 * 2} + … up to the last resize = ${copies}. That is under 2n = ${2 * n}, so the average cost per append is constant.`, py)
      : num(`A dynamic array starts with capacity ${c0} and doubles whenever it is full before an append. What is its capacity after ${n} appends?`, cap,
        `It doubles from ${c0} until it holds ${n}: the first power-of-two multiple of ${c0} that is at least ${n} is ${cap}.`, py);
  }),

  SKILL('ds.stackq', 'Stacks and queues', 'Trace pushes and pops: last in, first out against first in, first out.', t => {
    const isStack = t.rng() < 0.5, ops = [];
    let next = 1, size = 0;
    for (let i = 0; i < 10; i++) {
      if (size > 0 && t.rng() < 0.4) { ops.push('pop'); size--; } else { ops.push(`push ${next * 3 % 17 + next}`); next++; size++; }
    }
    if (!ops.includes('pop')) { ops[ops.length - 1] = 'pop'; }
    const box = [], popped = [];
    for (const op of ops) { if (op === 'pop') popped.push(isStack ? box.pop() : box.shift()); else box.push(+op.split(' ')[1]); }
    const ds = isStack ? 'stack' : 'queue';
    const py = `from collections import deque\nd, out = deque(), []\nfor op in ${PY(ops)}:\n    if op == 'pop':\n        out.append(d.${isStack ? 'pop' : 'popleft'}())\n    else:\n        d.append(int(op.split()[1]))\nprint(sum(out))`;
    return num(`Start with an empty ${ds}. Apply: ${ops.join(', ')}. What do the popped values add up to?`, popped.reduce((a, b) => a + b, 0),
      `A ${ds} pops ${isStack ? 'the most recent push (last in, first out)' : 'the oldest push (first in, first out)'}. The pops return ${csv(popped)}, which add up to ${popped.reduce((a, b) => a + b, 0)}.`, py);
  }),

  SKILL('ds.hash', 'Hash tables', 'Linear probing and separate chaining with h(k) = k mod m: where keys land and how long chains get.', t => {
    const m = t.pick([7, 11, 13]), keys = t.pickN(Array.from({ length: 60 }, (_, i) => i + 10), t.int(5, 6));
    if (t.rng() < 0.6) {
      const table = Array(m).fill(null);
      for (const k of keys) { let s = k % m; while (table[s] !== null) s = (s + 1) % m; table[s] = k; }
      const k = keys[keys.length - 1], slot = table.indexOf(k);
      const py = `m = ${m}\nt = [None] * m\nfor k in ${PY(keys)}:\n    s = k % m\n    while t[s] is not None:\n        s = (s + 1) % m\n    t[s] = k\nprint(t.index(${k}))`;
      return num(`A table of ${m} slots uses h(k) = k mod ${m} with linear probing. Insert ${csv(keys)} in that order. In which slot (0 to ${m - 1}) does ${k} end up?`, slot,
        `${k} mod ${m} = ${k % m}. ${slot === k % m ? 'That slot was free.' : `Slots from ${k % m} on were taken, so it moved forward to ${slot}.`} Final table: [${table.map(x => (x === null ? '·' : x)).join(', ')}].`, py);
    }
    const chains = Array.from({ length: m }, () => []);
    for (const k of keys) chains[k % m].push(k);
    const longest = Math.max(...chains.map(c => c.length));
    const py = `from collections import Counter\nprint(max(Counter(k % ${m} for k in ${PY(keys)}).values()))`;
    return num(`A table of ${m} buckets uses separate chaining with h(k) = k mod ${m}. Insert ${csv(keys)}. How long is the longest chain?`, longest,
      `The keys hash to ${keys.map(k => `${k}→${k % m}`).join(', ')}; the busiest bucket holds ${longest}.`, py);
  }),

  SKILL('ds.bst', 'Binary search trees', 'Insert into a BST and read its shape: height, leaves and traversal orders.', t => {
    const keys = t.pickN(Array.from({ length: 40 }, (_, i) => i + 1), t.int(6, 8));
    const root = { k: keys[0], l: null, r: null };
    for (const k of keys.slice(1)) { let n = root; for (;;) { const side = k < n.k ? 'l' : 'r'; if (!n[side]) { n[side] = { k, l: null, r: null }; break; } n = n[side]; } }
    const height = n => (n ? 1 + Math.max(height(n.l), height(n.r)) : -1);
    const leaves = n => (!n ? 0 : !n.l && !n.r ? 1 : leaves(n.l) + leaves(n.r));
    const post = (n, out = []) => { if (n) { post(n.l, out); post(n.r, out); out.push(n.k); } return out; };
    const form = t.int(0, 2), po = post(root), i = t.int(1, keys.length);
    const pyTree = `keys = ${PY(keys)}\nroot = [keys[0], None, None]\nfor k in keys[1:]:\n    n = root\n    while True:\n        i = 1 if k < n[0] else 2\n        if n[i] is None:\n            n[i] = [k, None, None]\n            break\n        n = n[i]\n`;
    if (form === 0) return num(`Insert ${csv(keys)} into an empty binary search tree, in that order. What is its height (edges on the longest root-to-leaf path)?`, height(root),
      `The root is ${keys[0]}; each key goes left if smaller, right if larger. The deepest path has ${height(root)} edges.`, `${pyTree}def h(n):\n    return -1 if n is None else 1 + max(h(n[1]), h(n[2]))\nprint(h(root))`);
    if (form === 1) return num(`Insert ${csv(keys)} into an empty binary search tree, in that order. How many leaves does it have?`, leaves(root),
      `Build it, then count nodes with no children: ${leaves(root)}.`, `${pyTree}def lv(n):\n    if n is None: return 0\n    if n[1] is None and n[2] is None: return 1\n    return lv(n[1]) + lv(n[2])\nprint(lv(root))`);
    return num(`Insert ${csv(keys)} into an empty binary search tree, in that order. In a postorder traversal (left, right, node), which key comes ${i === 1 ? 'first' : `${i}th`}?`, po[i - 1],
      `Postorder visits both subtrees before the node: ${csv(po)}. Position ${i} is ${po[i - 1]}.`, `${pyTree}out = []\ndef post(n):\n    if n is None: return\n    post(n[1]); post(n[2]); out.append(n[0])\npost(root)\nprint(out[${i - 1}])`);
  }),

  SKILL('ds.heaparray', 'Heaps in an array', 'A binary min-heap stored in an array: children of i at 2i+1 and 2i+2, sift up on insert.', t => {
    const vals = t.pickN(Array.from({ length: 60 }, (_, i) => i + 1), 8), h = [];
    for (const v of vals) { h.push(v); let i = h.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (h[p] <= h[i]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } }
    const idx = t.int(1, 7);
    return num(`Insert ${csv(vals)} one at a time into an array-based binary min-heap (sift each new value up). What value is at index ${idx} (0-based) afterwards?`, h[idx],
      `After all inserts the array is [${csv(h)}]. Index ${idx} holds ${h[idx]}; its parent is index ${(idx - 1) >> 1}.`,
      `import heapq\nh = []\nfor v in ${PY(vals)}:\n    heapq.heappush(h, v)\nprint(h[${idx}])`);
  }),

  SKILL('ds.sort', 'Stable and radix sorting', 'Stability, and least-significant-digit radix sort pass by pass.', t => {
    if (t.rng() < 0.5) {
      const a = t.pickN(Array.from({ length: 900 }, (_, i) => i + 100), 7), pos = t.int(1, 7);
      const pass1 = [...a].sort((x, y) => (x % 10) - (y % 10));   // stable in modern JS
      return num(`LSD radix sort (base 10) on ${csv(a)}. After the first pass — a stable sort by the ones digit — what number is in position ${pos}?`, pass1[pos - 1],
        `Sorting stably by the last digit gives ${csv(pass1)}. Ties keep their original order, which is what makes later passes correct.`,
        `a = ${PY(a)}\nprint(sorted(a, key=lambda x: x % 10)[${pos - 1}])`);
    }
    const names = ['Ana', 'Bo', 'Cy', 'Di', 'Ed', 'Flo', 'Gus'], recs = names.map(n => [n, t.int(1, 3)]);
    const s = [...recs].sort((x, y) => x[1] - y[1]), who = t.pick(names), pos = s.findIndex(r => r[0] === who) + 1;
    return num(`Records (name, grade) in this order: ${recs.map(([n, g]) => `${n} ${g}`).join(', ')}. After a stable sort by grade, ascending, in which position (1–7) is ${who}?`, pos,
      `A stable sort keeps equal grades in their original order: ${s.map(([n, g]) => `${n} ${g}`).join(', ')}. ${who} is at position ${pos}.`,
      `r = ${PY(recs)}\nprint([n for n, g in sorted(r, key=lambda x: x[1])].index(${PY(who)}) + 1)`);
  }),
];
