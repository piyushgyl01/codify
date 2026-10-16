/** Mathematics: the part of each course's free resource that covers each unit (audited October 2026). */
const r = (url, where) => ({ url, where });

const O1801 = 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2005/resources';
const BOP = 'https://richardhammack.github.io/BookOfProof/Main.pdf';
// Hefferon's printed page numbers run 10 behind the PDF's.
const HEF = p => `https://jheffero.w3.uvm.edu/linearalgebra/book.pdf#page=${p + 10}`;
const DMOI = 'https://discrete.openmathbooks.org/dmoi4';
const CT = 'https://computationalthinking.mit.edu/Fall22';
const O1802 = 'https://ocw.mit.edu/courses/18-02-multivariable-calculus-fall-2007/resources';
const LADW = p => `https://www.math.brown.edu/~treil/papers/LADW/LADW_2026_08-31.pdf#page=${p}`;
const LADR = p => `https://linear.axler.net/LADR4e.pdf#page=${p}`;
const O1803 = 'https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/resources';
const O18440 = 'https://ocw.mit.edu/courses/18-440-probability-and-random-variables-spring-2014/resources';
const AC = 'https://appliedcombinatorics.org/book';
const O100 = 'https://ocw.mit.edu/courses/18-100a-real-analysis-fall-2020/resources';
const AATA = 'https://judsonbooks.org/aata-files/aata-html';
const O04 = 'https://ocw.mit.edu/courses/18-04-complex-variables-with-applications-spring-2018/resources';
const O330 = 'https://ocw.mit.edu/courses/18-330-introduction-to-numerical-analysis-spring-2012/resources';
const O335 = 'https://ocw.mit.edu/courses/18-335j-introduction-to-numerical-methods-spring-2019/pages';
// The SIAM M3 handbook's PDF pages run 3 ahead of its printed numbers.
const M3 = p => `https://m3challenge.siam.org/sites/default/files/uploads/siam-guidebook-final-press.pdf#page=${p + 3}`;
const MIRA = p => `https://measure.axler.net/MIRA.pdf#page=${p}`;
// Goodman's PDF pages run 12 ahead of the printed numbers.
const GOOD = p => `https://homepage.math.uiowa.edu/~goodman/algebrabook.dir/book.2.6.pdf#page=${p + 12}`;
const TOPN = p => `https://pi.math.cornell.edu/~hatcher/Top/TopNotes.pdf#page=${p}`;
// Hatcher's Algebraic Topology: PDF pages run 9 ahead of the printed numbers.
const AT = p => `https://pi.math.cornell.edu/~hatcher/AT/AT.pdf#page=${p + 9}`;
const BOYD = p => `https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf#page=${p}`;
const PC = 'https://www.probabilitycourse.com';

