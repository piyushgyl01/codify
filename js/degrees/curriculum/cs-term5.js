/**
 * Computer Science, Term 5 — the course design, audited against primary
 * sources (October 2026), as Terms 1–4 were.
 *
 * Outside graders: CS188's projects ship their own autograder; MIT 6.5840's
 * labs come with test suites that inject crashes and partitions and check
 * linearizability with Porcupine; MITx 6.036 on the Open Learning Library
 * grades its exercises; the University of Helsinki's Ethics of AI course is
 * peer-reviewed and certified; capstone prototypes are judged by stakeholders
 * outside the class and by Lighthouse.
 *
 * Sources: CS2023 (AI-*, PDC-*, SEP-*, SE-*); Berkeley CS188; MIT 6.036 and
 * 6.5840; Ethics of AI (Helsinki); The Missing Semester; GOV.UK Service
 * Manual. Evidence in docs/cs-term5-audit.md.
 */

const CS188 = 'https://inst.eecs.berkeley.edu/~cs188/sp24';
const LABS = 'https://pdos.csail.mit.edu/6.824/labs';
const OLL036 = 'https://openlearninglibrary.mit.edu/courses/course-v1:MITx+6.036+1T2019/course/';

const o = (id, text, cs2023, skills, units, assessed = []) => ({ id, text, cs2023, skills, units, assessed });
const anchor = (full, part, none) => ({ full, part, none });
const py = s => s.trim();

