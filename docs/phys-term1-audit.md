# Physics, Term 1: audit and evidence

October 2026. This covers five courses:

- Multivariable and Vector Calculus
- Linear Algebra and Differential Equations
- Electricity, Magnetism, and Circuits
- Waves, Oscillations, and Optics
- Probability, Data, and Experimental Methods

The method is the one in [phys-term0-audit.md](phys-term0-audit.md); the design is in [`js/degrees/curriculum/phys-term1.js`](../js/degrees/curriculum/phys-term1.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Multivariable and Vector Calculus | no unit links; one borrowed skill | 18.02SC session groups; vector-calculus and Gauss's-law practice; 18.02SC exams with solutions |
| Linear Algebra and Differential Equations | 18.03SC has no linear algebra | 18.06SC for Units 1–3; 18.03SC for ODEs; normal-mode practice; 18.03SC final and 18.06SC Exam 2 |
| Electricity, Magnetism, and Circuits | no unit links; Robotics practice | 8.02X lecture notes by topic; 7 new E&M skills; 8.02X quizzes with solutions |
| Waves, Oscillations, and Optics | 8.03SC skips lenses; no practice | OpenStax University Physics Vol. 3 Ch. 2 for Unit 6; 7 new waves-and-optics skills; 8.03SC final |
| Probability, Data, and Experimental Methods | no unit links; AI-track practice | 18.05 class readings by unit; statistics and measurement practice; 18.05 exams; OSF preregistration |

- **New practice skills.** There are 14 in `physem.js`: point-charge fields, Gauss's law, RC circuits, fields of wires and solenoids, cyclotron motion, induction, RLC resonance, normal modes, string harmonics, Doppler, thin lenses, refraction, slits and gratings, and polarisation.
- **Borrowed skills that gained checks.** The Robotics track's Ohm's-law and voltage-divider skills had no independent check, and the stricter test caught it. They now have nodal-analysis and bisection checks.
- **Outcomes.** There are 33, with 10 rubrics and 40 anchored lines.
- **Readings.** 80 Physics links in all. Every one returned 200 except osf.io, which returned 503 on 17 October 2026 after loading normally the day before; it is kept as an outage.

## Verification

| Skill | Independent check |
|---|---|
| point-charge fields | each charge smeared over a ring and summed |
| Gauss's law | rings of each shell integrated deterministically (not assumed by the shell theorem) |
| RC circuits | the charging equation integrated |
| wire field | Biot–Savart summed along the wire |
| solenoid field | many current loops summed |
| cyclotron motion | the Lorentz force integrated |
| induction | the flux differentiated numerically |
| RLC resonance | the response maximised and its half-power points found by bisection |
| normal modes | the masses simulated |
| string harmonics | the discrete Laplacian's Rayleigh quotient |
| Doppler | wavefront arrivals timed |
| lenses | rays intersected |
| refraction | Fermat's least time |
| slits and gratings | wave amplitudes summed |
| polarisation | Jones calculus on random input; Fresnel coefficients for Brewster's angle |

`physem`: 420 agree, 0 disagree.

**Four first-draft checks were wrong; the generators were right:**

- **Refraction.** The least-time setup placed its endpoint arbitrarily. It is now solved for the given incidence angle. The generator also clamped total internal reflection to 90°; it now asks for the critical angle in that case.
- **Grating.** The check took the brightest peak, but every principal maximum is equally bright. It now takes the first.
- **Gauss's law.** Monte Carlo near a point charge has heavy tails. It now integrates deterministically.
- **RLC.** For low Q, the half-power points fell outside the sweep. It now uses bisection over a wide range.

## Still unverified

- **The outside graders were not run here.**
