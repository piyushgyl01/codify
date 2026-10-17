# Mechanical Engineering, Term 5: audit and evidence

October 2026. This covers the final seven courses of the Mechanical Engineering degree:

- Thermal-Fluid Systems Design and Energy Conversion
- Failure, Reliability, Safety, and Lifecycle Engineering
- Engineering Practice: Ethics, Economics, Communication, and Leadership
- Capstone Design II: Build, Verify, Validate, and Defend
- Autonomous Machines: Perception, Estimation, and Control
- Propulsion and Flight Systems Design
- Renewable Energy, Thermal Storage, and Decarbonization

The method and standards are those in [me-term0-audit.md](me-term0-audit.md); the design is in [`js/degrees/curriculum/me-term5.js`](../js/degrees/curriculum/me-term5.js).

With this term, all 34 Mechanical Engineering courses are audited and all 272 units have a reading. Across the five degrees, all 173 courses are now audited.

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Thermal-Fluid Systems | the catalogued NPTEL course is video-only and cannot be linked by unit; no practice | MIT 16.50 on component maps and matching, Lienhard on heat exchangers, MIT Unified notes on combined cycles, 22.081J on economics, SciPy on optimisation; three new skills; 22.081J exam with solutions |
| Failure and Reliability | every unit pointed at 22.38 as a whole; 22.38 has no failure physics; no practice | 22.38 notes by topic, the NIST reliability chapter, 16.63J, DoITPoMS, Google's incident chapter; six new reliability skills; 22.38 problem sets with solutions |
| Engineering Practice | ESD.932's readings are paid books; ethical judgement cannot be machine-marked; no practice | the NSPE code, *Design Justice*, the NBS Hyatt Regency report, OpenStax finance and negotiation, the Writing Guide; three engineering-economy skills; NSPE Board of Ethical Review cases as the benchmark |
| Capstone Design II | the catalogued 2.009 (2021) page has no materials | NASA's Systems Engineering Handbook, 16.842, 16.63J and the Writing Guide; a test-planning skill with the statistics and reliability skills; NASA's review criteria at test readiness |
| Autonomous Machines | *Underactuated Robotics* has no perception or mapping; Robotics practice with no checks | *Underactuated Robotics* for stochastic models, estimation and robust control; Labbe for filters; Szeliski for cameras; four new skills; a public dataset scored with evo |
| Propulsion | every unit pointed at 16.50 as a whole; no practice | 16.50 lectures by unit and MIT Unified notes; four new propulsion skills; 16.50 quizzes with solutions |
| Renewables and Decarbonisation | every unit pointed at 22.081J (2010) as a whole; its costs are out of date | 22.081J lectures by unit, with current cost data required; three new skills; 22.081J exam with solutions |

- **New practice skills.** There are 23, in two new modules:
  - `mereli.js`: Weibull life, Miner's rule, Paris crack growth, availability of redundant systems, censored failure-rate estimates, stress–strength interference, capital recovery, internal rate of return, unequal-life comparisons, success-run test planning
  - `meauto.js`: a Kalman filter by hand, camera projection, stereo depth, histogram localisation, the ideal turbojet, the rocket equation, nozzle exhaust velocity, Breguet range, LMTD sizing, economic insulation thickness, levelised cost, hot-water storage, Weibull wind resource
- **Outcomes.** There are 56, with 14 rubrics and 56 anchored lines.
- **Readings.** 56 units, 56 distinct links. All 57 pages, with benchmarks and gap references, returned 200 on 17 October 2026. One GitHub link was rate-limited (429) and returned 200 on retry.

## Verification

| Skill | Independent check |
|---|---|
| Weibull | reliability from the integrated hazard; the mean as the area under R(t); B10 by bisection |
| Miner's rule | each life bisected on the S–N curve |
| Paris's law | the growth law integrated numerically in √a |
| availability | a Markov chain's balance equations (the generator uses independence) |
| censored estimate | the likelihood maximised by golden-section search |
| interference | the load density times the strength's distribution, integrated |
| capital recovery | the amortisation schedule run and the payment bisected |
| IRR | Newton's method (the generator bisects) |
| unequal lives | both alternatives repeated over a common horizon and discounted |
| success run | binomial probabilities by recurrence (the generator uses log-gamma combinations) |
| Kalman filter | the whole trajectory solved at once by batch least squares |
| camera projection | rays intersected with the image plane in world coordinates |
| stereo | two rays triangulated by closest approach |
| histogram localisation | every start cell and motion sequence enumerated |
| turbojet | the engine marched station by station, isentropic states by bisection (the generator uses Mattingly's τ algebra) |
| rocket equation | the burn integrated in time |
| nozzle | exit temperature bisected on zero entropy change |
| Breguet range | fuel burn integrated in time |
| LMTD | both streams marched from the hot end until the hot outlet is reached |
| insulation | the derivative of cost bisected (the generator uses golden-section search) |
| levelised cost | every year's cost and energy discounted |
| storage | the tank's energy balance integrated |
| wind resource | the speed distribution integrated |

`mereli`: 400 agree. `meauto`: 520 agree, after one fix. Both used 40 questions per skill.

**One generator was fixed.** LMTD sizing could pick flows for which the water would have to leave hotter than the hot stream entered. Those questions had no answer, and their checks never finished. The generator now redraws until both ends of the exchanger keep at least 5 K of temperature difference.

A scan of 400 questions from each of the 151 ME skills (60,400 in all) then found no answer, question or explanation with NaN, Infinity or undefined in it.

## Still unverified

- **The outside graders were not run here.**
- **The judgement-based assessments rest on rubrics.** These are the ethics memo, the decision panel and the capstone defence; a machine cannot check them.
- **22.081J's costs are from 2010.** The course asks for current, dated figures.
