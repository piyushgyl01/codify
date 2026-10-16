/**
 * Electrical Engineering, Term 3 — audited as Terms 0–2 were.
 *
 * Outside graders: 6.041SC and 6.003 quizzes and finals with solutions;
 * NSPE Board of Ethical Review conclusions; measured timing against a
 * timer calculation. Evidence in docs/ee-term3-audit.md.
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


export const EE_TERM3 = {
  'probability-and-random-processes': {
    doc: 'docs/ee-term3-audit.md',
    outcomes: [
      o('em202.models', 'Build probability models and condition on evidence.', ['FE-ECE 2.B'], ['pr.bayes', 'pr.indep'], [1, 2], ['checkpoint 1']),
      o('em202.rvs', 'Model noise with discrete and continuous random variables.', ['FE-ECE 2.B', 'FE-ECE 2.C'], ['pr.discrete', 'pr.continuous'], [3, 4], ['checkpoint 1', 'final']),
      o('em202.combine', 'Combine, transform and sum random variables.', ['FE-ECE 2.C'], ['pr.cov', 'pr.indicator'], [5, 7], ['checkpoint 1', 'final']),
      o('em202.limits', 'Use the law of large numbers and the central limit theorem.', ['FE-ECE 2.A'], ['pr.clt', 'cp.mcerror'], [8], ['final']),
      o('em202.estimate', 'Estimate quantities with intervals, and decide by testing.', ['FE-ECE 2.A'], ['st.ci', 'stoch.mle', 'pp.pvalue'], [9, 10], ['checkpoint 2', 'final']),
      o('em202.processes', 'Model random sequences and their spectra.', ['FE-ECE 2.B', 'FE-ECE 8.A'], ['stoch.poisson', 'la.markov', 'el.ktc'], [12, 13], ['final']),
      o('em202.study', 'Run an uncertainty study and present calibrated inference.', ['ABET 6', 'ABET 3'], ['bay.normal', 'bay.beta'], [14, 15], ['demonstration']),
    ],
    gaps: [
      { what: 'The resource stops before random processes in frequency', why: '6.041SC covers probability, Markov chains and inference, but not power spectral density (Unit 13).', fix: 'Unit 13 reads 6.011\'s lectures on stationary processes and the power spectral density.', url: `${OCW}/6-011-signals-systems-and-inference-spring-2018/` },
      { what: 'Practice was borrowed', why: 'The course drew on AI-track variance, Bayes and entropy questions.', fix: 'Practice now covers conditioning, distributions, covariance, the CLT, intervals, significance, Markov chains, Bayesian updating and noise.' },
    ],
    benchmarks: [
      { id: 'em202.quizzes', name: 'MIT 6.041SC Quizzes 1–2, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-i/quiz-1/` },
      { id: 'em202.final', name: 'MIT 6.041SC final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/final-exam/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the closed-notes probability-models exam (6.041SC Quiz 1 will do)', 'Each sample space, event and model choice stated before calculating.', 'Every model-selection error repaired and the answer checked by simulation.'),
      'checkpoint 2': practical('The unseen sensor dataset analysed within two hours.', 'Estimates reported with intervals, and the test\'s assumptions checked against the data.'),
      demonstration: demo('The uncertainty study', 'A challenge about an assumption or the sample size answered with evidence.'),
      final: defend('the cumulative final (6.041SC\'s final will do)', 'Each method mapped to its use in signals, communications and control.', 'Probabilities checked to lie in [0, 1] and units carried through.'),
    },
  },

  'signals-and-systems': {
    doc: 'docs/ee-term3-audit.md',
    outcomes: [
      o('ee204.signals', 'Describe signals and test systems for linearity and time invariance.', ['FE-ECE 7.A'], ['sig.conv'], [1, 2], ['checkpoint 1']),
      o('ee204.convolve', 'Convolve deliberately.', ['FE-ECE 7.A'], ['sig.conv'], [3], ['checkpoint 1', 'final']),
      o('ee204.models', 'Use differential and difference models, poles and modes.', ['FE-ECE 7.C', 'FE-ECE 7.D'], ['sig.iir', 'de.oscillator'], [4], ['checkpoint 1', 'final']),
      o('ee204.fourier', 'Build Fourier series and transforms.', ['FE-ECE 13.B'], ['sig.fseries', 'fa.fourier'], [5, 7], ['checkpoint 1', 'final']),
      o('ee204.sampling', 'Sample without aliasing and quantise knowingly.', ['FE-ECE 8.A'], ['el.alias', 'lab.adc'], [8, 13], ['checkpoint 2', 'final']),
      o('ee204.transforms', 'Use Laplace and z analysis.', ['FE-ECE 7.C', 'FE-ECE 8.C'], ['de.laplace', 'sig.iir'], [9, 10], ['checkpoint 2', 'final']),
      o('ee204.chain', 'Connect systems and study a real signal chain in time, frequency and pole–zero views.', ['ABET 6', 'FE-ECE 7.D'], ['cm.dft', 'ckt.bode'], [12, 14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at 6.003 and EE261 as wholes.', fix: 'Each unit links the 6.003 (Fall 2011) lecture that teaches it; Osgood\'s EE261 notes back the transform practical; 6.003\'s quizzes and finals have solutions.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track spectrogram and PWM questions.', fix: 'Practice now includes convolution (checked by DFT multiplication), Fourier coefficients (checked by numerical integration) and recursive-filter impulse responses (checked by running the recursion).' },
    ],
    benchmarks: [
      { id: 'ee204.quizzes', name: 'MIT 6.003 quizzes and final (Fall 2011), against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/6-003-signals-and-systems-fall-2011/pages/exams/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the closed-notes time-and-harmonics exam (a 6.003 quiz will do)', 'Convolutions set up graphically (flip, shift, overlap) before summing.', 'One convolution checked numerically in code.'),
      'checkpoint 2': practical('The unseen mixed continuous- and discrete-time system analysed within the time.', 'One result (a pole, a gain or a spectrum) verified in code.'),
      demonstration: demo('One system shown in time, frequency and pole–zero views', 'An injected parameter change predicted in all three views before it is shown.'),
      final: defend('the cumulative final (a 6.003 final will do)', 'Every correction made with a graphical and a numerical check.', 'Stability, causality and aliasing checked for each system.'),
    },
  },

  'semiconductor-devices': {
    doc: 'docs/ee-term3-audit.md',
    outcomes: [
      o('ee205.physics', 'Rebuild carrier physics: doping, drift and diffusion.', ['FE-ECE 5.A'], ['mat.doping', 'cmp.intrinsic'], [1], ['checkpoint 1']),
      o('ee205.junction', 'Form the pn junction and drive the diode.', ['FE-ECE 5.A', 'FE-ECE 9.A'], ['dev.junction', 'dev.diode'], [2, 3], ['checkpoint 1', 'final']),
      o('ee205.diodeckt', 'Analyse diode circuits.', ['FE-ECE 9.A'], ['dev.diode'], [4], ['checkpoint 1']),
      o('ee205.bjt', 'Explain the BJT and amplify with it.', ['FE-ECE 9.A', 'FE-ECE 9.B'], ['dev.bjtgain'], [5, 7], ['checkpoint 2', 'final']),
      o('ee205.mos', 'Explain the MOS capacitor and operate the MOSFET.', ['FE-ECE 9.A'], ['dev.mosfet'], [8, 9], ['checkpoint 2', 'final']),
      o('ee205.mosamp', 'Amplify with a MOSFET using its small-signal model.', ['FE-ECE 9.B'], ['dev.mosfet', 'ckt.depsource'], [10], ['checkpoint 2', 'final']),
      o('ee205.families', 'Compare device families and explain scaling.', ['FE-ECE 9.A'], ['dev.mosfet'], [12, 13], ['final']),
      o('ee205.design', 'Design a device-backed circuit and show the device physics in its waveform.', ['ABET 2', 'ABET 6'], ['dev.bjtgain', 'pe.rc'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links; nothing on scaling', why: 'The catalogue pointed every unit at 6.012 and an NPTEL course; 6.012 does not cover device scaling or family trade-offs.', fix: 'Units link 6.012 lectures by topic, and 6.720J\'s lectures on scaling and on bipolar and CMOS design.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes diode operating points (checked by bisecting on current), MOSFET currents (checked by the gradual-channel integral) and common-emitter gain (checked by stamping the hybrid-π model into a nodal matrix), with doping and junctions.' },
    ],
    benchmarks: [
      { id: 'ee205.exams', name: 'MIT 6.012 quizzes and finals, each answer confirmed by calculation or simulation', how: 'Count an answer right only when an independent calculation or a simulation agrees; record the percentage.', max: 100, url: `${OCW}/6-012-microelectronic-devices-and-circuits-spring-2009/pages/exams/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the closed-notes junction-devices exam (a 6.012 quiz will do)', 'Each answer traced to a charge picture: carriers, depletion and fields.', 'One device-model mismatch diagnosed by comparing the model with a measured or simulated curve.'),
      'checkpoint 2': practical('The unseen transistor stage analysed and repaired within the time.', 'Bias point and small-signal gain computed, then confirmed in simulation.'),
      demonstration: demo('The device-backed circuit', 'One physical or model parameter changed live and the circuit\'s response explained from device physics.'),
      final: defend('the cumulative final (a 6.012 final will do)', 'The project defended from the charge picture through device equations to the measured waveform.', 'Operating regions, power dissipation and breakdown limits checked.'),
    },
  },

  'computer-architecture-and-embedded-systems': {
    doc: 'docs/ee-term3-audit.md',
    outcomes: [
      o('ee206.pins', 'Trace an instruction to a pin and use memory safely.', ['FE-ECE 16.A', 'FE-ECE 16.B'], ['ar.riscv', 'c.pointers'], [1, 2], ['checkpoint 1']),
      o('ee206.time', 'Keep time with timers and respond to events with interrupts.', ['FE-ECE 16.C'], ['emb.timer'], [3, 4], ['checkpoint 1', 'final']),
      o('ee206.peripherals', 'Talk to peripherals over serial interfaces.', ['FE-ECE 16.C', 'FE-ECE 13.D'], ['c.binary'], [5], ['checkpoint 1']),
      o('ee206.acquire', 'Acquire analogue data without aliasing or quantisation surprises.', ['FE-ECE 8.A', 'FE-ECE 16.C'], ['el.alias', 'lab.adc'], [7], ['checkpoint 2']),
      o('ee206.firmware', 'Organise firmware as state machines and understand the datapath underneath.', ['FE-ECE 16.A', 'FE-ECE 17.C'], ['dig.fsm', 'ar.pipeline'], [8, 9], ['final']),
      o('ee206.realtime', 'Budget real time and show deadlines are met.', ['FE-ECE 16.A'], ['emb.rta'], [10], ['checkpoint 2', 'final']),
      o('ee206.faults', 'Design for faults and manage energy over the product\'s life.', ['ABET 2'], ['econ.risk'], [12, 13], ['final']),
      o('ee206.instrument', 'Build an embedded instrument and demonstrate its timing.', ['ABET 6', 'ABET 3'], ['emb.timer', 'os.race'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'The main resource cannot be mapped', why: 'The NPTEL embedded-systems page loads its syllabus only in a browser.', fix: 'Units read Jonathan Valvano\'s free Embedded Systems: Shape the World e-book by chapter, 6.004 chapters and the RISC-V specification; NPTEL stays linked for its videos.', url: 'https://users.ece.utexas.edu/~valvano/Volume1/E-Book/' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track microcontroller, PWM, timing and bus questions with no independent check.', fix: 'Practice now includes timer prescalers (checked by trying every count) and real-time response times (checked by simulating the schedule), with RISC-V, pipelines and races.' },
    ],
    benchmarks: [
      { id: 'ee206.timing', name: 'Your measured interrupt period matches the timer calculation', how: 'Measure the period on a logic analyser or in simulation; record 1 if it agrees with your prescaler-and-count calculation within the clock\'s tolerance.', max: 1, url: 'https://users.ece.utexas.edu/~valvano/Volume1/E-Book/C12_Interrupts.htm' },
    ],
    rubrics: {
      'checkpoint 1': practical('The unseen timed peripheral behaviour implemented within two hours.', 'Timer settings derived on paper first, then the period measured.'),
      'checkpoint 2': practical('The sensor-to-output system repaired, with its timing and communication faults fixed.', 'Each fault shown on a trace or log before and after the fix.'),
      demonstration: demo('The embedded instrument', 'One overload and one sensor fault handled live, with timing shown on a trace.'),
      final: defend('the final concept check', 'Timing, memory, interfaces and fault handling defended with measurements.', 'Worst-case timing, stack depth and current draw checked.'),
    },
  },

  'economics-ethics-and-engineering-decisions': {
    doc: 'docs/ee-term3-audit.md',
    stages: ['checkpoint 1', 'escalation record', 'checkpoint 2', 'demonstration', 'final'],
    outcomes: [
      o('eh201.recognize', 'Recognise an ethical decision and the professional duties it engages.', ['ABET 4', 'FE-ECE 3.A'], [], [1, 2], ['checkpoint 1']),
      o('eh201.failure', 'Analyse a failure as a system, not a scapegoat.', ['ABET 4', 'ABET 2'], [], [3], ['checkpoint 2', 'final']),
      o('eh201.cost', 'Estimate life-cycle cost and account for externalities.', ['FE-ECE 4.A', 'FE-ECE 4.B'], ['econ.npv'], [4, 5], ['checkpoint 1', 'final']),
      o('eh201.safety', 'Engineer safety and work with standards.', ['FE-ECE 3.C', 'ABET 4'], [], [7, 8], ['checkpoint 2']),
      o('eh201.uncertainty', 'Decide under uncertainty with expected costs and risks.', ['FE-ECE 4.C'], ['econ.risk', 'pr.bayes'], [9], ['checkpoint 1', 'final']),
      o('eh201.conflict', 'Handle a schedule-versus-safety conflict by documented escalation.', ['ABET 4'], [], [10], ['escalation record']),
      o('eh201.justice', 'Design for justice and plan for the whole life.', ['ABET 2', 'ABET 4'], ['eth.fairness'], [12, 13], ['final']),
      o('eh201.case', 'Assemble and defend an accountable decision case.', ['ABET 3'], [], [14, 15, 16], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'The resource\'s readings are not free', why: 'ESD.932 lists paid books; the IEEE code page blocks link checks; the economics units had no resource at all.', fix: 'Units read the NSPE code, MIT 16.63J\'s system-safety notes, OpenStax finance and economics, the Hyatt Regency investigation, SEP entries and Design Justice.', url: 'https://www.nspe.org/career-growth/ethics/code-ethics' },
      { what: 'Five assessments, not four', why: 'The course adds an escalation record, so the default stage names would collide.', fix: 'The stages are named explicitly, each with its own rubric.' },
    ],
    benchmarks: [
      { id: 'eh201.ber', name: 'Your judgement on NSPE Board of Ethical Review cases matches the Board\'s', how: 'Decide three cases before reading the Board\'s discussion; record how many conclusions match.', max: 3, url: 'https://www.nspe.org/career-growth/ethics/board-ethical-review-cases' },
    ],
    rubrics: {
      'checkpoint 1': [
        crit('Go/no-go', 'A clear go or no-go with the conditions under which it would change.', 'Decision hedged.', 'No decision.'),
        crit('Cost and risk', 'Life-cycle cost and expected losses computed from the packet, discounted where needed.', 'Computed loosely.', 'Not computed.'),
        crit('Duties named', 'The professional duties at stake named and weighed.', 'Mentioned.', 'Ignored.'),
        crit('Within the limit', 'Written within the time.', 'Over.', 'Unfinished.'),
      ],
      'escalation record': [
        crit('Facts', 'The safety concern stated factually, with the evidence.', 'Vague.', 'Missing.'),
        crit('Escalation path', 'Each escalation step, to whom and when, recorded.', 'Partial.', 'None.'),
        crit('Options offered', 'Options that protect safety while respecting the schedule offered.', 'One option.', 'None.'),
        crit('Professional tone', 'Firm, respectful and free of blame.', 'Mostly.', 'No.'),
      ],
      'checkpoint 2': [
        crit('Assigned design defended', 'The assigned design defended faithfully against the hostile board.', 'Weakly.', 'Abandoned.'),
        crit('Hazards answered', 'Each hazard the board raises answered with analysis or a mitigation.', 'Some.', 'None.'),
        crit('Own judgement', 'An independent judgement issued afterwards, with reasons.', 'Without reasons.', 'None.'),
        crit('Learning', 'What the board changed in the student\'s view recorded.', 'Mentioned.', 'Not reflected on.'),
      ],
      demonstration: demo('An eight-minute design-decision defence', 'The decision\'s residual risk and who carries it stated plainly.'),
      final: [
        crit('Complete ledger', 'Costs, risks, duties, stakeholders and decisions recorded with sources.', 'Gaps.', 'Missing.'),
        crit('Evidence audit', 'Randomly chosen entries traced to their evidence on request.', 'Most traced.', 'Few.'),
        crit('Duty audit', 'Each decision tied to the duty it served.', 'Partly.', 'Not tied.'),
        crit('Accountability', 'Errors in the record owned and corrected.', 'Partly.', 'Not owned.'),
      ],
    },
  },
};
