/**
 * Computer Science, Term 3 — the course design, audited against primary
 * sources (October 2026), as Terms 1 and 2 were.
 *
 * Every Term 3 course now has an outside grader, the way Term 1 has check50:
 * OSTEP's homework simulators compute their own answers (-c), MIT's xv6 labs
 * run `make grade`, CMU's BusTub projects ship with tests, CS144's
 * checkpoints run `cmake --build build --target check`, PG Exercises checks
 * SQL, and Crafting Interpreters publishes its interpreter test suite.
 *
 * Sources: CS2023 (AL-Strategies, AL-Complexity, OS-*, DM-*, NC-*, FPL-*);
 * MIT 6.046J Spring 2015; OSTEP and its homework; MIT 6.1810 (xv6); CMU
 * 15-445; Stanford CS144; PLAI and Crafting Interpreters. Evidence in
 * docs/cs-term3-audit.md.
 */

const A046 = 'https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015';
const OSTEP_HW = 'https://github.com/remzi-arpacidusseau/ostep-homework/tree/master';
const XV6 = 'https://pdos.csail.mit.edu/6.1810/2024/labs';
const DB445 = 'https://15445.courses.cs.cmu.edu/fall2024';
const CS144 = 'https://cs144.github.io/assignments';
const CI = 'https://github.com/munificent/craftinginterpreters';

const o = (id, text, cs2023, skills, units, assessed = []) => ({ id, text, cs2023, skills, units, assessed });
const anchor = (full, part, none) => ({ full, part, none });
const py = s => s.trim();
const ostep = (dir, script, flags) => ({ name: `OSTEP homework: ${dir}/${script}`, url: `${OSTEP_HW}/${dir}`, cmd: `python3 ${script} ${flags} -c` });
const xv6 = (lab, name) => ({ name: `MIT 6.1810 xv6 lab: ${name}`, url: `${XV6}/${lab}.html`, cmd: 'make grade' });

