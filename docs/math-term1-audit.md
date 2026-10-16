# Mathematics, Term 1: audit and evidence

October 2026. This covers Multivariable Calculus, Linear Algebra II, Differential Equations, Probability I, and Combinatorics and Graph Theory. The method is the one described in [math-term0-audit.md](math-term0-audit.md).

- Design: [`js/degrees/curriculum/math-term1.js`](../js/degrees/curriculum/math-term1.js)
- Readings: [`tools/readings/math.mjs`](../tools/readings/math.mjs)
- New practice: `mathcalc.js`, `mathalg.js` and `mathcomb.js` in [`js/degrees/practice/`](../js/degrees/practice/)

## What was wrong

1. **No unit links.** Every unit pointed at a course's front page.
2. **No rubrics.** Both assessments in each course were single scores.
3. **Little or no practice.** Differential Equations had none. Linear Algebra II and Multivariable Calculus borrowed one or two skills each from the AI track. Combinatorics stopped at graph searches.
4. **Linear Algebra II's book skips a unit.** Unit 1 is about quotient spaces, which Treil says (Chapter 7, p. 210) the book does not discuss.

## What changed

| Course | Readings | New practice | Outside graders |
|---|---|---|---|
| Multivariable Calculus | 18.02 (Fall 2007) weekly notes, by lecture | directional derivatives, Lagrange multipliers, double integrals (rectangular and polar), line integrals and Green, divergence and curl | 18.02 practice exams 1–4, A and B versions, with solutions |
| Linear Algebra II | Treil chapters, opened at their page; Axler §3E for quotients | characteristic polynomials, rank–nullity, quadratic forms, Jordan structure | Lean (Mathematics in Lean Ch. 10); Putnam with Kedlaya's solutions |
| Differential Equations | 18.03 (Spring 2010) lecture notes | first-order linear, damped oscillators, Laplace transforms, phase plane, equilibria, Euler's method | 18.03 hour exams and practice final, with solutions |
| Probability I | 18.440 (Spring 2014) lecture slides | — (the eight probability skills from the CS degree now apply) | 18.440 2014 midterms and final, with solutions |
| Combinatorics and Graph Theory | Applied Combinatorics sections | bounded compositions, derangements, Stirling numbers, Catalan numbers, chromatic number, bipartite matching | Putnam; Lean (Mathematics in Lean Ch. 6) |

- **New skills.** There are 27: 11 calculus and differential-equations skills, 10 algebra (four of them for Abstract Algebra I next term), and 6 combinatorics.
- **Outcomes.** There are 36, with 10 rubrics and 40 anchored lines.
- **Readings.** All 40 links returned 200 on 16 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| directional derivative | central differences |
| Lagrange | a sweep of 2,000,000 points on the constraint |
| double integrals | the midpoint rule, on a grid for the disc |
| Green's theorem | the line integral summed around the circle |
| divergence and curl | finite differences |
| first-order ODEs | RK4 |
| oscillators | complex roots, and timing simulated zero crossings |
| Laplace | numerical integration of f(t)e^{−st} |
| phase plane | complex eigenvalues |
| equilibria | running the dynamics forward |
| Euler's method | exact fractions |
| characteristic polynomial | interpolation of det(λI − A) at four points |
| rank | the largest non-zero minor |
| quadratic forms | Jacobi eigenvalue rotations |
| Jordan blocks | ranks of (A − λI)ᵏ |
| group properties | brute force over the elements |
| combinatorics | full enumeration |

| Module | Agree | Disagree |
|---|---|---|
| mathcalc | 550 | 0 |
| mathalg | 400 | 0 |
| mathcomb | 300 | 0 |

One generator was fixed during the audit. The Jordan-form questions build A = PJP⁻¹ from a P meant to have determinant 1, but the first construction did not always, which gave non-integer entries. P is now the product of a lower and an upper unitriangular matrix, so its determinant is exactly 1.

## Still unverified

- **The outside graders were not run here:** the exams, Lean and Putnam.
- **Proof outcomes are marked by rubric.** Lean checks only what is stated in it.
