# Mathematics, Term 4: audit and evidence

October 2026. This covers seven courses:

- Functional Analysis and Fourier Analysis
- Differential Geometry
- Research and Expository Seminar
- Computational Mathematics
- Algebraic Number Theory
- Partial Differential Equations
- Combinatorial Optimization

The method is the one described in [math-term0-audit.md](math-term0-audit.md); the design is in [`js/degrees/curriculum/math-term4.js`](../js/degrees/curriculum/math-term4.js).

## What was wrong

1. **No unit links and no rubrics.** As everywhere outside CS.
2. **Four courses' resources do not reach their units:**
   - **Differential Geometry:** 18.950 (Fall 2008) treats curves and hypersurfaces in ℝⁿ. It has no manifolds, tangent spaces or forms, which are Units 1–3.
   - **Computational Mathematics:** 18.085 (Summer 2020) has no iterative solvers, automatic differentiation or performance work, which are Units 2, 6 and 7.
   - **Algebraic Number Theory:** 18.785 (Fall 2021) is a graduate course aimed at class field theory and adeles.
   - **Combinatorial Optimization:** 18.433 (Fall 2003) starts with matchings, so shortest paths and spanning trees have no notes. Its matroid lectures were never posted.
3. **Functional Analysis' resource covers Fourier series only.** 18.102 has no Fourier transform, which Unit 7 names.
4. **Practice was missing or unrelated.** Most courses had none. Computational Mathematics had a Python accumulation question and FLOP counting.

## What changed

| Course | Readings | Outside graders |
|---|---|---|
| Functional and Fourier Analysis | 18.102 (Spring 2021) lectures, by unit | Lean (Mathematics in Lean Ch. 12, normed spaces) |
| Differential Geometry | Petersen's free UCLA notes for manifolds and forms; Crane's *Discrete Differential Geometry* for computation; 18.950 chapters for curvature and Gauss–Bonnet | the discrete Gauss–Bonnet identity on meshes |
| Research and Expository Seminar | 18.821's pages on mathematical work, writing, revision and presentations; arXiv | Math Stack Exchange votes; an outside reader |
| Computational Mathematics | 18.085 weekly notes; 18.335J for iterative solvers, adjoints and performance | 18.085 midterm and final with solutions |
| Algebraic Number Theory | Stein's free *Algebraic Number Theory: a Computational Approach*, by chapter; 18.785 for local fields | LMFDB's published invariants |
| Partial Differential Equations | 18.152 (Fall 2011) lecture notes | 18.152 midterm with solutions |
| Combinatorial Optimization | 18.433 notes; Applied Combinatorics Ch. 12; Goemans's 2015 matroid notes | NetworkX as an oracle; MIPLIB |

- **New practice skills.** There are 28, each with an independent check. Almost all have a different method in the check:

  | Skill | Independent check |
  |---|---|
  | Fourier coefficients | quadrature |
  | Parseval | partial sums with the tail added |
  | operator norms | a sweep over unit vectors |
  | curvature | the circle through three points |
  | torsion | finite-difference derivatives |
  | Gaussian curvature | the two fundamental forms by finite differences |
  | heat equation | explicit finite differences |
  | CFL | von Neumann amplification factors |
  | PDE type | characteristic slopes |
  | Euler–Lagrange | minimising the discretised functional |
  | Legendre symbols | listing squares |
  | two squares | brute force |
  | Pell | the continued-fraction expansion |
  | discriminants | the trace form |
  | representations | conjugacy classes by brute force |
  | Bézout (real points) | sign changes around the circle |
  | monomials | enumeration |
  | second-difference matrix | exact elimination and power iteration |
  | DFT | a recursive FFT |
  | assignment | DP over subsets |
  | TSP | Held–Karp |
  | logistic map | bisection and finite differences |
  | Lyapunov exponents | long orbits |
  | saddle-node | running the flow |
  | Fisher information | the defining expectation |
  | Beta posteriors | a grid |
  | Hamming decoding | trying every flip |
  | the Hamming bound | counting error patterns |

- **Outcomes.** There are 49, with 14 rubrics and 56 anchored lines.
- **Readings.** All 56 links returned 200 on 16 October 2026.

| Module (after this term) | Agree | Disagree |
|---|---|---|
| mathanalysis | 345 | 0 |
| mathalg | 880 | 0 |
| mathapplied | 324 | 0 |

**The independent checks found one real error.** The first Bézout question was also wrong when the circle and ellipse coincide (a = b = r): the curves then share a component and the theorem does not apply. It now asks for the real intersection count, with a ≠ b. Its first check just printed 4, so it was also replaced.

## Still unverified

- **The outside graders were not run here.**
- **18.102, 18.950 and 18.433 publish no solutions.** Their benchmarks rely on Lean, mathematical identities and solver oracles instead.
