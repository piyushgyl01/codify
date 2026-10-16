/**
 * Mathematics, Term 1 — audited as Term 0 was: readings for every unit
 * (tools/readings/math.mjs), outcomes mapped to the QAA MSOR benchmark and
 * GRE Mathematics areas, rubrics with marking anchors, verified practice and
 * outside graders.
 *
 * Outside graders: MIT 18.02, 18.03 and 18.440 exams with solutions; Lean,
 * through Mathematics in Lean; the Putnam archive with Kedlaya's solutions.
 * Evidence in docs/math-term1-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';
const MIL = 'https://leanprover-community.github.io/mathematics_in_lean';
const PUTNAM = 'https://kskedlaya.org/putnam-archive/';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });
/** The final-exam lines most Maths courses share; the course supplies what its linked solution must connect. */
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

export const MATH_TERM1 = {
  'multivariable-calculus': {
    doc: 'docs/math-term1-audit.md',
    outcomes: [
      o('ma201.vectors', 'Work with vectors, lines, planes and parametric curves.', ['QAA-MSOR 3.8', 'GRE-M Calculus'], ['dot', 'matmul'], [1], ['final']),
      o('ma201.partials', 'Compute partial derivatives, gradients and directional derivatives.', ['QAA-MSOR 3.8', 'GRE-M Calculus'], ['mv.gradient'], [2], ['final']),
      o('ma201.approx', 'Approximate locally with the chain rule and the Hessian, and classify critical points.', ['GRE-M Calculus'], ['mv.gradient', 'calc.optimize'], [3], ['applied']),
      o('ma201.constrained', 'Optimise under constraints with Lagrange multipliers, and test sensitivity.', ['QAA-MSOR 3.18', 'GRE-M Calculus'], ['mv.lagrange'], [4], ['applied']),
      o('ma201.integrals', 'Evaluate double and triple integrals, changing variables where it helps.', ['GRE-M Calculus'], ['mv.double'], [5], ['final']),
      o('ma201.fields', 'Compute line and surface integrals of vector fields, with orientation.', ['GRE-M Calculus'], ['mv.line', 'mv.divcurl'], [6], ['final']),
      o('ma201.theorems', 'Apply Green\'s, Stokes\' and the divergence theorem, and check them numerically.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.16'], ['mv.line', 'mv.divcurl'], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.02 front page.', fix: 'Each unit now links the week of 18.02 lecture notes that covers it and names the lectures.' },
      { what: 'One borrowed practice skill', why: 'Only "gradient" from the AI track.', fix: 'Practice now covers directional derivatives, Lagrange multipliers, double integrals in polar form, line integrals with Green\'s theorem, divergence and curl.' },
    ],
    benchmarks: [
      { id: 'ma201.practice', name: 'MIT 18.02 (Fall 2007) practice exams 1–4, A versions', how: 'Sit each in 50 minutes after its part of the course; record your average against the solutions.', max: 100, url: `${OCW}/18-02-multivariable-calculus-fall-2007/pages/exams/` },
      { id: 'ma201.exams', name: 'MIT 18.02 (Fall 2007) practice exams 1–4, B versions', how: 'Sit them later as the real test; record your average.', max: 100, url: `${OCW}/18-02-multivariable-calculus-fall-2007/pages/exams/` },
    ],
    rubrics: {
      applied: [
        crit('First- and second-order conditions', 'Critical points from ∇L = 0 derived in full, and each classified by the bordered Hessian or a second-order argument.', 'First-order only.', 'Wrong conditions.'),
        crit('Feasible geometry', 'The feasible set and level curves drawn, showing why the optimum is where it is.', 'Drawn, not interpreted.', 'Not shown.'),
        crit('Sensitivity', 'λ interpreted as the rate of change of the optimum with the constraint, and checked by re-solving with a perturbed constraint.', 'λ computed, not interpreted or checked.', 'None.'),
        crit('Independent check', 'The optimum confirmed by a numerical search over the constraint set.', 'Spot checks only.', 'None.'),
      ],
      final: examFinal('an 18.02 B-version practice exam set will do', 'One vector-field calculation traced through parametrisation, orientation and the right integral theorem.', 'The theorem\'s two sides computed separately and shown equal, or a numerical integral agreeing to stated accuracy.'),
    },
  },

  'linear-algebra-2': {
    doc: 'docs/math-term1-audit.md',
    grader: 'Lean, through Mathematics in Lean: a proof counts only when Lean accepts it — not this app.',
    outcomes: [
      o('ma202.quotient', 'Construct quotient spaces and use them in dimension arguments.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.14'], ['la2.ranknull'], [1], ['final']),
      o('ma202.maps', 'Prove facts about linear maps and isomorphisms without coordinates.', ['QAA-MSOR 3.14', 'GRE-M Algebra'], ['la2.ranknull'], [2], ['final']),
      o('ma202.dual', 'Work with dual spaces, annihilators and the transpose map.', ['QAA-MSOR 3.10'], [], [3], ['final']),
      o('ma202.similar', 'Classify operators up to similarity by their invariants.', ['GRE-M Algebra'], ['la2.charpoly', 'la.eig2'], [4], ['applied']),
      o('ma202.canonical', 'Find minimal polynomials and Jordan forms.', ['QAA-MSOR 3.10', 'GRE-M Algebra'], ['la2.jordan', 'la2.charpoly'], [5], ['applied', 'final']),
      o('ma202.adjoint', 'Use inner products and adjoints.', ['GRE-M Algebra'], ['m.proj'], [6], ['final']),
      o('ma202.spectral', 'Apply the spectral theorem and classify quadratic forms.', ['QAA-MSOR 3.10', 'GRE-M Algebra'], ['la2.definite', 'la.svd'], [7], ['final']),
      o('ma202.portfolio', 'Defend a connected theorem portfolio, with its core checked in Lean.', ['QAA-MSOR 3.14', 'QAA-MSOR 3.26'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'The book skips a unit', why: 'Unit 1 is about quotient spaces, which Treil says (a remark in Chapter 7, p. 210) the book does not discuss.', fix: 'Unit 1 now reads Axler\'s Linear Algebra Done Right, 4th ed., §3E — free from the author.', url: 'https://linear.axler.net/' },
      { what: 'Units had no links', why: 'Every unit pointed at Treil\'s home page.', fix: 'Each unit now opens Treil\'s PDF at its chapter.' },
      { what: 'Practice was two operations', why: 'Eigenvalues and matrix multiplication only.', fix: 'Practice now covers characteristic polynomials, rank–nullity, Jordan structure, quadratic forms and projection.' },
      { what: 'Proofs were self-checked', why: 'Nothing outside checked the theorem portfolio.', fix: 'Mathematics in Lean Chapter 10 states and proves linear-algebra results that Lean checks; Putnam problems have published solutions.', url: `${MIL}/C10_Linear_Algebra.html` },
    ],
    benchmarks: [
      { id: 'ma202.lean', name: 'Mathematics in Lean Chapter 10 exercises accepted by Lean', how: 'Record the percentage of the chapter\'s exercises Lean accepts.', max: 100, url: `${MIL}/C10_Linear_Algebra.html` },
      { id: 'ma202.putnam', name: 'Putnam linear-algebra problems solved', how: 'Attempt the linear-algebra problems from the last ten Putnams before reading Kedlaya\'s solutions; record how many you solved.', max: 20, url: PUTNAM },
    ],
    rubrics: {
      applied: [
        crit('Invariants', 'Characteristic and minimal polynomials, ranks of (A − λI)ᵏ, and the Jordan form computed for every operator in the family, exactly.', 'Most computed; one invariant missing.', 'Invariants wrong.'),
        crit('Proof of invariance', 'Each invariant proved unchanged under change of basis.', 'Asserted, not proved.', 'Not addressed.'),
        crit('Numerical comparison', 'The symbolic canonical form compared with a stable numerical decomposition (Schur or SVD), with the failure of numerical Jordan form shown on a perturbed matrix.', 'Compared without the perturbation study.', 'No comparison.'),
        crit('Error log', 'Every mistake logged with its cause and corrected work.', 'A log without corrections.', 'No log.'),
      ],
      final: oralFinal('Quotient spaces, duality, a canonical form, adjoints and a spectral theorem, each with a proof that connects to the others.', 'At least one theorem of the portfolio stated and proved in Lean (Mathematics in Lean Chapter 10 shows how).'),
    },
  },

  'differential-equations': {
    doc: 'docs/math-term1-audit.md',
    outcomes: [
      o('ma203.first', 'Solve first-order equations and reason about existence and uniqueness.', ['QAA-MSOR 3.8', 'GRE-M Calculus'], ['de.linear1'], [1], ['final']),
      o('ma203.second', 'Solve linear second-order equations and interpret damping and resonance.', ['QAA-MSOR 3.10'], ['de.oscillator'], [2], ['final']),
      o('ma203.laplace', 'Use Laplace transforms, impulses and convolution.', ['QAA-MSOR 3.10'], ['de.laplace'], [3], ['final']),
      o('ma203.fit', 'Fit an ODE model to data and estimate its parameters.', ['QAA-MSOR 3.18', 'QAA-MSOR 3.19'], ['linreg'], [4], ['applied']),
      o('ma203.systems', 'Solve linear systems by eigenmodes and the matrix exponential, and classify the phase plane.', ['QAA-MSOR 3.10', 'GRE-M Algebra'], ['de.phase', 'la.eig2'], [5], ['final']),
      o('ma203.nonlinear', 'Find equilibria of nonlinear systems and decide their stability.', ['QAA-MSOR 3.10'], ['de.equilibria', 'de.phase'], [6], ['final']),
      o('ma203.numerics', 'Solve numerically, controlling step size and recognising stiffness.', ['QAA-MSOR 3.16'], ['de.euler'], [7], ['applied']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.03 front page.', fix: 'Each unit now links the 18.03 lecture notes that cover it.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers first-order linear equations, oscillators, Laplace transforms, the phase plane, equilibria and Euler\'s method — each checked against a numerical solver or integral.' },
    ],
    benchmarks: [
      { id: 'ma203.exams', name: 'MIT 18.03 (Spring 2010) hour exams I–III, against the solutions', how: 'Sit each in 50 minutes; record your average percentage.', max: 100, url: `${OCW}/18-03-differential-equations-spring-2010/pages/exams/` },
      { id: 'ma203.final', name: 'MIT 18.03 practice final, against its solutions', how: 'Three hours, closed-book; record your percentage.', max: 100, url: `${OCW}/18-03-differential-equations-spring-2010/resources/mit18_03s10_prfinal/` },
    ],
    rubrics: {
      applied: [
        crit('Model and data', 'An ODE chosen for a stated mechanism, fitted to a cited open time series with its units.', 'A model without a stated mechanism.', 'No data, or a model that does not fit the question.'),
        crit('Parameter estimation', 'Parameters estimated by least squares on the solution (not by eye), with uncertainty from residuals or the bootstrap.', 'Estimated without uncertainty.', 'Guessed.'),
        crit('Analytic versus numerical', 'Closed-form and numerical solutions agree within a stated tolerance as the step shrinks.', 'One method only.', 'They disagree unexplained.'),
        crit('Error diagnosis', 'Structural error (wrong model) separated from measurement error, with residual patterns as evidence.', 'Residuals shown, not diagnosed.', 'None.'),
      ],
      final: examFinal('the 18.03 practice final will do', 'One forced or nonlinear system taken from derivation through qualitative behaviour (equilibria, stability) to a computed solution.', 'Limiting cases (no forcing, no damping, small amplitude) checked against known solutions.'),
    },
  },

  'probability-1': {
    doc: 'docs/math-term1-audit.md',
    outcomes: [
      o('ma204.axioms', 'Model experiments with sample spaces, the axioms and counting.', ['QAA-MSOR 3.8', 'GRE-M Additional'], ['pr.birthday', 'ncr'], [1], ['final']),
      o('ma204.conditional', 'Condition on events, apply Bayes\' rule and test independence.', ['QAA-MSOR 3.8'], ['pr.bayes', 'pr.indep'], [2], ['final']),
      o('ma204.discrete', 'Work with discrete random variables, expectation and variance.', ['QAA-MSOR 3.8'], ['pr.discrete', 'expect', 'pr.indicator'], [3], ['final']),
      o('ma204.simulate', 'Simulate a probability model and calibrate it against the analysis.', ['QAA-MSOR 3.17', 'QAA-MSOR 3.19'], ['pr.discrete'], [4], ['applied']),
      o('ma204.continuous', 'Work with densities and transformations of continuous variables.', ['QAA-MSOR 3.8'], ['pr.continuous'], [5], ['final']),
      o('ma204.joint', 'Handle joint laws, covariance and conditional expectation.', ['QAA-MSOR 3.8'], ['pr.cov'], [6], ['applied', 'final']),
      o('ma204.limits', 'Apply the law of large numbers and the central limit theorem.', ['QAA-MSOR 3.8', 'QAA-MSOR 3.11'], ['pr.clt'], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.440 front page.', fix: 'Each unit now links the 18.440 lecture slides that cover it.' },
      { what: 'Practice was borrowed', why: 'Expected value, Bayes and binomials from other tracks — nothing on continuous variables, covariance or limit theorems.', fix: 'The degree\'s own probability practice (from the CS degree) now covers all eight units.' },
    ],
    benchmarks: [
      { id: 'ma204.midterms', name: 'MIT 18.440 (2014) midterms 1 and 2, against the solutions', how: 'Sit each in 50 minutes; record your average.', max: 100, url: `${OCW}/18-440-probability-and-random-variables-spring-2014/pages/exams/` },
      { id: 'ma204.final', name: 'MIT 18.440 final exam 2014, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/18-440-probability-and-random-variables-spring-2014/resources/mit18_440s14_final_2014/` },
    ],
    rubrics: {
      applied: [
        crit('Model specification', 'The reliability or queueing model stated with its sample space, distributions and independence assumptions.', 'One assumption implicit.', 'Unspecified.'),
        crit('Analytic probabilities', 'Exact probabilities or expectations derived for the main quantities.', 'Approximations only.', 'None.'),
        crit('Simulation and calibration', 'A seeded simulation agrees with the analysis within a confidence interval that shrinks like 1/√n.', 'Agreement claimed without an interval.', 'No simulation, or disagreement unexplained.'),
        crit('Sensitivity to independence', 'The answer recomputed with a dependence introduced, and the change explained.', 'Discussed, not computed.', 'Ignored.'),
      ],
      final: examFinal('the 18.440 2014 final will do', 'One model followed from sample space through conditioning, expectation and dependence to an approximation.', 'The approximation compared with the exact value or a simulation.'),
    },
  },

  'combinatorics-and-graph-theory': {
    doc: 'docs/math-term1-audit.md',
    outcomes: [
      o('ma205.bijective', 'Count by bijections, double counting and inclusion–exclusion.', ['QAA-MSOR 3.14', 'GRE-M Additional'], ['comb.derange', 'inclexcl', 'comb.stirling'], [1], ['final']),
      o('ma205.genfun', 'Solve recurrences with generating functions.', ['QAA-MSOR 3.10'], ['comb.stars', 'comb.catalan', 'dm.recur'], [2], ['final']),
      o('ma205.graphs', 'Reason about connectivity, trees and traversals.', ['GRE-M Additional'], ['bfs', 'dfs', 'mst'], [3], ['final']),
      o('ma205.matching', 'Find maximum matchings and certify them with Hall\'s or König\'s theorem.', ['QAA-MSOR 3.10'], ['comb.matching', 'alg.maxflow'], [4, 5], ['applied', 'final']),
      o('ma205.colouring', 'Colour graphs, prove lower bounds, and use planarity and Euler\'s formula.', ['QAA-MSOR 3.10'], ['comb.chromatic'], [4, 6], ['applied', 'final']),
      o('ma205.probabilistic', 'Prove existence with extremal and probabilistic arguments.', ['QAA-MSOR 3.14'], ['dm.pigeon'], [7], ['final']),
      o('ma205.defend', 'Defend a connected set of combinatorial solutions.', ['QAA-MSOR 3.26'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the book\'s home page.', fix: 'Each unit now links the section of Applied Combinatorics that covers it.' },
      { what: 'Practice stopped at algorithms', why: 'Binomials and graph searches only — no derangements, set partitions, Catalan numbers, colouring or matching.', fix: 'Practice now covers each, every answer checked by brute-force enumeration.' },
      { what: 'No outside check', why: 'Solutions were self-marked.', fix: 'Putnam problems in combinatorics have Kedlaya\'s published solutions; Mathematics in Lean Chapter 6 has discrete mathematics Lean checks.', url: PUTNAM },
    ],
    benchmarks: [
      { id: 'ma205.putnam', name: 'Putnam combinatorics problems solved', how: 'Attempt the combinatorics and graph-theory problems from the last ten Putnams before reading the solutions; record how many you solved.', max: 30, url: PUTNAM },
      { id: 'ma205.lean', name: 'Mathematics in Lean Chapter 6 exercises accepted by Lean', how: 'Record the percentage Lean accepts.', max: 100, url: `${MIL}/C06_Discrete_Mathematics.html` },
    ],
    rubrics: {
      applied: [
        crit('Model', 'The instance stated as a matching, colouring or flow problem with every constraint encoded.', 'One constraint dropped.', 'Wrong model.'),
        crit('Solver correctness', 'The solver\'s output checked by brute force on small instances and by verifying the solution\'s constraints on the real one.', 'Checked on the real instance only.', 'Unchecked.'),
        crit('Certificate', 'Optimality or impossibility certified — a vertex cover of equal size, a Hall violator, an odd cycle or clique.', 'Certificate claimed, not exhibited.', 'No certificate.'),
        crit('Error log', 'Every mistake logged with its cause and corrected work.', 'A log without corrections.', 'No log.'),
      ],
      final: oralFinal('Generating functions, graph structure, matching, colouring, one extremal argument and one probabilistic argument.', 'At least one counting identity or graph lemma checked in Lean (Mathematics in Lean Chapter 6), or every counting answer checked by enumeration on small cases.'),
    },
  },
};