export const CS_TERM5 = {
  'artificial-intelligence': {
    doc: 'docs/cs-term5-audit.md',
    grader: 'CS188\'s own autograder (python autograder.py), which ships with each project — not this app.',
    outcomes: [
      o('cs501.search', 'Formulate problems as state-space search and solve them with uninformed search.', ['AI-Search'], ['ai.search', 'bfs'], [1], ['midterm']),
      o('cs501.heuristic', 'Design admissible and consistent heuristics and search with A*.', ['AI-Search'], ['ai.search', 'dijkstra'], [2], ['midterm']),
      o('cs501.games', 'Search adversarially with minimax and alpha-beta pruning.', ['AI-Search'], ['ai.minimax'], [3], ['midterm']),
      o('cs501.csp', 'Solve constraint-satisfaction problems with backtracking and propagation.', ['AI-Search', 'AI-KRR'], ['ai.csp'], [4], ['midterm']),
      o('cs501.bayes', 'Represent uncertainty with Bayes nets and compute posteriors by inference.', ['AI-Probability'], ['ai.bayesnet', 'bayes', 'entropy'], [5], ['final']),
      o('cs501.mdp', 'Solve Markov decision processes with value iteration.', ['AI-Planning'], ['ai.mdp'], [6], ['final']),
      o('cs501.rl', 'Learn values and policies from experience with temporal-difference methods.', ['AI-ML'], ['ai.qlearn', 'returns'], [7], ['final']),
      o('cs501.agent', 'Build an agent, evaluate it on held-out seeds and defend its objective and safety limits.', ['AI-Agents', 'AI-SEP'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'Practice missed most of the course', why: 'It had BFS, Dijkstra, Bayes\' rule, entropy and returns — nothing on games, CSPs, Bayes nets, MDPs or Q-learning.', fix: 'Practice now covers alpha-beta, CSP counting, Bayes-net inference, value iteration and Q-learning, each checked by a separate program.' },
      { what: 'The midterm maze cannot be reproduced', why: '"A depth-first maze generated with seed 50101" depends on the generator: two depth-first implementations give different mazes from the same seed.', fix: 'Use CS188 Project 1\'s published mazes (tinyMaze, mediumMaze, bigMaze), whose autograder knows the right answers, or publish your generator next to the seed.', url: `${CS188}/projects/proj1/` },
      { what: 'Nothing outside checked the agents', why: 'Every result was the learner\'s own.', fix: 'CS188\'s six Pacman projects each ship an autograder; the exam-prep sets come with solutions.', url: `${CS188}/projects/` },
    ],
    problemSets: {
      1: [{ name: 'CS188 Project 1 — Search (DFS, BFS, UCS)', url: `${CS188}/projects/proj1/`, cmd: 'python autograder.py -q q3' }],
      2: [{ name: 'CS188 Project 1 — A* and heuristics', url: `${CS188}/projects/proj1/`, cmd: 'python autograder.py -q q4' }],
      3: [{ name: 'CS188 Project 2 — Games (minimax, alpha-beta, expectimax)', url: `${CS188}/projects/proj2/`, cmd: 'python autograder.py -q q3' }],
      5: [{ name: 'CS188 Project 4 — Bayes nets and HMMs', url: `${CS188}/projects/proj4/`, cmd: 'python autograder.py' }],
      7: [{ name: 'CS188 Project 6 — Reinforcement learning', url: `${CS188}/projects/proj6/`, cmd: 'python autograder.py' }],
    },
    benchmarks: [
      { id: 'cs501.autograder', name: 'CS188 autograder points across Projects 1, 2, 4 and 6', how: 'Run each project\'s autograder unchanged; record your total as a percentage of the points available.', max: 100, url: `${CS188}/projects/` },
      { id: 'cs501.examprep', name: 'CS188 exam-prep sets (Spring 2024), marked against the solutions', how: 'Sit discussions 1–10 under time, mark against the published solutions, record your percentage.', max: 100, url: `${CS188}/` },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs501.mid.value', q: 'What is the minimax value of the root of ((3,5,2),(9,1,4),(6,7,0)), max to move?', answer: 2, tol: 0,
          python: py(`T = ((3, 5, 2), (9, 1, 4), (6, 7, 0))
print(max(min(g) for g in T))`) },
        { id: 'cs501.mid.leaves', q: 'Searching left to right with alpha-beta, how many of its nine leaves are evaluated?', answer: 8, tol: 0,
          python: py(`T = ((3, 5, 2), (9, 1, 4), (6, 7, 0))
seen = 0
def ab(node, a, b, maximize):
    global seen
    if not isinstance(node, tuple):
        seen += 1; return node
    v = float('-inf') if maximize else float('inf')
    for c in node:
        x = ab(c, a, b, not maximize)
        if maximize: v = max(v, x); a = max(a, v)
        else: v = min(v, x); b = min(b, v)
        if a >= b: break
    return v
ab(T, float('-inf'), float('inf'), True)
print(seen)`) },
        { id: 'cs501.mid.australia', q: 'With WA fixed red and three colours, how many complete colourings of Australia (Tasmania included) are valid?', answer: 6, tol: 0,
          python: py(`from itertools import product
R = ['WA', 'NT', 'SA', 'Q', 'NSW', 'V', 'T']
E = [('WA','NT'), ('WA','SA'), ('NT','SA'), ('NT','Q'), ('SA','Q'), ('SA','NSW'), ('SA','V'), ('Q','NSW'), ('NSW','V')]
print(sum(1 for c in product('rgb', repeat=7) if c[0] == 'r' and all(c[R.index(x)] != c[R.index(y)] for x, y in E)))`) },
      ],
    },
    anchors: {
      'midterm/Search correctness': anchor('A* returns an optimal maze path (checked against UCS), alpha-beta gives root value 2 with 8 leaves evaluated, and the CSP returns all 6 solutions with WA red.', 'Two of the three environments correct.', 'A wrong path cost, value or solution.'),
      'midterm/Heuristic reasoning': anchor('Manhattan distance proved admissible and consistent on a 4-connected grid with unit costs, and the proof used to explain why A* never re-expands a node.', 'Admissibility proved, consistency asserted.', 'No proof, or a heuristic that overestimates.'),
      'midterm/Constraint/adversarial handling': anchor('Arc consistency shown removing values after WA = red; move ordering shown changing how many leaves alpha-beta prunes.', 'Correct results without the propagation or pruning trace.', 'Brute force presented as propagation.'),
      'midterm/Measurement interpretation': anchor('Nodes expanded for BFS, UCS and A* compared on the same mazes, with the differences explained by the heuristic.', 'Numbers reported, not explained.', 'No measurements.'),
      'final/Agent implementation': anchor('The agent runs from a clean checkout and CS188\'s autograder passes on the relevant project, or an equivalent published test does.', 'Runs, but only the learner\'s own tests pass.', 'Does not run.'),
      'final/Uncertainty reasoning': anchor('The model\'s probabilities, rewards or value estimates are stated, and the agent\'s choices are traced to them.', 'Uncertainty handled but not explained.', 'Treats an uncertain world as certain.'),
      'final/Evaluation validity': anchor('Held-out seeds never used in tuning, enough runs for a confidence interval, and a baseline agent for comparison.', 'Held-out seeds, no interval or baseline.', 'Evaluated on training seeds.'),
      'final/Safety and defense': anchor('The objective\'s loopholes named, a failure the agent can cause demonstrated, and a safeguard tested against it.', 'Risks listed without tests.', 'No safety analysis.'),
    },
  },

  'machine-learning': {
    doc: 'docs/cs-term5-audit.md',
    outcomes: [
      o('cs510.regress', 'Fit linear models by minimising empirical risk, in closed form and by gradient descent.', ['AI-ML', 'MSF-Linear'], ['linreg', 'la.ls'], [1], ['midterm']),
      o('cs510.classify', 'Train logistic classifiers and reason about decision boundaries.', ['AI-ML'], ['logit', 'metrics'], [2], ['midterm']),
      o('cs510.features', 'Engineer features and classify with margins.', ['AI-ML'], ['dot'], [3], ['midterm']),
      o('cs510.generalize', 'Choose models and regularisation without touching the test set.', ['AI-ML', 'MSF-Statistics'], ['auc', 'st.ci'], [4], ['midterm', 'final']),
      o('cs510.nn', 'Train neural networks with backpropagation and modern optimisers.', ['AI-ML'], ['backprop', 'softmax', 'init', 'adam'], [5], ['final']),
      o('cs510.prob', 'Fit probabilistic and latent-variable models.', ['AI-ML', 'MSF-Probability'], ['kmeans', 'entropy'], [6]),
      o('cs510.rl', 'Formulate sequential decisions as MDPs and learn them by reinforcement.', ['AI-ML', 'AI-Planning'], ['ai.mdp', 'ai.qlearn'], [7]),
      o('cs510.compare', 'Compare models honestly: uncertainty, subgroups and a model card.', ['AI-ML', 'AI-SEP'], ['eth.fairness', 'st.permtest'], [8], ['final']),
    ],
    gaps: [
      { what: 'Latent-variable models have no source', why: 'Unit 6 promises latent variables and inference, but MIT\'s 6.036/6.390 notes have no chapter on them.', fix: 'Read Bishop\'s Pattern Recognition and Machine Learning, chapter 9 (mixture models and EM), free from Microsoft Research.', url: 'https://www.microsoft.com/en-us/research/uploads/prod/2006/01/Bishop-Pattern-Recognition-and-Machine-Learning-2006.pdf' },
      { what: 'An ambiguous noise term', why: 'The midterm\'s ε ∼ Normal(0, 0.35) can be read as a variance or a standard deviation, which changes the Bayes error.', fix: 'Read 0.35 as the standard deviation, as numpy\'s normal(0, 0.35) does; the answer checks below use that reading.' },
      { what: 'Nothing outside checked the maths', why: 'Derivations and implementations were self-assessed.', fix: 'MITx 6.036 on the Open Learning Library grades its exercises and homework automatically.', url: OLL036 },
    ],
    benchmarks: [
      { id: 'cs510.oll', name: 'MITx 6.036 graded exercises and homework', how: 'Work through the Open Learning Library course; record the percentage of graded problems you got right.', max: 100, url: OLL036 },
      { id: 'cs510.kaggle', name: 'Kaggle Titanic: leaderboard accuracy', how: 'Submit predictions from your own pipeline (no copied notebooks); record Kaggle\'s accuracy as a percentage.', max: 100, url: 'https://www.kaggle.com/competitions/titanic' },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs510.mid.balance', q: 'What fraction of labels is 1 in expectation, for 1[x₁ + 0.7x₂ + 0.4 sin 3x₁ + ε > 0]? (2 decimal places)', answer: 0.5, tol: 0.01,
          python: py(`import random, math
# (x1, x2, e) -> (-x1, -x2, -e) flips the sign of the score, so the answer is 1/2; simulate to confirm
r = random.Random(510); n = 200000
print(sum(1 for _ in range(n) if (lambda a, b, e: a + 0.7 * b + 0.4 * math.sin(3 * a) + e > 0)(r.gauss(0, 1), r.gauss(0, 1), r.gauss(0, 0.35))) / n)`) },
        { id: 'cs510.mid.bayes', q: 'What is the Bayes error rate — the best any classifier can do on this distribution — taking 0.35 as the noise\'s standard deviation? (3 decimal places)', answer: 0.075, tol: 0.001,
          python: py(`import math
from statistics import NormalDist
# the best rule predicts 1[f(x) > 0]; it errs when the noise flips the sign: Φ(−|f(x)|/0.35)
N = NormalDist(); h = 0.04; xs = [i * h for i in range(-175, 176)]; w = [N.pdf(x) * h for x in xs]
err = 0.0
for x1, w1 in zip(xs, w):
    a = x1 + 0.4 * math.sin(3 * x1)
    err += w1 * sum(w2 * N.cdf(-abs(a + 0.7 * x2) / 0.35) for x2, w2 in zip(xs, w))
print(err)`) },
      ],
    },
    anchors: {
      'midterm/Mathematical implementation': anchor('Gradients derived for all three losses and checked numerically against finite differences to 1e-6 relative error.', 'Derived, not checked numerically.', 'Wrong gradients.'),
      'midterm/Experimental controls': anchor('The 60/20/20 split frozen by index before any fitting; regularisation chosen on validation only; seeds recorded.', 'Splits frozen, one choice made with test data in view.', 'Test data used for selection.'),
      'midterm/Generalization evidence': anchor('Train, validation and test error reported with intervals, compared against the Bayes error of about 0.075.', 'Errors reported without intervals or a reference point.', 'Training error presented as performance.'),
      'midterm/Error diagnosis': anchor('Errors located where 0.4 sin 3x₁ bends the boundary, explained by each model\'s capacity.', 'Errors listed, not explained.', 'No error analysis.'),
      'final/Reproducibility': anchor('One command reproduces every number from fixed data and seeds, with compute recorded.', 'Main result reproduces; one table does not.', 'Cannot be rerun.'),
      'final/Model and baseline rigor': anchor('Two strong baselines given the same tuning budget as the main model.', 'Baselines present but under-tuned.', 'No baselines.'),
      'final/Validity and fairness analysis': anchor('Uncertainty on every comparison and subgroup error rates with intervals; differences tested.', 'Subgroups reported without uncertainty.', 'No subgroup analysis.'),
      'final/Claim discipline and defense': anchor('Every claim in the model card traced to a number; limits stated before the questions.', 'Claims mostly supported.', 'Claims beyond the evidence.'),
    },
  },

  'distributed-systems': {
    doc: 'docs/cs-term5-audit.md',
    grader: 'MIT 6.5840\'s own test suites, which inject crashes and partitions and check linearizability with Porcupine — not this app.',
    outcomes: [
      o('cs520.rpc', 'Model distributed systems and build RPC with at-most-once semantics.', ['PDC-Communication', 'SF-Reliability'], ['dsys.avail'], [1]),
      o('cs520.time', 'Order events with logical and vector clocks.', ['PDC-Coordination'], ['dsys.lamport', 'dsys.vclock'], [2]),
      o('cs520.replicate', 'Replicate state machines with primary-backup.', ['PDC-Coordination', 'SF-Reliability'], ['dsys.avail', 'dsys.quorum'], [3]),
      o('cs520.raft', 'Implement Raft and argue its safety from majority intersection.', ['PDC-Coordination', 'PDC-Algorithms'], ['dsys.raft', 'dsys.quorum'], [4], ['midterm']),
      o('cs520.kv', 'Build a fault-tolerant, linearizable key-value service with deduplication and snapshots.', ['PDC-Coordination', 'DM-Distributed'], ['dsys.raft'], [5], ['final']),
      o('cs520.shard', 'Shard data, reconfigure, and commit transactions across shards.', ['DM-Distributed', 'PDC-Coordination'], ['dsys.2pc', 'db.serial'], [6]),
      o('cs520.consistency', 'Tell consistency models apart and choose one deliberately.', ['PDC-Coordination', 'DM-Distributed'], ['dsys.vclock', 'dsys.quorum'], [7], ['final']),
      o('cs520.measure', 'Test under injected failures and measure latency and throughput.', ['PDC-Evaluation'], ['latency'], [8], ['midterm', 'final']),
    ],
    gaps: [
      { what: 'Practice was one latency question', why: 'Nothing on clocks, quorums, Raft, availability or commit protocols.', fix: 'Practice now covers each, checked by brute force over every quorum pair and by event-by-event simulation.' },
      { what: 'The midterm\'s seeds have no generator', why: 'Seeds 52001–52005 are meant to drive failure schedules, but the course provides no scheduler, so two learners cannot run the same schedule.', fix: 'Use 6.5840\'s Raft tests, which inject the same elections, partitions and restarts for everyone; run each many times, since failures are nondeterministic.', url: `${LABS}/lab-raft1.html` },
    ],
    problemSets: {
      1: [{ name: '6.5840 Lab 1 — MapReduce', url: `${LABS}/lab-mr.html`, cmd: 'cd src && make RUN="-run Wc" mr' }],
      3: [{ name: '6.5840 Lab 2 — key/value server', url: `${LABS}/lab-kvsrv1.html`, cmd: 'cd src && make RUN="-run Reliable" kvsrv1' }],
      4: [{ name: '6.5840 Lab 3 — Raft (3A–3D)', url: `${LABS}/lab-raft1.html`, cmd: 'cd src && make RUN="-run 3A" raft1' }],
      5: [{ name: '6.5840 Lab 4 — fault-tolerant key/value service', url: `${LABS}/lab-kvraft1.html`, cmd: 'cd src && make RUN="-run 4B" kvraft1' }],
      6: [{ name: '6.5840 Lab 5 — sharded key/value service', url: `${LABS}/lab-shard1.html`, cmd: 'cd src && make RUN="-run 5A" shardkv' }],
    },
    benchmarks: [
      { id: 'cs520.raft', name: '6.5840 Raft tests (3A–3D): passing runs out of 100', how: 'Run the full Raft suite 100 times with -race; record how many runs pass every test.', max: 100, url: `${LABS}/lab-raft1.html` },
      { id: 'cs520.kv', name: '6.5840 key/value tests, Porcupine linearizability included: passing runs out of 100', how: 'Run the Lab 4 suite 100 times; record how many runs pass every test.', max: 100, url: `${LABS}/lab-kvraft1.html` },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs520.mid.votes', q: 'How many votes does a candidate need to become leader in the five-node cluster?', answer: 3, tol: 0,
          python: py(`from itertools import combinations
n = 5
print(min(k for k in range(1, n + 1) if all(set(a) & set(b) for a in combinations(range(n), k) for b in combinations(range(n), k))))`) },
        { id: 'cs520.mid.faults', q: 'How many of the five servers can crash while the cluster still commits entries?', answer: 2, tol: 0,
          python: py(`n = 5
print(max(f for f in range(n) if n - f > n // 2))`) },
      ],
    },
    anchors: {
      'midterm/Raft state correctness': anchor('All 3A–3D tests pass on 100 consecutive runs with the race detector on.', 'Passes most runs; an occasional failure is unexplained.', 'Tests fail regularly.'),
      'midterm/Partition and restart handling': anchor('In a 3–2 partition only the side of three elects and commits, and a restarted node catches up from persisted state.', 'Partitions handled; restart loses state.', 'Split brain or lost commits.'),
      'midterm/Deterministic evidence': anchor('The message log for the failing or chosen schedule is published and replays to the same outcome.', 'Logs exist but do not replay.', 'No evidence.'),
      'midterm/Safety reasoning': anchor('Conflicting entries are shown impossible from the election restriction, log matching and majority intersection, each used explicitly.', 'Right argument, one property missing.', 'Safety asserted, not argued.'),
      'final/Service correctness': anchor('Linearizable under Porcupine across 100 runs, with duplicate client requests applied exactly once.', 'Linearizable, with a deduplication bug.', 'Not linearizable.'),
      'final/Fault tolerance': anchor('Survives crashes, partitions and restarts; snapshots bound log growth and recovery is tested.', 'Survives crashes; snapshots untested.', 'Loses data under failure.'),
      'final/Consistency evidence': anchor('The exact contract written down (linearizable reads and writes, or otherwise) and checked by a history checker.', 'Contract stated, not checked.', 'Contract unclear.'),
      'final/Performance and defense': anchor('Throughput and tail latency measured under load and failure, with the bottleneck identified.', 'Measured without explanation.', 'Not measured.'),
    },
  },

  'ethics-of-computing-and-ai': {
    doc: 'docs/cs-term5-audit.md',
    outcomes: [
      o('cs530.argue', 'Build an ethical argument about a sociotechnical system, naming its premises and stakeholders.', ['SEP-Ethical-Analysis', 'SEP-Context'], [], [1], ['midterm', 'final']),
      o('cs530.harm', 'Weigh benefits and harms under uncertainty, base rates included.', ['SEP-Ethical-Analysis', 'AI-SEP'], ['eth.baserate'], [2], ['midterm']),
      o('cs530.govern', 'Assign responsibility and design governance that can actually be enforced.', ['SEP-Professional-Ethics', 'AI-SEP'], [], [3], ['midterm']),
      o('cs530.contest', 'Make automated decisions explainable and contestable.', ['AI-SEP', 'HCI-Accountability'], [], [4], ['midterm']),
      o('cs530.privacy', 'Protect privacy with measurable guarantees: k-anonymity and differential privacy.', ['SEP-Privacy'], ['eth.kanon', 'eth.dp'], [5], ['final']),
      o('cs530.fair', 'Measure fairness and know which criteria cannot hold together.', ['AI-SEP', 'SEP-DEIA'], ['eth.fairness', 'eth.baserate'], [6], ['midterm', 'final']),
      o('cs530.practice', 'Turn principles into practice: safeguards, stop conditions and review.', ['SEP-Professional-Ethics'], [], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'No practice at all', why: 'Fairness and privacy were argued in words only.', fix: 'Practice now computes fairness metrics, the base-rate trade-off, k-anonymity and differential-privacy noise.' },
      { what: 'The hearing\'s numbers were never worked', why: 'False-negative rates of 0.18 and 0.34 mean the second group\'s qualified applicants are rejected almost twice as often; the course never asks for that number.', fix: 'The answer checks below compute the equal-opportunity gap from the brief.' },
      { what: 'Nothing outside judged the reasoning', why: 'Arguments were self-assessed.', fix: 'The University of Helsinki\'s Ethics of AI course has peer-reviewed exercises; passing earns a certificate worth 2 ECTS through its Open University.', url: 'https://ethics-of-ai.mooc.fi/faq/' },
    ],
    benchmarks: [
      { id: 'cs530.mooc', name: 'Ethics of AI (University of Helsinki): assignments accepted', how: 'Passing needs 90% of assignments done and 80% accepted; record your accepted percentage.', max: 100, url: 'https://ethics-of-ai.mooc.fi/' },
      { id: 'cs530.response', name: 'A response from the reviewed system\'s owner', how: 'Send your final review to the organisation that runs the system; record 1 if they reply in substance.', max: 1, url: 'https://ethics-of-ai.mooc.fi/chapter-7/3-moving-forward-with-ethics' },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs530.mid.tpr', q: 'What is the equal-opportunity gap — the difference in true-positive rates — between the two groups? (2 decimal places)', answer: 0.16, tol: 0.001,
          python: py(`from fractions import Fraction as F
print(float((1 - F('0.18')) - (1 - F('0.34'))))`) },
        { id: 'cs530.mid.per100', q: 'Of 100 qualified applicants from each group, how many more from the second group are wrongly rejected?', answer: 16, tol: 0,
          python: py(`import random
# simulate 100 qualified applicants per group many times; the mean difference in rejections
r = random.Random(530); runs = 20000
d = sum(sum(r.random() < 0.34 for _ in range(100)) - sum(r.random() < 0.18 for _ in range(100)) for _ in range(runs)) / runs
print(round(d))`) },
      ],
    },
    anchors: {
      'midterm/Ethical reasoning': anchor('Premises stated, each affected right named, and the deploy/revise/pause/stop decision follows from them without a gap.', 'Sound conclusion with one premise unstated.', 'Conclusion asserted.'),
      'midterm/Evidence and uncertainty': anchor('The 0.16 equal-opportunity gap computed, AUC 0.78 interpreted with its uncertainty, and the effect of the 0.62 cut-off and the resume-gap feature examined.', 'Numbers quoted without analysis.', 'Numbers misread.'),
      'midterm/Governance feasibility': anchor('An appeal channel, an owner, monitoring per retrain and a stop condition, each with who does it and when.', 'Governance proposed without owners or triggers.', 'Principles only.'),
      'midterm/Stakeholder defense': anchor('Challenge questions answered from evidence, with corrections recorded after the hearing.', 'Defended, no corrections.', 'Could not defend.'),
      'final/Sociotechnical depth': anchor('The system analysed with its institutions, incentives and history, from primary sources.', 'Technical analysis only.', 'Secondhand summary.'),
      'final/Rights and distributional analysis': anchor('Who bears the harms and who gets the benefits, measured where data allows.', 'Groups named, effects not measured.', 'No distributional analysis.'),
      'final/Actionable safeguards': anchor('Each safeguard enforceable, with a measurable stop condition and an owner.', 'Safeguards without stop conditions.', 'Recommendations only.'),
      'final/Public reasoning and revision': anchor('Published, open to response, and revised after feedback from affected people.', 'Published, not revised.', 'Not public.'),
    },
  },

  'capstone-studio-1': {
    doc: 'docs/cs-term5-audit.md',
    outcomes: [
      o('cs540.discover', 'Find a real problem and back it with evidence from stakeholders.', ['HCI-User', 'SE-Requirements'], [], [1], ['midterm']),
      o('cs540.scope', 'Scope a project with measurable success criteria and explicit non-goals.', ['SE-Requirements'], ['se.delivery'], [2], ['midterm']),
      o('cs540.env', 'Make the development environment and history reproducible.', ['SE-Tools', 'SDF-Practices'], ['se.git'], [3, 4], ['final']),
      o('cs540.arch', 'Compare architecture options and retire risks with spikes.', ['SE-Design'], ['se.complexity'], [5], ['midterm']),
      o('cs540.measure', 'Debug, profile and measure a prototype.', ['SE-Validation', 'SF-Performance'], ['se.coverage', 'latency'], [6], ['final']),
      o('cs540.responsible', 'Plan for security, accessibility and failure.', ['SEC-Engineering', 'HCI-Accessibility'], ['web.contrast', 'hci.target'], [7], ['final']),
      o('cs540.plan', 'Plan delivery and defend a prototype.', ['SE-Teamwork', 'SEP-Communication'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'Units linked unrelated lectures', why: 'Problem discovery linked a shell lecture; scope linked shell scripting; architecture linked the command-line environment.', fix: 'Those units now link GOV.UK\'s guides to user needs and discovery, the command-line lecture, and architecture decision records; the weekly Missing Semester lectures stay.', url: 'https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs' },
      { what: 'No outside judge', why: 'The gates were judged by the learner.', fix: 'Evidence must come from stakeholders who are not classmates or friends; someone else must build the prototype from the README; Lighthouse scores its accessibility.' },
    ],
    benchmarks: [
      { id: 'cs540.stakeholders', name: 'Stakeholders interviewed who are not classmates or friends', how: 'Record how many people with the problem you interviewed, with notes kept.', max: 20, url: 'https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs' },
      { id: 'cs540.freshclone', name: 'Someone else built and ran it from the README alone', how: 'Hand a stranger the repository; record 1 if they get it running without asking you.', max: 1, url: 'https://missing.csail.mit.edu/2020/command-line/' },
      { id: 'cs540.lighthouse', name: 'Lighthouse accessibility score of the prototype', how: 'Run Lighthouse on the prototype\'s main screen; record the accessibility score.', max: 100, url: 'https://github.com/GoogleChrome/lighthouse' },
    ],
    anchors: {
      'midterm/Problem evidence': anchor('At least five outside stakeholders interviewed, with quotes and observed workarounds that show the problem is real and frequent.', 'Evidence from fewer people, or only from friends.', 'An assumed problem.'),
      'midterm/Scope testability': anchor('Every success criterion has a number and a test; non-goals are explicit.', 'Criteria present, some untestable.', 'Vague goals.'),
      'midterm/Architecture reasoning': anchor('Three real options compared on the requirements, with the choice recorded as an architecture decision record.', 'Options compared informally.', 'One option.'),
      'midterm/Risk retirement': anchor('Each fatal assumption tested by a spike with a result that kills or keeps it.', 'Spikes done, results inconclusive.', 'Fatal assumptions untested.'),
      'final/Prototype validity': anchor('A vertical slice that does the core job end to end for a real user.', 'Works on canned data only.', 'Mock-up only.'),
      'final/Engineering evidence': anchor('A stranger built it from the README; tests, profiles and acceptance checks committed.', 'Builds with help.', 'Cannot be built.'),
      'final/Responsible design': anchor('Threat model, accessibility checks (Lighthouse ≥ 90 and keyboard use) and failure modes covered.', 'One area missing.', 'Not considered.'),
      'final/Execution plan and defense': anchor('A plan with milestones, risks, an evaluation design and a handoff for Capstone II, defended under questions.', 'Plan without risks or evaluation.', 'No plan.'),
    },
  },
};
