# Electrical Engineering, Term 0: audit and evidence

October 2026. This covers five courses:

- Calculus I: Models and Change
- Physics I: Mechanics and Waves
- Programming for Engineers
- Electrical Engineering Studio I
- Writing and Argument for Engineers

## How EE courses differ

Each EE course has sixteen units and four assessments:

- a checkpoint exam
- a timed practical
- a live demonstration
- a final defence

So each audited course has four rubrics, one per stage, and a reading for every unit, including the checkpoint units. For those units the reading is the practice exam or tool.

Outcomes map to two standards:

- **ABET's seven student outcomes** (Criterion 3, 2025–26), coded "ABET n".
- **The NCEES FE Electrical and Computer exam specification** (2020), coded "FE-ECE n.X", for example FE-ECE 6.C for Thévenin and Norton equivalents.

The design is in [`js/degrees/curriculum/ee-term0.js`](../js/degrees/curriculum/ee-term0.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Calculus I | every unit pointed at the whole of 18.01SC; one borrowed derivative question | 18.01SC session by unit; practice across limits, derivatives, approximation, optimisation, integrals and ODEs; 18.01SC Exam 1 and final with solutions |
| Physics I | 8.01SC stops before oscillations and waves; Robotics-track practice with no checks | 8.01SC lessons by unit, 8.03SC for oscillations, waves and modes; Physics-degree mechanics practice; 8.012 exams with solutions |
| Programming for Engineers | every unit pointed at 6.100L as a whole | 6.100L lectures by topic; the Turing Way for testing, version control, environments and code review |
| EE Studio I | the catalogued textbook site blocks link checks; Robotics practice mostly unchecked | the same textbook (*Lessons in Electric Circuits*) at its author's ibiblio mirror, chapter by chapter; new circuit and logic practice; nand2tetris Project 1 |
| Writing and Argument | every unit pointed at the whole Writing Guide; the IEEE page cannot be checked | Writing Guide section by unit; IPCC guidance on uncertainty |

- **New practice skills.** There are 12, in two new modules:
  - `eecircuits.js`: series–parallel networks, nodal analysis, Thévenin equivalents, RL transients, AC phasors, real power and power factor, power-factor correction, first-order filters, second-order overshoot, maximum power transfer
  - `eedigital.js`: minimal sum-of-products, sequence detectors
- **Outcomes.** There are 38, with 20 rubrics and 80 anchored lines.
- **Readings.** 80 units, 79 distinct links. All returned 200 on 17 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| series–parallel | the network turned into a netlist and solved by nodal analysis |
| nodal analysis | Gauss–Seidel relaxation |
| Thévenin | open-circuit voltage over short-circuit current |
| RL transient, overshoot | the circuit integrated in time (RK4) |
| phasors, filters | the circuit driven by a sine in the time domain, then the steady amplitude read |
| real power, power factor | v·i averaged over whole cycles of a simulation |
| power-factor correction | complex admittances, bisecting on C |
| maximum power | golden-section search over the load |
| minimal SOP | dynamic programming over every implicant, not Quine–McCluskey's primes |
| sequence detector | a KMP automaton, not a sliding window |

`eecircuits`: 400 agree, 0 disagree. `eedigital`: 80 agree, 0 disagree. Both used 40 questions per skill.

## Still unverified

- **The outside graders were not run here.**
- **The writing course has no outside exam.** Its benchmark is an outside reader restating the memo's claim.
