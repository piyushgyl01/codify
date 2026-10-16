# Electrical Engineering, Term 3: audit and evidence

October 2026. This covers five courses:

- Probability and Random Processes
- Signals and Systems
- Semiconductor Devices
- Computer Architecture and Embedded Systems
- Economics, Ethics, and Engineering Decisions

The method and standards are those in [ee-term0-audit.md](ee-term0-audit.md); the design is in [`js/degrees/curriculum/ee-term3.js`](../js/degrees/curriculum/ee-term3.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Probability and Random Processes | 6.041SC stops before power spectral density; AI-track practice | 6.041SC lectures by unit, 6.011 for spectra; its quizzes and final with solutions |
| Signals and Systems | units pointed at 6.003 and EE261 as wholes; Robotics practice | 6.003 (Fall 2011) lecture by unit, Osgood's EE261 notes; 6.003 quizzes and finals with solutions; convolution, Fourier-series and recursive-filter practice |
| Semiconductor Devices | no unit links; nothing on scaling; no practice | 6.012 lectures by unit, 6.720J on scaling and device families; diode, MOSFET and BJT practice |
| Architecture and Embedded | the NPTEL syllabus loads only in a browser; Robotics practice with no checks | Valvano's free *Embedded Systems: Shape the World* by chapter, 6.004, the RISC-V spec; timer and real-time practice |
| Economics, Ethics, Decisions | paid books, a blocked IEEE page, no economics resource, five assessments | NSPE code and Board of Ethical Review cases, 16.63J system safety, OpenStax finance and economics, the Hyatt Regency investigation, SEP, Design Justice; explicit stages with an "escalation record" rubric; NPV and risk practice |

- **New practice skills.** There are 10, across three new modules and one existing one:
  - `eesignals.js`: convolution, Fourier series of a pulse train, second-order recursive filters
  - `eedevices.js`: diode operating point, MOSFET drain current, common-emitter gain
  - `eesystems.js`: timer prescalers, real-time response time, present worth and life-cycle cost, lifetime failure risk
- **Outcomes.** There are 38, with 21 rubrics and 84 anchored lines.
- **Readings.** 80 units, 77 distinct links. All returned 200 on 17 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| convolution | DFTs multiplied and inverted |
| Fourier series | the coefficient integrated numerically |
| recursive filter | the recursion run on an impulse |
| diode | bisection on the current, not the voltage |
| MOSFET | the gradual-channel integral |
| CE gain | the hybrid-π model stamped into a nodal matrix |
| timer | every prescaler and every 16-bit count tried |
| response time | the preemptive schedule simulated one millisecond at a time |
| present worth | each year discounted separately |
| failure risk | the binomial distribution enumerated |

`eesignals`: 120 agree. `eesystems`: 160 agree. The new device skills: 120 agree, plus 120 more for the diode after its fix. All runs used 40 questions per skill.

**One generator was fixed.** The diode generator used Newton's method from 0.6 V. When it overshot into the exponential it needed more than its 100 steps to come back, and returned an unconverged current (39.65 mA instead of 42.48 mA). It now bisects, which always converges because the residual is monotonic.

## Still unverified

- **The outside graders were not run here.**
- **6.012's quiz solutions are not clearly posted.** Its benchmark asks for each answer to be confirmed by calculation or simulation.
