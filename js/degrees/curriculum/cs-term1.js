/**
 * Computer Science, Term 1 — the course design, audited against primary
 * sources (October 2026).
 *
 * Course Atlas gave each course three outcomes, two of them the same
 * boilerplate in every course, and rubric lines generated from a template.
 * This replaces them, course by course, with outcomes a learner can be checked
 * on — each mapped to the ACM/IEEE-CS/AAAI CS2023 Body of Knowledge, to the
 * units that teach it, to the practice that checks it and to the assessment
 * that grades it — plus marking anchors for every rubric line, outside
 * benchmarks with official answer keys, and fixes for links that had broken.
 *
 * Sources: CS2023 Body of Knowledge (csed.acm.org); MIT 6.042J Fall 2010 and
 * 18.01SC Fall 2010 problem sets and exams with solutions (OCW, CC BY-NC-SA);
 * Harvard CS50P and CS50x 2026 and their check50 tests (CC BY-NC-SA); Google
 * Technical Writing One and Two (CC BY); W3C WAI images tutorial; CommonMark
 * 0.31.2. The audit and its evidence are in docs/cs-term1-audit.md.
 */

const CS2023 = 'https://csed.acm.org/wp-content/uploads/2024/04/3.1-Body-of-Knowledge-1.pdf';
const OCW = 'https://ocw.mit.edu/courses';
const MCS10 = `${OCW}/6-042j-mathematics-for-computer-science-fall-2010`;
const C1801 = `${OCW}/18-01sc-single-variable-calculus-fall-2010`;

const o = (id, text, cs2023, skills, units, assessed = []) => ({ id, text, cs2023, skills, units, assessed });
/** A problem's check50 command and page. CS50P's testing problems live at test_<name>/ but check under tests/<name>. */
const check50 = (set, names, year = '2022/python') => names.map(n => ({
  name: n.replace('tests/', 'test_'), cmd: `check50 cs50/problems/${year}/${n}`, url: `${set}${n.replace('tests/', 'test_')}/`,
}));
const anchor = (full, part, none) => ({ full, part, none });

