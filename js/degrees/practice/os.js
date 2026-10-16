/**
 * CS310 Operating Systems — OSTEP-style questions with exact answers:
 * fork trees, CPU scheduling metrics, page replacement (FIFO, LRU, OPT,
 * clock), effective access time with a TLB, the lost-update race, inode
 * file-size limits, and the banker's safety check. CS2023 OS-Process,
 * OS-Scheduling, OS-Memory, OS-Concurrency, OS-FileSys, OS-Deadlock.
 *
 * Checks take other routes: real fork() calls in Python counting processes
 * through a pipe, independent simulators, exhaustive interleavings of the
 * racing threads, and brute force over every process order.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const r2 = x => Math.round(x * 100) / 100;

/* Each fork program, as C for the reader and as Python for a real run. */
const FORKS = [
  { c: 'fork();\nfork();\nprintf("x\\n");', py: 'os.fork()\nos.fork()', count: () => 4 },
  { c: 'fork();\nfork();\nfork();\nprintf("x\\n");', py: 'os.fork()\nos.fork()\nos.fork()', count: () => 8 },
  { c: 'if (fork() && fork())\n    fork();\nprintf("x\\n");', py: 'if os.fork() and os.fork():\n    os.fork()', count: () => 4 },
  { c: 'if (fork() || fork())\n    fork();\nprintf("x\\n");', py: 'if os.fork() or os.fork():\n    os.fork()', count: () => 5 },
  { c: 'fork() && (fork() || fork());\nprintf("x\\n");', py: 'os.fork() and (os.fork() or os.fork())', count: () => 4 },
];

