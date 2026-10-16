# Physics, Term 3: audit and evidence

October 2026. This covers five courses:

- Advanced Classical and Nonlinear Dynamics
- Electrodynamics and Radiation
- Quantum Mechanics II
- Statistical Mechanics
- Computational Physics

The method is the one in [phys-term0-audit.md](phys-term0-audit.md); the design is in [`js/degrees/curriculum/phys-term3.js`](../js/degrees/curriculum/phys-term3.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Advanced Classical and Nonlinear Dynamics | no unit links; no practice; 8.09 posts no exams or solutions | 8.09 chapter notes by unit, plus Tong's *Classical Dynamics* Chapter 4 for Poisson brackets and adiabatic invariants; pendulum and chaos practice; GRE mechanics questions, and 8.09 problem sets confirmed by simulation |
| Electrodynamics and Radiation | 8.311 (2004) posts four handouts and no exams | Fitzpatrick's free *Classical Electromagnetism* and Tong's *Electromagnetism* by chapter; waveguide and Larmor practice; 8.311 problem sets with solutions |
| Quantum Mechanics II | 8.05 stops before perturbation theory, identical particles, time-dependent perturbation, density matrices and scattering | 8.05 for Units 1–3; 8.06 (2016) chapters for Units 4–7; angular-momentum, hydrogen, perturbation and Rabi practice; 8.05 finals and GRE |
| Statistical Mechanics | 8.333 is graduate level and has no Monte Carlo | 8.333 for ensembles, partition functions and kinetic theory; Tong's *Statistical Physics* for Units 1, 5 and 6; Sethna's *Entropy, Order Parameters, and Complexity* Chapter 8 for Monte Carlo; 8.333 exam reviews with solutions |
| Computational Physics | 22.15 skips floating point, eigensolvers, spectral methods and optimisation; its notes are on a server without HTTPS | 18.335J for Units 1, 2 and 7; 22.15's OCW page and exercises for the rest; Boyd's free *Chebyshev and Fourier Spectral Methods*; the Turing Way for reproducibility; 22.15 Exercise 5 against its example solution |

- **New practice skills.** There are 12 more in `physadv.js`:
  - mechanics: the large-amplitude pendulum
  - electromagnetism: waveguide cutoffs, Larmor radiation
  - quantum: angular-momentum addition, hydrogen degeneracy, anharmonic perturbation theory, Rabi oscillations
  - statistical mechanics: the 1-D Ising chain, Fermi energies, Bose–Einstein condensation
  - computation: forward Euler's energy growth, Monte Carlo error bars
- **Outcomes.** There are 35, with 10 rubrics and 40 anchored lines.
- **Readings.** All 35 unit links and the gap and benchmark links returned 200 on 17 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| pendulum period | the motion integrated (RK4) to the first zero crossing, times four |
| waveguide cutoff | the eigenvalues of the discretised cross-section, found by Sturm-sequence bisection |
| Larmor power | the far-field Poynting flux integrated over a sphere |
| angular-momentum addition | multiplets peeled off the table of m-values |
| hydrogen degeneracy | the (l, m, spin) states counted |
| perturbation theory | the discretised Hamiltonian diagonalised exactly, and the first-order slope taken numerically |
| Rabi oscillations | the two-level Schrödinger equation integrated |
| Ising chain | exact enumeration of an open 14-spin chain |
| Fermi energy | k-points in a periodic box counted up to the Fermi sphere |
| Bose condensation | the Bose occupancy integrated, and T_c found by bisection |
| Euler energy growth | the method run |
| Monte Carlo error | 6,000 repeated experiments, and the spread of their means measured |

`physadv`: 348 agree, 0 disagree.

**One first-draft check was wrong; the generator was right.** The Ising check enumerated a 16-spin ring. On a ring, the correlation between neighbours also travels the long way round, so at strong coupling the result was off by 4%. The check now enumerates an open chain, which is exact for any length.

## Still unverified

- **The outside graders were not run here.**
- **Three benchmarks have no published solutions:** 8.09's problem sets, 8.05's finals and 22.15's 2013 final. Their instructions say to count an answer right only when an independent computation agrees.
