# Computer Science, Term 2: audit and evidence

October 2026. This covers the five Term 2 courses:

- CS201 Data Structures and Abstractions
- CS210 Computer Architecture
- MATH210 Linear Algebra for Computer Science
- STAT210 Probability for Computing
- CS220 Web Engineering

The method is the one used for Term 1 ([cs-term1-audit.md](cs-term1-audit.md)). The design lives in [`js/degrees/curriculum/cs-term2.js`](../js/degrees/curriculum/cs-term2.js); the practice is in [`js/degrees/practice/`](../js/degrees/practice/): `datastructs.js`, `arch.js`, `linalg.js`, `prob.js` and `web.js`.

## Sources

| Source | Used for |
|---|---|
| [CS2023 Body of Knowledge](https://csed.acm.org/wp-content/uploads/2024/04/3.1-Body-of-Knowledge-1.pdf): AL-Foundational, SDF-Data-Structures, AR-*, MSF-Linear, MSF-Probability, SPD-Web, HCI-Accessibility | Mapping every outcome |
| [MIT 6.006 Fall 2011](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/) | Lectures, and Quiz 1, Quiz 2 and the final with solutions |
| [MIT 6.004 Spring 2017](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/) and [computationstructures.org](https://computationstructures.org/) | Chapters, labs and worksheets |
| [Nand2Tetris](https://www.nand2tetris.org/course) | Projects 1–5, each graded by its own test scripts |
| [MIT 18.06SC Fall 2011](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/) | Units, Exams 1 and 2, the final with solutions |
| [Harvard Stat 110](https://stat110.hsites.harvard.edu/) and its free textbook ([probabilitybook.net](http://probabilitybook.net/)) | Strategic practice, past exams with solutions |
| MDN Learn Web Development, WCAG 2.2, the Fetch and URL standards | Web outcomes and practice |
| [W3C Nu checker](https://validator.w3.org/nu/), [axe-core](https://github.com/dequelabs/axe-core), [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview), [HTTP Observatory](https://developer.mozilla.org/en-US/observatory) | Outside quality bars for the web course |

## What was wrong

1. **Outcomes were boilerplate.** Each course had one real outcome and the same two generic ones as every course.
2. **Rubric lines were templates.** For example, "ADT correctness … is scored from 'Source library and black-box tests'". None said what earns full marks.
3. **Links were dead or wrong:**
   - All of CS210's sixteen 6.004 weeks pointed at pages that do not exist.
   - Two CS201 weeks linked missing 6.006 pages, and one named the wrong lecture.
   - MATH210's problem-set weeks linked a page 18.06SC does not have.

   All are fixed (see [degree-links-audit.md](degree-links-audit.md)).
4. **CS210's midterm cannot be checked as written.** It asks for "the final architectural state" but gives no initial register or memory values, and whether BEQ is taken depends on them.
5. **CS201's resize rule was loose.** "Grow above load 0.75" does not say when the load is checked.
6. **CS201 has no balanced trees.** These are in CS2023's core (AL-Foundational 9b).
7. **CS210 mixes two instruction sets.** 6.004 Spring 2017 teaches its own Beta ISA; the practice and the flagship CPU project use RISC-V.
8. **STAT210 never linked its textbook.** Stat 110 is taught from a book its authors give away free.
9. **The web course's quality was judged by eye.** Accessibility, validity and performance were rubric lines you marked yourself.
10. **Borrowed practice was unchecked.** These courses borrow 22 practice skills from the Programming and AI tracks, and none of them had an independent check of its answers.

## What changed

- **Outcomes.** There are 40 in all, eight per course. Each is mapped to CS2023 and tied to its units, the practice that checks it, and the assessment that grades it. One outcome is judged by the rubric only: semantic HTML, which the W3C checker benchmarks instead.
- **New practice.** There are 40 new skills:
  - data structures (6): amortised arrays, stacks and queues, hashing, BSTs, array heaps, stable and radix sorting
  - architecture (10): Boolean functions and FSMs, IEEE 754, RISC-V tracing and encoding, critical paths, pipeline stalls, caches, AMAT, virtual memory, Amdahl
  - linear algebra (8): solving, rank and the four subspaces, determinants, inverses, least squares, eigenvalues and powers, singular values, Markov steady states
  - probability (8): collisions, Bayes, independence, discrete distributions, continuous tails, covariance, the CLT with continuity correction, indicators
  - web (8): the event loop, URL resolution, CSS specificity, WCAG contrast, HTTP freshness, CORS preflights, SQL injection, load-time budgets
- **Independent checks on borrowed skills.** All 22 borrowed skills now carry an independent Python check. That includes the three Term 1 borrows (gcd, modpow, derivatives), which had none either. The Programming and AI tracks benefit too.
- **Marking anchors.** All 40 rubric lines now say what full, about half and zero credit look like.
- **Answer checks.** There are 11, each reproduced by its own program:

  | Course | Answer |
  |---|---|
  | CS201 | final capacity 16,384 after 11 resizes |
  | CS210 | SW writes back in cycle 11, after 1 stall (branch not taken) |
  | MATH210 | rank 3; dim N(Aᵀ) = 1; x̂₁ = 2; ‖b − Ax̂‖ = √3 ≈ 1.732 |
  | STAT210 | P(D \| +) = 0.4157; P(D \| −) = 0.0026; expected empty servers 0.3436 |

- **Problem sets with outside graders.**
  - Nand2Tetris Projects 1–5 for CS210, graded by their own test scripts.
  - Stat 110 Strategic Practice, with official solutions.
- **Outside benchmarks.** There are 14:
  - 6.006 Quiz 1, Quiz 2 and the final
  - Nand2Tetris Projects 1–5
  - the 6.004 worksheets
  - 18.06SC Exams 1 and 2 and the final
  - a Stat 110 midterm and final
  - for the web course: W3C zero errors, axe zero violations, the Lighthouse floor, and the Observatory score

## CS2023 coverage

This counts the topics an outcome is mapped to, for the knowledge units Term 2 teaches.

| Knowledge unit | Covered | Notes |
|---|---|---|
| MSF-Probability (CS Core) | 6 of 6 | |
| MSF-Linear (CS + KA Core) | 7 of 8 | Bezier curves (6) are left to Computer Graphics. |
| SPD-Web (KA Core) | 5 of 5 | |
| AL-Foundational (CS Core) | 10 of 13 | Balanced trees (9b) are recorded as a gap with a fix. Records (3) are taught in CS101. Shortest paths and MSTs (13) are taught in CS301. |
| AR-Representation (CS Core) | 3 of 6 | Items 2–4 are mapped (bits, two's complement, number bases and floats). |
| AR-Memory (CS Core) | 4 of 9 | Locality, latency, caches and virtual memory are mapped. Persistent memory, coherence, fault handling and error coding are not. |

## Verification

Every new question and every borrowed one was run against its independent check, 30 questions per skill:

| Run | Skills | Agree | Disagree | By construction |
|---|---|---|---|---|
| Term 2 new skills plus every skill borrowed by Terms 1–2 | 61 | **1,800** | **0** | 30 (the big-O lookup table) |

The checks use several kinds of independent route:

- **Python's own libraries:** `heapq`, `collections`, `struct` for floats, and `math.erf`.
- **Exact arithmetic:** Python's `Fraction`, and power iteration for eigenvalues and singular values.
- **Separate implementations:**
  - a RISC-V interpreter
  - a cycle-by-cycle pipeline model, checked against the generator's distance rule
  - an LRU cache simulator
- **Node itself** for the event loop and URL resolution.
- **sqlite3** for SQL injection.

The repo tests run two questions per skill on every change, reproduce all 16 answer keys from Terms 1 and 2, and check that every outcome, rubric line, anchor and benchmark resolves.

## Still unverified

- **Outside graders were not run here.** The Nand2Tetris simulators are Java tools.
- **Benchmarks rely on honest self-marking** against official solutions.
- **The anchors are mine** and have not been calibrated against a second marker.
- **Course tests are unvalidated** until several learners' attempts can be pooled (see `tools/item-stats.mjs`).
- **Stat 110's site refuses scripts**, so its links were checked by hand in a browser.
- **The big-O questions are a hand-written lookup table**, checked by reading, not by a program.
