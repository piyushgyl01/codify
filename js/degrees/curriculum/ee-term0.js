/**
 * Electrical Engineering, Term 0 — audited as Mathematics and Physics were.
 *
 * Each EE course has sixteen units and four assessments: two checkpoints, a
 * demonstration and a final defence. Outcomes map to ABET's seven student
 * outcomes and the NCEES FE Electrical and Computer specification ("FE-ECE
 * n.X"). Outside graders: 18.01SC and 8.012 exams with solutions,
 * nand2tetris's test scripts. Evidence in docs/ee-term0-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });

/** The four EE assessment stages, built from what each one asks for. */
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

export const EE_TERM0 = {
  'calculus-i-models-and-change': {
    doc: 'docs/ee-term0-audit.md',
    outcomes: [
      o('em101.rates', 'Model change with rates and limits, and reason about continuity.', ['FE-ECE 1.E', 'ABET 1'], ['calc.limit', 'calc.deriv'], [1, 2, 3], ['checkpoint 1']),
      o('em101.derivative', 'Build derivatives from the definition and compute them for composed systems.', ['FE-ECE 1.E'], ['calc.deriv', 'calc.nth'], [4, 5], ['checkpoint 1', 'final']),
      o('em101.predict', 'Predict with linear approximation and optimise a design.', ['FE-ECE 1.E', 'ABET 1'], ['calc.linapprox', 'calc.optimize', 'calc.related'], [7, 8], ['checkpoint 2', 'final']),
      o('em101.accumulate', 'Accumulate change with integrals and connect it to rates.', ['FE-ECE 1.E'], ['calc.integral', 'calc.ftc'], [9, 10], ['checkpoint 2', 'final']),
      o('em101.methods', 'Choose an integration method, analytic or numerical, and bound its error.', ['FE-ECE 1.E'], ['calc.trapezoid', 'na.simpson'], [12], ['final']),
      o('em101.odes', 'Solve differential models of physical systems.', ['FE-ECE 1.F'], ['de.linear1', 'pe.rc'], [13], ['demonstration', 'final']),
      o('em101.series', 'Approximate functions with series and estimate the error.', ['FE-ECE 1.E'], ['calc.taylor'], [14], ['final']),
      o('em101.model', 'Build and present a physical-data model that uses a derivative and an integral.', ['ABET 6', 'ABET 3'], ['calc.ftc', 'lab.fit'], [15], ['demonstration']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at the whole of 18.01SC.', fix: 'Each unit now links the 18.01SC session that teaches it, with SciPy for the numerical demonstration.' },
      { what: 'One borrowed skill', why: 'Practice was a single derivative question.', fix: 'Practice now covers limits, derivatives, approximation, optimisation, integrals, numerical integration, first-order ODEs and Taylor series.' },
    ],
    benchmarks: [
      { id: 'em101.exam1', name: 'MIT 18.01SC Exam 1, against the solutions', how: 'Sit it closed-notes in 90 minutes; record your percentage.', max: 100, url: `${OCW}/18-01sc-single-variable-calculus-fall-2010/pages/1.-differentiation/exam-1/session-22-materials-for-exam-1/` },
      { id: 'em101.final', name: 'MIT 18.01SC final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/18-01sc-single-variable-calculus-fall-2010/pages/final-exam/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the 90-minute closed-notes exam (18.01SC Exam 1 will do)', 'Derivatives built from the limit definition where asked, then by the rules, each step shown.', 'Every rate given with units and checked against a graph or a numerical difference quotient.'),
      'checkpoint 2': practical('A model fitted to the supplied motion and current/charge data within two hours.', 'Velocity from position and charge from current computed both numerically and analytically, side by side.'),
      demonstration: demo('A physical-data model that uses a derivative and an integral', 'Where the model breaks down shown on the data (residuals or a held-out point).'),
      final: defend('the cumulative final (the 18.01SC final will do)', 'A written account of how each method transfers to mechanics and circuits, with one worked example of each.', 'Units carried through and limiting cases (small t, large t, small x) checked.'),
    },
  },

  'physics-i-mechanics-and-waves': {
    doc: 'docs/ee-term0-audit.md',
    outcomes: [
      o('ep101.kinematics', 'Describe motion in one and two dimensions, including constant acceleration.', ['ABET 1'], ['pm.projectile'], [1, 2], ['checkpoint 1']),
      o('ep101.forces', 'Draw free-body diagrams and apply Newton\'s laws to coupled systems.', ['ABET 1'], ['pm.incline'], [3, 4], ['checkpoint 1', 'final']),
      o('ep101.energy', 'Use work and energy.', ['ABET 1'], ['pm.work'], [5], ['checkpoint 1', 'final']),
      o('ep101.momentum', 'Use momentum, impulse and collisions.', ['ABET 1'], ['pm.collision'], [7], ['checkpoint 2', 'final']),
      o('ep101.rotation', 'Model rotation and static equilibrium.', ['ABET 1'], ['pm.rolling'], [8, 9], ['checkpoint 2', 'final']),
      o('ep101.waves', 'Find oscillations, waves and normal modes.', ['ABET 1'], ['pm.oscillator', 'pw.string', 'pw.modes'], [10, 12, 13], ['final']),
      o('ep101.investigate', 'Test a mechanics claim with data and present the investigation.', ['ABET 6', 'ABET 3'], ['lab.fit', 'lab.propagate'], [14, 15], ['demonstration']),
    ],
    gaps: [
      { what: '8.01SC stops before oscillations and waves', why: 'MIT\'s 8.01SC covers kinematics through rolling, but not oscillations, waves or normal modes (Units 10, 12–13).', fix: 'Those units read MIT 8.03SC lectures.' },
      { what: 'Practice was borrowed', why: 'The course drew on the Robotics track\'s torque and gear questions, which have no independent check.', fix: 'Practice now uses the mechanics and waves skills from the Physics degree, each checked by simulation.' },
    ],
    benchmarks: [
      { id: 'ep101.exams', name: 'MIT 8.012 exams, against the solutions', how: 'Sit each in 90 minutes; record your average.', max: 100, url: `${OCW}/8-012-physics-i-classical-mechanics-fall-2008/pages/exams/` },
      { id: 'ep101.final', name: 'MIT 8.012 final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/8-012-physics-i-classical-mechanics-fall-2008/pages/exams/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the closed-notes particle-mechanics exam (an 8.012 exam will do)', 'A free-body diagram for every body, then equations in a stated coordinate system.', 'Each missed problem redone from a fresh diagram, with units and a limiting case checked.'),
      'checkpoint 2': practical('The unseen dataset analysed and the written questions answered within the time.', 'Momentum and energy bookkeeping shown for every stage of the motion.'),
      demonstration: demo('A seven-minute demonstration of the investigation', 'The claim\'s uncertainty and the experiment\'s weakest assumption shown.'),
      final: defend('the cumulative final (the 8.012 final will do)', 'Every problem corrected with an explicit diagram, model and unit check.', 'Units, signs and limiting cases (massless, frictionless, small angle) checked.'),
    },
  },

  'programming-for-engineers': {
    doc: 'docs/ee-term0-audit.md',
    outcomes: [
      o('ec101.basics', 'Write programs whose input, output and branching respond correctly.', ['FE-ECE 17.C', 'ABET 1'], ['py.arith', 'py.branch'], [1, 2], ['checkpoint 1']),
      o('ec101.functions', 'Decompose problems into functions and abstractions.', ['FE-ECE 17.C'], ['py.loopcount', 'py.accum', 'py.return'], [3, 7], ['checkpoint 1', 'final']),
      o('ec101.data', 'Represent data with lists, dictionaries and objects.', ['FE-ECE 17.B'], ['py.oop', 'py.strings'], [4, 8], ['checkpoint 2', 'final']),
      o('ec101.debug', 'Find and fix faults with tests and exceptions.', ['FE-ECE 17.C'], ['py.pytest', 'py.except', 'py.boundary'], [5], ['checkpoint 1', 'checkpoint 2']),
      o('ec101.cost', 'Reason about the cost of a program.', ['FE-ECE 17.A'], ['bigo'], [9], ['final']),
      o('ec101.compute', 'Compute with data and simulate an engineering system.', ['FE-ECE 17.C', 'ABET 1'], ['de.euler', 'cp.mcerror', 'py.fileio'], [10, 12], ['checkpoint 2', 'demonstration']),
      o('ec101.maintain', 'Maintain, version and release code that others can run.', ['ABET 3', 'ABET 5'], [], [13, 14], ['final']),
      o('ec101.demo', 'Demonstrate a tool to a user and act on their feedback.', ['ABET 3'], [], [15], ['demonstration']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at 6.100L as a whole.', fix: 'Units link 6.100L lectures by topic, and the Turing Way for testing, version control, environments and code review.' },
    ],
    benchmarks: [
      { id: 'ec101.finger', name: '6.100L finger exercises, checked by running them', how: 'Record the percentage your code passes on the exercises\' own examples.', max: 100, url: `${OCW}/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/pages/finger-exercises/` },
    ],
    rubrics: {
      'checkpoint 1': practical('A small unseen program built to its specification in 90 minutes.', 'Tests written first or alongside, covering normal cases and boundaries.'),
      'checkpoint 2': practical('An unfamiliar data-analysis repository repaired, extended and tested within the limit.', 'Each fault reproduced by a failing test before it was fixed.'),
      demonstration: demo('The engineering tool', 'Structured feedback collected from a user, and at least one problem it revealed acted on.'),
      final: defend('the final code review against the course rubric', 'The design defended orally: why these data structures and functions, and what was tested.', 'A tagged release that runs from a clean environment, with its limits documented.'),
    },
  },

  'electrical-engineering-studio-i': {
    doc: 'docs/ee-term0-audit.md',
    outcomes: [
      o('ee101.quantities', 'Explain charge, current, voltage, resistance and power, and apply Ohm\'s law to networks.', ['FE-ECE 6.A', 'FE-ECE 6.B', 'ABET 1'], ['ohm', 'ckt.req'], [1, 2], ['checkpoint 1']),
      o('ee101.measure', 'Measure without disturbing the circuit, and state the meter\'s limits.', ['FE-ECE 9.D', 'ABET 6'], ['divider', 'lab.propagate'], [3], ['checkpoint 1']),
      o('ee101.sense', 'Turn a physical quantity into a voltage with a sensor front end.', ['FE-ECE 9.D'], ['divider', 'ckt.thevenin'], [4, 14], ['demonstration', 'final']),
      o('ee101.logic', 'Make decisions with logic, and give a system memory.', ['FE-ECE 15.B', 'FE-ECE 15.E', 'FE-ECE 15.G'], ['dig.sop', 'dig.fsm'], [5, 7], ['checkpoint 1', 'checkpoint 2']),
      o('ee101.interface', 'Program a microcontroller to read inputs, sample them and drive outputs.', ['FE-ECE 16.C', 'FE-ECE 8.A'], ['el.alias', 'lab.adc'], [8, 9], ['checkpoint 2']),
      o('ee101.loop', 'Close a feedback loop and send information over a link.', ['FE-ECE 9.C', 'FE-ECE 13.D'], ['el.opamp', 'pe.rc'], [10, 12], ['checkpoint 2', 'final']),
      o('ee101.energy', 'Account for energy and power in a battery-powered system.', ['FE-ECE 6.A'], ['ckt.maxpower', 'ckt.rl'], [13], ['final']),
      o('ee101.judgment', 'Demonstrate a sensing system and defend it from schematic to consequence, safely.', ['ABET 2', 'ABET 4'], ['ckt.nodal'], [15, 16], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'The catalogued textbook blocks link checks', why: 'allaboutcircuits.com answers automated requests with 403, so its chapter links could not be verified.', fix: 'Units link the same book, Lessons in Electric Circuits, at its author\'s free ibiblio mirror, chapter by chapter.', url: 'https://www.ibiblio.org/kuphaldt/electricCircuits/' },
      { what: 'Practice had no checks', why: 'The course drew on Robotics-track questions (LED, colour bands, multimeter, soldering, symbols), most with no independent check.', fix: 'Practice now includes series–parallel networks (checked by nodal analysis), Thévenin equivalents, RL transients, maximum power, minimal logic (checked by dynamic programming) and sequence detectors (checked as automata).' },
    ],
    benchmarks: [
      { id: 'ee101.nand', name: 'nand2tetris Project 1: every Boolean-logic chip passes its test script', how: 'Build the chips in the free hardware simulator; record 1 when all the supplied tests pass.', max: 1, url: 'https://www.nand2tetris.org/' },
    ],
    rubrics: {
      'checkpoint 1': exam('the concept exam and four hidden-fault diagnoses', 'Each fault located by measurement, with the reading that gave it away recorded.', 'Each diagnosis confirmed by fixing the fault and re-measuring.'),
      'checkpoint 2': practical('The unfamiliar circuit and code pair repaired, with every requirement demonstrated.', 'Measurements and code changes logged against each requirement.'),
      demonstration: demo('The sensing system', 'One injected fault diagnosed live and one measured limitation (range, noise or drift) shown.'),
      final: defend('the final concept check', 'The sensing system defended from schematic through code and measurement to its consequences for users.', 'Safe voltages and currents justified, and failure consequences stated.'),
    },
  },

  'writing-and-argument-for-engineers': {
    doc: 'docs/ee-term0-audit.md',
    outcomes: [
      o('eh101.reader', 'Write for a named reader with a clear purpose.', ['ABET 3'], ['tw.voice'], [1], ['checkpoint 1']),
      o('eh101.claim', 'Make claims backed by evidence from checked sources.', ['ABET 3', 'ABET 7'], [], [2, 3, 5], ['checkpoint 1', 'final']),
      o('eh101.explain', 'Explain a mechanism and report a method someone could repeat.', ['ABET 3'], ['tw.lists'], [4, 7], ['checkpoint 2']),
      o('eh101.honest', 'Quote and paraphrase honestly, with correct attribution.', ['ABET 4'], [], [8], ['final']),
      o('eh101.revise', 'Revise structure and edit sentences under time.', ['ABET 3'], ['tw.voice'], [9, 10], ['checkpoint 2']),
      o('eh101.uncertainty', 'Interview for understanding and write honestly about uncertainty.', ['ABET 3', 'ABET 7'], [], [12, 13], ['final']),
      o('eh101.public', 'Build, present and user-test a public explainer.', ['ABET 3', 'ABET 5'], ['tw.alttext', 'tw.markdown'], [14, 15], ['demonstration']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at the whole Writing Guide.', fix: 'Each unit links the Writing Guide section that teaches it, with the IPCC\'s guidance for writing about uncertainty.' },
      { what: 'The IEEE code page could not be checked', why: 'ieee.org answers automated requests with a challenge page.', fix: 'The final unit reads the Writing Guide\'s section on ethical research; the IEEE code stays a course resource.' },
    ],
    benchmarks: [
      { id: 'eh101.reader', name: 'An outside reader restates your claim and evidence after one reading', how: 'Give the memo to someone outside the course; record 1 if they state its claim and its two strongest pieces of evidence correctly.', max: 1, url: 'https://openstax.org/books/writing-guide/pages/10-3-glance-at-genre-thesis-reasoning-and-evidence' },
    ],
    rubrics: {
      'checkpoint 1': [
        crit('Recommendation', 'A clear recommendation for a named reader in the first paragraph.', 'Recommendation buried.', 'None.'),
        crit('Evidence used', 'Each claim tied to a source from the packet, cited.', 'Some claims tied.', 'Unsupported.'),
        crit('Source judgement', 'Weak or biased sources in the packet identified and weighed accordingly.', 'Noted only.', 'Not judged.'),
        crit('Within the limit', 'Two pages, written within the time.', 'Over length or time.', 'Unfinished.'),
      ],
      'checkpoint 2': practical('The flawed brief audited and repaired within two hours.', 'Each repair listed with the flaw it fixes (structure, sentence, claim or source).'),
      demonstration: demo('A six-minute talk and the public explainer', 'A usability test run with peers, and the explainer\'s most confusing point identified and fixed.'),
      final: [
        crit('Portfolio', 'A complete portfolio showing drafts, revisions and the final pieces.', 'Gaps.', 'Missing.'),
        crit('Source-to-claim audit', 'Every randomly chosen claim traced to its source on request.', 'Most traced.', 'Few traced.'),
        crit('Honest attribution', 'Quotation and paraphrase accurate, with no unattributed borrowing.', 'Minor slips.', 'Problems.'),
        crit('Uncertainty', 'Confidence stated in calibrated words, matched to the evidence.', 'Sometimes overstated.', 'Overstated throughout.'),
      ],
    },
  },
};
