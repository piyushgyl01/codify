# Mechanical Engineering, Term 3: audit and evidence

October 2026. This covers five courses:

- Heat and Mass Transfer
- Machine Elements and Mechanical Design
- System Dynamics and Feedback Control
- Engineering Probability, Measurement, and Experimental Methods
- Advanced Manufacturing and Product Realization

The method and standards are those in [me-term0-audit.md](me-term0-audit.md); the design is in [`js/degrees/curriculum/me-term3.js`](../js/degrees/curriculum/me-term3.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Heat and Mass Transfer | every unit pointed at 2.51 as a whole, and 2.51 posts no notes; no practice | Lienhard and Lienhard's free *A Heat Transfer Textbook* by chapter (the book 2.51 teaches from); nine new skills; 10.302 exams, confirmed by simulation |
| Machine Elements | every unit pointed at 2.72 as a whole; nothing on lubrication or sealing; no exams; Robotics practice | 2.72 lectures by unit; nine new machine-element skills; 2.007 Exam 2 with solutions |
| Dynamics and Control | every unit pointed at *Feedback Systems* as a whole; Robotics practice | *Feedback Systems* chapters by page; EE control skills plus four new ones; 2.04A practice problems with solutions |
| Probability and Experiments | the catalogue names 2.671, which has no OCW page; borrowed practice | the NIST/SEMATECH e-Handbook by chapter and MIT Junior Lab's report resources; four new skills; 18.05 exams and NIST's Statistical Reference Datasets |
| Advanced Manufacturing | every unit pointed at 2.008 as a whole; no life-cycle method; Robotics practice | 2.008 (2025) lectures, GD&T and NIST capability by unit; the EU life-cycle platform; control charts and Merchant's model added; 2.008 practice quizzes with solutions |

- **New practice skills.** There are 23, in three new modules and one extended one:
  - `meheat.js`: composite walls, insulated pipes and critical radius, fins, lumped cooling, slab transients, heating in a pipe, gray-surface radiation with shields, effectiveness–NTU, mass transfer by analogy
  - `memach.js`: Goodman fatigue and finite life, shaft sizing, critical speed, bearing life, preloaded bolts, helical springs, Lewis gear stress, flat belts, disk clutches
  - `mectl.js`: gain for an overshoot, pole placement, sampled-data stability, PI overshoot, factorial effects, uncertainty budgets, Welch's t-test, first-order sensor response
  - two added to `memfg.js`: X̄–R control limits, and Merchant's cutting model
- **Outcomes.** There are 40, with 10 rubrics and 40 anchored lines.
- **Readings.** 40 units, 40 distinct links (35 distinct pages). All 35 pages, with benchmarks and gap references, returned 200 on 17 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| composite wall | finite-difference conduction through 200 slices per layer, solved as a tridiagonal system |
| insulated pipe | radial resistance integrated numerically; critical radius by golden-section search |
| fin | the fin equation by finite differences, then convection summed over the surface |
| lumped cooling | the energy balance marched in time (RK4) |
| slab transient | Crank–Nicolson finite differences with a convective boundary (the generator sums the eigenfunction series) |
| pipe heating | the bulk temperature marched along the pipe |
| radiation | the radiosity network, with the shield, solved as linear equations |
| heat exchangers | both streams marched along the exchanger; counterflow by bisecting on the unknown outlet |
| mass transfer | Sherwood from Nusselt with (Sc/Pr)^⅓ instead of the Lewis-number form |
| Goodman, finite life | the load line scaled to the failure line; log N bisected on the S–N line |
| shaft sizing | the diameter bisected on the safety factor |
| critical speed | deflections from integrating M/EI twice, then Rayleigh's quotient |
| bearing life | lives in logarithms; ratings bisected |
| bolted joint | bolt and members as parallel springs, stretch bisected |
| spring rate | Castigliano on the twisted wire |
| gear load | power over pitch-line speed |
| belt | tension integrated around the wrap, slack side bisected |
| clutch | pressure integrated over the face |
| gain for overshoot | the closed loop simulated and K bisected on its peak |
| pole placement | trace and determinant of A − BK probed and solved (the generator uses Ackermann's formula) |
| sampled loop | the plant integrated between samples (RK4) |
| PI overshoot | plant and integrator simulated in state space (the generator samples the closed-form response) |
| factorial effects | least-squares regression on the coded design |
| uncertainty budget | sensitivities by central differences |
| Welch's t | p from the incomplete beta function (the generator integrates the t density) |
| sensor response | the sensor simulated; amplitude and phase from projecting onto sine and cosine |
| control limits | d₂ computed from first principles as the expected range of n normals |
| Merchant | the shear angle found by minimising cutting force |

`meheat`: 360 agree. `memach`: 360. `mectl`: 320. `memfg`: 440 (all eleven skills). All used 40 questions per skill. No generator needed fixing.

## Still unverified

- **The outside graders were not run here.**
- **10.302's exams have no solutions.** Its benchmark counts an answer only when a numerical model agrees.
- **No published key for lubrication and sealing.** That unit relies on manufacturers' catalogues.
