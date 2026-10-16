/**
 * Mathematics, Term 3 — audited as Terms 0–2 were.
 *
 * Outside graders: Lean (Mathematics in Lean Chapters 9, 11, 13); Judson's
 * hints and answers; CVXPY and MIPLIB's known optima as oracles for
 * optimisation; MIT 18.445 homework with solutions; the Putnam archive.
 * Evidence in docs/math-term3-audit.md.
 */

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
const counterexampleSet = what => [
  crit('Valid theorem', `The ${what} proved under hypotheses sufficient for it, with each hypothesis used at a named step.`, 'Proved with one hypothesis used silently.', 'Proof fails or proves the wrong statement.'),
  crit('Counterexamples', 'Each tempting stronger version refuted by an explicit counterexample, checked against every remaining hypothesis.', 'Some counterexamples, or unchecked ones.', 'None.'),
  crit('Computation as evidence', 'Numerical or computer-algebra experiments used to find the counterexamples, and kept separate from the proofs.', 'Experiments mixed with proof.', 'No experiments, or experiments presented as proof.'),
  crit('Error log', 'Every false step logged with its fix.', 'A log without fixes.', 'No log.'),
];

export const MATH_TERM3 = {
  'real-analysis-2-measure-and-integration': {
    doc: 'docs/math-term3-audit.md',
    grader: 'Lean, through Mathematics in Lean Chapter 13: a proof counts only when Lean accepts it — not this app.',
    outcomes: [
      o('ma401.measure', 'Construct Lebesgue measure from outer measure and work with σ-algebras.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.14'], ['meas.cantor'], [1], ['final']),
      o('ma401.functions', 'Work with measurable functions and modes of convergence.', ['QAA-MSOR 3.10'], ['ra.uniform'], [2], ['final']),
      o('ma401.integral', 'Integrate with respect to a measure and compare with the Riemann integral.', ['QAA-MSOR 3.10'], ['meas.simple', 'ra.riemann'], [3], ['final']),
      o('ma401.interchange', 'Decide when limits and integrals commute, and break the tempting cases with counterexamples.', ['QAA-MSOR 3.13', 'QAA-MSOR 3.14'], ['ra.uniform'], [4, 5], ['applied']),
      o('ma401.lp', 'Work in Lᵖ spaces with Hölder\'s and Minkowski\'s inequalities.', ['QAA-MSOR 3.10'], ['meas.lp'], [6], ['final']),
      o('ma401.product', 'Use product measures and Fubini–Tonelli, and state Radon–Nikodym.', ['QAA-MSOR 3.10'], ['mv.double'], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the book\'s home page.', fix: 'Each unit now opens Axler\'s free PDF at its section.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers Cantor-type sets, integrals of simple functions and Lᵖ norms, alongside uniform convergence and Darboux sums from Real Analysis I.' },
      { what: 'No outside check', why: 'Measure-theoretic proofs were self-checked.', fix: 'Mathematics in Lean Chapter 13 has measure and integration exercises Lean checks.', url: `${MIL}/C13_Integration_and_Measure_Theory.html` },
    ],
    benchmarks: [
      { id: 'ma401.lean', name: 'Mathematics in Lean Chapter 13 exercises accepted by Lean', how: 'Record the percentage Lean accepts.', max: 100, url: `${MIL}/C13_Integration_and_Measure_Theory.html` },
      { id: 'ma401.putnam', name: 'Putnam integral and limit problems solved', how: 'Attempt the problems on limits of integrals and series from the last ten Putnams; record how many you solved.', max: 20, url: PUTNAM },
    ],
    rubrics: {
      applied: counterexampleSet('interchange of limit and integral'),
      final: oralFinal('Outer measure to Lebesgue measure, the integral, the three convergence theorems, Lᵖ completeness, and Fubini–Tonelli, each building on the last.', 'At least one result (for example monotonicity of the integral or a convergence step) checked in Lean.'),
    },
  },

  'abstract-algebra-2': {
    doc: 'docs/math-term3-audit.md',
    outcomes: [
      o('ma402.modules', 'Work with modules, submodules, quotients and exact sequences.', ['QAA-MSOR 3.10', 'GRE-M Algebra'], ['la2.ranknull'], [1], ['final']),
      o('ma402.pid', 'Classify finitely generated modules over a PID.', ['QAA-MSOR 3.10'], ['la2.jordan'], [2], ['final']),
      o('ma402.noether', 'Use Noetherian conditions and the structure of polynomial rings.', ['QAA-MSOR 3.10'], ['alg2.irred'], [3], ['final']),
      o('ma402.finite', 'Construct finite fields and compute in them.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.17'], ['alg2.gf', 'alg2.irred'], [4], ['applied']),
      o('ma402.extensions', 'Compute degrees of field extensions and minimal polynomials.', ['GRE-M Algebra'], ['alg2.degree'], [5], ['final']),
      o('ma402.splitting', 'Construct splitting fields and decide separability.', ['QAA-MSOR 3.10'], ['alg2.cyclotomic'], [6], ['final']),
      o('ma402.galois', 'Apply the Galois correspondence and decide solvability by radicals.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.14'], ['alg2.cyclotomic', 'alg.order'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the book\'s blurb page.', fix: 'Each unit now opens Goodman\'s free PDF at its section.' },
      { what: 'The book has no finite-field chapter', why: 'Unit 4 is a finite-field study; Goodman treats finite fields only in passing.', fix: 'Unit 4 reads Judson Chapter 22, Finite Fields.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers inverses in GF(2ᵏ), irreducibility mod p, degrees of extensions and cyclotomic Galois groups, each checked by an independent computation.' },
    ],
    benchmarks: [
      { id: 'ma402.judson', name: 'Judson Chapters 21–23 exercises with published hints and answers', how: 'Solve before reading the hints; record the percentage right.', max: 100, url: 'https://judsonbooks.org/aata-files/aata-html/backmatter-3.html' },
      { id: 'ma402.lean', name: 'Mathematics in Lean Chapter 9 (rings) exercises accepted by Lean', how: 'Record the percentage of the ring-theory exercises Lean accepts.', max: 100, url: `${MIL}/C09_Groups_and_Rings.html` },
    ],
    rubrics: {
      applied: [
        crit('Construction', 'GF(pⁿ) built from an irreducible polynomial that is proved irreducible, with addition and multiplication tables checked by a CAS.', 'Built, irreducibility not proved.', 'Not built.'),
        crit('Automorphisms', 'The Frobenius map verified to be an automorphism of order n on the examples.', 'Checked on one example.', 'Not checked.'),
        crit('Generalisation', 'Every observed pattern either proved for all finite fields or marked as an example only.', 'Some patterns proved.', 'Examples presented as theorems.'),
        crit('Error log', 'Every mistake logged with its fix.', 'A log without fixes.', 'No log.'),
      ],
      final: oralFinal('Module classification over a PID, field extensions, splitting fields, the Galois correspondence and solvability by radicals, linked into one story.', 'One ring-theoretic lemma used in the portfolio checked in Lean (Mathematics in Lean Chapter 9).'),
    },
  },

  'topology': {
    doc: 'docs/math-term3-audit.md',
    grader: 'Lean, through Mathematics in Lean Chapter 11: a proof counts only when Lean accepts it — not this app.',
    outcomes: [
      o('ma403.spaces', 'Define topologies from bases and subspaces.', ['QAA-MSOR 3.10', 'GRE-M Additional'], ['top.count'], [1], ['final']),
      o('ma403.maps', 'Prove continuity and homeomorphism, and use product topologies.', ['QAA-MSOR 3.14'], [], [2], ['final']),
      o('ma403.quotients', 'Build spaces as quotients and recognise them.', ['QAA-MSOR 3.10'], ['top.euler'], [3], ['applied', 'final']),
      o('ma403.invariants', 'Tell spaces apart by invariants, and show which pairs are homeomorphic.', ['QAA-MSOR 3.14'], ['top.euler'], [4], ['applied']),
      o('ma403.compact', 'Prove compactness and use it.', ['QAA-MSOR 3.10'], ['ra.sup'], [5], ['final']),
      o('ma403.connected', 'Prove connectedness and path-connectedness, and know when they differ.', ['QAA-MSOR 3.10'], [], [6], ['final']),
      o('ma403.pi1', 'Compute fundamental groups and use winding numbers.', ['QAA-MSOR 3.10', 'GRE-M Additional'], ['cx.residue'], [7], ['final']),
    ],
    gaps: [
      { what: 'The course\'s text is not free', why: '18.901 (Fall 2004) is taught from Munkres, and its own notes cover only some weeks — none on bases, products or quotients.', fix: 'Units 1–3, 5 and 6 now read Hatcher\'s free Notes on Introductory Point-Set Topology.', url: 'https://pi.math.cornell.edu/~hatcher/Top/TopNotes.pdf' },
      { what: 'A unit the course never reaches', why: 'Unit 7 is homotopy and the fundamental group; 18.901 ends with separation axioms, Tychonoff and embeddings.', fix: 'Unit 7 reads Chapter 1 of Hatcher\'s Algebraic Topology (free).', url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now counts topologies on finite sets by brute force and works with Euler characteristics of surfaces.' },
    ],
    benchmarks: [
      { id: 'ma403.lean', name: 'Mathematics in Lean Chapter 11 exercises accepted by Lean', how: 'Record the percentage Lean accepts.', max: 100, url: `${MIL}/C11_Topology.html` },
    ],
    rubrics: {
      applied: [
        crit('Atlas', 'At least eight related spaces (sphere, torus, Klein bottle, projective plane, Möbius band, annulus, wedge of circles, …) drawn with their quotient constructions.', 'Fewer spaces or missing constructions.', 'No atlas.'),
        crit('Homeomorphisms', 'Each claimed homeomorphism given explicitly, with continuity of the map and its inverse proved.', 'Maps given, continuity not proved.', 'Claimed without maps.'),
        crit('Invariants', 'Non-homeomorphic pairs separated by an invariant (compactness, connectedness, Euler characteristic, orientability, π₁) that is proved to be one.', 'Invariant used without proving it is one.', 'Pairs not separated.'),
        crit('Failed intuitions', 'Plausible but wrong guesses documented with the counterexample that killed them.', 'Mentioned without counterexamples.', 'None recorded.'),
      ],
      final: oralFinal('Bases, quotients, compactness, connectedness and the fundamental group of the circle, connected into one argument (for example, why ℝ² is not homeomorphic to ℝ³ minus a line).', 'At least one point-set lemma checked in Lean (Mathematics in Lean Chapter 11).'),
    },
  },

  'optimization': {
    doc: 'docs/math-term3-audit.md',
    outcomes: [
      o('ma404.lp', 'Formulate problems and solve linear programs.', ['QAA-MSOR 3.12', 'QAA-MSOR 3.18'], ['opt.lp'], [1], ['applied']),
      o('ma404.convex', 'Recognise convex sets and functions.', ['QAA-MSOR 3.10'], ['opt.convex', 'la2.definite'], [2], ['final']),
      o('ma404.duality', 'Derive duals and use them as certificates of optimality or infeasibility.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.12'], ['opt.lp'], [3], ['applied', 'final']),
      o('ma404.sensitivity', 'Audit how the optimum moves when the data change.', ['QAA-MSOR 3.12', 'QAA-MSOR 3.19'], ['mv.lagrange'], [4], ['applied']),
      o('ma404.kkt', 'State and use the KKT conditions.', ['QAA-MSOR 3.10'], ['mv.lagrange'], [5], ['final']),
      o('ma404.methods', 'Run gradient, Newton and proximal methods and predict their convergence.', ['QAA-MSOR 3.16'], ['opt.gd', 'm.newton'], [6], ['final']),
      o('ma404.integer', 'Handle integer decisions and robustness, and name the gap between model and implementation.', ['QAA-MSOR 3.12', 'QAA-MSOR 3.13'], ['knapsack'], [7, 8], ['applied', 'final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the book\'s index page.', fix: 'Each unit now opens Boyd & Vandenberghe\'s free PDF at its chapter or section.' },
      { what: 'Two topics are outside the book', why: 'Boyd & Vandenberghe covers convex problems: it has nothing on proximal methods (Unit 6) or integer decisions (Unit 7).', fix: 'Unit 6 adds Parikh & Boyd\'s Proximal Algorithms; Unit 7 reads Chapter 9 of MIT\'s Applied Mathematical Programming on integer programming.', url: 'https://web.mit.edu/15.053/www/AMP.htm' },
      { what: 'Practice was borrowed', why: 'Gradient, Adam and knapsack from other tracks.', fix: 'Practice now covers LP vertices, convexity by the Hessian and gradient descent on quadratics.' },
    ],
    benchmarks: [
      { id: 'ma404.cvxpy', name: 'Problems where your solver matches CVXPY to 1e-6, with a dual certificate', how: 'Solve ten problems from the book\'s chapters with your own code and with CVXPY; count the ones that agree and whose duality gap you verified.', max: 10, url: 'https://www.cvxpy.org/examples/index.html' },
      { id: 'ma404.miplib', name: 'MIPLIB "easy" instances solved to the known optimum', how: 'Solve instances tagged easy with an open solver you drive yourself; count those matching MIPLIB\'s published optimum.', max: 10, url: 'https://miplib.zib.de/tag_easy.html' },
    ],
    rubrics: {
      applied: [
        crit('Formulation', 'Decision variables, objective and every constraint stated with units, from a cited open dataset.', 'One constraint missing or unjustified.', 'Not a valid formulation.'),
        crit('Primal–dual certificate', 'An optimal primal solution and a dual solution whose objectives agree, with complementary slackness checked.', 'Primal only.', 'No solution.'),
        crit('Sensitivity and infeasibility', 'Shadow prices interpreted; the effect of perturbing the binding constraints measured; an infeasible variant diagnosed with a Farkas certificate.', 'Shadow prices only.', 'None.'),
        crit('Distribution and implementation', 'Who gains and loses under the optimal allocation, and the gap between the model and what could be deployed, stated.', 'One of the two.', 'Neither.'),
      ],
      final: examFinal('a cumulative set built from the book\'s exercises', 'One model taken from variables and assumptions, through convexity and an algorithm, to a certificate and its robustness limits.', 'The model solved with CVXPY or another independent solver and the answers compared.'),
    },
  },

  'stochastic-processes-and-statistical-inference': {
    doc: 'docs/math-term3-audit.md',
    outcomes: [
      o('ma405.chains', 'Model with discrete-time Markov chains and classify their states.', ['QAA-MSOR 3.11'], ['la.markov', 'stoch.ruin'], [1], ['final']),
      o('ma405.longrun', 'Find stationary distributions and long-run behaviour.', ['QAA-MSOR 3.11'], ['la.markov'], [2], ['final']),
      o('ma405.poisson', 'Use Poisson processes, waiting times and renewal ideas.', ['QAA-MSOR 3.11'], ['stoch.poisson', 'mod.queue'], [3], ['final']),
      o('ma405.data', 'Fit a stochastic model to a preregistered open dataset and check it.', ['QAA-MSOR 3.11', 'QAA-MSOR 3.19'], ['stoch.mle'], [4], ['applied']),
      o('ma405.likelihood', 'Estimate by maximum likelihood and use sufficient statistics.', ['QAA-MSOR 3.11'], ['stoch.mle'], [5], ['applied', 'final']),
      o('ma405.tests', 'Build confidence intervals and hypothesis tests.', ['QAA-MSOR 3.11'], ['st.ci', 'st.permtest'], [6], ['final']),
      o('ma405.bayes', 'Update beliefs with Bayes and criticise the model.', ['QAA-MSOR 3.11'], ['pr.bayes', 'ai.bayesnet'], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the book\'s home page.', fix: 'Each unit now links the sections of Pishro-Nik\'s free text that cover it.' },
      { what: 'Practice was borrowed', why: 'Expected value, Bayes and summary statistics from other tracks.', fix: 'Practice now covers Poisson processes (checked by simulation), gambler\'s ruin, maximum likelihood and queues.' },
      { what: 'No outside check', why: 'Self-marked.', fix: 'MIT 18.445 publishes homework with solutions on Markov chains and martingales.', url: 'https://ocw.mit.edu/courses/18-445-introduction-to-stochastic-processes-spring-2015/pages/assignments/' },
    ],
    benchmarks: [
      { id: 'ma405.mit', name: 'MIT 18.445 homework sets, against the solutions', how: 'Do sets 1–5 before reading the solutions; record your average percentage.', max: 100, url: 'https://ocw.mit.edu/courses/18-445-introduction-to-stochastic-processes-spring-2015/pages/assignments/' },
    ],
    rubrics: {
      applied: [
        crit('Preregistration', 'The model, estimands and checks written down (and timestamped, for example on OSF) before the data are opened.', 'Written after a first look.', 'Not preregistered.'),
        crit('Estimation with uncertainty', 'Parameters estimated by maximum likelihood with standard errors or intervals.', 'Point estimates only.', 'None.'),
        crit('Dependence and fit', 'Independence or the Markov property checked (autocorrelation, transition counts) and goodness of fit tested.', 'Fit shown visually only.', 'Not checked.'),
        crit('Alternatives', 'At least one alternative model compared by likelihood or held-out prediction.', 'Mentioned only.', 'None.'),
      ],
      final: examFinal('a cumulative set built from 18.445 and the book\'s solved problems', 'One inference taken from stochastic assumptions, through likelihood or posterior and diagnostics, to a calibrated claim.', 'The inference repeated by simulation from the fitted model.'),
    },
  },
};
