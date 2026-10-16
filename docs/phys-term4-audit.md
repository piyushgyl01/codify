# Physics, Term 4: audit and evidence

October 2026. This covers seven courses:

- Advanced Experimental Physics I: Electronics and Optics
- Relativity and Gravitation
- Condensed Matter and AMO Foundations
- Research Methods, Scientific Communication, and Proposal
- Astrophysics: Stars, Galaxies, and the High-Energy Universe
- Quantum Information and AMO
- Nuclear Physics, Radiation, and Detectors

The method is the one in [phys-term0-audit.md](phys-term0-audit.md); the design is in [`js/degrees/curriculum/phys-term4.js`](../js/degrees/curriculum/phys-term4.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Electronics and Optics lab | the resource is 20.309, a bioengineering course whose textbook is not free; nothing on lock-in detection; Robotics practice | 20.309's lab modules and optics lectures kept; MIT 6.002 for amplifiers; the Junior Lab noise guide; Stanford Research Systems' lock-in note; Boltzmann's constant measured against its exact value |
| Relativity and Gravitation | 8.033 (2006) is mostly special relativity: no curvature, no Einstein equations | 8.033 slides for Units 1, 2, 4 and 7; Tong's *General Relativity* for Units 3, 5 and 6; 8.033 quizzes with solutions |
| Condensed Matter and AMO | 3.024 has no crystal structure and no atomic physics; its exams have no solutions | 3.024 for bands, semiconductors and magnetism; Tong's *Solid State Physics* for crystals and *Topics in Quantum Mechanics* for atoms |
| Research Methods | 22.THT posts assignments and sample prospectuses, no teaching notes | 22.THT's assignments and sample prospectus; the Turing Way; the Center for Open Science's preregistration guide; NIST on experimental design; Junior Lab ethics |
| Astrophysics | OpenStax *Astronomy 2e* is algebra-based | *Astronomy 2e* by section for six units; Pols's *Stellar Structure and Evolution* for stellar structure; 8.282J quizzes with solutions; a cluster distance checked against Gaia |
| Quantum Information and AMO | 8.370x's OCW page only points to edX | Preskill's Caltech notes, de Wolf's lecture notes and the Junior Lab NMR guide; teleportation on real hardware against a noise model |
| Nuclear Physics | 22.01 assigns a textbook that is not free | MIT 22.02 notes, the Particle Data Group's reviews, Junior Lab Compton and Poisson guides; 22.01 problem sets and quizzes with solutions |

- **New practice skills.** There are 23 in `physfront.js`:
  - instruments: op-amp bandwidth, kT/C noise, aliasing, the diffraction limit
  - relativity: satellite clocks, perihelion precession, light bending, black-hole radii
  - condensed matter and atoms: X-ray diffraction, effective mass, intrinsic carriers, Debye heat capacity, the Landé g-factor
  - quantum information: single-qubit circuits, CHSH, entanglement entropy, noisy channels
  - nuclear: decay chains, shielding, Compton edges, alpha-decay energies
  - astrophysics: the distance modulus, binary-star masses
- **Outcomes.** There are 49, with 14 rubrics and 56 anchored lines.
- **Readings.** All 55 unit links returned 200 on 17 October 2026, as did the gap and benchmark links.

## Verification

| Skill | Independent check |
|---|---|
| op-amp bandwidth | the closed-loop transfer function swept and bisected for −3 dB |
| kT/C noise | the resistor's noise spectrum integrated through the RC filter |
| aliasing | a DFT of the sampled tone |
| diffraction limit | the first zero of J₁ found from Bessel's integral |
| satellite clocks | the exact Schwarzschild rates |
| precession, light bending | the orbit and the light ray integrated (RK4) |
| black-hole radii | effective potentials maximised, or their curvature bisected |
| diffraction | structure factors summed over the basis |
| effective mass | a 2000-site chain diagonalised by Sturm bisection |
| intrinsic carriers | Fermi–Dirac integrals solved for charge neutrality |
| Debye heat capacity | phonon modes counted on a lattice inside the Debye sphere |
| Landé g | J² projected in the product basis of L and S |
| circuits, CHSH | state vectors and operators multiplied out |
| entanglement entropy | Schmidt coefficients by power iteration |
| channels | Kraus maps averaged over the Bloch sphere |
| decay chains | the rate equations integrated |
| shielding | the beam attenuated layer by layer |
| Compton edge, alpha decay | the kinematics solved exactly (relativistically) |
| distance modulus | flux ratios with the inverse-square law |
| binary masses | the orbit simulated and its period matched |

`physfront`: 920 agree, 0 disagree (40 questions per skill).

**One borrowed skill was dropped.** The Robotics multimeter skill has no independent check, so the calibration outcome uses error propagation and least-squares fitting instead.

## Still unverified

- **The outside graders were not run here.**
- **Two benchmarks have no published solutions:** 3.024's exams and de Wolf's exercises (which have hints only). Their instructions say to count an answer right only when an independent calculation or simulation agrees.
- **osf.io returned 503** on 16 and 17 October 2026. Earlier terms still link to it; this term links to the Center for Open Science instead.
