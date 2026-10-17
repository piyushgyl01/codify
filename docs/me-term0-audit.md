# Mechanical Engineering, Term 0: audit and evidence

October 2026. This covers five courses:

- Engineering Calculus I
- University Physics I: Mechanics and Waves
- Chemistry and Materials Foundations
- Programming and Engineering Computation
- Engineering Graphics, CAD, and Design Studio

## How ME courses differ

Each ME course has eight units and two assessments:

- an applied problem set, lab or project
- a final exam, presentation or portfolio

So each audited course has two rubrics and a reading for every unit. The applied rubric asks for the four kinds of evidence the catalog lists: the artifact, an independent check, the assumptions and uncertainty, and an error log with corrections. The final rubric is either an exam with a defended model or a presented package with requirement traceability.

Outcomes map to two standards:

- **ABET's seven student outcomes** (Criterion 3, 2025–26), coded "ABET n".
- **The NCEES FE Mechanical exam specification** (July 2020), coded "FE-ME n.X". For example, FE-ME 14.J is limits and fits.

The design is in [`js/degrees/curriculum/me-term0.js`](../js/degrees/curriculum/me-term0.js), and the readings are in [`tools/readings/me.mjs`](../tools/readings/me.mjs).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Engineering Calculus I | every unit pointed at the whole of 18.01SC; one borrowed derivative question | 18.01SC sessions by unit; practice from limits to Taylor series, including optimisation, first-order models and Newton's method; 18.01SC exams and final with solutions |
| University Physics I | 8.01SC stops before oscillations and has no elasticity; Robotics practice with no checks | 8.01SC lessons by unit, 8.03SC for oscillations and waves, OpenStax Chapter 12 for equilibrium and elasticity; new beam-reaction and axial-stretch practice; 8.012 exams with solutions |
| Chemistry and Materials | every unit pointed at 3.091SC as a whole; nothing on thermochemistry, electrochemistry, composites or materials selection; no practice | 3.091SC sessions by unit; OpenStax Chemistry 2e for thermochemistry and corrosion; DoITPoMS on composites; MIT 3.080 on selection; eight new materials skills; 3.091SC final with solution key |
| Programming and Computation | every unit pointed at 6.0001 as a whole; no numerical methods or fitting | 6.0001 lectures by topic, NumPy, 6.0002 on experimental data, the Turing Way; numerical, fitting and git practice; 6.0001 problem-set tests |
| Graphics, CAD and Design | 2.007 assumes SolidWorks and teaches no drawing standards, tolerancing or GD&T; Robotics practice with no checks | 2.007 lectures and recitations by unit; Ford's *Engineering Graphics and Design* for views, tolerancing and GD&T; FreeCAD; 2.670 shop tutorials; seven new design skills; 2.007 Exam 1 with solutions |

- **New practice skills.** There are 17, in three new modules:
  - `mestatics.js`: beam reactions, axial deformation
  - `mematerials.js`: bond energy and spacing, density from crystal structure, carburising, the lever rule, material indices, corrosion rate, cell voltage, rule of mixtures
  - `medesign.js`: orthographic views, centroids with cut-outs, four-bar linkages, tolerance stacks, limits and fits, decision-matrix sensitivity, gear trains
- **Outcomes.** There are 40, with 10 rubrics and 40 anchored lines.
- **Readings.** 40 units, 40 distinct links. All 47 links (readings, benchmarks and gap references) returned 200 on 17 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| beam reactions | the distributed load broken into 100 000 point loads, with moments taken about a third point |
| axial deformation | strain integrated along the rod by Simpson's rule |
| bond energy | the energy curve minimised by golden-section search |
| crystal density | atoms counted in a 4 × 4 × 4 block of cells, with spacing from the nearest-neighbour distance |
| carburising | the diffusion equation solved by finite differences (r = 1/6, fourth-order accurate), stepped to the time or depth asked |
| lever rule | each phase boundary bisected at the temperature, then the mass balance solved |
| material index | the section sized by bisection on a unit-load deflection integral |
| corrosion | a year's charge traced through moles of electrons, moles of metal, mass and volume |
| cell voltage | the equilibrium constant first, then ΔG = RT ln(Q/K) |
| rule of mixtures | a stack of 1000 fibre and matrix layers loaded along and across |
| orthographic views | the solid built from voxels and projected; exposed faces counted |
| centroid | Green's theorem around each boundary, with the hole as a 200 000-gon |
| four-bar linkage | the loop solved through a full turn of the crank, then the extreme refined |
| tolerance stack | every combination of extreme sizes for worst case; the normal distributions convolved on a grid for RSS |
| limits and fits | every hole and shaft size in the zones tried, in 1 µm steps |
| decision matrix | the weight bisected until the totals meet |
| gear train | pitch-line speed passed across each mesh, and power along the train |

`mestatics`: 80 agree. `mematerials`: 320 agree. `medesign`: 280 agree. All used 40 questions per skill. No generator needed fixing.

## Still unverified

- **The outside graders were not run here.**
- **6.0001 posts no problem-set solutions.** Its benchmark counts the provided tests passed, which shows the code runs, not that the design is good.
- **The design studio's build cannot be checked by the app.** Shop safety and the prototype itself need a supervised workshop.
