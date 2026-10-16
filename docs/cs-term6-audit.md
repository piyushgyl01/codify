# Computer Science, Term 6: audit and evidence

October 2026. This covers the nine Term 6 courses, three required and six electives:

- CS601 Data Science and Statistical Inference
- CS610 Computer Science Research Methods
- CS620 Capstone Studio II
- CS631 Computer Graphics
- CS632 Computer Vision
- CS633 Natural Language Processing
- CS634 Parallel Computing
- CS635 Android Application Development
- CS636 Applied Cryptography

The method is the one used for Terms 1–5. The design lives in [`js/degrees/curriculum/cs-term6.js`](../js/degrees/curriculum/cs-term6.js). The new practice is in [`js/degrees/practice/`](../js/degrees/practice/): `inference.js`, `graphics.js` and `systems6.js`.

## What was wrong

1. **Outcomes and rubrics were boilerplate**, as in every course before the audit.
2. **Three courses had no practice at all:** Research Methods, Capstone II and Android.
3. **Five courses borrowed practice that missed the subject:**
   - Data Science drilled forecasting and evaluation metrics, but not intervals, tests or sampling bias.
   - Graphics had cross products, rotations and a pinhole camera, but no rasterising, meshes, curves or shading.
   - Vision never asked what a convolution computes.
   - Parallel Computing had FLOPs and memory sizes, but no work, span or scans.
   - Cryptography had number theory only, with nothing on modes, padding, nonces or key exchange.
4. **Data Science's midterm had no answer key.** Its population has a known mean, and its biased design a known bias, but neither was stated.
5. **Capstone II's units linked unrelated pages.**
   - "Reliability testing" linked a code-review checklist.
   - "User evaluation" linked a guide to navigating a code review.
   - "Documentation" linked a guide to review comments.
6. **Several courses depend on graders outside learners cannot use.** CS184 and CS231n grade on Gradescope, and Data 8 has no grader for its textbook.
7. **Nothing outside the app judged the work.**

## What changed

- **Outcomes.** There are 68 in all, each mapped to CS2023, its units, practice and assessments.
- **New practice:**
  - data science and research methods (8, in `inference.js`): intervals, permutation tests, Simpson's paradox, selection-bias weighting, power, multiple comparisons, back-door adjustment, effect sizes
  - graphics (6): barycentric coordinates, ray–sphere intersection, homogeneous transforms, Bézier curves, Euler's formula, Lambertian shading
  - vision and NLP (4): convolution, max pooling, TF-IDF, BLEU's clipped precision
  - parallel computing (3): work and span with Brent's bound, prefix sums, Gustafson's law
  - Android (3): dp to pixels, frame deadlines, exponential back-off
  - cryptography (5): one-time-pad reuse, PKCS#7 and CBC lengths, Diffie–Hellman, the Chinese remainder theorem, nonce collisions
- **Outside graders:**
  - Data Science: Khan Academy's AP Statistics, and Kaggle
  - Research Methods: OSF's timestamped preregistration, and an ML Reproducibility Challenge-style replication
  - Capstone II: real users, SUS and OpenSSF Scorecard
  - Graphics: PSNR against Mitsuba 3 on the Cornell box, and a BVH speed-up on the Stanford dragon
  - Vision: CIFAR-10 and CIFAR-10-C
  - NLP: SQuAD's official script and sacreBLEU
  - Parallel Computing: PBBS's checkers and ThreadSanitizer
  - Android: Google's Accessibility Test Framework and Macrobenchmark
  - Cryptography: Project Wycheproof and Cryptopals
- **Problem sets:**
  - Parallel Computing: PBBS and ThreadSanitizer, with commands
  - Cryptography: Cryptopals sets 1–6 mapped onto the units
- **Link fixes.** Three Capstone II unit links were corrected in `corrections.js`. They now point to the SRE book's testing chapter, GOV.UK's usability-testing guide and Google's documentation best practices.
- **Answer checks** for the one midterm that has numbers:

  | Check | Answer | How it is reproduced |
  |---|---|---|
  | CS601: expected population mean | 9.0 | exact fractions over every age and group |
  | CS601: population SD | 2.4173 | law of total variance |
  | CS601: mean the biased sample estimates | ≈ 9.66 | numerical integration, counting outcomes above 10 twice |

  The closed form (truncated-normal means) gives 9.6637 and the grid gives 9.6634; the answer allows ±0.01.
- **Marking anchors** for all 72 rubric lines.

## Verification

| Topic | Independent check |
|---|---|
| barycentric | Cramer's rule in exact fractions, against the generator's areas |
| ray–sphere | marching plus bisection, against the generator's quadratic formula |
| transforms | 3×3 matrix products, against the generator's step-by-step application |
| Bézier | the Bernstein form, against de Casteljau |
| Euler's formula | the solid's own faces, counting its vertices and edges |
| convolution, pooling | explicit slicing in Python |
| TF-IDF, BLEU | `collections.Counter` |
| work and span | a memoised longest path |
| scans | `itertools.accumulate` |
| one-time pad | recovering the pad itself |
| PKCS#7 | real padding of a byte string |
| Diffie–Hellman | Python's `pow` |
| CRT | brute force |

| Module | Agree | Disagree |
|---|---|---|
| graphics | 240 | 0 |
| systems6 | 900 | 0 |
| inference | 480 | 0 |

One generator was fixed during the audit. The nonce-collision question computed 1 − exp(−x) for tiny x, which rounds to 0 in floating point, so its log came out as −∞. It now uses `expm1`.

## Still unverified

- **Two checks restate the generator's model** rather than taking a different route:
  - **Gustafson's law** checks the arithmetic, not the model.
  - **Nonce collisions** use the birthday approximation in both. That check guards the arithmetic, and it is what caught the underflow.
- **The outside graders were not run here.**
- **Self-reported benchmarks.** Real-user counts and SUS scores are reported by the learner, and the app cannot confirm them.
