# Computer Science, Term 1: audit and evidence

October 2026. This covers the five Term 1 courses of the CS degree:

- CS101 Programming I
- MATH110 Discrete Mathematics
- MATH120 Calculus
- CS110 Computer Systems Foundations
- PROF110 Technical Communication

It says what was checked, what was wrong, what changed, how the changes were verified, and what is still unverified.

The course design itself lives in [`js/degrees/curriculum/cs-term1.js`](../js/degrees/curriculum/cs-term1.js). The practice it points at lives in [`js/degrees/practice/`](../js/degrees/practice/).

## Sources

The audit started from the primary documents, not from summaries of them.

| Source | Used for |
|---|---|
| [ACM/IEEE-CS/AAAI CS2023 Body of Knowledge](https://csed.acm.org/wp-content/uploads/2024/04/3.1-Body-of-Knowledge-1.pdf) | Mapping each outcome to its knowledge units and coverage |
| [MIT 6.042J Fall 2010](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/) (problem sets and exams with solutions) | Discrete-maths practice and outside benchmarks |
| [MIT 18.01SC Fall 2010](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/) (exams 1–4 and final, with solutions) | Calculus practice (the related-rates item is the final's problem 6) and benchmarks |
| [Harvard CS50P](https://cs50.harvard.edu/python/) and [CS50x 2026](https://cs50.harvard.edu/x/2026/) | Units, problem sets, and the check50 command on each problem page |
| [Google Technical Writing One and Two](https://developers.google.com/tech-writing) | Voice, lists and audience |
| [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/) via [markdown-it-py](https://github.com/executablebooks/markdown-it-py) | Markdown items |
| [W3C WAI images tutorial](https://www.w3.org/WAI/tutorials/images/decision-tree/) | Alt-text items |
| The Course Atlas catalogue export | The course design being audited |

## What was wrong

1. **Outcomes were boilerplate.** Each course had three. In every course, two of them were the same sentence with the course name swapped in. None of them could be checked.
2. **Rubric lines were generated from a template.** Their descriptions did not say what full, partial or no credit looks like. Some named evidence the assessment does not ask for.
3. **9 of 66 links were wrong:**
   - 7 returned 404.
   - 1 returned 503 (a renamed MIT page).
   - 1 was live but pointed at the wrong page: CS110's week 16 linked CS50's academic-honesty page instead of the final-project brief.
   - The two 6.042J links went to the Spring 2015 edition, which has readings only. Its assignments and exams pages no longer exist.
4. **CS101 units 7–8 lacked their problem sets.** They linked the CS50P lectures for weeks 6–8 but not the problem sets.
5. **Recursion was missing.** CS2023 puts recursion in the CS Core (SDF-Fundamentals 8), and CS50P does not teach it.
6. **CS110 requires CS101 in the same term.** So CS110 cannot start until CS101 passes. This is documented, not changed: the learner can unlock it.
7. **A practice generator had a real bug.** The C linked-list question declared a variable it never used. Under CS50's own compiler flags (`-Wall -Werror`), that program does not compile. It was caught by compiling every generated program.

## What changed

- **Outcomes.** There are 38 outcomes across the five courses (9, 8, 6, 8, 7).

  Each one names:
  - its CS2023 knowledge units
  - the units that teach it
  - the practice skills that check it
  - the assessment that grades it

  Three outcomes have no skill, because the app cannot mark them: writing for an audience, writing procedures, and evaluating sources. The course page labels them "judged by the rubric".
- **Practice.** There are 43 new skills:
  - discrete maths: 13
  - calculus: 11
  - C, memory and SQL: 11
  - Python (return, files, unit tests, recursion): 4
  - writing: 4

  Unit practice now follows the outcomes mapped to each unit.
- **Marking anchors.** Every rubric line in Term 1 (40 lines) now says what full, about half, and zero credit look like.

  The anchors never state an answer the learner is asked to compute. A repo test checks that every rubric line has anchors.
- **Answer-key checks.** These are numbers the learner computes inside an assessment, which the app checks against its own program:
  - MATH110 midterm: odd vertices = 4, so no Euler trail.
  - MATH120 midterm: the optimum is at x = 10 with C = 22, and the error bound is 1.0175.
- **Problem sets with check50.** There are 62 problems: 41 in CS101 and 21 in CS110. Each sits under its unit with CS50's own check50 command, read from the problem's page.
- **Measurement.** Each course has a placement test and an end-of-course test.
  - Each test has one question per checkable outcome, at level 4.
  - Each question is generated fresh, so the two tests are parallel forms, not the same questions.
  - Nothing levels up. Results are kept outcome by outcome.
  - Every marked answer goes into an attempt log (`S.log`, newest 4,000). Each entry records the skill, level, outcome, time, and right or wrong.
- **Outside benchmarks.** Each course page has a place to record scores that come from neither the learner nor this app:

  | Course | Benchmark | Marked by |
  |---|---|---|
  | CS101 | 41 CS50P problems | check50 |
  | CS101 | final project | CS50 (`submit50`) |
  | MATH110 | 6.042J midterm and final | MIT's solutions |
  | MATH120 | 18.01SC exam 1 and final | MIT's solutions |
  | CS110 | 21 CS50x problems | check50 |
  | CS110 | a clean sanitizer run | the sanitizer |
  | PROF110 | peer usability trial | a peer |
  | PROF110 | automated accessibility and Markdown checks | the checkers |

- **Links.** All 9 are fixed at import ([`tools/import-atlas.mjs`](../tools/import-atlas.mjs) applies `LINK_FIXES`). After the fix, all 65 distinct Term 1 links return 200.

## CS2023 coverage

This counts the topics in the knowledge units Term 1 touches that at least one outcome is mapped to. Later terms cover more; Term 1 is not meant to cover all of these.

| Knowledge unit | Covered | Missing |
|---|---|---|
| MSF-Discrete (CS Core) | 8 of 8 | none |
| SDF-Fundamentals (CS Core) | 10 of 12 | 11 documenting code (graded by the CS101 rubric, not mapped); 12 security mindset (touched by CS110's memory-safety outcome) |
| AR-Representation (CS Core) | 4 of 6 | 1 history of architecture; 6 records and UTF |
| SEP-Communication (CS Core) | 3 of 6 | 1 and 4 team communication and collaboration; 6 cultural competence |
| SDF-Practices (CS Core) | 2 of 4 | 3 style (rubric only); 4 natural-language module specs |
| MSF-Calculus (KA Core) | 6 of 9 | 4 parametric and polar; 6 multivariate; 9 gradient descent (left to Linear Algebra and Machine Learning) |

Across the five CS Core units, that is **27 of 36 topics (75%)**.

## Verification

Every practice question carries a second route to its answer that does not go through the generator. [`tools/verify-generators.mjs`](../tools/verify-generators.mjs) runs it:

- **Python items:** real Python runs the program.
- **C items:** compiled with `cc -std=c11 -Wall -Werror` and run.
- **Memory-safety items:** run under Guard Malloc, with lldb reporting the crashing line, on macOS. Elsewhere they run under AddressSanitizer.
- **SQL items:** run by sqlite3.
- **Markdown items:** rendered by markdown-it-py.

The rest (voice, list type, alt text) are right by construction, following the rule their source states.

| Run | Agree | Disagree | By construction |
|---|---|---|---|
| All 61 degree skills, 8 questions each (`node tools/verify-generators.mjs 8`) | 456 | 0 | 24 |
| Writing, with markdown-it-py installed | 16 | 0 | 16 |
| Earlier, per module during development | about 400 | 0 (after fixes) | — |
| Every assessment answer key, reproduced by its own program | 5 | 0 | — |

The repo tests (`npm test`) cover:
- Two questions per Term 1 skill, checked the same way.
- That every outcome, unit, rubric line, anchor and benchmark resolves.
- That none of the nine broken links is left.
- The placement test end to end: one question per outcome, results per outcome, no level changes, one sitting a day, and every answer logged.
- Benchmark and answer-key recording.
- That item statistics flag a question that does not discriminate, and refuse to guess from too few sittings.

**380 tests pass.**

[`tools/item-stats.mjs`](../tools/item-stats.mjs) reads the attempt log from one or more backups. It reports:
- difficulty (share right), per skill and per level
- median time
- point-biserial discrimination for each course-test item
- Hake's normalised gain from placement to end-of-course

On 40 simulated learners with known ability, it ranked the items by difficulty correctly. It also gave a coin-toss item a discrimination of 0.08, against 0.55–0.66 for the real items.

## Still unverified

- **Item statistics describe one learner.** Difficulty and time from one backup describe you, not the questions. Discrimination needs at least 30 sittings, from several people's backups. Until then, the course tests are unvalidated, and 6–9 questions is too few to place a single learner reliably.
- **The anchors are mine.** No second marker has used them, so agreement between markers is unmeasured. Writing in PROF110 is judged by the rubric and a peer, never by the app.
- **check50 was not run.** Every command is copied from the problem's page on CS50's site, but check50 needs a GitHub login to CS50, so none was run here.
- **MIT benchmarks depend on honest marking.** The app records what the learner reports after marking against MIT's solutions; it cannot see the paper.
- **The Course Atlas import is untested on a real file.** It is tested on a constructed backup, not on your real export from model_uni.
- **Only Term 1 was audited.** Terms 2–6 of CS, and the other four degrees, still carry the original Course Atlas outcomes and rubrics.
