/** Mathematics: the part of each course's free resource that covers each unit (audited October 2026). */
const r = (url, where) => ({ url, where });

const O1801 = 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2005/resources';
const BOP = 'https://richardhammack.github.io/BookOfProof/Main.pdf';
// Hefferon's printed page numbers run 10 behind the PDF's.
const HEF = p => `https://jheffero.w3.uvm.edu/linearalgebra/book.pdf#page=${p + 10}`;
const DMOI = 'https://discrete.openmathbooks.org/dmoi4';
const CT = 'https://computationalthinking.mit.edu/Fall22';

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
};
