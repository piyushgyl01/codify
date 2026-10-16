/** Physics: the part of each course's free resource that covers each unit (audited October 2026). */
const r = (url, where) => ({ url, where });

const OCW = 'https://ocw.mit.edu/courses';
const C1801 = `${OCW}/18-01sc-single-variable-calculus-fall-2010/pages`;
const M801 = `${OCW}/8-01sc-classical-mechanics-fall-2016/pages`;
const O803 = `${OCW}/8-03sc-physics-iii-vibrations-and-waves-fall-2016/pages`;
const C5111 = `${OCW}/5-111sc-principles-of-chemical-science-fall-2014/pages`;
const L6100 = `${OCW}/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/pages`;
const NIST = 'https://www.itl.nist.gov/div898/handbook';
const C1802 = `${OCW}/18-02sc-multivariable-calculus-fall-2010/pages`;
const C1803 = `${OCW}/18-03sc-differential-equations-fall-2011/pages`;
const LA06 = `${OCW}/18-06sc-linear-algebra-fall-2011/pages`;
const E802 = `${OCW}/8-02x-physics-ii-electricity-magnetism-with-an-experimental-focus-spring-2005/resources`;
const S1805 = `${OCW}/18-05-introduction-to-probability-and-statistics-spring-2022/resources`;
const M223 = `${OCW}/8-223-classical-mechanics-ii-january-iap-2017/resources`;
const E807 = `${OCW}/8-07-electromagnetism-ii-fall-2012/resources`;
const Q804 = `${OCW}/8-04-quantum-physics-i-spring-2016/resources`;
const T8044 = `${OCW}/8-044-statistical-physics-i-spring-2013/resources`;
const TONG = 'https://davidtong.org/pdfs/teaching';
const C809 = `${OCW}/8-09-classical-mechanics-iii-fall-2014/resources`;
const E311 = `${OCW}/8-311-electromagnetic-theory-spring-2004`;
const FITZ = p => `https://farside.ph.utexas.edu/teaching/jk1/Electromagnetism.pdf#page=${p}`;
const Q805 = `${OCW}/8-05-quantum-physics-ii-fall-2013`;
const Q806 = `${OCW}/8-06-quantum-physics-iii-spring-2016/resources`;
const S8333 = `${OCW}/8-333-statistical-mechanics-i-statistical-mechanics-of-particles-fall-2013`;
const TONGSP = p => `${TONG}/statistical-physics/statphys.pdf#page=${p + 6}`;
const SETHNA = p => `https://www.lassp.cornell.edu/sethna/StatMech/EntropyOrderParametersComplexity20.pdf#page=${p + 24}`;
const N2215 = `${OCW}/22-15-essential-numerical-methods-fall-2014`;
const O335 = `${OCW}/18-335j-introduction-to-numerical-methods-spring-2019/pages`;
const B309 = `${OCW}/20-309-biological-engineering-ii-instrumentation-and-measurement-fall-2006`;
const J1314 = `${OCW}/8-13-14-experimental-physics-i-ii-junior-lab-fall-2016-spring-2017`;
const O6002 = `${OCW}/6-002-circuits-and-electronics-spring-2007/resources`;
const R8033 = `${OCW}/8-033-relativity-fall-2006`;
const M3024 = `${OCW}/3-024-electronic-optical-and-magnetic-properties-of-materials-spring-2013/resources`;
const THT = `${OCW}/22-tht-undergraduate-thesis-tutorial-fall-2015`;
const ASTRO = 'https://openstax.org/books/astronomy-2e/pages';
const PRESKILL = 'https://www.preskill.caltech.edu';
const N2201 = `${OCW}/22-01-introduction-to-nuclear-engineering-and-ionizing-radiation-fall-2016`;
const N2202 = `${OCW}/22-02-introduction-to-applied-nuclear-physics-spring-2012/resources`;
const PDG = 'https://pdg.lbl.gov/2024/reviews';
const S650 = `${OCW}/18-650-statistics-for-applications-fall-2016/resources`;
const BDA = p => `https://sites.stat.columbia.edu/gelman/book/BDA3.pdf#page=${p + 10}`;
const THA = `${OCW}/2-tha-undergraduate-thesis-for-course-2-a-january-iap-2007`;
const R8962 = `${OCW}/8-962-general-relativity-spring-2020`;
const S511 = `${OCW}/8-511-theory-of-solids-i-fall-2004/resources`;
const S512 = `${OCW}/8-512-theory-of-solids-ii-spring-2009/resources`;
const P701 = `${OCW}/8-701-introduction-to-nuclear-and-particle-physics-fall-2020/resources`;
const GUM = 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf';

