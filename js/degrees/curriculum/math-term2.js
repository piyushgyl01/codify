/**
 * Mathematics, Term 2 — audited as Terms 0–1 were.
 *
 * Outside graders: Lean (Mathematics in Lean); MIT 18.04 practice exams with
 * worked answers; Judson's hints and answers; NIST's Matrix Market and
 * LAPACK as an oracle for numerical solvers; held-out data published after a
 * model is frozen; the Putnam archive. Evidence in docs/math-term2-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';
const MIL = 'https://leanprover-community.github.io/mathematics_in_lean';
const PUTNAM = 'https://kskedlaya.org/putnam-archive/';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });
const examFinal = (source, linked, check) => [
  crit('Cumulative correctness', `At least 85% on a cumulative exam (${source}), marked against the official solutions.`, '60–84%.', 'Below 60%.'),
  crit('Linked solution', linked, 'Correct, with one step unjustified.', 'Disconnected computations.'),
  crit('Independent check', check, 'A check that repeats the same method.', 'No check.'),
  crit('Correction and defense', 'Every lost mark corrected, and the linked solution defended under questions.', 'Partial corrections.', 'None.'),
];
const oralFinal = (portfolio, lean) => [
  crit('Theorem coverage', portfolio, 'One required theorem missing.', 'Several missing.'),
  crit('Rigor', 'Every definition stated, every hypothesis used and named, no step left to the reader.', 'One gap.', 'Several gaps.'),
  crit('Machine-checked core', lean, 'Stated in Lean, not proved.', 'Not attempted.'),
  crit('Oral defense and revision', 'Questions answered from the proofs, and every weakness found is revised in writing.', 'Answered, not revised.', 'Could not defend.'),
];

export const MATH_TERM2 = {
  'real-analysis-1': {
    doc: 'docs/math-term2-audit.md',
    grader: 'Lean, through Mathematics in Lean: a proof counts only when Lean accepts it — not this app.',
    outcomes: [
      o('ma301.complete', 'Use completeness and supremum arguments, and distinguish countable from uncountable.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.14'], ['ra.sup'], [1], ['final']),
      o('ma301.sequences', 'Prove convergence of sequences with ε–N arguments, subsequences and the Cauchy criterion.', ['QAA-MSOR 3.14', 'GRE-M Additional'], ['ra.epsn'], [2], ['final']),
      o('ma301.continuity', 'Prove continuity and uniform continuity, and use the extreme and intermediate value theorems.', ['QAA-MSOR 3.10'], ['calc.limit'], [3], ['final']),
      o('ma301.hypotheses', 'Find the hypotheses a convergence theorem needs, and break it with a counterexample when one is removed.', ['QAA-MSOR 3.13', 'QAA-MSOR 3.14'], ['m.series'], [4], ['applied']),
      o('ma301.derivative', 'Prove the mean value theorem and Taylor\'s theorem with remainder.', ['QAA-MSOR 3.10'], ['m.mvt', 'calc.taylor'], [5], ['final']),
      o('ma301.integral', 'Prove integrability with upper and lower sums, and the fundamental theorem.', ['QAA-MSOR 3.10'], ['ra.riemann'], [6], ['final']),
      o('ma301.uniform', 'Distinguish pointwise from uniform convergence and know what each preserves.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.13'], ['ra.uniform'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.100A front page.', fix: 'Each unit now links the 18.100A lecture notes that cover it; the course text (Lebl, Basic Analysis I) is linked for the portfolio.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers suprema, ε–N, uniform convergence, Darboux sums, the mean value theorem and series.' },
      { what: 'No solutions to check against', why: '18.100A publishes its assignments and midterm but not solutions.', fix: 'Mathematics in Lean Chapters 11–12 have analysis exercises Lean checks; the Putnam archive has analysis problems with solutions.', url: `${MIL}/C11_Topology.html` },
    ],
    benchmarks: [
      { id: 'ma301.lean', name: 'Mathematics in Lean Chapters 11–12 exercises accepted by Lean', how: 'Record the percentage of the two chapters\' exercises Lean accepts.', max: 100, url: `${MIL}/C11_Topology.html` },
      { id: 'ma301.putnam', name: 'Putnam analysis problems solved', how: 'Attempt the analysis problems (sequences, series, inequalities, integrals) from the last ten Putnams before reading the solutions; record how many you solved.', max: 30, url: PUTNAM },
    ],
    rubrics: {
      applied: [
        crit('Strongest valid version', 'The convergence claim restated as the strongest version that is true, and proved.', 'A true version proved, but not the strongest.', 'The claim proved as stated when it is false.'),
        crit('Hypothesis inventory', 'Every hypothesis used is named at the step that uses it.', 'One hypothesis used silently.', 'Hypotheses not tracked.'),
        crit('Counterexamples', 'For each hypothesis, a counterexample showing the conclusion fails without it (for example xⁿ on [0, 1] for uniformity).', 'Counterexamples for some hypotheses.', 'None.'),
        crit('Error log', 'Every flawed step logged with its fix.', 'A log without fixes.', 'No log.'),
      ],
      final: oralFinal('Completeness, sequences, continuity, differentiation, Riemann integration and uniform convergence, connected so each theorem uses earlier ones.', 'At least one theorem of the portfolio (for example uniqueness of limits or the squeeze theorem) stated and proved in Lean.'),
    },
  },

  'abstract-algebra-1': {
    doc: 'docs/math-term2-audit.md',
    grader: 'Lean, through Mathematics in Lean Chapter 9: a proof counts only when Lean accepts it — not this app.',
    outcomes: [
      o('ma302.groups', 'Work with groups, subgroups, generators and cyclic groups.', ['QAA-MSOR 3.10', 'GRE-M Algebra'], ['alg.order', 'alg.subgroups'], [1], ['final']),
      o('ma302.homs', 'Use homomorphisms, kernels, quotients and the isomorphism theorems.', ['QAA-MSOR 3.10', 'GRE-M Algebra'], ['alg.homs'], [2], ['final']),
      o('ma302.perms', 'Compute in permutation groups and use group actions.', ['GRE-M Algebra'], ['alg.sign', 'alg.order', 'alg.dihedral'], [3], ['final']),
      o('ma302.classify', 'Enumerate small groups computationally, then prove or refute a structural conjecture.', ['QAA-MSOR 3.14', 'QAA-MSOR 3.17'], ['alg.dihedral', 'alg.units'], [4], ['applied']),
      o('ma302.sylow', 'Apply orbit–stabiliser, the class equation and the Sylow theorems.', ['QAA-MSOR 3.10'], ['alg.units'], [5], ['final']),
      o('ma302.rings', 'Work with rings, ideals and quotient rings.', ['GRE-M Algebra'], ['modinv', 'gcd'], [6], ['final']),
      o('ma302.poly', 'Factor polynomials and decide irreducibility.', ['GRE-M Algebra'], [], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the book\'s home page.', fix: 'Each unit now links the Judson chapters that cover it, in the HTML edition.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers element orders, subgroups of cyclic groups, homomorphisms, units, permutation parity and dihedral groups — each checked by brute force over the group.' },
      { what: 'Computation could pass as proof', why: 'The applied set enumerates groups by computer; nothing separated evidence from proof.', fix: 'The rubric now requires every computed pattern to be proved or refuted, and Lean checks the core.', url: `${MIL}/C09_Groups_and_Rings.html` },
    ],
    benchmarks: [
      { id: 'ma302.lean', name: 'Mathematics in Lean Chapter 9 exercises accepted by Lean', how: 'Record the percentage Lean accepts.', max: 100, url: `${MIL}/C09_Groups_and_Rings.html` },
      { id: 'ma302.judson', name: 'Judson exercises with published hints and answers', how: 'Solve the exercises that have hints or answers before reading them; record the percentage you got right.', max: 100, url: 'https://judsonbooks.org/aata-files/aata-html/backmatter-3.html' },
    ],
    rubrics: {
      applied: [
        crit('Enumeration', 'The group or ring family enumerated with a computer algebra system (Sage, GAP), with code and output kept.', 'Partial enumeration.', 'None.'),
        crit('Conjecture', 'A precise structural conjecture drawn from the data, with the cases tested listed.', 'A vague pattern.', 'No conjecture.'),
        crit('Proof or refutation', 'The conjecture proved for all cases, or refuted by a counterexample beyond the enumerated range.', 'Proved for the computed cases only.', 'Computation presented as proof.'),
        crit('Error log', 'Every mistake logged with its fix.', 'A log without fixes.', 'No log.'),
      ],
      final: oralFinal('The homomorphism theorems, group actions, the Sylow theorems, ideals and quotient rings, and polynomial factorisation, linked into one argument.', 'At least one result (for example Lagrange\'s theorem or a property of kernels) checked in Lean.'),
    },
  },

  'complex-analysis': {
    doc: 'docs/math-term2-audit.md',
    outcomes: [
      o('ma303.numbers', 'Compute with complex numbers in Cartesian and polar form.', ['QAA-MSOR 3.10', 'GRE-M Additional'], ['cx.polar', 'cx.roots'], [1], ['final']),
      o('ma303.analytic', 'Decide analyticity with the Cauchy–Riemann equations and use harmonic functions.', ['QAA-MSOR 3.10'], ['cx.cr'], [2], ['final']),
      o('ma303.cauchy', 'Integrate along contours and apply Cauchy\'s theorem.', ['QAA-MSOR 3.10'], ['mv.line'], [3], ['final']),
      o('ma303.residue-app', 'Evaluate real integrals or solve a planar potential problem by residues.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.18'], ['cx.residue'], [4], ['applied']),
      o('ma303.series', 'Expand analytic functions in power and Laurent series and find radii of convergence.', ['GRE-M Additional'], ['cx.radius', 'm.series'], [5], ['final']),
      o('ma303.residues', 'Classify singularities, compute residues and use the argument principle.', ['QAA-MSOR 3.10'], ['cx.residue'], [6], ['applied', 'final']),
      o('ma303.conformal', 'Use conformal maps and analytic continuation.', ['QAA-MSOR 3.10'], [], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.04 front page.', fix: 'Each unit now links the 18.04 topic notes that cover it.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers polar form, roots, Cauchy–Riemann, residues and radii of convergence. Checking them caught two mistakes in the first draft (see the audit doc).' },
    ],
    benchmarks: [
      { id: 'ma303.practice', name: 'MIT 18.04 (Spring 2018) practice exams 1 and 2, against the worked answers', how: 'Sit each in 80 minutes; record your average.', max: 100, url: `${OCW}/18-04-complex-variables-with-applications-spring-2018/pages/exams/` },
      { id: 'ma303.final', name: 'MIT 18.04 practice final, against the worked answers', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/18-04-complex-variables-with-applications-spring-2018/resources/mit18_04s18_practice-final/` },
    ],
    rubrics: {
      applied: [
        crit('Two methods', 'The integral or potential computed by residues and by an independent method (real-variable techniques or numerical quadrature), agreeing to stated accuracy.', 'One method only.', 'Wrong answer.'),
        crit('Singularities and contour', 'Every singularity located and classified, and the contour chosen with its orientation justified.', 'Singularities found, one misclassified.', 'Not analysed.'),
        crit('Limiting steps', 'The vanishing of arcs at infinity (Jordan\'s lemma or an ML bound) proved, not assumed.', 'Asserted.', 'Ignored.'),
        crit('Visualisation', 'The complex geometry (contour, poles, level sets or streamlines) plotted and used in the argument.', 'Plotted, not used.', 'None.'),
      ],
      final: examFinal('the 18.04 practice final will do', 'One argument that goes from Cauchy\'s theorem, through series and residues, to a conformal map, with its domain of validity stated.', 'A residue computation confirmed by numerical contour integration.'),
    },
  },

  'numerical-analysis': {
    doc: 'docs/math-term2-audit.md',
    outcomes: [
      o('ma304.float', 'Analyse floating-point error and backward stability.', ['QAA-MSOR 3.16'], ['m.float', 'ar.float'], [1], ['applied']),
      o('ma304.linear', 'Measure conditioning and solve linear systems stably.', ['QAA-MSOR 3.16', 'GRE-M Algebra'], ['na.cond', 'la.solve'], [2], ['applied', 'final']),
      o('ma304.roots', 'Solve nonlinear equations and prove convergence rates.', ['QAA-MSOR 3.16'], ['na.bisect', 'na.fixed', 'm.newton'], [3], ['final']),
      o('ma304.manufactured', 'Compare algorithms against manufactured solutions and measure their order.', ['QAA-MSOR 3.16', 'QAA-MSOR 3.17'], ['na.order', 'de.euler'], [4], ['applied']),
      o('ma304.interp', 'Interpolate and approximate, and bound the error.', ['QAA-MSOR 3.16'], ['na.interp'], [5], ['final']),
      o('ma304.quad', 'Differentiate and integrate numerically with error estimates.', ['QAA-MSOR 3.16'], ['na.simpson', 'calc.trapezoid'], [6], ['final']),
      o('ma304.eigen', 'Compute eigenvalues and certify their error.', ['QAA-MSOR 3.16', 'GRE-M Algebra'], ['la.eig2'], [7], ['final']),
    ],
    gaps: [
      { what: 'The course resource skips three units', why: '18.330 (Spring 2012) has no material on floating-point backward error, conditioning and linear solvers, or eigenvalue algorithms — Units 1, 2 and 7.', fix: 'Those units now read MIT 18.335J (Spring 2019), which covers each.', url: `${OCW}/18-335j-introduction-to-numerical-methods-spring-2019/pages/calendar/` },
      { what: 'Practice was unrelated', why: 'A gradient question and binary search.', fix: 'Practice now covers bisection counts, interpolation, Simpson\'s rule, fixed-point iteration, condition numbers and the order of a method.' },
      { what: 'No outside oracle', why: '18.330 publishes homework without solutions.', fix: 'Compare your solvers with LAPACK (through NumPy or Julia) on NIST\'s Matrix Market test matrices, which include ill-conditioned ones.', url: 'https://math.nist.gov/MatrixMarket/' },
    ],
    benchmarks: [
      { id: 'ma304.matrixmarket', name: 'Matrix Market problems your solver matches LAPACK on', how: 'Run your linear solver and eigensolver on ten Matrix Market matrices, including ill-conditioned ones; count those where your backward error is within 10× of LAPACK\'s.', max: 10, url: 'https://math.nist.gov/MatrixMarket/' },
    ],
    rubrics: {
      applied: [
        crit('Manufactured truth', 'Test problems built from a known exact solution, including ill-conditioned cases with known condition numbers.', 'Known solutions, no ill-conditioned case.', 'No ground truth.'),
        crit('Convergence measured', 'Observed order estimated from error against step size on a log–log plot and matched to theory.', 'Errors reported without an order.', 'Not measured.'),
        crit('Backward error', 'Backward error computed for each run and compared with machine epsilon times the condition number.', 'Forward error only.', 'Neither.'),
        crit('Failure thresholds', 'The condition number or step size at which each algorithm fails is found and explained.', 'Failures seen, not explained.', 'Not explored.'),
      ],
      final: examFinal('a cumulative set built from the 18.330 and 18.335J material', 'A solver defended from its convergence proof, through a test oracle, to an accuracy claim no stronger than the evidence.', 'The solver\'s output compared with LAPACK\'s on the same problems.'),
    },
  },

  'mathematical-modeling': {
    doc: 'docs/math-term2-audit.md',
    outcomes: [
      o('ma305.frame', 'Frame a question with stakeholders, boundaries and assumptions.', ['QAA-MSOR 3.13', 'QAA-MSOR 3.18'], [], [1], ['applied', 'final']),
      o('ma305.scale', 'Nondimensionalise and estimate with dimensional analysis.', ['QAA-MSOR 3.18'], ['mod.pi'], [2], ['final']),
      o('ma305.choose', 'Choose between deterministic, stochastic and discrete models.', ['QAA-MSOR 3.19'], ['mod.logistic', 'mod.queue', 'mod.sir'], [3], ['final']),
      o('ma305.calibrate', 'Calibrate a model on open data and try to falsify it with held-out evidence.', ['QAA-MSOR 3.19'], ['linreg'], [4], ['applied']),
      o('ma305.estimate', 'Estimate parameters, check identifiability, and measure sensitivity.', ['QAA-MSOR 3.11', 'QAA-MSOR 3.19'], ['st.ci'], [5], ['applied']),
      o('ma305.validate', 'Validate with residuals and uncertainty, against alternative models.', ['QAA-MSOR 3.19'], ['st.permtest'], [6], ['applied', 'final']),
      o('ma305.communicate', 'Communicate scenarios and the limits of the decisions a model supports.', ['QAA-MSOR 3.26'], [], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'The resource\'s page is blocked to scripts', why: 'SIAM\'s handbook page now refuses automated requests, so its link could not be checked.', fix: 'The units link the handbook PDF itself, which loads, opened at each chapter.' },
      { what: 'Two units had no source', why: 'The handbook has nothing on dimensional analysis or parameter estimation.', fix: 'Unit 2 reads Hefferon\'s Topic on Dimensional Analysis (Buckingham π); Unit 5 reads Pishro-Nik on point estimation; Unit 6 adds NIST\'s guidance on model validation.' },
      { what: 'Practice was borrowed', why: 'Forecasting and regression from the AI track.', fix: 'Practice now covers logistic growth, Buckingham π, epidemic thresholds and queues — each checked by simulation.' },
    ],
    benchmarks: [
      { id: 'ma305.heldout', name: 'Held-out coverage: share of later observations inside your 90% prediction interval', how: 'Freeze the model, then wait for (or hold back) new data; record the percentage that falls inside the interval. Near 90 is calibrated.', max: 100, url: 'https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm' },
      { id: 'ma305.mcm', name: 'COMAP MCM/ICM: a past problem against the published outstanding papers', how: 'Solve one past problem in the contest\'s 96 hours, then compare with the outstanding papers; record 1 if your model\'s conclusions survive the comparison.', max: 1, url: 'https://www.comap.com/contests/mcm-icm' },
    ],
    rubrics: {
      applied: [
        crit('Framing', 'Question, stakeholders, system boundary and every assumption stated, each assumption with its consequence if wrong.', 'Assumptions listed without consequences.', 'No framing.'),
        crit('Calibration', 'Parameters fitted to a cited open dataset with uncertainty, and identifiability checked (no two parameters trade off freely).', 'Fitted without uncertainty.', 'Guessed parameters.'),
        crit('Falsification attempt', 'The model tested on held-out data and against at least one alternative model, with the result reported even if unfavourable.', 'Held-out test, no alternative.', 'No test.'),
        crit('Error log', 'Every modelling mistake logged with its fix.', 'A log without fixes.', 'No log.'),
      ],
      final: [
        crit('Dossier completeness', 'Stakeholders, assumptions, derivation, calibration, uncertainty, validation, alternatives and decision limits all present and consistent.', 'One part thin.', 'Several missing.'),
        crit('Reproducibility', 'One command reproduces every figure and number from the raw data.', 'Mostly reproducible.', 'Not reproducible.'),
        crit('Decision boundaries', 'The decisions the model can and cannot support stated, with the scenarios that would change them.', 'Stated loosely.', 'Overclaimed.'),
        crit('Stakeholder defense', 'Questions from a non-specialist audience answered without jargon, and corrections recorded.', 'Answered with jargon.', 'Could not answer.'),
      ],
    },
  },
};
