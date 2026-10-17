/**
 * Mechanical Engineering, Term 3 — audited as Term 0 was (see me-term0.js).
 *
 * Outcomes map to ABET's seven student outcomes and the NCEES FE Mechanical
 * specification ("FE-ME n.X"). Outside graders: 2.007, 2.04A, 18.05 and 2.008
 * exams or practice problems with solutions; NIST's Statistical Reference
 * Datasets; 10.302 exams confirmed by simulation. Evidence in
 * docs/me-term3-audit.md.
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
/** A final presentation, portfolio or project. */
const finalShow = (pkg, trace, defence) => [
  crit('Complete package', pkg, 'One element missing or weak.', 'Incomplete.'),
  crit('Traceability', trace, 'Partly traced.', 'Not traced.'),
  crit('Verification, limits and safety', 'Verification evidence shown, validity limits stated, and hazards listed with their controls.', 'Some evidence; limits or hazards thin.', 'None.'),
  crit('Defence', defence, 'Partly answered.', 'Not answered.'),
];

export const ME_TERM3 = {
  'heat-mass-transfer': {
    doc: 'docs/me-term3-audit.md',
    outcomes: [
      o('meht401.conduction', 'Model steady conduction with thermal resistances and boundary conditions.', ['FE-ME 12.A'], ['ht.wall', 'ht.cylinder'], [1], ['final']),
      o('meht401.fins', 'Analyse fins and multidimensional conduction.', ['FE-ME 12.A'], ['ht.fin'], [2], ['final']),
      o('meht401.transient', 'Predict transient conduction, and know when a lumped model holds.', ['FE-ME 12.D'], ['ht.lumped', 'ht.slab'], [3], ['applied', 'final']),
      o('meht401.inverse', 'Estimate a thermal property or convection coefficient from data, with its uncertainty.', ['ABET 6', 'FE-ME 13.D'], ['lab.fit', 'ht.lumped'], [4], ['applied']),
      o('meht401.convection', 'Apply forced and natural convection correlations.', ['FE-ME 12.B'], ['ht.pipeflow'], [5], ['applied', 'final']),
      o('meht401.radiation', 'Compute radiation exchange between surfaces.', ['FE-ME 12.C'], ['ht.radiation', 'pt.planck'], [6], ['final']),
      o('meht401.exchangers', 'Size heat exchangers, and estimate mass transfer by analogy.', ['FE-ME 12.E'], ['ht.hx', 'ht.mass'], [7], ['final']),
      o('meht401.defend', 'Defend a heat-exchanger or electronics-cooling design with its operating envelope and safety case.', ['ABET 1', 'ABET 2'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at 2.51 as a whole, and 2.51 posts no lecture notes.', fix: '2.51 teaches from Lienhard and Lienhard\'s free *A Heat Transfer Textbook*; each unit now links its chapter.' },
      { what: 'No exams with solutions', why: '2.51 posts none, and 10.302\'s exams come without answers.', fix: 'The benchmark counts a 10.302 answer only when a finite-difference or network solution agrees.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Nine new heat-transfer skills (walls, insulated pipes, fins, lumped and slab transients, pipe flow, radiation, heat exchangers, mass transfer), each checked independently.' },
    ],
    benchmarks: [
      { id: 'meht401.exams', name: 'MIT 10.302 exams, each answer confirmed by a numerical solution', how: 'No solutions are posted: count an answer right only when your finite-difference or resistance-network model agrees; record the percentage.', max: 100, url: `${OCW}/10-302-transport-processes-fall-2004/pages/exams/` },
    ],
    rubrics: {
      applied: applied('A thermal property or convection coefficient estimated from data, with propagated uncertainty.', 'The estimate checked a second way (another fitting window, a steady-state method or a published correlation), and competing models (lumped or distributed, constant or varying h) tested against the residuals.', 'Biot number, property values, and radiation and contact losses stated, with how far each could bias the estimate.'),
      final: finalExam('the cumulative exam (10.302 exams, checked by simulation)', 'A heat-exchanger or electronics-cooling design defended across its operating envelope.', 'Temperature limits, fouled or degraded cooling, and the safety case stated.'),
    },
  },

  'machine-elements-mechanical-design': {
    doc: 'docs/me-term3-audit.md',
    outcomes: [
      o('memd401.requirements', 'Turn requirements into load cases, design factors and uncertainty margins.', ['FE-ME 14.A', 'ABET 2'], [], [1], ['applied']),
      o('memd401.fatigue', 'Design against static failure and fatigue, including stress concentration.', ['FE-ME 14.B', 'FE-ME 9.J'], ['mach.goodman', 'sol.vonmises'], [2], ['applied', 'final']),
      o('memd401.shafts', 'Size shafts, keys and couplings, and keep clear of critical speed.', ['FE-ME 14.A', 'FE-ME 14.H'], ['mach.shaft', 'mach.critical'], [3], ['applied']),
      o('memd401.bearings', 'Select bearings for a duty cycle and review the shaft–bearing subsystem.', ['FE-ME 14.F'], ['mach.bearing'], [4], ['applied']),
      o('memd401.transmission', 'Size gears, belts and chains for power transmission.', ['FE-ME 14.H'], ['mach.gear', 'mach.belt', 'des.gears'], [5], ['final']),
      o('memd401.joints', 'Design fasteners, joints, springs, brakes and clutches.', ['FE-ME 14.D', 'FE-ME 14.G', 'FE-ME 14.I'], ['mach.bolt', 'mach.spring', 'mach.clutch', 'sta.friction'], [6], ['final']),
      o('memd401.fits', 'Specify tolerances, lubrication, sealing and maintainability.', ['FE-ME 14.J', 'FE-ME 14.M'], ['des.fit', 'des.stack'], [7], ['final']),
      o('memd401.defend', 'Defend a complete machine assembly with traceable requirements, FMEA, cost and a maintenance plan.', ['ABET 2', 'ABET 3', 'ABET 4'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at the whole of 2.72.', fix: 'Each unit now links the 2.72 lectures that teach it.' },
      { what: 'No lubrication or sealing', why: '2.72 does not teach them (Unit 7).', fix: 'Unit 7 reads standard fits; lubrication and seal selection need a manufacturer\'s catalogue for the chosen parts.' },
      { what: 'No exams', why: '2.72 is project-based.', fix: 'The benchmark uses 2.007\'s Exam 2 (gears, springs and drives), which has solutions.' },
      { what: 'Practice had no checks', why: 'The course borrowed the Robotics track\'s gear, backlash and torque questions.', fix: 'Nine new machine-element skills (Goodman fatigue, shaft sizing, critical speed, bearing life, bolted joints, springs, gear loads, belts, clutches), each checked independently.' },
    ],
    benchmarks: [
      { id: 'memd401.exam', name: 'MIT 2.007 Exam 2 (gears, springs, drives), against the solutions', how: 'Sit it closed-notes; record your percentage.', max: 100, url: `${OCW}/2-007-design-and-manufacturing-i-spring-2009/pages/exams/` },
    ],
    rubrics: {
      applied: applied('A shaft–bearing–transmission subsystem sized under duty-cycle loads, with drawings and life calculations.', 'Each life and safety factor checked a second way (a manufacturer\'s calculator, a finite-element model, or a hand check of a different failure mode), and the design-review actions closed.', 'Duty cycle, reliability target, stress concentrations and material data stated with their sources.'),
      final: finalShow('A complete machine assembly: traceable requirements, calculations, CAD, tolerance stack, FMEA, cost and maintenance plan.', 'Every requirement traced to a calculation, a drawing feature, and a test or inspection.', 'The design defended under questions, including its most likely failure and how maintenance would catch it.'),
    },
  },

  'system-dynamics-feedback-control': {
    doc: 'docs/me-term3-audit.md',
    outcomes: [
      o('mect401.model', 'Build lumped models from energy and linearise them.', ['FE-ME 1.C', 'FE-ME 13.C'], ['de.phase', 'de.oscillator'], [1], ['final']),
      o('mect401.tf', 'Predict response from transfer functions, poles and zeros.', ['FE-ME 13.B', 'FE-ME 13.C'], ['de.laplace', 'ckt.overshoot'], [2], ['final']),
      o('mect401.stability', 'Judge stability and meet transient specifications, including by root locus.', ['FE-ME 13.B'], ['ctl.routh', 'ctl.rootlocus', 'ctl.sse'], [3], ['final']),
      o('mect401.pid', 'Identify a plant from data and design PID control for it.', ['FE-ME 13.B', 'ABET 6'], ['ctl.pi', 'lab.fit'], [4], ['applied']),
      o('mect401.frequency', 'Use frequency response, stability margins and robustness.', ['FE-ME 13.B', 'FE-ME 13.C'], ['ctl.margin', 'ckt.bode'], [5], ['applied', 'final']),
      o('mect401.state', 'Design in state space: controllability, observability and pole placement.', ['FE-ME 13.B'], ['ctl.place', 'la.eig2'], [6], ['final']),
      o('mect401.implement', 'Implement control digitally, with sampling, saturation and estimation.', ['FE-ME 13.B'], ['ctl.discrete', 'est.kalman'], [7], ['applied']),
      o('mect401.defend', 'Verify a closed loop, and defend its release against uncertain, delayed, noisy and faulted cases.', ['ABET 1', 'ABET 4', 'ABET 6'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at *Feedback Systems* as a whole.', fix: 'Each unit now links the chapter that teaches it, by page.' },
      { what: 'No exams', why: '*Feedback Systems* is a textbook without exams.', fix: 'The benchmark uses MIT 2.04A\'s practice problems, which have solutions.' },
      { what: 'Practice had no checks', why: 'The course borrowed the Robotics track\'s PID and control questions.', fix: 'Practice now uses the EE degree\'s control skills plus four new ones (gain for an overshoot, pole placement, sampled-data stability, PI overshoot), each checked by simulation.' },
    ],
    benchmarks: [
      { id: 'mect401.practice', name: 'MIT 2.04A practice problems, against the solutions', how: 'Work them under time; record your percentage.', max: 100, url: `${OCW}/2-04a-systems-and-controls-spring-2013/pages/exams/` },
    ],
    rubrics: {
      applied: applied('A plant identified from data, with controllers designed and compared.', 'Tracking, disturbance rejection, margins and saturation verified in simulation (and on hardware where possible), with the identified model validated on data not used to fit it.', 'Model uncertainty, delays, sensor noise and actuator limits stated, with the margin kept for each.'),
      final: finalExam('the cumulative exam (the 2.04A practice problems will do)', 'A closed-loop release defended against nominal, uncertain, delayed, noisy and faulted scenarios.', 'Saturation, windup and fault responses stated, with what the system does if the controller fails.'),
    },
  },

  'engineering-probability-measurement-experimental-methods': {
    doc: 'docs/me-term3-audit.md',
    outcomes: [
      o('melab401.probability', 'Model variation with probability distributions and sampling.', ['FE-ME 2.A', 'FE-ME 2.B'], ['pr.continuous', 'pr.clt'], [1], ['final']),
      o('melab401.inference', 'Estimate with confidence intervals and test hypotheses.', ['FE-ME 2.B'], ['st.ci', 'exp.ttest', 'st.power'], [2], ['final']),
      o('melab401.calibration', 'Calibrate instruments with traceability, resolution and bias stated.', ['FE-ME 13.D'], ['lab.weighted', 'lab.adc'], [3], ['applied']),
      o('melab401.budget', 'Design an experiment and its uncertainty budget.', ['FE-ME 13.D', 'ABET 6'], ['exp.budget', 'lab.propagate', 'lab.trials'], [4], ['applied']),
      o('melab401.regression', 'Fit models, examine residuals and choose between models.', ['FE-ME 2.D'], ['lab.fit', 'lab.chi2'], [5], ['applied', 'final']),
      o('melab401.factorial', 'Run factorial experiments and estimate effects.', ['ABET 6'], ['exp.factorial'], [6], ['final']),
      o('melab401.dynamic', 'Measure dynamic signals: sensor response, filtering and reproducibility.', ['FE-ME 13.A', 'FE-ME 13.C'], ['exp.dynamic', 'daq.filter'], [7], ['final']),
      o('melab401.paper', 'Write and defend a journal-style experimental paper with held-out validation.', ['ABET 3', 'ABET 6'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued course is not on OCW', why: 'The catalogue names MIT 2.671 but links the NIST/SEMATECH e-Handbook; 2.671 has no OCW page.', fix: 'Units read the e-Handbook chapter by chapter, with MIT Junior Lab\'s report resources for the paper.' },
      { what: 'Practice was borrowed', why: 'The course used the core track\'s expectation and statistics questions.', fix: 'Practice now uses the Physics and CS degrees\' statistics and lab skills plus four new ones (factorial effects, uncertainty budgets, Welch\'s t-test, first-order sensor response), each checked independently.' },
    ],
    benchmarks: [
      { id: 'melab401.exams', name: 'MIT 18.05 (2014) Exam 2 and final, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/18-05-introduction-to-probability-and-statistics-spring-2014/pages/exams/` },
      { id: 'melab401.strd', name: 'Your regression code against NIST\'s Statistical Reference Datasets', how: 'Run your fitting code on the linear-regression datasets; record the percentage that match the certified values to six significant figures.', max: 100, url: 'https://www.itl.nist.gov/div898/strd/' },
    ],
    rubrics: {
      applied: applied('A safe experiment pre-registered and run, with raw data, calibration, uncertainty propagation, residuals and a reproducible analysis published.', 'Results checked against a held-out sample or a second method, and the analysis re-run from the raw data in a clean environment.', 'A complete uncertainty budget: every source, its type (A or B) and its sensitivity coefficient.'),
      final: finalShow('A journal-style report with a blinded or held-out validation, corrected after peer review.', 'Every claim traced to raw data, an analysis step and an uncertainty.', 'The paper defended orally, including what the data cannot show.'),
    },
  },

  'advanced-manufacturing-product-realization': {
    doc: 'docs/me-term3-audit.md',
    outcomes: [
      o('memfg401.planning', 'Plan processes with a datum strategy and controlled tolerance chains.', ['FE-ME 14.J', 'FE-ME 14.M'], ['des.stack', 'des.fit'], [1], ['applied']),
      o('memfg401.machining', 'Plan CNC machining from cutting mechanics, and design fixtures.', ['FE-ME 9.F'], ['mfg.merchant', 'mfg.turning', 'mfg.taylor'], [2], ['applied']),
      o('memfg401.processes', 'Choose among forming, moulding, additive and hybrid processes.', ['FE-ME 9.F'], ['mfg.flow', 'mfg.cooling', 'mfg.chvorinov'], [3], ['final']),
      o('memfg401.capability', 'Design for manufacture and demonstrate process capability.', ['FE-ME 14.J', 'FE-ME 14.K'], ['mfg.cpk'], [4], ['applied']),
      o('memfg401.assembly', 'Plan assembly, joining, automation and mistake-proofing.', ['FE-ME 14.I'], ['mach.bolt'], [5], ['final']),
      o('memfg401.quality', 'Plan quality with statistical control and traceability.', ['FE-ME 14.K'], ['mfg.spc', 'mfg.cpk'], [6], ['applied', 'final']),
      o('memfg401.cost', 'Weigh cost, supply chain, sustainability and end of life.', ['FE-ME 3.D', 'FE-ME 4.B', 'FE-ME 4.C'], ['econ.breakeven', 'econ.npv'], [7], ['final']),
      o('memfg401.release', 'Issue and defend a production-release package.', ['ABET 2', 'ABET 3', 'ABET 4'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at the whole of 2.008.', fix: 'Each unit now links the 2.008 (2025) lectures that teach it, with GD&T from *Engineering Graphics and Design* and capability from the NIST e-Handbook.' },
      { what: 'No sustainability or end-of-life method', why: '2.008 covers cost and supply chains but not life-cycle assessment (Unit 7).', fix: 'Use the EU\'s life-cycle assessment platform for the method and datasets.', url: 'https://eplca.jrc.ec.europa.eu/lifecycleassessment.html' },
      { what: 'Practice had no checks', why: 'The course borrowed the Robotics track\'s materials, orientation, tolerance and CAD questions.', fix: 'Practice now uses the manufacturing skills from Term 1 plus control-chart limits and Merchant\'s cutting model, each checked independently.' },
    ],
    benchmarks: [
      { id: 'memfg401.quiz1', name: 'MIT 2.008 (2025) Quiz 1 practice exam (2023), against the solutions', how: 'Sit it under time; record your percentage.', max: 100, url: `${OCW}/2-008-design-and-manufacturing-ii-spring-2025/resources/mit2_008_s25_quiz1_prac23_sol_pdf/` },
      { id: 'memfg401.quiz2', name: 'MIT 2.008 (2025) Quiz 2 practice exam (2023), against the solutions', how: 'Sit it under time; record your percentage.', max: 100, url: `${OCW}/2-008-design-and-manufacturing-ii-spring-2025/resources/mit2_008_s25_quiz2_prac23_part_a_sol_pdf/` },
    ],
    rubrics: {
      applied: applied('A component redesigned for one production process, with capability shown through tolerance, cycle, cost, quality and inspection evidence.', 'Capability and cost checked a second way (a pilot run or published data, and a second cost model), and the tolerance stack checked by worst case and statistically.', 'Process limits, supplier assumptions and gauge capability stated.'),
      final: finalShow('A production-release package: drawings, process flow, fixtures, control plan, costed bill of materials, risks and life-cycle route.', 'Every critical characteristic traced to its process step, control-plan entry and gauge.', 'The release defended under questions, including what stops the line and how a defect is traced back.'),
    },
  },
};
