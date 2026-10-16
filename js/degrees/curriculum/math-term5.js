/**
 * Mathematics, Term 5 — the last Maths term, audited as Terms 0–4 were.
 *
 * Outside graders: the Feigenbaum constant as an oracle for bifurcation
 * diagrams; OSF preregistration; GAP's character tables; FEniCS as a
 * reference solver; MIT 6.046J and 18.404J exams with solutions; outside
 * readers and examiners. Evidence in docs/math-term5-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });
const examFinal = (source, linked, check) => [
  crit('Cumulative correctness', `At least 85% on a cumulative exam (${source}), marked against the official solutions.`, '60–84%.', 'Below 60%.'),
  crit('Linked solution', linked, 'Correct, with one step unjustified.', 'Disconnected computations.'),
  crit('Independent check', check, 'A check that repeats the same method.', 'No check.'),
  crit('Correction and defense', 'Every lost mark corrected, and the linked solution defended under questions.', 'Partial corrections.', 'None.'),
];
const oralFinal = (portfolio, checked) => [
  crit('Theorem coverage', portfolio, 'One required theorem missing.', 'Several missing.'),
  crit('Rigor', 'Every definition stated, every hypothesis used and named, no step left to the reader.', 'One gap.', 'Several gaps.'),
  crit('Independent check', checked, 'Attempted, not completed.', 'Not attempted.'),
  crit('Oral defense and revision', 'Questions answered from the proofs, and every weakness found is revised in writing.', 'Answered, not revised.', 'Could not defend.'),
];

export const MATH_TERM5 = {
  'dynamical-systems': {
    doc: 'docs/math-term5-audit.md',
    outcomes: [
      o('ma601.flows', 'Describe maps and flows by orbits and invariant sets.', ['QAA-MSOR 3.10'], ['ds.logistic'], [1], ['final']),
      o('ma601.stability', 'Linearise at fixed points and decide stability.', ['QAA-MSOR 3.10'], ['de.phase', 'ds.logistic'], [2], ['final']),
      o('ma601.portraits', 'Draw phase portraits and use Lyapunov functions and limit cycles.', ['QAA-MSOR 3.10'], ['de.equilibria', 'de.oscillator'], [3], ['final']),
      o('ma601.diagram', 'Build and validate a bifurcation diagram, separating real structure from numerical artefacts.', ['QAA-MSOR 3.16', 'QAA-MSOR 3.17'], ['ds.logistic', 'ds.lyapunov'], [4], ['applied']),
      o('ma601.bifurcation', 'Classify local bifurcations and reduce to normal forms.', ['QAA-MSOR 3.10'], ['ds.bifurcation'], [5], ['applied', 'final']),
      o('ma601.hamiltonian', 'Use conserved structure in Hamiltonian systems.', ['QAA-MSOR 3.10'], ['de.oscillator'], [6], ['final']),
      o('ma601.chaos', 'Recognise chaos through Lyapunov exponents and symbolic dynamics.', ['QAA-MSOR 3.10'], ['ds.lyapunov'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'The course\'s resource is too thin', why: '18.385J (Fall 2014) posts six handouts, not lecture notes for the eight units; its text (Strogatz) is not free.', fix: 'Units read Gerald Teschl\'s free Ordinary Differential Equations and Dynamical Systems by chapter, with 18.385J\'s own bifurcation handouts for Unit 5.', url: 'https://www.mat.univie.ac.at/~gerald/ftp/book-ode/ode.pdf' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers the logistic map, Lyapunov exponents and saddle-node bifurcations, alongside the phase-plane skills from Differential Equations.' },
    ],
    benchmarks: [
      { id: 'ma601.feigenbaum', name: 'Digits of the Feigenbaum constant δ ≈ 4.6692 recovered from your bifurcation diagram', how: 'Locate successive period-doubling points of the logistic map numerically and estimate δ from their spacing; record how many leading digits match.', max: 5, url: 'https://www.mat.univie.ac.at/~gerald/ftp/book-ode/ode.pdf' },
    ],
    rubrics: {
      applied: [
        crit('Diagram constructed', 'Bifurcation diagram computed with transients discarded and the parameter grid fine enough to resolve each doubling.', 'Computed, transients or resolution uncontrolled.', 'Not computed.'),
        crit('Stability estimated', 'Stability of each branch computed (|f′| along the cycle, or Floquet multipliers) and matched to the diagram.', 'Stability claimed from the picture.', 'Not estimated.'),
        crit('Numerical sensitivity', 'The diagram recomputed with different precision and step size; features that move are labelled artefacts.', 'One recomputation.', 'None.'),
        crit('Validated features', 'At least one feature (a doubling point, δ, a Lyapunov exponent) checked against a known value.', 'Compared loosely.', 'Unchecked.'),
      ],
      final: examFinal('a set built from 18.385J\'s problem sets and Teschl\'s exercises', 'One system taken from invariant structure, through local stability and bifurcation, to global behaviour and a computation.', 'A numerical simulation that confirms each analytic claim.'),
    },
  },

  'advanced-probability-and-statistics': {
    doc: 'docs/math-term5-audit.md',
    outcomes: [
      o('ma602.spaces', 'Construct probability spaces and integrate with respect to them.', ['QAA-MSOR 3.8', 'QAA-MSOR 3.10'], ['meas.simple'], [1], ['final']),
      o('ma602.martingales', 'Use conditional expectation and martingales.', ['QAA-MSOR 3.11'], ['stoch.ruin'], [2], ['final']),
      o('ma602.convergence', 'Distinguish almost-sure, in-probability and in-distribution convergence.', ['QAA-MSOR 3.11'], ['pr.clt'], [3], ['final']),
      o('ma602.robust', 'Run a preregistered simulation study comparing classical and robust procedures.', ['QAA-MSOR 3.11', 'QAA-MSOR 3.17'], ['st.ci', 'st.permtest'], [4], ['applied']),
      o('ma602.limits', 'Prove and apply laws of large numbers and central limit theorems.', ['QAA-MSOR 3.11'], ['pr.clt'], [5], ['final']),
      o('ma602.likelihood', 'Derive asymptotics of likelihood estimators and the information bound.', ['QAA-MSOR 3.11'], ['adv.fisher', 'stoch.mle'], [6], ['applied', 'final']),
      o('ma602.models', 'Fit regression and resampling procedures and diagnose them.', ['QAA-MSOR 3.11'], ['linreg', 'adv.posterior'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'The course\'s resource covers statistics only', why: '18.655 (Spring 2016) is mathematical statistics; Units 1–3 and 5 (measure-theoretic probability, martingales, convergence) need a probability course.', fix: 'Those units read MIT 18.175 Theory of Probability (Spring 2014).', url: `${OCW}/18-175-theory-of-probability-spring-2014/pages/lecture-slides/` },
      { what: 'Practice was borrowed', why: 'Summary statistics, expected value and Bayes from other tracks.', fix: 'Practice now covers Fisher information and the Cramér–Rao bound, conjugate posteriors and maximum likelihood.' },
    ],
    benchmarks: [
      { id: 'ma602.prereg', name: 'Simulation study preregistered on OSF before it was run', how: 'Record 1 when the registration\'s timestamp precedes the first simulation output.', max: 1, url: 'https://osf.io/prereg/' },
    ],
    rubrics: {
      applied: [
        crit('Preregistration', 'Procedures, contamination scenarios and success criteria registered before any results were seen.', 'Registered after a pilot run.', 'Not registered.'),
        crit('Simulation design', 'Enough replications for the Monte Carlo error to be reported and small; seeds fixed; scenarios cover the claimed range.', 'Monte Carlo error not reported.', 'Too few runs to conclude.'),
        crit('Classical versus robust', 'Bias, variance and coverage compared for each procedure under each contamination level.', 'One criterion compared.', 'No comparison.'),
        crit('Claims within evidence', 'Conclusions limited to the scenarios simulated, with failures reported.', 'Mild overgeneralisation.', 'Unsupported claims.'),
      ],
      final: oralFinal('From the probability construction and a convergence theorem, through an estimator\'s asymptotics, to computation and diagnostics.', 'The estimator\'s asymptotic claims checked by simulation.'),
    },
  },

  'mathematics-society-and-responsible-modeling': {
    doc: 'docs/math-term5-audit.md',
    outcomes: [
      o('ma603.values', 'Expose the value choices built into a mathematical model.', ['QAA-MSOR 3.13', 'QAA-MSOR 3.26'], [], [1], ['applied', 'final']),
      o('ma603.measurement', 'Judge measurement, proxies and construct validity.', ['QAA-MSOR 3.13'], ['st.simpson'], [2], ['applied']),
      o('ma603.privacy', 'Quantify privacy risk and govern data use.', ['QAA-MSOR 3.26'], ['eth.kanon', 'eth.dp'], [3], ['final']),
      o('ma603.audit', 'Audit a public model or score and gather stakeholder responses.', ['QAA-MSOR 3.19', 'QAA-MSOR 3.26'], ['eth.fairness'], [4], ['applied']),
      o('ma603.fairness', 'State fairness definitions and prove when they cannot all hold.', ['QAA-MSOR 3.14'], ['eth.fairness', 'eth.baserate'], [5], ['applied', 'final']),
      o('ma603.causal', 'Separate causal from predictive claims and spot feedback loops and shift.', ['QAA-MSOR 3.11', 'QAA-MSOR 3.13'], ['st.ipw', 'st.adjust'], [6], ['final']),
      o('ma603.duty', 'Design transparency, contestability and redress, and state professional duties.', ['QAA-MSOR 3.26'], [], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'The resource is a discussion page', why: 'The catalogue links the Cambridge society\'s 2021 discussion schedule, not the lectures it discusses.', fix: 'Units now link the eight lectures themselves (Chiodo, Ethics for the Working Mathematician) and, where they do not reach, the standard papers on measurement, auditing, impossibility results and feedback loops.', url: 'https://ethics-in-mathematics.com/course/lectures' },
      { what: 'No practice', why: 'Nothing to compute.', fix: 'Practice now computes fairness metrics, the base-rate trade-off, k-anonymity, differential privacy, Simpson\'s paradox and adjustment.' },
    ],
    benchmarks: [
      { id: 'ma603.response', name: 'A substantive response from the audited system\'s owner', how: 'Send the audit to the organisation that runs the model; record 1 if they respond in substance.', max: 1, url: 'https://arxiv.org/abs/2001.00973' },
    ],
    rubrics: {
      applied: [
        crit('Mathematics reconstructed', 'The model or score rebuilt from its public documentation, with every formula and threshold accounted for.', 'Rebuilt in outline.', 'Not reconstructed.'),
        crit('Affected groups and harms', 'Who the model affects identified, with error rates or impacts measured by group where data allow.', 'Groups named, impacts not measured.', 'Not identified.'),
        crit('Construct validity', 'Each proxy checked against what it is meant to measure, with failures documented.', 'Proxies listed without checks.', 'Not considered.'),
        crit('Stakeholder response', 'Findings shared with affected people or the owner, and their response recorded and answered.', 'Shared, no response recorded.', 'Not shared.'),
      ],
      final: [
        crit('Purpose and values', 'The model\'s purpose and the values its design encodes stated plainly.', 'Purpose stated, values implicit.', 'Neither.'),
        crit('Data rights and formal metrics', 'Data rights, privacy guarantees and fairness metrics stated precisely, with the trade-offs proved or computed.', 'Metrics without trade-offs.', 'Informal only.'),
        crit('Contestability and redress', 'A concrete route for affected people to challenge outputs, with who acts and when.', 'Proposed in principle.', 'None.'),
        crit('Public defense', 'Questions from a lay audience answered without jargon, with revisions recorded.', 'Answered with jargon.', 'Could not answer.'),
      ],
    },
  },

  'senior-research-thesis': {
    doc: 'docs/math-term5-audit.md',
    outcomes: [
      o('ma604.question', 'Pose a precise research question with scope, supervision and an ethics plan.', ['QAA-MSOR 3.14', 'QAA-MSOR 3.26'], [], [1], ['applied']),
      o('ma604.literature', 'Map the literature, definitions and dependencies.', ['QAA-MSOR 3.26'], [], [2], ['applied']),
      o('ma604.method', 'Design a proof strategy, model or computational protocol.', ['QAA-MSOR 3.14', 'QAA-MSOR 3.19'], [], [3], ['applied']),
      o('ma604.proposal', 'Defend a proposal, revising for feasibility and risk.', ['QAA-MSOR 3.26'], ['tw.voice'], [4], ['applied']),
      o('ma604.results', 'Report results, counterexamples and negative findings honestly.', ['QAA-MSOR 3.13', 'QAA-MSOR 3.14'], ['st.effect'], [5], ['final']),
      o('ma604.thesis', 'Write a reproducible thesis with figures and citation.', ['QAA-MSOR 3.17', 'QAA-MSOR 3.26'], ['tw.lists', 'tw.alttext'], [6], ['final']),
      o('ma604.defend', 'Survive peer review and a public oral examination.', ['QAA-MSOR 3.26'], [], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 21W.794 front page.', fix: 'Units now link the 21W.794 sessions on framing, sources and revision, 18.821\'s pages on mathematical work and reporting, and Tao\'s advice on writing papers.' },
      { what: 'No outside examiner', why: 'The thesis was judged inside the course.', fix: 'Archive the thesis on arXiv (moderated) and have an examiner from outside sign off on it.', url: 'https://arxiv.org/archive/math' },
    ],
    benchmarks: [
      { id: 'ma604.arxiv', name: 'Thesis accepted by arXiv moderation', how: 'Record 1 when arXiv lists the thesis.', max: 1, url: 'https://arxiv.org/archive/math' },
      { id: 'ma604.examiner', name: 'An examiner outside the programme signed off on the thesis', how: 'Record 1 when an outside mathematician confirms the central result is correct.', max: 1, url: 'https://terrytao.wordpress.com/advice-on-writing-papers/' },
    ],
    rubrics: {
      applied: [
        crit('Precise question', 'A question narrow enough to answer in the time, with what would count as an answer stated.', 'Question broad but bounded.', 'Vague.'),
        crit('Literature and dependencies', 'Prior work mapped to primary sources, with the definitions and results the thesis depends on listed.', 'Map without dependencies.', 'No map.'),
        crit('Methods and verification plan', 'The proof strategy, model or computation chosen with alternatives, and how each result will be checked.', 'Method without verification plan.', 'No method.'),
        crit('Feasibility and ethics', 'Milestones, risks with fallbacks, supervision and any data-ethics needs addressed.', 'Milestones only.', 'None.'),
      ],
      final: [
        crit('Central contribution', 'The contribution stated precisely and supported by complete proof or evidence.', 'Supported with one gap.', 'Unsupported.'),
        crit('Reproducibility and provenance', 'Every computation reruns from the archive; every source cited to its origin.', 'Mostly reproducible.', 'Not reproducible.'),
        crit('Limitations and failures', 'Failed approaches and limitations reported, not hidden.', 'Mentioned briefly.', 'Hidden.'),
        crit('Oral examination', 'Questions on the contribution, its dependencies and its novelty answered accurately.', 'Most answered.', 'Could not answer.'),
      ],
    },
  },

  'algebraic-geometry-and-representation-theory': {
    doc: 'docs/math-term5-audit.md',
    outcomes: [
      o('ma611.affine', 'Work with affine varieties, ideals and coordinate rings.', ['QAA-MSOR 3.10'], ['ag.monomials'], [1], ['final']),
      o('ma611.nullstellensatz', 'Use the Nullstellensatz to pass between algebra and geometry.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.14'], ['alg2.irred'], [2], ['final']),
      o('ma611.projective', 'Work in projective space and count intersections.', ['QAA-MSOR 3.10'], ['ag.bezout'], [3], ['final']),
      o('ma611.compute', 'Compute equations, singularities or character data symbolically and prove the pattern.', ['QAA-MSOR 3.17'], ['rep.dims', 'ag.bezout'], [4], ['applied']),
      o('ma611.singular', 'Compute dimension and tangent spaces and find singular points.', ['QAA-MSOR 3.10'], ['mv.gradient'], [5], ['applied', 'final']),
      o('ma611.reps', 'Decompose representations and prove complete reducibility.', ['QAA-MSOR 3.10'], ['rep.classes', 'rep.dims'], [6], ['final']),
      o('ma611.characters', 'Use characters and their orthogonality.', ['QAA-MSOR 3.10'], ['rep.dims', 'alg.dihedral'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'The resource is the wrong level', why: 'The catalogue\'s resource is MIT 18.735 (Fall 2009), a research seminar on double affine Hecke algebras — far beyond an undergraduate course.', fix: 'Units now read Milne\'s free Algebraic Geometry notes and Etingof et al.\'s free Introduction to Representation Theory.', url: 'https://www.jmilne.org/math/CourseNotes/AG.pdf' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers spaces of polynomials, real intersection counts, conjugacy classes and dimensions of irreducible representations.' },
    ],
    benchmarks: [
      { id: 'ma611.gap', name: 'Character tables you computed by hand that match GAP', how: 'Compute character tables for small groups (S₃, D₄, Q₈, A₄, S₄, …) by hand; count those matching GAP\'s CharacterTable library.', max: 10, url: 'https://www.gap-system.org/' },
      { id: 'ma611.milne', name: 'Milne\'s exercises with published solutions', how: 'Solve before reading the solutions; record the percentage right.', max: 100, url: 'https://www.jmilne.org/math/CourseNotes/AG.pdf#page=222' },
    ],
    rubrics: {
      applied: [
        crit('Computation', 'Equations, singular points or character tables computed for the family with a CAS (Macaulay2, Sage, GAP), with code kept.', 'Partial computation.', 'None.'),
        crit('Symbolic verification', 'Each example verified independently (by hand or a second system).', 'Some examples verified.', 'Unverified.'),
        crit('Proof of the pattern', 'The pattern seen in the examples proved for the whole family.', 'Proved for the computed cases.', 'Computation presented as proof.'),
        crit('Error log', 'Every disagreement traced to its cause.', 'Noted, not traced.', 'Not logged.'),
      ],
      final: oralFinal('Coordinate rings and varieties, projective or singular structure, representations, characters, and one link between geometry and symmetry.', 'Every character table or geometric invariant in the dossier checked by GAP, Macaulay2 or Sage.'),
    },
  },

  'calculus-of-variations-and-continuum-models': {
    doc: 'docs/math-term5-audit.md',
    outcomes: [
      o('ma612.el', 'Derive Euler–Lagrange equations from the first variation.', ['QAA-MSOR 3.10'], ['cv.euler'], [1], ['final']),
      o('ma612.constraints', 'Handle constraints with multipliers and natural boundary conditions.', ['QAA-MSOR 3.10'], ['mv.lagrange'], [2], ['applied', 'final']),
      o('ma612.existence', 'Argue existence of minimisers and recognise when they fail to exist.', ['QAA-MSOR 3.14'], ['ra.sup'], [3], ['final']),
      o('ma612.simulate', 'Simulate an energy-minimising continuum model and check that energy decreases.', ['QAA-MSOR 3.16', 'QAA-MSOR 3.18'], ['cv.euler', 'pde.heat'], [4], ['applied']),
      o('ma612.noether', 'Derive conservation laws from symmetries.', ['QAA-MSOR 3.10'], ['de.oscillator'], [5], ['final']),
      o('ma612.continuum', 'Build elasticity and fluid models from constitutive assumptions.', ['QAA-MSOR 3.18', 'QAA-MSOR 3.19'], ['mod.pi'], [6], ['final']),
      o('ma612.fem', 'Discretise with finite elements and reason about stability and convergence.', ['QAA-MSOR 3.16'], ['cm.kmatrix', 'na.order'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'The resource covers models, not the calculus of variations', why: '18.354J (Spring 2015) has one chapter on variational calculus; Units 1–3 need more.', fix: 'Units 1–3 read Peter Olver\'s free notes, The Calculus of Variations; 18.354J stays for the continuum units and 18.085 for finite elements.', url: 'https://www-users.cse.umn.edu/~olver/ln_/cv.pdf' },
      { what: 'Direct methods have no free source here', why: 'Unit 3 asks for coercivity and weak lower semicontinuity; Olver covers the second variation and an example where minimisers fail, not the direct method.', fix: 'Read Olver §5 and his cautionary example, and treat the direct method from any functional-analysis text you can access; the rubric asks for an existence argument either way.' },
    ],
    benchmarks: [
      { id: 'ma612.fenics', name: 'Your membrane or elasticity solver agrees with FEniCS', how: 'Solve the same problem in FEniCS; record 1 when the solutions agree to the discretisation error.', max: 1, url: 'https://fenicsproject.org/' },
    ],
    rubrics: {
      applied: [
        crit('Variational derivation', 'Energy functional stated with its assumptions, and the Euler–Lagrange equation and boundary conditions derived from it.', 'Equation stated without derivation.', 'Wrong equation.'),
        crit('Approximation', 'A discrete minimiser (finite differences or elements) computed, with convergence under refinement shown.', 'Computed on one grid.', 'Not computed.'),
        crit('Energy and boundary checks', 'Energy decreases along the iteration and boundary conditions hold to the discretisation error.', 'One of the two checked.', 'Neither.'),
        crit('Model limits', 'Where the constitutive assumptions break (large strain, turbulence) stated.', 'Mentioned only.', 'Not addressed.'),
      ],
      final: oralFinal('A continuum model from constitutive and variational assumptions, through Euler–Lagrange or weak form and an existence argument, to a convergent discretisation.', 'The discretisation compared with FEniCS or an exact solution.'),
    },
  },

  'algorithms-complexity-and-coding': {
    doc: 'docs/math-term5-audit.md',
    outcomes: [
      o('ma613.paradigms', 'Design algorithms with invariants and prove lower bounds.', ['QAA-MSOR 3.14', 'QAA-MSOR 3.17'], ['dm.invariant', 'bigo'], [1], ['final']),
      o('ma613.random', 'Analyse randomised algorithms with concentration bounds.', ['QAA-MSOR 3.11'], ['expect', 'pr.indicator'], [2], ['final']),
      o('ma613.reductions', 'Reduce between problems and place them in complexity classes.', ['QAA-MSOR 3.14'], ['alg.sat', 'tc.decide'], [3], ['applied', 'final']),
      o('ma613.implement', 'Implement a linear code and decoder and measure it against proved bounds.', ['QAA-MSOR 3.17'], ['code.hamming', 'alg2.gf'], [4], ['applied']),
      o('ma613.approx', 'Prove NP-completeness and analyse approximation algorithms.', ['QAA-MSOR 3.14'], ['alg.vc', 'co.tsp'], [5], ['final']),
      o('ma613.information', 'Use entropy and channel capacity to bound what codes can do.', ['QAA-MSOR 3.10'], ['entropy', 'code.bounds'], [6], ['applied', 'final']),
      o('ma613.codes', 'Construct and decode linear and algebraic codes.', ['QAA-MSOR 3.10'], ['code.hamming', 'code.bounds'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'The resource covers only coding', why: '6.895 (Fall 2004) is a coding-theory course; Units 1–3 and 5 need algorithms and complexity.', fix: 'Those units read MIT 6.046J (Spring 2015) and 18.404J (Fall 2020) lectures.' },
      { what: 'Practice was algorithmic only', why: 'Big-O, operation counts, entropy and string hashing.', fix: 'Practice now adds Hamming decoding, the Hamming bound, finite fields, SAT and vertex-cover approximation.' },
    ],
    benchmarks: [
      { id: 'ma613.alg', name: 'MIT 6.046J (Spring 2015) final exam, against the solutions', how: 'Three hours, closed-book; record your percentage.', max: 100, url: `${OCW}/6-046j-design-and-analysis-of-algorithms-spring-2015/pages/exams/` },
      { id: 'ma613.complexity', name: 'MIT 18.404J (Fall 2020) final exam, against the solutions', how: 'Record your percentage.', max: 100, url: `${OCW}/18-404j-theory-of-computation-fall-2020/pages/exams/` },
    ],
    rubrics: {
      applied: [
        crit('Code and decoder correct', 'Encoder and decoder correct on every error pattern up to the design distance (checked exhaustively for small codes).', 'Correct on random patterns only.', 'Incorrect.'),
        crit('Measured against bounds', 'Error rates measured across noise levels and compared with the proved distance and the Hamming and Singleton bounds.', 'Measured without bounds.', 'Not measured.'),
        crit('Formal reduction', 'A polynomial reduction proved correct in both directions, with its running time.', 'One direction proved.', 'No reduction.'),
        crit('Error log', 'Every bug and its fix recorded.', 'A log without fixes.', 'No log.'),
      ],
      final: oralFinal('Algorithm correctness and analysis, a reduction, a tractability limit, an information bound, and a code meeting its distance — connected.', 'The dossier\'s code and decoder tested exhaustively on small parameters.'),
    },
  },
};
