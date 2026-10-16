/**
 * Physics, Term 3 — audited as Terms 0–2 were.
 *
 * Outside graders: MIT 8.311 problem sets and 8.333 exam reviews with
 * solutions; 22.15's worked exercise; 8.05's and 22.15's past finals; ETS's
 * GRE Physics practice test. Evidence in docs/phys-term3-audit.md.
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

export const PHYS_TERM3 = {
  'advanced-classical-and-nonlinear-dynamics': {
    doc: 'docs/phys-term3-audit.md',
    outcomes: [
      o('ph401.hamilton', 'Write Hamiltonians and follow the flow in phase space, using Liouville\'s theorem.', ['GRE-P Classical Mechanics'], ['pa.hoop', 'de.phase'], [1], ['final']),
      o('ph401.canonical', 'Use Poisson brackets and canonical transformations to find conserved quantities.', ['GRE-P Classical Mechanics'], ['pm.orbit'], [2], ['final']),
      o('ph401.action', 'Solve problems by Hamilton–Jacobi and action-angle variables.', ['GRE-P Classical Mechanics'], ['pm.oscillator', 'pa.pendulum'], [3], ['final']),
      o('ph401.separatrix', 'Map a nonlinear pendulum\'s fixed points and separatrix numerically.', ['AAPT Modeling', 'GRE-P Classical Mechanics'], ['pa.pendulum', 'de.equilibria', 'na.order'], [4], ['applied']),
      o('ph401.perturb', 'Treat perturbations, resonance and adiabatic invariants.', ['GRE-P Classical Mechanics'], ['pa.pendulum'], [5], ['final']),
      o('ph401.chaos', 'Recognise chaos in maps and flows, and estimate Lyapunov exponents.', ['AAPT Modeling'], ['ds.logistic', 'ds.lyapunov', 'ds.bifurcation'], [6], ['applied', 'final']),
      o('ph401.continuum', 'Take the continuum limit of coupled oscillators to fields and their modes.', ['GRE-P Classical Mechanics'], ['pw.modes', 'pw.string'], [7], ['final']),
    ],
    gaps: [
      { what: 'No exams or solutions', why: '8.09 (Fall 2014) posts chapter notes and ten problem sets, but no exams and no solutions.', fix: 'The benchmarks are the GRE mechanics questions and 8.09\'s problem sets, with each answer confirmed by simulation. ChaosBook\'s exercises (free, with solutions) are a further check on Unit 6.', url: 'https://chaosbook.org/' },
      { what: 'Thin on Poisson brackets and adiabatic invariants', why: '8.09 Chapter 4 covers canonical transformations, but Liouville\'s theorem and adiabatic invariants get little space.', fix: 'Unit 2 reads Chapter 4 of Tong\'s free Classical Dynamics; Unit 5 points to its §4.6.', url: 'https://davidtong.org/teaching/classical-dynamics/' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes the large-amplitude pendulum (checked by integrating the motion), with the logistic map, Lyapunov exponents, bifurcations and normal modes.' },
    ],
    benchmarks: [
      { id: 'ph401.gre', name: 'GRE Physics practice test: classical mechanics questions', how: 'Record the percentage right on the mechanics questions.', max: 100, url: GRE },
      { id: 'ph401.psets', name: 'MIT 8.09 problem sets 5–7 and 10, each answer confirmed by simulation', how: 'No solutions are posted: count an answer right only when an independent simulation agrees with it; record the percentage.', max: 100, url: `${OCW}/8-09-classical-mechanics-iii-fall-2014/pages/assignments/` },
    ],
    rubrics: {
      applied: [
        crit('Phase portrait', 'Fixed points found and classified, and the separatrix drawn from the energy and confirmed by trajectories.', 'Portrait drawn, fixed points not classified.', 'No portrait.'),
        crit('Parameter sweep', 'The driven or damped system swept across parameters, with transitions (period doubling, onset of chaos) located.', 'Swept, transitions not located.', 'No sweep.'),
        crit('Lyapunov exponent', 'The largest Lyapunov exponent estimated with renormalised separation, and shown to converge in time and step size.', 'Estimated, convergence not shown.', 'Not estimated.'),
        crit('Independent check', 'The period against the elliptic-integral formula and the integrator checked against a second method.', 'One check.', 'None.'),
      ],
      final: examFinal('a set built from 8.09\'s problem sets and the GRE mechanics section', 'One system taken from integrable form through perturbation and resonance to its chaotic regime, with a computation to back each claim.', 'Small-amplitude and weak-perturbation limits checked.'),
    },
  },

  'electrodynamics-and-radiation': {
    doc: 'docs/phys-term3-audit.md',
    outcomes: [
      o('ph402.gauge', 'Write Maxwell\'s equations with potentials and choose a gauge.', ['GRE-P Electromagnetism'], ['pe.faraday'], [1], ['final']),
      o('ph402.waves', 'Propagate plane waves and match them at interfaces.', ['GRE-P Electromagnetism', 'GRE-P Optics and Wave Phenomena'], ['pw.snell', 'pw.polar'], [2], ['final']),
      o('ph402.guides', 'Find waveguide and cavity modes and their cutoffs.', ['GRE-P Electromagnetism'], ['pr.waveguide', 'pw.string'], [3], ['applied', 'final']),
      o('ph402.benchmark', 'Benchmark a numerical waveguide or antenna field against analytic modes.', ['AAPT Modeling', 'GRE-P Electromagnetism'], ['pr.waveguide', 'pe.laplace', 'cm.kmatrix'], [4], ['applied']),
      o('ph402.radiation', 'Compute radiation from retarded potentials and multipoles.', ['GRE-P Electromagnetism'], ['pr.larmor'], [5], ['applied', 'final']),
      o('ph402.scatter', 'Estimate scattering cross-sections and radiation reaction.', ['GRE-P Electromagnetism'], ['pr.larmor'], [6], ['final']),
      o('ph402.covariant', 'Write electrodynamics covariantly and transform fields between frames.', ['GRE-P Special Relativity', 'GRE-P Electromagnetism'], ['pm.lorentz', 'pm.invariant'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource has almost no notes', why: '8.311 (Spring 2004) posts four handouts and twelve problem sets; there are no notes for most units and no exams.', fix: 'Units read Richard Fitzpatrick\'s free Classical Electromagnetism and Tong\'s Electromagnetism by chapter; 8.311\'s problem sets with solutions become the benchmark.', url: 'https://farside.ph.utexas.edu/teaching/jk1/Electromagnetism.pdf' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes waveguide cutoffs (checked by the eigenvalues of the discretised cross-section) and Larmor radiation (checked by integrating the far-field Poynting flux), with refraction, polarisation and Lorentz transformations.' },
    ],
    benchmarks: [
      { id: 'ph402.psets', name: 'MIT 8.311 problem sets 6 and 10–12, against the solutions', how: 'Record your average percentage.', max: 100, url: `${OCW}/8-311-electromagnetic-theory-spring-2004/pages/assignments/` },
      { id: 'ph402.gre', name: 'GRE Physics practice test: electromagnetism questions', how: 'Record the percentage right on the electromagnetism questions.', max: 100, url: GRE },
    ],
    rubrics: {
      applied: [
        crit('Field solution', 'The waveguide mode or dipole field derived from the equations with the boundary conditions shown satisfied.', 'Derived, boundary conditions not checked.', 'Not derived.'),
        crit('Numerical benchmark', 'An independent numerical solution (finite differences or a mode solver) agrees with the analytic cutoff or field, with the grid refined.', 'Agrees on one grid.', 'None.'),
        crit('Power balance', 'Radiated or transmitted power computed two ways (Poynting flux and a formula) and matched.', 'One way only.', 'Not computed.'),
        crit('Asymptotic regime', 'A limit checked (far field, near cutoff, short dipole) and the approximation\'s breakdown shown.', 'Limit stated, not checked.', 'None.'),
      ],
      final: examFinal('a set built from 8.311\'s problem sets and the GRE electromagnetism section', 'One time-dependent source followed from potentials and gauge through propagation and radiation to the energy it carries.', 'Static, far-field and low-velocity limits checked.'),
    },
  },

  'quantum-mechanics-2': {
    doc: 'docs/phys-term3-audit.md',
    outcomes: [
      o('ph403.addition', 'Add angular momenta and use the structure of the result.', ['GRE-P Quantum Mechanics'], ['q2.addition'], [1], ['final']),
      o('ph403.spin', 'Predict spin measurements and two-level dynamics.', ['GRE-P Quantum Mechanics'], ['pq.spin', 'q2.rabi'], [2], ['final']),
      o('ph403.hydrogen', 'Solve central potentials and the hydrogen atom, with its degeneracies.', ['GRE-P Quantum Mechanics', 'GRE-P Atomic Physics'], ['q2.hydrogen', 'ch.hydrogen'], [3], ['final']),
      o('ph403.approx', 'Estimate energies by variational and perturbative methods, and benchmark both by diagonalisation.', ['AAPT Modeling', 'GRE-P Quantum Mechanics'], ['q2.perturb', 'pq.oscillator', 'pq.finite'], [4], ['applied']),
      o('ph403.identical', 'Build states of identical particles with the right exchange symmetry.', ['GRE-P Quantum Mechanics'], ['sm.fermi'], [5], ['final']),
      o('ph403.transitions', 'Compute transition probabilities and rates in time.', ['GRE-P Quantum Mechanics'], ['q2.rabi'], [6], ['final']),
      o('ph403.open', 'Describe mixed states, entanglement and scattering.', ['GRE-P Quantum Mechanics'], ['pq.expect', 'pq.tunnel'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource stops halfway', why: '8.05 (Fall 2013) covers spin, angular momentum and hydrogen, but not perturbation theory, identical particles, time-dependent perturbation, density matrices or scattering (Units 4–7).', fix: 'Units 4–7 read the 8.06 (Spring 2016) chapters that continue it; scattering is in 8.06 (Spring 2018) Chapter 7.', url: `${OCW}/8-06-quantum-physics-iii-spring-2018/resources/chapter-7-scattering/` },
      { what: 'No solutions', why: 'Neither 8.05 nor 8.06 posts solutions to its problem sets or exams.', fix: 'The benchmarks are the GRE quantum questions and 8.05\'s finals, with each answer confirmed by a numerical diagonalisation or simulation.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes angular-momentum addition (checked by peeling multiplets off the m-values), hydrogen degeneracy, anharmonic perturbation theory (checked against exact diagonalisation) and Rabi oscillations (checked by integrating the Schrödinger equation).' },
    ],
    benchmarks: [
      { id: 'ph403.final', name: 'MIT 8.05 final exams 2011–2013, sat under time', how: 'No solutions are posted: mark each answer only when a numerical check agrees; record your average.', max: 100, url: `${OCW}/8-05-quantum-physics-ii-fall-2013/pages/exams/` },
      { id: 'ph403.gre', name: 'GRE Physics practice test: quantum and atomic questions', how: 'Record the percentage right on those questions.', max: 100, url: GRE },
    ],
    rubrics: {
      applied: [
        crit('Variational estimate', 'A trial family chosen with reasons, minimised, and shown to bound the ground state from above.', 'Minimised, bound not discussed.', 'No estimate.'),
        crit('Perturbative estimate', 'First- and second-order corrections computed, with the expansion\'s range of validity stated.', 'First order only.', 'None.'),
        crit('Numerical diagonalisation', 'The Hamiltonian diagonalised in a converged basis or grid, with convergence shown.', 'Diagonalised, convergence not shown.', 'Not done.'),
        crit('Comparison', 'All three compared across the coupling, and where each fails explained.', 'Compared at one coupling.', 'Not compared.'),
      ],
      final: examFinal('a set built from 8.05\'s finals and the GRE quantum section', 'One composite-system or scattering prediction carried from symmetry and approximation to measurement statistics.', 'Weak-coupling, classical and single-particle limits checked.'),
    },
  },

  'statistical-mechanics': {
    doc: 'docs/phys-term3-audit.md',
    outcomes: [
      o('ph404.entropy', 'Count microstates and relate entropy to information.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['pt.entropy', 'entropy'], [1], ['final']),
      o('ph404.ensembles', 'Choose the right ensemble and derive its distribution.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['pt.boltzmann'], [2], ['final']),
      o('ph404.partition', 'Derive thermodynamic quantities from a partition function.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['pt.einstein', 'pt.boltzmann'], [3], ['final']),
      o('ph404.montecarlo', 'Simulate an interacting spin model by Monte Carlo, with equilibration and finite-size checks.', ['AAPT Modeling', 'AAPT Data Analysis and Visualization'], ['sm.ising', 'cp.mcerror', 'pt.boltzmann'], [4], ['applied']),
      o('ph404.gases', 'Treat classical and quantum ideal gases, degeneracy and condensation.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['sm.fermi', 'sm.bec', 'pt.planck'], [5], ['final']),
      o('ph404.transitions', 'Analyse phase transitions with mean-field theory and exact results.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['sm.ising'], [6], ['applied', 'final']),
      o('ph404.fluct', 'Relate fluctuations to response, and explain irreversibility.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['expvar', 'pr.clt'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource is a graduate course', why: '8.333 is MIT\'s first-year graduate statistical mechanics (Kardar). It suits Units 2, 3 and 7, but it is steep for a first course, and it has no Monte Carlo (Unit 4).', fix: 'Units 1, 5 and 6 read Tong\'s free undergraduate Statistical Physics; Unit 4 reads Chapter 8 of Sethna\'s free Entropy, Order Parameters, and Complexity.', url: 'https://davidtong.org/teaching/statistical-physics/' },
      { what: 'Thin practice', why: 'The course borrowed one AI-track entropy question and one probability question.', fix: 'Practice now includes the 1-D Ising chain (checked by exact enumeration), Fermi energies (checked by counting k-points), Bose condensation (checked by integrating the occupancy) and Monte Carlo error bars (checked by repeated runs).' },
    ],
    benchmarks: [
      { id: 'ph404.reviews', name: 'MIT 8.333 exam reviews 1–3 and the final review, against the solutions', how: 'Record your average percentage.', max: 100, url: `${OCW}/8-333-statistical-mechanics-i-statistical-mechanics-of-particles-fall-2013/pages/exams/` },
      { id: 'ph404.gre', name: 'GRE Physics practice test: thermodynamics and statistical mechanics questions', how: 'Record the percentage right on those questions.', max: 100, url: GRE },
    ],
    rubrics: {
      applied: [
        crit('Correct sampler', 'Metropolis (or a cluster algorithm) implemented with detailed balance argued and tested on a case with an exact answer.', 'Implemented, not tested.', 'Incorrect sampler.'),
        crit('Equilibration and errors', 'Equilibration shown, autocorrelation time measured, and error bars computed from independent blocks.', 'Errors from naive standard deviation.', 'No errors.'),
        crit('Finite-size effects', 'Observables measured at several sizes and the trend toward the thermodynamic limit shown.', 'One size.', 'Not considered.'),
        crit('Theory comparison', 'Results compared with exact (1-D, or Onsager in 2-D) and mean-field predictions, with the differences explained.', 'Compared with one.', 'Not compared.'),
      ],
      final: examFinal('a set built from 8.333\'s exam reviews and the GRE thermal section', 'One emergence claim carried from a microscopic model through ensemble and partition function to a measurable quantity and its fluctuations.', 'High- and low-temperature limits, and the thermodynamic limit, checked.'),
    },
  },

  'computational-physics': {
    doc: 'docs/phys-term3-audit.md',
    outcomes: [
      o('cp401.float', 'Reason about floating-point error, conditioning and stability.', ['QAA-MSOR 3.16', 'GRE-P Laboratory Methods'], ['m.float', 'na.cond', 'py.accum'], [1], ['final']),
      o('cp401.linalg', 'Solve sparse systems and eigenproblems with suitable methods.', ['QAA-MSOR 3.16'], ['cm.kmatrix', 'la.eig2'], [2], ['final']),
      o('cp401.ode', 'Integrate ODEs and preserve structure such as energy.', ['AAPT Modeling'], ['cp.euler', 'de.euler', 'na.order'], [3], ['applied', 'final']),
      o('cp401.verified', 'Build and verify an orbital or quantum time-evolution solver.', ['AAPT Modeling', 'AAPT Technical and Practical Laboratory Skills'], ['cp.euler', 'pm.orbit', 'q2.rabi'], [4], ['applied']),
      o('cp401.pde', 'Solve PDEs by finite differences and spectral methods, within their stability limits.', ['QAA-MSOR 3.16'], ['pde.cfl', 'pde.heat', 'cm.dft'], [5], ['final']),
      o('cp401.mc', 'Use Monte Carlo with honest error bars.', ['AAPT Data Analysis and Visualization'], ['cp.mcerror', 'lab.trials'], [6], ['applied', 'final']),
      o('cp401.opt', 'Fit, optimise and profile, reproducibly.', ['AAPT Data Analysis and Visualization', 'AAPT Communication'], ['lab.fit', 'opt.gd', 'flops'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource skips the foundations', why: '22.15 (Fall 2014) is a nuclear-engineering methods course: ODEs, PDEs, transport and Monte Carlo, but no floating point, eigensolvers, spectral methods or optimisation (Units 1, 2, 5 and 7).', fix: 'Units 1, 2 and 7 read 18.335J; spectral methods point to John Boyd\'s free Chebyshev and Fourier Spectral Methods.', url: 'https://depts.washington.edu/ph506/Boyd.pdf' },
      { what: 'The notes are served over plain HTTP', why: '22.15\'s notes are hosted off OCW on a server without HTTPS, so units link to the OCW page that opens them, or to an exercise.', fix: 'Each unit names the chapter to open.' },
      { what: 'No reproducibility guidance', why: 'Unit 7 and the release ask for reproducible code, which no course resource teaches.', fix: 'The Turing Way (free) covers version control, environments, testing and releasing research code.', url: 'https://book.the-turing-way.org/reproducible-research/reproducible-research' },
      { what: 'Thin practice', why: 'The course borrowed three beginner Python and cost questions.', fix: 'Practice now includes forward Euler\'s energy growth (checked by running it) and Monte Carlo error bars (checked by repeated runs), with conditioning, method order, CFL limits and the DFT.' },
    ],
    benchmarks: [
      { id: 'cp401.ex5', name: 'MIT 22.15 Exercise 5 (diffusion), against the posted example solution', how: 'Solve it, then compare your results and stability analysis with the example solution; record the percentage that agrees.', max: 100, url: `${OCW}/22-15-essential-numerical-methods-fall-2014/resources/mit22_15f14_ex05_soln/` },
      { id: 'cp401.final', name: 'MIT 22.15 final exam (2013), sat under time', how: 'No solutions are posted: mark each answer only when running code confirms it; record the percentage.', max: 100, url: `${OCW}/22-15-essential-numerical-methods-fall-2014/pages/exams/` },
    ],
    rubrics: {
      applied: [
        crit('Two solvers', 'Two methods of different kinds (for example RK4 and leapfrog) implemented for the same problem, with tests against an exact solution.', 'Two methods, untested.', 'One method.'),
        crit('Convergence', 'Error against step size plotted on log axes, with the observed order matching theory.', 'Error shown, order not measured.', 'Not measured.'),
        crit('Invariant drift', 'Energy (or norm) drift over long times measured, and the symplectic or unitary method shown to bound it.', 'Drift shown, not explained.', 'Not measured.'),
        crit('Cost and failure', 'Run time against accuracy compared, and a failure case (stiffness, instability, step too large) shown and explained.', 'One of the two.', 'Neither.'),
      ],
      final: [
        crit('Reproducible release', 'The investigation released with pinned environment, tests and a single command that regenerates every figure.', 'Code released, not reproducible from scratch.', 'Not released.'),
        crit('Analytic benchmarks', 'Each solver checked against an analytic or published result, with the agreement quantified.', 'One benchmark.', 'None.'),
        crit('Uncertainty and provenance', 'Numerical, statistical and input uncertainties separated, and every data source recorded.', 'One kind of uncertainty.', 'None.'),
        crit('Performance and defense', 'Profiling identifies the bottleneck and one optimisation is measured; the choices are defended under questions.', 'Profiled, not optimised.', 'Neither.'),
      ],
    },
  },
};
