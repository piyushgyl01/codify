# Mathematics, Term 3: audit and evidence

October 2026. This covers Real Analysis II (Measure and Integration), Abstract Algebra II, Topology, Optimization, and Stochastic Processes and Statistical Inference. The method is the one described in [math-term0-audit.md](math-term0-audit.md); the design is in [`js/degrees/curriculum/math-term3.js`](../js/degrees/curriculum/math-term3.js).

## What was wrong

1. **No unit links and no rubrics.** As everywhere outside CS.
2. **No practice** for Measure, Abstract Algebra II or Topology. Optimization borrowed gradient, Adam and knapsack; Stochastic Processes borrowed expected value and Bayes.
3. **Topology's resource doesn't fit.** 18.901 (Fall 2004) is taught from Munkres, which is not free. Its own notes skip bases, products and quotients (Units 1–3). It ends with separation axioms and embeddings, so it never reaches homotopy or the fundamental group (Unit 7).
4. **Abstract Algebra II's text has no finite-field chapter.** Goodman covers finite fields only in passing, and Unit 4 is a finite-field study.
5. **Optimization's text is convex only.** Boyd & Vandenberghe has nothing on proximal methods (Unit 6) or integer programming (Unit 7).

## What changed

| Course | Readings | Outside graders |
|---|---|---|
| Measure and Integration | Axler, *Measure, Integration & Real Analysis* (free), by section | Lean (Mathematics in Lean Ch. 13); Putnam |
| Abstract Algebra II | Goodman, *Algebra: Abstract and Concrete* (free), by section; Judson Ch. 22 for finite fields, Ch. 23 for a second Galois treatment | Judson's hints and answers; Lean (Ch. 9) |
| Topology | Hatcher's *Notes on Introductory Point-Set Topology* and *Algebraic Topology* Chs. 0–1 (both free) | Lean (Ch. 11) |
| Optimization | Boyd & Vandenberghe by chapter and section; Parikh & Boyd for proximal methods; *Applied Mathematical Programming* Ch. 9 for integer programming; CVXPY examples | CVXPY as an oracle; MIPLIB's published optima |
| Stochastic Processes | Pishro-Nik's free text, by section | MIT 18.445 homework with solutions |

Every PDF link opens at its page. The offsets between printed and PDF page numbers were measured from each file's own text: Goodman +12, Hatcher's *Algebraic Topology* +9; Axler, Boyd and Hatcher's notes are linked by PDF page directly.

- **New practice skills.** There are 16:
  - Finite-field inverses, irreducibility mod p, degrees of extensions, cyclotomic Galois groups
  - Cantor-type sets, simple-function integrals, Lᵖ norms, Euler characteristic, topologies on finite sets
  - LP vertices, gradient descent, convexity, Poisson processes, gambler's ruin, maximum likelihood
- **Outcomes.** There are 34, with 10 rubrics and 40 anchored lines.
- **Readings.** All 40 links returned 200 on 16 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| finite-field inverse | a^(2ᵏ − 2), from Lagrange's theorem on the multiplicative group |
| irreducibility | trying every product of two monic factors |
| extension degree | testing whether √b is a rational multiple of √a |
| cyclotomic group | counting primitive roots of unity numerically |
| Cantor sets | building the intervals in exact fractions |
| simple functions | a midpoint sum over a million points |
| Lᵖ norms | numerical integration after x = e⁻ᵘ |
| topologies | enumerating every family of subsets |
| LP | a grid search, then snapping to the nearest vertex |
| gradient descent | exact fractions |
| convexity | the quadratic form along 3,600 directions |
| Poisson | 400,000 simulated processes |
| ruin | Gauss–Seidel on the boundary-value recurrence |
| MLE | ternary search on the log-likelihood |

| Module | Agree | Disagree |
|---|---|---|
| mathalg | 420 | 0 |
| mathanalysis | 350 | 0 |
| mathapplied | 320 | 0 |

**One skill was replaced during the audit.** The first draft had a skill on Galois groups of xⁿ − 2. Its check only restated the degree formula, so it was not independent. It was replaced by cyclotomic Galois groups, whose order can be counted numerically.

## Still unverified

- **The outside graders were not run here.**
- **The topic-level claims about 18.901 rest on its calendar and lecture-notes pages.** That it skips bases, products, quotients and homotopy was read there, not taken from its full text.
