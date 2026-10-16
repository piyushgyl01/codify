/**
 * Mathematics, Term 0 (first year, first half) — the course design, audited
 * against its sources in October 2026, as the CS degree was.
 *
 * The catalog gave these courses no unit links (every unit said "use the
 * primary resource") and no rubrics. The audit names the lectures or
 * chapters for each unit (tools/readings/math.mjs) and writes a rubric with
 * marking anchors for every assessment.
 *
 * Standards: QAA Subject Benchmark Statement for Mathematics, Statistics and
 * Operational Research (2023), cited by paragraph; ETS GRE Mathematics
 * content areas. Outside graders: MIT 18.01 and 18.06SC exams with
 * solutions; Lean, through Mechanics of Proof; Hefferon's and Levin's
 * published answers; Project Euler; the 18.S191 notebooks' own checks.
 * Evidence in docs/math-term0-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';
const E1801 = `${OCW}/18-01-single-variable-calculus-fall-2005`;
const LA06 = `${OCW}/18-06sc-linear-algebra-fall-2011/pages`;
const MCS10 = `${OCW}/6-042j-mathematics-for-computer-science-fall-2010`;

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
/** One rubric line: 25 points, 15 for partial work, as in every CS rubric. */
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });

export const MATH_TERM0 = {
  'calculus-1': {
    doc: 'docs/math-term0-audit.md',
    outcomes: [
      o('ma101.limits', 'Compute limits and decide continuity, one-sided and infinite limits included.', ['QAA-MSOR 3.8', 'GRE-M Calculus'], ['calc.limit'], [1], ['final']),
      o('ma101.derivative', 'Differentiate by the rules and use derivatives for tangent lines and local approximation.', ['QAA-MSOR 3.8', 'GRE-M Calculus'], ['calc.deriv', 'calc.tangent', 'calc.linapprox'], [2], ['final']),
      o('ma101.mvt', 'Use the mean value theorem, and optimise with every extremum justified.', ['QAA-MSOR 3.14', 'GRE-M Calculus'], ['m.mvt', 'calc.optimize', 'm.newton'], [3], ['applied', 'final']),
      o('ma101.rates', 'Model rates of change with units and test the model\'s sensitivity.', ['QAA-MSOR 3.18', 'QAA-MSOR 3.19'], ['calc.related'], [4], ['applied']),
      o('ma101.integral', 'Evaluate definite integrals by the fundamental theorem and approximate them with an error bound.', ['QAA-MSOR 3.8', 'QAA-MSOR 3.16'], ['calc.integral', 'calc.ftc', 'calc.trapezoid'], [5], ['applied', 'final']),
      o('ma101.methods', 'Integrate by substitution, parts and partial fractions, and decide when improper integrals converge.', ['GRE-M Calculus'], ['calc.integral', 'm.improper'], [6], ['final']),
      o('ma101.series', 'Decide convergence of series and approximate functions by Taylor polynomials with a remainder bound.', ['GRE-M Calculus', 'QAA-MSOR 3.16'], ['m.series', 'calc.taylor'], [7], ['final']),
      o('ma101.defend', 'Defend one solution that links limits, derivatives, integrals and an explicit error bound.', ['QAA-MSOR 3.14', 'QAA-MSOR 3.26'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit said "use the primary resource" without naming a lecture.', fix: 'Each unit now names and links the 18.01 lectures that cover it.' },
      { what: 'One practice skill', why: 'The only practice was differentiation.', fix: 'Practice now covers limits, approximation, the mean value theorem, optimisation, related rates, integrals, numerical integration, improper integrals, series and Taylor polynomials.' },
      { what: 'No rubric', why: 'Both assessments were marked as a single score with nothing to mark against.', fix: 'Each now has four lines with marking anchors; MIT\'s exams with solutions are the outside check.', url: `${E1801}/pages/exams/` },
    ],
    benchmarks: [
      { id: 'ma101.exams', name: 'MIT 18.01 (Fall 2005) unit exams 1–4, against MIT\'s solutions', how: 'Sit each in 50 minutes after its unit, closed-book; record your average percentage.', max: 100, url: `${E1801}/pages/exams/` },
      { id: 'ma101.final', name: 'MIT 18.01 practice final, against its solutions', how: 'Three hours, closed-book; record your percentage.', max: 100, url: `${E1801}/resources/ocw01f05finalpra/` },
    ],
    rubrics: {
      applied: [
        crit('Model and units', 'Rate and accumulated quantity defined from a cited open dataset; every derivative and integral carries units that check.', 'Sound model; one quantity\'s units or source missing.', 'No model, or inconsistent units.'),
        crit('Analytic and numerical agreement', 'Analytic results agree with a trapezoid or Simpson estimate within a stated bound, such as (b − a)h²·max|f″|/12.', 'Compared without a bound.', 'No comparison, or disagreement left unexplained.'),
        crit('Sensitivity', 'Each parameter perturbed, the change measured, and the change explained by a derivative.', 'Sensitivity for one parameter only.', 'None.'),
        crit('Error log and correction', 'Every error logged with its cause and corrected work.', 'A log without corrections.', 'No log.'),
      ],
      final: [
        crit('Cumulative correctness', 'At least 85% on the cumulative exam (18.01\'s practice final will do), marked against the solutions.', '60–84%.', 'Below 60%.'),
        crit('Linked solution', 'One solution traced from a limit, through a derivative and an integral, to the answer, with each step justified by a named theorem.', 'Correct, with one unnamed step.', 'Unjustified steps.'),
        crit('Explicit error bound', 'A Taylor-remainder or quadrature bound computed and checked against the true error.', 'Bound stated, not checked.', 'No bound.'),
        crit('Correction and defense', 'Every lost mark corrected, and the linked solution defended under questions.', 'Partial corrections.', 'No corrections.'),
      ],
    },
  },

  'introduction-to-proofs-and-logic': {
    doc: 'docs/math-term0-audit.md',
    grader: 'Lean, through Mechanics of Proof: a proof counts only when Lean accepts it — not this app.',
    outcomes: [
      o('ma102.logic', 'Translate statements into logic, negate quantified claims, and test validity.', ['QAA-MSOR 3.14'], ['dm.equiv', 'dm.valid', 'dm.quant'], [1], ['applied']),
      o('ma102.sets', 'Reason with sets, functions and relations, equivalence classes included.', ['QAA-MSOR 3.14', 'GRE-M Additional'], ['m.relation', 'm.functions'], [2], ['final']),
      o('ma102.direct', 'Write direct proofs and proofs by cases.', ['QAA-MSOR 3.14'], [], [3], ['applied', 'final']),
      o('ma102.disproof', 'Refute false claims with minimal counterexamples.', ['QAA-MSOR 3.13', 'QAA-MSOR 3.14'], ['dm.quant'], [4], ['applied']),
      o('ma102.indirect', 'Prove by contrapositive, contradiction and construction.', ['QAA-MSOR 3.14'], ['dm.pigeon'], [5], ['final']),
      o('ma102.induction', 'Prove by induction and strong induction, and argue with invariants.', ['QAA-MSOR 3.14'], ['dm.recur', 'dm.invariant'], [6], ['final']),
      o('ma102.cardinality', 'Compare cardinalities and prove a set countable or uncountable.', ['QAA-MSOR 3.14', 'GRE-M Additional'], ['m.functions'], [7], ['final']),
      o('ma102.write', 'Write and defend proofs that state every definition and dependency.', ['QAA-MSOR 3.26'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the whole of Book of Proof.', fix: 'Each unit now names its chapter and opens the PDF at it.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers logical equivalence, validity, quantifiers, relations, counting functions, pigeonhole and induction invariants.' },
      { what: 'Proofs were self-checked', why: 'A learner cannot reliably check their own proofs.', fix: 'Mechanics of Proof teaches the same methods in Lean, which accepts a proof only if it is correct; Book of Proof publishes solutions to its odd-numbered exercises.', url: 'https://hrmacbeth.github.io/math2001/' },
    ],
    problemSets: {
      3: [{ name: 'Mechanics of Proof, Chapters 1–2 — proofs by calculation and with structure (Lean)', url: 'https://hrmacbeth.github.io/math2001/' }],
      5: [{ name: 'Mechanics of Proof, Chapters 4–5 — structure and logic (Lean)', url: 'https://hrmacbeth.github.io/math2001/' }],
      6: [{ name: 'Mechanics of Proof, Chapter 6 — induction (Lean)', url: 'https://hrmacbeth.github.io/math2001/' }],
    },
    benchmarks: [
      { id: 'ma102.lean', name: 'Mechanics of Proof chapters completed in Lean', how: 'Count a chapter when Lean accepts every exercise in it.', max: 10, url: 'https://hrmacbeth.github.io/math2001/' },
      { id: 'ma102.bop', name: 'Book of Proof odd-numbered exercises, against its solutions', how: 'Write each proof before looking; record the percentage that match the published solution in substance.', max: 100, url: 'https://richardhammack.github.io/BookOfProof/Main.pdf#page=304' },
    ],
    rubrics: {
      applied: [
        crit('Formalisation', 'Every claim in the flawed packet written in quantified logic, with its negation.', 'Most claims formalised; one quantifier wrong.', 'Claims left informal.'),
        crit('Repair of valid arguments', 'Each valid argument repaired into a complete proof with no gaps, checked in Lean where possible.', 'Repairs with one gap.', 'Repairs that do not prove the claim.'),
        crit('Counterexamples', 'Each false claim refuted by a minimal counterexample that is checked against every hypothesis.', 'Counterexamples that work but are not minimal or not checked.', 'Missing or wrong counterexamples.'),
        crit('Error log', 'Every flaw found is classified (quantifier, converse, missing case, circularity) with its fix.', 'Flaws found, not classified.', 'No log.'),
      ],
      final: [
        crit('Proof method range', 'At least four methods used correctly (direct, contrapositive, contradiction, induction), each suited to its claim.', 'Three methods, or one misused.', 'Fewer than three.'),
        crit('Rigor and completeness', 'Every definition stated, every case covered, every step justified.', 'One gap.', 'Several gaps.'),
        crit('Dependency notes', 'Each proof lists the definitions and results it uses, and none is circular.', 'Notes incomplete.', 'No notes.'),
        crit('Revision under critique', 'Proofs revised in response to critique, with the oral defence answering how each step follows.', 'Revised without defending.', 'No revision.'),
      ],
    },
  },

  'linear-algebra-1': {
    doc: 'docs/math-term0-audit.md',
    outcomes: [
      o('ma103.systems', 'Solve linear systems by elimination and describe their solution sets.', ['QAA-MSOR 3.8', 'GRE-M Algebra'], ['la.solve'], [1], ['final']),
      o('ma103.spaces', 'Decide span, independence, basis and dimension.', ['QAA-MSOR 3.8', 'GRE-M Algebra'], ['la.rank'], [2], ['final']),
      o('ma103.maps', 'Represent linear maps by matrices and change basis.', ['GRE-M Algebra'], ['matmul'], [3], ['final']),
      o('ma103.ls', 'Fit least-squares models, derive the normal equations, and diagnose residuals.', ['QAA-MSOR 3.8', 'QAA-MSOR 3.19'], ['la.ls'], [4], ['applied']),
      o('ma103.det', 'Use determinants and rank to decide invertibility.', ['GRE-M Algebra'], ['la.det', 'la.inverse'], [5], ['final']),
      o('ma103.eigen', 'Find eigenvalues and eigenvectors and diagonalise.', ['GRE-M Algebra'], ['la.eig2'], [6], ['final']),
      o('ma103.orth', 'Project orthogonally and build orthonormal bases.', ['QAA-MSOR 3.8'], ['m.proj', 'dot'], [7], ['applied', 'final']),
      o('ma103.stable', 'Compare a stable solver with direct inversion and explain conditioning.', ['QAA-MSOR 3.16'], ['m.float'], [4, 8], ['applied', 'final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the whole of Hefferon.', fix: 'Each unit now names its chapter and section and opens the PDF at it.' },
      { what: 'Practice was two operations', why: 'Dot products and matrix multiplication only.', fix: 'Practice now covers elimination, rank, determinants, inverses, least squares, eigenvalues and projection.' },
      { what: 'No outside answers', why: 'Exercises were self-marked.', fix: 'Hefferon publishes answers to every exercise, and MIT 18.06SC\'s exams have official solutions.', url: 'https://jheffero.w3.uvm.edu/linearalgebra/jhanswer.pdf' },
    ],
    benchmarks: [
      { id: 'ma103.answers', name: 'Hefferon exercises, against the book of answers', how: 'Work the starred exercises of each section; record the percentage right.', max: 100, url: 'https://jheffero.w3.uvm.edu/linearalgebra/jhanswer.pdf' },
      { id: 'ma103.ex1', name: 'MIT 18.06SC Exam 1', how: 'Sit it in 50 minutes and mark it against the official solutions.', max: 100, url: `${LA06}/ax-b-and-the-four-subspaces/exam-1/` },
      { id: 'ma103.final', name: 'MIT 18.06SC Final exam', how: 'Three hours, against the official solutions.', max: 100, url: `${LA06}/final-exam/` },
    ],
    rubrics: {
      applied: [
        crit('Normal equations', 'AᵀAx = Aᵀb derived from minimising ‖Ax − b‖², with the conditions for a unique solution stated.', 'Stated, not derived.', 'Missing or wrong.'),
        crit('Solver comparison', 'QR (or another stable method) and direct inversion compared on a well- and an ill-conditioned design, with the condition number reported.', 'Compared on one design only.', 'One method only.'),
        crit('Residual geometry', 'Residual shown orthogonal to the column space (Aᵀr ≈ 0 numerically) and residual plots interpreted.', 'Residuals plotted, not interpreted.', 'No residual analysis.'),
        crit('Error log', 'Every mistake logged with its cause and corrected work.', 'A log without corrections.', 'No log.'),
      ],
      final: [
        crit('Cumulative correctness', 'At least 85% on the cumulative exam (18.06SC\'s final will do), marked against the solutions.', '60–84%.', 'Below 60%.'),
        crit('Transformation analysis', 'One map followed from its matrix through kernel, image, invariant subspaces and spectrum, each claim justified.', 'Most steps, one unjustified.', 'Disconnected computations.'),
        crit('Conditioning', 'Conditioning of the map\'s matrix computed and its effect on a solve shown numerically.', 'Mentioned, not shown.', 'Ignored.'),
        crit('Correction and defense', 'Every lost mark corrected and the analysis defended under questions.', 'Partial corrections.', 'None.'),
      ],
    },
  },

  'discrete-mathematics': {
    doc: 'docs/math-term0-audit.md',
    outcomes: [
      o('ma104.logic', 'Reason with implications, sets and functions.', ['QAA-MSOR 3.14'], ['dm.equiv', 'dm.valid'], [1], ['final']),
      o('ma104.induction', 'Prove by induction and strong induction, and define by recursion.', ['QAA-MSOR 3.14'], ['dm.recur'], [2], ['final']),
      o('ma104.growth', 'Solve recurrences, bound sums, and compare growth rates.', ['GRE-M Additional'], ['dm.sumbound', 'dm.asymp'], [3], ['applied', 'final']),
      o('ma104.invariant', 'Verify an algorithm on a finite structure with an invariant.', ['QAA-MSOR 3.14', 'QAA-MSOR 3.17'], ['dm.invariant', 'dm.graph'], [4], ['applied']),
      o('ma104.count', 'Count with permutations, combinations and inclusion–exclusion.', ['GRE-M Additional'], ['dm.count', 'ncr', 'inclexcl', 'dm.pigeon'], [5], ['final']),
      o('ma104.graphs', 'Analyse graphs, trees, paths and connectivity.', ['GRE-M Additional'], ['dm.graph', 'mst', 'bfs'], [6], ['applied', 'final']),
      o('ma104.numbers', 'Use modular arithmetic and discrete probability.', ['GRE-M Algebra', 'QAA-MSOR 3.8'], ['dm.fermat', 'dm.inverse', 'gcd', 'modpow', 'dm.prob'], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the whole book.', fix: 'Each unit now links the sections of Levin\'s 4th edition that cover it.' },
      { what: 'Practice was borrowed from competitive programming', why: 'GCDs, primes and binomials, but no induction, recurrences, graphs or probability.', fix: 'Practice now adds equivalence, validity, recurrences, invariants, graphs, counting, pigeonhole, Fermat and inverses, and discrete probability.' },
      { what: 'No outside answers', why: 'Exercises were self-marked.', fix: 'Levin publishes selected solutions and hints; MIT 6.042J Fall 2010 has exams with solutions.', url: 'https://discrete.openmathbooks.org/dmoi4/backmatter-3.html' },
    ],
    benchmarks: [
      { id: 'ma104.solutions', name: 'Levin\'s exercises, against the selected solutions', how: 'Record the percentage right of the exercises that have published solutions.', max: 100, url: 'https://discrete.openmathbooks.org/dmoi4/backmatter-3.html' },
      { id: 'ma104.midterm', name: 'MIT 6.042J Fall 2010 midterm', how: 'Closed-book in 90 minutes, against MIT\'s solutions; record your score.', max: 120, url: `${MCS10}/pages/exams/` },
    ],
    rubrics: {
      applied: [
        crit('Algorithm correctness', 'The schedule or route is correct on every test instance, including edge cases (empty, single item, ties).', 'Correct on typical instances, one edge case fails.', 'Incorrect output.'),
        crit('Invariant proof', 'An invariant stated, proved to hold initially and to be preserved, and shown to give correctness at termination.', 'Invariant stated, preservation not proved.', 'No invariant.'),
        crit('Growth analysis', 'Running time derived as a recurrence or sum and bounded, then checked against measured counts.', 'Bound stated without derivation or measurement.', 'No analysis, or scalability overstated.'),
        crit('Error log', 'Every error logged with its cause and corrected work.', 'A log without corrections.', 'No log.'),
      ],
      final: [
        crit('Cumulative correctness', 'At least 85% on the cumulative set, marked against published solutions where they exist.', '60–84%.', 'Below 60%.'),
        crit('Proof quality', 'Induction proofs state base case, hypothesis and step; counting arguments name the bijection or principle used.', 'One proof incomplete.', 'Several incomplete.'),
        crit('Connections', 'One problem solved two ways (for example a combinatorial and an algebraic proof) and the two reconciled.', 'One way only.', 'None.'),
        crit('Correction and defense', 'Every lost mark corrected and one solution defended under questions.', 'Partial corrections.', 'None.'),
      ],
    },
  },

  'mathematical-programming': {
    doc: 'docs/math-term0-audit.md',
    outcomes: [
      o('ma105.basics', 'Write correct programs with functions, types and control flow.', ['QAA-MSOR 3.17'], ['py.arith', 'py.branch', 'py.loopcount'], [1], ['applied']),
      o('ma105.arrays', 'Use arrays and data structures, and vectorise computations.', ['QAA-MSOR 3.17'], ['py.accum', 'py.strings'], [2]),
      o('ma105.float', 'Predict and measure floating-point error.', ['QAA-MSOR 3.16'], ['m.float', 'ar.float', 'm.newton'], [3], ['applied', 'final']),
      o('ma105.conjecture', 'Test a conjecture computationally and reproducibly, keeping evidence separate from proof.', ['QAA-MSOR 3.13', 'QAA-MSOR 3.17'], ['m.series'], [4], ['applied']),
      o('ma105.exact', 'Compute exactly with rationals and symbolic tools where floating point fails.', ['QAA-MSOR 3.16', 'QAA-MSOR 3.17'], [], [5], ['final']),
      o('ma105.visual', 'Visualise results, with provenance recorded.', ['QAA-MSOR 3.19', 'QAA-MSOR 3.26'], [], [6]),
      o('ma105.engineering', 'Test, version and profile mathematical software.', ['QAA-MSOR 3.17', 'QAA-MSOR 3.26'], ['py.boundary', 'py.mutation'], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.S191 front page.', fix: 'Each unit now links the 18.S191 Fall 2022 lecture that covers it.' },
      { what: 'Practice and course use different languages', why: '18.S191 is taught in Julia; the practice is Python.', fix: 'The skills carry over; floating-point practice is about IEEE doubles, which both languages use. Do the lectures in Julia.' },
      { what: 'No outside checks', why: 'Programs were checked only by their author.', fix: 'The 18.S191 homework notebooks check answers themselves; Project Euler confirms a numerical answer only when it is right.', url: 'https://projecteuler.net/archives' },
    ],
    benchmarks: [
      { id: 'ma105.pluto', name: '18.S191 homework notebooks with every built-in check passing', how: 'Count the homework notebooks (0–10) where every check reports correct.', max: 11, url: 'https://computationalthinking.mit.edu/Fall22/homework/hw1/' },
      { id: 'ma105.euler', name: 'Project Euler problems solved', how: 'Record the count on your Project Euler profile.', max: 100, url: 'https://projecteuler.net/archives' },
    ],
    rubrics: {
      applied: [
        crit('Exact and floating-point cases', 'The conjecture tested both in exact arithmetic and in floats, with the cases where they disagree identified and explained.', 'Floats only, with disagreements unexplained.', 'One untested mode.'),
        crit('Automated checks', 'Property tests or assertions run with one command and cover the edge cases.', 'Tests exist, edge cases missing.', 'No tests.'),
        crit('Provenance', 'Versions, seeds and data sources recorded; a fresh environment reproduces every number.', 'Mostly reproducible.', 'Not reproducible.'),
        crit('Claim boundary', 'Numerical evidence kept separate from proof, with failure examples shown.', 'Evidence overstated once.', 'Evidence presented as proof.'),
      ],
      final: [
        crit('Documented contracts', 'Every public function documents inputs, outputs, error behaviour and precision.', 'Most functions documented.', 'Undocumented.'),
        crit('Property tests', 'Property-based tests check mathematical identities across random inputs, including adversarial ones.', 'Example tests only.', 'No tests.'),
        crit('Numerical-error analysis', 'Error bounds stated and measured against exact or high-precision references.', 'Measured without bounds.', 'Not analysed.'),
        crit('Reproducibility and defense', 'A fresh environment builds and passes the tests from one command, and the library is defended under questions.', 'Builds with manual steps.', 'Does not build.'),
      ],
    },
  },
};
