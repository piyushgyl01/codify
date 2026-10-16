/**
 * Computer Science, Term 6 — the course design, audited against primary
 * sources (October 2026), as Terms 1–5 were.
 *
 * Outside graders: Khan Academy's statistics course grades its unit tests;
 * OSF timestamps preregistrations; Mitsuba 3 renders the reference a ray
 * tracer is compared with; CIFAR-10-C and SQuAD's official script score
 * vision and language models; PBBS ships a correctness checker for every
 * benchmark and ThreadSanitizer finds races; Android's Accessibility Test
 * Framework and Macrobenchmark judge apps; Project Wycheproof's vectors and
 * the Cryptopals challenges judge cryptographic code.
 *
 * Sources: CS2023 (MSF-Statistics, GIT-*, AI-Vision, AI-NLP, PDC-*,
 * SPD-Mobile, SEC-Crypto); Data 8; COS 598D; CS184; CS231n; CS224N; CMU
 * 15-210; Android Basics with Compose; Boneh's Online Cryptography Course.
 * Evidence in docs/cs-term6-audit.md.
 */

const o = (id, text, cs2023, skills, units, assessed = []) => ({ id, text, cs2023, skills, units, assessed });
const anchor = (full, part, none) => ({ full, part, none });
const py = s => s.trim();

