/**
 * Mechanical Engineering, Term 0 — audited as Electrical Engineering was.
 *
 * Each ME course has eight units and two assessments: an applied problem set,
 * lab or project, and a final exam, presentation or portfolio. Outcomes map to
 * ABET's seven student outcomes and the NCEES FE Mechanical specification
 * (2020, "FE-ME n.X"). Outside graders: 18.01SC, 8.012, 3.091SC and 2.007
 * exams with solutions; 6.0001's problem-set tests. Evidence in
 * docs/me-term0-audit.md.
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

export const ME_TERM0 = {
  'engineering-calculus-1': {
    doc: 'docs/me-term0-audit.md',
    outcomes: [
      o('memath101.limits', 'Describe engineering quantities with functions, units, limits and continuity.', ['FE-ME 1.B', 'ABET 1'], ['calc.limit'], [1], ['final']),
      o('memath101.sensitivity', 'Differentiate, linearise and estimate sensitivity.', ['FE-ME 1.B', 'FE-ME 1.E'], ['calc.deriv', 'calc.linapprox', 'calc.tangent'], [2], ['applied', 'final']),
      o('memath101.optimize', 'Optimise a constrained design and relate rates of change.', ['FE-ME 1.B', 'ABET 1'], ['calc.optimize', 'calc.related'], [3], ['applied']),
      o('memath101.model', 'Model a mechanical system with derivatives, and solve it numerically where needed.', ['FE-ME 1.C', 'FE-ME 1.E'], ['de.linear1', 'm.newton'], [4], ['applied', 'final']),
      o('memath101.accumulate', 'Accumulate with definite integrals: work, mass and conserved quantities.', ['FE-ME 1.B'], ['calc.integral', 'calc.ftc', 'pm.work'], [5], ['final']),
      o('memath101.quadrature', 'Integrate by method or numerically, and estimate the error.', ['FE-ME 1.B', 'FE-ME 1.E'], ['calc.trapezoid', 'na.simpson'], [6], ['applied']),
      o('memath101.series', 'Approximate with Taylor series and bound the error.', ['FE-ME 1.E'], ['calc.taylor', 'm.series'], [7], ['final']),
      o('memath101.defend', 'Defend a compact model that combines differentiation, integration and error bounds.', ['ABET 1', 'ABET 3'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at the whole of 18.01SC.', fix: 'Each unit now links the 18.01SC sessions that teach it.' },
      { what: 'No mechanical-modelling session', why: '18.01SC has no unit on mechanical models (Unit 4).', fix: 'Unit 4 reads the differential-equation sessions; practice adds first-order models and Newton\'s method.' },
      { what: 'One borrowed skill', why: 'Practice was a single derivative question.', fix: 'Practice now runs from limits to Taylor series, including optimisation, numerical integration and the work done by a varying force.' },
    ],
    benchmarks: [
      { id: 'memath101.exams', name: 'MIT 18.01SC unit exams, against the solutions', how: 'Sit each after its unit, closed-notes; record your average.', max: 100, url: `${OCW}/18-01sc-single-variable-calculus-fall-2010/pages/1.-differentiation/exam-1/` },
      { id: 'memath101.final', name: 'MIT 18.01SC final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/18-01sc-single-variable-calculus-fall-2010/pages/final-exam/` },
    ],
    rubrics: {
      applied: applied('A constrained mechanism or thermal-enclosure design optimised, with the objective, constraints and optimum stated in units.', 'The optimum confirmed by a second method (a numerical search or a plot), and each derivative checked by finite differences.', 'The optimum\'s sensitivity to each input estimated, and where the model stops holding stated.'),
      final: finalExam('the cumulative written exam (the 18.01SC final will do)', 'A compact model that uses differentiation, integration and an error bound, defended under questioning.', 'Units carried throughout, limiting cases checked, and validity limits stated.'),
    },
  },

  'university-physics-1-mechanics-waves': {
    doc: 'docs/me-term0-audit.md',
    outcomes: [
      o('mephys101.kinematics', 'Describe motion with vectors, and measurements with their uncertainty.', ['FE-ME 7.A', 'FE-ME 13.D'], ['pm.projectile', 'lab.propagate'], [1], ['final']),
      o('mephys101.newton', 'Draw free-body diagrams and apply Newton\'s laws, with friction.', ['FE-ME 7.B', 'FE-ME 7.C'], ['pm.incline'], [2], ['final']),
      o('mephys101.energy', 'Use work, energy and conservative-force models.', ['FE-ME 7.D'], ['pm.work'], [3], ['final']),
      o('mephys101.momentum', 'Reconcile momentum and energy in collisions, including losses.', ['FE-ME 7.E', 'ABET 6'], ['pm.collision'], [4], ['applied', 'final']),
      o('mephys101.rotation', 'Model rotation, torque and angular momentum.', ['FE-ME 7.H', 'FE-ME 7.I'], ['pm.rolling'], [5], ['final']),
      o('mephys101.statics', 'Find reactions in static equilibrium, and the stretch of a loaded member.', ['FE-ME 6.C', 'FE-ME 8.C'], ['sta.beam', 'sol.axial'], [6], ['final']),
      o('mephys101.waves', 'Analyse oscillations, waves and resonance.', ['FE-ME 7.K'], ['pm.oscillator', 'de.oscillator', 'pw.string', 'pw.modes'], [7], ['final']),
      o('mephys101.experiment', 'Run a reproducible mechanics experiment, fit it, and defend the residuals.', ['ABET 6', 'FE-ME 2.D'], ['lab.fit', 'lab.chi2'], [8], ['applied', 'final']),
    ],
    gaps: [
      { what: '8.01SC stops before oscillations and elasticity', why: 'MIT\'s 8.01SC has no oscillations or waves (Unit 7), and no stress or strain (Unit 6).', fix: 'Unit 7 reads 8.03SC lectures; Unit 6 reads OpenStax University Physics Chapter 12.' },
      { what: 'Practice was borrowed', why: 'The course drew on the Robotics track\'s torque and gear questions, which have no independent check.', fix: 'Practice now uses the Physics degree\'s mechanics and waves skills, plus new beam-reaction and axial-stretch skills, all checked independently.' },
    ],
    benchmarks: [
      { id: 'mephys101.exams', name: 'MIT 8.012 exams, against the solutions', how: 'Sit each in 90 minutes; record your average.', max: 100, url: `${OCW}/8-012-physics-i-classical-mechanics-fall-2008/pages/exams/` },
      { id: 'mephys101.final', name: 'MIT 8.012 final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/8-012-physics-i-classical-mechanics-fall-2008/pages/exams/` },
    ],
    rubrics: {
      applied: applied('A collision study, run or simulated, with momentum and energy accounts for every stage.', 'Momentum and energy reconciled by two routes (video tracking and a force sensor, or analysis and simulation), with disagreements explained.', 'Uncertainty propagated, and non-ideal loss quantified with its likely causes.'),
      final: finalExam('the cumulative mechanics exam (an 8.012 exam will do)', 'A reproducible oscillation or rigid-body experiment defended from its raw data, with residuals corrected or explained.', 'Units, signs and limiting cases (massless, frictionless, small angle) checked, and the rig\'s hazards stated.'),
    },
  },

  'chemistry-materials-foundations': {
    doc: 'docs/me-term0-audit.md',
    outcomes: [
      o('mechem101.bonding', 'Explain how bonding sets atomic spacing, bond energy and properties.', ['FE-ME 9.A'], ['mat.bond'], [1], ['final']),
      o('mechem101.crystals', 'Relate crystal structure and defects to density and diffusion.', ['FE-ME 9.A'], ['mat.density', 'mat.diffusion'], [2], ['final']),
      o('mechem101.thermo', 'Use thermochemistry and equilibrium to predict whether a process runs.', ['FE-ME 11.C'], ['ch.gibbs', 'ch.calorimetry'], [3], ['final']),
      o('mechem101.phases', 'Read phase diagrams, and select a material with a performance index.', ['FE-ME 9.G', 'FE-ME 9.H'], ['mat.lever', 'mat.index'], [4], ['applied', 'final']),
      o('mechem101.kinetics', 'Predict reaction and processing rates with kinetics and Arrhenius behaviour.', ['FE-ME 9.G'], ['ch.kinetics', 'mat.diffusion'], [5], ['final']),
      o('mechem101.corrosion', 'Quantify electrochemical cells and corrosion rates.', ['FE-ME 9.I'], ['mat.nernst', 'mat.corrosion'], [6], ['applied', 'final']),
      o('mechem101.classes', 'Compare metals, ceramics, polymers and composites, including rule-of-mixtures stiffness.', ['FE-ME 9.C', 'FE-ME 9.D', 'FE-ME 9.E'], ['mat.composite'], [7], ['applied']),
      o('mechem101.case', 'Defend a failure case from bonding through processing, microstructure, properties and degradation.', ['FE-ME 9.J', 'ABET 1', 'ABET 4'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at the whole of 3.091SC.', fix: 'Each unit now links the 3.091SC sessions that teach it.' },
      { what: '3.091SC has no thermochemistry or electrochemistry', why: 'It skips equilibrium, galvanic cells and corrosion (Units 3 and 6).', fix: 'Those units read OpenStax Chemistry 2e Chapters 5, 13, 16 and 17.' },
      { what: 'No composites', why: '3.091SC covers glasses and polymers but not fibre composites (Unit 7).', fix: 'Read DoITPoMS\'s package on fibre composites; practice adds the rule of mixtures.', url: 'https://www.doitpoms.ac.uk/tlplib/fibre_composites/index.php' },
      { what: 'No materials selection', why: 'Nothing taught choosing a material against a requirement (Unit 4).', fix: 'MIT 3.080 covers materials selection; practice adds performance indices for stiff, light beams.', url: `${OCW}/3-080-economic-environmental-issues-in-materials-selection-fall-2005/` },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Practice now covers bonding, density, diffusion, the lever rule, selection, corrosion, cell voltage and composites, all checked independently.' },
    ],
    benchmarks: [
      { id: 'mechem101.final', name: 'MIT 3.091SC final exam, against the solution key', how: 'Three hours, closed-notes; record your percentage.', max: 100, url: `${OCW}/3-091sc-introduction-to-solid-state-chemistry-fall-2010/pages/final-exam/` },
      { id: 'mechem101.self', name: 'MIT 3.091SC self-assessments, against their solutions', how: 'Do each unit\'s self-assessment; record your average.', max: 100, url: `${OCW}/3-091sc-introduction-to-solid-state-chemistry-fall-2010/pages/crystalline-materials/self-assessment-crystalline-materials/` },
    ],
    rubrics: {
      applied: applied('A material chosen for a loaded, exposed component from a phase/property argument, a performance index and a corrosion assessment.', 'The choice checked a second way (a property database or a second index), and the corrosion rate computed from current density and compared with published rates.', 'Service conditions, failure modes and life-cycle assumptions stated, with how sensitive the choice is to each.'),
      final: finalExam('the cumulative exam (the 3.091SC final will do)', 'A failure case traced from atomic bonding through processing, microstructure and properties to degradation, defended under questioning.', 'Property values sourced, units checked, and the limits of each structure–property argument stated.'),
    },
  },

  'programming-engineering-computation': {
    doc: 'docs/me-term0-audit.md',
    outcomes: [
      o('mecomp101.basics', 'Write programs with variables, functions, units and control flow.', ['FE-ME 1.F', 'ABET 1'], ['py.arith', 'py.branch', 'py.loopcount'], [1], ['applied']),
      o('mecomp101.data', 'Hold engineering data in arrays and tables, and plot it.', ['FE-ME 1.F'], ['py.accum', 'py.fileio'], [2], ['applied']),
      o('mecomp101.decompose', 'Decompose a problem into functions, and reason about running time.', ['FE-ME 1.F'], ['py.return', 'py.recursion', 'bigo'], [3], ['final']),
      o('mecomp101.model', 'Build and test a numerical model of a physical system.', ['FE-ME 1.E', 'ABET 6'], ['de.euler', 'py.pytest', 'py.except'], [4], ['applied']),
      o('mecomp101.numerics', 'Find roots and integrals numerically, and measure the error.', ['FE-ME 1.E'], ['na.bisect', 'calc.trapezoid', 'na.order'], [5], ['applied', 'final']),
      o('mecomp101.fit', 'Clean data, fit models and judge the residuals.', ['FE-ME 2.D', 'ABET 6'], ['py.csv', 'lab.fit'], [6], ['final']),
      o('mecomp101.reproduce', 'Version, document and reproduce engineering software.', ['ABET 3', 'ABET 7'], ['se.git'], [7], ['final']),
      o('mecomp101.release', 'Release and defend a tested computation package with stated validity limits.', ['ABET 1', 'ABET 3'], ['py.boundary', 'se.coverage'], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at 6.0001 as a whole.', fix: 'Units link 6.0001 lectures by topic, NumPy for arrays, and the Turing Way for version control and environments.' },
      { what: '6.0001 has no numerical methods or data fitting', why: 'Units 5–6 need root finding, quadrature and fitting, which 6.0001 does not teach.', fix: 'Unit 6 reads 6.0002\'s lectures on experimental data; practice adds bisection, the trapezoid rule, order of accuracy and least-squares fits.' },
      { what: 'Practice stopped at the basics', why: 'Five introductory Python questions.', fix: 'Practice now adds testing, numerical methods, fitting, data validation and git.' },
    ],
    benchmarks: [
      { id: 'mecomp101.psets', name: '6.0001 problem sets 3–5, checked by their provided tests', how: 'Run each problem set\'s test file on your solution; record the percentage of tests passed.', max: 100, url: `${OCW}/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/pages/assignments/` },
    ],
    rubrics: {
      applied: applied('A parameterised motion or heat-balance model implemented with units, plots and a convergence study.', 'Results checked against an analytic special case, and the step halved until the answer stops changing.', 'Model assumptions, parameter ranges and a fault log recorded.'),
      final: finalShow('A released package: code, tests, a reproducible environment, validation data and documented validity limits.', 'Each requirement traced to code and a passing test.', 'Design choices defended under questions: why these structures, what was tested, and what would break it.'),
    },
  },

  'engineering-graphics-cad-design-studio': {
    doc: 'docs/me-term0-audit.md',
    outcomes: [
      o('medes101.needs', 'Turn a need into requirements and engineering sketches.', ['ABET 2', 'ABET 3'], [], [1], ['final']),
      o('medes101.views', 'Read and draw orthographic and section views, and dimension them.', ['FE-ME 14.M'], ['des.ortho'], [2], ['applied']),
      o('medes101.model', 'Build parametric solid models that capture design intent, and check their mass properties.', ['FE-ME 6.E', 'ABET 2'], ['des.centroid'], [3], ['applied']),
      o('medes101.assembly', 'Assemble parts with defined interfaces, and check the motion.', ['FE-ME 7.G', 'FE-ME 14.H'], ['des.grashof', 'des.gears'], [4], ['applied']),
      o('medes101.tolerance', 'Specify fits and tolerances, stack them up, and read basic GD&T.', ['FE-ME 14.J', 'FE-ME 14.M'], ['des.fit', 'des.stack'], [5], ['applied', 'final']),
      o('medes101.concepts', 'Generate, select and critique concepts with a weighted matrix, testing its sensitivity.', ['ABET 2', 'ABET 5'], ['des.pugh'], [6], ['final']),
      o('medes101.prototype', 'Build safe mockups and prototypes, and iterate on what they show.', ['ABET 2', 'ABET 6', 'FE-ME 3.B'], [], [7], ['final']),
      o('medes101.package', 'Present and defend a complete design package with traceable requirements.', ['ABET 3', 'ABET 5'], [], [8], ['final']),
    ],
    gaps: [
      { what: '2.007 teaches SolidWorks', why: 'Its CAD lectures assume a paid licence.', fix: 'FreeCAD is the free route; the same design-intent and assembly ideas apply.', url: 'https://wiki.freecad.org/Getting_started' },
      { what: 'No drawing, tolerancing or GD&T text', why: '2.007 shows drawings but does not teach projection, dimensioning, fits or GD&T (Units 2 and 5).', fix: 'Those units read Ford\'s Engineering Graphics and Design (UW Pressbooks).' },
      { what: 'Practice had no checks', why: 'The course borrowed the Robotics track\'s CAD, tolerance and orientation questions.', fix: 'Seven new design skills: views, centroids, four-bar linkages, gear trains, fits, tolerance stacks and decision matrices, each checked independently.' },
      { what: 'Prototyping needs a supervised shop', why: 'The app cannot train or sign off machine-tool use (Unit 7).', fix: 'The 2.670 tutorials prepare you; use a supervised makerspace or college shop for the build.' },
    ],
    benchmarks: [
      { id: 'medes101.exam', name: 'MIT 2.007 Exam 1 (drawing, CAD, motors, mechanisms), against the solutions', how: 'Sit it closed-notes; record your percentage.', max: 100, url: `${OCW}/2-007-design-and-manufacturing-i-spring-2009/pages/exams/` },
      { id: 'medes101.review', name: '2.007 design-review notes as a checklist', how: 'Score your design package against every item the notes ask a review to show; record the percentage met.', max: 100, url: `${OCW}/2-007-design-and-manufacturing-i-spring-2009/resources/mit2_007s09_rec06_dr1/` },
    ],
    rubrics: {
      applied: applied('A constrained parametric assembly of an everyday mechanism, with drawings, interface checks and a revision log.', 'Interfaces checked for interference and motion in CAD, and one key dimension chain checked by a hand tolerance stack.', 'Design intent, the assumed manufacturing process, and the tolerance choices recorded with reasons.'),
      final: finalShow('A need-to-prototype package: requirements, concepts and their selection, CAD, drawings, a risk review and user feedback.', 'Every requirement traced to a design feature and to a check or test.', 'Choices defended under questions, including what the user feedback changed.'),
    },
  },
};
