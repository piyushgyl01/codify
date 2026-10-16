/**
 * Electrical Engineering, Term 1 — audited as Term 0 was.
 *
 * Outside graders: 18.02SC, 8.02X and 6.006 exams with solutions; 6.002
 * quizzes checked in a circuit simulator. Evidence in docs/ee-term1-audit.md.
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

export const EE_TERM1 = {
  'calculus-ii-multivariable-systems': {
    doc: 'docs/ee-term1-audit.md',
    outcomes: [
      o('em102.vectors', 'Work with vectors, lines, planes and moving points in three dimensions.', ['FE-ECE 1.D', 'FE-ECE 1.H'], ['la.det', 'la.solve'], [1, 2], ['checkpoint 1']),
      o('em102.partials', 'Read surfaces and compute partial derivatives, gradients and chain rules.', ['FE-ECE 1.E', 'FE-ECE 1.H'], ['mv.gradient'], [3, 4, 5], ['checkpoint 1', 'final']),
      o('em102.optimize', 'Optimise functions of several variables, with and without constraints.', ['FE-ECE 1.E'], ['mv.lagrange'], [7], ['final']),
      o('em102.integrate', 'Integrate over regions and through space in suitable coordinates.', ['FE-ECE 1.E'], ['mv.double'], [8, 9], ['checkpoint 2', 'final']),
      o('em102.fields', 'Follow vector fields: work, potentials and line integrals.', ['FE-ECE 1.H'], ['mv.line'], [10], ['checkpoint 2', 'final']),
      o('em102.theorems', 'Use Green\'s, the divergence and Stokes\' theorems.', ['FE-ECE 1.H', 'FE-ECE 11.A'], ['mv.divcurl', 'pe.gauss'], [12, 13, 14], ['final']),
      o('em102.model', 'Model an electric, thermal or flow field and validate it with a theorem.', ['ABET 6', 'ABET 3'], ['pe.gauss', 'mv.divcurl'], [15], ['demonstration']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at 18.02SC as a whole.', fix: 'Each unit now links the 18.02SC sessions that teach it; its practice exams with solutions serve the checkpoints and final.' },
      { what: 'Thin practice', why: 'The course borrowed one gradient and one derivative question.', fix: 'Practice now covers gradients, Lagrange multipliers, multiple integrals, line integrals, divergence and curl, and Gauss\'s law.' },
    ],
    benchmarks: [
      { id: 'em102.exam2', name: 'MIT 18.02SC Exam 2, against the solutions', how: 'Sit it closed-notes; record your percentage.', max: 100, url: `${OCW}/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/exam-2/practice-exam/` },
      { id: 'em102.exam4', name: 'MIT 18.02SC Exam 4, against the solutions', how: 'Sit it closed-notes; record your percentage.', max: 100, url: `${OCW}/18-02sc-multivariable-calculus-fall-2010/pages/4.-triple-integrals-and-surface-integrals-in-3-space/exam-4/practice-exam/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the closed-notes multivariable exam (18.02SC Exam 2 will do)', 'A sketch of each surface, curve or region before any calculation.', 'Every geometric or algebraic error found and the corrected version checked numerically.'),
      'checkpoint 2': practical('The unseen field-and-region model set up and solved within the time.', 'Each integral verified numerically (a sum on a grid or Monte Carlo).'),
      demonstration: demo('An electric, thermal or flow field model', 'One theorem (Gauss, Green or Stokes) used to validate the model, and where it fails shown.'),
      final: defend('the cumulative final (an 18.02SC exam will do)', 'A transfer map linking each method to its use in electromagnetics.', 'Units and coordinate choices justified; symmetry used where it applies.'),
    },
  },

  'physics-ii-electricity-and-magnetism': {
    doc: 'docs/ee-term1-audit.md',
    outcomes: [
      o('ep102.coulomb', 'Compute electric forces and fields of charge distributions.', ['FE-ECE 11.A'], ['pe.coulomb'], [1, 2], ['checkpoint 1']),
      o('ep102.gauss', 'Use flux and Gauss\'s law.', ['FE-ECE 11.A'], ['pe.gauss'], [3], ['checkpoint 1', 'final']),
      o('ep102.potential', 'Work with potential, capacitance and field energy.', ['FE-ECE 11.A', 'FE-ECE 6.G'], ['pe.laplace', 'pe.rc'], [4, 5], ['checkpoint 1', 'final']),
      o('ep102.current', 'Analyse current, resistance and DC circuits.', ['FE-ECE 6.A'], ['ckt.req', 'ckt.nodal'], [7], ['checkpoint 2']),
      o('ep102.magnetism', 'Find magnetic forces and fields.', ['FE-ECE 11.A'], ['pe.wire', 'pe.cyclotron'], [8, 9], ['checkpoint 2', 'final']),
      o('ep102.induction', 'Use induction, inductance and magnetic energy.', ['FE-ECE 11.B'], ['pe.faraday', 'ckt.rl'], [10, 12], ['checkpoint 2', 'final']),
      o('ep102.maxwell', 'Unify the laws in Maxwell\'s equations and describe the waves they predict.', ['FE-ECE 11.B'], ['pw.polar', 'pe.rlc'], [13, 14], ['final']),
      o('ep102.device', 'Explain one device from its field model to measurable behaviour.', ['ABET 6', 'ABET 3'], ['pe.faraday', 'lab.fit'], [15], ['demonstration']),
    ],
    gaps: [
      { what: 'The catalogued course is not on OCW', why: '8.02 (Spring 2019) on OpenCourseWare only points to edX\'s 8.02x series.', fix: 'Units read the free 8.02 TEAL course notes (Spring 2007) chapter by chapter; 8.02X exams with solutions serve the checkpoints.', url: `${OCW}/8-02-physics-ii-electricity-and-magnetism-spring-2007/` },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track Ohm\'s-law questions.', fix: 'Practice now uses the electromagnetism skills from the Physics degree and the EE circuit skills.' },
    ],
    benchmarks: [
      { id: 'ep102.quizzes', name: 'MIT 8.02X exams, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/8-02x-physics-ii-electricity-magnetism-with-an-experimental-focus-spring-2005/pages/exams/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the 90-minute electrostatics exam (an 8.02X exam will do)', 'A field diagram before every calculation, with symmetry argued before Gauss\'s law is used.', 'Every flawed field argument redrawn and the result checked by a limiting case.'),
      'checkpoint 2': practical('The unseen mixed-field practical solved within the time.', 'A simulation trace (PhET or CircuitJS) agreeing with the hand analysis.'),
      demonstration: demo('One device, from its charge and field model to its measured behaviour', 'Where the ideal model and the measurement disagree shown and explained.'),
      final: defend('the cumulative final (an 8.02X exam will do)', 'Every correction made with a field diagram and a unit check.', 'Units, signs, directions and limiting cases checked throughout.'),
    },
  },

  'data-structures-and-systems-programming': {
    doc: 'docs/ee-term1-audit.md',
    outcomes: [
      o('ec102.machine', 'Explain how C becomes machine code, and control memory safely.', ['FE-ECE 16.B', 'FE-ECE 17.C'], ['c.pointers', 'c.sizeof', 'c.memsafety'], [1, 2, 3], ['checkpoint 1']),
      o('ec102.linked', 'Build linked structures, stacks and queues on owned dynamic storage.', ['FE-ECE 17.B'], ['c.linked', 'ds.stackq'], [4, 7], ['checkpoint 1', 'final']),
      o('ec102.cost', 'Measure and reason about algorithmic cost.', ['FE-ECE 17.A'], ['bigo', 'ds.amortized'], [5], ['final']),
      o('ec102.search', 'Search with trees and hashes, and sort deliberately.', ['FE-ECE 17.A', 'FE-ECE 17.B'], ['ds.bst', 'ds.hash', 'ds.sort', 'ds.heaparray'], [8, 9], ['checkpoint 2', 'final']),
      o('ec102.interface', 'Cross a language or library interface correctly.', ['FE-ECE 17.C'], ['c.binary', 'c.overflow'], [10], ['final']),
      o('ec102.debug', 'Diagnose performance and memory faults in unfamiliar code.', ['FE-ECE 17.C', 'FE-ECE 16.B'], ['c.memsafety', 'ar.cache'], [11], ['checkpoint 2']),
      o('ec102.concurrency', 'Handle concurrency without races.', ['FE-ECE 16.A'], ['os.race'], [12], ['final']),
      o('ec102.correct', 'Specify correctness with invariants, build a utility to it, and audit it.', ['FE-ECE 17.C', 'ABET 3'], ['dm.invariant'], [13, 14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at three whole courses.', fix: 'Units link 6.S096 lectures for C, 6.006 lectures for algorithms, 6.042J\'s induction chapter, and the sanitizer, Valgrind and OSTEP pages for safety and concurrency.' },
      { what: 'Practice was borrowed', why: 'The course drew on Programming-track questions (heap, union–find, frequency, bits).', fix: 'Practice now uses the C, data-structure, architecture and concurrency skills from the CS degree, which have independent checks.' },
    ],
    benchmarks: [
      { id: 'ec102.quizzes', name: 'MIT 6.006 quizzes and final, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/6-006-introduction-to-algorithms-fall-2011/pages/exams/` },
    ],
    rubrics: {
      'checkpoint 1': practical('A small data structure built to its specification, running clean under AddressSanitizer, within the limit.', 'Tests that exercise empty, single and full cases, and every allocation freed.'),
      'checkpoint 2': practical('The performance and memory faults in an unfamiliar codebase diagnosed and fixed.', 'Each fault shown by a tool (sanitizer, Valgrind or profiler) before and after the fix.'),
      demonstration: demo('The systems utility, built cleanly and run against adversarial tests', 'A peer code review held, and its most serious finding fixed.'),
      final: defend('the final analysis check (6.006 quizzes will do)', 'Memory, correctness and runtime choices defended with invariants and measurements.', 'Undefined behaviour ruled out, and limits on input size stated.'),
    },
  },

  'circuit-analysis-i': {
    doc: 'docs/ee-term1-audit.md',
    outcomes: [
      o('ee102.laws', 'Name circuit variables and apply KCL and KVL.', ['FE-ECE 6.A', 'FE-ECE 6.B'], ['ohm', 'ckt.req'], [1, 2], ['checkpoint 1']),
      o('ee102.nodal', 'Solve networks by nodal analysis.', ['FE-ECE 6.D'], ['ckt.nodal'], [3], ['checkpoint 1', 'final']),
      o('ee102.thevenin', 'Replace a network by its Thévenin or Norton equivalent.', ['FE-ECE 6.C'], ['ckt.thevenin', 'ckt.maxpower'], [4], ['checkpoint 1', 'final']),
      o('ee102.opamp', 'Design with op-amps under the ideal model, and know where it fails.', ['FE-ECE 9.C'], ['el.opamp'], [5], ['final']),
      o('ee102.transient', 'Store energy and solve first-order transients and timing.', ['FE-ECE 7.A'], ['pe.rc', 'ckt.rl'], [7, 8, 9], ['checkpoint 2', 'final']),
      o('ee102.measure', 'Measure with a stated uncertainty.', ['FE-ECE 9.D', 'ABET 6'], ['lab.propagate', 'lab.weighted'], [10], ['checkpoint 2']),
      o('ee102.second', 'Predict second-order behaviour.', ['FE-ECE 7.A', 'FE-ECE 7.B'], ['ckt.overshoot', 'pe.rlc'], [12], ['final']),
      o('ee102.interface', 'Build and verify an analogue interface against its specification.', ['ABET 2', 'ABET 6', 'FE-ECE 8.B'], ['ckt.bode', 'el.opamp'], [13, 14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: '6.002\'s quizzes have no solutions', why: '6.002 (Spring 2007) posts quizzes and a final, but no solutions.', fix: 'The benchmark asks that each answer be confirmed in a circuit simulator before it counts.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track questions (LED, symbols, colour bands) with no independent check.', fix: 'Practice now covers networks, nodal analysis, Thévenin equivalents, transients, second-order response, filters and op-amp bandwidth, each checked by simulation or a second method.' },
    ],
    benchmarks: [
      { id: 'ee102.quizzes', name: 'MIT 6.002 quizzes and final, each answer confirmed in a simulator', how: 'No solutions are posted: count an answer right only when CircuitJS agrees; record the percentage.', max: 100, url: `${OCW}/6-002-circuits-and-electronics-spring-2007/pages/exams/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the closed-notes resistive-network exam', 'Node voltages or Thévenin equivalents set up systematically, with the fault-diagnosis simulation logged.', 'Each answer checked by a second method (superposition, simulation or power balance).'),
      'checkpoint 2': practical('The hidden transient-circuit fault diagnosed within the time.', 'Every measurement justified: what it was meant to show and what it showed.'),
      demonstration: demo('The circuit, with a live parameter change and an injected fault', 'The gap between model and measurement shown and explained.'),
      final: defend('the cumulative final (6.002\'s final will do)', 'The interface design defended from specification through analysis to measured evidence.', 'Component ratings, power and safe voltages checked.'),
    },
  },

  'technology-society-and-public-reason': {
    doc: 'docs/ee-term1-audit.md',
    stages: ['checkpoint 1', 'standards hearing', 'checkpoint 2', 'demonstration', 'final'],
    outcomes: [
      o('eh102.system', 'See a technology as a system with a history of choices.', ['ABET 4'], [], [1, 2], ['checkpoint 1']),
      o('eh102.stakeholders', 'Map stakeholders, power and access.', ['ABET 4', 'ABET 2'], [], [3, 4], ['checkpoint 1', 'checkpoint 2']),
      o('eh102.automation', 'Interrogate automation and reason about privacy.', ['ABET 4'], ['eth.kanon', 'eth.dp'], [5, 7], ['checkpoint 2', 'final']),
      o('eh102.scale', 'Think at infrastructure scale and measure unequal effects.', ['ABET 4', 'ABET 2'], ['eth.fairness', 'eth.baserate', 'mod.pi'], [8, 9], ['final']),
      o('eh102.govern', 'Write criteria to govern a limited pilot of an emerging technology.', ['ABET 4'], [], [10], ['standards hearing']),
      o('eh102.participate', 'Plan participation by the people affected, and look beyond launch.', ['ABET 5', 'ABET 4'], [], [12, 13], ['final']),
      o('eh102.public', 'Build and deliver a public case under questioning.', ['ABET 3'], [], [14, 15, 16], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'The resource\'s readings are not free', why: 'ESD.932 (Spring 2006) lists books (Harris, Pinkus, Vincenti) and posts no notes; the IEEE code page blocks link checks.', fix: 'Units read Stanford Encyclopedia of Philosophy entries, the Challenger commission report, ITU data, Fairness and Machine Learning, NIST\'s AI risk framework and W3C guidance on involving users.', url: 'https://plato.stanford.edu/entries/public-reason/' },
      { what: 'Five assessments, not four', why: 'This course adds a standards hearing, so the default stage names would collide.', fix: 'The stages are named explicitly, each with its own rubric.' },
    ],
    benchmarks: [
      { id: 'eh102.fair', name: 'An opponent rates your memo fair to their position', how: 'Give the memo to someone who holds the opposing view; record 1 if they agree it states their case fairly.', max: 1, url: 'https://plato.stanford.edu/entries/public-reason/' },
    ],
    rubrics: {
      'checkpoint 1': [
        crit('Recommendation', 'A clear recommendation to a named public decision maker.', 'Recommendation vague.', 'None.'),
        crit('Case file used', 'Each claim tied to the supplied case file, with gaps in the evidence named.', 'Some claims tied.', 'Unsupported.'),
        crit('Public reasons', 'Reasons offered that people with different values could accept.', 'Partly.', 'Only private reasons.'),
        crit('Within the limit', 'Written within the time and length.', 'Over.', 'Unfinished.'),
      ],
      'standards hearing': [
        crit('Criteria', 'Testable criteria for a limited pilot (scope, metrics, stop conditions).', 'Criteria vague.', 'None.'),
        crit('Risks named', 'Risks to each stakeholder named, with a measure for each.', 'Some.', 'None.'),
        crit('Hearing conduct', 'Testimony staged with all stakeholders heard.', 'Some heard.', 'One-sided.'),
        crit('Revision', 'Criteria revised after the hearing, with the changes explained.', 'Revised silently.', 'Not revised.'),
      ],
      'checkpoint 2': [
        crit('Assigned position', 'The assigned stakeholder position defended faithfully and well.', 'Defended weakly.', 'Abandoned.'),
        crit('Engagement', 'Opposing arguments answered directly.', 'Partly.', 'Ignored.'),
        crit('Independent judgement', 'An independent judgement written afterwards, with reasons.', 'Judgement without reasons.', 'None.'),
        crit('Change of mind', 'Any change in view traced to a specific argument or fact.', 'Mentioned.', 'Not reflected on.'),
      ],
      demonstration: demo('Five-minute testimony at the public hearing', 'The weakest point of the case acknowledged before an adversarial question exposes it.'),
      final: [
        crit('Casebook', 'A complete casebook: system map, history, stakeholders, effects and options.', 'Gaps.', 'Missing.'),
        crit('Recommendation', 'A recommendation that follows from the casebook, with conditions that would change it.', 'Recommendation without conditions.', 'Unsupported.'),
        crit('Limits of evidence', 'The limits of the evidence stated plainly.', 'Partly.', 'Overclaimed.'),
        crit('Oral defence', 'Questions answered from the casebook and public reasons.', 'Partly.', 'Not defended.'),
      ],
    },
  },
};
