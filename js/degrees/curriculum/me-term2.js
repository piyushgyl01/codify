/**
 * Mechanical Engineering, Term 2 — audited as Term 0 was (see me-term0.js).
 *
 * Outcomes map to ABET's seven student outcomes and the NCEES FE Mechanical
 * specification ("FE-ME n.X"). Outside graders: 2.003SC, 16.001, RES.2-008
 * and 2.25 exams or problem sets with solutions; anaStruct and CoolProp as
 * independent solvers; 6.002 quizzes confirmed in a simulator. Evidence in
 * docs/me-term2-audit.md.
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

export const ME_TERM2 = {
  'rigid-body-dynamics-mechanical-vibrations': {
    doc: 'docs/me-term2-audit.md',
    outcomes: [
      o('medyn301.kinematics', 'Describe particle motion in Cartesian, polar and path coordinates.', ['FE-ME 7.A'], ['dyn.polar', 'pm.projectile'], [1], ['final']),
      o('medyn301.kinetics', 'Apply force, energy and momentum methods to particles.', ['FE-ME 7.C', 'FE-ME 7.D', 'FE-ME 7.E'], ['pm.incline', 'pm.work', 'pm.collision'], [2], ['final']),
      o('medyn301.rigidkin', 'Relate the velocities of points on rigid bodies and mechanisms.', ['FE-ME 7.F', 'FE-ME 7.G'], ['dyn.slider', 'des.grashof'], [3], ['applied']),
      o('medyn301.simulate', 'Simulate a moving mechanism and close its force, energy and kinematic checks.', ['FE-ME 7.H', 'ABET 6'], ['dyn.hoist', 'de.euler'], [4], ['applied']),
      o('medyn301.rigid', 'Solve planar rigid-body motion by force and energy methods.', ['FE-ME 7.H', 'FE-ME 7.I', 'FE-ME 7.J'], ['dyn.rod', 'pm.rolling'], [5], ['applied', 'final']),
      o('medyn301.sdof', 'Predict free and forced single-degree-of-freedom vibration.', ['FE-ME 7.K'], ['vib.free', 'vib.forced'], [6], ['final']),
      o('medyn301.isolate', 'Design for damping, resonance and isolation, and find the modes of coupled systems.', ['FE-ME 7.K'], ['vib.forced', 'vib.2dof'], [7], ['final']),
      o('medyn301.defend', 'Defend a vibration model against frequency-response data.', ['ABET 1', 'ABET 6'], ['lab.fit'], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at the whole of 2.003SC.', fix: 'Each unit now links the 2.003SC lecture pages that teach it.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Seven new dynamics and vibration skills (polar kinematics, slider-crank velocities, a falling rod, a hoist drum, free and forced vibration, two-degree-of-freedom modes), each checked by simulation.' },
    ],
    benchmarks: [
      { id: 'medyn301.quiz1', name: 'MIT 2.003SC Quiz 1, against the solutions', how: 'Sit it under time; record your percentage.', max: 100, url: `${OCW}/2-003sc-engineering-dynamics-fall-2011/pages/quiz-1/` },
      { id: 'medyn301.final', name: 'MIT 2.003SC final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/2-003sc-engineering-dynamics-fall-2011/pages/final-exam/` },
    ],
    rubrics: {
      applied: applied('A moving mechanism derived and simulated from its equations of motion.', 'Force, energy and kinematic accounts closed independently: energy conserved, or dissipated as modelled, to a stated tolerance, and positions differentiated to match the computed velocities.', 'Modelling assumptions (rigid links, frictionless joints, step size) stated, with the error each could cause.'),
      final: finalExam('the cumulative exam (the 2.003SC final will do)', 'A vibration model defended against measured or synthetic frequency-response data, with natural frequency and damping fitted and residuals explained.', 'Resonance and fatigue risks stated, with the operating margin from resonance.'),
    },
  },

  'mechanics-materials-solid-structures': {
    doc: 'docs/me-term2-audit.md',
    outcomes: [
      o('mesol301.stress', 'Relate stress, strain and material response, and apply safety factors.', ['FE-ME 8.C', 'FE-ME 9.B'], ['sol.axial', 'mfg.tensile'], [1], ['final']),
      o('mesol301.axial', 'Solve axial, thermal and statically indeterminate problems.', ['FE-ME 8.C', 'FE-ME 8.G', 'FE-ME 8.K'], ['sol.thermal'], [2], ['final']),
      o('mesol301.torsion', 'Size shafts in torsion for stress and twist.', ['FE-ME 8.E'], ['sol.torsion'], [3], ['final']),
      o('mesol301.beams', 'Predict bending stress and deflection, and validate them against measurement.', ['FE-ME 8.D', 'FE-ME 8.I', 'ABET 6'], ['sol.bending', 'sol.deflect'], [4], ['applied']),
      o('mesol301.shear', 'Draw shear and moment diagrams, and use energy methods.', ['FE-ME 8.A', 'FE-ME 8.I'], ['sta.beam', 'sol.energy'], [5], ['applied', 'final']),
      o('mesol301.multiaxial', 'Transform multiaxial stress and apply failure criteria.', ['FE-ME 8.B', 'FE-ME 8.H', 'FE-ME 14.B'], ['sol.mohr', 'sol.vonmises', 'sol.vessel'], [6], ['final']),
      o('mesol301.stability', 'Check columns for buckling, and assess cracks for fracture.', ['FE-ME 8.J', 'FE-ME 9.J'], ['sol.buckling', 'sol.fracture'], [7], ['final']),
      o('mesol301.defend', 'Defend a safety-critical component across static, buckling, fatigue and uncertainty cases.', ['ABET 1', 'ABET 4'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at the whole of 2.001.', fix: 'Each unit now links the 2.001 lectures that teach it.' },
      { what: '2.001 stops before columns, fatigue and fracture', why: 'Unit 7 has nothing in the catalogued course.', fix: 'Unit 7 reads 16.001\'s buckling lectures; DoITPoMS covers brittle fracture, and fatigue returns in Machine Elements.', url: 'https://www.doitpoms.ac.uk/tlplib/brittle_fracture/index.php' },
      { what: 'No exams with solutions', why: '2.001 posts problem sets only.', fix: 'The benchmarks use 16.001\'s Quiz 5 solutions and a free beam solver as outside graders.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Ten new mechanics-of-materials skills, from thermal stress to buckling, each checked independently.' },
    ],
    benchmarks: [
      { id: 'mesol301.quiz', name: 'MIT 16.001 Quiz 5 (stress and strain transformation), against the solutions', how: 'Sit it under time; record your percentage.', max: 100, url: `${OCW}/16-001-unified-engineering-materials-and-structures-fall-2021/resources/mit16_001_f21_q05_sol_pdf/` },
      { id: 'mesol301.solver', name: 'Hand beam calculations against anaStruct', how: 'Model three of your hand-solved beams in the anaStruct frame solver; record the percentage whose deflections and moments agree within 1%.', max: 100, url: 'https://anastruct.readthedocs.io/en/latest/' },
    ],
    rubrics: {
      applied: applied('A beam sized, then tested or simulated, with measured and predicted strain and deflection compared.', 'Predictions checked against a frame or finite-element solver, and against a strain-gauge or dial-gauge measurement where available.', 'Uncertainty in supports, load placement and material properties stated, with each discrepancy traced to one.'),
      final: finalExam('the cumulative exam', 'A safety-critical component defended across static, buckling, fatigue and uncertainty cases, with a factor of safety for each.', 'The governing failure mode identified, units checked, and what happens if the margin is exceeded stated.'),
    },
  },

  'engineering-thermodynamics': {
    doc: 'docs/me-term2-audit.md',
    outcomes: [
      o('mether301.state', 'Fix thermodynamic states with properties and equations of state.', ['FE-ME 11.A'], ['pt.ideal'], [1], ['final']),
      o('mether301.firstlaw', 'Apply the first law to closed systems, with boundary work and heat.', ['FE-ME 11.B', 'FE-ME 11.C', 'FE-ME 11.D'], ['th.polytropic', 'ch.calorimetry'], [2], ['final']),
      o('mether301.cv', 'Apply mass and energy balances to turbines, compressors and nozzles.', ['FE-ME 11.E'], ['th.turbine'], [3], ['applied', 'final']),
      o('mether301.audit', 'Audit a cycle\'s energy and check every property state independently.', ['FE-ME 11.F', 'ABET 6'], ['th.otto', 'th.brayton'], [4], ['applied']),
      o('mether301.secondlaw', 'Judge processes with entropy, irreversibility and exergy.', ['FE-ME 11.C'], ['th.sgen', 'pt.entropy', 'pt.carnot'], [5], ['applied', 'final']),
      o('mether301.cycles', 'Analyse power, refrigeration and heat-pump cycles.', ['FE-ME 11.F', 'FE-ME 11.G'], ['th.brayton', 'th.otto', 'th.cop'], [6], ['final']),
      o('mether301.mixtures', 'Work with gas mixtures, moist air and combustion.', ['FE-ME 11.H', 'FE-ME 11.I', 'FE-ME 11.K'], ['th.psych', 'th.afr'], [7], ['final']),
      o('mether301.defend', 'Defend a conversion system with first-law closure, entropy generation, efficiency and operating limits.', ['ABET 1', 'ABET 2'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued resource is not an engineering text', why: 'RES.2-008 is a four-chapter book on thermodynamics and climate; it has no control volumes, cycles or mixtures.', fix: 'Units read Yan\'s *Introduction to Engineering Thermodynamics* and MIT\'s Unified Thermodynamics notes; RES.2-008\'s problem sets stay as a check.' },
      { what: 'No real-fluid properties in the app', why: 'Steam and refrigerant tables are too large to generate questions from honestly.', fix: 'Practice uses ideal gases, liquids and given saturation pressures; check real-fluid states against CoolProp.', url: 'https://coolprop.org/' },
      { what: 'No psychrometrics text', why: 'Neither free text covers moist air (Unit 7).', fix: 'Practice adds humidity ratio, enthalpy and condensation; the FE Reference Handbook\'s psychrometric chart is the reference on the exam.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Eight new thermodynamics skills, from polytropic work to air–fuel ratios, each checked independently.' },
    ],
    benchmarks: [
      { id: 'mether301.psets', name: 'MIT RES.2-008 problem sets, against the solutions', how: 'Work each problem set; record your average.', max: 100, url: `${OCW}/res-2-008-thermodynamics-and-climate-change-summer-2020/pages/problem-sets/` },
      { id: 'mether301.props', name: 'Cycle states against CoolProp', how: 'Check every state in your cycle audit against CoolProp; record the percentage that agree within 0.5%.', max: 100, url: 'https://coolprop.org/' },
    ],
    rubrics: {
      applied: applied('A reproducible energy and exergy audit of a power or refrigeration cycle.', 'Every property state checked against an independent source (CoolProp or published tables), and the first law closed to a stated tolerance.', 'Property models (ideal gas, constant specific heats, real fluid) and component efficiencies stated, with how sensitive the result is to each.'),
      final: finalExam('the cumulative exam', 'A conversion system defended with first-law closure, entropy generation, efficiency and operating limits.', 'Units and sign conventions consistent; temperature, pressure and material limits stated.'),
    },
  },

  'fluid-mechanics': {
    doc: 'docs/me-term2-audit.md',
    outcomes: [
      o('meflu301.statics', 'Apply fluid properties and hydrostatics to forces on surfaces.', ['FE-ME 10.A', 'FE-ME 10.B'], ['fl.gate'], [1], ['final']),
      o('meflu301.kinematics', 'Describe flow with streamlines and control volumes, conserving mass.', ['FE-ME 10.C'], ['fl.bernoulli'], [2], ['final']),
      o('meflu301.balances', 'Apply mass, momentum and energy balances.', ['FE-ME 10.C'], ['fl.bernoulli', 'fl.vane'], [3], ['final']),
      o('meflu301.losses', 'Identify pressure-drop behaviour from data and reconcile it with loss models.', ['FE-ME 10.D', 'ABET 6'], ['fl.pipe', 'lab.fit'], [4], ['applied']),
      o('meflu301.similarity', 'Scale results with dimensional analysis and similarity.', ['FE-ME 10.I'], ['fl.similarity'], [5], ['applied']),
      o('meflu301.networks', 'Analyse viscous internal flow and pipe networks.', ['FE-ME 10.D'], ['fl.pipe', 'fl.parallel'], [6], ['final']),
      o('meflu301.external', 'Estimate boundary layers, drag and lift, and pump performance.', ['FE-ME 10.E', 'FE-ME 10.G', 'FE-ME 10.H'], ['fl.plate', 'fl.pumpop'], [7], ['final']),
      o('meflu301.defend', 'Defend a pump–pipe or external-flow design across regimes, uncertainty, and cavitation or separation.', ['ABET 1', 'ABET 2'], ['fl.pumpop'], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued course follows a paid textbook', why: 'MIT 2.06 lists readings from a textbook that is not free.', fix: 'Units read MIT 1.060\'s lecture notes and 2.25\'s topic pages.' },
      { what: 'The lab needs a flow rig', why: 'The applied lab asks for measured pressure drop.', fix: 'Synthetic data are allowed; state which you used.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Eight new fluid-mechanics skills, from gate forces to Blasius drag, each checked independently.' },
    ],
    benchmarks: [
      { id: 'meflu301.quiz', name: 'MIT 2.25 Quiz 1, against the solutions (graduate level: a stretch)', how: 'Sit it under time; record your percentage.', max: 100, url: `${OCW}/2-25-advanced-fluid-mechanics-fall-2013/pages/exams/` },
    ],
    rubrics: {
      applied: applied('Pressure-drop or discharge behaviour identified from measured or synthetic data, with a fitted loss model.', 'The fit checked against Darcy–Weisbach with Colebrook, and against a dimensional-analysis collapse of the data.', 'Measurement uncertainty, flow regime, and entrance and minor-loss assumptions stated.'),
      final: finalExam('the cumulative exam', 'A pump–pipe or external-flow design defended across flow regimes and uncertainty.', 'Cavitation (NPSH) or separation limits checked, with units and regime assumptions stated.'),
    },
  },

  'electronics-sensors-data-acquisition': {
    doc: 'docs/me-term2-audit.md',
    outcomes: [
      o('meelc301.dc', 'Analyse DC networks and the loading an instrument adds.', ['FE-ME 5.B'], ['ckt.req', 'ckt.thevenin', 'daq.loading'], [1], ['final']),
      o('meelc301.opamp', 'Condition signals with op-amp circuits.', ['FE-ME 13.A'], ['el.opamp'], [2], ['applied']),
      o('meelc301.dynamic', 'Predict dynamic circuits, filters and frequency response.', ['FE-ME 5.C', 'FE-ME 13.C'], ['pe.rc', 'ckt.bode'], [3], ['applied']),
      o('meelc301.calibrate', 'Calibrate a sensor interface and state its uncertainty.', ['FE-ME 13.D', 'ABET 6'], ['lab.fit', 'lab.propagate'], [4], ['applied']),
      o('meelc301.sensors', 'Choose and read resistive, capacitive, optical and thermal sensors.', ['FE-ME 13.A'], ['daq.bridge', 'daq.rtd'], [5], ['applied', 'final']),
      o('meelc301.sampling', 'Sample without aliasing, and quantise with known resolution.', ['FE-ME 13.A', 'FE-ME 13.D'], ['el.alias', 'daq.filter', 'lab.adc'], [6], ['final']),
      o('meelc301.noise', 'Control noise, grounding, shielding and faults.', ['FE-ME 13.D'], ['el.ktc'], [7], ['final']),
      o('meelc301.release', 'Release and defend a multi-channel acquisition system.', ['ABET 2', 'ABET 3'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at 6.002 as a whole.', fix: 'Units link 6.002 lectures, *Lessons in Electric Circuits*, NIST on calibration, and TI on noise.' },
      { what: '6.002 has no sensors or data acquisition', why: 'Units 4–6 need calibration, sensors and sampling.', fix: 'Those units read NIST\'s calibration chapter and *Lessons in Electric Circuits* Vol. I Ch. 9 and Vol. IV Ch. 13.' },
      { what: 'No free grounding and shielding text that can be checked', why: 'Analog Devices\' tutorials never answered our link checks.', fix: 'Unit 7 reads TI\'s noise note; grounding and protection rely on the lab work.' },
      { what: 'Practice was borrowed', why: 'The course drew on the Robotics track\'s Ohm\'s-law, divider, sensor, meter and bus questions.', fix: 'Practice now uses the EE degree\'s circuit skills and four new data-acquisition skills (bridges, RTDs and thermistors, loading, anti-alias filters), each checked independently.' },
    ],
    benchmarks: [
      { id: 'meelc301.quizzes', name: 'MIT 6.002 quizzes, each answer confirmed in a simulator', how: 'No solutions are posted: count an answer right only when CircuitJS agrees; record the percentage.', max: 100, url: `${OCW}/6-002-circuits-and-electronics-spring-2007/pages/exams/` },
    ],
    rubrics: {
      applied: applied('A conditioned sensor channel built or simulated, and calibrated against a reference.', 'The calibration checked with points not used to fit it, and bandwidth and noise checked by measurement or simulation against the design.', 'Bandwidth, noise, uncertainty and saturation limits reported.'),
      final: finalShow('A multi-channel acquisition system released: schematics, firmware, calibration, fault tests and a reproducible dataset.', 'Each channel\'s requirement traced to a measured result.', 'The design defended under questions, including what happens when a sensor fails or overloads.'),
    },
  },
};