export const CS_TERM3 = {
  'algorithm-design-and-analysis': {
    doc: 'docs/cs-term3-audit.md',
    outcomes: [
      o('cs301.analysis', 'Prove correctness and bound running time, including recurrences and amortised cost.', ['AL-Foundational', 'AL-Complexity 1–2'], ['alg.master', 'bigo', 'ops'], [1, 2]),
      o('cs301.dc', 'Design divide-and-conquer algorithms and binary search on the answer.', ['AL-Strategies 1'], ['bsearch', 'inversions'], [2]),
      o('cs301.greedy', 'Design greedy algorithms, prove them with exchange or cut arguments, and find counterexamples when they fail.', ['AL-Strategies 2', 'AL-Foundational 13b'], ['intervals', 'mst', 'twoptr'], [3], ['midterm']),
      o('cs301.paths', 'Compute shortest paths and know when each algorithm applies (negative edges, DAGs).', ['AL-Foundational 13a'], ['dijkstra', 'bfs', 'topo'], [3]),
      o('cs301.dp', 'Design dynamic programs: state, recurrence, order, base cases and reconstruction.', ['AL-Strategies 3'], ['alg.wis', 'knapsack', 'lis', 'lcs'], [4], ['midterm']),
      o('cs301.flow', 'Model problems as network flow and certify the answer with a minimum cut.', ['AL-Strategies', 'AL-Foundational 16'], ['alg.maxflow'], [5], ['final']),
      o('cs301.np', 'Reduce between problems and argue NP-completeness.', ['AL-Complexity 3–5'], ['alg.sat'], [6], ['final']),
      o('cs301.approx', 'Approximate intractable problems with a proven ratio, and compare against exact answers on small cases.', ['AL-Strategies', 'AL-Complexity'], ['alg.vc'], [7], ['final']),
    ],
    gaps: [
      { what: 'Lectures named by the wrong number', why: 'Five weeks cited 6.046J lectures by numbers and titles that do not exist ("Lecture 5 — Greedy: MST" is really Lecture 12).', fix: 'Matched by topic to the real lectures, titles corrected.', url: `${A046}/video_galleries/lecture-videos/` },
      { what: 'The final named an unnamed target', why: 'It asks for a reduction "to the course\'s named NP-hard target" without naming it.', fix: 'Reduce 3-SAT to vertex cover, the standard target; the answer checks size that reduction.' },
    ],
    benchmarks: [
      { id: 'cs301.q1', name: 'MIT 6.046J Quiz 1 (Spring 2015)', how: 'Sit it in 2 hours and mark it against MIT\'s solutions; record your percentage.', max: 100, url: `${A046}/pages/exams/` },
      { id: 'cs301.q2', name: 'MIT 6.046J Quiz 2 (Spring 2015)', how: 'The same, after unit 6.', max: 100, url: `${A046}/pages/exams/` },
      { id: 'cs301.cf', name: 'Codeforces rating', how: 'Your rating from rated contests (linked under Code). 1600+ is a strong signal for this course.', max: 4000, url: 'https://codeforces.com/' },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs301.mid.opt', q: 'What is the largest total value of compatible jobs among the six?', answer: 22, tol: 0,
          python: py(`from itertools import combinations
J = [(0, 3, 5), (1, 4, 7), (3, 5, 6), (4, 7, 9), (5, 8, 8), (7, 9, 6)]
print(max(sum(j[2] for j in c) for k in range(7) for c in combinations(J, k) if all(sorted(c)[i][1] <= sorted(c)[i + 1][0] for i in range(len(c) - 1))))`) },
        { id: 'cs301.mid.greedy', q: 'What total value does earliest-finish greedy collect, ignoring values?', answer: 19, tol: 0,
          python: py(`J = sorted([(0, 3, 5), (1, 4, 7), (3, 5, 6), (4, 7, 9), (5, 8, 8), (7, 9, 6)], key=lambda j: j[1])
t, end = 0, -1
for s, f, v in J:
    if s >= end: t += v; end = f
print(t)`) },
      ],
      final: [
        { id: 'cs301.fin.flow', q: 'What is the maximum number of worker-task assignments (task capacity 1)?', answer: 5, tol: 0,
          python: py(`from itertools import combinations
cap = [2, 1, 2, 1]; A = {0: [0, 2, 4], 1: [1, 2], 2: [0, 1, 3], 3: [3, 4]}
P = [(w, t) for w, ts in A.items() for t in ts]
print(max(k for k in range(len(P) + 1) for c in combinations(P, k) if all(sum(w == i for w, _ in c) <= cap[i] for i in range(4)) and all(sum(t == j for _, t in c) <= 1 for j in range(5))))`) },
        { id: 'cs301.fin.k', q: 'Reducing the three clauses to vertex cover by the standard construction, what is the target cover size k?', answer: 10, tol: 0, python: py('print(4 + 2 * 3)') },
      ],
    },
    anchors: {
      'midterm/Problem modeling': anchor('Jobs, compatibility (touching allowed) and the objective stated formally, with the decision question separated from the optimisation.', 'Model right, an edge case (touching intervals) unstated.', 'The problem is not modelled.'),
      'midterm/Correctness reasoning': anchor('The DP proved by induction on the sorted order, and greedy refuted by the counterexample (optimum 22 against greedy\'s 19).', 'A correct DP without proof, or the counterexample without the optimum.', 'Greedy claimed optimal.'),
      'midterm/Implementation and tests': anchor('DP with reconstruction, cross-checked against brute force on random small instances.', 'DP works on the given jobs only.', 'Wrong values.'),
      'midterm/Complexity and counterexamples': anchor('O(n log n) with sorting and binary search for p(i) argued; the smallest counterexample to greedy shown.', 'Complexity stated without the p(i) argument.', 'No analysis.'),
      'final/Flow correctness': anchor('The flow network drawn, a maximum flow of 5 found, and a cut of capacity 5 shown as the certificate.', 'Correct value, no certificate.', 'Wrong value or network.'),
      'final/Reduction validity': anchor('The 3-SAT → vertex cover gadgets built for these clauses, k = 10 justified, and both directions of the equivalence proved.', 'Construction right, one direction proved.', 'Reduction in the wrong direction.'),
      'final/Approximation guarantee': anchor('The 2-approximation\'s ratio proved and compared with the exact optimum on the constructed instance.', 'Ratio stated without proof.', 'No guarantee.'),
      'final/Experimental and oral defense': anchor('Exact against approximate results over a range of sizes, with a clear answer to "when would you use each?".', 'Results without interpretation.', 'No experiments.'),
    },
  },

  'operating-systems': {
    doc: 'docs/cs-term3-audit.md',
    grader: 'OSTEP\'s own simulators (run with -c to print the answers) and MIT 6.1810\'s xv6 labs (make grade) — not this app.',
    outcomes: [
      o('cs310.process', 'Explain processes and system calls, and predict what fork, exec and wait do.', ['OS-Process 1–3', 'OS-Principles'], ['os.fork'], [1]),
      o('cs310.sched', 'Implement and compare scheduling policies by turnaround and response time.', ['OS-Scheduling 1–4'], ['os.sched'], [2], ['midterm']),
      o('cs310.vm', 'Translate addresses through page tables and TLBs, and reason about their cost.', ['OS-Memory 1–4', 'AR-Memory 7'], ['os.eat', 'ar.vm'], [3, 4], ['midterm']),
      o('cs310.replace', 'Choose and simulate page-replacement policies.', ['OS-Memory 5'], ['os.paging'], [4], ['midterm']),
      o('cs310.sync', 'Synchronise threads with locks and condition variables, and recognise races.', ['OS-Concurrency 1–5'], ['os.race'], [5]),
      o('cs310.deadlock', 'Diagnose and avoid deadlock.', ['OS-Concurrency 6'], ['os.banker'], [6]),
      o('cs310.files', 'Implement a file system: inodes, directories, block allocation.', ['OS-Files 1–4'], ['os.inode'], [7], ['final']),
      o('cs310.crash', 'Keep data consistent across crashes with journaling and fsck.', ['OS-Faults', 'OS-Advanced-Files'], ['db.recovery'], [8], ['final']),
    ],
    gaps: [
      { what: 'The midterm trace is underspecified', why: 'It gives bursts as "3/2/2" and page lists, but not which pages each burst touches or how I/O alternates with CPU, so two correct simulators can disagree.', fix: 'State your reading of the trace (e.g. CPU, I/O, CPU, one page per tick) in the submission; the anchors mark consistency with your stated reading.' },
      { what: 'No kernel', why: 'Every unit simulates; none touches a real kernel, which systems employers ask about.', fix: 'Do the xv6 labs alongside: system calls, page tables, copy-on-write fork and locks, each graded by make grade.', url: `${XV6}/util.html` },
    ],
    problemSets: {
      1: [ostep('cpu-intro', 'process-run.py', '-l 5:100,5:100')],
      2: [ostep('cpu-sched', 'scheduler.py', '-p RR -q 1 -j 3 -s 1'), ostep('cpu-sched-mlfq', 'mlfq.py', '-n 3 -j 3 -s 1')],
      3: [ostep('vm-freespace', 'malloc.py', '-n 10 -s 1')],
      4: [ostep('vm-paging', 'paging-linear-translate.py', '-s 1'), ostep('vm-smalltables', 'paging-multilevel-translate.py', '-s 1'), ostep('vm-beyondphys-policy', 'paging-policy.py', '-p LRU -s 1')],
      5: [ostep('threads-locks', 'x86.py', '-p flag.s -M flag,count -t 2')],
      7: [ostep('file-implementation', 'vsfs.py', '-n 6 -s 1')],
      8: [ostep('file-journaling', 'fsck.py', '-S 1')],
    },
    benchmarks: [
      { id: 'cs310.xv6', name: 'MIT 6.1810 xv6 labs passing make grade', how: 'Do util, syscall, pgtbl, cow and lock; record how many pass make grade in full.', max: 5, url: `${XV6}/util.html` },
    ],
    anchors: {
      'midterm/State-transition correctness': anchor('Every transition (ready, running, blocked, done) printed per tick and consistent with the stated reading of the trace.', 'Transitions mostly right; one blocking or arrival event mishandled.', 'States do not follow the policies.'),
      'midterm/Policy implementation': anchor('Round robin with quantum 2, two-entry LRU TLB and clock replacement each implemented and unit-tested in isolation.', 'Policies work together but untested alone.', 'A policy is wrong.'),
      'midterm/Trace validation': anchor('The simulator\'s metrics agree with a hand derivation, and the same paging sub-trace agrees with OSTEP\'s paging-policy.py -c.', 'Hand and simulator agree, no outside check.', 'No validation.'),
      'midterm/Systems analysis': anchor('Turnaround, response, TLB hit rate and faults explained: which policy choice moved which number.', 'Metrics reported without explanation.', 'No metrics.'),
      'final/Concurrency safety': anchor('Every shared structure guarded, a stress test with thread sanitizer clean, and the invariants named.', 'Mostly safe; a race shows under stress.', 'Data races.'),
      'final/Persistence integrity': anchor('Writes ordered with fsync so every crash point leaves a recoverable state, argued per crash point.', 'Recovers from most crash points.', 'Data lost on crash.'),
      'final/Fault-testing strength': anchor('Crashes injected at every write boundary (hundreds of runs), plus malformed requests and killed processes.', 'A few crash points tested.', 'No fault injection.'),
      'final/Architecture defense': anchor('Threading model, locking order and durability protocol justified against alternatives.', 'Described, not justified.', 'Not defended.'),
    },
  },

  'database-systems': {
    doc: 'docs/cs-term3-audit.md',
    grader: 'CMU 15-445\'s BusTub test suites and PG Exercises\' own answer checker — not this app.',
    outcomes: [
      o('cs320.sql', 'Write correct SQL, including joins, grouping and the NULL edge cases.', ['DM-Querying 1–3', 'DM-Relational'], ['db.sql', 'c.sql', 'web.injection'], [1]),
      o('cs320.design', 'Design schemas from functional dependencies and normalise them.', ['DM-Modeling', 'DM-Relational 3–5'], ['db.fd', 'db.bcnf'], [2]),
      o('cs320.storage', 'Implement page storage and a buffer pool.', ['DM-Internals 1–2'], [], [3], ['midterm']),
      o('cs320.index', 'Build and reason about B+ tree and hash indexes.', ['DM-Internals 3', 'DM-Processing'], ['db.btree', 'ds.hash'], [4], ['midterm']),
      o('cs320.exec', 'Execute queries: join algorithms and their I/O costs.', ['DM-Processing 1–3'], ['db.joincost'], [5]),
      o('cs320.optim', 'Estimate cardinalities and choose plans.', ['DM-Processing 4'], ['db.estimate'], [6], ['final']),
      o('cs320.txn', 'Guarantee isolation with locking and validation; test serializability.', ['DM-Core', 'DM-Internals 4'], ['db.serial'], [7], ['final']),
      o('cs320.recovery', 'Recover from crashes with write-ahead logging.', ['DM-Internals 5'], ['db.recovery'], [8], ['final']),
    ],
    gaps: [
      { what: 'Every unit linked the schedule page', why: 'All eight units pointed at the 15-445 schedule, not the lecture or project they meant.', fix: 'The problem sets below link each BusTub project and the SQL homework directly.' },
    ],
    problemSets: {
      1: [{ name: 'PG Exercises — SQL, auto-checked', url: 'https://pgexercises.com/', cmd: 'answers checked on the site' }, { name: 'CMU 15-445 Homework 1 — SQL', url: `${DB445}/homework1/` }],
      3: [{ name: 'CMU 15-445 Project 1 — Buffer Pool Manager', url: `${DB445}/project1/`, cmd: 'make -j buffer_pool_manager_test lru_k_replacer_test && ./test/...' }],
      4: [{ name: 'CMU 15-445 Project 2 — B+Tree', url: `${DB445}/project2/`, cmd: 'make -j b_plus_tree_insert_test b_plus_tree_delete_test' }],
      5: [{ name: 'CMU 15-445 Project 3 — Query Execution', url: `${DB445}/project3/`, cmd: 'make -j sqllogictest && ./bin/bustub-sqllogictest ../test/sql/p3.*.slt' }],
      7: [{ name: 'CMU 15-445 Project 4 — Concurrency Control', url: `${DB445}/project4/`, cmd: 'make -j sqllogictest && ./bin/bustub-sqllogictest ../test/sql/p4.*.slt' }],
    },
    benchmarks: [
      { id: 'cs320.bustub', name: 'BusTub projects 1–4, by their local tests', how: 'Record how many of the four projects pass every local test (the public Gradescope autograder adds hidden tests).', max: 4, url: 'https://github.com/cmu-db/bustub' },
      { id: 'cs320.pgex', name: 'PG Exercises completed', how: 'Record the percentage of exercises you completed correctly without looking at the answers.', max: 100, url: 'https://pgexercises.com/' },
    ],
    keyChecks: {
      final: [
        { id: 'cs320.fin.committed', q: 'If the crash comes right after T1\'s commit record is flushed, what is B after recovery?', answer: 15, tol: 0, python: py("db = {'A': 10, 'B': 20}\nlog = [('T1', 'A', 10, 15), ('T1', 'B', 20, 15)]\ncommitted = {'T1'}\nfor t, x, b, a in log: db[x] = a\nfor t, x, b, a in reversed(log):\n    if t not in committed: db[x] = b\nprint(db['B'])") },
        { id: 'cs320.fin.uncommitted', q: 'If the crash comes after T1\'s page writes but before its commit record is appended, what is A after recovery?', answer: 10, tol: 0, python: py("db = {'A': 10, 'B': 20}\nlog = [('T1', 'A', 10, 15), ('T1', 'B', 20, 15)]\ncommitted = set()\nfor t, x, b, a in log: db[x] = a\nfor t, x, b, a in reversed(log):\n    if t not in committed: db[x] = b\nprint(db['A'])") },
      ],
    },
    anchors: {
      'midterm/Page-management safety': anchor('Pinned pages never evicted, dirty pages written back before reuse, pin counts balanced in every test.', 'Correct under single-threaded tests only.', 'Pinned or dirty pages lost.'),
      'midterm/B+ tree correctness': anchor('Search, insert, delete, split, borrow and merge agree with an ordered map at every step of all three seeded runs, structural invariants checked.', 'Inserts correct; deletes fail an edge case.', 'Lookups wrong.'),
      'midterm/Test depth': anchor('Differential testing against an ordered map, plus BusTub\'s own B+Tree tests passing.', 'Example tests only.', 'No tests.'),
      'midterm/Storage analysis': anchor('Occupancy, height and I/O per operation measured and explained against B+ tree theory.', 'Numbers without explanation.', 'No analysis.'),
      'final/Query and storage correctness': anchor('Queries return correct results across crash points; storage invariants hold.', 'Correct without crashes only.', 'Wrong results.'),
      'final/Isolation behavior': anchor('T2 never sees T1\'s uncommitted A = 15 with B = 20; the isolation level stated and demonstrated.', 'Isolation claimed but not demonstrated.', 'Dirty reads possible.'),
      'final/Recovery guarantees': anchor('All five crash points recover to a legal state matching the answer checks; the WAL rule cited for each.', 'Most crash points recover.', 'Recovery loses committed data or keeps uncommitted data.'),
      'final/Evidence and defense': anchor('Logs, plans and recovered states shown for every crash point, and the logging choices defended.', 'Partial evidence.', 'No evidence.'),
    },
  },

  'computer-networks': {
    doc: 'docs/cs-term3-audit.md',
    grader: 'Stanford CS144\'s checkpoint test suites (cmake --build build --target check0, check1, …) — not this app.',
    outcomes: [
      o('cs340.layers', 'Explain layering and compute delay, throughput and the bandwidth-delay product.', ['NC-Fundamentals 1–4'], ['net.delay', 'net.bdp'], [1]),
      o('cs340.apps', 'Use application protocols — HTTP and DNS — correctly.', ['NC-Applications 1–3'], ['py.http', 'web.cache'], [2]),
      o('cs340.sockets', 'Program reliable byte streams over sockets, handling partial reads and writes.', ['NC-Applications 4'], ['net.tcpseq'], [3]),
      o('cs340.reliable', 'Implement reliable delivery: reassembly, acknowledgements and retransmission.', ['NC-Reliability 1–3'], ['net.tcpseq', 'net.checksum'], [4], ['midterm']),
      o('cs340.routing', 'Address networks with CIDR and forward by longest-prefix match.', ['NC-Routing 1–3'], ['net.cidr', 'net.lpm', 'net.frag'], [5]),
      o('cs340.congestion', 'Explain and simulate congestion control.', ['NC-Reliability 4'], ['net.cwnd'], [6]),
      o('cs340.link', 'Capture and interpret link-layer and IP traffic, and measure a path.', ['NC-SingleHop 1–2'], ['net.frag'], [7], ['final']),
      o('cs340.security', 'Reason about network security and operational limits.', ['NC-Security 1–3'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'Checkpoints 5 and 7 are not posted this quarter', why: 'CS144 posts each checkpoint as its quarter reaches it; two weeks linked PDFs that are not up.', fix: 'Those weeks link the CS144 site; work from the latest posted checkpoint.', url: 'https://cs144.github.io/' },
      { what: 'Midterm sequence space is tiny on purpose', why: '8-byte sequence numbers wrap after 256 bytes; the trace is short enough that it never does.', fix: 'Continue the trace past 256 bytes as the brief asks and show wraparound explicitly.' },
    ],
    problemSets: {
      3: [{ name: 'CS144 Checkpoint 0 — networking warmup', url: `${CS144}/check0.pdf`, cmd: 'cmake --build build --target check0' }],
      4: [{ name: 'CS144 Checkpoint 1 — reassembler', url: `${CS144}/check1.pdf`, cmd: 'cmake --build build --target check1' }, { name: 'CS144 Checkpoint 2 — TCP receiver', url: `${CS144}/check2.pdf`, cmd: 'cmake --build build --target check2' }],
      8: [{ name: 'CS144 Checkpoint 3 — TCP sender', url: `${CS144}/check3.pdf`, cmd: 'cmake --build build --target check3' }],
    },
    benchmarks: [
      { id: 'cs340.cs144', name: 'CS144 checkpoints passing their test suites', how: 'Record how many of checkpoints 0–3 pass every test in their check target.', max: 4, url: 'https://cs144.github.io/' },
      { id: 'cs340.kr', name: 'Kurose–Ross interactive problems', how: 'Work the interactive problems for each chapter; each shows its answer. Record your percentage right first time.', max: 100, url: 'https://gaia.cs.umass.edu/kurose_ross/interactive/' },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs340.mid.bytes', q: 'By the end of the trace (after the timeout retransmits segment 4), how many bytes has the receiver delivered to the application?', answer: 8, tol: 0, python: py("print(sum(len(s) for s in ['AB', 'CD', 'EF', 'GH']))") },
        { id: 'cs340.mid.retx', q: 'How many segments does the sender retransmit?', answer: 1, tol: 0, python: py("events = ['1', '3', '2', 'dup-3', 'drop-4', 'timeout-4']\nprint(sum(1 for e in events if e.startswith('timeout')))") },
      ],
    },
    anchors: {
      'midterm/Stream correctness': anchor('Ordered, exactly-once output for the whole trace, including the duplicate and the retransmission.', 'Correct output, but a duplicate is buffered twice or an edge case leaks.', 'Out-of-order or duplicated output.'),
      'midterm/Adversarial handling': anchor('Reordering, duplication, loss and timeout each handled, with buffering bounded by the 4-byte window.', 'Most impairments handled.', 'Breaks under loss.'),
      'midterm/Protocol-state reasoning': anchor('Sender and receiver state shown after every event, including across sequence-number wraparound.', 'States for the main events only.', 'No state reasoning.'),
      'midterm/Test completeness': anchor('CS144\'s check1/check2 suites pass, plus your own tests for this trace.', 'Own tests only.', 'No tests.'),
      'final/Protocol integration': anchor('Transport, IP forwarding and the network interface interoperate with a real peer under impairment.', 'Works on loopback only.', 'Does not interoperate.'),
      'final/Measurement quality': anchor('Throughput, latency and loss measured under controlled impairment with repeated runs.', 'One-off measurements.', 'No measurement.'),
      'final/Failure and security handling': anchor('Malformed packets, floods and spoofing considered; limits stated and tested.', 'Some failure cases handled.', 'Not considered.'),
      'final/Technical defense': anchor('Design choices defended with measurements and the relevant RFCs.', 'Described but not defended.', 'No defence.'),
    },
  },

  'programming-languages': {
    doc: 'docs/cs-term3-audit.md',
    grader: 'Crafting Interpreters\' published test suite for its Lox interpreter — not this app.',
    outcomes: [
      o('cs410.eval', 'Write evaluators by substitution, and reason about programs equationally.', ['FPL-Formalism 1–2', 'FPL-Functional 1'], ['pl.let'], [1]),
      o('cs410.adt', 'Model data with algebraic types and total pattern matching.', ['FPL-Functional 2–3', 'FPL-Types 1'], ['py.oop'], [2]),
      o('cs410.recursion', 'Write structural recursions and folds, and know when foldl and foldr differ.', ['FPL-Functional 2'], ['pl.fold', 'py.recursion'], [3]),
      o('cs410.hof', 'Use higher-order functions and first-class functions, down to Church encodings.', ['FPL-Functional 3–4'], ['pl.church'], [4]),
      o('cs410.scope', 'Implement environments and closures, and tell lexical from dynamic scope.', ['FPL-Translation 2', 'FPL-Constructs'], ['pl.scope', 'pl.closure'], [5], ['midterm']),
      o('cs410.state', 'Add state and objects, and define evaluation order and strategy.', ['FPL-OOP 1–3', 'FPL-Run-Time'], ['pl.strategy'], [6, 8], ['final']),
      o('cs410.types', 'Implement type checking and inference.', ['FPL-Types 2–6'], [], [7], ['final']),
      o('cs410.design', 'Compare functional, imperative and object-oriented designs and defend language-design trade-offs.', ['FPL-Design', 'FPL-Pragmatics'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No outside grader', why: 'Interpreters built in this course were checked only by your own tests.', fix: 'Build Crafting Interpreters\' tree-walking Lox interpreter alongside PLAI and run its published test suite (about 250 tests).', url: CI },
    ],
    problemSets: {
      5: [{ name: 'Crafting Interpreters — Resolving and Binding (closures, scope)', url: 'https://craftinginterpreters.com/resolving-and-binding.html', cmd: 'dart tool/bin/test.dart chap11_resolving --interpreter <your interpreter>' }],
      8: [{ name: 'Crafting Interpreters — Classes and Inheritance', url: 'https://craftinginterpreters.com/classes.html', cmd: 'dart tool/bin/test.dart chap13_inheritance --interpreter <your interpreter>' }],
    },
    benchmarks: [
      { id: 'cs410.lox', name: 'Crafting Interpreters jlox test suite', how: 'Run the suite against your tree-walking interpreter; record the percentage of tests passed.', max: 100, url: CI },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs410.mid.lex', q: 'let x=1; let f=(fun y -> x+y); let x=9; f(2) — what is the result under lexical scope?', answer: 3, tol: 0, python: py('x = 1\nf = (lambda x: (lambda y: x + y))(x)\nx = 9\nprint(f(2))') },
        { id: 'cs410.mid.dyn', q: 'And under dynamic scope?', answer: 11, tol: 0, python: py("env = {'x': 1}\nbody = lambda env, y: env['x'] + y\nenv = {**env, 'x': 9}\nprint(body(env, 2))") },
      ],
    },
    anchors: {
      'midterm/Semantic correctness': anchor('The interpreter gives the lexical answer (3) and an explicit dynamic-scope mode gives 11; both match the answer checks.', 'Lexical right, dynamic mode missing.', 'Free variables resolved in the caller\'s environment.'),
      'midterm/Closure representation': anchor('Closures carry their defining environment; three loop closures each see their own binding when the language gives one per iteration.', 'Closures work but share one cell in the loop case.', 'No closures.'),
      'midterm/Equivalence evidence': anchor('Environment-based evaluation equals substitution on generated terminating programs (property-based test).', 'Equivalence on a few hand-picked programs.', 'No evidence.'),
      'midterm/Scope diagnosis': anchor('Both faults reproduced, explained by the environment each closure captured, and fixed.', 'One fault diagnosed.', 'Faults not diagnosed.'),
      'final/Interpreter behavior': anchor('Evaluation rules published and every one tested, including state and objects.', 'Most rules tested.', 'Interpreter incorrect.'),
      'final/Type-system implementation': anchor('A sound checker (or inference) that rejects the published ill-typed programs and accepts the well-typed ones.', 'Checker works with gaps.', 'No type system.'),
      'final/Specification and tests': anchor('Typing and evaluation rules written formally, with a test per rule and the Lox suite\'s relevant chapters passing.', 'Rules informal.', 'No specification.'),
      'final/Language-design defense': anchor('Trade-offs (static vs dynamic, eager vs lazy, objects vs closures) defended with examples from your language.', 'Trade-offs listed.', 'Not defended.'),
    },
  },
};
