/**
 * Physics, Term 4 — audited as Terms 0–3 were.
 *
 * Outside graders: Boltzmann's constant measured against its exact SI value;
 * 8.033, 8.282J and 22.01 quizzes and problem sets with solutions; Gaia's
 * cluster catalogue; real quantum hardware; ETS's GRE Physics practice test.
 * Evidence in docs/phys-term4-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';
const GRE = 'https://www.ets.org/gre/test-takers/subject-tests/about/content-structure.html';
const COS = 'https://www.cos.io/initiatives/prereg';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });
const examFinal = (source, linked, check) => [
  crit('Cumulative correctness', `At least 85% on a cumulative exam (${source}), marked against the official solutions.`, '60–84%.', 'Below 60%.'),
  crit('Linked solution', linked, 'Correct, with one step unjustified.', 'Disconnected calculations.'),
  crit('Limiting cases and units', check, 'Units checked, limiting cases not.', 'Neither.'),
  crit('Correction and defense', 'Every lost mark corrected, and the linked solution defended under questions.', 'Partial corrections.', 'None.'),
];
const oralFinal = (artifact, evidence) => [
  crit('Requirements and design', `${artifact} specified with requirements, a hazard review and a design traced to them.`, 'Design given, requirements loose.', 'No design.'),
  crit('Evidence chain', evidence, 'Evidence present, gaps in traceability.', 'Claims without evidence.'),
  crit('Uncertainty and limits', 'Every result carries an uncertainty budget, and the limits and failure modes are stated.', 'Uncertainty on the main result only.', 'None.'),
  crit('Oral defense', 'Questions answered from the evidence, with errors found and corrected on the spot or afterwards.', 'Answers partly from memory, not evidence.', 'Could not defend.'),
];

export const PHYS_TERM4 = {
  'advanced-experimental-physics-1-electronics-optics': {
    doc: 'docs/phys-term4-audit.md',
    outcomes: [
      o('lb501.plan', 'Write an instrument\'s requirements and its calibration plan.', ['AAPT Design', 'AAPT Technical and Practical Laboratory Skills'], ['lab.propagate', 'lab.fit'], [1], ['final']),
      o('lb501.amps', 'Design amplifiers with feedback, accounting for impedance and loading.', ['GRE-P Laboratory Methods'], ['el.opamp', 'divider', 'ohm'], [2], ['applied']),
      o('lb501.noise', 'Identify noise sources, predict their size, and filter or shield against them.', ['GRE-P Laboratory Methods'], ['el.ktc', 'pe.rc'], [3], ['applied', 'final']),
      o('lb501.characterise', 'Characterise a sensor–amplifier chain: gain, bandwidth, noise and calibration uncertainty.', ['AAPT Technical and Practical Laboratory Skills', 'AAPT Data Analysis and Visualization'], ['el.opamp', 'lab.fit', 'lab.propagate'], [4], ['applied']),
      o('lb501.daq', 'Sample and acquire data without aliasing or quantisation surprises.', ['AAPT Technical and Practical Laboratory Skills'], ['el.alias', 'lab.adc'], [5], ['applied']),
      o('lb501.lockin', 'Recover small signals by modulation and phase-sensitive detection.', ['GRE-P Laboratory Methods'], ['cm.dft', 'pe.rlc'], [6], ['final']),
      o('lb501.optics', 'Design optical trains with detectors, and reason about resolution and aberrations.', ['GRE-P Optics and Wave Phenomena'], ['pw.lens', 'op.rayleigh', 'pw.slits'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource is a bioengineering course', why: '20.309 (Fall 2006) teaches instrumentation through DNA melting, AFM and microscopy; its readings are a textbook that is not free, and it has no notes on lock-in detection.', fix: 'Units keep 20.309\'s lab modules and optics lectures, and add MIT 6.002 for amplifiers, the Junior Lab noise guide, and Stanford Research Systems\' free lock-in note.', url: `${OCW}/8-13-14-experimental-physics-i-ii-junior-lab-fall-2016-spring-2017/` },
      { what: 'Practice was borrowed', why: 'The course drew on Robotics-track circuit questions.', fix: 'Practice now includes op-amp bandwidth (checked by sweeping the closed-loop transfer function), kT/C noise (checked by integrating the noise spectrum), aliasing (checked by a DFT of the samples) and the diffraction limit (checked from Bessel\'s integral).' },
    ],
    benchmarks: [
      { id: 'lb501.kb', name: 'Boltzmann\'s constant from Johnson noise agrees with its exact SI value', how: 'Run the Junior Lab Johnson-noise measurement (or its simulated version); record 1 if 1.380649 × 10⁻²³ J/K lies within your stated uncertainty.', max: 1, url: `${OCW}/8-13-14-experimental-physics-i-ii-junior-lab-fall-2016-spring-2017/pages/experiments/johnson-noise-and-shot-noise/` },
      { id: 'lb501.gre', name: 'GRE Physics practice test: laboratory methods questions', how: 'Record the percentage right on those questions.', max: 100, url: GRE },
    ],
    rubrics: {
      applied: [
        crit('Gain and bandwidth', 'Gain and −3 dB bandwidth measured and matched to the gain–bandwidth prediction.', 'Measured, not compared.', 'Not measured.'),
        crit('Noise floor', 'Input-referred noise measured, compared with Johnson and amplifier noise predictions, and the dominant source named.', 'Measured, not explained.', 'Not measured.'),
        crit('Loading and calibration', 'Source and load impedances accounted for, and a calibration with its uncertainty applied.', 'One of the two.', 'Neither.'),
        crit('Independent check', 'A second method (simulation or another instrument) agrees within the stated uncertainty.', 'Compared loosely.', 'None.'),
      ],
      final: oralFinal('An optical or electronic measurement', 'Schematics, raw data, analysis code and a replication protocol tie every claimed number back to a measurement.'),
    },
  },

  'relativity-and-gravitation': {
    doc: 'docs/phys-term4-audit.md',
    outcomes: [
      o('ph501.lorentz', 'Use spacetime intervals, Lorentz transformations and four-vectors.', ['GRE-P Special Relativity'], ['pm.lorentz', 'pm.invariant'], [1], ['final']),
      o('ph501.dynamics', 'Solve relativistic dynamics and transform fields.', ['GRE-P Special Relativity'], ['pm.invariant', 'nu.compton'], [2], ['final']),
      o('ph501.geodesics', 'Use the equivalence principle, metrics and geodesics.', ['GRE-P Special Relativity'], ['rel.gps'], [3], ['applied', 'final']),
      o('ph501.orbits', 'Model orbital precession and clock rates, separating coordinates from invariants.', ['AAPT Modeling', 'GRE-P Special Relativity'], ['rel.precession', 'rel.gps'], [4], ['applied']),
      o('ph501.curvature', 'Compute connections and curvature, and read geodesic deviation as tides.', ['QAA-MSOR 3.10'], ['dg.curvature'], [5], ['final']),
      o('ph501.einstein', 'Use the Einstein equations and their weak-field limit.', ['GRE-P Special Relativity'], ['rel.deflection'], [6], ['final']),
      o('ph501.schwarzschild', 'Analyse Schwarzschild spacetime: horizons, orbits, light and tests.', ['GRE-P Special Relativity'], ['rel.radii', 'rel.deflection'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'The resource is mostly special relativity', why: '8.033 (Fall 2006) covers special relativity well, but its general relativity is a few slides; it has no curvature and no Einstein equations (Units 5–6).', fix: 'Units 3, 5 and 6 read David Tong\'s free General Relativity notes by chapter.', url: 'https://davidtong.org/teaching/general-relativity/' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes satellite clocks (checked with the exact Schwarzschild rates), perihelion precession and light bending (checked by integrating the orbit and the light ray) and black-hole radii (checked from effective potentials).' },
    ],
    benchmarks: [
      { id: 'ph501.quizzes', name: 'MIT 8.033 Quizzes 1–2, against the solutions', how: 'Record your average percentage.', max: 100, url: `${OCW}/8-033-relativity-fall-2006/pages/exams/` },
      { id: 'ph501.gre', name: 'GRE Physics practice test: special relativity questions', how: 'Record the percentage right on those questions.', max: 100, url: GRE },
    ],
    rubrics: {
      applied: [
        crit('Invariant prediction', 'The observable (clock offset, precession or deflection) derived as an invariant, with the coordinate choices named.', 'Derived in one coordinate system without comment.', 'Coordinate artefact reported as physics.'),
        crit('Numerical model', 'Orbit or light ray integrated from the geodesic equations, with step-size convergence shown.', 'Integrated, convergence not shown.', 'Not integrated.'),
        crit('Comparison with data', 'Prediction compared with a measured value (GPS clocks, Mercury\'s 43″, the 1919 eclipse) with uncertainties.', 'Compared without uncertainties.', 'Not compared.'),
        crit('Approximation limits', 'The weak-field approximation\'s error estimated and shown small for the case studied.', 'Approximation named only.', 'Not considered.'),
      ],
      final: examFinal('a set built from 8.033\'s quizzes and the GRE relativity section', 'One spacetime model carried from symmetry and metric through geodesics and field equations to an observable.', 'Newtonian and flat-space limits recovered, and units restored.'),
    },
  },

  'condensed-matter-and-amo-foundations': {
    doc: 'docs/phys-term4-audit.md',
    outcomes: [
      o('ph502.crystals', 'Describe crystals by lattice and basis, and predict diffraction.', ['GRE-P Specialized Topics'], ['cmp.bragg'], [1], ['final']),
      o('ph502.bands', 'Explain Bloch states, band structure and Fermi surfaces.', ['GRE-P Specialized Topics', 'GRE-P Quantum Mechanics'], ['cmp.effmass', 'sm.fermi'], [2], ['applied', 'final']),
      o('ph502.semis', 'Analyse semiconductors, carriers and junctions.', ['GRE-P Specialized Topics'], ['cmp.intrinsic'], [3], ['final']),
      o('ph502.case', 'Infer a band or level model from spectral or transport data.', ['AAPT Modeling', 'AAPT Data Analysis and Visualization'], ['cmp.intrinsic', 'lab.fit'], [4], ['applied']),
      o('ph502.collective', 'Treat phonons, dielectric response and magnetism.', ['GRE-P Specialized Topics'], ['cmp.debye', 'pt.einstein'], [5], ['final']),
      o('ph502.atoms', 'Predict atomic structure, selection rules and spectra.', ['GRE-P Atomic Physics'], ['at.lande', 'q2.hydrogen', 'ch.hydrogen'], [6], ['final']),
      o('ph502.light', 'Describe light–matter interaction, line shapes and coherent control.', ['GRE-P Atomic Physics'], ['q2.rabi', 'at.lande'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource has no crystals and no atoms', why: '3.024 (Spring 2013) covers bands, semiconductors, optics and magnetism, but not crystal structure or diffraction (Unit 1) and none of the atomic, molecular and optical physics (Units 6–7).', fix: 'Unit 1 reads Tong\'s Solid State Physics Chapter 2; Units 6–7 read Tong\'s Topics in Quantum Mechanics Chapters 3–4.', url: 'https://davidtong.org/teaching/topics-in-quantum-mechanics/' },
      { what: 'No exam solutions', why: '3.024 posts its 2012 and 2013 exams without solutions.', fix: 'The benchmark asks that each answer be confirmed by an independent calculation before it is counted.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes diffraction from cubic crystals (checked by summing structure factors), band effective masses (checked by diagonalising a chain), intrinsic carriers (checked with Fermi–Dirac integrals), Debye heat capacity (checked by counting phonon modes) and Landé g-factors (checked by projecting J² in a product basis).' },
    ],
    benchmarks: [
      { id: 'ph502.exams', name: 'MIT 3.024 midterm and final (2013), each answer confirmed by calculation', how: 'No solutions are posted: count an answer right only when an independent calculation agrees; record the percentage.', max: 100, url: `${OCW}/3-024-electronic-optical-and-magnetic-properties-of-materials-spring-2013/pages/exams/` },
      { id: 'ph502.gre', name: 'GRE Physics practice test: atomic physics and specialised topics', how: 'Record the percentage right on those questions.', max: 100, url: GRE },
    ],
    rubrics: {
      applied: [
        crit('Open data', 'A published spectral or transport dataset used, with its source, units and uncertainties recorded.', 'Data used without provenance.', 'No data.'),
        crit('Model fitted', 'A band or level model (gap, effective mass, level spacing) fitted with uncertainties and residuals shown.', 'Fitted, no uncertainties.', 'Not fitted.'),
        crit('Prediction tested', 'The model\'s prediction for temperature, polarisation or composition tested against data it was not fitted to.', 'Tested on the fitting data only.', 'Not tested.'),
        crit('Limits of the model', 'Where the simple model fails (excitons, degeneracy, disorder) identified in the data.', 'Mentioned only.', 'Not considered.'),
      ],
      final: examFinal('a set built from 3.024\'s exams and the GRE atomic and specialised sections', 'One material or atomic observable carried from symmetry and quantum states through response to an experiment.', 'Free-electron, classical and weak-field limits checked.'),
    },
  },

  'research-methods-scientific-communication-proposal': {
    doc: 'docs/phys-term4-audit.md',
    outcomes: [
      o('rs501.question', 'Frame a research question that is novel, falsifiable and feasible.', ['AAPT Constructing Knowledge'], [], [1], ['final']),
      o('rs501.literature', 'Search, evaluate and synthesise the literature, citing correctly.', ['AAPT Communication'], [], [2], ['applied', 'final']),
      o('rs501.reproducible', 'Plan a reproducible, preregistered workflow with provenance.', ['AAPT Design'], [], [3], ['applied']),
      o('rs501.protocol', 'Write a replication or pilot protocol with stop criteria.', ['AAPT Design'], ['lab.trials'], [4], ['applied']),
      o('rs501.methods', 'Choose controls, power and validation, and fix decision rules in advance.', ['AAPT Design', 'AAPT Data Analysis and Visualization'], ['st.power', 'st.multiple', 'lab.trials'], [5], ['applied', 'final']),
      o('rs501.ethics', 'Identify ethical, safety and dual-use issues, and plan for them.', ['AAPT Communication'], ['eth.fairness'], [6], ['final']),
      o('rs501.plan', 'Plan milestones, resources, budget and contingencies.', ['AAPT Design'], [], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource has no teaching notes', why: '22.THT (Fall 2015) posts its assignment list, tools and sample prospectuses, but nothing on methods, reproducibility, ethics or planning.', fix: 'Units add the Turing Way, the Center for Open Science\'s preregistration guide, the NIST/SEMATECH handbook on experimental design and Junior Lab\'s ethics page.', url: 'https://book.the-turing-way.org/' },
      { what: 'OSF was unreachable', why: 'osf.io returned 503 on 16 and 17 October 2026.', fix: 'The preregistration reading links to the Center for Open Science, which runs OSF.' },
    ],
    benchmarks: [
      { id: 'rs501.prereg', name: 'Protocol preregistered before any data were collected', how: 'Record 1 when the public registration\'s timestamp precedes your first data.', max: 1, url: COS },
      { id: 'rs501.power', name: 'Planned sample size meets the stated power', how: 'Record 1 when an independent power calculation (simulation or a second tool) confirms the sample size gives at least 80% power for the stated effect.', max: 1, url: 'https://www.itl.nist.gov/div898/handbook/pri/pri.htm' },
    ],
    rubrics: {
      applied: [
        crit('Literature map', 'Key sources found, evaluated for quality and organised to show what is known and what is open.', 'Sources listed, not evaluated.', 'No map.'),
        crit('Methods and power', 'Controls, measurement, analysis and a sample size justified by a power calculation, all fixed in advance.', 'Methods without power.', 'Vague methods.'),
        crit('Data and provenance plan', 'Where data and code live, how versions are tracked and how others can rerun the analysis.', 'Partial plan.', 'None.'),
        crit('Hazards and stop criteria', 'Hazards assessed, resources costed and stop criteria stated before starting.', 'One of the three missing.', 'None.'),
      ],
      final: [
        crit('Falsifiable question', 'A question that a stated result would answer either way, placed in the literature.', 'Question clear, not falsifiable.', 'Vague.'),
        crit('Executable method', 'A method someone else could run from the proposal, with validation and fallbacks.', 'Method with gaps.', 'Not executable.'),
        crit('Schedule, ethics and risk', 'Milestones, budget, ethics and risk handled concretely.', 'Listed, not worked through.', 'Missing.'),
        crit('Public defense', 'The proposal presented clearly and questions answered from evidence, with revisions made afterwards.', 'Presented; questions partly answered.', 'Not defended.'),
      ],
    },
  },

  'astrophysics-stars-galaxies-high-energy-universe': {
    doc: 'docs/phys-term4-audit.md',
    outcomes: [
      o('as501.photometry', 'Convert between flux, luminosity, magnitude and distance.', ['GRE-P Specialized Topics'], ['as.distance'], [1], ['applied', 'final']),
      o('as501.radiation', 'Read spectra and radiation processes, allowing for telescopes and selection effects.', ['GRE-P Specialized Topics', 'GRE-P Optics and Wave Phenomena'], ['pt.planck', 'op.rayleigh'], [2], ['final']),
      o('as501.structure', 'Apply hydrostatic equilibrium and energy generation to stars.', ['GRE-P Specialized Topics'], ['pm.orbit', 'nu.alpha'], [3], ['final']),
      o('as501.cmd', 'Infer a cluster\'s distance and age from its colour–magnitude diagram.', ['AAPT Data Analysis and Visualization', 'AAPT Modeling'], ['as.distance', 'lab.fit'], [4], ['applied']),
      o('as501.remnants', 'Describe stellar evolution, remnants and compact objects.', ['GRE-P Specialized Topics'], ['sm.fermi', 'rel.radii'], [5], ['final']),
      o('as501.ism', 'Explain the interstellar medium, star formation and chemical evolution.', ['GRE-P Specialized Topics'], ['pt.boltzmann'], [6], ['final']),
      o('as501.galaxies', 'Weigh binaries and galaxies, and weigh the evidence for dark matter.', ['GRE-P Specialized Topics', 'GRE-P Classical Mechanics'], ['as.binary', 'pm.orbit'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource is algebra-based', why: 'OpenStax Astronomy 2e is written for non-majors: it describes stellar structure without the equations a physics major should derive (Unit 3).', fix: 'Unit 3 reads Onno Pols\'s free Stellar Structure and Evolution notes; 8.282J\'s quizzes with solutions become the benchmark.', url: 'https://www.astro.ru.nl/~onnop/education/stev_utrecht_notes/' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes the distance modulus with extinction (checked from flux ratios) and binary-star masses (checked by simulating the orbit), alongside blackbody radiation, orbits and compact objects.' },
    ],
    benchmarks: [
      { id: 'as501.quizzes', name: 'MIT 8.282J quizzes and the 2002 final, against the solutions', how: 'Record your average percentage.', max: 100, url: `${OCW}/8-282j-introduction-to-astronomy-spring-2006/pages/exams/` },
      { id: 'as501.gaia', name: 'Your cluster\'s distance agrees with Gaia\'s', how: 'Compare with the cluster\'s parallax distance in Cantat-Gaudin et al. (2020) on VizieR; record 1 if they agree within your uncertainty.', max: 1, url: 'https://vizier.cds.unistra.fr/viz-bin/VizieR?-source=J/A+A/640/A1' },
    ],
    rubrics: {
      applied: [
        crit('Catalogue and cuts', 'Cluster members selected from an open catalogue with proper-motion and parallax cuts, and the selection justified.', 'Members selected without justification.', 'No selection.'),
        crit('Distance and extinction', 'Distance modulus and extinction fitted together, with the degeneracy between them shown.', 'Fitted separately.', 'Not fitted.'),
        crit('Age from isochrones', 'Age estimated by fitting isochrones, with the uncertainty from metallicity and binaries discussed.', 'Age by eye.', 'No age.'),
        crit('Completeness and checks', 'Completeness and contamination estimated, and the distance checked against Gaia parallaxes.', 'One of the two.', 'Neither.'),
      ],
      final: examFinal('a set built from 8.282J\'s quizzes and finals', 'One evidence chain carried from detected radiation or dynamics to a claim about a star, galaxy or compact object.', 'Orders of magnitude, units and limiting cases checked.'),
    },
  },

  'quantum-information-and-amo': {
    doc: 'docs/phys-term4-audit.md',
    outcomes: [
      o('qs501.qubits', 'Represent qubits on the Bloch sphere and predict gates and measurements.', ['GRE-P Quantum Mechanics'], ['qi.circuit', 'pq.spin'], [1], ['final']),
      o('qs501.entangle', 'Analyse entanglement with tensor products, reduced states and Bell tests.', ['GRE-P Quantum Mechanics'], ['qi.entropy', 'qi.chsh'], [2], ['applied', 'final']),
      o('qs501.circuits', 'Build circuits from universal gates and count their resources.', ['GRE-P Quantum Mechanics'], ['qi.circuit'], [3], ['final']),
      o('qs501.protocol', 'Simulate a teleportation or interference protocol under noise and validate its statistics.', ['AAPT Modeling', 'AAPT Data Analysis and Visualization'], ['qi.channel', 'qi.circuit', 'lab.trials'], [4], ['applied']),
      o('qs501.channels', 'Describe mixed states, channels and decoherence.', ['GRE-P Quantum Mechanics'], ['qi.channel'], [5], ['applied', 'final']),
      o('qs501.information', 'Use entropy and distinguishability to reason about information.', ['GRE-P Quantum Mechanics'], ['qi.entropy', 'entropy'], [6], ['final']),
      o('qs501.control', 'Explain how atoms and spins are controlled and read out in experiments.', ['GRE-P Atomic Physics'], ['q2.rabi', 'at.lande'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource is not on OCW', why: '8.370x\'s OpenCourseWare page only points to edX, where the course has ended; there are no notes, problems or exams to use.', fix: 'Units read John Preskill\'s free Caltech Ph219 notes, Ronald de Wolf\'s free lecture notes (with exercise hints), and the Junior Lab NMR quantum-computing guide.', url: 'https://www.preskill.caltech.edu/ph229/' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes single-qubit circuits (checked by multiplying state vectors), CHSH values (checked with explicit operators), entanglement entropy (checked through Schmidt coefficients) and channel fidelities (checked by averaging Kraus maps over the Bloch sphere).' },
    ],
    benchmarks: [
      { id: 'qs501.dewolf', name: 'de Wolf exercises, Chapters 1–2, each answer confirmed by simulation', how: 'Check your answers against the hints in Appendix C and a state-vector simulation; record the percentage confirmed.', max: 100, url: 'https://arxiv.org/abs/1907.09415' },
      { id: 'qs501.hardware', name: 'Teleportation on real quantum hardware matches your noise model', how: 'Run your circuit on IBM\'s free cloud hardware; record 1 if the measured fidelity lies within the range your noise model predicts.', max: 1, url: 'https://quantum.cloud.ibm.com/' },
    ],
    rubrics: {
      applied: [
        crit('Protocol simulated', 'The protocol simulated with density matrices, and the noiseless case shown to work exactly.', 'Simulated with state vectors only.', 'Not simulated.'),
        crit('Two noise channels', 'At least two channels (for example depolarising and amplitude damping) applied, with fidelity against noise strength.', 'One channel.', 'None.'),
        crit('Analytic limits', 'Simulated fidelities matched to analytic results (such as 1 − p/2) and to the classical limit of 2/3.', 'Compared with one limit.', 'Not compared.'),
        crit('Statistics', 'Finite-shot statistics simulated, with error bars and the shots needed to distinguish the channels.', 'Error bars without a shot count.', 'None.'),
      ],
      final: oralFinal('A small quantum experiment or protocol', 'State preparation, controls, measurement, noise model and resource count each tied to a falsifiable test.'),
    },
  },

  'nuclear-physics-radiation-and-detectors': {
    doc: 'docs/phys-term4-audit.md',
    outcomes: [
      o('nu501.structure', 'Explain nuclear size and binding with the liquid-drop and shell models.', ['GRE-P Specialized Topics'], ['nu.alpha'], [1], ['final']),
      o('nu501.decay', 'Model decay and decay chains, and date samples by activity.', ['GRE-P Specialized Topics'], ['nu.chain', 'stoch.poisson'], [2], ['final']),
      o('nu501.interact', 'Predict stopping, attenuation and shielding.', ['GRE-P Specialized Topics'], ['nu.shield', 'nu.compton'], [3], ['applied', 'final']),
      o('nu501.spectrum', 'Calibrate a gamma spectrum and identify isotopes.', ['AAPT Data Analysis and Visualization', 'GRE-P Laboratory Methods'], ['nu.compton', 'lab.fit'], [4], ['applied']),
      o('nu501.detectors', 'Choose and explain gas, scintillation, semiconductor and calorimetric detectors.', ['GRE-P Laboratory Methods'], ['lab.adc'], [5], ['final']),
      o('nu501.counting', 'Handle counting statistics, background, efficiency and dead time.', ['GRE-P Laboratory Methods'], ['stoch.poisson', 'lab.trials', 'lab.weighted'], [6], ['applied', 'final']),
      o('nu501.reactions', 'Explain reactions, fission, fusion, dose and protection.', ['GRE-P Specialized Topics'], ['nu.shield'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource\'s readings are not free', why: '22.01 (Fall 2016) assigns chapters of Turner\'s textbook and posts no notes, though its problem sets and quizzes have solutions.', fix: 'Units read MIT 22.02\'s free notes, the Particle Data Group\'s reviews of particle interactions and detectors, and the Junior Lab Compton and Poisson guides.', url: 'https://pdg.lbl.gov/' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes decay chains (checked by integrating the rate equations), shielding (checked layer by layer), Compton edges (checked by solving the kinematics exactly) and alpha-decay energies (checked relativistically).' },
    ],
    benchmarks: [
      { id: 'nu501.psets', name: 'MIT 22.01 problem sets 2–6, against the solutions', how: 'Record your average percentage.', max: 100, url: `${OCW}/22-01-introduction-to-nuclear-engineering-and-ionizing-radiation-fall-2016/pages/assignments/` },
      { id: 'nu501.quizzes', name: 'MIT 22.01 Quizzes 1–2, against the solutions', how: 'Record your average percentage.', max: 100, url: `${OCW}/22-01-introduction-to-nuclear-engineering-and-ionizing-radiation-fall-2016/pages/exams/` },
    ],
    rubrics: {
      applied: [
        crit('Energy calibration', 'Peaks of known sources fitted, and an energy calibration with residuals and uncertainty built.', 'Calibrated without residuals.', 'Not calibrated.'),
        crit('Efficiency and background', 'Detection efficiency estimated and background subtracted with propagated counting errors.', 'One of the two.', 'Neither.'),
        crit('Identification', 'Peaks identified from energies and branching ratios, with Compton edges and escape peaks explained.', 'Identified, features unexplained.', 'Misidentified.'),
        crit('Detection limits', 'Detection limits and ambiguous identifications stated quantitatively.', 'Stated qualitatively.', 'Not stated.'),
      ],
      final: oralFinal('A detector-and-shielding analysis', 'Physics, calibration, uncertainty and dose assumptions traced to open data or simulation, with safety controls justified.'),
    },
  },
};
