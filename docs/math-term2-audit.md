# Mathematics, Term 2: audit and evidence

October 2026. This covers Real Analysis I, Abstract Algebra I, Complex Analysis, Numerical Analysis and Mathematical Modeling. The method is the one described in [math-term0-audit.md](math-term0-audit.md).

- Design: [`js/degrees/curriculum/math-term2.js`](../js/degrees/curriculum/math-term2.js)
- Readings: [`tools/readings/math.mjs`](../tools/readings/math.mjs)
- New practice: `mathanalysis.js` and `mathapplied.js`; Abstract Algebra uses the group skills already in `mathalg.js`

## What was wrong

1. **No unit links and no rubrics.** As everywhere outside CS.
2. **No practice at all** for Real Analysis, Abstract Algebra or Complex Analysis. Numerical Analysis borrowed a gradient question and binary search. Modeling borrowed forecasting and regression.
3. **Numerical Analysis' resource skips three units.** 18.330 (Spring 2012) covers series, quadrature, interpolation, nonlinear equations, ODEs and spectral methods. It has nothing on Units 1, 2 and 7: floating-point backward error, conditioning and linear solvers, and eigenvalue algorithms.
4. **Modeling's resource has gaps.** The SIAM M3 handbook has nothing on dimensional analysis or parameter estimation, and its landing page now refuses automated requests.
5. **Real Analysis has no solutions to check against.** 18.100A publishes its assignments and midterm without them.

## What changed

| Course | Readings | Outside graders |
|---|---|---|
| Real Analysis I | 18.100A (Fall 2020) lecture notes; Lebl's Basic Analysis for the portfolio | Lean (Mathematics in Lean Chs. 11–12); Putnam analysis problems |
| Abstract Algebra I | Judson's chapters (HTML edition) | Lean (Mathematics in Lean Ch. 9); Judson's hints and answers |
| Complex Analysis | 18.04 (Spring 2018) topic notes | 18.04 practice exams and practice final, with worked answers |
| Numerical Analysis | 18.330 chapters, plus 18.335J (Spring 2019) for Units 1, 2 and 7 | LAPACK as the oracle on NIST Matrix Market test matrices |
| Mathematical Modeling | the M3 handbook PDF by chapter; Hefferon's Topic on Dimensional Analysis; Pishro-Nik §8.2; NIST e-Handbook §4.4.4 | held-out prediction-interval coverage; COMAP MCM/ICM past problems against the outstanding papers |

- **New practice skills.** There are 19, in two modules:
  - analysis (9): suprema, ε–N, uniform convergence, Darboux sums, polar form, roots, Cauchy–Riemann, residues, radii of convergence
  - applied (10): bisection, interpolation, Simpson, fixed-point iteration, condition numbers, order of a method, logistic growth, Buckingham π, epidemic thresholds, M/M/1 queues
- **Outcomes.** There are 35, with 10 rubrics and 40 anchored lines.
- **Readings.** All 40 links returned 200 on 16 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| suprema | the set itself |
| ε–N | scanning n in exact fractions |
| uniform convergence | sampling the supremum on 2,000,001 points |
| Darboux sums | sampling each piece |
| complex powers | Python's complex type |
| roots | Newton's method |
| Cauchy–Riemann | finite differences |
| residues | numerical contour integrals |
| radius of convergence | expanding the denominator and recovering the poles from its coefficients |
| interpolation | Newton's divided differences |
| Simpson's rule | panel-by-panel parabolas |
| condition number | power iteration on AᵀA and on (AᵀA)⁻¹ |
| method order | integrating at two step sizes |
| Buckingham π | the rank of the dimension matrix from minors |
| R₀ | the measured early growth rate of a simulated outbreak |
| herd-immunity threshold | simulation and bisection |
| queue | a simulated M/M/1 server |

| Module | Agree | Disagree |
|---|---|---|
| mathanalysis | 450 | 0 |
| mathapplied | 250 | 0 |

**The independent checks found four real errors in the first draft:**

- **Cauchy–Riemann.** f = x² + iy² satisfies the equations on the line x = y, so it *is* complex-differentiable at points like 2 + 2i. The draft said it never was. Each case is now decided per point.
- **Principal argument.** When zᵏ falls on the negative real axis, rounding gave −π instead of π. zᵏ is now computed exactly in integers.
- **Radius of convergence.** The first check divided by 0.1⁶⁰ and was wrong, and so was the polynomial expansion in its replacement. Both are fixed.
- **R₀.** The R₀ check repeated the generator's formula. It now measures the growth rate of a simulated outbreak.

## Still unverified

- **The outside graders were not run here.**
- **Two benchmarks are self-reported:** held-out coverage and the MCM comparison.
- **The SIAM handbook page cannot be checked.** It now blocks automated checks, so only the PDF link was verified.
