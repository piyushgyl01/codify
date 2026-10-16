# Mathematics, Term 5: audit and evidence

October 2026. This covers the last seven Mathematics courses:

- Dynamical Systems
- Advanced Probability and Statistics
- Mathematics, Society, and Responsible Modeling
- Senior Research Thesis
- Algebraic Geometry and Representation Theory
- Calculus of Variations and Continuum Models
- Algorithms, Complexity, and Coding

With these, all 34 Mathematics courses are audited. The method is the one in [math-term0-audit.md](math-term0-audit.md); the design is in [`js/degrees/curriculum/math-term5.js`](../js/degrees/curriculum/math-term5.js).

## What was wrong

Every course had no unit links and no rubric. Most also had a resource that did not fit:

| Course | Catalogue resource | Problem |
|---|---|---|
| Algebraic Geometry and Representation Theory | MIT 18.735, a research seminar on double affine Hecke algebras | far beyond an undergraduate course |
| Dynamical Systems | 18.385J (Fall 2014) | six handouts; its text (Strogatz) is not free |
| Advanced Probability and Statistics | 18.655, mathematical statistics | nothing on measure-theoretic probability or martingales |
| Calculus of Variations | 18.354J, continuum dynamics | one chapter on variational calculus |
| Algorithms, Complexity, and Coding | 6.895, coding theory | nothing on algorithms or complexity |
| Mathematics and Society | a society's 2021 discussion schedule | not the lectures it discusses |

## What changed

| Course | Readings | Outside graders |
|---|---|---|
| Dynamical Systems | Teschl's free *ODEs and Dynamical Systems*, by chapter; 18.385J's bifurcation handouts | Feigenbaum's δ recovered from your own diagram |
| Advanced Probability and Statistics | 18.175 (Theory of Probability) for probability; 18.655 for statistics | OSF preregistration |
| Mathematics and Society | Chiodo's eight lectures, *Ethics for the Working Mathematician*, linked by lecture; papers on measurement, auditing, impossibility and feedback loops | a response from the audited system's owner |
| Senior Research Thesis | 21W.794 sessions; 18.821; Tao on writing; arXiv | arXiv moderation; an outside examiner |
| Algebraic Geometry and Representation Theory | Milne's free *Algebraic Geometry* and Etingof et al.'s free *Introduction to Representation Theory*, opened at each section | GAP's character tables; Milne's published solutions |
| Calculus of Variations | Olver's free notes; 18.354J for continuum models; 18.085 for finite elements | FEniCS as a reference solver |
| Algorithms, Complexity, and Coding | 6.046J and 18.404J lectures for algorithms and complexity; 6.895 for codes | 6.046J and 18.404J final exams with solutions |

- **Outcomes.** There are 49, with 14 rubrics and 56 anchored lines.
- **Practice.** It draws on the skills added in Term 4 (dynamics, statistics, representations, geometry, coding) and earlier terms.
- **Readings.** All 56 links returned 200 on 16 October 2026. The page offsets were measured from each PDF's own text; in Teschl, Milne, Etingof and Olver the PDF page equals the printed page.

## The Mathematics degree as a whole

| Measure | Count |
|---|---|
| Courses audited | 34 |
| Units with a named reading | 272 (all links checked) |
| Rubrics | 68 |
| Anchored rubric lines | 272 |
| New practice skills, in seven modules, each with an independent check | about 100 |

**The checks caught six real errors** in the first drafts:

- a Cauchy–Riemann case
- the principal argument on the negative axis
- a Jordan-form matrix that was not unimodular
- a Bézout question where the two curves coincided
- two checks that only repeated the generator's own formula

## Still unverified

- **The outside graders were not run here.**
- **No free text for one topic.** Direct methods in the calculus of variations (Unit 3 of MATH612) are covered by no free text found; the gap is recorded on the course page.
