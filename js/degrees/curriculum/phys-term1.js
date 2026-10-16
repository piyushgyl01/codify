/**
 * Physics, Term 1 — audited as Term 0 was.
 *
 * Outside graders: MIT 18.02SC, 18.03SC, 8.02X, 8.03SC and 18.05 exams and
 * quizzes with solutions; OSF preregistration. Evidence in
 * docs/phys-term1-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });
const examFinal = (source, linked, check) => [
  crit('Cumulative correctness', `At least 85% on a cumulative exam (${source}), marked against the official solutions.`, '60–84%.', 'Below 60%.'),
  crit('Linked solution', linked, 'Correct, with one step unjustified.', 'Disconnected calculations.'),
  crit('Limiting cases and units', check, 'Units checked, limiting cases not.', 'Neither.'),
  crit('Correction and defense', 'Every lost mark corrected, and the linked solution defended under questions.', 'Partial corrections.', 'None.'),
];
const labRubric = (setup, fit, compare) => [
  crit('Safe, documented set-up', setup, 'Set-up documented, safety or calibration incomplete.', 'Undocumented or unsafe.'),
  crit('Model fitted with uncertainty', fit, 'Fitted without parameter uncertainty.', 'No fit.'),
  crit('Error sources separated', 'Resolution, systematic bias and random scatter each estimated and kept apart in the budget.', 'Lumped together.', 'Not considered.'),
  crit('Reconciliation', compare, 'Compared, discrepancy unexplained.', 'Not compared.'),
];

export const PHYS_TERM1 = {
  'multivariable-and-vector-calculus': {
    doc: 'docs/phys-term1-audit.md',
    outcomes: [
      o('phm201.vectors', 'Work with vectors, coordinate systems and fields.', ['QAA-MSOR 3.8', 'GRE-P Electromagnetism'], ['dot', 'matmul'], [1], ['final']),
      o('phm201.gradient', 'Compute partial derivatives, gradients and linear approximations.', ['QAA-MSOR 3.8'], ['mv.gradient'], [2, 4], ['applied']),
      o('phm201.lagrange', 'Find constrained extrema with Lagrange multipliers.', ['QAA-MSOR 3.8'], ['mv.lagrange'], [3], ['final']),
      o('phm201.integrals', 'Evaluate multiple integrals with changes of variables.', ['QAA-MSOR 3.8'], ['mv.double'], [5], ['final']),
      o('phm201.flux', 'Compute line and surface integrals of fields.', ['GRE-P Electromagnetism'], ['mv.line', 'pe.faraday'], [6], ['applied', 'final']),
      o('phm201.theorems', 'Apply the divergence and Stokes theorems to physical fields.', ['GRE-P Electromagnetism', 'QAA-MSOR 3.10'], ['mv.divcurl', 'pe.gauss'], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.02SC front page.', fix: 'Each unit now links the 18.02SC session group that covers it.' },
      { what: 'One borrowed practice skill', why: 'Only "gradient" from the AI track.', fix: 'Practice now covers directional derivatives, Lagrange multipliers, double integrals, line integrals, divergence and curl, and Gauss\'s law.' },
    ],
    benchmarks: [
      { id: 'phm201.exams', name: 'MIT 18.02SC unit exams 1–4, against the solutions', how: 'Record your average.', max: 100, url: `${OCW}/18-02sc-multivariable-calculus-fall-2010/pages/1.-vectors-and-matrices/exam-1/` },
      { id: 'phm201.final', name: 'MIT 18.02SC final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/18-02sc-multivariable-calculus-fall-2010/pages/final-exam-1/final-exam/` },
    ],
    rubrics: {
      applied: [
        crit('Field reconstructed', 'A scalar field interpolated from the samples with the method and its assumptions stated.', 'Interpolated without stating assumptions.', 'Not reconstructed.'),
        crit('Gradient two ways', 'Gradient computed analytically from a fitted form and numerically from the samples, and compared.', 'One way only.', 'Not computed.'),
        crit('Flux two ways', 'Flux through a surface computed directly and by the divergence theorem, agreeing within the discretisation error.', 'One way only.', 'Not computed.'),
        crit('Discretisation error', 'The error measured as the sample spacing changes, with its order identified.', 'Error noted, not measured.', 'Ignored.'),
      ],
      final: examFinal('the 18.02SC final will do', 'One field problem taken through coordinates, a differential operator and an integral theorem.', 'Units and a limiting case (point source, uniform field) checked.'),
    },
  },

  'linear-algebra-and-differential-equations': {
    doc: 'docs/phys-term1-audit.md',
    outcomes: [
      o('phm202.systems', 'Solve linear systems and judge their conditioning.', ['QAA-MSOR 3.8', 'QAA-MSOR 3.16'], ['la.solve', 'na.cond'], [1], ['final']),
      o('phm202.spaces', 'Use bases, rank and orthogonality.', ['QAA-MSOR 3.8'], ['la.rank', 'm.proj'], [2], ['final']),
      o('phm202.eigen', 'Find eigenvalues and eigenvectors and interpret them as normal modes.', ['QAA-MSOR 3.8', 'GRE-P Classical Mechanics'], ['la.eig2', 'pw.modes'], [3, 4], ['applied', 'final']),
      o('phm202.first', 'Solve first-order ODEs.', ['QAA-MSOR 3.8'], ['de.linear1'], [5], ['final']),
      o('phm202.systemsode', 'Analyse linear systems of ODEs by phase portraits and stability.', ['QAA-MSOR 3.10'], ['de.phase', 'de.equilibria'], [6], ['final']),
      o('phm202.forcing', 'Use Laplace transforms for forcing, resonance and Green\'s functions.', ['QAA-MSOR 3.10', 'GRE-P Classical Mechanics'], ['de.laplace', 'de.oscillator'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'The resource has no linear algebra', why: '18.03SC is differential equations; Units 1–3 (systems, rank, eigenvalues) are not in it.', fix: 'Those units read 18.06SC.', url: `${OCW}/18-06sc-linear-algebra-fall-2011/` },
      { what: 'Practice was borrowed', why: 'Dot products, matrix multiplication and eigenvalues from the AI track.', fix: 'Practice now covers elimination, rank, conditioning, normal modes, first-order and phase-plane ODEs, and Laplace transforms.' },
    ],
    benchmarks: [
      { id: 'phm202.final', name: 'MIT 18.03SC final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/18-03sc-differential-equations-fall-2011/pages/final-exam/` },
      { id: 'phm202.la', name: 'MIT 18.06SC Exam 2, against the solutions', how: 'Record your percentage.', max: 100, url: `${OCW}/18-06sc-linear-algebra-fall-2011/pages/least-squares-determinants-and-eigenvalues/exam-2/` },
    ],
    rubrics: {
      applied: [
        crit('Matrix constructed', 'The coupled-oscillator equations written as Mẍ = −Kx with every entry derived from the springs and masses.', 'Matrix right, derivation missing.', 'Wrong matrix.'),
        crit('Modes inferred', 'Eigenfrequencies and mode shapes computed and each mode\'s motion described physically.', 'Computed, not interpreted.', 'Not computed.'),
        crit('Analytic versus numerical', 'Modal superposition agrees with a direct numerical integration from the same initial conditions.', 'One method only.', 'They disagree.'),
        crit('Sensitivity', 'How the frequencies move with a parameter (a stiffer coupling, a heavier mass) computed and explained, including near-degenerate modes.', 'Shown for one parameter.', 'None.'),
      ],
      final: examFinal('the 18.03SC final will do', 'One problem spanning a linear system, its eigenproblem, a forced ODE and its stability.', 'Limiting cases (no damping, no coupling) checked against known solutions.'),
    },
  },

  'electricity-magnetism-and-circuits': {
    doc: 'docs/phys-term1-audit.md',
    outcomes: [
      o('ph201.fields', 'Compute electric fields of charge distributions.', ['GRE-P Electromagnetism'], ['pe.coulomb'], [1], ['final']),
      o('ph201.gauss', 'Use Gauss\'s law, potential and capacitance.', ['GRE-P Electromagnetism'], ['pe.gauss'], [2], ['final']),
      o('ph201.circuits', 'Analyse DC circuits with Kirchhoff\'s laws and use instruments correctly.', ['GRE-P Electromagnetism', 'AAPT Technical and Practical Laboratory Skills'], ['ohm', 'divider'], [3], ['final']),
      o('ph201.rc', 'Measure an RC time constant and reconcile it with component tolerances.', ['AAPT Technical and Practical Laboratory Skills', 'AAPT Data Analysis and Visualization'], ['pe.rc', 'lab.propagate'], [4], ['applied']),
      o('ph201.magnetism', 'Compute magnetic fields and forces.', ['GRE-P Electromagnetism'], ['pe.wire', 'pe.cyclotron'], [5], ['final']),
      o('ph201.induction', 'Use Faraday\'s law, inductance and magnetic energy.', ['GRE-P Electromagnetism'], ['pe.faraday'], [6], ['final']),
      o('ph201.ac', 'Analyse AC response and resonance, and assemble Maxwell\'s equations.', ['GRE-P Electromagnetism'], ['pe.rlc'], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 8.02X front page.', fix: 'Each unit now links the 8.02X lecture notes that cover it.' },
      { what: 'Practice was borrowed', why: 'Ohm\'s law and voltage dividers from the Robotics track.', fix: 'Practice now covers point-charge fields, Gauss\'s law, RC circuits, fields of wires and solenoids, cyclotron motion, induction and RLC resonance — each checked by summing sources or integrating the circuit.' },
    ],
    benchmarks: [
      { id: 'ph201.quizzes', name: 'MIT 8.02X quizzes 1–4, against the solutions', how: 'Sit each under time; record your average.', max: 100, url: `${OCW}/8-02x-physics-ii-electricity-magnetism-with-an-experimental-focus-spring-2005/pages/exams/` },
    ],
    rubrics: {
      applied: labRubric('A current-limited low-voltage RC circuit (or a simulator), with component values and tolerances recorded before measuring.', 'The charging curve fitted to V(1 − e^{−t/τ}) (or a log-linear fit) with an uncertainty on τ.', 'Measured τ compared with RC from the components\' tolerances, and any discrepancy (meter input impedance, capacitor leakage) explained.'),
      final: examFinal('the 8.02X quizzes will do', 'One investigation that links a field calculation to a circuit measurement.', 'Units, limiting cases (t → 0, t → ∞, R → 0) and the measured values checked.'),
    },
  },

  'waves-oscillations-and-optics': {
    doc: 'docs/phys-term1-audit.md',
    outcomes: [
      o('ph202.shm', 'Model simple, damped and driven oscillators.', ['GRE-P Classical Mechanics', 'GRE-P Optics and Wave Phenomena'], ['pm.oscillator', 'de.oscillator'], [1], ['final']),
      o('ph202.modes', 'Find normal modes of coupled systems and resonance.', ['GRE-P Optics and Wave Phenomena'], ['pw.modes'], [2], ['final']),
      o('ph202.waves', 'Solve the wave equation and track energy transport.', ['GRE-P Optics and Wave Phenomena'], ['pw.string', 'pw.doppler'], [3], ['final']),
      o('ph202.dispersion', 'Measure a standing-wave spectrum and fit a dispersion model.', ['AAPT Modeling', 'AAPT Data Analysis and Visualization'], ['pw.string', 'lab.fit'], [4], ['applied']),
      o('ph202.fourier', 'Build packets by Fourier superposition and reason about coherence.', ['GRE-P Optics and Wave Phenomena'], ['fa.fourier', 'cm.dft'], [5], ['final']),
      o('ph202.geometric', 'Trace rays through lenses and form images.', ['GRE-P Optics and Wave Phenomena'], ['pw.lens', 'pw.snell'], [6], ['final']),
      o('ph202.interference', 'Analyse interference, diffraction and polarisation.', ['GRE-P Optics and Wave Phenomena'], ['pw.slits', 'pw.polar'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'The resource skips geometric optics', why: '8.03SC (Fall 2016) goes from waves to polarisation and interference; lenses and imaging (Unit 6) are not in it.', fix: 'Unit 6 reads OpenStax University Physics Volume 3, Chapter 2.', url: 'https://openstax.org/books/university-physics-volume-3/pages/2-introduction' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers normal modes, string harmonics, Doppler, lenses, refraction, slits and gratings, and polarisation — each checked by simulation, ray tracing, least time or summing wave amplitudes. Checking them caught two flawed checks in the first draft.' },
    ],
    benchmarks: [
      { id: 'ph202.final', name: 'MIT 8.03SC final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/8-03sc-physics-iii-vibrations-and-waves-fall-2016/pages/final-exam/` },
    ],
    rubrics: {
      applied: labRubric('A string or air column driven (or simulated) across a frequency range, with tension, length and density measured.', 'Resonant frequencies fitted to fₙ = nv/2L plus a stiffness term, with parameter uncertainties.', 'The fitted wave speed compared with √(T/μ), and any dispersion explained.'),
      final: examFinal('the 8.03SC final will do', 'One wave or imaging experiment taken from its governing equation, through calibration and a Fourier reading of the data, to a result.', 'Limiting cases (small angle, thin lens, long wavelength) and units checked.'),
    },
  },

  'probability-data-and-experimental-methods': {
    doc: 'docs/phys-term1-audit.md',
    outcomes: [
      o('dt201.probability', 'Reason with conditional probability, and check by simulation.', ['GRE-P Laboratory Methods'], ['pr.bayes', 'pr.indep'], [1], ['final']),
      o('dt201.distributions', 'Work with discrete and continuous distributions.', ['GRE-P Laboratory Methods'], ['pr.discrete', 'pr.continuous', 'stoch.poisson'], [2], ['final']),
      o('dt201.propagation', 'Use expectation, variance and covariance to propagate uncertainty.', ['AAPT Data Analysis and Visualization'], ['pr.cov', 'lab.propagate'], [3], ['final']),
      o('dt201.estimate', 'Estimate a physical parameter from noisy data, blinded.', ['AAPT Data Analysis and Visualization'], ['stoch.mle', 'lab.weighted'], [4], ['applied']),
      o('dt201.intervals', 'Build confidence intervals and validate their coverage by simulation.', ['GRE-P Laboratory Methods'], ['st.ci', 'pr.clt'], [5], ['applied']),
      o('dt201.regression', 'Fit regressions, read residuals and compare models.', ['AAPT Data Analysis and Visualization'], ['lab.fit', 'linreg'], [6], ['final']),
      o('dt201.tests', 'Test hypotheses with power in mind, and control multiple testing.', ['GRE-P Laboratory Methods'], ['st.power', 'st.multiple', 'st.permtest'], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.05 front page.', fix: 'Each unit now links the 18.05 class reading that covers it.' },
      { what: 'Practice was borrowed', why: 'Summary statistics, Bayes and variance from the AI track.', fix: 'Practice now covers distributions, propagation, weighted estimates, maximum likelihood, intervals, regression, power and multiple testing.' },
    ],
    benchmarks: [
      { id: 'dt201.exams', name: 'MIT 18.05 (Spring 2022) exams, against the solutions', how: 'Record your average.', max: 100, url: `${OCW}/18-05-introduction-to-probability-and-statistics-spring-2022/pages/exams/` },
      { id: 'dt201.prereg', name: 'Final investigation preregistered on OSF before data collection', how: 'Record 1 when the registration\'s timestamp precedes your first data.', max: 1, url: 'https://osf.io/prereg/' },
    ],
    rubrics: {
      applied: [
        crit('Blinding', 'The analysis fixed (with an offset or hidden scale) before the result was seen, then unblinded once.', 'Partially blinded.', 'Not blinded.'),
        crit('Estimate with uncertainty', 'The parameter estimated by maximum likelihood or least squares with a standard error.', 'Point estimate only.', 'None.'),
        crit('Coverage validated', 'Simulation shows the interval covers the true value at its stated rate under the assumed noise.', 'Coverage asserted.', 'Not checked.'),
        crit('Every choice documented', 'Every data cut and analysis choice recorded with its reason before unblinding.', 'Some choices undocumented.', 'Undocumented.'),
      ],
      final: [
        crit('Preregistration and power', 'Hypotheses, analysis and sample size (from a power calculation) registered before the data.', 'Registered without power analysis.', 'Not registered.'),
        crit('Diagnostics', 'Model assumptions checked with residuals and the result tested for sensitivity to them.', 'Some diagnostics.', 'None.'),
        crit('Uncertainty and multiplicity', 'Every claim has its uncertainty; multiple comparisons are controlled.', 'One of the two.', 'Neither.'),
        crit('Reproducible report', 'One command reproduces every number and figure from the raw data.', 'Mostly reproducible.', 'Not reproducible.'),
      ],
    },
  },
};
