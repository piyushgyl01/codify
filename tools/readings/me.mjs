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
const C2 = `${OCW}/18-02sc-multivariable-calculus-fall-2010/pages`;
const LA06 = `${OCW}/18-06sc-linear-algebra-fall-2011/pages`;
const C1803 = `${OCW}/18-03sc-differential-equations-fall-2011/pages`;
const T802 = `${OCW}/8-02-physics-ii-electricity-and-magnetism-spring-2007/resources`;
const X802 = `${OCW}/8-02x-physics-ii-electricity-magnetism-with-an-experimental-focus-spring-2005/pages/exams/`;
const LIEC = 'https://www.ibiblio.org/kuphaldt/electricCircuits';
const ES = 'https://engineeringstatics.org';
const DTP = 'https://www.doitpoms.ac.uk/tlplib';
const M2008 = `${OCW}/2-008-design-and-manufacturing-ii-spring-2025/resources`;
const D2003 = `${OCW}/2-003sc-engineering-dynamics-fall-2011/pages`;
const S2001 = `${OCW}/2-001-mechanics-materials-i-fall-2006/resources`;
const U16 = 'https://web.mit.edu/16.unified/www/FALL/thermodynamics/notes';
const YAN = 'https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Introduction_to_Engineering_Thermodynamics_(Yan)';
const F1060 = `${OCW}/1-060-engineering-mechanics-ii-spring-2006/resources`;
const F225 = `${OCW}/2-25-advanced-fluid-mechanics-fall-2013/pages`;
const C6002 = `${OCW}/6-002-circuits-and-electronics-spring-2007/resources`;
const AHTT = p => `https://ahtt.mit.edu/wp-content/uploads/2024/04/AHTTv600.pdf#page=${p}`;
const E272 = `${OCW}/2-72-elements-of-mechanical-design-spring-2009/resources`;
const FBS = p => `https://www.cds.caltech.edu/~murray/books/AM08/pdf/fbs-public_24Jul2020.pdf#page=${p}`;
const NIST = 'https://www.itl.nist.gov/div898/handbook';
const J1314 = `${OCW}/8-13-14-experimental-physics-i-ii-junior-lab-fall-2016-spring-2017/pages`;
const F2092 = `${OCW}/2-092-finite-element-analysis-of-solids-and-fluids-i-fall-2009/resources`;
const F2094 = `${OCW}/2-094-finite-element-analysis-of-solids-and-fluids-ii-spring-2011/resources`;
const N229 = `${OCW}/2-29-numerical-fluid-mechanics-spring-2015/resources`;
const VAL = 'https://users.ece.utexas.edu/~valvano/Volume1/E-Book';
const M2737 = `${OCW}/2-737-mechatronics-fall-2014/resources`;
const L2672 = `${OCW}/2-672-project-laboratory-spring-2009/resources`;
const PDD = `${OCW}/15-783j-product-design-and-development-spring-2006/resources`;
const NASA = p => `https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf#page=${p + 10}`;
const SAF = `${OCW}/16-63j-system-safety-spring-2016/resources`;
const MR = p => `https://hades.mech.northwestern.edu/images/7/7f/MR.pdf#page=${p}`;
const A16100 = `${OCW}/16-100-aerodynamics-fall-2005/resources`;
const NGRC = 'https://www.grc.nasa.gov/www/k-12/airplane';
const E260 = `${OCW}/2-60j-fundamentals-of-advanced-energy-conversion-spring-2020/resources`;

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
  'multivariable-calculus-vector-analysis': {
    1: r(`${C2}/1.-vectors-and-matrices/part-a-vectors-determinants-and-planes/session-1-vectors/`, '18.02SC Sessions 1–8 — vectors, dot and cross products, planes and coordinates'),
    2: r(`${C2}/1.-vectors-and-matrices/part-c-parametric-equations-for-curves/session-19-velocity-and-acceleration/`, '18.02SC Sessions 15–21 — parametric curves, velocity, acceleration and arc length'),
    3: r(`${C2}/2.-partial-derivatives/part-a-functions-of-two-variables-tangent-approximation-and-optimization/session-26-partial-derivatives/`, '18.02SC Sessions 24–27 and 32–38 — partial derivatives, tangent planes, gradient and directional derivatives'),
    4: r(`${C2}/2.-partial-derivatives/part-c-lagrange-multipliers-and-constrained-differentials/session-39-statement-of-lagrange-multipliers-and-example/`, '18.02SC Sessions 28–30 and 39–41 — optimisation and Lagrange multipliers'),
    5: r(`${C2}/3.-double-integrals-and-line-integrals-in-the-plane/part-a-double-integrals/session-51-applications-mass-and-average-value/`, '18.02SC Sessions 47–52 and 74–78 — double and triple integrals for mass, centroids and moments of inertia'),
    6: r(`${C2}/3.-double-integrals-and-line-integrals-in-the-plane/part-b-vector-fields-and-line-integrals/session-57-work-and-line-integrals/`, '18.02SC Sessions 56–64 — vector fields, work, circulation and potentials'),
    7: r(`${C2}/3.-double-integrals-and-line-integrals-in-the-plane/part-c-greens-theorem/session-65-greens-theorem/`, '18.02SC Sessions 65–72 and 79–95 — Green\'s, divergence and Stokes\' theorems'),
    8: r(`${C2}/4.-triple-integrals-and-surface-integrals-in-3-space/exam-4/practice-exam/`, '18.02SC Exam 4 practice exam with solutions — the cumulative check'),
  },
  'linear-algebra-differential-equations-numerical-methods': {
    1: r(`${LA06}/ax-b-and-the-four-subspaces/elimination-with-matrices/`, '18.06SC — elimination, rank and the four subspaces (conditioning: see the gaps)'),
    2: r(`${LA06}/least-squares-determinants-and-eigenvalues/projection-matrices-and-least-squares/`, '18.06SC — bases, projections and least squares'),
    3: r(`${C1803}/unit-iv-first-order-systems/matrix-exponentials/`, '18.03SC Unit IV — eigenvalues, normal modes and matrix exponentials'),
    4: r(`${C1803}/unit-i-first-order-differential-equations/numerical-methods/`, '18.03SC Unit I — numerical methods for ODEs and how their error shrinks'),
    5: r(`${C1803}/unit-iv-first-order-systems/qualitative-behavior-phase-portraits/`, '18.03SC Unit IV — first-order systems and phase portraits'),
    6: r(`${C1803}/unit-ii-second-order-constant-coefficient-linear-equations/frequency-response-and-practical-resonance/`, '18.03SC Unit II — damping, frequency response and resonance'),
    7: r(`${C1803}/unit-iii-fourier-series-and-laplace-transform/laplace-transform-solving-initial-value-problems/`, '18.03SC Unit III — Laplace transforms (discretisation and stability: see the gaps)'),
    8: r(`${C1803}/final-exam/`, '18.03SC final exam with solutions — the cumulative check'),
  },
  'university-physics-2-electricity-magnetism-circuits': {
    1: r(`${T802}/chap2coulomb_law/`, '8.02 course notes Chapters 1–2 — fields and Coulomb\'s law (the catalogued 2019 8.02 only points to edX)'),
    2: r(`${T802}/ch3electri_poten/`, '8.02 course notes Chapters 3–5 — potential, conductors and capacitance'),
    3: r(`${T802}/chap7dc_circuits/`, '8.02 course notes Chapters 6–7 — current, resistance and DC circuits'),
    4: r(`${LIEC}/DC/DC_16.html`, 'Lessons in Electric Circuits Vol. I Chapter 16 — RC and L/R time constants, for a safe low-voltage measurement'),
    5: r(`${T802}/ch8magneti_field/`, '8.02 course notes Chapters 8–9 — magnetic forces, torque on current loops, and sources of field'),
    6: r(`${T802}/cha10faraday_law/`, '8.02 course notes Chapters 10–11 — Faraday\'s law, inductance and magnetic energy'),
    7: r(`${T802}/chapte13em_waves/`, '8.02 course notes Chapter 13 — Maxwell\'s equations and electromagnetic waves'),
    8: r(X802, '8.02X exams with solutions — the cumulative check'),
  },
  'statics-structural-equilibrium': {
    1: r(`${ES}/moment-of-force.html`, 'Engineering Statics Chapters 2 and 4 — force vectors, moments, couples and equivalent systems'),
    2: r(`${ES}/Chapter_05-free-body-diagrams.html`, 'Engineering Statics Chapters 3 and 5 — free-body diagrams, and particle and rigid-body equilibrium'),
    3: r(`${ES}/distributed-loads.html`, 'Engineering Statics Chapter 7 — centroids, composite parts and distributed loads'),
    4: r(`${ES}/method-of-joints.html`, 'Engineering Statics Sections 6.3–6.5 — trusses by the method of joints and of sections'),
    5: r(`${ES}/frames-and-machines.html`, 'Engineering Statics Section 6.6 and Chapter 8 — frames, machines, internal forces and shear–moment diagrams'),
    6: r(`${ES}/Chapter_09-dry-friction.html`, 'Engineering Statics Chapter 9 — dry friction, wedges, screws and belts'),
    7: r(`${ES}/Chapter_10-moment-of-inertia-of-composite-shapes.html`, 'Engineering Statics Chapter 10 — area and mass moments of inertia, composite shapes and the parallel-axis theorem'),
    8: r(`${ES}/Chapter_05-stability-and-determinacy.html`, 'Engineering Statics Section 5.6 — stability and determinacy: can the idealised structure stand, and be solved?'),
  },
  'materials-manufacturing-metrology': {
    1: r(`${DTP}/mechanical_testing_metals/index.php`, 'DoITPoMS: Mechanical Testing of Metals — tensile curves, hardness and toughness tests'),
    2: r(`${DTP}/jominy/index.php`, 'DoITPoMS: The Jominy End Quench Test — heat treatment, hardenability and microstructure'),
    3: r(`${OCW}/3-044-materials-processing-spring-2013/resources/mit3_044s13_lec09/`, '3.044 Lectures 8–9 and 20 — solidification in moulds, casting routes and powder processing (2.008 Lectures 9–10 and 20 for joining and forming)'),
    4: r(`${M2008}/mit2_008_s25_lec17_pdf/`, '2.008 Lectures 16–17 — planning a manufacturing route and estimating its cost'),
    5: r(`${M2008}/mit2_008_s25_lec05_pdf/`, '2.008 Lectures 5–7 — cutting mechanics, forces and power, and machining in practice'),
    6: r(`${M2008}/mit2_008_s25_lec23_pdf/`, '2.008 Lecture 23, with Lectures 2–4 — additive manufacturing, injection moulding and thermoforming'),
    7: r(`${M2008}/mit2_008_s25_lec11_pdf/`, '2.008 Lecture 11 — defining and measuring quality: tolerances, variation and metrology'),
    8: r(`${M2008}/mit2_008_s25_lec12_pdf/`, '2.008 Lecture 12 — statistical process control and capability, for the inspection plan'),
  },
  'rigid-body-dynamics-mechanical-vibrations': {
    1: r(`${D2003}/velocity-acceleration-and-rotational-motion/`, '2.003SC Lectures 3–4 — velocity and acceleration in rotating frames and polar coordinates'),
    2: r(`${D2003}/angular-momentum-and-torque/`, '2.003SC Lectures 5–6 — impulse, momentum, torque and angular momentum for systems of particles'),
    3: r(`${D2003}/newton2019s-laws-vectors-and-reference-frames/`, '2.003SC Lectures 1–2 and 7–8 — relative motion in moving frames, degrees of freedom and free-body diagrams'),
    4: r(`${D2003}/angular-momentum-and-rotating-masses/`, '2.003SC Lectures 9–10 — rotating imbalance and rigid-body equations of motion'),
    5: r(`${D2003}/finding-equations-of-motion-for-rigid-body-rotation/`, '2.003SC Lectures 11–15 — mass moments of inertia, rigid-body equations of motion and Lagrange\'s method'),
    6: r(`${D2003}/mechanical-vibration/`, '2.003SC Lectures 19–20 — free and forced single-degree-of-freedom vibration'),
    7: r(`${D2003}/reducing-problem-vibration-and-intro-to-multi-dof-vibration/`, '2.003SC Lectures 21–26 — vibration isolation, two-degree-of-freedom modes and mode superposition'),
    8: r(`${D2003}/final-exam/`, '2.003SC final exam with solutions — the cumulative check'),
  },
  'mechanics-materials-solid-structures': {
    1: r(`${S2001}/lec8/`, '2.001 Lecture 8 — uniaxial loading, material properties and safety factors'),
    2: r(`${S2001}/lec7/`, '2.001 Lectures 7 and 15 — static indeterminacy and stress–strain–temperature relations'),
    3: r(`${S2001}/lec22/`, '2.001 Lectures 24–25 — torsion of shafts'),
    4: r(`${S2001}/lec20/`, '2.001 Lectures 20–22 — pure bending, moment–curvature and beam deflection'),
    5: r(`${S2001}/lec5/`, '2.001 Lectures 5–6 and 26–27 — shear and moment diagrams, and energy methods'),
    6: r(`${S2001}/lec15/`, '2.001 Lectures 16–18 — stress transformation, principal stresses and failure criteria'),
    7: r(`${OCW}/16-001-unified-engineering-materials-and-structures-fall-2021/resources/mit16_001_f21_lec33lec34lec35_pdf/`, '16.001 lectures on buckling (2.001 stops before columns; fatigue and fracture: see the gaps)'),
    8: r(`${S2001}/lec25/`, '2.001 Lecture 27 — worked examples for sizing a component'),
  },
  'engineering-thermodynamics': {
    1: r(`${YAN}/03%3A_Ideal_and_Real_Gasses`, 'Yan, Introduction to Engineering Thermodynamics, Chapters 1–3 — systems, properties, phases and equations of state'),
    2: r(`${YAN}/04%3A_The_First_Law_of_Thermodynamics_for_Closed_Systems`, 'Yan Chapter 4 — work, heat and the first law for closed systems'),
    3: r(`${YAN}/05%3A_The_First_Law_of_Thermodynamics_for_a_Control_Volume`, 'Yan Chapter 5 — mass and energy balances for control volumes'),
    4: r(`${U16}/node22.html`, 'MIT Unified Thermodynamics notes Chapter 3 — the first law applied to engineering cycles'),
    5: r(`${U16}/node36.html`, 'MIT Unified Thermodynamics notes Chapters 5–6 — entropy, irreversibility and lost work'),
    6: r(`${U16}/node65.html`, 'MIT Unified Thermodynamics notes Sections 3.3–3.7 and 8.5–8.7 — Carnot, refrigeration, Otto, Diesel, Brayton and Rankine cycles'),
    7: r(`${U16}/node108.html`, 'MIT Unified Thermodynamics notes Chapter 15 — fuels, fuel–air ratio and combustion (psychrometrics: see the gaps)'),
    8: r(`${OCW}/res-2-008-thermodynamics-and-climate-change-summer-2020/pages/problem-sets/`, 'RES.2-008 problem sets with solutions — the catalogued resource\'s cumulative check'),
  },
  'fluid-mechanics': {
    1: r(`${F1060}/lecture3/`, '1.060 Lectures 1 and 3–4 — fluid properties, hydrostatics, manometry and forces on surfaces'),
    2: r(`${F1060}/lecture2/`, '1.060 Lectures 2 and 5–6 — describing flow, streamlines and conservation of mass'),
    3: r(`${F1060}/lecture10/`, '1.060 Lectures 7–13 — Bernoulli, and control-volume momentum and energy'),
    4: r(`${F1060}/lecture16/`, '1.060 Lecture 16 — pipe friction, the Moody diagram and minor losses'),
    5: r(`${F225}/dimensional-analysis/`, '2.25 — dimensional analysis and similarity'),
    6: r(`${F1060}/lecture17/`, '1.060 Lectures 14–15 and 17 — laminar flow, turbulence and pipe networks'),
    7: r(`${F225}/boundary-layers-separation-and-drag/`, '2.25 — boundary layers, separation and drag (1.060 Lectures 18–21 for pumps, turbines and lift)'),
    8: r(`${F1060}/lecture18/`, '1.060 Lecture 18 — matching a pump to its system: the design check'),
  },
  'electronics-sensors-data-acquisition': {
    1: r(`${C6002}/6002_l2/`, '6.002 Lectures 2–3 — KCL, KVL, Thévenin equivalents and loading'),
    2: r(`${C6002}/6002_l20/`, '6.002 Lectures 19–20 — the op-amp abstraction and signal-conditioning circuits'),
    3: r(`${C6002}/6002_l18/`, '6.002 Lectures 12 and 16–18 — first-order circuits, sinusoidal steady state and filters'),
    4: r('https://www.itl.nist.gov/div898/handbook/mpc/section3/mpc3.htm', 'NIST/SEMATECH e-Handbook §2.3 — calibration and its uncertainty'),
    5: r(`${LIEC}/DC/DC_9.html`, 'Lessons in Electric Circuits Vol. I Chapter 9 — sensors, bridges and instrumentation signals'),
    6: r(`${LIEC}/Digital/DIGI_13.html`, 'Lessons in Electric Circuits Vol. IV Chapter 13 — sampling, ADCs and quantisation'),
    7: r('https://www.ti.com/lit/an/slva043b/slva043b.pdf', 'Texas Instruments SLVA043B — noise analysis in op-amp circuits (grounding and protection: see the gaps)'),
    8: r(`${OCW}/6-002-circuits-and-electronics-spring-2007/pages/exams/`, '6.002 quizzes and final — the cumulative check (no solutions are posted)'),
  },
  'heat-mass-transfer': {
    1: r(AHTT(63), 'Lienhard and Lienhard, A Heat Transfer Textbook, Chapter 2 — conduction, thermal resistance and the overall heat-transfer coefficient'),
    2: r(AHTT(155), 'A Heat Transfer Textbook Chapter 4 and §5.7 — conduction analysis, fins and shape factors'),
    3: r(AHTT(207), 'A Heat Transfer Textbook Chapter 5 — transient conduction, with lumped capacity from §1.3'),
    4: r('https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.curve_fit.html', 'SciPy curve_fit — estimating h or k from a measured transient, with parameter uncertainty'),
    5: r(AHTT(365), 'A Heat Transfer Textbook Chapters 6–8 — boundary layers, forced-convection correlations and natural convection'),
    6: r(AHTT(557), 'A Heat Transfer Textbook Chapter 10 — radiative exchange, view factors and gray surfaces'),
    7: r(AHTT(113), 'A Heat Transfer Textbook Chapter 3 — heat-exchanger design (Chapter 11 for mass transfer)'),
    8: r(`${OCW}/10-302-transport-processes-fall-2004/pages/exams/`, '10.302 exams — the cumulative check (no solutions are posted)'),
  },
  'machine-elements-mechanical-design': {
    1: r(`${E272}/mit2_72s09_lec02/`, '2.72 Lectures 1–2 — design principles, load fundamentals and error budgets'),
    2: r(`${E272}/mit2_72s09_lec04/`, '2.72 Lecture 4 — fatigue fundamentals and modelling'),
    3: r(`${E272}/mit2_72s09_lec03/`, '2.72 Lecture 3 — shafts: deformation, stresses and integration (Lecture 16 for machine vibration)'),
    4: r(`${E272}/mit2_72s09_lec07/`, '2.72 Lectures 6–8 — constraint-based design and rolling, sliding and flexure bearings'),
    5: r(`${E272}/mit2_72s09_lec13/`, '2.72 Lectures 12–13 — belt and friction drives, and gear kinematics, mechanics and selection'),
    6: r(`${E272}/mit2_72s09_lec10/`, '2.72 Lectures 9–10 and 18 — interfaces, bolted joints, clutches and brakes'),
    7: r(`${EGD}/standard-fits/`, 'Engineering Graphics and Design — standard fits for mating parts (lubrication and sealing: see the gaps)'),
    8: r(`${OCW}/2-72-elements-of-mechanical-design-spring-2009/pages/projects/`, '2.72 lathe project — a complete machine designed, built and reviewed'),
  },
  'system-dynamics-feedback-control': {
    1: r(FBS(73), 'Åström and Murray, Feedback Systems Chapter 3 — lumped models, state space and linearisation'),
    2: r(FBS(299), 'Feedback Systems Chapter 9 — transfer functions, poles and zeros'),
    3: r(FBS(153), 'Feedback Systems Chapters 5–6 — stability and time-response specifications'),
    4: r(FBS(375), 'Feedback Systems Chapter 11 — PID control and tuning'),
    5: r(FBS(343), 'Feedback Systems Chapter 10 — loop transfer functions, Nyquist and stability margins (Chapter 13 for robustness)'),
    6: r(FBS(229), 'Feedback Systems Chapters 7–8 — reachability, state feedback, observability and observers'),
    7: r(FBS(393), 'Feedback Systems §§11.4–11.5 — integral windup and digital implementation'),
    8: r(FBS(435), 'Feedback Systems Chapter 13 — robust performance under uncertainty, for the release case'),
  },
  'engineering-probability-measurement-experimental-methods': {
    1: r(`${NIST}/eda/section3/eda36.htm`, 'NIST/SEMATECH e-Handbook §1.3.6 — probability distributions'),
    2: r(`${NIST}/prc/section1/prc1.htm`, 'NIST e-Handbook §7.1 — estimation, confidence intervals and hypothesis tests'),
    3: r(`${NIST}/mpc/section3/mpc3.htm`, 'NIST e-Handbook §2.3 — calibration, traceability and bias'),
    4: r(`${NIST}/mpc/section5/mpc5.htm`, 'NIST e-Handbook §2.5 — uncertainty analysis and budgets'),
    5: r(`${NIST}/pmd/section4/pmd4.htm`, 'NIST e-Handbook §4.4 — fitting, residual analysis and model validation'),
    6: r(`${NIST}/pri/section3/pri33.htm`, 'NIST e-Handbook §5.3.3 — choosing a design: full and fractional factorials'),
    7: r(`${NIST}/pmc/section4/pmc4.htm`, 'NIST e-Handbook §6.4 — time series: smoothing, filtering and autocorrelation'),
    8: r(`${J1314}/written-and-oral-report-resources/`, 'MIT Junior Lab report resources — writing and defending an experimental paper'),
  },
  'advanced-manufacturing-product-realization': {
    1: r(`${EGD}/intro-to-geometric-dimensioning-tolerancing/`, 'Engineering Graphics and Design — datums, feature control frames and GD&T tolerance chains'),
    2: r(`${M2008}/mit2_008_s25_lec07_pdf/`, '2.008 Lectures 5–7 — cutting mechanics, CNC practice and fixturing'),
    3: r(`${M2008}/mit2_008_s25_lec20_pdf/`, '2.008 Lectures 20, 2–4 and 23 — forming, moulding, thermoforming and additive processes'),
    4: r(`${NIST}/pmc/section1/pmc16.htm`, 'NIST e-Handbook §6.1.6 — process capability studies'),
    5: r(`${M2008}/mit2_008_s25_lec09_pdf/`, '2.008 Lectures 8–10 — assembly, disassembly and joining'),
    6: r(`${M2008}/mit2_008_s25_lec12_pdf/`, '2.008 Lecture 12 — statistical process control and quality planning'),
    7: r(`${M2008}/mit2_008_s25_lec15_pdf/`, '2.008 Lectures 15–17 — supply chains, planning and manufacturing cost (sustainability: see the gaps)'),
    8: r(`${M2008}/mit2_008_s25_lec18_pdf/`, '2.008 Lecture 18 — lean production: flow, waste and readiness for release'),
  },
  'computational-mechanics-fea-cfd': {
    1: r(`${F2092}/mit2_092f09_lec03/`, '2.092 Lectures 2–3 — the analysis process for solids and fluids: governing equations, boundary conditions and discretisation'),
    2: r(`${F2092}/mit2_092f09_lec04/`, '2.092 Lectures 4–5 — virtual work, weak forms and the finite-element formulation'),
    3: r(`${F2092}/mit2_092f09_lec06/`, '2.092 Lectures 6–7 and 13 — element assembly, constraints and solving by Gauss elimination'),
    4: r(`${F2094}/mit2_094s11_lec8/`, '2.094 Lectures 6 and 8 — convergence of displacement-based finite elements'),
    5: r(`${N229}/mit2_29s15_lecture14/`, '2.29 Lecture 14 — finite-volume conservation and transport'),
    6: r(`${N229}/mit2_29s15_lecture17/`, '2.29 Lectures 11–12 and 17–18 — stability and the CFL condition, and pressure–velocity coupling (Lectures 23–25 for turbulence)'),
    7: r('https://www.grc.nasa.gov/www/wind/valid/tutorial/spatconv.html', 'NASA NPARC Alliance — examining grid convergence: Richardson extrapolation and the GCI'),
    8: r(`${F2094}/mit2_094s11_lec17/`, '2.094 Lectures 16–17 — finite elements for incompressible flow with heat transfer: coupled problems'),
  },
  'mechatronics-embedded-control': {
    1: r(`${VAL}/C7_DesignDevelopment.htm`, 'Valvano, Embedded Systems, Chapter 7 — design and development: requirements and interfaces (power budgets: see the gaps)'),
    2: r(`${E272}/mit2_72s09_lec14/`, '2.72 Lecture 14 — actuators: DC motors, piezos and hydraulics, matched to their loads'),
    3: r(`${VAL}/C12_Interrupts.htm`, 'Valvano Chapter 12 — timers and periodic interrupts'),
    4: r(`${M2737}/mit2_737f14_lab1/`, '2.737 Lab 1 — closing a real-time control loop'),
    5: r(FBS(393), 'Feedback Systems §11.5 — implementation: sampling, computational delay and jitter'),
    6: r(`${VAL}/C10_FiniteStateMachines.htm`, 'Valvano Chapter 10 — finite-state machines (Chapter 11 for serial communication)'),
    7: r(`${VAL}/C9_ArrayFunctionalDebugging.htm`, 'Valvano Chapter 9 — functional debugging (watchdogs and safe states: see the gaps)'),
    8: r(`${M2737}/mit2_737f14_lab5/`, '2.737 Lab 5 — brushless motor control: an integrated mechatronic system'),
  },
  'integrated-mechanical-systems-laboratory': {
    1: r(`${L2672}/labmanual/`, '2.672 laboratory manual — safety, procedures, configuration and reporting'),
    2: r(`${DTP}/beam_bending/index.php`, 'DoITPoMS: Bending and Torsion of Beams — the load–strain–deflection experiment and its theory'),
    3: r(`${L2672}/heat_excha/`, '2.672 Experiment 3 — heat-exchanger tube vibrations: modes and frequency response'),
    4: r(`${L2672}/prx_heat/`, '2.672 Experiment 1 — proximity heating of a silicon wafer: identifying thermal parameters'),
    5: r(`${M2737}/mit2_737f14_lab2/`, '2.737 Lab 2 — analogue feedback systems on the bench'),
    6: r(`${L2672}/trans_line/`, '2.672 Experiment 2 — transfer-line dynamics: synchronised pressure measurements'),
    7: r(`${L2672}/irri_sys/`, '2.672 Experiment 7 — irrigation pressure surge: tracing an anomaly to its cause'),
    8: r(`${OCW}/2-672-project-laboratory-spring-2009/pages/reports/`, '2.672 report guidelines and examples — presenting a verification campaign'),
  },
  'capstone-design-1-needs-requirements-architecture-prototype': {
    1: r(`${PDD}/cls4_cstmr_ned/`, '15.783J Session 4 — identifying customer needs (NASA SE Handbook §4.1 for stakeholders)'),
    2: r(NASA(54), 'NASA Systems Engineering Handbook §4.2 — technical requirements, interfaces and traceability'),
    3: r(`${PDD}/clas7_cncpt_genr/`, '15.783J Sessions 7 and 9 — specifications, concept generation and selection'),
    4: r(NASA(65), 'NASA SE Handbook §4.4 — design solution definition, as a preliminary design review examines it'),
    5: r(`${SAF}/mit16_63js16_lecnotes8/`, '16.63J Lectures 8–9 — hazard analysis, misuse and safety constraints'),
    6: r(NASA(143), 'NASA SE Handbook §6.5 — configuration management (§6.1 for technical planning)'),
    7: r(`${PDD}/cls8_prototyping/`, '15.783J Session 8 — prototyping to retire risk'),
    8: r(NASA(155), 'NASA SE Handbook §6.7 — technical reviews, for the critical design review'),
  },
  'robot-mechanics-kinematics-motion-planning': {
    1: r(MR(77), 'Lynch and Park, Modern Robotics Chapter 3 — rigid-body motions: rotations, transforms and twists (configuration space: Chapter 2)'),
    2: r(MR(155), 'Modern Robotics Chapter 4 — forward kinematics and the workspace'),
    3: r(MR(189), 'Modern Robotics Chapter 5 — velocity kinematics, Jacobians, singularities and statics'),
    4: r(MR(237), 'Modern Robotics Chapter 6 — inverse kinematics'),
    5: r(MR(289), 'Modern Robotics Chapter 8 — dynamics of open chains, and actuator limits'),
    6: r(MR(343), 'Modern Robotics Chapter 9 — trajectory generation (Chapter 11 for tracking)'),
    7: r(MR(371), 'Modern Robotics Chapter 10 — configuration space, collision checking and motion planning'),
    8: r(MR(479), 'Modern Robotics Chapter 12 — grasping and manipulation, for the mission'),
  },
  'aerodynamics-compressible-flow': {
    1: r(`${A16100}/1liftdrag/`, '16.100 notes — lift and drag from integral momentum, coefficients and similarity'),
    2: r(`${A16100}/16100lectre13_cg/`, '16.100 Lectures 12–14 — Bernoulli, the Kutta condition and circulation'),
    3: r(`${A16100}/16100lectre17_cg/`, '16.100 Lectures 15–19 — thin airfoils, Prandtl\'s lifting line and induced drag'),
    4: r(`${A16100}/8cdnaca/`, '16.100 notes — NACA airfoil data, for checking models against measurements'),
    5: r(`${A16100}/16100lectre22_cg/`, '16.100 Lectures 21–25 — boundary layers, integral methods and separation'),
    6: r(`${NGRC}/isentrop.html`, 'NASA Glenn Beginner\'s Guide — isentropic flow and stagnation properties (16.100 Lectures 5–7 for the compressible equations)'),
    7: r(`${NGRC}/normal.html`, 'NASA Glenn Beginner\'s Guide — normal and oblique shocks, and Prandtl–Meyer expansions'),
    8: r(`${A16100}/examtakehome2/`, '16.100 take-home exam — the cumulative check (no solutions posted)'),
  },
  'advanced-energy-conversion-turbomachinery-combustion-fuel-cells': {
    1: r(`${E260}/mit2_60s20_lec2/`, '2.60J Lectures 1–2 — energy challenges, and thermodynamic tools for conversion efficiency'),
    2: r(`${E260}/mit2_60s20_lec15/`, '2.60J Lectures 15–16 — thermo-mechanical conversion (MIT Unified notes Chapter 12 for the Euler turbine equation)'),
    3: r(`${E260}/mit2_60s20_lec5/`, '2.60J Lectures 5–7 — chemical thermodynamics of combustion'),
    4: r(`${E260}/mit2_60s20_lec21/`, '2.60J Lecture 21 — energy-system modelling and examples'),
    5: r(`${E260}/mit2_60s20_lec9/`, '2.60J Lectures 8–10 — electrochemistry, fuel cells and electrolysis'),
    6: r(`${E260}/mit2_60s20_lec11/`, '2.60J Lecture 11 — batteries and energy storage'),
    7: r(`${E260}/mit2_60s20_lec22/`, '2.60J Lectures 12, 17, 18 and 22 — solar, geothermal and wind'),
    8: r(`${E260}/mit2_60s20_lec25/`, '2.60J Lecture 25 — energy storage, for the portfolio'),
  },
};