export const CS_TERM6 = {
  'data-science': {
    doc: 'docs/cs-term6-audit.md',
    outcomes: [
      o('cs601.provenance', 'Record where data came from and make every step from raw data to result reproducible.', ['DM-Data', 'MSF-Statistics'], ['db.sql'], [1, 2], ['midterm', 'final']),
      o('cs601.sample', 'Reason about samples: random designs, biased designs and simulation.', ['MSF-Statistics', 'MSF-Probability'], ['st.ipw', 'pr.clt'], [3], ['midterm']),
      o('cs601.estimate', 'Estimate with confidence intervals, the bootstrap included.', ['MSF-Statistics'], ['st.ci'], [4], ['midterm']),
      o('cs601.test', 'Test hypotheses and control error rates across many tests.', ['MSF-Statistics'], ['st.permtest', 'st.multiple'], [5]),
      o('cs601.predict', 'Measure association and predict with regression, without reading it as cause.', ['MSF-Statistics', 'AI-ML'], ['linreg', 'st.simpson'], [6]),
      o('cs601.classify', 'Evaluate classifiers with error slices and fairness checks.', ['AI-ML', 'AI-SEP'], ['metrics', 'eth.fairness'], [7], ['final']),
      o('cs601.report', 'Report findings with honest uncertainty and a clear non-causal boundary.', ['SEP-Communication', 'MSF-Statistics'], ['st.effect'], [8], ['final']),
    ],
    gaps: [
      { what: 'Practice was borrowed from the AI track', why: 'It drilled forecasting and evaluation metrics but not intervals, tests, sampling bias or Simpson\'s paradox.', fix: 'Practice now covers each, checked against Python\'s statistics module and exact enumeration.' },
      { what: 'The audit had no answer key', why: 'The midterm\'s population has a known mean, and the biased design a known bias, but neither was stated.', fix: 'The answer checks below derive both from the generating process; your simulation should land within its standard error of them.' },
      { what: 'Nothing outside graded the statistics', why: 'Data 8\'s textbook has no grader for outside learners.', fix: 'Khan Academy\'s AP Statistics course grades its exercises and unit tests on inference, sampling and regression.', url: 'https://www.khanacademy.org/math/ap-statistics' },
    ],
    benchmarks: [
      { id: 'cs601.khan', name: 'Khan Academy AP Statistics: course mastery', how: 'Record the course mastery percentage Khan Academy shows.', max: 100, url: 'https://www.khanacademy.org/math/ap-statistics' },
      { id: 'cs601.kaggle', name: 'Kaggle Titanic: leaderboard accuracy from your own pipeline', how: 'Record Kaggle\'s score as a percentage, with your evaluation frozen before you submit.', max: 100, url: 'https://www.kaggle.com/competitions/titanic' },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs601.mid.mean', q: 'What is the expected population mean of outcome under the generating process?', answer: 9, tol: 0.001,
          python: py(`from fractions import Fraction as F
# age uniform on 18..70, group 1 with probability 0.4, noise with mean 0
print(float(sum(F(1, 53) * p * (5 + F('0.08') * a + F('1.2') * g) for a in range(18, 71) for g, p in ((0, F('0.6')), (1, F('0.4'))))))`) },
        { id: 'cs601.mid.sd', q: 'What is the population standard deviation of outcome? (4 decimal places)', answer: 2.4173, tol: 0.0001,
          python: py(`import math
m = [(5 + 0.08 * a + 1.2 * g, (0.4 if g else 0.6) / 53) for a in range(18, 71) for g in (0, 1)]
mu = sum(x * p for x, p in m)
# law of total variance: spread of the means plus the noise variance 4
print(math.sqrt(sum(p * (x - mu) ** 2 for x, p in m) + 4))`) },
        { id: 'cs601.mid.biased', q: 'If records with outcome > 10 are twice as likely to be sampled (inclusion probabilities are small, so doubled odds ≈ doubled probability), what mean does the biased sample estimate? (2 decimal places)', answer: 9.66, tol: 0.01,
          python: py(`from statistics import NormalDist
# integrate the outcome on a fine grid, counting every record above 10 twice
N = NormalDist(); h = 0.01; num = den = 0.0
for a in range(18, 71):
    for g, pg in ((0, 0.6), (1, 0.4)):
        m = 5 + 0.08 * a + 1.2 * g
        for i in range(-800, 801):
            y = m + 2 * i * h; p = pg / 53 * N.pdf(i * h) * h; wt = 2 if y > 10 else 1
            num += wt * y * p; den += wt * p
print(num / den)`) },
      ],
    },
    anchors: {
      'midterm/Data provenance': anchor('Generator versioned with PCG64 seed 601; the population\'s mean (about 9.0) and SD (about 2.42) validated against the design.', 'Data generated, not validated.', 'Unknown provenance.'),
      'midterm/Inferential correctness': anchor('The simple random sample\'s interval covers the true mean; the biased sample\'s bias (about +0.66) is measured and explained, and reweighting by 1/2 above 10 removes it.', 'Correct interval, bias reported but not explained.', 'Biased estimate presented as unbiased.'),
      'midterm/Reproducibility': anchor('One notebook reruns from the seed to every number, including repeated-sampling simulations of coverage.', 'Main numbers rerun; simulations do not.', 'Cannot be rerun.'),
      'midterm/Claim discipline': anchor('The comparison preregistered before sampling; each claim in the ledger has its uncertainty.', 'Ledger present, not preregistered.', 'Claims without uncertainty.'),
      'final/Data and method integrity': anchor('Public data with licence and provenance; cleaning steps scripted and justified.', 'Manual steps remain.', 'Undocumented data.'),
      'final/Statistical validity': anchor('Intervals and tests appropriate to the design, with multiple comparisons controlled.', 'Mostly right; one test misapplied.', 'Invalid inference.'),
      'final/Evaluation and fairness': anchor('Evaluation frozen before modelling; errors sliced by group with intervals.', 'Slices without uncertainty.', 'No slices.'),
      'final/Communication and reproducibility': anchor('A report a non-specialist can follow, with the non-causal boundary stated and one command reproducing it.', 'Clear but not reproducible, or the reverse.', 'Neither.'),
    },
  },

  'computer-science-research-methods': {
    doc: 'docs/cs-term6-audit.md',
    outcomes: [
      o('cs610.question', 'Turn a claim into a precise research question with a stated contribution.', ['SEP-Communication', 'SE-Validation'], [], [1], ['final']),
      o('cs610.estimand', 'Define estimands with potential outcomes, and see how aggregation can mislead.', ['MSF-Statistics', 'MSF-Probability'], ['st.simpson'], [2], ['midterm']),
      o('cs610.experiment', 'Design randomised experiments with enough power.', ['MSF-Statistics'], ['st.power', 'st.effect'], [3], ['midterm']),
      o('cs610.causal', 'Identify effects from causal diagrams and adjust for confounders.', ['MSF-Statistics', 'AI-Probability'], ['st.adjust', 'st.ipw'], [4], ['midterm']),
      o('cs610.regress', 'Use regression responsibly and correct for many tests.', ['MSF-Statistics'], ['linreg', 'st.multiple'], [5]),
      o('cs610.bench', 'Treat benchmarks as measurement instruments, with uncertainty and validity threats.', ['PDC-Evaluation', 'SE-Validation'], ['st.ci', 'st.permtest'], [6], ['final']),
      o('cs610.repro', 'Make studies reproducible and ethical, using quasi-experiments where randomising is impossible.', ['SEP-Professional-Ethics', 'SEP-Privacy'], ['st.adjust'], [7, 8], ['midterm', 'final']),
    ],
    gaps: [
      { what: 'No practice', why: 'Power, identification and multiple testing were never drilled.', fix: 'Practice now covers power, inverse-probability weighting, back-door adjustment, Simpson\'s paradox and false-discovery control.' },
      { what: 'Preregistration was on the honour system', why: 'Nothing proved the plan came before the data.', fix: 'Register the plan on OSF, which timestamps it publicly.', url: 'https://osf.io/prereg/' },
    ],
    benchmarks: [
      { id: 'cs610.prereg', name: 'Preregistration timestamped on OSF before data collection', how: 'Record 1 when the OSF registration\'s date precedes your first data.', max: 1, url: 'https://osf.io/prereg/' },
      { id: 'cs610.replicate', name: 'Replication of a published result: share of its main claims reproduced', how: 'Replicate a paper in the ML Reproducibility Challenge\'s style; record the percentage of main claims you reproduced.', max: 100, url: 'https://reproml.org/' },
    ],
    anchors: {
      'midterm/Construct and estimand precision': anchor('The construct operationalised and the estimand written in potential-outcome notation for a named population.', 'Estimand stated loosely.', 'No estimand.'),
      'midterm/Identification logic': anchor('A causal diagram with every back-door path blocked or the design randomised, assumptions listed.', 'Diagram drawn, one path missed.', 'Correlation treated as cause.'),
      'midterm/Power and analysis planning': anchor('Sample size from a power calculation with a justified effect size, and the analysis fixed in advance.', 'Power computed from an unjustified effect.', 'No power analysis.'),
      'midterm/Validity and ethics': anchor('Internal, external and construct threats each paired with a mitigation; consent and data handling planned.', 'Threats listed without mitigation.', 'Not considered.'),
      'final/Research contribution': anchor('A gap in the literature shown with sources, and a contribution that fills it.', 'Contribution unclear against prior work.', 'No literature grounding.'),
      'final/Design validity': anchor('Identification and benchmark validity both argued, with the weakest assumption tested.', 'One argued.', 'Neither.'),
      'final/Analysis reproducibility': anchor('Analysis code skeleton runs on simulated data, and the package follows artifact-evaluation practice.', 'Code exists, does not run.', 'No code.'),
      'final/Ethical and oral defense': anchor('Preregistered on OSF; the data protocol meets consent and privacy standards; questions answered from the plan.', 'Ethical, not registered.', 'Ethics missing.'),
    },
  },

  'capstone-studio-2': {
    doc: 'docs/cs-term6-audit.md',
    outcomes: [
      o('cs620.plan', 'Reconfirm requirements, risks and the evaluation plan from evidence.', ['SE-Requirements'], ['se.delivery'], [1], ['midterm']),
      o('cs620.slice', 'Ship vertical slices in small, reviewed changes through CI.', ['SE-Tools', 'SE-Construction'], ['se.git', 'se.flaky'], [2], ['midterm']),
      o('cs620.review', 'Run design and code review and act on what it finds.', ['SE-Teamwork', 'SE-Validation'], ['se.complexity'], [3], ['midterm']),
      o('cs620.verify', 'Test, security-review and accessibility-review the release.', ['SE-Validation', 'SEC-Engineering', 'HCI-Accessibility'], ['se.coverage', 'sec.csp', 'web.contrast'], [4], ['midterm']),
      o('cs620.reliable', 'Measure performance and test recovery from failure.', ['SF-Reliability', 'SF-Performance'], ['dsys.avail', 'latency'], [5], ['midterm', 'final']),
      o('cs620.evaluate', 'Evaluate with real users or workloads and analyse the results honestly.', ['HCI-Evaluation', 'MSF-Statistics'], ['hci.sus', 'st.ci'], [6], ['final']),
      o('cs620.release', 'Document, release and hand over the system.', ['SE-Tools', 'SEP-Communication'], ['se.ranges'], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'Units linked unrelated pages', why: 'Reliability testing linked a code-review checklist, user evaluation linked a guide to navigating a code review, and documentation linked a guide to review comments.', fix: 'Those units now link the SRE book\'s testing chapter, GOV.UK\'s usability-testing guide and Google\'s documentation best practices.', url: 'https://sre.google/sre-book/testing-reliability/' },
      { what: 'No outside judge of the release', why: 'Release readiness was self-assessed.', fix: 'OpenSSF Scorecard checks the repository, real users outside the course use it, and SUS measures what they thought.', url: 'https://github.com/ossf/scorecard' },
    ],
    benchmarks: [
      { id: 'cs620.users', name: 'People outside the course who used the release', how: 'Count distinct real users from your analytics or sign-ups.', max: 10000, url: 'https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing' },
      { id: 'cs620.sus', name: 'Mean SUS score from at least five real users', how: 'Run SUS after your evaluation sessions; record the mean (68 is average).', max: 100, url: 'https://measuringu.com/sus/' },
      { id: 'cs620.scorecard', name: 'OpenSSF Scorecard score of the capstone repository', how: 'Run Scorecard; record the overall score out of 10.', max: 10, url: 'https://github.com/ossf/scorecard' },
    ],
    anchors: {
      'midterm/Integrated functionality': anchor('A deployed slice that real users can reach, each feature linked to a requirement and a passing test.', 'Deployed, some features untraced.', 'Not deployed.'),
      'midterm/Verification depth': anchor('Tests at unit, integration and end-to-end levels, plus completed security (ASVS) and accessibility reviews.', 'Tests present; one review missing.', 'Shallow tests.'),
      'midterm/Risk and performance evidence': anchor('Latency and failure-recovery measured against targets, with the riskiest path load-tested.', 'Measured without targets.', 'Not measured.'),
      'midterm/Review response': anchor('Every release-blocking finding closed with evidence, and the plan revised from the review.', 'Most findings closed.', 'Findings open.'),
      'final/Requirement completion': anchor('Every committed requirement met and shown, or explicitly descoped with reasons.', 'Most met.', 'Core requirements missing.'),
      'final/Evaluation validity': anchor('Users or workloads chosen without bias, with the protocol fixed in advance, and SUS or task metrics given with intervals.', 'Evaluation run, biased or uncontrolled.', 'No evaluation.'),
      'final/Release readiness': anchor('Reproducible build, versioned release, rollback demonstrated, Scorecard ≥ 7.', 'Released with manual steps.', 'Not releasable.'),
      'final/Defense and stewardship': anchor('Unsupported claims stated plainly, and a successor took over using only the documentation.', 'Handoff with help.', 'No handoff.'),
    },
  },

  'computer-graphics': {
    doc: 'docs/cs-term6-audit.md',
    outcomes: [
      o('cs631.raster', 'Rasterise triangles with coverage tests and barycentric interpolation.', ['GIT-Rendering', 'GIT-Fundamentals'], ['gr.bary'], [1], ['midterm']),
      o('cs631.sample', 'Antialias by supersampling, and filter textures with mipmaps.', ['GIT-Rendering', 'GIT-Image'], [], [1, 2], ['midterm']),
      o('cs631.transform', 'Compose transforms in homogeneous coordinates and move between coordinate systems.', ['GIT-Fundamentals', 'MSF-Linear'], ['gr.transform', 'rot', 'matmul'], [2]),
      o('cs631.mesh', 'Edit half-edge meshes without breaking their topology.', ['GIT-Modeling'], ['gr.euler'], [3], ['midterm']),
      o('cs631.curves', 'Evaluate and subdivide curves and surfaces.', ['GIT-Modeling'], ['gr.bezier'], [4]),
      o('cs631.ray', 'Generate rays, intersect them with geometry and accelerate with a BVH.', ['GIT-Rendering'], ['gr.ray', 'pinhole', 'cross'], [5], ['final']),
      o('cs631.light', 'Shade with physically based lighting and Monte Carlo integration.', ['GIT-Shading'], ['gr.lambert'], [6], ['final']),
      o('cs631.sim', 'Animate and simulate with stable numerical integration, and defend what the images show.', ['GIT-Animation', 'GIT-Simulation'], [], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'Practice was borrowed from other tracks', why: 'Cross products, rotations and a pinhole camera — nothing on rasterising, meshes, curves or shading.', fix: 'Practice now covers barycentric coordinates, ray–sphere intersection, homogeneous transforms, Bézier curves, Euler\'s formula and Lambertian shading.' },
      { what: 'CS184\'s grader is for enrolled students', why: 'The homework is checked on Gradescope, which outside learners cannot use.', fix: 'Compare your renders against Mitsuba 3, an open-source research renderer, on the same scene, and against the reference images in each CS184 task page.', url: 'https://github.com/mitsuba-renderer/mitsuba3' },
    ],
    benchmarks: [
      { id: 'cs631.psnr', name: 'PSNR of your path tracer against a Mitsuba 3 reference', how: 'Render the Cornell box in both at the same samples per pixel; record PSNR in dB (higher is closer).', max: 60, url: 'https://www.graphics.cornell.edu/online/box/data.html' },
      { id: 'cs631.bvh', name: 'BVH speed-up on the Stanford dragon', how: 'Time primary-ray intersection with and without your BVH; record the speed-up factor.', max: 10000, url: 'https://graphics.stanford.edu/data/3Dscanrep/' },
    ],
    anchors: {
      'midterm/Raster correctness': anchor('Reference scenes match pixel for pixel at 1 sample per pixel; edges follow the top-left rule.', 'Small differences on shared edges.', 'Visible errors.'),
      'midterm/Sampling quality': anchor('Supersampling and mipmapping reduce aliasing measurably, with error against a high-sample reference for each setting.', 'Improvement shown visually only.', 'Aliasing unaddressed.'),
      'midterm/Mesh integrity': anchor('After every edit, V − E + F is unchanged for closed meshes and every half-edge\'s twin and next pointers are consistent (checked by code).', 'Edits work; invariants not checked.', 'Edits corrupt the mesh.'),
      'midterm/Visual and technical evidence': anchor('Before/after images with difference maps, and each remaining pixel difference explained.', 'Images without explanation.', 'No evidence.'),
      'final/Rendering/simulation correctness': anchor('Converges to the Mitsuba reference (PSNR rising with samples), or the simulation conserves what it should.', 'Plausible, unvalidated.', 'Physically wrong.'),
      'final/Numerical and visual validation': anchor('Energy conservation or integrator stability shown numerically; noise falls as 1/√samples.', 'Validated visually.', 'Not validated.'),
      'final/Performance engineering': anchor('BVH speed-up measured on a large mesh, with the profile explaining what remains.', 'Faster, unmeasured.', 'No acceleration.'),
      'final/Artifact analysis and defense': anchor('Every visible artifact (fireflies, acne, aliasing) explained by its cause, with a fix or a reason to accept it.', 'Some explained.', 'Artifacts ignored.'),
    },
  },

  'computer-vision': {
    doc: 'docs/cs-term6-audit.md',
    outcomes: [
      o('cs632.classify', 'Frame recognition as data-driven classification with strict train, validation and test discipline.', ['AI-Vision', 'AI-ML'], ['metrics'], [1], ['midterm']),
      o('cs632.linear', 'Train linear classifiers with softmax and SVM losses.', ['AI-ML'], ['softmax', 'logit'], [2], ['midterm']),
      o('cs632.backprop', 'Backpropagate through networks and check gradients numerically.', ['AI-ML'], ['backprop', 'init'], [3], ['midterm']),
      o('cs632.cnn', 'Design convolutional networks: convolution, pooling, shapes and parameter counts.', ['AI-Vision', 'AI-ML'], ['cv.conv', 'cv.pool', 'convout', 'params'], [4], ['midterm']),
      o('cs632.transfer', 'Regularise and transfer: augmentation, fine-tuning, pretrained representations.', ['AI-ML'], ['adam', 'patches', 'infonce'], [5], ['final']),
      o('cs632.detect', 'Detect and segment objects, and score them with IoU.', ['AI-Vision'], ['iou'], [6], ['final']),
      o('cs632.robust', 'Interpret models and test robustness and subgroup behaviour.', ['AI-Vision', 'AI-SEP'], ['eth.fairness'], [7], ['final']),
      o('cs632.report', 'Report a reproducible vision experiment.', ['AI-ML', 'SEP-Communication'], ['st.ci'], [8], ['final']),
    ],
    gaps: [
      { what: 'Convolution itself was never practised', why: 'Practice asked for output shapes and IoU, but never what a convolution or pooling layer computes.', fix: 'Practice now computes convolution outputs and max pooling by hand, checked by separate loops.' },
      { what: 'No outside score', why: 'Accuracy was reported on the learner\'s own split.', fix: 'CIFAR-10\'s fixed test set and CIFAR-10-C\'s published corruptions give numbers others can compare; CS231n\'s notebooks check your gradients numerically.', url: 'https://github.com/hendrycks/robustness' },
    ],
    benchmarks: [
      { id: 'cs632.cifar', name: 'CIFAR-10 test accuracy of your from-scratch CNN', how: 'Train on the 50,000 training images only; record accuracy on the 10,000 test images.', max: 100, url: 'https://www.cs.toronto.edu/~kriz/cifar.html' },
      { id: 'cs632.cifarc', name: 'Mean accuracy on CIFAR-10-C', how: 'Evaluate the same model on all 15 corruptions at all 5 severities; record the mean accuracy.', max: 100, url: 'https://github.com/hendrycks/robustness' },
    ],
    anchors: {
      'midterm/Implementation correctness': anchor('Every layer\'s analytic gradient matches a numeric gradient to 1e-7 relative error, as CS231n\'s checks require.', 'Most layers checked.', 'Gradients unchecked or wrong.'),
      'midterm/Training reproducibility': anchor('Fixed split and seeds; loss curves rerun to the same numbers.', 'Reruns close but not identical, unexplained.', 'Cannot be rerun.'),
      'midterm/Evaluation discipline': anchor('Test set used once at the end; augmentation and overfitting claims backed by validation curves.', 'Test set viewed during tuning.', 'Tuned on test.'),
      'midterm/Error analysis': anchor('The ten most consequential errors shown, grouped by cause, with a fix tried for the largest group.', 'Errors shown, not grouped.', 'No analysis.'),
      'final/Experimental rigor': anchor('A strong baseline and ablations for transfer and regularisation, each over several seeds with intervals.', 'Ablations on one seed.', 'No baseline.'),
      'final/Vision-system quality': anchor('Competitive accuracy, mAP or mIoU on a standard split for its size and compute.', 'Works but well below baselines.', 'Does not work.'),
      'final/Robustness and bias analysis': anchor('CIFAR-10-C (or equivalent) corruptions and subgroup errors measured with intervals.', 'One of the two.', 'Neither.'),
      'final/Documentation and defense': anchor('A public model report with data, training, limits and intended use.', 'Report missing limits.', 'No report.'),
    },
  },

  'natural-language-processing': {
    doc: 'docs/cs-term6-audit.md',
    outcomes: [
      o('cs633.tokens', 'Tokenise text and represent documents by counts and TF-IDF.', ['AI-NLP'], ['bpe', 'nlp.tfidf'], [1]),
      o('cs633.vectors', 'Learn word vectors and measure similarity between them.', ['AI-NLP', 'MSF-Linear'], ['dot'], [2], ['midterm']),
      o('cs633.lm', 'Train neural language models and evaluate them by perplexity.', ['AI-NLP', 'AI-ML'], ['perplexity', 'softmax'], [3], ['midterm']),
      o('cs633.attn', 'Implement attention with masking and verify its gradients.', ['AI-NLP', 'AI-ML'], ['attn'], [4], ['midterm']),
      o('cs633.transformer', 'Size and run Transformers: parameters, memory, decoding and the KV cache.', ['AI-NLP', 'AI-ML'], ['llmparams', 'kvcache', 'sampling'], [5]),
      o('cs633.generate', 'Build retrieval, question-answering and generation systems and score them.', ['AI-NLP'], ['nlp.bleu'], [6], ['final']),
      o('cs633.eval', 'Probe hallucination, bias and safety with a frozen evaluation.', ['AI-NLP', 'AI-SEP'], ['eth.fairness', 'st.ci'], [7], ['final']),
      o('cs633.doc', 'Document data, licences and limits in a model card.', ['AI-SEP', 'SEP-IP'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'Scoring generated text was never practised', why: 'Practice covered tokenisers, attention and perplexity, but not how outputs are scored.', fix: 'Practice now computes TF-IDF and BLEU\'s clipped precision.' },
      { what: 'No outside score', why: 'Systems were scored with the learner\'s own code.', fix: 'Use official scorers: SQuAD\'s evaluation script for question answering and sacreBLEU for translation, so numbers are comparable with published ones.', url: 'https://github.com/mjpost/sacrebleu' },
    ],
    benchmarks: [
      { id: 'cs633.squad', name: 'SQuAD 2.0 dev-set F1 with the official script', how: 'Run the official evaluation script on your predictions; record F1.', max: 100, url: 'https://rajpurkar.github.io/SQuAD-explorer/' },
      { id: 'cs633.bleu', name: 'sacreBLEU on a WMT test set', how: 'Score a translation system you trained or fine-tuned; record the sacreBLEU score with its signature.', max: 100, url: 'https://github.com/mjpost/sacrebleu' },
    ],
    anchors: {
      'midterm/Model correctness': anchor('Gradients checked numerically and masking proved by a test where future tokens cannot change earlier outputs.', 'One of the two checked.', 'Neither.'),
      'midterm/Baseline and evaluation rigor': anchor('A no-attention baseline tuned as carefully, evaluated on held-out sequences over several seeds.', 'Baseline under-tuned.', 'No baseline.'),
      'midterm/Sequence/attention analysis': anchor('Attention maps and errors analysed by linguistic phenomenon, with counts.', 'Examples without counts.', 'No analysis.'),
      'midterm/Reproducibility': anchor('One command reruns training and evaluation to the same numbers.', 'Close, unexplained differences.', 'Cannot be rerun.'),
      'final/NLP system quality': anchor('Competitive on an official scorer (SQuAD F1, sacreBLEU or similar) for its size.', 'Works, well below baselines.', 'Does not work.'),
      'final/Experimental rigor': anchor('A frozen evaluation, a strong baseline and ablations with intervals.', 'Ablations without intervals.', 'No ablations.'),
      'final/Safety and bias evidence': anchor('Hallucination, bias and safety probes run with rates and examples, and a mitigation tested.', 'Probes without mitigation.', 'No probes.'),
      'final/Documentation and defense': anchor('A model card with data sources and licences, limits and intended uses.', 'Card missing licences or limits.', 'No card.'),
    },
  },

  'parallel-computing': {
    doc: 'docs/cs-term6-audit.md',
    grader: 'The Problem Based Benchmark Suite\'s own correctness checkers, and ThreadSanitizer for races — not this app.',
    outcomes: [
      o('cs634.dag', 'Analyse computations as DAGs: work, span and parallelism.', ['PDC-Evaluation', 'PDC-Algorithms'], ['par.workspan'], [1], ['midterm']),
      o('cs634.sched', 'Bound running time with Brent\'s theorem and reason about scheduling.', ['PDC-Evaluation'], ['par.workspan', 'ar.amdahl'], [2], ['midterm']),
      o('cs634.dc', 'Design parallel divide-and-conquer and sequence algorithms.', ['PDC-Algorithms'], ['alg.master'], [3]),
      o('cs634.scan', 'Implement work-efficient scan and the primitives built on it.', ['PDC-Algorithms'], ['par.scan'], [4], ['midterm']),
      o('cs634.sync', 'Synchronise shared memory correctly and measure contention.', ['PDC-Coordination', 'OS-Concurrency'], ['os.race'], [5], ['final']),
      o('cs634.mpi', 'Decompose problems for distributed memory and model communication cost.', ['PDC-Communication'], ['latency'], [6], ['final']),
      o('cs634.scale', 'Profile locality and measure strong and weak scaling.', ['PDC-Evaluation', 'AR-Memory'], ['par.gustafson', 'ar.cache', 'flops', 'mem'], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'Practice was borrowed from the AI track', why: 'FLOPs, latency and memory sizes — nothing on work, span, scans or scaling laws.', fix: 'Practice now covers work and span, Brent\'s bound, prefix sums and Gustafson\'s law beside Amdahl\'s.' },
      { what: 'Correctness and speed were self-reported', why: 'Nothing checked the parallel code\'s output or races.', fix: 'The Problem Based Benchmark Suite gives inputs, timing and a checker for each benchmark; ThreadSanitizer finds data races.', url: 'https://cmuparlay.github.io/pbbsbench/' },
    ],
    problemSets: {
      4: [{ name: 'PBBS — integer sort and other scan-based benchmarks', url: 'https://github.com/cmuparlay/pbbsbench', cmd: './runall -only integerSort' }],
      5: [{ name: 'ThreadSanitizer on your shared-memory code', url: 'https://clang.llvm.org/docs/ThreadSanitizer.html', cmd: 'clang -fsanitize=thread -g -O1 main.c && ./a.out' }],
    },
    benchmarks: [
      { id: 'cs634.pbbs', name: 'PBBS benchmarks your implementations pass', how: 'Run PBBS\'s checker on each benchmark you implemented; record how many pass.', max: 30, url: 'https://cmuparlay.github.io/pbbsbench/' },
      { id: 'cs634.speedup', name: 'Speed-up over the best sequential code', how: 'On all cores of one machine, divide the best sequential time by your parallel time; record the speed-up.', max: 256, url: 'https://cmuparlay.github.io/pbbsbench/' },
    ],
    anchors: {
      'midterm/Parallel correctness': anchor('Scan and the derived primitive match a sequential reference on all PBBS inputs and pass ThreadSanitizer.', 'Correct on most inputs.', 'Wrong or racy.'),
      'midterm/Work/span rigor': anchor('Work O(n) and span O(log n) proved from the recurrences, and Brent\'s bound applied to predict time on p cores.', 'Bounds stated, not proved.', 'Wrong bounds.'),
      'midterm/Work efficiency': anchor('Parallel work within a constant of sequential, shown by single-core timing against the sequential code.', 'Asymptotically efficient, constants unmeasured.', 'Not work-efficient.'),
      'midterm/Measurement interpretation': anchor('Grain size, scheduler and contention effects explained from measurements across core counts.', 'Measured, not explained.', 'Not measured.'),
      'final/Implementation correctness': anchor('Passes PBBS\'s checker (or an equivalent oracle) and ThreadSanitizer, or MPI runs agree with the sequential result.', 'Correct but unchecked for races.', 'Incorrect.'),
      'final/Theoretical analysis': anchor('Work, span and communication bounds derived, with the expected parallelism.', 'Partial analysis.', 'None.'),
      'final/Benchmark validity': anchor('Strong and weak scaling measured with repeated runs, against the best sequential code, not a slowed-down one.', 'Self-relative speed-up only.', 'Single runs.'),
      'final/Bottleneck defense': anchor('The gap between bound and measurement traced to a cause (bandwidth, locality, synchronisation) with a profile.', 'Gap noted, not explained.', 'Not examined.'),
    },
  },

  'android-application-development': {
    doc: 'docs/cs-term6-audit.md',
    outcomes: [
      o('cs635.kotlin', 'Write idiomatic Kotlin and structure an Android project.', ['SPD-Mobile'], [], [1]),
      o('cs635.compose', 'Build Compose layouts and themes that hold up across screen densities.', ['SPD-Mobile', 'HCI-Design'], ['and.dp'], [2], ['midterm']),
      o('cs635.state', 'Hoist state and survive rotation and process death.', ['SPD-Mobile'], [], [3], ['midterm']),
      o('cs635.nav', 'Navigate with typed routes and deep links, and adapt to window sizes.', ['SPD-Mobile'], ['and.dp'], [4], ['midterm']),
      o('cs635.arch', 'Layer the app into UI, view-model and data layers.', ['SPD-Mobile', 'SE-Design'], [], [5], ['final']),
      o('cs635.offline', 'Persist and sync data offline-first, with retries and back-off.', ['SPD-Mobile', 'DM-Core'], ['and.backoff', 'db.sql'], [6], ['final']),
      o('cs635.quality', 'Test, make accessible and keep frames within budget.', ['SPD-Mobile', 'HCI-Accessibility'], ['and.frames', 'hci.target', 'web.contrast'], [7], ['midterm', 'final']),
      o('cs635.release', 'Prepare a signed release with permissions and privacy handled.', ['SPD-Mobile', 'SEP-Privacy'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'No practice', why: 'Nothing on density-independent pixels, frame budgets or retry strategy.', fix: 'Practice now covers dp to pixels, jank against the frame deadline and exponential back-off.' },
      { what: 'Quality was self-assessed', why: 'Accessibility and performance were judged by eye.', fix: 'Android\'s Accessibility Test Framework fails tests on accessibility issues, and Macrobenchmark measures frame timing.', url: 'https://developer.android.com/guide/topics/ui/accessibility/testing' },
    ],
    benchmarks: [
      { id: 'cs635.atf', name: 'Accessibility Test Framework: zero issues on every screen', how: 'Turn on accessibility checks in your UI tests; record 1 when every screen passes.', max: 1, url: 'https://github.com/google/Accessibility-Test-Framework-for-Android' },
      { id: 'cs635.frames', name: 'Macrobenchmark: share of frames within budget while scrolling', how: 'Run a scrolling Macrobenchmark on a real device; record the percentage of frames under the deadline.', max: 100, url: 'https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview' },
    ],
    anchors: {
      'midterm/Compose behavior': anchor('Every screen renders correctly at compact and expanded widths, shown by Compose UI tests.', 'One width untested.', 'Broken layouts.'),
      'midterm/State and lifecycle safety': anchor('State survives rotation and process death, proven by tests that recreate the activity.', 'Survives rotation only.', 'State lost.'),
      'midterm/Navigation/adaptation': anchor('Typed routes and deep links work from a cold start, with back-stack behaviour tested.', 'Deep links untested.', 'Navigation broken.'),
      'midterm/Automated evidence': anchor('Unit and UI tests run in CI, with accessibility checks on.', 'Tests run locally only.', 'No tests.'),
      'final/Application completeness': anchor('Every planned feature works end to end in the release build.', 'Most work.', 'Core features missing.'),
      'final/Offline data integrity': anchor('Offline edits survive, sync with back-off and resolve conflicts, and a database migration is tested.', 'Offline works; migration untested.', 'Data lost offline.'),
      'final/Accessibility and performance': anchor('Zero Accessibility Test Framework issues, TalkBack usable, and over 95% of frames within budget.', 'Minor issues or jank.', 'Inaccessible or janky.'),
      'final/Release readiness': anchor('Signed release build, minimal permissions with reasons, a privacy policy and crash recovery.', 'Release with an excess permission.', 'Not releasable.'),
    },
  },

  'applied-cryptography': {
    doc: 'docs/cs-term6-audit.md',
    grader: 'Project Wycheproof\'s test vectors and the Cryptopals challenges, which you only pass by actually breaking the cipher — not this app.',
    outcomes: [
      o('cs636.defs', 'State security definitions and threat models precisely.', ['SEC-Crypto', 'SEC-Foundations'], [], [1], ['midterm', 'final']),
      o('cs636.stream', 'Use stream ciphers, and show why a one-time pad cannot be reused.', ['SEC-Crypto'], ['cr.otp'], [2], ['midterm']),
      o('cs636.block', 'Use block ciphers in proper modes with correct padding.', ['SEC-Crypto'], ['cr.pkcs7'], [3]),
      o('cs636.aead', 'Authenticate messages and use AEAD without nonce reuse.', ['SEC-Crypto'], ['cr.nonce'], [4], ['midterm']),
      o('cs636.hash', 'Use hash functions correctly and store passwords safely.', ['SEC-Crypto', 'SEC-Coding'], ['sec.entropy', 'strhash'], [5]),
      o('cs636.pk', 'Explain public-key encryption from its number theory.', ['SEC-Crypto', 'MSF-Discrete'], ['sec.rsa', 'cr.crt', 'modpow', 'modinv'], [6]),
      o('cs636.kex', 'Establish keys, and verify signatures and certificates.', ['SEC-Crypto'], ['cr.dh'], [7], ['final']),
      o('cs636.protocol', 'Compose primitives into a protocol and test it adversarially.', ['SEC-Crypto', 'SEC-Engineering'], ['sec.jwt'], [8], ['final']),
    ],
    gaps: [
      { what: 'Practice was number theory only', why: 'GCDs, primes and modular arithmetic — nothing on modes, padding, nonces, key exchange or pad reuse.', fix: 'Practice now covers each, checked by Python\'s pow() and brute force.' },
      { what: 'Lectures without a text', why: 'Every unit links the same slide page.', fix: 'Boneh and Shoup\'s A Graduate Course in Applied Cryptography is free and follows the lectures.', url: 'https://toc.cryptobook.us/' },
      { what: 'Nothing outside tested the code', why: 'Implementations were checked only against the learner\'s own vectors.', fix: 'Project Wycheproof\'s vectors include the edge cases that broke real libraries; Cryptopals makes you break real constructions.', url: 'https://github.com/C2SP/wycheproof' },
    ],
    problemSets: {
      2: [{ name: 'Cryptopals Set 1 — XOR, repeating-key XOR, ECB', url: 'https://cryptopals.com/sets/1' }],
      3: [{ name: 'Cryptopals Set 2 — block modes and PKCS#7', url: 'https://cryptopals.com/sets/2' }, { name: 'Cryptopals Set 3 — the CBC padding oracle and CTR', url: 'https://cryptopals.com/sets/3' }],
      4: [{ name: 'Cryptopals Set 4 — message authentication', url: 'https://cryptopals.com/sets/4' }],
      6: [{ name: 'Cryptopals Set 5 — Diffie–Hellman and RSA', url: 'https://cryptopals.com/sets/5' }],
      7: [{ name: 'Cryptopals Set 6 — RSA and DSA signatures', url: 'https://cryptopals.com/sets/6' }],
    },
    benchmarks: [
      { id: 'cs636.cryptopals', name: 'Cryptopals sets completed', how: 'Record how many of the eight sets you have finished.', max: 8, url: 'https://cryptopals.com/' },
      { id: 'cs636.wycheproof', name: 'Wycheproof AEAD vectors your envelope handles correctly', how: 'Run your envelope against Wycheproof\'s AES-GCM or ChaCha20-Poly1305 vectors; record the percentage handled correctly.', max: 100, url: 'https://github.com/C2SP/wycheproof' },
    ],
    anchors: {
      'midterm/Primitive/API correctness': anchor('A maintained library\'s AEAD used correctly; the envelope passes the published and Wycheproof vectors.', 'Passes the published vectors only.', 'Fails vectors or hand-rolls a primitive.'),
      'midterm/Authentication failure handling': anchor('Altered metadata, ciphertext and tag are all rejected, with no plaintext released before verification.', 'One alteration accepted.', 'Unauthenticated decryption.'),
      'midterm/Misuse demonstration': anchor('On synthetic data only, nonce reuse shown to leak the XOR of plaintexts (and GCM\'s authentication key), with the computation shown.', 'Leak shown without explanation.', 'No demonstration, or real data used.'),
      'midterm/Threat-model reasoning': anchor('Adversary capabilities stated, and each property (confidentiality, integrity, replay) mapped to a mechanism.', 'Properties listed without mechanisms.', 'No threat model.'),
      'final/Protocol correctness': anchor('Specified precisely, implemented, and passing tests for every message and state.', 'Works on the happy path.', 'Broken.'),
      'final/Key and state management': anchor('Keys separated by purpose, nonces never repeat across restarts, and state survives crashes safely.', 'One weakness.', 'Key or nonce reuse.'),
      'final/Adversarial evidence': anchor('Replay, reflection, downgrade and tampering tested, each rejected.', 'Some attacks tested.', 'None tested.'),
      'final/Security claims and defense': anchor('Claims precise and limited to what the tests and definitions support.', 'Claims slightly overstated.', '"Unbreakable".'),
    },
  },
};
