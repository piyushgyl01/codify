/** Electrical Engineering: the part of each course's free resource that covers each unit (audited October 2026). */
const r = (url, where) => ({ url, where });

const OCW = 'https://ocw.mit.edu/courses';
const C1801 = `${OCW}/18-01sc-single-variable-calculus-fall-2010/pages`;
const D1 = `${C1801}/1.-differentiation/part-a-definition-and-basic-rules`;
const A2 = `${C1801}/unit-2-applications-of-differentiation`;
const I3 = `${C1801}/unit-3-the-definite-integral-and-its-applications`;
const M801 = `${OCW}/8-01sc-classical-mechanics-fall-2016/pages`;
const O803 = `${OCW}/8-03sc-physics-iii-vibrations-and-waves-fall-2016/pages/part-i-mechanical-vibrations-and-waves`;
const E8012 = `${OCW}/8-012-physics-i-classical-mechanics-fall-2008/pages/exams/`;
const L6100 = `${OCW}/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/pages`;
const TTW = 'https://book.the-turing-way.org/reproducible-research';
const LIEC = 'https://www.ibiblio.org/kuphaldt/electricCircuits';
const WG = 'https://openstax.org/books/writing-guide/pages';
const J1314 = `${OCW}/8-13-14-experimental-physics-i-ii-junior-lab-fall-2016-spring-2017/pages`;