export const CS_TERM1 = {
  'programming-1': {
    outcomes: [
      o('cs101.trace', 'Predict what a Python program prints — expressions, names, strings and return values.', ['SDF-Fundamentals 1, 2', 'ILO 11, 13'], ['py.arith', 'py.binding', 'py.strings', 'py.return'], [1]),
      o('cs101.branch', 'Write conditions that are right at their boundaries.', ['SDF-Fundamentals 3'], ['py.bool', 'py.branch'], [2]),
      o('cs101.loop', 'Control loops: how many times they run and what they accumulate.', ['SDF-Fundamentals 3'], ['py.loopcount', 'py.accum'], [3]),
      o('cs101.errors', 'Handle runtime errors with exceptions and debug systematically.', ['SDF-Fundamentals 9, 10'], ['py.except', 'py.tryflow'], [4], ['midterm']),
      o('cs101.libs', 'Use libraries and web APIs: status codes, JSON and dependency versions.', ['SDF-Fundamentals 5, 7', 'ILO 5, 6'], ['py.http', 'py.json', 'py.semver'], [5]),
      o('cs101.tests', 'Design unit tests from boundaries that catch real bugs.', ['SDF-Practices 1', 'ILO 1, 2'], ['py.boundary', 'py.mutation', 'py.pytest'], [6], ['midterm']),
      o('cs101.data', 'Persist and validate data with files, CSV and regular expressions.', ['SDF-Fundamentals 5, 6', 'ILO 4'], ['py.fileio', 'py.regex', 'py.csv'], [7], ['final']),
      o('cs101.objects', 'Model data with classes, and reason about mutability and aliasing.', ['SDF-Fundamentals 4, 6', 'ILO 7'], ['py.oop', 'py.alias'], [8], ['final']),
      o('cs101.recursion', 'Trace and write recursive functions.', ['SDF-Fundamentals 8', 'ILO 8, 9'], ['py.recursion'], []),
    ],
    gaps: [
      { what: 'Recursion', why: 'CS2023 puts recursion in the CS Core (SDF-Fundamentals 8); CS50P does not teach it.', fix: 'Practice added (py.recursion). Learn it from CS50x Week 3, which covers recursion.', url: 'https://cs50.harvard.edu/x/2026/weeks/3/' },
      { what: 'Problem sets 6–8', why: 'Units 7 and 8 linked the File I/O, regular expressions and OOP lectures but not their problem sets.', fix: 'They are listed under the units below, with their check50 commands.', url: 'https://cs50.harvard.edu/python/psets/6/' },
    ],
    problemSets: {
      1: check50('https://cs50.harvard.edu/python/psets/0/', ['indoor', 'playback', 'faces', 'einstein', 'tip']),
      2: check50('https://cs50.harvard.edu/python/psets/1/', ['deep', 'bank', 'extensions', 'interpreter', 'meal']),
      3: check50('https://cs50.harvard.edu/python/psets/2/', ['camel', 'coke', 'twttr', 'plates', 'nutrition']),
      4: check50('https://cs50.harvard.edu/python/psets/3/', ['fuel', 'taqueria', 'grocery', 'outdated']),
      5: check50('https://cs50.harvard.edu/python/psets/4/', ['emojize', 'figlet', 'adieu', 'game', 'professor', 'bitcoin']),
      6: check50('https://cs50.harvard.edu/python/psets/5/', ['tests/twttr', 'tests/bank', 'tests/plates', 'tests/fuel']),
      7: [...check50('https://cs50.harvard.edu/python/psets/6/', ['lines', 'pizza', 'scourgify', 'shirt']), ...check50('https://cs50.harvard.edu/python/psets/7/', ['numb3rs', 'watch', 'working', 'um', 'response'])],
      8: check50('https://cs50.harvard.edu/python/psets/8/', ['seasons', 'jar', 'shirtificate']),
    },
    benchmarks: [
      { id: 'cs101.check50', name: 'CS50P problem sets, marked by check50', how: 'Run each problem\'s check50 command (listed under its unit). Record how many problems pass every check.', max: 41, url: 'https://cs50.harvard.edu/python/psets/' },
      { id: 'cs101.final', name: 'CS50P final project', how: 'Submit it to CS50 with submit50; record 1 when CS50 accepts it.', max: 1, url: 'https://cs50.harvard.edu/python/project/' },
    ],
    anchors: {
      'midterm/Behavioral correctness': anchor('All four commands behave correctly on normal, boundary and malformed input, and exit codes match the spec.', 'The happy paths work but one or two defects survive, or exit codes drift.', 'Commands crash or give wrong output on ordinary input.'),
      'midterm/Boundary-focused test design': anchor('Each defect has a failing test written before its fix, at the boundary that exposes it; the suite passes with coverage shown.', 'Tests exist but mostly check typical values, or were written after the fix.', 'No tests, or tests that would pass on the buggy version.'),
      'midterm/Debugging traceability': anchor('For every defect: the failing commit, the root cause in one sentence, and the repairing commit.', 'Causes are described but not tied to commits, or one defect is missing.', 'Fixes appear with no account of what was wrong.'),
      'midterm/Code clarity and interface stability': anchor('Small named functions, clear names, and the CLI and exit codes unchanged by the repairs.', 'Readable, but repairs changed the interface or left duplication.', 'Hard to follow, or the interface broke.'),
      'final/Requirements fulfilled': anchor('Every listed feature works from a clean clone by following the README.', 'Most features work; one is missing or needs undocumented steps.', 'The program does not run from the instructions.'),
      'final/Reliability and tests': anchor('Deterministic tests cover imports, duplicates, impossible dates, persistence and export; malformed input is recovered from.', 'Tests cover the main path; error handling is partial.', 'No meaningful tests, or bad input crashes it.'),
      'final/Program design': anchor('Clear modules (parsing, storage, CLI) with reasons for each split you can state.', 'Works, but logic is tangled across layers.', 'One long script with no structure.'),
      'final/Demonstration and technical defense': anchor('A five-minute demo that covers setup, failure recovery and persistence, and confident answers about trade-offs.', 'The demo works but questions expose gaps.', 'No demo, or it fails.'),
    },
  },

  'discrete-mathematics-for-computing': {
    outcomes: [
      o('math110.logic', 'Compare, validate and negate propositional and quantified statements.', ['MSF-Discrete 6', 'ILO 6a–b'], ['dm.equiv', 'dm.valid', 'dm.quant'], [1], ['final']),
      o('math110.induction', 'Unroll recursive definitions and prove claims about them by induction.', ['MSF-Discrete 2, 3', 'ILO 2a–e, 3f'], ['dm.recur'], [2, 3], ['final']),
      o('math110.invariants', 'Use invariants to prove what a process can and cannot reach.', ['MSF-Discrete 3', 'SF-Foundations 4'], ['dm.invariant'], [5], ['midterm']),
      o('math110.numbers', 'Compute with modular arithmetic: gcd, inverses and Fermat\'s little theorem.', ['MSF-Discrete 5', 'ILO 5a–b'], ['dm.inverse', 'dm.fermat', 'gcd', 'modpow'], [6], ['final']),
      o('math110.graphs', 'Reason about graphs: degrees, distance, colouring, Euler tours and spanning trees.', ['MSF-Discrete 7'], ['dm.graph'], [4], ['midterm']),
      o('math110.counting', 'Count with the sum and product rules, inclusion–exclusion, arrangements and pigeonhole.', ['MSF-Discrete 1, 4', 'ILO 1d, 4a–d'], ['dm.count', 'dm.pigeon', 'ncr'], [7], ['final']),
      o('math110.asymptotics', 'Bound sums and compare growth rates.', ['MSF-Discrete 8'], ['dm.asymp', 'dm.sumbound'], [7], ['final']),
      o('math110.probability', 'Compute discrete probabilities, conditionals and expectations by counting.', ['MSF-Probability'], ['dm.prob', 'expect'], [8], ['final']),
    ],
    gaps: [
      { what: 'Problem sets and exams', why: 'The links went to the 6.042J Spring 2015 assignments and exams pages, which no longer exist; that edition has readings only.', fix: 'They now point to 6.042J Fall 2010, which publishes twelve problem sets and five exams with solutions.', url: `${MCS10}/pages/exams/` },
    ],
    benchmarks: [
      { id: 'math110.midterm', name: 'MIT 6.042J Fall 2010 midterm', how: 'Sit it closed-book in 90 minutes, then mark it against MIT\'s official solutions.', max: 120, url: `${MCS10}/pages/exams/` },
      { id: 'math110.final', name: 'MIT 6.042J 2008 final exam', how: 'Sit it closed-book in 3 hours, then mark it against MIT\'s official solutions.', max: 150, url: `${MCS10}/pages/exams/` },
    ],
    keyChecks: {
      midterm: [
        { id: 'math110.mid.odd', q: 'In the dossier\'s graph (A–H; edges AB, AC, BD, CD, CE, DF, EF, EG, FH, GH), how many vertices have odd degree?', answer: 4, tol: 0,
          python: "edges = 'AB AC BD CD CE DF EF EG FH GH'.split()\ndeg = {}\nfor e in edges:\n    for v in e: deg[v] = deg.get(v, 0) + 1\nprint(sum(1 for d in deg.values() if d % 2))" },
        { id: 'math110.mid.euler', q: 'So is an Euler trail from A to H possible? Enter 1 for yes, 0 for no.', answer: 0, tol: 0,
          python: "edges = 'AB AC BD CD CE DF EF EG FH GH'.split()\nimport itertools\ndef trail(v, used):\n    if len(used) == len(edges): return v == 'H'\n    return any(trail(e[1] if e[0] == v else e[0], used | {i}) for i, e in enumerate(edges) if i not in used and v in e)\nprint(1 if trail('A', frozenset()) else 0)" },
      ],
    },
    anchors: {
      'midterm/Model precision': anchor('The graph is defined formally (V, E) with a labelled diagram that matches it exactly.', 'Mostly right, with a mislabelled edge or an informal definition.', 'No formal model, or it does not match the graph.'),
      'midterm/Proof validity': anchor('Three complete proofs, each step justified and the theorems used named.', 'The ideas are right but a step is missing or hand-waved.', 'Claims without proof, or a conclusion that disagrees with the number checks above.'),
      'midterm/Invariant reasoning': anchor('The parity invariant is stated, shown to be preserved, and used to rule the trail out.', 'An invariant is named but not shown to hold.', 'No invariant.'),
      'midterm/Computational corroboration': anchor('A script checks every small subgraph and the write-up says what the check does and does not prove.', 'A script runs but its output is not explained.', 'No computation, or enumeration presented as the proof.'),
      'final/Logical and proof correctness': anchor('Every proof is valid and complete.', 'Most are; one has a gap.', 'Proofs are invalid or missing.'),
      'final/Discrete model selection': anchor('Each problem is matched to the right tool — counting, recurrence, graph, invariant — and says why.', 'Usually the right tool, sometimes by accident.', 'Tools chosen at random.'),
      'final/Calculation and asymptotic accuracy': anchor('All numerical answers and growth bounds are correct.', 'Method right, arithmetic slips.', 'Wrong method.'),
      'final/Correction quality': anchor('Every error is corrected and classified (concept, method, slip) with what to practise.', 'Errors fixed without classification.', 'No corrections.'),
    },
  },

  'calculus-for-computing': {
    outcomes: [
      o('math120.derivatives', 'Differentiate with the product, quotient and chain rules, including higher derivatives.', ['MSF-Calculus 2', 'ILO 2a–c'], ['calc.deriv', 'calc.nth', 'deriv'], [1, 2], ['final']),
      o('math120.approx', 'Approximate functions with tangent lines and Taylor polynomials.', ['MSF-Calculus 2, 5'], ['calc.tangent', 'calc.linapprox', 'calc.taylor'], [3, 8], ['midterm', 'final']),
      o('math120.optimise', 'Optimise and relate rates by modelling and differentiating.', ['MSF-Calculus 2, 7'], ['calc.optimize', 'calc.related'], [4], ['midterm']),
      o('math120.integrals', 'Evaluate definite integrals and use the fundamental theorem.', ['MSF-Calculus 3'], ['calc.integral', 'calc.ftc'], [5, 6, 7], ['final']),
      o('math120.numerical', 'Estimate integrals numerically and reason about the error.', ['MSF-Calculus 3, 8'], ['calc.trapezoid'], [6], ['final']),
      o('math120.limits', 'Evaluate limits, including Riemann sums and L\'Hôpital\'s rule.', ['MSF-Calculus 1', 'ILO 1b–e'], ['calc.limit'], [1, 5]),
    ],
    gaps: [
      { what: 'Broken unit and problem-set links', why: '18.01SC renamed its pages; five of its links had become 404s.', fix: 'Every unit and problem-set link now points at the live page.', url: `${C1801}/` },
      { what: 'Multivariable calculus', why: 'CS2023\'s MSF-Calculus also lists partial derivatives and gradients for machine learning; this course is single-variable.', fix: 'Covered later by Linear Algebra and Machine Learning; the gradient practice (grad) is open there.', url: CS2023 },
    ],
    benchmarks: [
      { id: 'math120.exam1', name: 'MIT 18.01SC Exam 1 (differentiation)', how: 'Sit it in 50 minutes and mark it against the official solutions.', max: 100, url: `${C1801}/pages/1.-differentiation/exam-1/session-22-materials-for-exam-1/` },
      { id: 'math120.final', name: 'MIT 18.01SC Final exam', how: 'Sit it in 3 hours and mark it against the official solutions.', max: 100, url: `${C1801}/pages/final-exam/` },
    ],
    keyChecks: {
      midterm: [
        { id: 'math120.mid.x', q: 'For C(x) = 120/x + 0.8x + 0.02x² on 1 ≤ x ≤ 40, at what x is C smallest?', answer: 10, tol: 0.01,
          python: "f = lambda x: 120/x + 0.8*x + 0.02*x*x\nlo, hi = 1.0, 40.0\nfor _ in range(300):\n    a, b = lo + (hi-lo)/3, hi - (hi-lo)/3\n    lo, hi = (lo, b) if f(a) < f(b) else (a, hi)\nprint((lo+hi)/2)" },
        { id: 'math120.mid.c', q: 'What is that minimum cost C (ms)?', answer: 22, tol: 0.01, python: "print(min(120/x + 0.8*x + 0.02*x*x for x in [i/10000 for i in range(10000, 400001)]))" },
        { id: 'math120.mid.bound', q: 'Bound the linearisation error at the optimum over 8 ≤ x ≤ 12 by max|C″|·(Δx)²/2. What is the bound?', answer: 1.0175, tol: 0.001,
          python: "c2 = lambda x: 240/x**3 + 0.04\nprint(max(c2(8 + i/1000) for i in range(4001)) * 2**2 / 2)" },
      ],
    },
    anchors: {
      'midterm/Mathematical formulation': anchor('The cost model, its domain and units are written down, and the integer constraint on workers is noted.', 'The model is right but the domain or units are missing.', 'The model is wrong.'),
      'midterm/Derivative and optimization accuracy': anchor('C′ and C″ are right, the minimum matches the number checks above, and C″ > 0 shows it is a minimum.', 'The method is right with an arithmetic slip.', 'The derivative is wrong.'),
      'midterm/Numerical verification': anchor('A script reproduces the minimum and the error bound, with versions and commands recorded.', 'A check is done but not reproducible.', 'No numerical check.'),
      'midterm/Interpretation and assumptions': anchor('Says what the result means for choosing workers, and where the model would break.', 'The answer is stated without interpretation.', 'No interpretation.'),
      'final/Calculus technique': anchor('Every computation is correct by the right technique.', 'Mostly right, with slips.', 'Techniques misapplied.'),
      'final/Model construction': anchor('The chosen integral or series is set up from first principles and computed numerically to agree.', 'Set up right; the numerical check is weak.', 'The setup is wrong.'),
      'final/Error analysis': anchor('An error bound is stated and the numerical error is shown to sit inside it.', 'A bound is stated but not compared.', 'No error analysis.'),
      'final/Corrections and explanation': anchor('Each mistake is corrected with the misconception behind it.', 'Corrected without explanation.', 'No corrections.'),
    },
  },

  'computer-systems-foundations': {
    outcomes: [
      o('cs110.ints', 'Predict C integer arithmetic: truncation, remainders, overflow and two\'s complement.', ['AR-Representation 3, 4', 'ILO 2, 3'], ['c.intdiv', 'c.overflow'], [1, 2]),
      o('cs110.repr', 'Represent data as bits, hexadecimal and characters.', ['AR-Representation 2, 4, 5', 'ILO 5, 6'], ['c.binary', 'c.chars'], [3]),
      o('cs110.strings', 'Work with arrays and C strings.', ['SDF-Data-Structures 4'], ['c.strings'], [3]),
      o('cs110.algos', 'Measure the cost of searching and sorting.', ['SDF-Algorithms', 'AL-Foundational'], ['c.search', 'bigo'], [4]),
      o('cs110.pointers', 'Reason about pointers, addresses and sizes in memory.', ['AR-Memory 2', 'SDF-Fundamentals 4'], ['c.pointers', 'c.sizeof'], [5]),
      o('cs110.safety', 'Find and fix memory-safety bugs with tools.', ['SEC-Coding', 'SDF-Practices 2'], ['c.memsafety'], [5, 6], ['midterm', 'final']),
      o('cs110.linked', 'Build and traverse linked structures.', ['SDF-Data-Structures 1'], ['c.linked'], [6]),
      o('cs110.sql', 'Query relational data with SQL.', ['DM-Querying'], ['c.sql'], [7], ['final']),
    ],
    gaps: [
      { what: 'Same-term prerequisite', why: 'CS110 requires CS101, but both sit in Term 1, so CS110 cannot start until CS101 is passed.', fix: 'Expected: take CS101 first, then CS110 in the second half of the term. Unlock it yourself if you already program.', url: 'https://cs50.harvard.edu/x/' },
      { what: 'Week 16 link', why: 'The final build linked CS50\'s academic-honesty page instead of the project brief.', fix: 'It now links the final project page; the honesty policy stays under unit 8.', url: 'https://cs50.harvard.edu/x/2026/project/' },
    ],
    problemSets: {
      2: check50('https://cs50.harvard.edu/x/2026/psets/1/', ['mario/less', 'mario/more', 'cash', 'credit'], '2026/x'),
      3: check50('https://cs50.harvard.edu/x/2026/psets/2/', ['scrabble', 'readability', 'caesar', 'substitution'], '2026/x'),
      4: check50('https://cs50.harvard.edu/x/2026/psets/3/', ['sort', 'plurality', 'runoff', 'tideman'], '2026/x'),
      5: check50('https://cs50.harvard.edu/x/2026/psets/4/', ['volume', 'filter/less', 'filter/more', 'recover'], '2026/x'),
      6: check50('https://cs50.harvard.edu/x/2026/psets/5/', ['inheritance', 'speller'], '2026/x'),
      7: check50('https://cs50.harvard.edu/x/2026/psets/7/', ['songs', 'movies', 'fiftyville'], '2026/x'),
    },
    benchmarks: [
      { id: 'cs110.check50', name: 'CS50x problem sets, marked by check50', how: 'Run each problem\'s check50 command (listed under its unit). Record how many pass every check.', max: 21, url: 'https://cs50.harvard.edu/x/2026/psets/' },
      { id: 'cs110.sanitizers', name: 'Your midterm under sanitizers', how: 'Build with -Wall -Wextra -Werror -fsanitize=address,undefined (or Valgrind) and run your tests. Record 1 for a clean run.', max: 1, url: 'https://clang.llvm.org/docs/AddressSanitizer.html' },
    ],
    anchors: {
      'midterm/Functional repair': anchor('All four defects fixed, one per commit, with the CLI unchanged.', 'Three fixed, or fixes mixed into one commit.', 'Fewer than three fixed.'),
      'midterm/Memory safety': anchor('Clean under -Wall -Wextra -Werror and the sanitizers, with the transcript to prove it.', 'Clean build but a sanitizer finding remains.', 'Leaks or invalid accesses remain.'),
      'midterm/Test quality': anchor('A regression test for each defect that fails before its fix and passes after.', 'Tests exist but not tied to defects.', 'No tests.'),
      'midterm/Root-cause communication': anchor('Each defect\'s root cause and memory-ownership rule explained in a sentence or two.', 'Causes listed but vague.', 'No explanation.'),
      'final/Systems correctness': anchor('Builds from the Makefile on a clean machine and handles every input class in the brief.', 'Builds, but one input class misbehaves.', 'Does not build or run.'),
      'final/Memory and data integrity': anchor('No leaks or corruption under sanitizers, and malformed input is rejected cleanly.', 'Minor findings remain.', 'Crashes or corrupts data.'),
      'final/Performance evidence': anchor('Measured timings at several input sizes, with the growth explained.', 'One measurement without explanation.', 'No measurements.'),
      'final/Architecture defense': anchor('Design choices (structure, persistence) explained against alternatives, with limitations stated.', 'Choices described but not defended.', 'No account of the design.'),
    },
  },

  'technical-communication': {
    outcomes: [
      o('prof110.audience', 'Write for a named audience with a stated scope.', ['SEP-Communication 3'], [], [1], ['midterm']),
      o('prof110.sentences', 'Write clear sentences: active voice and consistent terms.', ['SEP-Communication 2'], ['tw.voice'], [2]),
      o('prof110.structure', 'Structure information with paragraphs, lists and tables.', ['SEP-Communication 2'], ['tw.lists'], [3], ['midterm']),
      o('prof110.procedures', 'Write procedures someone else can reproduce on a clean machine.', ['SEP-Communication 2'], [], [4], ['midterm']),
      o('prof110.markdown', 'Write Markdown and code samples that render as intended.', ['SEP-Communication 2'], ['tw.markdown'], [5]),
      o('prof110.access', 'Make images and diagrams accessible.', ['SEP-Communication 5'], ['tw.alttext'], [6], ['final']),
      o('prof110.sources', 'Evaluate and cite sources, and state uncertainty.', ['SEP-Communication 2', 'SDF-SEP 2'], [], [7], ['final']),
    ],
    gaps: [
      { what: 'Writing is not machine-marked', why: 'Only the rule-bound parts — voice, list type, Markdown, alt text — have right answers.', fix: 'The rest is the rubric, marked against the anchors below, and the peer trial in the midterm.', url: 'https://developers.google.com/tech-writing/one' },
      { what: 'Dead source-evaluation guide', why: 'Stanford\'s "Evaluating Information" guide returns 404.', fix: 'Replaced with the Civic Online Reasoning lesson on lateral reading.', url: 'https://cor.inquirygroup.org/curriculum/lessons/intro-to-lateral-reading/' },
    ],
    benchmarks: [
      { id: 'prof110.peer', name: 'A peer runs your guide', how: 'Someone who has never seen the project follows your guide on a clean machine. Record how many steps they finished without asking you.', max: 10, url: 'https://developers.google.com/tech-writing/one/documents' },
      { id: 'prof110.checks', name: 'Automated checks on your guide', how: 'Run a link checker (lychee), a style linter (Vale with the Google style) and an accessibility checker (axe or WAVE). Record 1 if all three come back clean.', max: 1, url: 'https://vale.sh/' },
    ],
    anchors: {
      'midterm/Audience fit': anchor('States who the guide is for and what they already know, and never assumes more.', 'An audience is named but steps assume knowledge it lacks.', 'No audience in mind.'),
      'midterm/Procedural reproducibility': anchor('A peer completed every step on a clean machine without help.', 'They finished with one or two questions.', 'They could not finish.'),
      'midterm/Information design': anchor('Numbered steps, one action each, with commands and their expected output.', 'Steps exist but mix actions or omit output.', 'Prose with steps buried in it.'),
      'midterm/Evidence-driven revision': anchor('Every blocker from the observation is logged and closed in the revision diff.', 'Some blockers addressed.', 'No revision.'),
      'final/Technical accuracy': anchor('Every command, code sample and claim is correct and current.', 'One or two errors.', 'Misleading.'),
      'final/Clarity and structure': anchor('Passes link, style and accessibility checks; headings and lists make it scannable.', 'Readable with check failures.', 'Hard to follow.'),
      'final/Reproducibility and accessibility': anchor('The procedure works end to end, and images have alt text and diagrams have descriptions.', 'Works, with accessibility gaps.', 'Not reproducible.'),
      'final/Source integrity and defense': anchor('Every source is cited and evaluated, and questions are answered from them.', 'Sources cited but not evaluated.', 'Unsourced claims.'),
    },
  },
};

