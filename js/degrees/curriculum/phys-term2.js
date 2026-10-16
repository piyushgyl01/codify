/**
 * Physics, Term 2 — audited as Terms 0–1 were.
 *
 * Outside graders: MIT 8.223 problem sets with solutions; 8.07 quizzes and
 * 8.044 exams with solutions; 8.04's tests; ETS's GRE Physics practice
 * test. Evidence in docs/phys-term2-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';
const GRE = 'https://www.ets.org/gre/test-takers/subject-tests/about/content-structure.html';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });
const examFinal = (source, linked, check) => [
  crit('Cumulative correctness', `At least 85% on a cumulative exam (${source}), marked against the official solutions.`, '60–84%.', 'Below 60%.'),
  crit('Linked solution', linked, 'Correct, with one step unjustified.', 'Disconnected calculations.'),
  crit('Limiting cases and units', check, 'Units checked, limiting cases not.', 'Neither.'),
  crit('Correction and defense', 'Every lost mark corrected, and the linked solution defended under questions.', 'Partial corrections.', 'None.'),
];

export const PHYS_TERM2 = {
  'analytical-mechanics-1': {
    doc: 'docs/phys-term2-audit.md',
    outcomes: [
      o('ph301.coords', 'Choose generalised coordinates and handle constraints.', ['GRE-P Classical Mechanics'], ['pm.incline'], [1], ['final']),
      o('ph301.lagrange', 'Derive equations of motion from the action.', ['GRE-P Classical Mechanics'], ['pa.hoop', 'cv.euler'], [2], ['applied', 'final']),
      o('ph301.noether', 'Find conserved quantities from symmetries.', ['GRE-P Classical Mechanics'], ['pm.collision'], [3], ['final']),
      o('ph301.double', 'Model a double pendulum or coupled rotor and validate it numerically.', ['AAPT Modeling', 'GRE-P Classical Mechanics'], ['de.euler', 'na.order'], [4], ['applied']),
      o('ph301.central', 'Analyse central-force motion, effective potentials and scattering.', ['GRE-P Classical Mechanics'], ['pm.orbit', 'pa.scatter'], [5], ['final']),
      o('ph301.rigid', 'Describe rigid bodies with the inertia tensor and Euler\'s equations.', ['GRE-P Classical Mechanics'], ['pm.rolling'], [6], ['final']),
      o('ph301.modes', 'Find small-oscillation modes and the continuum limit.', ['GRE-P Classical Mechanics'], ['pw.modes', 'pw.string'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource skips rigid bodies', why: '8.223 (IAP 2017) is a short course: Lagrangians, central forces, oscillators and Hamiltonians, but no rigid bodies (Unit 6).', fix: 'Unit 6 reads Chapter 3 of David Tong\'s free Cambridge notes, Classical Dynamics.', url: 'https://davidtong.org/teaching/classical-dynamics/' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes the bead on a spinning hoop and Rutherford scattering, each checked by integrating the motion, alongside the mechanics skills.' },
    ],
    benchmarks: [
      { id: 'ph301.psets', name: 'MIT 8.223 problem sets 1–4, against the solutions', how: 'Record your average percentage.', max: 100, url: `${OCW}/8-223-classical-mechanics-ii-january-iap-2017/pages/assignments/` },
      { id: 'ph301.gre', name: 'GRE Physics practice test: classical mechanics questions', how: 'Take ETS\'s free practice test (from the content page); record the percentage right on the mechanics questions.', max: 100, url: GRE },
    ],
    rubrics: {
      applied: [
        crit('Derivation from the action', 'Coordinates chosen, L = T − U written, and the Euler–Lagrange equations derived in full.', 'Equations stated, derivation thin.', 'Wrong equations.'),
        crit('Numerical integration', 'Integrated with a symplectic or high-order method, with the step size justified.', 'Integrated, step not justified.', 'Not integrated.'),
        crit('Conservation drift', 'Energy drift measured against step size and method, and explained.', 'Drift shown, not explained.', 'Not measured.'),
        crit('Chaos and comparison', 'Sensitivity to initial conditions shown (diverging nearby trajectories), and small-angle results compared with normal modes.', 'One of the two.', 'Neither.'),
      ],
      final: examFinal('a set built from 8.223\'s problems and the GRE mechanics section', 'One constrained system taken from coordinate choice through symmetry and dynamics to a validated result.', 'Limiting cases (small angle, one mass to zero) and units checked.'),
    },
  },

  'electromagnetic-theory-1': {
    doc: 'docs/phys-term2-audit.md',
    outcomes: [
      o('ph302.fields', 'Compute electrostatic fields of distributions and use uniqueness.', ['GRE-P Electromagnetism'], ['pe.coulomb', 'pe.gauss'], [1], ['final']),
      o('ph302.laplace', 'Solve Poisson and Laplace problems with boundary conditions.', ['GRE-P Electromagnetism'], ['pe.laplace'], [2], ['applied', 'final']),
      o('ph302.images', 'Use images, separation of variables and multipoles.', ['GRE-P Electromagnetism'], ['pe.image', 'mm.legendre'], [3], ['applied', 'final']),
      o('ph302.solver', 'Build and benchmark a numerical boundary-value solver.', ['AAPT Modeling', 'GRE-P Electromagnetism'], ['pe.laplace', 'cm.kmatrix'], [4], ['applied']),
      o('ph302.dielectrics', 'Handle dielectrics, polarisation and field energy.', ['GRE-P Electromagnetism'], ['pe.gauss'], [5], ['final']),
      o('ph302.magneto', 'Solve magnetostatics with the vector potential and multipoles.', ['GRE-P Electromagnetism'], ['pe.wire'], [6], ['final']),
      o('ph302.maxwell', 'Treat magnetic media, induction and Maxwell\'s equations.', ['GRE-P Electromagnetism'], ['pe.faraday'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource skips dielectrics', why: '8.07 (Fall 2012) notes cover magnetic matter but not dielectrics (Unit 5).', fix: 'Unit 5 reads Chapter 7 of Tong\'s free Electromagnetism notes.', url: 'https://davidtong.org/teaching/electromagnetism/' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers image charges (checked by integrating induced surface charge), Laplace boundary-value problems (checked by grid relaxation) and Legendre expansions.' },
    ],
    benchmarks: [
      { id: 'ph302.quizzes', name: 'MIT 8.07 quizzes 1–2, against the solutions', how: 'Record your average.', max: 100, url: `${OCW}/8-07-electromagnetism-ii-fall-2012/pages/exams/` },
    ],
    rubrics: {
      applied: [
        crit('Analytic solution', 'The boundary-value problem solved analytically (images or separation of variables) with uniqueness invoked.', 'Solved, uniqueness not argued.', 'Not solved.'),
        crit('Numerical solution', 'A grid solver (relaxation or finite elements) built and run on the same problem.', 'Solver from a library, not understood.', 'None.'),
        crit('Convergence and agreement', 'Numerical error measured against the analytic solution as the grid is refined, at the expected order.', 'Agreement shown on one grid.', 'Disagree.'),
        crit('Energy and asymptotics', 'Field energy computed both ways, and the far field compared with the leading multipole.', 'One of the two.', 'Neither.'),
      ],
      final: examFinal('8.07\'s final will do', 'One field solution taken from source model and boundary conditions, through uniqueness, to energy and asymptotics.', 'Limiting cases (far field, thin shell, no dielectric) and units checked.'),
    },
  },

  'quantum-mechanics-1': {
    doc: 'docs/phys-term2-audit.md',
    outcomes: [
      o('ph303.states', 'Describe states by amplitudes and compute Born probabilities.', ['GRE-P Quantum Mechanics'], ['pq.spin'], [1], ['final']),
      o('ph303.operators', 'Use operators, eigenstates and observables.', ['GRE-P Quantum Mechanics'], ['pq.expect', 'la.eig2'], [2], ['final']),
      o('ph303.schrodinger', 'Solve for stationary states and track probability current.', ['GRE-P Quantum Mechanics'], ['pq.box'], [3], ['final']),
      o('ph303.wells', 'Compute finite-well bound states and tunnelling.', ['GRE-P Quantum Mechanics'], ['pq.finite', 'pq.tunnel'], [4], ['applied']),
      o('ph303.oscillator', 'Solve the harmonic oscillator with ladder operators.', ['GRE-P Quantum Mechanics'], ['pq.oscillator'], [5], ['final']),
      o('ph303.uncertainty', 'Use commutators and the uncertainty principle.', ['GRE-P Quantum Mechanics'], ['pq.expect'], [6], ['final']),
      o('ph303.packets', 'Evolve wave packets and update states on measurement.', ['GRE-P Quantum Mechanics'], ['fa.fourier'], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 8.04 front page.', fix: 'Each unit now links the 8.04 lecture notes that cover it.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers the infinite and finite wells, tunnelling, the oscillator, spin measurements and expectation values — checked by diagonalising discretised Hamiltonians and integrating the Schrödinger equation through the barrier.' },
    ],
    benchmarks: [
      { id: 'ph303.tests', name: 'MIT 8.04 tests 1–2 and final (Fall 2015)', how: 'Sit them under time; mark against the course\'s published solutions where available; record your average.', max: 100, url: `${OCW}/8-04-quantum-physics-i-spring-2016/pages/exams/` },
      { id: 'ph303.gre', name: 'GRE Physics practice test: quantum and atomic questions', how: 'Record the percentage right on those questions.', max: 100, url: GRE },
    ],
    rubrics: {
      applied: [
        crit('Bound states', 'Bound-state energies of the finite well found from the matching conditions and confirmed by a discretised Hamiltonian.', 'One method only.', 'Wrong energies.'),
        crit('Scattering states', 'Transmission and reflection computed across energies, with T + R = 1 checked.', 'Computed, unitarity not checked.', 'Not computed.'),
        crit('Normalisation and current', 'Bound states normalised and probability current shown constant across the barrier.', 'One of the two.', 'Neither.'),
        crit('Tunnelling sensitivity', 'How transmission depends on width, height and energy mapped, with the exponential regime identified.', 'Mapped for one parameter.', 'Not mapped.'),
      ],
      final: examFinal('8.04\'s final will do', 'One prediction taken from state preparation, through time evolution, to the statistics of a measurement.', 'Classical and limiting cases (large n, wide barrier) checked.'),
    },
  },

  'thermal-physics': {
    doc: 'docs/phys-term2-audit.md',
    outcomes: [
      o('ph304.state', 'Use temperature, equilibrium and equations of state.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['ch.gibbs'], [1], ['final']),
      o('ph304.firstlaw', 'Apply the first law to work, heat and internal energy.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['pt.ideal', 'ch.calorimetry'], [2], ['final']),
      o('ph304.entropy', 'Compute entropy changes and use the second law.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['pt.entropy'], [3], ['final']),
      o('ph304.heatcap', 'Measure a heat capacity and model the losses.', ['AAPT Technical and Practical Laboratory Skills', 'AAPT Data Analysis and Visualization'], ['pt.einstein', 'lab.fit'], [4], ['applied']),
      o('ph304.potentials', 'Use thermodynamic potentials and Maxwell relations.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['pt.boltzmann'], [5], ['final']),
      o('ph304.engines', 'Bound the efficiency of engines and refrigerators.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['pt.carnot'], [6], ['final']),
      o('ph304.phases', 'Treat phase equilibrium, stability and response functions.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['pt.planck'], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 8.044 front page.', fix: 'Each unit now links the 8.044 lecture or notes that cover it.' },
      { what: 'Practice was one entropy question from the AI track', why: 'Information entropy, not thermodynamics.', fix: 'Practice now covers ideal-gas processes, engines, entropy changes, Boltzmann factors, Einstein heat capacity and blackbody radiation — checked by integrating paths, simulating a Carnot cycle, Metropolis sampling and Planck\'s law.' },
    ],
    benchmarks: [
      { id: 'ph304.exams', name: 'MIT 8.044 exams 1–2 and final, against the solutions', how: 'Record your average.', max: 100, url: `${OCW}/8-044-statistical-physics-i-spring-2013/pages/exams/` },
    ],
    rubrics: {
      applied: [
        crit('Safe transient measured', 'A safe heating or cooling transient measured (or an open dataset used), with sensor calibration.', 'Measured without calibration.', 'No data.'),
        crit('Heat capacity and loss fitted', 'A lumped model with heat capacity and a loss coefficient fitted to the transient, with uncertainties.', 'Fitted without uncertainties.', 'Not fitted.'),
        crit('Energy account', 'Energy supplied, stored and lost balanced within uncertainty.', 'Balanced loosely.', 'Not balanced.'),
        crit('Entropy account', 'Entropy produced computed and shown non-negative, located where the irreversibility is.', 'Computed without interpretation.', 'Not computed.'),
      ],
      final: examFinal('an 8.044 exam will do', 'One real or simulated cycle drawn on state diagrams, with efficiency bounds and the sources of irreversibility.', 'The Carnot bound and units checked.'),
    },
  },

  'mathematical-methods-for-physics': {
    doc: 'docs/phys-term2-audit.md',
    outcomes: [
      o('phm303.complex', 'Use analytic functions and contour integration.', ['QAA-MSOR 3.10', 'GRE-P Specialized Topics'], ['cx.residue', 'cx.cr'], [1], ['final']),
      o('phm303.fourier', 'Use Fourier series and transforms, and spectra.', ['QAA-MSOR 3.10'], ['fa.fourier', 'fa.parseval', 'cm.dft'], [2], ['final']),
      o('phm303.pdes', 'Classify PDEs and pose boundary-value problems.', ['QAA-MSOR 3.10'], ['pde.classify'], [3], ['final']),
      o('phm303.spectral', 'Solve boundary-value problems by spectral expansion and measure truncation error.', ['QAA-MSOR 3.16', 'AAPT Modeling'], ['pe.laplace', 'pde.heat'], [4], ['applied']),
      o('phm303.green', 'Use Green\'s functions and impulse responses.', ['QAA-MSOR 3.10'], ['de.laplace'], [5], ['final']),
      o('phm303.special', 'Expand in orthogonal special functions.', ['QAA-MSOR 3.10'], ['mm.legendre'], [6], ['applied', 'final']),
      o('phm303.asymptotic', 'Use tensors, scaling, perturbation and asymptotics.', ['QAA-MSOR 3.18'], ['mod.pi'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource cannot be mapped', why: 'The NPTEL course page loads its syllabus only in a browser, so which lecture covers what could not be checked.', fix: 'Each unit now reads MIT notes that cover it (18.04, 18.03SC, 18.152, 18.085, 8.07); NPTEL stays linked for its lecture videos.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice draws on residues, Fourier coefficients, PDE classification, Laplace problems, Green\'s functions and Legendre expansions.' },
    ],
    benchmarks: [
      { id: 'phm303.gre', name: 'GRE Physics practice test: overall score', how: 'Take the full practice test under time; record your percentage.', max: 100, url: GRE },
    ],
    rubrics: {
      applied: [
        crit('Spectral solution', 'The problem\'s eigenfunctions found, and the solution written as their series with coefficients derived.', 'Series written, coefficients not derived.', 'Not solved.'),
        crit('Computation', 'The truncated series evaluated numerically and compared with an independent numerical solution.', 'Evaluated, not compared.', 'Not computed.'),
        crit('Truncation error', 'Error measured against the number of terms, with its rate explained by the smoothness of the data.', 'Measured without explanation.', 'Not measured.'),
        crit('Gibbs and convergence', 'Non-uniform convergence near discontinuities identified and handled.', 'Noted only.', 'Ignored.'),
      ],
      final: examFinal('a set built from the course\'s exercises', 'A justification of why the chosen transform, Green\'s function, basis or asymptotic method suits the problem, then its solution.', 'Limiting cases and the dimensions of every term checked.'),
    },
  },
};
