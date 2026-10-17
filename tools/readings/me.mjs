/** Mechanical Engineering: the part of each course's free resource that covers each unit (audited October 2026). */
const r = (url, where) => ({ url, where });

const OCW = 'https://ocw.mit.edu/courses';
const C1801 = `${OCW}/18-01sc-single-variable-calculus-fall-2010/pages`;
const D1 = `${C1801}/1.-differentiation/part-a-definition-and-basic-rules`;
const A2 = `${C1801}/unit-2-applications-of-differentiation`;
const I3 = `${C1801}/unit-3-the-definite-integral-and-its-applications`;
const M801 = `${OCW}/8-01sc-classical-mechanics-fall-2016/pages`;
const O803 = `${OCW}/8-03sc-physics-iii-vibrations-and-waves-fall-2016/pages/part-i-mechanical-vibrations-and-waves`;
const E8012 = `${OCW}/8-012-physics-i-classical-mechanics-fall-2008/pages/exams/`;
const UP1 = 'https://openstax.org/books/university-physics-volume-1/pages';
const S3091 = `${OCW}/3-091sc-introduction-to-solid-state-chemistry-fall-2010/pages`;
const OSC = 'https://openstax.org/books/chemistry-2e/pages';
const P0001 = `${OCW}/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources`;
const P0002 = `${OCW}/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/resources`;
const TTW = 'https://book.the-turing-way.org/reproducible-research';
const D2007 = `${OCW}/2-007-design-and-manufacturing-i-spring-2009/resources`;
const EGD = 'https://uw.pressbooks.pub/enggraphics/chapter';