export const MATH_READINGS = {
  'calculus-1': {
    1: r(`${O1801}/lecture_2/`, '18.01 Lectures 1–2 — velocity and rates of change; slope, the derivative, limits and continuity'),
    2: r(`${O1801}/lecture_3/`, '18.01 Lectures 3–6 and 8 — product, quotient and chain rules; exponential, logarithm and trigonometric derivatives; linear and quadratic approximation'),
    3: r(`${O1801}/lecture_10/`, '18.01 Lectures 8–12 — the mean value theorem, curve sketching, max–min problems, Newton\'s method'),
    4: r(`${O1801}/lecture_17/`, '18.01 Lectures 11, 13 and 17 — related rates, differentials, separable differential equations as rate models'),
    5: r(`${O1801}/lecture_15/`, '18.01 Lectures 14–16 and 18 — definite integrals, the fundamental theorem, numerical integration'),
    6: r(`${O1801}/lecture_27/`, '18.01 Lectures 24–27 and 29 — inverse substitution, partial fractions, integration by parts, improper integrals'),
    7: r(`${O1801}/lecture_31/`, '18.01 Lectures 28 and 30–31 — L\'Hospital\'s rule, infinite series, power series and Taylor approximation'),
    8: r(`${O1801}/ocw01f05finalpra/`, '18.01 practice final, with its solutions in the practice-solutions PDF — sessions 32–33, final review'),
  },
  'introduction-to-proofs-and-logic': {
    1: r(`${BOP}#page=46`, 'Book of Proof Chapter 2 — Logic: statements, quantifiers, logical equivalence, inference'),
    2: r(`${BOP}#page=15`, 'Book of Proof Chapters 1, 11 and 12 — Sets; Relations and equivalence classes; Functions'),
    3: r(`${BOP}#page=125`, 'Book of Proof Chapter 4 — Direct Proof, including proof by cases'),
    4: r(`${BOP}#page=184`, 'Book of Proof Chapter 9 — Disproof: counterexamples to universal and existence claims'),
    5: r(`${BOP}#page=140`, 'Book of Proof Chapters 5–7 — Contrapositive, Contradiction, and If-and-only-if and existence proofs'),
    6: r(`${BOP}#page=192`, 'Book of Proof Chapter 10 — Induction, strong induction, smallest counterexample'),
    7: r(`${BOP}#page=281`, 'Book of Proof Chapter 14 — Cardinality: countable and uncountable sets, Cantor–Bernstein–Schröder'),
    8: r(`${BOP}#page=304`, 'Book of Proof Solutions to the odd-numbered exercises (p. 304), and Chapter 8, Proofs Involving Sets'),
  },
  'linear-algebra-1': {
    1: r(HEF(1), 'Hefferon Chapter One — Gauss\'s method, linear geometry, reduced echelon form'),
    2: r(HEF(84), 'Hefferon Chapter Two — vector spaces and subspaces, span, linear independence, basis and dimension'),
    3: r(HEF(173), 'Hefferon Chapter Three §I–III and §V — isomorphisms, homomorphisms, the matrix of a map, change of basis'),
    4: r(HEF(295), 'Hefferon Chapter Three Topic: Line of Best Fit — least squares, with §VI on projection'),
    5: r(HEF(326), 'Hefferon Chapter Four — determinants, their properties and geometry; Chapter Three §IV for inverses and rank'),
    6: r(HEF(402), 'Hefferon Chapter Five §II — similarity, diagonalizability, eigenvalues and eigenvectors'),
    7: r(HEF(275), 'Hefferon Chapter Three §VI — orthogonal projection into a line and a subspace, Gram–Schmidt'),
    8: r('https://jheffero.w3.uvm.edu/linearalgebra/jhanswer.pdf', 'Hefferon\'s book of answers to every exercise — check your cumulative work against it'),
  },
  'discrete-mathematics': {
    1: r(`${DMOI}/sec_logic-implications.html`, 'Levin §Implications, with Sets and Functions in the Structures chapter'),
    2: r(`${DMOI}/sec_seq-induction.html`, 'Levin §Proof by Induction and §Strong Induction'),
    3: r(`${DMOI}/sec_seq-growth.html`, 'Levin §Rate of Growth, with §Polynomial Sequences and §Exponential Sequences for sums and recurrences'),
    4: r(`${DMOI}/sec_gt-paths.html`, 'Levin §Euler Trails and Circuits — an algorithm and the invariant that proves it'),
    5: r(`${DMOI}/sec_counting-combperm.html`, 'Levin §Combinations and Permutations, with §Non-Disjoint Outcomes for inclusion–exclusion'),
    6: r(`${DMOI}/sec_gt-intro.html`, 'Levin §Problems and Definitions in graph theory, with §Trees'),
    7: r(`${DMOI}/sec_addtops-numbth.html`, 'Levin §Introduction to Number Theory, with §Applications to Probability'),
    8: r(`${DMOI}/backmatter-3.html`, 'Levin Selected Solutions — check the cumulative set against them'),
  },
  'mathematical-programming': {
    1: r(`${CT}/week0/basic_syntax/`, 'MIT 18.S191 Basic syntax — expressions, functions, types and control flow (Julia)'),
    2: r(`${CT}/images_abstractions/images/`, 'MIT 18.S191 Images as Data and Arrays, with the Abstraction lecture'),
    3: r(`${CT}/data_science/discrete_and_continuous/`, 'MIT 18.S191 Discrete and Continuous, with The Newton Method for numerical error'),
    4: r(`${CT}/data_science/random_walks/`, 'MIT 18.S191 Random Walks — a reproducible simulation study'),
    5: r(`${CT}/images_abstractions/transformations_and_autodiff/`, 'MIT 18.S191 Automatic Differentiation — exact derivatives by computation'),
    6: r(`${CT}/week0/plots_tutorial/`, 'MIT 18.S191 Plotting tutorial'),
    7: r(`${CT}/climate_science/how_to_collaborate_on_software/`, 'MIT 18.S191 GitHub & Open Source Software'),
    8: r(`${CT}/homework/hw1/`, 'MIT 18.S191 homework notebooks — each has built-in checks that say when an answer is right'),
  },
  'multivariable-calculus': {
    1: r(`${O1802}/lec_week1/`, '18.02 Lectures 0–6 (week 1–3 summaries) — vectors, dot and cross products, matrices, planes, parametric curves, velocity'),
    2: r(`${O1802}/lec_week4/`, '18.02 Lectures 8 and 12 (weeks 4–5) — level curves, partial derivatives, the gradient and the tangent plane'),
    3: r(`${O1802}/lec_week5/`, '18.02 Lectures 10–11 (weeks 4–5) — the second-derivative test, differentials and the chain rule'),
    4: r(`${O1802}/lec_week6/`, '18.02 Lectures 9 and 13–14 (weeks 4–6) — max–min and least squares, Lagrange multipliers, non-independent variables'),
    5: r(`${O1802}/lec_week7/`, '18.02 Lectures 16–18 and 25–26 — double integrals, polar coordinates, change of variables, triple integrals'),
    6: r(`${O1802}/lec_week8/`, '18.02 Lectures 19–21 and 27 — vector fields, line integrals, conservative fields, flux through surfaces'),
    7: r(`${O1802}/lec_week9/`, '18.02 Lectures 22–24 and 28–32 — Green\'s theorem, the divergence theorem, Stokes\' theorem'),
    8: r('https://ocw.mit.edu/courses/18-02-multivariable-calculus-fall-2007/pages/exams/', '18.02 practice exams 1–4 (A and B versions) with solutions — the cumulative check'),
  },
  'linear-algebra-2': {
    1: r(LADR(110), 'Axler, Linear Algebra Done Right (4th ed.) §3E — products and quotients of vector spaces (Treil leaves quotients out)'),
    2: r(LADW(11), 'Treil Chapter 1 — linear maps, invertibility and isomorphisms'),
    3: r(LADW(225), 'Treil Chapter 8 — dual spaces, annihilators and the transpose (dual) map'),
    4: r(LADW(109), 'Treil Chapter 4 — eigenvalues, diagonalisation and similarity'),
    5: r(LADW(261), 'Treil Chapter 9 — Cayley–Hamilton, the minimal polynomial and the Jordan canonical form'),
    6: r(LADW(127), 'Treil Chapter 5 — inner product spaces, orthogonal projection, adjoints'),
    7: r(LADW(171), 'Treil Chapters 6–7 — the spectral theorem for normal and self-adjoint operators; bilinear and quadratic forms'),
    8: r('https://leanprover-community.github.io/mathematics_in_lean/C10_Linear_Algebra.html', 'Mathematics in Lean Chapter 10 — state and check the course\'s theorems in Lean'),
  },
  'differential-equations': {
    1: r(`${O1803}/mit18_03s10_c01/`, '18.03 Lectures 1–4 — direction fields, existence and uniqueness, first-order linear equations, integrating factors'),
    2: r(`${O1803}/mit18_03s10_c11/`, '18.03 Lectures 11–16 — the characteristic polynomial, damping, the exponential response formula, resonance'),
    3: r(`${O1803}/mit18_03s10_c26/`, '18.03 Lectures 23–30 — step and delta functions, convolution, the Laplace transform, the pole diagram'),
    4: r(`${O1803}/mit18_03s10_c03/`, '18.03 Lectures 3 and 17–18 — linear models (bank account, RC circuit, mixing) and engineering applications'),
    5: r(`${O1803}/mit18_03s10_c33/`, '18.03 Lectures 32–36 — linear systems, eigenvalues, complex and repeated eigenvalues, the matrix exponential'),
    6: r(`${O1803}/mit18_03s10_c37/`, '18.03 Lectures 8 and 37–39 — the phase line, nonlinear systems, linearisation, limit cycles and chaos'),
    7: r(`${O1803}/mit18_03s10_c02/`, '18.03 Lecture 2 — numerical methods: Euler\'s method and its error'),
    8: r(`${O1803}/mit18_03s10_prfinal/`, '18.03 practice final (solutions in the next file) and the final exam'),
  },
  'probability-1': {
    1: r(`${O18440}/mit18_440s14_lecture1/`, '18.440 Lectures 1–5 — counting, sample spaces, the axioms, equal likelihood'),
    2: r(`${O18440}/mit18_440s14_lecture6/`, '18.440 Lectures 6–7 — conditional probability, Bayes\' formula, independence'),
    3: r(`${O18440}/mit18_440s14_lecture8/`, '18.440 Lectures 8–14 — discrete random variables, expectation, variance, binomial and Poisson'),
    4: r(`${O18440}/mit18_440s14_lecture13/`, '18.440 Lectures 11–14 — binomial and Poisson models and Poisson processes: simulate and calibrate them'),
    5: r(`${O18440}/mit18_440s14_lecture15/`, '18.440 Lectures 15 and 18–21 — continuous variables: uniform, normal, exponential, transformations'),
    6: r(`${O18440}/mit18_440s14_lecture22/`, '18.440 Lectures 22–27 — joint distributions, sums, covariance, conditional expectation, moment generating functions'),
    7: r(`${O18440}/mit18_440s14_lecture31/`, '18.440 Lectures 30–32 — the weak law, the central limit theorem, the strong law'),
    8: r(`${O18440}/mit18_440s14_final_2014/`, '18.440 final exam 2014 (solutions in the next file) — the cumulative check'),
  },
  'combinatorics-and-graph-theory': {
    1: r(`${AC}/s_strings_comb-proof.html`, 'Applied Combinatorics §2.4 Combinatorial Proofs, with Chapter 7 on inclusion–exclusion'),
    2: r(`${AC}/s_recurrence_genfunction.html`, 'Applied Combinatorics Chapters 8–9 — generating functions, and solving recurrences with them'),
    3: r(`${AC}/s_graphs_intro.html`, 'Applied Combinatorics §5.1–5.3 — graph terminology, connectivity, Eulerian and Hamiltonian graphs'),
    4: r(`${AC}/s_graphs_color.html`, 'Applied Combinatorics §5.4 Graph Coloring — bounds to compute and certify'),
    5: r(`${AC}/s_flowapplications_bip-match.html`, 'Applied Combinatorics Chapters 13–14 — network flows and bipartite matching'),
    6: r(`${AC}/s_graphs_planar.html`, 'Applied Combinatorics §5.5 Planar Graphs and Euler\'s formula'),
    7: r(`${AC}/s_ramsey_probability.html`, 'Applied Combinatorics Chapter 11 — Ramsey theory and the probabilistic method'),
    8: r('https://kskedlaya.org/putnam-archive/', 'Putnam problems in combinatorics and graph theory, with Kedlaya\'s solutions — the cumulative check'),
  },
  'real-analysis-1': {
    1: r(`${O100}/mit18_100af20_lec4/`, '18.100A Lectures 1–6 — sets and cardinality, the least-upper-bound property, the Archimedean property, the uncountability of ℝ'),
    2: r(`${O100}/mit18_100af20_lec9/`, '18.100A Lectures 7–10 — convergent sequences, the squeeze theorem, limsup and liminf, Bolzano–Weierstrass, Cauchy sequences'),
    3: r(`${O100}/mit18_100af20_lec13/`, '18.100A Lectures 13–17 — limits of functions, continuity, the extreme and intermediate value theorems, uniform continuity'),
    4: r(`${O100}/mit18_100af20_lec10/`, '18.100A Lectures 10–12 — completeness and the series tests: audit each test\'s hypotheses against counterexamples'),
    5: r(`${O100}/mit18_100af20_lec19/`, '18.100A Lectures 17–20 — the derivative, Rolle\'s theorem, the mean value theorem, Taylor\'s theorem'),
    6: r(`${O100}/mit18_100af20_lec21/`, '18.100A Lectures 20–22 — Riemann sums, the Riemann integral, the fundamental theorem of calculus'),
    7: r(`${O100}/mit18_100af20_lec23/`, '18.100A Lectures 23–25 — pointwise and uniform convergence, the M-test, power series, Weierstrass approximation'),
    8: r(`${O100}/mit18_100af20_basic_analysis/`, 'Lebl, Basic Analysis I — the course text, for the cumulative portfolio'),
  },
  'abstract-algebra-1': {
    1: r(`${AATA}/groups.html`, 'Judson Chapters 3–4 — groups, subgroups and cyclic groups'),
    2: r(`${AATA}/homomorph.html`, 'Judson Chapters 10–11 — normal subgroups, factor groups, homomorphisms and the isomorphism theorems'),
    3: r(`${AATA}/permute.html`, 'Judson Chapter 5 Permutation Groups, with Chapter 14 Group Actions'),
    4: r(`${AATA}/struct.html`, 'Judson Chapter 13 — the structure of finite abelian groups; classify small groups with Sage as the chapter does'),
    5: r(`${AATA}/sylow.html`, 'Judson Chapter 15 — the Sylow theorems, after the class equation in Chapter 14'),
    6: r(`${AATA}/rings.html`, 'Judson Chapter 16 — rings, ideals, quotient rings'),
    7: r(`${AATA}/poly.html`, 'Judson Chapters 17–18 — polynomial rings, irreducibility, unique factorisation'),
    8: r('https://leanprover-community.github.io/mathematics_in_lean/C09_Groups_and_Rings.html', 'Mathematics in Lean Chapter 9 — groups and rings, with proofs Lean checks'),
  },
  'complex-analysis': {
    1: r(`${O04}/mit18_04s18_topic1/`, '18.04 Topic 1 — complex algebra and the complex plane'),
    2: r(`${O04}/mit18_04s18_topic2/`, '18.04 Topics 2 and 5 — analytic functions, the Cauchy–Riemann equations, harmonic functions'),
    3: r(`${O04}/mit18_04s18_topic3/`, '18.04 Topic 3 — line integrals and Cauchy\'s theorem'),
    4: r(`${O04}/mit18_04s18_topic9/`, '18.04 Topics 6 and 9 — complex potentials; definite integrals by the residue theorem'),
    5: r(`${O04}/mit18_04s18_topic4/`, '18.04 Topics 4 and 7 — the Cauchy integral formula; Taylor and Laurent series'),
    6: r(`${O04}/mit18_04s18_topic8/`, '18.04 Topics 8 and 11 — the residue theorem and the argument principle'),
    7: r(`${O04}/mit18_04s18_topic10/`, '18.04 Topics 10 and 13 — conformal transformations; analytic continuation and the Gamma function'),
    8: r(`${O04}/mit18_04s18_practice-final/`, '18.04 practice final, with its worked answers in the next file'),
  },
  'numerical-analysis': {
    1: r(`${O335}/week-1/`, '18.335J Lectures 2–3 — floating-point arithmetic, summation and backward stability (18.330 does not cover them)'),
    2: r(`${O335}/week-5/`, '18.335J Lectures 4–5 and 13–14 — norms and condition numbers; LU with partial pivoting and Cholesky'),
    3: r(`${O330}/mit18_330s12_chapter4/`, '18.330 Chapter 4 — nonlinear equations: bisection, Newton, fixed-point iteration and their convergence'),
    4: r(`${O330}/mit18_330s12_chapter5/`, '18.330 Chapter 5 — methods for ODEs, compared against known solutions'),
    5: r(`${O330}/mit18_330s12_chapter3/`, '18.330 Chapter 3 — interpolation'),
    6: r(`${O330}/mit18_330s12_chapter2/`, '18.330 Chapter 2 — integrals as sums and derivatives as differences, with Chapter 7 on spectral quadrature'),
    7: r(`${O335}/week-6/`, '18.335J Lectures 15–17 — eigensolvers: Hessenberg form, the power method, the shifted QR algorithm'),
    8: r('https://ocw.mit.edu/courses/18-330-introduction-to-numerical-analysis-spring-2012/pages/assignments/', '18.330 homework sets — the cumulative practice'),
  },
  'mathematical-modeling': {
    1: r(M3(10), 'SIAM M3 handbook, Chapters 2–3 — defining the problem and making assumptions'),
    2: r('https://jheffero.w3.uvm.edu/linearalgebra/book.pdf#page=175', 'Hefferon, Topic: Dimensional Analysis — Buckingham\'s π theorem; with M3 Chapter 4 on defining variables'),
    3: r(M3(25), 'SIAM M3 handbook, Chapter 5 — building solutions: deterministic, stochastic and discrete choices'),
    4: r(M3(48), 'SIAM M3 handbook, sample solution paper — a complete calibrated model to imitate and then try to break'),
    5: r('https://www.probabilitycourse.com/chapter8/8_2_0_point_estimation.php', 'Pishro-Nik, §8.2 Point Estimation — estimators, bias and maximum likelihood for model parameters'),
    6: r('https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm', 'NIST/SEMATECH e-Handbook §4.4.4 — how to tell if a model fits: residuals, not just R²'),
    7: r(M3(32), 'SIAM M3 handbook, Chapters 6–7 — analysis, model assessment, and putting it all together'),
    8: r(M3(40), 'SIAM M3 handbook, Chapter 7 and appendices — assembling and defending the full report'),
  },
  'real-analysis-2-measure-and-integration': {
    1: r(MIRA(29), 'Axler, Measure, Integration & Real Analysis §2A–2D — outer measure, σ-algebras, measures, Lebesgue measure'),
    2: r(MIRA(40), 'Axler MIRA §2B and §2E — measurable functions; convergence of measurable functions (Egorov, Luzin)'),
    3: r(MIRA(89), 'Axler MIRA §3A, with Chapter 1 — the integral with respect to a measure, against the Riemann integral'),
    4: r(MIRA(77), 'Axler MIRA §2E and the examples in §3B — where limits and integrals fail to commute'),
    5: r(MIRA(103), 'Axler MIRA §3B — the monotone and dominated convergence theorems, Fatou\'s lemma'),
    6: r(MIRA(209), 'Axler MIRA Chapter 7 — Lᵖ spaces, Hölder and Minkowski, completeness'),
    7: r(MIRA(132), 'Axler MIRA §5A–5B — product measures, Tonelli and Fubini; §9B for the Radon–Nikodym theorem'),
    8: r('https://leanprover-community.github.io/mathematics_in_lean/C13_Integration_and_Measure_Theory.html', 'Mathematics in Lean Chapter 13 — integration and measure theory, checked by Lean'),
  },
  'abstract-algebra-2': {
    1: r(GOOD(350), 'Goodman §8.1–8.2 — modules, homomorphisms and quotient modules'),
    2: r(GOOD(374), 'Goodman §8.4–8.5 — finitely generated modules over a PID'),
    3: r(GOOD(300), 'Goodman §6.5 and §6.7 — Euclidean domains, PIDs and UFDs; Noetherian rings'),
    4: r('https://judsonbooks.org/aata-files/aata-html/finite.html', 'Judson Chapter 22 — finite fields: construction, structure, computation (Goodman has no chapter on them)'),
    5: r(GOOD(426), 'Goodman §9.1 — finite and algebraic extensions'),
    6: r(GOOD(428), 'Goodman §9.2–9.4 — splitting fields, separability and automorphisms'),
    7: r(GOOD(441), 'Goodman §9.5 and §10.6 — the Galois correspondence; solvability by radicals'),
    8: r('https://judsonbooks.org/aata-files/aata-html/galois.html', 'Judson Chapter 23 — Galois theory, a second treatment to test the portfolio against'),
  },
  'topology': {
    1: r(TOPN(2), 'Hatcher, Notes on Introductory Point-Set Topology, Chapter 1 — topological spaces, bases, subspaces (18.901\'s text, Munkres, is not free)'),
    2: r(TOPN(12), 'Hatcher\'s point-set notes — continuity and homeomorphisms, product spaces'),
    3: r(TOPN(41), 'Hatcher\'s point-set notes Chapter 4 — quotient spaces'),
    4: r(AT(1), 'Hatcher, Algebraic Topology, Chapter 0 — the standard spaces and constructions, for an atlas of examples'),
    5: r(TOPN(28), 'Hatcher\'s point-set notes Chapter 3 — compactness, with 18.901 Notes C'),
    6: r(TOPN(17), 'Hatcher\'s point-set notes Chapter 2 — connectedness and path-connectedness'),
    7: r(AT(21), 'Hatcher, Algebraic Topology, Chapter 1 — homotopy, the fundamental group, the circle (18.901 does not cover it)'),
    8: r('https://leanprover-community.github.io/mathematics_in_lean/C11_Topology.html', 'Mathematics in Lean Chapter 11 — topology, checked by Lean'),
  },
  'optimization': {
    1: r(BOYD(160), 'Boyd & Vandenberghe §4.3, in Chapter 4 — formulations and linear programs'),
    2: r(BOYD(35), 'Boyd & Vandenberghe Chapters 2–3 — convex sets and convex functions'),
    3: r(BOYD(229), 'Boyd & Vandenberghe Chapter 5 — Lagrange duality and certificates, with §2.5 on separating hyperplanes'),
    4: r(BOYD(263), 'Boyd & Vandenberghe §5.6 — perturbation and sensitivity analysis'),
    5: r(BOYD(255), 'Boyd & Vandenberghe §5.5 — optimality conditions (KKT)'),
    6: r(BOYD(471), 'Boyd & Vandenberghe Chapter 9 — gradient and Newton methods; Parikh & Boyd, Proximal Algorithms, for proximal methods'),
    7: r('https://web.mit.edu/15.053/www/AMP-Chapter-09.pdf', 'Bradley, Hax & Magnanti, Applied Mathematical Programming, Chapter 9 — integer programming; Boyd §6.4 for robustness'),
    8: r('https://www.cvxpy.org/examples/index.html', 'CVXPY worked examples — solve, then read off and check the dual certificate'),
  },
  'stochastic-processes-and-statistical-inference': {
    1: r(`${PC}/chapter11/11_2_1_introduction.php`, 'Pishro-Nik §11.2 — discrete-time Markov chains and the classification of states'),
    2: r(`${PC}/chapter11/11_2_6_stationary_and_limiting_distributions.php`, 'Pishro-Nik §11.2.6 — stationary and limiting distributions'),
    3: r(`${PC}/chapter11/11_1_2_basic_concepts_of_the_poisson_process.php`, 'Pishro-Nik §11.1 — counting processes and the Poisson process'),
    4: r(`${PC}/chapter10/10_1_0_basic_concepts.php`, 'Pishro-Nik Chapter 10 — random processes: mean, correlation, stationarity'),
    5: r(`${PC}/chapter8/8_2_3_max_likelihood_estimation.php`, 'Pishro-Nik §8.2 — point estimation and maximum likelihood'),
    6: r(`${PC}/chapter8/8_3_0_interval_estimation.php`, 'Pishro-Nik §8.3–8.4 — confidence intervals and hypothesis tests'),
    7: r(`${PC}/chapter9/9_1_0_bayesian_inference.php`, 'Pishro-Nik §9.1 — Bayesian inference: prior, posterior, estimates'),
    8: r('https://ocw.mit.edu/courses/18-445-introduction-to-stochastic-processes-spring-2015/pages/assignments/', 'MIT 18.445 homework with solutions — the cumulative check'),
  },
};
