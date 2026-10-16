# Physics, Term 2: audit and evidence

October 2026. This covers five courses:

- Analytical Mechanics I
- Electromagnetic Theory I
- Quantum Mechanics I
- Thermal Physics
- Mathematical Methods for Physics

The method is the one in [phys-term0-audit.md](phys-term0-audit.md); the design is in [`js/degrees/curriculum/phys-term2.js`](../js/degrees/curriculum/phys-term2.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Analytical Mechanics I | 8.223 is a short IAP course with no rigid bodies; no practice | 8.223 lecture notes by unit; Tong's free *Classical Dynamics* Chapter 3 for rigid bodies; 8.223 problem sets with solutions; GRE Physics practice test |
| Electromagnetic Theory I | 8.07's notes skip dielectrics; no practice | 8.07 notes by unit; Tong's free *Electromagnetism* Chapter 7 for dielectrics; 8.07 quizzes with solutions |
| Quantum Mechanics I | no unit links; no practice | 8.04 lecture notes by unit; 8.04 tests and final; GRE practice test |
| Thermal Physics | no unit links; one AI-track entropy question | 8.044 notes and lectures by unit; 8.044 exams with solutions |
| Mathematical Methods | the NPTEL course's syllabus loads only in a browser, so units could not be mapped | MIT notes per unit (18.04, 18.03SC, 18.152, 18.085, 8.07), NPTEL kept for its videos; GRE practice test |

- **New practice skills.** There are 17 in `physadv.js`:
  - quantum: infinite and finite wells, tunnelling, the oscillator, spin, expectation values
  - thermal: ideal-gas processes, engines, entropy, Boltzmann factors, Einstein heat capacity, blackbody radiation
  - mechanics: the bead on a spinning hoop, Rutherford scattering
  - electromagnetism: image charges, Laplace boundary-value problems
  - mathematical methods: Legendre expansions
- **Outcomes.** There are 35, with 10 rubrics and 40 anchored lines.
- **Readings.** All 40 links returned 200 on 17 October 2026. Tong's notes have moved to davidtong.org; the links use the new address.

## Verification

| Skill | Independent check |
|---|---|
| quantum energies | the Hamiltonian discretised and its eigenvalues found by Sturm-sequence bisection |
| tunnelling | the Schrödinger equation integrated through the barrier (complex RK4) and split into incident and reflected waves |
| spin | power iteration on the Pauli-matrix spin operator |
| ideal-gas processes | integrated along the path |
| Carnot | an ideal-gas Carnot cycle simulated |
| two-level systems | Metropolis sampling |
| Einstein heat capacity | a sum over oscillator levels, differentiated numerically |
| Wien's law | Planck's law maximised |
| Stefan's law | Planck's law integrated |
| hoop | the bead simulated with light damping |
| scattering | the trajectory integrated |
| images | the induced surface charge integrated |
| Laplace | grid relaxation (SOR) |
| Legendre | Bonnet's recurrence with quadrature |

`physadv`: 442 agree, 0 disagree.

**One generator was fixed.** The Laplace series used sinh(nπy)/sinh(nπ), which overflows at large n and returned no answer. It is now written in exponentials.

## Still unverified

- **The outside graders were not run here.**
- **The 8.04 tests are from Fall 2015.** It is not established that all of them publish solutions.
