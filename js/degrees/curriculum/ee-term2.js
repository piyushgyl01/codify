/**
 * Electrical Engineering, Term 2 — audited as Terms 0–1 were.
 *
 * Outside graders: 18.06SC and 18.03SC exams and 3.091SC's final with
 * solutions; HDLBits and nand2tetris auto-graders; 6.002 quizzes checked in a
 * circuit simulator; a measured reference against its specification.
 * Evidence in docs/ee-term2-audit.md.
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

export const EE_TERM2 = {
  'linear-algebra-and-differential-equations': {
    doc: 'docs/ee-term2-audit.md',
    outcomes: [
      o('em201.systems', 'Solve linear systems and explain what a matrix does to vectors.', ['FE-ECE 1.G'], ['la.solve', 'la.inverse'], [1, 2], ['checkpoint 1']),
      o('em201.subspaces', 'Describe a matrix by its four fundamental subspaces.', ['FE-ECE 1.G'], ['la.rank'], [3, 4], ['checkpoint 1', 'final']),
      o('em201.fit', 'Fit imperfect data and estimate from measurements by least squares.', ['FE-ECE 1.G', 'FE-ECE 2.A'], ['la.ls', 'lab.fit'], [5, 14], ['checkpoint 1', 'final']),
      o('em201.modes', 'Find a system\'s modes from its eigenvalues.', ['FE-ECE 1.G'], ['la.eig2', 'pw.modes'], [7, 15], ['demonstration', 'final']),
      o('em201.odes', 'Solve first- and second-order differential models.', ['FE-ECE 1.F'], ['de.linear1', 'de.oscillator'], [8, 9], ['checkpoint 2', 'final']),
      o('em201.laplace', 'Use Laplace methods for forced systems.', ['FE-ECE 7.C'], ['de.laplace'], [10], ['checkpoint 2', 'final']),
      o('em201.state', 'Write state-space models and judge their stability.', ['FE-ECE 12.C', 'FE-ECE 1.F'], ['de.phase', 'de.equilibria', 'la.eig2'], [12, 13], ['final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at 18.06SC and 18.03SC as wholes.', fix: 'Each unit links the session that teaches it; 18.06SC\'s exams and 18.03SC\'s final, with solutions, serve the checkpoints and final.' },
      { what: 'Thin practice', why: 'The course borrowed three Programming-track matrix questions.', fix: 'Practice now covers elimination, rank, least squares, eigenvalues, first- and second-order ODEs, Laplace transforms and phase portraits.' },
    ],
    benchmarks: [
      { id: 'em201.exam1', name: 'MIT 18.06SC Exam 1, against the solutions', how: 'Sit it closed-notes; record your percentage.', max: 100, url: `${OCW}/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/exam-1/` },
      { id: 'em201.final', name: 'MIT 18.03SC final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/18-03sc-differential-equations-fall-2011/pages/final-exam/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the closed-notes linear-models exam (18.06SC Exam 1 will do)', 'Elimination and subspace arguments written out, with the geometry sketched.', 'Each answer verified by substitution or a quick numerical check.'),
      'checkpoint 2': practical('An unseen coupled dynamic system modelled and solved within the time.', 'One limiting case (no coupling, no damping or long time) checked against the full solution.'),
      demonstration: demo('A two-or-more-state engineering model, from equations to measured behaviour', 'Where the linear model departs from the measurement shown.'),
      final: defend('the cumulative final (the 18.03SC final will do)', 'A map from each method to its later use in signals and control.', 'Stability and units checked for every model.'),
    },
  },

  'circuit-analysis-ii': {
    doc: 'docs/ee-term2-audit.md',
    outcomes: [
      o('ee201.phasor', 'Represent sinusoids as phasors and analyse networks with impedance.', ['FE-ECE 6.E', 'FE-ECE 6.F', 'FE-ECE 6.G'], ['ckt.phasor'], [1, 2], ['checkpoint 1']),
      o('ee201.power', 'Track real, reactive and apparent power, and correct power factor.', ['FE-ECE 10.A'], ['ckt.power', 'ckt.pfc'], [3], ['checkpoint 1', 'final']),
      o('ee201.response', 'Find frequency response, resonance and bandwidth.', ['FE-ECE 7.A', 'FE-ECE 7.B'], ['ckt.bode', 'pe.rlc'], [4, 5], ['checkpoint 1', 'final']),
      o('ee201.filters', 'Design passive filters to a real specification.', ['FE-ECE 8.B'], ['ckt.bode', 'ckt.overshoot'], [7, 13], ['checkpoint 2', 'final']),
      o('ee201.dependent', 'Analyse circuits with dependent sources and as two-ports.', ['FE-ECE 6.D', 'FE-ECE 9.B'], ['ckt.depsource', 'ckt.twoport'], [8, 9], ['final']),
      o('ee201.poles', 'Predict response from poles and zeros.', ['FE-ECE 7.D'], ['de.laplace', 'pe.rlc'], [10], ['checkpoint 2']),
      o('ee201.nonideal', 'Account for non-ideal parts and tolerances, and verify the built network.', ['FE-ECE 9.C', 'ABET 6'], ['ckt.tolerance', 'el.opamp'], [12, 14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'LTspice\'s page did not answer', why: 'analog.com timed out on every link check, so the checkpoint\'s simulator link could not be verified.', fix: 'The checkpoint links CircuitJS1 instead; LTspice remains a course resource.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track questions (decoupling, pull-ups, stall current) with no independent check.', fix: 'Practice now covers phasors, AC power, power-factor correction, filters, resonance, dependent sources, two-ports and tolerance analysis, each checked by simulation or a second method.' },
    ],
    benchmarks: [
      { id: 'ee201.quizzes', name: 'MIT 6.002 Quiz 2 and final (AC parts), each answer confirmed in a simulator', how: 'No solutions are posted: count an answer right only when CircuitJS agrees; record the percentage.', max: 100, url: `${OCW}/6-002-circuits-and-electronics-spring-2007/pages/exams/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the written AC-networks exam', 'Phasor diagrams drawn and impedances combined systematically; the simulated AC fault diagnosed with a log.', 'Power balance and a limiting frequency (DC, very high) checked for each answer.'),
      'checkpoint 2': practical('An unseen second-order network designed and diagnosed within the time.', 'The measured or simulated response overlaid on the predicted Bode plot.'),
      demonstration: demo('A live frequency sweep and transient of the network', 'A component-tolerance fault introduced and its effect on the response explained.'),
      final: defend('the cumulative final (6.002\'s final will do)', 'The network defended from phasor analysis through non-ideal verification.', 'Component ratings, power dissipation and tolerance margins checked.'),
    },
  },

  'digital-logic-and-hardware-description': {
    doc: 'docs/ee-term2-audit.md',
    outcomes: [
      o('ee202.boolean', 'Speak Boolean and design combinational blocks.', ['FE-ECE 15.B', 'FE-ECE 15.C'], ['ar.bool', 'dig.sop'], [1, 2], ['checkpoint 1']),
      o('ee202.minimize', 'Minimise logic with Karnaugh maps.', ['FE-ECE 15.D'], ['dig.sop'], [3], ['checkpoint 1']),
      o('ee202.sequential', 'Store bits and build finite-state machines.', ['FE-ECE 15.E', 'FE-ECE 15.G'], ['dig.fsm'], [4, 5], ['checkpoint 1', 'final']),
      o('ee202.datapath', 'Build and control a datapath for an instruction set.', ['FE-ECE 16.A'], ['ar.riscv', 'ar.encode'], [7, 8], ['checkpoint 2', 'final']),
      o('ee202.assembly', 'Write and run assembly programs.', ['FE-ECE 16.A'], ['ar.riscv'], [9], ['checkpoint 2']),
      o('ee202.memory', 'Organise memory and caches.', ['FE-ECE 16.B'], ['ar.cache', 'ar.amat'], [10], ['final']),
      o('ee202.io', 'Handle the outside world with devices, interrupts and sampling.', ['FE-ECE 16.C'], ['el.alias'], [12], ['final']),
      o('ee202.verify', 'Verify hardware systematically and integrate the system to the pin.', ['FE-ECE 15.H', 'ABET 6'], ['ar.critical', 'ar.pipeline'], [13, 14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at 6.004 and nand2tetris as wholes.', fix: 'Units link 6.004 (Spring 2017) chapters, nand2tetris projects, Karnaugh maps in Lessons in Electric Circuits, and Verilator.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track bit and pull-up questions.', fix: 'Practice now covers Boolean algebra, minimal logic, state machines, RISC-V encoding, caches, critical paths and pipelines.' },
    ],
    benchmarks: [
      { id: 'ee202.hdlbits', name: 'HDLBits: the Circuits section, auto-graded', how: 'Record the percentage of its problems your Verilog passes.', max: 100, url: 'https://hdlbits.01xz.net/wiki/Main_Page' },
      { id: 'ee202.nand', name: 'nand2tetris Projects 1–5 pass their test scripts', how: 'Record how many of the five projects pass every supplied test.', max: 5, url: 'https://www.nand2tetris.org/course' },
    ],
    rubrics: {
      'checkpoint 1': exam('the written logic-design exam', 'Truth tables, K-maps and state diagrams drawn before any HDL; the unseen controller implemented.', 'The controller simulated against a test bench covering every state and transition.'),
      'checkpoint 2': practical('An unfamiliar processor debugged from failing instruction traces within the time.', 'Each fault traced from a failing instruction to the signal and line responsible.'),
      demonstration: demo('A program running live from instruction to pin', 'One injected control fault, and the waveform that exposes it explained.'),
      final: defend('the final design review', 'Every interface and test claim defended with simulation or waveform evidence.', 'Timing margins, reset behaviour and unused states checked.'),
    },
  },

  'electronics-and-instrumentation-lab-i': {
    doc: 'docs/ee-term2-audit.md',
    outcomes: [
      o('ee203.trust', 'Earn trust in a measurement through calibration, uncertainty and traceability.', ['FE-ECE 9.D', 'ABET 6'], ['lab.propagate', 'lab.fit'], [1, 5], ['checkpoint 1', 'final']),
      o('ee203.instruments', 'Use meters and oscilloscopes without disturbing the circuit.', ['FE-ECE 9.D'], ['divider', 'el.alias'], [2, 3], ['checkpoint 1']),
      o('ee203.characterize', 'Characterise components and op-amp circuits.', ['FE-ECE 9.A', 'FE-ECE 9.C'], ['el.opamp', 'ckt.bode'], [4, 7, 8], ['checkpoint 1', 'demonstration']),
      o('ee203.noise', 'Reject interference and quantify noise.', ['FE-ECE 5.B'], ['el.ktc', 'lab.weighted'], [9], ['checkpoint 2']),
      o('ee203.automate', 'Automate a test and design a fixture for it.', ['FE-ECE 17.C'], ['lab.adc', 'lab.trials'], [10, 12], ['checkpoint 2', 'final']),
      o('ee203.faults', 'Isolate faults with a written test strategy.', ['ABET 6'], ['ckt.tolerance', 'ckt.nodal'], [11], ['checkpoint 2']),
      o('ee203.audit', 'Keep auditable evidence and run a characterisation campaign.', ['ABET 6', 'ABET 3'], ['lab.chi2'], [13, 14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'The resource\'s readings are textbooks', why: '6.101 (Spring 2007) posts labs, but its readings are textbook sections that are not free; the ngspice and LTspice pages did not answer link checks.', fix: 'Units read 6.101\'s labs, Lessons in Electric Circuits, NIST\'s handbook and TN 1297, the Junior Lab noise guide, PyVISA and the Junior Lab notebook rules.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track questions (meter, soldering, decoupling, symbols) with no independent check.', fix: 'Practice now covers uncertainty, fitting, op-amp bandwidth, filters, kT/C noise, sampling, tolerance and χ² tests.' },
    ],
    benchmarks: [
      { id: 'ee203.ref', name: 'Your measurement of a reference agrees with its specification', how: 'Measure a known reference (a voltage reference or 0.1% resistor); record 1 if its stated value lies within your uncertainty.', max: 1, url: 'https://www.nist.gov/pml/nist-technical-note-1297' },
    ],
    rubrics: {
      'checkpoint 1': practical('Measurements on the unknown virtual circuit planned and executed without step-by-step instructions.', 'A measurement plan written first, then each reading recorded with instrument settings and uncertainty.'),
      'checkpoint 2': practical('Every fault in the unfamiliar signal chain located within the time.', 'A written test strategy, and each fault confirmed by fixing it and re-measuring.'),
      demonstration: demo('One live test', 'An injected anomaly recognised and handled, and the uncertainty defended.'),
      final: [
        crit('Auditable notebook', 'A notebook in which every claim traces to dated raw data, settings and code.', 'Gaps in traceability.', 'Not auditable.'),
        crit('Raw-data-to-claim audit', 'Randomly chosen claims reproduced from raw data during the oral audit.', 'Most reproduced.', 'Few reproduced.'),
        crit('Uncertainty', 'Uncertainty budgets for the main results, with the dominant term identified.', 'Budgets partial.', 'None.'),
        crit('Safety and method', 'Safe practice and the measurement method justified.', 'Partly.', 'Not justified.'),
      ],
    },
  },

  'materials-and-chemistry-for-electronics': {
    doc: 'docs/ee-term2-audit.md',
    outcomes: [
      o('es201.bonds', 'Connect bonding and crystal structure to properties.', ['FE-ECE 5.B'], ['cmp.bragg', 'ch.stoich'], [1, 2], ['checkpoint 1']),
      o('es201.bands', 'Use band models and control carriers by doping.', ['FE-ECE 5.A'], ['mat.doping', 'cmp.intrinsic'], [3, 4], ['checkpoint 1', 'final']),
      o('es201.transport', 'Explain charge transport by drift and diffusion.', ['FE-ECE 5.A'], ['mat.doping'], [5], ['checkpoint 1', 'final']),
      o('es201.junction', 'Form a pn junction and predict its depletion region.', ['FE-ECE 5.A'], ['dev.junction'], [7], ['checkpoint 2', 'final']),
      o('es201.interfaces', 'Choose dielectrics, metals and contacts.', ['FE-ECE 5.B'], ['pe.gauss'], [8, 9], ['checkpoint 2']),
      o('es201.energy', 'Explain electrochemical storage and predict degradation.', ['FE-ECE 5.C'], ['ch.gibbs', 'ch.kinetics'], [10, 13], ['final']),
      o('es201.lifecycle', 'Treat fabrication and the life cycle as materials engineering, and justify a material stack.', ['ABET 2', 'ABET 4'], [], [12, 14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'The resource is a device course, not a materials course', why: '6.012 (Spring 2009) teaches devices and circuits; it has no bonding, crystals, electrochemistry, degradation or life-cycle material.', fix: 'Units add 3.091SC (solid-state chemistry), 6.720J for contacts and the EU\'s life-cycle-assessment platform; 3.091SC\'s final has a solution key.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes doped-silicon resistivity (checked by solving for the Fermi level) and pn-junction depletion (checked by integrating Poisson\'s equation), with diffraction, carriers and electrochemistry.' },
    ],
    benchmarks: [
      { id: 'es201.final', name: 'MIT 3.091SC final exam, against the solution key', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/3-091sc-introduction-to-solid-state-chemistry-fall-2010/pages/final-exam/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the closed-notes electronic-materials exam', 'Each property explained by a mechanism chain: bonding to structure to bands to behaviour.', 'Every structure-to-property explanation corrected and checked against a measured value.'),
      'checkpoint 2': practical('Materials selected for the unseen component within the time.', 'A table of candidate materials with the properties that decide between them, and their sources.'),
      demonstration: demo('A material stack for a sensor, package, cell or interconnect', 'The stack\'s failure mode and expected life stated, with its evidence.'),
      final: defend('the cumulative final (3.091SC\'s final will do)', 'Every correction written as an explicit mechanism chain.', 'Units, orders of magnitude and safety (toxicity, flammability) checked.'),
    },
  },
};
