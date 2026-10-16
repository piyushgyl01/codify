/**
 * Computer Science, Term 2 — the course design, audited against primary
 * sources (October 2026), the same way as Term 1 (see cs-term1.js).
 *
 * Course Atlas gave each course one real outcome and two boilerplate ones,
 * and template rubric lines. This replaces them with outcomes mapped to the
 * CS2023 Body of Knowledge, the units that teach them and the practice that
 * checks them; marking anchors for every rubric line; answer checks where an
 * assessment has numbers; and outside benchmarks with official answers:
 * MIT 6.006 quizzes, Nand2Tetris's own test scripts, 18.06SC exams, Stat 110
 * finals, and the W3C, axe, Lighthouse and Observatory checkers.
 *
 * Sources: CS2023 (AL-Foundational, SDF-Data-Structures, AR-*, MSF-Linear,
 * MSF-Probability, SPD-Web, HCI-Accessibility); MIT 6.006 Fall 2011, 6.004
 * Spring 2017 and 18.06SC Fall 2011 on OCW; Harvard Stat 110; MDN Learn Web
 * Development; WCAG 2.2; the Fetch and URL standards. Evidence in
 * docs/cs-term2-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';
const A006 = `${OCW}/6-006-introduction-to-algorithms-fall-2011`;
const LA06 = `${OCW}/18-06sc-linear-algebra-fall-2011/pages`;
const N2T = 'https://www.nand2tetris.org';
const S110 = 'https://stat110.hsites.harvard.edu';

const o = (id, text, cs2023, skills, units, assessed = []) => ({ id, text, cs2023, skills, units, assessed });
const anchor = (full, part, none) => ({ full, part, none });
const py = s => s.trim();

export const CS_TERM2 = {
  'data-structures': {
    doc: 'docs/cs-term2-audit.md',
    outcomes: [
      o('cs201.adt', 'Specify an abstract data type and choose its representation by the cost of each operation, including amortised cost.', ['AL-Foundational 1–3', 'SDF-Data-Structures 1–3'], ['bigo', 'ds.amortized'], [1, 2]),
      o('cs201.linear', 'Implement and trace stacks, queues and linked lists, including the monotonic stack.', ['AL-Foundational 4–6'], ['ds.stackq', 'nextgreater'], [2]),
      o('cs201.invariants', 'State representation invariants and test them with randomized, model-based tests.', ['SDF-Practices 1', 'AL-Foundational 1'], ['py.pytest', 'py.boundary'], [3], ['midterm', 'final']),
      o('cs201.hash', 'Analyse hash tables: where keys land under chaining and probing, load factor, and resizing.', ['AL-Foundational 7'], ['ds.hash', 'freq'], [4], ['midterm']),
      o('cs201.trees', 'Build and traverse binary search trees, and predict their shape from the insertion order.', ['AL-Foundational 9a', 'AL-Foundational 11b'], ['ds.bst'], [5]),
      o('cs201.pq', 'Maintain array heaps and disjoint sets, and use them as priority queues and for connectivity.', ['AL-Foundational 6a, 9b, 10'], ['ds.heaparray', 'heap', 'dsu'], [6], ['final']),
      o('cs201.graphs', 'Represent graphs as lists or matrices and traverse them: BFS, DFS and topological order.', ['AL-Foundational 8, 13', 'AL-Foundational 15b'], ['bfs', 'dfs', 'topo'], [7], ['final']),
      o('cs201.sorting', 'Sort stably, sort in linear time when the keys allow it, and count the work done.', ['AL-Foundational 12, 14'], ['ds.sort', 'inversions', 'prefix'], [8], ['final']),
    ],
    gaps: [
      { what: 'Lectures named by the wrong number', why: 'Two weeks linked 6.006 lectures that do not exist, and one named "Lecture 11 — Integer Sorting", which is really Lecture 7.', fix: 'Linked to the real lectures, titles corrected.', url: `${A006}/video_galleries/lecture-videos/` },
      { what: 'No balanced trees', why: 'CS2023 puts balanced search trees in the core (AL-Foundational 9b); the units stop at plain BSTs and heaps.', fix: 'Watch 6.006 Lecture 6 (AVL trees) with unit 5, and add an AVL insert to your library.', url: `${A006}/resources/lecture-6-avl-trees-avl-sort/` },
      { what: 'The midterm\'s resize rule was loose', why: '"Grow above load 0.75" does not say when the load is checked.', fix: 'The answer checks assume it is checked after every insert, doubling when size/capacity > 0.75.' },
    ],
    benchmarks: [
      { id: 'cs201.q1', name: 'MIT 6.006 Quiz 1 (Fall 2011)', how: 'Sit it closed-book in 2 hours, mark it against MIT\'s solutions, and record your percentage.', max: 100, url: `${A006}/pages/exams/` },
      { id: 'cs201.q2', name: 'MIT 6.006 Quiz 2 (Fall 2011)', how: 'The same, after unit 7.', max: 100, url: `${A006}/pages/exams/` },
      { id: 'cs201.final', name: 'MIT 6.006 Final (Fall 2011)', how: 'Three hours, closed-book, against the official solutions; record your percentage.', max: 100, url: `${A006}/pages/exams/` },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs201.mid.cap', q: 'Your table starts at capacity 8 and doubles whenever size/capacity exceeds 0.75 after an insert. After inserting a, i, q, y and the 10,000 generated keys (all distinct), what is its capacity?', answer: 16384, tol: 0,
          python: py(`keys = set(['a', 'i', 'q', 'y'] + [f'key-{i % 97}-{i}' for i in range(10000)])
cap, size = 8, 0
for _ in keys:
    size += 1
    if size / cap > 0.75: cap *= 2
print(cap)`) },
        { id: 'cs201.mid.grows', q: 'How many times did it grow?', answer: 11, tol: 0,
          python: py(`cap, size, grows = 8, 0, 0
for _ in range(10004):
    size += 1
    if size / cap > 0.75: cap *= 2; grows += 1
print(grows)`) },
      ],
    },
    anchors: {
      'midterm/ADT correctness': anchor('All six operations behave like a dict on every key, including a, i, q and y and deleted-then-reinserted keys; black-box tests prove it.', 'Normal keys work; deletion or reinsertion after deletion fails in an edge case.', 'Lookups miss keys that were inserted.'),
      'midterm/Invariant and resize safety': anchor('Load stays within [0.20, 0.75] after every operation, capacity never drops below 8, and every key survives every resize — each checked by an assertion after every operation in the tests.', 'Resizing works but one invariant (the shrink floor, or tombstones) is unchecked.', 'Keys are lost or duplicated across a resize.'),
      'midterm/Experimental design': anchor('Collisions and probe lengths measured over the 10,000-key workload with a fixed seed, plotted against load factor, with the expected curve beside them.', 'Timings without collision counts, or one run only.', 'No measurement, or measurements that cannot be reproduced.'),
      'midterm/Complexity reasoning': anchor('Amortised O(1) for put and delete argued from the measured resize copies (the total stays under 2n), and the worst case stated.', 'The O(1) claim is made but not tied to the measurements.', 'Costs asserted without argument, or wrong.'),
      'final/Implementation correctness': anchor('All five abstractions pass differential tests against trusted containers (dict, heapq, a reference union-find, networkx or your own brute force) on the seed-201 workload.', 'Most abstractions pass; one fails an edge case.', 'The library fails on the public workload.'),
      'final/Test and invariant strength': anchor('Invariant checks for every structure, property-based tests, and at least one bug the randomized tests found, logged.', 'Example-based tests only, or invariants for some structures.', 'Tests that would pass on a broken implementation.'),
      'final/Performance evidence': anchor('The seed-201 benchmark reproduced from one command, with per-operation costs and at least one representation compared against another on the same workload.', 'Benchmarks exist but cannot be reproduced, or compare nothing.', 'No performance evidence.'),
      'final/Representation defense': anchor('Each representation chosen from the workload\'s operation mix, with the measured cost that justified it and the alternative rejected.', 'Choices described without measured justification.', 'Representations not explained.'),
    },
  },

  'computer-architecture': {
    doc: 'docs/cs-term2-audit.md',
    grader: 'Nand2Tetris\'s own test scripts, run in its Hardware Simulator and CPU Emulator — not this app.',
    outcomes: [
      o('cs210.logic', 'Design combinational and sequential logic: truth tables, minimisation and finite-state machines.', ['AR-Logic 1'], ['ar.bool'], [1]),
      o('cs210.repr', 'Represent integers and floating-point numbers in binary, and reason about their range and precision.', ['AR-Representation 2–4'], ['ar.float', 'bits', 'c.binary'], [1, 2]),
      o('cs210.isa', 'Read, trace and encode RISC-V instructions, including procedure calls and the stack.', ['AR-Assembly 5–6, 8'], ['ar.riscv', 'ar.encode'], [2]),
      o('cs210.datapath', 'Build a single-cycle datapath and find its critical path.', ['AR-Organization 1–2', 'AR-Assembly 2'], ['ar.critical'], [3]),
      o('cs210.pipeline', 'Pipeline a processor and resolve its hazards with stalls and forwarding.', ['AR-Organization 1, 3–4'], ['ar.pipeline'], [4], ['midterm']),
      o('cs210.cache', 'Design and simulate caches, and quantify locality with AMAT.', ['AR-Memory 1, 4, 5'], ['ar.cache', 'ar.amat'], [5], ['final']),
      o('cs210.vm', 'Translate virtual addresses, and model exceptions and memory-mapped I/O.', ['AR-Memory 7', 'AR-Assembly 7'], ['ar.vm'], [6], ['final']),
      o('cs210.perf', 'Measure and model performance: CPI, Amdahl\'s law and parallel speed-up.', ['AR-Performance-Energy 1, 5', 'AR-Assembly 3–4'], ['ar.amdahl'], [7], ['final']),
    ],
    gaps: [
      { what: 'Every 6.004 link was dead', why: 'The weeks linked 6.004 pages (lecture notes, labs, exams) that do not exist; 6.004 Spring 2017 is organised as 21 chapters.', fix: 'Each week links its chapter; labs and worksheets come from computationstructures.org, 6.004\'s own site.', url: 'https://computationstructures.org/' },
      { what: 'Two instruction sets', why: '6.004 Spring 2017 teaches its own Beta ISA; the practice, the flagship CPU project and industry use RISC-V.', fix: 'Read 6.004 for the ideas and do the practice in RISC-V. Nand2Tetris (below) gives the hardware projects a machine-checked grader.', url: `${N2T}/course` },
      { what: 'The midterm cannot be checked as written', why: 'It asks you to prove the final architectural state, but gives no initial registers or memory, and whether BEQ is taken depends on them.', fix: 'The answer checks assume the branch is not taken. State the initial values you chose in your submission.' },
    ],
    problemSets: {
      1: [{ name: 'Nand2Tetris Project 1 — Boolean logic', url: `${N2T}/project01`, cmd: 'HardwareSimulator: run projects/01/*.tst' }, { name: 'Nand2Tetris Project 2 — Boolean arithmetic (the ALU)', url: `${N2T}/project02`, cmd: 'HardwareSimulator: run projects/02/*.tst' }, { name: 'Nand2Tetris Project 3 — Sequential logic (registers, RAM)', url: `${N2T}/project03`, cmd: 'HardwareSimulator: run projects/03/*/*.tst' }],
      2: [{ name: 'Nand2Tetris Project 4 — Machine language', url: `${N2T}/project04`, cmd: 'CPUEmulator: run projects/04/*/*.tst' }],
      3: [{ name: 'Nand2Tetris Project 5 — Computer architecture (the CPU)', url: `${N2T}/project05`, cmd: 'HardwareSimulator: run projects/05/*.tst' }],
    },
    benchmarks: [
      { id: 'cs210.n2t', name: 'Nand2Tetris Projects 1–5, by their test scripts', how: 'Build each project\'s chips in the Hardware Simulator; its .tst scripts are the grader. Record how many of the five projects pass every test.', max: 5, url: `${N2T}/course` },
      { id: 'cs210.worksheets', name: '6.004 worksheets, against their answers', how: 'Work the worksheets for pipelining, caches and virtual memory without notes, then mark them; record your percentage.', max: 100, url: 'https://computationstructures.org/worksheets/index.html' },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs210.mid.cycles', q: 'With EX/MEM and MEM/WB forwarding, a one-cycle load-use stall, the branch resolved in EX and not taken, and the first instruction fetched in cycle 1: in which cycle does SW finish write-back?', answer: 11, tol: 0,
          python: py(`ins = [('add','r1',['r2','r3']), ('sub','r4',['r1','r5']), ('lw','r6',['r4']), ('add','r7',['r6','r1']), ('beq',None,['r7','r0']), ('sw',None,['r7','r4'])]
ID, EX, MEM, WB = [], [], [], []
for i, (op, rd, rs) in enumerate(ins):
    d = ID[i - 1] + 1 if i else 2
    for j in range(i):
        if ins[j][1] and ins[j][1] in rs:
            d = max(d, MEM[j] if ins[j][0] == 'lw' else EX[j])
    ID.append(d); EX.append(d + 1); MEM.append(d + 2); WB.append(d + 3)
print(WB[-1])`) },
        { id: 'cs210.mid.stalls', q: 'How many stall cycles does that trace incur?', answer: 1, tol: 0,
          python: py(`print(11 - (6 + 4))`) },
      ],
    },
    anchors: {
      'midterm/Instruction correctness': anchor('All six instruction types produce the right architectural state in a directed test each, plus the fixed trace.', 'Most instructions correct; one (often SW or BEQ) wrong in a corner case.', 'The pipeline does not execute the trace.'),
      'midterm/Hazard handling': anchor('The cycle table matches the answer checks: forwarding where it applies, exactly one load-use stall, and the flush behaviour shown for a taken branch too.', 'Hazards resolved, but by stalling where forwarding would do, or the flush is missing.', 'Hazards give wrong results.'),
      'midterm/Verification coverage': anchor('Directed tests for every forwarding path and stall, a randomized program compared against a single-cycle reference, and coverage reported.', 'Directed tests only.', 'The fixed trace is the only test.'),
      'midterm/Performance analysis': anchor('CPI measured on the trace and on a larger program, with the stall and flush contributions separated.', 'CPI stated without its components.', 'No performance analysis.'),
      'final/Integrated correctness': anchor('Processor, cache, translation, exceptions and I/O agree with a reference model on every conformance program, from one command.', 'Each part works alone; one integration case fails.', 'The integrated system does not run the workloads.'),
      'final/Memory-system fidelity': anchor('Miss rates and AMAT from the simulator match a hand calculation on a small trace, and the effect of block size and associativity is measured.', 'Cache statistics reported but not validated.', 'The cache model is wrong or missing.'),
      'final/Measurement quality': anchor('Workloads fixed and seeded; cycles, instructions and misses reported separately; the measured improvement repeated several times with spread shown.', 'One-off measurements, or elapsed time only.', 'No measurement.'),
      'final/Design defense': anchor('The bottleneck identified from the measurements, one change made, its gain measured, and its cost (area, complexity) stated.', 'An improvement made without showing it targeted the bottleneck.', 'No defence of the design.'),
    },
  },

  'linear-algebra': {
    doc: 'docs/cs-term2-audit.md',
    outcomes: [
      o('la.vectors', 'Compute with vectors and matrices, and read Ax = b as a combination of the columns.', ['MSF-Linear 1–2'], ['dot', 'matmul'], [1, 2]),
      o('la.solve', 'Solve linear systems by elimination, and factor A = LU.', ['MSF-Linear 3'], ['la.solve', 'la.inverse'], [1, 2]),
      o('la.spaces', 'Find bases and dimensions for the four fundamental subspaces.', ['MSF-Linear 4'], ['la.rank'], [3], ['midterm']),
      o('la.ortho', 'Project onto subspaces and fit models by least squares.', ['MSF-Linear 5'], ['la.ls'], [4], ['midterm']),
      o('la.det', 'Compute determinants and use them for volume, orientation and invertibility.', ['MSF-Linear 3'], ['la.det'], [5]),
      o('la.eig', 'Find eigenvalues and diagonalise, to compute powers and model dynamics.', ['MSF-Linear 7'], ['la.eig2', 'eigen'], [6], ['final']),
      o('la.svd', 'Use the singular value decomposition for low-rank approximation.', ['MSF-Linear 8'], ['la.svd'], [7], ['final']),
      o('la.apps', 'Apply linear algebra in computing: Markov chains and PageRank, PCA and graphics.', ['MSF-Linear 6, 8'], ['la.markov'], [8], ['final']),
    ],
    gaps: [
      { what: 'Problem-set links were dead', why: '18.06SC has no assignments page; it is organised by unit.', fix: 'The weeks link the unit pages, where each session has its problems and solutions.', url: `${LA06}/ax-b-and-the-four-subspaces/` },
      { what: 'Bezier curves', why: 'CS2023 lists polynomial combinations and Bezier curves (MSF-Linear 6), used throughout graphics; the units never mention them.', fix: 'Covered in Computer Graphics (Term 6); a short exercise is worth doing with unit 8.' },
    ],
    benchmarks: [
      { id: 'math210.ex1', name: 'MIT 18.06SC Exam 1', how: 'Sit it in 50 minutes and mark it against the official solutions; record your percentage.', max: 100, url: `${LA06}/ax-b-and-the-four-subspaces/exam-1/` },
      { id: 'math210.ex2', name: 'MIT 18.06SC Exam 2', how: 'The same, after unit 6.', max: 100, url: `${LA06}/least-squares-determinants-and-eigenvalues/exam-2/` },
      { id: 'math210.final', name: 'MIT 18.06SC Final exam', how: 'Three hours, against the official solutions; record your percentage.', max: 100, url: `${LA06}/final-exam/` },
    ],
    keyChecks: {
      midterm: [
        { id: 'math210.mid.rank', q: 'What is the rank of A?', answer: 3, tol: 0,
          python: py(`from fractions import Fraction as F
A = [[1, 2, 0], [2, 4, 1], [0, 1, 1], [1, 3, 1]]
M = [[F(x) for x in r] for r in A]; r = 0
for c in range(3):
    p = next((i for i in range(r, 4) if M[i][c] != 0), None)
    if p is None: continue
    M[r], M[p] = M[p], M[r]
    for i in range(4):
        if i != r: M[i] = [a - M[i][c] / M[r][c] * b for a, b in zip(M[i], M[r])]
    r += 1
print(r)`) },
        { id: 'math210.mid.left', q: 'What is the dimension of the left nullspace N(Aᵀ)?', answer: 1, tol: 0, python: py('print(4 - 3)') },
        { id: 'math210.mid.x1', q: 'The least-squares solution x̂ solves AᵀA x̂ = Aᵀb. What is its first component?', answer: 2, tol: 1e-9,
          python: py(`from fractions import Fraction as F
A = [[1, 2, 0], [2, 4, 1], [0, 1, 1], [1, 3, 1]]; b = [1, 2, 2, 0]
N = [[sum(A[k][i] * A[k][j] for k in range(4)) for j in range(3)] + [sum(A[k][i] * b[k] for k in range(4))] for i in range(3)]
N = [[F(x) for x in r] for r in N]
for c in range(3):
    N[c] = [x / N[c][c] for x in N[c]]
    for i in range(3):
        if i != c: N[i] = [a - N[i][c] * b for a, b in zip(N[i], N[c])]
print(N[0][3])`) },
        { id: 'math210.mid.res', q: 'What is the length ‖b − Ax̂‖ of the residual? (3 decimal places)', answer: 1.732, tol: 0.001,
          python: py(`A = [[1, 2, 0], [2, 4, 1], [0, 1, 1], [1, 3, 1]]; b = [1, 2, 2, 0]; x = [2, -1, 2]
print(sum((b[k] - sum(A[k][j] * x[j] for j in range(3))) ** 2 for k in range(4)) ** 0.5)`) },
      ],
    },
    anchors: {
      'midterm/Subspace reasoning': anchor('Bases for all four subspaces from one elimination, with dimensions that add up (r + (n − r) = n, r + (m − r) = m) and each basis checked.', 'Bases correct for two or three subspaces, or dimensions stated without bases.', 'Subspaces confused (column space with row space, nullspace with left nullspace).'),
      'midterm/Least-squares derivation': anchor('Normal equations derived from orthogonality of the residual, solved exactly, and the same x̂ obtained from QR; the residual shown to lie in N(Aᵀ).', 'One method correct; the other missing or not reconciled.', 'The system solved as if it were consistent.'),
      'midterm/Numerical correctness': anchor('x̂ and the residual match the answer checks; condition numbers of A and AᵀA compared, and the floating-point error explained.', 'Values right, conditioning not discussed.', 'Wrong values.'),
      'midterm/Interpretation and validation': anchor('The geometry stated (b projected onto C(A)), the residual\'s direction explained, and the exact and floating-point results reconciled to a stated tolerance.', 'Correct numbers with little interpretation.', 'No validation of the results.'),
      'final/Linear algebra correctness': anchor('Every identity the application relies on (e.g. A = UΣVᵀ, Av = λv, Eckart–Young) stated and verified numerically on the real data.', 'Identities stated, verified only on toy data.', 'The application misuses the decomposition.'),
      'final/Implementation fidelity': anchor('The implementation matches the derivation line by line, is checked against a library (NumPy/LAPACK), and runs from one command.', 'Works, but the link from derivation to code is unclear.', 'Does not reproduce.'),
      'final/Stability evidence': anchor('Perturbation experiments: how outputs move as the input is perturbed, compared with the bound the theory gives.', 'Perturbations tried without a bound to compare against.', 'No stability evidence.'),
      'final/Application defense': anchor('A clear claim about the approximation or stability, defended with the experiments, and its failure cases named.', 'A claim with partial evidence.', 'No defensible claim.'),
    },
  },

  'probability-for-computing': {
    doc: 'docs/cs-term2-audit.md',
    grader: 'Stat 110\'s own worked solutions — mark yourself against them, not against this app.',
    outcomes: [
      o('pr.count', 'Count outcomes and compute probabilities on sample spaces, including collision probabilities.', ['MSF-Probability 1', 'MSF-Discrete 4'], ['pr.birthday', 'ncr'], [1]),
      o('pr.cond', 'Condition on evidence with Bayes\' rule, respecting base rates.', ['MSF-Probability 1'], ['pr.bayes', 'bayes'], [2], ['midterm']),
      o('pr.indep', 'Decide independence and conditional independence from a model or from data.', ['MSF-Probability 1'], ['pr.indep'], [3]),
      o('pr.discrete', 'Model with discrete random variables: expectation, variance, and the binomial, geometric and Poisson distributions.', ['MSF-Probability 2, 4'], ['pr.discrete', 'expvar', 'expect'], [4], ['midterm']),
      o('pr.cont', 'Work with continuous distributions, densities and transformations.', ['MSF-Probability 3'], ['pr.continuous'], [5]),
      o('pr.joint', 'Reason about joint distributions, covariance and correlation — and what correlation misses.', ['MSF-Probability 5'], ['pr.cov'], [6]),
      o('pr.limits', 'Apply the law of large numbers and the central limit theorem, checking their conditions first.', ['MSF-Probability 4'], ['pr.clt'], [7], ['final']),
      o('pr.apps', 'Analyse randomized systems — hashing, load balancing, Markov chains — with indicators and simulation.', ['MSF-Probability 6'], ['pr.indicator', 'la.markov'], [8], ['midterm', 'final']),
    ],
    gaps: [
      { what: 'The textbook was missing', why: 'Stat 110 is taught from Blitzstein and Hwang\'s Introduction to Probability, which the authors give away free; the course never linked it, and every unit pointed at the lecture playlist only.', fix: 'Read the matching chapter with each unit: counting (1), conditioning (2), random variables (3–4), continuous (5), joint (7), limits (10), Markov chains (11).', url: 'http://probabilitybook.net/' },
    ],
    problemSets: {
      1: [{ name: 'Stat 110 Strategic Practice 1 — counting (with solutions)', url: `${S110}/strategic-practice-problems` }],
      2: [{ name: 'Stat 110 Strategic Practice 2 — conditioning (with solutions)', url: `${S110}/strategic-practice-problems` }],
      3: [{ name: 'Stat 110 Strategic Practice 3 — independence (with solutions)', url: `${S110}/strategic-practice-problems` }],
      5: [{ name: 'Stat 110 Strategic Practice 8 — continuous variables (with solutions)', url: `${S110}/strategic-practice-problems` }],
      6: [{ name: 'Stat 110 Strategic Practice 10 — joint distributions (with solutions)', url: `${S110}/strategic-practice-problems` }],
      7: [{ name: 'Stat 110 Strategic Practice 13 — limit theorems (with solutions)', url: `${S110}/strategic-practice-problems` }],
    },
    benchmarks: [
      { id: 'stat210.final', name: 'Harvard Stat 110 final exam', how: 'Sit a past final in 3 hours and mark it against the posted solutions; record your percentage.', max: 100, url: `${S110}/exams` },
      { id: 'stat210.midterm', name: 'Harvard Stat 110 midterm', how: 'Sit a past midterm after unit 4 and mark it against the posted solutions.', max: 100, url: `${S110}/exams` },
    ],
    keyChecks: {
      midterm: [
        { id: 'stat210.mid.ppv', q: 'P(condition | positive test)? (4 decimal places)', answer: 0.4157, tol: 0.0005,
          python: py(`from fractions import Fraction as F
p, se, sp = F('0.03'), F('0.92'), F('0.96')
print(float(p * se / (p * se + (1 - p) * (1 - sp))))`) },
        { id: 'stat210.mid.npv', q: 'P(condition | negative test)? (4 decimal places)', answer: 0.0026, tol: 0.0001,
          python: py(`from fractions import Fraction as F
p, se, sp = F('0.03'), F('0.92'), F('0.96')
print(float(p * (1 - se) / (p * (1 - se) + (1 - p) * sp)))`) },
        { id: 'stat210.mid.empty', q: 'Expected number of empty servers when 12 requests go uniformly to 5 servers? (4 decimal places)', answer: 0.3436, tol: 0.0005,
          python: py(`from fractions import Fraction as F
print(float(5 * F(4, 5) ** 12))`) },
      ],
    },
    anchors: {
      'midterm/Probability model': anchor('Sample space, events and every assumption (independence of requests, uniformity) written down before any calculation.', 'The model is right but an assumption is left implicit.', 'The model does not match the scenario.'),
      'midterm/Conditional reasoning': anchor('Both post-test probabilities by Bayes, matching the answer checks, with the base-rate effect explained in words.', 'One of the two right, or right with the reasoning missing.', 'P(+ | D) confused with P(D | +).'),
      'midterm/Expectation accuracy': anchor('Expected empty servers by indicators and linearity, matching the answer check, with why linearity needs no independence.', 'Correct number by a longer route, or an arithmetic slip.', 'Wrong method.'),
      'midterm/Simulation validation': anchor('Seeded simulations (PCG64, seed 210) agree with both exact answers within a confidence interval you report.', 'A simulation with no interval, or a different seed.', 'No simulation.'),
      'final/Model correctness': anchor('The stochastic system specified precisely, its key quantities derived exactly where possible.', 'A reasonable model with a gap in the derivation.', 'The model is wrong.'),
      'final/Analytic reasoning': anchor('Each limit theorem used only after checking its conditions, with the approximation error estimated.', 'Theorems applied without checking conditions.', 'No analysis beyond simulation.'),
      'final/Simulation and uncertainty': anchor('A reproducible simulator validated against the exact results; every estimate with an interval and the number of runs justified.', 'Simulation without validation or intervals.', 'No simulation.'),
      'final/Claims and defense': anchor('Every probability claim traced to a derivation or a simulation, and the limits of the model stated.', 'Most claims supported.', 'Claims without support.'),
    },
  },

  'web-engineering': {
    doc: 'docs/cs-term2-audit.md',
    outcomes: [
      o('web.semantic', 'Write semantic, standards-valid HTML with landmarks, headings and labelled forms.', ['SPD-Web 1, 4', 'HCI-Accessibility 2'], [], [1], ['midterm', 'final']),
      o('web.css', 'Lay out responsive pages with grid and flexbox, and reason about the cascade.', ['SPD-Web 1'], ['web.specificity'], [2]),
      o('web.js', 'Program the DOM with events, and predict asynchronous execution order.', ['SPD-Web 1–2'], ['web.eventloop'], [3]),
      o('web.a11y', 'Meet WCAG 2.2 AA: contrast, keyboard access and accessible names.', ['HCI-Accessibility 2–3', 'SPD-Web 4'], ['web.contrast'], [4], ['midterm', 'final']),
      o('web.http', 'Use HTTP correctly: methods, status codes, caching and CORS.', ['SPD-Web 2', 'NC-Applications'], ['web.cache', 'web.cors', 'py.http'], [5], ['midterm']),
      o('web.arch', 'Structure client state and components, and keep shareable state in the URL.', ['SPD-Web 2, 9'], ['web.url'], [6]),
      o('web.secure', 'Test and secure a web application: injection, XSS and security headers.', ['SPD-Web 5', 'SEC-Coding'], ['web.injection'], [7], ['final']),
      o('web.perf', 'Deploy, observe and keep to a performance budget.', ['SPD-Web 7'], ['web.budget'], [8], ['final']),
    ],
    gaps: [
      { what: 'Quality judged by eye', why: 'Accessibility, validity and performance were rubric lines only, marked by you.', fix: 'Four outside checkers now set the bar: the W3C validator, axe, Lighthouse and Mozilla\'s HTTP Observatory.' },
    ],
    benchmarks: [
      { id: 'cs220.validator', name: 'W3C Nu HTML Checker: zero errors', how: 'Run every page of your deployed app through the checker; record 1 when all pages have zero errors.', max: 1, url: 'https://validator.w3.org/nu/' },
      { id: 'cs220.axe', name: 'axe-core: zero violations', how: 'Run axe (browser extension or @axe-core/cli) on every page and state; record 1 at zero violations.', max: 1, url: 'https://github.com/dequelabs/axe-core' },
      { id: 'cs220.lighthouse', name: 'Lighthouse: the lowest of performance, accessibility and best practices', how: 'Run Lighthouse (mobile) on the deployed app; record the lowest of the three scores.', max: 100, url: 'https://developer.chrome.com/docs/lighthouse/overview' },
      { id: 'cs220.observatory', name: 'Mozilla HTTP Observatory score', how: 'Scan the deployed app; record the score (cap it at 100).', max: 100, url: 'https://developer.mozilla.org/en-US/observatory' },
    ],
    anchors: {
      'midterm/Semantic and inclusive UI': anchor('Landmarks, one h1, labelled controls, visible focus; usable by keyboard alone; axe reports zero violations.', 'Mostly semantic; a few unlabelled controls or a focus trap.', 'Div soup that a screen reader cannot navigate.'),
      'midterm/Async-state correctness': anchor('Loading, empty, error, cancelled and retry states each reachable and correct, including the 400, 404 and 503 switches and the 800 ms latency.', 'The happy path and one failure state work.', 'Race conditions or stale data on screen.'),
      'midterm/Test coverage': anchor('Automated tests drive each state through the deterministic API, including cancellation mid-request.', 'Tests for the happy path only.', 'No automated tests.'),
      'midterm/HTTP reasoning': anchor('Each endpoint uses the right method and status (201 on create, 204 on delete, 404 for a missing id), with captured traces explained.', 'Mostly right; one status or method misused.', 'HTTP used as a tunnel (everything 200 or POST).'),
      'final/Product correctness': anchor('The public release does what its README says from a clean clone, with a reproducible build.', 'Works, but setup needs undocumented steps.', 'Does not run.'),
      'final/Quality and accessibility': anchor('All four outside checkers pass their benchmark: zero validator errors, zero axe violations, Lighthouse ≥ 90, Observatory ≥ 70.', 'Two or three of the four pass.', 'Fails most of them.'),
      'final/Security and operations': anchor('A threat model, parameterised queries, output encoding, security headers; logs and an alert; a rollback tested once.', 'Some of these, untested.', 'No security or operations work.'),
      'final/Architecture defense': anchor('Component boundaries and state ownership justified, with the performance budget and how the app stays within it.', 'Architecture described but not justified.', 'No defence.'),
    },
  },
};
