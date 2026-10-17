# Electrical Engineering, Term 5: audit and evidence

October 2026. This covers the final eight courses of the Electrical Engineering degree:

- Energy, Power Electronics, and Power Systems
- Integrated Systems Verification Lab
- Engineering Leadership and Deployment
- Senior Design II: Build and Defend
- Computer Architecture and Accelerator Design
- Wireless Systems and Information Theory
- Robot Kinematics, Planning and Control
- Smart Grids and Protection

The method and standards are those in [ee-term0-audit.md](ee-term0-audit.md); the design is in [`js/degrees/curriculum/ee-term5.js`](../js/degrees/curriculum/ee-term5.js).

With this term, all 37 EE courses are audited, and all 592 units have a reading.

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Energy and Power Systems | units pointed at 6.622 and 6.061 as wholes; OpenModelica and LTspice never answered; Robotics practice | 6.622 notes and 6.061 chapters by topic, MacKay on storage, pandapower; three-phase, fault, power-flow, relay and droop practice |
| Systems Verification Lab | nothing on reliability testing or verification closure | KiCad's schematic and PCB manuals, 6.111 and 6.101, 16.842 and 16.63J, NIST on reliability; confidence-bound practice |
| Leadership and Deployment | no resource for business models, operations, security or incidents | OpenStax *Entrepreneurship* by section, NIST CSF 2.0, WCAG 2.2, Google's SRE incidents chapter, EU life-cycle platform; break-even practice |
| Senior Design II | no build-and-release process | NASA SE Handbook, 16.842, 16.63J, W3C on involving users, the Turing Way |
| Architecture and Accelerators | no profiling or reproduction material | 6.004 chapters, both RISC-V specs, Brendan Gregg's perf guide, the Roofline paper, ReScience C |
| Wireless and Information Theory | 6.02 lacks synchronisation and fading; GNU Radio's wiki blocks checks | 6.02 chapters plus the free PySDR textbook; Huffman, capacity and fading practice |
| Robot Kinematics and Planning | no kinematics or planning text; Robotics practice with no checks | Lynch and Park's *Modern Robotics* and LaValle's *Planning Algorithms* by chapter, ROS 2 and Nav2; inverse-kinematics, path-planning and drive practice; the Modern Robotics library as an outside grader |
| Smart Grids and Protection | resources stop before contingencies, protection, dispatch and security | pandapower's guides, NERC TPL-001, MATPOWER, NIST SP 800-82, the National Academies on resilience, 15.031J; a reference test case as the benchmark |

- **New practice skills.** There are 14, in two new modules:
  - `eegrid.js`: three-phase power, fault current, DC power flow, buck-boost, relay coordination, frequency droop, MTBF confidence bounds, break-even volume
  - `eeauto.js`: Huffman coding, BSC capacity, Rayleigh fading, two-link inverse kinematics, grid path planning, differential-drive motion
- **Outcomes.** There are 56, with 32 rubrics and 128 anchored lines.
- **Readings.** 128 units, 105 distinct links. All returned 200 on 17 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| three-phase power | instantaneous phase powers summed over a cycle |
| fault current | the network in ohms instead of per unit |
| DC power flow | bus angles relaxed by Gauss–Seidel |
| buck-boost | duty bisected for volt-second balance |
| relay coordination | the time multiplier bisected |
| droop | inertia and governors simulated to steady state |
| MTBF bound | χ² quantile by integrating the density, against the generator's Poisson search |
| break-even | profit stepped one unit at a time |
| Huffman | every set of codeword lengths satisfying Kraft tried |
| BSC capacity | mutual information maximised over the input distribution |
| Rayleigh BER | the AWGN error rate integrated over the fade (substituted to be smooth at zero) |
| inverse kinematics | joint space searched, then refined with Newton steps |
| grid planning | Bellman–Ford instead of breadth-first search |
| differential drive | the kinematics integrated with RK4 |

`eegrid`: 320 agree. `eeauto`: 240 agree. Both used 40 questions per skill.

**One generator was fixed.** Inverse kinematics reported θ₁ = −225° where the check found the same pose at 135°. The generator now wraps angles into (−180°, 180°].

## Still unverified

- **The outside graders were not run here.**
- **6.02's quiz solutions are not clearly posted.** Its benchmark asks for each answer to be confirmed by calculation or simulation.
