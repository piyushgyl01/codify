# Degree links: audit

16 October 2026. Every link in all five degrees was checked: course resources, unit sources and weekly assignments.

## Before

There were **533** distinct links.

- **496** loaded.
- **26** were dead:
  - 21 returned 404.
  - 1 returned 500, and its replacement site also failed.
  - 2 sites no longer resolve or answer at all.
  - 1 used a hostname (www.) that stopped answering.
  - 1 was a whole MIT course removed from OpenCourseWare.
- **11** refused automated requests (403 or a Cloudflare challenge). Each was opened in a real browser and loads there: Harvard's Stat 110 site, ACM, Feynman Lectures, All About Circuits, ngspice, the GNU Radio wiki, SIAM.

## What was dead, and why

Most of the dead links came from MIT OpenCourseWare reorganising its sites, or from the catalogue naming pages that never existed.

| Course | Problem | Fix |
|---|---|---|
| CS210 Architecture | All 16 weeks pointed at 6.004 pages (lecture notes, labs, exams) that do not exist. 6.004 Spring 2017 is organised as 21 chapters. | Each week links its chapter. Labs and worksheets come from computationstructures.org, 6.004's own site. |
| CS510 Machine Learning | 6.036 Fall 2020 on OCW is now only a landing page. | The notes of its successor, MIT 6.390 (introml.mit.edu), and 6.036's exercises on MIT Open Learning Library. |
| CS301 Algorithms | The weeks named 6.046J lectures by the wrong numbers and titles. "Lecture 5 — Greedy: MST" is really Lecture 12; Lecture 5 is amortization. | Matched by topic to the real lectures (1, 10, 12, 13, 17). Titles corrected. |
| CS201 Data Structures | Two 6.006 lecture pages renamed. One week named "Lecture 11 — Integer Sorting", which is really Lecture 7. | Linked to the real lectures. Titles corrected. |
| CS401 Theory | 6.045J has no exams on OCW. | Sipser's 18.404J exams, which cover the same material. |
| MATH210 Linear Algebra | 18.06SC has no assignments page; it is organised by unit. | The unit pages. |
| CS340 Networks | CS144 checkpoints 5 and 7 are not posted this quarter. | The CS144 site. |
| CS610 Research Methods | The Mixtape's Remix edition renamed chapters 4 and 5. | The renamed chapters. |
| EE302, ROB401, ROB402, ME CTRL401 | fbsbook.org redirects to a wiki that returns 500. | The Feedback Systems PDF on Caltech's site. |
| ME MANU401 | 2.008 Spring 2004 was removed from OCW. | 2.008 Spring 2025. |
| ME LAB401 | 2.671 was removed from OCW. | The NIST/SEMATECH e-Handbook of Statistical Methods. |
| MATH305 | The University of Arizona open-textbook site no longer resolves. | SIAM's math-modeling handbooks. |
| EE205, EE303 | www.nptel.ac.in stopped answering. | nptel.ac.in. |

## After

There are **543** distinct links, and every one that was dead has been replaced.

- **527** load.
- **11** refuse scripts but load in a browser (checked by hand).
- **5** did not answer in time from this network. Two of them (Crafting Interpreters on GitHub, CMU 15-210) loaded in the first run. LTspice and OpenModelica are the official pages of real tools. The IEEE code-of-ethics page answered 202.

## Where the fixes live

The fixes are in `js/degrees/curriculum/corrections.js`, applied when the catalogue is imported (`tools/import-atlas.mjs`).

- `LINK_FIXES` replaces a dead link everywhere it appears.
- `PLACE_FIXES` corrects one week or unit, for when one dead link stood for different things, or a title named the wrong lecture.

Tests check that no dead link is left and that all 66 per-place fixes landed.