export const OS = [
  SKILL('os.fork', 'Processes and fork()', 'Count the processes a fork() program creates — the parent sees a child\'s pid, the child sees 0.', t => {
    const loop = t.rng() < 0.3, n = t.int(2, 4);
    const f = loop ? { c: `for (int i = 0; i < ${n}; i++)\n    fork();\nprintf("x\\n");`, py: `for i in range(${n}):\n    os.fork()`, count: () => 2 ** n } : t.pick(FORKS);
    const ans = f.count();
    return num('How many times does this C program print x? (fork() returns the child\'s pid in the parent and 0 in the child; && and || short-circuit.)', ans,
      `${loop ? `Each pass doubles the number of processes: 2^${n} = ${ans}.` : 'Draw the process tree: every process that reaches printf prints once. Remember the parent sees a non-zero pid (true) and the child sees 0 (false), so && and || stop early in different processes.'} ${ans} lines.`,
      `import os\nr, w = os.pipe()\nroot = os.getpid()\n${f.py}\nos.write(w, b'x')\nif os.getpid() != root:\n    os._exit(0)\nos.close(w)\nn = 0\nwhile True:\n    b = os.read(r, 64)\n    if not b: break\n    n += len(b)\nprint(n)`,
      { code: f.c });
  }),

  SKILL('os.sched', 'CPU scheduling', 'FIFO, SJF, STCF and round robin: average turnaround and response time.', t => {
    const n = t.int(3, 4), jobs = Array.from({ length: n }, (_, i) => ({ id: `J${i + 1}`, at: i === 0 ? 0 : t.int(0, 6), run: t.int(1, 8) }));
    const pol = t.pick(['FIFO', 'SJF', 'RR']), q = t.pick([1, 2, 3]), metric = t.pick(['turnaround', 'response']);
    // Event-by-event simulation; ties broken by arrival, then name.
    const left = jobs.map(j => j.run), first = jobs.map(() => null), done = jobs.map(() => null);
    let time = 0, finished = 0, last = -1; const queue = [], seen = new Set();
    const admit = now => jobs.forEach((j, i) => { if (j.at <= now && !seen.has(i)) { seen.add(i); queue.push(i); } });
    admit(0);
    while (finished < n) {
      if (!queue.length) { time = Math.min(...jobs.filter((_, i) => !seen.has(i)).map(j => j.at)); admit(time); continue; }
      let k;
      if (pol === 'FIFO') k = queue.shift();
      else if (pol === 'SJF') { queue.sort((a, b) => jobs[a].run - jobs[b].run || jobs[a].at - jobs[b].at || a - b); k = queue.shift(); }
      else k = queue.shift();
      if (first[k] == null) first[k] = time;
      const slice = pol === 'RR' ? Math.min(q, left[k]) : left[k];
      time += slice; left[k] -= slice; last = k;
      admit(time);
      if (left[k] === 0) { done[k] = time; finished++; } else queue.push(k);
    }
    const tat = jobs.reduce((s, j, i) => s + done[i] - j.at, 0) / n, resp = jobs.reduce((s, j, i) => s + first[i] - j.at, 0) / n;
    const ans = r2(metric === 'turnaround' ? tat : resp);
    return num(`Jobs (arrival, run time): ${jobs.map(j => `${j.id} (${j.at}, ${j.run})`).join(', ')}. One CPU, ${pol === 'RR' ? `round robin with quantum ${q} (a job arriving at the moment a slice ends joins the queue before the preempted job)` : pol === 'SJF' ? 'non-preemptive shortest job first' : 'first in, first out'}. What is the average ${metric} time? (2 decimal places)`, ans,
      `${metric === 'turnaround' ? 'Turnaround = completion − arrival' : 'Response = first run − arrival'}, averaged over the ${n} jobs: ${ans}. ${pol === 'RR' ? 'Round robin is good for response time and bad for turnaround.' : pol === 'SJF' ? 'SJF minimises average turnaround when all jobs are present.' : 'FIFO suffers when a long job arrives first (the convoy effect).'}`,
      `jobs = ${PY(jobs.map(j => [j.at, j.run]))}\npol, q = ${PY(pol)}, ${q}\nn = len(jobs)\nleft = [r for a, r in jobs]; first = [None] * n; done = [None] * n\nt = 0; arrived = []; ready = []\ndef admit(now):\n    for i, (a, r) in enumerate(jobs):\n        if a <= now and i not in arrived:\n            arrived.append(i); ready.append(i)\nadmit(0)\nwhile None in done:\n    if not ready:\n        t = min(a for i, (a, r) in enumerate(jobs) if i not in arrived); admit(t); continue\n    if pol == 'SJF':\n        ready.sort(key=lambda i: (jobs[i][1], jobs[i][0], i))\n    k = ready.pop(0)\n    if first[k] is None: first[k] = t\n    run = min(q, left[k]) if pol == 'RR' else left[k]\n    t += run; left[k] -= run\n    admit(t)\n    if left[k] == 0: done[k] = t\n    else: ready.append(k)\nm = [done[i] - jobs[i][0] for i in range(n)] if ${PY(metric)} == 'turnaround' else [first[i] - jobs[i][0] for i in range(n)]\nprint(sum(m) / n)`,
      { tol: 0.006, dp: 2 });
  }),

  SKILL('os.paging', 'Page replacement', 'Count page faults for FIFO, LRU, OPT and the clock algorithm.', t => {
    const refs = Array.from({ length: t.int(10, 14) }, () => t.int(0, 5)), frames = t.int(3, 4), pol = t.pick(['FIFO', 'LRU', 'OPT', 'CLOCK']);
    let faults = 0;
    if (pol === 'CLOCK') {
      const slot = Array(frames).fill(null), ref = Array(frames).fill(0); let hand = 0;
      for (const p of refs) {
        const at = slot.indexOf(p);
        if (at >= 0) { ref[at] = 1; continue; }
        faults++;
        while (slot[hand] !== null && ref[hand]) { ref[hand] = 0; hand = (hand + 1) % frames; }
        slot[hand] = p; ref[hand] = 1; hand = (hand + 1) % frames;
      }
    } else {
      const mem = [];
      refs.forEach((p, i) => {
        const at = mem.indexOf(p);
        if (at >= 0) { if (pol === 'LRU') { mem.splice(at, 1); mem.push(p); } return; }
        faults++;
        if (mem.length === frames) {
          if (pol === 'OPT') {
            const next = mem.map(m => { const k = refs.indexOf(m, i + 1); return k < 0 ? Infinity : k; });
            mem.splice(next.indexOf(Math.max(...next)), 1);
          } else mem.shift();
        }
        mem.push(p);
      });
    }
    return num(`Reference string: ${refs.join(' ')}. ${frames} frames, initially empty. How many page faults does ${pol === 'CLOCK' ? 'the clock (second-chance) algorithm' : pol} incur?`, faults,
      `${pol === 'OPT' ? 'OPT evicts the page used furthest in the future — the bound no real policy can beat.' : pol === 'LRU' ? 'LRU evicts the page unused for longest.' : pol === 'FIFO' ? 'FIFO evicts the page loaded earliest, however recently it was used.' : 'Clock sweeps a hand, clearing reference bits, and evicts the first page whose bit is already clear.'} Faults: ${faults} (the first ${frames} distinct pages are compulsory misses).`,
      `refs, k, pol = ${PY(refs)}, ${frames}, ${PY(pol)}\nfaults = 0\nif pol == 'CLOCK':\n    slot = [None] * k; bit = [0] * k; hand = 0\n    for p in refs:\n        if p in slot:\n            bit[slot.index(p)] = 1; continue\n        faults += 1\n        while slot[hand] is not None and bit[hand]:\n            bit[hand] = 0; hand = (hand + 1) % k\n        slot[hand] = p; bit[hand] = 1; hand = (hand + 1) % k\nelse:\n    from collections import OrderedDict\n    mem = OrderedDict()\n    for i, p in enumerate(refs):\n        if p in mem:\n            if pol == 'LRU': mem.move_to_end(p)\n            continue\n        faults += 1\n        if len(mem) == k:\n            if pol == 'OPT':\n                far = max(mem, key=lambda m: refs.index(m, i + 1) if m in refs[i + 1:] else 10 ** 9)\n                del mem[far]\n            else:\n                mem.popitem(last=False)\n        mem[p] = True\nprint(faults)`);
  }),

  SKILL('os.eat', 'TLBs and effective access time', 'What a TLB miss costs, through a multi-level page table.', t => {
    const mem = t.pick([50, 80, 100]), tlb = t.pick([1, 2, 5, 10]), hit = t.pick([0.9, 0.95, 0.98, 0.99]), levels = t.pick([1, 2, 4]);
    const eat = hit * (tlb + mem) + (1 - hit) * (tlb + levels * mem + mem);
    return num(`Memory access takes ${mem} ns, a TLB lookup ${tlb} ns, and the TLB hit rate is ${hit}. A miss walks a ${levels}-level page table (one memory access per level) before the data access. What is the effective access time, in ns? (2 decimal places)`, r2(eat),
      `EAT = h·(TLB + mem) + (1 − h)·(TLB + ${levels}·mem + mem) = ${hit}·${tlb + mem} + ${r2(1 - hit)}·${tlb + (levels + 1) * mem} = ${r2(eat)} ns. Deeper tables make misses dearer, which is why the hit rate matters so much.`,
      `h, t, m, L = ${hit}, ${tlb}, ${mem}, ${levels}\nprint(h * (t + m) + (1 - h) * (t + (L + 1) * m))`, { tol: 0.006, dp: 2 });
  }),

  SKILL('os.race', 'Races and the lost update', 'counter++ is a load, an add and a store: what two unsynchronised threads can leave behind.', t => {
    const n = t.int(2, 3), ask = t.pick(['min', 'max']), ans = ask === 'max' ? 2 * n : 2;
    return num(`Two threads each run "for (i = 0; i < ${n}; i++) counter++;" on a shared counter that starts at 0, with no lock. counter++ compiles to load, add, store. What is the ${ask === 'min' ? 'smallest' : 'largest'} final value any interleaving can produce?`, ans,
      ask === 'max' ? `With no overlap every increment lands: ${2 * n}.` : `The surprise: 2, not ${n}. Thread A loads 0 and stalls; B runs all but its last increment; A stores 1; B loads 1; A finishes its remaining increments; B stores 2 last. A lock (or an atomic increment) makes the answer always ${2 * n}.`,
      `from functools import lru_cache\nN = ${n}\n# state: (pc_a, reg_a, pc_b, reg_b, counter); each iteration is load then store(reg + 1)\n@lru_cache(None)\ndef ends(a, ra, b, rb, c):\n    out = set()\n    if a == 2 * N and b == 2 * N: return frozenset([c])\n    if a < 2 * N:\n        out |= ends(a + 1, c, b, rb, c) if a % 2 == 0 else ends(a + 1, ra, b, rb, ra + 1)\n    if b < 2 * N:\n        out |= ends(a, ra, b + 1, c, c) if b % 2 == 0 else ends(a, ra, b + 1, rb, rb + 1)\n    return frozenset(out)\nv = ends(0, 0, 0, 0, 0)\nprint(${ask === 'min' ? 'min' : 'max'}(v))`);
  }),

  SKILL('os.inode', 'Inodes and file size', 'How big a file can be with direct, single- and double-indirect pointers.', t => {
    const B = t.pick([1024, 4096]), ptr = 4, direct = t.pick([10, 12]), dbl = t.rng() < 0.6, per = B / ptr;
    const blocks = direct + per + (dbl ? per * per : 0);
    const kib = (blocks * B) / 1024;
    return num(`An inode has ${direct} direct block pointers, one single-indirect pointer${dbl ? ' and one double-indirect pointer' : ''}. Blocks are ${B} bytes and pointers ${ptr} bytes. What is the largest file, in KiB?`, kib,
      `An indirect block holds ${B}/${ptr} = ${per} pointers. Blocks: ${direct} + ${per}${dbl ? ` + ${per}² = ${direct} + ${per} + ${per * per}` : ''} = ${blocks}; × ${B} bytes = ${kib} KiB.`,
      `B, p, d = ${B}, ${ptr}, ${direct}\nk = B // p\nprint((d + k + ${dbl ? 'k * k' : '0'}) * B // 1024)`);
  }),

  SKILL('os.banker', 'Deadlock avoidance', 'Is the state safe? The banker\'s algorithm on allocation, maximum and available.', t => {
    const n = 3, m = 2, alloc = Array.from({ length: n }, () => Array.from({ length: m }, () => t.int(0, 3)));
    const max = alloc.map(r => r.map(x => x + t.int(0, 4))), avail = Array.from({ length: m }, () => t.int(0, 3));
    const need = max.map((r, i) => r.map((x, j) => x - alloc[i][j]));
    const work = [...avail], fin = Array(n).fill(false);
    for (let progress = true; progress;) { progress = false; for (let i = 0; i < n; i++) if (!fin[i] && need[i].every((x, j) => x <= work[j])) { fin[i] = true; alloc[i].forEach((x, j) => { work[j] += x; }); progress = true; } }
    const safe = fin.every(Boolean);
    return { kind: 'mc', q: `Two resource types. Available: (${avail.join(', ')}). ${alloc.map((a, i) => `P${i}: allocated (${a.join(', ')}), maximum (${max[i].join(', ')})`).join('; ')}. Is this state safe?`, options: safe ? ['Yes', 'No'] : ['No', 'Yes'], correct: 0,
      explain: `Need = maximum − allocated: ${need.map((r, i) => `P${i} (${r.join(', ')})`).join(', ')}. Repeatedly find a process whose need fits in what is available, let it finish and return its allocation. ${safe ? 'Every process can finish, so the state is safe.' : 'At some point no remaining process fits, so the state is unsafe.'}`,
      python: `from itertools import permutations\nalloc, mx, avail = ${PY(alloc)}, ${PY(max)}, ${PY(avail)}\ndef ok(order):\n    w = list(avail)\n    for i in order:\n        if any(mx[i][j] - alloc[i][j] > w[j] for j in range(len(w))): return False\n        w = [w[j] + alloc[i][j] for j in range(len(w))]\n    return True\nprint('Yes' if any(ok(o) for o in permutations(range(${n}))) else 'No')` };
  }),
];