export const ME_READINGS = {
  'engineering-calculus-1': {
    1: r(`${D1}/session-4-limits-and-continuity/`, '18.01SC Sessions 4–5 — limits, continuity and kinds of discontinuity'),
    2: r(`${A2}/part-a-approximation-and-curve-sketching/session-23-linear-approximation/`, '18.01SC Sessions 23–24 — linear approximation and sensitivity (Sessions 1–11 for the derivative rules)'),
    3: r(`${A2}/part-b-optimization-related-rates-and-newtons-method/session-29-optimization-problems/`, '18.01SC Sessions 29–31 — optimisation and related rates'),
    4: r(`${A2}/part-c-mean-value-theorem-antiderivatives-and-differential-equations/session-39-introduction-to-differential-equations/`, '18.01SC Sessions 36 and 39–40 — differentials and differential-equation models of mechanical systems'),
    5: r(`${I3}/part-a-definition-of-the-definite-integral-and-first-fundamental-theorem/session-48-the-fundamental-theorem-of-calculus/`, '18.01SC Sessions 46–49 — Riemann sums and the fundamental theorem: accumulation and conservation'),
    6: r(`${I3}/part-c-average-value-probability-and-numerical-integration/session-63-numerical-integration/`, '18.01SC Sessions 63–64 — numerical integration, with Unit 4 (Sessions 74–76) for partial fractions and parts'),
    7: r(`${C1801}/unit-5-exploring-the-infinite/part-b-taylor-series/session-98-taylors-series/`, '18.01SC Sessions 97–99 — power and Taylor series, and the size of the remainder'),
    8: r(`${C1801}/final-exam/`, '18.01SC final exam with solutions — the cumulative check'),
  },
  'university-physics-1-mechanics-waves': {
    1: r(`${M801}/week-1-kinematics/1-1-coordinate-systems-and-unit-vectors-in-1d-position-vector-in-1d/`, '8.01SC Lessons 1–3 — coordinates, vectors, velocity and acceleration'),
    2: r(`${M801}/week-2-newtons-laws/4-1-newtons-first-and-second-laws/`, '8.01SC Lessons 4–7 — Newton\'s laws, contact forces, tension and free-body diagrams'),
    3: r(`${M801}/week-7-kinetic-energy-and-work/`, '8.01SC Weeks 7–8 — work, kinetic and potential energy, and conservative forces'),
    4: r(`${M801}/week-5-momentum-and-impulse/`, '8.01SC Weeks 5 and 9 — momentum, impulse and collisions'),
    5: r(`${M801}/week-10-rotational-motion/`, '8.01SC Weeks 10–12 — rotation, torque, angular momentum and rolling'),
    6: r(`${UP1}/12-introduction`, 'OpenStax University Physics Vol. 1 Chapter 12 — static equilibrium, stress, strain and elastic moduli (8.01SC stops short of elasticity)'),
    7: r(`${O803}/lecture-1/`, '8.03SC Lectures 1–3 and 7–10 — oscillation, damping, resonance and waves (8.01SC stops before oscillations)'),
    8: r(E8012, '8.012 exams with solutions — the cumulative check'),
  },
  'chemistry-materials-foundations': {
    1: r(`${S3091}/bonding-and-molecules/8--ionic-crystals-born-haber-cycle/`, '3.091SC Sessions 8–12 — ionic and covalent bonding, molecular shape and intermolecular forces'),
    2: r(`${S3091}/crystalline-materials/15-introduction-to-crystallography/`, '3.091SC Sessions 15, 19–20 and 24 — crystal structures, defects and diffusion'),
    3: r(`${OSC}/5-introduction`, 'OpenStax Chemistry 2e Chapters 5, 13 and 16 — thermochemistry, equilibrium and Gibbs energy (3.091SC does not teach them)'),
    4: r(`${S3091}/solid-solutions/34-binary-phase-diagrams-complete-solubility/`, '3.091SC Sessions 33–35 — unary and binary phase diagrams, tie lines and the lever rule'),
    5: r(`${S3091}/reactions-and-kinetics/23-reaction-rates/`, '3.091SC Sessions 23–24 — reaction rates, Arrhenius behaviour and diffusion in processing'),
    6: r(`${OSC}/17-introduction`, 'OpenStax Chemistry 2e Chapter 17 — galvanic cells, the Nernst equation, batteries and corrosion (3.091SC does not cover them)'),
    7: r(`${S3091}/organic-materials/28-polymers-structure-composition/`, '3.091SC Sessions 21–22 and 28–29 — glasses and polymers (composites: see the gaps)'),
    8: r(`${S3091}/final-exam/`, '3.091SC final exam with solution key — the cumulative check'),
  },
  'programming-engineering-computation': {
    1: r(`${P0001}/mit6_0001f16_lec2/`, '6.0001 Lectures 1–2 — computation, variables, branching and iteration'),
    2: r('https://numpy.org/doc/stable/user/absolute_beginners.html', 'NumPy: the absolute basics — arrays, vectors and tables'),
    3: r(`${P0001}/mit6_0001f16_lec4/`, '6.0001 Lecture 4, with Lectures 10–11 — decomposition, functions, and how running time grows'),
    4: r(`${P0001}/mit6_0001f16_lec7/`, '6.0001 Lecture 7 — testing, debugging, exceptions and assertions for a numerical model'),
    5: r(`${P0001}/mit6_0001f16_lec3/`, '6.0001 Lecture 3 — guess and check, approximation and bisection'),
    6: r(`${P0002}/mit6_0002f16_lec10/`, '6.0002 Lectures 9–10 — fitting models to experimental data and judging the residuals'),
    7: r(`${TTW}/vcs`, 'The Turing Way — version control'),
    8: r(`${TTW}/renv`, 'The Turing Way — reproducible environments, so the release runs from a clean setup'),
  },
  'engineering-graphics-cad-design-studio': {
    1: r(`${D2007}/mit2_007s09_lec02/`, '2.007 Lecture 2 — problem definition: needs, functional requirements and sketches'),
    2: r(`${EGD}/orthographic-projection/`, 'Engineering Graphics and Design (Ford, UW Pressbooks) — orthographic projection, multiview and section views, and dimensioning'),
    3: r(`${D2007}/mit2_007s09_lec04/`, '2.007 Lectures 4–5 — creating CAD components with design intent'),
    4: r(`${D2007}/mit2_007s09_lec07/`, '2.007 Lectures 6–7 — mechanism kinematics and CAD assemblies'),
    5: r(`${EGD}/conventional-tolerancing/`, 'Engineering Graphics and Design — conventional tolerancing, standard fits and an introduction to GD&T'),
    6: r(`${D2007}/mit2_007s09_rec05_frdparrc/`, '2.007 Recitation 5 — FRDPARRC tables for generating and comparing concepts (Recitation 7 for the Pugh-chart review)'),
    7: r(`${OCW}/2-670-mechanical-engineering-tools-january-iap-2004/pages/tutorials/`, 'MIT 2.670 shop tutorials — measurement, layout and safe use of the saw, drill, lathe and mill for prototypes'),
    8: r(`${D2007}/mit2_007s09_rec06_dr1/`, '2.007 design-review notes — what a complete design package must show'),
  },
};
