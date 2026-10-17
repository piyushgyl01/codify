# Mechanical Engineering, Term 1: audit and evidence

October 2026. This covers five courses:

- Multivariable Calculus and Vector Analysis
- Linear Algebra, Differential Equations, and Numerical Methods
- University Physics II: Electricity, Magnetism, and Circuits
- Statics and Structural Equilibrium
- Materials, Manufacturing, and Metrology

The method and standards are those in [me-term0-audit.md](me-term0-audit.md); the design is in [`js/degrees/curriculum/me-term1.js`](../js/degrees/curriculum/me-term1.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Multivariable Calculus | every unit pointed at 18.02SC as a whole; one borrowed gradient question | 18.02SC sessions by unit, including mass and moment-of-inertia sessions; practice across vectors, curvature, gradients, Lagrange multipliers, multiple and line integrals; 18.02SC Exams 2 and 4 with solutions |
| Linear Algebra, DEs, Numerics | 18.03SC has no linear algebra; nothing on conditioning or numerical stability; borrowed core-track practice | 18.06SC for elimination and least squares, 18.03SC for ODEs, modes and Laplace, 18.330 for stability; practice across rank, conditioning, solver order, Euler's drift and the CFL limit; 18.06SC Exam 1 and 18.03SC final |
| University Physics II | the catalogued 8.02 (2019) only points to edX; Robotics practice | the 2007 8.02 course notes by chapter; *Lessons in Electric Circuits* for the RC measurement; field, circuit and motor practice; 8.02X exams with solutions |
| Statics | every unit pointed at *Engineering Statics* as a whole; no practice | the book section by unit; seven statics skills; the book's own checked exercises as benchmarks |
| Materials, Manufacturing, Metrology | 3.044 teaches only the heat and fluid flow of processing; Robotics practice with no checks | DoITPoMS for testing and heat treatment, 3.044 for casting and powder, MIT 2.008 (2025) for costing, machining, polymers, additive and quality; nine new manufacturing skills; 2.008 practice quizzes with solutions |

- **New practice skills.** There are 15:
  - six added to `mestatics.js`: resultants, trusses by the method of sections, belt and screw friction, second moments of area, strut-braced frames, distributed loads on a cantilever
  - nine in the new `memfg.js`: true stress and strain, flow stress and forming work, Brinell hardness, Chvorinov's rule, Taylor tool life, turning time, removal rate and power, process capability, mould cooling time, Avrami kinetics
- **Outcomes.** There are 40, with 10 rubrics and 40 anchored lines.
- **Readings.** 40 units, 40 distinct links. All 48 links (readings, benchmarks and gap references) returned 200 on 17 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| resultant | magnitude by adding forces head to tail; position by bisecting along the axis for zero moment |
| truss | the whole truss solved by the method of joints as one linear system |
| belt friction | dT/dθ = μT integrated around the wrap (RK4) |
| screw torque | the thread unrolled into an incline, and its two equilibrium equations solved |
| second moment of area | 200 000 thin strips summed |
| strut-braced frame | three equilibrium equations, with moments about the free end instead of the pin |
| distributed load | the load summed in 200 000 slices |
| true stress and strain | area from volume constancy; strain integrated as ∫dL/L |
| forming work | Kεⁿ integrated over the strain path |
| Brinell hardness | the cap area integrated over the sphere |
| Chvorinov's rule | the cylinder as a 100 000-gon; the sphere's volume and area integrated in slices |
| tool life | the exponent bisected from the two tests, then the answer bisected |
| turning | the cut stepped one revolution at a time, each removing an annulus |
| process capability | out-of-spec fraction from Python's erfc (the generator integrates the normal tail); Cpk as (1 − k)Cp |
| mould cooling | conduction across the wall by finite differences (the generator sums the exact series) |
| Avrami kinetics | the rate constant and the time each bisected |

`mestatics`: 320 agree (all eight skills). `memfg`: 360 agree. Both used 40 questions per skill. No generator needed fixing.

The plate in Chvorinov's rule is checked by the same box formula the generator uses, so that one case is right by construction.

## Still unverified

- **The outside graders were not run here.**
- **Only some exams have solutions.** 16.001's statics quizzes mostly lack them, so the statics benchmarks use the textbook's own answer checks instead.
- **The truss model test and the metrology need real equipment.**
