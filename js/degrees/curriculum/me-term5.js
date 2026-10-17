/**
 * Mechanical Engineering, Term 5 — audited as Term 0 was (see me-term0.js).
 *
 * Outcomes map to ABET's seven student outcomes and the NCEES FE Mechanical
 * specification ("FE-ME n.X"). Outside graders: 22.081J, 22.38 and 16.50
 * problems with solutions; NSPE's Board of Ethical Review; NASA's review
 * criteria; public datasets scored with evo. Evidence in
 * docs/me-term5-audit.md.
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

export const ME_TERM5 = {
  'thermal-fluid-systems-energy-conversion': {
    doc: 'docs/me-term5-audit.md',
    outcomes: [
      o('meen601.requirements', 'Turn loads and requirements into an architecture and operating envelope.', ['ABET 2'], [], [1], ['final']),
      o('meen601.machines', 'Select pumps, compressors and turbines from their maps and similarity laws.', ['FE-ME 10.G', 'FE-ME 10.H', 'FE-ME 10.I'], ['fl.pumpop', 'en.affinity', 'en.euler'], [2], ['applied']),
      o('meen601.networks', 'Size piping networks and heat exchangers, and integrate heat.', ['FE-ME 10.D', 'FE-ME 12.E'], ['fl.pipe', 'en.lmtd', 'ht.hx'], [3], ['applied']),
      o('meen601.cycle', 'Build an integrated cycle model and run a design trade study.', ['FE-ME 11.F', 'ABET 6'], ['th.brayton', 'th.turbine'], [4], ['applied']),
      o('meen601.offdesign', 'Predict off-design performance, transients and control.', ['FE-ME 13.C'], ['ht.lumped', 'ctl.pi'], [5], ['final']),
      o('meen601.economics', 'Weigh efficiency, exergy, economics and emissions.', ['FE-ME 4.A', 'FE-ME 4.C', 'FE-ME 11.C'], ['en.lcoe', 'th.sgen', 'econ.npv'], [6], ['final']),
      o('meen601.optimize', 'Optimise a design under uncertainty, maintenance and safety constraints.', ['FE-ME 1.E', 'ABET 1'], ['en.insulation', 'mv.lagrange'], [7], ['final']),
      o('meen601.release', 'Defend a thermal-fluid system release with sizing, controls, economics, hazards and a verification plan.', ['ABET 2', 'ABET 3', 'ABET 4'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued course cannot be linked by unit', why: 'NPTEL\'s Design and Optimization of Energy Systems is a video course with no per-topic pages.', fix: 'Unit 1 links its outline; the other units read MIT 16.50 on component maps and matching, Lienhard on heat exchangers, MIT\'s Unified notes on combined cycles, 22.081J on economics and SciPy on optimisation.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Three new skills (LMTD sizing, economic insulation thickness, levelised cost) join the fluids, heat-transfer, thermodynamics and economics skills.' },
    ],
    benchmarks: [
      { id: 'meen601.exam', name: 'MIT 22.081J take-home exam 2, against the solutions', how: 'Work it under time; record your percentage.', max: 100, url: `${OCW}/22-081j-introduction-to-sustainable-energy-fall-2010/pages/assignments-and-exams/` },
    ],
    rubrics: {
      applied: applied('An integrated cycle or thermal-management model built and optimised, with component maps, balances, costs and off-design cases.', 'Mass and energy balances closed for every component, the optimum confirmed by a second search method, and off-design points checked against component maps.', 'Property models, component efficiencies, cost data and constraints stated, with a sensitivity study.'),
      final: finalShow('A complete system release: architecture, sizing, controls, economics, emissions, uncertainty, hazards and verification plan.', 'Each requirement traced to a sizing calculation and a planned verification.', 'The release defended orally, including the operating envelope and what happens at its edges.'),
    },
  },

  'failure-reliability-safety-lifecycle-engineering': {
    doc: 'docs/me-term5-audit.md',
    outcomes: [
      o('merel601.rootcause', 'Weigh failure evidence and competing hypotheses to find root causes.', ['FE-ME 9.J', 'ABET 4'], [], [1], ['final']),
      o('merel601.mechanisms', 'Predict fatigue, fracture, corrosion and creep life.', ['FE-ME 9.I', 'FE-ME 9.J'], ['rel.miner', 'rel.paris', 'mat.corrosion'], [2], ['final']),
      o('merel601.distributions', 'Fit reliability distributions to censored data, with confidence.', ['FE-ME 2.A', 'FE-ME 14.K'], ['rel.weibull', 'rel.censored', 'rel.bound'], [3], ['applied', 'final']),
      o('merel601.fta', 'Assess risk with FMEA and fault trees.', ['FE-ME 14.K', 'ABET 4'], ['cap.fta'], [4], ['applied']),
      o('merel601.assurance', 'Design reliability in: derating, redundancy and fail-safety.', ['FE-ME 14.K'], ['sys.reliability', 'rel.interference'], [5], ['applied']),
      o('merel601.maintain', 'Plan maintainability, inspection and condition monitoring.', ['FE-ME 14.K'], ['rel.availability'], [6], ['final']),
      o('merel601.lifecycle', 'Manage the life cycle: recalls, incident response and learning from field data.', ['ABET 4', 'FE-ME 3.B'], ['bay.beta'], [7], ['final']),
      o('merel601.case', 'Defend a lifecycle safety case with failure physics, uncertainty, maintenance and recall criteria.', ['ABET 1', 'ABET 4'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at 22.38 as a whole.', fix: 'Units link 22.38\'s notes on fault trees, redundancy and Bayesian updating, the NIST e-Handbook\'s reliability chapter, 16.63J, DoITPoMS and Google\'s incident chapter.' },
      { what: '22.38 teaches probability, not failure physics', why: 'Fatigue, fracture, corrosion and creep (Unit 2) are not in it.', fix: 'Unit 2 reads DoITPoMS, with Miner\'s rule and Paris\'s law in practice.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Six new reliability skills (Weibull life, Miner\'s rule, Paris crack growth, availability, censored estimates, stress–strength interference) join fault trees and Bayesian updating.' },
    ],
    benchmarks: [
      { id: 'merel601.psets', name: 'MIT 22.38 problem sets 1–2, against the solutions', how: 'Work them; record your average.', max: 100, url: `${OCW}/22-38-probability-and-its-applications-to-reliability-quality-control-and-risk-assessment-fall-2005/pages/assignments/` },
    ],
    rubrics: {
      applied: applied('An FMEA and a quantitative fault tree for a mechanical subsystem, with top risks tied to controls and verification evidence.', 'The top-event probability checked by a second method (cut sets or enumeration), and failure rates checked against field or handbook data.', 'Independence assumptions, common-cause failures and data sources stated.'),
      final: finalShow('A lifecycle safety case for an incident-prone product: failure physics, uncertainty, maintenance, residual risk and recall criteria.', 'Each hazard traced to its cause, its control and the evidence that the control works.', 'The case defended orally, including when the product should be recalled.'),
    },
  },

  'engineering-practice-ethics-economics-communication-leadership': {
    doc: 'docs/me-term5-audit.md',
    outcomes: [
      o('mepro601.duty', 'Apply professional duties, codes and standards, and know the limits of licensure.', ['FE-ME 3.A', 'ABET 4'], [], [1], ['applied']),
      o('mepro601.stakeholders', 'Identify who a decision affects, with attention to justice, accessibility and consent.', ['FE-ME 3.B', 'FE-ME 3.D', 'ABET 4'], [], [2], ['applied']),
      o('mepro601.hazard', 'Analyse hazards under uncertainty, and know when and how to escalate.', ['FE-ME 3.B', 'ABET 4'], ['rel.interference'], [3], ['applied']),
      o('mepro601.memo', 'Write a decision memo under conflicting incentives.', ['ABET 3', 'ABET 4'], ['tw.voice', 'tw.lists'], [4], ['applied']),
      o('mepro601.economy', 'Compare alternatives by the time value of money and life-cycle cost.', ['FE-ME 4.A', 'FE-ME 4.B', 'FE-ME 4.C'], ['econ.annuity', 'econ.irr', 'econ.eaw', 'econ.npv'], [5], ['applied', 'final']),
      o('mepro601.teams', 'Plan projects and lead teams through conflict and negotiation.', ['ABET 5'], ['cap.cpm'], [6], ['final']),
      o('mepro601.communicate', 'Communicate in reports, presentations and to the public.', ['ABET 3'], ['tw.markdown'], [7], ['final']),
      o('mepro601.recommend', 'Present and defend a deploy, redesign or stop recommendation to a mixed panel.', ['ABET 3', 'ABET 4'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued course\'s readings are not free', why: 'ESD.932 posts assignments; its readings are mostly in paid books.', fix: 'Units read the NSPE code, *Design Justice*, the NBS Hyatt Regency investigation, OpenStax on finance and negotiation, and the Writing Guide; ESD.932\'s assignments stay for the final.' },
      { what: 'Ethical judgement cannot be machine-marked', why: 'Units 1–4 and 8 turn on reasoning, not a number.', fix: 'The benchmark compares your conclusions with NSPE Board of Ethical Review decisions; the economics units have checked practice.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Three new engineering-economy skills (capital recovery, IRR, unequal-life comparisons) join NPV, scheduling and the writing skills.' },
    ],
    benchmarks: [
      { id: 'mepro601.ber', name: 'NSPE Board of Ethical Review cases, decided before reading the Board', how: 'Decide five cases yourself, then read the Board\'s discussion; record the percentage where your conclusion and main reason match.', max: 100, url: 'https://www.nspe.org/career-growth/ethics/board-ethical-review-cases' },
    ],
    rubrics: {
      applied: applied('A decision memo for a safety–economic conflict: duties, affected groups, quantified alternatives, dissent and escalation routes.', 'The economics checked a second way (IRR against NPV, or a sensitivity sweep), and the ethical analysis checked against the NSPE code and a comparable Board of Ethical Review case.', 'Uncertainties, the discount rate and the values at stake stated plainly.'),
      final: finalShow('A deploy, redesign or stop recommendation with evidence, economics, ethics and uncertainty.', 'Each claim traced to evidence, and each affected group to how the recommendation treats it.', 'The recommendation defended to a mixed technical and public panel, including the strongest case against it.'),
    },
  },

  'capstone-design-2-build-verify-validate-defend': {
    doc: 'docs/me-term5-audit.md',
    outcomes: [
      o('mecap602.baseline', 'Freeze a design baseline with controlled interfaces and readiness criteria.', ['ABET 2'], [], [1], ['applied']),
      o('mecap602.build', 'Implement, procure, manufacture and integrate the system.', ['ABET 5', 'FE-ME 14.J'], ['cap.cpm', 'des.stack'], [2], ['applied']),
      o('mecap602.tests', 'Write test procedures and fixtures with traceability and data integrity.', ['ABET 6'], ['exp.budget', 'cap.successrun'], [3], ['applied']),
      o('mecap602.trr', 'Pass a test-readiness review and run the critical verification.', ['ABET 3', 'ABET 6'], ['st.ci', 'lab.chi2'], [4], ['applied']),
      o('mecap602.triage', 'Triage failures to root cause, redesign, and prove the fix by regression.', ['ABET 1', 'ABET 6'], ['cap.fta', 'rel.weibull'], [5], ['applied']),
      o('mecap602.validate', 'Validate with stakeholders, including usability and lifecycle evidence.', ['ABET 2', 'ABET 6'], ['hci.sus'], [6], ['final']),
      o('mecap602.release', 'Release the system with its limitations, maintenance plan and handoff.', ['ABET 3', 'ABET 4'], ['rel.availability'], [7], ['final']),
      o('mecap602.defend', 'Publish, demonstrate and defend the complete system release.', ['ABET 3', 'ABET 5'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued course has no materials', why: 'The OCW page for 2.009 (2021) holds no lectures or handouts.', fix: 'Units read NASA\'s Systems Engineering Handbook by section, MIT 16.842 and 16.63J, and the Writing Guide for the defence.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Practice covers test planning (how many units demonstrate a reliability), uncertainty budgets, confidence intervals, χ² tests, fault trees, Weibull life, scheduling, usability scores and availability.' },
    ],
    benchmarks: [
      { id: 'mecap602.trr', name: 'Your test-readiness review meets NASA\'s review criteria', how: 'Score the review package against the handbook\'s technical-review criteria; record 1 when every criterion is met or explicitly waived.', max: 1, url: 'https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf#page=165' },
    ],
    rubrics: {
      applied: applied('A test-readiness review passed, the highest-risk verification executed, and failures closed with controlled revisions and regression evidence.', 'Each verification result checked against its acceptance criterion with stated uncertainty, and each fix proven by re-running the failed test and its neighbours.', 'Test conditions, sample sizes and the confidence they give stated.'),
      final: finalShow('A complete, reproducible system release: artifacts, requirement coverage, safety case, limitations and lessons learned.', 'Every requirement traced to a verification result, and every limitation to its evidence.', 'The release demonstrated live and defended orally.'),
    },
  },

  'autonomous-machines-perception-estimation-control': {
    doc: 'docs/me-term5-audit.md',
    outcomes: [
      o('meaut601.models', 'Model state, sensors and noise probabilistically, and calibrate sensors.', ['FE-ME 2.A', 'FE-ME 13.D'], ['lab.fit', 'pr.continuous'], [1], ['final']),
      o('meaut601.filters', 'Estimate state with Bayesian and Kalman filters.', ['FE-ME 13.D'], ['auto.kf1d', 'est.kalman', 'bay.normal'], [2], ['applied', 'final']),
      o('meaut601.perception', 'Use camera geometry, and quantify feature uncertainty.', ['FE-ME 13.A'], ['auto.pinhole', 'auto.stereo'], [3], ['final']),
      o('meaut601.localize', 'Build a localisation pipeline and validate it on held-out data.', ['ABET 6'], ['auto.histogram'], [4], ['applied']),
      o('meaut601.mapping', 'Map, associate data and close loops.', ['ABET 1'], ['sig.detect'], [5], ['final']),
      o('meaut601.planning', 'Plan and control under uncertainty.', ['FE-ME 13.B'], ['plan.grid', 'ctl.margin'], [6], ['final']),
      o('meaut601.safety', 'Design safety monitors, recovery and human override.', ['ABET 4'], ['sys.reliability', 'cap.fta'], [7], ['final']),
      o('meaut601.mission', 'Run and defend a reproducible autonomous mission across nominal, degraded and recovery scenarios.', ['ABET 1', 'ABET 3', 'ABET 6'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'The catalogued text covers control, not perception', why: '*Underactuated Robotics* treats estimation and robust control but not cameras, mapping or loop closure (Units 3 and 5).', fix: 'Units read Labbe\'s *Kalman and Bayesian Filters in Python* and Szeliski\'s free *Computer Vision* for those topics.' },
      { what: 'No free, checkable text on SLAM', why: 'Loop closure (Unit 5) is taught mainly in paid books.', fix: 'Practise data association through detection; build loop closure in the project, scored against a public dataset.' },
      { what: 'Practice was borrowed', why: 'The course drew on the Robotics track\'s filter, navigation, camera and control questions, which have no checks.', fix: 'Four new skills (a Kalman filter by hand, camera projection, stereo depth, histogram localisation) join the EE degree\'s estimation, detection and planning skills.' },
    ],
    benchmarks: [
      { id: 'meaut601.evo', name: 'Your localiser on a public dataset, scored with evo', how: 'Run your localiser on a public dataset with ground truth and compute its absolute trajectory error with evo; record 1 if the error stays within your reported uncertainty.', max: 1, url: 'https://github.com/MichaelGrupp/evo' },
    ],
    rubrics: {
      applied: applied('A localisation estimator built and benchmarked against ground truth and sensor dropouts.', 'Errors measured against ground truth on held-out data, and the reported uncertainty checked for calibration (errors inside the stated bounds as often as claimed).', 'Sensor models, noise parameters and the handling of dropouts stated.'),
      final: finalShow('A reproducible autonomous mission run across nominal, hidden, degraded and recovery scenarios, with independent safety monitoring.', 'Each mission requirement traced to logged evidence.', 'The mission defended orally, including what the safety monitor did and why.'),
    },
  },

  'propulsion-flight-systems-design': {
    doc: 'docs/me-term5-audit.md',
    outcomes: [
      o('meprop601.mission', 'Analyse mission performance: thrust, drag, range and climb.', ['ABET 1', 'FE-ME 7.C'], ['prop.breguet', 'aero.polar'], [1], ['final']),
      o('meprop601.efficiency', 'Choose a cycle from its propulsive and thermal efficiency.', ['FE-ME 11.F'], ['th.brayton'], [2], ['final']),
      o('meprop601.components', 'Analyse inlets, compressors, combustors, turbines and nozzles.', ['FE-ME 10.F', 'FE-ME 11.E'], ['aero.isentropic', 'aero.shock', 'en.euler'], [3], ['final']),
      o('meprop601.cycle', 'Match a gas-turbine or electric cycle to a mission and review the design.', ['ABET 2', 'FE-ME 11.F'], ['prop.turbojet', 'en.battery'], [4], ['applied']),
      o('meprop601.rockets', 'Size rocket propulsion and nozzle expansion.', ['FE-ME 10.F'], ['prop.rocket', 'prop.nozzle', 'aero.nozzle'], [5], ['final']),
      o('meprop601.limits', 'Respect thermal, structural, material and cooling limits.', ['FE-ME 8.H', 'FE-ME 12.A'], ['ht.wall', 'sol.vessel'], [6], ['final']),
      o('meprop601.offdesign', 'Assess off-design control, operability, emissions and risk.', ['ABET 4', 'FE-ME 11.K'], ['th.afr'], [7], ['final']),
      o('meprop601.release', 'Defend a flight-propulsion design with mission analysis, limits, controls and verification.', ['ABET 1', 'ABET 3'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at 16.50 as a whole.', fix: 'Each unit now links the 16.50 lectures that teach it, with MIT\'s Unified notes for propulsive efficiency.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Four new skills (the ideal turbojet station by station, the rocket equation, nozzle exhaust velocity, Breguet range) join the aerodynamics, thermodynamics and battery skills.' },
    ],
    benchmarks: [
      { id: 'meprop601.exams', name: 'MIT 16.50 mid-term and final quizzes, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/16-50-introduction-to-propulsion-systems-spring-2012/pages/exams/` },
    ],
    rubrics: {
      applied: applied('A gas-turbine or electric-propulsion cycle built and matched to a stated mission.', 'Thrust, energy and mass closed at every station or component, and off-design points checked against component maps or a second model.', 'Component efficiencies, temperature limits and mission assumptions stated, with sensitivities.'),
      final: finalShow('A flight-propulsion design with mission analysis, component maps, thermal and structural limits, controls, emissions, hazards and verification.', 'Each mission requirement traced to a cycle or component result.', 'The design defended orally, including its most limiting component.'),
    },
  },

  'renewable-energy-thermal-storage-decarbonization': {
    doc: 'docs/me-term5-audit.md',
    outcomes: [
      o('mesus601.resources', 'Characterise demand profiles, weather data and renewable resources.', ['FE-ME 2.A'], ['en.windresource', 'en.pv'], [1], ['final']),
      o('mesus601.conversion', 'Estimate solar, wind, geothermal, waste-heat and electrified conversion.', ['FE-ME 11.F'], ['en.wind', 'en.pv', 'th.cop'], [2], ['final']),
      o('mesus601.storage', 'Size thermal storage, batteries and hydrogen, allowing for degradation.', ['FE-ME 12.D'], ['en.storage', 'en.battery', 'en.fuelcell'], [3], ['applied']),
      o('mesus601.dispatch', 'Size and dispatch a renewable-plus-storage system hour by hour.', ['ABET 2', 'ABET 6'], ['en.lcoe'], [4], ['applied']),
      o('mesus601.demand', 'Electrify heat, buildings, industry and transport, and couple the sectors.', ['FE-ME 11.G', 'FE-ME 11.J'], ['th.cop', 'th.psych'], [5], ['final']),
      o('mesus601.lifecycle', 'Count lifecycle carbon, materials, cost and externalities.', ['FE-ME 3.D', 'FE-ME 4.C'], ['econ.npv', 'en.lcoe'], [6], ['final']),
      o('mesus601.resilience', 'Plan for resilience, uncertainty, policy, justice and transition.', ['ABET 4'], ['rel.availability'], [7], ['final']),
      o('mesus601.plan', 'Present and defend a phased decarbonisation plan with stop conditions.', ['ABET 2', 'ABET 3', 'ABET 4'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'Every unit pointed at 22.081J as a whole.', fix: 'Each unit now links the 22.081J lectures that teach it.' },
      { what: 'The catalogued course is from 2010', why: 'Its solar, wind and battery costs are long out of date.', fix: 'Use its methods, but take costs and performance from current public data, and date every figure.' },
      { what: 'No practice', why: 'The course had no questions.', fix: 'Three new skills (thermal storage, Weibull wind resource, levelised cost) join the Term 4 energy skills.' },
    ],
    benchmarks: [
      { id: 'mesus601.exams', name: 'MIT 22.081J take-home exam 1, against the solutions', how: 'Work it under time; record your percentage.', max: 100, url: `${OCW}/22-081j-introduction-to-sustainable-energy-fall-2010/resources/mit22_081jf10_midterm1_sol/` },
    ],
    rubrics: {
      applied: applied('A renewable-plus-storage system sized and dispatched over an hourly dataset, then stressed against weather, demand, degradation and outage cases.', 'Energy balances closed every hour, and the sizing checked against a simpler annual-average estimate and a second dispatch rule.', 'Data sources, efficiency and degradation assumptions, and cost years stated.'),
      final: finalShow('A phased decarbonisation plan with transparent balances, lifecycle carbon, cost, resilience, uncertainty, distributional effects and stop conditions.', 'Each phase traced to its energy balance, carbon saving and cost.', 'The plan defended publicly, including who bears its costs and when it should stop.'),
    },
  },
};
