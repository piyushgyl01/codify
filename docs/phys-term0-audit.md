# Physics, Term 0: audit and evidence

October 2026. This covers the five first courses of the Physics degree:

- Calculus I and Physical Modeling
- Introductory Mechanics and Special Relativity
- Chemistry for the Physical Sciences
- Scientific Programming
- Measurement and Experimental Foundations

The Physics catalog has the same shape as Mathematics: no unit links, no rubrics, boilerplate outcomes. The method is the one in [math-term0-audit.md](math-term0-audit.md). The design is in [`js/degrees/curriculum/phys-term0.js`](../js/degrees/curriculum/phys-term0.js), the readings in [`tools/readings/phys.mjs`](../tools/readings/phys.mjs).

## Standards

Outcomes are mapped to two standards:

- **ETS's GRE Physics content areas:** Classical Mechanics, Electromagnetism, Quantum Mechanics, Thermodynamics and Statistical Mechanics, Atomic Physics, Optics and Wave Phenomena, Special Relativity, Laboratory Methods, Specialized Topics.
- **The AAPT's six laboratory focus areas (2014),** for experimental work: Constructing Knowledge, Modeling, Design, Technical and Practical Laboratory Skills, Data Analysis and Visualization, Communication.

The UK QAA Physics benchmark (2025) sets threshold standards but has no topic list, so it is not cited by paragraph.

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Calculus I and Physical Modeling | no unit links; one practice skill | 18.01SC session groups by unit; practice from limits to Taylor series, plus fitting a motion law and work by a varying force; 18.01SC exams with solutions |
| Mechanics and Special Relativity | 8.012 publishes no notes and its text is not free; no practice | 8.01SC weekly notes, 8.03SC for oscillations, 8.20 for relativity; 9 new skills checked by simulating the motion; 8.012's exams and final with solutions |
| Chemistry | 5.111SC skips stoichiometry, gases and calorimetry; no practice | OpenStax Chemistry 2e for those units; 6 new skills; 5.111SC exams with solutions |
| Scientific Programming | 6.100L skips data fitting | 6.0002 Lecture 9 for fitting; the Missing Semester for Git; the Python packaging guide; 6.100L's problem sets with their tests |
| Measurement and Experimental Foundations | 8.01X is a mechanics course with no metrology | the SI brochure, NIST TN 1297, the GUM and the NIST/SEMATECH e-Handbook; a measured g compared with the PTB's reference value |

- **New practice skills.** There are 20 in two modules:
  - `physmech`: projectiles, inclines, collisions, rolling, oscillators, orbits, work, Lorentz transformations, invariant mass
  - `physlab`: propagation, weighted means, weighted fits, trials, quantisation, stoichiometry, pH, hydrogen spectra, Gibbs energy, kinetics, calorimetry
- **Outcomes.** There are 35, with 10 rubrics and 40 anchored lines.
- **Readings.** All 40 links returned 200 on 16 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| projectiles, inclines, oscillators, orbits | the motion integrated numerically (orbits by velocity Verlet) |
| collisions | a 2×2 linear solve in exact fractions |
| rolling | moments of inertia summed over mass elements or sampled |
| length contraction | the far end of the rod found at lab time zero by bisection through the boost |
| velocity addition | rapidities |
| invariant mass | a boost to the zero-momentum frame |
| propagation | 200,000 Monte Carlo draws |
| weighted mean and its uncertainty | χ² minimised and Δχ² = 1 |
| weighted fit | coordinate descent on χ² |
| molar masses | a formula parser |
| pH | charge balance by bisection, including water's autoionisation |
| hydrogen lines | energy levels computed from mₑ, e, ε₀, h, c |
| kinetics | RK4 |
| calorimetry | heat exchanged in small packets |

| Module | Agree | Disagree |
|---|---|---|
| physmech | 270 | 0 |
| physlab | 275 | 0 |

**Two checks were rewritten during the audit** because they repeated the generator's formula:

- **Length contraction.** It is now found by bisection through the boost.
- **Gibbs energy.** The case where ΔH and ΔS have opposite signs is gone; the skill always asks for the crossover temperature, which the check finds by scanning.

## Still unverified

- **The outside graders were not run here.**
