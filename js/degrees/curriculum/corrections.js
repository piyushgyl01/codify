/**
 * Corrections to the Course Atlas catalogue, applied when it is imported
 * (tools/import-atlas.mjs). Every link in all five degrees was checked on
 * 16 October 2026: 533 distinct links, of which 37 did not load. Those that
 * only refuse scripts (Cloudflare, Harvard's sites) work in a browser and are
 * left alone; the rest are fixed here.
 *
 *   LINK_FIXES     a dead link and its live replacement, wherever it appears
 *   PLACE_FIXES    a fix for one week or unit of one course, for when the same
 *                  dead link was used for different things, or the week's title
 *                  named the wrong lecture. Keyed "degree-slug:course-key:W3" or ":U2".
 *
 * Several CS weeks named MIT lectures by the wrong number (6.046J's "Lecture 5
 * — Greedy: MST" is really Lecture 12); those titles are corrected to the
 * lecture they now link to. The audit is in docs/degree-links-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';
const MCS10 = `${OCW}/6-042j-mathematics-for-computer-science-fall-2010`;
const C1801 = `${OCW}/18-01sc-single-variable-calculus-fall-2010`;
const A046 = `${OCW}/6-046j-design-and-analysis-of-algorithms-spring-2015/resources`;
const A006 = `${OCW}/6-006-introduction-to-algorithms-fall-2011/resources`;
const CS004 = `${OCW}/6-004-computation-structures-spring-2017/pages`;
const CSORG = 'https://computationstructures.org';
const ML = 'https://introml.mit.edu/notes';
const OLL036 = 'https://openlearninglibrary.mit.edu/courses/course-v1:MITx+6.036+1T2019/course/';
const LA06 = `${OCW}/18-06sc-linear-algebra-fall-2011/pages`;

export const LINK_FIXES = {
  // CS Term 1 (see cs-term1.js)
  'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/pages/assignments/': `${MCS10}/pages/assignments/`,
  'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/pages/exams/': `${MCS10}/pages/exams/`,
  [`${C1801}/pages/unit-1-differentiation/`]: `${C1801}/pages/1.-differentiation/`,
  [`${C1801}/pages/unit-1-differentiation/problem-set-1/`]: `${C1801}/pages/1.-differentiation/part-a-definition-and-basic-rules/problem-set-1/`,
  [`${C1801}/pages/unit-2-applications-of-differentiation/problem-set-3/`]: `${C1801}/pages/unit-2-applications-of-differentiation/part-b-optimization-related-rates-and-newtons-method/problem-set-4/`,
  [`${C1801}/pages/unit-3-the-definite-integral-and-its-applications/problem-set-5/`]: `${C1801}/pages/unit-3-the-definite-integral-and-its-applications/part-a-definition-of-the-definite-integral-and-first-fundamental-theorem/problem-set-6/`,
  [`${C1801}/pages/unit-4-techniques-of-integration/problem-set-7/`]: `${C1801}/pages/unit-4-techniques-of-integration/part-b-partial-fractions-integration-by-parts-arc-length-and-surface-area/problem-set-10/`,
  'https://guides.library.stanford.edu/evaluate': 'https://cor.inquirygroup.org/curriculum/lessons/intro-to-lateral-reading/',
  'https://cs50.harvard.edu/x/2026/honesty/': 'https://cs50.harvard.edu/x/2026/project/',
  // Everywhere else
  'https://fbsbook.org/': 'https://www.cds.caltech.edu/~murray/books/AM08/pdf/fbs-public_24Jul2020.pdf',
  'https://www.nptel.ac.in/courses/108106188': 'https://nptel.ac.in/courses/108106188',
  'https://opentextbooks.library.arizona.edu/mathematicalmodeling/': 'https://m3challenge.siam.org/what-is-math-modeling/modeling-handbooks/',
  'https://ocw.mit.edu/courses/2-008-design-and-manufacturing-ii-spring-2004/': `${OCW}/2-008-design-and-manufacturing-ii-spring-2025/`,
  'https://ocw.mit.edu/courses/2-671-measurement-and-instrumentation-fall-2006/': 'https://www.itl.nist.gov/div898/handbook/',
  'https://mixtape.scunning.com/04-potential_outcomes': 'https://mixtape.scunning.com/04-potential_outcomes_and_randomization',
  'https://mixtape.scunning.com/05-matching_and_subclassification': 'https://mixtape.scunning.com/05-causal_cross_sectional_designs',
  'https://cs144.github.io/assignments/check5.pdf': 'https://cs144.github.io/',
  'https://cs144.github.io/assignments/check7.pdf': 'https://cs144.github.io/',
  'https://ocw.mit.edu/courses/6-045j-automata-computability-and-complexity-spring-2011/pages/exams/': `${OCW}/18-404j-theory-of-computation-fall-2020/pages/exams/`,
};

const fix = (url, title) => ({ url, ...(title ? { title } : {}) });

export const PLACE_FIXES = {
  /* CS201 Data Structures — MIT 6.006 Fall 2011 */
  'computer-science:data-structures:U2': fix(`${A006}/lecture-2-models-of-computation-document-distance/`),
  'computer-science:data-structures:W3': fix(`${A006}/lecture-2-models-of-computation-document-distance/`, 'Week 3 · 6.006 Lecture 2 — Models of Computation, Document Distance'),
  'computer-science:data-structures:U8': fix(`${A006}/lecture-7-counting-sort-radix-sort-lower-bounds-for-sorting/`),
  'computer-science:data-structures:W15': fix(`${A006}/lecture-7-counting-sort-radix-sort-lower-bounds-for-sorting/`, 'Week 15 · 6.006 Lecture 7 — Counting Sort, Radix Sort, Lower Bounds for Sorting'),

  /* CS301 Algorithms — MIT 6.046J Spring 2015, matched by topic */
  'computer-science:algorithm-design-and-analysis:U1': fix(`${A046}/lecture-1-course-overview-interval-scheduling/`),
  'computer-science:algorithm-design-and-analysis:W1': fix(`${A046}/lecture-1-course-overview-interval-scheduling/`, 'Week 1 · 6.046J Lecture 1 — Course Overview, Interval Scheduling'),
  'computer-science:algorithm-design-and-analysis:U3': fix(`${A046}/lecture-12-greedy-algorithms-minimum-spanning-tree/`),
  'computer-science:algorithm-design-and-analysis:W5': fix(`${A046}/lecture-12-greedy-algorithms-minimum-spanning-tree/`, 'Week 5 · 6.046J Lecture 12 — Greedy Algorithms: Minimum Spanning Tree'),
  'computer-science:algorithm-design-and-analysis:U4': fix(`${A046}/lecture-10-dynamic-programming-advanced-dp/`),
  'computer-science:algorithm-design-and-analysis:W7': fix(`${A046}/lecture-10-dynamic-programming-advanced-dp/`, 'Week 7 · 6.046J Lecture 10 — Dynamic Programming: Advanced DP'),
  'computer-science:algorithm-design-and-analysis:U5': fix(`${A046}/lecture-13-incremental-improvement-max-flow-min-cut/`),
  'computer-science:algorithm-design-and-analysis:W9': fix(`${A046}/lecture-13-incremental-improvement-max-flow-min-cut/`, 'Week 9 · 6.046J Lecture 13 — Incremental Improvement: Max Flow, Min Cut'),
  'computer-science:algorithm-design-and-analysis:U7': fix(`${A046}/lecture-17-complexity-approximation-algorithms/`),
  'computer-science:algorithm-design-and-analysis:W13': fix(`${A046}/lecture-17-complexity-approximation-algorithms/`, 'Week 13 · 6.046J Lecture 17 — Complexity: Approximation Algorithms'),

  /* CS210 Architecture — MIT 6.004 Spring 2017 chapters on OCW; labs and worksheets on computationstructures.org */
  'computer-science:computer-architecture:U1': fix(`${CS004}/c4/`),
  'computer-science:computer-architecture:U2': fix(`${CS004}/c9/`),
  'computer-science:computer-architecture:U3': fix(`${CS004}/c13/`),
  'computer-science:computer-architecture:U4': fix(`${CS004}/c15/`),
  'computer-science:computer-architecture:U5': fix(`${CS004}/c14/`),
  'computer-science:computer-architecture:U6': fix(`${CS004}/c16/`),
  'computer-science:computer-architecture:U7': fix(`${CS004}/c21/`),
  'computer-science:computer-architecture:U8': fix(`${CSORG}/worksheets/index.html`),
  'computer-science:computer-architecture:W1': fix(`${CS004}/c2/`, 'Week 1 · 6.004 Chapter 2 — The Digital Abstraction'),
  'computer-science:computer-architecture:W2': fix(`${CSORG}/exercises/index.html`, 'Week 2 · 6.004 Labs — combinational and sequential logic'),
  'computer-science:computer-architecture:W3': fix(`${CS004}/c9/`, 'Week 3 · 6.004 Chapter 9 — Designing an Instruction Set'),
  'computer-science:computer-architecture:W4': fix(`${CSORG}/exercises/index.html`, 'Week 4 · 6.004 Labs — assembly programming'),
  'computer-science:computer-architecture:W5': fix(`${CS004}/c13/`, 'Week 5 · 6.004 Chapter 13 — Building the Beta'),
  'computer-science:computer-architecture:W6': fix(`${CSORG}/exercises/index.html`, 'Week 6 · 6.004 Labs — the Beta processor'),
  'computer-science:computer-architecture:W7': fix(`${CS004}/c15/`, 'Week 7 · 6.004 Chapter 15 — Pipelining the Beta'),
  'computer-science:computer-architecture:W9': fix(`${CS004}/c14/`, 'Week 9 · 6.004 Chapter 14 — Caches and the Memory Hierarchy'),
  'computer-science:computer-architecture:W10': fix(`${CSORG}/exercises/index.html`, 'Week 10 · 6.004 Labs — cache design'),
  'computer-science:computer-architecture:W11': fix(`${CS004}/c16/`, 'Week 11 · 6.004 Chapter 16 — Virtual Memory'),
  'computer-science:computer-architecture:W12': fix(`${CS004}/c18/`, 'Week 12 · 6.004 Chapter 18 — Devices and Interrupts'),
  'computer-science:computer-architecture:W13': fix(`${CS004}/c21/`, 'Week 13 · 6.004 Chapter 21 — Parallel Processing'),
  'computer-science:computer-architecture:W14': fix(`${CSORG}/worksheets/index.html`, 'Week 14 · 6.004 Worksheets — performance and memory'),
  'computer-science:computer-architecture:W15': fix(`${CSORG}/worksheets/index.html`, 'Week 15 · 6.004 Worksheets — final review'),
  'computer-science:computer-architecture:W16': fix(`${CSORG}/exercises/index.html`),

  /* CS510 Machine Learning — MIT 6.036's OCW pages are gone; the notes of its successor 6.390, and 6.036's exercises on MIT Open Learning Library */
  'computer-science:machine-learning:U1': fix(`${ML}/regression.html`),
  'computer-science:machine-learning:U2': fix(`${ML}/classification.html`),
  'computer-science:machine-learning:U3': fix(`${ML}/feature_representation.html`),
  'computer-science:machine-learning:U4': fix(`${ML}/regression.html`),
  'computer-science:machine-learning:U5': fix(`${ML}/neural_networks.html`),
  'computer-science:machine-learning:U6': fix(OLL036),
  'computer-science:machine-learning:U7': fix(`${ML}/reinforcement_learning.html`),
  'computer-science:machine-learning:U8': fix(OLL036),
  'computer-science:machine-learning:W1': fix(`${ML}/classification.html`, 'Week 1 · MIT 6.390 notes — Classification (linear classifiers)'),
  'computer-science:machine-learning:W2': fix(OLL036, 'Week 2 · MIT 6.036 exercises — linear models'),
  'computer-science:machine-learning:W3': fix(`${ML}/classification.html`, 'Week 3 · MIT 6.390 notes — Logistic regression'),
  'computer-science:machine-learning:W4': fix(OLL036, 'Week 4 · MIT 6.036 exercises — linear classification'),
  'computer-science:machine-learning:W5': fix(OLL036, 'Week 5 · MIT 6.036 — Margin maximization'),
  'computer-science:machine-learning:W6': fix(`${ML}/feature_representation.html`, 'Week 6 · MIT 6.390 notes — Feature representation'),
  'computer-science:machine-learning:W7': fix(`${ML}/regression.html`, 'Week 7 · MIT 6.390 notes — Regularization and generalization'),
  'computer-science:machine-learning:W8': fix(`${ML}/index.html`),
  'computer-science:machine-learning:W9': fix(`${ML}/neural_networks.html`, 'Week 9 · MIT 6.390 notes — Neural networks'),
  'computer-science:machine-learning:W10': fix(OLL036, 'Week 10 · MIT 6.036 exercises — neural networks and backpropagation'),
  'computer-science:machine-learning:W11': fix(OLL036, 'Week 11 · MIT 6.036 — Probabilistic models'),
  'computer-science:machine-learning:W12': fix(OLL036, 'Week 12 · MIT 6.036 exercises — probabilistic inference'),
  'computer-science:machine-learning:W13': fix(`${ML}/reinforcement_learning.html`, 'Week 13 · MIT 6.390 notes — Reinforcement learning'),
  'computer-science:machine-learning:W14': fix(`${ML}/mdp.html`, 'Week 14 · MIT 6.390 notes — Markov decision processes'),
  'computer-science:machine-learning:W15': fix(OLL036, 'Week 15 · MIT 6.036 — final review'),

  /* CS401 Theory — 6.045J has no exams on OCW; Sipser's 18.404J does */
  'computer-science:theory-of-computation:W12': fix(`${OCW}/18-404j-theory-of-computation-fall-2020/pages/exams/`, 'Week 12 · 18.404J exams (practice) — mapping reductions'),

  /* CS610 Research Methods — The Mixtape's Remix edition renamed chapter 5 */
  'computer-science:computer-science-research-methods:W10': fix('https://mixtape.scunning.com/05-causal_cross_sectional_designs', 'Week 10 · Chapter 5 — Unconfoundedness (matching and subclassification)'),

  /* CS540 and CS620 Capstones — units that linked an unrelated lecture (a shell
     lesson for "problem discovery", a code-review page for "user evaluation").
     The weeks keep their Missing Semester and code-review lectures. */
  'computer-science:capstone-studio-1:U1': fix('https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs'),
  'computer-science:capstone-studio-1:U2': fix('https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works'),
  'computer-science:capstone-studio-1:U3': fix('https://missing.csail.mit.edu/2020/command-line/'),
  'computer-science:capstone-studio-1:U5': fix('https://adr.github.io/'),
  'computer-science:capstone-studio-2:U5': fix('https://sre.google/sre-book/testing-reliability/'),
  'computer-science:capstone-studio-2:U6': fix('https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing'),
  'computer-science:capstone-studio-2:U7': fix('https://google.github.io/styleguide/docguide/best_practices.html'),

  /* MATH210 Linear Algebra — 18.06SC is organised by unit, not by problem set */
  'computer-science:linear-algebra:W2': fix(`${LA06}/ax-b-and-the-four-subspaces/`, 'Week 2 · 18.06SC Unit I problem sets — elimination'),
  'computer-science:linear-algebra:W4': fix(`${LA06}/ax-b-and-the-four-subspaces/`, 'Week 4 · 18.06SC Unit I problem sets — matrices and LU'),
  'computer-science:linear-algebra:W8': fix(`${LA06}/least-squares-determinants-and-eigenvalues/`),
  'computer-science:linear-algebra:W10': fix(`${LA06}/least-squares-determinants-and-eigenvalues/`, 'Week 10 · 18.06SC Unit II problem sets — determinants'),
};

/** The fix for one week or unit, if there is one. */
export const placeFix = (slug, courseKey, where) => PLACE_FIXES[`${slug}:${courseKey}:${where}`] || null;
