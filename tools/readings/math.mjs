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
};
