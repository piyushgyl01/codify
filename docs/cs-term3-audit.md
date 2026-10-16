# Computer Science, Term 3: audit and evidence

October 2026. This covers the five Term 3 courses:

- CS301 Algorithm Design and Analysis
- CS310 Operating Systems
- CS320 Database Systems
- CS340 Computer Networks
- CS410 Programming Languages

The method is the one used for Terms 1 and 2. The design lives in [`js/degrees/curriculum/cs-term3.js`](../js/degrees/curriculum/cs-term3.js); the practice is in [`js/degrees/practice/`](../js/degrees/practice/): `algos.js`, `os.js`, `db.js`, `net.js` and `pl.js`.

## Sources

| Source | Used for |
|---|---|
| CS2023: AL-Strategies, AL-Complexity, OS-*, DM-*, NC-*, FPL-* | Mapping every outcome |
| [MIT 6.046J Spring 2015](https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/) | Lectures, quizzes with solutions |
| [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/) and [its homework simulators](https://github.com/remzi-arpacidusseau/ostep-homework) | Readings, and problem sets that print their own answers (`-c`) |
| [MIT 6.1810 xv6 labs](https://pdos.csail.mit.edu/6.1810/) | Kernel labs graded by `make grade` |
| [CMU 15-445](https://15445.courses.cs.cmu.edu/fall2024/) and [BusTub](https://github.com/cmu-db/bustub) | Projects with test suites; SQL homework |
| [PG Exercises](https://pgexercises.com/) | SQL with an answer checker |
| [Stanford CS144](https://cs144.github.io/) | Checkpoints with test suites |
| [Kurose–Ross interactive problems](https://gaia.cs.umass.edu/kurose_ross/interactive/) | Networking problems with answers |
| [PLAI](https://www.plai.org/) and [Crafting Interpreters](https://craftinginterpreters.com/) | Readings, and a public interpreter test suite |

## What was wrong

1. **Outcomes and rubrics were boilerplate**, as in every course before the audit.
2. **Four of five courses had no practice at all:** OS, databases, networks and programming languages. The fifth, algorithms, borrowed 13 Programming-track skills, nine of which had no independent check.
3. **CS301's weeks cited 6.046J lectures by the wrong numbers and titles.** Corrected by topic (see [degree-links-audit.md](degree-links-audit.md)).
4. **CS301's final named an unnamed reduction target:** "the course's named NP-hard target".
5. **CS310's midterm trace is underspecified.** It does not say which pages each burst touches or how CPU and I/O alternate, so two correct simulators can disagree.
6. **CS310 never touches a real kernel.** Every unit simulates.
7. **CS320's units all linked the same schedule page.**
8. **Two CS340 checkpoint PDFs are not posted this quarter.**
9. **CS410's interpreters had no outside grader.**

## What changed

- **Outcomes.** There are 40 in all, eight per course, each mapped to CS2023, its units, its practice and its assessments.
- **New practice.** There are 37 new skills:
  - algorithms (5): master theorem and exact recurrences, weighted interval scheduling (where greedy fails), max flow and min cut, vertex cover and its 2-approximation, 3-SAT and the vertex-cover reduction
  - operating systems (7): fork trees, scheduling metrics, page replacement (FIFO, LRU, OPT, clock), TLB effective access time, the lost-update race, inode file sizes, the banker's algorithm
  - databases (8): SQL semantics including NULL traps, FD closures and candidate keys, BCNF, join I/O costs, B+ tree height, conflict serializability, WAL recovery, cardinality estimates
  - networks (8): delay, CIDR, longest-prefix match, TCP sequence and ACK numbers, Reno's window, the Internet checksum, the bandwidth-delay product, fragmentation
  - programming languages (6): lexical and dynamic scope, loop closures, folds, let-shadowing, Church numerals, evaluation strategies
- **Independent checks on borrowed skills.** The nine remaining unchecked Programming-track skills these courses borrow now carry independent checks: ops, binary search, two pointers, intervals, Dijkstra, MST, knapsack, LIS and LCS.
- **Outside graders, in every course:**
  - OSTEP simulators and xv6 `make grade` (OS)
  - the BusTub test suites and PG Exercises (databases)
  - the CS144 checkpoint suites and the Kurose–Ross problems (networks)
  - the Crafting Interpreters test suite (programming languages)
  - the 6.046J quizzes and a Codeforces rating (algorithms)
- **Answer checks.** There are 10, each reproduced by its own program:

  | Course | Answer |
  |---|---|
  | CS301 | weighted-interval optimum 22, while earliest-finish greedy gets 19 (the midterm's counterexample) |
  | CS301 | max flow 5; reduction target k = 10 |
  | CS320 | after a crash past the commit flush, B = 15; before the commit, A = 10 |
  | CS340 | 8 bytes delivered; 1 retransmission |
  | CS410 | 3 under lexical scope, 11 under dynamic |

- **Marking anchors** for all 40 rubric lines.

## What the independent checks caught

Two generators I wrote were wrong, and the checks caught both before release:

- **Database recovery.** The first version produced logs where one transaction overwrote an item another had written but not committed (a dirty write). Undoing the uncommitted one then clobbered a committed value: Python's literal undo and the generator disagreed on 7 of 320 questions. Real databases rule this out with strict two-phase locking, so the generator now enforces it. Afterwards, 480 of 480 agree.
- **Church numerals.** EXP m n = n m is m to the power n; the generator had n to the power m. Python, running the actual lambdas, disagreed on 9 of 300. Afterwards, 480 of 480 agree.

This is the point of computing every answer twice, by different routes.

## Verification

Each check takes a different route from the generator:

| Topic | Independent check |
|---|---|
| fork questions | real `fork()` calls in Python, counting processes through a pipe |
| the lost update | exhaustive search over every interleaving (confirming the surprising minimum of 2) |
| scheduling and paging | separate simulators |
| SQL | sqlite3 |
| CIDR and longest-prefix match | Python's `ipaddress` module |
| maximum flow | brute force over every cut (max-flow = min-cut) |
| vertex cover and satisfiability | brute force |
| MST | Prim's algorithm, while the generator uses Kruskal's |
| scope | a mini-interpreter that runs both scoping rules |
| loop closures | real JavaScript in Node |

All 40 per skill (60–80 for the fixed ones):

| Module | Agree | Disagree |
|---|---|---|
| algos | 200 | 0 |
| os | 280 | 0 |
| db | 480 | 0 |
| net | 400 | 0 |
| pl | 480 | 0 |
| nine borrowed Programming skills | 360 | 0 |

The repo tests run every Term 1–3 skill on every change, reproduce all 26 answer keys, and check that every outcome, rubric line, anchor and benchmark resolves.

## CS2023 coverage

This counts the topics an outcome is mapped to.

| Knowledge unit | Covered | Notes |
|---|---|---|
| AL-Strategies (KA) | brute force, divide and conquer, greedy, DP, reductions | Covered by name. |
| AL-Complexity | asymptotics, P, NP, NP-completeness, reductions, approximation | |
| OS (CS core) | Process, Scheduling, Memory, Concurrency, Files, Faults | Protection and Virtualization are not mapped. |
| DM (CS core) | Relational, Querying, Modeling, Processing, Internals | NoSQL, Security and Distributed are left to later terms. |
| NC (CS core) | Fundamentals, Applications, Reliability, Routing, SingleHop, Security | Mobility is not mapped. |
| FPL | Functional, Types, Translation, OOP, Constructs, Run-Time, Formalism, Design | |

## Still unverified

- **The outside graders were not run here:** OSTEP, xv6, BusTub, CS144 and Crafting Interpreters. Their commands and pages were checked; the suites need their toolchains (QEMU, CMake, Dart).
- **CS310's midterm** still depends on your stated reading of an underspecified trace.
- **The anchors and course tests** have the same limits as in Terms 1–2.
