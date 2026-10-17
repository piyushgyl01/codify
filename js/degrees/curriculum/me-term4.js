/**
 * Mechanical Engineering, Term 4 — audited as Term 0 was (see me-term0.js).
 *
 * Outcomes map to ABET's seven student outcomes and the NCEES FE Mechanical
 * specification ("FE-ME n.X"). Outside graders: NASA's NPARC validation
 * archive and review criteria; Wokwi; the Modern Robotics library; XFOIL;
 * Unified Engineering and 2.60J problems with solutions; published property
 * data. Evidence in docs/me-term4-audit.md.
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

export const ME_TERM4 = {
  'computational-mechanics-fea-cfd': {
    doc: 'docs/me-term4-audit.md',
    outcomes: [
      o('mecae501.equations', 'Pose a field problem: governing equations, boundary conditions and discretisation.', ['FE-ME 1.E', 'ABET 1'], ['pde.classify', 'pde.cfl'], [1], ['final']),
      o('mecae501.weak', 'Derive finite elements from weighted residuals and weak forms.', ['FE-ME 1.E'], ['cae.bar'], [2], ['final']),
      o('mecae501.assembly', 'Formulate elements, assemble them, apply constraints and solve.', ['FE-ME 1.D', 'FE-ME 1.E'], ['cae.truss2', 'la.solve'], [3], ['applied']),
      o('mecae501.convergence', 'Converge a structural mesh and quantify discretisation error.', ['FE-ME 1.E', 'ABET 6'], ['cae.richardson', 'cae.bar'], [4], ['applied']),
      o('mecae501.fv', 'Discretise conservation and transport by finite volumes and differences.', ['FE-ME 10.D', 'FE-ME 12.A'], ['cae.convdiff', 'cae.fdgrid'], [5], ['final']),
      o('mecae501.stability', 'Couple pressure and velocity, model turbulence, and keep schemes stable.', ['FE-ME 1.E'], ['pde.cfl', 'na.order'], [6], ['final']),
      o('mecae501.vv', 'Verify, validate and quantify uncertainty to judge a simulation\'s credibility.', ['ABET 4', 'ABET 6'], ['cae.richardson'], [7], ['applied', 'final']),
      o('mecae501.defend', 'Defend linked FEA and CFD studies with solver independence, conservation checks and decision limits.', ['ABET 1', 'ABET 3'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued course starts too far on', why: '2.094 is a graduate course on nonlinear and large-deformation analysis, and has no finite-volume or CFD content.', fix: 'Units 1–3 read 2.092 (the first course), Units 5–6 read 2.29 (numerical fluid mechanics), and 2.094 stays for convergence and coupled problems.' },
      { what: 'Projects need a solver', why: 'The course\'s projects used ADINA, a commercial code.', fix: 'Use an open-source solver such as FEniCS, and verify it on the benchmark first.', url: 'https://fenicsproject.org/' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Five new skills (bar elements, the direct stiffness method, Richardson extrapolation and the GCI, convection–diffusion, finite-difference plates), with the Maths degree\'s CFL, PDE and order-of-accuracy skills.' },
    ],
    benchmarks: [
      { id: 'mecae501.nparc', name: 'An NPARC validation case reproduced', how: 'Reproduce one case from NASA\'s NPARC validation archive; record 1 if your mesh-converged result falls within the experimental uncertainty.', max: 1, url: 'https://www.grc.nasa.gov/www/wind/valid/archive.html' },
    ],
    rubrics: {
      applied: applied('A benchmark structure solved on at least three meshes and compared with an analytical result.', 'Discretisation error estimated by Richardson extrapolation and the GCI, and modelling error separated from it by the analytical comparison.', 'Element type, boundary conditions, material model and load idealisation stated, with how each could bias the answer.'),
      final: finalShow('Linked FEA and CFD studies with solver independence, conservation checks, validation data, uncertainty and decision limits.', 'Each conclusion traced to a converged result, a validation comparison and an uncertainty.', 'The studies defended orally, including where the models stop being credible.'),
    },
  },

  'mechatronics-embedded-control': {
    doc: 'docs/me-term4-audit.md',
    outcomes: [
      o('memech501.architecture', 'Define a mechatronic architecture, its interfaces and its power and thermal budget.', ['ABET 2', 'FE-ME 14.L'], ['pwr.thermal'], [1], ['applied']),
      o('memech501.actuators', 'Match motors, drives and transmissions to a load.', ['FE-ME 5.D', 'FE-ME 14.H'], ['mech.gearratio', 'mech.rms', 'pwr.dcmotor'], [2], ['applied']),
      o('memech501.mcu', 'Use microcontroller timers, interrupts and peripherals.', ['FE-ME 13.A'], ['emb.timer', 'mech.encoder', 'fpga.fixed'], [3], ['applied']),
      o('memech501.prototype', 'Build and verify a closed-loop actuator in simulation.', ['FE-ME 13.B', 'ABET 6'], ['ctl.pi', 'mech.ripple'], [4], ['applied']),
      o('memech501.realtime', 'Meet real-time deadlines: scheduling, sampling, latency and jitter.', ['FE-ME 13.B'], ['emb.rta', 'ctl.discrete'], [5], ['final']),
      o('memech501.fsm', 'Design state machines, communications and diagnostics.', ['ABET 2'], ['dig.fsm'], [6], ['final']),
      o('memech501.faults', 'Handle faults with watchdogs, safe states and hardware-in-the-loop tests.', ['ABET 4', 'FE-ME 14.K'], ['sys.reliability', 'cap.fta'], [7], ['final']),
      o('memech501.release', 'Release and defend an integrated mechatronic system with interface contracts, regression tests and a hazard log.', ['ABET 2', 'ABET 3', 'ABET 5'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued course posts only labs', why: '2.737 on OCW has lab handouts built around LabVIEW and the myRIO, both paid.', fix: 'Units read Valvano\'s free *Embedded Systems* e-book, 2.72 on actuators and *Feedback Systems* on implementation, keeping two 2.737 labs.' },
      { what: 'No power budgets or watchdogs', why: 'None of the free sources teaches power budgets or watchdog design (Units 1 and 7).', fix: 'Practice covers thermal budgets, reliability and fault trees; the hazard log is assessed in the final project.' },
      { what: 'Practice had no checks', why: 'The course borrowed the Robotics track\'s PWM, driver, encoder, MCU and timing questions.', fix: 'Practice now uses the EE degree\'s embedded and power skills plus four new ones (gear-ratio matching, encoders, PWM ripple, RMS torque), each checked independently.' },
    ],
    benchmarks: [
      { id: 'memech501.sim', name: 'Your firmware on Wokwi\'s simulated microcontroller', how: 'Run your regression tests against the firmware in Wokwi; record the percentage that pass.', max: 100, url: 'https://docs.wokwi.com/' },
    ],
    rubrics: {
      applied: applied('A simulated position, speed or temperature controller implemented, with tracking, saturation, timing jitter and fault recovery measured.', 'Measured timing checked against a schedulability analysis, and controller behaviour against a continuous-time model.', 'Sample rate, quantisation, actuator limits and fault assumptions stated.'),
      final: finalShow('An integrated mechatronic system released with interface contracts, code, controller evidence, power budget, hazard log and regression tests.', 'Every interface and requirement traced to a passing regression test.', 'The system defended under questions, including what happens on a sensor fault, a missed deadline or a brown-out.'),
    },
  },

  'integrated-mechanical-systems-laboratory': {
    doc: 'docs/me-term4-audit.md',
    outcomes: [
      o('melab501.plan', 'Plan verification with hazards, configuration control and traceability.', ['ABET 4', 'ABET 6'], [], [1], ['final']),
      o('melab501.structure', 'Run a load–strain–deflection experiment and compare it with beam theory.', ['FE-ME 8.D', 'FE-ME 13.A'], ['sol.deflect', 'daq.bridge'], [2], ['final']),
      o('melab501.vibration', 'Measure modes and frequency response, and estimate damping.', ['FE-ME 7.K', 'FE-ME 13.C'], ['exp.halfpower', 'exp.fft', 'vib.forced'], [3], ['final']),
      o('melab501.thermal', 'Identify a thermal or flow parameter from data and challenge it on held-out conditions.', ['FE-ME 12.D', 'ABET 6'], ['ht.lumped', 'lab.fit', 'exp.budget'], [4], ['applied']),
      o('melab501.control', 'Run a closed-loop experiment and compare it with its model.', ['FE-ME 13.B', 'FE-ME 13.C'], ['ctl.pi', 'ctl.margin'], [5], ['final']),
      o('melab501.sync', 'Synchronise multiple sensors and protect data integrity.', ['FE-ME 13.A', 'FE-ME 13.D'], ['el.alias', 'daq.filter'], [6], ['final']),
      o('melab501.faults', 'Inject faults, find root causes and verify corrective actions.', ['ABET 6'], ['cap.fta'], [7], ['final']),
      o('melab501.campaign', 'Execute and defend a multidisciplinary verification campaign.', ['ABET 3', 'ABET 6'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at 2.672 as a whole.', fix: 'Units link 2.672\'s lab manual and individual experiments, DoITPoMS on beam bending, and 2.737\'s analogue-feedback lab.' },
      { what: 'Experiments need equipment', why: 'Every unit is a bench experiment.', fix: 'Where no rig is available, use the 2.672 handouts\' published data or honest synthetic data, and say which.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Practice draws on the beam, vibration, heat-transfer, control and data-acquisition skills, plus two new ones: half-power damping and reading a spectrum.' },
    ],
    benchmarks: [
      { id: 'melab501.property', name: 'Your identified property against published data', how: 'Compare your identified thermal property with the value in Lienhard\'s property tables; record 1 if it lies within your stated uncertainty.', max: 1, url: 'https://ahtt.mit.edu/wp-content/uploads/2024/04/AHTTv600.pdf#page=745' },
    ],
    rubrics: {
      applied: applied('A thermal or flow parameter identified from a controlled dataset, with calibration uncertainty propagated.', 'The identified model challenged on held-out conditions it was not fitted to, and compared with a published value.', 'Calibration chain, sensor dynamics and model assumptions stated in an uncertainty budget.'),
      final: finalShow('A multidisciplinary verification campaign executed or simulated, with raw evidence, anomalies, corrections and remaining risk.', 'Each requirement traced to a test, its raw data and a pass or fail.', 'The campaign defended under questions, including anomalies not yet explained.'),
    },
  },

  'capstone-design-1-needs-requirements-architecture-prototype': {
    doc: 'docs/me-term4-audit.md',
    outcomes: [
      o('mecap501.need', 'Identify stakeholders, needs and measures of success.', ['ABET 2', 'ABET 3'], [], [1], ['applied']),
      o('mecap501.requirements', 'Write testable requirements with interfaces, standards and traceability.', ['ABET 2'], [], [2], ['applied']),
      o('mecap501.architecture', 'Generate architectures and choose between them by trade study.', ['ABET 2'], ['des.pugh', 'econ.npv'], [3], ['applied']),
      o('mecap501.pdr', 'Hold a preliminary design review backed by first-principles models.', ['ABET 1', 'ABET 3'], ['sys.reliability'], [4], ['applied']),
      o('mecap501.hazards', 'Analyse hazards, ethics, accessibility and misuse.', ['ABET 4', 'FE-ME 3.A', 'FE-ME 3.B'], ['cap.fta'], [5], ['final']),
      o('mecap501.plan', 'Plan the project: schedule, budget, configuration and team practice.', ['ABET 5', 'FE-ME 4.C'], ['cap.cpm', 'econ.breakeven'], [6], ['final']),
      o('mecap501.prototype', 'Retire risk with critical experiments and prototypes.', ['ABET 6'], ['rel.bound'], [7], ['final']),
      o('mecap501.cdr', 'Pass a critical design review with a safe prototype, verified interfaces and an open-risk register.', ['ABET 2', 'ABET 3', 'ABET 5'], ['econ.risk'], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued course is a business-school course', why: '15.783J (2006) teaches needs, concepts and prototyping, but not requirements, reviews, configuration or safety.', fix: 'Units 2, 4, 6 and 8 read NASA\'s Systems Engineering Handbook by section, and Unit 5 reads MIT 16.63J on hazard analysis.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Practice covers decision matrices, net present value, reliability, fault trees, critical-path scheduling, break-even and confidence bounds on test data.' },
    ],
    benchmarks: [
      { id: 'mecap501.nasa', name: 'Your critical design review meets NASA\'s review criteria', how: 'Score the review package against the handbook\'s technical-review criteria; record 1 when every criterion is met or explicitly waived.', max: 1, url: 'https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf#page=165' },
    ],
    rubrics: {
      applied: applied('A preliminary design review held with stakeholder evidence, requirements, architecture, alternatives, first-principles models, risks and closure actions.', 'Key models checked by a second method or a quick experiment, and every requirement checked for testability.', 'Assumptions, open risks and their retirement plans recorded.'),
      final: finalShow('A critical design review passed with a safe prototype or digital twin, verified interfaces, a manufacturing and test plan, budget, ethics case and open-risk register.', 'Every requirement traced to the design, a verification method and its status.', 'The design defended under reviewers\' questions, including the riskiest remaining assumption.'),
    },
  },

  'robot-mechanics-kinematics-motion-planning': {
    doc: 'docs/me-term4-audit.md',
    outcomes: [
      o('merob501.transforms', 'Describe configurations with rigid transforms, frames and twists.', ['FE-ME 1.D', 'FE-ME 7.F'], ['rob.rodrigues', 'gr.transform'], [1], ['final']),
      o('merob501.fk', 'Compute forward kinematics and map the workspace.', ['FE-ME 7.G'], ['rob.fk2'], [2], ['final']),
      o('merob501.jacobian', 'Use Jacobians for differential motion and to find singularities.', ['FE-ME 7.F'], ['rob.jacobian'], [3], ['final']),
      o('merob501.ik', 'Implement and validate an inverse-kinematics solver.', ['ABET 6'], ['rob.ik2', 'm.newton'], [4], ['applied']),
      o('merob501.dynamics', 'Model robot dynamics, holding torques and actuator limits.', ['FE-ME 7.H'], ['rob.statics', 'mech.gearratio'], [5], ['final']),
      o('merob501.trajectory', 'Generate and track trajectories.', ['FE-ME 7.A', 'FE-ME 13.B'], ['rob.traj', 'rob.diffdrive'], [6], ['final']),
      o('merob501.planning', 'Plan collision-free motion in configuration space.', ['ABET 1'], ['plan.grid'], [7], ['final']),
      o('merob501.mission', 'Complete and defend a planned robot mission with kinematics, dynamics and limit evidence.', ['ABET 1', 'ABET 3'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at the *Modern Robotics* site as a whole.', fix: 'Each unit now links its chapter of the free preprint, by page.' },
      { what: 'Practice had no checks', why: 'The course borrowed the Robotics track\'s rotation, kinematics, Jacobian and drive questions.', fix: 'Practice now uses the EE degree\'s kinematics, inverse-kinematics, drive and planning skills plus four new ones (Rodrigues rotations, Jacobians, holding torques, polynomial trajectories), each checked independently.' },
    ],
    benchmarks: [
      { id: 'merob501.mrlib', name: 'Your kinematics against the Modern Robotics library', how: 'Check your forward kinematics, Jacobian and inverse kinematics on ten test poses against the library\'s functions; record the percentage that agree to 10⁻⁶.', max: 100, url: 'https://github.com/NxRLab/ModernRobotics' },
    ],
    rubrics: {
      applied: applied('An inverse-kinematics solver implemented and tested across reachable, singular, redundant and unreachable targets.', 'Every solution checked by forward kinematics (residual below a stated tolerance) and against a reference library.', 'Convergence criteria, joint limits, and the handling of unreachable and singular targets stated.'),
      final: finalShow('A simulated manipulation or mobile-robot mission with kinematics, dynamics, collision checks, planning and limit evidence.', 'Each mission requirement traced to a simulation result.', 'The mission defended orally, including behaviour near singularities and actuator limits.'),
    },
  },

  'aerodynamics-compressible-flow': {
    doc: 'docs/me-term4-audit.md',
    outcomes: [
      o('meaero501.forces', 'Use aerodynamic coefficients, similarity and the standard atmosphere.', ['FE-ME 10.E'], ['fl.similarity', 'aero.isa'], [1], ['final']),
      o('meaero501.potential', 'Explain lift through potential flow and circulation.', ['FE-ME 10.E'], ['mv.line'], [2], ['final']),
      o('meaero501.wings', 'Predict airfoil and finite-wing lift, induced drag and stall.', ['FE-ME 10.E'], ['aero.liftline', 'aero.polar'], [3], ['applied', 'final']),
      o('meaero501.data', 'Analyse airfoil data and validate lift and drag models.', ['ABET 6'], ['lab.fit', 'aero.polar'], [4], ['applied']),
      o('meaero501.viscous', 'Estimate boundary layers, separation and viscous drag.', ['FE-ME 10.E'], ['fl.plate'], [5], ['final']),
      o('meaero501.compressible', 'Use isentropic relations, Mach waves and stagnation properties.', ['FE-ME 10.F'], ['aero.isentropic', 'aero.nozzle'], [6], ['final']),
      o('meaero501.shocks', 'Analyse normal and oblique shocks, expansions and nozzles.', ['FE-ME 10.F'], ['aero.shock', 'aero.oblique'], [7], ['final']),
      o('meaero501.envelope', 'Defend an aerodynamic design across low-speed, stall, compressible and off-design conditions.', ['ABET 1', 'ABET 2'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at 16.100 as a whole.', fix: 'Units now link 16.100\'s lecture and study notes.' },
      { what: '16.100 (2005) barely treats shocks and nozzles', why: 'Its lectures derive the compressible equations but do not develop isentropic flow, shocks or expansions (Units 6–7).', fix: 'Those units read NASA Glenn\'s Beginner\'s Guide to Aeronautics.' },
      { what: 'No exams with solutions', why: '16.100 posts take-home exams without answers.', fix: 'The benchmarks use Unified Engineering\'s fluids quizzes, which have solutions, and XFOIL as an outside check on airfoil predictions.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Seven new skills (standard atmosphere, lifting line, isentropic flow, normal and oblique shocks, choked flow, drag polars), each checked independently.' },
    ],
    benchmarks: [
      { id: 'meaero501.unified', name: 'MIT Unified Engineering fluids quizzes, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/16-01-unified-engineering-i-ii-iii-iv-fall-2005-spring-2006/pages/exams/` },
      { id: 'meaero501.xfoil', name: 'Your airfoil predictions against XFOIL', how: 'Run XFOIL on your airfoil below stall; record the percentage of your lift and drag predictions within 10% of it.', max: 100, url: 'https://web.mit.edu/drela/Public/web/xfoil/' },
    ],
    rubrics: {
      applied: applied('An open airfoil dataset or verified CFD case analysed, with lift and drag models reconciled.', 'Models checked against XFOIL or published wind-tunnel data, with Reynolds- and Mach-number effects separated.', 'Reynolds, Mach, stall and measurement-uncertainty limits identified.'),
      final: finalExam('the cumulative exam (Unified Engineering fluids quizzes will do)', 'An aerodynamic design defended across low-speed, stall, compressible and off-design conditions.', 'Stall margin, Mach limits and structural load factors stated.'),
    },
  },

  'advanced-energy-conversion-turbomachinery-combustion-fuel-cells': {
    doc: 'docs/me-term4-audit.md',
    outcomes: [
      o('meen501.exergy', 'Compare energy resources and conversion paths by exergy and system metrics.', ['FE-ME 3.D', 'FE-ME 11.C'], ['th.sgen', 'pt.carnot'], [1], ['final']),
      o('meen501.turbo', 'Analyse thermo-mechanical conversion and turbomachinery.', ['FE-ME 10.G', 'FE-ME 10.I', 'FE-ME 11.F'], ['en.euler', 'en.affinity', 'th.brayton'], [2], ['final']),
      o('meen501.combustion', 'Analyse combustion, flame temperature and emissions.', ['FE-ME 11.K'], ['th.afr', 'en.flame'], [3], ['final']),
      o('meen501.audit', 'Model and audit two competing conversion pathways.', ['ABET 6', 'FE-ME 4.C'], ['econ.npv'], [4], ['applied']),
      o('meen501.electrochem', 'Analyse fuel cells, electrolysis and hydrogen.', ['FE-ME 11.C'], ['en.fuelcell', 'mat.nernst'], [5], ['final']),
      o('meen501.batteries', 'Size batteries and manage their degradation and heat.', ['FE-ME 12.D'], ['en.battery', 'ht.lumped'], [6], ['final']),
      o('meen501.renewables', 'Estimate solar, wind and geothermal conversion.', ['FE-ME 11.F'], ['en.wind', 'en.pv'], [7], ['final']),
      o('meen501.portfolio', 'Defend a conversion-and-storage portfolio under realistic constraints.', ['ABET 1', 'ABET 4'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at 2.60J as a whole.', fix: 'Each unit now links the 2.60J lectures that teach it.' },
      { what: 'Little turbomachinery', why: '2.60J treats thermo-mechanical conversion but not velocity triangles or pump similarity (Unit 2).', fix: 'Read the Euler turbine equation in MIT\'s Unified Thermodynamics notes; practice adds impeller and affinity-law skills.', url: 'https://web.mit.edu/16.unified/www/FALL/thermodynamics/notes/node91.html' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Seven new energy skills (Euler head, affinity laws, flame temperature, fuel cells, battery packs, the Betz limit, a day of solar), each checked independently.' },
    ],
    benchmarks: [
      { id: 'meen501.hw', name: 'MIT 2.60J homework, against the solutions', how: 'Work each set; record your average.', max: 100, url: `${OCW}/2-60j-fundamentals-of-advanced-energy-conversion-spring-2020/pages/assignments/` },
    ],
    rubrics: {
      applied: applied('Two competing conversion pathways for one service modelled, comparing exergy loss, efficiency, material intensity, cost, emissions and sensitivity.', 'Each pathway\'s energy balance closed and checked against published plant or device data.', 'Boundaries, emission factors, discount rate and resource assumptions stated, with a sensitivity study.'),
      final: finalShow('A conversion-and-storage portfolio that meets a realistic demand profile.', 'Each portfolio claim traced to a model result and a data source.', 'The portfolio defended orally under resource, degradation, safety and environmental constraints.'),
    },
  },
};
