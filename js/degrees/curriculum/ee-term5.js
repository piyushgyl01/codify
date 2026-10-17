/**
 * Electrical Engineering, Term 5 — audited as Terms 0–4 were.
 *
 * Outside graders: 6.061 quizzes with solutions, pandapower's reference test
 * cases, the Modern Robotics library, reproduced published results, and
 * outside rebuilds of each release. Evidence in docs/ee-term5-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });
const exam = (source, method, check) => [
  crit('Correctness', `At least 85% on ${source}, marked against the solutions.`, '60–84%.', 'Below 60%.'),
  crit('Method shown', method, 'Method partly shown.', 'Answers only.'),
  crit('Checks', check, 'Some checks.', 'None.'),
  crit('Repair', 'Every missed item reworked from scratch, and the weak objective named.', 'Some reworked.', 'Not reworked.'),
];
const practical = (task, evidence) => [
  crit('Task done', task, 'Mostly done, one requirement missed.', 'Not done.'),
  crit('Evidence', evidence, 'Evidence thin.', 'No evidence.'),
  crit('Independent check', 'Results checked by a second method or tool, and any disagreement explained.', 'Checked loosely.', 'Not checked.'),
  crit('Time and log', 'Finished within the time limit, with a log of decisions and fixes.', 'Over time or no log.', 'Neither.'),
];
const demo = (artifact, limit) => [
  crit('Working demonstration', `${artifact} works live, from a clean start.`, 'Works with help.', 'Does not work.'),
  crit('Limit or fault shown', limit, 'Mentioned, not shown.', 'Hidden.'),
  crit('Evidence at hand', 'Every claim backed by raw evidence shown on request.', 'Some claims backed.', 'None.'),
  crit('Questions', 'Questions answered from the evidence, clearly and within time.', 'Partly.', 'Not answered.'),
];
const defend = (source, transfer, safety) => [
  crit('Cumulative correctness', `At least 85% on ${source}, marked against the solutions or a rubric.`, '60–84%.', 'Below 60%.'),
  crit('Defence and transfer', transfer, 'Partly argued.', 'Not argued.'),
  crit('Units, limits and safety', safety, 'Units checked only.', 'Not checked.'),
  crit('Correction', 'Every lost mark corrected, with the reason it was lost.', 'Some corrected.', 'None.'),
];

const TTW = 'https://book.the-turing-way.org/reproducible-research/reproducible-research';

export const EE_TERM5 = {
  'energy-power-electronics-and-power-systems': {
    doc: 'docs/ee-term5-audit.md',
    outcomes: [
      o('ee306.convert', 'Switch power efficiently with buck, boost and buck-boost converters.', ['FE-ECE 9.E'], ['pwr.buck', 'pwr.boost', 'pwr.buckboost'], [1, 2, 3], ['checkpoint 1']),
      o('ee306.losses', 'Include real losses and control a converter.', ['FE-ECE 9.E', 'FE-ECE 12.B'], ['pwr.thermal', 'ctl.margin'], [4, 5], ['checkpoint 1', 'final']),
      o('ee306.threephase', 'Work in three phases and understand machines.', ['FE-ECE 10.A', 'FE-ECE 10.D'], ['pwr.threephase', 'pwr.dcmotor'], [7, 8], ['checkpoint 2', 'final']),
      o('ee306.network', 'Normalise a network in per unit and solve load flow.', ['FE-ECE 10.B'], ['pwr.fault', 'pwr.dcflow'], [9, 10], ['checkpoint 2', 'final']),
      o('ee306.protect', 'Protect the system against faults.', ['FE-ECE 10.B'], ['pwr.fault', 'pwr.relay'], [12], ['final']),
      o('ee306.storage', 'Integrate storage and renewables, and judge their economics.', ['FE-ECE 10.A', 'FE-ECE 4.A'], ['ckt.pfc', 'econ.npv'], [13], ['final']),
      o('ee306.resilient', 'Design a resilient energy system and demonstrate a disturbance.', ['ABET 2', 'ABET 6'], ['pwr.droop', 'pwr.dcflow'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links; two tools never answered', why: 'The catalogue pointed every unit at 6.622 and 6.061 as wholes; the OpenModelica and LTspice sites did not respond to link checks.', fix: 'Units link 6.622 notes and 6.061 chapters by topic, MacKay on storage, and pandapower for the disturbance study.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track battery, stall and driver questions with no independent check.', fix: 'Practice now includes three-phase power (checked by summing instantaneous phase powers), fault currents (checked in ohms rather than per unit), DC power flow (checked by Gauss–Seidel), relay coordination and droop sharing (checked by simulating governors), with the converter skills.' },
    ],
    benchmarks: [
      { id: 'ee306.quizzes', name: 'MIT 6.061 quizzes, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: 'https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/pages/quizzes/' },
    ],
    rubrics: {
      'checkpoint 1': exam('the written converter exam', 'Volt-second and charge balance written for the unseen low-voltage converter before choosing parts.', 'Efficiency and component stresses checked in simulation.'),
      'checkpoint 2': practical('The converter-fed network that violates its limits repaired within the time.', 'Load flow before and after, with every violated limit named.'),
      demonstration: demo('Nominal and disturbance scenarios run live', 'Energy and power balance explained through the disturbance, including where protection acts.'),
      final: defend('the cumulative final', 'Efficiency, loading, protection and resilience claims defended with calculation and simulation.', 'Ratings, fault levels and protection margins checked.'),
    },
  },

  'integrated-systems-verification-lab': {
    doc: 'docs/ee-term5-audit.md',
    outcomes: [
      o('sy401.boundary', 'Define a system boundary and capture the schematic.', ['ABET 2'], [], [1, 2], ['checkpoint 1']),
      o('sy401.layout', 'Design for layout, manufacture and test.', ['ABET 2'], ['ckt.tolerance'], [3, 4, 5], ['checkpoint 1']),
      o('sy401.verify', 'Plan first power and verify digital and analog performance.', ['ABET 6'], ['el.opamp', 'ar.critical', 'lab.propagate'], [7, 8, 9], ['checkpoint 2', 'final']),
      o('sy401.firmware', 'Integrate firmware with hardware and meet timing.', ['FE-ECE 16.C'], ['emb.timer', 'emb.rta'], [10], ['checkpoint 2']),
      o('sy401.faults', 'Inject faults and diagnose from symptom to root cause.', ['ABET 6'], ['ckt.nodal'], [11, 12], ['checkpoint 2', 'demonstration']),
      o('sy401.reliability', 'Test reliability and state confidence bounds.', ['ABET 6'], ['rel.bound', 'sys.reliability'], [13], ['final']),
      o('sy401.release', 'Close verification and defend a reproducible release.', ['ABET 3'], ['lab.chi2'], [14, 15, 16], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at 6.111, 6.101, KiCad and Verilator as wholes; none covers reliability testing or verification closure.', fix: 'Units link KiCad\'s schematic and PCB manuals, 6.111 and 6.101 by topic, 16.842 and 16.63J for verification and fault injection, and NIST\'s reliability chapter.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics and Programming questions (meter, buses, boundaries).', fix: 'Practice now includes reliability confidence bounds (checked against χ² quantiles), with tolerance, timing, verification and fault skills.' },
    ],
    benchmarks: [
      { id: 'sy401.rebuild', name: 'Someone else rebuilds the board and firmware from your release', how: 'Hand over the release only; record 1 if they produce a working unit that passes your test suite.', max: 1, url: TTW },
    ],
    rubrics: {
      'checkpoint 1': [
        crit('Release package', 'Schematic, layout, bill of materials and fabrication files complete and consistent.', 'Minor inconsistencies.', 'Incomplete.'),
        crit('Design for test', 'Test points, fixture plan and a test for every requirement.', 'Partial coverage.', 'None.'),
        crit('Design for manufacture', 'Footprints, clearances and tolerances checked against the fabricator\'s rules.', 'Partly checked.', 'Not checked.'),
        crit('Blockers closed', 'Every release blocker closed with evidence.', 'Most.', 'Open.'),
      ],
      'checkpoint 2': practical('The seeded fault diagnosed from symptoms to a verified root cause.', 'A diagnosis log: hypothesis, measurement, result, for each step.'),
      demonstration: demo('The full system', 'One fault introduced live and a clean recovery shown.'),
      final: defend('the release defence', 'Every requirement, anomaly and residual risk defended with test evidence.', 'Safety, thermal and electrical limits checked across the tested envelope.'),
    },
  },

  'engineering-leadership-and-deployment': {
    doc: 'docs/ee-term5-audit.md',
    outcomes: [
      o('en401.value', 'Define value in use and estimate unit economics.', ['FE-ECE 4.B'], ['econ.breakeven', 'econ.npv'], [1, 3], ['checkpoint 1']),
      o('en401.team', 'Build team operating rules.', ['ABET 5'], [], [2], ['checkpoint 2']),
      o('en401.manufacture', 'Plan manufacturing and choose an ownership structure.', ['FE-ECE 4.B'], ['econ.breakeven'], [4, 5], ['checkpoint 1']),
      o('en401.operations', 'Design operations, reliability and maintenance.', ['ABET 2'], ['sys.reliability', 'econ.risk'], [7, 8], ['final']),
      o('en401.access', 'Make deployment accessible and govern data and security.', ['ABET 4', 'FE-ECE 14.F'], ['eth.kanon'], [9, 10], ['checkpoint 2', 'final']),
      o('en401.pilot', 'Design a pilot and plan end of life.', ['ABET 2', 'ABET 4'], ['st.power'], [12, 13], ['final']),
      o('en401.case', 'Assemble the deployment case, pitch it, and defend a responsible launch.', ['ABET 3', 'ABET 4'], ['econ.npv'], [14, 15, 16], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No resource for deployment', why: 'The catalogue gave a writing guide, ESD.932 (paid books) and the IEEE code (blocked); nothing on business models, operations, security or incidents.', fix: 'Units read OpenStax Entrepreneurship by section, NIST\'s reliability chapter and Cybersecurity Framework, WCAG 2.2, Google\'s SRE chapter on incidents and the EU life-cycle platform.', url: 'https://openstax.org/books/entrepreneurship/pages/1-introduction' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes break-even volume (checked by stepping profit unit by unit), with present worth, reliability, risk and privacy skills.' },
    ],
    benchmarks: [
      { id: 'en401.operator', name: 'An outside operator accepts the maintenance and shutdown plan', how: 'Give the plan to someone who runs equipment like yours; record 1 if they would accept ownership as written.', max: 1, url: 'https://sre.google/sre-book/managing-incidents/' },
    ],
    rubrics: {
      'checkpoint 1': [
        crit('Recommendation', 'A deploy, pivot or stop recommendation set against the supplied evidence threshold.', 'Recommendation hedged.', 'None.'),
        crit('Unit economics', 'Unit cost, price and break-even computed with their assumptions.', 'Rough figures.', 'Missing.'),
        crit('Evidence threshold', 'Each piece of evidence weighed against the threshold explicitly.', 'Partly.', 'Ignored.'),
        crit('Within the limit', 'Delivered within the time.', 'Over.', 'Unfinished.'),
      ],
      'checkpoint 2': [
        crit('Incident command', 'Roles assigned and decisions logged with times during the simulated incident.', 'Partial log.', 'No log.'),
        crit('Containment', 'Harm contained first, then root cause pursued.', 'Order muddled.', 'Harm not contained.'),
        crit('Public update', 'A public update that is accurate, timely and free of speculation.', 'Late or vague.', 'None.'),
        crit('Team rules applied', 'The team\'s operating rules used and revised after the incident.', 'Mentioned.', 'Ignored.'),
      ],
      demonstration: demo('An eight-minute deployment pitch', 'Questions from operators and the public interest answered without overselling.'),
      final: [
        crit('Dossier', 'Business model, operations, maintenance, security, accessibility and end of life covered with evidence.', 'Gaps.', 'Missing.'),
        crit('Ownership of cost and harm', 'Who pays, who maintains, who is harmed and who can shut it down, all named.', 'Partly named.', 'Not named.'),
        crit('Responsible launch', 'Conditions for launch, pause and shutdown stated and defensible.', 'Vague.', 'None.'),
        crit('Defence', 'Questions answered from the dossier.', 'Partly.', 'Not answered.'),
      ],
    },
  },

  'senior-design-ii-build-and-defend': {
    doc: 'docs/ee-term5-audit.md',
    outcomes: [
      o('sd402.design', 'Rebaseline the mission and close the detailed design.', ['ABET 2'], [], [1, 2], ['checkpoint 1']),
      o('sd402.integrate', 'Build subsystem releases and integrate them by contract.', ['ABET 5'], [], [3, 4], ['checkpoint 1']),
      o('sd402.margin', 'Attack the riskiest margin.', ['ABET 2'], ['ckt.tolerance', 'sys.reliability'], [5], ['checkpoint 1']),
      o('sd402.verify', 'Verify requirements and engineer the fault response.', ['ABET 6'], ['lab.chi2', 'econ.risk'], [7, 8], ['checkpoint 2']),
      o('sd402.validate', 'Prepare and run a field evaluation with users.', ['ABET 6', 'ABET 4'], ['st.power', 'lab.trials'], [9, 10], ['checkpoint 2']),
      o('sd402.close', 'Close the product and document it for whoever continues.', ['ABET 3'], [], [12, 13], ['final']),
      o('sd402.defend', 'Rehearse, demonstrate publicly and defend the release.', ['ABET 3', 'ABET 5'], [], [14, 15, 16], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'The resources teach no build-and-release process', why: '6.111, KiCad, 21W.031 and ESD.932 do not cover integration reviews, verification closure, field evaluation or handover.', fix: 'Units read NASA\'s Systems Engineering Handbook, MIT 16.842 and 16.63J, W3C on involving users and the Turing Way on documentation and releases.' },
    ],
    benchmarks: [
      { id: 'sd402.field', name: 'The field evaluation meets its preregistered success criterion', how: 'Register the criterion before the evaluation; record 1 if the result meets it, honestly reported either way.', max: 1, url: 'https://www.cos.io/initiatives/prereg' },
      { id: 'sd402.archive', name: 'An outside reader reproduces a headline result from the archive', how: 'Record 1 if they reproduce it from the archive alone.', max: 1, url: TTW },
    ],
    rubrics: {
      'checkpoint 1': [
        crit('Integrated alpha', 'The integrated alpha demonstrated against its interface contracts.', 'Partly integrated.', 'Not integrated.'),
        crit('Riskiest margin', 'The riskiest margin measured and shown adequate, or a mitigation in place.', 'Estimated only.', 'Not addressed.'),
        crit('Safety blockers', 'All safety and mission blockers closed with evidence.', 'Most.', 'Open.'),
        crit('Rebaseline', 'Scope and requirements rebaselined with the reasons recorded.', 'Changed silently.', 'Not rebaselined.'),
      ],
      'checkpoint 2': [
        crit('Requirements verified', 'Every requirement verified by test, analysis, inspection or demonstration, with evidence.', 'Most.', 'Few.'),
        crit('Fault response', 'Fault responses engineered and tested.', 'Designed, untested.', 'None.'),
        crit('User evaluation', 'A field evaluation with real users, its method and results reported.', 'Informal.', 'None.'),
        crit('Release decision', 'A release, revise or stop decision received and acted on.', 'Received, not acted on.', 'Not sought.'),
      ],
      demonstration: demo('A live public demonstration with a backup evidence path', 'The backup path ready, and its use (if needed) handled calmly.'),
      final: [
        crit('Complete system defence', 'The complete system defended from requirements to evidence.', 'Gaps.', 'Not defended.'),
        crit('Reproducible archive', 'Design files, code, data and procedures archived so others can reproduce results.', 'Partial archive.', 'None.'),
        crit('Stewardship', 'Post-course stewardship assigned with a handover document.', 'Assigned, undocumented.', 'None.'),
        crit('Honest limits', 'Limitations and unmet requirements stated plainly.', 'Partly.', 'Hidden.'),
      ],
    },
  },

  'computer-architecture-and-accelerator-design': {
    doc: 'docs/ee-term5-audit.md',
    outcomes: [
      o('ca402.profile', 'Profile a workload and specify a microarchitecture for it.', ['FE-ECE 16.A'], ['ar.amdahl', 'ar.amat'], [1, 2], ['checkpoint 1']),
      o('ca402.pipeline', 'Implement pipeline control and design the memory system.', ['FE-ECE 16.A', 'FE-ECE 16.B'], ['ar.pipeline', 'ar.cache', 'ar.vm'], [3, 4], ['checkpoint 1', 'final']),
      o('ca402.extension', 'Define an ISA extension and build its datapath.', ['FE-ECE 16.A'], ['ar.riscv', 'ar.encode', 'fpga.fixed'], [5, 7], ['checkpoint 1', 'final']),
      o('ca402.connect', 'Connect processor and accelerator, and verify the architecture.', ['FE-ECE 16.C'], ['ar.critical', 'os.race'], [8, 9], ['checkpoint 2']),
      o('ca402.optimize', 'Optimise with evidence.', ['FE-ECE 16.A'], ['ar.amdahl', 'par.workspan'], [10], ['checkpoint 2', 'final']),
      o('ca402.privilege', 'Handle faults and privilege boundaries.', ['FE-ECE 16.A', 'FE-ECE 14.F'], ['ar.vm'], [12], ['final']),
      o('ca402.reproduce', 'Reproduce a published idea, extend it and demonstrate the speed-up.', ['ABET 7', 'ABET 6'], ['ar.amdahl'], [13, 14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links; nothing on profiling or reproduction', why: 'The catalogue pointed every unit at 6.004, the RISC-V spec, Verilator and nand2tetris as wholes.', fix: 'Units link 6.004 chapters, both RISC-V specifications, Brendan Gregg on profiling, the Roofline paper and ReScience C.' },
      { what: 'Practice was borrowed', why: 'The course drew on Programming-track FLOPs, memory and quantisation questions.', fix: 'Practice now uses the architecture skills (pipelines, caches, virtual memory, Amdahl\'s law, RISC-V encoding) and fixed-point arithmetic, each with an independent check.' },
    ],
    benchmarks: [
      { id: 'ca402.repro', name: 'Your reproduction matches the published speed-up', how: 'Record 1 if your measured speed-up lies within your stated uncertainty of the paper\'s, or the difference is explained.', max: 1, url: 'https://rescience.github.io/' },
    ],
    rubrics: {
      'checkpoint 1': exam('the architecture review', 'A cycle-accurate design defended against correctness and performance questions.', 'Each claim checked against simulation counts.'),
      'checkpoint 2': practical('The unseen workload run, its bottleneck located and one safe improvement made.', 'Profile data before and after, with the bottleneck\'s share of time.'),
      demonstration: demo('Baseline and extension run on the same workload', 'Where the extension does not help shown and explained.'),
      final: defend('the architecture defence', 'The extension defended with speed-up, area and correctness evidence, and the artefact published.', 'Measurement methodology, variance and fairness of comparison checked.'),
    },
  },

  'wireless-systems-and-information-theory': {
    doc: 'docs/ee-term5-audit.md',
    outcomes: [
      o('wl402.info', 'Measure information and compress a source.', ['FE-ECE 13.D'], ['info.huffman', 'entropy'], [1, 2], ['checkpoint 1']),
      o('wl402.channel', 'Model the channel, know its capacity and detect symbols.', ['FE-ECE 13.D'], ['com.ber', 'sig.detect', 'info.bsc'], [3, 4], ['checkpoint 1', 'final']),
      o('wl402.pulses', 'Shape pulses and use bandpass modulation.', ['FE-ECE 13.A', 'FE-ECE 13.B'], ['sig.fseries', 'dsp.ma'], [5, 7], ['checkpoint 1', 'final']),
      o('wl402.sync', 'Synchronise a receiver.', ['FE-ECE 13.D'], ['cm.dft', 'sig.conv'], [8], ['checkpoint 2']),
      o('wl402.coding', 'Code against errors.', ['FE-ECE 13.D'], ['code.hamming', 'code.bounds'], [9], ['checkpoint 1', 'final']),
      o('wl402.fading', 'Survive fading and share time and frequency.', ['FE-ECE 13.C'], ['com.rayleigh', 'stoch.poisson'], [10, 12], ['checkpoint 2', 'final']),
      o('wl402.system', 'Budget the whole link, build it and show graceful degradation.', ['ABET 2', 'ABET 6'], ['com.friis', 'com.snr'], [13, 14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links; GNU Radio\'s wiki blocks checks', why: 'The catalogue pointed every unit at 6.02, an NPTEL course, GNU Radio and EE261; 6.02 does not cover synchronisation or fading.', fix: 'Units link 6.02 chapters and the free PySDR textbook for synchronisation, fading, coding and link budgets.' },
      { what: 'Practice was borrowed', why: 'The course borrowed one AI-track entropy question.', fix: 'Practice now includes Huffman coding (checked by trying every set of codeword lengths), BSC capacity (checked by maximising mutual information) and Rayleigh-fading error rates (checked by integrating over the fade), with link, noise and coding skills.' },
    ],
    benchmarks: [
      { id: 'wl402.quizzes', name: 'MIT 6.02 quizzes, each answer confirmed by calculation or simulation', how: 'Count an answer right only when an independent calculation or simulation agrees; record the percentage.', max: 100, url: 'https://ocw.mit.edu/courses/6-02-introduction-to-eecs-ii-digital-communication-systems-fall-2012/pages/exams/' },
    ],
    rubrics: {
      'checkpoint 1': practical('A validated baseband link delivered with a traceable error budget.', 'Measured error rate against theory at several SNRs.'),
      'checkpoint 2': practical('Data recovered through the unseen impaired channel.', 'Each impairment (offset, fading, noise) identified and its correction shown.'),
      demonstration: demo('The link across increasing impairment', 'The point of failure predicted from the budget before it is reached.'),
      final: defend('the defence against hidden channel tests', 'The system defended with measured performance and the artefact published.', 'Spectrum limits, power limits and units (dB versus dBm) checked.'),
    },
  },

  'robot-kinematics-planning-and-control': {
    doc: 'docs/ee-term5-audit.md',
    outcomes: [
      o('rb402.geometry', 'Model robot geometry and solve forward kinematics.', ['FE-ECE 1.G'], ['rob.fk2', 'la.inverse'], [1, 2], ['checkpoint 1']),
      o('rb402.ik', 'Solve inverse kinematics.', ['FE-ECE 1.G'], ['rob.ik2'], [3], ['checkpoint 1', 'final']),
      o('rb402.plan', 'Represent the world and search for a path.', ['FE-ECE 17.A'], ['plan.grid'], [4, 5], ['checkpoint 1', 'final']),
      o('rb402.trajectory', 'Plan continuous motion and track a trajectory.', ['FE-ECE 12.D'], ['ctl.sse', 'rob.diffdrive'], [7, 8], ['checkpoint 2', 'final']),
      o('rb402.mission', 'Build a ROS mission that reacts online.', ['ABET 5'], ['emb.rta'], [9, 10], ['checkpoint 2']),
      o('rb402.safety', 'Engineer safety behaviour and evaluate fairly.', ['ABET 4', 'ABET 6'], ['econ.risk', 'lab.chi2'], [12, 13], ['final']),
      o('rb402.autonomy', 'Build an autonomous mission and demonstrate recovery.', ['ABET 6', 'ABET 3'], ['rob.diffdrive', 'plan.grid'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links; no kinematics or planning text', why: 'The catalogue pointed every unit at Webots, ROS 2, Feedback Systems and SciPy as wholes; none teaches kinematics or planning.', fix: 'Units read Lynch and Park\'s free Modern Robotics and LaValle\'s free Planning Algorithms by chapter, with ROS 2, Nav2 and 16.63J.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track rotation, FK, Jacobian, drive and MoveIt questions with no independent check.', fix: 'Practice now includes inverse kinematics (checked by searching joint space), grid path planning (checked by Bellman–Ford) and differential-drive motion (checked by integrating the kinematics), with forward kinematics and control.' },
    ],
    benchmarks: [
      { id: 'rb402.mrlib', name: 'Your kinematics agree with the Modern Robotics library', how: 'Compare your forward and inverse kinematics with the authors\' library on 100 random configurations; record 1 if all agree within 10⁻⁶.', max: 1, url: 'https://github.com/NxRLab/ModernRobotics' },
    ],
    rubrics: {
      'checkpoint 1': practical('Valid missions planned through the hidden worlds.', 'Each planning failure explained (no path, bad map, unreachable pose).'),
      'checkpoint 2': practical('The unseen mission completed among dynamic obstacles within error bounds.', 'Tracking error logged against the bound throughout.'),
      demonstration: demo('All four cases run live', 'State transitions narrated, including at least one recovery.'),
      final: defend('the defence against hidden scenarios', 'The system defended with logged runs and the reproducible world published.', 'Safety stops, speed limits and frame conventions checked.'),
    },
  },

  'smart-grids-and-protection': {
    doc: 'docs/ee-term5-audit.md',
    outcomes: [
      o('sg402.flow', 'Build a network model and solve power flow.', ['FE-ECE 10.B'], ['pwr.dcflow', 'pwr.threephase'], [1, 2], ['checkpoint 1']),
      o('sg402.contingency', 'Test the network against contingencies.', ['FE-ECE 10.B'], ['pwr.dcflow'], [3], ['checkpoint 1', 'final']),
      o('sg402.faults', 'Model faults and coordinate protection.', ['FE-ECE 10.B'], ['pwr.fault', 'pwr.relay'], [4, 5], ['checkpoint 1', 'final']),
      o('sg402.inverters', 'Add inverter resources and schedule energy.', ['FE-ECE 10.A'], ['pwr.droop', 'econ.npv'], [7, 8], ['checkpoint 2', 'final']),
      o('sg402.microgrid', 'Protect a microgrid and measure its resilience.', ['FE-ECE 10.B'], ['pwr.relay', 'sys.reliability'], [9, 10], ['checkpoint 2', 'final']),
      o('sg402.security', 'Secure the control surface and weigh public consequences.', ['FE-ECE 14.F', 'ABET 4'], ['econ.risk'], [12, 13], ['final']),
      o('sg402.resilient', 'Build a resilient microgrid and demonstrate loss and recovery.', ['ABET 6', 'ABET 2'], ['pwr.droop', 'pwr.fault'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'The resources stop before smart grids', why: '6.061 and 6.622 cover machines, networks and converters, but not contingencies, protection coordination, dispatch, microgrids or cybersecurity; OpenModelica never answered.', fix: 'Units add pandapower\'s guides (power flow, short circuit, protection, contingency, OPF), NERC TPL-001, MATPOWER, NIST SP 800-82, the National Academies on resilience and 15.031J.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes DC power flow, fault currents, relay coordination and frequency droop, each checked by a second method or a simulation.' },
    ],
    benchmarks: [
      { id: 'sg402.case', name: 'Your power flow matches a reference solver on a standard test case', how: 'Solve an IEEE test case with your own code; record 1 if every bus voltage agrees with pandapower within 0.1%.', max: 1, url: 'https://pandapower.readthedocs.io/en/latest/networks/power_system_test_cases.html' },
    ],
    rubrics: {
      'checkpoint 1': practical('The network defended under its worst credible contingency.', 'N−1 results tabulated, with the binding limit identified.'),
      'checkpoint 2': practical('The unseen source or load outage stabilised while respecting protection.', 'Frequency, voltage and relay actions logged through the event.'),
      demonstration: demo('A live disturbance sequence', 'Protection and dispatch decisions narrated as they happen.'),
      final: defend('the defence against hidden contingencies', 'The design defended with simulation evidence, and the full model published.', 'Fault levels, protection margins and cybersecurity boundaries checked.'),
    },
  },
};
