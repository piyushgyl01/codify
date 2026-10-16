# Computer Science, Term 4: audit and evidence

October 2026. This covers the five Term 4 courses:

- CS330 Software Engineering
- CS401 Theory of Computation
- CS420 Compilers and Language Implementation
- CS430 Computer Security
- CS440 Human–Computer Interaction

The method is the one used for Terms 1–3. The design lives in [`js/degrees/curriculum/cs-term4.js`](../js/degrees/curriculum/cs-term4.js); the practice is in [`js/degrees/practice/`](../js/degrees/practice/): `se.js`, `theory.js`, `compilers.js`, `security.js` and `hci.js`.

## What was wrong

1. **Outcomes and rubrics were boilerplate**, as in every course before the audit.
2. **Two courses had no practice at all:** Theory of Computation and Compilers. HCI had none either.
3. **Security's practice was unrelated to the course:** modular arithmetic and string hashing, nothing about web security.
4. **Software Engineering borrowed an unchecked Git question** from the Robotics track.
5. **Theory had no exams to practise on.** 6.045J Spring 2011 publishes none on OCW.
6. **HCI's eight units all linked the course front page.** The course assessed usability in words only.
7. **Nothing outside the app judged** engineering practice, interpreter conformance or exploit success.

## What changed

- **Outcomes.** There are 40 in all, eight per course, each mapped to CS2023, its units, practice and assessments.
- **New practice.** There are 37 new skills:
  - software engineering (6): Git ranges and merges, branch coverage, cyclomatic complexity, npm ranges, delivery metrics, flaky CI
  - theory (7): DFAs, regular expressions, the subset construction, minimisation, grammars, Turing machines, decidability
  - compilers (6): precedence, scanning, FIRST sets, a stack VM, mark-sweep GC, register allocation
  - security (6): password entropy, RSA, path traversal, SameSite cookies, CSP, JWTs
  - HCI (7): Fitts, Hick, the keystroke-level model, SUS, test sample sizes, adjusted-Wald intervals, WCAG target size
- **Outside graders:**
  - OpenSSF Scorecard and merged pull requests (software engineering)
  - MIT 18.404J exams with solutions (theory)
  - the Crafting Interpreters clox suite (compilers)
  - PortSwigger's Academy, which marks labs solved, and the OverTheWire Bandit levels (security)
  - SUS from real participants, and axe (HCI)
- **Answer checks.** There are 3, each reproduced by its own program:

  | Theory midterm | Answer |
  |---|---|
  | minimal DFA for L1 | 4 states |
  | minimal DFA for L2 | 5 states, counting the dead state |
  | strings of length ≤ 8 in L1 | 63 |

  I recomputed the minimal sizes with longer distinguishing strings (length 10); they are stable.
- **Marking anchors** for all 40 rubric lines.

## Verification

Each check takes a different route from the generator:

| Topic | Independent check |
|---|---|
| Git | real `git` in a throwaway repository |
| branch coverage | real execution with instrumented conditions |
| complexity | Python's `ast` module |
| regular expressions | Python's regex engine, against JavaScript's |
| minimisation | Myhill–Nerode distinguishing strings, against the generator's partition refinement |
| grammars | a memoised membership parser over every string |
| expressions | Python's own parser |
| register allocation | brute-force colouring |
| path traversal | Python's `posixpath` |
| JWTs | Node decoding the token |
| WCAG target size | circle-overlap geometry |

| Module | Agree | Disagree | By construction |
|---|---|---|---|
| se | 180 | 0 | |
| theory | 180 | 0 | 30 (decidability facts) |
| compilers | 240 | 0 | |
| security | 240 | 0 | |
| hci | 420 | 0 | |

One check was redone during the audit. The first target-size check repeated the generator's own formula, so it was not independent. Rewriting it as geometry showed the spacing rule should use the distance between button centres, not the smaller dimension; the generator was corrected.

## Still unverified

- **The outside graders were not run here:** Scorecard, the clox suite, the Academy and Bandit.
- **The anchors and course tests** have the same limits as in earlier terms.
- **The decidability classifications are standard results** checked by reading, not by a program.