export const PHYS_READINGS = {
  'calculus-1-physical-modeling': {
    1: r(`${C1801}/1.-differentiation/part-a-definition-and-basic-rules/`, '18.01SC Unit 1A — limits, continuity and the definition of the derivative'),
    2: r(`${C1801}/unit-2-applications-of-differentiation/part-a-approximation-and-curve-sketching/`, '18.01SC Unit 2A — linear and quadratic approximation, curve sketching'),
    3: r(`${C1801}/unit-2-applications-of-differentiation/part-b-optimization-related-rates-and-newtons-method/`, '18.01SC Unit 2B — optimisation, related rates and Newton\'s method'),
    4: r(`${C1801}/unit-2-applications-of-differentiation/part-c-mean-value-theorem-antiderivatives-and-differential-equations/`, '18.01SC Unit 2C — antiderivatives and differential equations: models of motion'),
    5: r(`${C1801}/unit-3-the-definite-integral-and-its-applications/part-b-second-fundamental-theorem-areas-volumes/`, '18.01SC Unit 3A–3B — the definite integral, the fundamental theorems, accumulation'),
    6: r(`${C1801}/unit-3-the-definite-integral-and-its-applications/part-c-average-value-probability-and-numerical-integration/`, '18.01SC Unit 3C and Unit 4 — numerical integration and techniques of integration'),
    7: r(`${C1801}/unit-5-exploring-the-infinite/part-b-taylor-series/`, '18.01SC Unit 5B — Taylor series and error'),
    8: r(`${C1801}/final-exam/`, '18.01SC final exam with solutions — the cumulative check'),
  },
  'introductory-mechanics-special-relativity': {
    1: r(`${M801}/week-1-kinematics/`, '8.01SC Week 1 — coordinate systems, vectors and kinematics (8.012 publishes no notes, and its text is not free)'),
    2: r(`${M801}/week-2-newtons-laws/`, '8.01SC Weeks 2–4 — Newton\'s laws, circular motion, constraints and drag'),
    3: r(`${M801}/week-8-potential-energy-and-energy-conservation/`, '8.01SC Weeks 7–8 — work, kinetic and potential energy, conservation'),
    4: r(`${M801}/week-9-collision-theory/`, '8.01SC Weeks 5 and 9 — momentum, impulse, collisions and the centre of mass'),
    5: r(`${M801}/week-10-rotational-motion/`, '8.01SC Weeks 10–12 — rotation, torque, angular momentum and rolling'),
    6: r(`${O803}/part-i-mechanical-vibrations-and-waves/lecture-1/`, '8.03SC Lectures 1–3 — simple harmonic motion, damping, driven oscillators and resonance'),
    7: r(`${OCW}/8-20-introduction-to-special-relativity-january-iap-2021/pages/video-lectures/`, '8.20 (IAP 2021) — Lorentz transformations, spacetime and four-momentum'),
    8: r(`${OCW}/8-012-physics-i-classical-mechanics-fall-2008/pages/exams/`, '8.012 exams 1–3 and final with solutions — the cumulative check'),
  },
  'chemistry-for-physical-sciences': {
    1: r(`${C5111}/unit-i-the-atom/`, '5.111SC Unit I — the atom: spectra, wave–particle duality, orbitals, periodic trends'),
    2: r(`${C5111}/unit-ii-chemical-bonding-structure/lecture-12-the-shapes-of-molecules-vsepr-theory/`, '5.111SC Unit II — bonding, Lewis structures, VSEPR shapes, hybridisation'),
    3: r('https://openstax.org/books/chemistry-2e/pages/4-introduction', 'OpenStax Chemistry 2e Chapters 4 and 9 — stoichiometry and gases (5.111SC does not cover them)'),
    4: r('https://openstax.org/books/chemistry-2e/pages/5-2-calorimetry', 'OpenStax Chemistry 2e §5.2 — calorimetry'),
    5: r(`${C5111}/unit-iii-thermodynamics-chemical-equilibrium/lecture-18-introduction-to-chemical-equilibrium/`, '5.111SC Unit III — enthalpy, entropy, free energy and chemical equilibrium'),
    6: r(`${C5111}/unit-v-chemical-kinetics/`, '5.111SC Unit V — rate laws, mechanisms, activation energy, catalysis'),
    7: r(`${C5111}/unit-iv-transition-metals-oxidation-reduction-reactions/`, '5.111SC Unit IV — oxidation–reduction, electrochemistry and transition metals'),
    8: r(`${C5111}/exams/`, '5.111SC exams with solutions — the cumulative check'),
  },
  'scientific-programming': {
    1: r(`${L6100}/lecture-7-decomposition-abstraction-functions/`, '6.100L Lectures 2–3 and 7 — branching, iteration, functions'),
    2: r(`${L6100}/lecture-9-lambda-functions-tuples-and-lists/`, '6.100L Lectures 9–10 and 25 — tuples, lists, mutability and plotting'),
    3: r(`${L6100}/lecture-22-big-oh-and-theta/`, '6.100L Lectures 21–23 — timing programs and complexity'),
    4: r(`${L6100}/lecture-12-list-comprehension-functions-as-objects-testing-debugging/`, '6.100L Lectures 12–13 — testing, debugging, exceptions and assertions'),
    5: r(`${L6100}/lecture-5-floats-and-approximation-methods/`, '6.100L Lectures 5–6 — floats, approximation methods and bisection'),
    6: r(`${OCW}/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/resources/mit6_0002f16_lec9/`, '6.0002 Lecture 9 — understanding experimental data: fitting and residuals (6.100L does not fit data)'),
    7: r('https://missing.csail.mit.edu/2020/version-control/', 'The Missing Semester — version control with Git'),
    8: r('https://packaging.python.org/en/latest/tutorials/packaging-projects/', 'Python Packaging User Guide — packaging a project for release'),
  },
  'measurement-and-experimental-foundations': {
    1: r(`${OCW}/8-01x-physics-i-classical-mechanics-with-an-experimental-focus-fall-2002/resources/abt_experiment/`, '8.01X — about the experiments: questions, observables and operational definitions'),
    2: r('https://www.bipm.org/en/publications/si-brochure', 'BIPM, The International System of Units (SI brochure) — units, standards and traceability'),
    3: r('https://www.nist.gov/pml/nist-technical-note-1297', 'NIST Technical Note 1297 — evaluating and expressing uncertainty: random and systematic components'),
    4: r('https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf', 'JCGM 100 (the GUM) — building an uncertainty budget'),
    5: r(`${NIST}/pri/section1/pri1.htm`, 'NIST/SEMATECH e-Handbook Chapter 5 — designing experiments: controls, randomisation, confounding'),
    6: r(`${NIST}/mpc/mpc.htm`, 'NIST/SEMATECH e-Handbook Chapter 2 — measurement process characterisation: calibration, resolution, noise'),
    7: r('https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003285', 'Sandve et al., Ten Simple Rules for Reproducible Computational Research'),
    8: r('https://osf.io/prereg/', 'OSF preregistration — register the replication before running it'),
  },
  'multivariable-and-vector-calculus': {
    1: r(`${C1802}/1.-vectors-and-matrices/part-a-vectors-determinants-and-planes/`, '18.02SC Unit 1 — vectors, determinants, planes, coordinates and parametric curves'),
    2: r(`${C1802}/2.-partial-derivatives/part-b-chain-rule-gradient-and-directional-derivatives/`, '18.02SC Unit 2B — the chain rule, gradient and directional derivatives'),
    3: r(`${C1802}/2.-partial-derivatives/part-c-lagrange-multipliers-and-constrained-differentials/`, '18.02SC Unit 2C — Lagrange multipliers and constrained differentials'),
    4: r(`${C1802}/2.-partial-derivatives/part-a-functions-of-two-variables-tangent-approximation-and-optimization/`, '18.02SC Unit 2A — tangent-plane approximation: reconstructing a field from local slopes'),
    5: r(`${C1802}/3.-double-integrals-and-line-integrals-in-the-plane/part-a-double-integrals/`, '18.02SC Units 3A and 4A — double and triple integrals, change of variables'),
    6: r(`${C1802}/3.-double-integrals-and-line-integrals-in-the-plane/part-b-vector-fields-and-line-integrals/`, '18.02SC Units 3B and 4B — line integrals and flux through surfaces'),
    7: r(`${C1802}/4.-triple-integrals-and-surface-integrals-in-3-space/part-c-line-integrals-and-stokes-theorem/`, '18.02SC Units 3C, 4B–4C — Green\'s, Stokes\' and the divergence theorem'),
    8: r(`${C1802}/4.-triple-integrals-and-surface-integrals-in-3-space/physics-applications/`, '18.02SC physics applications, with the final exam for the cumulative check'),
  },
  'linear-algebra-and-differential-equations': {
    1: r(`${LA06}/ax-b-and-the-four-subspaces/elimination-with-matrices/`, '18.06SC — elimination, LU and the geometry of linear equations (18.03SC has no linear algebra)'),
    2: r(`${LA06}/ax-b-and-the-four-subspaces/independence-basis-and-dimension/`, '18.06SC — independence, bases, rank and the four subspaces; orthogonality'),
    3: r(`${LA06}/least-squares-determinants-and-eigenvalues/eigenvalues-and-eigenvectors/`, '18.06SC — eigenvalues, eigenvectors and diagonalisation'),
    4: r(`${C1803}/unit-iv-first-order-systems/matrix-methods-eigenvalues-and-normal-modes/`, '18.03SC — matrix methods, eigenvalues and normal modes'),
    5: r(`${C1803}/unit-i-first-order-differential-equations/first-order-linear-odes/`, '18.03SC Unit I — first-order linear ODEs and integrating factors'),
    6: r(`${C1803}/unit-iv-first-order-systems/qualitative-behavior-phase-portraits/`, '18.03SC Unit IV — linear systems, phase portraits and stability'),
    7: r(`${C1803}/unit-iii-fourier-series-and-laplace-transform/transfer-system-and-weight-functions-greens-formula/`, '18.03SC Unit III — Laplace transforms, forcing, resonance and Green\'s formula'),
    8: r(`${C1803}/final-exam/`, '18.03SC final exam with solutions — the cumulative check'),
  },
  'electricity-magnetism-and-circuits': {
    1: r(`${E802}/2_13_2002_edited/`, '8.02X Lectures 1–5 — charge, Coulomb\'s law and the electric field'),
    2: r(`${E802}/2_19_2002_edited/`, '8.02X Lectures 6–8 and 11–13 — Gauss\'s law, potential, capacitors and dielectrics'),
    3: r(`${E802}/3_13_2002_edited/`, '8.02X Lectures 14–15 — current, resistance, Ohm\'s law and Kirchhoff\'s rules'),
    4: r(`${E802}/3_15_2002_edited/`, '8.02X Lecture 16 — DC and RC circuits'),
    5: r(`${E802}/4_03_2002_edited/`, '8.02X Lectures 19–21 — magnetism, charged particles in fields, Biot–Savart and Ampère'),
    6: r(`${E802}/4_26_2002_edited/`, '8.02X Lecture 23 — inductance, RL circuits and stored magnetic energy'),
    7: r(`${E802}/4_29_2002_edited/`, '8.02X Lectures 24–26 — RLC circuits, displacement current, Maxwell\'s equations, EM waves'),
    8: r(`${OCW}/8-02x-physics-ii-electricity-magnetism-with-an-experimental-focus-spring-2005/pages/exams/`, '8.02X quizzes with solutions — the cumulative check'),
  },
  'waves-oscillations-and-optics': {
    1: r(`${O803}/part-i-mechanical-vibrations-and-waves/lecture-2/`, '8.03SC Lectures 1–3 — harmonic, damped and driven oscillators'),
    2: r(`${O803}/part-i-mechanical-vibrations-and-waves/lecture-4/`, '8.03SC Lectures 4–6 — coupled oscillators, normal modes, beats and resonance'),
    3: r(`${O803}/part-i-mechanical-vibrations-and-waves/lecture-10/`, '8.03SC Lectures 7–10 — infinitely many oscillators, the wave equation, travelling waves'),
    4: r(`${O803}/part-i-mechanical-vibrations-and-waves/lecture-9/`, '8.03SC Lectures 9 and 13 — standing waves, dispersion, phase and group velocity'),
    5: r(`${O803}/part-ii-electromagnetic-waves/lecture-14/`, '8.03SC Lectures 14–15 — the Fourier transform, wave packets and the uncertainty principle'),
    6: r('https://openstax.org/books/university-physics-volume-3/pages/2-introduction', 'OpenStax University Physics Volume 3 Chapter 2 — geometric optics and image formation (8.03SC skips lenses)'),
    7: r(`${O803}/part-iii-optics/lecture-20/`, '8.03SC Lectures 17–22 — polarisation, interference and diffraction'),
    8: r(`${O803}/final-exam/`, '8.03SC final exam — the cumulative check'),
  },
  'probability-data-and-experimental-methods': {
    1: r(`${S1805}/mit18_05_s22_class03-prep_pdf/`, '18.05 Classes 1–3 — counting, probability rules, conditional probability and Bayes'),
    2: r(`${S1805}/mit18_05_s22_class05-prep-c_pdf/`, '18.05 Classes 4–5 — discrete and continuous random variables, a gallery of distributions'),
    3: r(`${S1805}/mit18_05_s22_class07-prep-b_pdf/`, '18.05 Classes 6–7 — expectation, variance, joint distributions, covariance'),
    4: r(`${S1805}/mit18_05_s22_class10-prep-b_pdf/`, '18.05 Class 10 — maximum-likelihood estimates from noisy data'),
    5: r(`${S1805}/mit18_05_s22_class22-prep_pdf/`, '18.05 Classes 22–24 — confidence intervals, three views, and the bootstrap'),
    6: r(`${S1805}/mit18_05_s22_class26-prep_pdf/`, '18.05 Class 26 — linear regression'),
    7: r(`${S1805}/mit18_05_s22_class17-prep-b_pdf/`, '18.05 Classes 17–19 — null-hypothesis significance testing, power and multiple tests'),
    8: r('https://osf.io/prereg/', 'OSF preregistration — register the experiment before collecting data'),
  },
  'analytical-mechanics-1': {
    1: r(`${M223}/mit8_223iap17_lec2/`, '8.223 Lecture 2 — building up to the principle of least action: coordinates and constraints'),
    2: r(`${M223}/mit8_223iap17_lec3/`, '8.223 Lectures 3–4 — the principle of least action, the Lagrangian workflow, why L = T − U'),
    3: r(`${M223}/mit8_223iap17_lec6/`, '8.223 Lectures 5–6 — conservation of energy and momentum from symmetries'),
    4: r(`${M223}/mit8_223iap17_lec5/`, '8.223 Lecture 5 — a full worked example to model the double pendulum on'),
    5: r(`${M223}/mit8_223iap17_lec8/`, '8.223 Lecture 8 — central forces, effective potentials and Kepler\'s laws'),
    6: r(`${TONG}/classical-dynamics/clas3.pdf`, 'Tong, Classical Dynamics Chapter 3 — rigid bodies, the inertia tensor and Euler\'s equations (8.223 does not cover them)'),
    7: r(`${M223}/mit8_223iap17_lec10/`, '8.223 Lectures 10–13 — oscillators: small oscillations, forcing and damping'),
    8: r(`${M223}/mit8_223iap17_lec18/`, '8.223 Lectures 15–18 — Hamiltonian mechanics, Poisson brackets and connections'),
  },
  'electromagnetic-theory-1': {
    1: r(`${E807}/mit8_07f12_ln3/`, '8.07 Notes 3 — the integral formulation of electrostatics and uniqueness'),
    2: r(`${E807}/mit8_07f12_ln4/`, '8.07 Notes 4 — conductors, surface forces and capacitance'),
    3: r(`${E807}/mit8_07f12_ln5/`, '8.07 Notes 5 — image charges and separation of variables'),
    4: r(`${E807}/mit8_07f12_ln6/`, '8.07 Notes 6–7 — separation of variables in spherical coordinates, a worked boundary-value problem'),
    5: r(`${TONG}/electromagnetism/electro6.pdf`, 'Tong, Electromagnetism Chapter 7 — dielectrics, polarisation and energy in matter (8.07\'s notes skip dielectrics)'),
    6: r(`${E807}/mit8_07f12_ln10/`, '8.07 Notes 10 — magnetic multipoles and dipoles, the vector potential'),
    7: r(`${E807}/mit8_07f12_ln11/`, '8.07 Notes 11 and 14 — magnetic fields in matter; Maxwell\'s equations and waves'),
    8: r(`${OCW}/8-07-electromagnetism-ii-fall-2012/pages/exams/`, '8.07 quizzes with solutions and the final — the cumulative check'),
  },
  'quantum-mechanics-1': {
    1: r(`${Q804}/mit8_04s16_lecnotes2/`, '8.04 Lectures 1–3 — linearity, Mach–Zehnder experiments, wave–particle duality'),
    2: r(`${Q804}/mit8_04s16_lecnotes8/`, '8.04 Lecture 8 — momentum space and operators\' expectation values'),
    3: r(`${Q804}/mit8_04s16_lecnotes6/`, '8.04 Lectures 5–6 and 10 — the Schrödinger equation, probability current, stationary states'),
    4: r(`${Q804}/mit8_04s16_lecnotes11/`, '8.04 Lectures 11 and 16–17 — square wells and step potentials, transmission and tunnelling'),
    5: r(`${Q804}/mit8_04s16_lecnotes14_15/`, '8.04 Lectures 14–15 — the harmonic oscillator by ladder operators'),
    6: r(`${Q804}/mit8_04s16_lecnotes9/`, '8.04 Lecture 9 — observables, Hermitian operators and uncertainty'),
    7: r(`${Q804}/mit8_04s16_lecnotes7/`, '8.04 Lecture 7 — wave packets and their time evolution'),
    8: r(`${OCW}/8-04-quantum-physics-i-spring-2016/pages/exams/`, '8.04 tests and final (Fall 2015) — the cumulative check'),
  },
  'thermal-physics': {
    1: r(`${T8044}/mit8_044s13_notes-def/`, '8.044 Lecture 5 notes — temperature, equilibrium and equations of state'),
    2: r(`${T8044}/mit8_044s13_l6/`, '8.044 Lecture 6 — work, heat and the first law; isothermal and adiabatic processes'),
    3: r(`${T8044}/mit8_044s13_mcrocanoncl/`, '8.044 notes on the microcanonical ensemble — entropy and the second law'),
    4: r(`${T8044}/mit8_044s13_l14/`, '8.044 Lecture 14 — heat capacities, for the measurement'),
    5: r(`${T8044}/mit8_044s13_notes-max/`, '8.044 notes on thermodynamic potentials and the Maxwell relations'),
    6: r(`${T8044}/mit8_044s13_l11/`, '8.044 Lectures 11–12 — heat engines, refrigerators and the second law'),
    7: r(`${T8044}/mit8_044s13_l18/`, '8.044 Lecture 18 — chemical potential and phase equilibrium'),
    8: r(`${OCW}/8-044-statistical-physics-i-spring-2013/pages/exams/`, '8.044 exams with solutions — the cumulative check'),
  },
  'mathematical-methods-for-physics': {
    1: r(`${OCW}/18-04-complex-variables-with-applications-spring-2018/resources/mit18_04s18_topic8/`, '18.04 Topics 2–4 and 8 — analytic functions, Cauchy\'s theorem and the residue theorem'),
    2: r(`${C1803}/unit-iii-fourier-series-and-laplace-transform/fourier-series-basics/`, '18.03SC Unit III — Fourier series, with 18.152 Lectures 16–18 for the transform and distributions'),
    3: r(`${OCW}/18-152-introduction-to-partial-differential-equations-fall-2011/resources/mit18_152f11_lec_15/`, '18.152 Lectures 1 and 15 — what a PDE is and how second-order equations are classified'),
    4: r(`${OCW}/18-085-computational-science-and-engineering-i-summer-2020/resources/mit18_085summer20_lec_w7/`, '18.085 Week 7 — Laplace\'s equation by separation of variables and spectral expansion'),
    5: r(`${C1803}/unit-iii-fourier-series-and-laplace-transform/transfer-system-and-weight-functions-greens-formula/`, '18.03SC — impulse response, weight functions and Green\'s formula'),
    6: r(`${E807}/mit8_07f12_ln9/`, '8.07 Notes 8–9 — Legendre polynomials and spherical harmonics: orthogonal function bases'),
    7: r(`${E807}/mit8_07f12_ln2/`, '8.07 Notes 2 — index notation and tensors; 18.354J Chapters 2–3 for scaling'),
    8: r('https://nptel.ac.in/courses/115106086', 'NPTEL, Selected Topics in Mathematical Physics (the catalogue\'s course) — lecture videos for review'),
  },
  'advanced-classical-and-nonlinear-dynamics': {
    1: r(`${C809}/mit8_09f14_chapter_1/`, '8.09 Chapter 1 — Lagrangian and Hamiltonian mechanics: phase space and Hamilton\'s equations'),
    2: r(`${TONG}/classical-dynamics/clas4.pdf`, 'Tong, Classical Dynamics §§4.2–4.4 — Liouville\'s theorem, Poisson brackets, canonical transformations and generating functions'),
    3: r(`${C809}/mit8_09f14_chapter_4/`, '8.09 Chapter 4 — canonical transformations, the Hamilton–Jacobi equation and action-angle variables'),
    4: r(`${C809}/mit8_09f14_chapter_7/`, '8.09 Chapter 7 §§7.1–7.3 — fixed points, phase portraits and separatrices'),
    5: r(`${C809}/mit8_09f14_chapter_5/`, '8.09 Chapter 5 — perturbation theory, secular terms and the finite-angle pendulum (adiabatic invariants: Tong §4.6)'),
    6: r(`${C809}/mit8_09f14_pset10/`, '8.09 Problem Set 10 — the logistic map, chaos and Lyapunov exponents (read Chapter 7 §§7.5–7.6 first)'),
    7: r(`${C809}/mit8_09f14_chapter_6/`, '8.09 Chapter 6 §6.1 and §6.5 — from particles to the continuum, and sound as its normal modes (discrete modes: Chapter 3)'),
    8: r(`${OCW}/8-09-classical-mechanics-iii-fall-2014/pages/assignments/`, '8.09 Problem Sets 1–10 — the cumulative practice (no exams or solutions are posted)'),
  },
  'electrodynamics-and-radiation': {
    1: r(FITZ(7), 'Fitzpatrick, Classical Electromagnetism Chapter 1 — Maxwell\'s equations, potentials, gauge and retarded solutions (8.311 posts only four handouts)'),
    2: r(FITZ(153), 'Fitzpatrick Chapter 8 §§8.1–8.4 — reflection and refraction at interfaces, the Fresnel relations, total internal reflection'),
    3: r(`${E311}/resources/wave_guides/`, '8.311 handout — wave guides (Fitzpatrick Chapter 10 for cavities)'),
    4: r(FITZ(215), 'Fitzpatrick Chapter 10 — cavities and waveguides, with mode cutoffs to benchmark a solver against'),
    5: r(`${TONG}/electromagnetism/electro5.pdf`, 'Tong, Electromagnetism Chapter 6 §§6.1–6.2 — retarded potentials, dipole and quadrupole radiation, the Larmor formula'),
    6: r(FITZ(201), 'Fitzpatrick Chapter 9 — antennas, Thomson and Rayleigh scattering (radiation reaction: §12.25)'),
    7: r(`${TONG}/electromagnetism/electro4.pdf`, 'Tong, Electromagnetism Chapter 5 — four-vectors, the field tensor, the Maxwell action and the energy–momentum tensor'),
    8: r(`${E311}/pages/assignments/`, '8.311 Problem Sets 1–12 with solutions — the cumulative practice'),
  },
  'quantum-mechanics-2': {
    1: r(`${Q805}/resources/lecture-notes-10/`, '8.05 Chapter 10 — adding angular momenta: two spins, spin–orbit, the general rule (Chapter 9 for angular momentum itself)'),
    2: r(`${Q805}/resources/lecture-notes-7/`, '8.05 Chapters 2 and 7 — spin one-half, Stern–Gerlach, and two-state dynamics: precession and magnetic resonance'),
    3: r(`${Q805}/resources/lecture-notes-9/`, '8.05 Chapter 9 — central potentials, the radial equation, the 3-D oscillator and hydrogen'),
    4: r(`${Q806}/mit8_06s16_chap1/`, '8.06 Chapter 1 — non-degenerate and degenerate perturbation theory, fine structure (variational bounds: 8.05 Chapter 1 §5)'),
    5: r(`${Q806}/mit8_06s16_chap4/`, '8.06 Chapter 4 — identical particles, exchange symmetry and the Pauli principle (8.05 stops before them)'),
    6: r(`${Q806}/mit8_06s16_chap2/`, '8.06 Chapter 2 — time-dependent perturbation theory, Fermi\'s golden rule and transition rates'),
    7: r(`${Q806}/mit8_06s16_chap3/`, '8.06 Chapter 3 — density matrices, entanglement and decoherence (scattering: 8.06 Spring 2018 Chapter 7)'),
    8: r(`${Q805}/pages/exams/`, '8.05 tests and finals, 2011–2013 — the cumulative practice (solutions are not posted)'),
  },
  'statistical-mechanics': {
    1: r(TONGSP(1), 'Tong, Statistical Physics §§1.1–1.2 — microstates, the microcanonical ensemble, entropy and temperature'),
    2: r(`${S8333}/resources/lecture-14/`, '8.333 Lectures 12–14 (graduate) — microcanonical, canonical, Gibbs and grand canonical ensembles'),
    3: r(`${S8333}/resources/lecture-13/`, '8.333 Lecture 13 — the ideal gas, the canonical partition function, mixing entropy and Gibbs\'s paradox'),
    4: r(SETHNA(219), 'Sethna, Entropy, Order Parameters, and Complexity Chapter 8 — the Ising model, Markov chains, Metropolis and Wolff (8.333 has no Monte Carlo)'),
    5: r(TONGSP(62), 'Tong, Statistical Physics Chapter 3 — density of states, photons, phonons, Bose–Einstein condensation and Fermi gases'),
    6: r(TONGSP(135), 'Tong, Statistical Physics Chapter 5 — the liquid–gas transition, the Ising model, mean field and Landau theory'),
    7: r(`${S8333}/resources/lecture-9/`, '8.333 Lectures 8–11 — the Boltzmann equation, the H-theorem and transport (fluctuation and response: Sethna Chapter 10)'),
    8: r(`${S8333}/pages/exams/`, '8.333 exam reviews and final review, with solutions — the cumulative check'),
  },
  'computational-physics': {
    1: r(`${O335}/week-1/`, '18.335J Lectures 2–3 — floating point, rounding, conditioning and backward stability (22.15 does not cover them)'),
    2: r(`${O335}/week-6/`, '18.335J Lectures 15–17 — eigensolvers; sparse iterative solvers: 22.15 notes Chapter 6'),
    3: r(`${N2215}/pages/lecture-notes/`, '22.15 notes Chapter 2 — ODEs: accuracy, stability, implicit schemes, Runge–Kutta and leapfrog (the notes open from this page)'),
    4: r(`${N2215}/resources/mit22_15f14_ex02/`, '22.15 Exercise 2 — integrating orbits in prescribed fields, the benchmark task'),
    5: r(`${N2215}/resources/mit22_15f14_ex05/`, '22.15 Exercise 5 and notes Chapters 4–5 — diffusion, explicit and implicit schemes and their stability (spectral methods: Boyd)'),
    6: r(`${N2215}/resources/mit22_15f14_ex09/`, '22.15 notes Chapters 11–12 and Exercise 9 — random sampling, Monte Carlo transport and statistical error'),
    7: r(`${O335}/week-9/`, '18.335J Lectures 25–26 — optimisation and adjoint differentiation (fitting as an inverse problem: 22.15 Chapter 1)'),
    8: r(`${N2215}/pages/exams/`, '22.15 final exams (2013 and an example) — the cumulative check'),
  },
  'advanced-experimental-physics-1-electronics-optics': {
    1: r(`${B309}/resources/module1/`, '20.309 Module 1 — an instrument built end to end: optics, photodiode readout and calibration'),
    2: r(`${O6002}/6002_l19/`, '6.002 Lectures 17 and 19–20 — impedance, the op-amp abstraction and feedback circuits (20.309\'s textbook is not free)'),
    3: r(`${J1314}/resources/mit8_13-14f16-s17exp43/`, 'MIT Junior Lab guide — Johnson noise and shot noise: noise sources, spectra and filtering'),
    4: r(`${B309}/resources/module0/`, '20.309 Module 0 — DC measurements, dividers, impedance and loading, photodiode characterisation'),
    5: r(`${B309}/resources/module2_5/`, '20.309 lab exercise — sampling, aliasing and digital data (Tutorial 2 for sampling in Fourier space)'),
    6: r('https://www.thinksrs.com/downloads/pdfs/applicationnotes/AboutLIAs.pdf', 'Stanford Research Systems, About Lock-In Amplifiers — modulation and phase-sensitive detection (20.309 posts no notes on them)'),
    7: r(`${B309}/resources/lec16/`, '20.309 optics lectures — geometric optics and ray tracing, then interference, diffraction and resolution (lec17); detectors in lec14'),
    8: r(`${B309}/pages/labs/`, '20.309 Modules 3–4 — the fluorescence microscope and optical trap, models for an independent instrument'),
  },
  'relativity-and-gravitation': {
    1: r(`${R8033}/resources/lecture4_kinem1/`, '8.033 kinematics slides — Lorentz transformations, four-vectors, time dilation and Doppler'),
    2: r(`${R8033}/resources/lecture13_part2/`, '8.033 dynamics slides — four-momentum, collisions and thresholds; how E and B transform (the lecture14–15 slides)'),
    3: r(`${TONG}/general-relativity/gr1.pdf`, 'Tong, General Relativity Chapter 1 — geodesics, the equivalence principle and a first look at the Schwarzschild metric'),
    4: r(`${R8033}/resources/lecture23_bh3/`, '8.033 slides — Kepler\'s third law and perihelion precession in the Schwarzschild metric (GPS: the gravitational-redshift slides)'),
    5: r(`${TONG}/general-relativity/gr3.pdf`, 'Tong, General Relativity Chapter 3 — connections, parallel transport, the Riemann tensor and geodesic deviation (8.033 does not cover them)'),
    6: r(`${TONG}/general-relativity/gr4.pdf`, 'Tong, General Relativity Chapter 4 — the Einstein equations and simple solutions (weak gravity: Chapter 5)'),
    7: r(`${R8033}/resources/lecture24_bh4/`, '8.033 black-hole slides — radial infall, orbits and photon trajectories (Tong Chapter 6 for the full solution)'),
    8: r(`${R8033}/pages/exams/`, '8.033 Quizzes 1–2 with solutions — the cumulative check'),
  },
  'condensed-matter-and-amo-foundations': {
    1: r(`${TONG}/solid-state-physics/solidstate2.pdf`, 'Tong, Solid State Physics Chapter 2 §§2.2 and 2.4 — lattices, the reciprocal lattice and X-ray diffraction (3.024 does not cover crystal structure)'),
    2: r(`${M3024}/mit3_024s13_2012lec10/`, '3.024 Lectures 10–15 — waves in periodic potentials, band gaps, band diagrams, the free-electron gas and Fermi–Dirac statistics'),
    3: r(`${M3024}/mit3_024s13_2012lec16/`, '3.024 Lectures 16–18 — intrinsic and doped semiconductors and the p–n junction'),
    4: r(`${M3024}/mit3_024s13_2012lec19-20/`, '3.024 Lectures 19–20 — light-emitting diodes: from band structure to an optical spectrum'),
    5: r(`${M3024}/mit3_024s13_2012lec24/`, '3.024 Lectures 24–26 — the origins of magnetisation, hysteresis and domains (phonons: Lectures 2–3)'),
    6: r(`${TONG}/topics-in-quantum-mechanics/topicsinqm3.pdf`, 'Tong, Topics in Quantum Mechanics Chapter 3 — hydrogen, fine structure and atomic structure (3.024 has no AMO)'),
    7: r(`${TONG}/topics-in-quantum-mechanics/topicsinqm4.pdf`, 'Tong, Topics in Quantum Mechanics Chapter 4 — Stark and Zeeman effects, atoms in light, selection rules and Rabi oscillations'),
    8: r(`${OCW}/3-024-electronic-optical-and-magnetic-properties-of-materials-spring-2013/pages/exams/`, '3.024 midterms and finals, 2012–2013 — the cumulative practice'),
  },
  'research-methods-scientific-communication-proposal': {
    1: r(`${THT}/pages/assignments/`, '22.THT assignments — thesis topic, elevator pitch and a central hypothesis'),
    2: r(`${THT}/pages/guides-templates-and-tools/`, '22.THT guides — reference managers, evaluating publishers, and sample prospectuses'),
    3: r('https://book.the-turing-way.org/reproducible-research/reproducible-research', 'The Turing Way — reproducible research: version control, environments, data and code sharing'),
    4: r('https://www.cos.io/initiatives/prereg', 'Center for Open Science — what preregistration is and how to write one'),
    5: r(`${NIST}/pri/pri.htm`, 'NIST/SEMATECH e-Handbook Chapter 5 — designing experiments: controls, randomisation, blocking and sample size'),
    6: r(`${J1314}/pages/syllabus/ethics/`, 'MIT Junior Lab — ethics in experimental physics: data, attribution and conduct'),
    7: r('https://book.the-turing-way.org/project-design/project-design', 'The Turing Way — project design: planning, milestones, resources and risk'),
    8: r(`${THT}/resources/mit22_thtf15_prosp_ex1/`, '22.THT sample thesis prospectus — a model for the written proposal (oral: Junior Lab\'s report resources)'),
  },
  'astrophysics-stars-galaxies-high-energy-universe': {
    1: r(`${ASTRO}/17-1-the-brightness-of-stars`, 'Astronomy 2e §17.1 and Chapter 19 — flux, luminosity, magnitudes and the distance ladder'),
    2: r(`${ASTRO}/5-3-spectroscopy-in-astronomy`, 'Astronomy 2e Chapters 5–6 — radiation, spectra and telescopes'),
    3: r('https://www.astro.ru.nl/~onnop/education/stev_utrecht_notes/chapter1-4.pdf', 'Pols, Stellar Structure and Evolution Chapters 2–4 — hydrostatic equilibrium, the virial theorem, equation of state and energy transport (Astronomy 2e is algebra-based)'),
    4: r(`${ASTRO}/22-3-checking-out-the-theory`, 'Astronomy 2e §§22.2–22.3 — star clusters and reading their ages from H–R diagrams'),
    5: r(`${ASTRO}/23-1-the-death-of-low-mass-stars`, 'Astronomy 2e Chapters 23–24 — white dwarfs, supernovae, neutron stars and black holes'),
    6: r(`${ASTRO}/20-1-the-interstellar-medium`, 'Astronomy 2e Chapters 20–21 — the interstellar medium and star formation'),
    7: r(`${ASTRO}/28-4-the-challenge-of-dark-matter`, 'Astronomy 2e §25.3, §27.2 and §28.4 — galaxy masses, supermassive black holes and the evidence for dark matter'),
    8: r(`${OCW}/8-282j-introduction-to-astronomy-spring-2006/pages/exams/`, 'MIT 8.282J quizzes and finals with solutions — the cumulative check'),
  },
  'quantum-information-and-amo': {
    1: r(`${PRESKILL}/ph219/chap2_15.pdf`, 'Preskill, Quantum Computation notes Chapter 2 — qubits, the Bloch sphere, density operators and measurement (8.370x on OCW only points to edX)'),
    2: r(`${PRESKILL}/ph229/notes/chap4_01.pdf`, 'Preskill Chapter 4 — entanglement, Bell inequalities and reduced states'),
    3: r(`${PRESKILL}/ph219/chap5_15.pdf`, 'Preskill Chapter 5 — classical and quantum circuits, universal gates and the cost of simulation'),
    4: r('https://arxiv.org/pdf/1907.09415#page=22', 'de Wolf, Quantum Computing: Lecture Notes §1.5 — teleportation, the protocol to benchmark under noise'),
    5: r(`${PRESKILL}/ph219/chap3_15.pdf`, 'Preskill Chapter 3 — generalised measurement, channels, Kraus operators and decoherence'),
    6: r(`${PRESKILL}/ph219/chap10_6A_2025.pdf`, 'Preskill Chapter 10 — entropy, distinguishability and quantum coding'),
    7: r(`${J1314}/resources/mit8_13-14f16-s17exp49/`, 'MIT Junior Lab guide — quantum information processing with NMR: control and spectroscopy on a real architecture'),
    8: r('https://arxiv.org/pdf/1907.09415#page=215', 'de Wolf, exercises with hints (Appendix C) — the cumulative practice'),
  },
  'nuclear-physics-radiation-and-detectors': {
    1: r(`${N2202}/mit22_02s12_lec_ch5/`, '22.02 Chapter 5 — nuclear structure: the nuclear force, the shell model and spin–orbit coupling (the liquid drop: Chapter 1)'),
    2: r(`${N2202}/mit22_02s12_lec_ch1/`, '22.02 Chapter 1 — binding energy, the semi-empirical mass formula and the decay law (chains: 22.01 Problem Sets 3–4)'),
    3: r(`${PDG}/rpp2024-rev-passage-particles-matter.pdf`, 'Particle Data Group review — passage of particles through matter: stopping power, range and photon attenuation (22.01\'s textbook is not free)'),
    4: r(`${J1314}/resources/mit8_13-14f16-s17exp1/`, 'MIT Junior Lab guide — Compton scattering: calibrating a gamma spectrometer and identifying lines'),
    5: r(`${PDG}/rpp2024-rev-particle-detectors-accel.pdf`, 'Particle Data Group review — particle detectors: gas, scintillator, semiconductor and calorimeter'),
    6: r(`${J1314}/resources/mit8_13-14f16-s17expii/`, 'MIT Junior Lab guide — Poisson statistics: counting, backgrounds and dead time'),
    7: r(`${N2202}/mit22_02s12_lec_ch8/`, '22.02 Chapter 8 — cross sections, interactions with matter, fusion and fission (dose: 22.01 Problem Set 8)'),
    8: r(`${N2201}/pages/exams/`, '22.01 Quizzes 1–2 with solutions and study sheets — the cumulative check'),
  },
  'advanced-experimental-physics-2-independent-investigation': {
    1: r(`${J1314}/pages/syllabus/expectations-and-grading-policy/`, 'MIT Junior Lab expectations — roles, preparation and the readiness standard for each experiment'),
    2: r(`${NIST}/mpc/mpc.htm`, 'NIST/SEMATECH e-Handbook Chapter 2 — characterising a measurement process: calibration, check standards and traceability'),
    3: r(`${J1314}/resources/mit8_13-14f16-s17exp14/`, 'Junior Lab guide — cosmic-ray muons: backgrounds, accidental coincidences and systematic checks'),
    4: r(`${PDG}/rpp2024-rev-statistics.pdf`, 'Particle Data Group statistics review — the tests and intervals to fix before a blind pilot'),
    5: r(`${J1314}/pages/requirements-for-experimental-notebooks/`, 'Junior Lab notebook requirements — recording data, metadata and provenance'),
    6: r(GUM, 'JCGM Guide to the Expression of Uncertainty in Measurement — building an uncertainty budget'),
    7: r(`${J1314}/pages/written-and-oral-report-resources/`, 'Junior Lab written and oral report resources — technical writing and comparing with published values'),
    8: r(`${J1314}/pages/experiments/`, 'Junior Lab\'s twenty experiments — candidates to replicate, write up and defend'),
  },
  'data-intensive-and-bayesian-physics': {
    1: r(`${S650}/mit18_650f16_bayesian_statistics_pdf/`, '18.650 Bayesian statistics slides — priors, posteriors, conjugacy and credible sets'),
    2: r(BDA(275), 'Gelman et al., Bayesian Data Analysis Chapter 11 — Gibbs and Metropolis sampling, convergence and effective sample size (18.650 has no computation)'),
    3: r(BDA(101), 'Bayesian Data Analysis Chapter 5 — hierarchical models and partial pooling'),
    4: r(BDA(141), 'Bayesian Data Analysis Chapter 6 — posterior predictive checks'),
    5: r('https://gwosc.org/tutorials/', 'Gravitational Wave Open Science Center tutorials — spectra, whitening and matched filtering in real detector noise'),
    6: r(`${S650}/lecture-10-generalized-linear-models-glms/`, '18.650 GLM slides — logistic regression for classification (selection effects: Bayesian Data Analysis Chapter 8)'),
    7: r(`${PDG}/rpp2024-rev-statistics.pdf`, 'Particle Data Group statistics review — unfolding, systematic uncertainties and how to report results'),
    8: r('https://sites.stat.columbia.edu/gelman/book/solutions3.pdf', 'Bayesian Data Analysis solutions to selected exercises — the cumulative practice'),
  },
  'physics-society-ethics-and-professional-practice': {
    1: r('https://www.aps.org/about/governance/statements/ethics', 'American Physical Society, Guidelines on Ethics — research results, publication, peer review and conduct (the NPTEL course\'s syllabus loads only in a browser)'),
    2: r('https://nap.nationalacademies.org/catalog/12192/on-being-a-scientist-a-guide-to-responsible-conduct-in', 'National Academies, On Being a Scientist — authorship, peer review, conflicts of interest and correcting errors'),
    3: r(`${J1314}/pages/laboratory-safety-and-regulations-in-junior-lab/`, 'MIT Junior Lab safety and regulations — radiation, lasers, high voltage and cryogens in practice'),
    4: r('https://www.atomicarchive.com/resources/documents/manhattan-project/franck-report.html', 'The Franck Report (1945) — physicists\' memo on a dual-use technology, the model for a stakeholder decision memo'),
    5: r('https://www.ipcc.ch/site/assets/uploads/2017/08/AR5_Uncertainty_Guidance_Note.pdf', 'IPCC guidance on communicating uncertainty — calibrated language for confidence and likelihood'),
    6: r('https://www.withouthotair.com/', 'MacKay, Sustainable Energy — Without the Hot Air: energy and climate by the numbers'),
    7: r('https://www.compadre.org/jtupp/report.cfm', 'Phys21 report (APS/AAPT) — careers, skills, collaboration and inclusion for physics graduates'),
    8: r('https://nptel.ac.in/courses/110105097', 'NPTEL, Ethics in Engineering Practice (the catalogue\'s course) — lecture videos for the hearing'),
  },
  'senior-research-thesis-and-defense': {
    1: r(`${THA}/pages/assignments/`, '2.ThA sessions 1–3 — revising the proposal, settling scope and the thesis agreement'),
    2: r('https://rescience.github.io/', 'ReScience C — how reproductions of published results are written and reviewed: the model for reproducing a baseline'),
    3: r(`${NIST}/mpc/mpc.htm`, 'NIST/SEMATECH e-Handbook Chapter 2 — characterising a method before trusting it: the readiness evidence'),
    4: r('https://book.the-turing-way.org/project-design/project-design', 'The Turing Way — project design: milestones, risk registers and rescoping'),
    5: r(GUM, 'JCGM Guide to the Expression of Uncertainty in Measurement — evaluating and combining uncertainties'),
    6: r(`${PDG}/rpp2024-rev-statistics.pdf`, 'Particle Data Group statistics review — tests, intervals and systematic checks for adversarial review'),
    7: r(`${THA}/resources/thesis_structure/`, '2.ThA thesis-structure handout (and its reviewer checklist) — writing the thesis and answering reviewers'),
    8: r(`${J1314}/pages/student-presentations/`, 'MIT Junior Lab student presentations — examples for the public defence (2.ThA\'s oral assessment form sets the criteria)'),
  },
  'cosmology-and-gravitational-waves': {
    1: r(`${TONG}/cosmology/cosmo1.pdf`, 'Tong, Cosmology Chapter 1 — the FRW metric, redshift and cosmological distances (8.962 is graduate GR with two cosmology lectures)'),
    2: r(`${R8962}/pages/lecture-summaries/`, '8.962 Lectures 18–19 — cosmological spacetimes and the Friedmann equations (videos from the summaries)'),
    3: r(`${TONG}/cosmology/cosmo2.pdf`, 'Tong, Cosmology Chapter 2 — the hot universe: thermal history, nucleosynthesis, recombination and the CMB'),
    4: r('https://github.com/PantheonPlusSH0ES/DataRelease', 'Pantheon+ data release — Type Ia supernova distances with their covariance, for the expansion fit'),
    5: r(`${TONG}/cosmology/cosmo3.pdf`, 'Tong, Cosmology Chapter 3 — structure formation: perturbations, growth and dark matter'),
    6: r(`${TONG}/general-relativity/gr5.pdf`, 'Tong, General Relativity Chapter 5 — linearised gravity, gravitational waves and how they are made (8.962 Lectures 14–17)'),
    7: r('https://arxiv.org/abs/1602.03837', 'LIGO and Virgo, Observation of Gravitational Waves from a Binary Black Hole Merger — signal, detectors and significance'),
    8: r(`${R8962}/pages/assignments/`, '8.962 problem sets with hints — the cumulative practice (graduate level)'),
  },
  'quantum-materials-and-many-body-physics': {
    1: r(`${TONG}/quantum-field-theory/qft2.pdf`, 'Tong, Quantum Field Theory Chapter 2 — creation and annihilation operators and Fock space (8.511 assumes them)'),
    2: r(`${S511}/lec9/`, '8.511 Lecture 9 (graduate) — tight binding and van Hove singularities (lattice symmetry: Lectures 2 and 4)'),
    3: r(`${S512}/mit8_512s09_lec23_24/`, '8.512 Lectures 23–24 — Fermi-liquid theory, quasiparticles and Landau parameters (8.511 stops before them)'),
    4: r(`${S511}/lec18/`, '8.511 Lecture 18 — the Hubbard model, screening and plasmons: the model to diagonalise'),
    5: r(`${S512}/mit8_512s09_lec14_15/`, '8.512 Lectures 14–19 — local moments, exchange, spin waves and Stoner magnetism'),
    6: r(`${S511}/lec22/`, '8.511 Lectures 21–24 — phonon-mediated attraction, the Cooper instability, BCS and Bogoliubov quasiparticles'),
    7: r('https://topocondmat.org/w1-topointro/d-1', 'Topology in Condensed Matter (TU Delft, free) — bulk–edge correspondence in a one-dimensional chain (quantum Hall edges: 8.511 Lecture 14)'),
    8: r(`${OCW}/8-511-theory-of-solids-i-fall-2004/pages/assignments/`, '8.511 Problem Sets 1–11 — the cumulative practice (graduate; no solutions posted)'),
  },
  'particle-physics-and-the-standard-model': {
    1: r(`${P701}/mit8_701f20_lec0-8/`, '8.701 slides 0.8, 1.4–1.5 and 4.8 — relativistic kinematics, decays, reactions and cross sections'),
    2: r(`${P701}/mit8_701f20_lec2-1/`, '8.701 Chapter 2 — symmetries: flavour, parity, C and CP (Feynman reasoning: Chapters 1 and 3)'),
    3: r(`${P701}/mit8_701f20_lec5-5/`, '8.701 Chapter 5 — QCD: hadron production, deep inelastic scattering, asymptotic freedom and confinement'),
    4: r('https://opendata.cern.ch/record/700', 'CERN Open Data — CMS dimuon events from 2010, ready for reconstructing the J/ψ, Υ and Z peaks'),
    5: r(`${P701}/mit8_701f20_lec6-2/`, '8.701 Chapters 6 and 8 — weak interactions, electroweak unification, neutrino masses and mixing'),
    6: r(`${P701}/mit8_701f20_lec7-1/`, '8.701 Chapter 7 — the Higgs mechanism, fermion masses, production and decay'),
    7: r(`${PDG}/rpp2024-rev-statistics.pdf`, 'Particle Data Group statistics review — likelihoods, limits and discovery thresholds (detectors: 8.701 Chapter 10)'),
    8: r(`${OCW}/8-701-introduction-to-nuclear-and-particle-physics-fall-2020/pages/assignments/`, '8.701 Problem Sets 1–6 with solutions — the cumulative check'),
  },
};
