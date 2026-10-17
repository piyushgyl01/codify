/**
 * Mechanical Engineering, Term 1 — audited as Term 0 was (see me-term0.js).
 *
 * Outcomes map to ABET's seven student outcomes and the NCEES FE Mechanical
 * specification ("FE-ME n.X"). Outside graders: 18.02SC, 18.06SC, 18.03SC,
 * 8.02X and 2.008 exams with solutions; Engineering Statics' checked
 * exercises. Evidence in docs/me-term1-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });

/** The applied assessment: the artifact, an independent check, the assumptions, and the corrections. */
const applied = (artifact, check, record) => [
  crit('Engineering artifact', artifact, 'Mostly complete; one requirement missed.', 'Missing or unusable.'),
  crit('Independent check', check, 'Checked loosely, or disagreements left unexplained.', 'Not checked.'),
  crit('Assumptions and uncertainty', record, 'Assumptions listed but not tested or quantified.', 'None stated.'),
  crit('Error log and corrections', 'Every error found is logged, and each weakness corrected and re-checked.', 'Log kept, corrections partial.', 'No log.'),
];
/** A final exam with a defended model. */
const finalExam = (source, defend, limits) => [
  crit('Cumulative correctness', `At least 85% on ${source}, marked against the solutions.`, '60–84%.', 'Below 60%.'),
  crit('Model defended', defend, 'Defended with gaps.', 'Not defended.'),
  crit('Limits and safety', limits, 'Units checked only.', 'Not addressed.'),
  crit('Correction', 'Every lost mark corrected, with the reason it was lost and the objective it maps to.', 'Some corrected.', 'None.'),
];
/** A final presentation or portfolio. */
const finalShow = (pkg, trace, defence) => [
  crit('Complete package', pkg, 'One element missing or weak.', 'Incomplete.'),
  crit('Traceability', trace, 'Partly traced.', 'Not traced.'),
  crit('Verification, limits and safety', 'Verification evidence shown, validity limits stated, and hazards listed with their controls.', 'Some evidence; limits or hazards thin.', 'None.'),
  crit('Defence', defence, 'Partly answered.', 'Not answered.'),
];

