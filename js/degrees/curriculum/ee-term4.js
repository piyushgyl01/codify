/**
 * Electrical Engineering, Term 4 — audited as Terms 0–3 were.
 *
 * Outside graders: 6.013 and 6.061 exams with solutions, RES.6-008 problem
 * solutions, HDLBits, 6.012 and 6.011 exams checked by calculation, NASA's
 * review criteria, and measured margins and consistency tests.
 * Evidence in docs/ee-term4-audit.md.
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


export const EE_TERM4 = {
  'fields-waves-and-communication-links': {
    doc: 'docs/ee-term4-audit.md',
    outcomes: [
      o('ee301.maxwell', 'Read Maxwell\'s equations as a system and launch plane waves.', ['FE-ECE 11.B'], ['pw.polar', 'pe.faraday'], [1, 2], ['checkpoint 1']),
      o('ee301.interface', 'Predict reflection and transmission at interfaces.', ['FE-ECE 11.B'], ['pw.snell'], [3], ['checkpoint 1', 'final']),
      o('ee301.lines', 'Use transmission lines and match loads.', ['FE-ECE 11.C'], ['com.tline', 'com.inputz'], [4, 5], ['checkpoint 1', 'final']),
      o('ee301.antenna', 'Radiate deliberately and build an antenna link budget.', ['FE-ECE 11.B', 'FE-ECE 13.D'], ['com.friis', 'pr.larmor'], [7, 8], ['checkpoint 2', 'final']),
      o('ee301.modulation', 'Put information on a carrier.', ['FE-ECE 13.A', 'FE-ECE 13.B'], ['sig.fseries', 'el.alias'], [9], ['checkpoint 2']),
      o('ee301.noise', 'Include noise and real channels, and predict error rates.', ['FE-ECE 13.D'], ['com.snr', 'com.ber'], [10, 13], ['checkpoint 2', 'final']),
      o('ee301.share', 'Share spectrum and access a common medium.', ['FE-ECE 13.C'], ['stoch.poisson'], [12], ['final']),
      o('ee301.link', 'Design an end-to-end link and demonstrate its margin.', ['ABET 2', 'ABET 6'], ['com.friis', 'com.snr', 'code.hamming'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links; GNU Radio\'s wiki blocks checks', why: 'The catalogue pointed every unit at 6.013, 6.02 and an NPTEL course as wholes; wiki.gnuradio.org returned 403.', fix: 'Units link 6.013 lectures for fields and lines and 6.02 chapters for modulation, noise and access; 6.013\'s quizzes and final have solutions.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes reflection and VSWR (checked by scanning the standing wave), line input impedance (checked with 4000 lumped sections), link budgets (checked in watts through effective aperture), noise floors (from kTB) and BPSK error rates.' },
    ],
    benchmarks: [
      { id: 'ee301.exams', name: 'MIT 6.013 quizzes and final, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/6-013-electromagnetics-and-applications-spring-2009/pages/exams/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the closed-notes propagation exam (a 6.013 quiz will do)', 'Boundary conditions and line equations written before solving; the transmission-line practical logged.', 'Power balance (incident = reflected + transmitted) checked for every interface answer.'),
      'checkpoint 2': practical('The unseen link that misses its range or error target diagnosed within the time.', 'A link budget line by line, with the term that causes the shortfall identified and measured.'),
      demonstration: demo('The live link', 'One parameter degraded until the link fails, and the failure boundary explained from the budget.'),
      final: defend('the cumulative final (6.013\'s final will do)', 'Every gain, loss, bandwidth and noise assumption defended with a source or measurement.', 'RF exposure limits and units (dB versus dBm) checked.'),
    },
  },

  'feedback-and-real-time-embedded-control': {
    doc: 'docs/ee-term4-audit.md',
    outcomes: [
      o('ee302.loop', 'Close a loop and model the plant\'s dynamics.', ['FE-ECE 12.A'], ['de.linear1', 'de.oscillator'], [1, 2], ['checkpoint 1']),
      o('ee302.response', 'Read time response and judge stability.', ['FE-ECE 12.C', 'FE-ECE 12.D'], ['ctl.routh', 'ctl.sse', 'ckt.overshoot'], [3, 4], ['checkpoint 1', 'final']),
      o('ee302.pid', 'Design PID controllers.', ['FE-ECE 12.D'], ['ctl.sse'], [5], ['checkpoint 1', 'final']),
      o('ee302.frequency', 'Shape the loop\'s frequency response with adequate margins.', ['FE-ECE 12.B'], ['ctl.margin', 'ckt.bode'], [7], ['final']),
      o('ee302.state', 'Use state space and estimate hidden state.', ['FE-ECE 12.C'], ['la.eig2', 'est.kalman'], [8, 9], ['checkpoint 2', 'final']),
      o('ee302.realtime', 'Run control on a real-time schedule.', ['FE-ECE 16.A'], ['emb.rta', 'emb.timer'], [10], ['checkpoint 2']),
      o('ee302.safe', 'Design for safe failure and verify in the loop.', ['ABET 2', 'ABET 6'], ['econ.risk'], [12, 13], ['final']),
      o('ee302.robust', 'Build a controlled system and demonstrate its robustness.', ['ABET 6', 'FE-ECE 12.D'], ['ctl.margin', 'ctl.sse'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at Feedback Systems, RES.6-010 and an NPTEL course as wholes.', fix: 'Units link Feedback Systems chapter by chapter (by PDF page), Valvano for periodic interrupts and 16.63J for safe failure.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track PID, filter and timing questions with no independent check.', fix: 'Practice now includes steady-state error (checked by simulating the loop), phase margin (checked on a sampled frequency response), Routh–Hurwitz (checked by computing roots), Kalman gains and real-time response.' },
    ],
    benchmarks: [
      { id: 'ee302.margin', name: 'Measured phase margin agrees with the design', how: 'Sweep the real or simulated loop; record 1 if the measured phase margin is within 10° of the designed value.', max: 1, url: 'https://www.cds.caltech.edu/~murray/books/AM08/pdf/fbs-public_24Jul2020.pdf#page=343' },
    ],
    rubrics: {
      'checkpoint 1': exam('the written classical-control exam', 'Each design step justified from the plant model; the unseen plant tuned within the time.', 'Closed-loop stability and steady-state error checked in simulation.'),
      'checkpoint 2': practical('The controller\'s stability, sensor and timing faults repaired within the time.', 'Each fault shown on a trace before and after the fix.'),
      demonstration: demo('The controlled system across all four scenarios', 'The scenario where performance degrades most shown and explained from the margins.'),
      final: defend('the cumulative final', 'Stability, timing, estimation and fault-handling claims defended with analysis and traces.', 'Actuator limits, sample rate and worst-case latency checked.'),
    },
  },

  'analog-microelectronics-and-vlsi-design': {
    doc: 'docs/ee-term4-audit.md',
    outcomes: [
      o('ee303.bias', 'Bias a transistor and linearise it.', ['FE-ECE 9.A'], ['dev.mosfet', 'dev.diode'], [1, 2], ['checkpoint 1']),
      o('ee303.stages', 'Build gain stages and current sources.', ['FE-ECE 9.B'], ['dev.bjtgain', 'ckt.depsource'], [3, 4], ['checkpoint 1', 'final']),
      o('ee303.diffpair', 'Use differential pairs.', ['FE-ECE 9.B'], ['dev.mosfet'], [5], ['checkpoint 1']),
      o('ee303.frequency', 'Shape an amplifier\'s frequency response and stabilise it with feedback.', ['FE-ECE 9.B', 'FE-ECE 12.B'], ['ckt.bode', 'el.opamp', 'ctl.margin'], [7, 8], ['checkpoint 2', 'final']),
      o('ee303.opamp', 'Design an op-amp core.', ['FE-ECE 9.C'], ['el.opamp'], [9], ['final']),
      o('ee303.cmos', 'Design CMOS logic and predict its timing.', ['FE-ECE 15.C'], ['vlsi.vm', 'vlsi.elmore'], [10, 12], ['checkpoint 2', 'final']),
      o('ee303.corners', 'Account for layout, power and process corners.', ['FE-ECE 9.A'], ['vlsi.elmore', 'ckt.tolerance'], [13, 15], ['demonstration', 'final']),
      o('ee303.subsystem', 'Build a mixed-signal subsystem.', ['ABET 2', 'ABET 6'], ['dev.bjtgain', 'ckt.tolerance'], [14], ['demonstration']),
    ],
    gaps: [
      { what: 'The main resource cannot be mapped', why: 'The NPTEL analog-circuits syllabus loads only in a browser; the LTspice page never answered.', fix: 'Units link 6.012 lectures, 6.101 labs, 6.111\'s VLSI and power lectures and RES.6-010 for feedback; CircuitJS stands in for LTspice.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes CMOS switching thresholds (checked by bisecting where the currents meet) and Elmore delay (checked by integrating a simulated step response), with the device and amplifier skills.' },
    ],
    benchmarks: [
      { id: 'ee303.exams', name: 'MIT 6.012 quizzes and finals, each answer confirmed by calculation or simulation', how: 'Count an answer right only when an independent calculation or simulation agrees; record the percentage.', max: 100, url: `${OCW}/6-012-microelectronic-devices-and-circuits-spring-2009/pages/exams/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the written analog-stages exam', 'Bias point, small-signal model and gain derived for the unseen stage, then designed to its specification.', 'The design simulated at its bias point, with headroom checked.'),
      'checkpoint 2': practical('The mixed-signal block\'s gain, stability and timing failures repaired within the time.', 'Each failure traced to a device or wiring cause and verified fixed.'),
      demonstration: demo('The subsystem at nominal and worst-case corners', 'The first specification to fail at a corner shown and explained.'),
      final: defend('the cumulative final (a 6.012 final will do)', 'The subsystem defended from device model through corner (PVT) evidence.', 'Power, headroom and breakdown limits checked at every corner.'),
    },
  },

  'digital-signal-processing': {
    doc: 'docs/ee-term4-audit.md',
    outcomes: [
      o('ee304.sampled', 'Represent sampled data and convolve in discrete time.', ['FE-ECE 8.A'], ['el.alias', 'sig.conv'], [1, 2], ['checkpoint 1']),
      o('ee304.dft', 'Use the DTFT, and compute the DFT and FFT.', ['FE-ECE 8.C'], ['cm.dft', 'dsp.ma'], [3, 4, 5], ['checkpoint 1', 'final']),
      o('ee304.fir', 'Design FIR filters.', ['FE-ECE 8.C'], ['dsp.ma'], [7], ['checkpoint 2', 'final']),
      o('ee304.iir', 'Design IIR filters.', ['FE-ECE 8.C'], ['sig.iir'], [8], ['checkpoint 2', 'final']),
      o('ee304.spectra', 'Estimate spectra honestly.', ['FE-ECE 8.C'], ['cm.dft', 'el.ktc'], [9], ['checkpoint 1']),
      o('ee304.precision', 'Respect finite precision.', ['FE-ECE 8.C'], ['dsp.qsnr', 'fpga.fixed'], [10], ['checkpoint 2']),
      o('ee304.multirate', 'Change sample rate and process a stream.', ['FE-ECE 8.A'], ['el.alias', 'sig.conv'], [12, 13], ['final']),
      o('ee304.chain', 'Build an authentic filter and demonstrate it.', ['ABET 6', 'ABET 2'], ['dsp.ma', 'sig.iir'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at RES.6-008 and Smith\'s DSP Guide as wholes.', fix: 'Units link RES.6-008 lectures and problem solutions and the DSP Guide by chapter, with Julius Smith\'s resampling notes for sample-rate change.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track spectrogram and filter questions.', fix: 'Practice now includes moving-average responses (checked by summing the DTFT), quantisation SNR (checked by quantising a long sine), fixed-point error (checked against every code), convolution and recursive filters.' },
    ],
    benchmarks: [
      { id: 'ee304.res', name: 'RES.6-008 problems, against the published solutions', how: 'Work the DFT, FIR and IIR problem sets; record your percentage.', max: 100, url: `${OCW}/res-6-008-digital-signal-processing-spring-2011/pages/study-materials/` },
    ],
    rubrics: {
      'checkpoint 1': exam('the written spectral-analysis exam', 'The unseen finite record analysed with window, resolution and leakage stated.', 'Each spectral claim checked by a second window or record length.'),
      'checkpoint 2': practical('The unfamiliar filter implementation repaired so it passes its frequency and numeric tests.', 'Before-and-after responses, and the numeric fault (overflow, coefficient rounding) identified.'),
      demonstration: demo('The live stream before and after filtering', 'One artefact or adversarial input exposed and explained.'),
      final: defend('the cumulative final', 'Every DSP choice defended from specification to real-time evidence.', 'Aliasing, overflow and latency budgets checked.'),
    },
  },

  'senior-design-i-discover-prove-and-communicate': {
    doc: 'docs/ee-term4-audit.md',
    outcomes: [
      o('sd401.need', 'Observe a real need and listen to stakeholders.', ['ABET 2'], [], [1, 2], ['checkpoint 1']),
      o('sd401.prior', 'Map prior art and existing solutions.', ['ABET 7'], [], [3], ['checkpoint 1']),
      o('sd401.requirements', 'Write testable requirements.', ['ABET 2'], [], [4], ['checkpoint 1', 'checkpoint 2']),
      o('sd401.architecture', 'Choose an architecture by trade study.', ['ABET 2'], ['econ.npv'], [5], ['checkpoint 1']),
      o('sd401.risk', 'Build the hazard case and retire the hardest risk first.', ['ABET 2', 'ABET 4'], ['econ.risk', 'sys.reliability'], [7, 8], ['checkpoint 2']),
      o('sd401.interfaces', 'Prototype the interfaces and plan verification.', ['ABET 6'], ['lab.trials'], [9, 10], ['checkpoint 2', 'demonstration']),
      o('sd401.alpha', 'Build, test and revise an alpha.', ['ABET 6'], [], [12, 13], ['demonstration']),
      o('sd401.reviews', 'Pass design reviews as a team and freeze a defensible baseline.', ['ABET 3', 'ABET 5'], [], [14, 15, 16], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'The resources teach no design process', why: 'ESD.932 and 21W.031 cover ethics and science writing; KiCad is a tool; the IEEE page blocks checks. Nothing covered requirements, reviews, risk or baselines.', fix: 'Units read NASA\'s Systems Engineering Handbook by section, MIT 16.842 (Fundamentals of Systems Engineering) and 16.63J (hazard analysis).', url: 'https://www.nasa.gov/reference/systems-engineering-handbook/' },
    ],
    benchmarks: [
      { id: 'sd401.nasa', name: 'Your preliminary design review meets NASA\'s review criteria', how: 'Score the PDR package against the handbook\'s technical-review criteria; record 1 when every criterion is met or explicitly waived.', max: 1, url: 'https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf#page=165' },
    ],
    rubrics: {
      'checkpoint 1': [
        crit('Need evidenced', 'The need shown with stakeholder evidence (interviews, observation), not assumed.', 'Thin evidence.', 'Assumed.'),
        crit('Requirements', 'Requirements that are testable, traceable to the need and prioritised.', 'Some untestable.', 'Vague.'),
        crit('Concept choice', 'Concepts compared by a trade study with stated criteria.', 'Compared informally.', 'One concept.'),
        crit('Actions closed', 'Every blocking action from the review closed with evidence.', 'Most.', 'Open.'),
      ],
      'checkpoint 2': [
        crit('Design maturity', 'The preliminary design meets the requirements on paper, with analysis.', 'Gaps.', 'Immature.'),
        crit('Risk retired', 'The hardest technical risk retired by a prototype or test.', 'Mitigated on paper.', 'Not addressed.'),
        crit('Hazard case', 'Hazards identified with controls and verification for each.', 'Partial.', 'None.'),
        crit('Findings resolved', 'All major external-review findings resolved.', 'Most.', 'Open.'),
      ],
      demonstration: demo('A 15-minute critical design review with the alpha', 'Required actions from the review recorded and closed.'),
      final: [
        crit('Tagged baseline', 'An approved, tagged baseline: schematics, code, requirements and test plan under version control.', 'Partly controlled.', 'Not baselined.'),
        crit('Need and feasibility', 'The need and feasibility defended with evidence.', 'Asserted.', 'Not defended.'),
        crit('Residual risk', 'Residual risks listed with owners and plans.', 'Listed without plans.', 'Not listed.'),
        crit('Team record', 'Contributions and decisions recorded for every member.', 'Partial.', 'Missing.'),
      ],
    },
  },

  'fpga-systems-and-hardware-acceleration': {
    doc: 'docs/ee-term4-audit.md',
    outcomes: [
      o('fp401.rtl', 'Write synchronous RTL and verify its interfaces.', ['FE-ECE 15.F', 'FE-ECE 15.H'], ['dig.fsm', 'ar.critical'], [1, 2], ['checkpoint 1']),
      o('fp401.cdc', 'Cross clock boundaries safely.', ['FE-ECE 15.H'], ['dig.fsm'], [3], ['checkpoint 1', 'final']),
      o('fp401.stream', 'Build streaming datapaths with on-chip memory.', ['FE-ECE 15.F', 'FE-ECE 16.B'], ['ar.pipeline', 'ar.cache'], [4, 5], ['checkpoint 1', 'final']),
      o('fp401.isa', 'Attach an accelerator through an ISA interface, and predict its speed-up.', ['FE-ECE 16.A'], ['ar.riscv', 'ar.amdahl'], [7, 8], ['checkpoint 2', 'final']),
      o('fp401.arith', 'Schedule arithmetic in fixed point.', ['FE-ECE 15.A'], ['fpga.fixed', 'ar.float'], [9], ['checkpoint 2']),
      o('fp401.measure', 'Measure an implementation\'s resources, timing and throughput.', ['FE-ECE 15.H'], ['ar.critical', 'par.workspan'], [10], ['checkpoint 2', 'final']),
      o('fp401.release', 'Contain faults, automate the flow and release reproducible RTL.', ['ABET 6', 'ABET 3'], ['dig.sop'], [12, 13, 16], ['final']),
      o('fp401.demo', 'Build an accelerator and show a transaction cycle by cycle.', ['ABET 6'], ['ar.pipeline'], [14, 15], ['demonstration']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at 6.111, 6.004 and two tools as wholes.', fix: 'Units link 6.111 (Spring 2006) lectures, 6.004 chapters, the RISC-V specification, Verilator and cocotb.' },
      { what: 'Practice was borrowed', why: 'The course drew on Programming-track bits and FLOPs questions.', fix: 'Practice now includes fixed-point quantisation (checked against every code), with state machines, pipelines, caches, critical paths and Amdahl\'s law.' },
    ],
    benchmarks: [
      { id: 'fp401.hdlbits', name: 'HDLBits: the sequential-logic and FSM problems, auto-graded', how: 'Record the percentage your Verilog passes.', max: 100, url: 'https://hdlbits.01xz.net/wiki/Main_Page' },
    ],
    rubrics: {
      'checkpoint 1': practical('A verified streaming block delivered to the external interface contract.', 'A self-checking test bench covering back-pressure, reset and every handshake case.'),
      'checkpoint 2': practical('The unfamiliar compute kernel integrated and meeting its throughput target.', 'Throughput measured in cycles and compared with the target and a model.'),
      demonstration: demo('A live regression run', 'One transaction explained cycle by cycle from the waveform.'),
      final: defend('the final design review', 'The accelerator defended with timing, resource and verification evidence.', 'Timing closure, clock-domain crossings and reset behaviour checked.'),
    },
  },

  'statistical-signal-processing-and-machine-learning': {
    doc: 'docs/ee-term4-audit.md',
    outcomes: [
      o('ss401.frame', 'Frame an inference task and model multivariate data.', ['FE-ECE 2.B'], ['pr.cov', 'bay.normal'], [1, 2], ['checkpoint 1']),
      o('ss401.estimate', 'Estimate parameters with known uncertainty.', ['FE-ECE 2.A'], ['stoch.mle', 'st.ci'], [3], ['checkpoint 1', 'final']),
      o('ss401.detect', 'Detect a signal and extract spectral features.', ['FE-ECE 8.C'], ['sig.detect', 'cm.dft'], [4, 5], ['checkpoint 1', 'final']),
      o('ss401.reduce', 'Reduce dimension and learn linear boundaries.', ['FE-ECE 1.G'], ['ml.pca', 'la.svd'], [7, 8], ['checkpoint 2', 'final']),
      o('ss401.time', 'Model time dependence.', ['FE-ECE 8.C'], ['sig.iir', 'bay.ess'], [9], ['final']),
      o('ss401.evaluate', 'Evaluate honestly on held-out data.', ['ABET 6'], ['st.multiple', 'eth.baserate'], [10, 11], ['checkpoint 2']),
      o('ss401.robust', 'Make the pipeline robust and budget its computation.', ['ABET 2'], ['bigo', 'st.ipw'], [12, 13], ['final']),
      o('ss401.system', 'Build and demonstrate a statistical signal system.', ['ABET 6', 'ABET 3'], ['sig.detect', 'ml.pca'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links; no machine learning', why: 'The catalogue pointed every unit at 6.041SC and RES.6-008 as wholes; neither covers detection theory, dimension reduction or honest evaluation.', fix: 'Units add 6.011\'s lectures on estimation, detection and Wiener filtering, 18.06SC on the SVD, and scikit-learn\'s guides to linear models, cross-validation, evaluation and pitfalls.' },
      { what: 'Practice was borrowed', why: 'The course drew on AI-track regression and metrics questions.', fix: 'Practice now includes Neyman–Pearson detection (checked through erfc) and principal components (checked by searching every direction), with estimation and evaluation skills.' },
    ],
    benchmarks: [
      { id: 'ss401.exams', name: 'MIT 6.011 exams, each answer confirmed by calculation or simulation', how: 'Count an answer right only when an independent calculation or simulation agrees; record the percentage.', max: 100, url: `${OCW}/6-011-signals-systems-and-inference-spring-2018/pages/exams/` },
    ],
    rubrics: {
      'checkpoint 1': practical('A held-out detector delivered with its error analysis.', 'ROC curve and operating point justified, with false-alarm and miss rates on held-out data.'),
      'checkpoint 2': practical('A model built and audited on the unseen signal dataset.', 'A leakage check, a baseline, and errors broken down by condition.'),
      demonstration: demo('Nominal and shifted-data runs', 'The errors under shift explained, with what would detect the shift in service.'),
      final: defend('the defence against held-out evidence', 'Every claim backed by held-out results, and the pipeline published reproducibly.', 'Data provenance, class balance and compute budget checked.'),
    },
  },

  'state-estimation-and-sensor-fusion': {
    doc: 'docs/ee-term4-audit.md',
    outcomes: [
      o('rb401.state', 'Describe uncertain robot state and calibrate sensors.', ['ABET 6'], ['lab.fit', 'lab.propagate'], [1, 2], ['checkpoint 1']),
      o('rb401.frames', 'Transform between coordinate frames.', ['FE-ECE 1.G'], ['rob.fk2', 'la.inverse'], [3], ['checkpoint 1', 'final']),
      o('rb401.ls', 'Estimate with least squares.', ['FE-ECE 1.G'], ['la.ls', 'lab.weighted'], [4], ['checkpoint 1']),
      o('rb401.bayes', 'Use recursive Bayes and the Kalman filter.', ['FE-ECE 2.B'], ['est.kalman', 'bay.normal'], [5], ['checkpoint 1', 'final']),
      o('rb401.fuse', 'Fuse asynchronous sensors with motion models and extended filters.', ['ABET 1'], ['est.kalman', 'rob.fk2'], [7, 8, 9], ['checkpoint 2', 'final']),
      o('rb401.ros', 'Build an estimator\'s data flow in ROS on a real-time budget.', ['ABET 5'], ['emb.rta'], [10], ['checkpoint 2']),
      o('rb401.failure', 'Detect estimator failure and evaluate trajectories.', ['ABET 6'], ['lab.chi2'], [12, 13], ['final']),
      o('rb401.system', 'Build a fusion system and demonstrate recovery.', ['ABET 6', 'ABET 3'], ['est.kalman'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links', why: 'The catalogue pointed every unit at Feedback Systems, ROS 2, Webots and SciPy as wholes.', fix: 'Units read Roger Labbe\'s free Kalman and Bayesian Filters in Python chapter by chapter, Feedback Systems, ROS 2\'s tf2 and topic guides, NIST on calibration and the evo evaluation toolkit.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track filter, sensor and navigation questions with no independent check.', fix: 'Practice now includes steady-state Kalman gains (checked by iterating the Riccati recursion) and arm kinematics (checked by composing transforms), with least squares and χ² consistency.' },
    ],
    benchmarks: [
      { id: 'rb401.nees', name: 'Your filter passes a consistency test', how: 'Run the filter on a simulated trajectory with known truth; record 1 if its normalised estimation error squared stays within the 95% χ² bounds.', max: 1, url: 'https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python/blob/master/08-Designing-Kalman-Filters.ipynb' },
    ],
    rubrics: {
      'checkpoint 1': practical('A validated pose and velocity estimate on the hidden trajectories.', 'Errors against truth reported with the filter\'s own covariance, and the two compared.'),
      'checkpoint 2': practical('The unseen simulated run localised despite missing and noisy segments.', 'Behaviour during each gap explained, with covariance growth shown.'),
      demonstration: demo('The robot running live', 'A sensor removed, and the change in confidence and the recovery explained.'),
      final: defend('the defence against hidden-test evidence', 'The localisation stack defended with trajectory metrics and consistency tests.', 'Frame conventions, timestamps and units checked.'),
    },
  },

  'power-electronics-and-electric-drives': {
    doc: 'docs/ee-term4-audit.md',
    outcomes: [
      o('pw401.cells', 'Set converter requirements and model switching cells.', ['FE-ECE 9.E'], ['pwr.buck', 'pwr.boost'], [1, 2], ['checkpoint 1']),
      o('pw401.parts', 'Choose passive components, switches and magnetics.', ['FE-ECE 9.E'], ['pwr.buck', 'ckt.rl'], [3, 4, 5], ['checkpoint 1', 'final']),
      o('pw401.control', 'Average the converter and compensate its loop.', ['FE-ECE 12.B'], ['ctl.margin', 'ckt.bode'], [7, 8], ['checkpoint 2', 'final']),
      o('pw401.machine', 'Drive an electric machine.', ['FE-ECE 10.D'], ['pwr.dcmotor'], [9], ['checkpoint 2', 'final']),
      o('pw401.thermal', 'Model thermal behaviour and estimate real efficiency.', ['FE-ECE 9.E'], ['pwr.thermal', 'ckt.power'], [10, 13], ['checkpoint 2', 'final']),
      o('pw401.protect', 'Handle abnormal states with protection.', ['ABET 4'], ['econ.risk'], [12], ['final']),
      o('pw401.envelope', 'Build the converter or drive and demonstrate its operating envelope.', ['ABET 6'], ['pwr.buck', 'pwr.thermal'], [14, 15], ['demonstration', 'final']),
    ],
    gaps: [
      { what: 'No unit links; LTspice\'s page never answered', why: 'The catalogue pointed every unit at 6.622 and 6.061 as wholes.', fix: 'Units link 6.622\'s typed lecture notes and 6.061\'s chapters; 6.061\'s quizzes have solutions.' },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track driver, PWM, actuator, battery and stall questions with no independent check.', fix: 'Practice now includes buck and boost duty and ripple (checked by switching cycle by cycle), DC-motor operating points (checked by integrating the motor), and junction temperature (checked with a thermal RC network).' },
    ],
    benchmarks: [
      { id: 'pw401.quizzes', name: 'MIT 6.061 quizzes, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/6-061-introduction-to-electric-power-systems-spring-2011/pages/quizzes/` },
    ],
    rubrics: {
      'checkpoint 1': practical('A converter power stage designed to meet the full envelope.', 'Component stresses (voltage, current, temperature) tabulated at every corner of the envelope, with margins.'),
      'checkpoint 2': practical('The converter-drive model\'s stability and temperature failures repaired within the time.', 'Loop gain and thermal model before and after the fix.'),
      demonstration: demo('Four live scenarios across the envelope', 'The first hard limit (thermal, current or stability) exposed and explained.'),
      final: defend('the defence of every rating', 'Every component rating defended from analysis and simulation, with the simulation released.', 'Creepage, insulation, fault currents and thermal limits checked.'),
    },
  },
};
