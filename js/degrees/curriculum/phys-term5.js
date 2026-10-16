/**
 * Physics, Term 5 — audited as Terms 0–4 were.
 *
 * Outside graders: published values (the muon lifetime, Pantheon+, GW150914,
 * the Z mass, the Lieb–Wu energy); 8.701 problem sets and Bayesian Data
 * Analysis exercises with solutions; posteriordb reference posteriors; ORI's
 * research-integrity simulation. Evidence in docs/phys-term5-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';
const GRE = 'https://www.ets.org/gre/test-takers/subject-tests/about/content-structure.html';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });
const oralFinal = (artifact, evidence) => [
  crit('Complete package', `${artifact} released with raw data, code, calibration and provenance, so another person can rerun it.`, 'Released with gaps.', 'Not released.'),
  crit('Evidence chain', evidence, 'Evidence present, gaps in traceability.', 'Claims without evidence.'),
  crit('Uncertainty and alternatives', 'Uncertainties budgeted, alternative explanations tested, and negative results reported.', 'Uncertainty on the main result only.', 'None.'),
  crit('Oral defense', 'Questions answered from the evidence, with errors found and corrected on the spot or afterwards.', 'Answers partly from memory, not evidence.', 'Could not defend.'),
];

export const PHYS_TERM5 = {
  'advanced-experimental-physics-2-independent-investigation': {
    doc: 'docs/phys-term5-audit.md',
    outcomes: [
      o('lb601.ready', 'Set measurement requirements and roles, and pass a readiness review.', ['AAPT Design'], ['lab.trials', 'st.power'], [1], ['applied']),
      o('lb601.calibrate', 'Model and commission an apparatus with traceable calibration.', ['AAPT Technical and Practical Laboratory Skills'], ['lab.fit', 'lab.propagate'], [2], ['applied']),
      o('lb601.systematics', 'Build a noise budget and hunt drifts, backgrounds and systematic errors.', ['GRE-P Laboratory Methods'], ['el.ktc', 'lab.weighted', 'lab.chi2'], [3], ['applied', 'final']),
      o('lb601.blind', 'Run a blind pilot and cross-check it with an independent analysis.', ['AAPT Data Analysis and Visualization'], ['lab.chi2', 'st.permtest'], [4], ['applied']),
      o('lb601.provenance', 'Automate acquisition with data-quality checks, metadata and provenance.', ['AAPT Technical and Practical Laboratory Skills'], ['el.alias', 'lab.adc'], [5], ['final']),
      o('lb601.uncertainty', 'Synthesise an uncertainty budget and test it adversarially.', ['AAPT Data Analysis and Visualization'], ['lab.propagate', 'lab.chi2'], [6], ['final']),
      o('lb601.replicate', 'Replicate, resolve discrepancies and write it up technically.', ['AAPT Communication'], ['lab.weighted', 'pp.pvalue'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource lists experiments, not methods', why: 'Junior Lab posts lab guides, notebook rules and report resources, but nothing on blind analysis, uncertainty budgets or calibration traceability.', fix: 'Units add the NIST/SEMATECH handbook on measurement processes, the JCGM Guide to the Expression of Uncertainty, and the Particle Data Group\'s statistics review.', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes χ² goodness of fit (checked by integrating the χ² density) and significance (checked through the incomplete gamma function), with the laboratory skills from earlier terms.' },
    ],
    benchmarks: [
      { id: 'lb601.pdg', name: 'Your measured value agrees with the Particle Data Group\'s', how: 'For a Junior Lab measurement with a PDG value (for example the muon lifetime, 2.1970 μs), record 1 if the PDG value lies within your stated uncertainty.', max: 1, url: `${OCW}/8-13-14-experimental-physics-i-ii-junior-lab-fall-2016-spring-2017/pages/experiments/` },
      { id: 'lb601.rerun', name: 'Someone else reproduces your headline number from your archive alone', how: 'Hand the archive to another person with no other help; record 1 if they reproduce the number.', max: 1, url: 'https://book.the-turing-way.org/reproducible-research/reproducible-research' },
    ],
    rubrics: {
      applied: [
        crit('Commissioning', 'The apparatus modelled, commissioned step by step, and calibrated against a traceable standard.', 'Commissioned without a model or traceability.', 'Not commissioned.'),
        crit('Blind pilot', 'Analysis choices fixed before unblinding, and the pilot analysed independently by two people or two methods.', 'Blinded, single analysis.', 'Not blinded.'),
        crit('Data quality and hazards', 'Automated data-quality checks and a hazard review in place before data taking.', 'One of the two.', 'Neither.'),
        crit('Readiness review', 'A written readiness review answered point by point, with corrections made.', 'Reviewed, not all points answered.', 'No review.'),
      ],
      final: oralFinal('A publication-grade experiment or replication', 'Raw data, calibration, analysis code and the reviewer response tie every number in the paper to its source.'),
    },
  },

  'data-intensive-and-bayesian-physics': {
    doc: 'docs/phys-term5-audit.md',
    outcomes: [
      o('da601.bayes', 'Update with priors and likelihoods, and check the posterior.', ['AAPT Data Analysis and Visualization'], ['bay.beta', 'bay.normal', 'pr.bayes'], [1], ['final']),
      o('da601.sampling', 'Sample posteriors by MCMC and diagnose convergence.', ['AAPT Data Analysis and Visualization', 'QAA-MSOR 3.16'], ['bay.ess', 'cp.mcerror'], [2], ['applied', 'final']),
      o('da601.hierarchy', 'Build hierarchical models with partial pooling.', ['AAPT Modeling'], ['bay.normal', 'lab.weighted'], [3], ['final']),
      o('da601.openinf', 'Infer a physical parameter from open data, with posterior predictive checks.', ['AAPT Data Analysis and Visualization', 'AAPT Modeling'], ['bay.normal', 'lab.chi2', 'stoch.mle'], [4], ['applied']),
      o('da601.signals', 'Analyse time series and spectra with correlated noise.', ['GRE-P Laboratory Methods'], ['cm.dft', 'el.alias', 'bay.ess'], [5], ['final']),
      o('da601.selection', 'Calibrate classifiers and correct for selection effects and domain shift.', ['AAPT Data Analysis and Visualization'], ['st.ipw', 'eth.baserate'], [6], ['final']),
      o('da601.inverse', 'Solve inverse problems and unfold, knowing the limits of causal claims.', ['AAPT Data Analysis and Visualization'], ['lab.fit', 'st.adjust'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'The resource has no computation', why: '18.650 (Fall 2016) posts slides on frequentist and Bayesian inference, but nothing on MCMC, hierarchical models, model checking, time series or unfolding, and its problem sets have no solutions.', fix: 'Units read Gelman et al.\'s free Bayesian Data Analysis (3rd edition) by chapter, the GWOSC tutorials for signals, and the Particle Data Group\'s statistics review; the book\'s solutions become a benchmark.', url: 'https://sites.stat.columbia.edu/gelman/book/' },
      { what: 'Practice was borrowed', why: 'The course drew on AI-track Bayes and statistics questions.', fix: 'Practice now includes beta–binomial updating (checked by the binomial identity), normal updating (checked on a grid) and effective sample size (checked with the exact autocovariance sum).' },
    ],
    benchmarks: [
      { id: 'da601.bda', name: 'Bayesian Data Analysis selected exercises, against the published solutions', how: 'Record the percentage you get right.', max: 100, url: 'https://sites.stat.columbia.edu/gelman/book/solutions3.pdf' },
      { id: 'da601.posteriordb', name: 'Your sampler reproduces a posteriordb reference posterior', how: 'Pick a posterior with reference draws; record 1 if your means and standard deviations agree within their Monte Carlo errors.', max: 1, url: 'https://github.com/stan-dev/posteriordb' },
    ],
    rubrics: {
      applied: [
        crit('Model and data', 'An open dataset with documented provenance, and a generative model whose every term is justified physically.', 'Model without justification.', 'No model.'),
        crit('Convergence', 'Several chains run, with R̂, effective sample size and trace plots reported.', 'One diagnostic.', 'None.'),
        crit('Prior and selection sensitivity', 'Results shown under alternative priors and with selection effects modelled or bounded.', 'One of the two.', 'Neither.'),
        crit('Predictive checks', 'Posterior predictive checks run, and failures traced to the model.', 'Run, failures not explained.', 'Not run.'),
      ],
      final: oralFinal('A probabilistic analysis', 'Model criticism, independent checks and calibration each tied to code that regenerates them.'),
    },
  },

  'physics-society-ethics-and-professional-practice': {
    doc: 'docs/phys-term5-audit.md',
    outcomes: [
      o('pf601.integrity', 'Apply professional duties and research integrity to real cases.', ['AAPT Communication'], [], [1], ['final']),
      o('pf601.publication', 'Handle authorship, peer review, conflicts of interest and corrections.', ['AAPT Communication'], [], [2], ['final']),
      o('pf601.risk', 'Assess risk and safety culture, using regulation and precaution.', ['AAPT Technical and Practical Laboratory Skills'], ['nu.shield'], [3], ['applied', 'final']),
      o('pf601.dualuse', 'Write a stakeholder decision memo for a dual-use case.', ['AAPT Communication'], [], [4], ['applied']),
      o('pf601.communicate', 'Communicate uncertainty and answer misinformation.', ['AAPT Communication'], ['eth.baserate', 'pr.bayes'], [5], ['final']),
      o('pf601.energy', 'Quantify energy, climate, radiation and security trade-offs, and who bears them.', ['AAPT Modeling'], ['nu.shield', 'pt.carnot', 'mod.pi'], [6], ['applied', 'final']),
      o('pf601.career', 'Plan a career, collaborate inclusively and stay accountable.', ['AAPT Communication'], [], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource cannot be mapped', why: 'The NPTEL course page loads its syllabus only in a browser, and it is an engineering-ethics course with no physics cases.', fix: 'Units read the APS Guidelines on Ethics, the National Academies\' On Being a Scientist, the Franck Report, the IPCC\'s uncertainty guidance, MacKay\'s Sustainable Energy and the Phys21 report; NPTEL stays linked for its videos.', url: 'https://www.aps.org/about/governance/statements/ethics' },
    ],
    benchmarks: [
      { id: 'pf601.ori', name: 'ORI\'s The Lab: avoiding research misconduct', how: 'Play through every character\'s path in the Office of Research Integrity\'s interactive; record 1 when each ends without misconduct.', max: 1, url: 'https://ori.hhs.gov/thelab' },
    ],
    rubrics: {
      applied: [
        crit('Stakeholders and duties', 'Every affected group named, with the duties owed to each and where they conflict.', 'Main stakeholders only.', 'None.'),
        crit('Technical core', 'The physics quantified (dose, energy, yield or detection range) with uncertainties and a check.', 'Described, not quantified.', 'Missing.'),
        crit('Options and safeguards', 'Realistic options compared, with safeguards and who would enforce them.', 'One option.', 'None.'),
        crit('Recommendation', 'A clear recommendation, the evidence that would change it, and its distributive effects.', 'Recommendation without conditions.', 'None.'),
      ],
      final: [
        crit('Evidence under challenge', 'Technical claims defended from sources and numbers when challenged.', 'Defended from opinion.', 'Not defended.'),
        crit('Values made explicit', 'Conflicting values named and the trade-off argued openly.', 'Values implicit.', 'Ignored.'),
        crit('Uncertainty communicated', 'Uncertainty stated in calibrated language, and new evidence incorporated during the hearing.', 'Stated, not updated.', 'Absent.'),
        crit('Professional conduct', 'Respectful, accurate and accountable throughout, with corrections acknowledged.', 'Mostly.', 'No.'),
      ],
    },
  },

  'senior-research-thesis-and-defense': {
    doc: 'docs/phys-term5-audit.md',
    outcomes: [
      o('rs602.scope', 'Revise the proposal and agree scope and governance with a mentor.', ['AAPT Design'], [], [1], ['applied']),
      o('rs602.baseline', 'Synthesise the literature and reproduce a published baseline.', ['AAPT Constructing Knowledge'], ['lab.weighted', 'lab.chi2'], [2], ['applied']),
      o('rs602.pilot', 'Implement the method and show pilot evidence of readiness.', ['AAPT Design'], ['lab.trials', 'st.power'], [3], ['applied']),
      o('rs602.rescope', 'Run a midpoint review and rescope from evidence.', ['AAPT Design'], [], [4], ['applied']),
      o('rs602.execute', 'Execute, verify and quantify the uncertainty of the full analysis.', ['AAPT Data Analysis and Visualization'], ['lab.propagate', 'lab.chi2'], [5], ['final']),
      o('rs602.adversarial', 'Test results adversarially, replicate, and report negative results.', ['AAPT Data Analysis and Visualization'], ['pp.pvalue', 'st.multiple'], [6], ['final']),
      o('rs602.write', 'Write the thesis, preserve its artefacts and respond to reviewers.', ['AAPT Communication'], [], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource is a short writing course', why: '2.ThA (IAP 2007) is a mechanical-engineering thesis-writing workshop: proposal, structure, oral presentations. It has nothing on baselines, verification or uncertainty.', fix: 'Units add ReScience C for reproducing a baseline, the NIST/SEMATECH handbook, the JCGM uncertainty guide, the PDG statistics review and the Turing Way.', url: 'https://rescience.github.io/' },
    ],
    benchmarks: [
      { id: 'rs602.baseline', name: 'Your reproduced baseline agrees with the published number', how: 'Record 1 if the published value lies within your reproduction\'s uncertainty, or the discrepancy is explained and documented.', max: 1, url: 'https://rescience.github.io/' },
      { id: 'rs602.archive', name: 'An outside reader reruns your archive and regenerates the main figure', how: 'Record 1 if they succeed from the archive and its instructions alone.', max: 1, url: 'https://book.the-turing-way.org/reproducible-research/reproducible-research' },
    ],
    rubrics: {
      applied: [
        crit('Baseline reproduced', 'A published result reproduced, with any discrepancy investigated and explained.', 'Reproduced roughly.', 'Not reproduced.'),
        crit('Pilot result', 'A pilot that shows the method works on a known case, with its uncertainty.', 'Pilot without uncertainty.', 'No pilot.'),
        crit('Risk register and decisions', 'Risks rated and updated, and each change of plan logged with its evidence.', 'Register without a decision log.', 'Neither.'),
        crit('Data and code audit', 'Data and code audited by someone else, with findings fixed and an evidence-based rescope if needed.', 'Self-audited.', 'Not audited.'),
      ],
      final: oralFinal('The thesis and its reproducibility archive', 'Sources, methods, data, code and failed approaches documented so each claim can be traced and rerun.'),
    },
  },

  'cosmology-and-gravitational-waves': {
    doc: 'docs/phys-term5-audit.md',
    outcomes: [
      o('gw601.metric', 'Use the FRW metric, redshift and cosmological distances.', ['GRE-P Specialized Topics'], ['cos.distance', 'as.distance'], [1], ['final']),
      o('gw601.friedmann', 'Solve the Friedmann equations for expansion histories and horizons.', ['GRE-P Specialized Topics'], ['cos.age', 'cos.distance'], [2], ['applied', 'final']),
      o('gw601.thermal', 'Trace the thermal history: nucleosynthesis, recombination and the CMB.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['pt.planck', 'pt.boltzmann'], [3], ['final']),
      o('gw601.fit', 'Fit an expansion history to supernova or background data using its covariance.', ['AAPT Data Analysis and Visualization', 'AAPT Modeling'], ['cos.distance', 'lab.chi2', 'bay.normal'], [4], ['applied']),
      o('gw601.structure', 'Describe perturbation growth, dark matter and large-scale structure.', ['GRE-P Specialized Topics'], ['pm.orbit', 'as.binary'], [5], ['final']),
      o('gw601.waves', 'Derive gravitational waves: how they are made, travel and are polarised.', ['GRE-P Special Relativity'], ['gw.strain', 'gw.chirp'], [6], ['final']),
      o('gw601.detect', 'Reason about compact-binary signals, detectors, selection and multimessenger tests.', ['AAPT Data Analysis and Visualization'], ['gw.chirp', 'pp.pvalue', 'cm.dft'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource is a graduate GR course', why: '8.962 (Spring 2020) is MIT\'s graduate general relativity: two lectures on cosmology, none on thermal history or structure formation, and lecture summaries rather than notes.', fix: 'Units read Tong\'s free Cosmology and General Relativity notes, with 8.962\'s lecture videos and problem sets (which have hints) kept; data units use Pantheon+ and GWOSC.', url: 'https://davidtong.org/teaching/cosmology/' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes luminosity distances (checked by integrating the Friedmann equation in time), the age of the universe (checked by quadrature), inspiral times (checked with Peters\' orbital decay) and strain (checked with the quadrupole formula).' },
    ],
    benchmarks: [
      { id: 'gw601.pantheon', name: 'Your Ω_m from Pantheon+ agrees with the published fit', how: 'Fit flat ΛCDM to Pantheon+ with its covariance; record 1 if your Ω_m agrees with Brout et al. (2022), 0.334 ± 0.018, within the combined uncertainty.', max: 1, url: 'https://arxiv.org/abs/2202.04077' },
      { id: 'gw601.chirp', name: 'Your GW150914 chirp mass lies within the published interval', how: 'Estimate the chirp mass from GWOSC strain; record 1 if it falls inside the event page\'s 90% credible interval.', max: 1, url: 'https://gwosc.org/eventapi/html/GWTC-1-confident/GW150914/v3/' },
    ],
    rubrics: {
      applied: [
        crit('Data and covariance', 'The public dataset used with its full covariance, and the calibration choices recorded.', 'Diagonal errors only.', 'No data.'),
        crit('Model fit', 'An expansion-history model fitted, with posteriors or confidence regions for its parameters.', 'Best fit only.', 'Not fitted.'),
        crit('Degeneracies and selection', 'Parameter degeneracies shown, and selection effects or Malmquist bias discussed quantitatively.', 'One of the two.', 'Neither.'),
        crit('Independent check', 'The distances recomputed independently (for example by integrating the Friedmann equation) and compared with a published fit.', 'Compared loosely.', 'None.'),
      ],
      final: oralFinal('A joint cosmology or gravitational-wave inference', 'The chain from relativistic model through detector or survey response to the posterior is documented and rerunnable.'),
    },
  },

  'quantum-materials-and-many-body-physics': {
    doc: 'docs/phys-term5-audit.md',
    outcomes: [
      o('mb601.fock', 'Use second quantisation, Fock space and many-body observables.', ['GRE-P Quantum Mechanics'], ['mb.fock'], [1], ['final']),
      o('mb601.lattice', 'Build tight-binding lattice models and use their symmetry.', ['GRE-P Specialized Topics'], ['cmp.effmass', 'mb.ssh'], [2], ['final']),
      o('mb601.fermiliquid', 'Explain Fermi liquids, quasiparticles and response.', ['GRE-P Specialized Topics'], ['sm.fermi', 'cmp.intrinsic'], [3], ['final']),
      o('mb601.numerics', 'Diagonalise a finite lattice model and separate finite-size effects from physics.', ['AAPT Modeling'], ['mb.hubbard2', 'mb.ssh', 'sm.ising'], [4], ['applied']),
      o('mb601.magnetism', 'Treat interactions, magnetism and collective order.', ['GRE-P Specialized Topics'], ['mb.hubbard2', 'sm.ising'], [5], ['applied', 'final']),
      o('mb601.super', 'Explain superconductivity: pairing, the gap and its signatures.', ['GRE-P Specialized Topics'], ['mb.bcs'], [6], ['final']),
      o('mb601.topology', 'Identify topological bands and edge states.', ['GRE-P Specialized Topics'], ['mb.ssh'], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource is graduate level and incomplete', why: '8.511 (Fall 2004) is MIT\'s graduate Theory of Solids I: it assumes second quantisation, has no Fermi-liquid theory or magnetism beyond Hubbard, and posts no solutions.', fix: 'Units add Tong\'s QFT Chapter 2 for Fock space, 8.512 for Fermi liquids and magnetism, and TU Delft\'s free Topology in Condensed Matter course.', url: 'https://topocondmat.org/' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes counting Fock states (checked by enumeration), the two-site Hubbard model (checked by building the Fock-space Hamiltonian and diagonalising it), the SSH chain (checked by Sturm counts) and the BCS gap (checked by solving the gap equation).' },
    ],
    benchmarks: [
      { id: 'mb601.liebwu', name: 'Exact diagonalisation of the 1-D Hubbard ring approaches the Lieb–Wu energy', how: 'Diagonalise half-filled rings of increasing length at U = 4t and extrapolate; record 1 if you reach the Bethe-ansatz energy per site within your extrapolation error.', max: 1, url: 'https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.20.1445' },
      { id: 'mb601.gre', name: 'GRE Physics practice test: specialised topics', how: 'Record the percentage right on those questions.', max: 100, url: GRE },
    ],
    rubrics: {
      applied: [
        crit('Hamiltonian built and tested', 'The lattice Hamiltonian built in a many-body basis and checked against a solvable limit (U = 0 or t = 0).', 'Built, not checked.', 'Not built.'),
        crit('Parameter map', 'An observable (gap, magnetisation, correlation) mapped across parameters.', 'One parameter value.', 'None.'),
        crit('Finite-size analysis', 'Results at several sizes and boundary conditions, with extrapolation and its error.', 'Several sizes, no extrapolation.', 'One size.'),
        crit('Claims separated', 'Physical claims separated from finite-size artefacts, and compared with mean-field theory.', 'Partly.', 'Not separated.'),
      ],
      final: oralFinal('A candidate quantum-material phase', 'Hamiltonian, symmetry, approximation, computation and experimental signature linked step by step, with competing explanations tested.'),
    },
  },

  'particle-physics-and-the-standard-model': {
    doc: 'docs/phys-term5-audit.md',
    outcomes: [
      o('pp601.kinematics', 'Use relativistic kinematics, cross sections and decay rates.', ['GRE-P Special Relativity'], ['pp.threshold', 'pp.invmass', 'pm.invariant'], [1], ['final']),
      o('pp601.symmetry', 'Apply symmetries and conservation laws, and reason with Feynman diagrams.', ['GRE-P Specialized Topics'], ['q2.addition'], [2], ['final']),
      o('pp601.hadrons', 'Classify leptons, quarks and hadrons, and explain the strong interaction.', ['GRE-P Specialized Topics'], ['q2.addition', 'mb.fock'], [3], ['final']),
      o('pp601.reconstruct', 'Reconstruct a resonance from open collider data and test it against background.', ['AAPT Data Analysis and Visualization'], ['pp.invmass', 'pp.pvalue', 'lab.fit'], [4], ['applied']),
      o('pp601.electroweak', 'Explain electroweak interactions, neutrinos and flavour.', ['GRE-P Specialized Topics'], ['pp.threshold'], [5], ['final']),
      o('pp601.higgs', 'Explain the Higgs mechanism and where masses come from.', ['GRE-P Specialized Topics'], ['pp.invmass'], [6], ['final']),
      o('pp601.stats', 'Use detectors, triggers, likelihoods and limits to judge discovery claims.', ['AAPT Data Analysis and Visualization', 'GRE-P Laboratory Methods'], ['pp.pvalue', 'st.multiple', 'lab.chi2'], [7], ['applied', 'final']),
    ],
    gaps: [
      { what: 'No open data or statistics', why: '8.701 (Fall 2020) has full slides and problem sets with solutions, but no collider dataset to analyse and little on likelihoods and limits.', fix: 'Unit 4 uses CMS\'s public dimuon events from the CERN Open Data portal; Unit 7 reads the Particle Data Group\'s statistics review.', url: 'https://opendata.cern.ch/record/700' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now includes invariant masses (checked from explicit four-vectors), production thresholds (checked by bisecting on √s) and the significance of an excess (checked through the incomplete gamma function).' },
    ],
    benchmarks: [
      { id: 'pp601.psets', name: 'MIT 8.701 problem sets 1–6, against the solutions', how: 'Record your average percentage.', max: 100, url: `${OCW}/8-701-introduction-to-nuclear-and-particle-physics-fall-2020/pages/assignments/` },
      { id: 'pp601.peak', name: 'Your reconstructed resonance mass agrees with the PDG value', how: 'Fit the J/ψ (3.0969 GeV) or Z (91.188 GeV) peak in the CMS dimuon data; record 1 if the PDG mass lies within your uncertainty.', max: 1, url: 'https://opendata.cern.ch/record/700' },
    ],
    rubrics: {
      applied: [
        crit('Reconstruction', 'The observable reconstructed from four-vectors, with selection cuts justified and their efficiency estimated.', 'Reconstructed, cuts unjustified.', 'Not reconstructed.'),
        crit('Signal and background', 'Signal and background hypotheses fitted, with the likelihood and its uncertainty.', 'Peak found by eye.', 'No comparison.'),
        crit('Calibration', 'Momentum scale and resolution checked against a known resonance.', 'Mentioned only.', 'Not checked.'),
        crit('Significance and look-elsewhere', 'Local and global significance reported, with the look-elsewhere effect handled.', 'Local significance only.', 'None.'),
      ],
      final: oralFinal('A Standard Model measurement or search', 'Symmetry and process through detector response to statistical evidence and systematics, each step reproducible.'),
    },
  },
};