export const EE_READINGS = {
  'calculus-i-models-and-change': {
    1: r(`${D1}/session-3-derivative-as-rate-of-change/`, '18.01SC Session 3 — the derivative as a rate of change'),
    2: r(`${D1}/session-4-limits-and-continuity/`, '18.01SC Session 4 — limits and continuity'),
    3: r(`${D1}/session-5-discontinuity/`, '18.01SC Session 5 — kinds of discontinuity'),
    4: r(`${D1}/session-1-introduction-to-derivatives/`, '18.01SC Sessions 1–2 and 6 — the derivative from its definition'),
    5: r(`${D1}/session-11-chain-rule/`, '18.01SC Sessions 9–11 — product, quotient and chain rules for composed systems'),
    6: r(`${C1801}/1.-differentiation/exam-1/session-22-materials-for-exam-1/`, '18.01SC Exam 1 with solutions — a closed-notes checkpoint on rates'),
    7: r(`${A2}/part-a-approximation-and-curve-sketching/session-23-linear-approximation/`, '18.01SC Sessions 23–26 — linear and quadratic approximation for prediction'),
    8: r(`${A2}/part-b-optimization-related-rates-and-newtons-method/session-29-optimization-problems/`, '18.01SC Sessions 29–30 — optimisation problems'),
    9: r(`${I3}/part-a-definition-of-the-definite-integral-and-first-fundamental-theorem/session-46-riemann-sums/`, '18.01SC Sessions 43–46 — accumulation as Riemann sums'),
    10: r(`${I3}/part-a-definition-of-the-definite-integral-and-first-fundamental-theorem/session-48-the-fundamental-theorem-of-calculus/`, '18.01SC Sessions 47–49 — the fundamental theorem: rate and accumulation'),
    11: r(`${A2}/exam-2/session-41-review-for-exam-2/`, '18.01SC Exam 2 review — applied modelling problems for the practical'),
    12: r(`${I3}/part-c-average-value-probability-and-numerical-integration/session-63-numerical-integration/`, '18.01SC Sessions 63–64 — numerical integration, with Unit 4 for substitution, parts and partial fractions'),
    13: r(`${A2}/part-c-mean-value-theorem-antiderivatives-and-differential-equations/session-40-separation-of-variables/`, '18.01SC Sessions 39–40 — differential equations by separation of variables'),
    14: r(`${C1801}/unit-5-exploring-the-infinite/part-b-taylor-series/session-98-taylors-series/`, '18.01SC Sessions 97–99 — power and Taylor series'),
    15: r('https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html', 'SciPy solve_ivp — integrating the model numerically for the demonstration'),
    16: r(`${C1801}/final-exam/`, '18.01SC final exam with solutions — the cumulative check'),
  },
  'physics-i-mechanics-and-waves': {
    1: r(`${M801}/week-1-kinematics/1-1-coordinate-systems-and-unit-vectors-in-1d-position-vector-in-1d/`, '8.01SC Lesson 1 — coordinates, position and velocity'),
    2: r(`${M801}/week-1-kinematics/2-1-introduction-to-acceleration/`, '8.01SC Lessons 2–3 — acceleration, in one and two dimensions'),
    3: r(`${M801}/week-2-newtons-laws/4-1-newtons-first-and-second-laws/`, '8.01SC Lessons 4–7 — Newton\'s laws, gravity, contact forces, tension and springs'),
    4: r(`${M801}/week-4-drag-forces-constraints-and-continuous-systems/12-1-pulley-problems-part-i-set-up-the-equations/`, '8.01SC Lessons 12–14 — pulleys, constraints and drag'),
    5: r(`${M801}/week-7-kinetic-energy-and-work/`, '8.01SC Weeks 7–8 — work, kinetic and potential energy'),
    6: r(E8012, '8.012 Exam 1 with solutions — the particle-mechanics checkpoint'),
    7: r(`${M801}/week-5-momentum-and-impulse/`, '8.01SC Weeks 5 and 9 — momentum, impulse and collisions'),
    8: r(`${M801}/week-10-rotational-motion/`, '8.01SC Weeks 10–12 — rotation, torque, angular momentum and rolling'),
    9: r(`${M801}/week-10-rotational-motion/30-1-introduction-to-torque-and-rotational-dynamics/`, '8.01SC Lessons 30–31 — torque and the conditions for equilibrium'),
    10: r(`${O803}/lecture-1/`, '8.03SC Lectures 1–3 — simple harmonic motion, damping and resonance (8.01SC stops before oscillations)'),
    11: r(`${M801}/week-9-collision-theory/problem-set-9/`, '8.01SC Problem Set 9 — a mixed practical on collisions'),
    12: r(`${O803}/lecture-10/`, '8.03SC Lectures 7–10 — the wave equation and travelling waves'),
    13: r(`${O803}/lecture-4/`, '8.03SC Lectures 4–6 — coupled oscillators and normal modes'),
    14: r('https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.curve_fit.html', 'SciPy curve_fit — fitting a model to measured data to test a claim'),
    15: r(`${J1314}/written-and-oral-report-resources/`, 'MIT Junior Lab report resources — presenting an investigation from its raw evidence'),
    16: r(E8012, '8.012 final exam with solutions — the cumulative check'),
  },
  'programming-for-engineers': {
    1: r(`${L6100}/lecture-2-strings-inputoutput-branching/`, '6.100L Lecture 2 — strings, input/output and branching'),
    2: r(`${L6100}/lecture-3-iteration/`, '6.100L Lectures 3–4 — iteration and loops'),
    3: r(`${L6100}/lecture-7-decomposition-abstraction-functions/`, '6.100L Lecture 7 — decomposition, abstraction and functions'),
    4: r(`${L6100}/lecture-9-lambda-functions-tuples-and-lists/`, '6.100L Lectures 9–11 and 14 — tuples, lists, mutability and dictionaries'),
    5: r(`${L6100}/lecture-12-list-comprehension-functions-as-objects-testing-debugging/`, '6.100L Lectures 12–13 — testing, debugging, exceptions and assertions'),
    6: r(`${L6100}/finger-exercises/`, '6.100L finger exercises — small programs from a specification'),
    7: r(`${L6100}/lecture-8-functions-as-objects/`, '6.100L Lecture 8 — functions as objects and abstraction'),
    8: r(`${L6100}/lecture-17-python-classes/`, '6.100L Lectures 17–19 — classes, methods and inheritance'),
    9: r(`${L6100}/lecture-21-timing-programs-counting-operations/`, '6.100L Lectures 21–23 — timing programs and complexity'),
    10: r(`${L6100}/lecture-25-plotting/`, '6.100L Lecture 25 — plotting and working with data'),
    11: r(`${TTW}/testing`, 'The Turing Way — testing research code: for repairing an unfamiliar repository'),
    12: r(`${L6100}/lecture-26-list-access-hashing-simulations-and-wrap-up/`, '6.100L Lecture 26 — simulations'),
    13: r(`${TTW}/vcs`, 'The Turing Way — version control for maintainable code'),
    14: r(`${L6100}/lecture-20-fitness-tracker-object-oriented-programming-example/`, '6.100L Lecture 20 — building a complete tool with classes'),
    15: r(`${TTW}/renv`, 'The Turing Way — reproducible environments: a demo that runs from a clean setup'),
    16: r(`${TTW}/reviewing`, 'The Turing Way — code review: preparing to defend your code'),
  },
  'electrical-engineering-studio-i': {
    1: r(`${LIEC}/DC/DC_1.html`, 'Lessons in Electric Circuits, Vol. I Chapter 1 — charge, current, voltage and resistance'),
    2: r(`${LIEC}/DC/DC_2.html`, 'Lessons in Electric Circuits, Vol. I Chapter 2 — Ohm\'s law and power'),
    3: r(`${LIEC}/DC/DC_8.html`, 'Vol. I Chapter 8 — DC meters and how they load the circuit they measure'),
    4: r(`${LIEC}/DC/DC_9.html`, 'Vol. I Chapter 9 — instrumentation signals: sensors, bridges and 4–20 mA loops'),
    5: r(`${LIEC}/Digital/DIGI_3.html`, 'Vol. IV Chapter 3 — logic gates'),
    6: r(`${LIEC}/Ref/REF_8.html`, 'Vol. V Chapter 8 — troubleshooting in theory and practice, for diagnosing hidden faults'),
    7: r(`${LIEC}/Digital/DIGI_10.html`, 'Vol. IV Chapter 10 — latches and flip-flops: giving a circuit memory'),
    8: r('https://docs.wokwi.com/', 'Wokwi documentation — programming a simulated microcontroller and its peripherals'),
    9: r(`${LIEC}/Digital/DIGI_13.html`, 'Vol. IV Chapter 13 — digital-to-analogue and analogue-to-digital conversion'),
    10: r(`${LIEC}/Semi/SEMI_8.html`, 'Vol. III Chapter 8 — op-amps and negative feedback: closing the loop'),
    11: r('https://www.falstad.com/circuit/', 'CircuitJS1 — simulate the integration practical, faults and all'),
    12: r(`${LIEC}/Digital/DIGI_14.html`, 'Vol. IV Chapter 14 — digital communication: serial links, encoding and errors'),
    13: r(`${LIEC}/DC/DC_11.html`, 'Vol. I Chapter 11 — batteries and power systems: accounting for energy'),
    14: r(`${LIEC}/DC/DC_6.html`, 'Vol. I Chapter 6 — dividers and Kirchhoff\'s laws: the front end most sensors need'),
    15: r('https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc-virtual-lab', 'PhET Circuit Construction Kit — rehearse the demonstration and its injected fault'),
    16: r(`${LIEC}/DC/DC_3.html`, 'Vol. I Chapter 3 — electrical safety: the consequences an engineer answers for'),
  },
  'writing-and-argument-for-engineers': {
    1: r(`${WG}/18-3-glance-at-genre-genre-audience-purpose-organization`, 'Writing Guide §18.3 — genre, audience, purpose and organisation'),
    2: r(`${WG}/10-3-glance-at-genre-thesis-reasoning-and-evidence`, 'Writing Guide §10.3 — thesis, reasoning and evidence'),
    3: r(`${WG}/13-1-the-research-process-where-to-look-for-existing-sources`, 'Writing Guide §13.1 and §14.1 — finding and evaluating sources'),
    4: r(`${WG}/8-3-glance-at-genre-informal-and-formal-analytical-reports`, 'Writing Guide §8.3 and §8.8 — analytical reports and technical language'),
    5: r(`${WG}/12-3-glance-at-genre-introducing-research-as-evidence`, 'Writing Guide §12.3 — introducing research as evidence'),
    6: r(`${WG}/6-3-glance-at-genre-features-of-proposals`, 'Writing Guide §6.3 — features of a recommendation or proposal'),
    7: r(`${WG}/8-5-writing-process-creating-an-analytical-report`, 'Writing Guide §8.5 — writing up an analysis and its method'),
    8: r(`${WG}/12-6-editing-focus-integrating-sources-and-quotations`, 'Writing Guide §12.6 — quoting, paraphrasing and integrating sources'),
    9: r(`${WG}/10-6-editing-focus-paragraphs-and-transitions`, 'Writing Guide §10.6 — paragraphs and transitions'),
    10: r(`${WG}/3-6-editing-focus-sentence-structure`, 'Writing Guide §3.6 — sentence structure'),
    11: r(`${WG}/6-7-evaluation-conventions-clarity-and-coherence`, 'Writing Guide §6.7 — conventions, clarity and coherence: what a live edit fixes'),
    12: r(`${WG}/13-2-the-research-process-how-to-create-sources`, 'Writing Guide §13.2 — creating sources through interviews and observation'),
    13: r('https://www.ipcc.ch/site/assets/uploads/2017/08/AR5_Uncertainty_Guidance_Note.pdf', 'IPCC guidance on communicating uncertainty — calibrated words for confidence and likelihood'),
    14: r(`${WG}/18-5-writing-process-create-a-multimodal-advocacy-project`, 'Writing Guide §18.5 — building a multimodal public explainer'),
    15: r(`${WG}/19-7-spotlight-on-delivery-public-speaking`, 'Writing Guide §19.7 — delivery and public speaking'),
    16: r(`${WG}/13-6-spotlight-on-ethical-research`, 'Writing Guide §13.6 — ethical research: every claim traceable to a source'),
  },
};
