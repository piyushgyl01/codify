# Electrical Engineering, Term 2: audit and evidence

October 2026. This covers five courses:

- Linear Algebra and Differential Equations
- Circuit Analysis II
- Digital Logic and Hardware Description
- Electronics and Instrumentation Lab I
- Materials and Chemistry for Electronics

The method and standards are those in [ee-term0-audit.md](ee-term0-audit.md); the design is in [`js/degrees/curriculum/ee-term2.js`](../js/degrees/curriculum/ee-term2.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Linear Algebra and DEs | units pointed at 18.06SC and 18.03SC as wholes; three borrowed matrix questions | sessions by unit; 18.06SC Exam 1 and the 18.03SC final with solutions; linear-algebra and ODE practice |
| Circuit Analysis II | LTspice's page never answered; Robotics practice with no checks | *Lessons in Electric Circuits* Vol. II, 6.002 lectures and labs, 18.03SC on poles; CircuitJS for the checkpoint; new two-port, dependent-source and tolerance practice |
| Digital Logic | units pointed at 6.004 and nand2tetris as wholes; Robotics practice | 6.004 (2017) chapters, nand2tetris projects, Karnaugh maps, Verilator; HDLBits and nand2tetris auto-graders |
| Instrumentation Lab I | 6.101's readings are textbooks; ngspice and LTspice pages blocked | 6.101's labs, NIST's handbook and TN 1297, the Junior Lab noise guide, PyVISA, notebook rules; a reference measured against its spec |
| Materials and Chemistry | 6.012 is a device course with no bonding, crystals, electrochemistry or life cycle | 3.091SC topics, 6.012 lectures, 6.720J on contacts, the EU life-cycle platform; 3.091SC's final with a solution key; doping and junction practice |

- **New practice skills.** There are 5:
  - two-port networks, dependent sources and worst-case tolerance, added to `eecircuits.js`
  - doped-silicon resistivity and pn-junction depletion, in a new module, `eedevices.js`
- **Outcomes.** There are 36, with 20 rubrics and 80 anchored lines.
- **Readings.** 80 units, 79 distinct links. All returned 200 on 17 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| two-port | 1 A injected at a port (or 1 V with the load fitted), and the three node voltages solved |
| dependent source | modified nodal analysis: each element stamped into a matrix, solved by elimination |
| tolerance | the whole tolerance box searched on a grid that includes its edges |
| resistivity | the Fermi level solved for charge neutrality, then the carriers it implies |
| pn junction | Poisson's equation integrated across the junction, bisecting on the depletion edge |

The first four agree in 40 questions each; the junction agrees in 120.

**Two first-draft checks were wrong:**

- **The two-port's z₁₁ check was the formula again.** It is now a nodal solve.
- **The junction check put a grid cell across the junction.** When one side was very thin, its integral was off by 1%. The grid now has a node exactly at the junction, which makes the integration exact for the piecewise-linear field.

## Still unverified

- **The outside graders were not run here.**
- **6.002 posts no quiz solutions.** Its quizzes are checked in a simulator instead.
