/** Physics: the part of each course's free resource that covers each unit (audited October 2026). */
const r = (url, where) => ({ url, where });

const OCW = 'https://ocw.mit.edu/courses';
const C1801 = `${OCW}/18-01sc-single-variable-calculus-fall-2010/pages`;
const M801 = `${OCW}/8-01sc-classical-mechanics-fall-2016/pages`;
const O803 = `${OCW}/8-03sc-physics-iii-vibrations-and-waves-fall-2016/pages`;
const C5111 = `${OCW}/5-111sc-principles-of-chemical-science-fall-2014/pages`;
const L6100 = `${OCW}/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/pages`;
const NIST = 'https://www.itl.nist.gov/div898/handbook';

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
};
