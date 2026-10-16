/**
 * Mathematics, Term 4 — audited as Terms 0–3 were.
 *
 * Outside graders: MIT 18.085 and 18.152 exams with solutions; Lean
 * (Mathematics in Lean Chapter 12); LMFDB's number-field data; NetworkX and
 * MIPLIB as oracles for combinatorial solvers; the discrete Gauss–Bonnet
 * identity on meshes; Math Stack Exchange's votes on expository answers.
 * Evidence in docs/math-term4-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';
const MIL = 'https://leanprover-community.github.io/mathematics_in_lean';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });
const examFinal = (source, linked, check) => [
  crit('Cumulative correctness', `At least 85% on a cumulative exam (${source}), marked against the official solutions.`, '60–84%.', 'Below 60%.'),
  crit('Linked solution', linked, 'Correct, with one step unjustified.', 'Disconnected computations.'),
  crit('Independent check', check, 'A check that repeats the same method.', 'No check.'),
  crit('Correction and defense', 'Every lost mark corrected, and the linked solution defended under questions.', 'Partial corrections.', 'None.'),
];
const oralFinal = (portfolio, checked) => [
  crit('Theorem coverage', portfolio, 'One required theorem missing.', 'Several missing.'),
  crit('Rigor', 'Every definition stated, every hypothesis used and named, no step left to the reader.', 'One gap.', 'Several gaps.'),
  crit('Independent check', checked, 'Attempted, not completed.', 'Not attempted.'),
  crit('Oral defense and revision', 'Questions answered from the proofs, and every weakness found is revised in writing.', 'Answered, not revised.', 'Could not defend.'),
];
const verifiedSoftware = (what, oracle) => [
  crit('Derivation', `The ${what} derived on paper, with consistency and stability (or correctness) proved.`, 'Derived, not analysed.', 'Not derived.'),
  crit('Convergence or correctness evidence', `Observed convergence order (or certificate validity) matches theory on manufactured problems; ${oracle}.`, 'Evidence on one problem only.', 'No evidence.'),
  crit('Tests and reproducibility', 'Regression tests and one command rebuild every figure and table from a clean checkout.', 'Tests exist; rebuild has manual steps.', 'Not reproducible.'),
  crit('Performance and limits', 'Cost profiled and explained; the inputs where the method fails or slows are found and stated.', 'Profiled, limits not stated.', 'Neither.'),
];

export const MATH_TERM4 = {
  'functional-analysis-and-fourier-analysis': {
    doc: 'docs/math-term4-audit.md',
    outcomes: [
      o('ma501.banach', 'Work in normed and Banach spaces.', ['QAA-MSOR 3.10'], ['meas.lp'], [1], ['final']),
      o('ma501.hilbert', 'Use orthogonality and projection in Hilbert spaces.', ['QAA-MSOR 3.10'], ['m.proj'], [2], ['final']),
      o('ma501.operators', 'Bound operators, use duality and weak convergence.', ['QAA-MSOR 3.10'], ['fa.opnorm', 'na.cond'], [3], ['final']),
      o('ma501.experiment', 'Measure Fourier approximation in several norms and expose the Gibbs phenomenon.', ['QAA-MSOR 3.16', 'QAA-MSOR 3.17'], ['fa.fourier', 'fa.parseval'], [4], ['applied']),
      o('ma501.baire', 'Prove and apply the Baire category and uniform boundedness theorems.', ['QAA-MSOR 3.14'], [], [5], ['final']),
      o('ma501.openmap', 'Prove and apply the open mapping and closed graph theorems.', ['QAA-MSOR 3.14'], [], [6], ['final']),
      o('ma501.spectral', 'Represent functions by Fourier series and operators by their spectra.', ['QAA-MSOR 3.10'], ['fa.fourier', 'la2.definite'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.102 front page.', fix: 'Each unit now links the 18.102 lecture that covers it.' },
      { what: 'The Fourier transform is not covered', why: 'Unit 7 promises transforms, but 18.102 treats Fourier series only.', fix: 'For the transform, read 18.152 Lectures 16–18 (linked from Partial Differential Equations).' },
      { what: 'No outside check', why: '18.102 publishes homework but no solutions.', fix: 'Mathematics in Lean Chapter 12 develops calculus in normed spaces with proofs Lean checks.', url: `${MIL}/C12_Differential_Calculus.html` },
    ],
    benchmarks: [
      { id: 'ma501.lean', name: 'Mathematics in Lean Chapter 12 (normed spaces) exercises accepted by Lean', how: 'Record the percentage Lean accepts.', max: 100, url: `${MIL}/C12_Differential_Calculus.html` },
    ],
    rubrics: {
      applied: [
        crit('Truncations computed', 'Fourier partial sums of a non-smooth signal computed to high order, with coefficients checked against their closed forms.', 'Computed, not checked.', 'Not computed.'),
        crit('Convergence in several norms', 'Errors in L², L¹ and sup norm measured against N and their rates explained (L² by Parseval, sup norm failing at jumps).', 'One norm only.', 'None.'),
        crit('Gibbs phenomenon', 'The overshoot near a jump measured (about 9% of the jump) and shown not to shrink as N grows; Fejér averaging shown to remove it.', 'Overshoot shown, not quantified.', 'Not shown.'),
        crit('Theory–experiment link', 'Every observed rate traced to a theorem, and any mismatch explained.', 'Partly linked.', 'Not linked.'),
      ],
      final: oralFinal('Banach and Hilbert structure, bounded operators, one of Baire / uniform boundedness / open mapping with full proof, Fourier representation, and one spectral statement.', 'At least one normed-space lemma checked in Lean (Mathematics in Lean Chapter 12).'),
    },
  },

  'differential-geometry': {
    doc: 'docs/math-term4-audit.md',
    outcomes: [
      o('ma502.manifolds', 'Define smooth manifolds by charts and atlases, and smooth maps between them.', ['QAA-MSOR 3.10'], [], [1], ['final']),
      o('ma502.tangent', 'Work with tangent spaces, vector fields and flows.', ['QAA-MSOR 3.10'], ['mv.gradient'], [2], ['final']),
      o('ma502.forms', 'Compute with differential forms and pullbacks.', ['QAA-MSOR 3.10'], ['mv.line', 'mv.divcurl'], [3], ['final']),
      o('ma502.compute', 'Parametrise a surface and compute its geometry in two charts, checking invariance.', ['QAA-MSOR 3.17', 'QAA-MSOR 3.18'], ['dg.gauss', 'dg.curvature'], [4], ['applied']),
      o('ma502.metric', 'Use Riemannian metrics, connections and geodesics.', ['QAA-MSOR 3.10'], [], [5], ['applied', 'final']),
      o('ma502.curvature', 'Compute curvature of curves and surfaces.', ['QAA-MSOR 3.10'], ['dg.curvature', 'dg.gauss'], [6], ['applied', 'final']),
      o('ma502.global', 'Use Gauss–Bonnet to pass from local curvature to global topology.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.14'], ['top.euler'], [7], ['final']),
    ],
    gaps: [
      { what: 'The course\'s resource never reaches manifolds', why: '18.950 (Fall 2008) treats curves and hypersurfaces in ℝⁿ; Units 1–3 (charts, tangent spaces, forms) are not in it.', fix: 'Those units read Peter Petersen\'s free UCLA notes, Manifolds, Transversality and de Rham Cohomology.', url: 'https://www.math.ucla.edu/~petersen/manifolds.pdf' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers curvature and torsion of curves, Gaussian curvature of surfaces, and the Euler characteristic.' },
      { what: 'No outside check', why: '18.950 publishes homework without solutions.', fix: 'Gauss–Bonnet itself is a check that does not care what you believe: on any closed mesh the total angle defect must equal 2πχ.', url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf' },
    ],
    benchmarks: [
      { id: 'ma502.gaussbonnet', name: 'Discrete Gauss–Bonnet: meshes where your total curvature equals 2πχ to 1e-9', how: 'Compute angle defects on three closed meshes of different genus (sphere, torus, double torus); count those that match 2πχ.', max: 3, url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf' },
    ],
    rubrics: {
      applied: [
        crit('Parametrisation and charts', 'The surface given in two overlapping charts with the transition map and its smoothness shown.', 'One chart only.', 'No valid chart.'),
        crit('Metric and curvature', 'First and second fundamental forms, Gaussian and mean curvature computed symbolically in both charts.', 'Computed in one chart.', 'Wrong quantities.'),
        crit('Invariance verified', 'Gaussian curvature shown equal in both charts at sample points, and total curvature checked against Gauss–Bonnet.', 'Checked at points only.', 'Not checked.'),
        crit('Visualisation', 'The surface rendered with curvature colouring and geodesics drawn, and the picture used in the argument.', 'Rendered, not used.', 'None.'),
      ],
      final: oralFinal('One geometric case taken from atlas and tangent data through metric, connection, curvature and geodesics to Gauss–Bonnet.', 'The total curvature of the case\'s surface computed numerically and matched to 2πχ.'),
    },
  },

  'research-and-expository-seminar': {
    doc: 'docs/math-term4-audit.md',
    outcomes: [
      o('ma503.literature', 'Find primary literature and trace results to their source.', ['QAA-MSOR 3.26'], [], [1], ['applied']),
      o('ma503.reading', 'Read definitions, theorem dependencies and notation precisely.', ['QAA-MSOR 3.14'], [], [2], ['applied']),
      o('ma503.reconstruct', 'Reconstruct omitted proof steps and supply examples.', ['QAA-MSOR 3.14', 'QAA-MSOR 3.24'], [], [3], ['applied']),
      o('ma503.revise', 'Write an expository note and revise it from peer review.', ['QAA-MSOR 3.26'], ['tw.voice', 'tw.lists'], [4], ['applied', 'final']),
      o('ma503.question', 'Pose research questions and judge their feasibility.', ['QAA-MSOR 3.14'], [], [5], ['final']),
      o('ma503.figures', 'Use figures, computation and citation reproducibly.', ['QAA-MSOR 3.17', 'QAA-MSOR 3.26'], ['tw.alttext', 'tw.markdown'], [6], ['applied']),
      o('ma503.talks', 'Give talks calibrated to the audience and handle questions.', ['QAA-MSOR 3.26'], [], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.821 front page.', fix: 'Each unit now links the 18.821 page on that part of the work (mathematical work, writing, revision, presentations), plus arXiv for literature.' },
      { what: 'No outside reader', why: 'Writing was judged only inside the course.', fix: 'Expository answers on Math Stack Exchange are judged by strangers; a reader outside the course should sign off on the final note.', url: 'https://math.stackexchange.com/' },
    ],
    benchmarks: [
      { id: 'ma503.mse', name: 'Math Stack Exchange expository answers with a positive score', how: 'Answer questions in the area of your note; count answers with a positive score or accepted.', max: 20, url: 'https://math.stackexchange.com/' },
      { id: 'ma503.reader', name: 'A mathematician outside the course checked the final note', how: 'Record 1 when an outside reader confirms the note is correct and complete.', max: 1, url: 'https://ocw.mit.edu/courses/18-821-project-laboratory-in-mathematics-spring-2013/pages/writing/revision-and-feedback/' },
    ],
    rubrics: {
      applied: [
        crit('Faithful reconstruction', 'The published theorem stated exactly, with every omitted step supplied and checked.', 'One step still skipped.', 'Statement or proof altered.'),
        crit('Examples and computation', 'Examples that illuminate each hypothesis, and computations reproducible from the note\'s files.', 'Examples without computation, or the reverse.', 'Neither.'),
        crit('Provenance and citation', 'Every result cited to its primary source, with the history traced.', 'Secondary citations only.', 'Uncited.'),
        crit('Revision from review', 'Peer review comments answered point by point and the note revised.', 'Some comments addressed.', 'No revision.'),
      ],
      final: [
        crit('Paper quality', 'A self-contained paper a peer can follow without the source, with definitions, examples and correct proofs.', 'Followable with the source.', 'Not followable.'),
        crit('Two calibrated talks', 'A specialist talk and a general talk, each pitched to its audience and timed.', 'One audience served.', 'Neither.'),
        crit('Questions', 'Questions about definitions, dependencies and novelty answered accurately.', 'Most answered.', 'Could not answer.'),
        crit('Honesty about novelty', 'Clear statement of what is new, what is exposition, and what remains open.', 'Overstated novelty once.', 'Exposition presented as new.'),
      ],
    },
  },

  'computational-mathematics': {
    doc: 'docs/math-term4-audit.md',
    outcomes: [
      o('ma504.sparse', 'Exploit sparsity and graph structure in matrices.', ['QAA-MSOR 3.16', 'QAA-MSOR 3.17'], ['cm.kmatrix'], [1], ['final']),
      o('ma504.iterative', 'Solve with iterative methods and preconditioners, and predict their convergence.', ['QAA-MSOR 3.16'], ['opt.gd', 'na.cond'], [2], ['final']),
      o('ma504.fd', 'Discretise by finite differences and prove consistency and stability.', ['QAA-MSOR 3.16'], ['pde.cfl', 'na.order'], [3], ['applied', 'final']),
      o('ma504.benchmark', 'Benchmark solvers on manufactured solutions and demonstrate convergence order.', ['QAA-MSOR 3.16', 'QAA-MSOR 3.17'], ['na.order'], [4], ['applied']),
      o('ma504.spectral', 'Use spectral methods and fast transforms.', ['QAA-MSOR 3.16'], ['cm.dft', 'fa.fourier'], [5], ['applied', 'final']),
      o('ma504.autodiff', 'Use automatic differentiation and optimisation interfaces.', ['QAA-MSOR 3.17'], ['mv.gradient'], [6], ['final']),
      o('ma504.performance', 'Profile cost, and make results reproducible with stated uncertainty.', ['QAA-MSOR 3.17', 'QAA-MSOR 3.26'], ['flops'], [7, 8], ['applied', 'final']),
    ],
    gaps: [
      { what: 'The course\'s resource skips three units', why: '18.085 (Summer 2020) has no iterative solvers (Unit 2), automatic differentiation (Unit 6) or performance (Unit 7).', fix: 'Those units read the matching weeks of 18.335J.', url: `${OCW}/18-335j-introduction-to-numerical-methods-spring-2019/pages/calendar/` },
      { what: 'Practice was unrelated', why: 'A Python accumulation question and FLOP counting.', fix: 'Practice now covers the second-difference matrix, the DFT, CFL stability and method order.' },
    ],
    benchmarks: [
      { id: 'ma504.midterm', name: 'MIT 18.085 (Summer 2020) midterm, against the solutions', how: 'Record your percentage.', max: 100, url: `${OCW}/18-085-computational-science-and-engineering-i-summer-2020/pages/exams/` },
      { id: 'ma504.final', name: 'MIT 18.085 (Summer 2020) final, against the solutions', how: 'Record your percentage.', max: 100, url: `${OCW}/18-085-computational-science-and-engineering-i-summer-2020/pages/exams/` },
    ],
    rubrics: {
      applied: verifiedSoftware('discretisation (sparse or spectral)', 'errors fall at the predicted rate as the grid is refined'),
      final: verifiedSoftware('solver package', 'results agree with an independent library (SciPy, FFTW) on shared problems'),
    },
  },

  'algebraic-number-theory': {
    doc: 'docs/math-term4-audit.md',
    outcomes: [
      o('ma511.fields', 'Work with number fields and algebraic integers.', ['QAA-MSOR 3.10', 'GRE-M Algebra'], ['alg2.degree', 'alg2.cyclotomic'], [1], ['final']),
      o('ma511.integers', 'Compute rings of integers, norms, traces and discriminants.', ['QAA-MSOR 3.10'], ['nt.disc'], [2], ['applied', 'final']),
      o('ma511.ideals', 'Factor ideals in Dedekind domains.', ['QAA-MSOR 3.10'], ['nt.twosquares'], [3], ['final']),
      o('ma511.compute', 'Compute number-field invariants with software and prove what the computation shows.', ['QAA-MSOR 3.17'], ['nt.legendre', 'nt.twosquares'], [4], ['applied']),
      o('ma511.splitting', 'Decide how primes split and ramify.', ['QAA-MSOR 3.10'], ['nt.legendre'], [5], ['applied', 'final']),
      o('ma511.units', 'Find units and class groups using Minkowski\'s bound.', ['QAA-MSOR 3.10'], ['nt.pell'], [6], ['applied', 'final']),
      o('ma511.local', 'Use valuations, completions and Hensel\'s lemma.', ['QAA-MSOR 3.10'], ['modpow', 'cr.crt'], [7], ['final']),
    ],
    gaps: [
      { what: 'A graduate resource for an undergraduate course', why: '18.785 (Fall 2021) is a graduate course built towards class field theory, adeles and Tate cohomology.', fix: 'Units 1–6 now read William Stein\'s free undergraduate text, Algebraic Number Theory: a Computational Approach; Unit 7 keeps 18.785\'s lectures on local fields.', url: 'https://wstein.org/books/ant/ant.pdf' },
      { what: 'Practice was elementary', why: 'GCDs, modular powers and primes.', fix: 'Practice now covers Legendre symbols, sums of two squares, Pell\'s equation, discriminants of quadratic fields and degrees of extensions.' },
    ],
    benchmarks: [
      { id: 'ma511.lmfdb', name: 'Number fields whose invariants you computed and that match LMFDB', how: 'Compute discriminant, class number and unit rank for ten fields by hand and with Sage or PARI; count those matching LMFDB.', max: 10, url: 'https://www.lmfdb.org/NumberField/' },
    ],
    rubrics: {
      applied: [
        crit('Invariants computed', 'Ring of integers, discriminant, splitting of small primes, units and class group computed for each chosen field.', 'Most invariants, one field incomplete.', 'Few invariants.'),
        crit('Software check', 'Every invariant matches Sage or PARI and the LMFDB entry for the field.', 'Checked against one source.', 'Unchecked.'),
        crit('Proofs of factorisation', 'The factorisation of each small prime proved (Dedekind–Kummer) and the class group bound proved with Minkowski\'s constant.', 'Stated from software, not proved.', 'Neither.'),
        crit('Error log', 'Every disagreement between hand and machine traced to its cause.', 'Disagreements noted.', 'Not logged.'),
      ],
      final: oralFinal('From number field and ring of integers, through ideals and ramification, to units, the class group and a local viewpoint.', 'Every numerical invariant in the dossier matched against LMFDB.'),
    },
  },

  'partial-differential-equations': {
    doc: 'docs/math-term4-audit.md',
    outcomes: [
      o('ma512.classify', 'Classify second-order PDEs and pose well-posed problems.', ['QAA-MSOR 3.10'], ['pde.classify'], [1], ['final']),
      o('ma512.transport', 'Solve transport equations by characteristics.', ['QAA-MSOR 3.10'], [], [2], ['final']),
      o('ma512.wave', 'Solve the wave equation and use energy and finite propagation speed.', ['QAA-MSOR 3.10'], ['fa.fourier'], [3], ['final']),
      o('ma512.simulate', 'Simulate a PDE against manufactured truth and verify a conservation or maximum principle.', ['QAA-MSOR 3.16', 'QAA-MSOR 3.17'], ['pde.cfl', 'pde.heat'], [4], ['applied']),
      o('ma512.heat', 'Solve diffusion equations and use the maximum principle.', ['QAA-MSOR 3.10'], ['pde.heat'], [5], ['applied', 'final']),
      o('ma512.laplace', 'Solve Laplace and Poisson equations with harmonic methods.', ['QAA-MSOR 3.10'], ['cm.kmatrix'], [6], ['final']),
      o('ma512.fourier', 'Use weak solutions, Fourier methods and discretisation.', ['QAA-MSOR 3.10', 'QAA-MSOR 3.16'], ['fa.fourier', 'de.laplace'], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.152 front page.', fix: 'Each unit now links the 18.152 lecture notes that cover it.' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers classification, the heat equation by separation of variables, CFL stability and Fourier coefficients.' },
    ],
    benchmarks: [
      { id: 'ma512.midterm', name: 'MIT 18.152 (Fall 2011) midterm, against the solutions', how: 'Record your percentage.', max: 100, url: `${OCW}/18-152-introduction-to-partial-differential-equations-fall-2011/pages/exams/` },
    ],
    rubrics: {
      applied: [
        crit('Manufactured truth', 'An exact solution chosen first and the forcing derived from it, so the error is known exactly.', 'A known solution without forcing.', 'No ground truth.'),
        crit('Convergence', 'Observed order under grid refinement matches the scheme\'s order, with the CFL limit respected and its violation shown.', 'Converges, order not measured.', 'Not verified.'),
        crit('Structure preserved', 'Energy conserved (wave) or the maximum principle respected (heat, Laplace) to discretisation accuracy.', 'Checked loosely.', 'Not checked.'),
        crit('Limits stated', 'Where the method fails (stiffness, shocks, boundary layers) shown and explained.', 'Mentioned only.', 'Not addressed.'),
      ],
      final: examFinal('the 18.152 midterm will do as a check', 'One PDE case taken from classification and well-posed data, through an analytic estimate, to a numerical method and its verification.', 'The analytic estimate (energy, maximum principle) checked against the simulation.'),
    },
  },

  'combinatorial-optimization': {
    doc: 'docs/math-term4-audit.md',
    outcomes: [
      o('ma513.greedy', 'Prove greedy algorithms correct for shortest paths and spanning trees.', ['QAA-MSOR 3.12', 'QAA-MSOR 3.14'], ['mst', 'dijkstra'], [1], ['final']),
      o('ma513.flow', 'Compute maximum flows and certify them with minimum cuts.', ['QAA-MSOR 3.12'], ['alg.maxflow'], [2], ['applied', 'final']),
      o('ma513.matching', 'Solve matching and assignment problems with certificates.', ['QAA-MSOR 3.12'], ['comb.matching', 'co.assign'], [3], ['applied', 'final']),
      o('ma513.certified', 'Implement a solver that emits independently checkable certificates.', ['QAA-MSOR 3.17'], ['co.assign'], [4], ['applied']),
      o('ma513.matroids', 'Recognise matroids and explain when greedy is optimal.', ['QAA-MSOR 3.10'], ['mst'], [5], ['final']),
      o('ma513.ip', 'Formulate integer programs and analyse their relaxations.', ['QAA-MSOR 3.12'], ['opt.lp', 'knapsack'], [6], ['final']),
      o('ma513.approx', 'Reason about NP-hardness, approximation ratios and integrality gaps.', ['QAA-MSOR 3.12', 'QAA-MSOR 3.13'], ['co.tsp', 'alg.vc'], [7], ['final']),
    ],
    gaps: [
      { what: 'The course\'s notes start late and skip a unit', why: '18.433 (Fall 2003) begins with matchings, so Unit 1 (shortest paths, spanning trees) has no notes; its matroid lectures are marked "not yet available".', fix: 'Unit 1 reads Applied Combinatorics Chapter 12; Unit 5 reads Goemans\'s 2015 18.433 notes on matroids.', url: 'https://math.mit.edu/~goemans/18433S15/matroid-notes.pdf' },
      { what: 'Practice was borrowed', why: 'MST, Dijkstra, knapsack and intervals from the competitive-programming track.', fix: 'Practice now adds bipartite matching, assignment, small TSP tours and LP vertices, each checked by a second algorithm.' },
    ],
    benchmarks: [
      { id: 'ma513.networkx', name: 'Flow and matching instances where your solver matches NetworkX, with a verified certificate', how: 'Run your solver and NetworkX on ten instances, including infeasible and degenerate ones; count agreements whose certificate your checker accepts.', max: 10, url: 'https://networkx.org/documentation/stable/reference/algorithms/flow.html' },
      { id: 'ma513.miplib', name: 'MIPLIB "easy" instances solved to the known optimum', how: 'Count instances matching MIPLIB\'s published optimum.', max: 10, url: 'https://miplib.zib.de/tag_easy.html' },
    ],
    rubrics: {
      applied: [
        crit('Solver correctness', 'Correct on random, infeasible, degenerate and adversarial instances, checked against a second implementation.', 'Correct on typical instances only.', 'Incorrect.'),
        crit('Certificates', 'Every answer comes with a certificate (a cut, a cover, dual potentials) that a separate checker verifies.', 'Certificates for some outputs.', 'No certificates.'),
        crit('Complexity', 'Running time analysed and confirmed by measurements across sizes.', 'Analysed, not measured.', 'Neither.'),
        crit('Error log', 'Every bug found by the checker logged with its fix.', 'A log without fixes.', 'No log.'),
      ],
      final: oralFinal('A formulation, its structural theorem (max-flow min-cut, König, or a matroid exchange), correctness and complexity, a certificate, and its relaxation\'s quality.', 'The dossier\'s solver outputs checked by an independent certificate checker.'),
    },
  },
};