export const ME_TERM1 = {
  'multivariable-calculus-vector-analysis': {
    doc: 'docs/me-term1-audit.md',
    outcomes: [
      o('memath201.vectors', 'Describe geometry and forces with vectors, products and coordinate systems.', ['FE-ME 1.A', 'FE-ME 1.D'], ['dot', 'cross', 'm.proj'], [1], ['final']),
      o('memath201.motion', 'Describe motion along a curve: velocity, acceleration and curvature.', ['FE-ME 1.B', 'FE-ME 7.A'], ['dg.curvature'], [2], ['final']),
      o('memath201.gradient', 'Linearise functions of several variables with partial derivatives and gradients.', ['FE-ME 1.B'], ['mv.gradient'], [3], ['final']),
      o('memath201.optimize', 'Optimise an engineering design under constraints.', ['FE-ME 1.B', 'ABET 1'], ['mv.lagrange'], [4], ['applied']),
      o('memath201.mass', 'Compute mass, centroids and moments of inertia with multiple integrals.', ['FE-ME 1.B', 'FE-ME 6.E'], ['mv.double', 'des.centroid', 'sta.inertia'], [5], ['applied']),
      o('memath201.line', 'Compute work and circulation with line integrals, and recognise conservative fields.', ['FE-ME 1.B', 'FE-ME 1.D'], ['mv.line'], [6], ['final']),
      o('memath201.theorems', 'Relate circulation and flux through Green\'s, Stokes\' and the divergence theorems.', ['FE-ME 1.D'], ['mv.divcurl'], [7], ['final']),
      o('memath201.defend', 'Defend a flux or circulation model in differential and integral form, with unit checks.', ['ABET 1', 'ABET 3'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at the whole of 18.02SC.', fix: 'Each unit now links the 18.02SC sessions that teach it.' },
      { what: 'One borrowed skill', why: 'Practice was a single gradient question.', fix: 'Practice now covers vectors, curvature, gradients, Lagrange multipliers, multiple integrals for mass properties, line integrals, and divergence and curl.' },
    ],
    benchmarks: [
      { id: 'memath201.exam2', name: 'MIT 18.02SC Exam 2 (partial derivatives), against the solutions', how: 'Sit it closed-notes; record your percentage.', max: 100, url: `${OCW}/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/exam-2/practice-exam/` },
      { id: 'memath201.exam4', name: 'MIT 18.02SC Exam 4 (triple and surface integrals), against the solutions', how: 'Sit it closed-notes; record your percentage.', max: 100, url: `${OCW}/18-02sc-multivariable-calculus-fall-2010/pages/4.-triple-integrals-and-surface-integrals-in-3-space/exam-4/practice-exam/` },
    ],
    rubrics: {
      applied: applied('A geometry optimised under constraints, with its mass, centroid and sensitivity.', 'Mass and centroid checked by numerical integration against the analytic result, and the optimum confirmed by a numerical search.', 'Which constraints are active stated, with the optimum\'s sensitivity to each parameter.'),
      final: finalExam('the cumulative exam (the 18.02SC Exam 4 practice exam will do)', 'A flux or circulation model defended in both differential and integral form.', 'Units checked in both forms, and orientation and sign conventions stated.'),
    },
  },

  'linear-algebra-differential-equations-numerical-methods': {
    doc: 'docs/me-term1-audit.md',
    outcomes: [
      o('memath202.solve', 'Solve linear systems by elimination, find rank, and judge conditioning.', ['FE-ME 1.D', 'FE-ME 1.E'], ['la.solve', 'la.rank', 'na.cond'], [1], ['final']),
      o('memath202.leastsq', 'Use bases, projections and least squares.', ['FE-ME 1.D', 'FE-ME 2.D'], ['la.ls', 'm.proj'], [2], ['final']),
      o('memath202.modes', 'Find eigenvalues and modes, and use matrix exponentials.', ['FE-ME 1.D', 'FE-ME 7.K'], ['la.eig2', 'pw.modes'], [3], ['applied', 'final']),
      o('memath202.solver', 'Implement numerical ODE solvers and validate them against analytic solutions.', ['FE-ME 1.E', 'ABET 6'], ['de.euler', 'na.order', 'cp.euler'], [4], ['applied']),
      o('memath202.phase', 'Classify first-order systems with phase portraits and stability.', ['FE-ME 1.C'], ['de.phase', 'de.equilibria'], [5], ['final']),
      o('memath202.second', 'Analyse second-order systems: damping, frequency response and resonance.', ['FE-ME 1.C', 'FE-ME 7.K'], ['de.oscillator', 'pm.oscillator'], [6], ['applied', 'final']),
      o('memath202.laplace', 'Solve initial-value problems with Laplace transforms, and choose stable discretisations.', ['FE-ME 1.C', 'FE-ME 1.E'], ['de.laplace', 'pde.cfl'], [7], ['final']),
      o('memath202.defend', 'Defend a coupled-system model against analytic checks, numerical evidence and perturbed parameters.', ['ABET 1', 'ABET 6'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at the whole of 18.03SC.', fix: 'Each unit now links the 18.03SC or 18.06SC sessions that teach it.' },
      { what: '18.03SC has no linear algebra', why: 'Units 1–2 (elimination, rank, least squares) are not in a differential-equations course.', fix: 'Those units read MIT 18.06SC.' },
      { what: 'No conditioning or numerical stability', why: 'Neither course teaches conditioning (Unit 1) or why discretisations go unstable (Unit 7).', fix: 'MIT 18.330 Chapter 5 covers ODE methods and stability; practice adds condition numbers, Euler\'s energy drift and the CFL limit.', url: `${OCW}/18-330-introduction-to-numerical-analysis-spring-2012/resources/mit18_330s12_chapter5/` },
      { what: 'Practice was borrowed', why: 'The course used the core track\'s matrix-product and eigenvalue questions.', fix: 'Practice now covers elimination, rank, conditioning, least squares, modes, solver order and stability, phase portraits, oscillators and Laplace transforms.' },
    ],
    benchmarks: [
      { id: 'memath202.la', name: 'MIT 18.06SC Exam 1, against the solutions', how: 'Sit it closed-notes; record your percentage.', max: 100, url: `${OCW}/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/exam-1/` },
      { id: 'memath202.final', name: 'MIT 18.03SC final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/18-03sc-differential-equations-fall-2011/pages/final-exam/` },
    ],
    rubrics: {
      applied: applied('A coupled mass or thermal system modelled, with two numerical solvers implemented.', 'Both solvers checked against the eigenvalue solution, and their order of convergence measured by halving the step.', 'Each solver\'s stability limit found and explained, and energy or heat conservation tracked.'),
      final: finalExam('the cumulative exam (the 18.03SC final will do)', 'An eigenvalue/ODE model defended against an analytic check, numerical evidence and perturbed parameters.', 'Units, time scales and the model\'s range of validity stated.'),
    },
  },

  'university-physics-2-electricity-magnetism-circuits': {
    doc: 'docs/me-term1-audit.md',
    outcomes: [
      o('mephys201.fields', 'Compute electric forces and fields of charge distributions.', ['FE-ME 5.A'], ['pe.coulomb', 'pe.gauss'], [1], ['final']),
      o('mephys201.potential', 'Use potential, field energy and capacitance.', ['FE-ME 5.A'], ['pe.laplace'], [2], ['final']),
      o('mephys201.circuits', 'Model DC circuits with Ohm\'s and Kirchhoff\'s laws.', ['FE-ME 5.B'], ['ckt.req', 'ckt.nodal'], [3], ['final']),
      o('mephys201.rc', 'Measure an RC transient safely, fit its time constant, and account for the energy.', ['FE-ME 5.C', 'ABET 6'], ['pe.rc', 'lab.fit'], [4], ['applied']),
      o('mephys201.magnetic', 'Find magnetic forces, torques and fields.', ['FE-ME 5.A'], ['pe.wire', 'pe.cyclotron'], [5], ['final']),
      o('mephys201.induction', 'Use induction, inductance and transient energy.', ['FE-ME 5.A', 'FE-ME 5.C'], ['pe.faraday', 'ckt.rl'], [6], ['final']),
      o('mephys201.maxwell', 'Connect the laws through Maxwell\'s equations and the waves they predict.', ['FE-ME 5.A'], ['pe.rlc', 'pw.polar'], [7], ['final']),
      o('mephys201.actuator', 'Defend the field-to-force-to-motion chain in a motor, solenoid or magnetic sensor.', ['FE-ME 5.D', 'ABET 1'], ['pwr.dcmotor'], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued 8.02 only points to edX', why: 'The 2019 OCW page has no notes of its own.', fix: 'Units read the 2007 8.02 course notes by chapter, with *Lessons in Electric Circuits* for the RC measurement.' },
      { what: 'Practice was borrowed', why: 'The course drew on the Robotics track\'s Ohm\'s-law and divider questions.', fix: 'Practice now uses the Physics and EE degrees\' field, circuit and motor skills, each checked independently.' },
    ],
    benchmarks: [
      { id: 'mephys201.exams', name: 'MIT 8.02X exams, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/8-02x-physics-ii-electricity-magnetism-with-an-experimental-focus-spring-2005/pages/exams/` },
    ],
    rubrics: {
      applied: applied('An RC transient measured or simulated, with its time constant fitted.', 'The fitted time constant checked against R·C from component values and tolerances, and the residuals examined.', 'Stored and dissipated energy accounted for, with measurement uncertainty and the safe-voltage limit stated.'),
      final: finalExam('the cumulative exam (an 8.02X exam will do)', 'The field-to-force-to-motion chain of a motor, solenoid or magnetic sensor defended from first principles to measured behaviour.', 'Units and limiting cases checked, and electrical hazards stated.'),
    },
  },

  'statics-structural-equilibrium': {
    doc: 'docs/me-term1-audit.md',
    outcomes: [
      o('mestat201.resultants', 'Reduce force systems to resultants, moments and couples.', ['FE-ME 6.A', 'FE-ME 6.B'], ['sta.resultant'], [1], ['final']),
      o('mestat201.equilibrium', 'Draw free-body diagrams and solve rigid-body equilibrium.', ['FE-ME 6.C'], ['sta.beam', 'sta.bracket'], [2], ['applied', 'final']),
      o('mestat201.distributed', 'Replace distributed loads by their resultants, and locate centroids.', ['FE-ME 6.E'], ['sta.distload', 'des.centroid'], [3], ['final']),
      o('mestat201.truss', 'Analyse determinate trusses by joints and by sections, checking one against the other.', ['FE-ME 6.D'], ['sta.truss'], [4], ['applied']),
      o('mestat201.frames', 'Analyse frames and machines, and find internal forces.', ['FE-ME 6.D', 'FE-ME 8.A'], ['sta.bracket', 'sta.beam'], [5], ['final']),
      o('mestat201.friction', 'Model friction in contacts, belts, screws and wedges.', ['FE-ME 6.F', 'FE-ME 14.G'], ['sta.friction', 'pm.incline'], [6], ['final']),
      o('mestat201.inertia', 'Compute area and mass moments of inertia of composite shapes.', ['FE-ME 6.E'], ['sta.inertia', 'pm.rolling'], [7], ['final']),
      o('mestat201.idealize', 'Idealise an unfamiliar structure, and defend its load path, reactions and stability.', ['ABET 1', 'ABET 2'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at the whole of *Engineering Statics: Open and Interactive*.', fix: 'Each unit now links the book\'s section that teaches it.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Practice now covers resultants, beam and bracket equilibrium, distributed loads, centroids, trusses, friction and second moments of area, each checked independently.' },
      { what: 'The scale-model test needs a rig', why: 'The applied problem set asks for a tested model, which the app cannot run.', fix: 'Build a model from card or balsa, or use a frame-analysis program as the second method; record which.' },
    ],
    benchmarks: [
      { id: 'mestat201.trusses', name: 'Engineering Statics Chapter 6 exercises (trusses, frames, machines), checked by the book', how: 'Work them without hints; record the percentage the book\'s answer check accepts.', max: 100, url: 'https://engineeringstatics.org/Chapter_06-10.html' },
      { id: 'mestat201.friction', name: 'Engineering Statics Chapter 9 exercises (friction), checked by the book', how: 'Work them without hints; record the percentage the book\'s answer check accepts.', max: 100, url: 'https://engineeringstatics.org/Chapter_09-10.html' },
    ],
    rubrics: {
      applied: applied('A determinate truss analysed by joints and by sections, and a scale or simulated model tested.', 'The two hand methods agree with each other and with a matrix or frame-solver result, and measured member forces or deflections are compared.', 'Idealisations (pinned joints, loads at joints, self-weight) stated, with each discrepancy traced to one.'),
      final: finalExam('the cumulative statics exam (the book\'s end-of-chapter exercises will do)', 'An unfamiliar structure\'s idealisation, load path, reactions and stability defended.', 'Determinacy and stability checked before solving, with units and signs consistent.'),
    },
  },

  'materials-manufacturing-metrology': {
    doc: 'docs/me-term1-audit.md',
    outcomes: [
      o('memfg201.properties', 'Read stress–strain curves, hardness and toughness, in engineering and true terms.', ['FE-ME 9.A', 'FE-ME 9.B'], ['mfg.tensile', 'mfg.hardness'], [1], ['final']),
      o('memfg201.heattreat', 'Relate microstructure and heat treatment to properties, using transformation kinetics.', ['FE-ME 9.C', 'FE-ME 9.G'], ['mfg.avrami', 'mat.lever'], [2], ['final']),
      o('memfg201.routes', 'Size casting, forming, joining and powder routes from their governing physics.', ['FE-ME 9.F'], ['mfg.chvorinov', 'mfg.flow'], [3], ['applied', 'final']),
      o('memfg201.select', 'Select a process and plan for manufacturability and cost.', ['FE-ME 9.F', 'FE-ME 4.C', 'FE-ME 14.J'], ['econ.breakeven'], [4], ['applied']),
      o('memfg201.machining', 'Plan machining from cutting mechanics, power and tool wear.', ['FE-ME 9.F'], ['mfg.turning', 'mfg.taylor'], [5], ['applied']),
      o('memfg201.polymers', 'Process polymers and composites, and judge where additive manufacturing fits.', ['FE-ME 9.E', 'FE-ME 9.F'], ['mfg.cooling', 'mat.composite'], [6], ['final']),
      o('memfg201.metrology', 'Specify fits and tolerances, and measure with known uncertainty.', ['FE-ME 14.J', 'FE-ME 13.D'], ['des.fit', 'des.stack', 'lab.propagate'], [7], ['applied']),
      o('memfg201.quality', 'Defend a material–process–inspection route with capability evidence.', ['FE-ME 14.K', 'ABET 2'], ['mfg.cpk'], [8], ['final']),
    ],
    gaps: [
      { what: '3.044 covers only the heat and fluid flow of processing', why: 'It has no mechanical testing, heat treatment of steel, machining, polymer processing or metrology (Units 1–2 and 4–8).', fix: 'Those units read DoITPoMS\'s testing and Jominy packages and MIT 2.008 (2025) lectures; 3.044 stays for casting and powder.' },
      { what: 'Practice had no checks', why: 'The course borrowed the Robotics track\'s materials, orientation and tolerance questions.', fix: 'Nine new manufacturing skills (true stress, flow stress and forming work, Brinell hardness, Chvorinov\'s rule, tool life, turning, process capability, mould cooling, Avrami kinetics), each checked independently.' },
      { what: 'Measurement needs instruments', why: 'Metrology (Unit 7) and the inspection plan need real gauges.', fix: 'Use callipers and a micrometer on a real part and log repeated readings; the NIST e-Handbook explains gauge studies.', url: 'https://www.itl.nist.gov/div898/handbook/mpc/section4/mpc4.htm' },
    ],
    benchmarks: [
      { id: 'memfg201.quiz1', name: 'MIT 2.008 (2025) Quiz 1 practice exam, against the solutions', how: 'Sit it under time; record your percentage.', max: 100, url: `${OCW}/2-008-design-and-manufacturing-ii-spring-2025/resources/mit2_008_s25_quiz1_prac24_sol_pdf/` },
      { id: 'memfg201.quiz2', name: 'MIT 2.008 (2025) Quiz 2 practice exam, against the solutions', how: 'Sit it under time; record your percentage.', max: 100, url: `${OCW}/2-008-design-and-manufacturing-ii-spring-2025/resources/mit2_008_s25_quiz2_prac24_soln_pdf/` },
    ],
    rubrics: {
      applied: applied('A material and manufacturing chain chosen for a toleranced part, with capability and cost estimated and an inspection plan.', 'Cost and capability checked a second way (another process route or a published cost model), and the tolerance stack checked by worst case and RSS.', 'Process limits, assumed variation and supplier data recorded with their sources.'),
      final: finalShow('A complete material–process–quality route: drawings, process limits, measurement evidence, hazards and life-cycle trade-offs.', 'Every critical dimension traced to the process that makes it and the gauge that checks it.', 'The route defended under questions, including why the rejected processes lost.'),
    },
  },
};
