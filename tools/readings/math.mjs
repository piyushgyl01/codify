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
const O102 = 'https://ocw.mit.edu/courses/18-102-introduction-to-functional-analysis-spring-2021/resources';
const O950 = 'https://ocw.mit.edu/courses/18-950-differential-geometry-fall-2008/resources';
const PET = p => `https://www.math.ucla.edu/~petersen/manifolds.pdf#page=${p}`;
const O821 = 'https://ocw.mit.edu/courses/18-821-project-laboratory-in-mathematics-spring-2013/pages';
const O085 = 'https://ocw.mit.edu/courses/18-085-computational-science-and-engineering-i-summer-2020/resources';
const STEIN = p => `https://wstein.org/books/ant/ant.pdf#page=${p}`;
const O152 = 'https://ocw.mit.edu/courses/18-152-introduction-to-partial-differential-equations-fall-2011/resources';
const O433 = 'https://ocw.mit.edu/courses/18-433-combinatorial-optimization-fall-2003/resources';
const TESCHL = p => `https://www.mat.univie.ac.at/~gerald/ftp/book-ode/ode.pdf#page=${p}`;
const O385 = 'https://ocw.mit.edu/courses/18-385j-nonlinear-dynamics-and-chaos-fall-2014/resources';
const O175 = 'https://ocw.mit.edu/courses/18-175-theory-of-probability-spring-2014/resources';
const O655 = 'https://ocw.mit.edu/courses/18-655-mathematical-statistics-spring-2016/resources';
const EIM = 'https://ethics-in-mathematics.com/course/lectures';
const O794 = 'https://ocw.mit.edu/courses/21w-794-graduate-technical-writing-workshop-january-iap-2019/resources';
const MILNE = p => `https://www.jmilne.org/math/CourseNotes/AG.pdf#page=${p}`;
const ETINGOF = p => `https://arxiv.org/pdf/0901.0827#page=${p}`;
const OLVER = p => `https://www-users.cse.umn.edu/~olver/ln_/cv.pdf#page=${p}`;
const O354 = 'https://ocw.mit.edu/courses/18-354j-nonlinear-dynamics-ii-continuum-systems-spring-2015/resources';
const O046 = 'https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/resources';
const O895 = 'https://ocw.mit.edu/courses/6-895-essential-coding-theory-fall-2004/resources';

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
  'functional-analysis-and-fourier-analysis': {
    1: r(`${O102}/lecture-1-basic-banach-space-theory/`, '18.102 Lecture 1 — normed spaces and Banach spaces, with examples'),
    2: r(`${O102}/lecture-14-basic-hilbert-space-theory/`, '18.102 Lectures 14 and 17 — Hilbert spaces, orthogonal complements, projection, Riesz representation'),
    3: r(`${O102}/lecture-2-bounded-linear-operators/`, '18.102 Lectures 2, 5–6 and 18 — bounded operators, Hahn–Banach, the double dual, adjoints'),
    4: r(`${O102}/lecture-16-fejers-theorem-and-convergence-of-fourier-series/`, '18.102 Lecture 16 — Fejér\'s theorem and convergence of Fourier series, for the approximation experiment'),
    5: r(`${O102}/lecture-3-quotient-spaces-the-baire-category-theorem-and-the-uniform-boundedness-theorem/`, '18.102 Lecture 3 — the Baire category theorem and uniform boundedness'),
    6: r(`${O102}/lecture-4-the-open-mapping-theorem-and-the-closed-graph-theorem/`, '18.102 Lecture 4 — the open mapping and closed graph theorems'),
    7: r(`${O102}/lecture-15-orthonormal-bases-and-fourier-series/`, '18.102 Lectures 15 and 20–22 — orthonormal bases and Fourier series; compact operators and the spectral theorem'),
    8: r(`${O102}/complete-lecture-notes/`, '18.102 complete lecture notes — for the cumulative portfolio'),
  },
  'differential-geometry': {
    1: r(PET(7), 'Petersen, Manifolds, Transversality and de Rham Cohomology, Chapter 1 — smooth manifolds, charts and smooth maps (18.950 does not cover manifolds)'),
    2: r(PET(37), 'Petersen Chapter 2 — tangent spaces, differentials, vector fields and flows'),
    3: r(PET(118), 'Petersen Chapter 6 — tensors, differential forms, pullbacks and Lie derivatives'),
    4: r('https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf', 'Crane, Discrete Differential Geometry: An Applied Introduction — computing curvature on meshes'),
    5: r(`${O950}/ch4_revised/`, '18.950 Chapter 4 — lengths, distances and geodesics'),
    6: r(`${O950}/ch2_revised/`, '18.950 Chapters 1–2 — curvature of plane curves and the local geometry of hypersurfaces'),
    7: r(`${O950}/ch3_revised/`, '18.950 Chapter 3 — global geometry of hypersurfaces, including Gauss–Bonnet'),
    8: r('https://ocw.mit.edu/courses/18-950-differential-geometry-fall-2008/pages/assignments/', '18.950 homework sets 1–10 — the cumulative practice'),
  },
  'research-and-expository-seminar': {
    1: r('https://arxiv.org/archive/math', 'arXiv mathematics listings — find the primary source and trace each result back to where it was first proved'),
    2: r(`${O821}/mathematical-work/`, '18.821 Mathematical Work — how students read definitions and theorem dependencies under mentorship'),
    3: r(`${O821}/writing/sample-student-papers/`, '18.821 sample student papers — reconstructed proofs and examples to compare yours with'),
    4: r(`${O821}/writing/revision-and-feedback/`, '18.821 Revision and Feedback — the peer-review and revision cycle'),
    5: r(`${O821}/introduction/`, '18.821 Introduction — choosing a project: research questions, conjectures and feasibility'),
    6: r(`${O821}/writing/`, '18.821 Writing — figures, computation, citation and reproducible mathematical writing'),
    7: r(`${O821}/presentations/practice-and-feedback/`, '18.821 Presentations: Practice and Feedback — talk design and questioning'),
    8: r(`${O821}/presentations/sample-student-presentation/`, '18.821 sample student presentation — the standard for the public defense'),
  },
  'computational-mathematics': {
    1: r(`${O085}/mit18_085summer20_lec_w4/`, '18.085 Week 4 — stiffness matrices, graph models and Kirchhoff\'s laws: sparsity from structure'),
    2: r('https://ocw.mit.edu/courses/18-335j-introduction-to-numerical-methods-spring-2019/pages/week-8/', '18.335J Lectures 21–23 — conjugate gradients and preconditioning (18.085 does not cover iterative solvers)'),
    3: r(`${O085}/mit18_085summer20_lec_w2/`, '18.085 Week 2 — differences, derivatives and boundary conditions'),
    4: r(`${O085}/mit18_085summer20_lec_w7/`, '18.085 Week 7 — Laplace\'s equation by finite differences, a problem with known solutions to benchmark against'),
    5: r(`${O085}/mit18_085summer20_lec_w8/`, '18.085 Weeks 8–9 — the finite element method, the DFT and FFT, convolution'),
    6: r('https://ocw.mit.edu/courses/18-335j-introduction-to-numerical-methods-spring-2019/pages/week-9/', '18.335J Lectures 25–26 — optimisation algorithms and adjoint (reverse-mode) differentiation'),
    7: r('https://ocw.mit.edu/courses/18-335j-introduction-to-numerical-methods-spring-2019/pages/week-4/', '18.335J Lectures 9–11 — matrix operations, caches and blocking: what actually costs time'),
    8: r('https://ocw.mit.edu/courses/18-085-computational-science-and-engineering-i-summer-2020/pages/exams/', '18.085 midterm and final with solutions — the cumulative check'),
  },
  'algebraic-number-theory': {
    1: r(STEIN(9), 'Stein, Algebraic Number Theory: a Computational Approach, Chapters 1–2 — number fields and algebraic integers'),
    2: r(STEIN(69), 'Stein Chapter 6 — discriminants and norms'),
    3: r(STEIN(41), 'Stein Chapter 3 — Dedekind domains and unique factorisation of ideals'),
    4: r(STEIN(49), 'Stein Chapters 4–5 — factoring primes, with the Sage computations the book shows'),
    5: r(STEIN(99), 'Stein Chapter 9 — decomposition and inertia groups, ramification'),
    6: r(STEIN(77), 'Stein Chapters 7–8 — finiteness of the class group (Minkowski) and Dirichlet\'s unit theorem'),
    7: r('https://ocw.mit.edu/courses/18-785-number-theory-i-fall-2021/resources/mit18_785f21_lec9/', '18.785 Lectures 8–9 — complete fields, local fields and Hensel\'s lemma'),
    8: r(STEIN(201), 'Stein Chapter 20 — exercises across the book, for the cumulative dossier'),
  },
  'partial-differential-equations': {
    1: r(`${O152}/mit18_152f11_lec_01/`, '18.152 Lectures 1 and 15 — what a PDE is, well-posedness, classification of second-order equations'),
    2: r(`${O152}/mit18_152f11_lec_24/`, '18.152 Lecture 24 — transport equations and Burgers\' equation, by characteristics'),
    3: r(`${O152}/mit18_152f11_lec_10/`, '18.152 Lectures 10–12 — the wave equation, spherical means, Kirchhoff\'s formula'),
    4: r(`${O152}/mit18_152f11_lec_13_14/`, '18.152 Lectures 13–14 — energy estimates, the quantity a verified simulation should conserve'),
    5: r(`${O152}/mit18_152f11_lec_04/`, '18.152 Lectures 2–5 — the heat equation, the maximum principle, the fundamental solution'),
    6: r(`${O152}/mit18_152f11_lec_06/`, '18.152 Lectures 6–9 — Laplace\'s and Poisson\'s equations, Green functions, Harnack and Liouville'),
    7: r(`${O152}/mit18_152f11_lec_16_18/`, '18.152 Lectures 16–18 — the Fourier transform, Fourier inversion and Plancherel'),
    8: r('https://ocw.mit.edu/courses/18-152-introduction-to-partial-differential-equations-fall-2011/pages/exams/', '18.152 midterm with solutions, and the final — the cumulative check'),
  },
  'combinatorial-optimization': {
    1: r(`${AC}/s_graphalgorithms_min-wt-span.html`, 'Applied Combinatorics Chapter 12 — minimum spanning trees and shortest paths, with greedy proofs (18.433 starts at matchings)'),
    2: r(`${O433}/l78/`, '18.433 Lectures 7–9 — flow duality and algorithms, minimum cuts'),
    3: r(`${O433}/l123/`, '18.433 Lectures 1–3 and 5 — matching algorithms; the bipartite matching polytope'),
    4: r(`${O433}/l15/`, '18.433 Lecture 16 — the primal–dual algorithm, which builds its own certificate'),
    5: r('https://math.mit.edu/~goemans/18433S15/matroid-notes.pdf', 'Goemans, 18.433 (2015) notes on matroids — the 2003 matroid lectures were never posted'),
    6: r(`${O433}/l4/`, '18.433 Lectures 4 and 12 — polyhedral combinatorics and linear programs'),
    7: r(`${O433}/l2122/`, '18.433 Lectures 21–24 — NP-completeness and approximation algorithms'),
    8: r('https://ocw.mit.edu/courses/18-433-combinatorial-optimization-fall-2003/pages/assignments/', '18.433 problem sets 1–4 — the cumulative practice'),
  },
  'dynamical-systems': {
    1: r(TESCHL(198), 'Teschl, Ordinary Differential Equations and Dynamical Systems, Chapter 6 — flows, orbits, invariant sets, stability (18.385J posts only six handouts)'),
    2: r(TESCHL(264), 'Teschl Chapter 9 — local behaviour near fixed points: linearisation, Hartman–Grobman, stable manifolds'),
    3: r(TESCHL(220), 'Teschl Chapter 7 — planar systems, Lyapunov functions, limit cycles and Poincaré–Bendixson'),
    4: r(TESCHL(290), 'Teschl Chapter 10 — discrete dynamical systems: the logistic map and period doubling'),
    5: r(`${O385}/mit18_385jf14_babynormlfms/`, '18.385J handouts — Bifurcations: Baby Normal Forms, and Hopf Bifurcations'),
    6: r(TESCHL(249), 'Teschl §8.3 — Hamiltonian mechanics and conserved quantities'),
    7: r(TESCHL(302), 'Teschl Chapter 11 — chaos in discrete systems and symbolic dynamics'),
    8: r(`${O385}/mit18_385jf14_selectedlec/`, '18.385J selected lecture notes — for the cumulative defense'),
  },
  'advanced-probability-and-statistics': {
    1: r(`${O175}/mit18_175s14_lecture1/`, '18.175 Lectures 1–5 — probability spaces, σ-algebras, random variables and integration'),
    2: r(`${O175}/mit18_175s14_lecture25/`, '18.175 Lectures 25–29 — conditional expectation and martingales'),
    3: r(`${O655}/mit18_655s16_lecnote14/`, '18.655 Lecture 14 — modes of convergence and probability inequalities, with 18.175 Lectures 12 and 14'),
    4: r('https://osf.io/prereg/', 'OSF preregistration — register the simulation study before running it'),
    5: r(`${O175}/mit18_175s14_lecture15/`, '18.175 Lectures 9 and 15–16 — the strong law and the central limit theorem'),
    6: r(`${O655}/mit18_655s16_lecnote17/`, '18.655 Lectures 13 and 16–18 — the information inequality, consistency, asymptotic normality'),
    7: r(`${O655}/mit18_655s16_lecnote19/`, '18.655 Lectures 19–25 — Gaussian and generalised linear models'),
    8: r(`${O655}/mit18_655s16_lecnote26/`, '18.655 Lecture 26 — a case study to model the cumulative defense on'),
  },
  'mathematics-society-and-responsible-modeling': {
    1: r(`${EIM}#financial-mathematics-and-modelling`, 'Ethics for the Working Mathematician, Lectures 1–2 — why ethics in mathematics; financial mathematics and modelling'),
    2: r('https://arxiv.org/abs/1912.05511', 'Jacobs & Wallach, Measurement and Fairness — constructs, proxies and validity'),
    3: r(`${EIM}#cryptography-surveillance-and-privacy`, 'Ethics for the Working Mathematician, Lecture 3 — cryptography, surveillance and privacy'),
    4: r('https://arxiv.org/abs/2001.00973', 'Raji et al., Closing the AI Accountability Gap — an end-to-end framework for auditing a model'),
    5: r('https://arxiv.org/abs/1609.05807', 'Kleinberg, Mullainathan & Raghavan, Inherent Trade-Offs in the Fair Determination of Risk Scores — with Lecture 4 of the series'),
    6: r('https://arxiv.org/abs/1706.09847', 'Ensign et al., Runaway Feedback Loops in Predictive Policing'),
    7: r(`${EIM}#regulation-accountability-and-the-law`, 'Ethics for the Working Mathematician, Lecture 5 — regulation, accountability and the law'),
    8: r(`${EIM}#looking-into-the-future-what-more-can-mathematicians-do`, 'Ethics for the Working Mathematician, Lecture 8 — what more mathematicians can do'),
  },
  'senior-research-thesis': {
    1: r(`${O794}/mit21w_794iap19_lec1/`, '21W.794 Session 1 — genre, rhetorical situation, abstracts and stasis theory: framing the question'),
    2: r(`${O794}/mit21w_794iap19_lec2/`, '21W.794 Sessions 2–3 — reasoning with and synthesising sources'),
    3: r('https://ocw.mit.edu/courses/18-821-project-laboratory-in-mathematics-spring-2013/pages/mathematical-work/', '18.821 Mathematical Work — how a supervised project moves from question to strategy'),
    4: r(`${O794}/mit21w_794iap19_lec4/`, '21W.794 Session 4 — generating texts: writing the proposal'),
    5: r('https://ocw.mit.edu/courses/18-821-project-laboratory-in-mathematics-spring-2013/pages/writing/sample-student-papers/', '18.821 sample papers — reporting results, counterexamples and dead ends'),
    6: r('https://terrytao.wordpress.com/advice-on-writing-papers/', 'Terence Tao, On writing — structure, figures and citation in mathematical papers'),
    7: r(`${O794}/mit21w_794iap19_lec5/`, '21W.794 Session 5 — revision'),
    8: r('https://arxiv.org/archive/math', 'arXiv — archive the thesis publicly with its code and data'),
  },
  'algebraic-geometry-and-representation-theory': {
    1: r(MILNE(59), 'Milne, Algebraic Geometry, Chapter 3 — affine algebraic varieties and coordinate rings (the catalogue\'s resource is a research seminar on Hecke algebras)'),
    2: r(MILNE(39), 'Milne §2d–2e — the Hilbert Nullstellensatz and the algebra–geometry correspondence'),
    3: r(MILNE(130), 'Milne Chapter 6 — projective varieties, morphisms and rational maps'),
    4: r(ETINGOF(40), 'Etingof et al., Introduction to Representation Theory §3.8 — character tables to compute with'),
    5: r(MILNE(81), 'Milne Chapter 4 — tangent spaces, singular points and dimension'),
    6: r(ETINGOF(33), 'Etingof §3.1 — Maschke\'s theorem and complete reducibility'),
    7: r(ETINGOF(34), 'Etingof §3.2–3.7 — characters and their orthogonality'),
    8: r(MILNE(222), 'Milne, solutions to the exercises — check the cumulative dossier against them'),
  },
  'calculus-of-variations-and-continuum-models': {
    1: r(OLVER(9), 'Olver, The Calculus of Variations §3 — the first variation and the Euler–Lagrange equation'),
    2: r(OLVER(22), 'Olver §4 and §2 — natural boundary conditions; isoperimetric problems and constraints'),
    3: r(OLVER(30), 'Olver §5 and "A Cautionary Example" — the second variation, and when minimisers fail to exist'),
    4: r(`${O354}/mit18_354js15_ch9/`, '18.354J Chapter 9 — surface tension: an energy-minimising membrane to simulate'),
    5: r(`${O354}/mit18_354js15_ch4/`, '18.354J Chapter 4 — Hamiltonian dynamics: symmetries and conserved quantities'),
    6: r(`${O354}/mit18_354js15_ch11/`, '18.354J Chapters 11–13 — elasticity and the Navier–Stokes equations'),
    7: r('https://ocw.mit.edu/courses/18-085-computational-science-and-engineering-i-summer-2020/resources/mit18_085summer20_lec_w8/', '18.085 Week 8 — the finite element method'),
    8: r(`${O354}/mit18_354js15_ch8/`, '18.354J Chapter 8 — variational calculus applied to continuum problems'),
  },
  'algorithms-complexity-and-coding': {
    1: r(`${O046}/lecture-1-course-overview-interval-scheduling/`, '6.046J Lectures 1–2 — greedy and divide-and-conquer, invariants and lower bounds'),
    2: r(`${O046}/lecture-6-notes/`, '6.046J Lectures 6–8 — randomised algorithms and hashing'),
    3: r('https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/mit18_404f20_lec14/', '18.404J Lectures 14–16 — P, NP, reducibility and Cook–Levin'),
    4: r(`${O895}/lect05/`, '6.895 Lecture 5 — algebraic codes: Reed–Solomon, Reed–Muller, Hadamard'),
    5: r(`${O046}/lecture-17-complexity-approximation-algorithms/`, '6.046J Lectures 16–17 — NP-completeness and approximation'),
    6: r(`${O895}/lect02/`, '6.895 Lecture 2 — Shannon\'s theory: the coding theorem and its converse'),
    7: r(`${O895}/lect03/`, '6.895 Lectures 3 and 6 — linear codes; decoding Reed–Solomon (Welch–Berlekamp)'),
    8: r(`${O895}/lect04/`, '6.895 Lecture 4 — asymptotically good codes and the volume bound'),
  },
};