/**
 * Links that had moved or broken, found by fetching every Term 1 link on
 * 2026-10-15, and what replaces them. Applied when the catalog is imported.
 */
export const LINK_FIXES = {
  'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/pages/assignments/': `${MCS10}/pages/assignments/`,
  'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/pages/exams/': `${MCS10}/pages/exams/`,
  [`${C1801}/pages/unit-1-differentiation/`]: `${C1801}/pages/1.-differentiation/`,
  [`${C1801}/pages/unit-1-differentiation/problem-set-1/`]: `${C1801}/pages/1.-differentiation/part-a-definition-and-basic-rules/problem-set-1/`,
  [`${C1801}/pages/unit-2-applications-of-differentiation/problem-set-3/`]: `${C1801}/pages/unit-2-applications-of-differentiation/part-b-optimization-related-rates-and-newtons-method/problem-set-4/`,
  [`${C1801}/pages/unit-3-the-definite-integral-and-its-applications/problem-set-5/`]: `${C1801}/pages/unit-3-the-definite-integral-and-its-applications/part-a-definition-of-the-definite-integral-and-first-fundamental-theorem/problem-set-6/`,
  [`${C1801}/pages/unit-4-techniques-of-integration/problem-set-7/`]: `${C1801}/pages/unit-4-techniques-of-integration/part-b-partial-fractions-integration-by-parts-arc-length-and-surface-area/problem-set-10/`,
  'https://guides.library.stanford.edu/evaluate': 'https://cor.inquirygroup.org/curriculum/lessons/intro-to-lateral-reading/',
  'https://cs50.harvard.edu/x/2026/honesty/': 'https://cs50.harvard.edu/x/2026/project/',
};

export const curriculumFor = (degreeId, courseKey) => (degreeId === 'cs' ? CS_TERM1[courseKey] || null : null);
