# Computer Science, Term 5: audit and evidence

October 2026. This covers the five Term 5 courses:

- CS501 Artificial Intelligence
- CS510 Machine Learning
- CS520 Distributed Systems
- CS530 Ethics of Computing and AI
- CS540 Capstone Studio I

The method is the one used for Terms 1–4. The design lives in [`js/degrees/curriculum/cs-term5.js`](../js/degrees/curriculum/cs-term5.js). The new practice is in [`js/degrees/practice/`](../js/degrees/practice/): `aiplan.js`, `distsys.js` and part of `inference.js`.

## What was wrong

1. **Outcomes and rubrics were boilerplate**, as in every course before the audit.
2. **AI's practice missed most of the course.** It had BFS, Dijkstra, Bayes' rule, entropy and returns, but nothing on games, CSPs, Bayes nets, MDPs or Q-learning.
3. **Distributed Systems had one practice question**, on latency.
4. **Ethics and Capstone I had no practice at all.**
5. **Two midterms cannot be reproduced as written:**
   - AI's "depth-first maze generated with seed 50101" depends on the generator. Two depth-first implementations give different mazes from the same seed.
   - Distributed Systems' seeds 52001–52005 are meant to drive failure schedules, but the course provides no scheduler.
6. **Machine Learning's noise term is ambiguous.** ε ∼ Normal(0, 0.35) can be read as a variance or a standard deviation, and the Bayes error depends on which.
7. **Machine Learning's Unit 6 had no source.** It promises latent-variable models, but MIT's 6.036/6.390 notes have no chapter on them.
8. **Capstone I's units linked unrelated lectures.**
   - "Problem discovery" linked a shell lecture.
   - "Scope" linked shell scripting.
   - "Architecture" linked the command-line environment.
9. **Nothing outside the app judged** agents, Raft implementations, ethical reasoning or prototypes.

## What changed

- **Outcomes.** There are 38 in all, each mapped to CS2023 knowledge units, its course units, practice and assessments. The CS2023 codes were checked against the body of knowledge's own text.
- **New practice:**
  - AI (6): uniform-cost and A* search, minimax with alpha-beta, CSP counting, Bayes-net inference, value iteration, Q-learning
  - Distributed Systems (6): quorums, Lamport clocks, vector clocks, Raft majorities, availability, two-phase commit
  - Ethics (4, in `inference.js`): group fairness metrics, the base-rate trade-off, k-anonymity, differential privacy
- **Borrowed practice.** Machine Learning reuses the AI track's regression, classification, backprop and optimiser skills, each with its own Python check. Capstone I reuses software-engineering and HCI skills.
- **Outside graders:**
  - CS188's autograders and exam-prep sets with solutions (AI)
  - MITx 6.036 graded exercises and Kaggle (Machine Learning)
  - 6.5840's lab test suites, with Porcupine checking linearizability (Distributed Systems)
  - the University of Helsinki's peer-reviewed Ethics of AI course, worth 2 ECTS (Ethics)
  - outside stakeholders, a stranger building from the README, and Lighthouse (Capstone I)
- **Problem sets:**
  - AI: the CS188 project for each unit, with its autograder command
  - Distributed Systems: the 6.5840 lab for each unit, with its test command (taken from the lab pages)
- **Link fixes.** Four Capstone I unit links were corrected in `corrections.js`, and the catalog was re-imported; only those four links changed. GOV.UK's guides now cover user needs and discovery, and architecture decision records cover architecture.
- **Gaps** with fixes. The maze is replaced by CS188's published mazes, the seeds by 6.5840's tests, Unit 6 is pointed at Bishop's PRML chapter 9, and 0.35 is read as a standard deviation.
- **Answer checks.** There are 9, each reproduced by its own program:

  | Check | Answer | How it is reproduced |
  |---|---|---|
  | CS501: minimax value of ((3,5,2),(9,1,4),(6,7,0)) | 2 | max of mins |
  | CS501: leaves alpha-beta evaluates | 8 of 9 | a recursive alpha-beta that counts leaves |
  | CS501: Australia colourings with WA red | 6 | all 3⁷ colourings checked |
  | CS510: expected share of positive labels | 0.5 | odd symmetry, confirmed by 200,000 draws |
  | CS510: Bayes error rate | ≈ 0.075 | 2-D numerical integration of Φ(−\|f(x)\|/0.35) |
  | CS520: votes to win an election, 5 nodes | 3 | every pair of quorums checked for overlap |
  | CS520: crashes tolerated, 5 nodes | 2 | the majority rule |
  | CS530: equal-opportunity gap | 0.16 | exact fractions: (1 − 0.18) − (1 − 0.34) |
  | CS530: extra qualified rejections per 100 | 16 | simulation |

- **Marking anchors** for all 40 rubric lines. The partial-credit figure now comes from the rubric itself: every CS rubric awards 15 of 25 for partial work. The page used to show "≈ 13".

## Verification

Each check takes a different route from the generator:

| Topic | Independent check |
|---|---|
| search | every simple path enumerated |
| alpha-beta | a separate recursive implementation |
| CSP | every colouring enumerated |
| Bayes nets | the full joint, in exact fractions |
| value iteration, Q-learning | separate Python implementations, in exact fractions where possible |
| quorums, Raft | every pair of quorums |
| clocks | event-by-event simulation |
| availability | every up/down pattern of the replicas |
| fairness, privacy | exact enumeration and fractions |

| Module | Agree | Disagree |
|---|---|---|
| aiplan | 240 | 0 |
| distsys | 330 | 0 |
| inference (all 12 skills) | 480 | 0 |
| borrowed AI and CP skills | all | 0 |

The test suite re-runs every new and borrowed generator against its check on each run.

## Still unverified

- **The outside graders were not run here:** CS188's autograders, 6.5840's tests, the Helsinki course and Kaggle.
- **The 6.5840 commands are from the lab pages as they stood in October 2026.** They change when the course updates its labs.
- **The capstone benchmarks are counts the learner reports** (stakeholders interviewed, a stranger's build). The app cannot confirm them.
