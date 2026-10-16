# Mathematics, Term 0: audit and evidence

October 2026. This covers the five first courses of the Mathematics degree:

- MATH101 Calculus I
- MATH102 Introduction to Proofs and Logic
- MATH103 Linear Algebra I
- MATH104 Discrete Mathematics
- MATH105 Mathematical Programming

The design lives in [`js/degrees/curriculum/math-term0.js`](../js/degrees/curriculum/math-term0.js), the readings in [`tools/readings/math.mjs`](../tools/readings/math.mjs), and the new practice in [`js/degrees/practice/mathfound.js`](../js/degrees/practice/mathfound.js).

## How these courses differ from CS

The Course Atlas catalog for Mathematics, Physics, EE and ME is thinner than for CS:

- **No unit links.** Every unit said "use the primary resource" without naming a lecture or chapter.
- **No rubrics.** Every assessment was a single score with nothing to mark against.
- **No assessment stages.** No weekly plan either.
- **Boilerplate outcomes** — three generic sentences per course.

So the audit does more here than in CS:

- **Readings.** Each unit gets a reading that names the lectures or chapters, opening the source at the right place.
- **Stages.** Each assessment gets one, read from its title (applied or final).
- **Rubrics.** Each assessment gets four lines of 25 points, 15 for partial work as in CS, with marking anchors.

The importer writes these into the catalog (`tools/import-atlas.mjs`).

## Standards

CS2023 does not apply here. Outcomes are mapped to two standards:

- **The QAA Subject Benchmark Statement** for Mathematics, Statistics and Operational Research (2023), cited by paragraph:
  - 3.8 core calculus, linear algebra and probability
  - 3.13 assumptions
  - 3.14 abstraction and proof
  - 3.16–3.17 numerics and programming
  - 3.18–3.19 modelling
  - 3.26 general skills
- **ETS's GRE Mathematics Subject Test areas:** Calculus, Algebra, Additional topics.

MAA's CUPM guide would be the natural US reference, but maa.org serves it only after a bot check, so it is not cited.

## What changed

| Course | Readings | Practice before → after | Outside graders |
|---|---|---|---|
| Calculus I | 18.01 (Fall 2005) lectures, by unit | differentiation only → limits, approximation, MVT, optimisation, related rates, integrals, trapezoid, improper integrals, series, Taylor | 18.01 unit exams and practice final, with MIT's solutions |
| Proofs and Logic | Book of Proof chapters, opened at their page | none → equivalence, validity, quantifiers, relations, counting functions, pigeonhole, invariants | Lean, through Mechanics of Proof; Book of Proof's published solutions |
| Linear Algebra I | Hefferon chapters and sections, opened at their page | dot product, matrix multiplication → elimination, rank, determinants, inverses, least squares, eigenvalues, projection, floating point | Hefferon's book of answers; 18.06SC Exam 1 and Final |
| Discrete Mathematics | Levin (4th ed.) sections | five competitive-programming skills → plus equivalence, recurrences, invariants, graphs, counting, Fermat, inverses, probability | Levin's selected solutions; 6.042J Fall 2010 midterm |
| Mathematical Programming | 18.S191 (Fall 2022) lectures | Python basics → plus floating point, Newton's method, testing | the 18.S191 notebooks' own checks; Project Euler |

- **New practice.** There are 8 new skills: series, improper integrals, the mean value theorem, relations, counting functions, orthogonal projection, floating point and Newton's method.
- **Rubrics.** 10 rubrics with 40 anchored lines.
- **Outcomes.** 38 in all.

## Verification

| Skill | Independent check |
|---|---|
| series | partial sums to 2,000,000 terms; the root test numerically for the radius |
| improper integrals | numerical integration after x = eᵘ, at two lengths, to detect divergence |
| mean value theorem | bisection on f′(c) = slope |
| relations | every pair and triple checked |
| counting functions | every function enumerated with `itertools.product` |
| projection | golden-section minimisation of the distance |
| floating point | Python evaluating the same expression |
| Newton | exact fractions |

`mathfound`: 640 agree, 0 disagree, 0 by construction.

The audit also found one borrowed skill without a check: Competitive Programming's inclusion–exclusion. It now has a brute-force count. The test now names the skills allowed to be right by construction (the big-O table and decidability) instead of counting them.

**Every reading link returned 200 on 16 October 2026.** Hefferon's links add 10 to the printed page number, because the PDF has 10 pages of front matter.

## Still unverified

- **The outside graders were not run here:** the exams, Lean, Project Euler.
- **Mathematical Programming's language mismatch.** 18.S191 is taught in Julia, but the app's practice is Python.
- **Proof outcomes are marked by rubric.** The app cannot check a proof; Lean can, for the exercises in Mechanics of Proof.
